// ===================================================================
//  App — orquestrador do painel J.A.R.V.I.S.
// ===================================================================

(function () {
  async function refreshWeather() {
    const w = await Weather.update();
    Assistant.remember("weather", w);
  }
  async function refreshCurrency() {
    const c = await Currency.update();
    Assistant.remember("currency", c);
  }
  async function refreshNews() {
    const n = await News.updateHeadlines();
    Assistant.remember("news", n);
  }
  async function refreshAI() {
    const a = await News.updateAI();
    Assistant.remember("ai", a);
  }
  async function refreshEvents() {
    const e = await Events.update();
    Assistant.remember("events", e);
  }

  function wireControls() {
    // barra de comando (texto)
    const input = document.getElementById("command-input");
    if (input) {
      input.addEventListener("keydown", e => {
        if (e.key === "Enter" && input.value.trim()) {
          Assistant.ask(input.value);
          input.value = "";
        }
      });
    }
    // microfone (voz)
    document.getElementById("mic-btn")?.addEventListener("click", () => Assistant.listen());
    // ligar/desligar voz
    const vb = document.getElementById("voice-btn");
    vb?.addEventListener("click", () => {
      const on = Voice.toggle();
      vb.classList.toggle("off", !on);
      vb.title = on ? "Voz ligada" : "Voz desligada";
    });
    // briefing
    document.getElementById("brief-btn")?.addEventListener("click", () => Assistant.briefing());
  }

  async function boot() {
    UI.status("Inicializando núcleo J.A.R.V.I.S. ...");
    Clock.start();
    Tasks.init();
    Settings.init();
    Chat.init();
    Wake.init();
    UI.startSystemMonitor();
    wireControls();
    Voice.loadVoices();

    // carrega em sequência para não sobrecarregar os proxies ao mesmo tempo
    UI.status("Sincronizando módulos...");
    for (const job of [refreshCurrency, refreshWeather, refreshEvents, refreshNews, refreshAI]) {
      try { await job(); } catch (_) {}
    }
    UI.status("Todos os sistemas operacionais.");

    // saudação inicial (após interação do usuário o áudio é liberado pelo navegador)
    const greet = () => {
      Voice.unlock();                 // libera o áudio (autoplay) no 1º gesto
      // Se a voz é ElevenLabs mas não há chave salva, abre as configurações.
      if (CONFIG.voice.engine === "eleven" &&
          !localStorage.getItem("jarvis.elevenKey") && !CONFIG.voice.eleven.apiKey) {
        UI.status("Para a voz do Optimus, salve sua chave ElevenLabs em ⚙ Configurações.");
        if (typeof Settings !== "undefined") Settings.open();
      }
      Assistant.handle("jarvis");
      setTimeout(() => Voice.speak("Recomendação de hoje: " + Assistant.aiPick()), 4000);
      document.removeEventListener("click", greet);
      document.removeEventListener("keydown", greet);
    };
    document.addEventListener("click", greet);
    document.addEventListener("keydown", greet);

    // atualizações periódicas
    setInterval(refreshWeather, CONFIG.refresh.weatherMin * 60000);
    setInterval(refreshCurrency, CONFIG.refresh.currencyMin * 60000);
    setInterval(refreshNews, CONFIG.refresh.newsMin * 60000);
    setInterval(refreshAI, CONFIG.refresh.newsMin * 60000);
    setInterval(refreshEvents, 60 * 60000);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
