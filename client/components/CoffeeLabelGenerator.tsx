import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Check, Eye, Palette } from 'lucide-react';

interface CoffeeLabelData {
  coffeeName: string;
  strength: number;
  acidity: number;
  roast: number;
  body: number;
  template: 'classic' | 'caramel' | 'emerald' | 'indigo' | 'crimson' | 'gold' | 'vintage' | 'minimal' | 'geometric' | 'organic' | 'luxury' | 'custom';
  pattern: 'dots' | 'stripes' | 'grid' | 'geometric' | 'waves' | 'stars' | 'leaves' | 'diamonds' | 'lines';
  size: 'small' | 'medium' | 'large';
  flavor_notes?: string[];
  customColors?: {
    bg: string;
    text: string;
    accent: string;
  };
}

interface CoffeeLabelGeneratorProps {
  coffeeName: string;
  strength: number;
  acidity: number;
  roast: number;
  body: number;
  initialFlavorNotes?: string[];
  onLabelDataChange: (data: CoffeeLabelData) => void;
  onApplyLabel: (data: CoffeeLabelData) => void;
}

const TEMPLATES: Array<{ key: CoffeeLabelData['template']; label: string; bg: string; text: string; accent: string; }>= [
  { key: 'classic', label: 'Classic', bg: '#2F2A26', text: '#FFFFFF', accent: '#D3B58F' },
  { key: 'caramel', label: 'Caramel', bg: '#8B4513', text: '#FFFFFF', accent: '#D2691E' },
  { key: 'emerald', label: 'Emerald', bg: '#0F3D3E', text: '#FFFFFF', accent: '#20B2AA' },
  { key: 'indigo', label: 'Indigo', bg: '#1C1B3A', text: '#FFFFFF', accent: '#6E57CF' },
  { key: 'crimson', label: 'Crimson', bg: '#3A1212', text: '#FFFFFF', accent: '#DC3545' },
  { key: 'gold', label: 'Gold', bg: '#3A2F0B', text: '#FFFFFF', accent: '#D4AF37' },
  { key: 'vintage', label: 'Vintage', bg: '#8B7355', text: '#F5F5DC', accent: '#D2B48C' },
  { key: 'minimal', label: 'Minimal', bg: '#F8F9FA', text: '#2C3E50', accent: '#E74C3C' },
  { key: 'geometric', label: 'Geometric', bg: '#1A1A1A', text: '#FFFFFF', accent: '#00D4FF' },
  { key: 'organic', label: 'Organic', bg: '#2D5016', text: '#FFFFFF', accent: '#90EE90' },
  { key: 'luxury', label: 'Luxury', bg: '#1A1A2E', text: '#FFFFFF', accent: '#FFD700' },
  { key: 'custom', label: 'Custom', bg: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', text: '#FFFFFF', accent: '#FFD700' },
];

const PATTERNS: Array<{ key: CoffeeLabelData['pattern']; label: string; description: string }> = [
  { key: 'dots', label: 'Dots', description: 'Subtle random dots' },
  { key: 'stripes', label: 'Stripes', description: 'Diagonal stripes' },
  { key: 'grid', label: 'Grid', description: 'Clean grid lines' },
  { key: 'geometric', label: 'Geometric', description: 'Triangles & circles' },
  { key: 'waves', label: 'Waves', description: 'Elegant wave lines' },
  { key: 'stars', label: 'Stars', description: 'Star field pattern' },
  { key: 'leaves', label: 'Leaves', description: 'Nature-inspired' },
  { key: 'diamonds', label: 'Diamonds', description: 'Ornate diamonds' },
  { key: 'lines', label: 'Lines', description: 'Horizontal lines' },
];

export function CoffeeLabelGenerator({ 
  coffeeName, 
  strength, 
  acidity, 
  roast, 
  body, 
  initialFlavorNotes = [],
  onLabelDataChange,
  onApplyLabel
}: CoffeeLabelGeneratorProps) {
  const [labelData, setLabelData] = useState<CoffeeLabelData>({
    coffeeName,
    strength,
    acidity,
    roast,
    body,
    template: 'classic',
    pattern: 'dots',
    size: 'medium',
    flavor_notes: initialFlavorNotes,
    customColors: {
      bg: '#2F2A26',
      text: '#FFFFFF',
      accent: '#D3B58F'
    }
  });

  const [showCustomColors, setShowCustomColors] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateLabelData = (updates: Partial<CoffeeLabelData>) => {
    const newData = { ...labelData, ...updates };
    setLabelData(newData);
    onLabelDataChange(newData);
  };

  const getTemplateColors = () => {
    if (labelData.template === 'custom' && labelData.customColors) {
      return labelData.customColors;
    }
    const t = TEMPLATES.find(x => x.key === labelData.template)!;
    return { bg: t.bg, text: t.text, accent: t.accent };
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
      small: { width: 160, height: 180 },
      medium: { width: 240, height: 250 },
      large: { width: 320, height: 320 },
    } as const;

    const { width, height } = sizes[labelData.size];
    canvas.width = width;
    canvas.height = height;

    const { bg, text, accent } = getTemplateColors();
    const secondary = accent; // Use accent as secondary for patterns

    // Draw pattern based on selection
    switch (labelData.pattern) {
      case 'dots':
        drawDotsPattern(ctx, width, height, bg, text, accent, secondary);
        break;
      case 'stripes':
        drawStripesPattern(ctx, width, height, bg, text, accent, secondary);
        break;
      case 'grid':
        drawGridPattern(ctx, width, height, bg, text, accent, secondary);
        break;
      case 'geometric':
        drawGeometricPattern(ctx, width, height, bg, text, accent, secondary);
        break;
      case 'waves':
        drawWavesPattern(ctx, width, height, bg, text, accent, secondary);
        break;
      case 'stars':
        drawStarsPattern(ctx, width, height, bg, text, accent, secondary);
        break;
      case 'leaves':
        drawLeavesPattern(ctx, width, height, bg, text, accent, secondary);
        break;
      case 'diamonds':
        drawDiamondsPattern(ctx, width, height, bg, text, accent, secondary);
        break;
      case 'lines':
        drawLinesPattern(ctx, width, height, bg, text, accent, secondary);
        break;
      default:
        drawDotsPattern(ctx, width, height, bg, text, accent, secondary);
    }
  };

  const drawDotsPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Dots pattern - regular grid
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    
    // Add regular dot grid pattern
    ctx.fillStyle = hexToRGBA(accent, 0.15);
    const dotSize = 2;
    const spacing = 20;
    
    for (let i = spacing; i < width; i += spacing) {
      for (let j = spacing; j < height; j += spacing) {
        ctx.beginPath();
        ctx.arc(i, j, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawContent(ctx, width, height, text, accent);
  };

  const drawStripesPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Stripes pattern
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Add diagonal stripes
    ctx.strokeStyle = hexToRGBA(accent, 0.15);
    ctx.lineWidth = 1;
    for (let i = -width; i < width + height; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    drawContent(ctx, width, height, text, accent);
  };

  const drawGridPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Grid pattern
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Add subtle grid pattern
    ctx.strokeStyle = hexToRGBA(accent, 0.1);
    ctx.lineWidth = 0.5;
    for (let i = 20; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 20; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    drawContent(ctx, width, height, text, accent);
  };

  const drawGeometricPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Geometric pattern
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Complex geometric background pattern
    ctx.fillStyle = hexToRGBA(accent, 0.08);
    for (let i = 0; i < width; i += 15) {
      for (let j = 0; j < height; j += 15) {
        if ((i + j) % 30 === 0) {
          // Draw triangles
          ctx.beginPath();
          ctx.moveTo(i, j);
          ctx.lineTo(i + 8, j + 8);
          ctx.lineTo(i, j + 16);
          ctx.closePath();
          ctx.fill();
        } else if ((i + j) % 30 === 15) {
          // Draw circles
          ctx.beginPath();
          ctx.arc(i + 7, j + 7, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    drawContent(ctx, width, height, text, accent);
  };


  const drawWavesPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Waves pattern
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Add elegant wave pattern
    ctx.strokeStyle = hexToRGBA(accent, 0.3);
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height / 4 * (i + 1));
      for (let x = 0; x < width; x += 5) {
        const y = height / 4 * (i + 1) + Math.sin(x * 0.1) * 8;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    drawContent(ctx, width, height, text, accent);
  };

  const drawStarsPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Stars pattern
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Add star-like pattern
    ctx.fillStyle = hexToRGBA(accent, 0.2);
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    drawContent(ctx, width, height, text, accent);
  };

  const drawLeavesPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Leaves pattern
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Add leaf-like pattern
    ctx.fillStyle = hexToRGBA(accent, 0.15);
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 12 + 6;
      
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    drawContent(ctx, width, height, text, accent);
  };

  const drawDiamondsPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Diamonds pattern
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Add ornate pattern with diamonds
    ctx.fillStyle = hexToRGBA(accent, 0.1);
    for (let i = 0; i < width; i += 25) {
      for (let j = 0; j < height; j += 25) {
        // Draw diamond shapes
        ctx.beginPath();
        ctx.moveTo(i + 12, j);
        ctx.lineTo(i + 25, j + 12);
        ctx.lineTo(i + 12, j + 25);
        ctx.lineTo(i, j + 12);
        ctx.closePath();
        ctx.fill();
      }
    }

    drawContent(ctx, width, height, text, accent);
  };

  const drawLinesPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Lines pattern
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Add warm texture with horizontal lines
    ctx.strokeStyle = hexToRGBA(accent, 0.2);
    ctx.lineWidth = 1;
    for (let i = 0; i < height; i += 6) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    drawContent(ctx, width, height, text, accent);
  };

  const drawContent = (ctx: CanvasRenderingContext2D, width: number, height: number, textColor: string, accent: string) => {
    // Coffee name with line breaking
    const nameFontSize = labelData.size === 'large' ? 20 : labelData.size === 'medium' ? 16 : 14;
    ctx.font = `bold ${nameFontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    
    // Split coffee name into lines if needed
    const maxNameWidth = width - 40;
    const nameWords = labelData.coffeeName.split(' ');
    let nameLine = '';
    let nameLines = [];
    
    for (let n = 0; n < nameWords.length; n++) {
      const testLine = nameLine + nameWords[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxNameWidth && n > 0) {
        nameLines.push(nameLine);
        nameLine = nameWords[n] + ' ';
      } else {
        nameLine = testLine;
      }
    }
    if (nameLine) {
      nameLines.push(nameLine);
    }
    
    // Draw coffee name lines
    const nameLineHeight = nameFontSize + 4;
    const nameStartY = 30;
    nameLines.forEach((line, index) => {
      ctx.fillText(line.trim(), width / 2, nameStartY + index * nameLineHeight);
    });

    // Draw metrics
    const metrics = [
      { label: 'Міцність', value: labelData.strength },
      { label: 'Кислотність', value: labelData.acidity },
      { label: 'Обсмаження', value: labelData.roast },
      { label: 'Насиченість', value: labelData.body },
    ];

    const rowStartY = 30 + (nameLines.length * (nameFontSize + 4)) + 16;
    const rowGap = 28;
    const leftPad = 20;
    const dotsStartX = width - 20 - 5 * 14;
    const dotR = 6;

    metrics.forEach((metric, i) => {
      const y = rowStartY + i * rowGap;
      // Label
      ctx.font = `${labelData.size === 'large' ? 14 : labelData.size === 'medium' ? 12 : 10}px Arial`;
      ctx.fillStyle = textColor;
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
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = textColor;
          ctx.stroke();
        }
      }
    });

    // Flavor notes
    if (labelData.flavor_notes && labelData.flavor_notes.length) {
      const fontSize = labelData.size === 'large' ? 14 : labelData.size === 'medium' ? 12 : 10;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      
      // Split long text into multiple lines if needed
      const maxWidth = width - 40;
      const notesText = labelData.flavor_notes.join(' • ');
      const words = notesText.split(' ');
      let line = '';
      let lines = [];
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }
      
      // Draw each line
      const lineHeight = fontSize + 4;
      const startY = height - 20 - (lines.length - 1) * lineHeight;
      
      lines.forEach((line, index) => {
        ctx.fillText(line.trim(), width / 2, startY + index * lineHeight);
      });
    }
  };

  React.useEffect(() => {
    drawLabel();
  }, [labelData]);

  const applyLabel = () => {
    onApplyLabel(labelData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Генератор міток для кави
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Назва кави</Label>
              <Input
                value={labelData.coffeeName}
                onChange={(e) => updateLabelData({ coffeeName: e.target.value })}
                placeholder="Назва кави"
              />
            </div>
          </div>

          {/* Template Selection as grid */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Кольорова схема</Label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    if (t.key === 'custom') {
                      setShowCustomColors(true);
                    } else {
                      updateLabelData({ template: t.key });
                    }
                  }}
                  className={`h-12 rounded border ${labelData.template === t.key ? 'border-black' : 'border-gray-300'} ${t.key === 'custom' ? 'relative' : ''}`}
                  style={{ 
                    backgroundColor: t.key === 'custom' 
                      ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' 
                      : t.bg 
                  }}
                  aria-label={t.label}
                  title={t.label}
                >
                  {t.key === 'custom' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-black text-xs font-bold">
                      <div>Custom</div>
                      <div className="text-xs">+</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Custom Color Picker */}
            {showCustomColors && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Налаштування кольорів</h4>
                  <button
                    onClick={() => setShowCustomColors(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm">Фон</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={labelData.customColors?.bg || '#2F2A26'}
                        onChange={(e) => updateLabelData({ 
                          customColors: { 
                            ...labelData.customColors!, 
                            bg: e.target.value 
                          } 
                        })}
                        className="w-12 h-8 rounded border"
                      />
                      <Input
                        value={labelData.customColors?.bg || '#2F2A26'}
                        onChange={(e) => updateLabelData({ 
                          customColors: { 
                            ...labelData.customColors!, 
                            bg: e.target.value 
                          } 
                        })}
                        className="flex-1"
                        placeholder="#2F2A26"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Текст</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={labelData.customColors?.text || '#FFFFFF'}
                        onChange={(e) => updateLabelData({ 
                          customColors: { 
                            ...labelData.customColors!, 
                            text: e.target.value 
                          } 
                        })}
                        className="w-12 h-8 rounded border"
                      />
                      <Input
                        value={labelData.customColors?.text || '#FFFFFF'}
                        onChange={(e) => updateLabelData({ 
                          customColors: { 
                            ...labelData.customColors!, 
                            text: e.target.value 
                          } 
                        })}
                        className="flex-1"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Акцент</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={labelData.customColors?.accent || '#D3B58F'}
                        onChange={(e) => updateLabelData({ 
                          customColors: { 
                            ...labelData.customColors!, 
                            accent: e.target.value 
                          } 
                        })}
                        className="w-12 h-8 rounded border"
                      />
                      <Input
                        value={labelData.customColors?.accent || '#D3B58F'}
                        onChange={(e) => updateLabelData({ 
                          customColors: { 
                            ...labelData.customColors!, 
                            accent: e.target.value 
                          } 
                        })}
                        className="flex-1"
                        placeholder="#D3B58F"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        updateLabelData({ template: 'custom' });
                        setShowCustomColors(false);
                      }}
                      className="flex-1"
                    >
                      Застосувати
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomColors(false)}
                    >
                      Скасувати
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pattern Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Текстура/Патерн</Label>
            <div className="grid grid-cols-2 gap-2">
              {PATTERNS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => updateLabelData({ pattern: p.key })}
                  className={`h-10 rounded border text-sm ${labelData.pattern === p.key ? 'border-black bg-gray-100' : 'border-gray-300'}`}
                >
                  <div className="font-medium">{p.label}</div>
                  <div className="text-xs text-gray-500">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Flavor notes (single field for multiple notes) */}
          <div>
            <Label>Смакові ноти</Label>
            <Input
              placeholder="шоколад, карамель, цитрус, ваніль..."
              value={labelData.flavor_notes?.join(', ') || ''}
              onChange={(e) => {
                const notes = e.target.value
                  .split(',')
                  .map(note => note.trim())
                  .filter(Boolean);
                updateLabelData({ flavor_notes: notes });
              }}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Розділяйте ноти комами
            </p>
          </div>

          {/* Metrics */}
          <div className="space-y-4">
            <h4 className="font-semibold">Метрики кави</h4>
            {[
              { key: 'strength', label: 'Міцність', value: labelData.strength },
              { key: 'acidity', label: 'Кислотність', value: labelData.acidity },
              { key: 'roast', label: 'Обсмаження', value: labelData.roast },
              { key: 'body', label: 'Насиченість', value: labelData.body },
            ].map((metric) => (
              <div key={metric.key} className="space-y-2">
                <div className="flex justify-between">
                  <Label>{metric.label}</Label>
                  <span className="text-sm text-muted-foreground">{metric.value}/5</span>
                </div>
                <Slider
                  value={[metric.value]}
                  onValueChange={([value]) => updateLabelData({ [metric.key]: value })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Preview and Apply */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Попередній перегляд
              </h4>
              <Button onClick={applyLabel} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Застосувати мітку
              </Button>
            </div>
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <canvas
                ref={canvasRef}
                className="rounded shadow-sm"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}