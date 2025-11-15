import { useEffect, useRef, useState } from 'react';

interface LineChartProps {
  data: Array<{ annee: number; value: number }>;
  label: string;
  color: string;
  height?: number;
}

export function LineChart({ data, color, height = 300 }: Omit<LineChartProps, 'label'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const h = rect.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = h - padding * 2;

    ctx.clearRect(0, 0, width, h);

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue;

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const value = maxValue - (range * i) / 5;
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toLocaleString(), padding - 10, y + 4);
    }

    // Draw zero line if applicable
    if (minValue < 0) {
      const zeroY = padding + ((maxValue - 0) / range) * chartHeight;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, zeroY);
      ctx.lineTo(width - padding, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const points = data.map((d, i) => ({
      x: padding + (chartWidth * i) / (data.length - 1),
      y: padding + ((maxValue - d.value) / range) * chartHeight,
    }));

    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();

    // Draw gradient fill
    ctx.lineTo(width - padding, h - padding);
    ctx.lineTo(padding, h - padding);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding, 0, h - padding);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw points
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw x-axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      if (i % 5 === 0 || i === data.length - 1) {
        const x = padding + (chartWidth * i) / (data.length - 1);
        ctx.fillText(`An ${d.annee}`, x, h - 15);
      }
    });
  }, [data, color]);

  return (
    <div className="relative" style={{ height }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

interface DonutSegment {
  label: string;
  value: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  centerText?: string;
  centerValue?: string;
}

export function DonutChart({ data, centerText, centerValue }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [segments, _setSegments] = useState<DonutSegment[]>([]);

  // We need to use a ref to store segments to avoid dependency issues
  const segmentsRef = useRef<DonutSegment[]>([]);
  const setSegments = (newSegments: DonutSegment[]) => {
    segmentsRef.current = newSegments;
    _setSegments(newSegments);
  };

  useEffect(() => {
    if (!data || data.length === 0) {
      setSegments([]);
      return;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      setSegments([]);
      return;
    }

    let currentAngle = -Math.PI / 2;
    const computedSegments = data.map((item) => {
      const angle = (item.value / total) * Math.PI * 2;
      const segment: DonutSegment = {
        label: item.label,
        value: item.value,
        color: item.color,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      };
      currentAngle += angle;
      return segment;
    });

    setSegments(computedSegments);
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.6;

    ctx.clearRect(0, 0, width, height);

    // Draw segments
    segments.forEach((segment, index) => {
      const isHovered = index === hoveredIndex;
      const highlightFactor = isHovered ? 1.1 : 1;

      // Draw outer arc with highlight effect
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * highlightFactor, segment.startAngle, segment.endAngle);
      ctx.arc(centerX, centerY, innerRadius, segment.endAngle, segment.startAngle, true);
      ctx.closePath();

      // Apply highlight effect
      const color = isHovered ?
        `${segment.color}${isHovered ? 'cc' : 'ff'}` : // Add transparency on hover
        segment.color;

      ctx.fillStyle = color;
      ctx.fill();

      // Draw border
      ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.stroke();
    });

    // Center text
    if (centerText) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(centerValue || '', centerX, centerY - 10);

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(centerText, centerX, centerY + 15);
    }
  }, [data, centerText, centerValue, segments, hoveredIndex, canvasRef]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 2 - 20;
    const innerRadius = radius * 0.6;

    // Calculate distance from center and angle
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if mouse is within the donut
    if (distance >= innerRadius && distance <= radius) {
      // Calculate angle in radians (0 to 2π)
      let angle = Math.atan2(dy, dx);
      // Convert to 0 to 2π range
      if (angle < 0) angle += 2 * Math.PI;
      // Adjust for initial -π/2 rotation
      angle = (angle + Math.PI / 2) % (2 * Math.PI);

      // Find the segment that contains this angle
      const hoveredSegmentIndex = segmentsRef.current.findIndex(
        segment => angle >= segment.startAngle && angle <= segment.endAngle
      );

      if (hoveredSegmentIndex !== hoveredIndex) {
        setHoveredIndex(hoveredSegmentIndex !== -1 ? hoveredSegmentIndex : null);
      }
    } else if (hoveredIndex !== null) {
      setHoveredIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-64 h-64">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          style={{ width: '100%', height: '100%' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      <div className="flex-1 space-y-2">
        {data.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-2 rounded transition-all duration-200 ${i === hoveredIndex
              ? 'bg-slate-100 dark:bg-slate-700 scale-[1.02] shadow-lg'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value.toLocaleString()} €</span>
              <span className="text-xs text-slate-500 ml-2">
                {((item.value / data.reduce((s, d) => s + d.value, 0)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BarChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  height?: number;
}

export function BarChart({ data, height = 250 }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const h = rect.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = h - padding * 2;

    ctx.clearRect(0, 0, width, h);

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length - 10;

    data.forEach((item, i) => {
      const x = padding + (chartWidth / data.length) * i + 5;
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = h - padding - barHeight;

      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(x, y, x, h - padding);
      gradient.addColorStop(0, item.color);
      gradient.addColorStop(1, item.color + 'aa');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toLocaleString(), x + barWidth / 2, y - 5);

      // Draw label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.save();
      ctx.translate(x + barWidth / 2, h - 10);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.fillText(item.label, 0, 0);
      ctx.restore();
    });
  }, [data]);

  return (
    <div className="relative" style={{ height }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
