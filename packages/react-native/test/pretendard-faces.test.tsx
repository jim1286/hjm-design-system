import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { StyleSheet, Text as NativeText } from "react-native";
import { expect, it } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Text } from "../src/primitives.js";
import { Heading } from "../src/heading.js";
import { Button } from "../src/actions.js";
import { Badge, Card, CounterBadge, ListRow, Statistic } from "../src/data-display.js";
import { NotificationItem } from "../src/screens.js";

function render(fonts: "system" | "pretendard") {
  let tree: ReactTestRenderer;
  act(() => { tree = create(<HjmNativeProvider fonts={fonts}><Text>본문</Text><Heading level="level3">제목</Heading><Text variant="label">라벨</Text><Heading level="level1">대표 제목</Heading></HjmNativeProvider>); });
  return tree!.root.findAllByType(NativeText).map(node => StyleSheet.flatten(node.props.style));
}

it("selects the bundled Pretendard face per weight and keeps the OS font until fonts load", () => {
  const [body, heading, label, display] = render("pretendard");
  expect(body).toMatchObject({ fontFamily: "Pretendard" });
  expect(heading).toMatchObject({ fontFamily: "Pretendard-Medium" });
  expect(heading!.fontWeight).toBeUndefined();
  // 2026-10-17 decisions: label defaults to 500 and titles to 500. Deprecated level1 equals level3 since the
  // display tier (600) was removed; the SemiBold face is covered by the Statistic value below.
  expect(label).toMatchObject({ fontFamily: "Pretendard-Medium" });
  expect(display).toMatchObject({ fontFamily: "Pretendard-Medium", fontSize: 24 });
  const [systemBody] = render("system");
  expect(systemBody!.fontFamily).toBeUndefined();
});

// 2026-10-17 second round ("굵기 좀더 줄여"): titles and emphasis 500, label 500, body 400, key number 600.
// The display 600 step went away with the display tier the same day, so deprecated level1 draws Medium.
// Each role must land on its bundled face, since Native draws weight by family rather than fontWeight.
it("resolves the lighter weight scale to Pretendard faces per role", () => {
  let tree: ReactTestRenderer;
  act(() => {
    tree = create(
      <HjmNativeProvider fonts="pretendard">
        <Heading level="level1">사용 중단 단계</Heading>
        <Heading level="level3">본문 제목</Heading>
        <Text emphasis="strong">강조</Text>
        <Card title="카드 제목" />
        <Button>버튼 라벨</Button>
        <Badge label="배지" />
        <CounterBadge accessibilityLabel="알림 3개" count={3} />
        <Statistic descriptor={{ id: "orders", label: "주문", value: "128" }} />
        <ListRow title="행 제목" />
        <NotificationItem title="안 읽은 알림" read={false} statusLabel="읽지 않음" timestamp="방금" />
        <NotificationItem title="읽은 알림" read statusLabel="읽음" timestamp="방금" />
      </HjmNativeProvider>,
    );
  });
  const face = (text: string) => {
    const node = tree!.root.findAllByType(NativeText).find(candidate => candidate.props.children === text);
    if (!node) throw new Error(`missing text ${text}`);
    return StyleSheet.flatten(node.props.style).fontFamily;
  };
  expect(face("128")).toBe("Pretendard-SemiBold");
  for (const text of ["사용 중단 단계", "본문 제목", "강조", "카드 제목", "버튼 라벨", "배지", "3", "주문", "행 제목", "안 읽은 알림"]) {
    expect([text, face(text)]).toEqual([text, "Pretendard-Medium"]);
  }
  expect(face("읽은 알림")).toBe("Pretendard");
});
