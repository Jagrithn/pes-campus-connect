import {QUESTIONS,TOPICS,normaliseRoomProfile,type RoomProfile} from './roommate-match';
const wildcard:Record<string,string>={wantedLanguages:'Any shared language',wantedRoutine:'Any routine if quiet',circle:'Anyone'};
export function answerChoice(answers:Record<string,string[]>,key:string,value:string,multi=false){
 const current=answers[key]||[];let next:string[];
 if(!multi)next=[value];else if(current.includes(value))next=current.filter(x=>x!==value);else if(wildcard[key]===value)next=[value];else{next=current.filter(x=>x!==wildcard[key]&&x!=='Other');if(next.length>=5)return {answers,error:'Choose up to five. Remove one before adding another.'};next=[...next,value]}
 return {answers:{...answers,[key]:next},error:''};
}
export function questionIssue(p:RoomProfile,step:number){
 const q=QUESTIONS[step];if(!q)return 'Choose a valid question.';
 for(const f of q.fields){if(f.key==='cycle')continue;const a=p.answers[f.key]||[];if(!a.length)return 'Please answer: '+f.label;if(f.key==='hostelite'&&a[0]!=='Yes')return 'This version is for PES hostel residents.';if(['hostel','blocks','languages','wantedLanguages'].includes(f.key)&&a.every(x=>x.toLowerCase()==='other'))return 'Please add a specific answer for: '+f.label}
 return '';
}
export function readRoommateDraft(value:unknown,user:Partial<RoomProfile>&{id:string}){
 try{const raw=typeof value==='string'?JSON.parse(value):value;if(!raw||typeof raw!=='object')return null;const candidate=raw.profile||raw;if(candidate.id!==user.id)return null;const profile=normaliseRoomProfile({...candidate,available:false,must:[]},user);profile.must=TOPICS.filter(t=>Array.isArray(candidate.must)&&candidate.must.includes(t));for(const field of ['github','linkedin'] as const)profile[field]=typeof candidate[field]==='string'?candidate[field].slice(0,2048):'';return {profile,step:Number.isInteger(raw.step)?Math.max(0,Math.min(QUESTIONS.length-1,raw.step)):0}}catch{return null}
}
export function initialRoommateState(data:any,draft:ReturnType<typeof readRoommateDraft>){
 const saved=data.profile;const profile=saved?{...saved,weights:{...Object.fromEntries(TOPICS.map(t=>[t,1])),...saved.weights},must:Array.isArray(saved.must)?saved.must:[],answers:saved.answers||{}}:draft?.profile||null;
 return {profile,step:draft?.step||0,view:data.lookingForRoommate===false?'notlooking':saved?'dashboard':data.lookingForRoommate===true?'questions':'intro'};
}
export function mergeRoomMessages(current:any[],incoming:any[],connection:string){const byId=new Map<string,any>();for(const m of [...current,...incoming])if(m.connection===connection)byId.set(m.recordId,m);return [...byId.values()].sort((a,b)=>a.created-b.created||a.recordId.localeCompare(b.recordId))}
