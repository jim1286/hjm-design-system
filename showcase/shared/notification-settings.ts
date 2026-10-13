import type { createActionSession } from "../../packages/design-contracts/src/action-session.js";

export type NotificationSettingsDraft = Readonly<{ activity: boolean; digest: boolean }>;
export const initialNotificationSettings: NotificationSettingsDraft = { activity: true, digest: false };
export const sameNotificationSettings = (a: NotificationSettingsDraft, b: NotificationSettingsDraft) => a.activity === b.activity && a.digest === b.digest;
export const notificationSettingsSummary = (value: NotificationSettingsDraft) => `내 활동 ${value.activity ? "켜짐" : "꺼짐"} · 주간 모아보기 ${value.digest ? "켜짐" : "꺼짐"}`;

// Shared fixtures inject the public runtime from each Showcase; no product persistence lives here.
export function createNotificationSettingsExample(createSession: typeof createActionSession) {
  const session = createSession(initialNotificationSettings);
  return {
    session,
    save(draft: NotificationSettingsDraft, fail: boolean) {
      const current = session.getSnapshot();
      if (current.status === "pending" || sameNotificationSettings(draft, current.value)) return;
      // A later switch change must not be mistaken for the settings this request saved.
      const submitted = { ...draft };
      return session.run(async () => {
        // Demo-only latency makes the pending/editing boundary visible without a server.
        await new Promise(resolve => setTimeout(resolve, 350));
        if (fail) throw new Error("notification-settings-demo-failure");
        return submitted;
      });
    },
  };
}
