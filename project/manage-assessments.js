document.addEventListener('DOMContentLoaded',()=>{
 const page=document.querySelector('.manage-assessments');if(!page)return;
 const view=new URLSearchParams(location.search).get('view');
 page.dataset.view=['drafts','banked'].includes(view)?view:'all';
 if(view==='drafts'||view==='banked'){
   page.querySelector('h1').textContent=view==='drafts'?'Your drafts':'Banked for later';
   page.querySelector('.manage-hero p').textContent=view==='drafts'?'Continue working on your unfinished assessments.':'Reuse saved assessments whenever you need them.';
 }
});
