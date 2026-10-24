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
  [-gauge / 2, gauge / 2].forEach((x) => {
    const rail = box(0.08, 0.16, length, iron, x, 0.26, 0);
    g.add(rail);
    g.add(box(0.14, 0.03, length, iron, x, 0.185, 0));
  });
  const tieGeo = new THREE.BoxGeometry(2.6, 0.16, 0.26);
  ensureUV1(tieGeo);
  const n = Math.floor(length / 0.7);
  const ties = new THREE.InstancedMesh(tieGeo, wood, n);
  for (let i = 0; i < n; i++) {
    _m.compose(_p.set(0, 0.09, -length / 2 + i * 0.7), _q.identity(), _s.set(1, 1, 1));
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
  const dark = iron;
  // boiler
  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 7.2, 32), dark);
  boiler.rotation.x = Math.PI / 2;
  boiler.position.set(0, 2.2, 1.0);
  boiler.castShadow = true;
  g.add(boiler);
  // smokebox + stack
  const smokebox = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.2, 32), dark);
  smokebox.rotation.x = Math.PI / 2;
  smokebox.position.set(0, 2.2, 5.0);
  g.add(smokebox);
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 1.8, 20), dark);
  stack.position.set(0, 3.9, 4.6);
  g.add(stack);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), brass);
  dome.position.set(0, 3.2, 1.6);
  g.add(dome);
  // cab
  g.add(box(2.6, 2.6, 2.4, dark, 0, 2.6, -3.4));
  g.add(box(2.8, 0.2, 2.8, dark, 0, 3.95, -3.4));
  // frame + running board
  g.add(box(2.4, 0.35, 10.5, dark, 0, 1.05, 0.4));
  // wheels: 2 small leading + 3 large drivers per side
  const bigWheel = new THREE.CylinderGeometry(0.9, 0.9, 0.22, 28);
  const smallWheel = new THREE.CylinderGeometry(0.45, 0.45, 0.2, 20);
  const wheels = [];
  [-1.25, 1.25].forEach((x) => {
    [-2.6, -0.6, 1.4].forEach((z) => {
      const w = new THREE.Mesh(bigWheel, dark);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.9, z);
      w.castShadow = true;
      g.add(w);
      wheels.push(w);
      // spokes
      for (let s = 0; s < 8; s++) {
        const sp = box(0.08, 1.5, 0.08, brass, 0, 0, 0);
        sp.rotation.x = (s / 8) * Math.PI;
        w.add(sp);
      }
    });
    [3.6, 4.6].forEach((z) => {
      const w = new THREE.Mesh(smallWheel, dark);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.45, z);
      g.add(w);
      wheels.push(w);
    });
    // connecting rod
    const rod = box(0.12, 0.16, 4.2, brass, x * 1.1, 0.65, -0.6);
    g.add(rod);
    rod.userData.isRod = true;
  });
  // cowcatcher
  const cc = box(2.4, 1.0, 0.2, dark, 0, 0.6, 5.9);
  cc.rotation.x = 0.6;
  g.add(cc);
  // headlamp
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0xfff1c0, emissive: 0xffd27a, emissiveIntensity: 2.2 }));
  lamp.rotation.x = Math.PI / 2;
  lamp.position.set(0, 3.1, 5.7);
  g.add(lamp);
  const light = new THREE.SpotLight(0xffe0a0, 120, 60, 0.35, 0.6, 1.6);
  light.position.set(0, 3.1, 5.8);
  light.target.position.set(0, 1.2, 40);
  g.add(light, light.target);
  // tender
  g.add(box(2.6, 2.2, 4.2, dark, 0, 2.1, -6.9));
  g.add(box(2.4, 0.5, 3.8, new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 1 }), 0, 3.3, -6.9));
  [-1.25, 1.25].forEach((x) => [-5.6, -8.2].forEach((z) => {
    const w = new THREE.Mesh(smallWheel, dark);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.45, z);
    g.add(w);
    wheels.push(w);
  }));
  g.position.set(...position);
  g.rotation.y = rotationY;
  animCallbacks.push((t) => {
    wheels.forEach((w) => {
      w.rotation.x = t * 2.4;
    });
    g.children.forEach((c) => {
      if (c.userData.isRod) c.position.y = 0.65 + Math.sin(t * 2.4) * 0.25;
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
