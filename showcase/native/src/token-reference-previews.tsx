import * as tokens from "@hjmds/design-contracts/tokens";
import { glyph, radius, spacing, stroke, type HeadingLevel, type TextVariant } from "@hjmds/design-contracts/tokens";
import { ScrollView, View, type TextStyle } from "react-native";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { Heading } from "@hjmds/react-native/heading";
import { Container, Grid, Section, Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { colorPage, foundationPage, tokenSample, type FoundationGroup, type TokenPage, type TokenSpecimen } from "../../shared/token-reference";

// Same page model and specimen mapping as showcase/web/src/foundations/token-reference-previews.tsx.
function TokenReferencePage({ page }: { page: TokenPage }) {
  return <ScrollView><Container size="content" gutter="none"><Stack gap="xl">
    <Stack gap="xs"><Heading level="level3" semanticLevel={1}>{page.title}</Heading><Text tone="muted">{page.description}</Text></Stack>
    {page.sections.map(section => <Section key={section.title} title={section.title} {...(section.description ? { description: section.description } : {})}>
      <Grid columns={section.columns} gap={{ compact: "md" }}>
        {section.items.map(item => <Surface key={item.name} padding="md" bordered><Stack gap="sm">
          <Specimen specimen={item.specimen} />
          <Stack gap="xxs"><Text emphasis="strong" fontRole="code" variant="label">{item.name}</Text><Text tone="muted" variant="caption">{item.value}</Text></Stack>
        </Stack></Surface>)}
      </Grid>
    </Section>)}
  </Stack></Container></ScrollView>;
}

function Specimen({ specimen }: { specimen: TokenSpecimen }) {
  const { colors } = useHjmNativeTheme();
  const box = { width: glyph.xxxl, height: glyph.xxxl };
  switch (specimen.kind) {
    case "none": return null;
    case "swatch": return <View accessible={false} style={{ height: glyph.xxxl, borderRadius: radius.sm, backgroundColor: specimen.color, borderWidth: stroke.subtle, borderColor: colors.border }} />;
    case "textVariant": return <Text variant={specimen.variant as TextVariant}>{tokenSample.text}</Text>;
    case "heading": return <Heading level={specimen.level as HeadingLevel} semanticLevel={3}>{tokenSample.heading}</Heading>;
    case "text": return <Text emphasis="regular" {...(specimen.fontRole ? { fontRole: specimen.fontRole } : {})} style={{
      ...(specimen.fontWeight ? { fontWeight: specimen.fontWeight as TextStyle["fontWeight"] } : {}),
      ...(specimen.letterSpacing !== undefined ? { letterSpacing: specimen.letterSpacing } : {}),
      ...(specimen.numeric ? { fontVariant: [specimen.numeric as Extract<NonNullable<TextStyle["fontVariant"]>, readonly unknown[]>[number]] } : {}),
    }}>{specimen.numeric ? tokenSample.numeric : specimen.fontWeight ? tokenSample.short : tokenSample.text}</Text>;
    case "bar": return <View accessible={false} style={{ width: specimen.length, height: spacing.xs, backgroundColor: colors.primary }} />;
    case "ratio": return <View accessible={false} style={{ height: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: "hidden" }}><View style={{ width: `${specimen.fraction * 100}%`, height: "100%", borderRadius: radius.full, backgroundColor: colors.primary }} /></View>;
    case "square": return <View accessible={false} style={{ width: specimen.size, height: specimen.size, borderRadius: radius.sm, backgroundColor: colors.primary }} />;
    case "height": return <View accessible={false} style={{ height: specimen.height, borderRadius: radius.sm, backgroundColor: colors.surfaceAccent, borderWidth: stroke.default, borderColor: colors.primary }} />;
    case "radius": return <View accessible={false} style={{ ...box, borderRadius: specimen.radius, backgroundColor: colors.surfaceAccent, borderWidth: stroke.strong, borderColor: colors.primary }} />;
    case "stroke": return <View accessible={false} style={{ height: specimen.width, backgroundColor: colors.borderControl }} />;
    case "shadow": return <View accessible={false} style={{ height: glyph.xxxl, borderRadius: radius.md, backgroundColor: colors.bg, shadowColor: specimen.color, shadowOpacity: specimen.opacity, shadowRadius: specimen.radius, shadowOffset: { width: 0, height: specimen.offsetY } }} />;
    case "opacity": return <View accessible={false} style={{ ...box, borderRadius: radius.sm, backgroundColor: specimen.color ?? colors.primary, opacity: specimen.opacity }} />;
    case "layer": return <View accessible={false} style={{ flexDirection: "row" }}>{Array.from({ length: specimen.total }, (_, index) => <View key={index} style={{
      zIndex: index === specimen.rank ? specimen.total : index, width: spacing.xl, height: spacing.xl, marginStart: index === 0 ? 0 : -spacing.xs, borderRadius: radius.sm,
      backgroundColor: index === specimen.rank ? colors.primary : colors.surfaceAlt, borderWidth: stroke.subtle, borderColor: colors.bg,
    }} />)}</View>;
  }
}

export function FoundationValues({ group }: { group: FoundationGroup }) { return <TokenReferencePage page={foundationPage(tokens, group)} />; }
export function DimensionTokens({ kind }: { kind: "spacing" | "size" | "radius" }) { return <FoundationValues group={kind} />; }
export function MotionTokens() { return <FoundationValues group="motion" />; }
export function TypographyTokens() { return <FoundationValues group="typography" />; }
export function ColorTokens() { return <TokenReferencePage page={colorPage(tokens)} />; }
