// ===================================================================
//  Tasks — lembretes/afazeres persistidos no navegador (localStorage)
// ===================================================================

const Tasks = (() => {
  const KEY = "jarvis.tasks";
  let items = [];

  function load() {
    try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { items = []; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(items)); }

  function add(text) {
    if (!text || !text.trim()) return;
    items.push({ id: Date.now(), text: text.trim(), done: false });
    save(); render();
  }
  function toggle(id) {
    const t = items.find(i => i.id === id);
    if (t) { t.done = !t.done; save(); render(); }
  }
  function remove(id) { items = items.filter(i => i.id !== id); save(); render(); }

  function render() {
    const box = document.getElementById("tasks-list");
    if (!box) return;
    box.innerHTML = "";
    if (!items.length) {
      box.innerHTML = `<div class="muted">Sem lembretes ativos</div>`;
      return;
    }
    items.forEach(t => {
      const el = document.createElement("div");
      el.className = "task-item" + (t.done ? " done" : "");
      el.innerHTML =
        `<span class="task-check">${t.done ? "◉" : "◯"}</span>` +
        `<span class="task-text">${t.text}</span>` +
        `<span class="task-del">✕</span>`;
      el.querySelector(".task-check").onclick = () => toggle(t.id);
      el.querySelector(".task-text").onclick = () => toggle(t.id);
      el.querySelector(".task-del").onclick = () => remove(t.id);
      box.appendChild(el);
    });
  }

  function pending() { return items.filter(i => !i.done); }

  function init() {
    load(); render();
    const input = document.getElementById("task-input");
    if (input) {
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") { add(input.value); input.value = ""; }
      });
    }
  }

  return { init, add, pending };
})();
