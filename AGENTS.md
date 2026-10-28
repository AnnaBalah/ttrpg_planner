# AI working rules

These rules apply throughout Tablelog.

## Working rules

**Approval first.** Ask before writing:

- New checklist items, follow-up tasks, tracking rows or sections in project
  documentation, including splitting an existing entry.
- New documentation files, including reports, AI references, diagrams and their
  editable sources.

Propose the location, purpose and wording or outline in chat; wait for approval.
An explicit request to create an item or document already grants that approval
for the requested scope. Do not ask again.

For wording or status updates, edit the existing content in place. For reviews,
report findings with file locations; make edits when requested.

- Read current files before editing. Change only what the task needs and preserve
  unrelated work, existing links and document structure.
- Keep agreed behavior, current implementation and test results separate.
  Document approval does not complete implementation, testing or open design work.
- Record Anna's approvals with their scope and date. Mark work complete only with
  supporting evidence. Ask before resolving a conflict that changes a product
  decision.
- Check changed text, links and diagrams. For code changes, use the relevant
  checks linked below with disposable databases and fictional data. Report what
  ran and what remains unverified.

Use plain language and concise, structured answers. Explain technical terms when
needed and state the next action when work remains.

## Project map

Tablelog is Anna's self-hosted TTRPG tracker and QA/BA portfolio project.
Read the sources relevant to the task for current decisions and statuses.

| Need | Source |
| --- | --- |
| Project scope and setup | [Main README](README.md) |
| Documentation checklist | [Portfolio README](docs/portfolio/README.md) |
| Workflows, rules and product decisions | [Requirements](docs/portfolio/requirements-and-rules.md) |
| Expected outcomes | [Acceptance criteria](docs/portfolio/acceptance-criteria.md) |
| Process and data diagrams | [Models](docs/portfolio/models.md) and linked diagram sources |
| Test scope and results | [Test plan](docs/portfolio/test-plan.md) and [test records](docs/portfolio/test-records.md) |
| Test commands | [Verification notes](ttrpg_tracker/app/README.md#verification) |
| Database models and API | [main.py](ttrpg_tracker/app/main.py) |
| Browser behavior and appearance | [Frontend](ttrpg_tracker/app/frontend/) |
| Dependencies | [pyproject.toml](ttrpg_tracker/app/pyproject.toml) |
| Storage and backups | [Data guide](docs/data-and-backups.md) |
