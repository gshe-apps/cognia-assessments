(() => {
 'use strict';
 let currentForm;
 const choices = new Map();
 const selected = () => [...currentForm.querySelectorAll('input[name="releaseStudent"]:checked')];
 const make = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
 };
 function update() {
  const count = selected().length;
  currentForm.querySelector('[data-release-count]').textContent = count;
  currentForm.querySelector('[data-release-count]').setAttribute('aria-live', 'polite');
  currentForm.querySelector('[data-release-eligibility]').textContent = count ? 'Ready to release' : 'Select learners';
  currentForm.querySelector('[data-preview-all]').disabled = count === 0;
  currentForm.querySelectorAll('[data-preview-student]').forEach(button => {
   button.disabled = !selected().some(input => input.value === button.dataset.previewStudent);
  });
  currentForm.querySelector('#releaseError').textContent = count ? '' : 'Select at least one learner to preview or release feedback.';
  currentForm.querySelector('.feedback-release-actions a').setAttribute('aria-disabled', String(count === 0));
 }
 function preview(trigger) {
  const learners = selected().filter(input => !trigger.dataset.previewStudent || input.value === trigger.dataset.previewStudent);
  if (!learners.length) return;
  const dialog = make('dialog', 'dialog feedback-preview');
  dialog.setAttribute('aria-labelledby', 'feedback-preview-title');
  const header = make('div', 'dialog-header');
  const title = make('h2', 'dialog-title', 'Preview learner view');
  title.id = 'feedback-preview-title';
  const close = make('button', 'btn btn-ghost btn-icon dialog-close');
  close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18m0-12 12 12"/></svg>';
  close.type = 'button';
  close.setAttribute('aria-label', 'Close preview');
  close.addEventListener('click', () => dialog.close());
  const description = make('p', 'dialog-description', 'Preview only. Feedback remains private until released.');
  description.id = 'feedback-preview-description';
  dialog.setAttribute('aria-describedby', description.id);
  header.append(title, close, description);
  const body = make('div', 'dialog-body');
  const switcher = make('div', 'tabs-list');
  switcher.setAttribute('role', 'group');
  switcher.setAttribute('aria-label', 'Selected learners');
  const content = make('section', 'feedback-preview-content');
  const buttons = [];
  function show(input) {
   buttons.forEach(({button, learner}) => button.setAttribute('aria-pressed', String(learner === input)));
   content.replaceChildren();
   const row = input.closest('[data-release-learner]');
   const enabled = option => row.querySelector('[data-feedback-option="' + option + '"]').getAttribute('aria-checked') === 'true';
   const name = row.querySelector('.item-title').textContent;
   const identity = make('div', 'item item-muted');
   const identityDetails = make('div', 'item-content');
   identityDetails.append(make('h3', 'item-title', name), make('p', 'item-description', 'Fractions check · Grade 5A · Version 1'));
   identity.append(row.querySelector('.avatar').cloneNode(true), identityDetails);
   content.append(identity);
   if (enabled('grades')) {
    const points = make('div', 'item item-outline');
    const fields = make('div', 'item-content');
    fields.append(make('h4', 'item-title', 'Total points'), make('p', 'text-body-base', row.querySelector('[data-learner-points]').textContent));
    points.append(fields);
    content.append(points);
   }
   if (enabled('comments')) {
    const comments = make('div', 'item item-outline');
    const fields = make('div', 'item-content');
    // Use saved educator feedback when available; never invent a comment.
    let feedback = '';
    const responseId = {s1:'03', s2:'04'}[input.value];
    try { feedback = JSON.parse(localStorage.getItem('capFractionsCheckScoreV1:' + responseId) || 'null')?.feedback || ''; } catch {}
    fields.append(make('h4', 'item-title', 'Educator comments'), make('p', 'text-body-base', feedback || 'No educator comments have been added.'));
    comments.append(fields);
    content.append(comments);
   }
   if (!enabled('grades') && !enabled('comments')) {
    content.append(make('p', 'text-body-small text-muted-foreground', 'Points and educator comments are hidden.'));
   }
  }
  learners.forEach(input => {
   const button = make('button', 'tab', input.closest('[data-release-learner]').querySelector('.item-title').textContent);
   button.type = 'button';
   button.addEventListener('click', () => show(input));
   buttons.push({button, learner:input});
   switcher.append(button);
  });
  if (learners.length > 1) body.append(switcher);
  body.append(content);
  dialog.append(header, body);
  document.body.append(dialog);
  show(learners[0]);
  dialog.addEventListener('close', () => { dialog.remove(); trigger.focus(); }, {once:true});
  dialog.showModal();
 }
 function mount() {
  const form = document.getElementById('releaseForm');
  if (!form || currentForm === form) return;
  currentForm = form;
  form.querySelectorAll('input[type="checkbox"]').forEach(input => {
   const key = input.name + ':' + input.value;
   if (choices.has(key)) input.checked = choices.get(key);
   else choices.set(key, input.checked);
  });
  form.querySelectorAll('[data-feedback-option]').forEach(button => {
   const key = button.closest('tr').querySelector('input').value + ':' + button.dataset.feedbackOption;
   if (choices.has(key)) button.setAttribute('aria-checked', String(choices.get(key)));
  });
  update();
 }
 document.addEventListener('change', event => {
  if (!currentForm?.contains(event.target) || !event.target.matches('input[type="checkbox"]')) return;
  choices.set(event.target.name + ':' + event.target.value, event.target.checked);
  update();
 });
 document.addEventListener('click', event => {
  const option = event.target.closest('[data-feedback-option]');
  if (option && currentForm?.contains(option)) {
   const checked = option.getAttribute('aria-checked') !== 'true';
   option.setAttribute('aria-checked', String(checked));
   choices.set(option.closest('tr').querySelector('input').value + ':' + option.dataset.feedbackOption, checked);
  }
  const trigger = event.target.closest('[data-action="feedbackPreview"]');
  if (trigger && currentForm?.contains(trigger)) { event.preventDefault(); preview(trigger); }
  if (event.target.closest('.feedback-release-actions a[aria-disabled="true"]')) event.preventDefault();
 });
 new MutationObserver(mount).observe(document.body, {childList:true, subtree:true});
 mount();
})();
