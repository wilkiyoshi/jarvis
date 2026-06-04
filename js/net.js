// ===================================================================
//  Net — busca resiliente de JSON
//  Tenta direto; se falhar (bloqueio/CORS/rede), tenta via proxies CORS.
// ===================================================================

const Net = (() => {
  const PROXIES = [
    u => "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(u),
    u => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u),
    u => "https://corsproxy.io/?url=" + encodeURIComponent(u),
    u => "https://thingproxy.freeboard.io/fetch/" + u,
    u => "https://api.allorigins.win/get?url=" + encodeURIComponent(u)  // retorna {contents}
  ];

  // fetch com tempo-limite (não trava num proxy lento)
  async function fetchT(u, ms = 9000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    try { return await fetch(u, { signal: ctrl.signal }); }
    finally { clearTimeout(id); }
  }

  function parseMaybe(text) {
    // allorigins /get embrulha em {contents:"..."}; os demais devolvem JSON puro
    const obj = JSON.parse(text);
    if (obj && typeof obj.contents === "string") return JSON.parse(obj.contents);
    return obj;
  }

  async function getJSON(url) {
    let firstErr;
    // 1) tentativa direta (rápida quando não há bloqueio)
    try {
      const r = await fetchT(url);
      if (r.ok) return await r.json();
      firstErr = new Error("HTTP " + r.status);
    } catch (e) {
      firstErr = e;
    }
    // 2) fallback via proxies (contorna bloqueio de domínio/CORS)
    for (const make of PROXIES) {
      try {
        const r = await fetchT(make(url));
        if (r.ok) return parseMaybe(await r.text());
      } catch (_) { /* tenta o próximo */ }
    }
    throw firstErr || new Error("falha ao obter dados");
  }

  return { getJSON, PROXIES };
})();
