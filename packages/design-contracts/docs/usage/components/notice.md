# Notice

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/component-recipes.ts`(`noticeRecipe`), BottomInfo와의 경계 [BottomInfo](../../bottom-info.md), Toast와의 경계 [Toast](../../toast.md)
- 스토리북: `배포/컴포넌트/상태와 알림/안내 메시지`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Notice` | 기본 | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `title` | Web `ReactNode` · Native `string` | 필수 | 현지화 |
| `description` | Web `ReactNode` · Native `string` | — | 현지화 |
| `tone` | `info` · `success` · `warning` · `attention` · `danger` | `info` | 도메인 상태는 제품 어댑터에서 tone으로 매핑한다 |
| `action` | 노드 | — | 보조 행동 하나(`Button` `tone="secondary"` `size="small"`) |
| `icon` | 노드 | — | 장식이다(Web은 `aria-hidden`) |
| `renderIcon`(Native) | `(props: { tone, color: string, size: number }) => ReactNode` | — | tone 색과 recipe 크기를 받아 그린다 |
| `announcement`(Native) | `none` · `polite` · `assertive` | `none` | 새로 나타나는 상태만 발표한다(아래 플랫폼 차이) |
| `layoutStyle` | 배치 전용 style 객체 | — | 바깥 여백·폭만 |

### 디자인 프로필 상속

2026-10-07 테마 소비 경로 점검에서 고정 foundation/recipe 값이 남은 곳을 보완했다.
모서리의 recipe 역할은 유지하고 값은 가장 가까운 Provider의 `designProfile.tokens.radius`를
읽는다. Dialog/AlertDialog/Sheet/일반 Toast의 그림자는 `tokens.shadow.floating`을 읽으며
프로필 없는 소비자의 기본값은 유지한다. 상태·초안·선택·Modal teardown은 이 축의 소유가 아니다.
플랫폼 근사와 미검증 범위는 [프로필 계약](../../design-profile.md#오버레이선택-입력의-프로필-연결-보완)을 따른다.


## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 본문 폭을 꽉 채운다. 아이콘 20(`glyph.sm`), 테두리 1(`stroke.default`), radius `radius.md` 12 | `noticeRecipe` |
| 간격 | 안쪽 `spacing.md` 16, 아이콘·문구·행동 사이 `spacing.sm` 12, 제목·설명 사이 `spacing.xxs` 4. 이웃 블록과는 `layout.contentGap` 16 | `noticeRecipe`, `.hjm-notice*` |
| 순서·정렬 | 아이콘 — 제목·설명 — 행동. 행동은 하나, `Button` `size="small"` `tone="secondary"`(또는 `ghost`), `primary` 금지. Web은 행동이 같은 줄 끝, Native는 행동이 문구 줄 **아래** | `.hjm-notice__action`, `react-native/src/feedback.tsx` |
| 고정·스크롤 | 본문 흐름 안. 먼저 읽어야 하는 경고·입력 오류는 영향을 받는 내용 바로 위(화면 상태는 제목 아래, 폼 검증은 제출 버튼 위). 제출 후 성공·실패 결과는 구성 지침이 지정한 행동 인접 위치에 둔다. 떠 있거나 고정되지 않고 함께 스크롤되며 여러 개 쌓지 않는다 | — |
| 좁은 폭·큰 글자 | Web은 문구 칸이 60% 아래로 줄면 행동이 다음 줄로 감긴다. 제목·설명은 줄바꿈된다 | `.hjm-notice__content`(`flex: 1 1 60%`) |

## 꼭 지킬 것

- 제목·설명·행동 문구는 i18n 키로 넣는다. 아이콘은 제품 소유 자산이고 색은 tone이 정한다.
- 배치는 `layoutStyle`로만 한다. 색·padding·radius를 `style`/`className`으로 덮지 않는다. Native `style`은 deprecated(개발 모드 경고, 다음 major 제거)다.
- 같은 화면에 같은 내용의 Notice와 Toast를 동시에 띄우지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 발표 | 항상 live region. `danger`는 `role="alert"`+assertive, 나머지는 `role="status"`+polite | `announcement`: `none`(기본) · `polite` · `assertive`. 지정해야 발표한다 |
| title/description 타입 | `ReactNode` | `string` |
| 아이콘 렌더 함수 | 없음 | `renderIcon` |
| 배치 | `className`, `layoutStyle`(HTML `style`도 받음) | `layoutStyle`(`style`은 deprecated) |

## 함정

- Native는 기본이 `announcement="none"`이라, 새로 생긴 오류 Notice를 화면에 넣기만 하면 스크린 리더가 알리지 않는다. 새로 나타나는 상태에는 `polite`/`assertive`를 준다.
- Web은 반대로 항상 발표되므로, 화면 진입 때부터 늘 있는 안내를 Notice로 두면 매번 읽힌다. 그런 조건 안내는 BottomInfo다.

- 2026-10-06 독립 재구현에서 입력 전 경고 위치와 시간 선택의 확정 후 결과 위치가 충돌했다. 시간 선택의 결과는 행동 아래, 입력 시트의 저장 실패는 본문 입력 위로 각 구성에 명시한다. Notice 자체가 결과 위치를 강제하지 않는다.
