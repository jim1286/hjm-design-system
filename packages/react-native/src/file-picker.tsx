import {
  filePickerRecipe,
  resolveFilePickerDescriptor,
  resolveFilePickerSelection,
  validateFilePickerTriggers,
  type FilePickerCandidate,
  type FilePickerDescriptor,
  type FilePickerSelectionResult,
} from "@hjmds/design-contracts/components/file-picker";
import { useEffect, useRef, useState } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { Text } from "./primitives.js";
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
  style?: StyleProp<ViewStyle>;
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
  style,
}: FilePickerProps) {
  validateFilePickerTriggers("native", ["button"]);
  const resolved = resolveFilePickerDescriptor(descriptor);
  const { colors } = useHjmNativeTheme();
  const [busy, setBusy] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);
  const unavailable = disabled || busy;
  const pick = async () => {
    if (unavailable) return;
    setBusy(true);
    try {
      const candidates = await onPick();
      if (candidates !== null) onSelect(resolveFilePickerSelection(candidates, resolved, existingCount));
    } catch (error) {
      onPickError(error);
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  };
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text emphasis="strong" variant="label">{label}</Text>
      <Pressable
        accessibilityLabel={buttonLabel}
        accessibilityRole="button"
        accessibilityState={{ busy, disabled: unavailable }}
        disabled={unavailable}
        onPress={() => void pick()}
        style={({ pressed }) => ({ alignItems: "center", alignSelf: "flex-start", borderColor: error ? colors.danger : colors.border, borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: filePickerRecipe.trigger.minHeight, opacity: unavailable ? filePickerRecipe.states.disabledOpacity : pressed ? 0.72 : 1, paddingHorizontal: filePickerRecipe.trigger.paddingHorizontal })}
      >
        <Text emphasis="strong" style={{ color: colors.contentBrand }} variant="label">{buttonLabel}</Text>
      </Pressable>
      {hint === undefined ? null : <Text tone="muted" variant="label">{hint}</Text>}
      {error === undefined ? null : <Text accessibilityLiveRegion="assertive" style={{ color: colors.danger }} variant="label">{error}</Text>}
    </View>
  );
}
