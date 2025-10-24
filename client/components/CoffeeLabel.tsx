import React, { useRef, useEffect } from 'react';
import { CoffeeLabelData } from '@shared/api';

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
    if (labelData.template === 'custom' && labelData.customColors) {
      return { 
        bg: labelData.customColors.bg, 
        text: labelData.customColors.text, 
        accent: labelData.customColors.accent,
        secondary: labelData.customColors.accent 
      };
    }
    
    const map: Record<string, { bg: string; text: string; accent: string; secondary?: string }>= {
      classic: { bg: '#2F2A26', text: '#FFFFFF', accent: '#D3B58F' },
      caramel: { bg: '#8B4513', text: '#FFFFFF', accent: '#D2691E' },
      emerald: { bg: '#0F3D3E', text: '#FFFFFF', accent: '#20B2AA' },
      indigo:  { bg: '#1C1B3A', text: '#FFFFFF', accent: '#6E57CF' },
      crimson: { bg: '#3A1212', text: '#FFFFFF', accent: '#DC3545' },
      gold:    { bg: '#3A2F0B', text: '#FFFFFF', accent: '#D4AF37' },
      vintage: { bg: '#8B7355', text: '#F5F5DC', accent: '#D2B48C', secondary: '#A0522D' },
      minimal: { bg: '#F8F9FA', text: '#2C3E50', accent: '#E74C3C', secondary: '#95A5A6' },
      geometric: { bg: '#1A1A1A', text: '#FFFFFF', accent: '#00D4FF', secondary: '#FF6B35' },
      organic: { bg: '#2D5016', text: '#FFFFFF', accent: '#90EE90', secondary: '#8FBC8F' },
      luxury: { bg: '#1A1A2E', text: '#FFFFFF', accent: '#FFD700', secondary: '#C0C0C0' },
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
      small: { width: 160, height: 180 },
      medium: { width: 240, height: 250 },
      large: { width: 320, height: 320 },
    } as const;

    const { width, height } = sizes[labelData.size];
    canvas.width = width;
    canvas.height = height;

    const { bg, text, accent, secondary } = getTemplateColors();
    
    // Helper function for rounded rectangles
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x + r, y);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Draw different patterns based on pattern selection
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
        drawClassicPattern(ctx, width, height, bg, text, accent, roundRect);
    }
  };

  const drawClassicPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, roundRect: Function) => {
    // Classic pattern with subtle dots
    const outerRadius = labelData.size === 'large' ? 18 : labelData.size === 'medium' ? 16 : 12;
    roundRect(2, 2, width - 4, height - 4, outerRadius);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle dot pattern
    ctx.fillStyle = hexToRGBA(accent, 0.1);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const panelX = 12;
    const panelY = 12;
    const panelW = width - 24;
    const panelH = height - 24;
    const r = 14;
    roundRect(panelX, panelY, panelW, panelH, r);
    
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
    ctx.restore();

    drawContent(ctx, width, height, panelX, panelY, '#2a2a2a', accent);
  };

  const drawVintagePattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Vintage pattern with aged look and stripes
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

    // Add vintage texture
    ctx.fillStyle = hexToRGBA(secondary, 0.1);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3;
      ctx.fillRect(x, y, size, size);
    }

    // Ornate border
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Inner decorative border
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    drawContent(ctx, width, height, 20, 20, text, accent);
  };

  const drawMinimalPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Minimal clean design with subtle grid
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Add subtle grid pattern
    ctx.strokeStyle = hexToRGBA(secondary, 0.1);
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

    // Simple border
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    // Minimal metrics with lines instead of dots
    const metrics = [
      { label: 'Міцність', value: strength },
      { label: 'Кислотність', value: acidity },
      { label: 'Обсмажування', value: roast },
      { label: 'Насиченість', value: body },
    ];

    const startY = 50;
    const lineHeight = 20;
    const lineWidth = 80;
    const lineX = width - lineWidth - 20;

    metrics.forEach((metric, i) => {
      const y = startY + i * lineHeight;
      
      // Label
      ctx.font = `${labelData.size === 'large' ? 12 : labelData.size === 'medium' ? 10 : 8}px sans-serif`;
      ctx.fillStyle = secondary;
      ctx.textAlign = 'left';
      ctx.fillText(metric.label, 20, y);
      
      // Progress line
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lineX, y - 5);
      ctx.lineTo(lineX + lineWidth, y - 5);
      ctx.stroke();
      
      // Filled portion
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(lineX, y - 5);
      ctx.lineTo(lineX + (lineWidth * metric.value / 5), y - 5);
      ctx.stroke();
    });
  };

  const drawGeometricPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Geometric pattern with complex shapes
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

    // Angular border
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, width - 10, height - 10);

    // Geometric metrics with squares
    const metrics = [
      { label: 'Міцність', value: strength },
      { label: 'Кислотність', value: acidity },
      { label: 'Обсмажування', value: roast },
      { label: 'Насиченість', value: body },
    ];

    const startY = 50;
    const squareSize = 12;
    const squareSpacing = 16;
    const squaresX = width - 5 * squareSpacing - 20;

    metrics.forEach((metric, i) => {
      const y = startY + i * 25;
      
      // Label
      ctx.font = `${labelData.size === 'large' ? 14 : labelData.size === 'medium' ? 12 : 10}px sans-serif`;
      ctx.fillStyle = text;
      ctx.textAlign = 'left';
      ctx.fillText(metric.label, 20, y);
      
      // Squares
      for (let s = 1; s <= 5; s++) {
        const x = squaresX + (s - 1) * squareSpacing;
        ctx.fillStyle = s <= metric.value ? accent : hexToRGBA(secondary, 0.3);
        ctx.fillRect(x, y - squareSize, squareSize, squareSize);
      }
    });
  };


  const drawCaramelPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Caramel pattern with warm texture
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

    drawContent(ctx, width, height, 20, 20, text, accent);
  };

  const drawEmeraldPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Emerald pattern with nature-inspired texture
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

    drawContent(ctx, width, height, 20, 20, text, accent);
  };

  const drawIndigoPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Indigo pattern with cosmic texture
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

    drawContent(ctx, width, height, 20, 20, text, accent);
  };

  const drawCrimsonPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Crimson pattern with bold texture
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Add bold diagonal stripes
    ctx.strokeStyle = hexToRGBA(accent, 0.25);
    ctx.lineWidth = 2;
    for (let i = -width; i < width + height; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    drawContent(ctx, width, height, 20, 20, text, accent);
  };

  const drawGoldPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, bg: string, text: string, accent: string, secondary: string) => {
    // Gold pattern with elegant texture
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

    drawContent(ctx, width, height, 20, 20, text, accent);
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

    drawContent(ctx, width, height, 20, 20, text, accent);
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

    drawContent(ctx, width, height, 20, 20, text, accent);
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

    drawContent(ctx, width, height, 20, 20, text, accent);
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

    drawContent(ctx, width, height, 20, 20, text, accent);
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

    drawContent(ctx, width, height, 20, 20, text, accent);
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

    drawContent(ctx, width, height, 20, 20, text, accent);
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

    drawContent(ctx, width, height, 20, 20, text, accent);
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

    // Coffee name
    ctx.fillStyle = text;
    ctx.font = `bold ${labelData.size === 'large' ? 22 : labelData.size === 'medium' ? 18 : 14}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(coffeeName, width / 2, 35);

    drawContent(ctx, width, height, 20, 20, text, accent);
  };

  const drawContent = (ctx: CanvasRenderingContext2D, width: number, height: number, panelX: number, panelY: number, textColor: string, accent: string) => {
    // Coffee name with line breaking
    const nameFontSize = labelData.size === 'large' ? 20 : labelData.size === 'medium' ? 16 : 14;
    ctx.font = `bold ${nameFontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    
    // Split coffee name into lines if needed
    const maxNameWidth = width - 40;
    const nameWords = coffeeName.split(' ');
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
    const nameStartY = panelY + 20;
    nameLines.forEach((line, index) => {
      ctx.fillText(line.trim(), width / 2, nameStartY + index * nameLineHeight);
    });

    // Draw metrics
    const metrics = [
      { label: 'Міцність', value: strength },
      { label: 'Кислотність', value: acidity },
      { label: 'Обсмажування', value: roast },
      { label: 'Насиченість', value: body },
    ];

    const rowStartY = panelY + 20 + (nameLines.length * (nameFontSize + 4)) + 16;
    const rowGap = 28;
    const leftPad = panelX + 16;
    const dotsStartX = width - 16 - 5 * 14;
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
      const startY = height - 40 - (lines.length - 1) * lineHeight;
      
      lines.forEach((line, index) => {
        ctx.fillText(line.trim(), width / 2, startY + index * lineHeight);
      });
    }
  };

  useEffect(() => {
    drawLabel();
  }, [coffeeName, strength, acidity, roast, body, labelData]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded shadow-sm ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}