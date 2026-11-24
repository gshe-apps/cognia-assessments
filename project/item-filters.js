/* Add your items (CAP-T05-*), 24 Nov: the left side starts with three group cards, each counting its banks.
   Choosing groups shows the search, the filters (with those groups applied) and the items; with no group
   applied, the group cards show again.
   The search bar only searches the item list, and the filter icon
   opens a Filters modal (item bank, grade, subject, DOK, standards, type). Applied filters show as chips
   under the search. This replaces the item bank picker and the filter popover built by combined-create.js;
   the list itself is still filtered by client-connected-feedback.js, through window.capBuilderBankMatch.
   Within a filter any ticked value matches; across filters every filter must match. */
(() => {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const FUNNEL = '<path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/>';
  const X = '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>';
  const CATEGORIES = [
    { key: 'bank', label: 'Item bank' },
    { key: 'grade', label: 'Grade' },
    { key: 'subject', label: 'Subject' },
    { key: 'dok', label: 'DOK' },
    { key: 'standard', label: 'Standards' },
    { key: 'type', label: 'Type' },
  ];
  const BANKS = { cognia: 'Cognia banks', teacher: 'My banks', specialist: 'Content specialist banks' };
  const SUBJECTS = { Mathematics: 'Mathematics', English: 'English language arts' };
  const label = (key, value) => key === 'bank' ? BANKS[value] || value : key === 'grade' ? 'Grade ' + value : key === 'subject' ? SUBJECTS[value] || value : key === 'dok' ? 'DOK ' + value : value;
  const empty = () => Object.fromEntries(CATEGORIES.map(({ key }) => [key, []]));
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };

  const rows = () => [...document.querySelectorAll('#libraryList .question-card')];
  function valuesOf(row) {
    const context = window.capBuilderBankContext?.(row) || {};
    const type = row.querySelector('.uc-bank-tags .tiny, .row .tiny')?.textContent.trim() || '';
    return {
      bank: [row.dataset.itemBank].filter(Boolean),
      grade: (context.grades?.length ? context.grades : [context.grade]).filter(Boolean).map(String),
      subject: [context.subject].filter(Boolean),
      dok: [row.dataset.bankDok].filter(Boolean),
      standard: [row.dataset.bankStandard].filter(Boolean),
      type: [type].filter(Boolean),
    };
  }
  const matches = (values, filters, skip) => CATEGORIES.every(({ key }) => key === skip || !filters[key].length || values[key].some((v) => filters[key].includes(v)));

  let mounted = false;
  function mount() {
    if (mounted) return;
    const page = document.querySelector('main > .page.uc-page');
    const library = page?.querySelector('.library');
    const search = library?.querySelector('#search');
    const toolbar = library?.querySelector('.uc-bank-toolbar');
    if (!search || !toolbar || !window.capBuilderBankContext || !rows().length) return;
    const model = read('cogniaAssessmentTestsV1');
    const test = model?.tests?.find((t) => t.id === model.active) || model?.tests?.[0];
    if (!test) return;
    mounted = true;

    // Defaults follow the test details: its grades, subjects and standard. The bank comes from the cards.
    const scopeOf = (t) => ({ grade: (t.grades?.length ? t.grades : [t.grade]).filter(Boolean).map(String), subject: (t.subjects?.length ? t.subjects : [t.subject]).filter(Boolean), standard: [t.standard].filter(Boolean) });
    const defaults = (t) => ({ ...empty(), ...scopeOf(t) });
    const storeKey = 'cogniaBuilderFiltersV2:' + test.id;
    let scope = JSON.stringify(scopeOf(test));
    let applied;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storeKey));
      if (saved?.scope === scope) applied = { ...empty(), ...saved.filters };
    } catch {}
    applied ||= defaults(test);
    const persist = () => { try { sessionStorage.setItem(storeKey, JSON.stringify({ scope, filters: applied })); } catch {} };

    // The search bar, on its own, with the filter icon beside it; applied filters as chips below.
    const searchBox = search.closest('.search');
    library.querySelector('.uc-bank-field')?.remove();
    toolbar.querySelector('.uc-item-summary')?.remove();
    const bar = document.createElement('div');
    bar.className = 'uc-filter-bar';
    bar.innerHTML = `<span class="tooltip-wrap"><button type="button" class="btn btn-ghost btn-icon uc-filter-button" aria-haspopup="dialog" aria-label="Filters">${icon(FUNNEL)}</button><span class="tooltip" role="tooltip">Filters</span></span>`;
    bar.prepend(searchBox);
    search.placeholder = 'Search items';
    search.setAttribute('aria-label', 'Search items');
    const chips = document.createElement('div');
    chips.className = 'uc-filter-applied';
    chips.innerHTML = '<div class="chip-list" role="group" aria-label="Applied filters"></div><button type="button" class="btn btn-ghost btn-sm" data-clear-filters>Clear all</button>';
    toolbar.before(bar, chips);
    const filterButton = bar.querySelector('.uc-filter-button');

    // 24 Nov: the teacher first chooses a group (Cognia, My banks, Content specialist). Each card counts the
    // banks in it, and the chosen groups open the item list with them applied as the Item bank filter.
    const GROUP_CARDS = [
      { value: 'cognia', icon: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>', text: 'Ready-made banks from Cognia, aligned to standards.' },
      { value: 'teacher', icon: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', text: 'Banks you have created or saved.' },
      { value: 'specialist', icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>', text: 'Banks shared by your content specialists.' },
    ];
    // Sample item banks (teacher-bank-samples.js): five Grade 5 Mathematics banks holding 50 items.
    const ITEM_BANKS = window.capItemBanks || [];
    const banksIn = (group) => ITEM_BANKS.filter((b) => b.group === group);
    const choice = document.createElement('section');
    choice.className = 'uc-bank-choice';
    choice.setAttribute('aria-labelledby', 'uc-bank-choice-title');
    bar.before(choice);
    let pickedGroups = [];
    const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    function drawCards() {
      choice.innerHTML = `<div class="uc-bank-choice-header"><h2 class="text-body-base font-semibold" id="uc-bank-choice-title">Choose a group</h2><span class="text-body-small text-muted-foreground" data-picked-count aria-live="polite"></span></div>
        <div class="uc-bank-cards" role="group" aria-labelledby="uc-bank-choice-title">${GROUP_CARDS.map((card) => {
          const n = banksIn(card.value).length;
          return `<label class="uc-bank-option"><span class="card uc-bank-card">
            <span class="uc-bank-card-icon">${icon(card.icon).replace('<svg', '<svg class="icon icon-theme"')}</span>
            <span class="uc-bank-card-text"><span class="text-body-base font-semibold">${esc(label('bank', card.value))}</span><span class="text-body-small text-muted-foreground">${esc(card.text)}</span><span class="uc-bank-badges"><span class="badge badge-secondary">${plural(n, 'bank')}</span></span></span>
            <input class="checkbox checkbox-circle" type="checkbox" value="${card.value}" data-pick-group ${pickedGroups.includes(card.value) ? 'checked' : ''} aria-describedby="uc-group-desc-${card.value}"><span class="sr-only" id="uc-group-desc-${card.value}">${plural(n, 'bank')}</span>
          </span></label>`;
        }).join('')}</div>
        <div class="uc-bank-choice-actions"><button type="button" class="btn btn-lg" data-show-items>Show banks</button></div>`;
      drawShow();
    }
    function drawShow() {
      const n = pickedGroups.reduce((sum, g) => sum + banksIn(g).length, 0);
      const show = choice.querySelector('[data-show-items]');
      show.disabled = !pickedGroups.length;
      show.textContent = pickedGroups.length ? `Show ${plural(n, 'bank')}` : 'Show banks';
      choice.querySelector('[data-picked-count]').textContent = pickedGroups.length ? `${pickedGroups.length} selected` : '';
    }
    choice.addEventListener('change', (event) => {
      const box = event.target.closest('[data-pick-group]');
      if (!box) return;
      pickedGroups = GROUP_CARDS.map((c) => c.value).filter((v) => (v === box.value ? box.checked : pickedGroups.includes(v)));
      drawShow();
    });
    // The chosen groups go straight to the item list as the Item bank filter.
    choice.addEventListener('click', (event) => {
      if (!event.target.closest('[data-show-items]') || !pickedGroups.length) return;
      applied.bank = [...pickedGroups];
      pickedGroups = [];
      run();
      // Keep keyboard users in place without putting the cursor in the search box.
      library.tabIndex = -1;
      library.focus({ preventScroll: true });
    });
    const firstBank = () => choice.querySelector('[data-pick-group]');

    function run() {
      const choosing = !applied.bank.length;
      library.classList.toggle('uc-choosing-bank', choosing);
      if (choosing) drawCards();
      // When the view switches between the bank cards and the item list, the view that appears eases in.
      const switched = library.dataset.ucView !== (choosing ? 'banks' : 'items');
      library.dataset.ucView = choosing ? 'banks' : 'items';
      if (switched) for (const el of [choice, bar, chips, library.querySelector('#libraryList')]) { el?.classList.remove('uc-reveal'); }
      if (switched) void library.offsetWidth;
      if (switched) (choosing ? [choice] : [bar, chips, library.querySelector('#libraryList')]).forEach((el) => el?.classList.add('uc-reveal'));
      window.capBuilderBankMatch = (row) => matches(valuesOf(row), applied);
      window.capFilterBuilderQuestions?.();
      const hint = library.querySelector('[data-bank-empty-hint]');
      if (hint) hint.textContent = 'Try another search, or change the filters.';
      const list = chips.querySelector('.chip-list');
      const active = CATEGORIES.flatMap(({ key }) => applied[key].map((value) => ({ key, value })));
      list.innerHTML = active.map(({ key, value }) => `<span class="chip" role="listitem">${esc(label(key, value))}<button type="button" class="chip-remove" data-remove="${esc(key)}" data-value="${esc(value)}" aria-label="Remove filter: ${esc(label(key, value))}">${icon(X)}</button></span>`).join('');
      chips.hidden = !active.length;
      filterButton.toggleAttribute('data-filters-active', active.length > 0);
      filterButton.setAttribute('aria-label', active.length ? `Filters (${active.length} applied)` : 'Filters');
      persist();
    }
    chips.addEventListener('click', (event) => {
      const remove = event.target.closest('[data-remove]');
      if (remove) {
        const index = [...chips.querySelectorAll('[data-remove]')].indexOf(remove);
        applied[remove.dataset.remove] = applied[remove.dataset.remove].filter((v) => v !== remove.dataset.value);
        run();
        const left = chips.querySelectorAll('[data-remove]');
        if (!applied.bank.length) firstBank()?.focus();
        else (left[Math.min(index, left.length - 1)] || filterButton).focus();
        return;
      }
      if (event.target.closest('[data-clear-filters]')) { applied = empty(); run(); firstBank()?.focus(); }
    });

    // Filters modal: filters on the left, the chosen filter's values (with item counts) on the right.
    const dialog = document.createElement('dialog');
    dialog.className = 'dialog uc-filters-dialog';
    dialog.setAttribute('aria-labelledby', 'uc-filters-title');
    dialog.innerHTML = `
      <div class="dialog-header"><h2 class="dialog-title" id="uc-filters-title">Filters</h2><button type="button" class="btn btn-ghost btn-icon dialog-close" aria-label="Close filters">${icon(X)}</button></div>
      <div class="uc-filters-body">
        <nav class="uc-filters-nav" aria-label="Filter by" data-nav></nav>
        <section class="uc-filters-panel" aria-labelledby="uc-filters-panel-title">
          <h3 class="text-body-base font-semibold" id="uc-filters-panel-title" data-panel-title></h3>
          <fieldset class="uc-filters-options" data-options><legend class="sr-only" data-panel-legend></legend></fieldset>
        </section>
      </div>
      <div class="dialog-footer uc-filters-footer">
        <button type="button" class="btn btn-ghost btn-lg" data-reset>Reset all</button>
        <button type="button" class="btn btn-ghost btn-lg" data-cancel>Cancel</button>
        <button type="button" class="btn btn-lg" data-apply>Apply filters</button>
      </div>`;
    page.append(dialog);
    let draft;
    let current = 'bank';
    const allRows = () => rows().map((row) => ({ id: row.dataset.bankId, values: valuesOf(row) }));
    const countFor = (all, value) => new Set(all.filter((r) => r.values[current].includes(value) && matches(r.values, draft, current)).map((r) => r.id)).size;
    const countText = (n) => `${n} ${n === 1 ? 'item' : 'items'}`;
    function drawNav() {
      dialog.querySelector('[data-nav]').innerHTML = CATEGORIES.map(({ key, label: text }) => `<button type="button" class="uc-filters-nav-item" data-category="${key}" aria-current="${key === current}"><span>${esc(text)}</span>${draft[key].length ? `<span class="badge badge-secondary">${draft[key].length}</span>` : ''}</button>`).join('');
    }
    function drawModal() {
      const all = allRows();
      drawNav();
      const category = CATEGORIES.find((c) => c.key === current);
      dialog.querySelector('[data-panel-title]').textContent = category.label;
      dialog.querySelector('[data-panel-legend]').textContent = category.label;
      // Every value found in the item list, plus any already ticked, with how many items it would show.
      const values = [...new Set([...all.flatMap((r) => r.values[current]), ...draft[current]])].sort((a, b) => label(current, a).localeCompare(label(current, b), undefined, { numeric: true }));
      const options = dialog.querySelector('[data-options]');
      options.querySelectorAll('label').forEach((el) => el.remove());
      options.insertAdjacentHTML('beforeend', values.map((value) => {
        return `<label class="check uc-filters-option"><input class="checkbox" type="checkbox" value="${esc(value)}" ${draft[current].includes(value) ? 'checked' : ''}><span class="uc-filters-option-label">${esc(label(current, value))}</span><span class="uc-filters-count text-body-small text-muted-foreground">${countText(countFor(all, value))}</span></label>`;
      }).join(''));
    }
    filterButton.addEventListener('click', () => {
      draft = JSON.parse(JSON.stringify(applied));
      drawModal();
      dialog.showModal();
      dialog.querySelector('[aria-current="true"]').focus();
    });
    dialog.addEventListener('click', (event) => {
      const nav = event.target.closest('[data-category]');
      if (nav) { current = nav.dataset.category; drawModal(); dialog.querySelector(`[data-category="${current}"]`).focus(); return; }
      if (event.target.closest('[data-reset]')) { draft = empty(); drawModal(); return; }
      if (event.target.closest('[data-cancel], .dialog-close')) { dialog.close(); return; }
      if (event.target.closest('[data-apply]')) { applied = draft; run(); dialog.close(); }
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
    dialog.addEventListener('close', () => (applied.bank.length ? filterButton : firstBank())?.focus());

    // When the test details change (grades, subjects, standard), the filters start again from them.
    document.addEventListener('close', (event) => {
      if (!event.target.matches?.('.cap-setup-modal')) return;
      const next = read('cogniaAssessmentTestsV1');
      const t = next?.tests?.find((x) => x.id === next.active) || next?.tests?.[0];
      if (!t || JSON.stringify(scopeOf(t)) === scope) return;
      scope = JSON.stringify(scopeOf(t));
      applied = { ...defaults(t), bank: applied.bank };
      run();
    }, true);

    run();
  }

  const observer = new MutationObserver(() => { mount(); if (mounted) observer.disconnect(); });
  const start = () => { mount(); if (!mounted) observer.observe(document.body, { childList: true, subtree: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
