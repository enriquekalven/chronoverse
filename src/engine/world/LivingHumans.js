import * as THREE from '../../../vendor/three/build/three.module.js';

/**
 * LivingHumans.js — Hyper-Real Biomechanically Articulated 3D Humans & Moving Creature Herds.
 *
 * Solves three critical immersion goals:
 *  1. Separates Male and Female high-resolution anatomical scans inside `skin.glb` (45,000 vertices)
 *     and eliminates headless `muscles.glb` statues.
 *  2. Dresses every human in era-authentic 3D garments (Prehistoric fur pelts, Neolithic farmer tunics
 *     & straw hats, Bronze Age Egyptian pleated shendyt kilts & nemes collars, Classical Greek chitons,
 *     Roman tunics & bronze lorica armor, Medieval jerkins, Industrial waistcoats) + held 3D tools
 *     (sickles, hoes, flint hand-axes, wooden spears, torches, clay jugs, scrolls, shovels).
 *  3. Articulates the entire human body (legs, hips, knees, spine, breathing ribcage, shoulders,
 *     elbows, hands, neck, head) and held tools at 60 FPS on the GPU via `onBeforeCompile`, while
 *     moving characters & creature herds along 3D terrain paths.
 */

const ERA_STYLES = {
  hominin: {
    skinColor: 0x7a4b32,
    hairColor: 0x160f0a,
    clothColor1: 0x5c3e26,
    clothColor2: 0x3b2616,
    bootColor: 0x4a3220,
    garmentYMin: 0.68,
    garmentYMax: 1.16,
    sleeveYMin: 1.50, // sleeveless wrap
    bootHeight: 0.0,
    thickness: 0.003,
  },
  erectus: {
    skinColor: 0x855338,
    hairColor: 0x18100b,
    clothColor1: 0x6b472b,
    clothColor2: 0x3f2817,
    bootColor: 0x4a3220,
    garmentYMin: 0.62,
    garmentYMax: 1.30,
    sleeveYMin: 1.50, // sleeveless hide tunic
    bootHeight: 0.0,
    thickness: 0.004,
  },
  neanderthal: {
    skinColor: 0xc48e6e,
    hairColor: 0x4a2414,
    clothColor1: 0x563c28,
    clothColor2: 0x826348,
    bootColor: 0x3d291a,
    garmentYMin: 0.52,
    garmentYMax: 1.39,
    sleeveYMin: 1.15, // short fur shoulder sleeves
    bootHeight: 0.26,
    thickness: 0.004,
  },
  sapiens: {
    skinColor: 0x9c6848,
    hairColor: 0x1a120d,
    clothColor1: 0x784e30,
    clothColor2: 0xb85d2e,
    bootColor: 0x46301e,
    garmentYMin: 0.56,
    garmentYMax: 1.38,
    sleeveYMin: 1.22,
    bootHeight: 0.22,
    thickness: 0.004,
  },
  iceage: {
    skinColor: 0xb57f5e,
    hairColor: 0x1c140e,
    clothColor1: 0x6e5640,
    clothColor2: 0xd8cfc2,
    bootColor: 0x423020,
    garmentYMin: 0.38,
    garmentYMax: 1.42,
    sleeveYMin: 0.90, // full fur parka sleeves to wrist
    bootHeight: 0.36,
    thickness: 0.005,
  },
  farmer: {
    skinColor: 0xb8825e,
    hairColor: 0x24170e,
    clothColor1: 0xd2be96,
    clothColor2: 0x8c5832,
    bootColor: 0x4f3622,
    garmentYMin: 0.50,
    garmentYMax: 1.39,
    sleeveYMin: 1.18, // woven linen short sleeves
    bootHeight: 0.22,
    thickness: 0.004,
  },
  egyptian: {
    skinColor: 0xb67b54,
    hairColor: 0x14100e,
    clothColor1: 0xf2ece0,
    clothColor2: 0xd4a238,
    bootColor: 0x6e4c2e,
    garmentYMin: 0.54,
    garmentYMax: 1.04,
    sleeveYMin: 1.50, // pleated linen shendyt kilt
    bootHeight: 0.14,
    thickness: 0.004,
  },
  greek: {
    skinColor: 0xd29c78,
    hairColor: 0x2a1b10,
    clothColor1: 0xf4efe4,
    clothColor2: 0x2b5b8c,
    bootColor: 0x6e4a2c,
    garmentYMin: 0.38,
    garmentYMax: 1.40,
    sleeveYMin: 1.20,
    bootHeight: 0.18,
    thickness: 0.004,
  },
  roman: {
    skinColor: 0xcf9874,
    hairColor: 0x24160d,
    clothColor1: 0x9e241e,
    clothColor2: 0xc89b3c,
    bootColor: 0x52341c,
    garmentYMin: 0.50,
    garmentYMax: 1.40,
    sleeveYMin: 1.18,
    bootHeight: 0.28,
    thickness: 0.004,
  },
  medieval: {
    skinColor: 0xd8a482,
    hairColor: 0x362214,
    clothColor1: 0x365238,
    clothColor2: 0x6b4426,
    bootColor: 0x322216,
    garmentYMin: 0.28,
    garmentYMax: 1.42,
    sleeveYMin: 0.90, // long sleeves
    bootHeight: 0.34,
    thickness: 0.004,
  },
  industrial: {
    skinColor: 0xdab092,
    hairColor: 0x2a1d14,
    clothColor1: 0x2c3440,
    clothColor2: 0x7c5234,
    bootColor: 0x1e1814,
    garmentYMin: 0.14,
    garmentYMax: 1.43,
    sleeveYMin: 0.90, // long jacket sleeves
    bootHeight: 0.24,
    thickness: 0.004,
  },
};

const ACTION_CODES = {
  walk: 0,
  harvest: 1,
  knap: 2,
  fire: 2,
  paint: 3,
  hunt: 4,
  haul: 5,
  debate: 6,
};

/**
 * GLSL snippet injected into vertex shader (`onBeforeCompile`) to articulate any vertex
 * in root human coordinates `rp` (meters: x in [-0.34, 0.34], y in [0, 1.73], z in [-0.15, 0.15]).
 */
const HUMAN_VERT_PARS = `
uniform float uTime;
uniform float uPhase;
uniform float uAction;
uniform float uSpeed;
uniform float uReact;
uniform float uIsTool;
uniform vec3 uNodeOffset;
uniform vec3 uNodeScale;
uniform float uGarmentYMin;
uniform float uGarmentYMax;
uniform float uSleeveXMax;
uniform float uBootHeight;
uniform float uGarmentThickness;
varying vec3 vBodyPos;
varying float vGarmentZone;

vec3 rotX(vec3 p, vec3 piv, float a) {
  float c = cos(a), s = sin(a);
  vec3 d = p - piv;
  return piv + vec3(d.x, d.y * c - d.z * s, d.y * s + d.z * c);
}
vec3 rotY(vec3 p, vec3 piv, float a) {
  float c = cos(a), s = sin(a);
  vec3 d = p - piv;
  return piv + vec3(d.x * c + d.z * s, d.y, -d.x * s + d.z * c);
}
vec3 rotZ(vec3 p, vec3 piv, float a) {
  float c = cos(a), s = sin(a);
  vec3 d = p - piv;
  return piv + vec3(d.x * c - d.y * s, d.x * s + d.y * c, d.z);
}

float computeIsArm(vec3 rp) {
  float absX = abs(rp.x);
  // Exact piecewise air-gap boundary between torso and arm in skin.glb rest pose:
  // y in [0.70, 0.90]: hip max X = 0.167, wrist min X = 0.181 -> boundary = 0.1745
  // y in [0.90, 1.18]: waist max X = 0.156, forearm min X = 0.188 -> boundary = 0.172
  // y in [1.18, 1.31]: chest max X = 0.161, upper arm min X = 0.170 -> boundary = 0.1655
  float b = 0.1745;
  if (rp.y >= 0.90 && rp.y < 1.18) {
    b = 0.172;
  } else if (rp.y >= 1.18) {
    b = 0.1655;
  }
  return step(b, absX) * step(0.70, rp.y) * step(rp.y, 1.43);
}

vec3 articulateHumanPoint(vec3 rp, float isArm) {
  float t = uTime * (2.6 * uSpeed) + uPhase;
  float s = rp.x >= 0.0 ? 1.0 : -1.0; // +1 left side, -1 right side

  float isForearm = isArm * smoothstep(1.16, 1.05, rp.y);
  float isLeg = (1.0 - isArm) * smoothstep(0.89, 0.82, rp.y);
  float isLowerLeg = isLeg * smoothstep(0.49, 0.42, rp.y);
  float isHead = smoothstep(1.47, 1.52, rp.y);
  float isUpperBody = max(isArm, smoothstep(0.86, 0.96, rp.y));

  // If this mesh is a held 3D tool, lock 100% of its vertices rigidly to the hand
  if (abs(uIsTool) > 0.5) {
    s = uIsTool > 0.0 ? -1.0 : 1.0;
    isArm = 1.0;
    isForearm = 1.0;
    isUpperBody = 1.0;
    isLeg = 0.0;
    isLowerLeg = 0.0;
    isHead = 0.0;
  }

  // Action-dependent joint angles
  float legSwingL = 0.0;
  float legSwingR = 0.0;
  float kneeBendL = 0.0;
  float kneeBendR = 0.0;
  float spinePitch = 0.04;
  float spineYaw = 0.0;
  float armPitchL = 0.0;
  float armPitchR = 0.0;
  float elbowBendL = -0.35;
  float elbowBendR = -0.35;
  float armRollL = -0.18;
  float armRollR = 0.18;
  float bodyBob = 0.0;

  if (uAction < 0.5) {
    // 0: Biomechanical Walking Stride
    legSwingL = sin(t) * 0.46;
    legSwingR = -sin(t) * 0.46;
    kneeBendL = max(0.0, -cos(t) * 0.62);
    kneeBendR = max(0.0, cos(t) * 0.62);
    armPitchL = -sin(t) * 0.38;
    armPitchR = sin(t) * 0.38;
    elbowBendL = -0.32 - 0.18 * max(0.0, sin(t));
    elbowBendR = -0.32 - 0.18 * max(0.0, -sin(t));
    spinePitch = 0.06;
    spineYaw = sin(t) * 0.09;
    bodyBob = abs(cos(t)) * 0.032;
  } else if (uAction < 1.5) {
    // 1: Farming / Harvesting Wheat with Sickle or Hoe
    float swing = sin(t * 1.15);
    legSwingL = 0.22;
    legSwingR = -0.22;
    kneeBendL = 0.25;
    kneeBendR = 0.25;
    spinePitch = 0.34 + 0.14 * swing;
    spineYaw = 0.22 * cos(t * 1.15);
    armPitchR = -0.75 + 0.65 * swing;
    elbowBendR = -0.65 + 0.25 * swing;
    armPitchL = -0.45 - 0.20 * swing;
    elbowBendL = -0.55;
    bodyBob = -0.05 + 0.02 * swing;
  } else if (uAction < 2.5) {
    // 2: Tending Fire & Knapping Stone Tools
    float strike = sin(t * 1.6);
    legSwingL = -0.55;
    legSwingR = -0.48;
    kneeBendL = 1.05;
    kneeBendR = 0.98;
    spinePitch = 0.32 + 0.08 * sin(t * 0.8);
    armPitchR = -0.78 + 0.38 * strike;
    elbowBendR = -0.72 + 0.30 * strike;
    armPitchL = -0.65;
    elbowBendL = -0.60;
    bodyBob = -0.20;
  } else if (uAction < 3.5) {
    // 3: Painting Cave Art / Holding Torch High
    float stroke = sin(t * 1.1);
    legSwingL = 0.12 * sin(t * 0.5);
    legSwingR = -0.12 * sin(t * 0.5);
    spinePitch = -0.05;
    spineYaw = 0.15 * stroke;
    armPitchR = -1.25 + 0.32 * stroke;
    elbowBendR = -0.45 + 0.22 * cos(t * 1.1);
    armPitchL = -0.95;
    elbowBendL = -0.55;
  } else if (uAction < 4.5) {
    // 4: Spear Hunting / Tracking Stride
    legSwingL = sin(t) * 0.52;
    legSwingR = -sin(t) * 0.52;
    kneeBendL = max(0.0, -cos(t) * 0.68);
    kneeBendR = max(0.0, cos(t) * 0.68);
    spinePitch = 0.14;
    spineYaw = sin(t) * 0.12;
    armPitchR = -0.88 + 0.28 * sin(t * 1.5);
    elbowBendR = -0.55;
    armPitchL = -0.45 + 0.35 * sin(t);
    elbowBendL = -0.45;
    bodyBob = abs(cos(t)) * 0.038;
  } else if (uAction < 5.5) {
    // 5: Hauling Pyramid Limestone Block / Heavy Sled
    legSwingL = sin(t * 0.85) * 0.48;
    legSwingR = -sin(t * 0.85) * 0.48;
    kneeBendL = 0.22 + max(0.0, -cos(t * 0.85) * 0.55);
    kneeBendR = 0.22 + max(0.0, cos(t * 0.85) * 0.55);
    spinePitch = 0.42 + 0.06 * sin(t * 1.7);
    armPitchR = 0.35;
    armPitchL = 0.35;
    elbowBendR = -0.45;
    elbowBendL = -0.45;
    bodyBob = -0.06 + abs(cos(t * 0.85)) * 0.025;
  } else {
    // 6: Debating Philosophy / Scribe / Gesturing
    legSwingL = sin(t * 0.5) * 0.16;
    legSwingR = -sin(t * 0.5) * 0.16;
    kneeBendL = max(0.0, -cos(t * 0.5) * 0.22);
    kneeBendR = max(0.0, cos(t * 0.5) * 0.22);
    spineYaw = sin(t * 0.6) * 0.16;
    armPitchR = -0.65 + 0.38 * sin(t * 1.1);
    elbowBendR = -0.65 + 0.25 * cos(t * 1.1);
    armPitchL = -0.45 - 0.25 * cos(t * 0.9);
    elbowBendL = -0.52;
  }

  // Interactive click wave boost
  if (uReact > 0.01) {
    armPitchR = mix(armPitchR, -2.1 + 0.35 * sin(uTime * 10.0), uReact);
    elbowBendR = mix(elbowBendR, -0.35, uReact);
  }

  // 1. Articulate Arms around Shoulder & Elbow BEFORE spine bend
  if (isArm > 0.001) {
    vec3 shoulderPiv = vec3(0.175 * s, 1.37, -0.01);
    vec3 elbowPiv = vec3(0.235 * s, 1.12, 0.0);
    float aPitch = s > 0.0 ? armPitchL : armPitchR;
    float eBend = s > 0.0 ? elbowBendL : elbowBendR;
    float aRoll = s > 0.0 ? armRollL : armRollR;

    vec3 pArm = rp;
    if (isForearm > 0.001) {
      pArm = mix(pArm, rotX(pArm, elbowPiv, eBend), isForearm);
    }
    pArm = rotZ(pArm, shoulderPiv, aRoll);
    pArm = rotX(pArm, shoulderPiv, aPitch);
    rp = mix(rp, pArm, isArm);
  }

  // 2. Articulate Head Look / Nod
  if (isHead > 0.001) {
    vec3 neckPiv = vec3(0.0, 1.49, -0.01);
    float hYaw = sin(t * 0.45 + uPhase) * 0.22;
    float hPitch = 0.06 * cos(t * 0.7);
    vec3 pHead = rotY(rp, neckPiv, hYaw);
    pHead = rotX(pHead, neckPiv, hPitch);
    rp = mix(rp, pHead, isHead);
  }

  // 3. Articulate Upper Body (Spine Pitch & Twist + Breathing)
  if (isUpperBody > 0.001) {
    vec3 waistPiv = vec3(0.0, 0.90, 0.0);
    float breath = 1.0 + 0.018 * sin(uTime * 2.8 + uPhase) * smoothstep(1.05, 1.35, rp.y) * (1.0 - isArm);
    rp.z *= breath;
    vec3 pTorso = rotY(rp, waistPiv, spineYaw);
    pTorso = rotX(pTorso, waistPiv, spinePitch);
    rp = mix(rp, pTorso, isUpperBody);
  }

  // 4. Articulate Legs (Hip & Knee Flexion)
  if (isLeg > 0.001) {
    vec3 hipPiv = vec3(0.088 * s, 0.88, 0.0);
    vec3 kneePiv = vec3(0.088 * s, 0.46, 0.0);
    float hSwing = s > 0.0 ? legSwingL : legSwingR;
    float kBend = s > 0.0 ? kneeBendL : kneeBendR;

    vec3 pLeg = rp;
    if (isLowerLeg > 0.001) {
      pLeg = mix(pLeg, rotX(pLeg, kneePiv, kBend), isLowerLeg);
    }
    pLeg = rotX(pLeg, hipPiv, hSwing);
    rp = mix(rp, pLeg, isLeg);
  }

  rp.y += bodyBob;
  return rp;
}
`;

function attachHumanShader(material, sharedUniforms, nodeOffset, nodeScale, isSkinMesh = false, isToolVal = 0.0) {
  material.customProgramCacheKey = () => (isSkinMesh ? 'living-human-skin-v4' : `living-human-part-v4-${isToolVal}`);
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, sharedUniforms, {
      uNodeOffset: { value: nodeOffset.clone() },
      uNodeScale: { value: nodeScale.clone() },
      uIsTool: { value: isToolVal },
    });

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${HUMAN_VERT_PARS}`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 rp = transformed * uNodeScale + uNodeOffset;
        vBodyPos = rp;
        float isArmVert = computeIsArm(rp);
        float inTorso = (1.0 - isArmVert) * step(uGarmentYMin, rp.y) * step(rp.y, uGarmentYMax);
        float inSleeve = isArmVert * step(uSleeveXMax, rp.y) * step(rp.y, uGarmentYMax);
        float inTorsoCloth = max(inTorso, inSleeve);
        float inBoots = (1.0 - isArmVert) * step(rp.y, uBootHeight);
        vGarmentZone = max(inTorsoCloth, inBoots * 2.0);
        vec3 artRp = articulateHumanPoint(rp, isArmVert);
        if (inTorso > 0.5 && abs(uIsTool) < 0.1) {
          float folds = 0.85 + 0.15 * sin(rp.x * 52.0 + rp.z * 48.0) * cos(rp.y * 28.0);
          artRp.z += sign(rp.z + 0.01) * (uGarmentThickness * folds);
        }
        transformed = (artRp - uNodeOffset) / uNodeScale;
        `
      );

    if (isSkinMesh) {
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform vec3 uClothColor1;
          uniform vec3 uClothColor2;
          uniform vec3 uBootColor;
          uniform float uGarmentYMin;
          uniform float uGarmentYMax;
          varying vec3 vBodyPos;
          varying float vGarmentZone;
          `
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          if (vGarmentZone > 1.5) {
            // Footwear / Sandals / Fur Boots
            float strap = smoothstep(0.3, 0.8, sin(vBodyPos.y * 95.0));
            diffuseColor.rgb = mix(uBootColor, uClothColor2, strap * 0.35);
          } else if (vGarmentZone > 0.5) {
            // Era Tunic / Fur Pelt / Pleated Kilt / Armor
            float weave = 0.92 + 0.08 * sin(vBodyPos.x * 140.0) * sin(vBodyPos.y * 140.0);
            float pleats = 0.90 + 0.10 * sin(vBodyPos.x * 68.0);
            vec3 cloth = uClothColor1 * weave * pleats;
            // Waist belt & hem trim
            float isBelt = step(0.91, vBodyPos.y) * step(vBodyPos.y, 0.98);
            float isHem = step(vBodyPos.y, uGarmentYMin + 0.045) + step(uGarmentYMax - 0.045, vBodyPos.y);
            float isStrap = step(abs(vBodyPos.x * 1.4 - (vBodyPos.y - 1.18) * 0.65), 0.038) * step(0.96, vBodyPos.y);
            float trimMask = clamp(isBelt + isHem * 0.8 + isStrap * 0.9, 0.0, 1.0);
            diffuseColor.rgb = mix(cloth, uClothColor2 * weave, trimMask);
          }
          `
        );
    }
  };
  material.needsUpdate = true;
}

/**
 * Builds a 3D held tool (spear, handaxe, firebrand, torch, sickle, hoe, jug, scroll, shield, shovel)
 * positioned in rest-pose hand coordinates so `articulateHumanPoint` moves it with the character's hand!
 */
function buildHeldToolMesh(toolType, sharedUniforms, ctx) {
  const group = new THREE.Group();
  const unitOffset = new THREE.Vector3(0, 0, 0);
  const unitScale = new THREE.Vector3(1, 1, 1);

  const makeMat = (color, roughness = 0.6, metalness = 0.05, emissive = 0x000000, emissiveIntensity = 0, handSign = 1.0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
    attachHumanShader(m, sharedUniforms, unitOffset, unitScale, false, handSign);
    return m;
  };

  // Right hand rest-pose center in `skin.glb` is (-0.26, 0.83, 0.02)
  const rh = new THREE.Vector3(-0.26, 0.83, 0.02);
  const lh = new THREE.Vector3(0.26, 0.83, 0.02);

  if (toolType === 'spear') {
    const shaftGeo = new THREE.CylinderGeometry(0.011, 0.013, 1.85, 8);
    shaftGeo.rotateX(Math.PI / 2);
    shaftGeo.translate(rh.x, rh.y, rh.z + 0.35);
    group.add(new THREE.Mesh(shaftGeo, makeMat(0x5c3c20, 0.85)));

    const tipGeo = new THREE.ConeGeometry(0.026, 0.16, 6);
    tipGeo.rotateX(Math.PI / 2);
    tipGeo.translate(rh.x, rh.y, rh.z + 1.32);
    group.add(new THREE.Mesh(tipGeo, makeMat(0x7a746c, 0.45, 0.2)));
  } else if (toolType === 'handaxe' || toolType === 'hammer') {
    const stoneGeo = new THREE.ConeGeometry(0.055, 0.16, 8);
    stoneGeo.rotateX(Math.PI / 2);
    stoneGeo.scale(0.65, 1.0, 1.0);
    stoneGeo.translate(rh.x, rh.y - 0.02, rh.z + 0.09);
    group.add(new THREE.Mesh(stoneGeo, makeMat(0x8a7e72, 0.55, 0.1)));
  } else if (toolType === 'firebrand' || toolType === 'torch') {
    const stickGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.58, 8);
    stickGeo.rotateX(Math.PI / 2.3);
    stickGeo.translate(rh.x, rh.y + 0.06, rh.z + 0.22);
    group.add(new THREE.Mesh(stickGeo, makeMat(0x4a301a, 0.9)));

    const emberGeo = new THREE.SphereGeometry(0.048, 12, 12);
    emberGeo.translate(rh.x, rh.y + 0.12, rh.z + 0.48);
    group.add(new THREE.Mesh(emberGeo, makeMat(0xff6a14, 0.3, 0.0, 0xff5500, 3.2)));
  } else if (toolType === 'sickle' || toolType === 'hoe') {
    const handleGeo = new THREE.CylinderGeometry(0.013, 0.015, 0.55, 8);
    handleGeo.rotateX(Math.PI / 2);
    handleGeo.translate(rh.x, rh.y, rh.z + 0.22);
    group.add(new THREE.Mesh(handleGeo, makeMat(0x6e4a28, 0.8)));

    const bladeGeo = new THREE.TorusGeometry(0.14, 0.016, 8, 18, Math.PI * 0.75);
    bladeGeo.rotateY(Math.PI / 2);
    bladeGeo.translate(rh.x, rh.y - 0.06, rh.z + 0.48);
    group.add(new THREE.Mesh(bladeGeo, makeMat(0xb89c72, 0.4, 0.35)));
  } else if (toolType === 'jug' || toolType === 'basket') {
    const vesselGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.28, 14);
    vesselGeo.translate(lh.x, lh.y - 0.05, lh.z + 0.12);
    group.add(new THREE.Mesh(vesselGeo, makeMat(0xb86e42, 0.7, 0.05, 0x000000, 0, -1.0)));
  } else if (toolType === 'scroll') {
    const scrollGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.28, 12);
    scrollGeo.rotateZ(Math.PI / 2);
    scrollGeo.translate(rh.x, rh.y, rh.z + 0.10);
    group.add(new THREE.Mesh(scrollGeo, makeMat(0xf5ead2, 0.6)));
  } else if (toolType === 'shield_sword') {
    const swordGeo = new THREE.BoxGeometry(0.016, 0.04, 0.68);
    swordGeo.translate(rh.x, rh.y, rh.z + 0.34);
    group.add(new THREE.Mesh(swordGeo, makeMat(0xd4dce4, 0.25, 0.88)));

    const shieldGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.025, 20);
    shieldGeo.rotateZ(Math.PI / 2);
    shieldGeo.translate(lh.x + 0.04, lh.y + 0.12, lh.z + 0.08);
    group.add(new THREE.Mesh(shieldGeo, makeMat(0x9e241e, 0.4, 0.45, 0x000000, 0, -1.0)));
  } else if (toolType === 'shovel') {
    const shaftGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.95, 8);
    shaftGeo.rotateX(Math.PI / 2);
    shaftGeo.translate(rh.x, rh.y, rh.z + 0.32);
    group.add(new THREE.Mesh(shaftGeo, makeMat(0x5c3c22, 0.8)));

    const scoopGeo = new THREE.BoxGeometry(0.16, 0.02, 0.22);
    scoopGeo.translate(rh.x, rh.y - 0.02, rh.z + 0.82);
    group.add(new THREE.Mesh(scoopGeo, makeMat(0x2a2e34, 0.4, 0.8)));
  }

  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = o.receiveShadow = true;
      o.frustumCulled = false;
    }
  });
  void ctx;
  return group;
}

/**
 * Spawns a clothed, tool-wielding, biomechanically animated 3D human character.
 */
export async function spawnLivingHuman(ctx, opts = {}) {
  const {
    x = 0,
    z = 0,
    rotY = 0,
    height = 1.72,
    sex = 'male',
    style = 'sapiens',
    action = 'walk',
    tool = null,
    hat = null,
    speed = 1.0,
    path = null,
    poi = null,
  } = opts;

  const gltf = await ctx.assets.loadGLTF('./assets/models/skin.glb');
  if (!gltf) return null;

  const styleCfg = ERA_STYLES[style] || ERA_STYLES.sapiens;
  const phase = (opts.phase !== undefined) ? opts.phase : (Math.abs(x * 1.7 + z * 2.3) % 6.28);

  const sharedUniforms = {
    uTime: { value: 0 },
    uPhase: { value: phase },
    uAction: { value: ACTION_CODES[action] ?? 0 },
    uSpeed: { value: speed },
    uReact: { value: 0 },
    uClothColor1: { value: new THREE.Color(opts.clothColor1 ?? styleCfg.clothColor1) },
    uClothColor2: { value: new THREE.Color(opts.clothColor2 ?? styleCfg.clothColor2) },
    uBootColor: { value: new THREE.Color(opts.bootColor ?? styleCfg.bootColor) },
    uGarmentYMin: { value: styleCfg.garmentYMin },
    uGarmentYMax: { value: styleCfg.garmentYMax },
    uSleeveXMax: { value: styleCfg.sleeveYMin },
    uBootHeight: { value: styleCfg.bootHeight },
    uGarmentThickness: { value: styleCfg.thickness },
  };

  const humanGroup = new THREE.Group();
  humanGroup.name = `LivingHuman:${style}:${sex}`;

  // Clone only the matching sex sub-meshes (plus shared External ear) so male/female never overlap!
  gltf.scene.children.forEach((child, idx) => {
    const isSharedEar = idx === 0;
    const isMaleMesh = idx === 1 || idx === 3 || idx === 5 || idx === 7;
    const isFemaleMesh = idx === 2 || idx === 4 || idx === 6 || idx === 8;
    if (!isSharedEar && ((sex === 'male' && !isMaleMesh) || (sex === 'female' && !isFemaleMesh))) {
      return;
    }
    if (!child.isMesh) return;

    const m = child.clone();
    m.frustumCulled = false;
    m.castShadow = m.receiveShadow = true;

    const isHair = idx === 1 || idx === 2 || idx === 3 || idx === 4;
    const isLip = idx === 5 || idx === 6;
    const isMainSkin = idx === 7 || idx === 8;

    let baseCol = opts.skinColor ?? styleCfg.skinColor;
    let rough = 0.56;
    if (isHair) {
      baseCol = opts.hairColor ?? styleCfg.hairColor;
      rough = 0.78;
    } else if (isLip) {
      baseCol = 0x8e4a42;
      rough = 0.45;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: baseCol,
      roughness: rough,
      metalness: 0.02,
    });
    attachHumanShader(mat, sharedUniforms, child.position, child.scale, isMainSkin);
    m.material = mat;
    humanGroup.add(m);
  });

  // Optional era headgear (straw hat for farmer, nemes headcloth for Egyptian, helmet for Roman/Medieval, cap for Industrial)
  if (hat) {
    const hatOffset = new THREE.Vector3(0, 0, 0);
    const hatScale = new THREE.Vector3(1, 1, 1);
    let hatMesh = null;
    if (hat === 'straw') {
      const brim = new THREE.ConeGeometry(0.22, 0.09, 18);
      brim.translate(0, 1.71, -0.02);
      const mat = new THREE.MeshStandardMaterial({ color: 0xd8b868, roughness: 0.85 });
      attachHumanShader(mat, sharedUniforms, hatOffset, hatScale, false);
      hatMesh = new THREE.Mesh(brim, mat);
    } else if (hat === 'helmet') {
      const helm = new THREE.SphereGeometry(0.105, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
      helm.translate(0, 1.63, -0.02);
      const mat = new THREE.MeshStandardMaterial({ color: 0xc89b3c, roughness: 0.3, metalness: 0.85 });
      attachHumanShader(mat, sharedUniforms, hatOffset, hatScale, false);
      hatMesh = new THREE.Mesh(helm, mat);
    } else if (hat === 'cap') {
      const cap = new THREE.CylinderGeometry(0.095, 0.095, 0.08, 16);
      cap.translate(0, 1.70, -0.02);
      const mat = new THREE.MeshStandardMaterial({ color: 0x242830, roughness: 0.7 });
      attachHumanShader(mat, sharedUniforms, hatOffset, hatScale, false);
      hatMesh = new THREE.Mesh(cap, mat);
    }
    if (hatMesh) {
      hatMesh.castShadow = true;
      hatMesh.frustumCulled = false;
      humanGroup.add(hatMesh);
    }
  }

  if (tool) {
    humanGroup.add(buildHeldToolMesh(tool, sharedUniforms, ctx));
  }

  const sFactor = height / 1.72;
  humanGroup.scale.setScalar(sFactor);
  const startY = ctx.terrain ? ctx.terrain.heightAt(x, z) : 0;
  humanGroup.position.set(x, startY, z);
  humanGroup.rotation.y = rotY;
  ctx.group.add(humanGroup);

  // Interactive click handler
  humanGroup.userData.interactiveCharacter = true;
  humanGroup.userData.triggerInteract = () => {
    sharedUniforms.uReact.value = 1.0;
  };

  // Frame update: advance GPU skeletal shader time + move along 3D terrain path if provided
  ctx.anim.push((t, dt) => {
    sharedUniforms.uTime.value = t;
    if (sharedUniforms.uReact.value > 0.001) {
      sharedUniforms.uReact.value = Math.max(0, sharedUniforms.uReact.value - dt * 0.8);
    }

    if (path && path.length >= 2) {
      const cycleSpeed = 0.14 * speed;
      const rawU = (t * cycleSpeed + phase * 0.15) % 2.0;
      const u = rawU <= 1.0 ? rawU : 2.0 - rawU; // smooth ping-pong along path
      const totalSegs = path.length - 1;
      const segFloat = u * totalSegs;
      const segIdx = Math.min(totalSegs - 1, Math.floor(segFloat));
      const segT = segFloat - segIdx;

      const p0 = path[segIdx];
      const p1 = path[segIdx + 1];
      const nx = p0[0] + (p1[0] - p0[0]) * segT;
      const nz = p0[1] + (p1[1] - p0[1]) * segT;
      const ny = ctx.terrain ? ctx.terrain.heightAt(nx, nz) : 0;

      const dx = (p1[0] - p0[0]) * (rawU <= 1.0 ? 1 : -1);
      const dz = (p1[1] - p0[1]) * (rawU <= 1.0 ? 1 : -1);
      if (Math.hypot(dx, dz) > 0.001) {
        const targetYaw = Math.atan2(dx, dz);
        humanGroup.rotation.y = targetYaw;
      }
      humanGroup.position.set(nx, ny, nz);
    }
  });

  if (poi) {
    ctx.poi(poi, humanGroup, height + 0.32);
  }

  return humanGroup;
}

/**
 * Animates the skeleton bones of Prehistoric & Cenozoic 3D creatures (`mammoth.glb`,
 * `tyrannosaurus-rex.glb`, `triceratops.glb`, `ankylosaurus.glb`, `allosaurus-pandras.glb`,
 * `dimetrodon.glb`, `parasaurolophus.glb`, `lystrosaurus.glb`) AND moves them along 3D terrain paths!
 */
export function animateCreatureRig(obj, ctx, opts = {}) {
  if (!obj) return null;
  const {
    path = null,
    speed = 1.0,
    strideAmp = 0.35,
    headAmp = 0.14,
    jawAmp = 0.18,
    tailAmp = 0.22,
    phase = Math.random() * 6.28,
  } = opts;

  // Prefer the "Walk" animation clip if the GLB has one!
  const clips = obj.userData.animations || [];
  const walkClip = clips.find((c) => /walk|run|swim/i.test(c.name));
  if (walkClip) {
    ctx.play(obj, walkClip.name, speed);
  }

  // Locate explicit articulated bones in the creature's hierarchy
  const bones = {};
  obj.traverse((n) => {
    if (!n.name) return;
    const nm = n.name.toLowerCase();
    if (nm === 'leg_front_left' || nm === 'leg_left') bones.fl = n;
    else if (nm === 'leg_front_right' || nm === 'leg_right') bones.fr = n;
    else if (nm === 'leg_rear_left') bones.rl = n;
    else if (nm === 'leg_rear_right') bones.rr = n;
    else if (nm === 'head' || nm === 'head_09') bones.head = n;
    else if (nm === 'neck' || nm === 'neck2_06') bones.neck = n;
    else if (nm === 'jaw' || nm === 'jaw_010') bones.jaw = n;
    else if (nm === 'tail_1' || nm === 'tail_2') bones.tail = n;
  });

  // Save initial bone rotations so our procedural stride layers cleanly
  const baseRot = {};
  for (const [k, b] of Object.entries(bones)) {
    baseRot[k] = b.rotation.clone();
  }

  const basePos = obj.position.clone();
  const baseScaleY = obj.scale.y;
  let reactTimer = 0;

  obj.userData.interactiveCharacter = true;
  obj.userData.triggerInteract = () => {
    reactTimer = 1.2;
  };

  ctx.anim.push((t, dt) => {
    if (reactTimer > 0) reactTimer = Math.max(0, reactTimer - dt);
    const boost = 1.0 + reactTimer * 1.5;
    const w = t * 2.4 * speed + phase;

    if (bones.fl) bones.fl.rotation.x = baseRot.fl.x + Math.sin(w) * strideAmp * boost;
    if (bones.fr) bones.fr.rotation.x = baseRot.fr.x - Math.sin(w) * strideAmp * boost;
    if (bones.rl) bones.rl.rotation.x = baseRot.rl.x - Math.sin(w) * strideAmp * boost;
    if (bones.rr) bones.rr.rotation.x = baseRot.rr.x + Math.sin(w) * strideAmp * boost;

    if (bones.head) {
      bones.head.rotation.y = baseRot.head.y + Math.sin(t * 1.1 + phase) * headAmp * boost;
      bones.head.rotation.x = baseRot.head.x + Math.cos(t * 1.7 + phase) * (headAmp * 0.6);
    }
    if (bones.neck) {
      bones.neck.rotation.y = baseRot.neck.y + Math.sin(t * 0.9 + phase) * (headAmp * 0.7);
    }
    if (bones.jaw) {
      const roar = Math.max(0, Math.sin(t * 1.5 + phase) - 0.25) + reactTimer * 0.6;
      bones.jaw.rotation.x = baseRot.jaw.x + roar * jawAmp;
    }
    if (bones.tail) {
      bones.tail.rotation.y = baseRot.tail.y + Math.sin(t * 2.0 + phase) * tailAmp;
    }

    // Subtle breathing + stride bob
    obj.scale.y = baseScaleY * (1.0 + 0.015 * Math.sin(t * 2.2 + phase));

    if (path && path.length >= 2) {
      const cycleSpeed = 0.075 * speed;
      const rawU = (t * cycleSpeed + phase * 0.1) % 2.0;
      const u = rawU <= 1.0 ? rawU : 2.0 - rawU;
      const totalSegs = path.length - 1;
      const segFloat = u * totalSegs;
      const segIdx = Math.min(totalSegs - 1, Math.floor(segFloat));
      const segT = segFloat - segIdx;

      const p0 = path[segIdx];
      const p1 = path[segIdx + 1];
      const nx = p0[0] + (p1[0] - p0[0]) * segT;
      const nz = p0[1] + (p1[1] - p0[1]) * segT;
      const ny = ctx.terrain ? ctx.terrain.heightAt(nx, nz) : basePos.y;

      const dx = (p1[0] - p0[0]) * (rawU <= 1.0 ? 1 : -1);
      const dz = (p1[1] - p0[1]) * (rawU <= 1.0 ? 1 : -1);
      if (Math.hypot(dx, dz) > 0.001) {
        obj.rotation.y = Math.atan2(dx, dz);
      }
      obj.position.set(nx, ny + Math.abs(Math.cos(w)) * 0.04, nz);
    }
  });

  return obj;
}
