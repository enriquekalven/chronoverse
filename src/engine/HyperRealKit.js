import * as THREE from '../../vendor/three/build/three.module.js';

/**
 * HyperRealKit.js — Physically-inspired GLSL Shaders, Multi-Octave FBM PBR Texture Generator,
 * Volumetric Particle Sprites, and the Dynamic Paleo-Earth Continental Drift (Pangaea → Today) Engine.
 */

// -----------------------------------------------------------------------------
// 1. DETERMINISTIC MULTI-OCTAVE FBM NOISE
// -----------------------------------------------------------------------------
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createNoise2D(seed = 42) {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const grad = (hash, x, y) => {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) !== 0 ? -u : u) + ((h & 2) !== 0 ? -2.0 * v : 2.0 * v);
  };

  function noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return 0.5 + 0.25 * lerp(x1, x2, v);
  }

  function fbm(x, y, octaves = 4) {
    let val = 0;
    let amp = 0.5;
    let freq = 1;
    for (let i = 0; i < octaves; i++) {
      val += amp * noise(x * freq, y * freq);
      freq *= 2.02;
      amp *= 0.5;
    }
    return Math.max(0, Math.min(1, val));
  }

  return { noise, fbm };
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// -----------------------------------------------------------------------------
// 2. CUSTOM GLSL SHADERS (ATMOSPHERE RAYLEIGH RIM, SOLAR GRANULATION, MAGMA)
// -----------------------------------------------------------------------------
const ATMO_VERT = `
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vPosW = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const ATMO_FRAG = `
uniform vec3 uColor;
uniform float uStrength;
uniform float uFalloff;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  float rim = pow(clamp(1.0 + dot(N, V), 0.0, 1.0), uFalloff);
  gl_FragColor = vec4(uColor * rim * uStrength, rim * 0.88);
}
`;

export function makeAtmosphereShell(radius, colorHex = '#38bdf8', strength = 1.35, falloff = 2.8) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uStrength: { value: strength },
      uFalloff: { value: falloff },
    },
    vertexShader: ATMO_VERT,
    fragmentShader: ATMO_FRAG,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius * 1.065, 48, 32), mat);
}

const SUN_VERT = `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const SUN_FRAG = `
uniform sampler2D uMap;
uniform float uTime;
uniform vec3 uTint;
uniform float uIntensity;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  float ndv = max(dot(N, V), 0.0);
  vec2 uv1 = vUv + vec2(uTime * 0.008, uTime * 0.003);
  vec2 uv2 = vUv * 2.2 + vec2(-uTime * 0.012, uTime * 0.006);
  vec3 c1 = texture2D(uMap, uv1).rgb;
  vec3 c2 = texture2D(uMap, uv2).rgb;
  vec3 gran = mix(c1, c2, 0.38);
  float limb = 0.52 + 0.48 * pow(ndv, 0.55);
  vec3 col = gran * limb * uTint * uIntensity;
  col += uTint * pow(1.0 - ndv, 2.8) * 0.85 * uIntensity;
  gl_FragColor = vec4(col, 1.0);
}
`;

export function makeSolarGranulationMaterial(sunTex, tintHex = '#fde047', intensity = 1.65) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: sunTex },
      uTime: { value: 0 },
      uTint: { value: new THREE.Color(tintHex) },
      uIntensity: { value: intensity },
    },
    vertexShader: SUN_VERT,
    fragmentShader: SUN_FRAG,
  });
}

// -----------------------------------------------------------------------------
// 3. PROCEDURAL PBR TEXTURE & BUMP MAP GENERATOR
// -----------------------------------------------------------------------------
class ProceduralTextureCache {
  constructor() {
    this.cache = new Map();
  }

  get(key, builder) {
    if (!this.cache.has(key)) {
      this.cache.set(key, builder());
    }
    return this.cache.get(key);
  }

  softGlowSprite(colorHex = '#ffffff', size = 128) {
    return this.get(`sprite:${colorHex}:${size}`, () => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      const r = size / 2;
      const g = ctx.createRadialGradient(r, r, 0, r, r, r);
      const [cr, cg, cb] = hexToRgb(colorHex);
      g.addColorStop(0, `rgba(255,255,255,1)`);
      g.addColorStop(0.28, `rgba(${cr},${cg},${cb},0.85)`);
      g.addColorStop(0.68, `rgba(${cr},${cg},${cb},0.22)`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    });
  }

  surfacePair(name, baseHex, accentHex, scale = 8, seed = 11, style = 'organic') {
    return this.get(`surf:${name}:${baseHex}:${accentHex}:${scale}:${seed}:${style}`, () => {
      const w = 256;
      const h = 256;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      const img = ctx.createImageData(w, h);
      const d = img.data;

      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = w;
      bumpCanvas.height = h;
      const bCtx = bumpCanvas.getContext('2d');
      const bImg = bCtx.createImageData(w, h);
      const bd = bImg.data;

      const n2 = createNoise2D(seed);
      const base = hexToRgb(baseHex);
      const acc = hexToRgb(accentHex);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = (x / w) * scale;
          const ny = (y / h) * scale;
          let v = n2.fbm(nx, ny, 4);

          if (style === 'scales') {
            // Cellular reptile scale pattern
            const sx = Math.sin(nx * Math.PI * 4) * Math.sin(ny * Math.PI * 4);
            v = Math.max(0, Math.min(1, v * 0.55 + Math.abs(sx) * 0.55));
          } else if (style === 'fur') {
            // Directional woolly fur strands
            const furWave = n2.fbm(nx * 2.5, ny * 0.45, 3);
            v = Math.max(0, Math.min(1, v * 0.45 + furWave * 0.65));
          } else if (style === 'marble') {
            const vein = Math.abs(Math.sin((nx + v * 2.2) * Math.PI));
            v = Math.pow(vein, 0.45);
          } else if (style === 'circuit') {
            const gx = (x % 32 === 0 || y % 32 === 0) ? 1.0 : 0.15;
            const pad = (x % 64 < 10 && y % 64 < 10) ? 0.95 : 0.0;
            v = Math.max(gx * 0.7, pad);
          }

          const idx = (y * w + x) * 4;
          d[idx] = Math.round(base[0] + (acc[0] - base[0]) * v);
          d[idx + 1] = Math.round(base[1] + (acc[1] - base[1]) * v);
          d[idx + 2] = Math.round(base[2] + (acc[2] - base[2]) * v);
          d[idx + 3] = 255;

          const bVal = Math.round(v * 255);
          bd[idx] = bVal;
          bd[idx + 1] = bVal;
          bd[idx + 2] = bVal;
          bd[idx + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      bCtx.putImageData(bImg, 0, 0);

      const map = new THREE.CanvasTexture(c);
      map.colorSpace = THREE.SRGBColorSpace;
      map.wrapS = map.wrapT = THREE.RepeatWrapping;

      const bumpMap = new THREE.CanvasTexture(bumpCanvas);
      bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;

      return { map, bumpMap };
    });
  }
}

export const PBR = new ProceduralTextureCache();

export function makePBRMaterial(name, baseHex, accentHex, opts = {}) {
  const { map, bumpMap } = PBR.surfacePair(
    name,
    baseHex,
    accentHex,
    opts.scale ?? 8,
    opts.seed ?? 17,
    opts.style ?? 'organic'
  );
  return new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: opts.bumpScale ?? 0.06,
    roughness: opts.roughness ?? 0.62,
    metalness: opts.metalness ?? 0.08,
    emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: opts.emissiveIntensity ?? 0.0,
    side: opts.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
  });
}

// -----------------------------------------------------------------------------
// 4. PALEO-EARTH CONTINENTAL DRIFT ENGINE (PANGAEA → LAURASIA/GONDWANA → TODAY)
// -----------------------------------------------------------------------------
/**
 * Major continental plate polygons defined in normalized equirectangular UV [0..1, 0..1]
 * at two endpoints:
 *   • PANGAEA (~250 MYA): All continents locked together around the equator/prime meridian.
 *   • MODERN (0 MYA): Today's 7 continents at their true geographic positions.
 * Any intermediate time `paleoMa` (from 270 MYA down to 0 MYA) smoothly interpolates each
 * tectonic plate's center, rotation, and rift boundaries, plus optional Ice Age polar sheets!
 */
const CONTINENT_PLATES = [
  {
    id: 'North America',
    color: '#2d6a4f',
    mountainColor: '#8d775f',
    pangaeaPos: [0.43, 0.38],
    midPos100Ma: [0.30, 0.33],
    modernPos: [0.22, 0.30],
    poly: [
      [-0.09, -0.10], [-0.02, -0.13], [0.06, -0.09], [0.08, -0.02],
      [0.03, 0.06], [-0.01, 0.11], [-0.05, 0.07], [-0.10, -0.01],
    ],
  },
  {
    id: 'South America',
    color: '#1b4332',
    mountainColor: '#9c6644',
    pangaeaPos: [0.46, 0.62],
    midPos100Ma: [0.38, 0.64],
    modernPos: [0.32, 0.65],
    poly: [
      [-0.04, -0.09], [0.03, -0.08], [0.06, -0.01], [0.03, 0.09],
      [-0.01, 0.14], [-0.04, 0.08], [-0.05, -0.01],
    ],
  },
  {
    id: 'Africa',
    color: '#b5835a',
    mountainColor: '#52796f',
    pangaeaPos: [0.53, 0.56],
    midPos100Ma: [0.53, 0.53],
    modernPos: [0.54, 0.52],
    poly: [
      [-0.06, -0.10], [0.03, -0.10], [0.07, -0.03], [0.05, 0.09],
      [0.01, 0.14], [-0.03, 0.07], [-0.07, -0.01],
    ],
  },
  {
    id: 'Eurasia',
    color: '#40916c',
    mountainColor: '#a5a58d',
    pangaeaPos: [0.57, 0.34],
    midPos100Ma: [0.64, 0.30],
    modernPos: [0.68, 0.28],
    poly: [
      [-0.13, -0.07], [-0.02, -0.11], [0.12, -0.09], [0.16, -0.01],
      [0.11, 0.07], [0.01, 0.09], [-0.09, 0.05], [-0.14, -0.01],
    ],
  },
  {
    id: 'India',
    color: '#52b788',
    mountainColor: '#e9edc9',
    pangaeaPos: [0.59, 0.69],
    midPos100Ma: [0.64, 0.58],
    modernPos: [0.70, 0.43],
    poly: [
      [-0.025, -0.04], [0.025, -0.04], [0.03, 0.02], [0.0, 0.06], [-0.03, 0.02],
    ],
  },
  {
    id: 'Australia',
    color: '#d4a373',
    mountainColor: '#7f5539',
    pangaeaPos: [0.65, 0.74],
    midPos100Ma: [0.74, 0.72],
    modernPos: [0.82, 0.68],
    poly: [
      [-0.045, -0.035], [0.045, -0.04], [0.05, 0.03], [-0.01, 0.05], [-0.05, 0.02],
    ],
  },
  {
    id: 'Antarctica',
    color: '#e2e8f0',
    mountainColor: '#cbd5e1',
    pangaeaPos: [0.56, 0.80],
    midPos100Ma: [0.55, 0.87],
    modernPos: [0.52, 0.92],
    poly: [
      [-0.14, -0.03], [0.14, -0.03], [0.18, 0.03], [-0.18, 0.03],
    ],
  },
];

export function renderContinentalDriftTexture(paleoMa = 250, options = {}) {
  const w = 1024;
  const h = 512;
  const canvas = options.canvas || document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // 1. Deep Panthalassa / Modern Ocean Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
  oceanGrad.addColorStop(0, '#072ac8');
  oceanGrad.addColorStop(0.5, '#0353a4');
  oceanGrad.addColorStop(1, '#023e7d');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, w, h);

  // Clamp paleoMa between 0 (Today) and 250 (Pangaea)
  const clampedMa = Math.max(0, Math.min(250, paleoMa));

  // Compute piecewise interpolation: 250 Ma -> 100 Ma -> 0 Ma
  const interpPos = (plate) => {
    if (clampedMa >= 100) {
      const t = (250 - clampedMa) / 150; // 0 at 250Ma, 1 at 100Ma
      return [
        plate.pangaeaPos[0] + (plate.midPos100Ma[0] - plate.pangaeaPos[0]) * t,
        plate.pangaeaPos[1] + (plate.midPos100Ma[1] - plate.pangaeaPos[1]) * t,
      ];
    } else {
      const t = (100 - clampedMa) / 100; // 0 at 100Ma, 1 at 0Ma
      return [
        plate.midPos100Ma[0] + (plate.modernPos[0] - plate.midPos100Ma[0]) * t,
        plate.midPos100Ma[1] + (plate.modernPos[1] - plate.midPos100Ma[1]) * t,
      ];
    }
  };

  // 2. Draw Mid-Ocean Spreading Ridge when Pangaea is rifting apart (210 Ma → 20 Ma)
  if (clampedMa < 235 && clampedMa > 5) {
    ctx.save();
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.55)';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(w * 0.39, h * 0.18);
    ctx.bezierCurveTo(w * 0.44, h * 0.42, w * 0.42, h * 0.62, w * 0.46, h * 0.85);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Draw Each Drifting Continental Plate + Continental Shelf + Mountain Ranges
  CONTINENT_PLATES.forEach((plate) => {
    const [cx, cy] = interpPos(plate);

    // Shallow turquoise continental shelf halo
    ctx.save();
    ctx.translate(cx * w, cy * h);
    ctx.beginPath();
    plate.poly.forEach(([px, py], i) => {
      const sx = px * w * 1.14;
      const sy = py * h * 1.14;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.fill();

    // Main continental landmass
    ctx.beginPath();
    plate.poly.forEach(([px, py], i) => {
      const sx = px * w;
      const sy = py * h;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.fillStyle = plate.color;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#a7f3d0';
    ctx.stroke();

    // Interior mountain ridge highlight
    ctx.beginPath();
    plate.poly.forEach(([px, py], i) => {
      const sx = px * w * 0.52;
      const sy = py * h * 0.52;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.fillStyle = plate.mountainColor;
    ctx.fill();

    // Continent Label on the Globe
    if (options.showLabels !== false) {
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(plate.id, 0, 4);
    }
    ctx.restore();
  });

  // 4. Special Highlight: Himalaya Collision Zone when India meets Eurasia (< 45 Ma)
  if (clampedMa <= 45) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(w * 0.67, h * 0.36, w * 0.07, h * 0.03);
    ctx.restore();
  }

  // 5. Special Highlight: Beringia Land Bridge & Ice Age Glaciers
  if (options.iceAge) {
    ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
    ctx.fillRect(0, 0, w, h * 0.24);
    ctx.fillRect(0, h * 0.82, w, h * 0.18);
    // Beringia Land Bridge connecting Siberia & Alaska
    ctx.fillStyle = '#d97706';
    ctx.fillRect(w * 0.01, h * 0.20, w * 0.14, h * 0.08);
    ctx.fillRect(w * 0.86, h * 0.20, w * 0.14, h * 0.08);
  }

  return canvas;
}

export function createDriftingEarthGlobe(initialMa = 250, radius = 1.65, options = {}) {
  const group = new THREE.Group();
  const canvas = renderContinentalDriftTexture(initialMa, options);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;

  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.42,
    metalness: 0.08,
  });

  const globe = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 48), mat);
  globe.castShadow = true;
  globe.receiveShadow = true;
  group.add(globe);

  const atmo = makeAtmosphereShell(radius, '#38bdf8', 1.25, 2.9);
  group.add(atmo);

  return {
    group,
    globe,
    setPaleoMa(ma, extraOpts = {}) {
      renderContinentalDriftTexture(ma, { ...options, ...extraOpts, canvas });
      tex.needsUpdate = true;
    },
  };
}
