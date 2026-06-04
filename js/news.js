// ===================================================================
//  News — feed do dia + recomendações de IA
//  Usa RSS do Google Notícias via proxy CORS (allorigins), sem chave.
// ===================================================================

const News = (() => {
  // Vários proxies CORS — se um falhar/estiver instável, tenta o próximo.
  const PROXIES = [
    u => "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(u),
    u => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u),
    u => "https://corsproxy.io/?url=" + encodeURIComponent(u),
    u => "https://thingproxy.freeboard.io/fetch/" + u
  ];

  function parseItems(text, limit) {
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const items = [...xml.querySelectorAll("item")];
    if (!items.length) throw new Error("feed vazio");
    return items.slice(0, limit).map(item => {
      const title = item.querySelector("title")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "#";
      const source = item.querySelector("source")?.textContent || "";
      const pub = item.querySelector("pubDate")?.textContent || "";
      return { title: title.replace(/ - [^-]+$/, ""), link, source, pub };
    });
  }

  async function fetchRSS(rssUrl, limit = 8) {
    let lastErr;
    for (const make of PROXIES) {
      try {
        const res = await fetch(make(rssUrl));
        if (!res.ok) throw new Error("HTTP " + res.status);
        return parseItems(await res.text(), limit);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("todos os proxies falharam");
  }

  function googleNews(query) {
    return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  }

  // ---- Feed geral do dia -----------------------------------------
  async function updateHeadlines() {
    const box = document.getElementById("news-list");
    const ticker = document.getElementById("ticker-content");
    try {
      const items = await fetchRSS(
        "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419", 8
      );
      box.innerHTML = "";
      items.forEach(n => box.appendChild(newsItem(n)));
      ticker.textContent = items.map(n => n.title).join("   ◆   ");
      return items;
    } catch (e) {
      console.warn("Erro nas notícias:", e);
      box.innerHTML = `<div class="muted">Erro: ${e.message || e}</div>`;
      return [];
    }
  }

  // ---- Recomendações de IA ---------------------------------------
  async function updateAI() {
    const box = document.getElementById("ai-list");
    try {
      const items = await fetchRSS(
        googleNews("inteligência artificial OR \"IA\" OR LLM OR OpenAI OR Anthropic OR Gemini"),
        7
      );
      box.innerHTML = "";
      items.forEach(n => box.appendChild(newsItem(n, true)));
      return items;
    } catch (e) {
      console.warn("Erro nas notícias de IA:", e);
      box.innerHTML = `<div class="muted">Erro: ${e.message || e}</div>`;
      return [];
    }
  }

  function newsItem(n, ai) {
    const a = document.createElement("a");
    a.className = "news-item" + (ai ? " ai" : "");
    a.href = n.link;
    a.target = "_blank";
    a.rel = "noopener";
    const time = n.pub ? new Date(n.pub).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
    a.innerHTML =
      `<span class="news-bullet">▸</span>` +
      `<span class="news-title">${n.title}</span>` +
      `<span class="news-meta">${n.source}${time ? " · " + time : ""}</span>`;
    return a;
  }

  return { updateHeadlines, updateAI, fetchRSS, googleNews };
})();
