# Link 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Link](../link.md), recipe `linkRecipe`(`src/component-recipes.ts`), 목적지 검증 `src/link.ts`

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Link` | `@hjmds/react`, `/actions` | `@hjmds/react-native`, `/actions`, `/bottom-cta` | 기본 |

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
// Native — 목적지는 descriptor, 실제 이동은 제품 router
import { Link } from "@hjmds/react-native/actions";

<Link
  descriptor={{ label: t("profile.view"), destination: { kind: "internal", href: `/u/${id}` } }}
  onNavigate={(destination) =>
    destination.kind === "internal" ? router.push(destination.href) : Linking.openURL(destination.href)}
/>
```

## 축과 기본값

- Web `tone`: `brand`(기본) · `neutral`. `variant`: `inline`(기본, 밑줄 항상) · `standalone`(밑줄 hover, 최소 44 target).
- Web `target="_blank"`이고 `rel`이 없으면 `noreferrer noopener`를 붙인다.
- Native는 tone·variant가 없다. 항상 brand 색 · 밑줄 · `bodyLarge` 글자 · 최소 터치 target이다.
- Native `descriptor.label`·`accessibilityLabel`은 앞뒤 공백 없이 비어 있지 않아야 하고, `accessibilityLabel`은 보이는 label을
  포함해야 한다. internal `href`는 `/`·`?`·`#`로 시작, external은 허용 protocol의 절대 URL만(자격증명 포함 금지).

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
| 앞뒤 그림 | `leading`·`trailing` ReactNode | `leading`·`trailing` ReactNode |
| `disabled` | 있음(`aria-disabled`, tabIndex -1) | 없음 |
| `accessibilityHint` | 없음 | 있음 |

## 함정

- Web `disabled` prop이 남아 있지만 [계약](../link.md#목적지)은 비활성 링크 대신 plain Text를 요구한다. 쓰지 않는다.
- Native `descriptor.leadingIcon`·`trailingIcon`은 검증만 되고 그려지지 않는다. 그림이 필요하면 `leading`/`trailing`에 넣는다.
- Native `style`은 recipe 뒤에 합쳐져 타입이 시각 값을 막지 않는다. 리뷰에서 배치 외 값을 거른다.
