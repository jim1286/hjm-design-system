import { Heading } from "@hjmds/react-native/heading";
import { TextTransition } from "@hjmds/react-native/content-transition";
import { visualCopy as copy } from "../../shared/visual-foundations";
import { useState, type ReactNode } from "react";
import { View, ScrollView } from "react-native";
import { Search, Settings, Bell, ArrowLeft } from "lucide-react-native";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { Container, Icon, Stack, Text } from "@hjmds/react-native/primitives";
import { Avatar } from "@hjmds/react-native/data-display";
import { createBlobatarFallback } from "@hjmds/react-native/avatar-blobatar";
import { EffectSurface } from "@hjmds/react-native/effect-surface";
import { Button } from "@hjmds/react-native/actions";
import { spacing } from "@hjmds/design-contracts/foundations";
import { profileFaces } from "../../shared/profile-studio";
const glyph = createLucideGlyph({ search: Search, settings: Settings, notifications: Bell, back: ArrowLeft });
function Frame({ children }: { children: ReactNode }) {
  return <ScrollView contentContainerStyle={{ paddingVertical: spacing.md }}><Container gutter="compact"><Stack gap="xl">{children}</Stack></Container></ScrollView>;
}
// Small labels need normal text contrast over the moving glow; brand text fell below 4.5:1.
export function Effects() {
  const [active, setActive] = useState(false);
  return <Frame><Button selected={active} onPress={() => setActive(!active)}>{copy.motion}</Button>
    {([['mesh'], ['glow'], ['grain'], ['mesh', 'glow', 'grain']] as const).map(layers => <EffectSurface key={layers.join('-')} descriptor={{ layers, active, seed: "morning", intensity: 0.4 }}>
      <View style={{ padding: spacing.xxl }}><Stack gap="lg"><Text variant="label">{layers.join(' + ')}</Text><Heading level="level2">{copy.title}</Heading><Text>{copy.description}</Text><Button tone="secondary">{copy.action}</Button></Stack></View>
    </EffectSurface>)}
  </Frame>;
}
export function Icons() { return <Frame>{(['search','settings','notifications','back'] as const).map(name => <Stack key={name} axis="inline" gap="md" wrap align="center"><Icon descriptor={{ name, size: "lg" }} renderGlyph={glyph} /><Text>{name}</Text></Stack>)}</Frame>; }
export function Faces() { return <Frame><Heading level="level2">{copy.faces}</Heading><Text>{copy.faceHint}</Text>{profileFaces.map(face => <Stack key={face.seed} axis="inline" gap="md" wrap align="center"><Avatar name={face.label} accessibilityLabel={face.label} size={64} renderFallback={createBlobatarFallback({ seed: face.seed })}/><Avatar name={face.label} accessibilityLabel={copy.happy(face.label)} size={64} renderFallback={createBlobatarFallback({ seed: face.seed, expression: "happy" })}/><Text>{face.label}</Text></Stack>)}</Frame>; }
export function Transitions() {
  const [index, setIndex] = useState(0);
  return <Frame><Button onPress={() => setIndex((index + 1) % copy.scenes.length)}>{copy.nextScene}</Button>{(['fade', 'rise', 'slide', 'scale'] as const).map(preset => <Stack key={preset} gap="md"><Text variant="label">{preset}</Text><TextTransition preset={preset} text={copy.scenes[index]!} /></Stack>)}</Frame>;
}
