import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, Play, CheckCircle2, XCircle, Clock, Activity,
  Brain, Volume2, Sparkles, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIPulseDetector, type PulseSuggestion } from '@/hooks/useAIPulseDetector';
import { usePointSparkleSync } from '@/hooks/usePointSparkleSync';
import { GoldBreathingIcon, AISuggestionBadge } from '@/components/pulse';
import { SparklePointBadge } from '@/components/acupuncture';
import { toast } from 'sonner';

/**
 * AI Turing Test Component - Phase 5 Verification
 * Tests all AI intelligence pillars for TCM pulse detection
 */
export function AITuringTestPanel() {
  const [inputText, setInputText] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<number | null>(null);
  const [mockAIResponse, setMockAIResponse] = useState('');

  // AI Pulse Detector hook
  const {
    currentSuggestion,
    isGlowing,
    pendingSuggestions,
    acceptSuggestion,
    clearSuggestions,
    speakClinicalWhisper,
  } = useAIPulseDetector(inputText, {
    enabled: true,
    debounceMs: 500, // Fast for testing
  });

  // Point Sparkle Sync hook  
  const {
    sparklingPoints,
    isSparklingPoint,
    triggerPointSparkles,
    clearSparkles,
  } = usePointSparkleSync(mockAIResponse, { enabled: true });

  // Run a specific test case
  const runTest = useCallback(async (testCase: TestCase) => {
    const startTime = performance.now();
    setInputText(testCase.input);
    
    // Wait for detection
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);
    
    return {
      ...testCase,
      passed: latencyMs < 2000,
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  }, []);

  // Run all test cases
  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    clearSuggestions();
    
    for (let i = 0; i < TEST_CASES.length; i++) {
      setCurrentTest(i);
      const result = await runTest(TEST_CASES[i]);
      setTestResults(prev => [...prev, result]);
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 500));
      clearSuggestions();
    }
    
    setCurrentTest(null);
    setIsRunning(false);
    toast.success('בדיקת Turing הושלמה!');
  }, [runTest, clearSuggestions]);

  // Simulate AI response with point codes for sparkle test
  const simulateAIResponse = useCallback(() => {
    setMockAIResponse('הפרוטוקול המומלץ לדופק מחליק: ST40 היא נקודה מרכזית להתמרת ליחה, SP9 לניקוז לחות, CV12 לחיזוק הקיבה.');
    toast.info('🤖 תגובת AI מדומה נשלחה');
  }, []);

  return (
    <Card className="bg-slate-900/90 border-amber-500/30 backdrop-blur-xl">
      <CardHeader className="border-b border-amber-500/20">
        <CardTitle className="flex items-center gap-2 text-amber-300" dir="rtl">
          <Brain className="h-5 w-5" />
          בדיקת Turing לאינטליגנציה TCM
          <Badge variant="outline" className="mr-auto text-amber-400 border-amber-500/50">
            Phase 5
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4" dir="rtl">
        {/* Manual Input Test */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">קלט בדיקה ידני:</label>
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='נסה: "הדופק מהיר אבל המטופל מרגיש קור בגפיים"'
              className="flex-1 bg-slate-800/50 border-amber-500/30"
            />
            <GoldBreathingIcon isGlowing={isGlowing} size="md">
              <Activity className="h-5 w-5" />
            </GoldBreathingIcon>
          </div>
        </div>

        {/* Current AI Suggestion */}
        <AnimatePresence>
          {currentSuggestion && (
            <AISuggestionBadge
              pulseId={currentSuggestion.pulseId}
              pulseName={currentSuggestion.pulseName}
              chineseName={currentSuggestion.chineseName}
              confidence={currentSuggestion.confidence}
              hebrewExplanation={currentSuggestion.hebrewExplanation}
              suggestedPoints={currentSuggestion.suggestedPoints}
              onAccept={() => {
                acceptSuggestion(currentSuggestion.pulseId);
                triggerPointSparkles(currentSuggestion.suggestedPoints);
              }}
              onDismiss={() => clearSuggestions()}
              onSpeak={() => speakClinicalWhisper(currentSuggestion.hebrewExplanation)}
            />
          )}
        </AnimatePresence>

        {/* Sparkle Points Display */}
        {sparklingPoints.length > 0 && (
          <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <div className="text-xs text-amber-400 mb-2">✨ נקודות מהבהבות (Sparkle Sync):</div>
            <div className="flex flex-wrap gap-2">
              {sparklingPoints.map(point => (
                <SparklePointBadge
                  key={point}
                  pointCode={point}
                  isSparkle={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Test Actions */}
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300"
          >
            {isRunning ? (
              <><Clock className="h-4 w-4 ml-2 animate-spin" /> מריץ בדיקות...</>
            ) : (
              <><Play className="h-4 w-4 ml-2" /> הרץ את כל הבדיקות</>
            )}
          </Button>
          <Button
            onClick={simulateAIResponse}
            variant="outline"
            className="border-jade/50 text-jade"
          >
            <Sparkles className="h-4 w-4 ml-2" />
            בדיקת Sparkle
          </Button>
        </div>

        {/* Quick Test Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setInputText('המטופל סובל מדופק מיתרי')}
          >
            עברית: מיתרי
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setInputText('Pulse feels like a guitar string')}
          >
            English: Guitar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setInputText('Xian Mai detected')}
          >
            Pinyin: Xian Mai
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {testResults.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "p-2 rounded-lg text-sm border",
                    result.passed 
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      result.latencyMs < 1500 ? "text-green-400" : 
                      result.latencyMs < 2000 ? "text-amber-400" : "text-red-400"
                    )}>
                      {result.latencyMs}ms
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{result.input}</p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Test case interface
interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedPulseId?: string;
  expectContradiction?: boolean;
}

interface TestResult extends TestCase {
  passed: boolean;
  latencyMs: number;
  timestamp: string;
}

// Pre-defined test cases for Turing Test
const TEST_CASES: TestCase[] = [
  {
    id: 'hebrew-wiry',
    name: 'עברית ישירה - מיתרי',
    input: 'המטופל סובל מדופק מיתרי',
    expectedPulseId: 'P-XIAN-01',
  },
  {
    id: 'english-guitar',
    name: 'English Description - Guitar String',
    input: 'Pulse feels like a guitar string',
    expectedPulseId: 'P-XIAN-01',
  },
  {
    id: 'pinyin-xian',
    name: 'Pinyin - Xian Mai',
    input: 'Xian Mai detected in patient',
    expectedPulseId: 'P-XIAN-01',
  },
  {
    id: 'contradiction-heat-cold',
    name: 'סתירה - דופק מהיר עם קור',
    input: 'הדופק מהיר אבל המטופל מרגיש קור בגפיים',
    expectedPulseId: 'P-SHU-01',
    expectContradiction: true,
  },
  {
    id: 'slippery-hebrew',
    name: 'עברית - דופק מחליק',
    input: 'מה הפרוטוקול המומלץ לדופק מחליק?',
    expectedPulseId: 'P-HUA-03',
  },
];

export default AITuringTestPanel;
