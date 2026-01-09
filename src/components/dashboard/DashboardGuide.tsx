import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuideStep {
  targetId: string;
  title: string;
  description: string;
  position: 'right' | 'center' | 'left';
}

const GUIDE_STEPS: GuideStep[] = [
  {
    targetId: 'dashboard-right-column',
    title: 'תכנון וניהול',
    description: 'התחל כאן את יום העבודה שלך. קבע תורים, נהל מטופלים והתחל טיפולים.',
    position: 'right',
  },
  {
    targetId: 'dashboard-center-column',
    title: 'מרכז הידע',
    description: 'כל כלי האבחון וה-AI המקצועיים במקום אחד. סטטיסטיקות, אנציקלופדיות ומאגרי ידע.',
    position: 'center',
  },
  {
    targetId: 'dashboard-left-column',
    title: 'מעקב ובקרה',
    description: 'תמונת מצב ויזואלית וכלכלית של המרפאה. שעון, ארנק ומעקב התקדמות.',
    position: 'left',
  },
];

interface DashboardGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardGuide({ isOpen, onClose }: DashboardGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = useCallback(() => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  }, [currentStep, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const step = GUIDE_STEPS[currentStep];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Highlight overlay for target column */}
          <motion.div
            key={step.targetId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed z-[9999] pointer-events-none",
              step.position === 'right' && "top-0 right-0 w-1/4 h-full",
              step.position === 'center' && "top-0 left-1/4 w-1/2 h-full",
              step.position === 'left' && "top-0 left-0 w-1/4 h-full",
            )}
          >
            <div className="absolute inset-0 border-4 border-jade rounded-xl animate-pulse-border" />
          </motion.div>

          {/* Guide Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-md"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-jade/30 rounded-2xl shadow-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-jade/20 flex items-center justify-center">
                    <Compass className="h-5 w-5 text-jade" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      שלב {currentStep + 1} מתוך {GUIDE_STEPS.length}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {GUIDE_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === currentStep ? "bg-jade w-6" : "bg-muted"
                    )}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </Button>
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-jade hover:bg-jade/90 gap-2"
                >
                  {currentStep === GUIDE_STEPS.length - 1 ? 'סיום' : 'הבא'}
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to trigger the guide
export function useDashboardGuide() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const startGuide = useCallback(() => {
    setIsGuideOpen(true);
  }, []);

  const closeGuide = useCallback(() => {
    setIsGuideOpen(false);
  }, []);

  return {
    isGuideOpen,
    startGuide,
    closeGuide,
  };
}
