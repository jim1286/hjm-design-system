# 버튼에서 이어지는 편집

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-07
- 근거: `showcase/web/src/patterns/origin-dialog-preview.tsx`, `showcase/native/src/origin-dialog-preview.tsx`
- 스토리북: `배포/구성/입력과 작성/버튼에서 이어지는 편집`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

## 언제 쓰나

현재 화면의 항목을 짧게 편집하고 돌아올 때 출발 위치를 시각적으로 연결한다. 별도 상태
엔진 없이 Dialog의 선택적 motionOrigin과 제품 소유 초안을 사용한다. 원본의 닫기 후
초점·초안 손실을 그대로 가져오지 않기 위한 구성이다. 긴 편집은 전용 화면을 사용한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Button | 측정할 열기 버튼과 저장 | [버튼](../components/button.md) |
| Popover | Web에서 페이지를 계속 볼 수 있는 비모달 편집 변형 | [팝오버](../components/popover.md) |
| Dialog | 기존 모달 상태·닫기·초점 복귀와 선택적인 공간 전환 | [대화상자](../components/dialog.md) |
| TextField | 제품 상태에 보존하는 초안 | [필드](../components/field.md) |
| Text | 확정한 결과 표시 | [텍스트](../components/text.md) |

## 배치

```text
[안내]
[메모 편집] ──→ [여행 메모             닫기]
[저장 결과]       [메모 입력]
                 [저장]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 원래 화면 | gap lg=20px |
| 진행 중 | Dialog | 기본 overlay 중앙 | 기본 Dialog recipe |
| 입력 | TextField | Dialog 본문 | 공통 Field 크기·간격 |
| 확정 | Button | Web footer / Native primaryAction | 공통 Dialog 행동 영역 |

## 흐름과 상태

1. 열기 직전에 트리거를 실제 viewport/window 좌표로 측정한다. 측정 불가 시 일반 Dialog를 연다.
2. 제품이 open·draft·saved를 각각 소유한다. 저장 전 닫기는 draft를 지우지 않는다.
3. 저장 시 draft를 결과로 확정하고 닫는다. 실패 체험을 예약하면 첫 저장만 실패하고
   오류·초안을 유지한다. 다시 저장은 성공한다. 실제 서버가 있으면 busy와 확정 응답을 연결한다.
4. 닫기 전환이 끝난 뒤 트리거로 초점을 돌린다. 빠른 재열기는 이전 종료 결과를 무시한다.
5. 모션 감소·잘못된 측정에서는 공간 전환을 생략한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 열기 버튼과 마지막 저장 결과 | draft 유지 |
| 진행 중 | 제목·닫기·입력·저장 | 제품 상태로 갱신 |
| 결과 | 결과 갱신 후 닫기 | 트리거로 복귀 |
| 실패 | 오류 설명·입력·다시 저장 | 오류 알림, 초안 유지 |
| 측정 없음 | 일반 Dialog | 같음 |

## 코드 골격

```tsx
// Web: origin은 trigger.getBoundingClientRect()의 측정값
<Dialog open={open} onOpenChange={setOpen} title={title} closeLabel={closeLabel}
  motionOrigin={origin} returnFocusRef={triggerRef} footer={saveButton}>
  <TextField label={label} value={draft} onValueChange={setDraft} />
</Dialog>
```

```tsx
// Native: origin은 trigger.measureInWindow 콜백의 측정값
<Dialog open={open} onOpenChange={setOpen} title={title} closeLabel={closeLabel}
  motionOrigin={origin} returnFocusRef={triggerRef} primaryAction={saveAction}>
  <TextField label={label} value={draft} onValueChange={setDraft} />
</Dialog>
```

문구·초안·저장 로직·트리거 측정은 제품 소유다. Showcase를 앱에서 import하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 원점 | getBoundingClientRect | measureInWindow |
| 전환 | WAAPI, 종료까지 한 subtree 유지 | 실제 modal 측정 + 기존 Animated progress |
| 모션 감소 | 공간 전환 없음 | 공간 전환 없음, 기존 opacity |
| 닫기 | Escape·바깥·닫기 | Back·바깥·닫기 |

키보드·회전·스크롤에 의한 목적지 변화, 실제 기기와 제품 테마 비교는 승격 전 검증한다.


### Web의 페이지 안에서 편집 변형

`Contextual`·`ContextualDark`·`ContextualLargeText`는 기존 Popover의 선택적인 `motionOrigin`을
사용한다. 기본 360px 표면이 버튼 아래 8px 간격으로 열리고 viewport 충돌에 따라 배치가 바뀐다.
본문은 Stack gap md=16px 안에 오류 → TextField → 저장 순서다. Native는 모달 편집 변형을 쓴다.

```tsx
<Popover title={title} closeLabel={closeLabel} motionOrigin={origin}
  trigger={<Button ref={triggerRef} onClick={() => setOrigin(triggerRef.current?.getBoundingClientRect())}>{openLabel}</Button>}>
  {({ close }) => <Editor draft={draft} onDraftChange={setDraft} onSave={() => save(draft).then(close)} />}
</Popover>
```

비모달에서는 Escape/닫기 직후 기존 규칙대로 초점을 복귀한다. 바깥 클릭이나 Tab으로 이동한
초점은 되가져오지 않는다. 저장 실패는 초안·열림을 유지하고, 닫았다 다시 열어도 제품 draft는 남는다.
