import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import { useDebounce } from '../lib/useDebounce';
import type { Lookup, SavedWord } from '../lib/types';
import { Button, Card, ErrorMessage, Field, TextInput } from './ui';

type LookupState = 'idle' | 'loading' | 'found' | 'missing';

export default function AddWordForm({ onAdded }: { onAdded: (w: SavedWord) => void }) {
  const [english, setEnglish] = useState('');
  const [sinhala, setSinhala] = useState('');
  const [meta, setMeta] = useState({ partOfSpeech: '', example: '' });
  const [state, setState] = useState<LookupState>('idle');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const edited = useRef(false); // true once the learner types their own Sinhala meaning
  const debounced = useDebounce(english.trim(), 300);

  useEffect(() => {
    if (!debounced) {
      setState('idle');
      setNote('');
      return;
    }
    let cancelled = false;
    setState('loading');
    api<Lookup>(`/dictionary/lookup?word=${encodeURIComponent(debounced)}`)
      .then((r) => {
        if (cancelled) return;
        if (!r.found) {
          setState('missing');
          setNote('');
          return;
        }
        setState('found');
        setNote(r.baseForm ? `Matched base form “${r.baseForm}”` : '');
        setMeta({ partOfSpeech: r.partOfSpeech ?? '', example: r.example ?? '' });
        if (!edited.current) setSinhala(r.sinhala ?? '');
      })
      .catch(() => !cancelled && setState('missing'));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const r = await api<{ word: SavedWord }>('/words', {
        method: 'POST',
        body: { english: english.trim(), sinhala: sinhala.trim(), ...meta },
      });
      onAdded(r.word);
      setEnglish('');
      setSinhala('');
      setMeta({ partOfSpeech: '', example: '' });
      setState('idle');
      edited.current = false;
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Add a word</h2>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="English word" htmlFor="english">
          <TextInput
            id="english"
            value={english}
            autoComplete="off"
            required
            onChange={(e) => {
              setEnglish(e.target.value);
              edited.current = false;
              setSinhala('');
            }}
          />
        </Field>
        <Field label="Sinhala meaning (සිංහල)" htmlFor="sinhala">
          <TextInput
            id="sinhala"
            lang="si"
            value={sinhala}
            required
            onChange={(e) => {
              edited.current = true;
              setSinhala(e.target.value);
            }}
          />
        </Field>
        <Button type="submit">Add word</Button>
      </form>
      <p className="mt-2 min-h-5 text-sm text-slate-600" aria-live="polite">
        {state === 'loading' && 'Looking up…'}
        {state === 'found' && (note || 'Meaning filled in automatically. You can edit it.')}
        {state === 'missing' && 'No automatic meaning found. Type the Sinhala meaning yourself.'}
      </p>
      {meta.partOfSpeech && (
        <p className="text-sm text-slate-600">
          {meta.partOfSpeech}
          {meta.example && ` · “${meta.example}”`}
        </p>
      )}
      <ErrorMessage message={error} />
    </Card>
  );
}
