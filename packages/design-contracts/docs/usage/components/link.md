# Link

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Link](../../link.md), recipe `linkRecipe`(`src/component-recipes.ts`), 목적지 검증 `src/link.ts`
- 스토리북: `배포/컴포넌트/동작/링크`

## 언제 쓰나

사용자가 복사하거나 새 탭으로 열 수 있는 **목적지**로 이동할 때 쓴다. 앱 안 경로(`/profile`, `?tab=stats`,
`#details`)와 외부 URL(`https`, `http`, `mailto`, `tel`)이 여기에 속한다. 문장 안 링크와 혼자 서는 링크 둘 다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 같은 화면 안의 행동(저장, 재시도, 뒤로, 인증 확인) | [Button](button.md) (`tone="link"` 포함) |
| 아이콘만 있는 행동 | [IconButton](icon-button.md) |
| 경로 계층 표시 | [Breadcrumb](breadcrumb.md) |
| 같은 페이지 안 구획 목차 | [Anchor](anchor.md) |
| 목록 한 줄 전체가 목적지 | [ListRow](list-row.md) (Web `href`) |
| 갈 수 없는 목적지 | [Text](text.md) (비활성 링크를 만들지 않는다) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Link` | 기본 | `@hjmds/react`, `/actions` | `@hjmds/react-native`, `/actions`, `/bottom-cta` |

## 최소 사용 예

```tsx
// Web — Next.js Link는 renderAnchor로 연결
import NextLink from "next/link";
import { Link } from "@hjmds/react/actions";

<Link href="/settings/privacy" variant="standalone"
  renderAnchor={({ href, ...rest }) => <NextLink href={href ?? "/"} {...rest} />}>
  {t("settings.privacy")}
</Link>
```

```tsx
// Native — 목적지는 descriptor, 실제 이동은 제품 router, 아이콘 glyph는 renderIcon
import { Linking } from "react-native";
import { Link } from "@hjmds/react-native/actions";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { ChevronRight } from "lucide-react-native";

const renderGlyph = createLucideGlyph({ chevronEnd: ChevronRight }); // 제품이 고른 glyph

<Link
  descriptor={{
    label: t("profile.view"),
    destination: { kind: "internal", href: `/u/${id}` },
    trailingIcon: { name: "chevronEnd" },
  }}
  renderIcon={renderGlyph}
  onNavigate={(destination) =>
    destination.kind === "internal" ? router.push(destination.href) : Linking.openURL(destination.href)}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone`(Web) | `brand` · `neutral` | `brand` | — |
| `variant`(Web) | `inline` · `standalone` | `inline` | `inline`은 밑줄 항상, `standalone`은 밑줄 hover, 최소 44 target |
| `target`·`rel`(Web) | — | — | `target="_blank"`이고 `rel`이 없으면 `noreferrer noopener`를 붙인다 |
| `descriptor.label`·`accessibilityLabel`(Native) | 문자열 | — | 앞뒤 공백 없이 비어 있지 않아야 하고, `accessibilityLabel`은 보이는 label을 포함해야 한다 |
| `descriptor`(Native) | `{ label, accessibilityLabel?, destination, leadingIcon?, trailingIcon? }` | — | 허용된 key만 받는다. 모르는 key·명령 필드(`onPress` 등)는 `TypeError` |
| `descriptor.destination`(Native) | `{ kind: "internal" \| "external", href }` | — | internal `href`는 `/`·`?`·`#`로 시작, external은 허용 protocol(`https`·`http`·`mailto`·`tel`)의 절대 URL만(자격증명 포함 금지) |
| `descriptor.leadingIcon`·`trailingIcon`(Native) | `{ name: SemanticIconName }` | — | 크기·tone·굵기·방향은 넘길 수 없다(`linkRecipe`가 정함). 그리려면 `renderIcon`이 필요하다 |
| `onNavigate`(Native) | `(destination: LinkDestination) => void \| Promise<void>` | — | 필수. 검증된 `{ kind, href }` 새 객체를 받는다. router·`Linking` 호출은 제품이 한다 |
| `renderIcon`(Native) | `(props: { name, size, color, strokeWidth }) => ReactNode` | — | semantic name → glyph 경계. 보통 `createLucideGlyph`. 크기·색은 HJM이 넘긴 값을 그대로 쓴다 |
| `renderAnchor`(Web) | `(props: LinkRenderProps) => ReactElement` | — | 받은 props(`href`·`ref`·`className`·`data-*`·`aria-disabled`·`onClick`·`children`·병합된 `style`)를 framework Link에 그대로 넘긴다 |
| `layoutStyle` | 배치 key만 | — | 양쪽 있음. Web은 `renderAnchor`에도 병합된 `style`로 전달된다 |
| `style`(Native) | — | — | **deprecated**(1.13, 개발 모드 1회 경고, 다음 major 제거) — `layoutStyle`을 쓴다 |

- Native는 tone·variant가 없다. 항상 brand 색 · 밑줄 · `bodyLarge` 글자 · 최소 터치 target이다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `inline`은 문장 안에 들어가 줄높이를 따르고 최소 크기가 없다. 문장 밖에 혼자 놓는 링크는 `standalone`(Web)으로 둬 최소 44×44(`control.minTouchTarget`)를 확보한다. Native Link는 항상 최소 44×44다 | `design-contracts/src/component-recipes.ts`(`linkRecipe`), `react-native/src/internal/styles.ts` |
| 간격 | 앞뒤 그림과 문구 간격: Web `spacing.xxs` 4(`linkRecipe.gap`), Native `spacing.xs` 8. 여러 혼자 서는 링크를 나열할 때 간격은 바깥 Stack이 준다(링크 자체에 margin을 주지 않는다) | `react/src/styles.css`(`.hjm-link`), `react-native/src/actions.tsx`(Link) |
| 순서·정렬 | Native Link는 `alignSelf: "flex-start"`라 부모 폭을 채우지 않고 시작 쪽에 붙는다 | `react-native/src/actions.tsx`(Link) |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 긴 문구는 줄바꿈된다(Web `overflow-wrap: anywhere`, `max-inline-size: 100%`). 자르지 않는다 | `react/src/styles.css`(`.hjm-link`) |

## 꼭 지킬 것

- 라벨은 i18n 키로 넣는다. 접근성 이름을 따로 줄 때도 보이는 문구를 포함한다.
- navigation을 `onClick`/`onPress` callback으로 대신하지 않는다. Web은 실제 `href`를, Native는 `destination`을 둔다.
- 앞뒤 아이콘은 장식이다. 이름은 링크 문구가 소유한다.
- 색·밑줄·글자 크기를 덮지 않는다. 배치는 바깥 래퍼에서 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| API | `<a>` 속성 + `tone`·`variant` | `descriptor` + `onNavigate` |
| router 연결 | `renderAnchor`(받은 props를 그대로 anchor에 전달) | `onNavigate(destination)` |
| 앞뒤 그림 | `leading`·`trailing` ReactNode | descriptor `leadingIcon`·`trailingIcon` + `renderIcon`(우선), 또는 `leading`·`trailing` ReactNode |
| `disabled` | 있음(`aria-disabled`, tabIndex -1) | — |
| `accessibilityHint` | — | 있음 |

## 함정

- Web `disabled` prop이 남아 있지만 [계약](../../link.md#목적지)은 비활성 링크 대신 plain Text를 요구한다. 쓰지 않는다.
- Native에서 descriptor 아이콘을 주고 `renderIcon`을 빼면 개발 모드에서 한 번 경고하고 아이콘을 그리지 않는다(throw하지 않음).
  descriptor 아이콘과 `leading`/`trailing` node를 함께 주면 descriptor가 그 자리를 갖고 경고가 난다. 1.12까지는 Native가
  descriptor 아이콘을 그리지 않았다.
- Native `style`은 deprecated다. 아직 recipe 뒤에 합쳐져 시각 값이 통과하므로 배치는 `layoutStyle`로만 준다.
- 현재 Native 스토리(`showcase/native/src/component-examples.tsx` LinkExample)는 descriptor 아이콘·`renderIcon` 예가 없고
  문구가 i18n 키가 아니다. 아이콘 경로는 위 최소 사용 예로 확인한다.
