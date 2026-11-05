import request from 'supertest';
import { app, clearDb, registerUser, startTestDb, stopTestDb } from './testUtils';
import { seedDictionary } from './seed/dictionary';
import { seedLessons } from './seed/lessons';
import { dictionarySeed } from './data/dictionaryData';
import { buildGap, canGap, GAP } from './services/gap';

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(async () => {
  await clearDb();
  await seedDictionary();
  await seedLessons();
});

const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });
const wordCount = (s: string) => s.trim().split(/\s+/).length;

describe('challenge sentences and pictures in the seed data', () => {
  it('gives all words an easy (3-5 words) and a longer hard sentence containing the word', () => {
    expect(dictionarySeed.length).toBeGreaterThanOrEqual(241);
    for (const e of dictionarySeed) {
      expect(e.sentenceEasy).toBeTruthy();
      expect(wordCount(e.sentenceEasy)).toBeGreaterThanOrEqual(3);
      expect(wordCount(e.sentenceEasy)).toBeLessThanOrEqual(5);
      expect(wordCount(e.sentenceHard)).toBeGreaterThan(wordCount(e.sentenceEasy));
      expect(wordCount(e.sentenceHard)).toBeGreaterThanOrEqual(8);
      // the hard sentence must be blankable (needed for "complete the sentence")
      if (canGap(e.english)) expect(buildGap(e.sentenceHard, e.english)).not.toBeNull();
    }
  });

  it('has pictures for at least 30 concrete nouns', () => {
    const withPicture = dictionarySeed.filter((e) => e.imageUrl);
    expect(withPicture.length).toBeGreaterThanOrEqual(30);
    expect(withPicture.every((e) => e.partOfSpeech === 'noun')).toBe(true);
  });
});

describe('buildGap (complete the sentence)', () => {
  it('blanks the whole word, case-insensitively, keeping the rest', () => {
    expect(buildGap('My teacher is kind.', 'teacher')).toEqual({
      text: `My ${GAP} is kind.`,
      answer: 'teacher',
    });
    expect(buildGap('Learn every day.', 'learn')?.text).toBe(`${GAP} every day.`);
  });

  it('does not blank part of a longer word', () => {
    expect(buildGap('The painter works.', 'paint')).toBeNull();
    expect(buildGap('Nothing here', 'tea')).toBeNull();
  });

  it('only gaps longer alphabetic words', () => {
    expect(canGap('in')).toBe(false);
    expect(canGap('apple')).toBe(true);
  });
});

describe('challenge on the user', () => {
  it('defaults to easy, and switching to hard and back persists', async () => {
    const { token, user } = await registerUser();
    expect(user.challenge).toBe('easy');
    const put = (challenge: string) =>
      request(app).put('/api/users/me').set(bearer(token)).send({ challenge });
    expect((await put('hard')).body.user.challenge).toBe('hard');
    const me = await request(app).get('/api/users/me').set(bearer(token));
    expect(me.body.user.challenge).toBe('hard');
    expect((await put('easy')).body.user.challenge).toBe('easy');
  });

  it('rejects unknown challenges and can be chosen at registration', async () => {
    const { token } = await registerUser('c@example.com', { challenge: 'hard' });
    const me = await request(app).get('/api/users/me').set(bearer(token));
    expect(me.body.user.challenge).toBe('hard');
    const bad = await request(app)
      .put('/api/users/me')
      .set(bearer(token))
      .send({ challenge: 'insane' });
    expect(bad.status).toBe(400);
  });

  it('example sentences follow the challenge in lookup and in the word list', async () => {
    const { token } = await registerUser();
    const easy = await request(app).get('/api/dictionary/lookup?word=teacher').set(bearer(token));
    expect(easy.body.example).toBe('My teacher is kind.');
    await request(app)
      .post('/api/words')
      .set(bearer(token))
      .send({ english: 'teacher', sinhala: 'ගුරුවරයා' });
    const before = await request(app).get('/api/words').set(bearer(token));
    expect(before.body.words[0].example).toBe('My teacher is kind.');

    await request(app).put('/api/users/me').set(bearer(token)).send({ challenge: 'hard' });
    const list = await request(app).get('/api/words').set(bearer(token));
    expect(list.body.words[0].example).toMatch(/English teacher gives us extra homework/);
    expect(list.body.words[0].imageUrl).toBeTruthy();
  });
});

describe('vocabulary tests per challenge', () => {
  async function withWords(token: string) {
    for (const [english, sinhala] of [
      ['teacher', 'ගුරුවරයා'],
      ['apple', 'ඇපල්'],
      ['water', 'වතුර'],
      ['house', 'නිවස'],
      ['school', 'පාසල'],
      ['friend', 'මිතුරා'],
    ]) {
      await request(app).post('/api/words').set(bearer(token)).send({ english, sinhala });
    }
  }

  it('easy: 3 choices and no gap questions', async () => {
    const { token } = await registerUser();
    await withWords(token);
    const res = await request(app).get('/api/words/test?type=en-si').set(bearer(token));
    expect(res.body.questions).toHaveLength(6);
    for (const q of res.body.questions) {
      expect(q.options).toHaveLength(3);
      expect(q.format).toBe('en-si');
    }
  });

  it('hard: 4 choices plus complete-the-sentence questions with the word blanked out', async () => {
    const { token } = await registerUser();
    await withWords(token);
    await request(app).put('/api/users/me').set(bearer(token)).send({ challenge: 'hard' });
    const res = await request(app).get('/api/words/test?type=en-si').set(bearer(token));
    const qs = res.body.questions as {
      format: string;
      prompt: string;
      options: string[];
      answer: string;
    }[];
    const cloze = qs.filter((q) => q.format === 'cloze');
    expect(cloze.length).toBeGreaterThanOrEqual(1);
    for (const q of cloze) {
      expect(q.prompt).toContain(GAP);
      expect(q.prompt.toLowerCase()).not.toContain(q.answer);
      expect(q.options).toContain(q.answer);
    }
    for (const q of qs) expect(q.options).toHaveLength(4);
  });
});

describe('picture words', () => {
  it('returns words with pictures, preferring saved words and using the challenge sentence', async () => {
    const { token } = await registerUser();
    const saved = await request(app)
      .post('/api/words')
      .set(bearer(token))
      .send({ english: 'apple', sinhala: 'ඇපල්' });
    const res = await request(app).get('/api/dictionary/picture-words?count=8').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.words).toHaveLength(8);
    const names = res.body.words.map((w: { english: string }) => w.english);
    expect(new Set(names).size).toBe(8);
    for (const w of res.body.words) expect(w.imageUrl).toBeTruthy();
    const apple = res.body.words.find((w: { english: string }) => w.english === 'apple');
    expect(apple.wordId).toBe(saved.body.word.id);
    expect(apple.sentence).toBe('I eat an apple.');
  });

  it('requires login and validates count', async () => {
    expect((await request(app).get('/api/dictionary/picture-words')).status).toBe(401);
    const { token } = await registerUser();
    const tooMany = await request(app)
      .get('/api/dictionary/picture-words?count=99')
      .set(bearer(token));
    expect(tooMany.status).toBe(400);
  });

  it('picture results update word strength and are saved to history', async () => {
    const { token } = await registerUser();
    const w = await request(app)
      .post('/api/words')
      .set(bearer(token))
      .send({ english: 'apple', sinhala: 'ඇපල්' });
    const post = (correct: boolean) =>
      request(app)
        .post('/api/results')
        .set(bearer(token))
        .send({
          kind: 'vocab',
          title: 'Picture words',
          answers: [
            {
              wordId: w.body.word.id,
              prompt: '🍎',
              response: correct ? 'apple' : 'aple',
              correctAnswer: 'apple',
              correct,
            },
            {
              wordId: 'dictionary',
              prompt: '🏠',
              response: 'house',
              correctAnswer: 'house',
              correct: true,
            },
          ],
        });
    expect((await post(true)).status).toBe(200);
    const one = await request(app).get('/api/words').set(bearer(token));
    expect(one.body.words[0].strength).toBe(1);
    await post(false);
    const after = (await request(app).get('/api/words').set(bearer(token))).body.words[0];
    expect(after.strength).toBe(0);
    expect(after.needsReview).toBe(true);
    const hist = await request(app).get('/api/history').set(bearer(token));
    expect(hist.body.items[0].title).toBe('Picture words');
  });
});

describe('public home endpoints', () => {
  it('serves a sample of 3 picture words without login', async () => {
    const res = await request(app).get('/api/public/sample');
    expect(res.status).toBe(200);
    expect(res.body.words).toHaveLength(3);
    for (const w of res.body.words) {
      expect(w).toMatchObject({ english: expect.any(String), imageUrl: expect.any(String) });
    }
  });

  it('reports real counts', async () => {
    const res = await request(app).get('/api/public/stats');
    expect(res.body.words).toBe(dictionarySeed.length);
    expect(res.body.sentences).toBe(dictionarySeed.length * 2);
    expect(res.body.lessons).toBe(9);
    expect(res.body.questionTypes).toBeGreaterThanOrEqual(8); // 6 vocab formats + mc, fill, tf, order
  });
});
