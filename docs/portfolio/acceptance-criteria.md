# Acceptance criteria

Add each workflow's criteria as a collapsed section, with category toggles inside.

<a id="campaign-session-acceptance-criteria"></a>
<details>
<summary><strong>Campaign-session acceptance criteria</strong></summary>

**Status:** Tentatively agreed. These are expected outcomes for
[WF-CS-01](requirements-and-rules.md#wf-cs-01-add-a-session-to-an-existing-campaign),
not execution results. Requirement IDs and priorities are unchanged.

[Test data and setup](test-records.md#campaign-session-test-data-and-setup) are kept
with the test records. For every validation failure below, reject the input,
create no session and explain the reason. For form submissions, keep the form
and entered values available for correction.

<a id="entry-and-defaults"></a>
<details>
<summary><strong>Entry and defaults</strong></summary>

### AC-CS-01 — Open through Add session

(FR-CS-01, FR-CS-02, FR-CS-03)

Given the calendar is open, when **Add session** is chosen, then a fresh form opens
with Type **Campaign session**, Campaign unselected, Date set to browser-local
today, and GM, System, Link and Notes empty.

### AC-CS-02 — Open through a calendar date

(FR-CS-01, FR-CS-02, FR-CS-03)

Given a calendar date different from today, when it is selected, then the same
fresh form opens with that date instead of today and the other initial values
specified in AC-CS-01.

### AC-CS-03 — Select an active or archived campaign

(FR-CS-04, FR-CS-12; BR-CS-01)

Given active and archived campaigns exist, when choosing a campaign, then both
are selectable and archived entries are labeled **(archived)**. Either can be
used to save an otherwise valid session.

### AC-CS-04 — Apply campaign defaults

(FR-CS-05; BR-CS-04)

Given a new form, when a campaign is selected, then GM, System and Link match
its defaults. A campaign without a default link leaves Link blank. Notes stay empty.

### AC-CS-05 — Switch after editing defaults

(FR-CS-06; BR-CS-05)

Given the owner has edited the session fields, when another campaign is selected,
then its defaults replace GM, System and Link without confirmation, clearing Link
if there is no default. The edited Date and Notes remain.

</details>

<a id="session-values-and-validation"></a>
<details>
<summary><strong>Session values and validation</strong></summary>

### AC-CS-06 — Save session overrides

(FR-CS-07, FR-CS-12; BR-CS-02, BR-CS-04, BR-CS-07, BR-CS-08)

Given a selected campaign, when Date, GM, System, Link and Notes are overridden
and saved, then the session uses those final values and remains linked to that
campaign. Campaign defaults and existing sessions are unchanged.

### AC-CS-07 — Clear optional fields

(FR-CS-07, FR-CS-11, FR-CS-12; BR-CS-04, BR-CS-06, BR-CS-07)

Given a default Link and entered Notes, when both are cleared and valid data is
saved, then neither value is recorded for the session. The campaign's default
link stays unchanged and is not restored into the session.

### AC-CS-08 — Use campaign identity

(FR-CS-08; BR-CS-01)

Given a selected campaign, when its session is saved, then no separate title is
required or stored. Visible calendar and history entries use the campaign's name.

### AC-CS-09 — Accept valid dates

(FR-CS-09; BR-CS-03)

Given otherwise valid data, when a valid past, current or future date is
submitted, then it is accepted and recorded as chosen. Valid leap days are accepted.

### AC-CS-10 — Display dates consistently

(FR-CS-10)

Given a selected date, when the form displays it, then it uses `dd/mm/yyyy`.
This remains a **Should** criterion.

### AC-CS-11 — Reject missing required values

(FR-CS-09, FR-CS-11, FR-CS-15; BR-CS-02)

Given otherwise valid data, when Campaign or System is unselected, or GM is
empty or whitespace-only, then explain which required input is missing or invalid.

### AC-CS-12 — Reject missing or invalid dates

(FR-CS-09, FR-CS-15; BR-CS-03)

Given otherwise valid data, when Date is missing, empty or impossible, then
explain the date error.

### AC-CS-13 — Reject missing referenced records

(FR-CS-11, FR-CS-15, FR-CS-17; BR-CS-01, BR-CS-02)

Given a campaign or system reference does not exist at save time, including
removal after the form loaded, when submitted, then report the missing reference.

### AC-CS-14 — Reject invalid supplied links

(FR-CS-11, FR-CS-15; BR-CS-06)

Given otherwise valid data, when a supplied Link lacks a supported protocol or
hostname, then reject it with a link error.

### AC-CS-15 — Accept HTTP and HTTPS links

(FR-CS-11, FR-CS-12; BR-CS-06)

Given otherwise valid data, when a complete HTTP or HTTPS link is supplied and
saved, then creation succeeds with that link recorded.

</details>

<a id="saving-and-alternative-outcomes"></a>
<details>
<summary><strong>Saving and alternative outcomes</strong></summary>

### AC-CS-16 — Save using defaults

(FR-CS-12; BR-CS-04, BR-CS-08)

Given a campaign's defaults and a valid date, when saving succeeds, then exactly
one session is added with the campaign, date, default GM, system and link, and no
notes. Campaign defaults and existing sessions remain unchanged.

### AC-CS-17 — Preserve the saved record after reload

(FR-CS-13; BR-CS-08)

Given a successfully saved session, when the app reloads, then the same record
remains available with all saved values. Reloading does not create another session.

### AC-CS-18 — Confirm and refresh a successful save

(FR-CS-14)

Given valid data, when creation and refresh succeed, then the form is closed,
**Session saved** appears and the views reflect the record. Calendar visibility
respects the displayed month; history respects its filters; statistics respect
the selected period. Exclusion from a view does not delete the stored session.

### AC-CS-19 — Correct validation errors

(FR-CS-15)

Given validation failed without creating a session, when the input is corrected
and valid data resubmitted, then saving can proceed without reopening the form
or re-entering unaffected values. Success adds one session.

### AC-CS-20 — Cancel before saving

(FR-CS-16)

Given entered values and no save in progress, when Close or Escape is used, then
the form closes without changing stored data. Reopening starts with the initial
values in AC-CS-01 or AC-CS-02.

### AC-CS-21 — Recover from a rejected save

(FR-CS-17)

Given a save is rejected and no session was created, when the failure is reported,
then the form retains its values and shows an error. Correction or retry is
available after the request ends. A successful retry adds exactly one session
across the two attempts.

### AC-CS-22 — Prevent submissions while saving

(FR-CS-18)

Given a save request is pending, when Save or Enter is used repeatedly, then
only one creation request is sent from the form during that pending request.
Success creates one session. Lost responses and separate later submissions
remain outside this criterion.

### AC-CS-23 — Include future sessions in statistics

(FR-CS-19; BR-CS-09)

Given known monthly and yearly totals, when a valid future-dated session is
saved, then its recorded month's and year's totals each increase by one before
its date. A different month's total is unchanged. No played/planned state is required.

</details>

All 19 requirements have linked criteria. Recovery after a lost save response or a
failed refresh remains [GAP-CS-01](requirements-and-rules.md#open-decision).

</details>

**Related documents:**

[Requirements and rules](requirements-and-rules.md) ·
[Test records](test-records.md) · [Documentation checklist](README.md)
