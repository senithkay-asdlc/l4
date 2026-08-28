# Todo App — PRD

## Problem Statement

People juggling day-to-day tasks lose track of what they still need to do when
it lives in their head, on scraps of paper, or in a chat thread. They need one
place, reachable from anywhere they can sign in, that remembers their tasks
for them and shows at a glance what is done and what is not.

## Solution

A simple todo app: a user signs in, adds todos, and marks them complete. Each
user's todos are private to them and persist in a database, so the list is
always there the next time they sign in.

## Actors

- **User** — a signed-in individual who creates their own todos, views their
own list, and marks their own todos complete. There is no admin or shared
role; every user's todos belong only to them.

## User Stories

1. As a User, I want to sign in, so that I can reach my own private todo list.
2. As a User, I want to create a new todo, so that I can capture something I
 need to do.
3. As a User, I want to view my list of todos, so that I can see what is
 pending and what is already done.
4. As a User, I want to mark a todo as complete, so that I can track my
 progress and see it as done.

## Product Decisions

- Sign-in is via SSO through Thunder, the platform identity provider — every
user must sign in before they can see or create any todos.
- Each user's todos are private: a user only ever sees and manages their own
todos, never another user's.
- Todos are persisted in a database, so a user's list survives across
sessions and devices.
- The web app is built as a TypeScript + React single-page app, per
organization standard.

## Out of Scope

- Editing a todo's text after it is created.
- Deleting a todo.
- Un-completing (reopening) a todo once marked complete.
- Due dates, priorities, categories, tags, reminders, or notifications.
- Any admin or manager role, or any shared/team todo list.
- Sharing or collaborating on todos between users.

## Open Questions

None currently — all spine decisions were settled in the interview.