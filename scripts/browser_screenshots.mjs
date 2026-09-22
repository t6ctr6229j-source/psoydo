import { chromium } from 'playwright';
import { checkErrorPage } from './check_error_page.mjs';
import { checkMeasurement } from './check_measurement.mjs';
import { checkRegistration } from './check_registration.mjs';

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
  ['product-mobile', '/de/produkt.html', { width: 390, height: 844 }],
  ['technology-desktop', '/de/technologie.html', { width: 1440, height: 900 }],
  ['technology-mobile', '/de/technologie.html', { width: 390, height: 844 }],
  ['architecture-desktop', '/de/architektur.html', { width: 1440, height: 900 }],
  ['architecture-mobile', '/de/architektur.html', { width: 390, height: 844 }],
  ['usecases-desktop', '/de/anwendungsfaelle.html', { width: 1440, height: 900 }],
  ['usecases-mobile', '/de/anwendungsfaelle.html', { width: 390, height: 844 }],
  ['security-desktop', '/de/sicherheit.html', { width: 1440, height: 900 }],
  ['security-mobile', '/de/sicherheit.html', { width: 390, height: 844 }],
  ['pricing-desktop', '/de/preise.html', { width: 1440, height: 900 }],
  ['pricing-mobile', '/de/preise.html', { width: 390, height: 844 }],
  ['imprint-desktop', '/de/impressum.html', { width: 1440, height: 900 }],
  ['imprint-mobile', '/de/impressum.html', { width: 390, height: 844 }],
  ['privacy-desktop', '/de/datenschutz.html', { width: 1440, height: 900 }],
  ['privacy-mobile', '/de/datenschutz.html', { width: 390, height: 844 }]
];

for (const slug of ["insights", "ki-pseudonymisierung", "anonymisierung-vs-pseudonymisierung", "personenbezogene-daten-ki", "geschaeftsgeheimnisse-ki", "ki-on-premises-private-cloud", "ki-vertragsanalyse", "ki-support-tickets", "ki-log-analyse"]) {
  captures.push([slug + '-desktop', '/de/' + slug + '.html', {width:1440,height:900}]);
  captures.push([slug + '-mobile', '/de/' + slug + '.html', {width:390,height:844}]);
}

for (const [name, path, viewport] of captures) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const join = path.includes('?') ? '&' : '?';
  await page.goto(base + path + join + 'qa=fullpage', { waitUntil: 'networkidle' });
  const navState = await page.evaluate(() => ({
    desktop: Array.from(document.querySelectorAll('.desktop-nav > a')).map(a => a.textContent.trim()),
    mobile: Array.from(document.querySelectorAll('#mobile-menu > a')).map(a => a.textContent.trim())
  }));
  const expectedDesktop = ['Produkt', 'Use Cases', 'Sicherheit', 'Preise', 'Insights'];
  const expectedMobile = ['Produkt', 'Use Cases', 'Sicherheit', 'Preise', 'Insights', 'Pilot starten'];
  if (JSON.stringify(navState.desktop) !== JSON.stringify(expectedDesktop)) {
    throw new Error(name + ': desktop navigation is inconsistent: ' + JSON.stringify(navState.desktop));
  }
  if (JSON.stringify(navState.mobile) !== JSON.stringify(expectedMobile)) {
    throw new Error(name + ': mobile navigation is inconsistent: ' + JSON.stringify(navState.mobile));
  }
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)) {
    throw new Error(name + ': horizontal overflow');
  }
  if (path === '/de/ki-pseudonymisierung.html') {
    await page.getByRole('link', {name: 'Praxischeck', exact: true}).click();
    const top = await page.locator('#praxischeck').evaluate(el => el.getBoundingClientRect().top);
    if (top < 75 || top > 160) throw new Error(name + ': contents target hidden by header');
    await page.evaluate(() => scrollTo(0, 0));
  }
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


// Section rhythm regression: every public page must work on desktop and mobile,
 // must not overflow horizontally, must keep usable vertical breathing room,
 // and consecutive sections must not resolve to the same background.
{
  const rhythmPages = [
    ['/de/', 'home'],
    ['/de/produkt.html', 'product'],
    ['/de/technologie.html', 'technology'],
    ['/de/architektur.html', 'architecture'],
    ['/de/anwendungsfaelle.html', 'usecases'],
    ['/de/sicherheit.html', 'security'],
    ['/de/preise.html', 'pricing'],
    ['/de/impressum.html', 'imprint'],
    ['/de/datenschutz.html', 'privacy']
  ];
  const rhythmViewports = [
    ['desktop', { width: 1440, height: 900 }, 80],
    ['mobile', { width: 390, height: 844 }, 60]
  ];

  for (const [mode, viewport, spacingFloor] of rhythmViewports) {
    for (const [path, pageName] of rhythmPages) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
      const page = await context.newPage();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(base + path + (path.includes('?') ? '&' : '?') + 'qa=rhythm', { waitUntil: 'networkidle' });

      const rhythm = await page.evaluate(() => {
        function effectiveBackground(element) {
          let node = element;
          while (node) {
            const value = getComputedStyle(node).backgroundColor;
            if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') return value;
            node = node.parentElement;
          }
          return 'transparent';
        }

        const sections = Array.from(document.querySelectorAll('main > section')).map((section, index) => {
          const style = getComputedStyle(section);
          return {
            index: index + 1,
            cls: section.className || '(no-class)',
            background: effectiveBackground(section),
            paddingTop: parseFloat(style.paddingTop) || 0,
            paddingBottom: parseFloat(style.paddingBottom) || 0
          };
        });

        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          sections
        };
      });

      if (rhythm.scrollWidth > rhythm.clientWidth + 2) {
        throw new Error(pageName + ' ' + mode + ': horizontal overflow ' + rhythm.scrollWidth + ' > ' + rhythm.clientWidth);
      }

      for (let i = 1; i < rhythm.sections.length; i += 1) {
        const previous = rhythm.sections[i - 1];
        const current = rhythm.sections[i];
        if (previous.background.replace(/\s+/g, '') === current.background.replace(/\s+/g, '')) {
          throw new Error(
            pageName + ' ' + mode + ': consecutive sections share background ' +
            previous.cls + ' -> ' + current.cls + ' (' + current.background + ')'
          );
        }
      }

      const spacingFailures = rhythm.sections.filter(section => {
        if (/hero|proofbar/.test(section.cls)) return false;
        return section.paddingTop < spacingFloor || section.paddingBottom < spacingFloor;
      });
      if (spacingFailures.length) {
        throw new Error(
          pageName + ' ' + mode + ': section spacing below floor ' +
          JSON.stringify(spacingFailures)
        );
      }

      console.log('section rhythm', pageName, mode, {
        sections: rhythm.sections.length,
        overflow: false,
        backgroundsUnique: true,
        spacingFloor
      });
      await context.close();
    }
  }
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

await checkErrorPage(browser);
await checkRegistration(browser);
await checkMeasurement(browser);
await browser.close();
