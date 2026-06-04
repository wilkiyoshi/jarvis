// ===================================================================
//  Net — busca resiliente de JSON
//  Tenta direto; se falhar (bloqueio/CORS/rede), tenta via proxies CORS.
// ===================================================================

const Net = (() => {
  const PROXIES = [
    u => "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(u),
    u => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u),
    u => "https://corsproxy.io/?url=" + encodeURIComponent(u),
    u => "https://thingproxy.freeboard.io/fetch/" + u
  ];

  async function getJSON(url) {
    let firstErr;
    // 1) tentativa direta (rápida quando não há bloqueio)
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
      firstErr = new Error("HTTP " + r.status);
    } catch (e) {
      firstErr = e;
    }
    // 2) fallback via proxies (contorna bloqueio de domínio/CORS)
    for (const make of PROXIES) {
      try {
        const r = await fetch(make(url));
        if (r.ok) return await r.json();
      } catch (_) { /* tenta o próximo */ }
    }
    throw firstErr || new Error("falha ao obter dados");
  }

  return { getJSON, PROXIES };
})();
