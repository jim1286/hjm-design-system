import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { ListDetailScreen, type ListDetailScreenProps } from "./screen-flows.js";
import { Stack, Text, Grid } from "./primitives.js";
import { Button } from "./actions.js";
import { useHjmNativeTheme } from "./provider.js";
import { radius, spacing } from "@hjmds/design-contracts/foundations";

import { resolveSavedItems, type SavedItem, type SavedCollection, type SavedItemsLabels } from "@hjmds/design-contracts/screen-patterns";
export type { SavedItem, SavedCollection, SavedItemsLabels } from "@hjmds/design-contracts/screen-patterns";
export type SavedItemsScreenProps<T extends SavedItem> = Omit<ListDetailScreenProps, "list" | "detail" | "back" | "refresh" | "loadMore"> & {
  items: readonly T[]; collections: readonly SavedCollection[];
  /** Omitted shows collections; null selects all saved items. */
  collectionId?: string | null; selectedItemId?: string | null;
  labels: SavedItemsLabels;
  onOpenCollection(id: string | null): void; onOpenItem(id: string): void;
  onBack(): void; onCreateCollection(): void;
  renderThumbnail(item: T): ReactNode; renderDetail(item: T): ReactNode;
};

/** Same controlled collection contract as Web, composed with the native screen and grid hosts. */
export function SavedItemsScreen<T extends SavedItem>({items,collections,collectionId,selectedItemId,labels,onOpenCollection,onOpenItem,onBack,onCreateCollection,renderThumbnail,renderDetail,...screen}:SavedItemsScreenProps<T>) {
  const {colors}=useHjmNativeTheme();
  const {home,collection,visible,selected}=resolveSavedItems(items,collections,collectionId,selectedItemId);
  const groups=[{id:null,title:labels.allItems,itemIds:items.map(item=>item.id)},...collections];
  return <ListDetailScreen {...screen} title={home?screen.title:collection?.title??labels.allItems}
    leading={home?screen.leading:<Button tone="ghost" onPress={onBack}>{labels.back}</Button>}
    actions={home?<Button tone="ghost" onPress={onCreateCollection}>{labels.createCollection}</Button>:screen.actions}
    back={{label:labels.back,onAction:onBack}}
    {...(selected?{detail:{title:selected.title,content:renderDetail(selected)}}:{})}
    list={<Stack gap="md">
      {home?<><Text variant="caption" tone="muted">{labels.privateNotice}</Text><Grid columns={{compact:2}} gap={{compact:"md"}} minColumnWidth={{compact:80}}>
        {groups.map(group=><Pressable key={group.id===null?"all":`collection:${group.id}`} accessibilityRole="button" accessibilityLabel={group.title} onPress={()=>onOpenCollection(group.id)} style={{gap:spacing.sm}}>
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{aspectRatio:1,borderRadius:radius.md,overflow:"hidden",backgroundColor:colors.surfaceAlt,flexDirection:"row",flexWrap:"wrap"}}>
            {Array.from({length:4},(_,index)=>{const item=items.filter(item=>group.itemIds.includes(item.id))[index];return <View key={index} style={{width:"50%",height:"50%",padding:spacing.xxs/2}}>{item?renderThumbnail(item):null}</View>})}
          </View><Text emphasis="strong">{group.title}</Text>
        </Pressable>)}
      </Grid></>:visible.length?<Grid columns={{compact:3}} gap={{compact:"xxs"}} minColumnWidth={{compact:44}}>{visible.map(item=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.title} onPress={()=>onOpenItem(item.id)} style={{aspectRatio:1,overflow:"hidden",backgroundColor:colors.surfaceAlt}}>{renderThumbnail(item)}</Pressable>)}</Grid>:<Text accessibilityRole="text" accessibilityLiveRegion="polite">{labels.empty}</Text>}
    </Stack>}/>
}
