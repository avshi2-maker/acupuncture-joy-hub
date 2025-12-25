// Patient Q&A templates from uploaded Excel file
// Stage-based questions for patient intake and follow-up

export interface PatientQuestion {
  id: string;
  stage: 'before' | 'during' | 'ongoing';
  question: string;
  notes: string;
  treatmentSuggestions: string;
  category?: string;
}

export const patientQAQuestions: PatientQuestion[] = [
  // Before Treatment
  { id: 'bt1', stage: 'before', question: 'What is your primary reason for seeking acupuncture?', notes: 'Helps identify chief complaint', treatmentSuggestions: 'Use 6–10 needles; focus on affected meridians', category: 'Chief Complaint' },
  { id: 'bt2', stage: 'before', question: 'When did your symptoms begin?', notes: 'Timeline of condition', treatmentSuggestions: 'Choose acute vs chronic protocol; adjust needle retention time', category: 'Timeline' },
  { id: 'bt3', stage: 'before', question: 'What makes your symptoms better or worse?', notes: 'Triggers and relief factors', treatmentSuggestions: 'Target reactive points; consider distal and local points', category: 'Triggers' },
  { id: 'bt4', stage: 'before', question: 'Are you under physician\'s care or other therapies?', notes: 'Coordination with other treatments', treatmentSuggestions: 'Avoid overlapping modalities; gentle stimulation', category: 'Medical Care' },
  { id: 'bt5', stage: 'before', question: 'Do you have allergies, chronic conditions, or surgeries?', notes: 'Safety and history', treatmentSuggestions: 'Avoid sensitive areas; use fewer needles if fragile', category: 'Safety' },
  { id: 'bt6', stage: 'before', question: 'What medications or supplements are you taking?', notes: 'Possible interactions', treatmentSuggestions: 'Avoid herbs that conflict; use harmonizing points', category: 'Medications' },
  { id: 'bt7', stage: 'before', question: 'How is your sleep, digestion, and energy?', notes: 'General wellness indicators', treatmentSuggestions: 'SP6, ST36, LI4; 8–12 needles', category: 'General Wellness' },
  { id: 'bt8', stage: 'before', question: 'Do you experience stress, anxiety, or mood swings?', notes: 'Emotional health', treatmentSuggestions: 'GV20, HT7, PC6; calming points', category: 'Emotional' },
  { id: 'bt9', stage: 'before', question: 'What is your diet and exercise routine?', notes: 'Lifestyle factors', treatmentSuggestions: 'Support digestion: ST36, CV12; use 6–10 needles', category: 'Lifestyle' },
  { id: 'bt10', stage: 'before', question: 'History of trauma (physical/emotional)?', notes: 'May affect treatment approach', treatmentSuggestions: 'Gentle needling; use grounding points like KD1, ST36', category: 'Trauma' },
  { id: 'bt11', stage: 'before', question: 'Regular bowel movements? Any issues?', notes: 'TCM diagnostic relevance', treatmentSuggestions: 'ST25, CV6, SP15; 6–8 needles', category: 'Digestion' },
  { id: 'bt12', stage: 'before', question: 'Menstrual cycle regularity and symptoms?', notes: 'Hormonal balance', treatmentSuggestions: 'SP6, CV4, LV3; cycle-based protocol', category: 'Women\'s Health' },
  { id: 'bt13', stage: 'before', question: 'Night sweats, chills, hot flashes?', notes: 'Yin/Yang imbalance indicators', treatmentSuggestions: 'KD3, LI11, GV14; 8–10 needles', category: 'Temperature' },
  { id: 'bt14', stage: 'before', question: 'Do you dream often? Are they vivid/disturbing?', notes: 'Emotional and mental health', treatmentSuggestions: 'HT7, Anmian, PC6; calming protocol', category: 'Sleep' },
  { id: 'bt15', stage: 'before', question: 'Time of day you feel most energetic/fatigued?', notes: 'Qi flow patterns', treatmentSuggestions: 'Adjust treatment time; use circadian-based points', category: 'Energy' },
  { id: 'bt16', stage: 'before', question: 'Have you had acupuncture before?', notes: 'Experience level', treatmentSuggestions: 'Start with fewer needles if new', category: 'Experience' },
  { id: 'bt17', stage: 'before', question: 'Comfortable with needles and process?', notes: 'Consent and comfort', treatmentSuggestions: 'Explain technique; use shallow insertion', category: 'Consent' },
  { id: 'bt18', stage: 'before', question: 'Insurance coverage for acupuncture?', notes: 'Administrative', treatmentSuggestions: 'N/A', category: 'Admin' },

  // During Treatment
  { id: 'dt1', stage: 'during', question: 'How are you feeling today vs last visit?', notes: 'Progress tracking', treatmentSuggestions: 'Adjust needle count or location based on feedback', category: 'Progress' },
  { id: 'dt2', stage: 'during', question: 'Changes in symptoms?', notes: 'Treatment effectiveness', treatmentSuggestions: 'Reinforce effective points; rotate others', category: 'Symptoms' },
  { id: 'dt3', stage: 'during', question: 'New concerns or discomforts?', notes: 'Adjustments needed', treatmentSuggestions: 'Add or remove points; consider cupping or moxa', category: 'New Issues' },
  { id: 'dt4', stage: 'during', question: 'How did you feel after last treatment?', notes: 'Post-treatment response', treatmentSuggestions: 'Adjust retention time or stimulation', category: 'Response' },
  { id: 'dt5', stage: 'during', question: 'Followed aftercare instructions?', notes: 'Compliance', treatmentSuggestions: 'Reinforce importance; suggest hydration and rest', category: 'Compliance' },
  { id: 'dt6', stage: 'during', question: 'Tingling, heaviness, warmth during needling?', notes: 'Needle response', treatmentSuggestions: 'Adjust depth or technique; check for De Qi', category: 'De Qi' },
  { id: 'dt7', stage: 'during', question: 'Want cupping, moxibustion, or herbs today?', notes: 'Optional modalities', treatmentSuggestions: 'Add based on condition; explain benefits', category: 'Modalities' },
  { id: 'dt8', stage: 'during', question: 'Areas to focus more on?', notes: 'Patient preferences', treatmentSuggestions: 'Prioritize those zones; use local and distal points', category: 'Focus Areas' },

  // Ongoing Meetings
  { id: 'om1', stage: 'ongoing', question: 'How has your condition evolved?', notes: 'Long-term progress', treatmentSuggestions: 'Reduce frequency or maintain protocol', category: 'Progress' },
  { id: 'om2', stage: 'ongoing', question: 'Fewer flare-ups or episodes?', notes: 'Symptom reduction', treatmentSuggestions: 'Consider maintenance plan', category: 'Reduction' },
  { id: 'om3', stage: 'ongoing', question: 'Sleep, mood, energy now?', notes: 'Overall wellness', treatmentSuggestions: 'Adjust points to support balance', category: 'Wellness' },
  { id: 'om4', stage: 'ongoing', question: 'Able to perform daily activities more easily?', notes: 'Functional improvement', treatmentSuggestions: 'Reinforce musculoskeletal points', category: 'Function' },
  { id: 'om5', stage: 'ongoing', question: 'Lifestyle changes (diet, exercise, stress)?', notes: 'Supportive habits', treatmentSuggestions: 'Encourage supportive points; offer herbs', category: 'Lifestyle' },
  { id: 'om6', stage: 'ongoing', question: 'Need support with herbs, nutrition, mindfulness?', notes: 'Holistic care', treatmentSuggestions: 'Recommend adjunct therapies', category: 'Holistic' },
  { id: 'om7', stage: 'ongoing', question: 'Feel informed and supported?', notes: 'Patient satisfaction', treatmentSuggestions: 'Offer education; adjust communication', category: 'Satisfaction' },
  { id: 'om8', stage: 'ongoing', question: 'Want educational materials or wellness tips?', notes: 'Engagement', treatmentSuggestions: 'Provide handouts or links', category: 'Education' },
  { id: 'om9', stage: 'ongoing', question: 'Satisfied with communication style/frequency?', notes: 'Service quality', treatmentSuggestions: 'Adjust follow-up method', category: 'Communication' },
  { id: 'om10', stage: 'ongoing', question: 'Would you recommend acupuncture to others?', notes: 'Feedback and referrals', treatmentSuggestions: 'Ask for testimonial or referral', category: 'Referral' },
];

export const getQuestionsByStage = (stage: 'before' | 'during' | 'ongoing') => 
  patientQAQuestions.filter(q => q.stage === stage);

export const stageLabels = {
  before: 'Before Treatment',
  during: 'During Treatment',
  ongoing: 'Ongoing Meetings',
};
