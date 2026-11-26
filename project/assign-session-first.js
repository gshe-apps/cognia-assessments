/* Assign learners, Option B: session first, then learners (Figma CAP 1815:15378).
   A prototype option compared with Option A, learners first (audience-session-assignment.js),
   through the EPI-USE option switch (prototype-options.js). Both options read and write the
   same saved sessions (cogniaDeliverySessions), so switching keeps the teacher's work.
   Option B gives every test in the assessment its own sessions (session.testId); Option A
   shows all sessions together.
   Remove this file, its script tag and its educator.css block if Option A is chosen. */
(() => {
  const optionA = window.capReferenceAssign;
  if (!optionA || !window.capPrototypeOptions) return;
  const choice = window.capPrototypeOptions.register({
    id: 'assign',
    title: 'Assign learners step',
    options: [
      { key: 'a', name: 'Option A: Learners first', description: 'Choose classes and learners, then put each learner in a session.' },
      { key: 'b', name: 'Option B: Session first', description: 'Pick a test, set up its sessions, then tick the learners who take each one.' },
    ],
  });
  window.capReferenceAssign = (page) => (choice === 'b' ? sessionFirst(page) : optionA(page));

  function sessionFirst(page) {
    const key = 'cogniaDeliverySessions';
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const classes = [
      { id: '5a', name: 'Grade 5A', students: ['Aiden Brooks', 'Amara Singh', 'Ben Clarke', 'Chloe Martin', 'Daniel Kim', 'Emma Lewis'] },
      { id: '5b', name: 'Grade 5B', students: ['Finn Adams', 'Grace Chen', 'Hannah Davis', 'Isaac Evans'] },
    ];
    // Profile photos for some learners, as on the Classes screen; everyone else shows initials.
    const photos = { 'Aiden Brooks': 'learner-jack-alfredo.png', 'Chloe Martin': 'learner-maria-gonzalez.png', 'Emma Lewis': 'learner-kathrine-benedict.png' };
    const students = classes.flatMap((c) => c.students.map((name, i) => ({ id: c.id + ':' + i, name, classId: c.id, support: c.id === '5a' && [1, 4].includes(i) })));
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

    let tests;
    try { tests = JSON.parse(localStorage.getItem('cogniaAssessmentTestsV1'))?.tests; } catch {}
    tests = tests?.length ? tests.map((t) => ({ id: t.id, title: t.title || 'Untitled test' })) : [{ id: 'test-1', title: 'Fractions check' }];

    let data;
    try { data = JSON.parse(localStorage.getItem(key)); } catch {}
    if (!data || !Array.isArray(data.sessions) || !data.sessions.length || data.allocationVersion !== 1) {
      const firstClass = students.filter((s) => s.classId === '5a').map((s) => s.id);
      data = {
        allocationVersion: 1, classId: '5a', classIds: ['5a'], recipients: firstClass,
        sessions: [{ id: 'session-1', name: 'Session 1', opens: today + 'T09:00', due: today + 'T15:00', customRecipients: true, recipients: firstClass }],
        attempts: '1', time: 'None', accommodations: false,
      };
    }
    data.studentAccommodations ??= {};
    // Sessions saved before tests had their own sessions belong to the first test. A test with no
    // session yet starts with one, for the same learners as the first test's first session.
    data.sessions.forEach((s) => { if (!tests.some((t) => t.id === s.testId)) s.testId = tests[0].id; });
    const template = data.sessions.find((s) => s.testId === tests[0].id) || data.sessions[0];
    tests.forEach((t) => {
      if (!data.sessions.some((s) => s.testId === t.id)) {
        data.sessions.push({ id: 'session-' + t.id + '-1', testId: t.id, name: 'Session 1', opens: template.opens, due: template.due, customRecipients: true, recipients: [...template.recipients] });
      }
    });
    let remembered = {};
    try { remembered = JSON.parse(localStorage.getItem('cogniaLearnerSupports')) || {}; } catch {}

    let testId = tests[0].id;
    const activeByTest = {};
    let classId = data.classIds?.[0] || '5a';
    let search = '';
    const settingsOpen = new Set();
    const testSessions = (id = testId) => data.sessions.filter((s) => s.testId === id);
    const active = () => testSessions().find((s) => s.id === activeByTest[testId]) || testSessions()[0];
    const sessionOf = (id) => testSessions().find((s) => s.recipients.includes(id));
    const supportsFor = (id) => data.studentAccommodations[id] || [];
    const hasSupports = (s) => s.support || supportsFor(s.id).length > 0;
    const initials = (name) => name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
    const learnerCount = (n) => n + (n === 1 ? ' learner' : ' learners');
    const testTitle = (id = testId) => tests.find((t) => t.id === id).title;
    const when = (s) => s.noLimit ? 'Available at any time' : new Date(s.opens).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    // 24 Nov: stacked session cards read "Nov 24, 09:00 - 09:30".
    const range = (s) => s.noLimit ? 'Available at any time' : `${new Date(s.opens).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${s.opens.slice(11, 16)} - ${s.due.slice(11, 16)}`;
    const ICON = {
      plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
      search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
      circleCheck: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
      x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
      copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
      trash: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
      moreVertical: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
    };
    const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

    // Page shell, as Option A sets it up, without the "Tests in this assessment" section:
    // the test picker above the sessions replaces it.
    page.classList.add('allocation-page', 'assign-b-page');
    const hero = page.querySelector('.tf-hero');
    hero.classList.add('allocation-hero');
    hero.querySelector('h1').textContent = 'Assign to learners and sessions';
    hero.querySelector('p')?.remove();
    page.querySelector('.tf-top')?.remove();
    window.capRenderAssessmentProgress?.(hero.querySelector('.tf-steps'), 3, ['href="CAP-T04-Setup.dc.html"', 'href="CAP-T05-Questions.dc.html"', 'href="CAP-T06-Review.dc.html?stage=details"']);
    page.querySelectorAll('.tf-test-disclosure, .assessment-test-list').forEach((el) => el.remove());
    const form = page.querySelector('#deliveryForm');
    form.querySelector('.reviewgrid')?.remove();
    const host = document.createElement('div');
    host.className = 'assign-b';
    form.prepend(host);
    host.innerHTML = `
      <div class="assign-b-toolbar">
        <div class="tabs-list" role="group" aria-label="Test" data-tests></div>
        <button type="button" class="btn btn-outline" data-add-session>${icon('plus')}Another session</button>
      </div>
      <div class="assign-b-sessions" data-sessions></div>
      <section class="assign-b-learners" aria-labelledby="assign-b-learners-title">
        <h2 class="sr-only" id="assign-b-learners-title">Learners for the selected session</h2>
        <div class="search" role="search">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON.search}</svg>
          <input class="input search-input" type="search" placeholder="Search learners" aria-label="Search learners" data-search>
          <span class="tooltip-wrap search-clear"><button class="btn btn-ghost btn-icon btn-sm" type="button" aria-label="Clear search">${icon('x')}</button><span class="tooltip" role="tooltip">Clear search</span></span>
        </div>
        <div class="tabs-list" role="group" aria-label="Class" data-classes></div>
        <div class="assign-b-results">
          <div class="assign-b-count"><p class="text-body-base" data-count></p><button type="button" class="btn btn-ghost btn-sm" data-select-all></button></div>
          <ul class="assign-b-list item-group item-group-striped" data-list aria-label="Learners"></ul>
        </div>
        <p class="alert alert-destructive" data-error role="alert" tabindex="-1" hidden></p>
        <p class="sr-only" role="status" aria-live="polite" data-live></p>
      </section>`;
    const announce = (message) => { host.querySelector('[data-live]').textContent = message; };
    const needsReview = () => data.recipients.some((id) => hasSupports(students.find((s) => s.id === id)));

    function save() {
      data.sessions.forEach((s) => { s.customRecipients = true; });
      data.recipients = [...new Set(data.sessions.flatMap((s) => s.recipients))];
      data.classIds = classes.map((c) => c.id).filter((id) => id === classId || data.recipients.some((r) => r.startsWith(id + ':')));
      data.classId = data.classIds[0] || '5a';
      localStorage.setItem(key, JSON.stringify(data));
    }

    function drawTests() {
      host.querySelector('[data-tests]').innerHTML = tests.map((t) => `<button type="button" class="tab" aria-pressed="${t.id === testId}" data-test="${esc(t.id)}">${esc(t.title)}</button>`).join('');
    }

    function drawSessions() {
      const s = active();
      const i = testSessions().indexOf(s);
      const count = s.recipients.length;
      const disabled = s.noLimit ? 'disabled' : '';
      const others = testSessions().filter((x) => x !== s);
      host.querySelector('[data-sessions]').innerHTML = `
        ${others.length ? `<div class="assign-b-stack" role="group" aria-label="Other sessions for ${esc(testTitle())}">
          ${others.map((o) => `<button type="button" class="card assign-b-stack-item" data-activate="${esc(o.id)}" aria-label="Open ${esc(o.name || 'Unnamed session')}, ${learnerCount(o.recipients.length)} assigned">
            <span class="assign-b-stack-text"><span class="text-body-base font-semibold">${esc(o.name || 'Unnamed session')}</span><span class="text-body-small text-muted-foreground">${esc(range(o))}</span></span>
            <span class="badge ${o.recipients.length ? 'badge-secondary' : 'badge-warning'}" aria-hidden="true">${o.recipients.length ? learnerCount(o.recipients.length) + ' assigned' : 'No learners yet'}</span>
          </button>`).join('')}
        </div>` : ''}
        <section class="card assign-b-session" data-session="${esc(s.id)}" aria-label="${esc(s.name || 'Unnamed session')}, ${esc(testTitle())}">
          <div class="assign-b-session-head on-dark"><span class="text-body-base font-semibold" data-head-name>${esc(s.name || 'Unnamed session')}</span><span class="assign-b-session-tools"><span class="badge ${count ? 'badge-secondary' : 'badge-warning'}">${count ? learnerCount(count) + ' assigned' : 'No learners yet'}</span>
            <div class="dropdown dropdown-end"><button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Actions for ${esc(s.name || 'session')}" aria-haspopup="menu" aria-expanded="false" aria-controls="assign-b-menu-${esc(s.id)}">${icon('moreVertical')}</button>
              <div class="menu" role="menu" id="assign-b-menu-${esc(s.id)}" aria-label="Actions for ${esc(s.name || 'session')}" hidden>
                <button type="button" class="menu-item" role="menuitem" tabindex="-1" data-duplicate="${esc(s.id)}">${icon('copy')}Duplicate</button>
                ${i > 0 ? `<button type="button" class="menu-item is-destructive" role="menuitem" tabindex="-1" data-remove="${esc(s.id)}">${icon('trash')}Delete</button>` : ''}
              </div></div></span></div>
          <div class="assign-b-session-body">
            <label class="field"><span class="label">Name</span><input class="input" data-field="name" required maxlength="80" value="${esc(s.name)}"></label>
            <label class="field"><span class="label">Date</span><input class="input" type="date" data-field="date" required value="${esc(s.opens.slice(0, 10))}" ${disabled}></label>
            <div class="assign-b-times">
              <label class="field"><span class="label">Start time</span><input class="input" type="time" data-field="start" required value="${esc(s.opens.slice(11, 16))}" ${disabled}></label>
              <label class="field"><span class="label">End time</span><input class="input" type="time" data-field="end" required value="${esc(s.due.slice(11, 16))}" ${disabled}></label>
            </div>
            <details class="accordion-item assign-b-settings" ${settingsOpen.has(s.id) ? 'open' : ''}>
              <summary class="accordion-trigger">Access and instructions</summary>
              <div class="accordion-content assign-b-settings-content">
                ${i === 0 && testId === tests[0].id ? `<div class="assign-b-times">
                  <label class="field"><span class="label">Attempts</span><select class="select" id="attempts">${['1', '2', '3'].map((v) => `<option ${data.attempts === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
                  <label class="field"><span class="label">Time limit</span><select class="select" id="deliveryTime">${['None', '5 minutes', '10 minutes', '15 minutes', '20 minutes'].map((v) => `<option ${data.time === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
                </div>` : ''}
                <label class="allocation-check"><input class="checkbox" type="checkbox" data-anytime ${s.noLimit ? 'checked' : ''}>Available at any time</label>
                <label class="field"><span class="label">Session instructions</span><textarea class="textarea" maxlength="500" rows="2" data-instructions>${esc(s.instructions || '')}</textarea></label>
              </div>
            </details>
          </div>
        </section>
`;
    }

    function drawLearners() {
      const session = active();
      host.querySelector('[data-classes]').innerHTML = classes.map((c) => `<button type="button" class="tab" aria-pressed="${c.id === classId}" data-class="${c.id}">${esc(c.name)}</button>`).join('');
      const term = search.trim().toLowerCase();
      const roster = students.filter((s) => s.classId === classId);
      const shown = roster.filter((s) => s.name.toLowerCase().includes(term));
      const all = roster.length > 0 && roster.every((s) => session.recipients.includes(s.id));
      const className = classes.find((c) => c.id === classId).name;
      host.querySelector('[data-count]').textContent = term ? `${shown.length} of ${learnerCount(roster.length)}` : learnerCount(roster.length);
      const selectAll = host.querySelector('[data-select-all]');
      selectAll.innerHTML = (all ? 'All selected' : 'Select all') + icon('circleCheck');
      selectAll.setAttribute('aria-pressed', String(all));
      selectAll.setAttribute('aria-label', all ? `Clear all ${className} learners from ${session.name}` : `Add all ${className} learners to ${session.name}`);
      const list = host.querySelector('[data-list]');
      if (!shown.length) {
        list.innerHTML = `<li class="empty-state assign-b-empty"><span class="empty-media" aria-hidden="true">${icon('users')}</span><p class="empty-title">No learners found</p><p>Try another name, or choose the other class.</p></li>`;
        return;
      }
      list.innerHTML = shown.map((s) => {
        const other = sessionOf(s.id);
        const checked = other?.id === session.id;
        const inputId = 'assign-b-' + s.id.replace(':', '-');
        const avatar = photos[s.name] ? `<span class="avatar avatar-lg" aria-hidden="true"><img src="assets/avatars/${photos[s.name]}" alt=""></span>` : `<span class="avatar avatar-lg" aria-hidden="true">${initials(s.name)}</span>`;
        return `<li class="item assign-b-row" data-row="${s.id}">
          ${avatar}
          <label class="item-content" for="${inputId}"><span class="item-title">${esc(s.name)}${supportsFor(s.id).length ? ` <span class="badge badge-warning">${supportsFor(s.id).length} ${supportsFor(s.id).length === 1 ? 'support' : 'supports'}</span>` : ''}</span><span class="item-description">${esc(className.replace('Grade ', ''))}</span></label>
          <span class="item-actions">
            <span class="item-actions-reveal"><button type="button" class="btn btn-ghost btn-sm" data-supports="${s.id}" aria-haspopup="dialog" aria-label="Review supports for ${esc(s.name)}${hasSupports(s) ? ', supports set' : ''}">Review supports</button></span>
            <input class="checkbox checkbox-circle" type="checkbox" id="${inputId}" data-learner="${s.id}" ${checked ? 'checked' : ''}>
          </span></li>`;
      }).join('');
    }

    function update() { save(); drawTests(); drawSessions(); drawLearners(); }

    function setLearner(id, on) {
      const session = active();
      const from = sessionOf(id);
      testSessions().forEach((s) => { s.recipients = s.recipients.filter((r) => r !== id); });
      if (on) {
        session.recipients.push(id);
        if (!Object.hasOwn(data.studentAccommodations, id) && remembered[id]) data.studentAccommodations[id] = [...remembered[id]];
      }
      const name = students.find((s) => s.id === id).name;
      if (on && from && from.id !== session.id) announce(`${name} moved from ${from.name} to ${session.name}.`);
      else announce(on ? `${name} added to ${session.name}.` : `${name} removed from ${session.name}.`);
    }

    // A new session goes on top, and the one before it joins the folders underneath.
    // Duplicating copies the name, date, times and access settings, not the learners: a learner takes
    // a test in one session only.
    function addSession(source) {
      const last = source || testSessions().at(-1);
      const id = 'session-' + Date.now();
      const copy = source ? { ...source, name: source.name + ' copy' } : { opens: last.opens, due: last.due, name: 'Session ' + (testSessions().length + 1) };
      data.sessions.push({ ...copy, id, testId, customRecipients: true, recipients: [] });
      activeByTest[testId] = id;
      update();
      host.querySelector('[data-field="name"]')?.select();
      announce(`${active().name} added to ${testTitle()}. Tick the learners who take it.`);
    }

    // 24 Nov: switching sessions shuffles the cards smoothly. Each card is measured before and after the
    // redraw, then slides from its old place to its new one (skipped when the learner prefers less motion).
    function shuffle(redraw) {
      const cards = () => [...host.querySelectorAll('[data-sessions] [data-activate], [data-sessions] [data-session]')];
      const key = (el) => el.dataset.activate || el.dataset.session;
      const before = new Map(cards().map((el) => [key(el), el.getBoundingClientRect().top]));
      redraw();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      cards().forEach((el) => {
        const top = before.get(key(el));
        if (top === undefined) return;
        const dy = top - el.getBoundingClientRect().top;
        if (dy) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], { duration: 300, easing: 'cubic-bezier(.2, 0, 0, 1)' });
      });
    }
    host.addEventListener('click', (event) => {
      const b = event.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-add-session')) { addSession(); return; }
      if (b.dataset.test) {
        testId = b.dataset.test;
        update();
        host.querySelector(`[data-test="${testId}"]`)?.focus();
        announce(`Showing sessions for ${testTitle()}.`);
        return;
      }
      if (b.dataset.activate) {
        activeByTest[testId] = b.dataset.activate;
        shuffle(update);
        host.querySelector('[data-field="name"]')?.focus();
        return;
      }
      if (b.dataset.class) { classId = b.dataset.class; drawLearners(); return; }
      if (b.hasAttribute('data-select-all')) {
        const roster = students.filter((s) => s.classId === classId);
        const all = roster.every((s) => active().recipients.includes(s.id));
        roster.forEach((s) => setLearner(s.id, !all));
        const className = classes.find((c) => c.id === classId).name;
        announce(all ? `All ${className} learners removed from ${active().name}.` : `All ${className} learners added to ${active().name}.`);
        update();
        host.querySelector('[data-select-all]').focus();
        return;
      }
      if (b.dataset.supports) { openSupports(students.find((s) => s.id === b.dataset.supports)); return; }
      if (b.dataset.duplicate) { addSession(data.sessions.find((s) => s.id === b.dataset.duplicate)); return; }
      if (b.dataset.remove && testSessions().indexOf(data.sessions.find((s) => s.id === b.dataset.remove)) > 0) {
        const gone = data.sessions.find((s) => s.id === b.dataset.remove);
        data.sessions = data.sessions.filter((s) => s !== gone);
        delete activeByTest[testId];
        update();
        host.querySelector('[data-add-session]').focus();
        announce(`${gone.name} removed. Its learners are no longer assigned for ${testTitle()}.`);
        return;
      }
      if (b.closest('.search-clear')) {
        search = host.querySelector('[data-search]').value = '';
        drawLearners();
        host.querySelector('[data-search]').focus();
      }
    });
    // A click anywhere on a learner row ticks it, like the label does.
    host.addEventListener('click', (event) => {
      const row = event.target.closest('.assign-b-row');
      if (!row || event.target.closest('button, input, label, a')) return;
      row.querySelector('[data-learner]').click();
    });
    host.addEventListener('change', (event) => {
      const el = event.target;
      if (el.dataset.learner) { setLearner(el.dataset.learner, el.checked); save(); drawSessions(); drawLearners(); host.querySelector(`[data-learner="${el.dataset.learner}"]`)?.focus(); return; }
      if (el.id === 'attempts' || el.id === 'deliveryTime') { data.attempts = host.querySelector('#attempts').value; data.time = host.querySelector('#deliveryTime').value; save(); return; }
      if (el.hasAttribute('data-anytime')) { active().noLimit = el.checked; settingsOpen.add(active().id); update(); }
    });
    host.addEventListener('input', (event) => {
      const el = event.target;
      if (el.matches('[data-search]')) { search = el.value; drawLearners(); return; }
      if (!el.closest('[data-session]')) return;
      const s = active();
      const card = el.closest('[data-session]');
      if (el.dataset.field === 'name') {
        s.name = el.value;
        card.querySelector('[data-head-name]').textContent = el.value || 'Unnamed session';
      } else if (el.dataset.field) {
        const date = card.querySelector('[data-field=date]').value;
        s.opens = date + 'T' + card.querySelector('[data-field=start]').value;
        s.due = date + 'T' + card.querySelector('[data-field=end]').value;
      }
      if (el.hasAttribute('data-instructions')) s.instructions = el.value;
      save();
    });
    host.addEventListener('toggle', (event) => {
      if (event.target.matches('.assign-b-settings')) event.target.open ? settingsOpen.add(active().id) : settingsOpen.delete(active().id);
    }, true);

    // Review supports: opened from the button that shows on row hover or focus. 25 Nov: supports are an A to Z list.
    const supportOptions = ['Language support', 'Read aloud', 'Visual model', 'Step-by-step hint', 'Extension', 'Text-to-speech', 'Zoom / Magnifier', 'Extended time', 'High contrast', 'Color overlay', 'Braille (BRF)', 'Calculator'];
    const supportPaths = [
  '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />',
  '<path d="M12 5v16" /><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />',
  '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />',
  '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  '<path d="M12 4v16" /><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" /><path d="M9 20h6" />',
  '<circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /><line x1="11" x2="11" y1="8" y2="14" /><line x1="8" x2="14" y1="11" y2="11" />',
  '<line x1="10" x2="14" y1="2" y2="2" /><line x1="12" x2="15" y1="14" y2="11" /><circle cx="12" cy="14" r="8" />',
  '<circle cx="12" cy="12" r="10" /><path d="M12 18a6 6 0 0 0 0-12v12z" />',
  '<circle cx="15" cy="9" r="7" /><circle cx="9" cy="15" r="7" />',
  '<circle cx="12" cy="5" r="1" /><circle cx="19" cy="5" r="1" /><circle cx="5" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="12" cy="19" r="1" /><circle cx="19" cy="19" r="1" /><circle cx="5" cy="19" r="1" />',
  '<rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" />'
    ];
    const dialog = document.createElement('dialog');
    dialog.className = 'dialog assign-b-support-dialog';
    dialog.setAttribute('aria-labelledby', 'assign-b-support-title');
    // 25 Nov: built from the plugin's dialog parts, with the list as a .dialog-list in a .dialog-body.
    dialog.innerHTML = `<form class="assign-b-support-form">
      <div class="dialog-header">
        <h2 class="dialog-title" id="assign-b-support-title" tabindex="-1">Review supports</h2>
        <button class="btn btn-ghost btn-icon dialog-close" type="button" data-cancel aria-label="Close review supports">${icon('x')}</button>
      </div>
      <div class="dialog-body">
        <fieldset class="allocation-support-options"><legend class="sr-only">Learner supports</legend><ul class="dialog-list dialog-list-columns" data-support-options></ul></fieldset></div>
      <div class="dialog-footer">
        <label class="check assign-b-support-remember"><input class="checkbox" type="checkbox" name="remember">Save supports for future assignments</label>
        <button class="btn btn-ghost btn-lg" type="button" data-cancel>Cancel</button><button class="btn btn-lg" type="submit">Save supports</button>
      </div></form>`;
    page.append(dialog);
    let supportLearner;
    function openSupports(learner) {
      supportLearner = learner;
      dialog.querySelector('#assign-b-support-title').textContent = 'Review supports for ' + learner.name;
      const chosen = supportsFor(learner.id);
      dialog.querySelector('[data-support-options]').innerHTML = [...new Set([...supportOptions, ...chosen])].sort((a, b) => a.localeCompare(b)).map((o) => `<li><label class="dialog-list-item"><svg class="icon icon-theme" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${supportPaths[supportOptions.indexOf(o)] || ICON.plus}</svg><span>${esc(o)}</span><input class="checkbox checkbox-circle" name="support" type="checkbox" value="${esc(o)}" ${chosen.includes(o) ? 'checked' : ''}></label></li>`).join('');
      dialog.querySelector('[name=remember]').checked = Object.hasOwn(remembered, learner.id);
      dialog.showModal();
    }
    dialog.querySelectorAll('[data-cancel]').forEach((b) => b.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => host.querySelector(`[data-supports="${supportLearner?.id}"]`)?.focus());
    dialog.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      data.studentAccommodations[supportLearner.id] = values.getAll('support');
      if (values.has('remember')) remembered[supportLearner.id] = [...supportsFor(supportLearner.id)];
      else delete remembered[supportLearner.id];
      localStorage.setItem('cogniaLearnerSupports', JSON.stringify(remembered));
      data.accommodations = false;
      update();
      dialog.close();
      announce('Learner supports saved for ' + supportLearner.name + '.');
    });

    // Continue: the same checks as Option A, for every test's sessions.
    page.addEventListener('click', (event) => {
      if (!event.target.closest('a[href="CAP-T09-ConfirmAssignment.dc.html"]')) return;
      let message = '';
      const empty = data.sessions.find((s) => !s.recipients.length);
      const incomplete = data.sessions.find((s) => !s.name.trim() || (!s.noLimit && (!s.opens || !s.due || s.due <= s.opens)));
      const problem = empty || incomplete;
      if (empty) message = `Tick at least one learner for ${empty.name || 'each session'} in ${testTitle(empty.testId)}, or remove that session.`;
      else if (incomplete) message = `Complete the name of ${incomplete.name || 'each session'} in ${testTitle(incomplete.testId)} and set an end time after its start time.`;
      const error = host.querySelector('[data-error]');
      if (problem) {
        event.preventDefault();
        testId = problem.testId;
        activeByTest[testId] = problem.id;
        update();
        error.textContent = message;
        error.hidden = false;
        error.focus();
        return;
      }
      error.hidden = true;
      // 24 Nov: when assigned learners have supports, a modal asks the teacher to confirm before moving on.
      if (needsReview() && !data.accommodations) {
        event.preventDefault();
        confirmNext = event.target.closest('a').getAttribute('href');
        confirmDialog.showModal();
        return;
      }
      save();
    });
    let confirmNext = '';
    const confirmDialog = document.createElement('dialog');
    confirmDialog.className = 'dialog assign-b-confirm';
    confirmDialog.setAttribute('role', 'alertdialog');
    confirmDialog.setAttribute('aria-labelledby', 'assign-b-confirm-title');
    confirmDialog.setAttribute('aria-describedby', 'assign-b-confirm-text');
    confirmDialog.innerHTML = `<div class="dialog-header">
        <h2 class="dialog-title" id="assign-b-confirm-title">Have you checked supports?</h2>
        <p class="dialog-description" id="assign-b-confirm-text">Some learners you assigned have supports. Check them before you continue.</p>
      </div>
      <div class="dialog-footer">
        <button class="btn btn-ghost btn-lg" type="button" data-confirm-cancel>Go back</button>
        <button class="btn btn-lg" type="button" data-confirm-ok>Yes, continue</button>
      </div>`;
    page.append(confirmDialog);
    confirmDialog.querySelectorAll('[data-confirm-cancel]').forEach((b) => b.addEventListener('click', () => confirmDialog.close()));
    confirmDialog.querySelector('[data-confirm-ok]').addEventListener('click', () => {
      data.accommodations = true;
      save();
      confirmDialog.close();
      location.href = confirmNext;
    });

    update();
  }
})();
