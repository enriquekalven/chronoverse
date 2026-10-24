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
 * Terrain — a real displaced heightfield (CPU heights for placement + GPU PBR displacement for micro detail).
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
  } = {}) {
    this.size = size;
    this.baseY = baseY;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    this.heightFn =
      heightFn ||
      ((x, z) => {
        const d = Math.hypot(x, z);
        const flat = THREE.MathUtils.smoothstep(d, flatRadius, flatRadius * 2.4);
        const n = fbm2(x * frequency + 100, z * frequency + 100, { seed });
        const far = THREE.MathUtils.smoothstep(d, size * 0.25, size * 0.5); // rise toward horizon → hides edge
        return baseY + (n - 0.45) * amplitude * flat + far * amplitude * 2.5 * fbm2(x * 0.01, z * 0.01, { seed: seed + 9 });
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
    this.mesh = new THREE.Mesh(geo, material || new THREE.MeshStandardMaterial({ color: 0x5b6b4a, roughness: 1 }));
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    this.mesh.name = 'terrain';
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
    this.mesh.material = mat;
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
