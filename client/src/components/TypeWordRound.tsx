import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { maxReveals, revealLetters } from '../lib/challenge';
import { speak, speechSupported } from '../lib/speech';
import type { PicWord } from '../lib/types';
import SpeakButton from './SpeakButton';
import { Button, TextInput } from './ui';

export interface RoundResult {
  word: PicWord;
  response: string;
  correct: boolean;
  reveals: number;
}

/**
 * One "type the English word" round.
 * picture: see the picture (+ Listen, + Reveal when allowed).  listen: hear the word, big speaker replays.
 */
export default function TypeWordRound({
  word,
  mode,
  rate,
  allowReveal,
  isLast,
  onDone,
}: {
  word: PicWord;
  mode: 'picture' | 'listen';
  rate: number;
  allowReveal: boolean;
  isLast: boolean;
  onDone: (r: RoundResult) => void;
}) {
  const [typed, setTyped] = useState('');
  const [reveals, setReveals] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);

  // Listen and type plays the word automatically.
  useEffect(() => {
    if (mode === 'listen' && speechSupported()) speak(word.english, rate);
  }, [mode, word.english, rate]);

  function check(e: FormEvent) {
    e.preventDefault();
    if (result) return;
    const correct = typed.trim().toLowerCase() === word.english.toLowerCase();
    setResult({ word, response: typed.trim(), correct, reveals });
  }

  return (
    <div className="text-center">
      {mode === 'picture' ? (
        <div role="img" aria-label="Picture clue" className="my-4 text-8xl">
          {word.imageUrl}
        </div>
      ) : (
        <div className="my-6 flex justify-center">
          <SpeakButton text={word.english} label="Play the word again" large />
        </div>
      )}

      {mode === 'picture' && (
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <SpeakButton text={word.english} label="Listen to the word" />
          {allowReveal && !result && (
            <Button
              type="button"
              variant="secondary"
              disabled={reveals >= maxReveals(word.english)}
              onClick={() => setReveals(reveals + 1)}
            >
              Reveal a letter
            </Button>
          )}
        </div>
      )}
      {allowReveal && reveals > 0 && !result && (
        <p aria-live="polite" className="mb-2 font-mono text-2xl tracking-widest">
          {revealLetters(word.english, reveals)}
        </p>
      )}

      <form onSubmit={check} className="mx-auto flex max-w-sm gap-2">
        <TextInput
          aria-label="Type the English word"
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={typed}
          disabled={!!result}
          onChange={(e) => setTyped(e.target.value)}
        />
        {!result && <Button type="submit">Check</Button>}
      </form>

      {result && (
        <div className="mt-4" role="status">
          <p
            className={
              result.correct ? 'font-semibold text-green-700' : 'font-semibold text-red-700'
            }
          >
            {result.correct ? 'Correct!' : `Not quite. The word is “${word.english}”.`}
          </p>
          <p lang="si" className="text-slate-600">
            {word.sinhala}
          </p>
          {word.sentence && (
            <p className="mt-1 flex items-center justify-center gap-2 text-sm text-slate-700">
              {word.sentence} <SpeakButton text={word.sentence} />
            </p>
          )}
          <Button className="mt-3" autoFocus onClick={() => onDone(result)}>
            {isLast ? 'Finish' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
}
