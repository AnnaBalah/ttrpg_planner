# Test records

**Status:** In progress. The first exploratory defect and its focused retest are
recorded below. DEF-002 is a new user-reported campaign-deletion issue awaiting
runtime reproduction. Ten focused test cases below are drafts and **Not run**;
the broader formal campaign-session suite is still planned.

Use a collapsed section for each new dataset, test case, execution run or finding.

<a id="campaign-session-test-data-and-setup"></a>
<details>
<summary><strong>Campaign-session test data and setup</strong></summary>

**Status:** Preparation notes moved from the acceptance criteria. The focused
cases below extend this setup; broader cases and new execution results remain
to be recorded.

Use fictional data in an isolated test dataset with two existing game systems:

| Campaign | Status | Default GM | System | Default Link |
| --- | --- | --- | --- | --- |
| Campaign A | Active | Morgan | System A | `https://example.com/a` |
| Campaign B | Archived | Riley | System B | Blank |

Start scenarios independently. Record the existing session count, campaign
defaults and existing session values before each scenario. Control the
browser-local date when checking today or future dates.

Use the following variations when designing cases against the linked criteria:

| Criteria | Test data or variations |
| --- | --- |
| AC-CS-03–05 | Campaigns A and B; edit GM, System, Link, Date and Notes before switching from A to B. |
| AC-CS-06–07 | Override Date and GM, select System B for A, change Link and Notes; separately clear both optional fields. |
| AC-CS-09 | Valid past date, browser-local today, future date and leap day `2024-02-29`. |
| AC-CS-10 | 5 November 2026 displayed as `05/11/2026`. |
| AC-CS-11 | Campaign unselected; System unselected; GM empty; GM containing only whitespace. |
| AC-CS-12 | Date missing, empty, `2026-02-29` or `2026-04-31`. |
| AC-CS-13 | Nonexistent campaign or system; a reference removed after loading the form. |
| AC-CS-14 | `example.com/game`, `https://`, `ftp://example.com/game`. |
| AC-CS-15 | `http://example.com/game`, `https://example.com/game`. |
| AC-CS-18 | Matching and excluding calendar months, history filters and statistics periods. |
| AC-CS-20; AC-SH-09 | Close and Escape separately, with and without a picker open; repeat for each session-form context below. |
| AC-CS-21 | A confirmed rejection with no record created, then a successful retry. |
| AC-CS-22; AC-SH-10 | Hold each save stage pending; repeat Save/Enter, Close and Escape, with and without a picker. |
| AC-CS-23 | Browser-local date `2026-10-28`; session date `2026-11-05`. November and 2026 totals each increase by one; October is unchanged. |

Missing or invalid dates and stale references may require controlled requests
when the normal form cannot produce the input. Record the method in the test
case. Do not classify a lost response or failed refresh as a confirmed rejection;
see [GAP-CS-01](requirements-and-rules.md#open-decision).

</details>

<a id="test-cases"></a>
<details>
<summary><strong>Test cases</strong></summary>

For each case, record its ID, linked requirement or acceptance criterion,
preconditions, test data, steps and expected result. Link the relevant
[acceptance criteria](acceptance-criteria.md); the setup notes above are not yet
executable test cases.

<a id="focused-review-test-cases"></a>
<details>
<summary><strong>Focused acceptance-review cases — draft, Not run</strong></summary>

**Prepared:** 28 October 2026. **Scope:** documentation and draft test cases only,
as selected by the owner. All ten cases are **Not run**. The data below describes
fixtures to prepare later; no live dataset or CSV was imported in this pass.
All linked version 1.1 criteria were approved by the owner on 28 October 2026;
these test cases remain drafts and Not run.
Current source was rechecked at `0a1dcf4` during the documentation-only retirement
audit on 28 October 2026. Known source gaps stay in FU-ST-01 (tied highlights) and
FU-SH-07 (session-form picker cancellation); this inspection is not an execution
result. The owner clarified Q-ST-01 on 28 October 2026: Favorite System means
most played by session count. TC-ST-02 checks all tied system leaders in the
monthly and annual breakdowns, without requiring an extra annual highlight.

Before executing, record the exact app commit and working-tree changes, Windows
version, browser version, viewport, Python or Docker launch method and isolated
storage location. Capture requests/responses and before/after records where the
case requires them. Run each case from its own fresh fixture. Use tracker-format
CSV with the exported header; keep unrelated fields valid and empty optional
fields empty. Capture all counts before preview, after apply and after reload.

<details>
<summary><strong>Fictional fixtures and session-form matrix</strong></summary>

<details>
<summary><strong>Import fixture I — numeric ID collisions</strong></summary>

Prepare one destination system
System Existing, one Campaign Existing using it with default GM Morgan, and one
campaign session on `2025-01-05`, GM Morgan. Record their actual IDs as dS, dC and
dX; these symbols stand for integers and are not literal CSV values. Set My GM
name to Morgan and snapshot the records and setting.

Prepare a separate tracker-format source CSV containing only these three rows:

| Record | Name / campaign | File ID | File references | Other values |
| --- | --- | --- | --- | --- |
| System | System New | dS | None | Color `#AA5500` |
| Campaign | Campaign New | dC | System ID dS, system name System New | Default GM Riley; active; default link empty |
| Session | Campaign New; no separate title | dX | Campaign ID dC and system ID dS, with matching source names | `2025-02-05`; GM Riley; link and notes empty |

The file deliberately reuses destination numbers for different source records.
IDs are scoped by record type; references within the file agree with its own
definitions. Initial destination counts are 1 system, 1 campaign and 1 session.

</details>

<details>
<summary><strong>Import fixture N — normalized matching</strong></summary>

Prepare one destination system
Écho (`#336699`), one campaign Café using it with GM Morgan, and one linked session
on `2025-01-05`, GM Morgan, link `https://example.com/original` and notes
`Keep this note`. Set My GM name to Morgan. In a source CSV, give the matching
system and campaign different positive file IDs from their destination IDs.
Use these name variants consistently in definitions and references:

| Field | Destination text | Source text variation |
| --- | --- | --- |
| System | Écho, composed É (U+00C9) | Surrounding spaces; uppercase; initial E (U+0045) followed by combining acute (U+0301) |
| Campaign | Café, composed é (U+00E9) | Surrounding spaces; uppercase; final E (U+0045) followed by combining acute (U+0301) |
| Session GM | Morgan | ` MORGAN ` |

Use actual Unicode characters when constructing the file, rather than literal
backslash escape text. Keep the date and actual system identity the same. Source
session link and notes are `https://example.com/replacement` and `Replacement`.
Keep campaign defaults and the system color otherwise equivalent. Fixture N has
one occurrence in the destination; its cases specify the number of source
occurrences. Distinct deliberate source sessions use distinct positive IDs.

</details>

<details>
<summary><strong>System fixture S — recorded system differs from campaign default</strong></summary>

Systems A
and B have colors `#336699` and `#AA5500`. Campaign A is active, with default GM
Morgan and default system A. Prepare these sessions, with optional fields empty:

| Date | Session identity | GM | Recorded system |
| --- | --- | --- | --- |
| `2025-01-05` | Campaign A | Morgan | B |
| `2025-01-12` | One-shot S; no campaign | Riley | A |
| `2025-02-05` | Campaign A | Morgan | B |

</details>

<details>
<summary><strong>Tie fixture T — three tied leaders</strong></summary>

Prepare campaigns A, B and C with default
systems A, B and C respectively; use the same letters for system names. Record:

| Date | Campaign | GM | Recorded system |
| --- | --- | --- | --- |
| `2025-01-05` | A | Morgan | A |
| `2025-01-12` | B | Riley | B |
| `2025-02-05` | A | Morgan | B |
| `2025-02-12` | C | Casey | C |
| `2025-03-05` | B | Riley | C |
| `2025-03-12` | C | Casey | A |

Annual total is 6. January, February and March each have 2 sessions; all other
months have zero. Campaigns A/B/C, systems A/B/C and GMs Morgan/Riley/Casey each
have counts 2/2/2. The GM breakdown need not gain a new highlight.

</details>

<details>
<summary><strong>Keyboard matrix K — all session-form contexts</strong></summary>

Execute each TC-SH case separately for each applicable
context; record results per context rather than one blanket pass:

| Context | Variations |
| --- | --- |
| New campaign session | Add session and calendar-date entry |
| New one-shot | Add session and calendar-date entry |
| New campaign plus first session | Include the campaign-create and session-create save stages |
| Existing campaign session or one-shot | Open each type through calendar, agenda and history; inspect without changes and edit valid values |
| Inline new system and planned Quick Add | Repeat on session creation/editing with a new system; include a combined new campaign/system attempt. Repeat any Quick Add session form when implemented; record an unavailable planned context as Not run with its reason. |

View-only openings use TC-SH-01–02. TC-SH-03 applies after editing starts or during
creation. Use the actual app's pickers; if a picker cannot be opened during a
pending save, record that fact and verify Escape still retains the form. During
multi-record saves, hold each request stage independently; do not require the
whole dataset to remain unchanged merely because a response is still pending.

</details>

</details>

<details>
<summary><strong>TC-DA-01 — Remap colliding file IDs</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-DA-09; FR-DA-08–09;
BR-DA-04. **Preconditions/data:** Fresh fixture I; valid source CSV ready.

1. Preview the source file in Manage → Import CSV and compare destination records
   and My GM name with the initial snapshot.
2. Apply the valid preview once and record returned added counts and record IDs.
3. Reload and inspect the imported campaign and session relationships.

**Expected:** Preview writes nothing and proposes 1 new system, 1 new campaign
and 1 new session. Apply reports those same added counts; final counts are 2/2/2.
System Existing, Campaign Existing and the original session retain their IDs and
values; My GM name remains Morgan. Campaign New references the newly created
System New destination ID, and its session references the new campaign and
system IDs. Neither reference points to the unrelated original destination record
whose ID matched the file number. Reload preserves this state.

</details>

<details>
<summary><strong>TC-DA-02 — Match equivalent names without overwriting values</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-DA-09–10; FR-DA-09;
BR-DA-04–05. **Preconditions/data:** Fresh fixture N with one source occurrence.

1. Preview the source file and inspect statuses, added counts and any conflict
   warnings.
2. Compare all stored records and My GM name with the original snapshot.
3. Attempt to proceed through the ordinary Import new records control.

**Expected:** System and campaign are existing matches; the session is an
existing occurrence/duplicate. No new records are proposed. The different file
IDs, case, surrounding spaces and equivalent Unicode spelling do not create
new identities. Import is unavailable because there are zero additions. The
original IDs, names, links, notes, counts and My GM name remain unchanged; a
warning about keeping existing session notes/link may be shown.

</details>

<details>
<summary><strong>TC-DA-03 — Preserve multiplicity through normalized reimport</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-DA-09–11; FR-DA-08–09;
BR-DA-05. **Preconditions/data:** Fresh fixture N; source contains two deliberate
occurrences of the same normalized session identity, with distinct session IDs.

1. Preview and apply the two-occurrence file once; inspect counts and associations.
2. Reload and inspect both session occurrences and the original's optional values.
3. Preview the same file again.

**Expected:** First preview proposes 0 systems, 0 campaigns and 1 session added;
the other source occurrence is a duplicate. After apply/reload there is still
1 system and 1 campaign, with exactly 2 sessions referencing their existing IDs.
The original keeps its original link and note; the added occurrence records the
source's optional values. The second preview proposes zero additions and does
not enable Import new records. Stored My GM name and other original values remain
unchanged throughout.

</details>

<details>
<summary><strong>TC-DA-04 — Keep different identity components distinct</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-DA-10; FR-DA-09;
BR-DA-05. **Preconditions/data:** Fresh fixture N. Prepare a CSV defining the
existing campaign/system and one new System B, plus these four distinct sessions:
a one-shot named Café with no campaign on `2025-01-05`, Morgan, Écho; a campaign
session on `2025-01-06`, Morgan, Écho; a campaign session on `2025-01-05`, Riley,
Écho; and a campaign session on `2025-01-05`, Morgan, System B. Use distinct source
IDs and otherwise valid values.

1. Preview the file and inspect each proposed session identity.
2. Apply once and reload.
3. Inspect the original session and all four new sessions by ID and association.

**Expected:** Preview/apply add 1 system, 0 campaigns and 4 sessions. Final counts
are 2 systems, 1 campaign and 5 sessions. Campaign-versus-one-shot type, date, GM
and actual system each keep the respective row distinct from the original. The
one-shot has no campaign; all three new campaign sessions reference Café's existing
destination ID. The original session and its link/note remain unchanged.

</details>

<details>
<summary><strong>TC-ST-01 — Count recorded systems in monthly and annual breakdowns</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-ST-03, AC-ST-08;
FR-ST-03, FR-ST-07; BR-ST-02. **Preconditions/data:** Fresh fixture S.

1. Open Monthly Stats for January 2025, then February 2025.
2. Open Year Review for 2025 and compare all applicable totals and system groups.
3. Change Campaign A's default system to B without editing sessions, then refresh
   the same statistics and inspect recorded session IDs/systems.

**Expected:** January total 2, campaign groups Campaign A=1 and One-shots=1,
system groups A=1 and B=1. February total 1, Campaign A=1 and B=1; A contributes
zero to that month's system total. Annual total 3; Campaign A=2, One-shots=1;
systems A=1 and B=2. Each complete breakdown sums to its period's total. Changing
the campaign default does not change any recorded session system or these counts.

</details>

<details>
<summary><strong>TC-ST-02 — Identify all tied leaders and a sole-leader control</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-ST-05, AC-ST-08;
FR-ST-04, FR-ST-07; BR-ST-06; Q-ST-01. **Preconditions/data:** Fresh fixture T.

1. View January 2025 Monthly Stats and the 2025 Year Review.
2. Record the names/months and counts in each applicable count highlight and
   all leading systems and their counts in the monthly and annual breakdowns.
3. Add a session on `2025-01-19`, campaign A, GM Morgan, actual system A; refresh
   both views.

**Expected:** Initially, January's highlights identify campaigns A and B and
systems A and B as tied at 1 each; its system breakdown displays both systems
with count 1. Year Review identifies January/February/March as busiest at 2 each
and campaigns A/B/C as most-played groups tied at 2 each. Its system breakdown
displays systems A/B/C with count 2 each, making every tied most-played system
identifiable. Favorite System means most played by session count; no additional
annual Favorite System highlight is required. Every leader is identifiable with
its shared count; a bare Tie label or a partial list is insufficient.

The annual total is 6. After the control session, annual total is 7: January is
the sole busiest month at 3, campaign A is sole most-played group at 3, and the
annual system breakdown shows A leading at 3, with B and C remaining at 2 each.
January's highlights show campaign A and system A each leading at 2; its system
breakdown shows A=2 and B=1. Other group counts remain unchanged. No particular
tie layout or new GM highlight is required.

</details>

<details>
<summary><strong>TC-SY-01 — Follow the actual system's color after either system changes</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-SY-19; FR-SY-15;
BR-SY-12. **Preconditions/data:** Fresh fixture S; capture system/campaign/session
IDs, counts, current displayed labels and computed colors in applicable calendar,
agenda, history and statistics displays.

1. Change system A's primary color from `#336699` to `#663399`; refresh the views.
2. Change system B's primary color from `#AA5500` to `#007766`; refresh the views.
3. Reload and compare the associations, counts, primary colors and session shades.

**Expected:** After step 1, Campaign A's display and the one-shot recorded with A
follow A's new color; the campaign sessions recorded with B retain their B-derived
colors. After step 2, those B sessions reflect B's new color while Campaign A
still derives its color from A. All system/campaign/session IDs, recorded system
associations and counts remain unchanged and persist after reload. Capture colors
before/after; derived shades need not equal a system's raw primary hex value.

</details>

<details>
<summary><strong>TC-SH-01 — Escape closes only a picker before saving</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-SH-09; AC-CS-20;
AC-OS-07; AC-SE-07; AC-HI-07; FR-SH-06; Q-CS-07.
**Preconditions/data:** Matrix K, each context independently; known stored
snapshot, entered values and an open picker; no save pending.

1. Press Escape once while the picker is open.
2. Inspect form visibility and every entered value; inspect outgoing requests.
3. Press Escape again with no picker open and inspect stored data.

**Expected:** First Escape closes only the picker, retains the form and entered
values and sends no write. Second Escape closes the form, discards unsaved
changes and sends no write. Stored records and counts match the starting snapshot;
an edited record retains its original saved values.

</details>

<details>
<summary><strong>TC-SH-02 — Close or Escape discards unsaved form changes</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-SH-09; AC-CS-20;
AC-OS-07; AC-SE-07; AC-HI-07; FR-SH-06; Q-CS-07.
**Preconditions/data:** Matrix K, each context independently; known stored
snapshot and unsaved values; no save pending.

1. Use Close with no picker open; inspect form state, requests and stored data.
2. Reopen, re-enter values, open a picker and use Close; inspect the same results.
3. Reopen, re-enter values and press Escape with no picker open.

**Expected:** Each independent cancellation closes the form and discards its
unsaved changes without any create, update or delete request. No campaign or
system is created merely from entering inline values. The stored snapshot,
including an edited record's saved values, remains unchanged. Reopening an edit
loads saved values; reopening creation does not restore the discarded changes.

</details>

<details>
<summary><strong>TC-SH-03 — Block dismissal and duplicate saves during every save stage</strong></summary>

**Status:** Not run. **Priority:** Must. **Links:** AC-SH-03, AC-SH-06,
AC-SH-10; AC-CS-22; FR-SH-03, FR-SH-06; Q-CS-07.
**Preconditions/data:** Matrix K creation/edit variants with valid final values.
Use a controlled response hold in an isolated browser test environment; the
method and affected request must be recorded before execution.

1. Start one valid Save and hold its response. For inline creation, repeat this
   case from a fresh fixture with each campaign/system/session request stage held.
2. While pending, use Close and Escape with no picker open; also test Escape
   with a picker open if the interface permits one. Repeat Save clicks and Enter.
3. Release the response with confirmed success and let subsequent required saves
   and refresh finish. Reload and inspect saved records by ID.

**Expected:** While pending, the form remains open and retains entered values.
Escape may dismiss a picker only. None of those repeated actions starts a second
save operation or an extra request for the held stage. The one original save may
continue through its required later stages. After confirmed completion/refresh,
creation adds exactly one session; editing retains the same ID with no session
count increase. Inline records are created once per required new record. Lost
responses, uncertain cleanup and failed refreshes are separate recovery scenarios
under GAP-CS-01; this case does not settle their detailed form-state design.

</details>

</details>

</details>

<a id="execution-results"></a>
<details>
<summary><strong>Execution results</strong></summary>

Record the date, app version, environment, actual result, outcome and evidence
for each executed case. Identify blocked and unexecuted cases explicitly.

**Focused review pass — 28 October 2026:** TC-DA-01–04, TC-ST-01–02, TC-SY-01
and TC-SH-01–03 are **Not run**. No automated tests were added or executed, no
fixture was applied, and no runtime evidence or new defect/retest outcome was
recorded. The cases' preparation is documentation work, not an execution run.

</details>

<a id="findings-and-retests"></a>
<details>
<summary><strong>Findings and retests</strong></summary>

<a id="def-001-browser-default-styling-in-forms"></a>
<details>
<summary><strong>DEF-001: Browser-default styling in forms</strong></summary>

| Field | Record |
| --- | --- |
| Reported | 27 October 2026, by Anna |
| Area | Add Session and related campaign/system forms |
| Severity / priority | Low — visual consistency |
| Version | `ff3ef38`; fixes in the working tree |
| Status | Fixed; retest passed |

**Steps:** With existing GM names available, open **Add session** and display the
GM suggestions. Then leave a required field blank and choose **Save Session**.

**Actual:** GM suggestions and validation warnings use browser-default styling
that differs from the app. Data entry and validation work; the issue is visual.

**Expected:** Menus and error messages match the app's colors, typography and
form styling.

**Fix:** Styled GM suggestions and short inline messages such as “Enter a GM
name.” Applied the same presentation to related forms.

**Retest — RET-001, 27 October 2026:** Passed in Edge on Windows at desktop size
and 390/320px touch emulation. Appearance reviewed with Codex assistance;
40 focused and 115 regression checks passed using isolated data.

**Evidence:** [Original warning](../images/form-validation-before.png),
[updated menu](../images/gm-picker-desktop.png),
[custom message](../images/form-validation-desktop.png) and
[mobile message](../images/form-validation-mobile.png).
The [reusable browser check](../../.hallmark/gm-picker-qa.mjs) retains the detailed
verification steps.

</details>

<a id="def-002-campaign-delete-feedback"></a>
<details>
<summary><strong>DEF-002: Misleading error and lost context when deleting a campaign with sessions</strong></summary>

| Field | Record |
| --- | --- |
| Reported | 28 October 2026, by Anna |
| Area | Manage → Campaigns → Delete |
| Severity / priority | Proposed: Medium / Medium — misleading failure feedback and recovery; data loss has not been established |
| Version / environment | Running app version, browser and request details not yet recorded; source inspected from the current working tree |
| Status | Open — user reported; source review completed; runtime reproduction and retest not performed |

**Preconditions:** A campaign exists with at least one linked session. Use a
fictional campaign in an isolated test dataset when reproducing.

**Reported reproduction steps:**

1. Open Manage → Campaigns and locate a campaign with sessions.
2. Choose Delete for that campaign.
3. Observe the notice that campaigns with sessions should be archived instead.
4. Choose Delete again in the confirmation dialog.
5. Observe the dialog closing and the error message “failed to fetch”.

**Actual, as reported:** Deletion remains available despite the warning. The
dialog closes and a generic fetch error appears instead of explaining the
campaign restriction and providing a useful action. Whether the campaign and
its sessions remained unchanged after this attempt has not yet been verified.

**Expected under the current restriction and agreed product decisions:** A
campaign with sessions is retained and the response explains why deletion is
blocked. Q-CP-04–06, agreed on 28 October 2026, require an explained unavailable
Delete action for known linked campaigns, usable context after rejection and an
explicit Archive action for active campaigns. Cancel leaves data unchanged; an
already archived campaign is identified without automatically changing status.
An interrupted response requires checking the campaign list before another
deletion attempt. Detailed business rules, functional requirements and priorities
are approved; implementation, reproduction and retest remain planned.

**Source-review findings, not runtime evidence:**

- `renderCampaigns` currently renders Delete for every campaign, alongside
  Archive or Unarchive, without checking linked-session count.
- `requestDeleteCampaign` uses a generic confirmation message that mentions
  archiving but still supplies a Delete confirmation action.
- `handleConfirmSubmit` calls `closeConfirmDialog` before awaiting deletion,
  which explains why the dialog is closed before the result is known.
- The backend `delete_campaign` intends to return HTTP 409 and “Campaign has
  sessions; archive it instead of deleting”, leaving the records in place.
- The frontend `api` and `errorText` intend to display a readable response's
  business message. A readable HTTP 409 alone does not cause `fetch` to reject,
  so it does not establish the cause of the reported generic message.

**Review:** Keeping the session-history guard is appropriate. Offering a known
impossible deletion and losing its context are interaction problems. The raw
fetch message needs separate diagnosis; do not assume the guard caused a network
failure or that the report demonstrates data loss. Changing Delete to silently
archive, or adding cascading session deletion, would change the user's chosen
action and is not the recommended fix.

**Planned improvement:**
[WF-CP-06](requirements-and-rules.md#wf-cp-06-improve-blocked-campaign-deletion),
with product decisions Q-CP-05–06 and approved requirements FR-CP-22–26. Retain
server protection, explain unavailable deletion before confirmation where the
relationship is known, preserve context for a server rejection, and distinguish
connection failures or unknown outcomes from a business restriction.
The product policy is agreed; implementation, reproduction and retest remain
pending. This agreement does not change the finding's Open status.

**Evidence still needed:** Record the running version, browser, failing deletion
request address, response status/body if any, console message and relevant server
log. Check campaign/session values before and after the attempt. A lost response
must not be classified as proof that nothing changed.

**Retest:** Not run. After implementation of the agreed product policy, execute the five
[planned scenarios](requirements-and-rules.md#wf-cp-06-improve-blocked-campaign-deletion)
covering active/archived linked campaigns, empty deletion and cancellation,
stale data and connection loss. Record result, evidence and any remaining
failure under a new retest ID. Existing API delete-guard checks are references,
not evidence of a new execution or a browser fix.

**Source references:**
[frontend](../../ttrpg_tracker/app/frontend/app.js),
[backend](../../ttrpg_tracker/app/main.py) and existing
[API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py).

</details>

</details>

**Related documents:**

[Requirements and rules](requirements-and-rules.md) ·
[Acceptance criteria](acceptance-criteria.md) · [Documentation checklist](README.md)
