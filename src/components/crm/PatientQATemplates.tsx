import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ClipboardList, 
  ChevronDown, 
  ChevronRight,
  MessageSquare,
  Stethoscope,
  CalendarCheck,
  MapPin,
  Lightbulb
} from 'lucide-react';
import { patientQAQuestions, stageLabels, type PatientQuestion } from '@/data/patient-qa-data';

interface PatientQATemplatesProps {
  onQuestionSelect?: (question: PatientQuestion, answer: string) => void;
  className?: string;
}

export function PatientQATemplates({ onQuestionSelect, className }: PatientQATemplatesProps) {
  const [activeStage, setActiveStage] = useState<'before' | 'during' | 'ongoing'>('before');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const stageIcons = {
    before: <ClipboardList className="h-4 w-4" />,
    during: <Stethoscope className="h-4 w-4" />,
    ongoing: <CalendarCheck className="h-4 w-4" />,
  };

  const stageQuestions = patientQAQuestions.filter(q => q.stage === activeStage);
  
  // Group questions by category
  const groupedQuestions = stageQuestions.reduce((acc, q) => {
    const cat = q.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {} as Record<string, PatientQuestion[]>);

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveAnswer = (question: PatientQuestion) => {
    const answer = answers[question.id] || '';
    onQuestionSelect?.(question, answer);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Patient Q&A Templates
        </CardTitle>
        <CardDescription>
          Stage-based questions with treatment suggestions from clinical guidelines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeStage} onValueChange={(v) => setActiveStage(v as typeof activeStage)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="before" className="flex items-center gap-1.5">
              {stageIcons.before}
              <span className="hidden sm:inline">Before</span>
            </TabsTrigger>
            <TabsTrigger value="during" className="flex items-center gap-1.5">
              {stageIcons.during}
              <span className="hidden sm:inline">During</span>
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="flex items-center gap-1.5">
              {stageIcons.ongoing}
              <span className="hidden sm:inline">Ongoing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeStage} className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {Object.entries(groupedQuestions).map(([category, questions]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs">{category}</Badge>
                      <span className="text-xs">({questions.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {questions.map((q) => (
                        <Collapsible
                          key={q.id}
                          open={expandedQuestions.has(q.id)}
                          onOpenChange={() => toggleQuestion(q.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-muted/50"
                            >
                              {expandedQuestions.has(q.id) ? (
                                <ChevronDown className="h-4 w-4 mr-2 shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-2 shrink-0" />
                              )}
                              <span className="text-sm">{q.question}</span>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-9 pr-2 pb-3 space-y-3">
                            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                              <div className="flex items-start gap-1.5 mb-1">
                                <Lightbulb className="h-3 w-3 mt-0.5 text-amber-500" />
                                <span className="font-medium">Notes:</span>
                                <span>{q.notes}</span>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <MapPin className="h-3 w-3 mt-0.5 text-primary" />
                                <span className="font-medium">Treatment:</span>
                                <span>{q.treatmentSuggestions}</span>
                              </div>
                            </div>
                            <Textarea
                              placeholder="Patient's response..."
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              className="min-h-[60px] text-sm"
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSaveAnswer(q)}
                              disabled={!answers[q.id]}
                            >
                              Add to Notes
                            </Button>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
