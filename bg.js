// Animated dot-terrain background (three.js). Lives in the hero in 2D view and
// behind the book in 3D view. Falls back to the CSS grid if WebGL is unavailable.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const root = document.documentElement;
const canvas = document.getElementById('bgCanvas');
const hero = document.querySelector('.hero');
const stage = document.getElementById('bookStage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixel;
  varying float vDepth;
  varying float vHeight;

  void main() {
    vec3 p = position;
    float h = sin(p.x * 0.18 + uTime * 0.6) * 0.9
            + cos(p.z * 0.25 + uTime * 0.4) * 0.7
            + sin((p.x + p.z) * 0.12 + uTime * 0.3) * 0.6;
    float d = distance(p.xz, vec2(uMouse.x * 22.0, -6.0 + uMouse.y * 10.0));
    h += exp(-d * d * 0.03) * 1.8;
    p.y += h;
    vHeight = h;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPixel * (36.0 / vDepth);
  }
`;

const fragmentShader = `
  uniform vec3 uAccent;
  uniform vec3 uInk;
  uniform float uOpacity;
  varying float vDepth;
  varying float vHeight;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    float fade = smoothstep(42.0, 12.0, vDepth) * smoothstep(2.0, 7.0, vDepth);
    vec3 color = mix(uInk, uAccent, smoothstep(-0.4, 2.0, vHeight));
    gl_FragColor = vec4(color, fade * uOpacity);
  }
`;

function cssColor(name) {
  return new THREE.Color(getComputedStyle(root).getPropertyValue(name).trim() || '#888888');
}

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) {
    canvas.remove();
    return;
  }
  root.classList.add('has-webgl');

  const small = window.innerWidth < 700;
  const cols = small ? 80 : 150;
  const rows = small ? 50 : 70;
  const spacing = 0.5;
  const positions = new Float32Array(cols * rows * 3);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const k = (i * rows + j) * 3;
      positions[k] = (i - cols / 2) * spacing;
      positions[k + 1] = 0;
      positions[k + 2] = -j * spacing + 10;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPixel: { value: Math.min(window.devicePixelRatio, 2) },
    uAccent: { value: cssColor('--accent') },
    uInk: { value: cssColor('--ink-3') },
    uOpacity: { value: 0.6 },
  };
  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false });

  const scene = new THREE.Scene();
  scene.add(new THREE.Points(geometry, material));
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 5.5, 17);
  camera.lookAt(0, 0, -8);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function refreshColors() {
    uniforms.uAccent.value = cssColor('--accent');
    uniforms.uInk.value = cssColor('--ink-3');
    const theme = root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const dark = theme === 'dark';
    uniforms.uOpacity.value = dark ? 0.75 : 0.55;
  }

  function place() {
    const inBook = root.getAttribute('data-view') === '3d';
    const parent = inBook ? stage : hero;
    if (canvas.parentNode !== parent) parent.prepend(canvas);
    resize();
  }

  function resize() {
    const parent = canvas.parentNode;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!running) renderer.render(scene, camera);
  }

  const target = new THREE.Vector2(0, 0);
  window.addEventListener('pointermove', (e) => {
    target.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
  }, { passive: true });

  let running = false;
  let visible = true;
  const clock = new THREE.Clock();

  function frame() {
    if (!running) return;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.lerp(target, 0.05);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  function updateRunning() {
    const shouldRun = visible && !document.hidden && !reduceMotion;
    if (shouldRun && !running) {
      running = true;
      requestAnimationFrame(frame);
    } else if (!shouldRun) {
      running = false;
    }
  }

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    updateRunning();
  }).observe(canvas);
  document.addEventListener('visibilitychange', updateRunning);
  window.addEventListener('resize', resize);

  // Follow theme and view changes
  new MutationObserver(() => {
    refreshColors();
    place();
    if (!running) renderer.render(scene, camera);
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-view'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refreshColors);

  refreshColors();
  place();
  renderer.render(scene, camera);
  updateRunning();
}

init();
