import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Question {
  id: string;
  question: string;
  type: 'open' | 'yesno' | 'scale' | 'multi';
}

interface RequestBody {
  transcript: string;
  moduleId: number;
  questions: Question[];
  language: 'en' | 'he';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, moduleId, questions, language }: RequestBody = await req.json();

    if (!transcript || !questions || questions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing transcript or questions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Build the prompt for GPT to analyze the transcript and fill questions
    const questionList = questions.map((q, i) => {
      let typeHint = '';
      switch (q.type) {
        case 'yesno': typeHint = '(answer: "yes" or "no")'; break;
        case 'scale': typeHint = '(answer: number 1-10)'; break;
        case 'multi': typeHint = '(answer: array of selected options)'; break;
        case 'open': typeHint = '(answer: free text)'; break;
      }
      return `${i + 1}. [${q.id}] ${q.question} ${typeHint}`;
    }).join('\n');

    const systemPrompt = language === 'he' 
      ? `אתה עוזר רפואי מומחה לרפואה סינית מסורתית (TCM). 
נתון לך תמליל דיבור של מטופל שמתאר את התסמינים שלו.
נתח את התמליל ומלא את השאלות הבאות בהתבסס על מה שאמר המטופל.
החזר JSON עם מפתחות שהם ה-ID של השאלות וערכים שהם התשובות.
רק מלא שאלות שיש להן מידע ברור בתמליל. אל תנחש.`
      : `You are a medical assistant specializing in Traditional Chinese Medicine (TCM).
You are given a speech transcript from a patient describing their symptoms.
Analyze the transcript and fill in the following questions based on what the patient said.
Return JSON with keys being the question IDs and values being the answers.
Only fill questions that have clear information in the transcript. Do not guess.`;

    const userPrompt = `
Transcript: "${transcript}"

Questions to fill:
${questionList}

Return ONLY valid JSON like: {"q1": "answer1", "q2": "yes", "q3": 7}
Only include questions you can confidently answer from the transcript.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const answers = JSON.parse(content);

    console.log(`Auto-filled ${Object.keys(answers).length} questions from transcript`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        answers,
        questionsFilledCount: Object.keys(answers).length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Voice autofill error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
