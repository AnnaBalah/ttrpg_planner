# Test plan

**Status:** Focused test plan drafted; execution **Not run**. The broader first
scope remains adding a campaign session. The owner selected documentation and
draft test cases only for this 28 October 2026 acceptance-review follow-up.

Pending decisions and preparation tasks are tracked in the
[workflow follow-up](requirements-and-rules.md#workflow-follow-up).
The documentation-only retirement audit on 28 October 2026 rechecked source at
`0a1dcf4`; it added no application tests or runtime results. The finding
dispositions are retained in the acceptance criteria's version 1.1 amendment table,
so the separate review document is no longer needed.

## Focused acceptance-review scope

The approved [version 1.1 acceptance amendments](acceptance-criteria.md) strengthen existing
rules and document Q-CS-07's agreed scope across every session form. The ten
[focused cases and fixtures](test-records.md#focused-review-test-cases) are drafts;
their presence is not evidence that the app meets those outcomes.

| Order | Risk / objective | Planned cases and method |
| --- | --- | --- |
| 1 | Wrong relationships, overwritten records or duplicate identities on import | TC-DA-01–04: browser preview/apply plus read-only inspection of exported IDs, relationships, settings and counts. |
| 2 | Dismissed forms or repeated writes during session saves | TC-SH-01–03: browser keyboard/control checks across the session-form matrix, with controlled pending responses and request counts. |
| 3 | Statistics or colors following campaign defaults instead of recorded systems | TC-ST-01 and TC-SY-01: compare known monthly/yearly figures and before/after display colors with stored associations. |
| 4 | Tied leaders omitted or incorrectly presented as a sole winner | TC-ST-02: three-leader fixtures and a sole-leader control in existing monthly/annual highlights and system breakdowns; no extra annual Favorite System highlight. |

Use fictional data and independent isolated storage per case. Prepare fixtures I,
N, S and T and matrix K from the test records. The import cases use tracker-format
CSV and distinguish source-file IDs from destination IDs. Normalization examples
cover surrounding whitespace, case and canonically equivalent Unicode forms;
they do not introduce alias, accent-removal or fuzzy matching policy.

## Execution preparation and evidence

Before a later execution, record the app commit and local changes, Windows
version, browser/version, viewport, launch method and isolated database location.
Test desktop keyboard behavior and an agenda-capable narrow viewport; record the
actual widths. Select a supported Python or Docker environment for this focused
UI/API cycle. Testing both maintenance procedures belongs to the broader suite.

| Condition | Required outcome |
| --- | --- |
| Entry | Use the owner-approved version 1.1 criteria for the run; prepare independent fixtures, snapshots and a reproducible response-hold method. |
| Per-case evidence | Record actual steps, UI screenshots where relevant, request/response evidence, stored IDs/values, expected versus actual counts and outcome. |
| Planned context unavailable | Keep that context Not run with a reason; do not infer a pass. Quick Add remains planned until implemented. |
| Completion | Every selected case and keyboard-matrix context has a recorded outcome and evidence, or an explicit Not run/Blocked reason; failures link to findings and later retests. |

No automated test implementation or execution is included in this documentation
pass. Application fixes, broad workflow regression, detailed unknown-save recovery,
backup/restore/reset execution and DEF-002 reproduction remain separate work.

## Existing checks to assess for reuse

These are source-inspection candidates, not results from this pass:

| Existing source | Relevant coverage and limit |
| --- | --- |
| [CSV-import checks](../../ttrpg_tracker/app/tests/test_csv_import.py) | `test_append_maps_names_and_preserves_existing_settings` uses colliding file IDs and checks destination relationships and retained values; other cases cover case/whitespace matching, multiplicity, reimport and campaign/one-shot distinction. Reuse these assertions for TC-DA-01–04; canonical Unicode equivalence and the full browser preview/apply, settings and identity-component scenarios still need comparison with the drafts. These checks were not run for this audit. |
| [API-flow checks](../../ttrpg_tracker/app/tests/test_api_flows.py) | `test_exports_are_complete_and_csv_reimport_is_a_no_op`, `test_session_create_edit_clear_reload_and_delete` and `test_session_kind_can_change_both_ways` are related checks; their existing assertions do not establish the new collision, normalization, color, tie or full keyboard-matrix outcomes. |
| [Stability browser checks](../../.hallmark/stability-qa.mjs) | Candidate reuse for double-submit protection, no-picker Escape, import counts, stale previews and reimport. Broader picker/pending-form and all-leader scenarios still need comparison with the drafted cases. |
| [Import entry script](../../.hallmark/import-qa.mjs) | Imports the stability script; it is not an independent extra suite. |

When automation is separately selected, map each existing assertion to the case
it actually checks and add only the missing coverage. No listed check was run.
Source inspection identifies single-leader statistics highlights (FU-ST-01) and
missing date-picker Escape-first handling (FU-SH-07) as implementation work before
the affected cases can pass. Actual-system and import logic are present in source;
that does not mark their focused cases passed. The owner resolved the system-leader
scope under Q-ST-01 on 28 October 2026: Favorite System means most played by
recorded session count. TC-ST-02 checks every tied system leader and shared count
in the monthly and annual breakdowns; no additional annual highlight is required.
Criterion wording review is complete under A-01. Test cases remain drafts, Not run.

## Broader test-plan work still to document

- Test objectives, included behavior and exclusions.
- Risks and the order in which they will be tested.
- App version, operating system, browsers and fictional test data.
- Manual, API, exploratory and automated checks selected for this scope.
- Conditions for starting and completing the test cycle.
- How results, defects and retests will be recorded.

Review the existing automated checks against the
[acceptance criteria](acceptance-criteria.md).
Record the tests and evidence in [Test records](test-records.md).

[Back to the documentation checklist](README.md)
