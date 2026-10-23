export type ComposerLengthFeedback = Readonly<{ label: string; formatCount: (used: number, max: number) => string; threshold?: number }>;
/** Match the controlled text/maxLength UTF-16 unit; do not silently trim a user's draft. */
export function resolveComposerLimit(value: string, max: number, threshold = .8) {
 if(!Number.isSafeInteger(max)||max<=0||!Number.isFinite(threshold)||threshold<0||threshold>1)throw new RangeError("Composer limit must be positive and threshold in [0,1]");
 return { used:value.length,max,near:value.length/max>=threshold,exceeded:value.length>max };
}
export type ReplyTarget = Readonly<{ id: string; author: string; excerpt: string }>;
export function validateReplyTarget(target: ReplyTarget|null):void {
 if(target!==null&&!target.id.trim())throw new TypeError("Reply target requires the actual message ID");
}
export type SearchResponse<T> = Readonly<{ result: T; suggestions: readonly Readonly<{query: string;match?:Readonly<{start:number;end:number}>}>[] }>;

/** Room data stays controlled: only the product can acknowledge persistence or grant permissions. */
export type ChatRoomProfileValue = Readonly<{ name: string; description: string; photoUrl: string | null }>;
/** `role` is the product's localized role mark ("관리자"); `detail` is the secondary line (status, handle). */
export type ChatRoomMember = Readonly<{ id: string; name: string; detail?: string; role?: string; photoUrl?: string; selected?: boolean; disabled?: boolean }>;
export type ChatRoomConfirmation = Readonly<{ destructive?: boolean; label: string; title: string; description: string; confirmLabel: string; cancelLabel: string; errorLabel: string; onConfirm: () => void | Promise<void> }>;
/** Per-member permitted actions behind one anchored menu. `label` names the menu for that member ("서연 관리"). */
export type ChatRoomMemberActions = Readonly<{ label: (member: ChatRoomMember) => string; dismissLabel: string; items: (member: ChatRoomMember) => readonly ChatRoomConfirmation[] }>;
/** Member search for create/invite. Without `onQueryChange` the list is filtered locally by name. */
export type ChatRoomMemberSearch = Readonly<{ label: string; clearLabel: string; busyLabel: string; query?: string; onQueryChange?: (query: string) => void; searching?: boolean }>;
/** Labels for the selected-people strip and its count. */
export type ChatRoomSelectionLabels = Readonly<{ count: (count: number) => string; remove: (member: ChatRoomMember) => string }>;
export function filterChatRoomMembers(members: readonly ChatRoomMember[], query: string): readonly ChatRoomMember[] {
 const needle = query.trim().toLocaleLowerCase();
 return needle ? members.filter(member => member.name.toLocaleLowerCase().includes(needle)) : members;
}
export function selectedChatRoomMembers(members: readonly ChatRoomMember[]): readonly ChatRoomMember[] {
 return members.filter(member => member.selected === true && member.disabled !== true);
}
export function canSubmitChatRoom(profile: ChatRoomProfileValue, memberIds?: readonly string[]): boolean {
 return profile.name.trim().length > 0 && (memberIds === undefined || (memberIds.length > 0 && memberIds.every(id => id.trim().length > 0) && new Set(memberIds).size === memberIds.length));
}
