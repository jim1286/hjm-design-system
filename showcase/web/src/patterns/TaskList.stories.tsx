import { IconButton } from "@hjmds/react/actions";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { previewResetLabel } from "../../../shared/component-examples.js";
import { Trash2 } from "lucide-react";
import{useState,useRef,useLayoutEffect}from'react';import type{Meta,StoryObj}from'@storybook/react-vite';import{TaskList}from'@hjmds/react/task-list';import{SortableCollection}from'@hjmds/react/sortable';import{Text}from'@hjmds/react/layout';import{initialTasks,taskLabels}from'../../../shared/task-list';
function Preview(){
 const [items,setItems]=useState(initialTasks);
 const actions=useRef(new Map<string,HTMLButtonElement>());
 const reset=useRef<HTMLDivElement>(null);
 const pendingFocus=useRef<string|null|undefined>(undefined);
 useLayoutEffect(()=>{
  if(pendingFocus.current===undefined)return;
  // The product owns removal; restore focus to a surviving action after React removes the focused button.
  const target=pendingFocus.current===null?reset.current?.querySelector("button"):actions.current.get(pendingFocus.current);
  target?.focus();pendingFocus.current=undefined;
 },[items]);
 return <><TaskList label="오늘 할 일" itemPresentation="plain" items={items}
 onCompletedChange={(id,completed)=>setItems(old=>old.map(item=>item.id===id?{...item,completed}:item))}
 renderItemAction={({item,disabled})=><IconButton ref={node=>{if(node)actions.current.set(item.id,node);else actions.current.delete(item.id);}} tone="ghost" disabled={disabled} label={`${item.label} 삭제`} onClick={()=>{
  const index=items.findIndex(task=>task.id===item.id);
  pendingFocus.current=items[index+1]?.id??items[index-1]?.id??null;
  setItems(old=>old.filter(task=>task.id!==item.id));
 }}><Trash2 size={20}/></IconButton>}
 emptyContent={<Text>할 일을 모두 정리했어요.</Text>}
 renderCollection={({items,renderItem})=><SortableCollection label="오늘 할 일" items={items} labels={taskLabels} onCommit={intent=>setItems(old=>intent.orderedIds.map(id=>old.find(item=>item.id===id)!))} renderItem={item=>renderItem(items.find(task=>task.id===item.id)!)}/>}/>
 {/* Restarting the fixture is a demo control, not a task action. */}
 <div ref={reset}><PreviewTools><PreviewToolButton onClick={()=>setItems(initialTasks)}>{previewResetLabel}</PreviewToolButton></PreviewTools></div></>;
}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "components-inputs-task-list", title: "배포/컴포넌트/입력/할 일 목록",component:Preview}satisfies Meta<typeof Preview>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:'dark'}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:'2'}};
