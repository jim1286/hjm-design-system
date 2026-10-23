import type { CharacterCountOptions } from "@hjmds/design-contracts/character-count";

/** Product-supplied copy for the TextArea characterCount stories; HJM formats the numbers with `locale`. */
export const characterCountExample = {
  label: "만들고 싶은 앱",
  description: "앞뒤 공백은 제외해요. 일부 이모지는 여러 글자로 계산돼요.",
  initial: "",
  options: {
    min: 5, max: 500, nearLimit: 40, measure: "trimmed", overflow: "allow", locale: "ko-KR",
    messages: {
      range: ({ min, max }) => `${min}–${max}자`,
      remaining: ({ count }) => `${count}자 더 쓸 수 있어요`,
      needed: ({ count }) => `${count}자만 더 적어주세요`,
      over: ({ count }) => `${count}자를 줄여주세요`,
    },
  } satisfies CharacterCountOptions,
};
