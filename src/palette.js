// Command palette (Ctrl/⌘ + K): keyboard-first navigation between workspace pages.
// Lives outside #app so full re-renders never destroy it while it is open.
import {escapeHTML as h} from './data.js';

export const matchPages=(pages,query)=>{
 const q=String(query||'').trim().toLowerCase();
 if(!q)return pages.slice();
 return pages.filter(p=>p[1].toLowerCase().includes(q)||p[0].toLowerCase().includes(q));
};

export function createPalette(pages,onSelect){
 const root=document.createElement('div');
 root.className='palette';root.hidden=true;
 root.innerHTML='<div class="palette-card" role="dialog" aria-modal="true" aria-label="Go to page">'+
  '<label class="palette-search"><span aria-hidden="true">⌕</span><input type="text" id="paletteInput" autocomplete="off" spellcheck="false" placeholder="Where would you like to go?" aria-controls="paletteList"></label>'+
  '<div class="palette-list" id="paletteList" role="listbox"></div>'+
  '<div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div></div>';
 document.body.appendChild(root);
 const input=root.querySelector('input'),list=root.querySelector('.palette-list');
 let results=[],active=0,returnFocus=null;
 const draw=()=>{
  results=matchPages(pages,input.value);active=Math.min(active,Math.max(0,results.length-1));
  list.innerHTML=results.length?results.map((p,i)=>'<button type="button" role="option" class="palette-item'+(i===active?' active':'')+'" aria-selected="'+(i===active)+'" data-page="'+h(p[0])+'"><span class="palette-icon" aria-hidden="true">'+h(p[2])+'</span><span>'+h(p[1])+'</span><small>'+String(pages.indexOf(p)+1).padStart(2,'0')+'</small></button>').join(''):'<p class="palette-empty">No page matches “'+h(input.value)+'”.</p>';
 };
 const close=()=>{if(root.hidden)return;root.hidden=true;if(returnFocus&&returnFocus.isConnected)returnFocus.focus();returnFocus=null};
 const open=()=>{returnFocus=document.activeElement;input.value='';active=0;draw();root.hidden=false;input.focus()};
 const choose=(page)=>{root.hidden=true;returnFocus=null;onSelect(page)};
 input.addEventListener('input',()=>{active=0;draw()});
 root.addEventListener('pointerdown',e=>{if(e.target===root)close()});
 list.addEventListener('click',e=>{const item=e.target.closest('[data-page]');if(item)choose(item.dataset.page)});
 root.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!results.length)return;active=(active+(e.key==='ArrowDown'?1:-1)+results.length)%results.length;draw()}
  else if(e.key==='Enter'){e.preventDefault();if(results[active])choose(results[active][0])}
  else if(e.key==='Tab'){e.preventDefault();input.focus()}
 });
 document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()==='k'){e.preventDefault();root.hidden?open():close()}
 });
 return {open,close,isOpen:()=>!root.hidden};
}
