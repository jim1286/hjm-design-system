import { MemberProfilePreview } from "./member-profile-preview.js";
import { Avatar } from "@hjmds/react/display";
import roomPhoto from "../../../shared/photos/mountain.jpg";
import { useState } from "react";
import { ChatRoomInvite,ChatRoomDetails,ChatRoomProfile,ChatRoomCreate } from "@hjmds/react/communication";
import type { ChatRoomProfileValue,ChatRoomMember,ChatRoomConfirmation } from "@hjmds/design-contracts/communication";
import { Search,Image,Bell,BellOff } from "lucide-react";
export function ChatRoomPreview({initialMode="details",failSave=false,readOnly=false,onClose}:{initialMode?:"details"|"edit"|"create"|"invite";failSave?:boolean;readOnly?:boolean;onClose?:()=>void}){
 const [memberProfile,setMemberProfile]=useState<ChatRoomMember|null>(null);
 const [mode,setMode]=useState(initialMode),[profile,setProfile]=useState<ChatRoomProfileValue>({name:"주말 산책 모임",description:"토요일 오후, 함께 걷고 이야기해요.",photoUrl:roomPhoto}),[draft,setDraft]=useState<ChatRoomProfileValue>(initialMode==="create"?{name:"",description:"",photoUrl:null}:profile);
 const [members,setMembers]=useState<ChatRoomMember[]>([{id:"me",name:"나",role:"관리자",disabled:true},{id:"seoyeon",name:"서연",detail:"오늘 접속"},{id:"minsu",name:"민수",detail:"어제 접속"}]);
 const [candidates,setCandidates]=useState<ChatRoomMember[]>([{id:"seoyeon",name:"서연",detail:"산책 친구"},{id:"minsu",name:"민수",detail:"회사 동기"},{id:"jisu",name:"지수",detail:"동네 이웃"},{id:"hayoon",name:"하윤",detail:"산책 친구"},{id:"doyun",name:"도윤",detail:"대학 동기"}]);
 const [muted,setMuted]=useState(false);
 const save=async(value:ChatRoomProfileValue)=>{if(failSave)throw new Error("Example failure");setProfile(value);setMode("details");};
 const confirmation=(label:string,description:string,onConfirm:()=>void):ChatRoomConfirmation=>({destructive:label!=="관리자로 지정",label,title:label,description,confirmLabel:label,cancelLabel:"취소",errorLabel:"처리하지 못했어요. 다시 시도해 주세요.",onConfirm});
 const labels={name:"채팅방 이름",description:"소개",photo:"채팅방 사진",changePhoto:"사진 변경",removePhoto:"사진 삭제",save:mode==="create"?"개설":"저장",error:"저장하지 못했어요. 입력은 유지했어요. 다시 시도해 주세요.",photoError:"사진을 올리지 못했어요. 다시 선택해 주세요."};
 const editor={value:draft,onValueChange:setDraft,labels,onPickPhoto:async()=>roomPhoto,nameCharacterCount:{max:30,locale:"ko-KR"}};
 const search={label:"이름 검색",clearLabel:"검색 지우기",busyLabel:"검색 중"},selection={count:(count:number)=>`${count}`,remove:(member:ChatRoomMember)=>`${member.name} 선택 해제`};
 const pick=(id:string,selected:boolean)=>setCandidates(items=>items.map(item=>item.id===id?{...item,selected}:item));
 if(memberProfile)return <MemberProfilePreview name={memberProfile.name} avatar={<Avatar name={memberProfile.name} size="xlarge" decorative/>} onBack={()=>setMemberProfile(null)}/>;
 return <>
 {mode==="details"?<><ChatRoomDetails {...(onClose?{back:{label:"대화 목록",onPress:onClose}}:{})} profile={profile} photoLabel="채팅방 사진" memberCountLabel={`${members.length}명 참여 중`} errorLabel="작업을 완료하지 못했어요."
 {...(!readOnly?{edit:{label:"정보 편집",onPress:()=>{setDraft(profile);setMode("edit");}}}:{})}
 tools={[{id:"search",label:"검색",icon:<Search size={20}/>,onPress:()=>undefined},{id:"media",label:"미디어",icon:<Image size={20}/>,onPress:()=>undefined},{id:"mute",label:"무음",pressed:muted,icon:muted?<BellOff size={20}/>:<Bell size={20}/>,onPress:()=>setMuted(!muted)}]}
 members={{memberProfile:{label:member=>`${member.name} 프로필 보기`,onPress:setMemberProfile},members,title:"참여자",countLabel:`${members.length}`,emptyLabel:"참여자가 없습니다.",...(!readOnly?{invite:{label:"대화상대 초대",onPress:()=>setMode("invite")},memberActions:{label:member=>`${member.name} 관리`,dismissLabel:"닫기",items:member=>member.id==="me"?[]:[confirmation("관리자로 지정",`${member.name}님에게 관리 권한을 부여할까요?`,()=>setMembers(items=>items.map(item=>item.id===member.id?{...item,role:"관리자"}:item))),confirmation("멤버 내보내기",`${member.name}님을 이 채팅방에서 내보낼까요?`,()=>setMembers(items=>items.filter(item=>item.id!==member.id)))]}}:{})}}
 actions={{leave:confirmation("채팅방 나가기","나가면 새로운 메시지를 받지 않아요. 다시 참여하려면 초대가 필요해요.",()=>undefined),deleteHistory:confirmation("내 대화 기록 삭제","내 기록만 삭제해요. 방 참여와 다른 멤버의 기록은 유지돼요.",()=>undefined)}}/>
 </>:mode==="invite"?<ChatRoomInvite title="대화상대 초대" membersLabel="친구" emptyLabel="초대할 사람이 없습니다." members={candidates.map(item=>({...item,disabled:members.some(member=>member.id===item.id)}))} onSelectionChange={pick} search={search} selection={selection} back={{label:"닫기",onPress:()=>setMode("details")}} confirmLabel="초대" errorLabel="초대하지 못했어요." onInvite={ids=>{setMembers(items=>[...items,...candidates.filter(item=>ids.includes(item.id))]);setMode("details");}}/>:mode==="edit"?<ChatRoomProfile {...editor} title="방 정보 편집" back={{label:"뒤로",onPress:()=>setMode("details")}} onSave={save}/>:<ChatRoomCreate onCancel={()=>onClose?onClose():setMode("details")} title="새 채팅방" nextLabel="다음" backLabel="뒤로" search={search} selection={selection} {...editor} members={candidates} membersLabel="친구" emptyMembersLabel="초대할 사람이 없습니다." onSelectionChange={pick} onCreate={async(value,ids)=>{await save(value);setMembers([{id:"me",name:"나",role:"관리자",disabled:true},...candidates.filter(item=>ids.includes(item.id))]);}}/>}
  </>;
}
