import {
  filePickerRecipe,
  resolveFilePickerDescriptor,
  resolveFilePickerSelection,
  validateFilePickerTriggers,
  type FilePickerCandidate,
  type FilePickerDescriptor,
  type FilePickerSelectionResult,
} from "@hjmds/design-contracts/components/file-picker";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";

import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type FilePickerProps = Readonly<{
  descriptor: FilePickerDescriptor;
  label: string;
  buttonLabel: string;
  /** Product adapter around Expo DocumentPicker, native modules, or another platform picker. */
  onPick: () => Promise<readonly FilePickerCandidate[] | null>;
  /** Receives native picker failures so rejected adapter promises never become unhandled. */
  onPickError: (error: unknown) => void;
  onSelect: (result: FilePickerSelectionResult) => void;
  existingCount?: number;
  disabled?: boolean;
  hint?: string;
  error?: string;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;

/** Expo-independent Native trigger; products inject the platform picker adapter. */
export function FilePicker({
  descriptor,
  label,
  buttonLabel,
  onPick,
  onPickError,
  onSelect,
  existingCount = 0,
  disabled = false,
  hint,
  error,
  layoutStyle,
}: FilePickerProps) {

  validateFilePickerTriggers("native", ["button"]);
  const resolved = resolveFilePickerDescriptor(descriptor);
  const { colors, designProfile } = useHjmNativeTheme();
  // The trigger md role follows the nearest profile without changing standalone geometry.
  const corner = designProfile?.tokens.radius[filePickerRecipe.trigger.radius] ?? 12;
  const [busy, setBusy] = useState(false);
  const mountedRef = useRef(true);
  const pickingRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const current = useRef({ disabled, resolved, existingCount, onSelect, onPickError });
  useLayoutEffect(() => { current.current = { disabled, resolved, existingCount, onSelect, onPickError }; });
  const unavailable = disabled || busy;
  const pick = async () => {
    if (unavailable || pickingRef.current) return;
    // Lock synchronously: two presses may arrive before React renders busy.
    pickingRef.current = true;
    setBusy(true);
    try {
      const candidates = await onPick();
      // A platform dialog can outlive changes to the form's lock or remaining
      // capacity. Judge its result against the latest committed owner inputs.
      const latest = current.current;
      if (mountedRef.current && !latest.disabled && candidates !== null) {
        latest.onSelect(resolveFilePickerSelection(candidates, latest.resolved, latest.existingCount));
      }
    } catch (error) {
      if (mountedRef.current) current.current.onPickError(error);
    } finally {
      pickingRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  };
  return (
    <View style={[{ gap: 6 }, layoutStyle]}>
      <Text emphasis="strong" variant="label">{label}</Text>
      <Pressable
        accessibilityLabel={buttonLabel}
        accessibilityRole="button"
        accessibilityState={{ busy, disabled: unavailable }}
        disabled={unavailable}
        onPress={() => void pick()}
        style={({ pressed }) => ({ alignItems: "center", alignSelf: "flex-start", borderColor: error ? colors.danger : colors.border, borderRadius: corner, borderWidth: 1, justifyContent: "center", minHeight: filePickerRecipe.trigger.minHeight, opacity: unavailable ? filePickerRecipe.states.disabledOpacity : pressed ? 0.72 : 1, paddingHorizontal: filePickerRecipe.trigger.paddingHorizontal })}
      >
        <Text emphasis="strong" style={{ color: colors.contentBrand }} variant="label">{buttonLabel}</Text>
      </Pressable>
      {hint === undefined ? null : <Text tone="muted" variant="label">{hint}</Text>}
      {error === undefined ? null : <Text accessibilityLiveRegion="assertive" style={{ color: colors.danger }} variant="label">{error}</Text>}
    </View>
  );
}
