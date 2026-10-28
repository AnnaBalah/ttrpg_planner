# Requirements and rules

**Status:** Requirements and Must/Should priorities agreed on 28 October 2026.
Business rules and [acceptance criteria](acceptance-criteria.md) tentatively agreed;
the save-recovery gap below remains open.

Add each new workflow as a collapsed section containing its requirements, rules
and decisions.

<a id="wf-cs-01-add-a-session-to-an-existing-campaign"></a>
<details>
<summary><strong>WF-CS-01: Add a session to an existing campaign</strong></summary>

**Goal:** Record a session using campaign defaults, with changes when needed,
without repeatedly entering the same information.

**Scope:** Add session and calendar-date entry, using an existing campaign and
system. One-shots, creating campaigns or systems, editing, deleting and Quick Add
are separate workflows.

**Preconditions:** The app and its data are available, including a campaign and its
system. The current shared dataset requires no login.

**Successful outcome:** One session is saved with the selected campaign and final
values, remains available after reload, and leaves campaign defaults unchanged.

### Main workflow

[UML activity diagram](models.md#wf-cs-01-activity-diagram)

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Choose **Add session** or select a calendar date. | Open a new **Campaign session** form with Campaign unselected and Date set to today or the selected date. |
| 2 | Select a campaign. | Fill GM, System and Link from its defaults. |
| 3 | Review and adjust session details. | Allow changes to Date, GM, System, Link and Notes. |
| 4 | Choose **Save Session**. | Validate the data and prevent repeated submission while saving. |
| 5 | Wait for the result. | Save one session without changing campaign defaults or existing sessions. |
| 6 | Continue using the tracker. | Close the form, refresh the views and show **Session saved** after a successful refresh. |

Validation, cancellation and rejected-save outcomes are defined in the
[acceptance criteria](acceptance-criteria.md#saving-and-alternative-outcomes).
If no campaign exists, create one through the separate campaign workflow first.

### Agreed product decisions

| ID | Decision |
| --- | --- |
| Q-CS-01 | Selecting another campaign replaces GM, System and Link with that campaign's defaults, including edited values, without confirmation. Date and Notes are retained. |
| Q-CS-02 | Archived campaigns remain selectable when adding a session and are labeled **(archived)**. |
| Q-CS-03 | Future-dated sessions are allowed and count in statistics for the selected period even before their date. There is no played/planned distinction. |

## Functional requirements

**Must:** Required for correct recording and data integrity.
**Should:** A usability requirement that can be deferred without preventing
correct recording. Keep the agreed IDs and priorities when linking tests.

### Opening and completing the form

| ID | Requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CS-01 | The app must allow the owner to open a new-session form from **Add session** or by selecting a calendar date. | Must | Workflow step 1 |
| FR-CS-02 | A new-session form must start with Type set to **Campaign session**, no campaign selected, and GM, System, Link and Notes empty until a campaign is chosen. | Must | Workflow steps 1–2 |
| FR-CS-03 | The app must initially set Date to the owner's browser-local current date when opened through **Add session**, or to the selected date when opened from the calendar. | Must | Workflow step 1 |
| FR-CS-04 | The campaign selector must include existing active and archived campaigns and label archived entries **(archived)**. | Must | Q-CS-02 |
| FR-CS-05 | Selecting a campaign must fill GM, System and Link from its defaults, using a blank Link when the campaign has no default link. | Must | Workflow step 2 |
| FR-CS-06 | Switching to another campaign must replace GM, System and Link with the newly selected campaign's defaults, including previously edited values, without confirmation. It must retain Date and Notes. | Must | Q-CS-01 |
| FR-CS-07 | The owner must be able to override Date, GM, System, Link and Notes for the session, including choosing another existing system and clearing Link or Notes. | Must | Workflow step 3 |
| FR-CS-08 | A campaign session must be identified by its selected campaign's name without requiring or storing a separate session title. | Must | Workflow step 3 |
| FR-CS-09 | The app must accept valid past, current and future calendar dates for a session and reject missing or invalid dates. | Must | BR-CS-03; Q-CS-03 |
| FR-CS-10 | The session form should display the date as `dd/mm/yyyy`. | Should | Workflow date display |

### Validation, saving and outcomes

| ID | Requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CS-11 | Before creating a session, the app must validate that Campaign and System reference existing records, GM contains non-whitespace text, and any supplied Link is a complete HTTP or HTTPS address. Link and Notes must remain optional. | Must | Workflow step 4; BR-CS-02, BR-CS-06, BR-CS-07 |
| FR-CS-12 | A successful save must create one new session linked to the selected campaign using the final entered values, without changing the campaign's defaults or existing sessions. | Must | Workflow step 5 |
| FR-CS-13 | A saved session must remain available with its recorded values after the owner reloads the app. | Must | Project brief; successful outcome |
| FR-CS-14 | After a confirmed save and successful refresh, the app must close the form, update the calendar, session history and statistics, and show **Session saved**. Displayed records must respect the selected calendar month and active history filters. | Must | Workflow step 6 |
| FR-CS-15 | If validation fails, the app must create no session, retain the form and entered values, explain the invalid or missing input, and allow correction and resubmission. | Must | Validation failure |
| FR-CS-16 | Before saving starts, the owner must be able to close the form through its Close control or Escape, discarding the unsaved session without changing stored data. | Must | Cancellation |
| FR-CS-17 | If the save is rejected before a session is created, the app must retain the form and entered values, show the error, and allow correction or retry after the pending request ends. | Must | Rejected save |
| FR-CS-18 | While a session save is pending, repeated submissions from the form must not start additional session-save requests. | Must | Workflow step 4 |
| FR-CS-19 | A future-dated session must contribute to statistics for its recorded month and year even before its date, without a separate played/planned classification. | Must | Q-CS-03 |

## Business rules

| ID | Rule | Linked requirements |
| --- | --- | --- |
| BR-CS-01 | A campaign session belongs to an existing campaign and uses that campaign's name, with no separate session title. Archived campaigns are eligible and identified as archived when selected. | FR-CS-04, FR-CS-08, FR-CS-11 |
| BR-CS-02 | A campaign session requires a campaign, a valid date, a GM containing non-whitespace text and an existing game system. The selected system may differ from the campaign's default system. | FR-CS-07, FR-CS-09, FR-CS-11 |
| BR-CS-03 | A session date is a calendar date without a time of day. Valid past, current and future dates are permitted, including valid leap days. | FR-CS-03, FR-CS-09 |
| BR-CS-04 | Campaign GM, System and Link are starting defaults. The session's final values take precedence over those defaults; session overrides do not update the campaign. | FR-CS-05, FR-CS-07, FR-CS-12 |
| BR-CS-05 | Selecting a different campaign replaces GM, System and Link with its defaults without confirmation, including edited values. A missing default link replaces the previous link with blank. Date and Notes are retained. | FR-CS-06 |
| BR-CS-06 | Link is optional and may be cleared. A supplied link must be a complete HTTP or HTTPS address with a hostname; a different protocol or a missing hostname is invalid. | FR-CS-07, FR-CS-11 |
| BR-CS-07 | Notes are optional and may be entered, changed or cleared for this session. | FR-CS-07, FR-CS-11 |
| BR-CS-08 | A successful creation adds one session with its final values. It does not change campaign defaults or existing sessions, and the new record persists after reload. | FR-CS-12, FR-CS-13 |
| BR-CS-09 | A session contributes to statistics for its recorded month and year. Future dates do not exclude it from those totals; there is no separate played/planned classification. | FR-CS-19 |

## Open decision

**GAP-CS-01 — Uncertain save outcome or refresh failure:** Recovery is undefined
when a save response is lost or saving succeeds but refreshing fails. A session
may already exist. The expected message, form state and safe retry behavior still
need agreement.

FR-CS-17 covers a confirmed rejected save; FR-CS-18 covers repeated submission
while a request is pending. Neither resolves this gap. Future-session statistics
are included only for Q-CS-03; broader statistics coverage is outside this workflow.

<a id="campaign-session-follow-up"></a>
<details>
<summary><strong>Workflow follow-up</strong></summary>

Review actions recorded on 28 October 2026. Check an item when its decision or
evidence has been recorded in the linked document. Suggestions remain open until
agreed; existing requirements and priorities are unchanged.

- [x] Add a draft [UML activity diagram](models.md#wf-cs-01-activity-diagram).
- [ ] Resolve GAP-CS-01: distinguish a confirmed save followed by refresh failure
  from a lost response with an unknown save outcome. Agree on messages, form state
  and safe retry behavior, then update the requirements and acceptance criteria.
- [ ] Decide whether separate sessions for the same campaign and date are allowed.
  Recommendation: allow deliberate entries; distinguish them from accidental retries.
- [ ] Clarify Escape when a picker is open and whether closing is blocked while
  saving. Update FR-CS-16, FR-CS-18 and AC-CS-20/22 as needed after agreement.
- [ ] Decide whether to retain API fallback to campaign GM/System defaults when
  those values are omitted, and distinguish this from required form inputs.
  Clarify FR-CS-11 and the related criteria after agreement.
- [ ] Complete the [test plan](test-plan.md): version, browser, isolated dataset,
  UI/API scope, priorities and completion conditions.
- [ ] Write linked [test cases](test-records.md#test-cases) for defaults, overrides,
  campaign switching, validation, cancellation and rejected-save retry. Map and
  reuse existing automated checks where applicable.
- [ ] Record [execution results](test-records.md#execution-results), evidence,
  findings and retests against the selected app version.

</details>

## Sources

Scope: [Project brief](project-brief.md). Source reviews used `ff3ef38` and
`bc47cda` on 27 October 2026:

- [Session form](../../ttrpg_tracker/app/frontend/index.html): fields and labels.
- [Frontend](../../ttrpg_tracker/app/frontend/app.js): `openSessionDialog`,
  `today`, `applyCampaignDefaults`, `beginFormSave`, `saveSession` and `refreshLists`.
- [Backend](../../ttrpg_tracker/app/main.py): `SessionCreate`, `build_session` and
  `create_session`.

At those versions, the form closes before refreshing and save/refresh failures
share an error path. These source reviews are separate from test execution.

</details>

**Related documents:**

[Process and data models](models.md) · [Acceptance criteria](acceptance-criteria.md) · [Test records](test-records.md) ·
[Documentation checklist](README.md)
