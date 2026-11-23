import {campusKey} from './roommate-match';
import {env} from 'cloudflare:workers';
import {digest,b64} from './pesu-oauth';
export const random=()=>b64(crypto.getRandomValues(new Uint8Array(32)));
export const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export const cookie=(req:Request,key:string)=>(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(key+'='))?.slice(key.length+1)||'';
export async function roomUser(req:Request){const token=cookie(req,'room_session');if(!token)return null;const row=await env.DB!.prepare("SELECT data,owner FROM records WHERE id=? AND kind='roomSession'").bind('rs:'+await digest(token)).first();if(!row)return null;const data=JSON.parse(String(row.data));return data.expires>Date.now()?{...data.identity,id:String(row.owner)}:null}
export async function readRoom(id:string){const r=await env.DB!.prepare("SELECT data FROM records WHERE id=? AND kind='roomProfile'").bind('rp:'+id).first();return r?JSON.parse(String(r.data)):null}
export async function putRoom(id:string,kind:string,owner:string,data:unknown){await env.DB!.prepare('INSERT INTO records VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind(id,kind,owner,JSON.stringify(data),Date.now()).run()}
export async function roomRows(kind:string){const r=await env.DB!.prepare('SELECT id,owner,data FROM records WHERE kind=? ORDER BY created DESC').bind(kind).all();return r.results.map((x:any)=>({...JSON.parse(x.data),recordId:x.id,owner:x.owner}))}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin}
export async function body(req:Request){const text=await req.text();if(text.length>24000)throw Error('Request too large');const value=JSON.parse(text);if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Send a valid request object');return value}
export async function isBlocked(a:string,b:string){const ids=['rb:'+a+':'+b,'rb:'+b+':'+a];return !!await env.DB!.prepare("SELECT id FROM records WHERE kind='roomBlock' AND id IN (?,?)").bind(...ids).first()}
export async function allowedPair(a:string,b:string){const [x,y]=await Promise.all([readRoom(a),readRoom(b)]);return x?.available&&y?.available&&x.answers?.hostelite?.[0]==='Yes'&&y.answers?.hostelite?.[0]==='Yes'&&campusKey(x.campus)===campusKey(y.campus)&&!x.hidden&&!y.hidden&&!await isBlocked(a,b)}
