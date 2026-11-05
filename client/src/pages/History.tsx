import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { tzOffset } from '../lib/types';
import type { HistoryItem, HistorySummary } from '../lib/types';
import { Button, Card, ErrorMessage, Loading } from '../components/ui';

const KIND_LABEL: Record<HistoryItem['kind'], string> = {
  vocab: 'Vocabulary',
  grammar: 'Grammar',
  mixed: 'Mixed review',
  placement: 'Level check',
};

export default function History() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ items: HistoryItem[]; summary: HistorySummary }>(
        `/history?tz=${tzOffset()}`,
      );
      setItems(r.items);
      setSummary(r.summary);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function clear() {
    try {
      await api('/history', { method: 'DELETE' });
      setConfirming(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!items || !summary)
    return error ? <ErrorMessage message={error} /> : <Loading label="Loading history…" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">History</h1>
      <ErrorMessage message={error} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Sessions', summary.sessions],
          ['Average score', `${summary.averagePercent}%`],
          ['Mistakes', summary.mistakes],
          ['Day streak', summary.streak],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-slate-600">
            Nothing here yet. Finish a test or lesson and it will show up in your history.
          </p>
        </Card>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id}>
                <Card>
                  <details>
                    <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-200 px-2 py-0.5 text-xs">
                        {KIND_LABEL[it.kind]}
                      </span>
                      <span className="font-medium">{it.title}</span>
                      <span className="ml-auto text-sm">
                        {it.score}/{it.total} ({it.percent}%)
                      </span>
                      <time
                        className="w-full text-xs text-slate-500 sm:w-auto"
                        dateTime={it.createdAt}
                      >
                        {new Date(it.createdAt).toLocaleString()}
                      </time>
                    </summary>
                    {it.wrongItems.length === 0 ? (
                      <p className="mt-2 text-green-700">No mistakes. Well done!</p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm">
                        {it.wrongItems.map((w, i) => (
                          <li key={i} className="rounded bg-red-50 p-2">
                            <p>{w.prompt}</p>
                            <p>
                              Your answer: <b>{w.response || '—'}</b> · Correct:{' '}
                              <b>{w.correctAnswer}</b>
                            </p>
                            {w.explanation && <p className="text-slate-600">{w.explanation}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                </Card>
              </li>
            ))}
          </ul>

          {confirming ? (
            <Card className="border-red-300 bg-red-50">
              <p role="alertdialog" aria-label="Confirm clear history" className="font-medium">
                Clear all history? This cannot be undone.
              </p>
              <div className="mt-2 flex gap-2">
                <Button variant="danger" onClick={clear}>
                  Yes, clear history
                </Button>
                <Button variant="secondary" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          ) : (
            <Button variant="secondary" onClick={() => setConfirming(true)}>
              Clear history
            </Button>
          )}
        </>
      )}
    </div>
  );
}
