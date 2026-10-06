import { useState, type ReactNode } from "react";
import { SettingsScreen } from "@hjmds/react/screens";
import { Button } from "@hjmds/react/actions";
import { Stack, Text } from "@hjmds/react/layout";
import { Avatar, ListRow } from "@hjmds/react/display";
import { Sheet } from "@hjmds/react/overlays";
import { Bell, ChevronRight, Globe2, HelpCircle, ShieldCheck, Volume2, Palette, UserRound } from "lucide-react";
import type { ScreenContentState } from "@hjmds/design-contracts/screen-patterns";
import { HjmProvider } from "@hjmds/react/provider";
import { RadioGroup, Switch } from "@hjmds/react/selection";
import { TextField } from "@hjmds/react/forms";

const icons = { bell: Bell, next: ChevronRight, language: Globe2, help: HelpCircle, shield: ShieldCheck, sound: Volume2, palette: Palette, user: UserRound };
function Icon({ name }: { name: keyof typeof icons }) {
  const Component = icons[name];
  
  return <Component size={20} strokeWidth={1.8} color={"currentColor"} />;
}
type Props = { leading: ReactNode; state: ScreenContentState; stateAction: ReactNode };
type Panel = "theme" | "language" | "profile" | "privacy" | "help" | null;
const themes = [{ value: "system", label: "기기 설정 따르기" }, { value: "light", label: "라이트 모드" }, { value: "dark", label: "다크 모드" }];
const languages = [{ value: "ko", label: "한국어" }, { value: "en", label: "English" }, { value: "ja", label: "日本語" }];

/** Local fixture state models product-owned settings; it never writes an account or OS permission. */
export function SettingsPagePreview({ leading, state, stateAction }: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("ko");
  const [replies, setReplies] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [name, setName] = useState("지민");
  const [draftName, setDraftName] = useState(name);
  const [activityVisible, setActivityVisible] = useState(true);
  const titles = { theme: "화면 테마", language: "언어", profile: "프로필 수정", privacy: "개인정보와 보안", help: "도움말" };
  const row = (title: string, icon: keyof typeof icons, value: string, target: Panel) => <ListRow title={title} {...(value ? { description: value } : {})} leading={<Icon name={icon} />} trailing={<Icon name="next" />} onClick={() => setPanel(target)} />;
  // The default inherits Storybook's environment, so dark/large-text previews remain faithful.
  const themeOverride = theme === "dark" || theme === "light" ? { theme } as const : {};
  const settingsState: ScreenContentState = state.kind === "loading" ? { kind: "loading", title: "설정을 불러오고 있어요" }
    : state.kind === "error" ? { kind: "error", title: "설정을 불러오지 못했어요", description: "연결을 확인하고 다시 시도해 주세요." }
    : state.kind === "restricted" ? { kind: "restricted", title: "내 설정을 이어서 사용하세요", description: "로그인하면 계정에 저장한 설정을 가져올 수 있어요." } : state;
  return <HjmProvider {...themeOverride}><SettingsScreen title="설정" leading={leading} state={settingsState} stateAction={stateAction}
    profile={<Stack gap="md" align="center"><Avatar name={name} size="large"/><Stack gap="xs" align="center"><Text variant="title" emphasis="strong">{name}</Text><Text variant="caption" tone="muted">@jimin</Text></Stack><Button size="small" tone="ghost" onClick={()=>{setDraftName(name);setPanel("profile");}}>프로필 수정</Button></Stack>}

    sections={[
      { id: "appearance", title: "화면과 언어", children: <Stack gap="xxs">{row("화면 테마", "palette", themes.find(item => item.value === theme)!.label, "theme")}{row("언어", "language", languages.find(item => item.value === language)!.label, "language")}</Stack> },
      { id: "notifications", title: "알림과 소리", children: <Stack gap="xxs">
        <ListRow title="답글·메시지 알림" leading={<Icon name="bell" />} trailing={<Switch label="답글·메시지 알림" labelVisibility="hidden" checked={replies} onCheckedChange={setReplies} />} />
        <ListRow title="앱 효과음" leading={<Icon name="sound" />} trailing={<Switch label="앱 효과음" labelVisibility="hidden" checked={sounds} onCheckedChange={setSounds} />} />
      </Stack> },
      { id: "account", title: "계정 및 지원", children: <Stack gap="xxs">{row("개인정보와 보안", "shield", "", "privacy")}{row("도움말", "help", "", "help")}<ListRow title="앱 버전" trailing={<Text variant="caption" tone="muted">1.0.0</Text>} /></Stack> },
    ]} />
    <Sheet open={panel !== null} onOpenChange={open => { if (!open) setPanel(null); }} title={panel ? titles[panel] : "설정"} closeLabel="닫기">
      {panel === "theme" || panel === "language" ? <RadioGroup accessibilityLabel={titles[panel]} orientation="vertical" value={panel === "theme" ? theme : language} items={panel === "theme" ? themes : languages} onValueChange={value => { if (value) { if (panel === "theme") setTheme(value); else setLanguage(value); setPanel(null); } }} /> : null}
      {panel === "profile" ? <Stack gap="lg"><TextField label="이름" value={draftName} onChange={event => setDraftName(event.currentTarget.value)} description="다른 사람에게 표시되는 이름이에요." /><Button disabled={!draftName.trim()} onClick={() => { setName(draftName.trim()); setPanel(null); }}>저장</Button></Stack> : null}
      {panel === "privacy" ? <Stack gap="lg"><ListRow title="활동 상태 공개" description="대화 상대가 내 활동 상태를 볼 수 있어요" trailing={<Switch label="활동 상태 공개" labelVisibility="hidden" checked={activityVisible} onCheckedChange={setActivityVisible} />} /><Stack gap="sm"><Stack gap="xs"><Text emphasis="strong">연결된 계정</Text><Text tone="muted">Apple · 이메일 비공개</Text></Stack></Stack></Stack> : null}
      {panel === "help" ? <Stack gap="lg"><Stack gap="xs"><Text emphasis="strong">알림이 오지 않아요</Text><Text tone="muted">기기의 알림 설정에서 앱의 알림이 허용되어 있는지 확인해 주세요.</Text></Stack><Stack gap="xs"><Text emphasis="strong">테마를 바꾸고 싶어요</Text><Text tone="muted">화면 테마에서 라이트·다크 모드를 선택하거나 기기 설정을 따를 수 있어요.</Text></Stack></Stack> : null}
    </Sheet></HjmProvider>;
}
