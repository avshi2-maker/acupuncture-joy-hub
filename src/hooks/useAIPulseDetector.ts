import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * AI Pulse Detector Hook - Phase 5: Smart-Suggest System
 * Analyzes transcriptions for pulse-related keywords and suggests mappings
 */

export interface PulseSuggestion {
  action: 'SUGGEST_PULSE';
  pulseId: string;
  pulseName: string;
  chineseName: string;
  confidence: number;
  clinicalContext: string;
  suggestedPoints: string[];
  hebrewExplanation: string;
}

// Comprehensive pulse keyword mappings (Hebrew + English)
const PULSE_KEYWORDS: Record<string, { pulseId: string; pulseName: string; chineseName: string; suggestedPoints: string[] }> = {
  // Rapid pulse variants
  'rapid': { pulseId: 'P-SHU-01', pulseName: 'Rapid Pulse (Shuo Mai)', chineseName: '数脉 Shuò Mài', suggestedPoints: ['LI11', 'GV14', 'LI4', 'KI6', 'SP6'] },
  'fast': { pulseId: 'P-SHU-01', pulseName: 'Rapid Pulse (Shuo Mai)', chineseName: '数脉 Shuò Mài', suggestedPoints: ['LI11', 'GV14', 'LI4', 'KI6', 'SP6'] },
  'שואו מאי': { pulseId: 'P-SHU-01', pulseName: 'Rapid Pulse (Shuo Mai)', chineseName: '数脉 Shuò Mài', suggestedPoints: ['LI11', 'GV14', 'LI4', 'KI6', 'SP6'] },
  'דופק מהיר': { pulseId: 'P-SHU-01', pulseName: 'Rapid Pulse (Shuo Mai)', chineseName: '数脉 Shuò Mài', suggestedPoints: ['LI11', 'GV14', 'LI4', 'KI6', 'SP6'] },
  
  // Slow pulse variants  
  'slow': { pulseId: 'P-CHI-02', pulseName: 'Slow Pulse (Chi Mai)', chineseName: '迟脉 Chí Mài', suggestedPoints: ['ST36', 'CV4', 'CV6', 'GV4', 'RN8'] },
  'chi mai': { pulseId: 'P-CHI-02', pulseName: 'Slow Pulse (Chi Mai)', chineseName: '迟脉 Chí Mài', suggestedPoints: ['ST36', 'CV4', 'CV6', 'GV4', 'RN8'] },
  'צ׳י מאי': { pulseId: 'P-CHI-02', pulseName: 'Slow Pulse (Chi Mai)', chineseName: '迟脉 Chí Mài', suggestedPoints: ['ST36', 'CV4', 'CV6', 'GV4', 'RN8'] },
  'דופק איטי': { pulseId: 'P-CHI-02', pulseName: 'Slow Pulse (Chi Mai)', chineseName: '迟脉 Chí Mài', suggestedPoints: ['ST36', 'CV4', 'CV6', 'GV4', 'RN8'] },
  
  // Slippery pulse variants
  'slippery': { pulseId: 'P-HUA-03', pulseName: 'Slippery/Rolling Pulse (Hua Mai)', chineseName: '滑脉 Huá Mài', suggestedPoints: ['ST40', 'SP9', 'CV12', 'PC6', 'ST36'] },
  'rolling': { pulseId: 'P-HUA-03', pulseName: 'Slippery/Rolling Pulse (Hua Mai)', chineseName: '滑脉 Huá Mài', suggestedPoints: ['ST40', 'SP9', 'CV12', 'PC6', 'ST36'] },
  'הואה מאי': { pulseId: 'P-HUA-03', pulseName: 'Slippery/Rolling Pulse (Hua Mai)', chineseName: '滑脉 Huá Mài', suggestedPoints: ['ST40', 'SP9', 'CV12', 'PC6', 'ST36'] },
  'דופק חלקלק': { pulseId: 'P-HUA-03', pulseName: 'Slippery/Rolling Pulse (Hua Mai)', chineseName: '滑脉 Huá Mài', suggestedPoints: ['ST40', 'SP9', 'CV12', 'PC6', 'ST36'] },
  'ליחה': { pulseId: 'P-HUA-03', pulseName: 'Slippery/Rolling Pulse (Hua Mai)', chineseName: '滑脉 Huá Mài', suggestedPoints: ['ST40', 'SP9', 'CV12', 'PC6', 'ST36'] },
  'phlegm': { pulseId: 'P-HUA-03', pulseName: 'Slippery/Rolling Pulse (Hua Mai)', chineseName: '滑脉 Huá Mài', suggestedPoints: ['ST40', 'SP9', 'CV12', 'PC6', 'ST36'] },
  
  // Wiry pulse variants - multiple descriptions
  'wiry': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'string-like': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'guitar string': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'like a guitar': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'taut': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'xian mai': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'שיאן מאי': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'מיתרי': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'דופק מיתרי': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'כבד': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  'liver': { pulseId: 'P-XIAN-01', pulseName: 'Wiry/String-like Pulse (Xian Mai)', chineseName: '弦脉 Xián Mài', suggestedPoints: ['LV3', 'GB34', 'LV14', 'PC6', 'GB20'] },
  
  // Slippery pulse with additional Hebrew variant
  'מחליק': { pulseId: 'P-HUA-03', pulseName: 'Slippery/Rolling Pulse (Hua Mai)', chineseName: '滑脉 Huá Mài', suggestedPoints: ['ST40', 'SP9', 'CV12', 'PC6', 'ST36'] },
  'hua mai': { pulseId: 'P-HUA-03', pulseName: 'Slippery/Rolling Pulse (Hua Mai)', chineseName: '滑脉 Huá Mài', suggestedPoints: ['ST40', 'SP9', 'CV12', 'PC6', 'ST36'] },
  
  // Choppy pulse variants
  'choppy': { pulseId: 'P-SE-04', pulseName: 'Choppy/Rough Pulse (Se Mai)', chineseName: '涩脉 Sè Mài', suggestedPoints: ['SP10', 'BL17', 'LV3', 'SP6', 'ST36'] },
  'rough': { pulseId: 'P-SE-04', pulseName: 'Choppy/Rough Pulse (Se Mai)', chineseName: '涩脉 Sè Mài', suggestedPoints: ['SP10', 'BL17', 'LV3', 'SP6', 'ST36'] },
  'סה מאי': { pulseId: 'P-SE-04', pulseName: 'Choppy/Rough Pulse (Se Mai)', chineseName: '涩脉 Sè Mài', suggestedPoints: ['SP10', 'BL17', 'LV3', 'SP6', 'ST36'] },
  'דופק גס': { pulseId: 'P-SE-04', pulseName: 'Choppy/Rough Pulse (Se Mai)', chineseName: '涩脉 Sè Mài', suggestedPoints: ['SP10', 'BL17', 'LV3', 'SP6', 'ST36'] },
  'blood stasis': { pulseId: 'P-SE-04', pulseName: 'Choppy/Rough Pulse (Se Mai)', chineseName: '涩脉 Sè Mài', suggestedPoints: ['SP10', 'BL17', 'LV3', 'SP6', 'ST36'] },
  'סטגנציית דם': { pulseId: 'P-SE-04', pulseName: 'Choppy/Rough Pulse (Se Mai)', chineseName: '涩脉 Sè Mài', suggestedPoints: ['SP10', 'BL17', 'LV3', 'SP6', 'ST36'] },
  
  // Floating pulse variants
  'floating': { pulseId: 'P-FU-05', pulseName: 'Superficial/Floating Pulse (Fu Mai)', chineseName: '浮脉 Fú Mài', suggestedPoints: ['LU7', 'LI4', 'GB20', 'GV16', 'BL12'] },
  'superficial': { pulseId: 'P-FU-05', pulseName: 'Superficial/Floating Pulse (Fu Mai)', chineseName: '浮脉 Fú Mài', suggestedPoints: ['LU7', 'LI4', 'GB20', 'GV16', 'BL12'] },
  'פו מאי': { pulseId: 'P-FU-05', pulseName: 'Superficial/Floating Pulse (Fu Mai)', chineseName: '浮脉 Fú Mài', suggestedPoints: ['LU7', 'LI4', 'GB20', 'GV16', 'BL12'] },
  'דופק צף': { pulseId: 'P-FU-05', pulseName: 'Superficial/Floating Pulse (Fu Mai)', chineseName: '浮脉 Fú Mài', suggestedPoints: ['LU7', 'LI4', 'GB20', 'GV16', 'BL12'] },
  
  // Deep pulse variants
  'deep': { pulseId: 'P-CHEN-06', pulseName: 'Deep/Sinking Pulse (Chen Mai)', chineseName: '沉脉 Chén Mài', suggestedPoints: ['CV6', 'ST36', 'SP6', 'KI3', 'BL23'] },
  'sinking': { pulseId: 'P-CHEN-06', pulseName: 'Deep/Sinking Pulse (Chen Mai)', chineseName: '沉脉 Chén Mài', suggestedPoints: ['CV6', 'ST36', 'SP6', 'KI3', 'BL23'] },
  'צ׳ן מאי': { pulseId: 'P-CHEN-06', pulseName: 'Deep/Sinking Pulse (Chen Mai)', chineseName: '沉脉 Chén Mài', suggestedPoints: ['CV6', 'ST36', 'SP6', 'KI3', 'BL23'] },
  'דופק עמוק': { pulseId: 'P-CHEN-06', pulseName: 'Deep/Sinking Pulse (Chen Mai)', chineseName: '沉脉 Chén Mài', suggestedPoints: ['CV6', 'ST36', 'SP6', 'KI3', 'BL23'] },
  
  // Thin/Fine pulse variants
  'thin': { pulseId: 'P-XI-07', pulseName: 'Fine/Thin Pulse (Xi Mai)', chineseName: '细脉 Xì Mài', suggestedPoints: ['SP6', 'ST36', 'KI3', 'BL23', 'CV4'] },
  'fine': { pulseId: 'P-XI-07', pulseName: 'Fine/Thin Pulse (Xi Mai)', chineseName: '细脉 Xì Mài', suggestedPoints: ['SP6', 'ST36', 'KI3', 'BL23', 'CV4'] },
  'שי מאי': { pulseId: 'P-XI-07', pulseName: 'Fine/Thin Pulse (Xi Mai)', chineseName: '细脉 Xì Mài', suggestedPoints: ['SP6', 'ST36', 'KI3', 'BL23', 'CV4'] },
  'דופק דק': { pulseId: 'P-XI-07', pulseName: 'Fine/Thin Pulse (Xi Mai)', chineseName: '细脉 Xì Mài', suggestedPoints: ['SP6', 'ST36', 'KI3', 'BL23', 'CV4'] },
  'blood deficiency': { pulseId: 'P-XI-07', pulseName: 'Fine/Thin Pulse (Xi Mai)', chineseName: '细脉 Xì Mài', suggestedPoints: ['SP6', 'ST36', 'KI3', 'BL23', 'CV4'] },
  'חוסר דם': { pulseId: 'P-XI-07', pulseName: 'Fine/Thin Pulse (Xi Mai)', chineseName: '细脉 Xì Mài', suggestedPoints: ['SP6', 'ST36', 'KI3', 'BL23', 'CV4'] },
  
  // Weak pulse variants
  'weak': { pulseId: 'P-RUO-08', pulseName: 'Weak/Deficient Pulse (Ruo Mai)', chineseName: '弱脉 Ruò Mài', suggestedPoints: ['ST36', 'CV6', 'BL20', 'BL21', 'SP3'] },
  'deficient': { pulseId: 'P-RUO-08', pulseName: 'Weak/Deficient Pulse (Ruo Mai)', chineseName: '弱脉 Ruò Mài', suggestedPoints: ['ST36', 'CV6', 'BL20', 'BL21', 'SP3'] },
  'רוא מאי': { pulseId: 'P-RUO-08', pulseName: 'Weak/Deficient Pulse (Ruo Mai)', chineseName: '弱脉 Ruò Mài', suggestedPoints: ['ST36', 'CV6', 'BL20', 'BL21', 'SP3'] },
  'דופק חלש': { pulseId: 'P-RUO-08', pulseName: 'Weak/Deficient Pulse (Ruo Mai)', chineseName: '弱脉 Ruò Mài', suggestedPoints: ['ST36', 'CV6', 'BL20', 'BL21', 'SP3'] },
  'qi deficiency': { pulseId: 'P-RUO-08', pulseName: 'Weak/Deficient Pulse (Ruo Mai)', chineseName: '弱脉 Ruò Mài', suggestedPoints: ['ST36', 'CV6', 'BL20', 'BL21', 'SP3'] },
  'חוסר צ׳י': { pulseId: 'P-RUO-08', pulseName: 'Weak/Deficient Pulse (Ruo Mai)', chineseName: '弱脉 Ruò Mài', suggestedPoints: ['ST36', 'CV6', 'BL20', 'BL21', 'SP3'] },
  
  // Tight pulse variants
  'tight': { pulseId: 'P-JIN-09', pulseName: 'Tight/Tense Pulse (Jin Mai)', chineseName: '紧脉 Jǐn Mài', suggestedPoints: ['GB20', 'LI4', 'LV3', 'ST36', 'CV12'] },
  'tense': { pulseId: 'P-JIN-09', pulseName: 'Tight/Tense Pulse (Jin Mai)', chineseName: '紧脉 Jǐn Mài', suggestedPoints: ['GB20', 'LI4', 'LV3', 'ST36', 'CV12'] },
  'ג׳ין מאי': { pulseId: 'P-JIN-09', pulseName: 'Tight/Tense Pulse (Jin Mai)', chineseName: '紧脉 Jǐn Mài', suggestedPoints: ['GB20', 'LI4', 'LV3', 'ST36', 'CV12'] },
  'דופק מתוח': { pulseId: 'P-JIN-09', pulseName: 'Tight/Tense Pulse (Jin Mai)', chineseName: '紧脉 Jǐn Mài', suggestedPoints: ['GB20', 'LI4', 'LV3', 'ST36', 'CV12'] },
  'cold': { pulseId: 'P-JIN-09', pulseName: 'Tight/Tense Pulse (Jin Mai)', chineseName: '紧脉 Jǐn Mài', suggestedPoints: ['GB20', 'LI4', 'LV3', 'ST36', 'CV12'] },
  'קור': { pulseId: 'P-JIN-09', pulseName: 'Tight/Tense Pulse (Jin Mai)', chineseName: '紧脉 Jǐn Mài', suggestedPoints: ['GB20', 'LI4', 'LV3', 'ST36', 'CV12'] },
};

// Hebrew clinical explanations for each pulse
const PULSE_HEBREW_EXPLANATIONS: Record<string, string> = {
  'P-SHU-01': 'המערכת זיהתה דופק מהיר. זה מעיד על חום, דלקת או חוסר יין. הנקודות LI11 ו-GV14 מוכנות להפעלה לניקוי חום.',
  'P-CHI-02': 'המערכת זיהתה דופק איטי. זה מחזק את החשד לחוסר יאנג או קור פנימי. הנקודות ST36 ו-CV4 מוכנות לחימום.',
  'P-HUA-03': 'המערכת זיהתה דופק חלקלק. זה מעיד על נוכחות ליחה או לחות. הנקודות ST40 ו-SP9 מוכנות להפעלה להתמרת ליחה.',
  'P-XIAN-01': 'המערכת זיהתה דופק מיתרי. זה מחזק את החשד לסטגנציה של צ׳י הכבד. הנקודות LV3 ו-GB34 מוכנות להפעלה.',
  'P-SE-04': 'המערכת זיהתה דופק גס. זה מעיד על סטגנציית דם או חוסר דם. הנקודות SP10 ו-BL17 מוכנות להנעת הדם.',
  'P-FU-05': 'המערכת זיהתה דופק צף. זה מעיד על דפוס חיצוני, הגוף מתמודד עם פתוגן. הנקודות LU7 ו-LI4 מוכנות לשחרור החיצוני.',
  'P-CHEN-06': 'המערכת זיהתה דופק עמוק. זה מחזק את החשד לדפוס פנימי. הנקודות CV6 ו-KI3 מוכנות לחיזוק הפנים.',
  'P-XI-07': 'המערכת זיהתה דופק דק. זה מעיד על חוסר דם ו/או יין. הנקודות SP6 ו-ST36 מוכנות להזנת הדם.',
  'P-RUO-08': 'המערכת זיהתה דופק חלש. זה מעיד על חוסר צ׳י משמעותי. הנקודות ST36 ו-CV6 מוכנות לחיזוק הצ׳י.',
  'P-JIN-09': 'המערכת זיהתה דופק מתוח. זה מעיד על קור או כאב. הנקודות GB20 ו-LI4 מוכנות לפיזור הקור.',
};

// Contradiction patterns for contextual logic
const CONTRADICTION_PATTERNS: Array<{
  heatKeywords: string[];
  coldKeywords: string[];
  hebrewWarning: string;
}> = [
  {
    heatKeywords: ['מהיר', 'rapid', 'fast', 'חום', 'heat'],
    coldKeywords: ['קור', 'cold', 'גפיים קרות', 'cold limbs', 'קור בגפיים'],
    hebrewWarning: '⚠️ שימו לב: זוהתה סתירה אבחנתית! הדופק מצביע על חום אך יש סימני קור בגפיים. יתכן מדובר בחום כוזב (False Heat) או חוסר יין עם חום ריק. מומלץ לבדוק את הלשון ולהעמיק את האבחון.',
  },
  {
    heatKeywords: ['צף', 'floating', 'superficial'],
    coldKeywords: ['עמוק', 'deep', 'sinking', 'פנימי', 'interior'],
    hebrewWarning: '⚠️ שימו לב: זוהה ערבוב בין דפוס חיצוני לפנימי. יתכן שהפתוגן עובר משטח לעומק.',
  },
];

// Detect contradictions in transcription
function detectContradictions(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  for (const pattern of CONTRADICTION_PATTERNS) {
    const hasHeat = pattern.heatKeywords.some(k => lowerText.includes(k.toLowerCase()));
    const hasCold = pattern.coldKeywords.some(k => lowerText.includes(k.toLowerCase()));
    
    if (hasHeat && hasCold) {
      return pattern.hebrewWarning;
    }
  }
  
  return null;
}

interface UseAIPulseDetectorOptions {
  enabled?: boolean;
  onPulseSuggested?: (suggestion: PulseSuggestion) => void;
  onSpeakSuggestion?: (hebrewText: string) => void;
  debounceMs?: number;
}

export function useAIPulseDetector(
  transcription: string,
  options: UseAIPulseDetectorOptions = {}
) {
  const {
    enabled = true,
    onPulseSuggested,
    onSpeakSuggestion,
    debounceMs = 1500,
  } = options;

  const [pendingSuggestions, setPendingSuggestions] = useState<PulseSuggestion[]>([]);
  const [isGlowing, setIsGlowing] = useState(false);
  const [lastSuggestedPulse, setLastSuggestedPulse] = useState<string | null>(null);
  const processedKeywordsRef = useRef<Set<string>>(new Set());
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const glowTimeoutRef = useRef<NodeJS.Timeout>();

  // Voice synthesis for clinical whisper
  const speakClinicalWhisper = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.85;  // Slightly slower for clinical terminology
      utterance.pitch = 1.0;
      utterance.volume = 0.3; // Whisper mode - low volume
      
      window.speechSynthesis.speak(utterance);
      onSpeakSuggestion?.(text);
    } catch (error) {
      console.warn('[AI Pulse Detector] Speech synthesis not available:', error);
    }
  }, [onSpeakSuggestion]);

  // Start gold glow animation
  const triggerGoldGlow = useCallback(() => {
    setIsGlowing(true);
    
    // Clear existing timeout
    if (glowTimeoutRef.current) {
      clearTimeout(glowTimeoutRef.current);
    }
    
    // Glow for 8 seconds (breathing animation cycles)
    glowTimeoutRef.current = setTimeout(() => {
      setIsGlowing(false);
    }, 8000);
  }, []);

  // Detect pulse keywords in transcription with contextual logic
  const detectPulseKeywords = useCallback((text: string) => {
    if (!enabled || !text) return;
    
    const lowerText = text.toLowerCase();
    const detectedSuggestions: PulseSuggestion[] = [];
    
    // Check for contradictions first
    const contradictionWarning = detectContradictions(text);
    
    Object.entries(PULSE_KEYWORDS).forEach(([keyword, pulseData]) => {
      // Check if keyword exists in text and hasn't been processed
      if (lowerText.includes(keyword.toLowerCase()) && !processedKeywordsRef.current.has(keyword)) {
        processedKeywordsRef.current.add(keyword);
        
        // Build the explanation with possible contradiction warning
        let explanation = PULSE_HEBREW_EXPLANATIONS[pulseData.pulseId] || '';
        if (contradictionWarning) {
          explanation = contradictionWarning + ' ' + explanation;
        }
        
        const suggestion: PulseSuggestion = {
          action: 'SUGGEST_PULSE',
          pulseId: pulseData.pulseId,
          pulseName: pulseData.pulseName,
          chineseName: pulseData.chineseName,
          confidence: contradictionWarning ? 0.65 : 0.85, // Lower confidence if contradiction
          clinicalContext: contradictionWarning 
            ? `Detected keyword: "${keyword}" with contradiction` 
            : `Detected keyword: "${keyword}"`,
          suggestedPoints: pulseData.suggestedPoints,
          hebrewExplanation: explanation,
        };
        
        detectedSuggestions.push(suggestion);
      }
    });
    
    if (detectedSuggestions.length > 0) {
      // Get the first unique suggestion (not already suggested)
      const newSuggestion = detectedSuggestions.find(s => s.pulseId !== lastSuggestedPulse);
      
      if (newSuggestion) {
        setLastSuggestedPulse(newSuggestion.pulseId);
        setPendingSuggestions(prev => [...prev, newSuggestion]);
        
        // Trigger the gold glow animation
        triggerGoldGlow();
        
        // Speak the clinical whisper
        if (newSuggestion.hebrewExplanation) {
          speakClinicalWhisper(newSuggestion.hebrewExplanation);
        }
        
        // Notify callback
        onPulseSuggested?.(newSuggestion);
        
        // Show toast with warning if contradiction detected
        if (contradictionWarning) {
          toast.warning('⚠️ זוהתה סתירה אבחנתית', {
            description: newSuggestion.pulseName,
            duration: 6000,
          });
        } else {
          toast.info('🎯 זוהה דופק בתמלול', {
            description: newSuggestion.pulseName,
            duration: 4000,
          });
        }
        
        console.log('[AI Pulse Detector] Suggested pulse:', newSuggestion, 
          contradictionWarning ? '(with contradiction)' : '');
      }
    }
  }, [enabled, lastSuggestedPulse, triggerGoldGlow, speakClinicalWhisper, onPulseSuggested]);

  // Debounced processing of transcription
  useEffect(() => {
    if (!enabled || !transcription) return;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      detectPulseKeywords(transcription);
    }, debounceMs);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [transcription, enabled, debounceMs, detectPulseKeywords]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Accept a suggestion (user clicked on glowing icon)
  const acceptSuggestion = useCallback((pulseId: string) => {
    const suggestion = pendingSuggestions.find(s => s.pulseId === pulseId);
    if (suggestion) {
      setPendingSuggestions(prev => prev.filter(s => s.pulseId !== pulseId));
      setIsGlowing(false);
      return suggestion;
    }
    return null;
  }, [pendingSuggestions]);

  // Dismiss a suggestion
  const dismissSuggestion = useCallback((pulseId: string) => {
    setPendingSuggestions(prev => prev.filter(s => s.pulseId !== pulseId));
    if (pendingSuggestions.length <= 1) {
      setIsGlowing(false);
    }
  }, [pendingSuggestions.length]);

  // Clear all suggestions
  const clearSuggestions = useCallback(() => {
    setPendingSuggestions([]);
    setIsGlowing(false);
    processedKeywordsRef.current.clear();
    setLastSuggestedPulse(null);
  }, []);

  // Get current suggestion (first pending)
  const currentSuggestion = pendingSuggestions[0] || null;

  return {
    pendingSuggestions,
    currentSuggestion,
    isGlowing,
    acceptSuggestion,
    dismissSuggestion,
    clearSuggestions,
    triggerGoldGlow,
    speakClinicalWhisper,
  };
}
