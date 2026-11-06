/* Classes (CAP-T11): Accommodations tooltip (6 Nov).
   Hover or keyboard focus on a learner's accommodations icon opens the list of accommodations.
   The tip is position:fixed so the scrolling table card does not clip it; this script places it beside the icon
   (right, or left when there is no room) and keeps it inside the window.
   Meets WCAG 1.4.13: the tip stays open while the pointer is over it, and Escape dismisses it. */
(function () {
  var GAP = 8;    // px, matches --space-2
  var EDGE = 16;  // px, matches --space-4
  var open = null;
  var closeTimer = 0;

  function place(trigger) {
    var tip = trigger.querySelector('.cl-acc-tip');
    if (!tip) return;
    var r = trigger.getBoundingClientRect();
    var w = tip.offsetWidth;
    var h = tip.offsetHeight;
    // Beside the icon (right, or left when there is no room) so a long list never covers the other learners' icons.
    var left = r.right + GAP;
    if (left + w > window.innerWidth - EDGE) left = Math.max(EDGE, r.left - GAP - w);
    var top = r.top + r.height / 2 - h / 2;
    top = Math.min(Math.max(EDGE, top), window.innerHeight - EDGE - h);
    tip.style.top = Math.round(top) + 'px';
    tip.style.left = Math.round(left) + 'px';
  }

  function show(trigger) {
    clearTimeout(closeTimer);
    if (open && open !== trigger) open.classList.remove('is-open');
    open = trigger;
    place(trigger);
    trigger.classList.add('is-open');
  }

  function hide(trigger) {
    if (!trigger) return;
    trigger.classList.remove('is-open');
    if (open === trigger) open = null;
  }

  function triggerOf(node) {
    return node && node.closest ? node.closest('.cl-acc') : null;
  }

  document.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch') return;
    var t = triggerOf(e.target);
    if (t) show(t);
  });
  document.addEventListener('pointerout', function (e) {
    var t = triggerOf(e.target);
    if (!t || t.contains(e.relatedTarget)) return;
    if (t === document.activeElement) return;
    // A short grace period lets the pointer cross the gap onto the tip.
    closeTimer = setTimeout(function () { hide(t); }, 200);
  });
  document.addEventListener('focusin', function (e) {
    var t = triggerOf(e.target);
    if (t) show(t);
  });
  document.addEventListener('focusout', function (e) {
    var t = triggerOf(e.target);
    if (t && !t.contains(e.relatedTarget)) hide(t);
  });
  // Touch: tap the icon to open, tap anywhere else to close.
  document.addEventListener('click', function (e) {
    var t = triggerOf(e.target);
    if (t) { show(t); return; }
    if (open) hide(open);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) hide(open);
  });
  window.addEventListener('scroll', function () { if (open) place(open); }, true);
  window.addEventListener('resize', function () { if (open) place(open); });
})();
