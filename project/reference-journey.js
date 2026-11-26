/* Reference layouts for the local draft review, details and assignment journey. */
window.capReferenceEditor=(page,{model,active,save,esc,node,icon})=>{
 page.classList.add('rj-review');const m=model(),t=active(m);if(!t)return;const qs=t.questions||[];let picked=Math.min(Number(new URLSearchParams(location.search).get('question'))||0,Math.max(qs.length-1,0));
 const host=node('<section class="tf-review-editor rj-editor-layout"></section>');page.querySelector('.reviewgrid').before(host);
 const persist=()=>{t.state=t.state||{written:{},edits:{}};t.state.chosen=qs.map(q=>q.id);save(m)};
 const record=q=>{t.state=t.state||{written:{},edits:{}};t.state.edits={...t.state.edits,[q.id]:JSON.parse(JSON.stringify(q))};persist()};
 const kind=q=>q.displayType||({'Text entry':'Short answer','Extended text':'Extended response','Choice':'Multiple choice'}[q.type]||q.type);
 let current;
 function capture(validate=false){if(!current)return true;if(validate&&(!host.querySelector('[data-stem]').value.trim()||[...host.querySelectorAll('[data-option]')].some(e=>!e.value.trim())||Number(host.querySelector('[data-marks]').value)<1||Number(host.querySelector('[data-marks]').value)>100)){host.querySelector('.rj-save-status').textContent='Complete the question and all answer options, and use points from 1 to 100.';return false}const before=JSON.stringify(current);current.stem=host.querySelector('[data-stem]')?.value??current.stem;current.options=[...host.querySelectorAll('[data-option]')].map(e=>e.value);const explanation=host.querySelector('[data-explanation]')?.value||'';if(explanation||current.explanation!=null)current.explanation=explanation;current.marks=Number(host.querySelector('[data-marks]')?.value)||1;if(JSON.stringify(current)!==before)record(current);return true}
 function draw(){const q=qs[picked];current=q;host.innerHTML=`<aside class="tf-review-list"><div class="tf-review-list-header"><h2>Questions (${qs.length})</h2><a class="btn ghost btn-ghost btn-lg" href="${esc(t.page||'CAP-T05-Questions.dc.html')}"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> Add question</a></div>${qs.map((v,i)=>`<button type="button" class="tf-question-pick" data-pick="${i}" aria-pressed="${picked===i}" draggable="true"><i aria-hidden="true"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg></i><span>${i+1}</span><div><small>${esc(kind(v))}</small><p>${esc(v.stem)}</p></div><i aria-hidden="true"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg></i></button>`).join('')}</aside><section class="tf-editor card">${q?`<div class="tf-editor-toolbar"><button type="button" data-prev aria-label="Previous question" ${picked===0?'disabled':''}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg></button><button type="button" data-next aria-label="Next question" ${picked===qs.length-1?'disabled':''}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg></button><span>Question ${picked+1} of ${qs.length}</span><button type="button" data-duplicate><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>Duplicate</button><button type="button" data-delete ${qs.length===1?'disabled':''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg> &nbsp; Delete</button><label>Question type<select class="select" data-kind aria-label="Question type">${['Multiple choice','Short answer','Extended response','True / False','Order','Match','Fill in the blank'].map(v=>`<option ${kind(q)===v?'selected':''}>${v}</option>`).join('')}</select></label></div><div class="tf-editor-grid"><div><label class="tf-field">Question<textarea class="textarea" data-stem rows="4">${esc(q.stem)}</textarea></label><div class="rj-media-tools"><label class="rj-media-button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg><span>Add image</span><input type="file" accept="image/*" data-image hidden></label><button type="button" data-equation><b><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3" /><path d="M9 11.2h5.7" /></svg></b><span>Add equation</span></button><label class="rj-media-button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" /><path d="M16 9a5 5 0 0 1 0 6" /><path d="M19.364 18.364a9 9 0 0 0 0-12.728" /></svg><span>Add audio</span><input type="file" accept="audio/*" data-audio hidden></label></div><div class="rj-answer-heading">${q.options?.length?'Answer options':'Teacher-scored response'}</div><div class="rj-options">${(q.options||[]).map((v,i)=>`<div class="tf-option-row"><span>${String.fromCharCode(65+i)}</span><input data-option="${i}" aria-label="Answer option ${String.fromCharCode(65+i)}" value="${esc(v)}"><label class="rj-option-image" title="Add image to option"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg><input type="file" accept="image/*" data-option-image="${i}" hidden></label><button type="button" data-remove-option="${i}" aria-label="Remove option ${String.fromCharCode(65+i)}" ${q.options.length<=2?'disabled':''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button></div>`).join('')}</div>${q.options?.length?'<button type="button" class="rj-add-option" data-add-option><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> Add option</button>':'<p class="rj-muted">Students enter a written response. Add the expected answer in the explanation.</p>'}<label class="rj-marks">Points<input type="number" min="1" max="100" data-marks value="${q.marks||1}"></label></div><div class="rj-answer-side"><div class="tf-visual">${q.image?`<img src="${esc(q.image)}" alt="Question illustration">`:q.visual==='quarter'?'<svg viewBox="0 0 100 100" aria-label="One quarter shaded"><path d="M50 50V7A43 43 0 0 1 93 50Z" fill="#bbb"/><circle cx="50" cy="50" r="43" fill="none" stroke="#222"/><path d="M50 7v86M7 50h86" stroke="#222"/></svg>':`<div>${icon('book')}<p>${esc(t.standard||'')}<br>Grade ${esc(t.grade)} ${esc(t.subject)}</p></div>`}</div>${q.audio?`<audio controls src="${esc(q.audio)}"></audio>`:''}${q.options?.length?`<div class="tf-label">Correct answer</div><div class="tf-answer-key tabs-list">${q.options.map((_,i)=>`<button class="tab" type="button" data-answer="${i}" aria-pressed="${q.correct===i}">${String.fromCharCode(65+i)}</button>`).join('')}</div>`:''}<label class="tf-field">Explanation (optional)<textarea class="textarea" data-explanation rows="4">${esc(q.explanation||'')}</textarea></label><button type="button" class="btn solid btn-lg" data-save-question>Save changes</button><p class="rj-save-status" role="status"></p></div></div>`:'<div class="rj-empty">No questions yet. Use Add question to build this test.</div>'}</section>`;
 host.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{capture();picked=Number(b.dataset.pick);draw()});
 if(!q)return;
 host.querySelector('[data-prev]').onclick=()=>{capture();picked--;draw()};host.querySelector('[data-next]').onclick=()=>{capture();picked++;draw()};
 host.querySelector('[data-save-question]').onclick=()=>{if(capture(true))host.querySelector('.rj-save-status').textContent='Changes saved'};
 host.querySelector('[data-delete]').onclick=()=>{qs.splice(picked,1);picked=Math.min(picked,qs.length-1);persist();draw()};
 host.querySelector('[data-duplicate]').onclick=()=>{capture();const copy=JSON.parse(JSON.stringify(q));copy.id='copy-'+Date.now();qs.splice(picked+1,0,copy);t.state.written={...t.state.written,[copy.id]:copy};picked++;persist();draw()};
 host.querySelector('[data-add-option]')?.addEventListener('click',()=>{capture();if(q.options.length<8){q.options.push('');record(q);draw()}});
 host.querySelectorAll('[data-remove-option]').forEach(b=>b.onclick=()=>{capture();const n=Number(b.dataset.removeOption);q.options.splice(n,1);if(q.correct===n)q.correct=0;else if(q.correct>n)q.correct--;record(q);draw()});
 host.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{q.correct=Number(b.dataset.answer);record(q);host.querySelectorAll('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
 host.querySelector('[data-kind]').onchange=e=>{capture();const v=e.target.value;q.displayType=v;if(['Multiple choice','True / False'].includes(v)){q.type='Multiple choice';if(!q.options.length){q.options=v==='True / False'?['True','False']:['',''];q.correct=0}}else{q.type=v==='Extended response'?'Extended text':'Text entry';q.options=[];q.correct=null}record(q);draw()};
 host.querySelector('[data-equation]').onclick=()=>{const field=host.querySelector('[data-stem]');field.setRangeText(' [equation] ',field.selectionStart,field.selectionEnd,'select');field.focus();capture()};
 for(const [sel,key]of [['[data-image]','image'],['[data-audio]','audio']])host.querySelector(sel).onchange=e=>{const f=e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{capture();q[key]=reader.result;try{record(q);draw()}catch{host.querySelector('.rj-save-status').textContent='This file is too large for local draft storage.'}};reader.readAsDataURL(f)};
 host.querySelectorAll('[data-option-image]').forEach(input=>input.onchange=e=>{const f=e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{capture();q.optionImages=q.optionImages||{};q.optionImages[input.dataset.optionImage]=reader.result;try{record(q);input.closest('label').style.backgroundImage='url('+reader.result+')';input.closest('label').style.backgroundSize='cover'}catch{host.querySelector('.rj-save-status').textContent='This image is too large for local storage.'}};reader.readAsDataURL(f)});
 host.querySelectorAll('textarea,[data-option],[data-marks]').forEach(e=>e.addEventListener('change',capture));
 let drag;host.querySelectorAll('[data-pick]').forEach(b=>{b.ondragstart=e=>{capture();drag=Number(b.dataset.pick);e.dataTransfer.setData('text/plain',String(drag))};b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();const dest=Number(b.dataset.pick);if(drag===undefined)return;qs.splice(dest,0,qs.splice(drag,1)[0]);picked=dest;persist();draw()}});
 }
 draw();page.addEventListener('click',e=>{if(e.target.closest('a'))capture()},true);
};
/* Step 2, Assessment details (10 Nov 2026, Figma 1488:12324): test pills, a test form on the left and the
   assessment settings on the right. Built from the plugin's input, select, textarea, tab, check and btn classes. */
window.capReferenceDetails=(page,{model,active,save,esc,node})=>{
 page.classList.add('rj-details');
 const hero=page.querySelector('.tf-hero'),detailsTop=page.querySelector('.tf-top');
 if(detailsTop){const progress=detailsTop.querySelector('.tf-steps');if(progress)hero.append(progress);detailsTop.remove();}
 hero.querySelector(':scope>div>p')?.remove();
 const heroTitle=hero.querySelector('h1');if(heroTitle)heroTitle.textContent='Test details';
 const m=model();let t=active(m);if(!t)return;
 const original=page.querySelector('.reviewgrid aside section'),instructions=original.querySelector('#instructions'),time=original.querySelector('#timeLimit'),reviewed=original.querySelector('#reviewed');
 const svg=d=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
 const minus=svg('<path d="M5 12h14"/>'),plus=svg('<path d="M5 12h14"/><path d="M12 5v14"/>');
 instructions.remove();

 /* Header actions sit left of Save as draft (teacher-flow-upgrade.js appends that button to the hero). */
 const tools=node('<div class="ad-hero-actions" role="group" aria-label="Assessment actions"><button type="button" class="btn ghost btn-ghost btn-lg rj-bank-reuse" data-bank title="Save this assessment for reuse">Bank for reuse</button></div>');
 hero.append(tools);
 /* 20 Nov: Add another test is an outline button at the far right of the header. (Save as draft moved to the
    floating bar on 23 Nov, see teacher-flow-upgrade.js.) */
 const addBtn=node('<button type="button" class="btn btn-outline btn-lg ad-add-test" aria-haspopup="dialog">Add another test</button>');
 const placeAdd=()=>{if(!addBtn.isConnected)hero.append(addBtn)};
 placeAdd();new MutationObserver(placeAdd).observe(hero,{childList:true});

 const host=node('<section class="ad-layout"><div class="ad-main"></div><div class="ad-settings"></div></section>');
 page.querySelector('.reviewgrid').before(host);
 const main=host.firstElementChild,side=host.lastElementChild;
 let selected=t.id;

 /* 20 Nov (Figma 1929:15618): one centred white card per test. The card shows the assessment title above the test
    name, then its details; a square-pen icon top right reopens the setup modal. A tab rail on the card's right edge
    switches the card between Overview, Items and Settings, and opens Learner preview. A dashed full-width button
    under the cards adds another test. */
 const pencil=svg('<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>');
 const fileText=svg('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>');
 const settingText={attempts:{'One attempt only':'1','2 attempts':'2','3 attempts':'3'},calculator:{'Not allowed':'No'},notes:{'Allowed':'Yes','Not allowed':'No'},limit:{'None':'No limit'}};
 const detailsFor=x=>{x.details=x.details||{description:x.description||m.details?.description||'',instructions:m.details?.instructions||instructions.value,resource:x.resource||'',notes:x.notes||'',duration:Number(x.duration)>0?x.duration+' minutes':'None'};return x.details};
 const minutesOf=d=>parseInt(d,10)||0;
 const row=(label,value)=>`<div class="ad-dl-row"><dt>${label}</dt><dd${value?'':' class="ad-empty"'}>${value?esc(value):'Not added'}</dd></div>`;
 const views={},previewState={},itemPage={};
 const arrowBack=svg('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'),arrowNext=svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>');const tabs=[['overview','Overview'],['items','Items'],['settings','Settings'],['preview','Learner preview']];
 /* What the card's edit icon does in each view: Overview edits the test details, Items opens the item editor,
    Settings opens the setup modal with Quick settings expanded. Learner preview has no edit. */
 const editLabel={overview:'Edit test details',items:'Edit items',settings:'Edit settings'};
 const kindOf=q=>q.displayType||({'Text entry':'Short answer','Extended text':'Extended response','Choice':'Multiple choice'}[q.type]||q.type||'Item');
 function panel(x,view){
  if(view==='preview')return '';
  const d=detailsFor(x),qs=x.questions||[],marks=qs.reduce((n,q)=>n+Number(q.marks||1),0),points=Number(d.points)||marks;
  if(view==='items')return qs.length
   ?`<ol class="af-item-list ad-af-items">${qs.map((q,n)=>{const pts=Number(q.marks||1);return `<li class="af-item"><span class="af-item-number">${n+1}</span><div class="af-item-body"><div class="af-item-meta"><span class="text-body-small">${esc(kindOf(q))}</span><span class="badge badge-secondary">${pts} ${pts===1?'point':'points'}</span></div><p>${esc(q.stem||'Untitled item')}</p></div></li>`}).join('')}</ol><div class="ad-items-pager"><button type="button" class="btn btn-ghost lp-step" data-items-go="-1">${arrowBack}Back</button><span class="ad-items-range text-body-small" aria-live="polite"></span><button type="button" class="btn btn-ghost lp-step" data-items-go="1">Next${arrowNext}</button></div>`
   :`<div class="ad-empty-state"><h4>No items yet</h4><p>Use the edit button to add items to this test.</p></div>`;
  if(view==='settings'){
   const s={...(window.capAssessmentSetup?.settingDefaults||{}),...m.settings};
   const set=k=>k==='calculator'&&s.calculator==='Allowed'?'Yes, '+(s.calculatorType||'Basic'):settingText[k]?.[s[k]]||s[k];
   return `<dl class="ad-dl ad-dl-main">${row('Attempts',set('attempts'))}${row('Show results to learners',set('results'))}${row('Item order',set('questionOrder'))}${row('Answer option order',set('optionOrder'))}${row('Calculator allowed?',set('calculator'))}${row('Notes allowed?',set('notes'))}${row('Time limit',set('limit'))}${row('Duration in minutes',minutesOf(d.duration)?String(minutesOf(d.duration)):'')}${row('Resource link',d.resource)}</dl>`;
  }
  const stds=(d.standards||[x.standard].filter(Boolean)).join(', ');
  return `<div class="ad-card-hero"><span class="ad-card-icon">${fileText}</span><div class="ad-card-name"><p class="ad-card-kicker">${esc(m.title||'Fall 2026')}</p><h3 id="ad-test-${esc(x.id)}" title="${esc(x.title)}">${esc(x.title)}</h3></div></div>`
   +`<dl class="ad-dl ad-dl-main">${row('Subject',x.subject)}${row('Grade level',x.grade?'Grade '+x.grade:'')}${row('Test pathway',x.pathway||'College and career readiness')}${row('Standards',stds)}${row('Items',String(qs.length))}${row('Total points',String(points))}</dl>`;
 }
 function card(x){
  const id=esc(x.id),view=views[x.id]||'overview',label=editLabel[view];
  return `<div class="ad-test-item" data-test="${id}"><article class="card ad-test-card" aria-label="${esc(x.title)}"><button type="button" class="btn btn-ghost btn-icon ad-card-edit" data-edit-details="${id}" aria-label="${label?esc(label+': '+x.title):''}" title="${label||''}" ${label?'':'hidden'}>${pencil}</button>`
   +`<div class="ad-card-panel" role="tabpanel" id="ad-panel-${id}" aria-labelledby="ad-tab-${id}-${view}" data-view="${view}">${panel(x,view)}</div></article>`
   +`<div class="ad-test-tabs" role="tablist" aria-orientation="vertical" aria-label="${esc(x.title)} sections">${tabs.map(([k,l])=>`<button type="button" role="tab" class="ad-test-tab" id="ad-tab-${id}-${k}" data-view-tab="${k}" data-test-id="${id}" aria-controls="ad-panel-${id}" aria-selected="${view===k}" tabindex="${view===k?0:-1}">${l}</button>`).join('')}</div></div>`;
 }
 /* Items view pages instead of scrolling (20 Nov): rows are measured and split into pages that fit the card,
    and Back and Next step through them, like the learner preview. */
 function paginate(item,x){
  const list=item.querySelector('.ad-card-panel[data-view="items"] .ad-af-items');if(!list)return;
  const rows=[...list.children],pager=item.querySelector('.ad-items-pager');rows.forEach(r=>r.hidden=false);
  const room=list.clientHeight,pages=[[]];let top=rows[0]?.offsetTop||0;
  rows.forEach(r=>{if(pages.at(-1).length&&r.offsetTop+r.offsetHeight-top>room){pages.push([]);top=r.offsetTop}pages.at(-1).push(r)});
  const show=n=>{const p=Math.max(0,Math.min(pages.length-1,n));itemPage[x.id]=p;rows.forEach(r=>r.hidden=!pages[p].includes(r));
   const first=rows.indexOf(pages[p][0])+1,last=rows.indexOf(pages[p].at(-1))+1;
   pager.querySelector('.ad-items-range').textContent=`${p+1} of ${pages.length}`;pager.querySelector('.ad-items-range').setAttribute('aria-label',`Page ${p+1} of ${pages.length}, items ${first} to ${last} of ${rows.length}`);
   pager.querySelector('[data-items-go="-1"]').classList.toggle('hide',p===0);pager.querySelector('[data-items-go="1"]').classList.toggle('hide',p===pages.length-1)};
  pager.hidden=pages.length<2;show(itemPage[x.id]||0);
  pager.querySelectorAll('[data-items-go]').forEach(b=>b.onclick=()=>{show((itemPage[x.id]||0)+Number(b.dataset.itemsGo));const next=pager.querySelector('.lp-step:not(.hide)');if(b.classList.contains('hide'))next?.focus()});
 }
 /* Fill a card's panel for its view. Learner preview plays inside the card (no full-screen dialog). */
 function fill(item,x,view){
  const cardEl=item.querySelector('.ad-test-card'),panelEl=item.querySelector('.ad-card-panel'),edit=item.querySelector('.ad-card-edit'),label=editLabel[view];
  panelEl.dataset.view=view;panelEl.setAttribute('aria-labelledby',`ad-tab-${x.id}-${view}`);panelEl.innerHTML=panel(x,view);panelEl.scrollTop=0;
  edit.hidden=!label;if(label){edit.title=label;edit.setAttribute('aria-label',label+': '+x.title)}
  cardEl.dataset.view=view;
  item.querySelectorAll('[data-view-tab]').forEach(b=>{const on=b.dataset.viewTab===view;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});
  if(view==='preview')window.capLearnerPreview(x,{host:panelEl,state:previewState[x.id]=previewState[x.id]||{}});
  if(view==='items')paginate(item,x);
 }
 /* Turn a page with a curl (20 Nov). The page is cut into thin vertical strips, each hinged to the one before it,
    so the page bends as it turns: the outer edge lifts first and rolls over, the spine follows, and the back of the
    paper shows as it goes over. Going down the tab list the current page turns away to reveal the new one; going
    back up, the new page rolls back in over the old one. Skipped for reduced motion. */
 function curlPage(cardEl,content){
  const w=cardEl.offsetWidth,h=cardEl.offsetHeight,n=24,sw=w/n;
  const root=document.createElement('div');root.className='ad-curl';root.setAttribute('aria-hidden','true');
  Object.assign(root.style,{left:cardEl.offsetLeft+'px',top:cardEl.offsetTop+'px',width:w+'px',height:h+'px'});
  const strips=[];let parent=root;
  for(let i=0;i<n;i++){
   const strip=document.createElement('div');strip.className='ad-curl-strip';
   Object.assign(strip.style,{left:(i?sw:0)+'px',width:sw+'px',height:h+'px'});
   const face=document.createElement('div');face.className='ad-curl-face';
   const page=content.cloneNode(true);page.inert=true;page.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
   Object.assign(page.style,{position:'absolute',left:-(i*sw)+'px',top:0,width:w+'px',maxWidth:'none',height:h+'px',margin:0,boxShadow:'none',visibility:'visible'});
   const shade=document.createElement('div');shade.className='ad-curl-shade';
   const back=document.createElement('div');back.className='ad-curl-back';
   if(i===n-1)back.style.borderRadius=face.style.borderRadius=`0 var(--radius-xl) var(--radius-xl) 0`;
   if(i===0)back.style.borderRadius=face.style.borderRadius=`var(--radius-xl) 0 0 var(--radius-xl)`;
   face.append(page,shade);strip.append(face,back);parent.append(strip);parent=strip;strips.push({strip,shade,back});
  }
  return {root,strips,content,
   /* p: 0 flat, 1 turned over. Each strip's total angle runs 0 to -180; the outer strips lead, so the page curls. */
   set(p){
    const spread=.7,ease=v=>v<.5?2*v*v:1-Math.pow(-2*v+2,2)/2;let prev=0;
    strips.forEach(({strip,shade,back},i)=>{
     const edge=i/(n-1),local=Math.min(1,Math.max(0,p*(1+spread)-(1-edge)*spread)),angle=-180*ease(local);
     strip.style.transform=`rotateY(${angle-prev}deg)`;prev=angle;
     const light=Math.abs(Math.sin(angle*Math.PI/180));shade.style.opacity=(light*.22).toFixed(3);back.style.opacity=1;
    });
    root.style.opacity=p>.8?String((1-p)/.2):'1';
   }};
 }
 function turnPage(item,x,from,to){
  const order=tabs.map(([k])=>k),forward=order.indexOf(to)>order.indexOf(from),cardEl=item.querySelector('.ad-test-card');
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  item.querySelectorAll('.ad-curl').forEach(g=>{g._stop?.();g.remove()});cardEl.style.visibility='';
  if(still||from===to){fill(item,x,to);return}
  const snapshot=()=>{const c=cardEl.cloneNode(true);c.querySelector('.ad-card-panel').scrollTop=0;return c};
  const old=snapshot(),oldScroll=cardEl.querySelector('.ad-card-panel').scrollTop;
  fill(item,x,to);
  const curl=curlPage(cardEl,forward?old:snapshot());
  const offset=forward?oldScroll:0;curl.root.querySelectorAll('.ad-card-panel').forEach(p=>p.style.transform=`translateY(${-offset}px)`);
  item.append(curl.root);
  /* Going back, the old page stays put under the new page as it rolls in. */
  let under=null;
  if(!forward){under=old;under.classList.add('ad-curl-under');under.inert=true;under.setAttribute('aria-hidden','true');under.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
   Object.assign(under.style,{left:cardEl.offsetLeft+'px',top:cardEl.offsetTop+'px',width:cardEl.offsetWidth+'px',height:cardEl.offsetHeight+'px'});
   item.insertBefore(under,curl.root);cardEl.style.visibility='hidden'}
  const dur=700,start=performance.now();let raf;
  const end=()=>{cancelAnimationFrame(raf);curl.root.remove();under?.remove();cardEl.style.visibility=''};
  curl.root._stop=end;
  const tick=now=>{const t=Math.min(1,(now-start)/dur);curl.set(forward?t:1-t);if(t<1)raf=requestAnimationFrame(tick);else end()};
  curl.set(forward?0:1);raf=requestAnimationFrame(tick);
 }
 function syncDelivery(){
  time.value=m.settings?.limit||'5 minutes';
  const delivery=JSON.parse(localStorage.getItem('cogniaDeliverySessions')||'null');if(delivery){delivery.time=time.value;delivery.attempts=m.settings?.attempts==='2 attempts'?'2':m.settings?.attempts==='3 attempts'?'3':'1';localStorage.setItem('cogniaDeliverySessions',JSON.stringify(delivery))}
 }
 function openSetup(trigger,{initial,heading,submitLabel,showSettings,showAssessmentTitle,expandSettings,onDelete,onSubmit}){
  const api=window.capAssessmentSetup;if(!api)return;persist();let done=false;
  const setup=api.create({host:page.closest('.theme-assessments')||document.body,initial,heading,submitLabel,showSettings,showAssessmentTitle,
   onDelete:onDelete&&(()=>{done=true;onDelete()}),
   onSubmit(details){done=true;onSubmit(details,api)},
   onClose(){setup.remove();if(!done)(trigger.isConnected?trigger:addBtn)?.focus()}});
  setup.open(initial,{expandSettings});
 }
 const persist=()=>{
  m.settings=m.settings||{};
  m.tests.forEach(x=>{const d=detailsFor(x);d.instructions=instructions.value});
  m.details={...m.details,instructions:instructions.value};
  syncDelivery();save(m);
  page.querySelector('[data-tf-summary-title]')?.replaceChildren(document.createTextNode(m.title));
 };
 host.rjPersist=persist;

 function draw(){
  t=m.tests.find(x=>x.id===selected)||m.tests[0];
  side.remove();host.querySelector('.ad-settings-title')?.remove();
  /* 20 Nov: tests sit in a deck. The chosen test is the front card with its tabs; up to two others peek out
     behind it (no tabs) and can be clicked. Under the card, chevrons either side of the test name and
     "1 of 3" step through the tests. */
  const at=Math.max(0,m.tests.indexOf(t)),count=m.tests.length,behind=[1,2].filter(k=>k<count).map(k=>m.tests[(at+k)%count]);
  const chevron=d=>svg(`<path d="${d}"/>`);
  main.innerHTML=`<div class="ad-test-stack ad-deck">${card(t).replace('<article',behind.map((x,n)=>`<button type="button" class="ad-deck-behind" style="--ad-depth:${n+1}" data-deck-show="${esc(x.id)}" aria-label="Show ${esc(x.title)}"></button>`).reverse().join('')+'<article')}`
   +(count>1?`<nav class="ad-test-pager" aria-label="Tests in this assessment"><button type="button" class="btn btn-ghost btn-icon" data-deck-go="-1" aria-label="Previous test">${chevron('m15 18-6-6 6-6')}</button><span class="ad-test-pager-count" aria-live="polite" aria-label="Test ${at+1} of ${count}: ${esc(t.title)}">${at+1} of ${count}</span><button type="button" class="btn btn-ghost btn-icon" data-deck-go="1" aria-label="Next test">${chevron('m9 18 6-6-6-6')}</button></nav>`:'')+`</div>`;
  /* Shuffle (20 Nov): the chosen card slides out from the fan to the left, lifts over the deck and settles in
     front, while the old front card tips right and sinks into the fan. Fan positions match the CSS. */
  const fanAt=d=>`translateX(${-32*d}px) rotate(${-5*d}deg)`;
  const showTest=(id,dir)=>{if(id===t.id)return;
   const oldId=t.id,depth={},oldCard=main.querySelector('.ad-test-card')?.cloneNode(true);main.querySelectorAll('[data-deck-show]').forEach(b=>depth[b.dataset.deckShow]=Number(b.style.getPropertyValue('--ad-depth')));
   selected=id;m.active=id;save(m);draw();
   if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const front=main.querySelector('.ad-test-card'),tabsEl=main.querySelector('.ad-test-tabs'),sunk=main.querySelector(`[data-deck-show="${CSS.escape(oldId)}"]`);
   if(!front?.animate)return;
   const from=depth[id]||2,ease='cubic-bezier(.3,.7,.3,1)',timing={duration:650,easing:'linear'};
   front.animate([
    {transform:fanAt(from),zIndex:0,opacity:depth[id]?1:0,easing:ease},
    {offset:.45,transform:`translateX(${-32*from-240}px) translateY(-16px) rotate(${-5*from-6}deg)`,zIndex:0,opacity:1,easing:ease},
    {offset:.46,zIndex:20,easing:ease},
    {transform:'none',zIndex:20}],timing);
   /* The old front keeps its content while it sinks, then hands over to the plain card in the fan. */
   const rest=sunk?getComputedStyle(sunk).transform:fanAt(2);
   if(oldCard){
    oldCard.classList.add('ad-deck-ghost');oldCard.inert=true;oldCard.setAttribute('aria-hidden','true');oldCard.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
    Object.assign(oldCard.style,{position:'absolute',left:front.offsetLeft+'px',top:front.offsetTop+'px',width:front.offsetWidth+'px',height:front.offsetHeight+'px',margin:0,transformOrigin:'bottom center',pointerEvents:'none'});
    front.before(oldCard);
    oldCard.animate([
     {transform:'none',zIndex:20,opacity:1,easing:ease},
     {offset:.45,transform:'translateX(48px) translateY(10px) rotate(4deg)',zIndex:20,opacity:1,easing:ease},
     {offset:.46,zIndex:0,easing:ease},
     {offset:.8,opacity:1,easing:ease},
     {transform:rest,zIndex:0,opacity:0}],timing).onfinish=()=>oldCard.remove();
    sunk?.animate([{opacity:0},{opacity:0,offset:.8},{opacity:1}],{duration:650});
   }
   tabsEl?.animate([{opacity:0},{opacity:0,offset:.6},{opacity:1}],{duration:650});
  };
  main.querySelectorAll('[data-deck-show]').forEach(b=>b.onclick=()=>showTest(b.dataset.deckShow,1));
  main.querySelectorAll('[data-deck-go]').forEach(b=>b.onclick=()=>{const d=Number(b.dataset.deckGo);showTest(m.tests[(at+d+count)%count].id,d);main.querySelector(`[data-deck-go="${d}"]`)?.focus()});
  main.querySelectorAll('[data-view-tab]').forEach(b=>{
   b.onclick=()=>{const x=m.tests.find(v=>v.id===b.dataset.testId),from=views[x.id]||'overview',to=b.dataset.viewTab;if(from===to)return;if(to==='preview'){persist();selected=x.id;m.active=x.id;save(m)}views[x.id]=to;turnPage(b.closest('.ad-test-item'),x,from,to);b.focus()};
   b.onkeydown=e=>{if(!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const list=[...b.parentElement.querySelectorAll('[data-view-tab]')],n=(list.indexOf(b)+(e.key==='ArrowDown'?1:-1)+list.length)%list.length;list[n].click()};
  });
  /* 18 Nov: the review confirmation moved to step 4/4 Finalize, so step 2 no longer asks for it. */
  reviewed.checked=true;reviewed.closest('label').hidden=true;
  syncDelivery();

  /* After a full redraw, Items pages and Learner preview need their JS again. */
  m.tests.forEach(x=>{const v=views[x.id],item=main.querySelector(`.ad-test-item[data-test="${CSS.escape(x.id)}"]`);if(item&&(v==='items'||v==='preview'))fill(item,x,v)});
  main.querySelectorAll('[data-edit-details]').forEach(b=>b.onclick=()=>{
   const x=m.tests.find(v=>v.id===b.dataset.editDetails),d=detailsFor(x),first=m.tests.indexOf(x)===0,view=views[x.id]||'overview';
   selected=x.id;m.active=x.id;
   if(view==='items'){persist();save(m);location.href=x.page||'CAP-T05-Questions.dc.html';return}
   /* Delete test (20 Nov): only offered when the assessment has another test, so it never ends up empty. */
   const onDelete=m.tests.length>1?()=>{m.tests=m.tests.filter(v=>v!==x);delete views[x.id];delete previewState[x.id];delete itemPage[x.id];
     if(m.active===x.id)m.active=m.tests[0].id;selected=m.active;persist();draw();main.querySelector('.ad-card-edit:not([hidden]),.ad-test-tab[aria-selected="true"]')?.focus()}:null;
   openSetup(b,{heading:view==='settings'?'Edit settings':'Edit test details',submitLabel:'Save changes',showAssessmentTitle:true,expandSettings:view==='settings',onDelete,
    initial:{title:m.title,testName:x.title,grade:String(x.grade||'5'),subject:x.subject||'Mathematics',standard:(d.standards||[])[0]||x.standard||'',pathway:x.pathway,
     duration:minutesOf(d.duration)||'',description:d.description||'',resource:d.resource||'',notes:d.notes||'',assessmentSettings:m.settings},
    onSubmit(details,api){
     if(details.title)m.title=details.title;x.title=details.testName||x.title;x.grade=details.grade;x.subject=details.subject;x.standard=details.standard;x.pathway=details.pathway;x.duration=details.duration;
     d.description=details.description;d.resource=details.resource;d.notes=details.notes;d.duration=Number(details.duration)>0?details.duration+' minutes':'None';
     d.standards=details.standard?[details.standard]:[];d.showResources=Boolean(details.resource||details.notes);
     m.settings={...(m.settings||{}),...details.assessmentSettings};
     sessionStorage.setItem('capCreateConfirmed:'+x.id,api.signature({...details,title:first?m.title:x.title}));
     persist();draw();main.querySelector(`[data-edit-details="${x.id}"]`)?.focus();
    }});
  });
  /* Add another test: the same setup modal names the new test (default "New test"); Continue adds it to this
     assessment and opens step 1/4 so its items can be added. It is the same modal as Create from scratch. */
  addBtn.onclick=e=>openSetup(e.currentTarget,{
   initial:{title:m.title,testName:'New test',grade:String(t.grade||'5'),subject:t.subject||'Mathematics',standard:t.standard||'',assessmentSettings:m.settings},
   onSubmit({assessmentSettings,...details},api){
    if(assessmentSettings)m.settings={...(m.settings||{}),...assessmentSettings};
    const id='test-'+Date.now(),itemsPage=api.itemPage(details);
    const test={id,...details,title:details.testName||'New test',page:itemsPage,state:{chosen:[],written:{},edits:{}},questions:[]};
    m.tests.push(test);m.active=id;save(m);
    sessionStorage.setItem('capCreateConfirmed:'+id,api.signature({...details,title:test.title}));
    location.href=itemsPage;
   }});
 }

 /* Bank for reuse: the button itself becomes a green "Assessment banked" with a check. No status line under it. */
 const bankButton=tools.querySelector('[data-bank]'),checkIcon=svg('<path d="M20 6 9 17l-5-5"/>');
 const paintBanked=()=>{bankButton.disabled=false;bankButton.dataset.banked='1';bankButton.classList.add('ad-banked');bankButton.title='Click to remove it from your banked assessments';bankButton.innerHTML=checkIcon+'Assessment banked';document.getElementById('ef-bank-status')?.remove()};
 const paintUnbanked=()=>{bankButton.disabled=false;delete bankButton.dataset.banked;bankButton.classList.remove('ad-banked');bankButton.title='Save this assessment for reuse';bankButton.textContent='Bank for reuse';document.getElementById('ef-bank-status')?.remove()};
 const bankedId=()=>'assessment-'+m.tests.map(x=>x.id).join('-')+'-banked';
 try{if(JSON.parse(localStorage.getItem('cogniaAssessmentArchiveV1')||'[]').some(e=>e.id===bankedId()))paintBanked()}catch{}
 bankButton.addEventListener('click',e=>{if(bankButton.dataset.banked){e.stopPropagation();try{const archive=JSON.parse(localStorage.getItem('cogniaAssessmentArchiveV1')||'[]');localStorage.setItem('cogniaAssessmentArchiveV1',JSON.stringify(archive.filter(x=>x.id!==bankedId())));const work=JSON.parse(localStorage.getItem('cogniaAssessmentWork')||'{}');delete work.banked;localStorage.setItem('cogniaAssessmentWork',JSON.stringify(work))}catch{}paintUnbanked();return}host.rjPersist?.();setTimeout(()=>{if(!e.defaultPrevented)paintBanked()})});
 draw();page.addEventListener('click',e=>{if(e.target.closest('a'))host.rjPersist?.()},true);
};
window.capReferenceAssign=page=>{
 page.classList.add('rj-assign');const hero=page.querySelector('.tf-hero');hero.querySelector('h1').textContent='Choose who gets it';hero.querySelector('p').textContent='Pick a class, select students, and set up one or more sessions.';const journey=document.createElement('section');journey.className='ra-journey';journey.setAttribute('aria-label','Assignment journey');journey.innerHTML='<h2>Journey</h2><nav class="ra-progress" aria-label="Assessment progress"><a href="CAP-T05-Questions.dc.html" class="done"><span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Create</a><i aria-hidden="true"></i><a href="CAP-T08-AudienceDelivery.dc.html" class="active" aria-current="step"><span>2</span>Assign</a><i aria-hidden="true"></i><a href="CAP-T09-ConfirmAssignment.dc.html"><span>3</span>Review</a></nav>';const assignProgress=journey.querySelector('.ra-progress');assignProgress.classList.add('tf-steps');assignProgress.setAttribute('aria-label','Assessment progress');hero.querySelector('.tf-steps')?.remove();hero.append(assignProgress);page.querySelector('.tf-top')?.remove();const back=page.querySelector('.tf-bottom .actionbar>a:first-child');if(back){back.textContent='Back';back.setAttribute('aria-label','Back to test details')}const form=page.querySelector('#deliveryForm'),left=form.querySelector('.reviewgrid>.formcard'),right=form.querySelector('.reviewgrid>.formcard:nth-child(2)'),cls=left.querySelector('#classId'),roster=left.querySelector('.roster-list');
 const tabs=document.createElement('div');tabs.className='rj-audience-tabs';tabs.innerHTML='<button type="button" aria-pressed="true" data-audience="classes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Classes</button><button type="button" aria-pressed="false" data-audience="students"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg> Students</button>';left.querySelector('h2').after(tabs);
 cls.closest('.field').classList.add('rj-native-class');const tools=document.createElement('div');tools.className='rj-audience-search';tools.innerHTML='<div class="search search-md" role="search"><svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg><input class="input search-input" type="search" aria-label="Search classes or students" placeholder="Search classes or students" autocomplete="off"><span class="tooltip-wrap search-clear"><button class="btn btn-ghost btn-icon btn-sm" type="button" aria-label="Clear search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button><span class="tooltip" role="tooltip">Clear search</span></span></div><select class="select" aria-label="Filter classes by year"><option>Year 5</option></select>';tabs.after(tools);
 const classes=document.createElement('div');classes.className='rj-class-list';tools.after(classes);
 const classField=cls.closest('.field');classField.classList.remove('rj-native-class');classField.classList.add('rj-select-class');classField.querySelector('label').textContent='Select class';left.prepend(classField);
 const classControl=document.createElement('div');classControl.className='rj-class-select-control';cls.before(classControl);classControl.append(cls);classControl.insertAdjacentHTML('afterbegin','<svg class="rj-class-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>');
 tools.querySelector('select').remove();tools.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>');tabs.remove();roster.querySelectorAll('small').forEach(pill=>pill.remove());const selectorRow=document.createElement('div');selectorRow.className='rj-recipient-toolbar';left.prepend(selectorRow);selectorRow.append(classField,tools);const recipient=left.querySelector('#recipientPanel');recipient?.querySelector('[name=accommodations]')?.closest('label')?.remove();let mode='classes',collapsed=false,showAll=true;
 function draw(){classes.innerHTML=[...cls.options].map(o=>`<section class="rj-class ${cls.value===o.value?'selected':''}"><div class="rj-class-heading"><input type="checkbox" data-select-class="${o.value}" aria-label="Select ${o.text}" ${cls.value===o.value&&[...roster.querySelectorAll('input:checked')].some(e=>!e.closest('label').hidden)?'checked':''}><button type="button" data-open-class="${o.value}" aria-expanded="${cls.value===o.value&&!collapsed}"><b>${o.text}</b><span>${o.value==='5b'?4:6} students</span><small>${cls.value===o.value?[...roster.querySelectorAll('input:checked')].filter(e=>!e.closest('label').hidden).length:0} selected</small><i>${cls.value===o.value?'<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>':'<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>'}</i></button></div><div class="rj-class-roster" data-roster-for="${o.value}"></div></section>`).join('');if(mode==='classes'){classes.hidden=false;classes.querySelector('[data-roster-for="'+cls.value+'"]').append(roster);roster.hidden=collapsed}else{classes.hidden=true;roster.hidden=false;tools.after(roster)};
 classes.querySelectorAll('[data-open-class]').forEach(b=>b.onclick=()=>{if(cls.value===b.dataset.openClass){collapsed=!collapsed}else{collapsed=false;cls.value=b.dataset.openClass;cls.dispatchEvent(new Event('change',{bubbles:true}))}draw()});classes.querySelectorAll('[data-select-class]').forEach(c=>c.onchange=()=>{if(cls.value!==c.dataset.selectClass){cls.value=c.dataset.selectClass;cls.dispatchEvent(new Event('change',{bubbles:true}))}roster.querySelectorAll('input').forEach(e=>{if(!e.closest('label').hidden)e.checked=c.checked});roster.dispatchEvent(new Event('change',{bubbles:true}));draw()});classes.querySelectorAll('.rj-show-students').forEach(b=>b.remove());if(mode==='classes'&&!collapsed){const toggle=document.createElement('button');toggle.type='button';toggle.className='rj-show-students';const total=cls.value==='5b'?4:6;toggle.textContent=showAll?'Show fewer students':'Show all '+total+' students';toggle.setAttribute('aria-expanded',String(showAll));toggle.innerHTML+=' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';toggle.onclick=()=>{showAll=!showAll;draw()};classes.querySelector('[data-roster-for="'+cls.value+'"]').append(toggle)}filter();}
 function filter(){const value=tools.querySelector('input').value.toLowerCase();roster.querySelectorAll('label').forEach((l,i)=>{l.hidden=i>=(cls.value==='5b'?4:6);l.dataset.searchHidden=String(!l.textContent.toLowerCase().includes(value));l.dataset.previewHidden=String(mode==='classes'&&!showAll&&!value&&i>=(cls.value==='5b'?2:4))});classes.querySelectorAll('.rj-class').forEach(el=>el.hidden=!el.classList.contains('selected'));}
 tabs.onclick=e=>{const b=e.target.closest('[data-audience]');if(!b)return;mode=b.dataset.audience;tabs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw()};tools.querySelector('input').oninput=filter;roster.addEventListener('change',()=>{const s=classes.querySelector('.selected small');if(s)s.textContent=[...roster.querySelectorAll('input:checked')].filter(e=>!e.closest('label').hidden).length+' selected';classes.querySelector('.selected [data-select-class]').checked=[...roster.querySelectorAll('input:checked')].filter(e=>!e.closest('label').hidden).length>0;document.querySelectorAll('.rj-session-count').forEach(e=>e.textContent=[...roster.querySelectorAll('input:checked')].filter(e=>!e.closest('label').hidden).length+' students')});draw();
 const add=right.querySelector('#add-session'),head=document.createElement('div');head.className='rj-session-heading';const title=right.querySelector('h2');title.before(head);head.append(title,add);title.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>Set up sessions';add.innerHTML='<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> Add another session';right.querySelector('.session-heading').innerHTML='<p>Create one or more sessions for the selected students.</p>';right.querySelectorAll('p').forEach(p=>{if(p.textContent.startsWith('School time zone:'))p.classList.add('rj-school-timezone')});right.querySelector('.fields2')?.classList.add('rj-delivery-advanced');right.querySelector('.infobox')?.classList.add('rj-delivery-advanced');const more=document.createElement('details');more.className='rj-delivery-more';more.innerHTML='<summary>Attempts and time limit</summary>';const advanced=right.querySelector('.rj-delivery-advanced');if(advanced){advanced.before(more);more.append(advanced);advanced.classList.remove('rj-delivery-advanced')}
};
window.capReferenceSession=(box,session,index,save)=>{
 box.classList.add('rj-session');const name=box.querySelector('#session-name-'+index).closest('.field'),opens=box.querySelector('#session-opens-'+index),due=box.querySelector('#session-due-'+index),head=box.querySelector('.session-card-head');head.querySelector('b').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>Session '+(index+1);const count=document.createElement('span');count.className='rj-session-count badge badge-secondary';count.textContent=[...document.querySelectorAll('[name=recipient]:checked')].filter(e=>!e.closest('label').hidden).length+' students';head.querySelector('b').after(count);const remove=head.querySelector('.session-remove');const menu=document.createElement('details');menu.className='rj-session-menu';menu.innerHTML='<summary aria-label="Session '+(index+1)+' options"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg></summary><div><button type="button" data-session-options>Session settings</button></div>';head.append(menu);if(remove)menu.querySelector('div').append(remove);name.querySelector('label').textContent='Session name';
 const left=document.createElement('div');left.className='rj-session-main';const right=document.createElement('div');right.className='rj-session-access';box.append(left,right);left.append(name);opens.closest('.field').hidden=true;due.closest('.field').hidden=true;
 const controls=document.createElement('div');controls.className='rj-session-dates';controls.innerHTML=`<label>Date<input type="date" data-date aria-label="Session ${index+1} date" value="${session.opens.slice(0,10)}"></label><label>Start time<input type="time" data-start aria-label="Session ${index+1} start time" value="${session.opens.slice(11,16)}"></label><label>End time <small>(optional)</small><input type="time" data-end aria-label="Session ${index+1} end time" value="${session.due.slice(11,16)}"></label><p data-duration></p>`;left.append(controls);
 right.innerHTML=`<fieldset><legend>Access settings <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg></legend><label><input type="radio" name="access-${index}" value="window" ${!session.noLimit?'checked':''}><span>Available during a specific time<small>Students can start and submit within this time.</small></span></label><label><input type="radio" name="access-${index}" value="anytime" ${session.noLimit?'checked':''}><span>No time limit<small>Students can take the test at any time.</small></span></label></fieldset><label class="tf-field"><span>Session instructions <small>(optional)</small></span><textarea class="textarea" maxlength="500" rows="3" aria-label="Session ${index+1} instructions"></textarea></label>`;
 if(index>0){const audience=document.createElement('fieldset');audience.className='rj-session-audience';audience.innerHTML='<legend>Students</legend><label><input type="radio" name="session-audience-'+index+'" value="same" '+(!session.customRecipients?'checked':'')+'><span>Same students as Session 1<small>Use the selected students.</small></span></label><label><input type="radio" name="session-audience-'+index+'" value="custom" '+(session.customRecipients?'checked':'')+'><span>Choose different students<small>Select individual students for this session.</small></span></label><div class="rj-session-recipient-list"></div>';right.prepend(audience);const list=audience.querySelector('div'),recipients=[...document.querySelectorAll('[name=recipient]')].filter(e=>!e.closest('label').hidden);list.innerHTML=recipients.map(e=>'<label><input type="checkbox" value="'+e.value+'" '+((session.recipients||[]).includes(e.value)?'checked':'')+'><span>'+e.closest('label').querySelector('span').textContent+'</span></label>').join('');list.hidden=!session.customRecipients;audience.querySelectorAll('input[type=radio]').forEach(e=>e.onchange=()=>{session.customRecipients=e.value==='custom';list.hidden=!session.customRecipients;save()});list.onchange=()=>{session.recipients=[...list.querySelectorAll('input:checked')].map(e=>e.value);count.textContent=session.recipients.length+' students';save()};if(session.customRecipients)count.textContent=(session.recipients||[]).length+' students';}
 right.querySelector('textarea').value=session.instructions||'';right.querySelector('textarea').oninput=e=>{session.instructions=e.target.value;save()};
 const counter=document.createElement('small');counter.className='rj-instruction-count';const note=right.querySelector('textarea');counter.textContent=note.value.length+'/500';note.after(counter);note.addEventListener('input',()=>counter.textContent=note.value.length+'/500');if(index>0){const advanced=document.createElement('details');advanced.className='rj-session-extra';advanced.innerHTML='<summary>Access settings and instructions</summary>';const accessPanel=right.querySelector('fieldset:not(.rj-session-audience)'),instruction=note.closest('.tf-field');right.append(advanced);advanced.append(accessPanel,instruction)}
 function sync(){const date=controls.querySelector('[data-date]').value,start=controls.querySelector('[data-start]').value,end=controls.querySelector('[data-end]').value;session.opens=date+'T'+start;session.due=date+'T'+(end||'23:59');opens.value=session.opens;due.value=session.due;save();duration()}
 function duration(){const mins=(new Date(session.due)-new Date(session.opens))/60000;const text=mins>0?(mins>=60?Math.floor(mins/60)+' hour'+(mins>=120?'s':'')+(mins%60?' '+mins%60+' minutes':''):mins+' minutes'):'—';controls.querySelector('[data-duration]').innerHTML='<span>Duration</span><strong>'+text+'</strong>';}

 function access(){opens.disabled=due.disabled=!!session.noLimit;controls.querySelectorAll('input').forEach(e=>e.disabled=!!session.noLimit);controls.hidden=!!session.noLimit}
 const sessionOptions=document.createElement('details');sessionOptions.className='rj-session-options';sessionOptions.innerHTML='<summary>Access settings and instructions</summary>';box.append(sessionOptions);sessionOptions.append(right);menu.querySelector('[data-session-options]').onclick=()=>{menu.open=false;sessionOptions.open=true;sessionOptions.querySelector('summary').focus()};
 controls.querySelectorAll('input').forEach(e=>e.oninput=sync);right.querySelectorAll('[name="access-'+index+'"]').forEach(e=>e.onchange=()=>{session.noLimit=e.value==='anytime';save();access()});duration();access();
};



window.capReferenceFinish=page=>{if(location.search.includes('stage=details')){const bar=page.querySelector('.actionbar'),next=bar?.querySelector('.solid');if(next&&!page.querySelector('[data-bank]')){const bank=document.createElement('button');bank.type='button';bank.className='btn ghost btn-ghost btn-lg';bank.dataset.bank='';bank.textContent='Bank assessment';next.before(bank);}}const approvals=page.querySelector('#client-item-review');if(location.search.includes('stage=details')){approvals?.remove();page.querySelector('.rj-approval-disclosure')?.remove();return;}if(approvals){const disclosure=document.createElement('details');disclosure.className='rj-approval-disclosure';const ready=approvals.textContent.includes('All items are ready');disclosure.innerHTML='<summary>Item review <span>'+ (ready?'All items ready':'Review required')+'</span></summary>';disclosure.open=!ready;approvals.before(disclosure);disclosure.append(approvals)}};
/* Learner preview (12 Nov): step 2's "Learner preview" plays the test the way a learner sees it in the
   student flow: progress segments, one question card at a time, A to D options with a tick, round
   previous and next arrows, and a finish card. Answers live only in this dialog and are never saved. */
window.capLearnerPreview=(t,{host,state,onClose}={})=>{
 const inline=!!host;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const svg=d=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
 const icon={x:svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),prev:svg('<path d="m15 18-6-6 6-6"/>'),next:svg('<path d="m9 18 6-6-6-6"/>'),tick:svg('<path d="M20 6 9 17l-5-5"/>'),flag:svg('<path d="M20 6 9 17l-5-5"/>'),expand:svg('<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/>'),back:svg('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'),fwd:svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),again:svg('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />')};
 const qs=(t.questions||[]).filter(q=>q&&q.stem),n=qs.length;
 /* state is shared between the in-card preview and its expanded full view, so expanding keeps the question and answers. */
 const st=state||{at:0,answers:null};if(!Array.isArray(st.answers)||st.answers.length!==n){st.answers=qs.map(()=>null);st.at=0}
 const answers=st.answers;
 const isChoice=q=>(q.options||[]).length>0;
 const isLong=q=>/extended/i.test(q.displayType||q.type||'');
 let at=Math.min(st.at||0,n),dir=1;
 const dialog=document.createElement(inline?'div':'dialog');
 dialog.className=inline?'lp-inline':'lp-dialog theme-assessments';
 dialog.setAttribute('aria-label','Learner preview: '+(t.title||'Test'));
 const answered=()=>answers.filter(a=>a!==null&&a!=='').length;
 const card=(q,i)=>{
  const opts=q.options||[],big=opts.length&&opts.every(o=>String(o).length<=8);
  const passage=q.passage?'<div class="lp-passage">'+(q.passTitle?'<span class="lp-passage-title">'+esc(q.passTitle)+'</span>':'')+'<p>'+esc(q.passage)+'</p></div>':'';
  const body=isChoice(q)
   ?'<div class="lp-opts" role="radiogroup" aria-label="Answer options">'+opts.map((o,k)=>'<button type="button" class="lp-opt'+(answers[i]===k?' on':'')+'" role="radio" aria-checked="'+(answers[i]===k)+'" data-opt="'+k+'"><span class="lp-letter">'+String.fromCharCode(65+k)+'</span><span class="'+(big?'lp-big':'lp-opt-text')+'">'+esc(o)+'</span><span class="lp-tick">'+icon.tick+'</span></button>').join('')+'</div>'
   :isLong(q)
    ?'<div class="lp-panel field"><label class="label" for="lp-answer">Your answer</label><textarea class="textarea" id="lp-answer" rows="6" placeholder="Type your answer">'+esc(answers[i]||'')+'</textarea></div>'
    :'<div class="lp-panel field"><label class="label" for="lp-answer">Your answer</label><input class="input" id="lp-answer" type="text" autocomplete="off" placeholder="Type your answer" value="'+esc(answers[i]||'')+'"></div>';
  return '<article class="lp-card lp-in-'+(dir>0?'next':'prev')+'" aria-roledescription="question" aria-label="Question '+(i+1)+' of '+n+'"><div class="lp-body"><p class="lp-num">Question '+(i+1)+'/'+n+'</p><div class="lp-head">'+passage+'<h2 class="lp-stem">'+esc(q.stem)+'</h2></div><div class="lp-ans">'+body+'</div></div></article>';
 };
 const endCard=()=>{const a=answered(),all=a===n;return '<article class="lp-card lp-end lp-in-next" aria-label="End of test"><div class="lp-body lp-end-body"><span class="lp-finish">'+icon.flag+'</span><div class="lp-end-copy"><h2 class="lp-stem">'+a+' of '+n+' answered</h2><p>'+(all?'Learners would submit their answers here.':'Learners are asked to go back to the questions they missed before they submit.')+' Nothing is saved in this preview.</p></div><div class="lp-end-actions"><button type="button" class="btn btn-lg" data-restart>'+icon.again+'Start again</button>'+(inline?'':'<button type="button" class="btn btn-ghost btn-lg" data-close>Close preview</button>')+'</div></div></article>'};
 const draw=()=>{
  const end=at===n,q=qs[at];
  const ready=!end&&answers[at]!==null&&answers[at]!=='';
  dialog.innerHTML='<div class="lp-top"><div class="lp-segs" aria-hidden="true">'+qs.map((_,i)=>'<span class="lp-seg'+(i===at?' now':answers[i]!==null&&answers[i]!==''?' done':'')+'"></span>').join('')+'</div><span class="lp-count" role="status">'+answered()+'/'+n+'</span>'+(inline?'<button type="button" class="btn btn-ghost btn-icon btn-sm" data-expand aria-label="Expand learner preview" title="Expand">'+icon.expand+'</button>':'<button type="button" class="btn btn-ghost btn-icon btn-sm" data-close aria-label="Close learner preview">'+icon.x+'</button>')+'</div>'
   +'<div class="lp-stage"><span class="lp-behind lp-behind-2" aria-hidden="true"></span><span class="lp-behind lp-behind-1" aria-hidden="true"></span>'+(n?(end?endCard():card(q,at)):'<article class="lp-card"><div class="lp-body lp-end-body"><h2 class="lp-stem">No questions yet</h2><p>Add items in step 1 to preview them here.</p></div></article>')
   +(inline
    ?'<button type="button" class="btn btn-ghost lp-step prev'+(at===0||!n?' hide':'')+'" data-go="-1">'+icon.back+'Back</button>'
     +'<button type="button" class="btn btn-ghost lp-step next'+(end||!n?' hide':'')+'" data-go="1">'+(at===n-1?'Finish':'Next')+icon.fwd+'</button></div>'
    :'<button type="button" class="lp-arrow prev'+(at===0?' hide':'')+'" data-go="-1" aria-label="Previous question">'+icon.prev+'</button>'
     +'<button type="button" class="lp-arrow next'+(end||!n?' hide':'')+(ready?' ready':'')+'" data-go="1" aria-label="'+(at===n-1?'Finish':'Next question')+'">'+icon.next+'</button></div>');
  st.at=at;if(inline)fit();
  const field=dialog.querySelector('#lp-answer');
  if(field)field.addEventListener('input',()=>{answers[at]=field.value;const r=field.value.trim()!=='';dialog.querySelector('.lp-arrow.next')?.classList.toggle('ready',r);dialog.querySelector('.lp-count').textContent=answered()+'/'+n});
 };
 /* In the card the question is scaled down until it fits, so nothing scrolls. Expand shows it full size. */
 function fit(){const body=dialog.querySelector('.lp-card .lp-body');if(!body||!dialog.isConnected)return;const parts=[...body.children];parts.forEach(e=>e.style.zoom='');
  for(let i=0;i<3;i++){const need=body.scrollHeight,room=body.clientHeight;if(need<=room+1)break;const z=Math.max(.5,(parseFloat(parts[0].style.zoom)||1)*room/need);parts.forEach(e=>e.style.zoom=z.toFixed(3))}}
 const go=d=>{const next=Math.max(0,Math.min(n,at+d));if(next===at)return;dir=d;at=next;draw();dialog.querySelector('.lp-arrow:not(.hide),.lp-step:not(.hide)')?.focus({preventScroll:true})};
 const close=()=>{dialog.close();dialog.remove();onClose?.()};
 dialog.addEventListener('click',e=>{
  const opt=e.target.closest('[data-opt]');
  if(opt){answers[at]=+opt.dataset.opt;dialog.querySelectorAll('.lp-opt').forEach(b=>{const on=b===opt;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});dialog.querySelector('.lp-arrow.next')?.classList.add('ready');dialog.querySelector('.lp-count').textContent=answered()+'/'+n;return}
  const step=e.target.closest('[data-go]');if(step){go(+step.dataset.go);return}
  if(e.target.closest('[data-restart]')){answers.fill(null);dir=-1;at=0;draw();return}
  if(e.target.closest('[data-expand]')){window.capLearnerPreview(t,{state:st,onClose:()=>{if(host.isConnected&&dialog.isConnected)window.capLearnerPreview(t,{host,state:st})}});return}
  if(e.target.closest('[data-close]'))close();
 });
 dialog.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1)});
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 if(inline){host.replaceChildren(dialog);draw();return}draw();document.body.append(dialog);dialog.showModal();
};
