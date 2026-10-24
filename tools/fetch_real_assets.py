#!/usr/bin/env python3
"""
ChronoVerse 3D — Real 3D asset acquisition.
Downloads genuinely scanned / PBR 3D assets (CC0 / CC-BY) + matching three.js r186 helpers.
Idempotent: skips files that already exist and validate.
"""
import json, os, sys, time, re, urllib.request, urllib.error, concurrent.futures as cf

ROOT = '/Users/enriq/.gemini/jetski/scratch/timeline-of-everything-3d'
THREE_TAG = 'r186'
UA = 'Mozilla/5.0 (ChronoVerse3D asset fetch; educational, CC0/CC-BY assets)'

def fetch(url, dest, min_size=64, magic=None, retries=3):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(dest) and os.path.getsize(dest) >= min_size:
        return ('skip', dest, os.path.getsize(dest))
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            if len(data) < min_size:
                raise ValueError(f'too small ({len(data)} bytes)')
            if magic and not data.startswith(magic):
                raise ValueError(f'bad magic {data[:8]!r}')
            with open(dest, 'wb') as f:
                f.write(data)
            return ('ok', dest, len(data))
        except Exception as e:
            last = e
            time.sleep(1.5 * (attempt + 1))
    return ('fail', dest, str(last))

def jget(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:
            time.sleep(1.5 * (attempt + 1))
    return None

jobs = []  # (url, dest, min_size, magic)

# ---------------------------------------------------------------- three.js r186 helpers
three_raw = f'https://raw.githubusercontent.com/mrdoob/three.js/{THREE_TAG}/examples'
for rel in [
    'jsm/loaders/RGBELoader.js',
    'jsm/objects/Water.js',
    'jsm/objects/Sky.js',
    'jsm/objects/Lensflare.js',
    'jsm/postprocessing/GTAOPass.js',
    'jsm/shaders/GTAOShader.js',
    'jsm/shaders/PoissonDenoiseShader.js',
    'jsm/math/SimplexNoise.js',
    'jsm/postprocessing/BokehPass.js',
    'jsm/shaders/BokehShader.js',
    'jsm/shaders/FXAAShader.js',
    'jsm/postprocessing/SMAAPass.js',
    'jsm/shaders/SMAAShader.js',
]:
    jobs.append((f'{three_raw}/{rel}', f'{ROOT}/vendor/three/examples/{rel}', 200, None))
for rel in [
    'textures/waternormals.jpg',
    'textures/lava/lavatile.jpg',
    'textures/lava/cloud.png',
    'textures/lensflare/lensflare0.png',
    'textures/lensflare/lensflare3.png',
]:
    jobs.append((f'{three_raw}/{rel}', f'{ROOT}/assets/textures/three/{os.path.basename(rel)}', 1000, None))
for rel, name in [
    ('models/gltf/Xbot.glb', 'xbot_robot.glb'),
    ('models/gltf/Soldier.glb', 'soldier_rigged.glb'),
    ('models/gltf/facecap.glb', 'facecap_living_face.glb'),
    ('models/gltf/LeePerrySmith/LeePerrySmith.glb', 'lee_perry_smith_head.glb'),
    ('models/gltf/PrimaryIonDrive.glb', 'primary_ion_drive.glb'),
    ('models/gltf/Michelle.glb', 'michelle_rigged.glb'),
]:
    jobs.append((f'{three_raw}/{rel}', f'{ROOT}/assets/models/pbr/{name}', 10000, b'glTF'))
for rel in ['Map-COL.jpg', 'Map-SPEC.jpg', 'Infinite-Level_02_Disp_NoSmoothUV-4096.jpg', 'Infinite-Level_02_Tangent_SmoothUV.jpg']:
    jobs.append((f'{three_raw}/models/gltf/LeePerrySmith/{rel}', f'{ROOT}/assets/models/pbr/LeePerrySmith/{rel}', 1000, None))

# ---------------------------------------------------------------- Khronos glTF Sample Assets (CC0 / CC-BY)
kh = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models'
for name, out in [
    ('BarramundiFish', 'barramundi_fish.glb'),
    ('MosquitoInAmber', 'mosquito_in_amber.glb'),
    ('AntiqueCamera', 'antique_camera.glb'),
    ('IridescenceAbalone', 'abalone_shell.glb'),
    ('Lantern', 'lantern.glb'),
    ('PotOfCoals', 'pot_of_coals.glb'),
    ('DiffuseTransmissionPlant', 'plant_leaves.glb'),
    ('BrainStem', 'brainstem_robot.glb'),
    ('Avocado', 'avocado.glb'),
    ('ABeautifulGame', 'chess_set.glb'),
    ('SciFiHelmet', 'scifi_helmet.glb'),
    ('DamagedHelmet', 'damaged_helmet.glb'),
    ('ToyCar', 'toy_car.glb'),
    ('WaterBottle', 'water_bottle.glb'),
]:
    jobs.append((f'{kh}/{name}/glTF-Binary/{name}.glb', f'{ROOT}/assets/models/pbr/{out}', 10000, b'glTF'))

# ---------------------------------------------------------------- model-viewer shared assets (Astronaut CC-BY, Neil Armstrong suit CC0 Smithsonian)
for name, out in [('Astronaut', 'astronaut.glb'), ('NeilArmstrong', 'neil_armstrong_spacesuit_smithsonian.glb'), ('Horse', 'horse_animated.glb')]:
    jobs.append((f'https://modelviewer.dev/shared-assets/models/{name}.glb', f'{ROOT}/assets/models/pbr/{out}', 10000, b'glTF'))

# ---------------------------------------------------------------- Babylon.js assets (shark, CC-BY)
jobs.append(('https://assets.babylonjs.com/meshes/shark.glb', f'{ROOT}/assets/models/pbr/shark_animated.glb', 10000, b'glTF'))

# ---------------------------------------------------------------- Smithsonian CC0 fossil scans (direct resource URLs)
for url, out in [
    ('https://3d-api.si.edu/content/document/3d_package:68adcbc1-84bc-4e3c-9f85-a08c81a5a820/resources/Stegosaurus_stenops_Marsh__1887-150k-4096_std.glb', 'stegosaurus_stenops_usnm.glb'),
    ('https://3d-api.si.edu/content/document/3d_package:5ea6957a-316c-44e6-953d-13a5e339c92c/resources/Allosaurus_fragilis_Marsh__1877-150k-4096_std.glb', 'allosaurus_fragilis_usnm.glb'),
    ('https://3d-api.si.edu/content/document/3d_package:1a090f67-0f38-438b-b0ac-da2f5ab434ba/resources/Allosaurus_fragilis_Marsh__1877-150k-4096_std.glb', 'allosaurus_fragilis_usnm_b.glb'),
    ('https://3d-api.si.edu/content/document/3d_package:49a64b98-2d21-4d9b-a1e0-b0360fcb9e2d/resources/Stegosaurus_stenops_Marsh__1887-150k-4096_std.glb', 'stegosaurus_stenops_usnm_b.glb'),
]:
    jobs.append((url, f'{ROOT}/assets/models/smithsonian/{out}', 100000, b'glTF'))

# ---------------------------------------------------------------- Poly Haven (CC0): models / HDRIs / textures via files API
PH_MODELS = [
    # trees & plants
    'pine_tree_01', 'fir_tree_01', 'island_tree_01', 'island_tree_02', 'tree_small_02', 'jacaranda_tree',
    'quiver_tree_01', 'dead_tree_trunk', 'tree_stump_01', 'fern_02', 'grass_medium_01', 'shrub_02', 'moss_01',
    'pine_roots', 'dry_branches_medium_01', 'wild_rooibos_bush', 'searsia_burchellii', 'fir_sapling_medium',
    # rocks
    'boulder_01', 'rock_moss_set_01', 'namaqualand_boulder_02', 'namaqualand_boulder_05', 'coast_rocks_02',
    'coast_rocks_05', 'rock_face_01', 'namaqualand_cliff_01', 'coastal_cliff_01', 'moon_rock_01', 'moon_rock_03',
    'moon_rock_05', 'stone_01', 'mountainside',
    # ancient / medieval / props
    'marble_bust_01', 'horse_statue_01', 'gothic_statue', 'lion_head', 'bull_head', 'kite_shield',
    'ornate_medieval_mace', 'antique_estoc', 'ornate_war_hammer', 'ship_pinnace', 'dutch_ship_medium',
    'wooden_barrels_01', 'wine_barrel_01', 'wooden_bucket_01', 'wooden_lantern_01', 'Lantern_01', 'vintage_oil_lamp',
    'ceramic_vase_01', 'antique_ceramic_vase_01', 'brass_pot_01', 'jug_01', 'wicker_basket_01', 'wooden_bowl_01',
    'wooden_axe', 'stone_fire_pit', 'modular_fort_01', 'wooden_crate_01', 'seadogs_compass', 'wooden_candlestick',
    'carved_wooden_elephant', 'spinning_wheel_01',
    # industrial / modern
    'vintage_microscope', 'vintage_radio_transceiver', 'television_02', 'classic_laptop',
    'vintage_spacecraft_instrument', 'vintage_video_camera', 'street_lamp_01', 'sledgehammer_01',
]
PH_HDRIS = [
    'rainforest_trail', 'mossy_forest', 'forest_grove', 'misty_pines', 'sunset_forest', 'forest_cave', 'hikers_cave',
    'snowy_forest_path_01', 'snow_field', 'frozen_lake', 'winter_evening', 'safari_sunset', 'grasslands_sunset',
    'kloofendal_overcast', 'dry_cracked_lake', 'syferfontein_1d_clear', 'kiara_1_dawn', 'roofless_ruins',
    'st_peters_square_night', 'teutonic_castle_moat', 'monkstown_castle', 'industrial_sunset',
    'industrial_workshop_foundry', 'dresden_station_night', 'modern_buildings_night', 'rooftop_night', 'moon_lab',
    'satara_night_no_lamps', 'moonless_golf', 'rogland_clear_night', 'ushaka_sea_world_aquarium', 'approaching_storm',
    'sunset_in_the_chalk_quarry', 'qwantani_dusk_2_puresky', 'drackenstein_quarry', 'farm_field', 'wildflower_field',
    'table_mountain_1', 'kloppenheim_06_puresky', 'blue_lagoon_night',
]
PH_TEXTURES = [
    'forest_floor', 'forest_leaves_02', 'snow_02', 'sand_01', 'rocky_terrain_02', 'rock_face', 'aerial_rocks_02',
    'large_sandstone_blocks', 'marble_01', 'patterned_cobblestone', 'medieval_blocks_02', 'red_brick', 'metal_plate',
    'rusty_metal_02', 'mud_cracked_dry_03', 'leafy_grass', 'sparse_grass', 'red_sand', 'gravel_floor',
    'coast_sand_rocks_02', 'brown_mud_leaves_01', 'snow_field_aerial', 'lichen_rock', 'mossy_rock',
    'dry_ground_rocks', 'rock_boulder_dry', 'grass_ground', 'farm_soil', 'rocks_ground_01', 'medieval_wall_01',
    'sandstone_cracks', 'mossy_cobblestone', 'volcanic_rock_tiles', 'coral_fort_wall_01', 'worn_asphalt',
]

def plan_polyhaven():
    out = []
    def plan_model(mid):
        d = jget(f'https://api.polyhaven.com/files/{mid}')
        if not d or 'gltf' not in d:
            return [('fail', mid, 'no gltf')]
        res = '1k' if '1k' in d['gltf'] else sorted(d['gltf'].keys())[0]
        g = d['gltf'][res]['gltf']
        base = f'{ROOT}/assets/polyhaven/models/{mid}'
        js = [(g['url'], f'{base}/{os.path.basename(g["url"])}', 200, None)]
        for rel, inc in g.get('include', {}).items():
            js.append((inc['url'], f'{base}/{rel}', 100, None))
        return js
    def plan_hdri(hid):
        d = jget(f'https://api.polyhaven.com/files/{hid}')
        if not d or 'hdri' not in d:
            return [('fail', hid, 'no hdri')]
        res = '2k' if '2k' in d['hdri'] else '1k'
        h = d['hdri'][res]['hdr']
        return [(h['url'], f'{ROOT}/assets/polyhaven/hdri/{hid}_{res}.hdr', 10000, b'#?')]
    def plan_tex(tid):
        d = jget(f'https://api.polyhaven.com/files/{tid}')
        if not d:
            return [('fail', tid, 'no files')]
        js = []
        for key, suffix in [('Diffuse', 'diff'), ('nor_gl', 'nor_gl'), ('arm', 'arm'), ('Displacement', 'disp'), ('Rough', 'rough'), ('AO', 'ao')]:
            if key in d and '1k' in d[key]:
                fmt = 'jpg' if 'jpg' in d[key]['1k'] else sorted(d[key]['1k'].keys())[0]
                u = d[key]['1k'][fmt]['url']
                js.append((u, f'{ROOT}/assets/polyhaven/textures/{tid}/{tid}_{suffix}_1k.{fmt}', 1000, None))
        return js
    with cf.ThreadPoolExecutor(8) as ex:
        futs = [ex.submit(plan_model, m) for m in PH_MODELS] + [ex.submit(plan_hdri, h) for h in PH_HDRIS] + [ex.submit(plan_tex, t) for t in PH_TEXTURES]
        for f in futs:
            out.extend(f.result())
    return out

if __name__ == '__main__':
    print('Planning Poly Haven downloads...')
    ph = plan_polyhaven()
    fails = [p for p in ph if p[0] == 'fail']
    for f in fails:
        print('PLAN-FAIL', f)
    jobs.extend([p for p in ph if p[0] != 'fail'])
    print(f'Total files to fetch: {len(jobs)}')
    results = {'ok': 0, 'skip': 0, 'fail': 0}
    total_bytes = 0
    with cf.ThreadPoolExecutor(10) as ex:
        futs = {ex.submit(fetch, u, d, ms, mg): (u, d) for (u, d, ms, mg) in jobs}
        for i, f in enumerate(cf.as_completed(futs)):
            status, dest, info = f.result()
            results[status] += 1
            if status == 'fail':
                print('FAIL', futs[f][0], '->', info)
            else:
                total_bytes += info
            if (i + 1) % 40 == 0:
                print(f'  ...{i+1}/{len(jobs)} done')
    print('RESULTS', results, f'{total_bytes/1e6:.1f} MB')
    # Fix bare 'three' imports in jsm helpers so they work under strict CSP without an import map
    jsm_root = f'{ROOT}/vendor/three/examples/jsm'
    for dirpath, _, files in os.walk(jsm_root):
        for fn in files:
            if not fn.endswith('.js'):
                continue
            p = os.path.join(dirpath, fn)
            src = open(p, encoding='utf-8').read()
            depth = os.path.relpath(dirpath, jsm_root).count(os.sep) + 1
            rel = "../" * (depth + 2) + "build/three.module.js"
            new = re.sub(r"from\s+['\"]three['\"]", f"from '{rel}'", src)
            if new != src:
                open(p, 'w', encoding='utf-8').write(new)
                print('patched import ->', os.path.relpath(p, ROOT))
    print('DONE')
