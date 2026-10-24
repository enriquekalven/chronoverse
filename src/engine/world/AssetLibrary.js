import * as THREE from '../../../vendor/three/build/three.module.js';
import { GLTFLoader } from '../../../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { HDRLoader } from '../../../vendor/three/examples/jsm/loaders/HDRLoader.js';
import * as SkeletonUtils from '../../../vendor/three/examples/jsm/utils/SkeletonUtils.js';

/**
 * AssetLibrary — cached loader for REAL scanned / PBR assets.
 *  - Poly Haven CC0 photogrammetry models (.gltf + textures)
 *  - Khronos / three.js / model-viewer PBR .glb models
 *  - Smithsonian CC0 fossil scans (.glb)
 *  - Poly Haven HDRIs (.hdr) for image-based lighting
 *  - Poly Haven PBR texture sets (diffuse / normal / ARM / displacement)
 * Every loader is failure-tolerant: a missing file resolves to null so a world
 * never crashes because one optional prop is absent.
 */
export class AssetLibrary {
  constructor(renderer) {
    this.renderer = renderer;
    this.gltfLoader = new GLTFLoader();
    this.rgbeLoader = new HDRLoader();
    this.texLoader = new THREE.TextureLoader();
    this.gltfCache = new Map();
    this.hdriCache = new Map();
    this.texCache = new Map();
    this.setCache = new Map();
    this.maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  }

  // ---------------------------------------------------------------- paths
  /** Scans that were decimated to real-time budgets (see tools/decimate_scans.sh). */
  static LOD_MODELS = new Set([
    'jacaranda_tree', 'tree_small_02', 'island_tree_01', 'island_tree_02', 'fir_sapling_medium', 'coast_rocks_02',
    'coast_rocks_05', 'searsia_burchellii', 'coastal_cliff_01', 'wooden_candlestick', 'ship_pinnace', 'pine_roots',
    'mountainside', 'quiver_tree_01',
  ]);
  static polyhavenModel(id) {
    if (AssetLibrary.LOD_MODELS.has(id)) return `./assets/polyhaven/models/${id}/${id}_lod.glb`;
    return `./assets/polyhaven/models/${id}/${id}_1k.gltf`;
  }
  static polyhavenHDRI(id, res = '2k') {
    return `./assets/polyhaven/hdri/${id}_${res}.hdr`;
  }
  static pbrModel(file) {
    return `./assets/models/pbr/${file}`;
  }
  static smithsonian(file) {
    return `./assets/models/smithsonian/${file}`;
  }
  static prehistoric(file) {
    return `./assets/models/prehistoric/${file}`;
  }
  static dinoModel(file) {
    return `./assets/models/dinos/${file}`;
  }
  static spaceModel(file) {
    return `./assets/models/space/${file}`;
  }
  static anatomy(file) {
    return `./assets/models/${file}`;
  }

  // ---------------------------------------------------------------- glTF
  async loadGLTF(url) {
    if (!this.gltfCache.has(url)) {
      const p = this.gltfLoader
        .loadAsync(url)
        .then((gltf) => {
          gltf.scene.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
              const mats = Array.isArray(o.material) ? o.material : [o.material];
              mats.forEach((m) => {
                if (m && m.map) m.map.anisotropy = this.maxAniso;
                if (m && m.normalMap) m.normalMap.anisotropy = this.maxAniso;
              });
            }
          });
          return gltf;
        })
        .catch((err) => {
          console.warn('[AssetLibrary] missing model', url, err && err.message);
          return null;
        });
      this.gltfCache.set(url, p);
    }
    return this.gltfCache.get(url);
  }

  /** Returns a fresh clone of a loaded model scene (skeleton-safe) or null. */
  async instantiate(url) {
    const gltf = await this.loadGLTF(url);
    if (!gltf) return null;
    const hasSkin = (() => {
      let s = false;
      gltf.scene.traverse((o) => {
        if (o.isSkinnedMesh) s = true;
      });
      return s;
    })();
    const obj = hasSkin ? SkeletonUtils.clone(gltf.scene) : gltf.scene.clone(true);
    obj.userData.animations = gltf.animations || [];
    return obj;
  }

  // ---------------------------------------------------------------- HDRI
  async loadHDRI(id, res = '2k') {
    const actualRes = '2k';
    const key = `${id}_${actualRes}`;
    if (!this.hdriCache.has(key)) {
      const p = this.rgbeLoader
        .loadAsync(AssetLibrary.polyhavenHDRI(id, actualRes))
        .then((tex) => {
          tex.mapping = THREE.EquirectangularReflectionMapping;
          return tex;
        })
        .catch(() => {
          console.warn('[AssetLibrary] missing HDRI', id);
          return null;
        });
      this.hdriCache.set(key, p);
    }
    return this.hdriCache.get(key);
  }

  // ---------------------------------------------------------------- textures
  async loadTexture(url, { srgb = false, repeat = 1, anisotropy = true } = {}) {
    const key = `${url}|${srgb}|${repeat}`;
    if (!this.texCache.has(key)) {
      const p = this.texLoader
        .loadAsync(url)
        .then((tex) => {
          tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(repeat, repeat);
          if (anisotropy) tex.anisotropy = this.maxAniso;
          return tex;
        })
        .catch(() => null);
      this.texCache.set(key, p);
    }
    return this.texCache.get(key);
  }

  /**
   * Poly Haven PBR set → { map, normalMap, armMap, displacementMap }.
   * ARM = Ambient-occlusion (R) / Roughness (G) / Metalness (B), the glTF packing three.js reads natively.
   */
  async loadPBRSet(id, repeat = 8) {
    const key = `${id}|${repeat}`;
    if (!this.setCache.has(key)) {
      const base = `./assets/polyhaven/textures/${id}/${id}`;
      const p = Promise.all([
        this.loadTexture(`${base}_diff_1k.jpg`, { srgb: true, repeat }),
        this.loadTexture(`${base}_nor_gl_1k.jpg`, { repeat }),
        this.loadTexture(`${base}_arm_1k.jpg`, { repeat }),
        this.loadTexture(`${base}_disp_1k.jpg`, { repeat }),
      ]).then(([map, normalMap, armMap, displacementMap]) => ({ map, normalMap, armMap, displacementMap }));
      this.setCache.set(key, p);
    }
    return this.setCache.get(key);
  }

  /** Builds a MeshStandardMaterial from a Poly Haven set with sane fallbacks. */
  async makePBRMaterial(id, { repeat = 8, displacementScale = 0.35, color = 0xffffff, roughness = 1, normalScale = 1, envMapIntensity = 1 } = {}) {
    const set = await this.loadPBRSet(id, repeat);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      map: set.map || null,
      normalMap: set.normalMap || null,
      normalScale: new THREE.Vector2(normalScale, normalScale),
      aoMap: set.armMap || null,
      roughnessMap: set.armMap || null,
      metalnessMap: set.armMap || null,
      displacementMap: set.displacementMap || null,
      displacementScale: set.displacementMap ? displacementScale : 0,
      displacementBias: set.displacementMap ? -displacementScale * 0.5 : 0,
      envMapIntensity,
    });
    if (set.armMap) mat.metalness = 1; // metalness channel of ARM is authoritative
    mat.userData.pbrSet = id;
    return mat;
  }
}

/** Ensures a geometry has `uv1` (needed by aoMap). */
export function ensureUV1(geometry) {
  if (geometry.attributes.uv && !geometry.attributes.uv1) {
    geometry.setAttribute('uv1', geometry.attributes.uv);
  }
  return geometry;
}
