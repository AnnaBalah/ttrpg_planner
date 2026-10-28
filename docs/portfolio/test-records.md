# Test records

**Status:** In progress. The first exploratory defect and its focused retest are
recorded below. Formal campaign-session test coverage is still planned.

Use a collapsed section for each new dataset, test case, execution run or finding.

<a id="campaign-session-test-data-and-setup"></a>
<details>
<summary><strong>Campaign-session test data and setup</strong></summary>

**Status:** Preparation notes moved from the acceptance criteria. Formal test
cases and execution results are still to be recorded.

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
| AC-CS-20 | Close control and Escape, tested separately. |
| AC-CS-21 | A confirmed rejection with no record created, then a successful retry. |
| AC-CS-22 | Hold the save request pending; repeat Save clicks and Enter submissions. |
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

</details>

<a id="execution-results"></a>
<details>
<summary><strong>Execution results</strong></summary>

Record the date, app version, environment, actual result, outcome and evidence
for each executed case. Identify blocked and unexecuted cases explicitly.

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

</details>

**Related documents:**

[Requirements and rules](requirements-and-rules.md) ·
[Acceptance criteria](acceptance-criteria.md) · [Documentation checklist](README.md)
