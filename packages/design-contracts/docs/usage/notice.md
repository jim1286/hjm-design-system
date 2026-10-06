# Notice 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: recipe `noticeRecipe`(`src/component-recipes.ts`), BottomInfo와의 경계는 [BottomInfo](../bottom-info.md), Toast와의 경계는 [Toast](../toast.md)

## 언제 쓰나

화면 흐름 안 **제자리에 남아 있는** 상태 알림에 쓴다. 저장 실패, 오프라인, 권한 제한,
결제 수단 만료처럼 사용자가 읽고 필요하면 행동(`action`)할 때까지 사라지면 안 되는 내용이 여기에 속한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 무시해도 안전하고 잠시 뒤 사라지는 짧은 결과 알림(“저장했어요”) | [Toast](toast.md) |
| 반드시 응답해야 진행되는 확인 | [AlertDialog](alert-dialog.md) |
| 주 행동 아래 늘 있는 조건 안내(약관 동의 등) | [BottomInfo](bottom-info.md) |
| 화면 전체가 빈 상태·오류 상태 | [EmptyState](empty-state.md), [Result](result.md) |
| 입력 하나의 오류 | [Field](field.md)의 `error` |

선택 기준: 사라져도 되는가(Toast) / 남아야 하는가(Notice) / 응답이 필수인가(AlertDialog).

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Notice` | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { Notice } from "@hjmds/react/feedback";

<Notice
  tone="warning"
  title={t("sync.offline.title")}
  description={t("sync.offline.body")}
  action={<Button tone="secondary" size="small" onClick={retry}>{t("common.retry")}</Button>}
/>
```

```tsx
// Native
import { Button } from "@hjmds/react-native/actions";
import { Notice } from "@hjmds/react-native/feedback";

<Notice
  tone="warning"
  announcement="polite"
  title={t("sync.offline.title")}
  description={t("sync.offline.body")}
  action={<Button tone="secondary" size="small" onPress={retry}>{t("common.retry")}</Button>}
/>
```

## 축과 기본값

- `tone`: `info`(기본) · `success` · `warning` · `attention` · `danger`. 도메인 상태는 제품 어댑터에서 tone으로 매핑한다.
- `icon`은 장식이다(Web은 `aria-hidden`). Native는 `renderIcon({ tone, color, size })`로 tone 색과 recipe 크기를 받아 그릴 수 있다.

## 꼭 지킬 것

- 제목·설명·행동 문구는 i18n 키로 넣는다. 아이콘은 제품 소유 자산이고 색은 tone이 정한다.
- 색·padding·radius를 `style`/`className`으로 덮지 않는다. 두 renderer 모두 이 통로를 배치용으로만 쓴다.
- 같은 화면에 같은 내용의 Notice와 Toast를 동시에 띄우지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 발표 | 항상 live region. `danger`는 `role="alert"`+assertive, 나머지는 `role="status"`+polite | `announcement`: `none`(기본) · `polite` · `assertive`. 지정해야 발표한다 |
| title/description 타입 | `ReactNode` | `string` |
| 아이콘 렌더 함수 | 없음 | `renderIcon` |

## 함정

- Native는 기본이 `announcement="none"`이라, 새로 생긴 오류 Notice를 화면에 넣기만 하면 스크린 리더가 알리지 않는다. 새로 나타나는 상태에는 `polite`/`assertive`를 준다.
- Web은 반대로 항상 발표되므로, 화면 진입 때부터 늘 있는 안내를 Notice로 두면 매번 읽힌다. 그런 조건 안내는 BottomInfo다.
