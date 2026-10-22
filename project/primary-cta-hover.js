document.addEventListener('DOMContentLoaded',()=>{
 const selector='a.btn,button.btn,button.primary,a.primary,button.solid,a.solid,input[type="submit"],button.btn-primary,a.btn-primary';
 function mark(root){const items=[...(root.matches?.(selector)?[root]:[]),...(root.querySelectorAll?.(selector)||[])];for(const el of items){if(el.classList.contains('primary-cta-hover'))continue;const c=getComputedStyle(el).backgroundColor.match(/[\d.]+/g);if(!c||c.length>3&&Number(c[3])<.8)continue;const [r,g,b]=c.map(Number);if(.2126*r+.7152*g+.0722*b<75)el.classList.add('primary-cta-hover');}}
 mark(document);new MutationObserver(changes=>{for(const change of changes)for(const node of change.addedNodes)if(node.nodeType===1)mark(node);}).observe(document.body,{childList:true,subtree:true});
});
