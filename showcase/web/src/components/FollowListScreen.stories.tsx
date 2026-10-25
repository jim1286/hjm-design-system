import { Menu } from "@hjmds/react/overlays";
import { MemberProfilePreview } from "../patterns/member-profile-preview.js";
import { Avatar, Icon } from "@hjmds/react/display";
import { Button, IconButton } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { useState } from "react";
import { FollowListScreen } from "@hjmds/react/follow-list";
import { followListPeople, followListLabels } from "../../../shared/follow-list-preview.js";
import { PreviewRoute } from "../patterns/preview-tools.js";

function Preview({ empty = false, fail = false }: { empty?: boolean; fail?: boolean }) {
  const [tab, setTab] = useState<"followers" | "following">("followers");
  const [query, setQuery] = useState("");
  const [sortName, setSortName] = useState(false);
  const [messagePeer, setMessagePeer] = useState<string | null>(null);
  const [people, setPeople] = useState(followListPeople);
  const [profile, setProfile] = useState<string | null>(null);
  const visible = people.filter(person => (tab === "followers" || person.following) &&
    `${person.username} ${person.name}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  if (sortName) visible.sort((a, b) => a.username.localeCompare(b.username));
  const selected=people.find(person=>person.id===profile);
  if(selected)return <MemberProfilePreview name={selected.name} avatar={<Avatar name={selected.name} size="large" decorative/>} onBack={()=>setProfile(null)}/>;
  return <PreviewRoute><FollowListScreen title={profile ?? "jimin.archive"} labels={followListLabels}
    tab={tab} onTabChange={value => { setTab(value); setQuery(""); }} query={query} onQueryChange={setQuery}
    toolbar={<Stack axis="inline" gap="xs" align="center" justify="end">
      <Button tone="ghost" size="small" onClick={() => setSortName(value => !value)}>정렬 기준 {sortName ? "이름순" : "최신순"}</Button>

    </Stack>}
    notice={messagePeer ? <Text>대화 열기: {people.find(person => person.id === messagePeer)?.username}</Text> : undefined}
    people={empty ? [] : visible.map(person => ({ ...person,
      ...(!person.following ? { followLabel: "맞팔로우하기" } : { message: { label: "메시지 보내기", onPress: () => setMessagePeer(person.id) } }),
      action: tab === "followers" ? <IconButton label={`${person.username}: 팔로워에서 삭제`} size="small" onClick={() => setPeople(current => current.filter(item => item.id !== person.id))}>×</IconButton> : <Menu label={`${person.username}: 관계 관리`} presentation="anchored" items={[{id:"unfollow",label:"팔로우 취소",tone:"danger"}]} onActionAfterDismiss={() => setPeople(current => current.map(item => item.id === person.id ? {...item, following:false} : item))} trigger={<IconButton label={`${person.username}: 관계 관리`} size="small"><Icon name="moreVertical" decorative /></IconButton>} />,
    }))} onOpenProfile={setProfile}
    exit={{ kind: "back", label: "뒤로", onClick: () => setProfile(null) }}
    onFollowChange={async (id, following) => {
      await new Promise(resolve => setTimeout(resolve, 450));
      if (fail) throw new Error("Preview failure");
      setPeople(current => current.map(person => person.id === id ? { ...person, following } : person));
    }} /></PreviewRoute>;
}
export default { id: "common-follow-list", title: "실험/화면/소통/팔로워와 팔로잉", component: Preview, parameters: { layout: "fullscreen" } };
export const Default = { name: "기본" };
export const Dark = { name: "어두운 테마", globals: { theme: "dark" } };
export const Empty = { name: "빈 목록", args: { empty: true } };
export const Failure = { name: "요청 실패", args: { fail: true } };
