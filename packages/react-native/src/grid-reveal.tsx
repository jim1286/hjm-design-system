import { useEffect, useRef, type ReactNode } from "react";
import { Animated, AppState, View } from "react-native";
import { gridRevealTiles, gridRevealDuration } from "@hjmds/design-contracts/grid-reveal";
import { useHjmNativeTheme } from "./provider.js";
export type GridRevealProps=Readonly<{ready:boolean;active?:boolean;children:ReactNode}>;
/** Decorative mask only; the host Image owns load/error and the accessible description. */
export function GridReveal({ready,active=true,children}:GridRevealProps){
 const{colors,environment}=useHjmNativeTheme();const values=useRef(gridRevealTiles.map(()=>new Animated.Value(0))).current;
 useEffect(()=>{
  const clear=()=>values.forEach(value=>{value.stopAnimation();value.setValue(0);});clear();
  if(!ready||!active||environment.reducedMotion||AppState.currentState!=="active")return;
  const animations=values.map((value,index)=>{value.setValue(1);return Animated.timing(value,{toValue:0,duration:gridRevealDuration,delay:gridRevealTiles[index]!.delay,useNativeDriver:true});});
  animations.forEach(animation=>animation.start());const stop=()=>{animations.forEach(animation=>animation.stop());clear();};
  const subscription=AppState.addEventListener("change",state=>{if(state!=="active")stop();});return()=>{stop();subscription.remove();};
 },[ready,active,environment.reducedMotion,values]);
 return <View style={{position:"relative"}}>{children}<View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{position:"absolute",top:0,right:0,bottom:0,left:0}}>{gridRevealTiles.map(tile=><Animated.View key={tile.id} style={{position:"absolute",top:`${tile.row*25}%`,left:`${tile.column*25}%`,width:"25%",height:"25%",opacity:values[tile.id],backgroundColor:colors.bg}}/>)}</View></View>;
}
