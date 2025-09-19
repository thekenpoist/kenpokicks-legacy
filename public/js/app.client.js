//“action bus” for click events
(function () {
  // Utility: read CSRF token if exposed
  function csrf() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.content : null;
  }

  async function http(method, url, body, headers = {}) {
    const base = {
      method,
      headers: {
        'Accept': 'application/json, text/html, */*',
        'Content-Type': body ? 'application/json' : undefined,
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin'
    };
    // Strip undefined header if no body
    if (!body) delete base.headers['Content-Type'];
    const res = await fetch(url, base);
    if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}`);
    return res;
  }

  // --- Action handlers (add tiny, focused functions) ---
  const actions = {
    // Example: delete a training log
    'log:delete': async (el, e) => {
      const id = el.dataset.id;
      const url = el.dataset.url || `/admin/logs/${id}`;
      if (!id) return;

      if (!confirm('Delete this log?')) return;

      const token = csrf();
      const headers = token ? { 'X-CSRF-Token': token } : {};
      await http('DELETE', url, null, headers);

      // Remove its row/card from the UI
      const row = el.closest('[data-row]');
      if (row) row.remove();
    },

    // Example: toggle a FAQ panel
    'faq:toggle': (el, e) => {
      const target = el.dataset.target;
      if (!target) return;
      const panel = document.querySelector(target);
      if (panel) panel.classList.toggle('hidden');
    },

    // You can keep adding small handlers here:
    // 'log:mark-done': (el) => {...}
    // 'tech:expand': (el) => {...}
  };

  // --- Event delegation ---
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const handler = actions[action];
    if (!handler) return;

    // Prevent default (e.g., for <a href="#">)
    e.preventDefault();

    try {
      handler(el, e);
    } catch (err) {
      // Optional: bubble to your logger via console or send beacon
      console.error('Action error:', action, err);
    }
  });
})();
