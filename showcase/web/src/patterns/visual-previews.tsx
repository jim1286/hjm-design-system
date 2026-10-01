import { TextTransition } from "@hjmds/react/content-transition";
import { visualCopy as copy } from "../../../shared/visual-foundations";
import { useState } from "react";
import { Search, Settings, Bell, ArrowLeft } from "lucide-react";
import { createLucideGlyph } from "@hjmds/react/icon-lucide";
import { Icon, Avatar } from "@hjmds/react/display";
import { createBlobatarFallback } from "@hjmds/react/avatar-blobatar";
import { EffectSurface } from "@hjmds/react/effect-surface";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { profileFaces } from "../../../shared/profile-studio";
const glyph = createLucideGlyph({ search: Search, settings: Settings, notifications: Bell, back: ArrowLeft });
// Small labels need normal text contrast over the moving glow; brand text fell below 4.5:1.
export function Effects() {
  const [active, setActive] = useState(false);
  return <Stack gap="xl"><Button selected={active} onClick={() => setActive(!active)}>{copy.motion}</Button>
    {([['mesh'], ['glow'], ['grain'], ['mesh', 'glow', 'grain']] as const).map(layers => <EffectSurface key={layers.join('-')} descriptor={{ layers, active, seed: "morning", intensity: 0.4 }}>
      <div style={{ padding: "var(--hjm-space-xxxl)", display: "grid", gap: "var(--hjm-space-lg)" }}><Text variant="label">{layers.join(' + ')}</Text><Heading level="level2">{copy.title}</Heading><Text>{copy.description}</Text><Button tone="secondary">{copy.action}</Button></div>
    </EffectSurface>)}
  </Stack>;
}
export function Icons() { return <Stack gap="xl">{(['search','settings','notifications','back'] as const).map(name => <Stack key={name} axis="inline" gap="md"><Icon name={name} size="lg" renderGlyph={glyph} /><Text>{name}</Text></Stack>)}</Stack>; }
export function Faces() { return <Stack gap="xl"><Heading level="level2">{copy.faces}</Heading><Text>{copy.faceHint}</Text>{profileFaces.map(face => <Stack key={face.seed} axis="inline" gap="md"><Avatar name={face.label} size="large" renderFallback={createBlobatarFallback({ seed: face.seed })}/><Avatar name={copy.happy(face.label)} size="large" renderFallback={createBlobatarFallback({ seed: face.seed, expression: "happy" })}/><Text>{face.label}</Text></Stack>)}</Stack>; }
export function Transitions() {
  const [index, setIndex] = useState(0);
  return <Stack gap="xl"><Button onClick={() => setIndex((index + 1) % copy.scenes.length)}>{copy.nextScene}</Button>{(['fade', 'rise', 'slide', 'scale'] as const).map(preset => <Stack key={preset} gap="md"><Text variant="label">{preset}</Text><TextTransition preset={preset} text={copy.scenes[index]!} /></Stack>)}</Stack>;
}
