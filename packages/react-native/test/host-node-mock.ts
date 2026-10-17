import type { ReactElement } from "react";

/**
 * Host node mock for react-test-renderer proofs. Components call host imperative APIs on mount
 * (ScrollView.scrollTo in OnboardingScreen, TextInput.focus for initial focus); an empty object made those
 * proofs throw and left the component unclaimed instead of the harness modelling the host (2026-10-18).
 */
export function createHostNodeMock(element: ReactElement): object {
  const type = String(element.type);
  if (type === "ScrollView" || type === "FlatList") return { scrollTo() {}, scrollToEnd() {}, scrollToIndex() {}, scrollToOffset() {} };
  if (type === "TextInput") return { focus() {}, blur() {}, isFocused: () => false, setNativeProps() {} };
  return {};
}
