export {
  buttonRecipe,
  fieldRecipe,
  surfaceDefaults,
  surfaceGeometry,
  surfaceRecipe,
  type ButtonSize,
  type ButtonTone,
  type FieldShape,
  type FieldVariant,
  type SurfacePadding,
  type SurfaceRadius,
  type SurfaceTone,
} from "./base-recipes.js";

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
  type StackAlign,
  type StackAxis,
  type StackGap,
  type StackJustify,
  type StatisticDensity,
  type StatisticPresentation,
  type SwitchSize,
  type TabSize,
  type TabsLayout,
  type TabsOverflow,
  type TextEmphasis,
  type TextTone,
  type ToastPlacement,
  type ToastTone,
  type ToastToneMark,
} from "./component-recipes.js";

/*
  Batch 2 저작 모듈의 시각 recipe.

  각 컴포넌트의 계약·recipe·행동을 한 모듈에 자급자족으로 담고, 여기서는 **경로만**
  모은다(`docs/authoring-brief.md`). 여러 저작자가 병렬로 작업할 때 공유 레지스트리를
  각자 고치면 서로의 변경을 덮어쓰므로, 배선은 리드가 한 번에 한다.

  recipe 본문을 `component-recipes.ts`로 옮기지 않는 이유: 그 파일은 이미 1,500줄이 넘고,
  계약(타입·validator·resolver)과 recipe가 **같은 컴포넌트를 두 파일로 갈라** 놓으면
  둘이 어긋날 자리가 생긴다. 한 컴포넌트는 한 모듈에 둔다.
*/
export { breadcrumbRecipe } from "./breadcrumb.js";
export { cardRecipe, type CardHeadingLevel } from "./card.js";
export { calendarRecipe } from "./calendar.js";
export { carouselRecipe } from "./carousel.js";
export { commandPaletteRecipe } from "./command-palette.js";
export { dataTableRecipe } from "./data-table.js";
export { transferListRecipe } from "./transfer-list.js";
// floatingActionButtonRecipe는 여기서 재수출하지 않는다. 이 모듈이 buttonRecipe를
// 정의하는데 floating-action-button.ts가 그것을 import하므로, 여기에 `export ... from`을
// 두면 순환이 된다 — ESM은 재수출을 본문보다 먼저 평가해서 buttonRecipe가 아직
// undefined인 채로 그 모듈이 실행된다. catalog.ts가 해당 모듈에서 직접 가져간다.
export { tourRecipe } from "./tour.js";
export { layoutRecipe } from "./layout.js";
export { otpFieldRecipe } from "./otp-field.js";
export { passwordFieldRecipe } from "./password-field.js";
export { splitterRecipe } from "./splitter.js";
export { datePickerRecipe } from "./date-picker.js";
export { descriptionListRecipe } from "./description-list.js";
export { filePickerRecipe } from "./file-picker.js";
export { formRecipe } from "./form.js";
export { imageRecipe } from "./image.js";
export { numberFieldRecipe } from "./number-field.js";
export { paginationRecipe } from "./pagination.js";
export { popoverRecipe } from "./popover.js";
export { resultRecipe } from "./result.js";
export { sliderRecipe } from "./slider.js";
export { stepsRecipe } from "./steps.js";
export { tagRecipe } from "./tag.js";
export { sidePanelRecipe } from "./side-panel.js";
export { timelineRecipe } from "./timeline.js";
export { treeRecipe } from "./tree.js";
export { uploadItemRecipe } from "./upload-item.js";
