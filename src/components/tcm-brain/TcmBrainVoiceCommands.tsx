import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { toast } from 'sonner';

export type TcmVoiceCommand = 
  | 'generate-summary'
  | 'save-to-patient'
  | 'export-session'
  | 'print-report'
  | 'share-whatsapp'
  | 'generate-audio'
  | 'start-session'
  | 'pause-session'
  | 'end-session'
  | 'clear-chat'
  | 'next-tab'
  | 'previous-tab';

interface TcmBrainVoiceCommandsProps {
  onCommand: (command: TcmVoiceCommand) => void;
  isSessionActive: boolean;
  wakeWord?: string;
}

const VOICE_COMMANDS: Record<string, TcmVoiceCommand> = {
  // Summary commands
  'generate summary': 'generate-summary',
  'create summary': 'generate-summary',
  'summary': 'generate-summary',
  'summarize': 'generate-summary',
  'ai summary': 'generate-summary',
  'topic summary': 'generate-summary',
  
  // Save commands
  'save to patient': 'save-to-patient',
  'save patient': 'save-to-patient',
  'save': 'save-to-patient',
  'save file': 'save-to-patient',
  'save record': 'save-to-patient',
  
  // Export commands
  'export': 'export-session',
  'export session': 'export-session',
  'download': 'export-session',
  'download session': 'export-session',
  
  // Print commands
  'print': 'print-report',
  'print report': 'print-report',
  'print session': 'print-report',
  
  // WhatsApp commands
  'share whatsapp': 'share-whatsapp',
  'whatsapp': 'share-whatsapp',
  'send whatsapp': 'share-whatsapp',
  'share': 'share-whatsapp',
  
  // Audio commands
  'generate audio': 'generate-audio',
  'create audio': 'generate-audio',
  'make mp3': 'generate-audio',
  'audio': 'generate-audio',
  'mp3': 'generate-audio',
  
  // Session commands
  'start session': 'start-session',
  'begin session': 'start-session',
  'start': 'start-session',
  'pause session': 'pause-session',
  'pause': 'pause-session',
  'end session': 'end-session',
  'stop session': 'end-session',
  'finish': 'end-session',
  
  // Clear command
  'clear': 'clear-chat',
  'clear chat': 'clear-chat',
  'reset': 'clear-chat',
  
  // Navigation
  'next tab': 'next-tab',
  'next': 'next-tab',
  'previous tab': 'previous-tab',
  'previous': 'previous-tab',
  'back': 'previous-tab',
};

const COMMAND_LABELS: Record<TcmVoiceCommand, string> = {
  'generate-summary': '📝 Generate Summary',
  'save-to-patient': '💾 Save to Patient',
  'export-session': '📥 Export Session',
  'print-report': '🖨️ Print Report',
  'share-whatsapp': '💬 Share WhatsApp',
  'generate-audio': '🔊 Generate MP3',
  'start-session': '▶️ Start Session',
  'pause-session': '⏸️ Pause Session',
  'end-session': '⏹️ End Session',
  'clear-chat': '🗑️ Clear Chat',
  'next-tab': '➡️ Next Tab',
  'previous-tab': '⬅️ Previous Tab',
};

export function TcmBrainVoiceCommands({ 
  onCommand, 
  isSessionActive,
  wakeWord = 'hey cm' 
}: TcmBrainVoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [lastCommand, setLastCommand] = useState<TcmVoiceCommand | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const awakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const haptic = useHapticFeedback();

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const processTranscript = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('[TcmVoice] Transcript:', lowerTranscript);

    if (lowerTranscript.includes(wakeWord.toLowerCase())) {
      setIsAwake(true);
      haptic.medium();
      toast.info('🎙️ Listening for command...', { duration: 2000 });
      
      if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
      awakeTimeoutRef.current = setTimeout(() => setIsAwake(false), 6000);
      
      const afterWakeWord = lowerTranscript.split(wakeWord.toLowerCase())[1]?.trim();
      if (afterWakeWord) processCommand(afterWakeWord);
      return;
    }

    if (isAwake) processCommand(lowerTranscript);
  }, [wakeWord, isAwake, haptic]);

  const processCommand = useCallback((text: string) => {
    for (const [phrase, command] of Object.entries(VOICE_COMMANDS)) {
      if (text.includes(phrase)) {
        setLastCommand(command);
        setIsAwake(false);
        haptic.success();
        onCommand(command);
        toast.success(COMMAND_LABELS[command], { duration: 2000 });
        
        if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
        return;
      }
    }
    
    toast.info(`Command not recognized: "${text}"`, { duration: 2000 });
  }, [onCommand, haptic]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice commands not supported');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        if (event.results[last].isFinal) processTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied');
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening && recognitionRef.current) recognitionRef.current.start();
      };

      recognitionRef.current.start();
      setIsListening(true);
      haptic.light();
      toast.success('🎙️ Voice commands active - Say "Hey CM"', { duration: 3000 });
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error('Failed to start voice commands');
    }
  }, [isSupported, isListening, processTranscript, haptic]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsAwake(false);
    haptic.light();
  }, [haptic]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
    };
  }, []);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-24 left-4 z-40">
      <button
        onClick={isListening ? stopListening : startListening}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 touch-manipulation',
          isListening 
            ? isAwake 
              ? 'bg-jade text-white animate-pulse scale-110' 
              : 'bg-jade/80 text-white'
            : 'bg-card border border-border text-muted-foreground hover:bg-muted'
        )}
        aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
      >
        {isListening ? (
          <div className="relative">
            <Mic className={cn('h-6 w-6', isAwake && 'animate-bounce')} />
            {isAwake && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />}
          </div>
        ) : (
          <MicOff className="h-6 w-6" />
        )}
      </button>
      
      {isListening && (
        <div className="absolute -top-8 left-0 right-0 text-center whitespace-nowrap">
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full',
            isAwake ? 'bg-jade text-white' : 'bg-muted text-muted-foreground'
          )}>
            {isAwake ? 'Listening...' : 'Say "Hey CM"'}
          </span>
        </div>
      )}

      {lastCommand && (
        <div className="absolute top-16 left-0 text-center whitespace-nowrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground">
            Last: {COMMAND_LABELS[lastCommand]}
          </span>
        </div>
      )}
    </div>
  );
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}
