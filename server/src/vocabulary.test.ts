import request from 'supertest';
import { app, clearDb, registerUser, startTestDb, stopTestDb } from './testUtils';
import { seedDictionary } from './seed/dictionary';
import { dictionarySeed } from './data/dictionaryData';
import { lemmaCandidates } from './services/lemma';

beforeAll(async () => {
  await startTestDb();
});
afterAll(stopTestDb);
beforeEach(async () => {
  await clearDb();
  await seedDictionary();
});

describe('seed data', () => {
  it('has at least 200 complete entries', () => {
    expect(dictionarySeed.length).toBeGreaterThanOrEqual(200);
    for (const e of dictionarySeed) {
      expect(e.english && e.sinhala && e.partOfSpeech && e.level && e.example).toBeTruthy();
    }
    const names = dictionarySeed.map((e) => e.english);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('lemmaCandidates', () => {
  it.each([
    ['learns', 'learn'],
    ['studies', 'study'],
    ['running', 'run'],
    ['making', 'make'],
    ['liked', 'like'],
    ['went', 'go'],
    ['bigger', 'big'],
  ])('%s -> %s', (word, base) => {
    expect(lemmaCandidates(word)).toContain(base);
  });
});

describe('GET /api/dictionary/lookup', () => {
  it('requires login', async () => {
    expect((await request(app).get('/api/dictionary/lookup?word=book')).status).toBe(401);
  });

  it('finds an exact word', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .get('/api/dictionary/lookup?word=Book')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.found).toBe(true);
    expect(res.body.sinhala).toBe('පොත');
  });

  it('resolves simple word forms', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .get('/api/dictionary/lookup?word=learns')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.found).toBe(true);
    expect(res.body.baseForm).toBe('learn');
    const study = await request(app)
      .get('/api/dictionary/lookup?word=carries')
      .set('Authorization', `Bearer ${token}`);
    expect(study.body.found).toBe(false); // not in dictionary, no API key in tests
  });

  it('reports unknown words without failing', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .get('/api/dictionary/lookup?word=zzzzqx')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.found).toBe(false);
  });
});

describe('/api/words', () => {
  it('adds, lists, filters and deletes words per user', async () => {
    const { token } = await registerUser();
    const other = await registerUser('other@example.com');
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(app)
      .post('/api/words')
      .set(auth)
      .send({ english: 'Book', sinhala: 'පොත' });
    expect(created.status).toBe(201);
    expect(created.body.word.english).toBe('book');
    expect(created.body.word.strength).toBe(0);

    const dup = await request(app)
      .post('/api/words')
      .set(auth)
      .send({ english: 'book', sinhala: 'පොත' });
    expect(dup.status).toBe(409);

    const bySinhala = await request(app).get('/api/words?q=පො').set(auth);
    expect(bySinhala.body.words).toHaveLength(1);
    const learned = await request(app).get('/api/words?filter=learned').set(auth);
    expect(learned.body.words).toHaveLength(0);
    const mine = await request(app)
      .get('/api/words')
      .set({ Authorization: `Bearer ${other.token}` });
    expect(mine.body.words).toHaveLength(0);

    const del = await request(app).delete(`/api/words/${created.body.word.id}`).set(auth);
    expect(del.status).toBe(204);
  });

  it('validates the body', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .post('/api/words')
      .set('Authorization', `Bearer ${token}`)
      .send({ english: '123', sinhala: '' });
    expect(res.status).toBe(400);
  });
});

describe('word forms from the spec', () => {
  it('resolves studies -> study and learns -> learn', async () => {
    const { token } = await registerUser();
    for (const [typed, base] of [
      ['studies', 'study'],
      ['learns', 'learn'],
    ]) {
      const res = await request(app)
        .get(`/api/dictionary/lookup?word=${typed}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.body.found).toBe(true);
      expect(res.body.baseForm).toBe(base);
    }
  });
});
