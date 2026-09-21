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
    document.querySelectorAll('img.brand-wordmark, img.provider-logo, .real-product-shot img, .home-proof-gallery img')
      .forEach(img => { img.loading = 'eager'; });
  });
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('img.brand-wordmark, img.provider-logo, .real-product-shot img, .home-proof-gallery img'))
      .every(img => img.complete)
  );
  const brokenImages = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img.brand-wordmark, img.provider-logo, .real-product-shot img, .home-proof-gallery img'))
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


// Public AI decision quiz regression: answer all five scenarios and reach the in-page result.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  await page.goto(base + '/de/?qa=quiz', { waitUntil: 'networkidle' });

  const quiz = page.locator('[data-ai-quiz]');
  await quiz.scrollIntoViewIfNeeded();

  const expectedAnswers = ['allow', 'protect', 'block', 'protect', 'protect'];
  for (let i = 0; i < expectedAnswers.length; i += 1) {
    const count = await page.locator('[data-ai-quiz-count]').textContent();
    if (!count || !count.includes(String(i + 1).padStart(2, '0'))) {
      throw new Error('AI quiz did not render expected question ' + (i + 1));
    }

    await page.locator('[data-ai-answer="' + expectedAnswers[i] + '"]').click();
    const feedback = page.locator('[data-ai-quiz-feedback]');
    await feedback.waitFor({ state: 'visible' });

    const feedbackState = await page.evaluate(() => ({
      verdict: document.querySelector('[data-ai-quiz-verdict]')?.textContent || '',
      title: document.querySelector('[data-ai-quiz-feedback-title]')?.textContent || '',
      correctVisible: !!document.querySelector('[data-ai-answer].is-correct')
    }));
    if (!feedbackState.verdict.includes('EMPFEHLUNG') || !feedbackState.title || !feedbackState.correctVisible) {
      throw new Error('AI quiz feedback is incomplete at question ' + (i + 1));
    }

    await page.locator('[data-ai-quiz-next]').click();
  }

  await page.locator('[data-ai-quiz-finish]').waitFor({ state: 'visible' });
  const finishState = await page.evaluate(() => ({
    result: document.querySelector('[data-ai-quiz-result]')?.textContent || '',
    mentionsGeschGehG: document.querySelector('[data-ai-quiz-finish]')?.textContent?.includes('GeschGehG') || false,
    transformationLink: document.querySelector('[data-ai-quiz-finish] a[href="#transformation"]')?.textContent?.trim() || ''
  }));

  console.log('public AI quiz finish', finishState);
  if (!finishState.result.includes('5 von 5') || !finishState.mentionsGeschGehG || !finishState.transformationLink) {
    throw new Error('AI quiz did not reach the expected final state');
  }

  await quiz.screenshot({
    path: '/tmp/psoydo-browser-qa/public-ai-quiz-finished.png'
  });
  await context.close();
}

// Screenshot lightbox regression: open in-page, show enlarged image, close with Escape and restore focus.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  await page.goto(base + '/de/produkt.html?qa=lightbox', { waitUntil: 'networkidle' });

  const trigger = page.locator('[data-lightbox]').first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.waitForSelector('.product-lightbox.is-open');

  const openState = await page.evaluate(() => {
    const lightbox = document.querySelector('.product-lightbox');
    const image = lightbox?.querySelector('.product-lightbox-body img');
    const close = lightbox?.querySelector('.product-lightbox-close');
    return {
      open: !!lightbox?.classList.contains('is-open'),
      ariaHidden: lightbox?.getAttribute('aria-hidden'),
      imageLoaded: !!image?.complete && Number(image?.naturalWidth || 0) > 0,
      bodyLocked: document.body.classList.contains('lightbox-open'),
      closeFocused: document.activeElement === close
    };
  });

  console.log('screenshot lightbox open', openState);
  if (!openState.open || openState.ariaHidden !== 'false' || !openState.imageLoaded || !openState.bodyLocked) {
    throw new Error('Product screenshot lightbox did not open correctly');
  }

  await page.screenshot({
    path: '/tmp/psoydo-browser-qa/product-lightbox-open.png',
    fullPage: false
  });

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.product-lightbox')?.classList.contains('is-open'));

  const closeState = await page.evaluate(() => ({
    closed: !document.querySelector('.product-lightbox')?.classList.contains('is-open'),
    bodyUnlocked: !document.body.classList.contains('lightbox-open'),
    focusReturned: document.activeElement?.matches('[data-lightbox]') || false
  }));
  console.log('screenshot lightbox close', closeState);
  if (!closeState.closed || !closeState.bodyUnlocked || !closeState.focusReturned) {
    throw new Error('Product screenshot lightbox did not close cleanly or restore focus');
  }

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
