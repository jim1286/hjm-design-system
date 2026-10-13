import { useState, useSyncExternalStore } from "react";
import { createActionSession, resolveSaveFeedback } from "@hjmds/design-contracts/action-session";
import { createNotificationSettingsExample, initialNotificationSettings, sameNotificationSettings, notificationSettingsSummary } from "../../shared/notification-settings";
import type { Meta, StoryObj } from "@storybook/react-native";
import { ScrollView, View } from "react-native";
import { TopBar } from "@hjmds/react-native/top-bar";
import { BottomCTA } from "@hjmds/react-native/bottom-cta";
import { Container, Stack, Section, Text } from "@hjmds/react-native/primitives";
import { Switch } from "@hjmds/react-native/inputs";
import { Notice } from "@hjmds/react-native/feedback";

function NotificationSettings() {
  const [draft, setDraft] = useState(initialNotificationSettings);
  const [example] = useState(() => createNotificationSettingsExample(createActionSession));
  const state = useSyncExternalStore(example.session.subscribe, example.session.getSnapshot, example.session.getSnapshot);
  const [failNext, setFailNext] = useState(false);
  const dirty = !sameNotificationSettings(draft, state.value);
  const feedback = resolveSaveFeedback({ phase: state.status, dirty, valid: true, hasSaved: true });
  const { pending } = feedback;
  const saved = feedback.feedback === "saved";
  const save = () => {
    // The session owns the synchronous lock, including repeated host callbacks before React commits.
    if (!feedback.canSubmit) return;
    void example.save(draft, failNext);
    setFailNext(false);
  };
  return <View style={{ flex: 1 }}>
    <TopBar title="알림 설정" />
    <ScrollView><Container size="reading" gutter="compact">
      <Section title="필요한 소식만 받아요" description="원하는 알림을 골라주세요. 언제든 바꿀 수 있어요.">
        <Stack gap="md">
          <Switch presentation="row" label="내 활동 알림" description="댓글과 답글이 도착하면 알려드려요."
            checked={draft.activity} onCheckedChange={(activity) => setDraft(current => ({ ...current, activity }))} />
          <Switch presentation="row" label="주간 모아보기" description="일주일의 소식을 한 번에 받아요."
            checked={draft.digest} onCheckedChange={(digest) => setDraft(current => ({ ...current, digest }))} />
        </Stack>
        <Text>{`저장된 설정: ${notificationSettingsSummary(state.value)}`}</Text>
        {feedback.feedback === "error" ? <Notice announcement="assertive" tone="danger" title="저장하지 못했어요" description="선택한 설정은 그대로예요. 아래 버튼으로 다시 저장해 주세요." /> : null}
        {(saved || feedback.feedback === "saved-with-changes") ? <Notice announcement="polite" tone={saved ? "success" : "info"} title={saved ? "알림 설정을 저장했어요" : "이전 선택을 저장했어요"} description={saved ? notificationSettingsSummary(state.value) : "새로 바꾼 설정은 아직 저장하지 않았어요."} /> : null}
      </Section>
      <Section title="예제 실행" description="이 화면에서만 유지되는 메모리 예제예요. 실제 알림 권한·푸시·계정 설정은 바뀌지 않아요.">
        <Switch presentation="row" label="다음 저장 실패시키기" checked={failNext} disabled={pending} onCheckedChange={setFailNext} />
      </Section>
    </Container></ScrollView>
    <BottomCTA description={pending ? "저장 중에도 선택을 바꿀 수 있어요. 새 선택은 다음 저장에 반영돼요." : dirty ? "아직 저장하지 않은 변경이 있어요." : "현재 저장된 설정이에요."}
      primaryAction={{ label: pending ? "저장 중" : saved ? "저장했어요" : !dirty ? "변경 사항이 없어요" : feedback.feedback === "error" ? "다시 저장하기" : "이 설정으로 저장하기", onPress: save, loading: pending, disabled: !feedback.canSubmit }} />
  </View>;
}

const meta = { title: "배포/화면/설정/알림 설정", component: NotificationSettings } satisfies Meta<typeof NotificationSettings>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};

export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
