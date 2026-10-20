import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type Ref, type RefObject } from "react";
import { createContext, useContext } from "react";
import { TextArea } from "./forms.js";
import { CompositionLayout, ScreenLayout, type ScreenLayoutProps } from "./screens.js";
import { ScreenExitButton } from "./internal/screen-exit.js";
import { Button, IconButton } from "./actions.js";
import { MessageReactions, type MessageMenuAction } from "./internal/message-reactions.js";
import { MediaAlbumView, useMediaAlbumIndex, type MediaAlbum } from "./internal/media-album.js";
import { validateMediaSetChoice } from "@hjmds/design-contracts/screen-patterns";
export type { MediaAlbum } from "./internal/media-album.js";
import type { ReactionPickerProps } from "./reaction-picker.js";
import { Stack, Text, Grid, VisuallyHidden } from "./layout.js";
import { SearchField } from "./forms.js";
import { Chip, RadioGroup } from "./selection.js";
import { AlertDialog, Menu, Sheet, type SheetProps } from "./overlays.js";
import { UploadItem } from "./upload-item.js";
import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import { type AlertDialogRequest } from "@hjmds/design-contracts/components/alert-dialog";
import { initialFocusDefaults, validateCommentThread, resolvePermissionAction, resolveOnboardingStep, resolveSearchCommit, resolveSearchDebounceMs, resolveSearchEmptyCause, resolveSearchFilterRailVisible, resolveSearchScreenPhase, resolveFocusAfterRemoval, screenPatternRecipe, commentThreadRecipe, profileSummaryRecipe, searchScreenRecipe, resolveCommentMenuItems, type CommentMenuItemDescriptor, type SearchEmptyCause, type SearchFiltersRole, type PermissionScreenStatus, type PhotoSource, type PhotoSourceLabels } from "@hjmds/design-contracts/screen-patterns";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { containerRecipe, type ContainerGutter } from "@hjmds/design-contracts/components/container";
import { ListRow } from "./display.js";
import { PhotoSourceIcon } from "./internal/photo-source-icon.js";
import { Heading } from "./heading.js";
import { EmptyState, Skeleton } from "./feedback.js";

/** Copy, pending state and mutations are controlled by the consuming product. */
/** `icon` renders an icon-only button named by `label`; header actions (top-right) use it so a centered title keeps its width (2026-10-17). */
export type ScreenFlowAction = Readonly<{label:string; onAction():void; disabled?:boolean; pending?:boolean; icon?:ReactNode}>;
/** Header tool action (refresh, add): icon-only so it never pushes the centered title. A required text `add` made
 * products route exits (a "Cancel" label) through it as a header text button (2026-10-17 screen review); exits use `exit`. */
export type ScreenFlowIconAction = ScreenFlowAction & Readonly<{icon:ReactNode}>;
// `edge`: the action ends a header/row edge (IconButton/Button edge rule, 2026-10-17 audit); framed tones ignore it.
function Action({action,secondary=false,buttonRef,edge}:{action:ScreenFlowAction;secondary?:boolean;buttonRef?:Ref<HTMLButtonElement>;edge?:"start"|"end"}){if(action.icon)return <IconButton ref={buttonRef} label={action.label} tone="ghost" {...(edge?{edge}:{})} disabled={!!(action.disabled||action.pending)} onClick={action.onAction}>{action.icon}</IconButton>;return <Button ref={buttonRef} tone={secondary?"ghost":"primary"} {...(edge?{edge}:{})} disabled={!!(action.disabled||action.pending)} loading={action.pending??false} onClick={action.onAction}>{action.label}</Button>;}
type Base = Omit<ScreenLayoutProps,"children"|"footer">;
// Stacked footer/sheet buttons use Stack gap "xs" (actionGroupRecipe.stackedGap 8); 12 read as split groups (button.md, 2026-10-17).

export type ListDetailScreenProps = Base & { footer?:ScreenLayoutProps["footer"]; list:ReactNode; detail?:Pick<ScreenLayoutProps,"title"|"state"|"stateAction"|"notice"|"titleVisibility"|"headerAlignment"|"actions"|"footer"> & {content:ReactNode}; back:ScreenFlowAction; refresh?:ScreenFlowIconAction; loadMore?:ScreenFlowAction };
/** Keep the list mounted so input and scroll survive a detail visit. Routers may instead restore host scroll state. */
export function ListDetailScreen({list,detail,back,refresh,loadMore,layoutStyle,...screen}:ListDetailScreenProps){
 const open=!!detail;
 // Seed with the first render: a deep link that mounts with detail open is not a user transition,
 // so it must not pull focus from wherever the host left it (address bar, router focus target).
 const listHost=useRef<HTMLDivElement>(null),detailHost=useRef<HTMLDivElement>(null),returnFocus=useRef<HTMLElement|null>(null),wasOpen=useRef(open);
 // The retained host is a fallback when a virtualized list removes its focused item.
 // Hidden lists preserve scroll but drop browser focus; retain the trigger and move into the
 // detail once, then restore it (or the list body if the item was removed). See usage/ListDetailScreen.
 useLayoutEffect(()=>{
  if(open&&!wasOpen.current)detailHost.current?.querySelector<HTMLElement>("button")?.focus({preventScroll:true});
  if(!open&&wasOpen.current){
  const target=returnFocus.current;
  if(target?.isConnected&&!target.closest("[hidden]"))target.focus({preventScroll:true});
  // A retained trigger can also become disabled while detail is open.
  if(document.activeElement!==target)(listHost.current?.querySelector<HTMLElement>('[tabindex="0"]')??listHost.current)?.focus({preventScroll:true});
 }
  wasOpen.current=open;
 },[open]);
 // layoutStyle places the outer host that owns both panes, not the inner list ScreenLayout.
 // "Load more" ends the list inside the scroll body, centered like LoadMore; the fixed footer is the bottom CTA slot (2026-10-17 review).
 return <div style={{height:"100%",...layoutStyle}}>
  <div ref={listHost} tabIndex={-1} hidden={open} style={{height:"100%"}} onFocusCapture={event=>{returnFocus.current=event.target as HTMLElement;}}><ScreenLayout {...screen} {...(refresh||screen.actions?{actions:<Stack axis="inline" gap="xs" align="center">{/* Refresh no longer replaces the screen's own actions (2026-10-16 composition review). */}{screen.actions}{refresh?<Action action={refresh} secondary edge="end"/>:null}</Stack>}:{})}>{loadMore?<div style={{display:"flex",flexDirection:"column",flex:"1 1 auto",minHeight:0,gap:screenPatternRecipe.itemGap}}>{list}<div style={{display:"flex",justifyContent:"center"}}><Action action={loadMore} secondary/></div></div>:list}</ScreenLayout></div>
  {detail?<div ref={detailHost} style={{height:"100%"}}><ScreenLayout title={detail.title} {...(detail.titleVisibility === undefined ? {} : { titleVisibility: detail.titleVisibility })} {...(detail.headerAlignment === undefined ? {} : { headerAlignment: detail.headerAlignment })} {...(detail.state === undefined ? {} : {state:detail.state})} stateAction={detail.stateAction} notice={detail.notice} actions={detail.actions} footer={detail.footer} exit={{kind:"back",label:back.label,onClick:back.onAction,disabled:!!(back.disabled||back.pending)}}>{detail.content}</ScreenLayout></div>:null}
 </div>;
}

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
  exit={stepBack?{kind:"back",label:stepBack.label,disabled:stepLocked,onClick:()=>{if(!stepLocked)stepBack.onAction();}}
   :{kind:"close",label:cancel.label,disabled:cancelLocked,onClick:()=>{if(cancelLocked)return;if(dirty)setConfirm(true);else leave();}}}
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
  const field=review.resolution??<TextArea label={review.decisionReason.label} value={review.decisionReason.value} onChange={event=>review.decisionReason.onValueChange(event.currentTarget.value)}
   {...(review.decisionReason.description===undefined?{}:{description:review.decisionReason.description})} {...(review.decisionReason.maxLength===undefined?{}:{maxLength:review.decisionReason.maxLength})}
   required={review.decisionReason.required??true} disabled={!!review.decisionReason.disabled||busy}/>;
  // One decision at a time: a pending decision locks the others and the reason it was taken with.
  const decisions=review.resolution?[]:review.decisions.map(decision=>{const locked=!!decision.disabled||busy||!ready||reasonMissing;
   return <Button key={decision.id} tone={decision.tone??"secondary"} disabled={locked} loading={decision.pending??false} onClick={()=>{if(locked)return;if(decision.confirmation)setConfirmId(decision.id);else decision.onAction();}}>{decision.label}</Button>;});
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
 // File-input click must stay in the user's activation stack. Deferring until the
 // sheet animation ends can cause browsers to reject camera/album selection.
 const select=(source:PhotoSource)=>{if(disabled)return;onOpenChange(false);onSelect(source);};
 // Same peer list actions as Native, without changing the browser activation stack.
 return <Sheet open={open} onOpenChange={onOpenChange} title={labels.title} closeLabel={labels.cancel}><Stack gap="xxs">
 <ListRow title={labels.library} leading={<PhotoSourceIcon source="library"/>} disabled={disabled} onClick={()=>select("library")}/>
 {cameraAvailable?<ListRow title={labels.camera} leading={<PhotoSourceIcon source="camera"/>} disabled={disabled} onClick={()=>select("camera")}/>:null}
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
 * virtualized host (VirtualList, FlatList renderItem) renders the same cell as the screen grid instead of a copy.
 * Web keyboard focus recovery after removal belongs to the screen grid; a virtualized host owns its own.
 */
export function MediaSelectionCell({item,index,count,labels,actionLabels,removeLabel,moveUpLabel,moveDownLabel,onRemove,onMove,onRetry,onCancel,rotate,disabled=false}:MediaSelectionCellProps){
 const id=item.descriptor.id;
 // The job lock is temporary, so it keeps the focused action focusable (aria-disabled; Button drops the click) instead
 // of throwing keyboard focus to <body> for the length of the job. The list boundaries stay natively disabled.
 const lock=disabled?{"aria-disabled":true as const}:{};
 return <Stack data-hjm-media-item={id} gap="xs">
  {item.preview}<UploadItem descriptor={item.descriptor} labels={labels} onRetry={onRetry} onCancel={onCancel}/>
  <Stack axis="inline" gap="xxs" layoutStyle={{flexWrap:"wrap"}}>
   <Button data-media-action="up" aria-label={moveUpLabel(item)} size="small" tone="ghost" disabled={index===0} {...lock} onClick={()=>onMove(id,-1)}>{actionLabels.moveUp}</Button>
   <Button data-media-action="down" aria-label={moveDownLabel(item)} size="small" tone="ghost" disabled={index===count-1} {...lock} onClick={()=>onMove(id,1)}>{actionLabels.moveDown}</Button>
   {/* Rotate edits the photo and stays before remove, so the destructive action keeps the trailing place. */}
   {rotate?<Button data-media-action="rotate" aria-label={rotate.itemLabel(item)} size="small" tone="ghost" {...lock} onClick={()=>rotate.onRotate(id)}>{rotate.label}</Button>:null}
   <Button data-media-action="remove" aria-label={removeLabel(item)} size="small" tone="ghost" {...lock} onClick={()=>onRemove(id)}>{actionLabels.remove}</Button>
  </Stack>
 </Stack>;
}
/** A photo is the primary content; upload status stays below it instead of replacing the thumbnail. */
export function MediaSelectionScreen({library,selectionSummary,items,add,done,labels,actionLabels,removeLabel,moveUpLabel,moveDownLabel,onRemove,onMove,onRetry,onCancel,rotate,disabled,...screen}:MediaSelectionScreenProps){
 const itemActions={labels,actionLabels,removeLabel,moveUpLabel,moveDownLabel,onRemove,onMove,onRetry,onCancel,...(rotate===undefined?{}:{rotate}),...(disabled===undefined?{}:{disabled})};
 const grid = useRef<HTMLDivElement>(null), addButton = useRef<HTMLButtonElement>(null);
 const focusedItem = useRef<{node:HTMLElement;id:string;index:number;body:HTMLElement|null}|null>(null);
 useLayoutEffect(() => {
  const previous = focusedItem.current, host = grid.current;
  if (!previous) return;
  const active = document.activeElement;
  if (!host) {
   focusedItem.current = null;
   // Empty-state replacement unmounts the grid; the ordinary last-removal
   // destination still applies. Other state/library replacements own their focus.
   if (!previous.node.isConnected && !items.length && screen.state?.kind === "empty" && library == null
    && (active === document.body || active === previous.body) && !addButton.current?.disabled) addButton.current?.focus({preventScroll:true});
   return;
  }
  const index = items.findIndex(item => item.descriptor.id === previous.id), moved = index >= 0 && index !== previous.index;
  if (index >= 0) previous.index = index;
  const reveal = (node:HTMLElement) => {
   const body = previous.body;
   if (!body?.contains(node) || body.dataset.scroll !== "screen") return;
   const bounds = node.getBoundingClientRect(), clip = body.getBoundingClientRect();
   // Scroll only the owned body, by the minimum needed to keep the action visible.
   if (bounds.top < clip.top) body.scrollTop += Math.floor(bounds.top - clip.top);
   else if (bounds.bottom > clip.bottom) body.scrollTop += Math.ceil(bounds.bottom - clip.bottom);
  };
  const disabled = previous.node.matches(":disabled");
  if (active !== document.body && active !== previous.body && !(active === previous.node && disabled)) {
   if (active === previous.node && moved) reveal(previous.node);
   return;
  }
  // A keyed reorder may detach a focused node; a boundary move may disable it.
  // Recover only focus owned by this grid, after the product accepts the change.
  const id = index < 0 ? items[Math.min(previous.index, items.length - 1)]?.descriptor.id : previous.id;
  const row = Array.from(host.querySelectorAll<HTMLElement>("[data-hjm-media-item]")).find(node => node.dataset.hjmMediaItem === id);
  const target = index >= 0 && previous.node.isConnected && !disabled ? previous.node
   : row?.querySelector<HTMLButtonElement>(index < 0 ? '[data-media-action="remove"]' : 'button[data-media-action]:not(:disabled)')
    ?? (!addButton.current?.disabled ? addButton.current : null);
  focusedItem.current = null;
  if (target) { target.focus({preventScroll:true}); reveal(target); }
 });
 return <ScreenLayout {...screen} {...(add||screen.actions?{actions:<Stack axis="inline" gap="xs" align="center">{screen.actions}{add?<Action action={add} buttonRef={addButton} edge="end"/>:null}</Stack>}:{})} footer={<Stack gap="sm">{selectionSummary}<Action action={done}/></Stack>}>
  {library??<Grid ref={grid} columns={{compact:2,expanded:3}} gap={{compact:"md"}}
   onFocusCapture={event => {
    const node = event.target as HTMLElement, row = node.closest<HTMLElement>("[data-hjm-media-item]");
    const id = row?.dataset.hjmMediaItem;
    if (id !== undefined) focusedItem.current = {node,id,index:items.findIndex(item => item.descriptor.id === id),body:node.closest<HTMLElement>(".hjm-screen__body")};
   }}
   onBlurCapture={event => {
    const node = event.target as HTMLElement;
    // Explicit blur/outside focus relinquishes ownership; DOM removal and a newly
    // disabled move button retain it until the layout effect chooses a successor.
    if (event.relatedTarget ? !event.currentTarget.contains(event.relatedTarget as Node) : node.isConnected && !node.matches(":disabled")) focusedItem.current = null;
   }}>
   {items.map((item,index)=><MediaSelectionCell key={item.descriptor.id} item={item} index={index} count={items.length} {...itemActions}/>)}
  </Grid>}
 </ScreenLayout>;
}


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
  /** Hide the visual total without losing loading, empty-state or announcement behavior. */
  countVisibility?: "visible" | "hidden";
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
        <Button tone="ghost" size="small" edge="end" onClick={onClearAll}>{recent.clearAllLabel}</Button>
      </Stack>
      {/* The remove control is the row's trailingAction on both platforms: it sits outside the row command, the row text
          stays on the gutter and the edge-aligned × glyph ends on the gutter line (2026-10-17 alignment decision). */}
      <Stack gap="xxs">{visible.map((item, index) => <ListRow key={item} density="compact" leading={recent.icon} title={item} onClick={() => onCommit(item)}
        trailingAction={<IconButton data-search-recent-remove="" label={recent.removeLabel(item)} tone="ghost" edge="end" onClick={() => onRemove(item, index)}>{recent.removeIcon ?? "×"}</IconButton>} />)}</Stack>
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
  const showCount = summary && cause === "none" && summary.countVisibility !== "hidden";
  // A count-free search still owns its sorting action; do not hide it with the total.
  const showSort = summary && cause === "none" && sort;
  if (!summary?.notice && !showCount && !showSort && !applied?.items.length) return null;
  // The sort trigger ends the count row: edge="end" puts its chevron on the gutter like the count text starts on it
  // (2026-10-17 measured audit: chevron 29 from the edge against 16).
  return <Stack gap="sm">
    {summary?.notice}
    {showCount || showSort ? <Stack axis="inline" justify={showCount ? "between" : "end"} align="center" gap="sm" wrap>
      {showCount ? (summary!.count === null ? <Skeleton shape="text" width="30%" /> : <Text tone="muted">{summary!.countLabel(summary!.count)}</Text>) : null}
      {sort ? <Menu presentation="anchored" label={sort.label} align="end" selectionMode="single" value={sort.value} onValueChange={onSortChange}
        items={sort.options.map(option => ({ id: option.id, label: option.label }))}
        trigger={<Button size="small" tone="ghost" edge="end" {...(sort.icon === undefined ? {} : { trailing: sort.icon })}>{sort.triggerLabel}</Button>} /> : null}
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
    <ListRow key={index} loading title="" description={summary.loadingLabel} {...(index === 0 ? { loadingLabel: summary.loadingLabel } : {})} />)}</Stack>;
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
  return <Chip ref={triggerRef} label={trigger.label(appliedCount)} aria-label={trigger.accessibilityLabel(appliedCount)} aria-haspopup="dialog" layoutStyle={{alignSelf:"center"}}
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
 // Two-step search shows the rail only beside results; a query-caused zero hides narrowing filters (none can fix it)
 // but keeps scope filters, which are that zero's recovery (resolveSearchFilterRailVisible, Native twin).
 const showRail=resolveSearchFilterRailVisible(phase,committedQuery!==undefined,cause,filtersRole);
 const trigger=filterSheet?.trigger?<SearchFilterTrigger sheet={filterSheet} appliedCount={appliedCount} triggerRef={focus.filterTrigger}/>:null;
 const rail=!showRail?null:trigger&&filters!=null?<Stack axis="inline" align="center" gap="xs" wrap={filtersOverflow==="wrap"}>{trigger}{filters}</Stack>:trigger??filters;
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
 // Search-first routes have no visible heading: navigation and input share one row.
 // Keep explicit host headers and described/titled screens in their existing layout.
 const inlineNavigation=!embedded&&screen.titleVisibility==="hidden"&&screen.header==null;
 const searchInput=queryField ?? <SearchField {...labelProps} clearLabel={queryClearLabel!} value={query} onValueChange={onQueryChange} loading={searching??false} {...submitProps}/>;
 const queryRow=inlineNavigation?<Stack axis="inline" align="center" gap="sm">{screen.exit?<ScreenExitButton {...screen.exit}/>:null}<div style={{flex:1,minWidth:0}}>{searchInput}</div>{screen.actions}</Stack>:searchInput;
 // The query field is the search screen's primary input (2026-10-18 entry focus).
 // Empty results belong to the visible body below the pinned query/filter/map region.
 // Reuse ScreenLayout's centering contract rather than giving EmptyState an arbitrary top inset.
 const centerResults=phase==="results"&&cause!=="none"&&resultSummary?.empty!==undefined;
 const notice=<Stack gap="sm" ref={fieldHost}>{queryRow}{filterSlot}{screen.notice}</Stack>;
 const results=<Stack gap="lg" ref={bodyHost} className="hjm-search-screen__results" tabIndex={-1} justify={embedded&&centerResults?"center":"start"}
   style={{...(embedded||screen.scroll==="content"?{flex:1,minHeight:0}:{}),...(embedded?{overflowY:screen.scroll==="content"?"hidden":"auto"}: {})}}>
   {suggestions||resultSummary||searchingLabel?<SearchAnnouncement text={announcement}/>:null}{body}</Stack>;
 // A sheet already owns the title, exit, focus scope and outer scroll boundary. Reuse the same input/state/results
 // anatomy without adding a nested screen; the result host alone scrolls below the pinned query.
 return <>{embedded?<div className="hjm-search-screen--embedded"><CompositionLayout notice={notice} {...(screen.state===undefined?{}:{state:screen.state})} stateAction={screen.stateAction}
   loadingIndicator={screen.loadingIndicator} footer={screen.footer} layoutStyle={{flex:1,...screen.layoutStyle}}>{results}</CompositionLayout></div>
   :<ScreenLayout {...screen} contentAlignment={phase==="results"&&cause!=="none"&&resultSummary?.empty?"center":screen.contentAlignment??"start"} initialFocus={initialFocus} {...(inlineNavigation?{header:<></>}: {})} notice={notice}>{results}</ScreenLayout>}
  {filterSheet?<SearchFilterSheetView sheet={filterSheet}/>:null}</>;
}

export type PermissionScreenProps = Base & {status:PermissionScreenStatus;illustration?:ReactNode;explanation:ReactNode;request:ScreenFlowAction;settings:ScreenFlowAction;continueAction:ScreenFlowAction;skip?:ScreenFlowAction};
// Permission guidance occupies the current screen body; keep its default centered on both platforms.
export function PermissionScreen({status,illustration,explanation,request,settings,continueAction,skip,...screen}:PermissionScreenProps){const kind=resolvePermissionAction(status);const primary=kind==="request"?request:kind==="settings"?settings:kind==="continue"?continueAction:null;return <ScreenLayout {...screen} contentAlignment={screen.contentAlignment ?? "center"} footer={<Stack gap="xs">{primary?<Action action={primary}/>:null}{skip?<Action action={skip} secondary/>:null}</Stack>}><Stack gap="xl" align="center">{illustration}{explanation}</Stack></ScreenLayout>;}

export type OnboardingStep = {id:string;title:string;description:string;content:ReactNode};
export type OnboardingScreenProps = {steps:readonly OnboardingStep[];index:number;onIndexChange(index:number):void;nextLabel:string;backLabel:string;complete:ScreenFlowAction;skip?:ScreenFlowAction;progressLabel(index:number,total:number):string;exit?:ScreenLayoutProps["exit"];layoutStyle?:ScreenLayoutProps["layoutStyle"]};
export function OnboardingScreen({steps,index,onIndexChange,nextLabel,backLabel,complete,skip,progressLabel,exit,layoutStyle}:OnboardingScreenProps){const position=resolveOnboardingStep(steps.length,index);const step=steps[index]!;
 // Completion and skip persist the same flow: keep navigation stable until the receipt.
 const host=useRef<HTMLDivElement|null>(null);
 // ScreenLayout owns this scroll region; keep focus while resetting each new step.
 useLayoutEffect(()=>{const body=host.current?.querySelector<HTMLElement>(".hjm-screen__body");if(body)body.scrollTop=0;},[index]);
 const pending=!!(complete.pending||skip?.pending);
 return <div ref={host} style={{display:"contents"}}><ScreenLayout {...(layoutStyle===undefined?{}:{layoutStyle})} title={step.title} description={step.description} {...(exit?{exit:{...exit,disabled:!!(exit.disabled||pending)}}:{})} actions={skip?<Action action={{...skip,disabled:!!(skip.disabled||pending)}} secondary/>:null} notice={<Text variant="caption" tone="muted">{progressLabel(index+1,steps.length)}</Text>} footer={<Stack gap="xs"><Action action={position.last?{...complete,disabled:!!(complete.disabled||pending)}:{label:nextLabel,disabled:pending,onAction:()=>onIndexChange(index+1)}}/>{!position.first?<Action action={{label:backLabel,disabled:pending,onAction:()=>onIndexChange(index-1)}} secondary/>:null}</Stack>}>{step.content}</ScreenLayout></div>;}

export type CommentThreadItem = Readonly<{
 /** Root-only reply branch. Total can exceed the loaded preview; HJM owns its indentation and expansion. */
 repliesCount?:number;repliesNotice?:ReactNode;repliesFooter?:ReactNode;
 id:string;parentId:string|null;author:string;body:ReactNode;bodyText?:string;timeLabel:string;timeDateTime?:string;likeCountLabel:string;avatar?:ReactNode;likeIcon:ReactNode;likeLabel:string;likeAction?:ReactNode;actions?:ReactNode;canReply?:boolean;replyDisabled?:boolean;
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
  * authorized image at a time. Exclusive with `media` (validated at render); it sits outside the long-press target because it has its own buttons.
  */
 mediaAlbum?:MediaAlbum}>;
export type CommentReactions = ReactionPickerProps & Readonly<{closeLabel:string;menuAction?:Readonly<{label:string;onPress():void;disabled?:boolean}>;menuActions?:readonly MessageMenuAction[];reportAction?:Readonly<{label:string;onPress():void;disabled?:boolean;icon?:ReactNode}>;interactiveContent?:boolean;/** Icon for the automatic "reply" row of the hold menu. */replyIcon?:ReactNode}>;
/**
 * HJM-owned "more" menu per comment (2026-10-17: common comment structure belongs to HJM, review S4#7). HJM draws the
 * vertical-dots button at the row's trailing edge and opens the shared Menu with danger items last; the product supplies
 * only the localized button name, the items allowed for that comment and the action callback.
 */
export type CommentMenu = Readonly<{
  /** Context belongs to the row: anchored by default; override only for a product interaction reason. */
  presentation?: "grouped" | "anchored" | "bottom";
  /** Required when presentation is grouped or bottom. */
  dismissLabel?: string;
  /** Localized accessible name of the button, e.g. "More options for seoyeon's comment". */
  label(item: CommentThreadItem): string;
  /** Items allowed for this comment (permission is product-owned). An empty list omits the button for that row. */
  items(item: CommentThreadItem): readonly CommentMenuItemDescriptor[];
  /** Runs after the menu closes, so a confirmation dialog can open without competing with the menu for focus. */
  onAction(item: CommentThreadItem, id: string): void;
}>;
export type CommentThreadScreenProps = Base & {items:readonly CommentThreadItem[];expandedIds:readonly string[];onExpandedChange(id:string):void;onLike(id:string):void;onReply(id:string):void;replyLabel:string;repliesLabel(count:number,expanded:boolean):string;composer?:ReactNode;threadHeader?:ReactNode;threadFooter?:ReactNode;commentMenu?:CommentMenu};
export type CommentThreadRowProps = Readonly<{ layoutStyle?: ScreenLayoutProps["layoutStyle"]; item: CommentThreadItem; onLike(id: string): void; onReply(id: string): void; replyLabel: string; commentMenu?: CommentMenu }>;
/** Quiet secondary actions (reply, expand) read as muted copy beside the body, not as filled buttons. */
function CommentTextAction({label,onPress,disabled=false,expanded}:Readonly<{label:string;onPress():void;disabled?:boolean;expanded?:boolean}>){
 return <button type="button" className="hjm-comment-row__action" disabled={disabled} aria-expanded={expanded} onClick={onPress}>{label}</button>;
}

/** Vertical dots drawn in the icon grid, matching Native's drawn glyph (the semantic `more` icon is horizontal). */
function CommentMenuGlyph(){const size=commentThreadRecipe.menuGlyphSize;return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">{[5,12,19].map(y=><circle key={y} cx="12" cy={y} r="1.75"/>)}</svg>;}
function CommentMenuButton({item,menu,items}:Readonly<{item:CommentThreadItem;menu:CommentMenu;items:readonly CommentMenuItemDescriptor[]}>){
 const label=menu.label(item);
 return <Menu presentation={menu.presentation ?? "anchored"} {...(menu.dismissLabel === undefined ? {} : {dismissLabel: menu.dismissLabel})} label={label} align="end" trigger={<IconButton label={label} tone="ghost"><CommentMenuGlyph/></IconButton>} items={items.map(entry=>({id:entry.id,label:entry.label,textValue:entry.label,...(entry.tone===undefined?{}:{tone:entry.tone}),...(entry.disabled===undefined?{}:{disabled:entry.disabled})}))} onActionAfterDismiss={id=>menu.onAction(item,id)}/>;
}

/** Virtualized hosts reuse the same row as CommentThreadScreen; product slots add content, not a second layout. */
export function CommentThreadRow({ item, onLike, onReply, replyLabel, layoutStyle, commentMenu }: CommentThreadRowProps) {
 validateMediaSetChoice(item.media!=null,item.mediaAlbum!==undefined);
 const [albumIndex,setAlbumIndex]=useMediaAlbumIndex(item.mediaAlbum);
 // bodyText inlines the author, so its time always moves under the body; rich bodies opt in with timePlacement.
 const timeInActions=item.bodyText!==undefined||item.timePlacement==="actions";
 const avatarSize=item.parentId===null?commentThreadRecipe.avatarSize:commentThreadRecipe.replyAvatarSize;
 const canReply=item.canReply??item.parentId===null;
 const menuItems=commentMenu?resolveCommentMenuItems(commentMenu.items(item)):[];
 const time=item.timeLabel?<time className="hjm-comment-row__time" dateTime={item.timeDateTime}><Text variant="caption" tone="muted">{item.timeLabel}</Text></time>:null;
 // The like count sits under the heart so the text column carries only identity, body and reply.
 return <Stack key={item.id} axis="inline" align="start" gap="xs" {...(layoutStyle === undefined ? {} : {layoutStyle})}>{item.avatar?<div className="hjm-comment-row__avatar" style={{inlineSize:avatarSize}}>{item.avatar}</div>:null}<div className="hjm-comment-row__text" style={{gap:commentThreadRecipe.lineGap}}>
 {/* A definite media width resolves percentage-sized children; the parent cap preserves narrow comment columns (Spint photo adoption). */}
 {/* Only identity and body are the hold target, so the reply action keeps its own button semantics. */}
 {(()=>{const identity=<>{item.bodyText!==undefined?<Text><Text emphasis="strong">{item.author}</Text>{" "}{item.bodyText}</Text>:(item.author||(item.timeLabel&&!timeInActions))?<Stack axis="inline" gap="xxs" align="center" layoutStyle={{flexWrap:"wrap"}}>{item.author?<Text variant="caption" emphasis="strong">{item.author}</Text>:null}{timeInActions?null:time}</Stack>:null}
 {item.body}{item.media?<div className="hjm-comment-row__media" style={{inlineSize:commentThreadRecipe.mediaMaxWidth,maxInlineSize:"100%",borderRadius:commentThreadRecipe.mediaRadius}}>{item.media}</div>:null}</>;return item.reactions?<MessageReactions {...item.reactions} {...((item.canReply??item.parentId===null)&&!item.replyDisabled ? {replyAction:{label:replyLabel,onPress:()=>onReply(item.id),...(item.reactions.replyIcon===undefined?{}:{icon:item.reactions.replyIcon})}} : {})} triggerClassName="hjm-comment-row__reactions">{identity}</MessageReactions>:identity;})()}
 {item.mediaAlbum?<MediaAlbumView className="hjm-comment-row__album" album={item.mediaAlbum} index={albumIndex} onIndexChange={setAlbumIndex} width={commentThreadRecipe.mediaMaxWidth} radius={commentThreadRecipe.mediaRadius}/>:null}
 {(timeInActions&&time)||canReply||item.reactionSummary?<Stack axis="inline" gap="sm" align="center" layoutStyle={{flexWrap:"wrap"}}>{timeInActions?time:null}{item.reactionSummary}{canReply?<CommentTextAction label={replyLabel} disabled={item.replyDisabled??false} onPress={()=>onReply(item.id)}/>:null}</Stack>:null}
 {/* The text column already spaces lines by lineGap; the panel adds the rest of panelGap. */}
 {item.panel!=null?<div className="hjm-comment-row__panel" style={{marginBlockStart:commentThreadRecipe.panelGap-commentThreadRecipe.lineGap}}>{item.panel}</div>:null}</div>
 <div className="hjm-comment-row__like" {...(menuItems.length||item.actions==null&&item.likeAction===undefined?{"data-edge":"end"}:{})} style={{"--hjm-comment-anchor-line":`var(--hjm-type-${item.bodyText!==undefined?commentThreadRecipe.actionAnchor.inlineTextVariant:commentThreadRecipe.actionAnchor.authorTextVariant}-line-height)`} as CSSProperties}><Stack axis="inline" style={{gap:0}} align="center" layoutStyle={{flexShrink:0}}>{item.likeAction!==undefined?item.likeAction:<IconButton label={item.likeLabel} tone="ghost" onClick={()=>onLike(item.id)}>{item.likeIcon}</IconButton>}{item.actions}{commentMenu&&menuItems.length?<CommentMenuButton item={item} menu={commentMenu} items={menuItems}/>:null}</Stack>{item.likeCountLabel?<div className="hjm-comment-row__like-count" style={{inlineSize:commentThreadRecipe.likeColumnWidth}}><Text variant="caption" tone="muted">{item.likeCountLabel}</Text></div>:null}</div></Stack>;
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
 return <ScreenLayout {...screen} footer={!screen.state||screen.state.kind==="ready"||screen.state.kind==="empty"?composer:null}><Stack gap="lg">{threadHeader}<div className="hjm-comment-thread" style={{gap:commentThreadRecipe.rowGap}}>{roots.map(item=>{const replies=repliesByParent.get(item.id)??[];const total=item.repliesCount;if(total!==undefined&&(!Number.isSafeInteger(total)||total<0))throw new RangeError("CommentThreadItem repliesCount must be nonnegative");const count=Math.max(replies.length,total??0);return <div key={item.id} className="hjm-comment-thread" style={{gap:commentThreadRecipe.rowGap}}>{row(item)}{count||item.repliesNotice||item.repliesFooter?<div className="hjm-comment-thread" style={{gap:commentThreadRecipe.rowGap,marginInlineStart:commentThreadRecipe.replyIndent}}><CommentTextAction label={repliesLabel(count,expanded.has(item.id))} expanded={expanded.has(item.id)} onPress={()=>onExpandedChange(item.id)}/>{expanded.has(item.id)?<>{item.repliesNotice}{replies.map(row)}{item.repliesFooter}</>:null}</div>:null}</div>;})}</div>{threadFooter}</Stack></ScreenLayout>;
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
  const editButton = edit ? <Button tone={editTone} size={editSize} disabled={!!(edit.disabled || edit.pending)} loading={edit.pending ?? false} onClick={edit.onAction}>{edit.label}</Button> : null;
  return <CompositionLayout title={name} headingLevel={headingLevel} leading={<span style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: profileSummaryRecipe.avatarGlyphSize, lineHeight: 1, width: profileSummaryRecipe.avatarSize, height: profileSummaryRecipe.avatarSize, flexShrink: 0, borderRadius: "50%", overflow: "hidden" }}>{avatar}</span>} badge={badge} actions={nameActions} footer={children}>
    {/* Static and actionable counts occupy identical cells; button hit areas must not shift their baselines. */}
    {stats.length ? <Stack axis="inline" gap="md" align="stretch" layoutStyle={{ width: "100%" }}>{stats.map(stat =>
      <Stack key={stat.id} gap="xxs" align="center" justify="center" layoutStyle={{ flex: 1, minWidth: 0 }}>
        {stat.onPress ? <Button tone="ghost" aria-label={`${stat.value} ${stat.label}`} disabled={stat.disabled ?? false} onClick={stat.onPress} layoutStyle={{ width: "100%" }}><Stack gap="xxs" align="center"><Text emphasis="strong">{stat.value}</Text><Text variant="caption" tone="muted">{stat.label}</Text></Stack></Button>
          : <><Text emphasis="strong">{stat.value}</Text><Text variant="caption" tone="muted">{stat.label}</Text></>}
      </Stack>)}</Stack> : null}
    {editButton || actions ? <Stack axis={actionLayout.axis} gap={actionLayout.gap} wrap={actionsLayout === "inline"} layoutStyle={{ width: "100%" }}>{editButton}{actions}</Stack> : null}
  </CompositionLayout>;
}
