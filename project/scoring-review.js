(() => {
 const overviewPage = 'CAP-T01-Overview.dc.html';
 const queuePage = 'CAP-T14-ScoringQueue.dc.html';
 const scorePage = 'CAP-T15-ScoreResponse.dc.html';
 const learners = {
  '03': {name:'Ava Patel', photo:'assets/avatars/learner-maria-gonzalez.png'},
  '04': {name:'Noah Kim', photo:'assets/avatars/learner-jack-alfredo.png'},
  '05': {name:'Zoe Martin', photo:'assets/avatars/learner-kathrine-benedict.png'},
 };
 const assessmentIcons = {
  divide:'<circle cx="12" cy="6" r="1"/><path d="M5 12h14"/><circle cx="12" cy="18" r="1"/>',
  shapes:'<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/>',
  book:'<path d="M12 7v14"/><path d="M3 18V5a1 1 0 0 1 1-1h3a5 5 0 0 1 5 5 5 5 0 0 1 5-5h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4a4 4 0 0 0-4 2 4 4 0 0 0-4-2H4a1 1 0 0 1-1-1Z"/>',
 };
 const responseFor = (id, answer) => ({id, ...learners[id], answer});
 const assessments = [
  {
   id:'fractions-check', title:'Fractions check', classLabel:'Grade 5A', totalItems:4, icon:'divide', scoredEarlier:1,
   itemLabel:'Explain a fraction misconception',
   prompt:'A learner says 1/2 + 1/3 = 2/5. Explain the error and show the correct sum.',
   guide:'Use equal-sized parts: 1/2 = 3/6 and 1/3 = 2/6, so the sum is 5/6. Denominators are not added.',
   reasoning:'Use a common denominator.', accuracy:'Find the correct sum of 5/6.',
   responses:[
    responseFor('03', 'One half is 3/6. One third is 2/6. Together they make 5/6, not 2/5.'),
    responseFor('04', 'You need a common denominator. One half is 3/6 and one third is 2/6, so I got 5/6.'),
    responseFor('05', 'I changed the denominator to six and added one plus one. My answer is 2/6.'),
   ],
  },
  {
   id:'properties-of-shapes', title:'Properties of shapes', classLabel:'Grade 4B', totalItems:8, icon:'shapes', scoredEarlier:2,
   itemLabel:'Explain how squares and rectangles are related',
   prompt:'Explain why every square is a rectangle, using the properties of both shapes.',
   guide:'A rectangle has four right angles. A square has four right angles too, so it is a rectangle. A square also has four equal sides.',
   reasoning:'Use defining properties to explain the relationship.', accuracy:'Identify four right angles as a shared property.',
   responses:[
    responseFor('03', 'A square has four right angles like a rectangle. All its sides are also the same length.'),
    responseFor('05', 'Squares and rectangles both have four sides, so a square counts as a rectangle.'),
   ],
  },
  {
   id:'reading-comprehension', title:'Reading comprehension', classLabel:'Grade 6B', totalItems:3, icon:'book', scoredEarlier:3,
   itemLabel:'Support an inference with evidence',
   prompt:'The hall was empty, but Maya left the lights on and set out six chairs. What does this suggest, and which detail supports your answer?',
   guide:'Maya is likely expecting people to arrive. The six chairs suggest that she is setting up for a group.',
   reasoning:'Connect the detail to a reasonable inference.', accuracy:'Cite a relevant detail from the passage.',
   responses:[
    responseFor('04', 'Maya is expecting a group to arrive because she set out six chairs in the empty hall.'),
   ],
  },
 ];
 const [fractions] = assessments;
 const params = new URLSearchParams(location.search);
 const assessment = assessments.find(entry => entry.id === params.get('assessment')) || fractions;
 const scorePrefixFor = entry => entry === fractions ? 'capFractionsCheckScoreV1:' : 'capAssessmentScoreV1:' + entry.id + ':';
 const isScoreChange = (event, entry) => event.key === null || event.key.startsWith(scorePrefixFor(entry));
 const queueLink = entry => entry === fractions ? queuePage : queuePage + '?assessment=' + entry.id;
 const responseLink = response => scorePage + '?response=' + response.id + (assessment === fractions ? '' : '&assessment=' + assessment.id);

 function isScored(entry, response) {
  try { return localStorage.getItem(scorePrefixFor(entry) + response.id) !== null; }
  catch { return false; }
 }

 const pending = entry => entry.responses.filter(response => !isScored(entry, response));
 window.capFractionsScoring = {
  isScoreChange: event => isScoreChange(event, fractions),
  totalItems: fractions.totalItems,
  pendingCount: () => pending(fractions).length,
 };
 /* 20 Nov: every test with responses to score, for Overview, Scoring required by you. scoredEarlier stands for
    responses scored before this prototype session, so each test shows real progress (1/4, 2/4, 3/4). */
 window.capScoringQueue = {
  tests: () => assessments.map(entry => {
   const responseIds = pending(entry).map(response => response.id);
   const left = responseIds.length;
   const total = (entry.scoredEarlier || 0) + entry.responses.length;
   return {id:entry.id, title:entry.title, classLabel:entry.classLabel, href:queueLink(entry), scored:total - left, total, left,responseIds};
  }).filter(test => test.left > 0),
  isScoreChange: event => event.key === null || assessments.some(entry => event.key.startsWith(scorePrefixFor(entry))),
 };

 function mountQueue(list) {
  const rowTemplate = document.querySelector('[data-scoring-response-template]').content.firstElementChild;
  const empty = document.querySelector('[data-scoring-empty]');
  const tabs = document.querySelector('[data-scoring-assessment-tabs]');
  tabs.replaceChildren(...assessments.map(entry => {
   const link = document.createElement('a');
   link.className = 'tab scoring-assessment-tab';
   link.href = queueLink(entry);
   const iconTile = document.createElement('span');
   iconTile.className = 'icon-accent scoring-icon';
   iconTile.setAttribute('aria-hidden', 'true');
   iconTile.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + assessmentIcons[entry.icon] + '</svg>';
   const label = document.createElement('span');
   label.className = 'scoring-assessment-label';
   const title = document.createElement('strong');
   title.className = 'text-body-base font-bold';
   title.textContent = entry.title;
   const grade = document.createElement('span');
   grade.className = 'text-body-small font-normal';
   grade.textContent = entry.classLabel;
   label.append(title, grade);
   link.append(iconTile, label);
   if (entry === assessment) link.setAttribute('aria-current', 'page');
   return link;
  }));
  document.querySelector('[data-scoring-insights]').hidden = assessment !== fractions;
  function draw() {
   const remaining = pending(assessment);
   list.replaceChildren(...remaining.map(response => {
    const row = rowTemplate.cloneNode(true);
    row.querySelector('[data-scoring-learner]').textContent = response.name;
    row.querySelector('[data-scoring-photo]').src = response.photo;
    row.querySelector('[data-scoring-item-label]').textContent = 'Item ' + assessment.totalItems + ': ' + assessment.itemLabel;
    row.querySelector('[data-scoring-answer]').textContent = response.answer;
    const link = row.querySelector('a');
    link.href = responseLink(response);
    link.setAttribute('aria-label', link.textContent.trim() + ' for ' + response.name);
    return row;
   }));
   list.hidden = !remaining.length;
   empty.hidden = remaining.length > 0;
  }
  draw();
  return draw;
 }

 function mountScorer(form) {
  const requested = params.get('response');
  const remaining = pending(assessment);
  const response = remaining.find(candidate => candidate.id === requested) || remaining[0];
  if (!response) {
   location.replace(queueLink(assessment));
   return;
  }
  const submit = form.querySelector('[type="submit"]');
  const error = form.querySelector('[data-scoring-error]');
  form.querySelector('[data-scoring-current-learner]').textContent = response.name;
  form.querySelector('[data-scoring-photo]').src = response.photo;
  form.querySelector('[data-scoring-prompt]').textContent = assessment.prompt;
  const firstName = response.name.split(' ')[0];
  form.querySelector('[data-scoring-answer-title]').textContent = firstName + '’s answer';
  form.querySelector('[data-scoring-answer]').textContent = response.answer;
  form.querySelector('[data-scoring-guide]').textContent = assessment.guide;
  form.querySelector('[data-scoring-reasoning]').textContent = assessment.reasoning;
  form.querySelector('[data-scoring-accuracy]').textContent = assessment.accuracy;
  document.querySelector('[data-scoring-back]').href = queueLink(assessment);
  window.capOverviewAttention?.open('score:'+assessment.id+':'+response.id);
  if (remaining.length === 1) submit.firstChild.textContent = 'Save & finish ';

  form.addEventListener('submit', event => {
   event.preventDefault();
   const fields = new FormData(form);
   if (!isScored(assessment, response)) {
    const score = {
     reason:Number(fields.get('reason')),
     accuracy:Number(fields.get('accuracy')),
     feedback:fields.get('teacherFeedback').trim(),
    };
    try { localStorage.setItem(scorePrefixFor(assessment) + response.id, JSON.stringify(score)); }
    catch {
     error.textContent = 'The score could not be saved in this browser. Try again before leaving.';
     return;
    }
   }
   const unscored = pending(assessment);
   const next = unscored.find(candidate => candidate.id > response.id) || unscored[0];
   location.replace(next ? responseLink(next) : overviewPage);
  });
  return () => {
   if (isScored(assessment, response)) location.reload();
  };
 }

 function mount() {
  const canvas = document.querySelector('x-dc');
  const findPage = () => canvas?.querySelector('[data-scoring-responses], #scoreForm');
  let page = findPage();
  if (!page) return;
  const render = () => {
   if (!page.matches('form')) return mountQueue(page);
   canvas.querySelector('[data-scoring-assessment-title]').textContent = assessment.title;
   canvas.querySelector('[data-scoring-assessment-class]').textContent = assessment.classLabel;
   return mountScorer(page);
  };
  let refresh = render();
  new MutationObserver(() => {
   const next = findPage();
   if (!next || next === page) return;
   page = next;
   refresh = render();
  }).observe(canvas, {childList:true});
  window.addEventListener('pageshow', event => {
   if (event.persisted) refresh?.();
  });
  window.addEventListener('storage', event => {
   if (isScoreChange(event, assessment)) refresh?.();
  });
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
 else mount();
})();
