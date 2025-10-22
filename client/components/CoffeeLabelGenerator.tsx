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
  template: 'classic' | 'caramel' | 'emerald' | 'indigo' | 'crimson' | 'gold';
  size: 'small' | 'medium' | 'large';
  flavor_notes?: string[];
}

interface CoffeeLabelGeneratorProps {
  coffeeName: string;
  strength: number;
  acidity: number;
  roast: number;
  body: number;
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
];

export function CoffeeLabelGenerator({ 
  coffeeName, 
  strength, 
  acidity, 
  roast, 
  body, 
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
    size: 'medium',
    flavor_notes: [],
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateLabelData = (updates: Partial<CoffeeLabelData>) => {
    const newData = { ...labelData, ...updates };
    setLabelData(newData);
    onLabelDataChange(newData);
  };

  const getTemplateColors = () => {
    const t = TEMPLATES.find(x => x.key === labelData.template)!;
    return { bg: t.bg, text: t.text, accent: t.accent };
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

    // Background with rounded outer card + outline
    const { bg, text, accent } = getTemplateColors();
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
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    roundRect(2, 2, width - 4, height - 4, outerRadius);
    ctx.stroke();

    // Rounded white inner panel
    const panelX = 12;
    const panelY = 12;
    const panelW = width - 24;
    const panelH = height - 24;
    const radius = 14;
    roundRect(panelX, panelY, panelW, panelH, radius);
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
    ctx.fillText(labelData.coffeeName, width / 2, panelY + 28);

    // Metrics as dot rows
    const metrics = [
      { label: 'Міцність', value: labelData.strength },
      { label: 'Кислотність', value: labelData.acidity },
      { label: 'Обсмажування', value: labelData.roast },
      { label: 'Насиченість', value: labelData.body },
    ];

    const startY = panelY + 56;
    const rowGap = 30;
    const leftPad = panelX + 16;
    const dotsStartX = width - 16 - 5 * 14;
    const dotR = 6;

    metrics.forEach((metric, index) => {
      const y = startY + index * rowGap;
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
        ctx.fillStyle = d <= metric.value ? accent : 'rgba(0,0,0,0.1)';
        ctx.fill();
      }
    });

    // Flavor notes
    if (labelData.flavor_notes && labelData.flavor_notes.length) {
      ctx.font = `${labelData.size === 'large' ? 12 : labelData.size === 'medium' ? 10 : 8}px Arial`;
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText(labelData.flavor_notes.join(' • '), width / 2, height - 14);
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

          {/* Template Selection as grid (no heading, clickable) */}
          <div>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => updateLabelData({ template: t.key })}
                  className={`h-12 rounded border ${labelData.template === t.key ? 'border-black' : 'border-gray-300'}`}
                  style={{ backgroundColor: t.bg }}
                  aria-label={t.label}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          {/* Flavor notes (3 optional fields) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label>Смакова нота 1</Label>
              <Input
                placeholder="шоколад"
                onChange={(e) => {
                  const arr = [...(labelData.flavor_notes || [])];
                  arr[0] = e.target.value.trim();
                  updateLabelData({ flavor_notes: arr.filter(Boolean) });
                }}
              />
            </div>
            <div>
              <Label>Смакова нота 2</Label>
              <Input
                placeholder="карамель"
                onChange={(e) => {
                  const arr = [...(labelData.flavor_notes || [])];
                  arr[1] = e.target.value.trim();
                  updateLabelData({ flavor_notes: arr.filter(Boolean) });
                }}
              />
            </div>
            <div>
              <Label>Смакова нота 3</Label>
              <Input
                placeholder="цитрус"
                onChange={(e) => {
                  const arr = [...(labelData.flavor_notes || [])];
                  arr[2] = e.target.value.trim();
                  updateLabelData({ flavor_notes: arr.filter(Boolean) });
                }}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-4">
            <h4 className="font-semibold">Метрики кави</h4>
            {[
              { key: 'strength', label: 'Міцність', value: labelData.strength },
              { key: 'acidity', label: 'Кислотність', value: labelData.acidity },
              { key: 'roast', label: 'Обсмажування', value: labelData.roast },
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
                className="border border-gray-300 rounded shadow-sm"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
