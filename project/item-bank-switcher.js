/* Item banks (CAP-T12), 13 Nov: teachers work across many banks (Cognia, their own, content specialists'),
   so the page is headed by the current bank's name with a chevrons-up-down switcher, like Results.
   The switcher opens a dialog with a search field, because the list of banks will be long.
   Prototype only: a bank filters the list by the items' grade and subject label. */
(function () {
  'use strict';
  var KEY = 'cogniaItemBankV1';
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var svg = function (p) { return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
  var ICON = {
    updown: svg('<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>'),
    x: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    search: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>')
  };
  var GROUPS = [['cognia', 'Cognia banks'], ['mine', 'My banks'], ['specialist', 'Content specialist banks']];
  var BANKS = [
    {id: 'cognia-classroom', group: 'cognia', name: 'Classroom collection, Grades 4 to 8', match: null},
    {id: 'cognia-g4-math', group: 'cognia', name: 'Grade 4 Mathematics', match: ['Grade 4 Maths']},
    {id: 'cognia-g5-math', group: 'cognia', name: 'Grade 5 Mathematics', match: ['Grade 5 Maths']},
    {id: 'cognia-g6-math', group: 'cognia', name: 'Grade 6 Mathematics', match: ['Grade 6 Maths']},
    {id: 'cognia-g7-ela', group: 'cognia', name: 'Grade 7 ELA', match: ['Grade 7 ELA']},
    {id: 'cognia-g8-ela', group: 'cognia', name: 'Grade 8 ELA', match: ['Grade 8 ELA']},
    {id: 'mine-g5-fractions', group: 'mine', name: 'My Grade 5 fractions', match: ['Grade 5 Maths']},
    {id: 'mine-g4-warmups', group: 'mine', name: 'Grade 4 warm-ups', match: ['Grade 4 Maths']},
    {id: 'specialist-reading', group: 'specialist', name: 'Grade 7 and 8 reading passages', match: ['Grade 7 ELA', 'Grade 8 ELA']}
  ];
  var current = BANKS[0];
  try { var saved = sessionStorage.getItem(KEY); current = BANKS.filter(function (b) { return b.id === saved; })[0] || current; } catch (e) {}

  var rows = function () { return Array.prototype.slice.call(document.querySelectorAll('.ib-list .ib-row')); };
  var gradeOf = function (row) { var g = row.querySelector('.ib-item-grade'); return g ? g.textContent.trim() : ''; };
  var inBank = function (bank, row) { return !bank.match || bank.match.indexOf(gradeOf(row)) > -1; };
  var countIn = function (bank) { return rows().filter(function (r) { return inBank(bank, r); }).length; };
  var plural = function (n) { return n + (n === 1 ? ' item' : ' items'); };

  function applyFilter() {
    var list = rows();
    if (!list.length) return;
    var shown = 0, selectedHidden = false, firstShown = null;
    list.forEach(function (row) {
      var keep = inBank(current, row);
      if (row.hidden === keep) row.hidden = !keep;
      if (keep) { shown++; if (!firstShown) firstShown = row; }
      else if (row.querySelector('.ib-item[aria-current="true"]')) selectedHidden = true;
    });
    var count = document.querySelector('.ib-list .ib-count');
    if (count && count.textContent !== plural(shown)) count.textContent = plural(shown);
    if (selectedHidden && firstShown) firstShown.querySelector('.ib-item').click();
  }

  function header() {
    var main = document.querySelector('main.ib-main'), ib = main && main.querySelector('.ib');
    if (!ib) return null;
    var head = main.querySelector('.ib-bank-head');
    if (!head) {
      head = document.createElement('header');
      head.className = 'ib-bank-head';
      head.innerHTML = '<h1 class="ib-bank-title"><button type="button" class="ib-bank-switch" aria-haspopup="dialog" data-bank-switch><span data-bank-name></span>' + ICON.updown + '</button></h1>';
      ib.before(head);
      head.querySelector('[data-bank-switch]').addEventListener('click', open);
    }
    var name = head.querySelector('[data-bank-name]');
    if (name.textContent !== current.name) name.textContent = current.name;
    head.querySelector('[data-bank-switch]').setAttribute('aria-label', 'Item bank: ' + current.name + '. Change item bank');
    return head;
  }

  /* 16 Nov: one bank picker for the Item banks page (pick one bank, closes on click) and the Add your items step
     (tick several banks, then Use). The groups are a toggle group under the search field, and the banks sit in a
     white list, the same as the assessment library modal. */
  var groupName = function (id) { return (GROUPS.filter(function (g) { return g[0] === id; })[0] || [])[1] || ''; };
  function picker(opts) {
    var multi = !!opts.multi, trigger = opts.trigger;
    var chosen = (opts.selected || []).slice(), filter = 'all';
    var count = opts.countFor || countIn;
    var dialog = document.createElement('dialog');
    dialog.className = 'dialog ib-bank-dialog theme-assessments' + (multi ? ' ib-bank-dialog-multi' : '');
    dialog.setAttribute('aria-labelledby', 'ib-bank-dialog-title');
    dialog.innerHTML = '<div class="dialog-header"><h2 class="dialog-title" id="ib-bank-dialog-title">Item banks</h2><button type="button" class="btn btn-ghost btn-icon dialog-close" data-bank-close aria-label="Close">' + ICON.x + '</button>'
      + (multi ? '<p class="dialog-description">Choose one or more item banks to add items from.</p>' : '') + '</div>'
      + '<div class="ib-bank-filters"><div class="search search-md" role="search">' + ICON.search.replace('<svg', '<svg class="search-icon"') + '<input class="input search-input" type="search" placeholder="Search item banks" aria-label="Search item banks" autocomplete="off" data-bank-search></div>'
      + '<div class="tabs-list ib-bank-groups" role="group" aria-label="Show item banks">'
      + [['all', 'All']].concat(GROUPS).map(function (g) { return '<button type="button" class="tab" data-bank-group="' + g[0] + '" aria-pressed="' + (g[0] === filter) + '">' + g[1] + '</button>'; }).join('')
      + '</div></div>'
      + '<div class="dialog-body ib-bank-body"><ul class="ib-bank-list" data-bank-list></ul></div>'
      + (multi ? '<div class="dialog-footer"><p class="field-error" data-bank-error hidden>Choose at least one item bank.</p><button type="button" class="btn btn-lg" data-bank-use>Use</button></div>' : '')
      + '<p class="sr-only" role="status" data-bank-status></p>';
    document.body.append(dialog);
    var list = dialog.querySelector('[data-bank-list]'), search = dialog.querySelector('[data-bank-search]'), status = dialog.querySelector('[data-bank-status]'), error = dialog.querySelector('[data-bank-error]');
    function row(b) {
      var on = chosen.indexOf(b.id) > -1;
      var copy = '<span class="item-content"><span class="item-title">' + esc(b.name) + '</span><span class="item-description">' + esc(groupName(b.group)) + ' · ' + plural(count(b)) + '</span></span>';
      if (multi) return '<li><label class="item ib-bank-option" data-bank-row="' + b.id + '"><input type="checkbox" class="checkbox" data-bank-check="' + b.id + '"' + (on ? ' checked' : '') + '>' + copy + '</label></li>';
      return '<li><button type="button" class="item ib-bank-option" data-bank="' + b.id + '"' + (on ? ' aria-current="true"' : '') + '>' + copy + (on ? '<span class="item-actions">' + ICON.check + '<span class="sr-only">Current bank</span></span>' : '') + '</button></li>';
    }
    function draw() {
      var term = search.value.trim().toLowerCase();
      var banks = BANKS.filter(function (b) { return (filter === 'all' || b.group === filter) && (!term || (b.name + ' ' + groupName(b.group)).toLowerCase().indexOf(term) > -1); });
      list.hidden = !banks.length;
      list.innerHTML = banks.map(row).join('');
      var empty = dialog.querySelector('.ib-bank-empty');
      if (!banks.length && !empty) { empty = document.createElement('div'); empty.className = 'empty-state ib-bank-empty'; list.after(empty); }
      if (empty) { empty.hidden = !!banks.length; empty.innerHTML = '<p>No item banks match your search.</p>'; }
      status.textContent = banks.length + (banks.length === 1 ? ' item bank' : ' item banks');
    }
    function close() { dialog.close(); dialog.remove(); if (trigger && trigger.isConnected) trigger.focus(); }
    search.addEventListener('input', draw);
    dialog.addEventListener('change', function (e) {
      var box = e.target.closest('[data-bank-check]');
      if (!box) return;
      var id = box.dataset.bankCheck;
      chosen = chosen.filter(function (x) { return x !== id; });
      if (box.checked) chosen.push(id);
      if (error && chosen.length) error.hidden = true;
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog || e.target.closest('[data-bank-close]')) return close();
      var group = e.target.closest('[data-bank-group]');
      if (group) {
        filter = group.dataset.bankGroup;
        dialog.querySelectorAll('[data-bank-group]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === group)); });
        return draw();
      }
      if (e.target.closest('[data-bank-use]')) {
        if (!chosen.length) { error.hidden = false; return; }
        var ids = BANKS.map(function (b) { return b.id; }).filter(function (id) { return chosen.indexOf(id) > -1; });
        close();
        if (opts.onPick) opts.onPick(ids);
        return;
      }
      var pick = !multi && e.target.closest('[data-bank]');
      if (!pick) return;
      close();
      if (opts.onPick) opts.onPick([pick.dataset.bank]);
    });
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    draw();
    dialog.showModal();
    search.focus();
  }
  window.capBankPicker = { banks: BANKS, groups: GROUPS, open: picker };

  function open() {
    picker({
      trigger: document.querySelector('[data-bank-switch]'),
      selected: [current.id],
      onPick: function (ids) {
        current = BANKS.filter(function (b) { return b.id === ids[0]; })[0] || current;
        try { sessionStorage.setItem(KEY, current.id); } catch (err) {}
        header(); applyFilter();
      }
    });
  }

  var queued = false;
  function sync() { queued = false; if (header()) applyFilter(); }
  new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(sync); } }).observe(document.documentElement, {childList: true, subtree: true});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
})();
