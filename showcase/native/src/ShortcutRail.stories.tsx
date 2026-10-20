import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { ShortcutRail } from "@hjmds/react-native/shortcut-rail";
import { Button } from "@hjmds/react-native/actions";
import { Stack, Text } from "@hjmds/react-native/primitives";

const initial = [{ id: "seoul", label: "서울특별시" }, { id: "busan", label: "부산광역시" }, { id: "tokyo", label: "도쿄도" }];
function Preview() {
  const [items, setItems] = useState(initial), [opened, setOpened] = useState("");
  return <Stack gap="sm"><ShortcutRail label="최근 도시" items={items} onAction={item => setOpened(item.label)}
    onRemove={item => setItems(current => current.filter(row => row.id !== item.id))} removeLabel={item => `최근 도시에서 ${item.label} 지우기`} />
    {opened ? <Text>{opened} 열기</Text> : null}
    <Button tone="ghost" size="small" onPress={() => setItems(initial)}>예제 기록 복원</Button>
  </Stack>;
}
const meta = { title: "배포/구성/탐색과 이동/바로가기 목록", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "열기와 기록 삭제" };

function WrappedPreview() {
 const [opened,setOpened]=useState("");
 return <Stack gap="sm"><ShortcutRail label="설정 바로가기" layout="wrap" size="medium"
   items={[{id:"profile",label:"내 프로필"},{id:"sound",label:"소리"},{id:"language",label:"언어와 지역별 표시 설정"}]}
   onAction={item=>setOpened(item.label)}/><Text>{opened ? `${opened}으로 이동` : "바로가기를 골라보세요"}</Text></Stack>;
}
export const Wrapped: Story = { name: "줄바꿈 바로가기", render: () => <WrappedPreview/> };

function FilterSummaryPreview() {
 const [year,setYear]=useState("2025"),[opened,setOpened]=useState(false);
 return <Stack gap="sm"><ShortcutRail label="조건 요약"
   leading={<Button onPress={()=>setOpened(true)}>필터 열기</Button>}
   items={[{id:"season",label:year,removable:year!=="2026"}]}
   onAction={()=>setOpened(true)} isRemovable={item=>item.removable}
   onRemove={()=>setYear("2026")} removeLabel={item=>`${item.label} 조건 해제`}/>
   <Text>{opened ? "필터를 열었습니다." : "조건 본문은 열기, ×는 해제입니다."}</Text>
   <Button tone="ghost" size="small" onPress={()=>{setYear("2025");setOpened(false);}}>예제 조건 복원</Button>
 </Stack>;
}
export const FilterSummary: Story = { name: "조건 열기와 선택적 해제", render:()=> <FilterSummaryPreview/> };
