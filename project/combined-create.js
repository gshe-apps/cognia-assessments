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
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{const q=bank.find(q=>q.stem===row.querySelector('h4')?.textContent.trim());if(!q)return;if(!row.querySelector('.bank-row-standard')&&currentTest?.standard){const badge=document.createElement('span');badge.className='bank-row-standard';badge.textContent=q.standard||currentTest.standard;row.append(badge)}if(!row.querySelector('.bank-row-difficulty')&&q.difficulty){const badge=document.createElement('span');badge.className='bank-row-difficulty';badge.textContent=q.difficulty;row.append(badge)}});
  document.querySelectorAll('.uc-page .bank-row-difficulty').forEach(el=>{el.dataset.level=el.textContent.trim().toLowerCase()});
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{if(!row.querySelector('.bank-row-difficulty')){const badge=document.createElement('span');badge.className='bank-row-difficulty';badge.dataset.level='unspecified';badge.textContent='—';badge.setAttribute('aria-label','Difficulty not specified');row.append(badge)}});
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{let tags=row.querySelector('.uc-bank-tags');if(!tags){tags=document.createElement('div');tags.className='uc-bank-tags';row.append(tags)}const type=row.querySelector('.row > .tiny');if(type){type.textContent=({'Choice':'Multiple choice','Text entry':'Short answer','Extended text':'Extended response'}[type.textContent.trim()]||type.textContent.trim());tags.append(type)}row.querySelectorAll(':scope > .bank-row-difficulty,:scope > .bank-row-standard').forEach(b=>tags.append(b));});
  const page=document.querySelector('main>.page'),methods=page?.querySelector('.qc-methods');if(!methods||page.querySelector('.uc-details'))return;
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
  const progress=hero.querySelector('.tf-steps');progress.innerHTML='<a href="#uc-assessment-details" data-uc-details><span>1</span>Details</a><i aria-hidden="true"></i><a href="#uc-question-methods"><span>2</span>Items</a><i aria-hidden="true"></i><a href="CAP-T06-Review.dc.html?stage=details"><span>3</span>Check</a>';methods.id='uc-question-methods';
  const forms=window.cogniaAssessmentForms||[],scopes=forms.filter(f=>['5','6','8'].includes(f.grade));
  const panel=make('<form class="uc-details" aria-label="Assessment details"><label>Assessment title *<input id="uc-title" value="'+esc(t.title)+'" maxlength="90" required></label><label>Subject *<select id="uc-subject">'+[...new Set(scopes.map(f=>f.subject))].map(v=>'<option '+(v===t.subject?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label><label>Grade level *<select id="uc-grade">'+['5','6','8'].map(g=>'<option value="'+g+'" '+(g===t.grade?'selected':'')+'>Grade '+g+'</option>').join('')+'</select></label><label>Assessment pathway<select id="uc-pathway"><option>College and career readiness</option><option>Ready-to-use classroom assessments</option><option disabled>State standards — custom contract</option></select></label><label class="uc-standards">Standards / curriculum (optional)<input type="search" id="uc-standard" list="uc-standard-options" value="'+esc(t.standard||'')+'" placeholder="Search for standards..."><datalist id="uc-standard-options"></datalist></label><button class="btn solid uc-continue btn-lg" type="submit">Continue</button><p class="uc-error" role="alert"></p></form>');
  panel.querySelectorAll('select').forEach(select=>select.insertAdjacentHTML('afterend','<svg class="uc-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'));
  const collapseKey='capCreateCollapsed:'+t.id,readyKey='capCreateConfirmed:'+t.id;
  const frame=make('<details class="uc-details-frame"><summary>Assessment details<span class="uc-details-summary"></span><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></summary></details>');frame.open=sessionStorage.getItem(collapseKey)!=='true';hero.after(frame);frame.append(panel);
  const layout=make('<div class="uc-setup-layout"></div>');frame.before(layout);layout.append(frame);
  const optional=make('<details class="uc-optional"><summary><svg class="uc-settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="m9 3-.6 2.2-2 .9-2-.6-2 3.5L4 10.6v2.8l-1.6 1.6 2 3.5 2-.6 2 .9L9 21h4l.6-2.2 2-.9 2 .6 2-3.5-1.6-1.6v-2.8L19.6 9l-2-3.5-2 .6-2-.9L13 3Z"/></svg><span>Optional settings</span><span class="uc-optional-toggle" aria-hidden="true"></span></summary></details>');panel.querySelector('.uc-standards').before(optional);optional.append(panel.querySelector('.uc-standards'));
  const guideIcon=(name)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+({file:'<path d="M14 3H5v18h14V8zM14 3v5h5M8 12h3M8 16h3"/><circle cx="17" cy="17" r="4"/><path d="m15 17 1.5 1.5L19 16"/>',pencil:'<path d="m16 3 5 5L7 22H2v-5zM13 6l5 5"/>',layers:'<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',timer:'<circle cx="12" cy="14" r="8"/><path d="M12 10v5l3-2M9 2h6M12 2v4M18 6l2-2"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 8-8M16 4h4v4"/>'}[name]||'')+'</svg>';
  const help=make(`<aside class="uc-setup-guide" aria-labelledby="uc-guide-title"><span class="uc-guide-emblem">${guideIcon('file')}</span><h2 id="uc-guide-title">Get it right, faster</h2><p>A simple, three-step flow to go from setup to assigned assessment.</p><ol class="uc-guide-journey" aria-label="Assessment creation journey"><li><span>${guideIcon('pencil')}</span><strong>Set up</strong><small>Add key details</small></li><li><span>${guideIcon('layers')}</span><strong>Add items</strong><small>Build or select</small></li><li><span>${guideIcon('check')}</span><strong>Check &amp; assign</strong><small>Review and send</small></li></ol><div class="uc-guide-summary"><div>${guideIcon('timer')}<span>Typical setup time<strong>Under 2 minutes</strong></span></div><div>${guideIcon('target')}<span>Built for<br>teachers</span></div></div><ul class="uc-guide-benefits"><li>${guideIcon('check')}<span>Stay in flow — add items right after setup</span></li><li>${guideIcon('check')}<span>Reuse content from your assessment library</span></li><li>${guideIcon('check')}<span>Save as a draft and continue anytime</span></li></ul></aside>`);layout.append(help);
  const actions=make('<div class="uc-setup-actions"><a class="btn btn-ghost btn-lg" href="CAP-T03-Assessments.dc.html">Cancel</a></div>');panel.id='uc-assessment-details';const continueButton=panel.querySelector('.uc-continue');continueButton.setAttribute('form',panel.id);continueButton.innerHTML='Continue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';actions.append(continueButton);layout.after(actions);
  hero.querySelector('[data-uc-details]').onclick=e=>{e.preventDefault();frame.open=true;frame.querySelector('summary').focus();};
  frame.ontoggle=()=>sessionStorage.setItem(collapseKey,String(!frame.open));
  const updateSummary=()=>{const values=scope();frame.querySelector('.uc-details-summary').textContent=values.title+' · Grade '+values.grade+' · '+values.subject;};
  function options(){const g=panel.querySelector('#uc-grade').value,subject=panel.querySelector('#uc-subject');const available=scopes.filter(f=>f.grade===g);subject.innerHTML=[...new Set(available.map(f=>f.subject))].map(v=>'<option>'+esc(v)+'</option>').join('');const list=panel.querySelector('datalist');list.innerHTML=[...new Set(available.map(f=>f.standard))].map(v=>'<option value="'+esc(v)+'"></option>').join('');}
  options();panel.querySelector('#uc-subject').value=t.subject;
  const scope=()=>({title:panel.querySelector('#uc-title').value.trim(),grade:panel.querySelector('#uc-grade').value,subject:panel.querySelector('#uc-subject').value,standard:panel.querySelector('#uc-standard').value.trim(),pathway:panel.querySelector('#uc-pathway').value});
  const signature=()=>JSON.stringify(scope());
  const notice=make('<p class="uc-gate-notice" role="status">Complete assessment details and select Continue to add items.</p>');methods.before(notice);
  function syncGate(){const ready=sessionStorage.getItem(readyKey)===signature();methods.inert=!ready;page.querySelector('.buildergrid').inert=!ready;methods.setAttribute('aria-disabled',String(!ready));page.querySelector('.buildergrid').setAttribute('aria-disabled',String(!ready));methods.querySelectorAll('button').forEach(b=>b.disabled=!ready);notice.hidden=ready;page.classList.toggle('uc-locked',!ready);help.hidden=ready;actions.hidden=ready;const setCopy=(selector,text)=>{const el=hero.querySelector(selector);if(el.textContent!==text)el.textContent=text;};setCopy('h1',ready?'Add your items':'Set up your assessment');setCopy('.uc-setup-intro p',ready?'Choose the fastest way to build this assessment.':'Start with the essentials. You can add more later.');setCopy('.uc-eyebrow',ready?'Create':'Create assessment');hero.querySelectorAll('.tf-steps a').forEach((a,i)=>{a.classList.toggle('active',i===(ready?1:0));a.classList.toggle('uc-step-complete',ready&&i===0);if(i===0&&(ready?!a.querySelector('span svg'):a.querySelector('span').textContent!=='1'))a.querySelector('span').innerHTML=ready?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>':'1';a.setAttribute('aria-current',i===(ready?1:0)?'step':'false')});return ready;}
  window.capSyncCreationGate=syncGate;
  if(!syncGate())frame.open=true;
  panel.addEventListener('input',()=>{sessionStorage.removeItem(readyKey);syncGate()});
  panel.addEventListener('change',()=>{sessionStorage.removeItem(readyKey);syncGate()});
  function save(){const next=scope();if(!next.title)return false;const known=[...panel.querySelector('datalist').options].map(o=>o.value);if(next.standard&&!known.includes(next.standard)){panel.querySelector('.uc-error').textContent='Choose an available standard from the list, or leave it blank.';return false}panel.querySelector('.uc-error').textContent='';window.capUpdateAssessmentScope(next);updateSummary();page.querySelector('[data-tf-summary-title]')?.replaceChildren(document.createTextNode(next.title));return true;}
  panel.querySelector('#uc-title').oninput=save;
  panel.querySelector('#uc-grade').onchange=()=>{options();panel.querySelector('#uc-standard').value=scopes.find(f=>f.grade===panel.querySelector('#uc-grade').value)?.standard||'';save()};
  panel.querySelector('#uc-standard').onchange=save;panel.querySelector('#uc-pathway').onchange=save;
  updateSummary();
  panel.onsubmit=e=>{e.preventDefault();if(!panel.reportValidity()||!save())return;if(e.submitter===continueButton){sessionStorage.setItem(readyKey,signature());syncGate();frame.open=false;sessionStorage.setItem(collapseKey,'true');frame.querySelector('summary').focus()}const s=scope();if(s.pathway==='Ready-to-use classroom assessments'){location.href='CAP-T21-AssessmentLibrary.dc.html';return}const next=s.subject==='English'?'CAP-T05-Reading.dc.html':s.grade==='8'?'CAP-T05-Algebra.dc.html':'CAP-T05-Questions.dc.html';if(next!==location.pathname.split('/').pop()){
   const data=read(),active=data.tests.find(x=>x.id===data.active);active.state||={chosen:[],written:{},edits:{}};active.state.written={...active.state.written,...Object.fromEntries((active.questions||[]).map(q=>[q.id,q]))};active.page=next;localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(data));location.href=next;
  }else methods.querySelector('[aria-pressed="true"]')?.focus();};
  methods.querySelectorAll('.tf-method').forEach(button=>{
   const manual=button.dataset.qcMethod==='manual';
   button.querySelector('b').textContent=manual?'Create manually':'Use item bank';
   button.querySelector('small').remove();
   button.querySelector('.item-method-icon').innerHTML=guideIcon(manual?'pencil':'layers');
   button.querySelector('.approved-selection')?.remove();
   button.querySelector('.item-method-selection')?.remove();
  });
  /* Reuse the runtime's existing multiple-choice form and validation. The old
     conditional drawer is detached by the legacy page composition. */
  const inst=window.cogniaPreview;
  page.addEventListener('click',event=>{if(!event.target.closest('[data-qc-write]'))return;event.preventDefault();event.stopImmediatePropagation();
   inst.renderVals().openWrite();

   const d=make('<dialog class="uc-native-editor" aria-labelledby="uc-editor-title"><form><h2 id="uc-editor-title">Write an item</h2><p>Add at least two answer options and select the correct answer.</p><label>Item<textarea class="textarea" name="stem" rows="3"></textarea></label><fieldset><legend>Answer options</legend>'+['A','B','C','D'].map((l,i)=>'<label class="uc-editor-option"><input type="radio" name="correct" value="'+i+'" aria-label="Option '+l+' is correct"><span>'+l+'</span><input name="option'+i+'" aria-label="Option '+l+'"></label>').join('')+'</fieldset><label>Difficulty *<select name="difficulty" required><option value="">Select difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label><label>Points<select name="marks"><option value="1">1 point</option><option value="2">2 points</option></select></label><p role="alert"></p><div class="uc-editor-actions"><button type="button" class="btn btn-ghost btn-lg" data-cancel>Cancel</button><button type="submit" class="btn solid btn-lg">Add to assessment</button></div></form></dialog>');
   document.body.append(d);const form=d.querySelector('form');
   const close=()=>{inst.renderVals().closeWrite();d.close();d.remove();page.querySelector('[data-qc-write]').focus()};
   d.querySelector('[data-cancel]').onclick=close;d.oncancel=e=>{e.preventDefault();close()};
   form.onsubmit=e=>{e.preventDefault();inst.setState({form:{stem:form.elements.stem.value,opts:[0,1,2,3].map(i=>form.elements['option'+i].value),correct:form.elements.correct.value===''?null:Number(form.elements.correct.value),marks:form.elements.marks.value},fError:''});inst.renderVals().saveWrite();if(!inst.state.writeOpen){const id=inst.state.chosen.at(-1),item=inst.state.written[id];if(item)inst.setState({written:{...inst.state.written,[id]:{...item,difficulty:form.elements.difficulty.value,standard:scope().standard}}});d.close();d.remove();page.querySelector('[data-qc-write]').focus()}else d.querySelector('[role=alert]').textContent=inst.state.fError;};
   d.showModal();form.elements.stem.focus();
  },true);
  page.querySelector('.ef-decision-note')?.remove();
  const library=page.querySelector('.library');
  const toolbar=make('<div class="uc-bank-toolbar"></div>'),search=library.querySelector('#search'),type=library.querySelector('#typeFilter');
  const searchBox=make('<label class="uc-search-control"><span class="uc-visually-hidden">Search items</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg></label>');const oldSearch=search.closest('.field');search.placeholder='Search items…';search.setAttribute('aria-label','Search items');searchBox.append(search);toolbar.append(searchBox);oldSearch?.remove();library.querySelectorAll('.search').forEach(el=>{if(!el.querySelector('input'))el.remove()});
  let difficulty=library.querySelector('#bankDifficulty');if(!difficulty){difficulty=make('<select id="bankDifficulty" aria-label="Difficulty"><option value="">Difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></select>')}
  difficulty.setAttribute('aria-label','Difficulty');toolbar.append(difficulty);type.setAttribute('aria-label','All types');toolbar.append(type);
  toolbar.querySelectorAll('select').forEach(select=>{const control=make('<div class="uc-bank-select-control"></div>');select.before(control);control.append(select);control.insertAdjacentHTML('beforeend','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>')});
  library.querySelector('.approved-bank-heading')?.after(toolbar);if(!toolbar.isConnected)library.prepend(toolbar);
  library.querySelectorAll('.filters').forEach(filters=>{const extra=make('<details class="uc-extra-filters"><summary>More filters</summary></details>');filters.before(extra);extra.append(filters);if(!filters.querySelector('select'))extra.remove()});
  library.querySelector('#typeFilter')?.querySelectorAll('option').forEach(o=>{if(o.textContent==='Choice')o.textContent='Multiple choice';if(o.textContent==='Text entry')o.textContent='Short answer';if(o.textContent==='Extended text')o.textContent='Extended response'});
  const bankHeading=library.querySelector('.approved-bank-heading')||make('<div class="approved-bank-heading"><h2></h2></div>');
  bankHeading.querySelector('h2').textContent='Find and add items';
  library.before(bankHeading);
  bankHeading.append(methods);
  methods.setAttribute('aria-label','Choose how to add items');
  methods.setAttribute('role','group');
  const extraFilters=library.querySelector('.uc-extra-filters');
  if(extraFilters){
   extraFilters.querySelector('summary').insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h6m4 0h8M3 17h10m4 0h4"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg>');
   toolbar.append(extraFilters);
  }
  const back=make('<button class="btn uc-items-back btn-ghost btn-lg" type="button" aria-label="Back to assessment details" title="Back to assessment details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7"/></svg></button>');
  intro.prepend(back);
  back.onclick=()=>hero.querySelector('[data-uc-details]').click();
  page.querySelectorAll('.tf-bottom a').forEach(a=>{if(a.getAttribute('href')==='CAP-T04-Setup.dc.html'){a.href='CAP-T03-Assessments.dc.html';a.textContent='Back to assessments'}});
  page.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&/CAP-T0[67]-/.test(a.getAttribute('href')||'')){if(!syncGate()||!panel.reportValidity()||!save()){frame.open=true;e.preventDefault();e.stopImmediatePropagation();panel.scrollIntoView({block:'center'})}}},true);
  observe();
 }
 const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})});let queued=false;
 function observe(){observer.observe(document.body,{childList:true,subtree:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();observe()});else{mount();observe()}
})();
