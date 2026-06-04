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
    try {
      return await Net.getJSON(url);
    } catch (e) {
      // fonte alternativa: wttr.in (domínio diferente, formato próprio)
      const j = await Net.getJSON(`https://wttr.in/${lat},${lon}?format=j1`);
      return adaptWttr(j);
    }
  }

  // converte códigos WWO (wttr.in) para WMO (open-meteo) p/ reusar a tabela
  function wwoToWmo(c) {
    const m = {
      113: 0, 116: 1, 119: 3, 122: 3, 143: 45, 248: 45, 260: 48,
      176: 80, 263: 51, 266: 53, 281: 51, 284: 53, 293: 61, 296: 61,
      299: 63, 302: 65, 305: 65, 308: 65, 311: 66, 314: 67,
      353: 80, 356: 81, 359: 82, 179: 71, 182: 73, 185: 51, 227: 73, 230: 75,
      317: 73, 320: 73, 323: 71, 326: 71, 329: 73, 332: 73, 335: 75, 338: 75,
      350: 77, 362: 71, 365: 73, 368: 71, 371: 73, 374: 77, 377: 77,
      200: 95, 386: 95, 389: 96, 392: 95, 395: 99
    };
    return m[+c] != null ? m[+c] : 3;
  }

  function adaptWttr(j) {
    const cur = j.current_condition[0];
    const data = {
      current: {
        temperature_2m: +cur.temp_C,
        apparent_temperature: +cur.FeelsLikeC,
        relative_humidity_2m: +cur.humidity,
        weather_code: wwoToWmo(cur.weatherCode),
        wind_speed_10m: +cur.windspeedKmph,
        precipitation: +cur.precipMM
      },
      daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [] }
    };
    (j.weather || []).forEach(d => {
      const code = (d.hourly && d.hourly[4]) ? d.hourly[4].weatherCode : cur.weatherCode;
      data.daily.time.push(d.date);
      data.daily.weather_code.push(wwoToWmo(code));
      data.daily.temperature_2m_max.push(+d.maxtempC);
      data.daily.temperature_2m_min.push(+d.mintempC);
    });
    return data;
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
    // localização não pode travar nem derrubar o clima: se falhar, usa fallback
    let loc;
    try {
      loc = await Geo.get();
    } catch (_) {
      loc = {
        lat: CONFIG.location.fallbackLat,
        lon: CONFIG.location.fallbackLon,
        city: CONFIG.location.fallbackCity
      };
    }
    try {
      const data = await fetchWeather(loc.lat, loc.lon);
      const summary = render(data, loc.city);
      try { localStorage.setItem("jarvis.wx", JSON.stringify({ t: Date.now(), city: loc.city, data })); } catch (_) {}
      return summary;
    } catch (e) {
      console.warn("Erro no clima:", e);
      // tenta mostrar o último clima salvo (até 6h) em vez de erro
      try {
        const c = JSON.parse(localStorage.getItem("jarvis.wx") || "null");
        if (c && Date.now() - c.t < 6 * 3600 * 1000) {
          const summary = render(c.data, c.city);
          const hh = new Date(c.t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          const d = document.getElementById("wx-desc");
          d.textContent = d.textContent + " · " + hh;
          return summary;
        }
      } catch (_) {}
      document.getElementById("wx-desc").textContent = "Erro: " + (e.message || e);
      return null;
    }
  }

  return { update };
})();
