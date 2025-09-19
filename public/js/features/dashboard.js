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

    if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', async () => {
        modal.classList.remove('hidden');
        try {
        const res = await fetch('/logs/new');
        const html = await res.text();
        formContainer.innerHTML = html;
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

    // AJAX form submission
    document.addEventListener('submit', function (e) {
    const form = e.target;
    if (form.closest('#entryFormContainer')) {
        e.preventDefault();
        const formData = new FormData(form);
        fetch(form.action, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
            'X-Requested-With' : 'XMLHttpRequest'
        }
        })
        .then(res => res.json())
        .then(data => {
        if (data.success) {
            modal.classList.add('hidden');
            const newEntry = `
            <div class="grid grid-cols-3 text-sm text-gray-800 border-b border-gray-100 py-2 cursor-pointer hover:bg-gray-50"
                    onclick="window.location='/logs/${data.log.logId}'">
                <div>${new Date(data.log.logDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div>${data.log.logCategory}</div>
                <div>${data.log.logTitle || '(No Title)'}</div>
            </div>`;
            fetch('/logs/recent')
            .then(res => res.text())
            .then(html => {
                diary.innerHTML = html;
            });
        } else {
            alert('Error: ' + (data.error || data.errors.map(e => e.msg).join(', ')));
        }
        })
        .catch(err => console.error(err));
    }
    });
});
