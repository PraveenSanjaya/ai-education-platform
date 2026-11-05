import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pendingChallenge, rulesFor } from '../lib/challenge';
import type { Challenge as C } from '../lib/challenge';
import { useAuth } from '../context/AuthContext';
import { Button, Card, ErrorMessage } from '../components/ui';

/** Signal-bar difficulty icon: 1 lit bar of 3 (Easy) or all 3 (Hard). */
function Signal({ level }: { level: number }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={3 + i * 7}
          y={18 - (i + 1) * 5}
          width="5"
          height={(i + 1) * 5 + 3}
          rx="1"
          className={i < level ? 'fill-indigo-600' : 'fill-slate-300'}
        />
      ))}
    </svg>
  );
}

const CARDS: {
  key: C;
  level: number;
  tagline: string;
  example: string;
  points: string[];
  bars: number[];
}[] = [
  {
    key: 'easy',
    level: 1,
    tagline: 'Short sentences, friendly help.',
    example: 'My teacher is kind.',
    points: ['3 answer choices', 'Spelling hints and letter reveal', 'Slower audio'],
    bars: [40, 25],
  },
  {
    key: 'hard',
    level: 3,
    tagline: 'Real-life sentences, no hints.',
    example: 'Our English teacher gives us extra homework every week to help us improve.',
    points: [
      '4 answer choices',
      'No hints',
      'Complete-the-sentence questions',
      'Normal-speed audio',
    ],
    bars: [90, 80, 55],
  },
];

export default function Challenge() {
  const { user, setChallenge } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const current = user?.challenge;

  async function choose(c: C) {
    setError('');
    setBusy(true);
    try {
      if (user) {
        await setChallenge(c);
        navigate('/');
      } else {
        pendingChallenge.set(c); // applied when the visitor registers
        navigate('/register');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Choose your challenge</h1>
        <p className="text-slate-600">
          The words stay the same. Only the challenge changes. You can switch at any time.
        </p>
      </div>
      <ErrorMessage message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        {CARDS.map((c) => {
          const selected = current === c.key;
          const name = rulesFor(c.key).label;
          return (
            <Card key={c.key} className={selected ? 'border-2 border-indigo-600' : ''}>
              <div className="flex items-center gap-2">
                <Signal level={c.level} />
                <h2 className="text-lg font-bold">{name}</h2>
                {selected && (
                  <span className="ml-auto rounded bg-indigo-600 px-2 py-0.5 text-xs text-white">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">{c.tagline}</p>
              <div aria-hidden="true" className="my-3 space-y-1">
                {c.bars.map((w, i) => (
                  <div key={i} className="h-2 rounded bg-indigo-200" style={{ width: `${w}%` }} />
                ))}
              </div>
              <p className="rounded bg-slate-100 p-2 italic">“{c.example}”</p>
              <ul className="my-3 space-y-1 text-sm">
                {c.points.map((p) => (
                  <li key={p}>
                    <span aria-hidden="true" className="mr-1 text-green-600">
                      ✓
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <Button disabled={busy} onClick={() => choose(c.key)}>
                {selected ? `Continue with ${name}` : `Choose ${name}`}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
