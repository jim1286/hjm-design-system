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
import { useHjmNativeTheme } from "./provider.js";

export type AuthProviderButtonProps = Readonly<{
  descriptor: AuthProviderButtonDescriptor;
  /** The provider's own mark, supplied by the product — never bundled here. */
  logo: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}>;

export function AuthProviderButton({ descriptor, logo, onPress, style }: AuthProviderButtonProps) {
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
      accessibilityState={{ busy, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
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
      ]}
    >
      <View
        style={{
          alignItems: "center",
          height: authProviderButtonRecipe.logoSize,
          justifyContent: "center",
          width: authProviderButtonRecipe.logoSize,
        }}
      >
        {logo}
      </View>
      {/* Busy adds a spinner beside the label instead of replacing it. */}
      <Text style={{ color: surface.content, flexShrink: 1 }} variant="body">
        {descriptor.label}
      </Text>
      {busy ? <ActivityIndicator color={surface.content} /> : null}
    </Pressable>
  );
}
