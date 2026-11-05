import { useAuth } from '../context/AuthContext';
import { rulesFor } from './challenge';

export const speechSupported = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

export const AUDIO_UNAVAILABLE = "Audio isn't available on this device";
const FAIL_KEY = 'audioFailed';
const VOICE_WAIT_MS = 1500;
const START_WAIT_MS = 4000;

/** True once speech has failed on this device (this browser session), so Listen and type can hide itself. */
export function audioFailedBefore(): boolean {
  try {
    return sessionStorage.getItem(FAIL_KEY) === '1';
  } catch {
    return false;
  }
}
function markFailed() {
  try {
    sessionStorage.setItem(FAIL_KEY, '1');
  } catch {
    /* storage can be blocked; the message still shows */
  }
}
function markWorked() {
  try {
    sessionStorage.removeItem(FAIL_KEY);
  } catch {
    /* ignore */
  }
}

/** Listen and type is offered only when speech exists and has not already failed. */
export const listenAvailable = () => speechSupported() && !audioFailedBefore();

/** Prefer en-US, then any English voice. Returns undefined when there is none. */
export function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const lang = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase();
  return voices.find((v) => lang(v) === 'en-us') ?? voices.find((v) => lang(v).startsWith('en'));
}

/** The voice list is empty at first on some browsers: wait for `voiceschanged`, up to `timeoutMs`. */
export function loadVoices(timeoutMs = VOICE_WAIT_MS): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices?.() ?? [];
  if (now.length > 0) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      synth.removeEventListener?.('voiceschanged', done);
      resolve(synth.getVoices?.() ?? []);
    };
    const timer = setTimeout(done, timeoutMs);
    synth.addEventListener?.('voiceschanged', done);
  });
}

/**
 * Speak English text (en-US) with the Web Speech API.
 * Resolves true when speech started, false when it is unavailable or failed (never throws).
 * Call it straight from a tap: when voices are already loaded it speaks synchronously, which iOS requires.
 */
export async function speak(text: string, rate = 1): Promise<boolean> {
  if (!speechSupported() || !text) return false;
  try {
    const synth = window.speechSynthesis;
    let voices = synth.getVoices?.() ?? [];
    if (voices.length === 0) voices = await loadVoices();
    const voice = pickEnglishVoice(voices);
    if (!voice) {
      markFailed();
      return false;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.voice = voice;
    u.rate = rate;
    return await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        markFailed();
        resolve(false);
      }, START_WAIT_MS);
      u.onstart = () => {
        clearTimeout(timer);
        markWorked();
        resolve(true);
      };
      u.onerror = (e) => {
        clearTimeout(timer);
        // "interrupted"/"canceled" just mean another word replaced this one.
        const benign = e?.error === 'interrupted' || e?.error === 'canceled';
        if (!benign) markFailed();
        resolve(benign);
      };
      synth.speak(u);
    });
  } catch {
    markFailed();
    return false;
  }
}

/** Speech rate for the current learner: 0.85 on Easy, normal on Hard. */
export function useSpeechRate() {
  const { user } = useAuth();
  return rulesFor(user?.challenge).speechRate;
}
