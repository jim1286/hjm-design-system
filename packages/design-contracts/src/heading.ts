import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import { heading, spacing, type HeadingLevel } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * 문서 제목 단계를 실제로 그리는 primitive다.
 *
 * `heading`(foundations)에는 이미 level1 40px부터 level5 18px까지 다섯 단계가 있었지만
 * **어떤 renderer도 노출하지 않았다** — `Text`는 `TextVariant`(최대 24px)만 받는다.
 * 그래서 랜딩 히어로나 큰 숫자가 필요한 화면은 매번 제품 CSS로 폰트 크기를 직접 썼다.
 * 이 계약은 새 크기를 만들지 않는다. 있던 스케일을 꺼내 쓸 수 있게 하는 것이 전부다.
 *
 * `Top`(화면 첫 제목)·`Section`(본문 묶음 제목)과 겹치지 않는다. 그 둘은 **자리**를
 * 아는 블록이고 자기 여백·보조 문장·보조 행동을 갖는다. `Heading`은 자리를 모르는
 * 글자 하나다 — 카드 안, 표 위, 빈 상태 안 어디에나 놓인다.
 */
export type HeadingDescriptor = Readonly<{
  /** 시각적 크기. 문서 구조상의 단계와 분리돼 있다. */
  level: HeadingLevel;
  /**
   * 실제로 낼 요소 단계. 생략하면 `level`의 숫자를 따른다. 시각적 크기와 문서 구조가
   * 어긋나는 경우(카드 제목이 크지만 h4인 경우)에 따로 지정한다.
   */
  semanticLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}>;

const levelNumbers: Readonly<Record<HeadingLevel, 1 | 2 | 3 | 4 | 5>> = {
  level1: 1,
  level2: 2,
  level3: 3,
  level4: 4,
  level5: 5,
};

export function validateHeadingDescriptor(descriptor: HeadingDescriptor): void {
  if (descriptor === null || typeof descriptor !== "object") {
    throw new TypeError("Heading descriptor must be an object");
  }
  if (!Object.prototype.hasOwnProperty.call(heading, descriptor.level)) {
    throw new TypeError(`Unsupported Heading level: ${String(descriptor.level)}`);
  }
  if (
    descriptor.semanticLevel !== undefined &&
    ![1, 2, 3, 4, 5, 6].includes(descriptor.semanticLevel)
  ) {
    throw new TypeError(`Unsupported Heading semanticLevel: ${String(descriptor.semanticLevel)}`);
  }
}

/** 시각적 단계에서 문서 단계를 뽑되, 명시된 값이 있으면 그것이 이긴다. */
export function resolveHeadingSemanticLevel(
  descriptor: HeadingDescriptor,
): 1 | 2 | 3 | 4 | 5 | 6 {
  validateHeadingDescriptor(descriptor);
  return descriptor.semanticLevel ?? levelNumbers[descriptor.level];
}

export const headingRecipe = {
  slots: ["root"] as const,
  defaults: { level: "level3" as HeadingLevel },
  levels: heading,
  color: semanticColors.content.primary,
  /** 제목 아래 간격은 제목이 아니라 그것을 담는 블록이 정한다. */
  marginBottom: spacing.xs,
} as const satisfies {
  slots: readonly ["root"];
  defaults: { level: HeadingLevel };
  levels: typeof heading;
  color: ColorReference;
  marginBottom: number;
};

export const headingBehavior = {
  controlled: [],
  inputs: ["level", "semanticLevel"],
  stateAxes: {},
  web: { roles: ["heading"], keyboard: [], focus: "none" },
  native: { roles: ["header"], states: [], actions: [] },
  scenarios: [
    "visual-size-and-document-level-are-separate-axes-that-may-disagree-on-purpose",
    "the-element-is-a-real-heading-so-the-rotor-and-skip-links-find-it",
    "no-new-type-sizes-are-introduced-the-existing-heading-scale-is-what-is-exposed",
    "heading-owns-no-surrounding-layout-the-block-that-contains-it-does",
  ],
} as const satisfies BehaviorContract;
