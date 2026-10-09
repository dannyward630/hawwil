/* 3D background: floating translucent "documents", wireframe shapes and particles (three.js, WebGL). */
import * as THREE from '../vendor/three.module.min.js';

export function start3D(canvas) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => innerWidth < 720;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch (e) { canvas.style.display = 'none'; return null; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
  camera.position.set(0, 0, 9);
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(3, 5, 6); scene.add(sun);
  const glowA = new THREE.PointLight(0x58a6ff, 28, 24); glowA.position.set(-6, 3, 4); scene.add(glowA);
  const glowB = new THREE.PointLight(0x8957e5, 28, 24); glowB.position.set(6, -3, 3); scene.add(glowB);

  const COLORS = [0x58a6ff, 0x8957e5, 0x3ddc97, 0xff7ab6, 0x58a6ff, 0x8957e5];
  const count = small() ? 7 : 13;
  const items = [];
  const sheetGeo = new THREE.BoxGeometry(1, 1.38, 0.06);
  const edgeGeo = new THREE.EdgesGeometry(sheetGeo);
  const mats = [], lines = [];

  for (let i = 0; i < count; i++) {
    const color = COLORS[i % COLORS.length];
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.25, roughness: 0.35, transparent: true, opacity: 0.62 });
    const mesh = new THREE.Mesh(sheetGeo, mat);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
    mesh.add(new THREE.LineSegments(edgeGeo, lineMat));
    const s = 0.7 + Math.random() * 0.9;
    mesh.scale.setScalar(s);
    mesh.position.set((Math.random() - 0.5) * 19, (Math.random() - 0.5) * 11, -11 + Math.random() * 8);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(mesh);
    mats.push(mat); lines.push(lineMat);
    items.push({ mesh, rot: new THREE.Vector3((Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.2), amp: 0.25 + Math.random() * 0.4, ph: Math.random() * 6.28, base: mesh.position.y });
  }
  /* wireframe accents */
  const wireMats = [];
  [[new THREE.IcosahedronGeometry(0.9, 0), -6.5, 1.5, -4], [new THREE.OctahedronGeometry(0.8, 0), 6.5, -2.2, -4], [new THREE.TorusGeometry(0.9, 0.22, 10, 36), -3.2, 4.4, -8]].forEach(([g, x, y, z]) => {
    if (small() && x === 6.5) return;
    const m = new THREE.MeshBasicMaterial({ color: 0x58a6ff, wireframe: true, transparent: true, opacity: 0.45 });
    const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); scene.add(mesh);
    wireMats.push(m);
    items.push({ mesh, rot: new THREE.Vector3(0.25, 0.35, 0.1), amp: 0.3, ph: Math.random() * 6, base: y });
  });
  /* particles */
  const N = small() ? 160 : 420, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 30; pos[i * 3 + 1] = (Math.random() - 0.5) * 18; pos[i * 3 + 2] = -12 + Math.random() * 16; }
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x9cc9ff, size: 0.05, transparent: true, opacity: 0.8, sizeAttenuation: true });
  const points = new THREE.Points(pGeo, pMat); scene.add(points);

  function setTheme(light) {
    mats.forEach(m => { m.opacity = light ? 0.5 : 0.62; });
    lines.forEach(l => { l.color.set(light ? 0x1f3b73 : 0xffffff); l.opacity = light ? 0.35 : 0.55; });
    wireMats.forEach(w => { w.color.set(light ? 0x1f6feb : 0x58a6ff); w.opacity = light ? 0.55 : 0.45; });
    pMat.color.set(light ? 0x3b6fd0 : 0x9cc9ff); pMat.opacity = light ? 0.55 : 0.8;
    glowA.intensity = glowB.intensity = light ? 16 : 28;
    ambient.intensity = light ? 1.1 : 0.75;
  }
  const ambient = scene.children.find(o => o.isAmbientLight);
  setTheme(document.documentElement.dataset.theme === 'light');
  new MutationObserver(() => setTheme(document.documentElement.dataset.theme === 'light'))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small() ? 1.25 : 1.6));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 720 ? 11 : 9;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  let mx = 0, my = 0, tx = 0, ty = 0, scrollY0 = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  addEventListener('scroll', () => { scrollY0 = scrollY; }, { passive: true });

  const clock = new THREE.Clock();
  let raf = 0, running = true;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    items.forEach(it => {
      it.mesh.rotation.x += it.rot.x * dt; it.mesh.rotation.y += it.rot.y * dt; it.mesh.rotation.z += it.rot.z * dt;
      it.mesh.position.y = it.base + Math.sin(t * 0.6 + it.ph) * it.amp;
    });
    points.rotation.y = t * 0.012; points.rotation.x = Math.sin(t * 0.1) * 0.03;
    tx += (mx * 1.6 - tx) * 0.04; ty += (-my * 1.0 - ty) * 0.04;
    camera.position.x = tx; camera.position.y = ty - Math.min(scrollY0, 2400) * 0.0016;
    camera.lookAt(0, camera.position.y * 0.5, 0);
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function go() { if (!running) { running = true; clock.getDelta(); raf = requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : (!reduce && go())));

  if (reduce) { running = false; frame(); } else frame();
  canvas.classList.add('on');
  return { stop, go };
}
