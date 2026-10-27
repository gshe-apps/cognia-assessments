// Lincoln Middle School, Winter ’27 Reading interim. Sample data for the School Administrator prototype.
// One source for the School Overview, Classrooms and Subgroups screens, so grade and classroom figures always
// add up to the school totals (310 students, 46% completion, 48% at or above benchmark).
// Classrooms are named by grade and subject (ELA or Maths), two sections each, with the teacher as supporting detail.
// Grades 6 and 7 hold the participation gaps and the declining results; Grades 8 and 9 are steadier.
window.CG_INTERIM = (function () {
  const GL = { 6: 'Grade 6', 7: 'Grade 7', 8: 'Grade 8', 9: 'Grade 9' };
  const ORDER = ['6', '7', '8', '9'];
  // total = enrolled, done = completed the interim, ab = % of completers at or above benchmark, tr = change in ab since Fall ’26
  const CLS = [
    { subject: 'ELA', teacher: 'Ms Taylor', grade: '6', total: 20, done: 6, ab: 33, tr: -11, checks: 0 },
    { subject: 'ELA', teacher: 'Mr Walsh', grade: '6', total: 19, done: 6, ab: 40, tr: -7, checks: 1 },
    { subject: 'Maths', teacher: 'Ms Lee', grade: '6', total: 20, done: 9, ab: 45, tr: -4, checks: 5 },
    { subject: 'Maths', teacher: 'Mr Carter', grade: '6', total: 19, done: 8, ab: 47, tr: -3, checks: 3 },
    { subject: 'ELA', teacher: 'Mr Park', grade: '7', total: 20, done: 7, ab: 38, tr: -9, checks: 0 },
    { subject: 'ELA', teacher: 'Ms Rahman', grade: '7', total: 19, done: 9, ab: 49, tr: -2, checks: 4 },
    { subject: 'Maths', teacher: 'Mr Kim', grade: '7', total: 20, done: 8, ab: 45, tr: -3, checks: 1 },
    { subject: 'Maths', teacher: 'Ms Patel', grade: '7', total: 19, done: 10, ab: 52, tr: 1, checks: 7 },
    { subject: 'ELA', teacher: 'Ms Nguyen', grade: '8', total: 20, done: 10, ab: 51, tr: 1, checks: 5 },
    { subject: 'ELA', teacher: 'Mr Adams', grade: '8', total: 19, done: 10, ab: 50, tr: 0, checks: 3 },
    { subject: 'Maths', teacher: 'Ms Gomez', grade: '8', total: 20, done: 11, ab: 53, tr: 4, checks: 6 },
    { subject: 'Maths', teacher: 'Mr Brooks', grade: '8', total: 19, done: 10, ab: 51, tr: 2, checks: 2 },
    { subject: 'ELA', teacher: 'Ms Ortiz', grade: '9', total: 20, done: 11, ab: 51, tr: 3, checks: 4 },
    { subject: 'ELA', teacher: 'Mr Hughes', grade: '9', total: 19, done: 10, ab: 52, tr: 1, checks: 2 },
    { subject: 'Maths', teacher: 'Ms Shah', grade: '9', total: 19, done: 10, ab: 54, tr: 2, checks: 3 },
    { subject: 'Maths', teacher: 'Mr Doyle', grade: '9', total: 18, done: 9, ab: 50, tr: 0, checks: 1 }
  ].map((c) => Object.assign(c, { name: GL[c.grade] + ' ' + c.subject, key: GL[c.grade] + ' ' + c.subject + ' · ' + c.teacher }));
  // Two lowest reading standards per grade (sample).
  const STD = {
    6: [['RI.6.1', 'Cite text evidence to support analysis'], ['RL.6.2', 'Determine a theme and summarize']],
    7: [['RI.7.1', 'Cite several pieces of text evidence'], ['RI.7.2', 'Determine central ideas and summarize']],
    8: [['RI.8.1', 'Cite the strongest text evidence'], ['RL.8.2', 'Analyze theme development']],
    9: [['RI.9-10.1', 'Cite strong and thorough evidence'], ['RL.9-10.2', 'Analyze theme and its development']]
  };
  // School trend by window: Fall ’25, Winter ’26, Spring ’26, Fall ’26, Winter ’27.
  const BASE = [49, 51, 54, 52, 48];
  const COMP = [95, 93, 91, 96, 46];

  const agg = (list) => {
    const total = list.reduce((a, c) => a + c.total, 0), done = list.reduce((a, c) => a + c.done, 0);
    const abN = list.reduce((a, c) => a + c.done * c.ab, 0), trN = list.reduce((a, c) => a + c.done * c.tr, 0);
    return { total, done, ab: Math.round(abN / done), tr: Math.round(trN / done) || 0, atAbove: Math.round(abN / 100), checks: list.reduce((a, c) => a + c.checks, 0), teachers: list.length };
  };
  const trTxt = (t) => t > 0 ? 'Up ' + t + (t === 1 ? ' point' : ' points') : t < 0 ? 'Down ' + (-t) + (t === -1 ? ' point' : ' points') : 'No change';
  const finish = (u) => {
    u.pct = Math.round(100 * u.done / u.total);
    u.gap = u.pct < 50; u.bel = u.ab < 50;
    u.dir = u.tr > 0 ? 'up' : u.tr < 0 ? 'dn' : 'fl';
    u.trAria = trTxt(u.tr);
    u.series = [BASE[0] + u.ab - 48, BASE[1] + u.ab - 48, BASE[2] + u.ab - 48, u.ab - u.tr, u.ab];
    return u;
  };
  const school = finish(Object.assign({ kind: 'school', key: 'school', name: 'Lincoln Middle School', sub: 'Grades 6–9' }, agg(CLS)));
  // The school line follows the trend chart (down 4 points since Fall ’26, as in the district table).
  school.series = BASE.slice(); school.tr = BASE[4] - BASE[3]; school.dir = 'dn'; school.trAria = trTxt(school.tr);
  const grades = ORDER.map((g, i) => finish(Object.assign({ kind: 'grade', key: g, ord: i, name: GL[g], grades: [g],
    sub: '4 classrooms', classes: CLS.filter((c) => c.grade === g).map((c) => c.key) }, agg(CLS.filter((c) => c.grade === g)))));
  const classes = CLS.map((c, i) => finish(Object.assign({ kind: 'class', key: c.key, ord: i, name: c.name, grades: [c.grade],
    sub: c.teacher, teacher: c.teacher, subject: c.subject, classes: [c.key] }, agg([c]))));
  const lists = { grade: grades, class: classes };
  const find = (kind, key) => (lists[kind] || []).find((u) => u.key === key) || null;
  // Student groups: points below the unit's own result, as in the district view.
  const GROUPS = [['English learners', -13, -4, 0.12], ['Students with disabilities', -15, -6, 0.1], ['Economically disadvantaged', -4, -3, 0.36]];
  return { GL, ORDER, STD, BASE, COMP, GROUPS, school, grades, classes, lists, find, trTxt };
})();
