import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);

// Exercise local UI recovery without submitting data to Typeform or Google.
export async function checkRegistration(browser) {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    let mode = 'error';
    let embeds = 0;
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'embed.typeform.com') {
        embeds++;
        if (mode === 'error') return route.abort();
        return route.fulfill({ contentType: 'text/javascript', body: `window.tf={createWidget:function(id,options){window.testWidget=options;options.container.innerHTML='<p>Testformular bereit</p>';${mode === 'ready' ? 'options.onReady();' : ''}}};` });
      }
      if (url.hostname !== 'psoydo.test') return route.abort();
      let relative = url.pathname.slice(1);
      if (relative.endsWith('/')) relative += 'index.html';
      await route.fulfill({ path: fileURLToPath(new URL(relative, root)) });
    });
    await page.addInitScript(() => localStorage.setItem('psoydo-consent-v2', 'denied'));
    await page.goto('https://psoydo.test/de/');
    assert.equal(embeds, 0, 'Typeform must wait for user action');
    await page.locator('#tf-open').click();
    await page.locator('#tf-retry').waitFor();
    assert.equal(await page.locator('#tf-retry').evaluate(e => e === document.activeElement), true);
    assert.match(await page.locator('#tf-container a').getAttribute('href'), /^mailto:info@wescaleit.com/);
    assert.equal(await page.locator('#tf-container').getAttribute('aria-busy'), null);
    await page.screenshot({ path: `/tmp/psoydo-browser-qa/registration-error-${width}.png` });
    mode = 'ready';
    await page.locator('#tf-retry').click();
    await page.waitForFunction(() => document.querySelector('#tf-container').textContent.includes('Testformular bereit'));
    assert.equal(await page.locator('#tf-container').getAttribute('aria-busy'), null);
    assert.equal(embeds, 2, 'Retry must load a fresh script');
    await page.clock.install();
    await page.clock.fastForward(16000);
    assert.equal(await page.locator('#tf-retry').count(), 0, 'A ready widget must not time out');
    await context.close();

    // A script can load successfully while its iframe never becomes ready.
    const stalled = await browser.newContext({ viewport: { width, height: 900 } });
    const stalledPage = await stalled.newPage();
    await stalledPage.route('**/*', async route => {
      const u = new URL(route.request().url());
      if (u.hostname === 'embed.typeform.com') return route.fulfill({contentType:'text/javascript', body:'window.tf={createWidget:function(id,options){window.lateReady=options.onReady;}};'});
      if (u.hostname !== 'psoydo.test') return route.abort();
      const path = u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname;
      return route.fulfill({path:fileURLToPath(new URL(path.slice(1),root))});
    });
    await stalledPage.addInitScript(() => localStorage.setItem('psoydo-consent-v2', 'denied'));
    await stalledPage.goto('https://psoydo.test/de/');
    await stalledPage.clock.install();
    await stalledPage.locator('#tf-open').click();
    await stalledPage.waitForFunction(() => typeof window.lateReady === 'function');
    await stalledPage.clock.fastForward(16000);
    await stalledPage.locator('#tf-retry').waitFor();
    await stalledPage.evaluate(() => window.lateReady());
    assert.equal(await stalledPage.locator('#tf-retry').count(), 1, 'Late callback must not erase recovery');
    assert.equal(await stalledPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await stalled.close();
    console.log('Registration recovery passed:', width);
  }
}
