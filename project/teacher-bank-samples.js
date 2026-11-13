/* Sample teacher-created items for the prototype's three test scopes. */
window.capTeacherBankSamples = {
 fractions: [
  {id:'teacher-fractions-1', standard:'5.NF.A.1', dok:'2', stem:'Find the sum: 3/4 + 2/5.', options:['5/9','5/20','23/20','11/20'], correct:2},
  {id:'teacher-fractions-2', standard:'5.NF.A.2', dok:'2', stem:'A jug holds 5/6 litre of water. You pour out 1/4 litre. How much is left?', options:['4/10 litre','7/12 litre','2/3 litre','1/2 litre'], correct:1}
 ],
 algebra: [
  {id:'teacher-algebra-1', standard:'8.EE.C.7', dok:'2', stem:'Solve 4(x − 2) = 20.', options:['3','5','7','12'], correct:2},
  {id:'teacher-algebra-2', standard:'8.EE.C.7', dok:'2', stem:'Which equation has the same solution as 3x + 2 = 14?', options:['x + 2 = 14','3x = 16','x = 4','x = 12'], correct:2}
 ],
 reading: [
  {id:'teacher-reading-1', standard:'RI.6.1', dok:'2', stem:'The school garden collected 80 litres of rainwater in April. In May, it collected twice as much. Which detail shows that the amount collected increased?', options:['The garden is at a school.','It collected 80 litres in April.','It collected twice as much in May.','The garden collects rainwater.'], correct:2},
  {id:'teacher-reading-2', standard:'RI.6.1', dok:'2', stem:'A library extended its hours, and evening visits increased from 20 to 45 per week. Which detail supports the claim that more people visited in the evening?', options:['The library changed its hours.','Weekly evening visits rose from 20 to 45.','The library has a weekly schedule.','Visitors can borrow books.'], correct:1}
 ]
};
for (const items of Object.values(window.capTeacherBankSamples)) {
 for (const item of items) Object.assign(item,{bank:'teacher', tier:'basic', type:'Multiple choice', marks:1});
}
