import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { SearchField } from "@hjmds/react/forms";
import { Sheet } from "@hjmds/react/overlays";
import { EmptyState } from "@hjmds/react/feedback";
import { galleryCategories, selectGalleryEntries, type GalleryCategory, type GalleryEntry } from "../../../shared/discovery-gallery";
// Original UI artwork; gallery thumbnails and third-party product assets are not copied.
function Artwork({ entry }: { entry: GalleryEntry }) {
 const editorial=entry.layout==="editorial"; const mobile=entry.layout==="mobile";
 return <div aria-hidden="true" style={{ aspectRatio: "1.6", borderRadius: "var(--hjm-radius-lg)", background: editorial?"var(--hjm-color-primary)":"var(--hjm-color-surface-accent)", color:editorial?"var(--hjm-color-on-primary)":"var(--hjm-color-text)", padding: "var(--hjm-space-lg)", display: "flex", gap: "var(--hjm-space-md)", overflow: "hidden" }}>
 {editorial ? <div style={{display:"flex",alignItems:"center",gap:"var(--hjm-space-lg)",width:"100%"}}><div style={{flex:1}}><span style={{fontSize:"var(--hjm-type-caption-size)"}}>INDEPENDENT STUDIO</span><div style={{fontSize:"var(--hjm-type-heading-size)",lineHeight:"var(--hjm-type-heading-line-height)",fontWeight:"var(--hjm-font-weight-heavy)",marginBlock:"var(--hjm-space-md)"}}>MAKE<br/>ROOM.</div><span style={{textDecoration:"underline"}}>Explore our work ↗</span></div><div style={{width:"40%",aspectRatio:"1",borderRadius:"50% 50% 0 50%",background:"var(--hjm-color-on-primary)",opacity:.85,transform:"rotate(-15deg)"}}/></div> :
 [0,1,2].slice(0,mobile?3:1).map(index=><div key={index} style={{flex:1,minWidth:0,background:"var(--hjm-color-bg)",borderRadius:mobile?"var(--hjm-radius-xl)":"var(--hjm-radius-md)",padding:"var(--hjm-space-sm)",display:"flex",flexDirection:"column",gap:"var(--hjm-space-xs)",transform:mobile?`translateY(${index===1?"var(--hjm-space-sm)":"0px"})`:undefined}}>
 <span style={{fontSize:"var(--hjm-type-caption-size)",fontWeight:"var(--hjm-font-weight-bold)"}}>{mobile?["Today","Discover","Saved"][index]:"Workspace / Overview"}</span>
 {mobile?<><div style={{flex:1,display:"grid",placeItems:"center",background:index===1?"var(--hjm-color-surface-accent)":"var(--hjm-color-surface-alt)",borderRadius:"var(--hjm-radius-md)"}}><span style={{fontSize:"var(--hjm-type-heading-size)",color:"var(--hjm-color-primary)"}}>{["✺","◒","✦"][index]}</span></div><span style={{fontSize:"var(--hjm-type-caption-size)"}}>{["New day","Find more","Your picks"][index]}</span></>:
 <><div style={{display:"flex",gap:"var(--hjm-space-sm)"}}>{["128","+24%","8.4k"].map(value=><div key={value} style={{flex:1,padding:"var(--hjm-space-sm)",background:"var(--hjm-color-surface-alt)",borderRadius:"var(--hjm-radius-sm)",fontWeight:"var(--hjm-font-weight-bold)"}}>{value}</div>)}</div><div style={{display:"flex",alignItems:"end",gap:"var(--hjm-space-xs)",flex:1}}>{[35,55,42,80,65,95,73,100].map((height,i)=><div key={i} style={{flex:1,height:`${height}%`,background:i===5?"var(--hjm-color-primary)":"var(--hjm-color-surface-accent)",borderRadius:"var(--hjm-radius-sm)"}}/>)}</div></>}
 </div>)}
 </div>;
}
function DiscoveryGallery() {
 const [query,setQuery] = useState(""); const [category,setCategory] = useState<GalleryCategory>("전체");
 const [sort,setSort] = useState<"popular" | "latest">("popular"); const [saved,setSaved] = useState<string[]>([]); const [savedOnly,setSavedOnly] = useState(false); const [selected,setSelected] = useState<GalleryEntry | null>(null);
 const results=selectGalleryEntries(query,category,sort,savedOnly,saved);
 const toggle=(id:string)=>setSaved(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);
 const reset=()=>{setQuery("");setCategory("전체");setSavedOnly(false);};
 return <main><Stack gap="xl"><Stack gap="md"><Text tone="brand">작은 아이디어가 시작되는 곳</Text><Text variant="heading" role="heading" aria-level={1}>다음 화면의 영감을 찾아보세요</Text><Text>마음에 드는 화면을 살펴보고 나만의 컬렉션에 담아보세요.</Text><SearchField label="작품 검색" placeholder="모바일, 작업 공간, 서연" clearLabel="검색어 지우기"  value={query} onValueChange={setQuery}/></Stack>
 <Stack axis="inline" wrap gap="sm">{galleryCategories.map(item=><Button key={item} selected={category===item} tone={category===item ? "primary" : "ghost"} onClick={()=>setCategory(item)}>{item}</Button>)}</Stack>
 <Stack axis="inline" wrap gap="sm"><Button tone="secondary" onClick={()=>setSort(sort==="popular"?"latest":"popular")}>정렬: {sort==="popular"?"인기순":"최신순"}</Button><Button tone="ghost" selected={savedOnly} onClick={()=>setSavedOnly(!savedOnly)}>저장한 작품 {saved.length}</Button></Stack>
 <Text role="status">{results.length}개의 작품</Text>
 {results.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, calc(var(--hjm-space-xxxl) * 8)), 1fr))", gap: "var(--hjm-space-xl)" }}>{results.map(item=><article key={item.id}><Stack gap="sm"><Artwork entry={item}/><Text variant="label">{item.title}</Text><Text tone="muted">{item.author} · {item.category} · 좋아요 {item.likes}</Text><Stack axis="inline" wrap gap="sm"><Button tone="ghost" onClick={()=>setSelected(item)} aria-label={`${item.title} 보기`}>자세히 보기</Button><Button aria-label={`${item.title} ${saved.includes(item.id)?"저장 취소":"저장"}`} tone="secondary" selected={saved.includes(item.id)} onClick={()=>toggle(item.id)}>{saved.includes(item.id)?"저장됨":"저장"}</Button></Stack></Stack></article>)}</div> : <EmptyState title="찾는 작품이 없어요" description="다른 검색어나 카테고리로 다시 찾아보세요." action={<Button onClick={reset}>필터 초기화</Button>}/>}
 <Text tone="muted">직접 만든 예제 작품입니다. 저장은 이 미리보기에서만 유지됩니다.</Text>
 <Sheet  open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}} title={selected?.title??"작품 상세"} closeLabel="닫기"><Stack gap="lg">{selected && <><Artwork entry={selected}/><Text>{selected.author} · {selected.category}</Text><Text>큰 제목과 명확한 행동, 여유 있는 간격으로 구성한 화면입니다.</Text><Button aria-label={`${selected.title} ${saved.includes(selected.id)?"저장 취소":"저장"}`} selected={saved.includes(selected.id)} onClick={()=>toggle(selected.id)}>{saved.includes(selected.id)?"저장 취소":"컬렉션에 저장"}</Button></>}</Stack></Sheet>
 </Stack></main>;
}
const meta = { includeStories: ["Default","Dark","LargeText"], id: "patterns-discovery-gallery", title: "배포/화면/작품 탐색", component: DiscoveryGallery } satisfies Meta<typeof DiscoveryGallery>;
export default meta;
export const Default: StoryObj<typeof meta> = { name: "기본",};
export const Dark: StoryObj<typeof meta> = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: StoryObj<typeof meta> = { name: "큰 글자", globals: { textScale: "2" } };
