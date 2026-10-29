import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ProfileSummary } from "../src/screen-flows.js";

// 2026-10-29 user rule: another member's profile photo opens large; the avatar frame becomes one image button.
it("makes the avatar an image button only when avatarView is given", () => {
  const html = renderToStaticMarkup(<HjmProvider><ProfileSummary name="바람" avatar={<span data-avatar />} avatarView={{ label: "사진 크게 보기", onPress: () => {} }} /></HjmProvider>);
  expect(html).toMatch(/<button[^>]*class="hjm-image-viewer-trigger hjm-profile-summary__avatar-view"[^>]*aria-label="사진 크게 보기"|<button[^>]*aria-label="사진 크게 보기"[^>]*class="hjm-image-viewer-trigger hjm-profile-summary__avatar-view"/);
  expect(html).toContain("data-avatar");
  expect(renderToStaticMarkup(<HjmProvider><ProfileSummary name="바람" avatar={<span />} /></HjmProvider>)).not.toContain("hjm-image-viewer-trigger");
});
