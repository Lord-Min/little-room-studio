(() => {
  const library = new URL('./vendor/three.module.min.js', document.currentScript?.src || location.href).href;
  let generation = 0, cleanup;
  window.stopWalk = () => { generation++; cleanup?.(); cleanup = null; };
  window.startWalk = async (container, items) => {
    window.stopWalk();
    const token = generation;
    const host = document.createElement('div');
    host.style.cssText = 'position:relative;width:100%;height:100%;min-height:300px;overflow:hidden;touch-action:none;background:#eee9df';
    container.append(host);
    cleanup = () => host.remove();
    try {
      const T = await import(library);
      if (token !== generation) return;
      const renderer = new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.8));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.14;
      const canvas = renderer.domElement;
      canvas.tabIndex = 0;
      canvas.setAttribute('aria-label','아이 방 3D 보기. 마우스로 시선을 움직이고 WASD로 이동하세요.');
      canvas.style.cssText = 'display:block;width:100%;height:100%;outline:none;cursor:grab';
      host.append(canvas);
      const world = new T.Scene();
      world.background = new T.Color(0xe0e8e8);
      const camera = new T.PerspectiveCamera(72,1,.035,12);
      camera.rotation.order = 'YXZ';
      const geometry = new T.BoxGeometry();
      const materials = new Map();
      const material = color => {
        if (typeof color === 'object') return color;
        if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color,roughness:.82}));
        return materials.get(color);
      };
      function box(parent,x,y,z,w,h,d,color) {
        const mesh = new T.Mesh(geometry,material(color));
        mesh.position.set(x,y,z); mesh.scale.set(w,h,d);
        mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
        return mesh;
      }
      function oval(parent,x,y,z,w,h,d,color) {
        const mesh = new T.Mesh(new T.SphereGeometry(1,28,16),material(color));
        mesh.position.set(x,y,z); mesh.scale.set(w/2,h/2,d/2);
        mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
        return mesh;
      }
      const wood = '#cfa97f', white = '#f6f2ea', linen = '#d3b7a5';
      const floor = document.createElement('canvas'); floor.width=512; floor.height=1024;
      const ctx = floor.getContext('2d');
      let seed = 227;
      const rand = () => ((seed = (Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
      for(let p=0;p<8;p++) {
        for(let q=-1;q<3;q++) {
          const x=p*64,y=q*512+(p%2)*256;
          ctx.fillStyle='hsl(33 34% '+(69+rand()*8)+'%)'; ctx.fillRect(x,y,64,512);
          ctx.strokeStyle='rgba(106,77,43,.20)'; ctx.strokeRect(x+.5,y+.5,63,511);
          for(let i=0;i<47;i++) {
            const a=x+2+rand()*60,b=y+rand()*512,len=10+rand()*160;
            ctx.strokeStyle='rgba(103,70,37,'+(.025+rand()*.055)+')';ctx.beginPath();ctx.moveTo(a,b);
            ctx.bezierCurveTo(a+.8,b+len*.3,a-1,b+len*.7,a,b+len);ctx.stroke();
          }
        }
      }
      const texture=new T.CanvasTexture(floor);texture.colorSpace=T.SRGBColorSpace;
      texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      const floorMat=new T.MeshStandardMaterial({map:texture,roughness:.83});
      const w=room.width/1000,d=room.depth/1000,c=w/2, door=room.rightDoor?w-.45:.45;
      const solid=room.rightDoor?(w-.9)/2:(w+.9)/2;
      const ground=new T.Mesh(new T.PlaneGeometry(w,d),floorMat);
      ground.rotation.x=-Math.PI/2;ground.position.set(c,.001,d/2);ground.receiveShadow=true;world.add(ground);
      const wall='#f2ede2', trim='#ebe7da';
      const block=(...args)=>box(world,...args);
      block(-.03,1.15,d/2,.06,2.3,d,wall);
      block(w+.03,1.15,d/2,.06,2.3,d,wall);
      block(c,2.33,d/2,w+.06,.06,d+.06,'#fcfaf0');
      block(c,.105,-.03,w,.21,.06,wall);
      block(c,2.19,-.03,w,.22,.06,wall);
      block((c-1.09)/2,1.14,-.03,c-1.09,1.87,.06,wall);block(w-(c-1.09)/2,1.14,-.03,c-1.09,1.87,.06,wall);
      // The frosted balcony glazing keeps the daylight diffuse.
      const glass=new T.MeshStandardMaterial({color:'#d6e1da',emissive:'#b2c4c3',emissiveIntensity:.28,roughness:.35});
      block(c,1.146,-.041,2.2,1.86,.024,glass);
      for(const x of [c-1.082,c,c+1.082]) block(x,1.144,.004,.044,1.87,.065,white);
      for(const y of [.21,2.078]) block(c,y,.005,2.21,.048,.07,white);
      block(c,.184,.034,2.27,.032,.12,wood);
      block(c-.04,1.08,.045,.013,.15,.021,'#958e80');
      block(solid,1.15,d+.03,w-.9,2.3,.06,wall);
      block(door,2.19,d+.03,.9,.22,.06,wall);
      block(door,1.03,d+.032,.88,2.06,.045,'#d6c2a8');
      for(const x of [door-.432,door+.434]) block(x,1.04,d-.008,.032,2.08,.042,trim);
      block(door,2.075,d-.008,.9,.042,.042,trim);
      block(door+(room.rightDoor?-.325:.325),1.0,d-.022,.09,.018,.046,'#756f66');
      for(const x of [.01,w-.01]) block(x,.041,d/2,.02,.082,d,trim);
      block(solid,.041,d-.009,w-.9,.082,.018,trim);
      block(c,2.284,d/2,.42,.024,.42,'#fffcf2');
      function furnish(item) {
        const g=new T.Group();world.add(g);
        g.position.set(item.x/1000,0,item.z/1000);g.rotation.y=-(item.rot||0)*Math.PI/180;
        let w=item.w/1000,d=item.d/1000;const h=item.h/1000;
        const b=(...args)=>box(g,...args),o=(...args)=>oval(g,...args);
        if(modelShape(item.id,item.variant)||choices[item.id][0].style){
          for(const p of variantParts(item.id,item.variant||0)) b((p.x+p.w/2-.5)*w,(p.y+p.h/2)*h,(p.z+p.d/2-.5)*d,p.w*w,p.h*h,p.d*d,p.c);
        } else if(item.id==='bed'){
          if(w>d) { [w,d]=[d,w];g.rotation.y-=Math.PI/2; }
          const base=Math.min(.303,h*.39),top=base+Math.min(.15,h*.19);
          b(0,.055,0,w*.93,.11,d*.96,'#c5b9aa');b(0,(base+.09)/2,0,w,base-.09,d,white);
          const side=-1; for(const z of [-.319,0,.319]){
            b(side*w*.503,base-.137,z*d,.009,Math.min(.274,base*.91),d*.31,'#eae5dc');
            b(side*w*.51,base*.78,z*d,.012,.012,.095,'#b8afa4');
          }
          b(0,(base+top)/2,0,w*.96,top-base,d*.965,'#fffbf1');
          b(0,h/2,-d/2+.009,w,h,.018,white);
          b(0,top*.51,d*.486,w,top*1.02,d*.028,white);
          b(0,top+.022,d*.14,w*.97,.044,d*.63,'#d1a9a4');
          b(0,top+.052,-d*.135,w*.96,.022,d*.09,'#e2c5bc');
          o(0,top+.065,-d*.345,w*.67,.125,d*.19,'#f6e7d5');
          const railX=-w*.475;
          const rail=Math.max(top+.08,h*.88);
          for(const z of [-.41,.085]) b(railX,(base+rail)/2,d*z,.045,rail-base,.045,white);
          for(const y of [rail-.025,(rail+top)/2]) b(railX,y,-d*.16,.046,.048,d*.52,white);
        } else if(item.id==='desk'){
          // Coordinates follow the manufacturer's front elevation and side profile.
          const part=(x,y,z,width,height,depth,color=white)=>b(x*w/1200,y*h/1736,(z-440)*d/880,width*w/1200,height*h/1736,depth*d/880,color);
          const back='#e1dbce', edge='#dbd0ba';
          part(0,868,8,1200,1736,16,back);
          for(const x of [-589,589]) part(x,868,145,22,1736,290);
          for(const y of [28,345,660,815,1199,1376,1725]) part(0,y,145,1160,18,290);
          part(0,338,145,18,620,290);
          for(const x of [-300,300]) part(x,1556,300,597,360,20);
          part(0,1362,251,748,10,34,'#fff1c4');
          part(0,1006,20,1156,359,14,'#cec7b9');
          for(const x of [-420,420]) part(x,790,218,210,34,105);
          part(0,709,585,1180,10,590,edge);
          part(0,717,585,1179,6,589);
          for(const x of [-505,505]){
            part(x,22,585,64,32,585);
            part(x,225,585,64,384,75);
            part(x,549,585,52,276,63,'#dddcd8');
            part(x,693,585,64,21,505);
          }
          part(0,677,585,1025,42,51);
          part(422,699,854,83,15,35,'#50534f');
        } else if(item.id==='wardrobe'){
          b(0,h/2,0,w,h,d,'#dac8af');
          for(const s of [-1,1]) { b(s*w*.249,h*.505,d*.486,w*.485,h*.97,d*.03,white);b(s*w*.05,h*.51,d*.515,.015,.14,.027,wood); }
        } else if(item.id==='shelf'){
          b(0,h/2,-d*.47,w,h,.025,'#e2d4bd');
          for(const x of [-1,1]) b(x*(w/2-.013),h/2,0,.026,h,d,wood);
          for(let i=0;i<=3;i++) b(0,.016+(h-.032)*i/3,0,w,.032,d,wood);
          for(let j=0;j<3;j++) for(let i=0;i<4;i++) b(-w*.31+i*.038,j*(h-.032)/3+.046+h*.085,0,.033,h*.17,d*.65,['#adbdad',linen,'#d7cba6','#a4b3ba'][i]);
        } else {
          const table=h*.55;b(0,table,0,w,.055,d,white);
          for(const s of [-1,1])for(const t of [-1,1]) b(s*w*.43,table/2,t*d*.4,.03,table,.03,wood);
          o(0,table+(h-table)*.5,-d*.39,w*.67,h-table,.036,wood);
          o(0,table+(h-table)*.5,-d*.36,w*.62,(h-table)*.92,.02,'#b3c4c4');
        }
      }
      items.forEach(furnish);
      // Trim coincident outward-facing box surfaces once at scene creation.
      // Later parts (doors, trim, laminates) own the shared patch.
      function trimSharedFaces(parent){
        const boxes=parent.children.filter(child=>child.geometry===geometry);
        const coords=['x','y','z'];
        const bounds=boxes.map(mesh=>coords.map(axis=>[
          mesh.position[axis]-mesh.scale[axis]/2,mesh.position[axis]+mesh.scale[axis]/2
        ]));
        const epsilon=1e-7;
        boxes.forEach((mesh,i)=>{
          const verts=[],normals=[],limits=bounds[i];
          let changed=false;
          for(let axis=0;axis<3;axis++)for(let side=0;side<2;side++){
            const u=(axis+1)%3,v=(axis+2)%3,height=limits[axis][side];
            let patches=[[...limits[u],...limits[v]]];
            for(let j=i+1;j<boxes.length;j++){
              const other=bounds[j];
              if(Math.abs(other[axis][side]-height)>epsilon)continue;
              const next=[];
              for(const patch of patches){
                const [l,r,b,t]=patch;
                const left=Math.max(l,other[u][0]),right=Math.min(r,other[u][1]);
                const bottom=Math.max(b,other[v][0]),top=Math.min(t,other[v][1]);
                if(right-left<=epsilon||top-bottom<=epsilon){next.push(patch);continue}
                changed=true;
                if(left-l>epsilon)next.push([l,left,b,t]);
                if(r-right>epsilon)next.push([right,r,b,t]);
                if(bottom-b>epsilon)next.push([left,right,b,bottom]);
                if(t-top>epsilon)next.push([left,right,top,t]);
              }
              patches=next;
            }
            for(const [l,r,b,t] of patches){
              const corners=[[l,b],[r,b],[r,t],[l,t]];
              for(const k of (side?[0,1,2,0,2,3]:[0,2,1,0,3,2])){
                const pos=[],normal=[0,0,0];
                pos[axis]=side-.5;
                pos[u]=(corners[k][0]-mesh.position[coords[u]])/mesh.scale[coords[u]];
                pos[v]=(corners[k][1]-mesh.position[coords[v]])/mesh.scale[coords[v]];
                normal[axis]=side?1:-1;verts.push(...pos);normals.push(...normal);
              }
            }
          }
          if(changed){
            const trimmed=new T.BufferGeometry();
            trimmed.setAttribute('position',new T.Float32BufferAttribute(verts,3));
            trimmed.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
            mesh.geometry=trimmed;mesh.visible=verts.length>0;
          }
        });
      }
      trimSharedFaces(world);
      world.children.filter(child=>child.isGroup).forEach(trimSharedFaces);
      world.add(new T.HemisphereLight(0xfff7e8,0xcebcaa,2.1));
      const sun=new T.DirectionalLight(0xffedcd,2.05);
      sun.position.set(.3,2.04,.13);sun.target.position.set(1.7,.08,2.48);
      sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
      Object.assign(sun.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:.05,far:6});
      sun.shadow.bias=-.00055;sun.shadow.normalBias=.003;sun.shadow.radius=3;
      world.add(sun,sun.target);
      const fill=new T.PointLight(0xfff6e8,5,6,2);fill.position.set(1.5,2.02,2.1);world.add(fill);
      const obstacles=items.map(i=>({x:i.x/1000,z:i.z/1000,w:i.w/2000,d:i.d/2000,r:(i.rot||0)*Math.PI/180}));
      const free=(x,z)=>x>=.1&&x<=w-.1&&z>=.1&&z<=d-.1&&!obstacles.some(o=>{
        const dx=x-o.x,dz=z-o.z,c=Math.cos(o.r),s=Math.sin(o.r);
        return Math.abs(c*dx+s*dz)<o.w+.105&&Math.abs(-s*dx+c*dz)<o.d+.105;
      });
      let spawn=[door,d-.23];
      if(!free(...spawn)) {
        outer:for(let z=d-.15;z>=.1;z-=.12)for(let x=.14;x<=w-.1;x+=.12)if(free(x,z)){spawn=[x,z];break outer;}
      }
      camera.position.set(spawn[0],1.2,spawn[1]);camera.rotation.set(-.185,-.32,0,'YXZ');
      const bar=document.createElement('div');
      bar.style.cssText='position:absolute;top:14px;left:50%;transform:translateX(-50%);padding:8px 13px;border-radius:18px;background:#26352eda;color:white;font:12px/1.4 system-ui;text-align:center;max-width:90%;width:max-content;pointer-events:none';
      bar.textContent=matchMedia('(pointer: coarse)').matches?'드래그로 시선 회전 · 두 손가락 확대 · 화살표로 이동':'W A S D 이동 · 클릭 후 마우스로 둘러보기 · Esc 해제 · 눈높이 120 cm';host.append(bar);
      const keys=new Set(), events=new AbortController(),opt={signal:events.signal};
      const listen=(el,type,fn)=>el.addEventListener(type,fn,opt);
      const mapping={KeyW:'w',ArrowUp:'w',KeyA:'a',ArrowLeft:'a',KeyS:'s',ArrowDown:'s',KeyD:'d',ArrowRight:'d'};
      listen(window,'keydown',e=>{if(mapping[e.code]&&(document.activeElement===canvas||document.pointerLockElement===canvas)){e.preventDefault();keys.add(mapping[e.code]);}});
      listen(window,'keyup',e=>keys.delete(mapping[e.code]));
      listen(window,'blur',()=>keys.clear());
      const turn=(x,y)=>{camera.rotation.y-=x*.0028;camera.rotation.x=Math.min(1.37,Math.max(-1.37,camera.rotation.x-y*.0028));};
      const contacts=new Map();
      const span=()=>{const [a,b]=contacts.values();return Math.hypot(a.x-b.x,a.y-b.y)};
      const clearInput=()=>{contacts.clear();keys.clear()};
      listen(window,'blur',clearInput);
      listen(document,'visibilitychange',()=>{if(document.hidden)clearInput()});
      listen(canvas,'pointerdown',e=>{canvas.focus({preventScroll:true});contacts.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);
        if(e.pointerType==='mouse'&&!document.pointerLockElement){try{canvas.requestPointerLock?.()?.catch?.(()=>{});}catch{}}
      });
      listen(document,'mousemove',e=>{if(document.pointerLockElement===canvas)turn(e.movementX,e.movementY);});
      listen(canvas,'pointermove',e=>{
        const previous=contacts.get(e.pointerId);
        if(!previous||document.pointerLockElement)return;
        const before=contacts.size===2?span():0;
        contacts.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(contacts.size===1)turn(e.clientX-previous.x,e.clientY-previous.y);
        else if(before>2&&span()>2){
          camera.fov=Math.max(40,Math.min(90,2*Math.atan(Math.tan(camera.fov*Math.PI/360)*before/span())*180/Math.PI));
          camera.updateProjectionMatrix();
        }
      });
      for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(canvas,type,e=>contacts.delete(e.pointerId));
      listen(document,'pointerlockchange',clearInput);
      if(navigator.maxTouchPoints>0||matchMedia('(any-pointer: coarse)').matches){
        const pad=document.createElement('div');pad.style.cssText='position:absolute;bottom:18px;left:16px;display:grid;grid-template-columns:repeat(3,46px);gap:4px';
        for(const [key,label,col,row] of [['w','↑',2,1],['a','←',1,2],['s','↓',2,2],['d','→',3,2]]){
          const btn=document.createElement('button');btn.textContent=label;btn.setAttribute('aria-label',{w:'앞으로',a:'왼쪽',s:'뒤로',d:'오른쪽'}[key]);
          btn.style.cssText='grid-column:'+col+';grid-row:'+row+';color:white;background:#26352ed9;border:1px solid #ffffff70;border-radius:10px;height:46px;font-size:20px;touch-action:none';
          listen(btn,'pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);keys.add(key);});
          for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(btn,type,()=>keys.delete(key));pad.append(btn);
        }host.append(pad);
      }
      const size=()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}};
      const observer=new ResizeObserver(size);observer.observe(host);size();
      let frame=0,last=performance.now();
      function update(now){
        const dt=Math.min((now-last)/1000,.06);last=now;
        const f=Number(keys.has('w'))-Number(keys.has('s')),s=Number(keys.has('d'))-Number(keys.has('a'));
        const length=Math.hypot(f,s)||1, step=.95*dt/length, yaw=camera.rotation.y;
        const x=camera.position.x+(s*Math.cos(yaw)-f*Math.sin(yaw))*step,z=camera.position.z+(-s*Math.sin(yaw)-f*Math.cos(yaw))*step;
        if(free(x,camera.position.z))camera.position.x=x;
        if(free(camera.position.x,z))camera.position.z=z;
        renderer.render(world,camera);frame=requestAnimationFrame(update);
      }
      cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();events.abort();if(document.pointerLockElement===canvas)document.exitPointerLock();
        const geoms=new Set(),mats=new Set();
        world.traverse(n=>{if(n.geometry)geoms.add(n.geometry);if(n.material)mats.add(n.material);});
        geoms.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());texture.dispose();sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();host.remove();
      };
      canvas.focus({preventScroll:true});update(last);
    }catch(error){
      if(token!==generation)return;
      host.textContent='이 기기에서 3D 화면을 열 수 없습니다. 브라우저의 하드웨어 가속을 켜고 다시 시도해 주세요.';
      console.error('3D room renderer',error);
    }
  };
})();
