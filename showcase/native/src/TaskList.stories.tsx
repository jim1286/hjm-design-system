import { IconButton } from "@hjmds/react-native/actions";
import { Trash2 } from "lucide-react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import{ScrollView}from"react-native";
import{useState}from'react';import type{Meta,StoryObj}from'@storybook/react-native';import{TaskList}from'@hjmds/react-native/task-list';import{SortableCollection}from'@hjmds/react-native/sortable';import{Text}from'@hjmds/react-native/primitives';import{initialTasks,taskLabels}from'../../shared/task-list';
function Preview(){const{colors}=useHjmNativeTheme();const[items,setItems]=useState(initialTasks);return <ScrollView><TaskList label="오늘 할 일" items={items} onCompletedChange={(id,completed)=>setItems(old=>old.map(item=>item.id===id?{...item,completed}:item))} renderItemAction={({item,disabled})=><IconButton tone="ghost" disabled={disabled} label={`${item.label} 삭제`} onPress={()=>setItems(old=>old.filter(task=>task.id!==item.id))}><Trash2 size={20} color={colors.text}/></IconButton>} emptyContent={<Text>할 일을 모두 정리했어요.</Text>} renderCollection={({items,renderItem})=><SortableCollection label="오늘 할 일" items={items} labels={taskLabels} onCommit={intent=>setItems(old=>intent.orderedIds.map(id=>old.find(item=>item.id===id)!))} renderItem={item=>renderItem(items.find(task=>task.id===item.id)!)}/>}/></ScrollView>;}
const meta={title: "배포/컴포넌트/입력/할 일 목록",component:Preview}satisfies Meta<typeof Preview>;export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:'dark'}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:'2'}};
