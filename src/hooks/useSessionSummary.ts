import { useState, useCallback, useMemo } from 'react';
import { getPointTechnicalInfo, PointTechnicalInfo } from '@/data/point-technical-data';
import { pulseDiagnosisData, PulseFinding } from '@/data/pulse-diagnosis-data';

/**
 * Session Summary Hook - Phase 6: Protocol Buffer
 * Tracks all active highlights, pulse selections, and AI suggestions
 * for generating the final clinical report
 */

export interface ProtocolPoint {
  code: string;
  source: 'manual' | 'ai-sparkle' | 'ai-suggestion';
  technicalInfo: PointTechnicalInfo | null;
  addedAt: number;
}

export interface SelectedPulse {
  pulseId: string;
  pulseName: string;
  chineseName: string;
  finding: PulseFinding | null;
  aiReasoning?: string;
  source: 'manual' | 'ai-suggestion';
  addedAt: number;
}

export interface ClinicalContradiction {
  warning: string;
  detectedAt: number;
}

export interface SessionSummaryData {
  pulses: SelectedPulse[];
  protocolPoints: ProtocolPoint[];
  contradictions: ClinicalContradiction[];
  sessionStartedAt: number;
  notes: string[];
}

export interface FinalReport {
  pulseAnalysis: {
    finding: string;
    chineseName: string;
    tcmPattern: string;
    aiReasoning?: string;
  }[];
  acupunctureProtocol: {
    code: string;
    hebrewName: string;
    depth: string;
    angle: string;
    clinicalAction: string;
  }[];
  clinicalPrecautions: string[];
  hebrewSummary: string;
  generatedAt: string;
}

export function useSessionSummary() {
  const [sessionData, setSessionData] = useState<SessionSummaryData>({
    pulses: [],
    protocolPoints: [],
    contradictions: [],
    sessionStartedAt: Date.now(),
    notes: [],
  });

  // Add a point to the protocol (from manual selection or AI)
  const addProtocolPoint = useCallback((
    code: string,
    source: 'manual' | 'ai-sparkle' | 'ai-suggestion' = 'manual'
  ) => {
    setSessionData(prev => {
      // Check if point already exists
      if (prev.protocolPoints.some(p => p.code === code)) {
        return prev;
      }

      const technicalInfo = getPointTechnicalInfo(code);
      const newPoint: ProtocolPoint = {
        code,
        source,
        technicalInfo,
        addedAt: Date.now(),
      };

      return {
        ...prev,
        protocolPoints: [...prev.protocolPoints, newPoint],
      };
    });
  }, []);

  // Add multiple points from AI sparkle
  const addSparklePoints = useCallback((codes: string[]) => {
    codes.forEach(code => {
      addProtocolPoint(code, 'ai-sparkle');
    });
  }, [addProtocolPoint]);

  // Remove a point from the protocol
  const removeProtocolPoint = useCallback((code: string) => {
    setSessionData(prev => ({
      ...prev,
      protocolPoints: prev.protocolPoints.filter(p => p.code !== code),
    }));
  }, []);

  // Add a pulse finding
  const addPulse = useCallback((
    pulseId: string,
    pulseName: string,
    chineseName: string,
    aiReasoning?: string,
    source: 'manual' | 'ai-suggestion' = 'manual'
  ) => {
    setSessionData(prev => {
      // Check if pulse already exists
      if (prev.pulses.some(p => p.pulseId === pulseId)) {
        return prev;
      }

      // Find the pulse finding from data
      let finding: PulseFinding | null = null;
      for (const category of pulseDiagnosisData) {
        const found = category.findings.find(f => 
          f.finding.toLowerCase().includes(pulseName.toLowerCase()) ||
          f.chineseName.includes(chineseName)
        );
        if (found) {
          finding = found;
          break;
        }
      }

      const newPulse: SelectedPulse = {
        pulseId,
        pulseName,
        chineseName,
        finding,
        aiReasoning,
        source,
        addedAt: Date.now(),
      };

      return {
        ...prev,
        pulses: [...prev.pulses, newPulse],
      };
    });
  }, []);

  // Remove a pulse
  const removePulse = useCallback((pulseId: string) => {
    setSessionData(prev => ({
      ...prev,
      pulses: prev.pulses.filter(p => p.pulseId !== pulseId),
    }));
  }, []);

  // Add a contradiction warning
  const addContradiction = useCallback((warning: string) => {
    setSessionData(prev => {
      // Avoid duplicates
      if (prev.contradictions.some(c => c.warning === warning)) {
        return prev;
      }

      return {
        ...prev,
        contradictions: [...prev.contradictions, { warning, detectedAt: Date.now() }],
      };
    });
  }, []);

  // Add a clinical note
  const addNote = useCallback((note: string) => {
    setSessionData(prev => ({
      ...prev,
      notes: [...prev.notes, note],
    }));
  }, []);

  // Generate the final report
  const generateFinalReport = useCallback((): FinalReport => {
    const { pulses, protocolPoints, contradictions, sessionStartedAt } = sessionData;

    // Build pulse analysis
    const pulseAnalysis = pulses.map(pulse => ({
      finding: pulse.finding?.finding || pulse.pulseName,
      chineseName: pulse.chineseName,
      tcmPattern: pulse.finding?.tcmPattern || 'לא זוהה דפוס',
      aiReasoning: pulse.aiReasoning,
    }));

    // Build acupuncture protocol
    const acupunctureProtocol = protocolPoints.map(point => ({
      code: point.code,
      hebrewName: point.technicalInfo?.hebrewName || point.code,
      depth: point.technicalInfo 
        ? `${point.technicalInfo.depth.min}-${point.technicalInfo.depth.max} ${point.technicalInfo.depth.unit}`
        : 'N/A',
      angle: point.technicalInfo?.angleHebrew || 'N/A',
      clinicalAction: point.technicalInfo?.clinicalActionHebrew || '',
    }));

    // Clinical precautions
    const clinicalPrecautions = contradictions.map(c => c.warning);

    // Add contraindications from points
    protocolPoints.forEach(point => {
      if (point.technicalInfo?.contraindications) {
        point.technicalInfo.contraindications.forEach(ci => {
          if (!clinicalPrecautions.includes(ci)) {
            clinicalPrecautions.push(`⚠️ ${point.code}: ${ci}`);
          }
        });
      }
    });

    // Generate Hebrew summary
    const hebrewSummary = generateHebrewSummary(pulseAnalysis, acupunctureProtocol, clinicalPrecautions);

    return {
      pulseAnalysis,
      acupunctureProtocol,
      clinicalPrecautions,
      hebrewSummary,
      generatedAt: new Date().toISOString(),
    };
  }, [sessionData]);

  // Get counts for UI display
  const counts = useMemo(() => ({
    pulseCount: sessionData.pulses.length,
    pointCount: sessionData.protocolPoints.length,
    contradictionCount: sessionData.contradictions.length,
  }), [sessionData]);

  // Check if session has data
  const hasData = useMemo(() => 
    sessionData.pulses.length > 0 || sessionData.protocolPoints.length > 0,
    [sessionData]
  );

  // Reset session
  const resetSession = useCallback(() => {
    setSessionData({
      pulses: [],
      protocolPoints: [],
      contradictions: [],
      sessionStartedAt: Date.now(),
      notes: [],
    });
  }, []);

  return {
    sessionData,
    counts,
    hasData,
    addProtocolPoint,
    addSparklePoints,
    removeProtocolPoint,
    addPulse,
    removePulse,
    addContradiction,
    addNote,
    generateFinalReport,
    resetSession,
  };
}

// Helper function to generate Hebrew clinical summary
function generateHebrewSummary(
  pulseAnalysis: { finding: string; chineseName: string; tcmPattern: string; aiReasoning?: string }[],
  acupunctureProtocol: { code: string; hebrewName: string; depth: string; angle: string; clinicalAction: string }[],
  clinicalPrecautions: string[]
): string {
  const lines: string[] = [];
  
  lines.push('📋 סיכום טיפול קליני');
  lines.push('═══════════════════════');
  lines.push('');

  // Pulse section
  if (pulseAnalysis.length > 0) {
    lines.push('🩺 ממצאי דופק:');
    pulseAnalysis.forEach(pulse => {
      lines.push(`• ${pulse.finding} (${pulse.chineseName})`);
      lines.push(`  דפוס: ${pulse.tcmPattern}`);
      if (pulse.aiReasoning) {
        lines.push(`  נימוק: ${pulse.aiReasoning}`);
      }
    });
    lines.push('');
  }

  // Protocol section
  if (acupunctureProtocol.length > 0) {
    lines.push('📍 פרוטוקול דיקור:');
    acupunctureProtocol.forEach(point => {
      lines.push(`• ${point.code} - ${point.hebrewName}`);
      lines.push(`  עומק: ${point.depth} | זווית: ${point.angle}`);
      if (point.clinicalAction) {
        lines.push(`  פעולה: ${point.clinicalAction}`);
      }
    });
    lines.push('');
  }

  // Precautions section
  if (clinicalPrecautions.length > 0) {
    lines.push('⚠️ אזהרות קליניות:');
    clinicalPrecautions.forEach(warning => {
      lines.push(`• ${warning}`);
    });
    lines.push('');
  }

  lines.push('═══════════════════════');
  lines.push(`נוצר: ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}`);

  return lines.join('\n');
}
