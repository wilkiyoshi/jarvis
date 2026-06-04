// ===================================================================
//  Chat — conversa com a IA (Claude / Anthropic), com resposta falada
//  Usa acesso direto do navegador à API da Anthropic.
// ===================================================================

const Chat = (() => {
  const history = [];   // [{role:"user"|"assistant", content:"..."}]

  function configured() { return !!CONFIG.chat.apiKey; }

  async function ask(text) {
    history.push({ role: "user", content: text });
    appendBubble("user", text);
    const thinking = appendBubble("assistant", "…");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": CONFIG.chat.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: CONFIG.chat.model,
          max_tokens: CONFIG.chat.maxTokens,
          system: CONFIG.chat.system,
          messages: history
        })
      });
      if (!res.ok) throw new Error("Anthropic " + res.status + " — " + (await res.text()));
      const data = await res.json();
      const reply = (data.content || []).map(b => b.text || "").join(" ").trim() || "…";
      history.push({ role: "assistant", content: reply });
      thinking.querySelector(".chat-text").textContent = reply;
      Voice.speak(reply);
      return reply;
    } catch (e) {
      console.warn("Erro no chat:", e);
      thinking.querySelector(".chat-text").textContent =
        "Falha ao falar com a IA. Verifique a chave da Anthropic em config.js.";
      Voice.speak("Não consegui acessar a inteligência artificial. Verifique a configuração.");
      return null;
    }
  }

  function appendBubble(role, text) {
    const box = document.getElementById("chat-log");
    const el = document.createElement("div");
    el.className = "chat-bubble " + role;
    el.innerHTML = `<span class="chat-who">${role === "user" ? CONFIG.userName : "J.A.R.V.I.S."}</span>` +
                   `<span class="chat-text">${text}</span>`;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
  }

  function open() { document.getElementById("chat-overlay")?.classList.add("show"); document.getElementById("chat-text-input")?.focus(); }
  function close() { document.getElementById("chat-overlay")?.classList.remove("show"); }
  function toggle() {
    const o = document.getElementById("chat-overlay");
    o.classList.contains("show") ? close() : open();
  }

  function init() {
    document.getElementById("chat-btn")?.addEventListener("click", toggle);
    document.getElementById("chat-close")?.addEventListener("click", close);
    const input = document.getElementById("chat-text-input");
    input?.addEventListener("keydown", e => {
      if (e.key === "Enter" && input.value.trim()) {
        if (!configured()) {
          appendBubble("assistant", "Para conversar comigo, configure sua chave da Anthropic em js/config.js → chat.apiKey.");
        } else {
          ask(input.value.trim());
        }
        input.value = "";
      }
    });
  }

  return { init, ask, open, close, configured };
})();
