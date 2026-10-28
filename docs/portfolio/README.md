# QA and BA documentation

**Status:** In progress. All 31 Main workflow tables, business rules, functional
requirements and recorded Must/Should priorities are reviewed and approved.
All 37 product decisions are recorded, including Q-CS-07's confirmed applicability
to every session form. All 187 acceptance criteria are approved as version 1.1,
including the 14 new or amended criteria. Ten focused test cases remain drafts,
**Not run**.
Formal campaign-session testing and reproduction of DEF-002 remain planned.

Read the [product decision register](requirements-and-rules.md#product-decisions)
for the 37 choices, grouped into collapsed sections with links to the full
decision wording.

| Document | Purpose | Status |
| --- | --- | --- |
| [Project brief](project-brief.md) | Problem, user, scope and constraints | Done |
| [Requirements and rules](requirements-and-rules.md) | Workflows, requirements, rules and decisions | All 37 product decisions, 31 Main workflow tables, business rules, functional requirements and recorded priorities approved; implementation and verification remain separate |
| [Acceptance criteria](acceptance-criteria.md) | Expected outcomes for all 31 workflows and shared behavior | Version 1.1 — all 187 criteria approved |
| [Process and data models](models.md) | Session flow and record relationships | Activity diagram drafted; data model planned |
| [Test plan](test-plan.md) | Scope, priorities and approach | Focused plan drafted; broader suite and execution planned |
| [Test records](test-records.md) | Test data, cases, results, defects and retests | Ten focused draft cases Not run; DEF-001 fixed; DEF-002 awaiting reproduction |
| [Case study](case-study.md) | Outcomes, decisions and lessons | Planned |

Acceptance-review findings are incorporated into the acceptance criteria's
version 1.1 amendment table and the requirements'
[workflow follow-ups](requirements-and-rules.md#workflow-follow-up).
Statistics ties in existing highlights and system breakdowns (FU-ST-01), shared
session-form keyboard behavior (FU-SH-07), recovery design (FU-SH-02) and focused
test execution remain open. Criterion review (A-01) is complete. The separate
review document has been retired.

Next: use the agreed rollback and
[campaign-deletion recovery decisions](requirements-and-rules.md#wf-cp-06-improve-blocked-campaign-deletion)
to guide implementation and reproduce
[DEF-002](test-records.md#def-002-campaign-delete-feedback).
The campaign-session recovery design details, formal test plan and execution
records remain open. Product agreement does not imply a fix or a passed retest.

[Automated checks](../../ttrpg_tracker/app/README.md#verification) ·
[Data guide](../data-and-backups.md) · [Project overview](../../README.md)
