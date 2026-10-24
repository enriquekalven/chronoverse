# Asset Credits & Licences — ChronoVerse 3D

Every 3D object in the experience is either a **real scan / published PBR model** from the sources below, or
**procedural geometry built at true scale** and shaded with real scanned PBR materials. No stock "toy" primitives are used
for creatures. Please keep this file with any redistribution.

## Fossil & museum scans
| Asset | Source | Licence |
|---|---|---|
| *Stegosaurus stenops* (USNM) photogrammetry scan | Smithsonian Open Access 3D (NMNH Paleobiology) | CC0 |
| *Allosaurus fragilis* (USNM) photogrammetry scan | Smithsonian Open Access 3D (NMNH Paleobiology) | CC0 |
| Neil Armstrong Apollo 11 A7-L spacesuit scan (`NeilArmstrong.glb`) | Smithsonian / Google model-viewer shared assets | CC0 |
| Additional Smithsonian specimens (T. rex, Triceratops, mammoth, hominin skulls) | fetched when the Open Access API allows (`tools/fetch_real_assets.py`) | CC0 |

## Photogrammetry environments, props & lighting
| Asset family | Source | Licence |
|---|---|---|
| Trees, ferns, grass, shrubs, boulders, cliffs, moon rocks, marble bust, bronze horse, gothic statue, lion/bull heads, medieval shield / mace / estoc / war hammer, sailing ships, barrels, lanterns, pottery, baskets, spinning wheel, microscope, radio, CRT TV, laptop, spacecraft instrument, street lamps, fire pit | [Poly Haven](https://polyhaven.com) | CC0 |
| 40 real-sky HDRI environments (rainforest, cave, snow, savanna sunset, ruins, castle moat, foundry, night city, moon lab, aquarium…) | Poly Haven | CC0 |
| PBR terrain/material sets (forest floor, snow, sand, marble, sandstone, cobblestone, medieval blocks, brick, iron, red Mars sand…) | Poly Haven | CC0 |

Very-high-polygon scans were decimated with `gltf-transform simplify` (meshoptimizer) — see `tools/decimate_scans.sh`.

## PBR / animated models
| Asset | Source | Licence |
|---|---|---|
| Barramundi fish, Lantern, "A Beautiful Game" chess set, Avocado, Water bottle, Toy car | Khronos glTF Sample Assets (Microsoft / Khronos) | CC-BY 4.0 / CC0 |
| Mosquito in Amber | Khronos glTF Sample Assets (Loïc Norgeot) | CC-BY 4.0 |
| Antique Camera | Khronos glTF Sample Assets (UX3D) | CC-BY 4.0 |
| Iridescence Abalone shell | Khronos glTF Sample Assets (Wayfair) | CC-BY 4.0 |
| Pot of Coals, Diffuse-Transmission Plant | Khronos glTF Sample Assets | CC-BY 4.0 |
| BrainStem robot (animated) | Khronos glTF Sample Assets (Keith Hunter, Smith Micro) | CC-BY 4.0 |
| Astronaut | Google model-viewer shared assets (Poly) | CC-BY 4.0 |
| Xbot / Soldier / Michelle (rigged, animated) | three.js examples (Mixamo, Adobe) | Mixamo terms via three.js examples |
| Face-cap living face (52 blendshapes) | three.js examples (Face Cap demo) | CC-BY 4.0 |
| Lee Perry-Smith head scan + 4K maps | three.js examples (Infinite-Realities) | CC-BY 3.0 |
| Primary Ion Drive (animated) | three.js examples (Mike Pan / Rodrigo Fuentes) | CC-BY 4.0 |
| Shark (animated) | Babylon.js assets | CC-BY 4.0 |
| Lava / cloud / water-normal textures | three.js examples | MIT |

## Planetary maps
NASA Visible Earth (Blue Marble day/night, clouds), NASA LRO (Moon), NASA/USGS Viking (Mars), NASA SDO (Sun) — public domain.
ESO Milky Way panorama — CC-BY 4.0 (ESO/S. Brunier).

## 2D concept illustrations
The pictures in the right-hand "Concept illustration (2D)" panel are generated artwork used only as contextual illustrations; they are **not** part of the 3D scenes.
