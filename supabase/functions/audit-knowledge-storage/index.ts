import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type StorageFile = {
  path: string;
  name: string;
  updated_at?: string;
  created_at?: string;
  size?: number | null;
  mimetype?: string | null;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result.map((s) => s.trim());
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = values[idx]));
    rows.push(row);
  }

  return { headers, rows };
}

async function listAllFiles(opts: {
  // Using `any` here avoids Deno type-check mismatch between supabase-js generics in edge runtime.
  supabase: any;
  bucket: string;
  maxFiles: number;
}) {
  const { supabase, bucket, maxFiles } = opts;

  const files: StorageFile[] = [];
  const foldersToScan: string[] = [""]; // "" means root

  while (foldersToScan.length > 0 && files.length < maxFiles) {
    const prefix = foldersToScan.shift()!;

    let offset = 0;
    const limit = 1000;

    while (files.length < maxFiles) {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) throw new Error(`Storage list error (${bucket}/${prefix}): ${error.message}`);
      if (!data || data.length === 0) break;

      for (const item of data as any[]) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

        // Convention: folders return with id=null in list() results.
        if (!item.id) {
          foldersToScan.push(fullPath);
          continue;
        }

        files.push({
          path: fullPath,
          name: item.name,
          created_at: item.created_at,
          updated_at: item.updated_at,
          size: item.metadata?.size ?? null,
          mimetype: item.metadata?.mimetype ?? null,
        });

        if (files.length >= maxFiles) break;
      }

      if (data.length < limit) break;
      offset += limit;
    }
  }

  return files;
}

function computeMatches(files: StorageFile[], searchTerms: string[]) {
  const matches: Record<string, string[]> = {};
  const normalizedTerms = (searchTerms || [])
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.toLowerCase());

  for (const t of normalizedTerms) matches[t] = [];

  for (const f of files) {
    const p = f.path.toLowerCase();
    for (const term of normalizedTerms) {
      if (p.includes(term)) matches[term].push(f.path);
    }
  }

  return matches;
}

function pickQuestionAnswerKeys(headers: string[]) {
  const lower = headers.map((h) => h.toLowerCase());

  const qCandidates = ["question", "q", "syndrome", "syndrome_name", "name", "title"];
  const aCandidates = ["answer", "a", "description", "content", "details"];

  const qIdx = lower.findIndex((h) => qCandidates.includes(h));
  const aIdx = lower.findIndex((h) => aCandidates.includes(h));

  return {
    qKey: qIdx >= 0 ? headers[qIdx] : null,
    aKey: aIdx >= 0 ? headers[aIdx] : null,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData?.user) return json({ error: "Unauthorized" }, 401);

    // Hard admin gate
    const { data: isAdmin, error: roleError } = await admin.rpc("has_role", {
      _user_id: authData.user.id,
      _role: "admin",
    });

    if (roleError || isAdmin !== true) {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action: "scan" | "resync" = body.action || "scan";
    const bucket: string = body.bucket || "knowledge-assets";
    const searchTerms: string[] = Array.isArray(body.searchTerms)
      ? body.searchTerms
      : ["zang", "bazi", "fu", "master"];
    const maxFiles: number = Number.isFinite(body.maxFiles) ? body.maxFiles : 5000;

    console.log(`[audit-knowledge-storage] action=${action} bucket=${bucket} maxFiles=${maxFiles}`);

    // 1) SCAN: raw storage only (no DB access)
    const files = await listAllFiles({ supabase: admin, bucket, maxFiles });
    const matches = computeMatches(files, searchTerms);

    if (action === "scan") {
      return json({
        bucket,
        total: files.length,
        files,
        matches,
        searched: searchTerms,
      });
    }

    // 2) RESYNC: will compare against DB and (re)index CSVs.
    const requestedFiles: string[] = Array.isArray(body.files) ? body.files : [];
    const filesToResync = (requestedFiles.length > 0
      ? requestedFiles
      : Object.values(matches).flat()
    ).filter(Boolean);

    const uniqueFilesToResync = Array.from(new Set(filesToResync)).slice(0, 50); // safety cap

    const results: Array<{
      path: string;
      restored: boolean;
      skipped?: boolean;
      reason?: string;
      documentId?: string;
    }> = [];

    for (const path of uniqueFilesToResync) {
      try {
        const baseName = path.split("/").pop() || path;

        if (!/\.csv$/i.test(baseName)) {
          results.push({ path, restored: false, skipped: true, reason: "Only CSV resync is supported" });
          continue;
        }

        // Check if already indexed by file_name or original_name
        const { data: existing, error: existErr } = await admin
          .from("knowledge_documents")
          .select("id")
          .or(`file_name.eq.${baseName},original_name.eq.${baseName}`)
          .limit(1);

        if (existErr) throw new Error(existErr.message);
        if (existing && existing.length > 0) {
          results.push({ path, restored: false, skipped: true, reason: "Already present in index", documentId: existing[0].id });
          continue;
        }

        const { data: blob, error: dlErr } = await admin.storage.from(bucket).download(path);
        if (dlErr || !blob) throw new Error(dlErr?.message || "Download failed");

        const csvText = await (blob as any).text();
        const fileHash = await hashContent(csvText);
        const parsed = parseCSV(csvText);

        // Insert document
        const { data: insertedDoc, error: docErr } = await admin
          .from("knowledge_documents")
          .insert({
            file_hash: fileHash,
            file_name: baseName,
            original_name: baseName,
            file_size: null,
            row_count: parsed.rows.length,
            category: null,
            language: "en",
            status: "indexing",
            uploaded_by: authData.user.id,
          })
          .select("id")
          .single();

        if (docErr) throw new Error(docErr.message);

        const documentId = insertedDoc.id as string;
        const { qKey, aKey } = pickQuestionAnswerKeys(parsed.headers);

        const chunks = parsed.rows.map((row, idx) => {
          const question = qKey ? row[qKey] : null;
          const answer = aKey ? row[aKey] : null;

          const content = question && answer
            ? `Q: ${question}\nA: ${answer}`
            : Object.values(row)
                .filter(Boolean)
                .join(" | ");

          return {
            document_id: documentId,
            chunk_index: idx,
            content,
            question: question || null,
            answer: answer || null,
            content_type: question && answer ? "qa" : "row",
            language: "en",
            metadata: {
              restored_from_storage: true,
              storage_bucket: bucket,
              storage_path: path,
            },
          };
        });

        const CHUNK_BATCH = 200;
        for (let i = 0; i < chunks.length; i += CHUNK_BATCH) {
          const batch = chunks.slice(i, i + CHUNK_BATCH);
          const { error: chunkErr } = await admin.from("knowledge_chunks").insert(batch);
          if (chunkErr) throw new Error(chunkErr.message);
        }

        const { error: updErr } = await admin
          .from("knowledge_documents")
          .update({ status: "indexed", indexed_at: new Date().toISOString() })
          .eq("id", documentId);

        if (updErr) throw new Error(updErr.message);

        // Trigger embeddings
        await admin.functions.invoke("generate-embeddings", {
          body: { documentId },
        });

        results.push({ path, restored: true, documentId });
      } catch (e) {
        results.push({
          path,
          restored: false,
          skipped: false,
          reason: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return json({
      bucket,
      total: files.length,
      searched: searchTerms,
      matches,
      resync: {
        attempted: uniqueFilesToResync.length,
        results,
      },
    });
  } catch (e) {
    console.error("[audit-knowledge-storage] fatal", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
