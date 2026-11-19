'use strict';
const alternatives={
 bed:[
 ['책장 헤드 수납침대',1140,2220,1050,'헤드에 책을 꽂는 두 칸을 둔 배치용 예시입니다.'],
 ['낮은 원목 데이베드',1050,2040,580,'긴 쪽 등받이와 낮은 발치가 있는 배치용 예시입니다.']],
 desk:[
 ['데스커 800 + 오른쪽 낮은 책장',1100,600,850,'DSAD608 상판 800×600 mm + 우측 300×300×850 mm 예시 책장. 개별 가구 조합입니다.','https://www.desker.co.kr/product/detail/31'],
 ['데스커 1000 + 오른쪽 세로 책장',1300,400,1250,'DSAD410 상판 1000×400 mm + 우측 300×300×1250 mm 예시 책장. 개별 가구 조합입니다.','https://www.desker.co.kr/product/detail/29'],
 ['리바트 로넌 1200 책상세트 플랩도어형',1194,750,1782,'로넌 일반책상·상부장·플랩도어 구성 규격 기준. 선반 위치와 색상은 근사입니다.','https://brand.naver.com/livart/products/462515500'],
 ['슬림 일반책상 1200 × 500',1200,500,720,'높이 720 mm로 가정한 원목색 상판의 기본형 책상입니다.'],
 ['아이엔지홈 위키드 모션 책상 · 화이트',1200,650,1240,'전체 높이 1240~1450 mm 중 최저 높이, 각도조절 상판을 평평하게 둔 모습입니다.','https://brand.naver.com/inggagu/products/10640323594']],
 wardrobe:[
 ['슬림 외문 옷장',460,550,1750,'긴 손잡이가 달린 한 칸 옷장 · 배치용 예시'],
 ['낮은 오픈 행거장',900,480,1250,'상단 옷봉과 하부 수납 선반 · 배치용 예시']],
 shelf:[
 ['와이드 2단 책장',950,280,680,'가로로 긴 4칸 수납 · 배치용 예시'],
 ['틈새 5단 책장',350,320,1580,'폭이 좁고 높은 5칸 수납 · 배치용 예시']],
 vanity:[
 ['서랍형 미니 화장대',520,340,1000,'사각 거울과 한 칸 서랍 · 배치용 예시'],
 ['수납장형 화장대',860,470,1420,'오른쪽 3단 수납장과 넓은 거울 · 배치용 예시'],
 ['데스커 600폭 5단 거울 화장대',590,411,1736,'DSCFB0605J · 세로 거울도어와 우측 오픈 선반, 하부 3서랍. 제조사 도면 590 × 411 × 1736 mm.','https://brand.naver.com/desker/products/13797653761']]
};
for(let [id,models] of Object.entries(retailModels)){
 if(!alternatives[id]){
  const [name,w,d,h,url,style]=models[0];
  catalog.push({id,name,w,d,h,url,style,note:'이케아 코리아 제품 외형 치수 · 배치용 근사 모델'});
  alternatives[id]=[];
  models=models.slice(1);
 }
 for(const [name,w,d,h,url,style] of models)alternatives[id].push([name,w,d,h,'이케아 코리아 제품 외형 치수 · 세부 형상은 배치용 근사 모델',url,style]);
}
for(const [side,style] of [['오른쪽','deskShelfRight'],['왼쪽','deskShelfLeft']]){
 alternatives.desk.push(['데스커 1200 × 800 + '+side+' 책장',1500,800,1200,
  'DSAD012 베이직데스크 1200 × 800 × 720 mm와 예시 책장 300 × 300 × 1200 mm의 배치 조합입니다.',
  'https://www.desker.co.kr/product/detail/15',style]);
}
const choices=Object.fromEntries(catalog.map(p=>[p.id,[{...p,variant:0},...alternatives[p.id].map(([name,w,d,h,note,url='',style],i)=>({id:p.id,variant:i+1,name,w,d,h,note,url,style}))]]));
// Shared model parts use a unit bounding box, with height measured up from the floor.
function variantParts(id,v){
 if(choices[id][v]?.definition?.parts)return choices[id][v].definition.parts.slice();
 v=modelShape(id,v);
 const parts=[],oak='#d4b895',cream='#f3f0e8',mint='#a8bbab',metal='#9ba69e';
 const box=(x,y,z,w,h,d,c=cream)=>parts.push({x,y,z,w,h,d,c});
 const rack=(x,y,z,w,h,d,rows,cols)=>{
  box(x,y,z,w,h,.018,oak);
  for(let i=0;i<=cols;i++)box(x+(w-.018)*i/cols,y,z,.018,h,d);
  for(let i=0;i<=rows;i++)box(x,y+(h-.019)*i/rows,z,w,.019,d,oak);
 };
 const style=choices[id][v]?.style;
 if(style){
  const finish=['slats','bamboo'].includes(style)?oak:style==='padded'?'#706e70':style==='five'?'#473d37':style==='one'?'#d4c9b2':cream;
  const legs=(height)=>{for(const x of [.025,.94])for(const z of [.035,.91])box(x,0,z,.035,height,.045,finish)};
  if(style==='deskShelfRight'||style==='deskShelfLeft'){
   const left=style==='deskShelfLeft', x=left?.2:0;
   box(x,.58,0,.8,.02,1);
   for(const leg of [.016,.76])for(const z of [.03,.92])box(x+leg,0,z,.024,.58,.045);
   rack(left?0:.8,0,0,.2,1,.375,4,1);
  }else if(id==='chair'){
   const color=style==='roenninge'?oak:style==='krylbo'?'#b8aa95':cream;
   for(const x of [.07,.85])for(const z of [.07,.86])box(x,0,z,.075,.56,.075,color);
   box(.025,.55,.02,.95,.075,.96,color);
   for(const x of [.08,.85])box(x,.625,.025,.07,.345,.065,color);
   box(.035,style==='krylbo'?.65:.79,.025,.93,style==='krylbo'?.35:.21,.09,color);
  }else if(id==='nightstand'){
   const color=style==='nesna'?oak:style==='knarrevik'?'#484a49':cream;
   if(style==='storklinta'){
    box(0,.03,0,1,.97,.95,color);
    for(const y of [.045,.52])box(.015,y,.95,.97,.46,.05,color);
   }else{
    for(const x of [0,.94])for(const z of [0,.94])box(x,0,z,.06,1,.06,color);
    box(0,.95,0,1,.05,1,style==='nesna'?'#becdc9':color);box(0,.22,0,1,.055,1,color);
   }
  }else if(id==='shelf'){
   const rows={two:2,three:3,four:4,five:5,six:6}[style];
   for(const x of [0,.975])box(x,0,0,.025,1,1,finish);
   for(let i=0;i<=rows;i++)box(.025,.025+.95*i/rows,0,.95,.022,1,finish);
   box(.025,.025,0,.95,.95,.018,finish);
  }else if(id==='wardrobe'){
   box(0,.018,0,1,.982,.954,finish);
   const n=style==='one'?1:['three','mirror'].includes(style)?3:2;
   for(let i=0;i<n;i++){
    const z=style==='slide'&&i===0?.948:.97;
    box(i/n+.004,.026,z,1/n-.009,.965,.024,style==='mirror'&&i===1?'#b8c9ca':finish);
    box((i+.83)/n,.46,z+.024,.012,.055,.006,metal);
   }
  }else if(id==='bed'){
   const flat=['daybed','lowdrawers'].includes(style);
   const top=flat?.76:style==='storage'?.72:.45;
   box(0,.04,0,1,top-.04,1,finish);
   box(.02,top,.02,.96,flat?1-top:.10,.96,'#fbf8ef');
   if(!flat){
    if(style==='slats'){for(let i=0;i<6;i++)box(.015+i*.17,top,0,.105,1-top,.028,finish)}
    else box(0,top,0,1,1-top,.038,finish);
   }
   if(['storage','lowdrawers','daybed'].includes(style))for(let i=0;i<2;i++)box(0,.08,.018+i*.49,.016,top-.12,.465,cream);
  }else{
   const mirror=style==='mirror',top=mirror?.52:.967;
   box(0,top,0,1,.033,1,finish);
   if(style==='sides'){for(const x of [0,.974])box(x,0,0,.026,top,1,finish)}
   else legs(top);
   if(['cabinet','pedestal'].includes(style)){
    const n=style==='pedestal'?5:1;for(let i=0;i<n;i++)box(.015,.02+i*(top-.04)/n,.02,.32,(top-.04)/n-.012,.96,finish);
   }
   if(['flip','drawer','mirror','bamboo','cabinet'].includes(style))box(.05,top-.115,.04,.90,.108,.91,finish);
   if(style==='flip')box(.51,.996,.012,.48,.004,.976,'#efede7');
   if(mirror){box(.24,top+.033,.02,.52,.447,.04,finish);box(.265,top+.06,.06,.47,.39,.012,'#b7c8c8')}
  }
  return parts;
 }
 if(id==='vanity'&&v===3){
  box(.035,0,.04,.93,.018,.91,metal);
  box(0,.018,0,1,.385,.935);
  for(const [y,h] of [[.023,.137],[.167,.137],[.311,.084]])box(.01,y,.935,.98,h,.065);
  box(0,.403,0,1,.597,.024);
  for(const x of [0,.975])box(x,.403,.024,.025,.597,.67);
  box(.025,.989,.024,.95,.011,.67,oak);
  for(const y of [.59,.79])box(.63,y,.024,.344,.012,.67,oak);
  box(.612,.405,.024,.021,.584,.67);
  box(.025,.505,.68,.60,.481,.04);
  box(.029,.509,.72,.592,.473,.008,'#bdcbd0');
  box(.045,.41,.22,.54,.078,.43,'#c2bdb6');
 }else if(id==='desk'&&v===3){
  const top=720/1782;
  box(0,top-.013,0,1,.013,1);
  for(const x of [0,.985])box(x,0,0,.015,top-.013,1);
  box(.015,.22,.025,.97,.16,.03);
  box(.004,top,0,.992,1-top,.008,oak);
  for(const x of [.004,.983])box(x,top,.008,.013,1-top,.38);
  for(const y of [.66,.81,.99])box(.017,y,.008,.966,.01,.38);
  box(.62,.67,.008,.013,.32,.38);box(.018,.817,.388,.60,.17,.02);
 }else if(id==='desk'&&v===4){
  box(0,.967,0,1,.033,1,oak);
  for(const x of [.025,.95])for(const z of [.06,.89])box(x,0,z,.025,.967,.05);
 }else if(id==='desk'&&v===5){
  const white='#f7f6f0',steel='#dfdfda';
  for(const x of [.05,.88]){
   box(x,0,.10,.07,.027,.86,white);box(x+.008,.027,.40,.054,.30,.11,white);
   box(x+.014,.327,.409,.042,.15,.092,steel);
  }
  box(.08,.13,.41,.84,.035,.06,white);box(.06,.45,.34,.88,.04,.12,steel);
  box(.01,.49,0,.98,.018,.35,white);box(.01,.49,.35,.24,.018,.65,white);
  box(.255,.49,.353,.735,.018,.647,white);box(.43,.509,.92,.28,.008,.017,steel);
  box(.10,.437,.24,.80,.048,.68,white);
  for(const x of [.025,.958])box(x,.508,.015,.017,.492,.31,white);
  box(.042,.946,.015,.916,.014,.31,white);box(.042,.512,.015,.916,.43,.014,white);
  box(.042,.635,.03,.39,.014,.287,white);box(.63,.705,.03,.328,.014,.287,white);
  for(let j=0;j<3;j++)for(let i=0;i<19;i++)box(.09+i*.044,.75+j*.034,.03,.009,.006,.002,'#a9aaa4');
  box(.95,.43,.48,.044,.014,.018,steel);box(.983,.405,.48,.016,.03,.018,white);
 }else if(id==='desk'){
  const desk=v===1?800/1100:1000/1300, height=720/(v===1?850:1250);
  box(0,height-.025,0,desk,.025,1,v===1?cream:oak);
  for(const x of [.02,desk-.045])for(const z of [.05,.91])box(x,0,z,.025,height-.025,.035);
  rack(desk,0,0,1-desk,1,v===1?.5:.75,v===1?2:4,1);
 }else if(id==='bed'){
  const head=v===1?.10:.023;
  box(.015,.025,head,.97,.27,1-head,oak);
  box(.025,.295,head,.95,.17,.975-head);
  box(.03,.465,.42,.94,.04,.54,v===1?mint:'#cdb2ae');
  box(.18,.469,head+.02,.64,.055,.125,'#eadac7');
  if(v===1)rack(0,0,0,1,1,head,2,2);
  else{box(0,0,.015,.032,1,.97,oak);box(0,0,0,1,.85,.023,oak);box(0,0,.977,1,.57,.023,oak)}
 }else if(id==='wardrobe'){
  if(v===1){box(0,0,0,1,1,.96,oak);box(.02,.025,.96,.96,.95,.028);box(.82,.37,.988,.035,.25,.012,metal)}
  else{rack(0,0,0,1,1,1,1,1);box(0,.20,0,1,.024,1,oak);box(.02,.86,.48,.96,.025,.035,metal)}
 }else if(id==='shelf'){rack(0,0,0,1,1,1,v===1?2:5,v===1?2:1)}
 else{
  const top=v===1?.60:.52;
  box(0,top,0,1,.035,1,oak);
  for(const x of [.03,.93])for(const z of [.07,.9])box(x,0,z,.035,top,.04,oak);
  if(v===1)box(.04,top-.13,.06,.92,.13,.90);else for(let i=0;i<3;i++)box(.66,.012+i*.17,.06,.32,.16,.92);
  box(.07,top+.033,0,v===1?.86:.72,1-top-.033,.045,oak);
  box(.10,top+.065,.045,v===1?.80:.66,1-top-.10,.012,'#adbfbd');
 }
 return parts;
}
function variantSvg(id,v,iso=false){
 if(modelShape(id,v)===0&&iso&&!choices[id][v]?.style)return furnitureIcon(id);
 const p=choices[id][v],scale=72/Math.max(p.w,p.d,p.h);
 const proj=(x,y,z)=>[51+(x*p.w*.84-z*p.d*.68)*scale,70+((x*p.w+z*p.d)*.28-y*p.h)*scale];
 const parts=variantParts(id,v).sort((a,b)=>iso?(a.x+a.z+a.y)-(b.x+b.z+b.y):a.y+a.h-b.y-b.h);
 if(!iso)return parts.map(b=>'<rect x="'+b.x+'" y="'+b.z+'" width="'+b.w+'" height="'+b.d+'" fill="'+b.c+'" stroke="#928977" stroke-width=".003"/>').join('');
 const facet=(points,c)=>'<polygon points="'+points.map(a=>proj(...a).join(',')).join(' ')+'" fill="'+c+'" stroke="#9a9384" stroke-width=".6"/>';
 let svg='';
 for(const {x,y,z,w,h,d,c} of parts){const X=x+w,Y=y+h,Z=z+d;svg+=facet([[x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z]],c)+facet([[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],c)+facet([[X,y,z],[X,y,Z],[X,Y,Z],[X,Y,z]],c)}
 return '<svg viewBox="-8 -8 135 112" aria-hidden="true">'+svg+'</svg>';
}
