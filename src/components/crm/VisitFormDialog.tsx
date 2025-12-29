import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { usePrintContent } from '@/hooks/usePrintContent';

const visitSchema = z.object({
  visit_date: z.string().min(1, 'Visit date is required'),
  chief_complaint: z.string().optional(),
  tongue_diagnosis: z.string().optional(),
  pulse_diagnosis: z.string().optional(),
  tcm_pattern: z.string().optional(),
  treatment_principle: z.string().optional(),
  points_used: z.string().optional(),
  herbs_prescribed: z.string().optional(),
  cupping: z.boolean().default(false),
  moxa: z.boolean().default(false),
  other_techniques: z.string().optional(),
  follow_up_recommended: z.string().optional(),
  notes: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

interface Visit {
  id: string;
  visit_date: string;
  chief_complaint: string | null;
  tongue_diagnosis: string | null;
  pulse_diagnosis: string | null;
  tcm_pattern: string | null;
  treatment_principle: string | null;
  points_used: string[] | null;
  herbs_prescribed: string | null;
  cupping: boolean | null;
  moxa: boolean | null;
  other_techniques: string | null;
  follow_up_recommended: string | null;
  notes: string | null;
}

interface VisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  visit?: Visit | null;
  onSaved: () => void;
}

export function VisitFormDialog({ open, onOpenChange, patientId, visit, onSaved }: VisitFormDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isEditing = !!visit;
  const formRef = useRef<HTMLDivElement>(null);
  const { printContent } = usePrintContent();

  const handlePrint = () => {
    printContent(formRef.current, { title: isEditing ? 'Edit Visit Record' : 'New Visit Record' });
  };

  const createVoiceHandler = (fieldName: keyof VisitFormData) => (text: string) => {
    const currentValue = form.getValues(fieldName);
    const newValue = currentValue ? `${currentValue} ${text}` : text;
    form.setValue(fieldName, newValue as any);
  };

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visit_date: format(new Date(), 'yyyy-MM-dd'),
      chief_complaint: '',
      tongue_diagnosis: '',
      pulse_diagnosis: '',
      tcm_pattern: '',
      treatment_principle: '',
      points_used: '',
      herbs_prescribed: '',
      cupping: false,
      moxa: false,
      other_techniques: '',
      follow_up_recommended: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (visit) {
      form.reset({
        visit_date: format(new Date(visit.visit_date), 'yyyy-MM-dd'),
        chief_complaint: visit.chief_complaint || '',
        tongue_diagnosis: visit.tongue_diagnosis || '',
        pulse_diagnosis: visit.pulse_diagnosis || '',
        tcm_pattern: visit.tcm_pattern || '',
        treatment_principle: visit.treatment_principle || '',
        points_used: visit.points_used?.join(', ') || '',
        herbs_prescribed: visit.herbs_prescribed || '',
        cupping: visit.cupping || false,
        moxa: visit.moxa || false,
        other_techniques: visit.other_techniques || '',
        follow_up_recommended: visit.follow_up_recommended || '',
        notes: visit.notes || '',
      });
    } else {
      form.reset({
        visit_date: format(new Date(), 'yyyy-MM-dd'),
        chief_complaint: '',
        tongue_diagnosis: '',
        pulse_diagnosis: '',
        tcm_pattern: '',
        treatment_principle: '',
        points_used: '',
        herbs_prescribed: '',
        cupping: false,
        moxa: false,
        other_techniques: '',
        follow_up_recommended: '',
        notes: '',
      });
    }
  }, [visit, open]);

  const onSubmit = async (data: VisitFormData) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const pointsArray = data.points_used
        ? data.points_used.split(',').map(p => p.trim()).filter(Boolean)
        : [];

      const visitData = {
        patient_id: patientId,
        therapist_id: user.id,
        visit_date: new Date(data.visit_date).toISOString(),
        chief_complaint: data.chief_complaint || null,
        tongue_diagnosis: data.tongue_diagnosis || null,
        pulse_diagnosis: data.pulse_diagnosis || null,
        tcm_pattern: data.tcm_pattern || null,
        treatment_principle: data.treatment_principle || null,
        points_used: pointsArray.length > 0 ? pointsArray : null,
        herbs_prescribed: data.herbs_prescribed || null,
        cupping: data.cupping,
        moxa: data.moxa,
        other_techniques: data.other_techniques || null,
        follow_up_recommended: data.follow_up_recommended || null,
        notes: data.notes || null,
      };

      if (isEditing && visit) {
        const { error } = await supabase.from('visits').update(visitData).eq('id', visit.id);
        if (error) throw error;
        toast.success('Visit updated');
      } else {
        const { error } = await supabase.from('visits').insert([visitData]);
        if (error) throw error;
        toast.success('Visit recorded');
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving visit:', error);
      toast.error(error.message || 'Failed to save visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{isEditing ? 'Edit Visit' : 'Record New Visit'}</DialogTitle>
            <Button type="button" variant="outline" size="sm" onClick={handlePrint} className="no-print">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogHeader>

        <div ref={formRef}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="visit_date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Date *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="chief_complaint" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chief Complaint</FormLabel>
                    <FormControl><Input placeholder="Main reason for visit" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="tongue_diagnosis" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Tongue Diagnosis</FormLabel>
                      <VoiceInputButton onTranscription={createVoiceHandler('tongue_diagnosis')} size="sm" className="no-print" />
                    </div>
                    <FormControl><Textarea placeholder="Color, coating, shape..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pulse_diagnosis" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Pulse Diagnosis</FormLabel>
                      <VoiceInputButton onTranscription={createVoiceHandler('pulse_diagnosis')} size="sm" className="no-print" />
                    </div>
                    <FormControl><Textarea placeholder="Rate, quality, position..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="tcm_pattern" render={({ field }) => (
                <FormItem>
                  <FormLabel>TCM Pattern/Diagnosis</FormLabel>
                  <FormControl><Input placeholder="e.g., Liver Qi Stagnation" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="treatment_principle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Principle</FormLabel>
                  <FormControl><Input placeholder="e.g., Soothe Liver, Tonify Kidney Yang" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-6">
                <FormField control={form.control} name="cupping" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal">Cupping</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="moxa" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal">Moxibustion</FormLabel>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="points_used" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Acupuncture Points Used</FormLabel>
                    <VoiceInputButton onTranscription={createVoiceHandler('points_used')} size="sm" className="no-print" />
                  </div>
                  <FormControl><Textarea placeholder="Enter points separated by commas (e.g., LI4, ST36, SP6)" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="herbs_prescribed" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Herbs Prescribed</FormLabel>
                    <VoiceInputButton onTranscription={createVoiceHandler('herbs_prescribed')} size="sm" className="no-print" />
                  </div>
                  <FormControl><Textarea placeholder="Formula name and/or individual herbs with dosages" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="other_techniques" render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Techniques</FormLabel>
                  <FormControl><Input placeholder="e.g., Gua Sha, Tui Na, Ear Seeds" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Visit Notes</FormLabel>
                    <VoiceInputButton onTranscription={createVoiceHandler('notes')} size="sm" className="no-print" />
                  </div>
                  <FormControl><Textarea placeholder="Additional observations, patient response, etc." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="follow_up_recommended" render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Recommendations</FormLabel>
                  <FormControl><Input placeholder="e.g., Return in 1 week" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-3 no-print">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-jade hover:bg-jade/90">
                  {loading ? 'Saving...' : isEditing ? 'Update Visit' : 'Save Visit'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
