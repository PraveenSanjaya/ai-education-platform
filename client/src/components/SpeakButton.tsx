import { speak, speechSupported, useSpeechRate } from '../lib/speech';

/** Small speaker button. Renders nothing when speech synthesis is unavailable. */
export default function SpeakButton({
  text,
  label,
  large = false,
}: {
  text: string;
  label?: string;
  large?: boolean;
}) {
  const rate = useSpeechRate();
  if (!speechSupported()) return null;
  return (
    <button
      type="button"
      onClick={() => speak(text, rate)}
      aria-label={label ?? `Listen: ${text}`}
      className={`rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 ${
        large ? 'h-20 w-20 text-4xl' : 'h-8 w-8 text-base'
      }`}
    >
      <span aria-hidden="true">🔊</span>
    </button>
  );
}
