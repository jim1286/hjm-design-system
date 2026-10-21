import type { ComponentRef } from "react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { TextArea } from "./inputs.js";
import { CompositionLayout, ScreenLayout, type ScreenLayoutProps } from "./screens.js";
import { ScreenExitButton } from "./internal/screen-exit.js";
import { Button, IconButton } from "./actions.js";
import { Stack, Text, Grid } from "./primitives.js";
import { SearchField } from "./inputs.js";
import { Chip, RadioGroup } from "./inputs.js";
import { AlertDialog, Sheet, type SheetProps } from "./overlays.js";
import { UploadItem } from "./upload-item.js";
import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import { type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { initialFocusDefaults, validateCommentThread, resolvePermissionAction, resolveOnboardingStep, resolveSearchCommit, resolveSearchDebounceMs, resolveSearchEmptyCause, resolveSearchFilterRailVisible, resolveSearchScreenPhase, screenPatternRecipe, commentThreadRecipe, profileSummaryRecipe, searchScreenRecipe, resolveCommentMenuItems, type CommentMenuItemDescriptor, type SearchEmptyCause, type SearchFiltersRole, type PermissionScreenStatus, type PhotoSource, type PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { iconButtonRecipe, resolveIconButtonEdgeOverhang, resolveIconButtonPresentation } from "@hjmds/design-contracts/recipes";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { DrawnMoreVertical } from "./internal/drawn-glyphs.js";
import { MediaAlbumView, useMediaAlbumIndex, type MediaAlbum } from "./internal/media-album.js";
import { validateMediaSetChoice } from "@hjmds/design-contracts/screen-patterns";
export type { MediaAlbum } from "./internal/media-album.js";
import { useHjmNativeTheme } from "./provider.js";
import { AccessibilityInfo, Keyboard, Pressable, ScrollView, View, type TextInputProps } from "react-native";
import { containerRecipe, type ContainerGutter } from "@hjmds/design-contracts/components/container";
import { ListRow } from "./data-display.js";
import { PhotoSourceIcon } from "./internal/photo-source-icon.js";
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
 * products route exits (a "Cancel" label) through it as a header text button (2026-10-17 screen review); exits use `exit`. */
export type ScreenFlowIconAction = ScreenFlowAction & Readonly<{icon:ReactNode}>;
// `edge`: the action ends a header/row edge (IconButton/Button edge rule, 2026-10-17 audit); framed tones ignore it.
function Action({action,secondary=false,edge}:{action:ScreenFlowAction;secondary?:boolean;edge?:"start"|"end"}){if(action.icon)return <IconButton label={action.label} tone="ghost" {...(edge?{edge}:{})} disabled={!!(action.disabled||action.pending)} onPress={action.onAction}>{action.icon}</IconButton>;return <Button tone={secondary?"ghost":"primary"} {...(edge?{edge}:{})} disabled={!!(action.disabled||action.pending)} loading={action.pending??false} onPress={action.onAction}>{action.label}</Button>;}
type Base = Omit<ScreenLayoutProps,"children"|"footer">;
// Stacked footer/sheet buttons use Stack gap "xs" (actionGroupRecipe.stackedGap 8); 12 read as split groups (button.md, 2026-10-17).

export type ListDetailScreenProps = Base & { footer?:ScreenLayoutProps["footer"]; list:ReactNode; detail?:Pick<ScreenLayoutProps,"title"|"state"|"stateAction"|"notice"|"titleVisibility"|"headerAlignment"|"actions"|"footer"> & {content:ReactNode}; back:ScreenFlowAction; refresh?:ScreenFlowIconAction; loadMore?:ScreenFlowAction };
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state.
 * Both panes reach the same window bottom, so `safeAreaBottom` goes to each (yajalal detail content sat under the home indicator, 2026-10-17). */
// layoutStyle places the outer host that owns both panes, as on Web, so the screen keeps the same
// placement while list and detail swap. Passing it to the list ScreenLayout dropped it on detail.
// "Load more" ends the list inside the scroll body, centered like LoadMore; the fixed footer is the bottom CTA slot (2026-10-17 review).
export function ListDetailScreen({list,detail,back,refresh,loadMore,layoutStyle,...screen}:ListDetailScreenProps){return <View style={[{flex:1},layoutStyle]}><Pane hidden={!!detail}><ScreenLayout {...screen} {...(refresh||screen.actions?{actions:<Stack axis="inline" gap="xs" align="center">{/* Refresh no longer replaces the screen's own actions (2026-10-16 composition review). */}{screen.actions}{refresh?<Action action={refresh} secondary edge="end"/>:null}</Stack>}:{})}>{loadMore?<View style={{flexGrow:1,flexShrink:1,minHeight:0,gap:screenPatternRecipe.itemGap}}>{list}<View style={{alignItems:"center"}}><Action action={loadMore} secondary/></View></View>:list}</ScreenLayout></Pane>{detail?<Pane><ScreenLayout title={detail.title} {...(detail.titleVisibility === undefined ? {} : { titleVisibility: detail.titleVisibility })} {...(detail.headerAlignment === undefined ? {} : { headerAlignment: detail.headerAlignment })} {...(detail.state === undefined ? {} : {state:detail.state})} stateAction={detail.stateAction} notice={detail.notice} actions={detail.actions} footer={detail.footer} {...(screen.safeAreaBottom===undefined?{}:{safeAreaBottom:screen.safeAreaBottom})} exit={{kind:"back",label:back.label,onPress:back.onAction,disabled:!!(back.disabled||back.pending)}}>{detail.content}</ScreenLayout></Pane>:null}</View>;}

export type EditorScreenProps = Omit<Base,"leading"|"exit"> & {children:ReactNode;submitPlacement?:"header"|"footer";dirty:boolean;submit:ScreenFlowAction;cancel:ScreenFlowAction;discard:Omit<Extract<AlertDialogRequest,{mode:"confirm"}>,"onConfirm"|"fallbackErrorMessage"> & {fallbackErrorMessage:string};draftStatus?:ReactNode;
 /** Multi-step editor: while supplied, the header exit is a back chevron that returns to the previous step instead of
  * the cancel ×, and never opens the discard prompt (stepping back keeps the draft). Omit it on the first step so the
  * exit leaves through `cancel` again (2026-10-18: spint compose replaced the header with its own TopBar for this). */
 stepBack?:ScreenFlowAction};
export function EditorScreen({children,dirty,submitPlacement="footer",submit,cancel,discard,draftStatus,stepBack,initialFocus=initialFocusDefaults.editor,...screen}:EditorScreenProps){
 const [confirm,setConfirm]=useState(false);
 const cancelLocked=!!(cancel.disabled||cancel.pending||submit.pending);
 const submitAction={...submit,disabled:!!(submit.disabled||screen.state&&screen.state.kind!=="ready")};
 // A prompt opened before an external save must not bypass the current leave lock
 // or reappear once the save finishes. Keep the draft mounted throughout.
 const stepping=!!stepBack,stepLocked=!!(stepBack?.disabled||stepBack?.pending||submit.pending);
 // A step-back exit replaces the cancel exit, so a discard prompt opened from the cancel exit cannot outlive it.
 useEffect(()=>{if(cancelLocked||stepping)setConfirm(false);},[cancelLocked,stepping]);
 // Preserve an async host result so AlertDialog can retain failure and retry.
 const leave=()=>{if(!cancelLocked)return cancel.onAction();};
 // Writing is the screen's purpose: focus the first field on entry unless the host opts out (2026-10-18).
 return <><ScreenLayout {...screen} initialFocus={initialFocus}
  exit={stepBack?{kind:"back",label:stepBack.label,disabled:stepLocked,onPress:()=>{if(!stepLocked)stepBack.onAction();}}
   :{kind:"close",label:cancel.label,disabled:cancelLocked,onPress:()=>{if(cancelLocked)return;if(dirty)setConfirm(true);else leave();}}}
  actions={submitPlacement==="header"?<Action action={submitAction}/>:screen.actions}
  footer={submitPlacement==="header"?draftStatus:<Stack gap="sm">{draftStatus}<Action action={submitAction}/></Stack>}
 >{children}</ScreenLayout><AlertDialog open={confirm&&!cancelLocked&&!stepping} onOpenChange={setConfirm} request={{...discard,mode:"confirm",onConfirm:leave}}/></>;
}

export type ProfileScreenProps = Base & {summary:ReactNode;edit:ScreenFlowAction;children?:ReactNode;accountActions?:ReactNode;
 /** `below-summary` (default): ghost button under the summary. `summary`: the edit action goes first in the action row
  * of the ProfileSummary inside `summary` (2026-10-15 utilverse account decision: the edit action belongs inside the
  * profile card). With `summary`, the slot must contain a ProfileSummary, or the edit action is not drawn. */
 editPlacement?:"below-summary"|"summary"};
// Hands ProfileScreen's edit action to the ProfileSummary inside its summary slot, wherever the product nests it.
const ProfileEditContext=createContext<ScreenFlowAction|undefined>(undefined);
export function ProfileScreen({summary,edit,children,accountActions,editPlacement="below-summary",...screen}:ProfileScreenProps){return <ScreenLayout {...screen}><Stack gap="xl">{editPlacement==="summary"?<ProfileEditContext.Provider value={edit}>{summary}</ProfileEditContext.Provider>:<CompositionLayout footer={<Action action={edit} secondary/>}>{summary}</CompositionLayout>}{children}{accountActions}</Stack></ScreenLayout>;}

/** Operator decision on a report (dismiss, hide, uphold, overturn…). Labels are product copy; ids are product keys.
 * With `confirmation`, pressing opens that AlertDialog and only its `onConfirm` acts (same rule as `block`). */
export type ModerationDecision = ScreenFlowAction & Readonly<{id:string;tone?:"primary"|"secondary"|"danger";confirmation?:Extract<AlertDialogRequest,{mode:"confirm"}>}>;
/** Free-text decision reason. `required` (default true) keeps every decision locked until it has non-blank text. */
export type ModerationDecisionReason = Readonly<{label:string;value:string;onValueChange(value:string):void;description?:string;maxLength?:number;required?:boolean;disabled?:boolean}>;
type ModerationReportFields = {variant?:"report";reasonPicker?:ReactNode;reasons:readonly {value:string;label:string}[];reason:string|null;onReasonChange(value:string):void;reasonLabel:string;children?:ReactNode;submit:ScreenFlowAction;block?:{action:ScreenFlowAction;confirmation:Extract<AlertDialogRequest,{mode:"confirm"}>}};
/** Operator review (2026-10-18: utilverse review and appeal queues hand-built this with TextArea, buttons and Alert):
 * `children` shows the reported content, then the reason field and the decisions; `resolution` replaces both once decided. */
type ModerationReviewFields = {variant:"review";children?:ReactNode;decisionReason:ModerationDecisionReason;decisions:readonly ModerationDecision[];resolution?:ReactNode};
export type ModerationFields = ModerationReportFields|ModerationReviewFields;
export type ModerationScreenProps = Base & ModerationFields;
/** Body, stacked actions and confirmations shared by ModerationScreen (screen chrome) and ModerationForm (none). */
function useModeration(fields:ModerationFields,ready:boolean,cancel?:ScreenFlowAction):{body:ReactNode;actions:ReactNode;dialogs:ReactNode}{
 const [confirm,setConfirm]=useState(false);
 const [confirmId,setConfirmId]=useState<string|null>(null);
 const review=fields.variant==="review"?fields:null,report=fields.variant==="review"?null:fields;
 const hasBlock=!!report?.block;
 // Withdrawing the action ends that confirmation session; a later action needs
 // a new explicit press even if the screen itself stays mounted.
 useEffect(()=>{if(!hasBlock)setConfirm(false);},[hasBlock]);
 const confirming=review&&!review.resolution?review.decisions.find(decision=>decision.id===confirmId&&decision.confirmation):undefined;
 // Same rule for a decision: its confirmation closes when the decision or its confirmation is withdrawn or resolved.
 useEffect(()=>{if(confirmId!==null&&!confirming)setConfirmId(null);},[confirmId,confirming]);
 const cancelAction=cancel?<Action action={cancel} secondary/>:null;
 if(review){
  const busy=review.decisions.some(decision=>decision.pending);
  const reasonMissing=(review.decisionReason.required??true)&&!review.decisionReason.value.trim();
  const field=review.resolution??<TextArea label={review.decisionReason.label} value={review.decisionReason.value} onValueChange={review.decisionReason.onValueChange}
   {...(review.decisionReason.description===undefined?{}:{description:review.decisionReason.description})} {...(review.decisionReason.maxLength===undefined?{}:{maxLength:review.decisionReason.maxLength})}
   required={review.decisionReason.required??true} disabled={!!review.decisionReason.disabled||busy}/>;
  // One decision at a time: a pending decision locks the others and the reason it was taken with.
  const decisions=review.resolution?[]:review.decisions.map(decision=>{const locked=!!decision.disabled||busy||!ready||reasonMissing;
   return <Button key={decision.id} tone={decision.tone??"secondary"} disabled={locked} loading={decision.pending??false} onPress={()=>{if(locked)return;if(decision.confirmation)setConfirmId(decision.id);else decision.onAction();}}>{decision.label}</Button>;});
  return {body:<Stack gap="lg">{review.children}{field}</Stack>,
   actions:decisions.length||cancelAction?<Stack gap="xs">{decisions}{cancelAction}</Stack>:null,
   dialogs:confirming?.confirmation?<AlertDialog open onOpenChange={open=>{if(!open)setConfirmId(null);}} request={confirming.confirmation}/>:null};
 }
 const r=report!;
 return {body:<Stack gap="lg">{r.reasonPicker??(r.reasons.length?<RadioGroup accessibilityLabel={r.reasonLabel} orientation="vertical" items={r.reasons} value={r.reason} onValueChange={value=>{if(value)r.onReasonChange(value);}}/>:null)}{r.children}</Stack>,
  actions:<Stack gap="xs"><Action action={{...r.submit,disabled:r.submit.disabled||!ready||!r.reasons.some(item=>item.value===r.reason)}}/>{r.block?<Action action={{...r.block.action,onAction:()=>setConfirm(true)}} secondary/>:null}{cancelAction}</Stack>,
  dialogs:r.block?<AlertDialog open={confirm} onOpenChange={setConfirm} request={r.block.confirmation}/>:null};
}
// Every key of either variant, so the rest of the props reach ScreenLayout unchanged whichever variant is used.
const moderationFieldKeys=["variant","reasonPicker","reasons","reason","onReasonChange","reasonLabel","children","submit","block","decisionReason","decisions","resolution"] as const;
export function ModerationScreen(props:ModerationScreenProps){
 const screen:Record<string,unknown>={...props};for(const key of moderationFieldKeys)delete screen[key];
 const {body,actions,dialogs}=useModeration(props,!props.state||props.state.kind==="ready");
 return <><ScreenLayout {...screen as Base} footer={actions}>{body}</ScreenLayout>{dialogs}</>;
}
/** The moderation fields and actions without screen chrome, for a report opened inside a letter, card or Sheet
 * (2026-10-18: diairy turned ModerationScreen's header and padding off to place it in a letter). The host owns the
 * surrounding surface and placement; `title` is an optional section heading (omit it inside a titled Sheet) and
 * `cancel` adds a ghost "collapse" action after the others.
 * `description` and `actions` fill the same CompositionLayout header (2026-10-18: utilverse review queues wrapped the
 * form in a second CompositionLayout only to show the report time and a refresh button beside the title). */
export type ModerationFormProps = ModerationFields & Readonly<{title?:string;headingLevel?:1|2|3|4|5|6;description?:string;actions?:ReactNode;cancel?:ScreenFlowAction;layoutStyle?:ScreenLayoutProps["layoutStyle"]}>;
export function ModerationForm(props:ModerationFormProps){
 const {body,actions,dialogs}=useModeration(props,true,props.cancel);
 return <><CompositionLayout {...(props.title===undefined?{}:{title:props.title})} {...(props.headingLevel===undefined?{}:{headingLevel:props.headingLevel})} {...(props.description===undefined?{}:{description:props.description})} {...(props.actions===undefined?{}:{actions:props.actions})} {...(props.layoutStyle===undefined?{}:{layoutStyle:props.layoutStyle})} footer={actions}>{body}</CompositionLayout>{dialogs}</>;
}


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
 // Source choices are peer list actions; the shared row owns touch geometry and label alignment.
 return <Sheet open={open} onOpenChange={dismiss} title={labels.title} closeLabel={labels.cancel} onDismissComplete={complete}><Stack gap="xxs">
 <ListRow title={labels.library} leading={<PhotoSourceIcon source="library"/>} disabled={disabled} onPress={()=>select("library")}/>
 {cameraAvailable?<ListRow title={labels.camera} leading={<PhotoSourceIcon source="camera"/>} disabled={disabled} onPress={()=>select("camera")}/>:null}
 </Stack></Sheet>;
}

export type MediaSelectionItem = {descriptor:UploadItemDescriptor;preview?:ReactNode};
/**
 * Quarter-turn action for a picked photo (2026-10-18, Utilverse photo-to-PDF). The product stores the rotation and
 * applies it to `preview` and its output; HJM only places the button with the other item actions.
 */
export type MediaSelectionRotate = Readonly<{label:string;itemLabel(item:MediaSelectionItem):string;onRotate(id:string):void}>;
/**
 * Copy and callbacks of one item's actions, shared by the screen grid and MediaSelectionCell.
 * `disabled` locks move/rotate/remove while the host runs a job over the selection (2026-10-18: Utilverse photo-to-PDF
 * and photo strip kept their own cells so a reorder could not diverge from a running build). Upload retry/cancel stay
 * live: they act on one transfer, not on the order or content the job reads.
 */
export type MediaSelectionItemActions = {labels:UploadItemLabels;actionLabels:{remove:string;moveUp:string;moveDown:string};removeLabel(item:MediaSelectionItem):string;moveUpLabel(item:MediaSelectionItem):string;moveDownLabel(item:MediaSelectionItem):string;onRemove(id:string):void;onMove(id:string,direction:-1|1):void;onRetry(id:string):void;onCancel(id:string):void;rotate?:MediaSelectionRotate;disabled?:boolean};
export type MediaSelectionScreenProps = Base & {library?:ReactNode;selectionSummary?:ReactNode;items:readonly MediaSelectionItem[];add?:ScreenFlowIconAction;done:ScreenFlowAction} & MediaSelectionItemActions;
/** `index`/`count` place the item in the product's full list so the first/last move buttons disable correctly. */
export type MediaSelectionCellProps = MediaSelectionItemActions & Readonly<{item:MediaSelectionItem;index:number;count:number}>;
/**
 * One picked item: preview, upload status, then move/rotate/remove. Exported (2026-10-18, Utilverse photo tools) so a
 * virtualized host (FlatList renderItem) renders the same cell as the screen grid instead of a copy.
 */
export function MediaSelectionCell({item,index,count,labels,actionLabels,removeLabel,moveUpLabel,moveDownLabel,onRemove,onMove,onRetry,onCancel,rotate,disabled=false}:MediaSelectionCellProps){
 const id=item.descriptor.id;
 return <Stack gap="xs">{item.preview}<UploadItem descriptor={item.descriptor} labels={labels} onRetry={onRetry} onCancel={onCancel}/><Stack axis="inline" gap="xs" layoutStyle={{flexWrap:"wrap"}}>
  <Button accessibilityLabel={moveUpLabel(item)} size="small" tone="ghost" disabled={disabled||index===0} onPress={()=>onMove(id,-1)}>{actionLabels.moveUp}</Button>
  <Button accessibilityLabel={moveDownLabel(item)} size="small" tone="ghost" disabled={disabled||index===count-1} onPress={()=>onMove(id,1)}>{actionLabels.moveDown}</Button>
  {/* Rotate edits the photo and stays before remove, so the destructive action keeps the trailing place. */}
  {rotate?<Button accessibilityLabel={rotate.itemLabel(item)} size="small" tone="ghost" disabled={disabled} onPress={()=>rotate.onRotate(id)}>{rotate.label}</Button>:null}
  <Button accessibilityLabel={removeLabel(item)} size="small" tone="ghost" disabled={disabled} onPress={()=>onRemove(id)}>{actionLabels.remove}</Button>
 </Stack></Stack>;
}
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export function MediaSelectionScreen({library,selectionSummary,items,add,done,labels,actionLabels,removeLabel,moveUpLabel,moveDownLabel,onRemove,onMove,onRetry,onCancel,rotate,disabled,...screen}:MediaSelectionScreenProps){
 const itemActions={labels,actionLabels,removeLabel,moveUpLabel,moveDownLabel,onRemove,onMove,onRetry,onCancel,...(rotate===undefined?{}:{rotate}),...(disabled===undefined?{}:{disabled})};
 return <ScreenLayout {...screen} {...(add||screen.actions?{actions:<Stack axis="inline" gap="xs" align="center">{screen.actions}{add?<Action action={add} edge="end"/>:null}</Stack>}:{})} footer={<Stack gap="sm">{selectionSummary}<Action action={done}/></Stack>}>{library??<Grid columns={{compact:2,expanded:3}} gap={{compact:"md"}}>{items.map((item,index)=><MediaSelectionCell key={item.descriptor.id} item={item} index={index} count={items.length} {...itemActions}/>)}</Grid>}</ScreenLayout>;
}


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
        <Button tone="ghost" size="small" edge="end" onPress={recent.onClearAll}>{recent.clearAllLabel}</Button>
      </Stack>
      <Stack gap="xxs">{visible.map(item => <ListRow key={item} density="compact" leading={recent.icon} title={item} onPress={() => onCommit(item)}
        trailingAction={<IconButton label={recent.removeLabel(item)} tone="ghost" edge="end" onPress={() => recent.onRemove(item)}>{recent.removeIcon ?? <FixedGlyph tone="muted">×</FixedGlyph>}</IconButton>} />)}</Stack>
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
    {/* Sort trigger edge="end": its chevron ends on the gutter like the count starts on it (2026-10-17 audit). */}
    {showCount || showSort ? <Stack axis="inline" justify={showCount ? "between" : "end"} align="center" gap="sm" wrap>
      {showCount ? (summary!.count === null ? <Skeleton shape="text" width="30%" /> : <Text tone="muted">{summary!.countLabel(summary!.count)}</Text>) : null}
      {sort ? <Menu presentation="anchored" triggerLabel={sort.triggerLabel} title={sort.label} dismissLabel={sort.dismissLabel}
        items={sort.options.map(option => ({ id: option.id, label: option.label }))}
        selection={{ mode: "single", selectedKey: sort.value, onSelectionChange: next => { if (next) onSortChange(next); } }}
        renderTrigger={trigger => <Button size="small" tone="ghost" edge="end" accessibilityState={trigger.accessibilityState} onPress={trigger.onPress}
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
  return <Chip label={trigger.label(appliedCount)} accessibilityLabel={trigger.accessibilityLabel(appliedCount)} layoutStyle={{alignSelf:"center"}}
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
export type SearchScreenProps<F = unknown> = Base & SearchInputSlot & SearchCommitSlot & SearchProgressSlot & {embedded?:boolean;query:string;queryLabel:string;onQueryChange(value:string):void;onSearch(query:string,context:{signal:AbortSignal}):void;debounceMs?:number;filters?:ReactNode;recentSearches?:ReactNode;children:ReactNode;
 /** ScreenLayout footer (bottom action or ad bar) under the results; it owns the bottom inset, as on every screen (unairplane rendered it outside the screen, 2026-10-17). */
 footer?:ScreenLayoutProps["footer"];
 /** `scroll` keeps `filters` on one horizontally scrolling line that bleeds to the screen edges. */
 filtersOverflow?:"wrap"|"scroll";
 /** `scope` marks filters that choose what is searched (kind, region, map area), so they stay on a query-caused zero as its recovery; `narrow` (default) hides them there. */
 filtersRole?:SearchFiltersRole;
 /** Gutter the host (Container `gutter`, Sheet = `regular`) already applies around this screen; the scroll rail bleeds over it too. */
 hostGutter?:ContainerGutter;
 /** Placeholder by default (2026-10-18 header-input rule); the accessible name remains queryLabel after typing. */
 queryLabelVisibility?:"visible"|"hidden";
 recentQueries?:SearchRecentQueries;suggestedQueries?:SearchSuggestedQueries;suggestions?:SearchSuggestions;
 resultSummary?:SearchResultSummary;appliedFilters?:SearchAppliedFilters;filterSheet?:SearchFilterSheet<F>};
/** Abort is supplied to the host request; the host must ignore aborted responses before committing results. */
export function SearchScreen<F = unknown>({embedded=false,query,queryLabel,queryField,queryClearLabel,onQueryChange,onSearch,debounceMs,filters,recentSearches,children,onSubmit,committedQuery,filtersOverflow="wrap",filtersRole="narrow",hostGutter="none",queryLabelVisibility="hidden",searching,searchingLabel,recentQueries,suggestedQueries,suggestions,resultSummary,appliedFilters,filterSheet,initialFocus=initialFocusDefaults.search,...screen}:SearchScreenProps<F>){
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
 const submitProps=onSubmit?{returnKeyType:"search" as const,onSubmitEditing:(event:Parameters<NonNullable<TextInputProps["onSubmitEditing"]>>[0])=>commit(event.nativeEvent.text)}:{};
 // Hidden label: the placeholder names the search target and accessibilityLabel keeps the field named.
 const labelProps=queryLabelVisibility==="hidden"?{accessibilityLabel:queryLabel,placeholder:queryLabel}:{label:queryLabel};
 const phase=resolveSearchScreenPhase(query,committedQuery);
 const appliedCount=appliedFilters?.items.length??0;
 const cause=phase==="results"&&resultSummary?resolveSearchEmptyCause(resultSummary.count,appliedCount):"none";
 // Two-step search shows the rail only beside results; a query-caused zero hides narrowing filters (none can fix it)
 // but keeps scope filters, which are that zero's recovery (resolveSearchFilterRailVisible, Web twin).
 const showRail=resolveSearchFilterRailVisible(phase,committedQuery!==undefined,cause,filtersRole);
 const trigger=filterSheet?.trigger?<SearchFilterTrigger sheet={filterSheet} appliedCount={appliedCount}/>:null;
 const rail=!showRail?null:trigger&&filters!=null?<Stack axis="inline" align="center" gap="xs" wrap={filtersOverflow==="wrap"}>{trigger}{filters}</Stack>:trigger??filters;
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
 const scrollView=useRef<ComponentRef<typeof ScrollView>|null>(null);
 const scrollRef=(node:ComponentRef<typeof ScrollView>|null)=>{scrollView.current=node;const own=screen.scrollRef;if(typeof own==="function")own(node);else if(own)(own as {current:ComponentRef<typeof ScrollView>|null}).current=node;};
 // A new order starts at the top; the previous offset would land mid-list in unrelated results.
 const changeSort=(id:string)=>{resultSummary?.sort?.onChange(id);scrollView.current?.scrollTo?.({y:0,animated:false});};
 const idle=<SearchIdleSections recent={recentQueries} suggested={suggestedQueries} legacy={recentSearches} onCommit={commit}/>;
 const body=phase==="idle"?<>{idle}{committedQuery===undefined?children:null}</>
  :phase==="typing"?(suggestions?<SearchSuggestionList query={query} suggestions={suggestions} onCommit={commit}/>:null)
  :<><SearchResultsHeader summary={resultSummary} applied={appliedFilters} cause={cause} onSortChange={changeSort}/>
   <SearchResultsBody summary={resultSummary} applied={appliedFilters} suggested={suggestedQueries} cause={cause} onCommit={commit}>{children}</SearchResultsBody></>;
 // Search-first routes have no visible heading: navigation and input share one row.
 // Keep explicit host headers and described/titled screens in their existing layout.
 const inlineNavigation=!embedded&&screen.titleVisibility==="hidden"&&screen.header==null;
 const input=queryField??<SearchField {...labelProps} clearLabel={queryClearLabel!} value={query} onValueChange={onQueryChange} busy={searching??false} busyLabel={searchingLabel??queryLabel} {...submitProps}/>;
 const queryRow=inlineNavigation?<Stack axis="inline" align="center" gap="sm">{screen.exit?<ScreenExitButton {...screen.exit}/>:null}<View style={{flex:1,minWidth:0}}>{input}</View>{screen.actions}</Stack>:input;
 // The query field is the search screen's primary input (2026-10-18 entry focus).
 // Empty results belong to the visible body below the pinned query/filter/map region.
 // Reuse ScreenLayout's centering contract rather than giving EmptyState an arbitrary top inset.
 const centerResults=phase==="results"&&cause!=="none"&&resultSummary?.empty!==undefined;
 const notice=<Stack gap="sm">{queryRow}{filterSlot}{screen.notice}</Stack>;
 // A virtualized host needs the full remaining body height; without this flex the FlatList measured at zero.
 const results=<Stack gap="lg" justify={embedded&&centerResults?"center":"start"} layoutStyle={screen.scroll==="content"||embedded?{flex:1}:undefined}>{body}</Stack>;
 const embeddedResults=screen.scroll==="content"?results:<ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" style={{flex:1,minHeight:0}} contentContainerStyle={{flexGrow:1}}>{results}</ScrollView>;
 return <>{embedded?<CompositionLayout notice={notice} {...(screen.state===undefined?{}:{state:screen.state})} stateAction={screen.stateAction}
   loadingIndicator={screen.loadingIndicator} footer={screen.footer} layoutStyle={[{flex:1},screen.layoutStyle]}>{embeddedResults}</CompositionLayout>
   :<ScreenLayout {...screen} contentAlignment={phase==="results"&&cause!=="none"&&resultSummary?.empty?"center":screen.contentAlignment??"start"} initialFocus={initialFocus} {...(inlineNavigation?{header:<></>}: {})} scrollRef={scrollRef} notice={notice}>{results}</ScreenLayout>}
  {filterSheet?<SearchFilterSheetView sheet={filterSheet}/>:null}</>;
}

export type PermissionScreenProps = Base & {status:PermissionScreenStatus;illustration?:ReactNode;explanation:ReactNode;request:ScreenFlowAction;settings:ScreenFlowAction;continueAction:ScreenFlowAction;skip?:ScreenFlowAction};
// Permission guidance occupies the current screen body; keep its default centered on both platforms.
export function PermissionScreen({status,illustration,explanation,request,settings,continueAction,skip,...screen}:PermissionScreenProps){const kind=resolvePermissionAction(status);const primary=kind==="request"?request:kind==="settings"?settings:kind==="continue"?continueAction:null;return <ScreenLayout {...screen} contentAlignment={screen.contentAlignment ?? "center"} footer={<Stack gap="xs">{primary?<Action action={primary}/>:null}{skip?<Action action={skip} secondary/>:null}</Stack>}><Stack gap="xl" align="center">{illustration}{explanation}</Stack></ScreenLayout>;}

export type OnboardingStep = {id:string;title:string;description:string;content:ReactNode};
export type OnboardingScreenProps = {steps:readonly OnboardingStep[];index:number;onIndexChange(index:number):void;nextLabel:string;backLabel:string;complete:ScreenFlowAction;skip?:ScreenFlowAction;progressLabel(index:number,total:number):string;exit?:ScreenLayoutProps["exit"];layoutStyle?:ScreenLayoutProps["layoutStyle"];
 /** Same as ScreenLayout: the footer pads max(16, inset) (yajalal/diairy wrapped the screen in their own inset, 2026-10-17). */
 safeAreaBottom?:ScreenLayoutProps["safeAreaBottom"]};
// Large headings and a software keyboard can consume the entire fixed header
// area. Keep step guidance in the existing scroll body, with completion actions fixed.
export function OnboardingScreen({steps,index,onIndexChange,nextLabel,backLabel,complete,skip,progressLabel,exit,layoutStyle,safeAreaBottom}:OnboardingScreenProps){const position=resolveOnboardingStep(steps.length,index);const step=steps[index]!;
 // Completion and skip persist the same flow: keep navigation stable until the receipt.
 const scrollRef=useRef<ComponentRef<typeof ScrollView>|null>(null);
 // A new step starts at its guidance even when the previous story was scrolled.
 useEffect(()=>{scrollRef.current?.scrollTo({y:0,animated:false});},[index]);
 const pending=!!(complete.pending||skip?.pending);
 return <ScreenLayout scrollRef={scrollRef} {...(layoutStyle===undefined?{}:{layoutStyle})} {...(safeAreaBottom===undefined?{}:{safeAreaBottom})} title={step.title} titleVisibility="hidden" {...(exit?{exit:{...exit,disabled:!!(exit.disabled||pending)}}:{header:<></>})} footer={<Stack gap="xs"><Action action={position.last?{...complete,disabled:!!(complete.disabled||pending)}:{label:nextLabel,disabled:pending,onAction:()=>onIndexChange(index+1)}}/>{!position.first?<Action action={{label:backLabel,disabled:pending,onAction:()=>onIndexChange(index-1)}} secondary/>:null}</Stack>}><Stack gap="md"><Text variant="titleLarge" accessibilityRole="header">{step.title}</Text><Text tone="muted">{step.description}</Text><Text variant="caption" tone="muted">{progressLabel(index+1,steps.length)}</Text>{skip?<Action action={{...skip,disabled:!!(skip.disabled||pending)}} secondary/>:null}{step.content}</Stack></ScreenLayout>;}

export type CommentThreadItem = Readonly<{
 /** Root-only reply branch. Total can exceed the loaded preview; HJM owns its indentation and expansion. */
 repliesCount?:number;repliesNotice?:ReactNode;repliesFooter?:ReactNode;
 id:string;parentId:string|null;author:string;authorBadge?:ReactNode;body:ReactNode;bodyText?:string;timeLabel:string;timeDateTime?:string;likeCountLabel:string;avatar?:ReactNode;likeIcon:ReactNode;likeLabel:string;likeAction?:ReactNode;actions?:ReactNode;canReply?:boolean;replyDisabled?:boolean;
 /** Long-press the comment (author and body) to react; the product owns the stored value and summary. */
 reactions?:CommentReactions;reactionSummary?:ReactNode;
 /** Optional photo or sticker under the body; HJM bounds its width and corners, the product sizes the image. */
 media?:ReactNode;
 /**
  * Where the time label sits. "auto" keeps it beside the author unless `bodyText` inlines the author; "actions" moves it
  * into the line under the body with reactions and Reply, for rich (non-text) bodies such as Spint's flower stamp
  * (2026-10-18). Default "auto".
  */
 timePlacement?:"auto"|"actions";
 /**
  * Inline per-comment panel (edit, report or block form) under the Reply line, outside the long-press target
  * (2026-10-18, Utilverse). The product owns its open state, focus, submit and close; HJM owns its place in the row.
  */
 panel?:ReactNode;
 /**
  * Paged photo set under the body (2026-10-18, Utilverse): HJM mounts only the shown page so the product can fetch one
  * authorized image at a time. Exclusive with `media` (validated at render); it sits outside the long-press target because it has its own buttons, and the
  * hold menu's preview (a second render) would otherwise mount a second page.
  */
 mediaAlbum?:MediaAlbum}>;
export type CommentReactions = ReactionPickerProps & Readonly<{closeLabel:string;menuAction?:Readonly<{label:string;onPress():void;disabled?:boolean}>;menuActions?:readonly MessageMenuAction[];reportAction?:Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;interactiveContent?:boolean;/** Icon for the automatic "reply" row of the hold menu. */replyIcon?:ReactNode}>;
/**
 * HJM-owned "more" menu per comment (2026-10-17: common comment structure belongs to HJM, review S4#7). HJM draws the
 * vertical-dots button at the row's trailing edge and opens the shared Menu sheet with danger items last; the product
 * supplies only the localized names, the items allowed for that comment and the action callback.
 */
export type CommentMenu = Readonly<{
  /** Context belongs to the row: anchored by default; override only for a product interaction reason. */
  presentation?: "grouped" | "anchored" | "bottom";
  /** Localized accessible name of the button and menu title, e.g. "More options for seoyeon's comment". */
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

function CommentMenuButton({item,menu,items}:Readonly<{item:CommentThreadItem;menu:CommentMenu;items:readonly CommentMenuItemDescriptor[]}>){
 const {palette}=useHjmNativeTheme();
 const label=menu.label(item);
 return <Menu presentation={menu.presentation ?? "anchored"} triggerLabel={label} dismissLabel={menu.dismissLabel} items={items.map(entry=>({id:entry.id,label:entry.label,...(entry.tone===undefined?{}:{tone:entry.tone}),...(entry.disabled===undefined?{}:{disabled:entry.disabled})}))}
  onActionAfterDismiss={id=>menu.onAction(item,id)} renderTrigger={trigger=><IconButton label={label} tone="ghost" onPress={trigger.onPress}><DrawnMoreVertical size={commentThreadRecipe.menuGlyphSize} color={resolveIconButtonPresentation("ghost",palette).content}/></IconButton>}/>;
}

/** Virtualized hosts reuse the same row as CommentThreadScreen; product slots add content, not a second layout. */
export function CommentThreadRow({ item, onLike, onReply, replyLabel, layoutStyle, commentMenu }: CommentThreadRowProps) {
 validateMediaSetChoice(item.media!=null,item.mediaAlbum!==undefined);
 const [albumIndex,setAlbumIndex]=useMediaAlbumIndex(item.mediaAlbum);
 // bodyText inlines the author, so its time always moves under the body; rich bodies opt in with timePlacement.
 const timeInActions=item.bodyText!==undefined||item.timePlacement==="actions";
 const avatarSize=item.parentId===null?commentThreadRecipe.avatarSize:commentThreadRecipe.replyAvatarSize;
 const theme=useHjmNativeTheme();
 const menuItems=commentMenu?resolveCommentMenuItems(commentMenu.items(item)):[];
 // commentThreadRecipe.actionAnchor: the 44 targets centre on the identity's first line, using the line height Text
 // renders (token × controlled/OS text scale). When HJM's own like/more is last, the whole column takes the IconButton
 // edge overhang so its glyph slot ends on the row inset; the 44-wide like count shares the column and would absorb a
 // margin on the button alone.
 const visibleTarget=visibleControlHeight(iconButtonRecipe.sizes.medium.diameter,theme.environment.minimumVisualTarget);
 const anchorVariant=item.bodyText!==undefined?commentThreadRecipe.actionAnchor.inlineTextVariant:commentThreadRecipe.actionAnchor.authorTextVariant;
 const anchorOffset=(theme.tokens.typography[anchorVariant].lineHeight*theme.textScaling.scale-visibleTarget)/2;
 const edgeOverhang=menuItems.length||item.actions==null&&item.likeAction===undefined?resolveIconButtonEdgeOverhang("ghost","medium",visibleTarget):0;
 // The like count sits under the heart so the text column carries only identity, body and reply.
 return <Stack key={item.id} axis="inline" align="start" gap="xs" {...(layoutStyle === undefined ? {} : {layoutStyle})}>{item.avatar?<View style={{width:avatarSize,alignItems:"center"}}>{item.avatar}</View>:null}<View style={{flex:1,minWidth:0,gap:commentThreadRecipe.lineGap}}>
 {/* A definite media width resolves percentage-sized children; the parent cap preserves narrow comment columns (Spint photo adoption). */}
 {/* Only identity and body are the hold target, so the reply action keeps its own button semantics. */}
 {(()=>{const identity=<>{item.bodyText!==undefined?(item.authorBadge?<Stack axis="inline" gap="xxs" align="center" layoutStyle={{flexWrap:"wrap"}}><Text emphasis="strong">{item.author}</Text>{item.authorBadge}<Text>{item.bodyText}</Text></Stack>:<Text><Text emphasis="strong">{item.author}</Text>{" "}{item.bodyText}</Text>):(item.author||item.authorBadge||(item.timeLabel&&!timeInActions))?<Stack axis="inline" gap="xxs" align="center" layoutStyle={{flexWrap:"wrap"}}>{item.author?<Text variant="caption" emphasis="strong">{item.author}</Text>:null}{item.authorBadge}{item.timeLabel&&!timeInActions?<Text variant="caption" tone="muted">{item.timeLabel}</Text>:null}</Stack>:null}
 {item.body}{item.media?<View style={{width:commentThreadRecipe.mediaMaxWidth,maxWidth:"100%",borderRadius:commentThreadRecipe.mediaRadius,overflow:"hidden",marginTop:commentThreadRecipe.avatarGap/2,alignSelf:"flex-start"}}>{item.media}</View>:null}</>;return item.reactions?<MessageReactions previewSurface {...item.reactions} {...((item.canReply??item.parentId===null)&&!item.replyDisabled ? {replyAction:{label:replyLabel,onPress:()=>onReply(item.id),...(item.reactions.replyIcon===undefined?{}:{icon:item.reactions.replyIcon})}} : {})}><View style={{gap:commentThreadRecipe.lineGap}}>{identity}</View></MessageReactions>:identity;})()}
 {item.mediaAlbum?<View style={{marginTop:commentThreadRecipe.avatarGap/2,alignSelf:"flex-start"}}><MediaAlbumView album={item.mediaAlbum} index={albumIndex} onIndexChange={setAlbumIndex} width={commentThreadRecipe.mediaMaxWidth} radius={commentThreadRecipe.mediaRadius}/></View>:null}
 {(timeInActions&&item.timeLabel)||(item.canReply??item.parentId===null)||item.reactionSummary?<Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap:"wrap"}}>{timeInActions&&item.timeLabel?<Text variant="caption" tone="muted">{item.timeLabel}</Text>:null}{item.reactionSummary}{(item.canReply??item.parentId===null)?<CommentTextAction label={replyLabel} disabled={item.replyDisabled??false} onPress={()=>onReply(item.id)}/>:null}</Stack>:null}
 {/* The text column already spaces lines by lineGap; the panel adds the rest of panelGap. */}
 {item.panel!=null?<View style={{marginTop:commentThreadRecipe.panelGap-commentThreadRecipe.lineGap}}>{item.panel}</View>:null}</View>
 <View style={{flexShrink:0,marginTop:anchorOffset,...(edgeOverhang?{marginEnd:-edgeOverhang}:{})}}><Stack axis="inline" gap={0} align="center" layoutStyle={{flexShrink:0}}>{item.likeAction!==undefined?item.likeAction:<IconButton label={item.likeLabel} tone="ghost" onPress={()=>onLike(item.id)}>{item.likeIcon}</IconButton>}{item.actions}{commentMenu&&menuItems.length?<CommentMenuButton item={item} menu={commentMenu} items={menuItems}/>:null}</Stack>{item.likeCountLabel?<View style={{width:commentThreadRecipe.likeColumnWidth}}><Text variant="caption" tone="muted" align="center">{item.likeCountLabel}</Text></View>:null}</View></Stack>;
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
 return <ScreenLayout {...screen} footer={!screen.state||screen.state.kind==="ready"||screen.state.kind==="empty"?composer:null}><Stack gap="lg">{threadHeader}<View style={{gap:commentThreadRecipe.rowGap}}>{roots.map(item=>{const replies=repliesByParent.get(item.id)??[];const total=item.repliesCount;if(total!==undefined&&(!Number.isSafeInteger(total)||total<0))throw new RangeError("CommentThreadItem repliesCount must be nonnegative");const count=Math.max(replies.length,total??0);return <View key={item.id} style={{gap:commentThreadRecipe.rowGap}}>{row(item)}{count||item.repliesNotice||item.repliesFooter?<View style={{gap:commentThreadRecipe.rowGap,marginStart:commentThreadRecipe.replyIndent}}><CommentTextAction label={repliesLabel(count,expanded.has(item.id))} expanded={expanded.has(item.id)} onPress={()=>onExpandedChange(item.id)}/>{expanded.has(item.id)?<>{item.repliesNotice}{replies.map(row)}{item.repliesFooter}</>:null}</View>:null}</View>;})}</View>{threadFooter}</Stack></ScreenLayout>;
}

export type ProfileSummaryProps = Readonly<{
  name: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  avatar: ReactNode;
  badge?: ReactNode;
  nameActions?: ReactNode;
  stats?: readonly Readonly<{ id: string; value: string; label: string; onPress?(): void; disabled?: boolean }>[];
  actions?: ReactNode;
  actionsLayout?: keyof typeof profileSummaryRecipe.actionsLayouts;
  children?: ReactNode;
}>;

/** Profile identity and counts are common; routing and mutations stay controlled by the product. */
export function ProfileSummary({ name, headingLevel = 2, avatar, badge, nameActions, stats = [], actions, actionsLayout = "inline", children }: ProfileSummaryProps) {
  const actionLayout = profileSummaryRecipe.actionsLayouts[actionsLayout];
  const edit = useContext(ProfileEditContext);
  const { tone: editTone, size: editSize } = profileSummaryRecipe.editAction;
  const editButton = edit ? <Button tone={editTone} size={editSize} disabled={!!(edit.disabled || edit.pending)} loading={edit.pending ?? false} onPress={edit.onAction}>{edit.label}</Button> : null;
  return <CompositionLayout title={name} headingLevel={headingLevel} leading={<View style={{ alignItems: "center", justifyContent: "center", width: profileSummaryRecipe.avatarSize, height: profileSummaryRecipe.avatarSize, flexShrink: 0, borderRadius: profileSummaryRecipe.avatarSize / 2, overflow: "hidden" }}>{avatar}</View>} badge={badge} actions={nameActions} footer={children}>
    {/* Static and actionable counts occupy identical cells; button hit areas must not shift their baselines. */}
    {stats.length ? <Stack axis="inline" gap="md" align="stretch" layoutStyle={{ width: "100%" }}>{stats.map(stat =>
      <Stack key={stat.id} gap="xxs" align="center" justify="center" layoutStyle={{ flex: 1, minWidth: 0 }}>
        {stat.onPress ? <Button tone="ghost" accessibilityLabel={`${stat.value} ${stat.label}`} disabled={stat.disabled ?? false} onPress={stat.onPress} layoutStyle={{ width: "100%" }}><Stack gap="xxs" align="center"><Text emphasis="strong">{stat.value}</Text><Text variant="caption" tone="muted">{stat.label}</Text></Stack></Button>
          : <><Text emphasis="strong">{stat.value}</Text><Text variant="caption" tone="muted">{stat.label}</Text></>}
      </Stack>)}</Stack> : null}
    {editButton || actions ? <Stack axis={actionLayout.axis} gap={actionLayout.gap} wrap={actionsLayout === "inline"} layoutStyle={{ width: "100%" }}>{editButton}{actions}</Stack> : null}
  </CompositionLayout>;
}
