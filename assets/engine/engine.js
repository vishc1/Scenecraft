(()=>{
'use strict';
const $=id=>document.getElementById(id);
const cv=$('gl'), stage=$('stage'), errBox=$('err');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let SHOT=null; try{ SHOT=new URLSearchParams(location.search).get('shot'); }catch(e){}
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const fail=m=>{ console.error(m); if(SHOT) errBox.textContent+=m+'\n'; };
addEventListener('error',e=>fail(e.message+' @'+e.lineno));

/* ---------- renderer and post chain: scene (HDR, MSAA) -> bloom -> tone map -> transition ---------- */
let R=null, HF, rtS, rtR, rc, rtH1, rtH2, rtQ1, rtQ2, rtA, rtB, W=2, H=2, FIT=1, q=1;
try{ R=new THREE.WebGLRenderer({canvas:cv,antialias:false,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:!!SHOT}); R.setPixelRatio(1); }catch(e){ R=null; }
const FSV='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const mk=(frag,uni)=>new THREE.ShaderMaterial({vertexShader:FSV,fragmentShader:frag,uniforms:uni,depthTest:false,depthWrite:false});
let fsMesh, fsScene, fsCam, mBright, mBlur, mComp, mFinal;
if(R){ const gl2=R.capabilities.isWebGL2; HF=gl2&&R.extensions.get('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType;
  const o={type:HF,format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false};
  rtS=gl2?new THREE.WebGLMultisampleRenderTarget(2,2,{type:HF,format:THREE.RGBAFormat}):new THREE.WebGLRenderTarget(2,2,{type:HF});
  rtR=new THREE.WebGLRenderTarget(2,2,{type:HF,format:THREE.RGBAFormat,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter}); rc=new THREE.PerspectiveCamera();
  rtH1=new THREE.WebGLRenderTarget(2,2,o); rtH2=new THREE.WebGLRenderTarget(2,2,o); rtQ1=new THREE.WebGLRenderTarget(2,2,o); rtQ2=new THREE.WebGLRenderTarget(2,2,o);
  const lo={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false}; rtA=new THREE.WebGLRenderTarget(2,2,lo); rtB=new THREE.WebGLRenderTarget(2,2,lo);
  fsCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1); fsScene=new THREE.Scene(); fsMesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2)); fsMesh.frustumCulled=false; fsScene.add(fsMesh);
  mBright=mk('varying vec2 vUv;uniform sampler2D t;uniform float th;void main(){vec3 c=min(texture2D(t,vUv).rgb,vec3(40.));float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,th+.7,l),1.);}',{t:{value:null},th:{value:1.05}});
  mBlur=mk('varying vec2 vUv;uniform sampler2D t;uniform vec2 d;void main(){vec3 c=texture2D(t,vUv).rgb*.227;c+=(texture2D(t,vUv+d*1.385).rgb+texture2D(t,vUv-d*1.385).rgb)*.316;c+=(texture2D(t,vUv+d*3.231).rgb+texture2D(t,vUv-d*3.231).rgb)*.0703;gl_FragColor=vec4(c,1.);}',{t:{value:null},d:{value:new THREE.Vector2()}});
  mComp=mk('varying vec2 vUv;uniform sampler2D t,b1,b2;uniform float s,ex;vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}void main(){vec3 c=texture2D(t,vUv).rgb+texture2D(b1,vUv).rgb*.28*s+texture2D(b2,vUv).rgb*.42*s;c=aces(c*ex);gl_FragColor=vec4(pow(c,vec3(1./2.2)),1.);}',{t:{value:null},b1:{value:null},b2:{value:null},s:{value:1},ex:{value:1}});
  mFinal=mk(NZ+`varying vec2 vUv;uniform sampler2D tA,tB;uniform float uK,uKind,uT;uniform vec2 uRes;uniform vec3 EM;
   void main(){ vec2 q=vUv; vec2 p=(q-.5)*vec2(uRes.x/uRes.y,1.); vec3 c;
    if(uK>=1.) c=texture2D(tA,q).rgb; else { float k=uK; vec3 a=texture2D(tA,q).rgb, b=texture2D(tB,q).rgb;
     if(uKind<1.5&&uKind>.5){ float r=length(p), Rr=k*k*1.5; float m=smoothstep(Rr,Rr-.03,r); c=mix(b,a,m)+EM*exp(-abs(r-Rr)*36.)*(1.-k)*1.6; }
     else if(uKind<2.5&&uKind>1.5){ float n=fbm(p*3.+7.)*.8+.1*q.x; float e=k*1.25-.12; float m=smoothstep(e-.015,e+.015,n); c=mix(a,b,m)+EM*smoothstep(.07,0.,abs(n-e))*2.2*sin(3.14159*k); }
     else if(uKind<3.5&&uKind>2.5){ float bars=floor(q.x*28.); float d=fract(sin(bars*127.1)*43758.5453)*.45; float m=smoothstep(d,d+.55,k); float yy=q.y+m*m*1.15; c=yy>1.?a:texture2D(tB,vec2(q.x,yy)).rgb; c+=EM*smoothstep(.03,0.,abs(yy-1.))*.9*step(.001,m); }
     else if(uKind>3.5){ vec2 qb=(q-.5)/(1.+k*k*7.)+.5; float z=1.+(1.-k)*(1.-k)*2.5; vec2 qa=(q-.5)*z+.5; vec3 bb=texture2D(tB,qb).rgb; vec3 aa=texture2D(tA,clamp(qa,0.,1.)).rgb*step(abs(qa.x-.5),.5)*step(abs(qa.y-.5),.5); float m=smoothstep(.35,.65,k); c=mix(bb,aa,m)+mix(EM,vec3(.95,.93,.89),.3)*exp(-pow((k-.5)*5.5,2.))*.7; }
     else c=mix(b,a,smoothstep(0.,1.,k)); }
    c*=1.-.30*dot(p,p); c+=(hash(gl_FragCoord.xy+fract(uT)*91.7)-.5)*.03; gl_FragColor=vec4(c,1.); }`,{tA:{value:null},tB:{value:null},uK:{value:1},uKind:{value:0},uT:{value:0},uRes:{value:new THREE.Vector2()},EM:{value:new THREE.Color(THEME.accent)}}); }
const pass=(mat,target)=>{ fsMesh.material=mat; R.setRenderTarget(target); R.render(fsScene,fsCam); };

{ const hex=n=>'#'+n.toString(16).padStart(6,'0'), rs=document.documentElement.style; rs.setProperty('--ink',hex(THEME.ink)); rs.setProperty('--paper',hex(THEME.paper)); rs.setProperty('--ember',hex(THEME.accent)); rs.setProperty('--ice',hex(THEME.accent2)); }
/* ---------- stage and text ---------- */
let vw=1,vh=1,ss=1,ox=0,oy=0,narrow=false;
function layout(){ vw=innerWidth; vh=innerHeight; narrow=vw/vh<1.25; const SW=narrow?1100:1920; ss=narrow?vw/SW:Math.min(vw/1920,vh/1080); const SH=narrow?vh/ss:1080;
  ox=(vw-SW*ss)/2; oy=(vh-SH*ss)/2; stage.style.width=SW+'px'; stage.style.height=SH+'px'; stage.style.transform=`translate(${ox}px,${oy}px) scale(${ss})`;
  document.body.classList.toggle('narrow',narrow); FIT=Math.max(1,(16/9)/(vw/vh));
  if(!SHOT) q=Math.min(q,Math.min(window.devicePixelRatio||1,Math.sqrt(2.6e6/(vw*vh)))); resize(); }
function resize(){ W=Math.max(2,Math.floor(vw*q)); H=Math.max(2,Math.floor(vh*q)); if(!R) return; R.setSize(W,H,false); rtS.setSize(W,H); rtA.setSize(W,H); rtB.setSize(W,H);
  const hw=Math.max(2,W>>1), hh=Math.max(2,H>>1), qw=Math.max(2,W>>2), qh=Math.max(2,H>>2); rtR.setSize(hw,hh); rtH1.setSize(hw,hh); rtH2.setSize(hw,hh); rtQ1.setSize(qw,qh); rtQ2.setSize(qw,qh); }

const secs=SC.map(sc=>{ const el=document.createElement('section'); el.className='sc'+(sc.light?' light':'')+(sc.scrim?' scrim':'')+(sc.scrimL?' scrimL':'')+(sc.scrimS?' scrimS':''); el.hidden=true; el.setAttribute('aria-label',sc.title);
  sc.zel=(sc.layers||[]).map(Lr=>{ const z=document.createElement('div'); z.className='z '+Lr.z; if(Lr.s) z.style.cssText=Lr.s; z.innerHTML=Lr.h; [...z.children].forEach((c,j)=>c.style.setProperty('--i',j)); el.appendChild(z); return z; });
  sc.tel=(sc.tags||[]).map(T=>{ const t=document.createElement('div'); t.className='tag '+(T.c||''); t.innerHTML='<div>'+T.h+'</div>'; el.appendChild(t); return t; });
  stage.appendChild(el); return el; });

/* ---------- worlds ---------- */
function world(sc){ if(sc.rt!==undefined) return sc.rt; try{ const scene=new THREE.Scene(); scene.background=L(sc.bg===undefined?INK:sc.bg);
    if(sc.fog&&sc.fog[1]) scene.fog=new THREE.FogExp2(L(sc.fog[0]),sc.fog[1]); if(sc.fogLin) scene.fog=new THREE.Fog(L(sc.fogLin[0]),sc.fogLin[1],sc.fogLin[2]);
    const camera=new THREE.PerspectiveCamera(40,1,.1,sc.far||2500); const api=sc.build({scene,camera})||{}; sc.rt={scene,camera,update:api.update,env:api.env}; }
  catch(e){ fail('scene '+sc.id+': '+e.message); sc.rt=null; } return sc.rt; }
const _a=new THREE.Vector3(), _b=new THREE.Vector3(), _v=new THREE.Vector3();
function aim(sc,w,s){ const c=sc.cams, cam=w.camera; _a.fromArray(c[0].p); _b.fromArray(c[0].l); let f=c[0].f;
  for(let i=0;i<sc.beats.length&&c[i+1];i++){ const k=s.P[i]; _a.lerp(_v.fromArray(c[i+1].p),k); _b.lerp(_v.fromArray(c[i+1].l),k); f=f+(c[i+1].f-f)*k; }
  const d=(sc.drift||0)*(RM?0:1), t=s.T; _a.x+=Math.sin(t*.21)*d*1.4; _a.y+=Math.sin(t*.17+1.3)*d; _a.z+=Math.cos(t*.13)*d*1.2;
  cam.position.copy(_a); cam.lookAt(_b); cam.aspect=vw/vh; cam.fov=2*Math.atan(Math.tan(f*Math.PI/360)*FIT)*180/Math.PI; cam.filmOffset=narrow?0:-(sc.shift||0)*cam.getFilmWidth(); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); }

/* ---------- state ---------- */
let cur=-1, st=null, tr=null, clock=0, last=0, token=0;
const fresh=(sc,full)=>({t0:clock,T:0,bi:full?sc.beats.length-1:0,raw:[0,1,2,3].map(i=>full&&i<sc.beats.length?1:0),P:[0,0,0,0],Q:[0,0,0,0]});
function apply(){ const sc=SC[cur]; if(!sc) return; const bi=st.bi;
  (sc.layers||[]).forEach((Lr,i)=>{ const on=bi>=Lr.b[0]&&bi<=Lr.b[1]; [...sc.zel[i].children].forEach(c=>c.classList.toggle('on',on&&bi>=(+c.dataset.b||0))); });
  (sc.tags||[]).forEach((T,i)=>{ const on=bi>=T.b[0]&&bi<=T.b[1]; const el=sc.tel[i]; el.style.transitionDelay=on&&bi===T.b[0]&&!SHOT?(T.d||0)+'ms':'0ms'; el.classList.toggle('on',on); });
  $('where').textContent=String(cur+1).padStart(2,'0')+' / '+String(SC.length).padStart(2,'0'); $('ttl').textContent=sc.title;
  $('pips').innerHTML=sc.beats.map((b,i)=>'<i'+(i<=bi?' class="on"':'')+'></i>').join('');
  $('hud').classList.toggle('light',!!sc.light);
  const done=SC.slice(0,cur).reduce((n,s)=>n+s.beats.length,0)+bi+1, all=SC.reduce((n,s)=>n+s.beats.length,0);
  $('bar').style.width=(done/all*100)+'%'; $('note').textContent=sc.beats[bi].note||'';
  [...$('over').children].forEach((b,i)=>b.setAttribute('aria-current',i===cur)); }
function clear(i){ const sc=SC[i]; if(!sc) return; sc.zel.forEach(z=>[...z.children].forEach(c=>c.classList.remove('on'))); sc.tel.forEach(t=>t.classList.remove('on')); }
function go(i,back,instant){ if(i<0||i>=SC.length||i===cur) return; const old=cur, my=++token;
  if(R&&old>=0&&!instant){ const t=rtA; rtA=rtB; rtB=t; tr={k:0,dur:RM?.25:back?.7:1.7,kind:back?0:SC[i].kind}; } else tr=null;
  if(old>=0){ clear(old); setTimeout(()=>{ if(cur!==old) secs[old].hidden=true; },instant?0:650); }
  cur=i; st=fresh(SC[i],back||instant===2); secs[i].hidden=false;
  const wait=instant?0:back?250:RM?100:800; $('ttl').textContent=''; setTimeout(()=>{ if(my===token) apply(); },wait);
  if(R&&SC[i+1]&&!SHOT) setTimeout(()=>{ if(my===token) world(SC[i+1]); },2500);
  try{ history.replaceState(null,'','#s'+(i+1)); }catch(e){} }
function next(){ const sc=SC[cur]; if(st.bi<sc.beats.length-1){ st.bi++; apply(); } else go(cur+1); }
function prev(){ if(st.bi>0){ st.bi--; apply(); } else go(cur-1,true); }
function positionTags(sc,w){ (sc.tags||[]).forEach((T,i)=>{ const el=sc.tel[i]; if(!w){ return; } _v.fromArray(T.at(st)).project(w.camera); const vis=_v.z<1;
    el.style.left=((( _v.x*.5+.5)*vw-ox)/ss)+'px'; el.style.top=(((-_v.y*.5+.5)*vh-oy)/ss)+'px'; el.style.visibility=vis?'':'hidden'; }); }

/* ---------- loop ---------- */
let ema=.016, slow=0;
function frame(now){ const dt=Math.min(.1,(now-last)/1000||0); last=now; if(!SHOT) clock+=dt; const sc=SC[cur];
  st.T=clock-st.t0; for(let i=0;i<4;i++){ const b=sc.beats[i]; if(b&&i<=st.bi) st.raw[i]=Math.min(1,st.raw[i]+dt/(RM?.05:b.dur||1.6)); else st.raw[i]=Math.max(0,st.raw[i]-dt*2.5); st.P[i]=ease(st.raw[i]); }
  if(R){ const w=world(sc);
    if(w){ aim(sc,w,st); if(w.update) w.update(st,SHOT?.016:dt); positionTags(sc,w);
      if(w.env){ const E=w.env, cam=w.camera; E.tick(st.T); if(E.ocean){ const lv=E.level; rc.fov=cam.fov; rc.aspect=cam.aspect; rc.near=cam.near; rc.far=cam.far; rc.filmOffset=cam.filmOffset; rc.updateProjectionMatrix();
        rc.position.set(cam.position.x,2*lv-cam.position.y,cam.position.z); rc.up.set(0,1,0); rc.lookAt(_b.x,2*lv-_b.y,_b.z); rc.updateMatrixWorld();
        E.ocean.visible=false; R.setRenderTarget(rtR); R.render(w.scene,rc); E.ocean.visible=true; E.OU.tRefl.value=rtR.texture; E.OU.uRes.value.set(W,H); } }
      R.setRenderTarget(rtS); R.render(w.scene,w.camera);
      mBright.uniforms.t.value=rtS.texture; pass(mBright,rtH1);
      mBlur.uniforms.t.value=rtH1.texture; mBlur.uniforms.d.value.set(1/rtH1.width,0); pass(mBlur,rtH2); mBlur.uniforms.t.value=rtH2.texture; mBlur.uniforms.d.value.set(0,1/rtH1.height); pass(mBlur,rtH1);
      mBlur.uniforms.t.value=rtH1.texture; mBlur.uniforms.d.value.set(1.6/rtQ1.width,0); pass(mBlur,rtQ2); mBlur.uniforms.t.value=rtQ2.texture; mBlur.uniforms.d.value.set(0,1.6/rtQ1.height); pass(mBlur,rtQ1);
      mBlur.uniforms.t.value=rtQ1.texture; mBlur.uniforms.d.value.set(3/rtQ1.width,0); pass(mBlur,rtQ2); mBlur.uniforms.t.value=rtQ2.texture; mBlur.uniforms.d.value.set(0,3/rtQ1.height); pass(mBlur,rtQ1);
      mComp.uniforms.t.value=rtS.texture; mComp.uniforms.b1.value=rtH1.texture; mComp.uniforms.b2.value=rtQ1.texture; mComp.uniforms.s.value=sc.bloom===undefined?1:sc.bloom; mComp.uniforms.ex.value=sc.exp||1; pass(mComp,rtA); }
    if(tr){ tr.k+=dt/tr.dur; if(tr.k>=1) tr=null; }
    const u=mFinal.uniforms; u.tA.value=rtA.texture; u.tB.value=rtB.texture; u.uK.value=tr?ease(tr.k):1; u.uKind.value=tr?tr.kind:0; u.uT.value=clock; u.uRes.value.set(W,H); pass(mFinal,null);
    if(!SHOT){ ema+=(dt-ema)*.05; if(ema>.036&&q>.45){ if(++slow>50){ q*=.8; slow=0; ema=.02; resize(); } } else slow=0; } }
  requestAnimationFrame(frame); }

/* ---------- controls ---------- */
const panels={notes:$('notes'),over:$('over'),help:$('help')};
const toggle=k=>{ for(const n in panels) panels[n].hidden=n===k?!panels[n].hidden:(n==='notes'?panels[n].hidden:true); };
SC.forEach((sc,i)=>{ const b=document.createElement('button'); b.type='button'; b.innerHTML=String(i+1).padStart(2,'0')+'<b>'+sc.title+'</b>'; b.onclick=()=>{ panels.over.hidden=true; go(i); }; panels.over.appendChild(b); });
const full=()=>{ try{ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(()=>{}); }catch(e){} };
$('bPrev').onclick=prev; $('bNext').onclick=next; $('bNotes').onclick=()=>toggle('notes'); $('bOver').onclick=()=>toggle('over'); $('bFull').onclick=full; $('bHelp').onclick=()=>toggle('help');
addEventListener('keydown',e=>{ if(e.metaKey||e.ctrlKey||e.altKey) return; const k=e.key;
  if(k==='Escape'){ panels.over.hidden=true; panels.help.hidden=true; return; }
  if(e.target&&e.target.tagName==='BUTTON'&&(k===' '||k==='Enter')) return;
  if(k==='ArrowRight'||k===' '||k==='PageDown'||k==='Enter'){ e.preventDefault(); next(); }
  else if(k==='ArrowLeft'||k==='PageUp'||k==='Backspace'){ e.preventDefault(); prev(); }
  else if(k==='Home') go(0,false); else if(k==='End') go(SC.length-1,false);
  else if(k==='n'||k==='N') toggle('notes'); else if(k==='o'||k==='O') toggle('over'); else if(k==='f'||k==='F') full(); else if(k==='?'||k==='h') toggle('help'); });
let down=null;
cv.addEventListener('pointerdown',e=>{ down=[e.clientX,e.clientY]; });
cv.addEventListener('pointerup',e=>{ if(!down) return; const dx=e.clientX-down[0], dy=e.clientY-down[1]; down=null;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)) dx<0?next():prev(); else if(Math.abs(dx)<12&&Math.abs(dy)<12) e.clientX<vw*.22?prev():next(); });
let idleT=0; const wake=()=>{ document.body.classList.remove('idle'); clearTimeout(idleT); idleT=setTimeout(()=>document.body.classList.add('idle'),2800); };
addEventListener('pointermove',wake); addEventListener('keydown',wake); wake();
addEventListener('resize',layout);
addEventListener('hashchange',()=>{ const m=/^#s(\d+)$/.exec(location.hash); if(m) go(+m[1]-1,false); });

/* ---------- start ---------- */
layout();
let first=0; const m=/^#s(\d+)$/.exec(location.hash); if(m) first=Math.min(SC.length-1,Math.max(0,+m[1]-1));
if(SHOT){ const [id,b,t]=SHOT.split('.'); first=Math.max(0,SC.findIndex(s=>s.id===id)); clock=+(t||9); $('ctl').hidden=true; document.body.classList.add('idle');
  go(first,false,2); st.bi=Math.min(+b||0,SC[first].beats.length-1); st.raw=st.raw.map((v,i)=>i<=st.bi?1:0); st.t0=0; apply(); }
else go(first,false,1);
if(!R) fail('This browser has no WebGL, so the animated scenes are off. The text still works.');
requestAnimationFrame(t=>{ last=t; requestAnimationFrame(frame); });
})();
