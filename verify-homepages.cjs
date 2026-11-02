const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const root=path.join(__dirname,'project');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const reports=[];
const runDC=(html,stored)=>{
 const code=html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
 const storage=new Map(Object.entries(stored||{}));
 const context={DCLogic:class{state={};props={};setState(p){Object.assign(this.state,p)}},window:{localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},sessionStorage:{getItem:()=>null,setItem(){}}},document:{addEventListener(){}},setTimeout(){}};
 vm.createContext(context);
 vm.runInContext(code+';globalThis.instance=new Component()',context);
 return context.instance;
};
const shell=(instance,file)=>{
 let vals=instance.renderVals();
 assert.equal(vals.appsOpen,false);
 vals.toggleApps();vals=instance.renderVals();assert.equal(vals.appsOpen,true,`${file}: hub opens`);
 vals.pickLn();assert.equal(instance.renderVals().hubLn,true,`${file}: hub tabs`);
 vals.closeApps();assert.equal(instance.renderVals().appsOpen,false);
 vals=instance.renderVals();vals.toggleAcct();assert.equal(instance.renderVals().acctOpen,true);
 instance.renderVals().openRoles();assert.equal(instance.renderVals().rolesOpen,true);
 instance.renderVals().pickBasic();assert.equal(instance.renderVals().planBasic,true);
};
// One administrator Home serves both admin personas (2 Nov): hub previews, persona destinations, shared shell.
{
 const file='District-Home.dc.html',html=read(file);
 assert(html.includes('data-persona="{{persona}}"'),`${file}: persona`);
 for(const text of ['Welcome back, {{firstName}}','Assessment results','Data and Reporting','Observations','Surveys','Performance','href="{{overviewHref}}"','href="OS-Observations.dc.html"','href="OS-Surveys.dc.html"'])assert(html.includes(text),`${file}: ${text}`);
 assert(!html.includes('<span>Classroom Assessment</span>'),`${file}: admins do not see Classroom Assessment in the hub`);
 for(const [persona,first,overview] of [['district','Jordan','SA2-Hub.dc.html'],['school','Priya','PA-Overview.dc.html']]){
   const instance=runDC(html,{cogniaPersona:persona});
   const vals=instance.renderVals();
   assert.equal(vals.persona,persona);assert.equal(vals.firstName,first);assert.equal(vals.overviewHref,overview,`${file}: ${persona} results destination`);
   shell(instance,file);
 }
 reports.push(`${file}: district and school Home, results destinations, Observations and Surveys links, account, role switch, hub and plan state passed`);
}
// Educator Home keeps its own content.
{
 const file='CAP-T00-Home.dc.html',html=read(file);
 assert(html.includes('data-persona="educator"'),`${file}: persona`);
 assert(html.includes('href="CAP-T01-Overview.dc.html"'),`${file}: assessment destination`);
 for(const text of ['Welcome back, Jordan','What can we help you with today?','Your question','Priority actions','Your hubs','Pick up where you left off'])assert(html.includes(text),`${file}: ${text}`);
 assert.equal((html.match(/class="home-card home-hub"/g)||[]).length,3);
 assert.equal((html.match(/class="home-card home-recent-link home-continue"/g)||[]).length,1);
 assert(html.includes('href="OS-Observations.dc.html"')&&html.includes('href="OS-Surveys.dc.html"'),`${file}: Observations and Surveys open from the hub`);
 shell(runDC(html),file);
 reports.push(`${file}: Home sections, destinations, account, role switch, hub and plan state passed`);
}
// Observations and Surveys pages work for admins and educators.
for(const file of ['OS-Observations.dc.html','OS-Surveys.dc.html']){
 const html=read(file);
 for(const [persona,initials] of [['district','JE'],['school','PS'],['educator','SL']]){
   const instance=runDC(html,{cogniaPersona:persona});const vals=instance.renderVals();
   assert.equal(vals.acctInitials,initials,`${file}: ${persona} identity`);
   assert.equal(vals.hubFmShow,persona==='educator',`${file}: Classroom Assessment only for educators`);
   shell(instance,file);
 }
 reports.push(`${file}: admin and educator identity, persona hub and shell passed`);
}
const entry=read('index.html');
assert(entry.includes('data-open-admin'));
assert(entry.includes('href="CAP-T00-Home.dc.html" data-persona="educator"'));
assert(entry.includes('href="STU2-SignIn.dc.html" data-persona="student"'));
assert(entry.includes('href="District-Home.dc.html" data-persona="district"'));
assert(entry.includes('href="District-Home.dc.html" data-persona="school"'));
assert.equal((entry.match(/class="home-card persona-card"/g)||[]).length,3);
assert(read('../serve.cjs').includes("pathname === '/' ? '/index.html'"));
reports.push('Entry: exactly three persona cards; both admin options open the one Home as their persona; educator Home; student sign-in; default server route passed');
let switches=0;
for(const file of fs.readdirSync(root).filter(n=>n.endsWith('.html'))){
 const html=read(file);
 for(const role of html.matchAll(/<a\b[^>]*class="[^"]*\broleopt\b[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)){
   if(!/Educator/.test(role[2]))continue;
   switches++;
   assert.equal(role[1],'CAP-T00-Home.dc.html',`${file}: educator role must open Home`);
 }
 // Check every local dependency and new navigational target on the four new screens.
 if(!['District-Home.dc.html','CAP-T00-Home.dc.html','OS-Observations.dc.html','OS-Surveys.dc.html','index.html'].includes(file))continue;
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

assert.equal(read('Main.dc.html'),read('index.html'),'Legacy client link must show the audience selector');
