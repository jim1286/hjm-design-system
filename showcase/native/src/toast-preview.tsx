import {useEffect,useState} from 'react';
import {View} from 'react-native';
import {ToastRegion,useToastRegion} from '@hjmds/react-native/feedback';
import {Text} from '@hjmds/react-native/primitives';
import {createLiquidToastPresentation} from '@hjmds/react-native/toast-liquid';
import {spacing} from '@hjmds/design-contracts/foundations';
import {profileCopy as copy} from '../../shared/design-profile';
import {toastExample} from '../../shared/component-examples';
import {PreviewTools,PreviewToolButton} from './preview-tools';
const liquid=createLiquidToastPresentation();
function Trigger({enhanced,onNextTheme}:{enhanced:boolean;onNextTheme?:()=>void}){
 const toast=useToastRegion();const [message,setMessage]=useState('');
 const presentation=enhanced?{presentation:'liquid' as const}:{};
 const publish=(entry:typeof toastExample.saved|typeof toastExample.reply)=>{setMessage('');toast.publish({id:entry.id,...(entry===toastExample.saved?{tone:'success' as const}:{}),title:entry.title,description:entry.description,closeLabel:entry.closeLabel,press:{accessibilityLabel:entry.pressLabel,onPress:()=>setMessage(entry.pressResult)},...presentation,
  // A profile comparison retains one visible entry across theme changes; ordinary Toast stories keep their default timeout.
  ...(onNextTheme?{durationMs:null}:{})});};
 // The story opens on the toast itself, as Web shows the Toast card; the triggers are only replay tools (2026-10-17 review F N8).
 useEffect(()=>{publish(toastExample.saved);},[]);
 return <View style={{gap:spacing.md}}>{message?<Text accessibilityLiveRegion="polite">{message}</Text>:null}<PreviewTools><PreviewToolButton onPress={()=>publish(toastExample.saved)}>{toastExample.showSaved}</PreviewToolButton><PreviewToolButton onPress={()=>publish(toastExample.reply)}>{toastExample.showReply}</PreviewToolButton>{onNextTheme?<PreviewToolButton onPress={onNextTheme}>{copy.nextTheme}</PreviewToolButton>:null}</PreviewTools></View>;}
export function ToastPreview({enhanced=false,onNextTheme}:{enhanced?:boolean;onNextTheme?:()=>void}){
 // An overlay needs the canvas height. The top-placed toast covers the top of the canvas, so the replay tools sit at
 // the bottom instead of behind a fixed 180pt spacer.
 return <ToastRegion placement="top" maxVisible={1} layoutStyle={{flex:1}} {...(enhanced?{presentationAdapter:liquid}:{})}><View style={{flex:1,justifyContent:'flex-end'}}><Trigger enhanced={enhanced} {...(onNextTheme?{onNextTheme}:{})}/></View></ToastRegion>;
}
