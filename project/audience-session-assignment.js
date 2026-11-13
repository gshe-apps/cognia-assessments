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
 let mode='classes', search='', picker=false, lastReviewScope;
 const expanded = new Set(data.classIds.slice(0,1)), settingsExpanded = new Set();
 let openSessionId = data.sessions[0].id;
 const supportsFor = id => data.studentAccommodations[id] || [];
 const roster = id => students.filter(s=>s.classId===id);
 const checked = id => data.recipients.includes(id);
 const selected = id => roster(id).filter(s=>checked(s.id));
 const needsReview = () => students.some(s=>checked(s.id)&&(s.support||supportsFor(s.id).length));
 const icon = name => {
  const paths = {trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5"/>',down:'<path d="m6 9 6 6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',plus:'<path d="M5 12h14M12 5v14"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',person:'<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',edit:'<path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>'};
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
 };
 const iconControl = (attrs,label,name) => '<button type="button" class="btn btn-ghost btn-icon btn-sm" '+attrs+' aria-label="'+esc(label)+'">'+icon(name)+'</button>';
 const iconButton = (attrs,label,name) => '<span class="tooltip-wrap">'+iconControl(attrs,label,name)+'<span class="tooltip" role="tooltip">'+esc(label)+'</span></span>';
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
  <div class="allocation-heading"><div class="allocation-mode tabs-list" role="group" aria-label="Select recipients"><button class="tab" type="button" aria-pressed="true" data-mode="classes">Classes</button><button class="tab" type="button" aria-pressed="false" data-mode="students">Students</button></div></div>
  <div class="allocation-picker"><div class="search search-md allocation-search-field" role="search"><svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input class="input search-input" type="search" aria-label="Add or search classes" placeholder="Add or search classes"><span class="tooltip-wrap search-clear"><button class="btn btn-ghost btn-icon btn-sm" type="button" aria-label="Clear search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button><span class="tooltip" role="tooltip">Clear search</span></span>${iconButton('data-toggle-classes aria-expanded="false" aria-controls="allocation-options"','Select classes','down')}</div><div id="allocation-options" class="menu allocation-options" hidden></div></div>
  <div class="allocation-filters"><div class="chip-list" role="list" aria-label="Selected classes" data-class-pills></div><button type="button" class="btn btn-ghost btn-sm" data-clear-selection>Clear all</button></div><div data-rosters></div><label class="allocation-check text-body-small"><input class="checkbox" type="checkbox" name="accommodations" aria-describedby="allocation-review-error">I’ve checked accommodations and recipient access.</label><p class="text-body-small text-destructive" id="allocation-review-error" role="alert"></p>
 </div></section><section class="allocation-panel allocation-sessions" aria-label="Sessions"><div class="card-content"><div class="allocation-heading"><button type="button" class="btn btn-ghost" data-add-session>${icon('plus')}Add another session</button></div><div data-sessions></div><p class="alert alert-destructive" data-allocation-error role="alert" tabindex="-1" hidden></p><p class="allocation-live sr-only" role="status" aria-live="polite"></p></div></section>`;
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
 function sessionSelect(attrs, session, disabled) {
  const label = esc(session?.name || 'Select session');
  return `<span class="allocation-select"><span class="allocation-select-label" aria-hidden="true">${label}</span><select class="select" ${attrs} ${disabled?'disabled':''}>${sessionOptions(session?.id)}</select>${icon('down')}</span>`;
 }
 const supportDialog = document.createElement('dialog');
 supportDialog.className = 'dialog cap-setup-modal allocation-support-dialog';
 supportDialog.setAttribute('aria-labelledby','allocation-support-title');
 supportDialog.setAttribute('aria-describedby','allocation-support-description');
 supportDialog.innerHTML = `
  <form class="cap-setup-view">
   <div class="cap-setup-heading dialog-header">
    <h2 class="dialog-title" id="allocation-support-title" tabindex="-1" autofocus>Review supports</h2>
    <button class="btn btn-ghost btn-icon dialog-close" type="button" data-cancel-support aria-label="Close review supports">${icon('x')}</button>
   </div>
   <div class="cap-setup-fields">
    <p class="dialog-description" id="allocation-support-description" data-support-student></p>
    <fieldset class="allocation-support-options"><legend class="sr-only">Learner supports</legend><div class="cap-setup-columns" data-support-options></div></fieldset>
    <label class="check text-body-small font-semibold cap-setup-optional"><input class="checkbox" type="checkbox" name="remember">Save supports for future assignments</label>
   </div>
   <div class="cap-setup-buttons dialog-footer">
     <button class="btn btn-ghost btn-lg" type="button" data-cancel-support>Cancel</button>
     <button class="btn btn-lg" type="submit">Save supports</button>
    </div>
  </form>`;
 page.append(supportDialog);
 let supportStudent;
 function openSupports(student) {
  supportStudent=student;
  supportDialog.querySelector('[data-support-student]').textContent=student.name;
  const selectedSupports=supportsFor(student.id);
  supportDialog.querySelector('[data-support-options]').innerHTML=[...new Set([...supportOptions,...selectedSupports])].map(option=>
   `<label class="check text-body-small"><input class="checkbox" name="support" type="checkbox" value="${esc(option)}" ${selectedSupports.includes(option)?'checked':''}>${esc(option)}</label>`
  ).join('');
  supportDialog.querySelector('[name=remember]').checked=Object.hasOwn(remembered,student.id);
  supportDialog.showModal();
 }
 supportDialog.querySelectorAll('[data-cancel-support]').forEach(button => {
  button.addEventListener('click', () => supportDialog.close());
 });
 supportDialog.addEventListener('close',()=>host.querySelector(`[data-expand-support="${supportStudent.id}"]`)?.focus());
 supportDialog.querySelector('form').addEventListener('submit',event=>{
  event.preventDefault();
  const values=new FormData(event.currentTarget);
  const id=supportStudent.id;
  data.studentAccommodations[id]=values.getAll('support');
  if(values.has('remember')) remembered[id]=[...supportsFor(id)];
  else delete remembered[id];
  localStorage.setItem('cogniaLearnerSupports',JSON.stringify(remembered));
  update();
  supportDialog.close();
  announce('Learner supports saved for '+supportStudent.name+'.');
 });
 function studentRow(student) {
  const session=data.sessions.find(s=>s.recipients.includes(student.id));
   const support = supportsFor(student.id).length || student.support ? `<button type="button" class="btn btn-ghost btn-sm btn-pill badge-warning" data-expand-support="${student.id}" aria-haspopup="dialog" aria-label="Review supports for ${esc(student.name)}">Review supports${icon('edit')}</button>` : '';
  return `<div class="allocation-student-wrap"><div class="allocation-student"><label class="allocation-check text-body-small font-semibold"><input class="checkbox" type="checkbox" name="recipient" value="${student.id}" ${checked(student.id)?'checked':''}>${esc(student.name)}</label>${support}<div class="allocation-student-actions">${sessionSelect(`data-assign="${student.id}" aria-label="Session for ${esc(student.name)}"`,session,!checked(student.id))}</div></div></div>`;
 }
 function classSessionMenu(group) {
  const id = `allocation-actions-${group.id}`;
  const label = `Session actions for ${group.name}`;
  const items = data.sessions.map(session => `<button type="button" class="menu-item" role="menuitem" tabindex="-1" data-apply-class="${group.id}" data-apply-session="${esc(session.id)}">Apply ${esc(session.name)} to all</button>`).join('');
  return actionsMenu(id, label, items, `data-class-actions="${group.id}"`);
 }
 function actionsMenu(id, label, items, attrs = '') {
  return `<div class="dropdown dropdown-end"><button type="button" class="btn btn-ghost btn-icon btn-sm" ${attrs} aria-label="${esc(label)}" title="${esc(label)}" aria-haspopup="menu" aria-expanded="false" aria-controls="${id}"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button><div class="menu" role="menu" id="${id}" aria-label="${esc(label)}" hidden>${items}</div></div>`;
 }
 function drawRoster() {
  host.querySelector('[data-rosters]').classList.toggle('card', mode === 'students');
  host.querySelector('[data-class-pills]').innerHTML = data.classIds.map(id=>`<span class="chip" role="listitem">${classes.find(c=>c.id===id).name}<button type="button" class="chip-remove" data-remove-class="${id}" aria-label="Remove ${classes.find(c=>c.id===id).name}">${icon('x')}</button></span>`).join('');
  host.querySelector('[data-toggle-classes]').setAttribute('aria-expanded',String(picker));
  const pickerLabel=mode==='students'?'Select students':'Select classes';
  const input = host.querySelector('input[type=search]');
  input.placeholder=mode==='students'?'Add or search students':'Add or search classes';
  input.setAttribute('aria-label', input.placeholder);
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
   return `<section class="allocation-class card" data-selected="${count>0}" data-expanded="${open}"><div class="card allocation-class-head">${iconButton(`data-expand="${c.id}" aria-expanded="${open}"`,(open?'Collapse':'Expand')+' '+c.name,open?'down':'right')}<div class="allocation-check allocation-class-select"><input class="checkbox" type="checkbox" data-all="${c.id}" ${count===roster(c.id).length?'checked':''} aria-label="Select all students in ${c.name}"><strong class="text-body-base font-semibold">${c.name}</strong><span class="text-body-small">${roster(c.id).length} students</span></div><div class="allocation-class-actions">${classSessionMenu(c)}</div></div>${open?shown.map(studentRow).join(''):''}</section>`;
  }).join('');
  if (!visible.length) host.querySelector('[data-rosters]').innerHTML='<p class="text-body-small allocation-empty">'+(data.classIds.length?'No students match your search.':'Select one or more classes to view students.')+'</p>';
  host.querySelectorAll('[data-all]').forEach(el=>{const n=selected(el.dataset.all).length;el.indeterminate=n>0&&n<roster(el.dataset.all).length;});
 }
 function assignedPills(session) {
  return session.recipients.length?session.recipients.slice(0,3).map(id=>`<span class="badge badge-theme-light">${esc(students.find(s=>s.id===id)?.name||id)}</span>`).join('')+(session.recipients.length>3?`<span class="badge badge-theme-light" title="${esc(session.recipients.slice(3).map(id=>students.find(s=>s.id===id)?.name||id).join(', '))}">+${session.recipients.length-3}</span>`:''):'<span class="text-muted-foreground">No students assigned</span>';
 }
 function sessionActions(session) {
  const id = esc(session.id);
  const removeDisabled = data.sessions.length === 1 ? ' aria-disabled="true" disabled' : '';
  const items = `<button type="button" class="menu-item" role="menuitem" tabindex="-1" data-duplicate="${id}">Duplicate session</button>
   <button type="button" class="menu-item is-destructive" role="menuitem" tabindex="-1" data-delete="${id}"${removeDisabled}>Remove session</button>`;
  return actionsMenu(`allocation-session-actions-${id}`, `Actions for ${session.name}`, items);
 }
 function drawSessions() {
  host.querySelector('[data-sessions]').innerHTML=data.sessions.map((s,i)=>`<section class="allocation-session card" data-session-card="${esc(s.id)}"><div class="card allocation-session-head"><h3 class="text-body-base font-semibold">${esc(s.name)}</h3>${sessionActions(s)}${iconControl(`data-collapse-session="${esc(s.id)}" aria-expanded="${openSessionId === s.id}" aria-controls="body-${esc(s.id)}"`,(openSessionId !== s.id?'Expand':'Collapse')+' '+s.name,openSessionId !== s.id?'right':'down')}</div><div id="body-${esc(s.id)}" ${openSessionId !== s.id?'hidden':''}>
   <div class="allocation-fields"><label class="field"><span class="label">Session name *</span><input class="input" required maxlength="80" data-field="name" value="${esc(s.name)}"></label><label class="field"><span class="label">Date *</span><input class="input" type="date" required data-field="date" value="${esc(s.opens.slice(0,10))}" ${s.noLimit?'disabled':''}></label><label class="field"><span class="label">Start time *</span><input class="input" type="time" required data-field="start" value="${esc(s.opens.slice(11,16))}" ${s.noLimit?'disabled':''}></label><label class="field"><span class="label">End time *</span><input class="input" type="time" required data-field="end" value="${esc(s.due.slice(11,16))}" ${s.noLimit?'disabled':''}></label></div>
   <div class="allocation-session-foot text-body-small"><span>Assigned to:</span><div data-assigned>${assignedPills(s)}</div></div><details class="accordion-item allocation-settings" ${settingsExpanded.has(s.id)?'open':''}><summary class="accordion-trigger"><span>Access settings and instructions</span></summary><div class="accordion-content allocation-settings-content">${i===0?`<div class="allocation-fields allocation-policy-fields"><label class="field"><span class="label">Attempts</span><select class="select" id="attempts">${['1','2','3'].map(v=>`<option ${data.attempts===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="field"><span class="label">Time limit</span><select class="select" id="deliveryTime">${['None','5 minutes','10 minutes','15 minutes','20 minutes'].map(v=>`<option ${data.time===v?'selected':''}>${v}</option>`).join('')}</select></label></div>`:''}<label class="allocation-check"><input class="checkbox" type="checkbox" data-anytime ${s.noLimit?'checked':''}>Available at any time</label><label class="field"><span class="label">Session instructions</span><textarea class="textarea" maxlength="500" data-instructions rows="2">${esc(s.instructions||'')}</textarea></label></div></details></div></section>`).join('');
 }
 function counts() {
  host.querySelectorAll('[data-session-card]').forEach(el=>{const s=data.sessions.find(s=>s.id===el.dataset.sessionCard);el.querySelector('[data-assigned]').innerHTML=assignedPills(s);});
  const selectedCount = data.recipients.length;
  const assignedCount = data.recipients.filter(id => data.sessions.some(s => s.recipients.includes(id))).length;
  announce(selectedCount + ' students selected; ' + assignedCount + ' assigned to sessions.');
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
  openSessionId = id;
  save();drawRoster();drawSessions();counts();host.querySelector(`[data-session-card="${id}"] input`).focus();
 }
 const searchInput=host.querySelector('.allocation-search-field input');
 function openPicker() {
  if(picker)return;
  picker=true;
  drawRoster();
 }
 searchInput.addEventListener('focus',openPicker);
 searchInput.addEventListener('click',openPicker);
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
  if (b.dataset.mode) {
   mode = b.dataset.mode;
   for (const toggle of host.querySelectorAll('[data-mode]')) {
    const active = toggle === b;
    toggle.setAttribute('aria-pressed', String(active));
   }
   picker = false;
   drawRoster();
  }
  if(b.dataset.expand){const wasOpen=expanded.has(b.dataset.expand);expanded.clear();if(!wasOpen)expanded.add(b.dataset.expand);drawRoster();host.querySelector(`[data-expand="${b.dataset.expand}"]`)?.focus();}
  if(b.dataset.expandSupport)openSupports(students.find(student=>student.id===b.dataset.expandSupport));
  if (b.dataset.applyClass) {
   const classId = b.dataset.applyClass;
   const ids = selected(classId).map(student => student.id);
   const sessionId = b.dataset.applySession;
   if (!ids.length) announce('Select students in this class first.');
   else if (!sessionId) announce('Choose a session first.');
   else {
    assign(ids, sessionId);
    announce('Session applied to ' + ids.length + ' selected students.');
    host.querySelector(`[data-class-actions="${classId}"]`)?.focus();
   }
  }
  if(b.dataset.removeClass)classSelect(b.dataset.removeClass,false);
  if(b.hasAttribute('data-clear-selection')){selectStudents([...data.recipients],false);update();}
  if(b.dataset.addStudent){const s=students.find(v=>v.id===b.dataset.addStudent);data.classIds=[...new Set([...data.classIds,s.classId])];selectStudents([s.id],true);expanded.clear();expanded.add(s.classId);search='';host.querySelector('input[type=search]').value='';picker=false;update();}
  if(b.hasAttribute('data-add-session'))addSession({opens:data.sessions.at(-1).opens,due:data.sessions.at(-1).due});
  if(b.dataset.duplicate)addSession(data.sessions.find(s=>s.id===b.dataset.duplicate),true);
  if(b.dataset.collapseSession){const id=b.dataset.collapseSession;openSessionId = openSessionId === id ? null : id;drawSessions();host.querySelector(`[data-collapse-session="${id}"]`)?.focus();}
  if(b.dataset.delete&&data.sessions.length>1){const s=data.sessions.find(v=>v.id===b.dataset.delete);data.sessions=data.sessions.filter(v=>v!==s);if(openSessionId===s.id)openSessionId=data.sessions[0].id;settingsExpanded.delete(s.id);save();drawRoster();drawSessions();counts();host.querySelector('[data-add-session]').focus();announce(s.name+' removed. Its students need reassignment.');}
 });
 host.addEventListener('change',event=>{
  const el=event.target;
  if(el.dataset.class)classSelect(el.dataset.class,el.checked);
  if(el.name==='recipient'){selectStudents([el.value],el.checked);update();}
  if(el.dataset.all){selectStudents(roster(el.dataset.all).map(s=>s.id),el.checked);update();}
  if(el.dataset.assign)assign([el.dataset.assign],el.value);
  if(el.name==='accommodations'){data.accommodations=el.checked;save();}
  if(el.id==='attempts'||el.id==='deliveryTime'){data.attempts=host.querySelector('#attempts').value;data.time=host.querySelector('#deliveryTime').value;save();}
  if(el.hasAttribute('data-anytime')){data.sessions.find(s=>s.id===el.closest('[data-session-card]').dataset.sessionCard).noLimit=el.checked;save();drawSessions();}
 });
 host.addEventListener('toggle',event=>{if(event.target.matches('.allocation-settings')){const id=event.target.closest('[data-session-card]').dataset.sessionCard;event.target.open?settingsExpanded.add(id):settingsExpanded.delete(id);}},true);
 host.addEventListener('input',event=>{
  const el=event.target;
  if(el===searchInput){search=el.value;picker=true;drawRoster();return;}
  const box=el.closest('[data-session-card]');if(!box)return;
  const session=data.sessions.find(s=>s.id===box.dataset.sessionCard);
  if(el.dataset.field==='name')session.name=el.value;
  else if(el.dataset.field){const date=box.querySelector('[data-field=date]').value;session.opens=date+'T'+box.querySelector('[data-field=start]').value;session.due=date+'T'+box.querySelector('[data-field=end]').value;}
  if(el.hasAttribute('data-instructions'))session.instructions=el.value;
  save();box.querySelector('h3').textContent=session.name;const actions=box.querySelector('.dropdown > [aria-haspopup=menu]');if(actions){actions.setAttribute('aria-label',`Actions for ${session.name}`);actions.title=`Actions for ${session.name}`;box.querySelector('[role=menu]').setAttribute('aria-label',actions.title);}drawRoster();
 });
 document.addEventListener('click',event=>{if(picker&&!event.target.closest('.allocation-picker')){picker=false;host.querySelector('#allocation-options').hidden=true;host.querySelector('[data-toggle-classes]').setAttribute('aria-expanded','false');}});
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
  else {
   const invalidSession = form.querySelector('[data-session-card] :invalid')?.closest('[data-session-card]');
   if (invalidSession && invalidSession.dataset.sessionCard !== openSessionId) {
    openSessionId = invalidSession.dataset.sessionCard;
    drawSessions();
   }
   if (!form.reportValidity()) event.preventDefault();
   else save();
  }
 });
 save();drawRoster();drawSessions();counts();
};
