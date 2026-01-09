import { useState, useEffect } from 'react';
import { BodyFigureSelector } from '@/components/acupuncture/BodyFigureSelector';
import { RAGBodyFigureDisplay } from '@/components/acupuncture/RAGBodyFigureDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MapPin, Brain, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BodyMapTabProps {
  highlightedPoints: string[];
  aiResponseText?: string;
  streamChat: (message: string) => void;
  onTabChange: (tab: string) => void;
  onClearPoints?: () => void;
}

export function BodyMapTab({ highlightedPoints, aiResponseText = '', streamChat, onTabChange, onClearPoints }: BodyMapTabProps) {
  // Always default to browse if no AI points, switch to ai when points available
  const [viewMode, setViewMode] = useState<'ai' | 'browse'>('browse');
  
  // Auto-switch to AI tab when points become available
  useEffect(() => {
    if (highlightedPoints.length > 0) {
      setViewMode('ai');
    }
  }, [highlightedPoints.length]);

  const handleGenerateProtocol = (points: string[]) => {
    const prompt = `Generate a detailed TCM treatment protocol for the following acupuncture points: ${points.join(', ')}. 

Include:
1. Treatment principle and therapeutic goal
2. Point combination analysis - why these points work together
3. Needling technique recommendations (depth, angle, stimulation)
4. Order of point insertion
5. Recommended needle retention time
6. Contraindications and precautions
7. Expected therapeutic effects
8. Complementary techniques (moxa, cupping, electroacupuncture if applicable)
9. Treatment frequency and course recommendation`;
    
    streamChat(prompt);
    onTabChange('diagnostics');
  };

  const hasAIContent = highlightedPoints.length > 0 || aiResponseText.length > 0;

  const handleClearPoints = () => {
    onClearPoints?.();
    toast.success('Points cleared', { duration: 2000 });
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'ai' | 'browse')} className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Suggested
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <MapPin className="h-4 w-4" />
              Browse All
            </TabsTrigger>
          </TabsList>
          {highlightedPoints.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearPoints}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              Clear {highlightedPoints.length} point{highlightedPoints.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>

        <TabsContent value="ai" className="mt-4">
          {hasAIContent ? (
            <RAGBodyFigureDisplay
              pointCodes={highlightedPoints}
              aiResponseText={aiResponseText}
              onGenerateProtocol={handleGenerateProtocol}
              allowSelection={true}
              enableNarration={false}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No AI suggestions yet</p>
              <p className="text-sm">
                Ask TCM Brain about a condition or treatment to see relevant body figures with point markers.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="mt-4">
          <BodyFigureSelector 
            highlightedPoints={highlightedPoints} 
            onGenerateProtocol={handleGenerateProtocol}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
