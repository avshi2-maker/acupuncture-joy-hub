import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Voice-to-Text Edge Function with optional direct RAG integration
 * 
 * Options:
 * - audio: Base64 encoded audio data
 * - language: 'he' | 'en' | 'auto' (default: 'he')
 * - processRag: boolean - If true, sends transcription directly to tcm-rag-chat (default: false)
 * - ragOptions: { ageGroup?: string, patientId?: string } - Options for RAG processing
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { audio, language = 'he', processRag = false, ragOptions = {} } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    console.log("Audio binary size:", binaryAudio.length, "bytes");
    console.log("Language setting:", language);
    console.log("Process through RAG:", processRag);
    
    // Prepare form data for OpenAI Whisper API
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    
    // Set language - 'auto' means Whisper auto-detects
    if (language !== 'auto') {
      formData.append('language', language);
    }

    console.log(`Calling OpenAI Whisper API for transcription (language: ${language})...`);
    
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transcription error:", response.status, errorText);
      throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const transcribedText = result.text;
    console.log("Transcribed text:", transcribedText.substring(0, 100) + "...");

    // If processRag is true, send transcription directly to RAG
    if (processRag && transcribedText) {
      console.log("Processing transcription through RAG...");
      
      const ragPayload = {
        query: transcribedText,
        messages: [],
        ageGroup: ragOptions.ageGroup || 'adults_18_50',
        patientId: ragOptions.patientId,
        source: 'voice'
      };

      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      
      // Call tcm-rag-chat function
      const ragResponse = await fetch(`${supabaseUrl}/functions/v1/tcm-rag-chat`, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "apikey": supabaseKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ragPayload),
      });

      if (!ragResponse.ok) {
        const ragError = await ragResponse.text();
        console.error("RAG processing error:", ragResponse.status, ragError);
        // Return transcription even if RAG fails
        return new Response(
          JSON.stringify({ 
            text: transcribedText, 
            ragError: `RAG processing failed: ${ragResponse.status}`,
            language: language === 'auto' ? 'detected' : language
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Stream RAG response
      console.log("RAG processing successful, streaming response...");
      return new Response(ragResponse.body, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'X-Transcribed-Text': encodeURIComponent(transcribedText),
          'X-Voice-Language': language === 'auto' ? 'detected' : language
        },
      });
    }

    // Return just the transcription
    return new Response(
      JSON.stringify({ 
        text: transcribedText,
        language: language === 'auto' ? 'detected' : language
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Voice-to-text error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
