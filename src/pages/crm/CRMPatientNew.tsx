import { CRMLayout } from '@/components/crm/CRMLayout';
import { PatientIntakeForm } from '@/components/crm/PatientIntakeForm';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CRMPatientNew() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/crm/calendar">
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/crm/patients">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Patients
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">New Patient Intake</h1>
            <p className="text-sm text-muted-foreground">
              Complete the intake form for a new patient
            </p>
          </div>
        </div>

        {/* Form */}
        <PatientIntakeForm />
      </div>
    </CRMLayout>
  );
}
