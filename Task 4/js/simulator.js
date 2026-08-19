/**
 * APEXMETRICS ENTERPRISE - REAL-TIME TELEMETRY SIMULATOR
 * Simulates high-frequency WebSocket streams, live transaction ingestion,
 * reactive counter increments, and synthesized Web Audio notifications.
 */

import { MockData } from './mockData.js';

export class LiveStreamSimulator {
  constructor(chartManager, themeManager, onEventCallback) {
    this.chartManager = chartManager;
    this.themeManager = themeManager;
    this.onEvent = onEventCallback || (() => {});

    this.isRunning = true;
    this.intervalMs = 2500;
    this.timerId = null;
    this.audioCtx = null;

    this.init();
  }

  init() {
    this.start();
  }

  start() {
    this.isRunning = true;
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.tick(), this.intervalMs);
    this.updateControlsUI();
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.updateControlsUI();
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  setSpeed(intervalMs) {
    this.intervalMs = parseInt(intervalMs, 10);
    if (this.isRunning) {
      this.start();
    }
  }

  tick() {
    // 1. Generate live event
    const event = MockData.generateRandomEvent();

    // 2. Play gentle audio chime if enabled
    if (this.themeManager.isSoundEnabled) {
      this.playChime();
    }

    // 3. Mutate live sparkline chart if present
    const throughput = Math.floor(Math.random() * 45) + 65;
    this.chartManager.pushLiveSparklineData('liveThroughputSparkline', throughput);

    // 4. Update reactive mini counters in UI
    this.pulseLiveCounters(event.amount);

    // 5. Broadcast to application event listener
    this.onEvent(event);
  }

  pulseLiveCounters(amountDelta = 0) {
    // ARR slight increment
    const arrEl = document.getElementById('liveArrMetric');
    if (arrEl) {
      const current = parseFloat(arrEl.getAttribute('data-raw-val') || '14820500');
      const updated = current + (amountDelta > 0 ? amountDelta : 1200);
      arrEl.setAttribute('data-raw-val', updated);
      arrEl.textContent = '$' + (updated / 1000000).toFixed(2) + 'M';
      arrEl.classList.add('metric-highlight');
      setTimeout(() => arrEl.classList.remove('metric-highlight'), 600);
    }

    // Active users jitter
    const usersEl = document.getElementById('liveUsersMetric');
    if (usersEl) {
      const current = parseInt(usersEl.getAttribute('data-raw-val') || '84920', 10);
      const delta = Math.floor(Math.random() * 7) - 2;
      const updated = Math.max(1000, current + delta);
      usersEl.setAttribute('data-raw-val', updated);
      usersEl.textContent = updated.toLocaleString();
    }
  }

  playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, this.audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch (e) {
      // Audio context might be restricted before first user gesture
    }
  }

  updateControlsUI() {
    const playPauseBtn = document.getElementById('liveStreamToggleBtn');
    const statusDot = document.getElementById('livePulseIndicator');
    const statusLabel = document.getElementById('liveStreamStatusLabel');

    if (playPauseBtn) {
      playPauseBtn.innerHTML = this.isRunning ? '⏸' : '▶';
      playPauseBtn.title = this.isRunning ? 'Pause Live Stream' : 'Resume Live Stream';
    }

    if (statusDot) {
      statusDot.style.backgroundColor = this.isRunning ? 'var(--color-success)' : 'var(--color-warning)';
    }

    if (statusLabel) {
      statusLabel.textContent = this.isRunning ? 'LIVE 2.4k req/s' : 'PAUSED';
    }
  }
}
