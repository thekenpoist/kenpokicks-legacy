// Somewhere after window.registerAction is defined
window.registerAction('confirm-delete-profile', (el, e) => {
  const form = el.closest('form');
  if (!form) return;

  const ok = window.confirm(
    'Are you sure you want to delete your profile? This action cannot be undone.'
  );

  if (ok) {
    // click handler already did e.preventDefault(),
    // so we manually submit the form.
    form.submit();
  }
  // If not ok → do nothing → form not submitted → profile not deleted.
});
