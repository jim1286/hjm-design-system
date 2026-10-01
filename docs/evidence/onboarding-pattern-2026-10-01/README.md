# Onboarding pattern — 2026-10-01

Web/Native Storybook: Patterns/Onboarding, Default/Dark/LargeText. Existing Steps, Button, Notice, Surface and ContentTransition own rendering/semantics; no new wizard engine is exported. Original illustrative copy and local-only preferences are identified as a preview. No account, permission or network operation is simulated.

[Browser results](browser.json): 390 × 844, keyboard continue, focus retention, topic selection, back/forward preserving selection, finish, restart and skip with no selection. Both showcases and the shared immutable selection/summary test passed. Native Default/Dark/LargeText initial views and topic selection → completion → reset were subsequently verified on iPhone 17 / iOS 27.0; see the [Native follow-up](../native-visual-integration-2026-10-01/README.md). VoiceOver announcements have not been manually verified.

Navigation remains mounted outside the transitioning panel to retain keyboard focus. The current step is announced through the status/live-region text. Skipping explicitly clears selection; going back retains it. Completing changes only demo state.
