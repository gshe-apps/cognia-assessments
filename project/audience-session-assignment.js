/* Explicit, persisted student-to-session allocation for the assignment step. */
window.capReferenceAssign = page => {
 page.classList.add('allocation-page');
 const key='cogniaDeliverySessions', esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const classes=[{id:'5a',name:'Grade 5A',students:['Aiden Brooks','Amara Singh','Ben Clarke','Chloe Martin','Daniel Kim','Emma Lewis']},{id:'5b',name:'Grade 5B',students:['Finn Adams','Grace Chen','Hannah Davis','Isaac Evans']}];
 const students=classes.flatMap(c=>c.students.map((name,i)=>({id:c.id+':'+i,name,classId:c.id,support:c.id==='5a'&&[1,4].includes(i)})));
 let old;try{old=JSON.parse(localStorage.getItem(key))}catch{}
 let data=old||{classId:'5a',recipients:[],sessions:[{name:'Session 1',opens:'2026-11-04T09:00',due:'2026-11-04T15:00'}],attempts:'1',time:'None',accommodations:false};
 if(data.allocationVersion!==1){const c=data.classId||'5a';data.classIds=[c];data.recipients=(data.recipients||[]).map(id=>c+':'+id);data.sessions=data.sessions.map((s,i)=>({...s,id:'session-'+(i+1),customRecipients:true,recipients:(s.customRecipients?s.recipients||[]:i===0?(old?.recipients||[]):[]).map(id=>c+':'+id)}));data.allocationVersion=1;}
 const supportOptions=['Text-to-speech','Read aloud','Zoom / Magnifier','Extended time','High contrast','Color overlay','Braille (BRF)','Calculator'];
 data.studentAccommodations ??= {};
 let mode='classes',search='',expanded=new Set((data.classIds||[]).slice(-1)),picker=false,studentExpanded=new Set(data.classIds||[]),bulkSession='',classSessions={};
 const save=()=>{data.classId=data.classIds[0]||'5a';data.sessions.forEach(s=>{s.customRecipients=true;s.recipients=(s.recipients||[]).filter(id=>data.recipients.includes(id))});Object.keys(data.studentAccommodations).forEach(id=>{if(!data.recipients.includes(id))delete data.studentAccommodations[id]});localStorage.setItem(key,JSON.stringify(data))};
 const hero=page.querySelector('.tf-hero');hero.classList.add('allocation-hero');hero.querySelector('h1').textContent='Select students and sessions';hero.querySelector('p').textContent='Pick one or more classes, select students, and set up one or more sessions.';page.querySelector('.tf-top')?.remove();
 hero.querySelector('.tf-steps').innerHTML='<a class="done" href="CAP-T06-Review.dc.html?stage=details"><span>✓</span>Create</a><i aria-hidden="true"></i><a class="active" aria-current="step" href="CAP-T08-AudienceDelivery.dc.html"><span>2</span>Assign</a><i aria-hidden="true"></i><a href="CAP-T09-ConfirmAssignment.dc.html"><span>3</span>Review</a>';
 page.querySelectorAll(':scope > .tf-test-disclosure, :scope > .assessment-test-list').forEach(el=>el.remove());
 const form=page.querySelector('#deliveryForm');form.querySelector('.reviewgrid').remove();
 const host=document.createElement('div');host.className='allocation-grid';form.prepend(host);
 host.innerHTML='<section class="allocation-panel"><div class="allocation-recipient-heading"><div class="allocation-tabs" role="tablist" aria-label="Select recipients"><button type="button" role="tab" aria-selected="true" data-mode="classes">Classes</button><button type="button" role="tab" aria-selected="false" data-mode="students">Students</button></div><button type="button" class="allocation-clear" data-clear-selection>Clear all</button></div><div class="allocation-picker"><div class="allocation-combobox"><span data-class-pills></span><label class="allocation-combo-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg><input type="search" aria-label="Add classes or students" placeholder="Add classes or search..."></label><button type="button" data-toggle-classes aria-expanded="false" aria-controls="allocation-options" aria-label="Select classes"><svg class="allocation-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div><div id="allocation-options" class="allocation-options" hidden></div></div><div class="allocation-selection-toolbar"><label class="allocation-toolbar-selection"><input type="checkbox" data-select-everyone aria-label="Select all students"><strong data-selected-total></strong></label><div class="allocation-bulk-controls"><label for="allocation-bulk-session">Assign session:</label><span class="allocation-select"><select id="allocation-bulk-session"></select><svg class="allocation-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span><button type="button" class="btn solid" data-bulk-assign></button></div></div><div data-rosters></div></section><section class="allocation-panel allocation-sessions"><div class="allocation-heading"><h2>Set up sessions</h2><button type="button" class="btn allocation-add-session" data-add-session>+ Add another session</button></div><div data-sessions></div><details class="allocation-advanced"><summary>Attempts and time limit</summary><div class="allocation-fields"><label>Attempts<span class="allocation-select"><select id="attempts"><option>1</option><option>2</option><option>3</option></select><svg class="allocation-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span></label><label>Time limit<span class="allocation-select"><select id="deliveryTime"><option>None</option><option>5 minutes</option><option>10 minutes</option><option>15 minutes</option><option>20 minutes</option></select><svg class="allocation-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span></label></div></details><p data-allocation-error role="alert" tabindex="-1"></p><p class="allocation-live" role="status" aria-live="polite"></p></section>';
 const assignmentSettings=host.querySelector('.allocation-advanced .allocation-fields').outerHTML;host.querySelector('.allocation-advanced').remove();
 const recipientPanel=host.querySelector('.allocation-panel');
 const recipientColumn=document.createElement('div');
 recipientColumn.className='allocation-recipient-column';
 recipientPanel.before(recipientColumn);
 recipientColumn.append(recipientPanel);
 const supportPanel=document.createElement('section');
 supportPanel.className='allocation-panel allocation-support-panel';
 supportPanel.setAttribute('aria-labelledby','allocation-support-title');
 const supportIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><path d="M7 10h10m-5 0v4m0 0-3 4m3-4 3 4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 const personIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>';
 supportPanel.innerHTML='<div class="allocation-heading"><div class="allocation-support-heading">'+supportIcon+'<div><h2 id="allocation-support-title">Accommodations</h2></div></div><p>Apply accommodations to students</p></div><div data-support-rows></div>';
 recipientColumn.append(supportPanel);
 const className=id=>classes.find(c=>c.id===id).name;
 const supportsFor=id=>data.studentAccommodations[id]||[];
 const chipsFor=student=>supportsFor(student.id).map(option=>'<span class="allocation-pill">'+esc(option)+'<button type="button" data-remove-support="'+esc(option)+'" aria-label="Remove '+esc(option)+' for '+esc(student.name)+'">&times;</button></span>').join('');
 function drawSupport(){
  const recipients=students.filter(s=>data.recipients.includes(s.id));
  const rows=recipients.filter(s=>s.support||Object.hasOwn(data.studentAccommodations,s.id));
  const list=supportPanel.querySelector('[data-support-rows]');
  const openIds=[...list.querySelectorAll('details[open]')].map(d=>d.closest('[data-support-student]').dataset.supportStudent);
  list.innerHTML=rows.length ? rows.map(s=>'<div class="allocation-support-row" data-support-student="'+s.id+'"><div class="allocation-support-person">'+personIcon+'<div><strong>'+esc(s.name)+'</strong><p>'+esc(className(s.classId))+'</p></div></div><div class="allocation-support-editor"><div class="allocation-support-chips" data-support-chips>'+chipsFor(s)+'</div><details class="allocation-support-options" '+(openIds.includes(s.id)?'open':'')+'><summary aria-label="Choose accommodations for '+esc(s.name)+'"><span>Choose accommodations</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div>'+supportOptions.map(option=>'<label><input type="checkbox" value="'+esc(option)+'" '+(supportsFor(s.id).includes(option)?'checked':'')+'>'+esc(option)+'</label>').join('')+'</div></details></div></div>').join('') : '<p>No selected students need accommodations.</p>';
 }
 supportPanel.addEventListener('change',event=>{
  const field=event.target;
  if(!field.matches('.allocation-support-options input'))return;
  const row=field.closest('[data-support-student]');
  const id=row.dataset.supportStudent;
  if(!data.recipients.includes(id))return;
  data.studentAccommodations[id]=supportOptions.filter(option=>option===field.value?field.checked:supportsFor(id).includes(option));
  save();
  row.querySelector('[data-support-chips]').innerHTML=chipsFor(students.find(s=>s.id===id));
 });
 supportPanel.addEventListener('click',event=>{
  const remove=event.target.closest('[data-remove-support]');
  if(!remove)return;
  const row=remove.closest('[data-support-student]');
  const id=row.dataset.supportStudent;
  data.studentAccommodations[id]=supportsFor(id).filter(option=>option!==remove.dataset.removeSupport);
  save();
  for(const field of row.querySelectorAll('input'))field.checked=supportsFor(id).includes(field.value);
  row.querySelector('[data-support-chips]').innerHTML=chipsFor(students.find(s=>s.id===id));
  row.querySelector('summary').focus();
 });
 let statusMessage='';
 const checked=id=>data.recipients.includes(id), roster=c=>students.filter(s=>s.classId===c), selected=c=>roster(c).filter(s=>checked(s.id));
 const sessionOptions=value=>'<option value="">Select session</option>'+data.sessions.map(v=>`<option value="${esc(v.id)}" ${v.id===value?'selected':''}>${esc(v.name)}</option>`).join('');
 const options=id=>'<option value="">Select session</option>'+data.sessions.map(s=>`<option value="${esc(s.id)}" ${s.recipients.includes(id)?'selected':''}>${esc(s.name)}</option>`).join('');
 function studentRow(s){return `<div class="allocation-student"><label><input type="checkbox" name="recipient" value="${s.id}" ${checked(s.id)?'checked':''}><span>${esc(s.name)}</span></label>${s.support?'<span class="allocation-accommodation badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M4 9h16M12 7v7m0 0-4 7m4-7 4 7"/></svg>Accommodations</span>':''}<span class="allocation-select"><select data-assign="${s.id}" aria-label="Session for ${esc(s.name)}" ${!checked(s.id)?'disabled':''}>${options(s.id)}</select><svg class="allocation-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span></div>`}
 function drawRoster(){
 const searchInput=host.querySelector('input[type=search]');
 const searchLabel=mode==='classes'?'Add classes or search...':'Add students or search...';
 searchInput.placeholder=searchLabel;searchInput.setAttribute('aria-label',searchLabel);
 host.querySelector('[data-class-pills]').innerHTML=data.classIds.map(id=>`<span class="allocation-pill">${classes.find(c=>c.id===id).name}<button type="button" data-remove-class="${id}" aria-label="Remove ${classes.find(c=>c.id===id).name}">×</button></span>`).join('');

 host.querySelector('[data-toggle-classes]').setAttribute('aria-expanded',picker);host.querySelector('#allocation-options').hidden=!picker;
 const term=search.trim();
 host.querySelector('[data-toggle-classes]').setAttribute('aria-label',mode==='students'?'Select students':'Select classes');
 host.querySelector('#allocation-options').innerHTML=mode==='classes'?classes.filter(c=>!term||c.name.toLowerCase().includes(term)).map(c=>`<label><input type="checkbox" data-class="${c.id}" ${data.classIds.includes(c.id)?'checked':''}>${c.name}</label>`).join(''):students.filter(v=>!term||(v.name+' '+classes.find(c=>c.id===v.classId).name).toLowerCase().includes(term)).map(v=>`<button type="button" class="allocation-picker-student" data-add-student="${v.id}">${esc(v.name)} <span>${classes.find(c=>c.id===v.classId).name}${checked(v.id)?' · Selected':''}</span></button>`).join('');
 if(!host.querySelector('#allocation-options').innerHTML)host.querySelector('#allocation-options').textContent=mode==='students'?'No students found.':'No classes found.';
 host.querySelector('.allocation-selection-toolbar').hidden=true;host.classList.add('allocation-class-view');
 const visible=students.filter(v=>data.classIds.includes(v.classId)&&(v.name+' '+classes.find(c=>c.id===v.classId).name).toLowerCase().includes(term));
 host.querySelector('[data-selected-total]').textContent=data.recipients.length+' selected';
 if(!data.sessions.some(s=>s.id===bulkSession))bulkSession='';
 const select=host.querySelector('#allocation-bulk-session');select.innerHTML=sessionOptions(bulkSession);select.value=bulkSession;
 host.querySelector('[data-bulk-assign]').textContent='Apply to '+data.recipients.length;
 host.querySelector('[data-rosters]').innerHTML=classes.filter(c=>data.classIds.includes(c.id)).map(c=>{
 const shown=visible.filter(v=>v.classId===c.id);if(!shown.length)return '';
 const isOpen=term?true:expanded.has(c.id),count=selected(c.id).length;
 const assigned=data.sessions.filter(session=>count>0&&selected(c.id).every(v=>session.recipients.includes(v.id)));const value=data.sessions.some(s=>s.id===classSessions[c.id])?classSessions[c.id]:assigned.length===1?assigned[0].id:data.sessions[0]?.id||'';classSessions[c.id]=value;
 return `<section class="allocation-class"><div class="allocation-class-head"><button type="button" class="allocation-class-toggle" data-expand="${c.id}" aria-expanded="${isOpen}" aria-label="${isOpen?'Collapse':'Expand'} ${c.name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="${isOpen?'m6 9 6 6 6-6':'m9 6 6 6-6 6'}"/></svg></button><label class="allocation-class-select"><input type="checkbox" data-all="${c.id}" ${count===roster(c.id).length?'checked':''} aria-label="Select all students in ${c.name}"><strong>${c.name}</strong><span>(${roster(c.id).length} students)</span></label><span class="allocation-class-actions"><span class="allocation-select"><select data-pending-class="${c.id}" aria-label="Session for ${c.name}">${sessionOptions(value)}</select><svg class="allocation-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span><button type="button" class="btn solid" data-apply-class="${c.id}">Apply</button></span></div>${isOpen?shown.map(studentRow).join(''):''}</section>`;
 }).join('');
 if(!visible.length)host.querySelector('[data-rosters]').innerHTML='<p class="allocation-empty">'+(data.classIds.length?'No classes or students match your search.':'Select one or more classes to view students.')+'</p>';
 host.querySelectorAll('[data-select-everyone]').forEach(el=>{const n=visible.filter(v=>checked(v.id)).length;el.checked=visible.length>0&&n===visible.length;el.indeterminate=n>0&&n<visible.length});
 host.querySelectorAll('[data-all]').forEach(el=>{const n=selected(el.dataset.all).length;el.indeterminate=n>0&&n<roster(el.dataset.all).length});
 }
 const duration=s=>{if(s.noLimit)return 'Available at any time';const n=(new Date(s.due)-new Date(s.opens))/60000;return n>0?`${Math.floor(n/60)?Math.floor(n/60)+' hours ':''}${n%60?n%60+' minutes':''}`.trim():'Check access times'};
 function drawSessions(){host.querySelector('[data-sessions]').innerHTML=data.sessions.map((s,i)=>`<section class="allocation-session" data-session-card="${esc(s.id)}"><div class="allocation-session-head"><h3>${esc(s.name)}</h3><span class="allocation-pill" data-count>${s.recipients.length} students</span><details class="allocation-menu"><summary aria-label="Options for ${esc(s.name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div><button type="button" data-settings="${s.id}">Edit settings</button><button type="button" data-duplicate="${s.id}">Duplicate session</button><button type="button" data-delete="${s.id}" ${data.sessions.length===1?'disabled':''}>Remove session</button></div></details></div><div class="allocation-fields"><label>Session name *<input required maxlength="80" data-field="name" value="${esc(s.name)}"></label><label>Date *<input type="date" required data-field="date" value="${esc(s.opens.slice(0,10))}" ${s.noLimit?'disabled':''}></label><label>Start time *<input type="time" required data-field="start" value="${esc(s.opens.slice(11,16))}" ${s.noLimit?'disabled':''}></label><label>End time *<input type="time" required data-field="end" value="${esc(s.due.slice(11,16))}" ${s.noLimit?'disabled':''}></label></div><div class="allocation-session-foot"><div><span>Assigned to:</span><span data-assigned>${assignedPills(s)}</span></div></div><details class="allocation-settings"><summary>Access settings and instructions</summary>${i===0?assignmentSettings:''}<label class="allocation-check"><input type="checkbox" data-anytime ${s.noLimit?'checked':''}>Available at any time</label><label>Session instructions<textarea maxlength="500" data-instructions rows="2">${esc(s.instructions||'')}</textarea></label></details></section>`).join('');host.querySelector('#attempts').value=data.attempts||'1';host.querySelector('#deliveryTime').value=data.time||'None';}
 function assignedPills(s){return s.recipients.length?s.recipients.slice(0,3).map(id=>`<span class="allocation-pill">${esc(students.find(v=>v.id===id)?.name||id)}</span>`).join('')+(s.recipients.length>3?`<span class="allocation-pill">+${s.recipients.length-3}</span>`:''):'No students assigned'}
 function counts(){drawSupport();host.querySelectorAll('[data-session-card]').forEach(el=>{const s=data.sessions.find(s=>s.id===el.dataset.sessionCard);el.querySelector('[data-count]').textContent=s.recipients.length+' students';el.querySelector('[data-assigned]').innerHTML=assignedPills(s)});host.querySelector('.allocation-live').textContent=data.recipients.length+' students selected; '+data.recipients.filter(id=>data.sessions.some(s=>s.recipients.includes(id))).length+' assigned to sessions.'}
 function assign(ids,sessionId){ids.forEach(id=>data.sessions.forEach(s=>{s.recipients=s.recipients.filter(v=>v!==id);if(s.id===sessionId)s.recipients.push(id)}));save();drawRoster();counts()}
 function classSelect(id,on){if(on){data.classIds=[...new Set([...data.classIds,id])];expanded.clear();expanded.add(id);studentExpanded.add(id)}else{data.classIds=data.classIds.filter(v=>v!==id);data.recipients=data.recipients.filter(v=>!roster(id).some(s=>s.id===v))}save();drawRoster();counts()}
 function addSession(source){const id='session-'+Date.now();data.sessions.push({...source,id,name:'Session '+(data.sessions.length+1),customRecipients:true,recipients:[]});save();drawRoster();drawSessions();host.querySelector(`[data-session-card="${id}"] input`).focus()}
 host.addEventListener('focusin',e=>{if(e.target.type==='search'&&!picker){picker=true;drawRoster()}});
 host.addEventListener('click',e=>{if(e.target.closest('.allocation-combobox')&&!e.target.closest('button,input')){picker=!picker;drawRoster();return}const b=e.target.closest('button');if(!b)return;
 if(b.dataset.applyClass){const ids=selected(b.dataset.applyClass).map(v=>v.id);if(!ids.length)statusMessage='Select students in this class first.';else if(classSessions[b.dataset.applyClass]){assign(ids,classSessions[b.dataset.applyClass]);statusMessage='Session applied to selected students in this class.'}}
 if(b.dataset.clearClass){const ids=roster(b.dataset.clearClass).map(v=>v.id);data.recipients=data.recipients.filter(id=>!ids.includes(id));save();drawRoster();counts();statusMessage='Class selection cleared.'}
 if(b.hasAttribute('data-clear-selection')){data.recipients=[];save();drawRoster();counts();statusMessage='Selection cleared.'}
 if(b.dataset.removeClass){classSelect(b.dataset.removeClass,false);return}
 if(b.hasAttribute('data-toggle-classes')){picker=!picker;drawRoster()}
 if(b.dataset.mode){mode=b.dataset.mode;host.querySelectorAll('[data-mode]').forEach(t=>t.setAttribute('aria-selected',t===b));drawRoster()}
 if(b.dataset.expand){const openSet=expanded;const wasOpen=openSet.has(b.dataset.expand);openSet.clear();if(wasOpen)openSet.delete(b.dataset.expand);else openSet.add(b.dataset.expand);drawRoster()}
 if(b.dataset.addStudent){const student=students.find(v=>v.id===b.dataset.addStudent);data.classIds=[...new Set([...data.classIds,student.classId])];data.recipients=[...new Set([...data.recipients,student.id])];expanded.clear();expanded.add(student.classId);search='';host.querySelector('input[type=search]').value='';picker=false;save();drawRoster();counts()}
 if(b.hasAttribute('data-bulk-assign')){const error={set textContent(value){statusMessage=value}};if(!data.recipients.length||!bulkSession){error.textContent=!data.recipients.length?'Select at least one student.':'Choose a session for bulk assignment.';}else{assign([...data.recipients],bulkSession);error.textContent='Session assigned to '+data.recipients.length+' students.'}}
 if(b.dataset.bulk)assign(selected(b.dataset.bulk).map(s=>s.id),b.dataset.session);
 if(b.hasAttribute('data-add-session'))addSession({opens:data.sessions.at(-1).opens,due:data.sessions.at(-1).due});
 if(b.dataset.duplicate)addSession(data.sessions.find(s=>s.id===b.dataset.duplicate));
 if(b.dataset.delete){const s=data.sessions.find(s=>s.id===b.dataset.delete);data.sessions=data.sessions.filter(v=>v!==s);save();drawRoster();drawSessions();counts();host.querySelector('.allocation-live').textContent=`${s.name} removed. Its students need reassignment.`}
 if(b.dataset.settings){const d=b.closest('.allocation-session').querySelector('.allocation-settings');d.open=true;b.closest('details').open=false;d.querySelector('summary').focus()}
 });
 host.addEventListener('change',e=>{const el=e.target;
 if(el.hasAttribute('data-select-everyone')){const ids=students.filter(v=>data.classIds.includes(v.classId)&&(v.name+' '+classes.find(c=>c.id===v.classId).name).toLowerCase().includes(search.trim())).map(v=>v.id);data.recipients=el.checked?[...new Set([...data.recipients,...ids])]:data.recipients.filter(id=>!ids.includes(id));save();drawRoster();counts()}
 if(el.dataset.class)classSelect(el.dataset.class,el.checked);
 if(el.name==='recipient'){data.recipients=el.checked?[...new Set([...data.recipients,el.value])]:data.recipients.filter(id=>id!==el.value);save();drawRoster();counts()}
 if(el.dataset.all){const ids=roster(el.dataset.all).map(s=>s.id);data.recipients=el.checked?[...new Set([...data.recipients,...ids])]:data.recipients.filter(id=>!ids.includes(id));save();drawRoster();counts()}
 if(el.dataset.pendingClass)classSessions[el.dataset.pendingClass]=el.value;
 if(el.id==='allocation-bulk-session')bulkSession=el.value;
 if(el.dataset.classSession)assign(selected(el.dataset.classSession).map(v=>v.id),el.value);
 if(el.dataset.assign)assign([el.dataset.assign],el.value);
 if(el.name==='accommodations'){data.accommodations=el.checked;save()}
 if(el.id==='attempts'||el.id==='deliveryTime'){data.attempts=host.querySelector('#attempts').value;data.time=host.querySelector('#deliveryTime').value;save()}
 if(el.hasAttribute('data-anytime')){data.sessions.find(s=>s.id===el.closest('[data-session-card]').dataset.sessionCard).noLimit=el.checked;save();drawSessions()}
 });
 host.addEventListener('input',e=>{const el=e.target;if(el.type==='search'){search=el.value.toLowerCase();picker=!!search;drawRoster();return}const box=el.closest('[data-session-card]');if(!box)return;const s=data.sessions.find(s=>s.id===box.dataset.sessionCard);if(el.dataset.field==='name')s.name=el.value;else if(el.dataset.field){const date=box.querySelector('[data-field=date]').value;s.opens=date+'T'+box.querySelector('[data-field=start]').value;s.due=date+'T'+box.querySelector('[data-field=end]').value}if(el.hasAttribute('data-instructions'))s.instructions=el.value;save();box.querySelector('h3').textContent=s.name;drawRoster()});
 document.addEventListener('click',e=>{if(picker&&!e.target.closest('.allocation-picker')){picker=false;drawRoster()}});host.addEventListener('keydown',e=>{if(e.key==='Escape'){picker=false;drawRoster();host.querySelector('[data-toggle-classes]').focus()}});
 const next=page.querySelector('a.solid[href="CAP-T09-ConfirmAssignment.dc.html"]');next.addEventListener('click',e=>{let message='';if(!data.recipients.length)message='Select at least one student.';else if(data.recipients.some(id=>!data.sessions.some(s=>s.recipients.includes(id))))message='Assign every selected student to a session.';else if(data.sessions.some(s=>!s.recipients.length))message='Assign at least one student to each session, or remove the unused session.';else if(!form.reportValidity()||data.sessions.some(s=>!s.name.trim()||(!s.noLimit&&(!s.opens||!s.due||s.due<=s.opens))))message='Complete each session name and set an end time after its start time.';const error=host.querySelector('[data-allocation-error]');error.textContent=message;if(message){e.preventDefault();error.focus()}else save()});
 drawRoster();drawSessions();counts();save();
};
