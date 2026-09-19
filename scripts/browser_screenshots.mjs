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

await browser.close();
