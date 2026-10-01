# 1.11 호환 API 제거와 소비 이관

검토일: 2026-10-02 · 1.11 minor 소스 변경 · npm 게시와 소비 설치는 별도 확인

사용자가 전체 소비 앱을 함께 버전업하므로 구형 호환 API도 제거하라고 요청했다.
별칭과 deprecated 스타일 통로를 유지하는 대신 기존 canonical API로 이관한다.
2026-10-02 사용자 결정에 따라 호환 API 제거를 1.11.0 minor Changeset에 포함한다.
기존 1.x 소비자는 정확한 버전을 고정한 상태에서 이 이관표를 적용한 뒤 올려야 한다.

| 제거 | 대체 |
| --- | --- |
| Native Switch `value` / `defaultValue` / `onValueChange` | `checked` / `defaultChecked` / `onCheckedChange` |
| Native Button·Tag `label` | `children` |
| Native IconButton `icon`, 접근성 이름용 `accessibilityLabel`, `link` tone | `children`, `label`, `ghost` tone |
| Native Image `source`, `LegacyImageRenderProps`, adapter `legacySource` | `src`·`width`·`height`, `ImageRenderProps`, `sourceAdapter` |
| Native ToastRegionController `show` | `publish` |
| Native RadioGroup·SegmentedControl `options`와 Option 타입 | `items`와 Item 타입 |
| Native Tabs `options`, TabOption `value` | `items`, TabItem `id` |
| Native Select `options`, `value`, `defaultValue`, `onValueChange`, SelectOption | `items`/`sections`/`source`, `selectedKey`, `defaultSelectedKey`, `onSelectionChange`, CollectionItemDescriptor |
| Native Menu item `value`·`icon`·`accessibilityHint`, `onSelect` | `id`, `renderLeading`, `description`, `onAction` |
| Web Menu·MenuMorph item `onSelect` | 컴포넌트 `onAction(id)` |
| Web/Native Tabs와 Web Select leading `glyphSize` | `size` |
| Native Stack `direction`, Grid `descriptor` | `axis`, 직접 `columns`·`gap`·`minColumnWidth` |
| Native Surface `brand` tone, 숫자 padding/radius | `accent` tone, spacing/radius 토큰 |
| Native Layout `skipLinkLabel` | 삭제: Web 전용 속성 |
| Native 입력 `supportText`, ListRow `badge` | `description`, `titleMetadata` |
| Native Button `style`·`labelStyle`, Surface/Card·Field·AuthScreenLayout·Chip·ListRow·LoadMore `style` | 배치만 `layoutStyle`, 시각 값은 semantic props/recipe |
| Native 입력 `inputStyle`·`containerStyle`, Image `containerStyle`, Section `titleStyle`·`descriptionStyle` | 배치는 `layoutStyle`, 입력 크기는 `size`, 문구는 typography recipe |
| Contracts `validateLayoutDescriptor` | `validateLayoutWebDescriptor` 또는 `validateLayoutRegions` |
| Catalog summary `fullyPreviewable`·`partiallyPreviewable`·`contractOnly` | `fullyMature`·`partiallyMature`·`plannedOnly` |

Select의 `onSelectionChange`에는 선택 해제를 뜻하는 null이 올 수 있다. 이전 비-null
handler를 이관할 때는 null 처리 방침을 제품에서 명시한다. 메뉴의 실행과 선택 상태 변경은
각각 `onAction`과 `selection.onSelectionChange`로 구분한다. 항목별 실행 콜백을 섞지 않는다.

Image의 `sourceAdapter(descriptor)`는 유지한다. 인증 header·캐시 옵션이 있는 RN source나
번들 자산은 이 경계로 넘기되 실제 크기와 canonical src를 제공한다. 이미지 크기를 임의로
추정하지 않는다. React Native 자체의 Image·Switch API는 HJM 이관 대상이 아니다.

## 스타일 경계

제거 대상은 위 표에 열거한 deprecated 공개 통로다. 플랫폼 host의 정식 `style`,
renderer에 주입하는 이미지 스타일, 제품 소유 슬롯과 private recipe 스타일까지 일괄 삭제하는
변경은 아니다. 배치에 paint 값을 넣어 타입을 우회하지 않는다. FloatingActionButton과
LoadMore의 내부 Button 조합은 비공개 RecipeButton을 써서 recipe의 크기·색·그림자를 보존한다.
해당 구현을 패키지 entry에서 export하지 않는다.

## 관리 소비 저장소

번뚝·다에리·비행중·모펀의 직접 호출과 제품 래퍼를 함께 이관한다. 스핀트·유틸버스·포트폴리오
사이트·App Release Hub도 새 공개 타입으로 검사한다. 웹과 앱이 있는 제품은 양쪽을 확인한다.
소스 검사, 새 패키지 설치/lock 갱신, 기기 검증, npm 게시·운영 배포는 별개의 단계다.
로컬 후보 선언을 연결한 검사만으로 게시된 1.11 소비 설치를 주장하지 않는다.

## Storybook

Web/Native 프로필 편집은 기본·어두운 테마·큰 글자를 유지한다. 중복 Playground 링크는
`patterns-profile-studio--default`로 바꾼다. Web showcase 색상 변수는 `--hjm-color-*`만 쓴다.
이 내부 변수 이관은 공개 renderer CSS 토큰 변경이 아니다. 모든 예제는 위 canonical API로 갱신한다.
