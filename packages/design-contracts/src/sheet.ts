/** Why an open Sheet is being asked to close. */
export type SheetDismissReason =
  | "close-action"
  | "escape"
  | "back"
  | "outside"
  | "swipe"
  | "programmatic";

/**
 * `trigger` only opens a Sheet. Every close reports the concrete dismiss reason
 * so renderers and product analytics do not have to infer it from platform events.
 */
export type SheetOpenChangeDetails = Readonly<{
  reason: "trigger" | SheetDismissReason;
}>;

/** User-dismiss policy. A controlled owner may always close programmatically. */
export type SheetDismissPolicy = Readonly<{
  dismissible: boolean;
  dismissWhileBusy: boolean;
  outsideDismiss: boolean;
  escapeOrBackDismiss: boolean;
  swipeDismiss: boolean;
}>;

export type SheetOpenState =
  | Readonly<{
      open: boolean;
      defaultOpen?: never;
      onOpenChange(open: boolean, detail: SheetOpenChangeDetails): void;
    }>
  | Readonly<{
      open?: never;
      defaultOpen?: boolean;
      onOpenChange?: (open: boolean, detail: SheetOpenChangeDetails) => void;
    }>;

export const sheetBehaviorDefaults = {
  dismissible: true,
  dismissWhileBusy: false,
  outsideDismiss: true,
  escapeOrBackDismiss: true,
  swipeDismiss: false,
} as const satisfies SheetDismissPolicy;

/**
 * Resolves an attempted close without platform knowledge. Programmatic close is
 * intentionally an owner override: a controlled `open={false}` cannot be vetoed
 * by a renderer, even while the Sheet is busy or not user-dismissible.
 */
export function canDismissSheet(
  reason: SheetDismissReason,
  busy: boolean,
  policy: SheetDismissPolicy = sheetBehaviorDefaults,
): boolean {
  if (reason === "programmatic") return true;
  if (!policy.dismissible) return false;
  if (busy && !policy.dismissWhileBusy) return false;
  if (reason === "outside") return policy.outsideDismiss;
  if (reason === "escape" || reason === "back") {
    return policy.escapeOrBackDismiss;
  }
  if (reason === "swipe") return policy.swipeDismiss;
  return true;
}

export type SheetLifecycle = Readonly<{
  open(): number;
  beginDismiss(): number | null;
  requestClose(
    reason: SheetDismissReason,
    busy: boolean,
    policy?: SheetDismissPolicy,
  ): boolean;
  completeDismiss(cycle: number): boolean;
}>;

/**
 * Makes persistent native Modal renderers settle each visible cycle once.
 * Platform adapters still decide when native dismissal has actually completed.
 */
export function createSheetLifecycle(
  initiallyVisible = false,
): SheetLifecycle {
  let sequence = initiallyVisible ? 1 : 0;
  let activeCycle: number | null = initiallyVisible ? sequence : null;
  let closeRequested = false;
  const dismissingCycles = new Set<number>();

  return {
    open() {
      if (activeCycle !== null) return activeCycle;
      sequence += 1;
      activeCycle = sequence;
      closeRequested = false;
      return activeCycle;
    },
    beginDismiss() {
      if (activeCycle === null) return null;
      const cycle = activeCycle;
      activeCycle = null;
      closeRequested = false;
      dismissingCycles.add(cycle);
      return cycle;
    },
    requestClose(reason, busy, policy = sheetBehaviorDefaults) {
      if (activeCycle === null || closeRequested) return false;
      if (!canDismissSheet(reason, busy, policy)) return false;
      closeRequested = true;
      return true;
    },
    completeDismiss(cycle) {
      return dismissingCycles.delete(cycle);
    },
  };
}

/**
 * 사용자가 시트 높이를 바꾸는 축이다. `sheetRecipe.sizes`는 제품이 여는 높이를 정하고,
 * 이것은 열린 뒤 **사용자가** 단계를 옮기는 문제다 — 지도 위 목록처럼 "조금 보기 ↔ 크게
 * 보기"가 필요한 화면이 그 자리다.
 *
 * `auto`는 단계에 들어가지 않는다. 내용이 정하는 높이라 "다음 단계"가 정의되지 않는다.
 *
 * **드래그 물리는 여기 없다.** 이 계약은 단계 목록과 "다음/이전 단계가 무엇인가"만 갖고,
 * 손가락 속도·관성·고무줄은 넣지 않았다 — 실제 제품 화면 없이 그 값을 정하면 기기에서
 * 다시 다 고치게 된다. 대신 **핸들이 접근 가능한 컨트롤**이라 키보드·보조기기에서도
 * 단계를 옮길 수 있다. 제스처는 제품이 얹고, 결과를 같은 `onDetentChange`로 보낸다.
 */
export type SheetDetent = "medium" | "large" | "full";

export const sheetDetentOrder = ["medium", "large", "full"] as const satisfies readonly SheetDetent[];

export function validateSheetDetents(detents: readonly SheetDetent[]): void {
  if (detents.length === 0) {
    throw new RangeError("Sheet detents must not be empty");
  }
  const seen = new Set<SheetDetent>();
  for (const detent of detents) {
    if (!sheetDetentOrder.includes(detent)) {
      throw new TypeError(`Unsupported Sheet detent: ${String(detent)}`);
    }
    if (seen.has(detent)) throw new TypeError(`Duplicate Sheet detent: ${detent}`);
    seen.add(detent);
  }
  const ordered = [...detents].sort(
    (left, right) => sheetDetentOrder.indexOf(left) - sheetDetentOrder.indexOf(right),
  );
  if (ordered.some((detent, index) => detent !== detents[index])) {
    /*
      정렬을 대신 해 주지 않는 이유: 순서가 곧 "다음 단계"의 의미라서, 제품이 적은 순서와
      실제 이동 순서가 다르면 디버깅할 수 없는 화면이 된다.
    */
    throw new TypeError("Sheet detents must be listed from smallest to largest");
  }
}

export function resolveNextSheetDetent(
  detents: readonly SheetDetent[],
  current: SheetDetent,
  direction: "expand" | "collapse",
): SheetDetent | null {
  validateSheetDetents(detents);
  const index = detents.indexOf(current);
  if (index === -1) {
    throw new RangeError(`Sheet current detent is not in the list: ${current}`);
  }
  const next = direction === "expand" ? index + 1 : index - 1;
  /** 끝에서는 `null`이다 — renderer가 "더 갈 수 없다"를 컨트롤 상태로 표현한다. */
  return next < 0 || next >= detents.length ? null : detents[next]!;
}

