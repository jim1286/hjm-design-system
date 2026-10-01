export const galleryCategories = ["전체", "웹사이트", "모바일", "대시보드"] as const;
export type GalleryCategory = typeof galleryCategories[number];
export const galleryEntries = [
  { id: "garden", title: "초록을 기록하는 하루", category: "모바일", author: "서연", likes: 128, created: 6, layout: "mobile" },
  { id: "studio", title: "작은 스튜디오의 큰 생각", category: "웹사이트", author: "도윤", likes: 92, created: 5, layout: "editorial" },
  { id: "week", title: "한눈에 보는 이번 주", category: "대시보드", author: "지우", likes: 204, created: 4, layout: "dashboard" },
  { id: "travel", title: "다음 여행의 시작", category: "모바일", author: "하린", likes: 76, created: 3, layout: "mobile" },
  { id: "archive", title: "순간을 모으는 아카이브", category: "웹사이트", author: "민준", likes: 163, created: 2, layout: "editorial" },
  { id: "focus", title: "집중을 위한 작업 공간", category: "대시보드", author: "서연", likes: 111, created: 1, layout: "dashboard" },
] as const;
export type GalleryEntry = typeof galleryEntries[number];
export function selectGalleryEntries(query: string, category: GalleryCategory, sort: "popular" | "latest", savedOnly: boolean, saved: readonly string[]) {
  const terms = query.normalize("NFKC").trim().toLocaleLowerCase("ko-KR").split(/\s+/).filter(Boolean);
  return galleryEntries.filter(item => (category === "전체" || item.category === category) && (!savedOnly || saved.includes(item.id)) && terms.every(term => `${item.title} ${item.category} ${item.author}`.normalize("NFKC").toLocaleLowerCase("ko-KR").includes(term)))
    .sort((a,b) => sort === "popular" ? b.likes - a.likes : b.created - a.created);
}
