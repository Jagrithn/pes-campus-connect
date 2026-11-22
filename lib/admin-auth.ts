import {env} from 'cloudflare:workers';
import {cookie,putRoom,random,reply,sameOrigin,body} from './roommate-server';
import {digest} from './pesu-oauth';
const config=()=>((env as unknown as {CAMPUS_ADMIN_KEY_HASH?:string}).CAMPUS_ADMIN_KEY_HASH||'');
function equalHash(a:string,b:string){let diff=a.length^b.length;for(let i=0;i<64;i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0}
export async function adminUser(req?:Request){const version=config();if(!req||!/^[A-Za-z0-9_-]{43}$/.test(version))return null;const token=cookie(req,'campus_admin');if(!token)return null;const row=await env.DB?.prepare("SELECT data FROM records WHERE id=? AND kind='adminSession'").bind('as:'+await digest(token)).first();if(!row)return null;const session=JSON.parse(String(row.data));return session.expires>Date.now()&&equalHash(session.version,version)?{id:'site-administrator'}:null}
export async function adminLogin(req:Request){
 if(!sameOrigin(req))return reply({error:'Invalid request origin'},403);
 if(!env.DB||!/^[A-Za-z0-9_-]{43}$/.test(config()))return reply({error:'Administrator login has not been configured.'},503);
 try{const v=await body(req);const bucket='admin-limit:'+await digest(req.headers.get('cf-connecting-ip')||'shared')+':'+Math.floor(Date.now()/300000);const row=await env.DB.prepare("INSERT INTO records VALUES(?,'adminLoginLimit','system',?,?) ON CONFLICT(id) DO UPDATE SET data=json_set(records.data,'$.count',json_extract(records.data,'$.count')+1) RETURNING data").bind(bucket,JSON.stringify({count:1}),Date.now()).first();if(JSON.parse(String(row?.data||'{}')).count>8)return reply({error:'Too many attempts. Please wait five minutes.'},429);
 if(typeof v.key!=='string'||v.key.length<24||v.key.length>256||!equalHash(await digest(v.key),config()))return reply({error:'Invalid administrator key.'},401);
 const old=cookie(req,'campus_admin');if(old)await env.DB.prepare("DELETE FROM records WHERE id=? AND kind='adminSession'").bind('as:'+await digest(old)).run();
 const token=random();await putRoom('as:'+await digest(token),'adminSession','site-administrator',{expires:Date.now()+6*3600000,version:config()});
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':`campus_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=21600`}});
 }catch{return reply({error:'Unable to sign in. Please try again.'},400)}
}
export async function adminLogout(req:Request){if(!sameOrigin(req))return reply({error:'Invalid request origin'},403);await env.DB?.prepare("DELETE FROM records WHERE id=? AND kind='adminSession'").bind('as:'+await digest(cookie(req,'campus_admin'))).run();return new Response(null,{status:303,headers:{Location:'/admin','Cache-Control':'no-store','Set-Cookie':'campus_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}})}
