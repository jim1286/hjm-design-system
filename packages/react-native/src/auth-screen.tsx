import {
  authScreenRecipe,
  resolveAuthScreenDescriptor,
  type AuthScreenDescriptor,
} from "@hjmds/design-contracts/components/auth-screen";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { HjmCompositionStyleProp } from "./composition-style.js";
import { useHjmNativeTheme } from "./provider.js";

export type AuthScreenLayoutProps = AuthScreenDescriptor &
  Readonly<{
    /** Product mark, title and description. The product owns every string here. */
    hero: ReactNode;
    /** The primary action block — provider buttons, or a product's own sign-in bundle. */
    main: ReactNode;
    /** Product-localized progress label; presence replaces actions with one centred loader. */
    pendingLabel?: string;
    /** Let the layout own the action card; omit when the product already supplies a surface. */
    mainCard?: boolean;
    /** Consent notice and policy links. Omit with `hasFooter: false`. */
    footer?: ReactNode;
    testID?: string;
    layoutStyle?: HjmCompositionStyleProp;
  }>;

function AuthActionCard({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useHjmNativeTheme();
  return <View style={[{ width: "100%", backgroundColor: theme.colors.bg,
    // The login card uses the same lg surface role as Web; provider buttons keep
    // their separate branding recipe and pending keeps the mounted action block.
    borderRadius: theme.designProfile?.tokens.radius.lg ?? authScreenRecipe.mainCard.radius,
    padding: authScreenRecipe.mainCard.padding }, style]}>{children}</View>;
}

/**
 * Two regions: hero + main stay one vertically centred block, the footer sits at
 * the bottom. Content taller than the viewport scrolls instead of pushing the
 * footer off screen — that is why the outer element is a ScrollView whose content
 * container grows.
 * Review forms must accept submit taps while focused; iOS owns the scroll inset
 * so a product does not have to wrap this in another keyboard-avoiding view.
 */
export function AuthScreenLayout({
  hero,
  main,
  footer,
  density,
  hasFooter,
  pendingLabel,
  mainCard = false,

  layoutStyle,
  testID,
}: AuthScreenLayoutProps) {
  const MainContainer = mainCard ? AuthActionCard : View;
  const resolved = resolveAuthScreenDescriptor({
    ...(density === undefined ? {} : { density }),
    ...(hasFooter === undefined ? {} : { hasFooter }),
  });
  const showFooter = resolved.hasFooter && footer !== undefined && footer !== null;
  const pending = pendingLabel !== undefined;
  if (pending && !pendingLabel.trim()) throw new TypeError("AuthScreen pendingLabel must not be empty");
  return (
    <ScrollView
      style={[{ flex: 1 }, layoutStyle]}
      testID={testID}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: resolved.paddingInline,
        paddingVertical: resolved.paddingBlock,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View
        style={{
          flexGrow: 1,
          flexShrink: 0,
          width: "100%",
          maxWidth: resolved.maxWidth,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          gap: resolved.mainGap,
        }}
      >
        <View style={{ width: "100%", alignItems: "center", gap: resolved.heroGap }}>{hero}</View>
        <MainContainer style={{ width: "100%" }}>
          {/* Keep layout and form state, while excluding hidden controls from touch and screen-reader navigation. */}
          <View pointerEvents={pending ? "none" : "auto"} accessibilityElementsHidden={pending}
            importantForAccessibility={pending ? "no-hide-descendants" : "auto"}
            style={pending ? { opacity: 0 } : undefined}>{main}</View>
          {pending ? <View accessible accessibilityLabel={pendingLabel} accessibilityRole="progressbar"
            accessibilityLiveRegion="polite" accessibilityState={{ busy: true }}
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator accessible={false} />
          </View> : null}
        </MainContainer>
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
