import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingSessionTimerProps {
  status: 'idle' | 'running' | 'paused' | 'ended';
  duration: number;
  patientName?: string | null;
  onTap?: () => void;
}

export function FloatingSessionTimer({ 
  status, 
  duration, 
  patientName,
  onTap 
}: FloatingSessionTimerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsMinimized(true);
      } else {
        setIsMinimized(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Only show when session is active
  useEffect(() => {
    setIsVisible(status === 'running' || status === 'paused');
  }, [status]);

  if (!isVisible) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const StatusIcon = status === 'running' ? Play : status === 'paused' ? Pause : Square;

  return (
    <div
      onClick={onTap}
      className={cn(
        'md:hidden fixed z-50 transition-all duration-300 touch-manipulation',
        'shadow-lg backdrop-blur-md',
        isMinimized 
          ? 'top-2 right-2 rounded-full p-2'
          : 'top-14 left-1/2 -translate-x-1/2 rounded-full px-4 py-2',
        status === 'running' 
          ? 'bg-jade/90 text-white' 
          : 'bg-amber-500/90 text-white'
      )}
    >
      {isMinimized ? (
        // Minimized view - just icon and time
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'w-2 h-2 rounded-full',
            status === 'running' ? 'bg-white animate-pulse' : 'bg-white/70'
          )} />
          <span className="text-xs font-mono font-bold">
            {formatDuration(duration)}
          </span>
        </div>
      ) : (
        // Expanded view
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            status === 'running' ? 'bg-white/20' : 'bg-white/20'
          )}>
            <StatusIcon className={cn(
              'h-4 w-4',
              status === 'running' && 'animate-pulse'
            )} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-lg font-mono font-bold leading-none">
              {formatDuration(duration)}
            </span>
            {patientName && (
              <span className="text-[10px] opacity-80 truncate max-w-[100px]">
                {patientName}
              </span>
            )}
          </div>
          <div className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-medium',
            status === 'running' ? 'bg-white/20' : 'bg-white/20'
          )}>
            {status === 'running' ? 'LIVE' : 'PAUSED'}
          </div>
        </div>
      )}
    </div>
  );
}
