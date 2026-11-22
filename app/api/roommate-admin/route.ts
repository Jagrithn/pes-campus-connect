import {getChatGPTUser} from '../../chatgpt-auth';
import {reply,roomRows,putRoom,sameOrigin,body} from '../../../lib/roommate-server';
import {config} from '../../../lib/pesu-oauth';
import {PESU_LOGIN} from '../../../lib/pesu-direct';
export const dynamic='force-dynamic';
async function owner(){const u=await getChatGPTUser();return u?.email.toLowerCase()==='njagrith@gmail.com'?u:null}
export async function GET(req?:Request){if(!await owner())return reply({error:'Owner account required'},403);
 // Owner-only connectivity check. Empty credentials cannot access a student account.
 if(req&&new URL(req.url).searchParams.get('check')==='pesu'){try{const form=new FormData();for(const [key,value]of Object.entries({userName:'',password:'',j_appId:'YES',instId:'1,6,7,14'}))form.set(key,value);const response=await fetch(PESU_LOGIN,{method:'POST',headers:{'X-Client-Type':'MOBILE'},body:form,redirect:'manual',signal:AbortSignal.timeout(12000)});return reply({service:'PESU Academy',reachable:true,status:response.status,expectedCredentialRejection:response.status===401})}catch{return reply({service:'PESU Academy',reachable:false,error:'Transport check failed'},503)}}
 const profiles=await roomRows('roomProfile');return reply({configured:true,profiles:profiles.map(p=>({id:p.id,name:p.name,campus:p.campus,available:p.available,hidden:!!p.hidden})),reports:await roomRows('roomReport'),connections:(await roomRows('roomConnection')).length})}
export async function POST(req:Request){if(!await owner())return reply({error:'Owner account required'},403);if(!sameOrigin(req))return reply({error:'Invalid origin'},403);const v=await body(req),profiles=await roomRows('roomProfile'),p=profiles.find(x=>x.id===v.id);if(!p)return reply({error:'Profile not found'},404);const {recordId,owner:profileOwner,...data}=p;await putRoom(recordId,'roomProfile',profileOwner,{...data,hidden:v.hidden===true});return reply({ok:true})}
