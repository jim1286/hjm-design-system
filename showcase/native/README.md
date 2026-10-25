# Native showcase

Run `pnpm storybook` here to serve the installed development client on port 8084.
Both this command and `pnpm storybook:ios` explicitly use the `hjm-showcase` development-client scheme; the iOS command does not select Expo Go.
The optional native adapters require a linked development client; Expo Go does not
prove their runtime compatibility.

## Full installed-app checks

Use the existing user-approved simulator/emulator. All stories and optional adapters
are included. The earlier Orb-only workaround was removed after the full iOS host
built and its native menu completed a save action. See the
[compatibility rationale](../../docs/LIBRARY_POLICY.md) for the pinned host patches.

SDK 58 prebuild uses Expo's scene lifecycle; the old SDK 57-only scene plugin was removed.
Editing generated `ios/` files is not a persistent fix.

For the bare iOS Debug showcase, set its React Native bundle location if launch
reports "No script URL provided": `xcrun simctl spawn <existing-udid> defaults write
dev.hjm.designsystem.showcase RCT_jsLocation -string localhost:8084`, then relaunch
that app. This local setting matches the showcase's dedicated Metro port; changing
another app's server or rebuilding all native dependencies is unnecessary.

Select stories through `hjm-showcase://storybook?STORYBOOK_STORY_ID=` followed by
`components-feedback-thinkingorb--all-states`, `components-feedback-thinkingorb--all-states-dark`,
or `components-feedback-thinkingorb--paused`. Inspect the actual light/dark rendering and
the paused host's accessibility label. The paused story avoids animation preventing
Android accessibility snapshots from reaching idle.

## Physical iPhone remote preview (2026-10-01)

The portfolio remote-development page includes this Expo showcase on dedicated Metro 8187 via private Tailscale HTTPS. Install the signed Debug dev client once on the paired physical phone, then open its `dev.hjm.designsystem.showcase://expo-development-client/?url=...` link. Source edits in the contract and renderer packages need their existing `tsc -p tsconfig.build.json --watch` builds alongside Metro, since the showcase resolves workspace dist exports. Story edits are watched by Metro directly. Native dependency changes still require rebuilding the host. This preview is independent of npm publication and consumer-app adoption. The user requested this addition so they can inspect HJM on the same iPhone as their products.

Verified 2026-10-01: signed Debug build succeeded and installed/launched on the paired iPhone 12 Pro (iOS 27.2). Metro received the native bundle request and reported the `dev.hjm.designsystem.showcase (iPhone)` inspector connection. Host typecheck and iOS JavaScript bundle generation passed. The package documentation checker and central library-policy static check passed. These checks do not establish every Storybook component interaction or published-consumer adoption.

## Component navigation

The iPhone showcase puts **컴포넌트** first: one entry for each of the 83 supported native renderer IDs. Each entry has Default, Dark and LargeText fixtures; Button and IconButton also expose Disabled/Loading, and Field exposes Disabled/Error. State stories use the renderer’s own props rather than simulated colors. Group comparisons remain under **갤러리 / Native Renderers**, and complete product-like flows remain under **패턴**. The split follows the user’s 2026-10-01 feedback that grouped stories made individual components difficult to find.

`src/component-examples.tsx` contains isolated interactive fixtures, not imported CSF modules. This avoids side-effect story registration and keeps each component independently selectable. `component-stories.test.ts` compares the component entries with renderer evidence, checks duplicate titles, and verifies that individual previews retain their own interactions (including overlay open buttons). Story-only changes use the existing Expo server; reinstalling the iPhone host is unnecessary.

Toast previews (2026-10-01): `컴포넌트 / 피드백 / Toast / Default`
uses the standard card entrance without a fake capsule. `컴포넌트 / 피드백 / Liquid Toast` exercises
the optional liquid surface independently of hardware; it is explicitly a surface
fixture, not automatic iPhone 12 behavior. Both open on the saved toast (2026-10-17) and keep
`저장 알림 띄우기`·`답장 알림 띄우기` replay tools under 미리보기 도구 at the bottom. Default,
Dark and LargeText now use a full-height region rather than the short ScrollView
that clipped the card above the trigger. New integrations have individual role-based entries under `컴포넌트`;
open the bottom-left navigation menu and search the component title. A dev-client
reload refreshes the story list after additions. The live 8187 iOS bundle returned
200 and contained the updated toast, Compound controls and Reading progress entries.
This confirms delivery in the bundle, not visual confirmation on the physical phone.

The temporary UpdatedCard entry was removed at user request; its behavior lives in Default. Liquid Toast has its own navigation entry with Default, Dark and LargeText at user request. Its implementation still reuses Toast semantics and the optional presentation adapter.

## Integration story navigation

New integration entries are registered while they are implemented, including optional APIs outside the canonical catalog. This addresses the 2026-10-01 report that components hidden inside comparison stories appeared missing. Each individual entry has **Default / Dark / LargeText**.

- `컴포넌트/입력`: Duration Field, Task List.
- `컴포넌트/동작`: Inline Confirm, Reaction Picker.
- `컴포넌트/피드백`: Liquid Toast, Notification Bell, Scroll Progress, Step Player (and the existing ThinkingOrb).
- `컴포넌트/데이터 표시`: Blobatar Avatar, Animated Blobatar, Folder Preview, Code Block, Activity Heatmap, Animated Statistic, Voice Note.
- `컴포넌트/시각 효과`: Effect Surface, Content Transition, Grid Reveal, Gravity Letters.
- `컴포넌트/글자와 아이콘`: Text, Heading, Icon, Lucide Icon.
- `컴포넌트/탐색`: Gooey Navigation.
- `패턴`: Family Drawer, Onboarding, Search, Profile Studio, Dashboard, Landing.
- `디자인 기초`: Theme Studio, Typography Studio. Mockup Studio is Web-only authoring.
- `갤러리`: Visual Effects and Compound Controls comparisons.

The same semantic grouping applies to the Web showcase. Registration and initial device view evidence are separate from publication; see the [implementation ledger](../../docs/plans/visual-integration-progress.md) for remaining verification.

See [Storybook navigation](../../docs/STORYBOOK_NAVIGATION.md) for the shared category definitions and moved entries. Web retains explicit CSF IDs. Native 10.4.4 uses the new title-derived IDs because its runtime index ignores meta.id; select the renamed entry from the menu if an old saved selection is missing.

## SDK 58 host compatibility

A binary built with older Worklets cannot run the current JS dependencies. Rebuild the development host
when native versions differ; changing Metro's URL only fixes the server connection.
RN 0.88 removed the legacy surface-presenter bridge adapter. The pinned ios-utilities patch uses
React's per-runtime `setSurfacePresenter:` module injection for Fabric registry/scheduler access.
See [the native compatibility rationale](../../docs/LIBRARY_POLICY.md#rn-088-fabric-runtime-access).

Native Showcase의 tsconfig는 `expo/tsconfig.base.json`을 파일 확장자까지 명시한다. 확장자 없는 참조는 2026-10-25 Vite/Oxc가 외부 Showcase 파일을 변환하는 Vitest 실행에서 base 파일을 찾지 못했으므로 실제 Expo 설정 파일을 직접 지정했다.
