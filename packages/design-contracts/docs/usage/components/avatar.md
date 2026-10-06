# Avatar

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Avatar fallback and Blobatar](../../avatar-fallback.md), recipe `avatarRecipe`(`src/component-recipes.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/아바타` · `배포/컴포넌트/데이터 표시/블로바타 캐릭터` · `배포/컴포넌트/데이터 표시/움직이는 블로바타 캐릭터`

## 언제 쓰나

사람·계정을 사진 또는 이니셜로 나타낼 때 쓴다. 사진이 없거나 로드에 실패하면 자동으로 대체 표시로
바뀌고, 사진 주소가 바뀌면 다시 시도한다. Web은 여러 명을 겹쳐 보이는 `AvatarGroup`이 있다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 사람이 아닌 그림·캐릭터·Lottie | [Asset](asset.md) |
| 비율이 있는 큰 사진 | [Image](image.md), [AspectRatio](aspect-ratio.md) |
| 이름 옆 숫자·상태 표시 | [CounterBadge](counter-badge.md), [Badge](badge.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Avatar` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |
| `AvatarGroup` | 동반(겹친 묶음) | `@hjmds/react`, `/display` | 없음 |
| `createBlobatarFallback` | 확장(선택 대체 그림, 정적) | `/avatar-blobatar` | `/avatar-blobatar` |
| `createAnimatedBlobatarFallback` | 확장(선택 대체 그림, 움직임) | `/avatar-blobatar-motion` | `/avatar-blobatar-motion` |

Blobatar 어댑터는 root에서 export되지 않는다. optional peer `blobatar@2.7.0`과
`@blobatar/react@2.7.0`(Web) 또는 `@blobatar/react-native@2.7.0`(Native)을 앱에 설치해야 하고,
Native는 `react-native-svg`도 필요하다. motion Native entry는 `@blobatar/react-native/animated`를 써서
호환 Reanimated·Worklets가 추가로 필요하다([계약](../../avatar-fallback.md)). 설치하지 않은 채 import하면
tsc·테스트는 통과해도 기기 Metro에서 깨질 수 있다.

## 최소 사용 예

```tsx
// Web
import { Avatar, AvatarGroup } from "@hjmds/react/display";

// 사진이 없으면 src를 빼야 한다(exactOptionalPropertyTypes에서 undefined를 넘기면 타입 오류).
const profile = (
  <Avatar name={user.displayName} {...(user.photoUrl ? { src: user.photoUrl } : {})} size="large" />
);

const roomMembers = (
  <AvatarGroup label={t("room.members", { count: members.length })} size="small"
    overflow={hidden > 0 ? t("room.moreMembers", { count: hidden }) : null}>
    {visible.map((m) => <Avatar key={m.id} name={m.displayName} src={m.photoUrl} size="small" />)}
  </AvatarGroup>
);
```

```tsx
// Native
import { Avatar } from "@hjmds/react-native/data-display";

<Avatar name={user.displayName} {...(user.photoUrl ? { source: { uri: user.photoUrl } } : {})}
  accessibilityLabel={user.displayName} size={48} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `name` | `string` | 필수 | 이니셜과 기본 접근성 이름의 원천. 공백뿐이면 `TypeError` |
| Web `src` · Native `source` | `string` · `ImageSourcePropType` | — | 사진이 없으면 prop을 뺀다. 주소(Native는 source 내용)가 바뀌면 실패 상태를 지우고 다시 시도한다 |
| Web `size` | `small`(32) · `medium`(40) · `large`(48) · `xlarge`(64) | `medium` | — |
| Web `shape` | `circle` · `rounded` | `circle` | — |
| Native `size` | 숫자(pt) | 44 | 24 미만이면 `RangeError`. 모양은 항상 원이다 |
| `renderFallback` | `(context: { size: number; decorative: true }) => ReactNode` | — | 사진이 없거나 실패했을 때만 불린다. `size`는 px/pt 값. null·undefined를 돌려주면 기본 대체 표시(Web `fallback`→이니셜, Native 이니셜)를 쓴다 |
| Web `alt` | `string` | `name` | `""`이면 보조기기에서 숨긴다 |
| Web `imageProps` | `img` 속성(`alt`·`src` 제외) | — | `onError`는 `(event: SyntheticEvent<HTMLImageElement>) => void`이며 대체 표시로 바꾼 뒤 불린다 |
| Native `accessibilityLabel` · `decorative` | `{ accessibilityLabel: string }` 또는 `{ decorative: true }` | — | 둘 중 하나가 타입으로 강제된다 |
| Native `initials` | `string` | 이름에서 계산 | 앞뒤 공백을 지우고 최대 3자, 대문자 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`·`imageStyle`은 deprecated — layoutStyle 또는 `size`/`renderFallback` |
| `AvatarGroup`(Web) `label` · `size` · `overflow` | `string` · Avatar 크기 · `ReactNode` | `label` 필수 · `size` `medium` | 빈 `label`은 `TypeError`. `overflow`는 제품이 만든 "+3" 같은 문구이며 `aria-hidden`이다(남은 인원은 `label`에 담는다). 겹침은 크기의 30%다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Web `small` 32 · `medium` 40 · `large` 48 · `xlarge` 64, Native 숫자(기본 44). 목록 행에는 Web `medium`/Native 기본, 프로필 머리에는 `xlarge`. Avatar 자체는 터치 대상이 아니므로 누르는 프로필은 감싸는 행·버튼이 최소 44를 확보한다 | `.hjm-avatar[data-size]`, `react-native/src/data-display.tsx` |
| 간격 | 자체 바깥 여백이 없다. `AvatarGroup`은 크기의 30%만큼 겹치고 각 아바타에 `bg` 색 2px 테두리를 둘러 경계를 만든다 | `.hjm-avatar-group` |
| 순서·정렬 | 행·카드·댓글 머리의 시작 쪽에 두고 이름·본문이 끝 쪽으로 이어진다. `AvatarGroup`의 넘친 수 표시는 맨 끝에 온다 | `.hjm-avatar-group__overflow` |
| 고정·스크롤 | 고정 영역이 없다 | — |
| 좁은 폭·큰 글자 | 아바타 크기는 그대로이고 옆 문구가 줄바꿈된다. 이니셜 글자는 Web `small`에서 label, `xlarge`에서 title 크기다 | `.hjm-avatar[data-size="small"]`·`[data-size="xlarge"]` |

## 꼭 지킬 것

- `name`은 빈 문자열이면 `TypeError`다. 접근성 이름은 Avatar가 소유하고, 대체 그림은 장식으로만 그린다(버튼 등 상호작용 금지).
- Blobatar `seed`에는 공개 제품 식별자를 쓴다. 이름·이메일·자격증명은 seed로 쓰지 않는다.
- 사진·표시 이름·남은 인원 문구는 제품 소유다. `overflow`는 i18n 키로 만든다. `overflow`는 보조기기에서 숨겨지므로 전체 인원은 `label` 문구에 넣는다.
- 배치는 `layoutStyle`로만 한다. Native `style`·`imageStyle`은 deprecated(개발 모드 1회 경고, 다음 major 제거)다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 사진 | `src`(문자열), `imageProps`로 `img` 속성·`onError` 전달 | `source`(`ImageSourcePropType`). `imageStyle`은 deprecated — layoutStyle 또는 `size` |
| 접근성 이름 | `alt`(기본 `name`), `alt=""`이면 숨김 | `accessibilityLabel` 필수, 또는 `decorative` |
| 대체 표시 | `fallback` 노드 또는 이니셜 | `initials`(최대 3자) 또는 이니셜 |
| 크기·모양 축 | 4단 이름 · `circle`/`rounded` | 숫자 · 원만 |
| 묶음 | `AvatarGroup` | 없음 |

## 함정

- `src`/`source`에 `undefined`를 직접 넘기면 `exactOptionalPropertyTypes`에서 타입 오류다. 사진이 없으면 prop을 빼거나 spread로 조건부로 넣는다.
- Web `AvatarGroup`은 이제 `style`을 버리지 않고 `layoutStyle`과 합친다. 겹침 변수(`--hjm-avatar-overlap`)는 마지막에 덮이므로 `style`로 겹침을 바꿀 수 없다.
- 이니셜은 두 플랫폼 모두 `resolveAvatarInitials`(`@hjmds/design-contracts/avatar-fallback`)로 첫 단어와 마지막 단어의 첫 글자(code point)다. 1.12.1까지 Web은 앞 두 단어를 써서 "Kim Min Jun"이 Web "KM", Native "KJ"였다(미게시 변경). 1.12.1에서 일치가 필요하면 Native `initials`·Web `fallback`으로 같은 값을 준다.
