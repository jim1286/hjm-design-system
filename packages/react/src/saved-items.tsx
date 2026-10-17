import type { ReactNode } from "react";
import { ListDetailScreen, type ListDetailScreenProps } from "./screen-flows.js";
import { Stack, Text, Grid } from "./layout.js";
import { Button, IconButton } from "./actions.js";

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
  /**
   * Product-supplied glyph for the create-collection header action. When present the action renders
   * as an IconButton named by `labels.createCollection` (tool actions use icons, 2026-10-17 usage rule
   * in docs/usage/components/icon-button.md); omitted keeps the text button for existing products.
   */
  createCollectionIcon?: ReactNode;
  renderThumbnail(item: T): ReactNode;
  renderDetail(item: T): ReactNode;
};

/**
 * Collection membership and persistence belong to the app; the shell preserves the grid on detail visits.
 *
 * Header slots per level: on the collection home the shell owns `actions` (the create-collection
 * button) and the product's `exit`; inside a collection it owns `exit` (back) and keeps the
 * product's `actions`. A product `actions` passed for the home is therefore not rendered there —
 * Native ships the same rule, so changing it is a cross-platform API decision, not a Web fix.
 */
export function SavedItemsScreen<T extends SavedItem>({items,collections,collectionId,selectedItemId,labels,onOpenCollection,onOpenItem,onBack,onCreateCollection,createCollectionIcon,renderThumbnail,renderDetail,...screen}:SavedItemsScreenProps<T>) {
  const {home,collection,visible,selected}=resolveSavedItems(items,collections,collectionId,selectedItemId);
  const groups=[{id:null,title:labels.allItems,itemIds:items.map(item=>item.id)},...collections];
  // Empty is a full body state, not a short text row at the top of the grid.
  const state=(screen.state?.kind??"ready")==="ready"&&!home&&!visible.length
    ? {kind:"empty" as const,title:labels.empty} : screen.state??{kind:"ready" as const};
  // Resolve each cover once; four thumbnails must not each rescan membership.
  const covers=new Map(groups.map(group=>{const ids=new Set(group.itemIds);return [group.id,items.filter(item=>ids.has(item.id)).slice(0,4)] as const;}));
  return <ListDetailScreen {...screen} state={state} title={home?screen.title:collection?.title??labels.allItems}
    {...(home?(screen.exit?{exit:screen.exit}:{}):{exit:{kind:"back" as const,label:labels.back,onClick:onBack}})}
    actions={home?(createCollectionIcon===undefined?<Button tone="ghost" onClick={onCreateCollection}>{labels.createCollection}</Button>:<IconButton label={labels.createCollection} tone="ghost" onClick={onCreateCollection}>{createCollectionIcon}</IconButton>):screen.actions}
    back={{label:labels.back,onAction:onBack}}
    {...(selected?{detail:{title:selected.title,content:renderDetail(selected)}}:{})}
    list={<Stack gap="md">
      {home?<><Text variant="caption" tone="muted">{labels.privateNotice}</Text><Grid columns={{compact:2}} gap={{compact:"md"}} minColumnWidth={{compact:80}}>
        {groups.map(group=><button key={group.id===null?"all":`collection:${group.id}`} type="button" className="hjm-saved-collection" onClick={()=>onOpenCollection(group.id)} aria-label={group.title}>
          <span className="hjm-saved-collection__cover" aria-hidden="true">{Array.from({length:4},(_,index)=>{const item=covers.get(group.id)?.[index];return <span key={index}>{item?renderThumbnail(item):null}</span>})}</span>
          <Text emphasis="strong">{group.title}</Text>
        </button>)}
      </Grid></>:visible.length?<Grid columns={{compact:3}} gap={{compact:"xxs"}} minColumnWidth={{compact:44}}>{visible.map(item=><button key={item.id} type="button" className="hjm-saved-post" aria-label={item.title} onClick={()=>onOpenItem(item.id)}>{renderThumbnail(item)}</button>)}</Grid>:null}
    </Stack>}/>
}
