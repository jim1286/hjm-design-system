# Theme studio

검토일: 2026-10-01.

`@hjmds/design-contracts/theme-studio`는 기존 provider의 brandPalette와 색 대비 계산을 재사용하는 작업 도구다. 새로운 테마 엔진이나 자동 색상 생성기는 아니다.

- `applyStudioColor`는 light/dark별 primary, onPrimary, contentBrand 역할에 여섯 자리 HEX를 적용하며 기존 입력 객체를 변경하지 않는다.
- `studioReport`는 HJM 기본 팔레트에 override를 합친 뒤 기존 paletteContrastRules의 각 색상 쌍에 정확한 ratio·minimum·pass를 반환한다. 표시할 때만 소수점을 줄이고 통과 판정은 원래 값으로 한다.
- `exportStudioPalette`는 실제 설정을 `{brandPalette: ...}` JSON으로 직렬화한다. 소비 제품 기본값이나 중앙 토큰을 수정하지 않는다.

Web/Native Storybook `디자인 기초/테마 편집`에서 Default/Dark/LargeText 예제를 제공한다. 양쪽 테마를 동시에 비교하고 버튼·입력·disabled·오류, Lucide 의미 아이콘, 안내·성공·주의 알림을 확인할 수 있다. 기록 데이터는 Web DataTable, Native List로 비교한다. Native에 없는 DataTable을 새로 흉내 내지 않고 기존 읽기 순서와 의미를 유지한다. Web은 JSON 파일 다운로드, Native는 OS 공유와 선택 가능한 코드 표시를 제공한다. 공개 API에는 번역 문구를 넣지 않으며 라벨과 오류 안내는 showcase가 소유한다.

색상 쌍 통과는 전체 접근성 인증이 아니다. 웹 버튼의 hover/focus는 실제 상호작용으로 확인하며, 실제 제품 배경과 보조기기 사용성은 별도 확인해야 한다. 서체 비교·라이선스 입력은 별도 후속 구현이다.
