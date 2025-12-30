import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ShareQRButtonProps {
  url?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function ShareQRButton({
  url = typeof window !== 'undefined' ? window.location.origin + '/install' : '',
  title = 'Share CM Clinic',
  description = 'Scan this code to install CM Clinic app',
  buttonText = 'Share',
  buttonVariant = 'outline',
  buttonSize = 'default',
  className = '',
  showLabel = true,
}: ShareQRButtonProps) {
  const [open, setOpen] = useState(false);
  const haptic = useHapticFeedback();

  const handleShare = async () => {
    haptic.light();
    const shareData = {
      title: 'CM Clinic App',
      text: 'Check out CM Clinic - a powerful clinic management app!',
      url,
    };
    
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        haptic.success();
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      setOpen(true);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    haptic.success();
    toast.success('Link copied!');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          onClick={handleShare}
          className={`gap-2 ${className}`}
        >
          <QrCode className="w-4 h-4" />
          {showLabel && buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-xl shadow-inner">
            <QRCodeSVG 
              value={url}
              size={200}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-[200px]">
            Point your phone's camera at this code to open the install page
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
            {navigator.share && (
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  haptic.light();
                  try {
                    await navigator.share({
                      title: 'CM Clinic App',
                      text: 'Check out CM Clinic - a powerful clinic management app!',
                      url,
                    });
                    haptic.success();
                    setOpen(false);
                  } catch (err) {
                    if ((err as Error).name !== 'AbortError') {
                      console.error('Share failed:', err);
                    }
                  }
                }}
                className="gap-2 bg-jade hover:bg-jade/90"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareQRButton;
