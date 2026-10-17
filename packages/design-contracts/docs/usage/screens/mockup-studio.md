# 목업 편집

- 단계: 화면
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-17
- 근거: `showcase/web/src/foundations/MockupStudio.stories.tsx`, `src/responsive.ts`(`resolveWindowClass`), `showcase/web/src/studio/MockupStudio.tsx`, `showcase/web/src/studio/SceneTimeline.tsx`, `showcase/shared/mockup-scene.ts`, `showcase/shared/scene-timeline.ts`
- 스토리북: `배포/화면/화면 틀과 도구/목업 편집`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 화면 API가 없는 제품 콘텐츠는 `ScreenLayout`의 본문에 HJM 구성을 연결한다.

## 목적

제품 화면 캡처를 휴대폰·브라우저 프레임에 넣어 스토어·소개용 이미지(PNG)와 짧은 장면 영상을 만드는 Web 전용 작업 도구 화면이다.
`MockupStudio`는 showcase 안의 도구이며 `@hjmds/react`의 공개 API가 아니다 — 제품은 이 컴포넌트를 가져다 쓰지 않는다.
소비자가 이 지침에서 가져갈 것은 두 가지다. (1) 도구 자체: Storybook에서 열어 제품 캡처로 목업을 만든다.
(2) 배치: "큰 미리보기 + 긴 설정 목록 + 마지막 내보내기 줄"로 된 편집기 화면을 HJM 컴포넌트로 짜는 예.
Native 스토리는 없다(장면 작성은 Web showcase에 둔다는 통합 계획, `component-stories.test.ts`).

## 영역 구조

```text
한 열, 문서 스크롤(넓은 폭도 같음) — main > Container content(좌우 gutter: 폭<600 compact 16 · 이상 20) > Stack gap xl 24
고정 영역 없음 · 안전 영역은 브라우저 · 키보드는 브라우저가 입력으로 스크롤
┌──────────────────────────────────────────┐
│ ① 제목 Heading level3 · semanticLevel 1   │  Stack gap sm 12
│    + 설명 Text p                          │
│ ┌ ② 미리보기 Surface padding md 16 ─────┐ │
│ │ <canvas role="img">  폭 100%,          │ │  최대 높이 70vh, contain
│ │   출력 1080×1440 / 1080×1080 / 1440×900│ │
│ └──────────────────────────────────────┘ │
│ ③ "출력 1080 × 1440 · …" (muted)          │
│ ④ 파일 입력 2개: 화면 캡처 / 장면 설정 불러오기│
│ ⑤ 상태 문구 (role=status) · 실패면 Notice danger │
│ ⑥ 장면 타임라인 (Stack gap md 16)          │
│    제목 Heading level3 · semanticLevel 2   │
│    Slider 재생 위치 / "0.00 / 3.00초 · 30fps"│
│    [재생] [처음으로]                       │  secondary · ghost
│    움직임 [천천히 떠오르기|화면 등장]       │  SegmentedControl
│    길이 [3초|6초|9초] · 초당 프레임 [24|30] │  SegmentedControl
│    [현재 장면을 포스터로] [포스터 PNG 저장] │  secondary
│    [영상 내보내기] ([출력 취소])            │  secondary · ghost(진행 중만)
│    상태 문구 / 안내                        │
│ ⑦ TextField 제목(≤80) · 설명(≤120)         │
│ ⑧ 선택 묶음: 각 "제목(strong) + 세그먼트"   │
│    출력 비율 [세로|정사각형|가로]  세그먼트 │
│    프레임 [휴대폰|브라우저]        세그먼트 │
│    배경 [새벽|잉크|민트]           세그먼트 │
│    각도 [-12°|-6°|0°|6°|12°]       세그먼트 │
│    여백 [좁게|보통|넓게]           세그먼트 │
│    그림자                    [  ●] Switch  │
│ ⑨ TextField 화면 출처 · 허용 사용 범위      │
│ ⑩ [PNG 내보내기] [장면 설정 저장] [초기화]  │  ← 주 행동 줄(맨 아래)
│     primary        secondary      ghost     │
│ ⑪ 개인정보·출처 안내 (muted)               │
└──────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | `main` > `Container size="content" gutter={gutter}` > `Stack gap="xl"` | 화면 전체, 문서 스크롤. 고정 영역 없음 | 최대 폭 1200(`layout.contentMaxWidth`), 좌우 gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20(`resolveWindowClass`), 직계 요소 사이 `spacing.xl` 24. 안전 영역·키보드는 브라우저가 맡는다(문서 스크롤) |
| ① 제목 | Stack `gap="sm"` > Heading `level="level3"` `semanticLevel={1}` · Text `as="p"` | 맨 위 | 사이 `spacing.sm` 12 |
| ② 미리보기 | Surface `padding="md"` > `canvas`(`role="img"`, `aria-label`=제목 + 프레임) | 제목 아래, 스크롤과 함께 움직임 | 안쪽 `spacing.md` 16, 폭 100%, 최대 높이 70vh |
| ③~⑤ 출력·파일·상태 | Text muted · `<input type="file">` ×2(제품은 FilePicker) · Text `role="status"`, 실패면 그 자리에 Notice `tone="danger"` | 미리보기 아래 | 사이 24 |
| ⑥ 타임라인 | Stack `gap="md"` > Heading `level="level3"` `semanticLevel={2}` · Slider · Button 줄 · 설정 선택(움직임·길이·초당 프레임 SegmentedControl) | 상태 아래 | 사이 `spacing.md` 16, 버튼 줄 `Stack axis="inline" wrap gap="sm"` 12 |
| ⑦⑨ 텍스트 입력 | TextField ×4 | 타임라인 아래·선택 묶음 아래 | 높이 44(`control.fieldHeight`) |
| ⑧ 선택 묶음 | Stack `gap="xs"` > Text `emphasis="strong"`(보이는 제목) + SegmentedControl(`label` = 같은 제목), 그림자는 Switch `presentation="row"` | 텍스트 입력 사이 | 제목과 컨트롤 사이 `spacing.xs` 8, 묶음 사이 24. SegmentedControl 항목 최소 44 |
| ⑩ 내보내기 줄 | Stack `axis="inline" wrap gap="sm"` > Button ×3 | 설정 목록 맨 아래 | 사이 12 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| PNG 내보내기(주 행동) | Button 기본 primary | ⑩ 줄 첫째 | 1. 이미지 없음·불러오는 중이면 `disabled`, 내보내는 중이면 `loading` |
| 장면 설정 저장 | Button `secondary` | ⑩ 둘째 | 1. JSON 파일 내려받기 |
| 초기화 | Button `ghost` | ⑩ 셋째(끝) | 1. 확인 없이 모든 설정·이미지를 버린다 |
| 재생·일시 정지 | Button `secondary` | ⑥ 슬라이더 아래 첫째 | 1. 이미지 없음·모션 줄이기·영상 출력 중이면 `disabled` |
| 영상 내보내기 | Button `secondary` + 진행 중 `출력 취소` ghost | ⑥ 아래쪽 | 1(+1). 영상 버튼 아래 `role="progressbar"`에 실제 진행률 0–100% 표시 |
| 실패 후 다시 시도 | Notice `action` > Button `tone="secondary" size="small"` | ⑤ 실패 Notice 안 | 내보내기 실패일 때만 1. 파일 읽기 실패는 다른 파일을 고르는 것이 복구라 버튼을 두지 않는다 |
| 설정 고르기 | SegmentedControl(출력 비율·프레임·배경·각도·여백·움직임·길이·초당 프레임) · Switch(그림자) | ⑥⑧ 각 묶음 | 묶음마다 선택지 2~5. 불러온 장면의 각도·여백이 선택지에 없으면 그 값을 항목으로 더해 현재 장면을 그대로 보인다 |
| 파일 고르기 | `<input type="file">`(PNG·JPEG·WebP / JSON) | ④ | 2 |

주 행동은 PNG 내보내기 하나다. 재생·영상 내보내기는 `secondary`로 둔다. 설정은 하나 고르기·켜고 끄기라 [선택 조립 규칙](../SELECTION.md#조립-규칙필수)대로
SegmentedControl·Switch를 쓴다. 내보내기 줄은 맨 아래 흐름 배치라 긴 설정을 지나야 닿는다.
제품 편집기에서 주 행동을 늘 보이게 하려면 [BottomCTA](../components/bottom-cta.md) `position="sticky"`로 옮긴다.

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 빈 프레임 미리보기, 상태 "스크린샷을 선택해 시작하세요.", PNG·재생·영상 비활성 | 화면 캡처 선택 |
| 로딩 | 상태 "스크린샷을 여는 중이에요.", PNG 비활성 | 기다림 |
| 빈 | 기본과 같다(이미지 없음). 장면 JSON만 불러오면 이미지가 비워지고 "파일을 다시 선택해 주세요" | 같은 캡처 다시 선택 |
| 오류 | 아래는 제품 편집기의 복구 규칙이며 현재 도구의 영상·포스터는 SceneTimeline 상태 표시를 따른다. 네트워크·서버 요청이 없다(브라우저 안에서만 처리). ⑤ 자리에 [Notice](../components/notice.md) `tone="danger"`. 이미지 읽기 실패(형식 PNG·JPEG·WebP 밖·20MB·16384px 초과): 이전 이미지·설정 유지. 장면 JSON 실패(64KB 초과·형식 오류): 현재 장면 유지. PNG 내보내기 실패: Notice `action` 다시 시도. 포스터 실패: 타임라인 상태 문구와 기존 포스터 버튼으로 재시도, `loading` 해제. 영상: 인코더 미지원·실패면 PNG 대안 안내, 사용자가 취소하면 오류가 아니라 상태 문구. 다시 시도가 또 실패하면 같은 Notice가 같은 자리에 남는다 | 다른 파일 선택 / 다시 시도 / PNG 저장 |
| 불러옴 | 상태 "파일명 · 가로 × 세로 화면을 불러왔어요.", 미리보기에 그려짐 | 편집·내보내기 |
| 영상 출력 중 | 진행률(0–100%)과 [출력 취소] 등장. 다른 탭으로 가거나 장면·이미지가 바뀌면 이전 출력 취소 | 취소 |
| 모션 줄이기 | 재생 비활성, 안내 문구. 슬라이더로 정지 장면 확인 | 슬라이더 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [Stack](../components/stack.md) | 바깥 리듬, 버튼 줄 |
| [Surface](../components/surface.md) | ② 미리보기 틀 |
| [Heading](../components/heading.md) | ① 화면 제목, ⑥ 타임라인 제목 |
| [Text](../components/text.md) | 설명·라벨·상태·안내 |
| [Notice](../components/notice.md) | 읽기·내보내기 실패 |
| [Container](../components/container.md) | 바깥 폭·좌우 여백 |
| [Button](../components/button.md) | 모든 선택·실행 |
| [Field](../components/field.md) | 제목·설명·출처·사용 범위 `TextField` |
| [Slider](../components/slider.md) | 재생 위치 |
| [FilePicker](../components/file-picker.md) | 제품에서 `<input type="file">` 대신 |
| [BottomCTA](../components/bottom-cta.md) | 제품 편집기의 고정 내보내기 줄 |
| [화면 여백과 너비](../tokens/layout.md) | gutter·`layout.contentMaxWidth` |
| [간격](../tokens/spacing.md) | `spacing.sm`·`md`·`xl` |

### 도구와 제품 편집기의 상태 경계

이미지·장면을 다시 불러올 때 현재 미리보기와 편집 입력을 지우지 않는다. 처음부터 이미지가 없는 빈 상태만
미리보기 영역 중앙에 표시하고, 파일 교체 실패는 이전 이미지·장면을 유지한 채 그 영역의 Notice로 설명한다.
내보내기는 클릭 시점의 scene/image snapshot을 사용한다. 내보낸 파일과 이후 편집 상태를 구분하고
완료 전 다운로드 성공을 표시하지 않는다. 장면 JSON에는 원본 이미지를 포함하지 않는다.

## 코드 골격

도구를 다시 만들 필요는 없다. 아래는 같은 편집기 배치를 제품에서 짤 때의 뼈대다. 상태 문구는 상태→키 표로 고르고 파일 이름·크기는 보간 값으로 넘긴다.

```tsx
// Web
import { Container, Stack, Surface, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Notice } from "@hjmds/react/feedback";
import { SegmentedControl, Switch } from "@hjmds/react/selection";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

// 상태→키 표. 보간이 필요한 문구는 값으로 넘긴다.
const statusKey = {
  idle: "editor.status.idle",
  loading: "editor.status.loading",
  loaded: "editor.status.loaded",
  imageFailed: "editor.error.image",
  sceneFailed: "editor.error.scene",
  exported: "editor.status.exported",
  exportFailed: "editor.error.export",
} as const;
const failed = status === "imageFailed" || status === "sceneFailed" || status === "exportFailed";
const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";

<main><Container size="content" gutter={gutter}><Stack gap="xl">
  <Stack gap="sm">
    <Heading level="level3" semanticLevel={1}>{t("editor.title")}</Heading>
    <Text as="p">{t("editor.intro")}</Text>
  </Stack>
  <Surface padding="md">{/* 미리보기: canvas/img, role="img", aria-label */}</Surface>
  {failed ? <Notice tone="danger" title={t(statusKey[status])}
    {...(status === "exportFailed" ? { action: <Button tone="secondary" size="small" onClick={exportPng}>{t("common.retry")}</Button> } : {})} />
    : <Text role="status">{t(statusKey[status], file ? { name: file.name, width: file.width, height: file.height } : {})}</Text>}
  <Stack gap="md">
    <Heading level="level3" semanticLevel={2}>{t("editor.timeline")}</Heading>
    <Stack axis="inline" wrap gap="sm">
      <Button tone="secondary" disabled={!ready} onClick={togglePlay}>{playing ? t("editor.pause") : t("editor.play")}</Button>
    </Stack>
  </Stack>
  <TextField label={t("editor.caption")} value={caption} maxLength={80} onValueChange={setCaption} />
  <Stack gap="xs">
    <Text emphasis="strong">{t("editor.format")}</Text>
    <SegmentedControl label={t("editor.format")} items={formats.map(f => ({ value: f.id, label: t(f.labelKey) }))}
      value={format} onValueChange={setFormat} />
  </Stack>
  <Switch presentation="row" label={t("editor.shadow")} checked={shadow} onCheckedChange={setShadow} />
  <Stack axis="inline" wrap gap="sm">
    <Button loading={exporting} disabled={!ready} onClick={exportPng}>{t("editor.export")}</Button>
    <Button tone="secondary" onClick={saveScene}>{t("editor.saveScene")}</Button>
    <Button tone="ghost" onClick={reset}>{t("editor.reset")}</Button>
  </Stack>
</Stack></Container></main>
```

```tsx
// Native
// 없음. 목업 편집은 Web showcase 전용이다.
```

## 다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 다크 | 화면 UI는 테마 토큰. 출력 이미지 배경은 장면 설정(새벽·잉크·민트)이 정하고 테마와 무관하다 |
| 좁은 폭 | 한 열 그대로. 폭 600 미만이면 Container gutter `compact` 16. 미리보기는 폭 100%·최대 70vh로 줄고 파일 입력도 폭 100% |
| 넓은 폭 | 한 열 그대로, Container `content`로 최대 1200. 미리보기 옆에 설정을 두는 두 열 배치는 확인되지 않았다 |

## 함정

- 화면 캡처는 브라우저 밖으로 나가지 않는다. 장면 JSON에는 파일 이름·출처·사용 범위만 저장되므로 다른 사람에게 JSON만 주면 이미지를 다시 골라야 한다.
- PNG는 화면에 보이는 canvas가 아니라 내보낼 때 새로 그린 canvas에서 만든다. 인코딩 중 설정을 바꿔도 결과가 바뀌지 않는다.
- 초기화는 확인 없이 지운다. 제품 편집기에서 되돌리기 어려운 초기화에는 [InlineConfirm](../components/button.md)이나 [AlertDialog](../components/alert-dialog.md)를 둔다.
- 구획 제목은 Heading으로 표시한다.
- 현재 스토리는 이미지·장면 읽기와 PNG 내보내기 실패를 Notice로 표시하고 PNG 실패에는 같은 내보내기 함수를 다시 실행하는 행동을 둔다. PNG 버튼은 `loading`을 사용한다. 상태 문구는 Showcase 소유이며 제품은 위 보간 키 예제로 지역화한다. 타임라인의 영상·포스터 실패 표현은 SceneTimeline이 별도로 소유한다.


### 출력 작업과 편집 수명

PNG·포스터·영상은 각각 작업 식별자와 즉시 잠금을 사용한다. 초기화·파일 선택·언마운트 뒤 늦은 PNG 결과를 버리며, 타임라인의 장면·이미지 변경/언마운트는 진행 중 영상과 포스터 결과를 무효화한다. 사용자가 영상 취소 후 바로 다시 시작해도 이전 진행률·완료가 새 작업에 반영되지 않는다.

주 PNG 내보내기는 시작 시 오프스크린 Canvas에 그린 복사본을 인코딩하므로 제목·비율 편집 중에도 그 출력의 픽셀은 바뀌지 않는다. 재시도 Notice가 사라진 뒤 초점은 완료 시 주 PNG 행동으로 돌아오되, 사용자가 다른 입력이나 빈 영역으로 옮긴 초점은 가져오지 않는다. 타임라인 재생은 부모 callback의 참조가 바뀌어도 기존 시계를 유지한다. 다운로드 안내는 브라우저에 파일 전송을 시작했다는 뜻이며 사용자의 디스크 저장 완료를 판정하지 않는다.

최대 글자와 이를 모사하는 확대 조건은 공통 사용자 지침에 따라 설계·검증에서 제외한다. PNG 픽셀·제어 인코더 회귀를 실제 영상 코덱 품질이나 OS 다운로드 완료 근거로 확대하지 않는다.

## 근거

- 설정에 SegmentedControl·Switch: 2026-10-16 사용자 지적 — 이전 `selected` Button 줄은 선택 상태가 테두리 없는 글자로만 보이고 폭이 제각각이었다.
- 구획 제목 Heading: 2026-10-06 제목 의미 구조를 맞추면서 이전 Text heading 예제를 수정했다.
- 출력 작업 식별자·즉시 잠금·늦은 결과 폐기: 2026-10-13 실행 검수에서 같은 렌더의 연속 클릭이 출력을 중복 시작하고, 초기화·장면 교체 뒤 이전 출력이 새 상태에 결과를 쓰는 경합을 확인했다.
