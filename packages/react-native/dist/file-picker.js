import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { filePickerRecipe, resolveFilePickerDescriptor, resolveFilePickerSelection, validateFilePickerTriggers, } from "@hjm/design-contracts/components/file-picker";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
/** Expo-independent Native trigger; products inject the platform picker adapter. */
export function FilePicker({ descriptor, label, buttonLabel, onPick, onPickError, onSelect, existingCount = 0, disabled = false, hint, error, style, }) {
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
        if (unavailable)
            return;
        setBusy(true);
        try {
            const candidates = await onPick();
            if (candidates !== null)
                onSelect(resolveFilePickerSelection(candidates, resolved, existingCount));
        }
        catch (error) {
            onPickError(error);
        }
        finally {
            if (mountedRef.current)
                setBusy(false);
        }
    };
    return (_jsxs(View, { style: [{ gap: 6 }, style], children: [_jsx(Text, { emphasis: "strong", variant: "label", children: label }), _jsx(Pressable, { accessibilityLabel: buttonLabel, accessibilityRole: "button", accessibilityState: { busy, disabled: unavailable }, disabled: unavailable, onPress: () => void pick(), style: ({ pressed }) => ({ alignItems: "center", alignSelf: "flex-start", borderColor: error ? colors.danger : colors.border, borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: filePickerRecipe.trigger.minHeight, opacity: unavailable ? filePickerRecipe.states.disabledOpacity : pressed ? 0.72 : 1, paddingHorizontal: filePickerRecipe.trigger.paddingHorizontal }), children: _jsx(Text, { emphasis: "strong", style: { color: colors.contentBrand }, variant: "label", children: buttonLabel }) }), hint === undefined ? null : _jsx(Text, { tone: "muted", variant: "label", children: hint }), error === undefined ? null : _jsx(Text, { accessibilityLiveRegion: "assertive", style: { color: colors.danger }, variant: "label", children: error })] }));
}
//# sourceMappingURL=file-picker.js.map