# QA and BA documentation

**Status:** In progress. All 31 Main workflow tables, business rules, functional
requirements and recorded Must/Should priorities are reviewed and approved.
All 37 product decisions are recorded, including Q-CS-06–08. All workflow and
shared acceptance criteria are approved as version 1.0.
Formal campaign-session testing and reproduction of DEF-002 remain planned.

Read the [product decision register](requirements-and-rules.md#product-decisions)
for the 37 choices, grouped into collapsed sections with links to the full
decision wording.

| Document | Purpose | Status |
| --- | --- | --- |
| [Project brief](project-brief.md) | Problem, user, scope and constraints | Done |
| [Requirements and rules](requirements-and-rules.md) | Workflows, requirements, rules and decisions | All 37 product decisions, 31 Main workflow tables, business rules, functional requirements and recorded priorities approved; implementation and verification remain separate |
| [Acceptance criteria](acceptance-criteria.md) | Expected outcomes for all 31 workflows and shared behavior | Version 1.0 — reviewed baseline; all criteria approved |
| [Process and data models](models.md) | Session flow and record relationships | Activity diagram drafted; data model planned |
| [Test plan](test-plan.md) | Scope, priorities and approach | Planned |
| [Test records](test-records.md) | Test data, cases, results, defects and retests | DEF-001 fixed; DEF-002 reported and awaiting reproduction |
| [Case study](case-study.md) | Outcomes, decisions and lessons | Planned |

Next: use the agreed rollback and
[campaign-deletion recovery decisions](requirements-and-rules.md#wf-cp-06-improve-blocked-campaign-deletion)
to guide implementation and reproduce
[DEF-002](test-records.md#def-002-campaign-delete-feedback).
The campaign-session recovery design details, formal test plan and execution
records remain open. Product agreement does not imply a fix or a passed retest.

[Automated checks](../../ttrpg_tracker/app/README.md#verification) ·
[Data guide](../data-and-backups.md) · [Project overview](../../README.md)
