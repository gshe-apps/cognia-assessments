/* Reference-led composition of existing setup fields and item composer. */
(() => {
 const read=()=>{try{return JSON.parse(localStorage.getItem('cogniaAssessmentTestsV1'))}catch{return null}};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const make=h=>{const w=document.createElement('div');w.innerHTML=h;return w.firstElementChild};
 function mount(){
  window.capSyncCreationGate?.();
  const host=document.querySelector('main>.page');
  if(host?.classList.contains('uc-page')){
   host.querySelectorAll('.tf-test-disclosure,.extra-test,.assessment-test-list,.uc-help').forEach(el=>{const error=el.querySelector('#test-flow-error');if(error)host.append(error);el.remove()});
  }
  document.querySelectorAll('.uc-page .question-card h4').forEach(title=>{title.title=title.textContent.trim()});
  const currentModel=read(),currentTest=currentModel?.tests?.find(t=>t.id===currentModel.active)||currentModel?.tests?.[0],bank=window.cogniaPreview?.bankItems?.()||[];
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{const q=bank.find(q=>q.stem===row.querySelector('h4')?.textContent.trim());if(!q)return;if(!row.querySelector('.bank-row-standard')&&currentTest?.standard){const badge=document.createElement('span');badge.className='bank-row-standard badge badge-secondary';badge.textContent=q.standard||currentTest.standard;row.append(badge)}if(!row.querySelector('.bank-row-difficulty')&&q.difficulty){const badge=document.createElement('span');badge.className='bank-row-difficulty badge badge-'+({easy:'success',medium:'warning',hard:'destructive'}[String(q.difficulty).toLowerCase()]||'secondary');badge.textContent=q.difficulty;row.append(badge)}});
  document.querySelectorAll('.uc-page .bank-row-difficulty').forEach(el=>{el.dataset.level=el.textContent.trim().toLowerCase()});
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{if(!row.querySelector('.bank-row-difficulty')){const badge=document.createElement('span');badge.className='bank-row-difficulty badge badge-secondary';badge.dataset.level='unspecified';badge.textContent='—';badge.setAttribute('aria-label','Difficulty not specified');row.append(badge)}});
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{let tags=row.querySelector('.uc-bank-tags');if(!tags){tags=document.createElement('div');tags.className='uc-bank-tags';row.append(tags)}const type=row.querySelector('.row > .tiny');if(type){type.textContent=({'Choice':'Multiple choice','Text entry':'Short answer','Extended text':'Extended response'}[type.textContent.trim()]||type.textContent.trim());tags.append(type)}row.querySelectorAll(':scope > .bank-row-difficulty,:scope > .bank-row-standard').forEach(b=>tags.append(b));});
  const page=document.querySelector('main>.page'),methods=page?.querySelector('.qc-methods');if(!methods||page.querySelector('.uc-setup-intro'))return;
  observer.disconnect();page.classList.add('uc-page');document.body.classList.add('unified-create-screen');document.body.classList.remove('cap-monochrome');
  const m=read(),t=m?.tests?.find(t=>t.id===m.active)||m?.tests?.[0];if(!t){observe();return;}
  const scopePage=t.subject==='English'?'CAP-T05-Reading.dc.html':t.grade==='8'?'CAP-T05-Algebra.dc.html':'CAP-T05-Questions.dc.html';
  if(scopePage!==location.pathname.split('/').pop()){
   t.state||={chosen:[],written:{},edits:{}};t.state.written={...t.state.written,...Object.fromEntries((t.questions||[]).map(q=>[q.id,q]))};t.page=scopePage;localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(m));location.replace(scopePage);return;
  }
  const hero=page.querySelector('.tf-hero');hero.querySelector('h1').textContent='Create your assessment';hero.querySelector('p')?.remove();const intro=make('<div class="uc-setup-intro"><span class="uc-eyebrow">Create assessment</span><h1>Set up your assessment</h1><p>Start with the essentials. You can add more later.</p></div>');hero.querySelector('h1').replaceWith(intro);
  page.querySelector('.tf-back')?.remove();
  page.querySelector('.tf-steps a').href=t.page;
  hero.append(page.querySelector('.tf-steps'));page.querySelector('.tf-top')?.remove();
  const progress=hero.querySelector('.tf-steps');progress.innerHTML='<a href="#uc-assessment-details" data-uc-details><span>1</span>Details</a><i aria-hidden="true"></i><a href="#uc-question-methods"><span>2</span>Items</a><i aria-hidden="true"></i><a href="CAP-T06-Review.dc.html?stage=details" data-uc-review><span>3</span>Check</a>';methods.id='uc-question-methods';
  const {create,itemPage,libraryPath,signature}=window.capAssessmentSetup;
  const readyKey='capCreateConfirmed:'+t.id;
  const useClientSample=sessionStorage.getItem('capSetupUseClientSample')==='true';
  sessionStorage.removeItem('capSetupUseClientSample');
  let settings=useClientSample?{...t,title:'New classroom assessment',standard:'5.NF.A.2'}:t;
  let ready=sessionStorage.getItem(readyKey)===signature(settings);
  const setup=create({
   host:page.closest('.theme-assessments'),
   initial:settings,
   onClose:()=>{
    if(!ready){location.href='CAP-T03-Assessments.dc.html';return}
    hero.querySelector('[data-uc-details]').focus();
   },
   onSubmit(next){
   const model=window.capUpdateAssessmentScope(next);
   settings=model.tests.find(test=>test.id===model.active)||model.tests[0];
   sessionStorage.setItem(readyKey,signature(next));
   ready=true;syncGate();
   inst.refreshQuestionBoard?.();
   if(next.pathway===libraryPath){location.href='CAP-T21-AssessmentLibrary.dc.html';return}
   const destination=itemPage(next);
   if(destination!==location.pathname.split('/').pop()){
    settings.state||={chosen:[],written:{},edits:{}};
    settings.state.written={...settings.state.written,...Object.fromEntries((settings.questions||[]).map(q=>[q.id,q]))};
    settings.page=destination;localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(model));location.href=destination;
   }
   }
  });
  const openSetup=()=>setup.open(settings);
  const icon=(path)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  hero.querySelector('[data-uc-details]').onclick=e=>{e.preventDefault();openSetup()};
  const notice=make('<p class="uc-gate-notice" role="status">Complete assessment details to add items.</p>');methods.before(notice);
  function syncGate(){
   methods.inert=!ready;page.querySelector('.buildergrid').inert=!ready;
   methods.setAttribute('aria-disabled',String(!ready));page.querySelector('.buildergrid').setAttribute('aria-disabled',String(!ready));
   methods.querySelectorAll('button').forEach(button=>button.disabled=!ready);
   notice.hidden=ready;page.classList.toggle('uc-locked',!ready);
   hero.querySelector('h1').textContent=ready?'Add your items':'Create your assessment';
   hero.querySelector('.uc-setup-intro p').textContent=ready?'Choose how you’d like to build this assessment.':'';
   hero.querySelectorAll('.tf-steps a').forEach((link,i)=>{
    link.classList.toggle('active',i===(ready?1:0));
    link.setAttribute('aria-current',i===(ready?1:0)?'step':'false');
   });
   return ready;
  }
  window.capSyncCreationGate=syncGate;
  syncGate();
  if(!ready)openSetup();
  const layers=icon('<path d="m12 3 10 5-10 5L2 8Zm-10 10 10 5 10-5M2 18l10 5 10-5"/>');
  methods.className='qc-methods tabs-list';
  methods.querySelectorAll('[data-qc-method]').forEach(button=>{
   button.className='tab';
   const manual=button.dataset.qcMethod==='manual';
   const graphic=manual?icon('<path d="m16 3 5 5L7 22H2v-5zM13 6l5 5"/>'):layers;
   button.replaceChildren(make(graphic),document.createTextNode(manual?'Create manually':'Use item bank'));
  });
  /* Reuse the runtime's existing multiple-choice form and validation. The old
     conditional drawer is detached by the legacy page composition. */
  const inst=window.cogniaPreview;
  page.addEventListener('click',event=>{if(!event.target.closest('[data-qc-write]'))return;event.preventDefault();event.stopImmediatePropagation();
   inst.renderVals().openWrite();

   const d=make('<dialog class="uc-native-editor" aria-labelledby="uc-editor-title"><form><h2 id="uc-editor-title">Write an item</h2><p>Add at least two answer options and select the correct answer.</p><label>Item<textarea class="textarea" name="stem" rows="3"></textarea></label><fieldset><legend>Answer options</legend>'+['A','B','C','D'].map((l,i)=>'<label class="uc-editor-option"><input class="radio" type="radio" name="correct" value="'+i+'" aria-label="Option '+l+' is correct"><span>'+l+'</span><input class="input" name="option'+i+'" aria-label="Option '+l+'"></label>').join('')+'</fieldset><label>Difficulty *<span class="select-wrap"><select class="select" name="difficulty" required><option value="">Select difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></select></span></label><label>Points<span class="select-wrap"><select class="select" name="marks"><option value="1">1 point</option><option value="2">2 points</option></select></span></label><p role="alert"></p><div class="uc-editor-actions"><button type="button" class="btn btn-ghost btn-lg" data-cancel>Cancel</button><button type="submit" class="btn solid btn-lg">Add to assessment</button></div></form></dialog>');
   document.body.append(d);const form=d.querySelector('form');
   const close=()=>{inst.renderVals().closeWrite();d.close();d.remove();page.querySelector('[data-qc-write]').focus()};
   d.querySelector('[data-cancel]').onclick=close;d.oncancel=e=>{e.preventDefault();close()};
   form.onsubmit=e=>{e.preventDefault();inst.setState({form:{stem:form.elements.stem.value,opts:[0,1,2,3].map(i=>form.elements['option'+i].value),correct:form.elements.correct.value===''?null:Number(form.elements.correct.value),marks:form.elements.marks.value},fError:''});inst.renderVals().saveWrite();if(!inst.state.writeOpen){const id=inst.state.chosen.at(-1),item=inst.state.written[id];if(item)inst.setState({written:{...inst.state.written,[id]:{...item,difficulty:form.elements.difficulty.value,standard:settings.standard}}});d.close();d.remove();page.querySelector('[data-qc-write]').focus()}else d.querySelector('[role=alert]').textContent=inst.state.fError;};
   d.showModal();form.elements.stem.focus();
  },true);
  page.querySelector('.ef-decision-note')?.remove();
  const library=page.querySelector('.library');
  const toolbar=make('<div class="uc-bank-toolbar"></div>'),search=library.querySelector('#search'),type=library.querySelector('#typeFilter');
  const searchBox=make('<label class="uc-search-control"><span class="uc-visually-hidden">Search items</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg></label>');const oldSearch=search.closest('.field');search.placeholder='Search items…';search.setAttribute('aria-label','Search items');searchBox.append(search);toolbar.append(searchBox);oldSearch?.remove();library.querySelectorAll('.search').forEach(el=>{if(!el.querySelector('input'))el.remove()});
  let difficulty=library.querySelector('#bankDifficulty');if(!difficulty){difficulty=make('<select id="bankDifficulty" aria-label="Difficulty"><option value="">Difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></select>')}
  difficulty.setAttribute('aria-label','Difficulty');toolbar.append(difficulty);type.setAttribute('aria-label','All types');toolbar.append(type);
  toolbar.querySelectorAll('select').forEach(select=>{
   const control=make('<div class="uc-bank-select-control select-wrap"></div>');
   select.classList.add('select');
   select.before(control);
   control.append(select);
  });
  library.querySelector('.approved-bank-heading')?.after(toolbar);if(!toolbar.isConnected)library.prepend(toolbar);
  library.querySelector('#typeFilter')?.querySelectorAll('option').forEach(o=>{if(o.textContent==='Choice')o.textContent='Multiple choice';if(o.textContent==='Text entry')o.textContent='Short answer';if(o.textContent==='Extended text')o.textContent='Extended response'});
  const bankHeading=library.querySelector('.approved-bank-heading')||make('<div class="approved-bank-heading"><h2></h2></div>');
  bankHeading.querySelector('h2').replaceChildren(make('<span class="uc-board-icon" aria-hidden="true">'+layers+'</span>'),document.createTextNode('Find and add items'));
  library.before(bankHeading);
  bankHeading.append(methods);
  methods.setAttribute('aria-label','Choose how to add items');
  methods.setAttribute('role','group');
  const extraFilters=make('<details class="uc-extra-filters"><summary class="btn btn-ghost btn-icon btn-lg" aria-label="Filters" title="Filters">'+icon('<path d="M3 7h6m4 0h8M3 17l10 0m4 0h4"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>')+'</summary><div class="filters uc-filter-fields"></div></details>');
  const filterFields=extraFilters.querySelector('.filters');
  filterFields.append(...toolbar.querySelectorAll('.uc-bank-select-control'));
  library.querySelectorAll('.filters').forEach(filters=>{
   filterFields.append(...filters.children);
   filters.remove();
  });
  toolbar.append(extraFilters);
  const back=make('<button class="btn uc-items-back btn-ghost btn-lg" type="button" aria-label="Back to assessment details" title="Back to assessment details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7"/></svg></button>');
  page.querySelector('.tf-bottom .tf-original-actions')?.before(make('<p class="uc-review-status text-body-small" role="status" hidden></p>'));
  inst.refreshQuestionBoard?.();
  intro.prepend(back);
  back.onclick=()=>hero.querySelector('[data-uc-details]').click();
  page.querySelectorAll('.tf-bottom a').forEach(a=>{if(a.getAttribute('href')==='CAP-T04-Setup.dc.html'){a.href='CAP-T03-Assessments.dc.html';a.textContent='Back to assessments'}});
  page.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&/CAP-T0[67]-/.test(a.getAttribute('href')||'')){if(!syncGate()){e.preventDefault();e.stopImmediatePropagation();openSetup()}}},true);
  observe();
 }
 const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})});let queued=false;
 function observe(){observer.observe(document.body,{childList:true,subtree:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();observe()});else{mount();observe()}
})();
