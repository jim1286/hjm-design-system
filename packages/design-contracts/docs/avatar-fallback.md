# Avatar fallback and Blobatar

Reviewed: 2026-10-01. Implemented locally; package publication and consumer adoption are separate.

`Avatar` remains the sole canonical component. Both renderers accept
`renderFallback({ size, decorative: true })`. The factory is called only while a
photo is absent or has failed. Returning null/undefined preserves the existing
Web `fallback` or Native initials. Existing consumers are unchanged.

The Avatar owns the accessible name; custom fallback content is decorative and
must not contain interactive controls. Native hides fallback descendants from
accessibility. Photo source changes retry loading rather than retaining an old
failure. Web continues forwarding the image error callback.

## Optional adapter

Import `createBlobatarFallback` from `@hjmds/react/avatar-blobatar` or
`@hjmds/react-native/avatar-blobatar`. Neither root imports the adapter.
Install `blobatar@2.7.0` and the matching `@blobatar/react@2.7.0` or
`@blobatar/react-native@2.7.0`; Native additionally uses the existing supported
`react-native-svg` peer. The static entry needs no Reanimated or Worklets import.

```tsx
const renderFallback = useMemo(
  () => createBlobatarFallback({ seed: account.publicAvatarId, expression: 'idle' }),
  [account.publicAvatarId],
);
// Web: <Avatar name={displayName} src={photo} renderFallback={renderFallback} />
// Native: <Avatar name={displayName} source={photo} accessibilityLabel={displayName}
//                 renderFallback={renderFallback} />
```

Only `idle` and `happy` static expressions are currently exposed. There is no
`motion` option in this first implementation. Use the same public product seed on
both platforms; names, emails, credentials and inferred emotions are not seeds.
Normalization is explicitly disabled to preserve case-sensitive account identity.
Generation is local (Web data URI, Native SVG paths). No avatar server is called.
Pinned upstream versions prevent an incidental generator upgrade from changing
existing faces. React adapters retain upstream generation rather than approximating
its artwork with a second generator. MIT notices remain in the upstream packages.

`패턴/프로필 편집` in both showcases demonstrates choosing a face,
editing a display name, toggling notifications, applying and reverting local
changes. Copy is keyed in the shared showcase fixture; it is not embedded in the
renderer. This is a composition example, not an account API or new canonical screen.
The original [integration plan](../../../docs/plans/visual-and-motion-integration-2026-10-01.md)
tracks later animation, theme and marketing work.

## Optional motion and expressions (2026-10-01)

`/avatar-blobatar-motion` on each renderer exports `createAnimatedBlobatarFallback`.
It accepts a stable public `seed`, `expression` (idle, happy, sad, surprised, wink,
sleepy or thinking), `active` (default false), and `visible` (default true). Pass its
result into the existing Avatar `renderFallback`. Avatar still owns naming and image
fallback; the animated artwork remains decorative.

The Web entry imports Blobatar's motion stylesheet and observes intersection/document
visibility. Native uses the upstream optional AnimatedBlobatar entry, requiring the
host's compatible Reanimated/Worklets, and observes AppState. Native hosts must pass
route/list visibility explicitly. Native switches to the static upstream renderer when
inactive, hidden, reduced or backgrounded: upstream 2.7.0 keeps its frame callback
running with `animate=false`, as confirmed by device-host CPU sampling. Seed and
expression are preserved, while the idle clock restarts when re-enabled.
Both honor HJM reduced motion and never enable
idle animation without `active`. Static `/avatar-blobatar` remains available without
motion imports. The pinned Blobatar 2.7.0 generation and original license remain.

컴포넌트/데이터 표시/Animated Blobatar provides Default, Dark and LargeText in both
showcases, with explicit pose and motion controls. Native gating tests mock the
upstream rendering boundary; the subsequent [Native integration audit](../../../docs/evidence/native-visual-integration-2026-10-01/README.md)
adds installed iPhone 17 / iOS 27 simulator captures and active/stopped CPU samples
from the real upstream runtime. The inactive frame-loop correction is backed by
those samples. This does not establish physical-device GPU timing, battery use,
or exhaustive geometry and screen-reader behavior.
