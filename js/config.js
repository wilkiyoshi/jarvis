// ===================================================================
//  JARVIS - Configuração central
//  Ajuste aqui as chaves de API e preferências do seu painel.
// ===================================================================

const CONFIG = {
  // Nome do usuário (J.A.R.V.I.S. vai te chamar assim)
  userName: "Senhor Will",

  // Idioma das falas e da síntese de voz
  lang: "pt-BR",

  // ---------------------------------------------------------------
  //  VOZ — estilo Optimus Prime
  // ---------------------------------------------------------------
  voice: {
    // "gcloud"   -> Google Cloud TTS (voz MASCULINA pt-BR; precisa de chave grátis) — PADRÃO
    // "google"   -> Google Translate TTS (grátis, sem chave; voz feminina)
    // "browser"  -> Web Speech API (voz do sistema)
    // "eleven"   -> ElevenLabs (voz do Optimus Prime; precisa de chave)
    engine: "gcloud",

    // Google Cloud TTS — voz masculina, velocidade normal.
    // Sem a chave salva em ⚙, cai automaticamente na voz grátis (Translate).
    gcloud: {
      languageCode: "pt-BR",
      voiceName: "pt-BR-Wavenet-B",  // masculina (alt.: pt-BR-Neural2-B, pt-BR-Standard-B)
      rate: 1.0,                     // velocidade normal
      pitch: -2.0                    // levemente mais grave (0 = neutro)
    },

    // Google Translate TTS (grátis, sem chave). Voz feminina, velocidade normal.
    google: {
      lang: "pt-BR",
      rate: 1.0
    },

    // Parâmetros da voz do navegador (tom grave e cadência lenta = Optimus)
    browser: {
      rate: 0.85,   // velocidade (mais lento = mais imponente)
      pitch: 0.5,   // tom (mais grave = Optimus Prime)
      volume: 1.0,
      // Trecho do nome da voz preferida (procura entre as vozes do SO)
      preferVoiceContains: ["Google português do Brasil", "Luciana", "Daniel", "male", "masculino"]
    },

    // ElevenLabs (voz realista do Optimus Prime).
    // Crie uma conta gratuita em https://elevenlabs.io, gere uma API key
    // e clone/escolha uma voz do Optimus Prime na biblioteca.
    eleven: {
      // A chave NÃO fica aqui: o painel pede no navegador e guarda só localmente.
      apiKey: "",
      voiceId: "aU2vcrnwi348Gnc2Y1si",   // voz fixada (Optimus Prime)
      modelId: "eleven_multilingual_v2"
    }
  },

  // ---------------------------------------------------------------
  //  LOCALIZAÇÃO — usada no clima e nos eventos próximos
  // ---------------------------------------------------------------
  location: {
    // Se useGeolocation = true, tenta pegar a posição do navegador.
    // Se falhar (ou false), usa a cidade abaixo como fallback.
    useGeolocation: true,
    fallbackCity: "São Paulo",
    fallbackLat: -23.5505,
    fallbackLon: -46.6333
  },

  // ---------------------------------------------------------------
  //  MOEDAS — base BRL por padrão (Real)
  // ---------------------------------------------------------------
  currency: {
    base: "BRL",
    watch: ["USD", "EUR", "GBP", "JPY", "CHF", "BTC"]
  },

  // ---------------------------------------------------------------
  //  EVENTOS PRÓXIMOS (opcional)
  //  A API da Ticketmaster é gratuita: https://developer.ticketmaster.com
  // ---------------------------------------------------------------
  events: {
    ticketmasterApiKey: ""   // <-- opcional. Sem chave, mostra feriados/datas.
  },

  // ---------------------------------------------------------------
  //  CHAT COM CLAUDE (IA) — perguntas abertas faladas
  //  Crie uma chave em https://console.anthropic.com (API Keys).
  // ---------------------------------------------------------------
  chat: {
    // NUNCA comite sua chave aqui. Deixe vazio: o painel vai pedir a chave
    // no navegador e guardá-la apenas localmente (localStorage), com segurança.
    apiKey: "",
    model: "claude-sonnet-4-6",       // rápido p/ voz; troque por um Opus se quiser mais profundidade
    maxTokens: 400,
    // Personalidade do assistente
    system:
      "Você é J.A.R.V.I.S., o assistente pessoal do estilo Homem de Ferro. " +
      "Responda em português do Brasil, de forma educada, concisa e direta, " +
      "tratando o usuário por 'Senhor'. Suas respostas serão lidas em voz alta, " +
      "então evite listas longas, markdown e use frases curtas e naturais."
  },

  // ---------------------------------------------------------------
  //  PALAVRA DE ATIVAÇÃO ("Hey Jarvis")
  // ---------------------------------------------------------------
  wakeWord: {
    enabled: false,                   // ligue pelo botão no topo ou deixe true
    phrases: ["jarvis", "hey jarvis", "ei jarvis", "ô jarvis", "rivis"]
  },

  // Atualizações automáticas (em minutos)
  refresh: {
    weatherMin: 15,
    currencyMin: 10,
    newsMin: 20
  }
};
