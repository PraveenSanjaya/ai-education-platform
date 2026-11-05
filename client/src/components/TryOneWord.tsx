import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { PicWord } from '../lib/types';
import TypeWordRound from './TypeWordRound';
import type { RoundResult } from './TypeWordRound';
import { Card, Loading } from './ui';

/** Live "try one word" card for the home page: 3 picture words, progress dots, reveal, listen, input. */
export default function TryOneWord() {
  const [words, setWords] = useState<PicWord[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);

  useEffect(() => {
    api<{ words: PicWord[] }>('/public/sample')
      .then((r) => setWords(r.words))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null; // the hero still works without the demo card
  if (!words) return <Loading label="Loading a word…" />;

  const finished = results.length === words.length;
  const score = results.filter((r) => r.correct).length;

  return (
    <Card aria-label="Try one word">
      <h2 className="text-center font-semibold">Try one word</h2>
      <ol className="my-2 flex justify-center gap-2" aria-label="Progress">
        {words.map((w, i) => (
          <li
            key={w.english}
            aria-current={i === index && !finished ? 'step' : undefined}
            className={`h-3 w-3 rounded-full ${
              i < results.length
                ? results[i].correct
                  ? 'bg-green-500'
                  : 'bg-red-500'
                : i === index
                  ? 'bg-indigo-600'
                  : 'bg-slate-300'
            }`}
          >
            <span className="sr-only">Word {i + 1}</span>
          </li>
        ))}
      </ol>
      {finished ? (
        <div className="py-6 text-center" role="status">
          <p className="text-lg font-semibold">
            You got {score} of {words.length}!
          </p>
          <Link
            to="/register"
            className="mt-3 inline-block rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            Create a free account to keep playing
          </Link>
        </div>
      ) : (
        <TypeWordRound
          key={words[index].english}
          word={words[index]}
          mode="picture"
          rate={0.85}
          allowReveal
          isLast={index === words.length - 1}
          onDone={(r) => {
            setResults([...results, r]);
            if (index < words.length - 1) setIndex(index + 1);
          }}
        />
      )}
    </Card>
  );
}
