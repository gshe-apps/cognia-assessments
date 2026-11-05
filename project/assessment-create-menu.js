(() => {
  const svg = (path) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';

  window.capMountAssessmentCreateMenu = (root) => {
    const host = root.querySelector('[data-assessment-create-menu]');
    if (!host || host.firstElementChild) return;

    host.innerHTML = `
      <details class="assessment-create-menu">
        <summary>
          <span>Create assessment</span>
          ${svg('<path d="m6 9 6 6 6-6"/>')}
        </summary>
        <div class="assessment-create-options">
          <a href="CAP-T05-Questions.dc.html" data-start-assessment>
            ${svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5M14 2l6 6v3m-6-9v6h6m-3 7v6m-3-3h6"/>')}
            Create from scratch
          </a>
          <a href="CAP-T21-AssessmentLibrary.dc.html">
            ${svg('<path d="m12 2 10 5-10 5L2 7Zm-10 10 10 5 10-5M2 17l10 5 10-5"/>')}
            Use assessment library
          </a>
        </div>
      </details>`;

    const menu = host.firstElementChild;
    menu.querySelector('[data-start-assessment]').addEventListener('click', () => {
      try {
        for (const key of Object.keys(sessionStorage)) {
          if (/^capCreate(Confirmed|Collapsed):/.test(key)) sessionStorage.removeItem(key);
        }
      } catch {}
    });
    menu.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.open) return;
      event.stopPropagation();
      menu.open = false;
      menu.querySelector('summary').focus();
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target)) menu.open = false;
    });
    menu.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !menu.contains(event.relatedTarget)) menu.open = false;
    });
    window.addEventListener('pageshow', () => { menu.open = false; });
  };
})();
