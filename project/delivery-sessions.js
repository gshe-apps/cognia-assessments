document.addEventListener('DOMContentLoaded',()=>{
 const key='cogniaDeliverySessions';
 const defaults={classId:'5a',recipients:['0','1','2','3','4','5'],accommodations:false,attempts:'1',time:'None',sessions:[{name:'Session 1',opens:'2026-10-20T09:00',due:'2026-10-20T15:00'}]};
 let saved;try{saved=JSON.parse(localStorage.getItem(key));}catch{}
 let data=saved&&Array.isArray(saved.sessions)&&saved.sessions.length?saved:defaults;
 const save=()=>localStorage.setItem(key,JSON.stringify(data));
 const format=value=>new Intl.DateTimeFormat('en-ZA',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Johannesburg'}).format(new Date(value+'+02:00'))+' SAST';
 const list=document.getElementById('session-list');
 if(list){
   const form=document.getElementById('deliveryForm');
   const cls=document.getElementById('classId');cls.value=data.classId;
   document.getElementById('attempts').value=data.attempts;
   document.getElementById('deliveryTime').value=data.time;
   const accommodation=form.querySelector('[name=accommodations]');accommodation.checked=data.accommodations;
   const drawRecipients=()=>{
     const labels=[...form.querySelectorAll('[name=recipient]')];const count=cls.value==='5b'?4:6;
     labels.forEach((input,i)=>{input.closest('label').hidden=i>=count;input.checked=i<count&&data.recipients.includes(input.value);});
     document.querySelector('.roster-list legend').textContent='Recipients · '+count+' students';
   };
   drawRecipients();
   function render(){
     list.replaceChildren();
     data.sessions.forEach((session,index)=>{
       const box=document.createElement('section');box.className='session-card';box.setAttribute('aria-label','Session '+(index+1));
       box.innerHTML=`<div class="session-card-head"><b>Session ${index+1}</b>${data.sessions.length>1?'<button type="button" class="session-remove">Remove</button>':''}</div><div class="field"><label for="session-name-${index}">Session name</label><input id="session-name-${index}" maxlength="80" required></div><div class="field"><label for="session-opens-${index}">Opens</label><input id="session-opens-${index}" type="datetime-local" required></div><div class="field"><label for="session-due-${index}">Closes</label><input id="session-due-${index}" type="datetime-local" required></div>`;
       ['name','opens','due'].forEach(field=>{const input=box.querySelector('#session-'+field+'-'+index);input.value=session[field];input.addEventListener('input',()=>{session[field]=input.value;save();});});
       const remove=box.querySelector('button');if(remove){remove.setAttribute('aria-label','Remove session '+(index+1));remove.addEventListener('click',()=>{data.sessions.splice(index,1);save();render();document.getElementById('add-session').focus();});}
       if(window.capReferenceSession)window.capReferenceSession(box,session,index,save);
       list.append(box);
     });
   }
   render();
   document.getElementById('add-session').addEventListener('click',()=>{
     const previous=data.sessions.at(-1);let start=new Date(previous.due+'+02:00');if(!Number.isFinite(start.getTime()))start=new Date('2026-10-21T09:00:00+02:00');
     const local=d=>new Date(d.getTime()+7200000).toISOString().slice(0,16);
     data.sessions.push({name:'Session '+(data.sessions.length+1),opens:local(start),due:local(new Date(start.getTime()+3600000))});save();render();document.getElementById('session-name-'+(data.sessions.length-1)).focus();
   });
   const sync=()=>{data.classId=cls.value;data.recipients=[...form.querySelectorAll('[name=recipient]:checked')].filter(el=>!el.closest('label').hidden).map(el=>el.value);data.accommodations=accommodation.checked;data.attempts=document.getElementById('attempts').value;data.time=document.getElementById('deliveryTime').value;save();};
   cls.addEventListener('change',()=>{data.classId=cls.value;data.recipients=Array.from({length:cls.value==='5b'?4:6},(_,i)=>String(i));drawRecipients();sync();});
   form.addEventListener('change',sync);
   const next=form.querySelector('a[href="CAP-T09-ConfirmAssignment.dc.html"]');
   next.addEventListener('click',event=>{
     sync();const error=document.getElementById('deliveryError');let message='';
     if(!data.recipients.length)message='Select at least one student.';else if(data.sessions.some(s=>s.customRecipients&&!s.recipients?.length))message='Select at least one student for each session.';
     else if(!data.accommodations)message='Confirm that you have checked accommodations and recipient access.';
     else if(!form.reportValidity())message='Complete the session name and access times.';
     else if(data.sessions.some(s=>!s.name.trim()||(!s.noLimit&&(!s.opens||!s.due||s.due<=s.opens))))message='Each session must have a name and close after it opens.';
     else {
       const sorted=data.sessions.filter(s=>!s.noLimit).sort((a,b)=>a.opens.localeCompare(b.opens));
       if(sorted.some((s,i)=>i&&s.opens<sorted[i-1].due))message='Session windows overlap. Adjust the times so each session has its own access window.';
     }
     error.textContent=message;if(message){event.preventDefault();error.tabIndex=-1;error.focus();}
   });
 }else{
   const summary=document.querySelector('.summary-list');if(!summary)return;
   const values={'Class':data.classId==='5b'?'Grade 5B':'Grade 5A','Recipients':data.recipients.length+' students','Attempts / time':data.attempts+' · '+(data.time==='None'?'No time limit':data.time)};
   [...summary.children].forEach(row=>{const name=row.querySelector('dt')?.textContent;if(name==='Opens'||name==='Due')row.remove();else if(values[name])row.querySelector('dd').textContent=values[name];});
   const row=document.createElement('div');const dt=document.createElement('dt');dt.textContent='Sessions ('+data.sessions.length+')';const dd=document.createElement('dd');dd.className='session-summary';
   data.sessions.forEach(s=>{const item=document.createElement('div');item.className='session-summary-item';const name=document.createElement('b');name.textContent=s.name;item.append(name,document.createTextNode(s.noLimit?'Available at any time':format(s.opens)+' – '+format(s.due)));dd.append(item);});row.append(dt,dd);summary.append(row);
   const ready=document.querySelector('.readiness');if(ready)ready.children[1].textContent=data.recipients.length+' recipients selected';
   const schedule=document.querySelector('a[href="CAP-T10-Scheduled.dc.html"]');if(schedule)schedule.addEventListener('click',event=>{if(!data.accommodations||!data.recipients.length){event.preventDefault();document.getElementById('confirmError').textContent='Return to Audience & delivery to confirm recipients and accommodations.';}else{data.scheduled=true;save();}});
 }
});
