type Row=Record<string,any>;
// Only the applicant and the leader/host are participants. Group membership grants no access.
export function conversations(all:Row[],members:Row[],uid:string):Row[]{
 const get=(id:string)=>all.find(r=>r.id===id);const blocked=(a:string,b:string)=>all.some(r=>r.kind==='block'&&((r.owner===a&&r.target===b)||(r.owner===b&&r.target===a)));const list:Row[]=[];
 for(const m of members){const t=get(m.team);if(!t||m.user===t.owner||![m.user,t.owner].includes(uid)||blocked(m.user,t.owner))continue;list.push({id:'team:'+m.id,kind:t.teamType==='capstone'?'capstone':'team',title:t.name,from:m.user,to:t.owner,status:m.status,note:m.note,requestId:m.id,team:t.id})}
 for(const c of all.filter(r=>r.kind==='connection')){if(![c.from,c.to].includes(uid)||blocked(c.from,c.to))continue;const a=get(c.from),b=get(c.to);if(!a?.hostelite||!a.roommateOptIn||!b?.hostelite||!b.roommateOptIn)continue;list.push({id:'hostel:'+c.id,kind:'hostel',title:'Roommate conversation',from:c.from,to:c.to,status:c.status,note:c.note,requestId:c.id})}
 for(const r of all.filter(r=>r.kind==='activityRequest')){const a=get(r.activity);if(!a||![r.owner,a.owner].includes(uid)||blocked(r.owner,a.owner))continue;list.push({id:'activity:'+r.id,kind:'activity',title:a.title,from:r.owner,to:a.owner,status:r.status,note:r.note,requestId:r.id,activity:a.id})}
 return list.map(c=>({...c,fromName:get(c.from)?.name||'Student',toName:get(c.to)?.name||'Leader',otherName:get(c.from===uid?c.to:c.from)?.name||'Student'}));
}
export function canDiscuss(c:Row){return ['pending','invited','accepted'].includes(c.status)}
