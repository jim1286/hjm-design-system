import { SegmentedControl } from "@hjmds/react-native/inputs";
import { Heading } from "@hjmds/react-native/heading";
import { useState } from "react";
import { PatternStatus } from "./pattern-status";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Container, Grid, Stack, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { SearchField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";
import { EmptyState } from "@hjmds/react-native/feedback";
import { galleryCategories, selectGalleryEntries, type GalleryCategory, type GalleryEntry } from "../../shared/discovery-gallery";
import { ScrollView, View, Text as ArtText, useWindowDimensions } from "react-native";
import { spacing, radius, typography } from "@hjmds/design-contracts/foundations";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
function Artwork({ entry }: { entry: GalleryEntry }) {
 const { colors }=useHjmNativeTheme();const editorial=entry.layout==="editorial";const mobile=entry.layout==="mobile";
 // Decorative specimen text is fixed-size artwork; full readable names remain outside the preview.
 return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{aspectRatio:1.6,borderRadius:radius.lg,backgroundColor:editorial?colors.primary:colors.surfaceAccent,padding:spacing.lg,flexDirection:"row",gap:spacing.md,overflow:"hidden"}}>
 {editorial?<View style={{flexDirection:"row",alignItems:"center",gap:spacing.lg,flex:1}}><View style={{flex:1,gap:spacing.md}}><ArtText allowFontScaling={false} style={{...typography.caption,color:colors.onPrimary}}>INDEPENDENT STUDIO</ArtText><ArtText allowFontScaling={false} style={{...typography.heading,color:colors.onPrimary}}>MAKE{`\n`}ROOM.</ArtText><ArtText allowFontScaling={false} style={{...typography.caption,color:colors.onPrimary}}>Explore our work ↗</ArtText></View><View style={{width:"40%",aspectRatio:1,borderRadius:radius.full,borderBottomRightRadius:0,backgroundColor:colors.onPrimary,opacity:.85,transform:[{rotate:"-15deg"}]}}/></View>:
 [0,1,2].slice(0,mobile?3:1).map(index=><View key={index} style={{flex:1,minWidth:0,backgroundColor:colors.bg,borderRadius:mobile?radius.xl:radius.md,padding:spacing.sm,gap:spacing.xs,transform:[{translateY:mobile&&index===1?spacing.sm:0}]}}>
 <ArtText allowFontScaling={false} style={{...typography.caption,fontWeight:"700",color:colors.text}}>{mobile?["Today","Discover","Saved"][index]:"Workspace / Overview"}</ArtText>
 {mobile?<><View style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:index===1?colors.surfaceAccent:colors.surfaceAlt,borderRadius:radius.md}}><ArtText allowFontScaling={false} style={{...typography.heading,color:colors.primary}}>{["✺","◒","✦"][index]}</ArtText></View><ArtText allowFontScaling={false} style={{...typography.caption,color:colors.text}}>{["New day","Find more","Your picks"][index]}</ArtText></>:
 <><View style={{flexDirection:"row",gap:spacing.sm}}>{["128","+24%","8.4k"].map(value=><View key={value} style={{flex:1,padding:spacing.sm,backgroundColor:colors.surfaceAlt,borderRadius:radius.sm}}><ArtText allowFontScaling={false} style={{...typography.label,color:colors.text}}>{value}</ArtText></View>)}</View><View style={{flexDirection:"row",alignItems:"flex-end",gap:spacing.xs,flex:1}}>{[35,55,42,80,65,95,73,100].map((height,i)=><View key={i} style={{flex:1,height:`${height}%`,backgroundColor:i===5?colors.primary:colors.surfaceAccent,borderRadius:radius.sm}}/>)}</View></>}
 </View>)}
 </View>;
}
// Reuse the status bridge: iOS does not announce Android accessibilityLiveRegion updates.
function DiscoveryGallery() {
 const [query,setQuery] = useState(""); const [category,setCategory] = useState<GalleryCategory>("전체");
 const [sort,setSort] = useState<"popular" | "latest">("popular"); const [saved,setSaved] = useState<string[]>([]); const [savedOnly,setSavedOnly] = useState(false); const [selected,setSelected] = useState<GalleryEntry | null>(null);
 const results=selectGalleryEntries(query,category,sort,savedOnly,saved);
 const toggle=(id:string)=>setSaved(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);
 const reset=()=>{setQuery("");setCategory("전체");setSavedOnly(false);};
 const { width } = useWindowDimensions();
 return <ScrollView automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.lg }}><Container gutter="compact"><Stack gap="xl"><Stack gap="md"><Text tone="brand">작은 아이디어가 시작되는 곳</Text><Heading level="level3" >다음 화면의 영감을 찾아보세요</Heading><Text>마음에 드는 화면을 살펴보고 나만의 컬렉션에 담아보세요.</Text><SearchField label="작품 검색" placeholder="모바일, 작업 공간, 서연" clearLabel="검색어 지우기" busyLabel="검색 중" value={query} onValueChange={setQuery}/></Stack>
 <SegmentedControl label="작품 카테고리" presentation="pills" items={galleryCategories.map(item => ({ value: item, label: item }))} value={category} onValueChange={value => { const item = galleryCategories.find(item => item === value); if (item) setCategory(item); }}/>
 <Stack axis="inline" wrap gap="sm"><Button tone="secondary" onPress={()=>setSort(sort==="popular"?"latest":"popular")}>{`정렬: ${sort==="popular"?"인기순":"최신순"}`}</Button><Button tone="ghost" selected={savedOnly} onPress={()=>setSavedOnly(!savedOnly)}>{`저장한 작품 ${saved.length}`}</Button></Stack>
 <PatternStatus>{`${results.length}개의 작품`}</PatternStatus>
 {results.length ? <Grid columns={{ compact: 1, medium: 2, expanded: 3 }} gap={{ compact: "xl" }} minColumnWidth={{ compact: 320 }}>{results.map(item=><View key={item.id}><Stack gap="sm"><Artwork entry={item}/><Text variant="label">{item.title}</Text><Text tone="muted">{item.author} · {item.category} · 좋아요 {item.likes}</Text><Stack axis="inline" wrap gap="sm"><Button tone="ghost" onPress={()=>setSelected(item)} accessibilityLabel={`${item.title} 보기`}>자세히 보기</Button><Button accessibilityLabel={`${item.title} ${saved.includes(item.id)?"저장 취소":"저장"}`} tone="secondary" selected={saved.includes(item.id)} onPress={()=>toggle(item.id)}>{saved.includes(item.id)?"저장됨":"저장"}</Button></Stack></Stack></View>)}</Grid> : <EmptyState title="찾는 작품이 없어요" description="다른 검색어나 카테고리로 다시 찾아보세요." action={<Button onPress={reset}>필터 초기화</Button>}/>}
 <Text tone="muted">직접 만든 예제 작품입니다. 저장은 이 미리보기에서만 유지됩니다.</Text>
 <Sheet scrollable open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}} title={selected?.title??"작품 상세"} closeLabel="닫기" footer={selected ? <Button accessibilityLabel={`${selected.title} ${saved.includes(selected.id)?"저장 취소":"저장"}`} selected={saved.includes(selected.id)} onPress={()=>toggle(selected.id)}>{saved.includes(selected.id)?"저장 취소":"컬렉션에 저장"}</Button> : null}><Stack gap="lg">{selected && <><Artwork entry={selected}/><Text>{selected.author} · {selected.category}</Text><Text>큰 제목과 명확한 행동, 여유 있는 간격으로 구성한 화면입니다.</Text></>}</Stack></Sheet>
 </Stack></Container></ScrollView>;
}
const meta = { title: "배포/화면/검색/작품 탐색", component: DiscoveryGallery } satisfies Meta<typeof DiscoveryGallery>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
