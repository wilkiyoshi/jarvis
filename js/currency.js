// ===================================================================
//  Currency — cotações via Frankfurter (BCE, grátis) + cripto via CoinGecko
// ===================================================================

const Currency = (() => {
  const NAMES = {
    USD: "Dólar", EUR: "Euro", GBP: "Libra", JPY: "Iene",
    CHF: "Franco", CAD: "Dólar Can.", AUD: "Dólar Aus.", BTC: "Bitcoin"
  };
  const FLAG = {
    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
    CHF: "🇨🇭", CAD: "🇨🇦", AUD: "🇦🇺", BTC: "₿"
  };

  function fmt(n) {
    return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }

  async function fetchFiat(base, symbols) {
    // Frankfurter dá quantos "symbols" por 1 base. Queremos quanto vale 1 symbol em base.
    const url = `https://api.frankfurter.app/latest?from=${base}&to=${symbols.join(",")}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Frankfurter " + res.status);
    const j = await res.json();
    const out = {};
    for (const s of symbols) if (j.rates[s]) out[s] = 1 / j.rates[s]; // valor de 1 unidade em base
    return out;
  }

  async function fetchBTC(base) {
    try {
      const vs = base.toLowerCase();
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${vs}&include_24hr_change=true`
      );
      if (!res.ok) return null;
      const j = await res.json();
      return j.bitcoin ? { price: j.bitcoin[vs], change: j.bitcoin[vs + "_24h_change"] } : null;
    } catch (_) { return null; }
  }

  async function update() {
    const base = CONFIG.currency.base;
    const watch = CONFIG.currency.watch.slice();
    const wantBTC = watch.includes("BTC");
    const fiat = watch.filter(c => c !== "BTC");
    const list = document.getElementById("currency-list");
    try {
      const rates = await fetchFiat(base, fiat);
      list.innerHTML = "";
      const summary = {};
      for (const c of fiat) {
        if (!rates[c]) continue;
        summary[c] = rates[c];
        list.appendChild(row(c, rates[c]));
      }
      if (wantBTC) {
        const btc = await fetchBTC(base);
        if (btc) {
          summary.BTC = btc.price;
          list.appendChild(row("BTC", btc.price, btc.change));
        }
      }
      return summary;
    } catch (e) {
      console.warn("Erro nas cotações:", e);
      list.innerHTML = `<div class="muted">Erro: ${e.message || e}</div>`;
      return null;
    }
  }

  function row(code, value, change) {
    const el = document.createElement("div");
    el.className = "cur-row";
    const chg = (change === undefined || change === null)
      ? ""
      : `<span class="cur-chg ${change >= 0 ? "up" : "down"}">${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%</span>`;
    el.innerHTML =
      `<span class="cur-flag">${FLAG[code] || ""}</span>` +
      `<span class="cur-name">${NAMES[code] || code}</span>` +
      `<span class="cur-val">${CONFIG.currency.base} ${fmt(value)}</span>${chg}`;
    return el;
  }

  return { update, NAMES };
})();
