/* ---------- world library ----------
   Ready-made 3D worlds. Each WORLDS.name(options) returns the world half of a scene
   (cams, build, tags and framing). Spread it FIRST, then add your own text, so your fields win:

     SC.push({...WORLDS.gyro({labels:['Plan','Build','Measure','Learn']}),
              id:'cycle', title:'The cycle', kind:4,
              beats:[{dur:2.4,note:'...'},{dur:2,note:'...'}],
              layers:[{b:[0,1],z:'tl',h:'<p class="eb">How we work</p><h2>The cycle</h2>'}]});

   Options every world takes:
     labels:[...]  replace the text of the world's 3D labels, in order (null hides one, HTML allowed)
     tags:[...]    replace the labels entirely with your own tag objects
     over:{...}    override any world field (cams, shift, bloom, drift ...)
   A world animates over as many beats as you give the scene, up to the number it was designed for
   (listed in references/worlds.md). To change a world's geometry, copy its code into your scene file and edit it. */
const WORLDS={};
const finish=(w,o)=>{ if(o.tags) w.tags=o.tags; else if(o.labels&&w.tags) w.tags=w.tags.map((t,i)=>o.labels[i]===undefined?t:o.labels[i]===null?null:Object.assign({},t,{h:/</.test(o.labels[i])?o.labels[i]:'<p class="lab hi">'+o.labels[i]+'</p>'})).filter(Boolean);
  delete w.title; delete w.beats; delete w.layers; delete w.frame; return w; };

/* sea: a bay with islands and a lighthouse. {sunrise:true} starts before dawn and the sun comes up over beats 0-1; otherwise a night eclipse. 2 beats. */
function seaWorld(close){ return ({scene})=>{ const env=K.env(scene,close?'predawn':'eclipse',{amp:close?.8:1,fog:.0009});
  [[-250,-620,160,62,3],[340,-780,230,95,8],[90,-1500,320,125,5],[-640,-1150,270,75,11]].forEach(a=>scene.add(K.island(...a)));
  const r=RNG(7), rocks=K.inst(new THREE.IcosahedronGeometry(1,1),K.std(0x34363e,{roughness:1,flatShading:true}),40);
  for(let i=0;i<40;i++){ const a=r()*3.1416, d=40+r()*220, s=.6+Math.pow(r(),3)*3.4; setI(rocks,i,Math.cos(a)*d+30,-s*.15,-Math.sin(a)*d-20,s*1.5,s*(.3+r()*.4),s,r()*3,r()*3,r()*3); } scene.add(rocks);
  const lh=new THREE.Group(); lh.position.set(74,0,-150); const mound=new THREE.Mesh(new THREE.IcosahedronGeometry(11,1),K.std(0x1a1c22,{roughness:1,flatShading:true})); mound.scale.y=.42; lh.add(mound);
  const tw=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.7,15,14),K.std(0xcfc8bc,{roughness:.8})); tw.position.y=11; lh.add(tw);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(1.42,1.52,2.4,14),K.std(0x7a2a14,{roughness:.8})); band.position.y=10; lh.add(band);
  const room=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,1.8,10),K.glow(0xffd9a0,5)); room.position.y=19.4; lh.add(room);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(1.6,1.6,10),K.std(0x22242a,{roughness:.7})); cap.position.y=21.1; lh.add(cap);
  const lamp=K.sprite(0xffd9a0,1.2,14); lamp.position.y=19.4; lh.add(lamp);
  const beams=new THREE.Group(); beams.position.y=19.4; for(const sgn of [1,-1]){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.3,4.5,260,20,1,true),new THREE.MeshBasicMaterial({color:hdr(0xffd9a0,.028),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); b.rotation.z=Math.PI/2*sgn; b.position.x=-130*sgn; beams.add(b); } lh.add(beams);
  const pl=new THREE.PointLight(L(0xffc890),1.5,120,1.5); pl.position.y=19.4; lh.add(pl); scene.add(lh);
  const N=160, bp=new Float32Array(N*3), bs=new Float32Array(N*3); for(let i=0;i<N*3;i++) bs[i]=r(); const mist=K.points(bp,hdr(0x9ab0ff,.5),1.6,.25); scene.add(mist);
  return {env,update(st){ beams.rotation.y=st.T*.35; for(let i=0;i<N;i++){ bp[i*3]=(bs[i*3]-.5)*260+Math.sin(st.T*.1+i)*6; bp[i*3+1]=.6+bs[i*3+1]*3+Math.sin(st.T*.5+i)*.4; bp[i*3+2]=-bs[i*3+2]*220; } mist.geometry.attributes.position.needsUpdate=true;
    if(close) env.blend('dawn',clamp01(st.P[0]*.3+st.P[1]*.7),[0,.11,-.99]); else env.U.uSkyP.value.w=1+st.P[1]*.6; }}; }; }
WORLDS.sea=(o={})=>finish(Object.assign({shift:.2,bloom:1,drift:.25,far:6000,scrimS:!!o.sunrise,cams:o.sunrise?[{p:[0,2.4,60],l:[0,9,0],f:40},{p:[0,2.6,54],l:[0,9,0],f:40},{p:[0,3,48],l:[0,8,0],f:40}]:[{p:[0,2.4,60],l:[0,13,0],f:40},{p:[0,2.8,54],l:[0,14,0],f:40},{p:[0,3.4,46],l:[0,15,0],f:40}],build:seaWorld(!!o.sunrise)},o.over||{}),o);

/* pages: a storm of loose pages over a moonlit sea; they catch fire on beat 1. For quotations. 3 beats. */
WORLDS.pages=(o={})=>{ 
return finish(Object.assign({scrim:true,far:6000,fog:[INK,.0],cams:[{p:[0,2,34],l:[0,2,0],f:42},{p:[0,2,30],l:[0,2,0],f:42},{p:[0,2.5,25],l:[0,3,0],f:42},{p:[0,3,22],l:[0,3,0],f:42}],drift:.25,bloom:1,
 build({scene}){ const env=K.env(scene,'night',{amp:.8,level:-17,fog:.0008,sun:[.5,.36,-.79],sunI:.6,sunC:0xc8d6ff,sunR:.028}); [[-260,-700,200,80,3],[380,-900,260,110,8]].forEach(a=>{ const m=K.island(...a); m.position.y=-17; scene.add(m); });
  const r=RNG(11), N=1000, geo=new THREE.PlaneGeometry(1.7,2.3,8,1), S=new Float32Array(N*4);
  const mat=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uT:{value:0},uBurn:{value:0}},
   vertexShader:`attribute vec4 aS; uniform float uT; varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vSeed;
    void main(){ vUv=uv; vSeed=aS.x; float a=uT*(.12+aS.y*.45)+aS.x*6.28, b=uT*(.08+aS.z*.35)+aS.w*6.28; vec3 p=position; p.z+=sin(p.x*2.2+a*2.)*.10;
     float ca=cos(a),sa=sin(a),cb=cos(b),sb=sin(b); mat3 R=mat3(ca,0.,-sa,0.,1.,0.,sa,0.,ca)*mat3(1.,0.,0.,0.,cb,sb,0.,-sb,cb); p=R*p; vN=R*vec3(0.,0.,1.);
     vec4 w=modelMatrix*instanceMatrix*vec4(p,1.); w.y+=sin(uT*.22+aS.x*40.)*.9; w.x+=sin(uT*.13+aS.w*30.)*.6; vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
   fragmentShader:NZ+`uniform float uBurn; varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying float vSeed;
    void main(){ vec3 n=normalize(vN); vec3 Lp=vec3(7.,11.,10.); vec3 l=Lp-vW; float d2=dot(l,l); float d=abs(dot(n,normalize(l))); float att=1./(1.+d2*.006);
     float row=floor(vUv.y*16.); float rule=smoothstep(.0,.03,.46-abs(fract(vUv.y*16.)-.5))*0.+step(abs(fract(vUv.y*16.)-.5),.16)*step(.12,vUv.x)*step(vUv.x,.2+.68*hash(vec2(row,vSeed*91.)))*step(1.,row)*step(row,14.);
     vec3 c=vec3(.80,.74,.62)*(.02+d*att*.55); c*=1.-rule*.55;
     float dist=length(vW.xz-vec2(0.,6.)); float burn=smoothstep(uBurn,uBurn-10.,dist)*step(.01,uBurn);
     float e=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)); float edge=smoothstep(.16,0.,e-noise(vUv*8.+vSeed*20.)*.14);
     c=mix(c,c*.25,edge*burn)+vec3(1.,.24,.05)*edge*burn*1.5*(.5+.5*noise(vUv*14.+vSeed*7.));
     float fd=length(cameraPosition-vW); c=mix(vec3(.004,.007,.016),c,exp(-fd*.018));
     gl_FragColor=vec4(c,1.); }`});
  const mesh=K.inst(geo,mat,N);
  for(let i=0;i<N;i++){ let x=(r()-.5)*90, y=(r()-.5)*36+3, z=-75+r()*104; if(Math.abs(x)<11&&z>-6) x+=x<0?-12:12; setI(mesh,i,x,y,z,.7+r()*1.2); S[i*4]=r(); S[i*4+1]=r(); S[i*4+2]=r(); S[i*4+3]=r(); }
  geo.setAttribute('aS',new THREE.InstancedBufferAttribute(S,4)); scene.add(mesh);
  const lamp=K.sprite(0xffd9a0,.5,22); lamp.position.set(7,11,10); scene.add(lamp);
  const E=600, ep=new Float32Array(E*3), es=new Float32Array(E*4); for(let i=0;i<E;i++){ es[i*4]=(r()-.5)*70; es[i*4+1]=r(); es[i*4+2]=-50+r()*70; es[i*4+3]=.5+r(); }
  const emb=K.points(ep,hdr(EMBER,3),.28,0); scene.add(emb);
  return {env,update(st){ mat.uniforms.uT.value=st.T; mat.uniforms.uBurn.value=st.P[1]*70; emb.material.opacity=st.P[1]*.6;
    for(let i=0;i<E;i++){ const k=(es[i*4+1]+st.T*.05*es[i*4+3])%1; ep[i*3]=es[i*4]+Math.sin(st.T*.6+i)*1.2; ep[i*3+1]=-14+k*40; ep[i*3+2]=es[i*4+2]; } emb.geometry.attributes.position.needsUpdate=true; }}; }},o.over||{}),o);
};

/* planet: a planet whose night side fills with light over 4 beats, then gains a ring. 4 beats. */
WORLDS.planet=(o={})=>{ 
return finish(Object.assign({shift:.2,bloom:1.1,cams:[{p:[0,8,78],l:[0,0,0],f:34},{p:[-7,6,62],l:[0,0,0],f:34},{p:[4,4,58],l:[0,0,0],f:34},{p:[11,0,54],l:[0,0,0],f:34},{p:[3,13,64],l:[0,0,0],f:34}],drift:.3,
 build({scene}){ scene.add(K.stars(1800,900,5)); const sunDir=V3(.82,.36,-.44).normalize();
  const neb=new THREE.Mesh(new THREE.SphereGeometry(860,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
   fragmentShader:NZ+`varying vec3 vD; void main(){ vec3 d=normalize(vD); vec2 s=d.xy*2.2+d.z*vec2(1.3,.7); float n=fbm(s+fbm(s*1.7)*1.2); float band=exp(-pow((d.y*.9+d.x*.45+.12)*3.2,2.));
     vec3 c=vec3(1.,.30,.08)*.05*smoothstep(.42,.85,n)*(.35+band)+vec3(.12,.30,1.)*.05*smoothstep(.5,.9,fbm(s*1.9+7.))*(.3+band)+vec3(.6,.55,.7)*band*.022*(.5+fbm(s*6.));
     vec2 g=vec2(atan(d.z,d.x),d.y)*260.; vec2 id=floor(g); c+=band*step(.93,hash(id))*smoothstep(.3,0.,length(fract(g)-.5))*.5; gl_FragColor=vec4(c,1.); }`})); neb.renderOrder=-900; scene.add(neb);
  const sunS=K.sprite(0xfff0d8,3,150); sunS.position.copy(sunDir).multiplyScalar(700); scene.add(sunS); const sunC=K.sprite(0xffffff,9,26); sunC.position.copy(sunDir).multiplyScalar(700); scene.add(sunC);
  const mat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uP:{value:new THREE.Vector4()},uSun:{value:sunDir}},
   vertexShader:'varying vec3 vO; varying vec3 vWN; varying vec3 vW; void main(){ vO=normalize(position); vWN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
   fragmentShader:NZ+`uniform float uT; uniform vec4 uP; uniform vec3 uSun; varying vec3 vO; varying vec3 vWN; varying vec3 vW;
    void main(){ vec3 m=vO; vec2 s=m.xy+m.z*vec2(.61,.37); float land=smoothstep(.47,.55,fbm(s*2.7+4.)); float pop=fbm(s*8.+11.);
     vec2 g=s*120.; vec2 id=floor(g); float h=hash(id); vec2 jf=vec2(hash(id+3.),hash(id+20.))-.5; float dd=length(fract(g)-.5-jf*.6); float dt=smoothstep(.26,.03,dd);
     float lit=land*(step(.992,h)*uP.x*(.6+.4*sin(uT*5.+h*90.))+step(.90,h)*smoothstep(.46,.60,pop)*uP.y+step(.42,h)*smoothstep(.40,.56,pop)*uP.z);
     float web=land*smoothstep(.03,0.,abs(fbm(s*12.+2.)-.5))*uP.z*.5; float all=uP.w*(.35+.65*pop);
     vec3 n=normalize(vWN); vec3 v=normalize(cameraPosition-vW); float day=max(dot(n,uSun),0.); float lim=pow(1.-max(dot(n,v),0.),3.);
     vec3 c=mix(vec3(.0012,.002,.008),vec3(.006,.005,.008),land)+vec3(.05,.12,.5)*lim*.25+mix(vec3(.03,.07,.18),vec3(.22,.17,.11),land)*pow(day,1.2)*1.6;
     float night=1.-smoothstep(0.,.25,day);
     c+=(vec3(1.,.50,.15)*dt*lit*4.5+vec3(1.,.14,.02)*web*1.6+mix(vec3(1.,.14,.02),vec3(1.,.72,.42),pop)*all*(dt*1.5+.10))*night;
     gl_FragColor=vec4(c,1.); }`});
  const planet=new THREE.Mesh(new THREE.SphereGeometry(10,96,64),mat); scene.add(planet);
  const atm=new THREE.Mesh(new THREE.SphereGeometry(10.9,64,48),new THREE.ShaderMaterial({side:THREE.BackSide,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,uniforms:{uK:{value:0}},
   vertexShader:'varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
   fragmentShader:'uniform float uK; varying vec3 vN; void main(){ float i=pow(clamp(.78+dot(vN,vec3(0.,0.,1.)),0.,1.),5.); gl_FragColor=vec4(mix(vec3(.10,.24,1.),vec3(1.,.16,.03),uK)*i*(1.6+uK*2.6),1.); }'})); scene.add(atm);
  const moon=new THREE.Mesh(new THREE.SphereGeometry(1.1,32,24),K.std(0x8a8690,{roughness:1})); scene.add(moon);
  const dl=new THREE.DirectionalLight(L(0xfff0dd),2.2); dl.position.copy(sunDir).multiplyScalar(100); scene.add(dl);
  const r=RNG(21), N=5200, a=new Float32Array(N*3); for(let i=0;i<N;i++){ const t=r()*6.283, d=14+Math.pow(r(),2)*9; a[i*3]=Math.cos(t)*d; a[i*3+1]=(r()-.5)*.35*(d-13); a[i*3+2]=Math.sin(t)*d; }
  const ring=K.points(a,hdr(0xffb070,2.2),.2,0), rg=new THREE.Group(); rg.add(ring); rg.rotation.set(.34,0,.2); scene.add(rg);
  const halo=K.sprite(EMBER,.0,64); scene.add(halo);
  return {update(st){ mat.uniforms.uT.value=st.T; mat.uniforms.uP.value.set(st.P[0],st.P[1],st.P[2],st.P[3]); planet.rotation.y=st.T*.03; atm.material.uniforms.uK.value=st.P[3];
    const ma=st.T*.07+1; moon.position.set(Math.cos(ma)*24,3+Math.sin(ma)*2,Math.sin(ma)*24); ring.material.opacity=st.P[3]*.9; ring.rotation.y=st.T*.05; halo.material.color.copy(hdr(EMBER,.5*st.P[3])); }}; }},o.over||{}),o);
};

/* monoliths: six monoliths in calm water that light up in pairs, with a label under each. 3 beats, 6 labels. */
WORLDS.monoliths=(o={})=>{ const MILE=[['2016','AlphaGo','Beats Lee Sedol four games to one at Go'],['2020','AlphaFold 2','Predicts protein structures to near lab accuracy'],['2022','ChatGPT','100 million users in about two months'],['2023','GPT-4','Passes the bar exam, writes working software'],['2024','Two Nobels','Physics and Chemistry prizes go to AI work'],['2025','Olympiad gold','Gold-medal scores at the Maths Olympiad']];
const MX=i=>i*9, MH=i=>4+2.3*i;
return finish(Object.assign({scrimS:true,fog:[0x0b0a12,.011],bloom:1,cams:[{p:[-12,2.2,18],l:[2,3,0],f:38},{p:[4,3.4,25],l:[4.5,4.2,0],f:38},{p:[22,4,27],l:[22.5,6.5,0],f:38},{p:[22.5,8,47],l:[22.5,5.2,0],f:44}],drift:.25,
 layers:[{b:[0,2],z:'tl',h:'<p class="eb">2016 – 2025</p><h2>Ten years of milestones</h2><p class="lede gap" data-b="2" style="max-width:620px">From a board game to the Nobel Prize in eight years.</p>'}],
 tags:MILE.map((m,i)=>({b:[i>>1,2],c:'w',d:(i%2)*380+500,at:()=>[MX(i),-2.6,3.2],h:`<h3>${m[0]}</h3><p class="lab hi" style="margin:6px 0 8px">${m[1]}</p><p class="lab" style="letter-spacing:0">${m[2]}</p>`})),
 build({scene}){ const env=K.env(scene,'blue',{amp:.2,fog:.0035}); [[-190,-520,170,70,4],[260,-700,240,110,9],[40,-1300,320,130,6],[-620,-1000,260,80,12]].forEach(a=>scene.add(K.island(...a)));
  const items=[]; for(let i=0;i<6;i++){ const h=MH(i), col=new THREE.Color().lerpColors(L(PAPER),L(EMBER),i/5), grp=new THREE.Group(); grp.position.x=MX(i);
    for(const sy of [1]){ const sub=new THREE.Group(); sub.scale.y=sy;
      const body=new THREE.Mesh(new THREE.BoxGeometry(2.4,h,2.4),K.std(0x121019,{roughness:.3,metalness:.6})); body.position.y=h/2; sub.add(body);
      const strip=new THREE.Mesh(new THREE.BoxGeometry(.3,h*.92,.06),new THREE.MeshBasicMaterial({color:0x000000})); strip.position.set(0,h/2,1.22); sub.add(strip);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(2.5,.08,2.5),new THREE.MeshBasicMaterial({color:0x000000})); cap.position.y=h+.04; sub.add(cap);
      const cone=new THREE.Mesh(new THREE.CylinderGeometry(.5,3.2,60,32,1,true),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); cone.position.y=h+30; cone.scale.y=-1; sub.add(cone);
      grp.add(sub); items.push({i,col,strip,cap,cone,refl:sy<0}); }
    const pl=new THREE.PointLight(col,0,30,1.8); pl.position.set(0,h*.7,6); grp.add(pl); items.push({i,pl}); scene.add(grp); }
  return {env,update(st){ for(const it of items){ const on=clamp01(st.P[it.i>>1]*2-(it.i%2)); if(it.pl){ it.pl.intensity=on*.9; continue; }
    const k=it.refl?.14:1; it.strip.material.color.copy(it.col).multiplyScalar(on*5*k); it.cap.material.color.copy(it.col).multiplyScalar(on*3*k); it.cone.material.color.copy(it.col).multiplyScalar(on*.018*k*(.85+.15*Math.sin(st.T*1.3+it.i))); } }}; }},o.over||{}),o);
};

/* stairs: a stone staircase out of the sea; steps light one by one, then ghost steps and three gates continue it. 3 beats, 9 labels (6 on steps, 3 on gates). */
WORLDS.stairs=(o={})=>{ 
const ST=(()=>{ const x=[0]; for(let i=0;i<22;i++) x.push(x[i]+(i<9?2.6:1.5)); return {x,run:i=>i<9?2.6:1.5,top:i=>[x[i]+ (i<9?1.3:.75),i+1,0]}; })();
return finish(Object.assign({scrimS:true,title:'A staircase of doublings',fog:[0x0a0912,.008],bloom:1,
 cams:[{p:[-10,1.6,14],l:[8,5,0],f:40},{p:[8,12,46],l:[16,6,0],f:40},{p:[33,13,27],l:[24,9.5,0],f:40},{p:[14,22,72],l:[25,14,0],f:40}],drift:.3,
 beats:[{dur:3.4,note:'METR measures how long a task can be, in human working time, before a model only finishes it half the time. Every step on this staircase is one doubling of that length. Thirteen steps took us from about two seconds with GPT-2 in 2019 to about five hours with Claude Opus 4.5 in late 2025.'},
        {dur:3,note:'The depth of each step is how long the doubling took. From 2019 to 2024 that was about seven months a step. Since 2024 it has been closer to four. Walk round to the side and you can see the stairs getting steeper.'},
        {dur:3.4,note:'Now keep climbing at that pace. Three more steps is a full work-week handed over as one task. Five is a month. Nine is a year. At four to seven months a step that is one to two, two to three, and three to five years out. This is arithmetic on a trend, not a forecast, and trends can bend either way.'}],
 layers:[{b:[0,2],z:'tl',h:'<p class="eb">The trend line</p><h2>The length of task AI can finish</h2>'},
         {b:[0,0],z:'free',s:'left:120px;top:300px;width:640px',h:'<p class="fig">13 doublings</p><p class="body">From two seconds to about five hours, 2019–2025. Each step is one doubling.</p>'},
         {b:[1,1],z:'free',s:'left:120px;top:300px;width:640px',h:'<p class="fig">~7 months <em>a step</em></p><p class="body">Since 2024, closer to four. The stairs are getting steeper.</p>'},
         {b:[2,2],z:'free',s:'left:120px;top:300px;width:640px',h:'<p class="fig">If the line holds</p><p class="body">Arithmetic on the trend at 4–7 months per step. Not a forecast.</p>'},
         {b:[0,2],z:'bc',h:'<p class="lab">Approximate values: METR time-horizon measurements, 50% success</p>'}],
 tags:[...[['GPT-2 · 2 sec',0],['GPT-3',2],['GPT-3.5',4],['GPT-4 · 5 min',7],['Claude 3.7 Sonnet · 1 hr',11]].map(([s,i],j)=>({b:[0,1],d:600+j*260,c:'r',at:()=>{ const t=ST.top(i); return [t[0]-.5,t[1]+1.6,3.6]; },h:`<p class="lab hi">${s}</p>`})),
       {b:[0,2],d:2200,c:'r',at:()=>{ const t=ST.top(12); return [t[0]-.5,t[1]+2.4,3.6]; },h:'<p class="lab em">Claude Opus 4.5 · ~5 hrs</p>'},
       ...[['A work-week','1–2 years out',15],['A work-month','2–3 years out',17],['A work-year','3–5 years out',21]].map(([s,w,i],j)=>({b:[2,2],d:1400+j*500,c:'r',at:()=>{ const t=ST.top(i); return [t[0]-3.6,t[1]+4.6,3.6]; },h:`<p class="lab em">${s} <span style="color:var(--dim)">· ${w}</span></p>`}))],
 build({scene}){ const env=K.env(scene,'dusk',{amp:.7,fog:.0014,sun:[-.62,.07,-.78]}); [[-190,-520,170,70,4],[260,-700,240,110,9],[40,-1300,320,130,6],[-620,-1000,260,80,12]].forEach(a=>scene.add(K.island(...a))); const fill=new THREE.DirectionalLight(L(0x8090ff),.4); fill.position.set(-20,40,60); scene.add(fill);
  const D=7, steps=[], body=K.std(0x5a5560,{roughness:.9,metalness:0});
  for(let i=0;i<13;i++){ const w=ST.run(i), h=i+1, m=new THREE.Mesh(new THREE.BoxGeometry(w,h,D),body); m.position.set(ST.x[i]+w/2,h/2,0); scene.add(m);
    const col=new THREE.Color().lerpColors(L(PAPER),L(EMBER),i/12), e=new THREE.Mesh(new THREE.BoxGeometry(w,.07,.07),new THREE.MeshBasicMaterial({color:0x000000})); e.position.set(ST.x[i]+w/2,h+.035,D/2); scene.add(e);
    const r2=new THREE.Mesh(new THREE.BoxGeometry(.07,1,.07),new THREE.MeshBasicMaterial({color:0x000000})); r2.position.set(ST.x[i],h-.5,D/2); scene.add(r2); steps.push({e,r2,col}); }
  const marks=[0,2,4,7,11,12].map((i,j)=>{ const t=ST.top(i), s=new THREE.Mesh(new THREE.SphereGeometry(.26,20,14),new THREE.MeshBasicMaterial({color:0x000000})); s.position.set(t[0],t[1]+.5,2.6); scene.add(s);
    const stem=new THREE.Mesh(new THREE.BoxGeometry(.03,1.2,.03),new THREE.MeshBasicMaterial({color:0x000000})); stem.position.set(t[0],t[1]+1.1,2.6); scene.add(stem); return {i,s,stem,last:i===12}; });
  const ghost=[], gm=new THREE.LineBasicMaterial({color:hdr(EMBER,1.6),transparent:true,opacity:0});
  for(let i=13;i<22;i++){ const w=ST.run(i), h=i+1, ls=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w,h,D)),gm); ls.position.set(ST.x[i]+w/2,h/2,0); scene.add(ls); ghost.push(ls); }
  const gates=[15,17,21].map(i=>{ const t=ST.top(i), tor=new THREE.Mesh(new THREE.TorusGeometry(2.6,.07,10,72),new THREE.MeshBasicMaterial({color:0x000000})); tor.position.set(t[0],t[1]+2.7,0); tor.rotation.y=Math.PI/2; scene.add(tor);
    const sp=K.sprite(EMBER,0,9); sp.position.copy(tor.position); scene.add(sp); return {tor,sp}; });
  const walker=K.sprite(0xffe0c0,3,2.4); scene.add(walker);
  return {env,update(st){ const k=st.P[0]*13.5; steps.forEach((s,i)=>{ const on=clamp01(k-i); s.e.material.color.copy(s.col).multiplyScalar(on*4); s.r2.material.color.copy(s.col).multiplyScalar(on*1.2); });
    marks.forEach(m=>{ const on=clamp01(k-m.i-.4); m.s.visible=m.stem.visible=on>.02; m.s.material.color.copy(hdr(m.last?EMBER:PAPER,on*(m.last?6:3))); m.stem.material.color.copy(hdr(PAPER,on*.6)); });
    const wi=Math.min(12,Math.floor(k)), t=ST.top(wi); walker.position.set(t[0],t[1]+.6,-1.5); walker.material.opacity=1-st.P[1];
    gm.opacity=st.P[2]*.85; gates.forEach((g,j)=>{ const on=clamp01(st.P[2]*3-j*.8); g.tor.visible=on>.02; g.tor.material.color.copy(hdr(EMBER,on*5)); g.sp.material.color.copy(hdr(EMBER,on*.5*(.8+.2*Math.sin(st.T*2+j)))); g.tor.rotation.x=st.T*.3+j; }); }}; }},o.over||{}),o);
};

/* blocks: three blocks on rock pedestals that split into more cubes every cycle. 4 beats, 3 labels. */
WORLDS.blocks=(o={})=>{ 
const IN={x:[-17,0,17],n:[[1,5,20,91],[1,3,9,27],[1,17,280,4096]]};
return finish(Object.assign({scrimS:true,far:6000,fog:[0x0a0912,.006],bloom:1,cams:[{p:[-24,5,36],l:[-13,0,0],f:40},{p:[-18,5,34],l:[-13,0,0],f:40},{p:[-7,6,40],l:[-6,0,0],f:40},{p:[5,7,46],l:[0,0,0],f:40},{p:[0,9,52],l:[0,-1.5,0],f:40}],drift:.3,
 tags:[['4–5×','COMPUTE','more training compute every year'],['3×','ALGORITHMS','less compute needed every year'],['280×','COST','cheaper in two years']].map((m,i)=>({b:[i,3],c:'w2',d:500,at:()=>[IN.x[i],-10.6,0],h:`<p class="fig">${i==2?'<em>'+m[0]+'</em>':m[0]}</p><p class="lab hi" style="letter-spacing:3px;margin:2px 0 6px">${m[1]}</p><p class="body">${m[2]}</p>`})),
 build({scene}){ const env=K.env(scene,'blue',{amp:.3,level:-7.4,fog:.0022,birdAt:[30,0,-200]}); [[-200,-560,180,74,4],[280,-720,240,110,9],[30,-1300,320,130,6]].forEach(a=>{ const m=K.island(...a); m.position.y=-7.4; scene.add(m); });
  IN.x.forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(6.6,7.6,3.4,10),K.std(0x3a3640,{roughness:1,flatShading:true})); p.position.set(x,-7.2,0); scene.add(p); });
  const dl=new THREE.DirectionalLight(L(0xfff0e0),1.1); dl.position.set(-12,30,24); scene.add(dl);
  const box=new THREE.BoxGeometry(1,1,1), cl=IN.x.map((x,i)=>{ const grp=new THREE.Group(); grp.position.x=x; const max=IN.n[i][3];
    const mesh=K.inst(box,i<2?K.std(i?0xd8d2c8:0xf2ede4,{roughness:.35,metalness:.2,emissive:L(0x2a2620)}):K.glow(EMBER,1.5),max); grp.add(mesh);
    const frame=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(8.4,8.4,8.4)),new THREE.LineBasicMaterial({color:hdr(i<2?PAPER:EMBER,.35),transparent:true,opacity:.6})); grp.add(frame);
    const pl=new THREE.PointLight(L(i<2?0xfff0e0:EMBER),0,30,1.8); pl.position.y=7; grp.add(pl); scene.add(grp); return {grp,mesh,pl,k:-1}; });
  function fill(c,i,k){ const n=IN.n[i][k], side=Math.ceil(Math.cbrt(n)-1e-6), cell=8/side, s=cell*.78; let j=0;
    for(let y=0;y<side&&j<n;y++) for(let z=0;z<side&&j<n;z++) for(let x=0;x<side&&j<n;x++,j++) setI(c.mesh,j,(x-(side-1)/2)*cell,(y-(side-1)/2)*cell,(z-(side-1)/2)*cell,s);
    c.mesh.count=n; c.mesh.instanceMatrix.needsUpdate=true; }
  return {env,update(st){ const ph=(st.T*.5)%4, k=Math.floor(ph), pop=1-Math.pow(1-Math.min(1,(ph-k)*3),3);
    cl.forEach((c,i)=>{ if(c.k!==k){ c.k=k; fill(c,i,k); } const on=st.P[i]; c.grp.scale.setScalar(on*(.86+.14*pop)*(1+st.P[3]*.06)); c.grp.rotation.set(.34,st.T*.16+i*.7,0); c.pl.intensity=on*(i<2?.25:.9)*(1+st.P[3]); }); }}; }},o.over||{}),o);
};

/* tunnel: a flight through a tunnel of rings on an accent-coloured ground. For one statement. 2 beats. Set light:true on the scene. */
WORLDS.tunnel=(o={})=>{ 
return finish(Object.assign({scrim:true,bg:0xff6b2c,fogLin:[0xff6b2c,18,150],bloom:.25,exp:1,cams:[{p:[0,0,10],l:[0,0,-40],f:52},{p:[0,0,8],l:[0,0,-40],f:52},{p:[0,0,4],l:[0,0,-40],f:46}],drift:.35,
 build({scene}){ const N=64, r=RNG(31), tor=K.inst(new THREE.TorusGeometry(9,.16,10,96),new THREE.MeshBasicMaterial({color:L(0x8a2c08)}),N), bar=K.inst(new THREE.BoxGeometry(.08,.08,5),new THREE.MeshBasicMaterial({color:L(0xb23c0c)}),N*6), tw=[];
  for(let i=0;i<N;i++) tw.push([r()*6.283,(r()-.5)*.5]); scene.add(tor); scene.add(bar);
  return {update(st){ const sp=6+st.P[1]*16, off=(st.T*sp)%5;
    for(let i=0;i<N;i++){ const z=10-i*5+off, a=tw[i][0]+st.T*tw[i][1]; setI(tor,i,0,0,z,1,1,1,0,0,a); for(let j=0;j<6;j++){ const b=a+j*1.0472; setI(bar,i*6+j,Math.cos(b)*9,Math.sin(b)*9,z-2.5,1); } }
    tor.instanceMatrix.needsUpdate=true; bar.instanceMatrix.needsUpdate=true; }}; }},o.over||{}),o);
};

/* gyro: a seven-ring gyroscope over a moonlit sea that spins faster on every beat. 4 beats, 4 labels (top, right, bottom, left). */
WORLDS.gyro=(o={})=>{ 
const GY={R:13.5};
return finish(Object.assign({scrimL:true,shift:.07,bloom:1.2,cams:[{p:[0,10,78],l:[0,-5,0],f:36},{p:[0,8,72],l:[0,-5,0],f:36},{p:[4,8,68],l:[0,-5,0],f:36},{p:[7,9,64],l:[0,-5,0],f:36},{p:[0,5,40],l:[0,-3,0],f:36}],drift:.3,
 tags:[['More capable AI',0,1],['AI does AI research',1,0],['Faster discoveries',0,-1],['Better chips and training',-1,0]].map(([s,x,y],i)=>({b:[0,2],d:500+i*240,c:x>0?'l':x<0?'r':'',at:()=>[x*(GY.R+1.4),y*(GY.R+1.5),0],h:`<p class="lab hi">${s}</p>`})),
 build({scene}){ const env=K.env(scene,'night',{amp:.5,level:-14.6,fog:.0012,sun:[-.55,.3,-.78],sunI:.6,sunC:0xc8d6ff,sunR:.028}); [[-300,-700,220,90,3],[420,-900,280,120,8]].forEach(a=>{ const m=K.island(...a); m.position.y=-14.6; scene.add(m); });
  const core=new THREE.Mesh(new THREE.SphereGeometry(1.1,32,24),K.glow(0xffd0a0,8)); scene.add(core); const cs=K.sprite(EMBER,.9,16); scene.add(cs);
  const pl=new THREE.PointLight(L(0xff8a4a),3,80,1.2); scene.add(pl);
  const outer=new THREE.Mesh(new THREE.TorusGeometry(GY.R,.07,8,160),K.glow(PAPER,.9)); scene.add(outer);
  const nodes=[[0,1],[1,0],[0,-1],[-1,0]].map(([x,y])=>{ const s=new THREE.Mesh(new THREE.SphereGeometry(.34,20,14),K.glow(PAPER,3)); s.position.set(x*GY.R,y*GY.R,0); scene.add(s); return s; });
  const runner=K.sprite(0xffe0c0,3,2.2); scene.add(runner);
  const rings=[]; for(let i=0;i<7;i++){ const R=11.6-i*1.5, col=new THREE.Color().lerpColors(L(0x6a6478),L(EMBER),i/6), pivot=new THREE.Group(), spin=new THREE.Group();
    const m=new THREE.Mesh(new THREE.TorusGeometry(R,.16+i*.012,14,160),K.std(0x2a2634,{roughness:.25,metalness:.9,emissive:col,emissiveIntensity:.25+i*.22}));
    for(let j=0;j<8;j++){ const st=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),K.glow(i>3?EMBER:PAPER,1.6+i*.5)); const a=j*.785; st.position.set(Math.cos(a)*R,Math.sin(a)*R,0); st.rotation.z=a; m.add(st); }
    pivot.rotation.set(i*.9,i*1.7,i*.5); spin.add(m); pivot.add(spin); scene.add(pivot); rings.push({spin,axis:i%2?'x':'y',w:.22*Math.pow(1.45,i),a:i}); }
  const r=RNG(41), N=2200, pos=new Float32Array(N*3), par=new Float32Array(N*4); for(let i=0;i<N;i++){ par[i*4]=1.6+Math.pow(r(),1.5)*11; par[i*4+1]=r()*6.283; par[i*4+2]=(r()-.5)*2.2; par[i*4+3]=r()*3.14; }
  const sw=K.points(pos,hdr(0xff9a5a,2),.16,.8); scene.add(sw); let ang=0;
  return {env,update(st,dt){ const sp=.35+.5*st.P[1]+1.1*st.P[2]+2.6*st.P[3]; ang+=dt*sp;
    rings.forEach(g=>{ g.spin.rotation[g.axis]=ang*g.w+g.a; });
    for(let i=0;i<N;i++){ const R=par[i*4], a=par[i*4+1]+ang*(14/(R+1.5))*.35, t=par[i*4+3], x=Math.cos(a)*R, z=Math.sin(a)*R; pos[i*3]=x; pos[i*3+1]=par[i*4+2]*(R*.12)+z*Math.sin(t)*.35; pos[i*3+2]=z*Math.cos(t)*.9; } sw.geometry.attributes.position.needsUpdate=true;
    const ra=-ang*.5+1.57; runner.position.set(Math.cos(ra)*GY.R,Math.sin(ra)*GY.R,0);
    const fade=1-st.P[3]; outer.material.color.copy(hdr(PAPER,.9*fade)); nodes.forEach(n=>n.material.color.copy(hdr(PAPER,3*fade))); runner.material.opacity=fade;
    core.material.color.copy(hdr(0xffd0a0,8+st.P[3]*30)); cs.material.color.copy(hdr(EMBER,.9+st.P[3]*2.2)); cs.scale.setScalar(16+st.P[3]*18); pl.intensity=3+st.P[3]*6; }}; }},o.over||{}),o);
};

/* city: one tower, then a hundred, ten thousand, and a plain of a million lights as the camera rises. 4 beats, 4 labels. */
WORLDS.city=(o={})=>{ 
return finish(Object.assign({title:'A country of geniuses',scrimL:true,fog:[0x09080f,.0],far:9000,shift:.16,bloom:1,
 cams:[{p:[3.4,2.2,5.2],l:[0,1,0],f:38},{p:[3,2,4.6],l:[0,1,0],f:38},{p:[11,9,17],l:[0,.5,0],f:38},{p:[52,58,96],l:[0,0,-6],f:38},{p:[150,200,340],l:[0,0,-30],f:38}],drift:.12,
 tags:['1 mind','100 copies','10,000 copies','1,000,000 copies'].map((s,i)=>({b:[i,i],d:900,at:()=>[0,[3.3,-1.2,-9,-70][i],[0,7.5,60,330][i]],h:`<p class="lab ${i==3?'em':'hi'}">${s}</p>`})),
 build({scene}){ const env=K.env(scene,'night',{ocean:false,fog:0,sun:[-.5,.34,-.8],sunI:.6,sunC:0xc8d6ff,sunR:.028});
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.ShaderMaterial({extensions:{derivatives:true},vertexShader:'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
   fragmentShader:NZ+`varying vec3 vW; void main(){ vec2 g=vW.xz; float w=fwidth(g.x)+fwidth(g.y); float city=1.-smoothstep(78.,82.,max(abs(g.x),abs(g.y)));
     float st=max(smoothstep(.07+w,.02,abs(fract(g.x+.5)-.5)),smoothstep(.07+w,.02,abs(fract(g.y+.5)-.5)))*(1.-smoothstep(.25,.7,w));
     float av=max(smoothstep(.16,.04,abs(fract(g.x/8.+.5)-.5)*8.),smoothstep(.16,.04,abs(fract(g.y/8.+.5)-.5)*8.))*(1.-smoothstep(1.5,5.,w));
     vec3 c=vec3(.0035,.0035,.006)*(.6+.8*fbm(g*.02))+vec3(.02,.03,.06)*.25*fbm(g*.004+3.);
     c+=city*(vec3(1.,.55,.22)*st*.05+vec3(1.,.72,.42)*av*.16)*(.6+.4*noise(g*.7));
     float road=smoothstep(3.,.5,abs(g.y+g.x*.3-20.*sin(g.x*.004)))*(1.-city); c+=vec3(1.,.6,.3)*road*.03;
     gl_FragColor=vec4(c,1.); }`})); ground.rotation.x=-Math.PI/2; scene.add(ground);
  for(let i=0;i<9;i++){ const a=i/9*6.283+.3, d=1500+(i%3)*260, m=K.island(Math.cos(a)*d,Math.sin(a)*d,520,210+(i%4)*40,i*3+2); scene.add(m); }
  const G=160, N=G*G, r=RNG(51), cells=[]; for(let x=0;x<G;x++) for(let z=0;z<G;z++){ const cx=x-G/2+.5, cz=z-G/2+.5; cells.push([Math.max(Math.abs(cx),Math.abs(cz)),Math.atan2(cz,cx),cx,cz]); }
  cells.sort((a,b)=>a[0]-b[0]||a[1]-b[1]); cells[0][2]=0; cells[0][3]=0;
  const body=K.inst(new THREE.BoxGeometry(1,1,1),K.std(0x14121c,{roughness:.4,metalness:.6}),N), cap=K.inst(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff}),N);
  for(let i=0;i<N;i++){ const c=cells[i], h=i?(.7+Math.pow(r(),2.2)*3.2):2; setI(body,i,c[2],h/2,c[3],.56,h,.56); setI(cap,i,c[2],h+.04,c[3],.46,.07,.46);
    const t=r(); _c.copy(t<.72?L(0xffb47a):t<.9?L(PAPER):L(EMBER)).multiplyScalar(1.4+r()*3.2); cap.setColorAt(i,_c); }
  body.count=1; cap.count=1; scene.add(body); scene.add(cap);
  scene.add(new THREE.HemisphereLight(L(0x5a68b0),L(0x08070d),.6)); const pl=new THREE.PointLight(L(0xffc090),1.1,18,1.8); pl.position.set(2,5,3); scene.add(pl);
  const far=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uK:{value:0},uT:{value:0}},extensions:{derivatives:true},
   vertexShader:'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
   fragmentShader:NZ+`uniform float uK,uT; varying vec3 vW; void main(){ vec2 g=vW.xz; vec2 id=floor(g); float d=length(fract(g)-.5); float w=fwidth(g.x); float a=smoothstep(.24,.24-max(w*1.4,.04),d)*(.6+.4*hash(id)); a=mix(a,.05,smoothstep(.25,.9,w));
     float inner=smoothstep(78.,84.,max(abs(g.x),abs(g.y))); float edge=smoothstep(500.,380.,max(abs(g.x),abs(g.y))); float pat=.55+.9*fbm(g*.012+3.);
     gl_FragColor=vec4(mix(vec3(1.,.42,.14),vec3(1.,.70,.40),hash(id+9.))*a*inner*edge*pat*uK*1.3,1.); }`}));
  far.rotation.x=-Math.PI/2; far.position.y=.4; scene.add(far);
  const counts=[1,100,10000,N]; let last=-1;
  return {env,update(st){ let n=1; for(let i=1;i<4;i++) n=Math.exp(lerp(Math.log(n),Math.log(counts[i]),st.P[i])); n=Math.round(n); if(n!==last){ body.count=cap.count=last=n; }
    far.material.uniforms.uK.value=st.P[3]; pl.intensity=1.1*(1-st.P[2]); }}; }},o.over||{}),o);
};

/* scaleTower: a lattice tower with four marker rings near the base; beat 1 pulls back to show it running out of sight. 3 beats, 6 labels. */
WORLDS.scaleTower=(o={})=>{ 
const TW={h:[1,5,8,8.8]};
return finish(Object.assign({scrimS:true,fog:[0x0a0912,.0022],far:4000,shift:.15,bloom:1.1,
 cams:[{p:[20,3,40],l:[0,5,0],f:36},{p:[16,6,33],l:[0,5.4,0],f:36},{p:[60,40,262],l:[0,82,0],f:36},{p:[74,44,270],l:[0,80,0],f:36}],drift:.2,
 tags:[...[['Mouse',0],['Chimpanzee',1],['Average person',2],['Einstein',3]].map(([s,i])=>({b:[0,0],d:500+i*200,c:i==2?'r':'l',at:()=>[i==2?-3.9:3.9,TW.h[i],0],h:`<p class="lab hi">${s}</p>`})),
  {b:[1,2],d:1800,c:'l',at:()=>[12,16,0],h:'<p class="lab hi">Every human who ever lived</p>'},{b:[1,2],d:2200,c:'l',at:()=>[12,160,0],h:'<p class="lab em">?</p>'}],
 build({scene}){ const env=K.env(scene,'dusk',{amp:.8,fog:.0016}); [[-190,-520,170,70,4],[260,-700,240,110,9],[40,-1300,320,130,6],[-620,-1000,260,80,12]].forEach(a=>scene.add(K.island(...a))); const plat=new THREE.Mesh(new THREE.CylinderGeometry(7,8.5,2.4,10),K.std(0x4a4650,{roughness:1,flatShading:true})); plat.position.y=-.6; scene.add(plat);
  const H=720, N=600, rung=K.inst(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff}),N*4), rail=K.inst(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff}),4);
  for(let i=0;i<N;i++){ const y=i*1.2, t=clamp01((y-12)/420); _c.copy(L(0x8a8496)).lerp(L(EMBER),t).multiplyScalar(.5+t*3.2);
    [[0,2.5,5,.07],[0,-2.5,5,.07],[2.5,0,.07,5],[-2.5,0,.07,5]].forEach(([x,z,sx,sz],j)=>{ setI(rung,i*4+j,x,y,z,sx,.07,sz); rung.setColorAt(i*4+j,_c); }); }
  [[2.5,2.5],[2.5,-2.5],[-2.5,2.5],[-2.5,-2.5]].forEach(([x,z],j)=>{ setI(rail,j,x,H/2,z,.14,H,.14); rail.setColorAt(j,_c.copy(L(0x8a8496)).multiplyScalar(.9)); });
  scene.add(rung); scene.add(rail);
  const marks=TW.h.map((y,i)=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(3.7,.06,8,96),K.glow(PAPER,1.5)); t.rotation.x=Math.PI/2; t.position.y=y; scene.add(t); const s=K.sprite(PAPER,.5,1.4); s.position.set(i==2?-3.7:3.7,y,0); scene.add(s); return t; });
  const pulses=[]; for(let i=0;i<9;i++){ const s=K.sprite(EMBER,2.5,10); scene.add(s); pulses.push(s); }
  const glowCol=K.sprite(EMBER,0,420); glowCol.position.set(0,420,0); glowCol.scale.set(160,700,1); scene.add(glowCol);
  return {env,update(st){ pulses.forEach((s,i)=>{ const y=(st.T*46+i*80)%H; s.position.set(0,y,0); s.material.opacity=st.P[1]*clamp01((y-10)/60); }); glowCol.material.color.copy(hdr(EMBER,.10*st.P[1])); marks.forEach(m=>{ m.rotation.z=st.T*.2; }); }}; }},o.over||{}),o);
};

/* ribbons: three glowing curves over the sea: a line, an exponential, and one that goes straight up. 3 beats, 3 labels. */
WORLDS.ribbons=(o={})=>{ 
const TKF=[u=>1+4*u, u=>1+.9*(Math.exp(3.1*u)-1), u=>Math.min(90,1+.55/Math.max(1.02-u/.72,1e-4)-.539)];
const TKX=u=>-26+52*u;
return finish(Object.assign({scrimS:true,fog:[0x0a0912,.004],far:3000,bloom:1.15,cams:[{p:[0,7,56],l:[0,7,0],f:40},{p:[0,7,56],l:[0,7,0],f:40},{p:[0,9,60],l:[0,10,0],f:40},{p:[-6,14,100],l:[2,23,0],f:44}],drift:.25,
 tags:[{b:[0,2],d:1200,c:'r',at:()=>[26,8.6,-5],h:'<p class="lab hi">Human researchers only</p>'},{b:[1,2],d:1400,c:'r',at:()=>[26,25,0],h:'<p class="lab ice">AI-assisted</p>'},{b:[2,2],d:2000,c:'r',at:()=>[10,40,5],h:'<p class="lab em">Self-improving AI</p>'}],
 build({scene}){ const env=K.env(scene,'dusk',{amp:.5,fog:.001}); [[-190,-520,170,70,4],[260,-700,240,110,9],[40,-1300,320,130,6],[-620,-1000,260,80,12]].forEach(a=>scene.add(K.island(...a)));
  const cols=[[PAPER,1.6],[ICE,2.6],[EMBER,4]], zs=[-5,0,5], rib=TKF.map((f,i)=>{ const pts=[]; const uMax=i==2?.7343:1; for(let k=0;k<=220;k++){ const u=uMax*k/220; pts.push(V3(TKX(u),f(u),zs[i])); }
    if(i==2){ const x=TKX(uMax); for(let y=pts[pts.length-1].y+4;y<=240;y+=6) pts.push(V3(x,y,zs[i])); }
    const curve=new THREE.CatmullRomCurve3(pts,false,'centripetal'), geo=new THREE.TubeGeometry(curve,i==2?520:300,.34+.08*i,8,false), m=new THREE.Mesh(geo,K.glow(cols[i][0],cols[i][1])); geo.setDrawRange(0,0); scene.add(m);
    const head=K.sprite(cols[i][0],2.4,5); scene.add(head);
    const wall=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:hdr(cols[i][0],.05),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); scene.add(wall);
    return {curve,geo,head,n:geo.index.count,wall,f,uMax,z:zs[i]}; });
  const xa=TKX(.7343), beam=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,400,24,1,true),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); beam.position.set(xa,200,5); scene.add(beam);
  const pl=new THREE.PointLight(L(EMBER),0,160,1.3); pl.position.set(xa,10,9); scene.add(pl);
  const r=RNG(43), N=900, pos=new Float32Array(N*3), sd=new Float32Array(N*3); for(let i=0;i<N*3;i++) sd[i]=r(); const sparks=K.points(pos,hdr(0xffb070,3),.5,0); scene.add(sparks);
  return {env,update(st){ rib.forEach((b,i)=>{ const p=st.P[i]; b.geo.setDrawRange(0,Math.floor(b.n*p/48)*48); const pt=b.curve.getPoint(Math.min(.9999,p)); b.head.position.copy(pt); b.head.material.opacity=p>0&&p<1?1:(i==2?0:p); });
    const k=clamp01((st.P[2]-.55)/.45); beam.material.color.copy(hdr(EMBER,.22*k*(.85+.15*Math.sin(st.T*3)))); pl.intensity=k*1.4; sparks.material.opacity=k;
    for(let i=0;i<N;i++){ const t=(sd[i*3]+st.T*(.25+sd[i*3+1]*.3))%1; pos[i*3]=xa+(sd[i*3+1]-.5)*(3+t*10); pos[i*3+1]=t*240; pos[i*3+2]=5+(sd[i*3+2]-.5)*(3+t*10); } sparks.geometry.attributes.position.needsUpdate=true; }}; }},o.over||{}),o);
};

/* pier: a hundred pillars on a pier, eight of them tall beacons; on beat 1 they slide together into a tenth of the length. 3 beats, 10 labels. */
WORLDS.pier=(o={})=>{ 
const CEV=[['Antibiotics',1928],['Fission',1938],['Transistor',1947],['DNA',1953],['Moon landing',1969],['Internet',1983],['Human genome',2003],['mRNA vaccines',2020]];
return finish(Object.assign({scrimS:true,fog:[0x0a0912,.005],bloom:1.1,cams:[{p:[-58,3,26],l:[-30,3,0],f:40},{p:[0,17,104],l:[0,4.5,0],f:40},{p:[-41,5,37],l:[-56,6,0],f:40},{p:[-30,20,82],l:[-38,-4,0],f:40}],drift:.25,
 tags:[...CEV.map(([s,yr],i)=>({b:[0,0],d:900+i*160,at:()=>[yr-1925-50,i%2?8.6:11.2,0],h:`<p class="lab hi">${s}</p>`})),
  {b:[0,0],d:600,at:()=>[-50,-2.6,4],h:'<p class="lab">1925</p>'},{b:[0,0],d:600,at:()=>[50,-2.6,4],h:'<p class="lab">2025</p>'}],
 layers:[{b:[0,2],z:'tl',h:'<p class="eb">Compression</p><h2>A century of progress in a decade</h2>'},
         {b:[1,1],z:'bl',h:'<p class="fig">The same distance, <em>in about ten years.</em></p>'},
         {b:[2,2],z:'free',s:'left:120px;bottom:100px;width:1680px',h:'<div class="six"><div><h3>Medicine</h3><p class="body">Diseases understood at the level of mechanism.</p></div><div><h3>Energy and materials</h3><p class="body">Batteries and reactors searched in simulation first.</p></div><div><h3>Mathematics</h3><p class="body">Open problems worked by tireless provers.</p></div><div><h3>Robotics</h3><p class="body">Intelligence gets hands; factories build factories.</p></div><div><h3>Software</h3><p class="body">Anything you can describe gets built overnight.</p></div><div><h3>Space</h3><p class="body">Hard engineering meets abundant engineers.</p></div></div>'},
         {b:[0,1],z:'bc',h:'<p class="lab">Framing: MacAskill and Moorhouse, Forethought, 2025</p>'}],
 build({scene}){ const env=K.env(scene,'blue',{amp:.22,fog:.003}); [[-190,-520,170,70,4],[260,-700,240,110,9],[40,-1300,320,130,6],[-620,-1000,260,80,12]].forEach(a=>scene.add(K.island(...a))); const deck=new THREE.Mesh(new THREE.BoxGeometry(106,.5,7.5),K.std(0x3a322c,{roughness:.9})); deck.position.y=.1; scene.add(deck); for(let i=0;i<27;i++){ const post=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,5,6),K.std(0x2a2420,{roughness:1})); post.position.set(-52+i*4,-2.2,i%2?3.4:-3.4); scene.add(post); }
  const pil=K.inst(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff}),100), base=K.inst(new THREE.BoxGeometry(1,1,1),K.std(0x4a4458,{roughness:.5,metalness:.3,emissive:L(0x15131c)}),100);
  const ev=new Set(CEV.map(e=>e[1]-1925)), hs=[], r=RNG(53); for(let i=0;i<100;i++) hs.push(ev.has(i)?(CEV.findIndex(e=>e[1]-1925===i)%2?7.2:9.8):1.2+r()*1.6);
  scene.add(pil); scene.add(base);
  const beacons=CEV.map(()=>{ const s=K.sprite(PAPER,2,3.2); scene.add(s); return s; });
  const gh=new Float32Array(300); for(let i=0;i<100;i++){ gh[i*3]=i-50; gh[i*3+1]=.15; gh[i*3+2]=0; } scene.add(K.points(gh,hdr(PAPER,.8),.5,.6));
  const pl=new THREE.PointLight(L(EMBER),0,70,1.3); pl.position.set(-45,6,8); scene.add(pl); const hot=K.sprite(EMBER,0,24); hot.position.set(-45,4,0); scene.add(hot);
  return {env,update(st){ const k=st.P[1], rise=st.P[0]; let b=0;
    for(let i=0;i<100;i++){ const x=lerp(i-50,-50+i*.1,k), on=clamp01(rise*1.6-i/100*.6), h=hs[i]*on+.02, w=lerp(.5,.085,k); setI(base,i,x,h/2,0,w,h,lerp(2.2,6,k)); setI(pil,i,x,h+.05,0,w,.1,lerp(2.2,6,k));
      _c.copy(L(ev.has(i)?PAPER:0x8a8496)).multiplyScalar(ev.has(i)?3:.9).lerp(hdr(EMBER,2.4),k); pil.setColorAt(i,_c);
      if(ev.has(i)){ beacons[b].position.set(x,h+.9,0); beacons[b].material.color.copy(hdr(PAPER,1.6*on).lerp(hdr(0xffd0a0,.7),k)); b++; } }
    base.instanceMatrix.needsUpdate=pil.instanceMatrix.needsUpdate=true; pil.instanceColor.needsUpdate=true; pl.intensity=k*1.5; hot.material.color.copy(hdr(EMBER,.18*k)); }}; }},o.over||{}),o);
};

/* hangingSun: a small sun hanging by a thread over one person on a rock in a dark sea. 4 beats. */
WORLDS.hangingSun=(o={})=>{ 
return finish(Object.assign({fog:[0x0a0810,.004],shift:.26,bloom:.9,cams:[{p:[-10,3,66],l:[0,6,0],f:38},{p:[-8,3.4,58],l:[0,6.5,0],f:38},{p:[-5,3.2,55],l:[0,7,0],f:38},{p:[-1,3,52],l:[0,7.5,0],f:38},{p:[4,2.8,49],l:[0,8,0],f:38}],drift:.15,
 build({scene}){ const env=K.env(scene,'night',{amp:.45,fog:.0012}); const plat=new THREE.Mesh(new THREE.CylinderGeometry(3.4,4.8,1.8,9),K.std(0x2a272e,{roughness:1,flatShading:true})); plat.position.y=-.55; scene.add(plat);
  const pivot=new THREE.Group(); pivot.position.y=150; scene.add(pivot);
  const sun=new THREE.Mesh(new THREE.SphereGeometry(7,64,48),new THREE.ShaderMaterial({uniforms:{uT:{value:0}},
   vertexShader:'varying vec3 vO; varying vec3 vN; void main(){ vO=position; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
   fragmentShader:NZ+`uniform float uT; varying vec3 vO; varying vec3 vN; void main(){ vec2 s=vO.xy*.5+vO.z*vec2(.31,.23); float f=fbm(s*1.6+uT*.04+fbm(s*.9-uT*.03)*2.); float rim=pow(1.-max(vN.z,0.),2.2);
     vec3 c=mix(vec3(1.,.16,.02),vec3(1.,.62,.26),f*f*1.5)*(.28+f*.75)+vec3(1.,.4,.12)*rim*.7; gl_FragColor=vec4(c,1.); }`}));
  sun.position.y=-138; pivot.add(sun);
  const thread=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,131,6),K.glow(PAPER,1.6)); thread.position.y=-65.5; pivot.add(thread);
  const halo=K.sprite(EMBER,.2,50); halo.position.y=-138; pivot.add(halo);
  const light=new THREE.PointLight(L(0xff8a4a),3,160,1.3); light.position.y=-138; pivot.add(light);
  const person=new THREE.Group(), pm=K.std(0x08070b,{roughness:1}); const bd=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,1.25,10),pm); bd.position.y=.62; const hd=new THREE.Mesh(new THREE.SphereGeometry(.2,14,10),pm); hd.position.y=1.48; person.add(bd); person.add(hd); person.position.y=.35; scene.add(person);
  const r=RNG(61), N=120, rocks=K.inst(new THREE.IcosahedronGeometry(1,0),K.std(0x1a1720,{roughness:1,flatShading:true}),N);
  for(let i=0;i<N;i++){ const a=r()*6.283, d=16+Math.pow(r(),.7)*200, s=.5+Math.pow(r(),4)*5; setI(rocks,i,Math.cos(a)*d,s*.3,Math.sin(a)*d,s,s*.6,s,r()*3,r()*3,r()*3); } scene.add(rocks);
  const M=260, fp=new Float32Array(M*3), fs=new Float32Array(M*2); for(let i=0;i<M*2;i++) fs[i]=r(); const fray=K.points(fp,hdr(PAPER,2),.14,0); scene.add(fray);
  return {env,update(st){ sun.material.uniforms.uT.value=st.T; pivot.rotation.z=Math.sin(st.T*.42)*.012*(1+st.P[3]*1.2); pivot.rotation.x=Math.cos(st.T*.31)*.006; fray.material.opacity=st.P[3]*.9;
    for(let i=0;i<M;i++){ const t=(fs[i*2]+st.T*.12)%1; fp[i*3]=Math.sin(i*12.9)*(.1+t*1.4); fp[i*3+1]=20.5+fs[i*2+1]*18-t*6; fp[i*3+2]=Math.cos(i*7.3)*(.1+t*1.4); } fray.geometry.attributes.position.needsUpdate=true; }}; }},o.over||{}),o);
};

/* towers: one tower per item, standing in calm water, heights following your numbers. Options: items:[{label, value, note, show}] (2 to 8; `show` is the text printed for the value). 2 beats. Labels come from the items. */
WORLDS.towers=(o={})=>{ const D=(o.items&&o.items.length>1?o.items:[{label:'First',value:1},{label:'Second',value:2},{label:'Third',value:4}]).slice(0,8), n=D.length, mx=Math.max(...D.map(d=>Math.abs(+d.value)||0))||1, gap=n>6?7:9, X=i=>(i-(n-1)/2)*gap, Hh=d=>2+14*(Math.abs(+d.value)||0)/mx, dist=Math.max(42,n*gap*.92+8);
  return finish(Object.assign({scrimS:true,far:6000,drift:.25,bloom:1,
   cams:[{p:[-dist*.55,3,dist*.62],l:[-6,5,0],f:40},{p:[0,7,dist],l:[0,5.5,0],f:44},{p:[dist*.2,9,dist*.95],l:[2,6,0],f:44}],
   tags:D.map((d,i)=>({b:[0,3],c:'w',d:500+i*220,at:()=>[X(i),-2.8,3.2],h:'<h3>'+(d.show===undefined?d.value:d.show)+'</h3><p class="lab hi" style="margin:6px 0 8px">'+(d.label||'')+'</p>'+(d.note?'<p class="lab" style="letter-spacing:0">'+d.note+'</p>':'')})),
   build({scene}){ const env=K.env(scene,'blue',{amp:.2,fog:.0035}); [[-190,-520,170,70,4],[260,-700,240,110,9],[40,-1300,320,130,6]].forEach(a=>scene.add(K.island(...a)));
    const items=D.map((d,i)=>{ const h=Hh(d), col=new THREE.Color().lerpColors(L(THEME.paper),L(THEME.accent),n>1?i/(n-1):1), g=new THREE.Group(); g.position.x=X(i);
      const body=new THREE.Mesh(new THREE.BoxGeometry(2.6,h,2.6),K.std(0x141a20,{roughness:.3,metalness:.6})); body.position.y=h/2; g.add(body);
      const strip=new THREE.Mesh(new THREE.BoxGeometry(.3,h*.92,.06),new THREE.MeshBasicMaterial({color:0x000000})); strip.position.set(0,h/2,1.32); g.add(strip);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(2.7,.08,2.7),new THREE.MeshBasicMaterial({color:0x000000})); cap.position.y=h+.04; g.add(cap);
      const pl=new THREE.PointLight(col,0,30,1.8); pl.position.set(0,h*.7,6); g.add(pl); scene.add(g); return {col,strip,cap,pl}; });
    return {env,update(st){ items.forEach((it,i)=>{ const on=clamp01(st.P[0]*n-i); it.strip.material.color.copy(it.col).multiplyScalar(on*5); it.cap.material.color.copy(it.col).multiplyScalar(on*3); it.pl.intensity=on*.9; }); }}; }},o.over||{}),o); };
