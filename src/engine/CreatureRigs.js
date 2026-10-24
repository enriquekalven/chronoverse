import * as THREE from '../../vendor/three/build/three.module.js';
import { makePBRMaterial } from './HyperRealKit.js';

/**
 * CreatureRigs.js — Biomechanical Multi-Jointed 3D Creature & Humanoid Rig Engine.
 * Replaces simple static primitives with sculpted organic anatomy, multi-segment spines,
 * necks, tails, 3-joint digitigrade/quadrupedal legs, individual teeth, claws, eyes,
 * and continuous inverse/forward kinematic locomotion loops.
 */

/**
 * Builds an organically lofted body/muscle mesh along a 3D spine curve with variable radii.
 */
export function buildLoftedOrganMesh(points, radii, material, radialSegments = 24, tubularSegments = 36) {
  const curve = new THREE.CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const geo = new THREE.BufferGeometry();
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Interpolate radius at u in [0, 1]
  const sampleRadius = (u) => {
    const scaled = u * (radii.length - 1);
    const i = Math.floor(scaled);
    const f = scaled - i;
    const r0 = radii[Math.min(i, radii.length - 1)];
    const r1 = radii[Math.min(i + 1, radii.length - 1)];
    // Smooth cosine interpolation for organic muscle bellies
    const mu = (1 - Math.cos(f * Math.PI)) * 0.5;
    return {
      rx: r0.rx + (r1.rx - r0.rx) * mu,
      ry: r0.ry + (r1.ry - r0.ry) * mu,
    };
  };

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    const pt = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const { rx, ry } = sampleRadius(u);

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);

      const vx = pt.x + rx * cosV * B.x + ry * sinV * N.x;
      const vy = pt.y + rx * cosV * B.y + ry * sinV * N.y;
      const vz = pt.z + rx * cosV * B.z + ry * sinV * N.z;
      vertices.push(vx, vy, vz);

      const nx = cosV * B.x + sinV * N.x;
      const ny = cosV * B.y + sinV * N.y;
      const nz = cosV * B.z + sinV * N.z;
      const len = Math.hypot(nx, ny, nz) || 1;
      normals.push(nx / len, ny / len, nz / len);

      uvs.push(u * 3.0, j / radialSegments);
    }
  }

  const stride = radialSegments + 1;
  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d, b, c, d);
    }
  }

  geo.setIndex(indices);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * 1. HYPER-REALISTIC TYRANNOSAURUS REX RIG
 * Multi-joint digitigrade hind legs (Thigh -> Shin -> Ankle -> 3-Clawed Foot),
 * breathing sculpted ribcage with dorsal osteoderms, 8-segment whip tail,
 * articulated S-neck, sculpted skull with 26 serrated conical teeth, tongue,
 * glowing amber eyes, and continuous stalking + roaring kinematics.
 */
export function buildHyperRex(scale = 1.0) {
  const root = new THREE.Group();

  const skinMat = makePBRMaterial('trexHide', '#5c2d16', '#2b1308', {
    style: 'scales',
    roughness: 0.58,
    bumpScale: 0.14,
  });
  const bellyMat = makePBRMaterial('trexBelly', '#a16207', '#451a03', {
    style: 'scales',
    roughness: 0.68,
    bumpScale: 0.08,
  });
  const toothMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    roughness: 0.18,
    metalness: 0.08,
  });
  const clawMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.25,
    metalness: 0.2,
  });
  const gumMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.35,
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

  // Hip pivot (center of mass for walking bob & pitch)
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.set(0, 0.35, 0);
  root.add(pelvisGroup);

  // Sculpted organic torso & ribcage
  const torsoMesh = buildLoftedOrganMesh(
    [
      new THREE.Vector3(-0.75, 0.05, 0),
      new THREE.Vector3(-0.25, 0.12, 0),
      new THREE.Vector3(0.35, 0.24, 0),
      new THREE.Vector3(0.85, 0.42, 0),
    ],
    [
      { rx: 0.32, ry: 0.38 },
      { rx: 0.48, ry: 0.58 },
      { rx: 0.52, ry: 0.62 },
      { rx: 0.36, ry: 0.44 },
    ],
    skinMat
  );
  pelvisGroup.add(torsoMesh);

  // Lighter counter-shaded underbelly
  const bellyMesh = buildLoftedOrganMesh(
    [
      new THREE.Vector3(-0.6, -0.12, 0),
      new THREE.Vector3(0.1, -0.14, 0),
      new THREE.Vector3(0.75, 0.12, 0),
    ],
    [
      { rx: 0.24, ry: 0.22 },
      { rx: 0.41, ry: 0.32 },
      { rx: 0.28, ry: 0.24 },
    ],
    bellyMat
  );
  pelvisGroup.add(bellyMesh);

  // Dorsal osteoderm ridge plates along spine
  for (let i = 0; i < 9; i++) {
    const u = i / 8;
    const ridge = new THREE.Mesh(
      new THREE.ConeGeometry(0.055, 0.16, 6),
      clawMat
    );
    ridge.position.set(-0.65 + u * 1.45, 0.52 + u * 0.22, 0);
    ridge.rotation.z = -0.25;
    pelvisGroup.add(ridge);
  }

  // S-Curved Muscular Neck + Sculpted Theropod Skull & Articulated Jaw
  const neckPivot = new THREE.Group();
  neckPivot.position.set(0.78, 0.38, 0);
  pelvisGroup.add(neckPivot);

  const neckMesh = buildLoftedOrganMesh(
    [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.28, 0.26, 0),
      new THREE.Vector3(0.52, 0.54, 0),
    ],
    [
      { rx: 0.34, ry: 0.4 },
      { rx: 0.28, ry: 0.33 },
      { rx: 0.25, ry: 0.3 },
    ],
    skinMat
  );
  neckPivot.add(neckMesh);

  const headGroup = new THREE.Group();
  headGroup.position.set(0.52, 0.56, 0);
  neckPivot.add(headGroup);

  // Upper Cranium & Snout (sculpted multi-part theropod skull)
  const cranium = buildLoftedOrganMesh(
    [
      new THREE.Vector3(-0.15, 0.05, 0),
      new THREE.Vector3(0.22, 0.08, 0),
      new THREE.Vector3(0.62, 0.04, 0),
      new THREE.Vector3(0.88, -0.02, 0),
    ],
    [
      { rx: 0.28, ry: 0.28 },
      { rx: 0.26, ry: 0.29 },
      { rx: 0.2, ry: 0.24 },
      { rx: 0.12, ry: 0.15 },
    ],
    skinMat
  );
  headGroup.add(cranium);

  // Brow ridges & eyes (binocular forward-facing predator vision)
  [-0.21, 0.21].forEach((zSide) => {
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.18, 8, 12), skinMat);
    brow.rotation.z = Math.PI / 2.2;
    brow.position.set(0.18, 0.24, zSide);
    const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 14), eyeMat);
    eyeball.position.set(0.22, 0.16, zSide * 0.96);
    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.02), pupilMat);
    pupil.position.set(0.265, 0.16, zSide * 0.98);
    headGroup.add(brow, eyeball, pupil);
  });

  // Upper serrated teeth row (14 teeth)
  for (let t = 0; t < 7; t++) {
    const tx = 0.22 + t * 0.09;
    const tLen = t < 4 ? 0.14 : 0.09;
    [-0.14, 0.14].forEach((tz) => {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.022, tLen, 8), toothMat);
      tooth.rotation.x = Math.PI;
      tooth.position.set(tx, -0.14, tz * (1 - t * 0.05));
      headGroup.add(tooth);
    });
  }

  // Articulated Lower Mandible (Jaw) + Tongue + Lower Teeth
  const jawPivot = new THREE.Group();
  jawPivot.position.set(0.02, -0.1, 0);
  headGroup.add(jawPivot);

  const lowerJaw = buildLoftedOrganMesh(
    [
      new THREE.Vector3(-0.08, -0.04, 0),
      new THREE.Vector3(0.35, -0.08, 0),
      new THREE.Vector3(0.78, -0.05, 0),
    ],
    [
      { rx: 0.23, ry: 0.14 },
      { rx: 0.18, ry: 0.11 },
      { rx: 0.1, ry: 0.07 },
    ],
    bellyMat
  );
  jawPivot.add(lowerJaw);

  const tongue = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.38, 8, 12), gumMat);
  tongue.rotation.z = Math.PI / 2;
  tongue.position.set(0.35, 0.0, 0);
  jawPivot.add(tongue);

  for (let t = 0; t < 6; t++) {
    const tx = 0.22 + t * 0.085;
    [-0.11, 0.11].forEach((tz) => {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.1, 8), toothMat);
      tooth.position.set(tx, 0.03, tz * (1 - t * 0.05));
      jawPivot.add(tooth);
    });
  }

  // Tiny 2-clawed forelimbs (arms)
  const forelimbs = [];
  [-0.36, 0.36].forEach((zSide) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(0.68, 0.08, zSide);
    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 8, 12), skinMat);
    upperArm.position.set(0.05, -0.12, 0);
    upperArm.rotation.z = 0.45;
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.18, 8, 12), skinMat);
    forearm.position.set(0.16, -0.22, 0);
    forearm.rotation.z = 1.1;
    const claw1 = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 6), clawMat);
    claw1.position.set(0.28, -0.22, 0.02);
    claw1.rotation.z = -Math.PI / 2;
    const claw2 = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 6), clawMat);
    claw2.position.set(0.28, -0.25, -0.02);
    claw2.rotation.z = -Math.PI / 2;
    armPivot.add(upperArm, forearm, claw1, claw2);
    pelvisGroup.add(armPivot);
    forelimbs.push(armPivot);
  });

  // 9-Segment Articulated Kinematic Whip Tail
  const tailSegments = [];
  let parentTail = pelvisGroup;
  for (let s = 0; s < 9; s++) {
    const segGroup = new THREE.Group();
    segGroup.position.set(s === 0 ? -0.72 : -0.28, s === 0 ? 0.05 : 0, 0);
    const r = Math.max(0.04, 0.32 * Math.pow(0.8, s));
    const segMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(r, 0.22, 10, 14),
      skinMat
    );
    segMesh.rotation.z = Math.PI / 2;
    segMesh.position.x = -0.14;
    segGroup.add(segMesh);
    parentTail.add(segGroup);
    tailSegments.push(segGroup);
    parentTail = segGroup;
  }

  // 2 Articulated 3-Joint Digitigrade Hind Legs (Hip -> Knee -> Ankle -> 3-Toed Clawed Foot)
  const legs = [];
  [-0.36, 0.36].forEach((zSide, idx) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(-0.22, -0.02, zSide);
    pelvisGroup.add(hipPivot);

    // Muscular Thigh (Femur)
    const thigh = buildLoftedOrganMesh(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.12, -0.38, 0),
        new THREE.Vector3(0.18, -0.72, 0),
      ],
      [
        { rx: 0.24, ry: 0.32 },
        { rx: 0.21, ry: 0.28 },
        { rx: 0.14, ry: 0.18 },
      ],
      skinMat
    );
    hipPivot.add(thigh);

    // Knee Pivot + Crus (Tibia/Fibula)
    const kneePivot = new THREE.Group();
    kneePivot.position.set(0.18, -0.7, 0);
    hipPivot.add(kneePivot);

    const shin = buildLoftedOrganMesh(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.14, -0.38, 0),
        new THREE.Vector3(-0.22, -0.72, 0),
      ],
      [
        { rx: 0.14, ry: 0.17 },
        { rx: 0.11, ry: 0.13 },
        { rx: 0.08, ry: 0.1 },
      ],
      skinMat
    );
    kneePivot.add(shin);

    // Ankle (Metatarsus) + 3-Toed Foot with Curved Talons
    const anklePivot = new THREE.Group();
    anklePivot.position.set(-0.22, -0.7, 0);
    kneePivot.add(anklePivot);

    const metatarsus = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.32, 8, 12), skinMat);
    metatarsus.position.set(0.08, -0.18, 0);
    metatarsus.rotation.z = 0.38;
    anklePivot.add(metatarsus);

    const footGroup = new THREE.Group();
    footGroup.position.set(0.16, -0.35, 0);
    anklePivot.add(footGroup);

    [-0.09, 0, 0.09].forEach((toeZ, tIdx) => {
      const toeLen = tIdx === 1 ? 0.32 : 0.24;
      const toe = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, toeLen, 8, 10), skinMat);
      toe.rotation.z = Math.PI / 2;
      toe.rotation.y = toeZ * 1.8;
      toe.position.set(toeLen * 0.5, 0, toeZ);
      const talon = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 8), clawMat);
      talon.rotation.z = -Math.PI / 2.2;
      talon.position.set(toeLen + 0.05, -0.01, toeZ * 1.3);
      footGroup.add(toe, talon);
    });

    legs.push({ hipPivot, kneePivot, anklePivot, footGroup, phase: idx * Math.PI });
  });

  root.scale.setScalar(scale);

  return {
    group: root,
    animate(time, whatIf = false) {
      const speed = whatIf ? 4.8 : 2.6;
      const cycle = time * speed;

      // Dynamic bipedal stalking stride (hips bob twice per full stride)
      pelvisGroup.position.y = 0.35 + Math.abs(Math.sin(cycle)) * 0.12;
      pelvisGroup.rotation.z = Math.sin(cycle) * 0.06;
      pelvisGroup.rotation.x = Math.cos(cycle) * 0.045;

      // Breathing expansion on ribcage
      const breath = 1 + Math.sin(time * 3.2) * 0.035;
      torsoMesh.scale.set(1, breath, breath);

      // S-Neck & Head tracking + ferocious roaring jaw
      neckPivot.rotation.z = Math.sin(time * 1.9) * 0.12 + (whatIf ? 0.18 : 0.0);
      neckPivot.rotation.y = Math.sin(time * 1.3) * 0.18;
      headGroup.rotation.z = Math.cos(time * 2.4) * 0.1;

      const roarWave = whatIf
        ? 0.35 + Math.abs(Math.sin(time * 7.5)) * 0.38
        : Math.max(0, Math.sin(time * 2.1 - 0.3)) * 0.42;
      jawPivot.rotation.z = -roarWave;
      tongue.rotation.z = Math.PI / 2 + Math.sin(time * 9) * 0.08;

      // Forelimb twitching
      forelimbs.forEach((arm, idx) => {
        arm.rotation.z = Math.sin(time * 4 + idx) * 0.22;
      });

      // Travelling sine-wave counterbalance along all 9 tail vertebrae
      tailSegments.forEach((seg, sIdx) => {
        seg.rotation.y = Math.sin(cycle - sIdx * 0.42) * 0.16;
        seg.rotation.z = Math.cos(cycle * 2 - sIdx * 0.35) * 0.045;
      });

      // Full 3-joint digitigrade walking cycle
      legs.forEach(({ hipPivot, kneePivot, anklePivot, footGroup, phase }) => {
        const s = Math.sin(cycle + phase);
        const c = Math.cos(cycle + phase);
        hipPivot.rotation.z = s * 0.42;
        kneePivot.rotation.z = -Math.max(0, c) * 0.55 - 0.12;
        anklePivot.rotation.z = Math.max(0, -s) * 0.35;
        footGroup.rotation.z = -hipPivot.rotation.z * 0.65;
      });
    },
  };
}

/**
 * 2. HYPER-REALISTIC TRICERATOPS HORRIDUS RIG
 * Sculpted armored body, scalloped vascular frill with 14 epoccipital spikes,
 * curved brow horns + nasal horn, parrot beak, 4 multi-jointed quadrupedal legs,
 * and defensive head-sweeping + walking kinematics.
 */
export function buildHyperTriceratops(scale = 1.0) {
  const root = new THREE.Group();

  const skinMat = makePBRMaterial('triHide', '#1e40af', '#0f172a', {
    style: 'scales',
    roughness: 0.54,
    bumpScale: 0.13,
  });
  const frillPatternMat = makePBRMaterial('triFrill', '#d97706', '#7c2d12', {
    style: 'scales',
    roughness: 0.48,
    bumpScale: 0.1,
  });
  const hornMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.25,
    metalness: 0.1,
  });

  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.05;
  root.add(bodyGroup);

  // Heavy quadrupedal barrel torso (facing -X to confront T-Rex)
  const torso = buildLoftedOrganMesh(
    [
      new THREE.Vector3(0.85, -0.05, 0),
      new THREE.Vector3(0.25, 0.15, 0),
      new THREE.Vector3(-0.45, 0.08, 0),
      new THREE.Vector3(-0.85, -0.04, 0),
    ],
    [
      { rx: 0.34, ry: 0.38 },
      { rx: 0.58, ry: 0.64 },
      { rx: 0.54, ry: 0.58 },
      { rx: 0.36, ry: 0.4 },
    ],
    skinMat
  );
  bodyGroup.add(torso);

  // Neck & Armored Frill + 3-Horned Skull Pivot
  const headPivot = new THREE.Group();
  headPivot.position.set(-0.82, 0.02, 0);
  bodyGroup.add(headPivot);

  // Scalloped Parietosquamosal Bone Frill
  const frill = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.68, 0.11, 24),
    frillPatternMat
  );
  frill.rotation.z = Math.PI / 2.6;
  frill.scale.set(1.05, 1.0, 1.18);
  frill.position.set(0.08, 0.38, 0);
  headPivot.add(frill);

  // 13 triangular epoccipital spikes around the frill rim
  for (let i = -6; i <= 6; i++) {
    const ang = (i / 6) * Math.PI * 0.55;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 6), hornMat);
    spike.position.set(
      0.08 + Math.cos(ang) * 0.18,
      0.38 + Math.cos(ang) * 0.68,
      Math.sin(ang) * 0.78
    );
    spike.rotation.x = ang;
    headPivot.add(spike);
  }

  // Sculpted Ceratopsian Skull & Parrot Beak
  const skull = buildLoftedOrganMesh(
    [
      new THREE.Vector3(0, 0.08, 0),
      new THREE.Vector3(-0.42, 0.0, 0),
      new THREE.Vector3(-0.78, -0.14, 0),
    ],
    [
      { rx: 0.34, ry: 0.34 },
      { rx: 0.25, ry: 0.26 },
      { rx: 0.1, ry: 0.14 },
    ],
    skinMat
  );
  headPivot.add(skull);

  // Two 1-meter curved supraorbital brow horns + nasal horn
  [-0.24, 0.24].forEach((zSide) => {
    const browHorn = buildLoftedOrganMesh(
      [
        new THREE.Vector3(-0.12, 0.24, zSide),
        new THREE.Vector3(-0.58, 0.44, zSide * 1.08),
        new THREE.Vector3(-1.05, 0.52, zSide * 0.95),
      ],
      [
        { rx: 0.085, ry: 0.085 },
        { rx: 0.055, ry: 0.055 },
        { rx: 0.01, ry: 0.01 },
      ],
      hornMat,
      12,
      16
    );
    headPivot.add(browHorn);
  });

  const nasalHorn = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.32, 10), hornMat);
  nasalHorn.position.set(-0.62, 0.08, 0);
  nasalHorn.rotation.z = 0.35;
  headPivot.add(nasalHorn);

  // 6-Segment Articulated Tail
  const tailSegments = [];
  let tailParent = bodyGroup;
  for (let s = 0; s < 6; s++) {
    const seg = new THREE.Group();
    seg.position.set(s === 0 ? 0.82 : 0.24, s === 0 ? -0.05 : -0.02, 0);
    const r = 0.28 * Math.pow(0.76, s);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, 0.2, 8, 12), skinMat);
    m.rotation.z = Math.PI / 2;
    m.position.x = 0.12;
    seg.add(m);
    tailParent.add(seg);
    tailSegments.push(seg);
    tailParent = seg;
  }

  // 4 Articulated Quadrupedal Legs (Upper + Lower + 4-Toed Foot)
  const legs = [];
  [
    [-0.55, -0.15, 0.42, 0],
    [-0.55, -0.15, -0.42, Math.PI],
    [0.48, -0.1, 0.44, Math.PI * 0.5],
    [0.48, -0.1, -0.44, Math.PI * 1.5],
  ].forEach(([lx, ly, lz, phase]) => {
    const upperPivot = new THREE.Group();
    upperPivot.position.set(lx, ly, lz);
    const upperMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.42, 10, 14), skinMat);
    upperMesh.position.y = -0.24;
    upperPivot.add(upperMesh);

    const lowerPivot = new THREE.Group();
    lowerPivot.position.set(0, -0.46, 0);
    const lowerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.45, 12), skinMat);
    lowerMesh.position.y = -0.2;
    lowerPivot.add(lowerMesh);

    upperPivot.add(lowerPivot);
    bodyGroup.add(upperPivot);
    legs.push({ upperPivot, lowerPivot, phase });
  });

  root.scale.setScalar(scale);

  return {
    group: root,
    animate(time, whatIf = false) {
      const spd = whatIf ? 4.5 : 2.2;
      const cyc = time * spd;
      bodyGroup.position.y = 0.05 + Math.abs(Math.sin(cyc)) * 0.07;
      bodyGroup.rotation.z = Math.sin(cyc) * 0.04;

      // Defensive horn thrust & sweep
      headPivot.rotation.z = Math.sin(time * (whatIf ? 5.0 : 2.0)) * 0.18;
      headPivot.rotation.y = Math.cos(time * 1.7) * 0.22;

      tailSegments.forEach((seg, idx) => {
        seg.rotation.y = Math.sin(cyc - idx * 0.45) * 0.18;
      });

      legs.forEach(({ upperPivot, lowerPivot, phase }) => {
        const s = Math.sin(cyc + phase);
        upperPivot.rotation.z = s * 0.34;
        lowerPivot.rotation.z = Math.max(0, -Math.cos(cyc + phase)) * 0.42;
      });
    },
  };
}

/**
 * 3. HYPER-REALISTIC BRACHIOSAURUS ALTITHORAX + SOARING PTERANODON RIG
 * 10-segment articulated cervical neck, domed nasal-crested skull, sloped sauropod
 * ribcage, 8-segment whip tail, and 4 articulated pillar legs executing a 4-beat walk.
 */
export function buildHyperBrachiosaurus(scale = 1.0) {
  const root = new THREE.Group();

  const skinMat = makePBRMaterial('brachioHide', '#15803d', '#052e16', {
    style: 'scales',
    roughness: 0.56,
    bumpScale: 0.12,
  });
  const crestMat = makePBRMaterial('brachioCrest', '#eab308', '#ca8a04', {
    style: 'scales',
    roughness: 0.45,
  });

  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = -0.35;
  root.add(bodyGroup);

  // Sloped Sauropod Torso (higher shoulders than hips, classic Brachiosaurus silhouette)
  const torso = buildLoftedOrganMesh(
    [
      new THREE.Vector3(-0.78, -0.18, 0),
      new THREE.Vector3(-0.18, 0.02, 0),
      new THREE.Vector3(0.58, 0.32, 0),
    ],
    [
      { rx: 0.44, ry: 0.48 },
      { rx: 0.64, ry: 0.72 },
      { rx: 0.56, ry: 0.66 },
    ],
    skinMat
  );
  bodyGroup.add(torso);

  // 8-Segment Articulated Cervical Neck + Domed Skull
  const neckSegments = [];
  let neckParent = bodyGroup;
  for (let n = 0; n < 8; n++) {
    const seg = new THREE.Group();
    if (n === 0) {
      seg.position.set(0.55, 0.38, 0);
    } else {
      seg.position.set(0.14, 0.28, 0);
    }
    const r = 0.34 * Math.pow(0.88, n);
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, 0.28, 10, 14), skinMat);
    mesh.position.set(0.07, 0.14, 0);
    mesh.rotation.z = -0.45;
    seg.add(mesh);
    neckParent.add(seg);
    neckSegments.push(seg);
    neckParent = seg;
  }

  // Sculpted Sauropod Head with Nasal Arch Crest & Eyes
  const headGroup = new THREE.Group();
  headGroup.position.set(0.12, 0.28, 0);
  neckParent.add(headGroup);

  const skull = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.28, 10, 14), skinMat);
  skull.rotation.z = Math.PI / 2;
  skull.position.set(0.14, 0, 0);
  const nasalCrest = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), crestMat);
  nasalCrest.scale.set(1.2, 1.35, 0.65);
  nasalCrest.position.set(0.08, 0.16, 0);
  headGroup.add(skull, nasalCrest);

  // 7-Segment Articulated Whip Tail
  const tailSegments = [];
  let tailParent = bodyGroup;
  for (let t = 0; t < 7; t++) {
    const seg = new THREE.Group();
    seg.position.set(t === 0 ? -0.75 : -0.26, t === 0 ? -0.18 : -0.05, 0);
    const r = 0.32 * Math.pow(0.78, t);
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, 0.24, 8, 12), skinMat);
    mesh.rotation.z = Math.PI / 2.2;
    mesh.position.x = -0.13;
    seg.add(mesh);
    tailParent.add(seg);
    tailSegments.push(seg);
    tailParent = seg;
  }

  // 4 Articulated Pillar Legs (Front legs taller than rear legs)
  const legs = [];
  [
    [0.52, 0.12, 0.44, 0, 1.18],
    [0.52, 0.12, -0.44, Math.PI, 1.18],
    [-0.55, -0.18, 0.42, Math.PI * 0.5, 0.92],
    [-0.55, -0.18, -0.42, Math.PI * 1.5, 0.92],
  ].forEach(([lx, ly, lz, phase, lenScale]) => {
    const upperPivot = new THREE.Group();
    upperPivot.position.set(lx, ly, lz);
    const upper = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.19, 0.52 * lenScale, 10, 14),
      skinMat
    );
    upper.position.y = -0.3 * lenScale;
    upperPivot.add(upper);

    const lowerPivot = new THREE.Group();
    lowerPivot.position.set(0, -0.6 * lenScale, 0);
    const lower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.21, 0.58 * lenScale, 14),
      skinMat
    );
    lower.position.y = -0.26 * lenScale;
    lowerPivot.add(lower);

    upperPivot.add(lowerPivot);
    bodyGroup.add(upperPivot);
    legs.push({ upperPivot, lowerPivot, phase });
  });

  root.scale.setScalar(scale);

  return {
    group: root,
    animate(time, whatIf = false) {
      const spd = whatIf ? 2.8 : 1.5;
      const cyc = time * spd;

      bodyGroup.position.y = -0.35 + Math.abs(Math.sin(cyc)) * 0.06;
      bodyGroup.rotation.z = Math.sin(cyc) * 0.03;

      // Graceful multi-vertebrae neck browsing motion
      neckSegments.forEach((seg, nIdx) => {
        seg.rotation.z =
          Math.sin(time * 1.4 - nIdx * 0.25) * 0.045 + (whatIf ? 0.035 : 0.0);
        seg.rotation.y = Math.cos(time * 1.1 - nIdx * 0.2) * 0.05;
      });
      headGroup.rotation.z = Math.sin(time * 2.5) * 0.14;

      tailSegments.forEach((seg, tIdx) => {
        seg.rotation.y = Math.sin(cyc - tIdx * 0.4) * 0.14;
      });

      legs.forEach(({ upperPivot, lowerPivot, phase }) => {
        const s = Math.sin(cyc + phase);
        upperPivot.rotation.z = s * 0.28;
        lowerPivot.rotation.z = Math.max(0, -Math.cos(cyc + phase)) * 0.36;
      });
    },
  };
}

/**
 * 4. SOARING ARTICULATED PTERANODON RIG (2-Joint Flapping Membrane Wings + Cranial Crest)
 */
export function buildHyperPteranodon(scale = 1.0) {
  const root = new THREE.Group();
  const skinMat = makePBRMaterial('pteroSkin', '#b45309', '#78350f', {
    style: 'scales',
    roughness: 0.45,
  });
  const wingMat = makePBRMaterial('pteroWing', '#dc2626', '#7f1d1d', {
    roughness: 0.4,
    doubleSide: true,
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.35, 8, 12), skinMat);
  body.rotation.z = Math.PI / 2;
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.55, 8), skinMat);
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.42, 0.04, 0);
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.42, 8), wingMat);
  crest.rotation.z = Math.PI / 2.3;
  crest.position.set(-0.08, 0.16, 0);
  root.add(body, beak, crest);

  const wings = [];
  [-1, 1].forEach((side) => {
    const innerPivot = new THREE.Group();
    innerPivot.position.set(0.05, 0.04, side * 0.09);
    const innerWing = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.65), wingMat);
    innerWing.position.set(-0.02, 0, side * 0.32);
    innerPivot.add(innerWing);

    const outerPivot = new THREE.Group();
    outerPivot.position.set(0, 0, side * 0.64);
    const outerWing = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.85, 4), wingMat);
    outerWing.scale.set(1.0, 1.0, 0.15);
    outerWing.rotation.x = side * (Math.PI / 2);
    outerWing.position.set(-0.05, 0, side * 0.42);
    outerPivot.add(outerWing);

    innerPivot.add(outerPivot);
    root.add(innerPivot);
    wings.push({ innerPivot, outerPivot, side });
  });

  root.scale.setScalar(scale);

  return {
    group: root,
    animate(time, speed = 1.0, phase = 0) {
      const flap = Math.sin(time * 6.5 * speed + phase);
      wings.forEach(({ innerPivot, outerPivot, side }) => {
        innerPivot.rotation.x = side * flap * 0.52;
        outerPivot.rotation.x = side * Math.sin(time * 6.5 * speed + phase - 0.6) * 0.42;
      });
    },
  };
}

/**
 * 5. HYPER-REALISTIC WOOLLY MAMMOTH RIG
 * Sculpted shaggy hump & torso, 7-segment prehensile curling trunk,
 * massive spiraled Pleistocene ivory tusks, and 4 articulated walking legs.
 */
export function buildHyperMammoth(scale = 1.0) {
  const root = new THREE.Group();

  const furMat = makePBRMaterial('shaggyMammothFur', '#5c2d16', '#2b1308', {
    style: 'fur',
    roughness: 0.92,
    bumpScale: 0.16,
  });
  const ivoryMat = new THREE.MeshStandardMaterial({
    color: 0xfefce8,
    roughness: 0.22,
    metalness: 0.08,
  });

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // High shoulder dome & sloped Pleistocene back
  const torso = buildLoftedOrganMesh(
    [
      new THREE.Vector3(-0.85, -0.15, 0),
      new THREE.Vector3(-0.2, 0.15, 0),
      new THREE.Vector3(0.45, 0.35, 0),
      new THREE.Vector3(0.82, 0.18, 0),
    ],
    [
      { rx: 0.45, ry: 0.52 },
      { rx: 0.66, ry: 0.78 },
      { rx: 0.72, ry: 0.92 },
      { rx: 0.52, ry: 0.64 },
    ],
    furMat
  );
  bodyGroup.add(torso);

  // High Domed Cranial Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0.92, 0.42, 0);
  bodyGroup.add(headGroup);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.48, 22, 22), furMat);
  cranium.scale.set(1.05, 1.32, 0.95);
  headGroup.add(cranium);

  // 7-Segment Prehensile Curling Trunk
  const trunkSegments = [];
  let trunkParent = headGroup;
  for (let s = 0; s < 7; s++) {
    const seg = new THREE.Group();
    seg.position.set(s === 0 ? 0.38 : 0.04, s === 0 ? -0.12 : -0.18, 0);
    const r = 0.16 * Math.pow(0.84, s);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, 0.14, 8, 12), furMat);
    m.position.y = -0.08;
    seg.add(m);
    trunkParent.add(seg);
    trunkSegments.push(seg);
    trunkParent = seg;
  }

  // Pair of Double-Curved Spiraled Ivory Tusks
  [-0.34, 0.34].forEach((zSide) => {
    const tusk = buildLoftedOrganMesh(
      [
        new THREE.Vector3(0.25, -0.18, zSide * 0.8),
        new THREE.Vector3(0.68, -0.48, zSide * 1.25),
        new THREE.Vector3(1.18, -0.32, zSide * 1.15),
        new THREE.Vector3(1.42, 0.18, zSide * 0.75),
      ],
      [
        { rx: 0.095, ry: 0.095 },
        { rx: 0.08, ry: 0.08 },
        { rx: 0.055, ry: 0.055 },
        { rx: 0.015, ry: 0.015 },
      ],
      ivoryMat,
      14,
      24
    );
    headGroup.add(tusk);
  });

  // 4 Articulated Shaggy Pillar Legs
  const legs = [];
  [
    [0.52, -0.35, 0.42, 0],
    [0.52, -0.35, -0.42, Math.PI],
    [-0.58, -0.42, 0.4, Math.PI * 0.5],
    [-0.58, -0.42, -0.4, Math.PI * 1.5],
  ].forEach(([lx, ly, lz, phase]) => {
    const upperPivot = new THREE.Group();
    upperPivot.position.set(lx, ly, lz);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.48, 10, 14), furMat);
    upper.position.y = -0.26;
    upperPivot.add(upper);

    const lowerPivot = new THREE.Group();
    lowerPivot.position.set(0, -0.52, 0);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.52, 12), furMat);
    lower.position.y = -0.24;
    lowerPivot.add(lower);

    upperPivot.add(lowerPivot);
    bodyGroup.add(upperPivot);
    legs.push({ upperPivot, lowerPivot, phase });
  });

  root.scale.setScalar(scale);

  return {
    group: root,
    animate(time, whatIf = false) {
      const spd = whatIf ? 3.2 : 1.8;
      const cyc = time * spd;
      bodyGroup.position.y = Math.abs(Math.sin(cyc)) * 0.07;
      bodyGroup.rotation.z = Math.sin(cyc) * 0.035;
      headGroup.rotation.z = Math.sin(time * 1.6) * 0.08;

      trunkSegments.forEach((seg, idx) => {
        seg.rotation.z = 0.08 + Math.sin(time * 2.4 - idx * 0.35) * 0.16;
        seg.rotation.x = Math.cos(time * 1.7 - idx * 0.3) * 0.06;
      });

      legs.forEach(({ upperPivot, lowerPivot, phase }) => {
        const s = Math.sin(cyc + phase);
        upperPivot.rotation.z = s * 0.32;
        lowerPivot.rotation.z = Math.max(0, -Math.cos(cyc + phase)) * 0.38;
      });
    },
  };
}

/**
 * 6. HYPER-ARTICULATED HOMININ / HUMAN RIG
 * Full bipedal skeleton: Pelvis -> Breathing Torso -> Sculpted Head (brow, nose, eyes, hair)
 * + 2-Joint Walking Legs (Thigh -> Knee -> Shin -> Foot)
 * + 2-Joint Swinging/Working Arms (Shoulder -> Elbow -> Hand + Tool/Weapon).
 */
export function buildHyperHuman({
  skinHex = '#b45309',
  garmentHex = '#78350f',
  heightScale = 1.0,
  stocky = false,
  browRidge = false,
  tool = 'none', // 'spear' | 'torch' | 'handaxe' | 'bow' | 'shieldSword' | 'astronaut' | 'robot'
}) {
  const root = new THREE.Group();

  const isRobot = tool === 'robot';
  const isAstro = tool === 'astronaut';

  const skinMat = isRobot
    ? new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.82, roughness: 0.2 })
    : isAstro
    ? new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })
    : makePBRMaterial('humanSkin', skinHex, '#451a03', { roughness: 0.62, bumpScale: 0.02 });

  const tunicMat = isRobot
    ? new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
      })
    : isAstro
    ? new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    : makePBRMaterial('garment', garmentHex, '#292524', {
        style: 'fur',
        roughness: 0.85,
      });

  const pelvis = new THREE.Group();
  pelvis.position.y = 0.0;
  root.add(pelvis);

  const wScale = stocky ? 1.24 : 1.0;

  // Sculpted Torso & Shoulders
  const torso = buildLoftedOrganMesh(
    [
      new THREE.Vector3(0, -0.15, 0),
      new THREE.Vector3(0, 0.22, 0),
      new THREE.Vector3(0, 0.56, 0),
    ],
    [
      { rx: 0.16 * wScale, ry: 0.12 * wScale },
      { rx: 0.21 * wScale, ry: 0.15 * wScale },
      { rx: 0.24 * wScale, ry: 0.16 * wScale },
    ],
    tunicMat,
    18,
    18
  );
  pelvis.add(torso);

  // Head & Facial Features
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.78, 0);
  pelvis.add(headGroup);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), skinMat);
  cranium.scale.set(stocky ? 1.06 : 0.95, 1.12, stocky ? 1.14 : 1.02);
  headGroup.add(cranium);

  if (isAstro || isRobot) {
    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 18, 18),
      new THREE.MeshStandardMaterial({
        color: isAstro ? 0xfbbf24 : 0x38bdf8,
        metalness: 0.92,
        roughness: 0.1,
        emissive: isRobot ? 0x0284c7 : 0x000000,
        emissiveIntensity: 0.6,
      })
    );
    visor.position.set(0, 0.02, 0.06);
    headGroup.add(visor);
  } else {
    // Nose, Brow & Eyes
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 8), skinMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.0, 0.2);
    headGroup.add(nose);

    if (browRidge) {
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.055, 0.14), skinMat);
      brow.position.set(0, 0.08, 0.15);
      headGroup.add(brow);
    }

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.205, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
      makePBRMaterial('hair', '#1c1917', '#09090b', { style: 'fur' })
    );
    hair.position.y = 0.02;
    headGroup.add(hair);
  }

  // 2-Joint Articulated Legs (Hip -> Knee -> Ankle/Foot)
  const legs = [];
  [-0.12 * wScale, 0.12 * wScale].forEach((xSide, idx) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(xSide, -0.14, 0);
    pelvis.add(hipPivot);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075 * wScale, 0.34, 8, 12), skinMat);
    thigh.position.y = -0.2;
    hipPivot.add(thigh);

    const kneePivot = new THREE.Group();
    kneePivot.position.set(0, -0.4, 0);
    hipPivot.add(kneePivot);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.06 * wScale, 0.34, 8, 12), skinMat);
    shin.position.y = -0.2;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.2), skinMat);
    foot.position.set(0, -0.4, 0.05);
    kneePivot.add(shin, foot);

    legs.push({ hipPivot, kneePivot, phase: idx * Math.PI });
  });

  // 2-Joint Articulated Arms (Shoulder -> Elbow -> Hand + Tool)
  const arms = [];
  [-0.27 * wScale, 0.27 * wScale].forEach((xSide, idx) => {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(xSide, 0.48, 0);
    pelvis.add(shoulderPivot);

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055 * wScale, 0.26, 8, 12), skinMat);
    upperArm.position.y = -0.15;
    shoulderPivot.add(upperArm);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, -0.32, 0);
    shoulderPivot.add(elbowPivot);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.048 * wScale, 0.24, 8, 12), skinMat);
    forearm.position.y = -0.14;
    elbowPivot.add(forearm);

    // Attach era tool/weapon to right hand (idx === 1)
    if (idx === 1) {
      if (tool === 'spear') {
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 1.95, 8),
          makePBRMaterial('spearWood', '#92400e', '#451a03')
        );
        shaft.rotation.x = Math.PI / 2.3;
        shaft.position.set(0, -0.24, 0.35);
        const flintTip = new THREE.Mesh(
          new THREE.ConeGeometry(0.05, 0.24, 6),
          makePBRMaterial('flintTip', '#64748b', '#cbd5e1', { roughness: 0.25 })
        );
        flintTip.rotation.x = Math.PI / 2.3;
        flintTip.position.set(0, -0.02, 1.32);
        elbowPivot.add(shaft, flintTip);
      } else if (tool === 'torch') {
        const stick = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.02, 0.65, 8),
          makePBRMaterial('torchWood', '#78350f', '#451a03')
        );
        stick.rotation.x = Math.PI / 3;
        stick.position.set(0, -0.22, 0.2);
        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(0.11, 0.32, 12),
          new THREE.MeshBasicMaterial({ color: 0xfde047 })
        );
        flame.position.set(0, -0.05, 0.48);
        elbowPivot.add(stick, flame);
      } else if (tool === 'handaxe') {
        const axe = new THREE.Mesh(
          new THREE.ConeGeometry(0.09, 0.26, 6),
          makePBRMaterial('handAxeStone', '#475569', '#94a3b8')
        );
        axe.scale.set(1, 1, 0.45);
        axe.rotation.x = Math.PI / 2;
        axe.position.set(0, -0.26, 0.14);
        elbowPivot.add(axe);
      }
    }

    arms.push({ shoulderPivot, elbowPivot, phase: idx * Math.PI });
  });

  root.scale.setScalar(heightScale);

  return {
    group: root,
    pelvis,
    headGroup,
    legs,
    arms,
    animate(time, speed = 2.4, phaseOffset = 0, action = 'walk') {
      const cyc = time * speed + phaseOffset;

      pelvis.position.y = Math.abs(Math.sin(cyc)) * 0.06;
      pelvis.rotation.y = Math.sin(cyc) * 0.08;
      headGroup.rotation.y = Math.sin(time * 1.5 + phaseOffset) * 0.18;

      legs.forEach(({ hipPivot, kneePivot, phase }) => {
        const s = Math.sin(cyc + phase);
        hipPivot.rotation.x = s * 0.48;
        kneePivot.rotation.x = Math.max(0, -Math.cos(cyc + phase)) * 0.62;
      });

      arms.forEach(({ shoulderPivot, elbowPivot, phase }, idx) => {
        if (action === 'knap' && idx === 1) {
          shoulderPivot.rotation.x = -0.6 + Math.sin(time * 7) * 0.35;
          elbowPivot.rotation.x = -0.85 + Math.cos(time * 7) * 0.4;
        } else if (action === 'paint' && idx === 1) {
          shoulderPivot.rotation.x = -0.95 + Math.sin(time * 3.5) * 0.25;
          shoulderPivot.rotation.z = Math.cos(time * 2.8) * 0.22;
          elbowPivot.rotation.x = -0.45;
        } else {
          const s = Math.sin(cyc + phase + Math.PI);
          shoulderPivot.rotation.x = s * 0.42;
          elbowPivot.rotation.x = -0.35 - Math.max(0, s) * 0.35;
        }
      });
    },
  };
}

/**
 * 7. HYPER-REALISTIC STEGOSAURUS RIG (12 Alternating Dermal Plates + 4-Spiked Thagomizer Tail)
 */
export function buildHyperStegosaurus(scale = 1.0) {
  const root = new THREE.Group();
  const skinMat = makePBRMaterial('stegoHide', '#4d7c0f', '#1a2e05', {
    style: 'scales',
    roughness: 0.58,
    bumpScale: 0.12,
  });
  const plateMat = makePBRMaterial('stegoPlate', '#ea580c', '#7c2d12', {
    style: 'scales',
    roughness: 0.48,
  });
  const spikeMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.25 });

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const torso = buildLoftedOrganMesh(
    [
      new THREE.Vector3(-0.7, -0.05, 0),
      new THREE.Vector3(0.0, 0.24, 0),
      new THREE.Vector3(0.68, -0.14, 0),
    ],
    [
      { rx: 0.34, ry: 0.38 },
      { rx: 0.56, ry: 0.68 },
      { rx: 0.28, ry: 0.32 },
    ],
    skinMat
  );
  bodyGroup.add(torso);

  // 10 Alternating Diamond Dorsal Plates along the arched spine
  for (let i = 0; i < 10; i++) {
    const u = i / 9;
    const archY = Math.sin(u * Math.PI) * 0.65 + 0.18;
    const plateSize = 0.16 + Math.sin(u * Math.PI) * 0.24;
    const plate = new THREE.Mesh(new THREE.ConeGeometry(plateSize, plateSize * 1.65, 4), plateMat);
    plate.scale.set(1.2, 1.0, 0.18);
    plate.position.set(-0.62 + u * 1.25, archY, (i % 2 === 0 ? 1 : -1) * 0.08);
    bodyGroup.add(plate);
  }

  const headPivot = new THREE.Group();
  headPivot.position.set(0.68, -0.14, 0);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.48, 10), skinMat);
  head.rotation.z = -Math.PI / 2;
  head.position.x = 0.22;
  headPivot.add(head);
  bodyGroup.add(headPivot);

  // 5-Segment Whip Tail + 4 Thagomizer Spikes
  const tailSegments = [];
  let tailParent = bodyGroup;
  for (let s = 0; s < 5; s++) {
    const seg = new THREE.Group();
    seg.position.set(s === 0 ? -0.68 : -0.24, 0, 0);
    const m = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.24 * Math.pow(0.75, s), 0.2, 8, 12),
      skinMat
    );
    m.rotation.z = Math.PI / 2;
    m.position.x = -0.12;
    seg.add(m);
    if (s === 4) {
      [-1, 1].forEach((side) => {
        [0, 0.12].forEach((xOff) => {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.38, 8), spikeMat);
          spike.rotation.x = side * (Math.PI / 2.6);
          spike.position.set(-0.1 - xOff, 0.08, side * 0.18);
          seg.add(spike);
        });
      });
    }
    tailParent.add(seg);
    tailSegments.push(seg);
    tailParent = seg;
  }

  // 4 Walking Legs
  const legs = [];
  [
    [0.45, -0.22, 0.34, 0, 0.78],
    [0.45, -0.22, -0.34, Math.PI, 0.78],
    [-0.42, -0.1, 0.38, Math.PI * 0.5, 1.05],
    [-0.42, -0.1, -0.38, Math.PI * 1.5, 1.05],
  ].forEach(([lx, ly, lz, phase, sc]) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(lx, ly, lz);
    const legMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.48 * sc, 8, 12), skinMat);
    legMesh.position.y = -0.28 * sc;
    legPivot.add(legMesh);
    bodyGroup.add(legPivot);
    legs.push({ legPivot, phase });
  });

  root.scale.setScalar(scale);

  return {
    group: root,
    animate(time, whatIf = false) {
      const cyc = time * (whatIf ? 3.5 : 1.9);
      bodyGroup.position.y = Math.abs(Math.sin(cyc)) * 0.05;
      headPivot.rotation.z = Math.sin(time * 2.1) * 0.14;
      tailSegments.forEach((seg, idx) => {
        seg.rotation.y = Math.sin(cyc * 1.4 - idx * 0.4) * (whatIf ? 0.32 : 0.18);
      });
      legs.forEach(({ legPivot, phase }) => {
        legPivot.rotation.z = Math.sin(cyc + phase) * 0.32;
      });
    },
  };
}

/**
 * 8. HYPER-REALISTIC TIKTAALIK AMPHIBIOUS TETRAPODOMORPH RIG
 * 7-segment undulating spine & tail fin + 4 bendable wristed lobe-fins crawling onto land.
 */
export function buildHyperTiktaalik(scale = 1.0) {
  const root = new THREE.Group();
  const skinMat = makePBRMaterial('tikScales', '#b45309', '#451a03', {
    style: 'scales',
    roughness: 0.38,
    bumpScale: 0.1,
  });

  const spineSegments = [];
  let parentSeg = root;
  for (let s = 0; s < 7; s++) {
    const seg = new THREE.Group();
    seg.position.set(s === 0 ? 0.45 : -0.24, 0, 0);
    const r = s === 0 ? 0.26 : 0.28 * Math.pow(0.82, s);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, 0.22, 10, 14), skinMat);
    m.rotation.z = Math.PI / 2;
    m.scale.set(1.0, 1.0, 0.65);
    seg.add(m);
    parentSeg.add(seg);
    spineSegments.push(seg);
    parentSeg = seg;
  }

  // Flat Crocodile-like Skull with Raised Dorsal Eyes
  const skull = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.68, 12), skinMat);
  skull.rotation.z = -Math.PI / 2;
  skull.scale.set(0.55, 1.0, 1.15);
  skull.position.set(0.38, 0.02, 0);
  spineSegments[0].add(skull);

  [-0.12, 0.12].forEach((zEye) => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    eye.position.set(0.22, 0.15, zEye);
    spineSegments[0].add(eye);
  });

  // 4 Bendable Wristed Lobe-Fins
  const fins = [];
  [
    [spineSegments[0], 0.05, -0.1, 0.28, 0],
    [spineSegments[0], 0.05, -0.1, -0.28, Math.PI],
    [spineSegments[2], 0, -0.08, 0.22, Math.PI * 0.5],
    [spineSegments[2], 0, -0.08, -0.22, Math.PI * 1.5],
  ].forEach(([seg, fx, fy, fz, phase]) => {
    const finPivot = new THREE.Group();
    finPivot.position.set(fx, fy, fz);
    const upperFin = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.22, 8, 10), skinMat);
    upperFin.position.set(0, -0.12, fz > 0 ? 0.08 : -0.08);
    upperFin.rotation.x = fz > 0 ? 0.5 : -0.5;
    const wristPaddle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.18), skinMat);
    wristPaddle.position.set(0.05, -0.24, fz > 0 ? 0.14 : -0.14);
    finPivot.add(upperFin, wristPaddle);
    seg.add(finPivot);
    fins.push({ finPivot, phase });
  });

  root.scale.setScalar(scale);

  return {
    group: root,
    animate(time, whatIf = false) {
      const spd = whatIf ? 4.2 : 2.5;
      const cyc = time * spd;
      spineSegments.forEach((seg, idx) => {
        seg.rotation.y = Math.sin(cyc - idx * 0.55) * 0.18;
      });
      fins.forEach(({ finPivot, phase }) => {
        finPivot.rotation.z = Math.sin(cyc + phase) * 0.42;
      });
    },
  };
}

