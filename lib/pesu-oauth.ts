// Integration authored against Vision2822/pesu-oauth2's documented PKCE flow.
// This links a campus identity; Sites continues to own the hosted session.
import {env} from 'cloudflare:workers';
export const provider='https://pesu-oauth2.vercel.app';
export function config(){const e=env as unknown as Record<string,string>;return {id:e.PESU_OAUTH_CLIENT_ID||'',secret:e.PESU_OAUTH_CLIENT_SECRET||''}}
export const b64=(a:Uint8Array)=>btoa(String.fromCharCode(...a)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
export async function digest(s:string){return b64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))))}
export function finish(req:Request,status:string){return new Response(null,{status:303,headers:{Location:new URL('/?pesu='+status,req.url).toString(),'Set-Cookie':'pesu_link_state=; Path=/api/pesu; HttpOnly; Secure; SameSite=Lax; Max-Age=0','Cache-Control':'no-store'}})}
