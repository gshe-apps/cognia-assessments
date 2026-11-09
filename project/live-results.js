// Teacher Results, live: rebuilds the summary, charts and student table from the live session.
// The Canvas runtime redraws the page when menus open, so everything here is re-applied after each redraw.
(() => {
  const live = window.CogniaLive;
  if (!live) return;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

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

  function panelHtml(list) {
    const done = list.filter((r) => r.status === 'submitted').length;
    const joined = list.filter((r) => r.status !== 'none').length;
    const total = list.length;
    const message = joined === 0 ? 'Waiting for students to join'
      : done === total ? 'All ' + total + ' students have handed in'
      : done + ' of ' + total + ' handed in · ' + (joined - done) + ' working';
    const where = sample ? 'Showing sample results' : ({
      live: 'Live across devices',
      connecting: 'Connecting',
      offline: 'Can’t reach Firebase on this network. Showing this browser only.',
      local: 'This browser only (add Firebase to go live)'
    })[live.connection()];
    const resetControls = confirmReset
      ? '<span class="rr-live-confirm">Clear every result in this session?</span><button type="button" class="btn small btn-outline btn-sm" data-live="cancel">Cancel</button><button type="button" class="btn small solid btn-sm" data-live="reset-yes">Clear results</button>'
      : '<button type="button" class="btn small btn-outline btn-sm" data-live="reset">Reset session</button>';
    return '<section class="rr-panel rr-live" aria-labelledby="live-title" data-live-panel>'
      + '<div class="rr-live-main"><div class="rr-live-code"><h2 id="live-title">Session code</h2><strong>' + esc(live.SESSION_CODE) + '</strong></div>'
      + '<div class="rr-live-join"><h2>Students join at</h2><p><span class="rr-live-url">' + esc(live.joinUrl()) + '</span><button type="button" class="btn small btn-outline btn-sm" data-live="copy">' + (copied ? 'Copied' : 'Copy link') + '</button></p></div>'
      + '<div class="rr-live-progress"><h2>Progress</h2><p role="status" aria-live="polite"><strong>' + esc(message) + '</strong></p><p>' + esc(where) + '</p></div></div>'
      + '<div class="rr-live-actions">' + resetControls + '</div></section>';
  }

  function apply() {
    const page = document.querySelector('.rr-page');
    if (!page) return;
    const list = rows();
    const submitted = list.filter((r) => r.status === 'submitted');
    const total = list.length;
    const avg = submitted.length ? Math.round(submitted.reduce((a, r) => a + pct(r.marks, r.max), 0) / submitted.length) : null;
    document.querySelector('.cap-root')?.classList.add('rr-live-on');

    // Live panel, under the page heading
    const old = page.querySelector('[data-live-panel]');
    const wrap = document.createElement('div');
    wrap.innerHTML = panelHtml(list);
    if (old) old.replaceWith(wrap.firstChild); else page.querySelector('.rr-heading')?.after(wrap.firstChild);

    // Context line
    const ctx = page.querySelector('.rr-context span');
    if (ctx) ctx.textContent = 'Grade 5A · Session ' + live.SESSION_CODE + ' · 4 questions · 10 marks';

    // Summary
    const stats = page.querySelectorAll('.rr-stat');
    const set = (i, value, note) => { if (!stats[i]) return; stats[i].querySelector('strong').textContent = value; stats[i].querySelector('p').textContent = note; };
    set(0, submitted.length + ' / ' + total, 'Students submitted');
    set(1, String(submitted.length), 'Auto-scored on hand-in');
    set(2, '0', 'Nothing to review by hand');
    set(3, avg === null ? 'No scores yet' : avg + '%', avg === null ? 'Appears after the first hand-in' : 'Across ' + submitted.length + ' submitted ' + (submitted.length === 1 ? 'student' : 'students'));

    // Score distribution
    const bands = [[0, 49, '<50'], [50, 59, '50–59'], [60, 69, '60–69'], [70, 79, '70–79'], [80, 89, '80–89'], [90, 100, '90–100']];
    const counts = bands.map(([lo, hi]) => submitted.filter((r) => { const p = pct(r.marks, r.max); return p >= lo && p <= hi; }).length);
    const top = Math.max(1, ...counts);
    const svg = page.querySelector('.rr-distribution');
    if (svg) {
      svg.setAttribute('aria-label', submitted.length ? 'Score distribution: ' + bands.map((b, i) => counts[i] + ' in ' + b[2]).join(', ') : 'No scores yet.');
      svg.innerHTML = '<path class="rr-grid" d="M42 60H360M42 105H360M42 150H360"/><text x="24" y="65">' + top + '</text><text x="24" y="155">0</text>'
        + bands.map((b, i) => { const h = counts[i] ? Math.round((counts[i] / top) * 90) : 2, x = 54 + i * 51;
          return '<g><rect class="rr-bar rr-bar-' + i + '" x="' + x + '" y="' + (152 - h) + '" width="34" height="' + h + '" rx="4"/><text x="' + (x + 17) + '" y="' + (142 - h) + '" text-anchor="middle">' + counts[i] + '</text><text x="' + (x + 17) + '" y="174" text-anchor="middle">' + b[2] + '</text></g>'; }).join('');
      const note = svg.previousElementSibling;
      if (note && note.tagName === 'P') note.textContent = 'Submitted students · score range (%)';
    }

    // Performance by question
    const perf = page.querySelector('.rr-performance');
    if (perf) {
      const maxQ = [4, 4, 1, 1];
      perf.innerHTML = maxQ.map((m, q) => {
        const got = submitted.reduce((a, r) => a + ((r.byQuestion || [])[q] || 0), 0);
        const p = pct(got, m * submitted.length);
        return '<div class="rr-performance-row' + (submitted.length && p < 60 ? ' rr-low' : '') + '"><span>Q' + (q + 1) + '</span><div class="rr-track"><span style="width:' + p + '%"></span></div><strong>' + (submitted.length ? p + '%' : '–') + '</strong></div>';
      }).join('');
      const note = perf.previousElementSibling;
      if (note && note.tagName === 'P') note.textContent = 'Live · % of marks earned';
    }

    // Key insights
    const ins = page.querySelector('.rr-insights');
    if (ins) {
      const weakest = submitted.length ? [4, 4, 1, 1].map((m, q) => ({ q: q + 1, p: pct(submitted.reduce((a, r) => a + ((r.byQuestion || [])[q] || 0), 0), m * submitted.length) })).sort((a, b) => a.p - b.p)[0] : null;
      const waiting = total - submitted.length;
      ins.querySelectorAll('.rr-insight').forEach((el) => el.remove());
      ins.insertAdjacentHTML('beforeend',
        '<div class="rr-insight"><span class="rr-icon rr-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></svg></span><div><strong>' + (avg === null ? 'Waiting for the first hand-in' : avg + '% average score') + '</strong><p>' + (avg === null ? 'Results appear here as soon as a student hands in.' : 'Based on ' + submitted.length + ' auto-scored ' + (submitted.length === 1 ? 'test' : 'tests') + '.') + '</p></div></div>'
        + '<div class="rr-insight"><span class="rr-icon rr-warning"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 10 18H2zM12 9v5M12 17h.01"/></svg></span><div><strong>' + (weakest ? 'Q' + weakest.q + ' is the hardest so far' : waiting + ' students still to hand in') + '</strong><p>' + (weakest ? weakest.p + '% of marks earned. A good one to revisit with the class.' : 'Share the session code and link above to get started.') + '</p></div></div>');
    }

    // Student table
    const body = page.querySelector('.rr-review-panel tbody');
    if (body) {
      const now = Date.now();
      body.innerHTML = list.map((r) => {
        const done = r.status === 'submitted';
        const filter = done ? 'scored' : 'missing';
        const label = done ? 'Scored' : r.status === 'progress' ? 'In progress' : r.status === 'joined' ? 'Signed in' : 'Not started';
        const fresh = done && arrived[r.passcode] && now - arrived[r.passcode] < 4000;
        const action = done ? '<a class="btn small btn-outline btn-sm" href="CAP-T15-ScoreResponse.dc.html">View response <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>' : '<a class="btn small btn-outline btn-sm" href="CAP-T19-MissingSubmissions.dc.html">Review missing <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>';
        return '<tr data-result-row data-status="' + filter + '"' + ' class="row-link' + (fresh ? ' rr-new' : '') + '"' + '><td><span class="rr-student"><span class="rr-avatar">' + icon + '</span><strong>' + esc(r.name) + '</strong></span></td>'
          + '<td><span class="rr-status badge badge-' + (done ? 'success rr-scored' : r.status === 'progress' ? 'info rr-review' : r.status === 'joined' ? 'info' : 'secondary') + '">' + label + '</span></td>'
          + '<td class="num">' + (done ? esc(r.marks) + ' / ' + esc(r.max) : '–') + '</td><td>Private</td><td>' + action + '</td></tr>';
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
    if (!b) return;
    const act = b.dataset.live;
    if (act === 'copy') { navigator.clipboard?.writeText(live.joinUrl()); copied = true; apply(); setTimeout(() => { copied = false; apply(); }, 2000); }
    if (act === 'reset') { confirmReset = true; apply(); document.querySelector('[data-live="cancel"]')?.focus(); }
    if (act === 'cancel') { confirmReset = false; apply(); document.querySelector('[data-live="reset"]')?.focus(); }
    if (act === 'reset-yes') { confirmReset = false; sample = false; live.reset().then(apply); }
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
