"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── Constants ───────────────────────────────────────────────────────────────
const SIM_SIZE = 256; // 256×256 = 65 536 particles
const N = SIM_SIZE * SIM_SIZE;

// ─── GLSL: full-screen quad vertex (used for GPGPU passes) ──────────────────
const SIM_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// ─── GLSL: simplex-noise helpers ─────────────────────────────────────────────
const NOISE = /* glsl */ `
vec3 mod289v3(vec3 x){return x - floor(x*(1./289.))*289.;}
vec4 mod289v4(vec4 x){return x - floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289v4(((x*34.)+10.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(1./6., 1./3.);
  const vec4 D = vec4(0., 0.5, 1., 2.);
  vec3 i  = floor(v + dot(v,C.yyy));
  vec3 x0 = v - i + dot(i,C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1. - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289v3(i);
  vec4 p = permute(permute(permute(
    i.z+vec4(0.,i1.z,i2.z,1.))
    +i.y+vec4(0.,i1.y,i2.y,1.))
    +i.x+vec4(0.,i1.x,i2.x,1.));
  float n_ = 0.142857142857;
  vec3  ns = n_*D.wyz - D.xzx;
  vec4  j  = p - 49.*floor(p*ns.z*ns.z);
  vec4  x_ = floor(j*ns.z);
  vec4  y_ = floor(j - 7.*x_);
  vec4  x  = x_*ns.x + ns.yyyy;
  vec4  y  = y_*ns.x + ns.yyyy;
  vec4  h  = 1. - abs(x) - abs(y);
  vec4 b0  = vec4(x.xy, y.xy);
  vec4 b1  = vec4(x.zw, y.zw);
  vec4 s0  = floor(b0)*2.+1.;
  vec4 s1  = floor(b1)*2.+1.;
  vec4 sh  = -step(h, vec4(0.));
  vec4 a0  = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1  = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0  = vec3(a0.xy,  h.x);
  vec3 p1  = vec3(a0.zw,  h.y);
  vec3 p2  = vec3(a1.xy,  h.z);
  vec3 p3  = vec3(a1.zw,  h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m = max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m = m*m;
  return 42.*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

// ─── GLSL: position simulation (ping-pong) ───────────────────────────────────
const SIM_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uCurrent;
uniform sampler2D uTarget;
uniform float     uTime;
uniform float     uSpeed;
uniform float     uTurbulence;
uniform vec3      uMouse;
uniform float     uMouseForce;
uniform float     uBlobStrength;
varying vec2 vUv;

${NOISE}

void main() {
  vec4 cur = texture2D(uCurrent, vUv);
  vec4 tgt = texture2D(uTarget,  vUv);

  vec3 pos = cur.xyz;
  vec3 dst = tgt.xyz;
  float blobPhase = uTime * 0.38;
  float blobNoise = snoise(dst * 0.55 + vec3(blobPhase, blobPhase * 0.7, blobPhase * 1.1));
  float blobWave = snoise(dst.yzx * 0.32 + vec3(0.0, blobPhase * 0.6, 4.0));
  dst += normalize(dst + vec3(0.001, 0.002, 0.003))
    * (0.24 * blobNoise + 0.12 * blobWave) * uBlobStrength;
  vec3 toTarget = dst - pos;
  float d = length(toTarget);
  vec3 dir = d > 0.0001 ? toTarget / d : vec3(0.0);

  float t = uTime * 0.18;
  vec3 noise = vec3(
    snoise(pos * 0.35 + vec3(t,       0.,    0.)),
    snoise(pos * 0.35 + vec3(0., t+17.3,    0.)),
    snoise(pos * 0.35 + vec3(0.,    0., t+41.7))
  );

  vec3 axis = normalize(vec3(
    snoise(dst.yzx * 0.21 + vec3(11.0, t, 3.0)),
    snoise(dst.zxy * 0.21 + vec3(7.0, 5.0, t)),
    snoise(dst.xyz * 0.21 + vec3(t, 13.0, 17.0))
  ) + vec3(0.001, 0.002, 0.003));
  vec3 swirl = cross(dir, axis);

  float pull = uSpeed * (0.02 + smoothstep(0.0, 4.5, d) * 0.06);
  float swirlAmt = uTurbulence * smoothstep(0.18, 3.5, d) * 0.026;
  float noiseAmt = uTurbulence * (0.012 + smoothstep(0.2, 2.8, d) * 0.022);
  vec3 mouseDelta = pos - uMouse;
  float mouseDist = length(mouseDelta);
  float mouseZone = 1.0 - smoothstep(0.0, 1.75, mouseDist);
  vec3 mouseDir = mouseDist > 0.0001 ? mouseDelta / mouseDist : dir;
  vec3 mouseForce = mouseDir * mouseZone * uMouseForce * 0.12;

  pos += toTarget * pull;
  pos += swirl * swirlAmt;
  pos += noise * noiseAmt;
  pos += mouseForce;
  gl_FragColor = vec4(pos, cur.w);
}
`;

// ─── GLSL: particle vertex ────────────────────────────────────────────────────
const PART_VERT = /* glsl */ `
precision highp float;
uniform sampler2D uPosTex;
uniform float     uSize;
uniform float     uSizeScale;

varying float vLife;
varying vec3  vPos;

void main() {
  vec4 pd   = texture2D(uPosTex, uv);
  vPos      = pd.xyz;
  vLife     = pd.w;

  vec4 mv   = modelViewMatrix * vec4(pd.xyz, 1.0);
  float dep = -mv.z;

  gl_PointSize = uSize * uSizeScale * (280. / max(dep, 0.5));
  gl_PointSize = clamp(gl_PointSize, 0.4, 14.0);
  gl_Position  = projectionMatrix * mv;
}
`;

// ─── GLSL: particle fragment ──────────────────────────────────────────────────
const PART_FRAG = /* glsl */ `
precision highp float;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform float uTime;

varying float vLife;
varying vec3  vPos;

void main() {
  vec2  coord = gl_PointCoord - 0.5;
  float d     = length(coord) * 2.0;
  if (d > 1.0) discard;

  float alpha = 1.0 - smoothstep(0.0, 1.0, d);
  alpha = pow(alpha, 1.6);

  float core = 1.0 - smoothstep(0.0, 0.28, d);
  vec3  col  = mix(uColorA, uColorB, vLife) * alpha;
  col  += vec3(0.55, 0.75, 1.0) * core * 0.65;

  gl_FragColor = vec4(col, alpha * 0.88);
}
`;

// ─── Shape generators (CPU) ───────────────────────────────────────────────────
function sphere(n: number, r = 2.6): Float32Array {
  const d = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const shellMix = Math.random();
    const rad = shellMix < 0.82
      ? r * (0.88 + Math.random() * 0.12)
      : r * Math.cbrt(Math.random()) * 0.9;
    d[i*4]   = rad * Math.sin(phi) * Math.cos(theta);
    d[i*4+1] = rad * Math.sin(phi) * Math.sin(theta);
    d[i*4+2] = rad * Math.cos(phi);
    d[i*4+3] = Math.random();
  }
  return d;
}

function mkTex(data: Float32Array): THREE.DataTexture {
  const t = new THREE.DataTexture(data, SIM_SIZE, SIM_SIZE, THREE.RGBAFormat, THREE.FloatType);
  t.needsUpdate = true;
  return t;
}

async function loadMaskToParticles(src: string, n: number, scale = 3.45): Promise<Float32Array> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error(`Failed to load shape asset: ${src}`));
    el.src = src;
  });

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return sphere(n);

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);

  const { data } = ctx.getImageData(0, 0, size, size);
  const edgePoints: Array<[number, number]> = [];
  const bodyPoints: Array<[number, number]> = [];

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const idx = (y * size + x) * 4;
      const alpha = data[idx + 3];
      const luminance = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (alpha < 20 || luminance < 30) continue;

      const neighbors = [
        data[idx - 4 + 3],
        data[idx + 4 + 3],
        data[idx - size * 4 + 3],
        data[idx + size * 4 + 3],
      ];
      const edge = neighbors.some(v => v < 20);
      const px = x / size - 0.5;
      const py = 0.5 - y / size;

      if (edge) {
        if (Math.random() < 0.8) edgePoints.push([px, py]);
      } else if (Math.random() < 0.18) {
        bodyPoints.push([px, py]);
      }
    }
  }

  const points = [...edgePoints, ...bodyPoints];
  if (points.length === 0) return sphere(n);

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point[0]);
    maxX = Math.max(maxX, point[0]);
    minY = Math.min(minY, point[1]);
    maxY = Math.max(maxY, point[1]);
  }

  const width = Math.max(maxX - minX, 0.001);
  const height = Math.max(maxY - minY, 0.001);
  const fit = scale / Math.max(width, height);
  const centerX = (minX + maxX) * 0.5;
  const centerY = (minY + maxY) * 0.5;

  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const useEdge = edgePoints.length > 0 && (i % 100) < 68;
    const source = useEdge ? edgePoints : (bodyPoints.length > 0 ? bodyPoints : edgePoints);
    const point = source[(Math.random() * source.length) | 0];
    const nx = (point[0] - centerX) * fit;
    const ny = (point[1] - centerY) * fit;
    const radius = Math.sqrt(nx * nx + ny * ny);
    const depthSpread = useEdge ? 0.12 : 0.22;
    out[i * 4] = nx + (Math.random() - 0.5) * (useEdge ? 0.02 : 0.035);
    out[i * 4 + 1] = ny + (Math.random() - 0.5) * (useEdge ? 0.02 : 0.035);
    out[i * 4 + 2] = (Math.random() - 0.5) * depthSpread + radius * 0.015 * (Math.random() - 0.5);
    out[i * 4 + 3] = Math.random();
  }
  return out;
}

// ─── Shape metadata ───────────────────────────────────────────────────────────
const SHAPES = [
  { label: "Sphere",   icon: "○", gen: () => sphere(N) },
  { label: "Airplane", icon: "✈", asset: "/shapes/airplane.svg" },
  { label: "Cat",      icon: "🐱", asset: "/shapes/cat.svg" },
  { label: "Dog",      icon: "🐶", asset: "/shapes/dog.svg" },
] as const;

const INTENT_TO_SHAPE: Record<string, number> = {
  sphere: 0,
  blob: 0,
  neutral: 0,
  calm: 0,
  airplane: 1,
  plane: 1,
  flight: 1,
  aviation: 1,
  cat: 2,
  kitten: 2,
  feline: 2,
  dog: 3,
  puppy: 3,
  canine: 3,
};

// ─── Component ────────────────────────────────────────────────────────────────
interface Ctrl { speed: number; turbulence: number; size: number }
interface ChatMessage { role: "assistant" | "user"; text: string }
interface BackendEmotionPayload {
  message: string;
  emotion?: string;
  shapeIntent?: string;
}
interface ShapeState {
  index: number;
  sizeScale: number;
  blobStrength: number;
}
interface HistorySession {
  id: string;
  title: string;
  preview: string;
  state: string;
  timestamp: string;
}

function inferShapeIntentFromText(input: string): string {
  const value = input.trim().toLowerCase();
  if (!value) return "sphere";

  const matchers: Array<{ intent: string; terms: string[] }> = [
    { intent: "airplane", terms: ["airplane", "plane", "pilot", "flight", "airport", "aviation", "jet", "fly", "boarding", "travel", "✈", "✈️"] },
    { intent: "cat", terms: ["cat", "kitten", "feline", "meow", "pet", "🐱", "😺", "😸", "😻"] },
    { intent: "dog", terms: ["dog", "puppy", "canine", "bark", "🐶", "🦮", "🐕", "dog food"] },
  ];

  for (const matcher of matchers) {
    if (matcher.terms.some(term => value.includes(term))) {
      return matcher.intent;
    }
  }

  return "sphere";
}

export default function ParticleSimulation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ctrl,  setCtrl]  = useState<Ctrl>({ speed: 1, turbulence: 0.6, size: 1 });
  const [prompt, setPrompt] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentState, setCurrentState] = useState("sphere");
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraMode, setCameraMode] = useState<"rear" | "selfie">("rear");
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false);
  const [historySessions, setHistorySessions] = useState<HistorySession[]>([
    {
      id: "initial",
      title: "Welcome session",
      preview: "Emotion-driven particle states will come from your backend.",
      state: "sphere",
      timestamp: "Now",
    },
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Emotion-driven particle states will come from your backend. This panel is ready for the chat flow.",
    },
  ]);

  // Live refs so the animation loop always reads current values
  const ctrlRef = useRef(ctrl);
  const shapeStateRef = useRef<ShapeState>({ index: 0, sizeScale: 1, blobStrength: 0.95 });
  const applyBackendStateRef = useRef<((payload: BackendEmotionPayload) => void) | null>(null);

  useEffect(() => { ctrlRef.current = ctrl; }, [ctrl]);
  useEffect(() => {
    if (!drawerOpen || !messagesRef.current) return;
    const node = messagesRef.current;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      setCameraMenuOpen(false);
    }
  }, [drawerOpen]);

  // ── Three.js scene lifecycle ──────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);

    // Main scene & camera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.z = 7;

    // GPGPU render targets (ping-pong)
    const rtOpts: THREE.RenderTargetOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format:    THREE.RGBAFormat,
      type:      THREE.FloatType,
    };
    let rtA = new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, rtOpts);
    let rtB = rtA.clone();

    // GPGPU scene (full-screen quad)
    const gpuScene  = new THREE.Scene();
    const gpuCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const shapeTex = SHAPES.map(s => mkTex("gen" in s && typeof s.gen === "function" ? s.gen() : sphere(N)));

    // Seed RT-A with sphere positions
    const seedMat = new THREE.ShaderMaterial({
      vertexShader:   SIM_VERT,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uTex;
        varying vec2 vUv;
        void main(){ gl_FragColor = texture2D(uTex, vUv); }
      `,
      uniforms: { uTex: { value: shapeTex[0] } },
    });
    const seedQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), seedMat);
    gpuScene.add(seedQuad);
    renderer.setRenderTarget(rtA);
    renderer.render(gpuScene, gpuCamera);
    renderer.setRenderTarget(null);
    gpuScene.remove(seedQuad);
    seedMat.dispose();

    // Simulation material
    const simMat = new THREE.ShaderMaterial({
      vertexShader:   SIM_VERT,
      fragmentShader: SIM_FRAG,
      uniforms: {
        uCurrent:     { value: rtA.texture       },
        uTarget:      { value: shapeTex[0]       },
        uTime:        { value: 0                 },
        uSpeed:       { value: 1                 },
        uTurbulence:  { value: 0.6               },
        uMouse:       { value: new THREE.Vector3(999, 999, 999) },
        uMouseForce:  { value: 0                 },
        uBlobStrength:{ value: 1                 },
      },
    });
    const simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat);
    gpuScene.add(simQuad);

    // Particle geometry — store UV coords so the vertex shader can sample the pos texture
    const geo  = new THREE.BufferGeometry();
    const uvs  = new Float32Array(N * 2);
    const pos0 = new Float32Array(N * 3); // dummy positions (overridden in shader)
    for (let i = 0; i < SIM_SIZE; i++) {
      for (let j = 0; j < SIM_SIZE; j++) {
        const k = i * SIM_SIZE + j;
        uvs[k*2]   = j / (SIM_SIZE - 1);
        uvs[k*2+1] = i / (SIM_SIZE - 1);
      }
    }
    geo.setAttribute("uv",       new THREE.BufferAttribute(uvs,  2));
    geo.setAttribute("position", new THREE.BufferAttribute(pos0, 3));

    // Particle material
    const partMat = new THREE.ShaderMaterial({
      vertexShader:   PART_VERT,
      fragmentShader: PART_FRAG,
      uniforms: {
        uPosTex: { value: rtA.texture                  },
        uSize:   { value: 1                            },
        uSizeScale: { value: 1                         },
        uTime:   { value: 0                            },
        uColorA: { value: new THREE.Color(0.08, 0.25, 0.95) },
        uColorB: { value: new THREE.Color(0.45, 0.70, 1.00) },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geo, partMat);
    scene.add(particles);

    // Mouse tracking for drag orbit + local particle interaction
    let mx = 0, my = 0;
    let mouseForce = 0;
    let orbitX = 0.18;
    let orbitY = 0.35;
    let targetOrbitX = orbitX;
    let targetOrbitY = orbitY;
    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    const ndc = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const worldPoint = new THREE.Vector3();
    const localPoint = new THREE.Vector3();
    const offscreenMouse = new THREE.Vector3(999, 999, 999);
    const updatePointer = (clientX: number, clientY: number) => {
      mx = (clientX / mount.clientWidth - 0.5) * 2;
      my = (clientY / mount.clientHeight - 0.5) * 2;
    };
    const onMouse = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
      if (dragging) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        targetOrbitY += dx * 0.006;
        targetOrbitX += dy * 0.006;
        targetOrbitX = Math.max(-1.2, Math.min(1.2, targetOrbitX));
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      }
      mouseForce = 1;
    };
    mount.addEventListener("mousemove", onMouse);
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      mount.setPointerCapture(e.pointerId);
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      if (mount.hasPointerCapture(e.pointerId)) {
        mount.releasePointerCapture(e.pointerId);
      }
    };
    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointercancel", onPointerUp);

    // Touch support
    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      mouseForce = 1;
    };
    mount.addEventListener("touchmove", onTouch, { passive: true });
    const onLeave = () => {
      dragging = false;
      mouseForce = 0;
      simMat.uniforms.uMouse.value.copy(offscreenMouse);
    };
    mount.addEventListener("mouseleave", onLeave);
    mount.addEventListener("touchend", onLeave);
    mount.addEventListener("touchcancel", onLeave);

    const resolveShapeIndex = (value?: string) => {
      if (!value) return 0;
      const key = value.trim().toLowerCase();
      return INTENT_TO_SHAPE[key] ?? 0;
    };

    const applyShapeIndex = (idx: number) => {
      simMat.uniforms.uTarget.value = shapeTex[idx] ?? shapeTex[0];
      const isAssetShape = "asset" in SHAPES[idx];
      const nextShapeState = {
        index: idx,
        sizeScale: isAssetShape ? 0.9 : 1,
        blobStrength: idx === 0 ? 0.95 : 0.04,
      };
      shapeStateRef.current = nextShapeState;
      simMat.uniforms.uBlobStrength.value = nextShapeState.blobStrength;
      partMat.uniforms.uSizeScale.value = nextShapeState.sizeScale;
      setCurrentState(SHAPES[idx]?.label.toLowerCase() ?? "sphere");
    };

    applyBackendStateRef.current = payload => {
      const idx = resolveShapeIndex(payload.shapeIntent ?? payload.emotion);
      applyShapeIndex(idx);
    };

    SHAPES.forEach(async (shape, idx) => {
      if (!("asset" in shape)) return;
      try {
        const data = await loadMaskToParticles(shape.asset, N);
        const tex = mkTex(data);
        const old = shapeTex[idx];
        shapeTex[idx] = tex;
        if (simMat.uniforms.uTarget.value === old) {
          simMat.uniforms.uTarget.value = tex;
        }
        old.dispose();
      } catch (error) {
        console.error(error);
      }
    });

    // Animation loop
    let raf: number;
    let t = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += 0.016;

      const c = ctrlRef.current;

      // --- GPGPU pass ---
      simMat.uniforms.uCurrent.value    = rtA.texture;
      simMat.uniforms.uTime.value       = t;
      simMat.uniforms.uSpeed.value      = c.speed;
      simMat.uniforms.uTurbulence.value = c.turbulence;
      mouseForce += (0 - mouseForce) * 0.08;
      simMat.uniforms.uMouseForce.value = mouseForce;

      ndc.set(mx, -my);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, worldPoint)) {
        localPoint.copy(worldPoint);
        particles.worldToLocal(localPoint);
        simMat.uniforms.uMouse.value.copy(localPoint);
      } else {
        simMat.uniforms.uMouse.value.copy(offscreenMouse);
      }

      renderer.setRenderTarget(rtB);
      renderer.render(gpuScene, gpuCamera);
      renderer.setRenderTarget(null);

      // Ping-pong
      [rtA, rtB] = [rtB, rtA];

      // --- Particles pass ---
      partMat.uniforms.uPosTex.value = rtA.texture;
      partMat.uniforms.uSize.value   = c.size;
      partMat.uniforms.uSizeScale.value += (shapeStateRef.current.sizeScale - partMat.uniforms.uSizeScale.value) * 0.12;
      partMat.uniforms.uTime.value   = t;

      orbitX += (targetOrbitX - orbitX) * 0.12;
      orbitY += (targetOrbitY - orbitY) * 0.12;
      particles.rotation.x = orbitX;
      particles.rotation.y = orbitY;

      renderer.render(scene, camera);
    };
    tick();

    // Resize
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      mount.removeEventListener("mousemove", onMouse);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointercancel", onPointerUp);
      mount.removeEventListener("touchmove", onTouch);
      mount.removeEventListener("mouseleave", onLeave);
      mount.removeEventListener("touchend", onLeave);
      mount.removeEventListener("touchcancel", onLeave);
      applyBackendStateRef.current = null;
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      rtA.dispose(); rtB.dispose();
      geo.dispose(); partMat.dispose(); simMat.dispose();
      shapeTex.forEach(t => t.dispose());
    };
  }, []);

  const submitPrompt = () => {
    const value = prompt.trim();
    if (!value) return;

    const detectedShapeIntent = inferShapeIntentFromText(value);

    const payload: BackendEmotionPayload = {
      message: "Input text mapped to a shape intent locally. Replace this with your API response when backend is ready.",
      shapeIntent: detectedShapeIntent,
      emotion: detectedShapeIntent,
    };

    applyBackendStateRef.current?.(payload);

    setMessages(prev => [
      ...prev,
      { role: "user", text: value },
      {
        role: "assistant",
        text: `${payload.message} Current demo intent: ${payload.shapeIntent}.`,
      },
    ]);
    setHistorySessions(prev => [
      {
        id: `${Date.now()}`,
        title: value.slice(0, 42) || "Untitled session",
        preview: `Intent: ${detectedShapeIntent}`,
        state: detectedShapeIntent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
    setPrompt("");
    setDrawerOpen(true);
    setActiveTab("chat");
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative", overflow: "hidden" }}>
      {/* Canvas mount */}
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* ── Top-left badge ── */}
      <div style={{
        position: "absolute", top: "1.8rem", left: "2rem",
        color: "rgba(80,140,255,0.7)", fontFamily: "monospace",
        fontSize: "10px", letterSpacing: "3px",
        textTransform: "uppercase", userSelect: "none",
      }}>
        Gyaan-AI
      </div>

      <div
        style={{
          position: "absolute",
          top: "1.6rem",
          right: "1.5rem",
          zIndex: 3,
          display: "flex",
          gap: "0.55rem",
          padding: "0.6rem",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 10px 35px rgba(0,0,0,0.22)",
        }}
      >
        <button
          aria-label="Language"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "rgba(236,242,255,0.92)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h8" />
            <path d="M8 3v2c0 4-2 7-5 9" />
            <path d="M5 14c2 0 5-1 7-3" />
            <path d="M13 5h7" />
            <path d="M16.5 3v2c0 4 1.8 7.2 4.5 9" />
            <path d="M14 14c2.1 0 4.4-1.1 6-3" />
          </svg>
        </button>

        <button
          onClick={() => setDrawerOpen(open => !open)}
          aria-label={drawerOpen ? "Close chat" : "Open chat"}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: drawerOpen ? "rgba(100,140,255,0.18)" : "rgba(255,255,255,0.06)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "rgba(236,242,255,0.94)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" />
            <path d="M8 8.5h8" />
            <path d="M8 11.5h5" />
          </svg>
        </button>

        <button
          onClick={() => setMicEnabled(v => !v)}
          aria-label={micEnabled ? "Turn microphone off" : "Turn microphone on"}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: micEnabled ? "rgba(100,140,255,0.18)" : "rgba(255,255,255,0.06)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "rgba(236,242,255,0.94)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3z" />
            <path d="M19 11a7 7 0 0 1-14 0" />
            <path d="M12 18v3" />
            <path d="M8 21h8" />
          </svg>
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setCameraMenuOpen(v => !v)}
            aria-label="Camera controls"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: cameraEnabled ? "rgba(100,140,255,0.18)" : "rgba(255,255,255,0.06)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "rgba(236,242,255,0.94)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h4l2-2h4l2 2h4v10H4z" />
              <circle cx="12" cy="12" r="3.5" />
            </svg>
          </button>
          {cameraMenuOpen && (
            <div style={{
              position: "absolute",
              top: "52px",
              right: 0,
              width: "170px",
              padding: "0.45rem",
              background: "rgba(9,14,28,0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
              backdropFilter: "blur(14px)",
            }}>
              {[
                { label: "Rear Camera", mode: "rear" as const },
                { label: "Selfie Camera", mode: "selfie" as const },
              ].map(option => (
                <button
                  key={option.mode}
                  onClick={() => {
                    setCameraEnabled(true);
                    setCameraMode(option.mode);
                    setCameraMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.7rem 0.8rem",
                    borderRadius: "12px",
                    border: "none",
                    background: cameraEnabled && cameraMode === option.mode ? "rgba(84,125,255,0.16)" : "transparent",
                    color: "rgba(235,241,255,0.95)",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setCameraEnabled(false);
                  setCameraMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.7rem 0.8rem",
                  borderRadius: "12px",
                  border: "none",
                  background: "transparent",
                  color: "rgba(255,190,190,0.92)",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Turn Camera Off
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload files"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "rgba(236,242,255,0.94)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        style={{ display: "none" }}
      />

      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        padding: "5.8rem 1.5rem 1.5rem",
        background: drawerOpen ? "rgba(4, 8, 18, 0.08)" : "rgba(4, 8, 18, 0)",
        backdropFilter: drawerOpen ? "blur(4px)" : "blur(0px)",
        WebkitBackdropFilter: drawerOpen ? "blur(4px)" : "blur(0px)",
        opacity: drawerOpen ? 1 : 0,
        pointerEvents: drawerOpen ? "auto" : "none",
        transition: "opacity 220ms ease, background 220ms ease, backdrop-filter 220ms ease",
      }}>
        <div style={{
          width: "min(1280px, calc(100vw - 3rem))",
          height: "calc(100vh - 7.3rem)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1.25rem",
          background: "linear-gradient(180deg, rgba(6,12,24,0.58), rgba(4,8,18,0.5))",
          border: "1px solid rgba(130,170,255,0.14)",
          borderRadius: "28px",
          boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
          transform: drawerOpen ? "translateY(0)" : "translateY(18px)",
          transition: "transform 280ms ease",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "rgba(226,235,255,0.94)",
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}>
            <div style={{ display: "flex", gap: "0.45rem" }}>
              {(["chat", "history"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "0.55rem 0.85rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: activeTab === tab ? "rgba(84,125,255,0.16)" : "rgba(255,255,255,0.04)",
                    color: "rgba(226,235,255,0.94)",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "chat" ? (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                padding: "0.4rem 0.3rem 0.2rem 0",
              }}
              ref={messagesRef}
            >
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  style={{
                    alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                    padding: "0.9rem 1.05rem",
                    borderRadius: message.role === "user" ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                    background: message.role === "user"
                      ? "rgba(84,125,255,0.18)"
                      : "rgba(8,14,26,0.72)",
                    border: message.role === "user"
                      ? "1px solid rgba(120,160,255,0.22)"
                      : "1px solid rgba(255,255,255,0.06)",
                    color: "rgba(242,246,255,0.97)",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    lineHeight: 1.7,
                    textShadow: "0 1px 1px rgba(0,0,0,0.3)",
                  }}
                >
                  {message.text}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              padding: "0.4rem 0.3rem 0.2rem 0",
            }}>
              {historySessions.map(session => (
                <div
                  key={session.id}
                  style={{
                    padding: "1rem 1.05rem",
                    borderRadius: "18px",
                    background: "rgba(8,14,26,0.72)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "rgba(242,246,255,0.97)",
                    fontFamily: "monospace",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "12px" }}>{session.title}</span>
                    <span style={{ fontSize: "10px", color: "rgba(125,155,230,0.68)" }}>{session.timestamp}</span>
                  </div>
                  <div style={{ fontSize: "11px", lineHeight: 1.6, color: "rgba(208,218,240,0.9)" }}>{session.preview}</div>
                  <div style={{ marginTop: "0.55rem", fontSize: "10px", letterSpacing: "1px", color: "rgba(120,150,220,0.72)", textTransform: "uppercase" }}>
                    {session.state} state
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            padding: "0.95rem 1rem",
            width: "min(760px, 78%)",
            alignSelf: "center",
            background: "rgba(5,10,24,0.82)",
            border: "1px solid rgba(140,170,255,0.14)",
            borderRadius: "24px",
            boxShadow: "0 16px 36px rgba(0,0,0,0.22)",
            backdropFilter: "blur(10px)",
          }}>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Talk to the AI. Later the backend can map the response to an emotion or shape."
              rows={3}
              style={{
                width: "100%",
                resize: "none",
                border: "none",
                outline: "none",
                background: "transparent",
                color: "rgba(242,246,255,0.97)",
                fontFamily: "monospace",
                fontSize: "13px",
                lineHeight: 1.6,
                textShadow: "0 1px 1px rgba(0,0,0,0.3)",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                color: "rgba(120,150,220,0.7)",
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "1px",
              }}>
                Type above and hit send
              </div>
              <button
                onClick={submitPrompt}
                style={{
                  padding: "0.7rem 1.1rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(126,166,255,0.28)",
                  background: "rgba(75,112,255,0.16)",
                  color: "rgba(226,236,255,0.94)",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
