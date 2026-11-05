import request from 'supertest';
import { app, clearDb, registerAdmin, registerUser, startTestDb, stopTestDb } from './testUtils';

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(clearDb);

describe('auth', () => {
  it('registers a user and never returns the password hash', async () => {
    const { res } = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('learner@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.startLevel).toBe('Beginner');
  });

  it('rejects invalid input with a clear message', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'nope', password: '1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('rejects duplicate emails', async () => {
    await registerUser();
    const { res } = await registerUser();
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials only', async () => {
    await registerUser();
    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: 'learner@example.com', password: 'password123' });
    expect(ok.status).toBe(200);
    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: 'learner@example.com', password: 'wrongpass' });
    expect(bad.status).toBe(401);
  });
});

describe('profile', () => {
  it('requires a token', async () => {
    expect((await request(app).get('/api/users/me')).status).toBe(401);
  });

  it('updates name and start level', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name', startLevel: 'Intermediate' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('New Name');
    expect(res.body.user.startLevel).toBe('Intermediate');
  });

  it('rejects an unknown level', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ startLevel: 'Expert' });
    expect(res.status).toBe(400);
  });
});

describe('admin users', () => {
  it('blocks non-admins', async () => {
    const { token } = await registerUser();
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('lets an admin add, edit and deactivate users', async () => {
    const { token } = await registerAdmin();
    const auth = { Authorization: `Bearer ${token}` };
    const created = await request(app)
      .post('/api/admin/users')
      .set(auth)
      .send({ name: 'Kamal', email: 'kamal@example.com', password: 'password123' });
    expect(created.status).toBe(201);
    const id = created.body.user.id;

    const edited = await request(app)
      .put(`/api/admin/users/${id}`)
      .set(auth)
      .send({ startLevel: 'Elementary' });
    expect(edited.body.user.startLevel).toBe('Elementary');

    const del = await request(app).delete(`/api/admin/users/${id}`).set(auth);
    expect(del.body.user.active).toBe(false);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'kamal@example.com', password: 'password123' });
    expect(login.status).toBe(403);
  });

  it('stops admins deactivating themselves', async () => {
    const { token, user } = await registerAdmin();
    const res = await request(app)
      .delete(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
