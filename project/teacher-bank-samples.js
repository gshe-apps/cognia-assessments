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
/* 17 Nov: one or more items for every item bank in the picker, so no bank is empty in Add your items.
   Cognia: Grade 4, 6 Maths and Grade 7, 8 ELA. My banks: Grade 4 warm-ups. Content specialist: Grade 7 and 8 reading. */
window.capBankCoverageItems = [
 {id:'cov-g4-math-1', bank:'cognia', standard:'4.NF.B.3', dok:'1', stem:'Find the sum: 2/8 + 3/8.', options:['5/16','5/8','1/8','6/8'], correct:1},
 {id:'cov-g4-math-2', bank:'cognia', standard:'4.NBT.B.5', dok:'1', stem:'Multiply: 23 × 4.', options:['82','92','27','96'], correct:1},
 {id:'cov-g6-math-1', bank:'cognia', standard:'6.NS.A.1', dok:'2', stem:'How many 1/4 cup servings are in 3/4 cup of yogurt?', options:['1','2','3','4'], correct:2},
 {id:'cov-g6-math-2', bank:'cognia', standard:'6.RP.A.3', dok:'2', stem:'A car travels 150 km in 3 hours. At the same rate, how far does it travel in 5 hours?', options:['200 km','250 km','300 km','450 km'], correct:1},
 {id:'cov-g7-ela-1', bank:'cognia', standard:'RI.7.1', dok:'2', stem:'A town planted 200 trees in spring and 350 in autumn. Which detail best supports the claim that planting increased?', options:['The town planted trees.','It planted 200 trees in spring.','It planted 350 trees in autumn, more than in spring.','Trees grow in autumn.'], correct:2},
 {id:'cov-g8-ela-1', bank:'cognia', standard:'RI.8.2', dok:'2', stem:'An article explains that cycling lanes cut traffic by a third in two years. What is the central idea?', options:['Cycling is a hobby.','Cycling lanes reduced traffic.','Traffic is always heavy.','Two years is a long time.'], correct:1},
 {id:'cov-g4-warmup-1', bank:'teacher', standard:'4.OA.A.3', dok:'1', stem:'Warm-up: Ben has 24 stickers and shares them equally among 4 friends. How many does each friend get?', options:['4','6','8','20'], correct:1},
 {id:'cov-g4-warmup-2', bank:'teacher', standard:'4.NF.A.1', dok:'1', stem:'Warm-up: Which fraction is equal to 1/2?', options:['2/3','3/6','1/4','2/5'], correct:1},
 {id:'cov-spec-reading-1', bank:'specialist', standard:'RI.7.1', dok:'2', stem:'Read the passage about the city library. Which sentence gives evidence that more people now use it at night?', options:['The library has many books.','Evening visits doubled after hours were extended.','The building is old.','Librarians are helpful.'], correct:1},
 {id:'cov-spec-reading-2', bank:'specialist', standard:'RI.8.1', dok:'3', stem:'Read the paired passages about recycling. Which detail appears in both and supports the authors\u2019 shared claim?', options:['Recycling bins are blue.','Recycling saves energy compared with making new materials.','Some people forget to recycle.','Paper is light.'], correct:1}
];
for (const item of window.capBankCoverageItems) Object.assign(item,{tier:'basic', type:'Multiple choice', marks:1});
