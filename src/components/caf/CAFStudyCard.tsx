import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Brain, Pill, MapPin, Stethoscope, Activity } from 'lucide-react';

interface CAFStudy {
  id: number;
  system_category: string;
  western_label: string;
  tcm_pattern: string;
  key_symptoms: string | null;
  pulse_tongue: string | null;
  treatment_principle: string | null;
  acupoints_display: string | null;
  pharmacopeia_formula: string | null;
  deep_thinking_note: string | null;
}

interface CAFStudyCardProps {
  study: CAFStudy;
}

const systemColors: Record<string, string> = {
  'Respiratory': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  'Digestive': 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  'Cardiovascular': 'bg-red-500/20 text-red-700 dark:text-red-300',
  'Psychological': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  'Musculoskeletal': 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  'Neurological': 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
  'Gynecology': 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
  'Dermatology': 'bg-teal-500/20 text-teal-700 dark:text-teal-300',
  'Mens Health': 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
  'Metabolic': 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
  'Immunology': 'bg-green-500/20 text-green-700 dark:text-green-300',
  'Endocrine': 'bg-violet-500/20 text-violet-700 dark:text-violet-300',
  'Eye/Ear': 'bg-sky-500/20 text-sky-700 dark:text-sky-300',
  'Pain Management': 'bg-red-600/20 text-red-800 dark:text-red-200',
  'Addiction': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
  'Pediatrics': 'bg-lime-500/20 text-lime-700 dark:text-lime-300',
  'Internal': 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  'Autoimmune': 'bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300',
  'Geriatrics': 'bg-stone-500/20 text-stone-700 dark:text-stone-300',
  'Skin': 'bg-teal-600/20 text-teal-800 dark:text-teal-200',
  'Acute': 'bg-red-700/20 text-red-900 dark:text-red-100',
  'Gastro': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  'Energy': 'bg-amber-600/20 text-amber-800 dark:text-amber-200',
  'Sleep': 'bg-indigo-600/20 text-indigo-800 dark:text-indigo-200',
};

export function CAFStudyCard({ study }: CAFStudyCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const systemColor = systemColors[study.system_category] || 'bg-muted text-muted-foreground';

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="outline" className={systemColor}>
                    {study.system_category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    #{study.id}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold leading-tight">
                  {study.western_label}
                </CardTitle>
                <p className="text-sm text-primary font-medium mt-1">
                  {study.tcm_pattern}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Key Symptoms */}
            {study.key_symptoms && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  Key Symptoms
                </div>
                <p className="text-sm pl-6">{study.key_symptoms}</p>
              </div>
            )}

            {/* Pulse & Tongue */}
            {study.pulse_tongue && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Stethoscope className="h-4 w-4" />
                  Pulse & Tongue
                </div>
                <p className="text-sm pl-6">{study.pulse_tongue}</p>
              </div>
            )}

            {/* Treatment Principle */}
            {study.treatment_principle && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  Treatment Principle
                </div>
                <p className="text-sm pl-6 font-medium text-foreground">{study.treatment_principle}</p>
              </div>
            )}

            {/* Acupoints */}
            {study.acupoints_display && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Acupoints
                </div>
                <div className="pl-6 flex flex-wrap gap-1">
                  {study.acupoints_display.split(',').map((point, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {point.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Formula */}
            {study.pharmacopeia_formula && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Pill className="h-4 w-4" />
                  Formula
                </div>
                <p className="text-sm pl-6 font-medium">{study.pharmacopeia_formula}</p>
              </div>
            )}

            {/* Deep Thinking Note - The Ferrari Feature */}
            {study.deep_thinking_note && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  <Brain className="h-4 w-4" />
                  🧠 Clinical Insight (Deep Thinking)
                </div>
                <p className="text-sm italic text-foreground/90">
                  "{study.deep_thinking_note}"
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
