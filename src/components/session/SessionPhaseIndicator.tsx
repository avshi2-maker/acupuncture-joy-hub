import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Stethoscope, Activity, CheckCircle, User, LucideIcon, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export type SessionPhase = 'opening' | 'diagnosis' | 'treatment' | 'closing';

interface PhaseStep {
  id: SessionPhase;
  label: string;
  labelHe: string;
  icon: LucideIcon;
  tools: string[];
  toolsHe: string[];
  color: string;
}

const phases: PhaseStep[] = [
  { 
    id: 'opening', 
    label: 'Opening', 
    labelHe: 'פתיחה', 
    icon: Sparkles,
    tools: ['Patient History', 'Chief Complaint', 'Intake Review'],
    toolsHe: ['היסטוריה', 'תלונה עיקרית', 'קליטה'],
    color: 'from-amber-400 to-orange-500',
  },
  { 
    id: 'diagnosis', 
    label: 'Diagnosis', 
    labelHe: 'אבחון', 
    icon: Stethoscope,
    tools: ['Pulse', 'Tongue', 'TCM Brain'],
    toolsHe: ['דופק', 'לשון', 'מוח TCM'],
    color: 'from-blue-400 to-indigo-500',
  },
  { 
    id: 'treatment', 
    label: 'Treatment', 
    labelHe: 'טיפול', 
    icon: Activity,
    tools: ['Points', 'Herbs', 'Body Map'],
    toolsHe: ['נקודות', 'צמחים', 'מפת גוף'],
    color: 'from-emerald-400 to-jade',
  },
  { 
    id: 'closing', 
    label: 'Closing', 
    labelHe: 'סיום', 
    icon: CheckCircle,
    tools: ['Summary', 'Follow-up', 'Report'],
    toolsHe: ['סיכום', 'המשך טיפול', 'דוח'],
    color: 'from-purple-400 to-pink-500',
  },
];

interface SessionPhaseIndicatorProps {
  currentPhase: SessionPhase;
  onPhaseClick?: (phase: SessionPhase) => void;
  onResetToAuto?: () => void;
  isManualOverride?: boolean;
  patientName?: string | null;
  showTools?: boolean;
  className?: string;
}

export function SessionPhaseIndicator({ 
  currentPhase, 
  onPhaseClick,
  onResetToAuto,
  isManualOverride = false,
  patientName,
  showTools = true,
  className 
}: SessionPhaseIndicatorProps) {
  const currentIndex = phases.findIndex(p => p.id === currentPhase);
  const progressPercent = ((currentIndex + 1) / phases.length) * 100;
  const currentPhaseData = phases.find(p => p.id === currentPhase);
  
  // Track previous phase for transition animation
  const [prevPhase, setPrevPhase] = useState<SessionPhase>(currentPhase);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (prevPhase !== currentPhase) {
      setIsTransitioning(true);
      
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // End transition after animation
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setPrevPhase(currentPhase);
      }, 600);
    }
    
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [currentPhase, prevPhase]);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Patient Badge + Phase Tools + Reset Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {patientName && (
            <Badge variant="outline" className="bg-jade/10 text-jade border-jade/30 font-bold text-xs gap-1">
              <User className="h-3 w-3" />
              {patientName}
            </Badge>
          )}
          
          {isManualOverride && onResetToAuto && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetToAuto}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              אוטומטי
            </Button>
          )}
        </div>
        
        {showTools && currentPhaseData && (
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentPhase}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1 flex-wrap justify-end flex-1"
            >
              <span className="text-[10px] text-muted-foreground font-medium mr-1">כלים מומלצים:</span>
              {currentPhaseData.toolsHe.map((tool, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="text-[9px] px-1.5 py-0 h-5 bg-gold/10 text-gold border-gold/20 font-semibold"
                >
                  {tool}
                </Badge>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Progress bar with glow effect on transition */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            `bg-gradient-to-r ${currentPhaseData?.color || 'from-jade to-gold'}`
          )}
          initial={false}
          animate={{ 
            width: `${progressPercent}%`,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        {/* Glow effect during transition */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Phase steps */}
      <div className="flex items-center justify-between">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = phase.id === currentPhase;
          const showConnector = index < phases.length - 1;
          
          return (
            <div key={phase.id} className="flex items-center flex-1">
              {/* Phase circle with ripple effect */}
              <button
                onClick={() => onPhaseClick?.(phase.id)}
                disabled={!onPhaseClick}
                className={cn(
                  "flex flex-col items-center group transition-all relative",
                  onPhaseClick && "cursor-pointer hover:scale-110 active:scale-95"
                )}
              >
                {/* Ripple effect on current phase */}
                <AnimatePresence>
                  {isCurrent && isTransitioning && (
                    <motion.div
                      className="absolute inset-0 -top-1"
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <div className={cn(
                        "w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-r",
                        phase.color
                      )} />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div
                  className={cn(
                    'w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center',
                    'border-2 shadow-md relative z-10',
                    isCompleted 
                      ? 'bg-jade border-jade text-white shadow-jade/40' 
                      : isCurrent 
                        ? `bg-gradient-to-br ${phase.color} border-transparent text-white shadow-lg` 
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50'
                  )}
                  animate={isCurrent ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 4px 15px rgba(0,0,0,0.1)',
                      '0 8px 25px rgba(0,0,0,0.2)',
                      '0 4px 15px rgba(0,0,0,0.1)',
                    ],
                  } : {}}
                  transition={{ 
                    duration: 2, 
                    repeat: isCurrent ? Infinity : 0,
                    ease: "easeInOut" 
                  }}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </motion.div>
                
                <motion.span 
                  className={cn(
                    'text-[11px] md:text-sm mt-1.5 text-center leading-tight',
                    isCompleted ? 'text-jade font-bold' : 
                    isCurrent ? 'text-foreground font-extrabold' : 
                    'text-muted-foreground font-medium'
                  )}
                  animate={isCurrent ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {phase.labelHe}
                </motion.span>
                <span className={cn(
                  'text-[9px] md:text-xs text-center leading-tight',
                  isCompleted ? 'text-jade/80 font-semibold' : 
                  isCurrent ? 'text-muted-foreground font-bold' : 
                  'text-muted-foreground/70 font-normal'
                )}>
                  {phase.label}
                </span>
              </button>
              
              {/* Connector line with animation */}
              {showConnector && (
                <motion.div 
                  className={cn(
                    'flex-1 h-1 mx-2 rounded-full',
                    isCompleted ? 'bg-jade' : 'bg-muted'
                  )}
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted ? 'hsl(var(--jade))' : 'hsl(var(--muted))',
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Manual override indicator */}
      <AnimatePresence>
        {isManualOverride && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[10px] text-center text-muted-foreground"
          >
            🎯 שלב ידני • לחץ על שלב לשינוי או "אוטומטי" לחזרה
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to determine phase from session duration (in seconds)
export function getPhaseFromDuration(durationSeconds: number): SessionPhase {
  const minutes = durationSeconds / 60;
  if (minutes < 5) return 'opening';
  if (minutes < 20) return 'diagnosis';
  if (minutes < 40) return 'treatment';
  return 'closing';
}
