## Roles → permissions

There is a single role, `User` — the PRD defines no admin or shared role.
Every authenticated caller gets the same permissions, scoped strictly to the
todos they own.

## Authentication (Thunder)

- Shared `thunder-app` dependency name: `user-auth` — declared identically on
`todo-webapp` and `todo-api`, so the token the SPA obtains is the same one
the API validates.
- Scopes: `openid profile email` (default).
- Sign-in side: `todo-webapp` (the SPA performs OIDC + PKCE against Thunder).
- Token-validating side: `todo-api` (every endpoint requires a valid bearer
token; the gateway validates it and injects the caller's identity).
- No public, unauthenticated surface: both components require sign-in for
every todo-related action (stories 1–4).

## Role resolution

`todo-api` resolves the caller's identity from the token's subject claim
(injected by the gateway as `X-User-Id`) — there is no separate role claim,
since every signed-in user is simply `User`. Every todo record carries the
owning `userId`, and every read/write is filtered or checked against that
value: a request for a todo the caller does not own is rejected. A request
with no valid token is denied (401) by default — there is no fallback role.