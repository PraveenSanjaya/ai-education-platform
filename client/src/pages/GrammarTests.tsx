import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { GrammarQuestion, User, WrongItem } from '../lib/types';
import QuizRun from '../components/QuizRun';
import type { Answered } from '../components/QuestionCard';
import { Button, Card, ErrorMessage } from '../components/ui';

type Kind = 'mixed' | 'placement';
type Q = GrammarQuestion & { lessonTitle?: string };

interface Outcome {
  kind: Kind;
  score: number;
  total: number;
  percent: number;
  wrongItems: WrongItem[];
  level?: string;
}

type Phase =
  | { name: 'menu' }
  | { name: 'running'; kind: Kind; questions: Q[] }
  | { name: 'done'; outcome: Outcome };

export default function GrammarTests() {
  const { setUser } = useAuth();
  const [phase, setPhase] = useState<Phase>({ name: 'menu' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function start(kind: Kind) {
    setError('');
    setLoading(true);
    try {
      const path = kind === 'mixed' ? '/grammar/mixed' : '/grammar/placement';
      const r = await api<{ questions: Q[] }>(path);
      setPhase({ name: 'running', kind, questions: r.questions });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function finish(kind: Kind, answers: Answered[]) {
    setError('');
    try {
      const r = await api<Outcome & { user?: User }>('/results', {
        method: 'POST',
        body: {
          kind,
          answers: answers.map((a) => ({ questionId: a.question.id, response: a.response })),
        },
      });
      if (r.user) setUser(r.user);
      setPhase({ name: 'done', outcome: { ...r, kind } });
    } catch (e) {
      setError((e as Error).message);
      setPhase({ name: 'menu' });
    }
  }

  if (phase.name === 'running') {
    return (
      <QuizRun
        questions={phase.questions}
        maxMistakes={phase.kind === 'placement' ? 2 : undefined}
        onFinish={(a) => finish(phase.kind, a)}
      />
    );
  }

  if (phase.name === 'done') {
    const o = phase.outcome;
    return (
      <Card>
        <h1 className="text-xl font-bold">
          {o.kind === 'placement' ? 'Level check complete' : 'Mixed review complete'}
        </h1>
        <p className="mt-1 text-lg">
          {o.score} / {o.total} ({o.percent}%)
        </p>
        {o.kind === 'placement' && (
          <p className="mt-1">
            Your starting level is now <b>{o.level}</b>.
          </p>
        )}
        {o.wrongItems.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm">
            {o.wrongItems.map((w) => (
              <li key={w.questionId} className="rounded bg-red-50 p-2">
                <p>{w.prompt}</p>
                <p>
                  Your answer: <b>{w.response || '—'}</b> · Correct: <b>{w.correctAnswer}</b>
                </p>
                <p className="text-slate-600">{w.explanation}</p>
              </li>
            ))}
          </ul>
        )}
        <Button className="mt-4" onClick={() => setPhase({ name: 'menu' })}>
          Back
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Grammar tests</h1>
      <ErrorMessage message={error} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Mixed grammar review</h2>
          <p className="mb-3 text-sm text-slate-600">
            10 questions from your unlocked lessons, focused on your weaker topics.
          </p>
          <Button disabled={loading} onClick={() => start('mixed')}>
            Start review
          </Button>
        </Card>
        <Card>
          <h2 className="font-semibold">Level check</h2>
          <p className="mb-3 text-sm text-slate-600">
            One question per lesson. It stops at your second mistake and sets your starting level.
          </p>
          <Button disabled={loading} onClick={() => start('placement')}>
            Start level check
          </Button>
        </Card>
      </div>
    </div>
  );
}
