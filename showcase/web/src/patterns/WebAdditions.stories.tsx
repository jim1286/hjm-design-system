import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorPicker } from "@hjmds/react/color-picker";
import { Watermark } from "@hjmds/react/watermark";
import { Affix } from "@hjmds/react/affix";
import { Button } from "@hjmds/react/actions";
export function WebAdditionsPreview({ mode = "color" }: { mode?: "color" | "watermark" | "affix" }) {
  const [color, setColor] = useState("#b94627cc");
  const [saved, setSaved] = useState(false);
  const [fixed, setFixed] = useState(false);
  if (mode === "color") return <><ColorPicker label="강조 색상" labels={{ color: "색상 선택", hex: "HEX 값", opacity: "불투명도", invalid: "올바른 HEX 색상을 입력해 주세요." }} value={color} onValueChange={setColor} alpha presets={["#b94627ff", "#338844ff", "#6644aaff"]} /><p aria-live="polite">선택한 색상: <bdi dir="ltr">{color}</bdi></p></>;
  if (mode === "watermark") return <Watermark text={["HJM", "검토용 문서"]}><h3>검토 중인 문서</h3><p>워터마크 위에서도 본문을 선택하고 버튼을 사용할 수 있습니다.</p><Button onClick={() => setSaved(!saved)}>{saved ? "저장됨" : "문서 저장"}</Button></Watermark>;
  // Fixed fixture distances make sticky transitions demonstrable without changing product sizing tokens.
  return <div style={{ maxWidth: "100%", height: 280, overflow: "auto" }}><div style={{ height: 160 }}>아래로 스크롤하여 고정을 확인하세요.</div><Affix offset={8} onChange={setFixed}><Button onClick={() => setSaved(!saved)}>{saved ? "저장됨" : "변경 저장"}</Button><span>{fixed ? "상단 고정 중" : "일반 위치"}</span></Affix><div style={{ height: 600 }}>고정되어도 버튼의 상태와 키보드 초점은 유지됩니다.</div></div>;
}
const meta = { includeStories: ["ChooseColor","MarkDocument","StickyAction"], id: "patterns-web-additions", title: "배포/구성/웹 보조 기능", component: WebAdditionsPreview } satisfies Meta<typeof WebAdditionsPreview>;
export default meta;
export const ChooseColor: StoryObj<typeof meta> = { name: "색상 선택",};
export const MarkDocument: StoryObj<typeof meta> = { name: "문서 표시", args: { mode: "watermark" } };
export const StickyAction: StoryObj<typeof meta> = { name: "고정 실행 영역", args: { mode: "affix" } };
