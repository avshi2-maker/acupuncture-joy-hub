import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ClinicalTrials.gov API v2 base URL
const CT_API_BASE = 'https://clinicaltrials.gov/api/v2/studies';

// TCM/Acupuncture search terms for focused results
const TCM_SEARCH_TERMS = [
  'acupuncture',
  'traditional chinese medicine',
  'moxibustion',
  'electroacupuncture',
  'auricular acupuncture',
  'acupressure',
  'chinese herbal medicine',
  'cupping therapy',
  'tui na',
  'qi gong'
];

interface CTStudy {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle: string;
      officialTitle?: string;
    };
    statusModule: {
      overallStatus: string;
      startDateStruct?: { date: string };
      completionDateStruct?: { date: string };
    };
    descriptionModule?: {
      briefSummary?: string;
    };
    designModule?: {
      phases?: string[];
      enrollmentInfo?: { count: number };
    };
    conditionsModule?: {
      conditions?: string[];
      keywords?: string[];
    };
    armsInterventionsModule?: {
      interventions?: Array<{
        type: string;
        name: string;
        description?: string;
      }>;
    };
    outcomesModule?: {
      primaryOutcomes?: Array<{
        measure: string;
        description?: string;
      }>;
    };
  };
}

function extractAcupoints(text: string): string[] {
  if (!text) return [];
  
  // Match common acupoint formats: ST36, BL23, LI4, GV20, etc.
  const pointPattern = /\b(ST|SP|LU|LI|HT|SI|BL|KI|PC|TE|GB|LR|GV|CV|EX)[- ]?(\d{1,2})/gi;
  const matches = text.match(pointPattern) || [];
  
  return [...new Set(matches.map(m => m.toUpperCase().replace(/\s+/g, '')))];
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    // Handle formats like "2024-01-15" or "January 2024"
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      searchTerms = ['acupuncture'], 
      condition,
      maxResults = 20,
      status = 'COMPLETED'
    } = await req.json();

    console.log(`Fetching clinical trials for: ${searchTerms.join(', ')}`);
    
    // Build search query
    const searchQuery = searchTerms.join(' OR ');
    const conditionFilter = condition ? `&query.cond=${encodeURIComponent(condition)}` : '';
    const statusFilter = status ? `&filter.overallStatus=${status}` : '';
    
    const apiUrl = `${CT_API_BASE}?query.term=${encodeURIComponent(searchQuery)}${conditionFilter}${statusFilter}&pageSize=${maxResults}&format=json`;
    
    console.log('Fetching from:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ClinicalTrials.gov API error:', response.status, errorText);
      throw new Error(`ClinicalTrials.gov API error: ${response.status}`);
    }

    const data = await response.json();
    const studies: CTStudy[] = data.studies || [];
    
    console.log(`Found ${studies.length} studies from ClinicalTrials.gov`);

    const results = {
      fetched: 0,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const study of studies) {
      try {
        results.fetched++;
        const protocol = study.protocolSection;
        const nctId = protocol.identificationModule.nctId;

        // Check if already exists
        const { data: existing } = await supabase
          .from('clinical_trials')
          .select('id')
          .eq('nct_id', nctId)
          .maybeSingle();

        if (existing) {
          console.log(`Skipping existing study: ${nctId}`);
          results.skipped++;
          continue;
        }

        // Extract conditions
        const conditions = protocol.conditionsModule?.conditions || [];
        const primaryCondition = conditions[0] || 'Unspecified';

        // Extract interventions and acupoints
        const interventions = protocol.armsInterventionsModule?.interventions || [];
        const interventionTexts = interventions.map(i => `${i.name}: ${i.description || ''}`);
        const allText = interventionTexts.join(' ') + ' ' + (protocol.descriptionModule?.briefSummary || '');
        const acupoints = extractAcupoints(allText);

        // Extract primary outcome
        const primaryOutcome = protocol.outcomesModule?.primaryOutcomes?.[0]?.measure;

        const trialData = {
          nct_id: nctId,
          title: protocol.identificationModule.briefTitle || protocol.identificationModule.officialTitle,
          condition: primaryCondition,
          condition_mesh_terms: conditions.length > 1 ? conditions : null,
          intervention: interventionTexts.join('; ') || null,
          points_used: acupoints.length > 0 ? acupoints : null,
          study_status: protocol.statusModule.overallStatus.toLowerCase(),
          phase: protocol.designModule?.phases?.join(', ') || null,
          enrollment: protocol.designModule?.enrollmentInfo?.count || null,
          start_date: formatDate(protocol.statusModule.startDateStruct?.date),
          completion_date: formatDate(protocol.statusModule.completionDateStruct?.date),
          primary_outcome: primaryOutcome || null,
          results_summary: protocol.descriptionModule?.briefSummary?.substring(0, 1000) || null,
          source_url: `https://clinicaltrials.gov/study/${nctId}`,
          data_source: 'clinicaltrials.gov',
          sapir_verified: false,
          license: 'public_domain'
        };

        // Insert the trial
        const { data: insertedTrial, error: insertError } = await supabase
          .from('clinical_trials')
          .insert(trialData)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Also create knowledge chunk for RAG
        if (insertedTrial) {
          // Get or create document for clinical trials
          let docId: string;
          const { data: existingDoc } = await supabase
            .from('knowledge_documents')
            .select('id')
            .eq('file_name', 'clinical_trials_database')
            .maybeSingle();
          
          if (existingDoc) {
            docId = existingDoc.id;
          } else {
            const { data: newDoc } = await supabase
              .from('knowledge_documents')
              .insert({
                file_name: 'clinical_trials_database',
                original_name: 'Clinical Trials Database',
                file_hash: 'clinical_trials_live_db',
                status: 'indexed',
                category: 'clinical_trials',
                indexed_at: new Date().toISOString()
              })
              .select()
              .single();
            docId = newDoc?.id;
          }

          if (docId) {
            const { count } = await supabase
              .from('knowledge_chunks')
              .select('*', { count: 'exact', head: true })
              .eq('document_id', docId);

            const chunkContent = `Clinical Trial ${nctId}: ${trialData.title}
Condition: ${trialData.condition}
Intervention: ${trialData.intervention || 'Not specified'}
Acupoints: ${trialData.points_used?.join(', ') || 'Not specified'}
Phase: ${trialData.phase || 'N/A'} | Enrollment: ${trialData.enrollment || 'N/A'}
Status: ${trialData.study_status}
Primary Outcome: ${trialData.primary_outcome || 'Not specified'}
Summary: ${trialData.results_summary || 'No summary available'}`;

            await supabase
              .from('knowledge_chunks')
              .insert({
                document_id: docId,
                chunk_index: (count || 0) + 1,
                content: chunkContent,
                content_type: 'clinical_trial',
                question: `What clinical research exists for ${trialData.condition}?`,
                answer: chunkContent,
                metadata: {
                  trial_id: insertedTrial.id,
                  nct_id: nctId,
                  condition: trialData.condition,
                  data_source: 'clinicaltrials.gov'
                }
              });
          }
        }

        results.imported++;
        console.log(`Imported: ${nctId} - ${(trialData.title || 'Untitled').substring(0, 50)}...`);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Error processing study:', errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log('Fetch complete:', results);

    return new Response(JSON.stringify({
      success: true,
      message: `Fetched ${results.fetched} studies, imported ${results.imported}, skipped ${results.skipped} duplicates`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
