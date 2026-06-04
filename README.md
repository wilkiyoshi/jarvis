# J.A.R.V.I.S. — Assistente Pessoal estilo Iron Man

Um painel HUD futurista (inspirado na interface do Tony Stark) que fala com você
com **voz grave estilo Optimus Prime**, traz **clima, cotações de moedas, eventos
próximos, feed de notícias do dia, novidades de Inteligência Artificial, data e
hora** — e responde a comandos por **voz ou texto**.

## ▶ Como rodar

É 100% web (HTML/CSS/JS puro), sem build. Como usa microfone e geolocalização,
rode a partir de um servidor local (não abra o arquivo direto com `file://`):

```bash
# dentro da pasta do projeto
python3 -m http.server 8080
# depois abra http://localhost:8080 no Chrome ou Edge
```

> Dica: o áudio só é liberado pelo navegador **após o primeiro clique/tecla** na
> página — é quando o Jarvis te dá as boas-vindas. Isso é uma regra dos navegadores.

## 🗣️ Voz do Optimus Prime

Por padrão usa a **Web Speech API** do navegador, já configurada com tom **grave e
cadência lenta** (em `js/config.js` → `voice.browser`) para soar como o Optimus.

Para a **voz autêntica e realista** do Optimus Prime:

1. Crie uma conta em [elevenlabs.io](https://elevenlabs.io) e gere uma **API key**.
2. Escolha/clone uma voz "Optimus Prime" na biblioteca e copie o **Voice ID**.
3. Em `js/config.js`:
   ```js
   voice: {
     engine: "eleven",
     eleven: { apiKey: "SUA_CHAVE", voiceId: "ID_DA_VOZ" }
   }
   ```

## 🎛️ Comandos (voz ou barra de comando)

| Diga / digite                         | O Jarvis faz |
|---------------------------------------|--------------|
| "olá" / "jarvis"                      | cumprimenta você |
| "que horas são"                       | informa data e hora |
| "como está o tempo"                   | resume o clima |
| "cotação do dólar" / "bitcoin"        | informa a cotação |
| "notícias"                            | manchete do dia |
| "novidades de IA" / "recomende"       | tendências de inteligência artificial |
| "eventos perto de mim"                | próximos eventos/feriados |
| "lembrar de comprar leite"            | cria um lembrete |
| "briefing" / "me atualize"            | resumo completo do dia |
| "ajuda"                               | lista o que ele faz |

Botões no topo: **Briefing**, **Chat** ⌬, **palavra de ativação** 👂,
ligar/desligar **voz** 🔊 e **microfone** 🎙️.

### 💬 Chat com Claude (IA)

Clique em **⌬ CHAT** para conversar com a IA por texto ou voz — as respostas são
faladas pelo Jarvis. Perguntas abertas digitadas na barra de comando principal
também são encaminhadas à IA quando ela está configurada.

1. Gere uma chave em [console.anthropic.com](https://console.anthropic.com) → API Keys.
2. Em `js/config.js` → `chat.apiKey: "SUA_CHAVE"` (e, se quiser, ajuste `chat.model`).

> A chave fica no navegador (uso pessoal). Para produção, prefira um backend.

### 👂 Palavra de ativação "Hey Jarvis"

Clique no botão 👂 (ou deixe `wakeWord.enabled: true` em `config.js`) para o Jarvis
escutar continuamente. Diga **"Hey Jarvis, como está o tempo"** e ele executa o
comando. A escuta é pausada enquanto ele fala, para não se autoativar.

## 🔌 APIs usadas (todas gratuitas)

| Recurso   | Fonte                         | Precisa de chave? |
|-----------|-------------------------------|-------------------|
| Clima     | Open-Meteo                    | Não |
| Local     | BigDataCloud (reverse geocode)| Não |
| Moedas    | Frankfurter (BCE)             | Não |
| Bitcoin   | CoinGecko                     | Não |
| Notícias  | Google Notícias RSS (proxy)   | Não |
| Eventos   | Nager.Date (feriados)         | Não |
| Eventos+  | Ticketmaster (shows reais)    | Opcional (`config.js`) |

## ⚙️ Personalização (`js/config.js`)

- `userName` — como o Jarvis te chama.
- `location` — geolocalização automática ou cidade fixa.
- `currency.watch` — quais moedas acompanhar.
- `refresh` — intervalo de atualização de cada módulo.

## 💡 Recursos sugeridos para evoluir seu painel

Já incluídos: monitor de sistema, reator/relógio animado, lembretes, ticker de
notícias, briefing falado, **chat com Claude** e **palavra de ativação "Hey Jarvis"**.
Próximas ideias de alto valor:

- **Integração com agenda/Google Calendar** (eventos reais seus).
- **Mercado financeiro**: índices (Ibovespa, S&P 500) e suas ações favoritas.
- **Resumo de e-mails / Gmail** e clima de trânsito no trajeto.
- **Pomodoro / modo foco** com a voz marcando os blocos.
- **Integração com casa inteligente** (luzes, temperatura) via webhooks.
- **Chat com LLM** (Claude/GPT) para perguntas abertas e contexto.
- **Qualidade do ar e índice UV** no painel de clima.
- **Modo "Mark" temático** (cores trocáveis: azul/dourado/vermelho).

## 📁 Estrutura

```
index.html          interface (HUD)
css/style.css        estilo Iron Man
js/config.js         configurações e chaves
js/voice.js          voz (Optimus Prime: navegador ou ElevenLabs)
js/assistant.js      cérebro: comandos, respostas, briefing
js/weather.js        clima (Open-Meteo)
js/currency.js       cotações (Frankfurter + CoinGecko)
js/news.js           notícias e tendências de IA
js/events.js         eventos e feriados
js/tasks.js          lembretes
js/chat.js           chat com a IA (Claude/Anthropic)
js/wake.js           palavra de ativação "Hey Jarvis"
js/geo.js            localização
js/clock.js          data e hora
js/ui.js             utilidades de interface
js/app.js            orquestrador
```

---
*Não há limites para os sonhos humanos. — J.A.R.V.I.S.*
