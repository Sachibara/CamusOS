const STORAGE_KEY = 'camusos-workspace-v1';
export const regions = [
  ['local','Device local time'],['America/New_York','New York / Eastern'],['America/Chicago','Chicago / Central'],
  ['America/Los_Angeles','Los Angeles / Pacific'],['Asia/Manila','Manila / Philippines'],
  ['Europe/London','London / UK'],['Asia/Dubai','Dubai / UAE'],['Asia/Riyadh','Riyadh / Saudi Arabia'],
  ['Asia/Singapore','Singapore'],['Asia/Tokyo','Tokyo / Japan'],['Australia/Sydney','Sydney / Australia']
];
const day = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString(); };
export const sample = () => ({
  schema:1, demo:true,
  settings:{name:'Jim Camus', role:'Software & Systems Builder',currency:'PHP',hourlyRate:650,timezone:'local',theme:'dark'},
  projects:[{id:'pr-1',name:'Portfolio refresh',color:'#f5bc39'},{id:'pr-2',name:'Client workspace',color:'#84baff'},{id:'pr-3',name:'Product research',color:'#caa6fa'}],
  entries:[{id:'te-1',project:'pr-1',description:'Prototype dashboard layout',minutes:115,created:day(0)},{id:'te-2',project:'pr-2',description:'Plan user workflows',minutes:150,created:day(1)},{id:'te-3',project:'pr-3',description:'Document integration requirements',minutes:90,created:day(2)},{id:'te-4',project:'pr-1',description:'Refine responsive navigation',minutes:80,created:day(4)},{id:'te-5',project:'pr-2',description:'Review project milestones',minutes:65,created:day(6)}],
  tasks:[{id:'tk-1',title:'Review next product milestone',done:false},{id:'tk-2',title:'Refine dashboard layout',done:true},{id:'tk-3',title:'Document app requirements',done:false}],
  notes:[{id:'kn-1',title:'Getting started',category:'Workspace',body:'CamusOS is a personal demo workspace. Add projects, track time, prepare proposals and keep useful notes. All changes are stored only in this browser.'},{id:'kn-2',title:'Writing a strong pitch',category:'Playbook',body:'Start with the client problem, explain the outcome, add a relevant proof point, then finish with a clear next step.'},{id:'kn-3',title:'Offer pricing basics',category:'Guide',body:'Calculate estimated hours times your hourly rate, add direct costs, then account for your desired profit margin. Confirm market demand before sending an offer.'}],
  timer:{startedAt:null,elapsedMs:0,project:'pr-1',description:''},
  activity:[]
});
function storageRead(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))}catch{return null}}
export function loadData(){
  const data=storageRead(); if(data&&data.schema===1&&Array.isArray(data.entries)&&Array.isArray(data.projects)&&data.settings)return data;
  const fresh=sample(); saveData(fresh); return fresh;
}
export function saveData(data){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true}catch{return false}}
export const id = () => (globalThis.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2));
export const clean = (value) => String(value??'').trim().slice(0,2000);
export const escapeHTML = (value) => String(value??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function money(value,settings){
 const currency=['PHP','USD','EUR','GBP','AUD','SGD'].includes(settings?.currency)?settings.currency:'PHP';
 try{return new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:0}).format(Number(value)||0)}catch{return '₱'+(Number(value)||0).toFixed(0)}
}
export function displayDate(value,zone='local'){
 try{return new Intl.DateTimeFormat('en-US',{timeZone:zone==='local'?undefined:zone,month:'short',day:'numeric',year:'numeric'}).format(new Date(value))}catch{return '-'}
}
export function displayTime(zone='local',date=new Date()){
 try{return new Intl.DateTimeFormat('en-US',{timeZone:zone==='local'?undefined:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(date)}catch{return '--:--:--'}
}
export function displayZone(zone='local',date=new Date()){
 try{
  const opt={hour:'numeric',timeZoneName:'shortOffset'};
  if(zone!=='local')opt.timeZone=zone;
  const parts=new Intl.DateTimeFormat('en-US',opt).formatToParts(date);
  return (zone==='local'?(Intl.DateTimeFormat().resolvedOptions().timeZone||'Local'):zone)+' · '+(parts.find(x=>x.type==='timeZoneName')?.value||'UTC');
 }catch{return zone}
}
export const hours = (minutes) => (Math.max(0,Number(minutes)||0)/60).toFixed(1)+'h';
export function projectName(data,key){return data.projects.find(x=>x.id===key)?.name||'Other'}
export function sumMinutes(entries){return entries.reduce((n,e)=>n+Math.max(0,Number(e.minutes)||0),0)}
export function elapsedTimer(data){return (Number(data.timer?.elapsedMs)||0)+(data.timer?.startedAt?Math.max(0,Date.now()-Number(data.timer.startedAt)):0)}
export function timeString(ms){const seconds=Math.floor(Math.max(0,ms)/1000),h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60;return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':')}
export function downloadFile(name,contents,type='text/plain'){
 const blob=new Blob([contents],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
export function csvEscape(value){const str=String(value??'');return '"'+str.replace(/"/g,'""')+'"'}
export function exportEntries(data){
 const lines=[['Date','Project','Description','Minutes','Hours'].map(csvEscape).join(',')];
 data.entries.forEach(e=>lines.push([e.created,projectName(data,e.project),e.description,e.minutes,(e.minutes/60).toFixed(2)].map(csvEscape).join(',')));
 downloadFile('camusos-time-entries.csv',lines.join('\r\n'),'text/csv;charset=utf-8');
}
export function validateImport(raw){
 if(!raw||raw.schema!==1||!Array.isArray(raw.projects)||!Array.isArray(raw.entries)||!Array.isArray(raw.notes)||!Array.isArray(raw.tasks)||!raw.settings||!raw.timer)throw Error('Not a CamusOS workspace backup.');
 if(raw.entries.length>10000||raw.notes.length>1000||raw.projects.length>300)throw Error('The backup exceeds import limits.');
 return {...raw,settings:{...sample().settings,...raw.settings},activity:[],timer:{startedAt:null,elapsedMs:0,project:raw.projects[0]?.id||'',description:''}};
}
