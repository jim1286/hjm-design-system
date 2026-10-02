import { TextTransition } from "@hjmds/react-native/content-transition";
import { visualCopy as copy } from "../../shared/visual-foundations";
import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Search, Settings, Bell, ArrowLeft } from "lucide-react-native";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { Icon, Text } from "@hjmds/react-native/primitives";
import { Avatar } from "@hjmds/react-native/data-display";
import { createBlobatarFallback } from "@hjmds/react-native/avatar-blobatar";
import { EffectSurface } from "@hjmds/react-native/effect-surface";
import { Button } from "@hjmds/react-native/actions";
import { spacing } from "@hjmds/design-contracts/foundations";
import { profileFaces } from "../../shared/profile-studio";
const glyph = createLucideGlyph({ search: Search, settings: Settings, notifications: Bell, back: ArrowLeft });
// Small labels need normal text contrast over the moving glow; brand text fell below 4.5:1.
export function Effects() {
  const [active, setActive] = useState(false);
  return <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}><Button selected={active} onPress={() => setActive(!active)}>{copy.motion}</Button>
    {([['mesh'], ['glow'], ['grain'], ['mesh', 'glow', 'grain']] as const).map(layers => <EffectSurface key={layers.join('-')} descriptor={{ layers, active, seed: "morning", intensity: 0.4 }}>
      <View style={{ padding: spacing.xxl, gap: spacing.lg }}><Text variant="label">{layers.join(' + ')}</Text><Text variant="heading">{copy.title}</Text><Text>{copy.description}</Text><Button tone="secondary">{copy.action}</Button></View>
    </EffectSurface>)}
  </ScrollView>;
}
export function Icons() { return <View style={{ padding: spacing.xl, gap: spacing.xl }}>{(['search','settings','notifications','back'] as const).map(name => <View key={name} style={{ flexDirection: 'row', gap: spacing.md }}><Icon descriptor={{ name, size: "lg" }} renderGlyph={glyph} /><Text>{name}</Text></View>)}</View>; }
export function Faces() { return <View style={{ padding: spacing.xl, gap: spacing.xl }}><Text variant="heading">{copy.faces}</Text>{profileFaces.map(face => <View key={face.seed} style={{ flexDirection: 'row', gap: spacing.md }}><Avatar name={face.label} accessibilityLabel={face.label} size={64} renderFallback={createBlobatarFallback({ seed: face.seed })}/><Avatar name={face.label} accessibilityLabel={copy.happy(face.label)} size={64} renderFallback={createBlobatarFallback({ seed: face.seed, expression: "happy" })}/><Text>{face.label}</Text></View>)}</View>; }
export function Transitions() {
  const [index, setIndex] = useState(0);
  return <View style={{ padding: spacing.xl, gap: spacing.xl }}><Button onPress={() => setIndex((index + 1) % copy.scenes.length)}>{copy.nextScene}</Button>{(['fade', 'rise', 'slide', 'scale'] as const).map(preset => <View key={preset} style={{ gap: spacing.md }}><Text variant="label">{preset}</Text><TextTransition preset={preset} text={copy.scenes[index]!} /></View>)}</View>;
}
