---
"@hjmds/react": patch
---

Keep compact Toast messages and their close control on the same row. Place the
optional action below the message so long localized copy and doubled text remain
readable in narrow cards, including 420px cards in a desktop window. No
descriptor, lifecycle, or Native Toast behavior changes.

Keep Notice actions from shrinking a short retry label into several lines. Long
copy and larger text wrap the action below the content when space runs out.

After consuming the release, BurnTok can remove its temporary `.hjm-toast` and
`.hjm-toast__content` overrides once the product's compact toast is rechecked.
