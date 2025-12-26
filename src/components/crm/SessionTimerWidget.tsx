import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Bell, 
  BellOff,
  ChevronUp,
  ChevronDown,
  Timer,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SessionTimerWidgetProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

type TimerStatus = 'idle' | 'running' | 'paused' | 'warning' | 'ended';

const PRESET_DURATIONS = [
  { label: '30 min', value: 30, seconds: 30 * 60 },
  { label: '40 min', value: 40, seconds: 40 * 60 },
  { label: '45 min', value: 45, seconds: 45 * 60 },
  { label: '50 min', value: 50, seconds: 50 * 60 },
  { label: '60 min', value: 60, seconds: 60 * 60 },
  { label: '90 min', value: 90, seconds: 90 * 60 },
];

const WARNING_BEFORE_END = 5 * 60; // 5 minutes warning

export function SessionTimerWidget({ 
  className,
  position = 'bottom-right' 
}: SessionTimerWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [selectedDuration, setSelectedDuration] = useState<number>(40);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(40 * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(40 * 60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);
  const endAlertShownRef = useRef(false);

  // Update current time every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Play sound effect
  const playSound = useCallback((type: 'warning' | 'end') => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBeep = (startTime: number, frequency: number, duration: number = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type === 'end' ? 'square' : 'sine';
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      
      if (type === 'warning') {
        // Gentle warning: 3 soft beeps
        playBeep(now, 660);
        playBeep(now + 0.4, 660);
        playBeep(now + 0.8, 880);
      } else {
        // End alert: More urgent pattern
        playBeep(now, 880, 0.2);
        playBeep(now + 0.25, 880, 0.2);
        playBeep(now + 0.5, 1100, 0.2);
        playBeep(now + 0.75, 1100, 0.2);
        playBeep(now + 1.0, 1320, 0.4);
      }
    } catch (err) {
      console.error('Could not play audio:', err);
    }
  }, [soundEnabled]);

  // Timer countdown logic
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          const newValue = prev - 1;
          
          // Check for warning (5 minutes left)
          if (newValue === WARNING_BEFORE_END && !warningShownRef.current) {
            warningShownRef.current = true;
            setStatus('warning');
            playSound('warning');
            toast.warning('⏰ 5 minutes remaining!', {
              description: 'Start wrapping up your session.',
              duration: 10000,
            });
          }
          
          // Check for end
          if (newValue <= 0 && !endAlertShownRef.current) {
            endAlertShownRef.current = true;
            setStatus('ended');
            playSound('end');
            toast.error('🔔 Session time is up!', {
              description: 'Please conclude your session.',
              duration: 15000,
            });
            return 0;
          }
          
          return Math.max(0, newValue);
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, playSound]);

  const handleStart = () => {
    const duration = PRESET_DURATIONS.find(d => d.value === selectedDuration);
    if (duration) {
      setTotalSeconds(duration.seconds);
      setRemainingSeconds(duration.seconds);
      warningShownRef.current = false;
      endAlertShownRef.current = false;
      setStatus('running');
      setIsExpanded(true);
      toast.success(`Timer started: ${duration.label}`, {
        description: `You'll get a warning at 5 minutes remaining.`,
      });
    }
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    if (remainingSeconds > WARNING_BEFORE_END) {
      setStatus('running');
    } else if (remainingSeconds > 0) {
      setStatus('warning');
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const duration = PRESET_DURATIONS.find(d => d.value === selectedDuration);
    if (duration) {
      setTotalSeconds(duration.seconds);
      setRemainingSeconds(duration.seconds);
    }
    warningShownRef.current = false;
    endAlertShownRef.current = false;
    setStatus('idle');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const getProgress = () => {
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500 animate-pulse';
      case 'ended': return 'bg-red-500 animate-pulse';
      case 'paused': return 'bg-blue-500';
      default: return 'bg-muted';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'warning': return 'bg-amber-500';
      case 'ended': return 'bg-red-500';
      default: return 'bg-jade-500';
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  };

  return (
    <div 
      className={cn(
        "fixed z-40 transition-all duration-300",
        positionClasses[position],
        className
      )}
    >
      <div 
        className={cn(
          "rounded-2xl shadow-xl border overflow-hidden",
          "bg-card/95 backdrop-blur-sm",
          "transition-all duration-300 ease-out",
          status === 'warning' && "ring-2 ring-amber-500 ring-offset-2",
          status === 'ended' && "ring-2 ring-red-500 ring-offset-2 animate-shake"
        )}
      >
        {/* Compact Header - Always visible */}
        <div 
          className={cn(
            "flex items-center gap-3 px-4 py-3 cursor-pointer",
            "hover:bg-muted/50 transition-colors"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Status indicator */}
          <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
          
          {/* Real-time clock */}
          <div className="flex items-center gap-2 text-sm font-mono">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{formatCurrentTime(currentTime)}</span>
          </div>

          {/* Timer display when running */}
          {status !== 'idle' && (
            <>
              <div className="w-px h-4 bg-border" />
              <div className={cn(
                "flex items-center gap-2 font-mono text-lg font-bold",
                status === 'warning' && "text-amber-600 dark:text-amber-400",
                status === 'ended' && "text-red-600 dark:text-red-400 animate-pulse"
              )}>
                <Timer className="h-4 w-4" />
                {formatTime(remainingSeconds)}
              </div>
            </>
          )}

          {/* Expand/collapse button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t">
            {/* Progress bar */}
            {status !== 'idle' && (
              <div className="pt-3">
                <Progress 
                  value={getProgress()} 
                  className={cn("h-2", getProgressColor())}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Elapsed: {formatTime(totalSeconds - remainingSeconds)}</span>
                  <span>Remaining: {formatTime(remainingSeconds)}</span>
                </div>
              </div>
            )}

            {/* Duration selector - only when idle */}
            {status === 'idle' && (
              <div className="pt-3 space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Set Session Duration
                </label>
                <Select 
                  value={selectedDuration.toString()} 
                  onValueChange={(v) => setSelectedDuration(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_DURATIONS.map(d => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status badges */}
            {status !== 'idle' && (
              <div className="flex items-center gap-2 pt-2">
                {status === 'running' && (
                  <Badge variant="default" className="bg-emerald-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Running
                  </Badge>
                )}
                {status === 'paused' && (
                  <Badge variant="secondary">
                    <Pause className="h-3 w-3 mr-1" /> Paused
                  </Badge>
                )}
                {status === 'warning' && (
                  <Badge variant="default" className="bg-amber-500 animate-pulse">
                    <AlertTriangle className="h-3 w-3 mr-1" /> 5 min warning!
                  </Badge>
                )}
                {status === 'ended' && (
                  <Badge variant="destructive" className="animate-pulse">
                    <Bell className="h-3 w-3 mr-1" /> Time's up!
                  </Badge>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2 pt-2">
              {status === 'idle' && (
                <Button onClick={handleStart} className="flex-1 bg-jade-600 hover:bg-jade-700">
                  <Play className="h-4 w-4 mr-2" /> Start Timer
                </Button>
              )}

              {(status === 'running' || status === 'warning') && (
                <Button onClick={handlePause} variant="outline" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" /> Pause
                </Button>
              )}

              {status === 'paused' && (
                <Button onClick={handleResume} className="flex-1 bg-jade-600 hover:bg-jade-700">
                  <Play className="h-4 w-4 mr-2" /> Resume
                </Button>
              )}

              {status !== 'idle' && (
                <Button onClick={handleReset} variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}

              {/* Sound toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(!soundEnabled && "text-muted-foreground")}
              >
                {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            </div>

            {/* End session message */}
            {status === 'ended' && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium text-center">
                  🔔 Please wrap up and end your session
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
