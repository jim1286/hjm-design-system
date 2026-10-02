import { PatternStatus } from "./pattern-status";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { SearchField } from "@hjmds/react-native/inputs";
import { Button } from "@hjmds/react-native/actions";
import { EmptyState } from "@hjmds/react-native/feedback";
import { Sheet } from "@hjmds/react-native/overlays";
import { filterSearchEntries, searchEntries, searchCategories, searchCopy as copy, type SearchCategory } from "../../shared/search-pattern";
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { List, ListRow } from "@hjmds/react-native/data-display";
function SearchPattern(){
 const[query,setQuery]=useState("");const[category,setCategory]=useState<SearchCategory>("all");const[selected,setSelected]=useState<typeof searchEntries[number]|null>(null);
 const results=filterSearchEntries(query,category);
 const reset=()=>{setQuery("");setCategory("all");};
 return <ScrollView automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:spacing.lg}}><Stack gap="xl"><Surface padding="lg"><Stack gap="md"><Text tone="muted">{copy.eyebrow}</Text><Text variant="heading" accessibilityRole="header">{copy.title}</Text><Text>{copy.intro}</Text><SearchField label={copy.field} placeholder={copy.placeholder} clearLabel={copy.clear} busyLabel="검색 중" value={query} onValueChange={setQuery}/><Stack axis="inline" wrap gap="sm">{searchCategories.map(item=><Button key={item.id} tone={category===item.id?"primary":"ghost"} selected={category===item.id} onPress={()=>setCategory(item.id)}>{item.label}</Button>)}</Stack></Stack></Surface>
 <PatternStatus>{`${results.length}개의 기록`}</PatternStatus>
 {results.length?<List label={copy.list}>{results.map(item=><ListRow key={item.id} title={item.title} description={item.description} onPress={()=>setSelected(item)}/>)}</List>:<EmptyState title={copy.empty} description={copy.emptyBody} action={<Button onPress={reset}>{copy.reset}</Button>}/>}
 <Text tone="muted">{copy.fixture}</Text>
 <Sheet scrollable open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}} title={selected?.title??copy.list} closeLabel={copy.close}><Stack gap="lg"><Text>{selected?.body}</Text><Button onPress={()=>setSelected(null)}>{copy.close}</Button></Stack></Sheet>
 </Stack></ScrollView>;
}
const meta={title: "배포/화면/검색",component:SearchPattern} satisfies Meta<typeof SearchPattern>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
