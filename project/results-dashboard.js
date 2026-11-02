(() => {
 let filter='all', query='';
 const update=()=>{
  let count=0;
  document.querySelectorAll('[data-result-row]').forEach(row=>{row.hidden=!(filter==='all'||row.dataset.status===filter)||!row.cells[0].textContent.toLowerCase().includes(query);if(!row.hidden)count++;});
  document.querySelectorAll('[data-result-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.resultFilter===filter)));
  const empty=document.querySelector('.rr-empty');if(empty)empty.hidden=count!==0;
  const note=document.querySelector('.rr-table-note'),message=`${count} ${count===1?'student':'students'} · Unsubmitted work has no score.`;if(note&&note.textContent!==message)note.textContent=message;
 };
 document.addEventListener('click',e=>{const button=e.target.closest('[data-result-filter]');if(button){filter=button.dataset.resultFilter;update();}});
 document.addEventListener('input',e=>{if(e.target.id==='resultSearch'){query=e.target.value.trim().toLowerCase();update();}});
 // The shared Canvas runtime redraws when the hub or account menu changes.
 const root=document.querySelector('x-dc');if(root)new MutationObserver(()=>{const input=document.getElementById('resultSearch');if(input&&input.value!==query)input.value=query;update();}).observe(root,{childList:true,subtree:true});
})();
