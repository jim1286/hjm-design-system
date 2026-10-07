import { profileOptions } from "./design-profile";

export const fontRoleCopy = {
  title: "표시·읽기·기술 글자", intro: "같은 기록에서 제목·본문·조작·기술 글자의 역할을 비교해요.",
  choose: "서체 역할", inherited: "UI 서체 상속", separated: "제목과 본문 분리", nextTheme: "다음 테마",
  heading: "작은 순간, 긴 이야기 — Quiet moments", body: "오늘의 산책을 천천히 읽어요. Read slowly, remember clearly. 0123456789",
  caption: "보조 표기는 UI 서체를 유지해요.", ui: "조작 안내는 본문 크기여도 UI 서체예요.", code: "const entry = { id: 'walk', saved: true };",
  card: "한 장의 기록 — A field note", draft: "기록 메모", initial: "테마를 바꿔도 남는 초안", detail: "상세 보기", close: "닫기",
  scope: "참고용 시스템 서체 조합이에요. 브랜드 폰트·라이선스·글리프·기기 등록은 제품에서 관리해요.",
} as const;
export const fontRoleModes = [{ value: "inherited", label: fontRoleCopy.inherited }, { value: "separated", label: fontRoleCopy.separated }] as const;
export type FontRoleMode = typeof fontRoleModes[number]["value"];
export type FontRolePreviewProps = Readonly<{ initialMode?: FontRoleMode }>;
// Inject host font names and the installed public helper; shared fixture data
// must not introduce a renderer dependency or claim native font registration.
export function fontRolePreviewInput(preset: typeof profileOptions[number]["id"], mode: FontRoleMode,
  families: Readonly<{ display: readonly string[]; reading: readonly string[] }>) {
  return { extends: preset, id: `font-roles-${preset}-${mode}`,
    ...(mode === "separated" ? { tokens: { fontFamily: families } } : {}) };
}
