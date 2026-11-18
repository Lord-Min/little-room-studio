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
