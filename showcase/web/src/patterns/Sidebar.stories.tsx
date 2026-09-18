import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar } from "@hjmds/react/sidebar";
import { SkipNav } from "@hjmds/react/skip-nav";
import { BottomInfo } from "@hjmds/react/bottom-info";
import { Top } from "@hjmds/react/top";
import { Button } from "@hjmds/react/actions";
import { Stack, Section } from "@hjmds/react/layout";

/*
  데스크톱 셸 한 장: SkipNav(첫 tab stop) → Sidebar(그룹 있는 세로 내비) → 본문.
  Layout이 자리를 정하고 이 컴포넌트들이 그 안을 채운다.
*/
export function SidebarPreview() {
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState("records");
  return (
    <div className="hjm-showcase-shell">
      <SkipNav targetId="showcase-main" label="본문 바로가기" />
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        collapseLabels={{ collapse: "메뉴 접기", expand: "메뉴 펼치기" }}
        onNavigate={setCurrent}
        renderIcon={(item) => <span>{item.label.slice(0, 1)}</span>}
        descriptor={{
          accessibilityLabel: "주요 메뉴",
          currentId: current,
          groups: [
            { id: "records", label: "기록", items: [
              { id: "records", label: "내 기록" },
              { id: "archive", label: "보관함", badgeCount: 3 },
              { id: "trash", label: "휴지통" },
            ] },
            { id: "account", label: "설정", items: [
              { id: "profile", label: "프로필" },
              { id: "billing", label: "결제", disabled: true },
            ] },
          ],
        }}
      />
      <main id="showcase-main" className="hjm-showcase-shell-main">
        <Top descriptor={{ title: "내 기록", description: "왼쪽 메뉴에서 다른 화면으로 갈 수 있어요.", size: "medium" }} />
        <p>현재 화면: {current}</p>
      </main>
    </div>
  );
}

export function BottomInfoPreview() {
  return (
    <Section title="행동 아래의 조건" description="상태를 알리는 Notice와 다른 자리입니다.">
      <Stack gap="md">
        <Button>가입하고 시작하기</Button>
        <BottomInfo items={["가입하면 이용약관과 개인정보 처리방침에 동의하는 것으로 봅니다."]} />
        <BottomInfo
          tone="emphasis"
          items={[
            "결제 수수료는 결제 시점에 확정됩니다.",
            "환불은 결제일로부터 7일 이내에 가능합니다.",
          ]}
        />
      </Stack>
    </Section>
  );
}

const meta = { title: "Patterns/Sidebar", component: SidebarPreview } satisfies Meta<typeof SidebarPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DesktopShell: Story = {};
export const StandingConditions: Story = { render: () => <BottomInfoPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
