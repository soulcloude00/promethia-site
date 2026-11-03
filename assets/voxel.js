// Lightweight voxel island with a block torch. Falls back to static art if WebGL is unavailable.
const art = document.getElementById('heroArt');
const canvas = document.getElementById('voxel');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function hasGL(){try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){return false;}}
if (canvas && hasGL()) init().catch(()=>{});
async function init(){
  const THREE = await import('./three.module.min.js');
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  cam.position.set(14, 12, 14); cam.lookAt(0, 1.6, 0);
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x1a2a4f, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(6, 12, 4); scene.add(sun);
  const world = new THREE.Group(); scene.add(world);
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mats = {};
  const mat = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({color:c}));
  const put = (x,y,z,c,g=world) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x,y,z); g.add(m); return m; };
  // island
  const R = 3.6;
  for (let x=-4;x<=4;x++) for (let z=-4;z<=4;z++){
    const d = Math.hypot(x,z); if (d>R+.4) continue;
    put(x,0,z,(x+z)%2?0x6cbf4b:0x7fd05a);
    if (d<R-0.6) put(x,-1,z,0x8a5a2b);
    if (d<R-1.8) put(x,-2,z,0x7a7f8c);
  }
  // trees
  [[-2.6,-1.4],[2.4,-2.4]].forEach(([x,z])=>{ x=Math.round(x); z=Math.round(z);
    put(x,1,z,0x8a5a2b); put(x,2,z,0x8a5a2b);
    for (let a=-1;a<=1;a++) for (let b=-1;b<=1;b++) put(x+a,3,z+b,0x3f9a3a);
    put(x,4,z,0x4caf50);
  });
  // learning blocks
  put(2,1,2,0x3a8fd9); put(3,1,1,0xe84f8a); put(2,2,2,0xf5b82e); put(-2,1,2,0xf5b82e);
  // torch: navy base + orange flame
  [[0,1,0],[0,2,0]].forEach(p=>put(...p,0x1a2a4f));
  for (let a=-1;a<=1;a++) for (let b=-1;b<=1;b++) put(a,3,b,0x24386a);
  const flame = new THREE.Group(); world.add(flame);
  const fl = [[0,4,0,0xf26b21],[1,4,0,0xf26b21],[-1,4,0,0xf26b21],[0,4,1,0xf26b21],[0,4,-1,0xf26b21],
    [0,5,0,0xff9a4d],[1,5,0,0xf26b21],[0,5,1,0xf26b21],[0,6,0,0xffc94d],[0,7,0,0xfff1a8]];
  const fm = fl.map(([x,y,z,c])=>{ const m = put(x,y,z,c,flame); m.material = new THREE.MeshBasicMaterial({color:c}); m.userData.y=y; return m; });
  const glow = new THREE.PointLight(0xff8a3d, 8, 12); glow.position.set(0,5,0); world.add(glow);
  // floating sparks
  const sparks = [];
  for (let i=0;i<8;i++){ const s=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3), new THREE.MeshBasicMaterial({color:i%2?0xffc94d:0xf26b21}));
    s.userData={a:i/8*Math.PI*2,r:4.5+(i%3)*.6,h:2+(i%4)}; world.add(s); sparks.push(s); }
  world.position.y = -0.6;
  function size(){ const w=canvas.clientWidth,h=canvas.clientHeight; renderer.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); }
  new ResizeObserver(size).observe(canvas); size();
  let visible = true;
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;}).observe(canvas);
  let px=0; art.addEventListener('pointermove',e=>{const r=art.getBoundingClientRect();px=((e.clientX-r.left)/r.width-.5);});
  const clock = new THREE.Clock();
  function frame(){
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (!reduce){
      world.rotation.y = t*0.18 + px*0.6;
      world.position.y = -0.6 + Math.sin(t*1.2)*0.15;
      fm.forEach((m,i)=>{ m.position.y = m.userData.y + Math.sin(t*6+i)*0.08; const s=0.9+Math.sin(t*8+i*1.7)*0.1; m.scale.setScalar(s); });
      glow.intensity = 7 + Math.sin(t*9)*1.5;
      sparks.forEach(s=>{ const u=s.userData, a=u.a+t*0.5; s.position.set(Math.cos(a)*u.r, u.h+Math.sin(t*2+u.a)*0.5, Math.sin(a)*u.r); s.rotation.set(t,t,0); });
    } else world.rotation.y = 0.6;
    renderer.render(scene, cam);
  }
  frame();
  art.classList.add('live');
}
