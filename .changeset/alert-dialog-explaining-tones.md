---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

AlertDialog gains `info` and `success` tones.

Tone answers why the dialog interrupted, and `attention` / `danger` only covered
"are you sure?" and "this destroys something". Products also stop the user to
*explain* an action before running it — an intro before a button that copies
content into the account — or to report that one finished. Those were shipping
with the attention mark, so a neutral explanation read as a warning (reported by
a consumer on 2026-09-15).

- Both new tones keep the brand confirm button; only the mark and its wash change.
  `danger` remains the one tone that also repaints the confirm action.
- Alert mode now accepts every tone except `danger`. A danger dialog without a
  cancel would let a destructive act through on a single key press.
- Renderer translation differs and stays documented in `docs/architecture.md`:
  Web paints the product-supplied mark in the tone color, while React Native has
  no mark slot, so on native `attention`, `info` and `success` look alike and
  only `danger` differs.

No migration: existing `attention` / `danger` requests are unchanged. Released as a
patch by owner decision on 2026-09-15 — the axis only widens a union that no
consumer switches on exhaustively today.
