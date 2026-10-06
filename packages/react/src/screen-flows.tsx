import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { ScreenLayout, type ScreenLayoutProps } from "./screens.js";
import { Button, IconButton } from "./actions.js";
import { Stack, Text, Grid, VisuallyHidden } from "./layout.js";
import { SearchField } from "./forms.js";
import { Chip, RadioGroup } from "./selection.js";
import { AlertDialog, Menu, Sheet, type SheetProps } from "./overlays.js";
import { UploadItem } from "./upload-item.js";
import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import { type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { validateCommentThread, resolvePermissionAction, resolveOnboardingStep, resolveSearchCommit, resolveSearchEmptyCause, resolveSearchScreenPhase, resolveFocusAfterRemoval, screenPatternRecipe, searchScreenRecipe, type SearchEmptyCause, type PermissionScreenStatus, type PhotoSource, type PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { containerRecipe, type ContainerGutter } from "@hjmds/design-contracts/components/container";
import { ListRow } from "./display.js";
import { Heading } from "./heading.js";
import { EmptyState, Skeleton } from "./feedback.js";

/** Copy, pending state and mutations are controlled by the consuming product. */
export type ScreenFlowAction = Readonly<{label:string; onAction():void; disabled?:boolean; pending?:boolean}>;
function Action({action,secondary=false}:{action:ScreenFlowAction;secondary?:boolean}){return <Button tone={secondary?"ghost":"primary"} disabled={!!(action.disabled||action.pending)} loading={action.pending??false} onClick={action.onAction}>{action.label}</Button>;}
type Base = Omit<ScreenLayoutProps,"children"|"footer">;

export type ListDetailScreenProps = Base & { list:ReactNode; detail?:{title:string;content:ReactNode}; back:ScreenFlowAction; refresh?:ScreenFlowAction; loadMore?:ScreenFlowAction };
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state. */
export function ListDetailScreen({list,detail,back,refresh,loadMore,layoutStyle,...screen}:ListDetailScreenProps){
 const open=!!detail;
 // Seed with the first render: a deep link that mounts with detail open is not a user transition,
 // so it must not pull focus from wherever the host left it (address bar, router focus target).
 const listHost=useRef<HTMLDivElement>(null),detailHost=useRef<HTMLDivElement>(null),returnFocus=useRef<HTMLElement|null>(null),wasOpen=useRef(open);
 // Hidden lists preserve scroll but drop browser focus; retain the trigger and move into the
 // detail once, then restore it (or the list body if the item was removed). See usage/ListDetailScreen.
 useLayoutEffect(()=>{
  if(open&&!wasOpen.current)detailHost.current?.querySelector<HTMLElement>("button")?.focus({preventScroll:true});
  if(!open&&wasOpen.current){const target=returnFocus.current; if(target?.isConnected&&!target.closest("[hidden]"))target.focus({preventScroll:true});else listHost.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus({preventScroll:true});}
  wasOpen.current=open;
 },[open]);
 // layoutStyle places the outer host that owns both panes, not the inner list ScreenLayout.
 return <div style={{height:"100%",...layoutStyle}}>
  <div ref={listHost} hidden={open} style={{height:"100%"}} onFocusCapture={event=>{returnFocus.current=event.target as HTMLElement;}}><ScreenLayout {...screen} actions={refresh?<Action action={refresh} secondary/>:screen.actions} footer={loadMore?<Action action={loadMore} secondary/>:null}>{list}</ScreenLayout></div>
  {detail?<div ref={detailHost} style={{height:"100%"}}><ScreenLayout title={detail.title} leading={<Action action={back} secondary/>}>{detail.content}</ScreenLayout></div>:null}
 </div>;
}

export type EditorScreenProps = Base & {children:ReactNode;submitPlacement?:"header"|"footer";dirty:boolean;submit:ScreenFlowAction;cancel:ScreenFlowAction;discard:Omit<Extract<AlertDialogRequest,{mode:"confirm"}>,"onConfirm"|"fallbackErrorMessage"> & {fallbackErrorMessage:string};draftStatus?:ReactNode};
export function EditorScreen({children,dirty,submitPlacement="footer",submit,cancel,discard,draftStatus,...screen}:EditorScreenProps){
 const [confirm,setConfirm]=useState(false);
 return <><ScreenLayout {...screen} leading={<Action action={{...cancel,disabled:!!(cancel.disabled||submit.pending),onAction:()=>{if(dirty)setConfirm(true);else cancel.onAction();}}} secondary/>} actions={submitPlacement==="header"?<Action action={submit}/>:screen.actions} footer={submitPlacement==="header"?draftStatus:<Stack gap="sm">{draftStatus}<Action action={submit}/></Stack>}>{children}</ScreenLayout><AlertDialog open={confirm} onOpenChange={setConfirm} request={{...discard,mode:"confirm",onConfirm:()=>cancel.onAction()}}/></>;
}

export type ProfileScreenProps = Base & {summary:ReactNode;edit:ScreenFlowAction;children?:ReactNode;accountActions?:ReactNode};
export function ProfileScreen({summary,edit,children,accountActions,...screen}:ProfileScreenProps){return <ScreenLayout {...screen}><Stack gap="xl"><Stack gap="md">{summary}<Action action={edit} secondary/></Stack>{children}{accountActions}</Stack></ScreenLayout>;}

export type ModerationScreenProps = Base & {reasonPicker?:ReactNode;reasons:readonly {value:string;label:string}[];reason:string|null;onReasonChange(value:string):void;reasonLabel:string;children?:ReactNode;submit:ScreenFlowAction;block?:{action:ScreenFlowAction;confirmation:Extract<AlertDialogRequest,{mode:"confirm"}>}};
export function ModerationScreen({reasonPicker,reasons,reason,onReasonChange,reasonLabel,children,submit,block,...screen}:ModerationScreenProps){const [confirm,setConfirm]=useState(false);return <><ScreenLayout {...screen} footer={<Stack gap="sm"><Action action={{...submit,disabled:submit.disabled||!!screen.state&&screen.state.kind!=="ready"||!reasons.some(item=>item.value===reason)}}/>{block?<Action action={{...block.action,onAction:()=>setConfirm(true)}} secondary/>:null}</Stack>}><Stack gap="lg">{reasonPicker??(reasons.length?<RadioGroup accessibilityLabel={reasonLabel} orientation="vertical" items={reasons} value={reason} onValueChange={value=>{if(value)onReasonChange(value);}}/>:null)}{children}</Stack></ScreenLayout>{block?<AlertDialog open={confirm} onOpenChange={setConfirm} request={block.confirmation}/>:null}</>;}


/** Source choice only: permission, capture, decoding and draft persistence belong to the host. */
export type PhotoSourceSheetProps = Readonly<{
 open:boolean;onOpenChange(open:boolean):void;onSelect(source:PhotoSource):void;
 labels:PhotoSourceLabels;disabled?:boolean;cameraAvailable?:boolean;
}>;
export function PhotoSourceSheet({open,onOpenChange,onSelect,labels,disabled=false,cameraAvailable=true}:PhotoSourceSheetProps){
 // File-input click must stay in the user's activation stack. Deferring until the
 // sheet animation ends can cause browsers to reject camera/album selection.
 const select=(source:PhotoSource)=>{if(disabled)return;onOpenChange(false);onSelect(source);};
 return <Sheet open={open} onOpenChange={onOpenChange} title={labels.title} closeLabel={labels.cancel}><Stack gap="sm">
 <Button tone="secondary" disabled={disabled} onClick={()=>select("library")}>{labels.library}</Button>
 {cameraAvailable?<Button tone="secondary" disabled={disabled} onClick={()=>select("camera")}>{labels.camera}</Button>:null}
 </Stack></Sheet>;
}

export type MediaSelectionItem = {descriptor:UploadItemDescriptor;preview?:ReactNode};
export type MediaSelectionScreenProps = Base & {library?:ReactNode;selectionSummary?:ReactNode;items:readonly MediaSelectionItem[];add:ScreenFlowAction;done:ScreenFlowAction;labels:UploadItemLabels;actionLabels:{remove:string;moveUp:string;moveDown:string};removeLabel(item:MediaSelectionItem):string;moveUpLabel(item:MediaSelectionItem):string;moveDownLabel(item:MediaSelectionItem):string;onRemove(id:string):void;onMove(id:string,direction:-1|1):void;onRetry(id:string):void;onCancel(id:string):void};
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export function MediaSelectionScreen({library,selectionSummary,items,add,done,labels,actionLabels,removeLabel,moveUpLabel,moveDownLabel,onRemove,onMove,onRetry,onCancel,...screen}:MediaSelectionScreenProps){return <ScreenLayout {...screen} actions={<Action action={add} secondary/>} footer={<Stack gap="sm">{selectionSummary}<Action action={done}/></Stack>}>{library??<Grid columns={{compact:2,expanded:3}} gap={{compact:"md"}}>{items.map((item,index)=><Stack key={item.descriptor.id} gap="xs">{item.preview}<UploadItem descriptor={item.descriptor} labels={labels} onRetry={onRetry} onCancel={onCancel}/><Stack axis="inline" gap="xxs" layoutStyle={{flexWrap:"wrap"}}><Button aria-label={moveUpLabel(item)} size="small" tone="ghost" disabled={index===0} onClick={()=>onMove(item.descriptor.id,-1)}>{actionLabels.moveUp}</Button><Button aria-label={moveDownLabel(item)} size="small" tone="ghost" disabled={index===items.length-1} onClick={()=>onMove(item.descriptor.id,1)}>{actionLabels.moveDown}</Button><Button aria-label={removeLabel(item)} size="small" tone="ghost" onClick={()=>onRemove(item.descriptor.id)}>{actionLabels.remove}</Button></Stack></Stack>)}</Grid>}</ScreenLayout>;}


/*
 * SearchScreen phase sections (2026-10-06, user-delegated decision to lift the search preview logic into
 * the public API; design: packages/design-contracts/docs/screen-patterns.md, SearchScreen two-step section).
 * Products supply data, copy, icons and requests; HJM owns placement, commit routing, focus after removal
 * and count announcements. Before this, every product had to rebuild these from Showcase preview code,
 * which AGENTS.md rules out as an adoption path. Kept in this file, not an internal module: a new module
 * edge would push ./screen-flows past its reviewed module-count budget (scripts/check-renderer-budgets.mjs).
 */

/** Recent searches before typing. Rows commit; the trailing button removes one. */
export type SearchRecentQueries = Readonly<{
  items: readonly string[];
  title: string;
  clearAllLabel: string;
  onClearAll(): void;
  removeLabel(query: string): string;
  onRemove(query: string): void;
  /** Decorative leading glyph (for example a history icon). */
  icon?: ReactNode;
  /** Glyph inside the remove button; defaults to "×". */
  removeIcon?: ReactNode;
  /** Rows shown; default `searchScreenRecipe.recentVisible` (5). */
  maxVisible?: number;
}>;
/** Product-chosen queries shown before typing and after a query-caused zero result. */
export type SearchSuggestedQueries = Readonly<{ title: string; items: readonly string[] }>;
/** A typed-ahead completion. `match` bolds the matched range (weight, not color, so it survives dark mode). */
export type SearchSuggestion = Readonly<{ query: string; match?: Readonly<{ start: number; end: number }> }>;
export type SearchSuggestions = Readonly<{
  items: readonly SearchSuggestion[];
  /** First row that commits the typed text as is, e.g. "Search ‘q’". */
  commitLabel(query: string): string;
  /** Polite announcement of the suggestion count. */
  countLabel(count: number): string;
  icon?: ReactNode;
  /** Rows shown under the commit row; default `searchScreenRecipe.suggestionVisible` (6). */
  maxVisible?: number;
}>;
export type SearchSortOption = Readonly<{ id: string; label: string }>;
export type SearchSort = Readonly<{
  /** Accessible name of the sort menu. */
  label: string;
  /** Visible trigger text, usually the current option ("Sort: Newest"). */
  triggerLabel: string;
  value: string;
  options: readonly SearchSortOption[];
  onChange(id: string): void;
  /** Trailing glyph of the trigger (for example a chevron). */
  icon?: ReactNode;
}>;
export type SearchResultSummary = Readonly<{
  /** Result total for the committed query; `null` while it loads (skeleton rows replace `children`). */
  count: number | null;
  countLabel(count: number): string;
  /** Announced while loading. */
  loadingLabel: string;
  sort?: SearchSort;
  /** Above the count, e.g. a retained-results error Notice with retry. */
  notice?: ReactNode;
  /** Zero-result copy. Filters as the cause add "clear all"; the query as the cause adds suggested queries. */
  empty?: Readonly<{ title: string; description?: string }>;
}>;
export type SearchAppliedFilter = Readonly<{ key: string; label: string }>;
export type SearchAppliedFilters = Readonly<{
  items: readonly SearchAppliedFilter[];
  removeLabel(label: string): string;
  onRemove(key: string): void;
  clearAllLabel: string;
  onClearAll(): void;
  removeIcon?: ReactNode;
}>;
export type SearchFilterSheetLabels = Readonly<{
  close: string;
  reset: string;
  /** Primary action text for a live draft count, e.g. "Show 12 results"; `null` while counting. */
  apply(count: number | null): string;
}>;
/**
 * Draft/applied filter sheet. HJM copies `value` into a draft when the sheet opens, discards the draft
 * on any dismissal, and calls `onApply(draft)` only from the primary action.
 */
export type SearchFilterSheet<F> = Readonly<{
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Sheet title; products that open one section from a facet chip pass that section's name. */
  title: string;
  /** Applied filters. */
  value: F;
  onApply(next: F): void;
  /** Live count for a draft. Return `null` while an async count is pending; `0` disables apply. */
  count(draft: F): number | null;
  /** Draft after "reset" (the open section, or everything). */
  reset(draft: F): F;
  /** Disables "reset" when the draft already equals its reset value. */
  isDefault(draft: F): boolean;
  renderContent(draft: F, setDraft: (next: F) => void): ReactNode;
  labels: SearchFilterSheetLabels;
  /** Default `large`; section sheets usually pass `auto`. */
  size?: SheetProps["size"];
  /** First item of the filter rail that opens the sheet, named with the applied count. */
  trigger?: Readonly<{ label(appliedCount: number): string; accessibilityLabel(appliedCount: number): string; icon?: ReactNode }>;
}>;

type Removal = { list: "recent" | "applied" | "clearRecent" | "clearApplied"; index: number; from: number };

function Highlighted({ text, match }: { text: string; match: SearchSuggestion["match"] }): ReactNode {
  if (!match || match.start < 0 || match.end <= match.start || match.end > text.length) return text;
  return <>{text.slice(0, match.start)}<Text as="span" emphasis="strong">{text.slice(match.start, match.end)}</Text>{text.slice(match.end)}</>;
}

/** Focus targets after removing a chip or row; returns refs and a scheduler the screen calls from its handlers. */
function useSearchRemovalFocus(recentCount: number, appliedCount: number, input: () => HTMLElement | null | undefined) {
  const pending = useRef<Removal | null>(null);
  const recentHost = useRef<HTMLDivElement>(null);
  const appliedHost = useRef<HTMLDivElement>(null);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  // Wait for the product to actually shrink the list: an async onRemove would otherwise focus the
  // chip that is about to disappear.
  useLayoutEffect(() => {
    const removal = pending.current;
    if (!removal) return;
    const recent = removal.list === "recent" || removal.list === "clearRecent";
    const now = recent ? recentCount : appliedCount;
    if (now >= removal.from) return;
    pending.current = null;
    const host = recent ? recentHost.current : appliedHost.current;
    const selector = recent ? "[data-search-recent-remove]" : "[data-search-applied-filter]";
    const items = Array.from(host?.querySelectorAll<HTMLElement>(selector) ?? []);
    const index = removal.list.startsWith("clear") ? -1 : resolveFocusAfterRemoval(removal.index, items.length);
    const fallback = recent ? input() : filterTrigger.current ?? input();
    (index >= 0 ? items[index] : fallback)?.focus();
  }, [recentCount, appliedCount, input]);
  return { recentHost, appliedHost, filterTrigger, schedule: (removal: Removal) => { pending.current = removal; } };
}

function SearchAnnouncement({ text }: { text: string }) {
  // Only the text changes the live region, so the same count is not re-read on every render.
  return <VisuallyHidden role="status">{text}</VisuallyHidden>;
}

function SearchIdleSections({ recent, suggested, legacy, onCommit, hostRef, onRemove, onClearAll }: {
  recent: SearchRecentQueries | undefined; suggested: SearchSuggestedQueries | undefined; legacy: ReactNode;
  onCommit(query: string): void; hostRef: RefObject<HTMLDivElement | null>;
  onRemove(query: string, index: number): void; onClearAll(): void;
}) {
  const visible = recent?.items.slice(0, Math.max(0, recent.maxVisible ?? searchScreenRecipe.recentVisible)) ?? [];
  // Without the structured sections the legacy `recentSearches` slot renders exactly as before 2026-10-06.
  if (!visible.length && !suggested?.items.length) return <>{legacy}</>;
  return <Stack gap="xl">
    {legacy}
    {recent && visible.length ? <Stack gap="sm" ref={hostRef}>
      <Stack axis="inline" justify="between" align="center" gap="sm">
        <Heading level="level5" semanticLevel={2}>{recent.title}</Heading>
        <Button tone="ghost" size="small" onClick={onClearAll}>{recent.clearAllLabel}</Button>
      </Stack>
      <Stack gap="xxs">{visible.map((item, index) => <Stack key={item} axis="inline" align="center" gap="xxs">
        <ListRow density="compact" leading={recent.icon} title={item} onClick={() => onCommit(item)} layoutStyle={{ flex: 1, minWidth: 0 }} />
        <IconButton data-search-recent-remove="" label={recent.removeLabel(item)} tone="ghost" onClick={() => onRemove(item, index)}>{recent.removeIcon ?? "×"}</IconButton>
      </Stack>)}</Stack>
    </Stack> : null}
    {suggested?.items.length ? <SearchSuggestedChips suggested={suggested} onCommit={onCommit} /> : null}
  </Stack>;
}

function SearchSuggestedChips({ suggested, onCommit }: { suggested: SearchSuggestedQueries; onCommit(query: string): void }) {
  return <Stack gap="sm">
    <Heading level="level5" semanticLevel={2}>{suggested.title}</Heading>
    <Stack axis="inline" wrap gap="xs">{suggested.items.map(item => <Chip key={item} label={item} onPress={() => onCommit(item)} />)}</Stack>
  </Stack>;
}

function SearchSuggestionList({ query, suggestions, onCommit }: { query: string; suggestions: SearchSuggestions; onCommit(query: string): void }) {
  const typed = query.trim();
  const items = suggestions.items.slice(0, Math.max(0, suggestions.maxVisible ?? searchScreenRecipe.suggestionVisible));
  return <Stack gap="xxs">
    <ListRow density="compact" leading={suggestions.icon} title={suggestions.commitLabel(typed)} onClick={() => onCommit(typed)} />
    {items.map(item => <ListRow key={item.query} density="compact" leading={suggestions.icon} title={<Highlighted text={item.query} match={item.match} />} onClick={() => onCommit(item.query)} />)}
  </Stack>;
}

function SearchResultsHeader({ summary, applied, cause, appliedHost, onRemove, onClearAll, onSortChange }: {
  summary: SearchResultSummary | undefined; applied: SearchAppliedFilters | undefined; cause: SearchEmptyCause;
  appliedHost: RefObject<HTMLDivElement | null>; onRemove(key: string, index: number): void; onClearAll(): void; onSortChange(id: string): void;
}) {
  const sort = summary?.sort;
  const showCount = summary && cause === "none";
  if (!summary?.notice && !showCount && !applied?.items.length) return null;
  return <Stack gap="sm">
    {summary?.notice}
    {showCount ? <Stack axis="inline" justify="between" align="center" gap="sm" wrap>
      {summary.count === null ? <Skeleton shape="text" width="30%" /> : <Text tone="muted">{summary.countLabel(summary.count)}</Text>}
      {sort ? <Menu label={sort.label} align="end" selectionMode="single" value={sort.value} onValueChange={onSortChange}
        items={sort.options.map(option => ({ id: option.id, label: option.label }))}
        trigger={<Button size="small" tone="ghost" {...(sort.icon === undefined ? {} : { trailing: sort.icon })}>{sort.triggerLabel}</Button>} /> : null}
    </Stack> : null}
    {applied?.items.length ? <Stack ref={appliedHost} axis="inline" wrap gap="xs" align="center">
      {applied.items.map((item, index) => <Chip key={item.key} data-search-applied-filter="" label={item.label} aria-label={applied.removeLabel(item.label)}
        trailing={applied.removeIcon ?? <span aria-hidden="true">×</span>} onPress={() => onRemove(item.key, index)} />)}
      <Button tone="ghost" size="small" onClick={onClearAll}>{applied.clearAllLabel}</Button>
    </Stack> : null}
  </Stack>;
}

function SearchResultsBody({ summary, applied, suggested, cause, onCommit, onClearAll, children }: {
  summary: SearchResultSummary | undefined; applied: SearchAppliedFilters | undefined; suggested: SearchSuggestedQueries | undefined;
  cause: SearchEmptyCause; onCommit(query: string): void; onClearAll(): void; children: ReactNode;
}) {
  // Loading keeps each row's own height (ListRow `loading`), so the list does not jump when results land.
  if (summary?.count === null) return <Stack gap="xxs">{Array.from({ length: searchScreenRecipe.loadingRows }, (_, index) =>
    <ListRow key={index} loading title="" description="" {...(index === 0 ? { loadingLabel: summary.loadingLabel } : {})} />)}</Stack>;
  if (cause === "none" || !summary?.empty) return <>{children}</>;
  return <Stack gap="lg">
    <EmptyState density="compact" title={summary.empty.title} {...(summary.empty.description === undefined ? {} : { description: summary.empty.description })}
      {...(cause === "filters" && applied ? { action: <Button tone="secondary" onClick={onClearAll}>{applied.clearAllLabel}</Button> } : {})} />
    {cause === "query" && suggested?.items.length ? <SearchSuggestedChips suggested={suggested} onCommit={onCommit} /> : null}
    {children}
  </Stack>;
}

function SearchFilterTrigger<F>({ sheet, appliedCount, triggerRef }: { sheet: SearchFilterSheet<F>; appliedCount: number; triggerRef: RefObject<HTMLButtonElement | null> }) {
  const trigger = sheet.trigger!;
  return <Chip ref={triggerRef} label={trigger.label(appliedCount)} aria-label={trigger.accessibilityLabel(appliedCount)} aria-haspopup="dialog"
    {...(trigger.icon === undefined ? {} : { leading: trigger.icon })} onPress={() => sheet.onOpenChange(true)} />;
}

/** Wide windows get a side sheet so results stay visible beside the conditions (expanded = 960+). */
function sidePlacement() {
  return typeof window !== "undefined" && ["expanded", "wide"].includes(resolveWindowClass(window.innerWidth));
}

function SearchFilterSheetView<F>({ sheet }: { sheet: SearchFilterSheet<F> }) {
  // The draft lives only while the sheet is open: seeded from `value` on open, dropped on every close,
  // so closing (×, scrim, back, Escape) never leaks half-edited conditions into the next opening.
  const [session, setSession] = useState<{ draft: F; side: boolean } | null>(null);
  if (sheet.open && !session) setSession({ draft: sheet.value, side: sidePlacement() });
  if (!sheet.open && session) setSession(null);
  const draft = session ? session.draft : sheet.value;
  const setDraft = (next: F) => setSession(current => current ? { ...current, draft: next } : current);
  const count = sheet.count(draft);
  // Reset sits left of the primary action on Web (sheet.md [secondary][primary]) and is always present,
  // disabled at the default, so the primary action does not jump when the draft changes.
  const footer = <Stack axis="inline" justify="end" gap="sm" wrap>
    <Button tone="secondary" disabled={sheet.isDefault(draft)} onClick={() => setDraft(sheet.reset(draft))}>{sheet.labels.reset}</Button>
    <Button disabled={count === 0} onClick={() => { sheet.onApply(draft); sheet.onOpenChange(false); }}>{sheet.labels.apply(count)}</Button>
  </Stack>;
  return <Sheet open={sheet.open} onOpenChange={open => sheet.onOpenChange(open)} title={sheet.title} closeLabel={sheet.labels.close}
    placement={session?.side ? "end" : "bottom"} size={sheet.size ?? "large"} footer={footer}>
    {sheet.renderContent(draft, setDraft)}
  </Sheet>;
}

type SearchInputSlot = {queryField: ReactNode; queryClearLabel?: string} | {queryField?: never; queryClearLabel: string};
/** `committedQuery` turns on two-step search; every commit (Enter, suggestion, recent, suggested query) then goes through `onSubmit`. */
/** One name for the default field's progress on both platforms (Web SearchField `loading`, Native `busy`+`busyLabel`). */
type SearchProgressSlot = {searching?: never; searchingLabel?: never} | {searching: boolean; searchingLabel: string};
type SearchCommitSlot = {committedQuery?: never; onSubmit?: (query:string)=>void} | {committedQuery: string; onSubmit:(query:string)=>void};
export type SearchScreenProps<F = unknown> = Base & SearchInputSlot & SearchCommitSlot & SearchProgressSlot & {query:string;queryLabel:string;onQueryChange(value:string):void;onSearch(query:string,context:{signal:AbortSignal}):void;debounceMs?:number;filters?:ReactNode;recentSearches?:ReactNode;children:ReactNode;
 /** `scroll` keeps `filters` on one horizontally scrolling line that bleeds to the screen edges. */
 filtersOverflow?:"wrap"|"scroll";
 /** Gutter the host (Container `gutter`, Sheet = `regular`) already applies around this screen; the scroll rail bleeds over it too. */
 hostGutter?:ContainerGutter;
 /** `hidden` drops the visible label (the field keeps `queryLabel` as its accessible name and placeholder). */
 queryLabelVisibility?:"visible"|"hidden";
 recentQueries?:SearchRecentQueries;suggestedQueries?:SearchSuggestedQueries;suggestions?:SearchSuggestions;
 resultSummary?:SearchResultSummary;appliedFilters?:SearchAppliedFilters;filterSheet?:SearchFilterSheet<F>};
/** Abort is supplied to the host request; the host must ignore aborted responses before committing results. */
export function SearchScreen<F = unknown>({query,queryLabel,queryField,queryClearLabel,onQueryChange,onSearch,debounceMs=300,filters,recentSearches,children,onSubmit,committedQuery,filtersOverflow="wrap",hostGutter="none",queryLabelVisibility="visible",searching,searchingLabel,recentQueries,suggestedQueries,suggestions,resultSummary,appliedFilters,filterSheet,...screen}:SearchScreenProps<F>){
 // The host owns localized copy. A custom queryField owns its own clear affordance.
 if (queryField == null && !queryClearLabel?.trim()) throw new TypeError("SearchScreen requires a localized queryClearLabel for its default search field");
 const callback=useRef(onSearch);callback.current=onSearch;
 useEffect(()=>{const controller=new AbortController();const timer=setTimeout(()=>callback.current(query,{signal:controller.signal}),Math.max(0,debounceMs));return()=>{clearTimeout(timer);controller.abort();};},[query,debounceMs]);
 const fieldHost=useRef<HTMLDivElement>(null),bodyHost=useRef<HTMLDivElement>(null);
 const input=useCallback(()=>fieldHost.current?.querySelector<HTMLElement>("input"),[]);
 const focus=useSearchRemovalFocus(recentQueries?.items.length??0,appliedFilters?.items.length??0,input);
 // Every commit path funnels through here so "only committed searches are recorded" holds at the API:
 // onSearch (debounced typing) never reaches onSubmit. Without onSubmit (one-step search) a pick only fills the field.
 const commit=(value:string)=>{const next=resolveSearchCommit(value);if(next===null)return;if(next!==query)onQueryChange(next);onSubmit?.(next);};
 // A picked suggestion/recent/suggested query unmounts with its phase, which dropped focus to <body>; move it to the
 // results region first (1.13.1, utilverse adoption 2026-10-06, Native twin: Keyboard.dismiss on every commit).
 // Leaving the field also closes a mobile browser's keyboard. Enter keeps focus in the field instead: it is still on
 // screen with the committed text, and moving it would make keyboard users Shift+Tab back to refine. Rejected: blur()
 // without a target, which leaves focus on <body> and loses the reading position for screen readers.
 const pick=(value:string)=>{if(resolveSearchCommit(value)!==null)bodyHost.current?.focus({preventScroll:true});commit(value);};
 // onSubmit separates "typing" from "committed" (recent-search writes, suggestion → results) without making
 // products rebuild the default field through queryField (2026-10-06 search redesign, usage/components/search-screen.md).
 // Enter while an IME is composing (Korean/Japanese) only confirms the syllable, so it must not commit.
 // The pending debounce is left alone: products decide whether submit should also flush a request.
 const submitProps=onSubmit?{enterKeyHint:"search" as const,onKeyDown:(event:KeyboardEvent<HTMLInputElement>)=>{if(event.key!=="Enter"||event.nativeEvent.isComposing||event.keyCode===229)return;commit(event.currentTarget.value);}}:{};
 // Reference services hide the label behind a placeholder; the placeholder names the search target (Apple HIG
 // search fields) and aria-label keeps the accessible name, so hiding never leaves an unnamed field.
 const labelProps=queryLabelVisibility==="hidden"?{"aria-label":queryLabel,placeholder:queryLabel}:{label:queryLabel};
 const phase=resolveSearchScreenPhase(query,committedQuery);
 const appliedCount=appliedFilters?.items.length??0;
 const cause=phase==="results"&&resultSummary?resolveSearchEmptyCause(resultSummary.count,appliedCount):"none";
 // Two-step search shows the rail only beside results (typing keeps the pinned area short), and a
 // query-caused zero hides it because no filter can fix that; a filter-caused zero keeps it to undo the filter.
 const showRail=(committedQuery===undefined||phase==="results")&&cause!=="query";
 const trigger=filterSheet?.trigger?<SearchFilterTrigger sheet={filterSheet} appliedCount={appliedCount} triggerRef={focus.filterTrigger}/>:null;
 const rail=!showRail?null:trigger&&filters!=null?<Stack axis="inline" gap="xs" wrap={filtersOverflow==="wrap"}>{trigger}{filters}</Stack>:trigger??filters;
 // Wrapping chips grow the pinned area line by line at large text; the scroll rail caps it at one row.
 // A product-owned CSS/ScrollView rail would re-derive bleed, scroll padding and RTL per app.
 // contentInset="none" leaves the gutter to the host, which CSS cannot see; hostGutter names it (Native twin).
 const bleed=(screen.contentInset==="none"?0:screenPatternRecipe.padding)+containerRecipe.gutters[hostGutter];
 const filterSlot=rail!=null&&filtersOverflow==="scroll"?<div className="hjm-search-screen__filters" data-overflow="scroll" style={{"--hjm-search-filters-bleed":`${bleed}px`} as CSSProperties}>{rail}</div>:rail;
 const visibleSuggestions=suggestions?.items.slice(0,Math.max(0,suggestions.maxVisible??searchScreenRecipe.suggestionVisible)).length??0;
 const countAnnouncement=phase==="typing"&&suggestions?suggestions.countLabel(visibleSuggestions):phase==="results"&&resultSummary&&resultSummary.count!==null?resultSummary.countLabel(resultSummary.count):"";
 // 2026-10-06 utilverse adoption: products swapped the whole field just to show progress. The Web spinner is
 // aria-hidden, so the localized searching label goes through the same status region as the counts.
 const announcement=searching&&searchingLabel?searchingLabel:countAnnouncement;
 const removeRecent=(item:string,index:number)=>{focus.schedule({list:"recent",index,from:recentQueries!.items.length});recentQueries!.onRemove(item);};
 const clearRecent=()=>{focus.schedule({list:"clearRecent",index:-1,from:recentQueries!.items.length});recentQueries!.onClearAll();};
 const removeApplied=(key:string,index:number)=>{focus.schedule({list:"applied",index,from:appliedCount});appliedFilters!.onRemove(key);};
 const clearApplied=()=>{focus.schedule({list:"clearApplied",index:-1,from:appliedCount});appliedFilters!.onClearAll();};
 // A new order starts at the top; the previous offset would land mid-list in unrelated results.
 const changeSort=(id:string)=>{resultSummary?.sort?.onChange(id);bodyHost.current?.closest(".hjm-screen__body")?.scrollTo?.({top:0});};
 const idle=<SearchIdleSections recent={recentQueries} suggested={suggestedQueries} legacy={recentSearches} onCommit={pick} hostRef={focus.recentHost} onRemove={removeRecent} onClearAll={clearRecent}/>;
 const body=phase==="idle"?<>{idle}{committedQuery===undefined?children:null}</>
  :phase==="typing"?(suggestions?<SearchSuggestionList query={query} suggestions={suggestions} onCommit={pick}/>:null)
  :<><SearchResultsHeader summary={resultSummary} applied={appliedFilters} cause={cause} appliedHost={focus.appliedHost} onRemove={removeApplied} onClearAll={clearApplied} onSortChange={changeSort}/>
   <SearchResultsBody summary={resultSummary} applied={appliedFilters} suggested={suggestedQueries} cause={cause} onCommit={pick} onClearAll={clearApplied}>{children}</SearchResultsBody></>;
 return <><ScreenLayout {...screen} notice={<Stack gap="sm" ref={fieldHost}>{queryField ?? <SearchField {...labelProps} clearLabel={queryClearLabel!} value={query} onValueChange={onQueryChange} loading={searching??false} {...submitProps}/>}{filterSlot}{screen.notice}</Stack>}><Stack gap="lg" ref={bodyHost} className="hjm-search-screen__results" tabIndex={-1}>{suggestions||resultSummary||searchingLabel?<SearchAnnouncement text={announcement}/>:null}{body}</Stack></ScreenLayout>
  {filterSheet?<SearchFilterSheetView sheet={filterSheet}/>:null}</>;
}

export type PermissionScreenProps = Base & {status:PermissionScreenStatus;illustration?:ReactNode;explanation:ReactNode;request:ScreenFlowAction;settings:ScreenFlowAction;continueAction:ScreenFlowAction;skip?:ScreenFlowAction};
export function PermissionScreen({status,illustration,explanation,request,settings,continueAction,skip,...screen}:PermissionScreenProps){const kind=resolvePermissionAction(status);const primary=kind==="request"?request:kind==="settings"?settings:kind==="continue"?continueAction:null;return <ScreenLayout {...screen} footer={<Stack gap="sm">{primary?<Action action={primary}/>:null}{skip?<Action action={skip} secondary/>:null}</Stack>}><Stack gap="xl" align="center">{illustration}{explanation}</Stack></ScreenLayout>;}

export type OnboardingStep = {id:string;title:string;description:string;content:ReactNode};
export type OnboardingScreenProps = {steps:readonly OnboardingStep[];index:number;onIndexChange(index:number):void;nextLabel:string;backLabel:string;complete:ScreenFlowAction;skip?:ScreenFlowAction;progressLabel(index:number,total:number):string;layoutStyle?:ScreenLayoutProps["layoutStyle"]};
export function OnboardingScreen({steps,index,onIndexChange,nextLabel,backLabel,complete,skip,progressLabel,layoutStyle}:OnboardingScreenProps){const position=resolveOnboardingStep(steps.length,index);const step=steps[index]!;return <ScreenLayout {...(layoutStyle===undefined?{}:{layoutStyle})} title={step.title} description={step.description} actions={skip?<Action action={skip} secondary/>:null} notice={<Text variant="caption" tone="muted">{progressLabel(index+1,steps.length)}</Text>} footer={<Stack gap="sm"><Action action={position.last?complete:{label:nextLabel,onAction:()=>onIndexChange(index+1)}}/>{!position.first?<Action action={{label:backLabel,onAction:()=>onIndexChange(index-1)}} secondary/>:null}</Stack>}>{step.content}</ScreenLayout>;}

export type CommentThreadItem = Readonly<{id:string;parentId:string|null;author:string;body:ReactNode;bodyText?:string;timeLabel:string;likeCountLabel:string;avatar?:ReactNode;likeIcon:ReactNode;likeLabel:string;likeAction?:ReactNode;actions?:ReactNode;canReply?:boolean;replyDisabled?:boolean}>;
export type CommentThreadScreenProps = Base & {items:readonly CommentThreadItem[];expandedIds:readonly string[];onExpandedChange(id:string):void;onLike(id:string):void;onReply(id:string):void;replyLabel:string;repliesLabel(count:number,expanded:boolean):string;composer?:ReactNode;threadFooter?:ReactNode};
/** Controlled thread: server ordering, permission checks and receipt-based draft clearing belong to the product. */
export function CommentThreadScreen({items,expandedIds,onExpandedChange,onLike,onReply,replyLabel,repliesLabel,composer,threadFooter,...screen}:CommentThreadScreenProps){
 validateCommentThread(items);
 // The supplied reference joins the author to the first body line and reserves the right edge
 // for one reaction target. Keep legacy rich bodies intact; bodyText opts into that compact flow.
 const row=(item:CommentThreadItem)=><Stack key={item.id} axis="inline" align="start" gap="sm">{item.avatar}<Stack gap="xxs" layoutStyle={{flex:1,minWidth:0}}>
 {item.bodyText!==undefined?<Text><Text emphasis="strong">{item.author}</Text>{" "}{item.bodyText}</Text>:<Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap:"wrap"}}><Text emphasis="strong">{item.author}</Text><Text variant="caption" tone="muted">{item.timeLabel}</Text></Stack>}
 {item.body}<Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap:"wrap"}}>{item.bodyText!==undefined&&item.timeLabel?<Text variant="caption" tone="muted">{item.timeLabel}</Text>:null}{item.likeCountLabel?<Text variant="caption" tone="muted">{item.likeCountLabel}</Text>:null}{(item.canReply??item.parentId===null)?<Button size="small" tone="ghost" disabled={item.replyDisabled??false} onClick={()=>onReply(item.id)}>{replyLabel}</Button>:null}</Stack>{item.actions}</Stack>{item.likeAction!==undefined?item.likeAction:<IconButton label={item.likeLabel} tone="ghost" onClick={()=>onLike(item.id)}>{item.likeIcon}</IconButton>}</Stack>;
 return <ScreenLayout {...screen} footer={!screen.state||screen.state.kind==="ready"||screen.state.kind==="empty"?composer:null}><Stack gap="lg">{items.filter(item=>item.parentId===null).map(item=>{const replies=items.filter(reply=>reply.parentId===item.id);return <Stack key={item.id} gap="xs">{row(item)}{replies.length?<Stack gap="md" layoutStyle={{marginInlineStart:screenPatternRecipe.sectionGap}}><Button layoutStyle={{alignSelf:"flex-start"}} tone="ghost" size="small" aria-expanded={expandedIds.includes(item.id)} onClick={()=>onExpandedChange(item.id)}>{repliesLabel(replies.length,expandedIds.includes(item.id))}</Button>{expandedIds.includes(item.id)?replies.map(row):null}</Stack>:null}</Stack>;})}{threadFooter}</Stack></ScreenLayout>;
}
