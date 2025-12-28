import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TTSButtonProps {
  text: string;
  title?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showLabel?: boolean;
  label?: string;
}

export function TTSButton({ 
  text, 
  title,
  className = '', 
  size = 'icon',
  variant = 'ghost',
  showLabel = false,
  label = 'האזן'
}: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleClick = async () => {
    if (!text) {
      toast({
        title: "שגיאה",
        description: "אין טקסט להשמעה",
        variant: "destructive",
      });
      return;
    }

    // If playing, stop
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoading(true);

    try {
      console.log('Calling ElevenLabs TTS for Hebrew text...');
      
      // Call ElevenLabs TTS edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: text.substring(0, 5000), // ElevenLabs limit
            voice: 'Sarah' // Good multilingual voice for Hebrew
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS request failed');
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received');
      }

      // Use data URI - browser natively decodes base64 audio
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        audioRef.current = null;
        toast({
          title: "שגיאה",
          description: "שגיאה בהשמעת האודיו",
          variant: "destructive",
        });
      };

      await audio.play();
      
    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "שגיאה בהמרת טקסט לדיבור",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !text}
      variant={variant}
      size={size}
      className={cn(showLabel && 'gap-1.5', className)}
      title={isPlaying ? 'עצור הקראה' : 'האזן לטקסט'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {showLabel && <span>{isPlaying ? 'עצור' : label}</span>}
    </Button>
  );
}
