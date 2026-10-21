document.addEventListener('DOMContentLoaded',()=>{
 const readAttempt=()=>{try{return JSON.parse(sessionStorage.getItem('cogniaStudentAttempt'));}catch{return null;}};
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-action="stSignOut"]'))location.href='CAP-S01-SignIn.dc.html';
  if(location.pathname.endsWith('CAP-S07-Submit.dc.html')&&event.target.closest('a[href="CAP-S08-Submitted.dc.html"]')){
    const attempt=readAttempt()||{answers:{}};attempt.submitted=true;attempt.submittedAt=new Date().toISOString();sessionStorage.setItem('cogniaStudentAttempt',JSON.stringify(attempt));
  }
 });
 if(!location.pathname.endsWith('CAP-S03-MyWork.dc.html'))return;
 const list=document.querySelector('.student-work-list'),fractions=list.querySelector('.student-work-card'),reading=list.querySelector('.student-reading');
 const attempt=readAttempt();const state=attempt?.submitted?'Submitted':attempt?'In progress':'Available';
 fractions.dataset.workState=state;reading.dataset.workState='Submitted';
 fractions.querySelector('.tag').textContent=state;
 const count=Object.keys(attempt?.answers||{}).length;
 fractions.querySelector('p.muted').textContent=state==='In progress'?`${count} of 4 answers saved. Pick up where you left off.`:state==='Submitted'?'Submitted · awaiting teacher review.': 'Complete during today’s lesson.';
 const open=fractions.querySelector('.student-card-action a');
 if(state==='In progress'){open.href='CAP-S05-Question.dc.html';open.textContent='Continue assessment →';}
 if(state==='Submitted'){open.removeAttribute('href');open.setAttribute('role','button');open.tabIndex=0;open.textContent='View submission status';open.dataset.showSubmission='fractions';open.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open.click();}});}
 const empty=document.createElement('div');empty.className='student-work-empty';empty.setAttribute('role','status');empty.hidden=true;list.append(empty);
 function filter(value){
   document.querySelectorAll('[data-action="stFilter"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===value)));
   [fractions,reading].forEach(card=>card.hidden=value!=='All work'&&card.dataset.workState!==value);
   empty.hidden=[fractions,reading].some(card=>!card.hidden);
   empty.textContent=value==='In progress'?'No work in progress yet. Open an available assessment to get started.':value==='Available'?'No new assessments are available right now. Check In progress or Submitted for your existing work.':'No work to show in this tab.';
 }
 function status(card,isFractions){let detail=card.querySelector('.student-status-detail');if(!detail){detail=document.createElement('div');detail.className='student-status-detail';detail.setAttribute('role','status');detail.textContent=isFractions?'Fractions check has been submitted. Your answers are saved and are awaiting teacher review. Feedback will appear when your teacher releases it.':'Reading reflection has been submitted and is awaiting teacher review. Your teacher has not released feedback yet.';card.append(detail);}else detail.hidden=!detail.hidden;}
 document.addEventListener('click',event=>{const button=event.target.closest('[data-action="stFilter"]');if(button)filter(button.dataset.filter);if(event.target.closest('[data-action="stReading"]'))status(reading,false);if(event.target.closest('[data-show-submission]'))status(fractions,true);});
 filter('All work');
});
