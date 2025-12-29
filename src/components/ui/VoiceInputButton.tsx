import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedMic } from '@/components/ui/AnimatedMic';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, MicOff } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  appendMode?: boolean; // If true, appends to existing text; if false, replaces
}

export function VoiceInputButton({
  onTranscription,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'outline',
  appendMode = true,
}: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length === 0) {
          toast.error('No audio recorded');
          return;
        }

        setIsTranscribing(true);
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio },
            });

            if (error) throw error;
            
            if (data?.text) {
              onTranscription(data.text);
              toast.success('Transcription complete');
            } else {
              toast.warning('No speech detected');
            }
          };

          reader.readAsDataURL(audioBlob);
        } catch (error: any) {
          console.error('Transcription error:', error);
          toast.error(error.message || 'Transcription failed');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording... Click again to stop');
    } catch (error: any) {
      console.error('Microphone access error:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  };

  if (isTranscribing) {
    return (
      <Button
        type="button"
        variant={variant}
        size="icon"
        disabled
        className={`${sizeClasses[size]} ${className}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : variant}
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      className={`${sizeClasses[size]} relative ${isRecording ? 'animate-pulse' : ''} ${className}`}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      <AnimatedMic 
        size={iconSizes[size]} 
        isRecording={isRecording}
      />
    </Button>
  );
}
