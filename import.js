'use strict';
const libraryKey='little-room-custom-v1';
function checkedParts(parts){
 if(!Array.isArray(parts)||!parts.length||parts.length>96)throw Error('가구 부품 정보를 확인할 수 없습니다.');
 return parts.map(p=>{
   const part={};
   for(const k of ['x','y','z','w','h','d']){
     if(!Number.isFinite(p[k])||p[k]<0||p[k]>1||('whd'.includes(k)&&p[k]===0))throw Error('부품 비율이 올바르지 않습니다.');
     part[k]=p[k];
   }
   if(p.x+p.w>1.00001||p.y+p.h>1.00001||p.z+p.d>1.00001||!/^#[0-9a-f]{6}$/i.test(p.c))throw Error('부품이 모델 범위를 벗어났습니다.');
   return {...part,c:p.c};
 });
}
function cleanModel(id,o){
 if(!o||!validDimensions(o)||!o.name)throw Error('상품명과 전체 규격을 확인할 수 없습니다.');
 const model={id,name:String(o.name).slice(0,100),w:o.w,d:o.d,h:o.h,url:/^https?:\/\//i.test(o.url||'')?String(o.url):'',note:String(o.note||'').slice(0,650)};
 if(o.parts)model.parts=checkedParts(o.parts);
 else if([0,1,2].includes(o.base))model.base=o.base;
 else throw Error('모델 형상이 누락되었습니다.');
 return model;
}
function registerModel(id,data){
 const model=cleanModel(id,data),signature=JSON.stringify(model);
 const existing=choices[id].find(p=>p.definition&&JSON.stringify(p.definition)===signature);
 if(existing)return existing;
 const option={...model,variant:choices[id].length,definition:model};
 choices[id].push(option);return option;
}
try{for(const model of JSON.parse(localStorage.getItem(libraryKey)||'[]')){
 try{if(Object.hasOwn(choices,model.id))registerModel(model.id,model)}catch{}
}}catch{}
function saveLibrary(){localStorage.setItem(libraryKey,JSON.stringify(Object.values(choices).flat().filter(p=>p.definition).map(p=>p.definition)))}
function modelShape(id,v){return choices[id][v]?.definition?.base??v}
function fromLayout(page,id){
 if(!page.hash.startsWith('#layout='))return null;
 let rows;
 try{rows=JSON.parse(decodeURIComponent(page.hash.slice(8)))}catch{throw Error('공유 링크의 배치 정보를 읽을 수 없습니다.')}
 const row=Array.isArray(rows)&&rows.find(p=>p.id===id);
 if(!row)throw Error('공유 배치에 선택한 종류의 가구가 없습니다.');
 return cleanModel(id,{...row,parts:row.definition?.parts,base:row.definition?.base??row.variant??0});
}
function setupImport(){
 const dialog=el('importDialog'),form=el('importForm');let category;
 window.openImport=id=>{category=id;form.reset();el('importStatus').textContent='';el('importTitle').textContent=labels[id]+' 신규 가구 추가';dialog.showModal()};
 el('importClose').onclick=()=>dialog.close();
 form.onsubmit=async e=>{
   e.preventDefault();
   const button=el('importSubmit'),status=el('importStatus'),id=category;
   button.disabled=true;el('importClose').disabled=true;
   const preventClose=e=>e.preventDefault();dialog.addEventListener('cancel',preventClose);
   try{
     const page=new URL(el('importUrl').value);if(!['https:','http:'].includes(page.protocol))throw Error('https 상품 또는 방 공유 링크를 입력하세요.');
     status.textContent='가구 정보를 읽는 중…';
     let data=fromLayout(page,id);
     if(!data){
       const known=choices[id].find(p=>p.url===page.href&&p.variant===0);
       if(known)data={...known,base:0};
       else{
         if(!el('importKey').value.trim())throw Error('새 상품 링크의 모델을 생성하려면 Gemini API 키를 입력하세요.');
         data=await analyzeProduct(page.href,el('importText').value,el('importKey').value,labels[id]);
       }
     }
     const option=registerModel(id,data);saveLibrary();
     const old=items.find(i=>i.id===id),point=old.placed?available({...old,...option}):fitPosition({...old,...option});
     if(point){Object.assign(old,option,point);save()}
     selected=id;dialog.close();render();
     el('hint').textContent=point?option.name+' 모델을 추가하고 선택했습니다.':'라이브러리에 추가했습니다. 현재 위치에는 배치할 공간이 부족합니다.';
   }catch(error){status.textContent=error.message}
   finally{button.disabled=false;el('importClose').disabled=false;dialog.removeEventListener('cancel',preventClose);el('importKey').value=''}
 };
}
