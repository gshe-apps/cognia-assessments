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
  {id:'unit-4-assessment',day:2,type:'Summative',start:510,end:570,title:'Unit 4 Assessment',classLabel:'Grade 7A',grade:'7',status:'check',
   questions:[question('unit-4-1','What is 25% of 80?',['15','20','25','40'],1),question('unit-4-2','A value increases from 40 to 50. What is the percentage increase?',['10%','20%','25%','50%'],2)],
   scores:[
    [1,1],[1,1],[1,0],[1,1],[0,1],[1,1],
    [1,0],[1,1],[1,1],[0,0],[1,1],[1,1],
    [1,1],[0,1],[1,1],[1,0],[1,1],[1,1],
    [1,1],[1,0],[1,1],[0,0],[1,1],[1,1]
   ].map((marks, index) => [`Learner ${index + 1}`, marks])},
  {id:'graphing-practice',day:2,type:'Formative',start:780,end:825,title:'Graphing Practice',classLabel:'Grade 7B',grade:'7',status:'pending',learnerCount:22,
   questions:[question('graph-1','Which point lies on the y-axis?',['(2, 0)','(0, 3)','(3, 2)','(1, 1)'],1),question('graph-2','What is the x-coordinate of (−2, 4)?',['−2','2','4','−4'],0)]},
  {id:'transformations-quiz',day:3,type:'Screeners',start:570,end:615,title:'Transformations Quiz',classLabel:'Grade 6A',grade:'6',status:'pencil',standard:'6.NS.C.8',
   questions:[question('transform-1','Point (2, 3) moves 4 units right. Where is it now?',['(6, 3)','(2, 7)','(−2, 3)','(4, 3)'],0),question('transform-2','Point (5, 1) moves 2 units up. Where is it now?',['(7, 1)','(5, 3)','(3, 1)','(5, −1)'],1)]}
 ];
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
 window.capOverviewCalendar = {events,date,subject,assessment,today,weekStart,addDays,event:events.find(event=>event.id===selected)};
})();
