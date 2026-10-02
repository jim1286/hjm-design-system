export type SearchCategory = "all" | "memo" | "place" | "idea";
export const searchCategories = [{id:"all",label:"전체"},{id:"memo",label:"메모"},{id:"place",label:"장소"},{id:"idea",label:"아이디어"}] as const;
export const searchEntries = [
 {id:"walk",category:"memo",title:"비 오는 날의 산책",description:"작은 골목에서 발견한 느린 오후",body:"비가 그친 뒤 골목을 걸었어요. 다음에는 카메라를 가져가고 싶어요.",keywords:"rain walk"},
 {id:"cafe",category:"place",title:"햇살이 머무는 카페",description:"창가 자리와 따뜻한 차",body:"오후에 햇살이 들어오는 창가 자리. 책을 읽으며 잠깐 쉬기 좋은 곳이에요.",keywords:"cafe coffee"},
 {id:"garden",category:"idea",title:"주말의 작은 정원",description:"베란다에 초록을 더하는 계획",body:"허브 두 화분으로 시작해요. 햇빛이 드는 시간과 물 주는 날을 기록해 보려고 해요.",keywords:"garden plant"},
 {id:"book",category:"memo",title:"책에서 발견한 문장",description:"다시 읽고 싶은 생각 한 조각",body:"떠오른 생각을 내 말로 적어 두고 다음 기록과 연결해요.",keywords:"book read"},
] as const;
export function filterSearchEntries(query:string, category:SearchCategory){
 const terms=query.normalize("NFKC").trim().toLocaleLowerCase("ko-KR").split(/\s+/).filter(Boolean);
 return searchEntries.filter(item=>(category==="all"||item.category===category)&&terms.every(term=>`${item.title} ${item.description} ${item.body} ${item.keywords}`.normalize("NFKC").toLocaleLowerCase("ko-KR").includes(term)));
}
export const searchCopy={eyebrow:"나의 작은 보관함",title:"다시 만나고 싶은 순간",intro:"기억나는 단어로 내 기록을 찾아보세요.",field:"기록 검색",clear:"검색어 지우기",placeholder:"산책, 카페, 아이디어",empty:"찾는 기록이 없어요",emptyBody:"검색어를 바꾸거나 필터를 초기화해 보세요.",reset:"전체 기록 보기",list:"검색 결과",close:"닫기",fixture:"직접 작성한 예제 기록을 기기 안에서 검색합니다."};
