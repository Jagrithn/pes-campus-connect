import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Miniflare} from 'miniflare';
import ts from 'typescript';

// Run the production adapter inside workerd, not Node's more permissive fetch.
// The stub constructs a real Worker Request, but never contacts a student account.
const source=ts.transpileModule(readFileSync('lib/pesu-direct.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/\bexport /g,'');
const script=`
let scenario='success';
let requests=[];
const fetch=async(url,init)=>{
 const request=new Request(url,init);
 requests.push({url,redirect:request.redirect});
 if(request.redirect!=='manual')throw Error('Credentials must never automatically follow redirects');
 if(scenario==='redirect')return new Response(null,{status:302,headers:{Location:'https://different-host.invalid/'}});
 if(url.endsWith('/auth')){
  if(scenario==='rejected')return new Response('{}',{status:401});
  return Response.json({mobileJsonObject:{login:'SUCCESS'},accessToken:'request-only-fixture-token'});
 }
 return Response.json({MESSAGE:'SUCCESS_Record found Successfully',STUDENT_INFO:{LoginId:'PES1202600999',SRN:'PES1UG26CS999',NameAsInSSLC:'Fixture Student',ClassName:'Sem-3',Branch:'Computer Science',SectionName:'A'},STUDENT_PHOTO:{instituteName:'PES University (Ring Road)'}});
};
${source}
export default {async fetch(request){
 scenario=new URL(request.url).searchParams.get('scenario')||'success';requests=[];
 if(scenario==='constructor'){try{new Request('https://example.com',{redirect:'error'});return Response.json({throws:false})}catch(e){return Response.json({throws:true,name:e.name,message:e.message})}}
 try{const identity=await authenticatePesu('PES1UG26CS999','fixture-only-password');return Response.json({identity,requests})}
 catch(e){return Response.json({error:e.message,requests},{status:e.status||500})}
}};`;
const mf=new Miniflare({modules:true,script,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],cf:false});
try{
 const constructor=await (await mf.dispatchFetch('http://test/?scenario=constructor')).json();
 assert.equal(constructor.throws,true);assert.equal(constructor.name,'TypeError');
 console.log('Confirmed Worker runtime rejects redirect:error before sending a request.');
 const success=await mf.dispatchFetch('http://test/?scenario=success'),data=await success.json();
 assert.equal(success.status,200,JSON.stringify(data));
 assert.equal(data.identity.name,'Fixture Student');assert.equal(data.requests.length,2);
 assert.ok(data.requests.every(r=>r.redirect==='manual'));
 const rejected=await mf.dispatchFetch('http://test/?scenario=rejected');assert.equal(rejected.status,401);
 const redirect=await mf.dispatchFetch('http://test/?scenario=redirect'),r=await redirect.json();assert.equal(redirect.status,502);assert.equal(r.requests.length,1,'Do not forward credentials to a redirect target');
 console.log('PASS: real Worker request construction, login/profile success fixtures, wrong-credential handling, and redirect rejection without forwarding credentials.');
}finally{await mf.dispose()}
