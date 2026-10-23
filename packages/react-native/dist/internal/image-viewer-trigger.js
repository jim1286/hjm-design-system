import { jsx as _jsx } from "react/jsx-runtime";
import { Pressable } from "react-native";
import { imageViewerTriggerRecipe, validateImageViewerTriggerLabel } from "@hjmds/design-contracts/components/image";
import { useHjmNativeTheme } from "../provider.js";
/**
 * Pressable around product media that opens ImageViewer (imageViewerTriggerRecipe), exported from the image-viewer
 * subpath beside the viewer it opens; the product keeps the viewer's `open` state.
 */
export function ImageViewerTrigger({ label, children, onPress, disabled, layoutStyle, ...props }) {
    validateImageViewerTriggerLabel(label);
    const { tokens } = useHjmNativeTheme();
    return (_jsx(Pressable, { ...props, accessibilityRole: "imagebutton", accessibilityLabel: label, accessibilityState: { ...props.accessibilityState, disabled: Boolean(disabled) }, disabled: disabled, onPress: onPress, style: ({ pressed }) => [
            {
                borderRadius: tokens.radius[imageViewerTriggerRecipe.radius],
                opacity: disabled ? imageViewerTriggerRecipe.disabledOpacity : pressed ? imageViewerTriggerRecipe.pressedOpacity : 1,
                overflow: "hidden",
            },
            layoutStyle,
        ], children: children }));
}
//# sourceMappingURL=image-viewer-trigger.js.map