'use strict';
const el=id=>document.getElementById(id);
const labels={bed:'침대',desk:'책상',wardrobe:'옷장',shelf:'책장',vanity:'화장대'};
const axes={w:'가로',d:'깊이',h:'높이'};
const defaults=[[1815,1774,0],[440,600,270],[400,300,0],[300,150,0],[350,200,0]];
const storageKey='little-room-v1';
const required=id=>id==='desk'||id==='bed';
const safeUrl=s=>/^https?:\/\//i.test(s||'')?s:'';
let items=catalog.map((v,i)=>({...v,x:defaults[i][0],z:defaults[i][1],rot:defaults[i][2],placed:required(v.id)}));
function extent(v){return v.rot%180?[v.d,v.w]:[v.w,v.d]}
// Coordinates are measured from the finished inside faces of the walls.
function fitPosition(item,x=item.x,z=item.z){
 const [w,d]=extent(item);
 if(w>2400||d>2800)return null;
 return {x:Math.max(w/2,Math.min(2400-w/2,x)),z:Math.max(d/2,Math.min(2800-d/2,z))};
}
function overlaps(item,point,others=items){
 const [w,d]=extent(item);
 return others.some(other=>{
   if(!other.placed || other.id===item.id)return false;
   const [ow,od]=extent(other);
   return Math.abs(point.x-other.x)*2<w+ow && Math.abs(point.z-other.z)*2<d+od;
 });
}
// Candidate positions are bounded by walls and the edges of other furniture.
function available(item,others=items){
 const preferred=fitPosition(item);
 if(!preferred || !overlaps(item,preferred,others))return preferred;
 const [w,d]=extent(item),xs=new Set([w/2,2400-w/2,preferred.x]),zs=new Set([d/2,2800-d/2,preferred.z]);
 for(const o of others.filter(o=>o.placed&&o.id!==item.id)){
   const [ow,od]=extent(o);
   xs.add(o.x-(ow+w)/2);xs.add(o.x+(ow+w)/2);
   zs.add(o.z-(od+d)/2);zs.add(o.z+(od+d)/2);
 }
 let best=null,dist=Infinity;
 for(const x of xs){
   if(x<w/2||x>2400-w/2)continue;
   for(const z of zs){
     if(z>2800-d/2)continue;
     const point={x,z},delta=Math.hypot(x-item.x,z-item.z);
     if(z>=d/2&&delta<dist&&!overlaps(item,point,others)){best=point;dist=delta}
   }
 }
 return best;
}
function dragPosition(item,x,z,from){
 const target=fitPosition(item,x,z);
 if(!target)return from;
 const point={x:from.x,z:from.z};
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(target.x-point.x),Math.abs(target.z-point.z))/5));
 for(let n=1;n<=steps;n++){
   for(const axis of ['x','z']){
     const step=(target[axis]-from[axis])/steps;
     const goal=from[axis]+step*n;
     const next={...point,[axis]:point[axis]+Math.max(-Math.abs(step),Math.min(Math.abs(step),goal-point[axis]))};
     // Allow escape from existing intersections, without entering a new one.
     const [w,d]=extent(item);
     const blocked=items.some(other=>{
       if(!other.placed||other.id===item.id)return false;
       const [ow,od]=extent(other);
       const depth=(p,k)=>((k==='x'?w+ow:d+od)/2)-Math.abs(p[k]-other[k]);
       if(depth(next,'x')<=0||depth(next,'z')<=0)return false;
       return depth(point,'x')<=0||depth(point,'z')<=0||depth(next,axis)>depth(point,axis)+1e-8;
     });
     if(!blocked)point[axis]=next[axis];
   }
 }
 return point;
}
function clamp(item){const point=fitPosition(item);if(!point)return false;Object.assign(item,point);return true}
try{
 const json=location.hash.startsWith('#layout=')?decodeURIComponent(location.hash.slice(8)):localStorage.getItem(storageKey);
 const saved=JSON.parse(json||'[]');
 items=items.map(v=>{const o=saved.find(p=>p.id===v.id);if(!o||!['x','z','w','d','h','rot'].every(k=>Number.isFinite(o[k]))||![0,90,180,270].includes(o.rot))return v;
 const custom=o.definition?registerModel(v.id,o.definition):null;
 const q={...v,definition:custom?.definition,variant:custom?.variant??((Number.isInteger(o.variant)&&o.variant>0&&o.variant<=alternatives[v.id].length)?o.variant:0),...Object.fromEntries(['w','d','h','rot','x','z'].map(k=>[k,o[k]])),name:String(o.name||v.name).slice(0,80),url:safeUrl(o.url),note:String(o.note||v.note).slice(0,600),placed:required(v.id)||o.placed===true};
 if(v.id==='desk' && o.url===v.url && o.w===1200 && o.d===600 && o.h===720 && o.name==='데스커 책상'){Object.assign(q,v,{x:o.x,z:o.z,rot:o.x===300 && o.z===600 && o.rot===90?270:o.rot})}
 const [w,d]=extent(q);if(Math.min(w,d,q.h)<10||w>2400||d>2800||q.h>2300)return v;return clamp(q)?q:v})
}catch{}
let selected='bed',walking=false;
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
 const restored=JSON.parse(snapshots[next]);
 for(const p of restored)if(p.definition)p.variant=registerModel(p.id,p.definition).variant;
 items=restored;position=next;persist();render();
}
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
 el('count').textContent=placed.length+' / 5 배치';
 el('cards').replaceChildren(...items.map(p=>{
 const b=document.createElement('button');b.className='card'+(p.id===selected?' chosen':'');b.setAttribute('aria-pressed',String(p.id===selected));
 b.innerHTML='<span class="icon">'+(p.variant?variantSvg(p.id,p.variant,true):window.furnitureIcon(p.id))+'</span><span><strong></strong><small></small></span><em></em>';
 b.querySelector('strong').textContent=p.name;b.querySelector('small').textContent=format(p.w)+' × '+format(p.d)+' mm';b.querySelector('em').textContent=required(p.id)?'필수 · 배치':p.placed?'배치됨':'선택';b.onclick=()=>change(p.id);const row=document.createElement('div');row.className='modelRow';const swap=document.createElement('button');swap.className='swap';swap.textContent='변경';swap.setAttribute('aria-label',labels[p.id]+' 모델 변경');swap.onclick=()=>showModels(p.id);row.append(b,swap);return row}));
 el('selected').textContent=v.name;el('dims').innerHTML=Object.entries(axes).map(([k,n])=>'<div><small>'+n+' mm</small><b>'+format(v[k])+'</b></div>').join('');
 el('place').disabled=required(v.id);el('place').textContent=required(v.id)?'필수 가구':v.placed?'배치 해제':'방에 배치';el('rotate').disabled=!v.placed;
 const issues=new Set;
 for(let i=0;i<placed.length;i++){const a=placed[i],[w,d]=extent(a);for(const b of placed.slice(i+1)){const [bw,bd]=extent(b);if(Math.abs(a.x-b.x)*2<w+bw&&Math.abs(a.z-b.z)*2<d+bd)issues.add(labels[a.id]+'·'+labels[b.id]+' 겹침')}
 }
 el('alert').textContent=[...issues].join(' / ');el('hint').textContent=walking?'WASD 이동 · 마우스 시선 · Esc 마우스 해제':'가구를 드래그해 위치를 조정하세요.';
 if(walking){window.stopWalk();window.startWalk(el('walk'),placed)}else window.drawPlan(el('plan'),placed,selected,change,(id,x,z)=>{selected=id;Object.assign(current(),{x,z});clamp(current());save();render()})
}
function showModels(id){
 const old=items.find(item=>item.id===id);
 el('modelTitle').textContent=labels[id]+' 모델 변경';
 el('modelList').replaceChildren(...choices[id].map(option=>{
   const button=document.createElement('button');button.className='option';
   const icon=document.createElement('span');icon.className='icon';icon.innerHTML=option.variant?variantSvg(id,option.variant,true):furnitureIcon(id);
   const description=document.createElement('span'),title=document.createElement('strong'),size=document.createElement('small'),note=document.createElement('small');
   title.textContent=option.name+((old.variant||0)===option.variant?' · 현재 선택':'');
   size.textContent=[option.w,option.d,option.h].map(format).join(' × ')+' mm';
   note.textContent=option.note;description.append(title,size,note);button.append(icon,description);
   button.onclick=()=>{if((old.variant||0)!==option.variant){const point=old.placed?available({...old,...option}):fitPosition({...old,...option});if(!point){el('models').close();el('alert').textContent='선택한 모델을 놓을 빈 공간이 없습니다.';return}Object.assign(old,{definition:undefined},option,point);save()}selected=id;el('models').close();render()};
   return button;
 }));
 el('models').showModal();
}
el('dismissModels').onclick=()=>el('models').close();
function mode(on){if(walking===on)return;if(walking)window.stopWalk();walking=on;el('plan').hidden=on;el('walk').hidden=!on;el('two').classList.toggle('active',!on);el('three').classList.toggle('active',on);el('viewtitle').textContent=on?'1인칭 둘러보기':'배치 평면도';render()}
el('two').onclick=()=>mode(false);el('three').onclick=()=>mode(true);
el('place').onclick=()=>{const v=current();if(!v.placed){const point=available(v);if(!point){el('alert').textContent='이 가구를 놓을 빈 공간이 없습니다.';return}Object.assign(v,point)}v.placed=!v.placed;save();render()};
el('rotate').onclick=()=>{const v=current(),rot=(v.rot+90)%360,[w,d]=extent({...v,rot});if(w>2400||d>2800){el('alert').textContent='회전하면 방 크기를 초과합니다.';return}const point=fitPosition({...v,rot});Object.assign(v,{rot},point);save();render()};
el('share').onclick=async()=>{const link=location.origin+location.pathname+'#layout='+encodeURIComponent(JSON.stringify(items));try{await navigator.clipboard.writeText(link);el('hint').textContent='현재 배치의 공유 링크를 복사했습니다.'}catch{prompt('배치 링크를 복사하세요.',link)}};
document.querySelector('.fields').innerHTML=Object.entries(axes).map(([k,n])=>'<label>'+n+' mm<input type="number" id="f'+k+'" required min="10" max="10000"></label>').join('');
function source(){el('source').href=safeUrl(el('url').value)||'#';el('source').hidden=!safeUrl(el('url').value)}
el('url').oninput=source;
el('edit').onclick=()=>{const v=current();el('pname').value=v.name;el('url').value=v.url;source();el('raw').value='';el('analysis').textContent='';el('note').textContent=v.note;Object.keys(axes).forEach(k=>el('f'+k).value=v[k]);el('dialog').showModal()};
el('close').onclick=()=>el('dialog').close();
el('analyze').onclick=async()=>{const b=el('analyze');b.disabled=true;el('analysis').textContent='제품 정보를 읽는 중…';try{const r=await analyzeProduct(el('url').value,el('raw').value,el('key').value);for(const k of Object.keys(axes))el('f'+k).value=r[k];if(r.name)el('pname').value=r.name;el('note').textContent=r.note;el('analysis').textContent='규격을 확인한 뒤 모델에 적용하세요.'}catch(e){el('analysis').textContent=e.message}finally{b.disabled=false}};
el('form').onsubmit=e=>{e.preventDefault();const v=current(),next={...v};Object.keys(axes).forEach(k=>next[k]=Number(el('f'+k).value));const [w,d]=extent(next),point=next.placed?available(next):fitPosition(next);if(w>2400||d>2800||next.h>2300||!point){el('note').textContent='벽 안쪽에 들어가고 다른 가구와 겹치지 않는 규격을 입력하세요.';return}Object.assign(v,next,point,{name:el('pname').value.trim()||labels[v.id],url:safeUrl(el('url').value),note:el('note').textContent});clamp(v);save();render();el('dialog').close()};

render();
