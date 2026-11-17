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
  document.querySelectorAll('.uc-page .question-card').forEach(row=>{let tags=row.querySelector('.uc-bank-tags');if(!tags){tags=document.createElement('div');tags.className='uc-bank-tags';row.append(tags)}const type=row.querySelector('.row > .tiny');if(type){type.className='tiny text-body-small text-muted-foreground';type.textContent=({'Choice':'Multiple choice','Text entry':'Short answer','Extended text':'Extended response'}[type.textContent.trim()]||type.textContent.trim());tags.append(type)}if(!tags.querySelector('.bank-row-difficulty')){const badge=make('<span class="bank-row-difficulty badge badge-'+({'1':'success','2':'warning','3':'destructive'}[row.dataset.bankDok]||'secondary')+'"></span>');badge.textContent='DOK '+row.dataset.bankDok;tags.append(badge)}});
  const page=document.querySelector('main>.page'),methods=page?.querySelector('.qc-methods');if(!methods||page.querySelector('.uc-setup-intro'))return;
  observer.disconnect();page.classList.add('uc-page');document.body.classList.add('unified-create-screen');document.body.classList.remove('cap-monochrome');
  const m=read(),t=m?.tests?.find(t=>t.id===m.active)||m?.tests?.[0];if(!t){observe();return;}
  const scopePage=t.subject==='English'?'CAP-T05-Reading.dc.html':t.grade==='8'?'CAP-T05-Algebra.dc.html':'CAP-T05-Questions.dc.html';
  if(scopePage!==location.pathname.split('/').pop()){
   t.state||={chosen:[],written:{},edits:{}};t.state.written={...t.state.written,...Object.fromEntries((t.questions||[]).map(q=>[q.id,q]))};t.page=scopePage;localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(m));location.replace(scopePage);return;
  }
  const hero=page.querySelector('.tf-hero');hero.querySelector('h1').textContent='Create your test';hero.querySelector('p')?.remove();const intro=make('<div class="uc-setup-intro"><span class="uc-eyebrow">Create test</span><h1>Set up your test</h1></div>');hero.querySelector('h1').replaceWith(intro);
  page.querySelector('.tf-back')?.remove();
  page.querySelector('.tf-steps a').href=t.page;
  hero.append(page.querySelector('.tf-steps'));page.querySelector('.tf-top')?.remove();
  const icon=(path)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  const layers=icon('<path d="m12 3 10 5-10 5L2 8Zm-10 10 10 5 10-5M2 18l10 5 10-5"/>');
  const progress=hero.querySelector('.tf-steps');
  window.capRenderAssessmentProgress(progress,1,[
   'href="#uc-assessment-details" data-uc-details','href="#uc-question-methods"',
   'href="CAP-T06-Review.dc.html?stage=details" data-uc-review','data-uc-later-step','data-uc-later-step'
  ]);
  methods.id='uc-question-methods';
  const {create,itemPage,libraryPath,signature}=window.capAssessmentSetup;
  const readyKey='capCreateConfirmed:'+t.id;
  const useClientSample=sessionStorage.getItem('capSetupUseClientSample')==='true';
  sessionStorage.removeItem('capSetupUseClientSample');
  const addedTest=m.tests.indexOf(t)>0;
  let settings=useClientSample?{...t,title:'New classroom test',standard:'5.NF.A.2'}:addedTest?t:{...t,title:m.title||t.title};
  let ready=sessionStorage.getItem(readyKey)===signature(settings);
  const setup=create({
   host:page.closest('.theme-assessments'),
   initial:settings,
   onClose:()=>{
    if(!ready){location.href='CAP-T03-Assessments.dc.html';return}
    hero.querySelector('[data-uc-details]').focus();
   },
   onSubmit(next){
   const {title:nextTitle,...scope}=next;
   const model=window.capUpdateAssessmentScope(addedTest?next:scope,addedTest?'':nextTitle);
   const updated=model.tests.find(test=>test.id===model.active)||model.tests[0];
   settings=addedTest?updated:{...updated,title:model.title};
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
  hero.querySelector('[data-uc-details]').onclick=e=>{e.preventDefault();openSetup()};
  const notice=make('<p class="uc-gate-notice" role="status">Complete test details to add items.</p>');methods.before(notice);
  function syncGate(){
   methods.inert=!ready;page.querySelector('.buildergrid').inert=!ready;
   methods.setAttribute('aria-disabled',String(!ready));page.querySelector('.buildergrid').setAttribute('aria-disabled',String(!ready));
   methods.querySelectorAll('button').forEach(button=>button.disabled=!ready);
   notice.hidden=ready;page.classList.toggle('uc-locked',!ready);
   hero.querySelector('h1').textContent=ready?'Add your items':'Create your test';
   hero.querySelectorAll('.tf-steps a').forEach((link,i)=>{
    link.classList.toggle('active',i===(ready?1:0));
    link.classList.toggle('done',ready&&i===0);
    link.setAttribute('aria-current',i===(ready?1:0)?'step':'false');
   });
   return ready;
  }
  window.capSyncCreationGate=syncGate;
  syncGate();
  if(!ready)openSetup();
  methods.className='qc-methods tabs-list';
  methods.querySelectorAll('[data-qc-method]').forEach(button=>{
   button.className='tab';
   const manual=button.dataset.qcMethod==='manual';
   button.replaceChildren(document.createTextNode(manual?'Create manually':'Use item banks'));
  });
  /* Reuse the runtime's existing multiple-choice form and validation. The old
     conditional drawer is detached by the legacy page composition. */
  const inst=window.cogniaPreview;
  /* Create manually: the item form sits in the left panel (no modal). It reuses the runtime's
     multiple-choice validation through openWrite/saveWrite. */
  /* Create manually: the AI-assisted item form (Figma 1568:8754) sits in the left panel and the right
     panel swaps to Item analysis or Learner supports. It saves through the runtime's openWrite/saveWrite. */
  const manualPanel=page.querySelector('.qc-manual');
  window.capItemQuality?.mount(manualPanel,{settings,inst});
  page.querySelector('.ef-decision-note')?.remove();
  const library=page.querySelector('.library');
  const toolbar=make('<div class="uc-bank-toolbar"></div>'),search=library.querySelector('#search'),type=library.querySelector('#typeFilter');
  const searchBox=make('<div class="search search-md uc-search-control" role="search"><svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></div>');const oldSearch=search.closest('.field');const searchClear=search.parentElement.querySelector('.search-clear');search.placeholder='Search items';search.setAttribute('aria-label','Search items');search.classList.add('input','search-input');searchBox.append(search);if(searchClear)searchBox.append(searchClear);toolbar.append(searchBox);oldSearch?.remove();library.querySelectorAll('.search').forEach(el=>{if(!el.querySelector('input'))el.remove()});
  const dok=library.querySelector('#bankDok')||make('<select id="bankDok" aria-label="Filter by DOK"><option value="">DOK</option><option>DOK 1</option><option>DOK 2</option><option>DOK 3</option></select>');
  toolbar.append(dok);type.setAttribute('aria-label','All types');toolbar.append(type);
  toolbar.querySelectorAll('select').forEach(select=>{
   const control=make('<div class="uc-bank-select-control select-wrap"></div>');
   select.classList.add('select');
   select.before(control);
   control.append(select);
  });
  library.querySelector('.approved-bank-heading')?.after(toolbar);if(!toolbar.isConnected)library.prepend(toolbar);
  /* 17 Nov: Use item banks starts by asking which item banks to use (tick one or more, then Next). After that the
     chosen banks show above the items as filter chips (remove one, or Add item bank to open the bank picker), and
     the list shows only their items. The old switcher heading is gone. Prototype only: Cognia banks hold the Cognia
     rows, My banks the educator-created rows, and a grade bank keeps the items whose standard starts with that grade. */
  const picker=window.capBankPicker;
  if(picker&&!library.querySelector('.uc-bank-chips')){
   const BANK_KEY='cogniaBuilderBanksV1',PICKED_KEY='cogniaBuilderBanksPickedV1:'+t.id,rowKey={cognia:'cognia',mine:'teacher',specialist:'specialist'};
   let chosen=[];
   try{const saved=JSON.parse(sessionStorage.getItem(BANK_KEY)||'null');if(Array.isArray(saved))chosen=saved.filter(id=>picker.banks.some(b=>b.id===id))}catch(e){}
   let picked=false;try{picked=sessionStorage.getItem(PICKED_KEY)==='1'}catch(e){}
   if((t.state?.chosen||[]).length&&chosen.length)picked=true;
   if(!chosen.length)picked=false;
   const gradeOf=b=>{const m=(b.match||[]).join(' ').match(/Grade (\d)/g);return m?m.map(x=>x.slice(6)):null};
   const inBank=(b,row)=>{if(row.dataset.itemBank!==rowKey[b.group])return false;const grades=gradeOf(b);if(!grades)return true;const std=row.dataset.bankStandard||'';return grades.some(g=>std.startsWith(g+'.')||std.includes('.'+g+'.'))};
   const bankRows=()=>[...document.querySelectorAll('#libraryList .question-card')];
   const countFor=b=>bankRows().filter(row=>inBank(b,row)).length;
   const plural=n=>n+(n===1?' item':' items');
   window.capBuilderBankMatch=row=>chosen.some(id=>{const b=picker.banks.find(x=>x.id===id);return b&&inBank(b,row)});
   window.capBankNameForRow=row=>{const b=chosen.map(id=>picker.banks.find(x=>x.id===id)).find(b=>b&&inBank(b,row));return b?b.name:''};
   const save=()=>{try{sessionStorage.setItem(BANK_KEY,JSON.stringify(chosen));sessionStorage.setItem(PICKED_KEY,picked?'1':'0')}catch(e){}};
   const xIcon=icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),checkIcon='<svg class="ib-bank-picked" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="var(--success)" stroke="var(--success)"/><path d="m9 12 2 2 4-4" stroke="var(--primary-foreground)"/></svg>';
   /* Step A, 17 Nov: choosing banks takes the full width (Build your test stays hidden until banks are chosen) and is
      built for hundreds of banks: a search, a group filter, and a table with a checkbox per bank. The selected count
      and Next sit at the top so they never scroll away. */
   let bankTerm='',bankGroups=picker.groups.map(g=>g[0]),bankSort='name',bankDir='ascending';
   const chooser=make('<section class="uc-bank-chooser" aria-label="Choose item banks"><p class="field-error" data-bank-choose-error role="alert" hidden>Choose at least one item bank.</p><div class="uc-bank-chooser-tools"><div class="search search-md" role="search">'+icon('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>').replace('<svg','<svg class="search-icon"')+'<input class="input search-input" type="search" placeholder="Search item banks" aria-label="Search item banks" autocomplete="off" data-bank-filter-term></div><div class="popover-wrap popover-end combobox uc-bank-types"><button type="button" class="select uc-bank-types-trigger" aria-haspopup="dialog" aria-expanded="false" aria-label="Bank types: All banks"><span class="combobox-value" data-bank-types-label>All banks</span>'+icon('<path d="m6 9 6 6 6-6"/>')+'</button><div class="popover" role="dialog" aria-label="Bank types" hidden><div class="uc-bank-types-list"><label class="check uc-bank-type-option"><input type="checkbox" class="checkbox" data-bank-filter-all checked>All banks</label>'+picker.groups.map(([g,n])=>'<label class="check uc-bank-type-option"><input type="checkbox" class="checkbox" data-bank-filter-group="'+g+'" checked>'+esc(n)+'</label>').join('')+'</div></div></div></div><div class="table-wrap"><table class="table uc-bank-table"><thead><tr><th scope="col"><span class="sr-only">Select</span></th><th scope="col" aria-sort="ascending" data-bank-sort="name"><button class="table-sort" type="button">Item bank<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="sort-up" d="m7 9 5-5 5 5"/><path class="sort-down" d="m7 15 5 5 5-5"/></svg></button></th><th scope="col" aria-sort="none" data-bank-sort="type"><button class="table-sort" type="button">Type<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="sort-up" d="m7 9 5-5 5 5"/><path class="sort-down" d="m7 15 5 5 5-5"/></svg></button></th><th scope="col" class="num" aria-sort="none" data-bank-sort="items"><button class="table-sort" type="button">Items<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="sort-up" d="m7 9 5-5 5 5"/><path class="sort-down" d="m7 15 5 5 5-5"/></svg></button></th></tr></thead><tbody></tbody></table></div><div class="empty-state" data-bank-none hidden></div></section>');
   const groupName=id=>(picker.groups.find(g=>g[0]===id)||[])[1]||'';
   const drawChooser=()=>{
    const term=bankTerm.trim().toLowerCase(),banks=picker.banks.filter(b=>bankGroups.includes(b.group)&&(!term||(b.name+' '+groupName(b.group)).toLowerCase().includes(term)));
    const val={name:b=>b.name.toLowerCase(),type:b=>groupName(b.group).toLowerCase(),items:b=>countFor(b)}[bankSort];banks.sort((a,b)=>{const x=val(a),y=val(b),d=typeof x==='number'?x-y:x.localeCompare(y);return bankDir==='ascending'?d:-d});
    chooser.querySelectorAll('[data-bank-sort]').forEach(th=>th.setAttribute('aria-sort',th.dataset.bankSort===bankSort?bankDir:'none'));
    chooser.querySelector('tbody').innerHTML=banks.map(b=>{const on=chosen.includes(b.id);return '<tr class="row-link"'+(on?' aria-selected="true"':'')+'><td class="uc-bank-check"><input type="checkbox" class="checkbox" id="uc-bank-'+b.id+'" data-bank-choose="'+b.id+'"'+(on?' checked':'')+'></td><td><label for="uc-bank-'+b.id+'">'+esc(b.name)+'</label></td><td>'+esc(groupName(b.group))+'</td><td class="num">'+countFor(b)+'</td></tr>'}).join('');
    const none=chooser.querySelector('[data-bank-none]');chooser.querySelector('.table-wrap').hidden=!banks.length;none.hidden=!!banks.length;
    if(!banks.length)none.innerHTML='<span class="empty-media" aria-hidden="true">'+icon('<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>')+'</span><p class="empty-title">No item banks match</p><p>Try another name, or tick more bank types.</p>';
    syncBar();
   };
   /* 17 Nov: bank types are a multi-select dropdown, all ticked by default. */
   const typesLabel=()=>{const names=picker.groups.filter(g=>bankGroups.includes(g[0])).map(g=>g[1]);const text=names.length===picker.groups.length?'All banks':names.length===1?names[0]:names.length?names.length+' selected':'No banks';const all=chooser.querySelector('[data-bank-filter-all]');all.checked=names.length===picker.groups.length;all.indeterminate=names.length>0&&names.length<picker.groups.length;chooser.querySelector('[data-bank-types-label]').textContent=text;chooser.querySelector('.uc-bank-types-trigger').setAttribute('aria-label','Bank types: '+text)};
   chooser.addEventListener('change',e=>{const ab=e.target.closest('[data-bank-filter-all]');if(ab){chooser.querySelectorAll('[data-bank-filter-group]').forEach(x=>{x.checked=ab.checked});bankGroups=ab.checked?picker.groups.map(g=>g[0]):[];typesLabel();drawChooser();return}
    const gb=e.target.closest('[data-bank-filter-group]');if(gb){bankGroups=[...chooser.querySelectorAll('[data-bank-filter-group]:checked')].map(x=>x.dataset.bankFilterGroup);typesLabel();drawChooser();return}});
   chooser.addEventListener('change',e=>{const box=e.target.closest('[data-bank-choose]');if(!box)return;const id=box.dataset.bankChoose;chosen=chosen.filter(x=>x!==id);if(box.checked)chosen.push(id);chooser.querySelector('[data-bank-choose-error]').hidden=true;drawChooser();chooser.querySelector('[data-bank-choose="'+id+'"]')?.focus()});
   chooser.addEventListener('click',e=>{const sb=e.target.closest('[data-bank-sort] .table-sort');if(sb){const k=sb.parentElement.dataset.bankSort;bankDir=k===bankSort&&bankDir==='ascending'?'descending':'ascending';bankSort=k;drawChooser();chooser.querySelector('[data-bank-sort="'+k+'"] .table-sort').focus();return}
    const row=e.target.closest('tr.row-link');if(row&&!e.target.closest('input,label')){row.querySelector('[data-bank-choose]').click()}});
   chooser.querySelector('[data-bank-filter-term]').addEventListener('input',e=>{bankTerm=e.target.value;drawChooser()});
   /* Next lives in the floating bar, in place of Continue, while banks are being chosen. */
   /* The bar can be re-rendered, so the button is re-added when missing and the swap is done with a class on the bar. */
   const goNext=()=>{if(!chosen.length){chooser.querySelector('[data-bank-choose-error]').hidden=false;return}picked=true;chosen=picker.banks.map(b=>b.id).filter(id=>chosen.includes(id));save();show();chips.querySelector('[data-bank-add]').focus()};
   window.capRefreshBankChooser=()=>show();
   /* Step B: the banks in use as filter chips, then the items. */
   const addBtn='<button type="button" class="btn btn-ghost btn-sm" data-bank-add aria-haspopup="dialog">'+icon('<path d="M5 12h14"/><path d="M12 5v14"/>')+'Add item bank</button>';
   const chips=make('<div class="uc-bank-chips"><div class="chip-list" role="list" aria-label="Item banks in use"></div></div>');
   const drawChips=()=>{chips.querySelector('.chip-list').innerHTML=chosen.map(id=>{const b=picker.banks.find(x=>x.id===id);return b?'<span class="chip" role="listitem">'+esc(b.name)+'<button type="button" class="chip-remove" data-bank-remove="'+b.id+'" aria-label="Remove '+esc(b.name)+'">'+xIcon+'</button></span>':''}).join('')+'<span role="listitem" class="uc-bank-add-item">'+addBtn+'</span>'};
   chips.addEventListener('click',e=>{const rm=e.target.closest('[data-bank-remove]');if(rm){const i=chosen.indexOf(rm.dataset.bankRemove);chosen=chosen.filter(x=>x!==rm.dataset.bankRemove);if(!chosen.length)picked=false;save();show();if(picked)(chips.querySelectorAll('.chip-remove')[i]||chips.querySelectorAll('.chip-remove')[i-1]||chips.querySelector('[data-bank-add]')).focus();else chooser.querySelector('[data-bank-choose]')?.focus();return}
    const add=e.target.closest('[data-bank-add]');if(add)picker.open({multi:true,trigger:add,selected:chosen,countFor,onPick:ids=>{chosen=ids;save();show()}});});
   const syncBar=()=>{const bar=page.querySelector('.tf-bottom');if(!bar)return;let btn=bar.querySelector('.uc-bank-next');if(!btn){btn=make('<button type="button" class="btn btn-lg uc-bank-next" data-bank-next>Next</button>');const cont=bar.querySelector('.solid');cont?cont.after(btn):bar.append(btn)}btn.onclick=goNext;bar.classList.toggle('uc-bar-choosing-banks',!picked&&!library.hidden);
    /* 17 Nov: the selected count is a badge in the floating bar, next to Back. */
    let count=bar.querySelector('.uc-bank-count-badge');if(!count)count=make('<span class="badge badge-secondary uc-bank-count-badge" role="status" aria-live="polite"></span>');
    const back=bar.querySelector('.uc-items-back')||[...bar.querySelectorAll('a,button')].find(x=>/^Back$/.test(x.textContent.trim()));if(back){if(count.nextElementSibling!==back)back.before(count)}else if(!count.isConnected)btn.before(count);
    count.textContent=chosen.length+' selected';count.hidden=!chosen.length};
   const show=()=>{library.classList.toggle('uc-choosing-banks',!picked);chips.hidden=!picked||library.hidden;syncBar();if(picked)drawChips();else drawChooser();window.capFilterBuilderQuestions?.()};
   library.prepend(chooser);page.querySelector('.buildergrid').before(chips);
   /* The method pills move above the grid too, so pills, then bank chips, run across the whole page. */
   const methodsRow=make('<div class="approved-bank-heading uc-methods-row"></div>');chips.before(methodsRow);
   const placeHeading=()=>{if(methods&&methods.parentElement!==methodsRow)methodsRow.append(methods)};
   placeHeading();setTimeout(placeHeading,0);
   show();
  }
  library.querySelector('#libraryList').after(make('<div class="empty-state" data-bank-empty role="status" hidden><span class="empty-media" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span><p class="empty-title">No items match</p><p>Try another search, or change the item banks or filters.</p></div>'));
  library.querySelector('#typeFilter')?.querySelectorAll('option').forEach(o=>{if(o.textContent==='Choice')o.textContent='Multiple choice';if(o.textContent==='Text entry')o.textContent='Short answer';if(o.textContent==='Extended text')o.textContent='Extended response'});
  const bankHeading=library.querySelector('.approved-bank-heading')||make('<div class="approved-bank-heading"><h2></h2></div>');
  bankHeading.querySelector('h2').textContent='Find and add items';
  library.before(bankHeading);
  bankHeading.querySelector('h2').className='sr-only';
  page.querySelector('.buildergrid>section')?.classList.remove('card');
  const board=page.querySelector('.qc-board');
  if(board){
   board.querySelector('.qc-board-header .uc-board-icon')?.remove();
   board.querySelector('.qc-board-header h2')?.classList.add('text-body-small','text-muted-foreground');
   const clear=board.querySelector('[data-qc-clear]');if(clear){clear.classList.remove('is-destructive','qc-destructive','btn-lg');clear.classList.add('btn-sm')}
   board.querySelector('.qc-preview-list')?.classList.add('card');
  }
  bankHeading.append(methods);
  methods.setAttribute('aria-label','Choose how to add items');
  methods.setAttribute('role','group');
  const extraFilters=make('<details class="uc-extra-filters"><summary class="btn btn-ghost btn-icon btn-sm" aria-label="Filters" title="Filters">'+icon('<path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/>')+'</summary><div class="filters uc-filter-fields"></div></details>');
  const filterFields=extraFilters.querySelector('.filters');
  filterFields.append(...toolbar.querySelectorAll('.uc-bank-select-control'));
  library.querySelectorAll('.filters').forEach(filters=>{
   filterFields.append(...filters.children);
   filters.remove();
  });
  /* Figma: item count on the left, search and filter as icon buttons on the right. Search opens a full-width field below. */
  const count=make('<p class="uc-bank-count text-body-small text-muted-foreground" role="status"></p>');
  const searchToggle=make('<button type="button" class="btn btn-ghost btn-icon btn-sm uc-search-toggle" aria-label="Search items" title="Search items" aria-expanded="false" aria-controls="search">'+icon('<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>')+'</button>');
  const setSearch=open=>{toolbar.toggleAttribute('data-search-open',open);searchToggle.setAttribute('aria-expanded',String(open))};/* 17 Nov: opening search doesn't focus the field */
  searchToggle.onmousedown=e=>e.preventDefault();
  searchToggle.onclick=()=>setSearch(!toolbar.hasAttribute('data-search-open'));
  search.addEventListener('keydown',e=>{if(e.key==='Escape'&&!search.value){setSearch(false);searchToggle.focus()}});
  search.addEventListener('blur',()=>{if(!search.value)setSearch(false)});
  const searchSlot=make('<div class="uc-search-slot"><div class="uc-search-clip"></div></div>');
  searchBox.before(searchSlot);searchSlot.firstElementChild.append(searchBox);
  toolbar.prepend(count);searchSlot.before(searchToggle);
  /* Only real filter controls in the popover: no empty select wraps (stray chevrons) or info badges. */
  filterFields.querySelectorAll('.select-wrap').forEach(wrap=>{if(!wrap.querySelector('select'))wrap.remove()});
  filterFields.querySelectorAll(':scope > .badge').forEach(badge=>badge.remove());
  toolbar.append(extraFilters);
  /* Back sits in the floating bar next to Continue (as on the other steps) and reopens the setup modal. */
  const back=make('<button class="btn btn-ghost btn-lg uc-items-back" type="button" data-tf-back="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>Back</button>');
  page.querySelector('.tf-bottom .tf-original-actions')?.before(make('<p class="uc-review-status sr-only" role="status" hidden></p>'));
  inst.refreshQuestionBoard?.();
  page.querySelector('.tf-bottom .solid')?.before(back);
  const actionBar=page.querySelector('.tf-bottom');
  if(actionBar){
   const barSize=new ResizeObserver(()=>page.style.setProperty('--uc-action-bar-height',actionBar.offsetHeight+'px'));
   barSize.observe(actionBar);
  }
  back.onclick=()=>hero.querySelector('[data-uc-details]').click();
  page.querySelectorAll('.tf-bottom a').forEach(a=>{if(a.getAttribute('href')==='CAP-T04-Setup.dc.html'){a.href='CAP-T03-Assessments.dc.html';a.textContent='Back to tests'}});
  page.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&/CAP-T0[67]-/.test(a.getAttribute('href')||'')){if(!syncGate()){e.preventDefault();e.stopImmediatePropagation();openSetup()}}},true);
  observe();
 }
 const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})});let queued=false;
 function observe(){observer.observe(document.body,{childList:true,subtree:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();observe()});else{mount();observe()}
})();
