import type { ReactNode } from "react";
import { ListDetailScreen, type ListDetailScreenProps } from "./screen-flows.js";
import { Stack, Text, Grid } from "./layout.js";
import { Button } from "./actions.js";

import { resolveSavedItems, type SavedItem, type SavedCollection, type SavedItemsLabels } from "@hjmds/design-contracts/screen-patterns";
export type { SavedItem, SavedCollection, SavedItemsLabels } from "@hjmds/design-contracts/screen-patterns";
export type SavedItemsScreenProps<T extends SavedItem> = Omit<ListDetailScreenProps, "list" | "detail" | "back" | "refresh" | "loadMore"> & {
  items: readonly T[];
  collections: readonly SavedCollection[];
  /** Omitted shows collections; null selects all saved items. */
  collectionId?: string | null;
  selectedItemId?: string | null;
  labels: SavedItemsLabels;
  onOpenCollection(id: string | null): void;
  onOpenItem(id: string): void;
  /**
   * One level up, from either the item detail or a collection grid. The shell does not know the
   * host's history, so the host pops a single level: clear `selectedItemId` when an item is open,
   * otherwise clear `collectionId` (back to the collection home).
   */
  onBack(): void;
  onCreateCollection(): void;
  renderThumbnail(item: T): ReactNode;
  renderDetail(item: T): ReactNode;
};

/**
 * Collection membership and persistence belong to the app; the shell preserves the grid on detail visits.
 *
 * Header slots per level: on the collection home the shell owns `actions` (the create-collection
 * button) and the product's `leading`; inside a collection it owns `leading` (back) and keeps the
 * product's `actions`. A product `actions` passed for the home is therefore not rendered there —
 * Native ships the same rule, so changing it is a cross-platform API decision, not a Web fix.
 */
export function SavedItemsScreen<T extends SavedItem>({items,collections,collectionId,selectedItemId,labels,onOpenCollection,onOpenItem,onBack,onCreateCollection,renderThumbnail,renderDetail,...screen}:SavedItemsScreenProps<T>) {
  const {home,collection,visible,selected}=resolveSavedItems(items,collections,collectionId,selectedItemId);
  const groups=[{id:null,title:labels.allItems,itemIds:items.map(item=>item.id)},...collections];
  return <ListDetailScreen {...screen} title={home?screen.title:collection?.title??labels.allItems}
    leading={home?screen.leading:<Button tone="ghost" onClick={onBack}>{labels.back}</Button>}
    actions={home?<Button tone="ghost" onClick={onCreateCollection}>{labels.createCollection}</Button>:screen.actions}
    back={{label:labels.back,onAction:onBack}}
    {...(selected?{detail:{title:selected.title,content:renderDetail(selected)}}:{})}
    list={<Stack gap="md">
      {home?<><Text variant="caption" tone="muted">{labels.privateNotice}</Text><Grid columns={{compact:2}} gap={{compact:"md"}} minColumnWidth={{compact:80}}>
        {groups.map(group=><button key={group.id===null?"all":`collection:${group.id}`} type="button" className="hjm-saved-collection" onClick={()=>onOpenCollection(group.id)} aria-label={group.title}>
          <span className="hjm-saved-collection__cover" aria-hidden="true">{Array.from({length:4},(_,index)=>{const item=items.filter(item=>group.itemIds.includes(item.id))[index];return <span key={index}>{item?renderThumbnail(item):null}</span>})}</span>
          <Text emphasis="strong">{group.title}</Text>
        </button>)}
      </Grid></>:visible.length?<Grid columns={{compact:3}} gap={{compact:"xxs"}} minColumnWidth={{compact:44}}>{visible.map(item=><button key={item.id} type="button" className="hjm-saved-post" aria-label={item.title} onClick={()=>onOpenItem(item.id)}>{renderThumbnail(item)}</button>)}</Grid>:<Text role="status">{labels.empty}</Text>}
    </Stack>}/>
}
