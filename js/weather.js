// ===================================================================
//  Weather — Open-Meteo (gratuito, sem chave de API)
// ===================================================================

const Weather = (() => {
  const WMO = {
    0: ["Céu limpo", "☀️"], 1: ["Predom. limpo", "🌤️"], 2: ["Parc. nublado", "⛅"],
    3: ["Nublado", "☁️"], 45: ["Neblina", "🌫️"], 48: ["Neblina gelada", "🌫️"],
    51: ["Garoa leve", "🌦️"], 53: ["Garoa", "🌦️"], 55: ["Garoa forte", "🌧️"],
    61: ["Chuva leve", "🌧️"], 63: ["Chuva", "🌧️"], 65: ["Chuva forte", "🌧️"],
    66: ["Chuva gelada", "🌧️"], 67: ["Chuva gelada", "🌧️"],
    71: ["Neve leve", "🌨️"], 73: ["Neve", "🌨️"], 75: ["Neve forte", "❄️"],
    77: ["Granizo", "🌨️"], 80: ["Pancadas", "🌦️"], 81: ["Pancadas", "🌧️"],
    82: ["Temporal", "⛈️"], 85: ["Neve", "🌨️"], 86: ["Neve forte", "❄️"],
    95: ["Tempestade", "⛈️"], 96: ["Tempestade c/ granizo", "⛈️"], 99: ["Tempestade severa", "⛈️"]
  };

  function desc(code) { return WMO[code] || ["—", "🌡️"]; }
  const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=auto&forecast_days=4`;
    return Net.getJSON(url);
  }

  function render(data, cityName) {
    const c = data.current;
    const [d, icon] = desc(c.weather_code);
    document.getElementById("wx-city").textContent = cityName || "Local atual";
    document.getElementById("wx-temp").textContent = Math.round(c.temperature_2m) + "°";
    document.getElementById("wx-icon").textContent = icon;
    document.getElementById("wx-desc").textContent = d;
    document.getElementById("wx-feels").textContent = Math.round(c.apparent_temperature) + "°";
    document.getElementById("wx-hum").textContent = c.relative_humidity_2m + "%";
    document.getElementById("wx-wind").textContent = Math.round(c.wind_speed_10m) + " km/h";
    document.getElementById("wx-precip").textContent = (c.precipitation ?? 0) + " mm";

    const fc = document.getElementById("wx-forecast");
    fc.innerHTML = "";
    for (let i = 1; i < data.daily.time.length; i++) {
      const day = new Date(data.daily.time[i] + "T00:00");
      const [, ic] = desc(data.daily.weather_code[i]);
      const el = document.createElement("div");
      el.className = "wx-day";
      el.innerHTML =
        `<span class="wx-dow">${DOW[day.getDay()]}</span>` +
        `<span class="wx-dico">${ic}</span>` +
        `<span class="wx-dmax">${Math.round(data.daily.temperature_2m_max[i])}°</span>` +
        `<span class="wx-dmin">${Math.round(data.daily.temperature_2m_min[i])}°</span>`;
      fc.appendChild(el);
    }
    return { d, temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature) };
  }

  async function update() {
    try {
      const loc = await Geo.get();
      const data = await fetchWeather(loc.lat, loc.lon);
      const summary = render(data, loc.city);
      return summary;
    } catch (e) {
      console.warn("Erro no clima:", e);
      document.getElementById("wx-desc").textContent = "Erro: " + (e.message || e);
      return null;
    }
  }

  return { update };
})();
