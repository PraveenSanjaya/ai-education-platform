import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { GrammarResult, LessonFull } from '../lib/types';
import QuestionCard from '../components/QuestionCard';
import type { Answered } from '../components/QuestionCard';
import { Button, Card, ErrorMessage } from '../components/ui';

type Step = 'explain' | 'examples' | 'practice' | 'result';

export default function LessonPage() {
  const { id } = useParams();
  return <LessonView key={id} id={id!} />;
}

function LessonView({ id }: { id: string }) {
  const [lesson, setLesson] = useState<LessonFull | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('explain');
  const [notesOpen, setNotesOpen] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [result, setResult] = useState<GrammarResult | null>(null);

  useEffect(() => {
    api<{ lesson: LessonFull }>(`/lessons/${id}`)
      .then((r) => setLesson(r.lesson))
      .catch((e) => setError((e as Error).message));
  }, [id]);

  const restartPractice = useCallback(() => {
    setQIndex(0);
    setAnswers([]);
    setResult(null);
    setStep('practice');
  }, []);

  async function submit(all: Answered[]) {
    try {
      const r = await api<GrammarResult>('/results', {
        method: 'POST',
        body: {
          kind: 'grammar',
          lessonId: lesson!.id,
          answers: all.map((a) => ({ questionId: a.question.id, response: a.response })),
        },
      });
      setResult(r);
      setStep('result');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function onNext(a: Answered) {
    const all = [...answers, a];
    setAnswers(all);
    if (qIndex === lesson!.questions.length - 1) submit(all);
    else setQIndex(qIndex + 1);
  }

  if (error)
    return (
      <div className="space-y-3">
        <ErrorMessage message={error} />
        <Link className="text-indigo-700 underline" to="/grammar">
          Back to grammar path
        </Link>
      </div>
    );
  if (!lesson) return <p>Loading lesson…</p>;

  const steps: [Step, string][] = [
    ['explain', '1. Explanation'],
    ['examples', '2. Examples'],
    ['practice', '3. Practice'],
  ];

  return (
    <div className="space-y-4">
      <div>
        <Link className="text-sm text-indigo-700 underline" to="/grammar">
          ← Grammar path
        </Link>
        <h1 className="text-xl font-bold">{lesson.title}</h1>
        <p lang="si" className="text-slate-600">
          {lesson.titleSi}
        </p>
      </div>
      <ol className="flex gap-2 text-sm" aria-label="Lesson steps">
        {steps.map(([key, label]) => (
          <li
            key={key}
            aria-current={step === key ? 'step' : undefined}
            className={`rounded px-3 py-1 ${step === key ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 'explain' && (
        <Card>
          <h2 className="mb-2 font-semibold">How it works</h2>
          <ul className="list-disc space-y-1 pl-5">
            {lesson.explanation.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <details
            className="mt-4 rounded border border-indigo-200 bg-indigo-50 p-3"
            open={notesOpen}
            onToggle={(e) => setNotesOpen((e.currentTarget as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer font-semibold">සිංහල සටහන් (Sinhala notes)</summary>
            <ul lang="si" className="mt-2 list-disc space-y-1 pl-5">
              {lesson.sinhalaNotes.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </details>
          <Button className="mt-4" onClick={() => setStep('examples')}>
            See examples
          </Button>
        </Card>
      )}

      {step === 'examples' && (
        <Card>
          <h2 className="mb-2 font-semibold">Examples</h2>
          <ul className="space-y-3">
            {lesson.examples.map((ex) => (
              <li key={ex.en}>
                <p className="font-medium">{ex.en}</p>
                <p lang="si" className="text-slate-600">
                  {ex.si}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setStep('explain')}>
              Back
            </Button>
            <Button onClick={restartPractice}>Start practice</Button>
          </div>
        </Card>
      )}

      {step === 'practice' && (
        <Card>
          <p className="text-sm text-slate-600">
            Question {qIndex + 1} of {lesson.questions.length}
          </p>
          <QuestionCard
            key={lesson.questions[qIndex].id}
            question={lesson.questions[qIndex]}
            isLast={qIndex === lesson.questions.length - 1}
            onNext={onNext}
          />
        </Card>
      )}

      {step === 'result' && result && (
        <Card>
          <h2 className="text-xl font-bold">
            {result.score} / {result.total} ({result.percent}%)
          </h2>
          {result.outcome === 'pass' && (
            <p className="mt-1 text-green-700">
              Great work! {result.unlockedNext ? 'The next lesson is unlocked.' : 'Lesson passed.'}
            </p>
          )}
          {result.outcome === 'retry' && (
            <p className="mt-1 text-amber-700">
              Almost there. Score 70% to unlock the next lesson.
            </p>
          )}
          {result.outcome === 'review' && (
            <p className="mt-1 text-red-700">
              Let’s review the explanation again, with the Sinhala notes.
            </p>
          )}
          {result.wrongItems.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {result.wrongItems.map((w) => (
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
          <div className="mt-4 flex flex-wrap gap-2">
            {result.outcome === 'review' ? (
              <Button
                onClick={() => {
                  setNotesOpen(true);
                  setStep('explain');
                }}
              >
                Review explanation
              </Button>
            ) : result.outcome === 'retry' ? (
              <Button onClick={restartPractice}>Try again</Button>
            ) : (
              <>
                {result.unlockedNext && (
                  <Link
                    to={`/grammar/${result.unlockedNext}`}
                    className="rounded bg-indigo-600 px-4 py-2 font-medium text-white"
                  >
                    Next lesson
                  </Link>
                )}
                <Button variant="secondary" onClick={restartPractice}>
                  Practise again
                </Button>
              </>
            )}
            <Link to="/grammar" className="rounded bg-slate-200 px-4 py-2 font-medium">
              Grammar path
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
