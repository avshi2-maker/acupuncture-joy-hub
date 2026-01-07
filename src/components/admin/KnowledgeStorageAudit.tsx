import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, RefreshCw, Search } from "lucide-react";

type StorageAuditFile = {
  path: string;
  name: string;
  updated_at?: string;
  created_at?: string;
  size?: number | null;
  mimetype?: string | null;
};

type AuditResponse = {
  bucket: string;
  total: number;
  searched: string[];
  files: StorageAuditFile[];
  matches: Record<string, string[]>;
  resync?: {
    attempted: number;
    results: Array<{ path: string; restored: boolean; skipped?: boolean; reason?: string; documentId?: string }>;
  };
};

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const str = String(cell ?? "");
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function KnowledgeStorageAudit() {
  const [bucket, setBucket] = useState("knowledge-assets");
  const [terms, setTerms] = useState("zang,bazi,fu,master");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);

  const termList = useMemo(
    () => terms.split(",").map((t) => t.trim()).filter(Boolean),
    [terms]
  );

  const matchedPaths = useMemo(() => {
    if (!result?.matches) return [];
    return Array.from(new Set(Object.values(result.matches).flat())).sort();
  }, [result]);

  const scan = async () => {
    setIsLoading(true);
    try {
      toast.info("Scanning raw storage bucket...");
      const { data, error } = await supabase.functions.invoke("audit-knowledge-storage", {
        body: {
          action: "scan",
          bucket,
          searchTerms: termList,
          maxFiles: 5000,
        },
      });
      if (error) throw error;
      setResult(data as AuditResponse);
      toast.success(`Storage scan complete: ${(data as AuditResponse).total} files`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Storage scan failed");
    } finally {
      setIsLoading(false);
    }
  };

  const restoreMatching = async () => {
    if (matchedPaths.length === 0) {
      toast.error("No matching files found to restore");
      return;
    }

    setIsLoading(true);
    try {
      toast.info("Restoring matching files into the index...");
      const { data, error } = await supabase.functions.invoke("audit-knowledge-storage", {
        body: {
          action: "resync",
          bucket,
          searchTerms: termList,
          files: matchedPaths,
        },
      });
      if (error) throw error;
      setResult(data as AuditResponse);

      const restored = (data as AuditResponse).resync?.results?.filter((r) => r.restored).length || 0;
      toast.success(`Resync finished: restored ${restored} file(s)`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Resync failed");
    } finally {
      setIsLoading(false);
    }
  };

  const exportFileList = () => {
    if (!result?.files?.length) {
      toast.error("Nothing to export yet — run Scan first");
      return;
    }

    downloadCSV(
      `knowledge-storage-${bucket}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`,
      [
        ["path", "name", "mimetype", "size", "updated_at"],
        ...result.files.map((f) => [
          f.path,
          f.name,
          f.mimetype || "",
          String(f.size ?? ""),
          f.updated_at || "",
        ]),
      ]
    );
  };

  const exportMatchReport = () => {
    if (!result) {
      toast.error("Nothing to export yet — run Scan first");
      return;
    }

    const rows: string[][] = [["term", "match_count", "matches"]];
    for (const [term, matches] of Object.entries(result.matches || {})) {
      rows.push([term, String(matches.length), matches.join(" | ")]);
    }

    downloadCSV(
      `knowledge-storage-matches-${bucket}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`,
      rows
    );
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Raw Storage Audit (Recovery)
        </CardTitle>
        <CardDescription>
          Scans the physical storage bucket and searches filenames for critical recovery terms; optionally restores matching CSVs back into the index.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Bucket</div>
            <Input value={bucket} onChange={(e) => setBucket(e.target.value)} placeholder="knowledge-assets" />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Search terms (comma-separated)</div>
            <Input value={terms} onChange={(e) => setTerms(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={scan} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={isLoading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
            Scan Storage
          </Button>

          <Button onClick={restoreMatching} disabled={isLoading || matchedPaths.length === 0} variant="outline">
            Restore & Index Matches ({matchedPaths.length})
          </Button>

          <Button onClick={exportFileList} disabled={!result?.files?.length} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export File List (CSV)
          </Button>

          <Button onClick={exportMatchReport} disabled={!result} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Match Report (CSV)
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">Bucket: {result.bucket}</Badge>
              <Badge variant="secondary">Files: {result.total}</Badge>
              <Badge variant={matchedPaths.length > 0 ? "default" : "outline"}>Matches: {matchedPaths.length}</Badge>
            </div>

            {result.resync && (
              <div className="rounded-md border p-3 text-sm space-y-1">
                <div className="font-medium">Resync results</div>
                <div>Attempted: {result.resync.attempted}</div>
                <div>
                  Restored: {result.resync.results.filter((r) => r.restored).length} • Skipped: {result.resync.results.filter((r) => r.skipped).length} • Failed: {result.resync.results.filter((r) => !r.restored && !r.skipped).length}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
