import {getChatGPTUser} from '../../chatgpt-auth';
import {reply,roomRows,putRoom,sameOrigin,body} from '../../../lib/roommate-server';
import {config} from '../../../lib/pesu-oauth';
export const dynamic='force-dynamic';
async function owner(){const u=await getChatGPTUser();return u?.email.toLowerCase()==='njagrith@gmail.com'?u:null}
export async function GET(){if(!await owner())return reply({error:'Owner account required'},403);const profiles=await roomRows('roomProfile');return reply({configured:true,profiles:profiles.map(p=>({id:p.id,name:p.name,campus:p.campus,available:p.available,hidden:!!p.hidden})),reports:await roomRows('roomReport'),connections:(await roomRows('roomConnection')).length})}
export async function POST(req:Request){if(!await owner())return reply({error:'Owner account required'},403);if(!sameOrigin(req))return reply({error:'Invalid origin'},403);const v=await body(req),profiles=await roomRows('roomProfile'),p=profiles.find(x=>x.id===v.id);if(!p)return reply({error:'Profile not found'},404);const {recordId,owner:profileOwner,...data}=p;await putRoom(recordId,'roomProfile',profileOwner,{...data,hidden:v.hidden===true});return reply({ok:true})}
