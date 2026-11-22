(() => {
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
 let flipped = false;
 let timer;
 let animation;
 function configure() {
  clearInterval(timer);
  animation?.cancel();
  flipped = false;
  if (reducedMotion.matches) {
   return;
  }
  timer = setInterval(() => {
   if (document.hidden) return;
   const currentIcon = document.querySelector('.insights-scoring-notice .item-media svg');
   if (!currentIcon) return;
   const from = flipped ? 180 : 0;
   flipped = !flipped;
   // Designer-requested 600ms exception for this periodic hourglass flip.
   // Keeping it here lets reduced motion cancel an in-flight flip immediately.
   animation?.cancel();
   animation = currentIcon.animate([
    {transform:`rotate(${from}deg)`},
    {transform:`rotate(${flipped ? 180 : 0}deg)`},
   ], {duration:600, easing:'ease-in-out', fill:'forwards'});
  }, 6000);
 }
 reducedMotion.addEventListener('change', configure);
 window.addEventListener('pagehide', () => { clearInterval(timer); animation?.cancel(); });
 window.addEventListener('pageshow', configure);
 configure();
})();
