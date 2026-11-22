import {env} from 'cloudflare:workers';
import {authenticatePesu,PesuError} from '../../../../lib/pesu-direct';
import {digest} from '../../../../lib/pesu-oauth';
import {sameOrigin,reply,putRoom,random,body,cookie} from '../../../../lib/roommate-server';
export const dynamic='force-dynamic';
async function throttle(key:string,limit:number){const id='login-limit:'+await digest(key)+':'+Math.floor(Date.now()/300000);const r=await env.DB!.prepare("INSERT INTO records VALUES(?,'loginLimit','system',?,?) ON CONFLICT(id) DO UPDATE SET data=json_set(records.data,'$.count',json_extract(records.data,'$.count')+1) RETURNING data").bind(id,JSON.stringify({count:1}),Date.now()).first();return JSON.parse(String(r?.data||'{}')).count>limit}
export async function POST(req:Request){
 if(!sameOrigin(req))return reply({error:'Invalid request origin'},403);
 if(!env.DB)return reply({error:'Sign-in is temporarily unavailable'},503);
 try{
 const v=await body(req);const srn=typeof v.srn==='string'?v.srn.trim().toUpperCase():'';const password=v.password;
 if(!/^PES[1-9][A-Z0-9]{7,24}$/.test(srn)||typeof password!=='string'||!password.length||password.length>128)return reply({error:'Enter your PESU SRN and password.'},400);
 const ip=req.headers.get('cf-connecting-ip');if((ip&&await throttle('ip:'+ip,30))||await throttle('account:'+srn,8))return reply({error:'Too many sign-in attempts. Please wait five minutes before trying again.'},429);
 const p=await authenticatePesu(srn,password);const {identifier,...academic}=p;const id='pesu:'+await digest(identifier),identity={id,...academic};
 // Rotate an existing local session after a successful Academy check.
 const old=cookie(req,'room_session');if(old)await env.DB.prepare("DELETE FROM records WHERE id=? AND kind='roomSession'").bind('rs:'+await digest(old)).run();
 const session=random();await putRoom('rs:'+await digest(session),'roomSession',id,{identity,expires:Date.now()+7*86400000});
 const oldProfile=await env.DB.prepare("SELECT data FROM records WHERE id=? AND kind='profile'").bind(id).first();const previous=oldProfile?JSON.parse(String(oldProfile.data)):{};
 const campus=/electronic/i.test(academic.campus)?'EC':/ring road/i.test(academic.campus)?'RR':academic.campus;
 await putRoom(id,'profile',id,{...previous,name:academic.name,campus,branch:academic.branch,year:academic.year,section:academic.section,semester:academic.semester,interests:previous.interests||'',bio:previous.bio||'',pesuVerified:true});
 const oldRoom=await env.DB.prepare("SELECT data FROM records WHERE id=? AND kind='roomProfile'").bind('rp:'+id).first();if(oldRoom)await putRoom('rp:'+id,'roomProfile',id,{...JSON.parse(String(oldRoom.data)),...identity});
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':`room_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`}});
 }catch(e){return reply({error:e instanceof PesuError?e.message:'Unable to sign in. Please try again.'},e instanceof PesuError?e.status:400)}
}
