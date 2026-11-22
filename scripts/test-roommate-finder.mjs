import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {webcrypto} from 'node:crypto';
import ts from 'typescript';
const root=process.cwd(),sqlite=new DatabaseSync(':memory:');sqlite.exec("CREATE TABLE records(id TEXT PRIMARY KEY,kind TEXT NOT NULL,owner TEXT NOT NULL,data TEXT NOT NULL,created INTEGER NOT NULL); CREATE TABLE memberships(id TEXT PRIMARY KEY,team TEXT,user TEXT,status TEXT,name TEXT,note TEXT); CREATE TABLE registrations(id TEXT PRIMARY KEY,event TEXT,user TEXT,data TEXT);");
const env={DB:{async batch(statements){sqlite.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}},prepare(sql){
  function statement(args=[]){return {
    bind(...values){return statement(values)},
    async first(){return sqlite.prepare(sql).get(...args)||null},
    async all(){return {results:sqlite.prepare(sql).all(...args)}},
    async run(){const r=sqlite.prepare(sql).run(...args);return {success:true,meta:{changes:Number(r.changes)}}}
  }}return statement();
}}};
let pageCookie='';let admin=null,oauthFetch=async()=>{throw Error('No external calls allowed in tests')};const cache=new Map();
function load(file){file=path.resolve(root,file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const req=(s)=>{if(s==='next/headers')return {headers:async()=>new Headers({cookie:pageCookie})};if(s==='next/navigation')return {redirect:location=>{const e=Error('Redirect');e.location=location;throw e}};if(s==='cloudflare:workers')return {env};if(s.endsWith('chatgpt-auth'))return {getChatGPTUser:async()=>admin};if(s.startsWith('.'))return load(path.resolve(path.dirname(file),s)+(path.extname(s)?'':'.ts'));throw Error('Unexpected import '+s)};vm.runInNewContext('(function(require,module,exports){'+code+'\n})',{crypto:webcrypto,Response,Request,URL,URLSearchParams,Headers,FormData,AbortSignal,fetch:(...a)=>oauthFetch(...a),btoa,Uint8Array,TextEncoder,Date,console})(req,module,module.exports);return module.exports}
const M=load('lib/roommate-match.ts'),D=load('scripts/fixtures/roommate-demo.ts'),S=load('lib/roommate-server.ts'),api=load('app/api/roommates/route.ts'),A=load('app/api/roommate-admin/route.ts'),start=load('app/api/roommate-auth/start/route.ts'),callback=load('app/api/roommate-auth/callback/route.ts');
const clone=x=>JSON.parse(JSON.stringify(x));const base=D.previewPeople(D.emptyProfile())[0],a={...clone(base),id:'a'},b={...clone(base),id:'b'},c={...clone(base),id:'c'};
assert.equal(M.match(a,b).score,100);b.answers.blocks=['EB1','EB1'];assert.ok(M.match(a,b).score<=100);b.answers=clone(base.answers);b.answers.talk=['Music'];a.weights=Object.fromEntries(M.TOPICS.map(t=>[t,0]));a.weights.Conversations=3;a.weights.Interests=1;assert.equal(M.directional(a,b).score,25);a.weights.Conversations=1;a.weights.Interests=3;assert.equal(M.directional(a,b).score,75,'User priorities must change the score');
a.must=['Conversations'];assert.equal(M.match(a,b),null);a.must=[];b.must=['Conversations'];assert.equal(M.match(a,b),null,'Both people’s must-haves apply');b.must=[];b.answers.talk=[];a.must=['Conversations'];assert.equal(M.match(a,b),null,'Unknown must-have never passes');a.must=[];assert.equal(M.directional(a,b).coverage,75);b.answers=clone(base.answers);b.campus='Other';assert.equal(M.match(a,b),null);b.campus=a.campus;b.available=false;assert.equal(M.match(a,b),null);b.available=true;b.answers.hostelite=['No'];assert.equal(M.match(a,b),null);b.answers=clone(base.answers);
const raw={...clone(a),id:'attacker',name:'Fake',campus:'Fake',answers:{...a.answers,blocks:['EB1','Injected block']}};const clean=M.normaliseRoomProfile(raw,{id:'trusted',name:'Real',campus:'PES'});assert.equal(clean.id,'trusted');assert.equal(clean.campus,'PES');assert.equal(clean.answers.blocks.join(','),'EB1,Injected block');assert.equal(M.QUESTIONS.length,12);assert.ok(!JSON.stringify(M.QUESTIONS).toLowerCase().includes('cleanliness'));
const origin='https://roommate.test';
const adminAuth=load('lib/admin-auth.ts'),adminTestKey='fictional-admin-key-for-tests-only-123456';
env.CAMPUS_ADMIN_KEY_HASH=await load('lib/pesu-oauth.ts').digest(adminTestKey);
const adminLoginRequest=(key=adminTestKey,requestOrigin=origin)=>new Request(origin+'/api/admin/login',{method:'POST',headers:{origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify({key})});
assert.equal((await adminAuth.adminLogin(adminLoginRequest('wrong'))).status,401);
assert.equal((await adminAuth.adminLogin(adminLoginRequest(adminTestKey,'https://evil.test'))).status,403);
const adminSigned=await adminAuth.adminLogin(adminLoginRequest());assert.equal(adminSigned.status,200);const adminCookie=adminSigned.headers.get('set-cookie').split(';')[0];assert.match(adminSigned.headers.get('set-cookie'),/HttpOnly/);assert.match(adminSigned.headers.get('set-cookie'),/Secure/);assert.match(adminSigned.headers.get('set-cookie'),/SameSite=Strict/);
const tokens={};for(const p of [a,b,c]){tokens[p.id]='test-'+p.id;await S.putRoom('rs:'+await load('lib/pesu-oauth.ts').digest(tokens[p.id]),'roomSession',p.id,{identity:{id:p.id,name:p.name,campus:p.campus,branch:p.branch,year:p.year,section:p.section},expires:Date.now()+60000});await S.putRoom('rp:'+p.id,'roomProfile',p.id,p)}
async function call(user,action,values={},status=200){const req=new Request(origin+'/api/roommates',{method:action?'POST':'GET',headers:{...(user?{cookie:'room_session='+tokens[user]}:{}),origin,'Content-Type':'application/json'},...(action?{body:JSON.stringify({action,...values})}:{})});const r=await (action?api.POST(req):api.GET(req)),j=await r.json();assert.equal(r.status,status,JSON.stringify(j));return j}
await call(null,'connect',{target:'a'},401);const csrf=await api.POST(new Request(origin+'/api/roommates',{method:'POST',headers:{origin:'https://evil.test',cookie:'room_session='+tokens.a},body:'{}'}));assert.equal(csrf.status,403);
await call('a','message',{connection:'fake',text:'No'},403);await call('a','connect',{target:'b'});const ab=(await call('b')).connections[0];assert.equal(ab.status,'pending');await call('c','decision',{id:ab.recordId,accept:true},403);await call('a','message',{connection:ab.recordId,text:'Before acceptance'},403);await call('b','decision',{id:ab.recordId,accept:true});await call('a','message',{connection:ab.recordId,text:'Hello, potential roomie'});assert.equal((await call('b')).messages.length,1);assert.equal((await call('c')).messages.length,0);await call('c','message',{connection:ab.recordId,text:'Intrusion'},403);
await call('a','connect',{target:'c'});assert.equal((await call('a')).connections.length,2,'Multiple roommate connections supported');await call('b','block',{target:'a'});assert.equal((await call('a')).messages.length,0);assert.ok(!(await call('a')).matches.some(m=>m.profile.id==='b'));await call('a','message',{connection:ab.recordId,text:'Blocked'},403);await call('c','availability',{available:false});assert.equal((await call('a')).connections.length,0);await call('c','availability',{available:true});await call('a','report',{target:'c',note:'Test report'});
assert.equal((await A.GET()).status,403);admin={email:'other@example.com'};assert.equal((await A.GET()).status,403);admin={email:'njagrith@gmail.com'};assert.equal((await A.GET()).status,403,'The old platform account must no longer grant administrator access');assert.equal((await A.GET(new Request(origin+'/api/roommate-admin',{headers:{cookie:adminCookie}}))).status,200);await A.POST(new Request(origin+'/api/roommate-admin',{method:'POST',headers:{origin,cookie:adminCookie},body:JSON.stringify({id:'c',hidden:true})}));assert.ok(!(await call('a')).matches.some(m=>m.profile.id==='c'));await call('c','profile',{profile:c},403);
assert.equal((await start.GET(new Request(origin+'/api/roommate-auth/start'))).headers.get('location'),origin+'/login?next=/roommates');env.PESU_OAUTH_CLIENT_ID='test-client';const state='legacy-state';await S.putRoom('ro:'+state,'roomOAuth','pending',{verifier:'legacy-verifier',expires:Date.now()+60000});oauthFetch=async(url)=>Response.json(url.endsWith('/token')?{access_token:'test-token'}:{name:'Test Student',prn:'PES1202600001',campus:'PES RR',branch:'CSE',semester:'Sem-3',section:'A'});const cb=new Request(origin+'/api/roommate-auth/callback?state='+state+'&code=test',{headers:{cookie:'room_oauth='+state}});const success=await callback.GET(cb);assert.ok(success.headers.get('set-cookie').includes('room_session='));assert.equal(success.headers.get('location'),origin+'/');const replay=await callback.GET(cb);assert.ok(replay.headers.get('location').includes('failed'));const sessions=sqlite.prepare("SELECT data FROM records WHERE kind='roomSession'").all();assert.ok(!JSON.stringify(sessions).includes('PES1202600001'),'Raw student identifiers must not be retained');assert.ok(!JSON.stringify(sessions).includes('test-token'),'Provider tokens must not be retained');
console.log('PASS: personalised weights, mutual essential requirements, unknown answers, campus/availability filters, trusted identity, 12 cards, origin checks, request acceptance, private chat, multiple connections, blocks, opt-out, reports, owner moderation, PKCE callback, academic scope, one-use OAuth state and identifier/token minimisation.');

// The new student path contacts PESU directly and shares one session with the campus app.
const direct=load('app/api/auth/pesu/route.ts'),campus=load('app/api/campus/route.ts');admin=null;
const loginRequest=(srn='PES1UG26CS999',password='fictional-test-password',requestOrigin=origin)=>new Request(origin+'/api/auth/pesu',{method:'POST',headers:{origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify({srn,password})});
assert.equal((await direct.POST(loginRequest(undefined,undefined,'https://evil.test'))).status,403);
assert.equal((await direct.POST(loginRequest('invalid'))).status,400);
oauthFetch=async()=>new Response('{}',{status:401});assert.equal((await direct.POST(loginRequest())).status,401);
const upstreamCalls=[];oauthFetch=async(url,options)=>{upstreamCalls.push({url,options});return Response.json(url.endsWith('/auth')?{mobileJsonObject:{login:'SUCCESS'},accessToken:'academy-request-only-token'}:{MESSAGE:'SUCCESS_Record found Successfully',STUDENT_INFO:{LoginId:'PES1202600999',SRN:'PES1UG26CS999',NameAsInSSLC:'Fictional Student',Branch:'Computer Science',ClassName:'Sem-3',SectionName:'Section A'},STUDENT_PHOTO:{instituteName:'PES University (Ring Road)'},PRIVATE_PARENT_DETAILS:{phone:'do-not-store'}})};
const signed=await direct.POST(loginRequest());assert.equal(signed.status,200);assert.equal(upstreamCalls.length,2);assert.ok(upstreamCalls.every(c=>new URL(c.url).hostname==='www.pesuacademy.com'));assert.equal(upstreamCalls[0].options.body.get('userName'),'PES1UG26CS999');assert.equal(upstreamCalls[0].options.body.get('password'),'fictional-test-password');assert.equal(upstreamCalls[1].options.headers.Authorization,'Bearer academy-request-only-token');
const sessionCookie=signed.headers.get('set-cookie').split(';')[0];assert.match(signed.headers.get('set-cookie'),/HttpOnly/);assert.match(signed.headers.get('set-cookie'),/Secure/);
const campusReq=()=>new Request(origin+'/api/campus',{headers:{cookie:sessionCookie}});let stateCampus=await (await campus.GET(campusReq())).json();assert.equal(stateCampus.user.name,'Fictional Student');assert.equal(stateCampus.user.campus,'RR');assert.equal(stateCampus.user.year,'2');assert.equal(stateCampus.user.admin,false);assert.equal(stateCampus.pesuLinked,true);
const edited=await campus.POST(new Request(origin+'/api/campus',{method:'POST',headers:{origin,cookie:sessionCookie,'Content-Type':'application/json'},body:JSON.stringify({action:'profile',name:'Spoofed',campus:'EC',branch:'Spoofed',year:'4',interests:'Music'})}));assert.equal(edited.status,200);stateCampus=await (await campus.GET(campusReq())).json();assert.equal(stateCampus.user.name,'Fictional Student');assert.equal(stateCampus.user.campus,'RR');assert.equal(stateCampus.user.year,'2');assert.equal(stateCampus.user.interests,'Music');assert.equal(stateCampus.user.admin,false);
const serialized=JSON.stringify(sqlite.prepare('SELECT data FROM records').all());for(const secret of ['fictional-test-password','academy-request-only-token','PES1UG26CS999','PES1202600999','do-not-store'])assert.ok(!serialized.includes(secret),'Must not persist '+secret);
assert.equal((await campus.GET(new Request(origin+'/api/campus'))).status,401);
const before=sqlite.prepare("SELECT COUNT(*) AS n FROM records WHERE kind='roomSession'").get().n;oauthFetch=async(url)=>Response.json(url.endsWith('/auth')?{mobileJsonObject:{login:'SUCCESS'},accessToken:'another-token'}:{MESSAGE:'SUCCESS_Record found Successfully',STUDENT_INFO:{LoginId:'different-user',SRN:'PES1UG26CS888'}});assert.equal((await direct.POST(loginRequest())).status,502);assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM records WHERE kind='roomSession'").get().n,before);
oauthFetch=async()=>new Response('{}',{status:401});let rateStatus;for(let i=0;i<10;i++)rateStatus=(await direct.POST(loginRequest())).status;assert.equal(rateStatus,429);
console.log('PASS: direct PESU-only SRN/password login, trusted Academy host, credential rejection, identity mismatch rejection, rate limits, no password/token/raw-ID retention, shared campus session, academic field integrity and no first-student admin escalation.');

// Updated onboarding: custom interests are retained, matched, and weighted.
const customProfile={...clone(a),answers:{...a.answers,talk:['Formula 1'],languages:['Tulu']},weights:Object.fromEntries(M.TOPICS.map(t=>[t,0])),must:[]};customProfile.weights.Conversations=3;
const normalizedCustom=M.normaliseRoomProfile(customProfile,{id:a.id,name:a.name,campus:a.campus});assert.equal(normalizedCustom.answers.talk[0],'Formula 1');assert.equal(normalizedCustom.answers.languages[0],'Tulu');
const customOther={...clone(b),answers:{...b.answers,talk:['F1']}};assert.equal(M.directional(normalizedCustom,customOther).score,100,'Recognise an explicit short-topic alias');customOther.answers.talk=['I do not like Formula 1'];assert.equal(M.directional(normalizedCustom,customOther).score,0,'Do not ignore negation in a custom answer');
await call(null,null,{},401);
await call('a','searchPreference',{looking:false});let preferenceState=await call('a');assert.equal(preferenceState.lookingForRoommate,false);assert.equal(preferenceState.profile.available,false);
await call('a','searchPreference',{looking:true});preferenceState=await call('a');assert.equal(preferenceState.lookingForRoommate,true);assert.equal(preferenceState.profile.available,false,'Opting in does not publish a profile before setup');
console.log('PASS: custom topic/language answers, explicit aliases, negation handling, private discovery API and persistent opt-in before profile setup.');

// Page-level access must run before rendering the campus UI.
const gate=load('lib/page-access.ts');
for(const [next,target] of [['/','/login'],['/clubs','/clubs/login'],['/roommates','/login?next=%2Froommates']]){pageCookie='';await assert.rejects(()=>gate.requireStudent(next),e=>e.location===target)}
pageCookie=sessionCookie;assert.equal((await gate.requireStudent()).name,'Fictional Student');
pageCookie='';admin={email:'njagrith@gmail.com'};await assert.rejects(()=>gate.requireStudent(),e=>e.location==='/login');admin=null;
const clubRequest=(action,extra={})=>new Request(origin+'/api/campus',{method:'POST',headers:{origin,cookie:sessionCookie,'Content-Type':'application/json'},body:JSON.stringify({action,...extra})});
assert.equal((await campus.POST(clubRequest('club',{name:'Test Club',approved:true}))).status,200);
const club=sqlite.prepare("SELECT * FROM records WHERE kind='club' LIMIT 1").get();assert.equal(JSON.parse(club.data).approved,false);
assert.equal((await campus.POST(clubRequest('approveClub',{id:club.id}))).status,403);
assert.equal((await campus.POST(clubRequest('event',{clubId:club.id}))).status,403);
const adminDecision=(authenticated=false)=>new Request(origin+'/api/roommate-admin',{method:'POST',headers:{origin,...(authenticated?{cookie:adminCookie}:{})},body:JSON.stringify({action:'clubDecision',id:club.id,approve:true})});
assert.equal((await A.POST(adminDecision())).status,403);admin={email:'njagrith@gmail.com'};assert.equal((await A.POST(adminDecision(true))).status,200);admin=null;
assert.equal(JSON.parse(sqlite.prepare('SELECT data FROM records WHERE id=?').get(club.id).data).approved,true);
assert.equal(M.answerFit('Other','Other'),0);
console.log('PASS: server page gates, separate club login redirect, no admin bypass of student pages, and owner-only club approval.');

// Admin sessions are independent from student and platform identity, expire, and revoke on key change.
assert.equal(await adminAuth.adminUser(campusReq()),null);
const adminReq=new Request(origin+'/api/roommate-admin',{headers:{cookie:adminCookie}});assert.ok(await adminAuth.adminUser(adminReq));
const savedAdminHash=env.CAMPUS_ADMIN_KEY_HASH;env.CAMPUS_ADMIN_KEY_HASH=await load('lib/pesu-oauth.ts').digest('rotated-admin-test-key-123456');assert.equal(await adminAuth.adminUser(adminReq),null);env.CAMPUS_ADMIN_KEY_HASH=savedAdminHash;
await adminAuth.adminLogout(new Request(origin+'/api/admin/logout',{method:'POST',headers:{origin,cookie:adminCookie}}));assert.equal(await adminAuth.adminUser(adminReq),null);
const newLogin=await adminAuth.adminLogin(adminLoginRequest());assert.equal(newLogin.status,200);const newCookie=newLogin.headers.get('set-cookie').split(';')[0];const session=sqlite.prepare("SELECT * FROM records WHERE kind='adminSession' ORDER BY created DESC LIMIT 1").get();const expired={...JSON.parse(session.data),expires:Date.now()-1};sqlite.prepare('UPDATE records SET data=? WHERE id=?').run(JSON.stringify(expired),session.id);assert.equal(await adminAuth.adminUser(new Request(origin+'/admin',{headers:{cookie:newCookie}})),null);
for(let i=0;i<9;i++)await adminAuth.adminLogin(adminLoginRequest('wrong'));assert.equal((await adminAuth.adminLogin(adminLoginRequest())).status,429);
assert.ok(!JSON.stringify(sqlite.prepare('SELECT data FROM records').all()).includes(adminTestKey),'Raw admin key is never stored');
assert.equal(stateCampus.events.length,0,'No fictional events are returned to students');
const campusSource=fs.readFileSync('app/campus-ui.tsx','utf8'),roommateSource=fs.readFileSync('app/roommate-finder.tsx','utf8');assert.ok(!campusSource.includes('seedDemo'));assert.ok(!roommateSource.includes('previewPeople'));
for(const flow of ["action==='join'","action==='joinActivity'","action==='decide'","action==='activityDecision'"])assert.ok(fs.readFileSync('app/api/campus/route.ts','utf8').includes(flow),'Real workflow remains: '+flow);
console.log('PASS: separate administrator key, no old account bypass, CSRF protection, secure expiring/revocable sessions, logout, rate limiting, no sample events and preserved real request workflows.');

// Preserve the actual server workflows while removing only fictional display data.
async function campusAction(cookie,action,v={},status=200){const r=await campus.POST(new Request(origin+'/api/campus',{method:'POST',headers:{origin,cookie,'Content-Type':'application/json'},body:JSON.stringify({action,...v})}));const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d}
await S.putRoom('b','profile','b',{name:'Workflow Member',campus:'RR'});await S.putRoom('c','profile','c',{name:'Workflow Applicant',campus:'RR'});
const futureDate=new Date(Date.now()+3*86400000).toISOString().slice(0,16),futureDeadline=new Date(Date.now()+2*86400000).toISOString().slice(0,16);
const published=await campusAction(sessionCookie,'event',{clubId:club.id,title:'Real workflow regression',date:futureDate,deadline:futureDeadline,venue:'Test venue',category:'Workshop',min:2,max:3,mode:'native',formFields:[]});
const team=await campusAction(sessionCookie,'team',{event:published.event.id,name:'Regression Team',teammateIds:'b'});
await campusAction('room_session='+tokens.b,'acceptInvite',{id:team.id+':b'});
await campusAction('room_session='+tokens.c,'join',{team:team.id,note:'I would like to join.'});
const pendingCampus=await (await campus.GET(campusReq())).json();assert.ok(pendingCampus.conversations.some(c=>c.requestId===team.id+':c'&&c.status==='pending'));
await campusAction(sessionCookie,'decide',{id:team.id+':c',accept:true});
await campusAction('room_session='+tokens.c,'message',{team:team.id,text:'Accepted team chat still works.'});
await campusAction(sessionCookie,'register',{event:published.event.id,team:team.id,registrationName:'Test Leader',registrationEmail:'leader@example.test',confirm:true,answers:{}});
const registered=await (await campus.GET(campusReq())).json();assert.equal(registered.registrations[0].team.members.length,3);
await campusAction(sessionCookie,'activity',{title:'Workflow Activity',date:futureDate,venue:'Test venue',spots:2,campus:'RR'});
const activity=sqlite.prepare("SELECT * FROM records WHERE kind='activity' LIMIT 1").get();await campusAction('room_session='+tokens.c,'joinActivity',{id:activity.id,note:'Joining this plan.'});
const requests=await (await campus.GET(campusReq())).json();const request=requests.conversations.find(c=>c.activity===activity.id);assert.equal(request.status,'pending');
await campusAction(sessionCookie,'activityDecision',{id:request.requestId,accept:true});assert.ok(JSON.parse(sqlite.prepare('SELECT data FROM records WHERE id=?').get(activity.id).data).joined.includes('c'));
console.log('PASS: real event publishing, team creation/invitations/join approval, accepted team chat, roster registration and activity request approval remain functional.');

// Stored listings can be archived and restored without deleting accounts or workflows.
const archiveToken='archive-regression-session';await S.putRoom('as:'+await load('lib/pesu-oauth.ts').digest(archiveToken),'adminSession','site-administrator',{expires:Date.now()+60000,version:env.CAMPUS_ADMIN_KEY_HASH});
const archiveRequest=(id,kind,archived,cookie='campus_admin='+archiveToken)=>new Request(origin+'/api/roommate-admin',{method:'POST',headers:{origin,cookie},body:JSON.stringify({action:'archiveContent',id,kind,archived})});
assert.equal((await A.POST(archiveRequest(published.event.id,'event',true,sessionCookie))).status,403);
assert.equal((await A.POST(archiveRequest('b','profile',true))).status,400);
assert.equal((await A.POST(archiveRequest('missing','team',true))).status,404);
assert.equal((await A.POST(archiveRequest(published.event.id,'event',true))).status,200);
const archivedView=await (await campus.GET(campusReq())).json();assert.ok(!archivedView.events.some(e=>e.id===published.event.id));assert.ok(!archivedView.teams.some(t=>t.id===team.id));assert.ok(!archivedView.members.some(m=>m.team===team.id));assert.ok(!archivedView.conversations.some(c=>c.team===team.id));assert.ok(!archivedView.registrations.some(r=>r.event===published.event.id));
await campusAction('room_session='+tokens.c,'message',{team:team.id,text:'Archived team is unavailable.'},403);
assert.ok(sqlite.prepare('SELECT id FROM records WHERE id=?').get(published.event.id),'Archive preserves stored data');
assert.equal((await A.POST(archiveRequest(published.event.id,'event',false))).status,200);
assert.ok((await (await campus.GET(campusReq())).json()).teams.some(t=>t.id===team.id));
assert.equal((await A.POST(archiveRequest(team.id,'team',true))).status,200);assert.ok(!(await (await campus.GET(campusReq())).json()).teams.some(t=>t.id===team.id));
assert.equal((await A.POST(archiveRequest(team.id,'team',false))).status,200);await campusAction('room_session='+tokens.c,'message',{team:team.id,text:'Restored team chat works.'});
assert.equal((await (await campus.GET(campusReq())).json()).user.name,'Fictional Student','Listing removal must not remove the signed-in account');
console.log('PASS: admin-only reversible listing archive, dependent team/registration/request isolation, direct action rejection and restoration with account/workflow preservation.');
