import { config } from '../config.js';

/**
 * Translate an English word to Sinhala via Google Cloud Translation (v2 REST).
 * Returns null when no API key is configured or the call fails, so the caller can fall back gracefully.
 */
export async function translateToSinhala(word: string): Promise<string | null> {
  if (!config.translateKey) return null;
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(config.translateKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: word, source: 'en', target: 'si', format: 'text' }),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: { translations?: { translatedText?: string }[] };
    };
    const text = data.data?.translations?.[0]?.translatedText?.trim();
    return text || null;
  } catch {
    return null;
  }
}
