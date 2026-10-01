import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import { SearchField } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";
import { EmptyState } from "@hjmds/react/feedback";
import { Sheet } from "@hjmds/react/overlays";
import { filterSearchEntries, searchEntries, searchCategories, searchCopy as copy, type SearchCategory } from "../../../shared/search-pattern";
import { List, ListRow } from "@hjmds/react/display";
function SearchPattern(){
 const[query,setQuery]=useState("");const[category,setCategory]=useState<SearchCategory>("all");const[selected,setSelected]=useState<typeof searchEntries[number]|null>(null);
 const results=filterSearchEntries(query,category);
 const reset=()=>{setQuery("");setCategory("all");};
 return <main><Stack gap="xl"><Surface padding="lg"><Stack gap="md"><Text tone="muted">{copy.eyebrow}</Text><Text variant="heading" role="heading" aria-level={1}>{copy.title}</Text><Text>{copy.intro}</Text><SearchField label={copy.field} placeholder={copy.placeholder} clearLabel={copy.clear} value={query} onValueChange={setQuery}/><Stack axis="inline" wrap gap="sm">{searchCategories.map(item=><Button key={item.id} tone={category===item.id?"primary":"ghost"} selected={category===item.id} onClick={()=>setCategory(item.id)}>{item.label}</Button>)}</Stack></Stack></Surface>
 <Text role="status">{results.length}개의 기록</Text>
 {results.length?<List label={copy.list}>{results.map(item=><ListRow key={item.id} title={item.title} description={item.description} onClick={()=>setSelected(item)}/>)}</List>:<EmptyState title={copy.empty} description={copy.emptyBody} action={<Button onClick={reset}>{copy.reset}</Button>}/>}
 <Text tone="muted">{copy.fixture}</Text>
 <Sheet open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}} title={selected?.title??copy.list} closeLabel={copy.close}><Stack gap="lg"><Text>{selected?.body}</Text><Button onClick={()=>setSelected(null)}>{copy.close}</Button></Stack></Sheet>
 </Stack></main>;
}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "patterns-search", title: "배포/화면/검색",component:SearchPattern} satisfies Meta<typeof SearchPattern>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
