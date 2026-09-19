import {
  authScreenRecipe,
  resolveAuthScreenDescriptor,
  type AuthScreenDescriptor,
} from "@hjmds/design-contracts/components/auth-screen";
import type { ReactNode } from "react";
import { ScrollView, View, type StyleProp, type ViewStyle } from "react-native";

export type AuthScreenLayoutProps = AuthScreenDescriptor &
  Readonly<{
    /** Product mark, title and description. The product owns every string here. */
    hero: ReactNode;
    /** The primary action block — provider buttons, or a product's own sign-in bundle. */
    main: ReactNode;
    /** Consent notice and policy links. Omit with `hasFooter: false`. */
    footer?: ReactNode;
    style?: StyleProp<ViewStyle>;
  }>;

/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. Content taller than the viewport scrolls instead of pushing the
 * footer off screen — that is why the outer element is a ScrollView whose content
 * container grows.
 */
export function AuthScreenLayout({
  hero,
  main,
  footer,
  density,
  hasFooter,
  style,
}: AuthScreenLayoutProps) {
  const resolved = resolveAuthScreenDescriptor({
    ...(density === undefined ? {} : { density }),
    ...(hasFooter === undefined ? {} : { hasFooter }),
  });
  const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
  return (
    <ScrollView
      style={style}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: resolved.paddingInline,
        paddingVertical: resolved.paddingBlock,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: resolved.maxWidth,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          gap: resolved.mainGap,
        }}
      >
        <View style={{ width: "100%", alignItems: "center", gap: resolved.heroGap }}>{hero}</View>
        <View style={{ width: "100%" }}>{main}</View>
      </View>
      {showFooter ? (
        <View
          style={{
            width: "100%",
            maxWidth: resolved.maxWidth,
            alignSelf: "center",
            alignItems: "center",
            marginTop: resolved.footerGap,
          }}
        >
          {footer}
        </View>
      ) : null}
    </ScrollView>
  );
}

export { authScreenRecipe };
