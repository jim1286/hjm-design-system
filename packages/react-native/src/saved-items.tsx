import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { ListDetailScreen, type ListDetailScreenProps } from "./screen-flows.js";
import { Stack, Text, Grid } from "./primitives.js";
import { IconButton } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
import { spacing } from "@hjmds/design-contracts/foundations";

import { resolveSavedItems, type SavedItem, type SavedCollection, type SavedItemsLabels } from "@hjmds/design-contracts/screen-patterns";
export type { SavedItem, SavedCollection, SavedItemsLabels } from "@hjmds/design-contracts/screen-patterns";
export type SavedItemsScreenProps<T extends SavedItem> = Omit<ListDetailScreenProps, "list" | "detail" | "back" | "refresh" | "loadMore"> & {
  items: readonly T[]; collections: readonly SavedCollection[];
  /** Omitted shows collections; null selects all saved items. */
  collectionId?: string | null; selectedItemId?: string | null;
  labels: SavedItemsLabels;
  onOpenCollection(id: string | null): void; onOpenItem(id: string): void;
  onBack(): void; onCreateCollection(): void;
  /** Same contract as Web: required IconButton glyph named by `labels.createCollection` (2026-10-17 icon-button usage rule). */
  createCollectionIcon: ReactNode;
  renderThumbnail(item: T): ReactNode; renderDetail(item: T): ReactNode;
};

/** Same controlled collection contract as Web, composed with the native screen and grid hosts. */
export function SavedItemsScreen<T extends SavedItem>({items,collections,collectionId,selectedItemId,labels,onOpenCollection,onOpenItem,onBack,onCreateCollection,createCollectionIcon,renderThumbnail,renderDetail,...screen}:SavedItemsScreenProps<T>) {
  const {colors,tokens}=useHjmNativeTheme();
  const {home,collection,visible,selected}=resolveSavedItems(items,collections,collectionId,selectedItemId);
  const groups=[{id:null,title:labels.allItems,itemIds:items.map(item=>item.id)},...collections];
  // Empty is a full body state, not a short text row at the top of the grid.
  const state=(screen.state?.kind??"ready")==="ready"&&!home&&!visible.length
    ? {kind:"empty" as const,title:labels.empty} : screen.state??{kind:"ready" as const};
  // Resolve each cover once; four thumbnails must not each rescan membership.
  const covers=new Map(groups.map(group=>{const ids=new Set(group.itemIds);return [group.id,items.filter(item=>ids.has(item.id)).slice(0,4)] as const;}));
  return <ListDetailScreen {...screen} state={state} title={home?screen.title:collection?.title??labels.allItems}
    {...(home?(screen.exit?{exit:screen.exit}:{}):{exit:{kind:"back" as const,label:labels.back,onPress:onBack}})}
    actions={home?<IconButton label={labels.createCollection} tone="ghost" edge="end" onPress={onCreateCollection}>{createCollectionIcon}</IconButton>:screen.actions}
    back={{label:labels.back,onAction:onBack}}
    {...(selected?{detail:{title:selected.title,content:renderDetail(selected)}}:{})}
    list={<Stack gap="md">
      {home?<><Text variant="caption" tone="muted">{labels.privateNotice}</Text><Grid columns={{compact:2}} gap={{compact:"md"}} minColumnWidth={{compact:80}}>
        {groups.map(group=><Pressable key={group.id===null?"all":`collection:${group.id}`} accessibilityRole="button" accessibilityLabel={group.title} onPress={()=>onOpenCollection(group.id)} style={{gap:spacing.sm}}>
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{aspectRatio:1,borderRadius:tokens.radius.md,overflow:"hidden",backgroundColor:colors.surfaceAlt,flexDirection:"row",flexWrap:"wrap"}}>
            {Array.from({length:4},(_,index)=>{const item=covers.get(group.id)?.[index];return <View key={index} style={{width:"50%",height:"50%",padding:spacing.xxs/2}}>{item?renderThumbnail(item):null}</View>})}
          </View><Text emphasis="strong">{group.title}</Text>
        </Pressable>)}
      </Grid></>:visible.length?<Grid columns={{compact:3}} gap={{compact:"xxs"}} minColumnWidth={{compact:44}}>{visible.map(item=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.title} onPress={()=>onOpenItem(item.id)} style={{aspectRatio:1,overflow:"hidden",backgroundColor:colors.surfaceAlt}}>{renderThumbnail(item)}</Pressable>)}</Grid>:null}
    </Stack>}/>
}
