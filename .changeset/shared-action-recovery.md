---
"@hjmds/design-contracts": minor
---

Add optional `action-session` behavior for serialized async work, explicit retry,
optimistic failure recovery and stale-result invalidation. Existing AlertDialog,
Button and Toast APIs remain the owners of their UI behavior. Web/native
experimental stories demonstrate save drafts, bookmark rollback and inverse operations.
See `docs/action-session.md` for product-owned idempotency, cache and persistence boundaries.
