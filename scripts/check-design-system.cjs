/* Regression guard: prevent the cascade locks removed on 29 October 2026 from returning. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../project'),problems=[];let checked=0,safety=0;
const allowed=new Set(['display','visibility','pointer-events','animation','animation-duration','transition','transition-duration','scroll-behavior']);
function inspect(css,file){
 const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
 if(/:not\(#(?:preview-(?:root|body)|cap-[a-d]|ty[123])\)/.test(clean))problems.push(file+': artificial ID specificity');
 if(/(?:^|[;{])\s*color\s*:\s*var\(--muted\)/.test(clean))problems.push(file+': surface token used as text colour; use --muted-foreground');
 for(const m of clean.matchAll(/(?:^|[;{])\s*([\w-]+)\s*:[^;{}]*!important\b/gi)){
  if(!allowed.has(m[1].toLowerCase()))problems.push(file+': visual !important on '+m[1]);else safety++;
 }
}
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,ent.name);if(ent.isDirectory())walk(f);else if(/\.(css|html)$/.test(f)){
 checked++;const s=fs.readFileSync(f,'utf8');
 if(f.endsWith('.css')){
  inspect(s,path.relative(root,f));
  if(!f.includes(path.join('ds','cognia'))&&!s.includes('@layer cap-legacy')&&!s.includes('Retired:'))problems.push(path.relative(root,f)+': legacy stylesheet outside cap-legacy');
 }else for(const m of s.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi))inspect(m[1],path.relative(root,f));
}}}
walk(root);
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log(JSON.stringify({pass:true,filesChecked:checked,functionalImportantDeclarations:safety}));
