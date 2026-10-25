import { IdentityAction } from "./internal/identity-action.js";
import type { ReactNode } from "react";
import { View } from "react-native";
import { conversationRowRecipe as recipe } from "@hjmds/design-contracts/conversation-row";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type ConversationRowProps = Readonly<{
  title: string; preview: string; metadata: string; avatar: ReactNode; unread?: boolean;
  avatarAction?: Readonly<{label:string;onPress():void}>;
  /** Router host for the body, separate from the member avatar destination. */
  renderBody?: (body:ReactNode)=>ReactNode;
}>;

/** Presentation inside a router-owned pressable: the host supplies its full accessible name. */
export function ConversationRow({ title, preview, metadata, avatar, avatarAction, renderBody, unread = false }: ConversationRowProps) {
  const {colors}=useHjmNativeTheme();
  // Separators join visible fields; a missing preview must not leave a leading dot.
  const hasPreview = preview.trim().length > 0;
  const hasMetadata = metadata.trim().length > 0;
  const body = <View style={{flexDirection:"row",alignItems:"center",gap:recipe.gap,flex:1,minWidth:0}}>
    <View style={{gap:recipe.contentGap,flex:1,minWidth:0}}>
      <Text numberOfLines={1} style={{fontWeight:unread?recipe.unreadTitleWeight:recipe.titleWeight}}>{title}</Text>
      <View style={{flexDirection:"row",minWidth:0}}>
        {hasPreview ? <Text numberOfLines={1} variant="label" tone={unread?"primary":"subtle"} style={{flexShrink:1,fontWeight:unread?recipe.unreadPreviewWeight:recipe.titleWeight}}>{preview}</Text> : null}
        {hasMetadata ? <Text variant="label" tone={unread?"primary":"subtle"} style={{flexShrink:0,fontWeight:unread?recipe.unreadPreviewWeight:recipe.titleWeight}}>{hasPreview ? ` · ${metadata}` : metadata}</Text> : null}
      </View>
    </View>
    {unread?<View style={{width:recipe.unreadSize,height:recipe.unreadSize,flexShrink:0,borderRadius:recipe.unreadSize/2,backgroundColor:colors.contentBrand}}/>:null}
  </View>;
  return <View accessibilityElementsHidden={!renderBody&&!avatarAction} importantForAccessibility={renderBody||avatarAction?"auto":"no-hide-descendants"}
    style={{flexDirection:"row",alignItems:"center",gap:recipe.gap,paddingHorizontal:recipe.paddingInline,paddingVertical:recipe.paddingBlock,minWidth:0,width:"100%"}}>
    {avatarAction?<IdentityAction action={avatarAction}><View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{alignItems:"center",justifyContent:"center",width:recipe.avatarSize,height:recipe.avatarSize,flexShrink:0,borderRadius:recipe.avatarSize/2,overflow:"hidden"}}>{avatar}</View></IdentityAction>:<View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{alignItems:"center",justifyContent:"center",width:recipe.avatarSize,height:recipe.avatarSize,flexShrink:0,borderRadius:recipe.avatarSize/2,overflow:"hidden"}}>{avatar}</View>}
    {renderBody?renderBody(body):body}
  </View>;
}
