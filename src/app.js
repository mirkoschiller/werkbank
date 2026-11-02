import { STORAGE_KEY, COLORS, freshBoard, validateBoard, moveCard, makeId } from './model.js';
const $ = (id) => document.getElementById(id);
let boards = loadBoards();
let activeId = localStorage.getItem('werkbank.active.v1') || boards[0].id;
if (!boards.some(b => b.id === activeId)) activeId = boards[0].id;
let history = [], future = [], pendingEdit = null, chosenColor = 'yellow', toastTimer;
const active = () => boards.find(b => b.id === activeId);
const clone = o => structuredClone(o);
function loadBoards() { try { const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (Array.isArray(raw) && raw.length) return raw.slice(0,100).map(validateBoard); } catch (e) { console.warn('Werkbank: Browserdaten konnten nicht geladen werden', e); } return [freshBoard()]; }
function announce(message) { const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500); }
function save() { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(boards)); localStorage.setItem('werkbank.active.v1',activeId); $('saveStatus').textContent='✓ Lokal gespeichert'; } catch { $('saveStatus').textContent='⚠ Speichern fehlgeschlagen'; announce('Speicher ist voll oder gesperrt: Bitte JSON-Backup exportieren.'); } }
function mutate(fn) { history.push(clone(boards)); if(history.length>60)history.shift();future=[];fn();active().updatedAt=new Date().toISOString();save();render(); }
function undo() {if(!history.length)return;future.push(clone(boards));boards=history.pop();if(!active())activeId=boards[0].id;save();render()}
function redo() {if(!future.length)return;history.push(clone(boards));boards=future.pop();if(!active())activeId=boards[0].id;save();render()}
function el(tag,cls,text) {const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function button(text,cls,fn,title) {const n=el('button',cls,text);n.type='button';if(title)n.title=title;n.addEventListener('click',fn);return n;}
function render() {
 const b=active(); const select=$('boardSelect');select.replaceChildren();boards.forEach(board=>{const opt=el('option',null,board.title||'Unbenanntes Board');opt.value=board.id;select.append(opt)});select.value=activeId;
 $('boardTitle').value=b.title;
 const holder=$('columns');holder.replaceChildren();b.columns.forEach((column,colIndex)=>{
   const col=el('article','column');col.dataset.column=column.id;
   const head=el('div','column-head');const title=el('input');title.value=column.title;title.maxLength=80;title.setAttribute('aria-label','Spaltentitel');title.addEventListener('change',()=>mutate(()=>column.title=title.value.trim()||'Ohne Titel'));title.addEventListener('keydown',e=>{if(e.key==='Enter')title.blur()});
   const count=el('span','count',String(column.cards.length));
   const left=button('←','small-btn',()=>mutate(()=>{[b.columns[colIndex-1],b.columns[colIndex]]=[b.columns[colIndex],b.columns[colIndex-1]]}),'Spalte nach links');left.disabled=colIndex===0;
   const right=button('→','small-btn',()=>mutate(()=>{[b.columns[colIndex+1],b.columns[colIndex]]=[b.columns[colIndex],b.columns[colIndex+1]]}),'Spalte nach rechts');right.disabled=colIndex===b.columns.length-1;
   const remove=button('×','small-btn',()=>{if(confirm(`Spalte „${column.title}“ mitsamt ${column.cards.length} Karte(n) löschen?`))mutate(()=>b.columns.splice(colIndex,1))},'Spalte löschen');
   head.append(title,count,left,right,remove);col.append(head);
   const list=el('div','card-list');list.dataset.column=column.id;column.cards.forEach(card=>{
     const item=el('div',`card ${card.color}`);item.dataset.card=card.id;
     const body=el('div','card-body',card.text||'Leere Karte');body.tabIndex=0;body.title='Karte bearbeiten';body.addEventListener('click',()=>openCard(column.id,card.id));body.addEventListener('keydown',e=>{if(e.key==='Enter')openCard(column.id,card.id)});
     const actions=el('div','card-actions');const grip=button('⠿','drag-handle',()=>{},'Karte ziehen');grip.setAttribute('aria-label','Karte mit Maus oder Finger ziehen');installPointerDrag(grip,card.id);
     const menu=el('select','card-menu');menu.setAttribute('aria-label','Aktion für Karte auswählen');[['','Aktion …'],['edit','Bearbeiten'],['delete','Löschen'],...b.columns.filter(c=>c.id!==column.id).map(c=>['to:'+c.id,'→ '+c.title]),['up','↑ Nach oben'],['down','↓ Nach unten']].forEach(([v,t])=>{const o=el('option',null,t);o.value=v;menu.append(o)});
     menu.addEventListener('change',()=>{const val=menu.value;menu.value='';if(val==='edit')openCard(column.id,card.id);else if(val==='delete'){if(confirm('Karte wirklich löschen?'))mutate(()=>column.cards.splice(column.cards.findIndex(c=>c.id===card.id),1))}else if(val.startsWith('to:'))mutate(()=>moveCard(b,card.id,val.slice(3)));else if(val==='up'||val==='down'){const i=column.cards.findIndex(c=>c.id===card.id),j=i+(val==='up'?-1:1);if(j>=0&&j<column.cards.length)mutate(()=>[column.cards[i],column.cards[j]]=[column.cards[j],column.cards[i]])}});
     actions.append(grip,menu);item.append(body,actions);list.append(item);
   });
   list.addEventListener('dragover',e=>e.preventDefault());list.addEventListener('drop',e=>{e.preventDefault();const id=e.dataTransfer?.getData('text/plain');if(id)dropCard(id,e.clientX,e.clientY)});
   col.append(list,button('+ Karte hinzufügen','add-card',()=>openCard(column.id), 'Karte hinzufügen'));holder.append(col);
 });
 $('undo').disabled=!history.length;$('redo').disabled=!future.length;
}
function openCard(columnId,cardId=null){const col=active().columns.find(c=>c.id===columnId);if(!col)return;const card=col.cards.find(c=>c.id===cardId);pendingEdit={columnId,cardId};chosenColor=card?.color||COLORS[Math.floor(Math.random()*4)];$('cardText').value=card?.text||'';$('cardDialogTitle').textContent=card?'Karte bearbeiten':'Neue Karte';renderColors();$('cardDialog').showModal();$('cardText').focus()}
function renderColors(){const holder=$('colorChoices');holder.replaceChildren();COLORS.forEach(color=>{const n=button('','color-swatch '+color,()=>{chosenColor=color;renderColors()},color);n.style.backgroundColor={yellow:'#fff0b9',blue:'#dceafc',green:'#d9f0df',pink:'#f9e0e5',purple:'#eae2f7',white:'#fff'}[color];n.setAttribute('role','radio');n.setAttribute('aria-label',color);n.setAttribute('aria-checked',String(chosenColor===color));holder.append(n)})}
$('cardForm').addEventListener('submit',e=>{e.preventDefault();const text=$('cardText').value.trim();if(!text)return;const {columnId,cardId}=pendingEdit;mutate(()=>{const c=active().columns.find(c=>c.id===columnId);if(!c)return;const card=c.cards.find(k=>k.id===cardId);if(card){card.text=text;card.color=chosenColor}else c.cards.push({id:makeId(),text,color:chosenColor})});$('cardDialog').close()});
$('cancelCard').addEventListener('click',()=>$('cardDialog').close());
$('addColumn').addEventListener('click',()=>{if(active().columns.length>=100)return announce('Maximal 100 Spalten möglich.');const name=prompt('Name der neuen Spalte:','Neue Spalte');if(name===null)return;mutate(()=>active().columns.push({id:makeId(),title:name.trim().slice(0,80)||'Neue Spalte',cards:[]}))});
$('boardTitle').addEventListener('change',()=>mutate(()=>active().title=$('boardTitle').value.trim()||'Unbenanntes Board'));
$('boardTitle').addEventListener('keydown',e=>{if(e.key==='Enter')e.currentTarget.blur()});
$('renameBoardBtn').addEventListener('click',()=>$('boardTitle').focus());
$('boardSelect').addEventListener('change',e=>{activeId=e.target.value;history=[];future=[];save();render()});
$('newBoardBtn').addEventListener('click',()=>{const title=prompt('Titel des neuen Boards:','Meine Werkbank');if(title===null)return;mutate(()=>{const b=freshBoard();b.title=title.trim().slice(0,120)||'Meine Werkbank';boards.push(b);activeId=b.id})});
$('deleteBoardBtn').addEventListener('click',()=>{if(!confirm(`Board „${active().title}“ wirklich löschen?`))return;mutate(()=>{boards=boards.filter(b=>b.id!==activeId);if(!boards.length)boards.push(freshBoard());activeId=boards[0].id})});
$('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(active(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download=`werkbank-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Board als JSON exportiert.');});
$('importBtn').addEventListener('click',()=>$('importFile').click());
$('importFile').addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>5_000_000)return announce('Datei zu groß (maximal 5 MB).');try{const b=validateBoard(JSON.parse(await file.text()));b.id=makeId();b.title+=' (Import)';mutate(()=>{boards.push(b);activeId=b.id});announce('Board importiert.')}catch(err){announce(err.message||'Import fehlgeschlagen.')}});
$('printBtn').addEventListener('click',()=>window.print());$('helpBtn').addEventListener('click',()=>$('helpDialog').showModal());$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
$('undo').addEventListener('click',undo);$('redo').addEventListener('click',redo);document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}else if(e.key.toLowerCase()==='y'){e.preventDefault();redo()}});
function dropCard(cardId,x,y){const below=document.elementFromPoint(x,y);const column=below?.closest('[data-column]');if(!column)return;const columnId=column.dataset.column;const targetCard=below.closest('[data-card]');const before=targetCard?.dataset.card!==cardId?targetCard?.dataset.card:null;if(!active().columns.some(c=>c.cards.some(k=>k.id===cardId)))return;mutate(()=>moveCard(active(),cardId,columnId,before));}
function installPointerDrag(handle,cardId){let start=null,ghost=null;handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;start={x:e.clientX,y:e.clientY,id:e.pointerId};handle.setPointerCapture(e.pointerId)});handle.addEventListener('pointermove',e=>{if(!start||e.pointerId!==start.id)return;if(!ghost&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<7)return;if(!ghost){const source=handle.closest('.card');ghost=source.cloneNode(true);ghost.classList.add('drag-ghost');ghost.style.width=`${source.offsetWidth}px`;document.body.append(ghost);source.classList.add('dragging')}ghost.style.left=`${e.clientX-ghost.offsetWidth/2}px`;ghost.style.top=`${e.clientY-25}px`;});const finish=(e)=>{if(!start||e.pointerId!==start.id)return;const moved=Boolean(ghost);ghost?.remove();handle.closest('.card')?.classList.remove('dragging');start=null;ghost=null;if(moved)dropCard(cardId,e.clientX,e.clientY)};handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',()=>{ghost?.remove();start=null;ghost=null});}
render();save();
