import {env} from 'cloudflare:workers';
import {match,normaliseRoomProfile,campusKey,type RoomProfile} from '../../../lib/roommate-match';
import {socialUrl} from '../../../lib/discovery';
import {reply,roomUser,readRoom,putRoom,roomRows,sameOrigin,body,isBlocked,allowedPair,random} from '../../../lib/roommate-server';
export const dynamic='force-dynamic';
const unpack=(r:any)=>({...JSON.parse(String(r.data)),recordId:String(r.id),owner:String(r.owner),...(r.created!==undefined?{created:Number(r.created)}:{})});
const publicRoom=(p:RoomProfile)=>({id:p.id,name:p.name,campus:p.campus,branch:p.branch,year:p.year,semester:p.semester,section:p.section,answers:p.answers,bio:p.bio||'',github:p.github||'',linkedin:p.linkedin||''});
async function record(id:string,kind:string){const row=await env.DB!.prepare('SELECT id,owner,data,created FROM records WHERE id=? AND kind=?').bind(id,kind).first();return row?unpack(row):null}
async function saveProfile(p:RoomProfile){
 // A student save must not undo moderation, including a concurrent admin action.
 const result=await env.DB!.prepare("INSERT INTO records VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=json_set(excluded.data,'$.hidden',COALESCE(json_extract(records.data,'$.hidden'),0)) WHERE COALESCE(json_extract(records.data,'$.hidden'),0)=0 OR json_extract(excluded.data,'$.available')=0").bind('rp:'+p.id,'roomProfile',p.id,JSON.stringify(p),Date.now()).run();
 return Number(result.meta.changes)>0;
}
export async function GET(req:Request){try{
 const user=await roomUser(req);if(!user)return reply({error:'PESU login required'},401);
 const me=await readRoom(user.id),preference=await record('room-search:'+user.id,'roomSearchPreference');
 const profiles=await roomRows('roomProfile'),byId=new Map(profiles.map(p=>[p.id,p]));
 const blockRows=(await env.DB!.prepare("SELECT id,owner,data FROM records WHERE kind='roomBlock' AND (owner=? OR json_extract(data,'$.target')=?)").bind(user.id,user.id).all()).results.map(unpack);
 const blockedIds=new Set(blockRows.map(b=>b.owner===user.id?b.target:b.owner));
 const pair=(other:any)=>me?.available&&me.answers?.hostelite?.[0]==='Yes'&&!me.hidden&&other?.available&&other.answers?.hostelite?.[0]==='Yes'&&!other.hidden&&campusKey(me.campus)===campusKey(other.campus)&&!blockedIds.has(other.id);
 const ownConnections=(await env.DB!.prepare("SELECT id,owner,data,created FROM records WHERE kind='roomConnection' AND (json_extract(data,'$.from')=? OR json_extract(data,'$.to')=?) ORDER BY created DESC,id DESC").bind(user.id,user.id).all()).results.map(unpack);
 const declined=new Set(ownConnections.filter(c=>c.status==='declined').map(c=>c.from===user.id?c.to:c.from));
 const matches=[];if(me?.available&&!me.hidden)for(const p of profiles){if(!pair(p)||declined.has(p.id))continue;const m=match(me,p);if(m)matches.push({...m,profile:publicRoom(p)})}
 matches.sort((a,b)=>(b.score??-1)-(a.score??-1)||b.coverage-a.coverage||a.profile.id.localeCompare(b.profile.id));
 const connections=ownConnections.filter(c=>pair(byId.get(c.from===user.id?c.to:c.from))).map(c=>({recordId:c.recordId,from:c.from,to:c.to,status:c.status,created:c.created,person:byId.get(c.from===user.id?c.to:c.from)?.name||'Student'}));
 const accepted=connections.filter(c=>c.status==='accepted').map(c=>c.recordId),params=new URL(req.url).searchParams,selected=params.get('connection');
 if(selected&&!connections.some(c=>c.recordId===selected))return reply({error:'This accepted connection is unavailable'},403);
 const before=params.get('before'),beforeId=params.get('beforeId');
 if((before!==null||beforeId!==null)&&(!selected||before===null||!/^\d+$/.test(before)||!Number.isSafeInteger(Number(before))||!beforeId||beforeId.length>150))return reply({error:'Invalid message history cursor'},400);
 let messages:any[]=[],hasOlder=false;
 if(accepted.length&&(!selected||accepted.includes(selected))){let query="SELECT id,owner,data,created FROM records WHERE kind='roomMessage' AND json_extract(data,'$.connection') IN (SELECT value FROM json_each(?))";const args:any[]=[JSON.stringify(selected?[selected]:accepted)];if(before!==null){query+=' AND (created<? OR (created=? AND id<?))';args.push(Number(before),Number(before),beforeId)}query+=' ORDER BY created DESC,id DESC LIMIT ?';args.push(selected?51:300);const rows=(await env.DB!.prepare(query).bind(...args).all()).results.map(unpack);hasOlder=!!selected&&rows.length>50;messages=(selected?rows.slice(0,50):rows).reverse().map(({owner,...m})=>m)}
 const blocked=blockRows.filter(b=>b.owner===user.id).map(b=>({id:b.target,name:byId.get(b.target)?.name||'Student'}));
 return reply({user,profile:me,lookingForRoommate:preference?preference.looking:me?true:null,matches:matches.slice(0,60),connections,messages,hasOlder,blocked,configured:true});
 }catch{return reply({error:'Roommate Finder is temporarily unavailable. Please retry.'},503)}}
export async function POST(req:Request){try{
 if(!sameOrigin(req))return reply({error:'Invalid request origin'},403);const user=await roomUser(req);if(!user)return reply({error:'Sign in with PESU first'},401);
 const v=await body(req);if(v.expectedUserId&&v.expectedUserId!==user.id)return reply({error:'Your signed-in account changed. Reload before saving.'},409);
 const me=await readRoom(user.id);
 if(v.action==='searchPreference'){
  if(typeof v.looking!=='boolean')return reply({error:'Choose whether you are looking for a roommate'},400);
  if(v.looking&&me?.hidden)return reply({error:'Your profile is hidden by the administrator.'},403);
  const statements=[env.DB!.prepare('INSERT INTO records VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind('room-search:'+user.id,'roomSearchPreference',user.id,JSON.stringify({looking:v.looking}),Date.now())];
  if(!v.looking)statements.push(env.DB!.prepare("UPDATE records SET data=json_set(data,'$.available',json('false')) WHERE id=? AND kind='roomProfile'").bind('rp:'+user.id));await env.DB!.batch(statements);return reply({ok:true});
 }
 if(v.action==='profile'){
  const p=normaliseRoomProfile(v.profile,user);p.github=socialUrl(v.profile.github,'github');p.linkedin=socialUrl(v.profile.linkedin,'linkedin');
  if(!await saveProfile(p))return reply({error:'Your profile is hidden by the administrator.'},403);
  await putRoom('room-search:'+user.id,'roomSearchPreference',user.id,{looking:true});return reply({ok:true});
 }
 if(v.action==='availability'){
  if(typeof v.available!=='boolean')return reply({error:'Choose available or unavailable'},400);if(!me)return reply({error:'Complete your profile first'},400);
  const p=normaliseRoomProfile({...me,available:v.available},user);p.github=me.github;p.linkedin=me.linkedin;
  if(!await saveProfile(p))return reply({error:'Your profile is hidden by the administrator.'},403);
  if(v.available)await putRoom('room-search:'+user.id,'roomSearchPreference',user.id,{looking:true});return reply({ok:true});
 }
 if(v.action==='connect'){
  const target=typeof v.target==='string'?v.target:'';if(target===user.id||!await allowedPair(user.id,target))return reply({error:'This person is not available'},403);
  const other=await readRoom(target);if(!match(me,other))return reply({error:'Your essential preferences do not currently match'},409);
  const id='rc:'+ [user.id,target].sort().join(':'),previous=await record(id,'roomConnection');
  if(previous?.status==='declined')return reply({error:'This connection was declined. Explore other recommendations.'},409);
  if(!previous)await env.DB!.prepare('INSERT OR IGNORE INTO records VALUES(?,?,?,?,?)').bind(id,'roomConnection',user.id,JSON.stringify({from:user.id,to:target,status:'pending',created:Date.now()}),Date.now()).run();
  return reply({ok:true,connectionId:id});
 }
 if(v.action==='decision'){
  if(typeof v.accept!=='boolean')return reply({error:'Choose accept or decline'},400);
  const c=await record(String(v.id||''),'roomConnection');if(!c||c.to!==user.id||c.status!=='pending'||!await allowedPair(c.from,c.to))return reply({error:'Request unavailable'},403);
  const updated=await env.DB!.prepare("UPDATE records SET data=json_set(data,'$.status',?) WHERE id=? AND kind='roomConnection' AND json_extract(data,'$.status')='pending' AND json_extract(data,'$.to')=?").bind(v.accept?'accepted':'declined',c.recordId,user.id).run();if(!updated.meta.changes)return reply({error:'This request was already handled. Refresh your connections.'},409);
  return reply({ok:true,connectionId:c.recordId});
 }
 if(v.action==='message'){
  const c=await record(String(v.connection||''),'roomConnection');if(!c||![c.from,c.to].includes(user.id)||c.status!=='accepted'||!await allowedPair(c.from,c.to))return reply({error:'Accept a connection before chatting'},403);
  if(typeof v.text!=='string'||!v.text.trim()||v.text.length>2000)return reply({error:'Write a message of 1–2000 characters'},400);
  const key='room-message-limit:'+user.id+':'+Math.floor(Date.now()/60000),limit=await env.DB!.prepare("INSERT INTO records VALUES(?,'roomMessageLimit',?, ?,?) ON CONFLICT(id) DO UPDATE SET data=json_set(records.data,'$.count',json_extract(records.data,'$.count')+1) RETURNING data").bind(key,user.id,JSON.stringify({count:1}),Date.now()).first();if(JSON.parse(String(limit?.data||'{}')).count>20)return reply({error:'Please wait a minute before sending more messages'},429);
  await putRoom('rm:'+random(),'roomMessage',user.id,{connection:c.recordId,from:user.id,text:v.text.trim(),created:Date.now()});return reply({ok:true});
 }
 if(v.action==='unblock'){
  if(typeof v.target!=='string')return reply({error:'Choose a blocked profile'},400);await env.DB!.prepare("DELETE FROM records WHERE id=? AND owner=? AND kind='roomBlock'").bind('rb:'+user.id+':'+v.target,user.id).run();return reply({ok:true});
 }
 if(v.action==='block'||v.action==='report'){
  const target=typeof v.target==='string'?v.target:'';if(target===user.id||!await readRoom(target))return reply({error:'Profile unavailable'},404);
  if(v.action==='report'&&(typeof v.note!=='string'||!v.note.trim()||v.note.length>600))return reply({error:'Describe the concern in 1–600 characters'},400);
  await putRoom(v.action==='block'?'rb:'+user.id+':'+target:'rr:'+random(),v.action==='block'?'roomBlock':'roomReport',user.id,{target,note:v.action==='report'?v.note.trim():'',created:Date.now()});return reply({ok:true});
 }
 return reply({error:'Unknown action'},400);
 }catch(e){return reply({error:e instanceof Error?e.message:'Unable to save'},400)}}
