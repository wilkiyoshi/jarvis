// ===================================================================
//  Clock — data, hora e "Galactic Standard Time"
// ===================================================================

const Clock = (() => {
  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const DIAS = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];

  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    document.getElementById("clock-time").textContent = `${hh}:${mm}`;
    document.getElementById("clock-secs").textContent = ss;
    document.getElementById("clock-date").textContent =
      `${DIAS[now.getDay()]}, ${now.getDate()} de ${MESES[now.getMonth()]} de ${now.getFullYear()}`;

    // Galactic Standard Time = UTC (homenagem à interface do Jarvis)
    const ug = String(now.getUTCHours()).padStart(2, "0");
    const um = String(now.getUTCMinutes()).padStart(2, "0");
    const us = String(now.getUTCSeconds()).padStart(2, "0");
    const gst = document.getElementById("gst");
    if (gst) gst.textContent = `${ug}:${um}:${us} GST`;
  }

  function start() { tick(); setInterval(tick, 1000); }

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }

  function spoken() {
    const now = new Date();
    return `Agora são ${now.getHours()} horas e ${now.getMinutes()} minutos, de ${DIAS[now.getDay()]}, ${now.getDate()} de ${MESES[now.getMonth()]}.`;
  }

  return { start, greeting, spoken };
})();
