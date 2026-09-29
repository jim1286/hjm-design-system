import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { AnimatedStatistic } from "../src/statistic-motion.js";
import { MorphingMenu } from "../src/menu-morph.js";
import { HjmProvider } from "../src/provider.js";
it("renders deterministic accessible number text without a browser", () => {
  const html = renderToString(<HjmProvider><AnimatedStatistic descriptor={{ id: "count", label: "조회" }} value={1200} locale="ko-KR" /></HjmProvider>);
  expect(html).toContain('aria-label="조회, 1,200"');
});
it("server-renders a closed morph trigger without opening an inaccessible menu", () => {
  const html = renderToString(<HjmProvider><MorphingMenu label="작업" items={[{ id: "save", label: "저장" }]} /></HjmProvider>);
  expect(html).toContain('aria-haspopup="menu"'); expect(html).not.toContain('role="menuitem"');
});
