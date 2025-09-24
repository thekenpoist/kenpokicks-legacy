// Uses the global registerAction from app.client.js
registerAction('log-edit-open', async (el) => {
  const logId = el.dataset.logId;
  const modal = document.getElementById('entryModal');
  const formContainer = document.getElementById('entryFormContainer');
  if (!modal || !formContainer || !logId) return;

  modal.classList.remove('hidden');

  try {
    const res = await fetch(`/logs/edit/${encodeURIComponent(logId)}`, {
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    formContainer.innerHTML = await res.text();
  } catch {
    formContainer.innerHTML = '<p class="text-red-600">Failed to load form.</p>';
  }
});
