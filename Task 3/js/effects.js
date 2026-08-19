/**
 * AETHERIA - Interactive Dynamic Canvas Atmosphere Engine
 * Simulates real-time weather particles: Rain, Snow, Sun Rays, Clouds, Stars, Lightning.
 */

class WeatherAtmosphereEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.weatherType = 'clear-day';
    this.animationFrameId = null;
    this.isEnabled = true;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.lightningTimer = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setWeather('clear-day');
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.createParticles();
  }

  setWeather(weatherType) {
    this.weatherType = weatherType;
    document.body.setAttribute('data-weather', weatherType);
    this.createParticles();
  }

  toggleEffects(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  createParticles() {
    this.particles = [];
    if (this.lightningTimer) {
      clearInterval(this.lightningTimer);
      this.lightningTimer = null;
    }

    const w = this.width;
    const h = this.height;

    switch (this.weatherType) {
      case 'rain':
      case 'thunderstorm':
        const rainCount = this.weatherType === 'thunderstorm' ? 140 : 90;
        for (let i = 0; i < rainCount; i++) {
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            length: Math.random() * 20 + 10,
            speedY: Math.random() * 12 + 14,
            speedX: -2.5,
            opacity: Math.random() * 0.4 + 0.2,
            type: 'rain'
          });
        }
        if (this.weatherType === 'thunderstorm') {
          this.lightningTimer = setInterval(() => this.triggerLightning(), 7000 + Math.random() * 8000);
        }
        break;

      case 'snow':
        for (let i = 0; i < 70; i++) {
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            radius: Math.random() * 3 + 1,
            speedY: Math.random() * 1.5 + 0.8,
            speedX: Math.random() * 1.2 - 0.6,
            opacity: Math.random() * 0.6 + 0.3,
            wobble: Math.random() * Math.PI * 2,
            type: 'snow'
          });
        }
        break;

      case 'clear-night':
        for (let i = 0; i < 90; i++) {
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * (h * 0.7),
            radius: Math.random() * 1.8 + 0.5,
            opacity: Math.random() * 0.8 + 0.2,
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            phase: Math.random() * Math.PI * 2,
            type: 'star'
          });
        }
        break;

      case 'clear-day':
        // Warm subtle floating light motes / solar dust
        for (let i = 0; i < 35; i++) {
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            radius: Math.random() * 2.5 + 1,
            speedY: -Math.random() * 0.5 - 0.2,
            speedX: Math.random() * 0.6 - 0.3,
            opacity: Math.random() * 0.4 + 0.1,
            type: 'solar-mote'
          });
        }
        break;

      case 'clouds':
      case 'fog':
        for (let i = 0; i < 15; i++) {
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * (h * 0.6),
            radius: Math.random() * 100 + 80,
            speedX: Math.random() * 0.3 + 0.1,
            opacity: Math.random() * 0.04 + 0.02,
            type: 'cloud-puff'
          });
        }
        break;
    }
  }

  triggerLightning() {
    const flashEl = document.createElement('div');
    flashEl.className = 'lightning-flash flash-active';
    document.body.appendChild(flashEl);
    setTimeout(() => {
      if (flashEl.parentNode) flashEl.parentNode.removeChild(flashEl);
    }, 550);
  }

  animate() {
    if (!this.isEnabled) {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let p of this.particles) {
      if (p.type === 'rain') {
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + p.speedX * 1.5, p.y + p.length);
        this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
        this.ctx.lineWidth = 1.2;
        this.ctx.stroke();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > this.height) {
          p.y = -p.length;
          p.x = Math.random() * this.width;
        }
      } else if (p.type === 'snow') {
        p.wobble += 0.02;
        p.x += Math.sin(p.wobble) * 0.7 + p.speedX;
        p.y += p.speedY;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.fill();

        if (p.y > this.height) {
          p.y = -p.radius;
          p.x = Math.random() * this.width;
        }
      } else if (p.type === 'star') {
        p.phase += p.twinkleSpeed;
        const currentOpacity = (Math.sin(p.phase) + 1) / 2 * p.opacity;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(224, 231, 255, ${currentOpacity})`;
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = '#818cf8';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      } else if (p.type === 'solar-mote') {
        p.x += p.speedX;
        p.y += p.speedY;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(254, 240, 138, ${p.opacity})`;
        this.ctx.fill();

        if (p.y < 0) {
          p.y = this.height + p.radius;
          p.x = Math.random() * this.width;
        }
      } else if (p.type === 'cloud-puff') {
        p.x += p.speedX;
        if (p.x - p.radius > this.width) p.x = -p.radius;

        const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.beginPath();
        this.ctx.fillStyle = grad;
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}

window.WeatherAtmosphereEngine = WeatherAtmosphereEngine;
