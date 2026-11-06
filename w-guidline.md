# Windshift task and test-case guideline

Use when creating or updating Tablelog work items and test cases in Windshift.
Each item must state what completion delivers and how to verify it.

## Before writing

- Follow [project working rules](AGENTS.md) for approval, reviews, product decisions
  and owner terminology.
- Read the current item, parent, relevant sources and linked work. Use the latest
  agreed behavior, replace superseded wording and align sources.
- Preserve IDs, links, priorities and their meaning, relationships and unrelated
  content.

## Plain-text presentation

- Use plain labels, blank lines, numbered steps and simple lists in Windshift
  fields; no Markdown, HTML or collapsed sections. List useful sources as names,
  IDs and URLs; label historical snapshots and unpublished local sources.
- Use plain language, short paragraphs and concrete outcomes; explain technical
  terms and name alternatives, affected paths, dependencies and evidence explicitly.
  No fixed length or criterion count is required.
- Keep each item understandable on its own: include essential behavior, completion
  conditions and evidence. Define shared policies, exact messages and setup once;
  reference them precisely, retaining details needed to execute and judge each item.
- Record consequential decisions once in the relevant source or item comment.
  Keep broader planning, approval history and general environment guidance in
  supporting documentation; omit repeated import instructions and generic text.

<details id="stories">
<summary>Stories</summary>

Start with one sentence stating who needs what and why, then use these labels:

1. Scope and completion conditions: included work, exclusions, dependencies
   (including outside the reviewed range), future/design boundaries and concrete
   deliverables from both the story and its children.
2. Acceptance criteria: numbered, observable, testable behavior with existing
   criterion references; separate materially different outcomes.
3. Definition of Done: reviewed implementation, passing evidence for required
   criteria, relevant checks and documentation matching delivered behavior.
   Use the verification and evidence rules below.
4. Reference IDs: relevant existing source IDs, synchronized with the native field.

Keep implementation, verification and documentation deliverables distinct;
do not repeat criteria across sections.

</details>

<details id="child-tasks">
<summary>Child tasks</summary>

Use these plain-text labels: Scope; Completion conditions and evidence; Reference IDs.

State the specific work, finished result and checks or evidence. Reference the
parent's policy, acceptance criteria and Definition of Done without copying them.
Technical tasks need no "As a..." sentence.

</details>

<details id="test-cases">
<summary>Test cases</summary>

- Use an identifiable case ID and behavior-focused title.
- Give reproducible preconditions, setup and input data, including necessary
  fixture details, starting values, counts, IDs and relationships.
- Write for a tester with little technical experience. Use short ordered steps
  in the native Action, Input/Data and Expected result fields. Name the screen
  and button as shown, give example entries, and say what the tester should see
  after each action. Put setup, request checks and other technical work in a
  clearly labeled note for the person helping with the test.
- Identify variations, contexts, controlled-response methods and affected requests
  for pending, rejected or interrupted operations.
- Where relevant, distinguish pre-submit validation, confirmed save rejection,
  confirmed save with failed refresh, and unknown save/rollback results.

</details>

<details id="execution-evidence-and-status">
<summary>Execution, evidence and status</summary>

- Authoring/import does not execute cases; keep drafts Draft / Not run.
  Select cases and runs and prepare fixtures separately from authoring.
- Use fictional data and disposable storage; provide independent starting states
  as needed.
- For each selected case, variation and context, record actual results and Pass,
  Fail, Blocked or Not run; give reasons for unexecuted items. Fail means behavior
  differs from expectations; Blocked means a dependency prevents execution.
  Unavailable planned contexts remain Not run with a reason.
- Identify commit/local changes, environment, launch method, viewport, locale/time
  zone, fixture and storage as applicable. Capture supporting requests, feedback,
  screenshots and before/after stored-data comparisons.
- Link failures to criteria, fixes and fresh retests; retain defect/retest history.
  Source inspection and existing checks are not new passing results. Assess
  automation against criteria before claiming coverage; extend it where repeated
  use justifies maintenance.
- Cycles may close with defects once every selected item has an outcome/reason
  and gaps are stated. Acceptance requires all selected Must criteria to pass;
  deferred Should gaps need the owner's acceptance. Unrun/blocked checks remain gaps.
- Keep agreed behavior, implementation and test results separate. Keep statuses
  accurate; mark complete only with scope-specific evidence. Approval alone does
  not complete implementation or testing; executing tests does not close a story
  with failing required criteria.
- Verify saved descriptions, native fields and links after updates.

</details>

<details id="original-backlog-import-boundaries">
<summary>Original backlog-import boundaries</summary>

- Use Epic -> Story -> Task. Keep Build plan work in stories; future ideas stay
  design-only until design approval.
- The original import covered ten cases. Its unselected sprint, dates and
  assignee are not permanent restrictions.

</details>

## Related sources

- [Project working rules](AGENTS.md) and [Windshift CLI guide](WINDSHIFT.md).
- [Requirements](docs/portfolio/requirements-and-rules.md) and
  [acceptance criteria](docs/portfolio/acceptance-criteria.md).
- [Test plan](docs/portfolio/test-plan.md) and [test records](docs/portfolio/test-records.md).
