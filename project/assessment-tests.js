document.addEventListener('DOMContentLoaded',()=>{
 const storageKey='cogniaAssessmentTestsV1',page=location.pathname.split('/').pop();
 const isQuestions=/CAP-T05-/.test(page),isSetup=page==='CAP-T04-Setup.dc.html',isReview=page==='CAP-T06-Review.dc.html';
 let model;try{model=JSON.parse(localStorage.getItem(storageKey));}catch{}
 if(!model?.tests?.length)model={title:'Fractions check',active:'test-1',tests:[{id:'test-1',title:'Fractions check',grade:'5',subject:'Mathematics',standard:'5.NF.A.1',page:'CAP-T05-Questions.dc.html',state:null,questions:null}]};
 const persist=()=>{if(page==='CAP-T10-Scheduled.dc.html')return;localStorage.setItem(storageKey,JSON.stringify(model));try{const legacy=JSON.parse(localStorage.getItem('cogniaAssessmentWork'))||{};legacy.tests=model.tests.length;localStorage.setItem('cogniaAssessmentWork',JSON.stringify(legacy));}catch{}};
 if(page==='CAP-T10-Scheduled.dc.html'){try{const scheduled=JSON.parse(localStorage.getItem('cogniaScheduledAssessmentTests'));if(scheduled?.tests?.length)model=scheduled;}catch{}}
 const active=()=>model.tests.find(t=>t.id===model.active)||model.tests[0];
 const count=t=>t.questions?.length??(t.state?.chosen?.length??3);
 const marks=t=>t.questions?.reduce((n,q)=>n+Number(q.marks||1),0)??count(t);
 const stats=t=>`${count(t)} ${count(t)===1?'question':'questions'} · ${marks(t)} ${marks(t)===1?'mark':'marks'}`;
 const totals=()=>({questions:model.tests.reduce((n,t)=>n+count(t),0),marks:model.tests.reduce((n,t)=>n+marks(t),0)});
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const instance=window.cogniaPreview;
 function snapshot(){if(!isQuestions||!instance?.bankItems)return;const t=active(),state=instance.state||{},bank=instance.bankItems(),ids=state.chosen??bank.slice(0,3).map(q=>q.id);t.state={chosen:ids,written:state.written||{},edits:state.edits||{}};t.questions=ids.map(id=>state.edits?.[id]||state.written?.[id]||bank.find(q=>q.id===id)).filter(Boolean);t.page=page;persist();}
 if(isQuestions&&instance){let t=active();if(t.state)Object.assign(instance.state,t.state);else if(page!=='CAP-T05-Questions.dc.html'){t.title=page.includes('Algebra')?'Algebra basics':'Reading comprehension';t.grade=page.includes('Algebra')?'8':'6';t.subject=page.includes('Algebra')?'Mathematics':'English';}snapshot();}
 function testList(readonly=false){const total=totals();return `<section class="assessment-test-list" aria-label="Tests in this assessment"><div class="test-list-heading"><div><h2>Tests in this assessment <span class="tag">${model.tests.length}</span></h2><p>${total.questions} ${total.questions===1?'question':'questions'} · ${total.marks} ${total.marks===1?'mark':'marks'} across ${model.tests.length} ${model.tests.length===1?'test':'tests'}</p></div>${readonly?'':'<a class="btn ghost" href="CAP-T04-Setup.dc.html?additionalTest=1">+ Add another test</a>'}</div><div class="test-list-items">${model.tests.map((t,i)=>`<article class="assessment-test-item ${t.id===model.active?'current':''}"><span class="test-number">${i+1}</span><div><b>${escape(t.title)}</b><p>Grade ${escape(t.grade)} · ${escape(t.subject)} · ${stats(t)}${!readonly&&t.id===model.active?' · Current test':''}</p></div>${readonly?'':`<button class="btn ghost" type="button" data-edit-test="${escape(t.id)}" aria-label="Edit ${escape(t.title)}">Edit test</button><button class="plain" type="button" data-remove-test="${escape(t.id)}" aria-label="Remove ${escape(t.title)}" ${model.tests.length===1?'disabled title="An assessment must contain at least one test"':''}>Remove</button>`}</article>`).join('')}</div><div id="test-flow-error" role="alert"></div></section>`;}
 function renderReview(){const section=document.querySelector('.reviewgrid>section');if(!section)return;const total=totals();section.innerHTML=`<h2>${escape(model.title)}</h2><div class="review-metadata"><span>${model.tests.length} ${model.tests.length===1?'test':'tests'}</span><span>${total.questions} ${total.questions===1?'question':'questions'}</span><span>${total.marks} ${total.marks===1?'mark':'marks'}</span></div>`+model.tests.map((t,i)=>`<section class="review-test-group"><div class="test-list-heading"><h3>Test ${i+1}: ${escape(t.title)}</h3><button class="btn ghost" type="button" data-edit-test="${escape(t.id)}">Edit questions</button></div><p>${stats(t)} · Grade ${escape(t.grade)}</p>${(t.questions||[]).map((q,k)=>`<div class="reviewrow"><span class="qnum">${k+1}</span><div class="grow"><h4>${escape(q.stem)}</h4><div class="qmeta">${q.marks} ${q.marks===1?'mark':'marks'} · ${escape(q.type)}</div><details class="disclosure"><summary>Answer key</summary><p>${escape(q.options?.[q.correct]??'Teacher-scored response')}</p></details></div></div>`).join('')||'<p>Open this test to review its questions.</p>'}</section>`).join('');}
 function draw(){
   const main=document.querySelector('main>.page');if(!main)return;
   main.querySelector('.assessment-test-list')?.remove();
   if(isQuestions||isReview){const target=main.querySelector(isReview?'.reviewgrid':'.stepper');if(target){const wrapper=document.createElement('div');wrapper.innerHTML=testList();target.insertAdjacentElement(isReview?'beforebegin':'afterend',wrapper.firstElementChild);}}
   if(isQuestions){main.querySelector('h1').textContent=active().title;const note=main.querySelector('.head p');if(note)note.textContent='Choose questions for this test. Other tests stay saved in this assessment.';}
   if(isReview)renderReview();
   if(/CAP-T0[89]-|CAP-T10-/.test(page)){const grid=main.querySelector('.reviewgrid')||main.querySelector('.success');if(grid){const wrapper=document.createElement('div');wrapper.innerHTML=testList(true);if(grid.classList.contains('success'))grid.querySelector('.successactions').before(wrapper.firstElementChild);else grid.insertAdjacentElement('beforebegin',wrapper.firstElementChild);}const total=totals();main.querySelectorAll('.summary-list>div').forEach(row=>{if(row.querySelector('dt')?.textContent==='Content')row.querySelector('dd').textContent=`${model.tests.length} ${model.tests.length===1?'test':'tests'} · ${total.questions} ${total.questions===1?'question':'questions'} · ${total.marks} ${total.marks===1?'mark':'marks'}`;});const info=main.querySelector('.infobox div');if(info)info.innerHTML=`<b>${escape(model.title)}</b><br>${model.tests.length} ${model.tests.length===1?'test':'tests'} · ${total.questions} ${total.questions===1?'question':'questions'} · ${total.marks} ${total.marks===1?'mark':'marks'}`;}
   document.querySelectorAll('.test-count').forEach(el=>el.textContent=`${model.tests.length} ${model.tests.length===1?'test':'tests'} in this assessment`);
 }
 if(instance){const update=instance.update;instance.update=()=>{update();snapshot();draw();};if(isQuestions)instance.update();else draw();}else draw();
 if(isSetup&&!new URLSearchParams(location.search).has('additionalTest')){const t=active();for(const [id,value] of [['title',t.title],['grade',t.grade],['subject',t.subject]]){const input=document.getElementById(id);if(input&&[...input.options||[]].some(o=>o.value===value)||input?.tagName==='INPUT')input.value=value;}}
 document.addEventListener('click',event=>{
   const edit=event.target.closest('[data-edit-test]');if(edit){snapshot();model.active=edit.dataset.editTest;persist();location.href=active().page||'CAP-T05-Questions.dc.html';return;}
   const remove=event.target.closest('[data-remove-test]');if(remove&&model.tests.length>1){snapshot();model.tests=model.tests.filter(t=>t.id!==remove.dataset.removeTest);if(!model.tests.some(t=>t.id===model.active))model.active=model.tests[0].id;persist();if(isQuestions){location.href=active().page||'CAP-T05-Questions.dc.html';}else draw();return;}
 },false);
 document.addEventListener('click',event=>{
   const link=event.target.closest('a');if(!link)return;
   if(page==='CAP-T09-ConfirmAssignment.dc.html'&&link.getAttribute('href')==='CAP-T10-Scheduled.dc.html'){localStorage.setItem('cogniaScheduledAssessmentTests',JSON.stringify(model));}
   if(isSetup&&link.id==='setupContinue'){
     event.preventDefault();event.stopImmediatePropagation();const form=document.getElementById('setupForm');if(!form.reportValidity())return;
     const extra=new URLSearchParams(location.search).has('additionalTest');let t=active();if(extra){t={id:'test-'+Date.now(),state:{chosen:[],written:{},edits:{}},questions:[],page:'CAP-T05-Questions.dc.html'};model.tests.push(t);model.active=t.id;}
     t.title=document.getElementById('title').value.trim();if(model.tests.length===1){model.title=t.title;delete t.libraryForm;model.origin='builder';}t.grade=document.getElementById('grade').value;t.subject=document.getElementById('subject').value;t.standard=form.querySelector('[name=standard]:checked')?.value||'5.NF.A.1';const targetPage=t.subject==='English'?'CAP-T05-Reading.dc.html':t.grade==='8'?'CAP-T05-Algebra.dc.html':'CAP-T05-Questions.dc.html';if(t.page!==targetPage){t.state={chosen:[],written:{},edits:{}};t.questions=[];}t.page=targetPage;persist();location.href=t.page;return;
   }
   if(isQuestions)snapshot();
   if((isQuestions&&link.getAttribute('href')==='CAP-T06-Review.dc.html')||(isReview&&link.getAttribute('href')==='CAP-T08-AudienceDelivery.dc.html')){
     const empty=model.tests.find(t=>count(t)===0);if(empty){event.preventDefault();event.stopImmediatePropagation();const error=document.getElementById('test-flow-error');error.textContent=`Add at least one question to “${empty.title}” or remove that test before continuing.`;error.scrollIntoView({block:'center'});}
   }
 },true);
 persist();
});


