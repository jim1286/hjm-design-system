import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { HjmProvider } from "../src/provider.js";
import { ScreenLayout, SettingsScreen, MessageComposer, ChatMessage } from "../src/screens.js";
it("renders localized screen landmarks and controls without a browser", () => {
  const html = renderToStaticMarkup(<HjmProvider><SettingsScreen title="설정" as="section" sections={[{ id: "account", title: "계정", children: <MessageComposer label="초안" sendLabel="보내기" value="" onValueChange={() => {}} onSend={() => {}} /> }]} /></HjmProvider>);
  expect(html).toContain("<section"); expect(html).not.toContain("<main"); expect(html).toContain("계정"); expect(html).toContain("disabled");
  const loading = renderToStaticMarkup(<HjmProvider><ScreenLayout title="알림" state={{ kind: "loading", title: "불러오는 중" }}><span>private data</span></ScreenLayout></HjmProvider>);
  expect(loading).toContain('role="status"'); expect(loading).toContain('aria-busy="true"'); expect(loading).not.toContain("private data");
});

it("preserves message identity, quoted context and delivery without announcing history", () => {
  const html = renderToStaticMarkup(<HjmProvider><ChatMessage direction="outgoing" author="나" timestamp="14:32" deliveryLabel="읽음" reply={<span>인용한 이야기</span>}><span>긴 메시지 내용</span></ChatMessage></HjmProvider>);
  expect(html).toContain('data-direction="outgoing"');
  expect(html).toContain('aria-label="나"');
  expect(html).toContain('인용한 이야기');
  expect(html).toContain('14:32 · 읽음');
  expect(html).not.toContain('aria-live');
});
