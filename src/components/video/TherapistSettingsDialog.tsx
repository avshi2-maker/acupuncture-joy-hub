import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Video, Save } from 'lucide-react';
import { toast } from 'sonner';

interface TherapistSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ZOOM_LINK_STORAGE_KEY = 'therapist_zoom_link';
const THERAPIST_NAME_KEY = 'therapist_display_name';

export function TherapistSettingsDialog({
  open,
  onOpenChange,
}: TherapistSettingsDialogProps) {
  const [zoomLink, setZoomLink] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Load saved settings on mount
  useEffect(() => {
    if (open) {
      const savedLink = localStorage.getItem(ZOOM_LINK_STORAGE_KEY) || '';
      const savedName = localStorage.getItem(THERAPIST_NAME_KEY) || '';
      setZoomLink(savedLink);
      setDisplayName(savedName);
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem(ZOOM_LINK_STORAGE_KEY, zoomLink);
    localStorage.setItem(THERAPIST_NAME_KEY, displayName);
    toast.success('ההגדרות נשמרו בהצלחה');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-jade" />
            הגדרות מטפל
          </DialogTitle>
          <DialogDescription>
            הגדר את פרטי החשבון שלך לשימוש בפגישות וידאו
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">שם להצגה</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="השם שלך"
            />
          </div>

          {/* Zoom Personal Link */}
          <div className="space-y-2">
            <Label htmlFor="zoom-link" className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              קישור Zoom אישי
            </Label>
            <Input
              id="zoom-link"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/j/your-meeting-id"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              קישור זה ישמש כברירת מחדל בעת שליחת הזמנות לפגישות וידאו
            </p>
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 טיפ:</strong> השתמש בקישור החדר האישי שלך מ-Zoom כדי שמטופלים יוכלו להצטרף בקלות לכל פגישה.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} className="gap-2 bg-jade hover:bg-jade/90">
            <Save className="h-4 w-4" />
            שמור הגדרות
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
