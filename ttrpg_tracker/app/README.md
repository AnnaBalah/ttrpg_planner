# TTRPG Tracker

Phase 1 foundation for the self-hosted TTRPG session tracker.

Run locally:

```powershell
uv run uvicorn main:app --reload
```

Run with Docker Compose from the `ttrpg_tracker` folder:

```powershell
docker compose up
```

## Import game data

Choose **Import CSV** beside the export buttons, select a tracker CSV export, and
choose **Preview file**. Review the new sessions, campaigns, systems and any
warnings, then choose **Import new records**.

Imports add records without replacing existing data. Systems and campaigns match
by name, ignoring case and surrounding whitespace. File IDs are remapped to local
records. Sessions match by date, campaign or one-shot name, GM and system; separate
same-day sessions remain separate. Importing the same export again adds nothing.
Existing colors, campaign defaults, archive status, session notes and links are
kept. A changed database requires a fresh preview.

Every import that adds records saves a complete JSON backup under `app/backups/`
before writing. Invalid files add nothing. Files must use the tracker's **Export
CSV** format and contain no more than 10,000 records or 5 MB.

## Verification

Run the backend regression tests from the repository root. They cover CRUD and
validation over HTTP, concurrent saves, CSV round trips, duplicate imports,
backups, rollback, stale previews and startup behavior. They use temporary copies
or in-memory databases and verify that the real database is unchanged.

```powershell
.\ttrpg_tracker\app\.venv\Scripts\python.exe -m unittest discover -s ttrpg_tracker/app/tests -v
```

The browser checks live in `.hallmark/qa.mjs` and `.hallmark/stability-qa.mjs`.
They require `puppeteer-core` in `.hallmark/tooling` and Microsoft Edge, and run
against copied databases on ports 8766 and 8768. Results and screenshots are
written under `.hallmark/`. The stability checks exercise real file downloads,
import previews and backups, failed saves and retries, repeated clicks, and the
latest form and statistics layout at phone and desktop sizes.

Install the browser test dependency once from the repository root:

```powershell
npm install --no-save --prefix .hallmark/tooling puppeteer-core@25.16.0
```

```powershell
node .hallmark/qa.mjs
node .hallmark/stability-qa.mjs
```
