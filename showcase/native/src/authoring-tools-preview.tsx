import { useState } from "react";
import { BezierEditor } from "@hjmds/react-native/authoring-tools";
import type { BezierCoordinates } from "@hjmds/design-contracts/authoring-tools";
import { Stack,Text } from "@hjmds/react-native/primitives";
export function BezierEditorPreview(){
 const [value,setValue]=useState<BezierCoordinates>([.25,.1,.25,1]);
 return <Stack gap="md"><BezierEditor value={value} onValueChange={setValue} labels={{coordinates:["첫 제어점 X","첫 제어점 Y","둘째 제어점 X","둘째 제어점 Y"],preview:"움직임 미리 보기",curve:"두 제어점의 베지어 곡선",decrement:"줄이기",increment:"늘리기"}} formatCoordinate={value=>value.toFixed(2)}/><Text variant="caption">{`cubic-bezier(${value.join(", ")})`}</Text><Text variant="caption">현재 초안만 바꿉니다. 제품 모션 토큰에는 저장하지 않습니다.</Text></Stack>;
}
