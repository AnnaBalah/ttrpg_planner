# Project brief

**Status:** Draft for review. Based on the project owner's description.

## Problem and motivation

I wanted an attractive, central place to record my TTRPG sessions and see my
activity at a glance. I enjoy statistics and wanted to compare the sessions I
ran as a game master (GM) with the sessions I joined as a player.

## Intended user

The primary user is me. Other people are welcome to try the app, but its fit for
their needs has not been established. Changes for other users can be considered
if a specific need arises.

## Objectives

- Keep my session history in one place.
- Present that history through a visually appealing calendar and useful statistics.
- Make it possible to compare my activity as a GM and as a player.
- Use the app as a practical QA/BA portfolio project, with documented analysis,
  tests, findings and improvements.

Success will be assessed through my review of the experience and checks against
fictional data with known results. Detailed acceptance criteria will follow in
[Requirements and rules](requirements-and-rules.md).

## Scope

The current product covers sessions, campaigns and game systems; a calendar and
searchable history; monthly and annual statistics; and CSV import and export.
It is a self-hosted tracker for one owner's dataset.

The proposed first QA/BA cycle focuses on adding a campaign session, including
defaults, validation and saving. Broader coverage will be added in small steps.
Building for multiple independent user accounts is outside the current scope.

## My role

- **BA:** Define needs, clarify rules, write acceptance criteria and record decisions.
- **QA:** Design and execute tests, investigate findings and record the results.
- **Developer:** Build and improve the app with AI assistance from Claude and Codex.

These responsibilities are carried out within one personal project.

## Constraints and open decisions

Current boundaries for this project:

- One person handles the analysis, development and testing, with AI assistance.
- The app is self-hosted; an installation needs a computer on which it can run.
- Public examples and test evidence use fictional data. Personal session exports
  remain local.
- Analysis and formal testing start from an existing app, so the documentation
  will distinguish current behavior from intended changes.

Still to agree: the first hosting and test environment, supported browsers and
devices, and any firm budget or time limits. These have not been assumed.

The app version and environment for the first formal test cycle will be recorded
in the [test plan](test-plan.md) before execution.

[Back to the documentation checklist](README.md)
