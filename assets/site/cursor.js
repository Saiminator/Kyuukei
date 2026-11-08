(() => {
  const boot = window.KyuukeiCursorBoot;
  const cursor = document.getElementById('customCursor');
  if (!boot || !cursor?.showPopover) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const images = new Map([...cursor.querySelectorAll('[data-cursor-image]')].map(img => [img.dataset.cursorImage, img]));
  const staticSources = new Map([...images].map(([state, img]) => [state, img.getAttribute('src')]));
  const staticReady = new Set();
  const gifReady = new Set();
  const attempted = new Set();
  let point = boot.saved ? {...boot.saved} : null;
  let pendingFrame = 0;
  let raiseOnRender = false;

  const allowed = () => boot.fine.matches && point?.inside && document.visibilityState === 'visible';
  const animated = () => boot.fine.matches && !reduced.matches;
  function hide() {
    root.classList.remove('custom-cursor-active');
    if (cursor.matches(':popover-open')) cursor.hidePopover();
  }
  function persist() {
    if (!point) return;
    try {
      sessionStorage.setItem(boot.key, JSON.stringify({x: point.x, y: point.y, state: root.dataset.cursorState || 'default', inside: point.inside, at: Date.now()}));
    } catch (_) {}
  }
  function stateAtPoint() {
    const target = document.elementFromPoint(point.x, point.y);
    if (!target) return 'outside';
    if (target.closest('button:disabled,input:disabled,textarea:disabled,select:disabled')) return 'disabled';
    if (target.closest('input,textarea,[contenteditable="true"]')) return 'text';
    if (target.closest('a[href],button,summary,select,[role="button"],label[for],[data-cursor="select"]')) return 'select';
    return 'default';
  }
  function render() {
    pendingFrame = 0;
    if (!allowed()) { hide(); return; }
    const state = stateAtPoint();
    root.dataset.cursorState = state;
    const ready = staticReady.has(state) || (animated() && gifReady.has(state));
    if (!ready) { hide(); return; }
    cursor.style.transform = `translate3d(${point.x - 4}px,${point.y - 4}px,0)`;
    // A manual popover stays above modal dialogs without affecting focus or clicks.
    if (raiseOnRender && cursor.matches(':popover-open')) cursor.hidePopover();
    raiseOnRender = false;
    if (!cursor.matches(':popover-open')) cursor.showPopover();
    root.classList.add('custom-cursor-active');
  }
  function queueRender(raise = false) {
    raiseOnRender ||= raise;
    if (!pendingFrame) pendingFrame = requestAnimationFrame(render);
  }
  function applySources() {
    for (const [state, img] of images) {
      const src = animated() && gifReady.has(state) ? img.dataset.animatedSrc : staticSources.get(state);
      if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
      else if (!src) img.removeAttribute('src');
    }
    queueRender();
  }
  function preloadAnimations() {
    if (!animated()) return;
    for (const [state, img] of images) {
      const src = img.dataset.animatedSrc;
      if (!src || attempted.has(state)) continue;
      attempted.add(state);
      const preload = new Image();
      preload.onload = () => { gifReady.add(state); applySources(); };
      preload.onerror = () => { gifReady.delete(state); applySources(); };
      preload.src = src;
    }
  }
  for (const [state, img] of images) {
    if (img.complete && img.naturalWidth && staticSources.get(state)) staticReady.add(state);
    img.addEventListener('load', () => {
      if (img.getAttribute('src') === staticSources.get(state)) staticReady.add(state);
      queueRender();
    });
    img.addEventListener('error', () => {
      if (img.getAttribute('src') === img.dataset.animatedSrc) gifReady.delete(state);
      else staticReady.delete(state);
      applySources();
    });
  }
  function track(event) {
    if (event.pointerType !== 'mouse' || !boot.fine.matches) {
      if (point) point.inside = false;
      hide(); return;
    }
    point = {x: event.clientX, y: event.clientY, inside: true};
    queueRender();
  }
  document.addEventListener('pointermove', track, {passive: true});
  document.addEventListener('pointerover', track, {passive: true});
  document.addEventListener('pointerdown', event => { track(event); render(); persist(); }, {passive: true});
  document.documentElement.addEventListener('pointerleave', event => {
    // Page replacement can emit pointerleave at an in-bounds point. Keep that
    // position for navigation; only a real viewport exit clears it.
    if (event.clientX > 0 && event.clientY > 0 && event.clientX < innerWidth && event.clientY < innerHeight) return;
    if (point) point.inside = false;
    persist(); hide();
  });
  window.addEventListener('pagehide', () => { persist(); if (pendingFrame) cancelAnimationFrame(pendingFrame); pendingFrame = 0; });
  window.addEventListener('pageshow', event => {
    if (event.persisted) point = boot.read() || point;
    raiseOnRender = true;
    render();
  });
  window.addEventListener('blur', hide);
  window.addEventListener('focus', () => queueRender(true));
  window.addEventListener('resize', () => {
    if (point && (point.x >= innerWidth || point.y >= innerHeight)) point.inside = false;
    queueRender();
  });
  document.addEventListener('scroll', () => queueRender(), {capture: true, passive: true});
  document.addEventListener('visibilitychange', () => { if (!document.hidden) queueRender(true); });
  const observer = new MutationObserver(records => { if (records.some(record => record.target.tagName === 'DIALOG')) queueRender(true); });
  observer.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['open']});
  boot.fine.addEventListener('change', () => {
    if (!boot.fine.matches && point) point.inside = false;
    preloadAnimations(); applySources();
  });
  reduced.addEventListener('change', () => { preloadAnimations(); applySources(); });
  preloadAnimations();
  render();
})();
