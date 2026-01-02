import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Baby, Shield, FileText, Clock, Stethoscope, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SubjectKey = 'age-methods' | 'techniques' | 'safety' | 'warnings' | 'protocols' | 'sessions' | 'documentation';

const SUBJECTS: { value: SubjectKey; label: string; icon: React.ReactNode }[] = [
  { value: 'age-methods', label: 'Age-Appropriate Methods', icon: <Baby className="h-4 w-4" /> },
  { value: 'techniques', label: 'Techniques (Shonishin & Tuina)', icon: <Hand className="h-4 w-4" /> },
  { value: 'safety', label: 'Safety & Contraindications', icon: <Shield className="h-4 w-4" /> },
  { value: 'warnings', label: 'Critical Safety Warnings', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'protocols', label: 'Treatment Protocols & Points', icon: <Stethoscope className="h-4 w-4" /> },
  { value: 'sessions', label: 'Session Guidelines', icon: <Clock className="h-4 w-4" /> },
  { value: 'documentation', label: 'Documentation & Qualifications', icon: <FileText className="h-4 w-4" /> },
];

export function PediatricAcupunctureGuide({ className }: { className?: string }) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | ''>('');

  return (
    <Card className={className}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
          <Baby className="h-6 w-6" />
          Complete Pediatric Acupuncture Treatment Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as SubjectKey)}>
            <SelectTrigger className="w-full max-w-md border-2 border-primary/50 hover:bg-primary/5">
              <SelectValue placeholder="Select a Subject to View..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject.value} value={subject.value} className="cursor-pointer">
                  <span className="flex items-center gap-2">
                    {subject.icon}
                    {subject.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence mode="wait">
          {selectedSubject && (
            <motion.div
              key={selectedSubject}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {selectedSubject === 'age-methods' && <AgeMethodsSection />}
              {selectedSubject === 'techniques' && <TechniquesSection />}
              {selectedSubject === 'safety' && <SafetySection />}
              {selectedSubject === 'warnings' && <WarningsSection />}
              {selectedSubject === 'protocols' && <ProtocolsSection />}
              {selectedSubject === 'sessions' && <SessionsSection />}
              {selectedSubject === 'documentation' && <DocumentationSection />}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary mb-3">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 mb-4 text-foreground">
      {children}
    </h3>
  );
}

function AgeMethodsSection() {
  return (
    <div>
      <SectionTitle>Age-Appropriate Treatment Methods</SectionTitle>
      <InfoCard>
        <strong>Infants (0-2 years):</strong> Primarily Shonishin (non-insertive). If needles are used: 46-gauge 0.5-inch needles, immediate in/out technique, depth 0.12-0.25 inches.
      </InfoCard>
      <InfoCard>
        <strong>Young Children (2-8 years):</strong> 44-46 gauge 0.5-inch needles. Shallow insertion (0.12-0.5 inches). Quick in/out or brief retention (10s to minutes). Shonishin highly effective.
      </InfoCard>
      <InfoCard>
        <strong>Older Children & Adolescents (8-18 years):</strong> 42-44 gauge 0.5-1 inch needles. Retention 1-15 minutes based on age/comfort. Depths 0.25-0.5 inches.
      </InfoCard>
    </div>
  );
}

function TechniquesSection() {
  return (
    <div>
      <SectionTitle>Specialized Techniques</SectionTitle>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-primary mb-2">Shonishin (Non-Invasive)</h4>
          <InfoCard>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Tools:</strong> Rounded instruments (silver, gold, stone, shell) - enshin, teishin, zanshin.</li>
              <li><strong>Technique:</strong> Rhythmic stroking, rubbing, tapping, pressing (no insertion).</li>
              <li><strong>Duration:</strong> 15-20 mins. Child remains clothed/diapered.</li>
              <li><strong>Frequency:</strong> Several times weekly until resolution. Parents can use silver teaspoon for home care.</li>
            </ul>
          </InfoCard>
        </div>
        <div>
          <h4 className="font-semibold text-primary mb-2">Pediatric Tuina (Massage)</h4>
          <InfoCard>
            For ages 0-9. Incorporates acupressure and manipulation to clear Qi/blood blockages. Treats digestive issues, colic, respiratory conditions, and boosts immunity.
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

function SafetySection() {
  return (
    <div>
      <SectionTitle>Safety Profile & Contraindications</SectionTitle>
      <InfoCard>
        Adverse event rate: <strong>1.55 per 100 treatments</strong> (minor redness/sedation). 
        Serious adverse event rate: <strong>5.36 per 10,000</strong>. 
        No permanent injuries in reviewed trials of 782 patients.
      </InfoCard>
      
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>ABSOLUTE CONTRAINDICATIONS</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Uncontrolled movements/severe behavioral issues.</li>
            <li>Medical emergencies requiring conventional care.</li>
            <li>Active infections at site, severe bleeding disorders.</li>
            <li><strong>Avoid Specific Points:</strong> Fontanelles (under 7 yrs); Pregnancy points in adolescents (LI4, SP6, BL60, BL67, Sacral).</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700 dark:text-amber-400">RELATIVE CONTRAINDICATIONS</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1 text-amber-800 dark:text-amber-300">
            <li>Malignant tumors (do not replace oncology).</li>
            <li>Immunocompromised status (infection risk).</li>
            <li>Edematous limbs, needle phobia, recent trauma/surgery sites (wait 6-8 weeks).</li>
            <li>Infants {"<"} 1 month (Prefer Shonishin).</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function WarningsSection() {
  return (
    <div>
      <SectionTitle>🚨 Critical Safety Warnings</SectionTitle>
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Needle Depth</AlertTitle>
          <AlertDescription>
            Never exceed 0.5 inches in children {"<"} 12. Precise depth needed for upper back/chest (pneumothorax risk). Angle away from vital organs.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Needle Gauge</AlertTitle>
          <AlertDescription>
            Never use adult needles (32-36g). Use 46g for babies, 44-46g for toddlers, 42-44g for adolescents.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sterility</AlertTitle>
          <AlertDescription>
            Single-use sterile disposables only. Strict aseptic technique.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Consent</AlertTitle>
          <AlertDescription>
            Informed parental consent required. Parent must be present. Child has right to refuse.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

function ProtocolsSection() {
  return (
    <div>
      <SectionTitle>Recommended Points by Condition</SectionTitle>
      <div className="space-y-3">
        <InfoCard>
          <strong>Digestive (Colic/Constipation):</strong> CV 8 (pressure only), CV 12, ST 36, SP 6, Tuina abdominal massage.
        </InfoCard>
        <InfoCard>
          <strong>Respiratory (Asthma/Colds):</strong> LU 1-2, CV 17, BL 13 (minimal insertion).
        </InfoCard>
        <InfoCard>
          <strong>Sleep & Anxiety:</strong> HT 7, PC 6, Yintang, Anmian.
        </InfoCard>
        <InfoCard>
          <strong>Immune Support:</strong> ST 36 (Primary pediatric point), LI 4 ({">"}2 yrs), LI 11.
        </InfoCard>
        <InfoCard>
          <strong>Developmental:</strong> GV 20, Sishencong, Scalp zones.
        </InfoCard>
      </div>
    </div>
  );
}

function SessionsSection() {
  return (
    <div>
      <SectionTitle>Treatment Session Guidelines</SectionTitle>
      <InfoCard>
        <strong>Preparation:</strong> Warm room, toys/distractions. Use simple language. Allow child to touch clean needle (if appropriate).
      </InfoCard>
      <InfoCard>
        <strong>During:</strong> Min. needles (4-8 max). Quick insertion. Stop immediately if child is distressed. Never force treatment.
      </InfoCard>
      <InfoCard>
        <strong>Frequency:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Acute: 2-3x/week for 2-4 weeks</li>
          <li>Chronic: 1x/week for 8-12 weeks</li>
          <li>Maintenance: Monthly</li>
        </ul>
      </InfoCard>
    </div>
  );
}

function DocumentationSection() {
  return (
    <div>
      <SectionTitle>Documentation & Red Flags</SectionTitle>
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>STOP Treatment & Refer If:</AlertTitle>
        <AlertDescription>
          Fever post-treatment, excessive bleeding, signs of infection, severe pain, neurological symptoms, allergic reaction, or condition worsens after 4-6 treatments.
        </AlertDescription>
      </Alert>
      <InfoCard>
        <strong>Documentation:</strong> Record age, weight, developmental status, needle gauge/depth/retention, child's response, and adverse reactions.
      </InfoCard>
      <InfoCard>
        <strong>Qualifications:</strong> Licensed acupuncturist with pediatric specialization/Shonishin training, pediatric CPR cert, and appropriate malpractice coverage.
      </InfoCard>
    </div>
  );
}

export default PediatricAcupunctureGuide;
