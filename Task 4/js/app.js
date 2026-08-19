/**
 * APEXMETRICS ENTERPRISE - MAIN APPLICATION ORCHESTRATOR
 * Coordinates global UI state, Command Palette (Ctrl+K),
 * drilldown modals, toast notifications, and telemetry handlers.
 */

import { MockData } from './mockData.js';
import { ThemeManager } from './themeManager.js';
import { ChartManager } from './charts.js';
import { DataTableManager } from './dataTable.js';
import { LiveStreamSimulator } from './simulator.js';
import { AppRouter } from './router.js';

class ApexApp {
  constructor() {
    this.DataTableClass = DataTableManager;
    this.dataTable = null;

    // Subsystems
    this.themeManager = new ThemeManager();
    this.chartManager = new ChartManager(this.themeManager);
    this.simulator = new LiveStreamSimulator(this.chartManager, this.themeManager, (evt) => this.handleLiveEvent(evt));
    this.router = new AppRouter(this);

    this.initGlobalListeners();
  }

  init() {
    this.router.init();
    this.showToast('ApexMetrics Live', 'Connected to real-time cluster telemetry', 'success');
  }

  handleLiveEvent(event) {
    // If currently on dashboard view, prepend to live events list
    const feed = document.getElementById('liveEventsList');
    if (feed) {
      const item = document.createElement('div');
      item.style.cssText = 'display: flex; align-items: flex-start; gap: 12px; padding: 10px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); animation: fadeInView 250ms ease-out;';
      item.innerHTML = `
        <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${event.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-info-bg)'}; color: ${event.type === 'success' ? 'var(--color-success)' : 'var(--color-info)'}; font-size: 0.8rem; font-weight: bold;">
          ${event.type === 'success' ? '✓' : 'i'}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${event.title}</div>
            <span style="font-size: 0.72rem; color: var(--primary-400); font-weight: 600;">${event.formattedAmount}</span>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${event.clientName} (${event.region}) • ${event.timestamp}</div>
        </div>
      `;
      feed.insertBefore(item, feed.firstChild);
      if (feed.children.length > 8) {
        feed.removeChild(feed.lastChild);
      }
    }
  }

  initGlobalListeners() {
    // 1. Sidebar Collapse Button
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const sidebar = document.querySelector('.sidebar');
    if (collapseBtn && sidebar) {
      collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // 2. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const overlay = document.getElementById('sidebarOverlay');
    if (mobileToggle && sidebar && overlay) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
      });
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
    }

    // 3. Theme Dropdown Toggle in Header
    const themeBtn = document.getElementById('themeDropdownBtn');
    const themeMenu = document.getElementById('themeDropdownMenu');
    if (themeBtn && themeMenu) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('active');
      });

      document.querySelectorAll('.theme-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const theme = btn.getAttribute('data-theme-choice');
          this.themeManager.applyTheme(theme);
          themeMenu.classList.remove('active');
          this.showToast('Theme Changed', `Switched to ${theme.toUpperCase()} theme`, 'info');
        });
      });

      document.addEventListener('click', () => {
        themeMenu.classList.remove('active');
      });
    }

    // 4. Live Stream Pause / Play Toggle
    const streamToggleBtn = document.getElementById('liveStreamToggleBtn');
    if (streamToggleBtn) {
      streamToggleBtn.addEventListener('click', () => {
        const isRunning = this.simulator.toggle();
        this.showToast(
          isRunning ? 'Telemetry Resumed' : 'Telemetry Paused',
          isRunning ? 'Live updates flowing' : 'Data ingestion halted',
          isRunning ? 'success' : 'warning'
        );
      });
    }

    // 5. Command Palette (Ctrl+K / Cmd+K)
    const cmdBtn = document.getElementById('commandPaletteBtn');
    const cmdModal = document.getElementById('commandPaletteModal');
    const cmdInput = document.getElementById('commandPaletteInput');
    const cmdResults = document.getElementById('commandPaletteResults');

    const openCommandPalette = () => {
      if (!cmdModal) return;
      cmdModal.classList.add('active');
      if (cmdInput) {
        cmdInput.value = '';
        cmdInput.focus();
        this.renderCommandResults('');
      }
    };

    const closeCommandPalette = () => {
      if (cmdModal) cmdModal.classList.remove('active');
    };

    if (cmdBtn) cmdBtn.addEventListener('click', openCommandPalette);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (cmdModal?.classList.contains('active')) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
      }
      if (e.key === 'Escape') {
        closeCommandPalette();
        this.closeModal();
      }
    });

    cmdModal?.addEventListener('click', (e) => {
      if (e.target === cmdModal) closeCommandPalette();
    });

    cmdInput?.addEventListener('input', (e) => {
      this.renderCommandResults(e.target.value);
    });

    // 6. Global Modal Close Buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });
  }

  // Render searchable Command Palette results
  renderCommandResults(query) {
    const resultsContainer = document.getElementById('commandPaletteResults');
    if (!resultsContainer) return;

    const q = (query || '').toLowerCase().trim();
    const commands = [
      { label: 'Go to Executive Dashboard', category: 'Navigation', icon: '📊', action: () => this.router.navigate('dashboard') },
      { label: 'Deep Analytics & Regional Matrix', category: 'Navigation', icon: '📈', action: () => this.router.navigate('analytics') },
      { label: 'Financial Operations & EBITDA Ledger', category: 'Navigation', icon: '💰', action: () => this.router.navigate('finance') },
      { label: 'Enterprise Customers Roster', category: 'Navigation', icon: '👥', action: () => this.router.navigate('customers') },
      { label: 'Infrastructure & Edge Cluster Health', category: 'Navigation', icon: '🖥️', action: () => this.router.navigate('inventory') },
      { label: 'Compliance Reports & SOC2 Exports', category: 'Navigation', icon: '📁', action: () => this.router.navigate('reports') },
      { label: 'Portal Settings & Theming', category: 'Navigation', icon: '⚙️', action: () => this.router.navigate('settings') },
      { label: 'Switch to Midnight Dark Theme', category: 'Action', icon: '🌙', action: () => this.themeManager.applyTheme('dark') },
      { label: 'Switch to Cyber Neon Theme', category: 'Action', icon: '⚡', action: () => this.themeManager.applyTheme('cyber') },
      { label: 'Switch to Clean Light Theme', category: 'Action', icon: '☀️', action: () => this.themeManager.applyTheme('light') },
      { label: 'Switch to Royal Slate Theme', category: 'Action', icon: '💎', action: () => this.themeManager.applyTheme('slate') },
      { label: 'Export Customer Matrix to CSV', category: 'Action', icon: '📥', action: () => this.dataTable?.exportCSV() },
      { label: 'Toggle Synthesized Audio Chimes', category: 'Action', icon: '🔔', action: () => this.themeManager.toggleSound() }
    ];

    const filtered = commands.filter(c => !q || c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));

    resultsContainer.innerHTML = filtered.map((c, idx) => `
      <div class="command-item ${idx === 0 ? 'focused' : ''}" data-cmd-idx="${idx}">
        <span style="font-size: 1.1rem;">${c.icon}</span>
        <span style="font-weight: 600;">${c.label}</span>
        <span class="command-item-tag">${c.category}</span>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('.command-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        filtered[index].action();
        document.getElementById('commandPaletteModal')?.classList.remove('active');
      });
    });
  }

  // Show Customer Drilldown Dossier Modal
  showCustomerDossier(customer) {
    const modal = document.getElementById('drilldownModal');
    const content = document.getElementById('drilldownModalContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg);">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 2.2rem; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: var(--bg-input); border-radius: var(--radius-lg); border: 1px solid var(--border-medium);">
            ${customer.logo}
          </div>
          <div>
            <h2 style="font-size: 1.4rem;">${customer.name}</h2>
            <div style="font-size: 0.82rem; color: var(--text-muted);">Tenant ID: <span style="font-family: var(--font-mono); color: var(--primary-400);">${customer.id}</span> • Region: ${customer.region}</div>
          </div>
        </div>
        <span class="badge ${customer.status === 'Active' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.85rem; padding: 5px 12px;">
          ● ${customer.status}
        </span>
      </div>

      <!-- Quick Metrics Grid in Modal -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin-bottom: var(--space-lg);">
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Annual Recurring ARR</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary-400); margin-top: 2px;">$${customer.arr.toLocaleString()}</div>
        </div>
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Active User Seats</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${customer.seats} Seats</div>
        </div>
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Tenant Health Index</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: ${customer.healthScore > 85 ? 'var(--color-success)' : 'var(--color-warning)'}; margin-top: 2px;">${customer.healthScore}%</div>
        </div>
      </div>

      <!-- Dossier Details Section -->
      <div style="background: var(--bg-input); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: var(--space-lg);">
        <h4 style="font-size: 0.92rem; margin-bottom: 8px;">Key Contact & Account Management</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem;">
          <div><strong style="color: var(--text-muted);">Executive Lead:</strong> <span style="color: var(--text-primary);">${customer.contact}</span></div>
          <div><strong style="color: var(--text-muted);">Direct Email:</strong> <a href="mailto:${customer.email}">${customer.email}</a></div>
          <div><strong style="color: var(--text-muted);">Subscription Tier:</strong> <span style="color: var(--text-primary);">${customer.tier}</span></div>
          <div><strong style="color: var(--text-muted);">Department:</strong> <span style="color: var(--text-primary);">${customer.department}</span></div>
        </div>
      </div>

      <!-- Raw JSON Telemetry Inspector -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <h4 style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Raw Profile JSON Schema</h4>
          <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--accent-cyan);">application/json</span>
        </div>
        <pre style="background: #05070e; color: #a5f3fc; padding: 12px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.76rem; max-height: 140px; overflow-y: auto; border: 1px solid var(--border-medium);">${JSON.stringify(customer, null, 2)}</pre>
      </div>
    `;

    modal.classList.add('active');
  }

  closeModal() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  // Toast Notification Dispatcher
  showToast(title, desc, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon" style="color: ${type === 'success' ? 'var(--color-success)' : type === 'warning' ? 'var(--color-warning)' : 'var(--primary-400)'};">
        ${type === 'success' ? '✓' : type === 'warning' ? '⚠️' : '⚡'}
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 300ms ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
}

// Bootstrap on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new ApexApp();
  window.app.init();
});
