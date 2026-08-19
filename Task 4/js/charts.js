/**
 * APEXMETRICS ENTERPRISE - REACTIVE CHART FACTORY & CONTROLLER
 * Integrates Chart.js with dynamic datasets, gradient area rendering,
 * responsive resize handlers, theme adaptation, and live metric mutations.
 */

import { MockData } from './mockData.js';

export class ChartManager {
  constructor(themeManager) {
    this.themeManager = themeManager;
    this.instances = {};

    // Register theme change hook to dynamically re-style chart axes and grids
    this.themeManager.onThemeChange((themeName, config) => {
      this.applyThemeToAll(config);
    });
  }

  // Create gradient helper for Chart.js canvas contexts
  createLinearGradient(ctx, colorStart, colorEnd, height = 300) {
    if (!ctx) return colorStart;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  }

  // Global default configuration for Chart.js
  getDefaultOptions(themeConfig) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: themeConfig.text,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '500' },
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: { family: "'Outfit', sans-serif", weight: 'bold', size: 13 },
          bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
          displayColors: true,
          usePointStyle: true
        }
      },
      scales: {
        x: {
          grid: { color: themeConfig.grid, drawBorder: false },
          ticks: {
            color: themeConfig.text,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
          }
        },
        y: {
          grid: { color: themeConfig.grid, drawBorder: false },
          ticks: {
            color: themeConfig.text,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callback: function(val) {
              if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
              if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'k';
              return val;
            }
          }
        }
      }
    };
  }

  // Initialize Revenue / MRR Overview Chart
  renderRevenueChart(canvasId, type = 'line') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const ctx = canvas.getContext('2d');
    const themeConfig = this.themeManager.getChartThemeConfig();
    const ts = MockData.revenueTimeSeries;

    const fillRevenue = this.createLinearGradient(ctx, 'rgba(99, 102, 241, 0.35)', 'rgba(99, 102, 241, 0.01)', 280);
    const fillExpenses = this.createLinearGradient(ctx, 'rgba(239, 68, 68, 0.25)', 'rgba(239, 68, 68, 0.01)', 280);

    const chart = new Chart(ctx, {
      type: type,
      data: {
        labels: ts.labels,
        datasets: [
          {
            label: 'Total ARR Revenue',
            data: [...ts.revenue],
            borderColor: themeConfig.primary,
            backgroundColor: fillRevenue,
            borderWidth: 3,
            fill: true,
            tension: 0.38,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: themeConfig.primary
          },
          {
            label: 'Operating Expenses',
            data: [...ts.expenses],
            borderColor: '#ef4444',
            backgroundColor: fillExpenses,
            borderWidth: 2,
            fill: true,
            borderDash: type === 'line' ? [5, 5] : [],
            tension: 0.38,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#ef4444'
          }
        ]
      },
      options: this.getDefaultOptions(themeConfig)
    });

    this.instances[canvasId] = chart;
    return chart;
  }

  // Initialize Acquisition Channels Doughnut Chart
  renderAcquisitionChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const ctx = canvas.getContext('2d');
    const themeConfig = this.themeManager.getChartThemeConfig();
    const acq = MockData.acquisitionChannels;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: acq.labels,
        datasets: [{
          data: acq.data,
          backgroundColor: acq.colors,
          borderColor: 'transparent',
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: themeConfig.text,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              boxWidth: 10,
              padding: 14
            }
          },
          tooltip: {
            callbacks: {
              label: function(item) {
                return ` ${item.label}: ${item.raw}% of ARR`;
              }
            }
          }
        }
      }
    });

    this.instances[canvasId] = chart;
    return chart;
  }

  // Initialize Regional Stacked Bar Chart
  renderRegionalChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const ctx = canvas.getContext('2d');
    const themeConfig = this.themeManager.getChartThemeConfig();
    const reg = MockData.regionalData;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: reg.labels,
        datasets: [
          {
            label: 'ARR Revenue ($)',
            data: reg.revenue,
            backgroundColor: themeConfig.primary,
            borderRadius: 6
          }
        ]
      },
      options: this.getDefaultOptions(themeConfig)
    });

    this.instances[canvasId] = chart;
    return chart;
  }

  // Initialize Department SLA Radar Chart
  renderRadarChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const ctx = canvas.getContext('2d');
    const themeConfig = this.themeManager.getChartThemeConfig();
    const dept = MockData.departmentPerformance;

    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: dept.labels,
        datasets: [
          {
            label: 'Actual Efficiency Index',
            data: dept.actualScore,
            borderColor: themeConfig.primary,
            backgroundColor: 'rgba(99, 102, 241, 0.25)',
            borderWidth: 2,
            pointBackgroundColor: themeConfig.primary
          },
          {
            label: 'Quarterly Target SLA',
            data: dept.targetScore,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            borderWidth: 2,
            borderDash: [4, 4],
            pointBackgroundColor: '#06b6d4'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: themeConfig.grid },
            grid: { color: themeConfig.grid },
            pointLabels: {
              color: themeConfig.text,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            },
            ticks: { display: false, min: 50, max: 100 }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: themeConfig.text, font: { size: 11 } }
          }
        }
      }
    });

    this.instances[canvasId] = chart;
    return chart;
  }

  // Live real-time rolling sparkline
  renderLiveSparkline(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (this.instances[canvasId]) this.instances[canvasId].destroy();

    const ctx = canvas.getContext('2d');
    const initialLabels = Array.from({ length: 15 }, (_, i) => `${15 - i}s ago`);
    const initialData = Array.from({ length: 15 }, () => Math.floor(Math.random() * 40) + 60);

    const gradient = this.createLinearGradient(ctx, 'rgba(16, 185, 129, 0.35)', 'rgba(16, 185, 129, 0.01)', 100);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: initialLabels,
        datasets: [{
          data: initialData,
          borderColor: '#10b981',
          backgroundColor: gradient,
          fill: true,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false, min: 30, max: 120 } }
      }
    });

    this.instances[canvasId] = chart;
    return chart;
  }

  // Push new live datapoint to rolling sparkline
  pushLiveSparklineData(canvasId, value) {
    const chart = this.instances[canvasId];
    if (!chart) return;

    chart.data.labels.shift();
    chart.data.labels.push('now');
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(value);
    chart.update('none');
  }

  // Switch chart type dynamically (e.g., line to bar or area)
  switchType(canvasId, newType) {
    const chart = this.instances[canvasId];
    if (!chart) return;
    if (canvasId === 'revenueChart') {
      this.renderRevenueChart(canvasId, newType);
    }
  }

  // Export chart canvas as PNG download
  exportPNG(canvasId, fileName = 'apexmetrics_chart.png') {
    const chart = this.instances[canvasId];
    if (!chart) return;
    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
  }

  // Re-apply theme styling across all registered charts
  applyThemeToAll(themeConfig) {
    Object.values(this.instances).forEach(chart => {
      if (!chart || !chart.options) return;

      if (chart.options.plugins && chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = themeConfig.text;
      }
      if (chart.options.scales) {
        if (chart.options.scales.x) {
          chart.options.scales.x.grid.color = themeConfig.grid;
          chart.options.scales.x.ticks.color = themeConfig.text;
        }
        if (chart.options.scales.y) {
          chart.options.scales.y.grid.color = themeConfig.grid;
          chart.options.scales.y.ticks.color = themeConfig.text;
        }
        if (chart.options.scales.r) {
          chart.options.scales.r.grid.color = themeConfig.grid;
          chart.options.scales.r.angleLines.color = themeConfig.grid;
          chart.options.scales.r.pointLabels.color = themeConfig.text;
        }
      }
      chart.update();
    });
  }

  destroyAll() {
    Object.keys(this.instances).forEach(key => {
      if (this.instances[key]) {
        this.instances[key].destroy();
        delete this.instances[key];
      }
    });
  }
}
