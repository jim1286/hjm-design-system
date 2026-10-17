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
import { Pressable, View } from "react-native";
import { mixedCheckboxState } from "./internal/state.js";
import { SelectionMark } from "./internal/selection-mark.js";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
}>;


// UI control labels keep the ui font even when their metric variant is body; content still uses reading.
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
}: AgreementProps<Id>) {
  validateAgreementDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  const [internal, setInternal] = useState<ReadonlySet<Id>>(defaultCheckedIds ?? new Set<Id>());
  const raw = controlledChecked ?? internal;
  const checked = useMemo(
    () => reconcileAgreementSelection(descriptor, raw),
    [descriptor, raw],
  );
  const state = resolveAgreementState(descriptor, checked);
  // Persist removed consent IDs so reinserting a row cannot silently consent again.
  useEffect(() => {
    if (controlledChecked === undefined && checked !== raw) {
      setInternal(checked);
      onCheckedIdsChange?.(checked);
    }
  }, [checked, controlledChecked, raw, onCheckedIdsChange]);
  // Report accepted state, including external value/required-item changes. A rejected
  // controlled request must not enable the product's submit button optimistically.
  const reported = useRef<{ checked: ReadonlySet<Id>; state: AgreementState<Id> } | undefined>(undefined);
  useEffect(() => {
    const previous = reported.current;
    if (previous && previous.state.all === state.all && previous.state.satisfied === state.satisfied
      && previous.state.missingRequiredIds.length === state.missingRequiredIds.length
      && previous.state.missingRequiredIds.every((id, index) => id === state.missingRequiredIds[index])
      && previous.checked.size === checked.size && [...checked].every(id => previous.checked.has(id))) return;
    reported.current = { checked, state };
    onStateChange?.(state);
  });
  const commit = (next: ReadonlySet<Id>) => {
    if (descriptor.disabled) return;
    if (controlledChecked === undefined) setInternal(next);
    onCheckedIdsChange?.(next);
  };

  // Consent rows are multi-select: Checkbox's indicator (grey control border unchecked, brand fill checked), not a
  // 16pt brand-outlined box that read as a radio (2026-10-17 review).
  const mark = (value: boolean | "mixed") => <SelectionMark checked={value} />;

  return (
    <View accessibilityLabel={descriptor.accessibilityLabel} accessibilityRole="none" style={[{ gap: agreementRecipe.gap }, layoutStyle]}>
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
        <Text
              fontRole="ui" variant={agreementRecipe.all.textVariant}>{descriptor.allLabel}</Text>
      </Pressable>
      {descriptor.items.map((item) => (
        <View key={item.id} style={{ gap: spacing.xxs, paddingHorizontal: agreementRecipe.itemLayout.paddingHorizontal }}>
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
              <Text
              fontRole="ui" style={{ flex: 1 }} variant={agreementRecipe.item.label.textVariant}>
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
