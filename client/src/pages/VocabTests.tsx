import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { VocabQuestion } from '../lib/types';
import VocabRunner from '../components/VocabRunner';
import type { VocabAnswer } from '../components/VocabRunner';
import { Button, Card, ErrorMessage } from '../components/ui';

const TYPES = [
  { key: 'en-si', title: 'English → Sinhala', desc: 'Pick the Sinhala meaning.' },
  { key: 'si-en', title: 'Sinhala → English', desc: 'Pick the English word.' },
  { key: 'spelling', title: 'Spelling', desc: 'See Sinhala, type the English word.' },
  { key: 'mistakes', title: 'Mistakes review', desc: 'Only words you got wrong before.' },
] as const;
type TestType = (typeof TYPES)[number]['key'];

type Phase =
  | { name: 'menu' }
  | { name: 'running'; type: TestType; questions: VocabQuestion[] }
  | { name: 'done'; type: TestType; answers: VocabAnswer[] };

export default function VocabTests() {
  const [phase, setPhase] = useState<Phase>({ name: 'menu' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function start(type: TestType) {
    setError('');
    setLoading(true);
    try {
      const r = await api<{ questions: VocabQuestion[] }>(`/words/test?type=${type}`);
      setPhase({ name: 'running', type, questions: r.questions });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function finish(type: TestType, answers: VocabAnswer[]) {
    setPhase({ name: 'done', type, answers });
    try {
      await api('/results', {
        method: 'POST',
        body: {
          kind: 'vocab',
          title: TYPES.find((t) => t.key === type)!.title,
          answers: answers.map((a) => ({
            wordId: a.question.wordId,
            prompt: a.question.prompt,
            response: a.response,
            correctAnswer: a.question.answer,
            correct: a.correct,
          })),
        },
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (phase.name === 'running') {
    return <VocabRunner questions={phase.questions} onFinish={(a) => finish(phase.type, a)} />;
  }

  if (phase.name === 'done') {
    const score = phase.answers.filter((a) => a.correct).length;
    const wrong = phase.answers.filter((a) => !a.correct);
    return (
      <Card>
        <h1 className="text-xl font-bold">
          Score: {score} / {phase.answers.length}
        </h1>
        <ErrorMessage message={error} />
        {wrong.length > 0 && (
          <>
            <h2 className="mt-4 font-semibold">Words to practise</h2>
            <ul className="list-disc pl-5">
              {wrong.map((a) => (
                <li key={a.question.wordId}>
                  {a.question.format === 'spelling'
                    ? `${a.question.answer} — ${a.question.prompt}`
                    : `${a.question.prompt} → ${a.question.answer}`}
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={() => start(phase.type)}>Try again</Button>
          <Button variant="secondary" onClick={() => setPhase({ name: 'menu' })}>
            Choose another test
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Vocabulary tests</h1>
      <ErrorMessage message={error} />
      <div className="grid gap-3 sm:grid-cols-2">
        {TYPES.map((t) => (
          <Card key={t.key}>
            <h2 className="font-semibold">{t.title}</h2>
            <p className="mb-3 text-sm text-slate-600">{t.desc}</p>
            <Button disabled={loading} onClick={() => start(t.key)}>
              Start 10 questions
            </Button>
          </Card>
        ))}
      </div>
      <p className="text-sm text-slate-600">
        No words yet?{' '}
        <Link className="text-indigo-700 underline" to="/words">
          Add some first
        </Link>
        .
      </p>
    </div>
  );
}
