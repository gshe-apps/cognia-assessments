/* Classes (CAP-T11): learner distribution bar hover wave (5 Nov review 3).
   While the pointer is over the bar, each segment lifts by a smooth bell curve centred on the pointer, so the
   bar rises under the pointer and eases off on either side, following it left or right. The lift is written to
   --cl-wave and the 200ms ease-out transition in classes-overview.css does the motion (transform only).
   Keyboard focus keeps the fill colour change; reduced motion turns the wave off. */
(function () {
  var MAX_LIFT = 8;    // px, matches --space-2
  var REACH = 1.6;     // how far the wave spreads, in multiples of the segment's half width
  var MIN_SPREAD = 40; // px, so narrow segments still ease off gently
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var active = null;
  var frame = 0;
  var lastX = 0;

  function segments(bar) { return bar.querySelectorAll('.cl-seg'); }

  function settle(bar) {
    segments(bar).forEach(function (seg) { seg.style.setProperty('--cl-wave', '0px'); });
  }

  function lift(bar, x) {
    segments(bar).forEach(function (seg) {
      var r = seg.getBoundingClientRect();
      var centre = r.left + r.width / 2;
      var spread = Math.max(r.width / 2, MIN_SPREAD) * REACH;
      var d = x - centre;
      var amount = MAX_LIFT * Math.exp(-(d * d) / (2 * spread * spread));
      seg.style.setProperty('--cl-wave', amount.toFixed(2) + 'px');
    });
  }

  document.addEventListener('pointermove', function (e) {
    if (reduce && reduce.matches) return;
    var bar = e.target && e.target.closest ? e.target.closest('.cl-dist') : null;
    if (active && active !== bar) { settle(active); active = null; }
    if (!bar) return;
    active = bar;
    lastX = e.clientX;
    if (frame) return;
    frame = requestAnimationFrame(function () {
      frame = 0;
      if (active) lift(active, lastX);
    });
  });

  document.addEventListener('pointerleave', function () {
    if (active) { settle(active); active = null; }
  });
})();
