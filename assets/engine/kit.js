/* ---------- 3D kit: colours, random, instancing and glow helpers ---------- */
/* Theme: change these four colours (and the CSS variables in head.html follow at startup). */
const THEME={ink:0x08070d,paper:0xf2ede4,accent:0xff6b2c,accent2:0x4fb8ff};
const INK=THEME.ink, PAPER=THEME.paper, EMBER=THEME.accent, ICE=THEME.accent2;
/* Every scene file pushes its scenes here, in talk order. */
const SC=[];
const L=h=>new THREE.Color(h).convertSRGBToLinear();
const hdr=(h,k)=>L(h).multiplyScalar(k);
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
function RNG(s){ return ()=>{ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const lerp=(a,b,t)=>a+(b-a)*t, clamp01=x=>Math.max(0,Math.min(1,x));
const NZ=`float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(17.,9.);a*=.5;}return s;}
`;
const K={
 glowTex(){ if(K._g) return K._g; const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.22,'rgba(255,255,255,.55)'); gr.addColorStop(.55,'rgba(255,255,255,.12)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); return K._g=new THREE.CanvasTexture(c); },
 points(pos,color,size,opacity){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({color,size,map:K.glowTex(),transparent:true,opacity:opacity===undefined?1:opacity,depthWrite:false,blending:THREE.AdditiveBlending})); p.frustumCulled=false; return p; },
 stars(n,R,seed){ const r=RNG(seed||1), a=new Float32Array(n*3); for(let i=0;i<n;i++){ const u=r()*2-1, t=r()*6.283, s=Math.sqrt(1-u*u), d=R*(.75+.25*r()); a[i*3]=s*Math.cos(t)*d; a[i*3+1]=u*d; a[i*3+2]=s*Math.sin(t)*d; } return K.points(a,L(0xffffff),R*.0075,.9); },
 std(color,o){ return new THREE.MeshStandardMaterial(Object.assign({color:L(color),roughness:.6,metalness:.1},o)); },
 glow(color,k,o){ return new THREE.MeshBasicMaterial(Object.assign({color:hdr(color,k)},o)); },
 sprite(color,k,size){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:K.glowTex(),color:hdr(color,k),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); s.scale.setScalar(size); return s; },
 grid(size,div,op){ const g=new THREE.GridHelper(size,div,L(PAPER),L(PAPER)); g.material.transparent=true; g.material.opacity=op; g.material.depthWrite=false; return g; },
 inst(geo,mat,n){ const m=new THREE.InstancedMesh(geo,mat,n); m.frustumCulled=false; return m; },
 floor(size,color,o){ const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),K.std(color,Object.assign({roughness:.9},o))); m.rotation.x=-Math.PI/2; return m; }
};
const _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _s=new THREE.Vector3(), _p=new THREE.Vector3(), _e=new THREE.Euler(), _c=new THREE.Color();
const setI=(mesh,i,x,y,z,sx,sy,sz,rx,ry,rz)=>{ _p.set(x,y,z); _s.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz); _q.setFromEuler(_e.set(rx||0,ry||0,rz||0)); mesh.setMatrixAt(i,_m.compose(_p,_q,_s)); };
const ext=(id,o)=>Object.assign(SC.find(s=>s.id===id),o);
