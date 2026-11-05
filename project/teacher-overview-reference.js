/* Reference presentation only. Reuse the existing archive/restore-work handler.
   Illustrative reference copy stays visible until the user has a real draft. */
(() => {
 let draftIndex = 0;
 const examples = [
  { title: 'New classroom assessment', detail: '4 items · Class 7A', page: 'CAP-T05-Questions.dc.html' },
  { title: 'Algebra practice', detail: 'Classroom assessment', page: 'CAP-T05-Algebra.dc.html' },
  { title: 'Reading comprehension', detail: 'Classroom assessment', page: 'CAP-T05-Reading.dc.html' }
 ];
 function apply() {
  const card = document.querySelector('[data-priority="draft"]');
  if (!card?.querySelector('[data-draft-count]')) return;
  let entries;
  try { entries = JSON.parse(localStorage.getItem('cogniaAssessmentArchiveV1') || '[]'); } catch { entries = []; }
  const saved = Array.isArray(entries) ? entries.filter(entry => entry?.status === 'draft' && !entry.sample && entry.id) : [];
  const drafts = saved.length ? saved : examples;
  draftIndex = Math.min(Math.max(draftIndex, 0), drafts.length - 1);
  const draft = drafts[draftIndex];
  const setText = (selector, value) => {
   const element = card.querySelector(selector);
   if (element.textContent !== value) element.textContent = value;
  };
  setText('[data-draft-count]', String(drafts.length));
  setText('[data-draft-position]', (draftIndex + 1) + ' of ' + drafts.length);
  setText('[data-overview-draft-title]', draft.title);
  const tests = Array.isArray(draft.model?.tests) ? draft.model.tests : [];
  const itemCounts = tests.map(test => test?.questions?.length ?? test?.state?.chosen?.length ?? 0);
  const itemCount = itemCounts.reduce((total, count) => total + count, 0);
  const hasSetup = tests.length > 0 && tests.every(test => test?.title && test.grade && test.subject);
  const stage = draft.id && !hasSetup && !itemCount ? 0 : 1;
  const percent = stage === 0 ? 0 : !draft.id || itemCount ? 60 : 33;
  const progress = card.querySelector('.od-draft-progress progress');
  progress.value = percent;
  const label = percent + '%';
  progress.textContent = label;
  progress.setAttribute('aria-valuetext', label);
  card.querySelector('.od-draft-progress > div > span:last-child').textContent = label;
  card.querySelectorAll('.od-draft-stages li').forEach((step, index) => {
   step.classList.toggle('is-done', index < stage);
   if (index === stage) step.setAttribute('aria-current', 'step');
   else step.removeAttribute('aria-current');
   const svg = step.querySelector('svg');
   const icon = '<circle cx="12" cy="12" r="9"/>' + (index < stage
    ? '<path d="m8 12 3 3 5-6"/>'
    : index === stage ? '<circle cx="12" cy="12" r="4" fill="currentColor"/>' : '');
   if (svg.dataset.stageIcon !== icon) {
    svg.innerHTML = icon;
    svg.dataset.stageIcon = icon;
   }
  });
  setText('[data-overview-draft-meta]', draft.detail || (draft.id
   ? itemCount + (itemCount === 1 ? ' item added' : ' items added')
   : 'Classroom assessment'));
  card.querySelector('[data-draft-step="-1"]').disabled = draftIndex === 0;
  card.querySelector('[data-draft-step="1"]').disabled = draftIndex === drafts.length - 1;
  const resume = card.querySelector('[data-overview-resume]');
  if (draft.id) resume.dataset.restoreWork = draft.id;
  else delete resume.dataset.restoreWork;
  resume.setAttribute('href', draft.page || 'CAP-T05-Questions.dc.html');
 }
 function ready(){
  document.addEventListener('click', event => {
   const button = event.target.closest('[data-draft-step]');
   if (!button) return;
   draftIndex += Number(button.dataset.draftStep);
   apply();
   if (button.disabled) {
    button.parentElement.querySelector('button:not(:disabled)')?.focus();
   }
  });
  window.addEventListener('storage', event => {
   if (event.key === 'cogniaAssessmentArchiveV1') apply();
  });
  apply();let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;observer.disconnect();apply();observer.observe(document.body,{childList:true,subtree:true});});});
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',event=>{for(const menu of document.querySelectorAll('.ov-menu[open]'))if(!menu.contains(event.target))menu.open=false;});
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const menu=document.querySelector('.ov-menu[open]');if(menu){menu.open=false;menu.querySelector('summary').focus();}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
