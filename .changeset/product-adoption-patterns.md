---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

제품 감사에서 드러난 설정·로그인·입력 Sheet의 반복 구현을 공용 API로 보완합니다.

- Switch의 row presentation과 Web description 연결을 추가합니다. 전체 행은 한 개의 접근 가능한
  switch이며, 큰 글자에서는 설명과 track이 세로로 재배치됩니다. 기존 플랫폼별 기본 배치는 유지합니다.
- Native Sheet에 선택적 keyboardAvoidance/scrollable을 추가하고, Web/Native 제목·닫기 버튼을
  중앙 정렬합니다. top safe area는 가용 viewport를 제한하며 키보드/Android resize 여백을 중복 적용하지 않습니다.
- Native AuthScreenLayout에 layoutStyle/testID와 입력 폼 스크롤 처리를 추가합니다.
- Web AuthScreenLayout은 기존 main landmark 안에서 as="section"으로 사용할 수 있습니다.
- 지나간 1.0 legacy style 제거 기한을 정정합니다. 1.x 호환 API는 유지하고 소비 이관 검증 후 다음 major에서 제거합니다.

기존 Sheet 어댑터의 제목 cast·키보드 listener·maxHeight 보정은 새 옵션을 채택한 뒤 제거합니다.
세부 이관과 검증 범위는 docs/product-adoption-1.4.md와 docs/sheet.md를 따릅니다.
