import * as THREE from '../../../vendor/three/build/three.module.js';
import { Water } from '../../../vendor/three/examples/jsm/objects/Water.js';
import { AssetLibrary, ensureUV1 } from './AssetLibrary.js';
import { Terrain, fbm2, ridged2, makeRNG } from './Terrain.js';
import { scatterModel, placeModel, fitModel, tickWind, modelBounds } from './Scatter.js';
import * as FX from './Effects.js';
import * as ARCH from './Architecture.js';
import { createDriftingEarthGlobe } from '../HyperRealKit.js';
import { spawnLivingHuman, animateCreatureRig } from './LivingHumans.js';

/**
 * EraWorlds — one REAL 3D environment per milestone.
 * Ground = displaced heightfield with scanned PBR materials. Vegetation / rocks / props = Poly Haven photogrammetry.
 * Creatures = Smithsonian museum scans. Lighting = real-sky HDRIs. Phenomena = physically-motivated shaders.
 */

const PH = (id) => AssetLibrary.polyhavenModel(id);
const PBR = (f) => AssetLibrary.pbrModel(f);
const SI = (f) => AssetLibrary.smithsonian(f);
const PRE = (f) => AssetLibrary.prehistoric(f);
const ANAT = (f) => AssetLibrary.anatomy(f);

export class WorldContext {
  constructor(milestone, assets, textures) {
    this.m = milestone;
    this.assets = assets;
    this.textures = textures; // engine-level NASA textures (earth, moon, mars, sun, milky way)
    this.group = new THREE.Group();
    this.group.name = `world:${milestone.id}`;
    this.anim = [];
    this.terrain = null;
    this.env = {
      hdri: null,
      envIntensity: 1.0,
      bgIntensity: 1.0,
      bgBlur: 0.0,
      fogColor: 0x8899aa,
      fogDensity: 0.006,
      sunDir: [0.5, 0.8, 0.3],
      sunColor: 0xfff2dc,
      sunIntensity: 3.0,
      hemi: 0.35,
      exposure: 1.0,
      bgRotation: 0,
      space: false,
      backgroundColor: null,
    };
    this.camera = { distance: 12, pitch: 0.12, yaw: 0.0, targetY: 1.4, minDistance: 3, maxDistance: 40 };
    this.pois = [];
    this.mixers = [];
    this.whatIfHandlers = [];
    this._whatIf = false;
  }

  setEnv(e) {
    Object.assign(this.env, e);
  }
  setCamera(c) {
    Object.assign(this.camera, c);
  }
  poi(name, objOrPos, yOffset = 0) {
    this.pois.push({ name, ref: objOrPos, yOffset });
  }
  onWhatIf(fn) {
    this.whatIfHandlers.push(fn);
  }

  async ground(texId, opts = {}) {
    const { repeat = 18, displacementScale = 0.25, color = 0xffffff, ...terrainOpts } = opts;
    const mat = await this.assets.makePBRMaterial(texId, { repeat, displacementScale, color });
    this.terrain = new Terrain({ material: mat, ...terrainOpts });
    this.group.add(this.terrain.mesh);
    return this.terrain;
  }

  async material(texId, opts = {}) {
    return this.assets.makePBRMaterial(texId, opts);
  }

  async scatter(idOrUrl, opts = {}) {
    const url = idOrUrl.includes('/') ? idOrUrl : PH(idOrUrl);
    const gltf = await this.assets.loadGLTF(url);
    if (!gltf) return [];
    return scatterModel(this.group, this.terrain, gltf.scene, opts);
  }

  async prop(idOrUrl, opts = {}) {
    const url = idOrUrl.includes('/') ? idOrUrl : PH(idOrUrl);
    const obj = await this.assets.instantiate(url);
    if (!obj) return null;
    if (opts.fit) fitModel(obj, opts.fit);
    if (opts.tint || opts.emissive !== undefined || opts.roughness !== undefined) {
      obj.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material = o.material.clone();
          if (opts.tint) o.material.color = new THREE.Color(opts.tint);
          if (opts.emissive !== undefined && o.material.emissive) {
            o.material.emissive = new THREE.Color(opts.emissive);
            o.material.emissiveIntensity = opts.emissiveIntensity ?? 0.5;
          }
          if (opts.roughness !== undefined) o.material.roughness = opts.roughness;
          if (opts.metalness !== undefined) o.material.metalness = opts.metalness;
        }
      });
    }
    placeModel(this.group, this.terrain, obj, opts);
    if (opts.clip !== undefined || opts.playAll) this.play(obj, opts.clip ?? 0, opts.timeScale || 1);
    if (opts.poi) this.poi(opts.poi, obj, opts.poiY ?? (modelBounds(obj).max.y - obj.position.y + 0.3));
    return obj;
  }

  play(obj, clip = 0, timeScale = 1) {
    const clips = obj.userData.animations || [];
    if (!clips.length) return null;
    const mixer = new THREE.AnimationMixer(obj);
    const c = typeof clip === 'number' ? clips[Math.min(clip, clips.length - 1)] : clips.find((k) => k.name === clip) || clips[0];
    const action = mixer.clipAction(c);
    action.timeScale = timeScale;
    action.play();
    this.mixers.push(mixer);
    return action;
  }

  async water({ size = 300, y = 0, color = 0x0a2f3f, distortion = 2.2, alpha = 1, sunColor = 0xffffff, flowSpeed = 1 } = {}) {
    const normals = await this.assets.loadTexture('./assets/textures/three/waternormals.jpg');
    if (normals) normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
    const geo = new THREE.PlaneGeometry(size, size);
    const water = new Water(geo, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: normals,
      sunDirection: new THREE.Vector3(...this.env.sunDir).normalize(),
      sunColor,
      waterColor: color,
      distortionScale: distortion,
      fog: true,
      alpha,
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = y;
    this.group.add(water);
    this.anim.push((t, dt) => {
      water.material.uniforms.time.value += dt * 0.6 * flowSpeed;
    });
    return water;
  }

  fire(opts) {
    return FX.createFire(this.group, this.anim, opts);
  }
  particles(opts) {
    return FX.createParticles(this.group, this.anim, opts);
  }
  shafts(opts) {
    return FX.createLightShafts(this.group, this.anim, opts);
  }
  smoke(opts) {
    return FX.createSmoke(this.group, this.anim, opts);
  }

  /** Called by the engine every frame. */
  update(t, dt, whatIf, camera) {
    if (whatIf !== this._whatIf) {
      this._whatIf = whatIf;
      this.whatIfHandlers.forEach((fn) => fn(whatIf));
    }
    for (let i = 0; i < this.mixers.length; i++) this.mixers[i].update(dt);
    for (let i = 0; i < this.anim.length; i++) this.anim[i](t, dt, whatIf, camera);
    if ((t * 60) % 2 < 1) tickWind(this.group, t); // every other frame is plenty
  }

  dispose() {
    this.group.traverse((o) => {
      if (o.geometry && !o.userData.sharedGeometry) o.geometry.dispose?.();
    });
  }
}

/* ======================================================================================
   Shared sub-builders
   ====================================================================================== */

async function addForestFloorLife(ctx, { ferns = 120, grass = 220, shrubs = 30, moss = 40, radius = 55, seed = 3 } = {}) {
  await Promise.all([
    ctx.scatter('fern_02', { count: ferns, minScale: 0.9, maxScale: 1.6, radius, innerRadius: 2.5, seed: seed + 1, wind: { amp: 0.05, speed: 1.3, height: 0.8 } }),
    ctx.scatter('grass_medium_01', { count: grass, minScale: 0.9, maxScale: 1.5, radius, innerRadius: 1.5, seed: seed + 2, wind: { amp: 0.06, speed: 1.6, height: 0.5 } }),
    ctx.scatter('shrub_02', { count: shrubs, minScale: 0.8, maxScale: 1.4, radius, innerRadius: 4, seed: seed + 3, wind: { amp: 0.04, speed: 1.1, height: 1.2 } }),
    ctx.scatter('rock_moss_set_01', { count: Math.round(moss * 0.6), minScale: 0.35, maxScale: 0.8, radius, innerRadius: 5, seed: seed + 4 }),
  ]);
}

async function addDriftGlobeExhibit(ctx, { x = -5.5, z = 3.5, radius = 0.85, iceAge = false, label = 'Continental drift globe' } = {}) {
  const plinthMat = await ctx.material('marble_01', { repeat: 2, displacementScale: 0 });
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 1.05, 32), plinthMat);
  ensureUV1(plinth.geometry);
  const gy = ctx.terrain ? ctx.terrain.heightAt(x, z) : 0;
  plinth.position.set(x, gy + 0.525, z);
  plinth.castShadow = plinth.receiveShadow = true;
  ctx.group.add(plinth);
  const tex = ctx.textures || {};
  const globeGroup = new THREE.Group();
  const globeMat = new THREE.MeshStandardMaterial({
    map: tex.earthDay || null,
    normalMap: tex.earthNormal || null,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughnessMap: tex.earthSpec || null,
    roughness: 0.55,
    metalness: 0.08,
  });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 48), globeMat);
  globe.castShadow = true;
  globeGroup.add(globe);
  if (iceAge) {
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf0f6ff, roughness: 0.35, metalness: 0.05 });
    const northCap = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.008, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.36), capMat);
    globe.add(northCap);
  }
  if (tex.earthClouds) {
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.018, 48, 36),
      new THREE.MeshStandardMaterial({ map: tex.earthClouds, alphaMap: tex.earthClouds, transparent: true, opacity: 0.55, depthWrite: false })
    );
    globeGroup.add(clouds);
    ctx.anim.push((t) => {
      clouds.rotation.y = t * 0.28;
    });
  }
  globeGroup.position.set(x, gy + 1.05 + radius + 0.08, z);
  ctx.group.add(globeGroup);
  ctx.anim.push((t) => {
    globe.rotation.y = t * 0.22;
  });
  ctx.poi(label, globeGroup, radius + 0.35);
  return { group: globeGroup, globe };
}

function addEarthInSky(ctx, { position = [40, 48, -130], radius = 7, nightSide = false } = {}) {
  const tex = ctx.textures || {};
  const earth = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 48), new THREE.MeshStandardMaterial({ map: tex.earthDay || null, roughness: 0.6, metalness: 0.05, emissiveMap: nightSide ? tex.earthNight || null : null, emissive: nightSide ? 0xffffff : 0x000000, emissiveIntensity: 0.6 }));
  earth.position.set(...position);
  ctx.group.add(earth);
  if (tex.earthClouds) {
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.015, 48, 36), new THREE.MeshStandardMaterial({ map: tex.earthClouds, alphaMap: tex.earthClouds, transparent: true, opacity: 0.7, depthWrite: false }));
    clouds.position.copy(earth.position);
    ctx.group.add(clouds);
    ctx.anim.push((t) => {
      clouds.rotation.y = t * 0.02;
    });
  }
  ctx.anim.push((t) => {
    earth.rotation.y = t * 0.015;
  });
  return earth;
}

function addFootprintTrail(ctx, { from = [-3, 0, 6], to = [4, 0, -6], steps = 10, size = 0.26, color = 0x3a2a1c } = {}) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.beginPath();
  g.ellipse(32, 78, 20, 40, 0, 0, Math.PI * 2);
  g.fill();
  [[14, 22, 7], [26, 14, 6], [36, 12, 5], [46, 16, 5], [54, 24, 4]].forEach(([x, y, r]) => {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  });
  const alpha = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshStandardMaterial({ color, alphaMap: alpha, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const geo = new THREE.PlaneGeometry(size, size * 2);
  geo.rotateX(-Math.PI / 2);
  const dir = new THREE.Vector2(to[0] - from[0], to[2] - from[2]);
  const len = dir.length();
  dir.normalize();
  const perp = new THREE.Vector2(-dir.y, dir.x);
  for (let i = 0; i < steps; i++) {
    const u = i / (steps - 1);
    const side = i % 2 === 0 ? 1 : -1;
    const x = from[0] + dir.x * len * u + perp.x * side * 0.16;
    const z = from[2] + dir.y * len * u + perp.y * side * 0.16;
    const y = ctx.terrain ? ctx.terrain.heightAt(x, z) + 0.02 : 0.02;
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = -Math.atan2(dir.y, dir.x) + Math.PI / 2;
    m.renderOrder = 2;
    ctx.group.add(m);
  }
}

function addSpiralGalaxy(ctx, { position = [-30, 18, -70], arms = 3, count = 5000, radius = 24, tilt = 0.9, color = 0xbfd6ff } = {}) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const rng = makeRNG(21);
  const c0 = new THREE.Color(0xfff1c8);
  const c1 = new THREE.Color(color);
  for (let i = 0; i < count; i++) {
    const arm = i % arms;
    const r = Math.pow(rng(), 0.7) * radius;
    const ang = (arm / arms) * Math.PI * 2 + r * 0.35 + (rng() - 0.5) * 0.6 * (1 - r / radius);
    const spread = (rng() - 0.5) * 1.6 * (0.3 + r / radius);
    pos[i * 3] = Math.cos(ang) * r + spread;
    pos[i * 3 + 1] = (rng() - 0.5) * 1.2 * (1 - r / radius) + 0.3 * Math.sin(r);
    pos[i * 3 + 2] = Math.sin(ang) * r + spread;
    const cc = c0.clone().lerp(c1, r / radius);
    col[i * 3] = cc.r;
    col[i * 3 + 1] = cc.g;
    col[i * 3 + 2] = cc.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.55, map: FX.getSoftTexture(), vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  pts.position.set(...position);
  pts.rotation.x = tilt;
  ctx.group.add(pts);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: FX.getSoftTexture(), color: 0xfff3d0, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
  core.scale.setScalar(radius * 0.7);
  core.position.set(...position);
  ctx.group.add(core);
  ctx.anim.push((t) => {
    pts.rotation.y = t * 0.03;
  });
  return pts;
}

async function addLavaPools(ctx, pools = [[6, -4, 4], [-7, -9, 3], [2, -14, 5]]) {
  const cloud = await ctx.assets.loadTexture('./assets/textures/three/cloud.png');
  const lava = await ctx.assets.loadTexture('./assets/textures/three/lavatile.jpg', { srgb: true });
  const mat = FX.createLavaMaterial(cloud, lava, { uvScale: 2.5 });
  pools.forEach(([x, z, r]) => {
    const geo = new THREE.CircleGeometry(r, 48);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, mat);
    const y = ctx.terrain ? ctx.terrain.heightAt(x, z) + 0.06 : 0.06;
    m.position.set(x, y, z);
    ctx.group.add(m);
    const light = new THREE.PointLight(0xff6a1a, 40 * r, r * 8, 1.6);
    light.position.set(x, y + 0.8, z);
    ctx.group.add(light);
  });
  ctx.anim.push((t) => {
    mat.uniforms.time.value = t;
  });
  return mat;
}

/* ======================================================================================
   WORLD BUILDERS (keyed by milestone id)
   ====================================================================================== */
export const WORLD_BUILDERS = {
  /* ---------------- 1. Big Bang ---------------- */
  'big-bang': async (ctx) => {
    ctx.setEnv({ space: true, backgroundColor: 0x02010a, envIntensity: 0.35, fogDensity: 0.0, sunIntensity: 0.0, hemi: 0.1, exposure: 1.1 });
    ctx.setCamera({ distance: 22, pitch: 0.05, targetY: 0, minDistance: 8, maxDistance: 60 });
    FX.createStarfield(ctx.group, { count: 2500, radius: 170, size: 0.7 });
    const neb = FX.createNebula(ctx.group, ctx.anim, { radius: 46, colorA: 0xffb060, colorB: 0x6b1fd8, colorC: 0x2a7fff, density: 1.25, speed: 0.04, steps: 34 });
    const core = FX.createGlowSphere(ctx.group, ctx.anim, { radius: 2.6, color: 0xffd28a, hot: 0xffffff, intensity: 3.2, turbulence: 1.4 });
    ctx.particles({ count: 1400, box: [90, 90, 90], center: [0, 0, 0], color: 0xffd8a8, size: 0.22, speed: 0.25, direction: 1, sway: 1.5, additive: true, fade: true });
    ctx.poi('Quark–gluon plasma fireball (t < 1 s)', core, 3.4);
    ctx.onWhatIf((on) => {
      neb.material.uniforms.uDensity.value = on ? 0.35 : 1.25;
      core.material.uniforms.uIntensity.value = on ? 1.2 : 3.2;
    });
    ctx.anim.push((t) => {
      core.scale.setScalar(1 + 0.04 * Math.sin(t * 1.7));
    });
  },

  /* ---------------- 2. First stars & proto-galaxies ---------------- */
  'first-stars': async (ctx) => {
    ctx.setEnv({ space: true, backgroundColor: 0x010208, envIntensity: 0.3, fogDensity: 0.0, sunIntensity: 0.0, hemi: 0.08 });
    ctx.setCamera({ distance: 26, pitch: 0.08, targetY: 0, minDistance: 8, maxDistance: 70 });
    FX.createStarfield(ctx.group, { count: 3500, radius: 180, size: 0.8 });
    FX.createNebula(ctx.group, ctx.anim, { radius: 70, colorA: 0x3f7fff, colorB: 0x0b1a4a, colorC: 0x7fd0ff, density: 0.55, speed: 0.02, steps: 30, seed: 3 });
    const star = FX.createGlowSphere(ctx.group, ctx.anim, { radius: 5.2, color: 0x9ec8ff, hot: 0xffffff, intensity: 3.4, turbulence: 2.2, position: [0, 0, 0] });
    const light = new THREE.PointLight(0xbcd8ff, 400, 300, 1.4);
    ctx.group.add(light);
    addSpiralGalaxy(ctx, { position: [-42, 14, -80], radius: 26, tilt: 1.0 });
    addSpiralGalaxy(ctx, { position: [48, -10, -95], radius: 18, tilt: 0.5, color: 0xffd0a0 });
    ctx.poi('Population III hypergiant star (~300 solar masses)', star, 6.2);
    ctx.onWhatIf((on) => {
      star.material.uniforms.uIntensity.value = on ? 6.5 : 3.4;
      star.material.uniforms.uColor.value.set(on ? 0xffffff : 0x9ec8ff);
    });
  },

  /* ---------------- 3. Molten Earth & Theia impact ---------------- */
  'molten-earth': async (ctx) => {
    ctx.setEnv({ hdri: 'sunset_in_the_chalk_quarry', envIntensity: 0.45, bgIntensity: 0.35, fogColor: 0x3a1408, fogDensity: 0.012, sunDir: [-0.5, 0.35, -0.8], sunColor: 0xff8c3a, sunIntensity: 2.2, hemi: 0.15, exposure: 1.0 });
    ctx.setCamera({ distance: 14, pitch: 0.1, targetY: 1.2 });
    await ctx.ground('rock_boulder_dry', { repeat: 20, color: 0x2a211c, amplitude: 2.6, frequency: 0.05, displacementScale: 0.3 });
    await addLavaPools(ctx, [[5, -3, 4.5], [-8, -10, 3.5], [3, -16, 6], [-16, 4, 5], [14, -20, 7]]);
    await Promise.all([
      ctx.scatter('moon_rock_01', { count: 50, minScale: 1.2, maxScale: 3.5, radius: 60, innerRadius: 4, seed: 5, tint: 0x3a2d26 }),
      ctx.scatter('moon_rock_05', { count: 60, minScale: 1.0, maxScale: 2.6, radius: 60, innerRadius: 3, seed: 6, tint: 0x2d2622 }),
      ctx.scatter('namaqualand_boulder_02', { count: 14, minScale: 1.5, maxScale: 3.0, radius: 60, innerRadius: 10, seed: 7, tint: 0x2a2320 }),
    ]);
    // Theia bearing down — a Mars-sized impactor glowing in the sky
    const theia = FX.createGlowSphere(ctx.group, ctx.anim, { radius: 16, color: 0xff5a1a, hot: 0xffd9a0, intensity: 2.4, turbulence: 1.1, position: [70, 52, -120] });
    FX.createMeteors(ctx.group, ctx.anim, { count: 18, area: 160, height: 70, speed: 42 });
    ctx.particles({ count: 500, box: [80, 30, 80], center: [0, 12, 0], color: 0xff9a40, size: 0.08, speed: 0.6, direction: 1, sway: 0.5, additive: true, fade: true });
    ctx.smoke({ count: 24, scale: 6, rise: 30, start: [-8, 2, -10], opacity: 0.18, color: 0x3a2a24, speed: 0.25, spread: 4 });
    ctx.smoke({ count: 20, scale: 6, rise: 28, start: [14, 2, -20], opacity: 0.16, color: 0x3a2a24, speed: 0.22, spread: 4 });
    ctx.poi('Theia (Mars-sized impactor) — 4.5 BYA', theia, 18);
    ctx.onWhatIf((on) => {
      theia.material.uniforms.uIntensity.value = on ? 0.6 : 2.4;
      theia.visible = !on;
    });
  },

  /* ---------------- 4. Hydrothermal vents & LUCA ---------------- */
  'first-organisms': async (ctx) => {
    ctx.setEnv({ hdri: 'ushaka_sea_world_aquarium', envIntensity: 0.18, bgIntensity: 0.05, fogColor: 0x02070f, fogDensity: 0.045, sunDir: [0.2, 1, 0.1], sunColor: 0x4a7fa8, sunIntensity: 0.35, hemi: 0.08, exposure: 1.15 });
    ctx.setCamera({ distance: 11, pitch: 0.12, targetY: 2.0 });
    await ctx.ground('rocks_ground_01', { repeat: 16, color: 0x3a3f44, amplitude: 1.8, frequency: 0.06, displacementScale: 0.25 });
    const rockMat = await ctx.material('rock_face', { repeat: 3, displacementScale: 0.12 });
    // black smoker chimneys (lathe) with mineral crust
    const rng = makeRNG(9);
    const chimneys = [[0, -4, 7.5], [-4.5, -1, 5.2], [4.2, -7, 6.4], [-7, -9, 4.4], [6.5, 1.5, 3.8]];
    chimneys.forEach(([x, z, h], i) => {
      const pts = [];
      for (let k = 0; k <= 18; k++) {
        const t = k / 18;
        const r = (1.6 - t * 1.1) * (1 + 0.18 * Math.sin(t * 19 + i) + 0.12 * (rng() - 0.5));
        pts.push(new THREE.Vector2(Math.max(0.25, r), t * h));
      }
      const geo = new THREE.LatheGeometry(pts, 28);
      ensureUV1(geo);
      const m = new THREE.Mesh(geo, rockMat);
      const y = ctx.terrain.heightAt(x, z) - 0.3;
      m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true;
      ctx.group.add(m);
      ctx.smoke({ count: 22, scale: 1.6, rise: 14, start: [x, y + h, z], opacity: 0.55, color: 0x0a0a0c, speed: 0.5, spread: 1.2 });
      // chemosynthetic microbial mats glowing faintly orange around the base
      const mat = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5a10, emissiveIntensity: 0.9, roughness: 1, transparent: true, opacity: 0.75 }));
      mat.rotation.x = -Math.PI / 2;
      mat.position.set(x, y + 0.42, z);
      ctx.group.add(mat);
      const pl = new THREE.PointLight(0xff6a20, 18, 10, 1.8);
      pl.position.set(x, y + 1.2, z);
      ctx.group.add(pl);
      if (i === 0) ctx.poi('Black smoker vent — 400 °C mineral-rich plume', m, h + 0.5);
    });
    const dna = await ctx.prop(PBR('dna_helix.glb'), { x: 2.2, z: 0.6, y: 2.2, fit: 2.6, sinkToGround: false, emissive: 0x2ad4ff, emissiveIntensity: 0.6, poi: 'RNA / DNA genetic code — LUCA (4.0 BYA)' });
    if (dna) {
      ctx.anim.push((t) => {
        dna.rotation.y = t * 0.45;
      });
    }
    ctx.particles({ count: 700, box: [50, 22, 50], center: [0, 10, 0], color: 0xbfe6ff, size: 0.08, speed: 0.35, direction: 1, sway: 0.25, opacity: 0.6, fade: true });
    ctx.particles({ count: 420, box: [14, 6, 14], center: [0, 2.5, 0], color: 0xffc080, size: 0.04, speed: 0.5, direction: 1, sway: 0.9, additive: true, fade: true });
    await ctx.scatter('coast_rocks_05', { count: 16, minScale: 0.5, maxScale: 1.1, radius: 45, innerRadius: 6, seed: 12, tint: 0x4a4e52 });
    ctx.onWhatIf((on) => {
      ctx.group.traverse((o) => {
        if (o.isPointLight) o.intensity = on ? 40 : 18;
      });
    });
  },

  /* ---------------- 5. Stromatolites, oxygen & Snowball Earth ---------------- */
  'oxygen-snowball': async (ctx) => {
    ctx.setEnv({ hdri: 'kiara_1_dawn', envIntensity: 0.9, bgIntensity: 1.0, fogColor: 0xc9d7e4, fogDensity: 0.0045, sunDir: [-0.6, 0.35, -0.7], sunColor: 0xffd9b0, sunIntensity: 2.6, hemi: 0.4 });
    ctx.setCamera({ distance: 13, pitch: 0.16, targetY: 0.8 });
    await ctx.ground('sand_01', { repeat: 22, baseY: -0.9, amplitude: 0.5, frequency: 0.04, flatRadius: 14, displacementScale: 0.1 });
    await ctx.water({ size: 400, y: 0, color: 0x1f6f7a, distortion: 1.6 });
    const layerMat = await ctx.material('large_sandstone_blocks', { repeat: 1.2, displacementScale: 0.03, color: 0x8a7a66 });
    // stromatolite domes
    const rng = makeRNG(4);
    const domes = [];
    for (let i = 0; i < 46; i++) {
      const ang = rng() * Math.PI * 2;
      const r = 1.5 + Math.sqrt(rng()) * 16;
      const x = Math.cos(ang) * r;
      const z = Math.sin(ang) * r;
      const h = 0.35 + rng() * 0.8;
      const w = 0.5 + rng() * 0.9;
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const t = k / 12;
        pts.push(new THREE.Vector2(w * Math.sqrt(1 - t * t * 0.9) * (1 + 0.05 * Math.sin(t * 30)), -0.6 + (h + 0.6) * t));
      }
      const geo = new THREE.LatheGeometry(pts, 24);
      ensureUV1(geo);
      const m = new THREE.Mesh(geo, layerMat);
      m.position.set(x, 0, z);
      m.castShadow = m.receiveShadow = true;
      ctx.group.add(m);
      domes.push(m);
    }
    ctx.poi('Stromatolite reef — cyanobacteria exhaling oxygen', domes[0], 1.2);
    // oxygen bubbles streaming off the mats
    ctx.particles({ count: 500, box: [36, 1.6, 36], center: [0, 0.6, 0], color: 0xe8f6ff, size: 0.05, speed: 0.4, direction: 1, sway: 0.08, opacity: 0.8, fade: true });
    // Snowball Earth on the horizon: ice floes + snowy ridge
    const snow = await ctx.material('snow_02', { repeat: 6, displacementScale: 0.15 });
    for (let i = 0; i < 18; i++) {
      const ang = rng() * Math.PI * 2;
      const r = 40 + rng() * 60;
      const f = new THREE.Mesh(new THREE.CylinderGeometry(3 + rng() * 6, 3.5 + rng() * 6, 0.6, 7), snow);
      ensureUV1(f.geometry);
      f.position.set(Math.cos(ang) * r, 0.1, Math.sin(ang) * r);
      f.rotation.y = rng() * 3;
      f.receiveShadow = f.castShadow = true;
      ctx.group.add(f);
    }
    const ridge = await ctx.prop('mountainside', { x: -40, z: -140, scale: 7, rotY: 0.4 });
    if (ridge) ridge.traverse((o) => {
      if (o.isMesh) o.material = snow;
    });
    ctx.onWhatIf((on) => {
      ctx.group.traverse((o) => {
        if (o.isMesh && o.material === snow) o.scale.setScalar(on ? 1.6 : 1);
      });
    });
  },

  /* ---------------- 6. Cambrian explosion ---------------- */
  'cambrian-explosion': async (ctx) => {
    ctx.setEnv({ hdri: 'ushaka_sea_world_aquarium', envIntensity: 0.6, bgIntensity: 0.55, fogColor: 0x0b3a52, fogDensity: 0.03, sunDir: [0.25, 1, 0.15], sunColor: 0x9fd8ff, sunIntensity: 1.6, hemi: 0.3, exposure: 1.1 });
    ctx.setCamera({ distance: 10, pitch: 0.08, targetY: 1.4 });
    await ctx.ground('sand_01', { repeat: 20, color: 0xcdbfa0, amplitude: 1.4, frequency: 0.06, displacementScale: 0.15 });
    FX.createCaustics(ctx.group, ctx.anim, { size: 140, y: 0.06, intensity: 0.5, scale: 0.09 });
    ctx.shafts({ count: 9, origin: [6, 30, -4], target: [0, 0, 0], length: 42, radius: 1.8, color: 0xbfe9ff, opacity: 0.12, spread: 14 });
    await Promise.all([
      ctx.scatter('coast_rocks_02', { count: 10, fit: 6.0, minScale: 0.5, maxScale: 1.2, radius: 40, innerRadius: 4, seed: 2 }),
      ctx.scatter('coast_rocks_05', { count: 14, minScale: 0.4, maxScale: 1.0, radius: 40, innerRadius: 3, seed: 3 }),
      ctx.scatter('rock_moss_set_01', { count: 40, minScale: 0.6, maxScale: 1.3, radius: 40, innerRadius: 2, seed: 4, tint: 0x6fa08a }),
      ctx.scatter(PBR('abalone_shell.glb'), { count: 14, fit: 0.42, minScale: 0.8, maxScale: 1.5, radius: 18, innerRadius: 1.5, seed: 5, align: 0.9 }),
    ]);
    // Iconic Cambrian creatures — rigged & animated 3D models
    const anom = await ctx.prop(PRE('anomalocaris.glb'), { x: 0.8, z: -2.2, y: 1.9, fit: 2.3, rotY: -0.5, sinkToGround: false, playAll: true, poi: 'Anomalocaris — Cambrian apex predator with compound eyes (515 MYA)' });
    if (anom) {
      ctx.anim.push((t) => {
        anom.position.y = 1.9 + Math.sin(t * 1.4) * 0.18;
        anom.rotation.y = -0.5 + Math.sin(t * 0.4) * 0.25;
      });
    }
    await ctx.prop(PRE('hallucigenia.glb'), { x: -2.0, z: 0.8, fit: 1.4, rotY: 0.6, playAll: true, poi: 'Hallucigenia — spine-armoured Cambrian lobopodian' });
    await ctx.prop(PRE('opabinia.glb'), { x: 2.8, z: 0.5, y: 1.1, fit: 1.5, rotY: -0.9, sinkToGround: false, playAll: true, poi: 'Opabinia — five eyes & flexible proboscis' });
    await ctx.prop(PRE('ammonite.glb'), { x: -3.2, z: -3.4, y: 2.4, fit: 1.3, rotY: 0.4, sinkToGround: false, playAll: true });
    // a school of fish-like swimmers circling the reef
    const fishProto = await ctx.assets.instantiate(PBR('barramundi_fish.glb'));
    if (fishProto) {
      fitModel(fishProto, 0.7);
      const school = [];
      for (let i = 0; i < 12; i++) {
        const f = fishProto.clone(true);
        f.userData.phase = (i / 12) * Math.PI * 2;
        f.userData.r = 4.2 + (i % 4) * 0.8;
        f.userData.h = 1.6 + (i % 3) * 0.5;
        ctx.group.add(f);
        school.push(f);
      }
      ctx.anim.push((t) => {
        school.forEach((f) => {
          const a = t * 0.35 + f.userData.phase;
          f.position.set(Math.cos(a) * f.userData.r, f.userData.h + Math.sin(t * 1.3 + f.userData.phase) * 0.15, Math.sin(a) * f.userData.r);
          f.rotation.y = -a + Math.PI;
          f.rotation.z = Math.sin(t * 6 + f.userData.phase) * 0.08;
        });
      });
    }
    ctx.particles({ count: 900, box: [50, 20, 50], center: [0, 9, 0], color: 0xdff4ff, size: 0.07, speed: 0.4, direction: 1, sway: 0.2, opacity: 0.7, fade: true });
    ctx.particles({ count: 500, box: [40, 12, 40], center: [0, 5, 0], color: 0xffffff, size: 0.03, speed: 0.1, direction: 1, sway: 0.6, opacity: 0.35, additive: true });
  },

  /* ---------------- 7. Tiktaalik shoreline & Carboniferous forest ---------------- */
  'land-walk': async (ctx) => {
    ctx.setEnv({ hdri: 'rainforest_trail', envIntensity: 1.0, bgIntensity: 1.0, fogColor: 0x8fa58a, fogDensity: 0.011, sunDir: [0.45, 0.7, -0.5], sunColor: 0xfff0c8, sunIntensity: 2.8, hemi: 0.45 });
    ctx.setCamera({ distance: 12, pitch: 0.12, targetY: 1.2, yaw: 0.3 });
    await ctx.ground('brown_mud_leaves_01', {
      repeat: 20,
      amplitude: 2.0,
      frequency: 0.04,
      displacementScale: 0.2,
      heightFn: (x, z) => {
        const shore = THREE.MathUtils.smoothstep(z, 6, 16); // z > 6 slopes into the lagoon
        const n = fbm2(x * 0.04 + 50, z * 0.04 + 50, { seed: 8 });
        const far = THREE.MathUtils.smoothstep(Math.hypot(x, z), 40, 80);
        return (n - 0.45) * 2.0 * (1 - shore) - shore * 2.6 + far * 6 * fbm2(x * 0.01, z * 0.01, { seed: 3 });
      },
    });
    await ctx.water({ size: 400, y: -0.5, color: 0x2a4f3a, distortion: 1.2 });
    const landMask = (x, z) => z < 5;
    await Promise.all([
      ctx.scatter('fern_02', { count: 160, minScale: 1.0, maxScale: 1.9, radius: 50, innerRadius: 2, seed: 11, mask: landMask, wind: { amp: 0.05, speed: 1.3, height: 0.8 } }),
      ctx.scatter('grass_medium_01', { count: 180, minScale: 0.9, maxScale: 1.4, radius: 50, innerRadius: 1.5, seed: 12, mask: landMask, wind: { amp: 0.06, speed: 1.6, height: 0.5 } }),
      ctx.scatter('tree_small_02', { count: 14, minScale: 0.9, maxScale: 1.5, radius: 55, innerRadius: 9, seed: 13, mask: landMask, align: 0.1, wind: { amp: 0.06, speed: 0.7, height: 9 } }),
      ctx.scatter('island_tree_02', { count: 8, minScale: 0.9, maxScale: 1.3, radius: 55, innerRadius: 12, seed: 14, mask: landMask, align: 0.1, wind: { amp: 0.08, speed: 0.6, height: 10 } }),
      ctx.scatter('dead_tree_trunk', { count: 6, minScale: 0.8, maxScale: 1.2, radius: 30, innerRadius: 5, seed: 15, mask: landMask }),
      ctx.scatter('rock_moss_set_01', { count: 30, minScale: 0.7, maxScale: 1.4, radius: 40, innerRadius: 2, seed: 16, mask: landMask }),
    ]);
    ctx.shafts({ count: 7, origin: [10, 28, -10], target: [0, 0, 0], length: 40, radius: 1.5, opacity: 0.1, spread: 14 });
    ctx.particles({ count: 400, box: [40, 8, 40], center: [0, 3, 0], color: 0xffffff, size: 0.035, speed: 0.12, direction: 1, sway: 0.5, opacity: 0.3, additive: true });
    // Giant Carboniferous dragonfly (Meganeura) & early terrestrial tetrapod/synapsid
    const mega = await ctx.prop(PRE('meganeura.glb'), { x: 0.5, z: -1.5, y: 2.4, fit: 1.6, rotY: 0.4, sinkToGround: false, playAll: true, poi: 'Meganeura — 70 cm wingspan Carboniferous dragonfly' });
    if (mega) {
      ctx.anim.push((t) => {
        mega.position.y = 2.4 + Math.sin(t * 2.5) * 0.22;
      });
    }
    const dimet = await ctx.prop(PRE('dimetrodon.glb'), { x: -2.4, z: 1.5, fit: 3.1, rotY: 0.7, playAll: true, poi: 'Early land-walking tetrapod & synapsid lineage' });
    animateCreatureRig(dimet, ctx, { path: [[-3.6, 2.2], [1.8, 0.6]], speed: 0.9 });
    // Devonian lagoon life: an early shark and lobe-finned fish-like swimmers
    const shark = await ctx.prop(PBR('shark_animated.glb'), { x: 2, z: 16, y: -1.6, fit: 3.4, playAll: true, timeScale: 0.9 });
    if (shark) {
      ctx.anim.push((t) => {
        const a = t * 0.18;
        shark.position.set(2 + Math.cos(a) * 9, -1.7 + Math.sin(t * 0.5) * 0.2, 18 + Math.sin(a) * 7);
        shark.rotation.y = -a + Math.PI / 2;
      });
      ctx.poi('Devonian shark (sharks are older than trees)', shark, 1.6);
    }
    const fish = await ctx.prop(PBR('barramundi_fish.glb'), { x: -3, z: 9, y: -1.1, fit: 0.9, rotY: 1.2 });
    if (fish) ctx.poi('Lobe-finned fish → Tiktaalik (375 MYA) hauling onto the mudflat', fish, 0.6);
  },

  /* ---------------- 8. Pangaea & the Great Dying ---------------- */
  'pangaea-great-dying': async (ctx) => {
    ctx.setEnv({ hdri: 'qwantani_dusk_2_puresky', envIntensity: 0.75, bgIntensity: 0.75, fogColor: 0x5a3a26, fogDensity: 0.006, sunDir: [0.45, 0.55, 0.6], sunColor: 0xffa868, sunIntensity: 2.6, hemi: 0.45 });
    ctx.setCamera({ distance: 13, pitch: 0.12, targetY: 1.2 });
    await ctx.ground('mud_cracked_dry_03', { repeat: 18, amplitude: 1.6, frequency: 0.05, displacementScale: 0.22 });
    await addLavaPools(ctx, [[-10, -18, 3.5], [16, -26, 4]]);
    await Promise.all([
      ctx.scatter('dead_tree_trunk', { count: 26, minScale: 0.9, maxScale: 1.6, radius: 60, innerRadius: 5, seed: 21 }),
      ctx.scatter('dry_branches_medium_01', { count: 50, minScale: 0.9, maxScale: 1.5, radius: 50, innerRadius: 2, seed: 22 }),
      ctx.scatter('quiver_tree_01', { count: 8, minScale: 0.9, maxScale: 1.4, radius: 55, innerRadius: 10, seed: 23 }),
      ctx.scatter('namaqualand_boulder_05', { count: 16, minScale: 1.0, maxScale: 2.2, radius: 60, innerRadius: 6, seed: 24 }),
      ctx.scatter('stone_01', { count: 60, minScale: 0.8, maxScale: 1.6, radius: 45, innerRadius: 2, seed: 25 }),
    ]);
    // Permian-Triassic synapsids actively roaming Pangaea: Dimetrodon & Lystrosaurus
    const dimet = await ctx.prop(PRE('dimetrodon.glb'), { x: -2.2, z: -2.2, fit: 3.8, rotY: 0.55, playAll: true, poi: 'Dimetrodon — Permian sail-backed synapsid (closer to mammals than dinosaurs)' });
    animateCreatureRig(dimet, ctx, { path: [[-4.2, -3.5], [0.8, -1.2]], speed: 1.0 });
    const lystro = await ctx.prop(PRE('lystrosaurus.glb'), { x: 1.8, z: 0.6, fit: 1.65, rotY: -0.6, playAll: true, poi: 'Lystrosaurus — Great Dying survivor whose fossils across 3 continents proved Pangaea' });
    animateCreatureRig(lystro, ctx, { path: [[3.2, 1.8], [-1.2, 2.8]], speed: 1.1 });
    // Siberian Traps volcanic ridge on the horizon using real photogrammetry mountain scan
    const ridge = await ctx.prop('mountainside', { x: -38, z: -125, scale: 5.5, rotY: 0.25 });
    const glow = new THREE.PointLight(0xff5a10, 2500, 260, 1.4);
    glow.position.set(-38, 38, -125);
    ctx.group.add(glow);
    ctx.smoke({ count: 30, scale: 14, rise: 70, start: [-38, 32, -125], opacity: 0.32, color: 0x2b2420, speed: 0.18, spread: 10 });
    ctx.particles({ count: 700, box: [90, 40, 90], center: [0, 18, 0], color: 0x9a8a80, size: 0.1, speed: 0.25, direction: -1, sway: 0.8, opacity: 0.55 });
    ctx.particles({ count: 200, box: [60, 30, 60], center: [0, 12, 0], color: 0xff9a40, size: 0.08, speed: 0.6, direction: 1, sway: 0.5, additive: true, fade: true });
    await addDriftGlobeExhibit(ctx, { x: 4.8, z: 2.2, label: 'Pangaea — one supercontinent (250 MYA)' });
    if (ridge) ctx.poi('Siberian Traps eruptions (the Great Dying, 252 MYA)', ridge, 28);
    ctx.onWhatIf((on) => {
      glow.intensity = on ? 300 : 2500;
    });
  },

  /* ---------------- 9. Jurassic giants — articulated 3D dinosaurs + Smithsonian fossil scan ---------------- */
  'jurassic-giants': async (ctx) => {
    ctx.setEnv({ hdri: 'rainforest_trail', envIntensity: 1.15, bgIntensity: 1.0, fogColor: 0x9db39a, fogDensity: 0.0022, sunDir: [0.55, 0.68, 0.65], sunColor: 0xfff2d2, sunIntensity: 3.5, hemi: 0.65, exposure: 1.05 });
    ctx.setCamera({ distance: 14.5, pitch: 0.12, targetY: 2.2, yaw: -0.2 });
    await ctx.ground('forest_floor', { repeat: 22, amplitude: 1.4, frequency: 0.045, displacementScale: 0.2, flatRadius: 12 });
    await addForestFloorLife(ctx, { ferns: 150, grass: 190, shrubs: 30, moss: 40 });
    await Promise.all([
      ctx.scatter('island_tree_01', { count: 10, minScale: 1.0, maxScale: 1.5, radius: 60, innerRadius: 15, seed: 31, align: 0.1, wind: { amp: 0.08, speed: 0.6, height: 12 } }),
      ctx.scatter('tree_small_02', { count: 12, minScale: 0.9, maxScale: 1.4, radius: 60, innerRadius: 14, seed: 32, align: 0.1, wind: { amp: 0.06, speed: 0.7, height: 9 } }),
      ctx.scatter('fir_sapling_medium', { count: 16, minScale: 0.9, maxScale: 1.6, radius: 55, innerRadius: 11, seed: 33, align: 0.15, wind: { amp: 0.04, speed: 0.9, height: 3 } }),
      ctx.scatter('boulder_01', { count: 6, minScale: 0.35, maxScale: 0.7, radius: 50, innerRadius: 16, seed: 34 }),
      ctx.scatter('dead_tree_trunk', { count: 5, minScale: 0.9, maxScale: 1.3, radius: 35, innerRadius: 12, seed: 35 }),
    ]);
    ctx.particles({ count: 350, box: [40, 10, 40], center: [0, 4, 0], color: 0xffe8b0, size: 0.04, speed: 0.12, direction: 1, sway: 0.5, opacity: 0.35, additive: true });
    // Living, rigged & walking Jurassic giants:
    const apato = await ctx.prop(PRE('apatosaurus.glb'), { x: -4.8, z: -8.5, fit: 13.5, rotY: 0.65, playAll: true, poi: 'Apatosaurus — 22 m long-necked Jurassic sauropod (150 MYA)' });
    animateCreatureRig(apato, ctx, { path: [[-6.5, -9.5], [-2.5, -7.2]], speed: 0.55 });
    const allo = await ctx.prop(PRE('allosaurus-pandras.glb'), { x: 3.4, z: -2.8, fit: 7.2, rotY: -0.65, playAll: true, poi: 'Allosaurus fragilis — apex Jurassic predator stalking prey' });
    animateCreatureRig(allo, ctx, { path: [[5.2, -4.2], [1.4, -1.6]], speed: 1.1 });
    const stego = await ctx.prop(PRE('stegosaurus.glb'), { x: -2.4, z: -1.6, fit: 5.8, rotY: 0.55, playAll: true, poi: 'Stegosaurus stenops — 17 bony dorsal plates & thagomizer tail spikes' });
    animateCreatureRig(stego, ctx, { path: [[-4.0, -2.2], [-1.0, -0.8]], speed: 0.85 });
    const galli = await ctx.prop(PRE('gallimimus.glb'), { x: 6.5, z: -7.5, fit: 4.2, rotY: -0.8, playAll: true, poi: 'Swift ornithomimid herd darting across the floodplain' });
    animateCreatureRig(galli, ctx, { path: [[8.5, -9.0], [2.5, -5.5]], speed: 1.5 });
    const arch = await ctx.prop(PRE('archaeopteryx.glb'), { x: 0.6, z: 2.2, y: 2.8, fit: 1.3, rotY: -0.4, sinkToGround: false, playAll: true, poi: 'Archaeopteryx — feathered link between dinosaurs and birds (150 MYA)' });
    if (arch) {
      ctx.anim.push((t) => {
        const a = t * 0.65;
        arch.position.set(Math.cos(a) * 4.2, 2.8 + Math.sin(t * 2.2) * 0.35, 1.2 + Math.sin(a) * 3.0);
        arch.rotation.y = -a + Math.PI;
      });
    }
    // Real Smithsonian USNM Allosaurus claw fossil scan on a stone plinth in the foreground:
    const plinthMat = await ctx.material('rock_boulder_dry', { repeat: 1, displacementScale: 0 });
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.85, 24), plinthMat);
    const py = ctx.terrain.heightAt(3.8, 3.0);
    plinth.position.set(3.8, py + 0.425, 3.0);
    plinth.castShadow = plinth.receiveShadow = true;
    ctx.group.add(plinth);
    await ctx.prop(SI('allosaurus_fragilis_usnm.glb'), { x: 3.8, z: 3.0, y: py + 0.85, fit: 0.65, rotY: 0.4, poi: 'Smithsonian USNM Allosaurus claw fossil scan' });
    ctx.onWhatIf((on) => {
      if (allo) allo.rotation.y = on ? 0.5 : -0.65;
      if (apato) apato.rotation.y = on ? -0.2 : 0.65;
    });
  },

  /* ---------------- 10. Cretaceous kings — articulated T. rex, Triceratops, Ankylosaurus, Pteranodon ---------------- */
  'cretaceous-kings': async (ctx) => {
    ctx.setEnv({ hdri: 'forest_grove', envIntensity: 1.15, bgIntensity: 1.0, fogColor: 0xa9b7a0, fogDensity: 0.0022, sunDir: [0.55, 0.68, 0.65], sunColor: 0xfff4d8, sunIntensity: 3.5, hemi: 0.65, exposure: 1.05 });
    ctx.setCamera({ distance: 14, pitch: 0.12, targetY: 2.1, yaw: 0.12 });
    await ctx.ground('leafy_grass', { repeat: 22, amplitude: 1.3, frequency: 0.04, displacementScale: 0.18, flatRadius: 12 });
    await addForestFloorLife(ctx, { ferns: 90, grass: 220, shrubs: 44, moss: 30, seed: 40 });
    await Promise.all([
      ctx.scatter('jacaranda_tree', { count: 7, minScale: 0.8, maxScale: 1.15, radius: 58, innerRadius: 16, seed: 41, align: 0.05, wind: { amp: 0.07, speed: 0.6, height: 10 } }),
      ctx.scatter('island_tree_02', { count: 7, minScale: 0.9, maxScale: 1.3, radius: 60, innerRadius: 16, seed: 42, align: 0.05, wind: { amp: 0.07, speed: 0.6, height: 10 } }),
      ctx.scatter('wild_rooibos_bush', { count: 30, minScale: 0.9, maxScale: 1.5, radius: 50, innerRadius: 8, seed: 43, wind: { amp: 0.03, speed: 1.2, height: 1 } }),
      ctx.scatter('boulder_01', { count: 6, minScale: 0.8, maxScale: 1.5, radius: 45, innerRadius: 11, seed: 44 }),
    ]);
    ctx.particles({ count: 300, box: [40, 8, 40], center: [0, 3, 0], color: 0xfff0a0, size: 0.04, speed: 0.2, direction: 1, sway: 0.8, opacity: 0.4, additive: true });
    // Living, rigged & striding T. rex facing off with Triceratops, Ankylosaurus, Parasaurolophus & soaring Pteranodon
    const rex = await ctx.prop(PRE('tyrannosaurus-rex.glb'), { x: 3.3, z: -2.2, fit: 9.2, rotY: -0.95, playAll: true, poi: 'Tyrannosaurus rex — 12.3 m apex predator with 35,000 N bite force (68 MYA)' });
    animateCreatureRig(rex, ctx, { path: [[4.4, -2.8], [1.8, -1.6]], speed: 1.0, jawAmp: 0.28, strideAmp: 0.38 });
    const trike = await ctx.prop(PRE('triceratops.glb'), { x: -2.6, z: -1.6, fit: 6.4, rotY: 0.92, playAll: true, poi: 'Triceratops horridus — three-horned frilled defender' });
    animateCreatureRig(trike, ctx, { path: [[-3.8, -2.2], [-1.4, -1.1]], speed: 0.95, headAmp: 0.22 });
    const anky = await ctx.prop(PRE('ankylosaurus.glb'), { x: -8.2, z: -5.5, fit: 5.4, rotY: 0.55, playAll: true, poi: 'Ankylosaurus — osteoderm bone armour & tail club' });
    animateCreatureRig(anky, ctx, { path: [[-9.5, -6.5], [-5.2, -4.0]], speed: 0.9 });
    const para = await ctx.prop(PRE('parasaurolophus.glb'), { x: 7.4, z: -7.5, fit: 6.4, rotY: -0.45, playAll: true, poi: 'Parasaurolophus — hollow cranial crest resonating chamber' });
    animateCreatureRig(para, ctx, { path: [[9.0, -8.5], [4.5, -5.8]], speed: 1.05 });
    const ptera = await ctx.prop(PRE('pteranodon.glb'), { x: 0, z: -6, y: 6.2, fit: 5.2, rotY: 0.3, sinkToGround: false, playAll: true, poi: 'Pteranodon — 7 m wingspan flying pterosaur' });
    if (ptera) {
      ctx.anim.push((t) => {
        const a = t * 0.35;
        ptera.position.set(Math.cos(a) * 6.5, 6.0 + Math.sin(t * 1.2) * 0.4, -5 + Math.sin(a) * 4.5);
        ptera.rotation.y = -a + Math.PI;
      });
    }
    const amber = await ctx.prop(PBR('mosquito_in_amber.glb'), { x: 0.2, z: 3.2, fit: 0.75, yOffset: 0.35, rotY: 0.6, poi: 'Cretaceous amber with trapped prehistoric mosquito' });
    if (amber) ctx.anim.push((t) => {
      amber.rotation.y = t * 0.3;
    });
    ctx.onWhatIf((on) => {
      if (rex) rex.rotation.y = on ? 0.9 : -0.95;
    });
  },

  /* ---------------- 11. Chicxulub impact — Extinction of the Dinosaurs (66 MYA) ---------------- */
  'asteroid-impact': async (ctx) => {
    ctx.setEnv({ hdri: 'approaching_storm', envIntensity: 0.75, bgIntensity: 0.55, fogColor: 0x3b180e, fogDensity: 0.0028, sunDir: [0.3, 0.55, 0.75], sunColor: 0xff9a50, sunIntensity: 3.2, hemi: 0.45, exposure: 1.08 });
    ctx.setCamera({ distance: 14.5, pitch: 0.14, targetY: 2.2, yaw: 0.08 });
    await ctx.ground('forest_floor', { repeat: 22, color: 0x5c3e2c, amplitude: 1.5, frequency: 0.045, displacementScale: 0.18, flatRadius: 12 });
    await Promise.all([
      ctx.scatter('dead_tree_trunk', { count: 22, minScale: 0.9, maxScale: 1.5, radius: 58, innerRadius: 11, seed: 51 }),
      ctx.scatter('dry_branches_medium_01', { count: 45, minScale: 0.9, maxScale: 1.5, radius: 50, innerRadius: 7, seed: 52 }),
      ctx.scatter('tree_stump_01', { count: 12, minScale: 0.9, maxScale: 1.4, radius: 45, innerRadius: 9, seed: 53 }),
      ctx.scatter('fern_02', { count: 45, minScale: 0.8, maxScale: 1.3, radius: 42, innerRadius: 4, seed: 54, tint: 0x6a4a2a }),
      ctx.scatter('boulder_01', { count: 7, minScale: 0.7, maxScale: 1.3, radius: 50, innerRadius: 10, seed: 55 }),
    ]);
    [[-6.5, -3.5, 1.5], [6.8, -5.0, 1.8], [-3.2, -11.0, 2.0], [4.5, -12.5, 2.2]].forEach(([x, z, s]) => {
      const y = ctx.terrain.heightAt(x, z);
      ctx.fire({ position: [x, y, z], scale: s, intensity: 1.35, lightIntensity: 32 });
    });
    // Dinosaurs actively moving & roaring during the 66 MYA Chicxulub Asteroid Impact:
    const rex = await ctx.prop(PRE('tyrannosaurus-rex.glb'), { x: 3.1, z: -2.2, fit: 8.8, rotY: -0.65, playAll: true, poi: 'Tyrannosaurus rex — final moments of the 165-million-year Dinosaur Age' });
    animateCreatureRig(rex, ctx, { speed: 1.25, jawAmp: 0.34, strideAmp: 0.35, headAmp: 0.22 });
    const trike = await ctx.prop(PRE('triceratops.glb'), { x: -3.2, z: -2.4, fit: 6.2, rotY: 0.65, playAll: true, poi: 'Triceratops horridus bracing against the supersonic blast wave' });
    animateCreatureRig(trike, ctx, { speed: 1.15, strideAmp: 0.32, headAmp: 0.25 });
    const anky = await ctx.prop(PRE('ankylosaurus.glb'), { x: -7.5, z: -6.8, fit: 5.0, rotY: 0.45, playAll: true });
    animateCreatureRig(anky, ctx, { path: [[-8.2, -7.4], [-5.6, -4.8]], speed: 1.1 });
    const ptera = await ctx.prop(PRE('pteranodon.glb'), { x: -1.5, z: -7.5, y: 6.5, fit: 5.0, rotY: 0.4, sinkToGround: false, playAll: true, poi: 'Pteranodon fleeing the ejecta firestorm' });
    if (ptera) {
      ctx.anim.push((t) => {
        ptera.position.x = -1.5 + Math.cos(t * 0.5) * 4.5;
        ptera.position.y = 6.4 + Math.sin(t * 1.4) * 0.4;
      });
    }
    // Colossal Chicxulub 10 km Asteroid Fireball & Shockwave on the Yucatán horizon!
    const fireball = FX.createGlowSphere(ctx.group, ctx.anim, { radius: 7.2, color: 0xff3b08, hot: 0xffb84d, intensity: 1.75, turbulence: 1.6, position: [-2.2, 8.2, -38] });
    const impactLight = new THREE.PointLight(0xff6b22, 165, 110, 1.4);
    impactLight.position.set(0, 11, -18);
    ctx.group.add(impactLight);
    const dinoRimLight = new THREE.PointLight(0xffa352, 48, 28, 1.4);
    dinoRimLight.position.set(0, 5.5, 4.5);
    ctx.group.add(dinoRimLight);
    FX.createShockwave(ctx.group, ctx.anim, { center: [-2.2, 0.6, -38], maxRadius: 65, period: 4.5 });
    FX.createMeteors(ctx.group, ctx.anim, { count: 32, area: 110, height: 48, speed: 42, length: 7.5 });
    ctx.particles({ count: 900, box: [80, 32, 80], center: [0, 14, -10], color: 0xff9a40, size: 0.09, speed: 0.65, direction: 1, sway: 0.7, additive: true, fade: true });
    ctx.smoke({ count: 28, scale: 9, rise: 42, start: [-2.2, 8, -38], opacity: 0.32, color: 0x241812, speed: 0.22, spread: 10 });
    await addDriftGlobeExhibit(ctx, { x: 5.2, z: 2.4, label: 'Chicxulub Impact on Yucatán (66 MYA — 75% species extinct)' });
    ctx.poi('☄️ Chicxulub 10 km Asteroid Impact — Extinction of the Dinosaurs (66 MYA)', fireball, 8.5);
    ctx.onWhatIf((on) => {
      fireball.visible = !on;
      impactLight.intensity = on ? 40 : 165;
    });
  },

  /* ---------------- 12. Himalayas & today's continents (Age of Mammals & Early Hominoids) ---------------- */
  'himalayas-mammals': async (ctx) => {
    ctx.setEnv({ hdri: 'table_mountain_1', envIntensity: 1.0, bgIntensity: 1.0, fogColor: 0xc6d4e2, fogDensity: 0.004, sunDir: [0.5, 0.75, 0.3], sunColor: 0xffffff, sunIntensity: 3.2, hemi: 0.5 });
    ctx.setCamera({ distance: 14, pitch: 0.16, targetY: 1.6, yaw: -0.15 });
    await ctx.ground('grass_ground', {
      repeat: 24,
      displacementScale: 0.12,
      heightFn: (x, z) => {
        const d = Math.hypot(x, z);
        const near = (fbm2(x * 0.05, z * 0.05, { seed: 61 }) - 0.45) * 1.6 * THREE.MathUtils.smoothstep(d, 8, 20);
        const far = THREE.MathUtils.smoothstep(d, 40, 110);
        return near + far * 55 * ridged2(x * 0.012 + 3, z * 0.012 + 3, { seed: 62, octaves: 6 });
      },
      size: 260,
      segments: 240,
    });
    const snow = await ctx.material('snow_02', { repeat: 30, displacementScale: 0.1 });
    const caps = ctx.terrain.mesh.clone();
    caps.position.y = 0.25;
    caps.material = snow.clone();
    caps.material.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vAltitude = position.y;').replace('#include <common>', '#include <common>\n varying float vAltitude;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n varying float vAltitude;').replace('#include <dithering_fragment>', '#include <dithering_fragment>\n if (vAltitude < 14.0) discard;');
    };
    ctx.group.add(caps);
    await Promise.all([
      ctx.scatter('grass_medium_01', { count: 280, minScale: 0.9, maxScale: 1.5, radius: 42, innerRadius: 1.5, seed: 63, wind: { amp: 0.07, speed: 1.6, height: 0.5 } }),
      ctx.scatter('shrub_02', { count: 40, minScale: 0.8, maxScale: 1.5, radius: 45, innerRadius: 3, seed: 64 }),
      ctx.scatter('searsia_burchellii', { count: 10, minScale: 0.9, maxScale: 1.4, radius: 45, innerRadius: 8, seed: 65 }),
      ctx.scatter('namaqualand_boulder_02', { count: 14, minScale: 0.8, maxScale: 2.0, radius: 50, innerRadius: 6, seed: 66 }),
      ctx.scatter('fir_sapling_medium', { count: 20, minScale: 1.0, maxScale: 2.0, radius: 60, innerRadius: 12, seed: 67 }),
    ]);
    const ridge = await ctx.prop('mountainside', { x: 30, z: -120, scale: 6, rotY: -0.3 });
    if (ridge) ctx.poi('Himalaya uplift — India crashing into Asia at 5 cm/yr', ridge, 40);

    // High-resolution PBR Cenozoic Megafauna (Proboscidean / Gomphothere herd) actively marching across the valley!
    const mastodon1 = await ctx.prop(PRE('mammoth.glb'), {
      x: -3.2, z: -2.4, fit: 4.6, rotY: 0.72, playAll: true, tint: 0x8a5a3c,
      poi: 'Cenozoic Proboscidean (Gomphothere / Mastodon ancestor) — Mammals inherit the Earth',
    });
    animateCreatureRig(mastodon1, ctx, { path: [[-5.5, -3.5], [1.8, -1.2]], speed: 0.95, strideAmp: 0.36 });

    const mastodon2 = await ctx.prop(PRE('mammoth.glb'), {
      x: -7.8, z: -6.2, fit: 3.6, rotY: 0.65, playAll: true, tint: 0x7c4e32,
      poi: 'Juvenile Cenozoic Proboscidean trekking across the Himalayan foothills',
    });
    animateCreatureRig(mastodon2, ctx, { path: [[-9.2, -7.2], [-2.8, -4.5]], speed: 1.05, strideAmp: 0.38 });

    // Giant Cenozoic flightless bird (Gastornis / Terror-bird lineage) striding through the grassland
    const terrorBird = await ctx.prop(PRE('gigantoraptor.glb'), {
      x: 2.6, z: -4.2, fit: 3.4, rotY: -0.65, playAll: true,
      poi: 'Giant Cenozoic flightless bird — avian dinosaurs radiating after 66 MYA',
    });
    animateCreatureRig(terrorBird, ctx, { path: [[4.5, -5.8], [0.5, -2.5]], speed: 1.2 });

    // Early Hominoid / Primate Ancestors emerging at the woodland edge
    await spawnLivingHuman(ctx, {
      x: -1.2, z: 2.4, height: 1.15, sex: 'female', style: 'hominin', action: 'walk',
      path: [[-2.8, 2.8], [1.2, 1.8]], speed: 0.95,
      poi: 'Early Miocene Hominoid ancestor — primates adapting to open woodland & savanna',
    });

    await addDriftGlobeExhibit(ctx, { x: 4.8, z: 2.8, label: 'India collides with Asia (35 MYA — Himalayas Rise)' });
    ctx.particles({ count: 300, box: [60, 20, 60], center: [0, 10, 0], color: 0xffffff, size: 0.04, speed: 0.08, direction: 1, sway: 0.6, opacity: 0.25, additive: true });
  },

  /* ---------------- 13. Lucy & bipedalism (Laetoli) ---------------- */
  'lucy-bipedalism': async (ctx) => {
    ctx.setEnv({ hdri: 'safari_sunset', envIntensity: 0.9, bgIntensity: 1.0, fogColor: 0xd9b48a, fogDensity: 0.005, sunDir: [-0.75, 0.25, -0.6], sunColor: 0xffb46a, sunIntensity: 2.6, hemi: 0.35 });
    ctx.setCamera({ distance: 10.5, pitch: 0.16, targetY: 1.1, yaw: 0.28 });
    await ctx.ground('sparse_grass', { repeat: 22, color: 0xcfb98a, amplitude: 1.0, frequency: 0.04, displacementScale: 0.12 });
    await Promise.all([
      ctx.scatter('grass_medium_01', { count: 220, minScale: 0.7, maxScale: 1.2, radius: 55, innerRadius: 4, seed: 71, tint: 0xc9b26a, wind: { amp: 0.07, speed: 1.4, height: 0.5 } }),
      ctx.scatter('wild_rooibos_bush', { count: 40, minScale: 0.9, maxScale: 1.6, radius: 55, innerRadius: 5, seed: 72 }),
      ctx.scatter('searsia_burchellii', { count: 12, minScale: 0.9, maxScale: 1.5, radius: 55, innerRadius: 9, seed: 73 }),
      ctx.scatter('quiver_tree_01', { count: 9, minScale: 0.9, maxScale: 1.4, radius: 60, innerRadius: 10, seed: 74 }),
      ctx.scatter('namaqualand_boulder_05', { count: 10, minScale: 0.8, maxScale: 1.8, radius: 50, innerRadius: 7, seed: 75 }),
      ctx.scatter('namaqualand_boulder_02', { count: 8, minScale: 0.8, maxScale: 1.6, radius: 50, innerRadius: 7, seed: 76 }),
    ]);
    addFootprintTrail(ctx, { from: [-3.5, 0, 5], to: [3.5, 0, -5], steps: 14 });
    ctx.poi('Laetoli footprints — 3.66 MYA volcanic ash trackway of upright walkers', new THREE.Vector3(0, 0.2, 0));

    // Living, moving Australopithecus afarensis ("Lucy") & family group walking upright along the Laetoli trackway!
    await spawnLivingHuman(ctx, {
      x: -0.4, z: 0.5, height: 1.18, sex: 'female', style: 'hominin', action: 'walk',
      path: [[-1.4, 2.0], [1.8, -2.6]], speed: 0.85, phase: 2.4,
      poi: 'Australopithecus afarensis ("Lucy", 3.2 MYA) — walking upright along the Laetoli trail',
    });
    await spawnLivingHuman(ctx, {
      x: -1.4, z: 1.4, height: 1.36, sex: 'male', style: 'hominin', action: 'hunt', tool: 'spear',
      path: [[-2.2, 2.6], [0.8, -1.8]], speed: 0.85, phase: 3.0,
      poi: 'Bipedal hominin companion — freed hands carry sticks, stones & food across the savanna',
    });
    await spawnLivingHuman(ctx, {
      x: 2.2, z: 1.4, height: 1.22, sex: 'female', style: 'hominin', action: 'knap', tool: 'handaxe', rotY: -0.7,
      poi: 'Oldowan cobble tool-flaking — earliest stone tool experiments',
    });

    // Savanna proboscidean in the distant Rift Valley background
    const savMammoth = await ctx.prop(PRE('mammoth.glb'), { x: -9.5, z: -11.0, fit: 4.2, rotY: 0.5, playAll: true, tint: 0x7d583a });
    animateCreatureRig(savMammoth, ctx, { path: [[-12.0, -12.0], [-4.0, -9.5]], speed: 0.8 });

    // Bipedal skeleton comparison exhibit on carved stone plinth
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.25, 32), await ctx.material('rock_boulder_dry', { repeat: 1, displacementScale: 0 }));
    ensureUV1(plinth.geometry);
    plinth.position.set(4.4, ctx.terrain.heightAt(4.4, 2.5) + 0.125, 2.5);
    plinth.receiveShadow = plinth.castShadow = true;
    ctx.group.add(plinth);
    await ctx.prop(ANAT('skeleton.glb'), { x: 4.4, z: 2.5, y: plinth.position.y + 0.125, fit: 1.15, rotY: -0.6, tint: 0xd9cbb4, roughness: 0.6, poi: 'Bipedal skeleton — bowl-shaped pelvis & angled femur for upright stride' });
    ctx.particles({ count: 350, box: [60, 6, 60], center: [0, 2, 0], color: 0xffe0b0, size: 0.05, speed: 0.15, direction: 1, sway: 1.2, opacity: 0.35, additive: true });
  },

  /* ---------------- 14. Homo erectus & fire (Wonderwerk Cave) ---------------- */
  'homo-erectus-fire': async (ctx) => {
    ctx.setEnv({ hdri: 'hikers_cave', envIntensity: 0.65, bgIntensity: 0.7, fogColor: 0x2a2420, fogDensity: 0.016, sunDir: [0.6, 0.3, 0.7], sunColor: 0xffb070, sunIntensity: 1.1, hemi: 0.28, exposure: 1.08 });
    ctx.setCamera({ distance: 8.8, pitch: 0.15, targetY: 1.15, yaw: 0.18 });
    await ctx.ground('rocks_ground_01', { repeat: 16, color: 0x8a7a6a, amplitude: 1.0, frequency: 0.06, displacementScale: 0.2, flatRadius: 5 });
    // Cave walls from real cliff scans
    await ctx.prop('namaqualand_cliff_01', { x: -9, z: -12, scale: 3.2, rotY: 0.6 });
    await ctx.prop('namaqualand_cliff_01', { x: 10, z: -13, scale: 3.6, rotY: -0.9 });
    await ctx.prop('coastal_cliff_01', { x: 0, z: -22, scale: 2.2, rotY: 0.0 });
    await Promise.all([
      ctx.scatter('stone_01', { count: 70, minScale: 0.6, maxScale: 1.5, radius: 30, innerRadius: 1.8, seed: 81 }),
      ctx.scatter('dry_branches_medium_01', { count: 24, minScale: 0.8, maxScale: 1.3, radius: 25, innerRadius: 2.5, seed: 82 }),
      ctx.scatter('grass_medium_01', { count: 60, minScale: 0.7, maxScale: 1.1, radius: 30, innerRadius: 6, seed: 83, tint: 0xb8a070 }),
    ]);
    // Hearth ring of stones + roaring campfire
    const stoneProto = await ctx.assets.loadGLTF(PH('stone_01'));
    if (stoneProto) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const s = stoneProto.scene.clone(true);
        s.scale.setScalar(0.55 + (i % 3) * 0.12);
        s.position.set(Math.cos(a) * 0.95, ctx.terrain.heightAt(Math.cos(a) * 0.95, Math.sin(a) * 0.95), Math.sin(a) * 0.95);
        s.rotation.y = a * 2;
        ctx.group.add(s);
      }
    }
    const hearth = ctx.fire({ position: [0, ctx.terrain.heightAt(0, 0) + 0.05, 0], scale: 1.35, intensity: 1.8, lightIntensity: 78 });
    ctx.poi('🔥 Controlled Fire — Wonderwerk Cave (~1 million–400,000 YA)', hearth.group, 2.2);

    // Living, clothed, animated Homo erectus band tending fire, knapping Acheulean axes & guarding the cave!
    await spawnLivingHuman(ctx, {
      x: -1.65, z: 0.15, rotY: 1.4, height: 1.70, sex: 'female', style: 'erectus',
      action: 'fire', tool: 'firebrand',
      poi: 'Homo erectus Fire-Keeper — tending hearth flames to cook food & fuel brain growth',
    });
    await spawnLivingHuman(ctx, {
      x: 1.75, z: 0.45, rotY: -1.2, height: 1.74, sex: 'male', style: 'erectus',
      action: 'knap', tool: 'handaxe',
      poi: 'Homo erectus Master Toolmaker — flaking symmetrical Acheulean teardrop stone hand-axes',
    });
    await spawnLivingHuman(ctx, {
      x: -0.3, z: -2.6, height: 1.76, sex: 'male', style: 'erectus',
      action: 'hunt', tool: 'spear',
      path: [[-2.4, -2.6], [0.6, -2.8]], speed: 0.9,
      poi: 'Homo erectus Hunter — patrolling with fire-hardened wooden Schöningen spear',
    });

    // Acheulean hand-axes knapped from stone (teardrop bifaces) on a flat rock
    const flint = await ctx.material('rock_face', { repeat: 1.5, displacementScale: 0, color: 0x9a8f80 });
    for (let i = 0; i < 3; i++) {
      const pts = [];
      for (let k = 0; k <= 14; k++) {
        const t = k / 14;
        const r = 0.085 * Math.sin(Math.PI * Math.pow(t, 0.75)) * (1 + 0.06 * Math.sin(t * 40));
        pts.push(new THREE.Vector2(Math.max(0.002, r), t * 0.24));
      }
      const geo = new THREE.LatheGeometry(pts, 18);
      geo.scale(1, 1, 0.42);
      ensureUV1(geo);
      const axe = new THREE.Mesh(geo, flint);
      axe.position.set(1.9 + i * 0.28, ctx.terrain.heightAt(1.9, 1.4) + 0.05, 1.4 + (i % 2) * 0.2);
      axe.rotation.set(Math.PI / 2 - 0.3, 0, i * 0.7);
      axe.castShadow = true;
      ctx.group.add(axe);
      if (i === 0) ctx.poi('Acheulean teardrop hand-axe (1.7 MYA bifacial stone tool)', axe, 0.45);
    }
    ctx.particles({ count: 260, box: [20, 6, 20], center: [0, 2.5, 0], color: 0xffd090, size: 0.035, speed: 0.12, direction: 1, sway: 0.6, opacity: 0.35, additive: true });
    ctx.onWhatIf((on) => {
      hearth.material.uniforms.uIntensity.value = on ? 2.6 : 1.8;
      hearth.group.scale.setScalar(on ? 1.5 : 1);
    });
  },

  /* ---------------- 15. Family tree: Neanderthals, Denisovans & Homo sapiens ---------------- */
  'sapiens-neanderthals-500k': async (ctx) => {
    ctx.setEnv({ hdri: 'forest_cave', envIntensity: 0.85, bgIntensity: 0.85, fogColor: 0x2b2a26, fogDensity: 0.012, sunDir: [0.3, 0.5, 0.8], sunColor: 0xffe0c0, sunIntensity: 1.8, hemi: 0.35 });
    ctx.setCamera({ distance: 9.2, pitch: 0.14, targetY: 1.25, yaw: 0.1, minDistance: 2 });
    await ctx.ground('rocks_ground_01', { repeat: 14, color: 0x8a8078, amplitude: 0.6, frequency: 0.06, displacementScale: 0.15, flatRadius: 7 });
    await ctx.prop('namaqualand_cliff_01', { x: -8, z: -10, scale: 3.0, rotY: 0.5 });
    await ctx.prop('coastal_cliff_01', { x: 6, z: -16, scale: 2.0, rotY: -0.4 });
    await ctx.scatter('stone_01', { count: 55, minScale: 0.6, maxScale: 1.4, radius: 28, innerRadius: 3, seed: 91 });
    await ctx.scatter('grass_medium_01', { count: 90, minScale: 0.8, maxScale: 1.3, radius: 26, innerRadius: 3.5, seed: 92, wind: { amp: 0.06, speed: 1.4, height: 0.5 } });

    // Central shared encampment hearth where Homo sapiens, Neanderthals & Denisovans meet!
    const campFire = ctx.fire({ position: [0, ctx.terrain.heightAt(0, -0.8) + 0.05, -0.8], scale: 1.15, intensity: 1.65, lightIntensity: 58 });
    ctx.poi('Shared Pleistocene Encampment — Sapiens, Neanderthals & Denisovans meet', campFire.group, 2.0);

    // 1. Homo sapiens explorers (slender build, ochre-trimmed hide tunic, walking & gesturing)
    await spawnLivingHuman(ctx, {
      x: -1.8, z: 0.8, height: 1.75, sex: 'female', style: 'sapiens',
      action: 'walk', tool: 'spear',
      path: [[-3.2, 1.8], [-0.8, 0.4]], speed: 0.95,
      poi: 'Homo sapiens (300,000 YA, Jebel Irhoud) — symbolic thought, long-distance trade & composite tools',
    });
    await spawnLivingHuman(ctx, {
      x: -0.9, z: -1.9, rotY: 0.45, height: 1.78, sex: 'male', style: 'sapiens',
      action: 'debate', tool: 'torch',
      poi: 'Homo sapiens Storyteller — complex vocal language & social networks',
    });

    // 2. Homo neanderthalensis hunters (stockier cold-adapted build, heavy fur pelts, tending fire & crafting tools)
    await spawnLivingHuman(ctx, {
      x: 1.45, z: -0.4, rotY: -1.1, height: 1.65, sex: 'male', style: 'neanderthal',
      action: 'fire', tool: 'spear',
      poi: 'Homo neanderthalensis (400K–40K YA) — stocky Ice Age hunter, birch-tar adhesive & Mousterian flint tools',
    });
    await spawnLivingHuman(ctx, {
      x: 2.5, z: 1.2, height: 1.62, sex: 'female', style: 'neanderthal',
      action: 'walk', tool: 'handaxe',
      path: [[3.4, 2.0], [1.4, 0.5]], speed: 0.88, phase: 2.1,
      poi: 'Neanderthal & Sapiens interbreeding — 1–2% of modern Eurasian DNA',
    });

    // 3. Denisovan artisan working bone needles & jewelry
    await spawnLivingHuman(ctx, {
      x: 0.3, z: -2.8, rotY: 0.1, height: 1.68, sex: 'female', style: 'iceage',
      action: 'knap', tool: 'handaxe',
      poi: 'Denisovan (Siberia & Tibet) — gifted high-altitude EPAS1 gene to modern Tibetans',
    });

    // 4K Photogrammetry Homo sapiens head scan on a carved stone pedestal at the side of the camp
    const plinthMat = await ctx.material('marble_01', { repeat: 2, displacementScale: 0 });
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 0.95, 28), plinthMat);
    ensureUV1(p.geometry);
    const px = -3.6, pz = -1.4;
    const py = ctx.terrain.heightAt(px, pz);
    p.position.set(px, py + 0.475, pz);
    p.castShadow = p.receiveShadow = true;
    ctx.group.add(p);
    const head = await ctx.prop(PBR('lee_perry_smith_head.glb'), { x: px, z: pz, y: py + 0.95, fit: 0.62, rotY: 0.45, poi: 'Homo sapiens — high-resolution 4K photogrammetry cranial & facial scan' });
    if (head) {
      const [col, nor, spec] = await Promise.all([
        ctx.assets.loadTexture('./assets/models/pbr/LeePerrySmith/Map-COL.jpg', { srgb: true, repeat: 1 }),
        ctx.assets.loadTexture('./assets/models/pbr/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg', { repeat: 1 }),
        ctx.assets.loadTexture('./assets/models/pbr/LeePerrySmith/Map-SPEC.jpg', { repeat: 1 }),
      ]);
      [col, nor, spec].forEach((t) => {
        if (t) {
          t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
          t.flipY = false;
        }
      });
      head.traverse((o) => {
        if (o.isMesh) {
          o.material = new THREE.MeshStandardMaterial({ map: col || null, normalMap: nor || null, normalScale: new THREE.Vector2(0.8, 0.8), roughnessMap: spec || null, roughness: 0.62, metalness: 0.0, color: 0xffffff });
        }
      });
      ctx.anim.push((t) => {
        head.rotation.y = 0.45 + Math.sin(t * 0.35) * 0.28;
      });
    }
    ctx.particles({ count: 220, box: [16, 5, 16], center: [0, 2, 0], color: 0xffe0b0, size: 0.03, speed: 0.08, direction: 1, sway: 0.4, opacity: 0.28, additive: true });
  },

  /* ---------------- 16. Out of Africa & cave art ---------------- */
  'out-of-africa-100k': async (ctx) => {
    ctx.setEnv({ hdri: 'forest_cave', envIntensity: 0.42, bgIntensity: 0.3, fogColor: 0x1a1512, fogDensity: 0.024, sunDir: [0.4, 0.4, 0.8], sunColor: 0xffc080, sunIntensity: 0.65, hemi: 0.22, exposure: 1.12 });
    ctx.setCamera({ distance: 7.8, pitch: 0.09, targetY: 1.5, yaw: 0.0, minDistance: 2 });
    await ctx.ground('rocks_ground_01', { repeat: 14, color: 0x7a6a5a, amplitude: 0.5, frequency: 0.06, displacementScale: 0.15, flatRadius: 6 });
    const rockMat = await ctx.material('rock_face', { repeat: 6, displacementScale: 0.5 });
    const wallGeo = new THREE.CylinderGeometry(9, 9.6, 7.5, 64, 24, true, Math.PI * 0.62, Math.PI * 0.76);
    ensureUV1(wallGeo);
    const wall = new THREE.Mesh(wallGeo, rockMat);
    wall.position.set(0, 3.2, 2.5);
    wall.receiveShadow = true;
    ctx.group.add(wall);
    const ceiling = new THREE.Mesh(new THREE.SphereGeometry(9.4, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.42), rockMat);
    ceiling.position.set(0, 2.2, 2.5);
    ceiling.material = rockMat;
    ceiling.scale.set(1, 0.75, 1);
    ctx.group.add(ceiling);
    // Cave paintings projected onto the rock wall
    const art = await ctx.assets.loadTexture('./assets/scenes/homo-sapiens.jpg', { srgb: true, repeat: 1 });
    if (art) {
      art.wrapS = art.wrapT = THREE.ClampToEdgeWrapping;
      const decalGeo = new THREE.CylinderGeometry(8.85, 8.85, 3.6, 48, 1, true, Math.PI * 0.72, Math.PI * 0.56);
      const decal = new THREE.Mesh(decalGeo, new THREE.MeshStandardMaterial({ map: art, transparent: true, opacity: 0.88, roughness: 1, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
      decal.position.set(0, 3.0, 2.5);
      decal.renderOrder = 3;
      ctx.group.add(decal);
      ctx.poi('Cave paintings — ochre horses, lions & hand stencils (Chauvet / Sulawesi, 40,000 YA)', decal, 2.2);
    }
    // Torches lighting the gallery
    [[-3.2, 0.8], [3.4, 0.6], [0.3, -0.4]].forEach(([x, z]) => {
      const y = ctx.terrain.heightAt(x, z);
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.9 }));
      stick.position.set(x, y + 0.7, z);
      stick.castShadow = true;
      ctx.group.add(stick);
      ctx.fire({ position: [x, y + 1.35, z], scale: 0.45, intensity: 1.8, lightIntensity: 28, lightDistance: 14, smoke: false });
    });
    // Living, clothed Paleolithic Cave Artists & Storytellers actively painting & grinding ochre!
    await spawnLivingHuman(ctx, {
      x: -1.1, z: -3.2, rotY: 3.0, height: 1.72, sex: 'female', style: 'sapiens',
      action: 'paint', tool: 'torch',
      poi: 'Paleolithic Cave Artist — painting red ochre & charcoal murals by flickering torchlight',
    });
    await spawnLivingHuman(ctx, {
      x: 1.8, z: -2.2, rotY: -2.6, height: 1.75, sex: 'male', style: 'sapiens',
      action: 'knap', tool: 'handaxe',
      poi: 'Ochre Pigment Maker — grinding iron oxide & charcoal with bone mortars',
    });
    await spawnLivingHuman(ctx, {
      x: -0.2, z: -1.2, height: 1.74, sex: 'male', style: 'sapiens',
      action: 'walk', tool: 'spear',
      path: [[-2.4, -1.4], [2.2, -1.2]], speed: 0.85,
      poi: 'Upper Paleolithic Hunter & Storyteller — bone flutes, sewn clothing & symbolic art',
    });
    await ctx.prop(PBR('nemetona_bust.glb'), { x: 2.6, z: -0.6, fit: 0.8, rotY: -0.4, poi: 'Carved ivory & stone sculpture (40,000 YA)' });
    await ctx.scatter('stone_01', { count: 40, minScale: 0.6, maxScale: 1.3, radius: 20, innerRadius: 2.5, seed: 101 });
    ctx.particles({ count: 200, box: [14, 5, 14], center: [0, 2.5, 0], color: 0xffd8a0, size: 0.03, speed: 0.08, direction: 1, sway: 0.5, opacity: 0.3, additive: true });
  },

  /* ---------------- 17. Beringia, mammoths & the Ice Age ---------------- */
  'beringia-americas': async (ctx) => {
    ctx.setEnv({ hdri: 'rogland_clear_night', envIntensity: 0.55, bgIntensity: 0.9, fogColor: 0x0c1626, fogDensity: 0.011, sunDir: [-0.4, 0.5, -0.7], sunColor: 0xa9c4ff, sunIntensity: 0.95, hemi: 0.35, exposure: 1.08 });
    ctx.setCamera({ distance: 13.5, pitch: 0.13, targetY: 1.8, yaw: -0.25 });
    await ctx.ground('snow_02', { repeat: 20, amplitude: 1.4, frequency: 0.04, displacementScale: 0.18 });
    FX.createAurora(ctx.group, ctx.anim, { radius: 90, height: 34, baseY: 22, intensity: 1.2 });
    ctx.particles({ count: 1800, box: [90, 30, 90], center: [0, 14, 0], color: 0xffffff, size: 0.1, speed: 0.35, direction: -1, sway: 0.7, opacity: 0.85 });
    await Promise.all([
      ctx.scatter('fir_sapling_medium', { count: 24, minScale: 1.0, maxScale: 2.2, radius: 60, innerRadius: 9, seed: 111 }),
      ctx.scatter('dead_tree_trunk', { count: 10, minScale: 0.9, maxScale: 1.4, radius: 50, innerRadius: 7, seed: 112 }),
      ctx.scatter('boulder_01', { count: 10, minScale: 0.8, maxScale: 1.8, radius: 50, innerRadius: 6, seed: 113, tint: 0xd8dde4 }),
      ctx.scatter('dry_branches_medium_01', { count: 30, minScale: 0.8, maxScale: 1.3, radius: 40, innerRadius: 3, seed: 114 }),
    ]);
    const camp = ctx.fire({ position: [2.2, ctx.terrain.heightAt(2.2, 1.5), 1.5], scale: 1.25, intensity: 1.75, lightIntensity: 82 });
    ctx.poi('Ice-age hunters’ camp on the Bering land bridge (20,000 YA)', camp.group, 1.8);
    // Rigged, walking Woolly Mammoth herd (Mammuthus primigenius) marching across Beringia!
    const m1 = await ctx.prop(PRE('mammoth.glb'), { x: -3.2, z: -3.5, fit: 5.4, rotY: 0.65, playAll: true, timeScale: 0.9, poi: 'Woolly Mammoth (Mammuthus primigenius) — 4 m tall, curved tusks & shaggy coat marching across Beringia' });
    animateCreatureRig(m1, ctx, { path: [[-5.5, -5.0], [0.5, -2.2]], speed: 0.9, strideAmp: 0.38 });
    const m2 = await ctx.prop(PRE('mammoth.glb'), { x: -9.5, z: -8.5, fit: 4.8, rotY: 0.55, playAll: true, timeScale: 0.85 });
    animateCreatureRig(m2, ctx, { path: [[-11.5, -9.8], [-5.2, -6.5]], speed: 0.85, strideAmp: 0.36 });
    const m3 = await ctx.prop(PRE('mammoth.glb'), { x: 1.8, z: -10.0, fit: 3.4, rotY: 0.75, playAll: true, timeScale: 0.95, poi: 'Juvenile woolly mammoth marching with the herd' });
    animateCreatureRig(m3, ctx, { path: [[-1.0, -11.0], [4.5, -7.8]], speed: 1.0, strideAmp: 0.40 });

    // Paleo-Arctic Hunters in fur parkas trekking across Beringia into the Americas!
    await spawnLivingHuman(ctx, {
      x: 0.8, z: 2.2, height: 1.72, sex: 'male', style: 'iceage',
      action: 'hunt', tool: 'spear',
      path: [[-1.5, 3.2], [3.5, 0.5]], speed: 0.95,
      poi: 'Beringian Paleo-Arctic Hunter — crossing from Siberia to Alaska (~20,000 YA)',
    });
    await spawnLivingHuman(ctx, {
      x: 3.4, z: 1.8, rotY: -1.2, height: 1.66, sex: 'female', style: 'iceage',
      action: 'fire', tool: 'torch',
      poi: ' Paleo-Arctic Explorer — tailored fur parkas sewn with bone eyed-needles',
    });

    await addDriftGlobeExhibit(ctx, { x: 5.5, z: 3.5, iceAge: true, label: 'Beringia exposed — sea level −120 m' });
    ctx.onWhatIf((on) => {
      camp.group.scale.setScalar(on ? 1.6 : 1);
    });
  },

  /* ---------------- 18. Farming revolution ---------------- */
  'farming-revolution': async (ctx) => {
    ctx.setEnv({ hdri: 'farm_field', envIntensity: 1.0, bgIntensity: 1.0, fogColor: 0xd7dcc8, fogDensity: 0.004, sunDir: [0.5, 0.65, 0.4], sunColor: 0xfff3d0, sunIntensity: 3.0, hemi: 0.5 });
    ctx.setCamera({ distance: 11, pitch: 0.15, targetY: 1.2, yaw: 0.22 });
    await ctx.ground('farm_soil', { repeat: 24, amplitude: 0.8, frequency: 0.04, displacementScale: 0.12, flatRadius: 12 });
    // Golden wheat field swaying in the wind
    await ctx.scatter('grass_medium_01', { count: 720, minScale: 1.1, maxScale: 1.7, radius: 40, innerRadius: 5, seed: 121, tint: 0xd8b25a, mask: (x, z) => z < -2.2 || x > 5, wind: { amp: 0.09, speed: 1.5, height: 0.6 } });
    await ctx.scatter('shrub_02', { count: 16, minScale: 0.9, maxScale: 1.4, radius: 50, innerRadius: 12, seed: 122 });
    await ctx.scatter('tree_small_02', { count: 8, minScale: 0.9, maxScale: 1.3, radius: 60, innerRadius: 18, seed: 123 });
    // Mud-brick house with wooden-beam flat roof
    const mud = await ctx.material('sandstone_cracks', { repeat: 4, displacementScale: 0.08, color: 0xc9a77a });
    const wood = await ctx.material('rock_boulder_dry', { repeat: 2, displacementScale: 0, color: 0x6b4a2c });
    const house = new THREE.Group();
    const walls = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 5), mud);
    ensureUV1(walls.geometry);
    walls.position.y = 1.5;
    walls.castShadow = walls.receiveShadow = true;
    house.add(walls);
    for (let i = 0; i < 9; i++) {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 6.6, 10), wood);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(0, 3.05, -2.2 + i * 0.55);
      house.add(beam);
    }
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.1), new THREE.MeshStandardMaterial({ color: 0x1a120c }));
    door.position.set(1.2, 0.9, 2.53);
    house.add(door);
    house.position.set(-6, ctx.terrain.heightAt(-6, -6), -6);
    house.rotation.y = 0.5;
    ctx.group.add(house);
    ctx.poi('Mud-brick farmhouse — first permanent villages (Fertile Crescent, 9,000 BCE)', house, 3.6);
    await ctx.prop(PBR('village_waterwell.glb'), { x: -2.5, z: -2.0, fit: 2.2, rotY: 0.3, poi: 'Stone village well — permanent irrigation & water supply' });
    const wagon = await ctx.prop(PBR('village_wagon.glb'), { x: 3.4, z: -1.4, fit: 2.4, rotY: -0.6, poi: 'Wheeled wooden cart (~3500 BCE) — revolutionizing agriculture & trade' });
    if (wagon) {
      ctx.anim.push((t) => {
        const u = Math.sin(t * 0.35) * 2.2;
        const wx = 3.4 + u * 0.8;
        const wz = -1.4 + u * 0.5;
        wagon.position.set(wx, ctx.terrain.heightAt(wx, wz), wz);
      });
    }

    // Living, moving Neolithic Farmers actively harvesting wheat, hoeing soil, drawing water & driving the cart!
    await spawnLivingHuman(ctx, {
      x: -0.6, z: -3.2, rotY: 0.25, height: 1.72, sex: 'male', style: 'farmer',
      hat: 'straw', action: 'harvest', tool: 'sickle',
      poi: 'Neolithic Farmer — harvesting domesticated einkorn & emmer wheat with a flint-bladed sickle',
    });
    await spawnLivingHuman(ctx, {
      x: 1.8, z: -3.8, rotY: -0.35, height: 1.66, sex: 'female', style: 'farmer',
      hat: 'straw', action: 'harvest', tool: 'hoe',
      poi: 'Neolithic Cultivator — tilling fertile alluvial soil & planting grain rows',
    });
    await spawnLivingHuman(ctx, {
      x: -2.2, z: -0.4, height: 1.65, sex: 'female', style: 'farmer',
      action: 'walk', tool: 'jug',
      path: [[-2.2, -1.2], [-4.8, -3.5]], speed: 0.95,
      poi: 'Village Water-Bearer — carrying fired clay vessels from the well to the granary',
    });
    await spawnLivingHuman(ctx, {
      x: 2.4, z: 0.4, height: 1.74, sex: 'male', style: 'farmer',
      hat: 'straw', action: 'walk', tool: 'basket',
      path: [[1.2, 0.8], [4.6, -0.4]], speed: 0.9,
      poi: 'Grain Harvester — transporting bundled wheat sheaves to the village threshing floor',
    });

    // Pottery & baskets (real photogrammetry scans)
    await ctx.prop('ceramic_vase_01', { x: 0.6, z: 1.2, fit: 0.75, poi: 'Fired clay pottery — grain & olive-oil storage' });
    await ctx.prop('jug_01', { x: 1.3, z: 1.0, fit: 0.65 });
    await ctx.prop('wooden_bowl_01', { x: -0.3, z: 1.6, fit: 0.5 });
    await ctx.prop('wicker_basket_01', { x: -1.4, z: 0.8, fit: 0.7 });
    ctx.particles({ count: 200, box: [50, 6, 50], center: [0, 2, 0], color: 0xfff0c0, size: 0.04, speed: 0.15, direction: 1, sway: 1.0, opacity: 0.3, additive: true });
  },

  /* ---------------- 19. Bronze Age & pyramids ---------------- */
  'bronze-age-pyramids': async (ctx) => {
    ctx.setEnv({ hdri: 'syferfontein_1d_clear', envIntensity: 1.0, bgIntensity: 1.0, fogColor: 0xe7d6b8, fogDensity: 0.0028, sunDir: [0.5, 0.75, 0.45], sunColor: 0xfff6e0, sunIntensity: 3.4, hemi: 0.55 });
    ctx.setCamera({ distance: 16, pitch: 0.11, targetY: 2.0, yaw: 0.12 });
    await ctx.ground('sand_01', { repeat: 26, amplitude: 1.4, frequency: 0.03, displacementScale: 0.12, flatRadius: 16, size: 320, segments: 220 });
    const sandstone = await ctx.material('large_sandstone_blocks', { repeat: 1, displacementScale: 0.04, color: 0xe0c9a0 });
    const great = ARCH.createPyramid(sandstone, { base: 84, height: 50, courses: 44, blockLen: 1.9, position: [-28, 0, -145], rotationY: 0.2 });
    const second = ARCH.createPyramid(sandstone, { base: 70, height: 42, courses: 40, blockLen: 1.75, position: [44, 0, -175], rotationY: 0.15 });
    const third = ARCH.createPyramid(sandstone, { base: 36, height: 23, courses: 30, blockLen: 1.2, position: [98, 0, -195], rotationY: 0.1 });
    ctx.group.add(great, second, third);
    ctx.poi('Great Pyramid of Giza — 146 m, 2.3 million blocks (2560 BCE)', great, 36);
    const mudbrick = await ctx.material('sandstone_cracks', { repeat: 3, displacementScale: 0.05, color: 0xb98f63 });
    const zig = ARCH.createZiggurat(mudbrick, { base: 34, tiers: 4, tierH: 4.5, position: [-88, 0, -85] });
    ctx.group.add(zig);
    ctx.poi('Ziggurat of Ur — Mesopotamia (2100 BCE)', zig, 20);
    await ctx.water({ size: 500, y: -0.35, color: 0x2f6f7a, distortion: 1.0 });
    ctx.terrain.mesh.position.y = 0;
    await Promise.all([
      ctx.scatter('island_tree_01', { count: 10, minScale: 0.9, maxScale: 1.3, radius: 70, innerRadius: 20, seed: 131, mask: (x, z) => z > 20 }),
      ctx.scatter('grass_medium_01', { count: 120, minScale: 0.9, maxScale: 1.4, radius: 60, innerRadius: 6, seed: 132, tint: 0x9fb060, mask: (x, z) => z > 12 }),
      ctx.scatter('namaqualand_boulder_05', { count: 6, minScale: 0.6, maxScale: 1.4, radius: 50, innerRadius: 10, seed: 133, tint: 0xd8c3a0 }),
    ]);

    // Living Ancient Egyptian Builders, Stone-Masons & Royal Scribes working on the Giza Plateau!
    await spawnLivingHuman(ctx, {
      x: -3.2, z: -2.8, height: 1.73, sex: 'male', style: 'egyptian',
      action: 'haul', path: [[-5.5, -2.0], [1.5, -5.5]], speed: 0.9,
      poi: 'Egyptian Pyramid Builder — hauling 2.5-ton Tura limestone blocks on wetted sand sleds',
    });
    await spawnLivingHuman(ctx, {
      x: -4.4, z: -2.2, height: 1.71, sex: 'male', style: 'egyptian',
      action: 'haul', path: [[-6.8, -1.4], [0.2, -4.9]], speed: 0.9, phase: 0.8,
    });
    await spawnLivingHuman(ctx, {
      x: 2.8, z: -1.8, rotY: -0.6, height: 1.72, sex: 'male', style: 'egyptian',
      action: 'knap', tool: 'hammer',
      poi: 'Bronze Age Stone-Mason — dressing limestone blocks with Arsenical Bronze chisels & dolerite pounders',
    });
    await spawnLivingHuman(ctx, {
      x: -2.2, z: 1.6, rotY: 0.5, height: 1.68, sex: 'female', style: 'egyptian',
      action: 'debate', tool: 'scroll',
      poi: 'Royal Scribe & Astronomer — recording grain rations & stellar alignment on papyrus',
    });

    // Queen Nefertiti bust & Bronze Age vessels on carved sandstone altar
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.85, 1.3), sandstone);
    ensureUV1(table.geometry);
    table.position.set(0, ctx.terrain.heightAt(0, 0) + 0.425, 0);
    table.castShadow = table.receiveShadow = true;
    ctx.group.add(table);
    await ctx.prop(PBR('nefertiti_bust.glb'), { x: 0.2, z: 0, y: table.position.y + 0.425, fit: 1.15, rotY: 0.15, poi: 'Bust of Queen Nefertiti (1345 BCE) — high-res museum scan' });
    await ctx.prop('brass_pot_01', { x: -1.35, z: 0.1, y: table.position.y + 0.425, fit: 0.72, poi: 'Bronze vessel (90% copper + 10% tin alloy)', metalness: 1, roughness: 0.35 });
    await ctx.prop('antique_ceramic_vase_01', { x: 1.45, z: 0.1, y: table.position.y + 0.425, fit: 0.85 });
    ctx.particles({ count: 300, box: [80, 8, 80], center: [0, 3, 0], color: 0xffe8c0, size: 0.06, speed: 0.2, direction: 1, sway: 1.4, opacity: 0.25 });
  },

  /* ---------------- 20. Classical Greece ---------------- */
  'classical-greece': async (ctx) => {
    ctx.setEnv({ hdri: 'kiara_1_dawn', envIntensity: 1.0, bgIntensity: 1.0, fogColor: 0xdfe4ea, fogDensity: 0.003, sunDir: [0.55, 0.55, 0.6], sunColor: 0xffe6c0, sunIntensity: 3.2, hemi: 0.55 });
    ctx.setCamera({ distance: 17, pitch: 0.11, targetY: 2.4, yaw: 0.18 });
    await ctx.ground('rocks_ground_01', { repeat: 22, color: 0xbfb09a, amplitude: 1.2, frequency: 0.04, displacementScale: 0.15, flatRadius: 14 });
    const marble = await ctx.material('marble_01', { repeat: 2, displacementScale: 0.0, color: 0xf2eee4 });
    const temple = ARCH.createGreekTemple(marble, { position: [0, 0, -48], rotationY: Math.PI / 2 });
    ctx.group.add(temple);
    ctx.poi('Parthenon — 8 × 17 Doric columns on the Athenian Acropolis (447 BCE)', temple, 16);
    await Promise.all([
      ctx.scatter('searsia_burchellii', { count: 14, minScale: 0.9, maxScale: 1.5, radius: 60, innerRadius: 14, seed: 141 }),
      ctx.scatter('wild_rooibos_bush', { count: 30, minScale: 0.8, maxScale: 1.4, radius: 55, innerRadius: 8, seed: 142 }),
      ctx.scatter('grass_medium_01', { count: 160, minScale: 0.8, maxScale: 1.3, radius: 50, innerRadius: 6, seed: 143, tint: 0xb9b070 }),
      ctx.scatter('namaqualand_boulder_02', { count: 8, minScale: 0.8, maxScale: 1.6, radius: 50, innerRadius: 12, seed: 144, tint: 0xd8cdb8 }),
    ]);

    // Living Classical Greek Philosophers, Geometers & Citizens debating in front of the Parthenon!
    await spawnLivingHuman(ctx, {
      x: -1.4, z: -1.8, rotY: 0.8, height: 1.74, sex: 'male', style: 'greek',
      action: 'debate', tool: 'scroll',
      poi: 'Athenian Philosopher (Socrates / Plato / Aristotle era) — debating ethics, logic & the cosmos',
    });
    await spawnLivingHuman(ctx, {
      x: 1.2, z: -2.0, rotY: -0.9, height: 1.68, sex: 'female', style: 'greek',
      action: 'debate', tool: 'scroll',
      poi: 'Greek Mathematician & Astronomer — Euclidean geometry & Eratosthenes measuring Earth’s circumference',
    });
    await spawnLivingHuman(ctx, {
      x: 0.0, z: -5.5, height: 1.75, sex: 'male', style: 'greek',
      action: 'walk', path: [[-4.5, -5.5], [4.5, -5.5]], speed: 0.9,
      poi: 'Athenian Citizen walking to the Ecclesia (Direct Democracy Assembly)',
    });

    const plinth = (x, z, h = 1.2) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, h, 0.9), marble);
      ensureUV1(p.geometry);
      p.position.set(x, ctx.terrain.heightAt(x, z) + h / 2, z);
      p.castShadow = p.receiveShadow = true;
      ctx.group.add(p);
      return p.position.y + h / 2;
    };
    await ctx.prop('marble_bust_01', { x: -2.8, z: 1.5, y: plinth(-2.8, 1.5), fit: 0.95, rotY: 0.4, poi: 'Marble portrait bust — philosophy & democracy' });
    await ctx.prop('horse_statue_01', { x: 2.8, z: 0.8, y: plinth(2.8, 0.8, 1.0), fit: 1.15, rotY: -0.5, poi: 'Bronze horse — Classical Greek sculpture' });
    await ctx.prop('antique_ceramic_vase_01', { x: 0.2, z: 2.4, fit: 0.95, poi: 'Amphora — Mediterranean wine & olive-oil trade' });
    ctx.particles({ count: 200, box: [60, 8, 60], center: [0, 3, 0], color: 0xffffff, size: 0.04, speed: 0.1, direction: 1, sway: 1.0, opacity: 0.2, additive: true });
  },

  /* ---------------- 21. Roman Empire ---------------- */
  'roman-empire': async (ctx) => {
    ctx.setEnv({ hdri: 'roofless_ruins', envIntensity: 1.0, bgIntensity: 1.0, fogColor: 0xd8d4c8, fogDensity: 0.004, sunDir: [0.5, 0.6, -0.5], sunColor: 0xfff0d8, sunIntensity: 3.0, hemi: 0.5 });
    ctx.setCamera({ distance: 17, pitch: 0.12, targetY: 2.6, yaw: -0.2 });
    await ctx.ground('patterned_cobblestone', { repeat: 40, amplitude: 0.5, frequency: 0.04, displacementScale: 0.08, flatRadius: 30 });
    const travertine = await ctx.material('large_sandstone_blocks', { repeat: 1.2, displacementScale: 0.03, color: 0xe8dcc4 });
    const col = ARCH.createColosseum(travertine, { a: 50, b: 42, tiers: 3, position: [0, 0, -78] });
    ctx.group.add(col);
    ctx.poi('Flavian Amphitheatre (Colosseum, 80 CE) — 50,000 spectators', col, 26);
    const aq = ARCH.createAqueduct(travertine, { length: 140, arches: 18, h: 11, position: [-70, 0, -20], rotationY: Math.PI / 2.4 });
    ctx.group.add(aq);
    ctx.poi('Roman Aqueduct — gravity-fed fresh water over 90 km', aq, 14);
    await Promise.all([
      ctx.scatter('searsia_burchellii', { count: 10, minScale: 1.0, maxScale: 1.6, radius: 70, innerRadius: 30, seed: 151 }),
      ctx.scatter('grass_medium_01', { count: 120, minScale: 0.8, maxScale: 1.3, radius: 70, innerRadius: 34, seed: 152, tint: 0xa9a860 }),
    ]);

    // Living Roman Legionaries, Senators & Silk Road Merchants walking across the cobblestone forum!
    await spawnLivingHuman(ctx, {
      x: -1.8, z: -2.5, height: 1.76, sex: 'male', style: 'roman',
      hat: 'helmet', action: 'walk', tool: 'shield_sword',
      path: [[-5.0, -3.5], [3.5, -2.0]], speed: 1.0,
      poi: 'Roman Legionary Centurion — patrolling 80,000 km of paved imperial highways',
    });
    await spawnLivingHuman(ctx, {
      x: 1.6, z: -0.5, rotY: -0.5, height: 1.74, sex: 'male', style: 'roman',
      action: 'debate', tool: 'scroll',
      poi: 'Roman Senator & Jurist — codifying Roman civil law & engineering projects',
    });
    await spawnLivingHuman(ctx, {
      x: -0.4, z: -5.2, height: 1.68, sex: 'female', style: 'roman',
      action: 'walk', tool: 'jug',
      path: [[4.5, -6.0], [-4.5, -5.0]], speed: 0.9,
      poi: 'Silk Road Trader — connecting Chang’an (Han China), Persia, India & Rome',
    });

    const marble = await ctx.material('marble_01', { repeat: 2, displacementScale: 0, color: 0xf0ebe0 });
    const plinth = (x, z, h = 1.3) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1, h, 1), marble);
      ensureUV1(p.geometry);
      p.position.set(x, ctx.terrain.heightAt(x, z) + h / 2, z);
      p.castShadow = p.receiveShadow = true;
      ctx.group.add(p);
      return p.position.y + h / 2;
    };
    await ctx.prop('marble_bust_01', { x: -3.2, z: 2, y: plinth(-3.2, 2), rotY: 0.3, poi: 'Imperial portrait bust' });
    await ctx.prop('lion_head', { x: 3.2, z: 1.5, y: plinth(3.2, 1.5, 1.0), rotY: -0.4, fit: 0.8, poi: 'Lion-head relief — arena beasts & Silk Road trade' });
    await ctx.prop('bull_head', { x: 0.5, z: 3.2, y: plinth(0.5, 3.2, 0.9), rotY: 0.1, fit: 0.8 });
    ctx.particles({ count: 200, box: [80, 8, 80], center: [0, 3, 0], color: 0xfff4e0, size: 0.05, speed: 0.1, direction: 1, sway: 1.2, opacity: 0.2, additive: true });
  },

  /* ---------------- 22. Medieval & Renaissance ---------------- */
  'medieval-renaissance': async (ctx) => {
    ctx.setEnv({ hdri: 'teutonic_castle_moat', envIntensity: 1.0, bgIntensity: 1.0, fogColor: 0xc9cfd2, fogDensity: 0.005, sunDir: [0.4, 0.55, 0.6], sunColor: 0xfff0dc, sunIntensity: 2.6, hemi: 0.5 });
    ctx.setCamera({ distance: 14, pitch: 0.11, targetY: 2.0, yaw: 0.25 });
    await ctx.ground('grass_ground', { repeat: 24, amplitude: 1.0, frequency: 0.04, displacementScale: 0.12, flatRadius: 12 });
    const blocks = await ctx.material('medieval_blocks_02', { repeat: 6, displacementScale: 0.06 });
    const slate = await ctx.material('rock_face', { repeat: 4, displacementScale: 0.0, color: 0x3a4048 });
    const castle = ARCH.createCastle(blocks, slate, { size: 40, wallH: 10, towerR: 4.5, towerH: 16, position: [0, 0, -52] });
    ctx.group.add(castle);
    ctx.poi('Stone castle — curtain walls, keep & gatehouse (1200 CE)', castle, 34);
    const moat = await ctx.water({ size: 200, y: -0.6, color: 0x1e3f3a, distortion: 1.4 });
    moat.position.z = -52;
    await Promise.all([
      ctx.scatter('grass_medium_01', { count: 240, minScale: 0.9, maxScale: 1.4, radius: 45, innerRadius: 3, seed: 161, wind: { amp: 0.06, speed: 1.5, height: 0.5 } }),
      ctx.scatter('tree_small_02', { count: 10, minScale: 0.9, maxScale: 1.4, radius: 60, innerRadius: 16, seed: 162 }),
      ctx.scatter('shrub_02', { count: 24, minScale: 0.8, maxScale: 1.4, radius: 50, innerRadius: 6, seed: 163 }),
    ]);

    // Living Medieval Knights, Scholars & Guild Artisans moving in the castle courtyard!
    await spawnLivingHuman(ctx, {
      x: -1.8, z: -2.2, height: 1.76, sex: 'male', style: 'medieval',
      hat: 'helmet', action: 'walk', tool: 'shield_sword',
      path: [[-4.2, -3.0], [2.4, -2.2]], speed: 0.95,
      poi: 'Medieval Knight — patrolling the castle bailey in steel helm & kite shield',
    });
    await spawnLivingHuman(ctx, {
      x: 1.8, z: 0.8, rotY: -0.7, height: 1.72, sex: 'male', style: 'medieval',
      action: 'debate', tool: 'scroll',
      poi: 'Renaissance & Golden Age Scholar — translating algebra, optics & printing Gutenberg movable type',
    });
    await spawnLivingHuman(ctx, {
      x: -2.4, z: 1.6, rotY: 0.8, height: 1.66, sex: 'female', style: 'medieval',
      action: 'knap', tool: 'hammer',
      poi: 'Medieval Guild Artisan — spinning textiles & forging ironwork',
    });

    // Armoury table with real scanned medieval arms
    await ctx.prop('wooden_crate_01', { x: 0, z: 0.5, rotY: 0.2 });
    const tableTop = ctx.terrain.heightAt(0, 0.5) + 0.62;
    await ctx.prop('kite_shield', { x: -0.9, z: 0.1, y: tableTop, rotY: 0.6, poi: 'Kite shield' });
    await ctx.prop('ornate_medieval_mace', { x: 0.2, z: 0.3, y: tableTop, rotY: 1.3 });
    await ctx.prop('antique_estoc', { x: 0.6, z: 0.7, y: tableTop, rotY: -0.8, poi: 'Estoc — armour-piercing sword' });
    await ctx.prop('ornate_war_hammer', { x: -0.2, z: 0.9, y: tableTop, rotY: 2.2 });
    await ctx.prop(PBR('chess_set.glb'), { x: 2.6, z: 1.2, y: ctx.terrain.heightAt(2.6, 1.2) + 0.8, fit: 0.75, rotY: 0.4, poi: 'Chess — reached Europe via Persia & al-Andalus (~1000 CE)' });
    await ctx.prop('wine_barrel_01', { x: 2.6, z: 1.2 });
    await ctx.prop('wooden_barrels_01', { x: -3.4, z: -1.2, rotY: 0.5 });
    await ctx.prop('gothic_statue', { x: 3.6, z: -2.6, rotY: -0.6, poi: 'Gothic sculpture — cathedral age' });
    await ctx.prop('spinning_wheel_01', { x: -3.2, z: 2.4, rotY: 0.9, poi: 'Spinning wheel — medieval textile tech' });
    await ctx.prop('Lantern_01', { x: 1.6, z: -1.6, poi: null });
    await ctx.prop('wooden_candlestick', { x: 1.1, z: 1.9, fit: 0.4 });
    ctx.particles({ count: 200, box: [60, 8, 60], center: [0, 3, 0], color: 0xffffff, size: 0.04, speed: 0.1, direction: 1, sway: 1.0, opacity: 0.2, additive: true });
  },

  /* ---------------- 23. First Industrial Revolution ---------------- */
  'first-industrial-rev': async (ctx) => {
    ctx.setEnv({ hdri: 'industrial_sunset', envIntensity: 0.9, bgIntensity: 1.0, fogColor: 0x9a8878, fogDensity: 0.009, sunDir: [-0.7, 0.3, -0.5], sunColor: 0xffb070, sunIntensity: 2.2, hemi: 0.35 });
    ctx.setCamera({ distance: 15, pitch: 0.1, targetY: 2.0, yaw: -0.5 });
    await ctx.ground('gravel_floor', { repeat: 28, amplitude: 0.4, frequency: 0.05, displacementScale: 0.08, flatRadius: 30 });
    const brick = await ctx.material('red_brick', { repeat: 8, displacementScale: 0.03 });
    const iron = await ctx.material('rusty_metal_02', { repeat: 2, displacementScale: 0 });
    const ironDark = await ctx.material('metal_plate', { repeat: 2, displacementScale: 0, color: 0x2a2c30 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.35, metalness: 1 });
    const wood = await ctx.material('rock_boulder_dry', { repeat: 2, displacementScale: 0, color: 0x5a3f28 });
    const mill = ARCH.createFactory(brick, iron, { position: [-6, 0, -34], rotationY: 0.1 });
    ctx.group.add(mill);
    ctx.poi('Textile mill — coal, iron & steam (1780s)', mill, 14);
    ctx.smoke({ count: 28, scale: 5, rise: 40, start: [-20, 30, -40], opacity: 0.28, color: 0x3a3634, speed: 0.22, spread: 3 });
    ctx.smoke({ count: 28, scale: 5, rise: 40, start: [6, 30, -40], opacity: 0.28, color: 0x3a3634, speed: 0.2, spread: 3 });
    const rail = ARCH.createRailway(ironDark, wood, { length: 160, position: [0, 0, 0], rotationY: 0.25 });
    ctx.group.add(rail);
    const loco = ARCH.createSteamLocomotive(ironDark, brass, ctx.anim, { position: [0, 0, 0], rotationY: 0.25 });
    ctx.group.add(loco);
    ctx.poi('Steam locomotive — Stephenson’s Rocket era (1829) chugging along iron rails', loco, 5);
    ctx.anim.push((t) => {
      const d = Math.sin(t * 0.45) * 3.5;
      loco.position.x = Math.sin(0.25) * d;
      loco.position.z = Math.cos(0.25) * d;
    });
    ctx.smoke({ count: 20, scale: 2.2, rise: 12, start: [1.1, 4.8, 4.5], opacity: 0.5, color: 0xdcdcdc, speed: 0.6, spread: 1.2 });

    // Living Industrial Engineers & Stokers shoveling coal and inspecting the steam railway!
    await spawnLivingHuman(ctx, {
      x: 4.2, z: 3.8, rotY: -0.8, height: 1.74, sex: 'male', style: 'industrial',
      hat: 'cap', action: 'harvest', tool: 'shovel',
      poi: 'Steam Railway Stoker — shoveling bituminous coal to boil high-pressure steam',
    });
    await spawnLivingHuman(ctx, {
      x: -3.2, z: 3.2, height: 1.75, sex: 'male', style: 'industrial',
      hat: 'cap', action: 'walk', tool: 'hammer',
      path: [[-4.8, 2.0], [-2.0, 5.5]], speed: 0.95,
      poi: 'Industrial Railway Engineer — inspecting rolled wrought-iron rails & steam pistons',
    });

    await ctx.prop('wooden_crate_01', { x: -6, z: 4, rotY: 0.3 });
    await ctx.prop('wooden_barrels_01', { x: -8, z: 5, rotY: 0.8 });
    await ctx.prop('sledgehammer_01', { x: -5.2, z: 5.6, rotY: 1.2 });
    await ctx.prop(PBR('pot_of_coals.glb'), { x: 5.5, z: 4.5, fit: 0.9, poi: 'Coal — the fossil fuel of the Industrial Revolution' });
    await ctx.prop('street_lamp_01', { x: 7, z: -2, poi: 'Gas street lamp (1807)' });
    ctx.particles({ count: 500, box: [80, 20, 80], center: [0, 8, 0], color: 0x4a4440, size: 0.08, speed: 0.15, direction: -1, sway: 0.8, opacity: 0.5 });
  },

  /* ---------------- 24. Second Industrial Revolution ---------------- */
  'second-industrial-rev': async (ctx) => {
    ctx.setEnv({ hdri: 'dresden_station_night', envIntensity: 0.9, bgIntensity: 1.0, fogColor: 0x1b1a22, fogDensity: 0.012, sunDir: [0.3, 0.6, 0.5], sunColor: 0xffe2b0, sunIntensity: 0.6, hemi: 0.3, exposure: 1.1 });
    ctx.setCamera({ distance: 11, pitch: 0.1, targetY: 1.6, yaw: 0.2 });
    await ctx.ground('patterned_cobblestone', { repeat: 36, amplitude: 0.3, frequency: 0.05, displacementScale: 0.06, flatRadius: 30 });
    const ironDark = await ctx.material('metal_plate', { repeat: 2, displacementScale: 0, color: 0x2a2c30 });
    const wood = await ctx.material('rock_boulder_dry', { repeat: 2, displacementScale: 0, color: 0x5a3f28 });
    ctx.group.add(ARCH.createRailway(ironDark, wood, { length: 160, position: [10, 0, 0], rotationY: 0.1 }));
    // electric street lamps (real scan) with warm point lights
    for (const [x, z] of [[-5, 2], [-5, -10], [6, -6], [6, 6]]) {
      const lamp = await ctx.prop('street_lamp_01', { x, z });
      const pl = new THREE.PointLight(0xffd9a0, 90, 26, 1.7);
      pl.position.set(x, 4.6, z);
      pl.castShadow = false;
      ctx.group.add(pl);
      if (x === -5 && z === 2 && lamp) ctx.poi('Electric arc lamp — cities lit at night (1880s)', lamp, 5.2);
    }
    await spawnLivingHuman(ctx, {
      x: -2.0, z: -2.5, height: 1.75, sex: 'male', style: 'industrial',
      hat: 'cap', action: 'walk', tool: 'scroll',
      path: [[-4.2, -4.5], [3.5, -1.8]], speed: 0.9,
      poi: 'Electrical Engineer (Edison / Tesla era) — AC/DC power grids & telegraph networks',
    });
    await spawnLivingHuman(ctx, {
      x: 1.8, z: 2.2, rotY: -0.6, height: 1.68, sex: 'female', style: 'industrial',
      action: 'debate',
      poi: 'Early 20th-Century Scientist — germ theory, X-rays & photography',
    });
    // Edison bulb exhibit: glass envelope (transmission) + glowing carbon filament
    const bulbBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.22, 24), new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.4, metalness: 1 }));
    const bulbGlass = new THREE.Mesh(new THREE.SphereGeometry(0.26, 48, 32), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0, transmission: 0.95, thickness: 0.05, ior: 1.5, transparent: true }));
    bulbGlass.position.y = 0.4;
    const filament = new THREE.Mesh(new THREE.TorusKnotGeometry(0.07, 0.006, 80, 8, 2, 3), new THREE.MeshStandardMaterial({ color: 0xffd080, emissive: 0xffb040, emissiveIntensity: 6 }));
    filament.position.y = 0.4;
    const bulb = new THREE.Group();
    bulb.add(bulbBase, bulbGlass, filament);
    const bulbLight = new THREE.PointLight(0xffc070, 30, 10, 1.8);
    bulbLight.position.y = 0.4;
    bulb.add(bulbLight);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.8), ironDark);
    stand.position.set(0, ctx.terrain.heightAt(0, 0) + 0.55, 0);
    stand.castShadow = stand.receiveShadow = true;
    ctx.group.add(stand);
    bulb.position.set(0, stand.position.y + 0.55, 0);
    bulb.scale.setScalar(2.2);
    ctx.group.add(bulb);
    ctx.poi('Edison carbon-filament bulb (1879)', bulb, 1.6);
    ctx.anim.push((t) => {
      filament.material.emissiveIntensity = 5.2 + 0.8 * Math.sin(t * 17) * Math.sin(t * 3.1);
    });
    await ctx.prop(PBR('antique_camera.glb'), { x: 2.4, z: 1.2, fit: 0.8, rotY: -0.5, poi: 'Photography — bellows camera' });
    await ctx.prop('vintage_microscope', { x: -2.4, z: 1.0, fit: 0.6, rotY: 0.5, poi: 'Brass microscope — germ theory & medicine' });
    await ctx.prop('wooden_crate_01', { x: 2.4, z: 1.2 });
    await ctx.prop('wooden_crate_01', { x: -2.4, z: 1.0 });
    // telegraph poles + wires
    const poleMat = wood;
    const wirePts = [];
    for (let i = 0; i < 6; i++) {
      const x = -40 + i * 16;
      const z = -14;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 8, 10), poleMat);
      pole.position.set(x, ctx.terrain.heightAt(x, z) + 4, z);
      pole.castShadow = true;
      ctx.group.add(pole);
      const cross = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), poleMat);
      cross.position.set(x, pole.position.y + 3.6, z);
      ctx.group.add(cross);
      if (i > 0) {
        const prev = -40 + (i - 1) * 16;
        for (let s = 0; s < 8; s++) {
          const u = s / 7;
          wirePts.push(new THREE.Vector3(prev + (x - prev) * u, pole.position.y + 3.6 - Math.sin(u * Math.PI) * 0.5, z));
        }
      }
    }
    const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wirePts), new THREE.LineBasicMaterial({ color: 0x111111 }));
    ctx.group.add(wire);
    ctx.particles({ count: 300, box: [60, 10, 60], center: [0, 4, 0], color: 0xffe8c0, size: 0.04, speed: 0.1, direction: 1, sway: 0.8, opacity: 0.25, additive: true });
  },

  /* ---------------- 25. Computers & the Moon landing ---------------- */
  'computers-moon': async (ctx) => {
    ctx.setEnv({ space: true, backgroundColor: 0x000000, hdri: 'moonless_golf', envIntensity: 0.45, bgIntensity: 0.0, fogDensity: 0.0, sunDir: [0.55, 0.55, 0.65], sunColor: 0xfffbf2, sunIntensity: 2.8, hemi: 0.35, exposure: 1.0 });
    ctx.setCamera({ distance: 13.5, pitch: 0.1, targetY: 1.9, yaw: 0.35 });
    await ctx.ground('gravel_floor', {
      repeat: 30,
      color: 0x8a8a86,
      displacementScale: 0.1,
      heightFn: (x, z) => {
        let h = (fbm2(x * 0.03, z * 0.03, { seed: 171 }) - 0.5) * 2.2;
        for (const [cx, cz, r, d] of [[-18, -22, 9, 2.2], [22, -30, 12, 2.8], [-30, 10, 7, 1.6], [10, 26, 6, 1.4]]) {
          const dist = Math.hypot(x - cx, z - cz);
          if (dist < r) h -= d * (1 - Math.pow(dist / r, 2));
          else if (dist < r * 1.25) h += d * 0.25 * (1 - (dist - r) / (r * 0.25));
        }
        return h * THREE.MathUtils.smoothstep(Math.hypot(x, z), 6, 16);
      },
    });
    FX.createStarfield(ctx.group, { count: 3500, radius: 190, size: 0.75 });
    addEarthInSky(ctx, { position: [28, 22, -135], radius: 10.5 });
    await Promise.all([
      ctx.scatter('moon_rock_01', { count: 40, minScale: 0.5, maxScale: 1.8, radius: 60, innerRadius: 5, seed: 172 }),
      ctx.scatter('moon_rock_03', { count: 70, minScale: 0.4, maxScale: 1.5, radius: 60, innerRadius: 3, seed: 173 }),
      ctx.scatter('moon_rock_05', { count: 60, minScale: 0.4, maxScale: 1.4, radius: 60, innerRadius: 3, seed: 174 }),
    ]);
    const lm = ARCH.createLunarModule({ position: [-4, ctx.terrain.heightAt(-4, -6), -6], rotationY: 0.4 });
    ctx.group.add(lm);
    ctx.poi('Apollo 11 Lunar Module "Eagle" — 20 July 1969', lm, 5.2);
    await ctx.prop(PBR('neil_armstrong_spacesuit_smithsonian.glb'), { x: 1.2, z: 0.5, fit: 1.9, rotY: -0.4, poi: 'Neil Armstrong’s A7-L suit — Smithsonian 3D scan' });
    await ctx.prop(PBR('astronaut.glb'), { x: 4.0, z: -1.5, fit: 1.85, rotY: -0.6, poi: 'Buzz Aldrin on the lunar surface' });
    await ctx.prop('vintage_spacecraft_instrument', { x: -1.5, z: 2.6, fit: 0.75, rotY: 0.3, poi: 'Apollo Guidance Computer era — 4 KB of RAM flew to the Moon' });
    addFootprintTrail(ctx, { from: [2, 0, 3], to: [1.2, 0, 0.8], steps: 6, size: 0.3, color: 0x55554f });
    ctx.onWhatIf((on) => {
      lm.visible = !on;
    });
  },

  /* ---------------- 26. PCs, the Web & the iPhone ---------------- */
  'pc-internet-iphone': async (ctx) => {
    ctx.setEnv({ hdri: 'modern_buildings_night', envIntensity: 0.8, bgIntensity: 1.0, fogColor: 0x0d1220, fogDensity: 0.006, sunDir: [0.3, 0.6, 0.4], sunColor: 0xcfe0ff, sunIntensity: 0.5, hemi: 0.25, exposure: 1.1 });
    ctx.setCamera({ distance: 9, pitch: 0.12, targetY: 1.4, yaw: 0.0 });
    await ctx.ground('worn_asphalt', { repeat: 30, amplitude: 0.0, frequency: 0.05, displacementScale: 0.02, flatRadius: 40 });
    ctx.group.add(ARCH.createCityTowers(ctx.anim, { count: 28, ring: [36, 85], seed: 7 }));
    const deskMat = await ctx.material('rock_boulder_dry', { repeat: 2, displacementScale: 0, color: 0x3b2a1e });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 1.8), deskMat);
    desk.position.set(0, 0.95, 0);
    desk.castShadow = desk.receiveShadow = true;
    ctx.group.add(desk);
    [[-2.2, -0.6], [2.2, -0.6], [-2.2, 0.6], [2.2, 0.6]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 0.1), deskMat);
      leg.position.set(x, 0.475, z);
      ctx.group.add(leg);
    });
    await ctx.prop('classic_laptop', { x: -1.4, z: 0, y: 1.0, fit: 0.7, rotY: 0.25, poi: 'Personal computer — the Web arrives (1991)' });
    await ctx.prop('television_02', { x: 1.6, z: -0.3, y: 1.0, rotY: -0.3, fit: 0.9, poi: 'CRT monitor' });
    const phone = ARCH.createSmartphone({ position: [0.3, 1.0 + 0.46, 0.4], scale: 8, rotationY: 0.2 });
    phone.rotation.x = -0.1;
    ctx.group.add(phone);
    ctx.poi('iPhone (2007) — shown at 8× size', phone, 0.6);
    ctx.anim.push((t) => {
      phone.rotation.y = 0.2 + Math.sin(t * 0.5) * 0.5;
    });
    // networked Earth: real NASA night lights + great-circle data arcs
    const earth = new THREE.Mesh(new THREE.SphereGeometry(0.9, 64, 48), new THREE.MeshStandardMaterial({ map: ctx.textures.earthDay || null, emissiveMap: ctx.textures.earthNight || null, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.7 }));
    earth.position.set(3.4, 2.2, 1.6);
    ctx.group.add(earth);
    const arcGroup = new THREE.Group();
    const rng = makeRNG(3);
    for (let i = 0; i < 26; i++) {
      const a = new THREE.Vector3().setFromSphericalCoords(0.92, Math.PI * (0.2 + rng() * 0.5), rng() * Math.PI * 2);
      const b = new THREE.Vector3().setFromSphericalCoords(0.92, Math.PI * (0.2 + rng() * 0.5), rng() * Math.PI * 2);
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(0.92 + a.distanceTo(b) * 0.45);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)), new THREE.LineBasicMaterial({ color: 0x5ad7ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
      arcGroup.add(line);
    }
    earth.add(arcGroup);
    ctx.poi('The Internet — billions connected', earth, 1.2);
    ctx.anim.push((t) => {
      earth.rotation.y = t * 0.12;
    });
    await ctx.prop('street_lamp_01', { x: -5, z: -4 });
    const pl = new THREE.PointLight(0xffe0b0, 60, 20, 1.7);
    pl.position.set(-5, 4.6, -4);
    ctx.group.add(pl);
    ctx.particles({ count: 200, box: [40, 8, 40], center: [0, 3, 0], color: 0xbfe0ff, size: 0.04, speed: 0.1, direction: 1, sway: 0.6, opacity: 0.25, additive: true });
  },

  /* ---------------- 27. AI, robotics & today (2026) ---------------- */
  'ai-today-2026': async (ctx) => {
    ctx.setEnv({ hdri: 'rooftop_night', envIntensity: 0.95, bgIntensity: 1.0, fogColor: 0x0a0f1c, fogDensity: 0.007, sunDir: [0.3, 0.6, 0.5], sunColor: 0xcfe0ff, sunIntensity: 1.2, hemi: 0.45, exposure: 1.05 });
    ctx.setCamera({ distance: 8.5, pitch: 0.09, targetY: 1.35, yaw: 0.12 });
    await ctx.ground('metal_plate', { repeat: 20, amplitude: 0, frequency: 0.05, displacementScale: 0.02, flatRadius: 40, color: 0x8a9098 });
    ctx.group.add(ARCH.createCityTowers(ctx.anim, { count: 26, ring: [45, 95], seed: 11, minH: 20, maxH: 70 }));
    const xbot = await ctx.prop(PBR('xbot_robot.glb'), { x: 1.5, z: 0.3, fit: 1.85, rotY: -0.45, clip: 'walk', timeScale: 0.9, poi: 'Humanoid robot — rigged & animated (2026)' });
    if (xbot) ctx.anim.push((t) => {
      xbot.rotation.y = -0.45 + Math.sin(t * 0.3) * 0.25;
    });
    await ctx.prop(PBR('robot_expressive.glb'), { x: -1.8, z: -0.4, fit: 1.45, rotY: 0.5, clip: 'Wave', timeScale: 0.9, poi: 'Autonomous embodied AI agent' });
    const dna = await ctx.prop(PBR('dna_helix.glb'), { x: -3.2, z: 0.8, y: 0.3, fit: 1.9, rotY: 0.3, poi: 'CRISPR gene editing & AlphaFold protein design' });
    if (dna) ctx.anim.push((t) => {
      dna.rotation.y = t * 0.45;
    });
    FX.createNeuralHologram(ctx.group, ctx.anim, { position: [0, 2.2, -2.8], layers: [6, 12, 12, 6] });
    ctx.poi('Transformer neural network — trillions of parameters', new THREE.Vector3(0, 3.8, -2.8));
    await ctx.prop('classic_laptop', { x: -0.4, z: 1.5, y: 0.0, fit: 0.65, rotY: 0.4 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.03, 8, 128), new THREE.MeshBasicMaterial({ color: 0x5ad7ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.04;
    ctx.group.add(ring);
    const keyLight = new THREE.SpotLight(0xfff6ea, 26, 20, 0.7, 0.5, 1.4);
    keyLight.position.set(3, 6, 5);
    keyLight.castShadow = true;
    ctx.group.add(keyLight, keyLight.target);
    ctx.particles({ count: 300, box: [30, 8, 30], center: [0, 3, 0], color: 0x9fd8ff, size: 0.035, speed: 0.15, direction: 1, sway: 0.4, opacity: 0.35, additive: true });
  },

  /* ---------------- 28. Solarpunk 2050 ---------------- */
  'solarpunk-2050': async (ctx) => {
    ctx.setEnv({ hdri: 'wildflower_field', envIntensity: 1.0, bgIntensity: 1.0, fogColor: 0xd6e2e8, fogDensity: 0.0035, sunDir: [0.5, 0.7, 0.3], sunColor: 0xfff6e8, sunIntensity: 3.2, hemi: 0.5 });
    ctx.setCamera({ distance: 15, pitch: 0.12, targetY: 2.0, yaw: -0.2 });
    await ctx.ground('grass_ground', { repeat: 26, amplitude: 1.0, frequency: 0.035, displacementScale: 0.12, flatRadius: 14 });
    await Promise.all([
      ctx.scatter('grass_medium_01', { count: 320, minScale: 0.9, maxScale: 1.4, radius: 60, innerRadius: 2, seed: 181, wind: { amp: 0.06, speed: 1.5, height: 0.5 } }),
      ctx.scatter('shrub_02', { count: 40, minScale: 0.9, maxScale: 1.5, radius: 55, innerRadius: 5, seed: 182 }),
      ctx.scatter('jacaranda_tree', { count: 7, minScale: 0.9, maxScale: 1.3, radius: 60, innerRadius: 16, seed: 183, wind: { amp: 0.07, speed: 0.6, height: 10 } }),
      ctx.scatter('tree_small_02', { count: 8, minScale: 0.9, maxScale: 1.3, radius: 60, innerRadius: 16, seed: 184 }),
    ]);
    const dome = ARCH.createBiodome({ position: [0, ctx.terrain.heightAt(0, -12), -12], radius: 9 });
    ctx.group.add(dome);
    ctx.poi('Fusion-powered biodome habitat', dome, 10);
    const inner = await ctx.prop('island_tree_02', { x: 0, z: -12, scale: 0.55 });
    void inner;
    await ctx.prop(PBR('plant_leaves.glb'), { x: 3, z: -8, fit: 1.6 });
    [[-34, -30], [-48, 10], [40, -42], [52, 4], [-20, -70]].forEach(([x, z]) => ctx.group.add(ARCH.createWindTurbine(ctx.anim, { position: [x, ctx.terrain.heightAt(x, z), z] })));
    ctx.group.add(ARCH.createSolarArray({ position: [18, ctx.terrain.heightAt(18, 6), 6], rows: 4, cols: 8, rotationY: 0.3 }));
    await ctx.prop(PBR('robot_expressive.glb'), { x: -2.5, z: 1.5, fit: 1.4, rotY: 0.6, clip: 'Walking', poi: 'Garden-tending ecological robot' });
    const pond = await ctx.water({ size: 18, y: -0.25, color: 0x2a6f6a, distortion: 0.8 });
    pond.position.set(10, -0.25, 10);
    ctx.particles({ count: 260, box: [60, 8, 60], center: [0, 3, 0], color: 0xfff6d0, size: 0.05, speed: 0.15, direction: 1, sway: 1.2, opacity: 0.3, additive: true });
  },

  /* ---------------- 29. Mars 2150 ---------------- */
  'mars-2150': async (ctx) => {
    ctx.setEnv({ hdri: 'dry_cracked_lake', envIntensity: 0.55, bgIntensity: 0.0, backgroundColor: 0xc98a5a, fogColor: 0xc48a5e, fogDensity: 0.006, sunDir: [-0.5, 0.55, -0.6], sunColor: 0xffe0c8, sunIntensity: 2.6, hemi: 0.35, exposure: 1.0, space: false });
    ctx.setCamera({ distance: 14, pitch: 0.12, targetY: 1.8, yaw: 0.2 });
    await ctx.ground('red_sand', { repeat: 26, amplitude: 2.2, frequency: 0.03, displacementScale: 0.14, flatRadius: 14, size: 300, segments: 220 });
    // Martian sky gradient dome (butterscotch horizon → dusty tan zenith)
    const skyMat = new THREE.ShaderMaterial({
      uniforms: { top: { value: new THREE.Color(0x9c6a48) }, bottom: { value: new THREE.Color(0xe0a983) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top, bottom; varying vec3 vP; void main(){ float h = normalize(vP).y; gl_FragColor = vec4(mix(bottom, top, smoothstep(-0.05, 0.6, h)), 1.0); }',
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(380, 32, 16), skyMat);
    sky.renderOrder = -10;
    ctx.group.add(sky);
    await Promise.all([
      ctx.scatter('moon_rock_01', { count: 50, minScale: 0.5, maxScale: 2.0, radius: 70, innerRadius: 5, seed: 191, tint: 0xa8603a }),
      ctx.scatter('moon_rock_03', { count: 80, minScale: 0.4, maxScale: 1.5, radius: 70, innerRadius: 3, seed: 192, tint: 0x9a5a36 }),
      ctx.scatter('namaqualand_boulder_02', { count: 10, minScale: 1.0, maxScale: 2.5, radius: 70, innerRadius: 14, seed: 193, tint: 0x9a5c3c }),
    ]);
    const d1 = ARCH.createBiodome({ position: [-10, ctx.terrain.heightAt(-10, -14), -14], radius: 10, tint: 0xd8ecff });
    const d2 = ARCH.createBiodome({ position: [8, ctx.terrain.heightAt(8, -22), -22], radius: 7, tint: 0xd8ecff });
    ctx.group.add(d1, d2);
    ctx.poi('Terraforming biodome — Earth plants under Martian sky', d1, 11);
    await ctx.prop('island_tree_01', { x: -10, z: -14, scale: 0.5 });
    await ctx.prop('fern_02', { x: -7, z: -11, scale: 1.4 });
    await ctx.prop(PBR('astronaut.glb'), { x: 1.5, z: 0.5, fit: 1.85, rotY: -0.5, poi: 'Mars colonist (2150)' });
    // lander with a real ion-drive model glowing beneath
    const lander = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 3.2, 12), new THREE.MeshStandardMaterial({ color: 0xd8dce0, roughness: 0.35, metalness: 0.9 }));
    hull.position.y = 4.2;
    hull.castShadow = true;
    lander.add(hull);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4.6, 10), hull.material);
      leg.position.set(Math.cos(a) * 3.2, 1.8, Math.sin(a) * 3.2);
      leg.lookAt(Math.cos(a) * 1.8, 4.0, Math.sin(a) * 1.8);
      leg.rotateX(Math.PI / 2);
      lander.add(leg);
    }
    lander.position.set(12, ctx.terrain.heightAt(12, 2), 2);
    ctx.group.add(lander);
    const drive = await ctx.prop(PBR('primary_ion_drive.glb'), { x: 12, z: 2, y: lander.position.y + 1.6, fit: 2.6, rotY: 0, playAll: true, poi: 'Ion drive — 10× the efficiency of chemical rockets' });
    if (drive) drive.rotation.x = Math.PI / 2;
    ctx.particles({ count: 600, box: [90, 14, 90], center: [0, 6, 0], color: 0xd9a070, size: 0.1, speed: 0.4, direction: 1, sway: 2.2, opacity: 0.35 });
    // Phobos
    const phobos = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 2), new THREE.MeshStandardMaterial({ map: ctx.textures.moon || null, roughness: 1, color: 0x8a7a70 }));
    phobos.position.set(60, 70, -150);
    ctx.group.add(phobos);
    ctx.anim.push((t) => {
      phobos.rotation.y = t * 0.1;
    });
  },

  /* ---------------- 30. Year 3000 ---------------- */
  'year-3000': async (ctx) => {
    ctx.setEnv({ space: true, backgroundColor: 0x000106, hdri: 'moon_lab', envIntensity: 0.65, bgIntensity: 0.0, fogDensity: 0.0, sunDir: [0.4, 0.5, 0.7], sunColor: 0xffeedd, sunIntensity: 2.2, hemi: 0.45, exposure: 1.05 });
    ctx.setCamera({ distance: 26, pitch: 0.12, targetY: 0, minDistance: 8, maxDistance: 80 });
    FX.createStarfield(ctx.group, { count: 4000, radius: 220, size: 0.8 });
    FX.createNebula(ctx.group, ctx.anim, { radius: 120, colorA: 0x3a5fff, colorB: 0x0a0a2a, colorC: 0xff7fa0, density: 0.25, speed: 0.01, steps: 24, seed: 9 });
    const sunPos = [6, 3, -55];
    const sun = FX.createGlowSphere(ctx.group, ctx.anim, { radius: 11, color: 0xffb040, hot: 0xffffff, intensity: 3.4, turbulence: 2.0, position: sunPos });
    const sunLight = new THREE.PointLight(0xffe0b0, 4500, 400, 1.4);
    sunLight.position.set(...sunPos);
    ctx.group.add(sunLight);
    const swarm = ARCH.createDysonSwarm(ctx.anim, { count: 1600, inner: 18, outer: 36 });
    swarm.position.set(...sunPos);
    ctx.group.add(swarm);
    ctx.poi('Dyson swarm — Kardashev Type II civilisation harvesting starlight', sun, 13);
    const oneill = ARCH.createONeillCylinder(ctx.anim, { position: [-13, -2.5, -14], length: 22, radius: 3.2 });
    oneill.rotation.y = 0.72;
    oneill.rotation.z = 0.12;
    ctx.group.add(oneill);
    ctx.poi('O’Neill cylinder — 32 km rotating star-habitat', oneill, 4.5);
    const ark = await ctx.prop(PBR('primary_ion_drive.glb'), { x: 7.5, z: -4, y: -2.2, fit: 6.8, rotY: 0.55, playAll: true, poi: 'Interstellar ark ship — fusion/ion propulsion' });
    if (ark) ctx.anim.push((t) => {
      ark.position.y = -2.2 + Math.sin(t * 0.4) * 0.4;
      ark.rotation.z = Math.sin(t * 0.3) * 0.08;
    });
    addEarthInSky(ctx, { position: [-38, 12, -85], radius: 5.5, nightSide: true });
    ctx.onWhatIf((on) => {
      swarm.visible = !on;
    });
  },
};

/** Build a world for a milestone. Always resolves (fallback world if a builder throws). */
export async function buildWorld(milestone, assets, textures) {
  const ctx = new WorldContext(milestone, assets, textures);
  const builder = WORLD_BUILDERS[milestone.id];
  try {
    if (builder) await builder(ctx);
    else await fallbackWorld(ctx);
  } catch (err) {
    console.error('[EraWorlds] builder failed for', milestone.id, err);
    try {
      await fallbackWorld(ctx);
    } catch (e2) {
      console.error(e2);
    }
  }
  return ctx;
}

async function fallbackWorld(ctx) {
  ctx.setEnv({ hdri: 'kloofendal_overcast', envIntensity: 1.0, bgIntensity: 1.0, fogColor: 0xc8ccd0, fogDensity: 0.006 });
  await ctx.ground('grass_ground', { repeat: 20 });
  await ctx.scatter('grass_medium_01', { count: 200, radius: 40 });
  await ctx.scatter('boulder_01', { count: 8, radius: 40, innerRadius: 6 });
}
