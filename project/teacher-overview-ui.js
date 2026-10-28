// Presentation only. Existing draft restoration, plan logic and destinations
// continue to be owned by the prototype's current components.
(() => {
 function decorate(){
   const library=document.querySelector('.ef-library-entry');
   const grid=document.querySelector('.ef-start-grid');
   if(!library||!grid)return;
   if(!grid.classList.contains('overview-reference-grid')){
     const builder=grid.querySelector('.reference-folder:not(.ef-library-entry)');
     const continued=document.querySelector('.reference-continue');
     const recent=document.querySelector('.reference-recent');
     if(!builder||!continued||!recent)return;
     grid.replaceChildren(builder,library);
     grid.classList.add('overview-reference-grid');
     const side=document.querySelector('.reference-side');
     if(side){side.replaceChildren(continued,recent);side.classList.remove('overview-side-moved');}
   }
   if(library.dataset.overviewUi==='reference')return;
   library.dataset.overviewUi='reference';
   const builder=grid.querySelector('.reference-folder:not(.ef-library-entry)');
   for(const card of [builder,library]){
     card?.querySelectorAll('.reference-hero-image,.reference-folder-shape,.reference-folder-outline').forEach(node=>node.remove());
     card?.classList.add('overview-reference-card');
   }
   const icon=library.querySelector('.reference-feature-top .reference-icon');
   if(icon)icon.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/></svg>';
 }
 function ready(){
   decorate();
   const observer=new MutationObserver(()=>{observer.disconnect();decorate();observer.observe(document.body,{childList:true,subtree:true});});
   observer.observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
