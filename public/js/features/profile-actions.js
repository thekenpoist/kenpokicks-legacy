window.registerAction('confirmDeleteProfile', (button, event) => {
event.preventDefault(); // stop normal submission

const form = button.closest('form');
if (!form) return;

const confirmed = window.confirm(
    'Are you sure you want to delete your profile? This action cannot be undone.'
);

if (confirmed) {
    form.submit(); // now submit for real (bypasses other listeners safely)
}
});