# Optional interaction adapters

Status: **stable** — `sortable`, `swipe-actions`, `content-transition`, `carousel-motion`, `celebration` (Web and Native) · **experimental** — Native `screen-transition` · 2026-09-30 · React / React Native

Promotion (2026-09-30): the five entries met [the stable criteria](../packages/design-contracts/docs/stable-promotion.md) — documented API with no known contract gap, Web Chromium evidence, installed iOS 27 simulator evidence and, added for promotion, installed Android 16 emulator evidence ([record](evidence/interaction-adapters-2026-09-30.md#android-16-emulator--promotion-check)). Stable means SemVer support for the documented scope; Sortable's scope stays a short single-column collection (grids are not supported). `screen-transition` stays experimental: it binds `@react-navigation/native` 7.4.1 and needs a consumer-applied exports patch, while every current portfolio Expo app uses expo-router 57 without React Navigation, so no consumer can exercise it yet. Physical devices and spoken VoiceOver/TalkBack journeys remain consumer-release QA, as for every stable component.

The user requested all six proposals from [the research](plans/oss-absorption-research-2026-09-30.md), including shared screen transitions. These entries extend the existing three-package train. They are not re-exported from the root, do not change canonical stable counts and do not imply npm publication or consumer migration.

## Installation and provenance

| HJM entry suffix | Web peer | Native peer |
| --- | --- | --- |
| `sortable` | `@dnd-kit/react@0.5.0`, `@dnd-kit/dom@0.5.0` | `react-native-sortables@1.10.1` |
| `swipe-actions` | none (explicit action buttons) | existing `react-native-gesture-handler@2.32.0` + Reanimated |
| `content-transition` | existing `framer-motion@13.4.4` | RN Animated; no new engine |
| `carousel-motion` | `embla-carousel-react@8.6.0` | `react-native-reanimated-carousel@5.1.1` |
| `celebration` | `canvas-confetti@1.9.4` | `react-native-fast-confetti@2.0.2` |
| `screen-transition` | unsupported; use the product router | `react-native-screen-transitions@4.0.0`, `@react-navigation/native@7.4.1`, safe-area-context 5.7.0 |

Native motion engines use the existing optional host lane: React 19.2.3, Expo 57 / RN 0.86.2, Reanimated 4.5.1, Worklets 0.10.1, Gesture Handler 2.32.0. Celebration also needs Skia 2.6.2. The base RN 0.81 fixture does not prove support for these effects. Install the named optional entries' peers in the consuming app; importing an optional entry without its peer is not an automatic fallback. Base entries stay usable without them.

All new upstream packages above are MIT except canvas-confetti (ISC); licenses remain in upstream packages. The web ContentTransition adapts Motion Primitives' keyed panel pattern at commit `120f64f6ca60348e251f929e9c81f11ccbe45eda`; its full MIT notice is included in the React package. It uses the existing framer-motion peer instead of installing a second Motion runtime. TextTransition uses whole-text fade to preserve complex graphemes and text wrapping. No upstream website styles or full UI kits were copied.

### Screen Transitions compatibility patch

The 4.0.0 tarball lists `react-native` before `types` in conditional exports. Expo's TypeScript configuration therefore selected upstream `.tsx` internals and reported hundreds of errors under HJM's strict settings. The pinned [patch](../packages/react-native/docs/patches/react-native-screen-transitions.patch) moves the published `types` conditions first. It keeps strict checks enabled. Device QA also found that the upstream optional teleport loader assumed an installed JS package meant its native views were linked: an existing client displayed `Unimplemented component: PortalHostView`. The patch checks both native view managers before loading teleport and otherwise keeps the upstream inline fallback. Source, ESM and CommonJS receive the same guard. Remove each correction once upstream publishes its equivalent. **Consumer package managers must register this patch too**; an HJM tarball cannot apply a workspace patch automatically.

`react-native-teleport@1.2.0` can arrive as an optional upstream dependency. It is not a direct HJM or showcase dependency. HJM uses inline Boundary measurement with `handoff=false` and `escapeClipping=false`, avoiding reliance on a linked teleport view. No live-view handoff or clipping escape is advertised. A host enabling those upstream features needs its own native binary setup. No native binary was built for this adoption. The workspace Metro resolver also shares the host navigation and screen-transition instances: separate pnpm peer instances otherwise produced `LinkingContext` / `DescriptorsStore` failures. Consumers must use one navigation context/store across their host and adapter.

## Public behavior

### SortableCollection

Both renderers take controlled `items: { id, label, disabled? }[]`, a collection label, `renderItem`, localized `labels` (handle/previous/next/position/instructions/dragStart/dragCancel) and `onCommit(intent)`. Web replaces upstream English/raw-ID announcements with these host labels. The pure intent helper lives at `@hjmds/design-contracts/components/interaction-adapters` and returns the stable ID order, source and old/new positions. Disabled rows cannot be crossed. Empty lists are allowed; duplicate/empty IDs or labels are rejected.

The host owns persistence, optimistic rollback and errors. A proposed reorder is not a saved result. Buttons provide a non-drag path; Native also has adjustable accessibility actions. Native reduced motion disables dragging and keeps the buttons. Native `active={routeIsFocused}` resets gesture state when retained tab screens blur/refocus; this is needed because Sortables documents a GH2 tab reattachment issue. Long-press drag was exercised in the iOS showcase; retained product-tab recovery still needs product-level evidence. Backgrounding cancels active Native drag; stale collection changes cannot commit an old drag result.

Initial scope is a short, single-column collection, not virtualized feeds or cross-container boards. The renderers do not expose all upstream layout/sensor options. This keeps web/native state and accessibility behavior aligned within the stable scope; grids and multi-column layouts are outside it.

### SwipeActions

Actions have `{ id, label, intent?, disabled? }`. Both surfaces call `onAction(id)` and route promise rejection to the required `onError`. A synchronous ref prevents repeated presses from starting another pending action. The product can pass `busy` to show its pending state and retains confirmation/undo/data ownership.

Native additionally requires `rowId`, controlled `openRowId`, `onOpenRowChange`, and a localized `actionsLabel`. Share the open ID across the list. Physical swipe only reveals buttons; it never executes deletion. RTL changes the reveal side. A persistent Actions button exposes the same operations without swiping. Reduced motion disables the gesture and exposes those buttons directly. Web shows the action buttons directly.

### ContentTransition and TextTransition

`ContentTransition` takes `stateKey`, children and optional `motion="none"`; system motion preferences are the default. It fades in the current content with HJM timing. It keeps a single accessible/interactive subtree and renders the first frame without a forced entrance. Web supports `focusTarget` for a host-chosen destination when focused content is replaced. Keep form drafts in product state outside the keyed child. Native cancels its animation on backgrounding. `TextTransition` accepts `text` and uses a whole-sentence fade, preserving Korean, emoji sequences, RTL and selectable text. Character-by-character morph is not claimed.

### CarouselMotion

Controlled `slides`, `currentKey`, `onCurrentKeyChange`, `renderSlide`, collection label, previous/next labels are shared. Native also takes measured positive `width`/`height`; do not guess device dimensions. Both engines disable looping and autoplay, expose previous/next buttons, and exclude inactive slides from accessibility and interaction. Reduced motion selects the final position without a timed animation. The host must accept selection changes into its controlled state. This opt-in entry does not replace the original Carousel API.

### Celebration

`eventId`, optional `preset="small-burst" | "milestone"`, optional `onComplete`. Trigger only after a product-confirmed success; Result/Toast/text conveys meaning independently of particles. Each mounted instance remembers event IDs, including reduced-motion events. Product persistence owns dedupe across remounts. React Strict Mode's effect probe cannot consume an event before rendering it.

Particles are bounded to 32/64 and 1.6/2.4 seconds as conservative recipes, not performance claims; raising them needs device profiling. Colors are the theme primary plus the four status accents. Backgrounding or enabling reduced motion stops the active event. Unmount, or replacing `eventId` while an event plays, cancels it without a completion callback. The web owns a private canvas instance; Native needs a positioned viewport host for its absolute decorative layer, outside scroll content. Device QA found scroll-content placement hid the effect. Native playback is timed from the engine start callback so atlas setup cannot consume the recipe; a separate 5-second startup watchdog cleans up an engine that never starts. Particle overlays do not intercept touches or enter the accessibility tree.

### Shared screen transition

Native-only router entry:

```tsx
import {
  createHjmTransitionStack,
  SharedTransitionElement,
  SharedTransitionScreen,
  useSharedTransitionOptions,
} from '@hjmds/react-native/screen-transition';

type Routes = { Places: undefined; Detail: undefined };
const Stack = createHjmTransitionStack<Routes>();
// Inside a component under HjmNativeProvider and the host's NavigationContainer:
const options = useSharedTransitionOptions('place-forest');
// Attach options to Stack.Navigator/Stack.Screen, and place a
// <SharedTransitionElement id="place-forest">...</SharedTransitionElement>
// on both source and destination screens. The ID must match the selected item.
// Wrap each route body with <SharedTransitionScreen> to supply an opaque HJM
// surface and keep retained inactive screens out of accessibility and hit testing.
```

The adapter supplies measured paired-boundary zoom, HJM durations and system reduced-motion behavior. The host owns route parameters, matching IDs, focus/scroll restoration and navigation container. Native back and cancellation are handled by the navigation engine; button back, short-gesture cancellation and completed gesture back were exercised on the installed iOS showcase. The showcase has a complete Places → Detail → Places example in **배포/구성/직접 조작과 모션/끌기·밀기·화면 전환** › 카드 확대와 화면 전환. This is an opt-in router adapter, not a new global navigation layer or a web navigation abstraction.

## Evidence and limits

The new meaningful regressions cover controlled reordering, fixed disabled rows, stale drag cancellation, duplicate pending actions, errors, a single current content tree, explicit carousel navigation/inert slides, event dedupe under Strict Mode, reduced-motion particles and shared-boundary settings. Native engine mocks prove HJM adaptation, not real gestures or GPU behavior.

Web and Native stories are under **배포/구성/직접 조작과 모션/끌기·밀기·화면 전환** (moved from 실험/구성/드래그·스와이프·모션 by the 2026-10-06 user-approved Storybook promotion, [record](STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). Validation commands and observed outcomes are recorded in [the adoption evidence](evidence/interaction-adapters-2026-09-30.md). Device Hub automation timed out; the user explicitly authorized idb fallback against the existing iPhone 17 / iOS 27 simulator. That limited native evidence is recorded separately from mocks. No physical-device, VoiceOver/TalkBack, release-binary, npm publication or consuming-app claim follows from these checks.

Removal: replace optional imports with normal lists/action buttons, static content, base Carousel, Result/Toast and ordinary product routing, then remove unused peers and the exports patch. No persisted-state migration is introduced.

## Content presentation presets — 2026-10-01

Both `ContentTransition` and `TextTransition` accept optional `preset` values
`fade` (existing default), `rise`, `slide`, and `scale`. Shared recipes live at
`@hjmds/design-contracts/content-transition`. The inline slide mirrors in RTL;
all settle at identity without changing layout geometry. Bounded distances avoid
large decorative travel. Reduced motion and `motion="none"` keep a static single
subtree; text is not split into individually spoken graphemes. Existing focus
restoration and host background handling are retained. No new animation engine
or duplicate transition component was introduced. Individual examples are under
`컴포넌트/시각 효과/Content Transition` on both platforms.

### Native AnimatedStatistic (2026-10-01)

Native now exposes `/statistic-motion` with the same `value`, explicit `locale`,
optional Intl `format`, `animated`, and value-free Statistic `descriptor` input as
Web. The descriptor still requires `id` and `label`. Both pass Intl's final string
to the canonical Statistic accessibility contract.

Web retains NumberFlow's per-digit transition. Native composes the existing rise
ContentTransition around Statistic rather than adding a numeric interpolation
engine; it does not pretend that intermediate counts are actual product values.
The shared transition's reduced-motion and AppState suspension behavior applies.
`animated={false}` keeps a static value. Both platforms have role-based Default,
Dark and LargeText examples under 컴포넌트/데이터 표시/Animated Statistic.

### Expo integration and recovery

See the [Expo interaction guide](expo-interactions.md) for reusable motion geometry,
product-specific exclusions, cancellation, scroll competition, haptics and Go/dev-client
boundaries. `contentTransitionMotion` exposes the existing geometry through the contract's
`/content-transition` entry; no migration is required. Native now explicitly translates
`easing.enter` and settles when a preset or direction changes during playback. The Native
**배포/구성/피드백과 복구/중단해도 남는 현재 상태** example (formerly 배포/구성/Expo 인터랙션 복구) composes existing components without adding a new API.

Current integration guidance reviewed 2026-10-02: [product interaction quality](INTERACTION_QUALITY.md). Storybook placement (all 배포 since the 2026-10-06 promotion) is independent of API maturity and package publication. Historical device evidence above remains dated evidence.
