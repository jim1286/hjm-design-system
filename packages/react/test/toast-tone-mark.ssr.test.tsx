import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Toast } from "../src/toast.js";

// 2026-10-18 stripe contract (docs/toast.md): Toast has no edge stripe, so no hidden element is left for products to
// target; tone stays on the badge and `data-tone`.
it.each(["neutral", "danger"] as const)("renders no tone stripe element for a %s toast, only the tone badge", tone => {
  const html = renderToStaticMarkup(<HjmProvider><Toast descriptor={{ id: "saved", description: "저장했어요", closeLabel: "닫기", tone }} onDismissRequest={() => {}} /></HjmProvider>);
  expect(html).not.toContain("tone-mark");
  expect(html).toContain(`data-tone="${tone}"`);
  expect(html).toContain("hjm-toast__icon");
});
