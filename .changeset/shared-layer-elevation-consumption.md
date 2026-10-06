---
"@hjmds/react": minor
"@hjmds/react-native": patch
"@hjmds/design-contracts": patch
---

Use foundation layer and elevation tokens in Web surfaces and anchored overlays, and the floating shadow token for Native Surface. Preserve modal-owned popup ordering and keyboard skip-link visibility. The usage handoff audit found that the documented token scale diverged from hard-coded renderer values; update the related usage guides and browser/native regressions together. No new public component or release publication is introduced.

Web `@hjmds/react` is a minor change because the absolute `z-index` numbers move to the `layer` token scale (`@hjmds/design-contracts/foundations`, emitted as `--hjm-layer-*`). The relative order of HJM's own layers is unchanged except where noted below.

| Web surface | Before | After |
| --- | --- | --- |
| BottomCTA (`data-position="sticky"`) | 1 | 100 (`sticky`) |
| FloatingActionButton | 500 | 100 (`sticky`) |
| BottomNavigation | 700 | 100 (`sticky`) |
| Select/Combobox listbox, DatePicker popover, `useAnchoredPopup` default, advanced-forms popups | 800 | 400 (`dropdown`) |
| Menu, Menubar panel, Mentions list | 900 | 400 (`dropdown`) |
| Popover | 950 | 400 (`dropdown`) — shares the menu tier; a popover opened from a menu is portaled later and paints above it |
| Dialog/AlertDialog/Sheet/SidePanel overlay, ContextMenu, CommandPalette, Tour backdrop (`getModalLayer(0)`) | 1000 | 900 (`modal`); Tour popup 1001 → 901 |
| Tooltip | 1100 | 950 (`tooltip`) |
| Toast viewport | 1200 | 1000 (`toast`) |
| SkipNav, Layout skip link | 1300 / 1400 | 1001 (`toast + 1`) |

`modalPriority` still adds to the modal base (`getModalLayer(priority) = layer.modal + priority`), but the base moved from 1000 to 900, so the thresholds shift: a modal now covers tooltips from priority 51 (was 101), toasts from 101 (was 201), and the skip links from 102 (was 401).

Migration: an app `z-index` set directly against the old numbers can now land on the other side of an HJM layer. For example, an app header at 500 used to sit under menus (800/900) and now covers them (400), and an app banner at 950 used to sit under dialogs (1000) and now covers them (900). Express app layers relative to the tokens instead of copying numbers: `var(--hjm-layer-sticky)` for app chrome that menus must cover, a value below `var(--hjm-layer-dropdown)` for in-page floating content, and above `var(--hjm-layer-toast)` only for something that must cover every HJM layer. Re-check any `modalPriority` above 50 against the thresholds above.
