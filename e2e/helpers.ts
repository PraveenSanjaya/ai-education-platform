import { expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';

let counter = 0;
export const uniqueEmail = (tag: string) => `${tag}-${Date.now()}-${counter++}@example.com`;

export const slug = (info: TestInfo) =>
  info.project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-$/, '');

/** Register a fresh learner and pick a challenge. */
export async function registerAndChoose(page: Page, level: 'Easy' | 'Hard' = 'Easy') {
  await page.goto('/register');
  await page.getByLabel('Name').fill('Test Learner');
  await page.getByLabel('Email').fill(uniqueEmail('learner'));
  await page.getByLabel(/^Password/).fill('Passw0rd!long');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('heading', { name: 'Choose your challenge' })).toBeVisible();
  await page.getByRole('button', { name: new RegExp(`(Choose|Continue with) ${level}`) }).click();
  await expect(page.getByRole('link', { name: new RegExp(`Challenge: ${level}`) })).toBeVisible();
}

export async function addWord(page: Page, english: string) {
  await page.goto('/words');
  await page.getByLabel('English word').fill(english);
  const si = page.getByLabel(/sinhala/i).first();
  await expect(si).not.toHaveValue('', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Add word' }).click();
  await expect(page.getByRole('list').getByText(english).first()).toBeVisible();
}

/** Answer whatever question is on screen, then move on, until `done` is visible. */
export async function answerUntil(page: Page, done: RegExp, maxSteps = 60) {
  for (let i = 0; i < maxSteps; i++) {
    if (
      await page
        .getByText(done)
        .first()
        .isVisible()
        .catch(() => false)
    )
      return;
    const typed = page.getByLabel(/your answer|type the english word/i);
    if (await typed.isVisible().catch(() => false)) {
      if (await typed.isEnabled()) {
        await typed.fill('x');
        await typed.press('Enter');
      }
    } else {
      const choice = page.locator('main ul button:not([disabled])').first();
      if (await choice.isVisible().catch(() => false)) await choice.click();
    }
    const next = page.getByRole('button', { name: /^(Next|Finish)$/ });
    if (await next.isVisible().catch(() => false)) await next.click();
    else await page.waitForTimeout(100);
  }
  throw new Error(`never reached ${done}`);
}

/** Layout checks that matter on a phone. Returns a list of problems (empty means fine). */
export async function layoutProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const problems: string[] = [];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const de = document.documentElement;
    if (de.scrollWidth > vw + 1) problems.push(`horizontal scroll: ${de.scrollWidth} > ${vw}`);

    const bar = document.querySelector('nav[aria-label="Main (phone)"]');
    const barShown = !!bar && bar.getBoundingClientRect().width > 0;
    if (bar && barShown) {
      const b = bar.getBoundingClientRect().bottom;
      if (b > vh + 0.5) problems.push(`tab bar bottom ${b} is below viewport ${vh}`);
    }

    const labelOf = (el: Element) =>
      (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30);
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const targets = [
      ...document.querySelectorAll('a[href], button, select, input:not([type=hidden])'),
    ].filter((el) => visible(el) && !el.closest('.sr-only'));

    for (const el of targets) {
      const r = el.getBoundingClientRect();
      // Links inside a sentence are exempt from the size rule (WCAG 2.5.8).
      const inSentence = el.tagName === 'A' && !!el.closest('p');
      if (inSentence) continue;
      if (r.width < 43.5 || r.height < 43.5) {
        problems.push(
          `small target ${Math.round(r.width)}x${Math.round(r.height)}: "${labelOf(el)}"`,
        );
      }
    }

    // Scrolled to the very bottom, nothing may sit behind the tab bar.
    window.scrollTo(0, document.body.scrollHeight);
    if (bar && barShown) {
      const top = bar.getBoundingClientRect().top;
      for (const el of targets) {
        if (bar.contains(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom > top + 0.5 && r.top < vh)
          problems.push(`covered by tab bar: "${labelOf(el)}"`);
      }
    }
    window.scrollTo(0, 0);
    return problems;
  });
}
