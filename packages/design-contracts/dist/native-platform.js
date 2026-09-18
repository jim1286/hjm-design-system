import { motion, spacing } from "./foundations.js";
/**
 * iOS는 키보드가 화면 위로 떠오르므로 `padding`이 맞고, Android는 창 자체가 줄어드는
 * `adjustResize`가 기본이라 `height`가 맞는다. 이 표는 RN 문서의 권장을 그대로 옮긴 것이고,
 * 제품이 다시 고르지 않게 하려고 계약에 둔다.
 */
export function resolveKeyboardAvoidanceBehavior(platform) {
    return platform === "ios" ? "padding" : "height";
}
export const keyboardAvoidanceDefaults = {
    offset: spacing.sm,
    safeAreaBottom: 0,
};
/**
 * 키보드가 올라왔을 때 콘텐츠가 밀려야 할 거리. safe area는 **한 번만** 센다 —
 * 키보드가 떠 있으면 홈 인디케이터 여백은 키보드가 가리므로 다시 더하면 두 겹이 된다.
 */
export function resolveKeyboardInset(keyboardHeight, descriptor = {}) {
    if (!Number.isFinite(keyboardHeight) || keyboardHeight < 0) {
        throw new RangeError("Keyboard height must be a non-negative finite number");
    }
    const offset = descriptor.offset ?? keyboardAvoidanceDefaults.offset;
    const safeAreaBottom = descriptor.safeAreaBottom ?? keyboardAvoidanceDefaults.safeAreaBottom;
    if (keyboardHeight === 0)
        return safeAreaBottom;
    return Math.max(keyboardHeight + offset - safeAreaBottom, 0) + safeAreaBottom;
}
export const hapticIntents = ["selection", "success", "warning", "error"];
/**
 * 언제 **울리지 않아야** 하는가. 이것이 계약의 절반이다 — 접근성 설정에서 진동을 끈
 * 사용자, 그리고 사용자가 시작하지 않은 변화(서버 푸시로 목록이 바뀌는 것)에는 울리지
 * 않는다. 후자를 빼먹으면 주머니 속 기기가 이유 없이 떨린다.
 */
export function shouldPlayHaptic(input) {
    if (!input.hapticsEnabled)
        return false;
    if (!input.userInitiated)
        return false;
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
};
/** 키보드 전환 시간. 플랫폼 애니메이션과 맞춰 콘텐츠가 따로 놀지 않게 한다. */
export const keyboardTransitionDuration = motion.normal;
//# sourceMappingURL=native-platform.js.map