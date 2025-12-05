(function () {
  function confirmDeleteHandler(el, e) {
    const form = el.closest('form');
    if (!form) return;

    const ok = window.confirm(
      'Are you sure you want to delete your profile? This action cannot be undone.'
    );

    if (ok) {
      form.submit();
    }
  }

  // If the global action system exists, use it
  if (window.registerAction && typeof window.registerAction === 'function') {
    window.registerAction('confirm-delete-profile', confirmDeleteHandler);
  } else {
    // Fallback: our own delegated click handler
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action="confirm-delete-profile"]');
      if (!el) return;

      e.preventDefault();
      try {
        confirmDeleteHandler(el, e);
      } catch (err) {
        console.error('confirm-delete-profile fallback error:', err);
      }
    });
  }
})();
