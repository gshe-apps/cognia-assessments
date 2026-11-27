// Teacher Results, live: rebuilds the summary, charts and student table from the live session.
// The Canvas runtime redraws the page when menus open, so everything here is re-applied after each redraw.
(() => {
  const live = window.CogniaLive;
  if (!live) return;
  const calendar = window.capOverviewCalendar;
  const event = calendar?.event?.status === 'check' ? calendar.event : null;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const MAX_Q = event ? event.questions.map(q => q.marks) : [4, 4, 1, 1];
  // 12 Nov: some learners have profile photos (the rest keep initials).
  const PHOTOS = { 'Ava Patel': 'assets/avatars/learner-maria-gonzalez.png', 'Noah Kim': 'assets/avatars/learner-jack-alfredo.png', 'Zoe Martin': 'assets/avatars/learner-kathrine-benedict.png' };
  let sortKey = null, sortDir = 1;   // table sort (column header buttons)
  // Right-hand card stack (12 Nov): works like the admin Overview detail deck. The last card in `deck` is in
  // front and open; clicking a card behind lifts it out and drops it into the front slot.
  let deck = event ? ['insights', 'details', 'performance'] : ['performance', 'insights', 'details', 'live'];
  let deckPrev = null, deckTimer = 0;
  const STRIP = 44;                  // visible height of each card behind the front one
  let searchOpen = false;

  let records = {};
  let sample = false;          // Shift + D: sample results if the venue connection drops
  let copied = false;
  const arrived = {};          // passcode -> time it was first seen submitted (for the highlight)
  let firstLoad = true;

  // 27 Nov: the assessment name is the switcher. It opens a dialog listing every assessment with results.
  const ICON = {
    chevrons: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };
  // Solid check circle for the current assessment: one filled shape with the tick cut out, so it stays one colour.
  const CURRENT = '<svg class="icon icon-theme" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="none" fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20Zm-1.6 14.2-4.3-4.3 1.4-1.4 2.9 2.9 6.2-6.2 1.4 1.4Z"/></svg>';
  // Dialogs sit outside the Canvas template, so they take the page's product theme (blue for Assessments) from it.
  const themeOf = () => [...(document.querySelector('[class*="theme-"]')?.classList || [])].find((c) => c.startsWith('theme-')) || '';
  const svg = (name, cls = 'icon') => '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  const DEFAULT_TITLE = 'Fractions check';
  function mountSwitcher() {
    const h1 = document.querySelector('.rr-page .rr-title h1');
    if (!h1 || h1.querySelector('[data-result-switch]')) return;
    const title = event ? event.title : (h1.textContent.trim() || DEFAULT_TITLE);
    h1.innerHTML = '<button type="button" class="btn btn-ghost btn-heading rr-switcher" data-result-switch aria-haspopup="dialog">'
      + '<span data-result-title>' + esc(title) + '</span>' + svg('chevrons') + '</button>';
  }
  function resultEntries() {
    if (!calendar) return [];
    const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const average = (e) => {
      const max = e.questions.reduce((a, q) => a + q.marks, 0);
      return Math.round(e.scores.reduce((a, [, marks]) => a + pct(marks.reduce((x, y) => x + y, 0), max), 0) / e.scores.length);
    };
    const live = calendar.events.find((e) => e.id === 'fractions-check');
    const list = [{ title: DEFAULT_TITLE, classLabel: live ? live.classLabel : 'Grade 5A', date: live ? calendar.date(live) : null, href: 'CAP-T13-Results.dc.html', current: !event, live: true }]
      .concat([...calendar.results.entries, ...(calendar.resultEvents || [])].map((e) => ({
        title: e.title, classLabel: e.classLabel, date: calendar.date(e), href: calendar.results.href(e), current: e === event, avg: average(e)
      })));
    return list.sort((a, b) => (b.date || 0) - (a.date || 0)).map((r) => Object.assign(r, { when: r.date ? fmt.format(r.date) : '' }));
  }
  function openSwitcher() {
    document.getElementById('rr-switch-dialog')?.remove();
    // 27 Nov (2): class above the name, date below; the current assessment swaps its icon for a solid check circle.
    const rows = resultEntries().map((r) => '<li><a class="dialog-list-item" href="' + esc(r.href) + '"' + (r.current ? ' aria-current="page"' : '') + '>'
      + (r.current ? CURRENT : svg('clipboard', 'icon icon-theme'))
      + '<span class="rr-switch-text"><span class="text-body-small text-muted-foreground">' + esc(r.classLabel) + '</span><span class="text-body-small font-semibold">' + esc(r.title) + (r.current ? '<span class="sr-only">, current assessment</span>' : '') + '</span>'
      + (r.when ? '<span class="text-body-small text-muted-foreground">' + esc(r.when) + '</span>' : '') + '</span>'
      + (r.live ? '<span class="badge badge-info">Live session</span>' : '<span class="badge ' + (r.avg >= 50 ? 'badge-success' : 'badge-destructive') + '">' + r.avg + '%</span>')
      + '</a></li>').join('');
    const wrap = document.createElement('div');
    wrap.innerHTML = '<dialog class="dialog rr-switch-dialog ' + themeOf() + '" id="rr-switch-dialog" aria-labelledby="rr-switch-title">'
      + '<div class="dialog-header"><h2 class="dialog-title" id="rr-switch-title">Assessments with results</h2>'
      + '<button type="button" class="btn btn-ghost btn-icon dialog-close" data-switch-close aria-label="Close">' + svg('x') + '</button></div>'
      + '<div class="dialog-body"><ul class="dialog-list" aria-label="Assessments with results">' + rows + '</ul></div></dialog>';
    const dlg = wrap.firstElementChild;
    document.body.append(dlg);   // outside the Canvas template, so a redraw never removes it
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-switch-close]')) dlg.close(); });
    dlg.addEventListener('close', () => { dlg.remove(); document.querySelector('[data-result-switch]')?.focus({ preventScroll: true }); });
    dlg.showModal();
    (dlg.querySelector('[aria-current="page"]') || dlg.querySelector('.dialog-list-item'))?.focus({ preventScroll: true });
  }

  function sampleRecords() {
    const marks = [9, 7, 10, 5, 8];
    const all = {};
    live.ROSTER.forEach((s, i) => {
      all[s.passcode] = i < marks.length
        ? { name: s.name, status: 'submitted', marks: marks[i], max: 10, byQuestion: [Math.min(4, marks[i] - 1), Math.min(4, marks[i] - 2), 1, marks[i] > 6 ? 1 : 0] }
        : { name: s.name, status: 'progress' };
    });
    return all;
  }

  function rows() {
    if (event) {
      const max = MAX_Q.reduce((a,b)=>a+b,0);
      return event.scores.map(([name, byQuestion]) => ({
        name, byQuestion, max, status:'submitted', marks:byQuestion.reduce((a,b)=>a+b,0)
      }));
    }
    const data = sample ? sampleRecords() : records;
    return live.ROSTER.map((s) => Object.assign({ passcode: s.passcode, name: s.name, status: 'none' }, data[s.passcode] || {}, { name: s.name }));
  }

  function panelHtml() {
    const where = sample ? 'Showing sample results' : ({
      live: '',
      connecting: 'Connecting',
      offline: 'Can’t reach Firebase on this network. Showing this browser only.',
      local: 'This browser only (add Firebase to go live)'
    })[live.connection()];
    const actions = '<button type="button" class="btn btn-ghost is-destructive" data-live="reset" aria-haspopup="dialog">Reset session</button>';
    return '<div class="rr-live" data-live-slot data-live-panel>'
      + '<div class="rr-live-row"><p>Learners join at</p><button type="button" class="btn btn-outline" data-live="copy" title="' + esc(live.joinUrl()) + '">' + (copied ? 'Copied' : 'Copy link') + '</button></div>'
      + '<div class="rr-live-row"><p>Session code</p><strong>' + esc(live.SESSION_CODE) + '</strong></div>'
      + (where ? '<p class="rr-live-where">' + esc(where) + '</p>' : '')
      + '<div class="rr-live-actions">' + actions + '</div></div>';
  }

  function distributionSvg(submitted) {
    const bands = [[0, 49, '<50'], [50, 59, '50–59'], [60, 69, '60–69'], [70, 79, '70–79'], [80, 89, '80–89'], [90, 100, '90–100']];
    const counts = bands.map(([lo, hi]) => submitted.filter((r) => { const p = pct(r.marks, r.max); return p >= lo && p <= hi; }).length);
    const top = Math.max(1, ...counts);
    const step = top <= 5 ? 1 : Math.ceil(top / 4);
    const axisTop = Math.ceil(top / step) * step;
    const X0 = 28, X1 = 364, Y0 = 10, Y1 = 140, slot = (X1 - X0) / bands.length, w = slot - 12;
    let out = '';
    for (let t = 0; t <= axisTop; t += step) {
      const y = Y1 - ((Y1 - Y0) * t) / axisTop;
      out += '<path class="rr-grid" d="M' + X0 + ' ' + y + 'H' + X1 + '"/><text x="16" y="' + (y + 5) + '" text-anchor="end">' + t + '</text>';
    }
    bands.forEach((b, i) => {
      const h = ((Y1 - Y0) * counts[i]) / axisTop, x = X0 + i * slot + 6;
      const range = i === 0 ? 'less than 50%' : b[2] + '%';
      const tip = counts[i] + ' ' + (counts[i] === 1 ? 'learner' : 'learners') + ' scored ' + range;
      out += '<g class="rr-col" tabindex="0" role="img" aria-label="' + esc(tip) + '" data-tip="' + esc(tip) + '" data-x="' + (x + w / 2) + '" data-y="' + (Y1 - h) + '">'
        + '<rect class="rr-hit" x="' + (X0 + i * slot) + '" y="' + Y0 + '" width="' + slot + '" height="' + (Y1 - Y0) + '"/>'
        + '<rect class="rr-bar" x="' + x + '" y="' + (Y1 - h) + '" width="' + w + '" height="' + h + '"/></g>'
        + '<text x="' + (x + w / 2) + '" y="164" text-anchor="middle" aria-hidden="true">' + esc(b[2]) + '</text>';
    });
    out += '<path class="rr-baseline" d="M' + X0 + ' ' + Y1 + 'H' + X1 + '"/>';
    const label = submitted.length ? 'Score distribution: ' + bands.map((b, i) => counts[i] + ' in ' + b[2]).join(', ') : 'No scores yet.';
    return { out, label };
  }

  function apply() {
    const page = document.querySelector('.rr-page');
    if (!page) return;
    const list = rows();
    const submitted = list.filter((r) => r.status === 'submitted');
    const total = list.length;
    const avg = submitted.length ? Math.round(submitted.reduce((a, r) => a + pct(r.marks, r.max), 0) / submitted.length) : null;

    if (event) {
      const heading = page.querySelector('[data-result-title]');
      if (heading) heading.textContent = event.title;
      page.querySelector('.rr-kicker').textContent = event.classLabel;
      page.querySelector('[data-stack="live"]')?.remove();
      const date = new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(calendar.date(event));
      const details = [['Class',event.classLabel],['Subject',event.subject || calendar.subject],['Session date',date],
        ['Learners',total],['Number of items',MAX_Q.length],['Total points',MAX_Q.reduce((a,b)=>a+b,0)]];
      page.querySelector('.rr-details').innerHTML = '<dl>' + details.map(([label,value]) =>
        '<div><dt>' + esc(label) + '</dt><dd>' + esc(value) + '</dd></div>').join('') + '</dl>';
    }

    // Live session card
    const slot = page.querySelector('[data-live-panel], [data-live-slot]');
    if (slot) {
      const wrap = document.createElement('div');
      wrap.innerHTML = panelHtml();
      slot.replaceWith(wrap.firstChild);
    }

    // Heading summary
    const badge = page.querySelector('[data-live-avg]');
    if (badge) {
      badge.textContent = avg === null ? 'No scores yet' : avg + '% Average score';
      // 27 Nov: red below the 50% benchmark, as on Overview, Results overview.
      badge.className = 'badge ' + (avg === null ? 'badge-secondary' : avg >= 50 ? 'badge-success' : 'badge-destructive');
    }
    const count = page.querySelector('[data-live-submitted]');
    if (count) {
      const msg = submitted.length + '/' + total + ' learners submitted';
      if (count.textContent !== msg) count.textContent = msg;
    }

    // Score distribution
    const svg = page.querySelector('.rr-distribution');
    if (svg) { const d = distributionSvg(submitted); svg.innerHTML = d.out; svg.setAttribute('aria-label', d.label); }

    // Performance by item
    const perQ = MAX_Q.map((m, q) => pct(submitted.reduce((a, r) => a + ((r.byQuestion || [])[q] || 0), 0), m * submitted.length));
    const perf = page.querySelector('.rr-performance');
    if (perf) {
      perf.innerHTML = perQ.map((p, q) => '<div class="rr-performance-row"><span>Q' + (q + 1) + '</span><div class="rr-track"><span style="width:' + p + '%"></span></div><strong>' + (submitted.length ? p + '%' : '–') + '</strong></div>').join('');
    }

    // Key insights
    const ins = page.querySelector('.rr-insights');
    if (ins) {
      const weakest = submitted.length ? perQ.map((p, q) => ({ q: q + 1, p })).sort((a, b) => a.p - b.p)[0] : null;
      const waiting = total - submitted.length;
      ins.innerHTML = (
        '<div class="rr-insight"><span class="rr-icon rr-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m16 9-5.5 5.5L8 12" /></svg></span><div><strong>' + (avg === null ? 'Waiting for the first hand-in' : avg + '% average score') + '</strong><p>' + (avg === null ? 'Results appear here as soon as a learner hands in.' : 'Based on ' + submitted.length + ' auto-scored ' + (submitted.length === 1 ? 'test' : 'tests') + '.') + '</p></div></div>'
        + '<div class="rr-insight"><span class="rr-icon rr-warning"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg></span><div><strong>' + (weakest ? 'Q' + weakest.q + ' is the hardest so far' : waiting + ' learners still to hand in') + '</strong><p>' + (weakest ? weakest.p + '% of marks earned. A good one to revisit with the class.' : 'Copy the link and share the session code to get started.') + '</p></div></div>');
    }

    // Student table (12 Nov: rows do not open anything; columns sort from their headers)
    const body = page.querySelector('.rr-review-panel tbody');
    if (body) {
      const now = Date.now();
      const rank = { submitted: 0, progress: 1, joined: 2, none: 3 };
      const sorted = list.slice();
      if (sortKey) sorted.sort((a, b) => {
        const v = (r) => sortKey === 'name' ? r.name : sortKey === 'score' ? (r.status === 'submitted' ? pct(r.marks, r.max) : -1) : sortKey === 'status' ? (rank[r.status] ?? 9) : 'Private';
        const x = v(a), y = v(b);
        return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sortDir;
      });
      body.innerHTML = sorted.map((r) => {
        const done = r.status === 'submitted';
        const label = done ? 'Scored' : r.status === 'progress' ? 'In progress' : r.status === 'joined' ? 'Signed in' : 'Not started';
        const tone = done ? 'success' : (r.status === 'progress' || r.status === 'joined') ? 'info' : 'secondary';
        const fresh = done && arrived[r.passcode] && now - arrived[r.passcode] < 4000;
        const photo = PHOTOS[r.name];
        const avatar = '<span class="rr-avatar" aria-hidden="true">' + (photo ? '<img src="' + photo + '" alt="" width="32" height="32">' : esc(initials(r.name))) + '</span>';
        return '<tr data-result-row data-status="' + (done ? 'scored' : 'missing') + '"' + (fresh ? ' class="rr-new"' : '') + '>'
          + '<td><span class="rr-student">' + avatar + '<span>' + esc(r.name) + '</span></span></td>'
          + '<td>Private</td>'
          + '<td class="num">' + (done ? esc(r.marks) + '/' + esc(r.max) : '–') + '</td>'
          + '<td class="rr-end"><span class="rr-status badge badge-' + tone + '">' + label + '</span></td></tr>';
      }).join('');
    }
    page.querySelectorAll('[data-sort-th]').forEach((th) => th.setAttribute('aria-sort', th.dataset.sortTh === sortKey ? (sortDir > 0 ? 'ascending' : 'descending') : 'none'));

    // Card deck: every card shares one grid cell; margin-top places it, the last card is in front and open
    const prev = deckPrev || deck, wasFront = prev[prev.length - 1], front = deck[deck.length - 1];
    page.querySelectorAll('[data-stack]').forEach((c) => {
      const k = c.dataset.stack, i = deck.indexOf(k), on = k === front;
      c.style.setProperty('--from', prev.indexOf(k) * STRIP + 'px');
      c.style.setProperty('--to', i * STRIP + 'px');
      c.style.zIndex = String(i + 1);
      c.classList.toggle('is-open', on);
      c.classList.toggle('is-opening', on && deckPrev !== null && wasFront !== k);
      c.classList.toggle('is-closing', !on && deckPrev !== null && wasFront === k);
      const btn = c.querySelector('[data-stack-toggle]');
      if (btn) { btn.setAttribute('aria-expanded', String(on)); btn.tabIndex = on ? -1 : 0; }
      const b = c.querySelector('.rr-stack-body'); if (b) b.inert = !on;
    });

    // Search field shows from the search icon (and stays while it has text)
    const sbox = page.querySelector('.rr-search'), sinput = document.getElementById('resultSearch');
    if (sbox) sbox.hidden = !(searchOpen || (sinput && sinput.value));
    page.querySelector('[data-result-search]')?.setAttribute('aria-pressed', String(!!(sbox && !sbox.hidden)));

    // Let the existing filter and search re-run over the new rows.
    document.getElementById('resultSearch')?.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function onData(all) {
    const now = Date.now();
    Object.entries(all).forEach(([k, r]) => {
      if (r.status === 'submitted' && !arrived[k]) arrived[k] = firstLoad ? 1 : now;
      if (r.status !== 'submitted') delete arrived[k];
    });
    firstLoad = false;
    records = all;
    apply();
    setTimeout(apply, 4200); // clear the arrival highlight
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-result-switch]')) { openSwitcher(); return; }
    const b = e.target.closest('[data-live]');
    if (b) {
      const act = b.dataset.live;
      if (act === 'copy') { navigator.clipboard?.writeText(live.joinUrl()); copied = true; apply(); document.querySelector('[data-live="copy"]')?.focus({ preventScroll: true }); setTimeout(() => { copied = false; apply(); }, 2000); }
      if (act === 'reset') openReset();
      if (act === 'cancel') document.getElementById('rr-reset-dialog')?.close();
      if (act === 'reset-yes') { document.getElementById('rr-reset-dialog')?.close(); sample = false; live.reset().then(apply); }
      return;
    }
    const sortBtn = e.target.closest('[data-sort]');
    if (sortBtn) { const k = sortBtn.dataset.sort; if (sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = 1; } apply(); document.querySelector('[data-sort="' + k + '"]')?.focus({ preventScroll: true }); return; }
    const card = e.target.closest('[data-stack-toggle]');
    if (card) {
      const k = card.dataset.stackToggle;
      if (deck[deck.length - 1] === k) return;
      deckPrev = deck; deck = deck.filter((x) => x !== k).concat(k); apply();
      clearTimeout(deckTimer); deckTimer = setTimeout(() => { deckPrev = null; apply(); }, 250);
      // Keep focus on the card that came to the front without scrolling the page (no jump).
      document.querySelector('[data-stack-toggle="' + k + '"]')?.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest('[data-result-search]')) {
      const input = document.getElementById('resultSearch');
      searchOpen = !(searchOpen || (input && input.value));
      if (!searchOpen && input && input.value) { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); }
      apply(); if (searchOpen) document.getElementById('resultSearch')?.focus({ preventScroll: true });
    }
  });
  // Reset session (12 Nov): a small confirmation dialog (shared Dialog component) with a ghost Cancel.
  function openReset() {
    let dlg = document.getElementById('rr-reset-dialog');
    if (!dlg) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<dialog class="dialog rr-reset-dialog ' + themeOf() + '" id="rr-reset-dialog" aria-labelledby="rr-reset-title" aria-describedby="rr-reset-desc">'
        + '<div class="dialog-header"><h2 class="dialog-title" id="rr-reset-title">Reset this session?</h2>'
        + '<button type="button" class="btn btn-ghost btn-icon dialog-close" data-live="close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>'
        + '<p class="dialog-description" id="rr-reset-desc">This clears every result in this session. Learners will need to hand in again.</p></div>'
        + '<div class="rr-reset-actions dialog-footer"><button type="button" class="btn btn-ghost btn-lg" data-live="cancel">Cancel</button>'
        + '<button type="button" class="btn btn-destructive btn-lg" data-live="reset-yes">Clear results</button></div></dialog>';
      dlg = wrap.firstElementChild;
      document.body.append(dlg);   // outside the Canvas template, so a redraw never removes it
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });   // click on the backdrop
      dlg.addEventListener('close', () => document.querySelector('[data-live="reset"]')?.focus({ preventScroll: true }));
    }
    dlg.showModal();
    dlg.querySelector('[data-live="cancel"]').focus({ preventScroll: true });
  }

  // Score distribution: a white tooltip follows the hovered (or focused) column
  const showTip = (col) => {
    const tip = document.getElementById('rr-chart-tip'), svg = col.ownerSVGElement;
    if (!tip || !svg) return;
    const scale = svg.getBoundingClientRect().width / 368;
    tip.textContent = col.dataset.tip;
    tip.hidden = false;
    const half = tip.offsetWidth / 2, cw = svg.getBoundingClientRect().width;
    tip.style.left = Math.min(Math.max(Number(col.dataset.x) * scale, half), cw - half) + 'px';   // keep it inside the chart
    tip.style.top = Number(col.dataset.y) * scale + 'px';
    col.setAttribute('aria-describedby', 'rr-chart-tip');
  };
  const hideTip = () => { const tip = document.getElementById('rr-chart-tip'); if (tip) tip.hidden = true; };
  document.addEventListener('mouseover', (e) => { const col = e.target.closest?.('.rr-col'); if (col) showTip(col); else if (e.target.closest?.('.rr-chart') === null) hideTip(); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest?.('.rr-chart') && !e.relatedTarget?.closest?.('.rr-chart')) hideTip(); });
  document.addEventListener('focusin', (e) => { const col = e.target.closest?.('.rr-col'); if (col) showTip(col); });
  document.addEventListener('focusout', (e) => { if (e.target.closest?.('.rr-col')) hideTip(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && e.target.id === 'resultSearch' && !e.target.value) { searchOpen = false; apply(); document.querySelector('[data-result-search]')?.focus({ preventScroll: true }); return; }
    if (!event && e.shiftKey && (e.key === 'D' || e.key === 'd') && !e.target.closest('input, textarea')) { sample = !sample; apply(); }
  });

  document.addEventListener('DOMContentLoaded', () => {
    mountSwitcher();
    if (event) apply(); else live.watch(onData);
    const root = document.querySelector('x-dc');
    // Re-apply after each Canvas redraw (menus, role switcher).
    if (root) new MutationObserver(() => {
      mountSwitcher();
      if (!document.querySelector('[data-live-panel]')) apply();
    }).observe(root, { childList: true });
  });
})();
