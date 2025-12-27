import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface HebrewTTSButtonProps {
  text: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export function HebrewTTSButton({ 
  text, 
  className = '', 
  size = 'icon',
  variant = 'ghost'
}: HebrewTTSButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    // If currently playing, stop it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    if (!text || text.trim().length === 0) {
      toast.error('No text to speak');
      return;
    }

    // Limit text length for TTS
    const maxLength = 4000;
    const trimmedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: trimmedText, 
          voice: 'nova', // Good for Hebrew
          language: 'he' 
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Create audio from base64
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      
      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Create new audio element
      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        toast.error('Error playing audio');
      };

      await audio.play();
      setIsPlaying(true);

    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  return (
    <Button
      onClick={handlePlay}
      disabled={isLoading || !text}
      variant={variant}
      size={size}
      className={className}
      title={isPlaying ? 'Stop audio' : 'Play Hebrew audio'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
}
