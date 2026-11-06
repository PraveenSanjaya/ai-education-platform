import { expect, test } from '@playwright/test';
import { addWord, answerUntil, layoutProblems, registerAndChoose, slug } from './helpers';

// Full learner journey on an emulated phone, with layout checks at every stop.
test('learner journey on a phone', async ({ page }, info) => {
  const tag = slug(info);
  const problems: string[] = [];
  const shot = async (name: string) => {
    await page.locator('main h1, main h2').first().waitFor();
    await page.screenshot({ path: `docs/screenshots/mobile-${tag}-${name}.png` });
    for (const p of await layoutProblems(page)) problems.push(`[${name}] ${p}`);
  };
  const consoleErrors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  await page.goto('/');
  await shot('home');

  await registerAndChoose(page, 'Easy');
  await shot('home-after-register');

  for (const w of ['apple', 'book', 'water', 'house', 'mother']) await addWord(page, w);
  await shot('words');

  await page.goto('/tests');
  await shot('tests');

  await page.goto('/play');
  await page.getByRole('button', { name: 'Start 10 words' }).click();
  await expect(page.getByRole('img', { name: 'Picture clue' })).toBeVisible();
  await shot('picture-game');
  await answerUntil(page, /^Score:/);
  await shot('picture-score');

  await page.goto('/vocab-tests');
  await page.getByRole('button', { name: 'Start 10 questions' }).first().click();
  await expect(
    page.locator('main ul button, main input[aria-label="Your answer"]').first(),
  ).toBeVisible();
  await shot('vocab-question');
  await answerUntil(page, /^Score:/);
  await shot('vocab-score');

  await page.goto('/grammar');
  await shot('grammar');
  await page
    .getByRole('link', { name: /^(Start|Open)$/ })
    .first()
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await shot('grammar-lesson');

  await page.goto('/history');
  await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
  await expect(page.getByText(/Picture words/).first()).toBeVisible();
  await shot('history');

  await page.goto('/profile');
  await shot('profile');

  expect(consoleErrors.filter((e) => !/favicon/i.test(e))).toEqual([]);
  expect(problems).toEqual([]);
});
