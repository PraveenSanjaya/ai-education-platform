import request from 'supertest';
import { app, clearDb, registerUser, startTestDb, stopTestDb } from './testUtils';
import { seedLessons } from './seed/lessons';
import { seedDictionary } from './seed/dictionary';

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(async () => {
  await clearDb();
  await seedLessons();
  await seedDictionary();
});

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

async function firstLesson(token: string) {
  const list = await request(app).get('/api/lessons').set(bearer(token));
  const id = list.body.lessons[0].id as string;
  const lesson = await request(app).get(`/api/lessons/${id}`).set(bearer(token));
  return { id, questions: lesson.body.lesson.questions as { id: string; answers: string[] }[] };
}

const allRight = (qs: { id: string; answers: string[] }[]) =>
  qs.map((q) => ({ questionId: q.id, response: q.answers[0] }));

describe('history and progress', () => {
  it('records grammar results with missed questions and clears them', async () => {
    const { token } = await registerUser();
    const { id, questions } = await firstLesson(token);
    const answers = questions.map((q, i) => ({
      questionId: q.id,
      response: i < 6 ? q.answers[0] : 'nope',
    }));
    const posted = await request(app)
      .post('/api/results')
      .set(bearer(token))
      .send({ kind: 'grammar', lessonId: id, answers });
    expect(posted.status).toBe(200);

    const hist = await request(app).get('/api/history').set(bearer(token));
    expect(hist.body.items).toHaveLength(1);
    expect(hist.body.items[0].kind).toBe('grammar');
    expect(hist.body.items[0].wrongItems).toHaveLength(3);
    expect(hist.body.items[0].wrongItems[0].correctAnswer).toBeTruthy();
    expect(hist.body.summary).toMatchObject({ sessions: 1, mistakes: 3, streak: 1 });

    expect((await request(app).delete('/api/history').set(bearer(token))).status).toBe(204);
    const after = await request(app).get('/api/history').set(bearer(token));
    expect(after.body.items).toHaveLength(0);
    expect(after.body.summary.streak).toBe(0);
  });

  it('records vocab results and updates word strength', async () => {
    const { token } = await registerUser();
    const w = await request(app)
      .post('/api/words')
      .set(bearer(token))
      .send({ english: 'book', sinhala: 'පොත' });
    const wordId = w.body.word.id;
    await request(app)
      .post('/api/results')
      .set(bearer(token))
      .send({
        kind: 'vocab',
        title: 'English → Sinhala',
        answers: [
          { wordId, prompt: 'book', response: 'පෑන', correctAnswer: 'පොත', correct: false },
        ],
      });
    const words = await request(app).get('/api/words?filter=mistakes').set(bearer(token));
    expect(words.body.words).toHaveLength(1);
    const hist = await request(app).get('/api/history').set(bearer(token));
    expect(hist.body.items[0]).toMatchObject({ kind: 'vocab', score: 0, total: 1, percent: 0 });
  });

  it('keeps history private to each user', async () => {
    const a = await registerUser();
    const b = await registerUser('b@example.com');
    const { id, questions } = await firstLesson(a.token);
    await request(app)
      .post('/api/results')
      .set(bearer(a.token))
      .send({ kind: 'grammar', lessonId: id, answers: allRight(questions) });
    expect((await request(app).get('/api/history').set(bearer(b.token))).body.items).toHaveLength(
      0,
    );
  });

  it('reports progress: counts, last scores and the recommended lesson', async () => {
    const { token } = await registerUser();
    await request(app)
      .post('/api/words')
      .set(bearer(token))
      .send({ english: 'book', sinhala: 'පොත' });
    const before = await request(app).get('/api/progress').set(bearer(token));
    expect(before.body).toMatchObject({
      wordsSaved: 1,
      wordsLearned: 0,
      lessonsMastered: 0,
      streak: 0,
    });
    expect(before.body.next.title).toMatch(/Articles/);

    const { id, questions } = await firstLesson(token);
    await request(app)
      .post('/api/results')
      .set(bearer(token))
      .send({ kind: 'grammar', lessonId: id, answers: allRight(questions) });
    const after = await request(app).get('/api/progress').set(bearer(token));
    expect(after.body.lessonsMastered).toBe(1);
    expect(after.body.streak).toBe(1);
    expect(after.body.lastScores).toHaveLength(1);
    expect(after.body.lastScores[0].percent).toBe(100);
    expect(after.body.next.title).toMatch(/To be/);
  });
});
