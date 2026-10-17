import { useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { createActionSession, resolveSaveFeedback } from "@hjmds/design-contracts/action-session";
import { createNotificationSettingsExample, initialNotificationSettings, sameNotificationSettings, notificationSettingsSummary, notificationSettingsCopy as copy } from "../../shared/notification-settings";
import type { Meta, StoryObj } from "@storybook/react-native";

import { ScreenLayout, CompositionLayout } from "@hjmds/react-native/screens";
import { Button } from "@hjmds/react-native/actions";
import { Stack } from "@hjmds/react-native/primitives";
import { List } from "@hjmds/react-native/data-display";
import { Switch } from "@hjmds/react-native/inputs";
import { Notice } from "@hjmds/react-native/feedback";
import { PreviewToolButton, PreviewTools } from "./preview-tools";

function NotificationSettings({ tools = false }: { tools?: boolean }) {
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
  const screen = <ScreenLayout title={copy.title} footer={
    <CompositionLayout description={pending ? copy.footer.pending : dirty ? copy.footer.dirty : copy.footer.clean}
      footer={<Button onPress={save} loading={pending} disabled={!feedback.canSubmit}>{pending ? copy.action.pending : saved ? copy.action.saved : !dirty ? copy.action.clean : feedback.feedback === "error" ? copy.action.retry : copy.action.submit}</Button>} />
  }><Stack gap="xl">
      <CompositionLayout title={copy.sectionTitle} description={copy.sectionDescription}>
        {/* Switch rows carry their own padding and touch height; a gap between them doubled the spacing (2026-10-17). */}
        <List label={copy.sectionTitle} separator="none">
          <Switch presentation="row" label={copy.activity.label} description={copy.activity.description}
            checked={draft.activity} onCheckedChange={(activity) => setDraft(current => ({ ...current, activity }))} />
          <Switch presentation="row" label={copy.digest.label} description={copy.digest.description}
            checked={draft.digest} onCheckedChange={(digest) => setDraft(current => ({ ...current, digest }))} />
        </List>
        {feedback.feedback === "error" ? <Notice announcement="assertive" tone="danger" title={copy.error.title} description={copy.error.description} /> : null}
        {(saved || feedback.feedback === "saved-with-changes") ? <Notice announcement="polite" tone={saved ? "success" : "info"} title={saved ? copy.savedTitle : copy.savedWithChanges.title} description={saved ? notificationSettingsSummary(state.value) : copy.savedWithChanges.description} /> : null}
      </CompositionLayout>
  </Stack></ScreenLayout>;
  // The demo failure tool sits above the route host, outside the product screen; the host takes the remaining height.
  return tools ? <View style={{ flex: 1 }}><PreviewTools><PreviewToolButton selected={failNext} disabled={pending} onPress={() => setFailNext(current => !current)}>{copy.failNext}</PreviewToolButton></PreviewTools><View style={{ flex: 1 }}>{screen}</View></View> : screen;

}

const meta = { title: "배포/화면/설정/알림 설정", component: NotificationSettings } satisfies Meta<typeof NotificationSettings>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};

export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
export const Recovery: Story = { name: "실패와 복구", args: { tools: true } };
