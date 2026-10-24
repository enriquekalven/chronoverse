import * as THREE from '../../vendor/three/build/three.module.js';
import { EffectComposer } from '../../vendor/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../vendor/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../../vendor/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../../vendor/three/examples/jsm/postprocessing/OutputPass.js';
import { createDioramaForMilestone } from './SceneBuilders.js';

function createStarSpriteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.22, 'rgba(220,238,255,0.85)');
  g.addColorStop(0.55, 'rgba(125,211,252,0.22)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * TimeTunnelEngine v2.0 — Hyper-Realistic WebGL 3D Helical Time-Machine & Diorama Renderer.
 * Features:
 * - HDR Post-Processing (EffectComposer + UnrealBloomPass + ACESFilmic OutputPass)
 * - Dynamic PCFSoftShadowMap directional sun tracking the active diorama
 * - ESO 2K Milky Way 360° Skybox Dome + Volumetric Starfield
 * - 30 Hyper-Realistic Milestones from Big Bang (13.8B YA) to Year 3000 CE
 */
export class TimeTunnelEngine {
  constructor(canvas, milestones, callbacks = {}) {
    this.canvas = canvas;
    this.milestones = milestones;
    this.callbacks = callbacks;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x040714, 0.0105);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      480
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // HDR Bloom Post-Processing Pipeline
    this.bloomEnabled = true;
    this._initPostProcessing();

    // Continuous progress along timeline: 0.0 (Big Bang) → (milestones.length - 1) (Year 3000)
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.activeIndex = 0;

    // User 360° orbit offset around the currently viewed milestone
    this.orbitYaw = 0.0;
    this.orbitPitch = 0.04;
    this.orbitDistance = 7.4;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    // Autopilot & What-If states
    this.isAutoPlaying = false;
    this.autoPlaySpeed = 0.24; // milestones per second
    this.whatIfMap = new Map();
    this.showTunnelRibbon = true;
    this.lightTheme = false;

    this.dioramas = [];
    this.milestonePositions = [];
    this.textures = {};
    this.clock = new THREE.Clock();

    this._initLights();
    this._computeSpiralPositions();
    this._initStarfieldAndTunnel();
    this._bindInteractions();
  }

  _initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.24, // strength — crisp photorealistic textures with subtle emissive glow
      0.55, // radius
      0.86  // threshold
    );
    this.composer.addPass(this.bloomPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  async init() {
    await this._loadTextures();
    this._initMilkyWaySkyDome();
    this._buildAllDioramas();
    this._animate();
    if (this.callbacks.onReady) {
      this.callbacks.onReady();
    }
  }

  _initLights() {
    // Rich hemisphere light for natural sky/ground bounce
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.9);
    this.scene.add(this.hemiLight);

    // Key sun light with soft shadow map following the active stage
    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 2.35);
    this.sunLight.position.set(12, 18, 12);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 48;
    const d = 6.5;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0008;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Rim backlight for cinematic 3D separation
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    this.rimLight.position.set(-14, 10, -14);
    this.scene.add(this.rimLight);

    // Era accent point light
    this.eraPointLight = new THREE.PointLight(0xf97316, 2.4, 28);
    this.scene.add(this.eraPointLight);
  }

  _computeSpiralPositions() {
    // Space all 30 milestones along a 3D helical wave
    const spacingZ = -22;
    this.milestonePositions = this.milestones.map((_, i) => {
      const angle = i * 0.62;
      const x = Math.sin(angle) * 9.5;
      const y = Math.cos(angle * 0.8) * 3.1;
      const z = i * spacingZ;
      return new THREE.Vector3(x, y, z);
    });
    this.spline = new THREE.CatmullRomCurve3(this.milestonePositions);
  }

  _initStarfieldAndTunnel() {
    // 1. Glowing Cosmic Time Ribbon connecting all 30 eras
    const tubeGeo = new THREE.TubeGeometry(this.spline, 380, 0.13, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.25,
      metalness: 0.6,
      transparent: true,
      opacity: 0.42,
    });
    this.tunnelRibbon = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.tunnelRibbon);

    // Outer wireframe time tunnel rails
    const outerTubeGeo = new THREE.TubeGeometry(this.spline, 260, 5.4, 12, false);
    const outerTubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.055,
    });
    this.outerTunnel = new THREE.Mesh(outerTubeGeo, outerTubeMat);
    this.scene.add(this.outerTunnel);

    // 2. Volumetric Deep-Space Starfield spanning all 30 milestones
    const starCount = 4800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);
    const totalLength = this.milestones.length * 22 + 100;

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 165;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 105;
      starPos[i * 3 + 2] = 35 - Math.random() * totalLength;

      const tint = Math.random();
      if (tint > 0.72) {
        starCols[i * 3] = 1.0;
        starCols[i * 3 + 1] = 0.88;
        starCols[i * 3 + 2] = 0.72;
      } else if (tint > 0.35) {
        starCols[i * 3] = 0.82;
        starCols[i * 3 + 1] = 0.92;
        starCols[i * 3 + 2] = 1.0;
      } else {
        starCols[i * 3] = 0.95;
        starCols[i * 3 + 1] = 0.96;
        starCols[i * 3 + 2] = 1.0;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

    const starSprite = createStarSpriteTexture();
    this.stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.75,
        map: starSprite,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    this.scene.add(this.stars);
  }

  _initMilkyWaySkyDome() {
    if (!this.textures.skyMilkyWay) return;
    const domeGeo = new THREE.SphereGeometry(210, 48, 32);
    const domeMat = new THREE.MeshBasicMaterial({
      map: this.textures.skyMilkyWay,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      fog: false,
    });
    this.skyDome = new THREE.Mesh(domeGeo, domeMat);
    this.scene.add(this.skyDome);
  }

  async _loadTextures() {
    const loader = new THREE.TextureLoader();
    const loadSafe = (url, isLinear = false) =>
      new Promise((resolve) => {
        loader.load(
          url,
          (tex) => {
            tex.colorSpace = isLinear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
            tex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
            resolve(tex);
          },
          undefined,
          () => resolve(null)
        );
      });

    const [
      earthDay,
      earthNight,
      earthClouds,
      earthSpec,
      moon,
      moonBump,
      mars,
      sun,
      skyMilkyWay,
    ] = await Promise.all([
      loadSafe('./assets/textures/earth_day_nasa_5400.jpg'),
      loadSafe('./assets/textures/earth_night_nasa_3600.jpg'),
      loadSafe('./assets/textures/earth_clouds_nasa_2048.jpg'),
      loadSafe('./assets/textures/earth_specular_2048.jpg', true),
      loadSafe('./assets/textures/moon_2k.jpg'),
      loadSafe('./assets/textures/moon_bump_nasa_1440.jpg', true),
      loadSafe('./assets/textures/mars_2k.jpg'),
      loadSafe('./assets/textures/sun_2k.jpg'),
      loadSafe('./assets/textures/sky_milkyway_2k.jpg'),
    ]);

    this.textures = {
      earthDay,
      earthNight,
      earthClouds,
      earthSpec,
      moon,
      moonBump,
      mars,
      sun,
      skyMilkyWay,
    };
  }

  _buildAllDioramas() {
    this.dioramas = this.milestones.map((milestone, idx) => {
      const built = createDioramaForMilestone(milestone, this.textures);
      built.group.position.copy(this.milestonePositions[idx]);

      // Enable shadow casting & receiving across diorama meshes
      built.group.traverse((child) => {
        if (child.isMesh && child.material) {
          const isAdditive = child.material.blending === THREE.AdditiveBlending;
          const isTransparentShell = child.material.transparent && child.material.opacity < 0.7;
          if (!isAdditive && !isTransparentShell) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }
      });

      this.scene.add(built.group);
      return built;
    });
  }

  _bindInteractions() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.composer.setSize(w, h);
      this.bloomPass.resolution.set(w, h);
    });

    // Mouse / Touch drag to orbit 360° around the active 3D diorama
    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.canvas.setPointerCapture(e.pointerId);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.orbitYaw -= dx * 0.0065;
      this.orbitPitch = Math.max(-0.55, Math.min(1.05, this.orbitPitch + dy * 0.0055));
    });

    const endDrag = () => {
      this.isDragging = false;
    };
    this.canvas.addEventListener('pointerup', endDrag);
    this.canvas.addEventListener('pointercancel', endDrag);

    // Wheel scrolling flies smoothly through the 13.8-billion-year timeline!
    window.addEventListener(
      'wheel',
      (e) => {
        if (
          e.target.closest('.hud-right-inspector') ||
          e.target.closest('.hud-left-panel') ||
          e.target.closest('.modal-dialog') ||
          e.target.closest('.stops-drawer-list')
        ) {
          return;
        }
        e.preventDefault();
        this.isAutoPlaying = false;
        if (this.callbacks.onAutoPlayChange) {
          this.callbacks.onAutoPlayChange(false);
        }
        const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * 0.0028, 0.45);
        this.setTargetProgress(this.targetProgress + delta);
      },
      { passive: false }
    );
  }

  setTargetProgress(val) {
    const maxIdx = this.milestones.length - 1;
    this.targetProgress = Math.max(0, Math.min(maxIdx, val));
    const nearest = Math.round(this.targetProgress);
    if (nearest !== this.activeIndex) {
      this.activeIndex = nearest;
      if (this.callbacks.onMilestoneChange) {
        this.callbacks.onMilestoneChange(this.milestones[this.activeIndex], this.activeIndex);
      }
    }
  }

  flyToIndex(index) {
    this.isAutoPlaying = false;
    if (this.callbacks.onAutoPlayChange) {
      this.callbacks.onAutoPlayChange(false);
    }
    this.setTargetProgress(index);
  }

  /** Instantly snap to an era (no fly-in animation). Used by ?stop= deep links. */
  jumpToIndex(index) {
    this.flyToIndex(index);
    this.currentProgress = this.targetProgress;
  }

  zoomCamera(delta) {
    this.orbitDistance = Math.max(4.4, Math.min(15.0, this.orbitDistance + delta));
  }

  toggleWhatIf(milestoneId) {
    const next = !this.whatIfMap.get(milestoneId);
    this.whatIfMap.set(milestoneId, next);
    return next;
  }

  isWhatIfActive(milestoneId) {
    return Boolean(this.whatIfMap.get(milestoneId));
  }

  setAutoPlay(enabled) {
    this.isAutoPlaying = enabled;
    if (this.callbacks.onAutoPlayChange) {
      this.callbacks.onAutoPlayChange(enabled);
    }
  }

  setTunnelVisible(visible) {
    this.showTunnelRibbon = visible;
    this.tunnelRibbon.visible = visible;
    this.outerTunnel.visible = visible;
  }

  setBloomEnabled(enabled) {
    this.bloomEnabled = enabled;
  }

  setLightTheme(isLight) {
    this.lightTheme = isLight;
    if (this.skyDome) {
      this.skyDome.visible = !isLight;
    }
  }

  getProjectedMarkers() {
    const markers = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < this.milestones.length; i++) {
      if (Math.abs(i - this.currentProgress) > 3.2) continue;
      const worldPos = this.milestonePositions[i].clone();
      worldPos.y += 2.75;
      const projected = worldPos.project(this.camera);
      if (projected.z > 1.0) continue;
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      markers.push({
        index: i,
        milestone: this.milestones[i],
        x,
        y,
        isActive: i === this.activeIndex,
      });
    }
    return markers;
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    if (this.isAutoPlaying) {
      const maxIdx = this.milestones.length - 1;
      const next = this.targetProgress + dt * this.autoPlaySpeed;
      if (next >= maxIdx) {
        this.setTargetProgress(maxIdx);
        this.setAutoPlay(false);
      } else {
        this.setTargetProgress(next);
      }
    }

    // Smooth exponential damping toward target timeline progress
    this.currentProgress += (this.targetProgress - this.currentProgress) * Math.min(1, dt * 6.5);

    const maxIdx = this.milestones.length - 1;
    const clampedU = Math.max(0, Math.min(1, this.currentProgress / maxIdx));
    const focusPoint = this.spline.getPointAt(clampedU);

    // Position camera at user's orbital angle around the interpolated focus point
    const camOffset = new THREE.Vector3(
      Math.sin(this.orbitYaw) * Math.cos(this.orbitPitch) * this.orbitDistance,
      Math.sin(this.orbitPitch) * this.orbitDistance + 0.48,
      Math.cos(this.orbitYaw) * Math.cos(this.orbitPitch) * this.orbitDistance
    );

    this.camera.position.copy(focusPoint).add(camOffset);
    this.camera.lookAt(focusPoint.x, focusPoint.y - 0.12, focusPoint.z);

    if (this.skyDome) {
      this.skyDome.position.copy(this.camera.position);
      this.skyDome.rotation.y = elapsed * 0.008;
    }

    // Track directional sun shadow frustum to active focusPoint
    this.sunLight.position.set(focusPoint.x + 8, focusPoint.y + 13, focusPoint.z + 9);
    this.sunLight.target.position.copy(focusPoint);
    this.sunLight.target.updateMatrixWorld();

    // Update sky tint & dynamic point light based on current milestone
    const activeMilestone = this.milestones[this.activeIndex] || this.milestones[0];
    this.eraPointLight.position.copy(focusPoint).add(new THREE.Vector3(0, 3.5, 2.0));
    this.eraPointLight.color.set(activeMilestone.themeColor);

    const [r, g, b] = activeMilestone.skyTint || [0.02, 0.05, 0.12];
    const bgColor = this.lightTheme
      ? new THREE.Color(0.88, 0.93, 0.98)
      : new THREE.Color(r, g, b);
    this.scene.background = bgColor;
    this.scene.fog.color.copy(bgColor);

    // Update visible dioramas
    for (let i = 0; i < this.dioramas.length; i++) {
      const dist = Math.abs(i - this.currentProgress);
      const dio = this.dioramas[i];
      dio.group.visible = dist < 4.5;
      if (dio.group.visible) {
        const whatIf = this.isWhatIfActive(this.milestones[i].id);
        dio.update(elapsed, dt, whatIf);
      }
    }

    if (this.callbacks.onFrame) {
      this.callbacks.onFrame(this.currentProgress);
    }

    if (this.bloomEnabled && !this.lightTheme) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
