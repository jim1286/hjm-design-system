import { Heading } from "@hjmds/react/heading";
import { useEffect, useId, useState } from "react";
import { BottomNavigation } from "@hjmds/react/navigation";
import { IconButton } from "@hjmds/react/actions";
import { SegmentedControl } from "@hjmds/react/selection";
import { Stack, Text } from "@hjmds/react/layout";
import { Card } from "@hjmds/react/display";
import { HjmProvider } from "@hjmds/react/provider";
import { createLucideGlyph } from "@hjmds/react/icon-lucide";
import { House, Armchair, ShoppingBag, Power, Receipt, CreditCard, Settings, Calendar, ChartNoAxesCombined, Droplet, Plus, Search, Heart, User, Store, List, Tag, Grid2X2, Car, BatteryCharging, Link, MessageCircle, FileText } from "lucide-react";
import { navigationBarReferences, navigationBehaviorGroups, referenceNavigationPalette, type NavigationBarReference, type NavigationBehavior } from "../../../shared/navigation-bar-references.js";
const icons = { home: House, rooms: Armchair, bag: ShoppingBag, power: Power, receipt: Receipt, card: CreditCard, settings: Settings, calendar: Calendar, chart: ChartNoAxesCombined, drop: Droplet, plus: Plus, search: Search, heart: Heart, user: User, store: Store, list: List, tag: Tag, grid: Grid2X2, car: Car, battery: BatteryCharging, link: Link, message: MessageCircle, file: FileText };
const glyph = createLucideGlyph(icons);
export function ReferenceBar({ reference }: { reference: NavigationBarReference }) {
 const [selected, setSelected] = useState<string>(reference.id === "project" ? "1" : "0");
 const instanceId = useId();
 const fragmentPrefix = `${instanceId}-${reference.id}-`;
 const [actionCount, setActionCount] = useState(0);
 const action = "action" in reference ? reference.action : undefined;
 const ActionIcon = "actionIcon" in reference ? icons[reference.actionIcon] : Plus;
 const items = reference.items.map((label, index) => ({ id: String(index), label, icon: { name: reference.icons[index]! } }));
 // Preserve destination semantics and focus in the existing
 // renderer; these studies compose it instead of cloning ten navigation engines.
 // Showcase-only placement: the real product navigation stays fixed to its viewport.
 // layoutStyle deliberately excludes position; this does not override recipe appearance.
 useEffect(() => {
  const initialFragment = location.hash;
  let visited = false;
  const route = () => {
   let fragment: string;
   try { fragment = decodeURIComponent(location.hash.slice(1)); } catch { return; }
   const key = fragment.startsWith(fragmentPrefix) ? fragment.slice(fragmentPrefix.length) : undefined;
   if (key !== undefined && reference.items.some((_, index) => String(index) === key)) {
    visited = true; setSelected(key);
   } else if (visited && location.hash === initialFragment) {
    setSelected(reference.id === "project" ? "1" : "0");
   }
  };
  // The gallery uses local fragments, not a product router. Scope them per mounted
  // preview and consume browser history so the highlighted destination matches its URL.
  route(); window.addEventListener("hashchange", route);
  return () => window.removeEventListener("hashchange", route);
 }, [fragmentPrefix, reference]);
 const palette = referenceNavigationPalette(reference);
 return <HjmProvider brandPalette={palette} host="contents"><Card headingLevel={4} title={reference.title} description={`${reference.source}에서 착안`}><Stack gap="md">
  <BottomNavigation descriptor={{ accessibilityLabel: reference.title, selectedKey: selected, items }}
   configuration={{ presentation: reference.presentation, selection: reference.id === "project" || reference.id === "plank" ? "tile" : "emphasis", ...(reference.id === "plank" ? { surface: "raised" as const } : {}), density: "compact", distribution: action && reference.presentation !== "capsule" ? "center-gap" : "equal" }}
   renderIcon={glyph} onActivate={event => setSelected(event.key)}
   getHref={item => `#${encodeURIComponent(`${fragmentPrefix}${item.id}`)}`} style={{ position: "relative" }}
   primaryAction={action ? <IconButton label={action} tone="primary" size="large" shape="circle" onClick={() => setActionCount(count => count + 1)}><ActionIcon aria-hidden="true"/></IconButton> : undefined} />
  <Text role="status">{reference.items[Number(selected)]} 선택{action ? ` · ${action} ${actionCount}회` : ""}</Text>
 </Stack></Card></HjmProvider>;
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
