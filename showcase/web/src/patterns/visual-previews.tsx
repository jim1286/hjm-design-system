import { TextTransition } from "@hjmds/react/content-transition";
import { visualCopy as copy } from "../../../shared/visual-foundations";
import { useState, type ReactNode } from "react";
import { Search, Settings, Bell, ArrowLeft } from "lucide-react";
import { createLucideGlyph } from "@hjmds/react/icon-lucide";
import { Icon, Avatar } from "@hjmds/react/display";
import { createBlobatarFallback } from "@hjmds/react/avatar-blobatar";
import { EffectSurface } from "@hjmds/react/effect-surface";
import { Button } from "@hjmds/react/actions";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { profileFaces } from "../../../shared/profile-studio";
const glyph = createLucideGlyph({ search: Search, settings: Settings, notifications: Bell, back: ArrowLeft });
function Frame({ children }: { children: ReactNode }) {
  return <Container gutter="compact"><Stack gap="xl">{children}</Stack></Container>;
}
// Small labels need normal text contrast over the moving glow; brand text fell below 4.5:1.
export function Effects() {
  const [active, setActive] = useState(false);
  return <Frame><Button selected={active} onClick={() => setActive(!active)}>{copy.motion}</Button>
    {([['mesh'], ['glow'], ['grain'], ['mesh', 'glow', 'grain']] as const).map(layers => <EffectSurface key={layers.join('-')} descriptor={{ layers, active, seed: "morning", intensity: 0.4 }}>
      <div style={{ padding: "var(--hjm-space-xxl)" }}><Stack gap="lg"><Text variant="label">{layers.join(' + ')}</Text><Heading level="level2">{copy.title}</Heading><Text>{copy.description}</Text><Button tone="secondary">{copy.action}</Button></Stack></div>
    </EffectSurface>)}
  </Frame>;
}
export function Icons() { return <Frame>{(['search','settings','notifications','back'] as const).map(name => <Stack key={name} axis="inline" gap="md" wrap align="center"><Icon name={name} size="lg" renderGlyph={glyph} /><Text>{name}</Text></Stack>)}</Frame>; }
export function Faces() { return <Frame><Heading level="level2">{copy.faces}</Heading><Text>{copy.faceHint}</Text>{profileFaces.map(face => <Stack key={face.seed} axis="inline" gap="md" wrap align="center"><Avatar name={face.label} size="xlarge" renderFallback={createBlobatarFallback({ seed: face.seed })}/><Avatar name={copy.happy(face.label)} size="xlarge" renderFallback={createBlobatarFallback({ seed: face.seed, expression: "happy" })}/><Text>{face.label}</Text></Stack>)}</Frame>; }
export function Transitions() {
  const [index, setIndex] = useState(0);
  return <Frame><Button onClick={() => setIndex((index + 1) % copy.scenes.length)}>{copy.nextScene}</Button>{(['fade', 'rise', 'slide', 'scale'] as const).map(preset => <Stack key={preset} gap="md"><Text variant="label">{preset}</Text><TextTransition preset={preset} text={copy.scenes[index]!} /></Stack>)}</Frame>;
}
