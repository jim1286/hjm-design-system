// Visual studies of Iconly's Dd9IBiPFmI_ carousel (2026-10-02). Colors are
// intentional brand fixtures, not new HJM defaults; icons use existing Lucide.
export const navigationBarReferences = [
 { id: "robot", title: "중앙 전원 버튼", source: "로봇 청소기", presentation: "floating", accent: "#0878c9", soft: "#e4f2ff", items: ["홈", "공간", "스토어", "전력"], icons: ["home", "rooms", "bag", "power"], action: "전원 전환", actionIcon: "power" },
 { id: "finance", title: "초록 포인트 캡슐", source: "자산 관리", presentation: "capsule", accent: "#11695d", soft: "#d6eee8", items: ["홈", "내역", "카드", "설정"], icons: ["home", "receipt", "card", "settings"] },
 { id: "cycle", title: "분리된 기록 버튼", source: "주기 기록", presentation: "capsule", accent: "#b32b60", soft: "#fbe0eb", items: ["홈", "달력", "통계", "기록"], icons: ["home", "calendar", "chart", "drop"], action: "기록 추가", actionIcon: "plus" },
 { id: "social", title: "중앙 작성 버튼", source: "소셜", presentation: "floating", accent: "#171c22", soft: "#e5e7eb", items: ["홈", "검색", "좋아요", "내 정보"], icons: ["home", "search", "heart", "user"], action: "게시물 작성", actionIcon: "plus" },
 { id: "shop", title: "선택 이름이 펼쳐지는 바", source: "쇼핑", presentation: "capsule", accent: "#252b33", soft: "#e5e7eb", items: ["스토어", "목록", "할인", "주문"], icons: ["store", "list", "tag", "bag"] },
 { id: "commerce", title: "중앙 장바구니 버튼", source: "전자상거래", presentation: "floating", accent: "#171c22", soft: "#e5e7eb", items: ["홈", "검색", "분류", "찜"], icons: ["home", "search", "grid", "heart"], action: "장바구니 열기", actionIcon: "bag" },
 { id: "car", title: "민트 포인트 캡슐", source: "전기차", presentation: "capsule", accent: "#65dbb4", soft: "#20282c", items: ["홈", "차량", "충전", "연결", "설정"], icons: ["home", "car", "battery", "link", "settings"] },
 { id: "energy", title: "끝쪽 에너지 버튼", source: "가정 에너지", presentation: "capsule", accent: "#8c6200", soft: "#fff0b5", items: ["홈", "전원", "연결"], icons: ["home", "power", "link"], action: "에너지 절약 전환", actionIcon: "power" },
 { id: "video", title: "어두운 영상 탐색 바", source: "짧은 영상", presentation: "floating", accent: "#543078", soft: "#eee1ff", items: ["홈", "탐색", "메시지", "내 정보"], icons: ["home", "search", "message", "user"], action: "영상 만들기", actionIcon: "plus" },
 { id: "project", title: "둥근 사각형 선택 바", source: "프로젝트 관리", presentation: "capsule", accent: "#ffffff", soft: "#252b33", items: ["홈", "프로젝트", "검색", "내 정보"], icons: ["home", "file", "search", "user"] },
] as const;
export type NavigationBarReference = (typeof navigationBarReferences)[number];

export function referenceNavigationPalette(reference: NavigationBarReference) {
 const light = { primary: reference.accent, onPrimary: "#ffffff", contentBrand: reference.accent, surfaceAccent: reference.soft };
 const dark = { primary: reference.soft, onPrimary: reference.accent, contentBrand: reference.soft, surfaceAccent: reference.accent };
 // The finance/video studies intentionally have a dark surface in either theme,
 // as in the reference; their surrounding Storybook canvas still follows the OS.
 if (reference.id === "finance" || reference.id === "video") {
  const finance = reference.id === "finance";
  const ink = { bg: finance ? "#124c43" : "#352246", surface: finance ? "#276c60" : "#443057", surfaceAlt: finance ? "#276c60" : "#443057", surfaceAccent: finance ? "#408577" : "#16101e", border: finance ? "#71aa9e" : "#947ca5", text: "#ffffff", textBody: "#f5f5f5", textMuted: "#e6e6e6", textSub: "#e6e6e6", contentBrand: "#ffffff", primary: "#ffffff", onPrimary: finance ? "#124c43" : "#352246" };
  return { light: ink, dark: { ...ink, bg: finance ? "#0d352f" : "#23172d" } };
 }
 return { light, dark };
}

// Colors and product labels are presets, not separate navigation behaviors.
// Grouping keeps all ten inspirations available without ten duplicate menu entries.
export const navigationBehaviorGroups = [
 { id: "center", title: "중앙에서 작업 실행", references: ["robot", "social", "commerce", "video"] },
 { id: "separate", title: "탐색 옆에서 작업 실행", references: ["cycle", "energy"] },
 { id: "label", title: "선택한 목적지 이름 표시", references: ["finance", "shop", "car"] },
 { id: "rectangle", title: "사각 영역으로 현재 위치 표시", references: ["project"] },
] as const;
export type NavigationBehavior = (typeof navigationBehaviorGroups)[number]["id"];
