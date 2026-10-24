import * as THREE from '../../../vendor/three/build/three.module.js';
import { makeRNG } from './Terrain.js';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

/**
 * Collect renderable variants from a glTF scene.
 * Many Poly Haven nature assets (fir_sapling_medium, rock_moss_set_01, shrub_02, grass_medium_01, fern_02, etc.)
 * pack multiple individual variants side-by-side along the X/Z axes as top-level children.
 * Separating and centering each variant ensures every scattered instance sits on the exact terrain height at (x, z)
 * instead of floating in mid-air along a showroom line.
 */
function collectVariants(root) {
  root.updateMatrixWorld(true);
  const meshChildren = root.children.filter((c) => {
    let has = false;
    c.traverse((o) => {
      if (o.isMesh && o.geometry) has = true;
    });
    return has;
  });
  const isShowroomPack =
    meshChildren.length > 1 &&
    meshChildren.some((c) => Math.hypot(c.position.x, c.position.z) > 0.25);

  const variantRoots = isShowroomPack ? meshChildren : [root];
  const variants = [];

  for (const vRoot of variantRoots) {
    vRoot.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(vRoot.matrixWorld).invert();
    const box = new THREE.Box3();
    const parts = [];
    vRoot.traverse((o) => {
      if (o.isMesh && o.geometry) {
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        const rel = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
        const gb = o.geometry.boundingBox.clone().applyMatrix4(rel);
        box.union(gb);
        parts.push({ mesh: o, rel });
      }
    });
    if (!parts.length || box.isEmpty()) continue;
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    // Shift so variant is horizontally centered at (0, 0) and its base is at y = 0
    const centerShift = new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z);
    for (const p of parts) {
      p.rel.premultiply(centerShift);
    }
    variants.push({ parts, size, maxDim: Math.max(size.x, size.y, size.z) || 1 });
  }
  return variants;
}

/** Bounding box of a model (world-aligned, in its own root space). */
export function modelBounds(root) {
  root.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(root);
}

/** Injects a cheap vertex-shader wind sway into a material (clone first!). */
export function addWindSway(material, { amp = 0.08, speed = 1.1, height = 2.0 } = {}) {
  material.userData.wind = { amp, speed, height };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uSwayAmp = { value: amp };
    shader.uniforms.uSwaySpeed = { value: speed };
    shader.uniforms.uSwayHeight = { value: height };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uTime; uniform float uSwayAmp; uniform float uSwaySpeed; uniform float uSwayHeight;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
{
  #ifdef USE_INSTANCING
    float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.53;
  #else
    float ph = 0.0;
  #endif
  float hgt = clamp(position.y / uSwayHeight, 0.0, 1.0);
  float sway = (sin(uTime * uSwaySpeed + ph) + 0.35 * sin(uTime * uSwaySpeed * 2.3 + ph * 1.7)) * uSwayAmp * hgt * hgt;
  transformed.x += sway;
  transformed.z += sway * 0.6;
}`
      );
    material.userData.shader = shader;
  };
  material.customProgramCacheKey = () => `wind_${amp}_${speed}_${height}`;
  return material;
}

/** Update wind time on every material that has sway. */
export function tickWind(root, t) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (m && m.userData && m.userData.shader && m.userData.shader.uniforms.uTime) {
        m.userData.shader.uniforms.uTime.value = t;
      }
    }
  });
}

/**
 * Scatter a real scanned model across the terrain with InstancedMesh.
 * opts: count, minScale, maxScale, radius (max distance), innerRadius (keep clear), align (tilt to slope 0..1),
 *       wind {amp,speed,height}, seed, mask(x,z)→bool, fit (normalise largest dimension to metres)
 */
export function scatterModel(group, terrain, modelRoot, opts = {}) {
  const {
    count = 60,
    minScale = 0.8,
    maxScale = 1.3,
    radius = 60,
    innerRadius = 3,
    align = 0.35,
    wind = null,
    seed = 7,
    yOffset = 0,
    mask = null,
    sinkToGround = true,
    tint = null,
    fit = null,
  } = opts;
  if (!modelRoot) return [];
  const rng = makeRNG(seed);
  const variants = collectVariants(modelRoot);
  if (!variants.length) return [];

  // Bucket transforms per variant so each variant sits at its own exact terrain height
  const buckets = variants.map(() => []);
  let placed = 0;
  let tries = 0;
  while (placed < count && tries < count * 12) {
    tries++;
    const ang = rng() * Math.PI * 2;
    const r = innerRadius + Math.sqrt(rng()) * (radius - innerRadius);
    const x = Math.cos(ang) * r;
    const z = Math.sin(ang) * r;
    if (mask && !mask(x, z)) continue;
    const vIdx = placed % variants.length;
    const v = variants[vIdx];
    const fitScale = fit ? fit / v.maxDim : (v.maxDim > 22 ? 8 / v.maxDim : 1);
    const y = terrain ? terrain.heightAt(x, z) : 0;
    const sc = (minScale + rng() * (maxScale - minScale)) * fitScale;
    const rotY = rng() * Math.PI * 2;
    _q.setFromAxisAngle(_up, rotY);
    if (terrain && align > 0) {
      const n = terrain.normalAt(x, z);
      const tilt = new THREE.Quaternion().setFromUnitVectors(_up, n.lerp(_up, 1 - align).normalize());
      _q.premultiply(tilt);
    }
    const embed = sinkToGround ? -0.02 * sc : 0;
    _p.set(x, y + yOffset + embed, z);
    _s.set(sc, sc, sc);
    buckets[vIdx].push(new THREE.Matrix4().compose(_p, _q, _s));
    placed++;
  }

  const created = [];
  for (let vIdx = 0; vIdx < variants.length; vIdx++) {
    const transforms = buckets[vIdx];
    if (!transforms.length) continue;
    for (const { mesh, rel } of variants[vIdx].parts) {
      const mat = Array.isArray(mesh.material) ? mesh.material[0].clone() : mesh.material.clone();
      if (tint && mat.color) mat.color = new THREE.Color(tint);
      if (wind) addWindSway(mat, wind);
      const inst = new THREE.InstancedMesh(mesh.geometry, mat, transforms.length);
      for (let i = 0; i < transforms.length; i++) {
        _m.multiplyMatrices(transforms[i], rel);
        inst.setMatrixAt(i, _m);
      }
      inst.instanceMatrix.needsUpdate = true;
      inst.castShadow = true;
      inst.receiveShadow = true;
      inst.frustumCulled = false;
      inst.name = `scatter:${modelRoot.name || 'model'}`;
      group.add(inst);
      created.push(inst);
    }
  }
  return created;
}

/** Place a single real model on the terrain. Preserves any prior fitModel() scale. */
export function placeModel(group, terrain, modelRoot, { x = 0, z = 0, y = null, rotY = 0, scale = null, sinkToGround = true, yOffset = 0, lookAt = null } = {}) {
  if (!modelRoot) return null;
  if (scale !== null && scale !== undefined) {
    modelRoot.scale.multiplyScalar(scale);
  }
  const yaw = lookAt ? Math.atan2(lookAt[0] - x, lookAt[2] - z) : rotY;
  modelRoot.rotation.set(0, yaw, 0);
  modelRoot.position.set(0, 0, 0);
  const bounds = modelBounds(modelRoot);
  const center = new THREE.Vector3();
  bounds.getCenter(center);
  const groundShift = sinkToGround ? -bounds.min.y : -center.y;
  const gy = y !== null ? y : terrain ? terrain.heightAt(x, z) : 0;
  modelRoot.position.set(x - center.x, gy + groundShift + yOffset, z - center.z);
  group.add(modelRoot);
  return modelRoot;
}

/** Fit a model so its largest dimension equals `targetSize` metres. Returns scale factor used. */
export function fitModel(modelRoot, targetSize) {
  const b = modelBounds(modelRoot);
  const size = new THREE.Vector3();
  b.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const s = targetSize / maxDim;
  modelRoot.scale.multiplyScalar(s);
  return s;
}
