import { expect, test } from '@playwright/test';
import { layoutProblems, registerAndChoose } from './helpers';

// No sideways scrolling at common phone widths, signed out and signed in.
for (const width of [360, 375, 414]) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ['/', '/login', '/register', '/challenge']) {
      await page.goto(path);
      const extra = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(extra, `${path} at ${width}`).toBeLessThanOrEqual(1);
    }
    await registerAndChoose(page, 'Hard');
    for (const path of ['/', '/words', '/grammar', '/tests', '/history', '/profile']) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      const problems = await layoutProblems(page);
      expect(
        problems.filter((p) => p.startsWith('horizontal')),
        `${path} at ${width}`,
      ).toEqual([]);
    }
  });
}
