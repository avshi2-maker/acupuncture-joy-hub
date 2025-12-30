import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BrowserVoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  language?: string; // e.g., 'he-IL', 'en-US', 'ru-RU'
  continuous?: boolean;
  interimResults?: boolean;
}

// Get speech recognition constructor
const getSpeechRecognition = (): any => {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
};

export function BrowserVoiceInput({
  onTranscription,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'outline',
  language = 'he-IL',
  continuous = false,
  interimResults = true,
}: BrowserVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (finalTranscript) {
        onTranscription(finalTranscript);
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimTranscript('');

      switch (event.error) {
        case 'no-speech':
          toast.info('לא זוהה דיבור. נסה שוב.');
          break;
        case 'audio-capture':
          toast.error('לא נמצא מיקרופון. בדוק את ההרשאות.');
          break;
        case 'not-allowed':
          toast.error('גישה למיקרופון נדחתה. אנא אפשר גישה.');
          break;
        case 'network':
          toast.error('שגיאת רשת. בדוק את החיבור.');
          break;
        default:
          toast.error(`שגיאה: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }
    };
  }, [language, continuous, interimResults, onTranscription]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        // Update language before starting
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        toast.info('מקשיב... דבר עכשיו');
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('לא ניתן להפעיל זיהוי קולי');
      }
    }
  }, [isListening, language]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  if (!isSupported) {
    return (
      <Button
        type="button"
        variant={variant}
        size="icon"
        disabled
        className={cn(sizeClasses[size], className)}
        title="זיהוי קולי אינו נתמך בדפדפן זה"
      >
        <MicOff className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div className="relative inline-flex">
      <Button
        type="button"
        variant={isListening ? 'destructive' : variant}
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        className={cn(
          sizeClasses[size],
          'relative transition-all duration-200',
          isListening && 'animate-pulse ring-2 ring-red-500/50',
          className
        )}
        title={isListening ? 'הפסק הקלטה' : 'התחל זיהוי קולי (בדפדפן)'}
      >
        {isListening ? (
          <>
            <Mic className="h-4 w-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-ping" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
          </>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      {/* Interim transcript tooltip */}
      {isListening && interimTranscript && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 max-w-xs">
          <div className="bg-popover text-popover-foreground text-sm px-3 py-2 rounded-md shadow-lg border animate-fade-in whitespace-nowrap">
            <p className="text-muted-foreground text-xs mb-1">מזהה:</p>
            <p className="font-medium">{interimTranscript}</p>
          </div>
        </div>
      )}
    </div>
  );
}
