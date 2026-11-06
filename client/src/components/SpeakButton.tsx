import { useState } from 'react';
import { AUDIO_UNAVAILABLE, speak, speechSupported, useSpeechRate } from '../lib/speech';

/** Small speaker button. Renders nothing when speech synthesis is unavailable. */
export default function SpeakButton({
  text,
  label,
  large = false,
  onResult,
}: {
  text: string;
  label?: string;
  large?: boolean;
  onResult?: (ok: boolean) => void;
}) {
  const rate = useSpeechRate();
  const [failed, setFailed] = useState(false);
  if (!speechSupported()) return null;
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          const ok = await speak(text, rate);
          setFailed(!ok);
          onResult?.(ok);
        }}
        aria-label={label ?? `Listen: ${text}`}
        className={`inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 ${
          large ? 'h-20 w-20 text-4xl' : 'h-11 w-11 text-lg'
        }`}
      >
        <span aria-hidden="true">🔊</span>
      </button>
      {failed && (
        <span role="status" className="text-sm text-red-700">
          {AUDIO_UNAVAILABLE}
        </span>
      )}
    </>
  );
}
