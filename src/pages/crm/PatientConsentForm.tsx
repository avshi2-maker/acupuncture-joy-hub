import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SignaturePad } from '@/components/crm/SignaturePad';
import { 
  FileSignature, 
  Shield, 
  AlertTriangle, 
  Heart, 
  Leaf,
  CheckCircle2,
  ArrowLeft,
  User,
  Calendar,
} from 'lucide-react';
import { siteConfig } from '@/config/site';

interface Patient {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  consent_signed: boolean | null;
  consent_signed_at: string | null;
  consent_signature: string | null;
}

const consentSections = [
  {
    id: 'nature',
    title: 'Nature of Treatment',
    icon: Leaf,
    content: `I understand that Traditional Chinese Medicine (TCM) encompasses various treatment modalities including acupuncture, cupping, moxibustion, gua sha, tui na massage, and herbal medicine. These are alternative healthcare approaches that complement Western medicine.`,
  },
  {
    id: 'acupuncture',
    title: 'Acupuncture Treatment',
    icon: Heart,
    content: `I understand that acupuncture involves the insertion of sterile, single-use needles into specific points on the body. Potential side effects may include:
• Minor bruising or bleeding at needle sites
• Temporary soreness or discomfort
• Rare risks include infection, nerve damage, or punctured organs (extremely rare with proper technique)
• Possible temporary worsening of symptoms before improvement
• Fainting or dizziness (rare)`,
  },
  {
    id: 'cupping',
    title: 'Cupping & Other Techniques',
    icon: Shield,
    content: `I understand that cupping therapy may leave temporary marks on the skin that typically fade within 1-2 weeks. Moxibustion involves the burning of herbs near the skin and carries a small risk of burns. Gua sha may cause temporary redness or bruising.`,
  },
  {
    id: 'herbs',
    title: 'Herbal Medicine',
    icon: Leaf,
    content: `I understand that herbal formulas may be prescribed as part of my treatment. I agree to:
• Inform my practitioner of all medications and supplements I currently take
• Report any unusual reactions to herbal formulas immediately
• Not take herbal formulas if I am or may become pregnant without first consulting my practitioner
• Follow dosage instructions carefully`,
  },
  {
    id: 'privacy',
    title: 'Privacy & Confidentiality',
    icon: Shield,
    content: `I consent to the collection, storage, and use of my personal health information for the purposes of:
• Providing treatment and healthcare services
• Maintaining accurate medical records
• Communicating with other healthcare providers if necessary (with my permission)
• Billing and administrative purposes

My information will be kept confidential in accordance with applicable privacy laws and will not be shared without my consent, except as required by law.`,
  },
  {
    id: 'responsibility',
    title: 'Patient Responsibility',
    icon: AlertTriangle,
    content: `I agree to:
• Provide accurate and complete health information
• Inform my practitioner of any changes to my health status
• Follow treatment recommendations to the best of my ability
• Ask questions if I do not understand any aspect of my treatment
• Arrive on time for appointments or provide 24 hours notice for cancellations`,
  },
];

export default function PatientConsentForm() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [acceptedSections, setAcceptedSections] = useState<Set<string>>(new Set());
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatureSaved, setSignatureSaved] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const fetchPatient = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, date_of_birth, consent_signed, consent_signed_at, consent_signature')
      .eq('id', patientId)
      .maybeSingle();

    if (error || !data) {
      toast.error('Patient not found');
      navigate('/crm/patients');
      return;
    }

    setPatient(data);
    
    // If already signed, pre-fill the sections
    if (data.consent_signed) {
      setAcceptedSections(new Set(consentSections.map(s => s.id)));
      setSignatureSaved(true);
    }
    
    setLoading(false);
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    const newSet = new Set(acceptedSections);
    if (checked) {
      newSet.add(sectionId);
    } else {
      newSet.delete(sectionId);
    }
    setAcceptedSections(newSet);
  };

  const handleSignatureSave = async (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
    setSignatureSaved(true);
    toast.success('Signature captured');
  };

  const handleSubmitConsent = async () => {
    if (!user || !patient || !signatureDataUrl) return;
    
    // Check all sections are accepted
    if (acceptedSections.size !== consentSections.length) {
      toast.error('Please accept all consent sections');
      return;
    }

    setSaving(true);
    try {
      // Convert data URL to blob
      const response = await fetch(signatureDataUrl);
      const blob = await response.blob();
      
      // Upload to storage
      const fileName = `${patient.id}/${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('signatures')
        .getPublicUrl(fileName);

      // Update patient record
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          consent_signed: true,
          consent_signed_at: new Date().toISOString(),
          consent_signature: urlData.publicUrl,
        })
        .eq('id', patient.id);

      if (updateError) throw updateError;

      // Create consent record
      const { error: consentError } = await supabase
        .from('patient_consents')
        .insert([{
          patient_id: patient.id,
          consent_type: 'treatment_consent',
          form_version: '1.0',
          signature: urlData.publicUrl,
          signed_at: new Date().toISOString(),
          answers: {
            sections_accepted: Array.from(acceptedSections),
            accepted_all: true,
          },
        }]);

      if (consentError) throw consentError;

      toast.success('Consent form submitted successfully');
      navigate(`/crm/patients/${patient.id}`);
    } catch (error: any) {
      console.error('Error submitting consent:', error);
      toast.error(error.message || 'Failed to submit consent');
    } finally {
      setSaving(false);
    }
  };

  const allSectionsAccepted = acceptedSections.size === consentSections.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!patient) return null;

  // If already signed, show the completed view
  if (patient.consent_signed && patient.consent_signed_at) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-jade/5 to-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-jade/30">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl font-display">Consent Already Signed</CardTitle>
              <CardDescription>
                {patient.full_name} has already signed the consent form
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Signed on {format(new Date(patient.consent_signed_at), 'MMMM d, yyyy \'at\' h:mm a')}
              </p>
              {patient.consent_signature && (
                <div className="p-4 bg-white rounded-lg border inline-block">
                  <img 
                    src={patient.consent_signature} 
                    alt="Signature" 
                    className="max-h-24"
                  />
                </div>
              )}
              <div className="pt-4 flex gap-2 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/crm/calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={`/crm/patients/${patient.id}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Patient
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-jade/5 to-background">
      {/* Header */}
      <div className="bg-jade text-white py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileSignature className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-display font-semibold">{siteConfig.name}</h1>
                <p className="text-jade-light/80 text-sm">Informed Consent Form</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
              <Link to="/crm/calendar">
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        {/* Patient Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-jade/10 flex items-center justify-center">
                <User className="h-6 w-6 text-jade" />
              </div>
              <div>
                <p className="font-medium text-lg">{patient.full_name}</p>
                {patient.date_of_birth && (
                  <p className="text-sm text-muted-foreground">
                    DOB: {format(new Date(patient.date_of_birth), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-jade" />
              Treatment Consent Agreement
            </CardTitle>
            <CardDescription>
              Please read each section carefully and check the box to indicate your understanding and agreement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] md:h-auto md:max-h-none pr-4">
              <div className="space-y-6">
                {consentSections.map((section) => {
                  const Icon = section.icon;
                  const isAccepted = acceptedSections.has(section.id);
                  
                  return (
                    <div 
                      key={section.id} 
                      className={cn(
                        'p-4 rounded-lg border transition-colors',
                        isAccepted ? 'border-jade/50 bg-jade/5' : 'border-border'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={section.id}
                          checked={isAccepted}
                          onCheckedChange={(checked) => handleSectionToggle(section.id, !!checked)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <Label 
                            htmlFor={section.id} 
                            className="flex items-center gap-2 text-base font-medium cursor-pointer"
                          >
                            <Icon className="h-4 w-4 text-jade" />
                            {section.title}
                          </Label>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {section.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {acceptedSections.size} of {consentSections.length} sections accepted
          </span>
          {allSectionsAccepted && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              All sections accepted
            </Badge>
          )}
        </div>

        {/* Signature Section */}
        <Card className={cn(
          'transition-opacity',
          !allSectionsAccepted && 'opacity-50 pointer-events-none'
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-jade" />
              Digital Signature
            </CardTitle>
            <CardDescription>
              By signing below, I acknowledge that I have read, understood, and agree to all sections above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignaturePad
              onSave={handleSignatureSave}
              onClear={() => setSignatureSaved(false)}
              disabled={!allSectionsAccepted}
              width={500}
              height={200}
            />
            
            {signatureSaved && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Signature captured successfully
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            asChild
          >
            <Link to={`/crm/patients/${patient.id}`}>
              Cancel
            </Link>
          </Button>
          <Button
            className="flex-1 bg-jade hover:bg-jade/90"
            disabled={!allSectionsAccepted || !signatureSaved || saving}
            onClick={handleSubmitConsent}
          >
            {saving ? 'Submitting...' : 'Submit Consent Form'}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          Date: {format(new Date(), 'MMMM d, yyyy')} • Form Version: 1.0
        </p>
      </div>
    </div>
  );
}
