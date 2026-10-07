# Liquid Toast (stable, optional Native presentation)

Promoted 2026-09-30 after fixing three device-visible defects and checking the installed iPhone 17 / iOS 27 simulator
(island anchor) and Android 16 emulator (capsule anchor): the Skia shadow ignored the token opacity and was clipped by a
region-wide canvas, the capsule anchor stayed on screen as a second "island", and the droplet turned card-colored before
leaving the anchor. [Record](../../../docs/evidence/liquid-toast-2026-09-30/README.md).

Liquid Toast uses the existing Toast store with a circular in-app origin, connecting neck, droplet, card expansion
and reverse exit inspired by expo-dynamic-notifications. It is an in-app effect, not ActivityKit,
Live Activity or a background notification service. The upstream MIT notice ships with this package.

## Installation and compatibility

Use the exact published HJM version train for contracts and renderer. The effect is imported from `@hjmds/react-native/toast-liquid`; the root
barrel intentionally does not re-export its factory.

Install the host-compatible versions of these optional peers before importing that subpath:

| Peer | Initial tested type/bundle fixture |
| --- | --- |
| @shopify/react-native-skia | 2.6.2 |
| react-native-reanimated | 4.5.1 |
| react-native-worklets | 0.10.1 |

The Native showcase uses Expo 57 / RN 0.86.2. Reanimated/Worklets in this lane declare RN 0.83–0.86;
this does not extend the effect to the base renderer's entire RN >=0.81 range. The base Metro fixture
remains RN 0.81.6 and actively rejects imports of the optional peers. Its development install reports
their peer mismatch because the optional effect is typechecked in the same package; that is not a
claim that RN 0.81 can run the effect. No framework upgrade is forced on standard Toast consumers.

Configure the Worklets Babel plugin in a bare RN app according to its version's setup. The Expo fixture
uses `babel-preset-expo`'s integration. A binary must already contain compatible native modules;
adding JS dependencies alone does not add them to an installed development client or OTA runtime.
No `expo-blur`, Expo symbols or remote avatar loader is required by HJM.

## Usage

```tsx
import { ToastRegion, useToastRegion } from '@hjmds/react-native/feedback';
import { createLiquidToastPresentation } from '@hjmds/react-native/toast-liquid';

// Create outside render, or memoize. Default anchor works without hardware identification.
const liquid = createLiquidToastPresentation({ anchor: { kind: 'capsule' } });

<ToastRegion placement="top" maxVisible={1} presentationAdapter={liquid}
  safeAreaInsets={insets} occluded={modalIsOpen}>
  {children}
</ToastRegion>

const toast = useToastRegion();
toast.publish({
  id: `generation:${job.id}`,
  presentation: 'liquid',
  title: t('generation.completed.title'),
  description: t('generation.completed.description'),
  closeLabel: t('common.closeNotification'),
  tone: 'success',
  action: { label: t('generation.open'), onAction: openResult },
});
```

The host must provide current safe-area insets and set `occluded` while its modal hides the region.
Mount a region covering the intended screen, outside clipping containers. Ordinary descriptors still
render standard Toasts. Liquid requires `placement="top"`, `maxVisible={1}`; other combinations throw.
Without the adapter, and on Web, the same descriptor uses the standard accessible surface.

An island anchor is explicitly `{ kind: 'island', frame: { x, y, width, height } }` in window points.
Only supply a frame verified by the application's device/window adapter. HJM never infers hardware
from safe-area height. Until the viewport origin is measured, or if the frame lies outside the current
width, the effect uses a capsule. Refresh the adapter's frame after a window geometry change; its
Surface identity remains stable, so this does not replace the store entry. Hardware alignment is
unverified until captured on that device. Omit it for Android, notched and older supported iPhones.

## Lifecycle and accessibility

- One store owns FIFO, bounded overflow, stable ids, action revisions and exit completion. Updating
  a visible id changes copy/tone without replaying the entry. Its initial presentation choice is
  retained for that entry; publish a new id to request a different presentation.
- Readable duration starts after the entry springs settle. `presentation`, `window`, `occlusion`,
  `focus`, `pointer`, and `gesture` pauses are independent. Do not use the first three reasons from
  product code: they are renderer-owned. User-programmed pauses should use `programmatic`.
- Actionable messages persist by default; explicit finite durations have the existing 5-second floor.
  Results remain accessible in product UI after the notification closes.
- Upward swipe, close and action use the existing dismiss reasons. Late animation completions are
  ignored after interruption/unmount. Background recovery shows the final card without replay.
- Text and controls stay RN nodes; Skia paints only decoration. The effect does not bitmap text or
  add a second live announcement. Screen readers or reduced motion use standard Toast chrome.
- Content height is measured, allowing long copy and large fonts. Insufficient viewport space falls
  back to the standard surface. Dark mode, RTL and colors use the HJM provider.

## Validation scope

`test/toast-liquid.test.tsx` tests lifecycle with controlled animation completions; it cannot measure
GPU performance or verify native accessibility behavior. The source geometry is covered in the
contracts package. `Patterns/Liquid Toast` provides capsule, long-copy, reduced-motion and burst
interaction cases; the Web `LiquidHintFallback` story preserves the same descriptor semantics.

Installed checks on 2026-09-30 (no new simulator/emulator, no native rebuild): iPhone 17 / iOS 27.0 simulator with a
host-supplied island frame, and Android 16 emulator with the capsule anchor ([record](../../../docs/evidence/liquid-toast-2026-09-30/README.md)).
Other island models' frames are host-measured and unverified here; physical devices, frame times and spoken
VoiceOver/TalkBack journeys remain consumer-release QA.

## Current shape · 2026-10-02

User feedback found the expanded notification too round and the default capsule too similar to
Dynamic Island. The default in-app origin is now a 32 × 32 circle and the card corner radius is 16.
The public `capsule` discriminator/key is retained for caller compatibility; its in-app geometry is circular.
The default settled card top remains 58 logical units by reducing the gap to 26. Explicit host-supplied
island geometry still uses the measured hardware frame. The RN content clipping and Skia surface
use the same recipe radius to avoid a mismatched edge. Web continues the standard Toast fallback,
whose lg corner is already 16; it does not render the Native liquid animation.

This shape update has contract/type validation; older device recordings above show the previous shape.
Use [interaction quality guidance](../../../docs/INTERACTION_QUALITY.md) for product performance verification.


The follow-up depth refinement uses the shared `shadow.raised` elevation (opacity 0.08,
radius 4, offsetY 1). The goo-filtered surface fades out as the clean card expands, so blur/alpha
thresholding no longer reshapes the settled card edge. Content reveals without scaling text up.
The droplet/neck transition remains; the settled notification is a flat, single surface with a light shadow.
This change still requires visual confirmation on the target device; mock tests do not prove perceived depth.


## Current card redesign · 2026-10-02

The liquid notification is a two-row banner with a 12-unit corner. A small unboxed status glyph sits
beside the title; the description takes the full second row. There is no separate leading badge column.
The close target remains 44 units at the trailing top edge. Actions occupy a full-width footer with a
subtle separator, replacing the detached pill. Long text wraps, including titleless cards. This changes
only the liquid card; its circular origin, neck, timing and the ordinary Toast layout stay unchanged.

This section supersedes the earlier 16-unit and rounded-square badge refinements above. Visual
acceptance on the user's device is still pending; type and lifecycle tests do not establish visual quality.


## Settled surface visibility correction · 2026-10-02

The user's screenshot exposed a missing fill after the goo layer faded. The settled RoundedRect
incorrectly used `Shadow shadowOnly`, which excludes the shape itself. The shadow now retains
its input fill in both themes. Regression checks cover light and dark, but do not replace device rendering.
See [Skia shadow semantics](https://shopify.github.io/react-native-skia/docs/image-filters/shadows/).

### Card color refinement (2026-10-02)

The default light card uses `bg` (white), while the dark card uses `surfaceAccent` (blue-tinted).
This replaces the neutral gray fill after it was reported as dull. A single Skia outline remains
to distinguish the light card from a white page; the accessible RN body stays transparent.

## Nearest profile consumption · 2026-10-07

The optional surface previously kept the foundation raised shadow and 12-unit corner even when
the nearest Provider selected a different design profile. It now reads that profile's `radius.lg`
and `shadow.raised`; the shallow raised role follows the depth decision above rather than adopting
the ordinary Toast's floating role. Without a profile, the existing 12-unit corner and raised shadow
remain. RN body clipping follows the same corner as Skia. The canvas reserves three blur sigmas
plus the absolute vertical offset on every edge, including a product's upward shadow.

The geometry helper's optional fourth argument is a finite non-negative settled radius (default 12).
It keeps the circular origin and clamps the changing corner to half the measured width/height.
The existing store, action, dismissal, FIFO and accessibility/reduced-motion fallback remain the
same contracts. Web continues the ordinary Toast fallback; no Web liquid renderer was added.

The existing Native `실험/구성/비교와 검증/테마 조합` includes a collapsed liquid comparison.
Open a notification and use the next-theme control to keep that same visible entry while changing
the nearest profile. Ordinary Toast previews retain their timeout. Light/dark mock regression
covers no profile, all 11 presets (including neutral), and a custom upward shadow; these checks do
not establish Native rasterization, touch, spoken accessibility or frame performance. See the
[current QA record](../../../docs/qa/2026-10-07-design-profile-research.md).
