import type { ReactNode } from "react";
import type { Preview } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HjmNativeProvider, useHjmNativeTheme } from "@hjmds/react-native/provider";

function Canvas({ children }: { children: ReactNode }) {
  const { colors } = useHjmNativeTheme();
  return <View style={[styles.canvas, { backgroundColor: colors.bg }]}>{children}</View>;
}

// Window insets reach every renderer through the provider, so overlays such as
// Sheet and DatePicker clear the home indicator without a per-story prop
// (2026-09-30 native audit).
function Insets({ children, theme, direction, textScale, reducedMotion }: {
  children: ReactNode; theme: "light" | "dark"; direction: "ltr" | "rtl"; textScale: 1 | 1.5 | 2; reducedMotion: boolean;
}) {
  const insets = useSafeAreaInsets();
  return <HjmNativeProvider theme={theme} direction={direction} textScale={textScale} reducedMotion={reducedMotion} safeAreaInsets={insets}>{children}</HjmNativeProvider>;
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      defaultValue: "light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
    direction: {
      name: "Direction",
      defaultValue: "ltr",
      toolbar: {
        icon: "transfer",
        items: [
          { value: "ltr", title: "LTR" },
          { value: "rtl", title: "RTL" },
        ],
      },
    },
    textScale: {
      name: "Text scale",
      defaultValue: "1",
      toolbar: {
        icon: "zoom",
        items: [
          { value: "1", title: "100%" },
          { value: "1.5", title: "150%" },
          { value: "2", title: "200%" },
        ],
      },
    },
    reducedMotion: {
      name: "Motion",
      defaultValue: "full",
      toolbar: {
        icon: "lightning",
        items: [
          { value: "full", title: "Full motion" },
          { value: "reduced", title: "Reduced motion" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => (
      <Insets
        theme={context.globals.theme === "dark" ? "dark" : "light"}
        direction={context.globals.direction === "rtl" ? "rtl" : "ltr"}
        textScale={context.globals.textScale === "2" ? 2 : context.globals.textScale === "1.5" ? 1.5 : 1}
        reducedMotion={context.globals.reducedMotion === "reduced"}
      >
        <Canvas><Story /></Canvas>
      </Insets>
    ),
  ],
};

const styles = StyleSheet.create({ canvas: { flex: 1, padding: 16 } });

export default preview;
