import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useDebounce } from '../lib/useDebounce';
import type { SavedWord } from '../lib/types';
import AddWordForm from '../components/AddWordForm';
import StrengthMeter from '../components/StrengthMeter';
import SpeakButton from '../components/SpeakButton';
import { Button, Card, ErrorMessage, Loading, TextInput } from '../components/ui';

const FILTERS = [
  ['all', 'All'],
  ['learning', 'Learning'],
  ['learned', 'Learned'],
  ['mistakes', 'Mistakes'],
] as const;
type Filter = (typeof FILTERS)[number][0];

const UNDO_MS = 5000;

export default function Vocabulary() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [pending, setPending] = useState<SavedWord | null>(null);
  const pendingRef = useRef<{ word: SavedWord; timer: ReturnType<typeof setTimeout> } | null>(null);
  const q = useDebounce(search.trim(), 250);

  const load = useCallback(async () => {
    try {
      const r = await api<{ words: SavedWord[] }>(
        `/words?filter=${filter}&q=${encodeURIComponent(q)}`,
      );
      setWords(r.words);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter, q]);

  useEffect(() => {
    load();
  }, [load]);

  const commitDelete = useCallback(async (word: SavedWord) => {
    try {
      await api(`/words/${word.id}`, { method: 'DELETE' });
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  // If the learner leaves the page while an undo is pending, finish the delete.
  useEffect(
    () => () => {
      const p = pendingRef.current;
      if (p) {
        clearTimeout(p.timer);
        commitDelete(p.word);
      }
    },
    [commitDelete],
  );

  function remove(word: SavedWord) {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
      commitDelete(pendingRef.current.word);
    }
    setWords((ws) => ws.filter((w) => w.id !== word.id));
    setPending(word);
    const timer = setTimeout(() => {
      commitDelete(word);
      pendingRef.current = null;
      setPending(null);
    }, UNDO_MS);
    pendingRef.current = { word, timer };
  }

  function undo() {
    const p = pendingRef.current;
    if (!p) return;
    clearTimeout(p.timer);
    pendingRef.current = null;
    setPending(null);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My words</h1>
      <AddWordForm onAdded={() => load()} />
      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <TextInput
            aria-label="Search words"
            placeholder="Search English or Sinhala"
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div role="group" aria-label="Filter words" className="flex flex-wrap gap-1">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded px-3 py-1.5 text-sm ${filter === key ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <ErrorMessage message={error} />
        {loading ? (
          <Loading label="Loading your words…" />
        ) : words.length === 0 ? (
          <p className="text-slate-600">
            {search || filter !== 'all'
              ? 'No words match your search.'
              : 'No words yet. Add your first word above.'}
          </p>
        ) : (
          <ul className="divide-y">
            {words.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {w.english}{' '}
                    <span lang="si" className="font-normal text-slate-700">
                      — {w.sinhala}
                    </span>
                    {w.needsReview && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 text-xs text-amber-800">
                        review
                      </span>
                    )}
                  </p>
                  {w.example && <p className="text-sm text-slate-500">{w.example}</p>}
                </div>
                <SpeakButton text={w.english} />
                <StrengthMeter value={w.strength} />
                <Button
                  variant="secondary"
                  onClick={() => remove(w)}
                  aria-label={`Delete ${w.english}`}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {pending && (
        <div
          role="status"
          className="above-tabbar fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded bg-slate-900 px-4 py-2 text-white shadow-lg"
        >
          Deleted “{pending.english}”
          <button className="font-semibold underline" onClick={undo}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
