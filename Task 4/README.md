# APEXMETRICS ENTERPRISE // Reactive Business Intelligence & Analytical Administration Portal

> **Task 4 (Mini Project):** Enterprise Analytical Administration Portal with Reactive Chart Objects  
> Built with Vanilla JavaScript (ES6+ Modules), Chart.js, Semantic HTML5, and Pure CSS3 Design System.

---

## 🌟 Overview & Key Features

**ApexMetrics Enterprise** is an analytics administration dashboard tailored for executive leadership, telemetry observability, tenant management, and financial treasury analytics.

### ✨ Key Features & Architectural Highlights

1. **Client-Side SPA Hash Router**:
   - Zero-dependency custom hash router (`router.js`) managing 7 enterprise views seamlessly without full-page reloads.
   - Dynamic view lifecycle management: mounts charts, binds dynamic filtering events, and synchronizes active sidebar states & breadcrumbs.

2. **7 Comprehensive Portal Views**:
   - **Executive Dashboard**: Real-time ARR, live active users, net churn, NPS score, dynamic revenue trajectory chart (Line/Bar switcher & PNG export), acquisition doughnut chart, department SLA radar chart, live activity event stream, and customer matrix table.
   - **Deep Analytics**: Multi-variable regional performance breakdown by continent, traffic acquisition funnels, and an interactive **FY27 ARR Goal & Growth Forecast Simulator** with live slider computations and celebration animations.
   - **Treasury & Finance Hub**: Gross profit margins, EBITDA runrate, cash runway, sales magic number, and monthly fiscal breakdown ledger.
   - **Enterprise Tenants (CRM Matrix)**: Interactive searchable tenant directory with multi-column sorting, status filters, region filters, and CSV/JSON export engines.
   - **Infrastructure & Cluster Health**: Global microservice health table, Edge CDN latencies, 30-day uptime SLA, and real-time CPU/Memory load progress bars.
   - **Compliance & Audit Reports**: Executive board decks, SOC2 Type II cryptographic artifact download simulations, and raw JSON database snapshot exports.
   - **Portal Settings**: Dynamic visual theme picker, audio telemetry tone toggles, and application cache reset engine.

3. **Reactive Multi-Theme Engine**:
   - 4 hand-crafted enterprise themes:
     - 🌙 **Midnight OLED** (Default deep indigo / violet dark theme)
     - ☀️ **Clean Light** (Crisp slate / cobalt light theme)
     - ⚡ **Cyber Neon** (High-contrast cyan & synthwave matrix)
     - 💎 **Royal Slate** (Sapphire enterprise aesthetic)
   - Dynamic Chart.js color palette synchronization on theme switch.

4. **Multi-Column Matrix Data Table Engine**:
   - Client-side real-time fuzzy search across tenant names, contacts, emails, and regions.
   - Multi-column sorting matrices (click headers or Shift+Click for multi-rule sorting).
   - Pagination with configurable rows-per-page (5, 10, 25, 50).
   - Interactive drilldown modal inspecting tenant dossiers and raw JSON telemetry schemas.
   - 1-click CSV & JSON dataset export.

5. **Live Telemetry Stream Simulator**:
   - Background ticker simulating real-time WebSocket events (ARR increments, user signups, cluster events).
   - Interactive pause/play control in the header with animated pulsing telemetry indicators and synthesized Web Audio API chimes.

6. **Command Palette (`Ctrl+K` / `Cmd+K`)**:
   - Keyboard-driven spotlight search for instant navigation across all views, theme switching, and quick actions.

---

## 🛠️ Technology Stack

- **Structure**: Semantic HTML5 with ARIA accessibility roles
- **Styling**: Pure CSS3 (`main.css`, `components.css`, `themes.css`) utilizing CSS custom properties (variables), Glassmorphism backdrop-filters, CSS Grid & Flexbox
- **Logic**: Modular Vanilla JavaScript (ES6 Modules, Classes, Event Emitters)
- **Data Visualization**: Chart.js v4.4 (Line, Bar, Doughnut, Radar, Sparklines) + Canvas Confetti
- **Audio Synthesis**: Native Web Audio API for telemetry feedback

---

## 🚀 How to Run Locally

Open [`index.html`](file:///d:/AMINE2/COURS%20FAC/travaux/PROGREE_INTERNSHIP/Frontend/Task%204/index.html) with any local HTTP server (required for ES6 Modules):

```bash
# Using Python
python -m http.server 8080

# Or using Node.js npx serve
npx serve .
```

Then navigate to `http://localhost:8080` in your web browser.
