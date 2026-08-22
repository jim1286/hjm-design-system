import {
  formRecipe,
  type FormSubmitStatus,
} from "@hjm/design-contracts/components/form";
import {
  comboboxBehaviorDefaults,
  type ComboboxCommitReason,
  type ComboboxFiltering,
  type SelectItemDescriptor,
} from "@hjm/design-contracts/behaviors";
import { radius, spacing } from "@hjm/design-contracts/foundations";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AccessibilityInfo,
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
import { minimumTargetStyle } from "./internal/styles.js";
import { logicalTextAlign, scalableTextDefaults } from "./internal/styles.js";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

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

export type SelectProps<Value extends string = string> = Omit<
  ModalProps,
  "animationType" | "children" | "onRequestClose" | "onShow" | "transparent" | "visible"
> &
  Readonly<{
    label: string;
    options: readonly SelectOption<Value>[];
    value?: Value | null;
    defaultValue?: Value | null;
    onValueChange?: (value: Value) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Localized text shown when no option is selected. */
    placeholder: string;
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    /** Localized accessible name and visible label for dismissing the option list. */
    dismissLabel: string;
    /** Optional localized name for the option-list region; defaults neutrally to label. */
    optionsAccessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
  }>;

/** An accessible, router-free Native option picker backed by React Native Modal. */
export function Select<Value extends string = string>({
  label,
  options,
  value,
  defaultValue = null,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  placeholder,
  description,
  error,
  required = false,
  disabled = false,
  dismissLabel,
  optionsAccessibilityLabel,
  style,
  ...modalProps
}: SelectProps<Value>) {
  if (options.length === 0) throw new Error("Select requires at least one option");
  const values = new Set(options.map((option) => option.value));
  if (defaultValue !== null && !values.has(defaultValue)) {
    throw new RangeError("Select defaultValue must match an option");
  }
  if (value !== undefined && value !== null && !values.has(value)) {
    throw new RangeError("Select value must match an option");
  }

  const { colors, environment } = useHjmNativeTheme();
  const [selected, setSelected] = useControllableState<Value | null>({
    ...(value === undefined ? {} : { value }),
    defaultValue,
    ...(onValueChange === undefined
      ? {}
      : { onChange: (next: Value | null) => {
          if (next !== null) onValueChange(next);
        } }),
  });
  const [visible, setVisible] = useControllableState({
    ...(open === undefined ? {} : { value: open }),
    defaultValue: defaultOpen,
    ...(onOpenChange === undefined ? {} : { onChange: onOpenChange }),
  });
  const triggerRef = useRef<View>(null);
  const optionRefs = useRef(new Map<Value, View>());
  const previouslyVisible = useRef(visible);
  const selectedOption = options.find((option) => option.value === selected);

  useEffect(() => {
    if (previouslyVisible.current && !visible && triggerRef.current) {
      const handle = findNodeHandle(triggerRef.current);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    }
    previouslyVisible.current = visible;
  }, [visible]);

  const focusInitialOption = () => {
    const initialValue =
      selected ?? options.find((option) => !option.disabled)?.value ?? options[0]!.value;
    const target = optionRefs.current.get(initialValue);
    if (target) {
      const handle = findNodeHandle(target);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    }
  };
  const close = () => setVisible(false);

  return (
    <View style={[{ gap: spacing.xs }, style]}>
      <Text tone="primary" variant="label">{label}{required ? " *" : ""}</Text>
      <Pressable
        ref={triggerRef}
        accessibilityHint={error ?? description}
        accessibilityLabel={label}
        accessibilityRole="combobox"
        accessibilityState={{ disabled, expanded: visible }}
        accessibilityValue={{ text: selectedOption?.label ?? placeholder }}
        disabled={disabled}
        onPress={() => setVisible(true)}
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
            gap: spacing.sm,
            opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
            paddingHorizontal: spacing.sm,
          },
        ]}
      >
        <Text style={{ flex: 1 }} tone={selectedOption ? "body" : "muted"} variant="bodyLarge">
          {selectedOption?.label ?? placeholder}
        </Text>
        <Text accessible={false} tone="muted">⌄</Text>
      </Pressable>
      {error ? (
        <Text accessibilityLiveRegion="assertive" tone="danger" variant="caption">{error}</Text>
      ) : description ? (
        <Text tone="muted" variant="caption">{description}</Text>
      ) : null}

      <Modal
        {...modalProps}
        animationType={environment.reducedMotion ? "none" : "slide"}
        onRequestClose={close}
        onShow={focusInitialOption}
        transparent
        visible={visible}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            accessibilityLabel={dismissLabel}
            accessibilityRole="button"
            onPress={close}
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
            accessibilityLabel={optionsAccessibilityLabel ?? label}
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
            <Text tone="primary" variant="title">{label}</Text>
            <ScrollView>
              {options.map((option) => {
                const checked = option.value === selected;
                return (
                  <Pressable
                    key={option.value}
                    ref={(node) => {
                      if (node) optionRefs.current.set(option.value, node);
                      else optionRefs.current.delete(option.value);
                    }}
                    accessibilityHint={option.accessibilityHint ?? option.description}
                    accessibilityLabel={option.label}
                    accessibilityRole="radio"
                    accessibilityState={{ checked, disabled: option.disabled === true }}
                    disabled={option.disabled}
                    onPress={() => {
                      setSelected(option.value);
                      close();
                    }}
                    style={({ pressed }) => [
                      minimumTargetStyle,
                      {
                        backgroundColor: checked ? colors.surfaceAccent : "transparent",
                        borderRadius: radius.md,
                        gap: spacing.xxs,
                        justifyContent: "center",
                        opacity: option.disabled ? 0.5 : pressed ? 0.86 : 1,
                        paddingHorizontal: spacing.sm,
                      },
                    ]}
                  >
                    <Text tone={checked ? "brand" : "body"} variant="bodyLarge">{option.label}</Text>
                    {option.description ? <Text tone="muted" variant="caption">{option.description}</Text> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Button onPress={close} tone="secondary">{dismissLabel}</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export type ComboboxProps<Key extends string = string> = Omit<
  ModalProps,
  "animationType" | "children" | "onRequestClose" | "onShow" | "transparent" | "visible"
> &
  Readonly<{
    label: string;
    items: readonly SelectItemDescriptor<Key>[];
    selectedKey?: Key | null;
    defaultSelectedKey?: Key | null;
    onSelectionChange?: (key: Key | null) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (value: string) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onCommit?: (key: Key | null, reason: ComboboxCommitReason) => void;
    filtering?: ComboboxFiltering;
    loading?: boolean;
    /** Localized text rendered when filtering returns no items. */
    emptyMessage: string;
    /** Localized text announced while results are loading. */
    loadingMessage: string;
    description?: string;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    openOnFocus?: boolean;
    /** Localized accessible name for clearing the committed selection/query. */
    clearLabel: string;
    /** Localized accessible name for dismissing the result list. */
    dismissLabel: string;
    /** Optional localized name for the result region; defaults neutrally to label. */
    resultsAccessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
  }>;

/** Editable Native combobox with independent query, committed key, and Modal results. */
export function Combobox<Key extends string = string>({
  label,
  items,
  selectedKey,
  defaultSelectedKey = null,
  onSelectionChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  onCommit,
  filtering = comboboxBehaviorDefaults.filtering,
  loading = false,
  emptyMessage,
  loadingMessage,
  description,
  error,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  openOnFocus = true,
  clearLabel,
  dismissLabel,
  resultsAccessibilityLabel,
  style,
  ...modalProps
}: ComboboxProps<Key>) {
  const ids = new Set<Key>();
  for (const item of items) {
    if (!item.id.trim() || !item.label.trim() || !item.textValue.trim()) {
      throw new TypeError("Combobox item id, label, and textValue must not be empty");
    }
    if (ids.has(item.id)) throw new TypeError(`Duplicate Combobox item id: ${item.id}`);
    ids.add(item.id);
  }
  const requestedSelection = selectedKey === undefined ? defaultSelectedKey : selectedKey;
  const requestedItem =
    requestedSelection === null
      ? undefined
      : items.find((item) => item.id === requestedSelection);
  if (requestedSelection !== null && (!requestedItem || requestedItem.disabled)) {
    throw new RangeError(`Combobox selectedKey must identify an enabled item: ${requestedSelection}`);
  }
  if (!emptyMessage.trim() || !loadingMessage.trim()) {
    throw new TypeError("Combobox state messages must not be empty");
  }

  const { colors, environment } = useHjmNativeTheme();
  const [committedKey, setCommittedKey] = useControllableState<Key | null>({
    ...(selectedKey === undefined ? {} : { value: selectedKey }),
    defaultValue: defaultSelectedKey,
    ...(onSelectionChange === undefined ? {} : { onChange: onSelectionChange }),
  });
  const committedItem =
    committedKey === null ? undefined : items.find((item) => item.id === committedKey);
  const [query, setQuery] = useControllableState({
    ...(inputValue === undefined ? {} : { value: inputValue }),
    defaultValue: defaultInputValue ?? committedItem?.label ?? "",
    ...(onInputValueChange === undefined ? {} : { onChange: onInputValueChange }),
  });
  const [visible, setVisible] = useControllableState({
    ...(open === undefined ? {} : { value: open }),
    defaultValue: defaultOpen,
    ...(onOpenChange === undefined ? {} : { onChange: onOpenChange }),
  });
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<TextInput>(null);
  const optionRefs = useRef(new Map<Key, View>());
  const previouslyVisible = useRef(visible);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredItems = useMemo(
    () =>
      filtering === "external"
        ? items
        : items.filter((item) =>
            `${item.label} ${item.textValue}`.toLocaleLowerCase().includes(normalizedQuery),
          ),
    [filtering, items, normalizedQuery],
  );

  useEffect(() => {
    if (previouslyVisible.current && !visible && inputRef.current) {
      const handle = findNodeHandle(inputRef.current);
      if (handle !== null) AccessibilityInfo.setAccessibilityFocus(handle);
    }
    previouslyVisible.current = visible;
  }, [visible]);

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
  const dismiss = () => {
    restoreCommittedQuery();
    setVisible(false);
    setActiveIndex(-1);
  };
  const commit = (item: SelectItemDescriptor<Key>) => {
    if (item.disabled) return;
    setCommittedKey(item.id);
    setQuery(item.label);
    onCommit?.(item.id, "selection");
    setVisible(false);
    setActiveIndex(-1);
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

  return (
    <View style={[{ gap: spacing.xs }, style]}>
      <Text tone="primary" variant="label">{label}{required ? " *" : ""}</Text>
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.bg,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: radius.md,
          borderWidth: error ? 2 : 1,
          direction: environment.direction,
          flexDirection: "row",
          minHeight: 44,
          paddingStart: spacing.sm,
        }}
      >
        <TextInput
          {...scalableTextDefaults}
          ref={inputRef}
          accessibilityHint={error ?? description}
          accessibilityLabel={label}
          accessibilityRole="combobox"
          accessibilityState={{ busy: loading, disabled, expanded: visible }}
          editable={!disabled && !readOnly}
          onChangeText={(next) => {
            setQuery(next);
            setActiveIndex(-1);
            if (!visible && !readOnly) setVisible(true);
          }}
          onFocus={() => {
            if (openOnFocus && !disabled && !readOnly) setVisible(true);
          }}
          onKeyPress={(event) => {
            const key = event.nativeEvent.key;
            if (key === "Escape") {
              dismiss();
            } else if (key === "ArrowDown") {
              if (!visible) setVisible(true);
              moveActive(1);
            } else if (key === "ArrowUp") {
              if (!visible) setVisible(true);
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
          style={{
            color: colors.text,
            flex: 1,
            minHeight: 44,
            textAlign: logicalTextAlign(environment.direction),
          }}
          value={query}
        />
        {query.length > 0 && !readOnly ? (
          <Pressable
            accessibilityLabel={clearLabel}
            accessibilityRole="button"
            disabled={disabled || loading}
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
        animationType={environment.reducedMotion ? "none" : "slide"}
        onRequestClose={dismiss}
        onShow={focusInitialOption}
        transparent
        visible={visible}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            accessibilityLabel={dismissLabel}
            accessibilityRole="button"
            onPress={dismiss}
            style={{ backgroundColor: "#00000088", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
          />
          <View
            accessibilityLabel={resultsAccessibilityLabel ?? label}
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
            <Text tone="primary" variant="title">{label}</Text>
            {loading ? (
              <Text accessibilityLiveRegion="polite" tone="muted">{loadingMessage}</Text>
            ) : filteredItems.length === 0 ? (
              <Text accessibilityLiveRegion="polite" tone="muted">{emptyMessage}</Text>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">
                {filteredItems.map((item, index) => {
                  const checked = item.id === committedKey;
                  const active = index === activeIndex;
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
                      accessibilityState={{ checked, disabled: item.disabled === true }}
                      disabled={item.disabled}
                      onPress={() => commit(item)}
                      style={({ pressed }) => [
                        minimumTargetStyle,
                        {
                          backgroundColor: checked || active ? colors.surfaceAccent : "transparent",
                          borderRadius: radius.md,
                          gap: spacing.xxs,
                          justifyContent: "center",
                          opacity: item.disabled ? 0.5 : pressed ? 0.86 : 1,
                          paddingHorizontal: spacing.sm,
                        },
                      ]}
                    >
                      <Text tone={checked ? "brand" : "body"} variant="bodyLarge">{item.label}</Text>
                      {item.description ? <Text tone="muted" variant="caption">{item.description}</Text> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
            <Button onPress={dismiss} tone="secondary">{dismissLabel}</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
