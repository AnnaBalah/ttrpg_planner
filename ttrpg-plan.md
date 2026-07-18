# TTRPG Session Tracker — Build Plan

> **Temporary file** — delete when all phases are complete.
>
> Status legend: `[ ]` todo · `[~]` in progress · `[x]` done.
> Items marked _(assumed — confirm)_ are my proposals; see **Open Questions** at the bottom.

## Goal

Replace the Notion TTRPG tracker with a self-hosted app that keeps the three things you
actually used: a **calendar view**, **campaign templates** (click `+` to log a session with
pre-filled data), and **stats** (monthly + year-in-review). Self-hosted on a home server,
reachable from desktop and phone.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend | FastAPI (Python) | Auto request validation + built-in `/docs` API explorer for easy testing |
| Packaging | `pyproject.toml` + **uv** | Modern, fast, reproducible via `uv.lock`. `uv run` auto-syncs deps before launch |
| DB access | SQLModel _(assumed — confirm)_ | Typed models, little boilerplate. Alt: raw `sqlite3` for fewer deps |
| Database | SQLite | Embedded (a file, **not** a server) → no separate DB container. Single file on a Docker **volume** so data survives rebuilds |
| Frontend | HTML / CSS / vanilla JS | Single-page app with tabs, dark theme with dark blue-navy backgrounds and warm yellow accents. No framework |
| Hosting | Docker Compose | **One container, no custom image to build.** Uses the public `ghcr.io/astral-sh/uv` image; your code is bind-mounted and run with `uv run`. FastAPI serves both the API and the static frontend |
| Design | Responsive | Usable on desktop and phone (calendar adapts — see Phase 3) |

---

## Architecture

- **One container, zero custom images.** We pull the public official `ghcr.io/astral-sh/uv`
  image, bind-mount our source code into it, and start the app with `uv run uvicorn ...`. No
  Dockerfile, no build step, no registry — deploying is "drop the folder on the NAS, restart."
  FastAPI serves the static frontend (`/`) and the JSON API (`/api/...`) from that one process.
- **SQLite is embedded, not a service.** It's a library reading one file — there is no second
  "database container." The FastAPI process opens `/data/ttrpg.db` directly.
- **Data on a named volume.** The SQLite file lives at `/data/ttrpg.db`, on a host volume.
  Rebuilding/restarting the container never touches your data.
- **Virtualenv on its own volume.** uv's environment lives at `/opt/venv` (a named volume), kept
  off the bind-mounted code folder so dev-machine (macOS) and NAS (Linux) binaries never clash.
- **Stats computed in the frontend.** The dataset is small (tens–hundreds of sessions), so the
  app fetches all sessions once and computes stats in JS. Simpler than backend aggregation; we
  can move to SQL later if it ever grows. _(assumed — confirm)_

### Deployment (compose sketch)

```yaml
services:
  ttrpg:
    image: ghcr.io/astral-sh/uv:python3.13-bookworm-slim   # public, official
    working_dir: /app
    environment:
      UV_PROJECT_ENVIRONMENT: /opt/venv   # venv off the bind mount (arch-safe)
      UV_COMPILE_BYTECODE: "1"
    command: uv run uvicorn main:app --host 0.0.0.0 --port 8000
    volumes:
      - ./app:/app           # code: pyproject.toml, uv.lock, main.py, frontend/
      - ttrpg_venv:/opt/venv # synced environment
      - ttrpg_data:/data     # the SQLite file
    ports:
      - "8000:8000"
    restart: unless-stopped

volumes:
  ttrpg_data:
  ttrpg_venv:
```

> Trade-off: bind-mounted code means no image versioning/rollback — the "version" is whatever's
> in the folder. Fine for a personal project; the CSV/JSON export (Phase 2) covers data safety.

---

## Data Model

**systems** — game systems; **the single source of color**
| field | type | notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT, unique | e.g. `D&D 5e`, `Pathfinder 2e` |
| color | TEXT (hex) | the base hue — **the only color you ever pick.** Per-campaign shades derive from it |
| created_at | TEXT | |

**campaigns** — the reusable templates
| field | type | notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT, unique | e.g. `Rock&Stone`, `Єпархія Монфруа` |
| default_gm | TEXT | pre-fills new sessions |
| system_id | INTEGER, FK → systems(id), NOT NULL | the campaign's system; pre-fills sessions and drives chip color (no per-campaign color) |
| default_link | TEXT | optional |
| archived | INT 0/1 | hide finished/one-shot campaigns from the quick-add bar without deleting history |
| created_at | TEXT | |

**sessions** — individual play sessions (campaign sessions **and** one-shots)
| field | type | notes |
|---|---|---|
| id | INTEGER PK | |
| campaign_id | INTEGER, FK → campaigns(id), **NULLABLE**, ON DELETE RESTRICT | set ⇒ campaign session; `NULL` ⇒ standalone one-shot |
| name | TEXT, optional | the **one-shot's label** (e.g. `Heist one-shot`); unused for campaign sessions |
| date | TEXT (ISO `YYYY-MM-DD`) | stored ISO for sorting/filtering; shown human-friendly |
| gm | TEXT | campaign session: defaults from campaign, **editable** (guest GMs happen). One-shot: entered directly |
| system_id | INTEGER, FK → systems(id), NOT NULL | campaign session: defaults from campaign, editable. One-shot: picked directly. **Drives chip color** |
| link | TEXT, optional | notes / character sheets |
| notes | TEXT, optional | short free text |
| created_at | TEXT | |

`CHECK (campaign_id IS NOT NULL OR name IS NOT NULL)` — a session is **either** a campaign
session **or** a named one-shot, never neither.

**Modeling decisions baked in here:**
- **One-shots are a first-class concept**, not a fake campaign. A one-shot is a session with
  `campaign_id = NULL` that carries its own `name`. No template, no quick-add entry, no
  `archived` clutter. Its color comes from its system, like everything else.
- **Color lives on the system, never the campaign or session.** See **Color model** below.
- **gm/system live on both** campaign (as defaults) and session (as the actual value), so stats
  stay accurate even when a campaign session deviates from the template. `gm` is free text;
  `system` is an FK into the managed `systems` list.
- **No per-session title** — campaign sessions aren't numbered/labelled; one-shots use `name`.

### Color model

- **One color per system.** A `systems` row stores a base hex — the only color anyone ever picks.
- **Shades derive automatically.** Each campaign of a system is assigned a distinct, stable shade
  computed from the base (stepping HSL lightness/saturation) so two D&D campaigns stay in the red
  family yet remain distinguishable. **No per-campaign color picking.**
- **One-shots** render in their system's plain base color (shade 0). _(sub-decision — could give
  each its own shade later)_
- **A chip follows its own system.** Campaign sessions normally inherit the campaign's system; if
  you change a session's system, its color follows the new one.
- All derivation happens **in the frontend** from the stored base hex; the DB stores only the
  base color on `systems`.

---

## Cross-cutting concerns (apply to every phase)

- [ ] **Data persistence** — SQLite on a mounted Docker volume (set up in Phase 1; verify it
  survives a `docker compose down && up`).
- [x] **Backup / export** — a button to download all data as CSV/JSON. You flagged that
  localStorage isn't reliable; this gives you a portable copy any time. (Built in Phase 2.)
- [x] **UTF-8 end-to-end** — your data has Cyrillic (`Єпархія Монфруа`), curly quotes
  (`"One-shot" dwarves`) and `&`. Import, DB, API, and UI must all preserve these exactly.
- [x] **Remote access — resolved: no app login.** On home LAN the phone hits the NAS directly;
  away from home it connects over Tailscale. The network handles identity, so the app needs no
  authentication of its own. Bind to `0.0.0.0` inside the container; do **not** expose the port
  to the public internet.
- [x] **No typo soup** — `system` is a **managed list** (pick existing or add a new one with its
  color), so it can't fragment (`DnD` vs `D&D`). `gm` stays free text but is offered as
  autocomplete from existing values for the same reason.

---

## Phase 1 — Foundation & Data Import

- [x] Project structure — `ttrpg_tracker/` with `docker-compose.yml`, an `app/` folder holding `pyproject.toml` + `uv.lock`, `main.py`, and a `frontend/` folder; `/data` and `/opt/venv` volumes. No Dockerfile.
- [x] SQLite schema — `systems`, `campaigns`, and `sessions` tables (as above), with FKs + indexes on `date`, `campaign_id`, and `system_id`
- [x] FastAPI REST endpoints — GET / POST / PUT / DELETE for sessions and campaigns
  - Deleting a campaign that still has sessions is **blocked** (use *archive* instead) to protect history
- [x] One-time CSV import — load the 26 sessions from `..._all.csv` (ignore the other two exports)
  - Create one `systems` row per unique system value (blank → an `Unspecified` system); assign each a distinct starter base color (recolorable later)
  - Create one campaign per unique recurring name, linked to its system; infer its default GM from that campaign's most common value
  - Rows that are genuine one-offs (e.g. a `"One-shot" …` label) import as **one-shot sessions** (`campaign_id = NULL`, `name` set), not as campaigns — confirm the one-shot rows during import
  - Normalize `Anna (me)` → `Anna`; parse `January 30, 2026` → `2026-01-30`
  - **Verify:** all 26 rows imported, dates correct, Cyrillic/quotes intact
- [x] Basic session list view — sortable table, dark theme, responsive layout (stacks on mobile)

---

## Phase 2 — Campaign Templates & Quick-Add

- [x] Systems management page — add / edit systems (name + **primary color**); this is the only color picker in the app
- [x] Campaigns management page — add / edit / delete(archive) campaign templates (name, default GM, system, link) — no color field
- [x] Quick-add button per campaign (`+`) — modal pre-filled with today's date + campaign defaults, one tap to save (still editable before saving)
- [x] Add-session form — pick an existing campaign from a dropdown, **or** log a standalone one-shot (name, system, GM), **or** create a new campaign inline. Picking/adding a system happens here too (new system prompts for its color)
- [x] Edit & delete sessions from list view
- [x] Search / filter the list — by campaign, GM, or system
- [x] Export button — download all systems + campaigns + sessions as CSV/JSON (backup)

---

## Phase 3 — Calendar View

- [x] Monthly grid calendar — 7-column grid, current month by default
- [x] Sessions appear as colored name chips (truncated) on their date cells
- [x] Click a day → quick-add modal opens with that date pre-filled
- [x] Previous / next month navigation
- [x] Mobile calendar — on a narrow screen, switch to a scrollable agenda/list (a 7-col grid is unreadable on a phone)

---

## Phase 4 — Monthly Stats

- [x] Stats tab — defaults to current month
- [x] Session count for selected month + breakdown by campaign and system (one-shots shown as their own "One-shots" group)
- [x] Visual bar chart — most played games/campaigns that month (bars in their derived system shades)
- [x] Month picker to browse history
- [x] Empty state — clear message for months with no sessions

---

## Phase 5 — Year in Review

- [x] Annual stats page — total sessions, breakdown by campaign / system / GM (one-shots as their own "One-shots" group)
- [x] Sessions-per-month bar chart — 12-bar overview of the year
- [x] Highlights — most active month, most played campaign, longest gap between sessions
- [x] "Games I ran vs. played" — derived from GM = `Anna` (you flagged tracking who GM'd)
- [x] Year picker — browse any past year

---

## Phase 6 — Interface Polish

**Navigation and layout**
- [x] Reorder main tabs to: Calendar → Sessions → Campaigns → Systems → Stats → Year Review
- [x] Hide the Quick Add strip on Stats and Year Review tabs, since it is unrelated to analysis views
- [x] Discuss tab layout polish — make tabs neater, and consider grouping, stacking, or rearranging for desktop/mobile
  - Option A: keep one row on desktop, wrap naturally on mobile.
  - Option B: split primary views (`Calendar`, `Sessions`) from admin/analysis (`Campaigns`, `Systems`, `Stats`, `Year Review`).
  - Option C: use a compact mobile segmented control or dropdown for secondary tabs.
  - Chosen: merge Calendar and Sessions into one `Sessions` workspace; group Campaigns/Systems under `Manage`; group Monthly/Year Review under `Stats`.

**Visual polish**
- [x] Reduce campaign/session chip text weight in Sessions and Calendar views so names do not read as overly bold
- [x] Fix Quick Add `+` icon centering inside the circular icon
- [x] Replace default browser select arrows with custom aligned arrows that fit the padded dark fields
- [x] Add a browser tab favicon
- [x] Do a broader UI pass on spacing, mobile modal behavior, table density, and button/icon styling
- [x] Campaigns table — align the `Actions` header consistently with the other table headers

**Color clarity**
- [x] Implement derived campaign shades from each system's base color so campaigns using the same system stay related but are visually distinguishable
- [x] Systems tab — expose derived campaign/one-shot shades, possibly under edit or as a preview

---

## Phase 7 — Visual Identity & Delight

- [x] Beautify the UI with a restrained emoji language focused on Stats and empty states
- [x] Decide whether to use emoji, text symbols, or an icon library consistently across the app
  - Chosen: use emoji sparingly instead of adding an icon dependency; keep everyday workflow tabs/forms mostly clean.
- [x] Add subtle visual personality without reducing table/calendar scanability
  - Added stat tile icons, friendlier empty states, and a faint honeycomb texture on the Stats workspace.

---

## Phase 8 — Calendar & Session UX

- [x] Add calendar quality-of-life refinements such as month density cues, jump-to-month with sessions, or a compact year overview
  - Added day density cues plus previous/next played-month jumps.
- [x] Improve Quick Add flow with a true one-tap save path for campaign defaults plus an edit-before-save option
  - Quick Add cards now offer `Log today` and `Edit first`.
- [x] Review the add/edit session modal for fewer steps, clearer defaults, and better mobile ergonomics
  - Added context-aware submit labels and first-field focus for add/edit flows.

---

## Future Additions

**Date and picker UX**
- [x] Date formatting — use `dd/mm/yyyy` everywhere, including table cells, calendar/session labels, modal fields, and picker result text
  - Full dates now display as `dd/mm/yyyy`; month picker results display as `mm/yyyy`.
- [x] Custom date pickers — replace or wrap browser-native date/month/year pickers with app-styled controls where it improves consistency
  - Replaced session date, monthly stats, and year review picker controls with app-styled popovers while keeping ISO values internally.

**Session entry UX**
- [ ] Add Session defaults — default `Type` to `Campaign session`, keep `Date` defaulted to today, and keep Campaign blank until the user chooses one
- [ ] Quick Add redesign — rethink campaign cards and actions; add an `Add` flow that prefills campaign defaults but leaves Date blank and required
- [ ] Quick Add design brainstorm — explore smaller cards, split primary/secondary actions, icon-only edit controls, and clearer distinction between `Log today`, `Add`, and edit-before-save

**System color UX**
- [x] Generated colors — when generating or suggesting system colors, avoid repeating the same color that was chosen previously
  - Added a shared system-color suggestion palette that avoids existing system colors and avoids duplicate visible suggestions across new-system forms.

**Admin and maintenance**
- [ ] Deployment guide — add `DEPLOY.md` with NAS/home-server setup, Tailscale/LAN notes, Docker volume persistence verification, and safe exposure guidance
- [ ] Automatic backups — add timestamped JSON backup endpoint or scheduled backup script, in addition to manual export
- [ ] Import/admin tooling — add a reset-and-reimport command or admin action for early development and data cleanup
- [ ] Tests — add backend tests for import, delete guards, export, and core API behavior; consider lightweight frontend tests later
- [ ] Stats discussion — brainstorm what else would be useful to track before adding more charts

---

## Decisions (resolved)

1. **Remote access / login — no app login.** LAN-direct at home, Tailscale away. Network handles
   identity; never expose the port to the public internet.
2. **DB layer — SQLModel.**
3. **One-shots — first-class concept** (own `name` + `color`, `campaign_id = NULL`), *not* archived
   campaigns. See Data Model.
4. **Per-session title — dropped.** Sessions aren't numbered/labelled; one-shots use `name`.
5. **"Games I ran vs played" — yes**, in Year in Review (GM = `Anna`).
6. **Session time of day — date-only.** No start-time field.

---

## Out of scope (for now)

Multi-user accounts · player-character/sheet management (we just store a link) ·
session reminders/notifications · native mobile app · recurring-session auto-scheduling.
