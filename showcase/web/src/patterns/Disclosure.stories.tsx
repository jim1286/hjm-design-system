import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Collapsible } from "@hjmds/react/collapsible";
import { ContextMenu } from "@hjmds/react/context-menu";
import { Menubar } from "@hjmds/react/menubar";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Text } from "@hjmds/react/layout";

/*
  Accordion이 아니라 Collapsible인 이유를 한 화면에서 보여 준다: 이웃이 없으니
  구분선도, 그룹 키보드 이동도, "하나만 열림" 정책도 없다.
*/
export function CollapsiblePreview() {
  return (
    <Stack gap="md">
      <Collapsible trigger="배송 정보 더 보기" defaultOpen>
        <Text>주문 다음 날 도착합니다. 도착 전날 알림을 보내드려요.</Text>
      </Collapsible>
      <Collapsible trigger="환불 규정 더 보기">
        <Text>받은 날부터 7일 안에는 그대로 돌려드립니다.</Text>
      </Collapsible>
    </Stack>
  );
}

const contextItems = [
  { id: "edit", label: "이름 바꾸기", textValue: "이름 바꾸기", shortcut: "F2" },
  { id: "duplicate", label: "복제하기", textValue: "복제하기", disabled: true },
  { id: "delete", label: "삭제하기", textValue: "삭제하기", tone: "danger" as const },
];

export function ContextMenuPreview() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <Stack gap="md">
      {/* 키보드로도 열 수 있다는 것이 이 컴포넌트의 핵심이라 안내를 같이 둔다. */}
      <Text>아래 영역에서 우클릭하거나, 초점을 준 뒤 Shift+F10을 누르세요.</Text>
      <ContextMenu accessibilityLabel="기록 작업" items={contextItems} onAction={(id) => setLast(id)}>
        <div className="hjm-showcase-context-target">2026년 9월 18일 기록</div>
      </ContextMenu>
      {last ? <Notice tone="info" title="실행했어요" description={`${last} 작업을 실행했습니다.`} /> : null}
    </Stack>
  );
}

const menubarMenus = [
  { id: "file", label: "파일", items: [
    { id: "new", label: "새 기록", textValue: "새 기록", shortcut: "⌘N" },
    { id: "open", label: "열기", textValue: "열기", shortcut: "⌘O" },
  ] },
  { id: "edit", label: "편집", items: [
    { id: "undo", label: "실행 취소", textValue: "실행 취소", shortcut: "⌘Z" },
    { id: "redo", label: "다시 실행", textValue: "다시 실행", shortcut: "⇧⌘Z" },
  ] },
  { id: "help", label: "도움말", disabled: true, items: [{ id: "about", label: "정보", textValue: "정보" }] },
];

export function MenubarPreview() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <Stack gap="md">
      <Menubar
        descriptor={{ accessibilityLabel: "주 메뉴", menus: menubarMenus }}
        onAction={(id, menuId) => setLast(`${menuId}/${id}`)}
      />
      <Text>메뉴를 연 뒤 ←/→로 옆 메뉴로 넘어가 보세요. 비활성 메뉴는 건너뜁니다.</Text>
      {last ? <Notice tone="info" title="실행했어요" description={last} /> : null}
    </Stack>
  );
}

const meta = { title: "Patterns/Disclosure", component: CollapsiblePreview } satisfies Meta<typeof CollapsiblePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SingleDisclosure: Story = {};
export const PointerMenu: Story = { render: () => <ContextMenuPreview /> };
export const DesktopMenubar: Story = { render: () => <MenubarPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
