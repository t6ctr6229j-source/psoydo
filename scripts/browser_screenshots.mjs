import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:8080';
const executablePath = process.env.CHROME;
if (!executablePath) throw new Error('CHROME executable path is required');

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

const captures = [
  ['home-desktop', '/de/', { width: 1440, height: 900 }],
  ['home-mobile', '/de/', { width: 390, height: 844 }],
  ['product-desktop', '/de/produkt.html', { width: 1440, height: 900 }],
  ['technology-desktop', '/de/technologie.html', { width: 1440, height: 900 }],
  ['architecture-desktop', '/de/architektur.html', { width: 1440, height: 900 }],
  ['usecases-desktop', '/de/anwendungsfaelle.html', { width: 1440, height: 900 }],
  ['security-desktop', '/de/sicherheit.html', { width: 1440, height: 900 }],
  ['pricing-desktop', '/de/preise.html', { width: 1440, height: 900 }]
];

for (const [name, path, viewport] of captures) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const join = path.includes('?') ? '&' : '?';
  await page.goto(base + path + join + 'qa=fullpage', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelectorAll('img.brand-wordmark, img.provider-logo, .real-product-shot img')
      .forEach(img => { img.loading = 'eager'; });
  });
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('img.brand-wordmark, img.provider-logo, .real-product-shot img'))
      .every(img => img.complete)
  );
  const brokenImages = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img.brand-wordmark, img.provider-logo, .real-product-shot img'))
      .filter(img => img.naturalWidth === 0)
      .map(img => img.getAttribute('src'))
  );
  if (brokenImages.length) {
    throw new Error(name + ': broken brand/product image(s): ' + brokenImages.join(', '));
  }
  await page.screenshot({
    path: '/tmp/psoydo-browser-qa/' + name + '.png',
    fullPage: true,
    animations: 'disabled'
  });
  await context.close();
}

// Mobile motion regression: forced motion must work even when the OS requests reduced motion.
// The current homepage uses the in-place pseudonymization demo as its primary motion proof.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/de/?motion=1', { waitUntil: 'networkidle' });

  const heroState = await page.evaluate(() => {
    const root = document.documentElement;
    const hero = document.querySelector('.home2-hero');
    const headline = hero?.querySelector('h1');
    const pilot = document.querySelector('a[href="#register"]');
    return {
      forced: root.classList.contains('motion-forced'),
      ready: root.classList.contains('motion-ready'),
      heroDisplay: hero ? getComputedStyle(hero).display : 'missing',
      headlineOpacity: headline ? Number(getComputedStyle(headline).opacity) : 0,
      pilotLabel: pilot?.textContent?.trim() || ''
    };
  });

  if (!heroState.forced || !heroState.ready || heroState.heroDisplay === 'none' || heroState.headlineOpacity < 0.9) {
    throw new Error('Customer-first mobile hero is not reliably visible under forced motion');
  }
  if (!heroState.pilotLabel.includes('Pilot starten')) {
    throw new Error('Primary mobile CTA is not the pilot offer');
  }

  const demo = page.locator('[data-transform-demo]');
  await demo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1250);

  const motionState = await page.evaluate(() => {
    const demo = document.querySelector('[data-transform-demo]');
    const scan = document.querySelector('.transform-scan');
    const values = Array.from(document.querySelectorAll('[data-transform-demo] .transform-value'));
    const scanStyle = scan ? getComputedStyle(scan) : null;
    return {
      demoState: demo?.getAttribute('data-state') || 'missing',
      scanAnimation: scanStyle?.animationName || 'missing',
      scanDuration: scanStyle?.animationDuration || '0s',
      scanIterations: scanStyle?.animationIterationCount || '0',
      minimumValueOpacity: values.length ? Math.min(...values.map(el => Number(getComputedStyle(el).opacity))) : 0
    };
  });

  console.log('forced mobile homepage motion', { heroState, motionState });
  if (motionState.demoState !== 'processing') {
    throw new Error('Pseudonymization demo did not enter processing state on mobile');
  }
  if (motionState.scanAnimation !== 'transformScan' || parseFloat(motionState.scanDuration) < 2) {
    throw new Error('Forced mobile pseudonymization scan is not visibly animating');
  }
  if (motionState.minimumValueOpacity < 0.7) {
    throw new Error('Homepage motion is hiding record content');
  }

  await page.screenshot({
    path: '/tmp/psoydo-browser-qa/home-mobile-motion-forced.png',
    fullPage: false
  });
  await context.close();
}

// In-place pseudonymization regression: the same record must transform while context remains unchanged.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base + '/de/?motion=1', { waitUntil: 'networkidle' });
  await page.locator('[data-transform-demo]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);

  const before = await page.evaluate(() => {
    const demo = document.querySelector('[data-transform-demo]');
    const values = Array.from(demo?.querySelectorAll('[data-original][data-safe]') || []);
    const stable = Array.from(demo?.querySelectorAll('.transform-row.stable .transform-value') || []);
    return {
      exists: !!demo,
      state: demo?.getAttribute('data-state'),
      values: values.map(el => el.textContent),
      nodeCount: values.length,
      stable: stable.map(el => el.textContent)
    };
  });

  if (!before.exists || before.nodeCount !== 3) {
    throw new Error('In-place pseudonymization demo is missing or incomplete');
  }
  if (before.values.join('|') !== 'Anna Weber|anna.weber@klinik.de|48291') {
    throw new Error('Pseudonymization demo does not start with the expected original values');
  }
  if (before.stable.join('|') !== 'Radiologie|Gerätefreigabe') {
    throw new Error('Pseudonymization demo context fields are incorrect before transformation');
  }

  await page.waitForTimeout(3900);

  const after = await page.evaluate(() => {
    const demo = document.querySelector('[data-transform-demo]');
    const values = Array.from(demo?.querySelectorAll('[data-original][data-safe]') || []);
    const stable = Array.from(demo?.querySelectorAll('.transform-row.stable .transform-value') || []);
    const counter = demo?.querySelector('[data-transform-counter]');
    const status = demo?.querySelector('[data-transform-status]');
    return {
      state: demo?.getAttribute('data-state'),
      values: values.map(el => el.textContent),
      nodeCount: values.length,
      stable: stable.map(el => el.textContent),
      counter: counter?.textContent,
      status: status?.textContent
    };
  });

  console.log('in-place pseudonymization', { before, after });
  if (after.nodeCount !== before.nodeCount) {
    throw new Error('Pseudonymization demo replaced the record instead of transforming it in place');
  }
  if (after.values.join('|') !== 'PERSON_041|MAIL_018|REF_7Q2M9') {
    throw new Error('Pseudonymization demo did not reach the expected pseudonymized values');
  }
  if (after.stable.join('|') !== before.stable.join('|')) {
    throw new Error('Pseudonymization demo changed fields that should remain context');
  }
  if (after.state !== 'safe' || after.counter !== '3' || after.status !== 'PSEUDONYMISIERT') {
    throw new Error('Pseudonymization demo did not reach the expected final state');
  }

  const demo = page.locator('[data-transform-demo]');
  await demo.screenshot({
    path: '/tmp/psoydo-browser-qa/pseudonymization-demo-safe.png'
  });
  await context.close();
}

await browser.close();
