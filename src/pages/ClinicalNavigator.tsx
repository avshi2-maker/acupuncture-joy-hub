import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, Activity, TrendingUp, Thermometer, Moon, 
  BookOpen, ChevronRight, ArrowLeft, Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  question_he?: string;
  type: 'open' | 'scale' | 'yesno';
}

interface ClinicalSubject {
  id: string;
  subject_name: string;
  subject_name_he: string | null;
  category: string;
  icon_name: string;
  color: string;
  questions: Question[];
  sort_order: number;
}

const iconMap: Record<string, React.ElementType> = {
  ClipboardList,
  Activity,
  TrendingUp,
  Thermometer,
  Moon,
  BookOpen,
};

const categoryLabels: Record<string, { en: string; he: string }> = {
  intake: { en: 'Intake', he: 'קליטה' },
  session: { en: 'Session', he: 'טיפול' },
  followup: { en: 'Follow-up', he: 'מעקב' },
  diagnostic: { en: 'Diagnostic', he: 'אבחון' },
  lifestyle: { en: 'Lifestyle', he: 'סגנון חיים' },
  general: { en: 'General', he: 'כללי' },
};

export default function ClinicalNavigator() {
  const [selectedSubject, setSelectedSubject] = useState<ClinicalSubject | null>(null);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['clinical-navigator-subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_navigator_subjects')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      // Parse the questions JSON for each subject
      return (data || []).map(item => ({
        ...item,
        questions: (Array.isArray(item.questions) ? item.questions : []) as unknown as Question[],
      })) as ClinicalSubject[];
    },
  });

  const categories = subjects 
    ? ['all', ...new Set(subjects.map(s => s.category))]
    : ['all'];

  const filteredSubjects = subjects?.filter(
    s => activeCategory === 'all' || s.category === activeCategory
  );

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'he' : 'en');
  };

  if (selectedSubject) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSubject(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'en' ? 'Back' : 'חזרה'}
            </Button>
            <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-2">
              <Languages className="h-4 w-4" />
              {language === 'en' ? 'עברית' : 'English'}
            </Button>
          </div>

          <Card>
            <CardHeader 
              className="border-b"
              style={{ borderColor: selectedSubject.color + '40' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: selectedSubject.color + '20' }}
                >
                  {(() => {
                    const IconComponent = iconMap[selectedSubject.icon_name] || BookOpen;
                    return <IconComponent className="h-6 w-6" style={{ color: selectedSubject.color }} />;
                  })()}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {language === 'en' 
                      ? selectedSubject.subject_name 
                      : (selectedSubject.subject_name_he || selectedSubject.subject_name)
                    }
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {categoryLabels[selectedSubject.category]?.[language] || selectedSubject.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="divide-y">
                  {selectedSubject.questions.map((q, index) => (
                    <div 
                      key={q.id} 
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span 
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                          style={{ 
                            backgroundColor: selectedSubject.color + '20',
                            color: selectedSubject.color 
                          }}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-base font-medium">
                            {language === 'en' ? q.question : (q.question_he || q.question)}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {q.type === 'scale' 
                              ? (language === 'en' ? 'Scale 1-10' : 'סולם 1-10')
                              : q.type === 'yesno'
                              ? (language === 'en' ? 'Yes/No' : 'כן/לא')
                              : (language === 'en' ? 'Open Answer' : 'תשובה פתוחה')
                            }
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'en' ? 'Clinical Navigator' : 'ניווט קליני'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Question guides for patient consultations'
                : 'מדריכי שאלות לייעוץ מטופלים'
              }
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-2">
            <Languages className="h-4 w-4" />
            {language === 'en' ? 'עברית' : 'English'}
          </Button>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-sm">
                {cat === 'all' 
                  ? (language === 'en' ? 'All' : 'הכל')
                  : (categoryLabels[cat]?.[language] || cat)
                }
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-12 bg-muted rounded-lg mb-4" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSubjects?.map(subject => {
                  const IconComponent = iconMap[subject.icon_name] || BookOpen;
                  return (
                    <Card 
                      key={subject.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
                        "border-l-4"
                      )}
                      style={{ borderLeftColor: subject.color }}
                      onClick={() => setSelectedSubject(subject)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2.5 rounded-lg"
                              style={{ backgroundColor: subject.color + '20' }}
                            >
                              <IconComponent 
                                className="h-5 w-5" 
                                style={{ color: subject.color }}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {language === 'en' 
                                  ? subject.subject_name 
                                  : (subject.subject_name_he || subject.subject_name)
                                }
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {subject.questions.length} {language === 'en' ? 'questions' : 'שאלות'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
