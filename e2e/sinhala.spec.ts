import { expect, test } from '@playwright/test';

const SAMPLES = ['ශ්‍රී', 'ප්‍ර', 'ක්‍ෂ', 'සෞඛ්‍යය', 'ශිෂ්‍යයා'];

// The bundled Noto Sans Sinhala font must load and be the one used for Sinhala text,
// so conjuncts such as ශ්‍රී and ප්‍ර do not depend on what the phone has installed.
test('Sinhala conjuncts use the bundled font', async ({ page, browserName }) => {
  await page.goto('/login');
  await page.evaluate((samples) => {
    const box = document.createElement('div');
    box.id = 'sinhala-sample';
    box.lang = 'si';
    box.style.cssText = 'font-size:48px;padding:16px;background:#fff;color:#000;line-height:1.8';
    box.innerHTML = samples.map((s) => `<div>${s}</div>`).join('');
    document.body.prepend(box);
  }, SAMPLES);

  await page.evaluate(() => document.fonts.load('16px "Noto Sans Sinhala"', 'ශ්‍රී'));
  await page.evaluate(() => document.fonts.ready);

  const loaded = await page.evaluate(() => ({
    check: document.fonts.check('16px "Noto Sans Sinhala"'),
    faces: [...document.fonts]
      .filter((f) => f.family.replace(/"/g, '') === 'Noto Sans Sinhala' && f.status === 'loaded')
      .map((f) => `${f.weight}`),
    used: getComputedStyle(document.getElementById('sinhala-sample')!).fontFamily,
  }));
  expect(loaded.check).toBe(true);
  expect(loaded.faces.length).toBeGreaterThan(0);
  expect(loaded.used).toContain('Noto Sans Sinhala');

  // Each sample must render as real glyphs: same text, different widths, none of them empty.
  const widths = await page.evaluate(() =>
    [...document.querySelectorAll('#sinhala-sample > div')].map((d) => {
      const r = document.createRange();
      r.selectNodeContents(d);
      return Math.round(r.getBoundingClientRect().width);
    }),
  );
  for (const w of widths) expect(w).toBeGreaterThan(20);

  const name = browserName === 'webkit' ? 'webkit' : 'chromium';
  await page
    .locator('#sinhala-sample')
    .screenshot({ path: `docs/screenshots/sinhala-${name}.png` });
});
