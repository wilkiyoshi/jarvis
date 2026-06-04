// ===================================================================
//  Geo — resolve a localização do usuário (geolocalização + reverse)
// ===================================================================

const Geo = (() => {
  let cached = null;

  async function reverseCity(lat, lon) {
    try {
      const r = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=pt`
      );
      // este endpoint busca por nome; para reverse usamos BigDataCloud (grátis, sem chave)
      const rev = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`
      );
      if (rev.ok) {
        const j = await rev.json();
        return j.city || j.locality || j.principalSubdivision || CONFIG.location.fallbackCity;
      }
    } catch (_) {}
    return CONFIG.location.fallbackCity;
  }

  function browserPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("sem geolocation"));
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        err => reject(err),
        { timeout: 8000, maximumAge: 600000 }
      );
    });
  }

  async function get() {
    if (cached) return cached;
    let lat, lon, city;
    if (CONFIG.location.useGeolocation) {
      try {
        const pos = await browserPosition();
        lat = pos.lat; lon = pos.lon;
        city = await reverseCity(lat, lon);
      } catch (_) {
        lat = CONFIG.location.fallbackLat;
        lon = CONFIG.location.fallbackLon;
        city = CONFIG.location.fallbackCity;
      }
    } else {
      lat = CONFIG.location.fallbackLat;
      lon = CONFIG.location.fallbackLon;
      city = CONFIG.location.fallbackCity;
    }
    cached = { lat, lon, city };
    return cached;
  }

  return { get };
})();
