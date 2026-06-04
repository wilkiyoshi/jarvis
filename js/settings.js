// ===================================================================
//  Settings — gerencia as chaves de API (ElevenLabs e Claude/Anthropic)
//  As chaves ficam apenas no navegador (localStorage), nunca no GitHub.
// ===================================================================

const Settings = (() => {
  const A_KEY = "jarvis.anthropicKey";    // mesma chave usada por chat.js

  function fill() {
    const a = document.getElementById("set-claude");
    if (a) a.value = localStorage.getItem(A_KEY) || "";
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
    const a = (document.getElementById("set-claude").value || "").trim();
    a ? localStorage.setItem(A_KEY, a) : localStorage.removeItem(A_KEY);
    status("Chave salva neste navegador.");
    setTimeout(close, 900);
  }

  function clearAll() {
    localStorage.removeItem(A_KEY);
    fill();
    status("Chave removida.");
  }

  function init() {
    document.getElementById("settings-btn")?.addEventListener("click", toggle);
    document.getElementById("settings-close")?.addEventListener("click", close);
    document.getElementById("set-save")?.addEventListener("click", save);
    document.getElementById("set-clear")?.addEventListener("click", clearAll);
    document.getElementById("set-toggle")?.addEventListener("change", ev => {
      const type = ev.target.checked ? "text" : "password";
      const a = document.getElementById("set-claude");
      if (a) a.type = type;
    });
  }

  return { init, open, close };
})();
