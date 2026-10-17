import type {
  BadgeTone,
  ComponentCategory,
  ComponentPlatform,
  ComponentRoadmapState,
  ComponentSurfaceStatus,
  ReferenceRelationship,
  ShowcaseSurface,
} from "@hjmds/design-contracts";

// One Korean vocabulary for the Web overview pages (home, explorer, catalog, contract pages); each page used to carry
// its own copy or print the raw enum, so the same state read "stable", "안정" or "Live contract" depending on the page.
export const categoryLabels: Readonly<Record<ComponentCategory, string>> = {
  foundation: "글자와 아이콘",
  layout: "레이아웃",
  action: "동작",
  input: "입력",
  navigation: "탐색",
  "data-display": "데이터 표시",
  feedback: "상태와 알림",
  overlay: "오버레이",
  provider: "제공자 설정",
  utility: "보조 기능",
};

export const platformLabels: Readonly<Record<ComponentPlatform, string>> = {
  shared: "웹·앱 공통",
  adaptive: "환경별 대응",
  web: "웹",
  native: "앱",
};

export const statusLabels: Readonly<Record<ComponentSurfaceStatus, string>> = {
  stable: "안정",
  beta: "시험 사용",
  planned: "구현 예정",
  deprecated: "사용 종료 예정",
  unsupported: "미지원",
};

export const statusTones: Readonly<Record<ComponentSurfaceStatus, BadgeTone>> = {
  stable: "success",
  beta: "brand",
  planned: "neutral",
  deprecated: "danger",
  unsupported: "neutral",
};

export const roadmapStateLabels: Readonly<Record<ComponentRoadmapState, string>> = {
  "contract-ready": "계약 준비됨",
  composed: "조합으로 해결",
  "evidence-needed": "증거 필요",
  prerequisite: "선행 조건",
  declined: "제외",
};

export const roadmapStateTones: Readonly<Record<ComponentRoadmapState, BadgeTone>> = {
  "contract-ready": "info",
  composed: "success",
  "evidence-needed": "warning",
  prerequisite: "info",
  declined: "danger",
};

export const relationshipLabels: Readonly<Record<ReferenceRelationship, string>> = {
  direct: "직접 대응",
  adapted: "변형 대응",
  decomposed: "나눠서 대응",
};

export const surfaceLabels: Readonly<Record<ShowcaseSurface, string>> = {
  contract: "계약",
  web: "웹",
  native: "앱",
};
