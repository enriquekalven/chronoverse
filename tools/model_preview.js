
    import * as THREE from '../vendor/three/build/three.module.js';
    import { GLTFLoader } from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
    import { HDRLoader } from '../vendor/three/examples/jsm/loaders/HDRLoader.js';

    const params = new URLSearchParams(location.search);
    const models = (params.get('models') || '').split(',').filter(Boolean);
    const cols = parseInt(params.get('cols') || '3', 10);
    const cellH = parseInt(params.get('h') || '300', 10);
    const yawDeg = parseFloat(params.get('yaw') || '35');
    document.getElementById('grid').style.setProperty('--cols', cols);
    const env = await new HDRLoader().loadAsync('../assets/polyhaven/hdri/kloofendal_overcast_2k.hdr').catch(() => null);
    if (env) env.mapping = THREE.EquirectangularReflectionMapping;
    const loader = new GLTFLoader();
    const sharedCanvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({ canvas: sharedCanvas, antialias: true, preserveDrawingBuffer: true });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    let done = 0;
    for (const url of models) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.height = cellH + 'px';
      const canvas = document.createElement('canvas');
      const lbl = document.createElement('div');
      lbl.className = 'lbl';
      lbl.textContent = url.replace(/^\.\.\/assets\/models\//, '');
      cell.append(canvas, lbl);
      document.getElementById('grid').appendChild(cell);
      const w = cell.clientWidth || 300, h = cell.clientHeight || cellH;
      canvas.width = w; canvas.height = h;
      renderer.setSize(w, h, false);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x283038);
      if (env) scene.environment = env;
      const cam = new THREE.PerspectiveCamera(38, w / h, 0.01, 1e6);
      const sun = new THREE.DirectionalLight(0xffffff, 2.6);
      sun.position.set(1.5, 2.5, 1.5);
      scene.add(sun, new THREE.HemisphereLight(0xffffff, 0x444444, 0.7));
      try {
        const gltf = await loader.loadAsync(url);
        const obj = gltf.scene;
        scene.add(obj);
        if (gltf.animations && gltf.animations.length) {
          const mixer = new THREE.AnimationMixer(obj);
          mixer.clipAction(gltf.animations[0]).play();
          mixer.update(0.5);
        }
        obj.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3(); box.getSize(size);
        const center = new THREE.Vector3(); box.getCenter(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const dist = maxDim * 1.45;
        const yaw = yawDeg * Math.PI / 180;
        cam.position.set(center.x + Math.sin(yaw) * dist, center.y + dist * 0.38, center.z + Math.cos(yaw) * dist);
        cam.near = dist / 100; cam.far = dist * 100; cam.updateProjectionMatrix();
        cam.lookAt(center);
        lbl.textContent += ` (${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)} anims:${(gltf.animations||[]).length})`;
        const grid = new THREE.GridHelper(maxDim * 2, 10, 0x666666, 0x444444);
        grid.position.set(center.x, box.min.y, center.z);
        scene.add(grid);
      } catch (e) {
        lbl.textContent += ' FAILED ' + (e && e.message);
      }
      renderer.render(scene, cam);
      canvas.getContext('2d').drawImage(sharedCanvas, 0, 0);
      done++;
    }
    window.__chronoReady = done === models.length;

  