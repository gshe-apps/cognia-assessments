const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const root=path.join(__dirname,'project');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const reports=[];
for(const [file,role,overview] of [
 ['Main.dc.html','district','SA2-Hub.dc.html'],
 ['PA1-Home.dc.html','school','PA-Overview.dc.html'],
 ['CAP-T00-Home.dc.html','educator','CAP-T01-Overview.dc.html'],
]){
 const html=read(file);
 assert(html.includes(`data-persona="${role}"`),`${file}: persona`);
 assert(html.includes(`href="${overview}"`),`${file}: assessment destination`);
 for(const text of ['Welcome back, Jordan','What can we help you with today?','Your question','Priority actions','Your hubs','Pick up where you left off'])assert(html.includes(text),`${file}: ${text}`);
 assert.equal((html.match(/class="home-card home-priority"/g)||[]).length,0);
 assert.equal((html.match(/class="home-card home-hub"/g)||[]).length,role==='educator'?3:4);
 assert.equal((html.match(/class="home-card home-recent-link home-continue"/g)||[]).length,1);
 assert(!html.includes('home-section-heading'),`${file}: no extra section subtitles`);
 assert(!html.includes('home-intro'),`${file}: no additional introduction`);
 assert(!/<main[^>]*class="soonpg"/.test(html));
 const code=html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
 const storage=new Map();
 const context={DCLogic:class{state={};props={};setState(p){Object.assign(this.state,p)}},window:{localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},sessionStorage:{getItem:()=>null}},document:{addEventListener(){}},setTimeout(){}};
 vm.createContext(context);
 vm.runInContext(code+';globalThis.instance=new Component()',context);
 let vals=context.instance.renderVals();
 assert.equal(vals.appsOpen,false);
 vals.toggleApps();vals=context.instance.renderVals();assert.equal(vals.appsOpen,true);
 vals.pickLn();assert.equal(context.instance.renderVals().hubLn,true);
 vals.closeApps();assert.equal(context.instance.renderVals().appsOpen,false);
 vals=context.instance.renderVals();vals.toggleAcct();assert.equal(context.instance.renderVals().acctOpen,true);
 context.instance.renderVals().openRoles();assert.equal(context.instance.renderVals().rolesOpen,true);
 context.instance.renderVals().pickBasic();assert.equal(context.instance.renderVals().planBasic,true);
 reports.push(`${file}: Home sections, destinations, account, role switch, hub and plan state passed`);
}
const entry=read('index.html');
assert(entry.includes('data-open-admin'));
assert(entry.includes('href="CAP-T00-Home.dc.html"'));
assert(entry.includes('href="CAP-S01-SignIn.dc.html"'));
assert(entry.includes('href="Main.dc.html"'));
assert(entry.includes('href="PA1-Home.dc.html"'));
assert.equal((entry.match(/class="home-card persona-card"/g)||[]).length,3);
assert(read('../serve.cjs').includes("pathname === '/' ? '/index.html'"));
reports.push('Entry: exactly three persona cards; both admin options; educator Home; student sign-in; default server route passed');
let switches=0;
for(const file of fs.readdirSync(root).filter(n=>n.endsWith('.html'))){
 const html=read(file);
 for(const role of html.matchAll(/<a\b[^>]*class="[^"]*\broleopt\b[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)){
   if(!/Educator/.test(role[2]))continue;
   switches++;
   assert.equal(role[1],'CAP-T00-Home.dc.html',`${file}: educator role must open Home`);
 }
 // Check every local dependency and new navigational target on the four new screens.
 if(!['Main.dc.html','PA1-Home.dc.html','CAP-T00-Home.dc.html','index.html'].includes(file))continue;
 for(const attr of html.matchAll(/(?:href|src)="([^"{}]+)"/g)){
   const target=attr[1].split(/[?#]/)[0];
   if(!target||/^(https?:|data:|mailto:|\/)/.test(target))continue;
   assert(fs.existsSync(path.join(root,target)),`${file}: missing ${target}`);
 }
}
assert(switches>=50);
reports.push(`${switches} educator role-switch links checked across existing flows`);
for(const file of ['home-pages.js','persona-routing.js'])new vm.Script(read(file));
assert(!/#[a-f\d]{3,8}\b|\brgba?\(/i.test(read('home-pages.css')),'Home CSS must use colour tokens');
assert(!read('assets/cognia-logo.svg').includes('<text'),'Official vector wordmark, not text substitute');
reports.push('New scripts compile; Home colours use tokens; supplied Cognia wordmark present');
console.log(reports.join('\n'));
