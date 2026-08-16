import type { ThemeColors } from "./colors.js";
import { control, radius, spacing, typography } from "./foundations.js";
import type { TextVariant } from "./foundations.js";

export type ButtonTone = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = keyof typeof control.buttonHeight;
export type SurfaceTone = "default" | "raised" | "accent";
export type FieldVariant = "surface" | "inset";
export type FieldShape = "medium" | "large" | "full";

/** Typed recipe; platform renderers translate the same intent to their own primitives. */
export const buttonRecipe = {
  slots: ["root", "leading", "label", "trailing", "spinner"] as const,
  defaults: { tone: "primary", size: "medium" } as const,
  tones: {
    primary: { background: "primary", content: "onPrimary", border: null },
    secondary: { background: "surfaceAlt", content: "text", border: "border" },
    ghost: { background: null, content: "textMuted", border: null },
    danger: { background: "dangerFill", content: "onDanger", border: null },
  },
  sizes: {
    small: {
      height: control.buttonHeight.small,
      hitSlop: control.buttonHitSlop.small,
      paddingHorizontal: spacing.sm,
      textVariant: "label",
    },
    medium: {
      height: control.buttonHeight.medium,
      hitSlop: control.buttonHitSlop.medium,
      paddingHorizontal: spacing.md,
      textVariant: "body",
    },
    large: {
      height: control.buttonHeight.large,
      hitSlop: control.buttonHitSlop.large,
      paddingHorizontal: spacing.lg,
      textVariant: "bodyLarge",
    },
  },
  opacity: {
    disabled: 0.5,
    pressed: 0.86,
  },
} as const satisfies {
  slots: readonly string[];
  defaults: { tone: ButtonTone; size: ButtonSize };
  tones: Record<
    ButtonTone,
    {
      background: keyof ThemeColors | null;
      content: keyof ThemeColors;
      border: keyof ThemeColors | null;
    }
  >;
  sizes: Record<
    ButtonSize,
    {
      height: number;
      hitSlop: number;
      paddingHorizontal: number;
      textVariant: TextVariant;
    }
  >;
  opacity: { disabled: number; pressed: number };
};

export const surfaceRecipe = {
  default: {
    background: "surface",
    border: "border",
    borderAlpha: 1,
    elevated: false,
  },
  raised: {
    background: "bg",
    border: "border",
    borderAlpha: 1,
    elevated: true,
  },
  accent: {
    background: "surfaceAccent",
    border: "primary",
    borderAlpha: 0.3,
    elevated: false,
  },
} as const satisfies Record<
  SurfaceTone,
  {
    background: keyof ThemeColors;
    border: keyof ThemeColors;
    borderAlpha: number;
    elevated: boolean;
  }
>;

export const fieldRecipe = {
  slots: [
    "root",
    "label",
    "control",
    "leading",
    "input",
    "trailing",
    "hint",
    "error",
  ] as const,
  defaults: { variant: "surface", shape: "medium" } as const,
  variants: {
    surface: { background: "surface" },
    inset: { background: "bg" },
  },
  shapes: {
    medium: "md",
    large: "lg",
    full: "full",
  },
  states: {
    idle: { border: "textMuted" },
    focused: { border: "contentBrand" },
    invalid: { border: "danger" },
  },
  minHeight: control.minTouchTarget,
  multilineMinHeight: 80,
  borderWidth: 1,
  focusRingWidth: 2,
  focusRingOffset: 2,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  textVariant: "body",
  label: {
    color: "textBody",
    textVariant: "body",
    fontWeight: "600",
    gap: spacing.xs,
  },
  support: {
    hintColor: "textMuted",
    errorColor: "danger",
    textVariant: "label",
    gap: 6,
  },
  placeholder: { color: "textMuted" },
  disabledOpacity: 0.6,
} as const satisfies {
  slots: readonly string[];
  defaults: { variant: FieldVariant; shape: FieldShape };
  variants: Record<FieldVariant, { background: keyof ThemeColors }>;
  shapes: Record<FieldShape, keyof typeof radius>;
  states: Record<
    "idle" | "focused" | "invalid",
    { border: keyof ThemeColors }
  >;
  minHeight: number;
  multilineMinHeight: number;
  borderWidth: number;
  focusRingWidth: number;
  focusRingOffset: number;
  paddingHorizontal: number;
  paddingVertical: number;
  textVariant: keyof typeof typography;
  label: {
    color: keyof ThemeColors;
    textVariant: keyof typeof typography;
    fontWeight: string;
    gap: number;
  };
  support: {
    hintColor: keyof ThemeColors;
    errorColor: keyof ThemeColors;
    textVariant: keyof typeof typography;
    gap: number;
  };
  placeholder: { color: keyof ThemeColors };
  disabledOpacity: number;
};

export {
  accordionRecipe,
  alertDialogRecipe,
  avatarRecipe,
  badgeRecipe,
  bottomNavigationRecipe,
  bottomCtaRecipe,
  chipRecipe,
  comboboxRecipe,
  counterBadgeRecipe,
  dialogRecipe,
  dividerRecipe,
  emptyStateRecipe,
  formatCounterBadgeCount,
  iconButtonRecipe,
  iconRecipe,
  linkRecipe,
  listRecipe,
  listRowRecipe,
  loadMoreRecipe,
  menuRecipe,
  noticeRecipe,
  progressRecipe,
  searchFieldRecipe,
  selectRecipe,
  selectionGroupRecipe,
  sectionRecipe,
  segmentedControlRecipe,
  selectionControlRecipe,
  sheetRecipe,
  skeletonRecipe,
  spinnerRecipe,
  stackRecipe,
  statisticRecipe,
  switchRecipe,
  tabsRecipe,
  textRecipe,
  toastRecipe,
  tooltipRecipe,
  topBarRecipe,
  type AccordionDensity,
  type AlertDialogTone,
  type AvatarShape,
  type AvatarSize,
  type BadgeSize,
  type BadgeTone,
  type BottomNavigationDensity,
  type BottomNavigationDistribution,
  type BottomNavigationPresentation,
  type ChipSize,
  type SelectDensity,
  type SelectSize,
  type CounterBadgeSize,
  type CounterBadgeTone,
  type CounterBadgeVariant,
  type DialogSize,
  type IconButtonShape,
  type IconButtonSize,
  type IconTone,
  type IconWeight,
  type LinkTone,
  type LinkVariant,
  type LoadMoreDensity,
  type ListRowDensity,
  type MenuDensity,
  type MenuItemTone,
  type NoticeTone,
  type ProgressSize,
  type ProgressTone,
  type SearchFieldSize,
  type SegmentedControlSize,
  type SelectionControlKind,
  type SelectionControlPresentation,
  type SelectionControlSize,
  type SelectionGroupOrientation,
  type SelectionGroupPresentation,
  type SpinnerSize,
  type SpinnerTone,
  type StackAxis,
  type StackGap,
  type StatisticDensity,
  type StatisticPresentation,
  type SwitchSize,
  type TabSize,
  type TabsLayout,
  type TabsOverflow,
  type TextTone,
  type ToastPlacement,
  type ToastTone,
  type ToastToneMark,
} from "./component-recipes.js";
