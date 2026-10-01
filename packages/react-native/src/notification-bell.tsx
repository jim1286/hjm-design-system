import { useEffect, useRef, type ReactNode } from "react";
import { Animated, AppState, View } from "react-native";
import { IconButton } from "./actions.js";
import { CounterBadge } from "./data-display.js";
import { useHjmNativeTheme } from "./provider.js";
export type NotificationBellProps = Readonly<{ label: string; count: number; icon: ReactNode; onPress: () => void; disabled?: boolean; active?: boolean }>;
export function NotificationBell({label,count,icon,onPress,disabled=false,active=true}:NotificationBellProps){
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
  return <View style={{position:'relative',alignSelf:'flex-start'}}><IconButton label={label} disabled={disabled} onPress={onPress}><Animated.View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{transform:[{rotate:angle.interpolate({inputRange:[-1,1],outputRange:['-12deg','12deg']})}]}}>{icon}</Animated.View></IconButton><View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{position:'absolute',end:0,top:0}}><CounterBadge count={count} variant="floating"/></View></View>;
}
