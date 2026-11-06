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
  const modal=make(`<dialog class="dialog cap-setup-modal" aria-labelledby="cap-setup-title" aria-describedby="cap-setup-description">
   <div class="cap-setup-heading"><div class="cap-setup-title-row">
    <div class="dialog-header">
     <h2 class="dialog-title" id="cap-setup-title" tabindex="-1" autofocus>Set up your assessment</h2>
     <p class="dialog-description" id="cap-setup-description">Add the basics and choose what you want to assess.</p>
    </div>
   </div><span class="tooltip-wrap"><button class="btn btn-ghost btn-icon" type="button" data-close-setup aria-label="Close setup" aria-describedby="cap-close-setup-tip">${artwork('X')}</button><span class="tooltip" id="cap-close-setup-tip" role="tooltip">Close setup</span></span></div>
   <form class="cap-setup-fields" id="uc-assessment-details" aria-label="Assessment details" novalidate>
    <div class="field">
     <label class="label" for="uc-title">Assessment title *</label>
     <input class="input" id="uc-title" maxlength="90" required aria-describedby="cap-title-error">
     <p class="field-error" id="cap-title-error" hidden>Enter an assessment title.</p>
    </div>
    <div class="cap-setup-columns">
     <div class="field"><label class="label" for="uc-subject">Subject *</label><span class="select-wrap"><select class="select" id="uc-subject" required></select></span></div>
     <div class="field"><label class="label" for="uc-grade">Grade level *</label><span class="select-wrap"><select class="select" id="uc-grade" required>${grades.map(g=>`<option value="${esc(g)}">Grade ${esc(g)}</option>`).join('')}</select></span></div>
    </div>
    <div class="cap-setup-columns"><div class="field">
     <label class="label" for="uc-pathway">Assessment pathway</label>
     <span class="select-wrap"><select class="select" id="uc-pathway" aria-describedby="cap-contract-demo"><option>${college}</option><option>${libraryPath}</option><option>${statePath}</option></select></span>
    </div>
    <div class="field">
     <label class="label" for="cap-standard-select">Standard</label>
     <span class="select-wrap"><select class="select" id="cap-standard-select"></select></span>
    </div></div>
    <div class="cap-setup-disclosures">
    <details class="accordion-item cap-standard-details" hidden>
     <summary class="accordion-trigger card-themed"></summary>
     <div class="accordion-content"><div class="card card-themed"><div class="card-content cap-standard-preview"></div></div></div>
    </details>
    <details class="accordion-item">
     <summary class="accordion-trigger">Optional settings</summary>
     <div class="accordion-content cap-setup-fields">
     <div class="cap-setup-columns">
      <div class="field"><label class="label" for="cap-duration">Duration (minutes)</label><input class="input" id="cap-duration" type="number" min="1" step="1" aria-describedby="cap-duration-error"><p class="field-error" id="cap-duration-error" hidden>Enter a whole number greater than zero.</p></div>
      <div class="field"><label class="label" for="cap-description">Description</label><textarea class="textarea" id="cap-description" rows="2"></textarea></div>
     </div>
     <label class="check text-body-small" id="cap-contract-demo"><input class="checkbox" type="checkbox" id="cap-state-contract"> Prototype demo: this district has the Alabama standards contract</label>
    </div>
    </details>
    </div>
   </form>
   <div class="separator"></div>
   <div class="cap-setup-actions">
    <div class="cap-setup-buttons">
     <button class="btn btn-outline btn-lg" type="button" data-close-setup>Cancel</button>
     <button class="btn btn-lg" type="submit" form="uc-assessment-details" data-submit-setup>Continue</button>
    </div>
   </div>
  </dialog>`);
  host.append(modal);
  const find=(selector)=>modal.querySelector(selector);
  const panel=find('form'), title=find('#uc-title'), subject=find('#uc-subject'), grade=find('#uc-grade'), pathway=find('#uc-pathway');
  const duration=find('#cap-duration'), description=find('#cap-description'), contract=find('#cap-state-contract');
  const standardSelect=find('#cap-standard-select'), standardDetails=find('.cap-standard-details');
  const preview=find('.cap-standard-preview');
  let standard='';
  function updateSubjects(preferred){
   const subjects=[...new Set(standards.filter(s=>s.grade===grade.value).map(s=>s.subject))];
   if(!subjects.length)subjects.push(preferred||'Mathematics');
   subject.replaceChildren(...subjects.map(name=>new Option(name)));
   if(subjects.includes(preferred))subject.value=preferred;
  }
  function renderPreview(){
   const selected=standards.find(s=>s.code===standard&&s.subject===subject.value);
   standardDetails.hidden=!selected;
   if(!selected){standardDetails.open=false;return}
   standardDetails.querySelector('summary').textContent=selected.code+' · '+selected.title;
   const fraction=selected.code==='5.NF.A.2';
   preview.innerHTML=`<div class="cap-standard-heading">
    <div><p class="text-body-small">Grade ${esc(selected.grade)} · ${esc(selected.code)}</p>
    <h3 class="text-body-base font-semibold">${esc(selected.title)}</h3></div>
    ${fraction&&contract.checked?'<span class="badge badge-secondary">Alabama AL.5.11</span>':''}</div>
    ${fraction?`
    <p class="text-body-small">Solve word problems involving addition and subtraction of fractions referring to the same whole, including unlike denominators. Use benchmark fractions to estimate and check reasonableness.</p>
    <div class="cap-setup-columns text-body-small">
     <div><h4 class="text-body-small font-semibold">Learning components</h4>
      <ul><li>Represent a word problem with an equation</li><li>Solve fraction word problems with unlike denominators</li><li>Use benchmark fractions to check reasonableness</li></ul></div>
     <div><h4 class="text-body-small font-semibold">Progression</h4>
      <p><strong>Builds on</strong> 4.NF.B.3 and 5.NF.A.1</p><p><strong>Leads to</strong> 5.NF.B.6 · Fraction multiplication word problems</p></div>
    </div>
    `:''}`;
  }
  function renderStandards(){
   const available=standards.filter(s=>s.subject===subject.value&&s.grade===grade.value);
   standardSelect.replaceChildren(new Option('Select a standard',''),...available.map(s=>new Option(s.code+' · '+s.title,s.code)));
   standardSelect.value=standard;
  }
  const scope=()=>({title:title.value.trim(),grade:grade.value,subject:subject.value,standard,pathway:pathway.value});
  function updateContract(){
   pathway.options[2].disabled=!contract.checked;
   if(!contract.checked&&pathway.value===statePath)pathway.value=college;
   renderPreview();
  }
  function open(settings){
   title.value=settings.title;grade.value=settings.grade;updateSubjects(settings.subject);
   pathway.value=settings.pathway||college;if(!pathway.value)pathway.value=college;
   duration.value=settings.duration??'';description.value=settings.description??'';
   contract.checked=settings.alabamaContract??true;
   standard=settings.standard||'';updateContract();renderStandards();
   for(const [input,error] of [[title,'#cap-title-error'],[duration,'#cap-duration-error']]){
    input.removeAttribute('aria-invalid');find(error).hidden=true;
   }
   panel.querySelectorAll('details').forEach(details=>{details.open=false});
   if(!modal.open)modal.showModal();
  }
  modal.querySelectorAll('[data-close-setup]').forEach(button=>button.onclick=()=>modal.close());
  modal.onclose=()=>onClose?.();
  standardSelect.onchange=()=>{standard=standardSelect.value;standardDetails.open=false;renderPreview()};
  contract.onchange=updateContract;
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
   for(const [input,error,valid] of [[title,'#cap-title-error',Boolean(next.title)],[duration,'#cap-duration-error',duration.validity.valid]]){
    input.setAttribute('aria-invalid',String(!valid));find(error).hidden=valid;
    if(!valid&&!invalid)invalid=input;
   }
   if(invalid){const disclosure=invalid.closest('details');if(disclosure)disclosure.open=true;invalid.focus();return}
   onSubmit({...next,duration:duration.value,description:description.value.trim(),alabamaContract:contract.checked});
   modal.close();
  };
  return {open, remove:()=>modal.remove()};

 }
 window.capAssessmentSetup={create,itemPage,libraryPath,signature};
})();
