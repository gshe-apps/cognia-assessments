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
 function create({host, initial, onSubmit, onClose, onDelete, heading, submitLabel, showSettings=true, showAssessmentTitle=false, allowLibrary=false, asPage=false}) {
  /* Assessment title shows when the first test of a new assessment is created and whenever a test is edited. */
  const forms=window.cogniaAssessmentForms||[];
  const libraryForms=asPage?[...forms,...(window.cogniaAssessmentTemplates||[])]:forms;
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
  const layersIcon=icon('<path d="m12.83 2.18 8.6 3.91a1 1 0 0 1 0 1.82l-8.6 3.91a2 2 0 0 1-1.66 0l-8.6-3.91a1 1 0 0 1 0-1.82l8.6-3.91a2 2 0 0 1 1.66 0Z"/><path d="m2 12 9.17 4.18a2 2 0 0 0 1.66 0L22 12M2 17l9.17 4.18a2 2 0 0 0 1.66 0L22 17"/>');
  const librarySubjectIcons={
   Mathematics:icon('<rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" />'),
   English:icon('<path d="M12 5v16" /><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />'),
  };
  const choice=key=>{const [label,options]=settingGroups[key];return `<div class="field" role="group" aria-labelledby="cap-set-${key}"><p class="label" id="cap-set-${key}">${label}</p><div class="button-group button-group-segmented">${options.map(([value,text])=>`<button type="button" class="btn btn-ghost btn-sm" data-set="${key}" data-value="${esc(value)}" aria-pressed="false">${esc(text)}</button>`).join('')}</div></div>`};
  const closeButton=()=>`<button class="btn btn-ghost btn-icon dialog-close" type="button" data-close-setup aria-label="Close setup"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>`;
  const tag=asPage?'div':'dialog';
  const modal=make(`<${tag} class="${asPage?'cap-setup-page':'dialog cap-setup-modal'}" aria-labelledby="cap-setup-title">
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
     ${allowLibrary?`<div class="tabs-list cap-setup-source-tabs" role="tablist" aria-label="How to create your assessment">
      <button type="button" class="tab" role="tab" id="cap-source-scratch" aria-controls="cap-source-scratch-panel" aria-selected="true" data-setup-source="scratch">Create from scratch</button>
      <button type="button" class="tab" role="tab" id="cap-source-library" aria-controls="cap-source-library-panel" aria-selected="false" tabindex="-1" data-setup-source="library">Pick from library</button>
     </div>`:''}
     <section class="cap-test-details-card" id="cap-source-scratch-panel" ${allowLibrary?'role="tabpanel" aria-labelledby="cap-source-scratch"':'aria-labelledby="cap-test-details-title"'}>
      <h3 id="cap-test-details-title" class="label">Test details</h3>
      <div class="cap-setup-columns">
       <div class="field" data-test-name-field>
        <label class="label" for="cap-test-name">Name <span class="field-error" aria-hidden="true">*</span></label>
        <input class="input" id="cap-test-name" maxlength="90" required aria-describedby="cap-test-name-error">
        <p class="field-error" id="cap-test-name-error" hidden>Enter a test name.</p>
       </div>
       <div class="field"><span class="label" id="uc-subject-label">Subject <span class="field-error" aria-hidden="true">*</span></span><div class="multiselect" id="uc-subject" data-placeholder="Select an option"><button type="button" class="select multiselect-trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="uc-subject-label uc-subject-value" aria-describedby="uc-subject-error"><span class="multiselect-value" id="uc-subject-value"></span></button><div class="menu select-menu multiselect-list" role="group" aria-labelledby="uc-subject-label" data-options hidden></div></div><p class="field-error" id="uc-subject-error" hidden>Choose at least one subject.</p></div>
      </div>
      <div class="cap-setup-columns">
       <div class="field"><span class="label" id="uc-grade-label">Grade level <span class="field-error" aria-hidden="true">*</span></span><div class="multiselect" id="uc-grade" data-placeholder="Select an option"><button type="button" class="select multiselect-trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="uc-grade-label uc-grade-value" aria-describedby="uc-grade-error"><span class="multiselect-value" id="uc-grade-value"></span></button><div class="menu select-menu multiselect-list" role="group" aria-labelledby="uc-grade-label" data-options hidden></div></div><p class="field-error" id="uc-grade-error" hidden>Choose at least one grade level.</p></div>
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
     ${allowLibrary?`<section class="cap-setup-library" id="cap-source-library-panel" role="tabpanel" aria-labelledby="cap-source-library" hidden>
      <div class="field"><label class="sr-only" for="cap-setup-library-search">Search tests</label><input type="search" class="input" id="cap-setup-library-search" placeholder="Search tests"></div>
      <div class="cap-setup-library-list" role="radiogroup" aria-label="Ready-to-use tests">
       ${forms.map(f=>`<label class="item card cap-setup-library-choice" aria-current="false" data-library-search="${esc([f.title,f.subject,'Grade '+f.grade].join(' ').toLowerCase())}"><span class="item-media icon-accent">${librarySubjectIcons[f.subject]||librarySubjectIcons.Mathematics}</span><span class="item-content"><span class="text-body-base font-semibold">${esc(f.title)}</span><span class="item-description">Grade ${esc(f.grade)} ${esc(f.subject)}, ${(f.questions||[]).length} items</span></span><span class="item-actions"><input class="radio" type="radio" name="cap-library-test" value="${esc(f.id)}"></span></label>`).join('')}
      </div>
      <p class="text-body-small text-muted-foreground" data-library-no-results role="status" hidden>No tests match. Try another search.</p>
      <p class="field-error" data-library-error role="alert" hidden>Select a test from the library.</p>
     </section>`:''}
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
  </${tag}>`);
  if(asPage){
   const form=modal.querySelector('form');
   const titleField=form.querySelector('[data-assessment-title-field]');
   const documentIcon=icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>');
   const assessment=make(`<section class="cap-entry-name" aria-labelledby="cap-assessment-details-title" data-entry-title>
    <div class="cap-entry-name-heading">
     <span class="icon-accent cap-entry-name-icon" aria-hidden="true">${documentIcon}${icon('<path d="M4 2v5m7 3 4-4m0 11h5"/>')}</span>
     <h2 class="text-subheading font-semibold" id="cap-assessment-details-title">Name your assessment</h2>
    </div>
   </section>`);
   titleField.classList.remove('cap-assessment-title');
   titleField.querySelector('label').className='sr-only';
   titleField.querySelector('input').placeholder='Enter an assessment title';
   assessment.append(titleField,make(`<button class="btn btn-lg" type="submit">Next: Test details ${icon('<path d="M5 12h14m-7-7 7 7-7 7"/>')}</button>`));
   const test=make('<section class="card" aria-labelledby="cap-test-details-title"><div class="card-content cap-setup-page-group"></div></section>');
   const scratch=form.querySelector('#cap-source-scratch-panel');
   const sourceSwitcher=form.querySelector('.cap-setup-source-tabs');
   const libraryPanel=form.querySelector('#cap-source-library-panel');
   const subjectIcon=librarySubjectIcons.English;
   const gradeIcon=icon('<path d="M4 19h16M7 15v-3m5 3V8m5 7V4"/>');
   const filterSelect=(key,label,emptyLabel,symbol,values,format=value=>value)=>`<span class="select-wrap cap-entry-library-filter">${symbol}<select class="select" aria-label="${label}" data-library-filter="${key}"><option value="">${emptyLabel}</option>${values.map(value=>`<option value="${esc(value)}">${esc(format(value))}</option>`).join('')}</select></span>`;
   const librarySubjects=[...new Set(libraryForms.map(form=>form.subject))].sort();
   const libraryGrades=[...new Set(libraryForms.map(form=>String(form.grade)))].sort((a,b)=>Number(a)-Number(b));
   const libraryTools=make(`<div class="cap-entry-library-tools">
    <div class="search search-lg" role="search">
     ${icon('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>').replace('<svg','<svg class="search-icon"')}
     <input class="input search-input" type="search" id="cap-setup-library-search" placeholder="Search assessments" aria-label="Search assessments" autocomplete="off">
    </div>
    ${filterSelect('subject','Subject','All subjects',subjectIcon,librarySubjects)}
    ${filterSelect('grade','Grade level','All grades',gradeIcon,libraryGrades,value=>'Grade '+value)}
   </div>`);
   libraryPanel.querySelector('.field').replaceWith(libraryTools);
   const libraryCards=libraryPanel.querySelector('[role="radiogroup"]');
   libraryCards.setAttribute('aria-label','Ready-to-use assessments');
   const topics={
    fractions:{symbol:icon('<path d="M5 8h6M8 5v6m5 5h6m-6 4h6"/>'),description:'Check understanding of adding and subtracting fractions.'},
    algebra:{symbol:icon('<path d="M5 7h2c2 0 3 10 5 10h2M5 17h2c2 0 3-10 5-10h2M16 10h6m-6 4h6"/>'),description:'Practise expressions and simple equations.'},
    reading:{symbol:subjectIcon,description:'Check comprehension and use of evidence from a text.'},
    shapes:{symbol:icon('<path d="M3 17 10 4l7 13Z"/><circle cx="17" cy="16" r="5"/>'),description:'Identify shapes, angles and their properties.'},
    measurement:{symbol:gradeIcon},
    'data-graphics':{symbol:icon('<path d="M9 3h6M10 3v7L5.2 18.7A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.3-2.3L14 10V3M8 15h8"/>')},
    'ratio-proportion':{symbol:icon('<path d="m19 5-14 14"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>')},
    'word-problems':{symbol:librarySubjectIcons.Mathematics}
   };
   libraryCards.innerHTML=libraryForms.map(form=>{
    const topic=topics[form.id];
    const description=form.description||topic?.description;
    const metadata=`${form.subject}, Grade ${form.grade}`;
    const searchText=[form.title,metadata,form.standard,description].join(' ').toLowerCase();
    return `<label class="cap-setup-library-choice" data-library-search="${esc(searchText)}" data-subject="${esc(form.subject)}" data-grade="${esc(form.grade)}">
     <span class="card cap-entry-library-paper">
      <span class="cap-entry-library-icon">${(topic?.symbol||layersIcon).replace('<svg','<svg class="icon icon-theme"')}</span>
      <span class="item-content">
       <span class="text-body-base font-semibold" id="cap-library-name-${esc(form.id)}">${esc(form.title)}</span>
       ${description?`<span class="item-description">${esc(description)}</span>`:''}
       <span class="cap-entry-library-meta"><span class="badge badge-secondary">${esc(form.subject)}</span><span class="badge badge-secondary">Grade ${esc(form.grade)}</span></span>
      </span>
     </span>
     <input class="radio" type="radio" name="cap-library-test" value="${esc(form.id)}" aria-labelledby="cap-library-name-${esc(form.id)}">
    </label>`;
   }).join('');
   libraryPanel.querySelector('[data-library-no-results]').textContent='No assessments match. Try another search.';
   libraryPanel.querySelector('[data-library-error]').textContent='Select an assessment from the library.';
   scratch.querySelector('h3').remove();
   const settingsIcon=icon('<path d="M4 7h5m4 0h7M4 17h9m4 0h3"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>');
   const iconTile=(symbol,tone='neutral')=>`<span class="item-media icon-accent cap-test-setup-icon" data-tone="${tone}">${symbol}</span>`;
   const sectionHeading=(id,label,description,symbol)=>`<div class="cap-test-setup-heading">${iconTile(symbol)}<div><h2 class="text-subheading font-semibold" id="${id}">${label}</h2><p class="text-body-small text-muted-foreground">${description}</p></div></div>`;
   const testHeading=make(sectionHeading('cap-test-details-title','Details','Set up the test information.',documentIcon));
   const testFields=make('<div class="cap-setup-page-group"></div>');
   const nameField=scratch.querySelector('[data-test-name-field]');
   const subjectField=scratch.querySelector('#uc-subject').closest('.field');
   const gradeField=scratch.querySelector('#uc-grade').closest('.field');
   const pathwayField=scratch.querySelector('#uc-pathway').closest('.field');
   const standardField=scratch.querySelector('#cap-standard-select').closest('.field');
   nameField.querySelector('label').firstChild.textContent='Test name ';
   nameField.querySelector('input').placeholder='Enter a test name';
   standardField.querySelector('label').textContent='Standards or focus area';
   const scopeFields=make('<div class="cap-setup-columns"></div>');
   scopeFields.append(subjectField,gradeField);
   const descriptionInput=form.querySelector('#cap-description');
   const descriptionField=descriptionInput.closest('.field');
   descriptionField.querySelector('label').insertAdjacentHTML('beforeend',' <span class="text-muted-foreground">(optional)</span>');
   descriptionInput.placeholder='Add a short description of the unit, topic or purpose.';
   descriptionInput.maxLength=500;
   const descriptionCount=make('<small class="cap-description-count text-body-small text-muted-foreground" aria-hidden="true">0 / 500</small>');
   descriptionInput.after(descriptionCount);
   descriptionInput.addEventListener('input',()=>descriptionCount.textContent=`${descriptionInput.value.length} / 500`);
   testFields.append(nameField,scopeFields,standardField,descriptionField);
   test.firstElementChild.append(testHeading,testFields);
   scratch.replaceChildren();
   scratch.className='cap-setup-page-group';
   const settings=make(`<section class="card" aria-labelledby="cap-page-settings-title"><div class="card-content cap-setup-page-group">${sectionHeading('cap-page-settings-title','Settings','Choose how learners take the test.',settingsIcon)}</div></section>`);
   const settingSelect=(key,options)=>`<select class="select" id="cap-page-${key}" data-page-setting="${key}">${options.map(([value,text])=>`<option value="${esc(value)}">${esc(text)}</option>`).join('')}</select>`;
   const settingTile=(key,label,options,symbol,tone)=>`<div class="item item-outline cap-page-setting-tile">
    ${iconTile(symbol,tone)}
    <div class="item-content"><label class="label" for="cap-page-${key}">${label}</label><span class="item-description" data-setting-value aria-hidden="true"></span></div>
    ${icon('<path d="m6 9 6 6 6-6"/>')}
    ${settingSelect(key,options)}
   </div>`;
   const settingSwitch=(key,label,on,off,symbol)=>`<div class="cap-page-setting"><label class="label" for="cap-page-${key}">${iconTile(symbol)}${label}</label><button class="switch" id="cap-page-${key}" type="button" role="switch" aria-checked="false" data-page-setting="${key}" data-on="${on}" data-off="${off}"></button></div>`;
   settings.firstElementChild.insertAdjacentHTML('beforeend',`
    <div class="item-group cap-page-settings-list">
     <div class="cap-page-settings-grid">
      ${settingTile('attempts','Attempts',[['One attempt only','1 attempt'],['2 attempts','2 attempts'],['3 attempts','3 attempts']],icon('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),'info')}
      ${settingTile('calculator','Calculator',[['Not allowed','Not allowed'],['Allowed','Allowed']],librarySubjectIcons.Mathematics,'accent')}
      ${settingTile('limit','Timer',settingGroups.limit[1].map(([value,label])=>[value,value==='None'?'No time limit':label]),icon('<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>'),'success')}
      ${settingTile('results','Display scores',resultOptions.map(result=>[result,result]),gradeIcon,'info')}
     </div>
     <div class="cap-page-setting" data-calc-type hidden><label class="label" for="cap-page-calculatorType">Calculator type</label><span class="select-wrap">${settingSelect('calculatorType',settingGroups.calculatorType[1])}</span></div>
     <div class="item-group">
      ${settingSwitch('questionOrder','Randomize items','Shuffle','As created',icon('<path d="m18 14 4 4-4 4m0-20 4 4-4 4M2 18h2.5c6 0 9-12 15-12H22M2 6h2.5C10.5 6 13.5 18 19.5 18H22"/>'))}
      ${settingSwitch('optionOrder','Shuffle answer options','Shuffle','As created',layersIcon)}
      ${settingSwitch('notes','Notes allowed','Allowed','Not allowed',icon('<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M16 3l5 5M10 14l1-4 8-8 3 3-8 8-4 1Z"/>'))}
     </div>
    </div>
   `);
   const optional=make('<details class="cap-page-optional"><summary class="label">More settings</summary></details>');
   const optionalFields=form.querySelector('.cap-setup-optional-fields');
   optionalFields.prepend(pathwayField);
   optional.append(optionalFields);
   settings.querySelector('.cap-page-settings-list').append(optional);
   const details=make('<div class="cap-setup-page-columns" data-entry-details hidden></div>');
   details.append(test,settings);
   const steps=make(`<ol class="cap-entry-steps" aria-label="Assessment creation steps">
    <li><span class="icon-accent cap-entry-step-setup">${layersIcon}</span><div><strong class="text-body-base font-semibold">Set up the test</strong><span class="text-body-small text-muted-foreground">Choose the subject, grade and standards</span></div></li>
    <li><span class="icon-accent cap-entry-step-items">${icon('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8m-4-4v8"/>')}</span><div><strong class="text-body-base font-semibold">Add items</strong><span class="text-body-small text-muted-foreground">Build your test from the item bank</span></div></li>
    <li><span class="icon-accent cap-entry-step-assign">${icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>')}</span><div><strong class="text-body-base font-semibold">Assign</strong><span class="text-body-small text-muted-foreground">Select classes and get results</span></div></li>
   </ol>`);
   scratch.append(assessment,details);
   form.replaceChildren(sourceSwitcher,scratch,libraryPanel);
   const helpDialog=make(`<dialog class="dialog cap-setup-help-dialog" id="cap-setup-help" aria-labelledby="cap-setup-help-title" aria-describedby="cap-setup-help-description">
    <div class="dialog-header">
     <h2 class="dialog-title" id="cap-setup-help-title">How assessment setup works</h2>
     ${closeButton().replace('data-close-setup','data-close-help').replace('Close setup','Close guide')}
     <p class="dialog-description" id="cap-setup-help-description">An assessment can include one or more tests. Start with your own test or choose a ready-made assessment from the library.</p>
    </div>
    <div class="dialog-body"></div>
    <div class="dialog-footer"><button class="btn btn-lg" type="button" data-close-help>Got it</button></div>
   </dialog>`);
   helpDialog.querySelector('.dialog-body').append(steps);
   modal.querySelector('#cap-setup-help').replaceWith(helpDialog);
   form.after(make(`<div class="tf-bottom card card-themed" role="region" aria-label="Assessment progress and actions" data-entry-progress hidden>
    ${window.capAssessmentProgressRing(1)}
    <div class="tf-bottom-copy"><p class="tf-bottom-step text-body-small">Test setup</p><div class="tf-bottom-title"><span class="text-body-base font-semibold" data-tf-summary-title></span><span class="badge badge-secondary">Draft</span></div></div>
    <div class="tf-original-actions">
     <button class="btn btn-ghost btn-lg" type="button" data-entry-back>${icon('<path d="m12 19-7-7 7-7M19 12H5"/>')}Back</button>
     <button class="btn btn-lg" type="submit" form="uc-assessment-details">Continue: Add items ${icon('<path d="M5 12h14m-7-7 7 7-7 7"/>')}</button>
    </div>
   </div>`));
   const pageHeading=make('<header class="cap-setup-page-heading"><div><h1 class="text-heading font-semibold" id="cap-setup-page-title" tabindex="-1">Create assessment</h1><p class="text-body-small text-muted-foreground">Start a new assessment or choose a ready-made one from the library.</p></div></header>');
   pageHeading.append(modal.querySelector('[data-setup-help]'));
   modal.querySelector('.cap-setup-heading').replaceWith(pageHeading);
   modal.setAttribute('aria-labelledby','cap-setup-page-title');
   modal.querySelector('[data-setup-view="standard"] [data-close-setup]').remove();
   modal.querySelector('#cap-source-scratch').innerHTML=`${documentIcon}New assessment`;
   modal.querySelector('#cap-source-library').innerHTML=`${layersIcon}Assessment library`;
  }
  host.append(modal);
  const find=(selector)=>modal.querySelector(selector);
  const panel=find('form'), title=find('#uc-title'), subjectBox=find('#uc-subject'), gradeBox=find('#uc-grade'), pathway=find('#uc-pathway');
  /* Grade level and Subject are multi-selects (23 Nov): several grades and subjects per test. The first of each is
     still saved as grade and subject, for the screens that show one; the full lists are grades and subjects. */
  const ticked=box=>[...box.querySelectorAll('[data-options] input:checked')].map(input=>input.value);
  const setOptions=(box,options,chosen)=>{box.querySelector('[data-options]').innerHTML=options.map(([value,text])=>`<label class="menu-item"><input class="checkbox" type="checkbox" value="${esc(value)}" ${chosen.includes(value)?'checked':''}>${esc(text)}</label>`).join('')};
  setOptions(gradeBox,grades.map(g=>[g,'Grade '+g]),[]);
  const description=find('#cap-description'), resource=find('#cap-resource'), notes=find('#cap-notes');
  const testName=find('#cap-test-name'), testNameField=find('[data-test-name-field]');
  const settingsDisclosure=find('.cap-settings-disclosure');
  const pageSettings=[...modal.querySelectorAll('[data-page-setting]')];
  const syncSettingValue=control=>{
   const value=control.parentElement.querySelector('[data-setting-value]');
   if(value)value.textContent=control.selectedOptions[0]?.textContent||'';
  };
  pageSettings.filter(control=>control.matches('select')).forEach(control=>{
   control.addEventListener('change',()=>syncSettingValue(control));
  });
  let source='scratch';
  let showTestDetails=false;
  const sourceTabs=[...modal.querySelectorAll('[data-setup-source]')];
  const submitButton=find('[data-submit-setup]');
  function renderEntryStage(){
   if(!asPage)return;
   find('[data-entry-title]').hidden=showTestDetails;
   find('[data-entry-details]').hidden=!showTestDetails;
   find('.cap-setup-source-tabs').hidden=showTestDetails;
   const scratch=find('#cap-source-scratch-panel');
   scratch.setAttribute('aria-labelledby',showTestDetails?'cap-setup-page-title':'cap-source-scratch');
   if(showTestDetails)scratch.removeAttribute('role');
   else scratch.setAttribute('role','tabpanel');
   find('.cap-setup-page-heading h1').textContent=showTestDetails?'Test setup':'Create assessment';
   find('.cap-setup-page-heading p').textContent=showTestDetails
    ?'Add the test details and choose settings for how learners take the test.'
    :'Start a new assessment or choose a ready-made one from the library.';
   const progress=find('[data-entry-progress]');
   progress.hidden=!showTestDetails;
   if(showTestDetails)progress.querySelector('[data-tf-summary-title]').textContent=title.value.trim();
   modal.classList.toggle('tf-page',showTestDetails);
   const actions=find('.cap-setup-buttons');
   actions.hidden=source==='scratch';
   actions.classList.toggle('cap-entry-library-actions',source==='library');
   submitButton.disabled=source==='library'&&!find('[name="cap-library-test"]:checked');
  }
  if(asPage&&window.ResizeObserver){
   const progress=find('[data-entry-progress]');
   new ResizeObserver(()=>modal.style.setProperty('--tf-bar-height',progress.offsetHeight+'px')).observe(progress);
  }
  if(asPage)find('[data-entry-back]').onclick=()=>{
   showTestDetails=false;
   renderEntryStage();
   title.focus();
  };
  function setSource(value){
   source=value;
   sourceTabs.forEach(tab=>{const active=tab.dataset.setupSource===source;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
   find('#cap-source-scratch-panel').hidden=source!=='scratch';
   find('#cap-source-library-panel').hidden=source!=='library';
   if(settingsDisclosure)settingsDisclosure.hidden=source==='library';
   submitButton.textContent=source==='library'?(asPage?'Use assessment':'Use this test'):submitLabel||'Continue';
   renderEntryStage();
  }
  sourceTabs.forEach(tab=>{
   tab.onclick=()=>setSource(tab.dataset.setupSource);
   tab.onkeydown=event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?sourceTabs[0]:event.key==='End'?sourceTabs[1]:sourceTabs.find(candidate=>candidate!==tab);
    next.click();next.focus();
   };
  });
  const librarySearch=find('#cap-setup-library-search');
  function filterLibrary(){
   const query=librarySearch.value.trim().toLowerCase();
   const subjectFilter=find('[data-library-filter="subject"]')?.value;
   const gradeFilter=find('[data-library-filter="grade"]')?.value;
   const rows=[...modal.querySelectorAll('[data-library-search]')];
   for(const row of rows){
    row.hidden=!row.dataset.librarySearch.includes(query)
     || Boolean(subjectFilter&&subjectFilter!==row.dataset.subject)
     || Boolean(gradeFilter&&gradeFilter!==row.dataset.grade);
    if(asPage&&row.hidden)row.querySelector('input').checked=false;
   }
   find('[data-library-no-results]').hidden=rows.some(row=>!row.hidden);
   renderEntryStage();
  }
  librarySearch?.addEventListener('input',filterLibrary);
  modal.querySelectorAll('[data-library-filter]').forEach(filter=>filter.addEventListener('change',filterLibrary));
  modal.querySelectorAll('[name="cap-library-test"]').forEach(input=>input.onchange=()=>{
   modal.querySelectorAll('.cap-setup-library-choice').forEach(row=>{const on=row.querySelector('input').checked;row.setAttribute('aria-current',String(on));row.querySelector('.card')?.classList.toggle('card-selected',on);});
   find('[data-library-error]').hidden=true;
   renderEntryStage();
  });
  const helpButton=find('[data-setup-help]'), help=find('#cap-setup-help');
  function showHelp(expanded){
   if(asPage){
    if(expanded&&!help.open)help.showModal();
    return;
   }
   help.hidden=!expanded;
   helpButton.setAttribute('aria-expanded',String(expanded));
  }
  if(asPage){
   helpButton.removeAttribute('aria-expanded');
   helpButton.setAttribute('aria-haspopup','dialog');
   helpButton.onclick=()=>showHelp(true);
   help.querySelectorAll('[data-close-help]').forEach(button=>button.onclick=()=>help.close());
   help.addEventListener('click',event=>{
    if(event.target!==help)return;
    const {left,right,top,bottom}=help.getBoundingClientRect();
    if(event.clientX<left||event.clientX>right||event.clientY<top||event.clientY>bottom)help.close();
   });
   help.addEventListener('close',()=>helpButton.focus());
  }else helpButton.onclick=()=>showHelp(help.hidden);
  const standardSelect=find('#cap-standard-select'), aboutStandard=find('[data-about-standard]');
  const formView=find('[data-setup-view="form"]'), standardView=find('[data-setup-view="standard"]');
  const preview=find('.cap-standard-preview'), standardTitle=find('#cap-standard-title');
  let standard='', alabamaContract=true, savedDuration='';
  const label=s=>s.code+' - '+s.title;
  const selectedStandard=()=>standards.find(s=>s.code===standard&&ticked(subjectBox).includes(s.subject));
  /* Subjects offered are those of the ticked grades (every subject when no grade is ticked); ticked subjects
     that are still offered stay ticked. */
  function updateSubjects(preferred=ticked(subjectBox)){
   const chosenGrades=ticked(gradeBox);
   const subjects=[...new Set(standards.filter(s=>!chosenGrades.length||chosenGrades.includes(s.grade)).map(s=>s.subject))];
   preferred.forEach(name=>{if(name&&!subjects.includes(name))subjects.push(name)});
   if(!subjects.length)subjects.push('Mathematics');
   setOptions(subjectBox,subjects.map(name=>[name,name]),preferred.filter(name=>subjects.includes(name)));
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
   const chosenGrades=ticked(gradeBox),chosenSubjects=ticked(subjectBox);
   const available=standards.filter(s=>chosenSubjects.includes(s.subject)&&chosenGrades.includes(s.grade));
   standardSelect.replaceChildren(new Option(asPage?'Select a standard or focus area':'Select a standard',''),...available.map(s=>new Option(label(s),s.code)));
   standardSelect.value=standard;
  }
  function showView(name){
   formView.hidden=name!=='form';standardView.hidden=name!=='standard';
   modal.setAttribute('aria-labelledby',name==='form'?(asPage?'cap-setup-page-title':'cap-setup-title'):'cap-standard-title');
   (name==='form'?aboutStandard:standardTitle).focus();
  }
  const scope=()=>{
   const grades=ticked(gradeBox),subjects=ticked(subjectBox);
   return {title:title.value.trim(),grade:grades[0]||'',subject:subjects[0]||'',grades,subjects,standard,pathway:pathway.value};
  };
  function open(settings,{expandSettings=false,initialSource='scratch'}={}){
   showTestDetails=false;
   if(allowLibrary)setSource(initialSource);
   showHelp(false);
   if(settingsDisclosure)settingsDisclosure.open=expandSettings;
   title.value=asPage?'':settings.title;
   const openGrades=(settings.grades?.length?settings.grades:[settings.grade]).filter(Boolean).map(String);
   setOptions(gradeBox,[...new Set([...grades,...openGrades])].sort((a,b)=>Number(a)-Number(b)).map(g=>[g,'Grade '+g]),openGrades);
   updateSubjects((settings.subjects?.length?settings.subjects:[settings.subject]).filter(Boolean));
   alabamaContract=settings.alabamaContract??true;
   const stateOption=pathway.options[2];
   const hasSavedStatePath=alabamaContract&&settings.pathway===statePath;
   stateOption.disabled=!hasSavedStatePath;
   stateOption.textContent=hasSavedStatePath?statePathLabel:futureStatePath;
   pathway.value=settings.pathway||college;if(!pathway.value||pathway.selectedOptions[0]?.disabled)pathway.value=college;
   savedDuration=settings.duration||'';
   description.value=settings.description??'';resource.value=settings.resource??'';notes.value=settings.notes??'';
   if(asPage)description.dispatchEvent(new Event('input'));
   testName.value=settings.testName??'New test';
   const chosen={...settingDefaults,...(settings.assessmentSettings||{})};
   modal.querySelectorAll('[data-set]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===chosen[b.dataset.set])));
   modal.querySelectorAll('[name="cap-results"]').forEach(r=>r.checked=r.value===chosen.results);
   pageSettings.forEach(control=>{
    const value=chosen[control.dataset.pageSetting];
    if(control.matches('[role="switch"]'))control.setAttribute('aria-checked',String(value===control.dataset.on));
    else{
     control.value=value;
     syncSettingValue(control);
    }
   });
   syncCalc();
   standard=settings.standard||'';renderStandards();renderPreview();
   for(const [input,error] of [[testName,'#cap-test-name-error'],[title,'#cap-title-error'],[gradeBox.firstElementChild,'#uc-grade-error'],[subjectBox.firstElementChild,'#uc-subject-error']]){
    input.removeAttribute('aria-invalid');find(error).hidden=true;
   }
   formView.hidden=false;standardView.hidden=true;modal.setAttribute('aria-labelledby',asPage?'cap-setup-page-title':'cap-setup-title');
   if(!asPage&&!modal.open)modal.showModal();
   /* Opened from a Settings view: Quick settings start expanded and scrolled into view. */
   if(expandSettings)requestAnimationFrame(()=>settingsDisclosure.scrollIntoView({block:'start',behavior:'smooth'}));
  }
  modal.querySelectorAll('[data-close-setup]').forEach(button=>button.onclick=()=>asPage?onClose?.():modal.close());
  modal.querySelectorAll('[data-back-setup]').forEach(button=>button.onclick=()=>showView('form'));
  aboutStandard.onclick=()=>showView('standard');
  /* A calculator choice (Basic, Scientific, Graphing) only shows when Calculator allowed is Yes. */
  const syncCalc=()=>{
   const calculatorAllowed=asPage
    ?find('[data-page-setting="calculator"]').value==='Allowed'
    :find('[data-set="calculator"][data-value="Allowed"]').matches('[aria-pressed="true"]');
   find('[data-calc-type]').hidden=!calculatorAllowed;
  };
  if(asPage)find('[data-page-setting="calculator"]').addEventListener('change',syncCalc);
  modal.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{modal.querySelectorAll(`[data-set="${b.dataset.set}"]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));syncCalc()});
  pageSettings.filter(control=>control.matches('[role="switch"]')).forEach(control=>{
   control.onclick=()=>{
    control.setAttribute('aria-checked',String(!control.matches('[aria-checked="true"]')));
    syncCalc();
   };
  });
  const readSettings=()=>{
   if(asPage){
    const settings={...settingDefaults};
    for(const control of pageSettings){
     const key=control.dataset.pageSetting;
     const value=control.matches('[role="switch"]')
      ?(control.matches('[aria-checked="true"]')?control.dataset.on:control.dataset.off)
      :control.value;
     settings[key]=value||settings[key];
    }
    return settings;
   }
   const out={results:find('[name="cap-results"]:checked')?.value||settingDefaults.results};
   modal.querySelectorAll('[data-set][aria-pressed="true"]').forEach(b=>out[b.dataset.set]=b.dataset.value);
   return {...settingDefaults,...out};
  };
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
   const chosenGrades=ticked(gradeBox),chosenSubjects=ticked(subjectBox);
   if(!standards.some(s=>s.code===standard&&chosenGrades.includes(s.grade)&&chosenSubjects.includes(s.subject)))standard='';
   renderStandards();renderPreview();
  }
  const clearError=(box,error)=>{if(ticked(box).length){box.firstElementChild.removeAttribute('aria-invalid');find(error).hidden=true}};
  gradeBox.addEventListener('change',()=>{updateSubjects();changeScope();clearError(gradeBox,'#uc-grade-error')});
  subjectBox.addEventListener('change',()=>{changeScope();clearError(subjectBox,'#uc-subject-error')});
  panel.onsubmit=event=>{
   event.preventDefault();
   const next=scope();
   if(asPage&&source==='scratch'&&!showTestDetails){
    title.setAttribute('aria-invalid',String(!next.title));find('#cap-title-error').hidden=Boolean(next.title);
    if(!next.title){title.focus();return;}
    showTestDetails=true;
    renderEntryStage();
    find('#cap-setup-page-title').focus();
    return;
   }
   if(allowLibrary&&source==='library'){
    if(!asPage&&!next.title){title.setAttribute('aria-invalid','true');find('#cap-title-error').hidden=false;title.focus();return;}
    const chosen=find('[name="cap-library-test"]:checked');
    if(!chosen){find('[data-library-error]').hidden=false;find('[name="cap-library-test"]')?.focus();return;}
    const libraryTitle=asPage?libraryForms.find(form=>form.id===chosen.value)?.title:next.title;
    onSubmit({...next,title:libraryTitle,libraryForm:chosen.value,assignLibrary:asPage});
    if(!asPage)modal.close();
    return;
   }
   let invalid;
   for(const [input,error,valid] of [[testName,'#cap-test-name-error',testNameField.hidden||Boolean(testName.value.trim())],[title,'#cap-title-error',Boolean(next.title)],[gradeBox.firstElementChild,'#uc-grade-error',next.grades.length>0],[subjectBox.firstElementChild,'#uc-subject-error',next.subjects.length>0]]){
    input.setAttribute('aria-invalid',String(!valid));find(error).hidden=valid;
    if(!valid&&!invalid)invalid=input;
   }
   if(invalid){invalid.focus();return}
   onSubmit({...next,duration:savedDuration,description:description.value.trim(),resource:resource.value.trim(),notes:notes.value.trim(),...(testNameField.hidden?{}:{testName:testName.value.trim()}),...(showSettings?{assessmentSettings:readSettings()}:{}),alabamaContract});
   if(!asPage)modal.close();
  };
  return {open, remove:()=>modal.remove()};

 }
 window.capAssessmentSetup={create,itemPage,libraryPath,signature,settingDefaults};
})();
