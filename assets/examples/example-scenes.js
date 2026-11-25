/* Worked examples: three complete scenes from a talk on the intelligence explosion.
   Copy the patterns, not the content. Each scene = text (beats, layers, tags) + a 3D world (cams, build). */

/* ---------- A: title over a night sea, under an eclipse (environment-led scene) ---------- */
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
SC.push({id:'eclipse',title:'The Intelligence Explosion',kind:0,
 beats:[{dur:3,note:'Open on the eclipse and let it sit.'},{dur:2.4,note:'One sentence of setup.'}],
 layers:[{b:[0,1],z:'tl',h:'<p class="eb">A briefing on the next decade</p>'},
         {b:[0,1],z:'ml',h:'<h1>The<br>Intelligence<br><em>Explosion</em></h1>'},
         {b:[1,1],z:'bl',h:'<p class="lede">What happens when intelligence starts improving itself.</p>'}],
 shift:.2,bloom:1,cams:[{p:[0,2.4,60],l:[0,13,0],f:40},{p:[0,2.8,54],l:[0,14,0],f:40},{p:[0,3.4,46],l:[0,15,0],f:40}],drift:.25,far:6000,build:seaWorld(false)});

/* ---------- B: six monoliths standing in calm water (data-led scene with labels tracked to 3D points) ---------- */
const MILE=[['2016','AlphaGo','Beats Lee Sedol four games to one at Go'],['2020','AlphaFold 2','Predicts protein structures to near lab accuracy'],['2022','ChatGPT','100 million users in about two months'],['2023','GPT-4','Passes the bar exam, writes working software'],['2024','Two Nobels','Physics and Chemistry prizes go to AI work'],['2025','Olympiad gold','Gold-medal scores at the Maths Olympiad']];
SC.push({id:'decade',title:'Ten years of milestones',kind:3,
 beats:[{dur:2.6,note:'2016 and 2020.'},{dur:2.6,note:'2022 and 2023.'},{dur:2.6,note:'2024 and 2025.'}]});
const MX=i=>i*9, MH=i=>4+2.3*i;
ext('decade',{scrimS:true,fog:[0x0b0a12,.011],bloom:1,cams:[{p:[-12,2.2,18],l:[2,3,0],f:38},{p:[4,3.4,25],l:[4.5,4.2,0],f:38},{p:[22,4,27],l:[22.5,6.5,0],f:38},{p:[22.5,8,47],l:[22.5,5.2,0],f:44}],drift:.25,
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
    const k=it.refl?.14:1; it.strip.material.color.copy(it.col).multiplyScalar(on*5*k); it.cap.material.color.copy(it.col).multiplyScalar(on*3*k); it.cone.material.color.copy(it.col).multiplyScalar(on*.018*k*(.85+.15*Math.sin(st.T*1.3+it.i))); } }}; }});


/* ---------- C: a gyroscope over a moonlit sea (mechanism scene: speed rises on every beat) ---------- */
SC.push({id:'loop',title:'The feedback loop',kind:4,
 beats:[{dur:2.4,note:'Draw the loop.'},{dur:2,note:'The output becomes the input.'},{dur:2,note:'Each turn is faster.'},{dur:4,note:'Let it run.'}],
 layers:[{b:[0,3],z:'tl',h:'<p class="eb">Recursive improvement</p><h2>The feedback loop</h2>'},
         {b:[1,3],z:'bl',h:'<p class="lede" style="max-width:640px">Once models do the research that improves models, the output of the loop becomes its input.</p><p class="lede gap" data-b="2"><em>Each turn shortens the next one.</em></p>'}]});
const GY={R:13.5};
ext('loop',{scrimL:true,shift:.07,bloom:1.2,cams:[{p:[0,10,78],l:[0,-5,0],f:36},{p:[0,8,72],l:[0,-5,0],f:36},{p:[4,8,68],l:[0,-5,0],f:36},{p:[7,9,64],l:[0,-5,0],f:36},{p:[0,5,40],l:[0,-3,0],f:36}],drift:.3,
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
    core.material.color.copy(hdr(0xffd0a0,8+st.P[3]*30)); cs.material.color.copy(hdr(EMBER,.9+st.P[3]*2.2)); cs.scale.setScalar(16+st.P[3]*18); pl.intensity=3+st.P[3]*6; }}; }});

