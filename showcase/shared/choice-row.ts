// Presentation fixtures only. Each product owns its locale list, persistence and copy.
export const choiceRowExample = {
  title: "언어",
  sheetDescription: "앱에 표시할 언어를 골라요.",
  closeLabel: "닫기",
  errorLabel: "저장하지 못했어요. 다시 골라 주세요.",
  items: [
    { value: "system", label: "기기 설정 따르기", description: "현재 기기: 한국어" },
    { value: "ko", label: "한국어" },
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
  ],
  initial: "system",
} as const;
export type ChoiceRowExampleValue = (typeof choiceRowExample.items)[number]["value"];
