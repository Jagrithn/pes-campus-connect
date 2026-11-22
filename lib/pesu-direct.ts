// Protocol adapted from pesu-dev/auth (MIT). See docs/PESU-AUTH-LICENSE.txt.
// Credentials and Academy tokens stay in request memory; never log upstream bodies.
export const PESU_LOGIN='https://www.pesuacademy.com/MAcademy/mobile/mobilelogin/auth';
export const PESU_PROFILE='https://www.pesuacademy.com/MAcademy/mobile/dispatcher';
export class PesuError extends Error{constructor(message:string,public status=502){super(message)}}
const text=(v:unknown)=>typeof v==='string'?v.trim():typeof v==='number'?String(v):'';
async function object(r:Response){try{const p=await r.json();if(!p||typeof p!=='object'||Array.isArray(p))throw 0;return p as Record<string,any>}catch{throw new PesuError('PESU Academy returned an unreadable response. Please try again later.')}}
const form=(v:Record<string,string>)=>{const f=new FormData();for(const [k,x]of Object.entries(v))f.set(k,x);return f};
export async function authenticatePesu(srn:string,password:string){
 let r:Response;
 try{r=await fetch(PESU_LOGIN,{method:'POST',headers:{'X-Client-Type':'MOBILE'},body:form({userName:srn,password,j_appId:'YES',instId:'1,6,7,14'}),redirect:'error',signal:AbortSignal.timeout(12000)})}catch{throw new PesuError('Could not reach PESU Academy. Please try again shortly.',503)}
 if(r.status===401)throw new PesuError('PESU Academy did not accept that SRN and password.',401);
 if(!r.ok)throw new PesuError('PESU Academy is temporarily unavailable. Please try again later.');
 const login=await object(r);
 if(login.mobileJsonObject?.login!=='SUCCESS'||typeof login.accessToken!=='string'||!login.accessToken)throw new PesuError('PESU Academy did not return the expected sign-in response. Please try again later.');
 // Preserve per-login cookies only for the same Academy host and this profile request.
 const cookieHeaders=typeof r.headers.getSetCookie==='function'?r.headers.getSetCookie():[r.headers.get('set-cookie')||''];
 const cookies=cookieHeaders.flatMap(v=>v.split(/,(?=\s*[^;,=]+=[^;,]*)/)).map(x=>x.split(';')[0].trim()).filter(Boolean).join('; ');
 let pr:Response;try{pr=await fetch(PESU_PROFILE,{method:'POST',headers:{'X-Client-Type':'MOBILE',Authorization:'Bearer '+login.accessToken,...(cookies?{Cookie:cookies}:{})},body:form({action:'27',mode:'1',menuId:'11172'}),redirect:'error',signal:AbortSignal.timeout(12000)})}catch{throw new PesuError('Signed in to PESU, but could not load your student profile. Please retry.',503)}
 if(!pr.ok)throw new PesuError('PESU Academy could not return your student profile. Please retry.');
 const profile=await object(pr),info=profile.STUDENT_INFO;
 if(!text(profile.MESSAGE).startsWith('SUCCESS')||!info||Array.isArray(info)||typeof info!=='object')throw new PesuError('PESU Academy’s student profile format has changed. Please try again later.');
 const returnedSRN=text(info.SRN).toUpperCase(),prn=text(info.LoginId).toUpperCase();
 if(!returnedSRN&&!prn)throw new PesuError('PESU Academy did not return a student identity.');
 if(srn!==returnedSRN&&srn!==prn)throw new PesuError('PESU Academy returned a different student identity. Sign-in was stopped.');
 const semester=text(info.ClassName),sem=Number(semester.match(/\d+/)?.[0]||0),campus=text(profile.STUDENT_PHOTO?.instituteName);
 return {identifier:prn||returnedSRN,name:text(info.NameAsInSSLC)||[text(info.FirstName),text(info.LastName)].filter(Boolean).join(' ')||'PES student',campus,branch:text(info.Branch),semester,year:sem?String(Math.ceil(sem/2)):'',section:text(info.SectionName)};
}
