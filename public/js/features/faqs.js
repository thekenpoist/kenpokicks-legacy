registerAction('faq-toggle', (el) => {
  const sel = el.dataset.target; 
  const panel = document.querySelector(sel);
  if (panel) panel.classList.toggle('hidden');
});

 
 function toggleAnswer(id) {
    const el = document.getElementById(id);
    if (el.classList.contains('hidden')) {
    el.classList.remove('hidden');
    } else {
    el.classList.add('hidden');
    }
}
