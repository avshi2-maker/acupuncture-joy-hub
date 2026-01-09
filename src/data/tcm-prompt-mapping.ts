// RAG Priority Context Mapping - Token-Saver CSV (A-Z Prompts)
// These replace short Hebrew text with rich clinical context for the AI

export interface PromptMapping {
  id: string;
  hebrewLabel: string;
  ragPriorityContext: string;
  role: 'Clinical Differential' | 'Treatment Strategy' | 'Point Selection' | 'Pathology Analysis' | 'Physiology' | 'Preventive' | 'Diagnosis';
  icon: string;
}

export const PROMPT_MAPPINGS: PromptMapping[] = [
  {
    id: 'kidney-yin-yang',
    hebrewLabel: 'סימנים יין/יאנג כליות',
    ragPriorityContext: 'RAG PRIORITY: Kidney Pathology. Compare Yin/Yang deficiency signs (Heat vs Cold). Use embedded point table.',
    role: 'Clinical Differential',
    icon: '🫘'
  },
  {
    id: 'liver-stagnation-rising',
    hebrewLabel: 'סטגנציה מול עליית יאנג',
    ragPriorityContext: 'RAG PRIORITY: Liver Dynamics. Differentiate Qi Stagnation vs Yang Rising. Focus on pulse/tongue.',
    role: 'Clinical Differential',
    icon: '🌿'
  },
  {
    id: 'spleen-damp-heat',
    hebrewLabel: 'לחות חמה בטחול',
    ragPriorityContext: 'RAG PRIORITY: Spleen/Damp-Heat. Search herbs for draining dampness. Prioritize clinical strategy.',
    role: 'Treatment Strategy',
    icon: '💧'
  },
  {
    id: 'auricular-shen',
    hebrewLabel: 'נקודות Shen באוזן',
    ragPriorityContext: 'RAG PRIORITY: Auricular Medicine. Retrieve specific Shen-calming ear points. Output concise list.',
    role: 'Point Selection',
    icon: '👂'
  },
  {
    id: 'liver-spleen-ke',
    hebrewLabel: 'מעגל הבקרה כבד/טחול',
    ragPriorityContext: 'RAG PRIORITY: Ke Cycle. Analyze Wood overacting on Earth. Retrieve internal case studies.',
    role: 'Pathology Analysis',
    icon: '🔄'
  },
  {
    id: 'lung-kidney-respiration',
    hebrewLabel: 'ריאות וכליות - נשימה',
    ragPriorityContext: "RAG PRIORITY: Respiratory/Kidney. Search 'Grasping the Qi'. Focus on LU7 and KI6 relationship.",
    role: 'Physiology',
    icon: '🫁'
  },
  {
    id: 'wei-qi-strengthen',
    hebrewLabel: 'חיזוק Wei Qi',
    ragPriorityContext: 'RAG PRIORITY: Immune Defense. Retrieve points for strengthening external shield (Wei Qi).',
    role: 'Preventive',
    icon: '🛡️'
  },
  {
    id: 'pulse-deficiency-stagnation',
    hebrewLabel: 'דופק חוסר מול סטגנציה',
    ragPriorityContext: 'RAG PRIORITY: Pulse Diagnosis. Compare Choppy vs Thready/Weak pulses. Use reference table.',
    role: 'Diagnosis',
    icon: '💓'
  },
  {
    id: 'tongue-spleen-qi',
    hebrewLabel: 'חולשת צ׳י בטחול',
    ragPriorityContext: "RAG PRIORITY: Tongue Diagnosis. Search 'Scalloped edges' and 'Teeth marks'. Match Spleen Qi Def.",
    role: 'Diagnosis',
    icon: '👅'
  },
  {
    id: 'san-jiao-functions',
    hebrewLabel: 'San Jiao תפקודים',
    ragPriorityContext: 'RAG PRIORITY: Triple Burner. Retrieve functions of the 3 chambers. Focus on fluid metabolism.',
    role: 'Physiology',
    icon: '🔥'
  },
  // Additional clinical contexts
  {
    id: 'blood-stasis',
    hebrewLabel: 'סטגנציית דם',
    ragPriorityContext: 'RAG PRIORITY: Blood Stasis Patterns. Identify fixed pain, dark complexion, purple tongue signs. Focus on SP10, LV3, BL17.',
    role: 'Clinical Differential',
    icon: '🩸'
  },
  {
    id: 'phlegm-patterns',
    hebrewLabel: 'דפוסי ליחה',
    ragPriorityContext: 'RAG PRIORITY: Phlegm Pathology. Differentiate substantial vs insubstantial phlegm. ST40, CV12, SP9 protocols.',
    role: 'Treatment Strategy',
    icon: '☁️'
  },
  {
    id: 'heart-kidney-axis',
    hebrewLabel: 'ציר לב-כליות',
    ragPriorityContext: 'RAG PRIORITY: Heart-Kidney Communication. Water-Fire balance, insomnia patterns. HT7, KI6, SP6 combinations.',
    role: 'Physiology',
    icon: '❤️'
  },
  {
    id: 'wind-patterns',
    hebrewLabel: 'דפוסי רוח',
    ragPriorityContext: 'RAG PRIORITY: Wind Pathology. Internal vs External wind differentiation. GB20, LV3, GV16 for wind elimination.',
    role: 'Pathology Analysis',
    icon: '🌬️'
  },
  {
    id: 'jing-essence',
    hebrewLabel: 'ג׳ינג - מהות',
    ragPriorityContext: 'RAG PRIORITY: Essence/Jing Deficiency. Developmental issues, premature aging. KI3, GV4, CV4 tonification.',
    role: 'Physiology',
    icon: '✨'
  },
  {
    id: 'zang-fu-relationships',
    hebrewLabel: 'יחסי זאנג-פו',
    ragPriorityContext: 'RAG PRIORITY: Organ Relationships. Mother-Child, Ke cycle interactions. Holistic pattern analysis.',
    role: 'Pathology Analysis',
    icon: '🏛️'
  },
  {
    id: 'qi-flow-disorders',
    hebrewLabel: 'הפרעות זרימת צ׳י',
    ragPriorityContext: 'RAG PRIORITY: Qi Flow Patterns. Rebellious Qi, Sinking Qi, Qi Stagnation differentiation and treatment.',
    role: 'Clinical Differential',
    icon: '🌊'
  },
  {
    id: 'yin-deficiency-heat',
    hebrewLabel: 'חום מחוסר יין',
    ragPriorityContext: 'RAG PRIORITY: Empty Heat. Night sweats, five-palm heat, malar flush. Nourish Yin, clear deficiency heat protocols.',
    role: 'Treatment Strategy',
    icon: '🌙'
  },
  {
    id: 'yang-deficiency-cold',
    hebrewLabel: 'קור מחוסר יאנג',
    ragPriorityContext: 'RAG PRIORITY: Yang Deficiency Cold. Cold limbs, loose stools, pale complexion. Moxa protocols, warming herbs.',
    role: 'Treatment Strategy',
    icon: '❄️'
  },
  {
    id: 'shen-disturbance',
    hebrewLabel: 'הפרעות שן',
    ragPriorityContext: 'RAG PRIORITY: Shen Disorders. Anxiety, insomnia, palpitations. HT7, PC6, GV20 for calming Shen.',
    role: 'Point Selection',
    icon: '🧠'
  }
];

// Get mapping by Hebrew label
export const getMappingByLabel = (label: string): PromptMapping | undefined => {
  return PROMPT_MAPPINGS.find(m => m.hebrewLabel === label);
};

// Get mapping by ID
export const getMappingById = (id: string): PromptMapping | undefined => {
  return PROMPT_MAPPINGS.find(m => m.id === id);
};

// Group mappings by role
export const getMappingsByRole = (): Record<string, PromptMapping[]> => {
  return PROMPT_MAPPINGS.reduce((acc, mapping) => {
    if (!acc[mapping.role]) {
      acc[mapping.role] = [];
    }
    acc[mapping.role].push(mapping);
    return acc;
  }, {} as Record<string, PromptMapping[]>);
};
