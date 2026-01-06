import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle, Sun, User } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useCreateAssessment } from '@/hooks/usePatientAssessments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Question {
  id: string;
  textHe: string;
  textEn: string;
  category: string;
}

const questions: Question[] = [
  {
    id: 'cognitive',
    textHe: 'האם את/ה מרגיש/ה שאת/ה מאתגר/ת את המוח שלך ביומיום (קריאה, תשבצים, לימוד דברים חדשים), או מרגיש/ה ירידה בחדות?',
    textEn: 'Do you feel you challenge your brain daily (reading, puzzles, learning new things), or do you feel a decline in sharpness?',
    category: 'Cognitive'
  },
  {
    id: 'emotional',
    textHe: 'האם את/ה קם/ה בבוקר עם תחושת מטרה ועניין, או שאת/ה חווה תחושות של ריקנות ושעמום?',
    textEn: 'Do you wake up in the morning with a sense of purpose and interest, or do you experience feelings of emptiness and boredom?',
    category: 'Emotional'
  },
  {
    id: 'social',
    textHe: 'באיזו תדירות את/ה נפגש/ת עם חברים או משפחה? האם את/ה מרגיש/ה בודד/ה לעיתים קרובות?',
    textEn: 'How often do you meet with friends or family? Do you often feel lonely?',
    category: 'Social'
  },
  {
    id: 'mobility_falls',
    textHe: 'האם את/ה מרגיש/ה בטוח/ה ביציבות ובהליכה שלך, או שיש לך חשש מנפילות?',
    textEn: 'Do you feel confident in your stability and walking, or do you have concerns about falling?',
    category: 'Mobility (Falls)'
  },
  {
    id: 'sleep',
    textHe: 'האם שנת הלילה שלך רציפה ומרעננת, או שאת/ה מסתמך/ת על כדורי שינה כדי להירדם?',
    textEn: 'Is your night sleep continuous and refreshing, or do you rely on sleeping pills to fall asleep?',
    category: 'Sleep'
  },
  {
    id: 'appetite',
    textHe: 'האם התיאבון שלך בריא ואת/ה נהנה/ית מאוכל, או שאת/ה אוכל/ת רק כי "צריך"?',
    textEn: 'Is your appetite healthy and do you enjoy food, or do you eat only because you "have to"?',
    category: 'Appetite'
  },
  {
    id: 'family',
    textHe: 'כיצד היית מתאר/ת את היחסים עם הילדים/נכדים? האם הם מקור לשמחה או לדאגה ומתח?',
    textEn: 'How would you describe your relationship with children/grandchildren? Are they a source of joy or worry and stress?',
    category: 'Family'
  },
  {
    id: 'technology',
    textHe: 'האם השימוש בטכנולוגיה (סמארטפון, מחשב) גורם לך לתסכול וחרדה, או שאת/ה מסתדר/ת איתו בנוחות?',
    textEn: 'Does using technology (smartphone, computer) cause you frustration and anxiety, or do you manage it comfortably?',
    category: 'Technology'
  },
  {
    id: 'energy_adl',
    textHe: 'האם יש לך מספיק אנרגיה לבצע את כל הפעולות היומיומיות שחשובות לך (קניות, בישול, תחביבים)?',
    textEn: 'Do you have enough energy to perform all daily activities important to you (shopping, cooking, hobbies)?',
    category: 'Energy (ADL)'
  },
  {
    id: 'pain_function',
    textHe: 'האם כאבים כרוניים (ברכיים, גב) מונעים ממך לצאת מהבית או להשתתף בפעילויות חברתיות?',
    textEn: 'Do chronic pains (knees, back) prevent you from leaving home or participating in social activities?',
    category: 'Pain & Function'
  },
  {
    id: 'financial_stress',
    textHe: 'האם דאגות כלכליות מטרידות את מנוחתך ומשפיעות על מצב הרוח שלך?',
    textEn: 'Do financial worries disturb your peace and affect your mood?',
    category: 'Financial Stress'
  },
  {
    id: 'senses',
    textHe: 'האם ירידה בשמיעה או בראייה גורמת לך להימנע משיחות או ממפגשים חברתיים?',
    textEn: 'Does decline in hearing or vision cause you to avoid conversations or social gatherings?',
    category: 'Senses'
  },
  {
    id: 'meds',
    textHe: 'האם את/ה מרגיש/ה עומס מריבוי התרופות שאת/ה נוטל/ת? האם יש תופעות לוואי שמפריעות לך?',
    textEn: 'Do you feel burdened by the multiple medications you take? Are there side effects that bother you?',
    category: 'Meds'
  },
  {
    id: 'outlook',
    textHe: 'האם את/ה מצפה לעתיד באופטימיות ויש לך תוכניות שאת/ה מחכה להן?',
    textEn: 'Do you look forward to the future optimistically and have plans you are waiting for?',
    category: 'Outlook'
  },
  {
    id: 'the_goal',
    textHe: 'מהו הדבר האחד שתרצה/י לשפר כדי ליהנות יותר מהתקופה הזו בחייך (למשל: יותר עצמאות, פחות כאב, יותר חברה)?',
    textEn: 'What is the one thing you would like to improve to enjoy this period of your life more (e.g., more independence, less pain, more companionship)?',
    category: 'The Goal'
  }
];

export default function GoldenAgeVitalityQuestionnaire() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  
  const { data: patients = [] } = usePatients();
  const createAssessment = useCreateAssessment();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast.error('נא לבחור מטופל');
      return;
    }

    try {
      await createAssessment.mutateAsync({
        patient_id: selectedPatientId,
        assessment_type: 'golden_age_vitality',
        details: { answers, questionnaire_version: '1.0' },
        summary: `Golden Age Vitality Assessment - ${Object.keys(answers).length} questions answered`,
        status: 'completed'
      });
      
      toast.success('השאלון נשמר בהצלחה!');
      navigate(-1);
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast.error('שגיאה בשמירת השאלון');
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-500/5 p-4 md:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sun className="w-10 h-10 text-amber-500" />
            <h1 className="text-3xl font-bold text-foreground">חיוניות גיל הזהב</h1>
          </div>
          <p className="text-muted-foreground text-lg">סקר איכות חיים ועצמאות | Golden Age Vitality</p>
        </motion.div>

        {/* Patient Selection */}
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Card className="border-amber-500/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-amber-500" />
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="בחר מטופל..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Bar */}
        {!isComplete && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>שאלה {currentQuestion + 1} מתוך {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-amber-500/20">
                <CardHeader>
                  <div className="text-sm font-medium text-amber-600 mb-2">
                    {currentQ.category}
                  </div>
                  <CardTitle className="text-xl leading-relaxed text-foreground">
                    {currentQ.textHe}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2 italic" dir="ltr">
                    {currentQ.textEn}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="הקלד/י את תשובתך כאן..."
                    className="min-h-[120px] text-lg"
                    dir="rtl"
                  />

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={currentQuestion === 0}
                      className="gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      הקודם
                    </Button>
                    <Button
                      onClick={nextQuestion}
                      className="gap-2 bg-amber-500 hover:bg-amber-600"
                    >
                      {currentQuestion === questions.length - 1 ? 'סיום' : 'הבא'}
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="shadow-lg border-amber-500/20">
                <CardContent className="py-12">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    השאלון הושלם!
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    נענו {Object.keys(answers).filter(k => answers[k]).length} מתוך {questions.length} שאלות
                  </p>
                  
                  {!selectedPatientId && (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-2">בחר מטופל לשמירה:</p>
                      <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                        <SelectTrigger className="max-w-xs mx-auto">
                          <SelectValue placeholder="בחר מטופל..." />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map(patient => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setIsComplete(false)}
                    >
                      חזרה לעריכה
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={createAssessment.isPending || !selectedPatientId}
                      className="gap-2 bg-amber-500 hover:bg-amber-600"
                    >
                      {createAssessment.isPending ? 'שומר...' : 'שמור תוצאות'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
