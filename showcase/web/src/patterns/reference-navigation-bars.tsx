import "./reference-navigation-bars.css";
import { useState } from "react";
import { BottomNavigation } from "@hjmds/react/navigation";
import { Button, IconButton } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { HjmProvider } from "@hjmds/react/provider";
import { createLucideGlyph } from "@hjmds/react/icon-lucide";
import { House, Armchair, ShoppingBag, Power, Receipt, CreditCard, Settings, Calendar, ChartNoAxesCombined, Droplet, Plus, Search, Heart, User, Store, List, Tag, Grid2X2, Car, BatteryCharging, Link, MessageCircle, FileText } from "lucide-react";
import { navigationBarReferences, navigationBehaviorGroups, referenceNavigationPalette, type NavigationBarReference, type NavigationBehavior } from "../../../shared/navigation-bar-references";
const icons = { home: House, rooms: Armchair, bag: ShoppingBag, power: Power, receipt: Receipt, card: CreditCard, settings: Settings, calendar: Calendar, chart: ChartNoAxesCombined, drop: Droplet, plus: Plus, search: Search, heart: Heart, user: User, store: Store, list: List, tag: Tag, grid: Grid2X2, car: Car, battery: BatteryCharging, link: Link, message: MessageCircle, file: FileText };
const glyph = createLucideGlyph(icons);
export function ReferenceBar({ reference }: { reference: NavigationBarReference }) {
 const [selected, setSelected] = useState<string>(reference.id === "project" ? "1" : "0");
 const [actionCount, setActionCount] = useState(0);
 const action = "action" in reference ? reference.action : undefined;
 const ActionIcon = "actionIcon" in reference ? icons[reference.actionIcon] : Plus;
 const items = reference.items.map((label, index) => ({ id: String(index), label, icon: { name: reference.icons[index]! } }));
 // Preserve destination semantics, large-text expansion and focus in the existing
 // renderer; these studies compose it instead of cloning ten navigation engines.
 const palette = referenceNavigationPalette(reference);
 return <HjmProvider brandPalette={palette} className={`hjm-nav-study hjm-nav-study--${reference.id}`}><Stack gap="md">
  <Text variant="heading">{reference.title}</Text>
  <Text>{reference.source}에서 착안</Text>
  <BottomNavigation descriptor={{ accessibilityLabel: reference.title, selectedKey: selected, items }}
   configuration={{ presentation: reference.presentation, density: "compact", distribution: action && reference.presentation !== "capsule" ? "center-gap" : "equal" }}
   renderIcon={glyph} onActivate={event => setSelected(event.key)}
   getHref={item => `#${reference.id}-${item.id}`} style={{ position: "relative" }}
   primaryAction={action ? <IconButton label={action} tone="primary" size="large" shape="circle" onClick={() => setActionCount(count => count + 1)}><ActionIcon aria-hidden="true"/></IconButton> : undefined} />
  <Text role="status">{reference.items[Number(selected)]} 선택{action ? ` · ${action} ${actionCount}회` : ""}</Text>
 </Stack></HjmProvider>;
}
export function NavigationBehaviorPreview({ behavior }: { behavior: NavigationBehavior }) {
 const group = navigationBehaviorGroups.find(item => item.id === behavior)!;
 const options = navigationBarReferences.filter(item => (group.references as readonly string[]).includes(item.id));
 const [preset, setPreset] = useState<string>(options[0]!.id);
 const reference = options.find(item => item.id === preset) ?? options[0]!;
 return <Stack gap="md"><Text variant="heading">{group.title}</Text>
  {options.length > 1 && <Stack gap="sm">{options.map(item => <Button key={item.id} tone="secondary" selected={reference.id === item.id} onClick={() => setPreset(item.id)}>{item.source} 표현</Button>)}</Stack>}
  <ReferenceBar key={reference.id} reference={reference} />
 </Stack>;
}
export function ReferenceNavigationBars() { return <Stack gap="xl">{navigationBehaviorGroups.map(group => <NavigationBehaviorPreview key={group.id} behavior={group.id} />)}</Stack>; }
