import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { LessonSummary } from '../lib/types';
import { Card, ErrorMessage } from '../components/ui';

export default function Grammar() {
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [recommendedId, setRecommendedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ lessons: LessonSummary[]; recommendedId: string | null }>('/lessons')
      .then((r) => {
        setLessons(r.lessons);
        setRecommendedId(r.recommendedId);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  if (error) return <ErrorMessage message={error} />;
  if (!lessons) return <p>Loading lessons…</p>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Grammar path</h1>
      <p className="text-sm text-slate-600">Score 70% or more to unlock the next lesson.</p>
      <ol className="space-y-2">
        {lessons.map((l) => (
          <li key={l.id}>
            <Card className={`flex flex-wrap items-center gap-3 ${l.unlocked ? '' : 'opacity-60'}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {l.order}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {l.title}
                  {l.id === recommendedId && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 text-xs text-amber-800">
                      Recommended
                    </span>
                  )}
                </p>
                <p lang="si" className="text-sm text-slate-600">
                  {l.titleSi} · {l.level}
                </p>
              </div>
              <span className="text-sm">
                {l.bestPercent !== null ? `Best: ${l.bestPercent}%` : 'Not tried'}
                {l.mastered && ' ✓'}
              </span>
              {l.unlocked ? (
                <Link
                  to={`/grammar/${l.id}`}
                  className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {l.attempts ? 'Open' : 'Start'}
                </Link>
              ) : (
                <span className="text-sm text-slate-500">🔒 Locked</span>
              )}
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
