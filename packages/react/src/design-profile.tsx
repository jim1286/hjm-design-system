import { useState, type ReactNode } from "react";
import { ScreenLayout, type ScreenLayoutProps } from "./screens.js";
import { Collapsible } from "./collapsible.js";
import { EffectSurface } from "./effect-surface.js";
import { Grid, Stack, Surface } from "./layout.js";
import { useHjmTheme } from "./provider.js";
import { resolveDesignProfileCollection } from "@hjmds/design-contracts/design-profile-layout";
import type { HjmDesignProfile } from "@hjmds/design-contracts/design-profile";

export type OverviewScreenProps = Omit<ScreenLayoutProps, "children"> & Readonly<{
  items: readonly Readonly<{ id: string; children: ReactNode }>[];
  toolbar?: ReactNode;
  toolbarLabel: string;
  collection?: HjmDesignProfile["compositions"]["collection"];
  toolbarPresentation?: HjmDesignProfile["compositions"]["toolbar"];
}>;

/** Optional collection screen; ScreenLayout still owns loading/error/scrolling.
 * Unlike settings/inbox it owns a profile-selected collection and persistent tools.
 * It never owns product mutations or chooses a different component for each theme. */
export function OverviewScreen({ items, toolbar, toolbarLabel, collection: suppliedCollection, toolbarPresentation: suppliedToolbarPresentation, ...screen }: OverviewScreenProps) {
  const { designProfile } = useHjmTheme();
  const collection = suppliedCollection ?? designProfile?.compositions.collection ?? "rows";
  const toolbarPresentation = suppliedToolbarPresentation ?? designProfile?.compositions.toolbar ?? "inline";
  const [toolsOpen, setToolsOpen] = useState(true);
  if (!toolbarLabel.trim()) throw new TypeError("Overview tools need a localized label");
  const ids = new Set(items.map(item => item.id));
  if (ids.size !== items.length || items.some(item => !item.id.trim())) throw new TypeError("Overview items need unique stable ids");
  // Retain the same effect/grid/surface subtree when the profile changes: optional
  // decoration can disappear without remounting fields, focus or local state.
  const canvas = designProfile?.material.canvas ?? { layers: ["mesh"] as const, intensity: 0, active: false };
  return <EffectSurface descriptor={canvas} layoutStyle={{ width: "100%" }}>
    <ScreenLayout {...screen}>
      <Stack gap="xl">
        {toolbar ? <Collapsible trigger={toolbarLabel} open={toolsOpen} onOpenChange={setToolsOpen} presentation={toolbarPresentation === "inline" ? "inline" : "disclosure"} keepMounted>{toolbar}</Collapsible> : null}
        <Grid {...resolveDesignProfileCollection(collection)}>
          {items.map(item => <Surface key={item.id} padding={collection === "rows" ? "md" : "xl"} tone={collection === "rows" ? "default" : "raised"} bordered radius="lg"><EffectSurface descriptor={designProfile?.material.card ?? { layers: ["mesh"], intensity: 0, active: false }} className="hjm-profile-card-effect">{item.children}</EffectSurface></Surface>)}
        </Grid>
      </Stack>
    </ScreenLayout>
  </EffectSurface>;
}
