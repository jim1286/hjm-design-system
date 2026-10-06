import { useState } from "react";
import { ColorPicker } from "@hjmds/react/color-picker";
import { Watermark } from "@hjmds/react/watermark";
import { Affix } from "@hjmds/react/affix";
import { Button } from "@hjmds/react/actions";
import { Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
export function WebAdditionsPreview({ mode = "color" }: { mode?: "color" | "watermark" | "affix" }) {
  const [color, setColor] = useState("#b94627cc");
  const [saved, setSaved] = useState(false);
  const [fixed, setFixed] = useState(false);
  if (mode === "color") return <><ColorPicker label="강조 색상" labels={{ color: "색상 선택", hex: "HEX 값", opacity: "불투명도", invalid: "올바른 HEX 색상을 입력해 주세요." }} value={color} onValueChange={setColor} alpha presets={["#b94627ff", "#338844ff", "#6644aaff"]} /><Text role="status">선택한 색상: <bdi dir="ltr">{color}</bdi></Text></>;
  if (mode === "watermark") return <Watermark text={["HJM", "검토용 문서"]}><Heading level="level3">검토 중인 문서</Heading><Text>워터마크 위에서도 본문을 선택하고 버튼을 사용할 수 있습니다.</Text><Button onClick={() => setSaved(!saved)}>{saved ? "저장됨" : "문서 저장"}</Button></Watermark>;
  // Fixed fixture distances make sticky transitions demonstrable without changing product sizing tokens.
  return <div style={{ maxWidth: "100%", height: 280, overflow: "auto" }}><div style={{ height: 160 }}>아래로 스크롤하여 고정을 확인하세요.</div><Affix offset={8} onChange={setFixed}><Button onClick={() => setSaved(!saved)}>{saved ? "저장됨" : "변경 저장"}</Button><Text role="status">{fixed ? "상단 고정 중" : "일반 위치"}</Text></Affix><div style={{ height: 600 }}>고정되어도 버튼의 상태와 키보드 초점은 유지됩니다.</div></div>;
}
