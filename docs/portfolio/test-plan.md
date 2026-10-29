# Test plan

**Status:** Overall plan documented. The owner approved its outline, planning decisions,
case presentation and scoped documentation updates on 29 October 2026. Execution
cycles, new cases and test runs are selected separately. The ten existing focused
cases remain drafts, **Not run**.

## Purpose and scope

Assess whether selected Tablelog behavior meets agreed requirements, identify
failures and explain uncertainty. QA/BA reviewers should be able to follow test
decisions and evidence. Each conclusion applies to its cycle's scope.

The planning scope includes sessions, campaigns, game systems, calendar/history,
statistics and My GM name, import/export, and setup/backup/restore/reset. Use the
approved [requirements](requirements-and-rules.md), version 1.1
[acceptance criteria](acceptance-criteria.md) and relevant [models](models.md) as
the test basis. Separate intended behavior, source inspection and results.
The owner makes product decisions and carries out manual testing; Codex assists analysis,
documentation and automation.

## Risks and approach

Explain priorities using impact and likelihood. Start with data integrity,
adjusting for known failures and setup dependencies. Preserve agreed Must/Should
requirement priorities.

| Risk and reason for attention | Planned method |
| --- | --- |
| Lost records or wrong relationships: import, deletion and restore can affect existing history. | Compare before/after records, IDs and relationships; check rejected operations, rollback, export and same-version restore using disposable storage. |
| Wrong saved values: defaults, overrides and campaign switching can silently change session details. | Exercise browser scenarios; verify stored values, unchanged defaults and persistence after reload through read-only API checks. |
| Duplicate or uncertain writes: repeated actions and lost responses can create extra records. | Control pending, rejected and interrupted responses; count requests and records, distinguish deliberate duplicate entries, and check agreed recovery rules. |
| Misleading history or statistics: dates, filters, recorded systems and ties affect reported activity. | Compare displays/exports with known records and independently calculated totals, including empty periods, future dates and ties. |
| Unusable interactions: validation, cancellation and narrow layouts can prevent correct entry or hide failures. | Test keyboard controls, retained values, clear feedback and desktop/narrow layouts; explore combinations beyond scripted cases. |
| Setup or recovery changes history: seeding and storage paths differ between launch methods. | Follow Python and Docker procedures with fictional datasets; check restart, backup, same-version restore and reset. |

Use valid/invalid input groups, date and file-limit boundaries, and transitions
between unsaved, pending, rejected and saved states. Combine manual scenarios,
focused exploration and relevant automation; add automation where repetition
justifies maintenance.

<a id="existing-checks-to-assess-for-reuse"></a>

Reuse candidates include [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py),
[CSV-import checks](../../ttrpg_tracker/app/tests/test_csv_import.py) and
[stability browser checks](../../.hallmark/stability-qa.mjs). Map assertions to
criteria before claiming coverage. The
[import entry script](../../.hallmark/import-qa.mjs) invokes that same stability
suite. Commands remain in the
[verification notes](../../ttrpg_tracker/app/README.md#verification).

## Environment and data

Use Windows and Edge as the initial baseline, with desktop keyboard use and a
narrow viewport. Record widths and distinguish emulation from real-device results.
Additional browsers/devices need recorded runs. Use Python for ordinary UI/API
cycles; include both Python and Docker when testing maintenance workflows.

Use fictional data in disposable storage and independent starting states per case.
Copied databases must also have fictional sources. Check database/backup/export
destinations before writes; prepare snapshots and repeatable response controls
as needed. Follow the [data guide](../data-and-backups.md).

For each run, record the app commit and local changes, OS/browser/runtime versions,
launch method, viewport, relevant locale/time zone, fixture and storage location.

## Execution cycles

<a id="broader-test-plan-work-still-to-document"></a>

Select a small scope, linked criteria, risks, cases and methods before execution.
There is no fixed deadline. WF-CS-01 remains the earlier proposed starting point;
the first cycle is selected separately. Prepare cases and fixtures per cycle.

Start with agreed expectations, an identified version/environment and prepared
fixtures/tools. Existing defects do not prevent testing observable behavior.
Record current failures before fixes where practical; retest fixes and run
relevant regression checks.

## Results and completion

<a id="execution-preparation-and-evidence"></a>

Keep cases, data and results in [Test records](test-records.md). Each case must be
understandable on its own: include necessary setup/input values, short steps and
concrete expected results beside the steps. Link criterion IDs for background;
the reader should not need to open them to judge the result. Shared setup may be
linked, but retain the details needed to understand that case.

Record each selected case, context and variation as Pass, Fail, Blocked or Not run,
with a concise actual result or reason. Fail means behavior differs from the
expectation; Blocked means a dependency prevents execution. Capture screenshots,
requests/responses and stored-value comparisons where they substantiate the result;
retain fuller diagnostics for failures and data risks. Link findings to later retests.

A cycle can close with defects once every selected item has an outcome or
unexecuted reason, and the conclusion states remaining gaps. Claim that its scope
meets criteria only when all selected Must criteria pass; record the owner's acceptance
of any deferred Should gaps. Unrun or blocked items leave gaps in that conclusion.
Release/use decisions are separate.

## Limits and dependencies

Defer extensive load/stress testing, penetration testing, formal accessibility
conformance assessment and broad browser/device coverage. Retain basic keyboard
use, error clarity, narrow-screen usability, input handling, configured limits and
data protection. Separate user accounts are outside product scope. Cross-version
restore needs a separately verified procedure.

Test the agreed recovery safety rules while keeping request identification and
detailed interaction design open under
[GAP-CS-01](requirements-and-rules.md#open-decision). Record a block only where
missing design prevents a testable expectation. Quick Add and other planned behavior have no current
runtime coverage. Track implementation work in the existing
[workflow follow-up](requirements-and-rules.md#workflow-follow-up).

<a id="focused-acceptance-review-scope"></a>

The ten [focused acceptance-review cases and fixtures](test-records.md#focused-review-test-cases)
cover import, recorded systems/colors, tied leaders and session-form controls.
Their 28 October audit, preparation and **Not run** status remain there.
Existing [findings and retests](test-records.md#findings-and-retests) retain DEF-001's
evidence and DEF-002's pending reproduction. This update adds no runtime results.

[Back to the documentation checklist](README.md)
