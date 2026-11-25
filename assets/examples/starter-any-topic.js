/* Starter for any topic. Four scene shapes that cover most talks:
     1. title    an environment carries the mood
     2. values   a list of numbers becomes towers in the water (edit DATA)
     3. many     one thing becomes thousands as the camera rises (edit STEPS)
     4. close    the opening place again, as the sun comes up
   Replace the text and the data, then add scenes of your own between them. */

/* Theme: ink, paper, accent, second accent. Change or delete this line. */
Object.assign(THEME,{ink:0x06121a,paper:0xeef4f2,accent:0x35d0a5,accent2:0xffc857});

/* A custom sky, to show how presets are added. */
SKYS.teal={birds:1,sun:[-.3,.12,-.95],zen:0x06202e,hor:0x2f8f86,sunC:0xffe2b0,cloudC:0x3a6a70,stars:.15,clouds:.7,ecl:0,sunI:.9,sunR:.032,deep:0x021a22,shal:0x16656a,amb:.8};

const FAR_ISLES=[[-220,-560,180,74,4],[280,-740,240,110,9],[40,-1300,320,130,6],[-640,-1050,260,80,12]];

/* ---------- 1: title ---------- */
SC.push({id:'title',title:'Your title',kind:0,scrimS:true,shift:.18,far:6000,drift:.25,
 beats:[{dur:3,note:'Open on the place and let it sit for a breath.'},{dur:2.4,note:'One sentence that says what the talk is about.'}],
 layers:[{b:[0,1],z:'tl',h:'<p class="eb">Occasion · date</p>'},
         {b:[0,1],z:'ml',h:'<h1>Your<br>title <em>here</em></h1>'},
         {b:[1,1],z:'bl',h:'<p class="lede">The one-sentence promise of the talk.</p>'}],
 cams:[{p:[0,2.4,62],l:[0,10,0],f:40},{p:[0,2.8,54],l:[0,10,0],f:40},{p:[0,3.4,46],l:[0,9,0],f:40}],
 build({scene}){ const env=K.env(scene,'teal',{amp:.8,fog:.0009}); FAR_ISLES.forEach(a=>scene.add(K.island(...a))); return {env}; }});

/* ---------- 2: values as towers ---------- */
const DATA=[{label:'First',value:12,note:'what it is'},{label:'Second',value:19,note:'what it is'},{label:'Third',value:31,note:'what it is'},{label:'Fourth',value:48,note:'what it is'},{label:'Fifth',value:80,note:'what it is'}];
const DV={gap:9,max:Math.max(...DATA.map(d=>d.value)),h:d=>2+14*d.value/Math.max(...DATA.map(e=>e.value)),x:i=>(i-(DATA.length-1)/2)*9};
SC.push({id:'values',title:'The numbers',kind:3,scrimS:true,far:6000,drift:.25,
 beats:[{dur:3,note:'Name what is being measured and read the first and last value. Give the source.'},{dur:2.4,note:'Say the one comparison that matters.'}],
 layers:[{b:[0,1],z:'tl',h:'<p class="eb">What is measured · unit</p><h2>A heading for the numbers</h2><p class="lede gap" data-b="1" style="max-width:600px">The one comparison that matters.</p>'},
         {b:[0,1],z:'bc',h:'<p class="lab">Source: name it here</p>'}],
 tags:DATA.map((d,i)=>({b:[0,1],c:'w',d:500+i*260,at:()=>[DV.x(i),-2.8,3.2],h:`<h3>${d.value}</h3><p class="lab hi" style="margin:6px 0 8px">${d.label}</p><p class="lab" style="letter-spacing:0">${d.note}</p>`})),
 cams:[{p:[-26,3,30],l:[-6,5,0],f:40},{p:[0,7,46],l:[0,5.5,0],f:44},{p:[10,9,44],l:[2,6,0],f:44}],
 build({scene}){ const env=K.env(scene,'blue',{amp:.2,fog:.0035}); FAR_ISLES.forEach(a=>scene.add(K.island(...a)));
  const items=DATA.map((d,i)=>{ const h=DV.h(d), col=new THREE.Color().lerpColors(L(THEME.paper),L(THEME.accent),i/(DATA.length-1)), g=new THREE.Group(); g.position.x=DV.x(i);
    const body=new THREE.Mesh(new THREE.BoxGeometry(2.6,h,2.6),K.std(0x141a20,{roughness:.3,metalness:.6})); body.position.y=h/2; g.add(body);
    const strip=new THREE.Mesh(new THREE.BoxGeometry(.3,h*.92,.06),new THREE.MeshBasicMaterial({color:0x000000})); strip.position.set(0,h/2,1.32); g.add(strip);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(2.7,.08,2.7),new THREE.MeshBasicMaterial({color:0x000000})); cap.position.y=h+.04; g.add(cap);
    const pl=new THREE.PointLight(col,0,30,1.8); pl.position.set(0,h*.7,6); g.add(pl); scene.add(g); return {col,strip,cap,pl}; });
  return {env,update(st){ items.forEach((it,i)=>{ const on=clamp01(st.P[0]*DATA.length-i); it.strip.material.color.copy(it.col).multiplyScalar(on*5); it.cap.material.color.copy(it.col).multiplyScalar(on*3); it.pl.intensity=on*.9; }); }}; }});

/* ---------- 3: one becomes many ---------- */
const STEPS=[['1','one of them'],['100','a hundred'],['10,000','ten thousand']];
SC.push({id:'many',title:'One becomes many',kind:1,scrimL:true,shift:.16,far:9000,drift:.12,
 beats:STEPS.map((s,i)=>({dur:i?2.6:2,note:'Say what one unit is, then what changes at '+s[0]+'.'})),
 layers:[{b:[0,2],z:'tl',h:'<p class="eb">Scale</p><h2 style="max-width:860px">A heading about how many</h2>'},
         {b:[0,2],z:'bl',h:STEPS.map((s,i)=>`<div class="${i?'pt':''}" data-b="${i}"><h3>${s[0]}</h3><p class="body">${s[1]}</p></div>`).join('')}],
 cams:[{p:[3.4,2.2,5.2],l:[0,1,0],f:38},{p:[3,2,4.6],l:[0,1,0],f:38},{p:[11,9,17],l:[0,.5,0],f:38},{p:[52,58,96],l:[0,0,-6],f:38}],
 build({scene}){ const env=K.env(scene,'night',{ocean:false,fog:0,sun:[-.5,.34,-.8],sunI:.6,sunC:0xc8d6ff,sunR:.028});
  scene.add(K.floor(9000,0x070a0c)); const grid=K.grid(400,400,.06); grid.position.y=.02; scene.add(grid);
  for(let i=0;i<9;i++){ const a=i/9*6.283+.3, d=1500+(i%3)*260; scene.add(K.island(Math.cos(a)*d,Math.sin(a)*d,520,210+(i%4)*40,i*3+2)); }
  const G=100, N=G*G, r=RNG(51), cells=[]; for(let x=0;x<G;x++) for(let z=0;z<G;z++){ const cx=x-G/2+.5, cz=z-G/2+.5; cells.push([Math.max(Math.abs(cx),Math.abs(cz)),Math.atan2(cz,cx),cx,cz]); }
  cells.sort((a,b)=>a[0]-b[0]||a[1]-b[1]); cells[0][2]=0; cells[0][3]=0;
  const body=K.inst(new THREE.BoxGeometry(1,1,1),K.std(0x12181c,{roughness:.4,metalness:.6}),N), cap=K.inst(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff}),N);
  for(let i=0;i<N;i++){ const c=cells[i], h=i?(.7+Math.pow(r(),2.2)*3.2):2; setI(body,i,c[2],h/2,c[3],.56,h,.56); setI(cap,i,c[2],h+.04,c[3],.46,.07,.46); _c.copy(L(r()<.75?THEME.accent:THEME.paper)).multiplyScalar(1.4+r()*3); cap.setColorAt(i,_c); }
  body.count=cap.count=1; scene.add(body); scene.add(cap);
  const pl=new THREE.PointLight(L(THEME.accent),1.1,18,1.8); pl.position.set(2,5,3); scene.add(pl);
  const counts=[1,100,N]; let last=-1;
  return {env,update(st){ let n=1; for(let i=1;i<3;i++) n=Math.exp(lerp(Math.log(n),Math.log(counts[i]),st.P[i])); n=Math.round(n); if(n!==last) body.count=cap.count=last=n; pl.intensity=1.1*(1-st.P[2]); }}; }});

/* ---------- 4: close, with a sunrise ---------- */
SC.push({id:'close',title:'Closing',kind:1,scrimS:true,shift:.18,far:6000,drift:.25,
 beats:[{dur:2.6,note:'Return to the opening place.'},{dur:3.5,note:'The one thing you want them to do next. Leave it up for questions.'}],
 layers:[{b:[0,1],z:'tl',h:'<p class="eb">Where this leaves us</p>'},
         {b:[0,1],z:'ml',h:'<h1>Your closing<br><em>line.</em></h1>'},
         {b:[1,1],z:'bl',h:'<p class="lede">What you want the audience to do next.</p>'}],
 cams:[{p:[0,2.4,60],l:[0,9,0],f:40},{p:[0,2.6,54],l:[0,9,0],f:40},{p:[0,3,48],l:[0,8,0],f:40}],
 build({scene}){ const env=K.env(scene,'predawn',{amp:.8,fog:.0009}); FAR_ISLES.forEach(a=>scene.add(K.island(...a)));
  return {env,update(st){ env.blend('dawn',clamp01(st.P[0]*.3+st.P[1]*.7),[0,.11,-.99]); }}; }});
