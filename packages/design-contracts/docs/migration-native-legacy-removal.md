# 1.11 호환 API 제거와 소비 이관

검토일: 2026-10-06 · 1.11 minor 소스 변경 · npm 게시와 소비 설치는 별도 확인

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
| Native Progress `max` 기본값 1(분수) — **1.12.0** | 기본값 100(`progressRecipe.defaults.max`, Web과 동일). 분수를 넘기던 곳은 백분율로 바꾸거나 `max={1}`을 명시한다. 2026-10-02 사용자가 1.11과 같은 방식(관리 소비 앱 전수 이관, minor)으로 릴리스를 지시했다. 확인한 소비처: BurnTok `ProductRenderers.stories.tsx`의 `value={0.64}` |

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

## 1.13 deprecated 시각 style (제거는 다음 major)

2026-10-06 사용 지침 작성 중 위 표 밖의 Native 컴포넌트가 아직 raw `StyleProp` 시각 통로를
받는 것을 확인했다. 1.11처럼 minor에서 지우거나 Button처럼 throw하면 1.x 소비 앱이 깨지므로
이번 minor는 동작을 유지한 채 `@deprecated` JSDoc과 개발 모드 1회 `console.warn`
(`internal/deprecated-style.ts`, 컴포넌트·prop마다 한 번, production 무음)만 단다. 없던 곳에는
`layoutStyle`을 추가했다. 실제 삭제는 [consumer-policy §3.1](consumer-policy.md#31-react-native-legacy-style-compatibility-boundary)의
네 조건을 채운 다음 major에서 한다.

| 컴포넌트 | deprecated prop | 대체 |
| --- | --- | --- |
| IconButton, Link, BottomCTA, Agreement, Asset, AssetGroup, AuthProviderButton, BottomInfo, Carousel, Collapsible, Container, Section, Icon, Steps, Top, UploadItem | `style` | 배치는 `layoutStyle`, 외형은 각 recipe·semantic prop |
| Heading | `style`(TextStyle) | `layoutStyle`, 크기·굵기는 `level` |
| Badge, Tag | `style`, `labelStyle` | `layoutStyle`, `tone`/`size`/`variant` |
| ListRow | `titleStyle`, `descriptionStyle` | `density`·`selected`, listRowRecipe typography |
| Avatar | `style`, `imageStyle` | `layoutStyle`, `size`/`renderFallback` |
| Divider, CounterBadge, List, Timeline | `style` | `layoutStyle`, 각 컴포넌트 축 |
| Accordion | `style`, `itemStyle`, `triggerStyle`, `titleStyle`, `indicatorStyle`, `panelStyle` | `layoutStyle`, `density`/`renderIndicator` |
| DescriptionList, StatisticGroup | `style`, `itemStyle` | `layoutStyle`, descriptor·`density` |
| Statistic | `style`, `labelStyle`, `valueStyle`, `affixStyle`, `trendStyle`, `hintStyle` | `layoutStyle`, `density`/`presentation` |
| Notice, Result, Spinner, Skeleton, Toast | `style` | `layoutStyle`, `tone`/`status`/`size`/`shape`·`width`·`height` |
| EmptyState | `style`, `illustrationStyle`, `titleStyle`, `descriptionStyle`, `actionStyle` | `layoutStyle`, `density`/`align` |
| Progress | `style`, `labelStyle`, `valueStyle`, `trackStyle`, `indicatorStyle` | `layoutStyle`, `tone`/`size`/`shape` |
| ToastRegion | `style`, `toastStyle` | `layoutStyle`, `placement`/`safeAreaInsets` |
| AlertDialog, Sheet | `contentStyle`의 배치 밖 key | 배치 key만 사용. 다음 major에서 Dialog처럼 `HjmCompositionStyleProp`으로 좁힘(배치 key만 넘기면 경고 없음) |
| Tabs | `style`, `tabListStyle` / TabPanel `style` | `layoutStyle`, `size`/`layout`/`overflow`/`appearance` |
| BottomNavigation | `style`, `surfaceStyle`, `listStyle`, `primaryActionStyle` | `layoutStyle`, `configuration` |
| TopBar | `style`, `leadingStyle`, `titleStyle`, `trailingStyle` / TopBar action `style`, `labelStyle` | `layoutStyle`, `centered`/`labelVisibility` |
| Menu | `style` | `layoutStyle`, `density` |
| Checkbox, Radio, CheckboxGroup, RadioGroup | `style`, `controlStyle`, `indicatorStyle`, `leadingStyle`, `contentStyle`, `labelStyle`, `descriptionStyle` | `layoutStyle`(행 또는 그룹), selection control recipe |
| Switch, SegmentedControl, Form, Select, Combobox, TagsInput, ToggleGroup, DatePicker, FilePicker, TransferList | `style` | `layoutStyle`, 각 컴포넌트 `size`·descriptor |
| Chip | `labelStyle` | `tone`/`size` |
| OtpField | `slotStyle`, `slotTextStyle` | `size`/`presentation`. 1.13부터 상속된 `layoutStyle`이 숨은 TextInput이 아니라 바깥 frame에 적용된다 |
| NumberField | `inputStyle`, `containerStyle` | `layoutStyle`, `size` |
| Slider | `containerStyle`, `controlStyle` | `layoutStyle` |
| Mentions | `listStyle` | 후보 목록 recipe. Mentions의 상속 `layoutStyle`은 입력 영역만 배치한다 |

제외(정식 host·renderer 스타일): KeyboardAvoiding·KeyboardDock(플랫폼 host), Image·ImageAdapter `style`(renderer 주입),
EffectSurface·ThinkingOrb·SharedTransition(optional motion host frame), Text·Stack·AspectRatio·Grid·Layout(내부 조합 전반이
쓰는 layout primitive라 경고하면 HJM 자신이 경고를 낸다. 내부 renderer 분리 후 별도 train에서 다룬다).

이관: 경고 문구의 prop을 찾아 margin·width·flex·alignSelf만 남긴 값은 `layoutStyle`로 옮기고, 색·글꼴·padding·
높이·radius는 semantic prop으로 옮긴다. 표현할 축이 없으면 `.hjm-*`·style 우회 대신 계약 공백으로 올린다.

## 관리 소비 저장소

번뚝·다에리·비행중·모펀의 직접 호출과 제품 래퍼를 함께 이관한다. 스핀트·유틸버스·포트폴리오
사이트·App Release Hub도 새 공개 타입으로 검사한다. 웹과 앱이 있는 제품은 양쪽을 확인한다.
소스 검사, 새 패키지 설치/lock 갱신, 기기 검증, npm 게시·운영 배포는 별개의 단계다.
로컬 후보 선언을 연결한 검사만으로 게시된 1.11 소비 설치를 주장하지 않는다.

## Storybook

Web/Native 프로필 편집은 기본·어두운 테마·큰 글자를 유지한다. 중복 Playground 링크는
`patterns-profile-studio--default`로 바꾼다. Web showcase 색상 변수는 `--hjm-color-*`만 쓴다.
이 내부 변수 이관은 공개 renderer CSS 토큰 변경이 아니다. 모든 예제는 위 canonical API로 갱신한다.
