import { useState } from 'react';
import { Button } from './ui';

/** Tap words from the bank to build a sentence; tap a placed word to take it back. */
export default function OrderInput({
  words,
  disabled,
  onCheck,
}: {
  words: string[];
  disabled: boolean;
  onCheck: (sentence: string) => void;
}) {
  const [chosen, setChosen] = useState<number[]>([]); // indexes into `words`

  const chip =
    'rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50';

  return (
    <div>
      <p className="text-sm text-slate-600">Your sentence:</p>
      <ul
        aria-label="Your sentence"
        className="my-2 flex min-h-12 flex-wrap gap-2 rounded border border-dashed bg-white p-2"
      >
        {chosen.map((wi, pos) => (
          <li key={wi}>
            <button
              disabled={disabled}
              className={`${chip} bg-indigo-50`}
              onClick={() => setChosen(chosen.filter((_, p) => p !== pos))}
              aria-label={`Remove ${words[wi]}`}
            >
              {words[wi]}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-600">Word bank:</p>
      <ul aria-label="Word bank" className="my-2 flex flex-wrap gap-2">
        {words.map((w, i) => (
          <li key={i}>
            <button
              disabled={disabled || chosen.includes(i)}
              className={`${chip} bg-white hover:bg-slate-50`}
              onClick={() => setChosen([...chosen, i])}
            >
              {w}
            </button>
          </li>
        ))}
      </ul>
      {!disabled && (
        <div className="flex gap-2">
          <Button
            disabled={chosen.length === 0}
            onClick={() => onCheck(chosen.map((i) => words[i]).join(' '))}
          >
            Check
          </Button>
          <Button variant="secondary" disabled={chosen.length === 0} onClick={() => setChosen([])}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
