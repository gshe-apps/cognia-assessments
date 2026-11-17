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
  const removeIcon=icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
  const itemSummary=make('<div class="uc-item-summary"></div>');
  // Bank selection filters the library without changing the items already in the test.
  const picker=window.capBankPicker;
  if(picker){
   const bankKey='cogniaBuilderBanksV1';
   const banks=new Map(picker.banks.map(bank=>[bank.id,bank]));
   const chosen=new Set(['cognia-classroom']);
   try {
    const saved=JSON.parse(sessionStorage.getItem(bankKey));
    if(Array.isArray(saved)){
     const valid=saved.filter(id=>banks.has(id));
     if(valid.length||saved.length===0){
      chosen.clear();
      valid.forEach(id=>chosen.add(id));
     }
    }
   } catch {}

   const rowGroups={cognia:'cognia',mine:'teacher',specialist:'specialist'};
   const gradesByBank=new Map(picker.banks.map(bank=>[bank.id,(bank.match||[])
    .flatMap(name=>[...name.matchAll(/Grade (\d+)/g)].map(match=>match[1]))]));
   const inBank=(bank,row)=>{
    if(row.dataset.itemBank!==rowGroups[bank.group])return false;
    const grades=gradesByBank.get(bank.id);
    const standard=row.dataset.bankStandard||'';
    return !grades.length||grades.some(grade=>standard.startsWith(grade+'.')||standard.includes('.'+grade+'.'));
   };
   const matchingBank=row=>[...chosen].map(id=>banks.get(id)).find(bank=>inBank(bank,row));
   window.capBuilderBankMatch=row=>Boolean(matchingBank(row));
   window.capBankNameForRow=row=>matchingBank(row)?.name||'';

   const chevron=icon('<path d="m6 9 6 6 6-6"/>');
   const searchIcon=icon('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>');
   const field=make(`
    <div class="field uc-bank-field">
     <label class="sr-only" for="uc-bank-search">Search item banks / collections</label>
     <div class="uc-bank-picker command">
      <div class="search search-md">
       ${searchIcon.replace('<svg','<svg class="search-icon"')}
       <input class="input search-input command-input" id="uc-bank-search" type="search" role="combobox" aria-haspopup="dialog" aria-expanded="false" aria-controls="uc-bank-options" placeholder="Search item banks / collections" autocomplete="off">
       <button class="btn btn-ghost btn-icon btn-sm uc-bank-trigger" type="button" aria-label="Toggle item banks" aria-expanded="false" aria-controls="uc-bank-options">${chevron}</button>
      </div>
      <div class="popover" id="uc-bank-options" role="dialog" aria-label="Item banks and collections" hidden>
        <div class="command-list">
         ${picker.groups.map(([group,label])=>`
          <div class="command-group" role="group" aria-label="${esc(label)}">
           <div class="command-group-heading">${esc(label)}</div>
           ${picker.banks.filter(bank=>bank.group===group).map(bank=>`
            <label class="command-item"><input class="checkbox" type="checkbox" value="${esc(bank.id)}" data-bank-option ${chosen.has(bank.id)?'checked':''}>${esc(bank.name)}</label>
           `).join('')}
          </div>
         `).join('')}
         <p class="command-empty" hidden>No item banks match.</p>
        </div>
      </div>
     </div>
    </div>`);
   const trigger=field.querySelector('.uc-bank-trigger');
   const bankInput=field.querySelector('#uc-bank-search');
   const bankPopover=field.querySelector('#uc-bank-options');
   const selection=make('<div class="chip-list uc-bank-selection" role="group" aria-label="Selected item banks"></div>');
   itemSummary.append(selection);
   const options=[...field.querySelectorAll('[data-bank-option]')];
   const setPickerOpen=open=>{
    bankPopover.hidden=!open;
    bankInput.setAttribute('aria-expanded',String(open));
    trigger.setAttribute('aria-expanded',String(open));
   };
   ['focus','click','input'].forEach(type=>bankInput.addEventListener(type,()=>setPickerOpen(true)));
   trigger.addEventListener('click',()=>{
    const open=bankPopover.hidden;
    if(open)bankInput.focus();
    setPickerOpen(open);
   });
   field.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!bankPopover.hidden){
     event.preventDefault();
     event.stopPropagation();
     bankInput.focus();
     setPickerOpen(false);
    } else if(event.target===bankInput&&event.key==='ArrowDown'){
     event.preventDefault();
     setPickerOpen(true);
     options.find(option=>!option.closest('[hidden]'))?.focus();
    }
   });
   field.addEventListener('focusout',event=>{
    if(event.relatedTarget&&!field.contains(event.relatedTarget))setPickerOpen(false);
   });
   document.addEventListener('pointerdown',event=>{
    if(!field.contains(event.target)&&!bankPopover.hidden)setPickerOpen(false);
   });
   const renderSelection=()=>{
    selection.hidden=!chosen.size;
    selection.innerHTML=[...chosen].map(id=>banks.get(id)).map(bank=>`
     <span class="chip" title="${esc(bank.name)}"><span class="uc-bank-chip-name">${esc(bank.name)}</span><button class="chip-remove" type="button" data-remove-bank="${esc(bank.id)}" aria-label="Remove ${esc(bank.name)}">${removeIcon}</button></span>
    `).join('');
   };
   const updateSelection=()=>{
    try{sessionStorage.setItem(bankKey,JSON.stringify([...chosen]));}catch {}
    options.forEach(option=>{option.checked=chosen.has(option.value)});
    renderSelection();
    window.capFilterBuilderQuestions?.();
   };
   field.addEventListener('change',event=>{
    const option=event.target.closest('[data-bank-option]');
    if(!option)return;
    if(option.checked)chosen.add(option.value);
    else chosen.delete(option.value);
    updateSelection();
   });
   selection.addEventListener('click',event=>{
    const remove=event.target.closest('[data-remove-bank]');
    if(!remove)return;
    chosen.delete(remove.dataset.removeBank);
    updateSelection();
    (selection.querySelector('.chip-remove')||trigger).focus();
   });
   library.prepend(field);
   renderSelection();
  }
  library.querySelector('#libraryList').after(make('<div class="empty-state" data-bank-empty role="status" hidden><span class="empty-media" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span><p class="empty-title">No items match</p><p>Try another search, or change the item banks or filters.</p></div>'));
  library.querySelector('#typeFilter')?.querySelectorAll('option').forEach(o=>{if(o.textContent==='Choice')o.textContent='Multiple choice';if(o.textContent==='Text entry')o.textContent='Short answer';if(o.textContent==='Extended text')o.textContent='Extended response'});
  const bankHeading=library.querySelector('.approved-bank-heading')||make('<div class="approved-bank-heading"><h2></h2></div>');
  bankHeading.querySelector('h2').textContent='Find and add items';
  bankHeading.classList.add('uc-methods-row');
  page.querySelector('.buildergrid').before(bankHeading);
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
  const count=make('<p class="uc-bank-count text-body-small text-muted-foreground" role="status"></p>');
  itemSummary.prepend(count);toolbar.prepend(itemSummary);
  filterFields.prepend(searchBox);
  /* Only real filter controls in the popover: no empty select wraps (stray chevrons) or info badges. */
  filterFields.querySelectorAll('.select-wrap').forEach(wrap=>{if(!wrap.querySelector('select'))wrap.remove()});
  filterFields.querySelectorAll(':scope > .badge').forEach(badge=>badge.remove());
  const bankField=library.querySelector('.uc-bank-field');
  (bankField||toolbar).append(extraFilters);
  if(bankField){
   const filterTrigger=extraFilters.querySelector('summary');
   document.addEventListener('pointerdown',event=>{
    if(extraFilters.open&&!extraFilters.contains(event.target))extraFilters.open=false;
   });
   extraFilters.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||!extraFilters.open)return;
    event.preventDefault();
    extraFilters.open=false;
    filterTrigger.focus();
   });
   const filterChips=make('<div class="chip-list uc-item-filter-chips" role="group" aria-label="Item filters" hidden></div>');
   itemSummary.append(filterChips);
   const selects=[...filterFields.querySelectorAll('select')];
   const defaults=new Map(selects.map(select=>[select,select.value]));
   const renderFilters=()=>{
    const active=selects.filter(select=>select.value&&select.value!==defaults.get(select));
    filterChips.hidden=!active.length;
    filterChips.innerHTML=active.map(select=>{
     const label=select.selectedOptions[0].textContent;
     return `<span class="chip">${esc(label)}<button class="chip-remove" type="button" data-remove-filter="${esc(select.id)}" aria-label="Remove filter: ${esc(label)}">${removeIcon}</button></span>`;
    }).join('');
   };
   filterFields.addEventListener('change',renderFilters);
   filterChips.addEventListener('click',event=>{
    const remove=event.target.closest('[data-remove-filter]');
    if(!remove)return;
    const select=selects.find(control=>control.id===remove.dataset.removeFilter);
    select.selectedIndex=0;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    (filterChips.querySelector('.chip-remove')||filterTrigger).focus();
   });
  }
  window.capFilterBuilderQuestions?.();
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
