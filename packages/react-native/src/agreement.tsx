import {
  agreementRecipe,
  reconcileAgreementSelection,
  resolveAgreementState,
  toggleAgreementAll,
  toggleAgreementItem,
  validateAgreementDescriptor,
  type AgreementDescriptor,
  type AgreementState,
} from "@hjmds/design-contracts/components/agreement";
import { resolveColorReference } from "@hjmds/design-contracts/color-references";
import { spacing } from "@hjmds/design-contracts/foundations";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { mixedCheckboxState } from "./internal/state.js";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type AgreementProps<Id extends string = string> = Readonly<{
  descriptor: AgreementDescriptor<Id>;
  checkedIds?: ReadonlySet<Id>;
  defaultCheckedIds?: ReadonlySet<Id>;
  onCheckedIdsChange?: (ids: ReadonlySet<Id>) => void;
  onStateChange?: (state: AgreementState<Id>) => void;
  /** Opens one item's full text. Native has no href, so this is the only path. */
  onDetail?: (id: Id) => void;
  /** Localized suffix marking a required row, supplied by the product. */
  requiredLabel: string;
  /** Localized suffix marking an optional row, supplied by the product. */
  optionalLabel: string;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
   * `agreementRecipe` owns appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
}>;

export function Agreement<Id extends string = string>({
  descriptor,
  checkedIds: controlledChecked,
  defaultCheckedIds,
  onCheckedIdsChange,
  onStateChange,
  onDetail,
  requiredLabel,
  optionalLabel,
  layoutStyle,
  style,
}: AgreementProps<Id>) {
  warnDeprecatedStyleProps("Agreement", { style }, "layoutStyle for placement; agreementRecipe owns appearance");
  validateAgreementDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  const [internal, setInternal] = useState<ReadonlySet<Id>>(defaultCheckedIds ?? new Set<Id>());
  const raw = controlledChecked ?? internal;
  const checked = useMemo(
    () => reconcileAgreementSelection(descriptor, raw),
    [descriptor, raw],
  );
  const state = resolveAgreementState(descriptor, checked);
  // Report the initial state once on mount. Until 2026-10-06 only user toggles reported, so
  // `defaultCheckedIds`/`checkedIds` that already satisfied every required item never produced a
  // first `satisfied: true` and a submit button wired to this callback stayed disabled. Mount-only
  // (not on every derived change) keeps the callback count to "initial + one per toggle"; StrictMode
  // may repeat the same snapshot, which is idempotent for a consumer that stores it.
  const initialStateRef = useRef(state);
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;
  useEffect(() => {
    onStateChangeRef.current?.(initialStateRef.current);
  }, []);
  const commit = (next: ReadonlySet<Id>) => {
    if (descriptor.disabled) return;
    if (controlledChecked === undefined) setInternal(next);
    onCheckedIdsChange?.(next);
    onStateChange?.(resolveAgreementState(descriptor, next));
  };

  const markColor = resolveColorReference(agreementRecipe.item.selectedIndicator, theme.palette);
  const borderColor = resolveColorReference(agreementRecipe.item.focus.color, theme.palette);
  // The glyph sits on the brand fill, so it takes onPrimary, the same token as the
  // Checkbox indicator (selectionControlRecipe.states.indicator). agreementRecipe.all.color
  // is the row text color and measured 2.19:1 on the fill (2026-09-30 audit). Read from
  // the theme rather than the recipes entry, which would add a module to this subpath.
  const glyphColor = theme.colors.onPrimary;
  const mark = (value: boolean | "mixed") => (
    <View
      style={{
        alignItems: "center",
        backgroundColor: value === false ? "transparent" : markColor,
        borderColor: value === false ? borderColor : markColor,
        borderRadius: theme.tokens.radius.sm,
        borderWidth: 1,
        height: spacing.md,
        flexShrink: 0,
        justifyContent: "center",
        width: spacing.md,
      }}
    >
      {value === false ? null : (
        // Fixed artwork: HJM Text scales even if OS scaling is disabled, which
        // pushed the previous check glyph outside this 16pt frame at 2x.
        <View accessible={false} style={value === "mixed"
          ? { width: 10, height: 2, backgroundColor: glyphColor }
          : { width: 8, height: 4, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: glyphColor, transform: [{ rotate: "-45deg" }] }} />
      )}
    </View>
  );

  return (
    <View accessibilityLabel={descriptor.accessibilityLabel} accessibilityRole="none" style={[{ gap: agreementRecipe.gap }, style, layoutStyle]}>
      {/*
        An explicit label keeps the name stable: without it Android derived the
        content description from the mixed state and read "mixed" as the name
        even after the row became all or none (2026-09-30 audit). Mixed stays in
        accessibilityState, where TalkBack and VoiceOver announce it as state.
      */}
      <Pressable
        accessibilityLabel={descriptor.allLabel}
        accessibilityRole="checkbox"
        accessibilityState={{ ...mixedCheckboxState(state.all), disabled: descriptor.disabled === true }}
        disabled={descriptor.disabled === true}
        onPress={() => commit(toggleAgreementAll(descriptor, checked))}
        style={{
          alignItems: "center",
          opacity: descriptor.disabled ? agreementRecipe.states.disabledOpacity : 1,
          backgroundColor: resolveColorReference(agreementRecipe.all.background, theme.palette),
          borderRadius: theme.tokens.radius.md,
          flexDirection: "row",
          gap: agreementRecipe.all.gap,
          minHeight: agreementRecipe.all.minHeight,
          paddingHorizontal: agreementRecipe.all.paddingHorizontal,
          paddingVertical: agreementRecipe.all.paddingVertical,
        }}
      >
        {mark(state.all)}
        <Text variant={agreementRecipe.all.textVariant}>{descriptor.allLabel}</Text>
      </Pressable>
      {descriptor.items.map((item) => (
        <View key={item.id} style={{ gap: spacing.xxs }}>
          <View style={{ alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            <Pressable
              // Named explicitly so the check glyph never leaks into the name ("✓, Terms").
              accessibilityLabel={`${item.label} ${item.required === true ? requiredLabel : optionalLabel}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: checked.has(item.id), disabled: descriptor.disabled === true || item.disabled === true }}
              disabled={descriptor.disabled === true || item.disabled === true}
              onPress={() => { if (!item.disabled) commit(toggleAgreementItem(descriptor, checked, item.id)); }}
              style={{
                alignItems: "center",
                flexBasis: agreementRecipe.itemLayout.labelBasis,
                flexGrow: 1,
                flexShrink: 1,
                // Yoga can shrink a percentage flex basis before wrapping; protect the label
                // so a long detail action moves below instead of squeezing consent text.
                minWidth: agreementRecipe.itemLayout.labelBasis,
                opacity: descriptor.disabled || item.disabled ? agreementRecipe.states.disabledOpacity : 1,
                flexDirection: "row",
                gap: agreementRecipe.item.gap,
                minHeight: agreementRecipe.item.minHeight,
              }}
            >
              {mark(checked.has(item.id))}
              <Text style={{ flex: 1 }} variant={agreementRecipe.item.label.textVariant}>
                {`${item.label} ${item.required === true ? requiredLabel : optionalLabel}`}
              </Text>
            </Pressable>
            {/*
              A separate pressable, never nested inside the checkbox: reading the
              text and agreeing to it are different acts, and a nested press
              target would let one become the other.
            */}
            {item.detail ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => onDetail?.(item.id)}
                style={{ justifyContent: "center", maxWidth: "100%", minHeight: agreementRecipe.detail.minHeight, paddingHorizontal: spacing.xs }}
              >
                <Text
                  style={{ color: resolveColorReference(agreementRecipe.detail.color, theme.palette), textDecorationLine: "underline" }}
                  variant={agreementRecipe.detail.textVariant}
                >
                  {item.detail.label}
                </Text>
              </Pressable>
            ) : null}
          </View>
          {item.description ? (
            <Text
              style={{ color: resolveColorReference(agreementRecipe.item.description.color, theme.palette), paddingStart: spacing.xl }}
              variant={agreementRecipe.item.description.textVariant}
            >
              {item.description}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
