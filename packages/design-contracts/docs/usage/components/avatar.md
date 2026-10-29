# Avatar

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-23
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
| `name` | `string` | 의미 있는 아바타는 필수 | 이니셜과 기본 접근성 이름의 원천. 공백뿐이면 `TypeError`. `decorative`이면 생략할 수 있다(이니셜 없이 액자·대체 그림만) |
| `decorative` | `boolean` | `false` | 옆에 이름이 보이는 작성자 표시나 사람 없는 장식. Web은 루트 `aria-hidden`·`img alt=""`이고 `alt`를 함께 줄 수 없다. Native는 `accessibilityLabel`을 함께 줄 수 없다 |
| Web `src` · Native `source` | `string` · `ImageSourcePropType` | — | 사진이 없으면 prop을 뺀다. 주소(Native는 source 내용)가 바뀌면 실패 상태를 지우고 다시 시도한다 |
| `size` | `xxsmall`(22) · `xsmall`(28) · `small`(32) · `medium`(40) · `touch`(44) · `large`(48) · `xlarge`(64). Native는 기존 숫자(pt)도 받는다 | Web·Native `large`(48) | `avatarRecipe.sizes`. Native 숫자가 22 미만이면 `RangeError`(2026-10-23 전에는 24). 새 코드는 단계 이름을 쓴다 |
| `shape` | `circle` · `rounded` | `circle` | `rounded`는 `radius.md`(가장 가까운 디자인 프로필) |
| `frame` | `outlined` · `surface` · `none` | `outlined` | `avatarRecipe.frames`. `outlined`=canvas 바탕+borderControl 50% alpha의 1px 테두리, `surface`=바탕만, `none`=바탕·테두리 없음(제품 그림이 액자를 채울 때) |
| `accessory` · `accessoryPlacement` | `ReactNode` · `bottom-end` · `top-end` | — · `bottom-end` | 팀 배지·상태 점 같은 모서리 표식. 아바타 상자 모서리(`avatarRecipe.accessory.offset` 0, Asset·IconTile처럼 바깥으로 나가는 거리)에 붙고 액자에 잘리지 않는다. 누르는 요소를 넣지 않는다 |
| `renderFallback` | `(context: { size: number; decorative: true }) => ReactNode` | — | 사진이 없거나 실패했을 때만 불린다. `size`는 px/pt 값. null·undefined를 돌려주면 기본 대체 표시(Web `fallback`→이니셜, Native 이니셜)를 쓴다 |
| Web `alt` | `string` | `name` | `""`이면 보조기기에서 숨긴다 |
| Web `imageProps` | `img` 속성(`alt`·`src` 제외) | — | `onError`는 `(event: SyntheticEvent<HTMLImageElement>) => void`이며 대체 표시로 바꾼 뒤 불린다. `renderImage`와 함께 주면 `TypeError` |
| Web `renderImage` | `(props: AvatarImageRenderProps) => ReactNode` | 기본 `img` | `src`, `alt`(장식이면 `""`), `size`(px), `className`(`hjm-avatar__image`, 그대로 붙인다), 세대가 보호된 `onError`. `next/image` 등 제품 이미지 호스트를 연결한다(2026-10-23) |
| Native `accessibilityLabel` · `decorative` | `{ accessibilityLabel: string }` 또는 `{ decorative: true }` | — | 둘 중 하나가 타입으로 강제된다 |
| Native `renderImage` | `(context: AvatarImageRenderProps) => ReactNode` | 기본 Native Image | 제품의 이미지 캐시·표시 호스트를 연결한다(1.14.0 추가). `source`, `size`, HJM `fallback`, 세대가 보호된 `onError` 제공 |
| Native `initials` | `string` | 이름에서 계산 | 앞뒤 공백을 지우고 최대 3자, 대문자 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`·`imageStyle`은 제거된 속성 — layoutStyle 또는 `size`/`renderFallback` |
| `AvatarGroup`(Web) `label` · `size` · `overflow` | `string` · Avatar 크기 · `ReactNode` | `label` 필수 · `size` `large` | 빈 `label`은 `TypeError`. `overflow`는 제품이 만든 "+3" 같은 문구이며 `aria-hidden`이다(남은 인원은 `label`에 담는다). 겹침은 크기의 30%다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `xxsmall` 22 · `xsmall` 28 · `small` 32 · `medium` 40 · `touch` 44 · `large` 48 · `xlarge` 64. 댓글·칩 안 작은 작성자 표시는 `xxsmall`/`xsmall`, 일반 회원 목록과 프로필 머리에는 `large`(48). 감싼 요소 크기(`h-8` 등)로 맞추지 말고 단계를 고른다. 표시 전용 Avatar는 터치 대상이 아니다. 프로필 이동은 상위 구성의 전용 행동 또는 Avatar.action을 연결해 최소 44를 확보한다 | `.hjm-avatar[data-size]`, `react-native/src/data-display.tsx` |
| 간격 | 자체 바깥 여백이 없다. `AvatarGroup`은 크기의 30%만큼 겹치고 각 아바타에 `bg` 색 2px 테두리를 둘러 경계를 만든다 | `.hjm-avatar-group` |
| 순서·정렬 | 행·카드·댓글 머리의 시작 쪽에 두고 이름·본문이 끝 쪽으로 이어진다. `AvatarGroup`의 넘친 수 표시는 맨 끝에 온다 | `.hjm-avatar-group__overflow` |
| 고정·스크롤 | 고정 영역이 없다 | — |
| 좁은 폭·큰 글자 | 아바타 크기는 그대로이고 옆 문구가 줄바꿈된다. 이니셜 글자는 Web `small`에서 label, `xlarge`에서 title 크기다 | `.hjm-avatar[data-size="small"]`·`[data-size="xlarge"]` |

## 꼭 지킬 것

- 장식인지 먼저 정한다. 같은 줄에 이름이 보이면 `decorative`로 숨기고, 아바타만 사람을 나타내면 `name`(Web)·`accessibilityLabel`(Native)을 준다.
- 크기·모양·테두리·모서리 표식을 감싸는 요소의 className·절대 좌표로 다시 만들지 않는다. `size`·`shape`·`frame`·`accessory`를 쓴다.

- `name`은 빈 문자열이면 `TypeError`다. 접근성 이름은 Avatar가 소유하고, 대체 그림은 장식으로만 그린다(버튼 등 상호작용 금지).
- Blobatar `seed`에는 공개 제품 식별자를 쓴다. 이름·이메일·자격증명은 seed로 쓰지 않는다.
- 사진·표시 이름·남은 인원 문구는 제품 소유다. `overflow`는 i18n 키로 만든다. `overflow`는 보조기기에서 숨겨지므로 전체 인원은 `label` 문구에 넣는다.
- 배치는 `layoutStyle`로만 한다. Native `style`·`imageStyle`은 제거된 속성이다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 사진 | `src`(문자열), `imageProps`로 `img` 속성·`onError` 전달 | `source`(`ImageSourcePropType`). `imageStyle`은 제거된 속성 — layoutStyle 또는 `size` |
| 접근성 이름 | `alt`(기본 `name`), `alt=""`이면 숨김, `decorative`면 루트까지 숨김 | `accessibilityLabel` 필수, 또는 `decorative` |
| 대체 표시 | `fallback` 노드 또는 이니셜 | `initials`(최대 3자) 또는 이니셜 |
| 크기·모양 축 | 단계 이름 · `circle`/`rounded` | 단계 이름 또는 숫자 · `circle`/`rounded` |
| 이미지 호스트 | `renderImage`(img 대신) 또는 `imageProps` | `renderImage`(HJM `fallback`도 전달) |
| 묶음 | `AvatarGroup` | 없음 |

2026-10-07 실제 Showcase 비교에서 `AvatarGroup`을 `ListRow.leading`에 넣으면 단일 이미지용
40×40 프레임에 그룹과 남은 인원이 잘렸다. 단일 Avatar는 그 슬롯을 사용하고, 묶음은 Card 본문의
Stack처럼 내용 폭을 수용하는 영역에 둔다. leading의 overflow/크기를 CSS로 우회하지 않는다.

## 함정

- `src`/`source`에 `undefined`를 직접 넘기면 `exactOptionalPropertyTypes`에서 타입 오류다. 사진이 없으면 prop을 빼거나 spread로 조건부로 넣는다.
- Web `AvatarGroup`은 이제 `style`을 버리지 않고 `layoutStyle`과 합친다. 겹침 변수(`--hjm-avatar-overlap`)는 마지막에 덮이므로 `style`로 겹침을 바꿀 수 없다.
- 이니셜은 두 플랫폼 모두 `resolveAvatarInitials`(`@hjmds/design-contracts/avatar-fallback`)로 첫 단어와 마지막 단어의 첫 글자(code point)다. "Kim Min Jun"은 두 플랫폼 모두 "KJ"다. 제품이 다른 이니셜 규칙을 쓰면 Native `initials`·Web `fallback`으로 같은 값을 준다.

### Native 제품 이미지 호스트

Utilverse는 Expo Image의 disk 캐시와 로딩 동안 이니셜을 유지한다. 공통 Avatar로 바꿀 때
그 계약을 잃지 않도록 `renderImage`를 제공한다. 새 아바타 컴포넌트나 Expo 의존성을
HJM에 추가하지 않고 원형 프레임·대체 문자·접근성은 기존 Avatar에 남긴다.

```tsx
import { Image as ExpoImage } from "expo-image";
import { Avatar } from "@hjmds/react-native/data-display";

<Avatar name={displayName} decorative source={{ uri }} size={28}
  renderImage={({ source, size, fallback, onError }) => (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {fallback}
      <ExpoImage source={source} cachePolicy="disk" contentFit="cover" accessible={false}
        style={{ position: "absolute", width: size, height: size }} onError={onError} />
    </View>
  )}
/>
```

제품이 import하는 `View`·Expo Image는 호스트 구현이며 HJM 색·원형·테두리를 덮지 않는다.
실패 시 전달된 `onError`를 호출해야 공통 대체 표시로 바뀐다. 이전 source의 callback은
A→B→A로 되돌아와도 무시한다. source를 같은 값으로 재생성하는 것은 재시도가 아니다.
슬롯의 자식은 장식 전용이며 공통 wrapper가 접근성 트리에서 숨긴다. 버튼·링크를 넣지 않는다.
기본 Native Image 경로는 그대로다. Web은 img/imageProps 경로를 사용하며 src가 바뀌면 요청 img 노드를 교체해 이전 DOM 오류가 새 사진의 대체 표시를 켜지 않도록 한다.

Web animated Blobatar는 IntersectionObserver를 사용할 수 없으면 같은 seed·표정의 정적 그림을 유지한다. 장식의 관찰 기능 미지원 때문에 Avatar 본문을 실패시키지 않는다.

### 작은 장식 아바타와 모서리 표식 (2026-10-23)

번뚝 `UserAvatar`(22·28·32·44, 투명 원 안의 생성 SVG)와 야잘알 `PlayerAvatar`(둥근 사각형, 모서리 팀 배지)가
Avatar를 쓰지 못한 이유(이름 필수, Web 이미지 호스트 없음, 4단 크기, Native 24 하한, 강제 테두리·바탕)를 공개 축으로 옮겼다.

```tsx
// Web: 작성자 이름 옆의 장식 아바타, 제품 SVG가 액자를 채운다
<Avatar decorative size="xsmall" frame="none" {...(svgUrl ? { src: svgUrl } : {})} fallback={emoji} />

// Native: 원형 선수 사진 + 모서리 팀 배지
<Avatar name={player.name} accessibilityLabel={player.name} size="large" shape="circle"
  {...(uri ? { source: { uri } } : {})} accessory={<TeamBadge team={team} />} />
```

### 회원 프로필 이동 (2026-10-25)

회원 사진을 표시만 하거나 확대 보기만 연결한 사용처가 남아 사용자 요청으로 기본 행동을 통일했다.
`Avatar`는 Web·Native 모두 `action={{label: t("profile.open"), onPress: () => openMember(member.id)}}`를 받는다.
이름 있는 버튼이 장식 사진을 감싸며 사진이 실패하거나 이니셜만 있어도 이동은 유지된다.
라우트·회원 ID·권한은 제품이 공급하고, HJM은 최소 44px/pt 영역과 접근성 이름을 소유한다.
별도 프로필 행동이 있는 사진 자식은 항상 장식이다. 프로필 버튼 자체를 `aria-hidden`/`no-hide-descendants`로 숨기지 않는다.

상위 구성의 전용 API를 먼저 사용한다. 댓글은 `avatarAction`, 채팅은 `avatarAction`, 알림은 `NotificationRow.avatarAction`,
일반 목록은 `ListRow.leadingAction`, 카드 작성자는 `Card.leadingAction`, 대화 목록은 `ConversationRow.avatarAction` + `renderBody`, 참여자는 `ChatRoomMembers.memberProfile`이다.
같은 사진에 `Avatar.action`과 상위 `avatarAction`을 함께 넣지 않는다. 본문 링크/버튼과 독립 프로필 버튼은 형제다.

사진 옆에 따로 보이는 회원 닉네임도 같은 프로필로 이동한다(2026-10-29 사용자 지시: Spint 댓글에서 닉네임을 눌러도 반응이 없었다).
댓글 `CommentThreadRow`는 `avatarAction`이 있으면 작성자 이름도 같은 행동·접근성 이름의 글자 버튼으로 그린다(Web `hjm-identity-name-action`,
Native 중첩 `Text` press). 제품은 추가 prop 없이 `avatarAction`만 공급한다. 행 전체가 대화방·알림 목적지인 글자 안의 이름은 버튼을 중첩하지 않는다.

회원 식별자가 없는 장식·방 사진을 회원 프로필로 연결하지 않는다. 명시적인 사진 편집·공유 대상 선택은 원래 작업을 유지한다.

내 프로필 화면의 내 사진은 예외로 그 자체가 사진 변경 버튼이다(2026-10-25 사용자 지시). `action={{label: t("photo.change"), onPress: openPhotoPicker}}`를 연결하고 사진 고르기·자르기·업로드는 제품이 소유한다. 같은 화면에 중복 "사진 바꾸기" 버튼을 두지 않는다.
제품의 실제 회원 화면이 없으면 실제 공개 데이터의 화면부터 제공한다. 이미 그 회원 화면이면 중복 이동하지 않는다.

프로필 행동의 `disabled`는 전송·삭제 등 현재 작업이 경로 이탈을 막는 동안 사용한다. 버튼을 없애거나 활성 버튼에서 오류를 무시하는 대신 동일한 이름과 비활성 의미를 유지한다.

## 일반 회원 크기 (2026-10-25)

사용자 요청으로 Web·Native 기본값은 `size="large"`(48), `shape="circle"`이다. 프로필과 일반 회원 목록에도 48을 쓰고 댓글·채팅 등 촘촘한 목록의 명시적인 작은 단계는 유지한다. 제품별 사진·이니셜·이모지·동물 그림도 같은 회원 프레임을 따른다. 콘텐츠 썸네일·앱 아이콘의 모양이나 크기에는 적용하지 않는다.

기본 `frame="outlined"`는 `border.control` 50% alpha, 1px의 원형 윤곽이다. 2026-10-25 번뚝 이모지 아바타에서 기존 선은 흐리고 2px 불투명 선은 진하다는 피드백을 거쳐 1px·50%로 조정했으며, 사용자가 이 값을 디자인 시스템 기본값으로 지정했다. 지름은 테두리 포함이고 Web·Native에 동일하다. 미게시 개발 중 추가했던 `strong` 옵션은 기본값과 합쳐 제거했다. 제품에서 별도 frame을 지정할 필요가 없다.

### 그림 전체 표시 (2026-10-28)

스핀트에서 직접 그린 정사각형 그림의 모서리가 원형 프로필에서 잘린 사례로 `imageFit="contain"`을 추가했다. 기본 `cover`는 기존 사진 채움을 유지한다. `contain`은 사진·그림 전체를 프레임 안에 넣고 여백을 남긴다. 공통 recipe의 `1 / √2` 비율로 정사각형 대각선까지 원 안에 들어오며 이미지의 모서리를 다시 둥글게 자르지 않는다. Web·Native와 기존 저장 이미지에 동일하게 적용한다. Native `renderImage`의 `size`에는 실제 이미지 영역 크기가 전달된다.

**회원 프로필 사진은 원을 꽉 채운다(`cover`, 기본값) — 2026-10-29 사용자 지시.** `contain`은 작은 원 안에 네모난 사진이 작게 들어가고
빈 테두리가 남아 사진처럼 보이지 않았다(Spint). 사진 전체는 프로필의 "사진 크게 보기"(`ProfileSummary.avatarView` + `ImageViewer`)에서
본다. 회원 아바타·댓글·채팅·알림·목록의 사진에 `contain`을 쓰지 않는다. `contain`은 잘리면 뜻이 바뀌는 비사진 그림(로고·스티커·도감
일러스트)에만 쓰고 그 이유를 사용처 주석에 남긴다.
