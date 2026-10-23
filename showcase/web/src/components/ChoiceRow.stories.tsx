import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChoiceRow } from "@hjmds/react/choice-row";
import { choiceRowExample as copy, choiceRowPictureExample as pictures, type ChoiceRowExampleValue, type ChoiceRowPictureValue } from "../../../shared/choice-row";

// The row shows only the confirmed value; the in-memory save stands in for the product's server write.
function ChoiceRowPreview({ failFirst = false }: { failFirst?: boolean }) {
  const [value, setValue] = useState<ChoiceRowExampleValue>(copy.initial);
  const attempts = useRef(0);
  const save = (next: ChoiceRowExampleValue) => new Promise<void>((resolve, reject) => {
    attempts.current += 1;
    setTimeout(() => { if (failFirst && attempts.current === 1) reject(new Error("offline")); else { setValue(next); resolve(); } }, 600);
  });
  return <ChoiceRow title={copy.title} sheetDescription={copy.sheetDescription} items={copy.items} value={value} onValueChange={save} closeLabel={copy.closeLabel} errorLabel={copy.errorLabel} />;
}
// Each choice carries its own picture; the row shows the confirmed one and the sheet boxes them all.
function PicturedPreview() {
  const [value, setValue] = useState<ChoiceRowPictureValue>(pictures.initial);
  return <ChoiceRow title={pictures.title} value={value} onValueChange={setValue} closeLabel={pictures.closeLabel}
    items={pictures.items.map(({ swatch, ...item }) => ({ ...item, leading: <span style={{ display: "block", width: 32, height: 32, borderRadius: 8, background: swatch }} /> }))} />;
}
const meta = { id: "components-input-choice-row", title: "배포/컴포넌트/입력/설정 값 선택", component: ChoiceRowPreview } satisfies Meta<typeof ChoiceRowPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const SaveFailure: Story = { name: "저장 실패와 다시 선택", args: { failFirst: true } };
export const Pictured: Story = { name: "그림이 있는 선택지", render: () => <PicturedPreview /> };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
