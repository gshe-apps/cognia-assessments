(() => {
 const schoolDate = new Intl.DateTimeFormat('en-CA', {
  timeZone:'Africa/Johannesburg', year:'numeric', month:'2-digit', day:'2-digit'
 });
 const today = (now = new Date()) => schoolDate.format(now);
 const schoolClock = new Intl.DateTimeFormat('en-GB', {
  timeZone:'Africa/Johannesburg', hour:'2-digit', minute:'2-digit', hourCycle:'h23'
 });
 const minutesOfDay = now => {
  const [hours,minutes] = schoolClock.format(now).split(':').map(Number);
  return hours*60+minutes;
 };
 const hoursUntilMidnight = now => Math.ceil((24*60-minutesOfDay(now))/60);
 const dateKey = date => [date.getFullYear(), date.getMonth()+1, date.getDate()]
  .map(value => String(value).padStart(2,'0')).join('-');
 const earliestDate = (now = new Date()) => {
  const tomorrow = new Date(today(now)+'T00:00:00Z');
  tomorrow.setUTCDate(tomorrow.getUTCDate()+1);
  return tomorrow.toISOString().slice(0,10);
 };
 const missedCutoff = (sessions, now = new Date()) => {
  const minimum = earliestDate(now);
  return sessions.find(session => !session.noLimit && session.opens && session.opens.slice(0,10) < minimum);
 };
 const cutoffMessage = 'Schedule sessions at least one calendar day ahead. Choose tomorrow or a later date.';
 window.capAssignmentSchedule = {today,dateKey,earliestDate,minutesOfDay,hoursUntilMidnight,missedCutoff,cutoffMessage};
})();
