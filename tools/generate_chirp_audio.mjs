#!/usr/bin/env node
/**
 * Pre-renders studio narration MP3s for all 30 milestones across all 10 languages
 * using Google Cloud Text-to-Speech Chirp 3 HD (Aoede) voices.
 *
 * Key insight: Chirp 3 HD's server-side sentence tokenizer for CJK (cmn-CN, yue-HK, ja-JP)
 * splits sentences on ASCII `. ` (U+002E + space), NOT on full-width `。` (U+3002).
 * Ending every sentence with ASCII `. ` allows each milestone to be synthesized in a
 * SINGLE API request with natural prosody and 10x lower quota usage.
 *
 * Output structure:
 *   assets/audio/chirp/<lang>/<milestone.id>.mp3
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { CHAPTERS, MILESTONES, QUIZ_QUESTIONS } from '../src/data/timelineData.js';
import { SUPPORTED_LANGUAGES, applyLanguageToData, getUIStrings } from '../src/data/i18n.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUDIO_ROOT = path.join(ROOT, 'assets', 'audio', 'chirp');
const BILLING_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'project-maui';
const CONCURRENCY = Number(process.env.TTS_CONCURRENCY || 4);

const VOICE_CONFIG = {
  en: { languageCode: 'en-US', name: 'en-US-Chirp3-HD-Aoede' },
  es: { languageCode: 'es-ES', name: 'es-ES-Chirp3-HD-Aoede' },
  'zh-CN': { languageCode: 'cmn-CN', name: 'cmn-CN-Chirp3-HD-Aoede' },
  'zh-HK': { languageCode: 'yue-HK', name: 'yue-HK-Chirp3-HD-Aoede' },
  ko: { languageCode: 'ko-KR', name: 'ko-KR-Chirp3-HD-Aoede' },
  ja: { languageCode: 'ja-JP', name: 'ja-JP-Chirp3-HD-Aoede' },
  fr: { languageCode: 'fr-FR', name: 'fr-FR-Chirp3-HD-Aoede' },
  it: { languageCode: 'it-IT', name: 'it-IT-Chirp3-HD-Aoede' },
  pt: { languageCode: 'pt-BR', name: 'pt-BR-Chirp3-HD-Aoede' },
  de: { languageCode: 'de-DE', name: 'de-DE-Chirp3-HD-Aoede' },
};

let cachedToken = null;
let cachedTokenTime = 0;

function getAccessToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedToken && now - cachedTokenTime < 20 * 60 * 1000) {
    return cachedToken;
  }
  const envVal = process.env.CLOUDSDK_METRICS_ENVIRONMENT
    ? `${process.env.CLOUDSDK_METRICS_ENVIRONMENT} datacloud.antigravity`
    : 'datacloud.antigravity';
  cachedToken = execFileSync('gcloud', ['auth', 'print-access-token'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      CLOUDSDK_METRICS_ENVIRONMENT: envVal,
    },
  }).trim();
  cachedTokenTime = now;
  return cachedToken;
}

function isCjkLang(lang) {
  return lang === 'zh-CN' || lang === 'zh-HK' || lang === 'ja';
}

function cleanAndPrepareText(rawText, lang) {
  const isCjk = isCjkLang(lang);
  let s = String(rawText || '').replace(/\*\*/g, '');

  // Strip emojis, variation selectors, and decorative bullets
  s = s.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D]/gu, '');
  s = s.replace(/[•●◆▪▸★☆]/g, isCjk ? '，' : ', ');
  s = s.replace(/\s*[—–→↔]\s*/g, isCjk ? '，' : ', ');
  s = s.replace(/[“”"«»「」『』]/g, '');

  // Replace parentheses/brackets with commas so Chirp 3 HD never ignores sentence breaks inside parens
  s = s.replace(/[（()）\[\]【】]/g, isCjk ? '，' : ', ');

  // Normalize CJK sentence-ending punctuation and colons/semicolons into ASCII `. `
  const normalized = s
    .replace(/[。！？；;：:!?]+/g, '. ')
    .replace(/(?<!\d)\.(?!\d)\s*/g, '. ')
    .replace(/(?:\.\s*){2,}/g, '. ');

  const maxLen = isCjk ? 42 : lang === 'ko' ? 75 : 130;
  const rawSentences = normalized
    .split(/(?<=\.)\s+/u)
    .map((x) => x.trim())
    .filter(Boolean);

  const outSentences = [];
  for (const sent of rawSentences) {
    const cleanSent = sent.replace(/^[，、,\s.]+|[，、,\s.]+$/gu, '').trim();
    if (!cleanSent) continue;

    if (cleanSent.length <= maxLen) {
      outSentences.push(`${cleanSent}.`);
      continue;
    }

    const clauses = isCjk
      ? cleanSent.split(/(?<=[，、,])\s*/u).filter(Boolean)
      : cleanSent.split(/(?<=[,،])\s+/u).filter(Boolean);

    let acc = '';
    for (const rawCl of clauses) {
      const subClauses = [];
      if (rawCl.length > maxLen) {
        for (let i = 0; i < rawCl.length; i += maxLen) {
          subClauses.push(rawCl.slice(i, i + maxLen));
        }
      } else {
        subClauses.push(rawCl);
      }
      for (const cl of subClauses) {
        const candidate = acc ? (isCjk ? `${acc}${cl}` : `${acc} ${cl}`) : cl;
        if (candidate.length <= maxLen) {
          acc = candidate;
        } else {
          if (acc) {
            const trimmedAcc = acc.replace(/^[，、,\s.]+|[，、,\s.]+$/gu, '').trim();
            if (trimmedAcc) outSentences.push(`${trimmedAcc}.`);
          }
          acc = cl;
        }
      }
    }
    if (acc) {
      const trimmedAcc = acc.replace(/^[，、,\s.]+|[，、,\s.]+$/gu, '').trim();
      if (trimmedAcc) {
        outSentences.push(`${trimmedAcc}.`);
      }
    }
  }

  return outSentences.join(' ').replace(/\s{2,}/g, ' ').trim();
}

async function synthesizeChunkMp3(textChunk, lang, maxRetries = 10) {
  const voice = VOICE_CONFIG[lang];
  if (!voice) throw new Error(`Unsupported language: ${lang}`);

  const body = {
    input: { text: textChunk },
    voice,
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
    },
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const token = getAccessToken(attempt > 1);
      const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-goog-user-project': BILLING_PROJECT,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        const status = res.status;
        if (status === 400 && errText.includes('sentences that are too long') && textChunk.length > 20) {
          const sentences = textChunk.split(/(?<=\.)\s+/u).filter(Boolean);
          if (sentences.length > 1) {
            const mid = Math.ceil(sentences.length / 2);
            const b1 = await synthesizeChunkMp3(sentences.slice(0, mid).join(' '), lang, maxRetries);
            const b2 = await synthesizeChunkMp3(sentences.slice(mid).join(' '), lang, maxRetries);
            return Buffer.concat([b1, b2]);
          }
          const charMid = Math.floor(textChunk.length / 2);
          const b1 = await synthesizeChunkMp3(`${textChunk.slice(0, charMid)}.`, lang, maxRetries);
          const b2 = await synthesizeChunkMp3(`${textChunk.slice(charMid)}.`, lang, maxRetries);
          return Buffer.concat([b1, b2]);
        }
        if (status === 429 || status >= 500 || status === 401) {
          const delayMs =
            status === 429
              ? Math.min(35000, 8000 * attempt + Math.floor(Math.random() * 2000))
              : Math.min(12000, 1000 * attempt);
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }
        }
        throw new Error(`HTTP ${status} (${lang}): ${errText.slice(0, 260)}`);
      }

      const data = await res.json();
      if (!data.audioContent) {
        throw new Error(`No audioContent returned for ${lang}`);
      }
      return Buffer.from(data.audioContent, 'base64');
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delayMs = Math.min(20000, 2000 * attempt + Math.floor(Math.random() * 1000));
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function isAlreadyGenerated(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size > 4096;
  } catch (_) {
    return false;
  }
}

async function main() {
  const tasks = [];

  for (const langObj of SUPPORTED_LANGUAGES) {
    const lang = langObj.code;
    const langDir = path.join(AUDIO_ROOT, lang);
    await fs.mkdir(langDir, { recursive: true });

    applyLanguageToData(lang, CHAPTERS, MILESTONES, QUIZ_QUESTIONS);
    const ui = getUIStrings(lang);

    for (const m of MILESTONES) {
      const rawText = `${m.eraBadge}. ${m.title}. ${m.summary}. ${ui.mindBlowingFactPrefix} ${m.facts[0]}`;
      const text = cleanAndPrepareText(rawText, lang);
      const outPath = path.join(langDir, `${m.id}.mp3`);
      tasks.push({ lang, id: m.id, text, outPath });
    }
  }

  let cursor = 0;
  let generated = 0;
  let skipped = 0;

  console.log(`Checking ${tasks.length} Chirp 3 HD (Aoede) audio clips across 10 languages...`);

  async function worker() {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      if (await isAlreadyGenerated(task.outPath)) {
        skipped++;
        continue;
      }
      const mp3Buf = await synthesizeChunkMp3(task.text, task.lang);
      await fs.writeFile(task.outPath, mp3Buf);
      generated++;
      const totalDone = generated + skipped;
      if (generated % 10 === 0 || totalDone === tasks.length) {
        console.log(
          `[${totalDone}/${tasks.length}] Synthesized ${task.lang}/${task.id}.mp3 (${(mp3Buf.length / 1024).toFixed(1)} KB) — ${generated} new, ${skipped} cached`
        );
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(`Done! Total: ${tasks.length} clips (${generated} newly synthesized, ${skipped} cached).`);
}

main().catch((err) => {
  console.error('Chirp 3 HD generation failed:', err);
  process.exit(1);
});
