import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Check, Stethoscope } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatients } from '@/hooks/usePatients';
import { useCreateAssessment } from '@/hooks/usePatientAssessments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Question {
  id: string;
  textHe: string;
  textEn: string;
  type: 'text';
}

const questions: Question[] = [
  {
    id: 'kidney_yang_etiology',
    textHe: 'מהי האטיולוגיה (הסיבה) המרכזית לחוסר יאנג בכליות לפי הקובץ?',
    textEn: 'What is the main etiology (cause) of Kidney Yang Deficiency according to the source?',
    type: 'text',
  },
  {
    id: 'spleen_qi_vs_yang',
    textHe: 'אילו סימפטומים מבדילים בין חוסר צ\'י בטחול לבין חוסר יאנג בטחול?',
    textEn: 'What symptoms differentiate Spleen Qi Deficiency from Spleen Yang Deficiency?',
    type: 'text',
  },
  {
    id: 'liver_qi_fire',
    textHe: 'מהו עקרון הטיפול המדויק לסטגנציה של צ\'י הכבד שהפכה לאש?',
    textEn: 'What is the precise treatment principle for Liver Qi Stagnation that transformed into Fire?',
    type: 'text',
  },
  {
    id: 'tinnitus_pattern',
    textHe: 'האם טיניטוס (צפצופים באוזניים) המופיע בקובץ שייך לסינדרום עודף או חוסר?',
    textEn: 'Does tinnitus (ringing in ears) as described belong to an Excess or Deficiency syndrome?',
    type: 'text',
  },
  {
    id: 'heart_blood_sleep',
    textHe: 'מה הקשר בין "חוסר דם בלב" לבין הפרעות שינה לפי הטקסט?',
    textEn: 'What is the connection between "Heart Blood Deficiency" and sleep disorders according to the text?',
    type: 'text',
  },
  {
    id: 'damp_heat_lower',
    textHe: 'כיצד מתבטא "חום ולחות במחמם התחתון" אצל גברים לעומת נשים?',
    textEn: 'How does "Damp-Heat in Lower Jiao" manifest in men versus women?',
    type: 'text',
  },
  {
    id: 'liver_wind_signs',
    textHe: 'מנה שלושה סימני מפתח לזיהוי "רוח פנימית של הכבד".',
    textEn: 'List three key signs for identifying "Internal Liver Wind".',
    type: 'text',
  },
  {
    id: 'phlegm_mist_vs_fire',
    textHe: 'מה ההבדל באבחנה בין ליחה-אל-חומרית (Phlegm-Mist) לבין ליחה-אש בלב?',
    textEn: 'What is the diagnostic difference between Phlegm-Mist and Phlegm-Fire in the Heart?',
    type: 'text',
  },
  {
    id: 'worry_organs',
    textHe: 'כיצד משפיע רגש ה"דאגה" (Worry) על הטחול והריאות לפי המקורות?',
    textEn: 'How does the emotion of "Worry" affect the Spleen and Lungs according to the sources?',
    type: 'text',
  },
  {
    id: 'cold_uterus',
    textHe: 'מהי הפתולוגיה של "קור ברחם" וכיצד היא משפיעה על הפוריות?',
    textEn: 'What is the pathology of "Cold in the Uterus" and how does it affect fertility?',
    type: 'text',
  },
  {
    id: 'qi_sinking',
    textHe: 'ציין את הסימנים הקליניים של "צניחת צ\'י" (Qi Sinking).',
    textEn: 'List the clinical signs of "Qi Sinking".',
    type: 'text',
  },
  {
    id: 'lung_dryness_vs_yin',
    textHe: 'כיצד נבדיל בין יובש בריאות לבין חוסר יין בריאות?',
    textEn: 'How do we differentiate between Lung Dryness and Lung Yin Deficiency?',
    type: 'text',
  },
  {
    id: 'liver_stomach_disharmony',
    textHe: 'מהם הביטויים של "דיסהרמוניה בין הכבד לקיבה"?',
    textEn: 'What are the manifestations of "Disharmony between Liver and Stomach"?',
    type: 'text',
  },
  {
    id: 'spleen_dampness_factors',
    textHe: 'אילו מזונות או הרגלים מחמירים את "לחות בטחול" לפי הקובץ?',
    textEn: 'Which foods or habits worsen "Spleen Dampness" according to the source?',
    type: 'text',
  },
  {
    id: 'liver_yang_rising_headache',
    textHe: 'מהו ההסבר הפתולוגי לכאבי ראש על רקע "עליית יאנג הכבד"?',
    textEn: 'What is the pathological explanation for headaches due to "Liver Yang Rising"?',
    type: 'text',
  },
  {
    id: 'heart_kidney_axis',
    textHe: 'כיצד מתוארת הדינמיקה בין הלב לכליות (Shaoyin Axis)?',
    textEn: 'How is the dynamic between Heart and Kidneys (Shaoyin Axis) described?',
    type: 'text',
  },
  {
    id: 'wind_cold_lung_invasion',
    textHe: 'מהם הסימנים המבשרים על פלישת רוח-קור לריאות?',
    textEn: 'What are the signs indicating Wind-Cold invasion of the Lungs?',
    type: 'text',
  },
  {
    id: 'false_cold_true_heat',
    textHe: 'מהי האסטרטגיה הטיפולית למצבי "קור מדומה וחום אמיתי"?',
    textEn: 'What is the treatment strategy for "False Cold and True Heat" conditions?',
    type: 'text',
  },
  {
    id: 'liver_blood_emotions',
    textHe: 'אילו סימפטומים רגשיים קשורים לחוסר דם בכבד (Liv Blood Def)?',
    textEn: 'What emotional symptoms are associated with Liver Blood Deficiency?',
    type: 'text',
  },
  {
    id: 'bi_syndrome_definition',
    textHe: 'מהי ההגדרה המדויקת של "Bi Syndrome" (תסמונת כאב) בקובץ?',
    textEn: 'What is the precise definition of "Bi Syndrome" (painful obstruction) in the source?',
    type: 'text',
  },
];

export default function ZangFuSyndromesQuestionnaire() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: patients } = usePatients();
  const createAssessment = useCreateAssessment();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = language === 'he';
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      toast.error(isRTL ? 'נא לבחור מטופל' : 'Please select a patient');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAssessment.mutateAsync({
        patient_id: selectedPatientId,
        assessment_type: 'zang_fu_syndromes',
        details: { answers, questions: questions.map(q => ({ id: q.id, textHe: q.textHe, textEn: q.textEn })) },
        status: 'completed',
      });
      toast.success(isRTL ? 'השאלון נשמר בהצלחה' : 'Questionnaire saved successfully');
      navigate(-1);
    } catch (error) {
      toast.error(isRTL ? 'שגיאה בשמירת השאלון' : 'Error saving questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id] || '';

  return (
    <div className="min-h-screen bg-background p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Stethoscope className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? 'תסמונות זאנג-פו' : 'Zang Fu Syndromes'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isRTL ? 'אבחון ופתולוגיה - שאלון מעמיק' : 'Diagnosis & Pathology - In-depth Questionnaire'}
          </p>
        </div>

        {/* Patient Selection */}
        <Card>
          <CardContent className="pt-4">
            <Label className="mb-2 block">
              {isRTL ? 'בחר מטופל' : 'Select Patient'}
            </Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? 'בחר מטופל...' : 'Select patient...'} />
              </SelectTrigger>
              <SelectContent>
                {patients?.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{isRTL ? `שאלה ${currentQuestion + 1} מתוך ${questions.length}` : `Question ${currentQuestion + 1} of ${questions.length}`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-lg leading-relaxed">
                  {isRTL ? currentQ.textHe : currentQ.textEn}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={isRTL ? 'הקלד/י את תשובתך כאן...' : 'Type your answer here...'}
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isRTL ? 'הקודם' : 'Previous'}
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedPatientId}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? (isRTL ? 'שומר...' : 'Saving...') : (isRTL ? 'סיום ושמירה' : 'Finish & Save')}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="flex items-center gap-2"
            >
              {isRTL ? 'הבא' : 'Next'}
              {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            {isRTL ? 'חזרה' : 'Back'}
          </Button>
        </div>
      </div>
    </div>
  );
}
