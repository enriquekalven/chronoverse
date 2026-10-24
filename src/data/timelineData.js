/**
 * ChronoVerse 3D v2.0 — Complete 30-Milestone Hyper-Realistic Dataset (13.8 BYA → Year 3000 CE)
 * Includes:
 *   • Full Pangaea → Laurasia/Gondwana → Modern 7 Continents tectonic drift coordinates (paleoMa)
 *   • Deep-dive Human Evolution (Lucy → Homo erectus & Fire → Neanderthals, Denisovans & Homo sapiens →
 *     Cave Art → Hunting/Gathering & Crossing Beringia to the Americas)
 *   • Detailed Human Civilizations & Tech Revolutions (Farming → Bronze Age → Ancient Greece →
 *     Roman Empire → Medieval Ages → 1st & 2nd Industrial Revolutions → Computers & Moon →
 *     Internet & iPhone → AI & Robotics Today → Year 3000)
 */

export const CHAPTERS = [
  {
    id: 'cosmos',
    number: 1,
    icon: '💥',
    title: 'Cosmic Dawn',
    shortTitle: '1. Big Bang & Earth',
    range: '13.8 B – 4.5 B yrs ago',
    color: '#f59e0b',
  },
  {
    id: 'life',
    number: 2,
    icon: '🦠',
    title: 'First Organisms',
    shortTitle: '2. First Life & Oceans',
    range: '3.8 B – 300 M yrs ago',
    color: '#10b981',
  },
  {
    id: 'pangaea-dinos',
    number: 3,
    icon: '🦖',
    title: 'Pangaea Split & Dinosaurs',
    shortTitle: '3. Pangaea & Dinosaurs',
    range: '252 M – 66 M yrs ago',
    color: '#22c55e',
  },
  {
    id: 'ancestors',
    number: 4,
    icon: '🦴',
    title: 'Continents & Early Ancestors',
    shortTitle: '4. Continents & Ancestors',
    range: '50 M – 1.5 M yrs ago',
    color: '#fb923c',
  },
  {
    id: 'sapiens-iceage',
    number: 5,
    icon: '🦣',
    title: 'Sapiens, Neanderthals & Americas',
    shortTitle: '5. Sapiens & Ice Age',
    range: '500k – 12k yrs ago',
    color: '#38bdf8',
  },
  {
    id: 'ancient-classical',
    number: 6,
    icon: '🏛️',
    title: 'Farming, Bronze, Greece & Rome',
    shortTitle: '6. Farming to Rome',
    range: '10,000 BCE – 476 CE',
    color: '#eab308',
  },
  {
    id: 'medieval-industrial',
    number: 7,
    icon: '🚂',
    title: 'Medieval & Industrial Revolutions',
    shortTitle: '7. Medieval & Steam',
    range: '500 CE – 1920 CE',
    color: '#f43f5e',
  },
  {
    id: 'digital-ai',
    number: 8,
    icon: '📱',
    title: 'Computers, iPhone & AI Today',
    shortTitle: '8. Computers, iPhone & AI',
    range: '1945 CE – 2026 CE',
    color: '#8b5cf6',
  },
  {
    id: 'future',
    number: 9,
    icon: '🚀',
    title: 'Tomorrow to Year 3000',
    shortTitle: '9. Future to Year 3000',
    range: '2050 CE – 3000 CE',
    color: '#06b6d4',
  },
];

export const MILESTONES = [
  // ===========================================================================
  // CHAPTER 1: COSMIC DAWN (13.8 BYA – 4.54 BYA)
  // ===========================================================================
  {
    id: 'big-bang',
    index: 0,
    chapterId: 'cosmos',
    sceneType: 'bigBang',
    paleoMa: null,
    tectonicStage: 'Pre-Solar System (Primordial Cosmos)',
    icon: '💥',
    eraBadge: '13.8 BILLION YEARS AGO',
    cosmicClock: '12:00:00 AM (Start of the 24-Hr Cosmic Day)',
    title: 'The Big Bang: Birth of Space, Time & Matter',
    subtitle: 'The entire universe expands from a quantum singularity hotter than a quadrillion degrees',
    themeColor: '#f97316',
    skyTint: [0.09, 0.02, 0.06],
    summary:
      '13.8 billion years ago, all energy, space, and time expanded from an unimaginably dense, hot point. In the first fraction of a second (Cosmic Inflation), space stretched faster than light. As the quark-gluon plasma cooled over the first 3 minutes, protons and neutrons locked together to form the very first Hydrogen and Helium nuclei — leaving behind the Cosmic Microwave Background glow we still detect today!',
    stats: [
      { label: 'Age', value: '13.8 Billion Yrs Ago' },
      { label: 'Temperature', value: '10³² K → 1 Billion K' },
      { label: 'Continents', value: 'Earth Not Born Yet' },
      { label: 'First Atoms', value: '75% Hydrogen, 25% Helium' },
    ],
    facts: [
      'Every single hydrogen atom in the water you drink today was forged in the first 3 minutes after the Big Bang.',
      'The Big Bang was not an explosion in an empty room — it was the rapid stretching of space itself everywhere at once!',
      'Leftover heat from the Big Bang still fills all of space at 2.7 Kelvin (-270.4 °C), mapped by Planck and WMAP satellites.',
    ],
    whatIf: {
      question: 'What if gravity had been 1% weaker right after the Big Bang?',
      buttonLabel: '🧪 Test Weaker Gravity Expansion',
      activeLabel: '🌌 Runaway Expansion: Gas Never Collapses into Stars!',
      explanation:
        'If gravity were slightly weaker, primordial hydrogen clouds would have expanded forever without ever condensing into galaxies, stars, or planets!',
    },
  },
  {
    id: 'first-stars',
    index: 1,
    chapterId: 'cosmos',
    sceneType: 'firstStars',
    paleoMa: null,
    tectonicStage: 'Galactic Nucleosynthesis (Forging Rock Elements)',
    icon: '✨',
    eraBadge: '13.5 BILLION YEARS AGO',
    cosmicClock: '12:31 AM',
    title: 'First Hypergiant Stars & Spiral Proto-Galaxies',
    subtitle: 'Population III blue monster stars ignite fusion and cook the elements for rocky planets',
    themeColor: '#60a5fa',
    skyTint: [0.02, 0.04, 0.12],
    summary:
      'After 200 million years of pitch-black Cosmic Dark Ages, gravity pulled hydrogen gas into colossal filaments. Inside them ignited the first Population III hypergiant stars — scorching blue titans up to 300 times as massive as our Sun! Living fast and dying young in titanic core-collapse supernovas, their nuclear furnaces forged Carbon, Oxygen, Silicon, Magnesium, and Iron — the exact minerals that later built Earth’s continents and our own bodies.',
    stats: [
      { label: 'Age', value: '13.5 Billion Yrs Ago' },
      { label: 'Star Mass', value: '100–300× Solar Mass' },
      { label: 'Star Color', value: 'Ultraviolet / Brilliant Blue' },
      { label: 'Elements Forged', value: 'Carbon, Oxygen, Silicon, Iron' },
    ],
    facts: [
      'The iron in your red blood cells, the calcium in your teeth, and the silicon in Earth’s granite continents were all cooked inside ancient supernovas.',
      'NASA’s James Webb Space Telescope (JWST) can see infrared light from baby galaxies that formed just 290 million years after the Big Bang!',
      'Our Milky Way grew by merging with dozens of smaller dwarf proto-galaxies over billions of years.',
    ],
    whatIf: {
      question: 'Detonate a Hypergiant Core-Collapse Supernova to seed space with planet-building elements!',
      buttonLabel: '💥 Detonate Supernova Remnant!',
      activeLabel: '🌟 Supernova Shockwave: Silicon, Iron & Carbon Scattered!',
      explanation:
        'The shockwave compresses nearby gas clouds while enriching them with heavy elements so rocky planets and continents can form billions of years later.',
    },
  },
  {
    id: 'molten-earth',
    index: 2,
    chapterId: 'cosmos',
    sceneType: 'moltenEarth',
    paleoMa: 4540,
    tectonicStage: 'Hadean Magma Ocean → First Zircon Crust',
    icon: '🌋',
    eraBadge: '4.54 BILLION YEARS AGO',
    cosmicClock: '4:06 PM (Two-thirds of the Cosmic Day is already over!)',
    title: 'Birth of Molten Earth & The Giant Theia Moon Crash',
    subtitle: 'A Mars-sized proto-planet slams into Hadean Earth, tilting our axis and forging the Moon',
    themeColor: '#ef4444',
    skyTint: [0.14, 0.03, 0.02],
    summary:
      '4.54 billion years ago, gravity pulled rocky planetesimals in the young Sun’s protoplanetary disk together into baby Earth. Heavy iron sank to the center to form Earth’s liquid magnetic core, while the surface was a 1,200 °C ocean of glowing magma! Then a Mars-sized world named Theia oblique-struck Earth at 35,000 km/h, vaporizing rock into an incandescent ring that coalesced into our Moon and gave Earth its 23.5° seasonal tilt.',
    stats: [
      { label: 'Age', value: '4.54 Billion Yrs Ago' },
      { label: 'Surface State', value: 'Global Magma Ocean (1,200 °C)' },
      { label: 'Day Length', value: 'Only ~5 Hours Long!' },
      { label: 'Continents', value: 'First Basalt & Zircon Crusts' },
    ],
    facts: [
      'Tiny Jack Hills zircon crystals from Western Australia are 4.4 billion years old — proving Earth cooled enough for solid crust and liquid water surprisingly fast!',
      'Right after the crash, the Moon orbited just 25,000 km away (15× closer than today) and raised kilometer-high lava tides.',
      'Earth’s liquid iron core generates a magnetic field shield that prevents the solar wind from stripping away our atmosphere.',
    ],
    whatIf: {
      question: 'What if Theia had never collided with Earth to create the Moon?',
      buttonLabel: '🌑 Simulate Earth Without the Moon',
      activeLabel: '🌀 Chaotic Obliquity: Earth’s Axis Tilts Wildly to 85°!',
      explanation:
        'Without the Moon’s stabilizing pull, Earth’s spin axis would wobble chaotically between 0° and 85°, freezing the equator and boiling the poles!',
    },
  },

  // ===========================================================================
  // CHAPTER 2: FIRST ORGANISMS & ANCIENT OCEANS (3.8 BYA – 300 MYA)
  // ===========================================================================
  {
    id: 'first-organisms',
    index: 3,
    chapterId: 'life',
    sceneType: 'hydrothermalVents',
    paleoMa: 3800,
    tectonicStage: 'Archean Volcanic Protocontinents (Vaalbara / Ur)',
    icon: '🦠',
    eraBadge: '3.8 BILLION YEARS AGO',
    cosmicClock: '5:23 PM',
    title: 'First Organisms: Deep-Sea Hydrothermal Vents & LUCA',
    subtitle: 'Alkaline volcanic ocean chimneys spark the first self-replicating single-celled microbes',
    themeColor: '#10b981',
    skyTint: [0.01, 0.07, 0.08],
    summary:
      'While tiny volcanic island chains (the first cratons like Vaalbara) poked above iron-green Archean oceans, life sparked in the dark abyss! Warm, mineral-rich water gushing from deep-sea hydrothermal vents created natural proton gradients across porous rock pores. Here emerged LUCA (Last Universal Common Ancestor) — microscopic single-celled prokaryotes with RNA/DNA genetic code and ATP molecular motors.',
    stats: [
      { label: 'Age', value: '3.8 – 3.5 Billion Yrs Ago' },
      { label: 'First Continents', value: 'Vaalbara & Ur Microcontinents' },
      { label: 'Organism Type', value: 'Single-Celled Prokaryotes (LUCA)' },
      { label: 'Energy Source', value: 'Chemosynthesis (H₂ & Sulfur)' },
    ],
    facts: [
      'Every living thing on Earth — bacteria, redwoods, Tyrannosaurus, Neanderthals, and you — uses the exact same genetic code inherited from LUCA!',
      'These first organisms didn’t need sunlight or oxygen; they fed on hydrogen gas and dissolved minerals from volcanic vents.',
      'For the first 3 BILLION years of life on Earth, every organism was microscopic.',
    ],
    whatIf: {
      question: 'Zoom 1,000× into the volcanic vent plume to inspect dividing LUCA cells!',
      buttonLabel: '🔬 Activate Sub-Cellular Microscope',
      activeLabel: '🧬 Binary Fission Active: Glowing RNA/DNA Coils Replicating!',
      explanation:
        'Inside lipid membranes, twisted genetic strands duplicate and split one cell into two — an unbroken chain of cell division stretching 3.8 billion years to your own body!',
    },
  },
  {
    id: 'oxygen-snowball',
    index: 4,
    chapterId: 'life',
    sceneType: 'oxygenSnowball',
    paleoMa: 720,
    tectonicStage: 'Supercontinent Rodinia Breakup & Global Glaciation',
    icon: '🫧',
    eraBadge: '2.4 BILLION – 700 MILLION YEARS AGO',
    cosmicClock: '7:48 PM – 10:44 PM',
    title: 'Cyanobacteria, The Great Oxygenation & Snowball Earth',
    subtitle: 'Photosynthetic microbes pump oxygen into the sky, form complex cells, and freeze the globe',
    themeColor: '#06b6d4',
    skyTint: [0.02, 0.09, 0.15],
    summary:
      'In shallow coastal seas around early supercontinents (Columbia and Rodinia), blue-green Cyanobacteria built layered stromatolite reefs and mastered oxygenic photosynthesis — using sunlight to split water and release O₂! Oxygen rusted dissolved iron out of the oceans (forming the Banded Iron Formations we mine for steel today), created the protective ozone layer, and triggered "Snowball Earth" glaciations when methane greenhouse gas was oxidized.',
    stats: [
      { label: 'Age', value: '2.4 BYA (Oxygen) – 700 MYA (Snowball)' },
      { label: 'Supercontinent', value: 'Rodinia (Rifting at Equator)' },
      { label: 'Cell Evolution', value: 'Eukaryotes (Nucleus + Mitochondria)' },
      { label: 'Global Temp', value: 'Plunged to -50 °C in Snowball Phase' },
    ],
    facts: [
      'Around 1.8 billion years ago, an archaeon microbe engulfed a bacterium that became the Mitochondrion — the powerhouse inside all animal and plant cells!',
      'As Rodinia broke apart ~720 million years ago, fresh basalt rock weathered and sucked so much CO₂ from the air that ice sheets locked Earth from pole to equator.',
      'Volcanoes punching through the ice eventually pumped enough CO₂ back into the sky to melt Snowball Earth and jump-start animal evolution!',
    ],
    whatIf: {
      question: 'Switch Earth between Oxygen-Bubbling Stromatolite Seas and Frozen Snowball Earth!',
      buttonLabel: '❄️ Freeze Planet into Snowball Earth',
      activeLabel: '🧊 Cryogenian Snowball Active: Equatorial Ice Sheets Locked!',
      explanation:
        'High-albedo white ice reflects 80% of sunlight back into space, locking the oceans under a kilometer of ice while life survives around volcanic vents and slushy refugia!',
    },
  },
  {
    id: 'cambrian-explosion',
    index: 5,
    chapterId: 'life',
    sceneType: 'cambrianOcean',
    paleoMa: 541,
    tectonicStage: 'Gondwana in the South + Laurentia & Baltica Islands',
    icon: '🦐',
    eraBadge: '541 MILLION YEARS AGO',
    cosmicClock: '11:03 PM (57 minutes to Midnight)',
    title: 'The Cambrian Explosion: Eyes, Armor & First Backbones',
    subtitle: 'Anomalocaris, crystal-eyed Trilobites, and our chordate ancestor Pikaia fill warm seas',
    themeColor: '#14b8a6',
    skyTint: [0.01, 0.11, 0.14],
    summary:
      'As continents drifted apart creating vast, sunlit shallow seas rich in calcium and oxygen, animal life exploded into virtually every modern body plan! Predators like the 1-meter Anomalocaris evolved compound eyes and grasping claws; Trilobites grew articulated exoskeleton armor; and a tiny ribbon-shaped swimmer named Pikaia evolved a flexible nerve cord (notochord) — the direct ancestor of all fish, dinosaurs, and humans!',
    stats: [
      { label: 'Age', value: '541 – 485 Million Yrs Ago' },
      { label: 'Continental Layout', value: 'Southern Gondwana + Warm Archipelagos' },
      { label: 'Breakthroughs', value: 'Compound Eyes, Shells, Notochords' },
      { label: 'Key Fossils', value: 'Burgess Shale & Chengjiang Biota' },
    ],
    facts: [
      'Trilobite eyes were made of oriented calcite crystals — the first optical lenses in Earth’s history!',
      'At 541 MYA, the continents were completely barren desert rock with zero trees, zero grass, and zero land animals.',
      'Pikaia and Haikouichthys were only 4 cm long, yet they carried the blueprint for the vertebrate skull and backbone.',
    ],
    whatIf: {
      question: 'Trigger the Cambrian Predator-Prey Arms Race!',
      buttonLabel: '🦐 Engage Anomalocaris Hunt Mode',
      activeLabel: '👀 Arms Race Active: High-Speed Pursuit & Enrolled Trilobite Armor!',
      explanation:
        'Vision changed evolution forever: once predators could see prey from afar, natural selection drove rapid evolution of armor, spines, burrowing, and speed.',
    },
  },
  {
    id: 'land-walk',
    index: 6,
    chapterId: 'life',
    sceneType: 'landForest',
    paleoMa: 340,
    tectonicStage: 'Euramerica & Gondwana Colliding to Build Pangaea',
    icon: '🦎',
    eraBadge: '375 – 300 MILLION YEARS AGO',
    cosmicClock: '11:21 PM',
    title: 'Tiktaalik Steps onto Land & Giant Carboniferous Coal Forests',
    subtitle: 'Lobe-finned fish evolve wrists and lungs while 35%-oxygen swamps breed eagle-sized dragonflies',
    themeColor: '#84cc16',
    skyTint: [0.03, 0.12, 0.05],
    summary:
      'First vascular plants and fungi colonized the bare continents, followed by millipedes and scorpions. Then 375 million years ago, a lobe-finned fish named Tiktaalik used sturdy fin-bones (humerus, radius, ulna, and wrist!) to prop itself onto muddy riverbanks and breathe air. By 300 MYA, towering Lepidodendron scale-tree swamps pumped oxygen to 35% — allowing giant dragonflies (Meganeura) and 2.6-meter millipedes (Arthropleura) to thrive while reptiles invented the waterproof amniotic egg!',
    stats: [
      { label: 'Age', value: '375 MYA (Tiktaalik) – 300 MYA (Coal Swamps)' },
      { label: 'Tectonic Event', value: 'Appalachian/Variscan Mountains Rising' },
      { label: 'Atmosphere O₂', value: '35% Oxygen (Highest in Earth History!)' },
      { label: 'Hero Species', value: 'Tiktaalik, Meganeura, Hylonomus' },
    ],
    facts: [
      'When you bend your elbow and wrist today, you are moving the exact homologous bone joints first pioneered by Tiktaalik 375 million years ago.',
      'As Gondwana slammed into Euramerica to assemble Pangaea, it pushed up the Central Pangean Mountains (today’s Appalachians and Scottish Highlands) as tall as the Himalayas!',
      'The amniotic egg let early reptiles lay eggs on dry land without returning to water like amphibians.',
    ],
    whatIf: {
      question: 'Pump Carboniferous atmospheric oxygen to 35% to super-size the arthropods!',
      buttonLabel: '💨 Boost Oxygen to 35% Hyperoxia',
      activeLabel: '蜻 35% O₂ Active: 70-cm Wingspan Meganeura Dragonfly Patrol!',
      explanation:
        'Because insects breathe by diffusing oxygen through tracheal tubes, 35% atmospheric O₂ allowed giant dragonflies and car-sized millipedes to get enough oxygen.',
    },
  },

  // ===========================================================================
  // CHAPTER 3: PANGAEA SPLIT, DINOSAURS & ASTEROID (252 MYA – 66 MYA)
  // ===========================================================================
  {
    id: 'pangaea-great-dying',
    index: 7,
    chapterId: 'pangaea-dinos',
    sceneType: 'pangaeaGreatDying',
    paleoMa: 250,
    tectonicStage: 'SUPERCONTINENT PANGAEA (100% Locked Together)',
    icon: '🌍',
    eraBadge: '252 MILLION YEARS AGO',
    cosmicClock: '11:33 PM',
    title: 'Supercontinent Pangaea & The Great Dying Extinction',
    subtitle: 'All continents fuse into one C-shaped supercontinent as Siberian super-volcanoes reset life',
    themeColor: '#dc2626',
    skyTint: [0.16, 0.04, 0.02],
    summary:
      'By 252 million years ago, almost every piece of land on Earth had collided into one colossal C-shaped supercontinent called PANGAEA ("All-Earth"), surrounded by a single global ocean called Panthalassa! You could walk on dry land from the North Pole to Antarctica. Then the Siberian Traps flood-basalt volcanoes erupted for nearly a million years, heating the oceans to 40 °C and wiping out 90% of all species — clearing the ecological stage for the first Triassic dinosaurs!',
    stats: [
      { label: 'Age', value: '252 Million Yrs Ago (Permian-Triassic)' },
      { label: 'Geography', value: 'One Giant Supercontinent: PANGAEA' },
      { label: 'Global Ocean', value: 'Panthalassa + Tethys Sea' },
      { label: 'Survivors', value: 'Lystrosaurus, Archosaurs & Cynodonts' },
    ],
    facts: [
      'Because Pangaea was so huge, its interior was a scorching mega-desert thousands of kilometers from cooling ocean winds.',
      'Look at the 3D Pangaea Globe: South America’s east coast fits right into Africa’s west coast like two jigsaw puzzle pieces, and North America touches Europe and Morocco!',
      'In the Late Triassic (~230 MYA) on Pangaea, both the first dinosaurs (Eoraptor, Coelophysis) AND the first tiny shrew-like mammals evolved almost simultaneously!',
    ],
    whatIf: {
      question: 'Pull Pangaea’s jigsaw puzzle plates apart along the Central Atlantic Rift!',
      buttonLabel: '🌍 Rift Pangaea Apart in 3D!',
      activeLabel: '🌋 Mid-Atlantic Rift Opened: Pangaea Splits into Laurasia & Gondwana!',
      explanation:
        'Watch the 3D globe! Magma wells up along the rift zone, splitting Pangaea into a northern half (Laurasia) and a southern half (Gondwana) as the Atlantic Ocean is born!',
    },
  },
  {
    id: 'jurassic-giants',
    index: 8,
    chapterId: 'pangaea-dinos',
    sceneType: 'jurassicGiants',
    paleoMa: 155,
    tectonicStage: 'Pangaea Rifts in Two: Laurasia (North) & Gondwana (South)',
    icon: '🦕',
    eraBadge: '200 – 145 MILLION YEARS AGO',
    cosmicClock: '11:42 PM',
    title: 'Pangaea Splits in Two & Jurassic Dinosaur Titans Roam',
    subtitle: 'New coastlines bring humid rains as 50-ton Brachiosaurus, Stegosaurus & Archaeopteryx flourish',
    themeColor: '#16a34a',
    skyTint: [0.02, 0.11, 0.08],
    summary:
      'In the Jurassic Period, Pangaea cracked into two giant supercontinents: Laurasia in the north (North America + Eurasia) and Gondwana in the south (South America, Africa, India, Antarctica, Australia). Narrow new seas flooded between the continents, turning parched deserts into lush conifer and fern jungles! Giant sauropods like Brachiosaurus and Diplodocus grew to 25–30 meters long, plated Stegosaurus swung its spiked thagomizer tail against Allosaurus, and feathered Archaeopteryx glided through the trees.',
    stats: [
      { label: 'Age', value: '200 – 145 Million Yrs Ago' },
      { label: 'Continental Split', value: 'Laurasia & Gondwana Separate' },
      { label: 'Largest Herbivore', value: 'Brachiosaurus & Supersaurus (50+ Tons)' },
      { label: 'Evolution Milestone', value: 'First Feathered Dinosaurs / Birds' },
    ],
    facts: [
      'As the North Atlantic began opening between North America and Africa, seawater rushed in, bringing monsoons that fed the Morrison Formation dinosaur forests.',
      'Sauropod vertebrae had honeycomb air sacs connected to bird-like lungs, making their 9-meter necks surprisingly lightweight.',
      'Stegosaurus lived 150 million years ago — 84 million years before T-Rex ever walked the Earth!',
    ],
    whatIf: {
      question: 'Elevate Brachiosaurus to browse the 13-meter Araucaria canopy & reveal its air-sac lungs!',
      buttonLabel: '🦕 Raise Sauropod Canopy Reach',
      activeLabel: '🌿 High-Canopy Feeding: 200-kg Heart & Avian Air-Sacs Active!',
      explanation:
        'Brachiosaurus acted like a living crane, stripping high conifer needles without moving its body while gastrolith gizzard stones ground up the tough fibers.',
    },
  },
  {
    id: 'cretaceous-kings',
    index: 9,
    chapterId: 'pangaea-dinos',
    sceneType: 'cretaceousKings',
    paleoMa: 68,
    tectonicStage: 'South Atlantic Unzips, India Races North & Western Interior Seaway',
    icon: '🦖',
    eraBadge: '100 – 68 MILLION YEARS AGO',
    cosmicClock: '11:52 PM (8 minutes to Midnight)',
    title: 'Drifting Continents, Flowering Plants & T-Rex vs. Triceratops',
    subtitle: 'South America breaks from Africa, India sprints north, and dinosaurs diversify on isolated continents',
    themeColor: '#22c55e',
    skyTint: [0.03, 0.12, 0.07],
    summary:
      'During the Cretaceous Period, the South Atlantic unzipped like a jacket — separating South America from Africa — while Madagascar and India broke loose and raced northward at 15 cm/year! Because the continents were now separated by wide oceans, each landmass evolved its own unique dinosaur dynasties: Tyrannosaurus Rex and three-horned Triceratops in western North America (Laramidia), Spinosaurus and Carcharodontosaurus in Africa, and Argentinosaurus in South America — all surrounded by the first flowering plants, bees, and magnolias!',
    stats: [
      { label: 'Age', value: '145 – 66 Million Yrs Ago' },
      { label: 'Continental Drift', value: 'South Atlantic Opens; India Sprints N' },
      { label: 'Apex Duel', value: 'Tyrannosaurus Rex vs. Triceratops' },
      { label: 'Botanical Revolution', value: 'First Angiosperms (Flowers & Fruit)' },
    ],
    facts: [
      'High sea levels flooded the middle of North America, splitting the continent into two islands (Laramidia and Appalachia) separated by the Western Interior Seaway!',
      'T-Rex teeth were rounded like railroad spikes rather than flat blades, allowing its 6-ton bite to pulverize solid Triceratops bone.',
      'Feathered dromaeosaurs (like Velociraptor and Deinonychus) had swiveling wrist bones identical to modern birds.',
    ],
    whatIf: {
      question: 'Trigger the Hell Creek Cretaceous Showdown: T-Rex vs. Triceratops!',
      buttonLabel: '🦖 Trigger T-Rex Charge & Horn Lock!',
      activeLabel: '🛡️ Defensive Phalanx: Triceratops Raises Brow Horns & Frill!',
      explanation:
        'Paleontologists have found Triceratops squamosal frill bones with partially healed T-Rex bite punctures — proving Triceratops actively fought back and survived!',
    },
  },
  {
    id: 'asteroid-impact',
    index: 10,
    chapterId: 'pangaea-dinos',
    sceneType: 'asteroidImpact',
    paleoMa: 66,
    tectonicStage: 'K-Pg Boundary (Continents Approaching Modern Outlines)',
    icon: '☄️',
    eraBadge: '66 MILLION YEARS AGO',
    cosmicClock: '11:53:07 PM',
    title: 'Extinction of the Dinosaurs: 66 MYA Chicxulub Asteroid Impact',
    subtitle: 'A 10-km carbonaceous asteroid strikes Yucatán at 20 km/s, ending the 165-million-year reign of dinosaurs and opening the world for mammals & humans',
    themeColor: '#f43f5e',
    skyTint: [0.2, 0.04, 0.02],
    summary:
      '66 million years ago, a 10-kilometer asteroid slammed into the sulfur-rich carbonate shelf of Chicxulub, Mexico. The impact gouged a 180-km crater, triggered kilometer-high mega-tsunamis, rained glowing glass spherules (tektites) across the globe, and shrouded Earth in an impact winter that halted photosynthesis. Every non-avian dinosaur, pterosaur, ammonite, and mosasaur perished — but small feathered avian dinosaurs (birds) and warm-blooded burrowing mammals survived to inherit the Earth!',
    stats: [
      { label: 'Age', value: '66.0 Million Yrs Ago' },
      { label: 'Impact Energy', value: '100 Million Megatons (~10B Hiroshima)' },
      { label: 'Extinction Rate', value: '75% of All Earth Species' },
      { label: 'Key Survivors', value: 'Avian Dinosaurs (Birds) & Placental Mammals' },
    ],
    facts: [
      'Core drillings from the Chicxulub peak ring show granite from 10 km underground behaved like liquid for minutes during the impact.',
      'Small seed-eating ground birds and insect-eating burrowing mammals survived because their food sources (buried seeds, detritus, worms) didn’t vanish when leaves died.',
      'Without this single cosmic collision, large-brained primates and humans almost certainly would never have evolved.',
    ],
    whatIf: {
      question: 'What if the Chicxulub asteroid missed Yucatán by 30 minutes and hit the deep Pacific?',
      buttonLabel: '🛸 Deflect Asteroid into Deep Ocean',
      activeLabel: '🌊 Deep-Water Impact: Sulfur Winter Avoided — Dinosaurs Survive!',
      explanation:
        'Yucatán’s gypsum rocks released 100+ billion tons of sunlight-reflecting sulfate aerosols; hitting deep oceanic crust just 30 minutes later would have spared many dinosaur clades!',
    },
  },

  // ===========================================================================
  // CHAPTER 4: MODERN CONTINENTS LOCK IN & EARLY HUMAN ANCESTORS (50 MYA – 1.5 MYA)
  // ===========================================================================
  {
    id: 'himalayas-mammals',
    index: 11,
    chapterId: 'ancestors',
    sceneType: 'himalayasContinents',
    paleoMa: 35,
    tectonicStage: 'India Collides with Eurasia → Himalayas Rise & Antarctica Freezes',
    icon: '🏔️',
    eraBadge: '50 – 20 MILLION YEARS AGO',
    cosmicClock: '11:56 PM',
    title: 'India Crashes into Asia, Himalayas Rise & Today’s Continents Form',
    subtitle: 'Tectonic collisions push up Mount Everest, open the Southern Ocean, and spread savannas',
    themeColor: '#f59e0b',
    skyTint: [0.04, 0.1, 0.14],
    summary:
      'Watch how the final pieces of today’s world map click into place! Around 50–35 million years ago, the fast-moving Indian Plate slammed head-on into Eurasia, crumpling the ancient Tethys seafloor skyward into the Tibetan Plateau and the Himalaya Mountains! Meanwhile, Australia and South America pulled away from Antarctica, letting the icy Circumpolar Current circle the South Pole. Earth cooled, lush jungles shrank into open grassy savannas, and mammals radiated into whales, horses, elephants, and early apes!',
    stats: [
      { label: 'Age', value: '50 – 20 Million Yrs Ago' },
      { label: 'Major Collision', value: 'India + Eurasia → Himalayas & Everest' },
      { label: 'Ocean Shift', value: 'Drake Passage Opens; Antarctica Freezes' },
      { label: 'Mega-Mammals', value: 'Paraceratherium, Basilosaurus, Early Apes' },
    ],
    facts: [
      'The limestone rock at the very summit of Mount Everest (8,849 m high!) is full of fossilized marine seashells from the ancient Tethys Ocean floor!',
      'India is STILL pushing northward into Asia at ~5 cm per year — making the Himalayas grow taller every century.',
      'Around 3.5 million years ago, the volcanic Isthmus of Panama rose to connect North and South America, shaping the Gulf Stream ocean current.',
    ],
    whatIf: {
      question: 'Replay the India-to-Eurasia Tectonic Collision & uplift of the Himalayas!',
      buttonLabel: '🏔️ Thrust Indian Plate into Asia!',
      activeLabel: '⛰️ Orogeny Active: Tibetan Plateau & Mount Everest Fold Skyward!',
      explanation:
        'As two buoyant continental plates collide, neither can sink into the mantle — so the crust buckles and stacks double-thick, creating the highest mountains on Earth!',
    },
  },
  {
    id: 'lucy-bipedalism',
    index: 12,
    chapterId: 'ancestors',
    sceneType: 'lucyAncestors',
    paleoMa: 3.5,
    tectonicStage: 'East African Rift Valley Uplift & Isthmus of Panama Closes',
    icon: '🦶',
    eraBadge: '6 MILLION – 3.2 MILLION YEARS AGO',
    cosmicClock: '11:59:35 PM (25 seconds before Midnight)',
    title: 'Human Ancestors Stand Up: Sahelanthropus & Australopithecus ("Lucy")',
    subtitle: 'Tectonic rifting in East Africa turns rainforest into savanna as early hominins walk on two legs',
    themeColor: '#fb923c',
    skyTint: [0.08, 0.07, 0.04],
    summary:
      'As tectonic forces split the East African Rift Valley and pushed up highland ridges, eastern Africa dried from dense rainforest into a mosaic of woodland and open savanna grassland. Between 7 and 6 million years ago, our lineage split from the ancestors of chimpanzees (*Sahelanthropus tchadensis* and *Ardipithecus*). By 3.2 million years ago in Ethiopia, *Australopithecus afarensis* — famously known from the fossil skeleton "Lucy" and the 3.66-million-year-old Laetoli footprints in volcanic ash — walked fully upright on two legs!',
    stats: [
      { label: 'Age', value: '7M – 3.2 Million Yrs Ago' },
      { label: 'Key Hominins', value: 'Sahelanthropus, Ardipithecus, Australopithecus' },
      { label: 'Brain Volume', value: '~400–450 cm³ (Chimp-sized, but Bipedal!)' },
      { label: 'Smoking-Gun Fossil', value: '"Lucy" (3.2 MYA) & Laetoli Footprints' },
    ],
    facts: [
      'Surprise: Human ancestors evolved upright two-legged walking (bipedalism) MILLIONS of years before evolving giant brains!',
      'Walking on two legs uses 75% less energy than knuckle-walking, keeps less body surface under the scorching midday sun, and freed our hands to carry food, babies, and tools.',
      'At Laetoli in Tanzania, three Australopithecus individuals walked across wet volcanic ash 3.66 million years ago, preserving big-toe-aligned footprints just like yours.',
    ],
    whatIf: {
      question: 'Compare Quadrupedal Ape Posture vs. Lucy’s Upright Pelvis, Spine & Foot Arch!',
      buttonLabel: '🦴 Highlight Bipedal Skeletal Anatomy',
      activeLabel: '🦶 Bipedal Biomechanics Lit: S-Curved Spine, Bowl Pelvis & Free Hands!',
      explanation:
        'Notice how the foramen magnum (where the spine enters the skull) shifted directly underneath the head, while the pelvis shortened into a bowl to balance on one leg per stride!',
    },
  },
  {
    id: 'homo-erectus-fire',
    index: 13,
    chapterId: 'ancestors',
    sceneType: 'homoErectusFire',
    paleoMa: 1.8,
    tectonicStage: 'Pleistocene Continents (Modern Layout with Fluctuating Ice Sheets)',
    icon: '🔥',
    eraBadge: '1.8 MILLION – 400,000 YEARS AGO',
    cosmicClock: '11:59:48 PM (12 seconds before Midnight)',
    title: 'Discovery of Fire & Homo erectus: Taming Flame & Stone Hand-Axes',
    subtitle: 'Humans master controlled fire in caves, cook food to fuel bigger brains, and knap Acheulean stone blades',
    themeColor: '#f97316',
    skyTint: [0.09, 0.05, 0.08],
    summary:
      'Around 2.4 million years ago appeared the genus *Homo* (*Homo habilis*, "handy human"), purposefully striking river cobbles to flake razor-sharp Oldowan stone choppers. Then ~1.9 million years ago emerged *Homo erectus* — tall, long-legged endurance runners with sweat glands, smaller jaws, and brains double the size of Lucy’s (~950 cm³)! *Homo erectus* sculpted symmetrical teardrop Acheulean stone hand-axes, became the first hominin to walk out of Africa all the way to Georgia, China, and Java, and learned to control FIRE for warmth, predator defense, and cooking food!',
    stats: [
      { label: 'Age', value: '2.4M – 1.5 Million Yrs Ago' },
      { label: 'Key Species', value: 'Homo habilis & Homo erectus' },
      { label: 'Brain Growth', value: '450 cm³ → 650 cm³ → 1,000 cm³' },
      { label: 'Breakthrough Tech', value: 'Acheulean Hand-Axe & Controlled Fire' },
    ],
    facts: [
      'Cooking meat and fibrous tubers over fire breaks down tough proteins and starches before you even chew — acting like an "external stomach" that unlocked massive calories to fuel human brain expansion!',
      'The Acheulean teardrop stone hand-axe was humanity’s longest-running technology: hominins used that exact design for over 1.4 MILLION years.',
      'Unlike furry carnivores that pant to cool down, *Homo erectus* lost thick body fur and evolved millions of sweat glands to cool while running in midday heat.',
    ],
    whatIf: {
      question: 'Ignite the Hearth & Knap a Symmetrical Acheulean Flint Hand-Axe!',
      buttonLabel: '🔥 Stoke Hearth & Strike Flint Sparks',
      activeLabel: '✨ Hearth Blazing: Cooked Nutrients Fuel 2× Brain Expansion!',
      explanation:
        'Our huge human brain consumes 20% of our body’s energy despite being only 2% of our weight — a metabolic trade-off made possible by cooked food and cooperative hunting & gathering!',
    },
  },

  // ===========================================================================
  // CHAPTER 5: LAST 500,000 – 100,000 YEARS TO ICE AGE: SAPIENS, NEANDERTHALS & AMERICAS
  // ===========================================================================
  {
    id: 'sapiens-neanderthals-500k',
    index: 14,
    chapterId: 'sapiens-iceage',
    sceneType: 'sapiensNeanderthals',
    paleoMa: 0.35,
    tectonicStage: 'Middle Pleistocene (500,000 – 300,000 Years Ago)',
    icon: '🧠',
    eraBadge: '500,000 – 300,000 YEARS AGO',
    cosmicClock: '11:59:57.5 PM (Last 2.5 seconds before Midnight!)',
    title: 'The Human Family Tree: Neanderthals, Denisovans & Birth of Homo sapiens',
    subtitle: 'Multiple big-brained human species share the planet as Homo sapiens emerges in Africa (~300,000 YA)',
    themeColor: '#38bdf8',
    skyTint: [0.04, 0.08, 0.16],
    summary:
      'Zooming into the last 500,000 years, we were NOT the only humans on Earth! From common ancestor *Homo heidelbergensis*, populations in ice-age Europe and West Asia evolved into stocky, cold-adapted **Neanderthals** (*Homo neanderthalensis*) with large brains (~1,450 cm³), prominent brow ridges, and birch-tar hafted spears; eastern populations became **Denisovans**; while in Africa (~300,000 years ago, discovered at Jebel Irhoud, Morocco), our own species — ***Homo sapiens*** — evolved a high rounded skull, prominent chin, slender frame, and complex symbolic minds!',
    stats: [
      { label: 'Time Window', value: '500,000 – 300,000 Years Ago' },
      { label: 'Cousin Species', value: 'Neanderthals, Denisovans, H. floresiensis' },
      { label: 'Oldest Homo sapiens', value: '~315,000 YA (Jebel Irhoud, Morocco)' },
      { label: 'Brain Volume', value: '1,350 – 1,450 cm³ (Modern Scale)' },
    ],
    facts: [
      'Neanderthals were NOT clumsy cavemen: they distilled birch-bark tar glue at 350 °C to attach stone spearpoints to wooden shafts, cared for injured elders, and buried their dead!',
      'At Schöningen in Germany, archaeologists found 300,000-year-old spruce throwing spears balanced like modern Olympic javelins.',
      'Unlike Neanderthals’ elongated football-shaped skulls and heavy brow ridges, *Homo sapiens* evolved a globular (round) braincase with an expanded parietal and prefrontal cortex.',
    ],
    whatIf: {
      question: 'Compare 3D Cranial & Skeletal Anatomy: Neanderthal vs. Homo sapiens!',
      buttonLabel: '🔍 Toggle 3D Neanderthal vs. Sapiens Comparison',
      activeLabel: '🧬 Cranial Scan Active: Robust Brow & Barrel Chest vs. Globular Sapiens Skull!',
      explanation:
        'Neanderthals evolved a wide ribcage and large nasal cavities to warm freezing air, whereas Homo sapiens evolved a lighter frame and vast long-distance social trade networks.',
    },
  },
  {
    id: 'out-of-africa-100k',
    index: 15,
    chapterId: 'sapiens-iceage',
    sceneType: 'caveArtOutAfrica',
    paleoMa: 0.06,
    tectonicStage: 'Late Pleistocene (100,000 – 40,000 Years Ago)',
    icon: '🎨',
    eraBadge: '100,000 – 40,000 YEARS AGO',
    cosmicClock: '11:59:59.5 PM (Last half-second before Midnight!)',
    title: '100,000–40,000 YA: Out of Africa, Meeting Neanderthals & Cave Art Masterpieces',
    subtitle: 'Homo sapiens migrates across continents, interbreeds with Neanderthals & paints Lascaux/Sulawesi caves',
    themeColor: '#ec4899',
    skyTint: [0.08, 0.04, 0.12],
    summary:
      'Between 100,000 and 60,000 years ago, waves of *Homo sapiens* hunter-gatherers expanded out of Africa across the Sinai and Bab-el-Mandeb straits into Eurasia, and even built seaworthy watercraft to reach Australia by ~65,000 YA! Along the way, *Homo sapiens* met and interbred with Neanderthals and Denisovans. Human culture exploded with sewn hide clothing (bone needles), bow-and-arrow / spear-throwers (atlatls), 40,000-year-old vulture-bone flutes, carved ivory figurines, and breathtaking ochre paintings of horses, lions, and hand stencils inside Sulawesi, Chauvet, and Lascaux caves!',
    stats: [
      { label: 'Time Window', value: '100,000 – 40,000 Years Ago' },
      { label: 'Genetic Legacy', value: '1–2% Neanderthal DNA in Non-Africans' },
      { label: 'Australia Reached', value: '~65,000 YA (First Open-Sea Crossing!)' },
      { label: 'Symbolic Art', value: 'Blombos Ochre, Bone Flutes, Cave Murals' },
    ],
    facts: [
      'Most people outside sub-Saharan Africa today carry 1.5% to 2% Neanderthal DNA, and Tibetan populations inherited a high-altitude breathing gene (EPAS1) from Denisovans!',
      'By flickering tallow-lamp light inside Chauvet Cave (36,000 YA), artists drew multiple overlapping legs on running bison and horses — creating the world’s first " flipbook animation"!',
      'Neanderthals went extinct around 40,000 years ago, leaving *Homo sapiens* as the sole surviving human species on Earth.',
    ],
    whatIf: {
      question: 'Illuminate the Prehistoric Cave Wall with Tallow Torchlight & Hand Stencils!',
      buttonLabel: '🔦 Flicker Cave Torch & Reveal Ochre Art',
      activeLabel: '🖐️ Cave Wall Illuminated: 40,000-Year-Old Ochre Horses & Hand Stencils!',
      explanation:
        'Using red hematite, yellow limonite, and black charcoal, Ice Age hunter-gatherers left their handprints on stone — reaching across 40 millennia to wave hello to us!',
    },
  },
  {
    id: 'beringia-americas',
    index: 16,
    chapterId: 'sapiens-iceage',
    sceneType: 'beringiaAmericas',
    paleoMa: 0.02,
    tectonicStage: 'Last Glacial Maximum: Sea Levels -120m Expose Beringia Land Bridge',
    icon: '🦣',
    eraBadge: '30,000 – 14,000 YEARS AGO',
    cosmicClock: '11:59:59.85 PM',
    title: 'Ice Age Hunters, Woolly Mammoths & Crossing Beringia to the Americas',
    subtitle: 'Glaciers lock up the seas by 120 meters, opening the Beringia bridge & Kelp Highway into North and South America',
    themeColor: '#38bdf8',
    skyTint: [0.03, 0.09, 0.18],
    summary:
      'During the Last Glacial Maximum (~26,000–19,000 years ago), 3-kilometer-thick ice sheets covered Canada and northern Europe, sucking up so much ocean water that global sea levels dropped 120 meters! That exposed **Beringia** — a 1,600-km-wide grassy steppe connecting Siberia (Asia) to Alaska (North America). Hardy hunter-gatherer families — accompanied by newly domesticated wolves (the first dogs!) — tracked Woolly Mammoths, giant bison, and caribou across Beringia and paddled skin boats down the Pacific "Kelp Highway", populating all of North, Central, and South America down to Patagonia by 14,500 YA!',
    stats: [
      { label: 'Time Window', value: '30,000 – 14,000 Years Ago' },
      { label: 'Sea-Level Drop', value: '-120 Meters (Beringia Land Bridge Open)' },
      { label: 'First Animal Ally', value: 'Domesticated Dogs (~25,000+ YA)' },
      { label: 'Americas Route', value: 'Beringia Steppe + Pacific Kelp Highway' },
    ],
    facts: [
      'Fossilized human footprints at White Sands, New Mexico date to ~21,000–23,000 years ago — showing children and teenagers walking beside giant ground sloths and mammoths!',
      'On the treeless tundra, Ice Age hunters built insulated dome houses framed out of interlocking Woolly Mammoth tusks and jawbones covered in hides.',
      'As the glaciers rapidly melted ~11,700 years ago, rising seas flooded the Bering Strait again — separating the Old World and the Americas for the next 11,000 years.',
    ],
    whatIf: {
      question: 'Raise & Lower Ice Age Sea Levels by 120 Meters across the Beringia Land Bridge!',
      buttonLabel: '🌊 Flood / Expose Beringia Land Bridge',
      activeLabel: '🗺️ Holocene Melt (+120m Sea Rise): Bering Strait Floods Between Asia & Alaska!',
      explanation:
        'Watch the water rise between Siberia and Alaska! When the Laurentide and Cordilleran ice sheets melted, global oceans rose 120 meters into today’s coastline.',
    },
  },

  // ===========================================================================
  // CHAPTER 6: FARMING, BRONZE AGE, GREECE & ROME (10,000 BCE – 476 CE)
  // ===========================================================================
  {
    id: 'farming-revolution',
    index: 17,
    chapterId: 'ancient-classical',
    sceneType: 'neolithicFarming',
    paleoMa: 0,
    tectonicStage: 'Holocene Interglacial (Modern Continents & Coastlines)',
    icon: '🌾',
    eraBadge: '10,000 – 4,000 BCE (NEOLITHIC ERA)',
    cosmicClock: '11:59:59.93 PM',
    title: 'From Hunting & Gathering to Farming, Villages, Pottery & The Wheel',
    subtitle: 'Humans domesticate wheat, rice, corn, and livestock, transforming nomadic bands into permanent towns',
    themeColor: '#84cc16',
    skyTint: [0.05, 0.12, 0.06],
    summary:
      'For 290,000 years, every *Homo sapiens* lived by hunting wild game and gathering wild plants. Then, as the Ice Age gave way to the warm, stable Holocene climate (~10,000 BCE), humans independently invented **Agriculture** in at least seven regions: wheat, barley, sheep, and cattle in the Fertile Crescent; rice in China’s Yangtze Valley; corn (maize), beans, and squash in Mesoamerica; and potatoes and llamas in the Andes! Permanent mud-brick villages (like Çatalhöyük and Jericho) arose alongside megalithic temples (Göbekli Tepe & Stonehenge), woven textiles, fired clay pottery, irrigation canals, and the potter’s/wagon **Wheel**!',
    stats: [
      { label: 'Era', value: '10,000 – 4,000 BCE (Neolithic)' },
      { label: 'Key Crops', value: 'Wheat, Rice, Maize (Corn), Potatoes' },
      { label: 'Population Jump', value: '~5 Million → 50 Million Globally' },
      { label: 'Inventions', value: 'Farming, Irrigation, Pottery, Wheel, Loom' },
    ],
    facts: [
      'Göbekli Tepe in Turkey (built ~9,500 BCE by hunter-gatherers transitioning to farming) features 16-ton carved T-shaped limestone pillars — 7,000 years older than Stonehenge!',
      'Wild teosinte grass in Mexico had tiny hard kernels only 2 cm long; Indigenous Mesoamerican farmers selectively bred it over millennia into modern golden ears of corn (maize).',
      'Storing surplus grain in clay jars meant not everyone had to hunt for food every day — giving birth to specialized potters, smiths, builders, and astronomers!',
    ],
    whatIf: {
      question: 'Open the River Irrigation Floodgates to turn Arid Plains into Harvest Fields!',
      buttonLabel: '💧 Open Irrigation Canals & Spin Wheel',
      activeLabel: '🌾 Harvest Surplus Active: Irrigated Grain Fields & Spinning Wagon Wheels!',
      explanation:
        'By digging irrigation channels from rivers like the Euphrates and Nile, early farmers grew 10× more food per hectare, fueling the rise of the first cities.',
    },
  },
  {
    id: 'bronze-age-pyramids',
    index: 18,
    chapterId: 'ancient-classical',
    sceneType: 'bronzeAgePyramids',
    paleoMa: 0,
    tectonicStage: 'Modern Continents (River-Valley Civilizations)',
    icon: '🏺',
    eraBadge: '3,300 – 1,200 BCE (THE BRONZE AGE)',
    cosmicClock: '11:59:59.96 PM',
    title: 'The Bronze Age: Metallurgy, Writing, Mesopotamia & Great Pyramids',
    subtitle: 'Alloying copper with tin sparks the first metal age alongside Sumerian cuneiform and Egyptian pyramids',
    themeColor: '#eab308',
    skyTint: [0.14, 0.08, 0.02],
    summary:
      'Around 3,300 BCE, metallurgists discovered a game-changing chemical recipe: melting 90% Copper with 10% Tin at 1,000 °C creates **Bronze** — a golden metal far harder and sharper than pure copper or stone! Because tin and copper rarely occur in the same place, the Bronze Age launched long-distance maritime trade networks. In Sumer (Mesopotamia), scribes pressed wedge-shaped **Cuneiform** writing into clay tablets and wrote the first laws (Code of Hammurabi); in Egypt, pharaohs raised the 146-meter **Great Pyramid of Giza**; in South Asia, the Indus Valley built Mohenjo-Daro with indoor plumbing; and in China, the Shang Dynasty cast intricate bronze ritual vessels and oracle bones!',
    stats: [
      { label: 'Era', value: '3,300 – 1,200 BCE (Bronze Age)' },
      { label: 'Bronze Alloy', value: '88% Copper + 12% Tin (Smelted at 1,050 °C)' },
      { label: 'First Writing', value: 'Sumerian Cuneiform & Egyptian Hieroglyphs' },
      { label: 'Cradles of Civ', value: 'Mesopotamia, Egypt, Indus, Shang, Caral/Olmec' },
    ],
    facts: [
      'Writing was invented in Uruk (Mesopotamia) ~3,200 BCE not for poetry, but for accounting — tracking sacks of barley, jars of beer, and shipments of copper and wool!',
      'The Great Pyramid of Khufu (2,560 BCE) was built from 2.3 million limestone and granite blocks and remained the tallest human-made structure on Earth for 3,800 years.',
      'Around 1,200 BCE, droughts, earthquakes, and disrupted tin trade routes triggered the "Late Bronze Age Collapse", paving the way for the Iron Age.',
    ],
    whatIf: {
      question: 'Pour Molten Bronze (Copper + Tin) from the Crucible & Align the Pyramid Capstone!',
      buttonLabel: '🔥 Cast Molten Bronze & Light Capstone',
      activeLabel: '⚔️ Bronze Forge Glowing: 1,050 °C Alloy Cast & Electrum Pyramidion Lit!',
      explanation:
        'Alloying soft copper with tin locks the crystal lattice so atoms cannot slide easily, creating durable plowshares, chisels, chariots, and blades!',
    },
  },
  {
    id: 'classical-greece',
    index: 19,
    chapterId: 'ancient-classical',
    sceneType: 'classicalGreece',
    paleoMa: 0,
    tectonicStage: 'Mediterranean Archipelago & Aegean Sea',
    icon: '🏛️',
    eraBadge: '800 – 146 BCE (CLASSICAL & HELLENISTIC GREECE)',
    cosmicClock: '11:59:59.982 PM',
    title: 'Ancient Greece: Democracy, Philosophy, Geometry & The Parthenon',
    subtitle: 'Athens and Alexandria pioneer citizen democracy, theatre, Euclidean geometry, and the Antikythera gear computer',
    themeColor: '#38bdf8',
    skyTint: [0.03, 0.1, 0.18],
    summary:
      'Across the sunlit islands and peninsulas of the Aegean Sea, independent Greek city-states (*poleis*) sparked an intellectual explosion! In 508 BCE, Athens introduced **Demokratia** (rule by citizens voting in the assembly). Sculptors and architects raised the marble **Parthenon** atop the Acropolis using golden-ratio proportions; Socrates, Plato, and Aristotle laid foundations of Western philosophy and biology; Hippocrates separated medicine from superstition; Euclid and Archimedes revolutionized geometry and levers; Eratosthenes calculated the circumference of the spherical Earth to within 2% using shadows in Egypt; and Hellenistic engineers built the **Antikythera Mechanism** — a 30+ bronze-gear analog astronomical computer!',
    stats: [
      { label: 'Era', value: '800 – 146 BCE (Archaic to Hellenistic)' },
      { label: 'Key Breakthroughs', value: 'Democracy, Logic, Geometry, Drama, Olympics' },
      { label: 'Earth Measurement', value: 'Eratosthenes (~240 BCE): ~40,000 km!' },
      { label: 'Ancient Computer', value: 'Antikythera Mechanism (Bronze Gears)' },
    ],
    facts: [
      'More than 1,700 years before Columbus sailed, the Greek astronomer Eratosthenes measured the angle of midday shadows in Alexandria and Syene to calculate the size of the round Earth!',
      'Recovered from an ancient shipwreck, the Antikythera Mechanism (~150 BCE) used differential bronze gears to predict solar/lunar eclipses and the dates of the Olympic Games.',
      'The Parthenon’s Doric marble columns are subtly curved (entasis) so that from a distance the human eye perceives them as perfectly straight.',
    ],
    whatIf: {
      question: 'Spin the Bronze Gears of the Antikythera Astronomical Computer & Restore the Parthenon’s Polychrome Colors!',
      buttonLabel: '⚙️ Engage Antikythera Gears & Temple Glow',
      activeLabel: '🌟 Hellenistic Science Active: Bronze Epicyclic Gears & Marble Temple Lit!',
      explanation:
        'Ancient Greek temples were not plain white — they were painted in vivid blues, reds, and gold leaf while scholars in Alexandria mapped the stars!',
    },
  },
  {
    id: 'roman-empire',
    index: 20,
    chapterId: 'ancient-classical',
    sceneType: 'romanEmpire',
    paleoMa: 0,
    tectonicStage: 'Mediterranean Basin (Mare Nostrum) & Eurasian Silk Road',
    icon: '🦅',
    eraBadge: '27 BCE – 476 CE (ROMAN EMPIRE & SILK ROAD)',
    cosmicClock: '11:59:59.987 PM',
    title: 'The Roman Empire & Silk Road: Colosseum, Aqueducts & Global Trade',
    subtitle: 'Volcanic concrete arches, 80,000 km of paved roads, legal codes, and Silk Road caravans to Han China',
    themeColor: '#dc2626',
    skyTint: [0.12, 0.05, 0.04],
    summary:
      'Starting as a small republic on the Tiber River, **Rome** grew into a superpower spanning from Scotland to Iraq, uniting 60+ million people around the Mediterranean! Roman engineers mastered the round stone **Arch**, the barrel vault, and self-healing **Volcanic Concrete** (*opus caementicium*) — building the 50,000-seat **Colosseum**, the unreinforced dome of the **Pantheon**, multi-tiered **Aqueducts** delivering millions of gallons of fresh mountain water daily to public baths and fountains, and 80,000 km of stone-paved highways. At the same time, the **Silk Road** linked Rome, Parthia, Kushan India, and **Han Dynasty China** (which invented paper, seismographs, and cast iron)!',
    stats: [
      { label: 'Era', value: '509 BCE (Republic) – 476 CE (Western Fall)' },
      { label: 'Engineering Tech', value: 'Concrete Domes, Aqueduct Arches, Paved Roads' },
      { label: 'Population (Peak)', value: '~65 Million (Rome + ~60M in Han China)' },
      { label: 'Civic Legacy', value: 'Roman Law, Latin Alphabet, Julian Calendar' },
    ],
    facts: [
      'Roman concrete lasted 2,000 years underwater because engineers mixed volcanic ash (pozzolana) with quicklime — when seawater seeps in, it grows new interlocking mineral crystals that heal cracks!',
      'Rome’s 11 aqueducts flowed entirely by gravity at a precise downward slope of just 34 cm per kilometer across valleys and tunnels.',
      'While Rome ruled the Mediterranean, the Eastern Roman (Byzantine) Empire in Constantinople endured for another 1,000 years until 1453 CE!',
    ],
    whatIf: {
      question: 'Flow Mountain Water Across the Roman Aqueduct Arches into the Colosseum Arena!',
      buttonLabel: '🌊 Activate Aqueduct Flow & Naumachia',
      activeLabel: '🏛️ Hydraulic Engineering Active: Aqueduct Channels & Arena Illuminated!',
      explanation:
        'Early in the Colosseum’s history, engineers could flood the arena floor via underground aqueduct channels to stage miniature naval battles (naumachiae)!',
    },
  },

  // ===========================================================================
  // CHAPTER 7: MEDIEVAL AGES, RENAISSANCE & INDUSTRIAL REVOLUTIONS (500 – 1920 CE)
  // ===========================================================================
  {
    id: 'medieval-renaissance',
    index: 21,
    chapterId: 'medieval-industrial',
    sceneType: 'medievalAges',
    paleoMa: 0,
    tectonicStage: 'Global Maritime Routes & Old-New World Columbian Exchange (1492)',
    icon: '🏰',
    eraBadge: '500 – 1500 CE (MEDIEVAL AGES TO RENAISSANCE)',
    cosmicClock: '11:59:59.992 PM',
    title: 'Medieval Ages: Castles, Cathedrals, Islamic Golden Age & Printing Press',
    subtitle: 'Gothic flying buttresses, Baghdad’s House of Wisdom algebra & astrolabes, Song compasses, and Gutenberg’s press',
    themeColor: '#f59e0b',
    skyTint: [0.06, 0.05, 0.14],
    summary:
      'Far from being "dark", the Medieval millennium (500–1500 CE) transformed global technology! In Europe, stone **Concentric Castles**, mechanical weight-driven clock towers, eyeglasses, universities (Bologna, Oxford, Paris), and soaring **Gothic Cathedrals** with stained-glass rose windows rose across the landscape. In Baghdad, Cairo, and Córdoba, the **Islamic Golden Age** invented **Algebra** (Al-Khwarizmi), modern optics (Ibn al-Haytham), hospitals, and precision brass **Astrolabes**. In **Tang & Song China**, inventors created woodblock printing, gunpowder, paper money, and the magnetic **Mariner’s Compass**; in the Americas, the **Maya, Aztec (Tenochtitlan) & Inca (Machu Picchu)** built astronomical pyramids and suspension bridges. Then in 1450, Johannes Gutenberg’s **Movable-Type Printing Press** ignited the Renaissance and Scientific Revolution!',
    stats: [
      { label: 'Era', value: '500 – 1500 CE (Middle Ages & Renaissance)' },
      { label: 'Math & Science', value: 'Algebra, Arabic Numerals (0–9), Optics' },
      { label: 'Navigation Tech', value: 'Magnetic Compass, Astrolabe, Caravel Ships' },
      { label: 'Information Leap', value: 'Gutenberg Printing Press (~1450 CE)' },
    ],
    facts: [
      'The numbers 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 you use in math class every day originated in India and were transmitted to the world by 9th-century scholar Al-Khwarizmi (whose name gave us the word "Algorithm")!',
      'Before Gutenberg’s printing press in 1450, copying a single book by hand on parchment took a monk months; within 50 years, over 20 MILLION books were printed across Europe!',
      'After 1492, oceanic voyages reconnected the Americas and Afro-Eurasia for the first time since the Beringia land bridge flooded — introducing tomatoes, potatoes, and cacao to the rest of the world.',
    ],
    whatIf: {
      question: 'Spin the Brass Astrolabe Star-Disk & Stamp the Gutenberg Printing Press!',
      buttonLabel: '📖 Run Printing Press & Astrolabe!',
      activeLabel: '✨ Knowledge Revolution: Printed Books, Astrolabe & Rose Window Glowing!',
      explanation:
        'Cheap printed books meant scientific discoveries by Copernicus, Galileo, and Vesalius could be shared with thousands of readers overnight!',
    },
  },
  {
    id: 'first-industrial-rev',
    index: 22,
    chapterId: 'medieval-industrial',
    sceneType: 'steamIndustrial',
    paleoMa: 0,
    tectonicStage: 'Anthropocene Dawn (Coal & Iron Industrialization)',
    icon: '🚂',
    eraBadge: '1760 – 1840 CE (FIRST INDUSTRIAL REVOLUTION)',
    cosmicClock: '11:59:59.9985 PM',
    title: 'First Industrial Revolution: Steam Engines, Iron Railways & Factories',
    subtitle: 'James Watt’s steam condenser unlocks ancient Carboniferous coal energy to power locomotives and mills',
    themeColor: '#f43f5e',
    skyTint: [0.1, 0.06, 0.05],
    summary:
      'For all of prior history, human work was limited by muscle power (humans, horses, oxen), wind sails, and waterwheels. Then in the 1760s–1780s in Britain, **James Watt** radically improved the **Steam Engine** with a separate condenser and rotary flywheel! By burning coal (those ancient 300-million-year-old Carboniferous swamp trees!), steam engines pumped mines dry, drove mechanized spinning jennies and power looms in textile factories, smelted cast iron in blast furnaces, and powered **George Stephenson’s "Rocket" Steam Locomotive (1829)** and ocean steamships — shrinking days of travel into hours!',
    stats: [
      { label: 'Era', value: '1760 – 1840 CE (1st Industrial Rev)' },
      { label: 'Prime Mover', value: 'High-Pressure Coal Steam Engine' },
      { label: 'Railroad Milestone', value: '1825–1830 First Public Steam Railways' },
      { label: 'Atmospheric CO₂', value: '280 ppm (Pre-Industrial Baseline)' },
    ],
    facts: [
      'Before steam trains, the fastest any human had ever traveled on land in 300,000 years was the speed of a galloping horse (~45 km/h); within a few decades, steam locomotives topped 100 km/h!',
      'Coal burned in steam engines was literally sunlight captured by giant fern-trees during the Carboniferous Period 300 million years earlier.',
      'Standardized time zones were invented because railway schedules required every town along the tracks to agree on the exact same clock minute!',
    ],
    whatIf: {
      question: 'Feed Coal into the Boiler to Drive the Steam Piston, Flywheel & Locomotive Wheels!',
      buttonLabel: '🚂 Full Steam Ahead (Boost Boiler Pressure!)',
      activeLabel: '💨 High-Pressure Steam Active: Pistons Pumping & Flywheel at Full RPM!',
      explanation:
        'Expanding water into steam increases its volume 1,600 times — pushing the steel piston back and forth to turn the driving wheels!',
    },
  },
  {
    id: 'second-industrial-rev',
    index: 23,
    chapterId: 'medieval-industrial',
    sceneType: 'electricityFlight',
    paleoMa: 0,
    tectonicStage: 'Global Telegraph Cables, Panama/Suez Canals & Electrification',
    icon: '💡',
    eraBadge: '1870 – 1920 CE (SECOND INDUSTRIAL REVOLUTION)',
    cosmicClock: '11:59:59.9991 PM',
    title: 'Second Industrial Revolution: Electricity, Lightbulbs, Cars & First Flight',
    subtitle: 'Bessemer steel skyscrapers, Edison & Tesla electric grids, telephones, assembly-line cars, and the 1903 Wright Flyer',
    themeColor: '#fbbf24',
    skyTint: [0.04, 0.08, 0.16],
    summary:
      'Between 1870 and 1920, an avalanche of breakthroughs created the modern technological world in a single human lifetime! The **Bessemer Process** mass-produced cheap, strong steel for suspension bridges and skyscrapers; **Michael Faraday, Thomas Edison, and Nikola Tesla** harnessed **Electricity**, lighting up the night with incandescent bulbs (1879) and AC power grids; the **Telegraph, Telephone (1876), and Radio** transmitted voices at the speed of light; **Internal Combustion Engines** and Henry Ford’s assembly line put millions of automobiles on roads; Louis Pasteur and Marie Curie transformed medicine and physics; and on December 17, 1903 at Kitty Hawk, the **Wright Brothers** achieved powered, controlled airplane flight!',
    stats: [
      { label: 'Era', value: '1870 – 1920 CE (Age of Steel & Electricity)' },
      { label: 'Key Inventions', value: 'Lightbulb, AC Grid, Telephone, Radio, Car' },
      { label: 'First Airplane', value: 'Dec 17, 1903 (Wright Flyer: 12 sec, 36 m)' },
      { label: 'Medical Leap', value: 'Germ Theory, Vaccines, X-Rays, Antiseptics' },
    ],
    facts: [
      'Orville Wright — who flew the first wood-and-fabric biplane 36 meters in 1903 — lived long enough to see supersonic jet aircraft break the sound barrier in 1947!',
      'Before undersea telegraph cables were laid across the Atlantic in 1866, sending a message from New York to London took 10 days by ship; the telegraph did it in minutes.',
      'The Haber-Bosch process (1909) learned to pull nitrogen fertilizer straight out of the air, feeding billions of people today.',
    ],
    whatIf: {
      question: 'Energize the Tesla/Edison Power Grid & Fly the 1903 Wright Brothers Biplane!',
      buttonLabel: '⚡ Energize Tungsten Bulb & Launch Wright Flyer',
      activeLabel: '💡 2,700K Filament Glowing & Wright Flyer Banking in 3D!',
      explanation:
        'Passing electric current through a high-resistance filament in a vacuum bulb heats it to 2,700 Kelvin — banishing darkness from human cities!',
    },
  },

  // ===========================================================================
  // CHAPTER 8: COMPUTERS, MOON LANDING, IPHONE & AI TODAY (1945 – 2026 CE)
  // ===========================================================================
  {
    id: 'computers-moon',
    index: 24,
    chapterId: 'digital-ai',
    sceneType: 'computersMoon',
    paleoMa: 0,
    tectonicStage: 'Plate Tectonics Confirmed (1960s Seafloor Spreading) & Lunar Exploration',
    icon: '🌕',
    eraBadge: '1945 – 1969 CE (COMPUTERS, DNA & APOLLO 11)',
    cosmicClock: '11:59:59.9996 PM',
    title: 'First Electronic Computers, Silicon Microchips & Apollo 11 Moon Landing',
    subtitle: 'From Alan Turing & ENIAC vacuum tubes to silicon integrated circuits and Neil Armstrong stepping onto the Moon',
    themeColor: '#38bdf8',
    skyTint: [0.02, 0.04, 0.12],
    summary:
      'In the mid-20th century, humanity unlocked three fundamental codes at once: the **Atom**, the **DNA Double Helix** (1953), and the **Binary Bit (0 and 1)**! Early room-sized electronic computers like Colossus and **ENIAC (1945)** used 18,000 hot vacuum tubes, until Bell Labs invented the **Transistor (1947)** and Jack Kilby & Robert Noyce etched whole **Integrated Circuit Microchips** onto silicon wafers (1958–59). Powered by miniature silicon logic chips inside the Apollo Guidance Computer, Saturn V launched **Apollo 11**, and on **July 20, 1969**, Neil Armstrong and Buzz Aldrin became the first beings from Earth in 3.8 billion years to walk on another world!',
    stats: [
      { label: 'Era', value: '1945 (ENIAC) – 1969 (Apollo 11 Moon Landing)' },
      { label: '1947 Breakthrough', value: 'The Silicon Transistor (Bell Labs)' },
      { label: 'Apollo Computer', value: '4 KB RAM, 72 KB ROM (Integrated Circuits)' },
      { label: 'Geology Discovery', value: '1965: Plate Tectonics Officially Proven!' },
    ],
    facts: [
      'Fun fact about Pangaea: Alfred Wegener proposed Continental Drift in 1912, but geologists didn’t prove HOW continents move until the 1960s when sonar mapped mid-ocean ridges and magnetic seafloor stripes!',
      'Margaret Hamilton led the MIT software engineering team that wrote the fault-tolerant flight code for the Apollo Lunar Module.',
      'A single modern USB-C charger plug has more computing power than the Apollo 11 spacecraft that landed humans on the Moon!',
    ],
    whatIf: {
      question: 'Pulse the Silicon Microchip Logic Gates & Beam Apollo 11 Laser Telemetry to Earth!',
      buttonLabel: '🛰️ Pulse Silicon Chip & Lunar Laser Beam',
      activeLabel: '📡 Binary 1s & 0s Clocking + 1.28-Sec Light-Speed Moon Telemetry!',
      explanation:
        'Apollo 11 astronauts placed a mirror (retroreflector) on the Moon that scientists still bounce lasers off today — measuring the Moon drifting 3.8 cm farther from Earth each year!',
    },
  },
  {
    id: 'pc-internet-iphone',
    index: 25,
    chapterId: 'digital-ai',
    sceneType: 'internetIphone',
    paleoMa: 0,
    tectonicStage: 'Global Undersea Fiber-Optic & GPS Satellite Mesh',
    icon: '📱',
    eraBadge: '1975 – 2007 CE (PCs, INTERNET & THE IPHONE)',
    cosmicClock: '11:59:59.9999 PM',
    title: 'Personal Computers, The World Wide Web & The iPhone Revolution (2007)',
    subtitle: 'Moore’s Law packs billions of transistors into desktop PCs, fiber-optic Internet, and multi-touch smartphones',
    themeColor: '#a855f7',
    skyTint: [0.04, 0.03, 0.14],
    summary:
      'As **Moore’s Law** doubled the number of microscopic transistors on a silicon chip every two years, room-sized mainframes shrank onto desks with the **Personal Computer** (Apple II, IBM PC, Macintosh) in the 1970s–80s. In 1989–1991, Tim Berners-Lee at CERN invented the **World Wide Web (HTTP & HTML)** over the TCP/IP Internet, connecting humanity via undersea glass fiber-optic cables! Then in **January 2007**, Steve Jobs and Apple unveiled the **iPhone** — combining a capacitive multi-touch glass screen, mobile web browser, GPS, camera, and App Store ecosystem to put a connected supercomputer into billions of pockets worldwide!',
    stats: [
      { label: 'Era', value: '1975 (PC) → 1991 (Web) → 2007 (iPhone)' },
      { label: 'Transistor Size', value: '10,000 nm (1971) → 3 nm (Today)' },
      { label: 'Global Web Users', value: '0 (1990) → 5.5+ Billion People' },
      { label: 'Pocket Supercomputer', value: '1,000,000× Faster than Apollo 11' },
    ],
    facts: [
      'Today’s smartphone processors pack over 19 BILLION transistors onto a fingernail-sized piece of silicon — with wires only ~15 silicon atoms wide!',
      '99% of international Internet data doesn’t travel by satellite — it flashes as laser pulses through 1.4 million km of hair-thin glass fibers on the ocean floor!',
      'Your phone’s GPS receiver uses Einstein’s Theory of General Relativity to correct atomic clocks on 24+ orbiting satellites so it can pinpoint you within 3 meters.',
    ],
    whatIf: {
      question: 'Wake the 3D Multi-Touch Smartphone Screen & Light Up the Subsea Fiber-Optic Web!',
      buttonLabel: '📱 Wake iPhone Display & Fiber Data Packets',
      activeLabel: '🌐 Multi-Touch App Grid Active & Light-Speed Fiber Packets Streaming!',
      explanation:
        'Look at the glowing 3D smartphone and desktop workstation: information that once took months by Silk Road caravan now crosses every continent in 60 milliseconds!',
    },
  },
  {
    id: 'ai-today-2026',
    index: 26,
    chapterId: 'digital-ai',
    sceneType: 'aiToday2026',
    paleoMa: 0,
    tectonicStage: 'Year 2026 CE — Present-Day Continents, Planetary Sensors & Leo Satellites',
    icon: '🤖',
    eraBadge: '2012 – 2026 CE — WHERE WE ARE TODAY!',
    cosmicClock: '12:00:00 MIDNIGHT (Present Moment!)',
    title: 'Today (2026): Generative AI, Neural Networks, Robotics, CRISPR & JWST',
    subtitle: 'Deep learning Transformers, AI coding/science assistants, humanoid robots, renewable grids & Reusable Rockets',
    themeColor: '#06b6d4',
    skyTint: [0.02, 0.07, 0.16],
    summary:
      'Welcome to **TODAY — Year 2026**! Over the last decade, computing shifted from hand-coded rules to **Artificial Intelligence & Deep Neural Networks**. Following the 2017 **Transformer** architecture breakthrough, Large Language and Multimodal Models learned to reason across text, code, voice, video, and 3D physics — while **AlphaFold** predicted the 3D shapes of all 200 million known proteins! At the same time, **CRISPR** gene editing cures inherited blood diseases, **Reusable Booster Rockets** catch themselves on launch towers, **James Webb (JWST)** peers back to the first galaxies, humanoid robots learn dexterous tasks, and utility-scale **Solar + Battery Grids** surge globally!',
    stats: [
      { label: 'Current Year', value: '2026 CE (You Are Here!)' },
      { label: 'AI Architecture', value: 'Transformers, Multimodal & Agentic AI' },
      { label: 'Bio Breakthrough', value: 'AlphaFold (200M Proteins) & CRISPR' },
      { label: 'Space & Energy', value: 'JWST, Reusable Boosters, Terawatt Solar' },
    ],
    facts: [
      'Think about the full circle: 3.8 billion years ago, RNA/DNA molecules folded proteins to build the first cells; in the 2020s, human brains built silicon neural networks (AlphaFold) to solve how every protein folds!',
      'If all 13.8 billion years of cosmic history were a 24-hour day, the entire AI revolution happened in the last 0.00001 seconds before midnight.',
      'Earth’s continents are STILL moving right now under your feet: the Atlantic Ocean widens by ~2.5 cm/year (as fast as your fingernails grow!).',
    ],
    whatIf: {
      question: 'Fire Synapses Across the 3D Transformer Neural Network & Switch NASA Earth to Night-Lights!',
      buttonLabel: '🧠 Fire AI Neural Attention Layers & Night Grid',
      activeLabel: '⚡ Multimodal AI Attention Active + Global Night-Light Cities Glowing!',
      explanation:
        'Watch the multi-layer 3D neural network pulse beside NASA Earth! Billions of parallel matrix multiplications connect concepts across science, language, and code.',
    },
  },

  // ===========================================================================
  // CHAPTER 9: TOMORROW TO YEAR 3000 (2050 CE – 3000 CE)
  // ===========================================================================
  {
    id: 'solarpunk-2050',
    index: 27,
    chapterId: 'future',
    sceneType: 'solarpunk2050',
    paleoMa: 0,
    tectonicStage: '2040–2075 CE: Climate Restoration & Net-Negative Carbon Biospheres',
    icon: '🌱',
    eraBadge: '2040 – 2075 CE (NEAR FUTURE)',
    cosmicClock: '+0.0001 Seconds Past Midnight',
    title: '2050s: Solarpunk Cities, Commercial Fusion Power & Quantum Discovery',
    subtitle: 'Magnetic tokamak fusion reactors, fault-tolerant quantum computers, and vertical-forest eco-cities',
    themeColor: '#10b981',
    skyTint: [0.02, 0.13, 0.11],
    summary:
      'Where can we go next? By the 2040s–2070s, humanity can combine **Commercial Nuclear Fusion** (fusing deuterium and tritium in high-temperature superconducting magnetic tokamaks) with ultra-efficient perovskite solar and solid-state batteries to produce abundant, zero-carbon energy. **Fault-Tolerant Quantum Computers** and AI simulate room-temperature superconductors and carbon-fixing enzymes; direct-air carbon capture and autonomous ocean-restoration fleets bring atmospheric CO₂ back down; and cities blossom into quiet, green **Solarpunk Arcologies**!',
    stats: [
      { label: 'Time Horizon', value: '2040 – 2075 CE' },
      { label: 'Core Power', value: 'Deuterium-Tritium Fusion + Space Solar' },
      { label: 'Compute Era', value: 'Logical Qubit Quantum + Photonic AI' },
      { label: 'Biosphere Goal', value: 'Rewilding 30%+ of Land & Coral Reefs' },
    ],
    facts: [
      'Fusion is the exact opposite of nuclear fission: it fuses light hydrogen isotopes into harmless helium gas — the same reaction that powers the core of the Sun!',
      'Quantum computers use quantum superposition and entanglement to model molecular chemistry that would take classical supercomputers millions of years.',
      'Synthetic biology could allow engineered street trees and building facades to absorb extra CO₂ and glow softly at night using bioluminescence.',
    ],
    whatIf: {
      question: 'Ignite the 100-Million-Degree Magnetic Fusion Plasma Torus in the Eco-City!',
      buttonLabel: '⚡ Ignite Tokamak Fusion Plasma!',
      activeLabel: '☀️ Fusion Ignition Achieved: Superconducting Plasma Ring at 150M °C!',
      explanation:
        'Powerful toroidal magnets suspend the glowing purple-gold hydrogen plasma in mid-air so it never touches the reactor walls while generating clean gigawatts!',
    },
  },
  {
    id: 'mars-2150',
    index: 28,
    chapterId: 'future',
    sceneType: 'marsColony2150',
    paleoMa: 0,
    tectonicStage: '2100–2250 CE: Multi-Planetary Civilization (Earth, Moon & Mars)',
    icon: '🔴',
    eraBadge: '2100 – 2250 CE (INTERPLANETARY ERA)',
    cosmicClock: '+0.0004 Seconds Past Midnight',
    title: '2150s: Moon Base Cities, Mars Terraforming Biodomes & Asteroid Mining',
    subtitle: 'Pressurized Martian forest domes, orbital space elevators, and heavy industry moved off-planet',
    themeColor: '#f97316',
    skyTint: [0.15, 0.04, 0.03],
    summary:
      'By the 22nd and 23rd centuries, life from Earth expands permanently across the inner Solar System! On the Moon, cities inside south-polar craters refine water ice and Helium-3, connected to lunar orbit by tether elevators. On **Mars**, pressurized geodesic **Biodomes** and radiation-shielded lava-tube cities house millions of citizens growing forests and crops in detoxified Martian regolith. Meanwhile, autonomous **Asteroid Mining** tugs harvest platinum, nickel, and iron from near-Earth asteroids — allowing Earth to become a protected garden planet!',
    stats: [
      { label: 'Time Horizon', value: '2100 – 2250 CE' },
      { label: 'Mars Gravity', value: '0.38 g (Jumpnearly 3× Higher!)' },
      { label: 'Planetary Shield', value: 'Mars-Sun L1 Magnetic Dipole Shield' },
      { label: 'Transit Speed', value: 'Fusion Plasma Rockets (Earth→Mars in 30 Days)' },
    ],
    facts: [
      'If a magnetic dipole shield is placed at the Mars-Sun L1 Lagrange point, Mars’s atmosphere stops being stripped by solar wind — allowing atmospheric pressure to thicken naturally!',
      'A single metallic asteroid like 16 Psyche or a 1-km near-Earth asteroid contains more iron, nickel, and cobalt than humanity has ever mined in all of history.',
      'Because Mars has no active plate tectonics like Earth, its volcanoes (like 21-km-tall Olympus Mons) piled lava in one spot for billions of years!',
    ],
    whatIf: {
      question: 'Deploy the Mars L1 Magnetic Shield & Fill Marineris Crater Lakes with Liquid Water!',
      buttonLabel: '🌿 Activate Mars Terraforming & Magnetosphere',
      activeLabel: '💧 Terraforming Phase Active: Blue Martian Seas & Magnetosphere Aurora!',
      explanation:
        'Look at the NASA Mars globe: warming polar ice caps and shielding the upper atmosphere restores ancient shorelines in the northern lowlands and Valles Marineris!',
    },
  },
  {
    id: 'year-3000',
    index: 29,
    chapterId: 'future',
    sceneType: 'year3000',
    paleoMa: 0,
    tectonicStage: 'Year 3000 CE (And Looking 250M Yrs Ahead to Supercontinent Pangaea Proxima!)',
    icon: '🚀',
    eraBadge: 'YEAR 2500 – 3000 CE (THE COSMIC FUTURE)',
    cosmicClock: '+0.0018 Seconds Past Midnight — With Billions of Years Ahead!',
    title: 'Year 3000: Dyson Swarms, O’Neill Star-Habitats & Interstellar Ark Ships',
    subtitle: 'Harvesting solar starlight to power rotating cylinder worlds and laser-sail starships bound for exoplanets',
    themeColor: '#a855f7',
    skyTint: [0.04, 0.02, 0.14],
    summary:
      'Welcome to **YEAR 3000**! A thousand years from today, humanity has blossomed into a solar-system-spanning civilization. Glittering constellations of solar-collector rings (**a Dyson Swarm**) orbit the Sun, beaming clean terawatts of energy to rotating **O’Neill Cylinder Habitats** — 30-km-long artificial worlds spinning for 1g gravity with rivers, clouds, and forests inside. And out beyond Neptune, kilometer-long **Interstellar Ark Starships** propelled by gigawatt laser light-sails and antimatter-catalyzed fusion engines accelerate to 20% the speed of light toward **Alpha Centauri**, **TRAPPIST-1**, and the 6,400+ exoplanets of the Milky Way!',
    stats: [
      { label: 'Time Horizon', value: 'Year 3000 CE' },
      { label: 'Civilization Scale', value: 'Kardashev Type I → Type II Transition' },
      { label: 'Starship Velocity', value: '0.20 c (60,000 km/s → Alpha Cen in 21 Yrs)' },
      { label: 'Future Continents', value: '+250M Yrs Ahead: Pangaea Proxima!' },
    ],
    facts: [
      'Bonus Tectonic Fact: Because Earth’s continents never stop drifting, geologists calculate that 250 million years in the future, the Atlantic Ocean will close back up and all continents will merge into a NEW supercontinent called **Pangaea Proxima** (or Amasia)!',
      'Earth still has roughly 1 BILLION years of habitable sunlight ahead — nearly 2 full hours on our 24-hour Cosmic Clock!',
      'Every invention in this timeline — from taming fire and planting seeds to the printing press, steam engine, computer, and AI — was built by curious people asking "What if?"',
    ],
    whatIf: {
      question: 'Engage the Dyson Swarm Laser Array & Accelerate the Interstellar Ark to 20% Light Speed!',
      buttonLabel: '🚀 Engage Relativistic Laser-Sail Star Drive!',
      activeLabel: '🌟 Relativistic Drive Active: Dyson Beams Propelling Ark Ship to the Stars!',
      explanation:
        'Focused light-beams from the Dyson Swarm push the ultra-light metamaterial sail without the ship needing to carry heavy chemical fuel across interstellar space!',
    },
  },
];

export const QUIZ_QUESTIONS = [
  {
    q: 'What was the name of the giant C-shaped supercontinent 252 million years ago where all of today’s continents were locked together?',
    options: [
      'Atlantis',
      'Pangaea ("All-Earth")',
      'Gondwana Minor',
      'Beringia',
    ],
    correct: 1,
    explanation:
      'Pangaea assembled ~300–250 million years ago before rifting into Laurasia (north) and Gondwana (south) during the Jurassic!',
  },
  {
    q: 'How were the Himalaya Mountains and Mount Everest created ~50–35 million years ago?',
    options: [
      'A giant asteroid piled up rocks in Asia',
      'The fast-moving Indian continental plate crashed head-on into Eurasia, crumpling the ancient Tethys seafloor skyward!',
      'Ice Age glaciers carved them out of sand',
      'Dinosaurs built them',
    ],
    correct: 1,
    explanation:
      'India sprinted north after breaking off Gondwana and collided with Asia — which is why marine seashell fossils are found at the top of Mount Everest!',
  },
  {
    q: 'Which trait evolved FIRST in early human ancestors like "Lucy" (Australopithecus afarensis, 3.2 MYA)?',
    options: [
      'Walking upright on two legs (bipedalism) — millions of years BEFORE giant brains!',
      'Building bronze swords',
      'Writing on clay tablets',
      'Having a 1,400 cm³ modern-sized brain while still walking on all fours',
    ],
    correct: 0,
    explanation:
      'Fossils like Lucy and the 3.66-million-year-old Laetoli footprints prove our ancestors walked upright on two legs millions of years before brain size tripled!',
  },
  {
    q: 'Around 300,000–50,000 years ago, which cousin human species shared Eurasia with Homo sapiens, made birch-tar spears, and left 1–2% DNA in many people today?',
    options: [
      'Australopithecus',
      'Neanderthals (Homo neanderthalensis) & Denisovans',
      'Tiktaalik',
      'Plesiosaurs',
    ],
    correct: 1,
    explanation:
      'Neanderthals and Denisovans were intelligent, big-brained human cousins who lived alongside and interbred with Homo sapiens!',
  },
  {
    q: 'How did Ice Age hunter-gatherers travel from Siberia (Asia) into Alaska and populate North & South America ~25,000–15,000 years ago?',
    options: [
      'They sailed steamships across the Atlantic',
      'Mile-high glaciers lowered ocean levels by 120 meters, exposing the Beringia land bridge and Pacific Kelp Highway!',
      'Pangaea had not split apart yet',
      'They flew in hot-air balloons',
    ],
    correct: 1,
    explanation:
      'With so much water locked in Ice Age glaciers, sea levels dropped 120 meters — turning the Bering Strait into a 1,600-km-wide grassy bridge called Beringia!',
  },
  {
    q: 'In the Bronze Age (~3,300–1,200 BCE), which two metals were smelted together to create hard golden Bronze?',
    options: [
      'Gold and Silver',
      'Copper and Tin',
      'Aluminum and Titanium',
      'Silicon and Lithium',
    ],
    correct: 1,
    explanation:
      'Melting ~88% Copper with ~12% Tin creates Bronze — sparking long-distance trade networks across Mesopotamia, Egypt, the Indus Valley, and Shang China!',
  },
  {
    q: 'What was the Antikythera Mechanism, built in Ancient Greece around 150 BCE?',
    options: [
      'A marble statue of Zeus',
      'A 30+ bronze-gear analog astronomical computer that predicted eclipses and Olympic dates',
      'A coal-powered steam locomotive',
      'A medieval catapult',
    ],
    correct: 1,
    explanation:
      'Recovered from an ancient shipwreck off Greece, the Antikythera Mechanism used precision bronze gears to calculate the motions of the Sun, Moon, and planets!',
  },
  {
    q: 'How did the 1947 Silicon Transistor, the 1991 World Wide Web, and the 2007 iPhone lead to today’s AI revolution?',
    options: [
      'By replacing electricity with steam',
      'Moore’s Law shrunk billions of transistors onto microchips, connecting global data and powering multi-layer AI neural networks!',
      'By removing all satellites from orbit',
      'By slowing down computers',
    ],
    correct: 1,
    explanation:
      'Packing billions of microscopic transistors onto silicon chips enabled personal computers, smartphones, global internet data, and GPU/TPU neural networks!',
  },
];
