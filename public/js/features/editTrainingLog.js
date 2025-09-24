document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('entryModal');
    const formContainer = document.getElementById('entryFormContainer');
    const openEditBtn = document.getElementById('openEditModal');
    const closeBtn = document.getElementById('closeEntryModal');

    if (openEditBtn && modal) {
    openEditBtn.addEventListener('click', async () => {
        modal.classList.remove('hidden');
        try {
        const res = await fetch('/logs/edit/#{log.logId}');
        const html = await res.text();
        formContainer.innerHTML = html;
        } catch (err) {
        formContainer.innerHTML = '<p class="text-red-600">Failed to load form.</p>';
        }
    });
    }

    if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    }

    // 🔁 Reuse the same delegated submit listener as dashboard
    document.addEventListener('submit', function (e) {
    const form = e.target;
    if (form.closest('#entryFormContainer')) {
        e.preventDefault();
        const formData = new FormData(form);
        if (!formData.has('_csrf')) {
        formData.append('_csrf', window.CSRF_TOKEN);
        }
        fetch(form.action, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => res.json())
        .then(data => {
        if (data.success) {
            modal.classList.add('hidden');
            // simplest + safest: reload this page to show updated values
            window.location.reload();
        } else {
            alert('Error: ' + (data.error || (data.errors||[]).map(e => e.msg).join(', ')));
        }
        })
        .catch(err => console.error(err));
    }
    });
});