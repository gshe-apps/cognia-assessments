/* Create test: the shared dropdown menu from the cognia-design plugin
   (btn, .dropdown, .menu in cognia-components.css). Opening, keyboard, Escape
   and click outside come from ds/cognia/cognia-components.js. */
(() => {
  const svg = (path) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';


  /* options.onClose(submitted) replaces the default focus return, e.g. to reopen a previous modal. */
  window.capOpenNewAssessment = (trigger, options = {}) => {
    const {create,itemPage,libraryPath,signature}=window.capAssessmentSetup;
    const initial={title:'Fall 2026',grade:'5',subject:'Mathematics',standard:'5.NF.A.2'};
    const host=trigger.closest('.theme-assessments')||document.body;
    let submitted=false;
    const setup=create({
      host,
      showAssessmentTitle:true,
      initial,
      onClose(){
        setup.remove();
        if(options.onClose)return options.onClose(submitted);
        (trigger.isConnected?trigger:document.getElementById(trigger.id))?.focus();
      },
      onSubmit({assessmentSettings,...details}){
        submitted=true;
        const id='test-'+Date.now();
        const page=itemPage(details);
        /* The setup title names the assessment; its first test starts as "New test" (renamed on step 2). */
        const test={id,...details,title:details.testName||'New test',page,state:{chosen:[],written:{},edits:{}},questions:[]};
        const model={title:details.title,active:id,tests:[test],settings:assessmentSettings};
        localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(model));
        sessionStorage.setItem('capCreateConfirmed:'+id,signature(details));
        location.href=details.pathway===libraryPath?'CAP-T21-AssessmentLibrary.dc.html':page;
      }
    });
    setup.open(initial);
  };

  /* Use assessment library: pick a ready-made Cognia assessment in a modal (Figma 1504:5530).
     Same fixed size and theme background as the setup modal; choosing one opens Test details. */
  window.capOpenLibraryPicker = (trigger) => {
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const forms = (window.cogniaAssessmentForms || []).slice(0, 4);
    const host = trigger.closest('.theme-assessments') || document.body;
    const fileIcon = '<span class="icon-accent"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" /><path d="M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z" /><path d="M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1" /></svg></span>'; /* 17 Nov: Lucide files, an assessment (several tests); a single test keeps file-text */
    const wrap = document.createElement('div');
    wrap.innerHTML = `<dialog class="dialog cap-setup-modal cap-library-modal" aria-labelledby="cap-library-title">
      <div class="cap-setup-heading dialog-header">
        <h2 class="dialog-title" id="cap-library-title" tabindex="-1" autofocus>Select a Cognia test</h2>
        <button class="btn btn-ghost btn-icon dialog-close" type="button" data-close-library aria-label="Close">${svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button>
      </div>
      <ul class="cap-library-list">${forms.map((f) => {
        const qs = f.questions || [];
        const points = qs.reduce((n, q) => n + Number(q.marks || 0), 0);
        return `<li><button type="button" class="cap-library-item" data-library-form="${esc(f.id)}">
          ${fileIcon}
          <span class="cap-library-copy"><span class="text-body-small text-muted-foreground">${esc(f.standard)}</span><strong>${esc(f.title)}</strong><span class="text-body-small text-muted-foreground">Grade ${esc(f.grade)} ${esc(f.subject)}</span></span>
          <span class="cap-library-meta"><span class="badge badge-secondary">${qs.length} ${qs.length === 1 ? 'item' : 'items'}</span><span class="text-body-small">${points} ${points === 1 ? 'point' : 'points'}</span></span>
        </button></li>`;
      }).join('')}</ul>
    </dialog>`;
    const modal = wrap.firstElementChild;
    host.append(modal);
    const close = () => { modal.close(); };
    modal.addEventListener('close', () => { modal.remove(); (trigger.isConnected ? trigger : document.getElementById(trigger.id))?.focus(); });
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.closest('[data-close-library]')) return close();
      const item = event.target.closest('[data-library-form]');
      if (!item) return;
      if (window.capStartLibraryForm) window.capStartLibraryForm(item.dataset.libraryForm);
      else location.href = 'CAP-T21-AssessmentLibrary.dc.html';
    });
    modal.showModal();
  };

  window.capOpenAssessmentChoices = (trigger) => {
    const modal = document.createElement('dialog');
    modal.className = 'dialog cap-create-choice';
    modal.setAttribute('aria-labelledby', 'cap-create-choice-title');
    modal.innerHTML = `
      <div class="dialog-header">
        <h2 class="dialog-title" id="cap-create-choice-title" tabindex="-1" autofocus>Create new</h2>
        <form method="dialog" class="dialog-close">
          <button class="btn btn-ghost btn-icon" type="submit" aria-label="Close">${svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button>
        </form>
      </div>
      <form method="dialog" class="dialog-footer cap-create-choice-actions">
        <button class="btn" type="submit" value="scratch">From scratch</button>
        <button class="btn btn-ghost" type="submit" value="library">From Cognia</button>
      </form>`;
    const host = trigger.closest('.theme-assessments') || document.body;
    host.append(modal);
    modal.addEventListener('close', () => {
      modal.remove();
      if (modal.returnValue === 'scratch') window.capOpenNewAssessment(trigger);
      else if (modal.returnValue === 'library') window.capOpenLibraryPicker(trigger);
      else trigger.focus();
    });
    modal.showModal();
  };

  window.capMountAssessmentCreateMenu = (root) => {
    const host = root.querySelector('[data-assessment-create-menu]');
    if (!host || host.firstElementChild) return;

    host.innerHTML = `
      <div class="dropdown dropdown-end">
        <button type="button" class="btn btn-lg" id="create-assessment-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="create-assessment-menu">
          Create new
          ${svg('<path d="m6 9 6 6 6-6"/>')}
        </button>
        <div class="menu" role="menu" id="create-assessment-menu" aria-labelledby="create-assessment-trigger" hidden>
          <a class="menu-item" role="menuitem" tabindex="-1" href="CAP-T04-Setup.dc.html" data-create-from-scratch>From scratch</a>
          <a class="menu-item" role="menuitem" tabindex="-1" href="CAP-T21-AssessmentLibrary.dc.html" data-use-library>From Cognia</a>
        </div>
      </div>`;
    host.querySelector('[data-create-from-scratch]').addEventListener('click',event=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      window.capOpenNewAssessment(host.querySelector('#create-assessment-trigger'));
    });
    host.querySelector('[data-use-library]').addEventListener('click',event=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      window.capOpenLibraryPicker(host.querySelector('#create-assessment-trigger'));
    });
  };
})();
