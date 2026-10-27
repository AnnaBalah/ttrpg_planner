import puppeteer from './tooling/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('.');
const app = join(root, 'ttrpg_tracker/app');
const out = join(root, '.hallmark/qa-shots');
const backupDir = join(root, '.hallmark/stability-backups');
mkdirSync(out, { recursive: true });
mkdirSync(join(root, '.hallmark/qa-downloads'), { recursive: true });
const downloads = mkdtempSync(join(root, '.hallmark/qa-downloads/run-'));
const db = join(root, '.hallmark/qa-stability.db');
copyFileSync(join(app, 'ttrpg.db'), db);
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const originalHash = hash(join(app, 'ttrpg.db'));
const url = 'http://127.0.0.1:8768';
const server = spawn(join(app, '.venv/Scripts/python.exe'), ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8768'], {
  cwd: app, env: { ...process.env, TTRPG_DB_PATH: db, TTRPG_BACKUP_DIR: backupDir }, windowsHide: true, stdio: 'pipe',
});
let serverLog = '';
server.stderr.on('data', b => { serverLog += b; });
const checks = [];
const check = (label, value) => { checks.push({ label, passed: !!value }); console.log(`${value ? 'PASS' : 'FAIL'} ${label}`); };
const request = async (path, payload, method = 'POST') => {
  const response = await fetch(url + path, { method: payload === undefined ? 'GET' : method, headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' }, body: payload === undefined ? undefined : JSON.stringify(payload) });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { response, data };
};
const get = async path => (await request(path)).data;
const mutate = async (path, payload, method) => { const result = await request(path, payload, method); assert.ok(result.response.ok, JSON.stringify(result.data)); return result.data; };
const pause = ms => new Promise(r => setTimeout(r, ms));
let browser;
try {
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(url + '/api/health')).ok) break; } catch {}
    await pause(100);
    if (i === 79) throw new Error(`Test server unavailable: ${serverLog}`);
  }
  const original = await get('/api/export');
  const system = original.systems[0];
  browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(6000);
  const browserErrors = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.setViewport({ width: 1440, height: 1000 });
  const idle = () => page.waitForNetworkIdle({ idleTime: 100, timeout: 8000 });
  const click = async selector => { await page.waitForSelector(selector, { visible: true }); await page.click(selector); };
  const type = async (selector, value) => { await page.$eval(selector, input => { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); }); if (value) await page.type(selector, value); };
  const reload = async () => { await page.goto(url + '/?month=2026-10', { waitUntil: 'networkidle0' }); };
  await reload();
  const sessionForm = async name => {
    await click('#add-session');
    await page.select('#session-kind', 'one-shot');
    await type('#session-name', name);
    await type('#session-gm', 'QA GM');
    await page.select('#session-system', String(system.id));
  };
  let sessionDelay = 0, sessionPosts = 0, failSession = 0, failSystem = 0;
  await page.setRequestInterception(true);
  page.on('request', async req => {
    if (req.method() === 'POST' && req.url() === url + '/api/sessions') {
      sessionPosts++;
      if (sessionDelay) await pause(sessionDelay);
      if (failSession-- > 0) { await req.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ detail: 'Temporary test failure' }) }); return; }
    }
    if (req.method() === 'POST' && req.url() === url + '/api/systems' && failSystem-- > 0) {
      await req.respond({ status: 422, contentType: 'application/json', body: JSON.stringify({ detail: [{ loc: ['body', 'name'], msg: 'Name unavailable' }] }) }); return;
    }
    await req.continue();
  });

  await click('#add-session');
  await page.waitForFunction(() => document.activeElement === document.querySelector('#session-campaign'));
  check('New session defaults to Campaign session and focuses campaign', await page.$eval('#session-kind', e => e.value === 'campaign') && await page.$eval('#session-campaign', e => e === document.activeElement));
  await page.keyboard.press('Escape');
  check('Escape closes the modal and returns focus to Add session', await page.$eval('#session-dialog', e => !e.open) && await page.$eval('#add-session', e => e === document.activeElement));

  await sessionForm('QA repeated click');
  sessionDelay = 250;
  sessionPosts = 0;
  await page.click('#session-form button[type="submit"]', { clickCount: 2, delay: 30 });
  // Network idle can occur while the intercepted POST is deliberately delayed.
  await page.waitForFunction(() => !document.querySelector('#session-dialog').open);
  await idle();
  let repeated = (await get('/api/sessions')).filter(s => s.name === 'QA repeated click');
  check('Rapid double-click saves exactly one session and sends one request', repeated.length === 1 && sessionPosts === 1);
  for (const item of repeated) await mutate('/api/sessions/' + item.id, {}, 'DELETE');
  sessionDelay = 0;
  await reload();

  await click('#add-session');
  await page.select('#session-kind', 'new-campaign');
  await type('#session-gm', 'QA GM');
  await page.select('#session-system', '__new');
  await type('#session-new-system-name', 'QA must not be created');
  const beforeInvalid = await get('/api/export');
  await click('#session-form button[type="submit"]');
  await idle();
  const afterInvalid = await get('/api/export');
  check('Missing campaign name creates neither a campaign, system nor session', JSON.stringify(beforeInvalid) === JSON.stringify(afterInvalid));
  await click('#close-session');
  await reload();

  await click('#add-session');
  await page.select('#session-kind', 'new-campaign');
  await type('#session-new-campaign-name', 'QA retry campaign');
  await type('#session-gm', 'QA GM');
  await page.select('#session-system', String(system.id));
  failSession = 1;
  await click('#session-form button[type="submit"]');
  await idle();
  check('Failed save keeps the dialog and entered values', await page.$eval('#session-dialog', e => e.open) && await page.$eval('#session-gm', e => e.value === 'QA GM'));
  await click('#session-form button[type="submit"]');
  await idle();
  const retryCampaigns = (await get('/api/campaigns')).filter(c => c.name === 'QA retry campaign');
  const retrySessions = (await get('/api/sessions')).filter(s => retryCampaigns.some(c => c.id === s.campaign_id));
  check('Retry after inline campaign creation succeeds without duplicate campaigns', retryCampaigns.length === 1 && retrySessions.length === 1 && await page.$eval('#session-dialog', e => !e.open));
  if (await page.$eval('#session-dialog', e => e.open)) await click('#close-session');

  await click('[data-tab="manage"]');
  await click(`[data-edit-campaign="${retryCampaigns[0].id}"]`);
  await type('#campaign-name', 'QA renamed campaign');
  await click('#campaign-form button[type="submit"]');
  await idle();
  await click('[data-tab="sessions"]');
  await click('#session-history > summary');
  check('Renaming a campaign immediately refreshes calendar and history labels', await page.$eval('#sessions-body', e => e.textContent.includes('QA renamed campaign') && !e.textContent.includes('QA retry campaign')));
  await page.$eval('#session-history', e => e.open = false);

  await sessionForm('QA retry system session');
  await page.select('#session-system', '__new');
  await type('#session-new-system-name', 'QA retry system');
  failSession = 1;
  await click('#session-form button[type="submit"]');
  await idle();
  await click('#session-form button[type="submit"]');
  await idle();
  check('Retry after inline system creation succeeds without duplicate systems', (await get('/api/systems')).filter(s => s.name === 'QA retry system').length === 1 && (await get('/api/sessions')).filter(s => s.name === 'QA retry system session').length === 1 && await page.$eval('#session-dialog', e => !e.open));
  if (await page.$eval('#session-dialog', e => e.open)) await click('#close-session');

  await sessionForm('QA reset validation');
  await type('#session-link', 'ftp://example.com/game');
  await click('#session-form button[type="submit"]');
  check('Unsupported links are rejected before saving', await page.$eval('#session-link', e => !e.validity.valid) && await page.$eval('#session-dialog', e => e.open));
  await click('#close-session');
  await sessionForm('QA clean validation');
  check('Reopening the form clears old validation errors', await page.$eval('#session-link', e => e.value === '' && e.validity.valid));
  await click('#close-session');

  await click('[data-tab="manage"]');
  await click('[data-subtab="systems"]');
  await type('#system-name', 'QA validation message');
  failSystem = 1;
  await click('#system-form button[type="submit"]');
  await idle();
  check('Validation errors show readable messages', await page.$eval('#toast', e => e.textContent.includes('Name unavailable') && !e.textContent.includes('[object Object]')));

  await reload();
  await click('[data-tab="manage"]');
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  for (const [selector, endpoint, file] of [['#export-csv', '/api/export.csv', 'ttrpg-export.csv']]) {
    await click(selector);
    for (let i = 0; i < 100 && !existsSync(join(downloads, file)); i++) await pause(50);
    assert.ok(existsSync(join(downloads, file)), `Missing browser download: ${file}`);
    const content = readFileSync(join(downloads, file), 'utf8');
    const expected = await get(endpoint);
    check(`Actual ${file} browser download contains the complete export`, content === expected);
  }

  const csv = readFileSync(join(downloads, 'ttrpg-export.csv'), 'utf8');
  const columns = csv.split('\r\n')[0].split(',');
  const csvRow = values => columns.map(key => '"' + String(values[key] ?? '').replaceAll('"', '""') + '"').join(',') + '\r\n';
  const fixture = join(downloads, 'new-records.csv');
  const newName = 'QA похід, "new"';
  writeFileSync(fixture, csv + [
    { record_type: 'system', id: '990001', name: 'QA Imported System', system_color: '#e58f55' },
    { record_type: 'campaign', id: '990002', name: newName, default_gm: 'QA GM', system_id: '990001', system_name: 'QA Imported System', archived: '0' },
    { record_type: 'session', id: '990003', date: '2026-10-26', gm: 'QA GM', system_id: '990001', campaign_id: '990002', notes: 'Comma, "quote"\nUnicode: гра' },
    { record_type: 'session', id: '990004', name: 'QA imported one-shot', date: '2026-10-26', gm: 'QA GM', system_id: '990001' },
  ].map(csvRow).join(''));
  const importFile = async path => { await (await page.$('#import-file')).uploadFile(path); await click('#preview-import'); await idle(); };
  await click('#import-csv');
  check('Import starts with Preview disabled until a file is selected', await page.$eval('#preview-import', e => e.disabled));
  await importFile(join(downloads, 'ttrpg-export.csv'));
  check('Downloaded CSV can be previewed without creating duplicates', await page.$eval('#import-status', e => e.textContent.includes('Everything in this file')) && await page.$eval('#apply-import', e => e.hidden));
  await importFile(fixture);
  check('Import preview identifies two sessions, one campaign and one system', JSON.stringify(await page.$$eval('.import-totals dd', els => els.map(e => Number(e.textContent)))) === '[2,1,1]');
  const beforeStale = await get('/api/export');
  await mutate('/api/sessions/' + beforeStale.sessions[0].id, { notes: 'QA stale preview check' }, 'PUT');
  await click('#apply-import');
  await idle();
  check('Stale preview blocks import with a clear request to preview again', await page.$eval('#import-status', e => e.textContent.includes('data changed')) && (await get('/api/sessions')).length === beforeStale.sessions.length);
  await click('#preview-import');
  await idle();
  const beforeImport = await get('/api/export');
  const applyResponse = page.waitForResponse(r => r.url() === url + '/api/import' && r.request().method() === 'POST');
  await click('#apply-import');
  const importResult = await (await applyResponse).json();
  await idle();
  const imported = await get('/api/export');
  check('Import adds only the previewed records', imported.sessions.length === beforeImport.sessions.length + 2 && imported.campaigns.length === beforeImport.campaigns.length + 1 && imported.systems.length === beforeImport.systems.length + 1);
  check('Automatic import backup exactly matches the previous data', JSON.stringify(JSON.parse(readFileSync(join(backupDir, importResult.backup_file), 'utf8'))) === JSON.stringify(beforeImport));
  check('Unicode, quotes and multiline notes survive import', imported.sessions.some(s => s.campaign_name === newName && s.notes === 'Comma, "quote"\nUnicode: гра'));
  check('Import refreshes all session history records', await page.$$eval('#sessions-body [data-edit-session]', (elements, n) => elements.length === n, imported.sessions.length));
  await click('#import-csv');
  await importFile(fixture);
  check('Reimporting the same file adds nothing', await page.$eval('#apply-import', e => e.hidden) && await page.$eval('#import-status', e => e.textContent.includes('Everything in this file')));
  const invalid = join(downloads, 'invalid.csv');
  writeFileSync(invalid, 'Name,Date\nNot a tracker file,2026-10-27');
  await importFile(invalid);
  check('Invalid file replaces the previous preview and disables import', await page.$eval('#apply-import', e => e.hidden) && await page.$eval('#import-status', e => e.classList.contains('is-error')));
  const oversized = join(downloads, 'oversized.csv');
  writeFileSync(oversized, Buffer.alloc(5_000_001, 'a'));
  await importFile(oversized);
  check('Oversized files are rejected with a useful message', await page.$eval('#import-status', e => e.textContent.includes('5 MB')));
  await click('#close-import');

  // Exactly 9 and 10 sessions verify the inclusive color boundary.
  for (const [month, count] of [['01', 9], ['02', 10]]) {
    for (let i = 0; i < count; i++) await mutate('/api/sessions', { name: `QA threshold ${month}-${i}`, date: `2099-${month}-01`, gm: 'QA GM', system_id: system.id });
  }
  await reload();
  await click('#session-history > summary');
  check('Game plates stay on one line and retain full-name tooltips', await page.$$eval('#sessions-body .chip', chips => chips.every(e => getComputedStyle(e).whiteSpace === 'nowrap' && getComputedStyle(e).textOverflow === 'ellipsis' && e.title === e.textContent.trim())));
  const oneShot = (await get('/api/sessions')).find(s => !s.campaign_id);
  await click(`[data-edit-session="${oneShot.id}"]`);
  check('Editing an existing one-shot keeps its original type', await page.$eval('#session-kind', e => e.value === 'one-shot'));
  await click('#close-session');
  await page.$eval('#session-history', e => e.open = false);
  for (const width of [320, 375, 846, 1440]) {
    await page.setViewport({ width, height: 800 });
    await click('#add-session');
    check(`Link, System and Notes widths match at ${width}px`, await page.evaluate(() => {
      const bounds = ['#session-link', '#session-system', '#session-notes'].map(selector => document.querySelector(selector).getBoundingClientRect());
      return bounds.every(r => Math.abs(r.width - bounds[0].width) < 1 && Math.abs(r.left - bounds[0].left) < 1);
    }));
    check(`Add Session fits and Save remains reachable at ${width}px`, await page.$eval('#session-dialog', e => e.getBoundingClientRect().left >= 0 && e.getBoundingClientRect().right <= innerWidth));
    await page.$eval('#session-form button[type="submit"]', e => e.scrollIntoView({ block: 'nearest' }));
    check(`Save is visible after scrolling the modal at ${width}px`, await page.$eval('#session-form button[type="submit"]', e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }));
    await page.screenshot({ path: join(out, `verified-dialog-${width}.png`) });
    await click('#close-session');
  }
  await page.setViewport({ width: 1440, height: 1000 });
  await click('[data-tab="stats"]');
  await click('[data-subtab="year"]');
  await click('#year-trigger');
  await click('[data-year-picker-year="2099"]');
  check('Nine sessions use lime; exactly ten use pink', await page.$$eval('.month-bar', bars => {
    const nine = bars.find(e => e.querySelector('small').textContent === '9');
    const ten = bars.find(e => e.querySelector('small').textContent === '10');
    return nine && ten && !nine.classList.contains('is-busy') && ten.classList.contains('is-busy') && getComputedStyle(nine.querySelector('.month-bar-track > span')).backgroundColor !== getComputedStyle(ten.querySelector('.month-bar-track > span')).backgroundColor;
  }));
  check('Requested Year Review headings use the display font', await page.$$eval('.review-grid .chart-panel:not(.wide-panel) h3', heads => heads.length === 4 && heads.every(e => getComputedStyle(e).fontFamily.includes('Bowlby'))));
  check('Stats use one summary panel and no dashed chart separators', await page.$$eval('#year-content .chart-panel', panels => panels.every(e => !Object.values(getComputedStyle(e)).includes('dashed'))));
  check('Latest local assets and both theme fonts load', await page.evaluate(() => document.fonts.check('400 20px "Bowlby One SC"') && document.fonts.check('400 16px "Sofia Sans"') && [...document.scripts].some(e => e.src.includes('v='))));
  await page.screenshot({ path: join(out, 'verified-year-review.png'), fullPage: true });
  check('No browser JavaScript errors during stability checks', browserErrors.length === 0);
  check('Real database remains byte-for-byte unchanged', hash(join(app, 'ttrpg.db')) === originalHash);
} finally {
  if (browser) await browser.close();
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  else server.kill();
  writeFileSync(join(root, '.hallmark/stability-results.json'), JSON.stringify({ passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length, originalHash, checks }, null, 2));
}
if (checks.some(c => !c.passed)) process.exitCode = 1;
console.log(`COMPLETE ${checks.filter(c => c.passed).length} passed; ${checks.filter(c => !c.passed).length} failed`);
