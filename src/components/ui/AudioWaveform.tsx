import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  stream: MediaStream | null;
  isActive: boolean;
  currentSpeaker?: string | null;
  speakerColors?: Record<string, string>;
  className?: string;
  barCount?: number;
  height?: number;
}

export function AudioWaveform({
  stream,
  isActive,
  currentSpeaker,
  speakerColors = {
    speaker_0: 'bg-jade',
    speaker_1: 'bg-amber-400',
  },
  className,
  barCount = 32,
  height = 48,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const [levels, setLevels] = useState<number[]>(new Array(barCount).fill(0));

  const getColor = useCallback(() => {
    if (!currentSpeaker) return 'rgb(100, 116, 139)'; // slate-500
    if (currentSpeaker === 'speaker_0') return 'rgb(46, 139, 87)'; // jade
    if (currentSpeaker === 'speaker_1') return 'rgb(251, 191, 36)'; // amber-400
    return 'rgb(100, 116, 139)';
  }, [currentSpeaker]);

  useEffect(() => {
    if (!stream || !isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setLevels(new Array(barCount).fill(0));
      return;
    }

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.7;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const draw = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Map frequency data to bar heights
      const step = Math.floor(dataArray.length / barCount);
      const newLevels: number[] = [];
      
      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j] || 0;
        }
        // Normalize to 0-1 range with some boost for visibility
        const avg = (sum / step / 255) * 1.5;
        newLevels.push(Math.min(1, avg));
      }
      
      setLevels(newLevels);
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stream, isActive, barCount]);

  // Canvas-based rendering for smooth animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const barWidth = (rect.width / barCount) * 0.7;
    const gap = (rect.width / barCount) * 0.3;
    const color = getColor();
    const minBarHeight = 3;

    levels.forEach((level, i) => {
      const barHeight = Math.max(minBarHeight, level * rect.height * 0.9);
      const x = i * (barWidth + gap) + gap / 2;
      const y = (rect.height - barHeight) / 2;

      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
      ctx.fillStyle = isActive && level > 0.05 ? color : 'rgba(100, 116, 139, 0.3)';
      ctx.fill();
    });
  }, [levels, barCount, getColor, isActive]);

  return (
    <div className={cn('relative', className)}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />
      {/* Speaker indicator */}
      {isActive && currentSpeaker && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className={cn(
            'h-1.5 w-8 rounded-full transition-all duration-200',
            currentSpeaker === 'speaker_0' ? 'bg-jade' : 'bg-amber-400'
          )} />
        </div>
      )}
    </div>
  );
}
