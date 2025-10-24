(function () {
  const target = document.getElementById('admin-recent-activity');
  if (!target) return;

  fetch('/admin/logs/recent', { credentials: 'same-origin' })
    .then(r => r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)))
    .then(html => { target.innerHTML = html; })
    .catch(err => {
      console.error(err);
      target.innerHTML = '<div class="p-4 text-sm text-red-600">Failed to load recent admin logs.</div>';
    });
})();
