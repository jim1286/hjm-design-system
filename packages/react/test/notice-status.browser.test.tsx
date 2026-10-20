import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Notice } from "../src/feedback.js";
import { Card } from "../src/display.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("fits saved feedback inside a narrow card in both themes, without moving focus", async () => {
  const host = document.createElement("div"); host.style.width = "320px"; document.body.append(host);
  const root = createRoot(host);
  try {
    for (const theme of ["light", "dark"] as const) {
      await act(async () => root.render(<HjmProvider theme={theme}><Card title="KE123">
        <Notice appearance="status" tone="success" title="저장됨" description="인천에서 도쿄로 가는 항공편을 내 항공편에 추가했어요" action={<button>항공편 열기</button>} />
      </Card></HjmProvider>));
      const status = host.querySelector<HTMLElement>('[role="status"]')!;
      const style = getComputedStyle(status);
      expect(style.padding).toBe("0px");
      expect(style.borderTopWidth).toBe("0px");
      expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
      expect(status.scrollWidth).toBeLessThanOrEqual(status.clientWidth);
      const button = host.querySelector<HTMLButtonElement>("button")!;
      button.focus(); expect(document.activeElement).toBe(button);
      expect(host.querySelectorAll('[role="status"]')).toHaveLength(1);
    }
  } finally { await act(async () => root.unmount()); host.remove(); }
});
