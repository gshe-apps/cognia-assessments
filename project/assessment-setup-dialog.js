/* Shared assessment setup dialog for entry screens and the item builder. */
(() => {
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const make=h=>{const w=document.createElement('div');w.innerHTML=h;return w.firstElementChild};
 const college='College and career readiness';
 const libraryPath='Ready-to-use classroom assessments';
 const statePath='Alabama state standards';
 const statePathLabel='State standards';
 const futureStatePath=statePathLabel+' (future release)';
 const itemPage=({subject,grade})=>subject==='English'?'CAP-T05-Reading.dc.html':grade==='8'?'CAP-T05-Algebra.dc.html':'CAP-T05-Questions.dc.html';
 const signature=({title,grade,subject,standard,pathway})=>JSON.stringify({title,grade,subject,standard:standard||'',pathway:pathway||college});
 /* Assessment settings (attempts, results, order, tools, time limit) live in this modal, above Optional settings. */
 const settingDefaults={attempts:'One attempt only',results:'After submission',questionOrder:'As created',optionOrder:'As created',calculator:'Not allowed',calculatorType:'Basic',notes:'Not allowed',limit:'5 minutes'};
 const settingGroups={
  attempts:['Attempts',[['One attempt only','1'],['2 attempts','2'],['3 attempts','3']]],
  questionOrder:['Item order',[['As created','As created'],['Shuffle','Shuffle']]],
  optionOrder:['Answer option order',[['As created','As created'],['Shuffle','Shuffle']]],
  calculator:['Calculator allowed?',[['Allowed','Yes'],['Not allowed','No']]],
  calculatorType:['Which calculator?',[['Basic','Basic'],['Scientific','Scientific'],['Graphing','Graphing']]],
  notes:['Notes allowed?',[['Allowed','Yes'],['Not allowed','No']]],
  limit:['Time limit',[['None','No limit'],['5 minutes','5 min'],['10 minutes','10 min'],['15 minutes','15 min'],['20 minutes','20 min']]]
 };
 const resultOptions=['After submission','After all sessions close','Do not show'];
 function create({host, initial, onSubmit, onClose, onDelete, heading, submitLabel, showSettings=true, showAssessmentTitle=false}) {
  /* Assessment title shows when the first test of a new assessment is created and whenever a test is edited. */
  const forms=window.cogniaAssessmentForms||[];
  const sampleStandards=[
   ['4.NF.A.1','Equivalent fractions','4'],
   ['4.NF.B.3','Add and subtract like fractions','4'],
   ['5.NF.A.1','Add and subtract unlike fractions','5'],
   ['5.NF.A.2','Fraction word problems','5'],
   ['5.NF.B.4','Multiply fractions','5'],
   ['5.NF.B.6','Fraction multiplication word problems','5']
  ].map(([code,title,grade])=>({code,title,grade,subject:'Mathematics'}));
  const standards=[...sampleStandards,...forms
   .filter(f=>f.standard&&!sampleStandards.some(s=>s.code===f.standard))
   .map(f=>({code:f.standard,title:f.standardLabel||f.title||f.standard,grade:f.grade,subject:f.subject}))];
  const grades=[...new Set([...standards.map(s=>s.grade),initial.grade])].sort((a,b)=>Number(a)-Number(b));
  const artwork=(name)=>`<span class="cap-guide-art" style="--guide-art:url('assets/assessment-guide/${name}.svg')" aria-hidden="true"></span>`;
  const icon=(paths)=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const choice=key=>{const [label,options]=settingGroups[key];return `<div class="field" role="group" aria-labelledby="cap-set-${key}"><p class="label" id="cap-set-${key}">${label}</p><div class="button-group button-group-segmented">${options.map(([value,text])=>`<button type="button" class="btn btn-ghost btn-sm" data-set="${key}" data-value="${esc(value)}" aria-pressed="false">${esc(text)}</button>`).join('')}</div></div>`};
  const closeButton=()=>`<button class="btn btn-ghost btn-icon dialog-close" type="button" data-close-setup aria-label="Close setup"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>`;
  const modal=make(`<dialog class="dialog cap-setup-modal" aria-labelledby="cap-setup-title">
   <section class="cap-setup-view" data-setup-view="form">
    <div class="cap-setup-heading dialog-header">
     <div class="cap-setup-title-row">
      <h2 class="dialog-title" id="cap-setup-title" tabindex="-1" autofocus>${esc(heading||'Create a new assessment')}</h2>
     </div>
     <div class="cap-setup-header-actions">
      <button class="btn btn-ghost btn-icon" type="button" data-setup-help aria-label="How assessment setup works" title="How assessment setup works" aria-expanded="false" aria-controls="cap-setup-help">
       ${icon('<path d="M12 7v14"/><path d="M3 18V5a1 1 0 0 1 1-1h3a5 5 0 0 1 5 5 5 5 0 0 1 5-5h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4a4 4 0 0 0-4 2 4 4 0 0 0-4-2H4a1 1 0 0 1-1-1Z"/>')}
      </button>
      ${closeButton()}
     </div>
    </div>
    <aside class="item item-muted" id="cap-setup-help" aria-label="How assessment setup works" hidden>
     <p class="text-body-small">An assessment can include one or more tests. You can add another test during review, before assigning the assessment.</p>
    </aside>
    <form class="cap-setup-fields" id="uc-assessment-details" aria-label="Test details" novalidate>
     <div class="field cap-assessment-title" data-assessment-title-field ${showAssessmentTitle?'':'hidden'}>
      <label class="label" for="uc-title">Assessment title <span class="field-error" aria-hidden="true">*</span></label>
      <input class="input" id="uc-title" maxlength="90" required aria-describedby="cap-title-error">
      <p class="field-error" id="cap-title-error" hidden>Enter an assessment title.</p>
     </div>
     <section class="cap-test-details-card" aria-labelledby="cap-test-details-title">
      <h3 id="cap-test-details-title" class="label">Test details</h3>
      <div class="cap-setup-columns">
       <div class="field" data-test-name-field>
        <label class="label" for="cap-test-name">Name <span class="field-error" aria-hidden="true">*</span></label>
        <input class="input" id="cap-test-name" maxlength="90" required aria-describedby="cap-test-name-error">
        <p class="field-error" id="cap-test-name-error" hidden>Enter a test name.</p>
       </div>
       <div class="field"><label class="label" for="uc-subject">Subject <span class="field-error" aria-hidden="true">*</span></label><span class="select-wrap"><select class="select" id="uc-subject" required></select></span></div>
      </div>
      <div class="cap-setup-columns">
       <div class="field"><label class="label" for="uc-grade">Grade level <span class="field-error" aria-hidden="true">*</span></label><span class="select-wrap"><select class="select" id="uc-grade" required>${grades.map(g=>`<option value="${esc(g)}">Grade ${esc(g)}</option>`).join('')}</select></span></div>
       <div class="field">
        <label class="label" for="uc-pathway">Pathway</label>
        <span class="select-wrap"><select class="select" id="uc-pathway"><option>${college}</option><option>${libraryPath}</option><option value="${statePath}" disabled>${futureStatePath}</option></select></span>
       </div>
      </div>
      <div class="field">
       <div class="cap-setup-label-row"><label class="label" for="cap-standard-select">Standard</label><button class="cap-setup-link" type="button" data-about-standard aria-label="About this standard" title="About this standard" hidden>${icon('<circle cx="12" cy="12" r="10"/><path d="M12 11v5m0-8h.01"/>')}</button></div>
       <span class="select-wrap"><select class="select" id="cap-standard-select"></select></span>
      </div>
     </section>
     <details class="cap-settings-disclosure">
      <summary class="item"><span class="item-content text-body-base font-semibold">Quick settings</span>
       <span class="btn btn-ghost btn-icon btn-sm" aria-hidden="true">${icon('<path d="M5 12h14"/><path class="cap-settings-plus" d="M12 5v14"/>')}</span></summary>
      <div class="cap-settings-content">
       <div class="card cap-settings-panels" ${showSettings?'':'hidden'}>
        <section class="cap-setup-settings" aria-labelledby="cap-setup-settings-title">
         <h4 class="card-title" id="cap-setup-settings-title">Assessment setup</h4>
          ${choice('attempts')}
          <fieldset class="field cap-setup-radios"><legend class="label">Show results to learners</legend>${resultOptions.map(v=>`<label class="check"><input type="radio" class="radio" name="cap-results" value="${esc(v)}"> ${esc(v)}</label>`).join('')}</fieldset>
          ${choice('limit')}
        </section>
        <section class="cap-setup-settings cap-additional-settings" aria-labelledby="cap-other-settings-title">
         <h4 class="card-title" id="cap-other-settings-title">Additional settings</h4>
         ${choice('questionOrder')}
         ${choice('optionOrder')}
         ${choice('calculator')}
         <div data-calc-type hidden>${choice('calculatorType')}</div>
         ${choice('notes')}
        </section>
       </div>
       <div class="cap-setup-optional-fields">
        <div class="field"><label class="label" for="cap-description">Description</label><textarea class="textarea" id="cap-description" rows="3" placeholder="Type here"></textarea></div>
        <div class="field"><label class="label" for="cap-resource">Resource link</label><input class="input" id="cap-resource" type="url" placeholder="https://…"></div>
        <div class="field"><label class="label" for="cap-notes">Additional notes</label><textarea class="textarea" id="cap-notes" rows="3" placeholder="Type here"></textarea></div>
       </div>
      </div>
     </details>
    </form>
    <div class="cap-setup-buttons dialog-footer">
     ${onDelete?'<button class="btn btn-outline btn-lg is-destructive cap-setup-delete" type="button" data-delete-setup>Delete test</button>':''}
     <button class="btn btn-ghost btn-lg" type="button" data-close-setup>Cancel</button>
     <button class="btn btn-lg" type="submit" form="uc-assessment-details" data-submit-setup>${esc(submitLabel||'Continue')}</button>
    </div>
   </section>
   <section class="cap-setup-view" data-setup-view="standard" hidden>
    <div class="cap-setup-heading dialog-header">
     <div class="cap-setup-title-row">
      <button class="btn btn-ghost btn-icon btn-sm" type="button" data-back-setup aria-label="Back to setup">${icon('<path d="m15 18-6-6 6-6"/>')}</button>
      <h2 class="dialog-title" id="cap-standard-title" tabindex="-1"></h2>
     </div>
     ${closeButton()}
    </div>
    <div class="cap-standard-panel"><div class="cap-standard-preview"></div></div>
   </section>
  </dialog>`);
  host.append(modal);
  const find=(selector)=>modal.querySelector(selector);
  const panel=find('form'), title=find('#uc-title'), subject=find('#uc-subject'), grade=find('#uc-grade'), pathway=find('#uc-pathway');
  const description=find('#cap-description'), resource=find('#cap-resource'), notes=find('#cap-notes');
  const testName=find('#cap-test-name'), testNameField=find('[data-test-name-field]');
  const settingsDisclosure=find('.cap-settings-disclosure');
  const helpButton=find('[data-setup-help]'), help=find('#cap-setup-help');
  function showHelp(expanded){
   help.hidden=!expanded;
   helpButton.setAttribute('aria-expanded',String(expanded));
  }
  helpButton.onclick=()=>showHelp(help.hidden);
  const standardSelect=find('#cap-standard-select'), aboutStandard=find('[data-about-standard]');
  const formView=find('[data-setup-view="form"]'), standardView=find('[data-setup-view="standard"]');
  const preview=find('.cap-standard-preview'), standardTitle=find('#cap-standard-title');
  let standard='', alabamaContract=true, savedDuration='';
  const label=s=>s.code+' - '+s.title;
  const selectedStandard=()=>standards.find(s=>s.code===standard&&s.subject===subject.value);
  function updateSubjects(preferred){
   const subjects=[...new Set(standards.filter(s=>s.grade===grade.value).map(s=>s.subject))];
   if(!subjects.length)subjects.push(preferred||'Mathematics');
   subject.replaceChildren(...subjects.map(name=>new Option(name)));
   if(subjects.includes(preferred))subject.value=preferred;
  }
  function renderPreview(){
   const selected=selectedStandard();
   aboutStandard.hidden=!selected;
   if(!selected)return;
   standardTitle.textContent=label(selected);
   const fraction=selected.code==='5.NF.A.2';
   const p=text=>`<p class="text-body-small">${text}</p>`;
   preview.innerHTML=fraction?`
    ${alabamaContract?'<span class="badge badge-theme-light">Alabama AL.5.11</span>':''}
    <div class="cap-standard-body text-body-small">
     ${p('Solve word problems involving addition and subtraction of fractions referring to the same whole, including unlike denominators. Use benchmark fractions to estimate and check reasonableness.')}
     <div><h4 class="text-body-small font-semibold">Learning components</h4>
      <ul><li>Represent a word problem with an equation</li><li>Solve fraction word problems with unlike denominators</li><li>Use benchmark fractions to check reasonableness</li></ul></div>
     <div><h4 class="text-body-small font-semibold">Progression</h4>
      <ul><li>Builds on 4.NF.B.3 and 5.NF.A.1</li><li>Leads to 5.NF.B.6, fraction multiplication word problems</li></ul></div>
    </div>`:p(`Grade ${esc(selected.grade)} ${esc(selected.title)}`);
  }
  function renderStandards(){
   const available=standards.filter(s=>s.subject===subject.value&&s.grade===grade.value);
   standardSelect.replaceChildren(new Option('Select a standard',''),...available.map(s=>new Option(label(s),s.code)));
   standardSelect.value=standard;
  }
  function showView(name){
   formView.hidden=name!=='form';standardView.hidden=name!=='standard';
   modal.setAttribute('aria-labelledby',name==='form'?'cap-setup-title':'cap-standard-title');
   (name==='form'?aboutStandard:standardTitle).focus();
  }
  const scope=()=>({title:title.value.trim(),grade:grade.value,subject:subject.value,standard,pathway:pathway.value});
  function open(settings,{expandSettings=false}={}){
   showHelp(false);
   settingsDisclosure.open=expandSettings;
   title.value=settings.title;grade.value=settings.grade;updateSubjects(settings.subject);
   alabamaContract=settings.alabamaContract??true;
   const stateOption=pathway.options[2];
   const hasSavedStatePath=alabamaContract&&settings.pathway===statePath;
   stateOption.disabled=!hasSavedStatePath;
   stateOption.textContent=hasSavedStatePath?statePathLabel:futureStatePath;
   pathway.value=settings.pathway||college;if(!pathway.value||pathway.selectedOptions[0]?.disabled)pathway.value=college;
   savedDuration=settings.duration||'';
   description.value=settings.description??'';resource.value=settings.resource??'';notes.value=settings.notes??'';
   testName.value=settings.testName??'New test';
   const chosen={...settingDefaults,...(settings.assessmentSettings||{})};
   modal.querySelectorAll('[data-set]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===chosen[b.dataset.set])));
   modal.querySelectorAll('[name="cap-results"]').forEach(r=>r.checked=r.value===chosen.results);
   syncCalc();
   standard=settings.standard||'';renderStandards();renderPreview();
   for(const [input,error] of [[testName,'#cap-test-name-error'],[title,'#cap-title-error']]){
    input.removeAttribute('aria-invalid');find(error).hidden=true;
   }
   formView.hidden=false;standardView.hidden=true;modal.setAttribute('aria-labelledby','cap-setup-title');
   if(!modal.open)modal.showModal();
   /* Opened from a Settings view: Quick settings start expanded and scrolled into view. */
   if(expandSettings)requestAnimationFrame(()=>settingsDisclosure.scrollIntoView({block:'start',behavior:'smooth'}));
  }
  modal.querySelectorAll('[data-close-setup]').forEach(button=>button.onclick=()=>modal.close());
  modal.querySelectorAll('[data-back-setup]').forEach(button=>button.onclick=()=>showView('form'));
  aboutStandard.onclick=()=>showView('standard');
  /* A calculator choice (Basic, Scientific, Graphing) only shows when Calculator allowed is Yes. */
  const syncCalc=()=>{find('[data-calc-type]').hidden=!find('[data-set="calculator"][data-value="Allowed"]').matches('[aria-pressed="true"]')};
  modal.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{modal.querySelectorAll(`[data-set="${b.dataset.set}"]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));syncCalc()});
  const readSettings=()=>{const out={results:modal.querySelector('[name="cap-results"]:checked')?.value||settingDefaults.results};modal.querySelectorAll('[data-set][aria-pressed="true"]').forEach(b=>out[b.dataset.set]=b.dataset.value);return {...settingDefaults,...out}};
  modal.onclose=()=>onClose?.();
  /* Delete test (20 Nov): a small confirmation on top of the setup modal; confirming closes both. */
  modal.querySelector('[data-delete-setup]')?.addEventListener('click',()=>{
   const name=(modal.querySelector('#cap-test-name')?.value||initial.testName||'this test').trim();
   const confirm=make(`<dialog class="dialog dialog-sm cap-delete-confirm" aria-labelledby="cap-delete-title" aria-describedby="cap-delete-text">
    <div class="dialog-header"><h2 class="dialog-title" id="cap-delete-title">Delete this test?</h2>${closeButton().replace('data-close-setup','data-close-delete').replace('Close setup','Close')}</div>
    <p class="dialog-description" id="cap-delete-text">${esc(name)} and its items will be removed from this assessment. This can't be undone.</p>
    <div class="dialog-footer"><button class="btn btn-ghost btn-lg" type="button" data-close-delete>Cancel</button><button class="btn btn-destructive btn-lg" type="button" data-confirm-delete>Delete test</button></div>
   </dialog>`);
   modal.append(confirm);confirm.querySelectorAll('[data-close-delete]').forEach(b=>b.onclick=()=>confirm.close());
   confirm.onclose=()=>confirm.remove();
   confirm.querySelector('[data-confirm-delete]').onclick=()=>{confirm.close();onDelete();modal.close()};
   confirm.showModal();confirm.querySelector('[data-close-delete].btn-ghost').focus();
  });
  standardSelect.onchange=()=>{standard=standardSelect.value;renderPreview()};
  function changeScope(){
   if(!standards.some(s=>s.code===standard&&s.grade===grade.value&&s.subject===subject.value))standard='';
   renderStandards();renderPreview();
  }
  grade.onchange=()=>{updateSubjects(subject.value);changeScope()};
  subject.onchange=changeScope;
  panel.onsubmit=event=>{
   event.preventDefault();
   const next=scope();
   let invalid;
   for(const [input,error,valid] of [[testName,'#cap-test-name-error',testNameField.hidden||Boolean(testName.value.trim())],[title,'#cap-title-error',Boolean(next.title)]]){
    input.setAttribute('aria-invalid',String(!valid));find(error).hidden=valid;
    if(!valid&&!invalid)invalid=input;
   }
   if(invalid){invalid.focus();return}
   onSubmit({...next,duration:savedDuration,description:description.value.trim(),resource:resource.value.trim(),notes:notes.value.trim(),...(testNameField.hidden?{}:{testName:testName.value.trim()}),...(showSettings?{assessmentSettings:readSettings()}:{}),alabamaContract});
   modal.close();
  };
  return {open, remove:()=>modal.remove()};

 }
 window.capAssessmentSetup={create,itemPage,libraryPath,signature,settingDefaults};
})();
