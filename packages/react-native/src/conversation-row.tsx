import type { ReactNode } from "react";
import { View } from "react-native";
import { conversationRowRecipe as recipe } from "@hjmds/design-contracts/conversation-row";
import { Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";

export type ConversationRowProps = Readonly<{
  title: string; preview: string; metadata: string; avatar: ReactNode; unread?: boolean;
}>;

/** Presentation inside a router-owned pressable: the host supplies its full accessible name. */
export function ConversationRow({ title, preview, metadata, avatar, unread = false }: ConversationRowProps) {
  const {colors}=useHjmNativeTheme();
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{flexDirection:"row",alignItems:"center",gap:recipe.gap,paddingHorizontal:recipe.paddingInline,paddingVertical:recipe.paddingBlock,minWidth:0,width:"100%"}}>
    <View style={{alignItems:"center",justifyContent:"center",width:recipe.avatarSize,height:recipe.avatarSize,flexShrink:0,borderRadius:recipe.avatarSize/2,overflow:"hidden"}}>{avatar}</View>
    <View style={{gap:recipe.contentGap,flex:1,minWidth:0}}>
      <Text numberOfLines={1} style={{fontWeight:unread?recipe.unreadTitleWeight:recipe.titleWeight}}>{title}</Text>
      <View style={{flexDirection:"row",minWidth:0}}>
        <Text numberOfLines={1} variant="label" tone={unread?"primary":"subtle"} style={{flexShrink:1,fontWeight:unread?recipe.unreadPreviewWeight:recipe.titleWeight}}>{preview}</Text>
        <Text variant="label" tone={unread?"primary":"subtle"} style={{flexShrink:0,fontWeight:unread?recipe.unreadPreviewWeight:recipe.titleWeight}}>{` · ${metadata}`}</Text>
      </View>
    </View>
    {unread?<View style={{width:recipe.unreadSize,height:recipe.unreadSize,flexShrink:0,borderRadius:recipe.unreadSize/2,backgroundColor:colors.contentBrand}}/>:null}
  </View>;
}
