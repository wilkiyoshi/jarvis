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
    if (!key || !e.voiceId) return speakBrowser(text);
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${e.voiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": key,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text,
            model_id: e.modelId,
            voice_settings: { stability: 0.6, similarity_boost: 0.85, style: 0.3 }
          })
        }
      );
      if (!res.ok) throw new Error("ElevenLabs " + res.status);
      const buf = await res.arrayBuffer();
      const blob = new Blob([buf], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      return new Promise(r => (audio.onended = r));
    } catch (err) {
      console.warn("Falha ElevenLabs, usando voz do navegador:", err);
      return speakBrowser(text);
    }
  }

  function speak(text) {
    if (!enabled || !text) return Promise.resolve();
    UI.subtitle(text);
    // fila para não sobrepor falas
    queue = queue
      .then(() => { speaking = true; })
      .then(() =>
        CONFIG.voice.engine === "eleven" ? speakEleven(text) : speakBrowser(text)
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

  return { speak, toggle, isEnabled, isSpeaking, loadVoices };
})();
