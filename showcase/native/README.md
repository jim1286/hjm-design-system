# Native showcase

Run `pnpm storybook` here to serve the installed development client on port 8084.
The optional native adapters require a linked development client; Expo Go does not
prove their runtime compatibility.

## Full installed-app checks

Use the existing user-approved simulator/emulator. All stories and optional adapters
are included. The earlier Orb-only workaround was removed after the full iOS host
built and its native menu completed a save action. See the
[compatibility rationale](../../docs/LIBRARY_POLICY.md) for the pinned host patches.

iOS prebuild applies the checked-in scene-lifecycle plugin; editing generated
`ios/` files is not a persistent fix.

For the bare iOS Debug showcase, set its React Native bundle location if launch
reports "No script URL provided": `xcrun simctl spawn <existing-udid> defaults write
dev.hjm.designsystem.showcase RCT_jsLocation -string localhost:8084`, then relaunch
that app. This local setting matches the showcase's dedicated Metro port; changing
another app's server or rebuilding all native dependencies is unnecessary.

Select stories through `hjm-showcase://storybook?STORYBOOK_STORY_ID=` followed by
`feedback-thinking-orb--all-states`, `feedback-thinking-orb--all-states-dark`,
or `feedback-thinking-orb--paused`. Inspect the actual light/dark rendering and
the paused host's accessibility label. The paused story avoids animation preventing
Android accessibility snapshots from reaching idle.
