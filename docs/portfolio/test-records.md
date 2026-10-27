# Test records

**Status:** In progress. The first exploratory defect and its focused retest are
recorded below. Formal campaign-session test coverage is still planned.

## Test cases

For each case, record its ID, linked requirement or acceptance criterion,
preconditions, test data, steps and expected result.

## Execution results

Record the date, app version, environment, actual result, outcome and evidence
for each executed case. Identify blocked and unexecuted cases explicitly.

## Findings and retests

### DEF-001: Browser-default styling in forms

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

[Back to the documentation checklist](README.md)
