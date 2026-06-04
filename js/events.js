// ===================================================================
//  Events — eventos próximos (Ticketmaster opcional) + feriados (Nager)
// ===================================================================

const Events = (() => {

  async function fetchTicketmaster(lat, lon) {
    const key = CONFIG.events.ticketmasterApiKey;
    if (!key) return null;
    const url = `https://app.ticketmaster.com/discovery/v2/events.json` +
      `?latlong=${lat},${lon}&radius=50&unit=km&size=8&sort=date,asc&apikey=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Ticketmaster " + res.status);
    const j = await res.json();
    const evs = j._embedded?.events || [];
    return evs.map(e => ({
      name: e.name,
      date: e.dates?.start?.localDate,
      time: e.dates?.start?.localTime,
      venue: e._embedded?.venues?.[0]?.name || "",
      url: e.url,
      kind: "event"
    }));
  }

  async function fetchHolidays() {
    // Nager.Date — feriados nacionais, grátis e sem chave
    const year = new Date().getFullYear();
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BR`);
    if (!res.ok) throw new Error("Nager " + res.status);
    const today = new Date().toISOString().slice(0, 10);
    return (await res.json())
      .filter(h => h.date >= today)
      .slice(0, 6)
      .map(h => ({ name: h.localName, date: h.date, kind: "holiday" }));
  }

  function fmtDate(d) {
    if (!d) return "";
    const dt = new Date(d + "T00:00");
    return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  async function update() {
    const box = document.getElementById("events-list");
    try {
      const loc = await Geo.get();
      let items = null;
      try { items = await fetchTicketmaster(loc.lat, loc.lon); } catch (_) {}
      if (!items || items.length === 0) items = await fetchHolidays();

      box.innerHTML = "";
      if (!items.length) {
        box.innerHTML = `<div class="muted">Nenhum evento próximo</div>`;
        return [];
      }
      items.forEach(ev => {
        const el = ev.url ? document.createElement("a") : document.createElement("div");
        el.className = "event-item";
        if (ev.url) { el.href = ev.url; el.target = "_blank"; el.rel = "noopener"; }
        el.innerHTML =
          `<span class="ev-date">${fmtDate(ev.date)}</span>` +
          `<span class="ev-name">${ev.name}</span>` +
          `<span class="ev-meta">${ev.kind === "holiday" ? "Feriado" : (ev.venue || "")}${ev.time ? " · " + ev.time.slice(0,5) : ""}</span>`;
        box.appendChild(el);
      });
      return items;
    } catch (e) {
      console.warn("Erro nos eventos:", e);
      box.innerHTML = `<div class="muted">Eventos indisponíveis</div>`;
      return [];
    }
  }

  return { update };
})();
