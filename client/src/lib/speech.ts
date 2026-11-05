import { useAuth } from '../context/AuthContext';
import { rulesFor } from './challenge';

export const speechSupported = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

/** Speak English text (en-US) with the Web Speech API. Does nothing when unsupported. */
export function speak(text: string, rate = 1) {
  if (!speechSupported() || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  synth.speak(u);
}

/** Speech rate for the current learner: 0.85 on Easy, normal on Hard. */
export function useSpeechRate() {
  const { user } = useAuth();
  return rulesFor(user?.challenge).speechRate;
}
