import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Lightbulb, MessageSquare, Shuffle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Q&A data from patient-qa-knowledge.csv format
const QA_SUGGESTIONS = [
  // Before Treatment
  { stage: 'Before', question: 'What is your primary reason for seeking acupuncture?', hint: 'Chief complaint', treatment: 'Use 6–10 needles; focus on affected meridians' },
  { stage: 'Before', question: 'When did your symptoms begin?', hint: 'Timeline', treatment: 'Choose acute vs chronic protocol' },
  { stage: 'Before', question: 'What makes your symptoms better or worse?', hint: 'Triggers', treatment: 'Target reactive points' },
  { stage: 'Before', question: 'Are you under physician\'s care or other therapies?', hint: 'Coordination', treatment: 'Avoid overlapping modalities' },
  { stage: 'Before', question: 'Do you have allergies, chronic conditions, or surgeries?', hint: 'Safety', treatment: 'Avoid sensitive areas' },
  { stage: 'Before', question: 'What medications or supplements are you taking?', hint: 'Interactions', treatment: 'Avoid conflicting herbs' },
  { stage: 'Before', question: 'How is your sleep, digestion, and energy?', hint: 'Wellness', treatment: 'SP6, ST36, LI4; 8–12 needles' },
  { stage: 'Before', question: 'Do you experience stress, anxiety, or mood swings?', hint: 'Emotional', treatment: 'GV20, HT7, PC6; calming points' },
  { stage: 'Before', question: 'What is your diet and exercise routine?', hint: 'Lifestyle', treatment: 'ST36, CV12; 6–10 needles' },
  { stage: 'Before', question: 'History of trauma (physical/emotional)?', hint: 'Approach', treatment: 'Gentle needling; KD1, ST36' },
  { stage: 'Before', question: 'Regular bowel movements? Any issues?', hint: 'TCM diagnostic', treatment: 'ST25, CV6, SP15; 6–8 needles' },
  { stage: 'Before', question: 'Menstrual cycle regularity and symptoms?', hint: 'Hormonal', treatment: 'SP6, CV4, LV3; cycle-based' },
  { stage: 'Before', question: 'Night sweats, chills, hot flashes?', hint: 'Yin/Yang', treatment: 'KD3, LI11, GV14; 8–10 needles' },
  { stage: 'Before', question: 'Do you dream often? Are they vivid/disturbing?', hint: 'Mental health', treatment: 'HT7, Anmian, PC6' },
  { stage: 'Before', question: 'Time of day you feel most energetic/fatigued?', hint: 'Qi flow', treatment: 'Circadian-based points' },
  { stage: 'Before', question: 'Have you had acupuncture before?', hint: 'Experience', treatment: 'Start with fewer needles if new' },
  { stage: 'Before', question: 'Comfortable with needles and process?', hint: 'Consent', treatment: 'Shallow insertion' },
  
  // During Treatment
  { stage: 'During', question: 'How are you feeling today vs last visit?', hint: 'Progress', treatment: 'Adjust needle count based on feedback' },
  { stage: 'During', question: 'Changes in symptoms?', hint: 'Effectiveness', treatment: 'Reinforce effective points' },
  { stage: 'During', question: 'New concerns or discomforts?', hint: 'Adjustments', treatment: 'Consider cupping or moxa' },
  { stage: 'During', question: 'How did you feel after last treatment?', hint: 'Response', treatment: 'Adjust retention time' },
  { stage: 'During', question: 'Followed aftercare instructions?', hint: 'Compliance', treatment: 'Reinforce hydration and rest' },
  { stage: 'During', question: 'Tingling, heaviness, warmth during needling?', hint: 'De Qi', treatment: 'Adjust depth or technique' },
  { stage: 'During', question: 'Want cupping, moxibustion, or herbs today?', hint: 'Modalities', treatment: 'Add based on condition' },
  { stage: 'During', question: 'Areas to focus more on?', hint: 'Preferences', treatment: 'Prioritize zones' },
  
  // Ongoing Meetings
  { stage: 'Ongoing', question: 'How has your condition evolved?', hint: 'Long-term', treatment: 'Reduce frequency or maintain' },
  { stage: 'Ongoing', question: 'Fewer flare-ups or episodes?', hint: 'Reduction', treatment: 'Consider maintenance plan' },
  { stage: 'Ongoing', question: 'Sleep, mood, energy now?', hint: 'Overall', treatment: 'Adjust points for balance' },
  { stage: 'Ongoing', question: 'Able to perform daily activities more easily?', hint: 'Functional', treatment: 'Reinforce musculoskeletal points' },
  { stage: 'Ongoing', question: 'Lifestyle changes (diet, exercise, stress)?', hint: 'Habits', treatment: 'Encourage supportive points' },
  { stage: 'Ongoing', question: 'Need support with herbs, nutrition, mindfulness?', hint: 'Holistic', treatment: 'Recommend adjunct therapies' },
  { stage: 'Ongoing', question: 'Feel informed and supported?', hint: 'Satisfaction', treatment: 'Offer education' },
  { stage: 'Ongoing', question: 'Want educational materials or wellness tips?', hint: 'Engagement', treatment: 'Provide handouts' },
  { stage: 'Ongoing', question: 'Satisfied with communication style/frequency?', hint: 'Quality', treatment: 'Adjust follow-up method' },
  { stage: 'Ongoing', question: 'Would you recommend acupuncture to others?', hint: 'Feedback', treatment: 'Ask for testimonial' },
];

interface QASuggestionsPanelProps {
  onSelectQuestion: (question: string) => void;
  currentStage?: 'Before' | 'During' | 'Ongoing';
  className?: string;
}

export function QASuggestionsPanel({ 
  onSelectQuestion, 
  currentStage = 'Before',
  className 
}: QASuggestionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStage, setActiveStage] = useState<'Before' | 'During' | 'Ongoing'>(currentStage);
  
  const filteredQuestions = useMemo(() => {
    let questions = QA_SUGGESTIONS.filter(q => q.stage === activeStage);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      questions = questions.filter(q => 
        q.question.toLowerCase().includes(term) || 
        q.hint.toLowerCase().includes(term) ||
        q.treatment.toLowerCase().includes(term)
      );
    }
    return questions;
  }, [activeStage, searchTerm]);

  const getRandomQuestion = () => {
    const questions = QA_SUGGESTIONS.filter(q => q.stage === activeStage);
    const random = questions[Math.floor(Math.random() * questions.length)];
    if (random) onSelectQuestion(random.question);
  };

  const stageColors = {
    Before: 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20',
    During: 'bg-jade/10 text-jade border-jade/30 hover:bg-jade/20',
    Ongoing: 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20',
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className={className}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-between p-3 h-auto bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 hover:from-violet-500/15 hover:to-fuchsia-500/15 border border-violet-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-violet-600">
              Ready-Made Questions
            </span>
            <Badge variant="secondary" className="text-xs bg-violet-500/20 text-violet-600">
              {QA_SUGGESTIONS.length} Q&A
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-violet-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-violet-500" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2 space-y-2">
        {/* Stage Tabs */}
        <div className="flex gap-1 flex-wrap">
          {(['Before', 'During', 'Ongoing'] as const).map((stage) => (
            <Button
              key={stage}
              variant="outline"
              size="sm"
              onClick={() => setActiveStage(stage)}
              className={`text-xs h-7 ${activeStage === stage ? stageColors[stage] : ''}`}
            >
              {stage} Treatment
              <Badge variant="secondary" className="ml-1 text-[10px] h-4">
                {QA_SUGGESTIONS.filter(q => q.stage === stage).length}
              </Badge>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={getRandomQuestion}
            className="text-xs h-7 ml-auto text-violet-600 hover:text-violet-700"
          >
            <Shuffle className="w-3 h-3 mr-1" />
            Random
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-xs pl-7"
          />
        </div>

        {/* Questions List */}
        <ScrollArea className="h-[200px]">
          <div className="space-y-1.5 pr-2">
            {filteredQuestions.map((qa, index) => (
              <button
                key={index}
                onClick={() => onSelectQuestion(qa.question)}
                className="w-full text-left p-2 rounded-md bg-muted/50 hover:bg-violet-500/10 transition-colors group border border-transparent hover:border-violet-500/30"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-3 h-3 mt-1 text-violet-500 opacity-60 group-hover:opacity-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-violet-700 leading-tight">
                      {qa.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-muted-foreground">
                        {qa.hint}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground truncate">
                        → {qa.treatment}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <p className="text-[9px] text-center text-violet-500/70">
          💡 Click any question to send it to the AI assistant
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
