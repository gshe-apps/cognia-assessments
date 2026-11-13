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

  function open() {
    var trigger = document.querySelector('[data-bank-switch]');
    var dialog = document.createElement('dialog');
    dialog.className = 'dialog ib-bank-dialog theme-assessments';
    dialog.setAttribute('aria-labelledby', 'ib-bank-dialog-title');
    dialog.innerHTML = '<div class="dialog-header"><h2 class="dialog-title" id="ib-bank-dialog-title">Item banks</h2><button type="button" class="btn btn-ghost btn-icon dialog-close" data-bank-close aria-label="Close">' + ICON.x + '</button></div>'
      + '<div class="search search-md" role="search">' + ICON.search.replace('<svg', '<svg class="search-icon"') + '<input class="input search-input" type="search" placeholder="Search item banks" aria-label="Search item banks" autocomplete="off" data-bank-search></div>'
      + '<div class="dialog-body ib-bank-list" data-bank-list></div>'
      + '<p class="sr-only" role="status" data-bank-status></p>';
    document.body.append(dialog);
    var list = dialog.querySelector('[data-bank-list]'), search = dialog.querySelector('[data-bank-search]'), status = dialog.querySelector('[data-bank-status]');
    function draw() {
      var term = search.value.trim().toLowerCase(), found = 0;
      list.innerHTML = GROUPS.map(function (g) {
        var banks = BANKS.filter(function (b) { return b.group === g[0] && (!term || (b.name + ' ' + g[1]).toLowerCase().indexOf(term) > -1); });
        found += banks.length;
        if (!banks.length) return '';
        return '<section class="ib-bank-group" aria-labelledby="ib-bank-g-' + g[0] + '"><h3 class="label" id="ib-bank-g-' + g[0] + '">' + g[1] + '</h3><div class="item-group">'
          + banks.map(function (b) {
            var on = b.id === current.id;
            return '<button type="button" class="item ib-bank-option" data-bank="' + b.id + '"' + (on ? ' aria-current="true"' : '') + '><span class="item-content"><span class="item-title">' + esc(b.name) + '</span><span class="item-description">' + plural(countIn(b)) + '</span></span>' + (on ? '<span class="item-actions">' + ICON.check + '<span class="sr-only">Current bank</span></span>' : '') + '</button>';
          }).join('') + '</div></section>';
      }).join('') || '<div class="empty-state"><p>No item banks match “' + esc(search.value.trim()) + '”.</p></div>';
      status.textContent = found + (found === 1 ? ' item bank' : ' item banks');
    }
    function close() { dialog.close(); dialog.remove(); if (trigger) trigger.focus(); }
    search.addEventListener('input', draw);
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog || e.target.closest('[data-bank-close]')) return close();
      var pick = e.target.closest('[data-bank]');
      if (!pick) return;
      current = BANKS.filter(function (b) { return b.id === pick.dataset.bank; })[0] || current;
      try { sessionStorage.setItem(KEY, current.id); } catch (err) {}
      header(); applyFilter(); close();
    });
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    draw();
    dialog.showModal();
    search.focus();
  }

  var queued = false;
  function sync() { queued = false; if (header()) applyFilter(); }
  new MutationObserver(function () { if (!queued) { queued = true; requestAnimationFrame(sync); } }).observe(document.documentElement, {childList: true, subtree: true});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
})();
