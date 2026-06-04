// ===================================================================
//  UI — utilidades de interface (legenda de fala, status, monitor)
// ===================================================================

const UI = (() => {
  function subtitle(text) {
    const el = document.getElementById("subtitle");
    if (!el) return;
    el.textContent = "J.A.R.V.I.S.: " + text;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 8000);
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

  return { subtitle, status, setListening, startSystemMonitor };
})();
