import puppeteer from './tooling/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { join, resolve } from 'node:path';

const root = resolve('.');
const app = join(root, 'ttrpg_tracker/app');
const output = join(root, '.hallmark/gm-picker-results');
mkdirSync(output, { recursive: true });
const temporary = mkdtempSync(join(output, 'run-'));
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const originalHash = hash(join(app, 'ttrpg.db'));
const probe = createServer();
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const url = `http://127.0.0.1:${port}`;
// A new database loads only the bundled fictional demo records.
const server = spawn(join(app, '.venv/Scripts/python.exe'), ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: app, env: { ...process.env, TTRPG_DB_PATH: join(temporary, 'tracker.db'), TTRPG_BACKUP_DIR: join(temporary, 'backups') },
  windowsHide: true, stdio: 'pipe',
});
let serverLog = '';
server.stderr.on('data', data => { serverLog += data; });
const checks = [];
const check = (label, value) => { assert.ok(value, label); checks.push(label); console.log(`PASS ${label}`); };
const get = async path => (await fetch(url + path)).json();
let browser;
try {
  for (let attempt = 0; ; attempt++) {
    try { if ((await fetch(url + '/api/health')).ok) break; } catch {}
    if (attempt === 80 || server.exitCode !== null) throw new Error(serverLog);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const page = await browser.newPage();
  const errors = [];
  let sessionPosts = 0;
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() === 'POST' && request.url() === url + '/api/sessions') sessionPosts++; });
  page.setDefaultTimeout(7000);
  await page.setViewport({ width: 1440, height: 1000 });
  await page.evaluateOnNewDocument(() => {
    window.nativeInvalidEvents = 0;
    document.addEventListener('invalid', () => window.nativeInvalidEvents++, true);
  });
  await page.goto(url + '/?month=2026-05', { waitUntil: 'networkidle0' });
  const campaign = (await get('/api/campaigns'))[0];
  const originalCampaign = JSON.stringify(campaign);
  const type = async (selector, value) => {
    await page.click(selector);
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    if (value) await page.type(selector, value);
  };
  const gm = '#session-gm';
  const list = '#session-gm-picker';
  const open = async () => {
    await page.click('#add-session');
    await page.select('#session-campaign', String(campaign.id));
    await page.click(gm);
  };
  await page.click('#add-session');
  await page.click('#session-form button[type=submit]');
  check('Empty session shows custom field messages and focuses the first missing field',
    await page.$eval('#session-campaign-error', error => !error.hidden && error.textContent === 'Choose a campaign.')
    && await page.$eval('#session-gm-error', error => !error.hidden && error.textContent === 'Enter a GM name.')
    && await page.$eval('#session-system-error', error => !error.hidden && error.textContent === 'Choose a system.')
    && await page.$eval('#session-campaign', input => input === document.activeElement));
  check('All editor forms bypass browser validation popups', await page.$$eval('#session-form, #campaign-form, #system-form', forms => forms.every(form => form.noValidate)) && await page.evaluate(() => window.nativeInvalidEvents === 0));
  await page.select('#session-campaign', String(campaign.id));
  check('Campaign selection clears messages for fields filled by its defaults', await page.$$eval('#session-campaign-error, #session-gm-error, #session-system-error', errors => errors.every(error => error.hidden)));
  await page.click('#close-session');
  await open();
  check('Campaign defaults are retained and the GM menu opens with all stored names',
    await page.$eval(gm, (input, name) => input.value === name && input.getAttribute('aria-expanded') === 'true' && !input.hasAttribute('list'), campaign.default_gm)
    && await page.$$eval(`${list} [role=option]`, options => options.length > 1));
  await page.screenshot({ path: join(output, 'desktop.png') });
  const chosenName = await page.$eval(`${list} [role=option]:last-child`, option => option.textContent);
  await page.click(`${list} [role=option]:last-child`);
  check('Mouse selection keeps input focus, closes suggestions and fills the name',
    await page.$eval(gm, (input, name) => input.value === name && input === document.activeElement && input.getAttribute('aria-expanded') === 'false', chosenName));

  await type(gm, chosenName.slice(0, 2).toUpperCase());
  check('Typing filters suggestions without case sensitivity', await page.$$eval(`${list} [role=option]`, (options, query) => options.length > 0 && options.every(option => option.textContent.toLowerCase().includes(query)), chosenName.slice(0, 2).toLowerCase()));
  await page.keyboard.press('ArrowDown');
  check('Keyboard highlight exposes the active option to assistive technology', await page.$eval(gm, input => document.getElementById(input.getAttribute('aria-activedescendant'))?.getAttribute('aria-selected') === 'true'));
  await page.keyboard.press('Enter');
  check('Enter selects without submitting the session', await page.$eval(gm, (input, name) => input.value === name, chosenName) && sessionPosts === 0 && await page.$eval('#session-dialog', dialog => dialog.open));
  await page.click(gm);
  await page.keyboard.press('Escape');
  check('First Escape dismisses only suggestions', await page.$eval(list, list => list.hidden) && await page.$eval('#session-dialog', dialog => dialog.open));
  await page.keyboard.press('Escape');
  await open();
  check('Reopening the dialog resets the name to its campaign default', await page.$eval(gm, (input, name) => input.value === name, campaign.default_gm));
  await page.keyboard.press('Tab');
  check('Tab closes suggestions and moves focus onward', await page.$eval(list, list => list.hidden) && await page.$eval(gm, input => input !== document.activeElement));
  await page.click(gm);
  await page.click('#session-date-trigger');
  check('Date and GM pickers do not stay open together', await page.$eval(list, list => list.hidden) && await page.$eval('#session-date-picker', picker => !picker.hidden));

  await type(gm, '');
  await page.click('#session-form button[type=submit]');
  check('Blank GM still blocks saving', await page.$eval(gm, input => !input.validity.valid) && sessionPosts === 0);
  check('GM error is inline, described by the input and leaves suggestions closed', await page.$eval(gm, input => input.getAttribute('aria-invalid') === 'true' && input.getAttribute('aria-describedby') === 'session-gm-error' && input === document.activeElement && input.getAttribute('aria-expanded') === 'false') && await page.$eval('#session-gm-error', error => !error.hidden && error.textContent === 'Enter a GM name.'));
  await page.screenshot({ path: join(output, 'validation-desktop.png') });
  await type(gm, '   ');
  await page.click('#session-form button[type=submit]');
  check('Whitespace-only names use the same custom required message', await page.$eval('#session-gm-error', error => !error.hidden && error.textContent === 'Enter a GM name.') && sessionPosts === 0);
  await type(gm, 'QA New GM');
  check('A new name can be typed when no suggestion matches', await page.$eval(list, list => list.hidden));
  check('Typing clears the previous inline error', await page.$eval(gm, input => !input.hasAttribute('aria-invalid')) && await page.$eval('#session-gm-error', error => error.hidden));
  await type('#session-link', 'ftp://example.com/game');
  await page.click('#session-form button[type=submit]');
  check('Invalid link shows a custom message without creating a session', await page.$eval('#session-link-error', error => !error.hidden && error.textContent.includes('http:// or https://')) && await page.$eval('#session-link', input => input === document.activeElement) && sessionPosts === 0);
  await type('#session-link', 'https://example.com/game');
  await page.click('#session-form button[type=submit]');
  await page.waitForFunction(() => !document.querySelector('#session-dialog').open);
  await page.waitForNetworkIdle({ idleTime: 100 });
  const saved = (await get('/api/sessions')).find(session => session.gm === 'QA New GM');
  check('New name saves as a session override without changing campaign defaults', !!saved && JSON.stringify((await get('/api/campaigns')).find(item => item.id === campaign.id)) === originalCampaign);
  await page.$eval('#session-history', element => { element.open = true; });
  await page.click(`[data-edit-session="${saved.id}"]`);
  await page.click(gm);
  await page.click(`${list} [role=option]:first-child`);
  const editedGm = await page.$eval(gm, input => input.value);
  await page.click('#session-form button[type=submit]');
  await page.waitForFunction(() => !document.querySelector('#session-dialog').open);
  await page.waitForNetworkIdle({ idleTime: 100 });
  check('Editing an existing session persists a chosen suggestion', (await get('/api/sessions')).find(session => session.id === saved.id).gm === editedGm);

  await page.click('#add-session');
  await page.select('#session-kind', 'new-campaign');
  await page.select('#session-system', '__new');
  await page.click('#session-form button[type=submit]');
  check('New campaign and new system show their own required messages', await page.$eval('#session-new-campaign-name-error', error => !error.hidden && error.textContent === 'Enter a campaign name.') && await page.$eval('#session-new-system-name-error', error => !error.hidden && error.textContent === 'Enter a system name.'));
  await page.select('#session-kind', 'one-shot');
  await page.select('#session-system', String(campaign.system_id));
  check('Changing type and system hides errors for fields no longer needed', await page.$$eval('#session-new-campaign-name-error, #session-new-system-name-error', errors => errors.every(error => error.hidden)));
  await page.click('#session-form button[type=submit]');
  check('One-shot name uses a custom required message', await page.$eval('#session-name-error', error => !error.hidden && error.textContent === 'Enter a one-shot name.'));
  await page.select('#session-kind', 'new-campaign');
  await page.click('#session-new-campaign-gm');
  check('New-campaign Default GM uses the same styled menu', await page.$eval('#session-new-campaign-gm', input => input.getAttribute('aria-expanded') === 'true' && !input.hasAttribute('list')));
  await page.click('#session-new-campaign-gm-picker [role=option]');
  check('Default-GM selection does not overwrite the session GM', await page.$eval(gm, input => input.value === ''));
  await page.click('#close-session');
  await open();
  check('Reopening clears old validation messages', await page.$$eval('#session-form .field-error', errors => errors.every(error => error.hidden)));
  await page.click('#close-session');
  await page.click('[data-tab=manage]');
  await page.click('#campaign-form button[type=submit]');
  check('Manage campaign uses custom messages for all required fields', await page.$$eval('#campaign-name-error, #campaign-gm-error, #campaign-system-name-error', errors => errors.every(error => !error.hidden && error.textContent.startsWith('Enter a'))));
  await page.click('#campaign-gm');
  check('Manage campaign Default GM uses the same styled menu', await page.$eval('#campaign-gm', input => input.getAttribute('aria-expanded') === 'true' && !input.hasAttribute('list')));
  await page.click('#campaign-name');
  check('Clicking outside dismisses the menu', await page.$eval('#campaign-gm-picker', list => list.hidden));
  await page.click('#clear-campaign');
  check('Campaign Reset clears inline errors', await page.$$eval('#campaign-form .field-error', errors => errors.every(error => error.hidden)));
  await page.click('[data-subtab=systems]');
  await page.click('#system-form button[type=submit]');
  check('Manage system uses a custom required message', await page.$eval('#system-name-error', error => !error.hidden && error.textContent === 'Enter a system name.'));
  await page.click('[data-tab=sessions]');

  for (const width of [390, 320]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    await open();
    await page.$eval(gm, input => input.scrollIntoView({ block: 'center' }));
    check(`GM menu fits the modal and viewport at ${width}px`, await page.$eval(list, list => {
      const rect = list.getBoundingClientRect();
      const modal = list.closest('form').getBoundingClientRect();
      return !list.hidden && rect.left >= modal.left && rect.right <= modal.right && rect.bottom <= modal.bottom && rect.right <= innerWidth;
    }));
    if (width === 390) await page.screenshot({ path: join(output, 'mobile.png') });
    await page.tap(`${list} [role=option]`);
    check(`Touch selection closes suggestions at ${width}px`, await page.$eval(list, list => list.hidden));
    await type(gm, '');
    await page.click('#session-form button[type=submit]');
    check(`Custom GM error fits the viewport at ${width}px`, await page.$eval('#session-gm-error', error => {
      const rect = error.getBoundingClientRect();
      return !error.hidden && rect.width > 0 && rect.left >= 0 && rect.right <= innerWidth;
    }));
    if (width === 390) await page.screenshot({ path: join(output, 'validation-mobile.png') });
    await page.click('#close-session');
  }
  check('No native validation UI was invoked', await page.evaluate(() => window.nativeInvalidEvents === 0));
  check('No browser JavaScript errors', errors.length === 0);
  check('Personal database is unchanged', hash(join(app, 'ttrpg.db')) === originalHash);
  writeFileSync(join(output, 'results.json'), JSON.stringify({ passed: checks.length, browser: await browser.version(), checks, errors, data: 'isolated fictional demo database' }, null, 2));
  console.log(`COMPLETE ${checks.length} checks passed`);
} finally {
  if (browser) await browser.close();
  if (server.exitCode === null) spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
}
