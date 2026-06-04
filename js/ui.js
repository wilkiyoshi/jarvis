// ===================================================================
//  UI — utilidades de interface (legenda de fala, status, monitor)
// ===================================================================

const UI = (() => {
  function subtitle(text) {
    centerAnswer(text);                 // mostra de forma persistente no centro
    const el = document.getElementById("subtitle");
    if (!el) return;
    el.textContent = "J.A.R.V.I.S.: " + text;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 8000);
  }

  // Área central persistente de resposta -----------------------------
  function thinking(question) {
    const box = document.getElementById("center-response");
    if (!box) return;
    box.innerHTML = "";
    const q = document.createElement("div"); q.className = "cr-q"; q.textContent = question;
    const a = document.createElement("div"); a.className = "cr-a"; a.textContent = "…";
    box.appendChild(q); box.appendChild(a);
  }

  function centerAnswer(text) {
    const box = document.getElementById("center-response");
    if (!box) return;
    let a = box.querySelector(".cr-a");
    if (!a) { box.innerHTML = ""; a = document.createElement("div"); a.className = "cr-a"; box.appendChild(a); }
    a.textContent = text;
    box.scrollTop = box.scrollHeight;
  }

  function status(text) {
    const el = document.getElementById("status-line");
    if (el) el.textContent = text;
  }

  function setListening(on) {
    document.getElementById("mic-btn")?.classList.toggle("listening", on);
    document.body.classList.toggle("jarvis-listening", on);
  }

  // Monitor de sistema (simulado — efeito visual estilo Iron Man)
  function startSystemMonitor() {
    const cpuV = document.getElementById("cpu-val");
    const ramV = document.getElementById("ram-val");
    const netV = document.getElementById("net-val");
    const ring = document.getElementById("cpu-ring");
    function up() {
      const cpu = 5 + Math.round(Math.random() * 35 + (Math.sin(Date.now() / 4000) + 1) * 12);
      const ram = 40 + Math.round(Math.random() * 25);
      const net = (Math.random() * 4).toFixed(1);
      if (cpuV) cpuV.textContent = cpu + "%";
      if (ramV) ramV.textContent = ram + "%";
      if (netV) netV.textContent = net + " MB/s";
      if (ring) ring.style.strokeDashoffset = String(283 - (283 * cpu) / 100);
    }
    up();
    setInterval(up, 2000);
  }

  return { subtitle, thinking, centerAnswer, status, setListening, startSystemMonitor };
})();
