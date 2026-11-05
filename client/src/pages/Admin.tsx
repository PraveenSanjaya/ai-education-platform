import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import { Button, Card, ErrorMessage, TextInput, inputClass } from '../components/ui';
import { LEVELS } from '../lib/types';
import type { Level, User } from '../lib/types';

const empty = { name: '', email: '', password: '', startLevel: 'Beginner' as Level, role: 'user' };

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setUsers((await api<{ users: User[] }>('/admin/users')).users);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(fn: () => Promise<unknown>) {
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function add(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      await api('/admin/users', { method: 'POST', body: form });
      setForm(empty);
    });
  }

  const update = (id: string, body: object) =>
    run(() => api(`/admin/users/${id}`, { method: 'PUT', body }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Manage users</h1>
      <ErrorMessage message={error} />
      <Card>
        <h2 className="mb-2 font-semibold">Add user</h2>
        <form onSubmit={add} className="grid gap-2 sm:grid-cols-2">
          <TextInput
            aria-label="Name"
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextInput
            aria-label="Email"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextInput
            aria-label="Password"
            placeholder="Password (min 8)"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            aria-label="Level"
            className={inputClass}
            value={form.startLevel}
            onChange={(e) => setForm({ ...form, startLevel: e.target.value as Level })}
          >
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select
            aria-label="Role"
            className={inputClass}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <Button type="submit">Add user</Button>
        </form>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Level</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select
                    aria-label={`Level for ${u.name}`}
                    className={inputClass}
                    value={u.startLevel}
                    onChange={(e) => update(u.id, { startLevel: e.target.value })}
                  >
                    {LEVELS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.active ? 'Active' : 'Deactivated'}</td>
                <td className="p-2">
                  <Button
                    variant={u.active ? 'danger' : 'secondary'}
                    onClick={() => update(u.id, { active: !u.active })}
                  >
                    {u.active ? 'Deactivate' : 'Reactivate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
