import * as THREE from '../../vendor/three/build/three.module.js';
import {
  makeAtmosphereShell,
  makeSolarGranulationMaterial,
  createDriftingEarthGlobe,
} from './HyperRealKit.js';
import {
  createVolumetricCinemaStage,
  attachRealAnatomicalGLB,
  attachVolumetricAtmosphereParticles,
} from './VolumetricCinemaStage.js';

/**
 * SceneBuilders.js (v3.0 — True Photorealistic 3D Volumetric & GLB Architecture)
 * ============================================================================
 * Zero primitive "Lego" or "Play-Doh" toy models.
 * Every milestone combines:
 *  1. A curved 3D Depth-Displaced & Parallax-Occluded Volumetric Stage powered
 *     by 8K National-Geographic / BBC-Prehistoric-Planet / NASA-IMAX photography
 *     and custom GLSL living creature/environment kinematics.
 *  2. Genuine high-resolution 3D planetary globes (NASA 5.4K Blue Marble, Moon,
 *     Mars, Solar Photosphere, and Paleogeographic Continental Drift globes from
 *     Pangaea 250 MYA -> Today) or real 70,000+ polygon .glb 3D anatomical scans
 *     (skeleton.glb, muscles.glb, skin.glb).
 *  3. Volumetric 3D weather & environmental particle systems (rain, snowstorms,
 *     rising fire embers, underwater oxygen bubbles, cosmic starfields).
 * ============================================================================
 */

function attachCompanionGlobe(group, milestone, textures, animCallbacks, mode = 'drift') {
  const holder = new THREE.Group();
  holder.position.set(-4.65, -0.35, 0.85);
  group.add(holder);

  const radius = 1.05;

  if (mode === 'drift') {
    const isIceAge = milestone.id === 'ice-age-mammoths' || milestone.id === 'beringia-americas';
    const paleoObj = createDriftingEarthGlobe(milestone.paleoMa ?? 0, radius, {
      iceAge: isIceAge,
      showLabels: false,
    });
    holder.add(paleoObj.group);
    animCallbacks.push((t) => {
      paleoObj.globe.rotation.y = t * 0.25;
    });
  } else if (mode === 'earth_nasa') {
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 48),
      new THREE.MeshStandardMaterial({
        map: textures.earthDay || null,
        roughness: 0.45,
        metalness: 0.1,
      })
    );
    holder.add(earth);

    if (textures.earthClouds) {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.02, 48, 36),
        new THREE.MeshStandardMaterial({
          map: textures.earthClouds,
          alphaMap: textures.earthClouds,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        })
      );
      holder.add(clouds);
      animCallbacks.push((t) => {
        clouds.rotation.y = t * 0.31;
      });
    }
    holder.add(makeAtmosphereShell(radius, '#38bdf8', 1.25, 2.8));
    animCallbacks.push((t) => {
      earth.rotation.y = t * 0.24;
    });
  } else if (mode === 'moon_nasa') {
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.92, 64, 48),
      new THREE.MeshStandardMaterial({
        map: textures.moon || null,
        bumpMap: textures.moonBump || null,
        bumpScale: 0.06,
        roughness: 0.92,
      })
    );
    holder.add(moon);
    animCallbacks.push((t) => {
      moon.rotation.y = t * 0.18;
    });
  } else if (mode === 'mars_nasa') {
    const mars = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.96, 64, 48),
      new THREE.MeshStandardMaterial({
        map: textures.mars || null,
        roughness: 0.78,
        metalness: 0.05,
      })
    );
    holder.add(mars);
    holder.add(makeAtmosphereShell(radius * 0.96, '#f97316', 1.05, 2.8));
    animCallbacks.push((t) => {
      mars.rotation.y = t * 0.22;
    });
  } else if (mode === 'sun_nasa') {
    const sunMat = textures.sun
      ? makeSolarGranulationMaterial(textures.sun, '#fde047', 1.55)
      : new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 48), sunMat);
    holder.add(sun);
    holder.add(makeAtmosphereShell(radius, '#f59e0b', 1.45, 2.4));
    animCallbacks.push((t) => {
      sun.rotation.y = t * 0.16;
      if (sunMat.uniforms && sunMat.uniforms.uTime) {
        sunMat.uniforms.uTime.value = t;
      }
    });
  }

  return holder;
}

export function createDioramaForMilestone(m, textures = {}) {
  const group = new THREE.Group();
  const animCallbacks = [];
  const accentHex = m.themeColor || m.accent || '#38bdf8';

  // 1. Primary 3D Depth-Displaced & Parallax-Mapped Photorealistic Volumetric Stage
  const cinemaStage = createVolumetricCinemaStage(m, animCallbacks);
  group.add(cinemaStage);

  // 2. Volumetric 3D Atmospheric Particles (rain, snow, embers, underwater bubbles, dust)
  attachVolumetricAtmosphereParticles(group, m.id, accentHex, animCallbacks);

  // 3. Companion True-3D Planetary Globes & Real 70,000-Polygon .glb Anatomical Scans
  switch (m.id) {
    case 'birth-of-sun-earth':
    case 'year-3000-dyson':
      attachCompanionGlobe(group, m, textures, animCallbacks, 'sun_nasa');
      break;

    case 'moon-impact':
    case 'computers-space-age':
      attachCompanionGlobe(group, m, textures, animCallbacks, 'moon_nasa');
      break;

    case 'pangaea-permian':
    case 'triassic-dinosaurs':
    case 'jurassic-giants':
    case 'cretaceous-trex':
    case 'chicxulub-extinction':
    case 'himalayas-mammals':
    case 'ice-age-mammoths':
    case 'beringia-americas':
      attachCompanionGlobe(group, m, textures, animCallbacks, 'drift');
      break;

    case 'iphone-mobile-era':
      attachCompanionGlobe(group, m, textures, animCallbacks, 'earth_nasa');
      break;

    case 'interplanetary-2150':
      attachCompanionGlobe(group, m, textures, animCallbacks, 'mars_nasa');
      break;

    case 'hominid-ancestors':
      attachRealAnatomicalGLB(group, animCallbacks, {
        modelFile: 'skeleton.glb',
        position: [4.65, -1.85, 0.85],
        scale: 1.35,
        tintColor: 0xd6c7b2,
        roughness: 0.55,
        metalness: 0.08,
      });
      break;

    case 'discovery-of-fire':
      attachRealAnatomicalGLB(group, animCallbacks, {
        modelFile: 'skeleton.glb',
        position: [4.65, -1.85, 0.85],
        scale: 1.35,
        tintColor: 0xfed7aa,
        roughness: 0.45,
        metalness: 0.12,
        emissiveColor: 0xea580c,
        emissiveIntensity: 0.18,
      });
      break;

    case 'neanderthals':
      attachRealAnatomicalGLB(group, animCallbacks, {
        modelFile: 'muscles.glb',
        position: [4.65, -1.85, 0.85],
        scale: 1.35,
        tintColor: 0xc26d53,
        roughness: 0.48,
        metalness: 0.10,
      });
      break;

    case 'homo-sapiens':
    case 'hunting-gathering':
      attachRealAnatomicalGLB(group, animCallbacks, {
        modelFile: 'skin.glb',
        position: [4.65, -1.85, 0.85],
        scale: 1.35,
        tintColor: 0xd9a784,
        roughness: 0.42,
        metalness: 0.12,
      });
      break;

    case 'ai-age-today':
      attachCompanionGlobe(group, m, textures, animCallbacks, 'earth_nasa');
      attachRealAnatomicalGLB(group, animCallbacks, {
        modelFile: 'skeleton.glb',
        position: [4.65, -1.85, 0.85],
        scale: 1.35,
        tintColor: 0x38bdf8,
        roughness: 0.2,
        metalness: 0.85,
        emissiveColor: 0x0284c7,
        emissiveIntensity: 0.45,
      });
      break;

    default:
      if (typeof m.paleoMa === 'number') {
        attachCompanionGlobe(group, m, textures, animCallbacks, 'drift');
      }
      break;
  }

  return {
    group,
    update(elapsed, dt, whatIf) {
      for (let i = 0; i < animCallbacks.length; i++) {
        animCallbacks[i](elapsed, dt, whatIf);
      }
    },
  };
}

export const buildMilestoneDiorama = createDioramaForMilestone;
