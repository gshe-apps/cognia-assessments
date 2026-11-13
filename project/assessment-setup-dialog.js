/* Shared assessment setup dialog for entry screens and the item builder. */
(() => {
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const make=h=>{const w=document.createElement('div');w.innerHTML=h;return w.firstElementChild};
 const college='College and career readiness';
 const libraryPath='Ready-to-use classroom assessments';
 const statePath='Alabama state standards';
 const itemPage=({subject,grade})=>subject==='English'?'CAP-T05-Reading.dc.html':grade==='8'?'CAP-T05-Algebra.dc.html':'CAP-T05-Questions.dc.html';
 const signature=({title,grade,subject,standard,pathway})=>JSON.stringify({title,grade,subject,standard:standard||'',pathway:pathway||college});
 function create({host, initial, onSubmit, onClose}) {
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
  const closeButton=()=>`<button class="btn btn-ghost btn-icon dialog-close" type="button" data-close-setup aria-label="Close setup"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>`;
  const modal=make(`<dialog class="dialog cap-setup-modal" aria-labelledby="cap-setup-title">
   <section class="cap-setup-view" data-setup-view="form">
    <div class="cap-setup-heading dialog-header">
     <h2 class="dialog-title" id="cap-setup-title" tabindex="-1" autofocus>Set up your assessment</h2>
     ${closeButton()}
    </div>
    <form class="cap-setup-fields" id="uc-assessment-details" aria-label="Assessment details" novalidate>
     <div class="field">
      <label class="label" for="uc-title">Assessment title</label>
      <input class="input" id="uc-title" maxlength="90" required aria-describedby="cap-title-error">
      <p class="field-error" id="cap-title-error" hidden>Enter an assessment title.</p>
     </div>
     <div class="cap-setup-columns">
      <div class="field"><label class="label" for="uc-subject">Subject</label><span class="select-wrap"><select class="select" id="uc-subject" required></select></span></div>
      <div class="field"><label class="label" for="uc-grade">Grade level</label><span class="select-wrap"><select class="select" id="uc-grade" required>${grades.map(g=>`<option value="${esc(g)}">Grade ${esc(g)}</option>`).join('')}</select></span></div>
     </div>
     <div class="cap-setup-columns">
      <div class="field">
       <label class="label" for="uc-pathway">Assessment pathway</label>
       <span class="select-wrap"><select class="select" id="uc-pathway"><option>${college}</option><option>${libraryPath}</option><option>${statePath}</option></select></span>
      </div>
      <div class="field">
       <div class="cap-setup-label-row"><label class="label" for="cap-standard-select">Standard</label><button class="cap-setup-link" type="button" data-about-standard hidden>About this standard</button></div>
       <span class="select-wrap"><select class="select" id="cap-standard-select"></select></span>
      </div>
     </div>
     <label class="check text-body-small font-semibold cap-setup-optional"><input class="checkbox" type="checkbox" id="cap-optional-toggle" aria-controls="cap-optional-fields" aria-expanded="false"> Optional settings</label>
     <div class="cap-setup-optional-fields" id="cap-optional-fields" hidden>
      <div class="field cap-setup-duration">
       <label class="label" for="cap-duration">Duration (minutes)</label>
       <div class="cap-setup-stepper">
        <button class="btn btn-ghost btn-icon btn-sm" type="button" data-step="-1" aria-label="Decrease duration">${icon('<path d="M5 12h14"/>')}</button>
        <input class="input" id="cap-duration" type="number" min="0" step="1" inputmode="numeric" aria-describedby="cap-duration-error">
        <button class="btn btn-ghost btn-icon btn-sm" type="button" data-step="1" aria-label="Increase duration">${icon('<path d="M5 12h14"/><path d="M12 5v14"/>')}</button>
       </div>
       <p class="field-error" id="cap-duration-error" hidden>Enter a whole number.</p>
      </div>
      <div class="field"><label class="label" for="cap-description">Description</label><textarea class="textarea" id="cap-description" rows="3" placeholder="Type here"></textarea></div>
     </div>
    </form>
    <div class="cap-setup-buttons dialog-footer">
     <button class="btn btn-ghost btn-lg" type="button" data-close-setup>Cancel</button>
     <button class="btn btn-lg" type="submit" form="uc-assessment-details" data-submit-setup>Continue</button>
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
  const duration=find('#cap-duration'), description=find('#cap-description');
  const optional=find('#cap-optional-toggle'), optionalFields=find('#cap-optional-fields');
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
  function setOptional(on){
   optional.checked=on;optionalFields.hidden=!on;optional.setAttribute('aria-expanded',String(on));
  }
  function showView(name){
   formView.hidden=name!=='form';standardView.hidden=name!=='standard';
   modal.setAttribute('aria-labelledby',name==='form'?'cap-setup-title':'cap-standard-title');
   (name==='form'?aboutStandard:standardTitle).focus();
  }
  const scope=()=>({title:title.value.trim(),grade:grade.value,subject:subject.value,standard,pathway:pathway.value});
  function open(settings){
   title.value=settings.title;grade.value=settings.grade;updateSubjects(settings.subject);
   alabamaContract=settings.alabamaContract??true;
   pathway.options[2].disabled=!alabamaContract;
   pathway.value=settings.pathway||college;if(!pathway.value||pathway.selectedOptions[0]?.disabled)pathway.value=college;
   duration.value=settings.duration||0;description.value=settings.description??'';
   setOptional(Boolean(Number(settings.duration)||settings.description));
   standard=settings.standard||'';renderStandards();renderPreview();
   for(const [input,error] of [[title,'#cap-title-error'],[duration,'#cap-duration-error']]){
    input.removeAttribute('aria-invalid');find(error).hidden=true;
   }
   formView.hidden=false;standardView.hidden=true;modal.setAttribute('aria-labelledby','cap-setup-title');
   if(!modal.open)modal.showModal();
  }
  modal.querySelectorAll('[data-close-setup]').forEach(button=>button.onclick=()=>modal.close());
  modal.querySelectorAll('[data-back-setup]').forEach(button=>button.onclick=()=>showView('form'));
  aboutStandard.onclick=()=>showView('standard');
  optional.onchange=()=>setOptional(optional.checked);
  modal.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>{
   duration.value=Math.max(0,(parseInt(duration.value,10)||0)+Number(button.dataset.step));
  });
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
   const useOptional=optional.checked;
   let invalid;
   for(const [input,error,valid] of [[title,'#cap-title-error',Boolean(next.title)],[duration,'#cap-duration-error',!useOptional||duration.validity.valid]]){
    input.setAttribute('aria-invalid',String(!valid));find(error).hidden=valid;
    if(!valid&&!invalid)invalid=input;
   }
   if(invalid){invalid.focus();return}
   onSubmit({...next,duration:useOptional&&Number(duration.value)>0?duration.value:'',description:useOptional?description.value.trim():'',alabamaContract});
   modal.close();
  };
  return {open, remove:()=>modal.remove()};

 }
 window.capAssessmentSetup={create,itemPage,libraryPath,signature};
})();
