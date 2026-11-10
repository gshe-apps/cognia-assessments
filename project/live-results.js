// Teacher Results, live: rebuilds the summary, charts and student table from the live session.
// The Canvas runtime redraws the page when menus open, so everything here is re-applied after each redraw.
(() => {
  const live = window.CogniaLive;
  if (!live) return;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const MAX_Q = [4, 4, 1, 1];

  let records = {};
  let sample = false;          // Shift + D: sample results if the venue connection drops
  let confirmReset = false;
  let copied = false;
  const arrived = {};          // passcode -> time it was first seen submitted (for the highlight)
  let firstLoad = true;

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
    const data = sample ? sampleRecords() : records;
    return live.ROSTER.map((s) => Object.assign({ passcode: s.passcode, name: s.name, status: 'none' }, data[s.passcode] || {}, { name: s.name }));
  }

  function panelHtml() {
    const where = sample ? 'Showing sample results' : ({
      live: 'Live across devices',
      connecting: 'Connecting',
      offline: 'Can’t reach Firebase on this network. Showing this browser only.',
      local: 'This browser only (add Firebase to go live)'
    })[live.connection()];
    const actions = confirmReset
      ? '<p class="rr-live-confirm">Clear every result in this session?</p><button type="button" class="btn btn-outline btn-sm" data-live="cancel">Cancel</button><button type="button" class="btn btn-destructive btn-sm" data-live="reset-yes">Clear results</button>'
      : '<button type="button" class="btn btn-ghost is-destructive" data-live="reset">Reset session</button>';
    return '<section class="rr-live" aria-label="Live session" data-live-slot data-live-panel>'
      + '<div class="rr-live-row"><p>Students join at</p><button type="button" class="btn btn-outline" data-live="copy" title="' + esc(live.joinUrl()) + '">' + (copied ? 'Copied' : 'Copy link') + '</button></div>'
      + '<div class="rr-live-row"><p>Session code</p><strong>' + esc(live.SESSION_CODE) + '</strong></div>'
      + '<p class="rr-live-where">' + esc(where) + '</p>'
      + '<div class="rr-live-actions">' + actions + '</div></section>';
  }

  function distributionSvg(submitted) {
    const bands = [[0, 49, '<50'], [50, 59, '50–59'], [60, 69, '60–69'], [70, 79, '70–79'], [80, 89, '80–89'], [90, 100, '90–100']];
    const counts = bands.map(([lo, hi]) => submitted.filter((r) => { const p = pct(r.marks, r.max); return p >= lo && p <= hi; }).length);
    const top = Math.max(1, ...counts);
    const step = top <= 5 ? 1 : Math.ceil(top / 4);
    const axisTop = Math.ceil(top / step) * step;
    const X0 = 48, X1 = 364, Y0 = 10, Y1 = 140, slot = (X1 - X0) / bands.length, w = slot - 12;
    let out = '<text class="rr-axis-label" transform="translate(12 70) rotate(-90)" text-anchor="middle">Learners</text>';
    for (let t = 0; t <= axisTop; t += step) {
      const y = Y1 - ((Y1 - Y0) * t) / axisTop;
      out += '<path class="rr-grid" d="M' + X0 + ' ' + y + 'H' + X1 + '"/><text x="38" y="' + (y + 5) + '" text-anchor="end">' + t + '</text>';
    }
    bands.forEach((b, i) => {
      const h = ((Y1 - Y0) * counts[i]) / axisTop, x = X0 + i * slot + 6;
      out += '<rect class="rr-bar" x="' + x + '" y="' + (Y1 - h) + '" width="' + w + '" height="' + h + '"/><text x="' + (x + w / 2) + '" y="164" text-anchor="middle">' + esc(b[2]) + '</text>';
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
      badge.className = 'badge ' + (avg === null ? 'badge-secondary' : 'badge-success');
    }
    const count = page.querySelector('[data-live-submitted]');
    if (count) {
      const msg = submitted.length + '/' + total + ' students submitted';
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
      ins.querySelectorAll('.rr-insight').forEach((el) => el.remove());
      ins.querySelector('h2').insertAdjacentHTML('afterend',
        '<div class="rr-insight"><span class="rr-icon rr-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></svg></span><div><strong>' + (avg === null ? 'Waiting for the first hand-in' : avg + '% average score') + '</strong><p>' + (avg === null ? 'Results appear here as soon as a student hands in.' : 'Based on ' + submitted.length + ' auto-scored ' + (submitted.length === 1 ? 'test' : 'tests') + '.') + '</p></div></div>'
        + '<div class="rr-insight"><span class="rr-icon rr-warning"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 10 18H2zM12 9v5M12 17h.01"/></svg></span><div><strong>' + (weakest ? 'Q' + weakest.q + ' is the hardest so far' : waiting + ' students still to hand in') + '</strong><p>' + (weakest ? weakest.p + '% of marks earned. A good one to revisit with the class.' : 'Copy the link and share the session code to get started.') + '</p></div></div>');
    }

    // Student table
    const body = page.querySelector('.rr-review-panel tbody');
    if (body) {
      const now = Date.now();
      body.innerHTML = list.map((r) => {
        const done = r.status === 'submitted';
        const label = done ? 'Scored' : r.status === 'progress' ? 'In progress' : r.status === 'joined' ? 'Signed in' : 'Not started';
        const tone = done ? 'success' : (r.status === 'progress' || r.status === 'joined') ? 'info' : 'secondary';
        const fresh = done && arrived[r.passcode] && now - arrived[r.passcode] < 4000;
        const href = done ? 'CAP-T15-ScoreResponse.dc.html' : 'CAP-T19-MissingSubmissions.dc.html';
        return '<tr data-result-row data-status="' + (done ? 'scored' : 'missing') + '" class="row-link' + (fresh ? ' rr-new' : '') + '">'
          + '<td><span class="rr-student"><span class="rr-avatar" aria-hidden="true">' + esc(initials(r.name)) + '</span><a href="' + href + '">' + esc(r.name) + '</a></span></td>'
          + '<td>Private</td>'
          + '<td class="num">' + (done ? esc(r.marks) + '/' + esc(r.max) : '–') + '</td>'
          + '<td><span class="rr-status badge badge-' + tone + '">' + label + '</span></td></tr>';
      }).join('');
    }
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
    const b = e.target.closest('[data-live]');
    if (b) {
      const act = b.dataset.live;
      if (act === 'copy') { navigator.clipboard?.writeText(live.joinUrl()); copied = true; apply(); document.querySelector('[data-live="copy"]')?.focus(); setTimeout(() => { copied = false; apply(); }, 2000); }
      if (act === 'reset') { confirmReset = true; apply(); document.querySelector('[data-live="cancel"]')?.focus(); }
      if (act === 'cancel') { confirmReset = false; apply(); document.querySelector('[data-live="reset"]')?.focus(); }
      if (act === 'reset-yes') { confirmReset = false; sample = false; live.reset().then(apply); }
      return;
    }
    // The whole student row opens that student's response; the name link stays the keyboard target.
    const row = e.target.closest('.rr-review-panel tr.row-link');
    if (row && !e.target.closest('a, button')) row.querySelector('a[href]')?.click();
  });
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && (e.key === 'D' || e.key === 'd') && !e.target.closest('input, textarea')) { sample = !sample; apply(); }
  });

  document.addEventListener('DOMContentLoaded', () => {
    live.watch(onData);
    const root = document.querySelector('x-dc');
    // Re-apply after each Canvas redraw (menus, role switcher).
    if (root) new MutationObserver(() => { if (!document.querySelector('[data-live-panel]')) apply(); }).observe(root, { childList: true });
  });
})();
