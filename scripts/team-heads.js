import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const cards = [...document.querySelectorAll('[data-team-model]')];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const views = new Set();
let pointer = null;
let frame = 0;

// Only animate while a visible head is moving toward its target.
function animate() {
  frame = 0;
  let moving = false;
  for (const view of views) {
    if (!view.visible || !view.head || document.hidden) continue;
    const rect = view.host.getBoundingClientRect();
    const x = pointer && !motion.matches ? THREE.MathUtils.clamp((pointer.x - rect.left - rect.width / 2) / (innerWidth / 2), -1, 1) * 0.55 : 0;
    const y = pointer && !motion.matches ? THREE.MathUtils.clamp((pointer.y - rect.top - rect.height / 2) / (innerHeight / 2), -1, 1) * 0.32 : 0;
    view.head.rotation.y = motion.matches ? 0 : THREE.MathUtils.lerp(view.head.rotation.y, x, 0.14);
    view.head.rotation.x = motion.matches ? 0 : THREE.MathUtils.lerp(view.head.rotation.x, y, 0.14);
    moving ||= Math.abs(view.head.rotation.y - x) + Math.abs(view.head.rotation.x - y) > 0.001;
    view.renderer.render(view.scene, view.camera);
  }
  if (moving) requestRender();
}
function requestRender() { if (!frame) frame = requestAnimationFrame(animate); }

async function createHead(card) {
  const host = card.querySelector('.team-avatar');
  let renderer;
  let environment;
  let pmrem;
  let room;
  let scene;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    scene = new THREE.Scene();
    pmrem = new THREE.PMREMGenerator(renderer);
    room = new RoomEnvironment();
    environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
    const { scene: model } = await new GLTFLoader().loadAsync(card.dataset.teamModel);
    const material = new THREE.MeshStandardMaterial({ color: 0x363b40, metalness: 1, roughness: 0.2 });
    model.traverse(object => {
      if (!object.isMesh) return;
      const originals = Array.isArray(object.material) ? object.material : [object.material];
      originals.forEach(original => original?.dispose());
      object.material = material;
    });
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 2 / size.y;
    model.position.copy(center).multiplyScalar(-scale);
    model.scale.setScalar(scale);
    const head = new THREE.Group();
    head.add(model);
    scene.add(head);
    camera.position.set(0, 0, 4.7);
    const view = { host, renderer, scene, camera, head, visible: true };
    const resize = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Fit both narrow mobile cards and wide desktop cards.
      camera.position.z = Math.max(4.7, size.x / size.y * 4.3 / camera.aspect);
      camera.updateProjectionMatrix();
      requestRender();
    });
    resize.observe(host);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      card.classList.remove('is-model-ready');
      views.delete(view);
      resize.disconnect();
      renderer.dispose();
      environment.dispose();
    });
    host.append(renderer.domElement);
    views.add(view);
    renderer.render(scene, camera);
    card.classList.add('is-model-ready');
    const visibility = new IntersectionObserver(([entry]) => {
      view.visible = entry.isIntersecting;
      if (view.visible) requestRender();
    });
    visibility.observe(host);
    requestRender();
  } catch (error) {
    // Keep the static portrait when WebGL or the model is unavailable.
    renderer?.dispose();
    environment?.dispose();
    room?.dispose();
    pmrem?.dispose();
    console.warn('Team portrait is using its static fallback.', error);
  }
}

if (cards.length) {
  const loader = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      loader.unobserve(entry.target);
      createHead(entry.target);
    }
  }, { rootMargin: '200px' });
  cards.forEach(card => loader.observe(card));
  window.addEventListener('pointermove', event => {
    if (!finePointer.matches || event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    requestRender();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer = null; requestRender(); });
  window.addEventListener('blur', () => { pointer = null; requestRender(); });
  document.addEventListener('visibilitychange', requestRender);
  motion.addEventListener('change', requestRender);
}
