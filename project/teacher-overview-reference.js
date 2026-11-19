/* Keeps the Overview draft stack in sync with the existing saved-assessment workflow. */
(() => {
 const archiveKey = 'cogniaAssessmentArchiveV1';
 const reviewPage = 'CAP-T06-Review.dc.html?stage=details';
 const reviewSampleId = 'assessment-sample-shapes';
 let draftIndex = 0;
 let draftAnimation;

 function opensInReview(draft) {
  return draft.step === 2 || (!draft.step && draft.sample && draft.id === reviewSampleId);
 }

 function getDrafts() {
  let entries;
  try { entries = JSON.parse(localStorage.getItem(archiveKey) || '[]'); }
  catch { return []; }
  if (!Array.isArray(entries)) return [];
  const drafts = entries.filter(entry => entry?.status === 'draft' && entry.id && entry.model?.tests?.length);
  const saved = drafts.filter(entry => !entry.sample)
   .sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  const samples = drafts.filter(entry => entry.sample)
   .sort((a,b) => String(a.title || '').localeCompare(String(b.title || '')));
  const titles = new Set();
  const unique = [...saved, ...samples].filter(entry => {
   const title = String(entry.title || '').trim().toLowerCase();
   if (titles.has(title)) return false;
   titles.add(title);
   return true;
  });
  if (unique.length < 2) return unique;
  const [latest, ...others] = unique;
  const next = others.find(entry => opensInReview(entry) !== opensInReview(latest)) || others[0];
  return [latest, next, ...others.filter(entry => entry !== next)].slice(0, 3);
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

  const title = draft?.title || 'No drafts to show';
  setText('[data-overview-draft-title]', title);
  stack.querySelector('[data-overview-draft-title]').title = title;
  const progress = stack.querySelector('[data-overview-draft-progress]');
  progress.parentElement.hidden = !draft;
  const inReview = draft && opensInReview(draft);
  const percent = draft ? (inReview ? 50 : 25) : 0;
  setText('[data-overview-draft-percent]', `${percent}% complete`);
  progress.setAttribute('aria-valuenow', percent);
  progress.style.setProperty('--value', `${percent}%`);
  stack.querySelector('[data-draft-pages]').hidden = drafts.length < 2;
  setText('[data-draft-position]', `${draftIndex + 1} of ${drafts.length}`);
  stack.querySelector('[data-draft-step="-1"]').disabled = draftIndex === 0;
  stack.querySelector('[data-draft-step="1"]').disabled = draftIndex >= drafts.length - 1;

  const resume = stack.querySelector('[data-overview-resume]');
  delete resume.dataset.overviewSampleReview;
  if (draft) {
   const test = draft.model.tests.find(test => test.id === draft.model.active) || draft.model.tests[0];
   if (inReview && !draft.step) {
    delete resume.dataset.restoreWork;
    resume.dataset.overviewSampleReview = draft.id;
   } else {
    resume.dataset.restoreWork = draft.id;
   }
   resume.href = inReview ? reviewPage : (test.page || 'CAP-T05-Questions.dc.html');
   resume.textContent = 'Finish up';
   resume.setAttribute('aria-label','Finish up draft');
  } else {
   delete resume.dataset.restoreWork;
   resume.href = 'CAP-T04-Setup.dc.html';
   resume.textContent = 'Create new';
   resume.removeAttribute('aria-label');
  }
 }

 window.capUpdateOverviewDraftStack = apply;
 document.addEventListener('click', event => {
  const sample = event.target.closest('[data-overview-sample-review]');
  if (sample) {
   event.preventDefault();
   window.capRestoreWork(sample.dataset.overviewSampleReview, null, reviewPage);
   return;
  }
  const button = event.target.closest('[data-overview-draft-stack] [data-draft-step]');
  if (!button || button.disabled) return;
  const direction = Number(button.dataset.draftStep);
  draftIndex += direction;
  apply();
  if (button.disabled) button.parentElement.querySelector('[data-draft-step]:enabled')?.focus();
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
