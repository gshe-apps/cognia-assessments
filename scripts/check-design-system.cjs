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

/* Drift guard (6 November 2026): components come only from ds/cognia/cognia-components.css,
   the cognia-design plugin copy. No new stylesheet files, and no screen may link a stylesheet
   it did not already link. scripts/stylesheet-lock.json records today's links and may only
   shrink: run with --update-lock after removing links or files, never to add them.
   New screens may link only the tokens, the shared components and one layout file. */
const lockPath=path.join(__dirname,'stylesheet-lock.json');
const SHARED=['ds/cognia/tokens.css','ds/cognia/colors_and_type.css','ds/cognia/cognia-components.css'];
const cssFiles=[];(function list(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())list(f);else if(f.endsWith('.css'))cssFiles.push(path.relative(root,f).split(path.sep).join('/'))}})(root);
const screenLinks={};
for(const f of fs.readdirSync(root).filter(f=>f.endsWith('.dc.html'))){
 const html=fs.readFileSync(path.join(root,f),'utf8');
 screenLinks[f]=[...html.matchAll(/<link[^>]+href="(?:\.\/)?([^"?#]+\.css)[^"]*"/g)].map(m=>m[1]).filter(h=>!/^https?:/.test(h));
}
const lock=fs.existsSync(lockPath)?JSON.parse(fs.readFileSync(lockPath,'utf8')):null;
if(process.argv.includes('--update-lock')||!lock){
 if(lock){
  for(const c of cssFiles)if(!lock.files.includes(c))problems.push(c+': new stylesheet file. Use ds/cognia/cognia-components.css, or ask the designer to add the component to the cognia-design plugin.');
  for(const [s,links] of Object.entries(screenLinks))for(const l of links)if(lock.screens[s]&&!lock.screens[s].includes(l))problems.push(s+': links '+l+', which it did not link before.');
 }
 if(!problems.length){fs.writeFileSync(lockPath,JSON.stringify({note:'Stylesheets each screen may link. May only shrink; see scripts/check-design-system.cjs.',files:cssFiles.sort(),screens:screenLinks},null,1)+'\n');console.log('stylesheet lock written');}
}else{
 for(const c of cssFiles)if(!lock.files.includes(c))problems.push(c+': new stylesheet file. Use ds/cognia/cognia-components.css, or ask the designer to add the component to the cognia-design plugin.');
 for(const [s,links] of Object.entries(screenLinks)){
  if(lock.screens[s]){for(const l of links)if(!lock.screens[s].includes(l))problems.push(s+': links '+l+', which it did not link before. Use the shared components instead.');}
  else{const extra=links.filter(l=>!SHARED.includes(l));if(extra.length>1)problems.push(s+': a new screen may link only the tokens, ds/cognia/cognia-components.css and one layout file, not '+extra.join(', '));
   if(!links.includes('ds/cognia/cognia-components.css'))problems.push(s+': a new screen must link ds/cognia/cognia-components.css');}
 }
}
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log(JSON.stringify({pass:true,filesChecked:checked,functionalImportantDeclarations:safety,stylesheetLock:'ok'}));
