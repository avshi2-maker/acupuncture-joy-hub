import { useEffect, useRef, useState } from 'react';

interface AudioLevelMeterProps {
  stream: MediaStream | null;
  isRecording: boolean;
  variant?: 'bars' | 'wave' | 'circle';
  barCount?: number;
}

export function AudioLevelMeter({ 
  stream, 
  isRecording, 
  variant = 'bars',
  barCount = 12 
}: AudioLevelMeterProps) {
  const [levels, setLevels] = useState<number[]>(new Array(barCount).fill(0));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !isRecording) {
      setLevels(new Array(barCount).fill(0));
      return;
    }

    // Create audio context and analyzer
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 64;
    analyzer.smoothingTimeConstant = 0.8;
    analyzerRef.current = analyzer;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyzer);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const updateLevels = () => {
      if (!analyzerRef.current) return;
      
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      // Sample frequencies for visualization
      const newLevels = [];
      const step = Math.floor(dataArray.length / barCount);
      
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0;
        // Normalize to 0-100 with some boost for better visibility
        newLevels.push(Math.min(100, (value / 255) * 150));
      }
      
      setLevels(newLevels);
      animationRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isRecording, barCount]);

  if (variant === 'wave') {
    return (
      <div className="flex items-center justify-center gap-[2px] h-12 px-4">
        {levels.map((level, i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-jade via-emerald-400 to-green-300 rounded-full transition-all duration-75"
            style={{
              height: `${Math.max(4, level * 0.4)}px`,
              opacity: isRecording ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer pulsing rings based on audio level */}
        <div 
          className="absolute rounded-full bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 transition-all duration-75"
          style={{
            width: `${60 + avgLevel * 0.6}px`,
            height: `${60 + avgLevel * 0.6}px`,
          }}
        />
        <div 
          className="absolute rounded-full bg-gradient-to-r from-red-500/30 via-orange-500/30 to-amber-500/30 transition-all duration-100"
          style={{
            width: `${50 + avgLevel * 0.4}px`,
            height: `${50 + avgLevel * 0.4}px`,
          }}
        />
        {/* Inner circle with level indicator */}
        <div 
          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `scale(${1 + avgLevel * 0.003})`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
            <span className="text-xs font-bold text-red-500">
              {Math.round(avgLevel)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default: bars variant
  return (
    <div className="flex items-end justify-center gap-1 h-16 px-4">
      {levels.map((level, i) => {
        // Create gradient color based on level
        const hue = 120 - (level * 1.2); // Green to red
        return (
          <div
            key={i}
            className="w-2 rounded-t-sm transition-all duration-75 shadow-sm"
            style={{
              height: `${Math.max(4, level * 0.6)}px`,
              backgroundColor: `hsl(${Math.max(0, hue)}, 80%, 50%)`,
              opacity: isRecording ? 1 : 0.3,
              boxShadow: level > 50 ? `0 0 8px hsla(${Math.max(0, hue)}, 80%, 50%, 0.5)` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
