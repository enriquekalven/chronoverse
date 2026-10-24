import * as THREE from '../../vendor/three/build/three.module.js';
import { EffectComposer } from '../../vendor/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../vendor/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../../vendor/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../../vendor/three/examples/jsm/postprocessing/OutputPass.js';
import { GTAOPass } from '../../vendor/three/examples/jsm/postprocessing/GTAOPass.js';
import { AssetLibrary } from './world/AssetLibrary.js';
import { buildWorld } from './world/EraWorlds.js';
import { LinearCorridor, CORRIDOR_SPACING, GLOBE_RADIUS } from './world/LinearCorridor.js';

/**
 * WorldEngine v5.0 — Linear Warp-Speed Earth-to-Earth Time-Lapse + Surface 3D Zoom-In Engine.
 *
 * Two seamlessly connected 3D view levels:
 *   1. 'orbit' (Linear Time-Lapse Corridor):
 *      All 30 Planet Earths / Cosmic Epochs are arranged in a linear 3D corridor along -Z.
 *      Scrolling warps you at light-speed from one Earth to the next so you watch the planet,
 *      climate, and continents (Pangaea -> Laurasia/Gondwana -> Modern 7 Continents) change.
 *   2. 'surface' (Zoom Into the World):
 *      Clicking the Earth, clicking the 3D Portal Pin, or zooming in dives the camera through
 *      the atmosphere onto the living 3D surface diorama (moving rigged dinosaurs, Chicxulub
 *      impact fireball, Homo erectus discovering fire, Woolly Mammoths, Pyramids, Apollo 11, AI).
 */
export class WorldEngine {
  constructor(canvas, milestones, callbacks = {}) {
    this.canvas = canvas;
    this.milestones = milestones;
    this.callbacks = callbacks;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: false,
    });
    const params = new URLSearchParams(window.location.search);
    this.lowFx = params.get('fx') === 'low';
    this.renderer.setPixelRatio(this.lowFx ? 1 : Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.0015);
    this.camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.08, 1600);

    this.assets = new AssetLibrary(this.renderer);
    this.textures = {};

    // Primary sun & hemisphere lights
    this.sun = new THREE.DirectionalLight(0xffffff, 3.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(this.lowFx ? 1024 : 2048, this.lowFx ? 1024 : 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 160;
    const d = 32;
    this.sun.shadow.camera.left = -d;
    this.sun.shadow.camera.right = d;
    this.sun.shadow.camera.top = d;
    this.sun.shadow.camera.bottom = -d;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.035;
    this.scene.add(this.sun, this.sun.target);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 0.55);
    this.scene.add(this.hemi);

    // State
    this.activeIndex = 0;
    this.targetIndex = 0;
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.zVelocity = 0;

    // View mode: 'orbit' (Linear Earth-to-Earth Time-Lapse) | 'surface' (Zoomed Into 3D World)
    const viewParam = params.get('view');
    this.viewMode = viewParam === 'surface' ? 'surface' : 'orbit';
    this.diveProgress = this.viewMode === 'surface' ? 1 : 0; // 0 = orbit, 1 = surface
    this.autoDiveOnArrival = false;

    this.isAutoPlaying = false;
    this.autoPlayDwell = 9;
    this._autoTimer = 0;
    this.whatIfMap = new Map();
    this.bloomEnabled = true;
    this.aoEnabled = true;
    this.showTunnelRibbon = true;
    this.lightTheme = false;

    this.corridor = null;
    this.worlds = new Map(); // index -> Promise<WorldContext>
    this.activeWorld = null;
    this.loadingIndex = null;
    this.transition = { active: false, phase: 'idle', t: 0, from: 0, to: 0 };

    // Camera orbit parameters (used in both Orbit Mode around the Globe and Surface Mode)
    this.orbit = { yaw: 0.15, pitch: 0.14, distance: 11.2, targetY: 0, minDistance: 3, maxDistance: 40 };
    this.orbitGoal = { ...this.orbit };
    this.idleTime = 0;
    this.isDragging = false;
    this.pointerDownPos = { x: 0, y: 0 };
    this.dragStart = { x: 0, y: 0 };
    this.wheelAccum = 0;
    this.wheelCooldown = 0;
    this.raycaster = new THREE.Raycaster();

    this.clock = new THREE.Clock();
    this._initPost();
    this._bind();
  }

  /* ------------------------------------------------------------------ post-processing */
  _initPost() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const rt = new THREE.WebGLRenderTarget(w, h, {
      samples: this.lowFx ? 0 : 4,
      type: THREE.HalfFloatType,
    });
    this.composer = new EffectComposer(this.renderer, rt);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    try {
      if (this.lowFx) throw new Error('low-fx mode: GTAO disabled');
      this.gtao = new GTAOPass(this.scene, this.camera, w, h);
      this.gtao.output = GTAOPass.OUTPUT.Default;
      this.gtao.blendIntensity = 0.85;
      this.gtao.updateGtaoMaterial({
        radius: 0.6,
        distanceExponent: 1.2,
        thickness: 1.0,
        scale: 1.0,
        samples: 12,
        distanceFallOff: 1.0,
        screenSpaceRadius: false,
      });
      this.gtao.updatePdMaterial({
        lumaPhi: 10,
        depthPhi: 2,
        normalPhi: 3,
        radius: 4,
        radiusExponent: 1,
        rings: 2,
        samples: 12,
      });
      this.composer.addPass(this.gtao);
    } catch (e) {
      console.warn('GTAO unavailable', e);
      this.gtao = null;
    }
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.32, 0.6, 0.88);
    this.composer.addPass(this.bloomPass);
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  /* ------------------------------------------------------------------ init */
  async init() {
    await this._loadBaseTextures();

    // Build the 30-stop Linear Corridor of Planet Earths in deep space
    this.corridor = new LinearCorridor(this.milestones, this.textures);
    this.scene.add(this.corridor.group);

    const params = new URLSearchParams(window.location.search);
    const stop = params.get('stop');
    if (stop !== null) {
      let idx = Number.parseInt(stop, 10);
      if (Number.isNaN(idx)) idx = this.milestones.findIndex((m) => m.id === stop);
      if (idx >= 0 && idx < this.milestones.length) {
        this.activeIndex = this.targetIndex = idx;
        this.currentProgress = this.targetProgress = idx;
      }
    }

    if (this.viewMode === 'surface') {
      await this._activateWorld(this.activeIndex, true);
      this.corridor.group.visible = false;
    } else {
      this._applyOrbitEnvironment();
      this._setOrbitCameraGoal(true);
      // Pre-warm the active surface world in the background so zooming in is instant!
      this._getWorld(this.activeIndex);
    }

    this._animate();
    if (this.callbacks.onReady) this.callbacks.onReady();
    if (this.callbacks.onMilestoneChange) {
      this.callbacks.onMilestoneChange(this.milestones[this.activeIndex], this.activeIndex);
    }
    if (this.callbacks.onViewModeChange) {
      this.callbacks.onViewModeChange(this.viewMode, this.milestones[this.activeIndex]);
    }
    this._preloadNeighbours();
  }

  async _loadBaseTextures() {
    const load = (url, srgb = true) =>
      this.assets.loadTexture(url, { srgb, repeat: 1 }).then((t) => {
        if (t) {
          t.wrapS = THREE.RepeatWrapping;
          t.wrapT = THREE.ClampToEdgeWrapping;
        }
        return t;
      });
    const [earthDay, earthNight, earthClouds, moon, mars, sun, milky] = await Promise.all([
      load('./assets/textures/earth_day_nasa_5400.jpg'),
      load('./assets/textures/earth_night_nasa_3600.jpg'),
      load('./assets/textures/earth_clouds_nasa_2048.jpg'),
      load('./assets/textures/moon_2k.jpg'),
      load('./assets/textures/mars_2k.jpg'),
      load('./assets/textures/sun_2k.jpg'),
      load('./assets/textures/sky_milkyway_2k.jpg'),
    ]);
    if (milky) milky.mapping = THREE.EquirectangularReflectionMapping;
    this.textures = { earthDay, earthNight, earthClouds, moon, mars, sun, milky };
  }

  /* ------------------------------------------------------------------ Orbit vs Surface Mode */
  _setOrbitCameraGoal(immediate = false) {
    this.orbitGoal = {
      yaw: 0.14,
      pitch: 0.10,
      distance: 8.8,
      targetY: 0,
      minDistance: 4.2,
      maxDistance: 24,
    };
    if (immediate) {
      this.orbit = { ...this.orbitGoal };
    }
  }

  _applyOrbitEnvironment() {
    this.scene.background = new THREE.Color(this.lightTheme ? 0x0f172a : 0x020617);
    this.scene.environment = this.textures.milky || null;
    this.scene.environmentIntensity = 0.75;
    this.scene.fog.color.set(0x020617);
    this.scene.fog.density = 0.0014;
    this.sun.color.set(0xfff7ed);
    this.sun.intensity = 3.2;
    this.hemi.intensity = 0.65;
    this.renderer.toneMappingExposure = 1.1;
  }

  /**
   * Zoom Into the Active Earth (Dive from Space Orbit -> Surface 3D World).
   */
  async zoomIntoWorld(index = this.activeIndex) {
    if (index !== this.activeIndex) {
      this.activeIndex = this.targetIndex = index;
      this.currentProgress = this.targetProgress = index;
      if (this.callbacks.onMilestoneChange) {
        this.callbacks.onMilestoneChange(this.milestones[index], index);
      }
    }

    this.viewMode = 'surface';
    if (this.callbacks.onViewModeChange) {
      this.callbacks.onViewModeChange('surface', this.milestones[this.activeIndex]);
    }

    // Pull camera rapidly toward the globe while loading/activating the 3D surface world
    this.orbitGoal.distance = GLOBE_RADIUS * 1.15;
    await this._activateWorld(this.activeIndex, false);
    if (this.viewMode === 'surface') {
      this.corridor.group.visible = false;
      this.diveProgress = 1;
    }
  }

  /**
   * Zoom Out from Surface 3D World back to the Linear Space Corridor of Earths.
   */
  zoomOutToOrbit() {
    if (this.viewMode === 'orbit') return;
    this.viewMode = 'orbit';
    this.diveProgress = 0;
    if (this.activeWorld) {
      this.scene.remove(this.activeWorld.group);
    }
    if (this.corridor) {
      this.corridor.group.visible = true;
    }
    this._applyOrbitEnvironment();
    this._setOrbitCameraGoal(false);
    if (this.callbacks.onViewModeChange) {
      this.callbacks.onViewModeChange('orbit', this.milestones[this.activeIndex]);
    }
  }

  toggleViewMode() {
    if (this.viewMode === 'orbit') {
      this.zoomIntoWorld(this.activeIndex);
    } else {
      this.zoomOutToOrbit();
    }
  }

  /* ------------------------------------------------------------------ Surface Worlds */
  _getWorld(index) {
    if (!this.worlds.has(index)) {
      const m = this.milestones[index];
      this.worlds.set(index, buildWorld(m, this.assets, this.textures));
      for (const key of Array.from(this.worlds.keys())) {
        if (Math.abs(key - index) > 2 && key !== this.activeIndex) {
          this.worlds.get(key).then((w) => w.dispose && w.dispose());
          this.worlds.delete(key);
        }
      }
    }
    return this.worlds.get(index);
  }

  _preloadNeighbours() {
    const n = this.milestones.length;
    if (this.activeIndex + 1 < n) this._getWorld(this.activeIndex + 1);
    if (this.activeIndex - 1 >= 0) setTimeout(() => this._getWorld(this.activeIndex - 1), 1200);
  }

  async _activateWorld(index, immediate = false) {
    this.loadingIndex = index;
    if (this.callbacks.onWorldLoading) this.callbacks.onWorldLoading(true, this.milestones[index]);
    const world = await this._getWorld(index);
    if (this.loadingIndex !== index) return;
    if (this.activeWorld) this.scene.remove(this.activeWorld.group);
    this.activeWorld = world;
    if (this.viewMode === 'surface') {
      this.scene.add(world.group);
      await this._applyEnvironment(world);
      this.orbitGoal = { ...this.orbitGoal, ...world.camera };
      if (immediate) this.orbit = { ...this.orbitGoal };
    }
    this.loadingIndex = null;
    if (this.callbacks.onWorldLoading) this.callbacks.onWorldLoading(false, this.milestones[index]);
  }

  async _applyEnvironment(world) {
    const e = world.env;
    const scene = this.scene;
    if (e.space) {
      scene.background =
        e.backgroundColor !== null ? new THREE.Color(e.backgroundColor) : new THREE.Color(0x000000);
      scene.environment = this.textures.milky || null;
      scene.environmentIntensity = e.envIntensity;
      if (e.hdri) {
        const tex = await this.assets.loadHDRI(e.hdri);
        if (tex && this.activeWorld === world && this.viewMode === 'surface') {
          scene.environment = tex;
          scene.environmentIntensity = e.envIntensity;
        }
      }
      scene.fog.density = 0;
    } else {
      scene.fog.color.set(e.fogColor);
      scene.fog.density = e.fogDensity;
      scene.background = new THREE.Color(e.backgroundColor !== null ? e.backgroundColor : e.fogColor);
      if (e.hdri) {
        const tex = await this.assets.loadHDRI(e.hdri);
        if (tex && this.activeWorld === world && this.viewMode === 'surface') {
          scene.environment = tex;
          scene.environmentIntensity = e.envIntensity;
          if (e.bgIntensity > 0) {
            scene.background = tex;
            scene.backgroundIntensity = e.bgIntensity;
            scene.backgroundBlurriness = e.bgBlur;
          }
          scene.backgroundRotation.set(0, e.bgRotation, 0);
          scene.environmentRotation.set(0, e.bgRotation, 0);
        }
      } else {
        scene.environment = null;
      }
    }
    const dir = new THREE.Vector3(...e.sunDir).normalize();
    this.sun.position.copy(dir).multiplyScalar(60);
    this.sun.target.position.set(0, 0, 0);
    this.sun.color.set(e.sunColor);
    this.sun.intensity = e.sunIntensity;
    this.hemi.intensity = e.hemi;
    this.renderer.toneMappingExposure = e.exposure * (this.lightTheme ? 1.25 : 1);
  }

  /* ------------------------------------------------------------------ Navigation & Warp API */
  setTargetProgress(val) {
    const maxIdx = this.milestones.length - 1;
    const clamped = Math.max(0, Math.min(maxIdx, val));
    // Scrubbing the timeline returns to the Linear Orbit Corridor so you watch the Earths fly past!
    if (this.viewMode === 'surface' && Math.abs(clamped - this.activeIndex) > 0.25) {
      this.zoomOutToOrbit();
    }
    this.targetProgress = clamped;
    const nearest = Math.round(clamped);
    if (nearest !== this.targetIndex) {
      this._selectMilestone(nearest, false);
    }
  }

  flyToIndex(index, opts = {}) {
    this.setAutoPlay(false);
    const maxIdx = this.milestones.length - 1;
    const i = Math.max(0, Math.min(maxIdx, Math.round(index)));
    if (i === this.targetIndex && Math.abs(this.currentProgress - i) < 0.05) return;

    // When warping to another era, fly through the Linear Earth Corridor at light-speed!
    const wasSurface = this.viewMode === 'surface';
    if (wasSurface && !opts.stayOnSurface) {
      this.zoomOutToOrbit();
    }

    this.targetProgress = i;
    this._selectMilestone(i, true);

    if (opts.autoDive || (wasSurface && this.autoDiveOnArrival)) {
      setTimeout(() => {
        if (this.targetIndex === i) this.zoomIntoWorld(i);
      }, 1150);
    }
  }

  jumpToIndex(index) {
    this.flyToIndex(index);
    this.currentProgress = this.targetProgress;
  }

  _selectMilestone(index, showWarpBanner = true) {
    this.targetIndex = index;
    this.activeIndex = index;
    if (this.callbacks.onMilestoneChange) {
      this.callbacks.onMilestoneChange(this.milestones[index], index);
    }
    this.transition = {
      active: true,
      phase: 'warp',
      t: 0,
      from: this.currentProgress,
      to: index,
    };
    if (showWarpBanner && this.callbacks.onWarp) {
      this.callbacks.onWarp(true, this.milestones[index]);
    }
    if (this.viewMode === 'surface') {
      this._activateWorld(index).then(() => this._preloadNeighbours());
    } else {
      this._setOrbitCameraGoal(false);
      this._getWorld(index).then(() => this._preloadNeighbours());
    }
  }

  zoomCamera(delta) {
    this.idleTime = 0;
    // In Orbit Mode: zooming in closely (< 6.0) automatically dives onto the Earth's 3D Surface!
    if (this.viewMode === 'orbit' && delta < 0 && this.orbitGoal.distance + delta < 6.2) {
      this.zoomIntoWorld(this.activeIndex);
      return;
    }
    // In Surface Mode: zooming out far (> maxDistance - 2) launches back to the Orbit Corridor!
    if (
      this.viewMode === 'surface' &&
      delta > 0 &&
      this.orbitGoal.distance + delta > this.orbitGoal.maxDistance - 1.5
    ) {
      this.zoomOutToOrbit();
      return;
    }
    this.orbitGoal.distance = Math.max(
      this.orbitGoal.minDistance,
      Math.min(this.orbitGoal.maxDistance, this.orbitGoal.distance + delta)
    );
  }

  toggleWhatIf(id) {
    const next = !this.whatIfMap.get(id);
    this.whatIfMap.set(id, next);
    return next;
  }
  isWhatIfActive(id) {
    return Boolean(this.whatIfMap.get(id));
  }

  setAutoPlay(enabled) {
    if (this.isAutoPlaying === enabled) return;
    this.isAutoPlaying = enabled;
    this._autoTimer = 0;
    if (this.callbacks.onAutoPlayChange) this.callbacks.onAutoPlayChange(enabled);
  }
  setTunnelVisible(v) {
    this.showTunnelRibbon = v;
  }
  setBloomEnabled(v) {
    this.bloomEnabled = v;
  }
  setAOEnabled(v) {
    this.aoEnabled = v;
  }
  setLightTheme(isLight) {
    this.lightTheme = isLight;
    if (this.viewMode === 'surface' && this.activeWorld) {
      this.renderer.toneMappingExposure = this.activeWorld.env.exposure * (isLight ? 1.25 : 1);
    } else {
      this._applyOrbitEnvironment();
    }
  }

  /**
   * Projects 3D markers to 2D screen coordinates:
   * - In 'orbit' mode: projects the Active Earth's Surface Portal Pin ("🔍 Zoom Into...") + Next Earth preview!
   * - In 'surface' mode: projects the 3D scene's Points of Interest (POIs).
   */
  getProjectedMarkers() {
    const out = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const v = new THREE.Vector3();

    if (this.viewMode === 'orbit' && this.corridor) {
      const node = this.corridor.nodes[this.activeIndex];
      if (node && node.beacon) {
        node.beacon.getWorldPosition(v);
        const dist = v.distanceTo(this.camera.position);
        v.project(this.camera);
        if (v.z <= 1 && Math.abs(v.x) <= 1.05 && Math.abs(v.y) <= 1.05) {
          out.push({
            index: 0,
            milestone: { icon: '🔍', title: node.portalLabel },
            x: (v.x * 0.5 + 0.5) * w,
            y: (-v.y * 0.5 + 0.5) * h,
            isActive: true,
            distance: dist,
            action: 'dive',
            targetStop: this.activeIndex,
          });
        }
      }

      // Also project the Next Earth in the Linear Time Corridor so the user sees the linear path ahead!
      const nextNode = this.corridor.nodes[this.activeIndex + 1];
      if (nextNode && nextNode.globe) {
        nextNode.globe.getWorldPosition(v);
        v.y += GLOBE_RADIUS * 1.35;
        const dist = v.distanceTo(this.camera.position);
        v.project(this.camera);
        if (v.z <= 1 && Math.abs(v.x) <= 1.05 && Math.abs(v.y) <= 1.05) {
          out.push({
            index: 1,
            milestone: {
              icon: '⚡',
              title: `Next Earth (${nextNode.milestone.eraBadge}): ${nextNode.milestone.title.split(':')[0]}`,
            },
            x: (v.x * 0.5 + 0.5) * w,
            y: (-v.y * 0.5 + 0.5) * h,
            isActive: false,
            distance: dist,
            action: 'warp',
            targetStop: this.activeIndex + 1,
          });
        }
      }
      return out;
    }

    if (!this.activeWorld) return out;
    this.activeWorld.pois.forEach((poi, i) => {
      if (poi.ref && poi.ref.isObject3D) {
        poi.ref.getWorldPosition(v);
        v.y += poi.yOffset || 0;
      } else if (poi.ref && poi.ref.isVector3) {
        v.copy(poi.ref);
      } else return;
      const dist = v.distanceTo(this.camera.position);
      v.project(this.camera);
      if (v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1) return;
      out.push({
        index: i,
        milestone: { icon: '◉', title: poi.name },
        x: (v.x * 0.5 + 0.5) * w,
        y: (-v.y * 0.5 + 0.5) * h,
        isActive: false,
        distance: dist,
        poi: true,
      });
    });
    return out;
  }

  /* ------------------------------------------------------------------ Input */
  _bind() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.composer.setSize(w, h);
      if (this.gtao) this.gtao.setSize(w, h);
      this.bloomPass.resolution.set(w, h);
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.pointerDownPos.x = e.clientX;
      this.pointerDownPos.y = e.clientY;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.canvas.setPointerCapture(e.pointerId);
      this.idleTime = 0;
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.orbitGoal.yaw -= dx * 0.006;
      this.orbitGoal.pitch = Math.max(-0.25, Math.min(1.2, this.orbitGoal.pitch + dy * 0.005));
      this.idleTime = 0;
    });

    const end = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      // Check if it was a clean click on the 3D Planet Earth in Orbit Mode -> Zoom Into World!
      const moveDist = Math.hypot(
        (e.clientX || 0) - this.pointerDownPos.x,
        (e.clientY || 0) - this.pointerDownPos.y
      );
      if (moveDist < 6) {
        const rect = this.canvas.getBoundingClientRect();
        const ndc = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        this.raycaster.setFromCamera(ndc, this.camera);
        if (this.viewMode === 'orbit' && this.corridor) {
          const activeNode = this.corridor.nodes[this.activeIndex];
          if (activeNode && activeNode.globe) {
            const hits = this.raycaster.intersectObject(activeNode.globe, true);
            if (hits.length > 0) {
              this.zoomIntoWorld(this.activeIndex);
            }
          }
        } else if (this.viewMode === 'surface' && this.activeWorld && this.activeWorld.group) {
          const hits = this.raycaster.intersectObject(this.activeWorld.group, true);
          for (const h of hits) {
            let cur = h.object;
            while (cur && cur !== this.activeWorld.group) {
              if (cur.userData && typeof cur.userData.triggerInteract === 'function') {
                cur.userData.triggerInteract();
                const wp = new THREE.Vector3();
                cur.getWorldPosition(wp);
                if (wp.lengthSq() > 0.25) {
                  this.orbitGoal.yaw = Math.atan2(wp.x, wp.z);
                }
                this.orbitGoal.distance = Math.max(5.2, this.orbitGoal.distance * 0.85);
                return;
              }
              cur = cur.parent;
            }
          }
        }
      }
    };
    this.canvas.addEventListener('pointerup', end);
    this.canvas.addEventListener('pointercancel', end);

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
        if (e.ctrlKey || e.metaKey) {
          this.zoomCamera(Math.sign(e.deltaY) * 0.9);
          return;
        }
        this.setAutoPlay(false);
        this.wheelAccum += e.deltaY;
        if (this.wheelCooldown <= 0 && Math.abs(this.wheelAccum) > 95) {
          const step = Math.sign(this.wheelAccum);
          this.flyToIndex(this.targetIndex + step);
          this.wheelAccum = 0;
          this.wheelCooldown = 0.42;
        }
      },
      { passive: false }
    );
  }

  /* ------------------------------------------------------------------ Frame Loop */
  _animate() {
    requestAnimationFrame(() => this._animate());
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.getElapsedTime();
    this.idleTime += dt;
    this.wheelCooldown -= dt;
    if (Math.abs(this.wheelAccum) > 0) this.wheelAccum *= Math.max(0, 1 - dt * 3);

    // Autoplay Tour: warps from Earth to Earth, pauses to inspect or dive
    if (this.isAutoPlaying) {
      this._autoTimer += dt;
      if (this._autoTimer > this.autoPlayDwell) {
        this._autoTimer = 0;
        if (this.targetIndex >= this.milestones.length - 1) this.setAutoPlay(false);
        else {
          this.flyToIndex(this.targetIndex + 1);
        }
      }
    }

    // Smooth linear progress along the 30-stop corridor
    const prevProgress = this.currentProgress;
    const progressDiff = this.targetProgress - this.currentProgress;
    this.currentProgress += progressDiff * Math.min(1, dt * 4.8);
    this.zVelocity = ((this.currentProgress - prevProgress) * CORRIDOR_SPACING) / Math.max(0.001, dt);

    // Warp banner lifecycle
    if (this.transition.active) {
      this.transition.t += dt;
      if (Math.abs(progressDiff) < 0.04 && this.loadingIndex === null && this.transition.t > 0.35) {
        this.transition.active = false;
        if (this.callbacks.onWarp) this.callbacks.onWarp(false, this.milestones[this.activeIndex]);
      }
    }

    // Cinematic idle orbit drift
    const drift = this.idleTime > 4 ? Math.min(1, (this.idleTime - 4) / 4) : 0;
    this.orbitGoal.yaw += dt * 0.05 * drift;

    // Damp camera orbit parameters
    const k = Math.min(1, dt * 5.0);
    this.orbit.yaw += (this.orbitGoal.yaw - this.orbit.yaw) * k;
    this.orbit.pitch += (this.orbitGoal.pitch - this.orbit.pitch) * k;
    this.orbit.distance += (this.orbitGoal.distance - this.orbit.distance) * k;
    this.orbit.targetY += (this.orbitGoal.targetY - this.orbit.targetY) * k;

    const o = this.orbit;
    const breathe = Math.sin(t * 0.6) * 0.03;

    if (this.viewMode === 'orbit') {
      // Camera travels along the Linear Corridor of Earths!
      const focusPos = this.corridor
        ? this.corridor.getStopPosition(this.currentProgress)
        : new THREE.Vector3(0, 0, -this.currentProgress * CORRIDOR_SPACING);
      const cx = focusPos.x + Math.sin(o.yaw) * Math.cos(o.pitch) * o.distance;
      const cz = focusPos.z + Math.cos(o.yaw) * Math.cos(o.pitch) * o.distance;
      const cy = focusPos.y + o.targetY + Math.sin(o.pitch) * o.distance + breathe;

      this.camera.position.set(cx, cy, cz);
      // Frame the active Earth on the left-center while looking down the linear corridor of upcoming Earths
      this.camera.lookAt(focusPos.x + 1.85, focusPos.y + o.targetY + 0.16, focusPos.z - 2.2);

      // Keep sun illuminating the currently focused Earth in the corridor
      this.sun.position.set(focusPos.x + 35, focusPos.y + 28, focusPos.z + 45);
      this.sun.target.position.copy(focusPos);
      this.sun.target.updateMatrixWorld();

      if (this.corridor) {
        this.corridor.update(t, dt, this.currentProgress, this.zVelocity);
      }
    } else {
      // Surface 3D World Mode (Zoomed Into the Earth)
      const cx = Math.sin(o.yaw) * Math.cos(o.pitch) * o.distance;
      const cz = Math.cos(o.yaw) * Math.cos(o.pitch) * o.distance;
      let cy = o.targetY + Math.sin(o.pitch) * o.distance + breathe;
      if (this.activeWorld && this.activeWorld.terrain) {
        const ground = this.activeWorld.terrain.heightAt(cx, cz);
        cy = Math.max(cy, ground + 0.7);
      }
      this.camera.position.set(cx, cy, cz);
      this.camera.lookAt(0, o.targetY, 0);

      if (this.activeWorld) {
        this.activeWorld.update(t, dt, this.isWhatIfActive(this.activeWorld.m.id), this.camera);
        const e = this.activeWorld.env;
        const dir = new THREE.Vector3(...e.sunDir).normalize();
        this.sun.position.copy(dir).multiplyScalar(60);
      }
    }

    if (this.callbacks.onFrame) this.callbacks.onFrame(this.currentProgress);

    if (this.gtao) {
      this.gtao.enabled = this.aoEnabled && !this.lightTheme && this.viewMode === 'surface';
    }
    this.bloomPass.enabled = this.bloomEnabled;
    this.composer.render();

    // Readiness flag for automated visual verification (tools/shoot_cdp.mjs)
    const isReady =
      this.viewMode === 'orbit'
        ? Boolean(this.corridor && Math.abs(progressDiff) < 0.02)
        : Boolean(this.activeWorld && this.loadingIndex === null);

    if (isReady) {
      this._readyFrames = (this._readyFrames || 0) + 1;
      if (this._readyFrames >= 4) window.__chronoReady = true;
    } else {
      this._readyFrames = 0;
      window.__chronoReady = false;
    }
  }
}
