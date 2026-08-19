# AETHERIA LIVE // Worldwide Asynchronous REST Weather Portal Application

> **Task 3:** Asynchronous REST API Weather Portal Application  
> Built with Semantic HTML5, Glassmorphism CSS3, and Vanilla JavaScript (ES6+).

---

## 🌟 Overview & Key Features

**AETHERIA** is a meteorological web portal delivering real-time worldwide weather insights, atmospheric telemetry, synoptic maps, and lifestyle intelligence.

### ✨ Visual & UX Highlights
- **Deep Glassmorphism Design System**: Dynamic backdrop blur (`backdrop-filter: blur(20px)`), glowing borders, neon accents, and refined typography (*Plus Jakarta Sans*, *Outfit*, and *JetBrains Mono*).
- **Dynamic Particle Atmosphere Engine**: Real-time atmospheric canvas reacting to live meteorological conditions (Falling Rain droplets with splash trajectories, Drifting Snowflakes, Warm Sun Lens Flare rays, Twinkling Starry Night skies, Fog, and Thunderstorm lightning flashes).
- **Predefined Worldwide Cities Strip**: Quick 1-click access to top global hubs (Tokyo, New York, London, Paris, Dubai, Sydney, Cairo, Rio de Janeiro, Singapore, Reykjavik, Rome, Casablanca, Toronto, Berlin) with live mini preview cards.
- **Global Search with Autocomplete**: Real-time debounced geocoding search querying worldwide cities with country pills and coordinate resolution.
- **HTML5 GPS Geolocation**: One-click "My Location" reverse-geocoding.
- **Interactive Synoptic Map**: Embedded Leaflet map dynamically centered on selected locations with custom pulsing markers and multiple tile layers (Standard, Satellite, Night Dark).
- **24-Hour Forecast & Bezier Curve Chart**: Interactive canvas curve visualizer with tabs for Temperature (°C/°F), Precipitation probability (%), and Wind Speed trajectories.
- **7-Day Synoptic Outlook**: Daily forecast cards with precipitation probability bars and dynamic min/max temperature gradient range sliders.
- **10+ Deep Telemetry Metric Widgets**:
  1. **Wind Dynamics & Compass**: Live rotating needle, cardinal direction, speed, and gusts.
  2. **UV Radiation Index**: Color-coded danger gauge with sun protection advice.
  3. **Air Quality Index (AQI)**: PM2.5, PM10, Ozone (O₃), NO₂ with health rating.
  4. **Humidity & Dew Point**: Barometric moisture percentage and human comfort rating.
  5. **Solar Day Cycle Arc**: Dynamic sun position dot computed from actual solar sunrise/sunset times.
  6. **Lunar Phase & Illumination**: Phase name, illumination percentage, and days until next Full Moon.
  7. **Barometer**: Atmospheric pressure with sea level comparison and trend indicator.
  8. **Visibility & Cloud Cover**: Real-time distance rating and cloudiness meter.
- **Smart Lifestyle & Activity Intelligence**:
  - Clothing Advisory (*Heavy winter coat*, *Light jacket*, *Breathable summer wear*)
  - Umbrella Necessity Alert
  - Outdoor Running & Cycling score
  - Driving road visibility assessment

---

## ⚡ Asynchronous Architecture

- Built using modern `fetch()` with `async/await` handlers.
- **Dual REST Provider Architecture**:
  - **Open-Meteo REST API (Default)**: Zero configuration, no API key required, 100% reliable global weather, air quality, and geocoding.
  - **OpenWeatherMap Integration**: Settings modal allows custom OWM API key injection for direct evaluation against OpenWeatherMap endpoints.
- **Graceful Error States & Retry**: Dedicated error boundary banner with one-click async retry.
- **Memory & LocalStorage Cache**: 5-minute cache prevents redundant queries, plus persistent temperature unit (°C / °F) and favorites storage.

---

## 🚀 How to Run Locally

Open `index.html` directly in any modern browser, or run a local HTTP server:

```bash
# Using Python:
python -m http.server 8080

# Or using Node:
npx serve .
```

Then visit: [http://localhost:8080](http://localhost:8080)
