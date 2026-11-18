(() => {
  'use strict';
  const W = 2400, D = 2800;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const r = (x,y,w,h,fill,rx=0,extra='') => '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" '+extra+'/>';
  const line = (x1,y1,x2,y2,stroke,width,extra='') => '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+stroke+'" stroke-width="'+width+'" '+extra+'/>';
  function type(id) {
    return ['bed','desk','wardrobe','shelf','vanity'].find(k => String(id).startsWith(k)) || 'shelf';
  }
  function drawing(id, w, d) {
    const k=type(id), edge='stroke="#a79c87" stroke-width="8"', wood='url(#rp-wood)';
    if(k==='bed'){
      const b = Math.min(w,d), h=Math.max(w,d);
      const turns = w>d ? 'translate('+w+' 0) rotate(90)' : '';
      return '<g transform="'+turns+'">'+r(0,0,b,h,'#faf8f0',45,edge)+r(24,35,b-48,h-68,'#f0e6d7',65,'stroke="#d5cbb8" stroke-width="8"')+
        r(b*.11,h*.055,b*.78,h*.17,'#fffcf4',65,'stroke="#d6c9b7" stroke-width="9"')+
        r(b*.145,h*.072,b*.71,h*.137,'none',46,'stroke="#e9decb" stroke-width="5"')+
        r(34,h*.30,b-68,h*.67,'url(#rp-quilt)',43,'stroke="#b5ac90" stroke-width="8"')+
        r(34,h*.295,b-68,h*.07,'#e4e3cd',18,'stroke="#babba4" stroke-width="7"')+
        line(b*.19,h*.41,b*.15,h*.83,'#c3c3a8',7)+line(b*.82,h*.48,b*.84,h*.90,'#c3c3a8',7)+
        r(-1,h*.30,32,h*.37,'#fcfaf1',12,edge)+r(0,0,b,29,'#fffdf8',12,edge)+'</g>';
    }
    if(k==='desk'){
      const upper=d*310/880, body=d*290/880, inset=w/120;
      return r(inset,body,w-2*inset,d-body,'#faf9f5',8,edge)+
        r(0,0,w,upper,'#eae8e2',4,edge)+r(4,4,w-8,body-6,'#f6f4ef',4)+
        line(0,body,w,body,'#b8b7ac',5)+line(w/2,body,w/2,upper,'#a3a296',6)+
        r(w*.82,d*.975,w*.07,d*.016,'#74756e',3);
    }
    if(k==='wardrobe') return r(0,0,w,d,'#e7dcc7',12,edge)+r(13,13,w-26,d-26,wood,5)+line(w*.5,8,w*.5,d-8,'#b5a990',7)+line(w*.44,d*.79,w*.44,d*.92,'#9d8e73',11)+line(w*.56,d*.79,w*.56,d*.92,'#9d8e73',11);
    if(k==='vanity') return r(0,0,w,d,wood,27,edge)+r(w*.12,12,w*.76,d*.09,'#d2e2dc',12,edge)+r(w*.67,d*.35,w*.20,d*.32,'#e1c7b6',25)+'<circle cx="'+w*.25+'" cy="'+d*.39+'" r="'+d*.09+'" fill="#a9b6a4"/>';
    let books='';
    const colors=['#a6b4a2','#dcb599','#e7dec4','#9ca9af','#d4c19e','#b6bcb0'];
    for(let i=0;i<11;i++) books+=r(w*(.055+i*.078),d*(.18+(i%3)*.04),w*.062,d*(.62-(i%3)*.04),colors[i%6],4,'stroke="#aa9f89" stroke-width="4"');
    return r(0,0,w,d,wood,12,edge)+books;
  }

  // A consistent axonometric projection makes the profiles readable at thumbnail size.
  window.furnitureIcon = function(id) {
    const proj=(x,y,z)=>[x*.89-y*.77,(x+y)*.38-z];
    const polygon=(coordinates,color,stroke='#9a9685')=>'<polygon points="'+coordinates.map(pt=>proj(...pt).join(',')).join(' ')+'" fill="'+color+'" stroke="'+stroke+'" stroke-width=".72" stroke-linejoin="round"/>';
    const box=(x,y,z,w,d,h,top,front,side)=>polygon([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],front)+polygon([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],side)+polygon([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],top);
    const pale=['#faf8ed','#e9e4d5','#d6d0c1'],oak=['#e5d7be','#cebc9c','#baaa8e'];
    let shapes='', offset='translate(44 30)';
    switch(type(id)){
      case 'bed':
        offset='translate(61 34)';
        shapes=box(0,0,0,34,67,7,...pale)+box(0,0,7,34,2,15,...pale)+box(1,3,7,32,62,5,'#fbf5e7','#e9e0cc','#d3c9b5')+box(4,6,12,26,11,3,...pale)+box(1,23,12,32,41,2,'#cbd0af','#b9be9d','#adb093')+box(1,22,14,32,4,1,'#e6e4cb','#cfceb7','#c1bfa9')+box(32,9,8,2,31,11,...pale); break;
      case 'desk':
        offset='translate(45 64)';
        shapes=box(0,0,0,40,1,58,...pale)+box(0,0,0,1,10,58,...pale)+box(39,0,0,1,10,58,...pale);
        for(const z of [1,12,22,28,40,46,57]) shapes+=box(0,0,z,40,10,1,...pale);
        for(const x of [0,20]) shapes+=box(x,10,46,19.8,.7,12,...pale);
        for(const x of [3,36]) shapes+=box(x,11,0,2,18,1,...pale)+box(x,20,1,2,2,22,...pale);
        shapes+=box(.35,10,23,39.3,19.7,1,...pale);break;
      case 'wardrobe':
        offset='translate(46 65)';
        shapes=box(0,0,0,36,21,54,...oak)+box(0,21,2,17.8,1,50,...pale)+box(18.2,21,2,17.8,1,50,...pale)+box(14,22,20,1,1,7,...oak)+box(21,22,20,1,1,7,...oak);break;
      case 'shelf':
        offset='translate(43 59)';
        shapes=box(0,0,0,40,2,38,...oak)+box(0,0,0,2,17,38,...oak)+box(0,0,0,40,17,2,...oak);
        for(let i=0;i<5;i++)shapes+=box(3+i*4,3,2,3,11,9+(i%3)*2,...[['#c5cdbb','#adb9a1','#939d8d'],['#e0cdb6','#cfba9e','#b5a387']][i%2]);
        shapes+=box(0,0,17,40,17,2,...oak)+box(38,0,0,2,17,38,...oak)+box(0,0,36,40,17,2,...oak);break;
      default:
        offset='translate(43 56)';
        shapes=box(0,0,0,3,21,22,...oak)+box(36,0,0,3,21,22,...oak)+box(0,0,21,39,23,5,...pale)+box(5,1,26,29,2,20,'#e0d5bb','#dce7e2','#b3b7a9')+box(6,3,27,27,1,17,'#e1ebe7','#ccdbd6','#c3d2cb');
    }
    return '<svg viewBox="0 0 108 86" aria-hidden="true" style="display:block;width:100%;height:100%"><ellipse cx="55" cy="69" rx="35" ry="7" fill="#9e9273" opacity=".1"/><g transform="'+offset+'">'+shapes+'</g></svg>';
  };

  window.drawPlan = function(container, items, selectedId, onSelect, onMove) {
    const ink='#6f7568', wall='#5b5c50';
    const dim=(x1,y1,x2,y2,t,vertical=false)=>{
      const cx=(x1+x2)/2,cy=(y1+y2)/2;
      return line(x1,y1,x2,y2,ink,5)+line(x1-23,y1+23,x1+23,y1-23,ink,6)+line(x2-23,y2+23,x2+23,y2-23,ink,6)+
        '<text x="'+cx+'" y="'+(cy-24)+'" transform="'+(vertical?'rotate(-90 '+cx+' '+cy+')':'')+'" text-anchor="middle" fill="#65695d" font-size="76" font-weight="550">'+t+'</text>';
    };
    let floor='';
    const hues=['#e7d5b8','#e6d3b5','#ead9bf','#e4d0b0','#e9d8be','#e2cfb1'];
    for(let j=0;j<14;j++) for(let i=-1;i<4;i++){
      const x=i*890+(j*347)%890, y=j*210;
      floor+=r(x,y,890,210,hues[((j*3+i+9)%6)],0,'stroke="#c6af8b" stroke-opacity=".55" stroke-width="4"');
      floor+='<path d="M'+(x+44)+' '+(y+85)+' q215 -12 381 0 t341 1 M'+(x+170)+' '+(y+155)+' q165 9 300 0 t248 -2" fill="none" stroke="#bfaa8c" stroke-opacity=".32" stroke-width="3"/>';
    }
    const names={bed:'침대',desk:'책상',wardrobe:'옷장',shelf:'책장',vanity:'화장대'};
    const furniture=items.map(item=>{
      const {x,z,w,d,rot=0,id}=item, active=selectedId===id;
      return '<g data-id="'+escape(id)+'" role="button" tabindex="0" aria-label="'+escape(item.name)+' 선택" style="cursor:grab" transform="translate('+x+' '+z+')"><g transform="rotate('+rot+') translate('+(-w/2)+' '+(-d/2)+')"><g filter="url(#rp-shadow)">'+drawing(id,w,d)+'</g>'+
        (active?r(-13,-13,w+26,d+26,'none',27,'stroke="#73845c" stroke-width="12" stroke-dasharray="31 16"'):'')+'</g><g pointer-events="none">'+r(-116,-52,232,104,active?'#586747':'#fffcf1',51,'opacity=".94"')+
        '<text text-anchor="middle" dominant-baseline="central" fill="'+(active?'white':'#605f50')+'" font-size="62" font-weight="650">'+names[type(id)]+'</text></g></g>';
    }).join('');
    container.innerHTML='<svg role="group" aria-label="가구 배치 평면도, 단위 밀리미터" viewBox="-450 -360 3300 3500" style="width:100%;height:100%;display:block;touch-action:none;user-select:none;font-family:inherit;background-image:radial-gradient(circle,#c7c7b955 1px,transparent 1px);background-size:16px 16px"><defs><clipPath id="rp-floor"><rect width="2400" height="2800"/></clipPath><pattern id="rp-quilt" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="70" height="70" fill="#cdd2b7"/><path d="M0 0H70 M0 0V70" fill="none" stroke="#e5e7d2" stroke-width="7" opacity=".65"/></pattern><linearGradient id="rp-wood" x2="1" y2=".9"><stop stop-color="#f0e6cf"/><stop offset="1" stop-color="#d9c7a6"/></linearGradient><filter id="rp-shadow" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="10" dy="16" stdDeviation="19" flood-color="#635642" flood-opacity=".27"/></filter></defs>'+
      '<g clip-path="url(#rp-floor)">'+floor+'</g>'+
      '<g fill="none" stroke="'+wall+'" stroke-width="56" stroke-linecap="square"><path d="M0 2800V0H130 M2270 0H2400V2800H900"/></g>'+
      '<path d="M130 -16H2270V16H130Z" fill="#e9f1ed" stroke="#859a92" stroke-width="9"/>'+line(130,0,2270,0,'#90aaa3',5)+line(1190,-17,1190,17,'#718278',16)+
      '<path d="M0 1900A900 900 0 0 1 900 2800" fill="none" stroke="#a99c83" stroke-width="8" stroke-dasharray="24 17"/>'+r(5,1900,25,900,'#f2e9d7',0,'stroke="#938a75" stroke-width="8"')+
      '<g fill="none" stroke="#909383" stroke-width="4"><path d="M0 -85V-230 M2400 -85V-230 M-80 0H-235 M-80 2800H-235 M0 2870V3020 M900 2870V3020 M2400 2870V3020"/></g>'+
      dim(0,-180,W,-180,'2,400 mm')+dim(-190,0,-190,D,'2,800 mm',true)+dim(0,2980,900,2980,'900')+dim(900,2980,2400,2980,'1,500')+
      '<text x="1200" y="-49" text-anchor="middle" fill="#667e76" font-size="58">베란다창</text>'+furniture+'</svg>';
    const svg=container.firstElementChild;
    const point=e=>new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    let drag=null;
    svg.onpointerdown=e=>{
      const node=e.target.closest('[data-id]');
      if(!node || e.button!==0) return;
      const item=items.find(i=>String(i.id)===node.dataset.id);
      drag={node,item,start:point(e),clientX:e.clientX,clientY:e.clientY,x:item.x,z:item.z,moved:false,pointer:e.pointerId};
      svg.setPointerCapture(e.pointerId);
      node.style.cursor='grabbing';
      e.preventDefault();
    };
    svg.onpointermove=e=>{
      if(!drag||drag.pointer!==e.pointerId)return;
      if(!drag.moved && Math.hypot(e.clientX-drag.clientX,e.clientY-drag.clientY)<3)return;
      drag.moved=true;
      const p=point(e), i=drag.item, a=(i.rot||0)*Math.PI/180;
      const hw=(Math.abs(Math.cos(a))*i.w+Math.abs(Math.sin(a))*i.d)/2, hd=(Math.abs(Math.cos(a))*i.d+Math.abs(Math.sin(a))*i.w)/2;
      const fit=(v,h,max)=>h*2>max?max/2:Math.min(max-h,Math.max(h,Math.round(v/10)*10));
      drag.x=fit(i.x+p.x-drag.start.x,hw,W);
      drag.z=fit(i.z+p.y-drag.start.y,hd,D);
      drag.node.setAttribute('transform','translate('+drag.x+' '+drag.z+')');
    };
    svg.onpointerup=e=>{
      if(!drag||drag.pointer!==e.pointerId)return;
      const done=drag;drag=null;done.node.style.cursor='grab';
      if(done.moved) onMove(done.item.id,Math.round(done.x),Math.round(done.z));
      else onSelect(done.item.id);
    };
    svg.onpointercancel=()=>{if(drag){drag.node.setAttribute('transform','translate('+drag.item.x+' '+drag.item.z+')');drag.node.style.cursor='grab';drag=null;}};
    svg.onkeydown=e=>{
      const node=e.target.closest('[data-id]');
      if(node && (e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect(node.dataset.id);}
    };
  };
})();
