import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { tzOffset } from '../lib/types';
import type { Progress } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import BarChart from '../components/BarChart';
import { Card, ErrorMessage, Loading } from '../components/ui';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [p, setP] = useState<Progress | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Progress>(`/progress?tz=${tzOffset()}`)
      .then(setP)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-slate-600">Starting level: {user?.startLevel}</p>
      </div>
      <ErrorMessage message={error} />
      {!p && !error && <Loading label="Loading your progress…" />}
      {p && (
        <>
          <Card className="border-indigo-300 bg-indigo-50">
            <h2 className="font-semibold">Your next step</h2>
            {p.next ? (
              <>
                <p className="mt-1">
                  {p.next.title}{' '}
                  <span lang="si" className="text-slate-600">
                    · {p.next.titleSi}
                  </span>
                </p>
                <p className="text-sm text-slate-600">
                  {p.next.bestPercent === null
                    ? 'You have not tried this lesson yet.'
                    : `Your best so far is ${p.next.bestPercent}%. Reach 70% to move on.`}
                </p>
                <Link
                  to={`/grammar/${p.next.lessonId}`}
                  className="mt-3 inline-block rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                >
                  Continue lesson
                </Link>
              </>
            ) : (
              <>
                <p className="mt-1">You have mastered every unlocked lesson. Keep it fresh!</p>
                <Link className="mt-3 inline-block text-indigo-700 underline" to="/grammar-tests">
                  Take a mixed grammar review
                </Link>
              </>
            )}
            {p.wordsSaved === 0 && (
              <p className="mt-3 text-sm">
                You have no saved words yet.{' '}
                <Link className="text-indigo-700 underline" to="/words">
                  Add your first words
                </Link>
                .
              </p>
            )}
          </Card>

          {p.lastScores.length === 0 && (
            <Card>
              <h2 className="font-semibold">Not sure where to start?</h2>
              <p className="text-sm text-slate-600">
                Take the level check: one question per lesson, and we will set your starting level.
              </p>
              <Link className="mt-2 inline-block text-indigo-700 underline" to="/grammar-tests">
                Go to the level check
              </Link>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Day streak" value={p.streak} />
            <Stat label="Words saved" value={p.wordsSaved} />
            <Stat label="Words learned" value={p.wordsLearned} />
            <Stat label="Lessons mastered" value={`${p.lessonsMastered} / ${p.totalLessons}`} />
          </div>

          <Card>
            <h2 className="mb-2 font-semibold">Last 10 scores (%)</h2>
            {p.lastScores.length === 0 ? (
              <p className="text-slate-600">
                No scores yet. Take a vocabulary test or a lesson to see your progress here.
              </p>
            ) : (
              <BarChart data={p.lastScores.map((s) => ({ label: s.title, percent: s.percent }))} />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
