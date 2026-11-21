import assert from 'node:assert/strict';
const base=process.env.TEST_BASE||'http://127.0.0.1:8787';
const stamp=Date.now();const leader='qa-leader-'+stamp,member='qa-member-'+stamp,outsider='qa-outsider-'+stamp;
async function call(user,action,values={},status=200){const r=await fetch(base+'/api/campus',{method:action?'POST':'GET',headers:{'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.test','content-type':'application/json'},...(action?{body:JSON.stringify({action,...(action==='register'?{registrationName:'QA Student',registrationEmail:'qa@example.test',confirm:true}:{}),...values})}:{})});const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));return data;}
const unauth=await fetch(base+'/api/campus');assert.equal(unauth.status,401);
for(const id of [leader,member,outsider])await call(id,'profile',{name:id,campus:'RR',year:'2',branch:'CSE',interests:'Design'});
let state=await call(leader);const isAdmin=state.user.admin;
// Tests run against an isolated empty test database. Initial profile becomes private-pilot admin.
assert.ok(isAdmin,'Use a fresh test database');
await call(leader,'club',{name:'QA Club',campus:'RR'});state=await call(leader);const club=state.clubs.find(x=>x.owner===leader);
const future=new Date(Date.now()+86400000*10).toISOString().slice(0,16),deadline=new Date(Date.now()+86400000*8).toISOString().slice(0,16);
await call(outsider,'event',{clubId:club.id,title:'Unauthorized',date:future,deadline,venue:'Lab',min:2,max:2,mode:'native'},403);
await call(leader,'event',{clubId:club.id,title:'QA event',description:'Test',category:'Hackathon',date:future,deadline,venue:'Lab',min:2,max:2,mode:'native'});
state=await call(leader);const event=state.events.find(x=>x.title==='QA event');assert.ok(event);
const team=await call(leader,'team',{event:event.id,name:'QA Team',roles:'Designer',idea:'Test'});
await call(outsider,'message',{team:team.id,text:'Not permitted'},403);
await call(member,'join',{team:team.id,note:'I can help'});state=await call(leader);const request=state.members.find(x=>x.team===team.id&&x.user===member);
await call(outsider,'decide',{id:request.id,accept:true},403);
await call(leader,'register',{event:event.id,team:team.id},400);
await call(leader,'decide',{id:request.id,accept:true});await call(member,'message',{team:team.id,text:'Hello team'});
let other=await call(outsider);assert.ok(!other.messages.some(x=>x.team===team.id),'Private chat leaked');
await call(outsider,'join',{team:team.id});state=await call(leader);const extra=state.members.find(x=>x.team===team.id&&x.user===outsider);await call(leader,'decide',{id:extra.id,accept:true},409);
await call(leader,'register',{event:event.id,team:team.id});await call(leader,'register',{event:event.id,team:team.id});state=await call(leader);assert.equal(state.registrations.filter(x=>x.event===event.id).length,1);
await call(outsider,'registrants',{id:event.id},403);const rows=await call(leader,'registrants',{id:event.id});assert.equal(rows.rows.length,1);
await call(leader,'toggleEvent',{id:event.id});await call(member,'register',{event:event.id,team:team.id},400);
await call(leader,'activity',{title:'QA badminton',category:'Sports',date:future,venue:'Court',spots:2,campus:'RR'});state=await call(leader);const activity=state.activities.find(x=>x.title==='QA badminton');await call(member,'joinActivity',{id:activity.id});const activityRequest=(await call(leader)).conversations.find(c=>c.activity===activity.id);await call(leader,'activityDecision',{id:activityRequest.requestId,accept:true});await call(outsider,'joinActivity',{id:activity.id},409);await call(member,'joinActivity',{id:activity.id});
console.log('PASS: identity, club permissions, event publishing, team requests, capacity, private chat, registration, deduplication, closure, organiser-only data and activity capacity.');
