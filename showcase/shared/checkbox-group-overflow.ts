// Presentation fixtures only. Products own the options, their copy and what the selection filters.
export const chipRailExample = {
  label: "응원 팀",
  items: ["LG", "두산", "KT", "NC", "SSG", "롯데", "KIA", "삼성", "키움", "한화"].map((team) => ({ id: team, label: team })),
  initial: ["LG", "KIA"],
} as const;
