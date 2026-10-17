import * as tokens from "@hjmds/design-contracts/tokens";
import { glyph, radius, spacing, stroke, withAlpha, type HeadingLevel, type TextVariant } from "@hjmds/design-contracts/tokens";
import { useHjmTheme } from "@hjmds/react/provider";
import { Heading } from "@hjmds/react/heading";
import { Container, Grid, Section, Stack, Surface, Text } from "@hjmds/react/layout";
import { colorPage, foundationPage, tokenSample, type FoundationGroup, type TokenPage, type TokenSpecimen } from "../../../shared/token-reference";

// Same page model and specimen mapping as showcase/native/src/token-reference-previews.tsx.
function TokenReferencePage({ page }: { page: TokenPage }) {
  return <Container size="content" gutter="none"><Stack gap="xl">
    <Stack gap="xs"><Heading level="level3" semanticLevel={1}>{page.title}</Heading><Text as="p" tone="muted">{page.description}</Text></Stack>
    {page.sections.map(section => <Section key={section.title} title={section.title} {...(section.description ? { description: section.description } : {})} headingLevel={2}>
      <Grid columns={section.columns} gap={{ compact: "md" }}>
        {section.items.map(item => <Surface key={item.name} padding="md" bordered><Stack gap="sm">
          <Specimen specimen={item.specimen} />
          <Stack gap="xxs"><Text emphasis="strong" fontRole="code" variant="label">{item.name}</Text><Text tone="muted" variant="caption">{item.value}</Text></Stack>
        </Stack></Surface>)}
      </Grid>
    </Section>)}
  </Stack></Container>;
}

function Specimen({ specimen }: { specimen: TokenSpecimen }) {
  const colors = useHjmTheme().palette.theme;
  const box = { width: glyph.xxxl, height: glyph.xxxl };
  switch (specimen.kind) {
    case "none": return null;
    case "swatch": return <div aria-hidden="true" style={{ height: glyph.xxxl, borderRadius: radius.sm, background: specimen.color, border: `${stroke.subtle}px solid ${colors.border}` }} />;
    case "textVariant": return <Text variant={specimen.variant as TextVariant}>{tokenSample.text}</Text>;
    case "heading": return <Heading level={specimen.level as HeadingLevel} semanticLevel={3}>{tokenSample.heading}</Heading>;
    case "text": return <Text emphasis="regular" {...(specimen.fontRole ? { fontRole: specimen.fontRole } : {})} style={{
      ...(specimen.fontWeight ? { fontWeight: specimen.fontWeight } : {}),
      ...(specimen.letterSpacing !== undefined ? { letterSpacing: specimen.letterSpacing } : {}),
      ...(specimen.numeric ? { fontVariantNumeric: specimen.numeric } : {}),
    }}>{specimen.numeric ? tokenSample.numeric : specimen.fontWeight ? tokenSample.short : tokenSample.text}</Text>;
    case "bar": return <div aria-hidden="true" style={{ width: specimen.length, height: spacing.xs, background: colors.primary }} />;
    case "ratio": return <div aria-hidden="true" style={{ height: spacing.xs, borderRadius: radius.full, background: colors.surfaceAlt }}><div style={{ width: `${specimen.fraction * 100}%`, height: "100%", borderRadius: radius.full, background: colors.primary }} /></div>;
    case "square": return <div aria-hidden="true" style={{ width: specimen.size, height: specimen.size, borderRadius: radius.sm, background: colors.primary }} />;
    case "height": return <div aria-hidden="true" style={{ height: specimen.height, borderRadius: radius.sm, background: colors.surfaceAccent, border: `${stroke.default}px solid ${colors.primary}` }} />;
    case "radius": return <div aria-hidden="true" style={{ ...box, borderRadius: specimen.radius, background: colors.surfaceAccent, border: `${stroke.strong}px solid ${colors.primary}` }} />;
    case "stroke": return <div aria-hidden="true" style={{ height: specimen.width, background: colors.borderControl }} />;
    case "shadow": return <div aria-hidden="true" style={{ height: glyph.xxxl, borderRadius: radius.md, background: colors.bg, boxShadow: `0 ${specimen.offsetY}px ${specimen.radius}px ${withAlpha(specimen.color, specimen.opacity)}` }} />;
    case "opacity": return <div aria-hidden="true" style={{ ...box, borderRadius: radius.sm, background: specimen.color ?? colors.primary, opacity: specimen.opacity }} />;
    case "layer": return <div aria-hidden="true" style={{ display: "flex" }}>{Array.from({ length: specimen.total }, (_, index) => <div key={index} style={{
      position: "relative", zIndex: index === specimen.rank ? specimen.total : index, width: spacing.xl, height: spacing.xl, marginInlineStart: index === 0 ? 0 : -spacing.xs, borderRadius: radius.sm,
      background: index === specimen.rank ? colors.primary : colors.surfaceAlt, border: `${stroke.subtle}px solid ${colors.bg}`,
    }} />)}</div>;
  }
}

export function FoundationValues({ group }: { group: FoundationGroup }) { return <TokenReferencePage page={foundationPage(tokens, group)} />; }
export function DimensionTokens({ kind }: { kind: "spacing" | "size" | "radius" }) { return <FoundationValues group={kind} />; }
export function MotionTokens() { return <FoundationValues group="motion" />; }
export function ColorTokens() { return <TokenReferencePage page={colorPage(tokens)} />; }
