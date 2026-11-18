/* Shared bank dropdown for the test builder and the Item banks page. */
(() => {
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon=path=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  const element=markup=>{const template=document.createElement('template');template.innerHTML=markup.trim();return template.content.firstElementChild;};
  const GROUPS = [['cognia', 'Cognia banks'], ['mine', 'My banks'], ['specialist', 'Content specialist banks']];
  const BANKS = [
    {id: 'cognia-classroom', group: 'cognia', name: 'Classroom collection, Grades 4 to 8', match: null},
    {id: 'cognia-g4-math', group: 'cognia', name: 'Grade 4 Mathematics', match: ['Grade 4 Maths']},
    {id: 'cognia-g5-math', group: 'cognia', name: 'Grade 5 Mathematics', match: ['Grade 5 Maths']},
    {id: 'cognia-g6-math', group: 'cognia', name: 'Grade 6 Mathematics', match: ['Grade 6 Maths']},
    {id: 'cognia-g7-ela', group: 'cognia', name: 'Grade 7 ELA', match: ['Grade 7 ELA']},
    {id: 'cognia-g5-ela', group: 'cognia', name: 'Grade 5 ELA', match: ['Grade 5 ELA']},
    {id: 'cognia-g6-ela', group: 'cognia', name: 'Grade 6 ELA', match: ['Grade 6 ELA']},
    {id: 'cognia-g7-math', group: 'cognia', name: 'Grade 7 Mathematics', match: ['Grade 7 Maths'], libraryOnly: true},
    {id: 'cognia-g8-math', group: 'cognia', name: 'Grade 8 Mathematics', match: ['Grade 8 Maths']},
    {id: 'cognia-g8-ela', group: 'cognia', name: 'Grade 8 ELA', match: ['Grade 8 ELA']},
    {id: 'mine-g5-fractions', group: 'mine', name: 'My Grade 5 fractions', match: ['Grade 5 Maths']},
    {id: 'mine-g4-warmups', group: 'mine', name: 'Grade 4 warm-ups', match: ['Grade 4 Maths']},
    {id: 'specialist-reading', group: 'specialist', name: 'Grade 7 and 8 reading passages', match: ['Grade 7 ELA', 'Grade 8 ELA']}
  ];
  const collections=BANKS.filter(bank=>bank.match);
  const banksById=new Map(collections.map(bank=>[bank.id,bank]));
  const builderCollections=collections.filter(bank=>!bank.libraryOnly);
  const gradeOf=bank=>bank.match[0].split(' ')[1];
  const subjectOf=bank=>bank.match[0].endsWith(' ELA')?'ELA':'Mathematics';

  function createDropdown({banks=collections,selected,countFor,onChange,canOpen=()=>true,libraryView=false}){
   const cogniaBanks=banks.filter(bank=>bank.group==='cognia');
   const grades=[...new Set(cogniaBanks.map(gradeOf))].sort((a,b)=>Number(a)-Number(b));
   const removeIcon=icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
   const chevron=icon('<path d="m6 9 6 6 6-6"/>');
   const right=icon('<path d="m9 18 6-6-6-6"/>');
   const folder=icon('<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7a2 2 0 0 1-1.6-.8l-.8-1.4A2 2 0 0 0 9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>');
   const person=icon('<circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>');
   const people=icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4m-3-12a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>');
   const addBankIcon=icon('<path d="M12 5v14m-7-7h14"/>');
   const removeBankIcon=icon('<path d="M5 12h14"/>');
   const searchIcon=icon('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>');
   const option=(bank,label)=>`
    <button class="command-item" type="button" aria-pressed="false" data-bank-option="${esc(bank.id)}">
     ${folder}<span class="uc-bank-option-label"><span class="font-semibold" data-bank-label>${esc(label)}</span><span class="text-body-small text-muted-foreground font-normal" data-bank-count aria-hidden="true"></span></span><span class="uc-bank-trailing"></span>
    </button>`;
   const branch=(label,symbol,options,gradeFolder=false)=>`
    <details class="collapsible uc-bank-branch" data-bank-branch${gradeFolder?' name="uc-bank-grades"':''}>
     <summary class="collapsible-trigger command-item">${symbol}<span>${esc(label)}</span><span class="uc-bank-trailing">${right}</span></summary>
     <div class="uc-bank-children">${options.join('')}</div>
    </details>`;
   const cogniaGrades=grades.map(grade=>branch('Grade '+grade,folder,cogniaBanks.filter(bank=>gradeOf(bank)===grade).map(bank=>option(bank,subjectOf(bank))),true)).join('');
   const searchLabel=libraryView?'Search banks and folders':'Search item banks / collections';
   const field=element(`
    <div class="field uc-bank-field">
     <div class="uc-bank-picker command">
      <label class="sr-only" for="uc-bank-search">${searchLabel}</label>
      <div class="search search-md">
       ${searchIcon.replace('<svg','<svg class="search-icon"')}
       <input class="input search-input" id="uc-bank-search" type="search" role="combobox" aria-haspopup="dialog" aria-expanded="false" aria-controls="uc-bank-options" placeholder="${searchLabel}" autocomplete="off">
       <button class="btn btn-ghost btn-icon btn-sm uc-bank-trigger" type="button" aria-label="Toggle item banks" aria-expanded="false" aria-controls="uc-bank-options">${chevron}</button>
      </div>
      <div class="popover" id="uc-bank-options" role="dialog" aria-label="Item banks and collections" hidden>
       <div class="command-list">
        ${libraryView?`<details class="collapsible command-group uc-cognia-banks" open>
         <summary class="collapsible-trigger command-item">${folder}<span class="font-semibold">Cognia banks</span><span class="uc-bank-trailing">${right}</span></summary>
         <div class="uc-bank-children">${cogniaGrades}</div>
        </details>`:`<div class="command-group uc-cognia-banks">
         <div class="command-group-heading text-foreground">Cognia banks</div>
         ${cogniaGrades}
        </div>`}
        ${GROUPS.filter(([group])=>group!=='cognia').map(([group,label])=>
         `<hr class="separator">${branch(label,group==='mine'?person:people,banks.filter(bank=>bank.group===group).map(bank=>option(bank,bank.name)))}`).join('')}
        <p class="command-empty" role="status" hidden>No item banks match.</p>
       </div>
      </div>
     </div>
    </div>`);
   const trigger=field.querySelector('.uc-bank-trigger');
   const bankInput=field.querySelector('#uc-bank-search');
   const bankPopover=field.querySelector('#uc-bank-options');
   const cogniaGroup=bankPopover.querySelector('.uc-cognia-banks');
   const selection=element('<div class="chip-list uc-bank-selection" role="group" aria-label="Selected item banks"></div>');
   const branches=[...bankPopover.querySelectorAll('[data-bank-branch]')];
   const options=[...bankPopover.querySelectorAll('[data-bank-option]')];
   const updateBankCounts=()=>{
    for(const option of options){
     const bank=banksById.get(option.dataset.bankOption);
     const count=countFor(bank);
     option.querySelector('[data-bank-count]').textContent=`(${count})`;
     option.setAttribute('aria-label',`${bank.name}, ${count} ${count===1?'item':'items'}`);
    }
   };
   const openSelectedBranch=()=>{
    const activeBranch=options.find(option=>selected.has(option.dataset.bankOption))?.closest('[data-bank-branch]');
    branches.forEach(branch=>{branch.open=branch===activeBranch;});
   };
   const filterBanks=()=>{
    const terms=bankInput.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let hasMatch=false;
    for(const branch of branches){
     const label=branch.querySelector('summary').textContent.trim();
     let branchMatches=false;
     for(const option of branch.querySelectorAll('[data-bank-option]')){
      const bank=banksById.get(option.dataset.bankOption);
      const name=label+' '+bank.name+' '+option.querySelector('[data-bank-label]').textContent+(bank.group==='cognia'?' Cognia banks':'');
      option.hidden=!terms.every(term=>name.toLowerCase().includes(term));
      branchMatches||=!option.hidden;
     }
     branch.hidden=!branchMatches;
     if(terms.length&&(!branchMatches||!branch.name))branch.open=branchMatches;
     if(branch.previousElementSibling?.matches('.separator'))branch.previousElementSibling.hidden=!branchMatches;
     hasMatch||=branchMatches;
    }
    cogniaGroup.hidden=!branches.some(branch=>!branch.hidden&&cogniaGroup.contains(branch));
    if(libraryView&&terms.length&&!cogniaGroup.hidden)cogniaGroup.open=true;
    bankPopover.querySelector('.command-empty').hidden=hasMatch;
    if(!terms.length)openSelectedBranch();
    else if(!branches.some(branch=>branch.name&&branch.open&&!branch.hidden)){
     const firstGrade=branches.find(branch=>branch.name&&!branch.hidden);
     if(firstGrade)firstGrade.open=true;
    }
   };
   const setPickerOpen=open=>{
    if(open&&!canOpen())return;
    if(open&&bankPopover.hidden)updateBankCounts();
    bankPopover.hidden=!open;
    bankInput.setAttribute('aria-expanded',String(open));
    trigger.setAttribute('aria-expanded',String(open));
    if(!open&&bankInput.value){
     bankInput.value='';
     filterBanks();
    }
   };
   bankInput.addEventListener('click',()=>setPickerOpen(true));
   bankInput.addEventListener('input',()=>{
    setPickerOpen(true);
    filterBanks();
   });
   trigger.addEventListener('click',()=>{
    const open=bankPopover.hidden;
    setPickerOpen(open);
    if(open&&!bankPopover.hidden)bankInput.focus();
   });
   field.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!bankPopover.hidden){
     event.preventDefault();
     event.stopPropagation();
     setPickerOpen(false);
     bankInput.focus();
    } else if(event.target===trigger&&event.key==='ArrowDown'&&libraryView){
     event.preventDefault();
     setPickerOpen(true);
     bankInput.focus();
    } else if(event.target===bankInput&&event.key==='ArrowDown'){
     event.preventDefault();
     setPickerOpen(true);
     const first=libraryView&&!cogniaGroup.hidden&&!cogniaGroup.open?cogniaGroup:branches.find(branch=>!branch.hidden);
     first?.querySelector('summary').focus();
    }
   });
   field.addEventListener('focusout',event=>{
    if(event.relatedTarget&&!field.contains(event.relatedTarget))setPickerOpen(false);
   });
   document.addEventListener('pointerdown',event=>{
    if(!field.querySelector('.uc-bank-picker').contains(event.target)&&!bankPopover.hidden)setPickerOpen(false);
   });
   const renderSelection=()=>{
    for(const option of options){
     const active=selected.has(option.dataset.bankOption);
     option.setAttribute('aria-pressed',String(active));
     option.title=active?'Remove bank':'Add bank';
     option.querySelector('.uc-bank-trailing').innerHTML=active?removeBankIcon:addBankIcon;
    }
    selection.hidden=libraryView?selected.size<2:!selected.size;
    selection.innerHTML=[...selected].map(id=>banksById.get(id)).map(bank=>`
     <span class="chip" title="${esc(bank.name)}"><span class="uc-bank-chip-name">${esc(bank.name)}</span><button class="chip-remove" type="button" data-remove-bank="${esc(bank.id)}" aria-label="Remove bank: ${esc(bank.name)}">${removeIcon}</button></span>
    `).join('');
   };
   const updateSelection=()=>{
    renderSelection();
    onChange();
   };
   bankPopover.addEventListener('click',event=>{
    const option=event.target.closest('[data-bank-option]');
    if(!option)return;
    const id=option.dataset.bankOption;
    if(!selected.delete(id))selected.add(id);
    updateSelection();
   });
   selection.addEventListener('click',event=>{
    const remove=event.target.closest('[data-remove-bank]');
    if(!remove)return;
    selected.delete(remove.dataset.removeBank);
    updateSelection();
    (selection.hidden?trigger:selection.querySelector('[data-remove-bank]')||trigger).focus();
   });
   openSelectedBranch();
   renderSelection();
   return {field,selection,close:()=>setPickerOpen(false),refresh:()=>{
    openSelectedBranch();
    renderSelection();
    if(!bankPopover.hidden)updateBankCounts();
   }};
  }

  // The library's sample items are grouped by grade and subject in the prototype.
  const matchesLibraryBank=(bank,item)=>bank.match.includes('Grade '+item.grade+' '+item.subject);
  function matchesLibrarySelection(item,ids){
   return !ids?.length||ids.some(id=>matchesLibraryBank(banksById.get(id),item));
  }
  function libraryPath(ids=[]){
   if(ids.length>1)return ids.length+' banks selected';
   const bank=banksById.get(ids[0]);
   if(!bank)return 'All banks';
   const group=GROUPS.find(([id])=>id===bank.group)[1];
   return [group,...(bank.group==='cognia'?['Grade '+gradeOf(bank),subjectOf(bank)]:[bank.name])].join(' / ');
  }
  window.capBankPicker={banks:BANKS,builderCollections,createDropdown,matchesLibrarySelection,libraryPath};

  document.addEventListener('DOMContentLoaded',()=>{
   const slot=document.querySelector('main.ib-main .ib-bank-slot');
   const instance=window.cogniaPreview;
   if(!slot||typeof instance?.ibData!=='function')return;
   const key='cogniaItemBankV1';
   const selected=new Set();
   try {
    const saved=sessionStorage.getItem(key);
    const ids=saved===null?['cognia-g5-math']:saved.startsWith('[')?JSON.parse(saved):[saved];
    ids.filter(id=>banksById.has(id)).forEach(id=>selected.add(id));
   } catch {}
   const itemId=new URLSearchParams(location.search).get('item');
   const item=instance.ibData().find(entry=>entry.id===itemId);
   if(item&&!matchesLibrarySelection(item,[...selected])){
    const bank=BANKS.find(entry=>entry.group==='cognia'&&matchesLibraryBank(entry,item));
    if(bank)selected.add(bank.id);
   }

   const dropdown=createDropdown({
    selected,
    libraryView:true,
    countFor:bank=>instance.ibData().filter(item=>matchesLibraryBank(bank,item)).length,
    onChange(){
     const ids=[...selected];
     try{sessionStorage.setItem(key,JSON.stringify(ids));}catch {}
     instance.setState({ibBanks:ids});
    },
   });
   const tabSelector='.ib-support-tabs [role="tab"]';
   let activeTab='ib-analysis-tab';
   function syncItemTabs(){
    document.querySelectorAll(tabSelector).forEach(tab=>{
     const selected=tab.id===activeTab;
     tab.setAttribute('aria-selected',String(selected));
     tab.tabIndex=selected?0:-1;
     document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;
    });
   }
   function selectItemTab(tab){
    activeTab=tab.id;
    syncItemTabs();
    tab.focus();
   }
   document.addEventListener('keydown',event=>{
    const tab=event.target.closest(tabSelector);
    if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const tabs=[...tab.parentElement.querySelectorAll('[role="tab"]')];
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:
      (tabs.indexOf(tab)+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    event.preventDefault();
    selectItemTab(tabs[next]);
   });
   // Keep the live dropdown and tab selection when the exported page redraws.
   const update=instance.update;
   instance.update=()=>{
    const active=document.activeElement;
    update();
    document.querySelector('.ib-bank-slot').append(dropdown.field,dropdown.selection);
    syncItemTabs();
    if(dropdown.field.contains(active)||dropdown.selection.contains(active))active.focus({preventScroll:true});
    if(active.matches(tabSelector))document.getElementById(active.id)?.focus({preventScroll:true});
   };
   instance.setState({ibBanks:[...selected]});
   document.addEventListener('click',event=>{
    const tab=event.target.closest(tabSelector);
    if(tab){selectItemTab(tab);return;}
    const card=event.target.closest('a.ib-associated-card');
    if(!card||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const fromItem=new URL(card.href).searchParams.get('fromItem');
    if(!fromItem)return;
    const current=new URL(location.href);
    current.searchParams.set('item',fromItem);
    history.replaceState(history.state,'',current);
   });
  });
})();
