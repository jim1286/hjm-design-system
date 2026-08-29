import {
  formRecipe,
  type FormSubmitStatus,
} from "@hjmds/design-contracts/components/form";
import {
  comboboxBehaviorDefaults,
  resolveControlAccessibleName,
  type ComboboxCommitReason,
  type ComboboxFiltering,
  type AsyncCollectionState,
  type SelectItemDescriptor,
} from "@hjmds/design-contracts/behaviors";
import {
  flattenCollectionItems,
  isComboboxResultCurrent,
  reconcileSelectSelection,
  resolveComboboxSelectedItem,
  resolveSelectSelectedItem,
  validateCollection,
  type SelectCollectionSectionDescriptor,
  type SelectCollectionSource,
  type SelectOpenChangeReason,
} from "@hjmds/design-contracts/components/collection";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { glyph, radius, spacing } from "@hjmds/design-contracts/foundations";
import {
  comboboxRecipe,
  selectRecipe,
  type SelectDensity,
  type SelectSize,
} from "@hjmds/design-contracts/recipes";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
  findNodeHandle,
  type ModalProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Button } from "./actions.js";
import { useControllableState } from "./internal/state.js";
import {
  scheduleAfterNativeModalTeardown,
  shouldAwaitNativeModalDismiss,
  type NativeModalTeardownTask,
} from "./internal/modal-lifecycle.js";
import {
  logicalTextAlign,
  minimumTargetStyle,
  resolveNativeTextScaleProps,
} from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

type NativeCollectionLeadingRenderProps = Readonly<{
  placement: "trigger" | "option";
  selected: boolean;
  disabled: boolean;
  color: string;
  size: number;
}>;

type PendingDismissAction = null | (() => void | Promise<void>);

function useAfterModalDismiss(visible: boolean) {
  const shownRef = useRef(false);
  const previousVisibleRef = useRef(visible);
  const pendingRef = useRef<PendingDismissAction>(null);
  const teardownTaskRef = useRef<NativeModalTeardownTask | null>(null);
  const complete = useCallback(() => {
    teardownTaskRef.current?.cancel();
    teardownTaskRef.current = null;
    shownRef.current = false;
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) void pending();
  }, []);
  useLayoutEffect(() => {
    const wasVisible = previousVisibleRef.current;
    previousVisibleRef.current = visible;
    if (!wasVisible || visible || shouldAwaitNativeModalDismiss(shownRef.current)) return;
    teardownTaskRef.current?.cancel();
    teardownTaskRef.current = scheduleAfterNativeModalTeardown(complete);
  }, [complete, visible]);
  useEffect(() => () => teardownTaskRef.current?.cancel(), []);
  return {
    queue(action: PendingDismissAction) {
      pendingRef.current = action;
    },
    onDismiss: complete,
    onShow() {
      shownRef.current = true;
    },
  } as const;
}

export type FieldControlProps = Readonly<{
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState: Readonly<{ disabled: boolean }>;
}>;

export type FieldProps = Readonly<{
  label: string;
  children: ReactNode | ((props: FieldControlProps) => ReactNode);
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

/** A renderer-neutral field frame for custom Native controls. */
export function Field({
  label,
  children,
  description,
  error,
  required = false,
  disabled = false,
  style,
}: FieldProps) {
  const visibleLabel = `${label}${required ? " *" : ""}`;
  const hint = error ?? description;
  const controlProps: FieldControlProps = {
    accessibilityLabel: visibleLabel,
    ...(hint === undefined ? {} : { accessibilityHint: hint }),
    accessibilityState: { disabled },
  };
  return (
    <View style={[{ gap: spacing.xs }, style]}>
      <Text tone="primary" variant="label">{visibleLabel}</Text>
      {typeof children === "function" ? children(controlProps) : children}
      {error ? (
        <Text accessibilityLiveRegion="assertive" tone="danger" variant="caption">
          {error}
        </Text>
      ) : description ? (
        <Text tone="muted" variant="caption">{description}</Text>
      ) : null}
    </View>
  );
}

export type FormProps<Values> = Readonly<{
  label: string;
  values: Values;
  onSubmit: (values: Values) => void | Promise<void>;
  children: ReactNode;
  submitLabel: string;
  status?: FormSubmitStatus;
  defaultStatus?: FormSubmitStatus;
  onStatusChange?: (status: FormSubmitStatus) => void;
  error?: string;
  /** Localized fallback used when a rejected submission has no usable message. */
  fallbackErrorMessage: string;
  disabled?: boolean;
  density?: keyof typeof formRecipe.density;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * A Native submit boundary. Products retain ownership of values and validation;
 * this renderer only owns submit re-entrancy, feedback, and field rhythm.
 */
export function Form<Values>({
  label,
  values,
  onSubmit,
  children,
  submitLabel,
  status,
  defaultStatus = "idle",
  onStatusChange,
  error,
  fallbackErrorMessage,
  disabled = false,
  density = "comfortable",
  style,
}: FormProps<Values>) {
  const [submitStatus, setSubmitStatus] = useControllableState({
    ...(status === undefined ? {} : { value: status }),
    defaultValue: defaultStatus,
    ...(onStatusChange === undefined ? {} : { onChange: onStatusChange }),
  });
  const [internalError, setInternalError] = useState<string | undefined>();
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);
  const busy = submitStatus === "submitting";

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const submit = async () => {
    if (disabled || busy || submittingRef.current) return;
    submittingRef.current = true;
    setInternalError(undefined);
    setSubmitStatus("submitting");
    try {
      await onSubmit(values);
      if (mountedRef.current) setSubmitStatus("succeeded");
    } catch (caught) {
      if (mountedRef.current) {
        setInternalError(
          caught instanceof Error && caught.message.trim().length > 0
            ? caught.message
            : fallbackErrorMessage,
        );
        setSubmitStatus("failed");
      }
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <View
      accessibilityLabel={label}
      accessibilityState={{ busy, disabled }}
      style={[{ gap: formRecipe.density[density].fieldGap }, style]}
    >
      {children}
      {error ?? internalError ? (
        <View accessibilityLiveRegion="assertive" accessibilityRole="alert">
          <Text tone="danger">{error ?? internalError}</Text>
        </View>
      ) : null}
      <Button
        disabled={disabled}
        loading={busy}
        onPress={() => void submit()}
      >
        {submitLabel}
      </Button>
    </View>
  );
}

export type SelectOption<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  description?: string;
  disabled?: boolean;
  accessibilityHint?: string;
}>;

export type SelectSection<
  Value extends string = string,
  SectionKey extends string = string,
> = SelectCollectionSectionDescriptor<Value, SectionKey>;

export type SelectLeadingRenderProps = NativeCollectionLeadingRenderProps;

export type SelectProps<
  Value extends string = string,
  SectionKey extends string = string,
> = Omit<
  ModalProps,
  | "animationType"
  | "children"
  | "onDismiss"
  | "onRequestClose"
  | "onShow"
  | "transparent"
  | "visible"
> &
  Readonly<{
    label?: string;
    accessibilityLabel?: string;
    /** Legacy flat source. Prefer source/sections for shared collection identity. */
    options?: readonly SelectOption<Value>[];
    source?: SelectCollectionSource<Value, SectionKey>;
    items?: readonly SelectItemDescriptor<Value>[];
    sections?: readonly SelectSection<Value, SectionKey>[];
    value?: Value | null;
    defaultValue?: Value | null;
    onValueChange?: (value: Value) => void;
    selectedKey?: Value | null;
    defaultSelectedKey?: Value | null;
    onSelectionChange?: (value: Value | null) => void;
    selectedItem?: SelectItemDescriptor<Value>;
    disallowEmptySelection?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: SelectOpenChangeReason) => void;
    /** Localized text shown when no option is selected. */
    placeholder: string;
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    busy?: boolean;
    size?: SelectSize;
    density?: SelectDensity;
    asyncState?: AsyncCollectionState;
    onRetry?: () => void;
    retryLabel?: string;
    readOnlyLabel?: string;
    openHint?: string;
    renderLeading?: (
      item: SelectItemDescriptor<Value> | null,
      props: SelectLeadingRenderProps,
    ) => ReactNode;
    renderOptionLeading?: (
      item: SelectItemDescriptor<Value>,
      props: SelectLeadingRenderProps,
    ) => ReactNode;
    onSelectionAfterDismiss?: (value: Value) => void | Promise<void>;
    onDismiss?: (reason: SelectOpenChangeReason) => void;
    /** Localized accessible name and visible label for dismissing the option list. */
    dismissLabel: string;
    /** Optional localized name for the option-list region; defaults neutrally to label. */
    optionsAccessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
  }>;

/** Native adaptive Select with shared sections, async states, and teardown-safe commits. */
export function Select<
  Value extends string = string,
  SectionKey extends string = string,
>({
  label,
  accessibilityLabel,
  options,
  source: sourceProp,
  items,
  sections,
  value,
  defaultValue,
  onValueChange,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  selectedItem,
  disallowEmptySelection = false,
  open,
  defaultOpen = false,
  onOpenChange,
  placeholder,
  description,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  busy = false,
  size = selectRecipe.defaults.size,
  density = selectRecipe.defaults.density,
  asyncState = { status: "idle" },
  onRetry,
  retryLabel,
  readOnlyLabel,
  openHint,
  renderLeading,
  renderOptionLeading,
  onSelectionAfterDismiss,
  onDismiss,
  dismissLabel,
  optionsAccessibilityLabel,
  style,
  ...modalProps
}: SelectProps<Value, SectionKey>) {
  const providedSources = [sourceProp, options, items, sections].filter(
    (candidate) => candidate !== undefined,
  ).length;
  if (providedSources !== 1) {
    throw new TypeError("Select requires exactly one of source, options, items, or sections");
  }
  if (value !== undefined && selectedKey !== undefined) {
    throw new TypeError("Select cannot combine value and selectedKey");
  }
  if (defaultValue !== undefined && defaultSelectedKey !== undefined) {
    throw new TypeError("Select cannot combine defaultValue and defaultSelectedKey");
  }
  const source = useMemo<SelectCollectionSource<Value, SectionKey>>(() => {
    if (sourceProp) return sourceProp;
    if (sections) return { sections };
    if (items) return { items };
    return {
      items: (options ?? []).map((option) => ({
        id: option.value,
        label: option.label,
        textValue: option.label,
        ...(option.description === undefined ? {} : { description: option.description }),
        ...(option.disabled === undefined ? {} : { disabled: option.disabled }),
      })),
    };
  }, [items, options, sections, sourceProp]);
  validateCollection(source);
  const collectionItems = flattenCollectionItems(source) as readonly SelectItemDescriptor<Value>[];
  if (collectionItems.length === 0 && asyncState.status === "idle") {
    throw new Error("Select requires an option or a non-idle asyncState");
  }
  const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Select");
  const theme = useHjmNativeTheme();
  const { colors, environment } = theme;
  const requestedControlled = selectedKey !== undefined ? selectedKey : value;
  const requestedDefault = defaultSelectedKey ?? defaultValue ?? null;
  const requestedValue = requestedControlled ?? requestedDefault;
  if (
    requestedValue !== null &&
    requestedValue !== undefined &&
    !collectionItems.some((option) => option.id === requestedValue) &&
    selectedItem?.id !== requestedValue &&
    asyncState.status === "idle"
  ) {
    throw new RangeError("Select selection must match an option");
  }
  const [selected, setSelected] = useControllableState<Value | null>({
    ...(requestedControlled === undefined ? {} : { value: requestedControlled }),
    defaultValue: requestedDefault,
    onChange: (next) => {
      if (next !== null) onValueChange?.(next);
      onSelectionChange?.(next);
    },
  });
  const reconciledSelected = reconcileSelectSelection(source, selected, {
    disallowEmptySelection,
    asyncState,
    ...(selectedItem === undefined ? {} : { selectedItem }),
  });
  useEffect(() => {
    if (requestedControlled === undefined && reconciledSelected !== selected) {
      setSelected(reconciledSelected);
    }
  }, [reconciledSelected, requestedControlled, selected, setSelected]);
  const resolvedSelectedItem = resolveSelectSelectedItem(
    source,
    reconciledSelected,
    selectedItem,
  );
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const visible = open ?? uncontrolledOpen;
  const requestOpen = useCallback((next: boolean, reason: SelectOpenChangeReason) => {
    if (next === visible) return;
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next, reason);
  }, [onOpenChange, open, visible]);
  const triggerRef = useRef<View>(null);
  const optionRefs = useRef(new Map<Value, View>());
  const modalDismiss = useAfterModalDismiss(visible);
  const sizeContract = selectRecipe.sizes[size];
  const densityContract = selectRecipe.density[density];
  const close = useCallback((reason: SelectOpenChangeReason, after?: PendingDismissAction) => {
    modalDismiss.queue(async () => {
      const handle = findNodeHandle(triggerRef.current);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
      onDismiss?.(reason);
      await after?.();
    });
    requestOpen(false, reason);
  }, [modalDismiss, onDismiss, requestOpen]);
  useEffect(() => {
    if (visible && (disabled || readOnly)) close("programmatic");
  }, [close, disabled, readOnly, visible]);

  const focusInitialOption = () => {
    const initialValue =
      reconciledSelected ?? collectionItems.find((option) => !option.disabled)?.id;
    if (initialValue === undefined) return;
    const target = optionRefs.current.get(initialValue);
    if (target) {
      const handle = findNodeHandle(target);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    }
  };
  const leadingColor = resolveColorReference(selectRecipe.leading.color, theme.palette);
  const triggerLeading = renderLeading?.(resolvedSelectedItem, {
    placement: "trigger",
    selected: resolvedSelectedItem !== null,
    disabled: disabled || busy,
    color: leadingColor,
    size: glyph[sizeContract.glyph],
  });
  const renderOption = (option: SelectItemDescriptor<Value>) => {
    const checked = option.id === reconciledSelected;
    const optionDisabled = option.disabled === true || disabled || readOnly || busy;
    const optionLeading = renderOptionLeading?.(option, {
      placement: "option",
      selected: checked,
      disabled: optionDisabled,
      color: resolveColorReference(selectRecipe.optionLeading.color, theme.palette),
      size: glyph[selectRecipe.optionLeading.glyph],
    });
    return (
      <Pressable
        key={option.id}
        ref={(node) => {
          if (node) optionRefs.current.set(option.id, node);
          else optionRefs.current.delete(option.id);
        }}
        accessibilityHint={option.description}
        accessibilityLabel={option.label}
        accessibilityRole="radio"
        accessibilityState={{ checked, disabled: optionDisabled }}
        disabled={optionDisabled}
        onPress={() => {
          setSelected(option.id);
          close("selection", onSelectionAfterDismiss
            ? () => onSelectionAfterDismiss(option.id)
            : null);
        }}
        style={({ pressed }) => [
          minimumTargetStyle,
          {
            alignItems: "center",
            backgroundColor: checked
              ? resolveColorReference(densityContract.selectedBackground, theme.palette)
              : pressed
                ? resolveColorReference(densityContract.highlightedBackground, theme.palette)
                : "transparent",
            borderRadius: radius[densityContract.radius],
            direction: environment.direction,
            flexDirection: "row",
            gap: densityContract.gap,
            minHeight: densityContract.minHeight,
            opacity: optionDisabled ? selectRecipe.states.disabledOpacity : 1,
            paddingHorizontal: densityContract.paddingHorizontal,
          },
        ]}
      >
        {optionLeading ? (
          <View accessibilityElementsHidden accessible={false} importantForAccessibility="no-hide-descendants">
            {optionLeading}
          </View>
        ) : null}
        <View style={{ flex: 1, gap: spacing.xxs, minWidth: 0 }}>
          <Text
            style={{
              color: resolveColorReference(densityContract.label.color, theme.palette),
              fontWeight: checked
                ? selectRecipe.optionLabel.selectedFontWeight
                : selectRecipe.optionLabel.fontWeight,
            }}
            variant={densityContract.label.textVariant}
          >
            {option.label}
          </Text>
          {option.description ? (
            <Text
              style={{ color: resolveColorReference(densityContract.description.color, theme.palette) }}
              variant={densityContract.description.textVariant}
            >
              {option.description}
            </Text>
          ) : null}
        </View>
        {checked ? <Text accessible={false} tone="brand">✓</Text> : null}
      </Pressable>
    );
  };
  const collection = source.sections ? source.sections.map((section) => (
    <View key={section.id} accessibilityLabel={section.accessibilityLabel ?? section.label}>
      {section.label ? (
        <Text
          style={{
            color: resolveColorReference(selectRecipe.sectionLabel.color, theme.palette),
            paddingHorizontal: selectRecipe.sectionLabel.paddingHorizontal,
            paddingVertical: selectRecipe.sectionLabel.paddingVertical,
          }}
          variant={selectRecipe.sectionLabel.textVariant}
        >
          {section.label}
        </Text>
      ) : null}
      {section.items.map(renderOption)}
    </View>
  )) : collectionItems.map(renderOption);
  const blockingState = asyncState.status === "loading" || asyncState.status === "error" || asyncState.status === "empty";

  return (
    <View style={[{ gap: spacing.xs }, style]}>
      {label ? <Text tone="primary" variant="label">{label}{required ? " *" : ""}</Text> : null}
      <Pressable
        ref={triggerRef}
        accessibilityLabel={accessibleName}
        accessibilityHint={readOnly ? readOnlyLabel : error ?? description ?? openHint}
        accessibilityRole="combobox"
        accessibilityState={{
          busy: busy || asyncState.status === "loading",
          disabled: disabled || readOnly || busy,
          expanded: visible,
        }}
        accessibilityValue={{ text: resolvedSelectedItem?.label ?? placeholder }}
        disabled={disabled || readOnly || busy}
        onPress={() => {
          if (!readOnly) requestOpen(!visible, "trigger");
        }}
        style={({ pressed }) => [
          minimumTargetStyle,
          {
            alignItems: "center",
            backgroundColor: colors.bg,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            borderWidth: error ? 2 : 1,
            direction: environment.direction,
            flexDirection: "row",
            gap: selectRecipe.value.gap,
            minHeight: sizeContract.minHeight,
            opacity: disabled || busy ? selectRecipe.states.disabledOpacity : pressed ? 0.86 : 1,
            paddingHorizontal: sizeContract.paddingHorizontal,
          },
        ]}
      >
        {triggerLeading ? (
          <View accessibilityElementsHidden accessible={false} importantForAccessibility="no-hide-descendants">
            {triggerLeading}
          </View>
        ) : null}
        <Text style={{ flex: 1 }} tone={resolvedSelectedItem ? "body" : "muted"} variant={sizeContract.textVariant}>
          {resolvedSelectedItem?.label ?? placeholder}
        </Text>
        {busy ? <ActivityIndicator size={glyph[selectRecipe.busyIndicator.glyph]} /> : <Text accessible={false} tone="muted">⌄</Text>}
      </Pressable>
      {error ? (
        <Text accessibilityLiveRegion="assertive" tone="danger" variant="caption">{error}</Text>
      ) : description ? (
        <Text tone="muted" variant="caption">{description}</Text>
      ) : null}

      <Modal
        {...modalProps}
        animationType="none"
        onDismiss={modalDismiss.onDismiss}
        onRequestClose={() => close("escape")}
        onShow={() => {
          modalDismiss.onShow();
          focusInitialOption();
        }}
        transparent
        visible={visible}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            accessibilityLabel={dismissLabel}
            accessibilityRole="button"
            onPress={() => close("outside")}
            style={{
              backgroundColor: "#00000088",
              bottom: 0,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
            }}
          />
          <View
            accessibilityLabel={optionsAccessibilityLabel ?? accessibleName}
            accessibilityRole="radiogroup"
            accessibilityViewIsModal
            style={{
              backgroundColor: colors.bg,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              gap: spacing.sm,
              maxHeight: "75%",
              padding: spacing.md,
            }}
          >
            <Text tone="primary" variant="title">{label ?? accessibleName}</Text>
            <ScrollView>
              {blockingState ? (
                <View style={{ gap: spacing.sm, minHeight: selectRecipe.stateMessage.minHeight }}>
                  {asyncState.status === "loading" ? <ActivityIndicator /> : null}
                  <Text
                    accessibilityLiveRegion="polite"
                    accessibilityRole={asyncState.status === "error" ? "alert" : undefined}
                    tone={asyncState.status === "error" ? "danger" : "muted"}
                  >
                    {asyncState.message}
                  </Text>
                  {asyncState.status === "error" && onRetry ? (
                    <Button onPress={onRetry} tone="secondary">{retryLabel ?? dismissLabel}</Button>
                  ) : null}
                </View>
              ) : collection}
              {asyncState.status === "loadingMore" ? (
                <View accessibilityLiveRegion="polite" accessibilityState={{ busy: true }} style={{ alignItems: "center", flexDirection: "row", gap: spacing.xs }}>
                  <ActivityIndicator />
                  <Text tone="muted">{asyncState.message}</Text>
                </View>
              ) : null}
            </ScrollView>
            <Button onPress={() => close("programmatic")} tone="secondary">{dismissLabel}</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export type ComboboxLeadingRenderProps = NativeCollectionLeadingRenderProps;

export type ComboboxProps<
  Key extends string = string,
  SectionKey extends string = string,
> = Omit<
  ModalProps,
  | "animationType"
  | "children"
  | "onDismiss"
  | "onRequestClose"
  | "onShow"
  | "transparent"
  | "visible"
> &
  Readonly<{
    label?: string;
    accessibilityLabel?: string;
    items?: readonly SelectItemDescriptor<Key>[];
    sections?: readonly SelectSection<Key, SectionKey>[];
    source?: SelectCollectionSource<Key, SectionKey>;
    selectedKey?: Key | null;
    defaultSelectedKey?: Key | null;
    selectedItem?: SelectItemDescriptor<Key>;
    onSelectionChange?: (key: Key | null) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (value: string) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, reason: SelectOpenChangeReason) => void;
    onCommit?: (key: Key | null, reason: ComboboxCommitReason) => void;
    onCommitAfterDismiss?: (key: Key, reason: "selection") => void | Promise<void>;
    onDismiss?: (reason: SelectOpenChangeReason) => void;
    filtering?: ComboboxFiltering;
    queryValue?: string;
    resultQuery?: string;
    asyncState?: AsyncCollectionState;
    loading?: boolean;
    /** Localized text rendered when filtering returns no items. */
    emptyMessage: string;
    /** Localized text announced while results are loading. */
    loadingMessage: string;
    loadingMoreMessage?: string;
    errorMessage?: string;
    promptMessage?: string;
    minimumQueryLength?: number;
    onRetry?: () => void;
    retryLabel?: string;
    description?: string;
    error?: string;
    placeholder?: string;
    /** Optional localized hint explaining how the editable trigger opens results. */
    openHint?: string;
    /** Optional visible modal heading when it should differ from the field label. */
    sheetTitle?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    busy?: boolean;
    openOnFocus?: boolean;
    size?: SelectSize;
    density?: SelectDensity;
    readOnlyLabel?: string;
    renderLeading?: (
      item: SelectItemDescriptor<Key>,
      props: ComboboxLeadingRenderProps,
    ) => ReactNode;
    /** Localized accessible name for clearing the committed selection/query. */
    clearLabel: string;
    /** Localized accessible name for dismissing the result list. */
    dismissLabel: string;
    /** Optional localized name for the result region; defaults neutrally to label. */
    resultsAccessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
  }>;

/** Editable Native combobox with sectioned async results and teardown-safe commits. */
export function Combobox<
  Key extends string = string,
  SectionKey extends string = string,
>({
  label,
  accessibilityLabel,
  items,
  sections,
  source: sourceProp,
  selectedKey,
  defaultSelectedKey = null,
  selectedItem,
  onSelectionChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  onCommit,
  onCommitAfterDismiss,
  onDismiss,
  filtering = comboboxBehaviorDefaults.filtering,
  queryValue,
  resultQuery,
  asyncState,
  loading = false,
  emptyMessage,
  loadingMessage,
  loadingMoreMessage,
  errorMessage,
  promptMessage,
  minimumQueryLength = 0,
  onRetry,
  retryLabel,
  description,
  error,
  placeholder,
  openHint,
  sheetTitle,
  required = false,
  disabled = false,
  readOnly = false,
  busy = false,
  openOnFocus = true,
  size = comboboxRecipe.defaults.size,
  density = comboboxRecipe.defaults.density,
  readOnlyLabel,
  renderLeading,
  clearLabel,
  dismissLabel,
  resultsAccessibilityLabel,
  style,
  ...modalProps
}: ComboboxProps<Key, SectionKey>) {
  const providedSources = [sourceProp, items, sections].filter(
    (candidate) => candidate !== undefined,
  ).length;
  if (providedSources !== 1) {
    throw new TypeError("Combobox requires exactly one of source, items, or sections");
  }
  const source = useMemo<SelectCollectionSource<Key, SectionKey>>(() => {
    if (sourceProp) return sourceProp;
    if (sections) return { sections };
    return { items: items ?? [] };
  }, [items, sections, sourceProp]);
  validateCollection(source);
  const collectionItems = flattenCollectionItems(source) as readonly SelectItemDescriptor<Key>[];
  const requestedSelection = selectedKey === undefined ? defaultSelectedKey : selectedKey;
  if (requestedSelection !== null && selectedItem?.id !== requestedSelection &&
      !collectionItems.some((item) => item.id === requestedSelection)) {
    throw new RangeError(`Combobox selectedKey needs a matching item snapshot: ${requestedSelection}`);
  }
  if (!emptyMessage.trim() || !loadingMessage.trim()) {
    throw new TypeError("Combobox state messages must not be empty");
  }
  if (openHint !== undefined && !openHint.trim()) {
    throw new TypeError("Combobox openHint must not be empty");
  }
  if (sheetTitle !== undefined && !sheetTitle.trim()) {
    throw new TypeError("Combobox sheetTitle must not be empty");
  }
  if (!Number.isInteger(minimumQueryLength) || minimumQueryLength < 0) {
    throw new RangeError("Combobox minimumQueryLength must be a non-negative integer");
  }

  const accessibleName = resolveControlAccessibleName(label, accessibilityLabel, "Combobox");
  const theme = useHjmNativeTheme();
  const { colors, environment } = theme;
  const [committedKey, setCommittedKey] = useControllableState<Key | null>({
    ...(selectedKey === undefined ? {} : { value: selectedKey }),
    defaultValue: defaultSelectedKey,
    ...(onSelectionChange === undefined ? {} : { onChange: onSelectionChange }),
  });
  const committedItem = resolveComboboxSelectedItem(source, committedKey, selectedItem);
  const [query, setQuery] = useControllableState({
    ...(inputValue === undefined ? {} : { value: inputValue }),
    defaultValue: defaultInputValue ?? committedItem?.label ?? "",
    ...(onInputValueChange === undefined ? {} : { onChange: onInputValueChange }),
  });
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const visible = open ?? uncontrolledOpen;
  const requestOpen = useCallback((next: boolean, reason: SelectOpenChangeReason) => {
    if (next === visible) return;
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next, reason);
  }, [onOpenChange, open, visible]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<TextInput>(null);
  const optionRefs = useRef(new Map<Key, View>());
  const modalDismiss = useAfterModalDismiss(visible);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const resultsAreCurrent = filtering !== "external" ||
    isComboboxResultCurrent(queryValue ?? query, resultQuery ?? query);
  const filteredItems = useMemo(
    () =>
      filtering === "external"
        ? collectionItems
        : collectionItems.filter((item) =>
            `${item.label} ${item.textValue}`.toLocaleLowerCase().includes(normalizedQuery),
          ),
    [collectionItems, filtering, normalizedQuery],
  );
  const resolvedAsyncState: AsyncCollectionState = asyncState ??
    (loading ? { status: "loading", message: loadingMessage } : { status: "idle" });
  const sizeContract = comboboxRecipe.sizes[size];
  const densityContract = comboboxRecipe.density[density];
  const inputTypography = theme.tokens.typography[sizeContract.textVariant];
  const inputTextScaleProps = resolveNativeTextScaleProps(theme.textScaling, {
    color: colors.text,
    flex: 1,
    fontSize: inputTypography.fontSize,
    fontWeight: inputTypography.fontWeight,
    lineHeight: inputTypography.lineHeight,
    minHeight: sizeContract.minHeight,
    textAlign: logicalTextAlign(environment.direction),
  });
  const close = useCallback((reason: SelectOpenChangeReason, after?: PendingDismissAction) => {
    modalDismiss.queue(async () => {
      const handle = findNodeHandle(inputRef.current);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
      onDismiss?.(reason);
      await after?.();
    });
    requestOpen(false, reason);
    setActiveIndex(-1);
  }, [modalDismiss, onDismiss, requestOpen]);
  useEffect(() => {
    if (visible && (disabled || readOnly)) close("programmatic");
  }, [close, disabled, readOnly, visible]);

  const firstEnabledIndex = () => filteredItems.findIndex((item) => !item.disabled);
  const lastEnabledIndex = () => {
    for (let index = filteredItems.length - 1; index >= 0; index -= 1) {
      if (!filteredItems[index]?.disabled) return index;
    }
    return -1;
  };
  const moveActive = (delta: 1 | -1) => {
    if (filteredItems.length === 0) return;
    let next = activeIndex;
    for (let offset = 0; offset < filteredItems.length; offset += 1) {
      next = (next + delta + filteredItems.length) % filteredItems.length;
      if (!filteredItems[next]?.disabled) {
        setActiveIndex(next);
        return;
      }
    }
  };
  const restoreCommittedQuery = () => setQuery(committedItem?.label ?? "");
  const dismiss = (reason: SelectOpenChangeReason) => {
    restoreCommittedQuery();
    close(reason);
  };
  const commit = (item: SelectItemDescriptor<Key>) => {
    if (item.disabled || disabled || readOnly || busy || !resultsAreCurrent) return;
    setCommittedKey(item.id);
    setQuery(item.label);
    onCommit?.(item.id, "selection");
    close("selection", onCommitAfterDismiss
      ? () => onCommitAfterDismiss(item.id, "selection")
      : null);
  };
  const clear = () => {
    setCommittedKey(null);
    setQuery("");
    onCommit?.(null, "clear");
  };
  const focusInitialOption = () => {
    const initial =
      (committedKey === null ? undefined : optionRefs.current.get(committedKey)) ??
      optionRefs.current.get(filteredItems.find((item) => !item.disabled)?.id as Key);
    if (initial) {
      const handle = findNodeHandle(initial);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    }
  };
  const leading = committedItem && renderLeading ? renderLeading(committedItem, {
    placement: "trigger",
    selected: true,
    disabled: disabled || busy,
    color: resolveColorReference(comboboxRecipe.leading.color, theme.palette),
    size: glyph[sizeContract.glyph],
  }) : null;
  const queryTooShort = query.trim().length < minimumQueryLength;
  const viewStatus = queryTooShort
    ? "prompt"
    : !resultsAreCurrent || resolvedAsyncState.status === "loading"
      ? "loading"
      : resolvedAsyncState.status === "error"
        ? "error"
        : resolvedAsyncState.status === "empty" || filteredItems.length === 0
          ? "empty"
          : resolvedAsyncState.status === "loadingMore"
            ? "loadingMore"
            : "ready";
  const stateMessage = viewStatus === "prompt"
    ? promptMessage ?? emptyMessage
    : viewStatus === "loading"
      ? resolvedAsyncState.status === "loading" ? resolvedAsyncState.message : loadingMessage
      : viewStatus === "error"
        ? resolvedAsyncState.status === "error" ? resolvedAsyncState.message : errorMessage ?? emptyMessage
        : viewStatus === "empty"
          ? resolvedAsyncState.status === "empty" ? resolvedAsyncState.message : emptyMessage
          : viewStatus === "loadingMore"
            ? resolvedAsyncState.status === "loadingMore" ? resolvedAsyncState.message : loadingMoreMessage ?? loadingMessage
            : "";
  const filteredIds = new Set(filteredItems.map((item) => item.id));
  const renderOption = (item: SelectItemDescriptor<Key>, index: number) => {
    const checked = item.id === committedKey;
    const active = index === activeIndex;
    const itemDisabled = item.disabled === true || disabled || readOnly || busy || !resultsAreCurrent;
    const optionLeading = renderLeading?.(item, {
      placement: "option",
      selected: checked,
      disabled: itemDisabled,
      color: resolveColorReference(comboboxRecipe.optionLeading.color, theme.palette),
      size: glyph[comboboxRecipe.optionLeading.glyph],
    });
    return (
      <Pressable
        key={item.id}
        ref={(node) => {
          if (node) optionRefs.current.set(item.id, node);
          else optionRefs.current.delete(item.id);
        }}
        accessibilityHint={item.description}
        accessibilityLabel={item.label}
        accessibilityRole="radio"
        accessibilityState={{ checked, disabled: itemDisabled }}
        disabled={itemDisabled}
        onPress={() => commit(item)}
        style={({ pressed }) => [
          minimumTargetStyle,
          {
            alignItems: "center",
            backgroundColor: checked || active
              ? resolveColorReference(densityContract.selectedBackground, theme.palette)
              : pressed
                ? resolveColorReference(comboboxRecipe.states.pressedBackground, theme.palette)
                : "transparent",
            borderRadius: radius[densityContract.radius],
            direction: environment.direction,
            flexDirection: "row",
            gap: densityContract.gap,
            minHeight: densityContract.minHeight,
            opacity: itemDisabled ? comboboxRecipe.states.disabledOpacity : 1,
            paddingHorizontal: densityContract.paddingHorizontal,
          },
        ]}
      >
        {optionLeading ? (
          <View accessibilityElementsHidden accessible={false} importantForAccessibility="no-hide-descendants">
            {optionLeading}
          </View>
        ) : null}
        <View style={{ flex: 1, gap: spacing.xxs, minWidth: 0 }}>
          <Text tone={checked ? "brand" : "body"} variant={densityContract.label.textVariant}>{item.label}</Text>
          {item.description ? <Text tone="muted" variant={densityContract.description.textVariant}>{item.description}</Text> : null}
        </View>
        {checked ? <Text accessible={false} tone="brand">✓</Text> : null}
      </Pressable>
    );
  };
  let optionIndex = -1;
  const collection = source.sections ? source.sections.map((section) => {
    const visibleItems = section.items.filter((item) => filteredIds.has(item.id));
    if (visibleItems.length === 0) return null;
    return (
      <View key={section.id} accessibilityLabel={section.accessibilityLabel ?? section.label}>
        {section.label ? (
          <Text
            style={{
              color: resolveColorReference(comboboxRecipe.sectionLabel.color, theme.palette),
              paddingHorizontal: comboboxRecipe.sectionLabel.paddingHorizontal,
              paddingVertical: comboboxRecipe.sectionLabel.paddingVertical,
            }}
            variant={comboboxRecipe.sectionLabel.textVariant}
          >
            {section.label}
          </Text>
        ) : null}
        {visibleItems.map((item) => {
          optionIndex += 1;
          return renderOption(item, optionIndex);
        })}
      </View>
    );
  }) : filteredItems.map(renderOption);

  return (
    <View style={[{ gap: spacing.xs }, style]}>
      {label ? <Text tone="primary" variant="label">{label}{required ? " *" : ""}</Text> : null}
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.bg,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: radius.md,
          borderWidth: error ? 2 : 1,
          direction: environment.direction,
          flexDirection: "row",
          minHeight: sizeContract.minHeight,
          paddingStart: spacing.sm,
        }}
      >
        {leading ? (
          <View accessibilityElementsHidden accessible={false} importantForAccessibility="no-hide-descendants">
            {leading}
          </View>
        ) : null}
        <TextInput
          {...inputTextScaleProps}
          ref={inputRef}
          accessibilityHint={readOnly
            ? readOnlyLabel
            : [error ?? description, openHint].filter(Boolean).join(". ") || undefined}
          accessibilityLabel={accessibleName}
          accessibilityRole="combobox"
          accessibilityState={{
            busy: busy || viewStatus === "loading" || viewStatus === "loadingMore",
            disabled: disabled || readOnly || busy,
            expanded: visible,
          }}
          editable={!disabled && !readOnly && !busy}
          onChangeText={(next) => {
            setQuery(next);
            setActiveIndex(-1);
            if (!visible && !readOnly) requestOpen(true, "keyboard");
          }}
          onFocus={() => {
            if (openOnFocus && !disabled && !readOnly && !busy) requestOpen(true, "trigger");
          }}
          onKeyPress={(event) => {
            const key = event.nativeEvent.key;
            if (key === "Escape") {
              dismiss("escape");
            } else if (key === "ArrowDown") {
              if (!visible) requestOpen(true, "keyboard");
              moveActive(1);
            } else if (key === "ArrowUp") {
              if (!visible) requestOpen(true, "keyboard");
              moveActive(-1);
            } else if (key === "Home") {
              setActiveIndex(firstEnabledIndex());
            } else if (key === "End") {
              setActiveIndex(lastEnabledIndex());
            } else if (key === "Enter" && activeIndex >= 0) {
              const active = filteredItems[activeIndex];
              if (active) commit(active);
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textWeak}
          value={query}
        />
        {query.length > 0 && !readOnly ? (
          <Pressable
            accessibilityLabel={clearLabel}
            accessibilityRole="button"
            disabled={disabled || busy || viewStatus === "loading"}
            onPress={clear}
            style={minimumTargetStyle}
          >
            <Text align="center" tone="muted" variant="title">×</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="assertive" tone="danger" variant="caption">{error}</Text>
      ) : description ? (
        <Text tone="muted" variant="caption">{description}</Text>
      ) : null}

      <Modal
        {...modalProps}
        animationType="none"
        onDismiss={modalDismiss.onDismiss}
        onRequestClose={() => dismiss("escape")}
        onShow={() => {
          modalDismiss.onShow();
          focusInitialOption();
        }}
        transparent
        visible={visible}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            accessibilityLabel={dismissLabel}
            accessibilityRole="button"
            onPress={() => dismiss("outside")}
            style={{ backgroundColor: "#00000088", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
          />
          <View
            accessibilityLabel={resultsAccessibilityLabel ?? accessibleName}
            accessibilityRole="radiogroup"
            accessibilityViewIsModal
            style={{
              backgroundColor: colors.bg,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              gap: spacing.sm,
              maxHeight: "75%",
              padding: spacing.md,
            }}
          >
            <Text tone="primary" variant="title">{sheetTitle ?? label ?? accessibleName}</Text>
            {viewStatus === "loading" || viewStatus === "prompt" || viewStatus === "error" || viewStatus === "empty" ? (
              <View style={{ gap: spacing.sm, minHeight: comboboxRecipe.stateMessage.minHeight }}>
                {viewStatus === "loading" ? <ActivityIndicator /> : null}
                <Text
                  accessibilityLiveRegion={viewStatus === "error" ? "assertive" : "polite"}
                  accessibilityRole={viewStatus === "error" ? "alert" : undefined}
                  tone={viewStatus === "error" ? "danger" : "muted"}
                >
                  {stateMessage}
                </Text>
                {viewStatus === "error" && onRetry ? (
                  <Button onPress={onRetry} tone="secondary">{retryLabel ?? dismissLabel}</Button>
                ) : null}
              </View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">
                {collection}
                {viewStatus === "loadingMore" ? (
                  <View accessibilityLiveRegion="polite" accessibilityState={{ busy: true }} style={{ alignItems: "center", flexDirection: "row", gap: spacing.xs }}>
                    <ActivityIndicator />
                    <Text tone="muted">{stateMessage || loadingMoreMessage || loadingMessage}</Text>
                  </View>
                ) : null}
              </ScrollView>
            )}
            <Button onPress={() => dismiss("programmatic")} tone="secondary">{dismissLabel}</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
