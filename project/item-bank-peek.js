/* Item Bank (CAP-T12), 9 Nov: full question peek and the row more-actions menu.
   - Hovering a row (or reaching it by keyboard) whose one-line stem is cut off fades in a popover to the
     right of the row with the full question. Rows that fit on one line show nothing.
   - The popover lives on <body> with fixed positioning, because the list scrolls and would clip it.
   - It is decorative (aria-hidden): the full stem is already in the row for screen readers.
   - Opening a row's more-actions menu hides the peek and scrolls the menu into view inside the list.
   Menu items are prototype only: they close the menu and do nothing else. */
(function () {
  var SHOW_DELAY = 150;
  var GAP = 8;
  var peek = null;
  var current = null;
  var timer = null;

  function ensure() {
    if (peek && document.body.contains(peek)) return peek;
    peek = document.createElement('div');
    peek.className = 'ib-peek';
    peek.setAttribute('aria-hidden', 'true');
    document.body.appendChild(peek);
    return peek;
  }

  function isCut(row) {
    var stem = row.querySelector('.ib-item-stem');
    return stem && stem.scrollWidth > stem.clientWidth + 1 ? stem : null;
  }

  function menuOpen(row) {
    return !!row.querySelector('[aria-expanded="true"]');
  }

  function place(row) {
    var el = ensure();
    var r = row.getBoundingClientRect();
    var w = el.offsetWidth;
    var left = r.right + GAP;
    var top = r.top;
    if (left + w > window.innerWidth - GAP) { left = Math.max(GAP, r.left); top = r.bottom + GAP; }
    var maxTop = window.innerHeight - el.offsetHeight - GAP;
    el.style.left = left + 'px';
    el.style.top = Math.max(GAP, Math.min(top, maxTop)) + 'px';
  }

  function show(row) {
    var stem = isCut(row);
    if (!stem || menuOpen(row)) { hide(); return; }
    var el = ensure();
    var wasOn = el.classList.contains('is-on');
    clearTimeout(timer);
    current = row;
    var go = function () {
      if (current !== row) return;
      el.textContent = stem.textContent;
      place(row);
      el.classList.add('is-on');
    };
    if (wasOn) go(); else timer = setTimeout(go, SHOW_DELAY);
  }

  function hide() {
    clearTimeout(timer);
    current = null;
    if (peek) peek.classList.remove('is-on');
  }

  document.addEventListener('mouseover', function (e) {
    var row = e.target instanceof Element && e.target.closest('.ib-row');
    if (row && row !== current) show(row);
  });
  document.addEventListener('mouseout', function (e) {
    if (!current) return;
    var to = e.relatedTarget;
    if (!(to instanceof Element) || !current.contains(to)) {
      var next = to instanceof Element && to.closest('.ib-row');
      if (next) show(next); else hide();
    }
  });
  document.addEventListener('focusin', function (e) {
    var item = e.target instanceof Element && e.target.closest('.ib-item');
    if (item && item.matches(':focus-visible')) show(item.closest('.ib-row'));
    else if (!e.target.closest || !e.target.closest('.ib-row')) hide();
  });
  document.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });

  /* Runs after cognia-components.js has opened or closed the menu on the same click. */
  document.addEventListener('click', function (e) {
    var trigger = e.target instanceof Element && e.target.closest('.ib-row .ib-more');
    if (!trigger) return;
    hide();
    requestAnimationFrame(function () {
      var menu = trigger.parentElement.querySelector('.menu');
      if (menu && !menu.hidden && menu.scrollIntoView) menu.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });
})();
