/* Keeps the Overview draft stack in sync with the existing saved-assessment workflow. */
(() => {
 const archiveKey = 'cogniaAssessmentArchiveV1';
 let draftIndex = 0;
 let draftAnimation;
 const hiddenDrafts = new Set();

 function getDrafts() {
  let entries;
  try { entries = JSON.parse(localStorage.getItem(archiveKey) || '[]'); }
  catch { return []; }
  if (!Array.isArray(entries)) return [];
  const drafts = entries.filter(entry => entry?.status === 'draft' && entry.id && entry.model?.tests?.length);
  const saved = drafts.filter(entry => !entry.sample);
  const ordered = saved.length
   ? saved.sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
   : drafts.sort((a,b) => String(a.title || '').localeCompare(String(b.title || '')));
  return ordered.filter(entry => !hiddenDrafts.has(entry.id));
 }

 function apply() {
  const stack = document.querySelector('[data-overview-draft-stack]');
  if (!stack) return;
  const drafts = getDrafts();
  draftIndex = Math.min(Math.max(0, draftIndex), Math.max(0, drafts.length - 1));
  const draft = drafts[draftIndex];
  const setText = (selector, value) => {
   const element = stack.querySelector(selector);
   if (element.textContent !== value) element.textContent = value;
  };

  setText('[data-draft-position]', `${draftIndex + 1} of ${drafts.length}`);
  const title = draft?.title || 'No drafts to show';
  setText('[data-overview-draft-title]', title);
  stack.querySelector('[data-overview-draft-title]').title = title;
  const step = draft?.step === 2 ? 2 : 1;
  stack.querySelector('[data-overview-draft-progress]').hidden = !draft;
  setText('[data-overview-draft-phase]', draft ? (step === 2 ? 'Review your test' : 'Add test items') : '');
  const progress = stack.querySelector('[data-draft-meter]');
  progress.setAttribute('aria-valuenow', draft ? step : 0);
  progress.setAttribute('aria-valuetext', draft ? `Step ${step} of 4` : 'No draft');
  progress.style.setProperty('--value', draft ? `${step * 25}%` : '0%');
  const dismiss = stack.querySelector('[data-dismiss-draft]');
  dismiss.hidden = !draft;
  dismiss.dataset.dismissDraft = draft?.id || '';
  stack.querySelector('[data-draft-pager]').hidden = drafts.length < 2;
  stack.querySelector('[data-draft-step="-1"]').disabled = draftIndex === 0;
  stack.querySelector('[data-draft-step="1"]').disabled = draftIndex >= drafts.length - 1;

  const resume = stack.querySelector('[data-overview-resume]');
  if (draft) {
   const test = draft.model.tests.find(test => test.id === draft.model.active) || draft.model.tests[0];
   resume.dataset.restoreWork = draft.id;
   resume.href = draft.step === 2 ? 'CAP-T06-Review.dc.html?stage=details' : (test.page || 'CAP-T05-Questions.dc.html');
   resume.textContent = 'Continue draft';
  } else {
   delete resume.dataset.restoreWork;
   resume.href = 'CAP-T04-Setup.dc.html';
   resume.textContent = 'Create new';
  }
 }

 window.capUpdateOverviewDraftStack = apply;
 document.addEventListener('click', event => {
  const dismiss = event.target.closest('[data-dismiss-draft]');
  if (dismiss?.dataset.dismissDraft) {
   hiddenDrafts.add(dismiss.dataset.dismissDraft);
   apply();
   if (dismiss.hidden) dismiss.closest('[data-draft-sheet]').querySelector('[data-overview-resume]').focus();
   return;
  }
  const button = event.target.closest('[data-overview-draft-stack] [data-draft-step]');
  if (!button || button.disabled) return;
  const direction = Number(button.dataset.draftStep);
  draftIndex += direction;
  apply();
  if (button.disabled) button.parentElement.querySelector('button:not(:disabled)')?.focus();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sheet = button.closest('[data-draft-sheet]').querySelector('[data-draft-entry]');
  const style = getComputedStyle(sheet);
  const distance = parseFloat(style.getPropertyValue('--space-1'));
  const duration = parseFloat(style.getPropertyValue('--duration'));
  draftAnimation?.cancel();
  draftAnimation = sheet.animate([
   {opacity: 0.65, transform: `translateX(${direction * distance}px)`},
   {opacity: 1, transform: 'none'}
  ], {duration, easing: 'ease-out'});
 });
 window.addEventListener('storage', event => {
  if (event.key === archiveKey || event.key === null) apply();
 });
 window.addEventListener('pageshow', apply);
})();
