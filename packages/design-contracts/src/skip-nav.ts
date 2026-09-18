import type { BehaviorContract } from "./behaviors.js";
import type { ColorReference } from "./color-references.js";
import { focusIndicatorContract } from "./component-contracts.js";
import { control, radius, spacing } from "./foundations.js";
import { semanticColors } from "./semantic-colors.js";

/**
 * 반복되는 머리 부분을 건너뛰고 본문으로 바로 가는 링크. WCAG 2.4.1(Bypass Blocks)이
 * 요구하는 것이고, 키보드·스위치 사용자가 매 화면에서 내비게이션 20개를 지나지 않게 한다.
 *
 * `VisuallyHidden`으로 직접 만들 수 있어 보이지만 그러면 **가장 중요한 절반이 빠진다**:
 * 이 링크는 숨어 있다가 **포커스를 받으면 반드시 보여야** 한다. 숨긴 채로 두면 포커스가
 * 화면 밖으로 사라지는 것과 같아서 WCAG 2.4.7(Focus Visible) 위반이 된다. 그 "숨었다가
 * 포커스에서 나타난다"가 이 계약의 전부다.
 *
 * Web 전용이다. 네이티브에는 건너뛸 문서 흐름이 없고 화면 리더가 rotor로 이동한다.
 */
export type SkipNavDescriptor = Readonly<{
  /** 본문 컨테이너의 id. 링크는 `#id`로 이동하고 그 요소가 포커스를 받는다. */
  targetId: string;
  /** 현지화된 문구. renderer가 만들지 않는다. */
  label: string;
}>;

export function validateSkipNavDescriptor(descriptor: SkipNavDescriptor): void {
  if (descriptor === null || typeof descriptor !== "object") {
    throw new TypeError("SkipNav descriptor must be an object");
  }
  if (typeof descriptor.targetId !== "string" || descriptor.targetId.trim().length === 0) {
    throw new TypeError("SkipNav targetId must not be empty");
  }
  if (descriptor.targetId.startsWith("#")) {
    /*
      제품이 `#main`을 넘기면 링크가 `##main`이 되어 조용히 깨진다. 잘라내 주는 대신
      거절하는 이유는 두 표기가 섞이면 어느 쪽이 맞는지 아무도 모르게 되기 때문이다.
    */
    throw new TypeError("SkipNav targetId must be a bare id without '#'");
  }
  if (typeof descriptor.label !== "string" || descriptor.label.trim().length === 0) {
    throw new TypeError("SkipNav label must not be empty");
  }
}

export const skipNavRecipe = {
  slots: ["root"] as const,
  minHeight: control.minTouchTarget,
  paddingHorizontal: spacing.md,
  radius: radius.md,
  background: semanticColors.action.brand.background,
  color: semanticColors.action.brand.content,
  /** 포커스를 받으면 화면 좌상단에 겹쳐 나타난다. 레이아웃을 밀지 않는다. */
  offset: spacing.sm,
  states: { focus: focusIndicatorContract },
} as const satisfies {
  slots: readonly ["root"];
  minHeight: number;
  paddingHorizontal: number;
  radius: number;
  background: ColorReference;
  color: ColorReference;
  offset: number;
  states: { focus: typeof focusIndicatorContract };
};

export const skipNavBehavior = {
  controlled: [],
  inputs: ["targetId", "label"],
  stateAxes: { interaction: ["idle", "focusVisible"] },
  web: { roles: ["link"], keyboard: ["Tab", "Enter"], focus: "native" },
  /** No native surface: there is no document flow to bypass. */
  native: { roles: [], states: [], actions: [] },
  scenarios: [
    "hidden-until-focused-and-always-visible-once-focused",
    "it-is-the-first-tab-stop-on-the-page-or-it-solves-nothing",
    "activating-it-moves-focus-into-the-target-not-only-the-scroll-position",
    "a-target-id-written-with-a-leading-hash-is-rejected-instead-of-silently-doubled",
  ],
} as const satisfies BehaviorContract;
