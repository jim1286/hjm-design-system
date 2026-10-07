export const paperSurfaceCopy = {
  title: "종이 줄무늬 비교", intro: "같은 기록과 입력에서 테마의 배경과 줄무늬를 비교해요.",
  mode: "종이 표현", theme: "테마 따르기", plain: "줄무늬 없는 면", ruled: "줄무늬 추가",
  interval: "줄무늬 간격", compact: "24", relaxed: "40", next: "다음 테마",
  screen: "산책 노트", description: "종이의 선은 장식이에요. 글자의 기준선이나 입력 위치를 맞추지 않아요.",
  draft: "산책 메모", initial: "숲길에서 본 작은 잎", detail: "자세히 읽기", close: "닫기", save: "기록 확인", saved: "초안 확인",
  entries: [{ id: "walk", title: "한 걸음의 기록", body: "나무 그늘 아래서 숨을 고르고 짧은 문장을 남겨요." }, { id: "read", title: "읽고 싶은 문장", body: "한 줄이 길어져도 내용은 보통의 레이아웃으로 흐르며 줄무늬와 독립적이에요." }],
  scope: "정적 장식이며 테이프·찢어진 경계·실제 종이 재질을 재현한 것은 아니에요.",
} as const;
export type PaperSurfaceMode = "theme" | "plain" | "ruled";
export const paperSurfaceModes = [
  { value: "theme", label: paperSurfaceCopy.theme }, { value: "plain", label: paperSurfaceCopy.plain }, { value: "ruled", label: paperSurfaceCopy.ruled },
] as const;
