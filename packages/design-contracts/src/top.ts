import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import { heading, spacing, typography } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * 화면 본문의 **첫 블록**이다. `TopBar`(상단 내비게이션 바)와 다른 자리이고, 그 차이가
 * 이 계약의 존재 이유다.
 *
 * - `TopBar`는 화면에 고정된 크롬이다 — 뒤로가기, 화면 이름, 액션. 스크롤과 무관하게
 *   붙어 있고 safe area를 다룬다.
 * - `Top`은 본문이다 — 스크롤과 함께 올라가고, 사용자가 "이 화면이 무엇을 묻는지"
 *   읽는 문장이 여기 있다. 토스 TDS가 "Top과 ListRow로 화면 대부분을 만든다"고
 *   말하는 그 Top이고, 지금까지 BurnTok `AppScreenHeader`·Taground `screen-shell`·
 *   Diairy `DetailPanel`이 각자 다시 만들던 블록이다.
 *
 * `Section`과도 다르다. Section은 본문 **중간**의 묶음 제목이라 heading level이 화면
 * 구조에 종속되지만, Top은 화면당 하나뿐인 첫 제목이라 기본이 `h1`이다. 그래서 두
 * 계약을 합치지 않았다 — 합치면 "이 Section이 화면의 h1인가"를 매번 물어야 한다.
 */
export type TopSize = "medium" | "large";

export type TopDescriptor = Readonly<{
  title: string;
  /** 제목 위 한 줄. 카테고리·단계처럼 제목을 한정하는 짧은 말. */
  eyebrow?: string;
  /** 제목 아래 보조 문장. 길면 줄바꿈되며 잘리지 않는다. */
  description?: string;
  size?: TopSize;
  /**
   * 문서 구조상의 제목 단계. 화면당 하나인 Top은 `1`이 기본이지만, 한 라우트가
   * 여러 화면을 담는 경우(시트 안의 화면 등) 제품이 낮출 수 있다.
   */
  headingLevel?: 1 | 2 | 3;
}>;

export const topDefaults = {
  size: "large",
  headingLevel: 1,
} as const satisfies Readonly<{ size: TopSize; headingLevel: 1 | 2 | 3 }>;

function assertNonEmpty(value: string, field: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Top ${field} must not be empty`);
  }
}

export function validateTopDescriptor(descriptor: TopDescriptor): void {
  if (descriptor === null || typeof descriptor !== "object") {
    throw new TypeError("Top descriptor must be an object");
  }
  assertNonEmpty(descriptor.title, "title");
  if (descriptor.eyebrow !== undefined) assertNonEmpty(descriptor.eyebrow, "eyebrow");
  if (descriptor.description !== undefined) {
    assertNonEmpty(descriptor.description, "description");
  }
  if (descriptor.size !== undefined && descriptor.size !== "medium" && descriptor.size !== "large") {
    throw new TypeError(`Unsupported Top size: ${String(descriptor.size)}`);
  }
  if (
    descriptor.headingLevel !== undefined &&
    ![1, 2, 3].includes(descriptor.headingLevel)
  ) {
    throw new TypeError(`Unsupported Top headingLevel: ${String(descriptor.headingLevel)}`);
  }
}

/**
 * `large`는 화면의 첫 제목, `medium`은 시트·모달 안의 첫 제목이다. 두 단계뿐인 이유는
 * 세 번째가 필요해지는 자리가 곧 `Section`이기 때문이다 — 크기를 더 늘리는 대신 다른
 * 컴포넌트를 쓰라는 신호로 둔다.
 */
export const topRecipe = {
  slots: ["root", "eyebrow", "title", "description", "trailing"] as const,
  defaults: { size: topDefaults.size },
  sizes: {
    medium: { title: typography.titleLarge, paddingTop: spacing.md, paddingBottom: spacing.sm },
    large: { title: heading.level2, paddingTop: spacing.xl, paddingBottom: spacing.md },
  },
  eyebrow: {
    color: semanticColors.content.brand,
    textVariant: "label" as const,
    marginBottom: spacing.xxs,
  },
  title: { color: semanticColors.content.primary },
  description: {
    color: semanticColors.content.body,
    textVariant: "body" as const,
    marginTop: spacing.xs,
  },
  /** 제목 줄 오른쪽 보조 행동. 본문이므로 TopBar처럼 아이콘 전용을 강제하지 않는다. */
  trailing: { gap: spacing.xs },
  gap: spacing.xs,
} as const satisfies {
  slots: readonly ["root", "eyebrow", "title", "description", "trailing"];
  defaults: { size: TopSize };
  sizes: Readonly<{
    medium: { title: typeof typography.titleLarge; paddingTop: number; paddingBottom: number };
    large: { title: typeof heading.level2; paddingTop: number; paddingBottom: number };
  }>;
  eyebrow: { color: ColorReference; textVariant: "label"; marginBottom: number };
  title: { color: ColorReference };
  description: { color: ColorReference; textVariant: "body"; marginTop: number };
  trailing: { gap: number };
  gap: number;
};

export const topBehavior = {
  /** 상태 축이 없다 — 화면이 제목을 바꾸면 그냥 다른 문자열을 넘긴다. */
  controlled: [],
  inputs: ["title", "eyebrow", "description", "size", "headingLevel"],
  stateAxes: {},
  web: { roles: ["heading"], keyboard: [], focus: "none" },
  native: { roles: ["header"], states: [], actions: [] },
  scenarios: [
    "the-title-is-a-real-heading-element-at-the-declared-level-not-styled-text",
    "top-is-body-content-that-scrolls-away-while-topbar-is-fixed-chrome",
    "description-wraps-instead-of-truncating-so-large-text-never-hides-the-question",
    "a-trailing-action-shares-the-title-row-and-drops-below-it-when-space-runs-out",
    "eyebrow-never-carries-information-the-title-does-not-repeat-in-some-form",
  ],
} as const satisfies BehaviorContract;
