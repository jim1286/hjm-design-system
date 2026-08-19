/**
 * Products render `idle|loading|loadingMore|empty|error` content states (see
 * `docs/expansion-roadmap.md`'s common state axis table) at two different
 * granularities: replacing an entire screen's content, or replacing one
 * region while the rest of the screen keeps working. That granularity is a
 * second, orthogonal axis — `scope` — not a new content value and not the
 * `status` axis `Result` owns (`docs/result.md`). This module is that axis
 * plus what it forces: action emphasis and accessibility announcement scope.
 *
 * `loadingMore` and `complete` are excluded from `ContentStateStatus` on
 * purpose. Both belong to `LoadMore`'s footer, which is a region by
 * construction (a list footer is never a whole screen) and already owns its
 * own state machine (`src/load-more.ts`). `idle` and `success` render no
 * block at all — the caller shows real content instead.
 */
export type ContentScope = "screen" | "region";

export type ContentStateStatus = "loading" | "empty" | "error";

export type ContentStateActionDescriptor = Readonly<{
  label: string;
  accessibilityLabel?: string;
  onAction(): void;
}>;

export type ContentStateLoadingDescriptor = Readonly<{
  status: "loading";
  scope: ContentScope;
  /** The only accessible signal for a loading block; there is no title/action slot. */
  loadingLabel: string;
}>;

export type ContentStateEmptyDescriptor = Readonly<{
  status: "empty";
  scope: ContentScope;
  title: string;
  description?: string;
  action?: ContentStateActionDescriptor;
}>;

export type ContentStateErrorDescriptor = Readonly<{
  status: "error";
  scope: ContentScope;
  title: string;
  description?: string;
  action?: ContentStateActionDescriptor;
}>;

export type ContentStateDescriptor =
  | ContentStateLoadingDescriptor
  | ContentStateEmptyDescriptor
  | ContentStateErrorDescriptor;

/**
 * `"sole"`: this action is the only content-level way forward (`scope:
 * "screen"`) — render it as the product's primary/filled affordance.
 * `"optional"`: recovery is one option among several still-working controls
 * (`scope: "region"`) — render it de-emphasized so it never competes with a
 * screen's real primary action. Named independently of any Button tone
 * enum: HJM's current `ghost` tone (`src/recipes.ts`) resolves to a muted
 * content color, not the brand-tinted text this repo's product code already
 * renders for it (`AppButton tone="link"`, see docs). Until Button's tone
 * vocabulary grows a brand-tinted low-emphasis tone, products map
 * `"optional"` to whatever local tone matches that description.
 */
export type ContentStateActionEmphasis = "sole" | "optional";

export type ContentStateWebAnnouncement = Readonly<{
  role: "status" | "alert";
  live: "polite" | "assertive";
}>;

export type ContentStateNativeAnnouncement = Readonly<{
  accessibilityLiveRegion: "polite" | "assertive";
  accessibilityRole: "progressbar" | "alert" | "text";
  /**
   * Region-scope failures/empties must never pull the reader away from
   * whatever else they were doing on the screen — that would announce as a
   * whole-screen failure. Only `scope: "screen"`, which has no sibling
   * content to protect, may move initial accessibility focus onto this
   * block, and even then only for `error` — `empty` is calm information
   * (§8.4 "빈 상태는 결핍이 아니라 초대다"), not an interruption, so it never
   * steals focus regardless of scope.
   */
  moveAccessibilityFocus: boolean;
}>;

export type ResolvedContentStateAction = Readonly<{
  label: string;
  accessibilityLabel: string;
  onAction(): void;
  emphasis: ContentStateActionEmphasis;
}>;

export type ResolvedContentStateDescriptor = Readonly<{
  status: ContentStateStatus;
  scope: ContentScope;
  title: string | null;
  description: string | null;
  loadingLabel: string | null;
  action: ResolvedContentStateAction | null;
  web: ContentStateWebAnnouncement;
  native: ContentStateNativeAnnouncement;
}>;

function assertCopy(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`ContentState ${field} must not be empty`);
  }
}

function assertScope(scope: ContentScope): void {
  if (scope !== "screen" && scope !== "region") {
    throw new TypeError(`Unsupported ContentState scope: ${String(scope)}`);
  }
}

function assertAction(
  action: ContentStateActionDescriptor,
  field: string,
): void {
  assertCopy(action.label, `${field}.label`);
  if (action.accessibilityLabel !== undefined) {
    assertCopy(action.accessibilityLabel, `${field}.accessibilityLabel`);
  }
  if (typeof action.onAction !== "function") {
    throw new TypeError(`ContentState ${field}.onAction must be a function`);
  }
}

/**
 * `loading` descriptors carry no `title`/`description`/`action` by design —
 * a validator that reused one blanket "title required" check across every
 * status would reject a perfectly valid loading block. Branch on `status`
 * before asserting copy, and never assert fields the branch doesn't declare.
 */
export function validateContentStateDescriptor(
  descriptor: ContentStateDescriptor,
): void {
  assertScope(descriptor.scope);
  const status = (descriptor as Readonly<{ status?: unknown }>).status;
  if (status !== "loading" && status !== "empty" && status !== "error") {
    throw new TypeError(`Unsupported ContentState status: ${String(status)}`);
  }
  if (descriptor.status === "loading") {
    assertCopy(descriptor.loadingLabel, "loadingLabel");
    return;
  }
  assertCopy(descriptor.title, "title");
  if (descriptor.description !== undefined) {
    assertCopy(descriptor.description, "description");
  }
  if (descriptor.action) assertAction(descriptor.action, "action");
}

export function resolveContentStateActionEmphasis(
  scope: ContentScope,
): ContentStateActionEmphasis {
  assertScope(scope);
  return scope === "screen" ? "sole" : "optional";
}

export function resolveContentStateAnnouncement(
  status: ContentStateStatus,
  scope: ContentScope,
): Readonly<{
  web: ContentStateWebAnnouncement;
  native: ContentStateNativeAnnouncement;
}> {
  assertScope(scope);
  if (status === "loading") {
    return {
      web: { role: "status", live: "polite" },
      native: {
        accessibilityLiveRegion: "polite",
        accessibilityRole: "progressbar",
        moveAccessibilityFocus: false,
      },
    };
  }
  if (status === "empty") {
    return {
      web: { role: "status", live: "polite" },
      native: {
        accessibilityLiveRegion: "polite",
        accessibilityRole: "text",
        moveAccessibilityFocus: false,
      },
    };
  }
  if (status === "error") {
    return {
      web: { role: "alert", live: "assertive" },
      native: {
        accessibilityLiveRegion: "assertive",
        accessibilityRole: "alert",
        moveAccessibilityFocus: scope === "screen",
      },
    };
  }
  throw new TypeError(`Unsupported ContentState status: ${String(status)}`);
}

export function resolveContentStateDescriptor(
  descriptor: ContentStateDescriptor,
): ResolvedContentStateDescriptor {
  validateContentStateDescriptor(descriptor);
  const { web, native } = resolveContentStateAnnouncement(
    descriptor.status,
    descriptor.scope,
  );

  if (descriptor.status === "loading") {
    return {
      status: "loading",
      scope: descriptor.scope,
      title: null,
      description: null,
      loadingLabel: descriptor.loadingLabel,
      action: null,
      web,
      native,
    };
  }

  const emphasis = resolveContentStateActionEmphasis(descriptor.scope);
  const action: ResolvedContentStateAction | null = descriptor.action
    ? {
        label: descriptor.action.label,
        accessibilityLabel:
          descriptor.action.accessibilityLabel ?? descriptor.action.label,
        onAction: descriptor.action.onAction,
        emphasis,
      }
    : null;

  return {
    status: descriptor.status,
    scope: descriptor.scope,
    title: descriptor.title,
    description: descriptor.description ?? null,
    loadingLabel: null,
    action,
    web,
    native,
  };
}
