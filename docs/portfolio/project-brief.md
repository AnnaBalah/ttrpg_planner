# Project brief

**Status:** Done.

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

## Scope

The current product covers sessions, campaigns and game systems; a calendar and
searchable history; monthly and annual statistics; and CSV import and export.
It is a self-hosted tracker for one owner's dataset.

The proposed first QA/BA cycle focuses on adding a campaign session, including
defaults, validation and saving. Broader coverage will be added in small steps.
Building for multiple independent user accounts is outside the current scope.

## Constraints and project decisions

Current boundaries for this project:

- One person handles the analysis, development and testing, with AI assistance.
- The app is self-hosted and accessed through a web browser. The host needs a
  compatible Python environment or the supplied Docker setup; see
  [Getting started](../../README.md#getting-started).
- Public examples and test evidence use fictional data. Personal session exports
  remain local.
- Analysis and formal testing start from an existing app, so the documentation
  will distinguish current behavior from intended changes.

[Back to the documentation checklist](README.md)
