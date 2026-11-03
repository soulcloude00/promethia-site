// Voxel island with a block torch, block-built makers and floating blocks.
// Static CSS art stays visible if WebGL is unavailable. Rendering pauses off-screen.
const art = document.getElementById('heroArt');
const canvas = document.getElementById('voxel');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function hasGL(){try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){return false;}}
if (canvas && hasGL()) init().catch(e=>console.warn('3D scene skipped', e));

async function init(){
  const THREE = await import('./three.module.min.js');
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x30406a, 1.15));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(8, 14, 5); scene.add(sun);
  const world = new THREE.Group(); scene.add(world);
  const geo = new THREE.BoxGeometry(1,1,1);

  // static voxels grouped by colour into InstancedMeshes (few draw calls)
  const stat = new Map();
  const put = (x,y,z,c,s=1) => { if(!stat.has(c)) stat.set(c,[]); stat.get(c).push([x,y,z,s]); };
  const R = 5.2;
  for (let x=-6;x<=6;x++) for (let z=-6;z<=6;z++){
    const d = Math.hypot(x,z); if (d>R) continue;
    const path = (x===0 && z>0) || (z===0 && x<0);
    put(x,0,z, path?0xe8c48a:((x*3+z*7)&1?0x6cbf4b:0x7cd257));
    if (d<R-0.8) put(x,-1,z,0x8a5a2b);
    if (d<R-2.0) put(x,-2,z,0x9a6a38);
    if (d<R-3.2) put(x,-3,z,0x7a7f8c);
    if (d<1.5) put(x,-4,z,0x6a6f7c);
  }
  // trees
  const tree=(x,z,h=2)=>{ for(let y=1;y<=h;y++) put(x,y,z,0x8a5a2b);
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){ put(x+a,h+1,z+b,0x3f9a3a); if(Math.abs(a)+Math.abs(b)<2) put(x+a,h+2,z+b,0x4caf50);} };
  tree(-3,-3,3); tree(3,-3,2); tree(-4,2,2);
  // torch on plinth
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++) put(a,1,b,0x24386a);
  put(0,2,0,0x1a2a4f); put(0,3,0,0x1a2a4f);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++) if(a||b) put(a,4,b,0x24386a);
  put(0,4,0,0x1a2a4f);
  // workbench with a mini build (making) + easel (design) + pitch board (startup)
  [[3,1,3],[4,1,3]].forEach(p=>put(...p,0xb07a43));
  put(3,2,3,0x2f7fc8,.6); put(4,2,3,0xf5b82e,.6);
  put(-3,1,-0.0+0,0x8a5a2b); put(-3,2,0,0xfff8ef); put(-3,3,0,0xfff8ef);
  
  // flowers
  [[1,1,4,0xd8437c],[-2,1,3,0xf5b82e],[4,1,-1,0xd8437c],[-1,1,-4,0xf5b82e]].forEach(([x,y,z,c])=>put(x,y,z,c,.4));
  const dummy = new THREE.Object3D();
  for (const [c,list] of stat){
    const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({color:c}), list.length);
    list.forEach(([x,y,z,s],i)=>{ dummy.position.set(x,y-(1-s)/2,z); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i,dummy.matrix); });
    world.add(m);
  }
  const box = (w,h,d,c,basic) => new THREE.Mesh(new THREE.BoxGeometry(w,h,d), basic?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshLambertMaterial({color:c}));

  // block kids / makers
  const kids=[];
  const kid=(x,z,shirt,hair,rot)=>{
    const g=new THREE.Group();
    const legs=box(.5,.6,.3,0x24386a); legs.position.y=.8; g.add(legs);
    const body=box(.6,.7,.35,shirt); body.position.y=1.45; g.add(body);
    const head=box(.5,.5,.5,0xc68a5e); head.position.y=2.05; g.add(head);
    const hr=box(.54,.18,.54,hair); hr.position.y=2.32; g.add(hr);
    const armL=box(.18,.6,.2,shirt); armL.position.set(-.4,1.5,0); g.add(armL);
    const armR=box(.18,.6,.2,shirt); armR.position.set(.4,1.5,0); armR.geometry.translate(0,-.25,0); armR.position.y=1.75; g.add(armR);
    g.scale.setScalar(1.45); g.position.set(x,0,z); g.rotation.y=Math.atan2(-x,-z); g.userData={armR,ph:Math.random()*6}; world.add(g); kids.push(g);
  };
  kid(2.6,0.6,0xf26b21,0x2a1a10);
  kid(0.9,2.7,0x2f7fc8,0x111111);
  kid(-1.9,2.2,0xd8437c,0x3a2414);
  kid(2.4,-2.0,0x3d9a40,0x1a1a1a);

  // flame
  const flame=new THREE.Group(); flame.position.set(0,5,0); world.add(flame);
  const fl=[[0,0,0,1,0xf26b21],[.55,0,0,.7,0xf26b21],[-.55,0,0,.7,0xf26b21],[0,0,.55,.7,0xf26b21],[0,0,-.55,.7,0xf26b21],
    [0,.85,0,.85,0xff8a3d],[.35,.7,.2,.5,0xf26b21],[0,1.6,0,.62,0xffc94d],[0,2.25,0,.38,0xfff1a8]];
  const fm=fl.map(([x,y,z,s,c])=>{const m=box(s,s,s,c,true);m.position.set(x,y,z);m.userData={y,s};flame.add(m);return m;});
  const glow=new THREE.PointLight(0xff8a3d,9,14); glow.position.set(0,5.5,0); world.add(glow);

  // floating learning blocks and sparks
  const floaters=[], cols=[0xf26b21,0x2f7fc8,0xf5b82e,0xd8437c,0x3d9a40,0x24386a];
  for(let i=0;i<10;i++){ const s=.35+(i%3)*.18; const m=box(s,s,s,cols[i%cols.length]);
    m.userData={a:i/10*Math.PI*2,r:6.2+(i%3)*.9,h:1.5+(i%5)*1.1,sp:.25+(i%4)*.06}; world.add(m); floaters.push(m); }
  const sparks=[]; for(let i=0;i<10;i++){ const m=box(.14,.14,.14,i%2?0xffc94d:0xff8a3d,true); m.userData={o:Math.random()*3,x:(Math.random()-.5)*1.4,z:(Math.random()-.5)*1.4}; world.add(m); sparks.push(m); }

  world.position.y=-1.3;
  const base=new THREE.Vector3(17,14,17);
  function size(){ const w=canvas.clientWidth,h=canvas.clientHeight; if(!w||!h)return; renderer.setSize(w,h,false); cam.aspect=w/h; cam.fov=w<420?34:30; cam.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(canvas); size();
  let visible=true; new IntersectionObserver(e=>{visible=e[0].isIntersecting;}).observe(canvas);
  let tx=0,ty=0,mx=0,my=0;
  addEventListener('pointermove',e=>{tx=e.clientX/innerWidth-.5; ty=e.clientY/innerHeight-.5;},{passive:true});
  const clock=new THREE.Clock();
  function frame(){
    requestAnimationFrame(frame);
    if(!visible||document.hidden) return;
    const t=clock.getElapsedTime();
    mx+=(tx-mx)*.05; my+=(ty-my)*.05;
    const sc=Math.min(scrollY/innerHeight,1);
    cam.position.set(base.x+mx*4, base.y+my*-3+sc*4, base.z); cam.lookAt(0,1.4-sc*1.5,0);
    if(!reduce){
      world.rotation.y=-0.35+Math.sin(t*.15)*.35+mx*.4;
      world.position.y=-1.3+Math.sin(t*1.1)*.12;
      fm.forEach((m,i)=>{m.position.y=m.userData.y+Math.sin(t*6+i)*.07; m.scale.setScalar(.88+Math.sin(t*8+i*1.7)*.12); m.rotation.y=t*(i%2?.6:-.6);});
      glow.intensity=8+Math.sin(t*9)*1.6;
      floaters.forEach(m=>{const u=m.userData,a=u.a+t*u.sp; m.position.set(Math.cos(a)*u.r,u.h+Math.sin(t*1.4+u.a)*.4,Math.sin(a)*u.r); m.rotation.set(t*.5+u.a,t*.7,0);});
      sparks.forEach(m=>{const u=m.userData,p=((t*.6+u.o)%3)/3; m.position.set(u.x*(1+p),5.8+p*3.2,u.z*(1+p)); m.scale.setScalar(1-p);});
      kids.forEach((k,i)=>{const u=k.userData; k.position.y=Math.abs(Math.sin(t*2.4+u.ph))*.12; u.armR.rotation.x=i%2? -1.2+Math.sin(t*5+u.ph)*.5 : Math.sin(t*3+u.ph)*.4;});
    }
    renderer.render(scene,cam);
  }
  frame(); art.classList.add('live');
}
