import puppeteer from './tooling/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { basename, dirname, join, resolve } from 'node:path';

const root = resolve('.');
const app = join(root, 'ttrpg_tracker/app');
const scratch = realpathSync(join(root, '.hallmark'));
const temporary = mkdtempSync(join(scratch, 'owner-gm-'));
const screenshots = join(scratch, 'qa-shots');
mkdirSync(screenshots, { recursive: true });
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const originalHash = hash(join(app, 'ttrpg.db'));
const probe = createServer();
await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(0, '127.0.0.1', resolve); });
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const url = `http://127.0.0.1:${port}`;
let server;
let browser;
let serverLog = '';
const checks = [];
const check = (label, value) => { assert.ok(value, label); checks.push(label); console.log(`PASS ${label}`); };
const request = async (path, body, method = 'POST') => {
  const response = await fetch(url + path, {
    method: body === undefined ? 'GET' : method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? null : await response.json();
  assert.ok(response.ok, JSON.stringify(data));
  return data;
};
const startServer = async () => {
  serverLog = '';
  server = spawn(join(app, '.venv/Scripts/python.exe'), ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: app,
    env: { ...process.env, TTRPG_DB_PATH: join(temporary, 'tracker.db'), TTRPG_BACKUP_DIR: join(temporary, 'backups') },
    windowsHide: true, stdio: 'pipe',
  });
  server.stderr.on('data', data => { serverLog += data; });
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(url + '/api/health')).ok) return; } catch {}
    if (server.exitCode !== null) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Owner GM test server unavailable: ${serverLog}`);
};
const stopServer = async () => {
  if (!server || server.exitCode !== null) return;
  const stopped = new Promise(resolve => server.once('exit', resolve));
  spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  await stopped;
};
const year = async (page, value) => {
  await page.click('#year-trigger');
  await page.click(`[data-year-picker-year="${value}"]`);
};
const openReview = async page => {
  page.setDefaultTimeout(7000);
  await page.goto(url + '/?view=stats&month=2026-05', { waitUntil: 'networkidle0' });
  await page.click('[data-subtab="year"]');
  await year(page, '2026');
  await page.waitForSelector('#owner-gm', { visible: true });
};
const counts = page => page.$$eval('.owner-gm-panel .bar-row strong', elements => elements.map(element => parseInt(element.textContent, 10)));
const choose = async (page, name) => {
  const value = await page.$eval('#owner-gm', (select, wanted) => [...select.options].find(option => option.value.toLowerCase() === wanted.toLowerCase())?.value, name);
  assert.notEqual(value, undefined, `No GM choice for ${name}`);
  const saved = page.waitForResponse(response => response.url() === url + '/api/settings' && response.request().method() === 'PUT');
  await page.select('#owner-gm', value);
  assert.ok((await saved).ok());
  await page.waitForFunction(() => !document.querySelector('#owner-gm').disabled);
};

try {
  await startServer();
  const originalRecords = await request('/api/export');
  assert.equal(originalRecords.sessions.length, 26);
  check('A fresh tracker has no selected owner', (await request('/api/settings')).owner_gm_name === null);
  browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 1440, height: 1000 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  let settingsGetStatus = 404;
  let failSave = false;
  let delaySave = false;
  await page.setRequestInterception(true);
  page.on('request', async intercepted => {
    if (intercepted.url() === url + '/api/settings') {
      if (intercepted.method() === 'GET' && settingsGetStatus) {
        await intercepted.respond({ status: settingsGetStatus, contentType: 'application/json', body: JSON.stringify({ detail: 'Simulated settings outage' }) });
        return;
      }
      if (intercepted.method() === 'PUT') {
        if (failSave) {
          failSave = false;
          await intercepted.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ detail: 'Temporary test failure' }) });
          return;
        }
        if (delaySave) await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    await intercepted.continue();
  });
  await openReview(page);
  check('A missing settings endpoint keeps calendar, management and statistics populated',
    await page.$$eval('[data-calendar-cell]', elements => elements.length > 0)
    && await page.$$eval('#campaigns-body [data-edit-campaign]', elements => elements.length === 4)
    && await page.$eval('#year-status', element => element.textContent === '26 sessions in 2026')
    && await page.$eval('#owner-gm', element => element.disabled)
    && await page.$eval('#owner-gm-feedback', element => element.textContent.includes('Restart the app')));
  await page.click('[data-tab="sessions"]');
  await page.click('#add-session');
  await page.select('#session-kind', 'one-shot');
  await page.type('#session-name', 'QA old-backend save');
  await page.type('#session-gm', 'Compatibility GM');
  await page.select('#session-system', String(originalRecords.systems[0].id));
  await page.click('#session-form button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector('#session-dialog').open);
  const compatibilitySession = (await request('/api/sessions')).find(session => session.name === 'QA old-backend save');
  check('Saving and refreshing records still works when settings returns 404', Boolean(compatibilitySession));
  await request('/api/sessions/' + compatibilitySession.id, {}, 'DELETE');
  settingsGetStatus = 503;
  await openReview(page);
  check('A temporary settings failure keeps records visible and explains how to retry',
    await page.$eval('#year-status', element => element.textContent === '26 sessions in 2026')
    && await page.$eval('#owner-gm-feedback', element => element.textContent.includes('Refresh this page')));
  settingsGetStatus = 0;
  await openReview(page);
  check('The unset owner shows the agreed prompt instead of counts', await page.$eval('.owner-gm-empty', element => element.textContent === 'Choose your GM name to see this breakdown.') && (await counts(page)).length === 0);
  await choose(page, 'Rowan');
  check('Selecting Rowan gives 11 ran and 15 played in the demo year', JSON.stringify(await counts(page)) === '[11,15]');
  check('The GM chart marks the selected name as Me', await page.$eval('.gm-me-badge', element => element.parentElement.textContent === 'Rowan Me'));
  check('Saving returns keyboard focus to the name picker', await page.$eval('#owner-gm', element => element === document.activeElement));
  check('Choosing an owner leaves all game records unchanged', JSON.stringify(await request('/api/export')) === JSON.stringify(originalRecords));

  failSave = true;
  await page.select('#owner-gm', 'Mira');
  await page.waitForFunction(() => document.querySelector('#owner-gm-feedback').textContent.includes('Could not save'));
  check('A failed save keeps the previous owner and counts with a retry message', await page.$eval('#owner-gm', element => element.value === 'Rowan') && JSON.stringify(await counts(page)) === '[11,15]' && (await request('/api/settings')).owner_gm_name === 'Rowan');
  delaySave = true;
  const saved = page.waitForResponse(response => response.url() === url + '/api/settings' && response.request().method() === 'PUT');
  await page.select('#owner-gm', 'Mira');
  check('The picker is disabled while the shared setting is being saved', await page.$eval('#owner-gm', element => element.disabled));
  assert.ok((await saved).ok());
  await page.waitForFunction(() => !document.querySelector('#owner-gm').disabled);
  delaySave = false;
  check('Retrying a failed choice updates counts correctly', JSON.stringify(await counts(page)) === '[8,18]');

  const separateContext = await browser.createBrowserContext();
  const otherPage = await separateContext.newPage();
  await otherPage.setViewport({ width: 1440, height: 1000 });
  await openReview(otherPage);
  check('A separate browser context sees the same saved tracker owner', await otherPage.$eval('#owner-gm', element => element.value === 'Mira') && JSON.stringify(await counts(otherPage)) === '[8,18]');
  await separateContext.close();
  await stopServer();
  await startServer();
  await openReview(page);
  check('The selected owner survives a server restart and page reload', await page.$eval('#owner-gm', element => element.value === 'Mira') && JSON.stringify(await counts(page)) === '[8,18]');

  const systemId = originalRecords.systems[0].id;
  await request('/api/sessions', { name: 'Past game', date: '2025-05-01', gm: 'Past GM', system_id: systemId });
  const futureCampaign = await request('/api/campaigns', { name: 'Future campaign', default_gm: 'Future GM', system_id: systemId });
  await openReview(page);
  check('Name options include GMs from other years and campaign defaults', await page.$$eval('#owner-gm option', options => ['Past GM', 'Future GM'].every(name => options.some(option => option.value === name))));
  await choose(page, 'Past GM');
  check('An owner with no games in the selected year has zero ran', JSON.stringify(await counts(page)) === '[0,26]');
  await year(page, '2025');
  check('Changing the year keeps the owner and recalculates both totals', await page.$eval('#owner-gm', element => element.value === 'Past GM') && JSON.stringify(await counts(page)) === '[1,0]');
  await year(page, '2026');
  check('Returning to another year preserves the owner selection', await page.$eval('#owner-gm', element => element.value === 'Past GM') && JSON.stringify(await counts(page)) === '[0,26]');
  await choose(page, 'Future GM');
  await request('/api/campaigns/' + futureCampaign.id, {}, 'DELETE');
  await openReview(page);
  check('Removing the last source record keeps the saved name available', await page.$eval('#owner-gm', element => element.value === 'Future GM') && JSON.stringify(await counts(page)) === '[0,26]');

  await request('/api/sessions', { name: 'Case variant', date: '2026-08-01', gm: 'ROWAN', system_id: systemId });
  await openReview(page);
  await choose(page, 'Rowan');
  check('Case variants count as the same owner and appear once in the picker', JSON.stringify(await counts(page)) === '[12,15]' && await page.$$eval('#owner-gm option', options => options.filter(option => option.value.toLowerCase() === 'rowan').length === 1));
  const recordSnapshot = await request('/api/export');
  await choose(page, '');
  check('Clearing the choice restores the prompt and clears the saved setting', await page.$eval('.owner-gm-empty', element => element.textContent.includes('Choose your GM name')) && (await request('/api/settings')).owner_gm_name === null);
  await choose(page, 'Rowan');
  check('Preference changes preserve records added during testing', JSON.stringify(await request('/api/export')) === JSON.stringify(recordSnapshot));
  await page.screenshot({ path: join(screenshots, 'owner-gm-desktop.png'), fullPage: true });

  const longName = 'A very long fictional GM name <with markup> and Unicode: Мирослав';
  await request('/api/campaigns', { name: 'Long-name campaign', default_gm: longName, system_id: systemId });
  await openReview(page);
  await choose(page, longName);
  check('Names with markup remain text in the picker', await page.$eval('#owner-gm', element => element.selectedOptions[0].textContent.includes('<with markup>')) && await page.$$eval('#owner-gm img, #owner-gm script', elements => elements.length === 0));
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewport({ width, height: 900 });
    check(`The owner control fits at ${width}px, including long names`, await page.$eval('#owner-gm', element => { const bounds = element.getBoundingClientRect(); return bounds.left >= 0 && bounds.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth; }));
  }
  await choose(page, 'Rowan');
  await page.setViewport({ width: 375, height: 900 });
  await page.$eval('.owner-gm-panel', element => element.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: join(screenshots, 'owner-gm-mobile.png') });
  for (const session of (await request('/api/sessions')).filter(session => session.date.startsWith('2026'))) {
    await request('/api/sessions/' + session.id, {}, 'DELETE');
  }
  await openReview(page);
  check('An entirely empty year still offers the saved owner and zero totals', await page.$eval('#owner-gm', element => element.value.toLowerCase() === 'rowan') && JSON.stringify(await counts(page)) === '[0,0]');
  check('No browser errors occurred during owner selection', errors.length === 0);
  check('The personal database remains byte-for-byte unchanged', hash(join(app, 'ttrpg.db')) === originalHash);
  writeFileSync(join(scratch, 'owner-gm-results.json'), JSON.stringify({ passed: checks.length, checks }, null, 2));
  console.log(`COMPLETE ${checks.length} owner GM checks passed`);
} finally {
  if (browser) await browser.close();
  await stopServer();
  assert.equal(hash(join(app, 'ttrpg.db')), originalHash, 'Personal database changed');
  const cleanupTarget = realpathSync(temporary);
  assert.equal(dirname(cleanupTarget), scratch);
  assert.ok(basename(cleanupTarget).startsWith('owner-gm-'));
  rmSync(cleanupTarget, { recursive: true, force: true });
}
