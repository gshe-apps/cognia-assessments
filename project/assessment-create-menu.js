/* Create test: the shared dropdown menu from the cognia-design plugin
   (btn, .dropdown, .menu in cognia-components.css). Opening, keyboard, Escape
   and click outside come from ds/cognia/cognia-components.js. */
(() => {
  const svg = (path) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  const setupUrl = 'CAP-T04-Setup.dc.html?create=';
  const initialSetup = {title:'Fall 2026',grade:'5',subject:'Mathematics',standard:'5.NF.A.2'};

  function continueSetup({assessmentSettings,...details}){
    const {itemPage,libraryPath,signature}=window.capAssessmentSetup;
    if(details.libraryForm){
      window.capStartLibraryForm(details.libraryForm,{title:details.title,assessmentSettings,description:details.description,resource:details.resource,notes:details.notes,directAssignment:details.assignLibrary});
      return;
    }
    const id='test-'+Date.now();
    const page=itemPage(details);
    const test={id,...details,title:details.testName||'New test',page,state:{chosen:[],written:{},edits:{}},questions:[]};
    const model={title:details.title,active:id,tests:[test],settings:assessmentSettings,origin:'builder'};
    window.capPreserveAssessment?.();
    localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(model));
    localStorage.removeItem('cogniaDeliverySessions');
    sessionStorage.setItem('capCreateConfirmed:'+id,signature(details));
    location.href=details.pathway===libraryPath?'CAP-T21-AssessmentLibrary.dc.html':page;
  }

  document.addEventListener('DOMContentLoaded',()=>{
    if(!location.pathname.endsWith('/CAP-T04-Setup.dc.html'))return;
    const params=new URLSearchParams(location.search);
    if(!params.has('create'))return;
    const main=document.querySelector('main');
    if(!main)return;
    main.className='main ws-frame cap-create-main';
    main.replaceChildren();
    const setup=window.capAssessmentSetup.create({
      host:main,initial:initialSetup,showAssessmentTitle:true,allowLibrary:true,asPage:true,
      onSubmit:continueSetup,
      onClose:()=>location.assign(params.get('from')==='overview'?'CAP-T01-Overview.dc.html':'CAP-T03-Assessments.dc.html')
    });
    setup.open(initialSetup,{initialSource:params.get('create')==='library'?'library':'scratch'});
  });

  /* options.onClose(submitted) replaces the default focus return, e.g. to reopen a previous modal. */
  window.capOpenNewAssessment = (trigger, options = {}) => {
    const {create}=window.capAssessmentSetup;
    const initial=initialSetup;
    const host=trigger.closest('.theme-assessments')||document.body;
    let submitted=false;
    const setup=create({
      host,
      showAssessmentTitle:true,
      allowLibrary:true,
      initial,
      onClose(){
        setup.remove();
        if(options.onClose)return options.onClose(submitted);
        (trigger.isConnected?trigger:document.getElementById(trigger.id))?.focus();
      },
      onSubmit(details){
        submitted=true;
        continueSetup(details);
      }
    });
    setup.open(initial);
  };

  /* Use assessment library: pick a ready-made Cognia assessment in a modal (Figma 1504:5530).
     Same fixed size and theme background as the setup modal; choosing one opens Test details. */
  window.capOpenLibraryPicker = (trigger) => {
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const forms = window.cogniaAssessmentForms || [];
    const host = trigger.closest('.theme-assessments') || document.body;
    const fileIcon = '<span class="icon-accent"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" /><path d="M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z" /><path d="M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1" /></svg></span>'; /* 17 Nov: Lucide files, an assessment (several tests); a single test keeps file-text */
    const wrap = document.createElement('div');
    wrap.innerHTML = `<dialog class="dialog cap-setup-modal cap-library-modal" aria-labelledby="cap-library-title">
      <div class="cap-setup-heading dialog-header">
        <h2 class="dialog-title" id="cap-library-title" tabindex="-1" autofocus>Select a ready-to-use assessment</h2>
        <button class="btn btn-ghost btn-icon dialog-close" type="button" data-close-library aria-label="Close">${svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button>
      </div>
      <div class="search search-md" role="search">
        ${svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>').replace('<svg','<svg class="search-icon"')}
        <input class="input search-input" type="search" aria-label="Search assessments" placeholder="Search assessments" autocomplete="off" data-library-search>
      </div>
      <ul class="cap-library-list" aria-label="Ready-to-use assessments">${forms.map((f) => {
        const qs = f.questions || [];
        const points = qs.reduce((n, q) => n + Number(q.marks || 0), 0);
        return `<li data-library-match="${esc([f.title,f.subject,'Grade '+f.grade,f.standard].join(' ').toLowerCase())}"><button type="button" class="cap-library-item" data-library-form="${esc(f.id)}">
          ${fileIcon}
          <span class="cap-library-copy"><strong>${esc(f.title)}</strong><span class="text-body-small text-muted-foreground">Grade ${esc(f.grade)} ${esc(f.subject)}</span><span class="text-body-small">Includes test: ${esc(f.title)}</span></span>
          <span class="cap-library-meta"><span class="badge badge-secondary">1 Test</span><span class="text-body-small text-muted-foreground">${qs.length} ${qs.length === 1 ? 'item' : 'items'}</span><span class="text-body-small text-muted-foreground">${points} ${points === 1 ? 'point' : 'points'}</span></span>
        </button></li>`;
      }).join('')}</ul>
      <p class="text-body-small text-muted-foreground" data-library-empty role="status" hidden>No assessments match. Try another search.</p>
    </dialog>`;
    const modal = wrap.firstElementChild;
    host.append(modal);
    modal.querySelector('[data-library-search]').addEventListener('input',event=>{
      const query=event.target.value.trim().toLowerCase();
      const rows=[...modal.querySelectorAll('[data-library-match]')];
      rows.forEach(row=>row.hidden=!row.dataset.libraryMatch.includes(query));
      modal.querySelector('[data-library-empty]').hidden=rows.some(row=>!row.hidden);
    });
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
        <h2 class="dialog-title" id="cap-create-choice-title" tabindex="-1" autofocus>Create assessment</h2>
        <form method="dialog" class="dialog-close">
          <button class="btn btn-ghost btn-icon" type="submit" aria-label="Close">${svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button>
        </form>
      </div>
      <form method="dialog" class="dialog-footer cap-create-choice-actions">
        <button class="btn" type="submit" value="scratch">New assessment</button>
        <button class="btn btn-ghost" type="submit" value="library">Choose from library</button>
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
    if(location.pathname.endsWith('/CAP-T01-Overview.dc.html')){
      host.innerHTML=`<a class="btn btn-lg" href="${setupUrl}scratch&from=overview">Create assessment</a>`;
      return;
    }

    host.innerHTML = `
      <div class="dropdown dropdown-end">
        <button type="button" class="btn" id="create-assessment-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="create-assessment-menu">
          Create assessment
          ${svg('<path d="m6 9 6 6 6-6"/>')}
        </button>
        <div class="menu" role="menu" id="create-assessment-menu" aria-labelledby="create-assessment-trigger" hidden>
          <a class="menu-item" role="menuitem" tabindex="-1" href="${setupUrl}scratch">New assessment</a>
          <a class="menu-item" role="menuitem" tabindex="-1" href="${setupUrl}library">Choose from library</a>
        </div>
      </div>`;
  };
})();
