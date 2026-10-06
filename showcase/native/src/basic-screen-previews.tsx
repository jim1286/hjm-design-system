import { SavedItemsPreview } from "./saved-profile-previews";
import { AccountFlowPreview } from "./screen-flow-previews";
import { InstagramCommentsPreview } from "./instagram-comments-preview";

// The search preview moved to search-discovery-preview.tsx in the 2026-10-06 search redesign.
type Options = { stateKind?: "ready" | "loading" | "empty" | "error" | "restricted" };
export function CommentsScreenPreview(props:Options&{tools?:boolean}){return <InstagramCommentsPreview {...props}/>;}
export function SavedScreenPreview(props:Options){return <SavedItemsPreview {...props}/>;}
// 기본 흐름/프로필과 계정 was merged here (2026-10-06): both rendered AccountFlowPreview, so the
// recovery and edit-mode stories now pass their flow options through this single profile item.
export function ProfileScreenPreview(props:Options&{tools?:boolean;initialEditing?:boolean}){return <AccountFlowPreview {...props}/>;}
