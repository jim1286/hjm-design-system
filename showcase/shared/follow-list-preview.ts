// Shared fixtures keep Web and Native on the same reference composition.
export const followListPeople = [
  { id: "minji", username: "minji.archive", name: "김민지", following: true },
  { id: "jun", username: "jun.onfilm", name: "이준 · 사진과 일상", following: false },
  { id: "sohee", username: "sohee.studio", name: "박소희", following: true },
  { id: "hyun", username: "hyun.running", name: "정현우", following: false },
  { id: "yuna", username: "yuna.days", name: "최유나", following: true },
  { id: "seoul", username: "slow.seoul", name: "느리게 걷는 서울", following: false },
  { id: "doyeon", username: "doyeon.zip", name: "김도연", following: true },
];
export const followListLabels = {
  followers: "1,284 팔로워", following: "328 팔로잉", tabs: "팔로우 목록",
  search: "검색", clearSearch: "검색 지우기", searching: "검색 중", empty: "사용자를 찾을 수 없어요",
  follow: "팔로우하기", followed: "팔로잉", pending: "변경 중", failed: "변경하지 못했어요. 다시 시도해 주세요.",
};
