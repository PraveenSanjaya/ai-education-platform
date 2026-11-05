import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import TryOneWord from '../components/TryOneWord';

interface Stats {
  words: number;
  sentences: number;
  lessons: number;
  questionTypes: number;
}

function StatsBand() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    api<Stats>('/public/stats')
      .then(setStats)
      .catch(() => setStats(null));
  }, []);
  if (!stats) return null;
  const items: [number, string][] = [
    [stats.words, 'words with Sinhala meanings'],
    [stats.sentences, 'example sentences'],
    [stats.lessons, 'grammar lessons'],
    [stats.questionTypes, 'question types'],
  ];
  return (
    <ul
      aria-label="App statistics"
      className="grid grid-cols-2 gap-3 rounded-lg bg-indigo-600 p-4 text-center text-white md:grid-cols-4"
    >
      {items.map(([n, label]) => (
        <li key={label}>
          <p className="text-3xl font-bold">{n}</p>
          <p className="text-sm opacity-90">{label}</p>
        </li>
      ))}
    </ul>
  );
}

/** Home hero for visitors who are not logged in. */
export default function Landing() {
  return (
    <div className="space-y-6">
      <section className="grid items-center gap-6 py-4 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            Learn English words you can see, hear and say.
          </h1>
          <p lang="si" className="mt-2 text-lg text-slate-600">
            සිංහල අර්ථ සමඟ ඉංග්‍රීසි ඉගෙන ගන්න.
          </p>
          <p className="mt-2 text-slate-600">
            Save words with their Sinhala meaning, play picture games, and follow a grammar path
            that adapts to you.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              Start playing
            </Link>
            <Link
              to="/challenge"
              className="rounded border border-indigo-600 px-5 py-2.5 font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Choose your challenge
            </Link>
          </div>
        </div>
        <TryOneWord />
      </section>
      <StatsBand />
    </div>
  );
}
