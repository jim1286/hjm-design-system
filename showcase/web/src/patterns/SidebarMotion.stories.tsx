import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar, type SidebarAppearance } from "@hjmds/react/sidebar";
import { Stack, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
function Preview(){
 const[appearance,setAppearance]=useState<SidebarAppearance>("bounce");const[current,setCurrent]=useState("records");
 return <Stack gap="lg"><Stack axis="inline" wrap gap="sm">{(["standard","bounce","hook","proximity"] as const).map(value=><Button key={value} selected={appearance===value} tone="ghost" onClick={()=>setAppearance(value)}>{value}</Button>)}</Stack><Sidebar appearance={appearance} onNavigate={setCurrent} collapseLabels={{collapse:"메뉴 접기",expand:"메뉴 펼치기"}} renderIcon={item=><span>{item.label.slice(0,1)}</span>} descriptor={{accessibilityLabel:"표현 비교 메뉴",currentId:current,groups:[{id:"main",label:"기록",items:[{id:"records",label:"내 기록",destination:{kind:"internal",href:"#records"}},{id:"archive",label:"보관함",destination:{kind:"internal",href:"#archive"}},{id:"locked",label:"사용할 수 없음",disabled:true,destination:{kind:"internal",href:"#locked"}}]}]}}/><Text>현재 화면: {current}</Text></Stack>;
}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "components-navigation-sidebar", title: "배포/컴포넌트/탐색/사이드바 전환",component:Preview} satisfies Meta<typeof Preview>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
