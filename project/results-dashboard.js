/* Results (CAP-T13), 27 Nov: the learner table's search bar, filter icon and applied filter chips, in one row
   with the learner count on the right. Works like Add your items (item-filters.js): the filter icon opens a
   Filters modal (filters on the left, the chosen filter's values with learner counts on the right), the icon
   shows a red dot while filters are applied, and each applied filter is a chip on its own row under the
   search (27 Nov). When the chips no longer fit that row, the rest move behind a "+X more" button that opens
   a second row, closed again with "Show less". Within a filter any ticked value matches; across filters every filter must match.
   live-results.js draws the rows (data-status, data-score, data-missed) and re-runs this after each redraw. */
(() => {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const X = '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>';
  const STATUS = { submitted: 'Scored', progress: 'In progress', joined: 'Signed in', none: 'Not started' };
  const BANDS = [['below', 'Below 50%', 0, 49], ['50', '50 to 59%', 50, 59], ['60', '60 to 69%', 60, 69], ['70', '70 to 79%', 70, 79], ['80', '80 to 89%', 80, 89], ['90', '90 to 100%', 90, 100]];
  const CATEGORIES = [
    { key: 'score', label: 'Score' },
    { key: 'status', label: 'Status' },
    { key: 'missed', label: 'Marks lost on' },
  ];
  const label = (key, value) => key === 'status' ? STATUS[value] || value : key === 'score' ? (BANDS.find((b) => b[0] === value) || [, value])[1] : 'Q' + value;
  const order = (key, value) => key === 'status' ? Object.keys(STATUS).indexOf(value) : key === 'score' ? BANDS.findIndex((b) => b[0] === value) : Number(value);
  const none = () => Object.fromEntries(CATEGORIES.map(({ key }) => [key, []]));

  const rows = () => [...document.querySelectorAll('[data-result-row]')];
  function valuesOf(row) {
    const score = row.dataset.score ? Number(row.dataset.score) : null;
    return {
      score: score === null ? [] : [BANDS.find((b) => score >= b[2] && score <= b[3])[0]],
      status: [row.dataset.status].filter(Boolean),
      missed: (row.dataset.missed || '').split(' ').filter(Boolean),
    };
  }
  const matches = (values, filters, skip) => CATEGORIES.every(({ key }) => key === skip || !filters[key].length || values[key].some((v) => filters[key].includes(v)));

  let applied = none(), query = '', expanded = false;
  const active = () => CATEGORIES.flatMap(({ key }) => applied[key].map((value) => ({ key, value })));

  function update() {
    let count = 0;
    rows().forEach((row) => {
      const show = matches(valuesOf(row), applied) && row.cells[0].textContent.toLowerCase().includes(query);
      row.hidden = !show;
      if (show) count++;
    });
    const emptyState = document.querySelector('.rr-empty');
    if (emptyState) {
      emptyState.hidden = count !== 0;
      const hint = emptyState.querySelector('p:not(.empty-title)');
      const text = active().length ? 'Try another name, or change the filters.' : 'Try another name.';
      if (hint && hint.textContent !== text) hint.textContent = text;
    }
    const note = document.querySelector('.rr-table-note'), message = `${count} ${count === 1 ? 'learner' : 'learners'}`;
    if (note && note.textContent !== message) note.textContent = message;
    drawChips();
  }

  // Applied filters as chips under the search. The chips that do not fit move to a second row behind "+X more".
  const chip = ({ key, value }) => `<span class="chip">${esc(label(key, value))}<button type="button" class="chip-remove" data-remove="${esc(key)}" data-value="${esc(value)}" aria-label="Remove filter: ${esc(label(key, value))}">${icon(X)}</button></span>`;
  const clearAll = '<button type="button" class="btn btn-ghost btn-sm" data-clear-filters>Clear all</button>';
  let drawn = '';
  function drawChips() {
    const row = document.querySelector('[data-filter-chips]'), more = document.querySelector('[data-filter-more]');
    const button = document.getElementById('rr-filter-trigger');
    if (!row || !more || !button) return;
    const list = active();
    button.toggleAttribute('data-filters-active', list.length > 0);
    button.setAttribute('aria-label', list.length ? `Filters (${list.length} applied)` : 'Filters');
    // Skip the layout work when nothing changed (this runs after every table redraw).
    const key = JSON.stringify([list, expanded, row.clientWidth]);
    if (key === drawn) return;
    drawn = key;
    if (!list.length) { row.innerHTML = ''; more.innerHTML = ''; more.hidden = true; expanded = false; return; }
    // Everything on one row when it fits, Clear all included.
    row.innerHTML = list.map(chip).join('') + clearAll;
    const room = row.clientWidth;
    const fits = (el) => el.offsetLeft + el.offsetWidth <= room;   // the row is positioned, so offsets are inside it
    if (fits(row.lastElementChild)) { more.innerHTML = ''; more.hidden = true; expanded = false; return; }
    // Otherwise as many chips as fit with the "+X more" button after them; the rest, and Clear all, go below.
    row.innerHTML = list.map(chip).join('') + '<button type="button" class="btn btn-ghost btn-sm" data-more-filters aria-controls="rr-filter-more"></button>';
    const moreButton = row.querySelector('[data-more-filters]');
    let shown = list.length - 1;
    row.querySelectorAll('.chip')[shown].remove();
    for (;;) {
      moreButton.textContent = `+${list.length - shown} more`;
      if (shown === 0 || fits(moreButton)) break;
      row.querySelectorAll('.chip')[shown - 1].remove();
      shown--;
    }
    moreButton.setAttribute('aria-expanded', String(expanded));
    moreButton.hidden = expanded;
    more.id = 'rr-filter-more';
    more.innerHTML = list.slice(shown).map(chip).join('') + clearAll + '<button type="button" class="btn btn-ghost btn-sm" data-less-filters>Show less</button>';
    more.hidden = !expanded;
  }

  document.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove]');
    if (remove && remove.closest('[data-filter-chips], [data-filter-more]')) {
      const all = [...document.querySelectorAll('[data-filter-chips] [data-remove], [data-filter-more] [data-remove]')];
      const index = all.indexOf(remove);
      applied[remove.dataset.remove] = applied[remove.dataset.remove].filter((v) => v !== remove.dataset.value);
      update();
      const left = [...document.querySelectorAll('[data-filter-chips] [data-remove], [data-filter-more]:not([hidden]) [data-remove]')];
      (left[Math.min(index, left.length - 1)] || document.getElementById('rr-filter-trigger'))?.focus();
      return;
    }
    if (event.target.closest('[data-clear-filters]')) { applied = none(); expanded = false; update(); document.getElementById('rr-filter-trigger')?.focus(); return; }
    if (event.target.closest('[data-more-filters]')) { expanded = true; drawChips(); document.querySelector('[data-filter-more] [data-remove]')?.focus(); return; }
    if (event.target.closest('[data-less-filters]')) { expanded = false; drawChips(); document.querySelector('[data-more-filters]')?.focus(); return; }
    if (event.target.closest('#rr-filter-trigger')) openFilters();
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'resultSearch') { query = e.target.value.trim().toLowerCase(); update(); } });

  // Filters modal (the Add your items one): filters on the left, the chosen filter's values on the right.
  let dialog, draft, current = 'score';
  const countText = (n) => `${n} ${n === 1 ? 'learner' : 'learners'}`;
  const allRows = () => rows().map(valuesOf);
  const countFor = (all, value) => all.filter((v) => v[current].includes(value) && matches(v, draft, current)).length;
  function drawNav() {
    dialog.querySelector('[data-nav]').innerHTML = CATEGORIES.map(({ key, label: text }) => `<button type="button" class="uc-filters-nav-item" data-category="${key}" aria-current="${key === current}"><span>${esc(text)}</span>${draft[key].length ? `<span class="badge badge-secondary">${draft[key].length}</span>` : ''}</button>`).join('');
  }
  function drawModal() {
    const all = allRows();
    drawNav();
    const category = CATEGORIES.find((c) => c.key === current);
    dialog.querySelector('[data-panel-title]').textContent = category.label;
    dialog.querySelector('[data-panel-legend]').textContent = category.label;
    // Every value in the table, plus any already ticked, with how many learners it would show.
    const values = [...new Set([...all.flatMap((v) => v[current]), ...draft[current]])].sort((a, b) => order(current, a) - order(current, b));
    const options = dialog.querySelector('[data-options]');
    options.querySelectorAll('label, .uc-filters-none').forEach((el) => el.remove());
    options.insertAdjacentHTML('beforeend', values.length
      ? values.map((value) => `<label class="check uc-filters-option"><input class="checkbox" type="checkbox" value="${esc(value)}" ${draft[current].includes(value) ? 'checked' : ''}><span class="uc-filters-option-label">${esc(label(current, value))}</span><span class="uc-filters-count text-body-small text-muted-foreground">${countText(countFor(all, value))}</span></label>`).join('')
      : '<p class="uc-filters-none text-body-small text-muted-foreground">No learners have a score yet.</p>');
  }
  function openFilters() {
    if (!dialog) {
      dialog = document.createElement('dialog');
      // Outside the Canvas template, so it takes the page's product theme from it.
      const theme = [...(document.querySelector('[class*="theme-"]')?.classList || [])].find((c) => c.startsWith('theme-')) || '';
      dialog.className = ('dialog uc-filters-dialog ' + theme).trim();
      dialog.setAttribute('aria-labelledby', 'rr-filters-title');
      dialog.innerHTML = `
        <div class="dialog-header"><h2 class="dialog-title" id="rr-filters-title">Filters</h2><button type="button" class="btn btn-ghost btn-icon dialog-close" aria-label="Close filters">${icon(X)}</button></div>
        <div class="uc-filters-body">
          <nav class="uc-filters-nav" aria-label="Filter by" data-nav></nav>
          <section class="uc-filters-panel" aria-labelledby="rr-filters-panel-title">
            <h3 class="text-body-base font-semibold" id="rr-filters-panel-title" data-panel-title></h3>
            <fieldset class="uc-filters-options" data-options><legend class="sr-only" data-panel-legend></legend></fieldset>
          </section>
        </div>
        <div class="dialog-footer uc-filters-footer">
          <button type="button" class="btn btn-ghost btn-lg" data-reset>Reset all</button>
          <button type="button" class="btn btn-ghost btn-lg" data-cancel>Cancel</button>
          <button type="button" class="btn btn-lg" data-apply>Apply filters</button>
        </div>`;
      document.body.append(dialog);   // outside the Canvas template, so a redraw never removes it
      dialog.addEventListener('click', (event) => {
        const nav = event.target.closest('[data-category]');
        if (nav) { current = nav.dataset.category; drawModal(); dialog.querySelector(`[data-category="${current}"]`).focus(); return; }
        if (event.target.closest('[data-reset]')) { draft = none(); drawModal(); return; }
        if (event.target === dialog || event.target.closest('[data-cancel], .dialog-close')) { dialog.close(); return; }
        if (event.target.closest('[data-apply]')) { applied = draft; expanded = false; dialog.close(); update(); }
      });
      dialog.addEventListener('change', (event) => {
        const box = event.target.closest('[data-options] input');
        if (!box) return;
        draft[current] = box.checked ? [...draft[current], box.value] : draft[current].filter((v) => v !== box.value);
        drawNav();
        const all = allRows();
        dialog.querySelectorAll('[data-options] label').forEach((option) => {
          option.querySelector('.uc-filters-count').textContent = countText(countFor(all, option.querySelector('input').value));
        });
      });
      dialog.addEventListener('close', () => document.getElementById('rr-filter-trigger')?.focus({ preventScroll: true }));
    }
    draft = JSON.parse(JSON.stringify(applied));
    drawModal();
    dialog.showModal();
    dialog.querySelector('[aria-current="true"]').focus();
  }

  // The chips are measured, so lay them out again when the row changes width.
  let resizeTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawChips, 100); });
  // The shared Canvas runtime redraws when the hub or account menu changes.
  const root = document.querySelector('x-dc');
  if (root) new MutationObserver(() => { const input = document.getElementById('resultSearch'); if (input && input.value !== query) input.value = query; drawn = ''; update(); }).observe(root, { childList: true });
})();
