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
function clamp(v){const [w,d]=extent(v);v.x=Math.round(Math.max(w/2,Math.min(2400-w/2,v.x)));v.z=Math.round(Math.max(d/2,Math.min(2800-d/2,v.z)))}
try{
 const json=location.hash.startsWith('#layout=')?decodeURIComponent(location.hash.slice(8)):localStorage.getItem(storageKey);
 const saved=JSON.parse(json||'[]');
 items=items.map(v=>{const o=saved.find(p=>p.id===v.id);if(!o||!['x','z','w','d','h','rot'].every(k=>Number.isFinite(o[k]))||![0,90,180,270].includes(o.rot))return v;
 const q={...v,variant:[1,2].includes(o.variant)?o.variant:0,...Object.fromEntries(['w','d','h','rot','x','z'].map(k=>[k,o[k]])),name:String(o.name||v.name).slice(0,80),url:safeUrl(o.url),note:String(o.note||v.note).slice(0,600),placed:required(v.id)||o.placed===true};
 if(v.id==='desk' && o.url===v.url && o.w===1200 && o.d===600 && o.h===720 && o.name==='데스커 책상'){Object.assign(q,v,{x:o.x,z:o.z,rot:o.x===300 && o.z===600 && o.rot===90?270:o.rot})}
 const [w,d]=extent(q);if(Math.min(w,d,q.h)<10||w>2400||d>2800||q.h>2300)return v;clamp(q);return q})
}catch{}
let selected='bed',walking=false;
const current=()=>items.find(v=>v.id===selected);
function save(){try{localStorage.setItem(storageKey,JSON.stringify(items));if(location.hash.startsWith('#layout='))history.replaceState(null,'',location.pathname+location.search);el('saved').textContent='●  이 기기에 저장됨'}catch{el('saved').textContent='기기 저장 불가'}}
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
 if(Math.hypot(Math.max(0,a.x-w/2),Math.max(0,2800-a.z-d/2))<900)issues.add(labels[a.id]+' 출입문 간섭')}
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
   button.onclick=()=>{if((old.variant||0)!==option.variant){Object.assign(old,option);clamp(old);save()}selected=id;el('models').close();render()};
   return button;
 }));
 el('models').showModal();
}
el('dismissModels').onclick=()=>el('models').close();
function mode(on){if(walking===on)return;if(walking)window.stopWalk();walking=on;el('plan').hidden=on;el('walk').hidden=!on;el('two').classList.toggle('active',!on);el('three').classList.toggle('active',on);el('viewtitle').textContent=on?'1인칭 둘러보기':'배치 평면도';render()}
el('two').onclick=()=>mode(false);el('three').onclick=()=>mode(true);
el('place').onclick=()=>{const v=current();v.placed=!v.placed;save();render()};
el('rotate').onclick=()=>{const v=current(),rot=(v.rot+90)%360,[w,d]=extent({...v,rot});if(w>2400||d>2800){el('alert').textContent='회전하면 방 크기를 초과합니다.';return}v.rot=rot;clamp(v);save();render()};
el('share').onclick=async()=>{const link=location.origin+location.pathname+'#layout='+encodeURIComponent(JSON.stringify(items));try{await navigator.clipboard.writeText(link);el('hint').textContent='현재 배치의 공유 링크를 복사했습니다.'}catch{prompt('배치 링크를 복사하세요.',link)}};
document.querySelector('.fields').innerHTML=Object.entries(axes).map(([k,n])=>'<label>'+n+' mm<input type="number" id="f'+k+'" required min="10" max="10000"></label>').join('');
function source(){el('source').href=safeUrl(el('url').value)||'#';el('source').hidden=!safeUrl(el('url').value)}
el('url').oninput=source;
el('edit').onclick=()=>{const v=current();el('pname').value=v.name;el('url').value=v.url;source();el('raw').value='';el('analysis').textContent='';el('note').textContent=v.note;Object.keys(axes).forEach(k=>el('f'+k).value=v[k]);el('dialog').showModal()};
el('close').onclick=()=>el('dialog').close();
el('analyze').onclick=async()=>{const b=el('analyze');b.disabled=true;el('analysis').textContent='제품 정보를 읽는 중…';try{const r=await analyzeProduct(el('url').value,el('raw').value,el('key').value);for(const k of Object.keys(axes))el('f'+k).value=r[k];if(r.name)el('pname').value=r.name;el('note').textContent=r.note;el('analysis').textContent='규격을 확인한 뒤 모델에 적용하세요.'}catch(e){el('analysis').textContent=e.message}finally{b.disabled=false}};
el('form').onsubmit=e=>{e.preventDefault();const v=current(),next={...v};Object.keys(axes).forEach(k=>next[k]=Number(el('f'+k).value));const [w,d]=extent(next);if(w>2400||d>2800||next.h>2300){el('note').textContent='현재 방향에서 방 안에 들어가는 규격을 입력하세요.';return}Object.assign(v,next,{name:el('pname').value.trim()||labels[v.id],url:safeUrl(el('url').value),note:el('note').textContent});clamp(v);save();render();el('dialog').close()};
render();
