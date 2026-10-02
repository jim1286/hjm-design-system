/** Localized fixture copy belongs to the showcase, never to a public renderer. */
export const profileCopy = {
  eyebrow: "나를 담는 작은 공간", title: "나답게, 조금 더.", intro: "이름부터 작은 표정까지. 나를 보여줄 프로필을 만들어 보세요.",
  profile: "내 프로필", appearance: "어떤 모습이 좋으세요?", appearanceHint: "사진이 없을 때 보여줄 얼굴이에요.",
  name: "표시 이름", nameHint: "다른 사람에게 보이는 이름이에요.", preferences: "나에게 맞는 설정", notification: "활동 알림", notificationHint: "내 활동에 새로운 소식이 생기면 알려드려요.",
  save: "변경 내용 적용", reset: "되돌리기", saved: "미리보기에 적용했어요.", draft: "아래 설정을 바꾸고 미리보기에 적용해 보세요.", preview: "프로필 미리보기", member: "새로운 이야기를 만들어 가는 중", badge: "나만의 얼굴", empty: "이름을 입력해 주세요.",
} as const;
export const profileFaces = [
  { seed: "hjm-profile-clover", label: "클로버" },
  { seed: "hjm-profile-peach", label: "피치" },
  { seed: "hjm-profile-cloud", label: "구름" },
  { seed: "hjm-profile-wave", label: "파도" },
] as const;
export const initialProfile = { name: "지민", seed: profileFaces[0].seed as string, notifications: true };
