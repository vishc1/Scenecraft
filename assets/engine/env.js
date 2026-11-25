/* ---------- environment kit: sky with sun, clouds and stars; ocean with waves and true reflections; islands ---------- */
const SKYS={
 predawn:{birds:1,sun:[0,-.05,-1],zen:0x03061a,hor:0x2e2440,sunC:0xff8a4a,cloudC:0x1e1a30,stars:.9,clouds:.7,ecl:0,sunI:.45,sunR:.034,deep:0x01040c,shal:0x0a2a3a,amb:.3},
 eclipse:{sun:[0,.27,-.96],zen:0x01020a,hor:0x0b1022,sunC:0xff9a58,cloudC:0x141a30,stars:1,clouds:.3,ecl:1,sunI:1,sunR:.085,deep:0x01040c,shal:0x0a2a3a,amb:.25},
 night:{sun:[.4,.5,-.77],zen:0x01020a,hor:0x0a1024,sunC:0x9fb4ff,cloudC:0x10162a,stars:1,clouds:.45,ecl:0,sunI:0,sunR:.03,deep:0x01040c,shal:0x08222e,amb:.22},
 blue:{birds:1,sun:[-.55,.03,-.83],zen:0x040a24,hor:0x45365c,sunC:0xff8a4a,cloudC:0x2c2a4a,stars:.6,clouds:.7,ecl:0,sunI:.55,sunR:.03,deep:0x020818,shal:0x0c3044,amb:.5},
 dusk:{birds:1,sun:[.25,.075,-.965],zen:0x0a1440,hor:0xb85c3c,sunC:0xffa252,cloudC:0x4a3248,stars:.1,clouds:.8,ecl:0,sunI:1,sunR:.032,deep:0x03101e,shal:0x124050,amb:.7},
 dawn:{birds:1,sun:[0,.11,-.99],zen:0x1c3a78,hor:0xf0a070,sunC:0xffc890,cloudC:0x8a6878,stars:0,clouds:.75,ecl:0,sunI:1.2,sunR:.034,deep:0x04182a,shal:0x1a5868,amb:1}
};
const SKY_GL=NZ+`uniform vec3 uSun,uZen,uHor,uSunC,uCloudC; uniform vec4 uSkyP; uniform float uSunR,uT;
vec3 sky(vec3 d){ float h=max(d.y,0.); vec3 c=mix(uHor,uZen,pow(h,.42)); float sd=max(dot(d,uSun),0.); float R=uSunR;
 c+=uSunC*(pow(sd,6.)*.22+pow(sd,60.)*.45)*uSkyP.w*(1.-.88*uSkyP.z);
 vec3 up=normalize(cross(uSun,vec3(1.,0.,0.))), rt=cross(up,uSun); vec2 q=vec2(dot(d,rt),dot(d,up)); float r=length(q)+step(dot(d,uSun),0.)*9.; vec2 dir=q/max(r,1e-5);
 if(uSkyP.z<.5) c+=uSunC*smoothstep(R,R*.86,r)*26.*uSkyP.w;
 else { float ray=pow(noise(dir*7.+uT*.03),2.)*1.4+pow(noise(dir*31.-uT*.02),3.)*1.2+pow(noise(dir*93.+uT*.01),5.)*1.8; float edge=smoothstep(R*.985,R*1.06,r);
  c+=uSunC*(exp(-max(r-R,0.)*13.)*(.05+ray*.40)+exp(-max(r-R,0.)*80.)*2.4)*edge*uSkyP.w; }
 vec2 sp=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.,1.)))*230.; vec2 si=floor(sp); float st=step(.984,hash(si))*smoothstep(.30,0.,length(fract(sp)-.5-(vec2(hash(si+7.),hash(si+19.))-.5)*.6));
 c+=st*uSkyP.x*smoothstep(.02,.25,d.y)*(.6+.4*sin(uT*1.7+hash(si)*50.))*1.4;
 if(d.y>.005){ vec2 cp=d.xz/(d.y+.14)*1.1+uT*.006; float f=fbm(cp)+.42*fbm(cp*3.1+4.); float cl=smoothstep(1.02-uSkyP.y*.5,1.34-uSkyP.y*.42,f)*smoothstep(.07,.42,d.y);
  vec3 cc=mix(uCloudC*.45,uCloudC*1.5+uSunC*.55*pow(sd,3.)*uSkyP.w,smoothstep(.75,1.5,f)); c=mix(c,cc,cl*.9); }
 if(uSkyP.z>.5) c*=1.-smoothstep(R*1.01,R*.97,r);
 return c; }
`;
const WAVE_GL=`uniform float uAmp,uLevel;
float waveH(vec2 p,out vec2 g){ float h=0.; g=vec2(0.); vec2 d; float k,ph;
 d=normalize(vec2(1.,.2)); k=6.2832/46.; ph=k*dot(d,p)+uT*.45*sqrt(9.8*k); h+=.60*sin(ph); g+=.60*k*d*cos(ph);
 d=normalize(vec2(.7,.7)); k=6.2832/27.; ph=k*dot(d,p)+uT*.50*sqrt(9.8*k); h+=.34*sin(ph); g+=.34*k*d*cos(ph);
 d=normalize(vec2(-.3,1.)); k=6.2832/17.; ph=k*dot(d,p)+uT*.55*sqrt(9.8*k); h+=.22*sin(ph); g+=.22*k*d*cos(ph);
 d=normalize(vec2(.9,-.4)); k=6.2832/10.; ph=k*dot(d,p)+uT*.60*sqrt(9.8*k); h+=.12*sin(ph); g+=.12*k*d*cos(ph);
 d=normalize(vec2(.2,1.)); k=6.2832/6.; ph=k*dot(d,p)+uT*.70*sqrt(9.8*k); h+=.07*sin(ph); g+=.07*k*d*cos(ph);
 d=normalize(vec2(-.8,.5)); k=6.2832/3.4; ph=k*dot(d,p)+uT*.80*sqrt(9.8*k); h+=.035*sin(ph); g+=.035*k*d*cos(ph);
 return h; }
`;
/* small value noise in JS for terrain */
const jhash=(x,y)=>{ let n=Math.sin(x*127.1+y*311.7)*43758.5453; return n-Math.floor(n); };
const jnoise=(x,y)=>{ const i=Math.floor(x), j=Math.floor(y), f=x-i, g=y-j, u=f*f*(3-2*f), v=g*g*(3-2*g); return lerp(lerp(jhash(i,j),jhash(i+1,j),u),lerp(jhash(i,j+1),jhash(i+1,j+1),u),v); };
const jfbm=(x,y)=>{ let a=.5,s=0; for(let i=0;i<5;i++){ s+=a*jnoise(x,y); x=x*2.03+17; y=y*2.03+9; a*=.5; } return s; };
K.island=(cx,cz,rad,height,seed)=>{ const n=72, geo=new THREE.PlaneGeometry(rad*2,rad*2,n,n); geo.rotateX(-Math.PI/2); const p=geo.attributes.position, col=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i), d=Math.sqrt(x*x+z*z)/rad, f=jfbm(x/rad*2.4+seed,z/rad*2.4+seed*1.7), ridge=1-Math.abs(jnoise(x/rad*5+seed,z/rad*5)*2-1);
    const hgt=Math.max(-2,(1-d*d)*(f*1.5+ridge*.45-.38))*height*Math.max(0,1-d*d*d)-1.2; p.setY(i,hgt);
    const t=clamp01(hgt/height*1.5); _c.copy(L(0x1c2420)).lerp(L(0x4a443c),clamp01(t*2.4)).lerp(L(0xd8d6da),clamp01((t-.62)*4)); col[i*3]=_c.r; col[i*3+1]=_c.g; col[i*3+2]=_c.b; }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3)); geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0,flatShading:true})); m.position.set(cx,0,cz); return m; };
K.env=(scene,name,o)=>{ o=o||{}; const P=Object.assign({},SKYS[name],o), sun=V3(...P.sun).normalize();
  const U={uSun:{value:sun},uZen:{value:L(P.zen)},uHor:{value:L(P.hor)},uSunC:{value:L(P.sunC)},uCloudC:{value:L(P.cloudC)},uSkyP:{value:new THREE.Vector4(P.stars,P.clouds,P.ecl,P.sunI)},uSunR:{value:P.sunR},uT:{value:0}};
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthTest:false,depthWrite:false,uniforms:U,fog:false,
   vertexShader:'varying vec3 vD; void main(){ vD=position; vec4 p=projectionMatrix*vec4(mat3(viewMatrix)*position,1.); gl_Position=p.xyww; }',
   fragmentShader:SKY_GL+'varying vec3 vD; void main(){ gl_FragColor=vec4(sky(normalize(vD)),1.); }'}));
  dome.frustumCulled=false; dome.renderOrder=-1000; scene.add(dome);
  const hemi=new THREE.HemisphereLight(L(P.zen).lerp(L(P.hor),.5).multiplyScalar(3),L(P.deep),P.amb); scene.add(hemi);
  const dl=new THREE.DirectionalLight(L(P.sunC),P.ecl?.5:P.sunI*1.6); dl.position.copy(sun).multiplyScalar(300); scene.add(dl);
  scene.fog=new THREE.FogExp2(L(P.hor).multiplyScalar(.8),o.fog===undefined?.0016:o.fog);
  const env={U,P,sun,dome,dl,hemi,level:o.level||0,ocean:null};
  if(o.ocean!==false){ const OU=Object.assign({uAmp:{value:o.amp===undefined?1:o.amp},uLevel:{value:env.level},tRefl:{value:null},uRes:{value:new THREE.Vector2(1,1)},uDeep:{value:L(P.deep)},uShal:{value:L(P.shal)},uFog:{value:o.haze===undefined?.0005:o.haze}},U);
   const om=new THREE.ShaderMaterial({uniforms:OU,fog:false,side:THREE.DoubleSide,
    vertexShader:'uniform float uT;'+WAVE_GL+`varying vec3 vW; varying float vH; void main(){ vec2 u=position.xy; vec2 q=sign(u)*pow(abs(u),vec2(2.6))*3800.; vec3 w=vec3(q.x+cameraPosition.x,uLevel,q.y+cameraPosition.z);
      vec2 g; float h=waveH(w.xz,g)*uAmp*exp(-length(q)*.0022); w.y+=h; vW=w; vH=h; gl_Position=projectionMatrix*viewMatrix*vec4(w,1.); }`,
    fragmentShader:SKY_GL+WAVE_GL+`uniform sampler2D tRefl; uniform vec2 uRes; uniform vec3 uDeep,uShal; uniform float uFog; varying vec3 vW; varying float vH;
     void main(){ vec2 p=vW.xz; float dist=length(vW-cameraPosition); float near=exp(-dist*.004); vec2 g; waveH(p,g); g*=uAmp*exp(-dist*.0022);
      vec2 mp=p*.9+vec2(uT*.35,uT*.22); float e=.35; float n0=fbm(mp), nx=fbm(mp+vec2(e,0.)), nz=fbm(mp+vec2(0.,e));
      vec2 mp2=p*3.1-vec2(uT*.5,uT*.31); float m0=noise(mp2), mx=noise(mp2+vec2(.3,0.)), mz=noise(mp2+vec2(0.,.3));
      vec2 mg=(vec2(nx-n0,nz-n0)*2.6+vec2(mx-m0,mz-m0)*1.2)*(.35+.65*min(uAmp,1.))*(.45+.55*near);
      vec3 N=normalize(vec3(-g.x-mg.x,1.,-g.y-mg.y)); vec3 V=normalize(cameraPosition-vW);
      float F=.02+.98*pow(1.-max(dot(N,V),0.),5.);
      vec2 suv=gl_FragCoord.xy/uRes; vec2 ruv=vec2(suv.x,1.-suv.y)+N.xz*vec2(.045,.10)*(.3+.7*near);
      vec3 refl=min(texture2D(tRefl,clamp(ruv,.002,.998)).rgb,vec3(30.));
      vec3 Rr=reflect(-V,N); Rr.y=abs(Rr.y); vec3 Rf=reflect(-V,vec3(0.,1.,0.)); refl=max(sky(Rr)+(refl-sky(Rf)),vec3(0.));
      float sdn=max(dot(Rr,uSun),0.); vec3 spec=uSunC*(pow(sdn,700.)*40.+pow(sdn,70.)*.5)*uSkyP.w*(1.-uSkyP.z);
      vec3 body=mix(uDeep,uShal,clamp(vH/(uAmp+.001)*.35+.25,0.,1.)*pow(max(dot(N,V),0.),1.5))*(.25+length(uHor)*1.2);
      float crest=smoothstep(.62,1.05,vH/(uAmp*1.05+.001))*smoothstep(.35,.7,fbm(p*.8+uT*.2))*near;
      vec3 c=mix(body,refl,F)+spec; c=mix(c,vec3(.75,.8,.85)*(.25+length(uHor)*1.4),crest*.28);
      c=mix(c,uHor*.9,1.-exp(-dist*uFog));
      gl_FragColor=vec4(c,1.); }`});
   const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2,260,260),om); mesh.frustumCulled=false; mesh.renderOrder=-500; scene.add(mesh); env.ocean=mesh; env.OU=OU; }
  let birds=null, bd=null;
  if(env.ocean&&o.life!==false){ const r=RNG(o.seed||77), lv=env.level, st=K.inst(new THREE.IcosahedronGeometry(1,1),K.std(0x2a2a30,{roughness:1,flatShading:true}),26);
    for(let i=0;i<26;i++){ const a=r()*6.283, d=150+r()*420, s=3+Math.pow(r(),2)*11; setI(st,i,Math.cos(a)*d,lv+s*(.6+r()*1.2),Math.sin(a)*d-80,s,s*(1.6+r()*2.6),s*(.7+r()*.6),r()*.3,r()*6,r()*.3); } scene.add(st);
    if(P.birds){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,0,.25, 0,0,-.2, 0,0,.3, 1,0,.25, 0,0,.3, 0,0,-.2]),3));
      birds=K.inst(g,new THREE.MeshBasicMaterial({color:L(0x08080c),side:THREE.DoubleSide}),46); bd=[]; for(let i=0;i<46;i++) bd.push([40+r()*120,r()*6.283,26+r()*40,.5+r()*.6,r()*6.283,(o.birdAt||[60,0,-160])]); scene.add(birds); } }
  env.tick=t=>{ U.uT.value=t; if(birds){ for(let i=0;i<46;i++){ const b=bd[i], a=b[1]+t*.09*b[3], c=b[5]; const fl=.35+.65*Math.abs(Math.sin(t*5.5*b[3]+b[4]));
      setI(birds,i,c[0]+Math.cos(a)*b[0],env.level+b[2]+Math.sin(t*.4+b[4])*3,c[2]+Math.sin(a)*b[0]*.6,1.5*fl,1,1.5,0,-a,Math.sin(t*5.5*b[3]+b[4])*.3); } birds.instanceMatrix.needsUpdate=true; } };
  /* blend the sky toward another preset (used for the sunrise) */
  env.blend=(to,k,sunTo)=>{ const B=SKYS[to]; U.uZen.value.copy(L(P.zen)).lerp(L(B.zen),k); U.uHor.value.copy(L(P.hor)).lerp(L(B.hor),k); U.uSunC.value.copy(L(P.sunC)).lerp(L(B.sunC),k); U.uCloudC.value.copy(L(P.cloudC)).lerp(L(B.cloudC),k);
    U.uSkyP.value.set(lerp(P.stars,B.stars,k),lerp(P.clouds,B.clouds,k),P.ecl,lerp(P.sunI,B.sunI,k)); if(sunTo) U.uSun.value.copy(sun).lerp(V3(...sunTo),k).normalize();
    if(env.OU){ env.OU.uDeep.value.copy(L(P.deep)).lerp(L(B.deep),k); env.OU.uShal.value.copy(L(P.shal)).lerp(L(B.shal),k); }
    scene.fog.color.copy(U.uHor.value).multiplyScalar(.8); dl.color.copy(U.uSunC.value); dl.intensity=lerp(P.ecl?.5:P.sunI*1.6,B.sunI*1.6,k); dl.position.copy(U.uSun.value).multiplyScalar(300); hemi.intensity=lerp(P.amb,B.amb,k); };
  return env; };
