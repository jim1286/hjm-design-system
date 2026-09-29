# Liquid Toast (beta, optional Native presentation)

Liquid Toast uses the existing Toast store with a capsule, connecting neck, droplet, card expansion
and reverse exit inspired by expo-dynamic-notifications. It is an in-app effect, not ActivityKit,
Live Activity or a background notification service. The upstream MIT notice ships with this package.

## Installation and compatibility

Use the exact published HJM version train for contracts and renderer. This implementation is currently
an unpublished source change. The effect is imported from `@hjmds/react-native/toast-liquid`; the root
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

Device Hub connection timed out on 2026-09-28. No new simulator was created or booted, and no native
binary was built. Real island positioning, OS versions, device frame times and VoiceOver/TalkBack
remain unverified. Release/adoption must not claim this evidence from typechecking or JS export.
