/* Reference presentation only. Reuse the existing archive/restore-work handler.
   Illustrative reference copy stays visible until the user has a real draft. */
(() => {
 function apply() {
  const card=document.querySelector('[data-priority="draft"]');if(!card)return;
  let entries=[];try{entries=JSON.parse(localStorage.getItem('cogniaAssessmentArchiveV1')||'[]')}catch{}
  const draft=entries.find(e=>e.status==='draft'&&!e.sample);if(!draft)return;
  const title=card.querySelector('[data-overview-draft-title]');if(title&&title.textContent!==draft.title)title.textContent=draft.title;
  const meta=card.querySelector('[data-overview-draft-meta]');
  if(meta&&meta.textContent!=='Saved in this browser')meta.textContent='Saved in this browser';
  card.querySelectorAll('[data-overview-resume]').forEach(a=>{if(a.dataset.restoreWork!==draft.id)a.dataset.restoreWork=draft.id;});
 }
 function ready(){
  apply();let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;observer.disconnect();apply();observer.observe(document.body,{childList:true,subtree:true});});});
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',event=>{for(const menu of document.querySelectorAll('.ov-menu[open]'))if(!menu.contains(event.target))menu.open=false;});
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const menu=document.querySelector('.ov-menu[open]');if(menu){menu.open=false;menu.querySelector('summary').focus();}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
