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
  const [waveformData, setWaveformData] = useState<number[]>(new Array(64).fill(128));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !isRecording) {
      setLevels(new Array(barCount).fill(0));
      setWaveformData(new Array(64).fill(128));
      return;
    }

    // Create audio context and analyzer
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = variant === 'wave' ? 128 : 64;
    analyzer.smoothingTimeConstant = 0.6;
    analyzerRef.current = analyzer;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyzer);

    const frequencyData = new Uint8Array(analyzer.frequencyBinCount);
    const timeDomainData = new Uint8Array(analyzer.fftSize);

    const updateLevels = () => {
      if (!analyzerRef.current) return;
      
      // Get frequency data for bars/circle
      analyzerRef.current.getByteFrequencyData(frequencyData);
      
      // Get time domain data for waveform
      analyzerRef.current.getByteTimeDomainData(timeDomainData);
      
      // Sample frequencies for visualization
      const newLevels = [];
      const step = Math.floor(frequencyData.length / barCount);
      
      for (let i = 0; i < barCount; i++) {
        const value = frequencyData[i * step] || 0;
        newLevels.push(Math.min(100, (value / 255) * 150));
      }
      
      setLevels(newLevels);
      setWaveformData(Array.from(timeDomainData));
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
  }, [stream, isRecording, barCount, variant]);

  // Generate smooth SVG path from waveform data
  const generateWavePath = (data: number[], width: number, height: number): string => {
    if (data.length === 0) return '';
    
    const points: string[] = [];
    const sliceWidth = width / data.length;
    
    for (let i = 0; i < data.length; i++) {
      const x = i * sliceWidth;
      // Normalize: 128 is silence, 0-255 is the range
      const normalized = (data[i] - 128) / 128;
      const y = (height / 2) + (normalized * height / 2 * 0.8);
      
      if (i === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        // Use quadratic curves for smoothness
        const prevX = (i - 1) * sliceWidth;
        const cpX = (prevX + x) / 2;
        points.push(`Q ${cpX} ${y} ${x} ${y}`);
      }
    }
    
    return points.join(' ');
  };

  if (variant === 'wave') {
    const width = 280;
    const height = 60;
    const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
    
    return (
      <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-slate-900/50 via-slate-800/50 to-slate-900/50 p-2">
        <svg 
          width={width} 
          height={height} 
          className="overflow-visible"
          style={{ filter: isRecording ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))' : 'none' }}
        >
          {/* Background grid lines */}
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity="1" />
              <stop offset="75%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="waveFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Center line */}
          <line 
            x1="0" 
            y1={height / 2} 
            x2={width} 
            y2={height / 2} 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          
          {/* Waveform path */}
          <path
            d={generateWavePath(waveformData, width, height)}
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth={2 + avgLevel * 0.02}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-75"
          />
          
          {/* Mirrored waveform for symmetry effect */}
          <path
            d={generateWavePath(waveformData.map(v => 256 - v), width, height)}
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth={1.5 + avgLevel * 0.01}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
            className="transition-all duration-75"
          />
        </svg>
        
        {/* Level indicator */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div 
            className="w-1 rounded-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
            style={{ height: `${Math.max(8, avgLevel * 0.5)}px` }}
          />
        </div>
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
