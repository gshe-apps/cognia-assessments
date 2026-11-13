/* Reference-led teacher journey; keeps the prototype's existing data and validation. */
window.capRenderAssessmentProgress=(progress,current,attributes)=>{
 const steps=[['Setup','check'],['Create','layers'],['Review','search'],['Assign','users'],['Finalize','flag']];
 progress.classList.add('cap-assessment-progress');
 progress.setAttribute('aria-label','Assessment progress');
 progress.innerHTML=steps.map(([label,graphic],index)=>{
  const state=index===current?'class="active" aria-current="step"':index<current?'class="done"':'';
  return `<a ${attributes[index]||''} ${state}><span><img class="uc-step-halo" src="assets/assessment-progress/halo.svg" alt=""><img src="assets/assessment-progress/${index<current?'check':graphic}.svg" alt=""></span>${label}</a>`;
 }).join('<i aria-hidden="true"></i>');
};
document.addEventListener('DOMContentLoaded',()=>{
 const file=location.pathname.split('/').pop(),setup=file==='CAP-T04-Setup.dc.html',questions=/^CAP-T05-/.test(file),review=file==='CAP-T06-Review.dc.html',details=review&&new URLSearchParams(location.search).get('stage')==='details',assign=file==='CAP-T08-AudienceDelivery.dc.html',confirm=file==='CAP-T09-ConfirmAssignment.dc.html';
 if(!setup&&!questions&&!review&&!assign&&!confirm)return;
 const key='cogniaAssessmentTestsV1',esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=(k,f={})=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}},model=()=>read(key,{tests:[]}),active=m=>m.tests.find(t=>t.id===m.active)||m.tests[0],save=m=>localStorage.setItem(key,JSON.stringify(m));
 const icon=(name='file')=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+({file:'<path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6"/>',book:'<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1v15"/>',spark:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>',pen:'<path d="m4 20 1-5L17 3l4 4L9 19zM14 6l4 4"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'}[name]||'')+'</svg>';
 const node=(html)=>{const wrap=document.createElement('div');wrap.innerHTML=html;return wrap.firstElementChild};
 let selected=Number(new URLSearchParams(location.search).get('question'))||0,method=sessionStorage.getItem('cogniaTeacherMethod')||'bank',observer,queued=false;
 function header(page){const m=model(),t=active(m)||{},stage=assign||confirm?3:review?2:1;
  page.prepend(node(`<header class="tf-hero"><div><h1>${setup?'What are you teaching?':questions?'Create your questions':details?'Assessment details':review?'Review and refine your questions':assign?'Assign to students and set up sessions':'Review and confirm'}</h1><p>${setup?'Start with the basics. Choose a grade, subject and learning focus.':questions?'Choose the fastest option for you. You can always edit them later.':details?'Give your assessment a name, add instructions and set key details.':review?'Check the questions, edit if needed, or add more. You can reorder them anytime.':assign?'Choose who will take this assessment and when.':'Check your content, students and sessions before scheduling.'}</p></div></header>`));
  page.prepend(node(`<div class="tf-top"><a class="tf-back" href="${setup?'CAP-T03-Assessments.dc.html':t.page||'CAP-T05-Questions.dc.html'}">← &nbsp; ${setup?'Back to assessments':esc(m.title||'Your assessment')} ${setup?'':'<span class="tf-draft badge badge-secondary">Draft</span>'}</a><nav class="tf-steps" aria-label="Assessment progress">${['Create','Review','Assign'].map((label,i)=>`${i?'<i aria-hidden="true"></i>':''}<a href="${['CAP-T04-Setup.dc.html','CAP-T06-Review.dc.html?stage=details','CAP-T08-AudienceDelivery.dc.html'][i]}" class="${i+1===stage?'active':i+1<stage?'done':''}" ${i+1===stage?'aria-current="step"':''}><span>${i+1<stage?'✓':i+1}</span>${label}</a>`).join('')}</nav></div>`));
  page.querySelector('.tf-hero').append(page.querySelector('.tf-steps'));
  if(review)window.capRenderAssessmentProgress(page.querySelector('.tf-steps'),2,[
   'href="CAP-T04-Setup.dc.html"','href="CAP-T05-Questions.dc.html"'
  ]);
 }
 /* Floating bar progress (Figma): four steps after setup. Setup is the details dialog, not a step here. */
 function stepNow(){const steps=['Create','Review','Assign','Finalize'];const n=confirm?4:assign?3:review?2:1;return {n,total:steps.length,label:steps[n-1]}}
 function progressRing(){const {n,total}=stepNow(),r=22,c=2*Math.PI*r,done=(c*n/total).toFixed(2);return `<div class="tf-progress" role="img" aria-label="Step ${n} of ${total}"><svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><circle class="tf-progress-track" cx="24" cy="24" r="${r}" fill="none" stroke-width="3"/><circle class="tf-progress-value" cx="24" cy="24" r="${r}" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="${done} ${c.toFixed(2)}" transform="rotate(-90 24 24)"/></svg><span class="text-body-base font-semibold" aria-hidden="true">${n}/${total}</span></div>`}
 function footer(page){const bar=page.querySelector('.actionbar');if(!bar)return;const m=model(),t=active(m)||{},count=m.tests.reduce((n,t)=>n+(t.questions?.length||0),0);const bottom=node(`<div class="tf-bottom card card-themed" role="region" aria-label="Assessment progress and actions">${progressRing()}<div class="tf-bottom-copy"><p class="tf-bottom-step text-body-small">${esc(stepNow().label)}</p><div class="tf-bottom-title"><span class="text-body-base font-semibold" data-tf-summary-title>${esc(m.title||t.title||'New assessment')}</span><span class="tf-draft badge badge-secondary">Draft</span></div></div><div class="tf-original-actions"></div></div>`);
  const actions=bottom.querySelector('.tf-original-actions');actions.append(bar);page.append(bottom);
  /* The bar now shows progress, so the stepper at the top right is hidden on every step. */
  page.querySelectorAll('.tf-hero :is(.tf-steps, .cap-assessment-progress, .ra-journey)').forEach(el=>{el.hidden=true;el.style.display='none'});
  /* Floating bar: reserve its height at the bottom of the page so it never covers content. */
  if(window.ResizeObserver)new ResizeObserver(()=>page.style.setProperty('--tf-bar-height',bottom.offsetHeight+'px')).observe(bottom);
  /* One look for the actions on every step: ghost secondary actions, one solid primary, plain labels. */
  const tidy=()=>{bottom.querySelectorAll('.tf-original-actions :is(a,button).btn').forEach(el=>{
   if(el.textContent.trim()&&!el.dataset.tfBack)el.querySelectorAll('svg').forEach(svg=>svg.remove());
   el.querySelectorAll('span[aria-hidden="true"]').forEach(span=>{if(/^[←→]$/.test(span.textContent.trim()))span.remove()});
   for(const n of [...el.childNodes])if(n.nodeType===3){const text=n.textContent.replace(/[←→]/g,'').replace(/ /g,' ').replace(/\s+/g,' ');if(text!==n.textContent)n.textContent=text}
   if(el.textContent.trim()==='Save draft')el.textContent='Save as draft';
   if(!el.classList.contains('solid')&&(!el.classList.contains('btn-ghost')||el.classList.contains('btn-outline'))){el.classList.remove('btn-outline');el.classList.add('btn-ghost')}
   if(!el.classList.contains('btn-lg'))el.classList.add('btn-lg');
  })};
  tidy();new MutationObserver(tidy).observe(bottom,{childList:true,subtree:true,characterData:true});
  const back=bar.querySelector('a:not(.solid)');if(details&&back)back.href=t.page||'CAP-T05-Questions.dc.html';if(assign&&back)back.href='CAP-T06-Review.dc.html?stage=details';const next=bar.querySelector('.solid');if(next){if(setup)next.innerHTML='Continue';if(questions||(review&&!details))next.href='CAP-T06-Review.dc.html?stage=details';if(!confirm)next.innerHTML='Continue'}
 }
 function setupUI(page){const grid=page.querySelector('.setupgrid'),left=grid?.children[0],right=grid?.children[1];if(!left||!right)return;
  left.querySelector('h2').remove();left.querySelector('p').remove();
  const grade=left.querySelector('#grade'),subject=left.querySelector('#subject');
  const grades=node(`<div class="tf-field"><div class="tf-label">Grade / Year</div><div class="tf-pills tabs-list">${[5,6,8].map(g=>`<button class="tab" type="button" data-grade="${g}" aria-pressed="${grade.value==g}">Grade ${g}</button>`).join('')}</div><p class="tf-quiet">Sample content: Grade 5 Mathematics, Grade 6 English and Grade 8 Mathematics.</p></div>`);left.prepend(grades);
  grades.addEventListener('click',e=>{const b=e.target.closest('[data-grade]');if(!b)return;grade.value=b.dataset.grade;grade.dispatchEvent(new Event('change',{bubbles:true}));sync()});
  const subjects=node(`<div class="tf-field"><div class="tf-label">Subject</div><div class="tf-subjects tabs-list">${['English','Mathematics'].map(s=>`<button class="tab" type="button" data-subject="${s}" aria-pressed="${subject.value===s}">${icon(s==='English'?'book':'file')}${s}</button>`).join('')}</div></div>`);grades.after(subjects);subjects.addEventListener('click',e=>{const b=e.target.closest('[data-subject]');if(!b||b.disabled)return;subject.value=b.dataset.subject;subject.dispatchEvent(new Event('change',{bubbles:true}));sync()});
  grade.closest('.fields2').classList.add('tf-native-controls');
  const standards=right.querySelector('#standardsPanel');const topics=node('<div class="tf-topics"><div><h2 class="tf-label">Learning focus</h2></div><aside class="tf-topic-info"><small>Selected subject</small><h3></h3><p>Your chosen standard keeps the item bank focused on relevant content.</p><div class="tf-related"><span>Existing Cognia questions</span><span>Teacher-created questions</span></div></aside></div>');topics.firstElementChild.append(standards);left.append(topics);
  right.innerHTML=`<h2 class="tf-section-title">Quick start</h2><p class="tf-muted">Not sure where to start? Try these.</p><div class="tf-quick"><button type="button" data-quick-ai>${icon('spark')}<div><b>Generate with AI</b><small>Start with your teaching context, then create a draft with Classroom+.</small></div><span class="tf-arrow">›</span></button><a href="CAP-T21-AssessmentLibrary.dc.html">${icon()}<div><b>Use an assessment</b><small>Choose a ready-to-use assessment from the library.</small></div><span class="tf-arrow">›</span></a><a href="CAP-T03-Assessments.dc.html?view=drafts">${icon('clock')}<div><b>Start from a draft</b><small>Continue editing one of your saved drafts.</small></div><span class="tf-arrow">›</span></a></div>`;
  right.querySelector('[data-quick-ai]').onclick=()=>{sessionStorage.setItem('cogniaTeacherMethod','ai');document.getElementById('setupContinue').click()};
  function sync(){grades.querySelectorAll('[data-grade]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.grade===grade.value));subjects.querySelectorAll('[data-subject]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.subject===subject.value);b.disabled=![...subject.options].some(o=>o.value===b.dataset.subject&&!o.disabled)});topics.querySelector('h3').textContent=subject.value;}
  sync();subject.addEventListener('change',sync);grade.addEventListener('change',sync);
  window.addEventListener('click',event=>{if(event.target.closest('a')?.getAttribute('href')!=='CAP-T07-DraftSaved.dc.html')return;const form=document.getElementById('setupForm');if(!form.reportValidity()){event.preventDefault();event.stopImmediatePropagation();return}const m=model(),t=active(m),next=subject.value==='English'?'CAP-T05-Reading.dc.html':grade.value==='8'?'CAP-T05-Algebra.dc.html':'CAP-T05-Questions.dc.html';if(t.page!==next){t.questions=[];t.state={chosen:[],written:{},edits:{}}}Object.assign(t,{title:document.getElementById('title').value.trim(),grade:grade.value,subject:subject.value,standard:form.querySelector('[name=standard]:checked')?.value,page:next});if(m.tests.length===1)m.title=t.title;save(m)},{capture:true});
 }
 function questionUI(page){const left=page.querySelector('.buildergrid>section'),library=left?.querySelector('.library');if(!left||!library)return;
  if(window.cogniaQuestionComposer){window.cogniaQuestionComposer(page,{esc,node,model,active,icon});return}
  const badge=page.querySelector('.countbadge');if(badge)badge.textContent=String(active(model())?.questions?.length||0);
  const choices=node(`<div class="tf-methods" aria-label="Choose how to create questions">${[['ai','spark','Generate with AI','Describe what you need and create draft questions.'],['bank','book','Use question bank','Search and add existing, trusted questions.'],['manual','pen','Create manually','Build your own questions one at a time.']].map(([id,ic,title,copy])=>`<button type="button" class="tf-method" data-method="${id}" aria-pressed="${method===id}"><svg class="tf-folder-outline" viewBox="0 0 300 210" preserveAspectRatio="none" aria-hidden="true"><path d="M13 1H103C116 1 120 24 138 24H287Q299 24 299 37V197Q299 209 287 209H13Q1 209 1 197V14Q1 1 13 1Z"/></svg>${icon(ic)}<b>${title}</b><small>${copy}</small></button>`).join('')}</div>`);library.before(choices);
  const ai=node(`<section class="tf-ai"><h2 class="tf-label">Describe what you need</h2><textarea class="textarea" aria-label="AI question prompt" placeholder="For example: five questions about equivalent fractions for Grade 5."></textarea><div class="tf-field" style="margin-top:18px"><label for="tf-ai-count">Number of draft questions</label><select id="tf-ai-count"><option>3</option><option>5</option></select></div><p class="tf-ai-notice">Classroom+ · Prototype demonstration. Uses sample questions for this learning focus; no live AI service is connected. Review every draft before assigning.</p><button type="button" class="btn solid btn-lg" data-generate>Generate draft questions →</button><p role="status" data-ai-message></p></section>`);library.after(ai);
  const manual=node(`<section class="tf-ai"><h2 class="tf-section-title">Make it your own</h2><p class="tf-muted">Write a question, add answer options and choose the correct answer.</p><button type="button" class="btn solid btn-lg" data-write>Write a question &nbsp; →</button></section>`);ai.after(manual);
  const switchMethod=()=>{choices.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.method===method));library.hidden=method!=='bank';ai.hidden=method!=='ai';manual.hidden=method!=='manual';const plus=localStorage.getItem('cogniaProtoPlan')==='Classroom+'||document.querySelector('[data-action="ai"]')?.disabled===false;ai.querySelector('[data-generate]').disabled=!plus;ai.querySelector('[data-ai-message]').textContent=plus?'':'Select Classroom+ at the top to activate AI draft generation.'};
  choices.onclick=e=>{const b=e.target.closest('[data-method]');if(b){method=b.dataset.method;sessionStorage.setItem('cogniaTeacherMethod',method);switchMethod()}};
  manual.querySelector('button').onclick=()=>window.cogniaPreview?.renderVals().openWrite();
  ai.querySelector('[data-generate]').onclick=()=>{const inst=window.cogniaPreview,prompt=ai.querySelector('textarea');if(!prompt.value.trim()){prompt.focus();ai.querySelector('[data-ai-message]').textContent='Describe the questions you need first.';return}const bank=inst.bankItems().slice(0,Number(ai.querySelector('select').value)),written={...inst.state.written},chosen=[...inst.state.chosen];bank.forEach((q,i)=>{const id='ai-'+Date.now()+'-'+i;written[id]={...q,id,source:'AI draft'};chosen.push(id)});inst.setState({written,chosen});inst.update()};switchMethod();
 }
 function editorUI(page){if(window.capReferenceEditor)return window.capReferenceEditor(page,{model,active,save,esc,node,icon});const m=model(),t=active(m);if(!t)return;const list=t.questions||[];selected=Math.min(selected,Math.max(0,list.length-1));const q=list[selected];const box=node(`<section class="tf-review-editor"><aside class="tf-review-list"><div class="tf-review-list-header"><h2>Questions (${list.length})</h2><a class="btn ghost btn-ghost btn-lg" href="${esc(t.page)}">+ Add question</a></div>${list.map((q,i)=>`<button type="button" class="tf-question-pick" data-pick="${i}" aria-pressed="${i===selected}"><span>${i+1}</span><div><small>${esc(q.type)}</small><p>${esc(q.stem)}</p></div></button>`).join('')}</aside><div class="tf-editor">${q?`<div class="tf-editor-toolbar"><button type="button" data-move="-1" ${selected===0?'disabled':''} aria-label="Move question up">↑</button><button type="button" data-move="1" ${selected===list.length-1?'disabled':''} aria-label="Move question down">↓</button><span>Question ${selected+1} of ${list.length}</span><button type="button" data-duplicate>Duplicate</button><button type="button" data-delete ${list.length===1?'disabled':''}>Delete</button></div><div class="tf-editor-grid"><div><label class="tf-field">Question<textarea class="textarea" data-stem>${esc(q.stem)}</textarea></label><div class="tf-label">${q.options?.length?'Answer options':'Teacher-scored response'}</div>${(q.options||[]).map((o,i)=>`<label class="tf-option-row"><span>${String.fromCharCode(65+i)}</span><input data-option="${i}" aria-label="Answer option ${String.fromCharCode(65+i)}" value="${esc(o)}"></label>`).join('')}<label class="tf-field" style="margin-top:20px">Points<input type="number" min="1" max="100" data-marks value="${Number(q.marks)||1}"></label></div><div><div class="tf-visual"><div>${icon('book')}<p>${esc(t.standard)}<br>Grade ${esc(t.grade)} · ${esc(t.subject)}</p></div></div>${q.options?.length?`<div class="tf-label">Correct answer</div><div class="tf-answer-key tabs-list">${q.options.map((_,i)=>`<button class="tab" type="button" data-answer="${i}" aria-pressed="${q.correct===i}">${String.fromCharCode(65+i)}</button>`).join('')}</div>`:''}<label class="tf-field">Explanation (optional)<textarea class="textarea" data-explanation>${esc(q.explanation||'')}</textarea></label><button type="button" class="btn solid btn-lg" data-save-question>Save question changes</button><p class="tf-editor-error" role="alert"></p></div></div>`:'<p>No questions yet. Return to the question bank to add content.</p>'}</div></section>`);page.querySelector('.reviewgrid').before(box);
  const refresh=()=>{box.remove();editorUI(page)};
  box.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.pick);refresh()});
  const commit=()=>{t.state=t.state||{chosen:list.map(q=>q.id),written:{},edits:{}};t.state.chosen=list.map(q=>q.id);save(m);location.reload()};
  box.querySelector('[data-save-question]')?.addEventListener('click',()=>{const stem=box.querySelector('[data-stem]').value.trim(),options=[...box.querySelectorAll('[data-option]')].map(el=>el.value.trim()),marks=Number(box.querySelector('[data-marks]').value);if(!stem||options.some(o=>!o)||marks<1||marks>100){box.querySelector('[role=alert]').textContent='Add a question, complete every answer option and use points from 1 to 100.';return}Object.assign(q,{stem,options,marks,explanation:box.querySelector('[data-explanation]').value});t.state=t.state||{chosen:list.map(q=>q.id),written:{},edits:{}};t.state.edits={...t.state.edits,[q.id]:q};commit()});
  box.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{q.correct=Number(b.dataset.answer);box.querySelectorAll('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',x===b));});
  box.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const dest=selected+Number(b.dataset.move);[list[selected],list[dest]]=[list[dest],list[selected]];selected=dest;commit()});
  box.querySelector('[data-delete]')?.addEventListener('click',()=>{list.splice(selected,1);commit()});
  box.querySelector('[data-duplicate]')?.addEventListener('click',()=>{const copy={...q,id:'copy-'+Date.now(),options:[...(q.options||[])]};list.splice(selected+1,0,copy);t.state=t.state||{written:{},edits:{}};t.state.written={...t.state.written,[copy.id]:copy};commit()});
 }
 function detailsUI(page){if(window.capReferenceDetails)return window.capReferenceDetails(page,{model,active,save,esc,node,icon});const m=model(),t=active(m)||{},saved=m.details||{},settings=page.querySelector('.reviewgrid aside section');if(!settings)return;const layout=node(`<section class="tf-details-layout"><section class="tf-surface"><label class="tf-field">Assessment name<input id="tf-assessment-name" maxlength="90" value="${esc(m.title)}" required></label><label class="tf-field">Description (optional)<textarea class="textarea" id="tf-description" rows="3" maxlength="500">${esc(saved.description||'')}</textarea></label><div class="tf-fields"><label class="tf-field">Grade / Year<input readonly value="Grade ${esc(t.grade)}"></label><label class="tf-field">Subject<input readonly value="${esc(t.subject)}"></label></div><div data-instructions></div><details class="tf-resources"><summary>Additional teaching notes (optional)</summary><textarea class="textarea" id="tf-notes" aria-label="Additional teaching notes" maxlength="1000">${esc(saved.notes||'')}</textarea><p class="tf-muted">Private planning notes saved with this browser prototype.</p></details></section><aside></aside></section>`);page.querySelector('.reviewgrid').before(layout);layout.querySelector('[data-instructions]').append(settings.querySelector('#instructions').closest('.field'));settings.className='tf-settings-panel';settings.querySelector('h2').textContent='Assessment settings';layout.querySelector('aside').append(settings);const instructions=layout.querySelector('#instructions');if(saved.instructions!=null)instructions.value=saved.instructions;if(m.settings?.limit)layout.querySelector('#timeLimit').value=m.settings.limit;
  layout.addEventListener('change',()=>{m.title=layout.querySelector('#tf-assessment-name').value.trim()||m.title;save(m);m.details={description:layout.querySelector('#tf-description').value,notes:layout.querySelector('#tf-notes').value,instructions:instructions.value};save(m);page.querySelector('[data-tf-summary-title]').textContent=m.title;const delivery=read('cogniaDeliverySessions');if(delivery.sessions){delivery.time=layout.querySelector('#timeLimit').value;localStorage.setItem('cogniaDeliverySessions',JSON.stringify(delivery))}});
 }
 function decorate(){const page=document.querySelector('main>.page');if(!page||page.dataset.teacherFlow)return;observer?.disconnect();page.dataset.teacherFlow='reference';page.classList.add('tf-page',details?'tf-details':review?'tf-review':assign?'tf-assign':confirm?'tf-confirm':'tf-create');header(page);const tests=page.querySelector('.assessment-test-list');if(tests&&model().tests.length===1){const disclosure=document.createElement('details');disclosure.className='tf-test-disclosure';disclosure.innerHTML='<summary>Tests in this assessment · 1 <span>View test details</span></summary>';tests.before(disclosure);disclosure.append(tests)}if(setup)setupUI(page);if(questions)questionUI(page);if(review){if(details)detailsUI(page);else editorUI(page)}if(assign){const panels=page.querySelectorAll('.reviewgrid .formcard');if(panels[0])panels[0].querySelector('h2').textContent='1. Select classes or students';if(panels[1])panels[1].querySelector('h2').textContent='2. Set up sessions';}const content=page.querySelector(".tf-review-editor,.tf-details-layout");if(content){const approvals=page.querySelector("#client-item-review");if(approvals)content.after(approvals)}const compact=page.querySelector(".tf-test-disclosure");if(compact){const anchor=page.querySelector(".extra-test");if(anchor)anchor.before(compact);else page.append(compact)}footer(page);if(review&&window.capReferenceFinish)window.capReferenceFinish(page);if(assign&&window.capReferenceAssign)window.capReferenceAssign(page);observe();}
 function observe(){observer.observe(document.body,{childList:true,subtree:true})}
 observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate()})});decorate();
});

/* Floating bar, 10 Nov: plain "Back" (arrow + word, goes to the previous screen), plain "Continue" and
   "Create assessment" on the last step. Save as draft leaves the bar and sits top right of the page on steps 1 and 2.
   It is a toggle: click to save (turns into a green "Draft saved" button with a check), click again to unsave.
   The saved state is read from the draft archive, so it shows as unsaved again once the assessment changes. */
(()=>{
 const file=location.pathname.split('/').pop();
 const step=/^CAP-T05-/.test(file)?1:file==='CAP-T06-Review.dc.html'?2:file==='CAP-T08-AudienceDelivery.dc.html'?3:file==='CAP-T09-ConfirmAssignment.dc.html'?4:0;
 if(!step)return;
 const key='cogniaAssessmentTestsV1',archiveKey='cogniaAssessmentArchiveV1',workKey='cogniaAssessmentWork';
 const svg=d=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
 const arrowLeft=svg('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'),check=svg('<path d="M20 6 9 17l-5-5"/>');
 const stored=k=>{try{return localStorage.getItem(k)||''}catch{return ''}};
 const readJSON=(k,f)=>{try{return JSON.parse(stored(k))??f}catch{return f}};
 const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
 const itemsPage=()=>{const m=readJSON(key,{});return (m.tests?.find(t=>t.id===m.active)||m.tests?.[0])?.page||'CAP-T05-Questions.dc.html'};
 const previous=()=>step===2?itemsPage():step===3?'CAP-T06-Review.dc.html?stage=details':'CAP-T08-AudienceDelivery.dc.html';
 /* Same entry shape as the draft archive used by the Assessments list (client-connected-feedback.js). */
 const draftId=m=>m?.tests?.length?'assessment-'+m.tests.map(t=>t.id).join('-'):null;
 function isSaved(){const id=draftId(readJSON(key,null));if(!id)return false;const entry=readJSON(archiveKey,[]).find(e=>e.id===id&&e.status==='draft');return !!entry&&JSON.stringify(entry.model)===stored(key)}
 function setSaved(on){
  const m=readJSON(key,null),id=draftId(m);if(!id)return;
  const entries=readJSON(archiveKey,[]).filter(e=>!(e.id===id&&e.status==='draft'));
  if(on)entries.unshift({id,title:m.title,status:'draft',step,updatedAt:new Date().toISOString(),model:m,delivery:readJSON('cogniaDeliverySessions',null)});
  write(archiveKey,entries);write(workKey,{...readJSON(workKey,{tests:1}),draftSaved:on});
 }
 function paintDraft(button,saved){
  if(button.getAttribute('aria-pressed')===String(saved))return;
  button.setAttribute('aria-pressed',String(saved));
  button.classList.toggle('btn-outline',!saved);button.classList.toggle('tf-draft-saved',saved);
  button.innerHTML=saved?check+'Draft saved':'Save as draft';
  button.title=saved?'Click to unsave this draft':'';
 }
 function draftButton(){
  const button=document.createElement('button');button.type='button';button.className='btn btn-outline btn-lg tf-hero-draft';button.dataset.tfDraft='';
  button.addEventListener('click',()=>{const saved=button.getAttribute('aria-pressed')!=='true';setSaved(saved);paintDraft(button,saved)});
  return button;
 }
 function normalise(){
  const bar=document.querySelector('.tf-bottom');
  if(bar){
   bar.querySelectorAll('a[href="CAP-T07-DraftSaved.dc.html"]').forEach(a=>a.remove());
   if(step>1)bar.querySelectorAll('a:not(.solid)').forEach(a=>{
    if(!a.dataset.tfBack&&!/^back\b/i.test(a.textContent.trim()))return;
    const href=previous();
    if(a.dataset.tfBack&&a.getAttribute('href')===href&&a.querySelector('svg')&&a.textContent.trim()==='Back')return;
    a.dataset.tfBack='1';a.href=href;a.removeAttribute('title');a.removeAttribute('aria-label');a.innerHTML=arrowLeft+'Back';
   });
   const label=step<4?'Continue':'Create assessment';
   bar.querySelectorAll('.solid').forEach(b=>{if(b.textContent.trim()!==label)b.textContent=label});
  }
  if(step<=2){
   const hero=document.querySelector('.tf-page .tf-hero');if(!hero)return;
   let draft=hero.querySelector(':scope>[data-tf-draft]');
   if(!draft){draft=draftButton();hero.append(draft)}
   paintDraft(draft,isSaved());
  }
 }
 let queued=false;
 const run=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;normalise()})};
 const start=()=>{normalise();new MutationObserver(run).observe(document.body,{childList:true,subtree:true,characterData:true});document.addEventListener('change',run,true)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
