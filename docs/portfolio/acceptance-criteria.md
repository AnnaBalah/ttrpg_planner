# Acceptance criteria

**Version:** 1.0 — reviewed baseline

**Status — 28 October 2026:** All acceptance criteria are approved by the owner,
including shared criteria and updates reflecting Q-CS-06–08. All Main workflow tables, business
rules, functional requirements and recorded Must/Should priorities in
[requirements and rules](requirements-and-rules.md) are approved, together with
the 37 product decisions. These criteria are not implementation or test results.

Each workflow has a collapsed section with category toggles. Criterion IDs are
unique within an area and continue across its workflows. Linked requirements
determine priority; criteria for a **Should** requirement are identified explicitly.
Shared criteria apply where relevant to the newer workflows. Detailed recovery
design remains open under GAP-CS-01.

Use fictional data and isolated storage for verification. Record test setup,
cases, execution evidence and retests in [test records](test-records.md), including
the app version and browser or launch method. The maintenance sections describe
checks of documented procedures; this document does not execute a backup, restore
or reset. Open decisions and follow-up work are listed under
[Actions needed](#actions-needed).

| Area | Criteria |
| --- | --- |
| Shared behavior | [Validation, writes and recovery](#shared-acceptance-criteria) |
| Sessions | [Campaign session, one-shot, first session, edit and delete](#sessions) |
| Campaigns and systems | [Campaigns](#campaigns) · [Game systems](#game-systems) |
| Browsing and statistics | [Calendar and history](#calendar-and-session-history) · [Statistics](#statistics) |
| Data and setup | [Import and export](#import-and-export) · [Setup and maintenance](#setup-and-maintenance) · [Planned improvements](#planned-workflows-and-improvements) |

<a id="shared-acceptance-criteria"></a>
<details>
<summary><strong>Shared acceptance criteria</strong></summary>

**Source:** FR-SH-01–05; Q-SH-01. Apply to the workflows identified in the source
shared-requirements table, where the operation is relevant. Creation-request
identification and detailed recovery design remain open under GAP-CS-01.

<details>
<summary><strong>Validation and action control</strong></summary>

### AC-SH-01 — Keep read-only actions read-only

(FR-SH-01)

Given a known dataset and settings, when browsing, opening details, searching,
filtering, sorting, viewing statistics or exporting, then stored records and
settings remain unchanged. Saving My GM name is verified separately as a write.

### AC-SH-02 — Validate before a form write

(FR-SH-02)

Given a session, campaign or system form, when required text is blank or
whitespace-only, a date is invalid, a reference is missing, or a supplied link
lacks an HTTP/HTTPS protocol or hostname, then the applicable error is explained,
no invalid record is saved, and entered values remain available for correction.
Optional fields may remain empty where the workflow permits them.

### AC-SH-03 — Prevent repeated pending writes

(FR-SH-03)

Given a create, edit, delete, archive, setting or import request is pending, when
its action is repeated, then no additional request for that operation starts.
This does not define deduplication of separate, deliberate later operations.

### AC-SH-04 — Retain context after confirmed rejection

(FR-SH-04)

Given the server confirms that a write was rejected, when the result is shown,
then the business or input reason is readable, no success is claimed, and a usable
form or action context remains for correction or a permitted next action.

### AC-SH-05 — Cancel before submission

(FR-SH-04)

Given an action has not been submitted, when it is cancelled using its supported
control, then no write request is sent and stored data remains unchanged.

</details>

<details>
<summary><strong>Write outcome and recovery</strong></summary>

### AC-SH-06 — Complete after confirmation and refresh

(FR-SH-05)

Given a write is confirmed successful, when affected views refresh successfully,
then those views reflect the confirmed state before normal completion feedback
appears. Any view-specific month, period or history filters still apply.

### AC-SH-07 — Separate write success from refresh failure

(FR-SH-05; Q-SH-01)

Given a write is confirmed successful but refreshing a view fails, when reporting
the result, then feedback says the write succeeded and the displayed view is
outdated. Recovery refreshes the view without repeating the write or reporting
the confirmed write as rejected.

### AC-SH-08 — Reconcile an unknown write outcome

(FR-SH-05; Q-SH-01)

Given a connection interruption loses the write result, when reporting the
failure, then feedback says the outcome is unknown and claims neither success
nor unchanged data. No automatic repeat write occurs. Check current stored state
before offering a retry; if that check fails, retain the unknown status. For
creation, a matching-looking record alone is not proof of which attempt created
it: the identification mechanism and detailed interaction remain an open design
action, not an agreed solution in this criterion.

</details>

</details>

## Sessions

<a id="campaign-session-acceptance-criteria"></a>
<details>
<summary><strong>Campaign-session acceptance criteria</strong></summary>

**Status:** All criteria are approved, including changes reflecting Q-CS-06–08
and AC-CS-31/32. These are expected outcomes for
[WF-CS-01](requirements-and-rules.md#wf-cs-01-add-a-session-to-an-existing-campaign),
not execution results. Existing requirement IDs and priorities are preserved.

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

Given otherwise valid data in the browser form, when Campaign or System is unselected, or GM is
empty or whitespace-only, then explain which required input is missing or invalid.
API omissions that use campaign defaults are covered separately by AC-CS-32.

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

(FR-CS-16; Q-CS-07)

Given entered values and no save in progress, when Close is used or Escape is
pressed with no picker open, then the form closes without changing stored data.
If a picker is open, Escape closes only that picker and retains the form and
entered values. Reopening a discarded form starts with the initial values in
AC-CS-01 or AC-CS-02. Closing during a save is covered by AC-CS-22.

### AC-CS-21 — Recover from a rejected save

(FR-CS-17)

Given a save is rejected and no session was created, when the failure is reported,
then the form retains its values and shows an error. Correction or retry is
available after the request ends. A successful retry adds exactly one session
across the two attempts.

<a id="ac-cs-22-prevent-submissions-while-saving"></a>

### AC-CS-22 — Prevent repeated submissions and form closing while saving

(FR-CS-18; Q-CS-07)

Given a save request is pending, when Save or Enter is used repeatedly, then
only one creation request is sent from the form during that pending request.
Close and Escape cannot close the session form while saving; Escape may close
an open picker while retaining the form. Success creates one session. Lost
responses and separate later submissions remain outside this criterion.

### AC-CS-23 — Include future sessions in statistics

(FR-CS-19; BR-CS-09)

Given known monthly and yearly totals, when a valid future-dated session is
saved, then its recorded month's and year's totals each increase by one before
its date. A different month's total is unchanged. No played/planned state is required.

</details>

<details>
<summary><strong>Decisions Q-CS-06–08</strong></summary>

### AC-CS-31 — Allow deliberate repeated campaign-session entries

(FR-CS-25; BR-CS-13; Q-CS-06)

Given a session already exists for a campaign and date, when the owner deliberately
submits another valid session for the same campaign and date, including otherwise
identical values, then one additional session is created. Repeated pending actions
remain covered by AC-CS-22; an unknown request outcome requires reconciliation
under Q-SH-01 before retry.

### AC-CS-32 — Apply campaign defaults to omitted API inputs

(FR-CS-11; Q-CS-08)

Given a valid existing campaign, when an otherwise valid API creation request
omits GM, System or both, then use the campaign's corresponding defaults and
validate the effective values. Supplied valid overrides take precedence without
changing campaign defaults. The browser form still requires GM and System under
AC-CS-11; missing effective references remain covered by AC-CS-13.

</details>

All WF-CS-01 requirements have linked criteria. Recovery after a lost save response or a
failed refresh remains [GAP-CS-01](requirements-and-rules.md#open-decision).

</details>

<details>
<summary><strong>WF-OS-01: Add a standalone one-shot</strong></summary>

**Source:** WF-OS-01; FR-OS-01–04; Q-OS-01. Shared criteria apply.

<details>
<summary><strong>Entry and validation</strong></summary>

### AC-OS-01 — Open from either session entry point

(FR-OS-01)

Given Add session or a calendar date is used, when One-shot is selected, then the
one-shot fields appear and Date is browser-local today or the selected date,
respectively.

### AC-OS-02 — Require valid standalone session values

(FR-OS-02; FR-SH-02)

Given one-shot entry, when the name or GM is blank or whitespace-only, Date is
missing or impossible, or System is unselected or no longer exists, then explain
the applicable input error, create no session and retain entered values. Otherwise
valid past, current, future and leap-day dates are accepted.

### AC-OS-03 — Save or clear optional values

(FR-OS-02, FR-OS-03; FR-SH-02)

Given otherwise valid one-shot values, when Link and Notes are supplied or left
empty and saving succeeds, then the session retains those final values. A supplied
link must have an HTTP/HTTPS protocol and hostname; invalid links are rejected
without creating a session and with values retained.

### AC-OS-04 — Allow deliberate repeated names or dates

(FR-OS-03; Q-OS-01)

Given an existing one-shot, when the owner deliberately submits another valid
one-shot with the same name, the same date, or both, then one additional standalone
session is created. Repeated pending actions remain covered by AC-SH-03; an unknown
request outcome is handled under AC-SH-08 rather than treated as a deliberate entry.

</details>

<details>
<summary><strong>Saving and alternative outcomes</strong></summary>

### AC-OS-05 — Persist one standalone record

(FR-OS-03)

Given valid final values, when saving succeeds and the app reloads, then exactly
one new session remains with its own name and recorded values, no campaign
association, and no change to existing campaigns or sessions.

### AC-OS-06 — Refresh relevant views by one-shot name

(FR-OS-04; FR-SH-05)

Given confirmed creation and successful refresh, when the form closes and
**Session saved** appears, then the calendar and history identify the record by
its one-shot name where their current month and filters include it. Statistics
include it in its recorded period.

### AC-OS-07 — Cancel or correct a rejected save

(FR-OS-04; FR-SH-04)

Given unsaved one-shot values, when cancelling before submission or receiving a
confirmed rejection, then no session is created. Cancellation closes the form;
rejection explains the reason and retains values for correction or permitted retry.

</details>

</details>

<details>
<summary><strong>WF-CS-02: Create a campaign while recording its first session</strong></summary>

**Source:** WF-CS-02; FR-CS-20–24; Q-CS-04–05. Shared criteria apply.
Existing AC-CS-24–30 IDs are preserved; later additions AC-CS-31/32 belong to
WF-CS-01 above.

<details>
<summary><strong>Entry and campaign defaults</strong></summary>

### AC-CS-24 — Start a new campaign in the session form

(FR-CS-20)

Given a new-session form, when New campaign is selected, then campaign name,
default GM and session fields can be completed without navigating to Manage.

### AC-CS-25 — Derive the campaign defaults

(FR-CS-21, FR-CS-22; Q-CS-05)

Given a new campaign and its first session, when valid values are saved, then an
explicit nonblank default GM is retained even if different from session GM. If
default GM is blank, session GM supplies it. The first session's system and link,
including an empty optional link, become the campaign defaults.

### AC-CS-26 — Validate both records before creation

(FR-CS-21; FR-SH-02)

Given a duplicate campaign name, blank name or effective default GM, missing
system, invalid supplied link or invalid session input, when Save Session is
chosen, then identify the error before creation starts, create neither record,
and retain the entered values. Campaign-name uniqueness follows FR-CP-02.

</details>

<details>
<summary><strong>Saving, rollback and recovery</strong></summary>

### AC-CS-27 — Save the campaign and its first session

(FR-CS-22)

Given valid campaign and session values using an existing system, when completion
is confirmed and the app reloads, then one new campaign and one new session linked
to its ID remain with their respective final values. Existing records are unchanged.

### AC-CS-28 — Roll back a campaign after confirmed first-session failure

(FR-CS-23; Q-CS-04)

Given this attempt created a campaign but its first session is confirmed unsaved,
when failure recovery completes, then that new campaign is removed, no first
session remains, existing campaigns are unchanged, and feedback clearly reports
the failed session save and confirmed rollback. Entered values remain available;
a corrected retry can create one campaign and one session without an unused campaign.

### AC-CS-29 — Reconcile before retry or rollback claims

(FR-CS-23; Q-CS-04; Q-SH-01)

Given the campaign or first-session save result cannot be confirmed, when recovery
starts, then explain the uncertainty and reconcile the attempt before retrying
or claiming rollback succeeded. A failed check or unconfirmed rollback must not
be reported as successful cleanup. Creation identification remains an action below.

### AC-CS-30 — Confirm completion only for the saved pair

(FR-CS-24; FR-SH-05)

Given both records are confirmed saved, when affected campaign choices, calendar,
history and statistics refresh, then close the form and report completion. If
refresh fails, describe the saved records and outdated view under AC-SH-07 without
creating another pair.

</details>

</details>

<details>
<summary><strong>WF-SE-01: Edit an existing campaign session or one-shot</strong></summary>

**Source:** WF-SE-01; FR-SE-01–04; Q-SE-01–02. Shared criteria apply.

<details>
<summary><strong>Recorded values, identity and defaults</strong></summary>

### AC-SE-01 — Load the recorded session

(FR-SE-01)

Given a session whose values differ from its campaign's current defaults, when
Edit Session opens, then type, campaign or one-shot name, date, GM, system, link
and notes match that session's stored values.

### AC-SE-02 — Save changes to the same record

(FR-SE-02, FR-SE-04)

Given a stored session, when valid date, GM, system, link or notes changes are
saved, including clearing optional values, then the same session ID retains the
changes after reload, session count is unchanged and campaign defaults are unchanged.

### AC-SE-03 — Move a session to another campaign

(FR-SE-02, FR-SE-03; Q-SE-01)

Given two existing campaigns, when a session is moved to the other campaign and
saved, then its campaign reference changes while its session ID remains the same.
It stores no separate title and is displayed using the destination campaign name.

### AC-SE-04 — Convert between session types

(FR-SE-02, FR-SE-03; Q-SE-01)

Given a stored session, when converting a campaign session to a one-shot with a
valid name, then the same session ID has that name and no campaign association.
When converting a one-shot to a campaign session with an existing campaign,
then the same ID references that campaign and has no separate title. Neither
conversion creates an additional session.

### AC-SE-05 — Choose whether to apply destination defaults

(FR-SE-03; Q-SE-02)

Given edited GM, system and link values, when another campaign is selected during
editing, then offer an explicit choice before applying its defaults. Declining
preserves the edited values; accepting applies its GM, system and optional link.
Creation's automatic replacement under Q-CS-01 is not applied to this edit.

</details>

<details>
<summary><strong>Validation and completion</strong></summary>

### AC-SE-06 — Reject invalid final edits

(FR-SE-03, FR-SE-04; FR-SH-02)

Given missing required values for the final type, an impossible date, a removed
campaign or system, or an invalid supplied link, when saving, then explain the
input error, retain edited values and leave the stored original unchanged.

### AC-SE-07 — Cancel or retain a rejected edit

(FR-SE-04; FR-SH-04)

Given unsaved edits, when cancelling before submission, then no update is sent.
Given a confirmed rejected update, then explain the cause and retain a usable
form. In both cases the stored original and campaign defaults are unchanged.

### AC-SE-08 — Refresh the affected views

(FR-SE-04; FR-SH-05)

Given a confirmed edit, when refresh succeeds, then applicable calendar, history
and statistics reflect its final date, identity, GM and system. If its date moved
between periods, the old period loses the session and the new period gains it
once; active filters still determine visibility.

</details>

</details>

<details>
<summary><strong>WF-SE-02: Delete a session</strong></summary>

**Source:** WF-SE-02; FR-SE-05–08; Q-SE-03. Shared criteria apply.

<details>
<summary><strong>Confirmation and data protection</strong></summary>

### AC-SE-09 — Identify and confirm permanent deletion

(FR-SE-05; Q-SE-03)

Given a campaign session or one-shot, when Delete is chosen from history or its
form, then confirmation identifies its name and date and explains permanent
removal. No deletion request starts before explicit confirmation.

### AC-SE-10 — Delete only the confirmed session

(FR-SE-06)

Given confirmed deletion, when it succeeds, then only the selected session ID
is removed. Its campaign, system and every other session remain unchanged.

</details>

<details>
<summary><strong>Alternative outcomes and persistence</strong></summary>

### AC-SE-11 — Cancel session deletion

(FR-SE-07)

Given the confirmation is open, when Cancel is chosen, then no deletion request
is sent and the session remains unchanged.

### AC-SE-12 — Explain a confirmed deletion rejection

(FR-SE-07; FR-SH-04)

Given deletion is confirmed rejected, when feedback appears, then the session
remains stored and the reason and a usable next action are shown. An unknown
connection outcome is handled separately by AC-SH-08.

### AC-SE-13 — Retain deletion after refresh and reload

(FR-SE-08; FR-SH-05)

Given confirmed deletion, when views refresh and the app reloads, then that
session remains absent from calendar and history and is removed once from its
monthly and annual statistics. No undo is implied by the completion message.

</details>

</details>

## Campaigns

<details>
<summary><strong>WF-CP-01: Create a campaign and set its session defaults</strong></summary>

**Source:** WF-CP-01; FR-CP-01–04; Q-CP-01. Shared criteria apply.

<details>
<summary><strong>Entry and validation</strong></summary>

### AC-CP-01 — Enter defaults and initial archive status

(FR-CP-01; Q-CP-01)

Given Manage → Campaigns is opened for creation, when the form appears, then its
details are blank and status defaults to active. The owner can enter a name,
default GM, existing system and optional default link and choose archived instead.

### AC-CP-02 — Validate campaign values and name uniqueness

(FR-CP-02; FR-SH-02)

Given a blank or whitespace-only name or default GM, missing system, invalid
supplied HTTP/HTTPS link, or a name matching another campaign after trimming,
character normalization and case-insensitive comparison, when saving, then create
no campaign, explain the input error and retain values. An empty default link is valid.

</details>

<details>
<summary><strong>Saving and alternative outcomes</strong></summary>

### AC-CP-03 — Persist one campaign without a session

(FR-CP-03, FR-CP-04)

Given valid values for either initial status, when saving and refreshing succeed,
then one campaign is stored with its final defaults and status, campaign choices
refresh, the form resets and **Campaign saved** appears. Reload retains the
campaign; no session is created.

### AC-CP-04 — Reset or retain rejected creation values

(FR-CP-04; FR-SH-04)

Given unsaved creation values, when Reset is chosen before submission, then
discard them without a write. Given a confirmed rejected save, then keep entered
values, explain the cause and create no campaign.

</details>

</details>

<details>
<summary><strong>WF-CP-02: Edit a campaign and its session defaults</strong></summary>

**Source:** WF-CP-02; FR-CP-05–08; Q-CP-02. Shared criteria apply.

<details>
<summary><strong>Loading and validating edits</strong></summary>

### AC-CP-05 — Load and update the selected campaign

(FR-CP-05)

Given an existing campaign, when Edit is chosen, then its saved name, defaults
and status load. Saving valid edits updates that campaign's ID, creates no new
campaign and retains the changes after reload.

### AC-CP-06 — Validate edited defaults without self-duplicates

(FR-CP-06; FR-CP-02)

Given a campaign under edit, when its own unchanged name is saved with valid
defaults, then it is accepted. A name matching another campaign under the shared
normalization rule, blank required text, missing system or invalid supplied link
is rejected with values retained and the stored campaign unchanged.

</details>

<details>
<summary><strong>Defaults, history and alternative outcomes</strong></summary>

### AC-CP-07 — Use changed defaults only for later session entry

(FR-CP-07)

Given existing sessions with recorded values, when campaign GM, system or link
defaults are changed, then later new-session entry uses the saved defaults.
Existing session GM, system, link and notes remain unchanged.

### AC-CP-08 — Show a renamed campaign in existing history

(FR-CP-07; Q-CP-02)

Given linked sessions, when a campaign rename is confirmed and views refresh,
then existing history and applicable campaign labels use the new name while
session IDs, campaign references and recorded session values remain unchanged.

### AC-CP-09 — Reset or correct a rejected campaign edit

(FR-CP-08; FR-SH-04)

Given unsaved edits, when Reset is chosen, then the stored campaign is unchanged.
Given a confirmed rejected save, then edited values remain available with an
explanation and the stored campaign is unchanged.

</details>

</details>

<details>
<summary><strong>WF-CP-03: Archive a campaign</strong></summary>

**Source:** WF-CP-03; FR-CP-09–12; Q-CP-03. Shared criteria apply.

<details>
<summary><strong>Status change and history</strong></summary>

### AC-CP-10 — Archive explicitly without a confirmation step

(FR-CP-09; Q-CP-03)

Given an active campaign, when Archive is chosen, then submit its archive-status
change without an additional confirmation dialog. No other campaign changes.

### AC-CP-11 — Retain campaign details and session contributions

(FR-CP-10)

Given a campaign with linked sessions, when archiving succeeds, then its details
and defaults and all session values remain stored. The sessions retain their
calendar, history and statistics contributions for their recorded periods.

</details>

<details>
<summary><strong>Persistence and rejection</strong></summary>

### AC-CP-12 — Retain archived selection after reload

(FR-CP-11; FR-SH-05)

Given confirmed archiving and successful refresh, when the app reloads, then the
campaign remains archived, completion feedback is clear, and the ordinary session
selector still offers it labeled **(archived)**.

### AC-CP-13 — Retain confirmed status on rejection

(FR-CP-12)

Given the archive request is confirmed rejected, when feedback appears, then
the previously confirmed active status remains, the cause is explained and
archiving success is not reported.

</details>

</details>

<details>
<summary><strong>WF-CP-04: Reactivate an archived campaign</strong></summary>

**Source:** WF-CP-04; FR-CP-13–16; Q-CP-03. Shared criteria apply.

<details>
<summary><strong>Status change and data protection</strong></summary>

### AC-CP-14 — Reactivate the same campaign

(FR-CP-13; Q-CP-03)

Given an archived campaign, when Unarchive is chosen, then submit its change to
active without another confirmation step. Successful completion updates the
same campaign ID without creating another campaign.

### AC-CP-15 — Preserve defaults and recorded sessions

(FR-CP-14)

Given an archived campaign with recorded sessions, when reactivation succeeds,
then its defaults and every recorded session value remain unchanged.

</details>

<details>
<summary><strong>Persistence and rejection</strong></summary>

### AC-CP-16 — Refresh and retain active status

(FR-CP-15; FR-SH-05)

Given confirmed reactivation and successful refresh, when the app reloads, then
active status remains, the archived label is removed from applicable campaign
choices and clear completion feedback reflects the confirmed result.

### AC-CP-17 — Retain archived status on rejection

(FR-CP-16)

Given reactivation is confirmed rejected, when feedback appears, then the
previously confirmed archived status remains and the error gives a usable next
action without reporting reactivation success.

</details>

</details>

<details>
<summary><strong>WF-CP-05: Delete a campaign with no sessions</strong></summary>

**Source:** WF-CP-05; FR-CP-17–21; Q-CP-04. Shared criteria apply. Improved
interaction criteria continue under planned WF-CP-06 below.

<details>
<summary><strong>Confirmation and successful deletion</strong></summary>

### AC-CP-18 — Confirm the target or cancel without a request

(FR-CP-17)

Given an empty campaign, when Delete is chosen, then confirmation identifies
that campaign and permanent removal. Cancel sends no deletion request; only
explicit confirmation submits deletion.

### AC-CP-19 — Remove only the selected empty campaign

(FR-CP-19)

Given the campaign still has no linked sessions when the server checks, when
confirmed deletion succeeds, then only that campaign is removed. Systems, other
campaigns and all sessions remain unchanged.

### AC-CP-20 — Refresh choices and retain removal after reload

(FR-CP-20; FR-SH-05)

Given confirmed deletion, when choices refresh and the app reloads, then the
campaign remains absent and is no longer offered as selectable. Completion
feedback describes the confirmed deletion.

</details>

<details>
<summary><strong>Linked-session protection</strong></summary>

### AC-CP-21 — Recheck relationships on the server

(FR-CP-18; Q-CP-04)

Given a campaign has linked sessions, including one added after the browser loaded
an apparently empty campaign, when deletion is submitted, then the server rejects
it and retains the campaign and every session. No cascading deletion occurs.

### AC-CP-22 — Explain the business restriction

(FR-CP-21)

Given a confirmed linked-session rejection, when feedback appears, then explain
that a campaign with sessions cannot be deleted and direct the owner to Archive
when active. Identify an already archived campaign without another archive request.
Do not label the confirmed restriction as a connection error.

</details>

</details>

## Game systems

<details>
<summary><strong>WF-SY-01: Add a game system in Manage</strong></summary>

**Source:** WF-SY-01; FR-SY-01–04; Q-SY-01. Shared criteria apply.

<details>
<summary><strong>Values and validation</strong></summary>

### AC-SY-01 — Enter a name and primary color

(FR-SY-01)

Given Manage → Systems is opened for creation, when the form appears, then the
name is blank and a primary color is suggested. A nonblank name and valid six-digit
hexadecimal primary color can be entered; blank or whitespace-only names and
invalid color values are rejected with values retained and no new system.

### AC-SY-02 — Enforce normalized name uniqueness everywhere

(FR-SY-02)

Given an existing system, when a proposed name from Manage, the session form or
the campaign form matches it after trimming, character normalization and ignoring
case, then no duplicate system is created. Reuse in parent forms follows Q-SY-03;
direct duplicate creation explains the name conflict.

### AC-SY-03 — Allow an intentionally shared color

(FR-SY-01; Q-SY-01)

Given colors are already used, when a new system form suggests a color, then it
suggests a distinct color where possible. Choosing another system's valid color
with a unique name is still allowed and does not recolor the existing system.

</details>

<details>
<summary><strong>Saving and alternative outcomes</strong></summary>

### AC-SY-04 — Save one reusable system

(FR-SY-03; FR-SH-05)

Given valid values, when saving and refreshing succeed, then one system is stored,
campaign and session system choices include it, the form clears and **System saved**
appears. Reload retains the values; no campaign or session is created.

### AC-SY-05 — Clear or retain a rejected system form

(FR-SY-04)

Given unsaved values, when Clear is chosen before saving, then discard them
without a write. Given confirmed rejection, then no system is created and values
remain with an explanation for correction.

</details>

</details>

<details>
<summary><strong>WF-SY-02: Add a game system from the session form</strong></summary>

**Source:** WF-SY-02; FR-SY-05–08; Q-SY-02–03. Shared criteria and the parent
session workflow's criteria apply to creation or editing as relevant.

<details>
<summary><strong>Entry, validation and reuse</strong></summary>

### AC-SY-06 — Reveal new-system fields only when selected

(FR-SY-05)

Given a session form, when the new-system option is selected, then system name
and suggested primary color fields appear within it. Choosing an existing system
does not expose those new-system fields.

### AC-SY-07 — Validate the system and parent before creation

(FR-SY-06; FR-SY-01, FR-SY-02)

Given invalid new-system values or invalid required session values, when saving,
then explain the relevant errors before creation starts, retain entries and create
neither a system nor a session. Valid colors may intentionally match another system.

### AC-SY-08 — Offer an existing matching system explicitly

(FR-SY-06, FR-SY-07; Q-SY-03)

Given a proposed new name matches an existing system under the normalization
rule, when the conflict is identified, then explicitly offer that existing system.
Choosing it reuses its ID without creating a duplicate or changing its name or
color, including when the typed proposal used a different color.

</details>

<details>
<summary><strong>Parent save and rollback</strong></summary>

### AC-SY-09 — Associate the saved session with one reusable system

(FR-SY-07)

Given a unique valid new system and valid parent values, when the parent save
succeeds, then exactly one new system is stored and the saved session references
its ID. Both persist after reload, system choices include it, and existing systems
are unchanged. Editing a parent retains its session ID.

### AC-SY-10 — Roll back only this attempt's new system

(FR-SY-08; Q-SY-02)

Given a new system was created but the parent session is confirmed unsaved, when
recovery completes, then remove only that attempt's new system, retain form values
and clearly explain the failed parent save and confirmed rollback. Existing systems
and an edited parent's previously stored values remain unchanged. If this attempt
also created a campaign for its first session, apply AC-CS-28 to that campaign too.

### AC-SY-11 — Reconcile uncertain parent or cleanup results

(FR-SY-08; Q-SY-02; Q-SH-01)

Given the parent save or rollback result cannot be confirmed, when reporting the
failure, then explain uncertainty, reconcile before retry or a rollback-success
claim, and leave existing systems untouched. If an existing system was reused,
no rollback may remove it. Creation identification remains an open design action.

</details>

</details>

<details>
<summary><strong>WF-SY-03: Add a game system from the campaign form</strong></summary>

**Source:** WF-SY-03; FR-SY-09–12; Q-SY-02–03. Shared criteria and the parent
campaign creation or editing criteria apply.

<details>
<summary><strong>Entry, reuse and validation</strong></summary>

### AC-SY-12 — Enter or select a system within Manage → Campaigns

(FR-SY-09)

Given a new or edited campaign form, when typing a system name, then an existing
system can be selected or a new name and primary color can be entered without
leaving Manage → Campaigns.

### AC-SY-13 — Reuse a matching system without changing it

(FR-SY-10; Q-SY-03)

Given a typed name matches an existing system after trimming, character
normalization and ignoring case, when completing the system choice, then explicitly
offer the existing system and reuse its ID when chosen. Its name and color remain
unchanged and no duplicate is created.

### AC-SY-14 — Validate both new system and campaign

(FR-SY-10; FR-SY-01, FR-SY-02; FR-SH-02)

Given a new system name, when its required name/color or the parent campaign
values are invalid, then explain the error before creation, retain values and
create neither record. On an edited parent, its stored values remain unchanged.

</details>

<details>
<summary><strong>Saving and rollback</strong></summary>

### AC-SY-15 — Persist the campaign's system association

(FR-SY-11)

Given valid parent and system values, when saving succeeds and the app reloads,
then the saved campaign references the chosen system ID. A newly created system
remains reusable, and editing the parent retains its existing campaign ID.

### AC-SY-16 — Recover a failed parent campaign save

(FR-SY-12; Q-SY-02; Q-SH-01)

Given this attempt created a system but its parent campaign is confirmed unsaved,
when recovery completes, then remove only that new system, retain entered values
and explain the parent-save failure and confirmed rollback. Existing systems and
the edited campaign's previously stored values are unchanged. Never remove a
reused system. Reconcile unknown save or cleanup outcomes before retry or claiming
rollback success, as in AC-SY-11.

</details>

</details>

<details>
<summary><strong>WF-SY-04: Edit a game system's name or primary color</strong></summary>

**Source:** WF-SY-04; FR-SY-13–16; Q-SY-04. Shared criteria apply.

<details>
<summary><strong>Loading and validation</strong></summary>

### AC-SY-17 — Load and update the same system

(FR-SY-13)

Given an existing system, when Edit is chosen, then its stored name and primary
color load. Saving valid changes updates that same system ID without creating
another system.

### AC-SY-18 — Validate edits without rejecting the system's own name

(FR-SY-14; FR-SY-01, FR-SY-02)

Given an edited system, when its own name and a valid color are saved, then the
name is not treated as a duplicate. Blank names, invalid colors or names matching
another normalized system name are rejected with edited values retained and the
stored system unchanged.

</details>

<details>
<summary><strong>Display updates and alternative outcomes</strong></summary>

### AC-SY-19 — Refresh historical labels and derived colors

(FR-SY-15; Q-SY-04)

Given campaigns and sessions reference the system, when its name or color update
is confirmed and views refresh, then applicable labels, primary colors, previews
and derived shades use the new values, including historical displays. Campaign
and session system IDs remain unchanged and the updated values persist after reload.

### AC-SY-20 — Clear or correct a rejected system edit

(FR-SY-16)

Given unsaved system edits, when Clear is chosen, then the stored system remains
intact. Given confirmed rejection, then the stored system remains intact and the
edited values and error explanation remain available for correction.

</details>

</details>

## Calendar and session history

<details>
<summary><strong>WF-HI-01: Browse the calendar or mobile agenda</strong></summary>

**Source:** WF-HI-01; FR-HI-01–04. Shared read-only criteria apply.

<details>
<summary><strong>Navigation and recorded dates</strong></summary>

### AC-HI-01 — Navigate months and return to local today

(FR-HI-01)

Given a displayed month, when Previous month or Next month is chosen, then move
one month in that direction, including across a year boundary. Today returns to
the browser-local current month.

### AC-HI-02 — Show sessions on their recorded dates

(FR-HI-02)

Given sessions in several months, when a month is displayed, then calendar entries
appear on their recorded dates. The mobile agenda lists only the selected month's
sessions in chronological order, including future dates in that month.

</details>

<details>
<summary><strong>Mobile access and empty months</strong></summary>

### AC-HI-03 — Browse and open a session on a narrow screen

(FR-HI-03)

Given a narrow-screen layout and sessions in the selected month, when the agenda
is used, then those sessions can be browsed and a listed entry opens that session's
details. Opening does not select a different record or create a new session.

### AC-HI-04 — Keep month title, count and empty state consistent

(FR-HI-04; FR-SH-01)

Given a known session count for a month, when it is displayed, then the title and
count identify that month and its count. An empty month shows zero and a clear
empty state. Navigation and display changes leave stored records unchanged.

</details>

</details>

<details>
<summary><strong>WF-HI-02: Open a session to view its details</strong></summary>

**Source:** WF-HI-02; FR-HI-05–08. Shared read-only criteria apply.

<details>
<summary><strong>Selected record and recorded values</strong></summary>

### AC-HI-05 — Open the selected session from each entry point

(FR-HI-05)

Given several sessions, including ones with identical names or dates, when a
calendar chip, agenda entry or history Edit action is selected, then the form
opens the exact session ID attached to that entry.

### AC-HI-06 — Inspect recorded values without replacing defaults

(FR-HI-06)

Given a session whose campaign defaults have since changed, when details open,
then type, campaign or one-shot name, date, GM, system, link and notes match the
recorded session. Current campaign defaults do not replace recorded values.

</details>

<details>
<summary><strong>Closing and unavailable records</strong></summary>

### AC-HI-07 — Close details without writing

(FR-HI-07)

Given the unsaved details form with no write pending and no picker open, when
Close or Escape is used, then no create, update or delete request is sent and
the previous view remains available. Picker and pending-save Escape behavior
remain a separate open decision.

### AC-HI-08 — Explain that a selected record is unavailable

(FR-HI-08)

Given a visible entry's session was removed before opening, when the entry is
selected, then show a clear unavailable-record message. Do not display another
session or invent the missing record's details, and do not write data.

</details>

</details>

<details>
<summary><strong>WF-HI-03: Search and filter session history</strong></summary>

**Source:** WF-HI-03; FR-HI-09–12; Q-HI-01–02. Shared read-only criteria apply.

<details>
<summary><strong>Search scope and combined filters</strong></summary>

### AC-HI-09 — Offer history search and filter controls

(FR-HI-09)

Given Session history is expanded, when controls are reviewed, then text search
and campaign, one-shot, GM and system filtering are available, with All choices
that clear the corresponding restrictions.

### AC-HI-10 — Search only the agreed fields

(FR-HI-10; Q-HI-01)

Given distinct text in campaign/one-shot names, GM names, system names, recorded
dates, notes and links, when searching each value, then names, GM, system and
displayed `dd/mm/yyyy` date text can match; text matching ignores case. For
example, searching `28/10/2026` finds a session whose displayed date is
`28/10/2026` and whose stored date is `2026-10-28`. A term found only in notes or
a link does not make a row match.

### AC-HI-11 — Combine every active condition

(FR-HI-11)

Given search text and multiple filters are active, when results update, then a
row appears only if it satisfies the search and every active filter. A one-shot
restriction excludes campaign sessions; a selected campaign excludes other
campaigns and one-shots.

### AC-HI-12 — Keep history independent of the calendar month

(FR-HI-11; Q-HI-02)

Given matching sessions outside the displayed calendar month, when history is
searched or the calendar month changes, then those sessions remain in history
unless history's own search or filters exclude them.

</details>

<details>
<summary><strong>No matches and clearing conditions</strong></summary>

### AC-HI-13 — Restore complete history after clearing conditions

(FR-HI-12; FR-SH-01)

Given conditions that match no sessions, when results update, then show
**No sessions found**. Clearing search and returning every filter to All restores
the complete history in its current sort order without changing stored records.

</details>

</details>

<details>
<summary><strong>WF-HI-04: Sort session history</strong></summary>

**Source:** WF-HI-04; FR-HI-13–17; Q-HI-03. Shared read-only criteria apply.

<details>
<summary><strong>Columns and direction</strong></summary>

### AC-HI-14 — Sort using each supported column

(FR-HI-13)

Given visible history rows, when Date, Campaign / One-shot, GM or System is
selected as the sort column, then matching rows are ordered by that value.

### AC-HI-15 — Compare dates and text consistently

(FR-HI-14)

Given dates spanning months and years and names differing in case or numeric
parts, when sorting, then dates use calendar chronology rather than formatted
text order. Text comparisons ignore case and compare numeric parts consistently;
for example, ascending System 2 precedes System 10.

### AC-HI-16 — Reverse direction while retaining conditions

(FR-HI-15; FR-SH-01)

Given an active search and filters, when the current sort heading is selected
again, then its direction reverses while the same rows continue to match. Search,
filter selections and stored values remain unchanged.

</details>

<details>
<summary><strong>Visible state and stable ties</strong></summary>

### AC-HI-17 — Indicate the sort column and direction

(FR-HI-16)

Given a sort column and direction are selected, when history is displayed, then
the owner can identify both from the interface. This is a **Should**
criterion, following its source requirement.

### AC-HI-18 — Use stable session-ID ordering for ties

(FR-HI-17; Q-HI-03)

Given several rows have equal primary sort values, when the same filtered history
is refreshed with the same sort column and direction, then session ID determines
their stable secondary order and tied rows do not move unpredictably. No secondary
direction beyond the source decision is prescribed here.

</details>

</details>

## Statistics

<details>
<summary><strong>WF-ST-01: View statistics for a selected month</strong></summary>

**Source:** WF-ST-01; FR-ST-01–04; Q-CS-03; Q-ST-01. Shared read-only criteria apply.

<details>
<summary><strong>Period and counting</strong></summary>

### AC-ST-01 — Select and identify the month and year

(FR-ST-01)

Given Monthly Stats is open, when another month and year are selected, then the
display clearly identifies that period and recalculates its figures.

### AC-ST-02 — Count every session in the month once

(FR-ST-02; Q-CS-03)

Given sessions before, within and after the selected month, when statistics are
displayed, then each session dated in that month contributes once, including
future-dated sessions. Changing calendar month or history filters does not change
the selected statistics period or its total.

### AC-ST-03 — Reconcile totals with breakdowns

(FR-ST-03)

Given campaign sessions and standalone one-shots, when monthly breakdowns are
displayed, then each session contributes once to its campaign group and system
group. Standalone sessions use **One-shots** in the campaign breakdown. Each
complete breakdown sums to the monthly session total.

</details>

<details>
<summary><strong>Empty periods and ties</strong></summary>

### AC-ST-04 — Show a clear empty month

(FR-ST-04)

Given no sessions are dated in the selected month, when statistics are displayed,
then show zero sessions and a clear empty state without presenting a sole
most-played group or favorite system as if sessions existed.

### AC-ST-05 — Identify tied monthly highlights

(FR-ST-04; Q-ST-01)

Given two or more groups share the highest count or two or more systems share
the highest count, when monthly highlights are displayed, then identify the
applicable result as a tie instead of presenting one as the sole winner.

</details>

</details>

<details>
<summary><strong>WF-ST-02: View the Year Review for a selected year</strong></summary>

**Source:** WF-ST-02; FR-ST-05–08; Q-ST-01–02. Shared read-only criteria apply.

<details>
<summary><strong>Year choices and totals</strong></summary>

### AC-ST-06 — Offer the current and all recorded years

(FR-ST-05)

Given the browser-local current year and sessions in past and future years, when
Year Review opens, then the year choices include the current year and each year
containing a session. Choosing one recalculates the review for that year.

### AC-ST-07 — Reconcile the annual total and twelve monthly totals

(FR-ST-06; Q-CS-03)

Given sessions across several years, when a year is selected, then each session
dated in that year counts once, including future dates. The twelve displayed
monthly counts sum to the annual total and exclude sessions from other years.

### AC-ST-08 — Show consistent annual breakdowns and tied highlights

(FR-ST-07; Q-ST-01)

Given a selected year with recorded sessions, when Year Review is displayed, then
campaign, system and GM breakdowns account for its sessions and each sums to its
annual total. Busiest-month, most-played and favorite-system highlights identify
ties where counts are equal rather than implying a sole winner.

</details>

<details>
<summary><strong>Longest Break and empty years</strong></summary>

### AC-ST-09 — Calculate elapsed days between consecutive session dates

(FR-ST-07; Q-ST-02)

Given a selected year, when Longest Break is calculated, then it is the largest
elapsed calendar-day difference between consecutive recorded session dates in
that year. Sessions on 5 and 10 January with no intervening session produce five
days; sessions on the same date have a zero-day gap. Exclude gaps to year boundaries
and to sessions in other years. Fewer than two sessions produces zero.

### AC-ST-10 — Keep an empty year usable

(FR-ST-08)

Given an available year with no sessions, when Year Review is displayed, then
show a clear empty state and allow choosing another year or configuring My GM
name. Viewing the empty year creates or changes no session records; saving the
GM setting remains a separate write.

</details>

</details>

<details>
<summary><strong>WF-ST-03: Set or change My GM name and compare games ran versus played</strong></summary>

**Source:** WF-ST-03; FR-ST-09–12; Q-ST-03. Shared criteria apply, including
pending-write protection for the setting change.

<details>
<summary><strong>Choices and comparison</strong></summary>

### AC-ST-11 — Offer known names and reject arbitrary values

(FR-ST-09)

Given GM names used by sessions or campaign defaults and any saved choice, when
My GM name is opened, then those choices and an empty selection are available.
A listed name or empty selection is accepted; an unrelated arbitrary name is
rejected without replacing the confirmed setting.

### AC-ST-12 — Match normalized names and partition the year's sessions

(FR-ST-10; Q-ST-03)

Given a confirmed My GM name and the owner's attended-game dataset, when the
selected year's comparison is calculated, then normalize character forms, trim
surrounding spaces and ignore case when matching session GM. Matching sessions
count as Ran; all others count as Played. Ran plus Played equals that year's
session total. Multiple aliases are not combined by this policy.

</details>

<details>
<summary><strong>Persistence, clearing and rejection</strong></summary>

### AC-ST-13 — Persist a changed choice without rewriting GMs

(FR-ST-11)

Given a valid name is selected or changed and saving is confirmed, when the
comparison refreshes and the app reloads, then the saved choice remains and the
comparison uses it. Recorded session GM text remains unchanged.

### AC-ST-14 — Clear the choice and return to unconfigured state

(FR-ST-11)

Given a configured comparison, when an empty selection is confirmed saved, then
hide the comparison and ask the owner to choose a name. Reload retains the empty
choice without changing any session GM values.

### AC-ST-15 — Keep the previous confirmed choice on rejection

(FR-ST-12; FR-SH-03–05)

Given a previously confirmed choice, when another setting change is confirmed
rejected, then the previous choice remains authoritative, feedback explains the
error and retry is available after the request ends. Do not display the rejected
choice as saved. An unknown result follows AC-SH-08 instead.

</details>

</details>

## Import and export

<details>
<summary><strong>WF-DA-01: Export tracker data to CSV</strong></summary>

**Source:** WF-DA-01; FR-DA-01–04; Q-DA-01. Shared read-only criteria apply.

<details>
<summary><strong>Export contents and compatibility</strong></summary>

### AC-DA-01 — Export the full set of records

(FR-DA-01)

Given records across several periods, archived campaigns and active history
filters, when Manage → Export CSV is used, then the downloaded tracker CSV contains
all systems, campaigns and sessions regardless of those views or filters.

### AC-DA-02 — Preserve exported values and relationships

(FR-DA-02)

Given names, dates, relationships, colors, defaults, archive status, links and
notes, including non-Latin text, quotes, commas and line breaks, when the export
is read using the tracker CSV format, then those values and associations are
preserved without text loss, split rows or broken fields.

### AC-DA-03 — Accept populated and empty exports in import preview

(FR-DA-03)

Given a CSV exported from a populated or empty tracker, when it is previewed
through the import workflow, then it is accepted as a valid tracker export. An
empty export shows no additions and does not enable Import new records.

</details>

<details>
<summary><strong>Read-only behavior, failure and scope</strong></summary>

### AC-DA-04 — Keep exports read-only and explain their limits

(FR-DA-04; Q-DA-01)

Given an export request succeeds or fails, when its outcome is reported, then
stored records and settings remain unchanged and a failed download request has
a readable error. Export information does not claim a full database backup or
inclusion of My GM name; that setting is absent from the CSV.

</details>

</details>

<details>
<summary><strong>WF-DA-02: Preview and import new records from a tracker CSV export</strong></summary>

**Source:** WF-DA-02; FR-DA-05–09; Q-DA-02–03. Shared write criteria apply to
Import new records. Preview itself must not write records or settings.

<details>
<summary><strong>Preview, validation and freshness</strong></summary>

### AC-DA-05 — Validate the file without writing

(FR-DA-05)

Given a selected tracker CSV, when Preview file is chosen, then validate its
rows and show row-specific problems without writing records or settings. Enforce
the browser limit in bytes: a valid file at or below 5,000,000 bytes is eligible
for preview; a larger file is rejected before upload.

### AC-DA-06 — Distinguish additions, existing records and duplicates

(FR-DA-06)

Given a preview containing new records, already existing records or duplicates,
when results appear, then show those categories distinctly, including warnings
and validation errors. Enable Import new records only when there are no validation
errors and at least one new record; errors or zero additions prevent applying.

### AC-DA-07 — Block a stale preview

(FR-DA-07)

Given a completed preview, when the selected file changes or underlying record
data changes before apply, then block that preview's import, explain that it is
outdated and require another preview. No records from the stale preview are added.

</details>

<details>
<summary><strong>Backup, additions and reimport</strong></summary>

### AC-DA-08 — Save the automatic backup before additions

(FR-DA-08; Q-DA-01)

Given a current valid preview with additions, when import is confirmed, then save
the pre-import JSON record backup before adding records. If backup creation fails,
report failure and add nothing. The automatic backup is described as excluding
My GM name, with no in-app restore action, rather than as a full database backup.

### AC-DA-09 — Commit additions together and retain existing values

(FR-DA-08; Q-DA-02)

Given new records and conflicts with existing values, when apply succeeds, then
all permitted additions commit together and conflicts are explained without
overwriting existing names, defaults, colors, links, notes or settings. A confirmed
failed apply leaves no partial additions. My GM name remains unchanged. Exact-state
recovery is directed to database restore rather than CSV import.

### AC-DA-10 — Preserve deliberate session multiplicity on reimport

(FR-DA-09; Q-DA-03)

Given session identity is compared by date, campaign/one-shot identity, GM and
system, when a CSV contains two occurrences of one identity but the tracker has
one, then preview and apply add one occurrence. Reimporting that same file again
adds none for that identity. Existing occurrences keep their recorded links and
notes even if the file supplies different ones.

### AC-DA-11 — Report counts and retain imported records

(FR-DA-09; FR-SH-05)

Given a successful import and refresh, when completion is shown, then added
counts match the actual system, campaign and session additions and applicable
views reflect them. Reload retains those additions and the existing dataset.

### AC-DA-12 — Require another preview after a failed apply

(FR-DA-09; FR-SH-05; Q-SH-01)

Given apply fails, when another import is attempted, then require a new preview
rather than reusing the failed apply's preview. If the write result was lost,
first explain and reconcile the unknown outcome under AC-SH-08; do not assume
that nothing was imported or automatically apply the file again.

</details>

</details>

<details>
<summary><strong>WF-DA-03: Export tracker data to JSON through the API</strong></summary>

**Source:** WF-DA-03; FR-DA-10–13; Q-DA-01. Shared read-only criteria apply.

<details>
<summary><strong>Collections and exported values</strong></summary>

### AC-DA-13 — Return all record collections

(FR-DA-10)

Given a running app with recorded data, when `/api/export` is requested, then its
JSON response has collections named `systems`, `campaigns` and `sessions`, including
archived campaigns and sessions from every recorded date regardless of UI filters.

### AC-DA-14 — Preserve identifiers, relationships and text

(FR-DA-11)

Given identifiers, cross-record references and exported values including non-Latin
names, links and multiline notes, when JSON export is decoded, then those values
and relationships remain intact. Empty collections are valid empty JSON lists.

</details>

<details>
<summary><strong>Read-only behavior and documented scope</strong></summary>

### AC-DA-15 — Return a readable request failure without mutations

(FR-DA-12)

Given the endpoint succeeds or cannot complete its request, when the response
is returned, then stored records and settings are unchanged. Failure returns an
error response rather than a successful export containing fabricated or incomplete data.

### AC-DA-16 — Document the limits of JSON export

(FR-DA-13; Q-DA-01)

Given the export endpoint and its documentation, when their scope is inspected,
then My GM name and other tracker settings are excluded, and documentation says
this is neither a full database backup nor a supported in-app JSON restore workflow.

</details>

</details>

## Setup and maintenance

Verify Python and Docker procedures separately using isolated storage. These
criteria concern the guide and the resulting app state; they do not require new
in-app backup, restore or reset controls.

<details>
<summary><strong>WF-MA-01: Start the app for the first time with demo sessions</strong></summary>

**Source:** WF-MA-01; FR-MA-01–04.

<details>
<summary><strong>Launch instructions and initial data</strong></summary>

### AC-MA-01 — Follow either documented launch path

(FR-MA-01)

Given a fresh installation with the relevant environment ready, when Getting
started is followed for Python or Docker, then it identifies that launch method
and how to open the running app in a browser.

### AC-MA-02 — Load the supplied fictional demo once

(FR-MA-02)

Given empty storage and the supplied demo source enabled, when the app initializes,
then its fictional systems, campaigns and sessions load with their recorded dates
and correct campaign/system relationships. Browsing a supplied demo month shows
those sessions, and reload retains them.

</details>

<details>
<summary><strong>Restarts and date guidance</strong></summary>

### AC-MA-03 — Preserve populated data on restart

(FR-MA-03)

Given an initialized dataset with a recorded edit, when the app restarts with the
demo source still enabled, then the existing edit remains and no additional demo
copy is appended. Systems, campaigns and session counts remain unchanged.

### AC-MA-04 — Explain which months contain the demo

(FR-MA-04)

Given the supplied demo's date range, when setup guidance is read, then it names
that range so the owner can browse a demo month and understand an empty current
calendar. This is a **Should** criterion; the current Getting started
guide identifies January–May 2026.

</details>

</details>

<details>
<summary><strong>WF-MA-02: Start the app for the first time without demo sessions</strong></summary>

**Source:** WF-MA-02; FR-MA-05–08.

<details>
<summary><strong>Preparation and empty first launch</strong></summary>

### AC-MA-05 — Identify and disable the demo source before launch

(FR-MA-05)

Given the project has not been launched, when the data guide is followed, then
it identifies `ttrpg_tracker/app/import_source/demo_sessions.csv` and explains
renaming it to `demo_sessions.csv.disabled` before starting the app.

### AC-MA-06 — Initialize storage without demo records

(FR-MA-06)

Given new empty storage and no enabled demo source, when Python or Docker startup
completes, then usable storage exists with zero systems, campaigns and sessions.
No fictional demo records are added.

</details>

<details>
<summary><strong>Empty-state usability and later restarts</strong></summary>

### AC-MA-07 — Begin setup from empty views

(FR-MA-07)

Given successful startup with no records, when the tracker opens, then empty
views are presented as empty data rather than a load failure, and system or
campaign setup can be opened to begin recording games.

### AC-MA-08 — Explain and preserve disabled seeding

(FR-MA-08)

Given the demo source is disabled, when the guide is read, then it explains that
existing imported records are not removed and the source must stay disabled to
avoid seeding a later empty dataset. Restart with it disabled adds no demo data,
whether storage remains empty or contains personal records.

</details>

</details>

<details>
<summary><strong>WF-MA-03: Make a full database backup</strong></summary>

**Source:** WF-MA-03; FR-MA-09–12; Q-MA-01. This is a manual procedure.

<details>
<summary><strong>Storage location and safe copying</strong></summary>

### AC-MA-09 — Identify the database actually in use

(FR-MA-09)

Given default Python storage, Docker storage or a custom `TTRPG_DB_PATH`, when
backup instructions are followed, then they identify the active database for that
configuration. They distinguish the default Python file from Docker's database
and explain how the configured path changes the copy source.

### AC-MA-10 — Stop writes and retain the original database

(FR-MA-10)

Given a running app and its active database, when a full backup is made following
the guide, then stop the app before copying, copy the complete database and retain
the original. Restart resumes with the same records and settings.

</details>

<details>
<summary><strong>Backup scope, destination and checks</strong></summary>

### AC-MA-11 — Distinguish full backup from record export

(FR-MA-11; Q-DA-01)

Given a dataset with My GM name configured, when backup guidance is inspected,
then it states that the database copy includes records and tracker settings,
including My GM name. CSV, JSON export and the automatic pre-import record backup
are described as excluding that setting.

### AC-MA-12 — Save and check a separate dated copy

(FR-MA-12; Q-MA-01)

Given an available backup destination, when the manual procedure is followed,
then save under a dated filename outside the project or active Docker storage
and check that the separate copy exists before restart. The procedure does not
claim that file existence alone proves restore success; verify that under WF-MA-04.

</details>

</details>

<details>
<summary><strong>WF-MA-04: Restore a full database backup</strong></summary>

**Source:** WF-MA-04; FR-MA-13–16; Q-MA-02. Verification uses disposable storage
and the same app version before any cross-version migration claim.

<details>
<summary><strong>Preparation and replacement</strong></summary>

### AC-MA-13 — Disclose replacement and preserve the current database

(FR-MA-13)

Given a selected full database backup, when restore instructions are read and
followed, then they explain that all current records and settings are replaced
and require a separate copy of the current database before replacement.

### AC-MA-14 — Replace the correct target while stopped

(FR-MA-14)

Given the active Python or Docker storage configuration, when the procedure is
followed, then it identifies that target and requires the app to remain stopped
while replacing the database with the selected copy.

</details>

<details>
<summary><strong>Restored state and recovery checks</strong></summary>

### AC-MA-15 — Load only the selected backup's state

(FR-MA-15)

Given backup A differs from the active dataset B, when A is restored and the
same app version restarts, then records, totals and My GM name reflect A and do
not merge with B. For an empty restored dataset, the guide accounts for disabling
the demo source so startup does not unexpectedly populate it.

### AC-MA-16 — Check the restart and recover a failed restore

(FR-MA-16)

Given a completed replacement, when following the post-restart checklist, then
check records, totals and My GM name against the selected backup. If startup or
validation fails, the guide explains stopping the app and recovering with the
preserved pre-restore copy, followed by checking that recovered state.

### AC-MA-17 — Verify the same-version procedure first

(FR-MA-16; Q-MA-02)

Given restore documentation and planned evidence, when supported scope is reviewed,
then the initial procedure and verification use the same app version. A backup
from another version is not described as verified without a separately documented
and tested migration procedure.

</details>

</details>

<details>
<summary><strong>WF-MA-05: Start over with an empty tracker after trying the demo</strong></summary>

**Source:** WF-MA-05; FR-MA-17–20; Q-MA-03. This is a manual reset, including
personal additions in the active dataset; selective demo removal is out of scope.

<details>
<summary><strong>Backup and preparation</strong></summary>

### AC-MA-18 — Explain the full reset scope before proceeding

(FR-MA-17; Q-MA-03)

Given a trial dataset containing both demo and personal records, when reset
instructions are read, then they state that all active games will be removed,
including personal additions, and require a separate full backup first. They
describe a manual procedure without implying an in-app or selective-demo reset.

### AC-MA-19 — Disable seeding and stop the app first

(FR-MA-18)

Given the owner is following reset instructions with a checked full backup, when
preparation is completed, then the demo source is disabled and the app is stopped
before changing active database storage.

</details>

<details>
<summary><strong>Storage-specific reset and empty restart</strong></summary>

### AC-MA-20 — Distinguish Python and Docker reset effects

(FR-MA-19)

Given the chosen launch method, when reset instructions are followed, then Python
instructions move aside the active database, while Docker instructions target
Docker storage. The guide explicitly discloses that its Docker volume reset also
removes cached dependencies and that removing the project's local database does
not reset Docker's stored data. The external full backup is retained.

### AC-MA-21 — Restart empty without reloading the demo

(FR-MA-20)

Given reset completed with demo seeding disabled, when the app restarts, then
systems, campaigns and sessions are empty and new-record setup is available.
Further restarts remain free of demo data while its source stays disabled. The
previous dataset remains in the separate full backup.

</details>

</details>

## Planned workflows and improvements

These approved criteria express the approved product decisions and requirements.
Quick Add and the improved campaign-deletion interaction remain planned; no
implementation, reproduced diagnosis or passed retest is implied.

<details>
<summary><strong>WF-QA-01: Record a campaign session through Quick Add (planned)</strong></summary>

**Source:** WF-QA-01; FR-QA-01–04; Q-QA-01–02. Shared criteria apply when the
shortcut is implemented. The separate ordinary campaign-session form retains its
existing scope and archived-campaign selection.

<details>
<summary><strong>Shortcut defaults and explicit choices</strong></summary>

### AC-QA-01 — Identify the campaign and prefill its defaults

(FR-QA-01)

Given Quick Add is implemented for an active campaign, when its identifiable
Add shortcut is chosen, then the campaign is clear and its GM, system and optional
link prefill session entry. Providing this shortcut is a **Should**
criterion under FR-QA-01; the following requirements apply when it is provided.

### AC-QA-02 — Require explicit date confirmation

(FR-QA-02; Q-QA-01)

Given the Add shortcut is open, when a save is attempted before the owner explicitly
confirms a valid date, then do not save. After date confirmation, valid entry can
proceed. Every shortcut makes its campaign and date behavior clear; if a separate
Log today action is offered, its label or explanation clearly states that it
records browser-local today rather than the currently browsed calendar date.

### AC-QA-03 — Review overrides and restrict shortcuts to active campaigns

(FR-QA-03; Q-QA-02; Q-CS-02)

Given active and archived campaigns, when Quick Add shortcuts are displayed, then
only active campaigns appear. Within Add, the owner can review and override session
values, including optional fields, without changing campaign defaults. Archived
campaigns remain selectable through the ordinary session form.

</details>

<details>
<summary><strong>Saving and recovery</strong></summary>

### AC-QA-04 — Validate and persist one campaign session

(FR-QA-04; FR-SH-02–05)

Given confirmed date and valid final values, when saving succeeds, then exactly
one session is linked to the chosen campaign and retains those values after
reload. Repeated pending actions send no extra request; invalid required values,
references, dates or supplied links retain the form with an explanation and no
session. Confirmed success refreshes applicable views before completion feedback.

### AC-QA-05 — Separate failed refresh from uncertain creation

(FR-QA-04; Q-SH-01)

Given confirmed creation followed by refresh failure, when recovering, then
refresh without another creation request. Given a lost creation result, then
explain uncertainty and reconcile before retry; do not assume a failed write.
Creation-request identification remains part of the shared design action.

</details>

</details>

<a id="blocked-campaign-deletion-acceptance-criteria"></a>
<details>
<summary><strong>WF-CP-06: Improve blocked campaign deletion and error feedback (planned)</strong></summary>

**Source:** [WF-CP-06](requirements-and-rules.md#wf-cp-06-improve-blocked-campaign-deletion);
FR-CP-22–26; Q-CP-04–06;
[DEF-002](test-records.md#def-002-campaign-delete-feedback). Shared criteria apply.
AC-CP numbering continues after WF-CP-05.

<details>
<summary><strong>Known restrictions and explicit archiving</strong></summary>

### AC-CP-23 — Make known blocked deletion unavailable

(FR-CP-22; Q-CP-05)

Given the loaded data shows a campaign has linked sessions, when its Manage
actions are reviewed, then Delete is unavailable with a visible reason and cannot
open a usable Delete confirmation. An active campaign still offers a separate
Archive action. This follows **Should** priority FR-CP-22; Q-CP-05 itself
is an agreed product decision.

### AC-CP-24 — Identify an already archived linked campaign

(FR-CP-24; Q-CP-05–06)

Given an archived campaign has sessions, when its actions or blocked-deletion
context are displayed, then identify it as already archived, explain why deletion
is blocked and do not offer or send an unnecessary archive request.

### AC-CP-25 — Retain context for a readable HTTP 409 rejection

(FR-CP-23; FR-CP-18; Q-CP-04–06)

Given an apparently empty campaign gained a session after loading, when deletion
receives a readable HTTP 409 linked-session rejection, then retain the campaign
and all sessions and keep the dialog or usable action context visible. Explain
that recorded sessions prevent deletion; for an active campaign offer Archive
and Cancel. Do not replace the business reason with a generic connection error.

### AC-CP-26 — Archive only when explicitly chosen

(FR-CP-24; Q-CP-06)

Given a blocked deletion for an active campaign, when the owner explicitly chooses
Archive, then submit the separate archive action and preserve every session.
Cancel or Close sends neither deletion nor archive requests. A blocked deletion
alone must never trigger archiving.

</details>

<details>
<summary><strong>Uncertain outcomes and valid empty-campaign deletion</strong></summary>

### AC-CP-27 — Explain a connection interruption as an unknown outcome

(FR-CP-25; Q-CP-06)

Given the deletion result is lost after a connection interruption, when feedback
appears, then keep usable context and explain that deletion could not be confirmed.
Do not claim deletion succeeded or the campaign is unchanged, and do not send an
automatic repeat deletion or archive request.

### AC-CP-28 — Check current records before another deletion attempt

(FR-CP-25; Q-CP-06)

Given an unknown deletion outcome, when recovery is chosen, then check the campaign
list for the target ID before offering another deletion attempt. If it is absent,
do not send another deletion for it. If the check fails, keep the outcome unknown
and explain that confirmation is still unavailable. A check is read-only and does
not itself retry deletion.

### AC-CP-29 — Refresh a confirmed deletion without deleting again

(FR-CP-26; FR-SH-05; Q-CP-06)

Given deletion is confirmed but refreshing the list fails, when feedback appears,
then explain that the campaign was deleted and the displayed list needs refreshing.
Recovery refreshes choices without sending another deletion request.

### AC-CP-30 — Keep valid deletion pending until its result is known

(FR-CP-26; FR-CP-17, FR-CP-19, FR-CP-20; FR-SH-03–05)

Given a campaign remains empty, when deletion is explicitly confirmed, then keep
the action pending and prevent repeated submissions until its result is known.
Confirmed success closes the dialog, refreshes choices and reports deletion after
refresh. Only that campaign is removed and remains absent after reload; cancellation
before submission leaves it unchanged. Rejection and unknown outcomes follow the
separate criteria above.

</details>

</details>

## Actions needed

**Current state:** All acceptance criteria are approved as version 1.0, together
with the approved Main workflow tables, business rules and requirements.
A-01 and A-11 are complete. Recovery design, implementation and verification
actions remain open; approval does not establish that the app meets the criteria.

<details>
<summary><strong>Approval, recorded decisions and open design</strong></summary>

| Action | Required outcome | Related criteria or source |
| --- | --- | --- |
| A-01 — Review acceptance criteria | Complete — the owner approved all workflow and shared acceptance criteria on 28 October 2026 as version 1.0. | All workflow and shared criteria; FU-SH-01 |
| A-02 — Finish save-recovery design | Define how a creation attempt is identified even when deliberate records can look identical. Specify messages, form state, safe reconciliation/retry and failed rollback handling. Update WF-CS-01 requirements and criteria only after its gap is resolved; the agreed Q-SH-01 principle does not itself close GAP-CS-01. | GAP-CS-01; Q-SH-01; AC-SH-07–08; AC-CS-29; AC-SY-11, AC-SY-16; AC-QA-05 |
| A-03 — Decision recorded: repeated campaign-session entries | Q-CS-06 permits deliberate sessions for the same campaign and date. BR-CS-13, FR-CS-25 and approved AC-CS-31 record the result. Execution remains planned. | FU-CS-02; Q-CS-06; AC-CS-31 |
| A-04 — Decision recorded: Escape and closing during save | Q-CS-07 makes Escape close an open picker first and blocks form closing during save. FR-CS-16/18 and approved AC-CS-20/22 record the result; implementation verification remains planned. | FU-CS-03; Q-CS-07; AC-CS-20/22 |
| A-05 — Decision recorded: API defaults and browser inputs | Q-CS-08 retains API fallback to campaign GM/System defaults for omitted inputs while keeping both required in the browser. FR-CS-11 and approved AC-CS-11/32 record the result; verification remains planned. | FU-CS-04; Q-CS-08; AC-CS-11/32 |

</details>

<details>
<summary><strong>Implementation and defect verification</strong></summary>

| Action | Required outcome | Related criteria or source |
| --- | --- | --- |
| A-06 — Implement and verify rollback behavior | Check campaign-plus-first-session and new-system parent saves, including creation and editing failures and combined new campaign/system attempts. Remove only records created by the failed attempt, preserve existing records and handle uncertain cleanup without false success. These outcomes are agreed intent, not evidence of an existing fix. | Q-CS-04–05; Q-SY-02–03; AC-CS-25–30; AC-SY-08–16 |
| A-07 — Reproduce and improve blocked campaign deletion | Capture the running version, request/response, console and server evidence for DEF-002. Distinguish a readable HTTP 409 from a connection/body-read failure; implement the agreed interaction while preserving the server guard, then retest active, archived, empty, stale-data and interrupted-deletion scenarios. | DEF-002; Q-CP-04–06; AC-CP-18–30 |
| A-08 — Design and implement Quick Add | Specify the date-confirmation interaction and any separate Log today action, then implement active-campaign shortcuts and verify their save/recovery behavior. Keep this feature marked planned until implemented and tested. | WF-QA-01; Q-QA-01–02; AC-QA-01–05 |

</details>

<details>
<summary><strong>Documentation and test evidence</strong></summary>

| Action | Required outcome | Related criteria or source |
| --- | --- | --- |
| A-09 — Align the data and backup guide | Correct the CSV description that currently says exports include “settings”: Q-DA-01 excludes My GM name. Explain full-backup settings coverage and record-backup limits; add custom-storage guidance, dated backup filenames and a copy-existence check. Document same-version restore checks, settings replacement and recovery using the preserved pre-restore copy. | [Data guide](../data-and-backups.md); Q-DA-01; FR-MA-09–16; AC-DA-04, AC-DA-08, AC-DA-16; AC-MA-09–17 |
| A-10 — Write and execute linked tests | Complete the test plan with app version, browser/launch method, isolated data, UI/API scope, priorities and completion conditions. Turn criteria into test cases, map reusable existing checks, then record actual results, evidence, defects and retests. Include both Python and Docker maintenance paths; keep unexecuted cases explicit. | [Test plan](test-plan.md); [Test cases](test-records.md#test-cases); [Execution results](test-records.md#execution-results) |
| A-11 — Update the portfolio index | Complete — the index now records approved acceptance criteria version 1.0 for all 31 workflows and shared behavior. | [Documentation checklist](README.md) |

</details>

## Version history

| Version | Date | Changes |
| --- | --- | --- |
| 1.0 | 28 October 2026 | First reviewed baseline: the owner approved all workflow and shared acceptance criteria, including Q-CS-06–08 updates. Recovery design, implementation and verification work remains tracked as follow-ups. |

---

**Related documents:**

[Requirements and rules](requirements-and-rules.md) ·
[Test records](test-records.md) · [Documentation checklist](README.md)
