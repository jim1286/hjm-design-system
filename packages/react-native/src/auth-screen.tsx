import {
  authScreenRecipe,
  resolveAuthScreenDescriptor,
  validateAuthScreenHeroDescriptor,
  validateAuthScreenPolicyLinks,
  type AuthScreenDensity,
  type AuthScreenDescriptor,
  type AuthScreenHeroDescriptor,
  type AuthScreenPolicyLinkDescriptor,
} from "@hjmds/design-contracts/components/auth-screen";
import { createContext, Fragment, useContext, type ReactNode } from "react";
import { InheritedTextAlignContext } from "./internal/text-align.js";
import { Text } from "./primitives.js";
import {
  ActivityIndicator,
  Platform,
  Pressable,
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

// The hero follows the layout density without the product passing it twice (same as Web).
const AuthScreenDensityContext = createContext<AuthScreenDensity | undefined>(undefined);

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
        {/* Web centers hero copy with inherited text-align; Native needs the explicit context. */}
        <AuthScreenDensityContext.Provider value={resolved.density}><InheritedTextAlignContext.Provider value="center"><View style={{ width: "100%", alignItems: "center", gap: resolved.heroGap }}>{hero}</View></InheritedTextAlignContext.Provider></AuthScreenDensityContext.Provider>
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

export type AuthScreenHeroProps = AuthScreenHeroDescriptor &
  Readonly<{
    /** Product mark asset. HJM never ships product marks. */
    mark?: ReactNode;
  }>;

/**
 * The `hero` slot content: mark, eyebrow, tagline and one description line. Type
 * steps, tones and gaps come from `authScreenRecipe.hero`, matching Web.
 */
export function AuthScreenHero({ mark, title, eyebrow, description, headingLevel = 1 }: AuthScreenHeroProps) {
  validateAuthScreenHeroDescriptor({ title, ...(eyebrow === undefined ? {} : { eyebrow }), ...(description === undefined ? {} : { description }), headingLevel });
  const theme = useHjmNativeTheme();
  const density = useContext(AuthScreenDensityContext);
  const variant = resolveAuthScreenDescriptor(density === undefined ? {} : { density }).titleVariant;
  const recipe = authScreenRecipe.hero;
  // Fragment: mark and copy are direct children of the hero so the recipe hero gap separates them.
  return (
    <Fragment>
      {mark ? <View>{mark}</View> : null}
      <View style={{ width: "100%", alignItems: "center" }}>
        {eyebrow ? <Text variant={recipe.eyebrow.textVariant} tone={recipe.eyebrow.tone} style={{ marginBottom: recipe.eyebrow.gapBelow }}>{eyebrow}</Text> : null}
        {/* The title step's own weight (500), not Text's regular default outside a profile. */}
        <Text accessibilityRole="header" variant={variant} tone={recipe.title.tone}
          style={{ fontWeight: theme.tokens.typography[variant].fontWeight }}>{title}</Text>
        {description ? <Text variant={recipe.description.textVariant} tone={recipe.description.tone} style={{ marginTop: recipe.description.gapAbove }}>{description}</Text> : null}
      </View>
    </Fragment>
  );
}

export type AuthScreenPolicyLink = AuthScreenPolicyLinkDescriptor &
  Readonly<{ onPress: () => void }>;

export type AuthScreenFooterProps = Readonly<{
  /** Optional consent notice (LS-04). */
  notice?: ReactNode;
  /** Terms and privacy links; at least one is required (LS-04). */
  links: readonly AuthScreenPolicyLink[];
  /** Extra product content under the links. */
  children?: ReactNode;
}>;

/**
 * The `footer` slot content: consent notice plus dot-separated policy links. The
 * visible gap between links is `linkGap` + separator + `linkGap`; the 44pt touch
 * target comes from hitSlop, not visible padding (2026-10-17 user report: reduce the link gap).
 */
export function AuthScreenFooter({ notice, links, children }: AuthScreenFooterProps) {
  validateAuthScreenPolicyLinks(links);
  const recipe = authScreenRecipe.footer;
  // Height comes from a background-less minHeight (Android ignores hitSlop outside the parent row);
  // only the inline extension up to the separator uses hitSlop.
  const hitSlop = { left: recipe.linkGap, right: recipe.linkGap };
  return (
    <View style={{ width: "100%", alignItems: "center", gap: recipe.noticeGap }}>
      {notice ? <Text variant={recipe.notice.textVariant} tone={recipe.notice.tone}>{notice}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", columnGap: recipe.linkGap }}>
        {links.map((link, index) => (
          <Fragment key={`${index}:${link.label}`}>
            {index > 0 ? <Text variant={recipe.link.textVariant} tone={recipe.notice.tone} accessible={false} importantForAccessibility="no">{recipe.separator}</Text> : null}
            <Pressable accessibilityRole="link" accessibilityLabel={link.label} hitSlop={hitSlop} onPress={link.onPress}
              style={{ minHeight: authScreenRecipe.footerMinTouchTarget, justifyContent: "center" }}>
              <Text variant={recipe.link.textVariant} tone={recipe.link.tone} style={{ textDecorationLine: recipe.link.underline ? "underline" : "none" }}>{link.label}</Text>
            </Pressable>
          </Fragment>
        ))}
      </View>
      {children}
    </View>
  );
}

export { authScreenRecipe };
