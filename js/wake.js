// ===================================================================
//  Wake — palavra de ativação ("Hey Jarvis") com escuta contínua
// ===================================================================

const Wake = (() => {
  let recognition = null;
  let enabled = false;
  let restartTimer = null;

  function build() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = CONFIG.lang;
    r.continuous = true;
    r.interimResults = false;
    r.onresult = onResult;
    r.onend = () => { if (enabled) scheduleRestart(); };
    r.onerror = () => { if (enabled) scheduleRestart(); };
    return r;
  }

  function scheduleRestart() {
    clearTimeout(restartTimer);
    restartTimer = setTimeout(() => { try { recognition.start(); } catch (_) {} }, 600);
  }

  function onResult(e) {
    // ignora enquanto o próprio Jarvis está falando (evita auto-disparo)
    if (Voice.isSpeaking && Voice.isSpeaking()) return;
    const last = e.results[e.results.length - 1];
    if (!last.isFinal) return;
    const text = last[0].transcript.toLowerCase().trim();
    const phrase = CONFIG.wakeWord.phrases.find(p => text.includes(p));
    if (!phrase) return;

    UI.status('Palavra de ativação detectada: "' + text + '"');
    // pega o que vem depois da palavra de ativação
    const after = text.split(phrase).pop().trim().replace(/^[,.\s]+/, "");
    if (after.length > 1) {
      Assistant.ask(after);             // ex.: "jarvis, como está o tempo" -> IA
    } else {
      Voice.speak(`Sim, ${CONFIG.userName}?`);  // só chamou o nome
    }
  }

  function start() {
    if (!recognition) recognition = build();
    if (!recognition) {
      Voice.speak("Escuta contínua não é suportada neste navegador.");
      return false;
    }
    enabled = true;
    try { recognition.start(); } catch (_) {}
    UI.status('Palavra de ativação ativa — diga "Hey Jarvis".');
    return true;
  }

  function stop() {
    enabled = false;
    clearTimeout(restartTimer);
    if (recognition) { try { recognition.stop(); } catch (_) {} }
    UI.status("Palavra de ativação desativada.");
  }

  function toggle(btn) {
    if (enabled) { stop(); btn?.classList.remove("active"); return false; }
    const ok = start();
    if (ok) btn?.classList.add("active");
    return ok;
  }

  function init() {
    const btn = document.getElementById("wake-btn");
    btn?.addEventListener("click", () => toggle(btn));
    if (CONFIG.wakeWord.enabled) toggle(btn);
  }

  return { init, start, stop, toggle };
})();
