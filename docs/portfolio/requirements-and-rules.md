# Requirements and rules

## Legend

IDs follow `type-area-number`: `FR-CS-01` means functional requirement, campaign
session, item 01. Add new abbreviations to this table when first introduced.

| Abbreviation | Meaning |
| --- | --- |
| ID | Identifier |
| WF | Workflow |
| FR | Functional requirement |
| BR | Business rule |
| AC | Acceptance criterion |
| Q | Product question or agreed decision |
| GAP | Unresolved gap or open decision |
| DEF | Defect record |
| RET | Retest record |
| SH | Shared workflow behavior |
| CS | Campaign session |
| OS | One-shot |
| SE | Session editing and deletion |
| CP | Campaign management |
| SY | Game system management |
| HI | Calendar and session history |
| ST | Statistics |
| DA | Data import and export |
| MA | Setup and maintenance |
| QA | Quick Add (workflow area) |
| GM | Game master |
| UI | User interface |
| API | Application programming interface |
| CSV | Comma-separated values |
| JSON | JavaScript Object Notation |
| UML | Unified Modeling Language |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | Hypertext Transfer Protocol Secure |

## Review status

| Area | Current status |
| --- | --- |
| Product decisions | **All 34 agreed**, 28 October 2026. My GM name remains excluded from record exports for now. |
| WF-CS-01 | Requirements and Must/Should priorities agreed; its existing business rules and acceptance criteria tentatively agreed. Detailed recovery remains open. |
| Other workflows and shared sections | Business-rule wording, main flows, detailed requirements and priorities are **drafts for review**, derived from the agreed decisions and cited sources. |
| Implementation and evidence | An agreed decision is not proof of a working feature. Each workflow's source section distinguishes current code from planned behavior. |

Review one workflow at a time: read its summary and main flow, then open its
business rules and requirements. Use the agreed decisions and source links for
context. Refer to IDs when commenting; existing IDs and agreed policy are
preserved.

<a id="workflow-index"></a>

<details>
<summary><strong>Workflow index · 31 workflows</strong></summary>

| Area | Workflow IDs |
| --- | --- |
| [Sessions](#area-sessions) | [WF-CS-01](#wf-cs-01) · [WF-OS-01](#wf-os-01) · [WF-CS-02](#wf-cs-02) · [WF-SE-01](#wf-se-01) · [WF-SE-02](#wf-se-02) |
| [Campaigns](#area-campaigns) | [WF-CP-01](#wf-cp-01) · [WF-CP-02](#wf-cp-02) · [WF-CP-03](#wf-cp-03) · [WF-CP-04](#wf-cp-04) · [WF-CP-05](#wf-cp-05) |
| [Game systems](#area-systems) | [WF-SY-01](#wf-sy-01) · [WF-SY-02](#wf-sy-02) · [WF-SY-03](#wf-sy-03) · [WF-SY-04](#wf-sy-04) |
| [Calendar and session history](#area-history) | [WF-HI-01](#wf-hi-01) · [WF-HI-02](#wf-hi-02) · [WF-HI-03](#wf-hi-03) · [WF-HI-04](#wf-hi-04) |
| [Statistics](#area-statistics) | [WF-ST-01](#wf-st-01) · [WF-ST-02](#wf-st-02) · [WF-ST-03](#wf-st-03) |
| [Import and export](#area-transfer) | [WF-DA-01](#wf-da-01) · [WF-DA-02](#wf-da-02) · [WF-DA-03](#wf-da-03) |
| [Setup and maintenance outside the app UI](#area-maintenance) | [WF-MA-01](#wf-ma-01) · [WF-MA-02](#wf-ma-02) · [WF-MA-03](#wf-ma-03) · [WF-MA-04](#wf-ma-04) · [WF-MA-05](#wf-ma-05) |
| [Planned workflows and improvements](#area-planned) | [WF-QA-01](#wf-qa-01) · [WF-CP-06](#wf-cp-06) |

</details>

<a id="shared"></a>

<details>
<summary><strong>Shared rules, requirements and review conventions</strong></summary>

These rules apply across the relevant browser/API workflows. Maintenance rules
are operational policies for the documented procedure; they do not imply that
in-app backup, restore or reset buttons exist.

<a id="shared-rules"></a>

<details>
<summary><strong>Shared business rules · draft</strong></summary>

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-SH-01 | One installation holds one owner's shared dataset; these workflows do not introduce separate user accounts or an app login. | [Project brief](project-brief.md); FR-SH-01 |
| BR-SH-02 | Browsing, inspecting, filtering, sorting, statistics and exports are read-only. Saving My GM name is a separate setting change and never rewrites session GM values. | FR-SH-01; [Q-ST-03](#wf-st-03-decisions) |
| BR-SH-03 | A confirmed write followed by a failed refresh is distinct from an unconfirmed write. Neither situation justifies automatically repeating the write or claiming an unverified rollback. | [Q-SH-01](#shared-decisions); FR-SH-04–05 |

</details>

<a id="shared-requirements"></a>

<details>
<summary><strong>Shared functional requirements · draft</strong></summary>

| ID | Draft functional requirement | Priority | Applies to |
| --- | --- | --- | --- |
| FR-SH-01 | Browsing, opening details, filtering, sorting, statistics and exports must leave stored records unchanged; saving My GM name is a separate write. | Must | Read-only workflows |
| FR-SH-02 | Before a form write, the app must validate required text, dates, existing references and supplied HTTP/HTTPS links as applicable; validation failures must explain the input and retain entered values. | Must | Session, campaign and system forms |
| FR-SH-03 | While a browser write is pending, repeating its action must not start another request for that operation. | Must | Create, edit, delete, archive, settings and import |
| FR-SH-04 | A confirmed rejected write must explain the business or input reason and retain a usable form or action context; cancellation before submission must leave stored data unchanged. | Must | Browser write workflows |
| FR-SH-05 | After a confirmed write, affected views must refresh before normal completion feedback. If refresh alone fails, explain that the write succeeded but the view is outdated. If the write response is lost, explain that its outcome is unknown. Neither case may trigger an automatic repeat write. Follow the agreed recovery principle Q-SH-01; creation-request identification still needs design. | Must | Browser write workflows; Q-SH-01; related gap GAP-CS-01 |

</details>

<a id="shared-decisions"></a>

<details>
<summary><strong>Agreed shared product decision</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-SH-01 | New write workflows share a recovery policy: refresh after a confirmed write without resubmitting it, and reconcile an unknown outcome before retry. Identifying creation requests for reconciliation still needs design. | Agreed |

</details>

<a id="source-conventions"></a>

<details>
<summary><strong>Sources and review conventions</strong></summary>

| Source | Use in this document |
| --- | --- |
| Owner decisions recorded on 28 October 2026 | Intended product policy. All 34 decision IDs remain agreed. |
| [Frontend](../../ttrpg_tracker/app/frontend/app.js) and [backend](../../ttrpg_tracker/app/main.py) at `f7fa230` | Current implementation inspected on 28 October 2026. Symbol names in each workflow locate the relevant code. Source inspection is not runtime evidence. |
| [Project brief](project-brief.md) and [data guide](../data-and-backups.md) | Scope and operational procedures. Note any discrepancy with the agreed decisions or current source. |
| [Build plan](../../ttrpg-plan.md) | Planned work and historical notes; older completion statements do not establish current feature availability. |
| Linked automated checks and [test records](test-records.md) | Candidate coverage and previously recorded evidence. No application tests, restore or reset operations were executed for this documentation review. |

**Must:** Required for the documented outcome or data integrity.
**Should:** A usability or presentation improvement that may be deferred.
Outside WF-CS-01 these priorities and detailed requirement wording remain drafts.

IDs keep their existing meaning and are not renumbered during restructuring.
New abbreviations belong in the legend. Numbers are unique within each area;
they need not appear in numerical order after later additions.
Evidence records use `DEF-number` and `RET-number`.

The recovery principle is agreed. Creation-request identification and detailed
recovery design still need work under [GAP-CS-01](#open-decision).

</details>

</details>

<a id="review-findings"></a>

<details>
<summary><strong>Review findings and remaining work</strong></summary>

The following differences were found by reading source and documentation.
They are follow-up work, not new product decisions or test results.

| Area | Finding and next work |
| --- | --- |
| Related-record creation | [WF-CS-02](#wf-cs-02), [WF-SY-02](#wf-sy-02) and [WF-SY-03](#wf-sy-03) use separate current requests. Implement the agreed rollback and clear errors; verify that only records created by the attempt are removed. |
| Session editing and system reuse | [Q-SE-02](#wf-se-01-decisions) requires a choice before applying another campaign's defaults. Current editing applies them immediately. New-system reuse also needs the explicit choice agreed in [Q-SY-03](#wf-sy-02-decisions). |
| History and statistics | Add the agreed session-ID tie ordering and visible tied highlights. Current sorting has no ID fallback; current highlights choose one leader. See [WF-HI-04](#wf-hi-04), [WF-ST-01](#wf-st-01) and [WF-ST-02](#wf-st-02). |
| Quick Add | [WF-QA-01](#wf-qa-01) is planned and absent from the current interface. Older build-plan completion notes are historical. |
| Recovery and deletion | The shared principle and deletion policy are agreed. Request identification, precise form state and recovery behavior still need design. [DEF-002](test-records.md#def-002-campaign-delete-feedback) remains reported, not reproduced or fixed by this review. |
| Backup and export documentation | The data guide assumes default storage and uses the ambiguous word “settings” for CSV. The current export includes campaign defaults but excludes My GM name. Custom-path guidance, compatibility checks and restore verification need refinement. |

New business rules are draft wording derived from existing policy and sources.
No new approval, implementation or test result is implied by adding them.

</details>

<a id="area-sessions"></a>

## Sessions

<a id="wf-cs-01-add-a-session-to-an-existing-campaign"></a>

<a id="wf-cs-01"></a>
<details>
<summary><strong>WF-CS-01: Add a session to an existing campaign</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Record a session using campaign defaults, with changes when needed, without repeatedly entering the same information. |
| **Scope** | Add session and calendar-date entry, using an existing campaign and system. One-shots, creating campaigns or systems, editing, deleting and Quick Add are separate workflows. |
| **Preconditions** | The app and its data are available, including a campaign and its system. The current shared dataset requires no login. |
| **Successful outcome** | One session is saved with the selected campaign and final values, remains available after reload, and leaves campaign defaults unchanged. |

<a id="wf-cs-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

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

</details>

<a id="wf-cs-01-rules"></a>

<details>
<summary><strong>Business rules · tentatively agreed</strong></summary>

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

</details>

<a id="wf-cs-01-requirements"></a>

<details>
<summary><strong>Functional requirements · agreed</strong></summary>

<a id="functional-requirements"></a>

**Must:** Required for correct recording and data integrity.
**Should:** A usability requirement that can be deferred without preventing
correct recording. Keep the agreed IDs and priorities when linking tests.

#### Opening and completing the form

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

#### Validation, saving and outcomes

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

</details>

<a id="wf-cs-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision |
| --- | --- |
| Q-CS-01 | Selecting another campaign replaces GM, System and Link with that campaign's defaults, including edited values, without confirmation. Date and Notes are retained. |
| Q-CS-02 | Archived campaigns remain selectable when adding a session and are labeled **(archived)**. |
| Q-CS-03 | Future-dated sessions are allowed and count in statistics for the selected period even before their date. There is no played/planned distinction. |

**Also applies:** [Q-SH-01](#shared-decisions).

</details>

<a id="wf-cs-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-CS-01](#wf-cs-01-decisions); [Q-CS-02](#wf-cs-01-decisions); [Q-CS-03](#wf-cs-01-decisions); [Q-SH-01](#shared-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `openSessionDialog`, `applyCampaignDefaults`, `saveSession`, `beginFormSave`, `refreshLists`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `SessionCreate`, `build_session`, `create_session`. |
| Supporting documents | [Project brief](project-brief.md); [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html); [Acceptance criteria](acceptance-criteria.md); [Process models](models.md). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current source supplies defaults and validates creation. The save path closes the form before refreshing, so confirmed-save/failed-refresh recovery still needs implementation design under GAP-CS-01. The original 27 October source review is retained below as historical context.

#### Historical source review

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

<a id="wf-cs-01-follow-up"></a>

<details>
<summary><strong>Recovery design and follow-up</strong></summary>

<a id="open-decision"></a>

**GAP-CS-01 — Recovery design details:** The shared principle Q-SH-01 is agreed:
refresh after a confirmed save without resubmitting it, and reconcile an unknown
outcome before retry. Creation-request identification, precise form state and
workflow-specific messages still need design and verification. A missing
response does not establish whether a session exists.

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
- [ ] Apply the agreed Q-SH-01 principle to GAP-CS-01: define creation-request
  identification, messages, form state and safe reconciliation before retry,
  then update the requirements and acceptance criteria.
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

</details>

</details>

<a id="wf-os-01"></a>

<details>
<summary><strong>WF-OS-01: Add a standalone one-shot</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Record a game that does not belong to a campaign. |
| **Scope** | Create a named one-shot through Add session or a calendar date, using an existing system. Creating a system is a separate workflow. |
| **Preconditions** | The app and its data are available, and a game system exists to select. |
| **Successful outcome** | One standalone session is saved with its name, date, GM, system and optional link and notes, remains available after reload, and appears in the relevant calendar, history and statistics views. |

<a id="wf-os-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Add session or select a calendar date, then choose One-shot. | Show the one-shot fields and use today or the selected date. |
| 2 | Enter its name, date and GM; select an existing system and optionally enter a link and notes. | Retain the entered one-shot values without selecting a campaign. |
| 3 | Choose Save Session. | Validate the fields and submit one standalone session. |
| 4 | Continue after confirmation. | Close the form, refresh affected views and show Session saved. |

</details>

<a id="wf-os-01-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-OS-01 | A one-shot is a named standalone session with no campaign association. | SessionCreate; build_session; [FR-OS-02–03](#wf-os-01-requirements) |
| BR-OS-02 | A one-shot requires a valid calendar date, nonblank GM and existing system. Link and Notes are optional; any supplied link must be a complete HTTP/HTTPS address. | build_session; web_link; [FR-OS-01–03](#wf-os-01-requirements) |
| BR-OS-03 | One-shot names and dates are not unique identifiers. Deliberate same-name or same-date entries are allowed; accidental request retries are handled separately. | [Q-OS-01](#wf-os-01-decisions); [FR-OS-03](#wf-os-01-requirements); [FR-SH-03](#shared-requirements) |

</details>

<a id="wf-os-01-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-OS-01 | The app must allow One-shot entry from Add session or a calendar date and initialize Date from that entry point. | Must | Step 1 |
| FR-OS-02 | A one-shot must require a name and GM containing non-whitespace text, a valid calendar date and an existing system; Link and Notes must be optional. | Must | Step 2; FR-SH-02 |
| FR-OS-03 | Saving must create one session with no campaign association and preserve its final values after reload. | Must | Step 3 |
| FR-OS-04 | The one-shot must appear by its name in the applicable calendar, history and statistics period; cancellation or confirmed rejection must create no session. | Must | Step 4; FR-SH-04 |

</details>

<a id="wf-os-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-OS-01 | Allow deliberate one-shots sharing a name or date; handle accidental request retries separately. | Agreed |

**Also applies:** [Q-SH-01](#shared-decisions).

</details>

<a id="wf-os-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-OS-01](#wf-os-01-decisions); [Q-SH-01](#shared-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `openSessionDialog`, `syncSessionKind`, `saveSession`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `SessionCreate`, `build_session`, `create_session`. |
| Supporting documents | [Project brief](project-brief.md); [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current source supports named standalone sessions; source inspection does not verify retry safety for an unknown creation outcome.

</details>

</details>

<a id="wf-cs-02"></a>

<details>
<summary><strong>WF-CS-02: Create a campaign while recording its first session</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Start tracking a new campaign without leaving the session form. |
| **Scope** | Use the New campaign option to create a campaign with defaults and record its first session. Creating a system is a separate workflow. |
| **Preconditions** | The session form is available, an existing system can be selected, and the proposed campaign name is not already in use. |
| **Successful outcome** | One campaign and its first linked session are saved with their entered values and remain available after reload. |

<a id="wf-cs-02-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open a new session and choose New campaign. | Show campaign name, default GM and session fields. |
| 2 | Enter campaign and session details using an existing system. | Keep campaign defaults and session values visible for review. |
| 3 | Choose Save Session. | Validate and save the campaign and first session; if the session cannot be saved, roll back the campaign created by this attempt and explain the failure. |
| 4 | Continue after both saves are confirmed. | Refresh campaigns and sessions, close the form and show completion. |

</details>

<a id="wf-cs-02-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-CS-10 | A new campaign must have a unique name, an effective nonblank default GM and an existing system. An explicitly entered default GM takes precedence over the initial session GM. | [Q-CS-05](#wf-cs-02-decisions); CampaignCreate; ensure_unique_name; [FR-CS-21](#wf-cs-02-requirements) |
| BR-CS-11 | The first session belongs to the newly created campaign. Its system and link establish the initial campaign defaults; its final recorded values remain session values. | [Q-CS-05](#wf-cs-02-decisions); [FR-CS-21–22](#wf-cs-02-requirements) |
| BR-CS-12 | Failure to save the first session must not leave the campaign created by that attempt behind. Rollback affects only newly created records; an unknown outcome must be reconciled before claiming rollback success. | [Q-CS-04](#wf-cs-02-decisions); [Q-SH-01](#shared-decisions); [FR-CS-23–24](#wf-cs-02-requirements) |

</details>

<a id="wf-cs-02-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CS-20 | The session form must offer New campaign without requiring navigation to Manage. | Must | Step 1 |
| FR-CS-21 | The app must derive the effective default GM under Q-CS-05 and validate that it is nonblank, the campaign name is not already in use, the system exists, any link is valid and the session inputs are valid before starting creation. | Must | Step 2; Q-CS-05 |
| FR-CS-22 | Successful completion must create one campaign and one session linked to it, preserving their respective final values after reload. | Must | Steps 3–4 |
| FR-CS-23 | If the first session cannot be saved, the app must roll back the campaign created by that attempt, retain entered values and clearly explain the failed session save and confirmed rollback. Existing campaigns must remain unchanged. An unknown outcome must be reconciled before retry or claiming rollback success. | Must | Step 3; Q-CS-04; Q-SH-01 |
| FR-CS-24 | Completion feedback must identify success only after both records are confirmed and affected views refresh. | Must | Step 4; FR-SH-05 |

</details>

<a id="wf-cs-02-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-CS-04 | If the first session cannot be saved, roll back the campaign created by that attempt and show a clear error message. Retain entered values for correction or retry; do not leave an unused new campaign behind. | Agreed |
| Q-CS-05 | Retain an explicitly entered default GM; if blank, use session GM. Use the initial session's system and link as campaign defaults. | Agreed |

**Also applies:** [Q-SH-01](#shared-decisions).

</details>

<a id="wf-cs-02-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-CS-04](#wf-cs-02-decisions); [Q-CS-05](#wf-cs-02-decisions); [Q-SH-01](#shared-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `saveSession`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `create_campaign`, `create_session`, `ensure_unique_name`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [Stability checks](../../.hallmark/stability-qa.mjs). |

**Source review:** Current frontend requests create the campaign and session separately and do not implement the agreed rollback. Existing retry checks exercise the earlier behavior and are not proof that the new rollback policy works.

</details>

</details>

<a id="wf-se-01"></a>

<details>
<summary><strong>WF-SE-01: Edit an existing campaign session or one-shot</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Correct or update a recorded session. |
| **Scope** | Edit one session through its form, including its date, GM, system, link, notes and campaign or one-shot details. Creating related records is covered by separate workflows. |
| **Preconditions** | The app is available and the session to edit exists. |
| **Successful outcome** | The existing session contains the saved changes after reload, relevant views reflect them, and no additional session is created. |

<a id="wf-se-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open a session from the calendar, agenda or history. | Populate Edit Session with its recorded values. |
| 2 | Change the required details, type or campaign. | Show fields for the selected type and offer an explicit choice to use the new campaign's defaults when changing campaigns. |
| 3 | Choose Save Changes. | Validate the final values and update the existing session. |
| 4 | Continue after confirmation. | Close the form and refresh affected views with the updated session. |

</details>

<a id="wf-se-01-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-SE-01 | Moving a session to another campaign or converting its type retains the same session ID. A campaign session has a campaign and no separate title; a one-shot has a name and no campaign. | [Q-SE-01](#wf-se-01-decisions); [FR-SE-01–03](#wf-se-01-requirements) |
| BR-SE-02 | During editing, another campaign's defaults are applied only after an explicit choice. The automatic replacement agreed for new-session entry does not apply to this editing policy. | [Q-SE-02](#wf-se-01-decisions); [Q-CS-01](#wf-cs-01-decisions); [FR-SE-03](#wf-se-01-requirements) |
| BR-SE-03 | Editing a session changes its recorded values, not campaign defaults or other sessions. Date changes move its contribution to the corresponding calendar and statistics periods. | update_session; [Q-CS-03](#wf-cs-01-decisions); [FR-SE-02–04](#wf-se-01-requirements) |

</details>

<a id="wf-se-01-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-SE-01 | Opening Edit Session must load the recorded type, campaign or name, date, GM, system, link and notes without replacing them with current campaign defaults. | Must | Step 1 |
| FR-SE-02 | Editing must allow moving between campaigns and converting between campaign session and one-shot; saving valid edits must retain the same session ID and create no additional session. | Must | Steps 2–3; Q-SE-01 |
| FR-SE-03 | A campaign session must reference an existing campaign and store no separate title; a one-shot must have a name and no campaign association. Changing campaigns during editing must offer an explicit choice before applying the new campaign defaults. | Must | Q-SE-01–02 |
| FR-SE-04 | Cancellation or confirmed rejection must retain the stored original; successful edits must refresh applicable calendar, history and statistics views. Campaign defaults must remain unchanged. | Must | Step 4; FR-SH-04 |

</details>

<a id="wf-se-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-SE-01 | Allow moving a session to another campaign or converting it between campaign session and one-shot while retaining the same session ID. | Agreed |
| Q-SE-02 | When changing campaigns during editing, offer an explicit choice to use the new campaign's defaults. Q-CS-01's automatic replacement applies to creation only. | Agreed |

**Also applies:** [Q-SH-01](#shared-decisions).

</details>

<a id="wf-se-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-SE-01](#wf-se-01-decisions); [Q-SE-02](#wf-se-01-decisions); [Q-SH-01](#shared-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `openSessionDialog`, `handleDocumentChange`, `applyCampaignDefaults`, `saveSession`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `SessionUpdate`, `update_session`, `build_session`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py); [Stability checks](../../.hallmark/stability-qa.mjs). |

**Source review:** The API supports type changes using the same record. Current campaign selection applies defaults immediately; the agreed explicit choice during editing is still an implementation gap.

</details>

</details>

<a id="wf-se-02"></a>

<details>
<summary><strong>WF-SE-02: Delete a session</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Remove an unwanted session from the tracker. |
| **Scope** | Delete one campaign session or one-shot after confirmation. Deleting its campaign or system is outside this workflow. |
| **Preconditions** | The app is available and the session to delete exists. |
| **Successful outcome** | The confirmed session is removed from stored data, calendar, history and statistics; its campaign and system remain available. |

<a id="wf-se-02-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Choose Delete for a session from history or its form. | Identify the session in a confirmation dialog and explain permanent removal. |
| 2 | Confirm Delete. | Submit one deletion and keep the action pending until its result is known. |
| 3 | Continue after confirmation. | Remove the session from affected views and show deletion success. |

</details>

<a id="wf-se-02-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-SE-04 | Session deletion is permanent under the current scope and requires deliberate confirmation. Undo is not part of this workflow. | [Q-SE-03](#wf-se-02-decisions); [FR-SE-05](#wf-se-02-requirements) |
| BR-SE-05 | Deleting a session removes only that record; its campaign, system and other sessions remain. | delete_session; [FR-SE-06–07](#wf-se-02-requirements) |
| BR-SE-06 | A confirmed deleted session no longer contributes to calendar, history or statistics. A missing response alone is not proof of deletion or of unchanged data. | [Q-SH-01](#shared-decisions); [FR-SE-08](#wf-se-02-requirements); [FR-SH-05](#shared-requirements) |

</details>

<a id="wf-se-02-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-SE-05 | Delete must identify the target session by name and date and require confirmation before sending a deletion request. | Must | Step 1 |
| FR-SE-06 | Confirmation must delete only the selected session; its campaign, system and other sessions must remain unchanged. | Must | Step 2 |
| FR-SE-07 | Cancel must send no deletion request, and confirmed rejection must retain the session with an actionable explanation. | Must | FR-SH-04 |
| FR-SE-08 | After confirmed deletion, the session must remain absent after reload and calendar, history and statistics must reflect its removal. | Must | Step 3 |

</details>

<a id="wf-se-02-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-SE-03 | Keep explicit confirmation for permanent session deletion. Undo requires a separate retention design and is outside the current scope. | Agreed |

**Also applies:** [Q-SH-01](#shared-decisions).

</details>

<a id="wf-se-02-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-SE-03](#wf-se-02-decisions); [Q-SH-01](#shared-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `requestDeleteSession`, `handleConfirmSubmit`, `deleteSession`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `delete_session`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current confirmation closes before the request result. The draft pending-context and uncertain-outcome behavior requires verification and may require changes.

</details>

</details>

<a id="area-campaigns"></a>

## Campaigns

<a id="wf-cp-01"></a>

<details>
<summary><strong>WF-CP-01: Create a campaign and set its session defaults</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Prepare a reusable campaign for recording sessions. |
| **Scope** | Create a campaign in Manage with its name, default GM, existing system, optional default link and archive status. Recording a session or creating a system is covered separately. |
| **Preconditions** | The app is available, a system exists to select, and the proposed campaign name is not already in use. |
| **Successful outcome** | One campaign is saved with its defaults, remains available after reload, and can be selected when recording a campaign session. |

<a id="wf-cp-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Manage → Campaigns with a new campaign form. | Show blank campaign details and an active status by default. |
| 2 | Enter a name and default GM, choose an existing system and optionally enter a default link or change archive status. | Retain the proposed defaults for review. |
| 3 | Choose Save Campaign. | Validate and create one campaign. |
| 4 | Continue after confirmation. | Refresh campaign choices, reset the form and show Campaign saved. |

</details>

<a id="wf-cp-01-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-CP-01 | Campaign names are unique after trimming, character normalization and case-insensitive comparison; every campaign has a nonblank default GM and an existing default system. | CampaignCreate; ensure_unique_name; [FR-CP-01–03](#wf-cp-01-requirements) |
| BR-CP-02 | A new campaign is active by default but may be created already archived. Archived status is not deletion. | [Q-CP-01](#wf-cp-01-decisions); [FR-CP-01](#wf-cp-01-requirements); [FR-CP-03](#wf-cp-01-requirements) |
| BR-CP-03 | Campaign defaults are reusable starting values. Creating a campaign creates no session and does not establish any play-statistics contribution. | create_campaign; [Q-CS-01](#wf-cs-01-decisions); [FR-CP-03–04](#wf-cp-01-requirements) |

</details>

<a id="wf-cp-01-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CP-01 | Manage must allow creation with name, default GM, existing system, optional default link and active/archived status. | Must | Steps 1–2; Q-CP-01 |
| FR-CP-02 | Name and default GM must contain non-whitespace text; the system must exist, any link must be valid HTTP/HTTPS, and campaign names must be unique after trimming, character normalization and case-insensitive comparison. | Must | Step 3; current backend validation |
| FR-CP-03 | Saving must create one campaign with its final defaults and status, create no session and retain it after reload. | Must | Steps 3–4 |
| FR-CP-04 | Reset before saving must discard form entries without writing; successful creation must refresh campaign choices and confirmed rejection must retain entered values. | Must | Step 4; FR-SH-04 |

</details>

<a id="wf-cp-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-CP-01 | Allow creating an already archived campaign; default new campaigns to active. | Agreed |

</details>

<a id="wf-cp-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-CP-01](#wf-cp-01-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `saveCampaign`, `clearCampaignForm`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `CampaignCreate`, `create_campaign`, `ensure_unique_name`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** The current form and backend support defaults and archive status. Inline creation of a new system is covered by WF-SY-03 and has a separate rollback gap.

</details>

</details>

<a id="wf-cp-02"></a>

<details>
<summary><strong>WF-CP-02: Edit a campaign and its session defaults</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Keep a campaign's details and defaults up to date. |
| **Scope** | Change an existing campaign's name, default GM, system or default link in Manage. Archive status changes have separate workflows. |
| **Preconditions** | The app is available and the campaign and selected system exist. Any replacement campaign name is not already used by another campaign. |
| **Successful outcome** | Updated campaign details persist and supply defaults for new sessions. Existing sessions retain their recorded GM, system, link and notes; their displayed campaign name follows the campaign's name. |

<a id="wf-cp-02-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Choose Edit for a campaign in Manage. | Load that campaign's name, defaults and current status. |
| 2 | Change its name or defaults. | Retain the final values for review without rewriting saved sessions. |
| 3 | Choose Save Campaign. | Validate and update the existing campaign. |
| 4 | Continue after confirmation. | Refresh campaign labels and choices and show Campaign saved. |

</details>

<a id="wf-cp-02-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-CP-04 | A campaign keeps its ID when renamed or when its defaults change. Its name must remain unique, excluding that campaign itself from the comparison. | update_campaign; ensure_unique_name; [FR-CP-05–06](#wf-cp-02-requirements) |
| BR-CP-05 | Existing sessions display the campaign's current name, while retaining their recorded GM, system, link and notes. | [Q-CP-02](#wf-cp-02-decisions); [FR-CP-07](#wf-cp-02-requirements) |
| BR-CP-06 | Saved default changes provide starting values for later session entry; they do not rewrite recorded session values. | [Q-CP-02](#wf-cp-02-decisions); update_campaign; [FR-CP-07–08](#wf-cp-02-requirements) |

</details>

<a id="wf-cp-02-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CP-05 | Edit must load the selected campaign's saved values and update that campaign's ID rather than create a new record. | Must | Steps 1, 3 |
| FR-CP-06 | Edited defaults must satisfy FR-CP-02, excluding the campaign itself from duplicate-name checking. | Must | Steps 2–3 |
| FR-CP-07 | New session entry must use the saved defaults; existing session GM, system, link and notes must remain unchanged. Campaign name display follows Q-CP-02. | Must | Step 4; Q-CP-02 |
| FR-CP-08 | Reset must leave the stored campaign unchanged, and a rejected save must retain edited values and explain the cause. | Must | FR-SH-04 |

</details>

<a id="wf-cp-02-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-CP-02 | Renaming a campaign updates its displayed name in existing history. Each session retains its recorded GM, system, link and notes. | Agreed |

</details>

<a id="wf-cp-02-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-CP-02](#wf-cp-02-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `editCampaign`, `saveCampaign`, `applyCampaignDefaults`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `update_campaign`, `session_read`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current relationships provide a live campaign name. The campaign update path does not update saved session GM, system, link or notes.

</details>

</details>

<a id="wf-cp-03"></a>

<details>
<summary><strong>WF-CP-03: Archive a campaign</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Mark a campaign as inactive while keeping its history. |
| **Scope** | Change one active campaign to archived. Deleting the campaign or its sessions is outside this workflow. |
| **Preconditions** | The app is available and the campaign exists and is active. |
| **Successful outcome** | The campaign remains archived after reload, its sessions are retained, and it remains selectable with the archived label when adding a session. |

<a id="wf-cp-03-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Find an active campaign in Manage and choose Archive. | Submit a status change for that campaign. |
| 2 | Wait for confirmation. | Save archived status while retaining its defaults and sessions. |
| 3 | Continue using the tracker. | Refresh status and campaign labels and show Campaign archived. |

</details>

<a id="wf-cp-03-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-CP-07 | Archiving changes campaign status, not its identity, defaults or linked sessions. Archived sessions continue to count in their recorded periods. | [Q-CP-03](#wf-cp-03-decisions); [Q-CS-03](#wf-cs-01-decisions); [FR-CP-09–11](#wf-cp-03-requirements) |
| BR-CP-08 | Archived campaigns remain selectable for new sessions and are identified as archived. | [Q-CS-02](#wf-cs-01-decisions); [FR-CP-11](#wf-cp-03-requirements) |
| BR-CP-09 | Archive and Unarchive are reversible status changes and require no confirmation under the agreed policy. | [Q-CP-03](#wf-cp-03-decisions); [FR-CP-09](#wf-cp-03-requirements); [FR-CP-12](#wf-cp-03-requirements) |

</details>

<a id="wf-cp-03-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CP-09 | An active campaign must offer Archive and change only the selected campaign's archive status. | Must | Steps 1–2 |
| FR-CP-10 | Archiving must retain campaign details, defaults and all linked sessions, including their contributions to calendar, history and statistics. | Must | Step 2 |
| FR-CP-11 | Archived status must persist after reload and the session selector must retain the campaign with an archived label. | Must | Step 3; agreed Q-CS-02 |
| FR-CP-12 | A rejected archive request must leave the confirmed status intact and explain the failure without reporting success. | Must | FR-SH-04–05 |

</details>

<a id="wf-cp-03-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-CP-03 | Archive and Unarchive take effect without confirmation because they are reversible; give clear feedback. Deletion remains separately confirmed. | Agreed |

**Also applies:** [Q-CS-02](#wf-cs-01-decisions).

</details>

<a id="wf-cp-03-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-CP-03](#wf-cp-03-decisions); [Q-CS-02](#wf-cs-01-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `toggleCampaignArchive`, `campaignOptionLabel`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `update_campaign`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current source changes archive status directly and keeps campaigns in the session selector. Pending-request and failure branches are not established by source review alone.

</details>

</details>

<a id="wf-cp-04"></a>

<details>
<summary><strong>WF-CP-04: Reactivate an archived campaign</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Resume tracking an inactive campaign as active. |
| **Scope** | Change one archived campaign back to active without recreating it. |
| **Preconditions** | The app is available and the campaign exists and is archived. |
| **Successful outcome** | The campaign remains active after reload, its archived label is removed, and its defaults and recorded sessions are retained. |

<a id="wf-cp-04-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Find an archived campaign in Manage and choose Unarchive. | Submit an active-status change for that campaign. |
| 2 | Wait for confirmation. | Save active status without changing defaults or sessions. |
| 3 | Continue using the tracker. | Refresh status and labels and show Campaign active. |

</details>

<a id="wf-cp-04-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-CP-10 | Reactivation changes an archived campaign to active while retaining its ID and history. | [Q-CP-03](#wf-cp-03-decisions); [FR-CP-13–14](#wf-cp-04-requirements) |
| BR-CP-11 | Campaign defaults and recorded session values survive reactivation unchanged. | update_campaign; [FR-CP-14](#wf-cp-04-requirements) |
| BR-CP-12 | Reactivation does not create another campaign or any session. Repeating a pending action must not toggle the status back inadvertently. | [Q-CP-03](#wf-cp-03-decisions); [FR-SH-03](#shared-requirements); [FR-CP-13–16](#wf-cp-04-requirements); [FR-SH-03](#shared-requirements) |

</details>

<a id="wf-cp-04-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CP-13 | An archived campaign must offer Unarchive and update the same campaign to active status. | Must | Steps 1–2; Q-CP-03 |
| FR-CP-14 | Reactivation must preserve the campaign's defaults and all recorded session values. | Must | Step 2 |
| FR-CP-15 | Active status must persist after reload and the archived label must be removed from applicable campaign choices. | Must | Step 3 |
| FR-CP-16 | A rejected reactivation request must retain the confirmed archived status and provide actionable feedback. | Must | FR-SH-04–05 |

</details>

<a id="wf-cp-04-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

**Also applies:** [Q-CP-03](#wf-cp-03-decisions).

</details>

<a id="wf-cp-04-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-CP-03](#wf-cp-03-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `toggleCampaignArchive`, `campaignOptionLabel`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `update_campaign`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** The current toggle sends an explicit status update. Protection against repeated browser actions still needs targeted verification.

</details>

</details>

<a id="wf-cp-05"></a>

<details>
<summary><strong>WF-CP-05: Delete a campaign with no sessions</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Remove an unused campaign. |
| **Scope** | Delete one campaign after confirmation. Campaigns with linked sessions are protected from deletion and can be archived instead. |
| **Preconditions** | The app is available and the campaign exists with no linked sessions. |
| **Successful outcome** | The confirmed campaign is removed from stored data and campaign selectors; systems and other campaigns and sessions are retained. |

<a id="wf-cp-05-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Choose Delete for a campaign with no linked sessions. | Identify the campaign and explain permanent removal in a confirmation dialog. |
| 2 | Review the target and confirm Delete. | Submit one deletion; the server rechecks that no sessions reference the campaign. |
| 3 | Continue after confirmed deletion. | Refresh campaign choices and show Campaign deleted. |

**Alternative path:** If sessions exist, preserve the campaign and its sessions
and explain the restriction. The improved presentation is proposed in
[WF-CP-06](#wf-cp-06-improve-blocked-campaign-deletion); see reported
[DEF-002](test-records.md#def-002-campaign-delete-feedback).

</details>

<a id="wf-cp-05-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-CP-13 | A campaign is eligible for deletion only when no sessions reference it. The server checks current relationships; an empty browser view is not authoritative. | [Q-CP-04](#wf-cp-05-decisions); delete_campaign; [FR-CP-17–18](#wf-cp-05-requirements) |
| BR-CP-14 | Deleting an eligible campaign removes only that campaign. No linked-session cascade or automatic archive is part of Delete. | [Q-CP-04](#wf-cp-05-decisions); [Q-CP-06](#wf-cp-06-decisions); [FR-CP-19](#wf-cp-05-requirements) |
| BR-CP-15 | A linked campaign is retained even when archived. Archive is a separately chosen status change, not an alternative effect of confirming Delete. | [Q-CP-04](#wf-cp-05-decisions), [Q-CP-05](#wf-cp-06-decisions), [Q-CP-06](#wf-cp-06-decisions); [FR-CP-18](#wf-cp-05-requirements); [FR-CP-21](#wf-cp-05-requirements) |

</details>

<a id="wf-cp-05-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CP-17 | Deleting an empty campaign must require confirmation identifying that campaign; Cancel must send no deletion request. | Must | Steps 1–2 |
| FR-CP-18 | The server must reject deletion whenever sessions reference the campaign, even when the browser's data is stale; the rejection must preserve the campaign and sessions. | Must | Step 2; Q-CP-04 |
| FR-CP-19 | Successful deletion must remove only the selected empty campaign and leave systems, other campaigns and all sessions unchanged. | Must | Steps 2–3 |
| FR-CP-20 | Confirmed deletion must persist after reload and refresh campaign choices without showing an unavailable campaign as selectable. | Must | Step 3 |
| FR-CP-21 | A confirmed linked-session rejection must explain that the campaign cannot be deleted while it has sessions and direct the owner to Archive; it must not be presented as a connectivity error. | Must | Alternative path; DEF-002; proposed WF-CP-06 |

</details>

<a id="wf-cp-05-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-CP-04 | Keep campaign deletion blocked while sessions reference it. Deleting a campaign must not delete its sessions; any future bulk deletion needs a separate scope and confirmation. | Agreed |

**Also applies:** [Q-CP-05](#wf-cp-06-decisions); [Q-CP-06](#wf-cp-06-decisions).

</details>

<a id="wf-cp-05-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-CP-04](#wf-cp-05-decisions); [Q-CP-05](#wf-cp-06-decisions); [Q-CP-06](#wf-cp-06-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `requestDeleteCampaign`, `handleConfirmSubmit`, `deleteCampaign`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `delete_campaign`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html); [DEF-002](test-records.md#def-002-campaign-delete-feedback). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** The backend currently rejects linked-campaign deletion with HTTP 409. The browser still offers Delete for every campaign and closes confirmation before the result; see WF-CP-06 and DEF-002.

</details>

</details>

<a id="area-systems"></a>

## Game systems

<a id="wf-sy-01"></a>

<details>
<summary><strong>WF-SY-01: Add a game system in Manage</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Make a game system available for campaigns and sessions. |
| **Scope** | Create a system in Manage with a name and primary color. Creating a campaign or session is outside this workflow. |
| **Preconditions** | The app is available and the proposed system name is not already in use. |
| **Successful outcome** | One system is saved with its name and color, remains available after reload, and appears among system choices. |

<a id="wf-sy-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Manage → Systems with a new-system form. | Show a blank name and a suggested primary color. |
| 2 | Enter the name and review or change the color. | Retain both values for review. |
| 3 | Choose Save System. | Validate and save one system. |
| 4 | Continue after confirmation. | Refresh system choices, clear the form and show System saved. |

</details>

<a id="wf-sy-01-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-SY-01 | A game system has a nonblank, normalized unique name and a primary color expressed as six hexadecimal digits. | SystemCreate; ensure_unique_name; hex_color; [FR-SY-01–02](#wf-sy-01-requirements) |
| BR-SY-02 | Different systems may intentionally share a primary color; uniqueness applies to names, not colors. | [Q-SY-01](#wf-sy-01-decisions); [FR-SY-01–02](#wf-sy-01-requirements) |
| BR-SY-03 | Creating a reusable system does not create a campaign or session. Campaign and session shades derive from their associated systems. | create_system; sessionColor; campaignColor; [FR-SY-03](#wf-sy-01-requirements) |

</details>

<a id="wf-sy-01-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-SY-01 | Manage must allow creating a system with a nonblank name and valid six-digit hexadecimal primary color. | Must | Steps 1–3; backend validation |
| FR-SY-02 | System names must be unique after trimming, character normalization and case-insensitive comparison across all creation entry points. | Must | Step 3; backend validation |
| FR-SY-03 | Successful creation must persist one system and make it selectable for campaigns and sessions without creating either record. | Must | Steps 3–4 |
| FR-SY-04 | Clear must discard unsaved form values without a write, and a rejected save must retain entered values for correction. | Must | Step 4; FR-SH-04 |

</details>

<a id="wf-sy-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-SY-01 | Suggest distinct system colors where possible, but allow intentionally shared colors. System names remain unique. | Agreed |

</details>

<a id="wf-sy-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-SY-01](#wf-sy-01-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `saveSystem`, `suggestSystemColor`, `renderSystems`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `SystemCreate`, `create_system`, `ensure_unique_name`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current source validates names and color syntax and suggests colors. The business policy permits an explicitly chosen shared color.

</details>

</details>

<a id="wf-sy-02"></a>

<details>
<summary><strong>WF-SY-02: Add a game system from the session form</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Record a session using a system that is not yet in the tracker. |
| **Scope** | Enter a new system name and primary color within the session form and use that system when saving the session. Session creation or editing is covered by its parent workflow. |
| **Preconditions** | A session form is open, the other required session details are available, and the proposed system name is not already in use. |
| **Successful outcome** | The new system is saved, the successfully saved session references it, and the system is available for later campaigns and sessions. |

<a id="wf-sy-02-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Choose the new-system option while completing a session. | Show a system name and suggested primary color within the form. |
| 2 | Enter the new system and complete the session. | Validate the system and parent session inputs. |
| 3 | Save the session. | Save the system and its parent session; if the parent cannot be saved, roll back only the newly created system and clearly explain the failure. |
| 4 | Continue after confirmation. | Show the saved session and make the system available for reuse. |

</details>

<a id="wf-sy-02-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-SY-04 | A proposed system whose normalized name already exists must be explicitly offered for reuse without creating a duplicate or changing its color. | [Q-SY-03](#wf-sy-02-decisions); [FR-SY-06–07](#wf-sy-02-requirements) |
| BR-SY-05 | A failed parent-session save must not leave a system created only for that attempt behind; existing systems and previously stored parent values are protected. | [Q-SY-02](#wf-sy-02-decisions); [FR-SY-08](#wf-sy-02-requirements) |
| BR-SY-06 | The successfully saved session references one reusable system by ID. Unknown outcomes are reconciled before retry or a claim that rollback succeeded. | [Q-SY-02](#wf-sy-02-decisions); [Q-SH-01](#shared-decisions); [FR-SY-07–08](#wf-sy-02-requirements) |

</details>

<a id="wf-sy-02-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-SY-05 | The session form must expose new-system name and color fields only when the new-system option is selected. | Must | Step 1 |
| FR-SY-06 | New-system values must satisfy FR-SY-01–02, and other required session values must be validated before creation starts. | Must | Step 2 |
| FR-SY-07 | Successful completion must save one reusable system and link the saved session to its ID without recoloring or renaming existing systems. | Must | Steps 3–4 |
| FR-SY-08 | If the parent session cannot be saved, the app must roll back only the system created by that attempt, retain entered values and clearly explain the failed parent save and confirmed rollback. Existing systems must remain unchanged; reconcile unknown outcomes before retry or claiming rollback success. | Must | Q-SY-02–03; Q-SH-01 |

</details>

<a id="wf-sy-02-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-SY-02 | If a parent session or campaign cannot be saved, roll back only the new system created by that attempt and show a clear error message. Keep existing systems and the parent's previously stored values unchanged. | Agreed |
| Q-SY-03 | When a proposed system name already exists, explicitly offer that existing system without creating a duplicate or changing its color. | Agreed |

**Also applies:** [Q-SH-01](#shared-decisions).

</details>

<a id="wf-sy-02-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-SY-02](#wf-sy-02-decisions); [Q-SY-03](#wf-sy-02-decisions); [Q-SH-01](#shared-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `resolveSessionSystemId`, `saveSession`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `create_system`, `create_session`, `update_session`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [Stability checks](../../.hallmark/stability-qa.mjs). |

**Source review:** Current source creates the system before saving the parent and implements no rollback. Duplicate names are rejected by the server rather than offered for explicit reuse in this new-system path.

</details>

</details>

<a id="wf-sy-03"></a>

<details>
<summary><strong>WF-SY-03: Add a game system from the campaign form</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Set up a campaign using a system that is not yet in the tracker. |
| **Scope** | Enter a new system name and primary color within the campaign form in Manage and use it when saving the campaign. Campaign creation or editing is covered by its parent workflow. |
| **Preconditions** | A campaign form is available, the other required campaign details are entered, and the proposed system name is not already in use. |
| **Successful outcome** | The new system is saved, the successfully saved campaign uses it as its default system, and it is available for later selections. |

<a id="wf-sy-03-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Type a system name while creating or editing a campaign in Manage. | Match an existing system, or show a primary color for a new name. |
| 2 | Review the system and complete the campaign. | Validate system values and the parent campaign inputs. |
| 3 | Choose Save Campaign. | Reuse or create the system and save its campaign association; if the campaign cannot be saved, roll back only the newly created system and clearly explain the failure. |
| 4 | Continue after confirmation. | Refresh the campaign and make any new system available for reuse. |

</details>

<a id="wf-sy-03-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-SY-07 | A matched existing system is reused without changing its saved name or color; a new name must satisfy the same uniqueness and color rules as standalone creation. | [Q-SY-03](#wf-sy-02-decisions); [FR-SY-01–02](#wf-sy-01-requirements); [FR-SY-09–10](#wf-sy-03-requirements) |
| BR-SY-08 | If the parent campaign cannot be saved, only the system created by that attempt is rolled back; existing systems and the campaign's previously stored values remain unchanged. | [Q-SY-02](#wf-sy-02-decisions); [FR-SY-12](#wf-sy-03-requirements) |
| BR-SY-09 | A saved campaign references the selected system as its default; this does not replace the actual systems recorded in existing sessions. | [Q-CP-02](#wf-cp-02-decisions); update_campaign; [FR-SY-11–12](#wf-sy-03-requirements) |

</details>

<a id="wf-sy-03-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-SY-09 | The campaign form must accept an existing system name or allow entering a new name and primary color without leaving Manage → Campaigns. | Must | Step 1 |
| FR-SY-10 | Matching an existing system must reuse its ID without changing its name or color; creating a new system must satisfy FR-SY-01–02. | Must | Steps 1–3; Q-SY-03 |
| FR-SY-11 | Successful completion must associate the saved campaign with the selected system and retain the new system after reload. | Must | Steps 3–4 |
| FR-SY-12 | If the parent campaign cannot be saved, the app must roll back only the system created by that attempt, retain entered values and clearly explain the failed campaign save and confirmed rollback. Previously stored campaign values and existing systems must remain unchanged; unknown outcomes require reconciliation. | Must | Q-SY-02; Q-SH-01 |

</details>

<a id="wf-sy-03-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

**Also applies:** [Q-SY-02](#wf-sy-02-decisions); [Q-SY-03](#wf-sy-02-decisions); [Q-CP-02](#wf-cp-02-decisions).

</details>

<a id="wf-sy-03-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-SY-02](#wf-sy-02-decisions); [Q-SY-03](#wf-sy-02-decisions); [Q-CP-02](#wf-cp-02-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `systemByName`, `resolveCampaignSystemId`, `saveCampaign`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `create_system`, `create_campaign`, `update_campaign`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current source reuses a typed existing name automatically and creates a new system before saving the campaign. Explicit reuse confirmation and rollback need implementation work under the agreed policy.

</details>

</details>

<a id="wf-sy-04"></a>

<details>
<summary><strong>WF-SY-04: Edit a game system's name or primary color</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Update how a game system is named or displayed. |
| **Scope** | Edit an existing system's name or primary color in Manage. Campaign and session colors are derived from their systems rather than set separately. |
| **Preconditions** | The app is available and the system exists. Any replacement name is not already used by another system. |
| **Successful outcome** | The updated name and color persist, linked records keep their system association, and affected names and colors refresh in the views. |

<a id="wf-sy-04-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Choose Edit for a system in Manage. | Load the saved name and primary color. |
| 2 | Change the name or color and choose Save System. | Validate the final values and update the same system. |
| 3 | Continue after confirmation. | Refresh system labels, color previews and affected session and campaign displays. |

</details>

<a id="wf-sy-04-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-SY-10 | Editing a system retains its ID and all campaign/session associations; the normalized name remains unique among other systems. | [Q-SY-04](#wf-sy-04-decisions); ensure_unique_name; [FR-SY-13–14](#wf-sy-04-requirements) |
| BR-SY-11 | A system name or color change updates historical displays that reference that system rather than taking a per-session name/color snapshot. | [Q-SY-04](#wf-sy-04-decisions); [FR-SY-15](#wf-sy-04-requirements) |
| BR-SY-12 | A session's display color follows its actual system, which may differ from its campaign's default system. Colors may intentionally be shared. | [Q-SY-01](#wf-sy-01-decisions); sessionColor; campaignColor; [FR-SY-15](#wf-sy-04-requirements) |

</details>

<a id="wf-sy-04-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-SY-13 | Edit must load and update the selected system's existing ID without creating another system. | Must | Steps 1–2 |
| FR-SY-14 | Edited name and color must satisfy FR-SY-01–02, excluding the edited system itself from duplicate-name checks. | Must | Step 2 |
| FR-SY-15 | Updated values must persist and affected labels, primary colors and derived shades must refresh while campaign and session system IDs remain unchanged. | Must | Step 3; Q-SY-04 |
| FR-SY-16 | Clear or confirmed rejection must leave the stored system intact; rejected edits must remain available for correction. | Must | FR-SH-04 |

</details>

<a id="wf-sy-04-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-SY-04 | System name and color changes update historical displays while preserving campaign and session system associations. | Agreed |

**Also applies:** [Q-SY-01](#wf-sy-01-decisions).

</details>

<a id="wf-sy-04-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-SY-04](#wf-sy-04-decisions); [Q-SY-01](#wf-sy-01-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `editSystem`, `saveSystem`, `sessionColor`, `campaignColor`, `deriveCampaignColor`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `update_system`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current source derives displayed names and colors from shared systems. Editing a system does not rewrite stored session-to-system or campaign-to-system IDs.

</details>

</details>

<a id="area-history"></a>

## Calendar and session history

<a id="wf-hi-01"></a>

<details>
<summary><strong>WF-HI-01: Browse the calendar or mobile agenda</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | See recorded sessions by date. |
| **Scope** | Browse previous and next months or return to the current month, using the calendar grid or mobile agenda. Adding or editing a session is separate. |
| **Preconditions** | The app and its data are available; the selected month may contain sessions or be empty. |
| **Successful outcome** | The selected month and its sessions, or its empty state, are displayed without changing stored data. |

<a id="wf-hi-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Calendar. | Display the selected month, month title and session count. |
| 2 | Choose Previous month, Next month or Today. | Change the displayed month and update its sessions. |
| 3 | Review dates and sessions on desktop or a narrow screen. | Present a calendar grid or mobile agenda with appropriate empty-state feedback. |

</details>

<a id="wf-hi-01-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-HI-01 | A session belongs to its recorded calendar date without a time-of-day conversion; the browser-local current month is used by Today. | [BR-CS-03](#wf-cs-01-rules); renderCalendar; [FR-HI-01–02](#wf-hi-01-requirements) |
| BR-HI-02 | The monthly count and agenda include only the selected month. Adjacent-month grid cells do not add to that month's count. | renderCalendar; [FR-HI-02–04](#wf-hi-01-requirements) |
| BR-HI-03 | Calendar and agenda are views of the same records. Navigation or a responsive layout change creates no session and changes no recorded date. | [FR-SH-01](#shared-requirements); [FR-HI-03–04](#wf-hi-01-requirements) |

</details>

<a id="wf-hi-01-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-HI-01 | Calendar must support previous/next month navigation and Today must return to the browser-local current month. | Must | Steps 1–2 |
| FR-HI-02 | Calendar sessions must appear on their recorded dates; the agenda must list only the selected month's sessions in chronological order. | Must | Step 3 |
| FR-HI-03 | Narrow-screen users must be able to browse the selected month's sessions through the mobile agenda and open a listed session. | Must | Step 3; WF-HI-02 |
| FR-HI-04 | The month title, session count and empty-state message must agree with the selected month without changing stored data. | Must | Steps 1–3; FR-SH-01 |

</details>

<a id="wf-hi-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

No additional workflow-specific decision. The shared read-only requirement [FR-SH-01](#shared-requirements) applies.

</details>

<a id="wf-hi-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `renderCalendar`, `moveCalendar`, `initialCalendarMonth`, `groupSessionsByDate`. |
| Supporting documents | [Project brief](project-brief.md); [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [Browser checks](../../.hallmark/qa.mjs). |

**Source review:** Current source computes the grid and agenda from recorded dates. Browsing and responsive presentation are not evidence that every date boundary has been tested.

</details>

</details>

<a id="wf-hi-02"></a>

<details>
<summary><strong>WF-HI-02: Open a session to view its details</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Inspect the recorded details of a session. |
| **Scope** | Open a session from the calendar, agenda or session history in the existing session form. Saving changes and deleting are separate workflows. |
| **Preconditions** | The app is available and the session exists and is visible in the current view. |
| **Successful outcome** | The selected session's recorded values are visible; closing the form without saving leaves stored data unchanged. |

<a id="wf-hi-02-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Select a session chip or agenda entry, or choose Edit in history. | Open the selected record in the session form. |
| 2 | Inspect its recorded details. | Show type, campaign or one-shot name, date, GM, system, link and notes. |
| 3 | Close the form without saving. | Return to the previous view without a write. |

</details>

<a id="wf-hi-02-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-HI-04 | Session details belong to the selected record ID, regardless of its position in a sorted or filtered view. | openSessionDialog; [FR-HI-05](#wf-hi-02-requirements); [FR-HI-08](#wf-hi-02-requirements) |
| BR-HI-05 | Inspection shows recorded session values, not replacements from current campaign defaults. | openSessionDialog; [BR-CS-04](#wf-cs-01-rules); [FR-HI-06](#wf-hi-02-requirements) |
| BR-HI-06 | Opening and closing details without a save is read-only; deletion and editing require their own explicit actions. | [FR-SH-01](#shared-requirements); [WF-SE-01](#wf-se-01), [WF-SE-02](#wf-se-02); [FR-HI-07](#wf-hi-02-requirements) |

</details>

<a id="wf-hi-02-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-HI-05 | Calendar, agenda and history entry points must open the session identified by the selected record ID. | Must | Step 1 |
| FR-HI-06 | The form must display recorded session values rather than replacing them with the campaign's current defaults. | Must | Step 2 |
| FR-HI-07 | Closing an unsaved details form through Close or Escape must send no create, update or delete request. | Must | Step 3 |
| FR-HI-08 | A session that is no longer available must produce a clear unavailable-record message rather than open another session or fabricate details. | Must | Alternative outcome; FR-SH-01 |

</details>

<a id="wf-hi-02-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

No additional workflow-specific decision. The shared read-only requirement [FR-SH-01](#shared-requirements) applies.

</details>

<a id="wf-hi-02-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `openSessionDialog`, `handleDocumentClick`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [Browser checks](../../.hallmark/qa.mjs); [Stability checks](../../.hallmark/stability-qa.mjs). |

**Source review:** Details currently open in the editable session form. The missing-record recovery requirement is a draft; source inspection does not establish a graceful missing-record path.

</details>

</details>

<a id="wf-hi-03"></a>

<details>
<summary><strong>WF-HI-03: Search and filter session history</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Find sessions matching the owner's interests. |
| **Scope** | Search session history and combine or clear campaign, one-shot, GM and system filters. Sorting results is a separate workflow. |
| **Preconditions** | The app's data is loaded and Session history is expanded. |
| **Successful outcome** | History displays only matching sessions, or a no-results message; clearing the search and filters restores the full list without changing stored records. |

<a id="wf-hi-03-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Expand Session history. | Show the history table and search/filter controls. |
| 2 | Enter search text or select campaign, one-shots, GM or system filters. | Combine active conditions and display matching sessions. |
| 3 | Review the results. | Retain matching rows or show No sessions found. |
| 4 | Clear the search and return filters to All. | Restore the complete history in the current sort order. |

</details>

<a id="wf-hi-03-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-HI-07 | Text search covers campaign/one-shot name, GM, system and recorded date; notes and links are excluded. | [Q-HI-01](#wf-hi-03-decisions); [FR-HI-09–10](#wf-hi-03-requirements) |
| BR-HI-08 | A result must satisfy the search text and every active filter. Selecting One-shots means sessions with no campaign association. | filteredSessions; [FR-HI-09](#wf-hi-03-requirements); [FR-HI-11](#wf-hi-03-requirements) |
| BR-HI-09 | History is independent of the calendar month and only its own search and filters constrain the results; clearing them restores complete history. | [Q-HI-02](#wf-hi-03-decisions); [FR-HI-11–12](#wf-hi-03-requirements) |

</details>

<a id="wf-hi-03-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-HI-09 | History must offer text search plus campaign, one-shot, GM and system filtering, including All choices to clear filters. | Must | Steps 1–2 |
| FR-HI-10 | Search must match campaign/one-shot name, GM, system and recorded `yyyy-mm-dd` date without case sensitivity; notes and links are excluded under the proposed scope. | Must | Q-HI-01 |
| FR-HI-11 | A session must satisfy the text search and every active filter to be displayed; history must remain independent of calendar-month selection. | Must | Step 2; Q-HI-02 |
| FR-HI-12 | No matches must show a clear empty state; clearing all conditions must restore complete history without changing records or current sorting. | Must | Steps 3–4 |

</details>

<a id="wf-hi-03-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-HI-01 | Search campaign/one-shot names, GMs, systems and recorded dates. Exclude notes and links for now. | Agreed |
| Q-HI-02 | Keep session history independent of the selected calendar month; constrain it only with its own search and filters. | Agreed |

</details>

<a id="wf-hi-03-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-HI-01](#wf-hi-03-decisions); [Q-HI-02](#wf-hi-03-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `renderFilters`, `filteredSessions`, `renderSessions`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [Browser checks](../../.hallmark/qa.mjs). |

**Source review:** Current source searches the stored yyyy-mm-dd date and combines the conditions with AND. It does not search Notes or Link.

</details>

</details>

<a id="wf-hi-04"></a>

<details>
<summary><strong>WF-HI-04: Sort session history</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Review session history in a useful order. |
| **Scope** | Sort the visible history by Date, Campaign / One-shot, GM or System and change the sort direction while retaining active filters. |
| **Preconditions** | Session history is expanded and matching sessions are available to display. |
| **Successful outcome** | Matching rows appear in the selected order without changing stored session values or the current filters. |

<a id="wf-hi-04-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Session history and optionally apply filters. | Display the matching rows in the current order. |
| 2 | Select the Date, Campaign / One-shot, GM or System column heading. | Sort matching rows by that value. |
| 3 | Select the same heading again. | Reverse the direction and retain search and filters. |

</details>

<a id="wf-hi-04-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-HI-10 | Date order is chronological; text comparison ignores case and handles numeric text consistently. | compareSessions; [FR-HI-13–14](#wf-hi-04-requirements) |
| BR-HI-11 | Equal primary sort values use session ID as a stable secondary order. | [Q-HI-03](#wf-hi-04-decisions); [FR-HI-17](#wf-hi-04-requirements) |
| BR-HI-12 | Sorting changes only result order, retaining the same active search, filters and stored records. | [FR-SH-01](#shared-requirements); setSort; [FR-HI-15–16](#wf-hi-04-requirements) |

</details>

<a id="wf-hi-04-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-HI-13 | History must allow sorting by Date, Campaign / One-shot, GM and System. | Must | Step 2 |
| FR-HI-14 | Date sorting must be chronological; text sorting must compare names without case sensitivity and handle numeric text consistently. | Must | Step 2; current comparator |
| FR-HI-15 | Selecting the current sort column again must reverse direction without changing search, filters or stored values. | Must | Step 3 |
| FR-HI-16 | The current sort column and direction should be visible to the owner. | Should | Step 3 |
| FR-HI-17 | When primary sort values are equal, the app must use session ID as a stable secondary ordering so tied rows do not move unpredictably after refresh. | Must | Q-HI-03 |

</details>

<a id="wf-hi-04-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-HI-03 | Use session ID as a stable secondary sort order when the selected sort values are equal. | Agreed |

</details>

<a id="wf-hi-04-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-HI-03](#wf-hi-04-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `setSort`, `compareSessions`, `renderSessions`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [Browser checks](../../.hallmark/qa.mjs). |

**Source review:** The current comparator returns zero for equal primary values and has no explicit session-ID fallback. The agreed secondary ordering still needs implementation.

</details>

</details>

<a id="area-statistics"></a>

## Statistics

<a id="wf-st-01"></a>

<details>
<summary><strong>WF-ST-01: View statistics for a selected month</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Understand session activity within a month. |
| **Scope** | Select a month in Monthly Stats and review its session total, campaign and system breakdowns, most-played group and favorite system. |
| **Preconditions** | The app and its session data are available; the selected month may contain sessions or be empty. |
| **Successful outcome** | Statistics reflect sessions dated in the selected month, or an empty state is shown, without changing stored data. |

<a id="wf-st-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Stats → Monthly. | Display the selected month and its statistics. |
| 2 | Choose a month in the month picker. | Recalculate totals and breakdowns using sessions dated in that month. |
| 3 | Review totals, most-played group, favorite system and charts. | Display the matching figures or explain that the month has no sessions. |

</details>

<a id="wf-st-01-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-ST-01 | Every session counts once in its recorded month, including future dates, without a separate played/planned classification. History filters do not constrain monthly statistics. | [Q-CS-03](#wf-cs-01-decisions); renderMonthlyStats; [FR-ST-01–02](#wf-st-01-requirements) |
| BR-ST-02 | Campaign totals group standalone sessions as One-shots; system totals use each session's actual system, not its campaign default. | renderMonthlyStats; groupedCountRows; [FR-ST-03](#wf-st-01-requirements) |
| BR-ST-03 | Equal highest counts are ties and must not imply a sole favorite system or most-played group. | [Q-ST-01](#wf-st-01-decisions); [FR-ST-04](#wf-st-01-requirements) |

</details>

<a id="wf-st-01-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-ST-01 | Monthly Stats must support selecting a month and year and clearly identify the selected period. | Must | Steps 1–2 |
| FR-ST-02 | Each session dated in the selected month must count once, including future-dated sessions; calendar/history filters must not constrain these totals. | Must | Step 2; agreed Q-CS-03 |
| FR-ST-03 | Monthly totals must agree with campaign and system breakdowns; standalone sessions must be grouped as One-shots in the campaign breakdown. | Must | Step 3 |
| FR-ST-04 | A month with no sessions must show a clear empty state; tied most-played groups or favorite systems must be identified as ties rather than presented as a sole winner. | Must | Step 3; Q-ST-01 |

</details>

<a id="wf-st-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-ST-01 | Identify ties in favorite systems, most-played groups and busiest months rather than implying a sole winner. | Agreed |

**Also applies:** [Q-CS-03](#wf-cs-01-decisions).

</details>

<a id="wf-st-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-ST-01](#wf-st-01-decisions); [Q-CS-03](#wf-cs-01-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `renderMonthlyStats`, `groupedCountRows`, `setStatsMonth`. |
| Supporting documents | [Project brief](project-brief.md); [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [Browser checks](../../.hallmark/qa.mjs). |

**Source review:** Current source counts monthly records and groups one-shots, but highlight tiles take the first sorted group and do not explain a tie.

</details>

</details>

<a id="wf-st-02"></a>

<details>
<summary><strong>WF-ST-02: View the Year Review for a selected year</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Understand annual play activity and highlights. |
| **Scope** | Select an available year and review totals, monthly activity, campaign, system and GM breakdowns, busiest month and longest break. Configuring My GM name is covered separately. |
| **Preconditions** | The app and its session data are available, and Year Review is open. |
| **Successful outcome** | The selected year's recorded sessions determine its statistics and highlights, or an empty state is shown, without changing data. |

<a id="wf-st-02-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Stats → Year Review. | Display the selected year and available year choices. |
| 2 | Choose a year. | Select sessions dated in that year and recalculate the review. |
| 3 | Review annual totals, twelve monthly totals, breakdowns and highlights. | Show consistent figures, or an empty state when the year has no sessions. |

</details>

<a id="wf-st-02-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-ST-04 | The annual total includes each session dated in that year once, including future dates, and equals the sum of its twelve monthly counts. | [Q-CS-03](#wf-cs-01-decisions); monthlyCountRows; [FR-ST-05–06](#wf-st-02-requirements) |
| BR-ST-05 | Longest Break is elapsed calendar days between consecutive recorded dates within the selected year, excluding boundary gaps; fewer than two sessions gives zero. | [Q-ST-02](#wf-st-02-decisions); [FR-ST-07](#wf-st-02-requirements) |
| BR-ST-06 | Busiest-month and most-played highlights identify all tied leaders rather than implying a sole winner. | [Q-ST-01](#wf-st-01-decisions); [FR-ST-07–08](#wf-st-02-requirements) |

</details>

<a id="wf-st-02-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-ST-05 | Year Review must offer the current year and years containing sessions, including future years with recorded sessions. | Must | Steps 1–2 |
| FR-ST-06 | Annual totals must count each session dated in that year once and equal the sum of the twelve displayed monthly counts. | Must | Steps 2–3; Q-CS-03 |
| FR-ST-07 | The review must provide campaign, system and GM breakdowns plus busiest-month, most-played and longest-break highlights; identify highlight ties and calculate Longest Break using Q-ST-01–02. | Must | Step 3; Q-ST-01–02 |
| FR-ST-08 | An empty year must show an empty state and allow changing year or configuring My GM name without creating or changing session records. | Must | Step 3; WF-ST-03 |

</details>

<a id="wf-st-02-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-ST-02 | Longest Break is elapsed calendar days between consecutive recorded session dates within the selected year, excluding gaps to year boundaries. Fewer than two sessions gives zero. | Agreed |

**Also applies:** [Q-ST-01](#wf-st-01-decisions); [Q-CS-03](#wf-cs-01-decisions).

</details>

<a id="wf-st-02-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-ST-01](#wf-st-01-decisions); [Q-ST-02](#wf-st-02-decisions); [Q-CS-03](#wf-cs-01-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `renderYearReview`, `reviewYearOptions`, `monthlyCountRows`, `longestGapLabel`. |
| Supporting documents | [Project brief](project-brief.md); [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [Browser checks](../../.hallmark/qa.mjs). |

**Source review:** Current source computes annual/monthly counts and the agreed within-year gap. Highlight selection still chooses one leader without reporting ties.

</details>

</details>

<a id="wf-st-03"></a>

<details>
<summary><strong>WF-ST-03: Set or change My GM name and compare games run versus played</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Compare sessions the owner ran as GM with sessions joined as a player. |
| **Scope** | Select, change or clear My GM name in Year Review and view the resulting comparison for the selected year. Renaming recorded GMs is separate. |
| **Preconditions** | Year Review is open and tracker settings are available. A GM name is available to select, or a previous selection can be cleared. |
| **Successful outcome** | The choice persists and the annual comparison updates using it; clearing the choice returns the panel to its unconfigured state. Recorded session GM values remain unchanged. |

<a id="wf-st-03-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Year Review and find My GM name. | Offer names already used by sessions or campaign defaults, plus any saved choice. |
| 2 | Select a name, choose another name or clear the selection. | Validate and save the setting while preventing overlapping changes. |
| 3 | Review Games I Ran vs. Played. | Use the confirmed choice to update the selected year's comparison, or prompt for a name when cleared. |

</details>

<a id="wf-st-03-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-ST-07 | My GM name is one shared dataset setting, not a separate user account. A choice comes from existing session GMs, campaign defaults or the previously saved choice; it may be cleared. | TrackerSettings; update_tracker_settings; [FR-ST-09](#wf-st-03-requirements); [FR-ST-11](#wf-st-03-requirements) |
| BR-ST-08 | Within the selected year, normalized names matching the choice count as Ran; other sessions count as Played. This assumes the owner attended every recorded game. | [Q-ST-03](#wf-st-03-decisions); [FR-ST-10](#wf-st-03-requirements) |
| BR-ST-09 | Changing or clearing the choice never rewrites recorded GMs. Clearing leaves the comparison unconfigured rather than asserting that every session was played. | update_tracker_settings; ranPlayedPanel; [FR-ST-11–12](#wf-st-03-requirements) |

</details>

<a id="wf-st-03-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-ST-09 | My GM name must accept a listed existing name or an empty selection, and reject an unrelated arbitrary name. | Must | Steps 1–2; current settings validation |
| FR-ST-10 | Matching must normalize character forms, trim surrounding spaces and ignore case; matching selected-year sessions count as Ran and the remainder as Played under Q-ST-03. | Must | Step 3; Q-ST-03 |
| FR-ST-11 | The confirmed choice must persist after reload without rewriting session GM values; clearing it must hide the comparison and ask for a choice. | Must | Steps 2–3 |
| FR-ST-12 | On a rejected setting change, the previous confirmed selection must remain authoritative and the panel must explain the error and allow retry. | Must | FR-SH-03–05 |

</details>

<a id="wf-st-03-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-ST-03 | For the owner's attended-game dataset, sessions whose GM matches My GM name count as Ran; all others count as Played. Multiple aliases or unattended games require a separate model. | Agreed |

</details>

<a id="wf-st-03-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-ST-03](#wf-st-03-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `saveOwnerGm`, `renderYearReview`, `ranPlayedPanel`, `gmNameKey`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `TrackerSettings`, `update_tracker_settings`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |
| Existing checks · not executed for this review | [Settings checks](../../ttrpg_tracker/app/tests/test_tracker_settings.py); [Owner-GM browser checks](../../.hallmark/owner-gm-qa.mjs). |

**Source review:** Current source saves a single shared choice and preserves recorded GMs. Existing automated checks are references, not new execution evidence.

</details>

</details>

<a id="area-transfer"></a>

## Import and export

<a id="wf-da-01"></a>

<details>
<summary><strong>WF-DA-01: Export tracker data to CSV</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Save a portable copy of the tracker data. |
| **Scope** | Use Export CSV in Manage to download sessions, campaigns and systems, including links, notes and campaign defaults. Tracker settings and a full database backup are outside this export's scope. |
| **Preconditions** | The app and its data are available, and the browser can save the downloaded file. |
| **Successful outcome** | A tracker CSV export is saved locally with the exported records; stored tracker data is unchanged. |

<a id="wf-da-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Manage and choose Export CSV. | Read the current systems, campaigns and sessions. |
| 2 | Save the offered file. | Provide a tracker CSV containing those records and their relationships. |
| 3 | Keep the file for transfer or later import. | Leave the tracker data unchanged. |

</details>

<a id="wf-da-01-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-DA-01 | Record export includes all systems, campaigns and sessions, including archived campaigns and dates outside any current view or filter. | export_payload; export_csv; [FR-DA-01–02](#wf-da-01-requirements) |
| BR-DA-02 | CSV preserves record relationships and supported field values, but excludes My GM name for now. It is not a full database backup. | [Q-DA-01](#wf-da-01-decisions); [FR-DA-02–04](#wf-da-01-requirements) |
| BR-DA-03 | Export is read-only; a CSV transfer must not change source records or treat browser filters as the export scope. | [FR-SH-01](#shared-requirements); [FR-DA-01](#wf-da-01-requirements); [FR-DA-04](#wf-da-01-requirements) |

</details>

<a id="wf-da-01-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-DA-01 | Export CSV must provide all recorded systems, campaigns and sessions, including archived campaigns and sessions outside the current calendar, filters or statistics period. | Must | Step 1 |
| FR-DA-02 | The CSV must retain names, dates, relationships, colors, defaults, archive status, links and notes, including non-Latin text, quotes, commas and line breaks. | Must | Step 2; current export fields |
| FR-DA-03 | The CSV format must be accepted by the tracker import workflow, including valid exports from an empty tracker. | Must | Step 3; WF-DA-02 |
| FR-DA-04 | Export must not change stored data, must report a failed download request and must not imply that My GM name or the full database is included. | Must | FR-SH-01; Q-DA-01 |

</details>

<a id="wf-da-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-DA-01 | Exclude My GM name from CSV and JSON record exports for now. Full database backups retain it; adding export portability can be considered later. | Agreed |

</details>

<a id="wf-da-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-DA-01](#wf-da-01-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `downloadExport`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `export_payload`, `export_csv`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html); [Data and backup guide](../data-and-backups.md). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py); [CSV-import checks](../../ttrpg_tracker/app/tests/test_csv_import.py). |

**Source review:** Current CSV code excludes tracker settings. The data guide's word “settings” is ambiguous: the export contains campaign defaults, not My GM name. The agreed exclusion takes precedence.

</details>

</details>

<a id="wf-da-02"></a>

<details>
<summary><strong>WF-DA-02: Preview and import new records from a tracker CSV export</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Add saved tracker records while keeping existing records and settings. |
| **Scope** | Select a tracker CSV export, preview additions, duplicates and issues, then confirm importing new records. Replacing the complete database is separate. |
| **Preconditions** | The app is available and a tracker CSV export can be selected. Applying an import requires a valid preview that still matches the current data and a writable location for the automatic backup. |
| **Successful outcome** | A backup is saved before additions, new records are imported, duplicates are skipped, and existing records and settings are retained. The imported records remain available after reload. |

<a id="wf-da-02-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Open Import CSV in Manage and select a tracker export. | Enable preview for the selected file. |
| 2 | Choose Preview file. | Validate rows and display proposed additions, existing records, duplicates, warnings and errors without writing. |
| 3 | Review the preview and choose Import new records when allowed. | Recheck preview freshness and validation, then save a pre-import backup before adding records. |
| 4 | Continue after confirmation. | Commit the additions, refresh views and show imported counts while keeping existing records and settings. |

</details>

<a id="wf-da-02-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-DA-04 | Import adds records without overwriting existing values or tracker settings. External numeric IDs identify rows in the file, not destination database identities. | [Q-DA-02](#wf-da-02-decisions); plan_csv_import; [FR-DA-08–09](#wf-da-02-requirements) |
| BR-DA-05 | Session duplicate handling compares date, normalized campaign/one-shot identity, GM and system plus occurrence counts, preserving deliberate multiplicity and existing notes/links. | [Q-DA-03](#wf-da-02-decisions); [FR-DA-09](#wf-da-02-requirements) |
| BR-DA-06 | Preview is read-only and applies only while its file and underlying record data remain unchanged. Any invalid row prevents application. | import_preview; import_revision; apply_csv_import; [FR-DA-05–07](#wf-da-02-requirements) |
| BR-DA-07 | All additions commit together, and a successful automatic record backup precedes additions. Backup failure prevents writes; that JSON record backup is not a complete database backup. | save_import_backup; apply_csv_import; [Q-DA-01](#wf-da-01-decisions); [FR-DA-08](#wf-da-02-requirements) |

</details>

<a id="wf-da-02-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-DA-05 | Preview must accept the tracker CSV format, enforce the current 5,000,000-byte file limit in the browser and show row-specific problems without writing data. | Must | Steps 1–2 |
| FR-DA-06 | Preview must distinguish additions, existing records and duplicates and permit import only when no validation errors exist and at least one new record is present. | Must | Step 2 |
| FR-DA-07 | If the file or underlying record data changes after preview, applying the stale preview must be blocked and a new preview required. | Must | Step 3 |
| FR-DA-08 | Before additions, the app must save the automatic record backup; backup failure must prevent import. Import additions must commit together and preserve existing records and tracker settings. | Must | Steps 3–4; Q-DA-02 |
| FR-DA-09 | Matching and duplicate handling must follow the agreed identity/multiplicity policy; success must show added counts and persist the records, while a failed apply must require another preview before retry. | Must | Step 4; Q-DA-03 |

The automatic JSON record backup is not a full database backup and does not
include My GM name. It has no in-app restore action.

</details>

<a id="wf-da-02-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-DA-02 | Keep import add-only: explain conflicts and retain existing values. Use a database restore for exact-state recovery. | Agreed |
| Q-DA-03 | Compare occurrence counts by date, campaign/one-shot identity, GM and system so reimport preserves deliberate identical sessions without repeatedly adding them. Retain existing notes and links. | Agreed |

**Also applies:** [Q-DA-01](#wf-da-01-decisions).

</details>

<a id="wf-da-02-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-DA-02](#wf-da-02-decisions); [Q-DA-03](#wf-da-02-decisions); [Q-DA-01](#wf-da-01-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `previewCsvImport`, `applyCsvImport`, `renderCsvImportPreview`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `plan_csv_import`, `import_revision`, `save_import_backup`, `apply_csv_import`. |
| Supporting documents | [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html); [Data and backup guide](../data-and-backups.md). |
| Existing checks · not executed for this review | [CSV-import checks](../../ttrpg_tracker/app/tests/test_csv_import.py); [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current backend validates and commits imports together. It also limits a file to 10,000 records and 5,000,000 encoded bytes; these implementation limits are not new product decisions.

</details>

</details>

<a id="wf-da-03"></a>

<details>
<summary><strong>WF-DA-03: Export tracker data to JSON through the API</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Obtain tracker records in a machine-readable format. |
| **Scope** | Request JSON from `/api/export` and optionally save the response. Settings export and full database recovery are outside this endpoint's scope. |
| **Preconditions** | The running app's API and its data are accessible through a browser or API client. |
| **Successful outcome** | A JSON response contains the recorded systems, campaigns and sessions, and stored tracker data is unchanged. |

<a id="wf-da-03-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Request `/api/export` from the running app. | Read current system, campaign and session records. |
| 2 | Inspect or save the JSON response. | Return the record collections with their recorded values and relationships. |
| 3 | Keep the response for external use. | Leave the stored dataset unchanged. |

</details>

<a id="wf-da-03-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-DA-08 | JSON record export contains all systems, campaigns and sessions with their relationships, without calendar, history or statistics filtering. | export_payload; export_json; [FR-DA-10–11](#wf-da-03-requirements) |
| BR-DA-09 | My GM name is excluded for now. Record JSON is not a full database copy and has no supported in-app JSON restore workflow. | [Q-DA-01](#wf-da-01-decisions); [FR-DA-13](#wf-da-03-requirements) |
| BR-DA-10 | Reading the export is not a write and does not change records or settings, including when collections are empty. | [FR-SH-01](#shared-requirements); [FR-DA-12](#wf-da-03-requirements) |

</details>

<a id="wf-da-03-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-DA-10 | `/api/export` must return JSON collections named systems, campaigns and sessions, including archived campaigns and all recorded dates. | Must | Steps 1–2 |
| FR-DA-11 | Records must retain identifiers, relationships and exported values without losing names, non-Latin characters, links or notes; empty collections must remain valid JSON lists. | Must | Step 2 |
| FR-DA-12 | JSON export must be read-only and return an error response if the request cannot be completed. | Must | Steps 1–3; FR-SH-01 |
| FR-DA-13 | Documentation must state that this endpoint excludes tracker settings and is not a full database backup or a supported in-app JSON restore workflow. | Must | Q-DA-01; current endpoint scope |

</details>

<a id="wf-da-03-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

**Also applies:** [Q-DA-01](#wf-da-01-decisions).

</details>

<a id="wf-da-03-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-DA-01](#wf-da-01-decisions) — owner agreement on 28 October 2026. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `export_json`, `export_payload`. |
| Supporting documents | [Data and backup guide](../data-and-backups.md). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current /api/export returns the three record collections and excludes tracker settings; this endpoint is separate from the CSV download button.

</details>

</details>

<a id="area-maintenance"></a>

## Setup and maintenance outside the app UI

<a id="wf-ma-01"></a>

<details>
<summary><strong>WF-MA-01: Start the app for the first time with demo sessions</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Explore the tracker using fictional example data. |
| **Scope** | Launch a new installation with the supplied demo source enabled, following Getting started. Switching an existing dataset to demo data is separate. |
| **Preconditions** | The project is downloaded, its Python or Docker environment is ready, and the database has not previously been initialized. |
| **Successful outcome** | The app opens in a browser with the fictional demo sessions available in their recorded months and retained after reload. |

<a id="wf-ma-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Prepare a new installation using Getting started and keep the demo source enabled. | Make the application files and fictional source data available. |
| 2 | Start the app with the documented Python or Docker method. | Initialize storage and load the supplied demo into an empty dataset. |
| 3 | Open the app and browse a demo month. | Display fictional campaigns, systems and sessions. |
| 4 | Reload or restart after exploring. | Retain the initialized records without adding another copy. |

</details>

<a id="wf-ma-01-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-MA-01 | Demo seeding applies only when no system, campaign or session records exist and the configured demo source is available. | startup; [FR-MA-01–02](#wf-ma-01-requirements) |
| BR-MA-02 | Starting with an already populated dataset must not append demo copies or overwrite personal records. | startup; [FR-MA-03](#wf-ma-01-requirements) |
| BR-MA-03 | The supplied examples are fictional records with their own historical dates; an empty current month does not mean the demo failed to load. | project README; supplied demo source; [FR-MA-02](#wf-ma-01-requirements); [FR-MA-04](#wf-ma-01-requirements) |

</details>

<a id="wf-ma-01-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-MA-01 | Getting started must identify the supported Python and Docker launch paths and how to open the app. | Must | Steps 1–3; project README |
| FR-MA-02 | With an empty dataset and enabled supplied demo source, initialization must load its fictional sessions with their campaign/system relationships and recorded dates. | Must | Steps 2–3; startup source |
| FR-MA-03 | Restarting with an already populated dataset must not append another demo copy or overwrite recorded changes. | Must | Step 4; startup source |
| FR-MA-04 | The setup guide should identify the demo's date range so an initially empty current calendar does not imply that loading failed. | Should | Step 3; project README |

</details>

<a id="wf-ma-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

No additional workflow-specific decision. The shared read-only requirement [FR-SH-01](#shared-requirements) applies.

</details>

<a id="wf-ma-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `startup`, `import_seed_data`. |
| Supporting documents | [Getting started](../../README.md#getting-started); [Docker storage configuration](../../ttrpg_tracker/docker-compose.yml); [Fictional demo source](../../ttrpg_tracker/app/import_source/demo_sessions.csv); [Data and backup guide](../data-and-backups.md). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** Current startup checks whether record tables contain data; it does not use a permanent “first launch completed” marker. Keep demo seeding disabled when an empty dataset must stay empty.

</details>

</details>

<a id="wf-ma-02"></a>

<details>
<summary><strong>WF-MA-02: Start the app for the first time without demo sessions</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Begin recording personal games in an empty tracker. |
| **Scope** | Disable the demo source before the first launch, then start a new installation using the data guide. Clearing an existing dataset is separate. |
| **Preconditions** | The project and its Python or Docker environment are ready, the database has not been initialized, and the demo source is disabled. |
| **Successful outcome** | The app opens with no demo games loaded and is ready for the owner's systems, campaigns and sessions; demo data stays disabled on restart. |

<a id="wf-ma-02-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | App response |
| --- | --- | --- |
| 1 | Before first launch, follow the data guide to rename the demo source. | The default demo file is no longer available for automatic loading. |
| 2 | Start a new installation using Python or Docker. | Initialize storage without demo records. |
| 3 | Open the tracker. | Show empty views with access to system, campaign and session creation. |
| 4 | Keep the demo source disabled on later restarts. | Retain the owner's dataset without loading the demo. |

</details>

<a id="wf-ma-02-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-MA-04 | Disabling the demo source prevents later automatic seeding; it does not remove records already imported. | data guide; startup; [FR-MA-05](#wf-ma-02-requirements); [FR-MA-08](#wf-ma-02-requirements) |
| BR-MA-05 | A new empty tracker has no demo systems, campaigns or sessions; required systems and campaigns are created through their own workflows. | startup; [WF-SY-01](#wf-sy-01); [WF-CP-01](#wf-cp-01); [FR-MA-06–07](#wf-ma-02-requirements) |
| BR-MA-06 | The demo source must remain disabled while the owner expects an empty dataset to stay empty across restarts. | startup; data guide; [FR-MA-08](#wf-ma-02-requirements) |

</details>

<a id="wf-ma-02-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-MA-05 | The data guide must identify the supplied demo source and explain how to disable it before first launch. | Must | Step 1 |
| FR-MA-06 | Starting with no records and no enabled demo source must create usable storage without adding demo systems, campaigns or sessions. | Must | Step 2 |
| FR-MA-07 | Empty views must support beginning with system or campaign setup and must not present the absence of sessions as a load failure. | Must | Step 3 |
| FR-MA-08 | The guide must explain that disabling the source does not remove existing imported records and that it must stay disabled to prevent later seeding into an empty dataset. | Must | Step 4; data guide |

</details>

<a id="wf-ma-02-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

No additional workflow-specific decision. The shared read-only requirement [FR-SH-01](#shared-requirements) applies.

</details>

<a id="wf-ma-02-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `startup`. |
| Supporting documents | [Getting started](../../README.md#getting-started); [Data and backup guide](../data-and-backups.md); [Fictional demo source](../../ttrpg_tracker/app/import_source/demo_sessions.csv). |

**Source review:** The current guide describes renaming the source before launch. Source inspection confirms that absence of the enabled source prevents seeding into an empty dataset.

</details>

</details>

<a id="wf-ma-03"></a>

<details>
<summary><strong>WF-MA-03: Make a full database backup</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Preserve a complete saved version of the tracker for later recovery. |
| **Scope** | Stop the app, copy its database to a separate backup location using the Python or Docker instructions, then restart the app. |
| **Preconditions** | The database exists, the owner can stop the app and access its storage, and a backup location is available. |
| **Successful outcome** | A separate copy of the stopped database is saved, and the app resumes with its current records and settings unchanged. |

<a id="wf-ma-03-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | Procedure / app response |
| --- | --- | --- |
| 1 | Identify the database used by the active Python or Docker installation and choose a backup destination. | The data guide distinguishes the local file from Docker's stored database. |
| 2 | Stop the app before copying. | Database writes stop. |
| 3 | Copy the complete database to the chosen destination under a distinct filename. | A separate saved version is available without modifying the source. |
| 4 | Check that the copy exists and restart the app. | The current dataset remains available. |

</details>

<a id="wf-ma-03-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-MA-07 | A complete backup is a copy of the active database, including tracker settings. Python and Docker storage, and custom configured paths, may differ. | database configuration; data guide; [Q-DA-01](#wf-da-01-decisions); [FR-MA-09](#wf-ma-03-requirements); [FR-MA-11](#wf-ma-03-requirements) |
| BR-MA-08 | The documented manual-copy procedure stops the app before copying and preserves the active original. | data guide; [FR-MA-10](#wf-ma-03-requirements) |
| BR-MA-09 | Backup versions use dated names outside the project or active Docker storage. A record export or pre-import JSON file is not a substitute for a full database backup. | [Q-MA-01](#wf-ma-03-decisions); [Q-DA-01](#wf-da-01-decisions); [FR-MA-11–12](#wf-ma-03-requirements) |

</details>

<a id="wf-ma-03-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-MA-09 | The backup procedure must identify the active database location for both Python and Docker, including how custom storage configuration changes that location. | Must | Step 1; data guide and configured database path |
| FR-MA-10 | The procedure must require the app to be stopped before copying the full database and must retain the original database. | Must | Steps 2–3 |
| FR-MA-11 | The guide must distinguish a full database copy, which includes tracker settings, from CSV and JSON record exports that exclude My GM name. | Must | Step 3; Q-DA-01 |
| FR-MA-12 | The procedure must use a dated backup filename outside the project or active Docker storage and require checking that the separate copy exists before restart; proving that it can be restored belongs to the restore workflow. | Must | Step 4; Q-MA-01 |

</details>

<a id="wf-ma-03-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-MA-01 | Keep dated manual backup files outside the project or active Docker storage. Automatic scheduling and retention remain separate work. | Agreed |

**Also applies:** [Q-DA-01](#wf-da-01-decisions).

</details>

<a id="wf-ma-03-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-MA-01](#wf-ma-03-decisions); [Q-DA-01](#wf-da-01-decisions) — owner agreement on 28 October 2026. |
| Supporting documents | [Data and backup guide](../data-and-backups.md); [Docker storage configuration](../../ttrpg_tracker/docker-compose.yml); [Getting started](../../README.md#getting-started). |

**Source review:** This is a manual operational policy, not an in-app backup feature. The current guide assumes default storage and advises distinct filenames; custom-path details and a dated naming example still need refinement.

</details>

</details>

<a id="wf-ma-04"></a>

<details>
<summary><strong>WF-MA-04: Restore a full database backup</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Return the tracker to a previously saved database state. |
| **Scope** | Stop the app, replace its database with a saved database copy using the data guide, then restart. This replaces the current records and settings. |
| **Preconditions** | A usable full database backup exists, the owner has chosen to replace the current dataset and preserved a copy of it, and the app can be stopped and its storage accessed. |
| **Successful outcome** | The app runs using the restored database, and the games and settings from that saved version are available. |

<a id="wf-ma-04-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | Procedure / app response |
| --- | --- | --- |
| 1 | Select a full database backup and review that restoring replaces the active dataset. | The guide identifies the correct target storage and supported procedure. |
| 2 | Stop the app and save a separate copy of the current database. | The current version is preserved for recovery. |
| 3 | Replace the active database with the selected backup. | The saved version becomes the database used on restart. |
| 4 | Restart and inspect games, totals and My GM name. | The app loads the restored data or reports a startup failure for investigation. |

</details>

<a id="wf-ma-04-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-MA-10 | Restore replaces the entire active database rather than merging records; preserve a separate copy of the current database before replacement. | data guide; [FR-MA-13–14](#wf-ma-04-requirements) |
| BR-MA-11 | The documented and tested baseline is restore with the same app version. Cross-version migration requires a separately verified procedure. | [Q-MA-02](#wf-ma-04-decisions); [FR-MA-16](#wf-ma-04-requirements) |
| BR-MA-12 | Restored settings and records come from the selected backup. For an empty restored dataset, the demo source must be disabled to avoid unintended seeding. | startup; [Q-DA-01](#wf-da-01-decisions); data guide; [FR-MA-15–16](#wf-ma-04-requirements) |

</details>

<a id="wf-ma-04-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-MA-13 | Restore instructions must state that replacement affects all current records and settings and require preserving the current database first. | Must | Steps 1–2 |
| FR-MA-14 | The procedure must identify the active target for Python or Docker and require the app to be stopped during replacement. | Must | Steps 2–3 |
| FR-MA-15 | A successful restore must load the selected backup's records and settings without mixing in the replaced dataset; the guide must account for demo seeding when a restored dataset is empty. | Must | Steps 3–4; WF-MA-02 |
| FR-MA-16 | The procedure must include post-restart checks and recovery using the preserved pre-restore copy if validation fails. Document and test same-version restore first; cross-version migration requires a separately verified procedure. | Must | Step 4; Q-MA-02 |

</details>

<a id="wf-ma-04-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-MA-02 | Document and test database restore with the same app version first. Cross-version migration needs its own verified procedure. | Agreed |

**Also applies:** [Q-DA-01](#wf-da-01-decisions).

</details>

<a id="wf-ma-04-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-MA-02](#wf-ma-04-decisions); [Q-DA-01](#wf-da-01-decisions) — owner agreement on 28 October 2026. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `startup`. |
| Supporting documents | [Data and backup guide](../data-and-backups.md); [Docker storage configuration](../../ttrpg_tracker/docker-compose.yml). |

**Source review:** This is a manual restore procedure. No restore was executed during this documentation review; compatibility testing, custom-path instructions and recovery checks remain work to do.

</details>

</details>

<a id="wf-ma-05"></a>

<details>
<summary><strong>WF-MA-05: Start over with an empty tracker after trying the demo</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Replace a trial dataset with an empty tracker for personal use. |
| **Scope** | Follow the data guide's reset procedure for Python or Docker after backing up the current database and disabling the demo source. All current games, including personally added records, are removed from the active dataset. |
| **Preconditions** | The owner has chosen to clear the dataset, a full backup has been saved, and the owner can stop the app and manage its storage. |
| **Successful outcome** | The app starts with an empty dataset and does not reload demo games; the previous dataset remains available in the saved backup. |

<a id="wf-ma-05-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | Procedure / app response |
| --- | --- | --- |
| 1 | Choose to clear the trial dataset and make a full database backup. | The guide explains that personal additions are included in the reset. |
| 2 | Disable the demo source and stop the app. | Prevent writes and later automatic reloading of examples. |
| 3 | Follow the documented Python or Docker reset for the active storage. | Remove the active dataset from use, retaining the external backup. |
| 4 | Start the app and inspect the empty views. | Initialize an empty tracker ready for new records. |

</details>

<a id="wf-ma-05-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-MA-13 | Reset removes all games from the active dataset, including personal additions; it is not selective removal of demo records. | [Q-MA-03](#wf-ma-05-decisions); [FR-MA-17](#wf-ma-05-requirements); [FR-MA-20](#wf-ma-05-requirements) |
| BR-MA-14 | A separate full backup is retained outside the storage being reset, and the demo source is disabled before restart. | [Q-MA-01](#wf-ma-03-decisions); data guide; [FR-MA-17–18](#wf-ma-05-requirements) |
| BR-MA-15 | Python and Docker reset their own active storage. The documented Docker reset also removes cached dependencies; neither method is an in-app reset button. | data guide; [Q-MA-03](#wf-ma-05-decisions); [FR-MA-19–20](#wf-ma-05-requirements) |

</details>

<a id="wf-ma-05-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-MA-17 | Reset instructions must state that all active games, including personal additions, will be removed and must require a separate full backup first. | Must | Step 1 |
| FR-MA-18 | The procedure must disable the demo source and stop the app before changing active storage. | Must | Step 2 |
| FR-MA-19 | Instructions must distinguish moving aside the Python database from resetting Docker storage and must disclose that the documented Docker reset also removes cached dependencies. | Must | Step 3; data guide |
| FR-MA-20 | Restart after reset must produce empty systems, campaigns and sessions while the previous dataset remains in the backup; later restarts must not seed the demo while its source stays disabled. | Must | Step 4 |

</details>

<a id="wf-ma-05-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-MA-03 | Keep reset as a documented manual procedure for now. An in-app reset or selective demo removal needs a separate design, including reliable identification of demo records. | Agreed |

**Also applies:** [Q-MA-01](#wf-ma-03-decisions).

</details>

<a id="wf-ma-05-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-MA-03](#wf-ma-05-decisions); [Q-MA-01](#wf-ma-03-decisions) — owner agreement on 28 October 2026. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `startup`. |
| Supporting documents | [Data and backup guide](../data-and-backups.md); [Docker storage configuration](../../ttrpg_tracker/docker-compose.yml). |

**Source review:** The guide documents manual reset for default paths. No reset or deletion was performed during this review.

</details>

</details>

<a id="area-planned"></a>

## Planned workflows and improvements

<a id="wf-qa-01"></a>

<details>
<summary><strong>WF-QA-01: Record a campaign session through Quick Add (planned)</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Record a campaign session with fewer repeated selections. |
| **Scope** | Planned shortcut for active campaigns that supplies campaign defaults and requires explicit date confirmation. The owner can review session details; any separate Log today action must clearly name its date behavior. |
| **Preconditions** | A campaign and its default system exist. The Quick Add entry point must be implemented before this workflow can be used in the current app. |
| **Successful outcome** | Intended result: one session is saved for the chosen campaign using its defaults and any reviewed changes, without changing the campaign defaults. Detailed interaction design and implementation remain planned. |

<a id="wf-qa-01-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | Planned app response |
| --- | --- | --- |
| 1 | Choose an active campaign's Add shortcut. | Identify its campaign and fill the session defaults. |
| 2 | Explicitly confirm the date and review session overrides. | Show the chosen values without editing the campaign defaults. |
| 3 | Choose Save. | Validate and save one session linked to that campaign. |
| 4 | Continue after confirmation. | Refresh affected views and show session completion. |

</details>

<a id="wf-qa-01-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-QA-01 | Quick Add shortcuts contain active campaigns only; archived campaigns remain available in the ordinary session form. | [Q-QA-02](#wf-qa-01-decisions); [Q-CS-02](#wf-cs-01-decisions); [FR-QA-01](#wf-qa-01-requirements); [FR-QA-03](#wf-qa-01-requirements) |
| BR-QA-02 | Add supplies campaign defaults but requires explicit confirmation of a valid date. Any separate Log today shortcut must clearly identify that behavior. | [Q-QA-01](#wf-qa-01-decisions); [FR-QA-02](#wf-qa-01-requirements) |
| BR-QA-03 | Quick Add records a session using reviewed values without changing campaign defaults; it follows the same duplicate-request and uncertain-outcome policy as other new writes. | [Q-SH-01](#shared-decisions); [BR-CS-04](#wf-cs-01-rules); [FR-QA-03–04](#wf-qa-01-requirements) |

</details>

<a id="wf-qa-01-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-QA-01 | Quick Add should provide an identifiable campaign shortcut that supplies the campaign's GM, system and optional link. | Should | Step 1; planned feature |
| FR-QA-02 | When implemented, Add must require explicit confirmation of a valid date before saving; every shortcut must make its campaign and date behavior clear, including any separate Log today action. | Must | Steps 1–3; Q-QA-01 |
| FR-QA-03 | The owner must be able to review and override session values without changing campaign defaults. Quick Add shortcuts must include only active campaigns, while the ordinary session form retains archived campaign selection. | Must | Step 2; Q-QA-02; Q-CS-02 |
| FR-QA-04 | Saving must validate and persist one campaign session, prevent repeated pending submissions and refresh applicable views; uncertain outcomes require reconciliation before retry. | Must | Steps 3–4; FR-SH-02–05 |

</details>

<a id="wf-qa-01-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-QA-01 | Provide an Add shortcut that prefills campaign defaults and requires explicit date confirmation. Any separate Log today action must clearly state its date behavior. | Agreed |
| Q-QA-02 | Show only active campaigns among Quick Add shortcuts. Archived campaigns remain selectable in the ordinary session form under Q-CS-02. | Agreed |

**Also applies:** [Q-CS-02](#wf-cs-01-decisions); [Q-SH-01](#shared-decisions).

</details>

<a id="wf-qa-01-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-QA-01](#wf-qa-01-decisions); [Q-QA-02](#wf-qa-01-decisions); [Q-CS-02](#wf-cs-01-decisions); [Q-SH-01](#shared-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `openSessionDialog`, `applyCampaignDefaults`, `saveSession`. |
| Supporting documents | [Build plan](../../ttrpg-plan.md); [Interface forms and controls](../../ttrpg_tracker/app/frontend/index.html). |

**Source review:** Quick Add is not present in the current interface. The named frontend functions are reusable baseline behavior, not proof that a shortcut or explicit date-confirmation flow exists. Older completed build-plan notes are historical, not evidence of current availability.

</details>

</details>

<a id="wf-cp-06-improve-blocked-campaign-deletion"></a>

<a id="wf-cp-06"></a>
<details>
<summary><strong>WF-CP-06: Improve blocked campaign deletion and error feedback (planned)</strong></summary>

| Field | Workflow summary |
| --- | --- |
| **Goal** | Make the campaign deletion restriction understandable and provide a usable next action while protecting session history. |
| **Scope** | Improve campaign action availability, linked-session rejection and connection-failure feedback. Keep the existing server deletion guard. Cascading session deletion is outside this proposal. |
| **Preconditions** | A campaign has linked sessions, or a deletion begun from a stale view is rejected. The app may also encounter a connection failure during an otherwise valid deletion. |
| **Successful outcome** | A linked campaign and its sessions are retained; the owner can explicitly archive an active campaign or leave it unchanged. Known business restrictions and uncertain connection outcomes receive distinct, actionable messages. An empty campaign can still be deleted after confirmation. |

**Status:** Product decisions Q-CP-04–06 agreed on 28 October 2026 as the response
to [DEF-002](test-records.md#def-002-campaign-delete-feedback). Detailed requirements
remain drafts; implementation, reproduction and retest are still planned.

<a id="wf-cp-06-flow"></a>

<details>
<summary><strong>Main workflow</strong></summary>

| Step | Owner action | Planned app response |
| --- | --- | --- |
| 1 | Review a campaign's actions in Manage. | If linked sessions are known, make Delete unavailable with a visible explanation; keep Archive for an active campaign and indicate when already archived. |
| 2 | If an apparently empty campaign offers Delete, confirm it. | Keep the confirmation pending while the server checks current relationships. |
| 3 | Read any linked-session rejection. | Keep the action context visible and explain: “This campaign has recorded sessions and cannot be deleted.” Offer Archive if active, or identify that it is already archived. |
| 4 | Choose Archive, Cancel or Close as applicable. | Perform archiving only on explicit selection; otherwise leave the campaign unchanged. Refresh and report only a confirmed result. |

</details>

<a id="wf-cp-06-rules"></a>

<details>
<summary><strong>Business rules · draft</strong></summary>

**Status:** Draft wording derived from the agreed policy and cited sources.

| ID | Business rule | Basis and linked requirements |
| --- | --- | --- |
| BR-CP-16 | Campaigns with linked sessions cannot be deleted, whether active or archived. The server restriction remains authoritative even when browser data is stale. | [Q-CP-04](#wf-cp-05-decisions), [Q-CP-05](#wf-cp-06-decisions); [FR-CP-22–23](#wf-cp-06-requirements) |
| BR-CP-17 | Archive is an explicitly chosen status change that retains history; Delete or a failed deletion never archives automatically. An already archived campaign needs no new archive request. | [Q-CP-05–06](#wf-cp-06-decisions); [FR-CP-24](#wf-cp-06-requirements) |
| BR-CP-18 | A confirmed rejection leaves records intact; an interrupted response alone establishes neither success nor failure. Another deletion attempt requires checking the current state first. | [Q-CP-06](#wf-cp-06-decisions); [Q-SH-01](#shared-decisions); [FR-CP-23](#wf-cp-06-requirements); [FR-CP-25–26](#wf-cp-06-requirements) |

</details>

<a id="wf-cp-06-requirements"></a>

<details>
<summary><strong>Functional requirements · draft</strong></summary>

| ID | Draft requirement | Priority | Source |
| --- | --- | --- | --- |
| FR-CP-22 | The interface should prevent a known linked campaign from entering a usable Delete confirmation and display why deletion is unavailable, with Archive available for active campaigns. | Should | Step 1; Q-CP-05 |
| FR-CP-23 | The server must retain its linked-session guard; a readable HTTP 409 rejection must display the business reason and retain usable action context instead of closing into a generic connection-error message. | Must | Steps 2–3; DEF-002 |
| FR-CP-24 | Choosing Archive must be an explicit independent action that preserves all sessions; Cancel or Close must not archive or delete anything. Already archived campaigns must be identified without an unnecessary archive request. | Must | Step 4; Q-CP-05–06 |
| FR-CP-25 | Connection failures must be distinguished from confirmed business rejections. If a deletion outcome is unknown, feedback must say so, avoid claiming success or unchanged data, and reconcile current records before a retry. | Must | Q-CP-06 |
| FR-CP-26 | A valid empty-campaign deletion must remain pending until its outcome is known, close on confirmed success, refresh choices and remain protected against repeated pending submissions. | Must | Step 2; FR-SH-03–05 |

</details>

<a id="wf-cp-06-decisions"></a>

<details>
<summary><strong>Agreed product decisions</strong></summary>

| ID | Decision | Status |
| --- | --- | --- |
| Q-CP-05 | Make Delete unavailable with a visible explanation for campaigns with sessions. Offer a separate Archive action for active campaigns; identify an already archived campaign without another archive action. | Agreed |
| Q-CP-06 | Keep the dialog/context visible after a blocked deletion and explain the restriction. If deletion cannot be confirmed after a connection interruption, explain the uncertainty and check the campaign list before another attempt. Archive only when the owner explicitly chooses Archive. | Agreed |

<details>
<summary><strong>Q-CP-06 explained simply</strong></summary>

This decision covers the message and next action when deletion does not finish
normally. Keep the dialog visible so the owner has somewhere to continue.

| Situation | Message and next action |
| --- | --- |
| The app confirms deletion was blocked because sessions exist. | “This campaign has sessions. You can archive it instead.” Keep Archive and Cancel available for an active campaign; identify an already archived campaign. |
| The connection is interrupted and the app cannot confirm the result. | “We could not confirm deletion. Check the campaign list before trying again.” Check whether the campaign still exists before offering another deletion attempt. |
| Deletion was confirmed, but refreshing the list failed. | “Campaign deleted. Refresh the list to update this view.” Refresh without sending another deletion request. |

**Agreed:** Archive happens only when the owner chooses Archive. Checking an
unknown result is not another deletion attempt. If the check itself fails, keep
the outcome unknown and explain that the app still cannot confirm it.

</details>

**Also applies:** [Q-CP-04](#wf-cp-05-decisions); [Q-SH-01](#shared-decisions).

</details>

<a id="wf-cp-06-sources"></a>

<details>
<summary><strong>Sources and current behavior</strong></summary>

| Source type | Source and what to inspect |
| --- | --- |
| Agreed policy | [Q-CP-04](#wf-cp-05-decisions); [Q-CP-05](#wf-cp-06-decisions); [Q-CP-06](#wf-cp-06-decisions); [Q-SH-01](#shared-decisions) — owner agreement on 28 October 2026. |
| Current frontend | [app.js](../../ttrpg_tracker/app/frontend/app.js): `renderCampaigns`, `requestDeleteCampaign`, `handleConfirmSubmit`, `deleteCampaign`, `api`, `errorText`. |
| Current backend | [main.py](../../ttrpg_tracker/app/main.py): `delete_campaign`. |
| Supporting documents | [DEF-002](test-records.md#def-002-campaign-delete-feedback); [Build plan](../../ttrpg-plan.md). |
| Existing checks · not executed for this review | [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py). |

**Source review:** The server restriction exists. Action availability, pending-dialog recovery and reconciliation are planned changes. DEF-002 remains user-reported and has not been reproduced or retested in this documentation task.

</details>

<a id="wf-cp-06-review"></a>

<details>
<summary><strong>Review and planned verification</strong></summary>

The restriction protects history and is appropriate for the current data model.
The interaction is misleading when a known blocked operation is still offered
as a normal destructive action. Closing the dialog before the result also loses
the explanation and recovery context.

The current source closes confirmation before invoking deletion. It intends to
return HTTP 409 with a specific linked-session message, and the frontend intends
to read that message. A readable HTTP 409 alone does not explain “failed to
fetch”; the actual request, response, browser console and server logs are needed
to distinguish a connection/body-read failure from a different running version
or another runtime cause. This is source analysis, not a reproduced diagnosis.

| Planned scenario | Expected evidence |
| --- | --- |
| Active campaign with sessions | Delete unavailable with a visible reason; explicit Archive retains history; no deletion request. |
| Archived campaign with sessions | Clear already-archived status and deletion restriction; no unnecessary status write. |
| Empty campaign, then cancellation or confirmed deletion | Cancel makes no change; confirmation deletes only that campaign and refreshes choices once. |
| Sessions added after the browser loaded the campaign | Server rejects deletion with HTTP 409; business reason and action context remain; records are retained. |
| Connection loss or lost response during deletion | Feedback distinguishes an unknown outcome; current state is reconciled before retry and no automatic repeat deletion occurs. |

Implementation and retest remain planned. Do not change the deletion guard or
treat the report as evidence of data loss without checking the actual dataset.

</details>

</details>

**Related documents:**

[Process and data models](models.md) · [Acceptance criteria](acceptance-criteria.md) · [Test records](test-records.md) ·
[Documentation checklist](README.md)
