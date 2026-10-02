import {View} from 'react-native';
import {ToastRegion,useToastRegion} from '@hjmds/react-native/feedback';
import {Button} from '@hjmds/react-native/actions';
import {Text} from '@hjmds/react-native/primitives';
import {createLiquidToastPresentation} from '@hjmds/react-native/toast-liquid';
import {spacing} from '@hjmds/design-contracts/foundations';
const liquid=createLiquidToastPresentation();
function Trigger({enhanced}:{enhanced:boolean}){const toast=useToastRegion();return <View style={{gap:spacing.md}}><Text emphasis="strong">{enhanced?'물방울 알림':'알림 카드'}</Text><Text>{enhanced?"물방울 애니메이션과 알림 표면을 확인하는 예제입니다.":"알림은 미리보기 상단에 나타납니다. iPhone 12 제품 화면은 이 기본 카드 진입을 사용합니다."}</Text><Button onPress={()=>toast.publish({id:'updated-toast',tone:'success',title:'내 뚝에 저장했어요',description:'이제 언제든 다시 열고, 내 취향으로 고칠 수 있어요.',closeLabel:'알림 닫기',...(enhanced?{presentation:'liquid' as const}:{})})}>알림 띄우기</Button></View>;}
export function ToastPreview({enhanced=false}:{enhanced?:boolean}){
 // An overlay needs the canvas height. Nesting it in the old short ScrollView
 // anchored the bottom toast above the button and clipped it under the status bar.
 return <ToastRegion placement="top" maxVisible={1} style={{flex:1}} {...(enhanced?{presentationAdapter:liquid}:{})}><View style={{paddingTop:180,gap:spacing.md}}><Trigger enhanced={enhanced}/></View></ToastRegion>;
}
