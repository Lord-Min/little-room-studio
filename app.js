'use strict';
const el=id=>document.getElementById(id);
const labels={bed:'침대',desk:'책상',wardrobe:'옷장',shelf:'책장',vanity:'화장대',chair:'의자',nightstand:'협탁',sideShelf:'옆 책장'};
const axes={w:'가로',d:'깊이',h:'높이'};
const defaults=[[1815,1774,0],[440,600,270],[400,300,0],[300,150,0],[350,200,0],[800,700,0],[950,400,0],[2250,1400,90]];
const storageKey=roomId==='small'?'little-room-v1':'little-room-v1-'+roomId;
document.querySelector('[data-room="'+roomId+'"]').setAttribute('aria-current','page');
el('roomSize').textContent=room.width.toLocaleString()+' × '+room.depth.toLocaleString()+' mm';
el('roomArea').textContent=(room.width*room.depth/1e6).toFixed(2)+' m²';
const required=id=>id==='desk'||(roomId==='large'&&id==='bed');
const safeUrl=s=>/^https?:\/\//i.test(s||'')?s:'';
let items=catalog.map((v,i)=>({...v,x:defaults[i][0],z:defaults[i][1],rot:defaults[i][2],placed:required(v.id)}));
if(roomId==='small'){
 const desk=items.find(v=>v.id==='desk');
 Object.assign(desk,choices.desk.find(v=>v.url==='https://www.desker.co.kr/product/detail/28'),{x:1400,z:1400,rot:0});
 items.find(v=>v.id==='sideShelf').placed=true;
}
const defaultLayout=JSON.stringify(items);
function extent(v){return v.rot%180?[v.d,v.w]:[v.w,v.d]}
// Coordinates are measured from the finished inside faces of the walls.
function fitPosition(item,x=item.x,z=item.z){
 const [w,d]=extent(item);
 if(w>room.width||d>room.depth)return null;
 return {x:Math.max(w/2,Math.min(room.width-w/2,x)),z:Math.max(d/2,Math.min(room.depth-d/2,z))};
}
// For a new placement, minimize intersecting floor area, then distance from
// the requested position. Area changes slope at aligned footprint edges.
function initialPosition(item){
 const preferred=fitPosition(item);
 if(!preferred)return null;
 const [w,d]=extent(item);
 const xs=new Set([w/2,room.width-w/2,preferred.x]),zs=new Set([d/2,room.depth-d/2,preferred.z]);
 const obstacles=items.filter(o=>o.placed&&o.id!==item.id).map(o=>{
   const [ow,od]=extent(o);
   const left=o.x-ow/2,right=o.x+ow/2,top=o.z-od/2,bottom=o.z+od/2;
   for(const edge of [left,right])for(const offset of [-w/2,w/2])xs.add(edge+offset);
   for(const edge of [top,bottom])for(const offset of [-d/2,d/2])zs.add(edge+offset);
   return {left,right,top,bottom};
 });
 let best=preferred,bestArea=Infinity,bestDistance=Infinity;
 for(const x of xs)for(const z of zs){
   if(x<w/2||x>room.width-w/2||z<d/2||z>room.depth-d/2)continue;
   let area=0;
   for(const o of obstacles){
     const width=Math.max(0,Math.min(x+w/2,o.right)-Math.max(x-w/2,o.left));
     const depth=Math.max(0,Math.min(z+d/2,o.bottom)-Math.max(z-d/2,o.top));
     area+=width*depth;
   }
   const distance=Math.hypot(x-preferred.x,z-preferred.z);
   if(area<bestArea||(area===bestArea&&distance<bestDistance)){
     best={x,z};bestArea=area;bestDistance=distance;
   }
 }
 return best;
}
function clamp(item){const point=fitPosition(item);if(!point)return false;Object.assign(item,point);return true}
function splitLegacyDesk(rows){
 if(roomId!=='small'||rows.some(v=>v.id==='sideShelf'))return;
 const desk=rows.find(v=>v.id==='desk'), shelf={...catalog.find(v=>v.id==='sideShelf'),x:1800,z:150,rot:0,placed:false};
 rows.push(shelf);
 const style=choices.desk[desk?.variant]?.style;
 if(!desk||desk.definition||!['deskShelfLeft','deskShelfRight'].includes(style))return;
 const sign=style==='deskShelfRight'?1:-1, angle=desk.rot*Math.PI/180;
 const pos=(dx,dz)=>({x:Math.round(desk.x+dx*Math.cos(angle)-dz*Math.sin(angle)),z:Math.round(desk.z+dx*Math.sin(angle)+dz*Math.cos(angle))});
 Object.assign(shelf,pos(sign*.4*desk.w,-.3125*desk.d),{w:.2*desk.w,d:.375*desk.d,h:desk.h,rot:desk.rot,placed:true});
 const point=pos(-sign*.1*desk.w,0),dims={w:.8*desk.w,d:desk.d,h:.6*desk.h};
 Object.assign(desk,choices.desk.find(v=>v.style==='whiteDesk'),point,dims);
}
try{
 const json=location.hash.startsWith('#layout=')?decodeURIComponent(location.hash.slice(8)):localStorage.getItem(storageKey);
 const saved=JSON.parse(json||'[]');if(saved.length)splitLegacyDesk(saved);
 items=items.map(v=>{const o=saved.find(p=>p.id===v.id);if(!o||!['x','z','w','d','h','rot'].every(k=>Number.isFinite(o[k]))||![0,90,180,270].includes(o.rot))return v;
 const custom=o.definition?registerModel(v.id,o.definition):null;
 const q={...v,definition:custom?.definition,variant:custom?.variant??((Number.isInteger(o.variant)&&o.variant>0&&o.variant<=alternatives[v.id].length)?o.variant:0),...Object.fromEntries(['w','d','h','rot','x','z'].map(k=>[k,o[k]])),name:String(o.name||v.name).slice(0,80),url:safeUrl(o.url),note:String(o.note||v.note).slice(0,600),placed:required(v.id)||o.placed===true};
 if(v.id==='desk' && o.url===v.url && o.w===1200 && o.d===600 && o.h===720 && o.name==='데스커 책상'){Object.assign(q,v,{x:o.x,z:o.z,rot:o.x===300 && o.z===600 && o.rot===90?270:o.rot})}
 const [w,d]=extent(q);if(Math.min(w,d,q.h)<10||w>room.width||d>room.depth||q.h>2300)return v;return clamp(q)?q:v})
}catch{}
let selected=roomId==='small'?'desk':'bed',walking=false;
const current=()=>items.find(v=>v.id===selected);
const historyKey=storageKey+'-history';
let snapshots=[JSON.stringify(items)],position=0;
try{
 const previous=JSON.parse(localStorage.getItem(historyKey));
 if(!location.hash.startsWith('#layout=')&&Array.isArray(previous?.snapshots)&&previous.snapshots.length<=41&&
    previous.snapshots[previous.position]===localStorage.getItem(storageKey)){
   snapshots=previous.snapshots;position=previous.position;snapshots[position]=JSON.stringify(items);
 }
}catch{}
function updateHistoryButtons(){
 el('undo').disabled=position===0;el('redo').disabled=position>=snapshots.length-1;
}
function persist(){
 try{
   localStorage.setItem(storageKey,snapshots[position]);
   localStorage.setItem(historyKey,JSON.stringify({snapshots,position}));
   if(location.hash.startsWith('#layout='))history.replaceState(null,'',location.pathname+location.search);
   el('saved').textContent='●  이 기기에 저장됨';
 }catch{el('saved').textContent='기기 저장 공간 부족 또는 저장 불가'}
 updateHistoryButtons();
}
function save(){
 const next=JSON.stringify(items);if(next===snapshots[position])return;
 snapshots.splice(position+1,Infinity,next);if(snapshots.length>41)snapshots.shift();
 position=snapshots.length-1;persist();
}
function travel(step){
 const next=position+step;if(next<0||next>=snapshots.length)return;
 const restored=JSON.parse(snapshots[next]);splitLegacyDesk(restored);
 for(const [i,v] of catalog.entries())if(!restored.some(p=>p.id===v.id)){const [x,z,rot]=defaults[i];restored.push({...v,x,z,rot,placed:required(v.id)})}
 for(const p of restored)if(p.definition)p.variant=registerModel(p.id,p.definition).variant;
 items=restored;position=next;persist();render();
}
el('resetLayout').onclick=()=>{
 items=JSON.parse(defaultLayout);
 selected=roomId==='small'?'desk':'bed';
 if(snapshots[position]===defaultLayout)persist();else save();
 render();
 el('saved').textContent=room.name+' 기본 배치로 초기화됨';
};
el('undo').onclick=()=>travel(-1);el('redo').onclick=()=>travel(1);
document.addEventListener('keydown',e=>{
 if((!e.ctrlKey&&!e.metaKey)||e.altKey||document.querySelector('dialog[open]')||e.target.closest?.('input,textarea,[contenteditable=true]'))return;
 const key=e.key.toLowerCase();if(key!=='z'&&key!=='y')return;
 e.preventDefault();travel(key==='y'||e.shiftKey?1:-1);
});
updateHistoryButtons();
const format=n=>n.toLocaleString('ko-KR');
function change(id){selected=id;render()}
function render(){
 const v=current(),placed=items.filter(p=>p.placed);
 el('count').textContent=placed.length+' / '+items.length+' 배치';
 el('cards').replaceChildren(...items.map(p=>{
 const b=document.createElement('button');b.className='card'+(p.id===selected?' chosen':'');b.setAttribute('aria-pressed',String(p.id===selected));
 b.innerHTML='<span class="icon">'+((p.variant||choices[p.id][0].style)?variantSvg(p.id,p.variant||0,true):window.furnitureIcon(p.id))+'</span><span><strong></strong><small></small></span><em></em>';
 b.querySelector('strong').textContent=p.name;b.querySelector('small').textContent=format(p.w)+' × '+format(p.d)+' mm';b.querySelector('em').textContent=required(p.id)?'필수 · 배치':p.placed?'배치됨':'선택';b.onclick=()=>change(p.id);const row=document.createElement('div');row.className='modelRow';const swap=document.createElement('button');swap.className='swap';swap.textContent='변경';swap.setAttribute('aria-label',labels[p.id]+' 모델 변경');swap.onclick=()=>showModels(p.id);row.append(b,swap);
 if(!p.placed){const add=document.createElement('button');add.className='swap';add.textContent='배치';add.setAttribute('aria-label',labels[p.id]+' 배치');add.onclick=()=>{selected=p.id;togglePlacement()};row.append(add)}
 return row}));
 el('selected').textContent=v.name;el('dims').innerHTML=Object.entries(axes).map(([k,n])=>'<div><small>'+n+' mm</small><b>'+format(v[k])+'</b></div>').join('');
 el('place').disabled=required(v.id);el('place').textContent=required(v.id)?'필수 가구':v.placed?'배치 해제':'방에 배치';el('planRotate').hidden=walking;el('planRotate').disabled=el('rotate').disabled=!v.placed;
 const issues=new Set;
 for(let i=0;i<placed.length;i++){const a=placed[i],[w,d]=extent(a);for(const b of placed.slice(i+1)){const [bw,bd]=extent(b);if(Math.abs(a.x-b.x)*2<w+bw&&Math.abs(a.z-b.z)*2<d+bd)issues.add(labels[a.id]+'·'+labels[b.id]+' 겹침')}
 }
 el('alert').textContent=[...issues].join(' / ');el('hint').textContent=walking?'WASD 이동 · 마우스 시선 · Esc 마우스 해제':'가구를 드래그해 위치를 조정하세요.';
 if(walking){window.stopWalk();window.startWalk(el('walk'),placed)}else window.drawPlan(el('plan'),placed,selected,change,(id,x,z)=>{selected=id;Object.assign(current(),{x,z});clamp(current());save();render()})
}
function showModels(id){
 const old=items.find(item=>item.id===id);
 el('modelTitle').textContent=labels[id]+' 모델 변경';
 el('modelList').replaceChildren(...choices[id].filter(o=>roomId!=='small'||!['deskShelfRight','deskShelfLeft'].includes(o.style)).map(option=>{
   const button=document.createElement('button');button.className='option';
   const icon=document.createElement('span');icon.className='icon';icon.innerHTML=option.variant?variantSvg(id,option.variant,true):furnitureIcon(id);
   const description=document.createElement('span'),title=document.createElement('strong'),size=document.createElement('small'),note=document.createElement('small');
   title.textContent=option.name+((old.variant||0)===option.variant?' · 현재 선택':'');
   size.textContent=[option.w,option.d,option.h].map(format).join(' × ')+' mm';
   note.textContent=option.note;description.append(title,size,note);
   button.onclick=()=>{if((old.variant||0)!==option.variant){const point=fitPosition({...old,...option});if(!point){el('models').close();el('alert').textContent='선택한 모델을 놓을 빈 공간이 없습니다.';return}Object.assign(old,{definition:undefined},option,point);save()}selected=id;el('models').close();render()};
   const card=document.createElement('article');card.className='productOption';
   const photo=productPhotos[option.url],visual=document.createElement('div');
   visual.className='productVisual';
   if(photo){
    const img=document.createElement('img');img.src=photo;img.loading='lazy';img.alt=option.name+' 상품 사진';visual.append(img);
   }else{visual.append(icon);visual.append(document.createTextNode('배치 모델 미리보기'))}
   size.textContent='가로 '+format(option.w)+' · 깊이 '+format(option.d)+' · 높이 '+format(option.h)+' mm';
   button.textContent=(old.variant||0)===option.variant?'선택됨':'이 모델 선택';
   const actions=document.createElement('div');actions.className='productActions';
   if(safeUrl(option.url)){
     const link=document.createElement('a');link.href=option.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='상품 상세 ↗';actions.append(link);
   }
   actions.append(button);description.append(actions);card.append(visual,description);return card;
 }));
 el('models').showModal();
}
el('dismissModels').onclick=()=>el('models').close();
function mode(on){if(walking===on)return;if(walking)window.stopWalk();walking=on;el('plan').hidden=on;el('walk').hidden=!on;el('two').classList.toggle('active',!on);el('three').classList.toggle('active',on);el('viewtitle').textContent=on?'1인칭 둘러보기':'배치 평면도';render()}
el('two').onclick=()=>mode(false);el('three').onclick=()=>mode(true);
el('place').onclick=togglePlacement;
function togglePlacement(){const v=current();if(!v.placed){const point=initialPosition(v);if(!point){el('alert').textContent='가구가 방의 안쪽 치수를 초과합니다.';return}Object.assign(v,point)}v.placed=!v.placed;save();render()};
el('planRotate').onclick=el('rotate').onclick=()=>{const v=current(),rot=(v.rot+90)%360,[w,d]=extent({...v,rot});if(w>room.width||d>room.depth){el('alert').textContent='회전하면 방 크기를 초과합니다.';return}const point=fitPosition({...v,rot});Object.assign(v,{rot},point);save();render()};
el('share').onclick=()=>{
 const url=new URL(location.href);url.search='';url.searchParams.set('room',roomId);url.hash='layout='+encodeURIComponent(JSON.stringify(items));
 el('shareUrl').value=url.href;el('copyLink').textContent='링크 복사';el('shareStatus').textContent='';
 el('sendLink').hidden=typeof navigator.share!=='function';el('sharing').showModal();
};
el('shareClose').onclick=()=>el('sharing').close();
el('shareUrl').onclick=e=>e.target.select();
el('copyLink').onclick=async()=>{
 try{await navigator.clipboard.writeText(el('shareUrl').value);el('copyLink').textContent='✓ 복사됨';el('shareStatus').textContent='메시지에 붙여넣어 공유하세요.'}
 catch{el('shareUrl').focus();el('shareUrl').select();el('shareStatus').textContent='선택된 링크를 길게 누르거나 Ctrl+C로 복사하세요.'}
};
el('sendLink').onclick=async()=>{
 try{await navigator.share({title:'우리 아이 방 배치',url:el('shareUrl').value});el('sharing').close()}
 catch(error){if(error.name!=='AbortError')el('shareStatus').textContent='링크 복사로 공유할 수 있습니다.'}
};
document.querySelector('.fields').innerHTML=Object.entries(axes).map(([k,n])=>'<label>'+n+' mm<input type="number" id="f'+k+'" required min="10" max="10000"></label>').join('');
function source(){el('source').href=safeUrl(el('url').value)||'#';el('source').hidden=!safeUrl(el('url').value)}
el('url').oninput=source;
el('edit').onclick=()=>{const v=current();el('pname').value=v.name;el('url').value=v.url;source();el('raw').value='';el('analysis').textContent='';el('note').textContent=v.note;Object.keys(axes).forEach(k=>el('f'+k).value=v[k]);el('dialog').showModal()};
el('close').onclick=()=>el('dialog').close();
el('analyze').onclick=async()=>{const b=el('analyze');b.disabled=true;el('analysis').textContent='제품 정보를 읽는 중…';try{const r=await analyzeProduct(el('url').value,el('raw').value,el('key').value);for(const k of Object.keys(axes))el('f'+k).value=r[k];if(r.name)el('pname').value=r.name;el('note').textContent=r.note;el('analysis').textContent='규격을 확인한 뒤 모델에 적용하세요.'}catch(e){el('analysis').textContent=e.message}finally{b.disabled=false}};
el('form').onsubmit=e=>{e.preventDefault();const v=current(),next={...v};Object.keys(axes).forEach(k=>next[k]=Number(el('f'+k).value));const [w,d]=extent(next),point=fitPosition(next);if(w>room.width||d>room.depth||next.h>2300||!point){el('note').textContent='벽 안쪽에 들어가는 규격을 입력하세요.';return}Object.assign(v,next,point,{name:el('pname').value.trim()||labels[v.id],url:safeUrl(el('url').value),note:el('note').textContent});clamp(v);save();render();el('dialog').close()};

render();
