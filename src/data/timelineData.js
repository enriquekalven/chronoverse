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
      '13.8 billion years ago, all energy, space, and time expanded from an unimaginably dense quantum state. In the first 10⁻³² seconds (**Cosmic Inflation**, proposed by **Alan Guth**), space stretched exponentially. During the first 3 minutes (**Big Bang Nucleosynthesis**), protons and neutrons fused into 75% Hydrogen and 25% Helium nuclei. At **380,000 years** (**Recombination**), the cosmos cooled to 3,000 K so electrons bound to nuclei, releasing the **Cosmic Microwave Background (CMB)** — first predicted alongside the expanding universe by **Georges Lemaître** and **Edwin Hubble** (1927–29) and detected in 1965 by **Arno Penzias & Robert Wilson**!',
    stats: [
      { label: 'Age', value: '13.787 ± 0.020 Billion Yrs Ago' },
      { label: 'Recombination', value: '380,000 Yrs (3,000 K → 2.725 K CMB)' },
      { label: 'Key Pioneers', value: 'Lemaître, Hubble, Penzias & Wilson, Guth' },
      { label: 'First Nuclei', value: '75% Hydrogen, 25% Helium, Trace Li' },
    ],
    facts: [
      'Every single hydrogen atom in the water you drink today was forged in the first 3 minutes after the Big Bang.',
      'Belgian physicist Georges Lemaître first proposed the "Primeval Atom" expansion in 1927, soon confirmed by Edwin Hubble’s galaxy redshift measurements.',
      'Leftover photon heat from Recombination (380,000 years after the Big Bang) still fills all of space at 2.725 Kelvin, mapped to 1-part-in-100,000 acoustic precision by COBE, WMAP, and Planck.',
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
    tectonicStage: 'Galactic Nucleosynthesis & Reionization (Forging Rock Elements)',
    icon: '✨',
    eraBadge: '13.5 BILLION YEARS AGO',
    cosmicClock: '12:31 AM',
    title: 'First Hypergiant Stars, Supernovas & Spiral Proto-Galaxies',
    subtitle: 'Population III blue monster stars ignite fusion, end the Cosmic Dark Ages, and cook planet-building elements',
    themeColor: '#60a5fa',
    skyTint: [0.02, 0.04, 0.12],
    summary:
      'After ~200 million years of pitch-black Cosmic Dark Ages, dark-matter halos pulled pristine hydrogen and helium gas into colossal filaments (**Cosmic Dawn & Reionization**). Inside them ignited the first **Population III hypergiant stars** — scorching blue-white titans up to 300 solar masses! As **Cecilia Payne-Gaposchkin** (who proved stars are made of hydrogen/helium) and **Fred Hoyle, Margaret & Geoffrey Burbidge, and Willy Fowler (B²FH, 1957)** showed, stellar nucleosynthesis and core-collapse supernovas forged Carbon, Oxygen, Silicon, Magnesium, and Iron — while early supermassive black holes powered the first quasars.',
    stats: [
      { label: 'Age', value: '13.6 – 13.2 Billion Yrs Ago (z ≈ 15–10)' },
      { label: 'Star Mass', value: '100–300× Solar Mass (Pop III)' },
      { label: 'Key Pioneers', value: 'Payne-Gaposchkin, Hoyle (B²FH), Chandrasekhar' },
      { label: 'Elements Forged', value: 'Carbon, Oxygen, Silicon, Iron (Z > 2)' },
    ],
    facts: [
      'The iron in your red blood cells, the calcium in your bones, and the silicon in Earth’s granite continents were all cooked inside ancient stars and supernovas (Fred Hoyle’s stellar nucleosynthesis).',
      'NASA’s James Webb Space Telescope (JWST) has spectroscopically confirmed infant galaxies (such as JADES-GS-z14-0) shining just 290 million years after the Big Bang!',
      'Our Milky Way grew by merging with dozens of smaller dwarf proto-galaxies (such as Gaia-Enceladus) over billions of years.',
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
    tectonicStage: 'Hadean Magma Ocean → Theia Impact → First Zircon Crust',
    icon: '🌋',
    eraBadge: '4.54 BILLION YEARS AGO',
    cosmicClock: '4:06 PM (Two-thirds of the Cosmic Day is already over!)',
    title: 'Birth of Molten Earth & The Giant Theia Moon Crash',
    subtitle: 'A Mars-sized proto-planet slams into Hadean Earth, tilting our axis and forging the Moon',
    themeColor: '#ef4444',
    skyTint: [0.14, 0.03, 0.02],
    summary:
      '4.54 billion years ago (an age precisely measured via lead-uranium radiometric dating of meteorites by geochemist **Clair Patterson** in 1953), gravity pulled rocky planetesimals in the young Sun’s protoplanetary disk together into proto-Earth. Heavy iron and nickel sank to form Earth’s liquid geodynamo core (**Inge Lehmann** later discovered its solid inner core), while the surface was a 1,200 °C magma ocean! Around 4.51 BYA, a Mars-sized proto-planet named **Theia** (**William Hartmann, Donald Davis, Robin Canup**) oblique-struck Earth, vaporizing mantle rock into an incandescent ring that coalesced into our Moon and gave Earth its 23.5° axial tilt.',
    stats: [
      { label: 'Age', value: '4.54 Billion Yrs Ago (Clair Patterson)' },
      { label: 'Surface State', value: 'Hadean Magma Ocean (1,200 °C)' },
      { label: 'Day Length', value: 'Only ~5 Hours Long After Impact!' },
      { label: 'Oldest Evidence', value: '4.40 BYA Jack Hills Zircon Crystals' },
    ],
    facts: [
      'Tiny Jack Hills detrital zircon crystals from Western Australia are 4.40 billion years old — proving Earth cooled enough for continental crust and liquid water within ~140 million years!',
      'Right after the Theia Giant Impact, the Moon orbited just ~25,000 km away (15× closer than today) and raised kilometer-high magma and ocean tides.',
      'During the Late Heavy Bombardment (~4.1–3.8 BYA), volatile-rich carbonaceous asteroids and comets delivered vast oceans of water and prebiotic organic molecules.',
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
    tectonicStage: 'Archean Volcanic Protocontinents (Vaalbara / Ur / Pilbara)',
    icon: '🦠',
    eraBadge: '3.8 BILLION YEARS AGO',
    cosmicClock: '5:23 PM',
    title: 'First Organisms: Deep-Sea Hydrothermal Vents & LUCA',
    subtitle: 'Alkaline ocean chimneys spark the Last Universal Common Ancestor of Bacteria and Archaea',
    themeColor: '#10b981',
    skyTint: [0.01, 0.07, 0.08],
    summary:
      'While volcanic protocontinents (like Vaalbara and the Pilbara/Isua cratons) rose above iron-green Archean seas, prebiotic chemistry crossed the threshold into biology (**Abiogenesis**, explored by **Alexander Oparin, J.B.S. Haldane, Stanley Miller & Harold Urey**, and alkaline-vent biochemists **Michael Russell & Nick Lane**). Warm, hydrogen-rich water gushing from deep-sea alkaline hydrothermal vents created natural proton gradients across iron-sulfur mineral pores. Here emerged **LUCA** (Last Universal Common Ancestor) — splitting into the primary domains **Bacteria and Archaea** mapped by evolutionary microbiologist **Carl Woese**!',
    stats: [
      { label: 'Age', value: '3.8 – 3.5 Billion Yrs Ago (Eoarchean)' },
      { label: 'First Cratons', value: 'Isua (Greenland) & Pilbara (Australia)' },
      { label: 'Key Pioneers', value: 'Carl Woese, Miller & Urey, Nick Lane' },
      { label: 'Energy Source', value: 'Chemosynthesis (H₂ + CO₂ Proton Gradients)' },
    ],
    facts: [
      'Every living organism on Earth — bacteria, redwoods, dinosaurs, and humans — shares the universal genetic code, ribosome, and ATP synthase inherited from LUCA!',
      'In 1977, Carl Woese sequenced ribosomal RNA to discover Archaea — proving the Tree of Life first branched into Bacteria and Archaea at hydrothermal vents.',
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
    tectonicStage: 'Supercontinent Rodinia Breakup, Snowball Earth & Ediacaran Biota',
    icon: '🫧',
    eraBadge: '2.4 BILLION – 575 MILLION YEARS AGO',
    cosmicClock: '7:48 PM – 10:56 PM',
    title: 'Great Oxygenation, Eukaryote Endosymbiosis, Snowball Earth & Ediacaran Life',
    subtitle: 'Cyanobacteria oxygenate the sky, cells acquire mitochondria, global ice locks the equator, and first soft-bodied animals appear',
    themeColor: '#06b6d4',
    skyTint: [0.02, 0.09, 0.15],
    summary:
      'In shallow seas, blue-green **Cyanobacteria** built layered stromatolite reefs and mastered oxygenic photosynthesis — triggering the **Great Oxidation Event (2.4 BYA)**, precipitating Banded Iron Formations, and forming the ozone layer. Around **1.8 BYA**, as biologist **Lynn Margulis** demonstrated in her **Endosymbiotic Theory**, an archaeon host engulfed an alphaproteobacterium that became the **Mitochondrion**, birthing complex **Eukaryotic cells**! After supercontinent **Rodinia** rifted apart and plunged the planet into **Cryogenian Snowball Earth** glaciations (**Paul Hoffman, Joe Kirschvink**, 720–635 MYA), thawing seas gave rise to the enigmatic **Ediacaran Biota (575–541 MYA)** — soft-bodied quilted organisms like *Dickinsonia* and *Charnia* (**Reg Sprigg**)!',
    stats: [
      { label: 'Time Span', value: '2.4 BYA (GOE) → 720 MYA (Snowball) → 575 MYA (Ediacaran)' },
      { label: 'Cell Leap', value: 'Eukaryote Endosymbiosis (Lynn Margulis)' },
      { label: 'Key Pioneers', value: 'Lynn Margulis, Paul Hoffman, Reg Sprigg' },
      { label: 'First Macro-Life', value: 'Ediacaran Biota (Dickinsonia & Charnia)' },
    ],
    facts: [
      'Lynn Margulis proved that the mitochondria powering your cells (and the chloroplasts in plants) were once free-living bacteria with their own circular DNA!',
      'As Rodinia broke apart ~720 MYA, silicate weathering drew down CO₂ and locked Earth in Sturtian and Marinoan "Snowball Earth" ice sheets from pole to equator (Paul Hoffman).',
      'Before Cambrian shells and teeth evolved, the Ediacaran sea floor (575–541 MYA) hosted Earth’s first large multicellular organisms — soft, frond-like *Charnia* and ribbed *Dickinsonia*.',
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
      'As continents drifted apart creating warm, calcium- and oxygen-rich shallow seas, animal life exploded into virtually every modern phylum (**The Cambrian Explosion**, 541–485 MYA)! Discovered in the 508-million-year-old **Burgess Shale** by **Charles Doolittle Walcott** (1909) and re-analyzed by **Harry Whittington, Derek Briggs, Simon Conway Morris, and Stephen Jay Gould**, apex predators like *Anomalocaris* evolved compound eyes and grasping appendages; **Trilobites** grew articulated calcite-eyed exoskeletons; and a 5-cm ribbon-shaped swimmer named ***Pikaia gracilens*** (alongside *Haikouichthys*) evolved a dorsal **notochord** and myomeres — the direct chordate ancestor of all vertebrates!',
    stats: [
      { label: 'Age', value: '541 – 485 Million Yrs Ago' },
      { label: 'Key Pioneers', value: 'Charles Walcott, Conway Morris, S.J. Gould' },
      { label: 'Breakthroughs', value: 'Calcite Eyes, Exoskeletons, Notochords' },
      { label: 'Key Fossils', value: 'Burgess Shale (Canada) & Chengjiang (China)' },
    ],
    facts: [
      'Trilobite compound eyes were made of optically aligned calcite crystals — the first image-forming lenses in Earth’s history!',
      'At 541 MYA, the continents were still barren rock; all complex animal drama unfolded beneath the waves.',
      'Shortly after the Cambrian, jawed fishes (Placoderms & sharks) evolved during the Ordovician–Devonian "Age of Fishes", setting the stage for tetrapods.',
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
      'After vascular plants (*Cooksonia*), mycorrhizal fungi, and arthropods colonized the land in the Silurian, a 375-million-year-old Devonian lobe-finned sarcopterygian fish named ***Tiktaalik roseae*** — discovered in the Canadian Arctic in 2004 by paleontologist **Neil Shubin, Edward Daeschler, and Farish Jenkins** — used its homologous humerus, radius, ulna, and mobile wrist bones to prop itself onto muddy river deltas and breathe air! Soon tetrapods like *Acanthostega* and *Ichthyostega* walked on four limbs. By **300 MYA (Carboniferous Period)**, towering *Lepidodendron* scale-tree swamps buried massive carbon deposits (today’s coal seams) and pumped atmospheric oxygen to **35%** — breeding 70-cm *Meganeura* dragonflies and 2.6-m *Arthropleura* millipedes while *Hylonomus* pioneered the land-dwelling **amniotic egg**!',
    stats: [
      { label: 'Age', value: '375 MYA (Tiktaalik) – 300 MYA (Coal Swamps)' },
      { label: 'Key Discoverers', value: 'Neil Shubin, Daeschler & Jenkins (2004)' },
      { label: 'Atmosphere O₂', value: '35% Oxygen (Highest in Phanerozoic!)' },
      { label: 'Hero Species', value: 'Tiktaalik roseae, Meganeura, Hylonomus' },
    ],
    facts: [
      'As Neil Shubin explained in *Your Inner Fish*, when you bend your elbow, wrist, and neck today, you are moving the exact bone architecture first evolved by *Tiktaalik* 375 million years ago.',
      'As Gondwana slammed into Euramerica to assemble Pangaea, it pushed up the Central Pangean Mountains (today’s Appalachians, Atlas, and Scottish Highlands) to Himalayan heights!',
      'The amniotic egg (with its amnion, chorion, and allantois membranes) freed early reptiles and synapsids from having to lay eggs in water like amphibians.',
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
      'By 252 million years ago, almost every landmass on Earth had collided into one colossal C-shaped supercontinent called **PANGAEA** ("All-Earth"), first reconstructed in 1912 by **Alfred Wegener** and later explained via seafloor spreading and mid-ocean ridges mapped by **Marie Tharp, Bruce Heezen, Harry Hess, and Tuzo Wilson**! Before the eruption, Permian Pangaea was ruled by mammal-like synapsids (such as sail-backed *Dimetrodon* and saber-toothed gorgonopsids). Then the **Siberian Traps** flood basalts erupted 4 million km³ of lava, spiking CO₂, heating equatorial oceans past 40 °C, and causing **The Great Dying (Permian–Triassic Extinction)** — wiping out ~96% of marine species and ~70% of land vertebrates, and clearing the stage for Triassic archosaurs, dinosaurs, and mammals!',
    stats: [
      { label: 'Age', value: '251.9 Million Yrs Ago (Permian–Triassic)' },
      { label: 'Key Geologists', value: 'Alfred Wegener, Marie Tharp, Harry Hess' },
      { label: 'Extinction Toll', value: '~96% Marine & ~70% Terrestrial Species' },
      { label: 'Survivors', value: 'Lystrosaurus, Archosaurs & Cynodonts' },
    ],
    facts: [
      'Alfred Wegener noticed in 1912 that fossil *Lystrosaurus* and *Mesosaurus* reptiles matched across South America, Africa, India, and Antarctica — proving the continents were once joined as Pangaea!',
      'In the 1950s, oceanographic cartographer Marie Tharp discovered the 65,000-km Mid-Ocean Ridge rift valley on the ocean floor, providing the smoking-gun proof for Plate Tectonics.',
      'In the Late Triassic (~230 MYA) on Pangaea, both the first dinosaurs (*Eoraptor*, *Herrerasaurus*, *Coelophysis*) AND the first tiny warm-blooded mammaliaforms evolved almost simultaneously!',
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
      'In the **Jurassic Period (201–145 MYA)**, Pangaea rifted into **Laurasia** in the north (North America + Eurasia) and **Gondwana** in the south (South America, Africa, India, Antarctica, Australia). As pioneering fossil hunter **Mary Anning** (who discovered Jurassic ichthyosaurs and plesiosaurs along England’s Lyme Regis cliffs) and anatomist **Sir Richard Owen** (who coined the word *Dinosauria* in 1842) revealed, warm epicontinental seas and lush *Araucaria* conifer, cycad, and tree-fern forests (notice: **zero grass or flowers yet!**) supported 50-ton sauropods like ***Brachiosaurus*** and *Diplodocus*, plated ***Stegosaurus***, apex predator *Allosaurus*, and the 150-MYA feathered transitional bird ***Archaeopteryx lithographica***!',
    stats: [
      { label: 'Age', value: '201 – 145 Million Yrs Ago (Jurassic)' },
      { label: 'Key Pioneers', value: 'Mary Anning, Richard Owen, Othniel Marsh' },
      { label: 'Largest Herbivore', value: 'Brachiosaurus & Diplodocus (50+ Tons)' },
      { label: 'Avian Transition', value: 'Archaeopteryx (150 MYA Solnhofen)' },
    ],
    facts: [
      'There was NO grass anywhere on Earth during the Jurassic — sauropods stripped conifer needles, ginkgos, cycads, and horsetails using peg-like teeth and gizzard gastroliths!',
      'Discovered in Germany in 1861 just two years after Charles Darwin’s *Origin of Species*, *Archaeopteryx* combined dinosaurian teeth, clawed wings, and a bony tail with asymmetrical flight feathers.',
      'Stegosaurus lived 150 million years ago — 84 million years before T-Rex ever walked the Earth (more time separates T-Rex from Stegosaurus than separates us from T-Rex)!',
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
      'During the **Cretaceous Period (145–66 MYA)**, the South Atlantic unzipped between South America and Africa while India broke free of Gondwana and sprinted northward at 15 cm/year! Isolated continents evolved distinct dinosaur faunas: in North America’s Hell Creek Formation, **Barnum Brown** (1902) discovered ***Tyrannosaurus rex*** alongside three-horned ***Triceratops*** and armored *Ankylosaurus*, while **John Ostrom** and **Xu Xing** proved that dromaeosaurs and birds are living feathered theropod dinosaurs! Simultaneously, the **Cretaceous Terrestrial Revolution** saw the rise of the first **Angiosperms (flowering plants)**, magnolias, hardwoods, and pollinating bees.',
    stats: [
      { label: 'Age', value: '145 – 66 Million Yrs Ago (Cretaceous)' },
      { label: 'Key Paleontologists', value: 'Barnum Brown, John Ostrom, Xu Xing' },
      { label: 'Apex Duel', value: 'Tyrannosaurus rex (6-Ton Bite) vs. Triceratops' },
      { label: 'Botanical Revolution', value: 'First Angiosperms (Flowers) & Pollinators' },
    ],
    facts: [
      'High Cretaceous sea levels flooded central North America with the Western Interior Seaway, dividing the continent into Laramidia (west) and Appalachia (east).',
      'T-Rex teeth were thick, banana-shaped lethal spikes rather than flat blades, delivering a ~60,000-Newton (~6-ton) bite force capable of shattering solid Triceratops bone.',
      'Feathered dromaeosaurs (like *Deinonychus* and *Velociraptor*) possessed a semilunate wrist bone identical to modern birds, folded for grasping prey and later for flight strokes.',
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
    subtitle: 'A 10-km carbonaceous asteroid strikes Yucatán at 20 km/s, ending the 165-million-year reign of non-avian dinosaurs',
    themeColor: '#f43f5e',
    skyTint: [0.2, 0.04, 0.02],
    summary:
      '66.0 million years ago, a 10-kilometer carbonaceous chondrite asteroid slammed into the sulfur-rich gypsum shelf of **Chicxulub, Yucatán** at 20 km/s! First deduced in 1980 by physicist **Luis Alvarez**, geologist **Walter Alvarez**, and nuclear chemists **Frank Asaro & Helen Michel** (who discovered a global **Iridium anomaly** and shocked quartz at the **K–Pg boundary** in Gubbio, Italy, before **Alan Hildebrand & Glen Penfield** pinpointed the 180-km Chicxulub crater), the impact unleashed 100 teratons of energy, mega-tsunamis, global wildfires, and a multi-year sulfate impact winter. All non-avian dinosaurs, pterosaurs, ammonites, and mosasaurs perished — while avian dinosaurs (birds) and small placental mammals survived!',
    stats: [
      { label: 'Age', value: '66.04 Million Yrs Ago (K–Pg Boundary)' },
      { label: 'Key Discoverers', value: 'Luis & Walter Alvarez, Asaro, Michel, Hildebrand' },
      { label: 'Smoking Gun', value: 'Global Iridium Layer + 180-km Chicxulub Crater' },
      { label: 'Key Survivors', value: 'Avian Dinosaurs (Birds) & Placental Mammals' },
    ],
    facts: [
      'In 1980, Luis and Walter Alvarez measured an thin clay layer in Gubbio, Italy containing 30× normal levels of Iridium — an element rare in Earth’s crust but abundant in asteroids!',
      'At the Tanis fossil site in North Dakota, paleontologists found fossilized fish with impact glass spherules (tektites) lodged in their gills from the very first hour after the Chicxulub strike.',
      'Without this single cosmic collision 66 million years ago, mammalian radiation — and the evolution of primates and humans — almost certainly would never have occurred.',
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
    title: 'India Crashes into Asia, Himalayas Rise & Mammals Inherit the Earth',
    subtitle: 'Tectonic collisions push up Mount Everest, open the Southern Ocean, and radiate mammals & early apes',
    themeColor: '#f59e0b',
    skyTint: [0.04, 0.1, 0.14],
    summary:
      'Following the Paleocene–Eocene Thermal Maximum (PETM, 56 MYA), the final pieces of today’s world map locked into place! Around **50–35 million years ago**, the fast-moving Indian Plate slammed head-on into Eurasia, crumpling the ancient Tethys seafloor skyward into the Tibetan Plateau and the **Himalaya Mountains**! Meanwhile, Australia and South America separated from Antarctica (opening the Drake Passage and freezing the Antarctic Ice Sheet at ~34 MYA). As global climates cooled and C₄ grasslands spread, mammals radiated into whales (*Pakicetus → Basilosaurus*), giant hornless rhinos (*Paraceratherium*), horses, saber-toothed cats, and tailless Miocene hominoid apes like ***Proconsul africanus*** (~20 MYA, discovered in East Africa by **Mary & Louis Leakey**)!',
    stats: [
      { label: 'Age', value: '50 – 20 Million Yrs Ago (Eocene–Miocene)' },
      { label: 'Major Collision', value: 'India + Eurasia → Himalayas & Everest' },
      { label: 'Early Hominoids', value: 'Proconsul africanus (~20 MYA, Tailless Ape)' },
      { label: 'Mega-Mammals', value: 'Paraceratherium, Basilosaurus, Smilodon' },
    ],
    facts: [
      'The Qomolangma limestone at the very summit of Mount Everest (8,849 m high!) is packed with fossilized marine crinoids, trilobites, and brachiopods from the ancient Tethys Ocean floor!',
      'Miocene apes like *Proconsul* (~20 MYA) had lost their tails and evolved flexible shoulder and elbow joints, but still walked on all fours along forest branches — millions of years before bipedalism.',
      'Around 3.5–2.8 million years ago, the volcanic Isthmus of Panama closed between North and South America, triggering the Great American Biotic Interchange and reorganizing the Gulf Stream.',
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
    title: 'Human Ancestors Stand Up: Sahelanthropus, Ardipithecus & "Lucy"',
    subtitle: 'Tectonic rifting in East Africa turns rainforest into savanna as early hominins walk upright on two legs',
    themeColor: '#fb923c',
    skyTint: [0.08, 0.07, 0.04],
    summary:
      'As tectonic rifting uplifted the East African Rift Valley, eastern Africa dried from closed rainforest into a mosaic of woodland and savanna. Between 7 and 4.4 million years ago, our hominin lineage diverged from chimpanzees — documented by ***Sahelanthropus tchadensis*** (7 MYA, **Michel Brunet**) and ***Ardipithecus ramidus*** ("Ardi", 4.4 MYA, **Tim White**). By **3.2 million years ago** at Hadar, Ethiopia, ***Australopithecus afarensis*** — famously discovered in 1974 by paleoanthropologist **Donald Johanson** & Tom Gray as the 40%-complete skeleton **"Lucy" (AL 288-1)**, and confirmed by **Mary Leakey’s** 1978 discovery of the **3.66-MYA Laetoli volcanic ash footprints** in Tanzania — walked fully upright on two legs long before brain size expanded!',
    stats: [
      { label: 'Age', value: '7M – 3.2 Million Yrs Ago' },
      { label: 'Key Discoverers', value: 'Donald Johanson (Lucy), Mary Leakey (Laetoli)' },
      { label: 'Brain & Stature', value: '~400–450 cm³ Brain; Lucy Stature: 1.05 m' },
      { label: 'First Stone Flakes', value: 'Lomekwi (3.3 MYA) & Oldowan (2.6 MYA)' },
    ],
    facts: [
      'Crucial evolutionary fact: Human ancestors evolved habitual upright bipedalism (a centered foramen magnum, bowl-shaped pelvis, and valgus knee) more than 4 MILLION years before evolving modern-sized brains!',
      'Lucy stood just 1.05 meters (3 ft 5 in) tall and weighed ~29 kg; she did not have hafted spears, but freed hands allowed hominins to carry food, infants, and early Lomekwian/Oldowan cobble flakes.',
      'At Laetoli, Tanzania (3.66 MYA), Mary Leakey uncovered a 27-meter trail of hominin footprints in wet Sadiman volcanic ash showing an arched foot and non-grasping big toe aligned with the other toes.',
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
    title: 'Discovery of Fire & Homo erectus: Taming Flame & Acheulean Hand-Axes',
    subtitle: 'Humans master controlled fire in caves, cook food to fuel bigger brains, and knap symmetrical stone bifaces',
    themeColor: '#f97316',
    skyTint: [0.09, 0.05, 0.08],
    summary:
      'Around 2.4 million years ago appeared the genus ***Homo*** (*Homo habilis*, discovered at Olduvai Gorge by **Louis & Mary Leakey**), flaking sharp Oldowan stone choppers. Then ~1.9 million years ago emerged ***Homo erectus*** (first found in Java by **Eugène Dubois** in 1891, and exemplified by the 1.5-MYA **"Turkana Boy" KNM-WT 15000** skeleton found by **Kamoya Kimeu & Richard Leakey** in 1984) — tall, modern-proportioned endurance runners with brains up to ~1,000 cm³! *Homo erectus* invented symmetrical **Acheulean teardrop bifacial hand-axes** (1.76 MYA), became the first hominin to disperse out of Africa across Eurasia (Dmanisi, 1.85 MYA), and mastered **Controlled Fire** (Wonderwerk Cave ~1.0 MYA; Gesher Benot Ya’aqov 780k YA), which **Richard Wrangham’s Cooking Hypothesis** links directly to rapid human brain expansion!',
    stats: [
      { label: 'Age', value: '1.9M – 400,000 Yrs Ago' },
      { label: 'Key Pioneers', value: 'Louis & Mary Leakey, R. Leakey, K. Kimeu, Wrangham' },
      { label: 'Brain Growth', value: '450 cm³ → 650 cm³ (habilis) → 1,050 cm³ (erectus)' },
      { label: 'Breakthrough Tech', value: 'Acheulean Hand-Axe (1.76 MYA) & Controlled Fire' },
    ],
    facts: [
      'As Harvard anthropologist Richard Wrangham showed, cooking meat and fibrous tubers over fire pre-digests starches and denatures proteins — shrinking the human gut and freeing metabolic energy to grow our calorie-hungry brain!',
      'The Acheulean teardrop bifacial hand-axe (Mode 2 tool) was humanity’s longest-running technology, crafted across Africa, Europe, and Asia for over 1.4 MILLION years.',
      'By 300,000 YA at Schöningen, Germany, *Homo heidelbergensis* hunters crafted balanced spruce throwing javelins with fire-hardened tips.',
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
    subtitle: 'Multiple big-brained human species share the planet as Homo sapiens emerges in Africa (~315,000 YA)',
    themeColor: '#38bdf8',
    skyTint: [0.04, 0.08, 0.16],
    summary:
      'Zooming into the last 500,000 years, we were NOT the only human species on Earth! From Middle Pleistocene ancestors (*Homo heidelbergensis*), Ice Age Eurasian populations branched into stocky, cold-adapted **Neanderthals** (*Homo neanderthalensis*, ~1,450 cm³ brains, Mousterian Levallois flint tools, and birch-tar adhesives) in the west and **Denisovans** (discovered via ancient DNA from Denisova Cave, Siberia by Nobel laureate **Svante Pääbo** in 2010) in the east — alongside island species *Homo floresiensis* and *Homo luzonensis*. Meanwhile in Africa (~315,000 years ago at **Jebel Irhoud, Morocco**, excavated by **Jean-Jacques Hublin**, and Omo Kibish, Ethiopia), our own species — ***Homo sapiens*** — evolved a globular braincase, retracted face, chin, and continent-spanning social networks!',
    stats: [
      { label: 'Time Window', value: '500,000 – 300,000 Years Ago' },
      { label: 'Key Pioneers', value: 'Svante Pääbo (Nobel 2022), Jean-Jacques Hublin' },
      { label: 'Oldest Homo sapiens', value: '~315,000 YA (Jebel Irhoud, Morocco)' },
      { label: 'Human Cousins', value: 'Neanderthals, Denisovans, H. floresiensis' },
    ],
    facts: [
      'Nobel laureate Svante Pääbo sequenced the Neanderthal genome and discovered the Denisovans from a tiny 40,000-year-old finger bone — proving *Homo sapiens* interbred with both groups!',
      'Neanderthals were sophisticated survivors: they dry-distilled birch-bark pitch at 350 °C in oxygen-free embers to haft stone points, wore eagle-talon jewelry, cared for injured elders (Shanidar 1), and buried their dead.',
      'Unlike Neanderthals’ elongated skulls and heavy brow ridges, *Homo sapiens* evolved a round (globular) braincase with an expanded parietal cortex and a projecting bony chin.',
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
    title: '100,000–40,000 YA: Out of Africa, Cave Murals & Paleolithic Ivory Art',
    subtitle: 'Homo sapiens crosses into Eurasia and Australia (65K YA), creating Sulawesi/Chauvet murals, bone flutes & Löwenmensch ivory sculptures',
    themeColor: '#ec4899',
    skyTint: [0.08, 0.04, 0.12],
    summary:
      'Between 100,000 and 60,000 years ago — as reconstructed by paleoanthropologist **Chris Stringer** and Nobel paleogeneticist **Svante Pääbo** — waves of *Homo sapiens* expanded out of Africa across the Sinai and Bab-el-Mandeb straits into Eurasia, building seaworthy watercraft to reach **Madjedbebe in Australia by ~65,000 YA**! Along the way, *Homo sapiens* interbred with Neanderthals and Denisovans. Symbolic culture exploded: **Maxime Aubert’s** team dated pig and hand-stencil murals in **Leang Tedongnge (Sulawesi, Indonesia)** to **45,500 YA**; **Jean-Marie Chauvet** discovered 36,000-year-old charcoal lions and horses in **Chauvet Cave**; and Swabian Jura artisans carved the 40,000-year-old mammoth-ivory **Löwenmensch (Lion-Man)** and **Hohle Fels** vulture-bone flute alongside eyed bone needles!',
    stats: [
      { label: 'Time Window', value: '100,000 – 40,000 Years Ago' },
      { label: 'Oldest Cave Art', value: 'Sulawesi (45.5K YA) & Chauvet (36K YA)' },
      { label: 'Australia Reached', value: '~65,000 YA (Madjedbebe Open-Sea Crossing)' },
      { label: 'Ivory & Music', value: '40K YA Löwenmensch & Hohle Fels Flute' },
    ],
    facts: [
      'The 40,000-year-old **Löwenmensch (Lion-Man)** carved from mammoth tusk in Germany is the oldest known zoomorphic sculpture — proof that Ice Age humans could imagine mythical beings that do not exist in nature!',
      'By flickering tallow-lamp light inside Chauvet Cave (36,000 YA) and Lascaux (17,000 YA), artists drew multiple overlapping legs and heads on running bison and horses — creating the world’s first "flipbook animation"!',
      'Using eyed bone needles to sew tailored, windproof fur parkas allowed *Homo sapiens* to thrive across freezing Eurasian latitudes as Neanderthals vanished around 40,000 years ago.',
    ],
    whatIf: {
      question: 'Illuminate the Prehistoric Cave Wall, Ivory Lion-Man & Bone Flute with Tallow Torchlight!',
      buttonLabel: '🔦 Flicker Cave Torch & Reveal Ochre Art',
      activeLabel: '🖐️ Cave Wall Illuminated: 40,000-Year-Old Ochre Horses, Hand Stencils & Ivory Art!',
      explanation:
        'Using red hematite, yellow limonite, and black manganese charcoal, Upper Paleolithic artists left their hand stencils and dynamic animal murals on limestone walls across Indonesia, France, and Spain!',
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
    title: 'Ice Age Mammoth-Bone Huts, Beringia & Peopling the Americas',
    subtitle: 'Glaciers lock up the seas by 120m, opening the treeless Beringia Mammoth Steppe, Kelp Highway & White Sands (23K YA)',
    themeColor: '#38bdf8',
    skyTint: [0.03, 0.09, 0.18],
    summary:
      'During the Last Glacial Maximum (~26,500–19,000 years ago), 3-kilometer-thick Laurentide and Cordilleran ice sheets locked up so much ocean water that global sea levels dropped **120 meters**, exposing **Beringia** — a 1,600-km-wide, treeless **Mammoth Steppe** linking Siberia to Alaska! On the wood-scarce periglacial tundra (such as **Mezhirich** and Mal’ta), Upper Paleolithic families built windproof **Mammoth-Bone Huts** out of interlocking tusks, mandibles, and hides. Accompanied by domesticated wolves (**the first dogs, ~25,000+ YA**), Indigenous ancestors crossed Beringia and paddled skin boats down the Pacific **Kelp Highway** — leaving **23,000–21,000-year-old footprints at White Sands, New Mexico** (excavated by **Matthew Bennett & David Bustos**) and reaching **Monte Verde, Chile by 14,500 YA**!',
    stats: [
      { label: 'Time Window', value: '30,000 – 14,000 Years Ago (LGM)' },
      { label: 'Sea-Level Drop', value: '-120 Meters (Beringia Steppe Open)' },
      { label: 'Earliest Tracks', value: '23,000–21,000 YA (White Sands, NM)' },
      { label: 'Tundra Shelter', value: 'Mezhirich Interlocking Mammoth-Bone Huts' },
    ],
    facts: [
      'Fossilized human footprints in ancient lakebed gypsum at **White Sands, New Mexico** (dated via seed layers and optically stimulated luminescence to 23,000–21,000 YA) show teenagers and children walking beside giant ground sloths and Columbian mammoths during the peak of the Ice Age!',
      'Because no trees grew on the freezing Mammoth Steppe, Ice Age architects at sites like Mezhirich interlocked up to 149 Woolly Mammoth skulls, jaws, and curved tusks into sturdy dome dwellings heated by bone-fueled hearths.',
      'As the ice sheets melted at the end of the Pleistocene (~11,700 YA), rising seas flooded the Bering Strait — separating Afro-Eurasia and the Americas for the next 11,000 years.',
    ],
    whatIf: {
      question: 'Raise & Lower Ice Age Sea Levels by 120 Meters across the Beringia Land Bridge!',
      buttonLabel: '🌊 Flood / Expose Beringia Land Bridge',
      activeLabel: '🗺️ Holocene Melt (+120m Sea Rise): Bering Strait Floods Between Asia & Alaska!',
      explanation:
        'Watch the ocean rise between Siberia and Alaska while the Mammoth-Bone Hut hearth glows! When the great ice sheets melted, global seas rose 120 meters into today’s coastline.',
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
    title: 'Göbekli Tepe, The Neolithic Farming Revolution, Villages & The Wheel',
    subtitle: 'Monumental T-shaped pillars precede full farming as humans domesticate wheat, rice, maize & livestock across 7 global centers',
    themeColor: '#84cc16',
    skyTint: [0.05, 0.12, 0.06],
    summary:
      'As the Ice Age gave way to the warm **Holocene Interglacial (~9,700 BCE)**, something astonishing happened at **Göbekli Tepe** in southeastern Anatolia (excavated by **Klaus Schmidt**): around **9,600 BCE**, Pre-Pottery Neolithic hunter-gatherers carved 16-ton **T-shaped limestone pillars** reliefs of foxes, vultures, and scorpions — proving that monumental communal sanctuaries helped spark sedentary life! Soon after, in what archaeologist **V. Gordon Childe** named the **Neolithic Revolution** (across the centers mapped by botanist **Nikolai Vavilov**), humans independently domesticated einkorn/emmer wheat, barley, sheep, and cattle in the Fertile Crescent; rice in the Yangtze Valley; maize (from teosinte), beans, and squash in Mesoamerica; and potatoes and llamas in the Andes — building early towns like **Jericho** (excavated by **Kathleen Kenyon**) and **Çatalhöyük** (**James Mellaart & Ian Hodder**), fired pottery, irrigation canals, and the **Wheel (~3,500 BCE)**!',
    stats: [
      { label: 'Era', value: '10,000 – 4,000 BCE (Neolithic Revolution)' },
      { label: 'Oldest Sanctuary', value: 'Göbekli Tepe (~9,600 BCE T-Pillars)' },
      { label: 'First Towns', value: 'Jericho (9,000 BCE) & Çatalhöyük (7,100 BCE)' },
      { label: 'Inventions', value: 'Crop/Livestock Domestication, Pottery, Wheel' },
    ],
    facts: [
      '**Göbekli Tepe** (~9,600 BCE) was built 7,000 years before Stonehenge and 6,500 years before the Great Pyramid of Giza — by people who did not yet have metal tools, pottery, or domestic pack animals!',
      'At **Çatalhöyük** in Turkey (~7,100 BCE), mud-brick houses were packed wall-to-wall with no streets; residents walked across rooftops and entered their homes through ladders in the ceiling!',
      'Storing surplus grain in clay jars meant not everyone had to forage every day — giving rise to specialized potters, weavers, metallurgists, and astronomers.',
    ],
    whatIf: {
      question: 'Open the River Irrigation Canals & Illuminate the 9,600 BCE Göbekli Tepe T-Pillars!',
      buttonLabel: '💧 Open Irrigation Canals & Light Sanctuary',
      activeLabel: '🌾 Harvest Surplus Active: Irrigated Grain Fields, Spinning Wheel & Göbekli Tepe Lit!',
      explanation:
        'Look at the carved T-shaped limestone pillars alongside the mud-brick village and irrigated fields: communal rituals and surplus grain together birthed human civilization!',
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
    title: 'The Bronze Age: Copper-Tin Metallurgy, Cuneiform, Hammurabi & Giza Pyramids',
    subtitle: 'Imhotep & Khufu raise the Pyramids, Enheduanna & Hammurabi write on clay/stone, and copper+tin smelting forges the Bronze Age',
    themeColor: '#eab308',
    skyTint: [0.14, 0.08, 0.02],
    summary:
      'Around 3,300 BCE, metallurgists discovered a transformative chemical alloy: smelting **88% Copper with 12% Tin at 1,050 °C** creates **Bronze** — sparking long-distance trade networks from Cornwall and Afghanistan to the Mediterranean! In Mesopotamia, Sumerian scribes invented **Cuneiform** writing (~3,200 BCE), **Sargon of Akkad** forged the first empire, his daughter **Enheduanna (~2,285 BCE)** became the world’s first named author in history, **King Ur-Nammu** and **King Hammurabi (~1,750 BCE)** carved the first written law codes onto basalt steles. In Egypt, polymath architect **Imhotep** designed the first stone Step Pyramid (~2,670 BCE), **Pharaoh Khufu & Vizier Hemiunu** built the 146.6-meter **Great Pyramid of Giza (~2,560 BCE)**, **Sculptor Thutmose** crafted the bust of **Queen Nefertiti (~1,345 BCE)**, and **Pharaoh Ramesses II** signed the world’s first surviving peace treaty with the Hittites (1259 BCE) — alongside **Mohenjo-Daro** in the Indus Valley and **Shang Dynasty** bronze casters in China!',
    stats: [
      { label: 'Era', value: '3,300 – 1,200 BCE (The Bronze Age)' },
      { label: 'Named Pioneers', value: 'Imhotep, Khufu, Enheduanna, Hammurabi' },
      { label: 'Bronze Alloy', value: '88% Copper + 12% Tin (Cast at 1,050 °C)' },
      { label: 'Cradles of Civ', value: 'Mesopotamia, Egypt, Indus, Shang, Caral/Olmec' },
    ],
    facts: [
      'High priestess and poet **Enheduanna of Ur (~2,285 BCE)** signed her cuneiform temple hymns by name — making her the earliest known named author in human history!',
      'Carved onto a 2.25-meter black basalt diorite stele in 1,750 BCE, the **Code of Hammurabi** contains 282 laws governing wages, contracts, medical liability, and justice.',
      'Around 1,200–1,150 BCE, megadroughts, earthquakes, and Sea Peoples raids severed tin trade routes in the **Late Bronze Age Collapse**, accelerating the transition to iron smelting.',
    ],
    whatIf: {
      question: 'Pour Molten Bronze (Copper + Tin) from the Crucible, Light the Code of Hammurabi Stele & Align the Pyramid Capstone!',
      buttonLabel: '🔥 Cast Molten Bronze & Light Capstone',
      activeLabel: '⚔️ 1,050 °C Bronze Foundry Pouring, Hammurabi Stele & Electrum Pyramidion Lit!',
      explanation:
        'Watch the glowing 1,050 °C molten bronze stream into the axe mold beside the black basalt Code of Hammurabi stele and the golden electrum capstone of Giza!',
    },
  },
  {
    id: 'classical-greece',
    index: 19,
    chapterId: 'ancient-classical',
    sceneType: 'classicalGreece',
    paleoMa: 0,
    tectonicStage: 'Mediterranean Archipelago & Axial Age Afro-Eurasia',
    icon: '🏛️',
    eraBadge: '800 – 146 BCE (CLASSICAL GREECE & GLOBAL AXIAL AGE)',
    cosmicClock: '11:59:59.982 PM',
    title: 'Classical Greece, the Antikythera Computer & The Global Axial Age',
    subtitle: 'Pericles, Socrates, Aristotle, Euclid, Archimedes & Eratosthenes alongside Buddha, Ashoka, Confucius, Laozi & Cyrus the Great',
    themeColor: '#38bdf8',
    skyTint: [0.03, 0.1, 0.18],
    summary:
      'Between 800 and 200 BCE — the era philosopher Karl Jaspers called the **Global Axial Age** — revolutionary thinkers reshaped every major civilization simultaneously! In **Persia**, **Cyrus the Great (539 BCE)** founded the Achaemenid Empire and the Cyrus Cylinder; in **India**, **Siddhartha Gautama (the Buddha)** taught the Middle Way and **Mauryan Emperor Ashoka (268–232 BCE)** carved rock edicts of religious tolerance and hospitals; in **China**, **Confucius (Kong Fuzi)** and **Laozi** founded Confucian ethics and Daoism. Meanwhile across the Aegean *poleis*, **Solon, Cleisthenes (508 BCE) & Pericles** pioneered Athenian **Demokratia** and commissioned **Phidias** to sculpt the **Parthenon**; **Socrates, Plato & Aristotle** systematized logic and natural science; **Hippocrates** reformed medicine; **Herodotus & Thucydides** invented critical history; and in Hellenistic Alexandria and Syracuse, **Euclid, Archimedes, Aristarchus of Samos (heliocentrism), Eratosthenes (Earth’s circumference), and Hipparchus** culminated in the **Antikythera Mechanism (~150 BCE)** — a 30+ bronze-gear analog astronomical computer!',
    stats: [
      { label: 'Era', value: '800 – 146 BCE (Classical Greece & Axial Age)' },
      { label: 'Greek Pioneers', value: 'Pericles, Socrates, Aristotle, Archimedes' },
      { label: 'Axial Contemporaries', value: 'Buddha, Ashoka, Confucius, Laozi, Cyrus' },
      { label: 'Ancient Computer', value: 'Antikythera Mechanism & Eratosthenes (240 BCE)' },
    ],
    facts: [
      'Around 240 BCE, chief librarian **Eratosthenes of Cyrene** measured the 7.2° shadow angle between Syene (Aswan) and Alexandria at noon on the summer solstice — calculating Earth’s circumference to within ~1–2%!',
      'Recovered from an Aegean shipwreck, the **Antikythera Mechanism** used differential bronze epicyclic gears to compute the positions of the Sun, Moon, five planets, lunar phases, and the 4-year Olympiad cycle.',
      '**Aristarchus of Samos (~270 BCE)** deduced that the Earth revolves around the Sun and rotates on its axis — 1,800 years before Copernicus!',
    ],
    whatIf: {
      question: 'Spin the Bronze Gears of the Antikythera Astronomical Computer & Restore the Parthenon’s Polychrome Glow!',
      buttonLabel: '⚙️ Engage Antikythera Gears & Temple Glow',
      activeLabel: '🌟 Hellenistic Science Active: 3D Bronze Epicyclic Gears Spinning & Parthenon Lit!',
      explanation:
        'Look closely at the 3D Antikythera Mechanism beside the Parthenon: its interlocking bronze gears rotate in real time to model the cosmos!',
    },
  },
  {
    id: 'roman-empire',
    index: 20,
    chapterId: 'ancient-classical',
    sceneType: 'romanEmpire',
    paleoMa: 0,
    tectonicStage: 'Mediterranean Basin (Mare Nostrum) & Eurasian Silk Road to Han China',
    icon: '🦅',
    eraBadge: '27 BCE – 476 CE (ROMAN EMPIRE & HAN DYNASTY SILK ROAD)',
    cosmicClock: '11:59:59.987 PM',
    title: 'The Roman Empire & Han Dynasty Silk Road: Colosseum, Aqueducts & Paper',
    subtitle: 'Augustus, Trajan, Marcus Aurelius, Vitruvius & Hypatia in the West alongside Han Wudi, Zhang Qian, Sima Qian, Cai Lun & Zhang Heng in the East',
    themeColor: '#dc2626',
    skyTint: [0.12, 0.05, 0.04],
    summary:
      'At the turn of the Common Era, two colossal empires bookended Eurasia and connected via the **Silk Road**, carrying ~130 million people (half of humanity)! In the West, following **Julius Caesar** and first emperor **Augustus (27 BCE)**, **Rome** united the Mediterranean (*Mare Nostrum*) under **Vespasian & Titus** (builders of the **Colosseum**, 80 CE), **Trajan & architect Apollodorus of Damascus**, **Hadrian** (the **Pantheon’s** 43.3m unreinforced concrete dome), and Stoic philosopher-emperor **Marcus Aurelius**. Guided by architect **Vitruvius**, physician **Galen**, jurists of the *Corpus Juris*, and astronomer-mathematician **Hypatia of Alexandria**, Rome built 80,000 km of paved roads and gravity-fed **Aqueducts**. Simultaneously in the East, after **Qin Shi Huang** unified China (221 BCE), **Han Dynasty Emperor Wu (Han Wudi)** dispatched envoy **Zhang Qian (138 BCE)** to open the **Silk Road**, historian **Sima Qian** wrote the *Shiji*, **Cai Lun (105 CE)** invented **Papermaking**, and astronomer **Zhang Heng (132 CE)** built the world’s first bronze **Seismoscope**!',
    stats: [
      { label: 'Era', value: '27 BCE – 476 CE (Rome & Han Silk Road)' },
      { label: 'Roman Figures', value: 'Augustus, Trajan, Marcus Aurelius, Hypatia' },
      { label: 'Han China Pioneers', value: 'Han Wudi, Zhang Qian, Sima Qian, Cai Lun, Zhang Heng' },
      { label: 'Engineering & Tech', value: 'Pozzolana Concrete, Aqueducts, Paper (105 CE)' },
    ],
    facts: [
      'Roman marine concrete (*opus caementicium*) endured 2,000 years because engineers mixed volcanic ash (**pozzolana**) with lime — when water seeps into micro-cracks, it crystallizes new interlocking aluminum-tobermorite minerals that self-heal the stone!',
      'In **105 CE**, Han court official **Cai Lun** perfected papermaking from mulberry bark, hemp, and rags — creating an ultra-lightweight writing medium far cheaper than Egyptian papyrus or European parchment.',
      'In **132 CE**, Han polymath **Zhang Heng** invented a bronze dragon-jar seismoscope that dropped a bronze ball into a toad’s mouth to indicate the exact compass direction of an earthquake 500 km away!',
    ],
    whatIf: {
      question: 'Flow Mountain Water Across the Roman Aqueduct Arches into the Colosseum Arena!',
      buttonLabel: '🌊 Activate Aqueduct Flow & Naumachia',
      activeLabel: '🏛️ Hydraulic Engineering Active: Aqueduct Channels & Colosseum Arena Illuminated!',
      explanation:
        'Rome’s 11 aqueducts delivered ~1 million cubic meters of fresh water daily by gravity alone at a 0.034% gradient, feeding public baths, latrines, fountains, and amphitheater spectacles!',
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
    tectonicStage: 'Global Maritime Routes, Columbian Exchange (1492) & Scientific Revolution',
    icon: '🏰',
    eraBadge: '500 – 1687 CE (MEDIEVAL, ISLAMIC GOLDEN AGE, RENAISSANCE & SCIENTIFIC REV)',
    cosmicClock: '11:59:59.992 PM',
    title: 'Medieval & Islamic Golden Age, Gutenberg Press, Renaissance & Scientific Revolution',
    subtitle: 'Al-Khwarizmi & Ibn al-Haytham, Song compass & Bi Sheng type, Gutenberg (1450), Leonardo da Vinci, 1492 Columbian Exchange & Galileo/Newton',
    themeColor: '#f59e0b',
    skyTint: [0.06, 0.05, 0.14],
    summary:
      'Spanning from 500 to 1687 CE, four interlocking transformations forged the modern mind! First, during the **Medieval & Islamic Golden Age**, **Justinian & Theodora** codified law and built Hagia Sophia in Constantinople, while in Baghdad, Cairo, and Córdoba, **Al-Khwarizmi** invented **Algebra** and spread Hindu-Arabic numerals (0–9), **Ibn al-Haytham (Alhazen, 1011 CE)** pioneered the experimental scientific method in optics, **Ibn Sina (Avicenna)** wrote the *Canon of Medicine*, and **Al-Jazari** built programmable clockwork automata; meanwhile **Tang & Song China** invented gunpowder, paper money, the magnetic compass (**Shen Kuo**), and ceramic movable type (**Bi Sheng, 1040 CE**). Second, in **1450 CE**, **Johannes Gutenberg** engineered the oil-ink metal **Movable-Type Printing Press** in Mainz, fueling the **Renaissance** of **Filippo Brunelleschi, Leonardo da Vinci, and Michelangelo**. Third, the **Age of Sail & Columbian Exchange** (**Zheng He’s** treasure fleets, **Christopher Columbus in 1492, Vasco da Gama & Ferdinand Magellan**) reconnected Afro-Eurasia and the Americas (**Maya, Aztec Tenochtitlan & Inca Machu Picchu**). Fourth, the **Scientific Revolution** (**Nicolaus Copernicus, Johannes Kepler, Galileo Galilei’s 1609 telescope, William Harvey, and Isaac Newton’s 1687 *Principia***) revealed universal laws of motion and gravity!',
    stats: [
      { label: 'Era', value: '500 – 1687 CE (Medieval to Scientific Rev)' },
      { label: 'Islamic & Song Pioneers', value: 'Al-Khwarizmi, Ibn al-Haytham, Ibn Sina, Bi Sheng' },
      { label: 'Renaissance & Sail', value: 'Gutenberg (1450), Da Vinci, 1492 Exchange' },
      { label: 'Scientific Revolution', value: 'Copernicus, Kepler, Galileo (1609), Newton (1687)' },
    ],
    facts: [
      '**Ibn al-Haytham’s** *Book of Optics* (1011–1021 CE) proved that vision occurs when light rays bounce off objects into the eye and used controlled darkroom (*camera obscura*) experiments — 600 years before Bacon and Galileo!',
      'Before **Johannes Gutenberg’s** 1450 printing press, Europe had only ~30,000 handwritten codices; within 50 years, over **20 million volumes** were printed, allowing ideas by **Copernicus, Vesalius, Galileo, and Newton** to spread irreversibly.',
      'After 1492, the **Columbian Exchange** reunited the Old and New Worlds for the first time since Beringia flooded — transferring Mesoamerican maize, Andean potatoes, and tomatoes globally while horses, wheat, and devastating pandemics crossed to the Americas.',
    ],
    whatIf: {
      question: 'Pull the Gutenberg Screw Press Lever, Spin the Brass Astrolabe & Refract Light Through Newton’s Prism!',
      buttonLabel: '📖 Run Printing Press, Astrolabe & Prism!',
      activeLabel: '✨ Knowledge Revolution: Gutenberg Press Stamping, Brass Astrolabe Spinning & Rose Window Lit!',
      explanation:
        'Watch the 3D Gutenberg screw press stamp pages on the table beside the spinning Islamic brass astrolabe and Newton’s optical prism!',
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
    title: 'First Industrial Revolution: Watt’s Steam Engine, Railways, Faraday & Lovelace',
    subtitle: 'James Watt’s steam condenser, Stephenson’s 1829 Rocket locomotive, Faraday’s 1831 induction, and Babbage & Ada Lovelace’s 1843 algorithm',
    themeColor: '#f43f5e',
    skyTint: [0.1, 0.06, 0.05],
    summary:
      'For 300,000 years, nearly all human work relied on biological muscle (humans, oxen, horses), wind sails, and river waterwheels. Then between 1760 and 1840, engineers unlocked the concentrated solar energy trapped inside 300-million-year-old Carboniferous coal! Building on **Thomas Newcomen’s** atmospheric mine pump (1712) and **Abraham Darby’s** coke-smelted iron, Scottish engineer **James Watt (1769–1776)** invented the **separate steam condenser**, sun-and-planet rotary gear, and centrifugal governor — multiplying fuel efficiency 4× to power **Richard Arkwright’s** mechanized textile mills! Soon **George & Robert Stephenson’s *Rocket* (1829)** launched the age of intercity **Steam Railways**, **Sadi Carnot (1824)** founded the science of **Thermodynamics**, **Michael Faraday (1831)** discovered **electromagnetic induction** (the first electric dynamo/motor), and **Charles Babbage & Ada Lovelace (1837–1843)** designed the mechanical **Analytical Engine** and wrote the world’s first published computer algorithm!',
    stats: [
      { label: 'Era', value: '1760 – 1840 CE (1st Industrial Revolution)' },
      { label: 'Steam & Rail Pioneers', value: 'Newcomen, James Watt (1769), G. Stephenson (1829)' },
      { label: 'Physics & Compute', value: 'Sadi Carnot, Michael Faraday (1831), Ada Lovelace (1843)' },
      { label: 'Atmospheric CO₂', value: '280 ppm (Pre-Industrial Baseline)' },
    ],
    facts: [
      'In **1843**, mathematician **Ada Lovelace** published Note G on **Charles Babbage’s** mechanical Analytical Engine — proving that a machine manipulating symbols could compose music and execute branching loops (the first computer program in history, a century before electronic hardware!).',
      'In **1831** at the Royal Institution in London, **Michael Faraday** moved a magnet through a coil of copper wire and generated an electric current — discovering the principle behind every power-plant turbine on Earth today.',
      'Before **Stephenson’s *Rocket* (1829)**, no human had ever traveled faster than a galloping horse (~45 km/h); railway schedules soon forced nations to invent standardized **Time Zones**!',
    ],
    whatIf: {
      question: 'Feed Coal into the Boiler to Drive the Steam Piston, Flywheel & Locomotive Driving Wheels!',
      buttonLabel: '🚂 Full Steam Ahead (Boost Boiler Pressure!)',
      activeLabel: '💨 High-Pressure Steam Active: Pistons Pumping & Flywheel at Full RPM!',
      explanation:
        'Boiling water into high-pressure steam expands its volume 1,600× — driving the steel piston rod and linkage to spin the locomotive wheels!',
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
    title: 'Second Industrial Revolution: Edison & Tesla Grids, Pasteur, Curie & Wright Flyer',
    subtitle: 'Bessemer steel, Maxwell’s electromagnetism, Edison & Tesla AC/DC power, Bell & Marconi, Benz & Ford, Pasteur & Curie, and 1903 Kitty Hawk flight',
    themeColor: '#fbbf24',
    skyTint: [0.04, 0.08, 0.16],
    summary:
      'Between 1870 and 1920, an avalanche of scientific and engineering breakthroughs built the modern world in a single lifetime! **Henry Bessemer’s** steel converter raised suspension bridges and skyscrapers; **James Clerk Maxwell’s** electromagnetic equations (1865) unified light, electricity, and magnetism; **Thomas Edison (1879 incandescent lamp & Pearl Street station)** and **Nikola Tesla (polyphase AC induction motor & high-voltage transformers)** electrified cities; **Alexander Graham Bell (1876 telephone)** and **Guglielmo Marconi (wireless radio)** linked continents at light speed; **Karl Benz (1886)** and **Henry Ford’s** moving assembly line (1913) launched the automobile age; **Louis Pasteur & Robert Koch** proved **Germ Theory** (doubling human life expectancy!), **Wilhelm Röntgen (X-rays)** and double-Nobel laureate **Marie Skłodowska-Curie** unlocked **Radioactivity**, **Fritz Haber & Carl Bosch (1909)** synthesized nitrogen fertilizer from air, and on **December 17, 1903**, **Orville & Wilbur Wright** achieved the first powered, controlled airplane flight at Kitty Hawk!',
    stats: [
      { label: 'Era', value: '1870 – 1920 CE (Age of Steel, Power & Flight)' },
      { label: 'Power & Comms', value: 'Maxwell, Edison (1879), Nikola Tesla, Bell, Marconi' },
      { label: 'Medicine & Chemistry', value: 'Louis Pasteur, Koch, Marie Curie, Haber-Bosch' },
      { label: 'Aviation & Auto', value: 'Karl Benz (1886), Wright Brothers (Dec 17, 1903), Ford' },
    ],
    facts: [
      '**Marie Skłodowska-Curie** coined the term *radioactivity*, discovered polonium and radium, ran mobile X-ray vans on the front lines, and remains the only person in history to win Nobel Prizes in two different sciences (**Physics 1903 & Chemistry 1911**)!',
      'Half of all the nitrogen atoms in your body right now came from the **Haber-Bosch process (1909)**, which captures atmospheric $\\text{N}_2$ gas to make crop fertilizer that feeds over 4 billion people today.',
      '**Orville Wright** — who flew the spruce-and-muslin *Wright Flyer* 36 meters in 12 seconds in 1903 — lived long enough to see Chuck Yeager break the sound barrier in a rocket plane in 1947 and Apollo’s space age dawn!',
    ],
    whatIf: {
      question: 'Energize the Edison Bulb & Nikola Tesla High-Voltage Coil while Launching the 1903 Wright Flyer!',
      buttonLabel: '⚡ Energize Bulb, Tesla Coil & Wright Flyer',
      activeLabel: '💡 2,700K Filament Glowing, Tesla Coil Arcing & Wright Flyer Banking in 3D!',
      explanation:
        'Look at the copper-wound Tesla Coil and tungsten-filament bulb beside the banking 1903 Wright biplane: AC transformers step voltage up for long-distance transmission and down for safe home use!',
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
    eraBadge: '1905 – 1969 CE (RELATIVITY, QUANTUM, DNA, COMPUTERS & APOLLO 11)',
    cosmicClock: '11:59:59.9996 PM',
    title: 'Einstein, DNA, Silicon Microchips & The Apollo 11 Moon Landing (1969)',
    subtitle: 'Einstein & Quantum Physics, Fleming’s Penicillin, Turing & Von Neumann, 1947 Transistor, Franklin/Watson/Crick DNA, and Armstrong, Aldrin, Collins, Johnson & Hamilton',
    themeColor: '#38bdf8',
    skyTint: [0.02, 0.04, 0.12],
    summary:
      'In the first seven decades of the 20th century, humanity cracked the fundamental codes of the universe, life, and information! **Albert Einstein (1905–1915)** revolutionized space, time, gravity, and $E=mc^2$ alongside **Max Planck, Niels Bohr, Werner Heisenberg, and Erwin Schrödinger’s** **Quantum Mechanics**; **Alexander Fleming (1928)** discovered **Penicillin**; and **Rosalind Franklin (Photo 51), James Watson, and Francis Crick (1953)** revealed the **DNA Double Helix**. Simultaneously, **Alan Turing (1936 Universal Turing Machine & Bletchley Park), John von Neumann, Claude Shannon (1948 Information Theory), and Grace Hopper (first compiler)** founded computer science. After **John Bardeen, Walter Brattain, and William Shockley** invented the **Transistor at Bell Labs (1947)** and **Jack Kilby & Robert Noyce (1958–59)** created the **Silicon Integrated Circuit (Microchip)**, human spaceflight leaped from **Yuri Gagarin (1961)** to **Apollo 11 on July 20, 1969** — when orbital calculations by **Katherine Johnson**, fault-tolerant AGC flight software led by **Margaret Hamilton**, and astronauts **Neil Armstrong, Buzz Aldrin, and Michael Collins** landed humanity on the Moon!',
    stats: [
      { label: 'Physics & Bio', value: 'Einstein, Planck/Bohr, Fleming, Franklin/Watson/Crick (DNA)' },
      { label: 'Computing Pioneers', value: 'Turing, Von Neumann, Shannon, Hopper, Shockley/Kilby/Noyce' },
      { label: 'Spaceflight Heroes', value: 'Gagarin (1961), K. Johnson, M. Hamilton, Armstrong & Aldrin' },
      { label: 'Earth Science (1965)', value: 'Marie Tharp, Harry Hess & Tuzo Wilson Prove Plate Tectonics!' },
    ],
    facts: [
      'Oceanographic cartographer **Marie Tharp** and geologist **Harry Hess** mapped the Mid-Atlantic Ridge on the ocean floor in the 1950s–60s, proving **Alfred Wegener’s** 1912 Continental Drift hypothesis and establishing modern **Plate Tectonics**!',
      'During Apollo 11’s final lunar descent on July 20, 1969, **Margaret Hamilton’s** priority-scheduling software in the 74-kilobyte Apollo Guidance Computer automatically shed radar-overload tasks (1201/1202 alarms) — saving the landing!',
      'Neil Armstrong and Buzz Aldrin placed the **Lunar Laser Ranging Retroreflector** array on the Sea of Tranquility; observatories still bounce laser pulses off its corner-cube prisms today, proving the Moon spirals 3.8 cm farther from Earth each year!',
    ],
    whatIf: {
      question: 'Pulse the Silicon Microchip Gates & Bounce a Green Laser Off Apollo 11’s Lunar Retroreflector!',
      buttonLabel: '🛰️ Pulse Silicon Chip & Lunar Laser Ranging',
      activeLabel: '📡 Binary 1s & 0s Clocking + 1.28-Sec Light-Speed Lunar Retroreflector Beam!',
      explanation:
        'Look at the 3D corner-cube Lunar Retroreflector next to the Apollo Lunar Module: a laser pulse takes 1.28 seconds at 299,792 km/s to travel from Earth to the Moon and 1.28 seconds back!',
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
    eraBadge: '1971 – 2007 CE (MICROPROCESSORS, PCs, THE WEB & THE IPHONE)',
    cosmicClock: '11:59:59.9999 PM',
    title: 'Personal Computers, The World Wide Web & The iPhone Revolution (2007)',
    subtitle: 'Moore’s Law, Faggin’s 1971 microprocessor, Ritchie & Thompson (Unix/C), Cerf & Kahn (TCP/IP), Berners-Lee (WWW), and Jobs & Wozniak',
    themeColor: '#a855f7',
    skyTint: [0.04, 0.03, 0.14],
    summary:
      'Driven by **Gordon Moore’s Law (1965)** — which predicted that transistor counts on silicon microchips would double roughly every two years — **Federico Faggin, Ted Hoff, and Masatoshi Shima** built the first single-chip microprocessor (**Intel 4004, 1971**), while **Dennis Ritchie & Ken Thompson** created **Unix and the C programming language** at Bell Labs. By the late 1970s and 1980s, **Steve Wozniak & Steve Jobs** (Apple II & Macintosh) and **Bill Gates & Paul Allen** (Microsoft & the IBM PC ecosystem) brought Personal Computers onto millions of desks, joined by **Linus Torvalds’s** open-source **Linux (1991)**. Meanwhile, **Vint Cerf & Bob Kahn (1974)** designed the **TCP/IP Internet protocol**, **Sir Tim Berners-Lee at CERN (1989–1991)** invented the **World Wide Web (HTTP, HTML, URLs)**, and in **January 2007**, **Steve Jobs** and Apple unveiled the **iPhone** — uniting multi-touch glass, cellular broadband, GPS, and mobile apps into a pocket supercomputer for billions of people!',
    stats: [
      { label: 'Era', value: '1971 (4004) → 1991 (Web) → 2007 (iPhone)' },
      { label: 'Silicon & OS Pioneers', value: 'Gordon Moore, Faggin, Ritchie & Thompson, Torvalds' },
      { label: 'Internet & Web', value: 'Vint Cerf & Bob Kahn (TCP/IP), Tim Berners-Lee (WWW)' },
      { label: 'PC & Mobile Revolution', value: 'Steve Jobs & Steve Wozniak, Bill Gates' },
    ],
    facts: [
      'When **Sir Tim Berners-Lee** built the first web server and browser at CERN in 1990, he convinced CERN to release the **World Wide Web** into the public domain royalty-free in 1993 — enabling the modern digital economy!',
      '99% of intercontinental Internet traffic flashes as laser light pulses through **1.4 million kilometers of undersea glass fiber-optic cables** laid across the abyssal ocean floor.',
      'Your smartphone’s GPS chip applies **Albert Einstein’s Special and General Relativity** every millisecond to correct the atomic clocks aboard 24+ satellites orbiting at 14,000 km/h (where weaker gravity makes satellite clocks tick 38 microseconds faster per day!).',
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
    tectonicStage: 'Year 2026 CE — Present-Day Continents, Planetary Sensors & LEO Satellites',
    icon: '🤖',
    eraBadge: '2012 – 2026 CE — WHERE WE ARE TODAY!',
    cosmicClock: '12:00:00 MIDNIGHT (Present Moment!)',
    title: 'Today (2026): Deep Learning, Transformers, AlphaFold, CRISPR & JWST',
    subtitle: 'Hinton/Hopfield/Bengio/LeCun neural nets, Vaswani et al. (2017 Transformer), Hassabis & Jumper (AlphaFold), Doudna & Charpentier (CRISPR), and JWST',
    themeColor: '#06b6d4',
    skyTint: [0.02, 0.07, 0.16],
    summary:
      'Welcome to **TODAY — Year 2026**! Over the past decade, computing shifted from hand-coded instructions to **Deep Neural Networks** pioneered by Nobel and Turing laureates **Geoffrey Hinton, John Hopfield, Yoshua Bengio, and Yann LeCun**. Following the landmark **2017 Transformer** architecture (*"Attention Is All You Need"* by **Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser, and Illia Polosukhin** at Google), frontier multimodal and agentic AI models reason across code, math, voice, video, and 3D worlds — while Nobel laureates **Demis Hassabis & John Jumper (AlphaFold)** predicted the 3D atomic structures of all 200 million known proteins! Simultaneously, **Jennifer Doudna & Emmanuelle Charpentier’s CRISPR-Cas9** gene editing cures inherited blood disorders, **Katalin Karikó & Drew Weissman’s mRNA** platform transforms medicine, **Reusable Super-Heavy Boosters** are caught by launch-tower arms, **JWST** peers back to the first galaxies 13.5 billion years ago, and terawatt **Solar + Battery Grids** surge globally!',
    stats: [
      { label: 'Current Year', value: '2026 CE (12:00:00 Midnight — You Are Here!)' },
      { label: 'AI Pioneers', value: 'Hinton, Hopfield, Bengio, LeCun, Vaswani et al. (2017)' },
      { label: 'Bio & Medicine Nobels', value: 'Hassabis & Jumper (AlphaFold), Doudna & Charpentier (CRISPR)' },
      { label: 'Space & Energy', value: 'JWST (L2), Reusable Booster Catch, Terawatt Solar' },
    ],
    facts: [
      'Think about the 3.8-billion-year symmetry: at Stop 5, ribozymes and DNA first folded proteins inside hydrothermal vents; in the 2020s, human minds trained silicon neural networks (**AlphaFold**) to solve how every protein in the biosphere folds!',
      'If all 13.8 billion years of cosmic history were compressed into a 24-hour day, the entire Industrial, Computer, and AI revolutions happened in the last **0.002 seconds** before midnight.',
      'Earth’s tectonic plates are STILL moving beneath your feet right now: the Mid-Atlantic Ridge pushes North America and Europe apart by ~2.5 cm every year — the exact speed your fingernails grow!',
    ],
    whatIf: {
      question: 'Fire Synapses Across the 3D Transformer Neural Network & Switch NASA Earth to Night-Lights!',
      buttonLabel: '🧠 Fire AI Neural Attention Layers & Night Grid',
      activeLabel: '⚡ Multimodal AI Attention Active + Global Night-Light Cities Glowing!',
      explanation:
        'Watch the multi-layer 3D neural network pulse beside NASA Earth! Billions of parallel matrix multiplications connect concepts across science, language, biology, and code.',
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
    title: '2050s: Solarpunk Cities, Commercial Tokamak Fusion & Quantum Discovery',
    subtitle: 'ITER/SPARC high-field superconducting tokamaks, Feynman fault-tolerant quantum computers, and net-negative carbon eco-arcologies',
    themeColor: '#10b981',
    skyTint: [0.02, 0.13, 0.11],
    summary:
      'Where can we steer our planetary future over the next 25 to 50 years? By the 2040s–2070s, humanity can scale **Commercial Magnetic & Inertial Fusion Power** — building on **Andrei Sakharov & Igor Tamm’s** tokamak concept, **ITER**, and high-temperature superconducting (REBCO) magnets — alongside tandem perovskite solar and solid-state batteries to deliver abundant, zero-carbon baseload energy. Fulfilling physicist **Richard Feynman’s (1981)** vision of **Fault-Tolerant Quantum Computers** (paired with **Peter Shor & Lov Grover’s** algorithms and AI), researchers can simulate nitrogen-fixing catalysts and room-temperature superconductors at the atomic level, while direct-air carbon capture and rewilding transform cities into green **Solarpunk Arcologies**!',
    stats: [
      { label: 'Time Horizon', value: '2040 – 2075 CE (Near-Future Horizon)' },
      { label: 'Fusion Physics', value: 'D-T & D-He³ Magnetic Tokamak Ignition' },
      { label: 'Quantum & AI', value: 'Fault-Tolerant Logical Qubits (Feynman Vision)' },
      { label: 'Biosphere Goal', value: 'Net-Negative CO₂ & Rewilding 30%+ of Earth' },
    ],
    facts: [
      'Nuclear fusion is the exact opposite of fission: it fuses light hydrogen isotopes (Deuterium from seawater and Tritium bred from lithium) into harmless Helium-4 — the exact stellar reaction (**Hans Bethe’s** proton-proton/CNO physics) that powers the Sun!',
      'As **Richard Feynman** pointed out in 1981, nature is quantum-mechanical: a fault-tolerant quantum computer uses superposition and entanglement to simulate complex molecular chemistry that would take classical supercomputers millions of years.',
      'Engineered carbon-capturing street trees, vertical timber forests, and synthetic cyanobacteria bioreactors can turn urban skylines into living carbon sinks.',
    ],
    whatIf: {
      question: 'Ignite the 150-Million-Degree Magnetic Fusion Plasma Torus in the Solarpunk Eco-City!',
      buttonLabel: '⚡ Ignite Tokamak Fusion Plasma!',
      activeLabel: '☀️ Fusion Ignition Achieved: Superconducting Plasma Ring at 150M °C!',
      explanation:
        'High-temperature superconducting toroidal magnets suspend the glowing purple-gold hydrogen plasma in mid-air so it never touches the reactor walls while generating clean gigawatts!',
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
    subtitle: 'Fulfilling Tsiolkovsky, Goddard, Von Braun & Sagan’s vision with pressurized Martian domes, orbital elevators & off-world mining',
    themeColor: '#f97316',
    skyTint: [0.15, 0.04, 0.03],
    summary:
      'As Russian rocket pioneer **Konstantin Tsiolkovsky** wrote in 1903: *"Earth is the cradle of humanity, but one cannot remain in the cradle forever."* Building on the rocketry foundations of **Tsiolkovsky, Robert Goddard, Hermann Oberth, Sergei Korolev, Wernher von Braun, and Carl Sagan**, 22nd-century humanity expands permanently across the inner Solar System! On the Moon, Shackleton Crater cities refine water ice and Helium-3 connected to lunar orbit by tether elevators. On **Mars**, pressurized geodesic **Biodomes** and radiation-shielded lava-tube cities house millions of citizens growing forests in detoxified perchlorate-free regolith, while a **Mars-Sun L1 Magnetic Dipole Shield** restores atmospheric pressure and **Asteroid Mining** tugs harvest platinum-group metals from near-Earth asteroids — turning Earth into a protected garden world!',
    stats: [
      { label: 'Time Horizon', value: '2100 – 2250 CE (Interplanetary Era)' },
      { label: 'Space Pioneers', value: 'Tsiolkovsky, Goddard, Korolev, Von Braun, Carl Sagan' },
      { label: 'Planetary Shield', value: 'Mars-Sun L1 Magnetic Dipole Shield + 0.38g Gravity' },
      { label: 'Transit Speed', value: 'Nuclear Fusion Plasma Drives (Earth→Mars in ~30 Days)' },
    ],
    facts: [
      'NASA planetary scientists calculated that placing an artificial **magnetic dipole shield at the Mars-Sun L1 Lagrange point** would block solar-wind stripping, allowing Mars’s polar $\\text{CO}_2$ and water-ice reserves to warm and thicken the atmosphere naturally!',
      'A single 1-kilometer metallic near-Earth asteroid (or **16 Psyche** in the main belt) contains more iron, nickel, cobalt, and platinum than humanity has ever mined in all of history.',
      'Because Mars lacks active plate tectonics like Earth, its crust stayed stationary over mantle plumes — allowing **Olympus Mons** to pile lava 21.9 km high (nearly 2.5× the height of Mount Everest)!',
    ],
    whatIf: {
      question: 'Deploy the Mars L1 Magnetic Shield & Fill Marineris Crater Lakes with Liquid Water!',
      buttonLabel: '🌿 Activate Mars Terraforming & Magnetosphere',
      activeLabel: '💧 Terraforming Phase Active: Blue Borealis Seas & Magnetosphere Aurora!',
      explanation:
        'Look at the NASA Mars globe: warming polar ice caps and shielding the upper atmosphere at L1 restores ancient shorelines in the Vastitas Borealis lowlands and Valles Marineris!',
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
    subtitle: 'Kardashev Type II Dyson Swarms, Gerard O’Neill rotating cylinder worlds, and relativistic laser-sail starships bound for Alpha Centauri',
    themeColor: '#a855f7',
    skyTint: [0.04, 0.02, 0.14],
    summary:
      'Welcome to **YEAR 3000**! A thousand years from today, humanity transitions from a **Type I (Planetary)** toward a **Type II (Stellar) Civilization** on astrophysicist **Nikolai Kardashev’s (1964) Scale**. Glittering orbital rings of solar collectors — the **Dyson Swarm** proposed by physicist **Freeman Dyson (1960)** — harvest gigawatts to petawatts of pure starlight around the Sun, beaming energy to rotating **O’Neill Cylinder Habitats** (envisioned by Princeton physicist **Gerard K. O’Neill in 1974**) spinning for 1g centrifugal gravity with rivers, clouds, and forests inside. And out beyond Neptune, kilometer-long **Interstellar Ark Starships** — propelled by gigawatt laser light-sails (inspired by **Robert Forward, Carl Sagan & Stephen Hawking’s** *Breakthrough Starshot*) and antimatter-catalyzed fusion drives — accelerate to **20% the speed of light ($0.20c$)** toward **Proxima & Alpha Centauri (4.37 light-years)**, **TRAPPIST-1**, and the 6,400+ exoplanets of the Milky Way!',
    stats: [
      { label: 'Time Horizon', value: 'Year 3000 CE (Kardashev Type I → Type II)' },
      { label: 'Visionary Physicists', value: 'Freeman Dyson (1960), N. Kardashev (1964), G. O’Neill (1974)' },
      { label: 'Starship Velocity', value: '0.20 c (60,000 km/s → Alpha Centauri in ~21 Yrs)' },
      { label: 'Future Continents', value: '+250M Yrs Ahead: Pangaea Proxima (Christopher Scotese)!' },
    ],
    facts: [
      'Bonus Tectonic Fact: Geologist **Christopher Scotese** calculated that because Earth’s plates never stop moving, **250 million years in the future** the Atlantic and Indian Oceans will subduct and all continents will collide into a new supercontinent called **Pangaea Proxima**!',
      '**Freeman Dyson** noted in his 1960 *Science* paper that a solid shell around a star would be mechanically unstable, so an advanced civilization would instead build a **Dyson Swarm** — thousands of independent solar-collector rings in staggered orbits.',
      'Earth still has roughly **1 billion years** of habitable liquid-water sunlight ahead before solar luminosity triggers a runaway greenhouse — nearly **2 full hours** remaining on our 24-hour Cosmic Clock!',
    ],
    whatIf: {
      question: 'Engage the Dyson Swarm Laser Array & Accelerate the Interstellar Ark to 20% Light Speed!',
      buttonLabel: '🚀 Engage Relativistic Laser-Sail Star Drive!',
      activeLabel: '🌟 Relativistic Drive Active: Dyson Beams Propelling Ark Ship to Alpha Centauri!',
      explanation:
        'Focused gigawatt light-beams from the Dyson Swarm push the ultra-light metamaterial laser sail to 60,000 km/s without the starship needing to carry heavy chemical propellant across interstellar space!',
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
