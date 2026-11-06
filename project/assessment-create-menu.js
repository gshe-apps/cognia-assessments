/* Create assessment: the shared dropdown menu from the cognia-design plugin
   (btn, .dropdown, .menu in cognia-components.css). Opening, keyboard, Escape
   and click outside come from ds/cognia/cognia-components.js. */
(() => {
  const svg = (path) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';


  window.capOpenNewAssessment = (trigger) => {
    const {create,itemPage,libraryPath,signature}=window.capAssessmentSetup;
    const initial={title:'New classroom assessment',grade:'5',subject:'Mathematics',standard:'5.NF.A.2'};
    const host=trigger.closest('.theme-assessments')||document.body;
    const setup=create({
      host,
      initial,
      onClose(){
        setup.remove();
        (trigger.isConnected?trigger:document.getElementById(trigger.id))?.focus();
      },
      onSubmit(details){
        const id='test-'+Date.now();
        const page=itemPage(details);
        const test={id,...details,page,state:{chosen:[],written:{},edits:{}},questions:[]};
        const model={title:test.title,active:id,tests:[test]};
        localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(model));
        sessionStorage.setItem('capCreateConfirmed:'+id,signature(test));
        location.href=details.pathway===libraryPath?'CAP-T21-AssessmentLibrary.dc.html':page;
      }
    });
    setup.open(initial);
  };

  window.capMountAssessmentCreateMenu = (root) => {
    const host = root.querySelector('[data-assessment-create-menu]');
    if (!host || host.firstElementChild) return;

    host.innerHTML = `
      <div class="dropdown dropdown-end">
        <button type="button" class="btn btn-lg" id="create-assessment-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="create-assessment-menu">
          Create assessment
          ${svg('<path d="m6 9 6 6 6-6"/>')}
        </button>
        <div class="menu" role="menu" id="create-assessment-menu" aria-labelledby="create-assessment-trigger" hidden>
          <a class="menu-item" role="menuitem" tabindex="-1" href="CAP-T04-Setup.dc.html" data-create-from-scratch>
            ${svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5M14 2l6 6v3m-6-9v6h6m-3 7v6m-3-3h6"/>')}
            Create from scratch
          </a>
          <a class="menu-item" role="menuitem" tabindex="-1" href="CAP-T21-AssessmentLibrary.dc.html">
            ${svg('<path d="m12 2 10 5-10 5L2 7Zm-10 10 10 5 10-5M2 17l10 5 10-5"/>')}
            Use assessment library
          </a>
        </div>
      </div>`;
    host.querySelector('[data-create-from-scratch]').addEventListener('click',event=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      window.capOpenNewAssessment(host.querySelector('#create-assessment-trigger'));
    });
  };
})();
