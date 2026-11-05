# Icon

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Icon](../../icon.md), recipe `iconRecipe`(`src/component-recipes.ts`)
- 스토리북: `배포/컴포넌트/글자와 아이콘/아이콘`, `배포/컴포넌트/글자와 아이콘/루시드 아이콘`

## 언제 쓰나

HJM semantic 이름(`search`, `back`, `chevronEnd`, `notifications` 등 48개)으로 고르는 그림 기호에 쓴다.
크기·색·선 굵기·RTL 반전은 HJM이 정하고, 그림은 [Lucide](https://lucide.dev) 1.49.0이 그린다(Web 내장, Native `/icon-svg`). 제품이 넘긴 glyph도 Lucide를 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 아이콘만 있는 누를 수 있는 행동 | [IconButton](icon-button.md) (이름은 버튼이 소유) |
| 사진·일러스트 | [Image](image.md), [Asset](asset.md) |
| 사람·계정 얼굴 | [Avatar](avatar.md) |
| 소셜 로그인 제공자 로고 | [AuthProviderButton](auth-provider-button.md) (로고는 제품 자산) |
| 미확인 개수 표시 | [CounterBadge](counter-badge.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Icon` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/primitives` |
| `createLucideGlyph` | 보조 — Lucide glyph 연결 helper(컴포넌트 아님) | `/icon-lucide` | `/icon-lucide` |
| `renderSemanticGlyph` | 보조 — HJM semantic 이름을 Lucide로 그리는 `renderGlyph`(컴포넌트 아님, 1.31.0) | — (내장) | `/icon-svg` |
| `semanticIconLucideNames` · `isSemanticIconName` | semantic 이름별 Lucide 아이콘 이름(2.5.0)과 이름 판별 | `@hjmds/design-contracts/components/icon` | 같음 |

`/icon-lucide`는 optional peer가 필요하다. Web `lucide-react` 1.49.0,
Native `lucide-react-native` 1.49.0. Native `/icon-svg`는 optional peer `react-native-svg` 15.15.5가 필요하다.
둘 다 루트 entry에서는 나오지 않는다.

## 최소 사용 예

```tsx
// Web — built-in glyph
import { Icon } from "@hjmds/react/display";

<Icon name="search" />
<Icon name="warning" tone="warning" decorative={false} accessibilityLabel={t("sync.failed")} />
```

```tsx
// Native — glyph는 제품이 공급한다(renderGlyph 필수)
import { Icon } from "@hjmds/react-native/primitives";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { Search, ArrowLeft } from "lucide-react-native";

const renderGlyph = createLucideGlyph({ search: Search, back: ArrowLeft });

<Icon descriptor={{ name: "search" }} renderGlyph={renderGlyph} />
```

```tsx
// Native — Web과 같은 Lucide 그림(lucide-react-native·react-native-svg 필요)
import { renderSemanticGlyph } from "@hjmds/react-native/icon-svg";

<Icon descriptor={{ name: "arrowUp" }} renderGlyph={renderSemanticGlyph} />
```

### 공용 그림의 Native 제공 방식(1.31.0 추가)

2026-10-18 utilverse가 사진 순서 변경·회전 IconButton을 위해 `arrowUp`·`arrowDown`·`rotate` 경로를 앱 adapter에 직접
그렸다. Web만 HJM 경로를 내장하고 그 경로가 renderer 내부에 있어 Native는 같은 그림을 받을 수 없었기 때문이다.
2.5.0부터 두 플랫폼은 HJM이 직접 그린 경로 대신 계약 `semanticIconLucideNames`가 정한 Lucide 아이콘을 그린다.

Native Icon은 `renderGlyph`를 필수로 유지한다. core 컨트롤이 `react-native-svg` 없이 동작하도록 SVG와 `lucide-react-native`는 optional peer이고,
내장 컨트롤의 몇 기호(셰브런·달력·삭제 등)는 내부에서 View로 그린다. 그래서 공용 그림은 `/icon-lucide`와 같은
선택 entry `/icon-svg`의 `renderSemanticGlyph`로 연다. 앱 고유 이름을 함께 쓰면 판별 후 넘긴다.

```tsx
// Native — app glyph names mixed with HJM names
import { isSemanticIconName } from "@hjmds/design-contracts/components/icon";

const renderGlyph = (props: NativeIconRenderProps<AppGlyphName>) =>
  isSemanticIconName(props.name) ? renderSemanticGlyph(props) : renderAppGlyph(props);
```

`react-native-svg`를 설치하지 않는 앱은 `semanticIconLucideNames[name]`이 가리키는 Lucide 아이콘을 자기 adapter에서 그린다(예: `lucide` 패키지의 같은 이름 아이콘 노드). 그림을 직접 그리지 않는다.

### 그림 출처는 Lucide 하나(2026-11-05)

사용자 지시로 모든 아이콘 그림은 Lucide를 쓴다. 직접 그린 경로가 화살촉이 호에서 떨어진 채 배포됐고, 같은 화면의
제품 Lucide 아이콘과 선 느낌이 어긋났기 때문이다. Lucide에 같은 뜻이 없으면 가장 가까운 Lucide 아이콘에
대응한다(`trendFlat` → `equal`). **새 아이콘을 직접 그려야 하는 경우에는 반드시 사용자 허락을 먼저 받는다.**
대응표 정본은 `semanticIconLucideNames`이고 Web·Native 테스트가 renderer의 import를 이 표에 묶는다.

### 이름 고르기

| 목적 | 이름 | 비고 |
| --- | --- | --- |
| 순서를 위/아래로 옮기기 | `arrowUp` · `arrowDown` | 1.31.0 추가. 위아래는 물리 방향이라 RTL에서 반전하지 않는다 |
| 이미지·페이지 90° 회전 | `rotate` | 1.31.0 추가. 시계 방향(Lucide `rotate-cw`). RTL에서 반전하지 않는다. 다시 불러오기는 `refresh`(`refresh-cw`) |
| 차단·잠금 해제 | `unblock` | 1.31.0 추가. `lock`의 고리가 열린 모양(Lucide `lock-open`) |
| 비밀번호 보기/숨기기(눈/가린 눈) | `visibility` · `visibilityOff` | 이미 있는 이름이다. `eye`라는 이름은 없다. 숨김 상태에서 `visibility`, 보임 상태에서 `visibilityOff`(누르면 될 상태). 비밀번호 입력 자체는 이 짝을 이미 내장한 [PasswordField](password-field.md)를 쓴다 |

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `xs` 14 · `sm` 20 · `md` 24 · `lg` 28 · `xl` 32 · `xxl` 44 · `xxxl` 48 | `md` | — |
| `tone` | `primary` · `secondary` · `decorative` · `brand` · `info` · `success` · `warning` · `danger` · `inverse` | `secondary` | — |
| `weight` | `regular` · `strong` | `regular` | — |
| `directionality` | — | — | 생략하면 `back`·`forward`·`chevronStart`·`chevronEnd`만 RTL에서 반전 |
| `decorative` | `true` · `false` | `true` | 기본은 장식(`decorative` 생략 = true)이다. 정보 아이콘은 `decorative: false`와 현지화된 `accessibilityLabel`을 함께 준다 |
| `renderGlyph` | `(props: { name; size: number; color: string; strokeWidth: number }) => ReactNode` | Web 내장 SVG · Native 필수 | HJM이 정한 크기·색·선 굵기를 받아 그린다. Native `name`은 `Icon<Name>`의 제품 이름 타입 |
| `layoutStyle` | 배치 key | — | 바깥 배치만. 크기·색은 `size`·`tone`으로 |

- 묘사 객체 모양(Native `descriptor`, Web 평평한 prop 같은 이름): 장식 `{ name, size?, tone?, weight?, directionality?, decorative?: true }`,
  정보 `{ name, …, tone?: decorative 제외, decorative: false, accessibilityLabel: string }`. 두 모양은 타입으로 갈린다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `size`로만 정한다. 정사각형 프레임 한 변이 `glyph` 값이다(`md` 24 기본, `sm` 20, `xs` 14). Icon은 누를 수 없고 터치 영역이 없다. 누를 수 있게 하려면 최소 44(`control.minTouchTarget`)를 갖는 [IconButton](icon-button.md)으로 감싼다 | `design-contracts/src/foundations.ts`(`glyph`, `control`) |
| 간격 | 글자와의 간격은 감싸는 컴포넌트가 정한다(Link `spacing.xxs` 4, ListRow `spacing.sm` 12) | `design-contracts/src/component-recipes.ts` |
| 순서·정렬 | 텍스트 옆 아이콘은 글자와 세로 가운데로 맞춘다(Web `.hjm-icon`은 `vertical-align: middle`, `flex: 0 0 auto`로 줄어들지 않는다) | `react/src/styles.css`(`.hjm-icon`) |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 큰 글자 설정에서도 크기가 늘지 않는다. 글자와 함께 커져야 하면 더 큰 `size`를 제품이 고른다 | `react-native/src/primitives.tsx`(Icon) |

## 꼭 지킬 것

- 장식 아이콘에 `accessibilityLabel`을 주거나, 정보 아이콘에 라벨을 빼면 `TypeError`가 난다.
  정보 아이콘에는 `decorative` tone도 쓸 수 없다.
- 이름은 모양이 아니라 목적으로 읽힌다. icon-only 행동의 이름은 바깥 IconButton·Link에 둔다.
- `inverse`는 brand·danger처럼 채워진 면 위에서만 쓴다.
- 크기·색·stroke를 `style`·`className`·glyph 쪽에서 바꾸지 않는다. 그림 라이브러리는 제품이 고르고
  (`createLucideGlyph`에 named import만 넘김), 의미 이름과 외형은 HJM이 소유한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| API 모양 | 평평한 prop(`name`, `size`, `tone` …) | `descriptor` 객체 하나 |
| glyph | 내장 Lucide 그림(`lucide` 의존성), `renderGlyph`는 선택 | `renderGlyph` 필수. 공용 그림은 `/icon-svg`의 `renderSemanticGlyph`(Lucide) |
| 사용자 정의 이름 | `SemanticIconName`만 | `Icon<Name>` 제네릭으로 제품 이름 허용 |
| 출력 | `<svg>`(장식이면 `aria-hidden`) | `View` 프레임(장식이면 `accessible={false}`) |
| 배치 | `layoutStyle` | `layoutStyle`. `style`은 제거된 속성 — `layoutStyle` 또는 descriptor `size`·`tone` |

## 함정

- 아이콘은 자기 `tone` 색을 직접 칠한다. Web CSS가 `data-tone`으로 색을 지정하므로 부모 색을 상속하지 않는다.
  primary·danger IconButton 안에서 기본 tone(`secondary`)을 쓰면 채워진 면 위에 회색이 된다. 이때는 `tone="inverse"`.
- `createLucideGlyph` 맵에 없는 이름을 그리면 실행 중 `TypeError`가 난다. `renderSemanticGlyph`도 HJM 이름이 아니면 `TypeError`를 낸다.

2026-10-20 공유 아이콘 잘림 수정은 2.5.0에서 HJM 경로를 Lucide `share-2`로 바꾸며 종료했다.
