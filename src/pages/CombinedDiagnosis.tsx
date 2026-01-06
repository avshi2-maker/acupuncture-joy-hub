import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Eye, Activity, Sparkles, ChevronDown, ChevronUp, RefreshCw, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TongueDiagnosisSelect } from '@/components/crm/TongueDiagnosisSelect';
import { PulseDiagnosisSelect } from '@/components/crm/PulseDiagnosisSelect';
import { tongueDiagnosisData, type TongueFinding } from '@/data/tongue-diagnosis-data';
import { pulseDiagnosisData, type PulseFinding } from '@/data/pulse-diagnosis-data';

// TCM Pattern correlation logic
interface CorrelatedPattern {
  pattern: string;
  confidence: 'high' | 'medium' | 'low';
  tongueEvidence: string[];
  pulseEvidence: string[];
  treatmentPrinciple: string;
  clinicalNotes: string;
}

// Extract keywords from TCM patterns for matching
const extractPatternKeywords = (pattern: string): string[] => {
  const keywords = [
    'qi deficiency', 'blood deficiency', 'yin deficiency', 'yang deficiency',
    'heat', 'cold', 'dampness', 'phlegm', 'blood stasis', 'qi stagnation',
    'liver', 'heart', 'spleen', 'lung', 'kidney', 'gallbladder', 'stomach',
    'excess', 'deficiency', 'wind', 'fire', 'dryness', 'exterior', 'interior'
  ];
  
  const lowerPattern = pattern.toLowerCase();
  return keywords.filter(k => lowerPattern.includes(k));
};

// Find correlated TCM patterns between tongue and pulse findings
const findCorrelatedPatterns = (
  tongueFindings: string[],
  pulseFindings: string[]
): CorrelatedPattern[] => {
  const tongueData: TongueFinding[] = [];
  const pulseData: PulseFinding[] = [];

  // Get tongue finding data
  for (const finding of tongueFindings) {
    for (const cat of tongueDiagnosisData) {
      const found = cat.findings.find(f => f.finding === finding);
      if (found) tongueData.push(found);
    }
  }

  // Get pulse finding data
  for (const finding of pulseFindings) {
    for (const cat of pulseDiagnosisData) {
      const found = cat.findings.find(f => f.finding === finding);
      if (found) pulseData.push(found);
    }
  }

  // Extract all pattern keywords from both sources
  const tonguePatterns = new Map<string, TongueFinding[]>();
  const pulsePatterns = new Map<string, PulseFinding[]>();

  for (const t of tongueData) {
    const keywords = extractPatternKeywords(t.tcmPattern);
    for (const k of keywords) {
      if (!tonguePatterns.has(k)) tonguePatterns.set(k, []);
      tonguePatterns.get(k)!.push(t);
    }
  }

  for (const p of pulseData) {
    const keywords = extractPatternKeywords(p.tcmPattern);
    for (const k of keywords) {
      if (!pulsePatterns.has(k)) pulsePatterns.set(k, []);
      pulsePatterns.get(k)!.push(p);
    }
  }

  // Find overlapping patterns
  const correlatedPatterns: CorrelatedPattern[] = [];
  const processedPatterns = new Set<string>();

  for (const [pattern, tongueEvidence] of tonguePatterns) {
    if (pulsePatterns.has(pattern) && !processedPatterns.has(pattern)) {
      const pulseEvidence = pulsePatterns.get(pattern)!;
      processedPatterns.add(pattern);

      // Calculate confidence based on number of confirming findings
      const totalEvidence = tongueEvidence.length + pulseEvidence.length;
      let confidence: 'high' | 'medium' | 'low' = 'low';
      if (totalEvidence >= 4) confidence = 'high';
      else if (totalEvidence >= 2) confidence = 'medium';

      // Combine treatment principles
      const allTreatments = [
        ...tongueEvidence.map(t => t.treatmentPrinciple),
        ...pulseEvidence.map(p => p.treatmentPrinciple)
      ];
      const uniqueTreatments = [...new Set(allTreatments)];

      // Generate clinical notes
      const clinicalNotes = generateClinicalNotes(pattern, tongueEvidence, pulseEvidence);

      correlatedPatterns.push({
        pattern: pattern.charAt(0).toUpperCase() + pattern.slice(1),
        confidence,
        tongueEvidence: tongueEvidence.map(t => t.finding),
        pulseEvidence: pulseEvidence.map(p => p.finding),
        treatmentPrinciple: uniqueTreatments.join('; '),
        clinicalNotes
      });
    }
  }

  // Sort by confidence
  return correlatedPatterns.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
};

const generateClinicalNotes = (
  pattern: string,
  tongueEvidence: TongueFinding[],
  pulseEvidence: PulseFinding[]
): string => {
  const notes: string[] = [];
  
  if (pattern.includes('deficiency')) {
    notes.push('Consider tonifying approach with gentle nourishing formulas.');
  }
  if (pattern.includes('heat')) {
    notes.push('Clearing heat methods may be indicated. Monitor for fluid damage.');
  }
  if (pattern.includes('cold')) {
    notes.push('Warming methods recommended. Use moxibustion as adjunct therapy.');
  }
  if (pattern.includes('dampness') || pattern.includes('phlegm')) {
    notes.push('Transform dampness/phlegm. Dietary modification essential.');
  }
  if (pattern.includes('stasis') || pattern.includes('stagnation')) {
    notes.push('Move and invigorate. Consider emotional factors in treatment.');
  }

  if (tongueEvidence.length > 0 && pulseEvidence.length > 0) {
    notes.push('Strong correlation between tongue and pulse confirms pattern differentiation.');
  }

  return notes.join(' ') || 'Standard treatment based on identified pattern.';
};

export default function CombinedDiagnosis() {
  const [tongueFindings, setTongueFindings] = useState<string[]>([]);
  const [pulseFindings, setPulseFindings] = useState<string[]>([]);
  const [showAllPatterns, setShowAllPatterns] = useState(false);

  const correlatedPatterns = useMemo(() => {
    if (tongueFindings.length === 0 && pulseFindings.length === 0) return [];
    return findCorrelatedPatterns(tongueFindings, pulseFindings);
  }, [tongueFindings, pulseFindings]);

  const displayedPatterns = showAllPatterns 
    ? correlatedPatterns 
    : correlatedPatterns.slice(0, 5);

  const handleReset = () => {
    setTongueFindings([]);
    setPulseFindings([]);
  };

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <>
      <Helmet>
        <title>Combined Tongue & Pulse Diagnosis | TCM Pattern Correlation</title>
        <meta name="description" content="Comprehensive TCM diagnostic tool correlating tongue and pulse findings for accurate pattern identification and treatment planning." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Combined Diagnosis
                </h1>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Correlation
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Correlate tongue and pulse findings for comprehensive TCM pattern identification
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Input Selection */}
            <div className="space-y-6">
              {/* Tongue Diagnosis Card */}
              <Card className="border-rose-200/50 dark:border-rose-900/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                      <Eye className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Tongue Findings</CardTitle>
                      <CardDescription>Select observed tongue characteristics</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TongueDiagnosisSelect 
                    value={tongueFindings} 
                    onChange={setTongueFindings}
                    maxSelections={8}
                  />
                </CardContent>
              </Card>

              {/* Pulse Diagnosis Card */}
              <Card className="border-blue-200/50 dark:border-blue-900/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Pulse Findings</CardTitle>
                      <CardDescription>Select observed pulse qualities</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <PulseDiagnosisSelect 
                    value={pulseFindings} 
                    onChange={setPulseFindings}
                    maxSelections={8}
                  />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-rose-600">{tongueFindings.length}</div>
                  <div className="text-xs text-muted-foreground">Tongue Findings</div>
                </Card>
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600">{pulseFindings.length}</div>
                  <div className="text-xs text-muted-foreground">Pulse Findings</div>
                </Card>
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-primary">{correlatedPatterns.length}</div>
                  <div className="text-xs text-muted-foreground">Patterns Found</div>
                </Card>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Correlated Patterns</CardTitle>
                        <CardDescription>TCM patterns supported by both findings</CardDescription>
                      </div>
                    </div>
                    {correlatedPatterns.length > 5 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowAllPatterns(!showAllPatterns)}
                      >
                        {showAllPatterns ? (
                          <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                        ) : (
                          <>Show All ({correlatedPatterns.length}) <ChevronDown className="h-4 w-4 ml-1" /></>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {tongueFindings.length === 0 && pulseFindings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-4 rounded-full bg-muted/50 mb-4">
                        <Brain className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2">No Findings Selected</h3>
                      <p className="text-sm text-muted-foreground max-w-[280px]">
                        Select tongue and pulse findings to see correlated TCM patterns
                      </p>
                    </div>
                  ) : correlatedPatterns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                        <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="font-medium mb-2">No Correlations Found</h3>
                      <p className="text-sm text-muted-foreground max-w-[280px]">
                        The selected findings don't share common TCM patterns. Try selecting additional or different findings.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {displayedPatterns.map((pattern, index) => (
                          <Collapsible key={index}>
                            <Card className="border-l-4" style={{
                              borderLeftColor: pattern.confidence === 'high' ? 'hsl(var(--primary))' : 
                                pattern.confidence === 'medium' ? 'hsl(45, 93%, 47%)' : 'hsl(var(--muted-foreground))'
                            }}>
                              <CollapsibleTrigger className="w-full">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CardTitle className="text-base">{pattern.pattern}</CardTitle>
                                      <Badge 
                                        variant={getConfidenceBadgeVariant(pattern.confidence)}
                                        className={getConfidenceColor(pattern.confidence)}
                                      >
                                        {pattern.confidence} confidence
                                      </Badge>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="pt-0 space-y-4">
                                  <Separator />
                                  
                                  {/* Evidence */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <Eye className="h-3.5 w-3.5 text-rose-500" />
                                        <span className="text-xs font-medium text-muted-foreground">Tongue Evidence</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {pattern.tongueEvidence.map((e, i) => (
                                          <Badge key={i} variant="outline" className="text-xs bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
                                            {e.length > 25 ? e.substring(0, 25) + '...' : e}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <Activity className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-xs font-medium text-muted-foreground">Pulse Evidence</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {pattern.pulseEvidence.map((e, i) => (
                                          <Badge key={i} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                            {e.length > 25 ? e.substring(0, 25) + '...' : e}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Treatment */}
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                                      <span className="text-xs font-medium text-muted-foreground">Treatment Principle</span>
                                    </div>
                                    <p className="text-sm">{pattern.treatmentPrinciple}</p>
                                  </div>

                                  {/* Clinical Notes */}
                                  <div className="p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                                      <span className="text-xs font-medium">Clinical Notes</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{pattern.clinicalNotes}</p>
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
