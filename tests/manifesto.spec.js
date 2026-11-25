import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { marked } from 'marked';

const sourcePath = new URL('../manifiesto_ingenieria_software_era_ia.md', import.meta.url);

test('el HTML contiene todo el manifiesto sin alterar textos', async ({ page, request }) => {
  const markdown = await readFile(sourcePath, 'utf8');
  await page.goto('./');
  const expected = await page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return [...doc.querySelectorAll('h2, h3, p, li')].map((node) => node.textContent.replace(/\s+/g, ' ').trim());
  }, marked(markdown));
  const actual = await page.locator('#manifesto-content').evaluate((element) =>
    [...element.querySelectorAll('h2, h3, p, li')].map((node) => {
      // Visible-only decorations (aria-hidden) are not part of the manifesto text.
      const copy = node.cloneNode(true);
      copy.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
      return copy.textContent.replace(/\s+/g, ' ').trim();
    }));
  // The layout regroups blocks (quotes first, paired lists), so compare the full set of texts.
  expect([...actual].sort()).toEqual([...expected].sort());
  const headings = await page.locator('#manifesto-content h2').allTextContents();
  expect(headings.map((text) => text.trim())).toEqual(marked.lexer(markdown).filter((t) => t.type === 'heading' && t.depth === 2).map((t) => t.text));
  const download = await request.get('./manifiesto_ingenieria_software_era_ia.md');
  expect(await download.text()).toBe(markdown);
  await expect(page.locator('.principle-card')).toHaveCount(12);
  await expect(page.locator('.value-card')).toHaveCount(7);
  await expect(page.locator('.commitment-grid li')).toHaveCount(12);
  await expect(page.locator('.principle-evidence')).toHaveCount(0);
});

test('portada responsive, sin desbordamientos ni errores JavaScript', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.hero-toc a').first()).toBeVisible();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    // Layout settles once the media query change has been handled (e.g. unpinning principles).
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize(testInfo.project.use.viewport);
  await page.screenshot({ path: testInfo.outputPath('portada.png'), fullPage: false });
  expect(errors).toEqual([]);
});

test('índice accesible, enlaces y progreso', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Índice', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('link', { name: /Principios/ }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/#principios$/);
  await expect(page.locator('#principios-title')).toBeFocused();
  await expect.poll(async () => Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Índice', exact: true }).click();
  await expect(dialog.getByRole('link', { name: /Principios/ })).toHaveAttribute('aria-current', 'location');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Índice', exact: true })).toBeFocused();
});

test('enlaces profundos e historial', async ({ page }) => {
  await page.goto('./#senales-de-alarma');
  await expect(page.locator('#senales-de-alarma-title')).toBeInViewport();
  await page.getByRole('button', { name: 'Índice', exact: true }).click();
  await page.getByRole('dialog').getByRole('link', { name: /Nuestra visión/ }).click();
  await expect(page.locator('#nuestra-vision-title')).toBeFocused();
  await expect(page.locator('#nuestra-vision-title')).toBeInViewport();
  await page.goBack();
  await expect(page.locator('#senales-de-alarma-title')).toBeInViewport();
});

test('sin movimiento y sin JavaScript sigue siendo legible y navegable', async ({ browser, page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  expect(await page.locator('html').getAttribute('class') ?? '').not.toContain('lenis');
  await expect(page.locator('.principles')).not.toHaveClass(/is-pinned/);
  await page.locator('.hero-toc a').first().click();
  await expect(page.locator('#preambulo-title')).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  if (testInfo.project.name === 'desktop') await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(page.locator('.principles')).not.toHaveClass(/is-pinned/);

  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('./');
  await staticPage.locator('.hero-toc a').first().click();
  await expect(staticPage).toHaveURL(/#preambulo$/);
  await expect(staticPage.locator('#preambulo-title')).toBeInViewport();
  await expect(staticPage.locator('.closing-quote')).toContainText('la confianza es el producto más importante');
  await context.close();
});

test('principios: pista horizontal anclada en escritorio y carrusel nativo en móvil', async ({ page }, testInfo) => {
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  const track = page.locator('.principles-track');
  if (testInfo.project.name === 'desktop') {
    await expect(page.locator('.principles')).toHaveClass(/is-pinned/);
    const top = await page.locator('.principles').evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y + 1200), top);
    await expect.poll(() => track.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41)).toBeLessThan(-600);
    await expect(page.locator('.principles')).toBeInViewport();
    const summary = page.locator('.principle-card summary').filter({ visible: true }).nth(1);
    const scrollY = await page.evaluate(() => window.scrollY);
    await summary.click();
    await expect(summary.locator('..')).toHaveAttribute('open', '');
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    await page.keyboard.press('Shift');
    await page.locator('.principle-card').last().locator('summary').focus();
    await expect(page.locator('.principle-card').last()).toBeInViewport({ ratio: .9 });
  } else {
    await expect(page.locator('.principles')).not.toHaveClass(/is-pinned/);
    await expect(track).toHaveCSS('scroll-snap-type', 'x mandatory');
    expect(await track.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  }
});

test('valores: carrusel con botones', async ({ page }) => {
  await page.goto('./');
  const track = page.locator('#values-track');
  const previous = page.getByRole('button', { name: 'Valor anterior' });
  await expect(previous).toBeDisabled();
  await page.getByRole('button', { name: 'Valor siguiente' }).click();
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
  await expect(previous).toBeEnabled();
});

test('alarmas y salud emparejadas en 10 filas', async ({ page }, testInfo) => {
  await page.goto('./');
  const bad = page.locator('.pair-bad');
  const good = page.locator('.pair-good');
  await expect(bad).toHaveCount(10);
  await expect(good).toHaveCount(10);
  await expect(page.locator('.pair-arrow')).toHaveCount(10);
  await expect(bad.first()).toContainText('integrar pull requests generadas por IA');
  await expect(good.first()).toContainText('cada cambio tenga criterios de aceptación');
  for (let i = 0; i < 10; i++) {
    const [b, g] = [await bad.nth(i).boundingBox(), await good.nth(i).boundingBox()];
    if (testInfo.project.name === 'desktop') {
      expect(Math.abs(b.y - g.y)).toBeLessThanOrEqual(1);
      expect(g.x).toBeGreaterThan(b.x + b.width);
    } else {
      expect(g.y).toBeGreaterThan(b.y + b.height);
      if (i < 9) expect((await bad.nth(i + 1).boundingBox()).y).toBeGreaterThan(g.y + g.height);
    }
  }
});

test('modo claro/oscuro: alterna, invierte bloques de contraste y persiste', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');
  const html = page.locator('html');
  const bg = (selector) => page.locator(selector).evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(html).toHaveAttribute('data-theme', 'light');
  expect(await bg('body')).toBe('rgb(243, 245, 249)');
  expect(await bg('.hero')).toBe('rgb(16, 20, 26)');
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#10141a');
  await expect.poll(() => bg('body')).toBe('rgb(16, 20, 26)');
  await expect.poll(() => bg('.hero')).toBe('rgb(243, 245, 249)');
  await expect(page.getByRole('button', { name: 'Cambiar a modo claro' })).toContainText('Claro');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Cambiar a modo claro' }).click();
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
});

test('el modo inicial sigue prefers-color-scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

for (const theme of ['light', 'dark']) {
  test(`progreso completo y criterios WCAG en modo ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const audit = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect((await audit()).violations).toEqual([]);
    await page.locator('.principle-card details').evaluateAll((list) => list.forEach((details) => { details.open = true; }));
    await page.getByRole('button', { name: 'Índice', exact: true }).click();
    expect((await audit()).violations).toEqual([]);
    await page.getByRole('dialog').getByRole('link', { name: /Principios/ }).click();
    expect((await audit()).violations).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
}

test.describe('idioma', () => {
  const enSourcePath = new URL('../manifesto_software_engineering_ai_era.md', import.meta.url);

  test('la versión inglesa contiene todo el manifiesto traducido y descarga su original', async ({ page, request }) => {
    const markdown = await readFile(enSourcePath, 'utf8');
    await page.addInitScript(() => localStorage.setItem('manifiesto-idioma', 'en'));
    await page.goto('./en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const expected = await page.evaluate((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return [...doc.querySelectorAll('h2, h3, p, li')].map((node) => node.textContent.replace(/\s+/g, ' ').trim());
    }, marked(markdown));
    const actual = await page.locator('#manifesto-content').evaluate((element) =>
      [...element.querySelectorAll('h2, h3, p, li')].map((node) => {
      // Visible-only decorations (aria-hidden) are not part of the manifesto text.
      const copy = node.cloneNode(true);
      copy.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
      return copy.textContent.replace(/\s+/g, ' ').trim();
    }));
    expect([...actual].sort()).toEqual([...expected].sort());
    await expect(page.locator('.principle-card')).toHaveCount(12);
    await expect(page.locator('.closing-stances li')).toHaveCount(4);
    await page.getByRole('button', { name: 'Index', exact: true }).click();
    const download = page.getByRole('dialog').getByRole('link', { name: /Download the original document/ });
    await expect(download).toHaveAttribute('href', '/engineering-with-judgment/manifesto_software_engineering_ai_era.md');
    expect(await (await request.get('./manifesto_software_engineering_ai_era.md')).text()).toBe(markdown);
  });

  for (const [locale, expected] of [['es-ES', 'es'], ['en-GB', 'en'], ['fr-FR', 'en']]) {
    test(`navegador en ${locale} preselecciona ${expected}`, async ({ browser }) => {
      const context = await browser.newContext({ locale });
      const page = await context.newPage();
      await page.goto('./');
      await expect(page.locator('html')).toHaveAttribute('lang', expected);
      await expect(page.locator(`.lang-switch a[data-lang="${expected}"]`)).toHaveAttribute('aria-current', 'true');
      await context.close();
    });
  }

  test('el selector cambia de idioma, conserva la sección, resalta la elección y la recuerda', async ({ page }) => {
    await page.goto('./#principios');
    await expect(page.locator('#principios-title')).toBeInViewport();
    const english = page.getByRole('link', { name: 'English' });
    await expect(english).not.toHaveAttribute('aria-current');
    await english.click();
    await expect(page).toHaveURL(/\/en\/#principles$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('link', { name: 'Español' })).not.toHaveAttribute('aria-current');
    const bg = (name) => page.getByRole('link', { name }).evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(await bg('English')).not.toBe(await bg('Español'));
    await page.goto('./');
    await expect(page).toHaveURL(/\/en\/$/);
    await page.getByRole('link', { name: 'Español' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await page.goto('./en/');
    await expect(page).toHaveURL(/127\.0\.0\.1:4173\/engineering-with-judgment\/$/);
  });
});

test.describe('firmas', () => {
  test('toolbar y portada abren el diálogo de firma accesible con la URL de GitHub', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    const dialog = page.getByRole('dialog', { name: 'Firmar el manifiesto' });
    for (const opener of [page.locator('.toolbar [data-open-sign]'), page.locator('.hero [data-open-sign]')]) {
      await opener.click();
      await expect(dialog).toBeVisible();
      await expect(page).not.toHaveURL(/#firmas$/);
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(opener).toBeFocused();
    }
    await page.locator('.hero [data-open-sign]').click();
    await dialog.getByLabel('Tu usuario de GitHub').fill('@octocat');
    const link = dialog.getByRole('link', { name: /Continuar en GitHub/ });
    const url = new URL(await link.getAttribute('href'));
    expect(url.origin + url.pathname).toBe('https://github.com/KilianJimenez/engineering-with-judgment/new/main/firmas');
    expect(url.searchParams.get('filename')).toBe('octocat.yml');
    expect(url.searchParams.get('value')).toMatch(/^github: octocat\nnombre: \nrol: \nfecha: \d{4}-\d{2}-\d{2}\n$/);
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('la sección de firmas muestra contador y avatares en ambos idiomas', async ({ page }) => {
    await page.goto('./#firmas');
    const section = page.locator('#firmas');
    await expect(section.locator('[data-signers-count]')).toHaveText(/^\d+ personas? ha(n)? firmado$/);
    const first = section.locator('.signer-grid a').first();
    await expect(first).toHaveAttribute('href', 'https://github.com/KilianJimenez');
    await expect(first).toHaveAttribute('title', 'Kilian Jiménez · Autor del manifiesto');
    await section.getByRole('button', { name: 'Firmar el manifiesto' }).click();
    await expect(page.getByRole('dialog', { name: 'Firmar el manifiesto' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en\/#firmas$/);
    await expect(page.locator('#firmas [data-signers-count]')).toHaveText(/^\d+ (person has|people have) signed$/);
  });

  test('sin JavaScript los botones de firma llevan a #firmas', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('./');
    await page.locator('.hero [data-open-sign]').click();
    await expect(page).toHaveURL(/#firmas$/);
    await expect(page.locator('#firmas-title')).toBeInViewport();
    await expect(page.locator('#firmas .sign-cta')).toHaveAttribute('href', /^https:\/\/github\.com\/KilianJimenez\/engineering-with-judgment\/new\/main\/firmas\?filename=tu-usuario\.yml/);
    await context.close();
  });
});
