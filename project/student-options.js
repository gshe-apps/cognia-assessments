// Prototype only: Explore student opens a chooser for the two student flow options.
(() => {
  const ready = () => {
    const dialog = document.querySelector('.home-student-dialog');
    if (!dialog) return;
    let returnFocus;
    document.addEventListener('click', event => {
      const target = event.target.closest('button,a');
      if (!target) return;
      if (target.hasAttribute('data-open-student')) { returnFocus = target; dialog.showModal(); }
      if (target.hasAttribute('data-close-student')) dialog.close();
    });
    dialog.addEventListener('close', () => returnFocus?.focus());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
