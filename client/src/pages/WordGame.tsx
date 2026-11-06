import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { rulesFor } from '../lib/challenge';
import { AUDIO_UNAVAILABLE, listenAvailable } from '../lib/speech';
import type { PicWord } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import TypeWordRound from '../components/TypeWordRound';
import type { RoundResult } from '../components/TypeWordRound';
import { Button, Card, ErrorMessage, Loading } from '../components/ui';

const COPY = {
  picture: {
    title: 'Picture words',
    intro: 'Look at the picture, listen, and type the English word.',
  },
  listen: {
    title: 'Listen and type',
    intro: 'The word plays automatically. Tap the big speaker to hear it again, then type it.',
  },
};

/** Picture words / Listen and type: 10 rounds, then results go to history and word strength. */
export default function WordGame({ mode }: { mode: 'picture' | 'listen' }) {
  const { user } = useAuth();
  const rules = rulesFor(user?.challenge);
  const copy = COPY[mode];
  const [words, setWords] = useState<PicWord[] | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audio, setAudio] = useState<'idle' | 'ok' | 'failed'>('idle');

  if (mode === 'listen' && (!listenAvailable() || audio === 'failed')) {
    return (
      <Card>
        <h1 className="text-xl font-bold">{copy.title}</h1>
        <p className="mt-2 text-slate-600">
          {AUDIO_UNAVAILABLE}, so this test is not available. Every other test still works. Try
          Picture words instead.
        </p>
        <Link className="mt-2 inline-block text-indigo-700 underline" to="/play">
          Go to Picture words
        </Link>
      </Card>
    );
  }

  async function start() {
    setError('');
    setLoading(true);
    try {
      const r = await api<{ words: PicWord[] }>('/dictionary/picture-words?count=10');
      setWords(r.words);
      setIndex(0);
      setAudio('idle');
      setResults([]);
      setDone(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function finish(all: RoundResult[]) {
    setDone(true);
    try {
      await api('/results', {
        method: 'POST',
        body: {
          kind: 'vocab',
          title: copy.title,
          answers: all.map((r) => ({
            wordId: r.word.wordId ?? 'dictionary', // only saved words change strength
            prompt: mode === 'picture' ? r.word.imageUrl : `🔊 ${r.word.english}`,
            response: r.response,
            correctAnswer: r.word.english,
            correct: r.correct,
          })),
        },
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function onDone(r: RoundResult) {
    const all = [...results, r];
    setResults(all);
    if (index === words!.length - 1) finish(all);
    else setIndex(index + 1);
  }

  if (loading) return <Loading label="Getting your words…" />;

  if (done) {
    const score = results.filter((r) => r.correct).length;
    return (
      <Card>
        <h1 className="text-xl font-bold">
          Score: {score} / {results.length}
        </h1>
        <ErrorMessage message={error} />
        <ul className="mt-3 space-y-1">
          {results.map((r) => (
            <li key={r.word.english} className={r.correct ? 'text-green-700' : 'text-red-700'}>
              {r.word.imageUrl} {r.word.english}{' '}
              {r.correct ? '✓' : `✗ (you typed “${r.response || '—'}”)`}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <Button onClick={start}>Play again</Button>
          <Link to="/tests" className="rounded bg-slate-200 px-4 py-2 font-medium">
            All tests
          </Link>
        </div>
      </Card>
    );
  }

  if (!words) {
    return (
      <Card>
        <h1 className="text-xl font-bold">{copy.title}</h1>
        <p className="mt-1 text-slate-600">{copy.intro}</p>
        <p className="mt-1 text-sm text-slate-600">
          {rules.hints
            ? 'Easy: you can reveal one more letter at a time, and words are spoken slowly.'
            : 'Hard: no hints, and words are spoken at normal speed.'}
        </p>
        <ErrorMessage message={error} />
        <Button className="mt-4" onClick={start}>
          Start 10 words
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="sr-only">{copy.title}</h1>
      <p className="text-sm text-slate-600">
        {copy.title} · Word {index + 1} of {words.length}
      </p>
      <TypeWordRound
        key={words[index].english}
        word={words[index]}
        mode={mode}
        rate={rules.speechRate}
        autoPlay={audio === 'ok'}
        onAudio={(ok) => setAudio(ok ? 'ok' : 'failed')}
        allowReveal={rules.hints}
        isLast={index === words.length - 1}
        onDone={onDone}
      />
    </Card>
  );
}
