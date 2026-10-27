import * as THREE from '../../../vendor/three/build/three.module.js';
import { ensureUV1 } from './AssetLibrary.js';
import { makeRNG } from './Terrain.js';

/**
 * Architecture — monumental structures built from real-world proportions and REAL scanned PBR
 * materials (Poly Haven sandstone / marble / medieval block / brick / iron). Architecture is where
 * geometry can be constructed faithfully from measured plans; creatures cannot — so creatures come
 * from museum scans while buildings are generated here at true scale.
 */

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3(1, 1, 1);

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  ensureUV1(g);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* ------------------------------------------------------------------ PYRAMID (block-by-block) */
export function createPyramid(mat, { base = 46, height = 29, courses = 34, blockLen = 1.35, position = [0, 0, 0], rotationY = 0 } = {}) {
  const group = new THREE.Group();
  const courseH = height / courses;
  const transforms = [];
  for (let c = 0; c < courses; c++) {
    const side = base * (1 - c / courses);
    const n = Math.max(2, Math.round(side / blockLen));
    const len = side / n;
    const y = c * courseH + courseH / 2;
    const half = side / 2;
    for (let i = 0; i < n; i++) {
      const t = -half + len * (i + 0.5);
      transforms.push([t, y, -half + len * 0.5, len, courseH, len]);
      transforms.push([t, y, half - len * 0.5, len, courseH, len]);
      if (i > 0 && i < n - 1) {
        transforms.push([-half + len * 0.5, y, t, len, courseH, len]);
        transforms.push([half - len * 0.5, y, t, len, courseH, len]);
      }
    }
  }
  const geo = new THREE.BoxGeometry(1, 1, 1);
  ensureUV1(geo);
  const inst = new THREE.InstancedMesh(geo, mat, transforms.length);
  const rng = makeRNG(42);
  transforms.forEach((tr, i) => {
    const jitter = (rng() - 0.5) * 0.06;
    _p.set(tr[0], tr[1], tr[2]);
    _q.identity();
    _s.set(tr[3] * 1.01, tr[4] * 0.98 + jitter, tr[5] * 1.01);
    _m.compose(_p, _q, _s);
    inst.setMatrixAt(i, _m);
  });
  inst.instanceMatrix.needsUpdate = true;
  inst.castShadow = true;
  inst.receiveShadow = true;
  group.add(inst);
  // solid core so no gaps show through
  group.add(new THREE.Mesh(new THREE.ConeGeometry(base * 0.68, height * 0.98, 4, 1), mat).rotateY(Math.PI / 4).translateY(height * 0.49));
  group.position.set(...position);
  group.rotation.y = rotationY;
  return group;
}

/* ------------------------------------------------------------------ ZIGGURAT */
export function createZiggurat(mat, { base = 30, tiers = 4, tierH = 4.2, position = [0, 0, 0] } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < tiers; i++) {
    const s = base * (1 - i * 0.2);
    g.add(box(s, tierH, s * 0.85, mat, 0, tierH * i + tierH / 2, 0));
  }
  // grand stair
  const stair = box(base * 0.14, tierH * tiers * 0.98, base * 0.5, mat, 0, (tierH * tiers) / 2, base * 0.45);
  stair.rotation.x = -Math.atan2(tierH * tiers, base * 0.5) * 0.55;
  g.add(stair);
  g.add(box(base * 0.18, tierH * 0.9, base * 0.14, mat, 0, tierH * tiers + tierH * 0.45, 0));
  g.position.set(...position);
  return g;
}

/* ------------------------------------------------------------------ GREEK TEMPLE (Doric, Parthenon plan 8 × 17) */
export function createGreekTemple(marble, { cols = 8, rows = 17, colH = 10.4, colR = 0.95, spacing = 4.3, position = [0, 0, 0], rotationY = 0, roof = true } = {}) {
  const g = new THREE.Group();
  const width = (cols - 1) * spacing;
  const depth = (rows - 1) * spacing;
  // crepidoma (3 steps)
  for (let i = 0; i < 3; i++) {
    g.add(box(width + 8 - i * 1.4, 0.5, depth + 8 - i * 1.4, marble, 0, 0.25 + i * 0.5, 0));
  }
  const topY = 1.5;
  // fluted column via lathe with entasis
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const r = colR * (1 - 0.18 * t) * (1 + 0.04 * Math.sin(t * Math.PI));
    pts.push(new THREE.Vector2(r, t * colH));
  }
  const shaft = new THREE.LatheGeometry(pts, 40);
  // fluting: modulate radius around
  const pos = shaft.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const ang = Math.atan2(z, x);
    const r = Math.hypot(x, z);
    const f = 1 - 0.035 * (0.5 + 0.5 * Math.cos(ang * 20));
    pos.setX(i, x * f);
    pos.setZ(i, z * f);
  }
  shaft.computeVertexNormals();
  ensureUV1(shaft);
  const capital = new THREE.CylinderGeometry(colR * 1.35, colR * 0.85, 0.7, 24);
  const abacus = new THREE.BoxGeometry(colR * 2.9, 0.35, colR * 2.9);
  const colPositions = [];
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    if (c > 0 && c < cols - 1 && r > 0 && r < rows - 1) continue; // peristyle only
    colPositions.push([-width / 2 + c * spacing, -depth / 2 + r * spacing]);
  }
  const shaftInst = new THREE.InstancedMesh(shaft, marble, colPositions.length);
  const capInst = new THREE.InstancedMesh(capital, marble, colPositions.length);
  const abInst = new THREE.InstancedMesh(abacus, marble, colPositions.length);
  colPositions.forEach(([x, z], i) => {
    _m.compose(_p.set(x, topY, z), _q.identity(), _s.set(1, 1, 1));
    shaftInst.setMatrixAt(i, _m);
    _m.compose(_p.set(x, topY + colH + 0.35, z), _q, _s);
    capInst.setMatrixAt(i, _m);
    _m.compose(_p.set(x, topY + colH + 0.85, z), _q, _s);
    abInst.setMatrixAt(i, _m);
  });
  [shaftInst, capInst, abInst].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  });
  // cella (inner walls)
  g.add(box(width - spacing * 2.2, colH + 0.6, depth - spacing * 2.6, marble, 0, topY + (colH + 0.6) / 2, 0));
  // entablature
  const entY = topY + colH + 1.0;
  g.add(box(width + colR * 3, 1.6, depth + colR * 3, marble, 0, entY + 0.8, 0));
  // frieze with triglyphs
  const trig = new THREE.BoxGeometry(0.6, 1.0, 0.25);
  const nTrig = Math.round((width + colR * 3) / 1.5);
  const trigInst = new THREE.InstancedMesh(trig, marble, nTrig * 2);
  for (let i = 0; i < nTrig; i++) {
    const x = -(width + colR * 3) / 2 + (i + 0.5) * 1.5;
    _m.compose(_p.set(x, entY + 2.2, (depth + colR * 3) / 2 + 0.1), _q.identity(), _s.set(1, 1, 1));
    trigInst.setMatrixAt(i * 2, _m);
    _m.compose(_p.set(x, entY + 2.2, -(depth + colR * 3) / 2 - 0.1), _q, _s);
    trigInst.setMatrixAt(i * 2 + 1, _m);
  }
  trigInst.castShadow = true;
  g.add(trigInst);
  g.add(box(width + colR * 3.4, 1.2, depth + colR * 3.4, marble, 0, entY + 2.2, 0));
  if (roof) {
    // pediments + roof slopes
    const pedH = (width + colR * 3.4) * 0.14;
    const shape = new THREE.Shape();
    shape.moveTo(-(width + colR * 3.4) / 2, 0);
    shape.lineTo((width + colR * 3.4) / 2, 0);
    shape.lineTo(0, pedH);
    shape.closePath();
    const ped = new THREE.ExtrudeGeometry(shape, { depth: depth + colR * 3.4, bevelEnabled: false });
    ped.translate(0, 0, -(depth + colR * 3.4) / 2);
    ensureUV1(ped);
    const pedMesh = new THREE.Mesh(ped, marble);
    pedMesh.position.y = entY + 2.8;
    pedMesh.castShadow = true;
    pedMesh.receiveShadow = true;
    g.add(pedMesh);
  }
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

/* ------------------------------------------------------------------ ARCH MODULE (Colosseum / aqueduct) */
function archModuleGeometry(w = 4.2, h = 6.4, d = 3.6, archR = 1.5) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, h);
  shape.lineTo(-w / 2, h);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-archR, 0);
  hole.lineTo(-archR, h - archR - 1.2);
  hole.absarc(0, h - archR - 1.2, archR, Math.PI, 0, true);
  hole.lineTo(archR, 0);
  hole.closePath();
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  ensureUV1(geo);
  return geo;
}

export function createColosseum(stone, { a = 38, b = 31, tiers = 3, archW = 4.3, position = [0, 0, 0] } = {}) {
  const g = new THREE.Group();
  const perimeter = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  const n = Math.round(perimeter / archW);
  const tierH = 6.4;
  for (let t = 0; t < tiers; t++) {
    const geo = archModuleGeometry(archW * 0.98, tierH, 3.4, 1.45);
    const inst = new THREE.InstancedMesh(geo, stone, n);
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2;
      const x = Math.cos(th) * a;
      const z = Math.sin(th) * b;
      // tangent direction for orientation
      const tx = -Math.sin(th) * a;
      const tz = Math.cos(th) * b;
      const rotY = Math.atan2(tx, tz);
      _q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      _m.compose(_p.set(x, t * tierH, z), _q, _s.set(1, 1, 1));
      inst.setMatrixAt(i, _m);
    }
    inst.castShadow = true;
    inst.receiveShadow = true;
    g.add(inst);
    // cornice ring between tiers
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.35, 8, 96), stone);
    ring.scale.set(a + 0.6, b + 0.6, 1);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = (t + 1) * tierH;
    g.add(ring);
  }
  // attic (solid top storey with pilasters)
  const atticGeo = new THREE.BoxGeometry(archW * 0.98, tierH * 0.8, 2.8);
  ensureUV1(atticGeo);
  const attic = new THREE.InstancedMesh(atticGeo, stone, n);
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    const x = Math.cos(th) * a;
    const z = Math.sin(th) * b;
    const rotY = Math.atan2(-Math.sin(th) * a, Math.cos(th) * b);
    _q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    _m.compose(_p.set(x, tiers * tierH + tierH * 0.4, z), _q, _s.set(1, 1, 1));
    attic.setMatrixAt(i, _m);
  }
  attic.castShadow = true;
  attic.receiveShadow = true;
  g.add(attic);
  // arena floor & inner seating bowl
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.55, tiers * tierH * 0.9, 64, 1, true), stone);
  bowl.scale.set(a - 4, 1, b - 4);
  bowl.position.y = (tiers * tierH * 0.9) / 2;
  bowl.material = stone;
  g.add(bowl);
  const arena = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshStandardMaterial({ color: 0xc9a86a, roughness: 1 }));
  arena.rotation.x = -Math.PI / 2;
  arena.scale.set(a * 0.55, b * 0.55, 1);
  arena.position.y = 0.05;
  arena.receiveShadow = true;
  g.add(arena);
  g.position.set(...position);
  return g;
}

export function createAqueduct(stone, { length = 90, arches = 14, h = 9, position = [0, 0, -40], rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const w = length / arches;
  const geo = archModuleGeometry(w, h, 3.2, w * 0.32);
  const inst = new THREE.InstancedMesh(geo, stone, arches);
  for (let i = 0; i < arches; i++) {
    _m.compose(_p.set(-length / 2 + w * (i + 0.5), 0, 0), _q.identity(), _s.set(1, 1, 1));
    inst.setMatrixAt(i, _m);
  }
  inst.castShadow = true;
  inst.receiveShadow = true;
  g.add(inst);
  g.add(box(length, 1.4, 3.6, stone, 0, h + 0.7, 0)); // water channel
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

/* ------------------------------------------------------------------ CASTLE */
export function createCastle(blockMat, slateMat, { size = 34, wallH = 9, towerR = 4.2, towerH = 15, position = [0, 0, 0] } = {}) {
  const g = new THREE.Group();
  const half = size / 2;
  // curtain walls
  const walls = [
    [0, -half, size, 0],
    [0, half, size, 0],
    [-half, 0, size, Math.PI / 2],
    [half, 0, size, Math.PI / 2],
  ];
  const merlonGeo = new THREE.BoxGeometry(1.1, 1.2, 1.4);
  ensureUV1(merlonGeo);
  const merlons = [];
  walls.forEach(([x, z, len, rot]) => {
    const w = box(len, wallH, 2.6, blockMat, x, wallH / 2, z);
    w.rotation.y = rot;
    g.add(w);
    const n = Math.floor(len / 2.4);
    for (let i = 0; i < n; i++) {
      const t = -len / 2 + 2.4 * (i + 0.5);
      const px = rot === 0 ? x + t : x;
      const pz = rot === 0 ? z : z + t;
      merlons.push([px, wallH + 0.6, pz, rot]);
    }
  });
  const merlonInst = new THREE.InstancedMesh(merlonGeo, blockMat, merlons.length);
  merlons.forEach(([x, y, z, rot], i) => {
    _q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot);
    _m.compose(_p.set(x, y, z), _q, _s.set(1, 1, 1));
    merlonInst.setMatrixAt(i, _m);
  });
  merlonInst.castShadow = true;
  g.add(merlonInst);
  // corner towers + keep
  const towerGeo = new THREE.CylinderGeometry(towerR, towerR * 1.08, towerH, 28);
  ensureUV1(towerGeo);
  const roofGeo = new THREE.ConeGeometry(towerR * 1.25, towerR * 1.9, 28);
  [[-half, -half], [half, -half], [-half, half], [half, half], [0, 0]].forEach(([x, z], i) => {
    const keep = i === 4;
    const t = new THREE.Mesh(towerGeo, blockMat);
    t.position.set(x, towerH / 2, z);
    if (keep) t.scale.set(1.9, 1.35, 1.9);
    t.castShadow = true;
    t.receiveShadow = true;
    g.add(t);
    const r = new THREE.Mesh(roofGeo, slateMat);
    r.position.set(x, towerH * (keep ? 1.35 : 1) + towerR * 0.95 * (keep ? 1.9 : 1), z);
    if (keep) r.scale.set(1.9, 1.9, 1.9);
    r.castShadow = true;
    g.add(r);
  });
  // gatehouse
  const gate = archModuleGeometry(7, wallH + 2.5, 4.4, 2.2);
  const gm = new THREE.Mesh(gate, blockMat);
  gm.position.set(0, 0, half);
  gm.castShadow = true;
  gm.receiveShadow = true;
  g.add(gm);
  g.position.set(...position);
  return g;
}

/* ------------------------------------------------------------------ INDUSTRIAL MILL + CHIMNEYS + RAILS */
export function createFactory(brick, iron, { position = [0, 0, -26], rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const hall = box(42, 12, 20, brick, 0, 6, 0);
  g.add(hall);
  // saw-tooth roof
  for (let i = 0; i < 6; i++) {
    const r = box(7, 0.4, 20.4, iron, -17.5 + i * 7, 12.9 + 1.4, 0);
    r.rotation.z = -0.4;
    g.add(r);
    const glass = box(0.2, 2.6, 20.2, new THREE.MeshPhysicalMaterial({ color: 0xbcd3e6, roughness: 0.1, metalness: 0, transmission: 0.7, thickness: 0.2 }), -17.5 + i * 7 - 3.3, 13.3, 0);
    g.add(glass);
  }
  // windows (dark recessed)
  const winGeo = new THREE.BoxGeometry(2.0, 3.2, 0.3);
  const winMat = new THREE.MeshStandardMaterial({ color: 0x1b2430, roughness: 0.25, metalness: 0.3, emissive: 0x6b4a12, emissiveIntensity: 0.35 });
  const wins = new THREE.InstancedMesh(winGeo, winMat, 26);
  for (let i = 0; i < 13; i++) {
    _m.compose(_p.set(-18 + i * 3, 6.5, 10.1), _q.identity(), _s.set(1, 1, 1));
    wins.setMatrixAt(i, _m);
    _m.compose(_p.set(-18 + i * 3, 6.5, -10.1), _q, _s);
    wins.setMatrixAt(13 + i, _m);
  }
  g.add(wins);
  // chimneys
  const chimGeo = new THREE.CylinderGeometry(1.3, 1.9, 30, 24);
  ensureUV1(chimGeo);
  [[-14, -6], [12, -6]].forEach(([x, z]) => {
    const c = new THREE.Mesh(chimGeo, brick);
    c.position.set(x, 15, z);
    c.castShadow = true;
    c.receiveShadow = true;
    g.add(c);
  });
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

export function createRailway(iron, wood, { length = 120, position = [0, 0, 6], rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const gauge = 1.435;
  // Crushed stone gravel ballast embankment bed
  const ballastMat = new THREE.MeshStandardMaterial({ color: 0x544e48, roughness: 0.95, metalness: 0.05 });
  const ballast = box(3.4, 0.14, length, ballastMat, 0, 0.04, 0);
  g.add(ballast);

  const railSteel = new THREE.MeshStandardMaterial({ color: 0x383c42, roughness: 0.32, metalness: 0.88 });
  [-gauge / 2, gauge / 2].forEach((x) => {
    const rail = box(0.08, 0.16, length, railSteel, x, 0.26, 0);
    g.add(rail);
    g.add(box(0.15, 0.035, length, iron, x, 0.185, 0));
  });
  const tieGeo = new THREE.BoxGeometry(2.65, 0.16, 0.26);
  ensureUV1(tieGeo);
  const n = Math.floor(length / 0.68);
  const ties = new THREE.InstancedMesh(tieGeo, wood, n);
  for (let i = 0; i < n; i++) {
    _m.compose(_p.set(0, 0.11, -length / 2 + i * 0.68), _q.identity(), _s.set(1, 1, 1));
    ties.setMatrixAt(i, _m);
  }
  ties.receiveShadow = true;
  ties.castShadow = true;
  g.add(ties);
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

export function createSteamLocomotive(iron, brass, animCallbacks, { position = [0, 0, 6], rotationY = 0 } = {}) {
  const g = new THREE.Group();
  void iron;
  // Authentic wrought-iron & lacquered boiler black + crimson running-board trim
  const boilerIron = new THREE.MeshStandardMaterial({ color: 0x1e2226, roughness: 0.34, metalness: 0.82 });
  const smokeboxIron = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.46, metalness: 0.75 });
  const crimsonTrim = new THREE.MeshStandardMaterial({ color: 0x7c1c18, roughness: 0.42, metalness: 0.35 });
  const steelRim = new THREE.MeshStandardMaterial({ color: 0xb8c0c8, roughness: 0.22, metalness: 0.94 });

  // Main cylindrical horizontal boiler
  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(1.04, 1.04, 7.0, 36), boilerIron);
  boiler.rotation.x = Math.PI / 2;
  boiler.position.set(0, 2.22, 0.9);
  boiler.castShadow = boiler.receiveShadow = true;
  g.add(boiler);

  // Gleaming brass boiler bands (straps)
  [-1.8, -0.4, 1.0, 2.4, 3.8].forEach((zPos) => {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.055, 0.024, 10, 36), brass);
    band.position.set(0, 2.22, zPos);
    band.castShadow = true;
    g.add(band);
  });

  // Riveted front smokebox + hinged smokebox door with central locking wheel
  const smokebox = new THREE.Mesh(new THREE.CylinderGeometry(1.09, 1.09, 1.45, 36), smokeboxIron);
  smokebox.rotation.x = Math.PI / 2;
  smokebox.position.set(0, 2.22, 4.95);
  smokebox.castShadow = true;
  g.add(smokebox);

  const doorFront = new THREE.Mesh(new THREE.SphereGeometry(1.02, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.32), smokeboxIron);
  doorFront.rotation.x = Math.PI / 2;
  doorFront.position.set(0, 2.22, 4.82);
  g.add(doorFront);

  // Tall flared chimney smokestack with brass coronet lip
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 1.95, 24), smokeboxIron);
  stack.position.set(0, 4.02, 4.75);
  stack.castShadow = true;
  g.add(stack);
  const stackCrown = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.055, 12, 28), brass);
  stackCrown.rotation.x = Math.PI / 2;
  stackCrown.position.set(0, 4.98, 4.75);
  g.add(stackCrown);

  // Polished brass steam dome + safety valve whistle column
  const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.58, 0.45, 24), brass);
  domeBase.position.set(0, 3.25, 1.5);
  const domeTop = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 16), brass);
  domeTop.position.set(0, 3.48, 1.5);
  const whistle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.65, 16), brass);
  whistle.position.set(0, 3.45, -0.6);
  g.add(domeBase, domeTop, whistle);

  // Twin external high-pressure steam cylinders & reciprocating steel piston rods
  const pistons = [];
  [-1.32, 1.32].forEach((x) => {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 1.35, 20), boilerIron);
    cyl.rotation.x = Math.PI / 2;
    cyl.position.set(x, 0.92, 4.35);
    cyl.castShadow = true;
    g.add(cyl);

    const cylCap = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 20), brass);
    cylCap.rotation.x = Math.PI / 2;
    cylCap.position.set(x, 0.92, 5.04);
    g.add(cylCap);

    const pistonRod = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.2, 12), steelRim);
    pistonRod.rotation.x = Math.PI / 2;
    pistonRod.position.set(x, 0.90, 2.8);
    g.add(pistonRod);
    pistons.push(pistonRod);
  });

  // Engineer's cab with arched lookouts, overhanging roof & warm glowing firebox interior
  g.add(box(2.65, 1.35, 2.4, boilerIron, 0, 1.85, -3.4));
  g.add(box(2.65, 1.35, 0.18, boilerIron, 0, 3.15, -2.28));
  [-1.24, 1.24].forEach((x) => {
    g.add(box(0.18, 1.35, 2.4, boilerIron, x, 3.15, -3.4));
  });
  // Overhanging arched cab roof
  g.add(box(2.9, 0.18, 2.9, smokeboxIron, 0, 3.92, -3.45));
  // Glowing coal firebox door inside the cab
  const fireboxGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 20),
    new THREE.MeshStandardMaterial({ color: 0xff6a14, emissive: 0xff4500, emissiveIntensity: 4.2 })
  );
  fireboxGlow.rotation.y = Math.PI;
  fireboxGlow.position.set(0, 1.85, -2.52);
  g.add(fireboxGlow);
  const fireLight = new THREE.PointLight(0xff6a18, 18, 8, 1.6);
  fireLight.position.set(0, 1.9, -2.9);
  g.add(fireLight);

  // Chassis frame + crimson running boards
  g.add(box(2.2, 0.36, 10.6, smokeboxIron, 0, 1.05, 0.4));
  g.add(box(2.68, 0.10, 10.8, crimsonTrim, 0, 1.24, 0.4));

  // Wheels: 3 large spoked driving wheels + 2 leading pilot wheels per side
  const bigWheel = new THREE.CylinderGeometry(0.9, 0.9, 0.22, 32);
  const smallWheel = new THREE.CylinderGeometry(0.45, 0.45, 0.2, 24);
  const wheels = [];
  const rods = [];
  [-1.25, 1.25].forEach((x, sideIdx) => {
    [-2.6, -0.6, 1.4].forEach((z) => {
      const w = new THREE.Mesh(bigWheel, boilerIron);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.9, z);
      w.castShadow = true;
      g.add(w);
      wheels.push(w);
      // Steel tire rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.89, 0.045, 10, 32), steelRim);
      rim.rotation.y = Math.PI / 2;
      w.add(rim);
      // Radial brass/iron spokes + crescent counterweight
      for (let s = 0; s < 10; s++) {
        const sp = box(0.07, 1.62, 0.06, brass, 0, 0, 0);
        sp.rotation.x = (s / 10) * Math.PI;
        w.add(sp);
      }
    });
    [3.5, 4.65].forEach((z) => {
      const w = new THREE.Mesh(smallWheel, boilerIron);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.45, z);
      w.castShadow = true;
      g.add(w);
      wheels.push(w);
    });
    // Articulated side coupling rod + eccentric main rod
    const rod = box(0.10, 0.14, 4.2, steelRim, x * 1.12, 0.72, -0.6);
    g.add(rod);
    rods.push({ mesh: rod, phaseOffset: sideIdx * Math.PI * 0.5 });
  });

  // Slatted iron cowcatcher (pilot) at front
  const cc = box(2.4, 0.95, 0.22, smokeboxIron, 0, 0.58, 5.95);
  cc.rotation.x = 0.58;
  g.add(cc);

  // Brass oil/gas headlamp + volumetric beam
  const lampHousing = box(0.52, 0.58, 0.48, brass, 0, 3.15, 5.65);
  g.add(lampHousing);
  const lamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.12, 20),
    new THREE.MeshStandardMaterial({ color: 0xfff4d0, emissive: 0xffd27a, emissiveIntensity: 3.2 })
  );
  lamp.rotation.x = Math.PI / 2;
  lamp.position.set(0, 3.15, 5.90);
  g.add(lamp);
  const light = new THREE.SpotLight(0xffe0a0, 120, 60, 0.35, 0.6, 1.6);
  light.position.set(0, 3.15, 5.95);
  light.target.position.set(0, 1.2, 40);
  g.add(light, light.target);

  // Coal & water tender car behind cab with heaped irregular coal mound
  g.add(box(2.58, 2.05, 4.2, boilerIron, 0, 2.02, -6.9));
  g.add(box(2.68, 0.12, 4.3, crimsonTrim, 0, 1.02, -6.9));
  const coalMat = new THREE.MeshStandardMaterial({ color: 0x121214, roughness: 0.75, metalness: 0.2 });
  const coalMound = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 1), coalMat);
  coalMound.scale.set(0.95, 0.48, 1.45);
  coalMound.position.set(0, 3.12, -6.8);
  g.add(coalMound);

  [-1.25, 1.25].forEach((x) =>
    [-5.6, -8.2].forEach((z) => {
      const w = new THREE.Mesh(smallWheel, boilerIron);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.45, z);
      w.castShadow = true;
      g.add(w);
      wheels.push(w);
    })
  );
  g.position.set(...position);
  g.rotation.y = rotationY;
  animCallbacks.push((t) => {
    const wAngle = t * 2.4;
    wheels.forEach((w) => {
      w.rotation.x = wAngle;
    });
    rods.forEach(({ mesh, phaseOffset }) => {
      mesh.position.y = 0.72 + Math.sin(wAngle + phaseOffset) * 0.24;
      mesh.position.z = -0.6 + Math.cos(wAngle + phaseOffset) * 0.24;
    });
    pistons.forEach((p, idx) => {
      p.position.z = 2.8 + Math.cos(wAngle + idx * Math.PI * 0.5) * 0.28;
    });
  });
  return g;
}

/* ------------------------------------------------------------------ CITY TOWERS (night) */
export function createCityTowers(animCallbacks, { count = 26, ring = [26, 70], minH = 18, maxH = 70, seed = 5, glassColor = 0x1a2a3c } = {}) {
  const g = new THREE.Group();
  const rng = makeRNG(seed);
  // emissive window texture
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, 128, 256);
  for (let y = 4; y < 256; y += 8) for (let x = 4; x < 128; x += 8) {
    if (Math.random() < 0.55) {
      const warm = Math.random() < 0.6;
      ctx.fillStyle = warm ? `rgba(255,${200 + Math.floor(Math.random() * 40)},150,${0.5 + Math.random() * 0.5})` : `rgba(170,220,255,${0.4 + Math.random() * 0.6})`;
      ctx.fillRect(x, y, 4, 5);
    }
  }
  const winTex = new THREE.CanvasTexture(c);
  winTex.colorSpace = THREE.SRGBColorSpace;
  winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  for (let i = 0; i < count; i++) {
    const ang = rng() * Math.PI * 2;
    const r = ring[0] + rng() * (ring[1] - ring[0]);
    const h = minH + rng() * (maxH - minH);
    const w = 6 + rng() * 10;
    const d = 6 + rng() * 10;
    const tex = winTex.clone();
    tex.repeat.set(Math.round(w / 3), Math.round(h / 3));
    tex.needsUpdate = true;
    const mat = new THREE.MeshStandardMaterial({ color: glassColor, roughness: 0.25, metalness: 0.6, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 1.4 });
    const t = box(w, h, d, mat, Math.cos(ang) * r, h / 2, Math.sin(ang) * r);
    t.rotation.y = rng() * Math.PI;
    g.add(t);
    if (rng() < 0.3) {
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3030 }));
      beacon.position.set(t.position.x, h + 0.4, t.position.z);
      beacon.userData.phase = rng() * 6.28;
      g.add(beacon);
    }
  }
  animCallbacks.push((t) => {
    g.children.forEach((ch) => {
      if (ch.userData.phase !== undefined) ch.visible = Math.sin(t * 2 + ch.userData.phase) > 0;
    });
  });
  return g;
}

/* ------------------------------------------------------------------ WIND TURBINES / SOLAR */
export function createWindTurbine(animCallbacks, { position = [0, 0, 0], height = 28, bladeLen = 12 } = {}) {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.45, metalness: 0.1 });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.6, height, 20), white);
  tower.position.y = height / 2;
  tower.castShadow = true;
  g.add(tower);
  const nacelle = box(3.2, 1.8, 1.8, white, 0, height, 0.4);
  g.add(nacelle);
  const hub = new THREE.Group();
  hub.position.set(0, height, 1.5);
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.5, bladeLen, 0.12), white);
    blade.geometry.translate(0, bladeLen / 2, 0);
    blade.rotation.z = (i * Math.PI * 2) / 3;
    blade.castShadow = true;
    hub.add(blade);
  }
  g.add(hub);
  g.position.set(...position);
  const phase = Math.random() * 6;
  animCallbacks.push((t) => {
    hub.rotation.z = t * 1.1 + phase;
  });
  return g;
}

export function createSolarArray({ position = [0, 0, 0], rows = 4, cols = 8, rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const panel = new THREE.BoxGeometry(2.0, 0.06, 1.2);
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x0e1b3a, roughness: 0.15, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.08 });
  const inst = new THREE.InstancedMesh(panel, mat, rows * cols);
  let i = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    _q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.5);
    _m.compose(_p.set(c * 2.2 - cols * 1.1, 0.9, r * 2.6 - rows * 1.3), _q, _s.set(1, 1, 1));
    inst.setMatrixAt(i++, _m);
  }
  inst.castShadow = true;
  inst.receiveShadow = true;
  g.add(inst);
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

/* ------------------------------------------------------------------ GLASS BIODOME (Mars / solarpunk) */
export function createBiodome({ position = [0, 0, 0], radius = 9, tint = 0xcfe8ff } = {}) {
  const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: tint, roughness: 0.05, metalness: 0, transmission: 0.92, thickness: 0.6, ior: 1.45, transparent: true, opacity: 1, side: THREE.DoubleSide, envMapIntensity: 1.2 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), glass);
  dome.renderOrder = 30;
  g.add(dome);
  // geodesic frame
  const frame = new THREE.Mesh(new THREE.IcosahedronGeometry(radius * 1.005, 2), new THREE.MeshStandardMaterial({ color: 0xdfe6ee, roughness: 0.3, metalness: 0.9, wireframe: true }));
  g.add(frame);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.35, 12, 64), new THREE.MeshStandardMaterial({ color: 0xcfd6dd, roughness: 0.35, metalness: 0.9 }));
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  g.position.set(...position);
  return g;
}

/* ------------------------------------------------------------------ DYSON SWARM + O'NEILL CYLINDER */
export function createDysonSwarm(animCallbacks, { count = 1400, inner = 14, outer = 30 } = {}) {
  const geo = new THREE.PlaneGeometry(1.2, 1.2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x111418, roughness: 0.15, metalness: 1.0, side: THREE.DoubleSide, emissive: 0x3a2a08, emissiveIntensity: 0.4 });
  const inst = new THREE.InstancedMesh(geo, mat, count);
  const rng = makeRNG(11);
  const items = [];
  for (let i = 0; i < count; i++) {
    const r = inner + Math.sqrt(rng()) * (outer - inner);
    const inc = (rng() - 0.5) * 0.5;
    const ph = rng() * Math.PI * 2;
    items.push({ r, inc, ph, w: 0.12 / Math.sqrt(r / inner) });
  }
  animCallbacks.push((t) => {
    for (let i = 0; i < count; i++) {
      const it = items[i];
      const a = it.ph + t * it.w;
      _p.set(Math.cos(a) * it.r, Math.sin(a) * it.r * Math.sin(it.inc), Math.sin(a) * it.r * Math.cos(it.inc));
      _q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), _p.clone().normalize());
      _m.compose(_p, _q, _s.set(1, 1, 1));
      inst.setMatrixAt(i, _m);
    }
    inst.instanceMatrix.needsUpdate = true;
  });
  inst.frustumCulled = false;
  return inst;
}

export function createONeillCylinder(animCallbacks, { position = [0, 0, 0], length = 26, radius = 4 } = {}) {
  const g = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({ color: 0xc9ced4, roughness: 0.35, metalness: 0.85 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 48, 1), hull);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  // window strips (3 land strips / 3 window strips)
  const win = new THREE.MeshStandardMaterial({ color: 0x9fd8ff, emissive: 0x7fc4ff, emissiveIntensity: 1.6, roughness: 0.1, metalness: 0.2 });
  for (let i = 0; i < 3; i++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(length * 0.86, 0.3, radius * 0.7), win);
    strip.position.y = radius * 1.001;
    const pivot = new THREE.Group();
    pivot.rotation.x = (i * Math.PI * 2) / 3;
    pivot.add(strip);
    body.add(pivot);
    pivot.rotation.z = 0;
  }
  // end caps + mirrors
  [-1, 1].forEach((s) => {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.02, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), hull);
    cap.position.x = (s * length) / 2;
    cap.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(cap);
  });
  g.position.set(...position);
  animCallbacks.push((t) => {
    body.rotation.x = t * 0.25;
  });
  return g;
}

/* ------------------------------------------------------------------ APOLLO LUNAR MODULE (simplified, true proportions) */
export function createLunarModule({ position = [0, 0, 0], rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd4a231, roughness: 0.32, metalness: 1.0, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xbfc4c9, roughness: 0.3, metalness: 0.95 });
  const black = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.2 });
  // descent stage (octagon)
  const desc = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 1.65, 8), gold);
  desc.position.y = 1.5;
  desc.castShadow = true;
  g.add(desc);
  // legs
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.6, 10), silver);
    leg.position.set(Math.cos(a) * 3.0, 1.0, Math.sin(a) * 3.0);
    leg.lookAt(Math.cos(a) * 1.6, 2.2, Math.sin(a) * 1.6);
    leg.rotateX(Math.PI / 2);
    leg.castShadow = true;
    g.add(leg);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 20), silver);
    pad.position.set(Math.cos(a) * 3.9, 0.06, Math.sin(a) * 3.9);
    g.add(pad);
  }
  // ascent stage
  const asc = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.9, 2.4), silver);
  asc.position.y = 3.3;
  asc.castShadow = true;
  g.add(asc);
  const cabin = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.6, 10), silver);
  cabin.rotation.x = Math.PI / 2;
  cabin.position.set(0, 3.4, 1.2);
  g.add(cabin);
  const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.05), black);
  win1.position.set(-0.6, 3.6, 2.02);
  win1.rotation.z = 0.5;
  g.add(win1);
  const win2 = win1.clone();
  win2.position.x = 0.6;
  win2.rotation.z = -0.5;
  g.add(win2);
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.05), black);
  hatch.position.set(0, 3.0, 2.02);
  g.add(hatch);
  // antenna dish
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), silver);
  dish.position.set(1.1, 4.6, -0.6);
  dish.rotation.x = -0.9;
  g.add(dish);
  // ladder
  for (let i = 0; i < 7; i++) g.add(box(0.5, 0.04, 0.04, silver, 2.1, 0.5 + i * 0.4, 2.1));
  // flag
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 8), silver);
  pole.position.set(-5, 1.2, 3);
  g.add(pole);
  const flagCanvas = document.createElement('canvas');
  flagCanvas.width = 128;
  flagCanvas.height = 72;
  const fc = flagCanvas.getContext('2d');
  for (let i = 0; i < 13; i++) {
    fc.fillStyle = i % 2 === 0 ? '#b22234' : '#ffffff';
    fc.fillRect(0, (i * 72) / 13, 128, 72 / 13 + 1);
  }
  fc.fillStyle = '#3c3b6e';
  fc.fillRect(0, 0, 52, 39);
  fc.fillStyle = '#fff';
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) fc.fillRect(4 + c * 8, 4 + r * 7, 2, 2);
  const flagTex = new THREE.CanvasTexture(flagCanvas);
  flagTex.colorSpace = THREE.SRGBColorSpace;
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.84), new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.9 }));
  flag.position.set(-4.24, 2.0, 3);
  g.add(flag);
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

/* ------------------------------------------------------------------ SMARTPHONE (true 2007 iPhone proportions) */
export function createSmartphone({ position = [0, 0, 0], scale = 8, rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const w = 0.0611 * scale;
  const h = 0.115 * scale;
  const d = 0.0116 * scale;
  const shape = new THREE.Shape();
  const r = w * 0.12;
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: d * 0.2, bevelSize: d * 0.2, bevelSegments: 4 }), new THREE.MeshPhysicalMaterial({ color: 0x15171a, roughness: 0.28, metalness: 0.85, clearcoat: 1, clearcoatRoughness: 0.1 }));
  body.castShadow = true;
  g.add(body);
  // screen (emissive app grid)
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 480;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 480);
  grad.addColorStop(0, '#0f3d7a');
  grad.addColorStop(1, '#06162b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 320, 480);
  const colors = ['#34c759', '#ff9500', '#5ac8fa', '#ff2d55', '#af52de', '#ffcc00', '#007aff', '#ff3b30', '#8e8e93', '#30b0c7', '#a2845e', '#64d2ff'];
  for (let i = 0; i < 12; i++) {
    const x = 28 + (i % 4) * 72;
    const y = 60 + Math.floor(i / 4) * 86;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.roundRect(x, y, 56, 56, 12);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(0, 400, 320, 80);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.86, h * 0.72), new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 1.3, roughness: 0.1, metalness: 0 }));
  screen.position.set(0, 0, d * 1.21);
  g.add(screen);
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

/* ------------------------------------------------------------------ 1. CMB ANISOTROPY SHELL & BAO RINGS (Big Bang, t < 1 s → 380,000 yrs) */
export function createCMBFluctuationShell(animCallbacks, { radius = 140 } = {}) {
  const g = new THREE.Group();
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  const rng = makeRNG(138);
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#120826');
  grad.addColorStop(0.5, '#28113b');
  grad.addColorStop(1, '#120826');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);
  // Planck/WMAP-style acoustic multipole temperature fluctuations (ΔT/T ~ 10^-5)
  for (let i = 0; i < 420; i++) {
    const x = rng() * 512;
    const y = rng() * 256;
    const r = 8 + rng() * 28;
    const warm = rng() > 0.48;
    const rg = ctx.createRadialGradient(x, y, 1, x, y, r);
    rg.addColorStop(0, warm ? 'rgba(255,145,55,0.28)' : 'rgba(56,189,248,0.26)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 32),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, transparent: true, opacity: 0.55 })
  );
  g.add(shell);

  // Baryon Acoustic Oscillation (BAO) sound-horizon wave rings
  const baoGroup = new THREE.Group();
  [18, 28, 40].forEach((r, idx) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.08, 12, 96),
      new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0xffb36b : 0x6bc5ff, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending })
    );
    ring.rotation.x = Math.PI / 2 + (idx - 1) * 0.22;
    baoGroup.add(ring);
  });
  g.add(baoGroup);

  animCallbacks.push((t) => {
    shell.rotation.y = t * 0.015;
    baoGroup.children.forEach((ring, idx) => {
      const s = 1 + 0.06 * Math.sin(t * 0.9 + idx * 1.4);
      ring.scale.setScalar(s);
    });
  });
  return g;
}

/* ------------------------------------------------------------------ 6. CAMBRIAN TRILOBITE (Paradoxides) & PIKAIA CHORDATE */
export function createTrilobite(animCallbacks, { position = [0, 0, 0], scale = 1.0, rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const chitin = new THREE.MeshStandardMaterial({ color: 0x6e472b, roughness: 0.42, metalness: 0.18 });
  const darkChitin = new THREE.MeshStandardMaterial({ color: 0x3d2514, roughness: 0.5, metalness: 0.15 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xd8f0ff, emissive: 0x4aa8d8, emissiveIntensity: 0.4, roughness: 0.15, metalness: 0.5 });

  // Cephalon (head shield + genal spines)
  const ceph = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), chitin);
  ceph.scale.set(1.25, 0.55, 0.95);
  ceph.position.set(0, 0.08, 0.48);
  ceph.castShadow = true;
  g.add(ceph);

  // Calcite compound eyes (first complex eyes in Earth history)
  [-0.24, 0.24].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), eyeMat);
    eye.scale.set(0.7, 0.8, 1.4);
    eye.position.set(x, 0.22, 0.52);
    g.add(eye);
    // Genal spine
    const spine = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.55, 8), darkChitin);
    spine.rotation.x = -Math.PI * 0.48;
    spine.rotation.z = x > 0 ? -0.18 : 0.18;
    spine.position.set(x * 1.95, 0.09, 0.18);
    g.add(spine);
    // Segmented antenna
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.018, 0.65, 8), darkChitin);
    ant.rotation.x = Math.PI * 0.46;
    ant.rotation.z = x > 0 ? -0.35 : 0.35;
    ant.position.set(x * 0.9, 0.1, 0.88);
    g.add(ant);
  });

  // 12 Three-lobed thoracic segments (axial lobe + left/right pleural lobes)
  const segments = [];
  for (let i = 0; i < 12; i++) {
    const u = i / 11;
    const w = (1 - u * 0.48) * 0.46;
    const seg = new THREE.Group();
    seg.position.set(0, 0.08, 0.26 - i * 0.075);
    const axial = new THREE.Mesh(new THREE.SphereGeometry(w * 0.38, 12, 8), darkChitin);
    axial.scale.set(1.0, 0.65, 0.45);
    axial.position.y = 0.06;
    seg.add(axial);
    [-1, 1].forEach((side) => {
      const pleura = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.045, 0.06), chitin);
      pleura.position.set(side * w * 0.65, 0.03, 0);
      pleura.rotation.z = -side * 0.22;
      seg.add(pleura);
    });
    g.add(seg);
    segments.push(seg);
  }

  g.scale.setScalar(scale);
  g.position.set(...position);
  g.rotation.y = rotationY;
  animCallbacks.push((t) => {
    segments.forEach((seg, idx) => {
      seg.position.y = 0.08 + Math.sin(t * 4.2 - idx * 0.45) * 0.012;
      seg.rotation.z = Math.sin(t * 4.2 - idx * 0.45) * 0.05;
    });
  });
  return g;
}

export function createPikaiaSwimmer(animCallbacks, { position = [0, 2, 0], scale = 1.0, rotationY = 0, phase = 0 } = {}) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xc8d8e8, emissive: 0x264868, emissiveIntensity: 0.35, roughness: 0.25, transmission: 0.45, transparent: true, opacity: 0.88 });
  const chordMat = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffa834, emissiveIntensity: 0.8, roughness: 0.3 });

  const nodes = [];
  for (let i = 0; i < 16; i++) {
    const u = i / 15;
    const h = Math.sin(u * Math.PI) * 0.16 + 0.025;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.028, h, 0.09), bodyMat);
    seg.position.z = (0.5 - u) * 1.35;
    // Dorsal notochord stripe (earliest chordate stiffening rod!)
    const chord = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.022, 0.085), chordMat);
    chord.position.y = h * 0.32;
    seg.add(chord);
    g.add(seg);
    nodes.push(seg);
  }
  g.scale.setScalar(scale);
  g.position.set(...position);
  g.rotation.y = rotationY;
  animCallbacks.push((t) => {
    nodes.forEach((n, idx) => {
      n.position.x = Math.sin(t * 5.2 + phase - idx * 0.38) * 0.09 * (idx / 15 + 0.2);
      n.rotation.y = Math.cos(t * 5.2 + phase - idx * 0.38) * 0.22;
    });
    g.position.y = position[1] + Math.sin(t * 1.4 + phase) * 0.14;
  });
  return g;
}

/* ------------------------------------------------------------------ 7. DEVONIAN TIKTAALIK ROSEAE (375 MYA Lobe-Finned Tetrapodomorph) */
export function createTiktaalik(animCallbacks, { position = [0, 0, 0], scale = 1.0, rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0x5c6648, roughness: 0.55, metalness: 0.08 });
  const belly = new THREE.MeshStandardMaterial({ color: 0x9ca07e, roughness: 0.65 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a14, roughness: 0.15, metalness: 0.4 });

  // Flat triangular crocodilian skull with dorsal eyes & spiracles
  const skull = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.82, 12), skin);
  skull.rotation.x = Math.PI / 2;
  skull.scale.set(1.35, 0.42, 1.0);
  skull.position.set(0, 0.28, 0.92);
  skull.castShadow = true;
  g.add(skull);

  [-0.12, 0.12].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), eyeMat);
    eye.position.set(x, 0.39, 0.78);
    g.add(eye);
  });

  // Mobile neck + ribcage torso + tapering tail fin
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 1.35, 16), skin);
  torso.rotation.x = Math.PI / 2;
  torso.scale.set(1.2, 0.72, 1.0);
  torso.position.set(0, 0.24, 0.0);
  torso.castShadow = true;
  g.add(torso);

  const under = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 1.28, 12), belly);
  under.rotation.x = Math.PI / 2;
  under.scale.set(1.1, 0.45, 1.0);
  under.position.set(0, 0.15, 0.0);
  g.add(under);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.15, 12), skin);
  tail.rotation.x = -Math.PI / 2;
  tail.scale.set(0.45, 1.1, 1.0);
  tail.position.set(0, 0.22, -1.15);
  tail.castShadow = true;
  g.add(tail);

  // 4 Muscular wristed lobe-fins / early tetrapod limbs pushing up on the mudbank
  const limbs = [];
  [
    [-0.34, 0.14, 0.36, 1],
    [0.34, 0.14, 0.36, -1],
    [-0.28, 0.12, -0.38, -1],
    [0.28, 0.12, -0.38, 1],
  ].forEach(([lx, ly, lz, dir]) => {
    const limb = new THREE.Group();
    limb.position.set(lx, ly, lz);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.28, 10), skin);
    upper.rotation.z = lx < 0 ? 0.65 : -0.65;
    limb.add(upper);
    const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.045, 0.18), belly);
    paddle.position.set(lx < 0 ? -0.14 : 0.14, -0.1, 0.04);
    limb.add(paddle);
    limb.userData.dir = dir;
    g.add(limb);
    limbs.push(limb);
  });

  g.scale.setScalar(scale);
  g.position.set(...position);
  g.rotation.y = rotationY;
  animCallbacks.push((t) => {
    skull.position.y = 0.28 + Math.sin(t * 2.2) * 0.025;
    skull.rotation.y = Math.sin(t * 1.5) * 0.08;
    tail.rotation.y = Math.sin(t * 3.0) * 0.18;
    limbs.forEach((l) => {
      l.rotation.x = Math.sin(t * 2.5) * 0.22 * l.userData.dir;
    });
  });
  return g;
}

/* ------------------------------------------------------------------ 12. MIOCENE QUADRUPEDAL HOMINOID (Proconsul africanus, 20 MYA) */
export function createProconsulApe(animCallbacks, { position = [0, 0, 0], scale = 1.0, rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.82 });
  const skin = new THREE.MeshStandardMaterial({ color: 0x724e36, roughness: 0.6 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x563d26, roughness: 0.9 });

  // Fallen Miocene forest branch perch
  const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.6, 12), wood);
  branch.rotation.z = Math.PI / 2 - 0.12;
  branch.position.set(0, 0.28, 0);
  branch.castShadow = branch.receiveShadow = true;
  g.add(branch);

  // Quadrupedal ape body (tailless hominoid, horizontal/inclined torso on all fours)
  const ape = new THREE.Group();
  ape.position.set(0, 0.62, 0);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.56, 14), fur);
  torso.rotation.z = -Math.PI / 2 + 0.38;
  torso.castShadow = true;
  ape.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 14), fur);
  head.position.set(0.30, 0.18, 0);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), skin);
  muzzle.position.set(0.08, -0.02, 0);
  head.add(muzzle);
  ape.add(head);

  // Forelimbs & hindlimbs gripping the branch
  [
    [0.20, -0.16, 0.09],
    [0.20, -0.16, -0.09],
    [-0.22, -0.18, 0.09],
    [-0.22, -0.18, -0.09],
  ].forEach(([lx, ly, lz]) => {
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.36, 10), fur);
    limb.position.set(lx, ly, lz);
    limb.castShadow = true;
    ape.add(limb);
  });

  g.add(ape);
  g.scale.setScalar(scale);
  g.position.set(...position);
  g.rotation.y = rotationY;
  animCallbacks.push((t) => {
    head.rotation.y = Math.sin(t * 1.6) * 0.25;
    head.rotation.z = Math.sin(t * 2.1) * 0.08;
    ape.position.y = 0.62 + Math.sin(t * 2.4) * 0.012;
  });
  return g;
}

/* ------------------------------------------------------------------ 16. UPPER PALEOLITHIC OCHRE CAVE MURAL, LION-MAN & BONE FLUTE */
export function createPaleolithicCaveMural({ position = [0, 2.2, -3.5], rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');

  // Warm limestone & iron-oxide rock background
  const bg = ctx.createRadialGradient(512, 256, 60, 512, 256, 560);
  bg.addColorStop(0, '#5a4332');
  bg.addColorStop(0.7, '#3d2c20');
  bg.addColorStop(1, '#221811');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 512);

  // Blown red-ochre negative hand stencils (Chauvet / Sulawesi / El Castillo style, ~45k–40k YA)
  const drawHandStencil = (hx, hy, rot) => {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(rot);
    const hg = ctx.createRadialGradient(0, 0, 14, 0, 0, 62);
    hg.addColorStop(0, 'rgba(65,45,32,0.95)');
    hg.addColorStop(0.45, 'rgba(185,52,24,0.85)');
    hg.addColorStop(1, 'rgba(185,52,24,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.fill();
    // Negative palm & 5 fingers
    ctx.fillStyle = '#4e392a';
    ctx.beginPath();
    ctx.ellipse(0, 8, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    [[-18, -14, -0.4], [-9, -24, -0.15], [0, -27, 0], [9, -24, 0.15], [19, -10, 0.5]].forEach(([fx, fy, fa]) => {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(fa);
      ctx.fillRect(-3.5, -16, 7, 22);
      ctx.restore();
    });
    ctx.restore();
  };
  drawHandStencil(170, 150, -0.2);
  drawHandStencil(260, 110, 0.15);
  drawHandStencil(840, 160, 0.25);
  drawHandStencil(760, 360, -0.1);

  // Charcoal & red-ochre running Lascaux/Chauvet Aurochs Bull & Horses
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const drawCaveHorse = (ox, oy, sc) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(168, 68, 28, 0.72)';
    ctx.strokeStyle = '#18110c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-70, 0);
    ctx.bezierCurveTo(-40, -35, 30, -30, 65, -55);
    ctx.bezierCurveTo(85, -62, 98, -42, 78, -28);
    ctx.bezierCurveTo(55, -10, 45, 22, -55, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Legs in galloping motion
    [[-50, 18, -75, 62], [-30, 18, -15, 65], [30, 15, 55, 62], [45, 12, 82, 52]].forEach(([x0, y0, x1, y1]) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    });
    ctx.restore();
  };
  drawCaveHorse(420, 250, 1.25);
  drawCaveHorse(640, 290, 0.95);
  drawCaveHorse(290, 340, 0.85);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const muralMat = new THREE.MeshStandardMaterial({
    map: tex,
    emissiveMap: tex,
    emissive: 0xff9a52,
    emissiveIntensity: 0.28,
    roughness: 0.92,
  });
  const mural = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.8, 24, 12), muralMat);
  // Subtle rock surface undulation
  const pos = mural.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 1.8) * 0.08 + Math.cos(y * 2.4) * 0.06);
  }
  mural.geometry.computeVertexNormals();
  g.add(mural);
  g.userData.muralMat = muralMat;
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

export function createPaleolithicIvoryArtifacts({ position = [2.4, 0, 1.4] } = {}) {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0x5c534a, roughness: 0.9 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xe8dec5, roughness: 0.38, metalness: 0.05 });

  // Natural flat limestone hearth slab (replaces anachronistic modern museum plinth!)
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.68, 0.28, 12), stone);
  slab.position.y = 0.14;
  slab.castShadow = slab.receiveShadow = true;
  g.add(slab);

  // Löwenmensch (Lion-Man of Hohlenstein-Stadel, 40,000 YA mammoth ivory figurine, 31 cm tall, scaled 2x for visibility)
  const lionMan = new THREE.Group();
  lionMan.position.set(-0.14, 0.28, 0);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.058, 0.38, 14), ivory);
  body.position.y = 0.26;
  lionMan.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), ivory);
  head.scale.set(0.95, 1.0, 1.25);
  head.position.set(0, 0.49, 0.02);
  lionMan.add(head);
  [-0.055, 0.055].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.14, 10), ivory);
    leg.position.set(x, 0.07, 0);
    lionMan.add(leg);
  });
  g.add(lionMan);

  // Hohle Fels Vulture-Bone Flute (40,000 YA — 5 finger holes, world's oldest musical instrument)
  const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.016, 0.36, 12), ivory);
  flute.rotation.z = Math.PI / 2 - 0.15;
  flute.rotation.y = 0.4;
  flute.position.set(0.18, 0.31, 0.08);
  g.add(flute);

  g.position.set(...position);
  return g;
}

/* ------------------------------------------------------------------ 17. BERINGIAN MAMMOTH-BONE & HIDE DWELLING (20,000 YA) */
export function createMammothBoneHut({ position = [-5.5, 0, -4.5], rotationY = 0.4 } = {}) {
  const g = new THREE.Group();
  const hideMat = new THREE.MeshStandardMaterial({ color: 0x6e5038, roughness: 0.88 });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xe2d6be, roughness: 0.45 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a5652, roughness: 0.9 });

  // Dome of stitched steppe-bison & mammoth hides
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.3, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48), hideMat);
  dome.scale.set(1.15, 0.88, 1.05);
  dome.castShadow = dome.receiveShadow = true;
  g.add(dome);

  // Interlocking curved Mammoth Tusks framing the entrance arch & roof ribs
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const tusk = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.085, 10, 28, Math.PI * 0.58), boneMat);
    tusk.rotation.y = a;
    tusk.position.y = 0.15;
    tusk.castShadow = true;
    g.add(tusk);
  }
  // Ring of mammoth mandibles & anchor boulders at base
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 1), stoneMat);
    b.position.set(Math.cos(a) * 2.55, 0.18, Math.sin(a) * 2.4);
    b.castShadow = true;
    g.add(b);
  }
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

/* ------------------------------------------------------------------ 18. GÖBEKLI TEPE T-SHAPED MEGALITHIC PILLAR & SADDLE QUERN (9600 BCE) */
export function createGobekliPillar({ position = [-5.8, 0, -2.5], rotationY = 0.35 } = {}) {
  const g = new THREE.Group();
  const limestone = new THREE.MeshStandardMaterial({ color: 0xcbbd9e, roughness: 0.82 });
  const relief = new THREE.MeshStandardMaterial({ color: 0x9e8c6c, roughness: 0.75 });

  // Upright pillar shaft + T-capital (anthropomorphic monolith)
  const shaft = box(0.65, 3.4, 0.38, limestone, 0, 1.7, 0);
  const capital = box(1.55, 0.62, 0.44, limestone, 0, 3.65, 0);
  // Carved low-relief arms & fox/vulture motif on shaft
  const armL = box(0.08, 1.2, 0.42, relief, -0.34, 2.1, 0);
  const armR = box(0.08, 1.2, 0.42, relief, 0.34, 2.1, 0);
  const belt = box(0.69, 0.14, 0.42, relief, 0, 1.35, 0);
  g.add(shaft, capital, armL, armR, belt);
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

/* ------------------------------------------------------------------ 19. BRONZE SMELTING FOUNDRY FURNACE & CODE OF HAMMURABI STELE */
export function createBronzeFoundryAndStele(animCallbacks, { position = [3.8, 0, 1.8], rotationY = -0.4 } = {}) {
  const g = new THREE.Group();
  const clay = new THREE.MeshStandardMaterial({ color: 0xa86b44, roughness: 0.85 });
  const bronze = new THREE.MeshStandardMaterial({ color: 0xc88a3c, roughness: 0.28, metalness: 0.92 });
  const molten = new THREE.MeshStandardMaterial({ color: 0xff8c1a, emissive: 0xff5500, emissiveIntensity: 2.8, roughness: 0.2 });
  const diorite = new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.25, metalness: 0.35 });

  // Clay smelting furnace + glowing molten bronze crucible
  const furnace = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.58, 1.05, 18), clay);
  furnace.position.set(0, 0.52, 0);
  furnace.castShadow = true;
  g.add(furnace);
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 16), molten);
  pool.position.set(0, 1.04, 0);
  g.add(pool);

  // Cast bronze khopesh / axe blades cooling beside the furnace
  const axe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.16), bronze);
  axe.position.set(0.75, 0.08, 0.25);
  g.add(axe);

  // Black Diorite Code of Hammurabi Stele (1750 BCE — 2.25 m tall finger-shaped basalt/diorite monument)
  const stele = new THREE.Group();
  stele.position.set(-1.6, 0, -0.6);
  const steleShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 1.85, 20), diorite);
  steleShaft.scale.set(1.0, 1.0, 0.65);
  steleShaft.position.y = 0.92;
  steleShaft.castShadow = true;
  const steleTop = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), diorite);
  steleTop.scale.set(1.0, 0.9, 0.65);
  steleTop.position.y = 1.85;
  stele.add(steleShaft, steleTop);
  g.add(stele);

  g.userData.moltenMat = molten;
  g.position.set(...position);
  g.rotation.y = rotationY;
  animCallbacks.push((t) => {
    molten.emissiveIntensity = (g.userData.superHeat ? 6.5 : 2.6) + Math.sin(t * 6.0) * 0.6;
  });
  return g;
}

/* ------------------------------------------------------------------ 20. ANTIKYTHERA ASTRONOMICAL MECHANISM (~150–100 BCE) */
export function createAntikytheraMechanism(animCallbacks, { position = [0, 0, 1.2], rotationY = 0.2 } = {}) {
  const g = new THREE.Group();
  const marble = new THREE.MeshStandardMaterial({ color: 0xa89c8a, roughness: 0.78 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x4e321c, roughness: 0.65 });
  const bronze = new THREE.MeshStandardMaterial({ color: 0xc8963e, roughness: 0.28, metalness: 0.92 });
  const verdigris = new THREE.MeshStandardMaterial({ color: 0x4f8c6e, roughness: 0.45, metalness: 0.65 });

  // Fluted marble pedestal in the Agora
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 1.05, 20), marble);
  plinth.position.y = 0.525;
  plinth.castShadow = plinth.receiveShadow = true;
  g.add(plinth);

  // Wooden & bronze instrument case
  const frame = box(0.56, 0.72, 0.24, wood, 0, 1.42, 0);
  g.add(frame);

  // Interlocking Bronze Differential Gear Train (30+ meshed gears: b1 main sun wheel, lunar anomaly pin-and-slot, Metonic/Saros dials)
  const gears = [];
  const gearSpecs = [
    [0, 1.46, 0.13, 0.21, 24, 1.0, bronze],
    [-0.14, 1.30, 0.14, 0.11, 16, -1.8, verdigris],
    [0.15, 1.29, 0.14, 0.095, 14, -2.1, bronze],
    [0.12, 1.62, 0.14, 0.085, 12, 2.4, verdigris],
    [-0.13, 1.60, 0.14, 0.075, 12, -2.6, bronze],
  ];
  gearSpecs.forEach(([gx, gy, gz, r, teeth, ratio, mat]) => {
    const wheel = new THREE.Group();
    wheel.position.set(gx, gy, gz);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.14, 8, 32), mat);
    wheel.add(rim);
    for (let i = 0; i < 4; i++) {
      const spoke = box(r * 1.9, r * 0.12, 0.015, mat, 0, 0, 0);
      spoke.rotation.z = (i * Math.PI) / 4;
      wheel.add(spoke);
    }
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const tooth = box(r * 0.16, r * 0.18, 0.02, mat, Math.cos(a) * (r * 1.12), Math.sin(a) * (r * 1.12), 0);
      tooth.rotation.z = a;
      wheel.add(tooth);
    }
    wheel.userData.ratio = ratio;
    g.add(wheel);
    gears.push(wheel);
  });

  g.userData.spinBoost = 1.0;
  g.position.set(...position);
  g.rotation.y = rotationY;
  animCallbacks.push((t) => {
    const sp = g.userData.spinBoost || 1.0;
    gears.forEach((w) => {
      w.rotation.z = t * 0.65 * w.userData.ratio * sp;
    });
  });
  return g;
}

/* ------------------------------------------------------------------ 22. GUTENBERG SCREW PRINTING PRESS (1450) & ISLAMIC ASTROLABE */
export function createGutenbergPressAndAstrolabe(animCallbacks, { position = [3.2, 0, -0.4], rotationY = -0.35 } = {}) {
  const g = new THREE.Group();
  const oak = new THREE.MeshStandardMaterial({ color: 0x52361e, roughness: 0.78 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd4a442, roughness: 0.25, metalness: 0.92 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x2a2e34, roughness: 0.4, metalness: 0.85 });
  const paper = new THREE.MeshStandardMaterial({ color: 0xf4ead5, roughness: 0.7 });

  // Heavy oak upright frame (cheeks, cap, winter, coffin bed)
  g.add(box(0.18, 2.25, 0.22, oak, -0.52, 1.12, 0));
  g.add(box(0.18, 2.25, 0.22, oak, 0.52, 1.12, 0));
  g.add(box(1.28, 0.22, 0.28, oak, 0, 2.18, 0));
  g.add(box(1.18, 0.18, 1.35, oak, 0, 0.78, 0.25));

  // Wooden helical spindle screw + platen + iron pull-bar lever
  const pressHead = new THREE.Group();
  pressHead.position.set(0, 1.42, 0);
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.85, 16), oak);
  const platen = box(0.68, 0.08, 0.52, iron, 0, -0.38, 0);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.82, 10), iron);
  bar.rotation.z = Math.PI / 2 - 0.2;
  bar.position.set(0.36, -0.1, 0.18);
  pressHead.add(screw, platen, bar);
  g.add(pressHead);

  // Freshly printed 42-line Gutenberg Bible folio sheet on the coffin bed
  const folio = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.36), paper);
  folio.rotation.x = -Math.PI / 2;
  folio.position.set(0, 0.88, 0.52);
  g.add(folio);

  // Islamic Golden Age Brass Planispheric Astrolabe & Galileo's Refracting Telescope on side stand
  const astrolabe = new THREE.Group();
  astrolabe.position.set(-1.15, 1.25, 0.35);
  const mater = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.028, 10, 36), brass);
  const rete = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.016, 8, 28), brass);
  const alidade = box(0.46, 0.025, 0.015, brass, 0, 0, 0.02);
  astrolabe.add(mater, rete, alidade);
  g.add(astrolabe);

  const stand = box(0.45, 0.98, 0.45, oak, -1.15, 0.49, 0.35);
  g.add(stand);

  g.userData.activePress = false;
  g.position.set(...position);
  g.rotation.y = rotationY;
  animCallbacks.push((t) => {
    const speed = g.userData.activePress ? 3.2 : 0.8;
    const cycle = Math.sin(t * speed);
    pressHead.position.y = 1.42 + cycle * 0.09;
    pressHead.rotation.y = cycle * 0.35;
    alidade.rotation.z = t * 0.45 * speed;
    rete.rotation.z = -t * 0.22 * speed;
  });
  return g;
}

/* ------------------------------------------------------------------ 24. NIKOLA TESLA AC POLYPHASE INDUCTION COIL */
export function createTeslaCoil(animCallbacks, { position = [-3.2, 0, -1.8] } = {}) {
  const g = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x242830, roughness: 0.4, metalness: 0.8 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xd47a42, roughness: 0.25, metalness: 0.92 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.12, metalness: 0.98 });
  const arcMat = new THREE.MeshBasicMaterial({ color: 0x8ad8ff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });

  const base = box(0.95, 0.45, 0.95, baseMat, 0, 0.225, 0);
  const primary = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 10, 32), copper);
  primary.rotation.x = Math.PI / 2;
  primary.position.y = 0.55;
  const secondary = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.35, 24), copper);
  secondary.position.y = 1.12;
  const toroid = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.095, 16, 36), chrome);
  toroid.rotation.x = Math.PI / 2;
  toroid.position.y = 1.85;

  const arcHalo = new THREE.Mesh(new THREE.TorusKnotGeometry(0.46, 0.018, 64, 8, 3, 5), arcMat);
  arcHalo.position.y = 1.85;
  g.add(base, primary, secondary, toroid, arcHalo);

  g.userData.arcMat = arcMat;
  g.position.set(...position);
  animCallbacks.push((t) => {
    arcHalo.rotation.y = t * 4.5;
    arcHalo.rotation.x = Math.sin(t * 7.0) * 0.4;
  });
  return g;
}

/* ------------------------------------------------------------------ 25. APOLLO 11 LASER RANGING RETROREFLECTOR (LRRR) */
export function createApolloRetroreflector({ position = [2.4, 0, 2.2], rotationY = -0.35 } = {}) {
  const g = new THREE.Group();
  const alum = new THREE.MeshStandardMaterial({ color: 0xd8dee6, roughness: 0.28, metalness: 0.92 });
  const prismMat = new THREE.MeshPhysicalMaterial({ color: 0x9fe8ff, emissive: 0x2277aa, emissiveIntensity: 0.4, roughness: 0.05, metalness: 0.1, transmission: 0.85, transparent: true });

  const stand = box(0.75, 0.18, 0.55, alum, 0, 0.09, 0);
  const panel = box(0.68, 0.68, 0.06, alum, 0, 0.42, 0);
  panel.rotation.x = -0.55;
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.58), prismMat);
  grid.position.set(0, 0.44, 0.04);
  grid.rotation.x = -0.55;
  g.add(stand, panel, grid);
  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

/* ------------------------------------------------------------------ 26. NEOLITHIC MUD-BRICK VILLAGE COMPOUND (Çatalhöyük / Jericho) */
export function createNeolithicVillage(mudMat, { position = [0, 0, -14], rotationY = 0 } = {}) {
  const g = new THREE.Group();
  const timber = new THREE.MeshStandardMaterial({ color: 0x4e341e, roughness: 0.88, metalness: 0.02 });
  const thatch = new THREE.MeshStandardMaterial({ color: 0xc2a460, roughness: 0.92, metalness: 0.02 });
  const darkRecess = new THREE.MeshStandardMaterial({ color: 0x18120c, roughness: 0.95 });
  const emberMat = new THREE.MeshStandardMaterial({ color: 0xff6a18, emissive: 0xff4500, emissiveIntensity: 3.5 });

  // Terraced multi-room mud-brick dwellings (Çatalhöyük clustered architecture)
  const rooms = [
    { x: -1.6, z: 0, w: 6.8, h: 3.3, d: 5.4 },
    { x: 4.4, z: 0.6, w: 5.4, h: 2.7, d: 4.8 },
    { x: -4.8, z: -3.2, w: 5.2, h: 4.2, d: 4.6 },
  ];

  rooms.forEach(({ x, z, w, h, d }) => {
    // Plastered mud-brick main volume + subtle roof parapet
    g.add(box(w, h, d, mudMat, x, h / 2, z));
    g.add(box(w + 0.16, 0.24, d + 0.16, mudMat, x, h + 0.12, z));

    // Projecting cedar roof-beams (vigas) along front & back walls
    const nBeams = Math.floor(w / 0.85);
    for (let i = 0; i < nBeams; i++) {
      const bx = x - w / 2 + 0.5 + i * 0.85;
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, d + 0.75, 8), timber);
      beam.rotation.x = Math.PI / 2;
      beam.position.set(bx, h - 0.25, z);
      beam.castShadow = true;
      g.add(beam);
    }
  });

  // Recessed timber-lintel doorway & deep ventilation windows on main house
  g.add(box(1.15, 2.05, 0.18, darkRecess, -1.6, 1.02, 2.66));
  g.add(box(1.55, 0.16, 0.32, timber, -1.6, 2.10, 2.68));
  [-3.4, 0.2, 4.4].forEach((wx, idx) => {
    const wy = idx === 2 ? 1.65 : 1.95;
    const wz = idx === 2 ? 2.96 : 2.66;
    g.add(box(0.68, 0.68, 0.18, darkRecess, wx, wy, wz));
    g.add(box(0.88, 0.12, 0.28, timber, wx, wy + 0.38, wz));
  });

  // Wooden rooftop access ladder leaning against the terraced mud-brick wall (signature Çatalhöyük feature!)
  const ladderGroup = new THREE.Group();
  [-0.24, 0.24].forEach((lx) => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 4.1, 8), timber);
    rail.position.set(lx, 2.0, 0);
    rail.castShadow = true;
    ladderGroup.add(rail);
  });
  for (let r = 0; r < 9; r++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.52, 8), timber);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, 0.35 + r * 0.42, 0);
    ladderGroup.add(rung);
  }
  ladderGroup.position.set(1.4, 0, 2.95);
  ladderGroup.rotation.x = -0.28;
  g.add(ladderGroup);

  // Shaded timber-post courtyard portico with woven reed thatch awning
  const porticoZ = 4.1;
  [-4.2, -1.6, 1.0].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.55, 10), timber);
    post.position.set(px, 1.275, porticoZ);
    post.castShadow = true;
    g.add(post);
  });
  g.add(box(5.6, 0.12, 0.14, timber, -1.6, 2.56, porticoZ));
  const awning = box(5.8, 0.09, 1.85, thatch, -1.6, 2.68, 3.35);
  awning.rotation.x = 0.12;
  g.add(awning);

  // Outdoor beehive clay bread oven (tannur) with glowing baking embers
  const ovenDome = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58), mudMat);
  ovenDome.scale.set(1.0, 1.15, 1.0);
  ovenDome.position.set(3.8, 0.0, 4.2);
  ovenDome.castShadow = ovenDome.receiveShadow = true;
  g.add(ovenDome);
  const ovenMouth = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), emberMat);
  ovenMouth.position.set(3.8, 0.34, 5.02);
  g.add(ovenMouth);

  // Low mud-plaster courtyard bench & grain storage bins
  g.add(box(3.2, 0.42, 0.85, mudMat, -2.8, 0.21, 3.1));

  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}

/* ------------------------------------------------------------------ 27. GIZA LIMESTONE HAULING SLED & ROYAL SURVEY PAVILION */
export function createPyramidRampAndSled(sandstoneMat, woodMat, { sledPos = [-3.2, 0, -2.4], sledRotY = 0.26, pavilionPos = [0, 0, 1.0] } = {}) {
  const g = new THREE.Group();
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xc2a268, roughness: 0.88, metalness: 0.02 });
  const linenMat = new THREE.MeshStandardMaterial({ color: 0xc2b498, roughness: 0.88, side: THREE.DoubleSide });
  const goldTrim = new THREE.MeshStandardMaterial({ color: 0xd4a238, roughness: 0.32, metalness: 0.82 });
  const paintedWood = new THREE.MeshStandardMaterial({ color: 0x8c2d1c, roughness: 0.65 });

  // 1. Heavy Cedar Hauling Sled + 2.5-ton Tura Limestone Block + Wooden Rollers + Taut Ropes
  const sledGroup = new THREE.Group();
  [-0.58, 0.58].forEach((sx) => {
    // Runner beam
    sledGroup.add(box(0.18, 0.16, 2.5, woodMat, sx, 0.14, 0));
    // Curved prow of sled runner
    const prow = box(0.18, 0.16, 0.45, woodMat, sx, 0.25, 1.38);
    prow.rotation.x = -0.52;
    sledGroup.add(prow);
  });
  // Cross-timbers & wooden rollers beneath the sled
  for (let i = -2; i <= 2; i++) {
    sledGroup.add(box(1.36, 0.08, 0.22, woodMat, 0, 0.24, i * 0.48));
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.55, 12), woodMat);
    roller.rotation.z = Math.PI / 2;
    roller.position.set(0, 0.06, i * 0.52);
    roller.castShadow = true;
    sledGroup.add(roller);
  }
  // Massive dressed limestone block lashed to the sled
  const block = box(1.18, 0.92, 1.65, sandstoneMat, 0, 0.74, -0.08);
  sledGroup.add(block);
  // Twisted papyrus lashing ropes around block + hauling ropes extending forward toward the builders
  [-0.42, 0.42].forEach((rz) => {
    sledGroup.add(box(1.22, 0.96, 0.05, ropeMat, 0, 0.74, rz));
  });
  [-0.38, 0.38].forEach((rx) => {
    const haulRope = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 2.2, 8), ropeMat);
    haulRope.rotation.x = Math.PI / 2 - 0.22;
    haulRope.position.set(rx, 0.48, 2.1);
    sledGroup.add(haulRope);
  });
  sledGroup.position.set(...sledPos);
  sledGroup.rotation.y = sledRotY;
  g.add(sledGroup);

  // 2. Royal Scribe & Architect Pavilion (stone dais, carved table, and lotus-column sun canopy)
  const pavGroup = new THREE.Group();
  // Stepped limestone dais platform
  pavGroup.add(box(3.8, 0.16, 2.8, sandstoneMat, 0, 0.08, 0));
  // Architect's stone drafting table with carved legs (top at y = 0.75)
  pavGroup.add(box(2.2, 0.12, 1.15, sandstoneMat, 0, 0.69, 0));
  [[-0.88, -0.42], [0.88, -0.42], [-0.88, 0.42], [0.88, 0.42]].forEach(([lx, lz]) => {
    pavGroup.add(box(0.22, 0.55, 0.22, sandstoneMat, lx, 0.36, lz));
  });
  // 4 Painted Lotus-Capital Canopy Columns + Linen Sunshade
  [[-1.65, -1.15], [1.65, -1.15], [-1.65, 1.15], [1.65, 1.15]].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, 2.65, 14), paintedWood);
    col.position.set(cx, 1.40, cz);
    col.castShadow = true;
    pavGroup.add(col);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.085, 0.22, 14), goldTrim);
    cap.position.set(cx, 2.75, cz);
    pavGroup.add(cap);
  });
  pavGroup.add(box(3.6, 0.09, 0.09, woodMat, 0, 2.88, -1.15));
  pavGroup.add(box(3.6, 0.09, 0.09, woodMat, 0, 2.88, 1.15));
  const canopy = box(3.75, 0.05, 2.6, linenMat, 0, 2.94, 0);
  pavGroup.add(canopy);

  pavGroup.position.set(...pavilionPos);
  g.add(pavGroup);

  return g;
}

/* ------------------------------------------------------------------ 28. PLEISTOCENE CAMP WINDBREAK SHELTER & HIDE-DRYING RACK */
export function createPrehistoricShelterAndRack({ position = [3.6, 0, -2.4], rotationY = -0.5 } = {}) {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4c331c, roughness: 0.92, metalness: 0.02 });
  const hideMat = new THREE.MeshStandardMaterial({ color: 0x6e482b, roughness: 0.92, metalness: 0.02, side: THREE.DoubleSide });
  const darkHideMat = new THREE.MeshStandardMaterial({ color: 0x52351e, roughness: 0.94, metalness: 0.02, side: THREE.DoubleSide });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xe6dcc8, roughness: 0.55, metalness: 0.05 });

  // A-frame timber & mammoth-bone lean-to shelter with lashed cross-poles
  [-1.2, 0, 1.2].forEach((x) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.068, 2.75, 10), woodMat);
    pole.position.set(x, 1.05, -0.35);
    pole.rotation.x = 0.58;
    pole.castShadow = true;
    g.add(pole);
  });
  // Horizontal lashed purlin cross-poles supporting the hides
  [-0.55, 0.0, 0.55].forEach((offset) => {
    const purlin = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.042, 2.75, 8), woodMat);
    purlin.rotation.z = Math.PI / 2;
    purlin.position.set(0, 1.08 + offset * 0.82, -0.32 + offset * 0.54);
    purlin.castShadow = true;
    g.add(purlin);
  });

  // Organically sagged, scalloped animal-hide pelt canopy draped over the timber frame
  const hideGeo = new THREE.PlaneGeometry(2.55, 2.18, 28, 22);
  const hPos = hideGeo.attributes.position;
  for (let i = 0; i < hPos.count; i++) {
    let vx = hPos.getX(i);
    let vy = hPos.getY(i);
    const nx = vx / 1.275; // -1..1 across poles
    const ny = vy / 1.09;  // -1..1 along slope
    // Catenary sag between the 3 main poles (at nx = -0.94, 0, +0.94)
    const poleDist = Math.abs(Math.sin(nx * Math.PI));
    const sag = -0.095 * poleDist * (1.0 - 0.25 * ny * ny);
    // Natural wavy hide wrinkles and scalloped raw-hide border
    const wrinkle = 0.022 * Math.sin(vx * 7.5 + vy * 5.0) * Math.cos(vy * 8.0);
    const edgeScallop = 1.0 - 0.06 * Math.pow(Math.max(Math.abs(nx), Math.abs(ny)), 3.0) * (0.5 + 0.5 * Math.sin(vx * 9.0 + vy * 11.0));
    hPos.setXYZ(i, vx * edgeScallop, vy * edgeScallop, sag + wrinkle);
  }
  hideGeo.computeVertexNormals();
  const hideCanopy = new THREE.Mesh(hideGeo, hideMat);
  hideCanopy.rotation.x = -Math.PI / 2 + 0.58;
  hideCanopy.position.set(0, 1.15, -0.28);
  hideCanopy.castShadow = hideCanopy.receiveShadow = true;
  g.add(hideCanopy);

  // Secondary overlapping darker bison/deer pelt on upper ridge for authentic layered hide texture
  const upperPeltGeo = new THREE.PlaneGeometry(1.75, 1.25, 18, 14);
  const uPos = upperPeltGeo.attributes.position;
  for (let i = 0; i < uPos.count; i++) {
    const vx = uPos.getX(i);
    const vy = uPos.getY(i);
    const sag = -0.05 * Math.cos(vx * 1.4) + 0.018 * Math.sin(vx * 9.0 + vy * 7.0);
    uPos.setZ(i, sag);
  }
  upperPeltGeo.computeVertexNormals();
  const upperPelt = new THREE.Mesh(upperPeltGeo, darkHideMat);
  upperPelt.rotation.x = -Math.PI / 2 + 0.58;
  upperPelt.rotation.z = 0.08;
  upperPelt.position.set(-0.18, 1.42, -0.10);
  upperPelt.castShadow = true;
  g.add(upperPelt);

  // Pair of curved mammoth ivory tusks flanking & anchoring the shelter entrance
  [-1.35, 1.35].forEach((side) => {
    const tusk = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.065, 10, 24, Math.PI * 0.55), boneMat);
    tusk.rotation.y = Math.PI / 2;
    tusk.rotation.x = -0.25;
    tusk.position.set(side, 0.25, 0.2);
    tusk.castShadow = true;
    g.add(tusk);
  });

  g.position.set(...position);
  g.rotation.y = rotationY;
  return g;
}



