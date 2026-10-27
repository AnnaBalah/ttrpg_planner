# Tablelog application notes

Setup, CSV import rules and automated verification notes. See the
[main README](../../README.md) for the project overview and QA/BA documentation.

Fresh installations start with 26 demo sessions from
`import_source/demo_sessions.csv`. The campaign titles and GM names are fictional.
The demo includes four game systems, ongoing campaigns and one-shots. It is loaded
only when the database has no systems, campaigns or sessions.

Run locally from this directory (`ttrpg_tracker/app`):

```powershell
uv run uvicorn main:app --reload
```

Run with Docker Compose from the `ttrpg_tracker` folder:

```powershell
docker compose up
```

## Import game data

On the **Manage** tab, choose **Import CSV**, select a tracker CSV export, and
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

The commands below are for Windows. Start the app once with the Python setup
before running them, so the local `.venv` environment and `ttrpg.db` file exist.
This local setup is also needed if you normally run the app with Docker.
Browser checks require a local database with at least one session and game system;
the bundled demo data meets that requirement.

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

The focused form-consistency check starts with a separate database containing
only the fictional demo data. It covers mouse, keyboard and touch selection,
free-text names, custom validation messages, saving/editing and mobile layout:

```powershell
node .hallmark/gm-picker-qa.mjs
```

It writes results and screenshots under `.hallmark/gm-picker-results/`. The
portfolio [defect and retest record](../../docs/portfolio/test-records.md#def-001-browser-default-styling-in-forms)
explains the original issue and recorded verification.
