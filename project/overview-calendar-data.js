/* Sample calendar records shared by Overview and the linked detail screens. */
(() => {
 const question = (id, stem, options, correct, marks = 1) => ({id, stem, options, correct, marks, type:'Multiple choice'});
 const expressions = [
  question('expressions-1','Which expression is equal to 3x + 2x?',['5x','6x','5','x'],0,4),
  question('expressions-2','What is the value of 2x + 5 when x = 4?',['11','13','14','18'],1,4),
  question('expressions-3','Which term is like 3x?',['2x','3y','3','x²'],0),
  question('expressions-4','Which expression means 7 more than twice n?',['7n + 2','2n − 7','2n + 7','n + 14'],2)
 ];
 const events = [
  {id:'algebra-expressions',day:0,type:'Formative',start:510,end:555,title:'Algebra: Expressions',classLabel:'Grade 5A',grade:'5',status:'check',questions:expressions,
   scores:[
    ['Aiden Brooks',[4,4,1,1]],['Amara Singh',[4,3,1,1]],['Ben Clarke',[3,3,1,1]],
    ['Chloe Martin',[4,4,1,1]],['Daniel Kim',[3,2,1,1]],['Emma Lewis',[4,2,1,1]]
   ]},
  {id:'fractions-check',day:1,type:'Formative',start:570,end:615,title:'Fractions check',classLabel:'Grade 5A',grade:'5',status:'review',learnerCount:6,responsesToScore:2},
  {id:'unit-4-assessment',day:2,type:'Summative',start:510,end:570,title:'Unit 4 Test',classLabel:'Grade 7A',grade:'7',status:'check',
   questions:[question('unit-4-1','What is 25% of 80?',['15','20','25','40'],1),question('unit-4-2','A value increases from 40 to 50. What is the percentage increase?',['10%','20%','25%','50%'],2)],
   scores:[
    [1,1],[1,1],[1,0],[1,1],[0,1],[1,1],
    [1,0],[1,1],[1,1],[0,0],[1,1],[1,1],
    [1,1],[0,1],[1,1],[1,0],[1,1],[1,1],
    [1,1],[1,0],[1,1],[0,0],[1,1],[1,1]
   ].map((marks, index) => [`Learner ${index + 1}`, marks])},
  {id:'graphing-practice',day:2,type:'Formative',start:780,end:825,title:'Graphing Practice',classLabel:'Grade 7B',grade:'7',status:'pending',learnerCount:22,
   questions:[question('graph-1','Which point lies on the y-axis?',['(2, 0)','(0, 3)','(3, 2)','(1, 1)'],1),question('graph-2','What is the x-coordinate of (−2, 4)?',['−2','2','4','−4'],0)]},
  {id:'ratios-exit-ticket',day:3,type:'Formative',start:660,end:690,title:'Ratios Exit Ticket',classLabel:'Grade 6B',grade:'6',status:'pending',learnerCount:24,
   questions:[question('ratio-1','Which ratio is equal to 2:3?',['4:6','3:2','2:5','6:4'],0),question('ratio-2','There are 3 red and 5 blue counters. What is the ratio of red to blue?',['5:3','3:5','3:8','8:3'],1)]},
  {id:'transformations-quiz',day:3,type:'Screeners',start:570,end:615,title:'Transformations Quiz',classLabel:'Grade 6A',grade:'6',status:'pencil',standard:'6.NS.C.8',
   questions:[question('transform-1','Point (2, 3) moves 4 units right. Where is it now?',['(6, 3)','(2, 7)','(−2, 3)','(4, 3)'],0),question('transform-2','Point (5, 1) moves 2 units up. Where is it now?',['(7, 1)','(5, 3)','(3, 1)','(5, −1)'],1)]}
 ];
 // November schedule examples. Day offsets are relative to the sample week starting Nov 16.
 const scheduledSamples = [
  ['number-patterns', -12, 'Number Patterns', '5', 'A', 540, 'What comes next: 4, 8, 12, 16?', ['20','18','22','24']],
  ['geometry-basics', -10, 'Geometry Basics', '5', 'B', 600, 'How many sides does a pentagon have?', ['5','4','6','8']],
  ['data-and-graphs', -5, 'Data & Graphs', '6', 'A', 570, 'Which graph best shows change over time?', ['Line graph','Pie chart','Pictograph','Tally chart']],
  ['measurement', 4, 'Measurement', '5', 'B', 600, 'How many centimetres are in 2 metres?', ['200','20','2','2000']],
  ['angles-and-shapes', 8, 'Angles & Shapes', '6', 'A', 510, 'How many degrees are in a right angle?', ['90','45','180','360']],
  ['shape-properties', 8, 'Shape Properties', '5', 'A', 570, 'How many right angles does a rectangle have?', ['4','2','1','0']],
  ['area-and-perimeter', 8, 'Area & Perimeter', '6', 'B', 660, 'What is the perimeter of a square with sides of 5 cm?', ['20 cm','10 cm','25 cm','15 cm']],
  ['fraction-review', 8, 'Fractions Review', '5', 'B', 780, 'Which fraction is equivalent to one half?', ['2/4','1/3','3/4','1/4']],
  ['algebra-review', 10, 'Algebra Review', '7', 'A', 600, 'What is x if x + 5 = 12?', ['7','5','12','17']],
 ];
 for (const [id, day, title, grade, classGroup, start, stem, options] of scheduledSamples) {
  events.push({id, day, title, grade, classLabel:`Grade ${grade}${classGroup}`, start, end:start+30,
   type:'Formative', status:'pending', learnerCount:24, questions:[question(id+'-1',stem,options,0)]});
 }
 const addDays = (date, count) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
 const today = new Date(2026, 10, 18); // Reference date for the prototype scenario.
 const weekStart = addDays(today, -((today.getDay() + 6) % 7));
 const date = event => addDays(weekStart, event.day);
 const subject = 'Mathematics';
 const assessment = event => {
  const page = 'CAP-T05-Questions.dc.html';
  const test = {id:'calendar-'+event.id,title:event.title,subject,grade:event.grade,standard:event.standard||'',page,questions:event.questions,
   state:{chosen:event.questions.map(q=>q.id),written:Object.fromEntries(event.questions.map(q=>[q.id,q])),edits:{}}};
  return {title:event.title,active:test.id,tests:[test],origin:'builder'};
 };
 const selected = new URLSearchParams(location.search).get('calendarEvent');
 const results = {
  entries: events.filter(event => event.status === 'check'),
  href: event => 'CAP-T13-Results.dc.html?calendarEvent=' + encodeURIComponent(event.id),
  reviewKey: event => 'cogniaResultReviewConfirmed:' + event.id,
  dismissedKey: 'cogniaResultsReadyConfirmedDismissed',
  // A changed score set makes the result ready for review again.
  revision: event => JSON.stringify(event.scores.map(([,points]) => points)),
  read(key) {
   try { return localStorage.getItem(key); } catch { return null; }
  },
  write(key,value) {
   try { localStorage.setItem(key,value); } catch {}
  },
  isReviewed(event) { return this.read(this.reviewKey(event)) === this.revision(event); },
  markReviewed(event) { this.write(this.reviewKey(event),this.revision(event)); }
 };
 window.capOverviewCalendar = {events,date,subject,assessment,today,weekStart,addDays,results,event:events.find(event=>event.id===selected)};
})();
