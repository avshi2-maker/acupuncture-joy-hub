import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BodyFigureWithPoints } from './BodyFigureWithPoints';
import { usePointFigureMapping } from '@/hooks/usePointFigureMapping';
import { MapPin, GitCompare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ComparisonPoint {
  point: string;
  color: 'blue' | 'orange' | 'purple';
}

interface ComparisonBodyDisplayProps {
  /** Color-coded points for comparison */
  coloredPoints: ComparisonPoint[];
  /** Called when user clicks a point */
  onPointClick?: (point: string, color: 'blue' | 'orange' | 'purple') => void;
  /** Language */
  language?: 'en' | 'he';
  className?: string;
}

// Custom CSS for point colors
const POINT_COLOR_CLASSES = {
  blue: 'bg-blue-500 border-blue-400 shadow-blue-500/50',
  orange: 'bg-orange-500 border-orange-400 shadow-orange-500/50',
  purple: 'bg-purple-500 border-purple-400 shadow-purple-500/50',
};

/**
 * 3D Body Display for Protocol Comparison
 * Shows points from both protocols with color coding:
 * - Blue: Protocol A only
 * - Orange: Protocol B only
 * - Purple: Overlapping (both protocols)
 */
export function ComparisonBodyDisplay({
  coloredPoints,
  onPointClick,
  language = 'en',
  className = ''
}: ComparisonBodyDisplayProps) {
  const { getFiguresForPoints, getHighlightedPointsForFigure } = usePointFigureMapping();
  const [activeFigureIndex, setActiveFigureIndex] = useState(0);
  const [highlightedPoint, setHighlightedPoint] = useState<string | null>(null);

  // Extract all point codes
  const allPointCodes = useMemo(() => 
    coloredPoints.map(p => p.point),
    [coloredPoints]
  );

  // Get point color map for quick lookup
  const pointColorMap = useMemo(() => {
    const map = new Map<string, 'blue' | 'orange' | 'purple'>();
    coloredPoints.forEach(({ point, color }) => {
      map.set(point.toUpperCase(), color);
    });
    return map;
  }, [coloredPoints]);

  // Find matching figures
  const matchingFigures = useMemo(() => {
    return getFiguresForPoints(allPointCodes);
  }, [allPointCodes, getFiguresForPoints]);

  const handlePointClick = useCallback((code: string) => {
    const color = pointColorMap.get(code.toUpperCase());
    if (color) {
      setHighlightedPoint(code);
      onPointClick?.(code, color);
      
      // Clear highlight after animation
      setTimeout(() => setHighlightedPoint(null), 1500);
    }
  }, [pointColorMap, onPointClick]);

  const labels = {
    title: language === 'he' ? 'השוואה תלת-ממדית' : '3D Comparison View',
    protocolA: language === 'he' ? 'פרוטוקול A בלבד' : 'Protocol A Only',
    protocolB: language === 'he' ? 'פרוטוקול B בלבד' : 'Protocol B Only',
    shared: language === 'he' ? 'משותף' : 'Shared',
    points: language === 'he' ? 'נקודות' : 'points',
  };

  // Count points by color
  const counts = useMemo(() => ({
    blue: coloredPoints.filter(p => p.color === 'blue').length,
    orange: coloredPoints.filter(p => p.color === 'orange').length,
    purple: coloredPoints.filter(p => p.color === 'purple').length,
  }), [coloredPoints]);

  if (allPointCodes.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <GitCompare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No points to compare
          </p>
        </CardContent>
      </Card>
    );
  }

  if (matchingFigures.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            Points detected but no matching body figure found.
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {coloredPoints.map(({ point, color }) => (
              <Badge 
                key={point} 
                className={cn('cursor-pointer', POINT_COLOR_CLASSES[color])}
                onClick={() => handlePointClick(point)}
              >
                {point}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeFigure = matchingFigures[activeFigureIndex];
  const highlightedOnFigure = getHighlightedPointsForFigure(activeFigure.filename, allPointCodes);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="py-3 border-b bg-gradient-to-r from-purple-500/10 via-jade/10 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-jade" />
            {labels.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500 text-xs">{counts.blue} A</Badge>
            <Badge className="bg-orange-500 text-xs">{counts.orange} B</Badge>
            <Badge className="bg-purple-500 text-xs">{counts.purple} ⬌</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {matchingFigures.length === 1 ? (
          <div className="p-3">
            <BodyFigureWithPoints
              filename={activeFigure.filename}
              highlightedPoints={highlightedOnFigure}
              selectedPoints={[]}
              onPointSelect={handlePointClick}
              showAllPoints={false}
            />
          </div>
        ) : (
          <Tabs 
            value={activeFigure.filename} 
            onValueChange={(v) => {
              const idx = matchingFigures.findIndex(f => f.filename === v);
              if (idx >= 0) setActiveFigureIndex(idx);
            }}
          >
            <div className="border-b px-3 pt-2">
              <TabsList className="h-8">
                {matchingFigures.slice(0, 5).map((fig) => (
                  <TabsTrigger 
                    key={fig.filename} 
                    value={fig.filename}
                    className="text-xs"
                  >
                    {fig.bodyPart}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {matchingFigures.map((fig) => (
              <TabsContent key={fig.filename} value={fig.filename} className="m-0 p-3">
                <BodyFigureWithPoints
                  filename={fig.filename}
                  highlightedPoints={getHighlightedPointsForFigure(fig.filename, allPointCodes)}
                  selectedPoints={[]}
                  onPointSelect={handlePointClick}
                  showAllPoints={false}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Color-coded point list */}
        <div className="p-3 border-t bg-muted/30">
          <div className="space-y-2">
            {/* Protocol A Points (Blue) */}
            {counts.blue > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {labels.protocolA}
                </p>
                <div className="flex flex-wrap gap-1">
                  {coloredPoints
                    .filter(p => p.color === 'blue')
                    .map(({ point }) => (
                      <motion.div
                        key={point}
                        animate={highlightedPoint === point ? {
                          scale: [1, 1.2, 1],
                        } : {}}
                      >
                        <Badge
                          className={cn(
                            'cursor-pointer text-xs',
                            POINT_COLOR_CLASSES.blue
                          )}
                          onClick={() => handlePointClick(point)}
                        >
                          {point}
                        </Badge>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* Protocol B Points (Orange) */}
            {counts.orange > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  {labels.protocolB}
                </p>
                <div className="flex flex-wrap gap-1">
                  {coloredPoints
                    .filter(p => p.color === 'orange')
                    .map(({ point }) => (
                      <motion.div
                        key={point}
                        animate={highlightedPoint === point ? {
                          scale: [1, 1.2, 1],
                        } : {}}
                      >
                        <Badge
                          className={cn(
                            'cursor-pointer text-xs',
                            POINT_COLOR_CLASSES.orange
                          )}
                          onClick={() => handlePointClick(point)}
                        >
                          {point}
                        </Badge>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* Shared Points (Purple) */}
            {counts.purple > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  {labels.shared}
                </p>
                <div className="flex flex-wrap gap-1">
                  {coloredPoints
                    .filter(p => p.color === 'purple')
                    .map(({ point }) => (
                      <motion.div
                        key={point}
                        animate={highlightedPoint === point ? {
                          scale: [1, 1.2, 1],
                        } : {}}
                      >
                        <Badge
                          className={cn(
                            'cursor-pointer text-xs',
                            POINT_COLOR_CLASSES.purple
                          )}
                          onClick={() => handlePointClick(point)}
                        >
                          <Sparkles className="h-2 w-2 mr-1" />
                          {point}
                        </Badge>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
