// ===================================================================
//  Assistant — cérebro do J.A.R.V.I.S.
//  Reconhece comandos (voz/texto), responde e fala com voz de Optimus.
// ===================================================================

const Assistant = (() => {
  let recognition = null;
  let listening = false;

  // cache das últimas leituras para respostas rápidas
  const memory = { weather: null, currency: null, news: [], ai: [], events: [] };
  function remember(k, v) { memory[k] = v; }

  // ---- Curadoria rotativa de temas de IA ("recomende assuntos") ----
  const AI_TOPICS = [
    "Os agentes autônomos de IA estão dominando 2026. Vale estudar frameworks de orquestração como o Claude Agent SDK.",
    "Modelos multimodais agora interpretam vídeo em tempo real. Recomendo acompanhar os avanços do Gemini e do GPT mais recente.",
    "RAG evoluiu para memória de longo prazo nos assistentes. Um tema quente para o seu próprio Jarvis.",
    "A geração de vídeo por IA, como Sora e Veo, mudou a produção de conteúdo. Sugiro explorar.",
    "Modelos open-source como Llama e DeepSeek se aproximam dos proprietários. Boa hora para rodar IA local.",
    "Engenharia de contexto e prompt caching reduzem custo e latência. Técnica essencial para apps de IA.",
    "Os MCPs, protocolos de contexto de modelo, padronizaram a conexão de ferramentas a assistentes. Recomendo dominar.",
    "Computer use, a IA controlando o computador, está saindo do laboratório. Fique de olho.",
    "IA de raciocínio com cadeia de pensamento extensa elevou a precisão em matemática e código."
  ];
  function aiPick() { return AI_TOPICS[Math.floor(Math.random() * AI_TOPICS.length)]; }

  // ---- Roteador de comandos --------------------------------------
  async function handle(raw) {
    const t = (raw || "").toLowerCase().trim();
    if (!t) return;
    UI.status("Comando: " + raw);

    // saudações
    if (/^(ol[áa]|oi|e a[íi]|hey|jarvis)\b/.test(t)) {
      return Voice.speak(`${Clock.greeting()}, ${CONFIG.userName}. Estou aqui. Como posso ajudar?`);
    }
    // hora/data
    if (/\b(hora|horas|que dia|data)\b/.test(t)) return Voice.speak(Clock.spoken());
    // clima
    if (/\b(tempo|clima|previs[ãa]o|temperatura|chuva|chover)\b/.test(t)) {
      const w = memory.weather || await Weather.update();
      if (w) return Voice.speak(`O tempo agora está ${w.d.toLowerCase()}, com ${w.temp} graus, sensação de ${w.feels} graus.`);
      return Voice.speak("Não consegui obter a previsão do tempo no momento.");
    }
    // moedas
    if (/\b(d[óo]lar|euro|libra|iene|moeda|c[âa]mbio|cota[çc][ãa]o|bitcoin|cripto)\b/.test(t)) {
      const c = memory.currency || await Currency.update();
      if (!c) return Voice.speak("As cotações estão indisponíveis agora.");
      if (t.includes("bitcoin") || t.includes("cripto")) {
        return Voice.speak(c.BTC ? `O Bitcoin está cotado a ${money(c.BTC)} reais.` : "Não obtive o preço do Bitcoin.");
      }
      const code = t.includes("euro") ? "EUR" : t.includes("libra") ? "GBP" : t.includes("iene") ? "JPY" : "USD";
      return Voice.speak(c[code] ? `O ${Currency.NAMES[code]} está cotado a ${money(c[code])} reais.` : "Não obtive essa cotação.");
    }
    // IA / novidades
    if (/\b(ia|intelig[êe]ncia|novidade|tend[êe]ncia|tecnologia|recomend)\b/.test(t)) {
      const ai = memory.ai.length ? memory.ai : await News.updateAI();
      const head = ai[0] ? `A manchete de IA do momento: ${ai[0].title}. ` : "";
      return Voice.speak(head + aiPick());
    }
    // eventos
    if (/\b(evento|agenda|feriado|show|perto|pr[óo]ximo)\b/.test(t)) {
      const ev = memory.events.length ? memory.events : await Events.update();
      if (!ev.length) return Voice.speak("Não encontrei eventos próximos.");
      return Voice.speak(`Próximo na sua região: ${ev[0].name}.`);
    }
    // notícias
    if (/\b(not[íi]cia|manchete|jornal|aconteceu)\b/.test(t)) {
      const n = memory.news.length ? memory.news : await News.updateHeadlines();
      if (!n.length) return Voice.speak("As notícias estão indisponíveis.");
      return Voice.speak(`Destaque do dia: ${n[0].title}.`);
    }
    // lembrete
    const lem = t.match(/\b(?:lembrar de|lembrete|tarefa|anota[r]?|adicionar)\s+(.*)/);
    if (lem && lem[1]) { Tasks.add(lem[1]); return Voice.speak(`Anotado: ${lem[1]}.`); }
    // briefing completo
    if (/\b(briefing|resumo|me atualiz|relat[óo]rio|bom dia jarvis)\b/.test(t)) return briefing();
    // ajuda
    if (/\b(ajuda|comandos|o que voc[êe] faz|help)\b/.test(t)) {
      return Voice.speak("Posso informar horas, clima, cotações, eventos, notícias e novidades de inteligência artificial. Também guardo lembretes e faço um briefing do dia. É só pedir.");
    }

    // fallback
    return Voice.speak(`Desculpe, ${CONFIG.userName}, não entendi o comando. Diga ajuda para ver o que posso fazer.`);
  }

  function money(n) { return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  // ---- Briefing completo do dia ----------------------------------
  async function briefing() {
    await Voice.speak(`${Clock.greeting()}, ${CONFIG.userName}. Iniciando o briefing diário.`);
    await Voice.speak(Clock.spoken());
    const w = memory.weather || await Weather.update();
    if (w) await Voice.speak(`Clima: ${w.d.toLowerCase()}, ${w.temp} graus.`);
    const c = memory.currency || await Currency.update();
    if (c && c.USD) await Voice.speak(`Dólar a ${money(c.USD)} reais, euro a ${money(c.EUR)} reais.`);
    const n = memory.news.length ? memory.news : await News.updateHeadlines();
    if (n[0]) await Voice.speak(`Manchete do dia: ${n[0].title}.`);
    const ev = memory.events.length ? memory.events : await Events.update();
    if (ev[0]) await Voice.speak(`Evento próximo: ${ev[0].name}.`);
    const p = Tasks.pending();
    if (p.length) await Voice.speak(`Você tem ${p.length} lembrete${p.length > 1 ? "s" : ""} pendente${p.length > 1 ? "s" : ""}.`);
    await Voice.speak("Recomendação de tecnologia: " + aiPick());
    return Voice.speak("Briefing concluído. Estou às ordens.");
  }

  // ---- Reconhecimento de voz -------------------------------------
  function initSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return false;
    recognition = new SR();
    recognition.lang = CONFIG.lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => { listening = true; UI.setListening(true); };
    recognition.onend = () => { listening = false; UI.setListening(false); };
    recognition.onerror = () => { listening = false; UI.setListening(false); };
    recognition.onresult = e => {
      const text = e.results[0][0].transcript;
      handle(text);
    };
    return true;
  }

  function listen() {
    if (!recognition && !initSpeech()) {
      return Voice.speak("Reconhecimento de voz não suportado neste navegador. Use a barra de comando.");
    }
    if (listening) { recognition.stop(); return; }
    try { recognition.start(); } catch (_) {}
  }

  return { handle, listen, briefing, remember, aiPick };
})();
