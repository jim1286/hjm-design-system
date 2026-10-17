import { useState, useSyncExternalStore } from "react";
import { createActionSession, resolveSaveFeedback } from "@hjmds/design-contracts/action-session";
import { createNotificationSettingsExample, initialNotificationSettings, sameNotificationSettings, notificationSettingsSummary, notificationSettingsCopy as copy } from "../../../shared/notification-settings.js";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenLayout, CompositionLayout } from "@hjmds/react/screens";
import { Button } from "@hjmds/react/actions";
import { Stack } from "@hjmds/react/layout";
import { Switch } from "@hjmds/react/selection";
import { Notice } from "@hjmds/react/feedback";
import { PreviewToolButton, PreviewTools } from "./preview-tools.js";

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
  // The demo failure tool sits above the route host, outside the product screen; the host takes the remaining height.
  return <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
    {tools ? <PreviewTools><PreviewToolButton selected={failNext} disabled={pending} onClick={() => setFailNext(current => !current)}>{copy.failNext}</PreviewToolButton></PreviewTools> : null}
    <div style={{ flex: 1, minHeight: 0 }}><ScreenLayout title={copy.title} footer={
    <CompositionLayout description={pending ? copy.footer.pending : dirty ? copy.footer.dirty : copy.footer.clean}
      footer={<Button onClick={save} loading={pending} disabled={!feedback.canSubmit}>{pending ? copy.action.pending : saved ? copy.action.saved : !dirty ? copy.action.clean : feedback.feedback === "error" ? copy.action.retry : copy.action.submit}</Button>} />
  }><Stack gap="xl">
      <CompositionLayout title={copy.sectionTitle} description={copy.sectionDescription}>
        <Stack gap="md">
          <Switch presentation="row" label={copy.activity.label} description={copy.activity.description}
            checked={draft.activity} onCheckedChange={(activity) => setDraft(current => ({ ...current, activity }))} />
          <Switch presentation="row" label={copy.digest.label} description={copy.digest.description}
            checked={draft.digest} onCheckedChange={(digest) => setDraft(current => ({ ...current, digest }))} />
        </Stack>
        {feedback.feedback === "error" ? <Notice tone="danger" title={copy.error.title} description={copy.error.description} /> : null}
        {(saved || feedback.feedback === "saved-with-changes") ? <Notice tone={saved ? "success" : "info"} title={saved ? copy.savedTitle : copy.savedWithChanges.title} description={saved ? notificationSettingsSummary(state.value) : copy.savedWithChanges.description} /> : null}
      </CompositionLayout>
  </Stack></ScreenLayout></div></div>;

}

const meta = { includeStories: ["Default","Dark","LargeText","Recovery"], id: "patterns-notification-settings", title: "배포/화면/설정/알림 설정", component: NotificationSettings, parameters: { layout: "fullscreen", hjm: { edgeToEdge: true } } } satisfies Meta<typeof NotificationSettings>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2", viewport: { value: "mobile1", isRotated: false } } };
export const Recovery: Story = { name: "실패와 복구", args: { tools: true } };
