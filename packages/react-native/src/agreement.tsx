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
import { radius, spacing } from "@hjmds/design-contracts/foundations";
import { useMemo, useState } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "./primitives.js";
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
  style,
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
  const commit = (next: ReadonlySet<Id>) => {
    if (controlledChecked === undefined) setInternal(next);
    onCheckedIdsChange?.(next);
    onStateChange?.(resolveAgreementState(descriptor, next));
  };

  const markColor = resolveColorReference(agreementRecipe.item.selectedIndicator, theme.palette);
  const borderColor = resolveColorReference(agreementRecipe.item.focus.color, theme.palette);
  const mark = (value: boolean | "mixed") => (
    <View
      style={{
        alignItems: "center",
        backgroundColor: value === false ? "transparent" : markColor,
        borderColor: value === false ? borderColor : markColor,
        borderRadius: radius.sm,
        borderWidth: 1,
        height: spacing.md,
        justifyContent: "center",
        width: spacing.md,
      }}
    >
      {value === false ? null : (
        <Text style={{ color: resolveColorReference(agreementRecipe.all.color, theme.palette) }} variant="caption">
          {value === "mixed" ? "–" : "✓"}
        </Text>
      )}
    </View>
  );

  return (
    <View accessibilityLabel={descriptor.accessibilityLabel} accessibilityRole="none" style={[{ gap: agreementRecipe.gap }, style]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: state.all === "mixed" ? "mixed" : state.all }}
        onPress={() => commit(toggleAgreementAll(descriptor, checked))}
        style={{
          alignItems: "center",
          backgroundColor: resolveColorReference(agreementRecipe.all.background, theme.palette),
          borderRadius: radius.md,
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
          <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.xs }}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: checked.has(item.id), disabled: item.disabled === true }}
              disabled={item.disabled === true}
              onPress={() => commit(toggleAgreementItem(descriptor, checked, item.id))}
              style={{
                alignItems: "center",
                flex: 1,
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
                style={{ justifyContent: "center", minHeight: agreementRecipe.detail.minHeight, paddingHorizontal: spacing.xs }}
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
