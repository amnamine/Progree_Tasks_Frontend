/**
 * APEXMETRICS ENTERPRISE - THEME MANAGER ENGINE
 * Handles multi-theme switching (Dark, Light, Cyber, Slate),
 * system color scheme detection, custom event broadcasting, and persistent state.
 */

export class ThemeManager {
  constructor() {
    this.storageKey = 'apexmetrics_theme_preference';
    this.compactKey = 'apexmetrics_compact_mode';
    this.soundKey = 'apexmetrics_sound_enabled';
    this.currentTheme = localStorage.getItem(this.storageKey) || 'dark';
    this.isCompact = localStorage.getItem(this.compactKey) === 'true';
    this.isSoundEnabled = localStorage.getItem(this.soundKey) !== 'false';
    
    this.themeColors = {
      dark: { grid: 'rgba(255, 255, 255, 0.08)', text: '#94a3b8', primary: '#6366f1', secondary: '#a855f7' },
      light: { grid: 'rgba(0, 0, 0, 0.06)', text: '#475569', primary: '#4f46e5', secondary: '#7c3aed' },
      cyber: { grid: 'rgba(0, 240, 255, 0.12)', text: '#00f0ff', primary: '#00f0ff', secondary: '#ff007f' },
      slate: { grid: 'rgba(96, 165, 250, 0.12)', text: '#93c5fd', primary: '#38bdf8', secondary: '#818cf8' }
    };

    this.listeners = [];
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme, false);
    if (this.isCompact) {
      document.body.classList.add('compact-mode');
    }
  }

  applyTheme(themeName, broadcast = true) {
    if (!['dark', 'light', 'cyber', 'slate'].includes(themeName)) {
      themeName = 'dark';
    }
    this.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(this.storageKey, themeName);

    // Update checkmark/active indicator in UI
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      if (btn.getAttribute('data-theme-choice') === themeName) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    if (broadcast) {
      this.notifyListeners(themeName);
    }
  }

  toggleCompactMode() {
    this.isCompact = !this.isCompact;
    document.body.classList.toggle('compact-mode', this.isCompact);
    localStorage.setItem(this.compactKey, this.isCompact);
    return this.isCompact;
  }

  toggleSound() {
    this.isSoundEnabled = !this.isSoundEnabled;
    localStorage.setItem(this.soundKey, this.isSoundEnabled);
    return this.isSoundEnabled;
  }

  onThemeChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(themeName) {
    const config = this.themeColors[themeName] || this.themeColors.dark;
    this.listeners.forEach(cb => {
      try {
        cb(themeName, config);
      } catch (err) {
        console.warn('Theme listener callback error:', err);
      }
    });
  }

  getChartThemeConfig() {
    return this.themeColors[this.currentTheme] || this.themeColors.dark;
  }
}
