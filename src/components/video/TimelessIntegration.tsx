import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  ExternalLink, 
  Link2, 
  Unlink, 
  CheckCircle2, 
  Clock,
  Mic,
  FileText,
  Sparkles,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface TimelessIntegrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIMELESS_REFERRAL_URL = 'https://my.timeless.day/?via=Letsai26';
const STORAGE_KEY = 'timeless_account_linked';

export function TimelessIntegration({ open, onOpenChange }: TimelessIntegrationProps) {
  const [isLinked, setIsLinked] = useState(false);
  const [timelessEmail, setTimelessEmail] = useState('');

  useEffect(() => {
    // Check if already linked
    const linkedData = localStorage.getItem(STORAGE_KEY);
    if (linkedData) {
      try {
        const parsed = JSON.parse(linkedData);
        setIsLinked(true);
        setTimelessEmail(parsed.email || '');
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleLinkAccount = () => {
    if (!timelessEmail.trim()) {
      toast.error('יש להזין כתובת אימייל');
      return;
    }

    // Save link status
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      email: timelessEmail,
      linkedAt: new Date().toISOString(),
    }));

    setIsLinked(true);
    toast.success('החשבון קושר בהצלחה');
  };

  const handleUnlink = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsLinked(false);
    setTimelessEmail('');
    toast.info('החשבון נותק');
  };

  const openTimelessDashboard = () => {
    window.open(TIMELESS_REFERRAL_URL, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-jade" />
            Timeless.day Integration
          </DialogTitle>
          <DialogDescription>
            שרות הקלטה ותמלול מתקדם לפגישות זום ושיחות
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Features Card */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">מה זה Timeless.day?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Mic className="h-4 w-4 text-jade mt-0.5" />
                  <span>הקלטת שיחות Zoom</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-jade mt-0.5" />
                  <span>תמלול אוטומטי</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-jade mt-0.5" />
                  <span>סיכום AI חכם</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-jade mt-0.5" />
                  <span>אבטחה מתקדמת</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Timeless.day מאפשר להקליט פגישות זום, לתמלל אותן אוטומטית ולקבל סיכומים חכמים באמצעות AI. 
                השירות עובד בנפרד מהמערכת שלנו ומציע יכולות מתקדמות להקלטה.
              </p>
            </CardContent>
          </Card>

          {/* Link Status */}
          {isLinked ? (
            <Card className="border-jade/50 bg-jade/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-jade" />
                    <div>
                      <p className="font-medium text-sm">חשבון מקושר</p>
                      <p className="text-xs text-muted-foreground">{timelessEmail}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleUnlink}>
                    <Unlink className="h-4 w-4 mr-1" />
                    נתק
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="timeless-email">אימייל חשבון Timeless</Label>
                <Input
                  id="timeless-email"
                  type="email"
                  placeholder="your@email.com"
                  value={timelessEmail}
                  onChange={(e) => setTimelessEmail(e.target.value)}
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  הזן את האימייל שבו נרשמת ל-Timeless.day
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleLinkAccount}
                  className="flex-1 gap-2 bg-jade hover:bg-jade/90"
                >
                  <Link2 className="h-4 w-4" />
                  קשר חשבון
                </Button>
                <Button 
                  variant="outline" 
                  onClick={openTimelessDashboard}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  פתח חשבון חדש
                </Button>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                איך להשתמש?
                <Badge variant="secondary" className="text-xs">מומלץ</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>פתח חשבון ב-Timeless.day (חינם להתחיל)</li>
                <li>התקן את התוסף לדפדפן או לזום</li>
                <li>הפעל הקלטה בתחילת הפגישה</li>
                <li>קבל תמלול וסיכום אוטומטי בסיום</li>
                <li>העתק את הסיכום למערכת שלנו</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            סגור
          </Button>
          <Button 
            onClick={openTimelessDashboard}
            className="gap-2 bg-jade hover:bg-jade/90"
          >
            <ExternalLink className="h-4 w-4" />
            עבור ל-Timeless.day
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
