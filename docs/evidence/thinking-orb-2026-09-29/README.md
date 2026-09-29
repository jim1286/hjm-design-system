# ThinkingOrb installed-app smoke — 2026-09-29

Existing iPhone 17 simulator / iOS 27.0 and emulator-5554 / Android 16 API 36.
These are simulator/emulator results, not physical-device certification.
Captures precede the stable promotion story rename from Experimental to Feedback.

| Evidence | iOS | Android |
| --- | --- | --- |
| 9 states × 20/64, light | [capture](ios-light.png) | [capture](android-light.png) |
| 9 states × 20/64, dark | [capture](ios-dark.png) | [capture](android-dark.png) |
| Paused accessible label and busy state | [idb snapshot](ios-accessibility.json) | [UIAutomator snapshot](android-accessibility.xml) |
| Background and foreground rendering | Not claimed | [Playground after return](android-resumed.png) |

iOS cold relaunch also retained the paused story and accessible label without the
previous no-scene-lifecycle crash. Expo ~57.0.25 plus the checked-in scene plugin
fixed that host issue. The focused iOS build excludes unrelated menu adapters;
it proves real Skia linkage for ThinkingOrb only. Device Hub timed out twice, so
the same simulator was inspected through simctl screenshots and idb accessibility.

Android captures came from the linked full showcase. The final reproducible menu
compatibility patch separately passed `:react-native-menu_menu:compileDebugKotlin`
(37 tasks, 2026-09-29); that compile is not a fresh full APK/runtime certification.

The OS trees expose a labeled busy element; the RN progressbar property and hidden
Canvas semantics are verified in renderer tests. No VoiceOver/TalkBack usability
or sustained performance claim follows from these captures.

See [reproduction](../../../showcase/native/README.md) and
[contract and proof scope](../../../packages/design-contracts/docs/thinking-orb.md).
