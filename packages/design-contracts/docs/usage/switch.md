# Switch 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `switchRecipe`(`src/component-recipes.ts`), 설정 행 규칙: [제품 채택 1.4 §설정 한 행](../product-adoption-1.4.md)

## 언제 쓰나

켜고 끄는 즉시 반영되는 설정 하나에 쓴다. 알림 받기, 다크 모드, 자동 재생 같은 설정 화면의 행이
대표적이다. 설정 화면에서는 `presentation="row"`로 **Switch 하나가 행 전체**가 된다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 폼 제출 때 함께 보내는 동의·선택 | [Checkbox](checkbox.md) |
| 여러 항목을 함께 고름 | [CheckboxGroup](checkbox-group.md) |
| 둘 이상 중 하나를 고름 | [SegmentedControl](segmented-control.md), [RadioGroup](radio-group.md) |
| 버튼 모양의 켜짐/꺼짐 | [Button](button.md)의 `selected`, [ToggleGroup](toggle-group.md) |
| 약관 동의 묶음 | [Agreement](agreement.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Switch` | `@hjmds/react`, `/selection` | `@hjmds/react-native`, `/inputs` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Switch } from "@hjmds/react/selection";

<Switch
  presentation="row"
  label={t("settings.push.title")}
  description={t("settings.push.description")}
  checked={pushEnabled}
  onCheckedChange={setPushEnabled}
/>
```

```tsx
// Native
import { Switch } from "@hjmds/react-native/inputs";

<Switch
  presentation="row"
  label={t("settings.push.title")}
  description={t("settings.push.description")}
  checked={pushEnabled}
  onCheckedChange={setPushEnabled}
/>
```

## 축과 기본값

- `presentation`: `inline` · `row`. 기본값이 플랫폼마다 다르다(Web `inline`, Native `row`). 같은 설정 화면을
  두 표면에서 맞추려면 **항상 명시**한다.
- `size`: `small`(44×26) · `medium`(기본, 52×32).
- 상태: `checked`/`defaultChecked`(기본 `false`)/`onCheckedChange`. 생략하면 비제어로 동작한다.
- `labelVisibility`: `visible`(기본) · `hidden`. `hidden`은 글자만 화면에서 숨기고 접근성 이름은 남긴다.
- `description`: 설명을 이름과 따로 연결한다(Web `aria-describedby`, Native `accessibilityHint` 기본값).
- 큰 글자(공통 large-text 기준)에서 `row`는 설명 아래로 track을 내린다.

## 꼭 지킬 것

- `label`·`description`은 i18n 키로 넣는다. 설정 항목과 문구는 제품 소유, 행 구조·색·접근성은 HJM 소유다.
- `row`인 Switch를 다른 Pressable·button·ListRow `onPress`로 감싸지 않는다. 행 전체가 이미 하나의 switch다.
- 기존 [ListRow](list-row.md)의 trailing control로만 둘 때는 `labelVisibility="hidden"`과 같은 `label`을 주고,
  ListRow에는 `onPress`를 두지 않는다.
- 배치는 `layoutStyle`로 한다. track·thumb 색은 recipe가 정하며 덮지 않는다.
- 저장 요청 중에는 `disabled`로 막는다. 비활성 상태도 켜짐/꺼짐이 구분되게 색이 바뀐다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 요소 | `<button role="switch">` | `Pressable`(role `switch`) 안의 RN `Switch` |
| `label`·`description` 타입 | `ReactNode` | `string` |
| 이름 재지정 | `aria-label`/`aria-labelledby` | `accessibilityLabel`/`accessibilityHint` |
| 꺼짐 상태 hairline | 그림(track·thumb 모두 1px inset) | 그리지 않음(RN `Switch`에 테두리 hook이 없음, `*Border` 슬롯은 Web 전용) |
| iOS 크기 | 해당 없음 | `UISwitch` 고유 크기를 따른다(Android는 recipe 크기) |

## 함정

- Native는 옛 `value`/`defaultValue`/`onValueChange`를 받으면 실행 중 `TypeError`를 던진다.
  `checked`/`defaultChecked`/`onCheckedChange`를 쓴다.
- Native 꺼짐 상태에는 테두리가 없으므로, 어두운 카드 위에서 track이 배경과 섞이는지 실제 기기 다크 모드로 확인한다.
  (Web은 이 hairline이 빠져 보이지 않던 일이 있었고 현재 stylesheet가 그린다.)
- Web은 `type="button"`이 기본이라 폼 안에서도 submit을 일으키지 않는다.
