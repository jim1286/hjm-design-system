import type { BehaviorContract } from "./behaviors.js";
import { motion, spacing } from "./foundations.js";

/**
 * React Native 화면이 매번 다시 푸는 두 가지 — **키보드가 하단 행동을 가리는 문제**와
 * **햅틱을 언제 울릴 것인가** — 의 계약이다. 컴포넌트가 아니라 판정과 어휘다.
 *
 * 왜 여기 있나: 폼이 있는 모든 RN 화면이 `KeyboardAvoidingView`의 `behavior`를 각자
 * 고르고(iOS `padding`/Android `height`), BottomCTA가 키보드에 가려지는 것을 각자
 * 발견했다. 정답이 플랫폼별로 고정돼 있는데 그 지식이 제품마다 흩어져 있었다.
 *
 * 햅틱도 같다. "성공했을 때 울린다"는 제품 결정이지만, **어떤 세기가 어떤 의미인가**는
 * 디자인 시스템의 어휘다. 그것이 없으면 한 앱 안에서 저장은 무겁고 삭제는 가벼운
 * 식으로 뒤섞인다.
 */
export type KeyboardAvoidanceBehavior = "padding" | "height" | "position";

/**
 * iOS는 키보드가 화면 위로 떠오르므로 `padding`이 맞고, Android는 창 자체가 줄어드는
 * `adjustResize`가 기본이라 `height`가 맞는다. 이 표는 RN 문서의 권장을 그대로 옮긴 것이고,
 * 제품이 다시 고르지 않게 하려고 계약에 둔다.
 */
export function resolveKeyboardAvoidanceBehavior(
  platform: "ios" | "android",
): KeyboardAvoidanceBehavior {
  return platform === "ios" ? "padding" : "height";
}

export type KeyboardAvoidanceDescriptor = Readonly<{
  /** 키보드 위에 남겨 둘 여백. 하단 행동이 키보드에 붙어 보이지 않게 한다. */
  offset?: number;
  /** safe area 하단 값. BottomCTA가 이미 더한 값을 두 번 더하지 않도록 명시로 받는다. */
  safeAreaBottom?: number;
}>;

export const keyboardAvoidanceDefaults = {
  offset: spacing.sm,
  safeAreaBottom: 0,
} as const satisfies Required<KeyboardAvoidanceDescriptor>;

/**
 * 키보드가 올라왔을 때 콘텐츠가 밀려야 할 거리. safe area는 **한 번만** 센다 —
 * 키보드가 떠 있으면 홈 인디케이터 여백은 키보드가 가리므로 다시 더하면 두 겹이 된다.
 */
export function resolveKeyboardInset(
  keyboardHeight: number,
  descriptor: KeyboardAvoidanceDescriptor = {},
): number {
  if (!Number.isFinite(keyboardHeight) || keyboardHeight < 0) {
    throw new RangeError("Keyboard height must be a non-negative finite number");
  }
  const offset = descriptor.offset ?? keyboardAvoidanceDefaults.offset;
  const safeAreaBottom = descriptor.safeAreaBottom ?? keyboardAvoidanceDefaults.safeAreaBottom;
  if (keyboardHeight === 0) return safeAreaBottom;
  return Math.max(keyboardHeight + offset - safeAreaBottom, 0) + safeAreaBottom;
}

/**
 * 햅틱 어휘. 세기가 아니라 **의미**로 부른다 — 세기로 부르면 화면마다 다른 뜻으로 쓰인다.
 * 실제 진동은 제품이 자기 햅틱 라이브러리로 실행한다(HJM은 네이티브 모듈을 들이지 않는다).
 */
export type HapticIntent =
  /** 선택이 바뀌었다 — 세그먼트 이동, 토글, 슬라이더 눈금. */
  | "selection"
  /** 되돌릴 수 있는 행동이 끝났다 — 저장, 담기. */
  | "success"
  /** 사용자가 고쳐야 한다 — 검증 실패, 제출 거절. */
  | "warning"
  /** 되돌릴 수 없는 일이 일어났다 — 삭제 확정, 결제 실패. */
  | "error";

export const hapticIntents = ["selection", "success", "warning", "error"] as const satisfies readonly HapticIntent[];

/**
 * 언제 **울리지 않아야** 하는가. 이것이 계약의 절반이다 — 접근성 설정에서 진동을 끈
 * 사용자, 그리고 사용자가 시작하지 않은 변화(서버 푸시로 목록이 바뀌는 것)에는 울리지
 * 않는다. 후자를 빼먹으면 주머니 속 기기가 이유 없이 떨린다.
 */
export function shouldPlayHaptic(
  input: Readonly<{ userInitiated: boolean; hapticsEnabled: boolean; reducedMotion?: boolean }>,
): boolean {
  if (!input.hapticsEnabled) return false;
  if (!input.userInitiated) return false;
  /*
    Reduce Motion은 화면 움직임 설정이지 진동 설정이 아니다. 둘을 묶으면 모션을 끈
    사용자가 촉각 피드백까지 잃는다 — 그쪽이 오히려 유일한 확인 신호일 수 있다.
  */
  return true;
}

export const nativePlatformBehavior = {
  controlled: [],
  inputs: ["keyboardHeight", "safeAreaBottom", "hapticsEnabled"],
  events: ["onKeyboardInsetChange"],
  defaults: { offset: keyboardAvoidanceDefaults.offset },
  configuration: {
    behavior: ["padding", "height", "position"],
    intent: [...hapticIntents],
  },
  stateAxes: { content: ["idle", "loading"] },
  /** Web has no keyboard inset problem of this shape and no haptics contract. */
  web: { roles: [], keyboard: [], focus: "none" },
  native: { roles: [], states: [], actions: [] },
  scenarios: [
    "ios-uses-padding-and-android-uses-height-because-the-platforms-resize-differently",
    "the-safe-area-inset-is-counted-once-never-added-on-top-of-the-keyboard",
    "a-closed-keyboard-leaves-exactly-the-safe-area-inset-behind",
    "haptics-are-named-by-meaning-not-by-strength-so-one-app-stays-consistent",
    "a-change-the-user-did-not-start-never-vibrates",
    "reduce-motion-does-not-silence-haptics-they-are-different-settings",
    "the-design-system-never-bundles-a-native-haptics-module-the-product-plays-it",
  ],
} as const satisfies BehaviorContract;

/** 키보드 전환 시간. 플랫폼 애니메이션과 맞춰 콘텐츠가 따로 놀지 않게 한다. */
export const keyboardTransitionDuration = motion.normal;
