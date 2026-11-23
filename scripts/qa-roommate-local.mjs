// Local-only browser QA harness. Never imported by the deployed app.
// Start the app on 8788 first. No Academy requests or real student data are used.
import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {createHash,randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
const database=process.argv[2];if(!database?.startsWith('.wrangler/'))throw Error('Use the local .wrangler database only');
const db=new DatabaseSync(database);db.exec('PRAGMA busy_timeout=3000');
const source=ts.transpileModule(readFileSync('scripts/fixtures/roommate-demo.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const module={exports:{}};vm.runInNewContext('(function(require,module,exports){'+source+'})',{Object,Array})((name)=>({TOPICS:['Free time','Conversations','Interests','Roommate bond','Languages','Routine','Room atmosphere','Academic circle','Room preferences']}),module,module.exports);
const people=module.exports.previewPeople(module.exports.emptyProfile());const sessions={};
function put(id,kind,owner,data){db.prepare('INSERT INTO records VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(id,kind,owner,JSON.stringify(data),Date.now())}
const owner='local-roommate-audit-';
for(let i=0;i<3;i++){const id=owner+i,p={...people[i],id,name:['QA New Resident','QA Second Resident','QA Third Resident'][i],campus:'PES University (Ring Road)',semester:'Sem-3',year:'2',section:'A'};const token=randomBytes(32).toString('base64url');sessions[i]=token;put('rs:'+createHash('sha256').update(token).digest('base64url'),'roomSession',id,{identity:{id,name:p.name,campus:p.campus,semester:p.semester,year:p.year,branch:'CSE',section:p.section},expires:Date.now()+3600000});put(id,'profile',id,{name:p.name,campus:'RR',branch:'CSE',year:'2',semester:'Sem-3',section:'A'});if(i>0){put('rp:'+id,'roomProfile',id,p);put('room-search:'+id,'roomSearchPreference',id,{looking:true})}}
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://127.0.0.1:8789');if(url.pathname==='/__qa_login'){const token=sessions[url.searchParams.get('person')||'0'];if(!token){res.writeHead(404).end();return}res.writeHead(303,{'Set-Cookie':'room_session='+token+'; Path=/; HttpOnly; SameSite=Lax',Location:'/'}).end();return}const headers={...req.headers,host:'localhost:8788'};if(headers.origin==='http://127.0.0.1:8789'||headers.origin==='http://localhost:8789')headers.origin='http://localhost:8788';const upstream=http.request({hostname:'127.0.0.1',port:8788,path:req.url,method:req.method,headers},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)});upstream.on('error',()=>res.writeHead(502).end('Local app unavailable'));req.pipe(upstream)});server.listen(8789,'127.0.0.1',()=>console.log('Local QA: http://127.0.0.1:8789/__qa_login?person=0'));
function cleanup(){server.close();db.prepare("DELETE FROM records WHERE owner LIKE 'local-roommate-audit-%'").run();db.close();process.exit()};process.on('SIGINT',cleanup);process.on('SIGTERM',cleanup);
