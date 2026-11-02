// Shared prototype-only persona routing. One Home serves both administrator personas;
// the active persona decides the names, the scope and which role shows as Current.
(() => {
 const KEY = 'cogniaPersona';
 const file = location.pathname.split('/').pop() || 'Main.dc.html';
 const fixed = /^(PA|DI-School)/.test(file) ? 'school' : /^(SA2|MOD|DI-District)/.test(file) ? 'district' : null;
 const save = p => { try { window.localStorage.setItem(KEY, p); } catch (e) {} };
 const stored = () => { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } };
 if (fixed) save(fixed);
 // Educator screens remember the educator, so shared products (Observations, Surveys) keep their identity and Home.
 if (file.startsWith('CAP-T')) save('educator');
 const home = file.startsWith('CAP-T') || (/^OS-/.test(file) && stored() === 'educator') ? 'CAP-T00-Home.dc.html' : /^(CAP-S|STU2)/.test(file) ? 'STU2-SignIn.dc.html' : 'District-Home.dc.html';
 // The canvas viewer does not always load a screen at its file name, so when the URL gives no answer
 // the page itself does: Home's persona, then the signed-in person on the account button.
 const PEOPLE = { 'Jordan Ellis': 'district', 'Priya Shah': 'school', 'Sara Lee': 'educator', 'Jamie M.': 'student' };
 const fromPage = () => {
   const main = document.querySelector('main[data-persona]');
   const p = main && main.dataset.persona;
   if (p === 'district' || p === 'school') return p;
   const btn = document.querySelector('.acctbtn[aria-label^="Account: "],.profile-trigger[aria-label^="Account: "]');
   const who = btn && btn.getAttribute('aria-label').replace('Account: ', '').trim();
   return PEOPLE[who] || null;
 };
 const active = () => fixed || (file === 'District-Home.dc.html' ? (stored() === 'school' ? 'school' : 'district') : fromPage());
 const NAMES = { district: 'District administrator', school: 'School administrator', educator: 'Educator', student: 'Student' };
 // Older screens list roles without data-persona: read the role from its title, and send every role to the start of its current flow.
 const BY_TITLE = { 'district administrator': 'district', 'system administrator': 'district', 'school administrator': 'school', 'educator': 'educator', 'teacher': 'educator', 'student': 'student' };
 const START = { district: 'District-Home.dc.html', school: 'District-Home.dc.html', educator: 'CAP-T00-Home.dc.html', student: 'STU2-SignIn.dc.html' };
 function update() {
   const now = active();
   // Remember an admin persona found from the page, so Home opens as the same administrator.
   if (!fixed && (now === 'district' || now === 'school') && stored() !== now) save(now);
   for (const link of document.querySelectorAll('.roleopt')) {
     const title = link.querySelector('strong');
     if (!link.dataset.persona && title) { const p = BY_TITLE[title.textContent.trim().toLowerCase()]; if (p) link.dataset.persona = p; }
     const persona = link.dataset.persona;
     if (START[persona] && link.getAttribute('href') !== START[persona]) link.setAttribute('href', START[persona]);
     if (title && NAMES[persona] && title.textContent.trim() !== NAMES[persona]) title.textContent = NAMES[persona];
     const current = !!now && persona === now;
     const tag = link.querySelector('.rolecur');
     if (current) {
       if (link.getAttribute('aria-current') !== 'page') link.setAttribute('aria-current', 'page');
       if (!tag) { const span = document.createElement('span'); span.className = 'rolecur'; span.textContent = 'Current'; link.prepend(span); }
     } else {
       if (link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
       if (tag) tag.remove();
     }
   }
   document.querySelectorAll('.brand .logo,.hubbrand .hublogo').forEach(link => {
     if (link.getAttribute('href') !== 'Main.dc.html') link.setAttribute('href', 'Main.dc.html');
     link.setAttribute('aria-label', 'Choose a prototype persona');
   });
   document.querySelectorAll('.apphome').forEach(link => { if (link.getAttribute('href') !== home) link.setAttribute('href', home); });
   document.querySelectorAll('.appgrid,.acctbtn,.appx,.rolex').forEach(button => { if (!button.title) button.title = button.getAttribute('aria-label') || 'Account'; });
 }
 function ready() {
   update();
   const observer = new MutationObserver(() => { observer.disconnect(); update(); observer.observe(document.body, { childList: true, subtree: true }); });
   observer.observe(document.body, { childList: true, subtree: true });
   // Choosing a persona anywhere (entry cards, role switcher) remembers it before the page changes.
   document.addEventListener('click', event => {
     const el = event.target.closest && event.target.closest('[data-persona]');
     const p = el && el.dataset.persona;
     if (p === 'district' || p === 'school') save(p);
   }, true);
   document.addEventListener('keydown', event => {
     if (event.key !== 'Escape') return;
     const instance = window.cogniaPreview;
     if (instance && (instance.state.rolesOpen || instance.state.appsOpen || instance.state.acctOpen)) {
       const roleOpen = instance.state.rolesOpen;
       instance.setState({ rolesOpen: false, appsOpen: false, acctOpen: false });
       document.querySelector(roleOpen ? '.acctbtn' : '.appgrid')?.focus();
     }
   });
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
