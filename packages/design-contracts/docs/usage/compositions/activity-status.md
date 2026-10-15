# 백그라운드 작업 상태

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.17.2 이후)
- 검토일: 2026-10-15
- 근거: [ActivityChip 계약](../../activity-chip.md), [Toast 패널](../../toast.md#패널-toast--미게시1172-이후), 양 Showcase `activity-status-preview.tsx`, `showcase/shared/activity-status.ts`
- 스토리북: `배포/구성/피드백과 복구/백그라운드 작업 상태`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 구성 API가 없는 콘텐츠 묶음은 [CompositionLayout](../components/composition-layout.md)의 제목·배지·행동·본문·상태·footer 슬롯을 사용한다.

## 언제 쓰나

사용자가 다른 화면을 보는 동안 계속되는 작업 하나(검수·생성·업로드)의 진행을 헤더의 작은 칩으로 알리고, 칩을 누르면
같은 작업의 패널 Toast가 열려 단계와 결과를 보여 줄 때 쓴다. 2026-10-10 사용자 요청("구성에 칩 누르면 나오게 하자")으로
BurnTok 검수 상태 흐름을 공통 구성으로 만들었다. 작업 상태·문구·마스코트·결과 화면은 제품 소유다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| TopBar | 칩이 놓이는 헤더(`trailing`) | [TopBar](../components/top-bar.md) |
| ActivityChip | 작업 상태 표시 겸 패널 여닫기 | [ActivityChip](../components/activity-chip.md) |
| Toast(패널) | 같은 id로 갱신되는 진행·결과 패널(`media`·`progress`·`action`) | [Toast](../components/toast.md) |
| ToastProvider·ToastRegion | 앱 루트의 알림 층(위쪽 배치 권장) | [Toast](../components/toast.md) |

## 배치

```text
┌ 안전 영역 ────────────────────────────────────────┐
│ [←]  내 작업                     ( (🐥) 다듬는 중 ) │ ← TopBar, trailing에 ActivityChip(높이 44, 최대 폭 180)
├───────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐ │ ← 패널 Toast(placement="top"), 칩을 누르면 열림
│ │ (🐥)  도우미                               [×] │ │
│ │       앱을 다듬고 있어요.                       │ │
│ │       ● 읽기  ◉ 다듬기  ○ 확인                  │ │ ← progress(진행 중)
│ └───────────────────────────────────────────────┘ │
│ 본문(스크롤) — 작업과 무관하게 계속 쓸 수 있다      │
└───────────────────────────────────────────────────┘
끝나면: 칩 ( (🐥) 완료 ) emphasis, 패널은 progress 대신 [결과 보기] action
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 화면 + 앱 루트 ToastProvider/ToastRegion | 칩은 헤더, 패널은 화면 위 떠 있는 층 | Toast 가장자리 `spacing.md` 16 + 안전 영역 |
| 헤더 | TopBar + ActivityChip | `trailing` 첫 자리(제목이 없는 헤더면 빈 가운데 자리) | 칩 높이 44(`control.minTouchTarget`)·최대 폭 180 |
| 패널 | Toast(`media`·`progress`·`action`) | 위쪽 배치 `placement="top"` | 최대 폭 420, 모서리 `radius.xl` 24, media 44 |
| 본문 | 제품 화면 | 헤더 아래 | 패널이 떠 있어도 자리를 차지하지 않는다 |

## 흐름과 상태

1. 작업이 시작되면 헤더에 칩이 나타난다(`label`=진행 문구, `expanded=false`). 작업이 없으면 칩을 렌더하지 않는다.
2. 칩을 누르면 `open=true`가 되고 패널 Toast를 `id` 고정, `durationMs: null`, `media`, `progress`로 `publish`한다.
3. 단계가 바뀌면 같은 `id`로 다시 `publish`한다. 기본 `duplicatePolicy: "update"`라 쌓이지 않고 제자리에서 갱신된다.
4. 칩을 다시 누르면 Web `close(id)` / Native `dismiss(id, "programmatic")`로 닫는다. 닫기 버튼·Escape·스와이프로 닫혀도
   descriptor의 `onDismiss`가 불리므로 거기서 `open=false`로 되돌린다(칩의 `expanded`와 패널이 어긋나지 않게).
5. 작업이 끝나면 칩은 결과 문구 + `emphasis="emphasis"`로 바뀌고, 열린 패널은 `progress` 대신 `tone: "success"`와
   `action`(결과 보기)으로 갱신된다. 패널이 닫혀 있으면 칩은 잠시(예제 4초) 뒤 사라진다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 작업 없음: 칩 없음, 헤더 자리 비어 있음 | — |
| 진행 중 | 칩 `다듬는 중`, 열면 패널에 단계 점과 이름 | 칩은 `expanded`를 말한다. 패널 낭독은 `제목. 설명. 현재 단계` |
| 완료 | 칩 `완료`(brand), 패널은 성공 문구 + 결과 보기 | 갱신된 문구를 다시 낭독한다. action은 문구 아래 시작 쪽 |
| 실패 | 칩 문구를 실패로 바꾸고 패널은 `tone: "danger"` + 다시 시도 action(제품이 연결) | 예제는 실패를 만들지 않는다. 서버 실패 복구는 제품 소유 |

## 코드 골격

```tsx
// Web
import { ActivityChip } from "@hjmds/react/activity-chip";
import { useToast } from "@hjmds/react/toast";
import { TopBar } from "@hjmds/react/top-bar";

function ReviewHeader({ task }: { task: ReviewTask | null }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open || !task) return;
    toast.publish({
      id: "review-status",
      title: t("review.title"),
      description: t(task.done ? "review.done" : "review.running"),
      tone: task.done ? "success" : "neutral",
      durationMs: null,
      media: <img src={mascotUrl} alt="" />,
      ...(task.done
        ? { action: { label: t("review.open"), onAction: openResult } }
        : { progress: { steps: [t("review.read"), t("review.polish"), t("review.check")], current: task.step } }),
      closeLabel: t("common.close"),
      onDismiss: () => setOpen(false),
    });
  }, [open, task, toast]);
  return (
    <TopBar
      title={t("screen.title")}
      trailing={task ? (
        <ActivityChip
          label={t(task.done ? "review.chip.done" : "review.chip.running")}
          emphasis={task.done ? "emphasis" : "default"}
          expanded={open}
          media={<img src={mascotUrl} alt="" />}
          onClick={() => (open ? toast.close("review-status") : setOpen(true))}
        />
      ) : undefined}
    />
  );
}
```

```tsx
// Native
import { Image } from "react-native";
import { ActivityChip } from "@hjmds/react-native/activity-chip";
import { useToastRegion } from "@hjmds/react-native/feedback";
import { TopBar } from "@hjmds/react-native/top-bar";

// 앱 루트: <ToastRegion placement="top" maxVisible={1} layoutStyle={{ flex: 1 }}>…</ToastRegion>
function ReviewHeader({ task }: { task: ReviewTask | null }) {
  const { publish, dismiss } = useToastRegion();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open || !task) return;
    publish(reviewPanel(task, <Image source={mascot} style={{ width: 44, height: 44 }} />, () => setOpen(false)));
  }, [open, task, publish]);
  return (
    <TopBar
      title={t("screen.title")}
      {...(task ? {
        trailing: (
          <ActivityChip
            label={t(task.done ? "review.chip.done" : "review.chip.running")}
            emphasis={task.done ? "emphasis" : "default"}
            expanded={open}
            media={<Image source={mascot} style={{ width: 28, height: 28 }} />}
            onPress={() => (open ? dismiss("review-status", "programmatic") : setOpen(true))}
          />
        ),
      } : {})}
    />
  );
}
```

`reviewPanel`은 Web 예의 descriptor와 같은 모양을 돌려주는 제품 함수다(예제는 `showcase/shared/activity-status.ts`의
`activityStatusDescriptor`).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 알림 층 | `ToastProvider label placement="top"` | `ToastRegion placement="top" maxVisible={1}`, 안전 영역은 제품이 `safeAreaInsets`로 |
| 패널 닫기 | `useToast().close(id)` | `useToastRegion().dismiss(id, "programmatic")` |
| 리퀴드 표현 | 없음(같은 패널 카드) | `presentation: "liquid"` + `presentationAdapter`면 같은 패널 열을 물방울 연출로 연다 |
| 칩 누름 | `onClick` | `onPress` |

## 함정

- 갱신할 때마다 새 `id`를 쓰면 패널이 쌓인다. 작업 하나에 `id` 하나를 고정한다.
- 패널을 닫는 경로가 여럿(칩·닫기·Escape·스와이프)이라 `open` 상태는 `onDismiss`에서만 내린다. 칩 핸들러에서 먼저
  `setOpen(false)`하고 `close`를 부르면 닫히는 동안(closing) 다시 누른 `publish`가 `ignored`(`closing`)로 돌아올 수 있다.
- `media`는 장식이다. 마스코트에 의미가 있으면 그 뜻을 `title`·`description`에 쓴다.
- Native effect는 `useToastRegion()`의 안정적인 `publish` 함수에 의존한다. controller 객체 전체를 의존성에 넣으면
  publish로 controller가 갱신될 때마다 effect가 다시 발행하는 반복 렌더가 생긴다(실제 예제 host에서 재현).
- 결과 보기의 예제 안내는 Web `role="status"`, 공개 `StatusText`로 전달한다.
  Web은 패널이 실제 소유하던 초점 요소가 닫힘으로 제거됐을 때만 칩으로 돌아가고, 완료 칩 자체에 초점이 있을 때 자동 숨김이 일어나면 작업 시작 버튼으로 옮긴다.
  Enter로 결과를 선택해 초점 요소가 제거되면 복구하지만, 포인터 클릭이 버튼에 초점을 두지 않은 경우에는 새 초점을 강제하지 않는다.
  사용자가 외부 컨트롤로 이동하거나 명시적으로 해제한 초점은 유지한다. body 자체를 패널 초점 소유의 근거로 삼지 않는다. 이는 예제의 결과 안내이며 실제 결과 화면 이동은 제품 소유다.
- 현재 스토리는 작업 진행을 타이머로 흉내 낸다. 제품은 자기 작업 이벤트로 단계를 바꾼다.
