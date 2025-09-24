// /public/js/app.client.js
(function () {
  // --- Generic action registry + click delegation ---
  const actions = Object.create(null);

  // Expose a global registrar for feature files
  window.registerAction = (name, handler) => {
    if (typeof name === 'string' && typeof handler === 'function') {
      actions[name] = handler;
    }
  };

  // Click delegation (handles buttons/links with data-action)
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    e.preventDefault();
    try { fn(el, e); } catch (err) { console.error('Action error:', el.dataset.action, err); }
  });

  // Optional helper for CSRF fallback (if your form lacks a hidden field)
  window.csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.content || null;

  // Delegated submit handler ONLY for modals’ form container
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form.closest('#entryFormContainer')) return; // ignore non-modal forms

    e.preventDefault();
    const formData = new FormData(form);

    // Fallback: add CSRF if the form HTML didn’t include it
    if (!formData.has('_csrf')) {
      const t = window.csrfToken();
      if (t) formData.append('_csrf', t);
    }

    try {
      const res = await fetch(form.action, {
        method: form.method || 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      const isJSON = (res.headers.get('content-type') || '').includes('application/json');
      const payload = isJSON ? await res.json() : { success: false, error: await res.text() };

      if (!res.ok || !payload.success) {
        const msg = payload.error || (payload.errors || []).map(e => e.msg).join(', ') || `HTTP ${res.status}`;
        alert(`Error: ${msg}`);
        return;
      }

      document.getElementById('entryModal')?.classList.add('hidden');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Network error submitting the form.');
    }
  });
})();
