/* ============================================================
   weather.js — Gautam Mewara Portfolio
   Task 3 — Weather Application
   Uses OpenWeatherMap Current Weather Data API
   Requires js/config.js to be loaded first (defines API_KEY)
   ============================================================ */

(function initWeatherApp() {
  /* ── DOM refs ─────────────────────────────────────────────── */
  const form        = document.getElementById('weather-form');
  const input       = document.getElementById('weather-city-input');
  const loader      = document.getElementById('weather-loader');
  const errorBox    = document.getElementById('weather-error');
  const resultBox   = document.getElementById('weather-result');
  const apiMissing  = document.getElementById('weather-api-missing');

  if (!form) return; // not on the tools page

  /* ── Result field refs (inside resultBox) ─────────────────── */
  const elIcon   = document.getElementById('w-icon');
  const elTemp   = document.getElementById('w-temp');
  const elDesc   = document.getElementById('w-desc');
  const elCity   = document.getElementById('w-city');
  const elHumid  = document.getElementById('w-humidity');
  const elWind   = document.getElementById('w-wind');
  const elFeels  = document.getElementById('w-feels');

  /* ── State ────────────────────────────────────────────────── */
  const STORAGE_KEY = 'gm_last_weather_city';
  let isFetching = false;

  /* ── Helpers ──────────────────────────────────────────────── */
  function setLoading(on) {
    isFetching = on;
    loader.hidden = !on;
    if (on) {
      errorBox.hidden = true;
      resultBox.hidden = true;
    }
    form.querySelector('button[type="submit"]').disabled = on;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    resultBox.hidden = true;
  }

  function hideError() {
    errorBox.hidden = true;
  }

  /* ── Fetch weather from OpenWeatherMap ────────────────────── */
  async function fetchWeather(city) {
    if (keyMissing) {
      showError('No API key found. Please add your OpenWeatherMap key to js/config.js and reload.');
      return;
    }
    if (!city.trim()) {
      showError('Please enter a city name.');
      return;
    }

    setLoading(true);

    const BASE = 'https://api.openweathermap.org/data/2.5/weather';
    const url  = `${BASE}?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`City "${city.trim()}" not found. Please check the spelling and try again.`);
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your key in js/config.js.');
        } else {
          throw new Error(`Error ${response.status}: Unable to fetch weather data.`);
        }
      }

      const data = await response.json();
      renderWeather(data);

      // Persist last successful city
      try { localStorage.setItem(STORAGE_KEY, data.name); } catch (e) { /* unavailable */ }

    } catch (err) {
      if (err.name === 'TypeError') {
        showError('Network error. Please check your internet connection.');
      } else {
        showError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  /* ── Render results ───────────────────────────────────────── */
  function renderWeather(data) {
    const iconCode = data.weather[0].icon;
    const iconUrl  = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    elIcon.src = iconUrl;
    elIcon.alt = data.weather[0].description;
    elTemp.textContent  = `${Math.round(data.main.temp)}°C`;
    elDesc.textContent  = data.weather[0].description
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    elCity.textContent  = `${data.name}, ${data.sys.country}`;
    elHumid.textContent = `${data.main.humidity}%`;
    elWind.textContent  = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    elFeels.textContent = `${Math.round(data.main.feels_like)}°C`;

    hideError();
    resultBox.hidden = false;
    resultBox.classList.add('weather-result--animate');
    setTimeout(() => resultBox.classList.remove('weather-result--animate'), 600);
  }

  /* ── Form submit ──────────────────────────────────────────── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isFetching) fetchWeather(input.value);
  });

  /* ── Load last searched city on page open ─────────────────── */
  try {
    const lastCity = localStorage.getItem(STORAGE_KEY);
    if (lastCity) {
      input.value = lastCity;
      fetchWeather(lastCity);
    }
  } catch (e) { /* localStorage unavailable */ }

})();
