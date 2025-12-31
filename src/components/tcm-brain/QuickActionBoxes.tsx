import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Stethoscope,
  ClipboardList,
  FileText,
  Pill,
  Activity,
  Brain,
  Settings,
  GripVertical,
  Check,
  Sparkles,
  Heart,
  Zap,
  Shield,
  Users,
  Target,
  Lightbulb,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

export interface QuickActionBox {
  id: string;
  name: string;
  nameHe: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  prompt: string;
  description: string;
}

const ALL_ACTION_BOXES: QuickActionBox[] = [
  {
    id: 'quick-diagnosis',
    name: 'Quick Diagnosis',
    nameHe: 'אבחון מהיר',
    icon: Stethoscope,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    prompt: 'Based on the patient symptoms and presentation, provide a quick TCM pattern diagnosis with confidence level.',
    description: 'Get instant pattern identification'
  },
  {
    id: 'treatment-plan',
    name: 'Treatment Plan',
    nameHe: 'תוכנית טיפול',
    icon: ClipboardList,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    prompt: 'Generate a comprehensive TCM treatment plan including acupuncture points, herbal formulas, and lifestyle recommendations.',
    description: 'Full treatment protocol'
  },
  {
    id: 'session-notes',
    name: 'Session Notes',
    nameHe: 'הערות טיפול',
    icon: FileText,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    prompt: 'Generate professional session notes summarizing today\'s consultation, findings, and treatment provided.',
    description: 'Auto-generate clinical notes'
  },
  {
    id: 'herbal-formula',
    name: 'Herbal Formula',
    nameHe: 'נוסחה צמחית',
    icon: Pill,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    prompt: 'Recommend appropriate Chinese herbal formulas based on the diagnosed pattern, with dosage and modifications.',
    description: 'Herbal prescription helper'
  },
  {
    id: 'point-selection',
    name: 'Point Selection',
    nameHe: 'בחירת נקודות',
    icon: Target,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    prompt: 'Suggest optimal acupuncture point combinations for the current presentation with needling techniques.',
    description: 'Acupoint recommendations'
  },
  {
    id: 'patient-education',
    name: 'Patient Education',
    nameHe: 'הדרכת מטופל',
    icon: Lightbulb,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    prompt: 'Create patient-friendly education materials explaining their condition and self-care recommendations.',
    description: 'Patient handouts'
  },
  {
    id: 'differential-dx',
    name: 'Differential Dx',
    nameHe: 'אבחנה מבדלת',
    icon: Brain,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    prompt: 'Provide differential diagnosis considering multiple TCM patterns that could explain the presentation.',
    description: 'Pattern differentiation'
  },
  {
    id: 'follow-up',
    name: 'Follow-Up Plan',
    nameHe: 'תוכנית המשך',
    icon: Activity,
    color: 'text-teal-600',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    prompt: 'Create a follow-up treatment plan with recommended visit frequency and progression milestones.',
    description: 'Treatment progression'
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    nameHe: 'הערכת סיכון',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    prompt: 'Assess potential risks, contraindications, and safety considerations for the proposed treatment.',
    description: 'Safety check'
  },
  {
    id: 'case-summary',
    name: 'Case Summary',
    nameHe: 'סיכום מקרה',
    icon: BookOpen,
    color: 'text-slate-600',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    prompt: 'Generate a comprehensive case summary suitable for medical records or referral letters.',
    description: 'Documentation'
  },
  {
    id: 'ai-consult',
    name: 'AI Consult',
    nameHe: 'ייעוץ AI',
    icon: Sparkles,
    color: 'text-violet-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    prompt: 'Provide an AI second opinion on the diagnosis and treatment approach with evidence-based recommendations.',
    description: 'Second opinion'
  },
  {
    id: 'lifestyle-rx',
    name: 'Lifestyle Rx',
    nameHe: 'המלצות חיים',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    prompt: 'Generate personalized lifestyle, diet, and exercise recommendations based on TCM principles.',
    description: 'Lifestyle guidance'
  },
];

const STORAGE_KEY = 'tcm-brain-quick-action-boxes';
const DEFAULT_BOXES = ['quick-diagnosis', 'treatment-plan', 'session-notes', 'herbal-formula', 'point-selection', 'patient-education'];

interface QuickActionBoxesProps {
  onActionClick: (prompt: string, actionName: string) => void;
  isLoading?: boolean;
}

export function QuickActionBoxes({ onActionClick, isLoading }: QuickActionBoxesProps) {
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_BOXES;
    } catch {
      return DEFAULT_BOXES;
    }
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedBoxIds));
  }, [selectedBoxIds]);

  const selectedBoxes = selectedBoxIds
    .map(id => ALL_ACTION_BOXES.find(b => b.id === id))
    .filter(Boolean) as QuickActionBox[];

  const toggleBox = (id: string) => {
    setSelectedBoxIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(bid => bid !== id);
      }
      if (prev.length >= 6) {
        toast.warning('Maximum 6 boxes allowed. Remove one first.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleBoxClick = (box: QuickActionBox) => {
    if (isLoading) return;
    toast.info(`Running: ${box.name}`);
    onActionClick(box.prompt, box.name);
  };

  return (
    <div className="space-y-3">
      {/* Header with Configure Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-jade" />
          <span className="text-xs font-semibold text-muted-foreground">Quick Actions</span>
          <Badge variant="outline" className="text-[10px]">
            {selectedBoxes.length}/6
          </Badge>
        </div>
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configure Quick Actions
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">
              Select up to 6 quick actions to display. Click to toggle.
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {ALL_ACTION_BOXES.map(box => {
                const isSelected = selectedBoxIds.includes(box.id);
                const Icon = box.icon;
                return (
                  <button
                    key={box.id}
                    onClick={() => toggleBox(box.id)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left',
                      isSelected 
                        ? `${box.bgColor} ${box.borderColor}` 
                        : 'bg-muted/30 border-transparent hover:border-muted-foreground/20'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      isSelected ? box.bgColor : 'bg-muted'
                    )}>
                      <Icon className={cn('h-4 w-4', isSelected ? box.color : 'text-muted-foreground')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-semibold', isSelected && box.color)}>
                        {box.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {box.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className={cn('h-4 w-4 flex-shrink-0', box.color)} />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBoxIds(DEFAULT_BOXES)}
              >
                Reset to Default
              </Button>
              <Button size="sm" onClick={() => setIsConfigOpen(false)}>
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {selectedBoxes.map((box, index) => {
          const Icon = box.icon;
          return (
            <motion.button
              key={box.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleBoxClick(box)}
              disabled={isLoading}
              className={cn(
                'group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                'hover:scale-105 hover:shadow-lg active:scale-95',
                box.bgColor,
                box.borderColor,
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'bg-background/80 shadow-sm group-hover:shadow-md transition-all',
                'group-hover:scale-110'
              )}>
                <Icon className={cn('h-5 w-5', box.color)} />
              </div>
              <div className="text-center">
                <p className={cn('text-xs font-bold leading-tight', box.color)}>
                  {box.name}
                </p>
                <p className="text-[9px] text-muted-foreground leading-tight mt-0.5" dir="rtl">
                  {box.nameHe}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
