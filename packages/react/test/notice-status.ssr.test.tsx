import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { Notice } from "../src/feedback.js";

it("keeps saved status, description and actions accessible inside a card", () => {
  const html = renderToStaticMarkup(<HjmProvider><Notice appearance="status" tone="success"
    title="저장됨" description="내 항공편에 추가했어요" action={<button>열기</button>} /></HjmProvider>);
  expect(html).toContain('data-appearance="status"');
  expect(html).toContain('role="status"');
  expect(html).toContain('aria-live="polite"');
  expect(html).toContain('hjm-badge');
  expect(html).toContain('내 항공편에 추가했어요');
  expect(html).toContain('>열기</button>');
});
it("preserves the default error panel and urgency", () => {
  const html = renderToStaticMarkup(<HjmProvider><Notice tone="danger" title="저장하지 못했어요" /></HjmProvider>);
  expect(html).toContain('data-appearance="panel"');
  expect(html).toContain('role="alert"');
  expect(html).not.toContain('hjm-badge');
});
