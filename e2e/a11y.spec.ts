import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { addWord, registerAndChoose } from './helpers';

async function audit(page: Page, label: string) {
  await page.locator('main h1, main h2').first().waitFor();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const summary = bad.map(
    (v) =>
      `${label}: ${v.id} (${v.impact}) ${v.nodes
        .map((n) => n.target.join(' '))
        .slice(0, 3)
        .join(' | ')}`,
  );
  expect(summary, `axe on ${label}`).toEqual([]);
}

test('no serious or critical axe issues on the main screens', async ({ page }) => {
  await page.goto('/');
  await audit(page, 'Home (signed out)');

  await registerAndChoose(page, 'Easy');
  await page.goto('/');
  await audit(page, 'Home');

  for (const w of ['apple', 'book', 'water']) await addWord(page, w);
  await audit(page, 'Words');

  await page.goto('/grammar');
  await audit(page, 'Grammar path');
  await page
    .getByRole('link', { name: /^(Start|Open)$/ })
    .first()
    .click();
  await audit(page, 'Grammar lesson');

  await page.goto('/vocab-tests');
  await page.getByRole('button', { name: 'Start 10 questions' }).first().click();
  await page.locator('main ul button, main input[aria-label="Your answer"]').first().waitFor();
  await audit(page, 'Test question');

  await page.goto('/history');
  await audit(page, 'History');
  await page.goto('/profile');
  await audit(page, 'Profile');
});

test('dark theme has no serious or critical axe issues on Home and Words', async ({ page }) => {
  await registerAndChoose(page, 'Easy');
  await page.getByRole('button', { name: /Switch to dark theme/ }).click();
  await page.goto('/words');
  await audit(page, 'Words (dark)');
  await page.goto('/');
  await audit(page, 'Home (dark)');
});

test('every icon-only button has an accessible name', async ({ page }) => {
  await registerAndChoose(page, 'Easy');
  await addWord(page, 'apple');
  const nameless = await page.evaluate(() =>
    [...document.querySelectorAll('button, a[href]')]
      .filter((el) => {
        const name = (el.getAttribute('aria-label') || el.textContent || '').trim();
        return !name && !el.getAttribute('aria-labelledby');
      })
      .map((el) => el.outerHTML.slice(0, 80)),
  );
  expect(nameless).toEqual([]);
});
