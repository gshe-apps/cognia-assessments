/* Prototype options: show two design options of the same screen part, and switch between them.
   Prototype only. The switch is an EPI-USE branded floating button, bottom left, so it never reads
   as part of the Cognia product.

   A screen script registers its options once and gets back the chosen key:
     const choice = window.capPrototypeOptions.register({
       id: 'assign', title: 'Assign learners step',
       options: [ { key: 'a', name: 'Option A: Learners first', description: '...' },
                  { key: 'b', name: 'Option B: Session first', description: '...' } ]
     });
   The choice comes from ?option=<key> in the link, then from this browser tab, then the first option.
   Choosing another option reloads the screen with it. Remove the losing option and its
   registration as soon as the decision is made. */
(() => {
  if (window.capPrototypeOptions) return;
  const groups = [];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const storeKey = (id) => 'capPrototypeOption:' + id;
  const chosen = (group) => {
    const keys = group.options.map((o) => o.key);
    const fromLink = new URLSearchParams(location.search).get('option');
    if (keys.includes(fromLink)) return fromLink;
    let stored = null;
    try { stored = sessionStorage.getItem(storeKey(group.id)); } catch {}
    return keys.includes(stored) ? stored : keys[0];
  };
  const choose = (group, key) => {
    try { sessionStorage.setItem(storeKey(group.id), key); } catch {}
    const url = new URL(location.href);
    url.searchParams.set('option', key);
    location.replace(url.href);
  };

  const ICON = {
    up: '<path d="m18 15-6-6-6 6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  };
  const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';

  function render() {
    document.querySelector('.proto-options')?.remove();
    if (!groups.length) return;
    const group = groups[0];
    const current = group.options.find((o) => o.key === chosen(group));
    const root = document.createElement('div');
    root.className = 'proto-options';
    root.innerHTML = `
      <div class="proto-options-panel" id="proto-options-panel" role="dialog" aria-labelledby="proto-options-title" hidden>
        <div class="proto-options-head">
          <img class="proto-options-logo" src="assets/epi-use-logo.svg" alt="EPI-USE">
          <button type="button" class="proto-options-close" data-proto-close aria-label="Close prototype options">${icon('x')}</button>
        </div>
        <h2 class="proto-options-title" id="proto-options-title">Compare options</h2>
        <p class="proto-options-subtitle">${esc(group.title)}</p>
        <fieldset class="proto-options-list">
          <legend class="sr-only">${esc(group.title)}</legend>
          ${group.options.map((o) => `
            <label class="proto-options-choice">
              <input type="radio" name="proto-option" value="${esc(o.key)}" ${o === current ? 'checked' : ''}>
              <span><strong>${esc(o.name)}</strong>${o.description ? `<span>${esc(o.description)}</span>` : ''}</span>
            </label>`).join('')}
        </fieldset>
        <p class="proto-options-note">Prototype only. Not part of the Cognia product.</p>
      </div>
      <button type="button" class="proto-options-trigger" aria-label="Prototype options: ${esc(current.name)}" aria-haspopup="dialog" aria-expanded="false" aria-controls="proto-options-panel">
        <img class="proto-options-logo" src="assets/epi-use-logo.svg" alt="EPI-USE">
        <span class="proto-options-label">${esc(current.short || current.name.split(':')[0])}</span>
        ${icon('up')}
      </button>`;
    document.body.append(root);
    const panel = root.querySelector('.proto-options-panel');
    const trigger = root.querySelector('.proto-options-trigger');
    const setOpen = (open, returnFocus) => {
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open) panel.querySelector('input:checked')?.focus();
      else if (returnFocus) trigger.focus();
    };
    trigger.addEventListener('click', () => setOpen(panel.hidden));
    root.querySelector('[data-proto-close]').addEventListener('click', () => setOpen(false, true));
    root.addEventListener('change', (event) => {
      if (event.target.name === 'proto-option' && event.target.value !== current.key) choose(group, event.target.value);
    });
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); setOpen(false, true); }
    });
    document.addEventListener('click', (event) => {
      if (!panel.hidden && !root.contains(event.target)) setOpen(false);
    });
  }

  window.capPrototypeOptions = {
    register(group) {
      groups.push(group);
      try { sessionStorage.setItem(storeKey(group.id), chosen(group)); } catch {}
      if (document.body) render(); else document.addEventListener('DOMContentLoaded', render);
      return chosen(group);
    },
  };
})();
