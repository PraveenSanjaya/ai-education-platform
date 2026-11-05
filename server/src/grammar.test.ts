import request from 'supertest';
import { app, clearDb, registerUser, startTestDb, stopTestDb } from './testUtils';
import { seedLessons } from './seed/lessons';
import { lessonsSeed } from './data/lessonsData';
import { isCorrect, normalise } from './services/grading';

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(async () => {
  await clearDb();
  await seedLessons();
});

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('lesson content', () => {
  it('has 9 ordered lessons with Sinhala notes, examples and >= 6 questions', () => {
    expect(lessonsSeed.map((l) => l.title.split(':')[0])).toEqual([
      'Articles',
      'To be',
      'Present simple',
      'Present continuous',
      'Past simple',
      'Future',
      'Present perfect',
      'Conditionals',
      'Passive voice',
    ]);
    for (const l of lessonsSeed) {
      expect(l.questions.length).toBeGreaterThanOrEqual(6);
      expect(l.sinhalaNotes.length).toBeGreaterThan(0);
      expect(l.examples.every((e) => e.en && e.si)).toBe(true);
      for (const q of l.questions) {
        expect(q.answers.length).toBeGreaterThan(0);
        if (q.type === 'mc') expect(q.options).toContain(q.answers[0]);
      }
    }
  });
});

describe('grading', () => {
  it('normalises case, spaces and trailing punctuation', () => {
    expect(normalise('  Goes. ')).toBe('goes');
    expect(isCorrect({ type: 'fill', answers: ['are going to'] }, 'Are  going   to')).toBe(true);
    expect(isCorrect({ type: 'fill', answers: ['an'] }, '')).toBe(false);
  });
});

describe('GET /api/lessons', () => {
  it('unlocks only beginner lessons for a beginner and recommends the first', async () => {
    const { token } = await registerUser();
    const res = await request(app).get('/api/lessons').set(bearer(token));
    expect(res.body.lessons).toHaveLength(9);
    const unlocked = res.body.lessons.map((l: { unlocked: boolean }) => l.unlocked);
    expect(unlocked).toEqual([true, true, true, false, false, false, false, false, false]);
    expect(res.body.recommendedId).toBe(res.body.lessons[0].id);
  });

  it('unlocks everything up to the start level', async () => {
    const { token } = await registerUser('mid@example.com', { startLevel: 'Elementary' });
    const res = await request(app).get('/api/lessons').set(bearer(token));
    expect(res.body.lessons.filter((l: { unlocked: boolean }) => l.unlocked)).toHaveLength(6);
    expect(res.body.recommendedId).toBe(res.body.lessons[3].id);
  });

  it('refuses a locked lesson', async () => {
    const { token } = await registerUser();
    const list = await request(app).get('/api/lessons').set(bearer(token));
    const locked = await request(app)
      .get(`/api/lessons/${list.body.lessons[8].id}`)
      .set(bearer(token));
    expect(locked.status).toBe(403);
  });
});

describe('POST /api/results (grammar)', () => {
  async function submit(token: string, lessonId: string, correctCount: number) {
    const lesson = await request(app).get(`/api/lessons/${lessonId}`).set(bearer(token));
    const questions = lesson.body.lesson.questions as { id: string; answers: string[] }[];
    const answers = questions.map((q, i) => ({
      questionId: q.id,
      response: i < correctCount ? q.answers[0] : 'definitely wrong',
    }));
    return request(app)
      .post('/api/results')
      .set(bearer(token))
      .send({ kind: 'grammar', lessonId, answers });
  }

  it('unlocks the next lesson at 70% or more', async () => {
    const { token } = await registerUser();
    const list = await request(app).get('/api/lessons').set(bearer(token));
    const third = list.body.lessons[2];
    expect(list.body.lessons[3].unlocked).toBe(false);

    const res = await submit(token, third.id, 9);
    expect(res.body.percent).toBe(100);
    expect(res.body.outcome).toBe('pass');
    expect(res.body.unlockedNext).toBe(list.body.lessons[3].id);
  });

  it('returns retry for 50-69% and review below 50%, keeping the best score', async () => {
    const { token } = await registerUser();
    const list = await request(app).get('/api/lessons').set(bearer(token));
    const first = list.body.lessons[0].id;

    const retry = await submit(token, first, 6); // 6/9 = 67%
    expect(retry.body.outcome).toBe('retry');
    const review = await submit(token, first, 2); // 22%
    expect(review.body.outcome).toBe('review');
    expect(review.body.wrongItems.length).toBe(7);
    expect(review.body.bestPercent).toBe(67);
  });

  it('rejects unknown questions', async () => {
    const { token } = await registerUser();
    const list = await request(app).get('/api/lessons').set(bearer(token));
    const res = await request(app)
      .post('/api/results')
      .set(bearer(token))
      .send({
        kind: 'grammar',
        lessonId: list.body.lessons[0].id,
        answers: [{ questionId: 'nope', response: 'x' }],
      });
    expect(res.status).toBe(400);
  });
});

describe('word ordering questions', () => {
  it('every lesson has an order question whose words build the answer', () => {
    for (const l of lessonsSeed) {
      const o = l.questions.find((q) => q.type === 'order');
      expect(o).toBeDefined();
      const words = [...o!.options!].map((w) => w.toLowerCase()).sort();
      const expected = o!.answers[0].toLowerCase().split(' ').sort();
      expect(words).toEqual(expected);
    }
  });
});

describe('mixed review and level check', () => {
  const answerAll = (qs: { id: string; answers: string[] }[], correctFn: (i: number) => boolean) =>
    qs.map((q, i) => ({ questionId: q.id, response: correctFn(i) ? q.answers[0] : 'wrong' }));

  it('mixed review only draws from unlocked lessons and does not change best scores', async () => {
    const { token } = await registerUser();
    const res = await request(app).get('/api/grammar/mixed').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(10);
    for (const q of res.body.questions) {
      expect(q.id).toMatch(/^(articles|to-be|present-simple)-/);
    }
    const graded = await request(app)
      .post('/api/results')
      .set(bearer(token))
      .send({ kind: 'mixed', answers: answerAll(res.body.questions, () => true) });
    expect(graded.body.percent).toBe(100);
    const lessons = await request(app).get('/api/lessons').set(bearer(token));
    expect(lessons.body.lessons[0].bestPercent).toBeNull();
  });

  it('level check sets the start level from the furthest lesson reached', async () => {
    const { token } = await registerUser();
    const qs = (await request(app).get('/api/grammar/placement').set(bearer(token))).body.questions;
    expect(qs).toHaveLength(9);
    // all right up to lesson 5, then two mistakes at lessons 6 and 7
    const res = await request(app)
      .post('/api/results')
      .set(bearer(token))
      .send({ kind: 'placement', answers: answerAll(qs, (i) => i < 5 || i > 6) });
    expect(res.body.reached).toBe(6);
    expect(res.body.total).toBe(7);
    expect(res.body.level).toBe('Elementary');
    expect(res.body.user.startLevel).toBe('Elementary');
    const me = await request(app).get('/api/users/me').set(bearer(token));
    expect(me.body.user.startLevel).toBe('Elementary');
  });
});
