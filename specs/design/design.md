## Overview

A simple todo app: a signed-in User creates todos and marks them complete.
`todo-webapp` is the React single-page app the user works in; it calls
`todo-api`, a Ballerina service that owns the Todo entity and persists it in
`todo-db`. Sign-in for both the SPA and the API runs through Thunder, the
platform identity provider, so every todo is scoped to the signer's own
identity and no user ever sees another user's list.

## Context (C1)

```mermaid
graph TD
  User(("User"))
  System["Todo App"]
  Thunder["Thunder\n(Identity Provider)"]

  User -->|signs in, manages todos| System
  System -->|OIDC sign-in| Thunder
```

## Domain model (ER)

```mermaid
erDiagram
  USER {
    string id
    string email
    string displayName
  }
  TODO {
    string id
    string userId
    string text
    boolean completed
    string createdAt
  }
  USER ||--o{ TODO : owns
```

`USER` is resolved from the Thunder-issued token (not a table this system
owns); `TODO` is the one entity `todo-api` persists, always scoped by
`userId`.

## Key flows

### Sign in

```mermaid
sequenceDiagram
  actor User
  participant Webapp as todo-webapp
  participant Thunder
  User->>Webapp: Open app
  Webapp->>Thunder: OIDC + PKCE redirect
  Thunder->>User: Present sign-in
  User->>Thunder: Submit credentials
  Thunder->>Webapp: Redirect with tokens
  Webapp->>Webapp: Store session, show todo list
```

### Create a todo

```mermaid
sequenceDiagram
  actor User
  participant Webapp as todo-webapp
  participant Api as todo-api
  participant DB as todo-db
  User->>Webapp: Enter todo text, submit
  Webapp->>Api: POST /todos (bearer token)
  Api->>Api: Resolve caller identity from token
  Api->>DB: Insert todo (userId, text, completed=false)
  DB-->>Api: Todo record
  Api-->>Webapp: 201 Created
  Webapp-->>User: New todo appears in list
```

### Mark a todo complete

```mermaid
sequenceDiagram
  actor User
  participant Webapp as todo-webapp
  participant Api as todo-api
  participant DB as todo-db
  User->>Webapp: Click "mark complete"
  Webapp->>Api: PATCH /todos/{todoId}/complete (bearer token)
  Api->>DB: Load todo, verify ownership
  Api->>DB: Update completed=true
  DB-->>Api: Updated todo
  Api-->>Webapp: 200 OK
  Webapp-->>User: Todo shows as completed
```