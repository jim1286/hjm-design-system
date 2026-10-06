# Asset 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Asset contract](../asset.md), [VoiceNote](../voice-note.md), recipe `assetRecipe`(`src/asset.ts`)

## 언제 쓰나

아이콘·이미지·Lottie·비디오를 같은 크기·모서리 규칙의 액자에 넣을 때 쓴다. 종류가 다른 그림이
한 줄에 섞여 나오는 자리(캐릭터 그림, 첨부 썸네일 줄)가 대표적이다. 재생기는 제품이 슬롯으로 넣는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 사람·계정 얼굴 | [Avatar](avatar.md) |
| 비율이 정해진 큰 이미지·영상 | [AspectRatio](aspect-ratio.md), [Image](image.md) |
| 버튼·행 안의 단일 아이콘 | [Icon](icon.md) |
| 업로드 진행 중인 첨부 | [UploadItem](upload-item.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Asset` | `@hjmds/react`, `/asset` | `@hjmds/react-native`, `/asset` | 기본 액자 |
| `AssetGroup` | `@hjmds/react`, `/asset` | `@hjmds/react-native`, `/asset` | 겹쳐 쌓는 묶음 |
| `VoiceNote` | `/voice-note`만 | `/voice-note`만 | 음성 메모 재생 UI(optional-extension) |

`VoiceNote`는 root에서 export되지 않는다. Asset·Slider·Button·Stack·Surface·Text만 합성하며
optional peer를 요구하지 않는다(소스 import 확인).

## 최소 사용 예

```tsx
// Web
import { Asset } from "@hjmds/react/asset";

<Asset descriptor={{ kind: "lottie", size: "large", accessibilityLabel: t("pet.fox") }}>
  {({ animate }) => <FoxLottie autoplay={animate} />}
</Asset>
```

```tsx
// Native
import { Asset, AssetGroup } from "@hjmds/react-native/asset";

<AssetGroup label={t("letter.carriers")} size="small">
  {carriers.map((c) => (
    <Asset key={c.id} descriptor={{ kind: "image", size: "small", shape: "circle", decorative: true }}>
      <Image source={c.art} style={{ width: 32, height: 32 }} />
    </Asset>
  ))}
</AssetGroup>
```

```tsx
// VoiceNote (Native; Web은 onPlayingChange 등 같은 props)
import { VoiceNote } from "@hjmds/react-native/voice-note";

<VoiceNote
  descriptor={{ title: note.title, state: player.state, duration: player.duration, position: player.position }}
  labels={{ play: t("voice.play"), pause: t("voice.pause"), seek: t("voice.seek"), loading: t("voice.loading"),
    error: t("voice.error"), retry: t("voice.retry"), backward: t("voice.backward"), forward: t("voice.forward") }}
  formatTime={formatSeconds}
  onPlayingChange={(playing) => (playing ? player.play() : player.pause())}
  onSeek={player.seekTo}
  onRetry={player.reload}
/>
```

## 축과 기본값

- `descriptor.kind`(필수): `icon` · `image` · `lottie` · `video`.
- `size`: `small`(32) · `medium`(48, 기본) · `large`(72) · `xlarge`(120). `shape`: `square` · `rounded`(기본) · `circle`.
- `children`에 함수를 주면 `{ animate }`를 받는다. `lottie`·`video`이고 reduced motion이 아닐 때만 `true`다.
- `accessory`는 액자 바깥 모서리에 붙는 작은 표식(재생 아이콘, 상태 점)이다.
- `AssetGroup`: `label`(필수), `size`(기본 `medium`). 겹침은 크기의 30%로 Avatar와 같다.
- `VoiceNote` 상태: `paused` · `playing` · `loading` · `error`. `duration: null`(메타데이터 미확인)과 `0`이면 재생·탐색이 막힌다.

## 꼭 지킬 것

- 뜻이 있는 그림은 `accessibilityLabel`을, 장식은 `decorative: true`만 준다. 이름 없는 비장식과
  둘 다 준 경우 모두 렌더 중 `TypeError`가 난다.
- reduced motion에서는 숨기지 말고 `animate`로 재생을 멈춘다. 판단을 제품에서 다시 만들지 않는다.
- Lottie·비디오·오디오 엔진, 그림 자산은 제품 소유다. HJM은 액자·크기·겹침·표식 위치만 소유한다.
- `VoiceNote`의 재생 위치는 실제 플레이어 값을 넘긴다. 내부 타이머로 진행을 꾸미지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 추가 props | `className` | `style`(바깥 View) |
| 매체 크기 | CSS가 자식을 액자 안으로 줄인다(`max-*: 100%`) | 가운데 정렬만 한다. 자식 크기를 직접 준다 |
| `AssetGroup` 겹침 | CSS로 `.hjm-asset` 형제에 적용 | `children`이 배열일 때만 각 자식을 감싸 적용 |
| `VoiceNote` 앞뒤 이동 문구 | `labels.backward/forward`를 받지만 쓰지 않는다 | Slider 접근성 동작 문구로 쓴다 |

## 함정

- `AssetGroup`의 `size`는 겹침 폭만 정한다. 안의 각 `Asset` descriptor에 같은 `size`를 직접 준다.
- Native `AssetGroup`에 Fragment 하나나 단일 자식을 넘기면 겹치지 않는다. `map` 결과 배열을 넘긴다.
