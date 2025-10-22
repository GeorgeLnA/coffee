import React, { useRef, useEffect } from 'react';

interface CoffeeLabelData {
  template: 'classic' | 'caramel' | 'emerald' | 'indigo' | 'crimson' | 'gold';
  size: 'small' | 'medium' | 'large';
  flavor_notes?: string[];
}

interface CoffeeLabelProps {
  coffeeName: string;
  strength: number;
  acidity: number;
  roast: number;
  body: number;
  labelData: CoffeeLabelData;
  className?: string;
}

export function CoffeeLabel({ 
  coffeeName, 
  strength, 
  acidity, 
  roast, 
  body, 
  labelData,
  className = ""
}: CoffeeLabelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getTemplateColors = () => {
    const map: Record<string, { bg: string; text: string; accent: string }>= {
      classic: { bg: '#2F2A26', text: '#FFFFFF', accent: '#D3B58F' },
      caramel: { bg: '#8B4513', text: '#FFFFFF', accent: '#D2691E' },
      emerald: { bg: '#0F3D3E', text: '#FFFFFF', accent: '#20B2AA' },
      indigo:  { bg: '#1C1B3A', text: '#FFFFFF', accent: '#6E57CF' },
      crimson: { bg: '#3A1212', text: '#FFFFFF', accent: '#DC3545' },
      gold:    { bg: '#3A2F0B', text: '#FFFFFF', accent: '#D4AF37' },
    };
    return map[labelData.template];
  };

  const hexToRGBA = (hex: string, alpha: number) => {
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2), 16);
    const g = parseInt(h.substring(2,4), 16);
    const b = parseInt(h.substring(4,6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const drawLabel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sizes = {
      small: { width: 200, height: 120 },
      medium: { width: 300, height: 180 },
      large: { width: 400, height: 240 },
    } as const;

    const { width, height } = sizes[labelData.size];
    canvas.width = width;
    canvas.height = height;

    const { bg, text, accent } = getTemplateColors();
    // Clip to rounded outer card and draw subtle outline
    const outerRadius = labelData.size === 'large' ? 18 : labelData.size === 'medium' ? 16 : 12;
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };
    roundRect(2, 2, width - 4, height - 4, outerRadius);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    // Outline (rounded corners/caps)
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = hexToRGBA(getTemplateColors().accent, 0.35);
    roundRect(2, 2, width - 4, height - 4, outerRadius);
    ctx.stroke();

    // Rounded light panel for cleaner look
    const panelX = 12; // slightly larger margin for island space
    const panelY = 12;
    const panelW = width - 24;
    const panelH = height - 24;
    const r = 14; // softer corners
    roundRect(panelX, panelY, panelW, panelH, r);
    // soft shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
    ctx.restore();

    // Coffee name
    const panelText = '#2a2a2a';
    ctx.fillStyle = panelText;
    ctx.font = `bold ${labelData.size === 'large' ? 24 : labelData.size === 'medium' ? 20 : 16}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(coffeeName, width / 2, panelY + 28);

    // Draw metrics
    const metrics = [
      { label: 'Міцність', value: strength },
      { label: 'Кислотність', value: acidity },
      { label: 'Обсмажування', value: roast },
      { label: 'Насиченість', value: body },
    ];

    const rowStartY = panelY + 56;
    const rowGap = 30;
    const leftPad = panelX + 16;
    const dotsStartX = width - 16 - 5 * 14;
    const dotR = 6;

    metrics.forEach((metric, i) => {
      const y = rowStartY + i * rowGap;
      // Label
      ctx.font = `${labelData.size === 'large' ? 14 : labelData.size === 'medium' ? 12 : 10}px Arial`;
      ctx.fillStyle = '#555';
      ctx.textAlign = 'left';
      ctx.fillText(metric.label, leftPad, y);
      // Dots
      for (let d = 1; d <= 5; d++) {
        const cx = dotsStartX + (d - 1) * 14;
        const cy = y - 4;
        ctx.beginPath();
        ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
        ctx.closePath();
        if (d <= metric.value) {
          ctx.fillStyle = accent;
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(255,255,255,1)';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(0,0,0,0.12)';
          ctx.stroke();
        }
      }
    });

    // Flavor notes line at the bottom
    if (labelData.flavor_notes && labelData.flavor_notes.length) {
      ctx.font = `${labelData.size === 'large' ? 12 : labelData.size === 'medium' ? 10 : 8}px Arial`;
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText(labelData.flavor_notes.join(' • '), width / 2, height - 14);
    }
  };

  useEffect(() => {
    drawLabel();
  }, [coffeeName, strength, acidity, roast, body, labelData]);

  return (
    <canvas
      ref={canvasRef}
      className={`border border-gray-300 rounded shadow-sm ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
