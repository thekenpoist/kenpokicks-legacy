// /public/js/app.client.js
(function () {
  const actions = {};
  window.registerAction = (name, fn) => { actions[name] = fn; };

  // Event delegation for clicks
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    e.preventDefault();
    fn(el, e);
  });

  // If you expose CSRF via meta, this helper will find it (optional)
  window.csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.content || null;
})();
