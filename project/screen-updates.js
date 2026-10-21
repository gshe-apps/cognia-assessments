document.addEventListener('DOMContentLoaded', () => {
  const key = 'cogniaAssessmentWork';
  const get = () => { try { return JSON.parse(localStorage.getItem(key)) || {tests:1}; } catch { return {tests:1}; } };
  const save = patch => localStorage.setItem(key, JSON.stringify({...get(), ...patch}));
  if (new URLSearchParams(location.search).has('additionalTest')) {
    const title = document.getElementById('title');
    if (title) title.value = 'Fractions check · Test ' + (get().tests + 1);
    const next = document.getElementById('setupContinue');
    next?.addEventListener('click', () => save({tests:get().tests + 1}));
  }
  const instructions = document.getElementById('instructions');
  const limit = document.getElementById('timeLimit');
  const work = get();
  if (instructions && work.instructions) instructions.value = work.instructions;
  if (limit && work.limit) limit.value = work.limit;
  const count = () => { const el = document.getElementById('instruction-count'); if(el) el.textContent = instructions.value.length + '/500'; };
  if(instructions) { count(); instructions.addEventListener('input', () => {count(); save({instructions:instructions.value});}); }
  limit?.addEventListener('change', () => save({limit:limit.value}));
  document.querySelectorAll('.test-count').forEach(el => { if(work.tests > 1) el.textContent = work.tests + ' tests in this assessment'; });
  document.addEventListener('click', event => {
    const bank = event.target.closest('[data-bank]');
    if (bank) { save({banked:true}); bank.textContent = 'Assessment banked ✓'; bank.disabled = true; }
    if (event.target.closest('a[href="CAP-T07-DraftSaved.dc.html"]')) save({draftSaved:true});
    const preview = event.target.closest('[data-action="preview"],[data-action="overviewPreview"]');
    if(preview) window.open('CAP-S05-Question.dc.html','_blank');
    if(event.target.closest('[data-action="allDrafts"]')) location.href='CAP-T03-Assessments.dc.html?view=drafts';
    if(event.target.closest('[data-action="allAssessments"]')) location.href='CAP-T03-Assessments.dc.html';
  });
  const banked = document.getElementById('banked-assessments');
  if(banked && work.banked) banked.innerHTML = '<div class="bank-notice"><b>Banked for later: Fractions check</b><p>Your assessment is saved in this browser and ready to continue.</p><a class="btn ghost" href="CAP-T06-Review.dc.html">Review &amp; assign →</a></div>';
  const tabs = document.querySelector('.assessment-view-tabs');
  if(tabs) {
    const requested = new URLSearchParams(location.search).get('view');
    const view = ['drafts','banked'].includes(requested) ? requested : 'all';
    document.querySelector('.assessment-reference-page').dataset.view = view;
    tabs.querySelector(`[data-view="${view}"]`).setAttribute('aria-current','page');
    if(view !== 'all') {
      document.querySelector('.assessment-reference-heading h1').textContent = view === 'drafts' ? 'Drafts' : 'Banked for later';
      document.querySelector('.assessment-reference-heading p').textContent = view === 'drafts' ? 'Continue an unfinished assessment. Drafts have not been assigned to students.' : 'Saved assessments to review and assign when you need them.';
      document.querySelector('.assessment-reference-drafts h2').textContent = view === 'drafts' ? 'Your drafts (1)' : 'Your banked assessments';
    }
    if(view === 'banked' && !work.banked) banked.innerHTML='<div class="bank-notice">No banked assessments yet. Choose “Bank assessment for later” on the review screen.</div>';
  }
  if (!/CAP-S0[56]-/.test(location.pathname)) return;
  const attemptKey = 'cogniaStudentAttempt';
  let attempt;
  try { attempt = JSON.parse(sessionStorage.getItem(attemptKey)); } catch {}
  if(!attempt) attempt = {index:0, answers:{0:'2'}, deadline:Date.now()+522000};
  const persist = () => sessionStorage.setItem(attemptKey,JSON.stringify(attempt));
  persist();
  const questions = [
    ['Which fraction is greater than ½?', ['¼','⅓','¾','⅖']],
    ['Find the sum: 2/3 + 1/4.', ['3/7','11/12','2/12','3/12']],
    ['Find the difference: 2 1/2 − 1 3/4.', ['1/4','3/4','1 1/4','1 3/4']],
    ['Find the sum: 3/5 + 1/4.', ['4/9','4/20','17/20','19/20']]
  ];
  if(location.pathname.endsWith('CAP-S06-ReviewAnswers.dc.html')) {
    const answered = Object.keys(attempt.answers).length;
    document.querySelector('.student-title p').textContent = `${answered} of 4 questions answered · all changes saved`;
    document.querySelectorAll('.student-review-row').forEach((row,index) => {
      const answer = attempt.answers[index];
      row.querySelector('small').textContent = answer == null ? 'Not answered' : 'ABCD'[answer]+'. '+questions[index][1][answer];
      row.querySelector('.tag').textContent = answer == null ? 'Not answered' : 'Answered';
      row.addEventListener('click', () => {attempt.index=index;persist();});
    });
    if(answered === 4) {
      document.querySelector('.infobox').textContent = 'All questions answered. Review your work, then submit.';
      const next = document.querySelector('.student-actions .solid');
      next.textContent = 'Continue to submit →';next.href='CAP-S07-Submit.dc.html';
    }
    return;
  }
  function renderQuestion() {
    const [stem,options] = questions[attempt.index];
    document.querySelector('.student-question-card legend').textContent = stem;
    document.querySelector('.student-progress-copy b').textContent = `Question ${attempt.index+1} of 4`;
    const progress = document.querySelector('[aria-label="Question progress"]');
    progress.setAttribute('aria-valuenow',attempt.index+1); progress.firstElementChild.style.width = ((attempt.index+1)*25)+'%';
    document.querySelectorAll('.student-answer').forEach((label,index) => {
      label.querySelector('input').checked = attempt.answers[attempt.index] === String(index);
      label.lastElementChild.textContent = options[index];
    });
    document.querySelector('[data-action="stPrevious"]').disabled = attempt.index === 0;
    const next = document.querySelector('[data-next-question]'); next.textContent = attempt.index === 3 ? 'Review answers →' : 'Next question →';
  }
  document.addEventListener('change',event => { if(event.target.name === 'studentAnswer') {attempt.answers[attempt.index] = event.target.value;persist();} });
  document.addEventListener('click',event => {
    if(event.target.closest('[data-next-question]')) { event.preventDefault(); if(attempt.index === 3) location.href='CAP-S06-ReviewAnswers.dc.html'; else {attempt.index++;persist();renderQuestion();} }
    if(event.target.closest('[data-action="stPrevious"]') && attempt.index > 0) {attempt.index--;persist();renderQuestion();}
  });
  function tick() {
    const seconds = Math.max(0,Math.ceil((attempt.deadline-Date.now())/1000));
    const el = document.getElementById('time-remaining');
    if(el) el.textContent = String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    if(seconds === 0) { clearInterval(timer); location.href='CAP-S06-ReviewAnswers.dc.html?timeExpired=1'; }
  }
  renderQuestion(); const timer = setInterval(tick,1000); tick();
});
