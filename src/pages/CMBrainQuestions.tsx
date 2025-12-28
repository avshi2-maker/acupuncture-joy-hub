import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  Leaf, 
  Brain, 
  Search, 
  FileText, 
  ClipboardList, 
  Pill,
  Send
} from 'lucide-react';
import { TierBadge } from '@/components/layout/TierBadge';
import { useTier } from '@/hooks/useTier';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Symptom Analysis Questions (50)
const symptomQuestions = [
  { id: 's1', question: 'Any allergies present?', category: 'Medical' },
  { id: 's2', question: 'Any anxiety or excessive worry?', category: 'Emotions' },
  { id: 's3', question: 'Any back pain present?', category: 'Body' },
  { id: 's4', question: 'Any bloating or swelling?', category: 'Body' },
  { id: 's5', question: 'Any chronic fatigue present?', category: 'Energy' },
  { id: 's6', question: 'Any cold extremities?', category: 'Heat/Cold' },
  { id: 's7', question: 'Any constipation or diarrhea?', category: 'Digestion' },
  { id: 's8', question: 'Any depression symptoms?', category: 'Emotions' },
  { id: 's9', question: 'Any difficulty falling asleep?', category: 'Sleep' },
  { id: 's10', question: 'Any discharge present? (women)', category: 'Women' },
  { id: 's11', question: 'Any dizziness or vertigo?', category: 'Head' },
  { id: 's12', question: 'Any excessive dreams?', category: 'Sleep' },
  { id: 's13', question: 'Any excessive sweating?', category: 'Heat/Cold' },
  { id: 's14', question: 'Any excessive thirst?', category: 'Digestion' },
  { id: 's15', question: 'Any feeling of cold?', category: 'Heat/Cold' },
  { id: 's16', question: 'Any fever or heat sensation?', category: 'Heat/Cold' },
  { id: 's17', question: 'Any headaches present?', category: 'Head' },
  { id: 's18', question: 'Any irritability present?', category: 'Emotions' },
  { id: 's19', question: 'Any joint pain?', category: 'Body' },
  { id: 's20', question: 'Any menstrual cycle issues? (women)', category: 'Women' },
  { id: 's21', question: 'Any menstrual pain? (women)', category: 'Women' },
  { id: 's22', question: 'Any nausea present?', category: 'Digestion' },
  { id: 's23', question: 'Any night wakings?', category: 'Sleep' },
  { id: 's24', question: 'Any pain during urination?', category: 'Urination' },
  { id: 's25', question: 'Any pain present? Where?', category: 'Pain' },
  { id: 's26', question: 'Any physical exercise routine?', category: 'Lifestyle' },
  { id: 's27', question: 'Any pre-existing conditions?', category: 'Medical' },
  { id: 's28', question: 'Any skin problems?', category: 'Body' },
  { id: 's29', question: 'Any tinnitus or ear ringing?', category: 'Head' },
  { id: 's30', question: 'Any vision problems?', category: 'Head' },
  { id: 's31', question: 'Current emotional state?', category: 'Emotions' },
  { id: 's32', question: 'Current medication use?', category: 'Medical' },
  { id: 's33', question: 'Current stress level?', category: 'Lifestyle' },
  { id: 's34', question: 'Eating habits and patterns?', category: 'Lifestyle' },
  { id: 's35', question: 'How is the appetite?', category: 'Digestion' },
  { id: 's36', question: 'Is the pain constant or intermittent?', category: 'Pain' },
  { id: 's37', question: 'Pain character? (sharp, dull, stabbing)', category: 'Pain' },
  { id: 's38', question: 'Pulse quality? (fast, slow, weak)', category: 'Diagnosis' },
  { id: 's39', question: 'Sleep quality assessment?', category: 'Sleep' },
  { id: 's40', question: 'Stool frequency and quality?', category: 'Digestion' },
  { id: 's41', question: 'Tongue condition? (color, coating)', category: 'Diagnosis' },
  { id: 's42', question: 'Urination frequency?', category: 'Urination' },
  { id: 's43', question: 'Urine color assessment?', category: 'Urination' },
  { id: 's44', question: 'What aggravates the pain?', category: 'Pain' },
  { id: 's45', question: 'What is the energy level?', category: 'Energy' },
  { id: 's46', question: 'What is the main symptom?', category: 'General' },
  { id: 's47', question: 'What relieves the pain?', category: 'Pain' },
  { id: 's48', question: 'What time of day is fatigue worse?', category: 'Energy' },
  { id: 's49', question: 'When did symptoms begin?', category: 'General' },
  { id: 's50', question: 'Where is the headache located?', category: 'Head' },
];

// Diagnosis Questions (50)
const diagnosisQuestions = [
  { id: 'd1', question: 'Any Blood deficiency present?', category: 'Qi/Blood' },
  { id: 'd2', question: 'Any Blood stagnation?', category: 'Qi/Blood' },
  { id: 'd3', question: 'Any Cold pathogen present?', category: 'Pathogens' },
  { id: 'd4', question: 'Any Dampness pathogen?', category: 'Pathogens' },
  { id: 'd5', question: 'Any Heat pathogen present?', category: 'Pathogens' },
  { id: 'd6', question: 'Any Phlegm accumulation?', category: 'Pathogens' },
  { id: 'd7', question: 'Any Qi deficiency present?', category: 'Qi/Blood' },
  { id: 'd8', question: 'Any Qi stagnation?', category: 'Qi/Blood' },
  { id: 'd9', question: 'Any Wind pathogen?', category: 'Pathogens' },
  { id: 'd10', question: 'Any Yang deficiency?', category: 'Yin/Yang' },
  { id: 'd11', question: 'Any Yang excess?', category: 'Yin/Yang' },
  { id: 'd12', question: 'Any Yin deficiency?', category: 'Yin/Yang' },
  { id: 'd13', question: 'Condition severity level?', category: 'Assessment' },
  { id: 'd14', question: 'Deficiency or excess pattern?', category: 'Pattern' },
  { id: 'd15', question: 'Heat or Cold pattern?', category: 'Pattern' },
  { id: 'd16', question: 'Is condition acute or chronic?', category: 'Assessment' },
  { id: 'd17', question: 'Moisture or Dryness pattern?', category: 'Pattern' },
  { id: 'd18', question: 'What is Heart condition?', category: 'Organs' },
  { id: 'd19', question: 'What is Kidney condition?', category: 'Organs' },
  { id: 'd20', question: 'What is Liver condition?', category: 'Organs' },
  { id: 'd21', question: 'What is Lung condition?', category: 'Organs' },
  { id: 'd22', question: 'What is Spleen condition?', category: 'Organs' },
  { id: 'd23', question: 'What is the main imbalance pattern?', category: 'Pattern' },
  { id: 'd24', question: 'What is the treatment principle?', category: 'Treatment' },
  { id: 'd25', question: 'Which meridian is involved?', category: 'Meridians' },
  { id: 'd26', question: 'Which organ is primarily affected?', category: 'Organs' },
  { id: 'd27', question: 'Upper, Middle or Lower Jiao affected?', category: 'Jiao' },
  { id: 'd28', question: 'Interior or Exterior syndrome?', category: 'Pattern' },
  { id: 'd29', question: 'Shaoyang syndrome present?', category: 'Six Stages' },
  { id: 'd30', question: 'Taiyang syndrome present?', category: 'Six Stages' },
  { id: 'd31', question: 'Yangming syndrome present?', category: 'Six Stages' },
  { id: 'd32', question: 'Taiyin syndrome present?', category: 'Six Stages' },
  { id: 'd33', question: 'Shaoyin syndrome present?', category: 'Six Stages' },
  { id: 'd34', question: 'Jueyin syndrome present?', category: 'Six Stages' },
  { id: 'd35', question: 'Wei Qi level involvement?', category: 'Four Levels' },
  { id: 'd36', question: 'Qi level involvement?', category: 'Four Levels' },
  { id: 'd37', question: 'Ying level involvement?', category: 'Four Levels' },
  { id: 'd38', question: 'Blood level involvement?', category: 'Four Levels' },
  { id: 'd39', question: 'San Jiao pattern identification?', category: 'San Jiao' },
  { id: 'd40', question: 'Zang-Fu organ syndrome?', category: 'Organs' },
  { id: 'd41', question: 'Channel and collateral syndrome?', category: 'Meridians' },
  { id: 'd42', question: 'Five Element imbalance?', category: 'Elements' },
  { id: 'd43', question: 'Constitutional type assessment?', category: 'Constitution' },
  { id: 'd44', question: 'Tongue body color interpretation?', category: 'Tongue' },
  { id: 'd45', question: 'Tongue coating analysis?', category: 'Tongue' },
  { id: 'd46', question: 'Pulse rate interpretation?', category: 'Pulse' },
  { id: 'd47', question: 'Pulse quality interpretation?', category: 'Pulse' },
  { id: 'd48', question: 'Pulse depth interpretation?', category: 'Pulse' },
  { id: 'd49', question: 'Face diagnosis findings?', category: 'Observation' },
  { id: 'd50', question: 'Voice and odor assessment?', category: 'Observation' },
];

// Treatment Questions (50)
const treatmentQuestions = [
  { id: 't1', question: 'Any additional tests needed?', category: 'Planning' },
  { id: 't2', question: 'Any breathing exercises recommended?', category: 'Practice' },
  { id: 't3', question: 'Any circadian rhythm considerations?', category: 'Seasonal' },
  { id: 't4', question: 'Any contraindications present?', category: 'Herbs' },
  { id: 't5', question: 'Any crystal therapy use?', category: 'Complementary' },
  { id: 't6', question: 'Any ear points recommended?', category: 'Ear' },
  { id: 't7', question: 'Any ear seed application?', category: 'Ear' },
  { id: 't8', question: 'Any emotional treatment needed?', category: 'Emotional' },
  { id: 't9', question: 'Any essential oil use?', category: 'Complementary' },
  { id: 't10', question: 'Any exercise recommendations?', category: 'Lifestyle' },
  { id: 't11', question: 'Any foods to add?', category: 'Nutrition' },
  { id: 't12', question: 'Any foods to avoid?', category: 'Nutrition' },
  { id: 't13', question: 'Any meditation recommendations?', category: 'Emotional' },
  { id: 't14', question: 'Any possible reactions?', category: 'Safety' },
  { id: 't15', question: 'Any preventive treatment available?', category: 'Prevention' },
  { id: 't16', question: 'Any Qi Gong exercises recommended?', category: 'Practice' },
  { id: 't17', question: 'Any reflexology recommendations?', category: 'Reflexology' },
  { id: 't18', question: 'Any safety precautions?', category: 'Safety' },
  { id: 't19', question: 'Any scalp points recommended?', category: 'Scalp' },
  { id: 't20', question: 'Any sleep recommendations?', category: 'Lifestyle' },
  { id: 't21', question: 'Any stress management tips?', category: 'Lifestyle' },
  { id: 't22', question: 'Any stretching exercises recommended?', category: 'Practice' },
  { id: 't23', question: 'Any Tai Chi recommendations?', category: 'Practice' },
  { id: 't24', question: 'Any tea or soup recommendations?', category: 'Nutrition' },
  { id: 't25', question: 'Expected treatment duration?', category: 'Planning' },
  { id: 't26', question: 'Five Element approach recommended?', category: 'Elements' },
  { id: 't27', question: 'How many acupuncture sessions needed?', category: 'Acupuncture' },
  { id: 't28', question: 'How long to take herbs?', category: 'Herbs' },
  { id: 't29', question: 'Lifestyle recommendations?', category: 'Lifestyle' },
  { id: 't30', question: 'Nutrition recommendations?', category: 'Nutrition' },
  { id: 't31', question: 'Recommended herb dosage?', category: 'Herbs' },
  { id: 't32', question: 'Recommended herbal formula?', category: 'Herbs' },
  { id: 't33', question: 'Seasonal treatment recommended?', category: 'Seasonal' },
  { id: 't34', question: 'Should cupping be used?', category: 'Techniques' },
  { id: 't35', question: 'Should electro-acupuncture be used?', category: 'Techniques' },
  { id: 't36', question: 'Should Gua Sha be used?', category: 'Techniques' },
  { id: 't37', question: 'Should moxibustion be used?', category: 'Techniques' },
  { id: 't38', question: 'Signs of expected improvement?', category: 'Planning' },
  { id: 't39', question: 'Tonify or disperse approach?', category: 'Principles' },
  { id: 't40', question: 'Treatment frequency recommended?', category: 'Acupuncture' },
  { id: 't41', question: 'Warm or cool approach?', category: 'Principles' },
  { id: 't42', question: 'What acupuncture points recommended?', category: 'Acupuncture' },
  { id: 't43', question: 'What acupuncture technique to use?', category: 'Acupuncture' },
  { id: 't44', question: 'What element to calm?', category: 'Elements' },
  { id: 't45', question: 'What element to strengthen?', category: 'Elements' },
  { id: 't46', question: 'What is the main treatment principle?', category: 'Principles' },
  { id: 't47', question: 'What is the prognosis?', category: 'Prognosis' },
  { id: 't48', question: 'When to follow up?', category: 'Planning' },
  { id: 't49', question: 'When to refer to physician?', category: 'Safety' },
  { id: 't50', question: 'Moisten or dry approach?', category: 'Principles' },
];

const questionTabs = [
  { id: 'symptoms', label: 'Symptoms (50)', icon: FileText, questions: symptomQuestions, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'diagnosis', label: 'Diagnosis (50)', icon: ClipboardList, questions: diagnosisQuestions, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'treatment', label: 'Treatment (50)', icon: Pill, questions: treatmentQuestions, color: 'bg-green-50 text-green-700 border-green-200' },
];

export default function CMBrainQuestions() {
  const navigate = useNavigate();
  const { tier } = useTier();
  const [activeTab, setActiveTab] = useState('symptoms');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestions = questionTabs.find(t => t.id === activeTab)?.questions || [];
  
  const filteredQuestions = currentQuestions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(filteredQuestions.map(q => q.category))];

  const handleQuestionClick = async (question: string) => {
    setSelectedQuestion(question);
    setIsLoading(true);
    setAiResponse(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('tcm-rag-chat', {
        body: { message: question }
      });
      
      if (error) throw error;
      setAiResponse(data?.response || 'No response received');
    } catch (error) {
      console.error('AI Query error:', error);
      toast.error('Error getting AI response');
    } finally {
      setIsLoading(false);
    }
  };

  if (!tier) {
    navigate('/gate');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>CM Brain Questions | TCM Clinic</title>
        <meta name="description" content="150 TCM questions for symptoms, diagnosis, and treatment" />
      </Helmet>

      <div className="min-h-screen bg-background" dir="rtl">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-jade-light rounded-full flex items-center justify-center">
                <Leaf className="h-5 w-5 text-jade" />
              </div>
              <div>
                <h1 className="font-display text-xl">CM Brain</h1>
                <p className="text-sm text-muted-foreground">150 שאלות מקצועיות</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/video-session" className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  חזרה לפגישה
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/tcm-brain" className="gap-2">
                  <Brain className="h-4 w-4" />
                  CM Brain מלא
                </Link>
              </Button>
              <TierBadge />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש שאלה או קטגוריה..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              {questionTabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {questionTabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Questions List */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <tab.icon className="h-5 w-5" />
                        שאלות {tab.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4">
                          {categories.map(category => (
                            <div key={category}>
                              <Badge variant="outline" className="mb-2">{category}</Badge>
                              <div className="space-y-1">
                                {filteredQuestions
                                  .filter(q => q.category === category)
                                  .map(q => (
                                    <Button
                                      key={q.id}
                                      variant={selectedQuestion === q.question ? 'default' : 'ghost'}
                                      className="w-full justify-start text-right h-auto py-2 px-3"
                                      onClick={() => handleQuestionClick(q.question)}
                                    >
                                      <span className="truncate">{q.question}</span>
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* AI Response */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-jade" />
                        תשובת AI
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        {isLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">מעבד שאלה...</p>
                            </div>
                          </div>
                        ) : selectedQuestion ? (
                          <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="font-medium text-sm">{selectedQuestion}</p>
                            </div>
                            {aiResponse && (
                              <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap">{aiResponse}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>בחר שאלה לקבלת תשובה מה-AI</p>
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </>
  );
}
