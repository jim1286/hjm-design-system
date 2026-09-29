import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatedStatistic } from "@hjmds/react/statistic-motion";
import { MorphingMenu } from "@hjmds/react/menu-morph";
import { Button } from "@hjmds/react/actions";
function Demo() {
  const [value, setValue] = useState(1280);
  const [action, setAction] = useState("선택 없음");
  return <div style={{ display: "grid", gap: "var(--hjm-space-lg)" }}>
    <AnimatedStatistic descriptor={{ id: "views", label: "조회 수" }} value={value} locale="ko-KR" />
    <Button onClick={() => setValue(current => current + 127)}>조회 수 변경</Button>
    <MorphingMenu label="작업 선택" items={[{ id: "save", label: "저장" }, { id: "share", label: "공유" }, { id: "delete", label: "삭제", disabled: true }]} onAction={setAction} />
    <p aria-live="polite">{action}</p>
  </div>;
}
const meta = { title: "Patterns/Optional Motion", component: Demo } satisfies Meta<typeof Demo>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
