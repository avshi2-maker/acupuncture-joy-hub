import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ICD-11 mapping for common TCM/acupuncture conditions
const ICD11_MAPPINGS: Record<string, { code: string; description: string }> = {
  // Pain conditions
  'chronic low back pain': { code: 'ME84.2', description: 'Low back pain - chronic' },
  'low back pain': { code: 'ME84.2', description: 'Low back pain' },
  'back pain': { code: 'ME84', description: 'Back pain' },
  'neck pain': { code: 'ME84.0', description: 'Neck pain' },
  'cervical pain': { code: 'ME84.0', description: 'Cervical pain' },
  'shoulder pain': { code: 'ME82.0', description: 'Shoulder pain' },
  'knee pain': { code: 'ME82.Y', description: 'Knee pain' },
  'knee osteoarthritis': { code: 'FA00.0', description: 'Osteoarthritis of knee' },
  'osteoarthritis': { code: 'FA00', description: 'Osteoarthritis' },
  'fibromyalgia': { code: 'MG30.01', description: 'Fibromyalgia syndrome' },
  'chronic pain': { code: 'MG30.0', description: 'Chronic primary pain' },
  
  // Headache conditions
  'migraine': { code: '8A80.0', description: 'Migraine without aura' },
  'migraine with aura': { code: '8A80.1', description: 'Migraine with aura' },
  'chronic migraine': { code: '8A80.2', description: 'Chronic migraine' },
  'tension headache': { code: '8A81', description: 'Tension-type headache' },
  'tension-type headache': { code: '8A81', description: 'Tension-type headache' },
  'headache': { code: '8A80', description: 'Headache disorders' },
  
  // Digestive conditions
  'irritable bowel syndrome': { code: 'DD91.0', description: 'Irritable bowel syndrome' },
  'ibs': { code: 'DD91.0', description: 'Irritable bowel syndrome' },
  'nausea': { code: 'MD81', description: 'Nausea' },
  'vomiting': { code: 'MD82', description: 'Vomiting' },
  'chemotherapy-induced nausea': { code: 'MD81', description: 'Nausea and vomiting' },
  'constipation': { code: 'ME04.0', description: 'Constipation' },
  'dyspepsia': { code: 'MD90', description: 'Functional dyspepsia' },
  
  // Mental health
  'depression': { code: '6A70', description: 'Single episode depressive disorder' },
  'anxiety': { code: '6B00', description: 'Generalised anxiety disorder' },
  'insomnia': { code: '7A00', description: 'Insomnia disorder' },
  'sleep disorders': { code: '7A0Y', description: 'Other specified insomnia disorders' },
  'stress': { code: 'QE84', description: 'Psychic stress, not elsewhere classified' },
  'ptsd': { code: '6B40', description: 'Post traumatic stress disorder' },
  
  // Respiratory
  'allergic rhinitis': { code: 'CA08', description: 'Allergic rhinitis' },
  'asthma': { code: 'CA23', description: 'Asthma' },
  'copd': { code: 'CA22', description: 'Chronic obstructive pulmonary disease' },
  
  // Women's health
  'dysmenorrhea': { code: 'GA34.0', description: 'Primary dysmenorrhoea' },
  'menstrual pain': { code: 'GA34.0', description: 'Dysmenorrhoea' },
  'pms': { code: 'GA34.4', description: 'Premenstrual tension syndrome' },
  'menopause': { code: 'MF36', description: 'Menopausal or female climacteric states' },
  'infertility': { code: 'GB31', description: 'Female infertility' },
  'breech presentation': { code: 'JA05.1', description: 'Breech presentation' },
  'pregnancy': { code: 'JA00', description: 'Pregnancy' },
  
  // Skin conditions
  'atopic dermatitis': { code: 'EA80', description: 'Atopic dermatitis' },
  'eczema': { code: 'EA80', description: 'Atopic dermatitis' },
  'psoriasis': { code: 'EA90', description: 'Psoriasis' },
  'acne': { code: 'ED80', description: 'Acne' },
  
  // Neurological
  'stroke': { code: '8B20', description: 'Ischaemic stroke' },
  'bells palsy': { code: '8B81', description: "Bell's palsy" },
  'facial palsy': { code: '8B81', description: 'Facial nerve palsy' },
  'peripheral neuropathy': { code: '8C10', description: 'Polyneuropathy' },
  'carpal tunnel': { code: '8C11.0', description: 'Carpal tunnel syndrome' },
  
  // Cardiovascular
  'hypertension': { code: 'BA00', description: 'Essential hypertension' },
  'high blood pressure': { code: 'BA00', description: 'Hypertension' },
  
  // Other
  'fatigue': { code: 'MG22', description: 'Fatigue' },
  'chronic fatigue': { code: 'MG22', description: 'Chronic fatigue' },
  'obesity': { code: '5B81', description: 'Obesity' },
  'smoking cessation': { code: 'QE11', description: 'Tobacco dependence' },
  'addiction': { code: '6C4', description: 'Disorders due to substance use' },
  'tinnitus': { code: 'AB32', description: 'Tinnitus' },
  'vertigo': { code: 'MB46', description: 'Vertigo' },
  'tennis elbow': { code: 'FB54.0', description: 'Lateral epicondylitis' },
};

function findICD11Code(condition: string): { code: string | null; description: string | null } {
  const normalizedCondition = condition.toLowerCase().trim();
  
  // Direct match
  if (ICD11_MAPPINGS[normalizedCondition]) {
    return ICD11_MAPPINGS[normalizedCondition];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(ICD11_MAPPINGS)) {
    if (normalizedCondition.includes(key) || key.includes(normalizedCondition)) {
      return value;
    }
  }
  
  return { code: null, description: null };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
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
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  const records: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      record[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || '';
    });
    
    records.push(record);
  }
  
  return records;
}

function parsePointsUsed(pointsStr: string): string[] {
  if (!pointsStr) return [];
  
  // Handle various formats: "BL23;BL25" or "BL23, BL25" or "BL23 BL25"
  return pointsStr
    .split(/[;,\s]+/)
    .map(p => p.trim().toUpperCase())
    .filter(p => p.length > 0 && /^[A-Z]+\d+$/.test(p));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { csv_content, trials, sapir_verify_ids } = await req.json();

    // Handle Sapir verification updates
    if (sapir_verify_ids && Array.isArray(sapir_verify_ids)) {
      console.log(`Verifying ${sapir_verify_ids.length} trials by Dr. Sapir`);
      
      const { data, error } = await supabase
        .from('clinical_trials')
        .update({ 
          sapir_verified: true, 
          verified_at: new Date().toISOString() 
        })
        .in('id', sapir_verify_ids)
        .select();

      if (error) {
        console.error('Verification error:', error);
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Verified ${data?.length || 0} trials`,
        verified: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse CSV content if provided
    let trialRecords = trials || [];
    
    if (csv_content) {
      console.log('Parsing CSV content...');
      trialRecords = parseCSV(csv_content);
      console.log(`Parsed ${trialRecords.length} records from CSV`);
    }

    if (!trialRecords.length) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No trial data provided. Send either csv_content or trials array.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
      icd11_mapped: 0
    };

    for (const record of trialRecords) {
      try {
        // Map CSV fields to database columns
        const condition = record.condition || record.conditions || '';
        const icd11Match = findICD11Code(condition);
        
        if (icd11Match.code) {
          results.icd11_mapped++;
        }

        const trialData = {
          nct_id: record.nct_id || record.nctid || record.study_id || null,
          title: record.title || record.study_title || record.brief_title || 'Untitled Study',
          condition: condition,
          condition_mesh_terms: record.condition_mesh_terms 
            ? record.condition_mesh_terms.split(';').map((t: string) => t.trim())
            : null,
          icd11_code: record.icd11_code || icd11Match.code,
          icd11_description: record.icd11_description || icd11Match.description,
          intervention: record.intervention || record.interventions || null,
          points_used: record.points_used 
            ? parsePointsUsed(record.points_used)
            : null,
          herbal_formula: record.herbal_formula || null,
          study_status: record.study_status || record.status || 'completed',
          phase: record.phase || null,
          enrollment: record.enrollment ? parseInt(record.enrollment) : null,
          start_date: record.start_date || null,
          completion_date: record.completion_date || null,
          primary_outcome: record.primary_outcome || null,
          results_summary: record.results_summary || null,
          efficacy_rating: record.efficacy_rating || null,
          source_url: record.source_url || null,
          citation: record.citation || null,
          license: record.license || 'public_domain',
          sapir_verified: record.sapir_verified === 'true' || record.sapir_verified === true,
          sapir_notes: record.sapir_notes || null,
          data_source: record.data_source || 'clinicaltrials.gov'
        };

        // Check for existing trial by NCT ID
        if (trialData.nct_id) {
          const { data: existing } = await supabase
            .from('clinical_trials')
            .select('id')
            .eq('nct_id', trialData.nct_id)
            .maybeSingle();

          if (existing) {
            // Update existing record
            const { error } = await supabase
              .from('clinical_trials')
              .update(trialData)
              .eq('id', existing.id);

            if (error) throw error;
            results.imported++;
            continue;
          }
        }

        // Insert new record
        const { error } = await supabase
          .from('clinical_trials')
          .insert(trialData);

        if (error) throw error;
        results.imported++;
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Error importing trial:', errorMsg);
        results.errors.push(`Failed to import: ${record.title || 'Unknown'} - ${errorMsg}`);
        results.skipped++;
      }
    }

    console.log('Import complete:', results);

    return new Response(JSON.stringify({
      success: true,
      message: `Imported ${results.imported} trials, skipped ${results.skipped}`,
      icd11_mapped: results.icd11_mapped,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
