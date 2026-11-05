import { DictionaryEntry } from '../models/DictionaryEntry.js';
import { lemmaCandidates } from './lemma.js';
import { translateToSinhala } from './translate.js';

export interface LookupResult {
  found: boolean;
  english?: string;
  sinhala?: string;
  partOfSpeech?: string;
  level?: string;
  example?: string;
  /** The base form that matched, when different from what the user typed (learns -> learn). */
  baseForm?: string;
  source?: 'dictionary' | 'api';
}

/** Local dictionary first (exact, then base forms), then the translation API (cached). */
export async function lookupWord(raw: string): Promise<LookupResult> {
  const word = raw.trim().toLowerCase();
  if (!word) return { found: false };

  const candidates = [word, ...lemmaCandidates(word)];
  const entries = await DictionaryEntry.find({ english: { $in: candidates } }).lean();
  for (const c of candidates) {
    const e = entries.find((x) => x.english === c);
    if (e) {
      return {
        found: true,
        english: word,
        sinhala: e.sinhala,
        partOfSpeech: e.partOfSpeech,
        level: e.level,
        example: e.example,
        baseForm: c !== word ? c : undefined,
        source: 'dictionary',
      };
    }
  }

  const translated = await translateToSinhala(word);
  if (!translated) return { found: false };
  await DictionaryEntry.updateOne(
    { english: word },
    { $setOnInsert: { english: word, sinhala: translated, source: 'api' } },
    { upsert: true },
  );
  return { found: true, english: word, sinhala: translated, source: 'api' };
}
