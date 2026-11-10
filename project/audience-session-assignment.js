/* Student selection, inline learner supports and persisted session allocation. */
window.capReferenceAssign = page => {
 const key = 'cogniaDeliverySessions';
 const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const classes = [
  {id:'5a',name:'Grade 5A',students:['Aiden Brooks','Amara Singh','Ben Clarke','Chloe Martin','Daniel Kim','Emma Lewis']},
  {id:'5b',name:'Grade 5B',students:['Finn Adams','Grace Chen','Hannah Davis','Isaac Evans']}
 ];
 const students = classes.flatMap(c => c.students.map((name,i) => ({id:c.id+':'+i,name,classId:c.id,support:c.id==='5a'&&[1,4].includes(i)})));
 let stored;
 try { stored = JSON.parse(localStorage.getItem(key)); } catch {}
 const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Johannesburg',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const data = stored && Array.isArray(stored.sessions) && stored.sessions.length ? stored : {
  allocationVersion:1,classId:'5a',classIds:['5a','5b'],recipients:students.filter(s=>s.classId==='5a').map(s=>s.id),
  sessions:[{id:'session-1',name:'Session 1',opens:today+'T09:00',due:today+'T15:00',customRecipients:true,recipients:students.filter(s=>s.classId==='5a').map(s=>s.id)}],
  attempts:'1',time:'None',accommodations:false
 };
 if (data.allocationVersion !== 1) {
  const c = data.classId || '5a', ids = data.recipients || [];
  data.classIds = [c];
  data.recipients = ids.map(id=>c+':'+id);
  data.sessions = data.sessions.map((s,i)=>({...s,id:'session-'+(i+1),customRecipients:true,recipients:(s.customRecipients?s.recipients||[]:i===0?ids:[]).map(id=>c+':'+id)}));
  data.allocationVersion = 1;
 }
 data.studentAccommodations ??= {};
 data.classIds ??= [data.classId || '5a'];
 const supportOptions = ['Language support','Read aloud','Visual model','Step-by-step hint','Extension','Text-to-speech','Zoom / Magnifier','Extended time','High contrast','Color overlay','Braille (BRF)','Calculator'];
 let remembered = {};
 try { remembered = JSON.parse(localStorage.getItem('cogniaLearnerSupports')) || {}; } catch {}
 let mode='classes', search='', picker=false, classSessions={}, lastReviewScope;
 const expanded = new Set(data.classIds.slice(0,1)), supportExpanded = new Set(), collapsedSessions = new Set(), settingsExpanded = new Set();
 const supportsFor = id => data.studentAccommodations[id] || [];
 const roster = id => students.filter(s=>s.classId===id);
 const checked = id => data.recipients.includes(id);
 const selected = id => roster(id).filter(s=>checked(s.id));
 const needsReview = () => students.some(s=>checked(s.id)&&(s.support||supportsFor(s.id).length));
 const icon = name => {
  const paths = {down:'<path d="m6 9 6 6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',plus:'<path d="M5 12h14M12 5v14"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',person:'<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',edit:'<path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>'};
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
 };
 const iconButton = (attrs,label,name) => '<span class="tooltip-wrap"><button type="button" class="btn btn-ghost btn-icon btn-sm" '+attrs+' aria-label="'+esc(label)+'">'+icon(name)+'</button><span class="tooltip" role="tooltip">'+esc(label)+'</span></span>';
 page.classList.add('allocation-page');
 const hero = page.querySelector('.tf-hero');
 hero.classList.add('allocation-hero');
 hero.querySelector('h1').textContent = 'Students and sessions';
 hero.querySelector('p')?.remove();
 page.querySelector('.tf-top')?.remove();
 window.capRenderAssessmentProgress(hero.querySelector('.tf-steps'),3,['href="CAP-T04-Setup.dc.html"','href="CAP-T05-Questions.dc.html"','href="CAP-T06-Review.dc.html?stage=details"']);
 page.querySelectorAll(':scope > .tf-test-disclosure, :scope > .assessment-test-list').forEach(el=>el.remove());
 const form = page.querySelector('#deliveryForm');
 form.querySelector('.reviewgrid').remove();
 const host = document.createElement('div');
 host.className = 'allocation-grid';
 form.prepend(host);
 host.innerHTML = `<section class="allocation-panel"><div class="card-content allocation-recipient-content">
  <div class="allocation-heading"><div class="tabs-list allocation-mode" role="group" aria-label="Select recipients"><button class="tab" type="button" aria-pressed="true" data-mode="classes">Classes</button><button class="tab" type="button" aria-pressed="false" data-mode="students">Students</button></div><button type="button" class="btn btn-ghost btn-sm" data-clear-selection>Clear all</button></div>
  <div class="allocation-picker"><div class="allocation-search-row search" role="search"><div data-class-pills></div><div class="allocation-search-field"><svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="search-input" type="search" aria-label="Search classes or students" placeholder="Add classes or search..."></div>${iconButton('data-toggle-classes aria-expanded="false" aria-controls="allocation-options"','Select classes','down')}</div><div id="allocation-options" class="menu allocation-options" hidden></div></div>
  <div data-rosters></div><label class="allocation-check text-body-small"><input class="checkbox" type="checkbox" name="accommodations" aria-describedby="allocation-review-error">I’ve checked accommodations and recipient access.</label><p class="text-body-small text-destructive" id="allocation-review-error" role="alert"></p>
 </div></section><section class="allocation-panel allocation-sessions"><div class="card-content"><div class="allocation-heading"><h2 class="text-body-base font-semibold">Set up sessions</h2><button type="button" class="btn btn-outline btn-sm" data-add-session>${icon('plus')}Add another session</button></div><div data-sessions></div><p class="alert alert-destructive" data-allocation-error role="alert" tabindex="-1" hidden></p><p class="allocation-live sr-only" role="status" aria-live="polite"></p></div></section>`;
 const reviewCheckbox = host.querySelector('[name=accommodations]'), reviewError = host.querySelector('#allocation-review-error');
 reviewCheckbox.checked = Boolean(data.accommodations);
 function save() {
  const scope = JSON.stringify([...data.recipients].sort().map(id=>[id,supportsFor(id)]));
  if (lastReviewScope !== undefined && scope !== lastReviewScope) { data.accommodations=false; reviewCheckbox.checked=false; }
  lastReviewScope = scope;
  data.classId = data.classIds[0] || '5a';
  data.sessions.forEach(s=>{s.customRecipients=true;s.recipients=(s.recipients||[]).filter(checked);});
  reviewCheckbox.setAttribute('aria-required',String(needsReview()));
  if (!needsReview() || reviewCheckbox.checked) { reviewError.textContent='';reviewCheckbox.removeAttribute('aria-invalid'); }
  localStorage.setItem(key,JSON.stringify(data));
 }
 function announce(message) { host.querySelector('.allocation-live').textContent=message; }
 function sessionOptions(value) { return '<option value="">Select session</option>'+data.sessions.map(s=>`<option value="${esc(s.id)}" ${s.id===value?'selected':''}>${esc(s.name)}</option>`).join(''); }
 function sessionSelect(attrs,value,disabled=false) { return `<span class="allocation-select"><select class="select" ${attrs} ${disabled?'disabled':''}>${sessionOptions(value)}</select>${icon('down')}</span>`; }
 function supportEditor(student) {
  const options=[...new Set([...supportOptions,...supportsFor(student.id)])];
  return `<div class="card allocation-inline-support" id="supports-${student.classId}-${student.id.split(':')[1]}" ${supportExpanded.has(student.id)?'':'hidden'}><div class="card-content"><div class="allocation-heading"><p class="text-body-small">Select the supports this student needs.</p><label class="allocation-check text-body-small"><input class="checkbox" type="checkbox" data-remember="${student.id}" ${Object.hasOwn(remembered,student.id)?'checked':''}>Save support</label></div><div class="tabs-list allocation-support-choices" role="group" aria-label="Learner supports for ${esc(student.name)}">${options.map(option=>`<button class="tab" type="button" data-support="${esc(option)}" data-student="${student.id}" aria-pressed="${supportsFor(student.id).includes(option)}">${esc(option)}</button>`).join('')}</div></div></div>`;
 }
 function studentRow(student) {
  const session=data.sessions.find(s=>s.recipients.includes(student.id));
  const n=supportsFor(student.id).length, open=supportExpanded.has(student.id);
  return `<div class="allocation-student-wrap"><div class="allocation-student"><label class="allocation-check text-body-small font-semibold"><input class="checkbox" type="checkbox" name="recipient" value="${student.id}" ${checked(student.id)?'checked':''}>${esc(student.name)}</label>${n||student.support?`<span class="badge ${n===1?'badge-info':'badge-warning'}">${icon('person')}${n?n+' support'+(n===1?'':'s'):'Review supports'}</span>`:''}<div class="allocation-student-actions">${sessionSelect(`data-assign="${student.id}" aria-label="Session for ${esc(student.name)}"`,session?.id,!checked(student.id))}${iconButton(`data-expand-support="${student.id}" aria-expanded="${open}" aria-controls="supports-${student.classId}-${student.id.split(':')[1]}"`,(open?'Close':'Edit')+' supports for '+student.name,'edit')}</div></div>${supportEditor(student)}</div>`;
 }
 function drawRoster() {
  host.querySelector('[data-class-pills]').innerHTML = data.classIds.map(id=>`<button type="button" class="btn btn-ghost btn-sm allocation-class-chip" data-remove-class="${id}" aria-label="Remove ${classes.find(c=>c.id===id).name}">${classes.find(c=>c.id===id).name}${icon('x')}</button>`).join('');
  host.querySelector('[data-toggle-classes]').setAttribute('aria-expanded',String(picker));
  const pickerLabel=mode==='students'?'Select students':'Select classes';
  host.querySelector('[data-toggle-classes]').setAttribute('aria-label',pickerLabel);
  host.querySelector('[data-toggle-classes]').nextElementSibling.textContent=pickerLabel;
  const options=host.querySelector('#allocation-options');options.hidden=!picker;
  const term=search.trim().toLowerCase();
  options.innerHTML=mode==='classes'?classes.filter(c=>c.name.toLowerCase().includes(term)).map(c=>`<label class="allocation-check menu-item"><input class="checkbox" type="checkbox" data-class="${c.id}" ${data.classIds.includes(c.id)?'checked':''}>${c.name}</label>`).join(''):students.filter(s=>(s.name+' '+classes.find(c=>c.id===s.classId).name).toLowerCase().includes(term)).map(s=>`<button type="button" class="menu-item" data-add-student="${s.id}">${esc(s.name)} · ${classes.find(c=>c.id===s.classId).name}${checked(s.id)?' · Selected':''}</button>`).join('');
  if (!options.innerHTML) options.innerHTML='<p class="text-body-small">No matches found.</p>';
  const visible=students.filter(s=>data.classIds.includes(s.classId)&&(s.name+' '+classes.find(c=>c.id===s.classId).name).toLowerCase().includes(term));
  host.querySelector('[data-rosters]').innerHTML=mode==='students'?visible.map(studentRow).join(''):classes.filter(c=>data.classIds.includes(c.id)).map(c=>{
   const shown=visible.filter(s=>s.classId===c.id);if(!shown.length)return '';
   const open=!!term||expanded.has(c.id), count=selected(c.id).length;
   const common=data.sessions.find(s=>count&&selected(c.id).every(v=>s.recipients.includes(v.id)));
   const value=data.sessions.some(s=>s.id===classSessions[c.id])?classSessions[c.id]:common?.id||data.sessions[0]?.id;
   classSessions[c.id]=value;
   return `<section class="allocation-class" data-selected="${count>0}" data-expanded="${open}"><div class="card ${open?'card-themed':''} allocation-class-head">${iconButton(`data-expand="${c.id}" aria-expanded="${open}"`,(open?'Collapse':'Expand')+' '+c.name,open?'down':'right')}<div class="allocation-check allocation-class-select"><input class="checkbox" type="checkbox" data-all="${c.id}" ${count===roster(c.id).length?'checked':''} aria-label="Select all students in ${c.name}"><strong class="text-body-base font-semibold">${c.name}</strong><span class="text-body-small">(${roster(c.id).length} students)</span></div><div class="allocation-class-actions">${sessionSelect(`data-pending-class="${c.id}" aria-label="Session for ${c.name}"`,value)}<button type="button" class="btn btn-ghost btn-sm" data-apply-class="${c.id}">Apply to all</button></div></div>${open?shown.map(studentRow).join(''):''}</section>`;
  }).join('');
  if (!visible.length) host.querySelector('[data-rosters]').innerHTML='<p class="text-body-small allocation-empty">'+(data.classIds.length?'No students match your search.':'Select one or more classes to view students.')+'</p>';
  host.querySelectorAll('[data-all]').forEach(el=>{const n=selected(el.dataset.all).length;el.indeterminate=n>0&&n<roster(el.dataset.all).length;});
 }
 function assignedPills(session) {
  return session.recipients.length?session.recipients.slice(0,3).map(id=>`<span class="badge badge-theme-light">${esc(students.find(s=>s.id===id)?.name||id)}</span>`).join('')+(session.recipients.length>3?`<span class="badge badge-theme-light" title="${esc(session.recipients.slice(3).map(id=>students.find(s=>s.id===id)?.name||id).join(', '))}">+${session.recipients.length-3}</span>`:''):'<span class="text-muted-foreground">No students assigned</span>';
 }
 function drawSessions() {
  host.querySelector('[data-sessions]').innerHTML=data.sessions.map((s,i)=>`<section class="allocation-session" data-session-card="${esc(s.id)}"><div class="card card-themed allocation-session-head"><h3 class="text-body-base font-semibold">${esc(s.name)}</h3><span class="text-body-small" data-count>${s.recipients.length} student${s.recipients.length===1?'':'s'}</span>${iconButton(`data-collapse-session="${esc(s.id)}" aria-expanded="${!collapsedSessions.has(s.id)}" aria-controls="body-${esc(s.id)}"`,(collapsedSessions.has(s.id)?'Expand':'Collapse')+' '+s.name,collapsedSessions.has(s.id)?'right':'down')}</div><div id="body-${esc(s.id)}" ${collapsedSessions.has(s.id)?'hidden':''}>
   <div class="allocation-fields"><label class="field"><span class="label">Session name *</span><input class="input" required maxlength="80" data-field="name" value="${esc(s.name)}"></label><label class="field"><span class="label">Date *</span><input class="input" type="date" required data-field="date" value="${esc(s.opens.slice(0,10))}" ${s.noLimit?'disabled':''}></label><label class="field"><span class="label">Start time *</span><input class="input" type="time" required data-field="start" value="${esc(s.opens.slice(11,16))}" ${s.noLimit?'disabled':''}></label><label class="field"><span class="label">End time *</span><input class="input" type="time" required data-field="end" value="${esc(s.due.slice(11,16))}" ${s.noLimit?'disabled':''}></label></div>
   <hr class="separator"><div class="allocation-session-foot text-body-small"><span>Assigned to:</span><div data-assigned>${assignedPills(s)}</div></div><hr class="separator"><details class="accordion-item allocation-settings" ${settingsExpanded.has(s.id)?'open':''}><summary class="accordion-trigger">${icon('right')}<span>Access settings and instructions</span></summary><div class="accordion-content allocation-settings-content">${i===0?`<div class="allocation-fields allocation-policy-fields"><label class="field"><span class="label">Attempts</span><select class="select" id="attempts">${['1','2','3'].map(v=>`<option ${data.attempts===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="field"><span class="label">Time limit</span><select class="select" id="deliveryTime">${['None','5 minutes','10 minutes','15 minutes','20 minutes'].map(v=>`<option ${data.time===v?'selected':''}>${v}</option>`).join('')}</select></label></div>`:''}<label class="allocation-check"><input class="checkbox" type="checkbox" data-anytime ${s.noLimit?'checked':''}>Available at any time</label><label class="field"><span class="label">Session instructions</span><textarea class="textarea" maxlength="500" data-instructions rows="2">${esc(s.instructions||'')}</textarea></label><div class="allocation-session-actions"><button type="button" class="btn btn-ghost btn-sm" data-duplicate="${esc(s.id)}">Duplicate session</button><button type="button" class="btn btn-ghost is-destructive btn-sm" data-delete="${esc(s.id)}" ${data.sessions.length===1?'disabled':''}>Remove session</button></div></div></details></div></section>`).join('');
 }
 function counts() {
  host.querySelectorAll('[data-session-card]').forEach(el=>{const s=data.sessions.find(s=>s.id===el.dataset.sessionCard);el.querySelector('[data-count]').textContent=s.recipients.length+' student'+(s.recipients.length===1?'':'s');el.querySelector('[data-assigned]').innerHTML=assignedPills(s);});
  announce(data.recipients.length+' students selected; '+data.recipients.filter(id=>data.sessions.some(s=>s.recipients.includes(id))).length+' assigned to sessions.');
 }
 function update() { save();drawRoster();counts(); }
 function assign(ids,sessionId) { ids.forEach(id=>data.sessions.forEach(s=>{s.recipients=s.recipients.filter(v=>v!==id);if(s.id===sessionId)s.recipients.push(id);}));update(); }
 function selectStudents(ids,on) {
  data.recipients=on?[...new Set([...data.recipients,...ids])]:data.recipients.filter(id=>!ids.includes(id));
  if(on)ids.forEach(id=>{if(!Object.hasOwn(data.studentAccommodations,id)&&remembered[id])data.studentAccommodations[id]=[...remembered[id]];});
 }
 function classSelect(id,on) {
  if(on){data.classIds=[...new Set([...data.classIds,id])];expanded.clear();expanded.add(id);}else{data.classIds=data.classIds.filter(c=>c!==id);selectStudents(roster(id).map(s=>s.id),false);}
  update();
 }
 function addSession(source,duplicate=false) {
  const id='session-'+Date.now();
  data.sessions.push({...source,id,name:duplicate?source.name+' copy':'Session '+(data.sessions.length+1),customRecipients:true,recipients:[]});
  save();drawRoster();drawSessions();counts();host.querySelector(`[data-session-card="${id}"] input`).focus();
 }
 host.addEventListener('click',event=>{
  const sessionHeader=event.target.closest('.allocation-session-head');
  if(sessionHeader&&!event.target.closest('button, input, select, label, .tooltip-wrap')){
   sessionHeader.querySelector('[data-collapse-session]').click();
   return;
  }
  const header=event.target.closest('.allocation-class-head');
  if(header&&!event.target.closest('button, input, select, label, .allocation-select, .tooltip-wrap')){
   header.querySelector('[data-expand]').click();
   return;
  }
  const b=event.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-toggle-classes')){picker=!picker;drawRoster();}
  if(b.dataset.mode){mode=b.dataset.mode;host.querySelectorAll('[data-mode]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));picker=false;drawRoster();}
  if(b.dataset.expand){const wasOpen=expanded.has(b.dataset.expand);expanded.clear();if(!wasOpen)expanded.add(b.dataset.expand);drawRoster();host.querySelector(`[data-expand="${b.dataset.expand}"]`)?.focus();}
  if(b.dataset.expandSupport){const id=b.dataset.expandSupport;supportExpanded.has(id)?supportExpanded.delete(id):supportExpanded.add(id);drawRoster();host.querySelector(`[data-expand-support="${id}"]`)?.focus();}
  if(b.dataset.support){const id=b.dataset.student,option=b.dataset.support;data.studentAccommodations[id]=supportsFor(id).includes(option)?supportsFor(id).filter(v=>v!==option):[...supportsFor(id),option];if(Object.hasOwn(remembered,id)){remembered[id]=[...supportsFor(id)];localStorage.setItem('cogniaLearnerSupports',JSON.stringify(remembered));}update();host.querySelectorAll('[data-support]').forEach(el=>{if(el.dataset.student===id&&el.dataset.support===option)el.focus();});}
  if(b.dataset.applyClass){const ids=selected(b.dataset.applyClass).map(s=>s.id),sessionId=classSessions[b.dataset.applyClass];if(!ids.length)announce('Select students in this class first.');else if(!sessionId)announce('Choose a session first.');else{assign(ids,sessionId);announce('Session applied to '+ids.length+' selected students.');}}
  if(b.dataset.removeClass)classSelect(b.dataset.removeClass,false);
  if(b.hasAttribute('data-clear-selection')){selectStudents([...data.recipients],false);update();}
  if(b.dataset.addStudent){const s=students.find(v=>v.id===b.dataset.addStudent);data.classIds=[...new Set([...data.classIds,s.classId])];selectStudents([s.id],true);expanded.clear();expanded.add(s.classId);search='';host.querySelector('input[type=search]').value='';picker=false;update();}
  if(b.hasAttribute('data-add-session'))addSession({opens:data.sessions.at(-1).opens,due:data.sessions.at(-1).due});
  if(b.dataset.duplicate)addSession(data.sessions.find(s=>s.id===b.dataset.duplicate),true);
  if(b.dataset.collapseSession){const id=b.dataset.collapseSession;collapsedSessions.has(id)?collapsedSessions.delete(id):collapsedSessions.add(id);drawSessions();host.querySelector(`[data-collapse-session="${id}"]`)?.focus();}
  if(b.dataset.delete&&data.sessions.length>1){const s=data.sessions.find(v=>v.id===b.dataset.delete);data.sessions=data.sessions.filter(v=>v!==s);save();drawRoster();drawSessions();counts();host.querySelector('[data-add-session]').focus();announce(s.name+' removed. Its students need reassignment.');}
 });
 host.addEventListener('change',event=>{
  const el=event.target;
  if(el.dataset.class)classSelect(el.dataset.class,el.checked);
  if(el.name==='recipient'){selectStudents([el.value],el.checked);update();}
  if(el.dataset.all){selectStudents(roster(el.dataset.all).map(s=>s.id),el.checked);update();}
  if(el.dataset.pendingClass)classSessions[el.dataset.pendingClass]=el.value;
  if(el.dataset.assign)assign([el.dataset.assign],el.value);
  if(el.name==='accommodations'){data.accommodations=el.checked;save();}
  if(el.dataset.remember){if(el.checked)remembered[el.dataset.remember]=[...supportsFor(el.dataset.remember)];else delete remembered[el.dataset.remember];localStorage.setItem('cogniaLearnerSupports',JSON.stringify(remembered));announce(el.checked?'Learner supports saved for future assignments.':'Learner supports kept for this assignment only.');}
  if(el.id==='attempts'||el.id==='deliveryTime'){data.attempts=host.querySelector('#attempts').value;data.time=host.querySelector('#deliveryTime').value;save();}
  if(el.hasAttribute('data-anytime')){data.sessions.find(s=>s.id===el.closest('[data-session-card]').dataset.sessionCard).noLimit=el.checked;save();drawSessions();}
 });
 host.addEventListener('toggle',event=>{if(event.target.matches('.allocation-settings')){const id=event.target.closest('[data-session-card]').dataset.sessionCard;event.target.open?settingsExpanded.add(id):settingsExpanded.delete(id);}},true);
 host.addEventListener('input',event=>{
  const el=event.target;
  if(el.type==='search'){search=el.value;picker=!!search;drawRoster();return;}
  const box=el.closest('[data-session-card]');if(!box)return;
  const session=data.sessions.find(s=>s.id===box.dataset.sessionCard);
  if(el.dataset.field==='name')session.name=el.value;
  else if(el.dataset.field){const date=box.querySelector('[data-field=date]').value;session.opens=date+'T'+box.querySelector('[data-field=start]').value;session.due=date+'T'+box.querySelector('[data-field=end]').value;}
  if(el.hasAttribute('data-instructions'))session.instructions=el.value;
  save();box.querySelector('h3').textContent=session.name;drawRoster();
 });
 document.addEventListener('click',event=>{if(picker&&!event.target.closest('.allocation-picker')){picker=false;drawRoster();}});
 host.addEventListener('keydown',event=>{if(event.key==='Escape'&&picker){picker=false;drawRoster();host.querySelector('[data-toggle-classes]').focus();}});
 page.addEventListener('click',event=>{
  if(!event.target.closest('a[href="CAP-T09-ConfirmAssignment.dc.html"]'))return;
  let message='';
  if(!data.recipients.length)message='Select at least one student.';
  else if(data.recipients.some(id=>!data.sessions.some(s=>s.recipients.includes(id))))message='Assign every selected student to a session.';
  else if(data.sessions.some(s=>!s.recipients.length))message='Assign at least one student to each session, or remove the unused session.';
  else if(data.sessions.some(s=>!s.name.trim()||(!s.noLimit&&(!s.opens||!s.due||s.due<=s.opens))))message='Complete each session name and set an end time after its start time.';
  const error=host.querySelector('[data-allocation-error]');error.textContent=message;error.hidden=!message;
  if(message){event.preventDefault();error.focus();}
  else if(needsReview()&&!reviewCheckbox.checked){event.preventDefault();reviewError.textContent='Check accommodations and recipient access before continuing.';reviewCheckbox.setAttribute('aria-invalid','true');reviewCheckbox.focus();}
  else {collapsedSessions.clear();drawSessions();if(!form.reportValidity())event.preventDefault();else save();}
 });
 save();drawRoster();drawSessions();counts();
};
