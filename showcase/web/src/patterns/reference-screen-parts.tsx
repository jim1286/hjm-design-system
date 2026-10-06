import { Stack, Text } from "@hjmds/react/layout";
import { Avatar, ListRow } from "@hjmds/react/display";
import river from "../../../shared/photos/river.jpg";
import mountain from "../../../shared/photos/mountain.jpg";
import valley from "../../../shared/photos/valley.jpg";
import "./reference-basics.css";
const photos=[river,mountain,valley];
export function PreviewPhoto({index=0,square=false,label="기록 사진"}:{index?:number;square?:boolean;label?:string}){return <img src={photos[index%3]} alt={label} className="reference-photo" style={{aspectRatio:square?1:1.6}}/>;}
export function PhotoTile({index,title,onOpen,hideTitle=false}:{index:number;title:string;onOpen():void;hideTitle?:boolean}){return <button type="button" aria-label={title} onClick={onOpen} className="reference-photo-tile"><PreviewPhoto index={index} square/>{hideTitle?null:<Text emphasis="strong">{title}</Text>}</button>;}
export function ProfileSummary({name}:{name:string}){return <Stack gap="md"><Stack axis="inline" gap="xl" align="center" layoutStyle={{flexWrap:"wrap"}}><Avatar name={name} size="large"/><Stack axis="inline" gap="lg" layoutStyle={{flex:1,flexWrap:"wrap"}}>{[{value:"24",label:"게시물"},{value:"128",label:"팔로워"},{value:"86",label:"팔로잉"}].map(item=><Stack key={item.label} gap="xxs" align="center"><Text variant="title" emphasis="strong">{item.value}</Text><Text variant="caption">{item.label}</Text></Stack>)}</Stack></Stack><Stack gap="xs"><Text emphasis="strong">{name}</Text><Text>산책, 책, 그리고 일상의 작은 순간들.</Text><Text variant="caption" tone="muted">@jimin · 서울</Text></Stack></Stack>;}
export function PermissionPreview(){return <Stack gap="xl"><Stack gap="md"><Text variant="caption" tone="muted">이런 소식을 알려드려요</Text><ListRow title="서연님이 답글을 남겼어요" description="저도 그 산책길 좋아해요. 다음에 같이 걸어요!" leading={<Avatar name="서연" size="small"/>}/></Stack><Stack gap="sm"><Text emphasis="strong">필요한 소식만, 놓치지 않게</Text><Text tone="muted">새 답글과 메시지를 받을 수 있어요. 알림 종류는 언제든 설정에서 바꿀 수 있어요.</Text></Stack></Stack>;}
export function IntroPreview({step}:{step:number}){return <Stack gap="lg"><PreviewPhoto index={step}/><Stack gap="sm"><Text emphasis="strong">오늘의 작은 발견</Text><Text tone="muted">한 장의 사진, 짧은 한 줄로 시작해요.</Text></Stack></Stack>;}
