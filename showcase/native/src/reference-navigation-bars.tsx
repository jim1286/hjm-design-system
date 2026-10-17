import { Heading } from "@hjmds/react-native/heading";
import { useState } from "react";
import { PatternStatus } from "./pattern-status";
import { BottomNavigation } from "@hjmds/react-native/navigation";
import { IconButton } from "@hjmds/react-native/actions";
import { SegmentedControl } from "@hjmds/react-native/inputs";
import { Stack } from "@hjmds/react-native/primitives";
import { Card } from "@hjmds/react-native/data-display";
import { HjmNativeProvider, useHjmNativeTheme } from "@hjmds/react-native/provider";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { House, Armchair, ShoppingBag, Power, Receipt, CreditCard, Settings, Calendar, ChartNoAxesCombined, Droplet, Plus, Search, Heart, User, Store, List, Tag, Grid2X2, Car, BatteryCharging, Link, MessageCircle, FileText } from "lucide-react-native";
import { navigationBarReferences, navigationBehaviorGroups, referenceNavigationPalette, type NavigationBarReference, type NavigationBehavior } from "../../shared/navigation-bar-references";
const icons = { home: House, rooms: Armchair, bag: ShoppingBag, power: Power, receipt: Receipt, card: CreditCard, settings: Settings, calendar: Calendar, chart: ChartNoAxesCombined, drop: Droplet, plus: Plus, search: Search, heart: Heart, user: User, store: Store, list: List, tag: Tag, grid: Grid2X2, car: Car, battery: BatteryCharging, link: Link, message: MessageCircle, file: FileText };
const glyph = createLucideGlyph(icons);
function ActionGlyph({ name }: { name: keyof typeof icons }) {
 const { colors } = useHjmNativeTheme();
 const Glyph = icons[name];
 return <Glyph accessible={false} color={colors.onPrimary} />;
}
export function ReferenceBar({ reference }: { reference: NavigationBarReference }) {
 const [selected, setSelected] = useState<string>(reference.id === "project" ? "1" : "0");
 const [actionCount, setActionCount] = useState(0);
 const action = "action" in reference ? reference.action : undefined;

 const items = reference.items.map((label, index) => ({ id: String(index), label, icon: { name: reference.icons[index]! } }));
 // Preserve destination semantics and focus in the existing
 // renderer; these studies compose it instead of cloning ten navigation engines.
 const palette = referenceNavigationPalette(reference);
 return <HjmNativeProvider brandPalette={palette}><Card title={reference.title} description={`${reference.source}에서 착안`}><Stack gap="md">
  <BottomNavigation descriptor={{ accessibilityLabel: reference.title, selectedKey: selected, items }}
   configuration={{ presentation: reference.presentation, selection: reference.id === "project" || reference.id === "plank" ? "tile" : "emphasis", ...(reference.id === "plank" ? { surface: "raised" as const } : {}), density: "compact", distribution: action && reference.presentation !== "capsule" ? "center-gap" : "equal" }}
   renderIcon={glyph} onActivate={event => setSelected(event.key)}

   primaryAction={action ? <IconButton label={action} tone="primary" size="large" shape="circle" onPress={() => setActionCount(count => count + 1)}><ActionGlyph name={"actionIcon" in reference ? reference.actionIcon : "plus"}/></IconButton> : undefined} />
  <PatternStatus>{`${reference.items[Number(selected)]} 선택${action ? ` · ${action} ${actionCount}회` : ""}`}</PatternStatus>
 </Stack></Card></HjmNativeProvider>;
}
export function NavigationBehaviorPreview({ behavior }: { behavior: NavigationBehavior }) {
 const group = navigationBehaviorGroups.find(item => item.id === behavior)!;
 const options = navigationBarReferences.filter(item => (group.references as readonly string[]).includes(item.id));
 const [preset, setPreset] = useState<string>(options[0]!.id);
 const reference = options.find(item => item.id === preset) ?? options[0]!;
 return <Stack gap="md"><Heading level="level4" semanticLevel={3}>{group.title}</Heading>
  {/* 2026-10-16 assembly rule (SELECTION.md 조립 규칙): picking one reference is a single-choice control, not a row of selected Buttons. */}
  {options.length > 1 && <SegmentedControl label={`${group.title} 참고 표현`} items={options.map(item => ({ value: item.id, label: item.source }))} value={reference.id} onValueChange={setPreset} />}
  <ReferenceBar key={reference.id} reference={reference} />
 </Stack>;
}
export function ReferenceNavigationBars() { return <Stack gap="xl">{navigationBehaviorGroups.map(group => <NavigationBehaviorPreview key={group.id} behavior={group.id} />)}</Stack>; }
