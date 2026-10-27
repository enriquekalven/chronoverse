import * as THREE from '../../../vendor/three/build/three.module.js';

/**
 * LivingHumans.js — Hyper-Real Biomechanically Articulated 3D Humans & Moving Creature Herds.
 *
 * Key Realism Architecture:
 *  1. Separates Male and Female high-resolution anatomical scans inside `skin.glb` (45,000 vertices)
 *     and adds 3D eyes (sclera + iris/pupil) and warm subsurface skin shading.
 *  2. Dresses every human in genuine 3D sculpted & draped garments (pleated 3D tunics, kilts, chitons,
 *     fur mantles, Egyptian wesekh collars, Roman lorica pauldrons, medieval cloaks, industrial coats,
 *     leather belts, and footwear) rather than flat painted skin bands, plus detailed 3D held tools.
 *  3. Articulates the full biomechanical skeleton (pelvic sway & list, hip flexion, two-phase knee bend,
 *     ankle/foot roll, breathing ribcage, counter-rotating spine, shoulders, elbows, wrists, and head)
 *     at 60 FPS on the GPU, with distance-locked stride phases and smooth U-turn arcs along terrain paths.
 */

const ERA_STYLES = {
  hominin: {
    skinColor: 0x76472e,
    hairColor: 0x150e09,
    clothColor1: 0x5c3e26,
    clothColor2: 0x3b2616,
    trouserColor: 0x4a3220,
    bootColor: 0x4a3220,
    garmentYMin: 0.78,
    garmentYMax: 1.02, // waist hide wrap only (bare chest)
    sleeveYMin: 1.50,
    bootHeight: 0.0,
    hasTrousers: 0.0,
    skirtYMin: 0.64,
    skirtTopR: 0.168,
    skirtBotR: 0.205,
    skirtPleats: 9.0,
    mantle: 'strap',
    thickness: 0.005,
  },
  erectus: {
    skinColor: 0x845136,
    hairColor: 0x18100b,
    clothColor1: 0x6b472b,
    clothColor2: 0x3f2817,
    trouserColor: 0x4a3220,
    bootColor: 0x4a3220,
    garmentYMin: 0.78,
    garmentYMax: 1.28, // one-shoulder hide tunic
    sleeveYMin: 1.50,
    bootHeight: 0.0,
    hasTrousers: 0.0,
    skirtYMin: 0.58,
    skirtTopR: 0.170,
    skirtBotR: 0.220,
    skirtPleats: 10.0,
    mantle: 'fur_cape',
    thickness: 0.006,
  },
  neanderthal: {
    skinColor: 0xc48e6e,
    hairColor: 0x4a2414,
    clothColor1: 0x5c4028,
    clothColor2: 0x8a6a4c,
    trouserColor: 0x3e2b1b,
    bootColor: 0x2e1e12,
    garmentYMin: 0.78,
    garmentYMax: 1.40,
    sleeveYMin: 1.12,
    bootHeight: 0.28,
    hasTrousers: 1.0,
    skirtYMin: 0.54,
    skirtTopR: 0.176,
    skirtBotR: 0.235,
    skirtPleats: 8.0,
    mantle: 'fur_cape',
    thickness: 0.008,
  },
  sapiens: {
    skinColor: 0x986444,
    hairColor: 0x1a120d,
    clothColor1: 0x7c5032,
    clothColor2: 0xb85d2e,
    trouserColor: 0x4e3522,
    bootColor: 0x3e2818,
    garmentYMin: 0.78,
    garmentYMax: 1.38,
    sleeveYMin: 1.20,
    bootHeight: 0.22,
    hasTrousers: 0.0,
    skirtYMin: 0.54,
    skirtTopR: 0.170,
    skirtBotR: 0.225,
    skirtPleats: 12.0,
    mantle: 'fur_cape',
    thickness: 0.006,
  },
  iceage: {
    skinColor: 0xb57f5e,
    hairColor: 0x1c140e,
    clothColor1: 0x6e5640,
    clothColor2: 0xd8cfc2,
    trouserColor: 0x4b3928,
    bootColor: 0x342416,
    garmentYMin: 0.78,
    garmentYMax: 1.43,
    sleeveYMin: 0.88, // full fur parka sleeves to wrist
    bootHeight: 0.36,
    hasTrousers: 1.0,
    skirtYMin: 0.50,
    skirtTopR: 0.180,
    skirtBotR: 0.245,
    skirtPleats: 10.0,
    mantle: 'fur_cape',
    thickness: 0.009,
  },
  farmer: {
    skinColor: 0xb8825e,
    hairColor: 0x24170e,
    clothColor1: 0xd4c098,
    clothColor2: 0x8c542e,
    trouserColor: 0x6e5438,
    bootColor: 0x4f3622,
    garmentYMin: 0.78,
    garmentYMax: 1.39,
    sleeveYMin: 1.16,
    bootHeight: 0.20,
    hasTrousers: 0.0,
    skirtYMin: 0.48,
    skirtTopR: 0.170,
    skirtBotR: 0.230,
    skirtPleats: 16.0,
    mantle: 'woven_scarf',
    thickness: 0.006,
  },
  egyptian: {
    skinColor: 0xb47850,
    hairColor: 0x14100e,
    clothColor1: 0xd6c8ac,
    clothColor2: 0xd8a436,
    trouserColor: 0xd6c8ac,
    bootColor: 0x6e4c2e,
    garmentYMin: 0.78,
    garmentYMax: 1.02, // bare chest + gold Wesekh collar, pleated white linen shendyt kilt
    sleeveYMin: 1.50,
    bootHeight: 0.15,
    hasTrousers: 0.0,
    skirtYMin: 0.50,
    skirtTopR: 0.168,
    skirtBotR: 0.228,
    skirtPleats: 28.0,
    mantle: 'wesekh_collar',
    thickness: 0.005,
  },
  greek: {
    skinColor: 0xd09874,
    hairColor: 0x2a1b10,
    clothColor1: 0xd6ccb8,
    clothColor2: 0x28588a,
    trouserColor: 0xd6ccb8,
    bootColor: 0x6e4a2c,
    garmentYMin: 0.78,
    garmentYMax: 1.40,
    sleeveYMin: 1.18,
    bootHeight: 0.20,
    hasTrousers: 0.0,
    skirtYMin: 0.40,
    skirtTopR: 0.172,
    skirtBotR: 0.245,
    skirtPleats: 24.0,
    mantle: 'himation',
    thickness: 0.006,
  },
  roman: {
    skinColor: 0xcc9470,
    hairColor: 0x24160d,
    clothColor1: 0x9c221c,
    clothColor2: 0xc89b3c,
    trouserColor: 0x6e482a,
    bootColor: 0x4e3018,
    garmentYMin: 0.78,
    garmentYMax: 1.40,
    sleeveYMin: 1.16,
    bootHeight: 0.28,
    hasTrousers: 0.0,
    skirtYMin: 0.48,
    skirtTopR: 0.174,
    skirtBotR: 0.235,
    skirtPleats: 20.0,
    mantle: 'pauldrons',
    thickness: 0.007,
  },
  medieval: {
    skinColor: 0xd6a280,
    hairColor: 0x362214,
    clothColor1: 0x2e4c34,
    clothColor2: 0x784824,
    trouserColor: 0x3a322b,
    bootColor: 0x2a1c12,
    garmentYMin: 0.78,
    garmentYMax: 1.42,
    sleeveYMin: 0.88,
    bootHeight: 0.34,
    hasTrousers: 1.0,
    skirtYMin: 0.52,
    skirtTopR: 0.174,
    skirtBotR: 0.235,
    skirtPleats: 14.0,
    mantle: 'hood_cape',
    thickness: 0.007,
  },
  industrial: {
    skinColor: 0xdab092,
    hairColor: 0x2a1d14,
    clothColor1: 0x262e3a,
    clothColor2: 0x845432,
    trouserColor: 0x343840,
    bootColor: 0x1a1512,
    garmentYMin: 0.78,
    garmentYMax: 1.43,
    sleeveYMin: 0.88,
    bootHeight: 0.24,
    hasTrousers: 1.0,
    skirtYMin: 0.58,
    skirtTopR: 0.174,
    skirtBotR: 0.215,
    skirtPleats: 8.0,
    mantle: 'coat_lapels',
    thickness: 0.007,
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
uniform float uWalkCycle;
uniform float uWalkBlend;
uniform float uTurnLean;
uniform float uPhase;
uniform float uAction;
uniform float uSpeed;
uniform float uReact;
uniform float uIsTool;
uniform float uIsSkirt;
uniform vec3 uNodeOffset;
uniform vec3 uNodeScale;
uniform float uGarmentYMin;
uniform float uGarmentYMax;
uniform float uSleeveXMax;
uniform float uBootHeight;
uniform float uHasTrousers;
uniform float uGarmentThickness;
varying vec3 vBodyPos;
varying vec3 vBodyNorm;
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
  float b = 0.1745;
  if (rp.y >= 0.90 && rp.y < 1.18) {
    b = 0.172;
  } else if (rp.y >= 1.18) {
    b = 0.1655;
  }
  return step(b, absX) * step(0.70, rp.y) * step(rp.y, 1.43);
}

vec3 articulateHumanPoint(vec3 rp, float isArm) {
  float tClock = uTime * (2.6 * uSpeed) + uPhase;
  float t = uAction < 0.5 ? uWalkCycle : tClock;
  float s = rp.x >= 0.0 ? 1.0 : -1.0; // +1 left side, -1 right side

  float isForearm = isArm * smoothstep(1.16, 1.05, rp.y);
  float isHand = isForearm * smoothstep(0.89, 0.81, rp.y);
  float isLeg = (1.0 - isArm) * smoothstep(0.89, 0.82, rp.y);
  float isLowerLeg = isLeg * smoothstep(0.49, 0.42, rp.y);
  float isFoot = isLowerLeg * smoothstep(0.14, 0.06, rp.y);
  float isHead = smoothstep(1.47, 1.52, rp.y);
  float isUpperBody = max(isArm, smoothstep(0.86, 0.96, rp.y));

  // If this mesh is a held 3D tool, lock 100% of its vertices rigidly to the hand
  if (abs(uIsTool) > 0.5) {
    s = uIsTool > 0.0 ? -1.0 : 1.0;
    isArm = 1.0;
    isForearm = 1.0;
    isHand = 1.0;
    isUpperBody = 1.0;
    isLeg = 0.0;
    isLowerLeg = 0.0;
    isFoot = 0.0;
    isHead = 0.0;
  }

  // Action-dependent joint angles
  float legSwingL = 0.0;
  float legSwingR = 0.0;
  float kneeBendL = 0.0;
  float kneeBendR = 0.0;
  float anklePitchL = 0.0;
  float anklePitchR = 0.0;
  float pelvisRoll = 0.0;
  float pelvisYaw = 0.0;
  float pelvisShiftX = 0.0;
  float spinePitch = 0.04;
  float spineYaw = 0.0;
  float armPitchL = 0.0;
  float armPitchR = 0.0;
  float elbowBendL = -0.28;
  float elbowBendR = -0.28;
  float wristPitchL = 0.0;
  float wristPitchR = 0.0;
  float armRollL = -0.14;
  float armRollR = 0.14;
  float bodyBob = 0.0;

  if (uAction < 0.5) {
    // 0: Natural 4-Phase Biomechanical Walking Gait
    float w = t;
    float wb = uWalkBlend;
    float sinW = sin(w);
    float cosW = cos(w);

    // Asymmetric hip flexion (further forward than backward) + pelvic rotation
    legSwingL = (sinW * 0.44 - 0.04 * cosW) * wb;
    legSwingR = (-sinW * 0.44 + 0.04 * cosW) * wb;

    // Two-peak knee flexion: big clearance bend during swing + subtle cushioned bend at stance heel-strike
    float swingBendL = max(0.0, -cos(w - 0.25)) * 0.68;
    float stanceYieldL = max(0.0, sin(w - 0.2)) * 0.14;
    kneeBendL = (swingBendL + stanceYieldL) * wb;

    float swingBendR = max(0.0, cos(w - 0.25)) * 0.68;
    float stanceYieldR = max(0.0, -sin(w - 0.2)) * 0.14;
    kneeBendR = (swingBendR + stanceYieldR) * wb;

    // Ankle dorsiflexion on heel-strike & plantarflexion on toe push-off
    anklePitchL = (-0.20 * sin(w + 0.4) + 0.16 * max(0.0, -sinW)) * wb;
    anklePitchR = (0.20 * sin(w + 0.4) + 0.16 * max(0.0, sinW)) * wb;

    // Pelvic lateral weight transfer, contralateral hip drop (list), and axial counter-rotation
    pelvisShiftX = -cosW * 0.022 * wb;
    pelvisRoll = cosW * 0.038 * wb;
    pelvisYaw = -sinW * 0.075 * wb;

    // Counter-rotating upper torso & natural arm swing with phase-delayed elbow/wrist follow-through
    spinePitch = 0.055 * wb;
    spineYaw = sinW * 0.095 * wb;
    armPitchL = (-sinW * 0.36 + 0.04) * wb;
    armPitchR = (sinW * 0.36 + 0.04) * wb;
    elbowBendL = -0.24 - 0.22 * max(0.0, sin(w - 0.3) * wb);
    elbowBendR = -0.24 - 0.22 * max(0.0, -sin(w - 0.3) * wb);
    wristPitchL = -0.12 * sin(w - 0.55) * wb;
    wristPitchR = 0.12 * sin(w - 0.55) * wb;

    // Double-frequency vertical center-of-mass oscillation (lowest at double-support, highest at mid-stance)
    bodyBob = (abs(sinW) - 0.45) * 0.034 * wb;
  } else if (uAction < 1.5) {
    // 1: Farming / Harvesting Wheat with Sickle or Hoe
    float swing = sin(t * 1.15);
    legSwingL = 0.24;
    legSwingR = -0.20;
    kneeBendL = 0.28;
    kneeBendR = 0.24;
    pelvisYaw = -0.10 * cos(t * 1.15);
    spinePitch = 0.36 + 0.15 * swing;
    spineYaw = 0.24 * cos(t * 1.15);
    armPitchR = -0.78 + 0.68 * swing;
    elbowBendR = -0.62 + 0.28 * swing;
    wristPitchR = 0.22 * cos(t * 1.15);
    armPitchL = -0.48 - 0.18 * swing;
    elbowBendL = -0.58;
    bodyBob = -0.05 + 0.024 * swing;
  } else if (uAction < 2.5) {
    // 2: Tending Fire & Knapping Stone Tools
    float strike = sin(t * 1.6);
    legSwingL = -0.56;
    legSwingR = -0.48;
    kneeBendL = 1.06;
    kneeBendR = 0.98;
    spinePitch = 0.32 + 0.08 * sin(t * 0.8);
    spineYaw = 0.07 * cos(t * 0.8);
    armPitchR = -0.80 + 0.40 * strike;
    elbowBendR = -0.72 + 0.32 * strike;
    wristPitchR = 0.25 * strike;
    armPitchL = -0.66 + 0.06 * cos(t * 1.6);
    elbowBendL = -0.62;
    bodyBob = -0.20 + 0.012 * sin(t * 1.6);
  } else if (uAction < 3.5) {
    // 3: Painting Cave Art / Holding Torch High
    float stroke = sin(t * 1.1);
    legSwingL = 0.12 * sin(t * 0.5);
    legSwingR = -0.12 * sin(t * 0.5);
    pelvisShiftX = 0.015 * sin(t * 0.5);
    spinePitch = -0.05;
    spineYaw = 0.16 * stroke;
    armPitchR = -1.28 + 0.34 * stroke;
    elbowBendR = -0.42 + 0.24 * cos(t * 1.1);
    wristPitchR = 0.18 * sin(t * 2.2);
    armPitchL = -0.98 + 0.05 * sin(t * 0.7);
    elbowBendL = -0.52;
  } else if (uAction < 4.5) {
    // 4: Spear Hunting / Tracking Stride
    float w = t;
    legSwingL = sin(w) * 0.50;
    legSwingR = -sin(w) * 0.50;
    kneeBendL = max(0.0, -cos(w - 0.2) * 0.70);
    kneeBendR = max(0.0, cos(w - 0.2) * 0.70);
    anklePitchL = -0.18 * sin(w + 0.3);
    anklePitchR = 0.18 * sin(w + 0.3);
    pelvisShiftX = -cos(w) * 0.024;
    pelvisRoll = cos(w) * 0.04;
    spinePitch = 0.16;
    spineYaw = sin(w) * 0.12;
    armPitchR = -0.88 + 0.26 * sin(w * 1.5);
    elbowBendR = -0.55;
    armPitchL = -0.45 + 0.34 * sin(w);
    elbowBendL = -0.45;
    bodyBob = (abs(sin(w)) - 0.4) * 0.038;
  } else if (uAction < 5.5) {
    // 5: Hauling Pyramid Limestone Block / Heavy Sled
    float w = t * 0.85;
    legSwingL = sin(w) * 0.46;
    legSwingR = -sin(w) * 0.46;
    kneeBendL = 0.22 + max(0.0, -cos(w - 0.2) * 0.56);
    kneeBendR = 0.22 + max(0.0, cos(w - 0.2) * 0.56);
    anklePitchL = -0.22 * sin(w + 0.3);
    anklePitchR = 0.22 * sin(w + 0.3);
    pelvisRoll = cos(w) * 0.035;
    spinePitch = 0.44 + 0.06 * sin(w * 2.0);
    armPitchR = 0.32 + 0.08 * sin(w);
    armPitchL = 0.32 - 0.08 * sin(w);
    elbowBendR = -0.45;
    elbowBendL = -0.45;
    bodyBob = -0.06 + abs(cos(w)) * 0.026;
  } else {
    // 6: Debating Philosophy / Scribe / Gesturing
    legSwingL = sin(t * 0.5) * 0.14;
    legSwingR = -sin(t * 0.5) * 0.14;
    kneeBendL = max(0.0, -cos(t * 0.5) * 0.20);
    kneeBendR = max(0.0, cos(t * 0.5) * 0.20);
    pelvisShiftX = 0.016 * sin(t * 0.5);
    pelvisRoll = 0.025 * sin(t * 0.5);
    spineYaw = sin(t * 0.6) * 0.16;
    spinePitch = 0.03 * cos(t * 0.5);
    armPitchR = -0.68 + 0.38 * sin(t * 1.1);
    elbowBendR = -0.66 + 0.26 * cos(t * 1.1);
    wristPitchR = 0.20 * sin(t * 1.6);
    armPitchL = -0.46 - 0.24 * cos(t * 0.9);
    elbowBendL = -0.54;
  }

  // Interactive click wave boost
  if (uReact > 0.01) {
    armPitchR = mix(armPitchR, -2.15 + 0.35 * sin(uTime * 10.0), uReact);
    elbowBendR = mix(elbowBendR, -0.32, uReact);
  }

  // If this mesh is the 3D draped skirt / kilt / tunic hem, articulate it as flowing cloth!
  if (uIsSkirt > 0.5) {
    float skirtFactor = clamp((0.94 - rp.y) / 0.46, 0.0, 1.0);
    vec3 hipCenter = vec3(0.0, 0.92, 0.0);
    // Front of skirt swings forward with whichever leg is stepping forward; back swings backward
    float frontSwing = min(0.0, min(legSwingL, legSwingR)) * 1.12 - 0.05 * skirtFactor;
    float backSwing = max(0.0, max(legSwingL, legSwingR)) * 1.08 + 0.05 * skirtFactor;
    float sideBlend = smoothstep(-0.08, 0.08, rp.z);
    float clothPitch = mix(backSwing, frontSwing, sideBlend) * skirtFactor;
    vec3 pSkirt = rotX(rp, hipCenter, clothPitch);
    // Gentle cloth ripple in motion
    float ripple = sin(t * 2.0 + atan(rp.x, rp.z) * 5.0) * 0.008 * skirtFactor;
    pSkirt.x += normalize(vec2(rp.x, rp.z) + vec2(0.0001)).x * ripple + pelvisShiftX;
    pSkirt.z += normalize(vec2(rp.x, rp.z) + vec2(0.0001)).y * ripple;
    pSkirt = rotZ(pSkirt, hipCenter, pelvisRoll * 0.6);
    pSkirt = rotY(pSkirt, hipCenter, pelvisYaw * 0.7);
    pSkirt.y += bodyBob;
    return pSkirt;
  }

  // 1. Articulate Arms around Shoulder, Elbow & Wrist BEFORE spine bend
  if (isArm > 0.001) {
    vec3 shoulderPiv = vec3(0.175 * s, 1.37, -0.01);
    vec3 elbowPiv = vec3(0.235 * s, 1.12, 0.0);
    vec3 wristPiv = vec3(0.255 * s, 0.86, 0.01);
    float aPitch = s > 0.0 ? armPitchL : armPitchR;
    float eBend = s > 0.0 ? elbowBendL : elbowBendR;
    float wPitch = s > 0.0 ? wristPitchL : wristPitchR;
    float aRoll = s > 0.0 ? armRollL : armRollR;

    vec3 pArm = rp;
    if (isHand > 0.001) {
      pArm = mix(pArm, rotX(pArm, wristPiv, wPitch), isHand);
    }
    if (isForearm > 0.001) {
      pArm = mix(pArm, rotX(pArm, elbowPiv, eBend), isForearm);
    }
    pArm = rotZ(pArm, shoulderPiv, aRoll);
    pArm = rotX(pArm, shoulderPiv, aPitch);
    rp = mix(rp, pArm, isArm);
  }

  // 2. Articulate Head Look / Nod & Stabilization
  if (isHead > 0.001) {
    vec3 neckPiv = vec3(0.0, 1.49, -0.01);
    float hYaw = sin(tClock * 0.42 + uPhase) * 0.20 - spineYaw * 0.45;
    float hPitch = 0.05 * cos(tClock * 0.68) - spinePitch * 0.25;
    vec3 pHead = rotY(rp, neckPiv, hYaw);
    pHead = rotX(pHead, neckPiv, hPitch);
    rp = mix(rp, pHead, isHead);
  }

  // 3. Articulate Upper Body (Spine Pitch, Counter-Twist, Turn Banking & Breathing)
  if (isUpperBody > 0.001) {
    vec3 waistPiv = vec3(0.0, 0.90, 0.0);
    float breath = 1.0 + 0.020 * sin(uTime * 2.6 + uPhase) * smoothstep(1.02, 1.36, rp.y) * (1.0 - isArm);
    rp.z *= breath;
    vec3 pTorso = rotY(rp, waistPiv, spineYaw);
    pTorso = rotX(pTorso, waistPiv, spinePitch);
    pTorso = rotZ(pTorso, waistPiv, -pelvisRoll * 0.5 + uTurnLean * 0.14);
    rp = mix(rp, pTorso, isUpperBody);
  }

  // 4. Articulate Pelvis & Legs (Hip Swing, Two-Peak Knee Flexion & Ankle Roll)
  if (isLeg > 0.001) {
    vec3 pelvisPiv = vec3(0.0, 0.88, 0.0);
    vec3 hipPiv = vec3(0.088 * s, 0.88, 0.0);
    vec3 kneePiv = vec3(0.088 * s, 0.46, 0.0);
    vec3 anklePiv = vec3(0.088 * s, 0.085, -0.01);
    float hSwing = s > 0.0 ? legSwingL : legSwingR;
    float kBend = s > 0.0 ? kneeBendL : kneeBendR;
    float aPitch = s > 0.0 ? anklePitchL : anklePitchR;

    vec3 pLeg = rp;
    if (isFoot > 0.001) {
      pLeg = mix(pLeg, rotX(pLeg, anklePiv, aPitch), isFoot);
    }
    if (isLowerLeg > 0.001) {
      pLeg = mix(pLeg, rotX(pLeg, kneePiv, kBend), isLowerLeg);
    }
    pLeg = rotX(pLeg, hipPiv, hSwing);
    pLeg = rotZ(pLeg, pelvisPiv, pelvisRoll * (1.0 - isLowerLeg * 0.6));
    pLeg = rotY(pLeg, pelvisPiv, pelvisYaw * (1.0 - isLowerLeg * 0.5));
    rp = mix(rp, pLeg, isLeg);
  }

  rp.x += pelvisShiftX * (1.0 - isLowerLeg * 0.7);
  rp.y += bodyBob;
  return rp;
}
`;

function attachHumanShader(
  material,
  sharedUniforms,
  nodeOffset,
  nodeScale,
  isSkinMesh = false,
  isToolVal = 0.0,
  isSkirtVal = 0.0
) {
  material.customProgramCacheKey = () =>
    isSkinMesh
      ? 'living-human-skin-v5'
      : `living-human-part-v5-${isToolVal}-${isSkirtVal}`;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, sharedUniforms, {
      uNodeOffset: { value: nodeOffset.clone() },
      uNodeScale: { value: nodeScale.clone() },
      uIsTool: { value: isToolVal },
      uIsSkirt: { value: isSkirtVal },
    });

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${HUMAN_VERT_PARS}`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 rp = transformed * uNodeScale + uNodeOffset;
        vBodyPos = rp;
        vBodyNorm = normalize(objectNormal);
        float isArmVert = computeIsArm(rp);
        float inUpperTunic = (1.0 - isArmVert) * smoothstep(uGarmentYMin - 0.015, uGarmentYMin + 0.015, rp.y) * smoothstep(uGarmentYMax + 0.015, uGarmentYMax - 0.015, rp.y);
        float inSleeve = isArmVert * smoothstep(uSleeveXMax - 0.015, uSleeveXMax + 0.015, rp.y) * smoothstep(uGarmentYMax + 0.015, uGarmentYMax - 0.015, rp.y);
        float inTorsoCloth = max(inUpperTunic, inSleeve);
        float inTrousers = uHasTrousers * (1.0 - isArmVert) * smoothstep(uBootHeight - 0.01, uBootHeight + 0.02, rp.y) * smoothstep(0.86, 0.82, rp.y);
        float inBoots = (1.0 - isArmVert) * smoothstep(uBootHeight + 0.012, uBootHeight - 0.012, rp.y);
        vGarmentZone = inBoots > 0.5 ? 3.0 : (inTrousers > 0.5 ? 2.0 : inTorsoCloth);

        // Radial 3D cloth thickness & sculpted drapery folds along surface normal
        if (abs(uIsTool) < 0.1 && uIsSkirt < 0.1) {
          float clothMask = max(inTorsoCloth, inTrousers * 0.85);
          if (clothMask > 0.01) {
            float folds = 0.80 + 0.20 * sin(rp.x * 58.0 + rp.y * 19.0) * cos(rp.z * 52.0 + rp.y * 24.0);
            float hemRidge = smoothstep(0.03, 0.0, abs(rp.y - uGarmentYMax)) * 0.003;
            vec3 radDir = normalize(vec3(rp.x, 0.0, rp.z + 0.005));
            rp += radDir * ((uGarmentThickness * folds + hemRidge) * clothMask);
          }
          if (inBoots > 0.01) {
            vec3 bootDir = normalize(vec3(rp.x - sign(rp.x) * 0.088, 0.0, rp.z));
            rp += bootDir * (0.0045 * inBoots);
          }
        }

        vec3 artRp = articulateHumanPoint(rp, isArmVert);
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
          uniform vec3 uTrouserColor;
          uniform vec3 uBootColor;
          uniform float uGarmentYMin;
          uniform float uGarmentYMax;
          varying vec3 vBodyPos;
          varying vec3 vBodyNorm;
          varying float vGarmentZone;
          `
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          if (vGarmentZone > 2.5) {
            // 3D Leather Boots / Cross-Strapped Sandals
            float strap = smoothstep(0.25, 0.78, sin(vBodyPos.y * 92.0 + abs(vBodyPos.x) * 28.0));
            float sole = step(vBodyPos.y, 0.032);
            vec3 bootCol = mix(uBootColor, uClothColor2, strap * 0.38);
            diffuseColor.rgb = mix(bootCol, uBootColor * 0.55, sole);
          } else if (vGarmentZone > 1.5) {
            // Tailored Wool / Hide Trousers & Leggings
            float twill = 0.93 + 0.07 * sin((vBodyPos.x + vBodyPos.y) * 150.0);
            float kneeCrease = 0.92 + 0.08 * sin(vBodyPos.y * 65.0 + abs(vBodyPos.z) * 40.0);
            diffuseColor.rgb = uTrouserColor * twill * kneeCrease;
          } else if (vGarmentZone > 0.35) {
            // Woven Era Tunic / Chiton / Fur Pelt / Cuirass
            float weave = 0.91 + 0.09 * sin(vBodyPos.x * 145.0) * sin(vBodyPos.y * 145.0);
            float pleats = 0.87 + 0.13 * sin(vBodyPos.x * 74.0 + sin(vBodyPos.y * 18.0) * 1.5);
            vec3 cloth = uClothColor1 * weave * pleats;
            float isCollar = step(uGarmentYMax - 0.042, vBodyPos.y);
            float isStrap = step(abs(vBodyPos.x * 1.35 - (vBodyPos.y - 1.16) * 0.65), 0.036) * step(0.94, vBodyPos.y);
            float trimMask = clamp(isCollar * 0.85 + isStrap * 0.9, 0.0, 1.0);
            diffuseColor.rgb = mix(cloth, uClothColor2 * weave, trimMask);
          } else {
            // Lifelike Human Skin with Subsurface Warmth & Anatomical Micro-Shading
            float pore = 0.97 + 0.03 * sin(vBodyPos.x * 260.0 + vBodyPos.y * 240.0) * cos(vBodyPos.z * 260.0);
            float sssWrap = pow(clamp(0.55 + 0.45 * vBodyNorm.y, 0.0, 1.0), 1.5);
            float blush = smoothstep(1.52, 1.60, vBodyPos.y) * smoothstep(1.66, 1.59, vBodyPos.y) * smoothstep(0.02, 0.08, vBodyPos.z);
            float jointWarmth = smoothstep(0.06, 0.0, abs(vBodyPos.y - 0.46)) * 0.35 + smoothstep(0.08, 0.0, abs(vBodyPos.y - 0.83)) * 0.35;
            vec3 sssTint = vec3(0.085, 0.022, 0.012) * sssWrap + vec3(0.09, 0.02, 0.015) * (blush + jointWarmth);
            diffuseColor.rgb = diffuseColor.rgb * pore + sssTint;
          }
          `
        );
    } else if (isSkirtVal > 0.5) {
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          varying vec3 vBodyPos;
          varying vec3 vBodyNorm;
          `
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          float weave = 0.91 + 0.09 * sin(vBodyPos.x * 155.0) * sin(vBodyPos.y * 155.0);
          float ang = atan(vBodyPos.z, vBodyPos.x);
          float pleatShade = 0.84 + 0.16 * sin(ang * 18.0 + sin(vBodyPos.y * 14.0) * 0.4);
          float waistAO = smoothstep(0.96, 0.86, vBodyPos.y) * 0.88 + 0.12;
          diffuseColor.rgb *= weave * pleatShade * waistAO;
          `
        );
    }
  };
  material.needsUpdate = true;
}

/**
 * Builds 3D anatomical eyes (white sclera + dark iris/pupil) in rest-pose head coordinates
 * so characters have lifelike facial expression and eye highlights.
 */
function buildEyesMesh(sharedUniforms, hairColor) {
  const group = new THREE.Group();
  const unitOffset = new THREE.Vector3(0, 0, 0);
  const unitScale = new THREE.Vector3(1, 1, 1);

  const scleraMat = new THREE.MeshStandardMaterial({ color: 0xf6f2ec, roughness: 0.18, metalness: 0.02 });
  attachHumanShader(scleraMat, sharedUniforms, unitOffset, unitScale, false, 0.0, 0.0);

  const irisMat = new THREE.MeshStandardMaterial({ color: hairColor || 0x26180e, roughness: 0.12, metalness: 0.08 });
  attachHumanShader(irisMat, sharedUniforms, unitOffset, unitScale, false, 0.0, 0.0);

  [-0.031, 0.031].forEach((ex) => {
    const scleraGeo = new THREE.SphereGeometry(0.0115, 12, 10);
    scleraGeo.scale(1.0, 0.88, 0.92);
    scleraGeo.translate(ex, 1.593, 0.077);
    group.add(new THREE.Mesh(scleraGeo, scleraMat));

    const irisGeo = new THREE.SphereGeometry(0.0062, 10, 8);
    irisGeo.scale(1.0, 1.0, 0.55);
    irisGeo.translate(ex, 1.593, 0.086);
    group.add(new THREE.Mesh(irisGeo, irisMat));
  });

  group.traverse((o) => {
    if (o.isMesh) o.frustumCulled = false;
  });
  return group;
}

/**
 * Builds genuine 3D draped garments (pleated 3D skirt/kilt/tunic, waist belt, fur shoulder mantle,
 * Egyptian Wesekh collar, Greek himation sash, Roman lorica pauldrons, medieval cloak, industrial lapels)
 * that articulate on the GPU with the character's skeleton.
 */
function buildEraGarmentMeshes(style, styleCfg, sharedUniforms, opts = {}) {
  const group = new THREE.Group();
  const unitOffset = new THREE.Vector3(0, 0, 0);
  const unitScale = new THREE.Vector3(1, 1, 1);

  const clothCol1 = opts.clothColor1 ?? styleCfg.clothColor1;
  const clothCol2 = opts.clothColor2 ?? styleCfg.clothColor2;
  const bootCol = opts.bootColor ?? styleCfg.bootColor;

  // 1. 3D Draped Skirt / Kilt / Tunic Hem (wraps both legs with sculpted vertical pleats)
  if (styleCfg.skirtYMin !== undefined) {
    const yTop = 0.945;
    const yBot = styleCfg.skirtYMin;
    const h = yTop - yBot;
    const rTop = styleCfg.skirtTopR || 0.170;
    const rBot = styleCfg.skirtBotR || 0.225;
    const pleats = styleCfg.skirtPleats || 16.0;

    const skirtGeo = new THREE.CylinderGeometry(rTop, rBot, h, 40, 12, true);
    const pos = skirtGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let vx = pos.getX(i);
      let vy = pos.getY(i);
      let vz = pos.getZ(i);
      const uFromTop = THREE.MathUtils.clamp((h * 0.5 - vy) / h, 0, 1);
      const ang = Math.atan2(vz, vx);
      // Sculpted vertical drapery folds + subtle organic hemline wave
      const foldWave = 1.0 + 0.055 * uFromTop * Math.sin(ang * pleats + Math.sin(uFromTop * 3.0) * 0.35);
      const hemWave = 0.012 * uFromTop * Math.cos(ang * (pleats * 0.5));
      // Elliptical human hip/waist cross-section (wider in X, flatter in Z)
      vx *= foldWave * 1.04;
      vz = vz * foldWave * 0.76 - 0.006;
      vy += hemWave + (yBot + h * 0.5);
      pos.setXYZ(i, vx, vy, vz);
    }
    skirtGeo.computeVertexNormals();

    const skirtMat = new THREE.MeshStandardMaterial({
      color: clothCol1,
      roughness: 0.78,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });
    attachHumanShader(skirtMat, sharedUniforms, unitOffset, unitScale, false, 0.0, 1.0);
    const skirtMesh = new THREE.Mesh(skirtGeo, skirtMat);
    skirtMesh.castShadow = skirtMesh.receiveShadow = true;
    skirtMesh.frustumCulled = false;
    group.add(skirtMesh);

    // Decorative hem border band on the 3D skirt
    const trimGeo = new THREE.CylinderGeometry(rBot * 0.985, rBot * 1.01, 0.042, 40, 2, true);
    const tPos = trimGeo.attributes.position;
    for (let i = 0; i < tPos.count; i++) {
      let vx = tPos.getX(i);
      let vy = tPos.getY(i);
      let vz = tPos.getZ(i);
      const ang = Math.atan2(vz, vx);
      const foldWave = 1.0 + 0.055 * Math.sin(ang * pleats + 0.35);
      vx *= foldWave * 1.045;
      vz = vz * foldWave * 0.765 - 0.006;
      vy += yBot + 0.024;
      tPos.setXYZ(i, vx, vy, vz);
    }
    trimGeo.computeVertexNormals();
    const trimMat = new THREE.MeshStandardMaterial({
      color: clothCol2,
      roughness: 0.65,
      metalness: style === 'egyptian' || style === 'roman' ? 0.45 : 0.05,
      side: THREE.DoubleSide,
    });
    attachHumanShader(trimMat, sharedUniforms, unitOffset, unitScale, false, 0.0, 1.0);
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.castShadow = true;
    trimMesh.frustumCulled = false;
    group.add(trimMesh);
  }

  // 2. 3D Sculpted Waist Belt & Buckle / Sash
  const beltGeo = new THREE.TorusGeometry(0.172, 0.022, 10, 32);
  beltGeo.rotateX(Math.PI / 2);
  beltGeo.scale(1.03, 1.25, 0.76);
  beltGeo.translate(0, 0.94, -0.005);
  const beltMat = new THREE.MeshStandardMaterial({
    color: style === 'egyptian' || style === 'roman' ? clothCol2 : bootCol,
    roughness: style === 'egyptian' || style === 'roman' ? 0.35 : 0.65,
    metalness: style === 'egyptian' || style === 'roman' ? 0.65 : 0.12,
  });
  attachHumanShader(beltMat, sharedUniforms, unitOffset, unitScale, false, 0.0, 0.0);
  const beltMesh = new THREE.Mesh(beltGeo, beltMat);
  beltMesh.castShadow = true;
  beltMesh.frustumCulled = false;
  group.add(beltMesh);

  // 3. Era-Specific 3D Shoulder Mantles, Collars & Armor
  const mantleMat = new THREE.MeshStandardMaterial({
    color: clothCol2,
    roughness: style === 'egyptian' || style === 'roman' ? 0.32 : 0.85,
    metalness: style === 'egyptian' || style === 'roman' ? 0.72 : 0.04,
    side: THREE.DoubleSide,
  });
  attachHumanShader(mantleMat, sharedUniforms, unitOffset, unitScale, false, 0.0, 0.0);

  if (styleCfg.mantle === 'fur_cape') {
    // Sculpted 3D Fur Shoulder Mantle (Prehistoric / Neanderthal / Sapiens / Ice Age)
    const capeGeo = new THREE.CylinderGeometry(0.135, 0.235, 0.22, 28, 6, true);
    const cPos = capeGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      let vx = cPos.getX(i);
      let vy = cPos.getY(i);
      let vz = cPos.getZ(i);
      const ang = Math.atan2(vz, vx);
      const tuft = 1.0 + 0.08 * Math.sin(ang * 14.0 + vy * 35.0);
      vx *= tuft * 1.12;
      vz = vz * tuft * 0.74 - 0.012;
      // Dip lower on the back than the chest
      if (vz < 0) vy -= 0.055 * (0.11 - vy);
      vy += 1.33;
      cPos.setXYZ(i, vx, vy, vz);
    }
    capeGeo.computeVertexNormals();
    const capeMesh = new THREE.Mesh(capeGeo, mantleMat);
    capeMesh.castShadow = true;
    capeMesh.frustumCulled = false;
    group.add(capeMesh);
  } else if (styleCfg.mantle === 'wesekh_collar') {
    // 3D Egyptian Gold & Lapis Broad Wesekh Collar + Pleated Apron Front
    const collarGeo = new THREE.CylinderGeometry(0.105, 0.215, 0.10, 32, 2, true);
    collarGeo.scale(1.06, 1.0, 0.74);
    collarGeo.translate(0, 1.385, -0.005);
    const collarMesh = new THREE.Mesh(collarGeo, mantleMat);
    collarMesh.castShadow = true;
    collarMesh.frustumCulled = false;
    group.add(collarMesh);

    const apronGeo = new THREE.BoxGeometry(0.11, 0.38, 0.025);
    apronGeo.translate(0, 0.73, 0.125);
    const apronMesh = new THREE.Mesh(apronGeo, mantleMat);
    apronMesh.castShadow = true;
    apronMesh.frustumCulled = false;
    group.add(apronMesh);
  } else if (styleCfg.mantle === 'himation') {
    // 3D Greek Diagonal Himation Draped Sash
    const sashGeo = new THREE.TorusGeometry(0.195, 0.042, 10, 32);
    sashGeo.rotateY(Math.PI / 2);
    sashGeo.rotateZ(0.68);
    sashGeo.scale(1.02, 1.18, 0.72);
    sashGeo.translate(0.01, 1.18, 0.0);
    const sashMesh = new THREE.Mesh(sashGeo, mantleMat);
    sashMesh.castShadow = true;
    sashMesh.frustumCulled = false;
    group.add(sashMesh);
  } else if (styleCfg.mantle === 'pauldrons') {
    // 3D Roman Lorica Segmentata Shoulder Pauldrons & Pteruges Belt Strips
    [-1, 1].forEach((side) => {
      const pauldronGeo = new THREE.SphereGeometry(0.095, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
      pauldronGeo.scale(1.15, 0.85, 0.95);
      pauldronGeo.rotateZ(-side * 0.35);
      pauldronGeo.translate(side * 0.185, 1.365, -0.005);
      const pMesh = new THREE.Mesh(pauldronGeo, mantleMat);
      pMesh.castShadow = true;
      pMesh.frustumCulled = false;
      group.add(pMesh);
    });
  } else if (styleCfg.mantle === 'hood_cape' || styleCfg.mantle === 'woven_scarf' || styleCfg.mantle === 'coat_lapels') {
    // 3D Sculpted Shoulder Hood / Collar / Coat Lapel
    const hoodGeo = new THREE.CylinderGeometry(0.115, 0.21, 0.14, 28, 3, true);
    hoodGeo.scale(1.06, 1.0, 0.76);
    hoodGeo.translate(0, 1.37, -0.008);
    const hoodMesh = new THREE.Mesh(hoodGeo, mantleMat);
    hoodMesh.castShadow = true;
    hoodMesh.frustumCulled = false;
    group.add(hoodMesh);
  }

  return group;
}

/**
 * Builds a 3D held tool (spear, handaxe, firebrand, torch, sickle, hoe, jug, scroll, shield, shovel)
 * positioned in rest-pose hand coordinates so `articulateHumanPoint` moves it with the character's hand!
 */
function buildHeldToolMesh(toolType, sharedUniforms, ctx) {
  const group = new THREE.Group();
  const unitOffset = new THREE.Vector3(0, 0, 0);
  const unitScale = new THREE.Vector3(1, 1, 1);

  const makeMat = (
    color,
    roughness = 0.6,
    metalness = 0.05,
    emissive = 0x000000,
    emissiveIntensity = 0,
    handSign = 1.0
  ) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
    attachHumanShader(m, sharedUniforms, unitOffset, unitScale, false, handSign, 0.0);
    return m;
  };

  // Right hand rest-pose center in `skin.glb` is (-0.26, 0.83, 0.02); Left hand is (+0.26, 0.83, 0.02)
  const rh = new THREE.Vector3(-0.26, 0.83, 0.02);
  const lh = new THREE.Vector3(0.26, 0.83, 0.02);

  if (toolType === 'spear') {
    const shaftGeo = new THREE.CylinderGeometry(0.011, 0.014, 1.95, 10);
    shaftGeo.rotateX(Math.PI / 2);
    shaftGeo.translate(rh.x, rh.y, rh.z + 0.38);
    group.add(new THREE.Mesh(shaftGeo, makeMat(0x5c3c20, 0.82)));

    // Sinew binding collar
    const bindGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.07, 10);
    bindGeo.rotateX(Math.PI / 2);
    bindGeo.translate(rh.x, rh.y, rh.z + 1.32);
    group.add(new THREE.Mesh(bindGeo, makeMat(0x3a2412, 0.9)));

    // Leaf-shaped flaked flint / bronze spearhead
    const tipGeo = new THREE.ConeGeometry(0.028, 0.20, 6);
    tipGeo.scale(0.65, 1.0, 1.0);
    tipGeo.rotateX(Math.PI / 2);
    tipGeo.translate(rh.x, rh.y, rh.z + 1.44);
    group.add(new THREE.Mesh(tipGeo, makeMat(0x7c766e, 0.38, 0.25)));
  } else if (toolType === 'handaxe' || toolType === 'hammer') {
    // Hafted wooden handle + flaked stone head
    const haftGeo = new THREE.CylinderGeometry(0.013, 0.015, 0.38, 8);
    haftGeo.rotateX(Math.PI / 2);
    haftGeo.translate(rh.x, rh.y - 0.01, rh.z + 0.10);
    group.add(new THREE.Mesh(haftGeo, makeMat(0x5a3a1e, 0.85)));

    const stoneGeo = new THREE.DodecahedronGeometry(0.058, 0);
    stoneGeo.scale(0.68, 1.25, 0.95);
    stoneGeo.translate(rh.x, rh.y - 0.02, rh.z + 0.25);
    group.add(new THREE.Mesh(stoneGeo, makeMat(0x887c70, 0.52, 0.12)));

    // Second hammerstone / flint core in left hand for knapping
    const coreGeo = new THREE.DodecahedronGeometry(0.052, 0);
    coreGeo.translate(lh.x, lh.y - 0.01, lh.z + 0.12);
    group.add(new THREE.Mesh(coreGeo, makeMat(0x645c54, 0.58, 0.1, 0x000000, 0, -1.0)));
  } else if (toolType === 'firebrand' || toolType === 'torch') {
    const stickGeo = new THREE.CylinderGeometry(0.015, 0.020, 0.62, 10);
    stickGeo.rotateX(Math.PI / 2.3);
    stickGeo.translate(rh.x, rh.y + 0.06, rh.z + 0.22);
    group.add(new THREE.Mesh(stickGeo, makeMat(0x4a301a, 0.9)));

    const wrapGeo = new THREE.CylinderGeometry(0.028, 0.022, 0.12, 10);
    wrapGeo.rotateX(Math.PI / 2.3);
    wrapGeo.translate(rh.x, rh.y + 0.11, rh.z + 0.44);
    group.add(new THREE.Mesh(wrapGeo, makeMat(0x281a0e, 0.95)));

    const emberGeo = new THREE.ConeGeometry(0.052, 0.16, 12);
    emberGeo.rotateX(Math.PI / 3.2);
    emberGeo.translate(rh.x, rh.y + 0.17, rh.z + 0.52);
    group.add(new THREE.Mesh(emberGeo, makeMat(0xff7818, 0.2, 0.0, 0xff5a00, 3.8)));

    const coreFlameGeo = new THREE.SphereGeometry(0.036, 10, 10);
    coreFlameGeo.translate(rh.x, rh.y + 0.14, rh.z + 0.49);
    group.add(new THREE.Mesh(coreFlameGeo, makeMat(0xfff0a0, 0.1, 0.0, 0xffd060, 5.0)));
  } else if (toolType === 'sickle' || toolType === 'hoe') {
    const handleGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.56, 8);
    handleGeo.rotateX(Math.PI / 2);
    handleGeo.translate(rh.x, rh.y, rh.z + 0.22);
    group.add(new THREE.Mesh(handleGeo, makeMat(0x6e4a28, 0.8)));

    const bladeGeo = new THREE.TorusGeometry(0.15, 0.018, 8, 20, Math.PI * 0.82);
    bladeGeo.rotateY(Math.PI / 2);
    bladeGeo.translate(rh.x, rh.y - 0.06, rh.z + 0.48);
    group.add(new THREE.Mesh(bladeGeo, makeMat(0xc2a878, 0.38, 0.35)));

    // Gathered sheaf of golden wheat stalks in the left hand!
    const sheafGeo = new THREE.CylinderGeometry(0.045, 0.032, 0.42, 10);
    sheafGeo.rotateZ(0.35);
    sheafGeo.translate(lh.x, lh.y + 0.04, lh.z + 0.14);
    group.add(new THREE.Mesh(sheafGeo, makeMat(0xdcb450, 0.78, 0.02, 0x000000, 0, -1.0)));
  } else if (toolType === 'jug' || toolType === 'basket') {
    // Sculpted terracotta amphora with belly, neck, rim, and twin handles
    const bellyGeo = new THREE.SphereGeometry(0.125, 16, 12);
    bellyGeo.scale(1.0, 1.32, 1.0);
    bellyGeo.translate(lh.x, lh.y - 0.06, lh.z + 0.14);
    group.add(new THREE.Mesh(bellyGeo, makeMat(0xb8683c, 0.65, 0.05, 0x000000, 0, -1.0)));

    const neckGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.11, 14);
    neckGeo.translate(lh.x, lh.y + 0.11, lh.z + 0.14);
    group.add(new THREE.Mesh(neckGeo, makeMat(0x9e542c, 0.68, 0.05, 0x000000, 0, -1.0)));
  } else if (toolType === 'scroll') {
    const scrollGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.30, 14);
    scrollGeo.rotateZ(Math.PI / 2);
    scrollGeo.translate(rh.x, rh.y, rh.z + 0.11);
    group.add(new THREE.Mesh(scrollGeo, makeMat(0xf5ead2, 0.58)));

    const capGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.34, 10);
    capGeo.rotateZ(Math.PI / 2);
    capGeo.translate(rh.x, rh.y, rh.z + 0.11);
    group.add(new THREE.Mesh(capGeo, makeMat(0x7c4e28, 0.5, 0.2)));
  } else if (toolType === 'shield_sword') {
    // Forged steel sword with crossguard & pommel
    const bladeGeo = new THREE.BoxGeometry(0.014, 0.042, 0.72);
    bladeGeo.translate(rh.x, rh.y, rh.z + 0.40);
    group.add(new THREE.Mesh(bladeGeo, makeMat(0xdce2e8, 0.22, 0.90)));

    const guardGeo = new THREE.BoxGeometry(0.03, 0.16, 0.025);
    guardGeo.translate(rh.x, rh.y, rh.z + 0.05);
    group.add(new THREE.Mesh(guardGeo, makeMat(0xc89b3c, 0.32, 0.85)));

    // Curved Roman/Medieval Shield + central metallic umbo boss
    const shieldGeo = new THREE.CylinderGeometry(0.26, 0.24, 0.028, 24);
    shieldGeo.rotateZ(Math.PI / 2);
    shieldGeo.translate(lh.x + 0.045, lh.y + 0.12, lh.z + 0.09);
    group.add(new THREE.Mesh(shieldGeo, makeMat(0x9c221c, 0.42, 0.35, 0x000000, 0, -1.0)));

    const bossGeo = new THREE.SphereGeometry(0.055, 12, 10);
    bossGeo.translate(lh.x + 0.062, lh.y + 0.12, lh.z + 0.09);
    group.add(new THREE.Mesh(bossGeo, makeMat(0xd4a840, 0.25, 0.88, 0x000000, 0, -1.0)));
  } else if (toolType === 'shovel') {
    const shaftGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.98, 10);
    shaftGeo.rotateX(Math.PI / 2);
    shaftGeo.translate(rh.x, rh.y, rh.z + 0.34);
    group.add(new THREE.Mesh(shaftGeo, makeMat(0x5c3c22, 0.8)));

    const scoopGeo = new THREE.BoxGeometry(0.18, 0.025, 0.24);
    scoopGeo.translate(rh.x, rh.y - 0.02, rh.z + 0.84);
    group.add(new THREE.Mesh(scoopGeo, makeMat(0x2a2e34, 0.38, 0.82)));

    // Lump of bituminous coal in the shovel scoop
    const coalGeo = new THREE.DodecahedronGeometry(0.055, 0);
    coalGeo.scale(1.2, 0.65, 1.3);
    coalGeo.translate(rh.x, rh.y + 0.02, rh.z + 0.84);
    group.add(new THREE.Mesh(coalGeo, makeMat(0x18181a, 0.45, 0.25)));
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
 * Helper to precompute path arc-lengths and interpolate position + smooth heading + U-turn loop
 * so characters never skate or snap 180 degrees instantaneously.
 */
function buildPathNavigator(path) {
  if (!path || path.length < 2) return null;
  const segs = [];
  let totalLen = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const p0 = path[i];
    const p1 = path[i + 1];
    const dx = p1[0] - p0[0];
    const dz = p1[1] - p0[1];
    const len = Math.max(0.001, Math.hypot(dx, dz));
    segs.push({ p0, p1, dx, dz, len, startDist: totalLen, yaw: Math.atan2(dx, dz) });
    totalLen += len;
  }
  return {
    totalLen: Math.max(0.1, totalLen),
    sample(u, dirSign) {
      const targetDist = THREE.MathUtils.clamp(u, 0, 1) * totalLen;
      let seg = segs[segs.length - 1];
      for (let i = 0; i < segs.length; i++) {
        if (targetDist <= segs[i].startDist + segs[i].len || i === segs.length - 1) {
          seg = segs[i];
          break;
        }
      }
      const localT = THREE.MathUtils.clamp((targetDist - seg.startDist) / seg.len, 0, 1);
      // Add a subtle rounded oval offset perpendicular to the segment so outbound & return paths form a natural loop
      const nx = -seg.dz / seg.len;
      const nz = seg.dx / seg.len;
      const loopBulge = Math.sin(u * Math.PI) * 0.26 * dirSign;
      const x = seg.p0[0] + seg.dx * localT + nx * loopBulge;
      const z = seg.p0[1] + seg.dz * localT + nz * loopBulge;

      // Smooth turnaround yaw near u = 0 and u = 1 instead of a 1-frame 180-degree snap
      const baseYaw = seg.yaw;
      const forwardYaw = baseYaw;
      const reverseYaw = baseYaw + Math.PI;
      const edgeWindow = Math.min(0.12, 0.45 / Math.max(1.0, totalLen));
      let yaw = dirSign > 0 ? forwardYaw : reverseYaw;
      let turnLean = 0.0;
      let speedFactor = 1.0;

      if (dirSign > 0 && u > 1.0 - edgeWindow) {
        const k = THREE.MathUtils.smoothstep(u, 1.0 - edgeWindow, 1.0);
        yaw = forwardYaw + k * (Math.PI * 0.5);
        turnLean = Math.sin(k * Math.PI);
        speedFactor = 1.0 - 0.35 * k;
      } else if (dirSign < 0 && u > 1.0 - edgeWindow) {
        const k = THREE.MathUtils.smoothstep(u, 1.0, 1.0 - edgeWindow);
        yaw = forwardYaw + Math.PI * 0.5 + k * (Math.PI * 0.5);
        turnLean = Math.sin((1.0 - k) * Math.PI);
        speedFactor = 0.65 + 0.35 * k;
      } else if (dirSign < 0 && u < edgeWindow) {
        const k = THREE.MathUtils.smoothstep(u, edgeWindow, 0.0);
        yaw = reverseYaw + k * (Math.PI * 0.5);
        turnLean = Math.sin(k * Math.PI);
        speedFactor = 1.0 - 0.35 * k;
      } else if (dirSign > 0 && u < edgeWindow) {
        const k = THREE.MathUtils.smoothstep(u, 0.0, edgeWindow);
        yaw = reverseYaw + Math.PI * 0.5 + k * (Math.PI * 0.5);
        turnLean = Math.sin((1.0 - k) * Math.PI);
        speedFactor = 0.65 + 0.35 * k;
      }

      return { x, z, yaw, turnLean, speedFactor };
    },
  };
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
  const phase = opts.phase !== undefined ? opts.phase : Math.abs(x * 1.7 + z * 2.3) % 6.28;

  const sharedUniforms = {
    uTime: { value: 0 },
    uWalkCycle: { value: phase },
    uWalkBlend: { value: 1.0 },
    uTurnLean: { value: 0.0 },
    uPhase: { value: phase },
    uAction: { value: ACTION_CODES[action] ?? 0 },
    uSpeed: { value: speed },
    uReact: { value: 0 },
    uClothColor1: { value: new THREE.Color(opts.clothColor1 ?? styleCfg.clothColor1) },
    uClothColor2: { value: new THREE.Color(opts.clothColor2 ?? styleCfg.clothColor2) },
    uTrouserColor: { value: new THREE.Color(opts.trouserColor ?? styleCfg.trouserColor ?? styleCfg.bootColor) },
    uBootColor: { value: new THREE.Color(opts.bootColor ?? styleCfg.bootColor) },
    uGarmentYMin: { value: styleCfg.garmentYMin },
    uGarmentYMax: { value: styleCfg.garmentYMax },
    uSleeveXMax: { value: styleCfg.sleeveYMin },
    uBootHeight: { value: styleCfg.bootHeight },
    uHasTrousers: { value: styleCfg.hasTrousers ?? 0.0 },
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
    let rough = 0.52;
    if (isHair) {
      baseCol = opts.hairColor ?? styleCfg.hairColor;
      rough = 0.76;
    } else if (isLip) {
      baseCol = 0x8e4a42;
      rough = 0.42;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: baseCol,
      roughness: rough,
      metalness: 0.02,
    });
    attachHumanShader(mat, sharedUniforms, child.position, child.scale, isMainSkin, 0.0, 0.0);
    m.material = mat;
    humanGroup.add(m);
  });

  // Add 3D eyes + 3D draped garments (skirt/kilt/tunic, waist belt, shoulder mantle/collar/pauldrons)
  humanGroup.add(buildEyesMesh(sharedUniforms, opts.hairColor ?? styleCfg.hairColor));
  humanGroup.add(buildEraGarmentMeshes(style, styleCfg, sharedUniforms, opts));

  // Optional era headgear (straw hat for farmer, nemes headcloth for Egyptian, crested helmet for Roman/Medieval, cap for Industrial)
  const effectiveHat = hat || (style === 'egyptian' ? 'nemes' : null);
  if (effectiveHat) {
    const hatOffset = new THREE.Vector3(0, 0, 0);
    const hatScale = new THREE.Vector3(1, 1, 1);
    const hatGroup = new THREE.Group();

    const makeHatMat = (color, roughness = 0.6, metalness = 0.1) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, side: THREE.DoubleSide });
      attachHumanShader(m, sharedUniforms, hatOffset, hatScale, false, 0.0, 0.0);
      return m;
    };

    if (effectiveHat === 'straw') {
      const brim = new THREE.ConeGeometry(0.24, 0.09, 24);
      brim.translate(0, 1.70, -0.015);
      hatGroup.add(new THREE.Mesh(brim, makeHatMat(0xdcb868, 0.82)));
      const crown = new THREE.SphereGeometry(0.095, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
      crown.translate(0, 1.69, -0.015);
      hatGroup.add(new THREE.Mesh(crown, makeHatMat(0xc8a252, 0.85)));
    } else if (effectiveHat === 'nemes') {
      // Egyptian Nemes Headcloth + golden Uraeus brow band
      const crown = new THREE.SphereGeometry(0.112, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.65);
      crown.scale(1.08, 1.0, 1.05);
      crown.translate(0, 1.63, -0.02);
      hatGroup.add(new THREE.Mesh(crown, makeHatMat(0x244c7c, 0.55, 0.15)));
      const band = new THREE.CylinderGeometry(0.104, 0.104, 0.028, 20);
      band.translate(0, 1.64, -0.01);
      hatGroup.add(new THREE.Mesh(band, makeHatMat(0xd8a436, 0.28, 0.85)));
    } else if (effectiveHat === 'helmet') {
      const isRoman = style === 'roman';
      const helmCol = isRoman ? 0xc89b3c : 0x9aa2ac;
      const helm = new THREE.SphereGeometry(0.108, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62);
      helm.translate(0, 1.63, -0.018);
      hatGroup.add(new THREE.Mesh(helm, makeHatMat(helmCol, 0.26, 0.88)));

      const brim = new THREE.CylinderGeometry(0.125, 0.135, 0.025, 20);
      brim.translate(0, 1.59, -0.025);
      hatGroup.add(new THREE.Mesh(brim, makeHatMat(helmCol, 0.28, 0.85)));

      if (isRoman) {
        // Centurion / Legionary crimson horsehair crest (crista)
        const crest = new THREE.BoxGeometry(0.032, 0.085, 0.22);
        crest.translate(0, 1.76, -0.02);
        hatGroup.add(new THREE.Mesh(crest, makeHatMat(0xa81c18, 0.75, 0.05)));
      }
    } else if (effectiveHat === 'cap') {
      const cap = new THREE.CylinderGeometry(0.102, 0.096, 0.075, 18);
      cap.translate(0, 1.69, -0.018);
      hatGroup.add(new THREE.Mesh(cap, makeHatMat(0x242830, 0.72)));
      const visor = new THREE.CylinderGeometry(0.095, 0.095, 0.015, 16, 1, false, -Math.PI * 0.4, Math.PI * 0.8);
      visor.translate(0, 1.655, 0.035);
      hatGroup.add(new THREE.Mesh(visor, makeHatMat(0x15181e, 0.45, 0.2)));
    }

    hatGroup.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.frustumCulled = false;
      }
    });
    humanGroup.add(hatGroup);
  }

  if (tool) {
    humanGroup.add(buildHeldToolMesh(tool, sharedUniforms, ctx));
    // If carrying a torch or firebrand, attach a real warm flickering PointLight!
    if (tool === 'torch' || tool === 'firebrand') {
      const torchLight = new THREE.PointLight(0xff7b24, 5.5, 9.5, 1.7);
      torchLight.position.set(-0.28, 1.25, 0.48);
      humanGroup.add(torchLight);
    }
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

  const nav = buildPathNavigator(path);
  // Real-world walking speed ~ 1.15 m/s scaled by character speed
  const metersPerSec = 1.15 * speed;

  // Frame update: advance GPU skeletal shader time + move along 3D terrain path if provided
  ctx.anim.push((t, dt) => {
    sharedUniforms.uTime.value = t;
    if (sharedUniforms.uReact.value > 0.001) {
      sharedUniforms.uReact.value = Math.max(0, sharedUniforms.uReact.value - dt * 0.8);
    }

    if (nav) {
      const distWalked = t * metersPerSec + phase * 1.2;
      const rawCycles = (distWalked / nav.totalLen) % 2.0;
      const dirSign = rawCycles <= 1.0 ? 1 : -1;
      const u = rawCycles <= 1.0 ? rawCycles : 2.0 - rawCycles;

      const sample = nav.sample(u, dirSign);
      const ny = ctx.terrain ? ctx.terrain.heightAt(sample.x, sample.z) : 0;

      humanGroup.position.set(sample.x, ny, sample.z);
      humanGroup.rotation.y = sample.yaw;

      // Lock stride cycle directly to meters walked (1 step = 0.72m -> 1 full L+R cycle = 1.44m -> rad/m = 2*PI / 1.44 = 4.36)
      sharedUniforms.uWalkCycle.value = distWalked * (4.36 / Math.max(0.75, sFactor)) + phase;
      sharedUniforms.uWalkBlend.value = sample.speedFactor;
      sharedUniforms.uTurnLean.value = sample.turnLean;
    } else {
      sharedUniforms.uWalkCycle.value = t * (2.6 * speed) + phase;
      sharedUniforms.uWalkBlend.value = 1.0;
      sharedUniforms.uTurnLean.value = 0.0;
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

  const nav = buildPathNavigator(path);
  const metersPerSec = 1.45 * speed;

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

    if (nav) {
      const distWalked = t * metersPerSec + phase * 1.8;
      const rawCycles = (distWalked / nav.totalLen) % 2.0;
      const dirSign = rawCycles <= 1.0 ? 1 : -1;
      const u = rawCycles <= 1.0 ? rawCycles : 2.0 - rawCycles;

      const sample = nav.sample(u, dirSign);
      const ny = ctx.terrain ? ctx.terrain.heightAt(sample.x, sample.z) : basePos.y;
      obj.rotation.y = sample.yaw;
      obj.position.set(sample.x, ny + Math.abs(Math.cos(w)) * 0.04, sample.z);
    }
  });

  return obj;
}
