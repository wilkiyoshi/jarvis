// ===================================================================
//  Settings — gerencia as chaves de API (ElevenLabs e Claude/Anthropic)
//  As chaves ficam apenas no navegador (localStorage), nunca no GitHub.
// ===================================================================

const Settings = (() => {
  const E_KEY = "jarvis.elevenKey";       // mesma chave usada por voice.js
  const A_KEY = "jarvis.anthropicKey";    // mesma chave usada por chat.js
  const G_KEY = "jarvis.gcloudKey";       // mesma chave usada por voice.js (gcloud)

  function fill() {
    const e = document.getElementById("set-eleven");
    const a = document.getElementById("set-claude");
    const g = document.getElementById("set-gcloud");
    if (e) e.value = localStorage.getItem(E_KEY) || "";
    if (a) a.value = localStorage.getItem(A_KEY) || "";
    if (g) g.value = localStorage.getItem(G_KEY) || "";
  }

  function status(t) {
    const s = document.getElementById("set-status");
    if (s) s.textContent = t;
  }

  function open() { document.getElementById("settings-overlay")?.classList.add("show"); fill(); }
  function close() { document.getElementById("settings-overlay")?.classList.remove("show"); }
  function toggle() {
    const o = document.getElementById("settings-overlay");
    o.classList.contains("show") ? close() : open();
  }

  function save() {
    const e = (document.getElementById("set-eleven").value || "").trim();
    const a = (document.getElementById("set-claude").value || "").trim();
    const g = (document.getElementById("set-gcloud").value || "").trim();
    e ? localStorage.setItem(E_KEY, e) : localStorage.removeItem(E_KEY);
    a ? localStorage.setItem(A_KEY, a) : localStorage.removeItem(A_KEY);
    g ? localStorage.setItem(G_KEY, g) : localStorage.removeItem(G_KEY);
    status("Chaves salvas neste navegador.");
    setTimeout(close, 900);
  }

  function clearAll() {
    localStorage.removeItem(E_KEY);
    localStorage.removeItem(A_KEY);
    localStorage.removeItem(G_KEY);
    fill();
    status("Chaves removidas.");
  }

  function init() {
    document.getElementById("settings-btn")?.addEventListener("click", toggle);
    document.getElementById("settings-close")?.addEventListener("click", close);
    document.getElementById("set-save")?.addEventListener("click", save);
    document.getElementById("set-clear")?.addEventListener("click", clearAll);
    document.getElementById("set-toggle")?.addEventListener("change", ev => {
      const type = ev.target.checked ? "text" : "password";
      const e = document.getElementById("set-eleven");
      const a = document.getElementById("set-claude");
      const g = document.getElementById("set-gcloud");
      if (e) e.type = type;
      if (a) a.type = type;
      if (g) g.type = type;
    });
  }

  return { init, open, close };
})();
