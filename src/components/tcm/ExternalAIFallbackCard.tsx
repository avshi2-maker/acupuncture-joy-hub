import { AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExternalAIFallbackCardProps {
  query: string;
  isLoading?: boolean;
  onUseExternalAI: () => void;
  onDismiss: () => void;
}

export function ExternalAIFallbackCard({
  query,
  isLoading,
  onUseExternalAI,
  onDismiss,
}: ExternalAIFallbackCardProps) {
  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2">
      <Card className="border-2 border-destructive/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-lg">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">No match in proprietary knowledge base</p>
                  <Badge variant="destructive" className="text-[10px]">External option</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  We couldnt find this in Dr. Sapirs verified materials. You can optionally ask an external AI.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Disclosure:</span> External AI is not verified and requires therapist discretion.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground truncate max-w-[360px]">
              Last question: <span className="font-medium text-foreground">{query}</span>
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDismiss}
                disabled={isLoading}
              >
                Stay in KB only
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onUseExternalAI}
                disabled={isLoading}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Use External AI
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
