/* Item Bank (CAP-T12): scrollbars stay hidden until the person scrolls (4 Nov review 4).
   The space for the scrollbar is always reserved (scrollbar-gutter in item-bank.css), so nothing shifts when it shows.
   The page re-renders on every change, so the list's scroll position is also kept across re-renders. */
(function () {
  var HIDE_AFTER = 800;
  var pageTimer = null;
  var listTimer = null;
  var listTop = 0;

  function show(el, which) {
    el.classList.add('is-scrolling');
    if (which === 'page') { clearTimeout(pageTimer); pageTimer = setTimeout(function () { el.classList.remove('is-scrolling'); }, HIDE_AFTER); }
    else { clearTimeout(listTimer); listTimer = setTimeout(function () { var cur = document.querySelector('.ib-items'); if (cur) cur.classList.remove('is-scrolling'); }, HIDE_AFTER); }
  }

  document.addEventListener('scroll', function (e) {
    var t = e.target;
    if (t === document || t === document.documentElement || t === document.body) { show(document.documentElement, 'page'); return; }
    if (t && t.classList && t.classList.contains('ib-items')) { listTop = t.scrollTop; show(t, 'list'); }
  }, true);

  function restore() {
    var list = document.querySelector('.ib-items');
    if (list && listTop && list.scrollTop !== listTop && !list.dataset.ibRestored) {
      list.dataset.ibRestored = '1';
      list.scrollTop = listTop;
    }
  }
  function start() {
    new MutationObserver(restore).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
