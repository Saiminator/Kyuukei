(() => {
  const menu = document.querySelector('[data-menu-toggle]');
  menu?.addEventListener('click', () => menu.setAttribute('aria-expanded', String(menu.getAttribute('aria-expanded') !== 'true')));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      menu.setAttribute('aria-expanded', 'false');
      menu.focus();
    }
  });
  const dialog = document.querySelector('#character-profile');
  if (!dialog) return;
  const content = dialog.querySelector('.profile-dialog-content');
  const closeButton = dialog.querySelector('.profile-close');
  let opener;
  let previousOverflow;
  document.querySelectorAll('[data-open-profile]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const template = document.getElementById(button.dataset.openProfile);
      if (!template || dialog.open) return;
      opener = button;
      menu?.setAttribute('aria-expanded', 'false');
      content.replaceChildren(template.content.cloneNode(true));
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
      content.scrollTop = 0;
      closeButton.focus({preventScroll: true});
    });
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow || '';
    content.replaceChildren();
    opener?.focus({preventScroll: true});
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')].filter(el => el.tabIndex >= 0 && el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();
