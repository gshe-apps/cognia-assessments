document.addEventListener('DOMContentLoaded',()=>{
 const instance=window.cogniaPreview;if(!instance)return;
 if(localStorage.getItem('cogniaProtoPlan')==='Classroom Plus')localStorage.setItem('cogniaProtoPlan','Classroom+');
 const plus=()=> (instance.state?.plan||localStorage.getItem('cogniaProtoPlan')||'Classroom+')!=='Basic';
 const testModel=()=>{try{return JSON.parse(localStorage.getItem('cogniaAssessmentTestsV1'));}catch{return null;}};
 function apply(){
   const enabled=plus();
   document.querySelectorAll('[data-action="ai"]').forEach(button=>{button.disabled=!enabled;button.setAttribute('aria-disabled',String(!enabled));button.title=enabled?'Generate draft questions with Classroom+':'Classroom+ required';});
   const model=testModel(),test=model?.tests.find(t=>t.id===model.active);const chosen=test?.state?.chosen||['g5a1','g5a2','g5a3'];
   document.querySelectorAll('[data-action="catalogUse"]').forEach(button=>{
     const premium=/[ab][56]$/.test(button.dataset.id),added=chosen.includes(button.dataset.id),full=false;
     button.disabled=added||(!enabled&&premium)||full;
     button.textContent=added?'Added to assessment':!enabled&&premium?'Classroom+ required':full?'Test full':'Use in assessment';
     button.setAttribute('aria-disabled',String(button.disabled));
   });
   if(!enabled)document.querySelector('dialog.plan-ai-dialog')?.close();
 }
 const update=instance.update;instance.update=()=>{update();apply();};apply();
 window.addEventListener('storage',event=>{if(event.key==='cogniaProtoPlan'){instance.state.plan=localStorage.getItem('cogniaProtoPlan');instance.update();}});
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function openAI(){
   if(!plus())return;
   document.querySelector('dialog.plan-ai-dialog')?.remove();const dialog=document.createElement('dialog');dialog.className='plan-ai-dialog';
   dialog.innerHTML='<form method="dialog" class="plan-ai-top"><div><span class="tag">Classroom+</span><h2>Generate questions with AI</h2></div><button class="btn ghost" aria-label="Close AI question generator">✕</button></form><p>Describe the questions you need, review the draft answer keys, then add what fits your test.</p><p class="plan-ai-notice">Prototype preview: sample questions demonstrate this flow. No external AI service is called.</p><div class="field"><label for="ai-prompt">What would you like to assess?</label><textarea id="ai-prompt" rows="3" placeholder="For example: three questions about adding fractions with unlike denominators."></textarea></div><button class="btn solid" type="button" data-generate-samples>Generate questions</button><div class="plan-ai-results" aria-live="polite"></div><div class="plan-ai-footer"><button type="button" class="btn ghost" data-close-ai>Cancel</button><button type="button" class="btn solid" data-add-ai disabled>Add selected questions</button></div>';
   document.body.append(dialog);const returnFocus=document.activeElement;dialog.addEventListener('close',()=>{returnFocus?.focus();});dialog.querySelector('[data-close-ai]').onclick=()=>dialog.close();
   let drafts=[];
   dialog.querySelector('[data-generate-samples]').onclick=()=>{
     const prompt=dialog.querySelector('textarea');if(!prompt.value.trim()){prompt.setCustomValidity('Describe the questions you need.');prompt.reportValidity();return;}prompt.setCustomValidity('');
     const title=document.querySelector('main h1')?.textContent||'';
     drafts=/algebra/i.test(title)?[
       ['Solve: x + 6 = 14.',['8','6','14','20'],0],['Simplify: 4x + 3x.',['7x','12x','x','7'],0],['Solve: 3x = 21.',['7','18','24','63'],0]
     ]:/reading/i.test(title)?[
       ['Read: “Mina practised every day. At last, she finished the race.” Which detail shows persistence?',['She practised every day.','Her name is Mina.','The race ended.','She wore shoes.'],0],
       ['In “The child was delighted by the surprise”, what does delighted mean?',['Very pleased','Worried','Confused','Sleepy'],0]
     ]:[['Find the sum: 1/2 + 1/3.',['2/5','5/6','1/6','3/5'],1],['Find the difference: 3/4 − 1/6.',['2/2','7/12','2/10','5/12'],1],['Which fraction is equivalent to 2/3?',['4/6','2/6','3/4','4/9'],0]];
     const results=dialog.querySelector('.plan-ai-results');results.innerHTML='<h3>Review draft questions</h3>'+drafts.map(([stem,options,correct],i)=>`<article><label><input type="checkbox" data-ai-choice="${i}" checked> <b>${escape(stem)}</b></label><p>${options.map((o,k)=>'ABCD'[k]+'. '+escape(o)).join(' · ')}</p><details><summary>Answer key</summary>${escape(options[correct])}</details></article>`).join('');dialog.querySelector('[data-add-ai]').disabled=false;
   };
   dialog.querySelector('textarea').addEventListener('input',event=>event.target.setCustomValidity(''));
   dialog.querySelector('[data-add-ai]').onclick=()=>{
     if(!plus())return;const indexes=[...dialog.querySelectorAll('[data-ai-choice]:checked')].map(el=>Number(el.dataset.aiChoice));if(!indexes.length)return;
     const state=instance.state||{},bank=instance.bankItems?.()||[],chosen=state.chosen??bank.slice(0,3).map(q=>q.id);
     const written={...state.written},ids=[];indexes.forEach((i,k)=>{const id='ai-'+Date.now()+'-'+k,[stem,options,correct]=drafts[i];written[id]={id,stem,options,correct,marks:1,type:'Multiple choice',source:'AI draft'};ids.push(id);});
     instance.setState({written,chosen:chosen.concat(ids)});dialog.close();
   };
   dialog.showModal();dialog.querySelector('textarea').focus();
 }
 document.addEventListener('click',event=>{
   if(event.target.closest('[data-action="ai"]')){event.preventDefault();event.stopImmediatePropagation();openAI();}
 },true);
 document.addEventListener('click',event=>{
   const use=event.target.closest('[data-action="catalogUse"]');if(use&&!use.disabled){
     const model=testModel();if(!model)return;const test=model.tests.find(t=>t.id===model.active)||model.tests[0],id=use.dataset.id,premium=/[ab][56]$/.test(id);if(premium&&!plus())return;
     const row=use.closest('.listline'),description=row.querySelector('p')?.textContent||'',stem=row.querySelector('b')?.textContent||'Library question';
     const q={id,stem,type:/Extended text/.test(description)?'Extended text':/Text entry/.test(description)?'Text entry':'Multiple choice',marks:Number(description.match(/(\d+) marks?/)?.[1]||1),options:[],correct:null,source:'Library'};
     test.state||={chosen:['g5a1','g5a2','g5a3'],written:{},edits:{}};test.state.written||={};if(!test.state.chosen.includes(id)){test.state.chosen.push(id);test.state.written[id]=q;test.questions||=[];test.questions.push(q);}localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(model));apply();
   }
 });
});

