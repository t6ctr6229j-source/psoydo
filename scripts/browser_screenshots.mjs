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
  await page.screenshot({
    path: '/tmp/psoydo-browser-qa/' + name + '.png',
    fullPage: true,
    animations: 'disabled'
  });
  await context.close();
}

// Motion regression: force motion even when the OS requests reduced motion.
// This catches the iOS failure mode where JS enabled motion but CSS still disabled it.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/de/?motion=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(650);

  const state = await page.evaluate(() => {
    const root = document.documentElement;
    const eyebrow = document.querySelector('.v3-eyebrow i');
    const core = document.querySelector('.core-orb');
    const membrane = document.querySelector('.membrane-stage');
    const membraneCore = document.querySelector('.membrane-core');
    const rows = Array.from(document.querySelectorAll('.process-row,.impact-case,.control-layer'));
    return {
      forced: root.classList.contains('motion-forced'),
      ready: root.classList.contains('motion-ready'),
      membraneActive: membrane && membrane.classList.contains('motion-active'),
      eyebrowAnimation: eyebrow ? getComputedStyle(eyebrow).animationName : 'missing',
      eyebrowDuration: eyebrow ? getComputedStyle(eyebrow).animationDuration : '0s',
      eyebrowIterations: eyebrow ? getComputedStyle(eyebrow).animationIterationCount : '0',
      coreAnimation: core ? getComputedStyle(core).animationName : 'missing',
      coreDuration: core ? getComputedStyle(core).animationDuration : '0s',
      coreIterations: core ? getComputedStyle(core).animationIterationCount : '0',
      packetDisplay: membraneCore ? getComputedStyle(membraneCore, '::after').display : 'missing',
      packetAnimation: membraneCore ? getComputedStyle(membraneCore, '::after').animationName : 'missing',
      packetDuration: membraneCore ? getComputedStyle(membraneCore, '::after').animationDuration : '0s',
      packetIterations: membraneCore ? getComputedStyle(membraneCore, '::after').animationIterationCount : '0',
      minimumContentOpacity: rows.length ? Math.min(...rows.map(el => Number(getComputedStyle(el).opacity))) : 1
    };
  });

  console.log('forced mobile motion', state);
  if (!state.forced || !state.ready || !state.membraneActive) {
    throw new Error('Forced mobile motion classes are not active');
  }
  if (state.eyebrowAnimation === 'none' || state.coreAnimation === 'none') {
    throw new Error('Forced mobile hero animations are disabled');
  }
  if (parseFloat(state.eyebrowDuration) < 1 || parseFloat(state.coreDuration) < 1 ||
      state.eyebrowIterations !== 'infinite' || state.coreIterations !== 'infinite') {
    throw new Error('Forced mobile hero animations are effectively reduced or one-shot');
  }
  if (state.packetDisplay === 'none' || state.packetAnimation === 'none') {
    throw new Error('Forced mobile boundary packet is not animating');
  }
  if (parseFloat(state.packetDuration) < 1 || state.packetIterations !== 'infinite') {
    throw new Error('Forced mobile boundary packet is effectively reduced or one-shot');
  }
  if (state.minimumContentOpacity < 0.7) {
    throw new Error('Motion system is hiding page content');
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
