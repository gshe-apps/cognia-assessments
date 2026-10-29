// Shared prototype-only role routing; assessment page destinations stay intact.
(() => {
 const file = location.pathname.split('/').pop() || 'index.html';
 const home = file.startsWith('CAP-T') ? 'CAP-T00-Home.dc.html' : file.startsWith('CAP-S') ? 'CAP-S01-SignIn.dc.html' : /^(PA|DI-School)/.test(file) ? 'PA1-Home.dc.html' : 'District-Home.dc.html';
 function update() {
   for(const link of document.querySelectorAll('.roleopt')) {
     const title=link.querySelector('strong');
     if(!title) continue;
     const label=title.textContent.trim();
     if(label==='Teacher'||label==='Educator') { title.textContent='Educator'; link.setAttribute('href','CAP-T00-Home.dc.html'); }
     if(label==='System Administrator'||label==='District administrator') title.textContent='District Admin';
     if(label==='School Administrator') title.textContent='School administrator';
     const current=file!=='index.html'&&link.getAttribute('href')===home;
     if(current) link.setAttribute('aria-current','page'); else { link.removeAttribute('aria-current'); link.querySelector('.rolecur')?.remove(); }
   }
   document.querySelectorAll('.brand .logo,.hubbrand .hublogo').forEach(link=>{
     link.setAttribute('href','index.html');
     link.setAttribute('aria-label','Choose a prototype persona');
   });
   document.querySelectorAll('.apphome').forEach(link=>link.setAttribute('href',home));
   document.querySelectorAll('.appgrid,.acctbtn,.appx,.rolex').forEach(button=>{if(!button.title)button.title=button.getAttribute('aria-label')||'Account';});
 }
 function ready(){
   update();
   const observer=new MutationObserver(()=>{observer.disconnect();update();observer.observe(document.body,{childList:true,subtree:true});});
   observer.observe(document.body,{childList:true,subtree:true});
   document.addEventListener('keydown',event=>{
     if(event.key!=='Escape')return;
     const instance=window.cogniaPreview;
     if(instance&&(instance.state.rolesOpen||instance.state.appsOpen||instance.state.acctOpen)) {
       const roleOpen=instance.state.rolesOpen;
       instance.setState({rolesOpen:false,appsOpen:false,acctOpen:false});
       document.querySelector(roleOpen?'.acctbtn':'.appgrid')?.focus();
     }
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
