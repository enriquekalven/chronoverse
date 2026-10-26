import { UI_STRINGS, CHAPTER_I18N, QUIZ_I18N } from './locales/ui_chapters_quiz.js';
import { MILESTONES_ZH } from './locales/milestones_zh.js';
import { MILESTONES_JA_KO } from './locales/milestones_ja_ko.js';
import { MILESTONES_ES_PT } from './locales/milestones_es_pt.js';
import { MILESTONES_FR_IT_DE } from './locales/milestones_fr_it_de.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: '🇬🇧 English', ttsLang: 'en-US', htmlLang: 'en' },
  { code: 'es', label: '🇪🇸 Español', ttsLang: 'es-ES', htmlLang: 'es' },
  { code: 'zh-CN', label: '🇨🇳 中文 (普通话)', ttsLang: 'zh-CN', htmlLang: 'zh-CN' },
  { code: 'zh-HK', label: '🇭🇰 中文 (粵語)', ttsLang: 'zh-HK', htmlLang: 'zh-HK' },
  { code: 'ko', label: '🇰🇷 한국어', ttsLang: 'ko-KR', htmlLang: 'ko' },
  { code: 'ja', label: '🇯🇵 日本語', ttsLang: 'ja-JP', htmlLang: 'ja' },
  { code: 'fr', label: '🇫🇷 Français', ttsLang: 'fr-FR', htmlLang: 'fr' },
  { code: 'it', label: '🇮🇹 Italiano', ttsLang: 'it-IT', htmlLang: 'it' },
  { code: 'pt', label: '🇧🇷 Português', ttsLang: 'pt-BR', htmlLang: 'pt' },
  { code: 'de', label: '🇩🇪 Deutsch', ttsLang: 'de-DE', htmlLang: 'de' },
];

const MILESTONE_I18N = {
  ...MILESTONES_ZH,
  ...MILESTONES_JA_KO,
  ...MILESTONES_ES_PT,
  ...MILESTONES_FR_IT_DE,
};

const STORAGE_KEY = 'chronoverse_lang';

let englishSnapshot = null;

function ensureEnglishSnapshot(chapters, milestones, quizQuestions) {
  if (englishSnapshot) return;
  englishSnapshot = {
    chapters: chapters.map((c) => ({
      id: c.id,
      title: c.title,
      shortTitle: c.shortTitle,
      range: c.range,
    })),
    milestones: milestones.map((m) => ({
      id: m.id,
      eraBadge: m.eraBadge,
      cosmicClock: m.cosmicClock,
      tectonicStage: m.tectonicStage,
      title: m.title,
      subtitle: m.subtitle,
      summary: m.summary,
      stats: m.stats ? m.stats.map((s) => ({ ...s })) : [],
      facts: m.facts ? [...m.facts] : [],
      whatIf: m.whatIf ? { ...m.whatIf } : null,
    })),
    quiz: quizQuestions.map((q) => ({
      q: q.q,
      options: [...q.options],
      correct: q.correct,
      explanation: q.explanation,
    })),
  };
}

export function normalizeLanguageCode(raw) {
  if (!raw || typeof raw !== 'string') return 'en';
  const trimmed = raw.trim();
  const exact = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact.code;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('zh-hk') ||
    lower.startsWith('zh-mo') ||
    lower.startsWith('zh-tw') ||
    lower.startsWith('zh-hant') ||
    lower === 'yue'
  ) {
    return 'zh-HK';
  }
  if (lower.startsWith('zh')) return 'zh-CN';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('ko')) return 'ko';
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('it')) return 'it';
  if (lower.startsWith('pt')) return 'pt';
  if (lower.startsWith('de')) return 'de';
  return 'en';
}

export function detectInitialLanguage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang) {
      return normalizeLanguageCode(urlLang);
    }
  } catch (_) {
    // Ignore URL parse issues
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return normalizeLanguageCode(saved);
    }
  } catch (_) {
    // Ignore localStorage issues
  }

  try {
    const navLang =
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      'en';
    return normalizeLanguageCode(navLang);
  } catch (_) {
    return 'en';
  }
}

export function saveLanguagePreference(lang) {
  const normalized = normalizeLanguageCode(lang);
  try {
    window.localStorage.setItem(STORAGE_KEY, normalized);
  } catch (_) {
    // Ignore storage quota / privacy mode errors
  }
  return normalized;
}

export function getLanguageMeta(lang) {
  const code = normalizeLanguageCode(lang);
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0]
  );
}

export function getUIStrings(lang) {
  const code = normalizeLanguageCode(lang);
  return UI_STRINGS[code] || UI_STRINGS.en;
}

export function formatUIString(template, vars = {}) {
  if (!template) return '';
  return String(template).replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ''
  );
}

export function applyLanguageToData(lang, chapters, milestones, quizQuestions) {
  ensureEnglishSnapshot(chapters, milestones, quizQuestions);
  const code = normalizeLanguageCode(lang);

  // 1. Restore English baseline first so any missing field gracefully falls back to English
  englishSnapshot.chapters.forEach((baseChap, idx) => {
    const target = chapters[idx];
    if (!target) return;
    target.title = baseChap.title;
    target.shortTitle = baseChap.shortTitle;
    target.range = baseChap.range;
  });

  englishSnapshot.milestones.forEach((baseMs, idx) => {
    const target = milestones[idx];
    if (!target) return;
    target.eraBadge = baseMs.eraBadge;
    target.cosmicClock = baseMs.cosmicClock;
    target.tectonicStage = baseMs.tectonicStage;
    target.title = baseMs.title;
    target.subtitle = baseMs.subtitle;
    target.summary = baseMs.summary;
    target.stats = baseMs.stats.map((s) => ({ ...s }));
    target.facts = [...baseMs.facts];
    if (baseMs.whatIf && target.whatIf) {
      Object.assign(target.whatIf, baseMs.whatIf);
    }
  });

  englishSnapshot.quiz.forEach((baseQ, idx) => {
    const target = quizQuestions[idx];
    if (!target) return;
    target.q = baseQ.q;
    target.options = [...baseQ.options];
    target.correct = baseQ.correct;
    target.explanation = baseQ.explanation;
  });

  if (code === 'en') {
    return code;
  }

  // 2. Apply localized Chapters
  const chapMap = CHAPTER_I18N[code];
  if (chapMap) {
    chapters.forEach((chap) => {
      const loc = chapMap[chap.id];
      if (loc) {
        if (loc.title) chap.title = loc.title;
        if (loc.shortTitle) chap.shortTitle = loc.shortTitle;
        if (loc.range) chap.range = loc.range;
      }
    });
  }

  // 3. Apply localized Milestones
  const msMap = MILESTONE_I18N[code];
  if (msMap) {
    milestones.forEach((ms) => {
      const loc = msMap[ms.id];
      if (!loc) return;
      if (loc.eraBadge) ms.eraBadge = loc.eraBadge;
      if (loc.cosmicClock) ms.cosmicClock = loc.cosmicClock;
      if (loc.tectonicStage) ms.tectonicStage = loc.tectonicStage;
      if (loc.title) ms.title = loc.title;
      if (loc.subtitle) ms.subtitle = loc.subtitle;
      if (loc.summary) ms.summary = loc.summary;
      if (Array.isArray(loc.stats) && loc.stats.length > 0) {
        ms.stats = loc.stats.map((s) => ({ ...s }));
      }
      if (Array.isArray(loc.facts) && loc.facts.length > 0) {
        ms.facts = [...loc.facts];
      }
      if (loc.whatIf && ms.whatIf) {
        if (loc.whatIf.question) ms.whatIf.question = loc.whatIf.question;
        if (loc.whatIf.buttonLabel) ms.whatIf.buttonLabel = loc.whatIf.buttonLabel;
        if (loc.whatIf.activeLabel) ms.whatIf.activeLabel = loc.whatIf.activeLabel;
        if (loc.whatIf.explanation) ms.whatIf.explanation = loc.whatIf.explanation;
      }
    });
  }

  // 4. Apply localized Quiz Questions
  const quizList = QUIZ_I18N[code];
  if (Array.isArray(quizList)) {
    quizQuestions.forEach((qObj, idx) => {
      const locQ = quizList[idx];
      if (!locQ) return;
      if (locQ.q) qObj.q = locQ.q;
      if (Array.isArray(locQ.options)) qObj.options = [...locQ.options];
      if (typeof locQ.correct === 'number') qObj.correct = locQ.correct;
      if (locQ.explanation) qObj.explanation = locQ.explanation;
    });
  }

  return code;
}
