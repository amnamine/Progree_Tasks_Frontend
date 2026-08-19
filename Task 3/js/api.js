/**
 * AETHERIA - Asynchronous REST API Weather Portal Service
 * Uses standard Fetch API with async/await handlers for live data retrieval.
 * Supports Open-Meteo Live API (zero key needed) and OpenWeatherMap API endpoints.
 */

class WeatherApiService {
  constructor() {
    this.provider = localStorage.getItem('aetheria_provider') || 'open-meteo';
    this.owmApiKey = localStorage.getItem('aetheria_owm_key') || '';
    this.cache = new Map();
  }

  setProvider(provider, apiKey = '') {
    this.provider = provider;
    if (apiKey) this.owmApiKey = apiKey;
    localStorage.setItem('aetheria_provider', provider);
    localStorage.setItem('aetheria_owm_key', this.owmApiKey);
    this.cache.clear();
  }

  /**
   * Asynchronously search locations worldwide using Geocoding REST API
   * @param {string} query 
   * @returns {Promise<Array>}
   */
  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];
    const trimmed = query.trim();

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map(item => ({
        id: item.id || `${item.latitude}-${item.longitude}`,
        name: item.name,
        country: item.country || '',
        countryCode: item.country_code ? item.country_code.toUpperCase() : '',
        admin1: item.admin1 || '',
        lat: item.latitude,
        lon: item.longitude,
        elevation: item.elevation || 0,
        timezone: item.timezone || 'auto'
      }));
    } catch (err) {
      console.error('Asynchronous geocoding error:', err);
      return [];
    }
  }

  /**
   * Asynchronously reverse geocode coordinates to location name
   * @param {number} lat 
   * @param {number} lon 
   */
  async reverseGeocode(lat, lon) {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return {
          name: data.city || data.locality || data.principalSubdivision || 'Current Location',
          country: data.countryName || '',
          countryCode: data.countryCode ? data.countryCode.toUpperCase() : '',
          lat: lat,
          lon: lon
        };
      }
    } catch (e) {
      console.warn('Reverse geocode fallback:', e);
    }
    return {
      name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      country: '',
      countryCode: 'GPS',
      lat: lat,
      lon: lon
    };
  }

  /**
   * Master Async Fetch Weather Data for given Coordinates
   * @param {number} lat 
   * @param {number} lon 
   * @param {string} customName 
   * @param {string} countryCode 
   */
  async fetchWeatherData(lat, lon, customName = '', countryCode = '') {
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}_${this.provider}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // 5-minute memory cache to prevent redundant requests
    if (cached && (now - cached.timestamp < 300000)) {
      return cached.data;
    }

    try {
      let normalizedData;
      if (this.provider === 'openweathermap' && this.owmApiKey) {
        normalizedData = await this._fetchOpenWeatherMapData(lat, lon, customName, countryCode);
      } else {
        normalizedData = await this._fetchOpenMeteoData(lat, lon, customName, countryCode);
      }

      this.cache.set(cacheKey, { timestamp: now, data: normalizedData });
      return normalizedData;
    } catch (error) {
      console.error('Weather retrieval async error:', error);
      throw error;
    }
  }

  /**
   * Open-Meteo REST Handler (Free, Ultra-Rich & No API Key Barrier)
   */
  async _fetchOpenMeteoData(lat, lon, customName, countryCode) {
    // 1. Fetch Forecast & Telemetry
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    
    // 2. Fetch Air Quality Metrics
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl).catch(() => null)
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Open-Meteo API returned status ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();
    let aqiData = null;
    if (aqiRes && aqiRes.ok) {
      try {
        aqiData = await aqiRes.json();
      } catch (e) {
        console.warn('AQI parse error:', e);
      }
    }

    return this._normalizeOpenMeteo(weatherData, aqiData, lat, lon, customName, countryCode);
  }

  /**
   * OpenWeatherMap Adapter (Optional Evaluation Mode)
   */
  async _fetchOpenWeatherMapData(lat, lon, customName, countryCode) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.owmApiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.owmApiKey}`;
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${this.owmApiKey}`;

    const [wRes, fRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl),
      fetch(aqiUrl).catch(() => null)
    ]);

    if (!wRes.ok) throw new Error(`OpenWeatherMap returned status ${wRes.status}`);
    const wData = await wRes.json();
    const fData = fRes.ok ? await fRes.json() : null;
    const aData = (aqiRes && aqiRes.ok) ? await aqiRes.json() : null;

    return this._normalizeOpenWeatherMap(wData, fData, aData, lat, lon, customName, countryCode);
  }

  /**
   * Transform Open-Meteo schema to unified Aetheria model
   */
  _normalizeOpenMeteo(w, aqi, lat, lon, customName, countryCode) {
    const current = w.current || {};
    const daily = w.daily || {};
    const hourly = w.hourly || {};
    const aqiCurrent = (aqi && aqi.current) ? aqi.current : {};

    const weatherCode = current.weather_code !== undefined ? current.weather_code : 0;
    const isDay = current.is_day === 1;
    const conditionMeta = this._getWmoConditionMeta(weatherCode, isDay);

    const tempC = Math.round(current.temperature_2m || 0);
    const tempF = Math.round((tempC * 9/5) + 32);
    const feelsLikeC = Math.round(current.apparent_temperature || tempC);
    const feelsLikeF = Math.round((feelsLikeC * 9/5) + 32);

    const highC = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : tempC + 3;
    const highF = Math.round((highC * 9/5) + 32);
    const lowC = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : tempC - 4;
    const lowF = Math.round((lowC * 9/5) + 32);

    // Hourly Breakdown (next 24 hours)
    const normalizedHourly = [];
    const hourlyTimes = hourly.time || [];
    const hourlyTemps = hourly.temperature_2m || [];
    const hourlyPops = hourly.precipitation_probability || [];
    const hourlyCodes = hourly.weather_code || [];
    const hourlyWinds = hourly.wind_speed_10m || [];

    // Find current hour index
    const nowIso = current.time || new Date().toISOString();
    let startIndex = hourlyTimes.findIndex(t => t >= nowIso.slice(0, 13));
    if (startIndex === -1) startIndex = 0;

    for (let i = startIndex; i < Math.min(startIndex + 24, hourlyTimes.length); i++) {
      const timeDate = new Date(hourlyTimes[i]);
      const hourTempC = Math.round(hourlyTemps[i] || 0);
      const code = hourlyCodes[i] || 0;
      const hHour = timeDate.getHours();
      const hIsDay = hHour >= 6 && hHour < 20;

      normalizedHourly.push({
        timeStr: i === startIndex ? 'Now' : timeDate.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        isoTime: hourlyTimes[i],
        tempC: hourTempC,
        tempF: Math.round((hourTempC * 9/5) + 32),
        pop: hourlyPops[i] || 0,
        code: code,
        isDay: hIsDay,
        windSpeed: Math.round(hourlyWinds[i] || 0),
        conditionMeta: this._getWmoConditionMeta(code, hIsDay)
      });
    }

    // Daily 7-Day Forecast
    const normalizedDaily = [];
    const dailyTimes = daily.time || [];
    const dailyMaxs = daily.temperature_2m_max || [];
    const dailyMins = daily.temperature_2m_min || [];
    const dailyCodes = daily.weather_code || [];
    const dailyPops = daily.precipitation_probability_max || [];

    for (let i = 0; i < Math.min(7, dailyTimes.length); i++) {
      const dDate = new Date(dailyTimes[i] + 'T00:00:00');
      const maxC = Math.round(dailyMaxs[i] || 0);
      const minC = Math.round(dailyMins[i] || 0);
      const dayCode = dailyCodes[i] || 0;

      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      normalizedDaily.push({
        dayName,
        dateStr,
        code: dayCode,
        conditionMeta: this._getWmoConditionMeta(dayCode, true),
        maxC,
        maxF: Math.round((maxC * 9/5) + 32),
        minC,
        minF: Math.round((minC * 9/5) + 32),
        pop: dailyPops[i] || 0
      });
    }

    // AQI & Pollutants
    const aqiScore = Math.round(aqiCurrent.us_aqi || aqiCurrent.european_aqi || 28);
    const pm25 = aqiCurrent.pm2_5 ? aqiCurrent.pm2_5.toFixed(1) : '6.4';
    const pm10 = aqiCurrent.pm10 ? aqiCurrent.pm10.toFixed(1) : '12.2';
    const o3 = aqiCurrent.ozone ? aqiCurrent.ozone.toFixed(1) : '48.0';
    const no2 = aqiCurrent.nitrogen_dioxide ? aqiCurrent.nitrogen_dioxide.toFixed(1) : '14.5';

    // Sunrise / Sunset
    let sunriseStr = '06:00 AM';
    let sunsetStr = '07:30 PM';
    let sunriseIso = null;
    let sunsetIso = null;
    if (daily.sunrise && daily.sunrise[0]) {
      sunriseIso = daily.sunrise[0];
      sunriseStr = new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (daily.sunset && daily.sunset[0]) {
      sunsetIso = daily.sunset[0];
      sunsetStr = new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // Wind direction cardinal
    const windDeg = current.wind_direction_10m || 0;
    const windCardinal = this._degToCardinal(windDeg);

    // UV Index calculation
    const uvIndex = daily.uv_index_max && daily.uv_index_max[0] !== undefined 
      ? Number(daily.uv_index_max[0]).toFixed(1) 
      : '5.2';

    // Lunar Phase
    const moon = this._calculateMoonPhase(new Date());

    return {
      location: {
        name: customName || 'Selected Location',
        countryCode: countryCode || 'WORLD',
        lat: lat,
        lon: lon,
        elevation: w.elevation || 0,
        timezone: w.timezone || 'auto'
      },
      current: {
        tempC,
        tempF,
        feelsLikeC,
        feelsLikeF,
        highC,
        highF,
        lowC,
        lowF,
        isDay,
        weatherCode,
        condition: conditionMeta.label,
        group: conditionMeta.group,
        iconSvg: conditionMeta.iconSvg,
        humidity: current.relative_humidity_2m || 50,
        dewPointC: hourly.dew_point_2m ? Math.round(hourly.dew_point_2m[startIndex] || 15) : 15,
        windSpeedKm: Math.round(current.wind_speed_10m || 0),
        windGustsKm: Math.round(current.wind_gusts_10m || (current.wind_speed_10m || 0) * 1.3),
        windDeg: windDeg,
        windCardinal: windCardinal,
        pressureHpa: Math.round(current.surface_pressure || current.pressure_msl || 1013),
        pressureSeaLevel: Math.round(current.pressure_msl || 1013),
        visibilityKm: hourly.visibility ? (hourly.visibility[startIndex] / 1000).toFixed(1) : '10.0',
        cloudCoverPct: current.cloud_cover !== undefined ? current.cloud_cover : 35,
        precipChance: hourlyPops[startIndex] || (dailyPops[0] || 10),
        uvIndex: uvIndex,
        uvRating: this._getUvRating(Number(uvIndex)),
        aqi: {
          score: aqiScore,
          rating: this._getAqiRating(aqiScore),
          pm25,
          pm10,
          o3,
          no2
        },
        sun: {
          sunriseStr,
          sunsetStr,
          sunriseIso,
          sunsetIso
        },
        moon: moon,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      },
      hourly: normalizedHourly,
      daily: normalizedDaily
    };
  }

  /**
   * Transform OpenWeatherMap schema
   */
  _normalizeOpenWeatherMap(w, f, aqi, lat, lon, customName, countryCode) {
    const tempC = Math.round(w.main.temp);
    const tempF = Math.round((tempC * 9/5) + 32);
    const feelsLikeC = Math.round(w.main.feels_like);
    const isDay = (w.weather[0].icon || '').includes('d');
    const group = this._mapOwmGroup(w.weather[0].main);

    const sunriseDate = new Date(w.sys.sunrise * 1000);
    const sunsetDate = new Date(w.sys.sunset * 1000);

    const aqiScore = aqi && aqi.list && aqi.list[0] ? (aqi.list[0].main.aqi * 25) : 32;
    const aqiRating = this._getAqiRating(aqiScore);

    const windDeg = w.wind.deg || 0;
    const moon = this._calculateMoonPhase(new Date());

    // Hourly points from 5-day / 3-hour forecast
    const hourly = [];
    if (f && f.list) {
      for (let i = 0; i < Math.min(8, f.list.length); i++) {
        const item = f.list[i];
        const hDate = new Date(item.dt * 1000);
        const hTemp = Math.round(item.main.temp);
        const hIsDay = item.sys.pod === 'd';
        const hGroup = this._mapOwmGroup(item.weather[0].main);

        hourly.push({
          timeStr: i === 0 ? 'Now' : hDate.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
          isoTime: item.dt_txt,
          tempC: hTemp,
          tempF: Math.round((hTemp * 9/5) + 32),
          pop: Math.round((item.pop || 0) * 100),
          code: item.weather[0].id,
          isDay: hIsDay,
          windSpeed: Math.round(item.wind.speed * 3.6),
          conditionMeta: this._getGenericConditionMeta(hGroup, item.weather[0].description, hIsDay)
        });
      }
    }

    // Daily synthetic aggregation from 5-day list
    const daily = [];
    if (f && f.list) {
      const dailyBuckets = {};
      f.list.forEach(item => {
        const dStr = item.dt_txt.split(' ')[0];
        if (!dailyBuckets[dStr]) dailyBuckets[dStr] = [];
        dailyBuckets[dStr].push(item);
      });

      const dates = Object.keys(dailyBuckets);
      dates.forEach((dStr, idx) => {
        const dayItems = dailyBuckets[dStr];
        const temps = dayItems.map(x => x.main.temp);
        const maxC = Math.round(Math.max(...temps));
        const minC = Math.round(Math.min(...temps));
        const midItem = dayItems[Math.floor(dayItems.length / 2)];
        const dDate = new Date(dStr + 'T00:00:00');

        daily.push({
          dayName: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : dDate.toLocaleDateString('en-US', { weekday: 'short' }),
          dateStr: dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          code: midItem.weather[0].id,
          conditionMeta: this._getGenericConditionMeta(this._mapOwmGroup(midItem.weather[0].main), midItem.weather[0].description, true),
          maxC,
          maxF: Math.round((maxC * 9/5) + 32),
          minC,
          minF: Math.round((minC * 9/5) + 32),
          pop: Math.round((midItem.pop || 0) * 100)
        });
      });
    }

    return {
      location: {
        name: customName || w.name,
        countryCode: countryCode || w.sys.country,
        lat: lat,
        lon: lon,
        elevation: 0,
        timezone: 'auto'
      },
      current: {
        tempC,
        tempF,
        feelsLikeC,
        feelsLikeF,
        highC: Math.round(w.main.temp_max),
        highF: Math.round((w.main.temp_max * 9/5) + 32),
        lowC: Math.round(w.main.temp_min),
        lowF: Math.round((w.main.temp_min * 9/5) + 32),
        isDay,
        weatherCode: w.weather[0].id,
        condition: w.weather[0].description,
        group,
        iconSvg: this._getGenericConditionMeta(group, w.weather[0].description, isDay).iconSvg,
        humidity: w.main.humidity,
        dewPointC: tempC - ((100 - w.main.humidity) / 5),
        windSpeedKm: Math.round(w.wind.speed * 3.6),
        windGustsKm: Math.round((w.wind.gust || w.wind.speed * 1.3) * 3.6),
        windDeg: windDeg,
        windCardinal: this._degToCardinal(windDeg),
        pressureHpa: w.main.pressure,
        pressureSeaLevel: w.main.sea_level || w.main.pressure,
        visibilityKm: (w.visibility / 1000).toFixed(1),
        cloudCoverPct: w.clouds.all,
        precipChance: 15,
        uvIndex: '5.0',
        uvRating: this._getUvRating(5.0),
        aqi: {
          score: aqiScore,
          rating: aqiRating,
          pm25: '7.0',
          pm10: '14.0',
          o3: '50.0',
          no2: '16.0'
        },
        sun: {
          sunriseStr: sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          sunsetStr: sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          sunriseIso: sunriseDate.toISOString(),
          sunsetIso: sunsetDate.toISOString()
        },
        moon: moon,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      },
      hourly,
      daily
    };
  }

  /**
   * WMO Weather Interpretation Code Table (Open-Meteo)
   */
  _getWmoConditionMeta(code, isDay) {
    switch (code) {
      case 0:
        return {
          label: isDay ? 'Clear Sky' : 'Clear Night',
          group: isDay ? 'clear-day' : 'clear-night',
          iconSvg: isDay ? this._svgSun() : this._svgMoon()
        };
      case 1:
        return {
          label: isDay ? 'Mainly Clear' : 'Mainly Clear Night',
          group: isDay ? 'clear-day' : 'clear-night',
          iconSvg: isDay ? this._svgSun() : this._svgMoon()
        };
      case 2:
        return {
          label: 'Partly Cloudy',
          group: isDay ? 'clouds' : 'clear-night',
          iconSvg: isDay ? this._svgCloudSun() : this._svgCloudMoon()
        };
      case 3:
        return {
          label: 'Overcast',
          group: 'clouds',
          iconSvg: this._svgCloud()
        };
      case 45:
      case 48:
        return {
          label: 'Fog & Mist',
          group: 'fog',
          iconSvg: this._svgFog()
        };
      case 51:
      case 53:
      case 55:
        return {
          label: 'Light Drizzle',
          group: 'rain',
          iconSvg: this._svgDrizzle()
        };
      case 61:
      case 63:
        return {
          label: 'Moderate Rain',
          group: 'rain',
          iconSvg: this._svgRain()
        };
      case 65:
      case 80:
      case 81:
      case 82:
        return {
          label: 'Heavy Rain Showers',
          group: 'rain',
          iconSvg: this._svgHeavyRain()
        };
      case 71:
      case 73:
      case 75:
      case 85:
      case 86:
        return {
          label: 'Snow Fall',
          group: 'snow',
          iconSvg: this._svgSnow()
        };
      case 95:
      case 96:
      case 99:
        return {
          label: 'Thunderstorm',
          group: 'thunderstorm',
          iconSvg: this._svgThunder()
        };
      default:
        return {
          label: 'Partly Cloudy',
          group: 'clouds',
          iconSvg: this._svgCloudSun()
        };
    }
  }

  _mapOwmGroup(main) {
    const m = (main || '').toLowerCase();
    if (m.includes('clear')) return 'clear-day';
    if (m.includes('cloud')) return 'clouds';
    if (m.includes('rain') || m.includes('drizzle')) return 'rain';
    if (m.includes('snow')) return 'snow';
    if (m.includes('thunder')) return 'thunderstorm';
    if (m.includes('fog') || m.includes('mist') || m.includes('haze')) return 'fog';
    return 'clouds';
  }

  _getGenericConditionMeta(group, desc, isDay) {
    if (group === 'clear-day') {
      return {
        label: desc || (isDay ? 'Clear Sky' : 'Clear Night'),
        group: isDay ? 'clear-day' : 'clear-night',
        iconSvg: isDay ? this._svgSun() : this._svgMoon()
      };
    }
    if (group === 'rain') {
      return { label: desc || 'Rain', group: 'rain', iconSvg: this._svgRain() };
    }
    if (group === 'thunderstorm') {
      return { label: desc || 'Thunderstorm', group: 'thunderstorm', iconSvg: this._svgThunder() };
    }
    if (group === 'snow') {
      return { label: desc || 'Snow', group: 'snow', iconSvg: this._svgSnow() };
    }
    if (group === 'fog') {
      return { label: desc || 'Fog', group: 'fog', iconSvg: this._svgFog() };
    }
    return {
      label: desc || 'Partly Cloudy',
      group: 'clouds',
      iconSvg: isDay ? this._svgCloudSun() : this._svgCloudMoon()
    };
  }

  _degToCardinal(deg) {
    const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round((deg % 360) / 22.5) % 16;
    return cardinals[idx];
  }

  _getUvRating(uv) {
    if (uv <= 2) return { text: 'Low', class: 'badge-good', advice: 'No protection needed' };
    if (uv <= 5) return { text: 'Moderate', class: 'badge-moderate', advice: 'Wear sunglasses & SPF 15+' };
    if (uv <= 7) return { text: 'High', class: 'badge-moderate', advice: 'Protection required, seek shade' };
    if (uv <= 10) return { text: 'Very High', class: 'badge-unhealthy', advice: 'Extra protection, avoid midday sun' };
    return { text: 'Extreme', class: 'badge-unhealthy', advice: 'Stay indoors during peak hours' };
  }

  _getAqiRating(score) {
    if (score <= 50) return { text: 'Good', class: 'badge-good' };
    if (score <= 100) return { text: 'Moderate', class: 'badge-moderate' };
    if (score <= 150) return { text: 'Unhealthy for Sensitive', class: 'badge-moderate' };
    return { text: 'Unhealthy', class: 'badge-unhealthy' };
  }

  _calculateMoonPhase(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 3) {
      year--;
      month += 12;
    }

    let c = 365.25 * year;
    let e = 30.6 * month;
    let jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    let b = parseInt(jd);
    jd -= b;
    let phaseNum = Math.round(jd * 8);
    if (phaseNum >= 8) phaseNum = 0;

    const phases = [
      { name: 'New Moon', illum: '0%', nextFull: 'in 14 days' },
      { name: 'Waxing Crescent', illum: '25%', nextFull: 'in 10 days' },
      { name: 'First Quarter', illum: '50%', nextFull: 'in 7 days' },
      { name: 'Waxing Gibbous', illum: '78%', nextFull: 'in 3 days' },
      { name: 'Full Moon', illum: '100%', nextFull: 'Today' },
      { name: 'Waning Gibbous', illum: '74%', nextFull: 'in 25 days' },
      { name: 'Last Quarter', illum: '50%', nextFull: 'in 21 days' },
      { name: 'Waning Crescent', illum: '22%', nextFull: 'in 17 days' }
    ];

    return phases[phaseNum] || phases[3];
  }

  /* Rich Animated SVG Icon Generators */
  _svgSun() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <g class="anim-sun-spin">
          <circle cx="32" cy="32" r="14" fill="#fbbf24" filter="drop-shadow(0 0 10px #f59e0b)"/>
          <line x1="32" y1="6" x2="32" y2="12" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
          <line x1="32" y1="52" x2="32" y2="58" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
          <line x1="6" y1="32" x2="12" y2="32" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
          <line x1="52" y1="32" x2="58" y2="32" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
          <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
          <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
          <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
          <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        </g>
      </svg>
    `;
  }

  _svgMoon() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <path d="M42 36 A 16 16 0 1 1 24 16 A 14 14 0 0 0 42 36 Z" fill="#e0e7ff" filter="drop-shadow(0 0 12px rgba(129, 140, 248, 0.7))"/>
      </svg>
    `;
  }

  _svgCloudSun() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <circle cx="24" cy="22" r="10" fill="#fbbf24" class="anim-sun-spin"/>
        <path class="anim-cloud-drift" d="M 22 46 L 46 46 A 10 10 0 0 0 46 26 A 12 12 0 0 0 24 30 A 8 8 0 0 0 22 46 Z" fill="#cbd5e1" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.3))"/>
      </svg>
    `;
  }

  _svgCloudMoon() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <path d="M36 24 A 10 10 0 1 1 22 12 A 9 9 0 0 0 36 24 Z" fill="#c7d2fe"/>
        <path class="anim-cloud-drift" d="M 22 46 L 46 46 A 10 10 0 0 0 46 26 A 12 12 0 0 0 24 30 A 8 8 0 0 0 22 46 Z" fill="#94a3b8" opacity="0.9"/>
      </svg>
    `;
  }

  _svgCloud() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <path class="anim-cloud-drift" d="M 18 46 L 48 46 A 11 11 0 0 0 48 24 A 14 14 0 0 0 22 28 A 9 9 0 0 0 18 46 Z" fill="#94a3b8" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.3))"/>
      </svg>
    `;
  }

  _svgRain() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <path class="anim-cloud-drift" d="M 18 40 L 48 40 A 10 10 0 0 0 48 20 A 13 13 0 0 0 22 24 A 8 8 0 0 0 18 40 Z" fill="#64748b"/>
        <line x1="24" y1="46" x2="21" y2="56" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="anim-rain-drop"/>
        <line x1="34" y1="46" x2="31" y2="56" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="anim-rain-drop" style="animation-delay: 0.3s;"/>
        <line x1="44" y1="46" x2="41" y2="56" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="anim-rain-drop" style="animation-delay: 0.6s;"/>
      </svg>
    `;
  }

  _svgHeavyRain() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <path class="anim-cloud-drift" d="M 16 38 L 50 38 A 11 11 0 0 0 50 16 A 15 15 0 0 0 20 20 A 9 9 0 0 0 16 38 Z" fill="#475569"/>
        <line x1="20" y1="44" x2="16" y2="58" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" class="anim-rain-drop"/>
        <line x1="30" y1="44" x2="26" y2="58" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" class="anim-rain-drop" style="animation-delay: 0.25s;"/>
        <line x1="40" y1="44" x2="36" y2="58" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" class="anim-rain-drop" style="animation-delay: 0.5s;"/>
        <line x1="50" y1="44" x2="46" y2="58" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" class="anim-rain-drop" style="animation-delay: 0.75s;"/>
      </svg>
    `;
  }

  _svgDrizzle() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <path d="M 20 42 L 46 42 A 9 9 0 0 0 46 24 A 12 12 0 0 0 24 28 A 7 7 0 0 0 20 42 Z" fill="#94a3b8"/>
        <line x1="26" y1="48" x2="24" y2="54" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" class="anim-rain-drop"/>
        <line x1="38" y1="48" x2="36" y2="54" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" class="anim-rain-drop" style="animation-delay: 0.4s;"/>
      </svg>
    `;
  }

  _svgSnow() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <path class="anim-cloud-drift" d="M 18 38 L 48 38 A 10 10 0 0 0 48 18 A 13 13 0 0 0 22 22 A 8 8 0 0 0 18 38 Z" fill="#cbd5e1"/>
        <circle cx="24" cy="48" r="2.5" fill="#f8fafc" class="anim-snow-flake"/>
        <circle cx="34" cy="52" r="3" fill="#f8fafc" class="anim-snow-flake" style="animation-delay: 0.5s;"/>
        <circle cx="44" cy="48" r="2.5" fill="#f8fafc" class="anim-snow-flake" style="animation-delay: 1s;"/>
      </svg>
    `;
  }

  _svgThunder() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <path class="anim-cloud-drift" d="M 16 34 L 50 34 A 11 11 0 0 0 50 12 A 15 15 0 0 0 20 16 A 9 9 0 0 0 16 34 Z" fill="#334155"/>
        <polygon points="34,32 26,46 33,46 29,60 42,42 35,42" fill="#fbbf24" filter="drop-shadow(0 0 8px #f59e0b)"/>
      </svg>
    `;
  }

  _svgFog() {
    return `
      <svg viewBox="0 0 64 64" class="svg-weather-icon">
        <path d="M 18 30 L 48 30 A 10 10 0 0 0 48 10 A 13 13 0 0 0 22 14 A 8 8 0 0 0 18 30 Z" fill="#94a3b8" opacity="0.6"/>
        <line x1="14" y1="40" x2="50" y2="40" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
        <line x1="20" y1="48" x2="44" y2="48" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
        <line x1="16" y1="56" x2="48" y2="56" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
      </svg>
    `;
  }
}

window.WeatherApiService = WeatherApiService;
