import './style.css';
import {loadData,saveData,sample,id,clean,escapeHTML as h,regions,displayTime,displayDate,displayZone,elapsedTimer,timeString,exportEntries,downloadFile,validateImport} from './data.js';
import {navigation,renderSidebar,pageContent} from './modules.js';
import {createPalette} from './palette.js';

const state={data:loadData(),page:(location.hash.slice(1)||'dashboard'),pitch:{},pitchDraft:'',offer:{},offerDraft:'',review:null,contentInput:'',knowledgeQuery:'',knowledgeAnswer:''};
if(!navigation.some(n=>n[0]===state.page))state.page='dashboard';
const app=document.getElementById('app');
const update=()=>{saveData(state.data)};
function notify(message,type='ok'){
 const existing=document.getElementById('toast'); if(existing)existing.remove();
 const el=document.createElement('div');el.id='toast';el.className='toast '+(type==='error'?'toast-error':'');el.setAttribute('role','status');el.textContent=message;
 document.body.appendChild(el);setTimeout(()=>{if(el.isConnected)el.remove()},3200);
}
function nav(page){
 if(!navigation.some(n=>n[0]===page))return;
 state.page=page;history.replaceState(null,'','#'+page);render();window.scrollTo({top:0,behavior:'instant'});
}
function appHeader(){
 const now=new Date(),zone=state.data.settings.timezone;
 return '<header class="topbar"><button type="button" class="menu-toggle" data-action="menu" aria-label="Open navigation" aria-expanded="false">☰</button>'+
 '<div class="breadcrumbs"><span>WORKSPACE</span><span class="sep">/</span><strong>'+h(navigation.find(x=>x[0]===state.page)?.[1]||'Overview')+'</strong></div>'+
 '<div class="topbar-right"><button class="search-trigger" type="button" data-action="palette" aria-label="Open page search" aria-keyshortcuts="Control+K Meta+K"><span aria-hidden="true">⌕</span><span>Search</span><kbd>Ctrl K</kbd></button><span class="top-status"><span class="online-dot"></span> DEMO WORKSPACE</span>'+
 '<button class="clock-widget" type="button" data-action="clock" aria-expanded="false" aria-controls="clockPanel" aria-label="View live world clocks"><span class="clock-icon">◷</span><span class="clock-text"><small>YOUR TIME</small><strong id="localClock">'+displayTime(zone,now)+'</strong></span><span class="clock-separator"></span><span class="clock-text"><small>NEW YORK · ET</small><strong id="eastClock">'+displayTime('America/New_York',now)+'</strong></span><span class="clock-drop">⌄</span></button>'+
 '<div class="top-avatar">'+h(state.data.settings.name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase())+'</div></div></header>';
}
function clockPanel(){
 return '<div class="clock-panel" id="clockPanel" hidden><div class="panel-head"><div><div class="eyebrow">WORLD CLOCK</div><h2>Time, everywhere.</h2></div><button class="icon-action" data-action="close-clock" aria-label="Close clock">✕</button></div><p class="muted small-p">Live local time for each region, with the correct calendar date and daylight-saving offset. Uses your device clock.</p><label>Compare a region<select id="clockRegion">'+regions.map(z=>'<option value="'+z[0]+'" '+(z[0]===state.data.settings.timezone?'selected':'')+'>'+h(z[1])+'</option>').join('')+'</select></label><div class="clock-details"><div><small>SELECTED REGION</small><strong id="regionTime"></strong><span id="regionDate"></span><em id="regionZone"></em></div><div><small>NEW YORK · EASTERN</small><strong id="easternTime"></strong><span id="easternDate"></span><em id="easternZone"></em></div></div></div>';
}
function render(){
 document.documentElement.dataset.theme=state.data.settings.theme==='light'?'light':'dark';
 app.innerHTML='<div class="app-shell">'+renderSidebar(state)+'<div class="content-shell">'+appHeader()+'<main id="mainContent" tabindex="-1"><div class="content-wrap">'+pageContent(state)+'<footer class="footer"><span>© '+new Date().getFullYear()+' CAMUSOS · AN INDEPENDENT WORKSPACE BY JIM CAMUS</span><span>BUILD WITH CLARITY. <b>SHIP WITH PURPOSE.</b></span></footer></div></main></div>'+clockPanel()+'<div class="mobile-scrim" id="mobileScrim" data-action="close-menu" hidden></div></div>';
 updateClocks();
}
function updateClocks(){
 const now=new Date();const zone=state.data.settings.timezone;
 const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
 set('localClock',displayTime(zone,now));set('eastClock',displayTime('America/New_York',now));
 const digits=document.getElementById('timerDigits');if(digits)digits.textContent=timeString(elapsedTimer(state.data));
 const select=document.getElementById('clockRegion');const z=select?select.value:zone;
 set('regionTime',displayTime(z,now));set('regionDate',displayDate(now,z));set('regionZone',displayZone(z,now));
 set('easternTime',displayTime('America/New_York',now));set('easternDate',displayDate(now,'America/New_York'));set('easternZone',displayZone('America/New_York',now));
}
function task(name){const n=clean(name);if(!n)return;state.data.tasks.unshift({id:id(),title:n,done:false});update();render();notify('Task added')}
function entryFromForm(fd){
 const hours=Number(fd.get('hours')),minutes=Number(fd.get('minutes'));
 if(!Number.isFinite(hours)||!Number.isFinite(minutes)||hours<0||minutes<0||minutes>59||hours*60+minutes<=0||hours>200){notify('Please enter a valid duration.','error');return}
 state.data.entries.unshift({id:id(),project:fd.get('project'),description:clean(fd.get('description')),minutes:Math.round(hours*60+minutes),created:new Date().toISOString()});
 state.data.demo=false;update();render();notify('Work entry saved');
}
function handleTimer(action){
 const t=state.data.timer;const select=document.getElementById('timerProject'),desc=document.getElementById('timerDescription');
 if(select)t.project=select.value;if(desc)t.description=clean(desc.value);
 if(action==='start-timer'){if(!t.startedAt)t.startedAt=Date.now();notify('Timer started')}
 if(action==='pause-timer'){if(t.startedAt){t.elapsedMs=Math.max(0,elapsedTimer(state.data));t.startedAt=null}notify('Timer paused')}
 if(action==='save-timer'){
  const minutes=Math.max(1,Math.round(elapsedTimer(state.data)/60000));
  if(elapsedTimer(state.data)<1000){notify('Run the timer first.','error');return}
  state.data.entries.unshift({id:id(),project:t.project,description:t.description||'Focused work session',minutes,created:new Date().toISOString()});
  state.data.demo=false;t.startedAt=null;t.elapsedMs=0;t.description='';notify('Session saved')
 }
 if(action==='reset-timer'){if(!confirm('Reset the current timer without saving?'))return;t.startedAt=null;t.elapsedMs=0;t.description='';notify('Timer reset')}
 update();render();
}
function draftPitch(fd){
 const data=Object.fromEntries(fd.entries());Object.keys(data).forEach(k=>data[k]=clean(data[k]));state.pitch=data;
 const recipient=data.recipient||'there',challenge=data.challenge,solution=data.solution,proof=data.proof;
 if(data.tone==='concise'){
  state.pitchDraft='Subject: A practical idea for '+recipient+'\n\nHi '+recipient+',\n\nI noticed a challenge worth solving: '+challenge+'. I help teams '+solution+'.'+(proof?' My relevant experience: '+proof+'.':'')+'\n\nWould you be open to a short conversation to see whether this could help?\n\nBest,\n'+state.data.settings.name;
 }else if(data.tone==='warm'){
  state.pitchDraft='Subject: A thought on '+challenge.slice(0,55)+'\n\nHi '+recipient+',\n\nHope your week is going well. I wanted to reach out because '+challenge+'. I enjoy working with teams to '+solution+'.'+(proof?' A bit of context: '+proof+'.':'')+'\n\nIf this is relevant, I would love to compare notes and see whether there is a good fit.\n\nWarm regards,\n'+state.data.settings.name;
 }else{
  state.pitchDraft='Subject: Exploring a solution for '+recipient+'\n\nHello '+recipient+',\n\nI am reaching out regarding this challenge: '+challenge+'. My approach is to '+solution+'.'+(proof?' Relevant experience includes '+proof+'.':'')+'\n\nWould a brief introductory discussion be useful? I can share a practical starting point and suggested next steps.\n\nRegards,\n'+state.data.settings.name;
 }
 render();notify('Draft generated');
}
function buildOffer(fd){
 const a=Object.fromEntries(fd.entries());const hr=Number(a.hours),rate=Number(a.rate),costs=Number(a.costs),margin=Number(a.margin);
 if(![hr,rate,costs,margin].every(Number.isFinite)||hr<=0||rate<=0||costs<0||margin<0||margin>90){notify('Check your pricing inputs.','error');return}
 state.offer=a;const base=hr*rate+costs,price=base/(1-margin/100);const cash=(n)=>new Intl.NumberFormat('en-US',{style:'currency',currency:state.data.settings.currency,maximumFractionDigits:0}).format(n);
 state.offerDraft='PACKAGE: '+clean(a.name)+'\nIDEAL CLIENT: '+clean(a.client||'To be determined')+'\n\nDELIVERABLES\n'+clean(a.deliverables)+'\n\nESTIMATED HOURS: '+hr+'\nHOURLY RATE: '+cash(rate)+'\nDIRECT COSTS: '+cash(costs)+'\nTOTAL COST BASIS: '+cash(base)+'\nTARGET MARGIN: '+margin+'%\nSUGGESTED PRICE: '+cash(price)+'\nESTIMATED GROSS PROFIT: '+cash(price-base)+'\n\nScope, exclusions, milestones and payment terms should be agreed before sending. These values are an estimate, not a verified quote.';
 render();notify('Pricing estimate generated');
}
function critique(text){
 const wordCount=text.trim().split(/\s+/).filter(Boolean).length;
 const lines=text.split(/\n+/).filter(Boolean).length;
 const checks=[
  {title:'Opening hook',pass:/\?|imagine|what if|have you|today|problem|challenge/i.test(text.slice(0,280)),feedback:'Open with a vivid question, problem or promise to earn attention.'},
  {title:'Audience and stakes',pass:/you|your|audience|customer|client|team|people/i.test(text),feedback:'Address your audience and explain why the issue matters to them.'},
  {title:'Clear takeaway',pass:/learn|discover|result|outcome|benefit|solution|help|achieve/i.test(text),feedback:'State the measurable benefit or useful takeaway.'},
  {title:'Credibility and support',pass:/example|case study|evidence|research|data|experience|because|results/i.test(text),feedback:'Use a relevant example, case study, data point or personal experience.'},
  {title:'Actionable close',pass:/next step|contact|reply|join|register|try|start|schedule|today|let.s/i.test(text.slice(-380)),feedback:'Close with one clear next step and a reason to act.'},
  {title:'Enough substance',pass:wordCount>=120,feedback:'Include enough context to support the core claim; this draft may be too short.'},
  {title:'Readable structure',pass:lines>=3,feedback:'Use headings or paragraphs to break longer scripts into clear sections.'}
 ];
 return {checks,score:Math.round(checks.filter(x=>x.pass).length/checks.length*100)};
}
function askKnowledge(question){
 const words=clean(question).toLowerCase().split(/\W+/).filter(w=>w.length>3);
 const ranked=state.data.notes.map(n=>({note:n,score:words.reduce((sum,w)=>sum+(n.title.toLowerCase().includes(w)?4:0)+(n.body.toLowerCase().includes(w)?1:0),0)})).sort((a,b)=>b.score-a.score).filter(x=>x.score>0);
 state.knowledgeAnswer=ranked.length?'Based on your saved note “'+ranked[0].note.title+'”:\n\n'+ranked[0].note.body:'Not found in your saved knowledge. Try different keywords or add a relevant note.';
 render();
}
app.addEventListener('click',async(e)=>{
 const navEl=e.target.closest('[data-nav]');if(navEl){nav(navEl.dataset.nav);return}
 const taskDel=e.target.closest('[data-delete-task]');if(taskDel){state.data.tasks=state.data.tasks.filter(t=>t.id!==taskDel.dataset.deleteTask);update();render();return}
 const entryDel=e.target.closest('[data-delete-entry]');if(entryDel){state.data.entries=state.data.entries.filter(t=>t.id!==entryDel.dataset.deleteEntry);update();render();notify('Entry removed');return}
 const noteDel=e.target.closest('[data-delete-note]');if(noteDel){if(!confirm('Delete this note?'))return;state.data.notes=state.data.notes.filter(n=>n.id!==noteDel.dataset.deleteNote);update();render();notify('Note removed');return}
 const copy=e.target.closest('[data-copy]');if(copy){
  const text=copy.dataset.copy==='pitch-output'?state.pitchDraft:state.offerDraft;
  if(!text)return;
  try{await navigator.clipboard.writeText(text);notify('Copied to clipboard')}catch{notify('Clipboard access was blocked. Select the text and copy manually.','error')}
  return;
 }
 const action=e.target.closest('[data-action]');if(!action)return;
 const name=action.dataset.action;
 if(['start-timer','pause-timer','save-timer','reset-timer'].includes(name)){handleTimer(name);return}
 if(name==='palette'){palette.open();return}
 if(name==='csv-entries'){exportEntries(state.data);notify('CSV download prepared')}
 if(name==='menu'){const sidebar=document.getElementById('sidebar');const scrim=document.getElementById('mobileScrim');sidebar.classList.toggle('open');scrim.hidden=!sidebar.classList.contains('open');action.setAttribute('aria-expanded',String(sidebar.classList.contains('open')))}
 if(name==='close-menu'){document.getElementById('sidebar').classList.remove('open');document.getElementById('mobileScrim').hidden=true}
 if(name==='clock'){const panel=document.getElementById('clockPanel');const open=panel.hidden;panel.hidden=!open;action.setAttribute('aria-expanded',String(open));if(open){document.getElementById('clockRegion').focus();updateClocks()}}
 if(name==='close-clock'){document.getElementById('clockPanel').hidden=true;const toggle=document.querySelector('[data-action="clock"]');toggle.setAttribute('aria-expanded','false');toggle.focus()}
 if(name==='export-backup'){downloadFile('camusos-workspace.json',JSON.stringify(state.data,null,2),'application/json');notify('Backup downloaded')}
 if(name==='reset-workspace'){if(!confirm('Replace all local workspace data with fresh example data? This cannot be undone. Export a backup first.'))return;state.data=sample();state.pitchDraft='';state.offerDraft='';state.review=null;update();render();notify('Workspace reset to example data')}
});
app.addEventListener('change',(e)=>{
 if(e.target.matches('[data-task]')){const item=state.data.tasks.find(t=>t.id===e.target.dataset.task);if(item)item.done=e.target.checked;update();render()}
 if(e.target.id==='clockRegion')updateClocks();
 if(e.target.id==='timerProject'){state.data.timer.project=e.target.value;update()}
 if(e.target.id==='importBackup'){
  const file=e.target.files[0];if(!file)return;if(file.size>3e6){notify('Backup is too large.','error');return}
  file.text().then(text=>{const parsed=validateImport(JSON.parse(text));if(!confirm('Replace the current workspace with this backup?'))return;state.data=parsed;update();render();notify('Workspace imported successfully')}).catch(err=>notify(err.message||'Could not read backup.','error'));
 }
});
app.addEventListener('input',(e)=>{
 if(e.target.id==='knowledgeSearch'){
  state.knowledgeQuery=e.target.value;
  const anchor=e.target.selectionStart;
  const box=document.querySelector('.note-grid');
  if(box){const q=state.knowledgeQuery.toLowerCase();const notes=state.data.notes.filter(n=>[n.title,n.body,n.category].join(' ').toLowerCase().includes(q));box.innerHTML=notes.length?notes.map(n=>'<article class="note-card"><small>'+h(n.category||'Personal')+'</small><h3>'+h(n.title)+'</h3><p>'+h(n.body)+'</p><button class="icon-action" data-delete-note="'+h(n.id)+'">Remove ↗</button></article>').join(''):'<div class="empty-state">No matching notes.</div>'}
 }
 if(e.target.id==='timerDescription'){state.data.timer.description=clean(e.target.value);update()}
});
app.addEventListener('submit',(e)=>{
 const form=e.target.closest('[data-form]');if(!form)return;e.preventDefault();
 const fd=new FormData(form),kind=form.dataset.form;
 if(kind==='task')task(fd.get('title'));
 if(kind==='entry')entryFromForm(fd);
 if(kind==='project'){const name=clean(fd.get('name'));if(!name)return;if(state.data.projects.length>=300){notify('Project limit reached.','error');return}state.data.projects.push({id:id(),name,color:'#f5bc39'});state.data.timer.project=state.data.projects[0]?.id;update();render();notify('Project added')}
 if(kind==='pitch')draftPitch(fd);
 if(kind==='offer')buildOffer(fd);
 if(kind==='review'){state.contentInput=clean(fd.get('text'));state.review=critique(state.contentInput);render();notify('Review complete')}
 if(kind==='note'){state.data.notes.unshift({id:id(),title:clean(fd.get('title')),category:clean(fd.get('category'))||'Personal',body:clean(fd.get('body'))});update();render();notify('Note saved')}
 if(kind==='ask')askKnowledge(fd.get('question'));
 if(kind==='settings'){
  const name=clean(fd.get('name')),role=clean(fd.get('role')),rate=Number(fd.get('hourlyRate'));
  const timezone=fd.get('timezone'),currency=fd.get('currency'),theme=fd.get('theme');
  if(!name||!role||!Number.isFinite(rate)||rate<0||rate>1e7||!regions.some(r=>r[0]===timezone)||!['PHP','USD','EUR','GBP','AUD','SGD'].includes(currency)){notify('Please check the settings values.','error');return}
  state.data.settings={name,role,hourlyRate:rate,timezone,currency,theme:theme==='light'?'light':'dark'};
  update();render();notify('Preferences saved');
 }
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){
  const panel=document.getElementById('clockPanel');if(panel&&!panel.hidden){panel.hidden=true;document.querySelector('[data-action="clock"]').setAttribute('aria-expanded','false')}
  const sidebar=document.getElementById('sidebar');if(sidebar?.classList.contains('open')){sidebar.classList.remove('open');document.getElementById('mobileScrim').hidden=true}
 }
});
document.addEventListener('pointerdown',e=>{
 const panel=document.getElementById('clockPanel');if(panel&&!panel.hidden&&!panel.contains(e.target)&&!e.target.closest('[data-action="clock"]')){panel.hidden=true;const toggle=document.querySelector('[data-action="clock"]');if(toggle)toggle.setAttribute('aria-expanded','false')}
});
window.addEventListener('hashchange',()=>{const page=location.hash.slice(1);if(navigation.some(n=>n[0]===page)){state.page=page;render()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateClocks()});
const palette=createPalette(navigation,nav);
render();setInterval(updateClocks,1000);
