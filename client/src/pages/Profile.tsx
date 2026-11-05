import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card, ErrorMessage, Field, TextInput, inputClass } from '../components/ui';
import { LEVELS } from '../lib/types';
import type { Level, User } from '../lib/types';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [startLevel, setStartLevel] = useState<Level>(user?.startLevel ?? 'Beginner');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      const r = await api<{ user: User }>('/users/me', {
        method: 'PUT',
        body: { name, startLevel },
      });
      setUser(r.user);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="mb-1 text-xl font-bold">Your profile</h1>
      <p className="mb-4 text-sm text-slate-600">{user?.email}</p>
      <form onSubmit={submit} className="space-y-3">
        <ErrorMessage message={error} />
        {saved && (
          <p role="status" className="rounded bg-green-50 p-2 text-sm text-green-700">
            Profile saved.
          </p>
        )}
        <Field label="Name" htmlFor="name">
          <TextInput id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Starting level" htmlFor="level">
          <select
            id="level"
            className={inputClass}
            value={startLevel}
            onChange={(e) => setStartLevel(e.target.value as Level)}
          >
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Button type="submit">Save changes</Button>
      </form>
    </Card>
  );
}
