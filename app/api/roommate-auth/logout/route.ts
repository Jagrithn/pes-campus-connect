import {env} from 'cloudflare:workers';
import {digest} from '../../../../lib/pesu-oauth';
import {cookie,sameOrigin} from '../../../../lib/roommate-server';
export async function POST(req:Request){if(!sameOrigin(req))return new Response('Forbidden',{status:403});await env.DB!.prepare("DELETE FROM records WHERE id=? AND kind='roomSession'").bind('rs:'+await digest(cookie(req,'room_session'))).run();return new Response(null,{status:303,headers:{Location:'/', 'Set-Cookie':'room_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'}})}
