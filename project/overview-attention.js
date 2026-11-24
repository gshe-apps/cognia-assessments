(() => {
 const pendingKey='capOverviewAttentionV1';
 const openedPrefix='capOverviewAttentionOpenedV1:';
 const destinations={
  assessments:'CAP-T03-Assessments.dc.html',
  results:'CAP-T13-Results.dc.html'
 };
 let pending={};
 const opened=new Set();
 const read=key=>{try{return localStorage.getItem(key);}catch{return null;}};
 const write=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
 const wasOpened=id=>opened.has(id)||read(openedPrefix+id)==='1';

 function render(){
  for(const [group,href] of Object.entries(destinations)){
   const link=document.querySelector(`.shell-nav a[href="${href}"]`);
   if(!link)continue;
   const dot=link.querySelector('.od-nav-indicator');
   const show=(pending[group]||[]).some(id=>!wasOpened(id));
   if(show&&!dot){
    link.insertAdjacentHTML('beforeend','<span class="od-nav-indicator" aria-hidden="true"></span>');
    link.setAttribute('aria-description','Action needed');
   }else if(!show&&dot){
    dot.remove();
    link.removeAttribute('aria-description');
   }
  }
 }
 function refresh(){
  const stored=read(pendingKey);
  if(stored){
   try{pending=JSON.parse(stored)||{};}catch{}
  }
  render();
 }
 window.capOverviewAttention={
  publish(items){
   pending=items;
   const json=JSON.stringify(items);
   if(read(pendingKey)!==json)write(pendingKey,json);
   render();
  },
  open(id){
   if(!wasOpened(id)){
    opened.add(id);
    write(openedPrefix+id,'1');
   }
   render();
  }
 };
 function mount(){
  refresh();
  const canvas=document.querySelector('x-dc');
  if(canvas)new MutationObserver(render).observe(canvas,{childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
 else mount();
 window.addEventListener('pageshow',refresh);
 window.addEventListener('storage',event=>{
  if(!event.key||event.key===pendingKey||event.key.startsWith(openedPrefix))refresh();
 });
})();
