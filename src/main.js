import { CHAPTERS, MILESTONES, QUIZ_QUESTIONS } from './data/timelineData.js';
import {
  detectInitialLanguage,
  saveLanguagePreference,
  getLanguageMeta,
  getUIStrings,
  formatUIString,
  applyLanguageToData,
} from './data/i18n.js';
import {
  initAnalytics,
  trackEvent,
  trackMilestoneView,
  trackWorldDive,
  trackLanguageChange,
} from './analytics.js';
import { WorldEngine } from './engine/WorldEngine.js';
import { renderContinentalDriftTexture } from './engine/HyperRealKit.js';

/**
 * ChronoVerse 3D v4.1 — Main UI, 10-Language Localization & GA4 Telemetry Controller.
 * Rendering is done by WorldEngine: one real 3D world per era (museum scans, photogrammetry, HDRI light).
 * Security: Strictly uses document.createElement(), textContent, and replaceChildren().
 * Zero innerHTML, outerHTML, insertAdjacentHTML, document.write, or blocking dialogs.
 */

// Initialize Google Analytics 4 (Measurement ID: G-ZSNN1QGECJ)
initAnalytics();

/** Milestone id → 2D concept-illustration file in assets/scenes (shown ONLY in the inspector panel). */
const SCENE_ART = {
  'big-bang': 'big-bang',
  'first-stars': 'first-stars',
  'molten-earth': 'moon-impact',
  'first-organisms': 'luca-first-life',
  'oxygen-snowball': 'photosynthesis',
  'cambrian-explosion': 'cambrian-explosion',
  'land-walk': 'tiktaalik-land',
  'pangaea-great-dying': 'pangaea-permian',
  'jurassic-giants': 'jurassic-giants',
  'cretaceous-kings': 'cretaceous-trex',
  'asteroid-impact': 'chicxulub-extinction',
  'himalayas-mammals': 'himalayas-mammals',
  'lucy-bipedalism': 'hominid-ancestors',
  'homo-erectus-fire': 'discovery-of-fire',
  'sapiens-neanderthals-500k': 'neanderthals',
  'out-of-africa-100k': 'homo-sapiens',
  'beringia-americas': 'beringia-americas',
  'farming-revolution': 'farming-revolution',
  'bronze-age-pyramids': 'bronze-age-cities',
  'classical-greece': 'ancient-greece',
  'roman-empire': 'roman-empire',
  'medieval-renaissance': 'medieval-ages',
  'first-industrial-rev': 'industrial-revolution-1',
  'second-industrial-rev': 'industrial-revolution-2',
  'computers-moon': 'computers-space-age',
  'pc-internet-iphone': 'iphone-mobile-era',
  'ai-today-2026': 'ai-age-today',
  'solarpunk-2050': null,
  'mars-2150': 'interplanetary-2150',
  'year-3000': 'year-3000-dyson',
};
const artFor = (m) => (SCENE_ART[m.id] ? `./assets/scenes/${SCENE_ART[m.id]}.jpg` : null);

const splitHeadline = (title = '') => title.split(/[:：]/)[0].trim();

const canvas = document.getElementById('timeline-canvas');
const labelLayer = document.getElementById('label-layer');
const loadingScreen = document.getElementById('loading-screen');
const loadingStatusEl = document.getElementById('loading-status');
const loadingHintEl = document.querySelector('.loading-hint');
const brandSubtitleEl = document.querySelector('.brand-subtitle');
const langSelect = document.getElementById('lang-select');
const chapterStepper = document.getElementById('chapter-stepper');
const quickStopChips = document.getElementById('quick-stop-chips');
const stopsBarLabelEl = document.querySelector('.stops-bar-label');
const cosmicClockPillEl = document.querySelector('.cosmic-clock-pill');
const cosmicClockStrongEl = document.querySelector('.cosmic-clock-pill strong');
const hudCosmicClock = document.getElementById('hud-cosmic-clock');
const warpOverlay = document.getElementById('warp-overlay');
const warpEraLabel = document.getElementById('warp-era-label');
const worldLoading = document.getElementById('world-loading');
const worldLoadingText = document.getElementById('world-loading-text');
const inspectorCinemaFigure = document.getElementById('inspector-cinema-figure');
const cinemaTagEl = document.querySelector('.cinema-tag');
const whatIfEyebrowEl = document.querySelector('.what-if-eyebrow');
const inspectorSubtitles = document.querySelectorAll('#inspector-content .section-subtitle');

// Left panel elements
const leftChapterBadge = document.getElementById('left-chapter-badge');
const leftStopCounter = document.getElementById('left-stop-counter');
const leftEraDate = document.getElementById('left-era-date');
const btnPrevStop = document.getElementById('btn-prev-stop');
const btnNextStop = document.getElementById('btn-next-stop');
const paleoDriftTitleEl = document.querySelector('.paleo-drift-title');
const paleoMiniCanvas = document.getElementById('paleo-mini-canvas');
const leftTectonicStage = document.getElementById('left-tectonic-stage');
const btnMiniPangaea = document.getElementById('btn-mini-pangaea');
const cosmicDayTitleEl = document.querySelector('.cosmic-day-title');
const leftCosmicClockDesc = document.getElementById('left-cosmic-clock-desc');
const controlsHintSpans = document.querySelectorAll('.controls-hint span');

// Right inspector elements
const inspectorBadge = document.getElementById('inspector-badge');
const inspectorTitle = document.getElementById('inspector-title');
const inspectorSubtitle = document.getElementById('inspector-subtitle');
const inspectorSummary = document.getElementById('inspector-summary');
const inspectorCinemaImg = document.getElementById('inspector-cinema-img');
const btnExpandImax = document.getElementById('btn-expand-imax');
const inspectorStatsGrid = document.getElementById('inspector-stats-grid');
const inspectorFactsList = document.getElementById('inspector-facts-list');
const inspectorContent = document.getElementById('inspector-content');
const btnCollapseInspector = document.getElementById('btn-collapse-inspector');
const btnReadAloud = document.getElementById('btn-read-aloud');

// Fullscreen 8K IMAX Lightbox Modal
const imaxModal = document.getElementById('imax-modal');
const imaxModalImg = document.getElementById('imax-modal-img');
const imaxModalTitle = document.getElementById('imax-modal-title');
const imaxModalBadge = document.getElementById('imax-modal-badge');
const imaxModalCaption = document.getElementById('imax-modal-caption');
const btnCloseImax = document.getElementById('btn-close-imax');

// What-If 3D experiment elements
const whatIfQuestion = document.getElementById('what-if-question');
const btnWhatIf = document.getElementById('btn-what-if');
const whatIfExplanation = document.getElementById('what-if-explanation');

// Scrubber & Header buttons
const timelineScrubber = document.getElementById('timeline-scrubber');
const btnScrubberPrev = document.getElementById('btn-scrubber-prev');
const btnScrubberNext = document.getElementById('btn-scrubber-next');
const btnAutoplay = document.getElementById('btn-autoplay');
const btnToggleTheme = document.getElementById('btn-toggle-theme');
const btnCleanView = document.getElementById('btn-clean-view');
const btnToggleBloom = document.getElementById('btn-toggle-bloom');
const btnToggleRibbon = document.getElementById('btn-toggle-ribbon');
const btnToggleLabels = document.getElementById('btn-toggle-labels');
const btnCamIn = document.getElementById('btn-cam-in');
const btnCamOut = document.getElementById('btn-cam-out');

// Central Orbit <-> Surface Portal Action Bar
const portalModeBadge = document.getElementById('portal-mode-badge');
const btnPortalDive = document.getElementById('btn-portal-dive');
const btnPortalWarpNext = document.getElementById('btn-portal-warp-next');
const btnPortalAutodive = document.getElementById('btn-portal-autodive');
const scrubberTickBtns = document.querySelectorAll('.scrubber-tick-btn');

// Pangaea Interactive Splitter Modal
const pangaeaModal = document.getElementById('pangaea-modal');
const pangaeaModalTitleEl = document.getElementById('pangaea-modal-title');
const pangaeaModalSubtitleEl = document.querySelector('#pangaea-modal .modal-subtitle');
const btnOpenPangaea = document.getElementById('btn-open-pangaea');
const btnClosePangaea = document.getElementById('btn-close-pangaea');
const pangaeaLabCanvas = document.getElementById('pangaea-lab-canvas');
const pangaeaScrubber = document.getElementById('pangaea-scrubber');
const pangaeaSliderBadge = document.getElementById('pangaea-slider-badge');
const pangaeaLabDescription = document.getElementById('pangaea-lab-description');
const pangaeaPresetBtns = document.querySelectorAll('.pangaea-preset');
const pangaeaTickSpans = document.querySelectorAll('.pangaea-slider-wrap .scrubber-ticks span');

// Atlas & Quiz Modals
const atlasModal = document.getElementById('atlas-modal');
const atlasModalTitleEl = document.getElementById('atlas-modal-title');
const atlasModalSubtitleEl = document.querySelector('#atlas-modal .modal-subtitle');
const btnOpenAtlas = document.getElementById('btn-open-atlas');
const btnCloseAtlas = document.getElementById('btn-close-atlas');
const atlasSearch = document.getElementById('atlas-search');
const atlasGrid = document.getElementById('atlas-grid');

const quizModal = document.getElementById('quiz-modal');
const quizModalTitleEl = document.getElementById('quiz-modal-title');
const btnOpenQuiz = document.getElementById('btn-open-quiz');
const btnCloseQuiz = document.getElementById('btn-close-quiz');
const quizBody = document.getElementById('quiz-body');

let currentLang = detectInitialLanguage();
let ui = getUIStrings(currentLang);
applyLanguageToData(currentLang, CHAPTERS, MILESTONES, QUIZ_QUESTIONS);
if (langSelect) {
  langSelect.value = currentLang;
}
document.documentElement.lang = getLanguageMeta(currentLang).htmlLang;

let showLabels = true;
let isReadingAloud = false;
let quizIndex = 0;
let quizScore = 0;

const chapterButtons = new Map();
const stopChipButtons = new Map();
const floatingMarkerMap = new Map();

function updatePortalBarUI(viewMode, milestone) {
  if (!btnPortalDive || !portalModeBadge || !milestone) return;
  const shortName = splitHeadline(milestone.title);
  if (viewMode === 'surface') {
    portalModeBadge.textContent = formatUIString(ui.portalSurfaceBadge, { era: milestone.eraBadge });
    portalModeBadge.classList.add('surface-active');
    btnPortalDive.textContent = ui.portalExitSurfaceBtn;
    btnPortalDive.classList.add('surface-mode');
  } else {
    portalModeBadge.textContent = formatUIString(ui.portalSpaceBadge, { era: milestone.eraBadge });
    portalModeBadge.classList.remove('surface-active');
    btnPortalDive.textContent = formatUIString(ui.portalDiveBtn, { title: shortName });
    btnPortalDive.classList.remove('surface-mode');
  }
}

const engine = new WorldEngine(canvas, MILESTONES, {
  onReady() {
    loadingScreen.classList.add('hidden');
    const m = MILESTONES[engine.activeIndex];
    renderMilestoneDetails(m, engine.activeIndex);
    updatePortalBarUI(engine.viewMode, m);
    trackMilestoneView(m, engine.activeIndex, engine.viewMode);
    if (new URLSearchParams(window.location.search).get('cleanview') === '1') {
      document.body.classList.add('clean-view');
    }
  },
  onMilestoneChange(milestone, index) {
    renderMilestoneDetails(milestone, index);
    updatePortalBarUI(engine.viewMode, milestone);
    trackMilestoneView(milestone, index, engine.viewMode);
  },
  onViewModeChange(viewMode, milestone) {
    floatingMarkerMap.forEach((btn) => btn.remove());
    floatingMarkerMap.clear();
    const activeMs = milestone || MILESTONES[engine.activeIndex];
    updatePortalBarUI(viewMode, activeMs);
    trackWorldDive(activeMs, viewMode);
  },
  onWarp(active, milestone) {
    if (!warpOverlay) return;
    if (active && engine.showTunnelRibbon !== false) {
      warpEraLabel.textContent = `${ui.warpPrefix} ${milestone.icon} ${milestone.eraBadge}`;
      warpOverlay.classList.add('active');
    } else {
      warpOverlay.classList.remove('active');
    }
  },
  onWorldLoading(loading, milestone) {
    if (!worldLoading) return;
    worldLoading.classList.toggle('hidden', !loading);
    if (loading) {
      worldLoadingText.textContent = formatUIString(ui.worldLoadingPrefix, {
        title: splitHeadline(milestone.title),
      });
    }
  },
  onAutoPlayChange(playing) {
    btnAutoplay.classList.toggle('active', playing);
    btnAutoplay.setAttribute('aria-pressed', String(playing));
    btnAutoplay.textContent = playing ? ui.btnAutopilotPause : ui.btnAutopilotPlay;
  },
  onFrame(currentProgress) {
    if (document.activeElement !== timelineScrubber) {
      timelineScrubber.value = currentProgress.toFixed(2);
    }
    updateFloatingMarkers();
  },
});

function applyStaticUITranslations() {
  document.title = ui.pageTitle;
  document.documentElement.lang = getLanguageMeta(currentLang).htmlLang;

  if (brandSubtitleEl) brandSubtitleEl.textContent = ui.brandSubtitle;
  if (loadingStatusEl) loadingStatusEl.textContent = ui.loadingStatus;
  if (loadingHintEl) loadingHintEl.textContent = ui.loadingHint;

  if (btnOpenPangaea) {
    btnOpenPangaea.textContent = ui.btnPangaea;
    btnOpenPangaea.title = ui.btnPangaeaTitle;
  }
  if (btnOpenAtlas) {
    btnOpenAtlas.textContent = ui.btnAtlas;
    btnOpenAtlas.title = ui.btnAtlasTitle;
  }
  if (btnAutoplay) {
    btnAutoplay.textContent = engine.isAutoPlaying ? ui.btnAutopilotPause : ui.btnAutopilotPlay;
  }
  if (btnOpenQuiz) {
    btnOpenQuiz.textContent = ui.btnQuiz;
  }
  if (btnToggleTheme) {
    const isLight = document.body.classList.contains('light-theme');
    btnToggleTheme.textContent = isLight ? ui.btnDarkMode : ui.btnLightMode;
  }
  if (btnCleanView) {
    const clean = document.body.classList.contains('clean-view');
    btnCleanView.textContent = clean ? ui.btnShowPanels : ui.btnCleanView;
  }

  if (stopsBarLabelEl) stopsBarLabelEl.textContent = ui.warpBarLabel;
  if (cosmicClockPillEl) cosmicClockPillEl.title = ui.cosmicClockTooltip;
  if (cosmicClockStrongEl) cosmicClockStrongEl.textContent = ui.cosmicClockLabel;

  if (btnPrevStop) btnPrevStop.textContent = ui.btnPrevStop;
  if (btnNextStop) btnNextStop.textContent = ui.btnNextStop;
  if (paleoDriftTitleEl) paleoDriftTitleEl.textContent = ui.driftTitle;
  if (btnMiniPangaea) btnMiniPangaea.textContent = ui.btnInteractiveLab;
  if (cosmicDayTitleEl) cosmicDayTitleEl.textContent = ui.cosmicDayTitle;
  if (leftCosmicClockDesc) leftCosmicClockDesc.textContent = ui.cosmicDayDesc;

  if (btnToggleBloom) btnToggleBloom.textContent = ui.btnBloom;
  if (btnToggleRibbon) btnToggleRibbon.textContent = ui.btnAO;
  if (btnToggleLabels) btnToggleLabels.textContent = ui.btnLabels;
  if (btnCamIn) btnCamIn.textContent = ui.btnZoomIn;
  if (btnCamOut) btnCamOut.textContent = ui.btnZoomOut;

  if (controlsHintSpans.length >= 3) {
    controlsHintSpans[0].textContent = ui.hintScroll;
    controlsHintSpans[1].textContent = ui.hintDrag;
    controlsHintSpans[2].textContent = ui.hintKeys;
  }

  if (btnReadAloud) {
    btnReadAloud.textContent = isReadingAloud ? ui.btnStopAudio : ui.btnReadAloud;
  }
  if (btnCollapseInspector) {
    const hidden = inspectorContent.classList.contains('hidden');
    btnCollapseInspector.textContent = hidden ? ui.btnDetails : ui.btnHide;
  }
  if (cinemaTagEl) cinemaTagEl.textContent = ui.cinemaTag;
  if (btnExpandImax) btnExpandImax.textContent = ui.btnViewLarge;
  if (whatIfEyebrowEl) whatIfEyebrowEl.textContent = ui.whatIfEyebrow;

  if (inspectorSubtitles.length >= 2) {
    inspectorSubtitles[0].textContent = ui.eraSnapshotTitle;
    inspectorSubtitles[1].textContent = ui.funFactsTitle;
  }

  if (btnPortalWarpNext) btnPortalWarpNext.textContent = ui.portalWarpNextBtn;
  if (btnPortalAutodive) {
    btnPortalAutodive.textContent = engine.autoDiveOnArrival
      ? ui.portalAutoZoomOn
      : ui.portalAutoZoomOff;
  }

  if (Array.isArray(ui.scrubberTicks)) {
    scrubberTickBtns.forEach((btn, i) => {
      if (ui.scrubberTicks[i]) {
        btn.textContent = ui.scrubberTicks[i];
      }
    });
  }

  if (pangaeaModalTitleEl) pangaeaModalTitleEl.textContent = ui.pangaeaModalTitle;
  if (pangaeaModalSubtitleEl) pangaeaModalSubtitleEl.textContent = ui.pangaeaModalSubtitle;
  if (Array.isArray(ui.pangaeaPresets)) {
    pangaeaPresetBtns.forEach((btn, i) => {
      if (ui.pangaeaPresets[i]) {
        btn.textContent = ui.pangaeaPresets[i];
      }
    });
  }
  if (Array.isArray(ui.pangaeaTicks)) {
    pangaeaTickSpans.forEach((sp, i) => {
      if (ui.pangaeaTicks[i]) {
        sp.textContent = ui.pangaeaTicks[i];
      }
    });
  }

  if (atlasModalTitleEl) atlasModalTitleEl.textContent = ui.atlasModalTitle;
  if (atlasModalSubtitleEl) atlasModalSubtitleEl.textContent = ui.atlasModalSubtitle;
  if (atlasSearch) atlasSearch.placeholder = ui.atlasSearchPlaceholder;
  if (quizModalTitleEl) quizModalTitleEl.textContent = ui.quizModalTitle;
}

function setLanguage(nextLang, userInitiated = false) {
  currentLang = saveLanguagePreference(nextLang);
  ui = getUIStrings(currentLang);
  applyLanguageToData(currentLang, CHAPTERS, MILESTONES, QUIZ_QUESTIONS);

  if (langSelect && langSelect.value !== currentLang) {
    langSelect.value = currentLang;
  }

  // Update corridor portal labels so 3D pins reflect the active language
  if (engine && engine.corridor && Array.isArray(engine.corridor.nodes)) {
    engine.corridor.nodes.forEach((node) => {
      if (node && node.milestone) {
        node.portalLabel = formatUIString(ui.markerDivePrefix, {
          title: splitHeadline(node.milestone.title),
        });
      }
    });
  }

  floatingMarkerMap.forEach((btn) => btn.remove());
  floatingMarkerMap.clear();

  applyStaticUITranslations();
  buildNavigationBars();

  const activeMs = MILESTONES[engine.activeIndex] || MILESTONES[0];
  renderMilestoneDetails(activeMs, engine.activeIndex);
  updatePortalBarUI(engine.viewMode, activeMs);

  if (!pangaeaModal.classList.contains('hidden')) {
    renderPangaeaLabModal(parseFloat(pangaeaScrubber.value || '250'));
  }
  if (!atlasModal.classList.contains('hidden')) {
    renderAtlasList(atlasSearch.value);
  }
  if (!quizModal.classList.contains('hidden')) {
    renderQuizStep();
  }

  if (userInitiated) {
    trackLanguageChange(currentLang);
  }
}

function buildNavigationBars() {
  // 1. Build 9 Chapter Stepper Buttons
  chapterStepper.replaceChildren();
  chapterButtons.clear();
  CHAPTERS.forEach((chapter) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chapter-pill';
    btn.textContent = `${chapter.icon} ${chapter.shortTitle}`;
    btn.title = `${chapter.title} (${chapter.range})`;
    btn.addEventListener('click', () => {
      const firstMilestoneIdx = MILESTONES.findIndex((m) => m.chapterId === chapter.id);
      if (firstMilestoneIdx >= 0) {
        engine.flyToIndex(firstMilestoneIdx);
      }
    });
    chapterStepper.appendChild(btn);
    chapterButtons.set(chapter.id, btn);
  });

  // 2. Build 30 Quick-Stop Chips
  quickStopChips.replaceChildren();
  stopChipButtons.clear();
  MILESTONES.forEach((m, idx) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'stop-chip';
    chip.textContent = `${m.icon} ${splitHeadline(m.title)}`;
    chip.addEventListener('click', () => engine.flyToIndex(idx));
    quickStopChips.appendChild(chip);
    stopChipButtons.set(idx, chip);
  });
}

function drawPaleoMiniMap(milestone) {
  if (!paleoMiniCanvas) return;
  const ctx = paleoMiniCanvas.getContext('2d');
  const w = paleoMiniCanvas.width;
  const h = paleoMiniCanvas.height;

  if (milestone.paleoMa === null || milestone.paleoMa === undefined) {
    // Pre-Earth Cosmic Space
    const g = ctx.createRadialGradient(w * 0.5, h * 0.5, 4, w * 0.5, h * 0.5, w * 0.6);
    g.addColorStop(0, '#f97316');
    g.addColorStop(0.45, '#3b0764');
    g.addColorStop(1, '#020617');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ui.preEarthCosmic, w * 0.5, h * 0.54);
    return;
  }

  const driftCanvas = renderContinentalDriftTexture(milestone.paleoMa);
  ctx.drawImage(driftCanvas.image || driftCanvas, 0, 0, w, h);

  // Overlay subtle latitude/longitude graticule & era label
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(w, h * 0.5);
  ctx.moveTo(w * 0.5, 0);
  ctx.lineTo(w * 0.5, h);
  ctx.stroke();

  // Label key geological features
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.fillRect(6, h - 24, w - 12, 18);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  const maText =
    milestone.paleoMa >= 1
      ? `${milestone.paleoMa} ${ui.myaSuffix}`
      : milestone.paleoMa > 0
      ? `${Math.round(milestone.paleoMa * 1000)} ${ui.kyaSuffix}`
      : ui.modernContinents;
  ctx.fillText(`🗺️ ${maText}`, 12, h - 11);
}

function renderPangaeaLabModal(paleoMa) {
  if (!pangaeaLabCanvas) return;
  const ctx = pangaeaLabCanvas.getContext('2d');
  const w = pangaeaLabCanvas.width;
  const h = pangaeaLabCanvas.height;

  const driftCanvas = renderContinentalDriftTexture(paleoMa);
  ctx.drawImage(driftCanvas.image || driftCanvas, 0, 0, w, h);

  // Graticule lines
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 1;
  for (let x = 1; x < 6; x++) {
    ctx.beginPath();
    ctx.moveTo((w / 6) * x, 0);
    ctx.lineTo((w / 6) * x, h);
    ctx.stroke();
  }
  for (let y = 1; y < 4; y++) {
    ctx.beginPath();
    ctx.moveTo(0, (h / 4) * y);
    ctx.lineTo(w, (h / 4) * y);
    ctx.stroke();
  }

  // Dynamic continent name callouts interpolated by u = clamp(paleoMa / 250)
  const u = Math.max(0, Math.min(1, paleoMa / 250));
  const lerp = (a, b, t) => a + (b - a) * t;
  const cNames = ui.continents || {};
  const labels = [
    { name: cNames.nAmerica || 'N. America', x: lerp(0.22, 0.39, u), y: lerp(0.30, 0.38, u) },
    { name: cNames.sAmerica || 'S. America', x: lerp(0.32, 0.44, u), y: lerp(0.66, 0.64, u) },
    { name: cNames.africa || 'Africa', x: lerp(0.53, 0.52, u), y: lerp(0.54, 0.55, u) },
    { name: cNames.eurasia || 'Eurasia', x: lerp(0.64, 0.58, u), y: lerp(0.28, 0.33, u) },
    { name: cNames.india || 'India', x: lerp(0.68, 0.62, u), y: lerp(0.45, 0.72, u) },
    { name: cNames.australia || 'Australia', x: lerp(0.81, 0.69, u), y: lerp(0.71, 0.77, u) },
    { name: cNames.antarctica || 'Antarctica', x: lerp(0.55, 0.58, u), y: lerp(0.91, 0.86, u) },
  ];

  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((lbl) => {
    const px = lbl.x * w;
    const py = lbl.y * h;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.fillRect(px - 46, py - 11, 92, 19);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.strokeRect(px - 46, py - 11, 92, 19);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(lbl.name, px, py + 3);
  });

  // Update stage badge & narrative
  const st = ui.pangaeaStages || {};
  if (paleoMa >= 220) {
    pangaeaSliderBadge.textContent = formatUIString(st.s220Badge, { ma: paleoMa });
    pangaeaLabDescription.textContent = st.s220Desc;
  } else if (paleoMa >= 130) {
    pangaeaSliderBadge.textContent = formatUIString(st.s130Badge, { ma: paleoMa });
    pangaeaLabDescription.textContent = st.s130Desc;
  } else if (paleoMa >= 55) {
    pangaeaSliderBadge.textContent = formatUIString(st.s55Badge, { ma: paleoMa });
    pangaeaLabDescription.textContent = st.s55Desc;
  } else if (paleoMa >= 5) {
    pangaeaSliderBadge.textContent = formatUIString(st.s5Badge, { ma: paleoMa });
    pangaeaLabDescription.textContent = st.s5Desc;
  } else if (paleoMa > 0.005) {
    pangaeaSliderBadge.textContent = formatUIString(st.sIceBadge, {
      ka: Math.round(paleoMa * 1000),
    });
    pangaeaLabDescription.textContent = st.sIceDesc;
  } else {
    pangaeaSliderBadge.textContent = st.sTodayBadge;
    pangaeaLabDescription.textContent = st.sTodayDesc;
  }
}

function renderMilestoneDetails(milestone, index) {
  document.documentElement.style.setProperty('--era-color', milestone.themeColor);

  const chapter = CHAPTERS.find((c) => c.id === milestone.chapterId) || CHAPTERS[0];
  leftChapterBadge.textContent = `${ui.chapterWord} ${chapter.number} • ${chapter.title.toUpperCase()}`;
  leftStopCounter.textContent = formatUIString(ui.stopOf, {
    current: index + 1,
    total: MILESTONES.length,
  });
  leftEraDate.textContent = milestone.eraBadge;
  hudCosmicClock.textContent = milestone.cosmicClock;

  btnPrevStop.disabled = index <= 0;
  btnNextStop.disabled = index >= MILESTONES.length - 1;

  // Update Live Continental Drift Mini-Map
  leftTectonicStage.textContent = milestone.tectonicStage || ui.modernContinents;
  drawPaleoMiniMap(milestone);

  // Highlight active Chapter & Stop Chip
  chapterButtons.forEach((btn, chId) => {
    btn.classList.toggle('active', chId === milestone.chapterId);
  });
  stopChipButtons.forEach((chip, idx) => {
    const active = idx === index;
    chip.classList.toggle('active', active);
    if (active) {
      chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });

  // Right Inspector Content
  inspectorBadge.textContent = `${milestone.icon} ${milestone.eraBadge}`;
  inspectorTitle.textContent = milestone.title;
  inspectorSubtitle.textContent = milestone.subtitle;
  inspectorSummary.textContent = milestone.summary;

  // 2D concept illustration (clearly labelled; the 3D world is the real content)
  if (inspectorCinemaImg) {
    const art = artFor(milestone);
    if (art) {
      inspectorCinemaImg.src = art;
      inspectorCinemaImg.alt = `${milestone.title} — concept illustration`;
    }
    if (inspectorCinemaFigure) inspectorCinemaFigure.classList.toggle('hidden', !art);
  }

  // What-If 3D Experiment Card
  const isWhatIf = engine.isWhatIfActive(milestone.id);
  whatIfQuestion.textContent = milestone.whatIf.question;
  updateWhatIfUI(milestone, isWhatIf);

  // Stats Grid
  inspectorStatsGrid.replaceChildren();
  milestone.stats.forEach((st) => {
    const box = document.createElement('div');
    box.className = 'stat-box';
    const lbl = document.createElement('div');
    lbl.className = 'stat-label';
    lbl.textContent = st.label;
    const val = document.createElement('div');
    val.className = 'stat-value';
    val.textContent = st.value;
    box.append(lbl, val);
    inspectorStatsGrid.appendChild(box);
  });

  // Mind-Blowing Facts
  inspectorFactsList.replaceChildren();
  milestone.facts.forEach((factText) => {
    const li = document.createElement('li');
    li.textContent = factText;
    inspectorFactsList.appendChild(li);
  });

  if (isReadingAloud) {
    speakMilestone(milestone);
  }
}

function updateWhatIfUI(milestone, active) {
  btnWhatIf.classList.toggle('active', active);
  btnWhatIf.setAttribute('aria-pressed', String(active));
  btnWhatIf.textContent = active ? milestone.whatIf.activeLabel : milestone.whatIf.buttonLabel;
  whatIfExplanation.textContent = milestone.whatIf.explanation;
  whatIfExplanation.classList.toggle('hidden', !active);
}

function updateFloatingMarkers() {
  if (!showLabels) {
    labelLayer.replaceChildren();
    floatingMarkerMap.clear();
    return;
  }

  const visibleMarkers = engine.getProjectedMarkers();
  const seenKeys = new Set();
  const eraKey = `${engine.viewMode}:${engine.activeIndex}:${currentLang}`;

  visibleMarkers.forEach(({ index, milestone, x, y, distance, action, targetStop }) => {
    const key = `${eraKey}:${index}`;
    seenKeys.add(key);
    let btn = floatingMarkerMap.get(key);
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = action === 'dive' ? 'marker-tag poi-tag portal-pin-tag' : 'marker-tag poi-tag';
      if (action === 'dive') {
        const ms = MILESTONES[targetStop ?? engine.activeIndex] || milestone;
        btn.textContent = formatUIString(ui.markerDivePrefix, {
          title: splitHeadline(ms.title),
        });
      } else if (action === 'warp') {
        const nextMs = MILESTONES[targetStop ?? engine.activeIndex + 1];
        btn.textContent = nextMs
          ? formatUIString(ui.markerNextEarthPrefix, {
              era: nextMs.eraBadge,
              title: splitHeadline(nextMs.title),
            })
          : `${milestone.icon} ${milestone.title}`;
      } else {
        btn.textContent = `${milestone.icon} ${milestone.title}`;
      }
      btn.addEventListener('click', () => {
        if (action === 'dive') {
          engine.zoomIntoWorld(targetStop ?? engine.activeIndex);
        } else if (action === 'warp') {
          engine.flyToIndex(targetStop ?? engine.activeIndex + 1);
        } else {
          engine.zoomCamera(-2.5);
        }
      });
      labelLayer.appendChild(btn);
      floatingMarkerMap.set(key, btn);
    }
    const scale = Math.max(0.75, Math.min(1.05, 22 / Math.max(1, distance || 12)));
    btn.style.left = `${x.toFixed(1)}px`;
    btn.style.top = `${y.toFixed(1)}px`;
    btn.style.transform = `translate(-50%, -100%) scale(${scale.toFixed(2)})`;
  });

  floatingMarkerMap.forEach((btn, key) => {
    if (!seenKeys.has(key)) {
      btn.remove();
      floatingMarkerMap.delete(key);
    }
  });
}

// Speech Synthesis Read-Aloud in all 10 Languages
function speakMilestone(milestone) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const text = `${milestone.eraBadge}. ${milestone.title}. ${milestone.summary} ${ui.mindBlowingFactPrefix} ${milestone.facts[0]}`;
  const utter = new SpeechSynthesisUtterance(text);
  const langMeta = getLanguageMeta(currentLang);
  utter.lang = langMeta.ttsLang;
  utter.rate = 1.0;
  utter.pitch = 1.05;
  utter.onend = () => {
    isReadingAloud = false;
    btnReadAloud.textContent = ui.btnReadAloud;
    btnReadAloud.setAttribute('aria-pressed', 'false');
  };
  window.speechSynthesis.speak(utter);
}

// All 30 Stops Atlas Modal with Photorealistic Thumbnails
function renderAtlasList(query = '') {
  const q = query.trim().toLowerCase();
  atlasGrid.replaceChildren();

  MILESTONES.forEach((m, idx) => {
    if (
      q &&
      !m.title.toLowerCase().includes(q) &&
      !m.summary.toLowerCase().includes(q) &&
      !m.eraBadge.toLowerCase().includes(q) &&
      !(m.tectonicStage && m.tectonicStage.toLowerCase().includes(q))
    ) {
      return;
    }
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'atlas-card';
    card.setAttribute('role', 'listitem');

    const thumb = document.createElement('img');
    thumb.className = 'atlas-card-thumb';
    const art = artFor(m);
    if (art) thumb.src = art;
    else thumb.classList.add('hidden');
    thumb.alt = m.title;
    thumb.loading = 'lazy';

    const era = document.createElement('div');
    era.className = 'atlas-card-era';
    era.textContent = `${ui.atlasStopPrefix} ${idx + 1} • ${m.eraBadge}`;

    const title = document.createElement('div');
    title.className = 'atlas-card-title';
    title.textContent = `${m.icon} ${m.title}`;

    const sub = document.createElement('div');
    sub.className = 'atlas-card-sub';
    sub.textContent = m.subtitle;

    card.append(thumb, era, title, sub);
    card.addEventListener('click', () => {
      atlasModal.classList.add('hidden');
      engine.flyToIndex(idx);
    });
    atlasGrid.appendChild(card);
  });
}

// Interactive Quiz Modal
function renderQuizStep() {
  quizBody.replaceChildren();

  if (quizIndex >= QUIZ_QUESTIONS.length) {
    const doneTitle = document.createElement('h3');
    doneTitle.textContent = formatUIString(ui.quizDoneTitle, {
      score: quizScore,
      total: QUIZ_QUESTIONS.length,
    });

    const badgeText = document.createElement('p');
    badgeText.className = 'inspector-summary';
    badgeText.textContent = quizScore >= 7 ? ui.quizRankMaster : ui.quizRankExplorer;

    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'what-if-btn';
    retryBtn.textContent = ui.quizPlayAgain;
    retryBtn.addEventListener('click', () => {
      quizIndex = 0;
      quizScore = 0;
      renderQuizStep();
    });

    quizBody.append(doneTitle, badgeText, retryBtn);
    trackEvent('quiz_completed', {
      score: quizScore,
      total: QUIZ_QUESTIONS.length,
      language: currentLang,
    });
    return;
  }

  const item = QUIZ_QUESTIONS[quizIndex];
  const progress = document.createElement('div');
  progress.className = 'chapter-eyebrow';
  progress.textContent = formatUIString(ui.quizProgress, {
    current: quizIndex + 1,
    total: QUIZ_QUESTIONS.length,
    score: quizScore,
  });

  const qTitle = document.createElement('h3');
  qTitle.textContent = item.q;

  const optionsWrap = document.createElement('div');
  optionsWrap.style.display = 'flex';
  optionsWrap.style.flexDirection = 'column';
  optionsWrap.style.gap = '0.5rem';

  const feedback = document.createElement('p');
  feedback.className = 'what-if-explanation hidden';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'what-if-btn hidden';
  nextBtn.textContent =
    quizIndex + 1 < QUIZ_QUESTIONS.length ? ui.quizNext : ui.quizSeeScore;
  nextBtn.addEventListener('click', () => {
    quizIndex += 1;
    renderQuizStep();
  });

  item.options.forEach((optText, idx) => {
    const optBtn = document.createElement('button');
    optBtn.type = 'button';
    optBtn.className = 'quiz-option-btn';
    optBtn.textContent = optText;
    optBtn.addEventListener('click', () => {
      Array.from(optionsWrap.children).forEach((b) => {
        b.disabled = true;
      });
      const isCorrect = idx === item.correct;
      if (isCorrect) {
        optBtn.classList.add('correct');
        quizScore += 1;
        feedback.textContent = `${ui.quizCorrect} ${item.explanation}`;
      } else {
        optBtn.classList.add('wrong');
        optionsWrap.children[item.correct].classList.add('correct');
        feedback.textContent = `${ui.quizTry} ${item.explanation}`;
      }
      trackEvent('quiz_answer', {
        question_index: quizIndex + 1,
        correct: isCorrect,
        language: currentLang,
      });
      feedback.classList.remove('hidden');
      nextBtn.classList.remove('hidden');
    });
    optionsWrap.appendChild(optBtn);
  });

  quizBody.append(progress, qTitle, optionsWrap, feedback, nextBtn);
}

// Language selector listener
if (langSelect) {
  langSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value, true);
  });
}

// Event Listeners
btnPrevStop.addEventListener('click', () => engine.flyToIndex(engine.activeIndex - 1));
btnNextStop.addEventListener('click', () => engine.flyToIndex(engine.activeIndex + 1));
btnScrubberPrev.addEventListener('click', () => engine.flyToIndex(engine.activeIndex - 1));
btnScrubberNext.addEventListener('click', () => engine.flyToIndex(engine.activeIndex + 1));

timelineScrubber.addEventListener('input', (e) => {
  engine.setAutoPlay(false);
  engine.setTargetProgress(parseFloat(e.target.value));
});

btnWhatIf.addEventListener('click', () => {
  const m = MILESTONES[engine.activeIndex];
  const active = engine.toggleWhatIf(m.id);
  updateWhatIfUI(m, active);
  trackEvent('what_if_toggle', {
    milestone_id: m.id,
    active,
    language: currentLang,
  });
});

btnAutoplay.addEventListener('click', () => {
  if (!engine.isAutoPlaying && engine.activeIndex >= MILESTONES.length - 1) {
    engine.setTargetProgress(0);
  }
  engine.setAutoPlay(!engine.isAutoPlaying);
  trackEvent('autopilot_toggle', {
    playing: engine.isAutoPlaying,
    language: currentLang,
  });
});

btnReadAloud.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) return;
  if (isReadingAloud) {
    window.speechSynthesis.cancel();
    isReadingAloud = false;
    btnReadAloud.textContent = ui.btnReadAloud;
    btnReadAloud.setAttribute('aria-pressed', 'false');
  } else {
    isReadingAloud = true;
    btnReadAloud.textContent = ui.btnStopAudio;
    btnReadAloud.setAttribute('aria-pressed', 'true');
    const activeMs = MILESTONES[engine.activeIndex];
    speakMilestone(activeMs);
    trackEvent('read_aloud', {
      milestone_id: activeMs.id,
      language: currentLang,
    });
  }
});

btnCollapseInspector.addEventListener('click', () => {
  const hidden = inspectorContent.classList.toggle('hidden');
  btnCollapseInspector.textContent = hidden ? ui.btnDetails : ui.btnHide;
  btnCollapseInspector.setAttribute('aria-expanded', String(!hidden));
});

btnToggleTheme.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-theme');
  engine.setLightTheme(isLight);
  btnToggleTheme.setAttribute('aria-pressed', String(isLight));
  btnToggleTheme.textContent = isLight ? ui.btnDarkMode : ui.btnLightMode;
});

btnCleanView.addEventListener('click', () => {
  const clean = document.body.classList.toggle('clean-view');
  btnCleanView.setAttribute('aria-pressed', String(clean));
  btnCleanView.textContent = clean ? ui.btnShowPanels : ui.btnCleanView;
});

btnToggleBloom.addEventListener('click', () => {
  const next = !engine.bloomEnabled;
  engine.setBloomEnabled(next);
  btnToggleBloom.classList.toggle('active-toggle', next);
  btnToggleBloom.setAttribute('aria-pressed', String(next));
});

btnToggleRibbon.addEventListener('click', () => {
  const next = !engine.aoEnabled;
  engine.setAOEnabled(next);
  btnToggleRibbon.classList.toggle('active-toggle', next);
  btnToggleRibbon.setAttribute('aria-pressed', String(next));
});

btnToggleLabels.addEventListener('click', () => {
  showLabels = !showLabels;
  btnToggleLabels.classList.toggle('active-toggle', showLabels);
  btnToggleLabels.setAttribute('aria-pressed', String(showLabels));
});

btnCamIn.addEventListener('click', () => engine.zoomCamera(-1.2));
btnCamOut.addEventListener('click', () => engine.zoomCamera(1.2));

// Central Portal Action Bar (Orbit <-> Surface 3D Switcher & Fast-Forward Warp)
if (btnPortalDive) {
  btnPortalDive.addEventListener('click', () => {
    engine.toggleViewMode();
  });
}

if (btnPortalWarpNext) {
  btnPortalWarpNext.addEventListener('click', () => {
    const nextIdx = engine.activeIndex + 1 < MILESTONES.length ? engine.activeIndex + 1 : 0;
    engine.flyToIndex(nextIdx);
  });
}

if (btnPortalAutodive) {
  btnPortalAutodive.addEventListener('click', () => {
    engine.autoDiveOnArrival = !engine.autoDiveOnArrival;
    btnPortalAutodive.classList.toggle('active', engine.autoDiveOnArrival);
    btnPortalAutodive.setAttribute('aria-pressed', String(engine.autoDiveOnArrival));
    btnPortalAutodive.textContent = engine.autoDiveOnArrival
      ? ui.portalAutoZoomOn
      : ui.portalAutoZoomOff;
  });
}

scrubberTickBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const stopIdx = Number.parseInt(btn.getAttribute('data-stop'), 10);
    if (!Number.isNaN(stopIdx)) {
      engine.flyToIndex(stopIdx);
    }
  });
});

// Fullscreen 8K IMAX Lightbox Handlers
function openImaxModal() {
  const m = MILESTONES[engine.activeIndex];
  if (!m || !imaxModal) return;
  const art = artFor(m);
  if (!art) return;
  imaxModalImg.src = art;
  imaxModalImg.alt = `${m.title} — concept illustration`;
  imaxModalTitle.textContent = `🎬 ${m.icon} ${m.title}`;
  imaxModalBadge.textContent = `${m.eraBadge} • ${m.cosmicClock}`;
  imaxModalCaption.textContent = `${m.subtitle} — ${m.summary}`;
  imaxModal.classList.remove('hidden');
  trackEvent('open_imax_modal', { milestone_id: m.id, language: currentLang });
}

if (btnExpandImax) {
  btnExpandImax.addEventListener('click', openImaxModal);
}
if (inspectorCinemaImg) {
  inspectorCinemaImg.addEventListener('click', openImaxModal);
}
if (btnCloseImax) {
  btnCloseImax.addEventListener('click', () => imaxModal.classList.add('hidden'));
}

// Pangaea Splitter Modal Handlers
function openPangaeaModal() {
  const activeMilestone = MILESTONES[engine.activeIndex];
  const initialMa =
    activeMilestone.paleoMa !== null && activeMilestone.paleoMa !== undefined
      ? Math.min(250, activeMilestone.paleoMa)
      : 250;
  pangaeaScrubber.value = String(initialMa);
  renderPangaeaLabModal(initialMa);
  pangaeaModal.classList.remove('hidden');
  trackEvent('open_pangaea_lab', { initial_ma: initialMa, language: currentLang });
}

btnOpenPangaea.addEventListener('click', openPangaeaModal);
btnMiniPangaea.addEventListener('click', openPangaeaModal);
btnClosePangaea.addEventListener('click', () => pangaeaModal.classList.add('hidden'));

pangaeaScrubber.addEventListener('input', (e) => {
  renderPangaeaLabModal(parseFloat(e.target.value));
});

pangaeaPresetBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const ma = parseFloat(btn.getAttribute('data-ma'));
    pangaeaScrubber.value = String(ma);
    renderPangaeaLabModal(ma);
  });
});

// Atlas & Quiz Modals
btnOpenAtlas.addEventListener('click', () => {
  renderAtlasList(atlasSearch.value);
  atlasModal.classList.remove('hidden');
  atlasSearch.focus();
  trackEvent('open_atlas_modal', { language: currentLang });
});
btnCloseAtlas.addEventListener('click', () => atlasModal.classList.add('hidden'));
atlasSearch.addEventListener('input', (e) => renderAtlasList(e.target.value));

btnOpenQuiz.addEventListener('click', () => {
  quizIndex = 0;
  quizScore = 0;
  renderQuizStep();
  quizModal.classList.remove('hidden');
  trackEvent('open_quiz_modal', { language: currentLang });
});
btnCloseQuiz.addEventListener('click', () => quizModal.classList.add('hidden'));

// Keyboard Navigation for Accessibility
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    engine.flyToIndex(engine.activeIndex + 1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    engine.flyToIndex(engine.activeIndex - 1);
  } else if (e.key === 'Escape') {
    pangaeaModal.classList.add('hidden');
    atlasModal.classList.add('hidden');
    quizModal.classList.add('hidden');
    if (imaxModal) imaxModal.classList.add('hidden');
  }
});

applyStaticUITranslations();
buildNavigationBars();
engine.init();
