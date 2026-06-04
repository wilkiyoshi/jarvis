// ===================================================================
//  JARVIS - Configuração central
//  Ajuste aqui as chaves de API e preferências do seu painel.
// ===================================================================

const CONFIG = {
  // Nome do usuário (J.A.R.V.I.S. vai te chamar assim)
  userName: "Senhor",

  // Idioma das falas e da síntese de voz
  lang: "pt-BR",

  // ---------------------------------------------------------------
  //  VOZ — estilo Optimus Prime
  // ---------------------------------------------------------------
  voice: {
    // "browser"  -> usa a Web Speech API (grátis, voz grave aproximada)
    // "eleven"   -> usa ElevenLabs para a voz AUTÊNTICA do Optimus Prime
    engine: "browser",

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
      apiKey: "",            // <-- coloque sua chave aqui
      voiceId: "",           // <-- coloque o ID da voz Optimus Prime
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

  // Atualizações automáticas (em minutos)
  refresh: {
    weatherMin: 15,
    currencyMin: 10,
    newsMin: 20
  }
};
