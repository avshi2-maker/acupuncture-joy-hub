import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Loader2, Sparkles, X } from 'lucide-react';
import { useWebSpeechRecognition } from '@/hooks/useWebSpeechRecognition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VoiceDictationOverlayProps {
  moduleId: number;
  questions: Array<{ id: string; question_en: string; question_he: string; type: string }>;
  onAutoFill: (answers: Record<string, any>) => void;
  language: 'en' | 'he';
  className?: string;
}

const LANGUAGES = [
  { code: 'he-IL', label: 'עברית', flag: '🇮🇱' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'ar-SA', label: 'العربية', flag: '🇸🇦' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
];

export function VoiceDictationOverlay({
  moduleId,
  questions,
  onAutoFill,
  language,
  className,
}: VoiceDictationOverlayProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('he-IL');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    isListening,
    isSupported,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useWebSpeechRecognition({
    language: selectedLanguage,
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        setTranscript(prev => prev + (prev ? ' ' : '') + text);
      }
    },
    onError: (error) => {
      if (error === 'not-allowed') {
        toast.error(language === 'he' ? 'נא לאשר גישה למיקרופון' : 'Please allow microphone access');
      }
    },
  });

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setIsExpanded(true);
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleProcessWithAI = useCallback(async () => {
    if (!transcript.trim()) {
      toast.error(language === 'he' ? 'אין טקסט לעיבוד' : 'No text to process');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-autofill-questions', {
        body: {
          transcript,
          moduleId,
          questions: questions.map(q => ({
            id: q.id,
            question: language === 'he' ? q.question_he : q.question_en,
            type: q.type,
          })),
          language,
        },
      });

      if (error) throw error;

      if (data?.answers) {
        onAutoFill(data.answers);
        toast.success(
          language === 'he' 
            ? `${Object.keys(data.answers).length} שאלות מולאו אוטומטית` 
            : `${Object.keys(data.answers).length} questions auto-filled`
        );
        setTranscript('');
        setIsExpanded(false);
      }
    } catch (err) {
      console.error('AI auto-fill error:', err);
      toast.error(language === 'he' ? 'שגיאה בעיבוד' : 'Processing error');
    } finally {
      setIsProcessing(false);
    }
  }, [transcript, moduleId, questions, language, onAutoFill]);

  const handleClear = useCallback(() => {
    setTranscript('');
    resetTranscript();
  }, [resetTranscript]);

  const currentLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4"
          >
            <Card className="w-80 shadow-xl border-2 border-jade/30 bg-background/95 backdrop-blur">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4 text-jade" />
                  {language === 'he' ? 'הקלטה קולית' : 'Voice Dictation'}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Language selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {language === 'he' ? 'שפה:' : 'Language:'}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 gap-1">
                        <span>{currentLang.flag}</span>
                        <span className="text-xs">{currentLang.label}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {LANGUAGES.map((lang) => (
                        <DropdownMenuItem
                          key={lang.code}
                          onClick={() => setSelectedLanguage(lang.code)}
                        >
                          <span className="mr-2">{lang.flag}</span>
                          {lang.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Transcript display */}
                <div className="min-h-[80px] max-h-[150px] overflow-y-auto p-3 rounded-lg bg-muted/50 text-sm">
                  {transcript || interimTranscript ? (
                    <>
                      <span>{transcript}</span>
                      {interimTranscript && (
                        <span className="text-muted-foreground italic"> {interimTranscript}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {language === 'he' 
                        ? 'דבר לתיאור תסמינים... (למשל: "כאב ראש, עייפות, בעיות שינה")' 
                        : 'Speak to describe symptoms... (e.g., "headache, fatigue, sleep issues")'}
                    </span>
                  )}
                </div>

                {/* Status */}
                {isListening && (
                  <Badge variant="destructive" className="animate-pulse w-full justify-center">
                    {language === 'he' ? '🎤 מקליט...' : '🎤 Recording...'}
                  </Badge>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={!transcript && !interimTranscript}
                    className="flex-1"
                  >
                    {language === 'he' ? 'נקה' : 'Clear'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleProcessWithAI}
                    disabled={!transcript.trim() || isProcessing}
                    className="flex-1 bg-jade hover:bg-jade/90 gap-1"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {language === 'he' ? 'מלא אוטומטית' : 'Auto-Fill'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Mic Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="lg"
          onClick={handleToggleListening}
          className={cn(
            'h-14 w-14 rounded-full shadow-lg transition-all',
            isListening 
              ? 'bg-destructive hover:bg-destructive/90 animate-pulse' 
              : 'bg-jade hover:bg-jade/90'
          )}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </motion.div>
    </div>
  );
}
