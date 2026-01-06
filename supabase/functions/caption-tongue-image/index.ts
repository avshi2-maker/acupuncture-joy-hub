import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { imageUrl, chunkId, batchMode } = await req.json();

    // If batch mode, process all uncaptioned images
    if (batchMode) {
      const { data: chunks, error: fetchError } = await supabase
        .from("knowledge_chunks")
        .select("id, image_url, image_ref")
        .not("image_url", "is", null)
        .is("image_caption", null)
        .limit(10);

      if (fetchError) throw fetchError;

      if (!chunks || chunks.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No images to caption", processed: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let processed = 0;
      const results = [];

      for (const chunk of chunks) {
        try {
          const caption = await generateCaption(chunk.image_url, LOVABLE_API_KEY);
          
          const { error: updateError } = await supabase
            .from("knowledge_chunks")
            .update({ image_caption: caption })
            .eq("id", chunk.id);

          if (updateError) {
            console.error(`Error updating chunk ${chunk.id}:`, updateError);
            results.push({ id: chunk.id, success: false, error: updateError.message });
          } else {
            processed++;
            results.push({ id: chunk.id, success: true, caption });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Error processing chunk ${chunk.id}:`, err);
          results.push({ id: chunk.id, success: false, error: errorMessage });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          processed, 
          total: chunks.length,
          results 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single image mode
    if (!imageUrl || !chunkId) {
      throw new Error("imageUrl and chunkId are required for single image mode");
    }

    const caption = await generateCaption(imageUrl, LOVABLE_API_KEY);

    const { error: updateError } = await supabase
      .from("knowledge_chunks")
      .update({ image_caption: caption })
      .eq("id", chunkId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, caption }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error("Error in caption-tongue-image:", err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateCaption(imageUrl: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are an expert Traditional Chinese Medicine (TCM) practitioner specializing in tongue diagnosis. 
Analyze the tongue image and provide a concise clinical description including:
1. Body color (pale, red, purple, etc.)
2. Coating (thin, thick, yellow, white, greasy, etc.)
3. Shape (swollen, thin, teeth marks, etc.)
4. Any notable features (cracks, spots, trembling)
5. Likely TCM pattern indication

Keep the response under 100 words, clinical and professional. Respond in English.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this tongue image and provide a TCM diagnosis description."
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 200
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Unable to generate caption";
}
