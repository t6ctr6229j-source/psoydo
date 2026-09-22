import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

// Serve the real error document at missing nested URLs, as GitHub Pages does.
// Requests are fulfilled locally: this regression never depends on DNS or hosting.
export async function checkErrorPage(browser) {
  const html = await readFile(new URL('404.html', root), 'utf8');
  for (const [origin, prefix] of [
    ['https://t6ctr6229j-source.github.io', '/psoydo_website/'],
    ['https://psoydo.com', '/'],
  ]) {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const failed = [];
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin || !url.pathname.startsWith(prefix)) {
          failed.push(url.href);
          return route.abort();
        }
        const relative = url.pathname.slice(prefix.length);
        if (relative === 'de/missing/deep/page.html') {
          return route.fulfill({ status: 404, contentType: 'text/html', body: html });
        }
        try {
          await route.fulfill({ path: fileURLToPath(new URL(relative.endsWith('/') ? relative + 'index.html' : relative || 'index.html', root)) });
        } catch {
          failed.push(url.href);
          await route.abort();
        }
      });
      const response = await page.goto(origin + prefix + 'de/missing/deep/page.html');
      assert.equal(response.status(), 404);
      await page.locator('.error-logo img').evaluate(img => img.decode());
      assert.deepEqual(failed, [], '404 resources must resolve from the site root');
      assert.equal(await page.locator('.error-logo').evaluate(a => a.href), origin + prefix + 'de/');
      assert.equal(await page.locator('.button-primary').evaluate(a => a.href), origin + prefix + 'de/');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('.skip').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'main');
      await page.locator('.button-primary').click();
      await page.waitForURL(origin + prefix + 'de/');
      console.log('404 paths passed:', origin + prefix, width);
      await context.close();
    }
  }
}
