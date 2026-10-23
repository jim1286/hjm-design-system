import { useEffect, useRef, type ReactNode } from "react";
import { Animated, AppState, View } from "react-native";
import { IconButton } from "./actions.js";
import { CounterBadge } from "./data-display.js";
import { iconButtonRecipe, resolveIconButtonBadgeOffset, type IconButtonEdge } from "@hjmds/design-contracts/recipes";
import { visibleControlHeight } from "@hjmds/design-contracts/components/design-system-provider";
import { useHjmNativeTheme } from "./provider.js";
import { iconButtonEdgeMargins } from "./internal/icon-button-edge.js";
export type NotificationBellProps = Readonly<{ label: string; count: number; icon: ReactNode; onPress: () => void; disabled?: boolean; active?: boolean;
  /** Container edge(s) the bell sits on, as IconButton `edge`: its glyph slot lands on the container inset (top-bar end). */
  edge?: IconButtonEdge }>;
export function NotificationBell({label,count,icon,onPress,disabled=false,active=true,edge}:NotificationBellProps){
  if(!Number.isSafeInteger(count)||count<0)throw new RangeError("Unread count must be a nonnegative integer");
  const {environment}=useHjmNativeTheme();const previous=useRef(count);const angle=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    const increased=count>previous.current;previous.current=count;angle.setValue(0);
    if(!increased||!active||environment.reducedMotion||AppState.currentState!=='active')return;
    // Match the Web's one-shot notification, without adding a motion engine.
    const animation=Animated.sequence([1,-1,0.5,0].map(toValue=>Animated.timing(angle,{toValue,duration:100,useNativeDriver:true})));animation.start();
    const sub=AppState.addEventListener('change',state=>{if(state!=='active'){animation.stop();angle.setValue(0);}});
    return ()=>{animation.stop();angle.setValue(0);sub.remove();};
  },[count,active,environment.reducedMotion,angle]);
  // The IconButton edge overhang goes on the root, not the button: the badge is anchored to the root's end, and a
  // margin on the inner button would shrink the root and pull the badge in by the overhang (2026-10-17 1.27.2 adoption).
  const edgeMargins=iconButtonEdgeMargins(edge,iconButtonRecipe.defaults.tone,"small",environment.minimumVisualTarget);
  // Badge size and offset come from iconButtonRecipe.badge, as on Web: it rides above the glyph so only its floating
  // ring touches it (2026-10-23 web check: the medium badge at top 0 hid 82% of an 18px glyph).
  const badgeOffset=resolveIconButtonBadgeOffset("small",visibleControlHeight(iconButtonRecipe.sizes.small.diameter,environment.minimumVisualTarget));
  return <View style={{position:'relative',alignSelf:'flex-start',...edgeMargins}}><IconButton size="small" hitSlop={0} label={label} disabled={disabled} onPress={onPress}><Animated.View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{transform:[{rotate:angle.interpolate({inputRange:[-1,1],outputRange:['-12deg','12deg']})}]}}>{icon}</Animated.View></IconButton><View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{position:'absolute',end:badgeOffset.inlineEnd,top:badgeOffset.blockStart}}><CounterBadge count={count} size={iconButtonRecipe.badge.size} variant={iconButtonRecipe.badge.variant}/></View></View>;
}
