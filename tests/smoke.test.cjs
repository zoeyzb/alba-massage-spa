const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer-core');

const root = path.resolve(__dirname, '..');
const htmlUrl = pathToFileURL(path.join(root, 'index.html')).href;
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let browser;

before(async () => {
  browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
});

after(async () => {
  if (browser) await browser.close();
});

async function openPage(width = 1280, height = 800, reducedMotion = false) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, isMobile: width < 500, deviceScaleFactor: 1 });
  if (reducedMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(htmlUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

test('hero has a real guest photo, moving silk sculpture, rising steam, and one trust strip', async () => {
  const page = await openPage();
  const layers = await page.evaluate(() => [
    '.hero-layer--background',
    '.hero-layer--subject',
    '.hero-layer--glass',
    '.golden-claw',
    '.silk-glint',
    '.stone-mist',
    '.trust-strip'
  ].map(selector => Boolean(document.querySelector(selector))));
  await page.close();
  assert.deepEqual(layers, Array(7).fill(true), 'the hero needs real photography, a moving sculptural gold claw, rising steam, and the first-screen trust strip');
});

test('hero uses real guest and hot-stone photography instead of synthetic stones', async () => {
  const page = await openPage();
  const state = await page.evaluate(() => ({
    image: document.querySelector('.hero-layer--subject').getAttribute('src'),
    fakeStones: document.querySelectorAll('.stone').length,
    trustStripCount: document.querySelectorAll('.trust-strip').length,
    trustStripImmediatelyAfterHero: document.querySelector('.hero').nextElementSibling?.classList.contains('trust-strip')
  }));
  assert.equal(state.image, 'assets/interior.jpg');
  assert.equal(await page.$eval('.stone-detail img', el => el.getAttribute('src')), 'assets/interior.jpg');
  await page.close();
  assert.equal(state.fakeStones, 0);
  assert.equal(state.trustStripCount, 1);
  assert.equal(state.trustStripImmediatelyAfterHero, true);
});

test('brand palette is emerald and champagne with no animation CDN dependency', async () => {
  const page = await openPage();
  const result = await page.evaluate(() => ({
    ink: getComputedStyle(document.documentElement).getPropertyValue('--ink').trim().toLowerCase(),
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toLowerCase(),
    remoteScripts: [...document.scripts].map(script => script.src).filter(src => src && new URL(src).protocol === 'https:')
  }));
  await page.close();
  assert.equal(result.ink, '#071c18');
  assert.equal(result.accent, '#e8a64d');
  assert.deepEqual(result.remoteScripts, [], 'the hero must not rely on a third-party animation script');
});

test('mobile navigation opens visibly and closes after selecting a destination', async () => {
  const page = await openPage(375, 812, true);
  await page.click('#burger');
  await page.waitForFunction(() => {
    const nav = document.querySelector('#mobileNav');
    return nav.classList.contains('open') && getComputedStyle(nav).visibility === 'visible' && getComputedStyle(nav).opacity === '1';
  });
  assert.equal(await page.$eval('#burger', el => el.getAttribute('aria-expanded')), 'true');
  assert.equal(await page.$eval('#mobileNav', el => el.inert), false);
  await page.click('#mobileNav a[href="#services"]');
  await page.waitForFunction(() => document.querySelector('#burger').getAttribute('aria-expanded') === 'false');
  assert.equal(await page.$eval('#mobileNav', el => el.classList.contains('open')), false);
  assert.equal(await page.evaluate(() => location.hash), '#services');
  await page.close();
});

test('booking is an honest email enquiry, not a fake booking confirmation', async () => {
  const page = await openPage();
  const copy = await page.$eval('#bookingForm', el => el.innerText);
  assert.match(copy, /prepare.*email enquiry/i);
  assert.match(copy, /no appointment has been confirmed/i);
  assert.match(copy, /sierra@recoverrevenue\.company/i);
  await page.close();
});

test('a valid enquiry creates the email draft state and exposes the copy fallback', async () => {
  const page = await openPage();
  await page.$eval('#guestName', el => { el.value = 'Alex Guest'; });
  await page.$eval('#guestEmail', el => { el.value = 'alex@example.com'; });
  await page.select('#guestTreatment', 'Massage');
  await page.click('#bookingForm button[type="submit"]');
  await page.waitForFunction(() => document.querySelector('#formStatus').hidden === false);
  const state = await page.evaluate(() => ({
    statusVisible: !document.querySelector('#formStatus').hidden,
    copyVisible: !document.querySelector('#copyEnquiry').hidden,
    message: document.querySelector('#formStatus').innerText
  }));
  await page.close();
  assert.equal(state.statusVisible, true);
  assert.equal(state.copyVisible, true);
  assert.match(state.message, /Your enquiry draft is ready/i);
  assert.match(state.message, /Nothing is booked until you send the email/i);
});

test('content stays concise and avoids invented testimonials, memberships, and prices', async () => {
  const page = await openPage();
  const copy = await page.$eval('body', el => el.innerText);
  assert.equal(await page.$$('.trust-strip').then(items => items.length), 1, 'trust strip belongs only directly below the hero');
  assert.equal(await page.$$('#reviews').then(items => items.length), 0, 'no fabricated testimonials');
  assert.equal(await page.$$('#memberships').then(items => items.length), 0, 'no unconfirmed membership tiers');
  assert.doesNotMatch(copy, /sample review|not verified|from \$\d+/i);
  assert.match(copy, /By enquiry/i);
  await page.close();
});

test('all photography is stored locally and has a source/credit record', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const credits = JSON.parse(fs.readFileSync(path.join(root, 'assets/credits.json'), 'utf8'));
  const sources = [...html.matchAll(/src="(assets\/[^"]+)"/g)].map(match => match[1]);
  assert.ok(sources.length >= 8, 'the site should include varied treatment-specific photography');
  for (const source of sources) {
    assert.ok(fs.existsSync(path.join(root, source)), 'missing local image: ' + source);
  }
  for (const photo of credits.photos) {
    assert.ok(fs.existsSync(path.join(root, 'assets', photo.file)), 'missing credited image: ' + photo.file);
    assert.ok(photo.source && photo.url, 'each photo needs a source and a source URL');
  }
  assert.match(credits.licenses.pexels, /pexels\.com\/license/);
  assert.match(credits.licenses.unsplash, /unsplash\.com\/license/);
  assert.ok(fs.existsSync(path.join(root, 'assets/favicon.svg')));
  assert.match(html, /assets\/favicon\.svg/);
});

test('treatment links preselect the relevant enquiry option', async () => {
  const page = await openPage();
  await page.$eval('[data-treatment="Massage"]', link => link.click());
  assert.equal(await page.$eval('#guestTreatment', el => el.value), 'Massage');
  await page.$eval('[data-treatment="Hot-stone ritual"]', link => link.click());
  assert.equal(await page.$eval('#guestTreatment', el => el.value), 'Hot-stone ritual');
  await page.close();
});

test('desktop, tablet, and mobile layouts have no horizontal page overflow', async () => {
  for (const [width, height] of [[375, 812], [754, 900], [1280, 800]]) {
    const page = await openPage(width, height);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.close();
    assert.ok(overflow <= 1, `unexpected horizontal overflow at ${width}px: ${overflow}px`);
  }
});

test('scrolling reveals the full page rather than leaving sections hidden', async () => {
  const page = await openPage(1280, 800);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
  });
  await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0), { timeout: 10000 });
  const revealItems = await page.$$('.reveal');
  for (const item of revealItems) {
    await item.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await new Promise(resolve => setTimeout(resolve, 90));
  }
  await page.waitForFunction(() => [...document.querySelectorAll('.reveal')].every(el => el.classList.contains('is-visible')), { timeout: 5000 });
  const counts = await page.evaluate(() => ({
    visible: document.querySelectorAll('.reveal.is-visible').length,
    total: document.querySelectorAll('.reveal').length
  }));
  await page.close();
  assert.equal(counts.visible, counts.total);
});

test('reduced-motion preference disables continuous hero movement', async () => {
  const page = await openPage(1280, 800, true);
  const state = await page.evaluate(() => ({
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    motionClass: document.documentElement.classList.contains('reduce-motion'),
    archAnimation: getComputedStyle(document.querySelector('.silk-glint')).animationDuration,
    smokeAnimation: getComputedStyle(document.querySelector('.stone-mist')).animationName
  }));
  await page.close();
  assert.equal(state.reduced, true);
  assert.equal(state.motionClass, true);
  assert.equal(state.archAnimation, '1e-05s');
  assert.equal(state.smokeAnimation, 'none');
});
