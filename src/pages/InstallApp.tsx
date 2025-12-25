import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Apple, Chrome, Share, Plus, MoreVertical, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Detect Android
    const isAndroidDevice = /Android/.test(navigator.userAgent);
    setIsAndroid(isAndroidDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <Helmet>
        <title>Install App | Harmony TCM Clinic</title>
        <meta name="description" content="Install the Harmony TCM Clinic app on your device for quick access" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-jade/10 flex items-center justify-center">
              <img 
                src="/pwa-icons/icon-192x192.png" 
                alt="TCM Clinic" 
                className="w-16 h-16 rounded-xl"
              />
            </div>
            <CardTitle className="font-display text-2xl">Install TCM Clinic</CardTitle>
            <CardDescription>
              Get quick access to your clinic management from your home screen
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isInstalled ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">App Installed!</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You can now access TCM Clinic from your home screen
                </p>
                <Button asChild className="bg-jade hover:bg-jade/90">
                  <Link to="/">Open App</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Android / Chrome Install Button */}
                {deferredPrompt && (
                  <Button 
                    onClick={handleInstallClick}
                    className="w-full bg-jade hover:bg-jade/90 h-12"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Install App
                  </Button>
                )}

                {/* iOS Instructions */}
                {isIOS && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Apple className="w-4 h-4" />
                      <span>Install on iPhone/iPad</span>
                    </div>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-jade/10 text-jade text-sm flex items-center justify-center font-medium">1</span>
                        <div className="flex items-center gap-2">
                          <span>Tap the</span>
                          <Share className="w-5 h-5 text-blue-500" />
                          <span>Share button</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-jade/10 text-jade text-sm flex items-center justify-center font-medium">2</span>
                        <div className="flex items-center gap-2">
                          <span>Scroll down and tap</span>
                          <Plus className="w-5 h-5" />
                          <span className="font-medium">"Add to Home Screen"</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-jade/10 text-jade text-sm flex items-center justify-center font-medium">3</span>
                        <span>Tap <span className="font-medium">"Add"</span> to confirm</span>
                      </li>
                    </ol>
                  </div>
                )}

                {/* Android Instructions (fallback if prompt not available) */}
                {isAndroid && !deferredPrompt && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Smartphone className="w-4 h-4" />
                      <span>Install on Android</span>
                    </div>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-jade/10 text-jade text-sm flex items-center justify-center font-medium">1</span>
                        <div className="flex items-center gap-2">
                          <span>Tap the</span>
                          <MoreVertical className="w-5 h-5" />
                          <span>menu button</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-jade/10 text-jade text-sm flex items-center justify-center font-medium">2</span>
                        <span>Select <span className="font-medium">"Install app"</span> or <span className="font-medium">"Add to Home screen"</span></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-jade/10 text-jade text-sm flex items-center justify-center font-medium">3</span>
                        <span>Tap <span className="font-medium">"Install"</span> to confirm</span>
                      </li>
                    </ol>
                  </div>
                )}

                {/* Desktop Chrome Instructions */}
                {!isIOS && !isAndroid && !deferredPrompt && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Chrome className="w-4 h-4" />
                      <span>Install on Desktop</span>
                    </div>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-jade/10 text-jade text-sm flex items-center justify-center font-medium">1</span>
                        <span>Click the install icon in the address bar</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-jade/10 text-jade text-sm flex items-center justify-center font-medium">2</span>
                        <span>Click <span className="font-medium">"Install"</span> to confirm</span>
                      </li>
                    </ol>
                  </div>
                )}

                {/* Benefits */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-3">Benefits of installing:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-jade" />
                      Quick access from home screen
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-jade" />
                      Works offline
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-jade" />
                      Full screen experience
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-jade" />
                      Faster loading times
                    </li>
                  </ul>
                </div>
              </>
            )}

            <div className="text-center pt-2">
              <Button variant="link" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}