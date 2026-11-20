/* Keeps the Overview Drafts list in sync with the saved-assessment workflow (the same drafts as Tests, Drafts). */
(() => {
 const archiveKey = 'cogniaAssessmentArchiveV1';
 const reviewPage = 'CAP-T06-Review.dc.html?stage=details';
 const reviewSampleId = 'assessment-sample-shapes';
 const shown = 3;
 const filePen = '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z" /></svg>';
 const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 function opensInReview(draft) {
  return draft.step === 2 || (!draft.step && draft.sample && draft.id === reviewSampleId);
 }

 // Every draft. Tests, Drafts lists the same set.
 function getDrafts() {
  let entries;
  try { entries = JSON.parse(localStorage.getItem(archiveKey) || '[]'); }
  catch { return []; }
  if (!Array.isArray(entries)) return [];
  const drafts = entries.filter(entry => entry?.status === 'draft' && entry.id && entry.model?.tests?.length);
  // Most recently changed first, the same order as Tests, Drafts (sorted by Last updated).
  return drafts.sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')) || String(a.title || '').localeCompare(String(b.title || '')));
 }

 function row(draft) {
  const test = draft.model.tests.find(test => test.id === draft.model.active) || draft.model.tests[0];
  const inReview = opensInReview(draft);
  const href = inReview ? reviewPage : (test.page || 'CAP-T05-Questions.dc.html');
  const open = inReview && !draft.step ? `data-overview-sample-review="${esc(draft.id)}"` : `data-restore-work="${esc(draft.id)}"`;
  // A draft made for a class shows the class ("Grade 6A"); otherwise its grade and subject.
  const context = draft.classLabel || [test.grade && 'Grade ' + test.grade, test.subject].filter(Boolean).join(' ');
  return `<div role="listitem"><a class="item" href="${esc(href)}" ${open}>
   <span class="item-media item-media-icon">${filePen}</span>
   <span class="item-content"><span class="item-title">${esc(draft.title)}</span>${context ? `<span class="item-description">${esc(context)}</span>` : ''}</span>
   <span class="item-actions item-actions-reveal"><span class="btn btn-ghost btn-sm">Continue</span></span>
  </a></div>`;
 }

 function apply() {
  const stack = document.querySelector('[data-overview-draft-stack]');
  if (!stack) return;
  const drafts = getDrafts();
  const count = stack.querySelector('[data-draft-count]');
  count.textContent = drafts.length;
  count.hidden = !drafts.length;
  const list = stack.querySelector('[data-draft-list]');
  if (drafts.length) list.setAttribute('role', 'list'); else list.removeAttribute('role');
  list.innerHTML = drafts.length
   ? drafts.slice(0, shown).map(row).join('')
   : `<div class="empty-state"><span class="empty-media">${filePen}</span><p class="empty-title">No drafts</p><p>Tests you save as a draft show here.</p></div>`;
 }

 window.capUpdateOverviewDraftStack = apply;
 document.addEventListener('click', event => {
  const sample = event.target.closest('[data-overview-sample-review]');
  if (!sample) return;
  event.preventDefault();
  window.capRestoreWork(sample.dataset.overviewSampleReview, null, reviewPage);
 });
 window.addEventListener('storage', event => {
  if (event.key === archiveKey || event.key === null) apply();
 });
 window.addEventListener('pageshow', apply);
})();
