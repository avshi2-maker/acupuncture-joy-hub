import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface CrossPlatformBackButtonProps {
  fallbackPath?: string;
  label?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Cross-platform back button that works consistently on iOS and Android
 * - Uses history.back() when available for native feel
 * - Falls back to navigation when no history
 * - Provides haptic feedback on mobile
 */
export function CrossPlatformBackButton({
  fallbackPath = '/dashboard',
  label,
  variant = 'ghost',
  size = 'default',
  className = '',
}: CrossPlatformBackButtonProps) {
  const navigate = useNavigate();
  const haptic = useHapticFeedback();

  const handleBack = () => {
    haptic.light();
    
    // Check if we have history to go back to
    // window.history.length > 2 because initial page load counts as 1
    if (window.history.length > 2) {
      // Use native back for better iOS/Android integration
      window.history.back();
    } else {
      // No history, navigate to fallback
      navigate(fallbackPath);
    }
  };

  // Detect iOS for appropriate icon
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={`touch-manipulation active:scale-95 ${className}`}
    >
      {isIOS ? (
        <ChevronLeft className="h-5 w-5" />
      ) : (
        <ArrowLeft className="h-4 w-4" />
      )}
      {label && <span className="mr-1">{label}</span>}
    </Button>
  );
}
