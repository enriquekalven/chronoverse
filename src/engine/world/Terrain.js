import * as THREE from '../../../vendor/three/build/three.module.js';
import { ensureUV1 } from './AssetLibrary.js';

/* ------------------------------------------------------------------ noise */
function hash2(x, y, seed) {
  let h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return h - Math.floor(h);
}
function smooth(t) {
  return t * t * (3 - 2 * t);
}
export function valueNoise2(x, y, seed = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  const u = smooth(xf);
  const v = smooth(yf);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
export function fbm2(x, y, { octaves = 5, lacunarity = 2.0, gain = 0.5, seed = 0 } = {}) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2(x * freq, y * freq, seed + i * 17);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm; // 0..1
}
export function ridged2(x, y, opts = {}) {
  const n = fbm2(x, y, opts);
  return 1 - Math.abs(n * 2 - 1);
}

/**
 * Injects multi-scale procedural landscape splatting into a Terrain's MeshStandardMaterial:
 *  - Breaks up repetitive UV grid tiling using 3 octaves of world-space organic noise
 *  - Blends stratified cliff/rock coloration & roughness on steeper slopes
 *  - Adds subtle worn earth / stone footpath detail around the active center stage
 *  - Adds close-range micro-grit detail
 */
function enhanceTerrainMaterial(mat, seed = 1) {
  if (!mat || mat.userData?.terrainEnhanced) return mat;
  mat.userData = mat.userData || {};
  mat.userData.terrainEnhanced = true;

  const prevCompile = mat.onBeforeCompile;
  mat.customProgramCacheKey = () => `chrono-terrain-splat-v2-${seed}`;
  mat.onBeforeCompile = (shader, renderer) => {
    if (prevCompile) prevCompile(shader, renderer);
    shader.uniforms.uTerrainSeed = { value: (seed % 97) * 1.13 };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vTerrainWorldPos;
        varying vec3 vTerrainWorldNorm;
        `
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vTerrainWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vTerrainWorldNorm = normalize(mat3(modelMatrix) * objectNormal);
        `
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTerrainSeed;
        varying vec3 vTerrainWorldPos;
        varying vec3 vTerrainWorldNorm;

        float tHash2(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7)) + uTerrainSeed) * 43758.5453);
        }
        float tNoise2(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(tHash2(i + vec2(0.0, 0.0)), tHash2(i + vec2(1.0, 0.0)), u.x),
            mix(tHash2(i + vec2(0.0, 1.0)), tHash2(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }
        float tFbm(vec2 p) {
          float v = 0.0;
          v += 0.50 * tNoise2(p);
          v += 0.25 * tNoise2(p * 2.07 + vec2(13.4, 7.1));
          v += 0.125 * tNoise2(p * 4.31 + vec2(5.2, 19.8));
          v += 0.0625 * tNoise2(p * 8.73 + vec2(23.1, 3.7));
          return v / 0.9375;
        }
        `
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          vec2 wp = vTerrainWorldPos.xz;
          // 1. Multi-scale macro organic patches (eliminates repetitive UV grid tiling)
          float macro1 = tFbm(wp * 0.045);
          float macro2 = tFbm(wp * 0.16 + vec2(41.0, 17.0));
          float microGrit = tNoise2(wp * 2.8) * 0.5 + tNoise2(wp * 7.5) * 0.5;

          vec3 warmEarth = diffuseColor.rgb * vec3(1.08, 0.98, 0.86);
          vec3 coolLush = diffuseColor.rgb * vec3(0.84, 0.96, 0.88);
          diffuseColor.rgb = mix(coolLush, warmEarth, smoothstep(0.32, 0.68, macro1));
          diffuseColor.rgb *= (0.86 + 0.26 * macro2) * (0.93 + 0.14 * microGrit);

          // 2. Natural worn earth footpath / clearing around the center stage
          float stageDist = length(wp - vec2(sin(wp.y * 0.15) * 1.4, 0.0));
          float pathMask = smoothstep(7.5, 2.2, stageDist) * smoothstep(0.35, 0.72, macro2);
          vec3 pathColor = diffuseColor.rgb * vec3(1.06, 0.95, 0.82) + vec3(0.03, 0.02, 0.01);
          diffuseColor.rgb = mix(diffuseColor.rgb, pathColor, pathMask * 0.42);

          // 3. Slope-based rocky strata & scree blending on hills, craters & ridges
          float slope = clamp(1.0 - vTerrainWorldNorm.y, 0.0, 1.0);
          float rockMask = smoothstep(0.08, 0.34, slope);
          float strata = 0.82 + 0.18 * sin(vTerrainWorldPos.y * 5.5 + macro1 * 6.0);
          vec3 cliffRock = mix(diffuseColor.rgb * 0.68, vec3(0.42, 0.38, 0.34), 0.45) * strata;
          diffuseColor.rgb = mix(diffuseColor.rgb, cliffRock, rockMask);

          // 4. Elevation crest highlight on distant peaks
          float peakMask = smoothstep(3.5, 14.0, vTerrainWorldPos.y);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.18 + vec3(0.04, 0.04, 0.05), peakMask * 0.55);
        }
        `
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        {
          float rNoise = tNoise2(vTerrainWorldPos.xz * 0.35);
          roughnessFactor = clamp(roughnessFactor * (0.88 + 0.24 * rNoise), 0.15, 1.0);
        }
        `
      );
  };
  mat.needsUpdate = true;
  return mat;
}

/**
 * Builds a 360-degree distant mountain/ridge/dune vista ring around the terrain
 * so the horizon looks like a continuous natural landscape instead of a flat plane edge.
 */
function buildHorizonRingMesh({ size = 160, amplitude = 2.2, baseY = 0, seed = 1, heightFn = null, material = null } = {}) {
  const innerR = size * 0.43;
  const outerR = size * 1.35;
  const radialSegs = 28;
  const angularSegs = 128;

  const geo = new THREE.RingGeometry(innerR, outerR, angularSegs, radialSegs);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const u = THREE.MathUtils.clamp((r - innerR) / (outerR - innerR), 0, 1);

    // Match the terrain height at the inner seam so there is zero visible gap
    const baseEdgeH = heightFn ? heightFn(x, z) : baseY;
    const envelope = Math.sin(u * Math.PI); // 0 at inner seam, 1 in mid-mountain ring, 0 at outer edge
    const ridge1 = ridged2(x * 0.014 + 31, z * 0.014 + 57, { octaves: 4, seed: seed + 33 });
    const ridge2 = fbm2(x * 0.032 - 19, z * 0.032 + 41, { octaves: 3, seed: seed + 71 });
    const mountainH = (ridge1 * 0.72 + ridge2 * 0.28) * Math.max(4.5, amplitude * 5.2) * envelope;

    // Blend smoothly from exact terrain height at u=0 into the distant mountain range
    const seamBlend = THREE.MathUtils.smoothstep(u, 0.0, 0.22);
    const y = baseEdgeH * (1.0 - seamBlend * 0.65) + baseY * (seamBlend * 0.65) + mountainH * seamBlend - (1.0 - seamBlend) * 0.15;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  ensureUV1(geo);

  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.name = 'terrain-horizon-ring';
  return mesh;
}

/**
 * Terrain — a real displaced heightfield (CPU heights for placement + GPU PBR displacement & multi-scale splatting).
 * heightFn(x, z) → world y. Default: gentle rolling ground that flattens near the origin (the "stage").
 */
export class Terrain {
  constructor({
    size = 160,
    segments = 200,
    heightFn = null,
    flatRadius = 7,
    amplitude = 2.2,
    frequency = 0.035,
    seed = 1,
    material = null,
    baseY = 0,
    noHorizon = false,
  } = {}) {
    this.size = size;
    this.baseY = baseY;
    this.seed = seed;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    this.heightFn =
      heightFn ||
      ((x, z) => {
        const d = Math.hypot(x, z);
        const flat = THREE.MathUtils.smoothstep(d, flatRadius, flatRadius * 2.3);
        const n = fbm2(x * frequency + 100, z * frequency + 100, { seed });
        // Natural micro-undulation even inside the stage + rolling midrange hills + rising horizon ridges
        const microStage = (fbm2(x * 0.11 + 17, z * 0.11 + 29, { octaves: 2, seed: seed + 5 }) - 0.5) * Math.min(0.16, amplitude * 0.08) * THREE.MathUtils.smoothstep(d, 2.5, flatRadius);
        const far = THREE.MathUtils.smoothstep(d, size * 0.22, size * 0.48);
        const ridge = ridged2(x * 0.016 + 40, z * 0.016 + 40, { octaves: 4, seed: seed + 9 });
        return baseY + microStage + (n - 0.45) * amplitude * flat + far * amplitude * 2.8 * ridge;
      });
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.heightFn(x, z));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    ensureUV1(geo);

    const mat = enhanceTerrainMaterial(
      material || new THREE.MeshStandardMaterial({ color: 0x5b6b4a, roughness: 0.92 }),
      seed
    );
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    this.mesh.name = 'terrain';

    // Automatically attach a 360-degree distant mountain/ridge vista ring whenever the landscape has natural relief
    if (!noHorizon && (amplitude > 0.15 || heightFn)) {
      this.horizonRing = buildHorizonRingMesh({
        size,
        amplitude: Math.max(1.2, amplitude),
        baseY,
        seed,
        heightFn: this.heightFn,
        material: mat,
      });
      this.mesh.add(this.horizonRing);
    }
  }

  heightAt(x, z) {
    return this.heightFn(x, z);
  }

  /** Approximate surface normal via finite differences (for aligning scattered props). */
  normalAt(x, z, eps = 0.5) {
    const hl = this.heightFn(x - eps, z);
    const hr = this.heightFn(x + eps, z);
    const hd = this.heightFn(x, z - eps);
    const hu = this.heightFn(x, z + eps);
    return new THREE.Vector3(hl - hr, 2 * eps, hd - hu).normalize();
  }

  setMaterial(mat) {
    const enhanced = enhanceTerrainMaterial(mat, this.seed);
    this.mesh.material = enhanced;
    if (this.horizonRing) this.horizonRing.material = enhanced;
  }
}

/** Simple deterministic PRNG (mulberry32) so every world is identical on every load. */
export function makeRNG(seed = 1) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
