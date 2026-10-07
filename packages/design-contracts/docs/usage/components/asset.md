# Asset

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Asset contract](../../asset.md), [VoiceNote](../../voice-note.md), recipe `assetRecipe`(`src/asset.ts`)
- 스토리북: `배포/컴포넌트/데이터 표시/이미지·영상 표시` · `배포/컴포넌트/데이터 표시/음성 메모`

개발 중인 프로필 지원에서 `rounded`는 가장 가까운 프로필의 `tokens.radius.md`를 따른다.
프로필이 없으면 기존 12px이고 명시한 square/circle은 그대로다. 이 보강은 아직 미게시이며
1.12.1의 기존 Asset 제공 여부와 구분한다([근거](../../../../../docs/qa/2026-10-07-3dicons-page-review.md)).

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Asset` | 기본(액자) | `@hjmds/react`, `/asset` | `@hjmds/react-native`, `/asset` |
| `AssetGroup` | 동반(겹쳐 쌓는 묶음) | `@hjmds/react`, `/asset` | `@hjmds/react-native`, `/asset` |
| `VoiceNote` | 확장(음성 메모 재생 UI, optional-extension) | `/voice-note`만 | `/voice-note`만 |

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
import { Image } from "react-native";
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
// Native
// VoiceNote. Web(`@hjmds/react/voice-note`)도 같은 props에 `layoutStyle`만 더 받는다.
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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `{ kind, size?, shape?, decorative?, accessibilityLabel? }`(`AssetDescriptor`) | 필수 | 이름 또는 `decorative: true` 둘 중 하나만 |
| `descriptor.kind` | `icon` · `image` · `lottie` · `video` | 필수 | — |
| `descriptor.size` | `small`(32) · `medium`(48) · `large`(72) · `xlarge`(120) | `medium` | — |
| `descriptor.shape` | `square` · `rounded` · `circle` | `rounded` | — |
| `children` | `ReactNode` 또는 `(state: { animate: boolean }) => ReactNode` | 필수 | `animate`는 `lottie`·`video`이고 reduced motion이 아닐 때만 `true`다 |
| `accessory` | `ReactNode` | — | 액자 바깥 모서리에 붙는 작은 표식(재생 아이콘, 상태 점) |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | Asset·AssetGroup 바깥 배치 전용 |
| Native `style`(Asset·AssetGroup) | — | — | deprecated — `layoutStyle` 또는 descriptor `size`/`shape`(개발 모드 1회 경고, 다음 major 제거) |
| `AssetGroup` `label` · `size` | `string` · `AssetSize` | `label` 필수 · `size` `medium` | 겹침은 크기의 30%로 Avatar와 같다 |
| `VoiceNote` `descriptor` | `{ title, state: "paused" \| "playing" \| "loading" \| "error", duration: number \| null, position: number, disabled? }` | 필수 | `duration: null`(메타데이터 미확인)과 `0`이면 재생·탐색이 막힌다 |
| `VoiceNote` `labels` | `{ play, pause, seek, loading, error, retry, backward, forward }`(모두 `string`) | 필수 | i18n 문구 |
| `VoiceNote` `formatTime` | `(seconds: number) => string` | 필수 | 경과/전체 시간 문구와 Slider 접근성 값 |
| `VoiceNote` `onPlayingChange` · `onSeek` · `onRetry` | `(playing: boolean) => void` · `(seconds: number) => void` · `() => void` | 앞의 둘 필수 | 플레이어 제어는 제품 소유 |
| `VoiceNote` `artwork` | `ReactNode` | — | 장식 원형 Asset으로 그린다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 정사각 액자. 한 변 `small` 32 · `medium` 48 · `large` 72 · `xlarge` 120. 모서리 `square` 0 · `rounded` `radius.md`(무프로필 12, 미게시 보강에서는 프로필 값) · `circle` foundation `radius.full`. 터치 대상이 아니므로 누를 수 있게 하려면 감싸는 버튼·행이 최소 44를 확보한다 | `assetRecipe.sizes`·`shapes`, `.hjm-asset__frame` |
| 간격 | `accessory`는 액자 끝·아래 모서리 바깥으로 `spacing.xxs` 4 띄워 붙으므로 옆 요소와 `spacing.xs` 8 이상 띄운다. `AssetGroup` 겹침은 크기의 30%(48이면 −14) | `assetRecipe.accessory`·`overlapRatio`, `react/src/asset.tsx` |
| 순서·정렬 | 늘어나지 않는 인라인 요소(Web `inline-flex`, `flex: 0 0 auto`). 행 안에서는 시작 쪽에 둔다. 한 줄에 종류가 다른 그림을 섞을 때 모두 같은 `size`·`shape`를 준다 | `.hjm-asset`, `assetBehavior.scenarios` |
| 고정·스크롤 | 고정 영역이 없다 | — |
| 좁은 폭·큰 글자 | 액자 크기는 그대로이고 옆 문구가 줄바꿈된다 | `assetRecipe.sizes`(고정 수치) |

## 꼭 지킬 것

- 뜻이 있는 그림은 `accessibilityLabel`을, 장식은 `decorative: true`만 준다. 이름 없는 비장식과
  둘 다 준 경우 모두 렌더 중 `TypeError`가 난다.
- reduced motion에서는 숨기지 말고 `animate`로 재생을 멈춘다. 판단을 제품에서 다시 만들지 않는다.
- Lottie·비디오·오디오 엔진, 그림 자산은 제품 소유다. HJM은 액자·크기·겹침·표식 위치만 소유한다.
- 테마별 그림은 제품의 자산 목록에서 선택해 슬롯에 넣는다. Asset이 URL을 만들거나 재질·각도
  변형을 자동 생성하지 않는다. 자산마다 지원하는 조합과 실패 대체를 확인하며, 3D 제공자의
  태그를 의미 있는 대체 텍스트로 그대로 복사하지 않는다. 기능 아이콘은 Icon/Button 계약을 쓴다.
- `VoiceNote`의 재생 위치는 실제 플레이어 값을 넘긴다. 내부 타이머로 진행을 꾸미지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 prop | `layoutStyle`(+`className`) | `layoutStyle`(`style`은 deprecated). `VoiceNote`는 Native에 `layoutStyle` 없음 |
| 매체 크기 | CSS가 자식을 액자 안으로 줄인다(`max-*: 100%`) | 가운데 정렬만 한다. 자식 크기를 직접 준다 |
| `AssetGroup` 겹침 | CSS로 `.hjm-asset` 형제에 적용 | `children`이 배열일 때만 각 자식을 감싸 적용 |
| `VoiceNote` 앞뒤 이동 문구 | `labels.backward/forward`를 받지만 쓰지 않는다 | Slider 접근성 동작 문구로 쓴다 |

## 함정

- `AssetGroup`의 `size`는 겹침 폭만 정한다. 안의 각 `Asset` descriptor에 같은 `size`를 직접 준다.
- Native `AssetGroup`에 Fragment 하나나 단일 자식을 넘기면 겹치지 않는다. `map` 결과 배열을 넘긴다.
