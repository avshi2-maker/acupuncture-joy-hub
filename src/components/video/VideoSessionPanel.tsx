import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Square, 
  Printer, 
  Mail, 
  MessageCircle,
  Video,
  Sparkles,
  UserPlus,
  Calendar,
  VideoIcon,
  Settings,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { saveSessionReport, printReport, LocalSessionReport } from '@/utils/localDataStorage';
import { AnxietyQADialog } from './AnxietyQADialog';
import { QuickPatientDialog } from './QuickPatientDialog';
import { QuickAppointmentDialog } from './QuickAppointmentDialog';
import { ZoomInviteDialog } from './ZoomInviteDialog';
import { TherapistSettingsDialog } from './TherapistSettingsDialog';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Patient {
  id: string;
  full_name: string;
  phone: string | null;
}

interface VideoSessionPanelProps {
  onSessionEnd?: (report: LocalSessionReport) => void;
}

export function VideoSessionPanel({ onSessionEnd }: VideoSessionPanelProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [showAnxietyQA, setShowAnxietyQA] = useState(false);
  const [showQuickPatient, setShowQuickPatient] = useState(false);
  const [showQuickAppointment, setShowQuickAppointment] = useState(false);
  const [showZoomInvite, setShowZoomInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    status: sessionStatus,
    duration: sessionDuration,
    notes: sessionNotes,
    patientId: selectedPatientId,
    patientName: selectedPatientName,
    patientPhone: selectedPatientPhone,
    anxietyConversation,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    resetSession,
    setNotes,
    setPatient,
    setAnxietyConversation,
  } = useSessionPersistence();

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, full_name, phone')
          .eq('therapist_id', user.id)
          .order('full_name');
        
        if (error) throw error;
        setPatients(data || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [user]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startSession();
    toast.success('פגישת וידאו התחילה');
  };

  const handlePause = () => {
    pauseSession();
    toast.info('הפגישה הושהתה');
  };

  const handleResume = () => {
    resumeSession();
    toast.info('הפגישה ממשיכה');
  };

  const handleRepeat = () => {
    resetSession();
    toast.info('הפגישה אופסה');
  };

  const handleEnd = () => {
    endSession();
    
    // Save report locally
    if (selectedPatientId && selectedPatientName) {
      const report = saveSessionReport({
        patientId: selectedPatientId,
        patientName: selectedPatientName,
        visitDate: new Date().toISOString(),
        notes: sessionNotes + (anxietyConversation.length > 0 
          ? '\n\n--- שאלון חרדה ---\n' + anxietyConversation.join('\n') 
          : ''),
        cupping: false,
        moxa: false,
      });
      
      toast.success('הפגישה נשמרה מקומית');
      onSessionEnd?.(report);
    } else {
      toast.warning('לא נבחר מטופל - הדוח לא נשמר');
    }
  };

  const handlePatientSelect = (patientId: string) => {
    if (patientId === 'none') {
      setPatient(null);
      return;
    }
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setPatient({
        id: patient.id,
        name: patient.full_name,
        phone: patient.phone || undefined,
      });
    }
  };

  const handlePrint = () => {
    if (selectedPatientId && selectedPatientName) {
      const report: LocalSessionReport = {
        id: `temp_${Date.now()}`,
        patientId: selectedPatientId,
        patientName: selectedPatientName,
        visitDate: new Date().toISOString(),
        notes: sessionNotes,
        cupping: false,
        moxa: false,
        savedAt: new Date().toISOString(),
      };
      printReport(report);
    } else {
      toast.error('בחר מטופל להדפסת דוח');
    }
  };

  const handleSendEmail = () => {
    toast.info('שליחת דוח באימייל - בקרוב');
  };

  const handleSendWhatsApp = () => {
    if (!selectedPatientName) {
      toast.error('בחר מטופל קודם');
      return;
    }
    const message = encodeURIComponent(
      `דוח טיפול - ${selectedPatientName}\n` +
      `תאריך: ${new Date().toLocaleDateString('he-IL')}\n` +
      `משך: ${formatDuration(sessionDuration)}\n\n` +
      `הערות: ${sessionNotes}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Patient Selection */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedPatientId || 'none'}
              onValueChange={handlePatientSelect}
              disabled={loadingPatients}
            >
              <SelectTrigger className="flex-1 bg-background">
                <SelectValue placeholder={loadingPatients ? "טוען..." : "בחר מטופל"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                <SelectItem value="none">ללא מטופל</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
              title="הגדרות"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Area */}
      <Card className="flex-1 bg-muted/50">
        <CardContent className="p-0 h-full flex items-center justify-center relative">
          <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-jade/10 to-jade/5 rounded-lg flex flex-col items-center justify-center">
            <Video className="h-16 w-16 text-jade/40 mb-4" />
            <p className="text-muted-foreground text-lg">אזור וידאו</p>
            <p className="text-sm text-muted-foreground mt-1">Zoom / Google Meet</p>
            
            {/* Session Status Badge */}
            {sessionStatus !== 'idle' && (
              <Badge 
                className={`mt-4 ${
                  sessionStatus === 'running' ? 'bg-jade animate-pulse' : 
                  sessionStatus === 'paused' ? 'bg-gold' : 
                  'bg-destructive'
                }`}
              >
                {sessionStatus === 'running' ? '● בשידור חי' :
                 sessionStatus === 'paused' ? '⏸ מושהה' :
                 '■ הסתיים'}
              </Badge>
            )}
            
            {/* Timer */}
            <p className="text-2xl font-mono mt-4 text-jade">
              {formatDuration(sessionDuration)}
            </p>
            
            {/* Active patient indicator */}
            {selectedPatientName && sessionStatus === 'running' && (
              <Badge variant="outline" className="mt-2">
                {selectedPatientName}
              </Badge>
            )}
          </div>
          
          {/* Quick Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAnxietyQA(true)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              שאלון חרדה
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickPatient(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              מטופל חדש
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickAppointment(true)}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              קביעת תור
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowZoomInvite(true)}
              className="gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <VideoIcon className="h-4 w-4" />
              הזמנת Zoom
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="h-5 w-5 text-jade" />
            בקרת פגישה
            {selectedPatientName && (
              <Badge variant="outline" className="mr-auto">
                {selectedPatientName}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2">
            {sessionStatus === 'idle' && (
              <Button onClick={handleStart} className="bg-jade hover:bg-jade/90 gap-2">
                <Play className="h-4 w-4" />
                התחל פגישה
              </Button>
            )}
            
            {sessionStatus === 'running' && (
              <Button onClick={handlePause} variant="secondary" className="gap-2">
                <Pause className="h-4 w-4" />
                השהה
              </Button>
            )}
            
            {sessionStatus === 'paused' && (
              <Button onClick={handleResume} className="bg-jade hover:bg-jade/90 gap-2">
                <Play className="h-4 w-4" />
                המשך
              </Button>
            )}
            
            {(sessionStatus === 'running' || sessionStatus === 'paused') && (
              <>
                <Button onClick={handleRepeat} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  התחל מחדש
                </Button>
                <Button onClick={handleEnd} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  סיים ושמור
                </Button>
              </>
            )}
            
            {sessionStatus === 'ended' && (
              <Button onClick={handleRepeat} className="bg-jade hover:bg-jade/90 gap-2">
                <RotateCcw className="h-4 w-4" />
                פגישה חדשה
              </Button>
            )}
          </div>

          {/* Session Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">הערות פגישה:</label>
            <Textarea
              value={sessionNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="רשום הערות במהלך הפגישה..."
              rows={3}
            />
          </div>

          {/* Report Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              הדפס דוח
            </Button>
            <Button onClick={handleSendEmail} variant="outline" size="sm" className="gap-2">
              <Mail className="h-4 w-4" />
              שלח באימייל
            </Button>
            <Button onClick={handleSendWhatsApp} variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              שלח בוואטסאפ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AnxietyQADialog
        open={showAnxietyQA}
        onOpenChange={setShowAnxietyQA}
        onConversationSave={(conv) => setAnxietyConversation(conv)}
      />
      
      <QuickPatientDialog
        open={showQuickPatient}
        onOpenChange={setShowQuickPatient}
      />
      
      <QuickAppointmentDialog
        open={showQuickAppointment}
        onOpenChange={setShowQuickAppointment}
        patientId={selectedPatientId || undefined}
        patientName={selectedPatientName || undefined}
      />
      
      <ZoomInviteDialog
        open={showZoomInvite}
        onOpenChange={setShowZoomInvite}
        patientName={selectedPatientName || undefined}
        patientPhone={selectedPatientPhone || undefined}
      />
      
      <TherapistSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
