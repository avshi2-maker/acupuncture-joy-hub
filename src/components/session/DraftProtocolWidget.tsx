import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Sparkles, 
  X, 
  ChevronDown, 
  ChevronUp,
  Bot,
  Hand,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtocolPoint } from '@/hooks/useSessionSummary';

interface DraftProtocolWidgetProps {
  protocolPoints: ProtocolPoint[];
  onRemovePoint?: (code: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DraftProtocolWidget({
  protocolPoints,
  onRemovePoint,
  isCollapsed = false,
  onToggleCollapse,
}: DraftProtocolWidgetProps) {
  if (protocolPoints.length === 0) {
    return null;
  }

  const getSourceIcon = (source: ProtocolPoint['source']) => {
    switch (source) {
      case 'ai-sparkle':
        return <Zap className="h-3 w-3 text-amber-500" />;
      case 'ai-suggestion':
        return <Bot className="h-3 w-3 text-primary" />;
      case 'manual':
      default:
        return <Hand className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getSourceLabel = (source: ProtocolPoint['source']) => {
    switch (source) {
      case 'ai-sparkle':
        return 'AI Sparkle';
      case 'ai-suggestion':
        return 'AI Suggested';
      case 'manual':
      default:
        return 'Manual';
    }
  };

  return (
    <Card className="border-jade/30 bg-gradient-to-br from-card to-jade/5 shadow-lg">
      <CardHeader className="py-3 border-b border-jade/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-jade/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-jade" />
            </div>
            <span>Draft Protocol</span>
            <Badge variant="secondary" className="text-xs">
              {protocolPoints.length} points
            </Badge>
          </CardTitle>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="p-2">
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {protocolPoints.map((point, index) => (
                    <motion.div
                      key={point.code}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PointCard
                        point={point}
                        onRemove={() => onRemovePoint?.(point.code)}
                        getSourceIcon={getSourceIcon}
                        getSourceLabel={getSourceLabel}
                      />
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

interface PointCardProps {
  point: ProtocolPoint;
  onRemove: () => void;
  getSourceIcon: (source: ProtocolPoint['source']) => React.ReactNode;
  getSourceLabel: (source: ProtocolPoint['source']) => string;
}

function PointCard({ point, onRemove, getSourceIcon, getSourceLabel }: PointCardProps) {
  const info = point.technicalInfo;

  return (
    <div className="group relative rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm p-3 hover:border-jade/50 transition-all">
      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-jade/20 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-jade" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm">{point.code}</span>
            {info?.hebrewName && (
              <span className="text-xs text-muted-foreground">{info.hebrewName}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getSourceIcon(point.source)}
            <span>{getSourceLabel(point.source)}</span>
          </div>
        </div>
      </div>

      {/* Technical details */}
      {info && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">עומק:</span>
            <span className="font-medium">
              {info.depth.min}-{info.depth.max} {info.depth.unit}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">זווית:</span>
            <span className="font-medium">{info.angleHebrew}</span>
          </div>
        </div>
      )}

      {/* Clinical action */}
      {info?.clinicalActionHebrew && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2" dir="rtl">
          {info.clinicalActionHebrew}
        </p>
      )}
    </div>
  );
}

export default DraftProtocolWidget;
