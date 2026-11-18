/* Shared assessment setup dialog for entry screens and the item builder. */
(() => {
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const make=h=>{const w=document.createElement('div');w.innerHTML=h;return w.firstElementChild};
 const college='College and career readiness';
 const libraryPath='Ready-to-use classroom assessments';
 const statePath='Alabama state standards';
 const futureStatePath=statePath+' · Future Release';
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
 function create({host, initial, onSubmit, onClose, heading, submitLabel, showSettings=true, showAssessmentTitle=false}) {
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
  const choice=key=>{const [label,options]=settingGroups[key];return `<div class="field" role="group" aria-labelledby="cap-set-${key}"><p class="label" id="cap-set-${key}">${label}</p><div class="button-group button-group-segmented">${options.map(([value,text])=>`<button type="button" class="btn btn-ghost" data-set="${key}" data-value="${esc(value)}" aria-pressed="false">${esc(text)}</button>`).join('')}</div></div>`};
  const closeButton=()=>`<button class="btn btn-ghost btn-icon dialog-close" type="button" data-close-setup aria-label="Close setup"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>`;
  const modal=make(`<dialog class="dialog cap-setup-modal" aria-labelledby="cap-setup-title">
   <section class="cap-setup-view" data-setup-view="form">
    <div class="cap-setup-heading dialog-header">
     <div class="cap-setup-title-row">
      <span class="icon-accent" aria-hidden="true">${icon('<path d="m12 2 10 5-10 5L2 7Zm-10 10 10 5 10-5M2 17l10 5 10-5"/>')}</span>
      <div><h2 class="dialog-title" id="cap-setup-title" tabindex="-1" autofocus>${esc(heading||'Set up your assessment by creating a test')}</h2>
       <p class="dialog-description">Choose a subject, grade level, pathway and standard for your test.</p></div>
     </div>
     ${closeButton()}
    </div>
    <form class="cap-setup-fields" id="uc-assessment-details" aria-label="Test details" novalidate>
     <div class="item item-muted cap-assessment-title" data-assessment-title-field ${showAssessmentTitle?'':'hidden'}>
      <label class="label" for="uc-title">Assessment title</label>
      <div class="field">
      <input class="input" id="uc-title" maxlength="90" required aria-describedby="cap-title-error">
      <p class="field-error" id="cap-title-error" hidden>Enter an assessment title.</p>
      </div>
     </div>
     <h3 class="text-body-base font-semibold">Test details</h3>
     <div class="field" data-test-name-field>
      <label class="label" for="cap-test-name">Test name</label>
      <input class="input" id="cap-test-name" maxlength="90" required aria-describedby="cap-test-name-error">
      <p class="field-error" id="cap-test-name-error" hidden>Enter a test name.</p>
     </div>
     <div class="cap-setup-columns">
      <div class="field"><label class="label" for="uc-subject">Subject</label><span class="select-wrap"><select class="select" id="uc-subject" required></select></span></div>
      <div class="field"><label class="label" for="uc-grade">Grade level</label><span class="select-wrap"><select class="select" id="uc-grade" required>${grades.map(g=>`<option value="${esc(g)}">Grade ${esc(g)}</option>`).join('')}</select></span></div>
     </div>
     <div class="cap-setup-columns">
      <div class="field">
       <label class="label" for="uc-pathway">Test pathway</label>
       <span class="select-wrap"><select class="select" id="uc-pathway"><option>${college}</option><option>${libraryPath}</option><option value="${statePath}" disabled>${futureStatePath}</option></select></span>
      </div>
      <div class="field">
       <div class="cap-setup-label-row"><label class="label" for="cap-standard-select">Standard</label><button class="cap-setup-link" type="button" data-about-standard hidden>About this standard</button></div>
       <span class="select-wrap"><select class="select" id="cap-standard-select"></select></span>
      </div>
     </div>
     <details class="cap-settings-disclosure">
      <summary class="item"><span class="item-content text-body-base font-semibold">Quick settings</span>
       ${icon('<path d="M5 12h14"/><path class="cap-settings-plus" d="M12 5v14"/>')}</summary>
      <div class="cap-settings-content">
     <div class="cap-setup-settings" data-settings-block ${showSettings?'':'hidden'}>
      ${choice('attempts')}
      <fieldset class="field cap-setup-radios"><legend class="label">Show results to learners</legend>${resultOptions.map(v=>`<label class="check"><input type="radio" class="radio" name="cap-results" value="${esc(v)}"> ${esc(v)}</label>`).join('')}</fieldset>
      <div class="cap-setup-columns">${choice('questionOrder')}${choice('optionOrder')}</div>
      <div class="cap-setup-columns">${choice('calculator')}${choice('notes')}</div>
      <div data-calc-type hidden>${choice('calculatorType')}</div>
      ${choice('limit')}
     </div>
     <div class="cap-setup-optional-fields">
      <div class="field cap-setup-duration">
       <label class="label" for="cap-duration">Duration in minutes</label>
       <div class="cap-setup-stepper">
        <button class="btn btn-ghost btn-icon btn-sm" type="button" data-step="-1" aria-label="Decrease duration">${icon('<path d="M5 12h14"/>')}</button>
        <input class="input" id="cap-duration" type="number" min="0" step="1" inputmode="numeric" aria-describedby="cap-duration-error">
        <button class="btn btn-ghost btn-icon btn-sm" type="button" data-step="1" aria-label="Increase duration">${icon('<path d="M5 12h14"/><path d="M12 5v14"/>')}</button>
       </div>
       <p class="field-error" id="cap-duration-error" hidden>Enter a whole number.</p>
      </div>
      <div class="field"><label class="label" for="cap-description">Description</label><textarea class="textarea" id="cap-description" rows="3" placeholder="Type here"></textarea></div>
      <div class="field"><label class="label" for="cap-resource">Resource link</label><input class="input" id="cap-resource" type="url" placeholder="https://…"></div>
      <div class="field"><label class="label" for="cap-notes">Additional notes</label><textarea class="textarea" id="cap-notes" rows="3" placeholder="Type here"></textarea></div>
     </div>
      </div>
     </details>
    </form>
    <div class="cap-setup-buttons dialog-footer">
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
  const duration=find('#cap-duration'), description=find('#cap-description'), resource=find('#cap-resource'), notes=find('#cap-notes');
  const testName=find('#cap-test-name'), testNameField=find('[data-test-name-field]');
  const settingsDisclosure=find('.cap-settings-disclosure');
  const standardSelect=find('#cap-standard-select'), aboutStandard=find('[data-about-standard]');
  const formView=find('[data-setup-view="form"]'), standardView=find('[data-setup-view="standard"]');
  const preview=find('.cap-standard-preview'), standardTitle=find('#cap-standard-title');
  let standard='', alabamaContract=true;
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
      <ul><li>Builds on 4.NF.B.3 and 5.NF.A.1</li><li>Leads to 5.NF.B.6 · Fraction multiplication word problems</li></ul></div>
    </div>`:p(`Grade ${esc(selected.grade)} · ${esc(selected.title)}`);
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
  function open(settings){
   settingsDisclosure.open=false;
   title.value=settings.title;grade.value=settings.grade;updateSubjects(settings.subject);
   alabamaContract=settings.alabamaContract??true;
   const stateOption=pathway.options[2];
   const hasSavedStatePath=alabamaContract&&settings.pathway===statePath;
   stateOption.disabled=!hasSavedStatePath;
   stateOption.textContent=hasSavedStatePath?statePath:futureStatePath;
   pathway.value=settings.pathway||college;if(!pathway.value||pathway.selectedOptions[0]?.disabled)pathway.value=college;
   duration.value=settings.duration||0;description.value=settings.description??'';resource.value=settings.resource??'';notes.value=settings.notes??'';
   testName.value=settings.testName??'New test';
   const chosen={...settingDefaults,...(settings.assessmentSettings||{})};
   modal.querySelectorAll('[data-set]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===chosen[b.dataset.set])));
   modal.querySelectorAll('[name="cap-results"]').forEach(r=>r.checked=r.value===chosen.results);
   syncCalc();
   standard=settings.standard||'';renderStandards();renderPreview();
   for(const [input,error] of [[testName,'#cap-test-name-error'],[title,'#cap-title-error'],[duration,'#cap-duration-error']]){
    input.removeAttribute('aria-invalid');find(error).hidden=true;
   }
   formView.hidden=false;standardView.hidden=true;modal.setAttribute('aria-labelledby','cap-setup-title');
   if(!modal.open)modal.showModal();
  }
  modal.querySelectorAll('[data-close-setup]').forEach(button=>button.onclick=()=>modal.close());
  modal.querySelectorAll('[data-back-setup]').forEach(button=>button.onclick=()=>showView('form'));
  aboutStandard.onclick=()=>showView('standard');
  modal.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>{
   duration.value=Math.max(0,(parseInt(duration.value,10)||0)+Number(button.dataset.step));
  });
  /* A calculator choice (Basic, Scientific, Graphing) only shows when Calculator allowed is Yes. */
  const syncCalc=()=>{find('[data-calc-type]').hidden=!find('[data-set="calculator"][data-value="Allowed"]').matches('[aria-pressed="true"]')};
  modal.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{modal.querySelectorAll(`[data-set="${b.dataset.set}"]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));syncCalc()});
  const readSettings=()=>{const out={results:modal.querySelector('[name="cap-results"]:checked')?.value||settingDefaults.results};modal.querySelectorAll('[data-set][aria-pressed="true"]').forEach(b=>out[b.dataset.set]=b.dataset.value);return {...settingDefaults,...out}};
  modal.onclose=()=>onClose?.();
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
   for(const [input,error,valid] of [[testName,'#cap-test-name-error',testNameField.hidden||Boolean(testName.value.trim())],[title,'#cap-title-error',Boolean(next.title)],[duration,'#cap-duration-error',duration.validity.valid]]){
    input.setAttribute('aria-invalid',String(!valid));find(error).hidden=valid;
    if(!valid&&!invalid)invalid=input;
   }
   if(invalid){const disclosure=invalid.closest('details');if(disclosure)disclosure.open=true;invalid.focus();return}
   onSubmit({...next,duration:Number(duration.value)>0?duration.value:'',description:description.value.trim(),resource:resource.value.trim(),notes:notes.value.trim(),...(testNameField.hidden?{}:{testName:testName.value.trim()}),...(showSettings?{assessmentSettings:readSettings()}:{}),alabamaContract});
   modal.close();
  };
  return {open, remove:()=>modal.remove()};

 }
 window.capAssessmentSetup={create,itemPage,libraryPath,signature,settingDefaults};
})();
