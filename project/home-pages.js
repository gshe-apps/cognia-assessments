(() => {
  const ready = () => {
    let searchValue = '';
    let returnFocus;
    document.addEventListener('input', event => {
      if (event.target.id !== 'home-search') return;
      searchValue = event.target.value;
      event.target.removeAttribute('aria-invalid');
      const error = document.getElementById('home-search-error');
      if (error) error.hidden = true;
    });
    document.addEventListener('submit', event => {
      if (!event.target.matches('.home-search')) return;
      event.preventDefault();
      const input = event.target.querySelector('input');
      const query = input.value.trim();
      const error = document.getElementById('home-search-error');
      if (!query) {
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', 'home-search-error');
        input.focus();
        return;
      }
      error.hidden = true;
      const results = document.getElementById('home-search-results');
      const links = results.querySelector('.home-search-links');
      links.replaceChildren();
      const seen = new Set();
      document.querySelectorAll('a[data-search-item]').forEach(item => {
        if (!item.textContent.toLowerCase().includes(query.toLowerCase())) return;
        const href = item.getAttribute('href');
        if (seen.has(href)) return;
        seen.add(href);
        const a = document.createElement('a');
        a.href = href;
        a.textContent = item.dataset.searchTitle || item.querySelector('h3')?.textContent || item.textContent.trim();
        links.append(a);
      });
      results.querySelector('[role="status"]').textContent = seen.size
        ? `${seen.size} ${seen.size === 1 ? 'result' : 'results'} for “${query}” in this prototype.`
        : `No results for “${query}”. Try assessments, performance, results or classes.`;
      results.hidden = false;
      results.focus();
    });
    document.addEventListener('click', event => {
      const target = event.target.closest('button,a');
      if (!target) return;
      if (target.hasAttribute('data-open-account')) {
        window.cogniaPreview?.setState({ acctOpen:true, appsOpen:false, rolesOpen:false });
        document.querySelector('.acctmenu .acctswitch')?.focus();
      }
      if (target.hasAttribute('data-open-hub')) {
        const instance = window.cogniaPreview;
        instance?.setState({ appsOpen:true, appsHub:target.dataset.openHub, acctOpen:false, rolesOpen:false });
        document.querySelector('.appdlg button')?.focus();
      }
      if (target.hasAttribute('data-clear-search')) {
        document.getElementById('home-search-results').hidden = true;
        const input = document.getElementById('home-search');
        input.value = searchValue = '';
        input.focus();
      }
      if (target.hasAttribute('data-open-admin')) {
        returnFocus = target;
        document.querySelector('.home-admin-dialog').showModal();
      }
      if (target.hasAttribute('data-close-admin')) document.querySelector('.home-admin-dialog').close();
    });
    const dialog = document.querySelector('.home-admin-dialog');
    dialog?.addEventListener('close', () => returnFocus?.focus());
    dialog?.addEventListener('click', event => { if (event.target === dialog) { const box=dialog.getBoundingClientRect(); if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close(); } });
    // The Canvas runtime redraws its template when account/hub state changes.
    // Preserve the draft search value across those redraws.
    const root = document.querySelector('x-dc');
    const observer = new MutationObserver(() => {
      const input = document.getElementById('home-search');
      if (input && input.value !== searchValue) input.value = searchValue;
    });
    if(root) observer.observe(root,{childList:true,subtree:true});
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();
