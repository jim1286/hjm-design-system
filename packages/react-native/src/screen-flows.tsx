import { useEffect, useRef, useState, type ReactNode } from "react";
import { CompositionLayout, ScreenLayout, type ScreenLayoutProps } from "./screens.js";
import { Button, IconButton } from "./actions.js";
import { Stack, Text, Grid } from "./primitives.js";
import { SearchField } from "./inputs.js";
import { Chip, RadioGroup } from "./inputs.js";
import { AlertDialog, Sheet, type SheetProps } from "./overlays.js";
import { UploadItem } from "./upload-item.js";
import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import { type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { validateCommentThread, resolvePermissionAction, resolveOnboardingStep, resolveSearchCommit, resolveSearchDebounceMs, resolveSearchEmptyCause, resolveSearchScreenPhase, screenPatternRecipe, commentThreadRecipe, profileSummaryRecipe, searchScreenRecipe, resolveCommentMenuItems, type CommentMenuItemDescriptor, type SearchEmptyCause, type PermissionScreenStatus, type PhotoSource, type PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { DrawnMoreVertical } from "./internal/drawn-glyphs.js";
import { useHjmNativeTheme } from "./provider.js";
import { AccessibilityInfo, Keyboard, Pressable, ScrollView, View, type NativeSyntheticEvent, type TextInputSubmitEditingEventData } from "react-native";
import { containerRecipe, type ContainerGutter } from "@hjmds/design-contracts/components/container";
import { ListRow } from "./data-display.js";
import { FixedGlyph } from "./internal/fixed-glyph.js";
import { MessageReactions, type MessageMenuAction } from "./internal/message-reactions.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { Heading } from "./heading.js";
import { Menu } from "./navigation.js";
import { EmptyState, Skeleton } from "./feedback.js";
function Pane({hidden=false,children}:{hidden?:boolean;children:ReactNode}){return <View style={{flex:1,display:hidden?"none":"flex"}}>{children}</View>;}

/** Copy, pending state and mutations are controlled by the consuming product. */
/** `icon` renders an icon-only button named by `label`; header actions (top-right) use it so a centered title keeps its width (2026-10-17). */
export type ScreenFlowAction = Readonly<{label:string; onAction():void; disabled?:boolean; pending?:boolean; icon?:ReactNode}>;
/** Header tool action (refresh, add): icon-only so it never pushes the centered title. A required text `add` made
 * products route exits ("취소") through it as a header text button (2026-10-17 screen review); exits use `exit`. */
export type ScreenFlowIconAction = ScreenFlowAction & Readonly<{icon:ReactNode}>;
function Action({action,secondary=false}:{action:ScreenFlowAction;secondary?:boolean}){if(action.icon)return <IconButton label={action.label} tone="ghost" disabled={!!(action.disabled||action.pending)} onPress={action.onAction}>{action.icon}</IconButton>;return <Button tone={secondary?"ghost":"primary"} disabled={!!(action.disabled||action.pending)} loading={action.pending??false} onPress={action.onAction}>{action.label}</Button>;}
type Base = Omit<ScreenLayoutProps,"children"|"footer">;
// Stacked footer/sheet buttons use Stack gap "xs" (actionGroupRecipe.stackedGap 8); 12 read as split groups (button.md, 2026-10-17).

export type ListDetailScreenProps = Base & { list:ReactNode; detail?:Pick<ScreenLayoutProps,"title"|"state"|"stateAction"|"notice"|"titleVisibility"|"headerAlignment"> & {content:ReactNode}; back:ScreenFlowAction; refresh?:ScreenFlowIconAction; loadMore?:ScreenFlowAction };
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state. */
// layoutStyle places the outer host that owns both panes, as on Web, so the screen keeps the same
// placement while list and detail swap. Passing it to the list ScreenLayout dropped it on detail.
// "더 보기" ends the list inside the scroll body, centered like LoadMore; the fixed footer is the bottom CTA slot (2026-10-17 review).
export function ListDetailScreen({list,detail,back,refresh,loadMore,layoutStyle,...screen}:ListDetailScreenProps){return <View style={[{flex:1},layoutStyle]}><Pane hidden={!!detail}><ScreenLayout {...screen} {...(refresh||screen.actions?{actions:<Stack axis="inline" gap="xs" align="center">{/* Refresh no longer replaces the screen's own actions (2026-10-16 composition review). */}{screen.actions}{refresh?<Action action={refresh} secondary/>:null}</Stack>}:{})}>{loadMore?<View style={{flexGrow:1,flexShrink:1,minHeight:0,gap:screenPatternRecipe.itemGap}}>{list}<View style={{alignItems:"center"}}><Action action={loadMore} secondary/></View></View>:list}</ScreenLayout></Pane>{detail?<Pane><ScreenLayout title={detail.title} {...(detail.titleVisibility === undefined ? {} : { titleVisibility: detail.titleVisibility })} {...(detail.headerAlignment === undefined ? {} : { headerAlignment: detail.headerAlignment })} {...(detail.state === undefined ? {} : {state:detail.state})} stateAction={detail.stateAction} notice={detail.notice} exit={{kind:"back",label:back.label,onPress:back.onAction,disabled:!!(back.disabled||back.pending)}}>{detail.content}</ScreenLayout></Pane>:null}</View>;}

export type EditorScreenProps = Omit<Base,"leading"|"exit"> & {children:ReactNode;submitPlacement?:"header"|"footer";dirty:boolean;submit:ScreenFlowAction;cancel:ScreenFlowAction;discard:Omit<Extract<AlertDialogRequest,{mode:"confirm"}>,"onConfirm"|"fallbackErrorMessage"> & {fallbackErrorMessage:string};draftStatus?:ReactNode};
export function EditorScreen({children,dirty,submitPlacement="footer",submit,cancel,discard,draftStatus,...screen}:EditorScreenProps){
 const [confirm,setConfirm]=useState(false);
 const cancelLocked=!!(cancel.disabled||cancel.pending||submit.pending);
 const submitAction={...submit,disabled:!!(submit.disabled||screen.state&&screen.state.kind!=="ready")};
 // A prompt opened before an external save must not bypass the current leave lock
 // or reappear once the save finishes. Keep the draft mounted throughout.
 useEffect(()=>{if(cancelLocked)setConfirm(false);},[cancelLocked]);
 // Preserve an async host result so AlertDialog can retain failure and retry.
 const leave=()=>{if(!cancelLocked)return cancel.onAction();};
 return <><ScreenLayout {...screen}
  exit={{kind:"close",label:cancel.label,disabled:cancelLocked,onPress:()=>{if(cancelLocked)return;if(dirty)setConfirm(true);else leave();}}}
  actions={submitPlacement==="header"?<Action action={submitAction}/>:screen.actions}
  footer={submitPlacement==="header"?draftStatus:<Stack gap="sm">{draftStatus}<Action action={submitAction}/></Stack>}
 >{children}</ScreenLayout><AlertDialog open={confirm&&!cancelLocked} onOpenChange={setConfirm} request={{...discard,mode:"confirm",onConfirm:leave}}/></>;
}

export type ProfileScreenProps = Base & {summary:ReactNode;edit:ScreenFlowAction;children?:ReactNode;accountActions?:ReactNode};
export function ProfileScreen({summary,edit,children,accountActions,...screen}:ProfileScreenProps){return <ScreenLayout {...screen}><Stack gap="xl"><CompositionLayout footer={<Action action={edit} secondary/>}>{summary}</CompositionLayout>{children}{accountActions}</Stack></ScreenLayout>;}

export type ModerationScreenProps = Base & {reasonPicker?:ReactNode;reasons:readonly {value:string;label:string}[];reason:string|null;onReasonChange(value:string):void;reasonLabel:string;children?:ReactNode;submit:ScreenFlowAction;block?:{action:ScreenFlowAction;confirmation:Extract<AlertDialogRequest,{mode:"confirm"}>}};
export function ModerationScreen({reasonPicker,reasons,reason,onReasonChange,reasonLabel,children,submit,block,...screen}:ModerationScreenProps){
 const [confirm,setConfirm]=useState(false);
 const hasBlock=!!block;
 // Withdrawing the action ends that confirmation session; a later action needs
 // a new explicit press even if the screen itself stays mounted.
 useEffect(()=>{if(!hasBlock)setConfirm(false);},[hasBlock]);
 return <><ScreenLayout {...screen} footer={<Stack gap="xs"><Action action={{...submit,disabled:submit.disabled||!!screen.state&&screen.state.kind!=="ready"||!reasons.some(item=>item.value===reason)}}/>{block?<Action action={{...block.action,onAction:()=>setConfirm(true)}} secondary/>:null}</Stack>}><Stack gap="lg">{reasonPicker??(reasons.length?<RadioGroup accessibilityLabel={reasonLabel} orientation="vertical" items={reasons} value={reason} onValueChange={value=>{if(value)onReasonChange(value);}}/>:null)}{children}</Stack></ScreenLayout>{block?<AlertDialog open={confirm} onOpenChange={setConfirm} request={block.confirmation}/>:null}</>;}


/** Source choice only: permission, capture, decoding and draft persistence belong to the host. */
export type PhotoSourceSheetProps = Readonly<{
 open:boolean;onOpenChange(open:boolean):void;onSelect(source:PhotoSource):void;
 labels:PhotoSourceLabels;disabled?:boolean;cameraAvailable?:boolean;
}>;
export function PhotoSourceSheet({open,onOpenChange,onSelect,labels,disabled=false,cameraAvailable=true}:PhotoSourceSheetProps){
 const queued=useRef<PhotoSource|null>(null);
 useEffect(()=>()=>{queued.current=null;},[]);
 // iOS cannot present a camera/picker over a dismissing Modal. Sheet owns the real
 // dismissal completion (including Android fallback), so a timer is not a safe substitute.
 const select=(source:PhotoSource)=>{if(disabled||queued.current)return;queued.current=source;onOpenChange(false);};
 const complete=()=>{const source=queued.current;queued.current=null;if(source&&!disabled&&(source!=="camera"||cameraAvailable))onSelect(source);};
 // A later close action is cancellation, even if the controlled owner previously
 // deferred closing after source selection. Do not launch that abandoned picker.
 const dismiss=(next:boolean)=>{if(!next)queued.current=null;onOpenChange(next);};
 return <Sheet open={open} onOpenChange={dismiss} title={labels.title} closeLabel={labels.cancel} onDismissComplete={complete}><Stack gap="xs">
 <Button tone="secondary" disabled={disabled} onPress={()=>select("library")}>{labels.library}</Button>
 {cameraAvailable?<Button tone="secondary" disabled={disabled} onPress={()=>select("camera")}>{labels.camera}</Button>:null}
 </Stack></Sheet>;
}

export type MediaSelectionItem = {descriptor:UploadItemDescriptor;preview?:ReactNode};
export type MediaSelectionScreenProps = Base & {library?:ReactNode;selectionSummary?:ReactNode;items:readonly MediaSelectionItem[];add?:ScreenFlowIconAction;done:ScreenFlowAction;labels:UploadItemLabels;actionLabels:{remove:string;moveUp:string;moveDown:string};removeLabel(item:MediaSelectionItem):string;moveUpLabel(item:MediaSelectionItem):string;moveDownLabel(item:MediaSelectionItem):string;onRemove(id:string):void;onMove(id:string,direction:-1|1):void;onRetry(id:string):void;onCancel(id:string):void};
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export function MediaSelectionScreen({library,selectionSummary,items,add,done,labels,actionLabels,removeLabel,moveUpLabel,moveDownLabel,onRemove,onMove,onRetry,onCancel,...screen}:MediaSelectionScreenProps){return <ScreenLayout {...screen} {...(add||screen.actions?{actions:<Stack axis="inline" gap="xs" align="center">{screen.actions}{add?<Action action={add}/>:null}</Stack>}:{})} footer={<Stack gap="sm">{selectionSummary}<Action action={done}/></Stack>}>{library??<Grid columns={{compact:2,expanded:3}} gap={{compact:"md"}}>{items.map((item,index)=><Stack key={item.descriptor.id} gap="xs">{item.preview}<UploadItem descriptor={item.descriptor} labels={labels} onRetry={onRetry} onCancel={onCancel}/><Stack axis="inline" gap="xxs" layoutStyle={{flexWrap:"wrap"}}><Button accessibilityLabel={moveUpLabel(item)} size="small" tone="ghost" disabled={index===0} onPress={()=>onMove(item.descriptor.id,-1)}>{actionLabels.moveUp}</Button><Button accessibilityLabel={moveDownLabel(item)} size="small" tone="ghost" disabled={index===items.length-1} onPress={()=>onMove(item.descriptor.id,1)}>{actionLabels.moveDown}</Button><Button accessibilityLabel={removeLabel(item)} size="small" tone="ghost" onPress={()=>onRemove(item.descriptor.id)}>{actionLabels.remove}</Button></Stack></Stack>)}</Grid>}</ScreenLayout>;}


/*
 * SearchScreen phase sections, Native twin of the Web ones in packages/react/src/screen-flows.tsx
 * (2026-10-06, user-delegated decision to lift the search preview logic into the public API; design:
 * packages/design-contracts/docs/screen-patterns.md, SearchScreen two-step section). Same data shapes as Web
 * except where the Native host needs more (Menu `dismissLabel`). Differences: ListRow titles are strings,
 * so suggestion matches are not bolded; focus is not moved after a removal (the screen reader keeps its
 * own cursor, and moving it programmatically would re-read the screen). Kept in this file for the same
 * module-count reason as Web (scripts/check-renderer-budgets.mjs).
 */

export type SearchRecentQueries = Readonly<{
  items: readonly string[];
  title: string;
  clearAllLabel: string;
  onClearAll(): void;
  removeLabel(query: string): string;
  onRemove(query: string): void;
  icon?: ReactNode;
  /** Glyph inside the remove button; defaults to "×". */
  removeIcon?: ReactNode;
  /** Rows shown; default `searchScreenRecipe.recentVisible` (5). */
  maxVisible?: number;
}>;
export type SearchSuggestedQueries = Readonly<{ title: string; items: readonly string[] }>;
/** `match` is accepted for parity with Web; Native ListRow titles are plain strings and are not bolded. */
export type SearchSuggestion = Readonly<{ query: string; match?: Readonly<{ start: number; end: number }> }>;
export type SearchSuggestions = Readonly<{
  items: readonly SearchSuggestion[];
  commitLabel(query: string): string;
  countLabel(count: number): string;
  icon?: ReactNode;
  maxVisible?: number;
}>;
export type SearchSortOption = Readonly<{ id: string; label: string }>;
export type SearchSort = Readonly<{
  label: string;
  triggerLabel: string;
  value: string;
  options: readonly SearchSortOption[];
  onChange(id: string): void;
  /** Native Menu sheets need a localized close action. */
  dismissLabel: string;
  icon?: ReactNode;
}>;
export type SearchResultSummary = Readonly<{
  count: number | null;
  /** Hide the visual total without losing loading, empty-state or announcement behavior. */
  countVisibility?: "visible" | "hidden";
  countLabel(count: number): string;
  loadingLabel: string;
  sort?: SearchSort;
  notice?: ReactNode;
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
export type SearchFilterSheetLabels = Readonly<{ close: string; reset: string; apply(count: number | null): string }>;
export type SearchFilterSheet<F> = Readonly<{
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  value: F;
  onApply(next: F): void;
  count(draft: F): number | null;
  reset(draft: F): F;
  isDefault(draft: F): boolean;
  renderContent(draft: F, setDraft: (next: F) => void): ReactNode;
  labels: SearchFilterSheetLabels;
  size?: SheetProps["size"];
  trigger?: Readonly<{ label(appliedCount: number): string; accessibilityLabel(appliedCount: number): string; icon?: ReactNode }>;
}>;

/** Announce only when the text changes; iOS queues it behind the current utterance instead of cutting it off. */
function useSearchAnnouncement(text: string) {
  useEffect(() => {
    if (!text) return;
    if (AccessibilityInfo.announceForAccessibilityWithOptions) AccessibilityInfo.announceForAccessibilityWithOptions(text, { queue: true });
    else AccessibilityInfo.announceForAccessibility(text);
  }, [text]);
}

function SearchIdleSections({ recent, suggested, legacy, onCommit }: {
  recent: SearchRecentQueries | undefined; suggested: SearchSuggestedQueries | undefined; legacy: ReactNode; onCommit(query: string): void;
}) {
  const visible = recent?.items.slice(0, Math.max(0, recent.maxVisible ?? searchScreenRecipe.recentVisible)) ?? [];
  // Without the structured sections the legacy `recentSearches` slot renders exactly as before 2026-10-06.
  if (!visible.length && !suggested?.items.length) return <>{legacy}</>;
  return <Stack gap="xl">
    {legacy}
    {recent && visible.length ? <Stack gap="sm">
      <Stack axis="inline" justify="between" align="center" gap="sm">
        <Heading level="level5">{recent.title}</Heading>
        <Button tone="ghost" size="small" onPress={recent.onClearAll}>{recent.clearAllLabel}</Button>
      </Stack>
      <Stack gap="xxs">{visible.map(item => <ListRow key={item} density="compact" leading={recent.icon} title={item} onPress={() => onCommit(item)}
        trailingAction={<IconButton label={recent.removeLabel(item)} tone="ghost" onPress={() => recent.onRemove(item)}>{recent.removeIcon ?? <FixedGlyph tone="muted">×</FixedGlyph>}</IconButton>} />)}</Stack>
    </Stack> : null}
    {suggested?.items.length ? <SearchSuggestedChips suggested={suggested} onCommit={onCommit} /> : null}
  </Stack>;
}

function SearchSuggestedChips({ suggested, onCommit }: { suggested: SearchSuggestedQueries; onCommit(query: string): void }) {
  return <Stack gap="sm">
    <Heading level="level5">{suggested.title}</Heading>
    <Stack axis="inline" wrap gap="xs">{suggested.items.map(item => <Chip key={item} label={item} onPress={() => onCommit(item)} />)}</Stack>
  </Stack>;
}

function SearchSuggestionList({ query, suggestions, onCommit }: { query: string; suggestions: SearchSuggestions; onCommit(query: string): void }) {
  const typed = query.trim();
  const items = suggestions.items.slice(0, Math.max(0, suggestions.maxVisible ?? searchScreenRecipe.suggestionVisible));
  return <Stack gap="xxs">
    <ListRow density="compact" leading={suggestions.icon} title={suggestions.commitLabel(typed)} onPress={() => onCommit(typed)} />
    {items.map(item => <ListRow key={item.query} density="compact" leading={suggestions.icon} title={item.query} onPress={() => onCommit(item.query)} />)}
  </Stack>;
}

function SearchResultsHeader({ summary, applied, cause, onSortChange }: {
  summary: SearchResultSummary | undefined; applied: SearchAppliedFilters | undefined; cause: SearchEmptyCause; onSortChange(id: string): void;
}) {
  const sort = summary?.sort;
  const showCount = summary && cause === "none" && summary.countVisibility !== "hidden";
  // A count-free search still owns its sorting action; do not hide it with the total.
  const showSort = summary && cause === "none" && sort;
  if (!summary?.notice && !showCount && !showSort && !applied?.items.length) return null;
  return <Stack gap="sm">
    {summary?.notice}
    {showCount || showSort ? <Stack axis="inline" justify={showCount ? "between" : "end"} align="center" gap="sm" wrap>
      {showCount ? (summary!.count === null ? <Skeleton shape="text" width="30%" /> : <Text tone="muted">{summary!.countLabel(summary!.count)}</Text>) : null}
      {sort ? <Menu triggerLabel={sort.triggerLabel} title={sort.label} dismissLabel={sort.dismissLabel}
        items={sort.options.map(option => ({ id: option.id, label: option.label }))}
        selection={{ mode: "single", selectedKey: sort.value, onSelectionChange: next => { if (next) onSortChange(next); } }}
        renderTrigger={trigger => <Button size="small" tone="ghost" accessibilityState={trigger.accessibilityState} onPress={trigger.onPress}
          {...(sort.icon === undefined ? {} : { trailing: sort.icon })}>{sort.triggerLabel}</Button>} /> : null}
    </Stack> : null}
    {applied?.items.length ? <Stack axis="inline" wrap gap="xs" align="center">
      {applied.items.map(item => <Chip key={item.key} label={item.label} accessibilityLabel={applied.removeLabel(item.label)}
        trailing={applied.removeIcon ?? <FixedGlyph tone="muted">×</FixedGlyph>} onPress={() => applied.onRemove(item.key)} />)}
      <Button tone="ghost" size="small" onPress={applied.onClearAll}>{applied.clearAllLabel}</Button>
    </Stack> : null}
  </Stack>;
}

function SearchResultsBody({ summary, applied, suggested, cause, onCommit, children }: {
  summary: SearchResultSummary | undefined; applied: SearchAppliedFilters | undefined; suggested: SearchSuggestedQueries | undefined;
  cause: SearchEmptyCause; onCommit(query: string): void; children: ReactNode;
}) {
  // The row owns its two-line geometry; only the first placeholder is an accessible status.
  if (summary?.count === null) return <Stack gap="xxs">{Array.from({ length: searchScreenRecipe.loadingRows }, (_, index) =>
    <ListRow key={index} loading title="" description={summary.loadingLabel} {...(index === 0 ? { loadingLabel: summary.loadingLabel } : {})} />)}</Stack>;
  if (cause === "none" || !summary?.empty) return <>{children}</>;
  return <Stack gap="lg">
    <EmptyState density="compact" announcement="polite" title={summary.empty.title} {...(summary.empty.description === undefined ? {} : { description: summary.empty.description })}
      {...(cause === "filters" && applied ? { action: <Button tone="secondary" onPress={applied.onClearAll}>{applied.clearAllLabel}</Button> } : {})} />
    {cause === "query" && suggested?.items.length ? <SearchSuggestedChips suggested={suggested} onCommit={onCommit} /> : null}
    {children}
  </Stack>;
}

function SearchFilterTrigger<F>({ sheet, appliedCount }: { sheet: SearchFilterSheet<F>; appliedCount: number }) {
  const trigger = sheet.trigger!;
  return <Chip label={trigger.label(appliedCount)} accessibilityLabel={trigger.accessibilityLabel(appliedCount)}
    {...(trigger.icon === undefined ? {} : { leading: trigger.icon })} onPress={() => sheet.onOpenChange(true)} />;
}

function SearchFilterSheetView<F>({ sheet }: { sheet: SearchFilterSheet<F> }) {
  // The draft lives only while the sheet is open: seeded from `value` on open, dropped on every close.
  const [session, setSession] = useState<{ draft: F } | null>(null);
  if (sheet.open && !session) setSession({ draft: sheet.value });
  if (!sheet.open && session) setSession(null);
  const draft = session ? session.draft : sheet.value;
  const setDraft = (next: F) => setSession(current => current ? { draft: next } : current);
  const count = sheet.count(draft);
  // Native sheet footers stack full-width buttons with the primary action first (sheet.md).
  const footer = <Stack gap="xs">
    <Button fullWidth disabled={count === 0} onPress={() => { sheet.onApply(draft); sheet.onOpenChange(false); }}>{sheet.labels.apply(count)}</Button>
    <Button fullWidth tone="secondary" disabled={sheet.isDefault(draft)} onPress={() => setDraft(sheet.reset(draft))}>{sheet.labels.reset}</Button>
  </Stack>;
  return <Sheet open={sheet.open} onOpenChange={open => sheet.onOpenChange(open)} title={sheet.title} closeLabel={sheet.labels.close}
    size={sheet.size ?? "large"} scrollable footer={footer}>
    {sheet.renderContent(draft, setDraft)}
  </Sheet>;
}

type SearchInputSlot = {queryField: ReactNode; queryClearLabel?: string} | {queryField?: never; queryClearLabel: string};
/** One name for the default field's progress on both platforms (Web SearchField `loading`, Native `busy`+`busyLabel`). */
type SearchProgressSlot = {searching?: never; searchingLabel?: never} | {searching: boolean; searchingLabel: string};
/** `committedQuery` turns on two-step search; every commit (keyboard search key, suggestion, recent, suggested query) then goes through `onSubmit`. */
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
export function SearchScreen<F = unknown>({query,queryLabel,queryField,queryClearLabel,onQueryChange,onSearch,debounceMs,filters,recentSearches,children,onSubmit,committedQuery,filtersOverflow="wrap",hostGutter="none",queryLabelVisibility="visible",searching,searchingLabel,recentQueries,suggestedQueries,suggestions,resultSummary,appliedFilters,filterSheet,...screen}:SearchScreenProps<F>){
 // The host owns localized copy. A custom queryField owns its own clear affordance.
 if (queryField == null && !queryClearLabel?.trim()) throw new TypeError("SearchScreen requires a localized queryClearLabel for its default search field");
 const searchDelay=resolveSearchDebounceMs(debounceMs);
 const callback=useRef(onSearch);callback.current=onSearch;
 useEffect(()=>{const controller=new AbortController();const timer=setTimeout(()=>callback.current(query,{signal:controller.signal}),searchDelay);return()=>{clearTimeout(timer);controller.abort();};},[query,searchDelay]);
 // Every commit path funnels through here so "only committed searches are recorded" holds at the API:
 // onSearch (debounced typing) never reaches onSubmit. Without onSubmit (one-step search) a pick only fills the field.
 // Every commit closes the keyboard so results get the screen. The search key already blurs the field; a picked
 // suggestion/recent/suggested query did not, and utilverse called Keyboard.dismiss() in onSubmit (1.13.0 adoption,
 // 2026-10-06). Done here, not in onSubmit, so one-step search (no onSubmit) behaves the same.
 const commit=(value:string)=>{const next=resolveSearchCommit(value);if(next===null)return;Keyboard.dismiss();if(next!==query)onQueryChange(next);onSubmit?.(next);};
 // onSubmit separates "typing" from "committed" without making products rebuild the default field through
 // queryField (2026-10-06 search redesign, usage/components/search-screen.md). The single-line TextInput keeps
 // its default blur-on-submit, so the keyboard closes and results get the screen. The debounce is left alone.
 const submitProps=onSubmit?{returnKeyType:"search" as const,onSubmitEditing:(event:NativeSyntheticEvent<TextInputSubmitEditingEventData>)=>commit(event.nativeEvent.text)}:{};
 // Hidden label: the placeholder names the search target and accessibilityLabel keeps the field named.
 const labelProps=queryLabelVisibility==="hidden"?{accessibilityLabel:queryLabel,placeholder:queryLabel}:{label:queryLabel};
 const phase=resolveSearchScreenPhase(query,committedQuery);
 const appliedCount=appliedFilters?.items.length??0;
 const cause=phase==="results"&&resultSummary?resolveSearchEmptyCause(resultSummary.count,appliedCount):"none";
 // Two-step search shows the rail only beside results, and a query-caused zero hides it (no filter can fix it).
 const showRail=(committedQuery===undefined||phase==="results")&&cause!=="query";
 const trigger=filterSheet?.trigger?<SearchFilterTrigger sheet={filterSheet} appliedCount={appliedCount}/>:null;
 const rail=!showRail?null:trigger&&filters!=null?<Stack axis="inline" gap="xs" wrap={filtersOverflow==="wrap"}>{trigger}{filters}</Stack>:trigger??filters;
 // Wrapping chips grow the pinned area line by line at large text; the scroll rail caps it at one row.
 // It bleeds over ScreenLayout's notice padding so chips scroll to the screen edge instead of clipping mid-chip.
 // With contentInset="none" the host owns the gutter, which SearchScreen cannot measure; `hostGutter` names it so the
 // rail still reaches the host edge (utilverse 1.13.0 adoption, 2026-10-06: the rail stopped at the Container/Sheet
 // padding). A token name, not a number, keeps product code off raw spacing. Rejected: measuring the window offset
 // (layout jump on the first frame, and wrong inside a centered max-width host).
 const inset=(screen.contentInset==="none"?0:screenPatternRecipe.padding)+containerRecipe.gutters[hostGutter];
 const filterSlot=rail!=null&&filtersOverflow==="scroll"?<ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{marginHorizontal:-inset,flexGrow:0}} contentContainerStyle={{paddingHorizontal:inset}}>{rail}</ScrollView>:rail;
 const visibleSuggestions=suggestions?.items.slice(0,Math.max(0,suggestions.maxVisible??searchScreenRecipe.suggestionVisible)).length??0;
 const countAnnouncement=phase==="typing"&&suggestions?suggestions.countLabel(visibleSuggestions):phase==="results"&&resultSummary&&resultSummary.count!==null?resultSummary.countLabel(resultSummary.count):"";
 // Same text as the Web status region: the busy indicator's label is only read when focused, so progress is announced too.
 useSearchAnnouncement(searching&&searchingLabel?searchingLabel:countAnnouncement);
 const scrollView=useRef<ScrollView|null>(null);
 const scrollRef=(node:ScrollView|null)=>{scrollView.current=node;const own=screen.scrollRef;if(typeof own==="function")own(node);else if(own)(own as {current:ScrollView|null}).current=node;};
 // A new order starts at the top; the previous offset would land mid-list in unrelated results.
 const changeSort=(id:string)=>{resultSummary?.sort?.onChange(id);scrollView.current?.scrollTo?.({y:0,animated:false});};
 const idle=<SearchIdleSections recent={recentQueries} suggested={suggestedQueries} legacy={recentSearches} onCommit={commit}/>;
 const body=phase==="idle"?<>{idle}{committedQuery===undefined?children:null}</>
  :phase==="typing"?(suggestions?<SearchSuggestionList query={query} suggestions={suggestions} onCommit={commit}/>:null)
  :<><SearchResultsHeader summary={resultSummary} applied={appliedFilters} cause={cause} onSortChange={changeSort}/>
   <SearchResultsBody summary={resultSummary} applied={appliedFilters} suggested={suggestedQueries} cause={cause} onCommit={commit}>{children}</SearchResultsBody></>;
 return <><ScreenLayout {...screen} scrollRef={scrollRef} notice={<Stack gap="sm">{queryField??<SearchField {...labelProps} clearLabel={queryClearLabel!} value={query} onValueChange={onQueryChange} busy={searching??false} busyLabel={searchingLabel??queryLabel} {...submitProps}/>}{filterSlot}{screen.notice}</Stack>}><Stack gap="lg">{body}</Stack></ScreenLayout>
  {filterSheet?<SearchFilterSheetView sheet={filterSheet}/>:null}</>;
}

export type PermissionScreenProps = Base & {status:PermissionScreenStatus;illustration?:ReactNode;explanation:ReactNode;request:ScreenFlowAction;settings:ScreenFlowAction;continueAction:ScreenFlowAction;skip?:ScreenFlowAction};
export function PermissionScreen({status,illustration,explanation,request,settings,continueAction,skip,...screen}:PermissionScreenProps){const kind=resolvePermissionAction(status);const primary=kind==="request"?request:kind==="settings"?settings:kind==="continue"?continueAction:null;return <ScreenLayout {...screen} footer={<Stack gap="xs">{primary?<Action action={primary}/>:null}{skip?<Action action={skip} secondary/>:null}</Stack>}><Stack gap="xl" align="center">{illustration}{explanation}</Stack></ScreenLayout>;}

export type OnboardingStep = {id:string;title:string;description:string;content:ReactNode};
export type OnboardingScreenProps = {steps:readonly OnboardingStep[];index:number;onIndexChange(index:number):void;nextLabel:string;backLabel:string;complete:ScreenFlowAction;skip?:ScreenFlowAction;progressLabel(index:number,total:number):string;layoutStyle?:ScreenLayoutProps["layoutStyle"]};
// Large headings and a software keyboard can consume the entire fixed header
// area. Keep step guidance in the existing scroll body, with completion actions fixed.
export function OnboardingScreen({steps,index,onIndexChange,nextLabel,backLabel,complete,skip,progressLabel,layoutStyle}:OnboardingScreenProps){const position=resolveOnboardingStep(steps.length,index);const step=steps[index]!;
 // Completion and skip persist the same flow: keep navigation stable until the receipt.
 const scrollRef=useRef<ScrollView|null>(null);
 // A new step starts at its guidance even when the previous story was scrolled.
 useEffect(()=>{scrollRef.current?.scrollTo({y:0,animated:false});},[index]);
 const pending=!!(complete.pending||skip?.pending);
 return <ScreenLayout scrollRef={scrollRef} {...(layoutStyle===undefined?{}:{layoutStyle})} title={step.title} header={<></>} footer={<Stack gap="xs"><Action action={position.last?{...complete,disabled:!!(complete.disabled||pending)}:{label:nextLabel,disabled:pending,onAction:()=>onIndexChange(index+1)}}/>{!position.first?<Action action={{label:backLabel,disabled:pending,onAction:()=>onIndexChange(index-1)}} secondary/>:null}</Stack>}><Stack gap="md"><Text variant="titleLarge" accessibilityRole="header">{step.title}</Text><Text tone="muted">{step.description}</Text><Text variant="caption" tone="muted">{progressLabel(index+1,steps.length)}</Text>{skip?<Action action={{...skip,disabled:!!(skip.disabled||pending)}} secondary/>:null}{step.content}</Stack></ScreenLayout>;}

export type CommentThreadItem = Readonly<{id:string;parentId:string|null;author:string;body:ReactNode;bodyText?:string;timeLabel:string;timeDateTime?:string;likeCountLabel:string;avatar?:ReactNode;likeIcon:ReactNode;likeLabel:string;likeAction?:ReactNode;actions?:ReactNode;canReply?:boolean;replyDisabled?:boolean;
 /** Long-press the comment (author and body) to react; the product owns the stored value and summary. */
 reactions?:CommentReactions;reactionSummary?:ReactNode;
 /** Optional photo or sticker under the body; HJM bounds its width and corners, the product sizes the image. */
 media?:ReactNode}>;
export type CommentReactions = ReactionPickerProps & Readonly<{closeLabel:string;menuAction?:Readonly<{label:string;onPress():void;disabled?:boolean}>;menuActions?:readonly MessageMenuAction[];reportAction?:Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;interactiveContent?:boolean;/** Icon for the automatic "reply" row of the hold menu. */replyIcon?:ReactNode}>;
/**
 * HJM-owned "more" menu per comment (2026-10-17: common comment structure belongs to HJM, review S4#7). HJM draws the
 * vertical-dots button at the row's trailing edge and opens the shared Menu sheet with danger items last; the product
 * supplies only the localized names, the items allowed for that comment and the action callback.
 */
export type CommentMenu = Readonly<{
  /** Localized accessible name of the button and menu title, e.g. "seoyeon 댓글 더 보기". */
  label(item: CommentThreadItem): string;
  /** Localized name of the Menu sheet's dismiss action (Native Menu requires one). */
  dismissLabel: string;
  /** Items allowed for this comment (permission is product-owned). An empty list omits the button for that row. */
  items(item: CommentThreadItem): readonly CommentMenuItemDescriptor[];
  /** Runs after the sheet closes, so a confirmation dialog does not stack on the closing modal. */
  onAction(item: CommentThreadItem, id: string): void;
}>;
export type CommentThreadScreenProps = Base & {items:readonly CommentThreadItem[];expandedIds:readonly string[];onExpandedChange(id:string):void;onLike(id:string):void;onReply(id:string):void;replyLabel:string;repliesLabel(count:number,expanded:boolean):string;composer?:ReactNode;threadHeader?:ReactNode;threadFooter?:ReactNode;commentMenu?:CommentMenu};
export type CommentThreadRowProps = Readonly<{ layoutStyle?: ScreenLayoutProps["layoutStyle"]; item: CommentThreadItem; onLike(id: string): void; onReply(id: string): void; replyLabel: string; commentMenu?: CommentMenu }>;
/** Quiet secondary actions (reply, expand) read as muted copy beside the body, not as filled buttons. */
function CommentTextAction({label,onPress,disabled=false,expanded}:Readonly<{label:string;onPress():void;disabled?:boolean;expanded?:boolean}>){
 return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled,...(expanded===undefined?{}:{expanded})}} disabled={disabled} hitSlop={commentThreadRecipe.avatarGap} onPress={onPress} style={{alignSelf:"flex-start",opacity:disabled?0.5:1}}><Text variant="caption" tone="muted" emphasis="strong">{label}</Text></Pressable>;
}

function CommentMenuButton({item,menu}:Readonly<{item:CommentThreadItem;menu:CommentMenu}>){
 const {palette}=useHjmNativeTheme();
 const items=resolveCommentMenuItems(menu.items(item));
 if(!items.length)return null;
 const label=menu.label(item);
 return <Menu triggerLabel={label} title={label} dismissLabel={menu.dismissLabel} items={items.map(entry=>({id:entry.id,label:entry.label,...(entry.tone===undefined?{}:{tone:entry.tone}),...(entry.disabled===undefined?{}:{disabled:entry.disabled})}))}
  onActionAfterDismiss={id=>menu.onAction(item,id)} renderTrigger={trigger=><IconButton label={label} tone="ghost" onPress={trigger.onPress}><DrawnMoreVertical size={commentThreadRecipe.menuGlyphSize} color={resolveIconButtonPresentation("ghost",palette).content}/></IconButton>}/>;
}

/** Virtualized hosts reuse the same row as CommentThreadScreen; product slots add content, not a second layout. */
export function CommentThreadRow({ item, onLike, onReply, replyLabel, layoutStyle, commentMenu }: CommentThreadRowProps) {
 const avatarSize=item.parentId===null?commentThreadRecipe.avatarSize:commentThreadRecipe.replyAvatarSize;
 // The like count sits under the heart so the text column carries only identity, body and reply.
 return <Stack key={item.id} axis="inline" align="start" gap="xs" {...(layoutStyle === undefined ? {} : {layoutStyle})}>{item.avatar?<View style={{width:avatarSize,alignItems:"center"}}>{item.avatar}</View>:null}<View style={{flex:1,minWidth:0,gap:commentThreadRecipe.lineGap}}>
 {/* Only identity and body are the hold target, so the reply action keeps its own button semantics. */}
 {(()=>{const identity=<>{item.bodyText!==undefined?<Text><Text emphasis="strong">{item.author}</Text>{" "}{item.bodyText}</Text>:(item.author||item.timeLabel)?<Stack axis="inline" gap="xxs" align="center" layoutStyle={{flexWrap:"wrap"}}>{item.author?<Text variant="caption" emphasis="strong">{item.author}</Text>:null}{item.timeLabel?<Text variant="caption" tone="muted">{item.timeLabel}</Text>:null}</Stack>:null}
 {item.body}{item.media?<View style={{maxWidth:commentThreadRecipe.mediaMaxWidth,borderRadius:commentThreadRecipe.mediaRadius,overflow:"hidden",marginTop:commentThreadRecipe.avatarGap/2,alignSelf:"flex-start"}}>{item.media}</View>:null}</>;return item.reactions?<MessageReactions previewSurface {...item.reactions} {...((item.canReply??item.parentId===null)&&!item.replyDisabled ? {replyAction:{label:replyLabel,onPress:()=>onReply(item.id),...(item.reactions.replyIcon===undefined?{}:{icon:item.reactions.replyIcon})}} : {})}><View style={{gap:commentThreadRecipe.lineGap}}>{identity}</View></MessageReactions>:identity;})()}
 {(item.bodyText!==undefined&&item.timeLabel)||(item.canReply??item.parentId===null)||item.reactionSummary?<Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap:"wrap"}}>{item.bodyText!==undefined&&item.timeLabel?<Text variant="caption" tone="muted">{item.timeLabel}</Text>:null}{item.reactionSummary}{(item.canReply??item.parentId===null)?<CommentTextAction label={replyLabel} disabled={item.replyDisabled??false} onPress={()=>onReply(item.id)}/>:null}</Stack>:null}</View>
 <View style={{flexShrink:0}}><Stack axis="inline" gap="xxs" align="center" layoutStyle={{flexShrink:0}}>{item.likeAction!==undefined?item.likeAction:<IconButton label={item.likeLabel} tone="ghost" onPress={()=>onLike(item.id)}>{item.likeIcon}</IconButton>}{item.actions}{commentMenu?<CommentMenuButton item={item} menu={commentMenu}/>:null}</Stack>{item.likeCountLabel?<View style={{width:commentThreadRecipe.likeColumnWidth}}><Text variant="caption" tone="muted" align="center">{item.likeCountLabel}</Text></View>:null}</View></Stack>;
}

/** Controlled thread: server ordering, permission checks and receipt-based draft clearing belong to the product. */
export function CommentThreadScreen({items,expandedIds,onExpandedChange,onLike,onReply,replyLabel,repliesLabel,composer,threadHeader,threadFooter,commentMenu,...screen}:CommentThreadScreenProps){
 validateCommentThread(items);
 // Index replies once; rescanning every item for each root makes long threads quadratic.
 const roots:CommentThreadItem[]=[], repliesByParent=new Map<string,CommentThreadItem[]>();
 const expanded=new Set(expandedIds);
 for(const item of items){
  if(item.parentId===null)roots.push(item);
  else {const siblings=repliesByParent.get(item.parentId);if(siblings)siblings.push(item);else repliesByParent.set(item.parentId,[item]);}
 }
 const row=(item:CommentThreadItem)=><CommentThreadRow key={item.id} item={item} onLike={onLike} onReply={onReply} replyLabel={replyLabel} {...(commentMenu===undefined?{}:{commentMenu})}/>;
 // Product context belongs in the same scroll body as comments. Putting a tall
 // overview in the fixed header forced a second scroll region in Spint (2026-10-08).
 return <ScreenLayout {...screen} footer={!screen.state||screen.state.kind==="ready"||screen.state.kind==="empty"?composer:null}><Stack gap="lg">{threadHeader}<View style={{gap:commentThreadRecipe.rowGap}}>{roots.map(item=>{const replies=repliesByParent.get(item.id)??[];return <View key={item.id} style={{gap:commentThreadRecipe.rowGap}}>{row(item)}{replies.length?<View style={{gap:commentThreadRecipe.rowGap,marginStart:commentThreadRecipe.replyIndent}}><CommentTextAction label={repliesLabel(replies.length,expanded.has(item.id))} expanded={expanded.has(item.id)} onPress={()=>onExpandedChange(item.id)}/>{expanded.has(item.id)?replies.map(row):null}</View>:null}</View>;})}</View>{threadFooter}</Stack></ScreenLayout>;
}

export type ProfileSummaryProps = Readonly<{
  name: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  avatar: ReactNode;
  badge?: ReactNode;
  nameActions?: ReactNode;
  stats?: readonly Readonly<{ id: string; value: string; label: string; onPress?(): void; disabled?: boolean }>[];
  actions?: ReactNode;
  children?: ReactNode;
}>;

/** Profile identity and counts are common; routing and mutations stay controlled by the product. */
export function ProfileSummary({ name, headingLevel = 2, avatar, badge, nameActions, stats = [], actions, children }: ProfileSummaryProps) {
  return <CompositionLayout title={name} headingLevel={headingLevel} leading={<View style={{ width: profileSummaryRecipe.avatarSize, height: profileSummaryRecipe.avatarSize, flexShrink: 0, borderRadius: profileSummaryRecipe.avatarSize / 2, overflow: "hidden" }}>{avatar}</View>} badge={badge} actions={nameActions} footer={children}>
    {/* Static and actionable counts occupy identical cells; button hit areas must not shift their baselines. */}
    {stats.length ? <Stack axis="inline" gap="md" align="stretch" layoutStyle={{ width: "100%" }}>{stats.map(stat =>
      <Stack key={stat.id} gap="xxs" align="center" justify="center" layoutStyle={{ flex: 1, minWidth: 0 }}>
        {stat.onPress ? <Button tone="ghost" accessibilityLabel={`${stat.value} ${stat.label}`} disabled={stat.disabled ?? false} onPress={stat.onPress} layoutStyle={{ width: "100%" }}><Stack gap="xxs" align="center"><Text emphasis="strong">{stat.value}</Text><Text variant="caption" tone="muted">{stat.label}</Text></Stack></Button>
          : <><Text emphasis="strong">{stat.value}</Text><Text variant="caption" tone="muted">{stat.label}</Text></>}
      </Stack>)}</Stack> : null}
    {actions ? <Stack axis="inline" gap="sm" wrap>{actions}</Stack> : null}
  </CompositionLayout>;
}
