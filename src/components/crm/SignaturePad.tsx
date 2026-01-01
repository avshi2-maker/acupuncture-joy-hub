import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  className?: string;
  disabled?: boolean;
}

export function SignaturePad({ 
  onSave, 
  onClear,
  width = 400, 
  height = 200,
  className,
  disabled = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw signature line
    ctx.beginPath();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();

    // Reset stroke style
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
  }, [width, height]);

  const getPosition = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  const startDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    
    const pos = getPosition(e);
    if (!pos) return;

    setIsDrawing(true);
    lastPosRef.current = pos;
    setHasSignature(true);
  }, [disabled, getPosition]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !lastPosRef.current) return;

    const pos = getPosition(e);
    if (!pos) return;

    ctx.beginPath();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPosRef.current = pos;
  }, [isDrawing, disabled, getPosition]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw signature line
    ctx.beginPath();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();

    setHasSignature(false);
    onClear?.();
  }, [width, height, onClear]);

  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }, [onSave]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={cn(
            'touch-none w-full',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'
          )}
          style={{ aspectRatio: `${width}/${height}` }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-sm">Sign here</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            clearCanvas();
          }}
          disabled={disabled || !hasSignature}
        >
          <Eraser className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            saveSignature();
          }}
          disabled={disabled || !hasSignature}
          className="bg-jade hover:bg-jade/90"
        >
          <Check className="h-4 w-4 mr-2" />
          Confirm Signature
        </Button>
      </div>
    </div>
  );
}
