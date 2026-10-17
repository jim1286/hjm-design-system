import { TextTransition } from "@hjmds/react/content-transition";
import { visualCopy as copy } from "../../../shared/visual-foundations";
import { useState } from "react";
import { Search, Settings, Bell, ArrowLeft } from "lucide-react";
import { createLucideGlyph } from "@hjmds/react/icon-lucide";
import { Icon, Avatar } from "@hjmds/react/display";
import { createBlobatarFallback } from "@hjmds/react/avatar-blobatar";
import { EffectSurface } from "@hjmds/react/effect-surface";
import { Button } from "@hjmds/react/actions";
// 2026-10-16 assembly rule (SELECTION.md 조립 규칙): turning background motion on/off is a Switch.
import { Switch } from "@hjmds/react/selection";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { PreviewTools, PreviewToolButton } from "./preview-tools";
import { profileFaces } from "../../../shared/profile-studio";
const glyph = createLucideGlyph({ search: Search, settings: Settings, notifications: Bell, back: ArrowLeft });
// Small labels need normal text contrast over the moving glow; brand text fell below 4.5:1.
export function Effects() {
  const [active, setActive] = useState(false);
  return <Container size="reading"><Stack gap="xl"><Switch presentation="row" label={copy.motion} checked={active} onCheckedChange={setActive} />
    {copy.effectSamples.map(({ layers, label }) => <EffectSurface key={label} descriptor={{ layers, active, seed: "morning", intensity: 0.4 }}>
      <div style={{ padding: "var(--hjm-space-xxl)" }}><Stack gap="lg" align="start"><Text variant="label">{label}</Text><Heading level="level2">{copy.title}</Heading><Text>{copy.description}</Text><Button tone="secondary">{copy.action}</Button></Stack></div>
    </EffectSurface>)}
  </Stack></Container>;
}
export function Icons() { return <Container size="reading"><Stack gap="xl">{copy.icons.map(({ name, label }) => <Stack key={name} axis="inline" gap="md" wrap align="center"><Icon name={name} size="lg" renderGlyph={glyph} /><Stack gap="xxs"><Text>{label}</Text><Text variant="caption" tone="muted"><code>{name}</code></Text></Stack></Stack>)}</Stack></Container>; }
export function Faces() { return <Container size="reading"><Stack gap="xl"><Heading level="level2">{copy.faces}</Heading><Text>{copy.faceHint}</Text>{profileFaces.map(face => <Stack key={face.seed} axis="inline" gap="md" wrap align="center"><Avatar name={face.label} size="xlarge" renderFallback={createBlobatarFallback({ seed: face.seed })}/><Avatar name={copy.happy(face.label)} size="xlarge" renderFallback={createBlobatarFallback({ seed: face.seed, expression: "happy" })}/><Text>{face.label}</Text></Stack>)}</Stack></Container>; }
export function Transitions() {
  const [index, setIndex] = useState(0);
  return <Container size="reading"><Stack gap="xl">{copy.transitions.map(({ preset, label }) => <Stack key={preset} gap="md"><Text variant="label">{label}</Text><TextTransition preset={preset} text={copy.scenes[index]!} /></Stack>)}<PreviewTools><PreviewToolButton onClick={() => setIndex((index + 1) % copy.scenes.length)}>{copy.nextScene}</PreviewToolButton></PreviewTools></Stack></Container>;
}
