/**
 * AETHERIA - Master Application Controller
 * High-performance, reactive weather portal orchestrator.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    unit: localStorage.getItem('aetheria_unit') || 'celsius',
    currentLocation: {
      name: 'Tokyo',
      countryCode: 'JP',
      lat: 35.6762,
      lon: 139.6503
    },
    weatherData: null,
    favorites: JSON.parse(localStorage.getItem('aetheria_favs') || '[]'),
    activeChartTab: 'temp',
    mapInstance: null,
    mapMarker: null,
    mapTileLayer: null,
    currentMapTheme: 'standard',
    searchDebounceTimer: null
  };

  // Predefined Worldwide Hubs
  const PREDEFINED_LOCATIONS = [
    { name: 'Tokyo', countryCode: 'JP', lat: 35.6762, lon: 139.6503 },
    { name: 'New York', countryCode: 'US', lat: 40.7128, lon: -74.0060 },
    { name: 'London', countryCode: 'GB', lat: 51.5074, lon: -0.1278 },
    { name: 'Paris', countryCode: 'FR', lat: 48.8566, lon: 2.3522 },
    { name: 'Dubai', countryCode: 'AE', lat: 25.2048, lon: 55.2708 },
    { name: 'Sydney', countryCode: 'AU', lat: -33.8688, lon: 151.2093 },
    { name: 'Cairo', countryCode: 'EG', lat: 30.0444, lon: 31.2357 },
    { name: 'Rio de Janeiro', countryCode: 'BR', lat: -22.9068, lon: -43.1729 },
    { name: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198 },
    { name: 'Reykjavik', countryCode: 'IS', lat: 64.1466, lon: -21.9426 },
    { name: 'Rome', countryCode: 'IT', lat: 41.9028, lon: 12.4964 },
    { name: 'Casablanca', countryCode: 'MA', lat: 33.5731, lon: -7.5898 },
    { name: 'Toronto', countryCode: 'CA', lat: 43.6532, lon: -79.3832 },
    { name: 'Berlin', countryCode: 'DE', lat: 52.5200, lon: 13.4050 }
  ];

  // Service Instances
  const apiService = new window.WeatherApiService();
  const atmosphereEngine = new window.WeatherAtmosphereEngine('weather-canvas');
  const chartEngine = new window.WeatherChartEngine('hourly-chart');

  // DOM Selectors
  const dom = {
    // Search
    searchInput: document.getElementById('city-search-input'),
    searchClearBtn: document.getElementById('clear-search-btn'),
    searchSpinner: document.getElementById('search-spinner'),
    searchDropdown: document.getElementById('search-dropdown'),
    geoBtn: document.getElementById('geo-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    refreshIcon: document.getElementById('refresh-icon'),
    unitBtns: document.querySelectorAll('.unit-btn'),
    
    // Predefined strip
    predefinedContainer: document.getElementById('predefined-cities-container'),
    citiesPrevBtn: document.getElementById('cities-prev'),
    citiesNextBtn: document.getElementById('cities-next'),

    // Hero Widget
    locationName: document.getElementById('location-name'),
    countryCode: document.getElementById('country-code'),
    localTime: document.getElementById('local-time'),
    geoCoords: document.getElementById('geo-coords'),
    elevationStat: document.getElementById('elevation-stat'),
    lastUpdatedText: document.getElementById('last-updated-text'),
    currentTemp: document.getElementById('current-temp'),
    heroUnitSymbol: document.getElementById('hero-unit-symbol'),
    weatherIcon3d: document.getElementById('weather-icon-3d'),
    weatherDesc: document.getElementById('weather-description'),
    feelsLikeTemp: document.getElementById('feels-like-temp'),
    highTemp: document.getElementById('high-temp'),
    lowTemp: document.getElementById('low-temp'),
    heroPrecipChance: document.getElementById('hero-precip-chance'),
    favoriteBtn: document.getElementById('favorite-btn'),

    // Hourly & 7-Day
    hourlyTimelineContainer: document.getElementById('hourly-timeline-container'),
    chartTabBtns: document.querySelectorAll('.chart-tab-btn'),
    dailyForecastList: document.getElementById('daily-forecast-list'),

    // Lifestyle Recommendations
    advClothing: document.getElementById('adv-clothing'),
    advUmbrella: document.getElementById('adv-umbrella'),
    advRunning: document.getElementById('adv-running'),
    advDriving: document.getElementById('adv-driving'),

    // Telemetry Widgets
    compassDial: document.getElementById('compass-dial'),
    windSpeed: document.getElementById('wind-speed'),
    windUnitLabel: document.getElementById('wind-unit-label'),
    windDirText: document.getElementById('wind-direction-text'),
    windGusts: document.getElementById('wind-gusts'),
    
    uvIndexVal: document.getElementById('uv-index-val'),
    uvStatusBadge: document.getElementById('uv-status-badge'),
    uvBarFill: document.getElementById('uv-bar-fill'),
    uvAdviceText: document.getElementById('uv-advice-text'),

    aqiScore: document.getElementById('aqi-score'),
    aqiStatusBadge: document.getElementById('aqi-status-badge'),
    aqiPm25: document.getElementById('aqi-pm25'),
    aqiPm10: document.getElementById('aqi-pm10'),
    aqiO3: document.getElementById('aqi-o3'),

    humidityVal: document.getElementById('humidity-val'),
    humidityBarFill: document.getElementById('humidity-bar-fill'),
    dewPointVal: document.getElementById('dew-point-val'),
    humidityComfort: document.getElementById('humidity-comfort'),

    sunriseTime: document.getElementById('sunrise-time'),
    sunsetTime: document.getElementById('sunset-time'),
    sunPositionDot: document.getElementById('sun-position-dot'),

    moonPhaseName: document.getElementById('moon-phase-name'),
    moonIllumPct: document.getElementById('moon-illum-pct'),
    nextFullMoon: document.getElementById('next-full-moon'),
    moonShadowMask: document.getElementById('moon-shadow-mask'),

    pressureVal: document.getElementById('pressure-val'),
    pressureSeaLevel: document.getElementById('pressure-sea-level'),
    pressureTrendBadge: document.getElementById('pressure-trend-badge'),

    visibilityVal: document.getElementById('visibility-val'),
    cloudCoverVal: document.getElementById('cloud-cover-val'),
    visibilityDesc: document.getElementById('visibility-desc'),

    // Map Layers
    mapLayerSelector: document.getElementById('map-layer-selector'),
    mapCoordsText: document.getElementById('map-coords-text'),

    // Error & Loading States
    errorBanner: document.getElementById('error-banner'),
    errorMessage: document.getElementById('error-message'),
    errorRetryBtn: document.getElementById('error-retry-btn'),
    loadingScreen: document.getElementById('app-loading-screen'),

    // Settings Modal
    apiModalBtn: document.getElementById('api-modal-btn'),
    apiModal: document.getElementById('api-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    providerSelect: document.getElementById('provider-select'),
    owmKeyGroup: document.getElementById('owm-key-group'),
    owmApiKeyInput: document.getElementById('owm-api-key'),
    particleToggle: document.getElementById('particle-toggle'),
    modalSaveBtn: document.getElementById('modal-save-btn')
  };

  /**
   * Application Initialization
   */
  async function initApp() {
    initLucideIcons();
    initUnitButtons();
    initPredefinedCities();
    initMap();
    setupEventListeners();
    applySavedSettings();

    // Initial weather load
    await loadWeather(state.currentLocation);
  }

  function initLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Apply Stored Settings to Controls
   */
  function applySavedSettings() {
    if (dom.providerSelect) {
      dom.providerSelect.value = apiService.provider;
      if (dom.owmKeyGroup) {
        dom.owmKeyGroup.style.display = apiService.provider === 'openweathermap' ? 'flex' : 'none';
      }
    }
    if (dom.owmApiKeyInput) {
      dom.owmApiKeyInput.value = apiService.owmApiKey;
    }
  }

  /**
   * Initialize Leaflet Interactive Synoptic Map
   */
  function initMap() {
    if (!window.L) return;

    try {
      state.mapInstance = L.map('weather-map', {
        center: [state.currentLocation.lat, state.currentLocation.lon],
        zoom: 9,
        zoomControl: false,
        attributionControl: false
      });

      // Custom Zoom Control top-right
      L.control.zoom({ position: 'topright' }).addTo(state.mapInstance);

      setMapLayer('standard');

      // Custom Pulsing Map Marker
      const customIcon = L.divIcon({
        className: 'pulse-map-marker',
        html: '<div class="marker-ring"></div><div class="marker-core"></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      state.mapMarker = L.marker([state.currentLocation.lat, state.currentLocation.lon], {
        icon: customIcon
      }).addTo(state.mapInstance);
    } catch (e) {
      console.error('Leaflet map initialization warning:', e);
    }
  }

  function setMapLayer(theme) {
    if (!state.mapInstance) return;
    if (state.mapTileLayer) {
      state.mapInstance.removeLayer(state.mapTileLayer);
    }

    state.currentMapTheme = theme;
    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    if (theme === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (theme === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    state.mapTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(state.mapInstance);
  }

  /**
   * Render Predefined Global Locations Strip
   */
  function initPredefinedCities() {
    dom.predefinedContainer.innerHTML = '';

    PREDEFINED_LOCATIONS.forEach(city => {
      const card = document.createElement('div');
      card.className = `city-pill-card ${city.name === state.currentLocation.name ? 'active' : ''}`;
      card.dataset.name = city.name;
      card.dataset.lat = city.lat;
      card.dataset.lon = city.lon;
      card.dataset.country = city.countryCode;

      card.innerHTML = `
        <div class="city-card-header">
          <span class="city-card-name">${city.name}</span>
          <span class="city-card-country">${city.countryCode}</span>
        </div>
        <div class="city-card-content">
          <span class="city-card-temp" id="pill-temp-${city.name.replace(/\s+/g, '')}">--°</span>
          <div class="city-card-icon" id="pill-icon-${city.name.replace(/\s+/g, '')}">
            <i data-lucide="cloud-sun"></i>
          </div>
        </div>
        <span class="city-card-condition" id="pill-cond-${city.name.replace(/\s+/g, '')}">Loading...</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.city-pill-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        loadWeather({
          name: city.name,
          countryCode: city.countryCode,
          lat: city.lat,
          lon: city.lon
        });
      });

      dom.predefinedContainer.appendChild(card);
    });

    initLucideIcons();

    // Async fetch lightweight previews for all predefined hubs in the background
    loadPredefinedPreviews();
  }

  async function loadPredefinedPreviews() {
    for (const city of PREDEFINED_LOCATIONS) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,is_day`;
        fetch(url)
          .then(res => res.json())
          .then(data => {
            if (data && data.current) {
              const tempC = Math.round(data.current.temperature_2m);
              const tempVal = state.unit === 'celsius' ? `${tempC}°C` : `${Math.round((tempC * 9/5) + 32)}°F`;
              const safeName = city.name.replace(/\s+/g, '');
              
              const tempEl = document.getElementById(`pill-temp-${safeName}`);
              const condEl = document.getElementById(`pill-cond-${safeName}`);
              const meta = apiService._getWmoConditionMeta(data.current.weather_code || 0, data.current.is_day === 1);

              if (tempEl) tempEl.textContent = tempVal;
              if (condEl) condEl.textContent = meta.label;
            }
          })
          .catch(() => {});
      } catch (e) {}
    }
  }

  /**
   * Master Asynchronous Weather Loader
   */
  async function loadWeather(loc) {
    state.currentLocation = loc;
    showLoading(true);
    hideError();

    // Add rotating animation to refresh button
    if (dom.refreshIcon) dom.refreshIcon.classList.add('anim-sun-spin');

    try {
      const data = await apiService.fetchWeatherData(loc.lat, loc.lon, loc.name, loc.countryCode);
      state.weatherData = data;

      // Update UI Views
      renderDashboard(data);
      updateMapPosition(loc.lat, loc.lon);
      atmosphereEngine.setWeather(data.current.group);
      chartEngine.render(data, state.activeChartTab, state.unit);

      // Check favorite button state
      updateFavoriteButtonState();
    } catch (err) {
      console.error('Async weather load error:', err);
      showError(err.message || 'Failed to retrieve real-time weather information.');
    } finally {
      showLoading(false);
      if (dom.refreshIcon) dom.refreshIcon.classList.remove('anim-sun-spin');
    }
  }

  /**
   * Render Dashboard Telemetry & UI Cards
   */
  function renderDashboard(data) {
    const curr = data.current;
    const loc = data.location;
    const isC = state.unit === 'celsius';

    // Hero Location & Meta
    dom.locationName.textContent = loc.name;
    dom.countryCode.textContent = loc.countryCode || 'WORLD';
    dom.geoCoords.textContent = `${Math.abs(loc.lat).toFixed(2)}°${loc.lat >= 0 ? 'N' : 'S'}, ${Math.abs(loc.lon).toFixed(2)}°${loc.lon >= 0 ? 'E' : 'W'}`;
    dom.elevationStat.textContent = `${loc.elevation}m Elev`;
    dom.lastUpdatedText.textContent = `Updated at ${curr.updatedAt}`;

    // Compute Local Time from Timezone
    try {
      const localTimeObj = new Date();
      dom.localTime.textContent = localTimeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      dom.localTime.textContent = '--:--';
    }

    // Hero Temperature
    dom.currentTemp.textContent = isC ? curr.tempC : curr.tempF;
    dom.heroUnitSymbol.textContent = isC ? '°C' : '°F';
    dom.feelsLikeTemp.textContent = isC ? `${curr.feelsLikeC}°C` : `${curr.feelsLikeF}°F`;
    dom.highTemp.textContent = isC ? `${curr.highC}°C` : `${curr.highF}°F`;
    dom.lowTemp.textContent = isC ? `${curr.lowC}°C` : `${curr.lowF}°F`;
    dom.heroPrecipChance.textContent = `${curr.precipChance}%`;
    dom.weatherDesc.textContent = curr.condition;
    dom.weatherIcon3d.innerHTML = curr.iconSvg;

    // Wind Widget
    dom.windSpeed.textContent = curr.windSpeedKm;
    dom.windUnitLabel.textContent = 'km/h';
    dom.windDirText.textContent = `${curr.windCardinal} (${curr.windDeg}°)`;
    dom.windGusts.textContent = `${curr.windGustsKm} km/h`;
    dom.compassDial.style.transform = `rotate(${curr.windDeg}deg)`;

    // UV Index Widget
    dom.uvIndexVal.textContent = curr.uvIndex;
    dom.uvStatusBadge.textContent = curr.uvRating.text;
    dom.uvStatusBadge.className = `badge-status-pill ${curr.uvRating.class}`;
    dom.uvAdviceText.textContent = curr.uvRating.advice;
    const uvPct = Math.min(100, (Number(curr.uvIndex) / 11) * 100);
    dom.uvBarFill.style.width = `${uvPct}%`;

    // AQI Widget
    dom.aqiScore.textContent = curr.aqi.score;
    dom.aqiStatusBadge.textContent = curr.aqi.rating.text;
    dom.aqiStatusBadge.className = `badge-status-pill ${curr.aqi.rating.class}`;
    dom.aqiPm25.textContent = `${curr.aqi.pm25} µg`;
    dom.aqiPm10.textContent = `${curr.aqi.pm10} µg`;
    dom.aqiO3.textContent = `${curr.aqi.o3} µg`;

    // Humidity Widget
    dom.humidityVal.textContent = curr.humidity;
    dom.humidityBarFill.style.width = `${curr.humidity}%`;
    dom.dewPointVal.textContent = isC ? `${curr.dewPointC}°C` : `${Math.round((curr.dewPointC * 9/5) + 32)}°F`;
    dom.humidityComfort.textContent = curr.humidity < 30 ? 'Dry air' : curr.humidity <= 60 ? 'Optimal Comfort' : 'High Humidity';

    // Solar Arc Widget
    dom.sunriseTime.textContent = curr.sun.sunriseStr;
    dom.sunsetTime.textContent = curr.sun.sunsetStr;
    calculateSunDotPosition(curr.sun.sunriseIso, curr.sun.sunsetIso);

    // Lunar Phase Widget
    dom.moonPhaseName.textContent = curr.moon.name;
    dom.moonIllumPct.textContent = curr.moon.illum;
    dom.nextFullMoon.textContent = curr.moon.nextFull;

    // Barometer & Pressure
    dom.pressureVal.textContent = curr.pressureHpa;
    dom.pressureSeaLevel.textContent = `${curr.pressureSeaLevel} hPa`;
    dom.pressureTrendBadge.textContent = curr.pressureHpa > 1015 ? 'High Pressure' : curr.pressureHpa < 1005 ? 'Low (Stormy)' : 'Stable';

    // Visibility & Cloudiness
    dom.visibilityVal.textContent = curr.visibilityKm;
    dom.cloudCoverVal.textContent = `${curr.cloudCoverPct}%`;
    dom.visibilityDesc.textContent = Number(curr.visibilityKm) >= 10 ? 'Crystal Clear' : Number(curr.visibilityKm) >= 5 ? 'Moderate' : 'Foggy / Hazy';

    // Lifestyle & Activity Intelligence
    renderLifestyleAdvisory(curr);

    // Hourly Timeline Slider Pills
    renderHourlyPills(data.hourly);

    // 7-Day Forecast Synoptic List
    renderDailyForecast(data.daily);

    // Rehydrate Lucide Icons
    initLucideIcons();
  }

  /**
   * Render Hourly Timeline Horizontal Pills
   */
  function renderHourlyPills(hourly) {
    dom.hourlyTimelineContainer.innerHTML = '';
    const isC = state.unit === 'celsius';

    hourly.slice(0, 24).forEach((h, index) => {
      const pill = document.createElement('div');
      pill.className = `hourly-pill ${index === 0 ? 'now-pill' : ''}`;
      pill.innerHTML = `
        <span class="hourly-time">${h.timeStr}</span>
        <div class="hourly-icon">${h.conditionMeta.iconSvg}</div>
        <span class="hourly-temp">${isC ? h.tempC : h.tempF}°</span>
        <span class="hourly-pop">
          <i data-lucide="droplet"></i>
          ${h.pop}%
        </span>
      `;
      dom.hourlyTimelineContainer.appendChild(pill);
    });
  }

  /**
   * Render 7-Day Extended Forecast Rows
   */
  function renderDailyForecast(daily) {
    dom.dailyForecastList.innerHTML = '';
    const isC = state.unit === 'celsius';

    // Find absolute global min and max for the 7-day strip
    const allMaxs = daily.map(d => isC ? d.maxC : d.maxF);
    const allMins = daily.map(d => isC ? d.minC : d.minF);
    const globalMin = Math.min(...allMins);
    const globalMax = Math.max(...allMaxs);
    const totalRange = (globalMax - globalMin) === 0 ? 1 : (globalMax - globalMin);

    daily.forEach((day, i) => {
      const curMin = isC ? day.minC : day.minF;
      const curMax = isC ? day.maxC : day.maxF;

      const leftPct = ((curMin - globalMin) / totalRange) * 100;
      const widthPct = Math.max(15, ((curMax - curMin) / totalRange) * 100);

      const row = document.createElement('div');
      row.className = 'daily-forecast-row';
      row.innerHTML = `
        <div>
          <div class="daily-day-label">${day.dayName}</div>
          <div class="daily-day-date">${day.dateStr}</div>
        </div>

        <div class="daily-cond-cell">
          <div class="daily-cond-icon">${day.conditionMeta.iconSvg}</div>
          <span class="daily-cond-text">${day.conditionMeta.label}</span>
        </div>

        <div class="daily-rain-chance">
          <i data-lucide="droplets"></i>
          <span>${day.pop}%</span>
        </div>

        <div class="daily-temp-bar-wrap">
          <span class="temp-min-num">${curMin}°</span>
          <div class="temp-range-track">
            <div class="temp-range-fill" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
          </div>
          <span class="temp-max-num">${curMax}°</span>
        </div>
      `;

      dom.dailyForecastList.appendChild(row);
    });
  }

  /**
   * Generate Real-Time Smart Lifestyle Insights
   */
  function renderLifestyleAdvisory(curr) {
    // Clothing
    if (curr.tempC <= 5) {
      dom.advClothing.textContent = 'Heavy winter coat, scarf & gloves';
    } else if (curr.tempC <= 15) {
      dom.advClothing.textContent = 'Warm jacket or hoodie & jeans';
    } else if (curr.tempC <= 24) {
      dom.advClothing.textContent = 'Light casual wear & light layer';
    } else {
      dom.advClothing.textContent = 'Breathable summer attire & UV sun hat';
    }

    // Umbrella
    if (curr.precipChance > 40 || curr.group === 'rain' || curr.group === 'thunderstorm') {
      dom.advUmbrella.textContent = 'Rain expected — pack an umbrella';
      dom.advUmbrella.style.color = 'var(--accent-cyan)';
    } else {
      dom.advUmbrella.textContent = 'No rain expected today';
      dom.advUmbrella.style.color = 'var(--text-primary)';
    }

    // Running / Cycling
    if (curr.aqi.score > 100 || curr.group === 'thunderstorm' || curr.windSpeedKm > 45) {
      dom.advRunning.textContent = 'Indoor workout recommended today';
    } else if (curr.tempC >= 12 && curr.tempC <= 22 && curr.precipChance < 20) {
      dom.advRunning.textContent = 'Prime ideal running & cycling conditions';
    } else {
      dom.advRunning.textContent = 'Moderate outdoor conditions';
    }

    // Driving
    if (curr.group === 'fog' || Number(curr.visibilityKm) < 3) {
      dom.advDriving.textContent = 'Dense fog alert — reduce driving speed';
      dom.advDriving.style.color = 'var(--accent-amber)';
    } else if (curr.group === 'rain' || curr.group === 'snow') {
      dom.advDriving.textContent = 'Wet road surfaces — drive cautiously';
    } else {
      dom.advDriving.textContent = 'Clear roads & unobstructed visibility';
      dom.advDriving.style.color = 'var(--text-primary)';
    }
  }

  /**
   * Position Sun on SVG daylight arch based on real solar time
   */
  function calculateSunDotPosition(sunriseIso, sunsetIso) {
    if (!dom.sunPositionDot) return;
    const now = new Date();

    let progress = 0.5; // default noon
    if (sunriseIso && sunsetIso) {
      const rise = new Date(sunriseIso).getTime();
      const set = new Date(sunsetIso).getTime();
      const cur = now.getTime();

      if (cur <= rise) progress = 0;
      else if (cur >= set) progress = 1;
      else progress = (cur - rise) / (set - rise);
    }

    // Arc math on SVG viewBox 200x100 (Center: 100, 90; Radius: 80)
    // Angle: 180deg (left, sunrise) to 0deg (right, sunset)
    const angle = Math.PI - (progress * Math.PI);
    const cx = 100 + 80 * Math.cos(angle);
    const cy = 90 - 80 * Math.sin(angle);

    dom.sunPositionDot.setAttribute('cx', cx.toFixed(1));
    dom.sunPositionDot.setAttribute('cy', cy.toFixed(1));
  }

  /**
   * Update Leaflet Map Center & Marker
   */
  function updateMapPosition(lat, lon) {
    if (!state.mapInstance) return;

    state.mapInstance.flyTo([lat, lon], 10, { duration: 1.2 });
    if (state.mapMarker) {
      state.mapMarker.setLatLng([lat, lon]);
    }
    if (dom.mapCoordsText) {
      dom.mapCoordsText.textContent = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
    }
  }

  /**
   * Unit Switcher Handling (°C / °F)
   */
  function initUnitButtons() {
    dom.unitBtns.forEach(btn => {
      if (btn.dataset.unit === state.unit) btn.classList.add('active');
      else btn.classList.remove('active');

      btn.addEventListener('click', () => {
        const selected = btn.dataset.unit;
        if (state.unit === selected) return;
        state.unit = selected;
        localStorage.setItem('aetheria_unit', selected);

        dom.unitBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (state.weatherData) {
          renderDashboard(state.weatherData);
          chartEngine.render(state.weatherData, state.activeChartTab, state.unit);
        }
      });
    });
  }

  /**
   * Favorite / Bookmarking System
   */
  function updateFavoriteButtonState() {
    const isFav = state.favorites.some(f => f.name.toLowerCase() === state.currentLocation.name.toLowerCase());
    if (isFav) {
      dom.favoriteBtn.classList.add('bookmarked');
      dom.favoriteBtn.title = 'Remove from favorites';
    } else {
      dom.favoriteBtn.classList.remove('bookmarked');
      dom.favoriteBtn.title = 'Add to favorites';
    }
  }

  function toggleFavorite() {
    const currentName = state.currentLocation.name;
    const index = state.favorites.findIndex(f => f.name.toLowerCase() === currentName.toLowerCase());

    if (index > -1) {
      state.favorites.splice(index, 1);
    } else {
      state.favorites.push({ ...state.currentLocation });
    }

    localStorage.setItem('aetheria_favs', JSON.stringify(state.favorites));
    updateFavoriteButtonState();
  }

  /**
   * Search Autocomplete & Geocoding Debounce
   */
  function handleSearchInput(e) {
    const query = e.target.value;
    if (query.trim().length > 0) {
      dom.searchClearBtn.classList.remove('hidden');
    } else {
      dom.searchClearBtn.classList.add('hidden');
      dom.searchDropdown.classList.add('hidden');
      return;
    }

    clearTimeout(state.searchDebounceTimer);
    state.searchDebounceTimer = setTimeout(async () => {
      if (query.trim().length < 2) return;

      dom.searchSpinner.classList.remove('hidden');
      try {
        const results = await apiService.searchCities(query);
        renderSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        dom.searchSpinner.classList.add('hidden');
      }
    }, 280);
  }

  function renderSearchResults(results) {
    dom.searchDropdown.innerHTML = '';
    if (!results || results.length === 0) {
      dom.searchDropdown.innerHTML = `
        <div class="search-result-item" style="cursor: default; opacity: 0.6;">
          <span class="res-main-text">No worldwide cities found</span>
        </div>
      `;
      dom.searchDropdown.classList.remove('hidden');
      return;
    }

    results.forEach(city => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div>
          <div class="res-main-text">${city.name}</div>
          <div class="res-sub-text">${city.admin1 ? city.admin1 + ', ' : ''}${city.country}</div>
        </div>
        <span class="res-country-pill">${city.countryCode || 'LOC'}</span>
      `;

      item.addEventListener('click', () => {
        dom.searchDropdown.classList.add('hidden');
        dom.searchInput.value = '';
        dom.searchClearBtn.classList.add('hidden');

        // Unset active predefined button
        document.querySelectorAll('.city-pill-card').forEach(c => c.classList.remove('active'));

        loadWeather({
          name: city.name,
          countryCode: city.countryCode,
          lat: city.lat,
          lon: city.lon
        });
      });

      dom.searchDropdown.appendChild(item);
    });

    dom.searchDropdown.classList.remove('hidden');
  }

  /**
   * HTML5 Geolocation Trigger
   */
  async function handleGeolocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    showLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const locInfo = await apiService.reverseGeocode(lat, lon);
          document.querySelectorAll('.city-pill-card').forEach(c => c.classList.remove('active'));
          await loadWeather(locInfo);
        } catch (err) {
          await loadWeather({ name: 'My GPS Location', countryCode: 'GPS', lat, lon });
        }
      },
      (err) => {
        showLoading(false);
        showError(`Location permission denied or unavailable (${err.message})`);
      },
      { timeout: 10000 }
    );
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Search input
    dom.searchInput.addEventListener('input', handleSearchInput);
    dom.searchClearBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      dom.searchClearBtn.classList.add('hidden');
      dom.searchDropdown.classList.add('hidden');
      dom.searchInput.focus();
    });

    // Close search dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!dom.searchInput.contains(e.target) && !dom.searchDropdown.contains(e.target)) {
        dom.searchDropdown.classList.add('hidden');
      }
    });

    // Geolocation & Refresh
    dom.geoBtn.addEventListener('click', handleGeolocation);
    dom.refreshBtn.addEventListener('click', () => {
      if (state.currentLocation) {
        apiService.cache.clear();
        loadWeather(state.currentLocation);
      }
    });

    // Favorite button
    dom.favoriteBtn.addEventListener('click', toggleFavorite);

    // Predefined Horizontal Scroll Navigation Arrows
    dom.citiesPrevBtn.addEventListener('click', () => {
      dom.predefinedContainer.scrollBy({ left: -260, behavior: 'smooth' });
    });
    dom.citiesNextBtn.addEventListener('click', () => {
      dom.predefinedContainer.scrollBy({ left: 260, behavior: 'smooth' });
    });

    // Chart Tabs (Temperature / Precipitation / Wind)
    dom.chartTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.chartTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeChartTab = btn.dataset.chart;
        if (state.weatherData) {
          chartEngine.render(state.weatherData, state.activeChartTab, state.unit);
        }
      });
    });

    // Map Layer Selector
    if (dom.mapLayerSelector) {
      dom.mapLayerSelector.querySelectorAll('.layer-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          dom.mapLayerSelector.querySelectorAll('.layer-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          setMapLayer(pill.dataset.layer);
        });
      });
    }

    // Error retry button
    dom.errorRetryBtn.addEventListener('click', () => {
      if (state.currentLocation) loadWeather(state.currentLocation);
    });

    // Configuration Modal
    dom.apiModalBtn.addEventListener('click', () => dom.apiModal.classList.remove('hidden'));
    dom.modalCloseBtn.addEventListener('click', () => dom.apiModal.classList.add('hidden'));
    dom.apiModal.addEventListener('click', (e) => {
      if (e.target === dom.apiModal) dom.apiModal.classList.add('hidden');
    });

    dom.providerSelect.addEventListener('change', (e) => {
      dom.owmKeyGroup.style.display = e.target.value === 'openweathermap' ? 'flex' : 'none';
    });

    dom.particleToggle.addEventListener('change', (e) => {
      atmosphereEngine.toggleEffects(e.target.checked);
    });

    dom.modalSaveBtn.addEventListener('click', () => {
      const selectedProv = dom.providerSelect.value;
      const apiKey = dom.owmApiKeyInput.value.trim();
      apiService.setProvider(selectedProv, apiKey);
      dom.apiModal.classList.add('hidden');
      if (state.currentLocation) loadWeather(state.currentLocation);
    });
  }

  function showLoading(show) {
    if (show) dom.loadingScreen.classList.remove('hidden');
    else dom.loadingScreen.classList.add('hidden');
  }

  function showError(msg) {
    dom.errorMessage.textContent = msg;
    dom.errorBanner.classList.remove('hidden');
  }

  function hideError() {
    dom.errorBanner.classList.add('hidden');
  }

  // Launch App
  initApp();
});
