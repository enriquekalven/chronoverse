# ⏳ ChronoVerse 3D (v2.0 Hyper-Realistic Edition)
### Interactive 3D Timeline from the Big Bang (13.8B Years Ago) to Year 3000 CE

**ChronoVerse 3D v2.0** is an interactive, hyper-realistic 3D scroll-driven time machine built for kids and curious explorers. Fly along a 3D helical time tunnel through **30 fully animated, shadow-casting PBR/GLSL 3D dioramas across 9 chapters**—from the **Big Bang** and **Supercontinent Pangaea slowly splitting into today's 7 continents**, through **Dinosaurs & Extinctions**, into an **in-depth journey through Human Evolution (last 500,000–100,000 years to today)**, and forward to **Year 3000 CE**.

---

## 🚀 Quick Start

```bash
cd /Users/enriq/.gemini/jetski/scratch/timeline-of-everything-3d
python3 server.py
```

Open **[http://127.0.0.1:8090](http://127.0.0.1:8090)** in your browser.

---

## ✨ What's New in v2.0 (Hyper-Realism, Pangaea Split & Deep Human History)

1. **Hyper-Realistic 3D Rendering & Shaders (`HyperRealKit.js`, `TimeTunnelEngine.js`)**:
   - **HDR Post-Processing**: `EffectComposer` + `UnrealBloomPass` + `ACESFilmic` `OutputPass` for realistic solar coronas, molten lava, firelight, bioluminescence, and Dyson swarms.
   - **Dynamic Soft Shadows (`PCFSoftShadowMap`)**: Key directional sunlight tracks the active 3D diorama so every dinosaur, hominid, temple, steam locomotive, and starship casts crisp ground shadows.
   - **Custom GLSL Shaders & Multi-Octave FBM PBR Bump Maps**: Custom Rayleigh atmospheric scattering halo shaders, boiling solar granulation shaders, NASA 5.4K Earth albedo/night/cloud/specular maps, ESO 2K Milky Way 360° skybox dome, and procedural FBM bump/roughness maps for reptile scales, mammoth fur, marble, bronze, and silicon wafers.

2. **🌍 Pangaea Splitting Slowly into Today's Continents (`HyperRealKit.js` + Pangaea Split Lab Modal)**:
   - Every milestone displays a **Live Continental Drift Tracker** in the left panel AND a 3D drifting globe inside key geological dioramas showing the exact positions of **North America, South America, Africa, Eurasia, India, Australia, and Antarctica** from **250 MYA (Pangaea)** → **155 MYA (Laurasia & Gondwana)** → **68 MYA (South Atlantic opening & India racing north)** → **35 MYA (India colliding with Asia to push up the Himalayas)** → **20,000 YA (Ice Age Beringia Land Bridge)** → **Today (7 Continents)**.
   - Click **🌍 Pangaea Split Lab** in the top bar to open a dedicated interactive continental drift simulator where kids can scrub smoothly from 250 MYA to Today!

3. **🔥 Deep-Dive Human Evolution & Civilization (Stops 14–28)**:
   - **Stop 14 (7M–3.2M YA)**: *Sahelanthropus* & *Australopithecus afarensis* ("Lucy") walking upright + Laetoli footprints.
   - **Stop 15 (2.5M–1.0M YA)**: *Homo habilis* & *Homo erectus* — Oldowan/Acheulean stone hand-axes & the **Discovery of Fire**.
   - **Stop 16 (500,000–40,000 YA)**: **Neanderthals, Denisovans & *Homo heidelbergensis*** — Ice Age Eurasia mammoth-tusk shelter, spears & flutes.
   - **Stop 17 (300,000–40,000 YA)**: **Birth of *Homo sapiens*, Hunting & Gathering & Cave Art** — Out of Africa migration & Lascaux-style ochre cave paintings.
   - **Stop 18 (20,000 YA)**: **Ice Age & Traveling to the Americas Across Beringia** — Woolly mammoths & human hunters crossing the exposed Alaska-Siberia land bridge.
   - **Stop 19 (10,000 BCE)**: **Neolithic Farming Revolution** — Fertile Crescent wheat fields, mud-brick village, irrigation & domesticated animals.
   - **Stop 20 (3300–1200 BCE)**: **The Bronze Age** — Copper + tin smelting furnace, bronze weapons, Egyptian pyramids, Mesopotamian ziggurat & spoked chariots.
   - **Stop 21 (800–146 BCE)**: **Classical Greece** — Parthenon marble columns, amphitheater, Archimedes & democracy.
   - **Stop 22 (27 BCE–476 CE)**: **The Roman Empire** — Multi-tiered Colosseum, stone aqueducts & paved Roman roads.
   - **Stop 23 (500–1450 CE)**: **The Medieval Ages** — Stone castle with moat, drawbridge, trebuchet, windmill & Gutenberg printing press.
   - **Stop 24 (1760–1840 CE)**: **1st Industrial Revolution** — James Watt steam engine, coal factories & iron steam locomotive.
   - **Stop 25 (1870–1914 CE)**: **2nd Industrial Revolution** — Edison lightbulb, Tesla AC power grid, steel suspension bridge & Wright Brothers biplane.
   - **Stop 26 (1945–1969 CE)**: **Mainframe Computers, Silicon Transistors & Apollo 11 Moon Landing**.
   - **Stop 27 (1975–2007 CE)**: **Personal Computers, the World Wide Web & the 2007 iPhone**.
   - **Stop 28 (2026 CE)**: **Present Day: The Age of AI, Humanoid Robotics & Global Connectivity**.
   - **Stops 29–30 (2150–3000 CE)**: **Terraforming Mars, O'Neill Space Habitats & Dyson Swarm Solar Collectors**.
