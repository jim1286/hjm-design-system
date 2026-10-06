# 입력 시트

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Sheet 입력 화면과 가용 영역](../../sheet.md), `showcase/web/src/patterns/InputSheet.stories.tsx`, `showcase/native/src/InputSheet.stories.tsx`, `src/component-recipes.ts`(`sheetRecipe`), `packages/react/src/styles.css`(`.hjm-sheet`), `packages/react-native/src/overlays.tsx`(`Sheet`)
- 스토리북: `배포/구성/입력과 작성/입력 시트`

## 언제 쓰나

현재 화면 위에 하단 시트를 띄워 짧은 입력(이름 바꾸기, 메모 한 줄)을 받고, 키보드가 올라와도 본문을 스크롤하며
완료 버튼에 닿게 할 때 쓴다. 완료 버튼은 스크롤 밖 `footer`에 고정된다. 입력 칸이 많아 화면 하나를 차지하면
시트 대신 화면으로 이동하고 [KeyboardFormScrollView](../components/keyboard-form-scroll-view.md)·[BottomCTA](../components/bottom-cta.md)를 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Button`(트리거) | 시트를 연다 | [Button](../components/button.md) |
| `Sheet` | 하단 모달. `title`·`closeLabel` 필수, Native는 `keyboardAvoidance`·`scrollable`·`safeAreaInsets` | [Sheet](../components/sheet.md) |
| `TextField` | 입력 칸 | [Field](../components/field.md) |
| 본문 `Text` | 입력 아래 설명(스토리는 스크롤 확인용 8줄) | [Text](../components/text.md) |
| `Notice`(실패 시) | 저장 실패를 본문 맨 위에 남긴다. 제품이 더한다(스토리에는 없다) | [Notice](../components/notice.md) |
| `Button`(footer) | 완료(시트의 주 행동). 스크롤 밖에 고정 | [Button](../components/button.md) |

## 배치

```text
Native(하단 시트, 키보드 올라옴)              Web(하단 시트)
┌ 화면 + backdrop ───────────────┐          ┌ 화면 + backdrop ──────────────────┐
│                                │          │      ┌ 폭 min(640, 100%) ───────┐ │
│  ↑ 상단 안전 영역 밖까지만     │          │      │ 기록 이름            [×] │ │ header: lg 20, gap md 16
├────────────────────────────────┤ 위 모서리 │      │ ┌ body(스크롤) ────────┐ │ │
│ 기록 이름                 [×]  │ radius   │      │ │ 이름 [            ]  │ │ │ body padding lg 20
│ ┌ 본문(ScrollView) ──────────┐ │ xl 24    │      │ │ 설명 …               │ │ │
│ │ 이름                       │ │          │      │ └──────────────────────┘ │ │
│ │ [                       ]  │ │          │      │                  [ 완료 ]│ │ footer 오른쪽 정렬
│ │ 설명 … (스크롤)            │ │          │      │  + 하단 안전 영역        │ │
│ └────────────────────────────┘ │          └──────┴──────────────────────────┴─┘
│ [           완료           ]   │ ← footer 고정
├────────────────────────────────┤
│ ███████ 키보드 ███████████████ │ ← 시트가 키보드 위로 올라감(하단 inset 0)
└────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 시트 안: `Sheet`(Modal)가 backdrop·본문 스크롤(Native `scrollable`)·키보드(Native `keyboardAvoidance`)·안전 영역을 소유. 트리거: 제품 화면의 바깥 틀(Web 문서 스크롤 > `Container`, Native `ScrollView` > `Container`) | 시트는 화면 위 오버레이, 트리거는 화면 본문 | 시트 안 여백은 아래 행들(Sheet 소유, 제품이 inset·키보드 여백을 다시 더하지 않는다). 트리거 화면 좌우는 `Container gutter` 폭 600 미만 `compact` 16 · 이상 `regular` 20([화면 여백](../tokens/layout.md)) |
| 시트 틀 | `Sheet` placement `bottom` | 화면 하단에 붙고 위 모서리만 둥글다 | radius `xl` 24, 최대 높이 `maxHeightRatio` 0.9(뷰포트의 90%), Web 최대 폭 640 |
| 머리 | 제목 + 닫기 IconButton | 시트 맨 위, 고정 | Native 최소 높이 `control.minTouchTarget` 44·좌우 `spacing.lg` 20(+좌우 inset)·위 `spacing.sm` 12. Web padding `spacing.lg` 20(아래 0), 제목–닫기 `spacing.md` 16 |
| 실패 알림 | `Notice tone="danger"` | 본문 맨 위(입력 위), 실패했을 때만, 스크롤 | 본문 항목 사이 `spacing.md` 16 |
| 본문 | `TextField` + 설명 | 머리 아래, **스크롤** | 항목 사이 `sheetRecipe.body.gap` `spacing.md` 16. Web body padding `spacing.lg` 20 |
| 완료 | footer `Button`(primary) | 본문 아래, **고정**(스크롤 밖) | 높이 `medium` 44. Native 위 `spacing.sm` 12, footer 세로 열이라 꽉 찬 폭(`fullWidth` 불필요). Web 오른쪽 정렬, 버튼 사이 `spacing.sm` 12, padding 0 `spacing.lg` 20 `spacing.lg` 20 |
| 하단 안전 영역 | Sheet가 처리 | 시트 맨 아래 | Native 아래 `spacing.sm` 12 + bottom inset(키보드가 붙어 있으면 inset 0, 대신 키보드 높이만큼 올라감). Web footer 아래 `spacing.lg` 20 + `env(safe-area-inset-bottom)` |

- 주 행동(완료)은 footer 하나다. 취소는 머리의 닫기 버튼이 맡는다. 버튼을 둘 두면 [Sheet 배치](../components/sheet.md#배치)에 따라 Web 가로 footer는 보조 → 주, Native 세로 footer는 주 → 보조 순서다.
- 저장·완료는 본문이 아니라 `footer`에 둔다([Sheet](../components/sheet.md)). 시트는 모달이라 뒤 화면의 primary와 같은 화면으로 세지 않는다.
- 시트가 위로 커질 수 있는 한계는 상단 안전 영역 아래까지다(Native는 `insets.top`을 가용 높이에서 뺀다).

## 흐름과 상태

1. 트리거 버튼을 누르면 시트가 아래에서 올라온다.
2. 입력 칸을 누르면 키보드가 올라오고 Native 시트는 키보드 위로 올라간다. 본문은 스크롤되고 완료 버튼은 계속 보인다.
3. 완료를 누르면 저장한다. 저장 중에는 footer 버튼 `loading` + Sheet `busy`로 닫기를 막는다.
4. 성공하면 `open`을 `false`로 바꾼다. 닫기 버튼·backdrop·Escape(Web)·Android back으로도 닫힌다(저장 중 제외).
5. 실패(네트워크·서버 오류)하면 시트를 닫지 않고 입력을 그대로 둔 채 본문 맨 위에 실패 Notice를 보인다. 완료를 다시 누르면
   다시 저장한다. 재시도도 실패하면 Notice가 남고 같은 상태가 반복된다. 입력 값 자체의 오류는 Notice 대신 `TextField`의 `error`다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 트리거에서 열면 하단 시트 + backdrop. 비어 있거나 공백뿐인 입력은 완료 disabled, 유효한 값이면 사용 가능 | 시트가 모달 dialog로 알려진다. Web은 focus trap, 닫히면 트리거로 돌아감 |
| 진행 중 | 저장 중. footer 버튼 `loading`(라벨 자리 유지) + Sheet `busy`로 닫기 버튼·backdrop·Escape·back 닫기 막음 | 포커스는 완료 버튼에 유지 |
| 실패 | 시트 열린 채 입력 유지, 본문 맨 위 `Notice tone="danger"`(`t("record.saveFailed")`), 완료 버튼 다시 사용 가능 | Web Notice `danger`는 `role="alert"`로 알림. Native는 `announcement="assertive"`를 줘야 알린다. 포커스 이동 없음 |
| 재시도 실패 | 실패와 같다. Notice는 한 개만 유지(겹쳐 쌓지 않음) | 진행 중 → 실패로 다시 나타나므로 다시 알림 |
| 키보드 올라옴(Native) | 시트 하단이 키보드 위, 하단 inset 0, 본문 스크롤 | 본문 탭을 놓치지 않음(`keyboardShouldPersistTaps="handled"`), iOS는 끌어서 키보드 내림 |
| 내용이 김 | 본문만 스크롤, 머리·footer 고정 | — |
| 큰 글자(Web `LargeText`, mobile1 viewport) | 본문이 더 길게 스크롤, footer는 그대로 보임 | — |

- 실패 문구는 제품이 지역화한다. raw exception을 그대로 보이지 않는다.
- 저장 상태를 [저장과 재시도](action-recovery-save.md)의 세션이나 제품 mutation으로 이미 갖고 있으면 그 상태에서 `saving`·`failed`를 읽는다.

## 코드 골격

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { Notice } from "@hjmds/react/feedback";
import { TextField } from "@hjmds/react/forms";
import { Sheet } from "@hjmds/react/overlays";

<>
  <Button onClick={() => setOpen(true)}>{t("record.rename")}</Button>
  <Sheet open={open} onOpenChange={setOpen} title={t("record.nameTitle")} closeLabel={t("common.close")}
    busy={saving}
    footer={<Button loading={saving} disabled={!name.trim()} onClick={save}>{t("common.done")}</Button>}>
    {failed && <Notice tone="danger" title={t("record.saveFailed")} />}
    <TextField label={t("record.name")} value={name} onValueChange={setName} />
  </Sheet>
</>
```

```tsx
// Native
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@hjmds/react-native/actions";
import { Notice } from "@hjmds/react-native/feedback";
import { TextField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";

const insets = useSafeAreaInsets();

<>
  <Button onPress={() => setOpen(true)}>{t("record.rename")}</Button>
  <Sheet open={open} onOpenChange={setOpen} title={t("record.nameTitle")} closeLabel={t("common.close")}
    keyboardAvoidance scrollable safeAreaInsets={insets} busy={saving}
    footer={<Button loading={saving} disabled={!name.trim()} onPress={save}>{t("common.done")}</Button>}>
    {failed ? <Notice tone="danger" announcement="assertive" title={t("record.saveFailed")} /> : null}
    <TextField label={t("record.name")} value={name} onValueChange={setName} />
  </Sheet>
</>
```

`save`는 `saving`을 켜고 저장한 뒤 성공이면 `setOpen(false)`, 실패면 `failed`를 켜고 시트를 연 채 둔다(다음 저장 시작 때 끈다).
스토리의 설명 8줄은 스크롤 확인용 데모다. `busy`·`loading`·실패 Notice는 저장이 비동기일 때 제품이 더한다(스토리에는 없다).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 키보드 | 브라우저가 처리, CSS body 스크롤 | `keyboardAvoidance`로 키보드 높이만큼 올림 |
| 스크롤 | body가 항상 `overflow: auto` | `scrollable`을 켜야 ScrollView가 생긴다(가상화 목록이면 끈다) |
| 안전 영역 | `env(safe-area-inset-*)` | `safeAreaInsets` prop(기본은 provider inset) |
| 폭 | `min(640px, 100%)` 가운데 | 화면 폭 100% |
| footer 정렬 | 오른쪽 정렬(`justify-content: flex-end`) | 세로 묶음, 위 `spacing.sm` 12 |
| `TextField` 값 | `onValueChange(value)`(Native와 같은 이름). DOM 이벤트가 필요할 때만 `onChange`(둘 다 호출된다) | `onValueChange(value)` |
| 실패 Notice 알림 | `danger`는 항상 `role="alert"` | `announcement`를 줘야 알린다(기본 `none`) |

## 함정

- Native에서 `keyboardAvoidance`만 켜고 `scrollable`을 빼면 본문이 ScrollView가 아니라서 키보드 위로 줄어든 공간에서 넘친 내용에 닿을 수 없다. 입력 시트는 둘을 같이 켠다.
- 제품에서 키보드 listener·`maxHeight`·중첩 ScrollView를 다시 만들지 않는다. 키보드 여백은 Sheet의 Modal이 소유하고 내부 ScrollView는 `automaticallyAdjustKeyboardInsets={false}`로 두 번 더하지 않게 돼 있다.
- 완료 버튼을 본문 끝에 두면 키보드에 가려진다. `footer`에 둔다.
- 저장 실패에 시트를 닫고 Toast만 띄우면 입력이 사라진다. 시트를 연 채 Notice로 남긴다.
- 현재 스토리 문구는 i18n 키가 없는 한국어 리터럴이고, 완료가 저장 없이 바로 닫는다. 제품은 키로 넣고 위 진행 중·실패 상태를 더한다.

- 2026-10-06 독립 재구현에서 기본 상태 표의 “완료 가능”과 코드의 빈 값 disabled가 충돌해 표를 수정했다. 닫기 후 초안 유지·폐기는 제품 정책이며, 저장 성공 전 초안을 잃지 않는 원칙을 유지한다.
