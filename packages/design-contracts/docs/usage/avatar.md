# Avatar 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Avatar fallback and Blobatar](../avatar-fallback.md), recipe `avatarRecipe`(`src/component-recipes.ts`)

## 언제 쓰나

사람·계정을 사진 또는 이니셜로 나타낼 때 쓴다. 사진이 없거나 로드에 실패하면 자동으로 대체 표시로
바뀌고, 사진 주소가 바뀌면 다시 시도한다. Web은 여러 명을 겹쳐 보이는 `AvatarGroup`이 있다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 사람이 아닌 그림·캐릭터·Lottie | [Asset](asset.md) |
| 비율이 있는 큰 사진 | [Image](image.md), [AspectRatio](aspect-ratio.md) |
| 프로필 편집 화면 전체 | [ProfileScreen](profile-screen.md) |
| 이름 옆 숫자·상태 표시 | [CounterBadge](counter-badge.md), [Badge](badge.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Avatar` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |
| `AvatarGroup` | `@hjmds/react`, `/display` | 없음 | 겹친 묶음 |
| `createBlobatarFallback` | `/avatar-blobatar` | `/avatar-blobatar` | 선택 대체 그림(정적) |
| `createAnimatedBlobatarFallback` | `/avatar-blobatar-motion` | `/avatar-blobatar-motion` | 선택 대체 그림(움직임) |

Blobatar 어댑터는 root에서 export되지 않는다. optional peer `blobatar@2.7.0`과
`@blobatar/react@2.7.0`(Web) 또는 `@blobatar/react-native@2.7.0`(Native)을 앱에 설치해야 하고,
Native는 `react-native-svg`도 필요하다. motion Native entry는 `@blobatar/react-native/animated`를 써서
호환 Reanimated·Worklets가 추가로 필요하다([계약](../avatar-fallback.md)). 설치하지 않은 채 import하면
tsc·테스트는 통과해도 기기 Metro에서 깨질 수 있다.

## 최소 사용 예

```tsx
// Web
import { Avatar, AvatarGroup } from "@hjmds/react/display";

<Avatar name={user.displayName} src={user.photoUrl} size="large" />

<AvatarGroup label={t("room.members", { count: members.length })} size="small"
  overflow={hidden > 0 ? t("room.moreMembers", { count: hidden }) : undefined}>
  {visible.map((m) => <Avatar key={m.id} name={m.displayName} src={m.photoUrl} size="small" />)}
</AvatarGroup>
```

```tsx
// Native
import { Avatar } from "@hjmds/react-native/data-display";

<Avatar name={user.displayName} source={user.photoUrl ? { uri: user.photoUrl } : undefined}
  accessibilityLabel={user.displayName} size={48} />
```

## 축과 기본값

- Web `size`: `small`(32) · `medium`(40, 기본) · `large`(48) · `xlarge`(64). `shape`: `circle`(기본) · `rounded`.
- Native `size`: 숫자(pt), 기본 44, 24 미만이면 `RangeError`. 모양은 항상 원이다.
- `renderFallback({ size, decorative: true })`는 사진이 없거나 실패했을 때만 불린다. null을 돌려주면 기본 대체 표시를 쓴다.
- `AvatarGroup`(Web): `label` 필수(빈 문자열은 `TypeError`), `size` 기본 `medium`, `overflow`는 제품이 만든 "+3" 같은 문구. 겹침은 크기의 30%다.

## 꼭 지킬 것

- `name`은 빈 문자열이면 `TypeError`다. 접근성 이름은 Avatar가 소유하고, 대체 그림은 장식으로만 그린다(버튼 등 상호작용 금지).
- Blobatar `seed`에는 공개 제품 식별자를 쓴다. 이름·이메일·자격증명은 seed로 쓰지 않는다.
- 사진·표시 이름·남은 인원 문구는 제품 소유다. `overflow`는 i18n 키로 만든다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 사진 | `src`(문자열), `imageProps`로 `img` 속성·`onError` 전달 | `source`(`ImageSourcePropType`), `imageStyle` |
| 접근성 이름 | `alt`(기본 `name`), `alt=""`이면 숨김 | `accessibilityLabel` 필수, 또는 `decorative` |
| 대체 표시 | `fallback` 노드 또는 이니셜 | `initials`(최대 3자) 또는 이니셜 |
| 이니셜 규칙 | 앞 두 단어의 첫 글자 | 첫 단어와 마지막 단어의 첫 글자 |
| 크기·모양 축 | 4단 이름 · `circle`/`rounded` | 숫자 · 원만 |
| 묶음 | `AvatarGroup` | 없음 |
