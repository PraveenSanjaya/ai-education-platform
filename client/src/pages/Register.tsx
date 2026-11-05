import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, ErrorMessage, Field, TextInput, inputClass } from '../components/ui';
import { LEVELS } from '../lib/types';
import type { Level } from '../lib/types';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    startLevel: 'Beginner' as Level,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/challenge'); // next step in the flow: choose Easy or Hard
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-xl font-bold">Create your account</h1>
      <form onSubmit={submit} className="space-y-3">
        <ErrorMessage message={error} />
        <Field label="Name" htmlFor="name">
          <TextInput
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <TextInput
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password (min 8 characters)" htmlFor="password">
          <TextInput
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Field label="Starting level" htmlFor="level">
          <select
            id="level"
            className={inputClass}
            value={form.startLevel}
            onChange={(e) => setForm({ ...form, startLevel: e.target.value as Level })}
          >
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Creating…' : 'Register'}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Already registered?{' '}
        <Link to="/login" className="text-indigo-700 underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
