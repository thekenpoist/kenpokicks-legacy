// public/js/features/dashboard.js
document.addEventListener('DOMContentLoaded', function () {
  // Profile dropdown
  const btn = document.getElementById('profileDropdownBtn');
  const dropdown = document.getElementById('profileDropdown');
  if (btn && dropdown) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', function () {
      dropdown.classList.add('hidden');
    });
  }

  // Modal logic
  const openModalBtn = document.getElementById('openEntryModal');
  const closeModalBtn = document.getElementById('closeEntryModal');
  const modal = document.getElementById('entryModal');
  const formContainer = document.getElementById('entryFormContainer');
  const diary = document.querySelector('.training-diary-entries');

  if (openModalBtn && modal && formContainer) {
    openModalBtn.addEventListener('click', async () => {
      modal.classList.remove('hidden');
      try {
        const res = await fetch('/logs/new', {
          credentials: 'same-origin',
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        formContainer.innerHTML = await res.text();
      } catch (err) {
        formContainer.innerHTML = '<p class="text-red-600">Failed to load form.</p>';
      }
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  // NOTE: No submit handler here.
  // The single delegated submit listener in /public/js/app.client.js
  // handles forms inside #entryFormContainer (create & edit).
});
