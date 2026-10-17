import { useState, type ReactNode } from "react";
import { ScreenLayout, type ScreenLayoutProps } from "./screens.js";
import { Collapsible } from "./collapsible.js";
import { EffectSurface } from "./effect-surface.js";
import { Grid, Stack, Surface } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { resolveDesignProfileCollection, resolveDesignProfileCollectionItem, overviewContentLayout } from "@hjmds/design-contracts/design-profile-layout";
import { Divider } from "./data-display.js";
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
  const { designProfile } = useHjmNativeTheme();
  const collection = suppliedCollection ?? designProfile?.compositions.collection ?? "rows";
  const toolbarPresentation = suppliedToolbarPresentation ?? designProfile?.compositions.toolbar ?? "inline";
  const [toolsOpen, setToolsOpen] = useState(true);
  if (!toolbarLabel.trim()) throw new TypeError("Overview tools need a localized label");
  const ids = new Set(items.map(item => item.id));
  if (ids.size !== items.length || items.some(item => !item.id.trim())) throw new TypeError("Overview items need unique stable ids");
  // Retain the same effect/grid/surface subtree when the profile changes: optional
  // decoration can disappear without remounting fields, focus or local state.
  const itemLayout = resolveDesignProfileCollectionItem(collection);
  const canvas = designProfile?.material.canvas ?? { layers: ["mesh"] as const, intensity: 0, active: false };
  return <EffectSurface descriptor={canvas} radius="none" style={{ flex: 1 }}>
    <ScreenLayout {...screen}>
      {/* Tools and collection share one bounded column, so card edges line up with the field above them. */}
      <Stack gap="xl" layoutStyle={overviewContentLayout}>
        {toolbar ? <Collapsible trigger={toolbarLabel} open={toolsOpen} onOpenChange={setToolsOpen} presentation={toolbarPresentation === "inline" ? "inline" : "disclosure"} keepMounted>{toolbar}</Collapsible> : null}
        <Grid {...resolveDesignProfileCollection(collection)}>
          {/* The card Surface owns the rounded frame; the material layer sits in its padded content box, so a rounded
              effect clipped the first glyph of edge-aligned text (clay/glass, 2026-10-17 after EffectSurface radius default lg).
              The rule slot stays in place (null when unused) so switching collections never remounts item content. */}
          {items.map((item, index) => <Surface key={item.id} padding={itemLayout.padding} tone={itemLayout.tone} bordered={itemLayout.bordered} radius="lg">
            {itemLayout.ruled && index > 0 ? <Divider layoutStyle={{ marginBottom: itemLayout.ruleGap }} /> : null}
            <EffectSurface radius="none" descriptor={designProfile?.material.card ?? { layers: ["mesh"], intensity: 0, active: false }} style={{ backgroundColor: "transparent" }}>{item.children}</EffectSurface>
          </Surface>)}
        </Grid>
      </Stack>
    </ScreenLayout>
  </EffectSurface>;
}
