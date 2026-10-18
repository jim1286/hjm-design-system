// HJM 1.31 screen-flow variants from the 2026-10-18 app audit, same cases as Web flow-variants.previews.tsx: auth
// header band, step-back editor with pressable steps, edit action inside the profile summary, operator review and the
// chrome-less report form. Only public subpaths are used; the copy is example data, never renderer defaults.
import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { AuthProviderButton } from "@hjmds/react-native/provider-button";
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "@hjmds/react-native/auth-screen";
import { EditorScreen, ModerationForm, ModerationScreen, ProfileScreen, ProfileSummary } from "@hjmds/react-native/screen-flows";
import { Steps } from "@hjmds/react-native/steps";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Notice } from "@hjmds/react-native/feedback";
import { Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { authExample as auth } from "../../shared/component-examples";

const stepStatusLabels = { pending: "예정", current: "진행 중", complete: "완료", error: "오류" };
const stepName = ({ position, total, label }: { position: number; total: number; label: string }) => `${total}단계 중 ${position}단계, ${label}`;
const composeSteps = [{ id: "color", label: "색" }, { id: "emoji", label: "이모지" }, { id: "text", label: "글" }] as const;
type ComposeStep = (typeof composeSteps)[number]["id"];
// Screen previews fill the story canvas; a ScrollView frame would nest the screen's own scroll body.
function Fill({ children }: { children: ReactNode }) { return <View style={{ flex: 1 }}>{children}</View>; }
// Component-level previews keep the shared screen gutter around them.
function Inset({ children }: { children: ReactNode }) { const { tokens } = useHjmNativeTheme(); return <View style={{ padding: tokens.spacing.md }}>{children}</View>; }

/** AuthScreenLayout `title`·`exit`: the layout owns the route header instead of a TopBar stacked above it. */
export function AuthScreenHeaderPreview() {
  const [message, setMessage] = useState("");
  return <Fill><AuthScreenLayout mainCard title="로그인" exit={{ kind: "close", label: "닫기", onPress: () => setMessage("닫기를 눌렀어요") }}
    hero={<AuthScreenHero {...(message ? { eyebrow: message } : {})} title={auth.hero.title} description={auth.hero.description} />}
    main={<Stack gap="xs">{auth.providers.slice(0, 2).map(provider => <AuthProviderButton key={provider.id} descriptor={{ provider: provider.id, label: provider.label }}
      logo={<Text>{provider.mark}</Text>} onPress={() => setMessage(`${provider.label}로 계속해요`)} />)}</Stack>}
    footer={<AuthScreenFooter links={auth.policyLinks.map(label => ({ label, onPress: () => setMessage(`${label}를 열어요`), accessibilityHint: "브라우저에서 열려요" }))} />} /></Fill>;
}

/** Steps `onStepPress`: completed steps are buttons back to that step; the current and later steps stay static. */
export function StepsRevisitPreview() {
  const [current, setCurrent] = useState<ComposeStep>("text");
  const index = composeSteps.findIndex(step => step.id === current);
  return <Inset><Stack gap="md">
    <Steps descriptor={{ steps: composeSteps, currentStepId: current }} statusLabels={stepStatusLabels} composeAccessibleName={stepName} onStepPress={setCurrent} />
    <Button tone="secondary" disabled={index === composeSteps.length - 1} onPress={() => setCurrent(composeSteps[index + 1]!.id)}>다음 단계</Button>
  </Stack></Inset>;
}

/** EditorScreen `stepBack` with pressable Steps: back steps through the wizard; the first step closes with `cancel`. */
export function EditorStepBackPreview() {
  const [current, setCurrent] = useState<ComposeStep>("emoji");
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const index = composeSteps.findIndex(step => step.id === current);
  const last = index === composeSteps.length - 1;
  return <Fill><EditorScreen title="기록 남기기" dirty={false}
    submit={{ label: last ? "남기기" : "다음", onAction: () => last ? setMessage("기록을 남겼어요") : setCurrent(composeSteps[index + 1]!.id) }}
    cancel={{ label: "닫기", onAction: () => setMessage("작성을 닫았어요") }}
    {...(index > 0 ? { stepBack: { label: "이전 단계", onAction: () => setCurrent(composeSteps[index - 1]!.id) } } : {})}
    discard={{ mode: "confirm", title: "작성을 그만둘까요?", description: "초안은 보관돼요", confirmLabel: "닫기", cancelLabel: "계속 쓰기", fallbackErrorMessage: "다시 시도해 주세요" }}
    {...(message ? { draftStatus: <Text variant="caption" tone="muted">{message}</Text> } : {})}>
    <Stack gap="lg">
      <Steps descriptor={{ steps: composeSteps, currentStepId: current }} statusLabels={stepStatusLabels} composeAccessibleName={stepName} onStepPress={setCurrent} />
      {current === "text" ? <TextField label="글" value={text} onValueChange={setText} initialFocusTarget /> : <Text>{current === "color" ? "꽃 색을 골라요" : "어울리는 이모지를 골라요"}</Text>}
    </Stack>
  </EditorScreen></Fill>;
}

/** ProfileScreen `editPlacement="summary"`: the edit action sits inside the profile card. */
export function ProfileEditInSummaryPreview() {
  const [message, setMessage] = useState("");
  return <Fill><ProfileScreen title="내 계정" editPlacement="summary" edit={{ label: "프로필 수정", onAction: () => setMessage("프로필 수정을 열어요") }}
    summary={<Surface tone="default" radius="lg" padding="md"><ProfileSummary name="지민" avatar={<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text>J</Text></View>}>
      <Text variant="caption" tone="muted">회원 계정</Text></ProfileSummary></Surface>}>
    {message ? <Notice title={message} /> : null}
  </ProfileScreen></Fill>;
}

/** ModerationScreen `variant="review"`: reason first, then product-labelled decisions; hiding asks for confirmation. */
export function ModerationReviewPreview() {
  const [reason, setReason] = useState("");
  const [resolved, setResolved] = useState<string | null>(null);
  return <Fill><ModerationScreen variant="review" title="신고 검토" exit={{ kind: "back", label: "신고 목록", onPress: () => setResolved(null) }}
    decisionReason={{ label: "처리 사유", description: "작성자와 신고자에게 남는 기록이에요", value: reason, onValueChange: setReason, maxLength: 500 }}
    decisions={[
      { id: "dismiss", label: "기각", onAction: () => setResolved("기각했어요") },
      { id: "hide", label: "숨기기", tone: "danger", onAction: () => {},
        confirmation: { mode: "confirm", tone: "danger", title: "이 댓글을 숨길까요?", description: "작성자 외에는 보이지 않아요", confirmLabel: "숨기기", cancelLabel: "취소",
          fallbackErrorMessage: "다시 시도해 주세요", onConfirm: () => setResolved("숨겼어요") } },
    ]}
    {...(resolved ? { resolution: <Notice tone="success" title={resolved} description={reason} /> } : {})}>
    <Stack gap="sm"><Text variant="caption" tone="muted">신고 사유: 스팸</Text><Text>지금 가입하면 무료 쿠폰을 드려요!</Text></Stack>
  </ModerationScreen></Fill>;
}

/** ModerationForm: the same report fields inside a letter, without screen chrome. */
export function ModerationFormPreview() {
  const [open, setOpen] = useState(true);
  const [reason, setReason] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  return <Inset><Stack gap="md">
    <Text>오늘은 바닷가를 걸었어요. 파도 소리가 좋았어요.</Text>
    {sent ? <Notice tone="success" title="신고했어요" /> : open ? <Surface tone="subtle" radius="lg" padding="lg">
      <ModerationForm title="신고" reasonLabel="신고 사유" reason={reason} onReasonChange={setReason}
        reasons={[{ value: "harassment", label: "괴롭힘" }, { value: "personal_info", label: "개인정보 노출" }, { value: "spam", label: "스팸" }]}
        submit={{ label: "신고하기", onAction: () => setSent(true) }} cancel={{ label: "취소", onAction: () => setOpen(false) }} />
    </Surface> : <Button tone="ghost" onPress={() => setOpen(true)}>신고</Button>}
  </Stack></Inset>;
}
