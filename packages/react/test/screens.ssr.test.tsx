import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { TopBar } from "../src/top-bar.js";
import { HjmProvider } from "../src/provider.js";
import { CompositionLayout, ScreenLayout, SettingsScreen, MessageComposer, ChatMessage } from "../src/screens.js";
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


it("keeps empty states at body size and omits screen header supporting copy", () => {
  for (const Component of [ScreenLayout, CompositionLayout]) {
    const html = renderToStaticMarkup(<HjmProvider><Component title="주변" state={{ kind: "empty", title: "새 꽃이 없어요" }} /></HjmProvider>);
    expect(html).toMatch(/data-variant="body"[^>]*>새 꽃이 없어요</);
  }
  for (const headerAlignment of ["start", "center"] as const) {
    const html = renderToStaticMarkup(<HjmProvider><ScreenLayout title="들판" description="상단 보조 문구" headerAlignment={headerAlignment}><span>본문 안내</span></ScreenLayout></HjmProvider>);
    expect(html).not.toContain("상단 보조 문구");
    expect(html).toContain("본문 안내");
  }
});

it("omits supporting copy from the web top bar", () => {
  const html = renderToStaticMarkup(<HjmProvider><TopBar title="들판" subtitle="상단 보조 문구" /></HjmProvider>);
  expect(html).toContain("들판");
  expect(html).not.toContain("상단 보조 문구");
});
