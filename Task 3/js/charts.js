/**
 * AETHERIA - Lightweight High-Performance Canvas Chart Engine
 * Renders smooth bezier curves for temperature, precipitation probability, and wind trajectories.
 */

class WeatherChartEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.mode = 'temp'; // 'temp' | 'rain' | 'wind'
    this.data = null;
    this.unit = 'celsius';

    window.addEventListener('resize', () => {
      if (this.data) this.render(this.data, this.mode, this.unit);
    });
  }

  render(data, mode = 'temp', unit = 'celsius') {
    this.data = data;
    this.mode = mode;
    this.unit = unit;

    if (!this.canvas || !data || !data.hourly || data.hourly.length === 0) return;

    // High DPI Support
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = 140 * dpr;
    this.ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 140;
    const padding = { top: 25, bottom: 25, left: 20, right: 20 };

    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    // Limit to next 16 hours for clean chart layout
    const points = data.hourly.slice(0, 16);
    if (points.length < 2) return;

    let values = [];
    let strokeColor = '#38bdf8';
    let gradColorStart = 'rgba(56, 189, 248, 0.35)';
    let gradColorEnd = 'rgba(56, 189, 248, 0.0)';
    let unitLabel = '°';

    if (mode === 'temp') {
      values = points.map(p => unit === 'celsius' ? p.tempC : p.tempF);
      strokeColor = '#38bdf8';
      gradColorStart = 'rgba(56, 189, 248, 0.38)';
      unitLabel = '°';
    } else if (mode === 'rain') {
      values = points.map(p => p.pop); // probability of precipitation %
      strokeColor = '#60a5fa';
      gradColorStart = 'rgba(96, 165, 250, 0.4)';
      unitLabel = '%';
    } else if (mode === 'wind') {
      values = points.map(p => p.windSpeed);
      strokeColor = '#a855f7';
      gradColorStart = 'rgba(168, 85, 247, 0.38)';
      unitLabel = ' km/h';
    }

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = (maxVal - minVal) === 0 ? 1 : (maxVal - minVal);

    const stepX = (width - padding.left - padding.right) / (points.length - 1);
    const chartHeight = height - padding.top - padding.bottom;

    const coords = values.map((val, i) => {
      const x = padding.left + i * stepX;
      const normY = (val - minVal) / range;
      const y = height - padding.bottom - (normY * chartHeight * 0.75) - 5;
      return { x, y, val, time: points[i].timeStr };
    });

    // Draw Smooth Area Gradient
    ctx.beginPath();
    ctx.moveTo(coords[0].x, height - padding.bottom);
    ctx.lineTo(coords[0].x, coords[0].y);

    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const midX = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
    }

    ctx.lineTo(coords[coords.length - 1].x, height - padding.bottom);
    ctx.closePath();

    const areaGrad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    areaGrad.addColorStop(0, gradColorStart);
    areaGrad.addColorStop(1, gradColorEnd);
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Draw Smooth Stroke Line
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const midX = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Value Dots and Labels
    coords.forEach((pt, index) => {
      // Circle Dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text Value above
      ctx.font = '600 10px "Outfit", sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(pt.val)}${unitLabel}`, pt.x, pt.y - 8);

      // Time below
      if (index % 2 === 0 || index === coords.length - 1) {
        ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(pt.time, pt.x, height - 6);
      }
    });
  }
}

window.WeatherChartEngine = WeatherChartEngine;
