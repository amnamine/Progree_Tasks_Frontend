/**
 * APEXMETRICS ENTERPRISE - CLIENT-SIDE SPA HASH ROUTER
 * Powers seamless multi-view transitions, dynamic view templating,
 * chart instance mounting, and breadcrumb synchronization.
 */

import { MockData } from './mockData.js';

export class AppRouter {
  constructor(app) {
    this.app = app;
    this.routes = {
      dashboard: () => this.renderDashboardView(),
      analytics: () => this.renderAnalyticsView(),
      finance: () => this.renderFinanceView(),
      customers: () => this.renderCustomersView(),
      inventory: () => this.renderInfrastructureView(),
      reports: () => this.renderReportsView(),
      settings: () => this.renderSettingsView()
    };

    this.currentView = 'dashboard';
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  init() {
    this.handleHashChange();
  }

  handleHashChange() {
    const rawHash = window.location.hash.replace('#', '').trim();
    const targetRoute = this.routes[rawHash] ? rawHash : 'dashboard';
    this.navigate(targetRoute, false);
  }

  navigate(viewName, updateHash = true) {
    if (!this.routes[viewName]) viewName = 'dashboard';
    this.currentView = viewName;

    if (updateHash) {
      window.location.hash = viewName;
    }

    // Update active nav links in sidebar
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes(viewName)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    }

    // Execute view template
    const contentBody = document.getElementById('viewContainer');
    if (contentBody) {
      contentBody.innerHTML = '';
      this.routes[viewName]();
    }

    // Close mobile menu if open
    document.querySelector('.sidebar')?.classList.remove('mobile-open');
    document.querySelector('.sidebar-overlay')?.classList.remove('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 1. DASHBOARD VIEW ---
  renderDashboardView() {
    const container = document.getElementById('viewContainer');
    const { kpis, liveEvents } = MockData;

    container.innerHTML = `
      <div class="view-container">
        <!-- Top KPI Metrics Grid -->
        <div class="kpi-grid">
          <div class="glass-panel kpi-card hover-lift">
            <div class="kpi-card-header">
              <span class="kpi-title">Annual Recurring (ARR)</span>
              <div class="kpi-icon-wrapper purple">💰</div>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value" id="liveArrMetric" data-raw-val="${kpis.arr.value}">${kpis.arr.formatted}</span>
              <span class="kpi-trend positive">↑ ${kpis.arr.change}%</span>
            </div>
            <div class="kpi-footer">
              <span>${kpis.arr.subtext}</span>
              <span style="font-family: var(--font-mono);">${kpis.arr.timeframe}</span>
            </div>
          </div>

          <div class="glass-panel kpi-card hover-lift">
            <div class="kpi-card-header">
              <span class="kpi-title">Active Live Users</span>
              <div class="kpi-icon-wrapper cyan">👥</div>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value" id="liveUsersMetric" data-raw-val="${kpis.activeUsers.value}">${kpis.activeUsers.formatted}</span>
              <span class="kpi-trend positive">↑ ${kpis.activeUsers.change}%</span>
            </div>
            <div class="kpi-footer">
              <span style="display: flex; align-items: center; gap: 6px;"><span class="live-pulse-dot"></span> Ingesting real-time</span>
              <span style="font-family: var(--font-mono);">Global CDN</span>
            </div>
          </div>

          <div class="glass-panel kpi-card hover-lift">
            <div class="kpi-card-header">
              <span class="kpi-title">Net Customer Churn</span>
              <div class="kpi-icon-wrapper emerald">📉</div>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">${kpis.churnRate.formatted}</span>
              <span class="kpi-trend positive">↓ 0.42%</span>
            </div>
            <div class="kpi-footer">
              <span>${kpis.churnRate.subtext}</span>
              <span style="font-family: var(--font-mono);">${kpis.churnRate.timeframe}</span>
            </div>
          </div>

          <div class="glass-panel kpi-card hover-lift">
            <div class="kpi-card-header">
              <span class="kpi-title">Net Promoter Score</span>
              <div class="kpi-icon-wrapper amber">⭐</div>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">${kpis.nps.formatted}</span>
              <span class="kpi-trend positive">↑ 6.0</span>
            </div>
            <div class="kpi-footer">
              <span>${kpis.nps.subtext}</span>
              <span style="font-family: var(--font-mono);">Verified</span>
            </div>
          </div>
        </div>

        <!-- Charts Layout Grid -->
        <div class="charts-grid-2col">
          <!-- Main Revenue Trend Chart Card -->
          <div class="glass-panel chart-card">
            <div class="chart-card-header">
              <div class="chart-title-group">
                <h3>Revenue Trajectory & Operating Cashflow</h3>
                <div class="chart-subtitle">12-Month trailing fiscal overview with dynamic curve regression</div>
              </div>
              <div class="chart-actions">
                <div class="chart-segmented-control">
                  <button class="segment-btn active" data-chart-type="line" data-target-canvas="revenueChart">Line</button>
                  <button class="segment-btn" data-chart-type="bar" data-target-canvas="revenueChart">Bar</button>
                </div>
                <button class="btn btn-secondary btn-sm" id="exportRevChartBtn" title="Export graph as PNG">
                  📸 Export PNG
                </button>
              </div>
            </div>
            <div class="chart-canvas-container" style="height: 320px;">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>

          <!-- Acquisition Channels Doughnut Card -->
          <div class="glass-panel chart-card">
            <div class="chart-card-header">
              <div class="chart-title-group">
                <h3>ARR by Acquisition Channel</h3>
                <div class="chart-subtitle">Direct enterprise & organic expansion</div>
              </div>
            </div>
            <div class="chart-canvas-container" style="height: 320px;">
              <canvas id="acquisitionChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Secondary Charts & Live Feed Grid -->
        <div class="charts-grid-2col" style="grid-template-columns: 1fr 1fr;">
          <!-- Department SLA Radar -->
          <div class="glass-panel chart-card">
            <div class="chart-card-header">
              <div class="chart-title-group">
                <h3>Department Performance Matrix</h3>
                <div class="chart-subtitle">Quarterly SLA targets vs actual audit efficiency</div>
              </div>
            </div>
            <div class="chart-canvas-container" style="height: 280px;">
              <canvas id="radarChart"></canvas>
            </div>
          </div>

          <!-- Live Activity Feed & Realtime Sparkline -->
          <div class="glass-panel chart-card">
            <div class="chart-card-header">
              <div class="chart-title-group">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="live-pulse-dot"></span>
                  <h3 style="margin:0;">Live Telemetry & Activity Ingestion</h3>
                </div>
                <div class="chart-subtitle">Simulated WebSocket stream with live transaction alerts</div>
              </div>
              <div style="width: 140px; height: 35px;">
                <canvas id="liveThroughputSparkline"></canvas>
              </div>
            </div>
            <div class="live-events-feed" id="liveEventsList" style="display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow-y: auto;">
              ${liveEvents.map(evt => `
                <div style="display: flex; align-items: flex-start; gap: 12px; padding: 10px; border-radius: var(--radius-md); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle);">
                  <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${evt.type === 'success' ? 'var(--color-success-bg)' : evt.type === 'warning' ? 'var(--color-warning-bg)' : 'var(--color-info-bg)'}; color: ${evt.type === 'success' ? 'var(--color-success)' : evt.type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)'}; font-size: 0.8rem; font-weight: bold;">
                    ${evt.type === 'success' ? '✓' : evt.type === 'warning' ? '!' : 'i'}
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between;">
                      <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${evt.title}</div>
                      <span style="font-size: 0.72rem; color: var(--text-muted);">${evt.time}</span>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${evt.desc}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Customer Matrix Table Section -->
        <div class="glass-panel table-card">
          <div class="table-toolbar">
            <div>
              <h3 style="font-size: 1.2rem; margin-bottom: 2px;">Enterprise Tenants & Portfolio Matrix</h3>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Multi-column sorting active (Click headers or Shift+Click for multi-column rules)</div>
            </div>
            <div class="table-filters">
              <div class="table-search-input-wrap">
                <i style="font-style: normal;">🔍</i>
                <input type="text" id="tenantSearchInput" class="table-search-input" placeholder="Search tenant, contact, region..." />
              </div>
              <select id="statusFilterSelect" class="filter-select">
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Warning">Warning</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
              <select id="regionFilterSelect" class="filter-select">
                <option value="ALL">All Regions</option>
                <option value="North America">North America</option>
                <option value="EMEA">EMEA</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="Latin America">Latin America</option>
                <option value="Australasia">Australasia</option>
              </select>
              <button class="btn btn-secondary btn-sm" id="exportCsvBtn">📥 CSV</button>
              <button class="btn btn-secondary btn-sm" id="exportJsonBtn">📦 JSON</button>
            </div>
          </div>

          <div id="dataTableRoot"></div>
        </div>
      </div>
    `;

    // Mount Charts
    this.app.chartManager.renderRevenueChart('revenueChart', 'line');
    this.app.chartManager.renderAcquisitionChart('acquisitionChart');
    this.app.chartManager.renderRadarChart('radarChart');
    this.app.chartManager.renderLiveSparkline('liveThroughputSparkline');

    // Mount DataTable
    this.app.dataTable = new (this.app.DataTableClass)('dataTableRoot', (cust) => this.app.showCustomerDossier(cust));

    // Bind UI listeners
    this.bindDashboardListeners();
  }

  // --- 2. DEEP ANALYTICS VIEW ---
  renderAnalyticsView() {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `
      <div class="view-container">
        <div style="margin-bottom: var(--space-xl); display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2>Advanced Analytics & Regional Intelligence</h2>
            <p>High-granularity multi-variable telemetry and cross-continental telemetry comparisons</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" id="refreshAnalyticsBtn">🔄 Refresh Pipelines</button>
          </div>
        </div>

        <div class="charts-grid-2col">
          <div class="glass-panel chart-card">
            <div class="chart-card-header">
              <div class="chart-title-group">
                <h3>Global Revenue by Continent</h3>
                <div class="chart-subtitle">Cross-regional market expansion and server cluster saturation</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="exportRegChartBtn">📸 Export</button>
            </div>
            <div class="chart-canvas-container" style="height: 340px;">
              <canvas id="regionalChart"></canvas>
            </div>
          </div>

          <div class="glass-panel chart-card">
            <div class="chart-card-header">
              <div class="chart-title-group">
                <h3>Traffic Acquisition Spread</h3>
                <div class="chart-subtitle">Top conversion funnels per customer acquisition cost</div>
              </div>
            </div>
            <div class="chart-canvas-container" style="height: 340px;">
              <canvas id="analyticsAcquisitionChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Radar & Simulation Matrix -->
        <div class="charts-grid-2col">
          <div class="glass-panel chart-card">
            <div class="chart-card-header">
              <div class="chart-title-group">
                <h3>Core SLA & Compliance Efficiency</h3>
                <div class="chart-subtitle">Departmental performance vs ISO/SOC2 enterprise SLAs</div>
              </div>
            </div>
            <div class="chart-canvas-container" style="height: 320px;">
              <canvas id="analyticsRadarChart"></canvas>
            </div>
          </div>

          <!-- Goal & Growth Forecast Simulator -->
          <div class="glass-panel simulator-card">
            <div style="margin-bottom: var(--space-lg);">
              <h3 style="font-size: 1.15rem; margin-bottom: 2px;">⚡ Interactive Growth & Target Simulator</h3>
              <p style="font-size: 0.78rem;">Simulate FY27 ARR goals by altering seat price, retention rate, and ad spend</p>
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span>Enterprise ACV Target Increase</span>
                <span id="sliderAcvVal" style="color: var(--primary-400); font-weight: 700;">+25%</span>
              </div>
              <input type="range" class="range-slider" id="sliderAcv" min="0" max="100" value="25" />
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span>Net Retention Rate (NRR)</span>
                <span id="sliderNrrVal" style="color: var(--color-success); font-weight: 700;">118%</span>
              </div>
              <input type="range" class="range-slider" id="sliderNrr" min="90" max="140" value="118" />
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span>Monthly Organic Expansion</span>
                <span id="sliderExpansionVal" style="color: var(--accent-cyan); font-weight: 700;">15 New Tenants/mo</span>
              </div>
              <input type="range" class="range-slider" id="sliderExpansion" min="5" max="50" value="15" />
            </div>

            <div style="background: var(--bg-surface-elevated); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--border-medium); margin-top: var(--space-lg); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">PROJECTED FY27 ARR</div>
                <div id="simulatedArrResult" style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: var(--primary-400);">$21.48M</div>
              </div>
              <button class="btn btn-primary btn-sm" id="applyForecastGoalBtn">Save Simulation Target</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.app.chartManager.renderRegionalChart('regionalChart');
    this.app.chartManager.renderAcquisitionChart('analyticsAcquisitionChart');
    this.app.chartManager.renderRadarChart('analyticsRadarChart');

    this.bindAnalyticsListeners();
  }

  // --- 3. FINANCIAL VIEW ---
  renderFinanceView() {
    const container = document.getElementById('viewContainer');
    const ts = MockData.revenueTimeSeries;

    container.innerHTML = `
      <div class="view-container">
        <div style="margin-bottom: var(--space-xl); display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2>Financial Operations & Treasury Hub</h2>
            <p>ARR velocity, operating expenses breakdown, EBITDA margins, and cash reserves</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.print()">🖨️ Print Financial Statement</button>
        </div>

        <div class="kpi-grid">
          <div class="glass-panel kpi-card">
            <span class="kpi-title">Gross Profit Margin</span>
            <div class="kpi-value-row">
              <span class="kpi-value" style="color: var(--color-success);">82.4%</span>
              <span class="kpi-trend positive">↑ 3.2%</span>
            </div>
            <div class="kpi-footer"><span>COGS $2.4M</span></div>
          </div>
          <div class="glass-panel kpi-card">
            <span class="kpi-title">EBITDA Runrate</span>
            <div class="kpi-value-row">
              <span class="kpi-value">$6.24M</span>
              <span class="kpi-trend positive">↑ 22%</span>
            </div>
            <div class="kpi-footer"><span>Adjusted EBITDA</span></div>
          </div>
          <div class="glass-panel kpi-card">
            <span class="kpi-title">Cash Runway</span>
            <div class="kpi-value-row">
              <span class="kpi-value">38.4 Mo</span>
              <span class="kpi-trend positive">Strong</span>
            </div>
            <div class="kpi-footer"><span>$28.5M Treasury Reserves</span></div>
          </div>
          <div class="glass-panel kpi-card">
            <span class="kpi-title">Magic Number (Sales)</span>
            <div class="kpi-value-row">
              <span class="kpi-value">1.42</span>
              <span class="kpi-trend positive">Top Decile</span>
            </div>
            <div class="kpi-footer"><span>Efficiency > 1.0</span></div>
          </div>
        </div>

        <div class="glass-panel chart-card" style="margin-bottom: var(--space-xl);">
          <div class="chart-card-header">
            <div class="chart-title-group">
              <h3>Monthly Financial Ledger Breakdown</h3>
              <div class="chart-subtitle">Gross revenue vs net expenditures vs operational profit margins</div>
            </div>
          </div>
          <div class="chart-canvas-container" style="height: 350px;">
            <canvas id="financeOverviewChart"></canvas>
          </div>
        </div>
      </div>
    `;

    this.app.chartManager.renderRevenueChart('financeOverviewChart', 'bar');
  }

  // --- 4. CUSTOMERS VIEW ---
  renderCustomersView() {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `
      <div class="view-container">
        <div style="margin-bottom: var(--space-xl); display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h2>Enterprise Tenant Directory & CRM Matrix</h2>
            <p>Inspect subscriptions, health scores, ARR allocation, and customer contacts</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary btn-sm" id="addNewTenantBtn">+ Add Enterprise Tenant</button>
          </div>
        </div>

        <div class="glass-panel table-card">
          <div class="table-toolbar">
            <div class="table-filters">
              <div class="table-search-input-wrap">
                <i style="font-style: normal;">🔍</i>
                <input type="text" id="tenantSearchInput" class="table-search-input" placeholder="Search accounts..." />
              </div>
              <select id="statusFilterSelect" class="filter-select">
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Warning">Warning</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
              <select id="regionFilterSelect" class="filter-select">
                <option value="ALL">All Regions</option>
                <option value="North America">North America</option>
                <option value="EMEA">EMEA</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="Latin America">Latin America</option>
                <option value="Australasia">Australasia</option>
              </select>
              <button class="btn btn-secondary btn-sm" id="exportCsvBtn">📥 CSV</button>
              <button class="btn btn-secondary btn-sm" id="exportJsonBtn">📦 JSON</button>
            </div>
          </div>

          <div id="dataTableRoot"></div>
        </div>
      </div>
    `;

    this.app.dataTable = new (this.app.DataTableClass)('dataTableRoot', (cust) => this.app.showCustomerDossier(cust));
    this.bindDashboardListeners();
  }

  // --- 5. INFRASTRUCTURE & INVENTORY VIEW ---
  renderInfrastructureView() {
    const container = document.getElementById('viewContainer');
    const infra = MockData.infraMetrics;

    container.innerHTML = `
      <div class="view-container">
        <div style="margin-bottom: var(--space-xl);">
          <h2>Cluster Infrastructure & Microservices Health</h2>
          <p>Global cloud topology, Edge CDN latency, vector database workloads, and Kafka queues</p>
        </div>

        <div class="glass-panel table-card" style="margin-bottom: var(--space-xl);">
          <div class="table-responsive">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th>Microservice Cluster</th>
                  <th>Status</th>
                  <th>Edge Latency</th>
                  <th>SLA Uptime (30D)</th>
                  <th>Current CPU/Memory Load</th>
                  <th style="text-align: right;">Telemetry Action</th>
                </tr>
              </thead>
              <tbody>
                ${infra.map(s => `
                  <tr>
                    <td style="font-weight: 700; color: var(--text-primary);">${s.service}</td>
                    <td><span class="badge badge-success">● ${s.status}</span></td>
                    <td><span style="font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 600;">${s.latency}</span></td>
                    <td><span style="font-weight: 600; color: var(--color-success);">${s.uptime}</span></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; height: 6px; background: var(--bg-input); border-radius: 99px; overflow: hidden; min-width: 60px;">
                          <div style="width: ${s.load}; height: 100%; background: var(--primary-500); border-radius: 99px;"></div>
                        </div>
                        <span style="font-size: 0.8rem; font-weight: 600;">${s.load}</span>
                      </div>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" onclick="alert('Running health probe diagnostics for: ${s.service}')">Ping Probe</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // --- 6. REPORTS & EXPORTS VIEW ---
  renderReportsView() {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `
      <div class="view-container">
        <div style="margin-bottom: var(--space-xl);">
          <h2>Compliance & Executive Audit Reports</h2>
          <p>Generate certified audit dossiers, tax filings, SOC2 compliance logs, and investor presentations</p>
        </div>

        <div class="charts-grid-3col">
          <div class="glass-panel" style="padding: var(--space-lg); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 1.8rem; margin-bottom: var(--space-xs);">📊</div>
              <h3 style="font-size: 1.1rem;">Q3 2026 Board Executive Deck</h3>
              <p style="font-size: 0.8rem; margin-top: 4px;">Comprehensive multi-cohort retention, gross margin analysis, and sales efficiency.</p>
            </div>
            <div style="margin-top: var(--space-lg); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">PDF • 4.2 MB</span>
              <button class="btn btn-primary btn-sm" onclick="window.print()">Download Report</button>
            </div>
          </div>

          <div class="glass-panel" style="padding: var(--space-lg); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 1.8rem; margin-bottom: var(--space-xs);">🛡️</div>
              <h3 style="font-size: 1.1rem;">SOC2 Type II Audit Artifacts</h3>
              <p style="font-size: 0.8rem; margin-top: 4px;">Cryptographic zero-trust verification logs, penetration test certifications, and encryption audit.</p>
            </div>
            <div style="margin-top: var(--space-lg); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">ZIP Archive • 18 MB</span>
              <button class="btn btn-secondary btn-sm" onclick="alert('Downloading signed cryptographic certificate bundle.')">Download Signed Bundle</button>
            </div>
          </div>

          <div class="glass-panel" style="padding: var(--space-lg); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 1.8rem; margin-bottom: var(--space-xs);">💾</div>
              <h3 style="font-size: 1.1rem;">Full Raw Data Snapshot</h3>
              <p style="font-size: 0.8rem; margin-top: 4px;">Complete dump of all tenant profiles, telemetry tables, and transaction logs in JSON format.</p>
            </div>
            <div style="margin-top: var(--space-lg); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">JSON • 2.1 MB</span>
              <button class="btn btn-secondary btn-sm" id="rawExportBtn">Export JSON Dump</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('rawExportBtn')?.addEventListener('click', () => {
      if (this.app.dataTable) {
        this.app.dataTable.exportJSON();
      }
    });
  }

  // --- 7. SETTINGS VIEW ---
  renderSettingsView() {
    const container = document.getElementById('viewContainer');
    const tm = this.app.themeManager;

    container.innerHTML = `
      <div class="view-container">
        <div style="margin-bottom: var(--space-xl);">
          <h2>Portal Configuration & State Engine</h2>
          <p>Personalize display preferences, audio telemetry cues, and data streaming parameters</p>
        </div>

        <div style="max-width: 780px; display: flex; flex-direction: column; gap: var(--space-lg);">
          <!-- Theme Preference Card -->
          <div class="glass-panel" style="padding: var(--space-lg);">
            <h3 style="font-size: 1.1rem; margin-bottom: 6px;">Visual Theme Engine</h3>
            <p style="font-size: 0.8rem; margin-bottom: var(--space-lg);">Choose your preferred color palette tailored for high-contrast enterprise analytical workflows.</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--space-md);">
              <button class="theme-card-picker ${tm.currentTheme === 'dark' ? 'active' : ''}" data-pick-theme="dark" style="padding: 14px; border-radius: var(--radius-md); background: #090d16; border: 2px solid ${tm.currentTheme === 'dark' ? 'var(--primary-500)' : 'var(--border-medium)'}; text-align: center; cursor: pointer; color: #fff;">
                <div style="font-weight: 700;">Midnight OLED</div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">Deep Indigo / Violet</div>
              </button>
              <button class="theme-card-picker ${tm.currentTheme === 'light' ? 'active' : ''}" data-pick-theme="light" style="padding: 14px; border-radius: var(--radius-md); background: #f8fafc; border: 2px solid ${tm.currentTheme === 'light' ? 'var(--primary-500)' : 'var(--border-medium)'}; text-align: center; cursor: pointer; color: #0f172a;">
                <div style="font-weight: 700;">Clean Light</div>
                <div style="font-size: 0.75rem; color: #475569; margin-top: 4px;">Crisp Slate / Cobalt</div>
              </button>
              <button class="theme-card-picker ${tm.currentTheme === 'cyber' ? 'active' : ''}" data-pick-theme="cyber" style="padding: 14px; border-radius: var(--radius-md); background: #050508; border: 2px solid ${tm.currentTheme === 'cyber' ? 'var(--primary-500)' : 'var(--border-medium)'}; text-align: center; cursor: pointer; color: #00f0ff;">
                <div style="font-weight: 700;">Cyber Matrix</div>
                <div style="font-size: 0.75rem; color: #ff007f; margin-top: 4px;">Neon Cyan & Synthwave</div>
              </button>
              <button class="theme-card-picker ${tm.currentTheme === 'slate' ? 'active' : ''}" data-pick-theme="slate" style="padding: 14px; border-radius: var(--radius-md); background: #0b132b; border: 2px solid ${tm.currentTheme === 'slate' ? 'var(--primary-500)' : 'var(--border-medium)'}; text-align: center; cursor: pointer; color: #f0f9ff;">
                <div style="font-weight: 700;">Royal Slate</div>
                <div style="font-size: 0.75rem; color: #38bdf8; margin-top: 4px;">Sapphire Enterprise</div>
              </button>
            </div>
          </div>

          <!-- Sound & Telemetry Preferences -->
          <div class="glass-panel" style="padding: var(--space-lg); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 1.05rem;">Synthesized Audio Chimes</h3>
              <p style="font-size: 0.78rem;">Play pleasant micro-tones when incoming telemetry events and transactions occur.</p>
            </div>
            <input type="checkbox" id="settingsSoundToggle" ${tm.isSoundEnabled ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" />
          </div>

          <!-- Reset Portal Data -->
          <div class="glass-panel" style="padding: var(--space-lg); display: flex; justify-content: space-between; align-items: center; border-color: rgba(239, 68, 68, 0.3);">
            <div>
              <h3 style="font-size: 1.05rem; color: var(--color-danger);">Reset Application Cache</h3>
              <p style="font-size: 0.78rem;">Clear cached dashboard configurations and return to default factory parameters.</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="resetCacheBtn" style="color: var(--color-danger); border-color: var(--color-danger);">Clear Cache</button>
          </div>
        </div>
      </div>
    `;

    // Bind settings buttons
    document.querySelectorAll('.theme-card-picker[data-pick-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-pick-theme');
        tm.applyTheme(theme);
        this.renderSettingsView();
      });
    });

    document.getElementById('settingsSoundToggle')?.addEventListener('change', (e) => {
      tm.isSoundEnabled = e.target.checked;
      localStorage.setItem(tm.soundKey, tm.isSoundEnabled);
      this.app.showToast('Audio Settings Updated', tm.isSoundEnabled ? 'Audio cues enabled' : 'Audio cues disabled', 'info');
    });

    document.getElementById('resetCacheBtn')?.addEventListener('click', () => {
      localStorage.clear();
      location.reload();
    });
  }

  bindDashboardListeners() {
    // Search input
    const searchInput = document.getElementById('tenantSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (this.app.dataTable) this.app.dataTable.setSearch(e.target.value);
      });
    }

    // Status filter
    const statusSelect = document.getElementById('statusFilterSelect');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        if (this.app.dataTable) this.app.dataTable.setFilter('status', e.target.value);
      });
    }

    // Region filter
    const regionSelect = document.getElementById('regionFilterSelect');
    if (regionSelect) {
      regionSelect.addEventListener('change', (e) => {
        if (this.app.dataTable) this.app.dataTable.setFilter('region', e.target.value);
      });
    }

    // CSV & JSON Exports
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
      if (this.app.dataTable) this.app.dataTable.exportCSV();
      this.app.showToast('Export Successful', 'Customer matrix exported to CSV', 'success');
    });

    document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
      if (this.app.dataTable) this.app.dataTable.exportJSON();
      this.app.showToast('Export Successful', 'Customer matrix exported to JSON', 'success');
    });

    // Chart segment switchers (Line vs Bar)
    document.querySelectorAll('.segment-btn[data-target-canvas]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetCanvas = btn.getAttribute('data-target-canvas');
        const type = btn.getAttribute('data-chart-type');
        btn.parentElement.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.app.chartManager.switchType(targetCanvas, type);
      });
    });

    // Revenue Chart PNG Export
    document.getElementById('exportRevChartBtn')?.addEventListener('click', () => {
      this.app.chartManager.exportPNG('revenueChart', 'revenue_trajectory.png');
      this.app.showToast('Chart Exported', 'Revenue chart downloaded as PNG', 'info');
    });
  }

  bindAnalyticsListeners() {
    document.getElementById('exportRegChartBtn')?.addEventListener('click', () => {
      this.app.chartManager.exportPNG('regionalChart', 'regional_revenue.png');
    });

    // Simulator Sliders
    const acvSlider = document.getElementById('sliderAcv');
    const nrrSlider = document.getElementById('sliderNrr');
    const expSlider = document.getElementById('sliderExpansion');
    const resEl = document.getElementById('simulatedArrResult');

    const updateForecast = () => {
      if (!acvSlider || !nrrSlider || !expSlider || !resEl) return;
      const acv = parseInt(acvSlider.value, 10);
      const nrr = parseInt(nrrSlider.value, 10);
      const exp = parseInt(expSlider.value, 10);

      document.getElementById('sliderAcvVal').textContent = `+${acv}%`;
      document.getElementById('sliderNrrVal').textContent = `${nrr}%`;
      document.getElementById('sliderExpansionVal').textContent = `${exp} New Tenants/mo`;

      const baseArr = 14.82;
      const calculated = baseArr * (1 + acv / 100) * (nrr / 100) + (exp * 0.15);
      resEl.textContent = '$' + calculated.toFixed(2) + 'M';
    };

    acvSlider?.addEventListener('input', updateForecast);
    nrrSlider?.addEventListener('input', updateForecast);
    expSlider?.addEventListener('input', updateForecast);

    document.getElementById('applyForecastGoalBtn')?.addEventListener('click', () => {
      this.app.showToast('Simulation Saved', `Target forecast calibrated at ${resEl.textContent}`, 'success');
      if (window.confetti) {
        window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      }
    });

    document.getElementById('refreshAnalyticsBtn')?.addEventListener('click', () => {
      this.app.showToast('Pipelines Refreshed', 'Telemetry nodes synchronized', 'info');
    });
  }
}
