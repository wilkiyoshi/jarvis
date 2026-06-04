// ===================================================================
//  Voice — síntese de voz estilo Optimus Prime
//  Suporta Web Speech API (grátis) e ElevenLabs (voz autêntica).
// ===================================================================

const Voice = (() => {
  let voices = [];
  let chosenVoice = null;
  let enabled = true;
  let speaking = false;
  let queue = Promise.resolve();

  function loadVoices() {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const prefs = CONFIG.voice.browser.preferVoiceContains;
    // tenta achar uma voz que combine com as preferências (de preferência grave/masculina)
    chosenVoice =
      voices.find(v => prefs.some(p => v.name.toLowerCase().includes(p.toLowerCase()))) ||
      voices.find(v => v.lang && v.lang.startsWith("pt")) ||
      voices[0] ||
      null;
  }

  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speakBrowser(text) {
    return new Promise(resolve => {
      if (!window.speechSynthesis) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      const b = CONFIG.voice.browser;
      u.lang = CONFIG.lang;
      u.rate = b.rate;
      u.pitch = b.pitch;
      u.volume = b.volume;
      if (chosenVoice) u.voice = chosenVoice;
      u.onend = resolve;
      u.onerror = resolve;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  }

  const ELEVEN_STORE = "jarvis.elevenKey";
  let elevenDeclined = false;

  // ---- Desbloqueio de áudio (autoplay) ----------------------------
  // O áudio da ElevenLabs chega de forma assíncrona; sem desbloquear no
  // primeiro gesto do usuário, o navegador barra a reprodução.
  let actx = null;
  function audioCtx() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (_) { actx = null; }
    }
    return actx;
  }
  function unlock() {
    const c = audioCtx();
    if (c && c.state === "suspended") c.resume().catch(() => {});
  }

  function elevenKey() {
    return localStorage.getItem(ELEVEN_STORE) || CONFIG.voice.eleven.apiKey || "";
  }
  function ensureElevenKey() {
    let k = elevenKey();
    if (k) return k;
    if (elevenDeclined) return "";
    k = prompt(
      "Cole sua chave da ElevenLabs (para a voz do Optimus Prime).\n" +
      "Ela fica salva apenas neste navegador e nunca vai para o GitHub."
    );
    if (k && k.trim()) { localStorage.setItem(ELEVEN_STORE, k.trim()); return k.trim(); }
    elevenDeclined = true;
    return "";
  }

  async function speakEleven(text) {
    const e = CONFIG.voice.eleven;
    const key = ensureElevenKey();
    if (!key) {
      UI.status("Voz ElevenLabs: defina a chave em ⚙ Configurações (usando voz do navegador).");
      return speakBrowser(text);
    }
    if (!e.voiceId) return speakBrowser(text);
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${e.voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
          },
          body: JSON.stringify({
            text,
            model_id: e.modelId,
            voice_settings: { stability: 0.6, similarity_boost: 0.85, style: 0.3 }
          })
        }
      );
      if (!res.ok) {
        let detail = "";
        try { detail = (await res.text()).slice(0, 160); } catch (_) {}
        throw new Error("HTTP " + res.status + (detail ? " — " + detail : ""));
      }
      const buf = await res.arrayBuffer();
      // Reproduz via Web Audio (contorna o bloqueio de autoplay assíncrono)
      const c = audioCtx();
      if (c) {
        if (c.state === "suspended") { try { await c.resume(); } catch (_) {} }
        const audioBuf = await c.decodeAudioData(buf.slice(0));
        const node = c.createBufferSource();
        node.buffer = audioBuf;
        node.connect(c.destination);
        node.start();
        return new Promise(r => { node.onended = r; });
      }
      // Fallback: elemento de áudio comum
      const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
      const audio = new Audio(url);
      await audio.play();
      return new Promise(r => { audio.onended = () => { URL.revokeObjectURL(url); r(); }; });
    } catch (err) {
      console.warn("Falha ElevenLabs:", err);
      UI.status("Voz ElevenLabs falhou (" + (err.message || err) + "). Usando voz do navegador.");
      return speakBrowser(text);
    }
  }

  // ---- Google Translate TTS (grátis, sem chave) -------------------
  function chunkText(text, max) {
    const words = String(text).split(/\s+/);
    const out = []; let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > max) { if (cur) out.push(cur.trim()); cur = w; }
      else cur += " " + w;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  async function playBuffer(buf) {
    const c = audioCtx();
    const rate = (CONFIG.voice.google && CONFIG.voice.google.rate) || 0.85;
    if (c) {
      if (c.state === "suspended") { try { await c.resume(); } catch (_) {} }
      const ab = await c.decodeAudioData(buf.slice(0));
      const node = c.createBufferSource();
      node.buffer = ab;
      node.playbackRate.value = rate;   // < 1 = mais grave e lento
      node.connect(c.destination);
      node.start();
      return new Promise(r => { node.onended = r; });
    }
    const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
    const a = new Audio(url); a.playbackRate = rate;
    await a.play();
    return new Promise(r => { a.onended = () => { URL.revokeObjectURL(url); r(); }; });
  }

  async function speakGoogle(text) {
    const lang = (CONFIG.voice.google && CONFIG.voice.google.lang) || CONFIG.lang;
    try {
      for (const ch of chunkText(text, 190)) {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob` +
          `&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(ch)}`;
        const buf = await Net.getArrayBuffer(url);
        await playBuffer(buf);
      }
    } catch (err) {
      console.warn("Falha Google TTS:", err);
      UI.status("Voz Google falhou (" + (err.message || err) + "). Usando voz do navegador.");
      return speakBrowser(text);
    }
  }

  function speak(text) {
    if (!enabled || !text) return Promise.resolve();
    UI.subtitle(text);
    const engine = CONFIG.voice.engine;
    // fila para não sobrepor falas
    queue = queue
      .then(() => { speaking = true; })
      .then(() =>
        engine === "eleven" ? speakEleven(text) :
        engine === "google" ? speakGoogle(text) :
        speakBrowser(text)
      )
      .then(() => { speaking = false; });
    return queue;
  }

  function toggle() {
    enabled = !enabled;
    if (!enabled && window.speechSynthesis) window.speechSynthesis.cancel();
    return enabled;
  }

  function isEnabled() { return enabled; }
  function isSpeaking() { return speaking; }

  return { speak, toggle, isEnabled, isSpeaking, loadVoices, unlock };
})();
