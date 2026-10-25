import { useState } from "react";
import { ColorPicker } from "@hjmds/react/color-picker";
import { Watermark } from "@hjmds/react/watermark";
import { Affix } from "@hjmds/react/affix";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
export function WebAdditionsPreview({ mode = "color" }: { mode?: "color" | "watermark" | "affix" }) {
  const [color, setColor] = useState("#b94627cc");
  // Each story models its own document; saving is confirmation, not an undo toggle.
  const [saved, setSaved] = useState({ watermark: false, affix: false });
  const [fixed, setFixed] = useState(false);
  if (mode === "color") return <Stack gap="md"><ColorPicker label="강조 색상" labels={{ hex: "HEX 값", hue: "색조", saturation: "채도", brightness: "밝기", opacity: "불투명도", invalid: "올바른 HEX 색상을 입력해 주세요.", presets: "추천 색" }} value={color} onValueChange={setColor} alpha presets={["#b94627ff", "#338844ff", "#6644aaff"]} /><Text role="status">선택한 색상: <bdi dir="ltr">{color}</bdi></Text></Stack>;
  // Watermark content is a plain block; the Stack keeps the button on its own line at its natural width.
  // Button blocks aria-disabled activation while preserving focus after confirmation.
  if (mode === "watermark") return <Watermark text={["HJM", "검토용 문서"]}><Stack gap="sm" align="start"><Heading level="level3">검토 중인 문서</Heading><Text>워터마크 위에서도 본문을 선택하고 버튼을 사용할 수 있습니다.</Text><Button aria-disabled={saved.watermark} onClick={() => setSaved(current => ({ ...current, watermark: true }))}>{saved.watermark ? "저장됨" : "문서 저장"}</Button></Stack></Watermark>;
  // Fixed fixture distances make sticky transitions demonstrable without changing product sizing tokens.
  return <div style={{ maxWidth: "100%", height: 280, overflow: "auto" }}><div style={{ height: 160 }}><Text>아래로 스크롤하여 고정을 확인하세요.</Text></div><Affix offset={8} onChange={setFixed}><Stack axis="inline" gap="sm" align="center" wrap><Button aria-disabled={saved.affix} onClick={() => setSaved(current => ({ ...current, affix: true }))}>{saved.affix ? "저장됨" : "변경 저장"}</Button><Text role="status">{fixed ? "상단 고정 중" : "일반 위치"}</Text></Stack></Affix><div style={{ height: 600 }}><Text>고정되어도 버튼의 상태와 키보드 초점은 유지됩니다.</Text></div></div>;
}
