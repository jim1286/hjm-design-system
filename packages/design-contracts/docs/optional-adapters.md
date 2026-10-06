# Optional presentation adapters

## Image host extension — 2026-10-07 (unpublished)

Native ImageViewer accepts `renderImage` with the item, measured viewport width/height and
`onReady`/`onError`. This lets a product retain Expo display events and cache policy without
adding Expo to the adapter. `onImageStatusChange` reports loading/ready/error for every mounted
item, including offscreen pages. It is not current-page visibility or user review approval.
Default RN Image still uses onLoad; an Expo consumer can use onDisplay instead. Retry remounts
the image host, and callbacks from retired attempts or closed/replaced sessions are ignored.
Failure stays terminal until retry. Closing sends no final status event; the product owns
review invalidation on close, replacement and view-mode changes. This closes the host gap
identified in Utilverse ADR-0020, but does not add its explicit fit/2x/pixels controls.
The Native Modal accepts supportedOrientations in fullScreen presentation. Optional left/right
safe-area insets protect controls and feedback in landscape while the gallery remains full width.
Products must supply updated insets and permit rotation in their manifests; OS rotation lock still applies.
The additive Native-only props keep this optional subpath and its existing peers; the base Image
renderers retain their own host APIs. There is no Web ImageViewer counterpart.

## Current evidence — 2026-09-30

The six opt-in entries are implemented. The earlier checkout verification below is a historical
snapshot, not the current publication or consumer-adoption state. The subsequent
[Web audit](../../../docs/evidence/full-audit-2026-09-29/WEB.md),
[iOS audit](../../../docs/evidence/full-audit-2026-09-29/IOS-AUDIT.md) and
[Android evidence](../../../docs/evidence/full-audit-2026-09-29/android.json)
record browser and installed simulator/emulator checks, including optional adapter flows.
These results do not establish physical-device or screen-reader testing and do not promote
optional adapters by changing canonical component counts. This catalog cleanup does not publish
packages or migrate consumer applications.

## Original adoption record — 2026-09-29

2026-09-29: the user requested all six shortlisted libraries, explicitly allowing platform-specific
adoption. These are opt-in extensions, not six new canonical components or a stable promotion.
The canonical Statistic/Menu/Sheet/KeyboardAvoiding APIs remain available without additional peers.
ContextMenu's canonical Native status remains unsupported until the OS adapter has device evidence.
ImageViewer and all native adapters are experimental pending device/assistive-technology checks.

## Entry points and ownership

| Package entry | Exports | Platform | Upstream MIT dependency |
| --- | --- | --- | --- |
| `@hjmds/react/statistic-motion` | AnimatedStatistic | Web | @number-flow/react 0.6.2 |
| `@hjmds/react/menu-morph` | MorphingMenu | Web | bloom-menu 0.1.0, framer-motion 13.4.4 |
| `@hjmds/react-native/image-viewer` | ImageViewer | Native | react-native-zoom-toolkit 5.1.1 |
| `@hjmds/react-native/keyboard-controller` | KeyboardMotionProvider, KeyboardDock, KeyboardFormScrollView | Native | react-native-keyboard-controller 1.22.5 |
| `@hjmds/react-native/sheet-gesture` | GestureSheetProvider, GestureSheet, GestureSheetInput | Native | @gorhom/bottom-sheet 5.2.14 |
| `@hjmds/react-native/context-menu-native` | NativeContextMenu | Native | zeego 3.0.6 |

All upstream code remains in versioned dependencies with its original notices. No upstream source
was copied into HJM. Fixed optional peer versions match the inspected npm tarballs, rather than
claiming compatibility with untested major releases. Typecheck dependencies and showcase dependencies
are exact too. The upstream source repositories are:
[NumberFlow](https://github.com/barvian/number-flow), [Bloom](https://github.com/joshpuckett/bloom),
[Zoom Toolkit](https://github.com/Glazzes/react-native-zoom-toolkit),
[Keyboard Controller](https://github.com/kirillzyusko/react-native-keyboard-controller),
[Bottom Sheet](https://github.com/gorhom/react-native-bottom-sheet), [Zeego](https://github.com/nandorojo/zeego).

## Installation

Import only the optional entry you use; none is re-exported from the root. Install the matching
optional peer(s) from the table in that consuming app. The base entries do not require them.
For native zoom/sheet, also install Gesture Handler 2.32.0, Reanimated 4.5.1 and Worklets 0.10.1
and configure the host's GestureHandlerRootView/Reanimated setup. Keyboard Controller requires
Reanimated and a KeyboardMotionProvider at the app root. Do not nest providers per field.

The Expo 57/RN 0.86 showcase uses Zeego 3.0.6 with menu 1.2.2,
ios-context-menu 3.2.1 and ios-utilities 5.2.0. Same-major iOS overrides avoid the
old Folly pin; the checked-in Android Kotlin API and iOS Fabric/availability patches
are required for this host. Installing HJM does not apply workspace patches to a
consumer. Copy the patches shipped in `@hjmds/react-native/docs/patches/` into the
consumer and register them with its package manager before rebuilding its native
client. See that directory's README for exact versions and configuration.
Expo Go cannot verify these linked native modules.

## Behavior boundaries

- AnimatedStatistic uses the existing Statistic shell and accessible descriptor. `value` must be
  finite, and `locale` is explicit for deterministic hydration. Intl owns the final visible and
  spoken text. RTL, non-Latin digits, exponent notation and reduced motion use static output.
  `Statistic.renderValue` changes only its aria-hidden visual value; it must not change meaning.
- MorphingMenu is an action-only alternative. Full selection, async loading and nested menu behavior
  stay in canonical Menu. Bloom owns morph geometry; HJM owns actual button items, disabled guards,
  arrow/Home/End/typeahead, Escape/Tab and focus restoration. RTL and reduced motion use Menu.
  Trigger/menu dimensions are bounded defaults inherited from the upstream button-to-menu pattern;
  very long labels, narrow-screen collision and large-text behavior require further visual evidence.
- ImageViewer is controlled by `open`, requires localized image/control/failure labels, supports
  paging without a swipe, and unmounts on close to reset its session. Failed images offer retry.
  Host-provided safe-area insets are required when placing it edge-to-edge. Remote image permission,
  URL lifetime and caching remain product responsibilities; the adapter does not fetch metadata.
- KeyboardDock translates with the keyboard. `clearance` is an additional nonnegative gap above it;
  the host retains bottom safe-area ownership. Do not combine this with another keyboard avoidance
  wrapper around the same content. KeyboardFormScrollView handles focused form fields.
- GestureSheet uses controlled `open`; host must apply onOpenChange. Wrap a screen in
  GestureSheetProvider inside GestureHandlerRootView. Fixed snap points preserve index semantics;
  dynamic sizing would insert points and is deliberately disabled. Busy blocks user dismissal;
  the host can still close programmatically. GestureSheetInput wires sheet keyboard tracking.
  Android back, backdrop and pan dismissal converge on onOpenChange(false). Consumers remain
  responsible for focus restoration to the opener and avoiding simultaneous modal sheets.
  Inside an RN `Modal`, Android back goes to the Modal's `onRequestClose` and never reaches
  BackHandler, so the 2026-09-30 audit saw back close the whole host. Such hosts call
  `dismissTopGestureSheet()` first and close themselves only when it returns false. The same
  applies to a navigation container inside a Modal (shared screen transition Detail): the host
  must route `onRequestClose` to `navigation.goBack()` while it can go back. Insets default to the
  HjmNativeProvider `safeAreaInsets`; the library's English handle/background labels are replaced.
- NativeContextMenu delegates long-press behavior and menu appearance to the OS. Supply an
  accessible native child; item IDs are unique, labels localized, danger maps to OS destructive
  intent and disabled actions are guarded. Arbitrary custom native menu colors are unsupported.

## Evidence and promotion

Web stories: `배포/구성/직접 조작과 모션/숫자 변화와 메뉴 변형`. Native stories: `배포/구성/직접 조작과 모션/이미지·시트·키보드 조작` (the earlier 갤러리/모션 연동 and 실험실/선택적 연동 menus; moved by the 2026-10-06 user-approved Storybook promotion, which is not an API promotion).
Tests cover adaptation logic and web browser behavior; native mocks cannot prove OS gestures,
keyboard animation, accessibility focus, native linking or installed-device health. Keep native
adapters experimental until iOS/Android device evidence exists. No consumer migration or publication
is implied by adding these entries. The prior Motion Primitives candidate remains reference-only.

A removal replaces the optional imports with canonical Statistic/Menu/Sheet/KeyboardAvoiding or
product image/menu behavior and removes the matching peers. There is no persisted-state migration.

## Checkout verification — 2026-09-29

- Contracts: 883 tests plus type/build/contract bundle checks passed.
- Web: 776 Chromium tests passed; the three new browser cases were rerun after focus/direction
  changes. Existing 172 SSR tests and two new adapter SSR tests passed. Export-boundary test
  rerun after final manifest ordering passed. Web typecheck/build and showcase tests/token checks,
  production Storybook build and static verification passed.
- Native: 735 mock tests passed; the four new adapter cases were rerun after viewport sizing
  changes. Native typecheck/build and showcase typecheck/test passed. Base Metro production
  fixture still has 614 modules and excludes optional peers. Final iOS/Android showcase Hermes
  exports passed; they are JavaScript bundle evidence, not installed native binary evidence.
- Renderer graph budgets and an additional base-entry optional-peer isolation guard passed.
  Package tarballs contain all six JS/declaration entries with optional peer metadata.
  Workspace/evidence/docs/governance and central library-policy static checks passed.
- Browser UI: light/dark, number update, morph opening, ArrowDown/Enter action selection and
  restored trigger focus were observed. Device Hub access returned timeoutReached again;
  native visual/gesture/keyboard/assistive-technology and linking verification remain pending.
- Peer warnings remain: the base RN 0.81 development fixture is below the Reanimated/Worklets
  0.83–0.86 range; the optional showcase uses RN 0.86.2. The native Storybook 10.4.4 fixture also
  reports transitive UI packages expecting Storybook 10.6 and safe-area-context 5.8 versus 5.7.
  Builds passing do not erase these warnings or prove device compatibility.
- No npm publication, consumer migration, native binary build, commit or push was performed.

## Shared behavior after the component overlap audit

The 2026-10-01 audit found independent typeahead policies in Menu, MorphingMenu and ContextMenu.
Their Web item searches now share the base Menu's 500ms reset, declared textValue, circular search
and repeated-character cycling. Menu opening, OS context-menu behavior and presentation stay host-owned.

CarouselMotion now resolves slide IDs, selected/inert state, accessible names and finite navigation
through the canonical Carousel contract in both renderers. Its optional composeAccessibleName
accepts the same localized position/name composer as Carousel; omitting it preserves the slide label.
It remains a controlled swipe/motion presentation without autoplay or uncontrolled defaults.

Native Field and built-in text inputs share a recipe-owned label/support/error frame.
GestureSheetInput retains BottomSheetTextInput's keyboard tracking but now uses the base field's
input geometry, typography, placeholder and provider font scaling instead of separate constants.

## Static Avatar fallback — 2026-10-01

Both renderer `/avatar-blobatar` entries now provide `createBlobatarFallback` for
existing Avatar. They are optional factories, not new canonical components or
root exports. See the [fallback contract](avatar-fallback.md) for installation,
source recovery and identity/accessibility rules. This addition does not imply
that the earlier device evidence covers Blobatar.
