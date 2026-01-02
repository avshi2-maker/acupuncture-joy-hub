import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InteractivePointMarker } from './InteractivePointMarker';
import { MapPin, ZoomIn, ZoomOut, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getPointsForFigure, normalizePointCode } from '@/data/point-figure-mapping';

// Import all body figure images
import abdomenImg from '@/assets/body-figures/abdomen.png';
import shoulderSideImg from '@/assets/body-figures/shoulder_side.png';
import neckPosteriorImg from '@/assets/body-figures/neck_posterior.png';
import handDorsumImg from '@/assets/body-figures/hand_dorsum.png';
import scalpTopImg from '@/assets/body-figures/scalp_top.png';
import faceFrontImg from '@/assets/body-figures/face_front.png';
import kneeFrontImg from '@/assets/body-figures/knee_front.png';
import ankleImg from '@/assets/body-figures/ankle.png';
import sacrumBackImg from '@/assets/body-figures/sacrum_back.png';
import neckFrontImg from '@/assets/body-figures/neck_front.png';
import shoulderAnteriorImg from '@/assets/body-figures/shoulder_anterior.png';
import ankleMedialImg from '@/assets/body-figures/ankle_medial.png';
import kneeLateralImg from '@/assets/body-figures/knee_lateral.png';
import kneeMedialImg from '@/assets/body-figures/knee_medial.png';
import kneeBackImg from '@/assets/body-figures/knee_back.png';
import headLateralImg from '@/assets/body-figures/head_lateral.png';
import earImg from '@/assets/body-figures/ear.png';
import tongueImg from '@/assets/body-figures/tongue.png';
import chestImg from '@/assets/body-figures/chest.png';
import upperBackImg from '@/assets/body-figures/upper_back.png';
import lowerBackImg from '@/assets/body-figures/lower_back.png';
import armFullImg from '@/assets/body-figures/arm_full.png';
import elbowInnerImg from '@/assets/body-figures/elbow_inner.png';
import wristImg from '@/assets/body-figures/wrist.png';
import thighHipImg from '@/assets/body-figures/thigh_hip.png';
import lowerLegImg from '@/assets/body-figures/lower_leg.png';
import footTopImg from '@/assets/body-figures/foot_top.png';
import footSoleImg from '@/assets/body-figures/foot_sole.png';
import childFrontImg from '@/assets/body-figures/child_front.png';
import childBackImg from '@/assets/body-figures/child_back.png';
import abdomenZoomedImg from '@/assets/body-figures/abdomen_zoomed.png';
import ankleSideImg from '@/assets/body-figures/ankle_side.png';
import handImg from '@/assets/body-figures/hand.png';
import footImg from '@/assets/body-figures/foot.png';
import legsPosteriorImg from '@/assets/body-figures/legs_posterior.png';
import sacrumImg from '@/assets/body-figures/sacrum.png';
import abdomenFemaleImg from '@/assets/body-figures/abdomen_female.png';

const imageMap: Record<string, string> = {
  'abdomen.png': abdomenImg,
  'shoulder_side.png': shoulderSideImg,
  'neck_posterior.png': neckPosteriorImg,
  'hand_dorsum.png': handDorsumImg,
  'scalp_top.png': scalpTopImg,
  'face_front.png': faceFrontImg,
  'knee_front.png': kneeFrontImg,
  'ankle.png': ankleImg,
  'sacrum_back.png': sacrumBackImg,
  'neck_front.png': neckFrontImg,
  'shoulder_anterior.png': shoulderAnteriorImg,
  'ankle_medial.png': ankleMedialImg,
  'knee_lateral.png': kneeLateralImg,
  'knee_medial.png': kneeMedialImg,
  'knee_back.png': kneeBackImg,
  'head_lateral.png': headLateralImg,
  'ear.png': earImg,
  'tongue.png': tongueImg,
  'chest.png': chestImg,
  'upper_back.png': upperBackImg,
  'lower_back.png': lowerBackImg,
  'arm_full.png': armFullImg,
  'elbow_inner.png': elbowInnerImg,
  'wrist.png': wristImg,
  'thigh_hip.png': thighHipImg,
  'lower_leg.png': lowerLegImg,
  'foot_top.png': footTopImg,
  'foot_sole.png': footSoleImg,
  'child_front.png': childFrontImg,
  'child_back.png': childBackImg,
  'abdomen_zoomed.png': abdomenZoomedImg,
  'ankle_side.png': ankleSideImg,
  'hand.png': handImg,
  'foot.png': footImg,
  'legs_posterior.png': legsPosteriorImg,
  'sacrum.png': sacrumImg,
  'abdomen_female.png': abdomenFemaleImg,
};

// Default point positions (distributed evenly for now - can be refined with actual anatomical coordinates)
// These are placeholder positions that distribute points visually
function generateDefaultPositions(pointCodes: string[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const total = pointCodes.length;
  
  if (total === 0) return positions;
  
  // Create a grid distribution
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  
  pointCodes.forEach((code, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    // Distribute points in a central region (20-80% of the image)
    const x = 20 + (col / (cols - 1 || 1)) * 60;
    const y = 20 + (row / (rows - 1 || 1)) * 60;
    
    positions[normalizePointCode(code)] = { x, y };
  });
  
  return positions;
}

interface AcuPoint {
  id: string;
  code: string;
  name_english: string;
  name_chinese: string;
  name_pinyin: string;
  meridian: string;
  location: string;
  indications: string[];
  actions: string[];
}

interface BodyFigureWithPointsProps {
  filename: string;
  highlightedPoints?: string[];
  selectedPoints?: string[];
  onPointClick?: (point: AcuPoint) => void;
  onPointSelect?: (code: string) => void;
  showAllPoints?: boolean;
  compact?: boolean;
  className?: string;
}

export function BodyFigureWithPoints({
  filename,
  highlightedPoints = [],
  selectedPoints = [],
  onPointClick,
  onPointSelect,
  showAllPoints = true,
  compact = false,
  className = ''
}: BodyFigureWithPointsProps) {
  const [zoom, setZoom] = useState(1);
  const [acuPoints, setAcuPoints] = useState<AcuPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Get the points that should be shown on this figure
  const figurePointCodes = useMemo(() => getPointsForFigure(filename), [filename]);
  
  // Generate default positions for points
  const pointPositions = useMemo(() => 
    generateDefaultPositions(figurePointCodes), 
    [figurePointCodes]
  );

  // Fetch point details from database
  useEffect(() => {
    const fetchPoints = async () => {
      if (figurePointCodes.length === 0) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('acupuncture_points')
        .select('*');
      
      if (!error && data) {
        // Filter to only points on this figure
        const figureNormalized = figurePointCodes.map(normalizePointCode);
        const filtered = data.filter(p => 
          figureNormalized.includes(normalizePointCode(p.code))
        );
        
        setAcuPoints(filtered.map(p => ({
          id: p.id,
          code: p.code,
          name_english: p.name_english,
          name_chinese: p.name_chinese,
          name_pinyin: p.name_pinyin,
          meridian: p.meridian,
          location: p.location,
          indications: p.indications || [],
          actions: p.actions || [],
        })));
      }
      setLoading(false);
    };
    fetchPoints();
  }, [figurePointCodes]);

  // Points to display
  const displayPoints = useMemo(() => {
    if (showAllPoints) return acuPoints;
    
    // Only show highlighted or selected points
    const visibleCodes = [...new Set([...highlightedPoints, ...selectedPoints])];
    return acuPoints.filter(p => 
      visibleCodes.some(code => normalizePointCode(code) === normalizePointCode(p.code))
    );
  }, [acuPoints, highlightedPoints, selectedPoints, showAllPoints]);

  const handlePointClick = (point: AcuPoint) => {
    onPointClick?.(point);
    onPointSelect?.(point.code);
  };

  const getFigureName = (file: string) => {
    return file
      .replace('.png', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const imageSrc = imageMap[filename];
  if (!imageSrc) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-muted-foreground">
          Image not found: {filename}
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <div 
          className="relative"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <img
            src={imageSrc}
            alt={getFigureName(filename)}
            className="max-w-full h-auto"
          />
          {displayPoints.map(point => {
            const pos = pointPositions[normalizePointCode(point.code)];
            if (!pos) return null;
            
            return (
              <InteractivePointMarker
                key={point.id}
                point={point}
                x={pos.x}
                y={pos.y}
                isHighlighted={highlightedPoints.some(h => 
                  normalizePointCode(h) === normalizePointCode(point.code)
                )}
                isSelected={selectedPoints.some(s => 
                  normalizePointCode(s) === normalizePointCode(point.code)
                )}
                onClick={() => handlePointClick(point)}
                size="sm"
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-jade" />
          {getFigureName(filename)}
          {displayPoints.length > 0 && (
            <Badge variant="outline" className="ml-1">
              {displayPoints.length} points
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(z => Math.min(2, z + 0.25))}
            disabled={zoom >= 2}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[400px]">
          <div 
            className="relative inline-block"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            <img
              src={imageSrc}
              alt={getFigureName(filename)}
              className="max-w-none"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <span className="text-sm text-muted-foreground">Loading points...</span>
              </div>
            ) : (
              displayPoints.map(point => {
                const pos = pointPositions[normalizePointCode(point.code)];
                if (!pos) return null;
                
                return (
                  <InteractivePointMarker
                    key={point.id}
                    point={point}
                    x={pos.x}
                    y={pos.y}
                    isHighlighted={highlightedPoints.some(h => 
                      normalizePointCode(h) === normalizePointCode(point.code)
                    )}
                    isSelected={selectedPoints.some(s => 
                      normalizePointCode(s) === normalizePointCode(point.code)
                    )}
                    onClick={() => handlePointClick(point)}
                    size="md"
                    showLabel
                  />
                );
              })
            )}
          </div>
        </ScrollArea>
        
        {highlightedPoints.length > 0 && (
          <div className="mt-2 p-2 bg-jade/10 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-jade mb-1">
              <Info className="h-3 w-3" />
              <span className="font-medium">AI Suggested Points</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {highlightedPoints.map(code => (
                <Badge key={code} className="bg-jade text-xs">{code}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
