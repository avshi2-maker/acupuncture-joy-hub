import { useState, useCallback } from 'react';
import { Mic, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLongPressGesture } from '@/hooks/useLongPressGesture';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LongPressVoiceNoteProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export function LongPressVoiceNote({ onTranscription, className }: LongPressVoiceNoteProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const haptic = useHapticFeedback();

  const startRecording = useCallback(async () => {
    try {
      haptic.medium();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true 
        } 
      });
      
      const recorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus' 
      });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (chunks.length > 0) {
          setIsTranscribing(true);
          haptic.success();
          
          try {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            const reader = new FileReader();
            
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              
              const { data, error } = await supabase.functions.invoke('voice-to-text', {
                body: { audio: base64Audio }
              });
              
              if (error) throw error;
              
              if (data?.text) {
                onTranscription(data.text);
                toast.success('Voice note added', { duration: 2000 });
              }
            };
            
            reader.readAsDataURL(audioBlob);
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error('Failed to transcribe voice note');
          } finally {
            setIsTranscribing(false);
          }
        }
      };
      
      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.start();
      setIsRecording(true);
      toast.info('🎙️ Recording... Release to stop', { duration: 2000 });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Could not access microphone');
    }
  }, [haptic, onTranscription]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder]);

  const { handlers, isPressing, progress } = useLongPressGesture({
    onLongPress: startRecording,
    onPressEnd: stopRecording,
    delay: 400,
  });

  return (
    <div className={cn('relative inline-flex', className)}>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'h-12 w-12 rounded-full transition-all duration-200 touch-manipulation relative overflow-hidden',
          isRecording && 'bg-red-500 border-red-500 text-white animate-pulse',
          isPressing && !isRecording && 'scale-110',
          isTranscribing && 'bg-jade border-jade text-white'
        )}
        disabled={isTranscribing}
        {...handlers}
      >
        {/* Progress ring */}
        {isPressing && !isRecording && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress * 1.38} 138`}
              className="text-jade opacity-50"
            />
          </svg>
        )}
        
        {isTranscribing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isRecording ? (
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      
      {/* Recording indicator */}
      {isRecording && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
      
      {/* Hint text */}
      {!isRecording && !isTranscribing && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap">
          Hold for voice
        </span>
      )}
    </div>
  );
}
