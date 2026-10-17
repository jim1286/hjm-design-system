import type { createActionSession } from "../../packages/design-contracts/src/action-session.js";

export type NotificationSettingsDraft = Readonly<{ activity: boolean; digest: boolean }>;
export const initialNotificationSettings: NotificationSettingsDraft = { activity: true, digest: false };
export const sameNotificationSettings = (a: NotificationSettingsDraft, b: NotificationSettingsDraft) => a.activity === b.activity && a.digest === b.digest;
export const notificationSettingsSummary = (value: NotificationSettingsDraft) => `내 활동 ${value.activity ? "켜짐" : "꺼짐"} · 주간 모아보기 ${value.digest ? "켜짐" : "꺼짐"}`;

// Web and Native read the same visible copy. The failure tool is demo-only and appears under PreviewTools
// in the Recovery story; the saved values are announced by the success Notice, not a standing debug line.
export const notificationSettingsCopy = {
  title: "알림 설정",
  sectionTitle: "필요한 소식만 받아요",
  sectionDescription: "원하는 알림을 골라주세요. 언제든 바꿀 수 있어요.",
  activity: { label: "내 활동 알림", description: "댓글과 답글이 도착하면 알려드려요." },
  digest: { label: "주간 모아보기", description: "일주일의 소식을 한 번에 받아요." },
  footer: { pending: "저장 중에도 선택을 바꿀 수 있어요. 새 선택은 다음 저장에 반영돼요.", dirty: "아직 저장하지 않은 변경이 있어요.", clean: "현재 저장된 설정이에요." },
  action: { pending: "저장 중", saved: "저장했어요", clean: "변경 사항이 없어요", retry: "다시 저장하기", submit: "이 설정으로 저장하기" },
  error: { title: "저장하지 못했어요", description: "선택한 설정은 그대로예요. 아래 버튼으로 다시 저장해 주세요." },
  savedTitle: "알림 설정을 저장했어요",
  savedWithChanges: { title: "이전 선택을 저장했어요", description: "새로 바꾼 설정은 아직 저장하지 않았어요." },
  failNext: "다음 저장 실패시키기",
} as const;

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
