type RecordRow=Record<string,any>;
// Archiving is reversible. An archived event also hides its team listings.
export function visibleCampusRecords(rows:RecordRow[]){const hiddenEvents=new Set(rows.filter(r=>r.kind==='event'&&r.archived===true).map(r=>r.id));return rows.filter(r=>r.archived!==true&&!(r.kind==='team'&&hiddenEvents.has(r.event)))}
