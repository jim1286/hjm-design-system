# 0.9.1 contrast correction

The patch improves boundaries visible in dark product screens and the secondary action outlines in both themes. Upgrade contracts and the Web or Native renderer to the same exact version. No required theme keys or component props are added.

| Role | Previous | Updated | Contrast on neutral surfaces |
| --- | --- | --- | --- |
| Dark `border` | `#1e293b` | `#64748b` | 3.07–3.95:1 on `surfaceAlt`, `surface`, `bg` |
| Dark `textWeak` | `#64748b` | `#8292a9` | 4.62–5.94:1 on the same surfaces; weaker than `textSub` |
| Secondary Button / IconButton border | `border` | `textSub` | 3.75:1 light / 5.71:1 dark against its `surfaceAlt` fill |

`semanticColors.action.neutral.border` exposes the existing `textSub` theme key for neutral action recipes. Native renderers already resolve these recipes; Web CSS uses the same role. Field idle, focus, invalid, placeholder and hint colors are unchanged.

After upgrading, remove product overrides whose only purpose was restoring these defaults. Keep product-owned treatment for special backgrounds and emphasis. In particular, choose `tone="secondary"` when an icon action needs a visible circular or rounded boundary: the default `ghost` tone remains transparent and has no visible outline.

The reported ratios describe opaque enabled colors on the three named neutral surfaces. They do not establish contrast for tinted surfaces, photos, opacity overlays, disabled states or custom palettes. Light `textWeak` remains decorative; light `textSub` is not sufficient for small text on every neutral surface, so meaningful small light-mode copy should use `textMuted` or stronger. Recheck both themes, focus/invalid states and consumer style overrides in the actual product after updating.
