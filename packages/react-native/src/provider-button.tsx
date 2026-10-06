import {
  authProviderButtonRecipe,
  resolveAuthProviderSurface,
  validateAuthProviderButtonDescriptor,
  type AuthProviderButtonDescriptor,
} from "@hjmds/design-contracts/components/provider-button";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "./primitives.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { warnDeprecatedStyleProps } from "./internal/deprecated-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type AuthProviderButtonProps = Readonly<{
  descriptor: AuthProviderButtonDescriptor;
  /** The provider's own mark, supplied by the product — never bundled here. */
  logo: ReactNode;
  onPress: () => void;
  /** Canonical layout-only placement. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
  /**
   * @deprecated Raw visual style bypasses the HJM recipe. Use `layoutStyle` for placement;
   * the provider surface (`authProviderButtonRecipe`) owns appearance. Removed in the next major (consumer-policy.md §3.1).
   */
  style?: StyleProp<ViewStyle>;
}>;

export function AuthProviderButton({ descriptor, logo, onPress, layoutStyle, style }: AuthProviderButtonProps) {
  warnDeprecatedStyleProps("AuthProviderButton", { style }, "layoutStyle for placement; authProviderButtonRecipe owns appearance");
  validateAuthProviderButtonDescriptor(descriptor);
  const theme = useHjmNativeTheme();
  // The theme picks between the provider's own variants and nothing else.
  const surface = resolveAuthProviderSurface(
    descriptor.provider,
    theme.environment.theme === "dark" ? "dark" : "light",
  );
  const busy = descriptor.busy === true;
  const disabled = descriptor.disabled === true || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={descriptor.label}
      accessibilityState={{ busy, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          position: "relative",
          alignItems: "center",
          backgroundColor: surface.background,
          borderColor: surface.border ?? "transparent",
          borderRadius: authProviderButtonRecipe.radius,
          borderWidth: surface.border === null ? 0 : authProviderButtonRecipe.borderWidth,
          flexDirection: "row",
          gap: authProviderButtonRecipe.gap,
          justifyContent: "center",
          minHeight: Math.max(authProviderButtonRecipe.minHeight, authProviderButtonRecipe.minTouchTarget),
          opacity: disabled && !busy ? 0.5 : 1,
          paddingHorizontal: authProviderButtonRecipe.paddingHorizontal,
        },
        style,
        layoutStyle,
      ]}
    >
      <View
        style={{
          alignItems: "center",
          height: authProviderButtonRecipe.logoSize,
          justifyContent: "center",
          width: authProviderButtonRecipe.logoSize,
          opacity: busy ? 0 : 1,
        }}
      >
        {logo}
      </View>
      {/* Keep the measured label in place so the busy frame never shrinks. */}
      <Text style={{ color: surface.content, flexShrink: 1, opacity: busy ? 0 : 1 }} variant="body">
        {descriptor.label}
      </Text>
      {busy ? <View pointerEvents="none" style={{ alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 }}><ActivityIndicator color={surface.content} /></View> : null}
    </Pressable>
  );
}
