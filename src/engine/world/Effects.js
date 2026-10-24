import * as THREE from '../../../vendor/three/build/three.module.js';

/**
 * Effects — physically-plausible procedural phenomena that are NOT solid objects
 * (fire, smoke, weather, light shafts, caustics, aurora, nebulae, lava, impacts).
 * Solid things come from real scans; these are the glowing / moving media around them.
 */

/* ------------------------------------------------------------------ shared GLSL */
const GLSL_NOISE = /* glsl */ `
float hash31(vec3 p){ p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 p){
  vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x), mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x), mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = 0.5; float s = 0.0; for(int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
`;

function softSpriteTexture(size = 64, inner = 'rgba(255,255,255,1)', mid = 'rgba(255,255,255,0.35)') {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.4, mid);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
let _softTex = null;
export function getSoftTexture() {
  if (!_softTex) _softTex = softSpriteTexture();
  return _softTex;
}

/* ------------------------------------------------------------------ FIRE */
export function createFire(group, animCallbacks, { position = [0, 0, 0], scale = 1, intensity = 1.6, lightColor = 0xff9a3c, lightIntensity = 60, lightDistance = 22, embers = true, smoke = true } = {}) {
  const fireGroup = new THREE.Group();
  fireGroup.position.set(position[0], position[1], position[2]);
  group.add(fireGroup);

  // Charred wood logs & glowing ember bed at the base of the fire
  const logMat = new THREE.MeshStandardMaterial({ color: 0x241710, roughness: 0.95, emissive: 0xff3800, emissiveIntensity: 0.35 });
  for (let i = 0; i < 4; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.065 * scale, 0.08 * scale, 0.85 * scale, 10), logMat);
    const ang = (i / 4) * Math.PI + 0.25;
    log.position.set(Math.cos(ang) * 0.12 * scale, 0.07 * scale, Math.sin(ang) * 0.12 * scale);
    log.rotation.set(Math.PI / 2 - 0.18, ang, 0);
    fireGroup.add(log);
  }

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uColorA: { value: new THREE.Color(1.0, 0.78, 0.28) },
      uColorB: { value: new THREE.Color(0.96, 0.32, 0.04) },
      uColorC: { value: new THREE.Color(0.42, 0.04, 0.0) },
    },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      ${GLSL_NOISE}
      uniform float uTime; uniform float uIntensity; uniform vec3 uColorA, uColorB, uColorC; varying vec2 vUv;
      void main(){
        vec2 uv = vUv;
        float n  = fbm(vec3(uv.x * 3.2, uv.y * 4.2 - uTime * 2.4, uTime * 0.4));
        float n2 = fbm(vec3(uv.x * 6.8 + 3.1, uv.y * 8.5 - uTime * 3.8, uTime * 0.75));
        float sway = (n - 0.5) * 0.75 * pow(uv.y, 0.7);
        float x = (uv.x - 0.5) * 2.0 + sway;
        float width = (1.0 - pow(uv.y, 0.85)) * (0.65 + 0.45 * n);
        float shape = 1.0 - smoothstep(0.05, max(0.12, width), abs(x));
        float tongues = smoothstep(0.18, 0.72, shape * (n * 0.75 + n2 * 0.55) * (1.25 - uv.y * 0.65));
        vec3 col = mix(uColorC, uColorB, smoothstep(0.0, 0.55, tongues));
        col = mix(col, uColorA, smoothstep(0.55, 0.95, tongues) * (1.0 - uv.y * 0.6));
        float alpha = tongues * (1.0 - smoothstep(0.65, 0.98, uv.y)) * smoothstep(0.0, 0.12, uv.y);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(col * uIntensity * 0.42, alpha * 0.75);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const geo = new THREE.PlaneGeometry(1.05 * scale, 1.45 * scale, 1, 1);
  geo.translate(0, 0.72 * scale, 0);
  const quads = [];
  for (let i = 0; i < 3; i++) {
    const q = new THREE.Mesh(geo, mat);
    q.rotation.y = (i * Math.PI) / 3;
    q.renderOrder = 20;
    fireGroup.add(q);
    quads.push(q);
  }

  const light = new THREE.PointLight(lightColor, Math.min(lightIntensity, 28) * scale, lightDistance * scale, 1.8);
  light.position.set(0, 0.85 * scale, 0);
  light.castShadow = false;
  fireGroup.add(light);

  let emberPts = null;
  if (embers) {
    emberPts = createParticles(fireGroup, animCallbacks, {
      count: 90,
      box: [1.2 * scale, 4.5 * scale, 1.2 * scale],
      center: [0, 2.2 * scale, 0],
      color: 0xffa040,
      size: 0.06 * scale,
      speed: 0.9,
      direction: 1,
      sway: 0.35,
      opacity: 1,
      additive: true,
      fade: true,
    });
  }
  if (smoke) {
    createSmoke(fireGroup, animCallbacks, { count: 14, scale: 1.4 * scale, rise: 2.6 * scale, start: [0, 1.6 * scale, 0], opacity: 0.22 });
  }

  const baseLightInt = Math.min(lightIntensity, 28);
  animCallbacks.push((t, dt, whatIf, camera) => {
    mat.uniforms.uTime.value = t;
    const f = 0.82 + 0.18 * Math.sin(t * 11.3) * Math.sin(t * 7.1) + 0.08 * Math.sin(t * 23.0);
    light.intensity = baseLightInt * scale * f;
    light.position.x = Math.sin(t * 9.0) * 0.05 * scale;
    light.position.z = Math.cos(t * 7.3) * 0.05 * scale;
    if (camera) {
      // billboard the flame fan toward the camera around Y
      const dx = camera.position.x - fireGroup.getWorldPosition(_tmpV).x;
      const dz = camera.position.z - _tmpV.z;
      fireGroup.rotation.y = Math.atan2(dx, dz);
    }
  });
  return { group: fireGroup, light, material: mat, embers: emberPts };
}
const _tmpV = new THREE.Vector3();

/* ------------------------------------------------------------------ SMOKE (sprites) */
export function createSmoke(group, animCallbacks, { count = 16, scale = 1.5, rise = 3, start = [0, 1, 0], opacity = 0.25, color = 0x8a8a8a, speed = 0.45, spread = 0.6 } = {}) {
  const tex = getSoftTexture();
  const sprites = [];
  for (let i = 0; i < count; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: 0, depthWrite: false });
    const s = new THREE.Sprite(m);
    s.userData.phase = i / count;
    s.userData.seed = Math.random();
    s.renderOrder = 19;
    group.add(s);
    sprites.push(s);
  }
  animCallbacks.push((t) => {
    for (const s of sprites) {
      const life = (t * speed * 0.35 + s.userData.phase) % 1; // 0..1
      const r = rise * life;
      s.position.set(start[0] + Math.sin(t * 0.7 + s.userData.seed * 9) * spread * life, start[1] + r, start[2] + Math.cos(t * 0.6 + s.userData.seed * 7) * spread * life);
      const size = scale * (0.4 + life * 1.6);
      s.scale.set(size, size, 1);
      s.material.opacity = opacity * Math.sin(life * Math.PI) * (1 - life * 0.4);
      s.material.rotation = s.userData.seed * 6.28 + t * 0.2;
    }
  });
  return sprites;
}

/* ------------------------------------------------------------------ GPU PARTICLES (snow, rain, embers, bubbles, dust, ash) */
export function createParticles(group, animCallbacks, { count = 600, box = [60, 25, 60], center = [0, 12, 0], color = 0xffffff, size = 0.12, speed = 1, direction = -1, sway = 0.6, opacity = 0.9, additive = false, fade = false, stretch = 1, texture = null } = {}) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * box[0];
    pos[i * 3 + 1] = Math.random() * box[1];
    pos[i * 3 + 2] = (Math.random() - 0.5) * box[2];
    seeds[i * 3] = Math.random();
    seeds[i * 3 + 1] = Math.random();
    seeds[i * 3 + 2] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seeds, 3));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size },
      uHeight: { value: box[1] },
      uSpeed: { value: speed },
      uDir: { value: direction },
      uSway: { value: sway },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uFade: { value: fade ? 1 : 0 },
      uStretch: { value: stretch },
      uMap: { value: texture || getSoftTexture() },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 seed; uniform float uTime, uSize, uHeight, uSpeed, uDir, uSway, uPixelRatio; varying float vLife;
      void main(){
        float sp = uSpeed * (0.6 + seed.x * 0.8);
        float y = mod(position.y + uDir * uTime * sp * 2.0 + seed.y * uHeight, uHeight);
        vLife = y / uHeight;
        vec3 p = position; p.y = y;
        p.x += sin(uTime * (0.6 + seed.z) + seed.y * 6.28) * uSway;
        p.z += cos(uTime * (0.5 + seed.x) + seed.z * 6.28) * uSway;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * (0.7 + seed.z * 0.6) * uPixelRatio * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity, uFade, uStretch; uniform sampler2D uMap; varying float vLife;
      void main(){
        vec2 uv = gl_PointCoord; uv.y = (uv.y - 0.5) / uStretch + 0.5;
        if (uv.y < 0.0 || uv.y > 1.0) discard;
        vec4 tex = texture2D(uMap, uv);
        float a = tex.a * uOpacity;
        if (uFade > 0.5) a *= sin(vLife * 3.14159);
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor * tex.rgb, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.position.set(center[0], center[1] - box[1] / 2, center[2]);
  pts.frustumCulled = false;
  pts.renderOrder = 18;
  group.add(pts);
  animCallbacks.push((t) => {
    mat.uniforms.uTime.value = t;
  });
  return pts;
}

/* ------------------------------------------------------------------ GOD RAYS / LIGHT SHAFTS */
export function createLightShafts(group, animCallbacks, { count = 6, origin = [8, 26, -6], target = [0, 0, 0], length = 34, radius = 1.4, color = 0xfff2c8, opacity = 0.16, spread = 7 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
    vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uOpacity; uniform vec3 uColor; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        float rim = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
        float along = pow(1.0 - vUv.y, 1.4) * smoothstep(0.0, 0.08, vUv.y);
        float flicker = 0.85 + 0.15 * sin(uTime * 0.7 + vUv.x * 12.0);
        float a = rim * along * uOpacity * flicker;
        gl_FragColor = vec4(uColor, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const o = new THREE.Vector3(...origin);
  const tg = new THREE.Vector3(...target);
  const dir = new THREE.Vector3().subVectors(tg, o).normalize();
  const shafts = [];
  for (let i = 0; i < count; i++) {
    const geo = new THREE.CylinderGeometry(radius * (0.6 + Math.random() * 0.8), radius * 2.2, length, 10, 1, true);
    geo.translate(0, -length / 2, 0);
    const m = new THREE.Mesh(geo, mat);
    const jitter = new THREE.Vector3((Math.random() - 0.5) * spread, 0, (Math.random() - 0.5) * spread);
    m.position.copy(o).add(jitter);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    m.quaternion.copy(q);
    m.renderOrder = 15;
    group.add(m);
    shafts.push(m);
  }
  animCallbacks.push((t) => {
    mat.uniforms.uTime.value = t;
  });
  return shafts;
}

/* ------------------------------------------------------------------ UNDERWATER CAUSTICS */
export function createCaustics(group, animCallbacks, { size = 120, y = 0.08, color = 0x9fdcff, intensity = 0.55, scale = 0.08 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity }, uScale: { value: scale } },
    vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vW = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uIntensity, uScale; uniform vec3 uColor; varying vec2 vUv; varying vec3 vW;
      float caustic(vec2 p, float t){
        float c = 0.0;
        for (int i = 0; i < 3; i++){
          float fi = float(i);
          vec2 q = p * (1.0 + fi * 0.37) + vec2(sin(t * 0.31 + fi), cos(t * 0.27 + fi * 1.3));
          c += abs(sin(q.x * 3.1 + sin(q.y * 2.7 + t * 0.8)) * sin(q.y * 3.3 + cos(q.x * 2.1 - t * 0.6)));
        }
        return pow(c / 3.0, 3.0);
      }
      void main(){
        float c = caustic(vW.xz * uScale, uTime);
        float edge = 1.0 - smoothstep(0.35, 0.5, length(vUv - 0.5));
        gl_FragColor = vec4(uColor * c * uIntensity * edge, c * edge);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  m.renderOrder = 12;
  group.add(m);
  animCallbacks.push((t) => {
    mat.uniforms.uTime.value = t;
  });
  return m;
}

/* ------------------------------------------------------------------ AURORA */
export function createAurora(group, animCallbacks, { radius = 70, height = 26, baseY = 24, arc = Math.PI * 1.1, intensity = 1.1 } = {}) {
  const geo = new THREE.CylinderGeometry(radius, radius, height, 64, 1, true, -arc / 2, arc);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntensity: { value: intensity } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      ${GLSL_NOISE}
      uniform float uTime, uIntensity; varying vec2 vUv;
      void main(){
        float t = uTime * 0.06;
        float curtain = fbm(vec3(vUv.x * 6.0 + t, vUv.y * 1.5, t * 0.5));
        float rays = pow(fbm(vec3(vUv.x * 40.0 + t * 3.0, 0.5, t)), 2.2);
        float v = smoothstep(0.0, 0.15, vUv.y) * pow(1.0 - vUv.y, 1.6);
        float a = (curtain * 0.7 + rays * 0.9) * v * uIntensity;
        vec3 green = vec3(0.15, 0.95, 0.45); vec3 teal = vec3(0.1, 0.55, 0.9); vec3 purple = vec3(0.6, 0.2, 0.9);
        vec3 col = mix(green, teal, vUv.y); col = mix(col, purple, smoothstep(0.55, 1.0, vUv.y) * 0.8);
        gl_FragColor = vec4(col * a * 1.8, a * 0.85);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.y = baseY + height / 2;
  m.rotation.y = Math.PI;
  m.renderOrder = 11;
  group.add(m);
  animCallbacks.push((t) => {
    mat.uniforms.uTime.value = t;
  });
  return m;
}

/* ------------------------------------------------------------------ VOLUMETRIC NEBULA (ray-marched) */
export function createNebula(group, animCallbacks, { radius = 60, colorA = 0xff7a2a, colorB = 0x5b2bd6, colorC = 0x1e90ff, density = 1.0, speed = 0.03, steps = 36, seed = 0 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uRadius: { value: radius },
      uCamPos: { value: new THREE.Vector3() },
      uA: { value: new THREE.Color(colorA) },
      uB: { value: new THREE.Color(colorB) },
      uC: { value: new THREE.Color(colorC) },
      uDensity: { value: density },
      uSpeed: { value: speed },
      uSeed: { value: seed },
    },
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      ${GLSL_NOISE}
      uniform float uTime, uRadius, uDensity, uSpeed, uSeed; uniform vec3 uCamPos, uA, uB, uC; varying vec3 vW;
      void main(){
        vec3 ro = uCamPos; vec3 rd = normalize(vW - uCamPos);
        // ray / sphere (centered at origin)
        float b = dot(ro, rd); float c = dot(ro, ro) - uRadius * uRadius; float h = b * b - c;
        if (h < 0.0) discard;
        h = sqrt(h); float t0 = max(-b - h, 0.0); float t1 = -b + h;
        float stepLen = (t1 - t0) / float(${steps});
        vec3 acc = vec3(0.0); float trans = 1.0; float t = t0 + stepLen * hash31(vW) * 0.9;
        for (int i = 0; i < ${steps}; i++) {
          vec3 p = ro + rd * t;
          float rr = length(p) / uRadius;
          float shell = smoothstep(1.0, 0.55, rr);
          vec3 q = p * (1.6 / uRadius) + vec3(uSeed) + uTime * uSpeed;
          float n = fbm(q * 2.2) ;
          float d = smoothstep(0.42, 0.75, n) * shell * uDensity * 0.085;
          float core = smoothstep(0.7, 0.0, rr);
          vec3 col = mix(uB, uA, core) ; col = mix(col, uC, smoothstep(0.55, 0.9, n) * 0.6);
          acc += col * d * trans * (1.4 + 3.0 * core);
          trans *= 1.0 - d;
          if (trans < 0.02) break;
          t += stepLen;
        }
        gl_FragColor = vec4(acc, 1.0 - trans);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), mat);
  m.renderOrder = 5;
  m.frustumCulled = false;
  group.add(m);
  animCallbacks.push((t, dt, whatIf, camera) => {
    mat.uniforms.uTime.value = t;
    if (camera) {
      // camera position in the nebula's local space
      m.updateMatrixWorld();
      mat.uniforms.uCamPos.value.copy(camera.position);
      m.worldToLocal(mat.uniforms.uCamPos.value);
    }
  });
  return m;
}

/* ------------------------------------------------------------------ STARFIELD (points) */
export function createStarfield(group, { count = 3000, radius = 180, size = 0.9 } = {}) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const r = radius * (0.6 + Math.random() * 0.4);
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = r * s * Math.cos(th);
    pos[i * 3 + 1] = r * u;
    pos[i * 3 + 2] = r * s * Math.sin(th);
    const tint = Math.random();
    col[i * 3] = tint > 0.7 ? 1 : 0.85;
    col[i * 3 + 1] = tint > 0.7 ? 0.9 : 0.92;
    col[i * 3 + 2] = tint > 0.7 ? 0.75 : 1;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size, map: getSoftTexture(), vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  pts.frustumCulled = false;
  group.add(pts);
  return pts;
}

/* ------------------------------------------------------------------ LAVA (classic two-texture flow shader) */
export function createLavaMaterial(cloudTex, lavaTex, { uvScale = 3, speed = 1 } = {}) {
  if (cloudTex) {
    cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
  }
  if (lavaTex) {
    lavaTex.wrapS = lavaTex.wrapT = THREE.RepeatWrapping;
    lavaTex.colorSpace = THREE.SRGBColorSpace;
  }
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      uvScale: { value: new THREE.Vector2(uvScale, uvScale) },
      texture1: { value: cloudTex },
      texture2: { value: lavaTex },
      uSpeed: { value: speed },
    },
    vertexShader: /* glsl */ `uniform vec2 uvScale; varying vec2 vUv; void main(){ vUv = uvScale * uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float time, uSpeed; uniform sampler2D texture1, texture2; varying vec2 vUv;
      void main(){
        float t = time * uSpeed;
        vec4 noise = texture2D(texture1, vUv);
        vec2 T1 = vUv + vec2(1.5, -1.5) * t * 0.02;
        vec2 T2 = vUv + vec2(-0.5, 2.0) * t * 0.01;
        T1.x += noise.x * 2.0; T1.y += noise.y * 2.0; T2.x -= noise.y * 0.2; T2.y += noise.z * 0.2;
        float p = texture2D(texture1, T1 * 2.0).a;
        vec4 color = texture2D(texture2, T2 * 2.0);
        vec4 temp = color * (vec4(p) * 2.0) + (color * color - 0.1);
        if (temp.r > 1.0) temp.bg += clamp(temp.r - 2.0, 0.0, 100.0);
        if (temp.g > 1.0) temp.rb += temp.g - 1.0;
        if (temp.b > 1.0) temp.rg += temp.b - 1.0;
        gl_FragColor = vec4(temp.rgb * 1.6, 1.0);
      }`,
  });
  return mat;
}

/* ------------------------------------------------------------------ GLOWING SPHERE (star / fireball) */
export function createGlowSphere(group, animCallbacks, { radius = 3, color = 0xffc040, hot = 0xffffff, intensity = 2.5, turbulence = 1.0, position = [0, 0, 0] } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uHot: { value: new THREE.Color(hot) }, uIntensity: { value: intensity }, uTurb: { value: turbulence } },
    vertexShader: /* glsl */ `varying vec3 vP; varying vec3 vN; varying vec3 vV; void main(){ vP = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      ${GLSL_NOISE}
      uniform float uTime, uIntensity, uTurb; uniform vec3 uColor, uHot; varying vec3 vP; varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 p = normalize(vP) * 3.0;
        float n = fbm(p * uTurb + vec3(uTime * 0.08, uTime * 0.05, 0.0));
        float n2 = fbm(p * uTurb * 3.0 - vec3(0.0, uTime * 0.15, uTime * 0.07));
        float gran = smoothstep(0.35, 0.8, n * 0.7 + n2 * 0.5);
        float limb = pow(max(dot(normalize(vN), normalize(vV)), 0.0), 0.55);
        vec3 col = mix(uColor * 0.55, uHot, gran) * limb * uIntensity;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 48), mat);
  m.position.set(...position);
  group.add(m);
  // corona
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: getSoftTexture(), color, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  corona.scale.setScalar(radius * 5.2);
  corona.position.copy(m.position);
  group.add(corona);
  animCallbacks.push((t) => {
    mat.uniforms.uTime.value = t;
    corona.material.opacity = 0.5 + 0.08 * Math.sin(t * 1.7);
  });
  return m;
}

/* ------------------------------------------------------------------ METEOR STREAKS */
export function createMeteors(group, animCallbacks, { count = 14, area = 120, height = 60, speed = 38, color = 0xffb060, length = 6 } = {}) {
  const geo = new THREE.CylinderGeometry(0.02, 0.14, length, 6, 1);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  inst.frustumCulled = false;
  const dir = new THREE.Vector3(-0.55, -1, -0.35).normalize();
  const items = Array.from({ length: count }, () => ({ pos: new THREE.Vector3((Math.random() - 0.5) * area, height + Math.random() * height, (Math.random() - 0.5) * area), phase: Math.random() * 10 }));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  const m = new THREE.Matrix4();
  group.add(inst);
  animCallbacks.push((t, dt) => {
    for (let i = 0; i < count; i++) {
      const it = items[i];
      it.pos.addScaledVector(dir, speed * dt);
      if (it.pos.y < -5) it.pos.set((Math.random() - 0.5) * area, height + Math.random() * height * 0.6, (Math.random() - 0.5) * area);
      m.compose(it.pos, q, new THREE.Vector3(1, 1, 1));
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
  });
  return inst;
}

/* ------------------------------------------------------------------ EXPANDING SHOCKWAVE RING */
export function createShockwave(group, animCallbacks, { center = [0, 0.3, -60], maxRadius = 90, period = 7, color = 0xffd9a0 } = {}) {
  const geo = new THREE.RingGeometry(0.9, 1.0, 96, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...center);
  group.add(m);
  animCallbacks.push((t) => {
    const u = (t % period) / period;
    const r = 1 + u * maxRadius;
    m.scale.set(r, 1, r);
    mat.opacity = 0.7 * (1 - u);
  });
  return m;
}

/* ------------------------------------------------------------------ HOLOGRAM NEURAL NET (AI era) */
export function createNeuralHologram(group, animCallbacks, { position = [0, 2.2, 0], layers = [6, 10, 10, 6], spacing = 1.1, color = 0x5ad7ff } = {}) {
  const g = new THREE.Group();
  g.position.set(...position);
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.06, 12, 10);
  const nodeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
  const positions = [];
  layers.forEach((n, li) => {
    const layer = [];
    for (let i = 0; i < n; i++) {
      const y = (i - (n - 1) / 2) * 0.32;
      const x = (li - (layers.length - 1) / 2) * spacing;
      const p = new THREE.Vector3(x, y, 0);
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.copy(p);
      g.add(mesh);
      layer.push(p);
      nodes.push(mesh);
    }
    positions.push(layer);
  });
  const linePos = [];
  for (let li = 0; li < positions.length - 1; li++) {
    for (const a of positions[li]) for (const b of positions[li + 1]) linePos.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  const lgeo = new THREE.BufferGeometry();
  lgeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  const lines = new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
  g.add(lines);
  const pulse = createParticles(g, animCallbacks, { count: 160, box: [spacing * layers.length, 3.4, 0.4], center: [0, 0, 0], color, size: 0.05, speed: 0.6, direction: 1, sway: 0.05, additive: true, fade: true });
  pulse.rotation.z = -Math.PI / 2;
  group.add(g);
  animCallbacks.push((t) => {
    g.rotation.y = Math.sin(t * 0.25) * 0.35;
    nodeMat.opacity = 0.75 + 0.25 * Math.sin(t * 3.0);
  });
  return g;
}
