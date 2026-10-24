import * as THREE from '../../../vendor/three/build/three.module.js';
import { makeAtmosphereShell } from '../HyperRealKit.js';

/**
 * LinearCorridor.js — Photorealistic Linear 3D Time-Lapse & Light-Speed Warp Corridor of Earths.
 *
 * Uses a custom GLSL Planet Shader driven by the real 5400x2700 NASA Blue Marble (`earthDay`),
 * 3600x1800 NASA Night Lights (`earthNight`), and 2048x1024 NASA Clouds (`earthClouds`) textures:
 *   • Dynamically warps continental tectonic plates on the GPU from Supercontinent Pangaea (250 MYA)
 *     -> Laurasia & Gondwana (155 MYA) -> Cretaceous (68 MYA) -> Cenozoic Himalayas (35 MYA) -> Modern 7 Continents!
 *   • Renders Hadean magma oceans (4.5B YA), Archean water-worlds (3.8B YA), Snowball Earth (720M YA),
 *     Siberian Traps super-volcanoes (252M YA), the 66 MYA Chicxulub Dinosaur-Extinction Asteroid Impact,
 *     Pleistocene Ice Age glaciers (400K–20K YA), and modern city night-lights!
 *   • Arranges all 30 worlds along a visible linear 3D cosmic corridor so scrolling flies you at
 *     light-speed from one Earth to the next Earth!
 */

export const CORRIDOR_SPACING = 22;
export const GLOBE_RADIUS = 2.55;

/** Geographic lat/lon (degrees) for the 3D surface portal pin on each stop's globe. */
const STOP_PORTAL_COORDS = {
  'big-bang': { lat: 0, lon: 0, label: '💥 Zoom Into Quantum Singularity' },
  'first-stars': { lat: 12, lon: -20, label: '✨ Zoom Into Pop-III Hypergiant Star' },
  'molten-earth': { lat: 18, lon: 15, label: '🌋 Zoom Into Hadean Lava Sea & Theia Impact' },
  'first-organisms': { lat: -10, lon: -30, label: '🦠 Zoom Into Deep-Sea Hydrothermal Vents (LUCA)' },
  'oxygen-snowball': { lat: -15, lon: 25, label: '❄️ Zoom Into Snowball Earth & Stromatolite Reef' },
  'cambrian-explosion': { lat: 20, lon: -40, label: '🦐 Zoom Into Cambrian Reef (Anomalocaris & Trilobites)' },
  'land-walk': { lat: 15, lon: -25, label: '🦎 Zoom Into Devonian Shore (Tiktaalik Walks on Land)' },
  'pangaea-great-dying': { lat: 22, lon: 18, label: '🌋 Zoom Into Pangaea & Siberian Traps (The Great Dying)' },
  'jurassic-giants': { lat: 26, lon: -35, label: '🦕 Zoom Into Jurassic Forest (Apatosaurus & Stegosaurus)' },
  'cretaceous-kings': { lat: 32, lon: -55, label: '🦖 Zoom Into Cretaceous Valley (T. rex & Triceratops)' },
  'asteroid-impact': { lat: 21.4, lon: -45.0, label: '☄️ Zoom Into Chicxulub Crater: Extinction of the Dinosaurs!' },
  'himalayas-mammals': { lat: 28, lon: 78, label: '🏔️ Zoom Into Himalaya Collision & Early Mammals' },
  'lucy-bipedalism': { lat: 11.1, lon: 40.6, label: '🦴 Zoom Into Afar Rift: Lucy & First Upright Walkers' },
  'homo-erectus-fire': { lat: -22.0, lon: 24.5, label: '🔥 Zoom Into Wonderwerk Cave: Humans Discover Fire!' },
  'sapiens-neanderthals-500k': { lat: 42, lon: 15, label: '🧬 Zoom Into Sapiens & Neanderthal Evolution' },
  'out-of-africa-100k': { lat: 40, lon: 8, label: '🎨 Zoom Into Chauvet/Lascaux Cave Art & Migration' },
  'beringia-americas': { lat: 58, lon: -135, label: '🦣 Zoom Into Beringia Land Bridge & Woolly Mammoths' },
  'farming-revolution': { lat: 36, lon: 38, label: '🌾 Zoom Into Fertile Crescent: Birth of Farming' },
  'bronze-age-pyramids': { lat: 30, lon: 31, label: '🏺 Zoom Into Giza Pyramids & Bronze Age Cities' },
  'classical-greece': { lat: 38, lon: 23.7, label: '🏛️ Zoom Into Athens Acropolis & The Parthenon' },
  'roman-empire': { lat: 41.9, lon: 12.5, label: '🦅 Zoom Into Rome: The Colosseum & Aqueducts' },
  'medieval-renaissance': { lat: 48.8, lon: 2.3, label: '🏰 Zoom Into Medieval Castle & Printing Press' },
  'first-industrial-rev': { lat: 52.5, lon: -1.9, label: '🚂 Zoom Into Industrial Steam Locomotive & Factory' },
  'second-industrial-rev': { lat: 40.7, lon: -74.0, label: '💡 Zoom Into Electrified City & Edison Dynamo' },
  'computers-moon': { lat: 28.5, lon: -80.6, label: '🚀 Zoom Into Apollo 11 Moon Landing (Tranquility Base)' },
  'pc-internet-iphone': { lat: 37.3, lon: -122.0, label: '📱 Zoom Into Personal Computers, Internet & iPhone' },
  'ai-today-2026': { lat: 37.7, lon: -122.4, label: '🤖 Zoom Into 2026 AI & Humanoid Robotics Lab' },
  'solarpunk-2050': { lat: 15.0, lon: 20.0, label: '🌱 Zoom Into 2050 Solarpunk Fusion & Vertical Forest City' },
  'mars-2150': { lat: -14.6, lon: 175.4, label: '🪐 Zoom Into 2150 Terraformed Mars Colony' },
  'year-3000': { lat: 0, lon: 0, label: '🌟 Zoom Into Year 3000 Dyson Swarm & O’Neill Habitat' },
};

function latLonToVector3(latDeg, lonDeg, radius) {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Custom GLSL Shader for Photorealistic Paleo-Earth -> Modern Earth Evolution.
 * Uses real NASA 4K satellite imagery (`uDayMap`, `uNightMap`) and deforms UV coordinates
 * to close the Atlantic & Indian Oceans for Pangaea / Jurassic / Cretaceous eras, while adding
 * physical ocean specular highlights, polar ice sheets, magma veins, and impact shockwaves!
 */
const PALEO_EARTH_VERT = `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vLocalPos;
void main() {
  vUv = uv;
  vLocalPos = normalize(position);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const PALEO_EARTH_FRAG = `
uniform sampler2D uDayMap;
uniform sampler2D uNightMap;
uniform float uTime;
uniform float uDrift;        // 1.0 = Pangaea (250 MYA), 0.62 = Jurassic, 0.27 = Cretaceous, 0.0 = Modern
uniform float uMagma;        // 1.0 = Hadean Molten Earth, 0.0 = normal
uniform float uArchean;      // 1.0 = Archean green ocean world
uniform float uIceCap;       // 0.0 = none, 0.35 = Ice Age, 0.92 = Snowball Earth
uniform float uNightLights;  // 0.0 = pre-electric, 1.0 = modern city lights
uniform vec2 uCataclysmUv;   // UV center of Chicxulub impact or Siberian Traps
uniform float uCataclysm;    // 0.0 = none, 1.0 = active super-eruption / asteroid impact
uniform vec3 uSunDir;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vLocalPos;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uSunDir);
  float ndl = max(dot(N, L), 0.0);
  float ambient = 0.28;

  // 1. Tectonic UV Warp (Pangaea -> Modern Continents using real NASA satellite texture!)
  vec2 uv = vUv;
  if (uDrift > 0.001) {
    // Pull North & South America eastward toward Africa/Europe to close the Atlantic Ocean
    float americasMask = smoothstep(0.08, 0.20, vUv.x) * (1.0 - smoothstep(0.40, 0.50, vUv.x));
    // Pull Eurasia/India/Australia westward & southward toward Gondwana
    float eastMask = smoothstep(0.54, 0.66, vUv.x) * (1.0 - smoothstep(0.88, 0.96, vUv.x));
    uv.x -= americasMask * 0.135 * uDrift;
    uv.x += eastMask * 0.085 * uDrift;
    uv.y += eastMask * 0.055 * uDrift * sin(vUv.x * 6.2831);
    uv = fract(uv);
  }

  vec3 dayCol = texture2D(uDayMap, uv).rgb;

  // Detect ocean vs land from NASA Blue Marble (ocean has high blue relative to red/green)
  float isOcean = smoothstep(0.02, 0.12, dayCol.b - max(dayCol.r, dayCol.g * 0.92));

  // In Pangaea / Mesozoic eras, tint interior supercontinent slightly warmer / lush
  if (uDrift > 0.2 && isOcean < 0.5) {
    float n = fbm(uv * 16.0);
    vec3 paleoLand = mix(vec3(0.16, 0.38, 0.18), vec3(0.58, 0.42, 0.24), smoothstep(0.35, 0.75, n));
    dayCol = mix(dayCol, paleoLand, 0.35 * uDrift);
  }

  // 2. Archean Early Ocean World (3.8 BYA LUCA)
  if (uArchean > 0.01) {
    float craton = fbm(vUv * 14.0);
    vec3 archSea = vec3(0.03, 0.24, 0.22);
    vec3 archRock = vec3(0.28, 0.22, 0.18);
    dayCol = mix(archSea, archRock, smoothstep(0.62, 0.72, craton));
    isOcean = 1.0 - smoothstep(0.62, 0.72, craton);
  }

  // 3. Hadean Molten Magma Ocean (4.54 BYA)
  vec3 emissiveCol = vec3(0.0);
  if (uMagma > 0.01) {
    float crust = fbm(vUv * 12.0 + vec2(uTime * 0.01, 0.0));
    float cracks = smoothstep(0.42, 0.58, abs(crust - 0.5) * 3.2);
    vec3 basalt = vec3(0.10, 0.07, 0.06);
    vec3 lava = mix(vec3(1.0, 0.28, 0.02), vec3(1.0, 0.88, 0.45), pow(1.0 - cracks, 2.0));
    dayCol = mix(lava, basalt, cracks);
    emissiveCol += lava * (1.0 - cracks) * 1.65 * uMagma;
    isOcean = 0.0;
  }

  // 4. Polar Ice Sheets & Snowball Earth Glaciation
  if (uIceCap > 0.01) {
    float lat = abs(vUv.y - 0.5) * 2.0; // 0 at equator, 1 at poles
    float fNoise = fbm(vUv * 18.0) * 0.12;
    float iceThreshold = 1.0 - uIceCap;
    float iceMask = smoothstep(iceThreshold - 0.08, iceThreshold + 0.04, lat + fNoise);
    vec3 glacialIce = vec3(0.92, 0.96, 1.0);
    dayCol = mix(dayCol, glacialIce, iceMask);
    isOcean *= (1.0 - iceMask);
  }

  // 5. Cataclysmic Impact / Super-Volcano (66 MYA Chicxulub Asteroid or 252 MYA Siberian Traps)
  if (uCataclysm > 0.01) {
    vec2 dUv = vUv - uCataclysmUv;
    dUv.x *= 1.8;
    float dist = length(dUv);
    float core = exp(-dist * 34.0);
    float waveRadius = mod(uTime * 0.14, 0.24);
    float ring1 = exp(-pow((dist - waveRadius) * 42.0, 2.0)) * (1.0 - waveRadius / 0.24);
    float ring2 = exp(-pow((dist - 0.075) * 36.0, 2.0)) * 0.7;
    vec3 blastCol = mix(vec3(1.0, 0.28, 0.02), vec3(1.0, 0.88, 0.45), core);
    emissiveCol += blastCol * (core * 1.45 + ring1 * 1.15 + ring2 * 0.65) * uCataclysm;
  }

  // 6. Modern City Night Lights on the Dark Hemisphere
  if (uNightLights > 0.01) {
    vec3 nightTex = texture2D(uNightMap, vUv).rgb;
    float nightMask = smoothstep(0.25, -0.15, dot(N, L));
    emissiveCol += nightTex * vec3(1.0, 0.82, 0.45) * (0.45 + 0.85 * nightMask) * uNightLights * 1.35;
  }

  // 7. Physical Specular Ocean Glint + Rim Scattering
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 42.0) * isOcean * 0.18;
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.4);
  vec3 atmoRim = mix(vec3(0.22, 0.68, 0.98), vec3(0.98, 0.42, 0.12), max(uMagma, uCataclysm * 0.45)) * fresnel * 0.48;

  vec3 litColor = dayCol * (ambient + (1.0 - ambient) * ndl) + vec3(1.0, 0.96, 0.88) * spec + emissiveCol + atmoRim;
  gl_FragColor = vec4(litColor, 1.0);
}
`;

export class LinearCorridor {
  constructor(milestones, baseTextures) {
    this.milestones = milestones;
    this.baseTextures = baseTextures;
    this.group = new THREE.Group();
    this.group.name = 'LinearTimeCorridor';

    this.nodes = [];
    this.warpStreaks = null;
    this.warpVelocity = 0;

    this._buildCorridorBackground();
    this._buildTimeHighwayRails();
    this._buildPlanetNodes();
    this._buildWarpStreaks();
  }

  /**
   * Computes the 3D position of stop `index` along the diagonal-linear corridor
   * so that from any active Earth, the upcoming future Earths are clearly visible
   * stretching into deep space on the right-center horizon!
   */
  getStopPosition(index) {
    return new THREE.Vector3(index * 9.8, index * 1.35, -index * CORRIDOR_SPACING);
  }

  _buildCorridorBackground() {
    const totalLen = this.milestones.length * CORRIDOR_SPACING + 400;
    const count = 5500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = Math.random() * this.milestones.length;
      const center = this.getStopPosition(t);
      const r = 18 + Math.random() * 140;
      const ang = Math.random() * Math.PI * 2;
      pos[i * 3] = center.x + Math.cos(ang) * r;
      pos[i * 3 + 1] = center.y + Math.sin(ang) * r;
      pos[i * 3 + 2] = center.z + (Math.random() - 0.5) * 60;
      const c = 0.75 + Math.random() * 0.25;
      col[i * 3] = c;
      col[i * 3 + 1] = c * (0.92 + Math.random() * 0.08);
      col[i * 3 + 2] = 1.0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    this.group.add(new THREE.Points(geo, mat));
  }

  _buildTimeHighwayRails() {
    // Glowing linear time-highway rails connecting all 30 Earths in sequence
    const ptsL = [];
    const ptsR = [];
    const ptsCenter = [];
    for (let i = 0; i < this.milestones.length; i++) {
      const p = this.getStopPosition(i);
      ptsL.push(new THREE.Vector3(p.x - 3.6, p.y - 2.9, p.z));
      ptsR.push(new THREE.Vector3(p.x + 3.6, p.y - 2.9, p.z));
      ptsCenter.push(new THREE.Vector3(p.x, p.y - 3.0, p.z));
    }
    const railMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const centerMat = new THREE.LineBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.35,
    });
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsL), railMat));
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsR), railMat));
    this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ptsCenter), centerMat));

    // Glowing portal rings around each stop along the linear corridor
    const ringGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.42, GLOBE_RADIUS * 1.48, 64);
    this.milestones.forEach((m, i) => {
      const p = this.getStopPosition(i);
      const ringMat = new THREE.MeshBasicMaterial({
        color: m.themeColor || 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(p);
      this.group.add(ring);
    });
  }

  _buildPlanetNodes() {
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 48);
    const cloudGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.016, 48, 36);

    this.milestones.forEach((m, index) => {
      const stopPos = this.getStopPosition(index);
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(stopPos);
      this.group.add(nodeGroup);

      const anims = [];
      let globeMesh = null;
      let cloudMesh = null;
      let shaderUniforms = null;

      if (m.id === 'big-bang') {
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff7ed });
        globeMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 0.72, 48, 36), coreMat);
        nodeGroup.add(globeMesh);
        const shell1 = makeAtmosphereShell(GLOBE_RADIUS * 0.95, '#f97316', 2.2, 2.0);
        const shell2 = makeAtmosphereShell(GLOBE_RADIUS * 1.32, '#a855f7', 1.4, 2.4);
        nodeGroup.add(shell1, shell2);
        anims.push((t) => {
          globeMesh.scale.setScalar(1 + 0.07 * Math.sin(t * 3.0));
          shell1.rotation.y = t * 0.4;
        });
      } else if (m.id === 'first-stars') {
        const starMat = new THREE.MeshBasicMaterial({
          map: this.baseTextures.sun || null,
          color: 0x93c5fd,
        });
        globeMesh = new THREE.Mesh(sphereGeo, starMat);
        nodeGroup.add(globeMesh);
        nodeGroup.add(makeAtmosphereShell(GLOBE_RADIUS * 1.08, '#3b82f6', 2.2, 2.1));
      } else if (m.id === 'mars-2150') {
        const marsMat = new THREE.MeshStandardMaterial({
          map: this.baseTextures.mars || null,
          roughness: 0.65,
          metalness: 0.05,
        });
        globeMesh = new THREE.Mesh(sphereGeo, marsMat);
        nodeGroup.add(globeMesh);
        nodeGroup.add(makeAtmosphereShell(GLOBE_RADIUS, '#38bdf8', 1.15, 2.8));
      } else if (m.id === 'year-3000') {
        const sunMat = new THREE.MeshBasicMaterial({
          map: this.baseTextures.sun || null,
          color: 0xfde047,
        });
        globeMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 0.82, 48, 36), sunMat);
        nodeGroup.add(globeMesh);
        nodeGroup.add(makeAtmosphereShell(GLOBE_RADIUS * 0.95, '#f59e0b', 2.0, 2.2));

        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.85,
          metalness: 0.8,
          roughness: 0.2,
          side: THREE.DoubleSide,
        });
        for (let r = 0; r < 3; r++) {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(GLOBE_RADIUS * (1.12 + r * 0.14), GLOBE_RADIUS * (1.18 + r * 0.14), 48),
            ringMat
          );
          ring.rotation.x = 0.45 + r * 0.5;
          ring.rotation.y = r * 0.7;
          nodeGroup.add(ring);
          anims.push((t) => {
            ring.rotation.z = t * (0.3 + r * 0.12);
          });
        }
      } else {
        // Photorealistic GPU-Warped NASA Paleo-Earth -> Modern Earth!
        const paleoMa = m.paleoMa !== null && m.paleoMa !== undefined ? m.paleoMa : 0;
        const drift = paleoMa > 1.5 ? Math.min(1.0, paleoMa / 250.0) : 0.0;
        const isMolten = m.id === 'molten-earth' ? 1.0 : 0.0;
        const isArchean = m.id === 'first-organisms' ? 1.0 : 0.0;
        const iceCap =
          m.id === 'oxygen-snowball'
            ? 0.88
            : m.id === 'beringia-americas'
            ? 0.36
            : m.id === 'sapiens-neanderthals-500k' || m.id === 'out-of-africa-100k' || m.id === 'homo-erectus-fire'
            ? 0.22
            : 0.08;
        const nightLights =
          m.id === 'second-industrial-rev'
            ? 0.45
            : m.id === 'computers-moon' || m.id === 'pc-internet-iphone' || m.id === 'ai-today-2026' || m.id === 'solarpunk-2050'
            ? 1.0
            : 0.0;

        const isCataclysm = m.id === 'asteroid-impact' || m.id === 'pangaea-great-dying' ? 1.0 : 0.0;
        const cataclysmUv =
          m.id === 'asteroid-impact'
            ? new THREE.Vector2(0.36, 0.62)
            : new THREE.Vector2(0.58, 0.72);

        shaderUniforms = {
          uDayMap: { value: this.baseTextures.earthDay },
          uNightMap: { value: this.baseTextures.earthNight },
          uTime: { value: 0 },
          uDrift: { value: drift },
          uMagma: { value: isMolten },
          uArchean: { value: isArchean },
          uIceCap: { value: iceCap },
          uNightLights: { value: nightLights },
          uCataclysmUv: { value: cataclysmUv },
          uCataclysm: { value: isCataclysm },
          uSunDir: { value: new THREE.Vector3(0.55, 0.35, 0.75).normalize() },
        };

        const earthMat = new THREE.ShaderMaterial({
          uniforms: shaderUniforms,
          vertexShader: PALEO_EARTH_VERT,
          fragmentShader: PALEO_EARTH_FRAG,
        });

        globeMesh = new THREE.Mesh(sphereGeo, earthMat);
        nodeGroup.add(globeMesh);

        // 3D Cloud Sphere from NASA 2K Cloud Map
        if (!isMolten && this.baseTextures.earthClouds) {
          const cloudMat = new THREE.MeshStandardMaterial({
            alphaMap: this.baseTextures.earthClouds,
            color: isCataclysm ? 0xfed7aa : 0xffffff,
            transparent: true,
            opacity: m.id === 'oxygen-snowball' ? 0.32 : 0.48,
            depthWrite: false,
          });
          cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
          nodeGroup.add(cloudMesh);
        }

        const atmoColor =
          isMolten
            ? '#ef4444'
            : isArchean
            ? '#10b981'
            : isCataclysm
            ? '#f97316'
            : '#38bdf8';
        nodeGroup.add(makeAtmosphereShell(GLOBE_RADIUS, atmoColor, 1.25, 2.9));

        // Special 3D Orbital Props for Key Milestones:
        if (m.id === 'molten-earth') {
          const theiaMesh = new THREE.Mesh(
            new THREE.SphereGeometry(GLOBE_RADIUS * 0.45, 32, 24),
            new THREE.MeshStandardMaterial({
              map: this.baseTextures.mars || null,
              emissive: 0xff5500,
              emissiveIntensity: 0.65,
            })
          );
          theiaMesh.position.set(GLOBE_RADIUS * 0.92, GLOBE_RADIUS * 0.58, GLOBE_RADIUS * 0.35);
          nodeGroup.add(theiaMesh);
        } else if (m.id === 'asteroid-impact') {
          // 66 MYA Chicxulub Asteroid Impact 3D Plume & Incoming Meteor Trail on the Globe!
          const impactGroup = new THREE.Group();
          const impactPos = latLonToVector3(21.4, -45.0, GLOBE_RADIUS);
          impactGroup.position.copy(impactPos);
          impactGroup.lookAt(impactPos.clone().multiplyScalar(2));

          const fireball = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 24, 24),
            new THREE.MeshBasicMaterial({ color: 0xff7a18 })
          );
          impactGroup.add(fireball);

          const beamGeo = new THREE.CylinderGeometry(0.015, 0.11, 2.8, 16, 1, true);
          beamGeo.translate(0, 1.4, 0);
          beamGeo.rotateX(Math.PI / 2);
          const beamMat = new THREE.MeshBasicMaterial({
            color: 0xf97316,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          impactGroup.add(new THREE.Mesh(beamGeo, beamMat));

          const shockRing = new THREE.Mesh(
            new THREE.RingGeometry(0.18, 0.30, 32),
            new THREE.MeshBasicMaterial({
              color: 0xfb923c,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.85,
              blending: THREE.AdditiveBlending,
            })
          );
          shockRing.position.z = 0.04;
          impactGroup.add(shockRing);

          globeMesh.add(impactGroup);
          anims.push((t) => {
            const pulse = (t * 0.75) % 1;
            shockRing.scale.setScalar(0.6 + pulse * 1.9);
            shockRing.material.opacity = (1 - pulse) * 0.85;
            fireball.scale.setScalar(0.9 + 0.12 * Math.sin(t * 7));
          });
        } else if (m.id === 'computers-moon') {
          const moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(GLOBE_RADIUS * 0.27, 32, 24),
            new THREE.MeshStandardMaterial({ map: this.baseTextures.moon || null, roughness: 0.85 })
          );
          moonMesh.position.set(GLOBE_RADIUS * 1.55, GLOBE_RADIUS * 0.35, GLOBE_RADIUS * 0.5);
          nodeGroup.add(moonMesh);
        }
      }

      // 3D Surface Portal Pin on the Globe
      const coord = STOP_PORTAL_COORDS[m.id] || { lat: 15, lon: 15, label: `🔍 Zoom Into ${m.title}` };
      const pinLocalPos = latLonToVector3(coord.lat, coord.lon, GLOBE_RADIUS * 1.03);
      const beaconGroup = new THREE.Group();
      beaconGroup.position.copy(pinLocalPos);
      beaconGroup.lookAt(pinLocalPos.clone().multiplyScalar(2));

      const pinCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      const pinHalo = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.25, 24),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
        })
      );
      beaconGroup.add(pinCore, pinHalo);
      if (globeMesh) {
        globeMesh.add(beaconGroup);
        const targetLonRad = -((coord.lon + 90) * Math.PI) / 180;
        globeMesh.rotation.y = targetLonRad;
      }

      this.nodes.push({
        index,
        milestone: m,
        group: nodeGroup,
        globe: globeMesh,
        clouds: cloudMesh,
        beacon: beaconGroup,
        shaderUniforms,
        portalLabel: coord.label,
        baseRotY: globeMesh ? globeMesh.rotation.y : 0,
        anims,
      });
    });
  }

  _buildWarpStreaks() {
    const count = 1600;
    const positions = new Float32Array(count * 6);
    const colors = new Float32Array(count * 6);
    const meta = [];

    for (let i = 0; i < count; i++) {
      const r = 4.5 + Math.random() * 34;
      const ang = Math.random() * Math.PI * 2;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      const z = (Math.random() - 0.5) * 180;
      meta.push({ x, y, z, baseLen: 0.5 + Math.random() * 1.3 });

      const c1 = i % 3 === 0 ? [0.22, 0.74, 0.97] : i % 3 === 1 ? [0.98, 0.57, 0.24] : [0.95, 0.97, 1.0];
      colors.set([...c1, ...c1], i * 6);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.warpStreaks = new THREE.LineSegments(geo, mat);
    this.warpStreaks.frustumCulled = false;
    this.warpStreakMeta = meta;
    this.group.add(this.warpStreaks);
  }

  update(t, dt, currentProgress, zVelocity) {
    this.nodes.forEach((node) => {
      const distStops = Math.abs(node.index - currentProgress);
      node.group.visible = distStops < 7.5;
      if (!node.group.visible) return;

      if (node.shaderUniforms) {
        node.shaderUniforms.uTime.value = t;
      }
      if (node.globe) {
        node.globe.rotation.y = node.baseRotY + Math.sin(t * 0.22 + node.index) * 0.22;
      }
      if (node.clouds) {
        node.clouds.rotation.y = t * 0.035;
      }
      if (node.beacon) {
        const s = 1 + 0.22 * Math.sin(t * 4.5);
        node.beacon.scale.setScalar(s);
      }
      node.anims.forEach((fn) => fn(t, dt));
    });

    const speedFactor = Math.min(1, Math.abs(zVelocity) / 14);
    this.warpVelocity += (speedFactor - this.warpVelocity) * Math.min(1, dt * 10);

    if (this.warpStreaks) {
      const focusPos = this.getStopPosition(currentProgress);
      this.warpStreaks.position.copy(focusPos);
      this.warpStreaks.material.opacity = Math.min(0.92, 0.12 + this.warpVelocity * 0.85);

      const stretch = 1.0 + this.warpVelocity * 32.0;
      const posAttr = this.warpStreaks.geometry.getAttribute('position');
      const arr = posAttr.array;
      const meta = this.warpStreakMeta;

      for (let i = 0; i < meta.length; i++) {
        const m = meta[i];
        m.z += zVelocity * dt * 1.4;
        if (m.z > 90) m.z -= 180;
        if (m.z < -90) m.z += 180;

        const len = m.baseLen * stretch;
        const j = i * 6;
        arr[j] = m.x;
        arr[j + 1] = m.y;
        arr[j + 2] = m.z;
        arr[j + 3] = m.x;
        arr[j + 4] = m.y;
        arr[j + 5] = m.z - len;
      }
      posAttr.needsUpdate = true;
    }
  }
}
