/**
 * Google Analytics 4 (GA4) & Firebase WebApp Telemetry for ChronoVerse 3D
 * Project: project-maui (697625214430)
 * Site: chronoverse-3d.web.app
 * Firebase App ID: 1:697625214430:web:0bfd4878aad05f5882f14f
 * GA4 Measurement ID: G-ZSNN1QGECJ
 */

export const GA_MEASUREMENT_ID = 'G-ZSNN1QGECJ';
export const FIREBASE_WEB_CONFIG = Object.freeze({
  projectId: 'project-maui',
  appId: '1:697625214430:web:0bfd4878aad05f5882f14f',
  storageBucket: 'project-maui.firebasestorage.app',
  locationId: 'us-central',
  authDomain: 'project-maui.firebaseapp.com',
  messagingSenderId: '697625214430',
  measurementId: GA_MEASUREMENT_ID,
});

let initialized = false;

export function initAnalytics(initialLang = 'en') {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    app_name: 'ChronoVerse 3D',
    app_id: FIREBASE_WEB_CONFIG.appId,
    language: initialLang,
    send_page_view: true,
  });
}

export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, params);
  } catch {
    // Ignore telemetry blockers gracefully
  }
}

export function trackMilestoneView(milestone, index, lang = 'en') {
  if (!milestone) return;
  trackEvent('select_milestone', {
    milestone_id: milestone.id,
    milestone_index: index + 1,
    milestone_title: milestone.title,
    chapter_id: milestone.chapter,
    era_badge: milestone.eraBadge,
    scene_type: milestone.sceneType,
    language: lang,
  });
}

export function trackWorldDive(milestone, mode, lang = 'en') {
  if (!milestone) return;
  trackEvent(mode === 'world' ? 'enter_3d_world' : 'exit_3d_world', {
    milestone_id: milestone.id,
    scene_type: milestone.sceneType,
    language: lang,
  });
}

export function trackLanguageChange(lang) {
  trackEvent('change_language', {
    language: lang,
  });
}
