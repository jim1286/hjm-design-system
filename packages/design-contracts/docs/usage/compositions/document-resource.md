# 문서와 파일

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.13.1 이후)
- 검토일: 2026-10-07
- 근거: [파일 원본 대조](../../../../../docs/qa/2026-10-07-file-reference.md), `src/document-resource.ts`
- 스토리북: `실험/구성/정보 표시/문서와 파일`

## 언제 쓰나

이름·형식·크기와 미리보기·내보내기·별도 메뉴를 함께 제공하는 문서에 쓴다.
단순 다운로드 링크는 Link, 업로드 진행은 UploadItem을 사용한다. 파일 읽기·저장·권한·공유와
성공 영수증은 제품이 소유한다. DocumentResource는 controlled 상태의 배치와 버튼을 소유한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| DocumentResource | metadata·상태·독립 행동 구성 | 이 문서 |
| Surface/Stack | 바깥 틀·세로 배치 | [Surface](../components/surface.md), [Stack](../components/stack.md) |
| Text | 파일명·형식·크기·오류 | [Text](../components/text.md) |
| Button | 미리보기·저장·재시도 | [Button](../components/button.md) |

## 배치

```text
┌────────────────────────────┐
│ 파일명                     │
│ 형식 / 크기(각 별도 줄)    │
│ 설명                       │
│ 미리보기 또는 상태 안내    │
│ [본문 보기]                │
│ [미리보기 재시도] — 오류 시 │
│ [저장 / 재시도]            │
│ 저장 상태·오류             │
│ moreAction(선택)           │
└────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Surface | 제품 목록/상세 안 | padding md, radius lg |
| 모든 영역 | Stack | 위→아래 | gap sm, spacing.sm 12 |
| 파일명 | Text | 최상단 | strong, heading 역할을 자동 부여하지 않음 |
| 형식·크기 | Text | 이름 아래 | caption/muted, 제품 문자열 그대로 |
| 행동 | Button | 미리보기 아래 | 세로 배치, Native growWithContent |

파일명은 줄바꿈한다. 미리보기 크기와 내용은 제품 host가 공급하며, 카드 전체를 링크/버튼으로
감싸지 않는다. `moreAction`도 독립 행동이다. 상위 화면이 스크롤을 소유한다.

Web에서 초점을 가진 미리보기 재시도 버튼이 제거되면 같은 문서의 사용 가능한 미리보기
버튼으로 복귀하며, 없으면 저장 버튼으로 옮긴다. 2026-10-07 실제 브라우저에서 제거된 버튼의
초점이 body로 떨어진 회귀에 따른 규칙이다. 제품이 다른 문서로 바꾸거나 사용자가 이미 다른
요소에 초점을 둔 경우에는 자동 이동하지 않는다. Native 스크린리더 복구는 별도 검증 대상이다.

## 흐름과 상태

1. 양 renderer의 `/document-resource`에서 DocumentResource를 import한다. root export는 없다.
2. descriptor id는 파일 revision을 구분한다. name 필수, formatLabel/sizeLabel/description은 선택이다.
3. preview는 none/loading/ready/error이며 error에는 message와 retryable을 준다. retryable이면
   onRetryPreview도 필수다. ready일 때만 preview 노드를 표시한다. onPreview는 선택이다.
4. save는 idle/pending/started/saved/cancelled/error다. error의 retryable이 true이면 onRetrySave가
   필수이고 false면 일반 저장 버튼으로 우회하지 않는다. 새 시도 허용은 제품의 상태 판단이다.
5. labels의 열 문구를 모두 현지화한다. 비어 있는 문구·잘못된 상태는 TypeError다.
6. onSave/onRetrySave는 제품 action-session에 연결한다. 중복 실행은 session이 막으며 파일 교체·
   unmount에서 reset으로 이전 결과를 분리한다. reset은 실제 OS/서버 작업 취소가 아니다.
7. 브라우저 anchor 시작이나 Native 공유 sheet 완료만으로 saved를 넣지 않는다. 실제 host가
   확인한 저장 결과만 saved다. 예제 Web은 Blob 다운로드 시작, Native는 텍스트 공유 예제다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | metadata·각 버튼 | 자동 초점 없음 |
| 진행 중 | 저장 버튼 pending/loading | 같은 버튼 위치 유지, 제품 세션이 재실행 차단 |
| 실패 | 해당 오류·허용된 재시도 | 미리보기 실패가 저장을 자동으로 막지 않음 |
| 시작/완료/취소 | 각각 다른 상태 문구 | Web status, Native live region; iOS 실제 알림 검증 대기 |
| 비활성 | 기본·재시도 행동 비활성 | 제품 moreAction도 같은 정책을 공급해야 함 |

## 코드 골격

```tsx
// Web
import { DocumentResource } from "@hjmds/react/document-resource";
<DocumentResource descriptor={documentState} labels={localizedLabels}
  preview={previewHost} onPreview={openPreview} onSave={startExport}
  onRetryPreview={retryPreview} onRetrySave={retryExport} />;
```

```tsx
// Native
import { DocumentResource } from "@hjmds/react-native/document-resource";
<DocumentResource descriptor={documentState} labels={localizedLabels}
  preview={previewHost} onPreview={openPreview} onSave={startExport}
  onRetryPreview={retryPreview} onRetrySave={retryExport} />;
```

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 바깥 의미 | group + 파일명 | accessible=false로 자식 조작 유지 |
| 내보내기 host | anchor/download, 파일 API 등 제품 선택 | OS 저장·공유·권한 adapter를 제품이 공급 |
| pending/error 알림 | status/alert | live region/alert, iOS 기기 낭독 미검증 |

## 함정

Showcase의 첫 실패는 합성 fixture이며 운영 서버 실패가 아니다. Native 텍스트 공유는 파일 저장
검증을 대신하지 않는다. HJM이 제품의 실패를 저장 성공으로 해석하지 않도록 action-session의
success와 host 결과 started/saved/cancelled를 따로 연결한다. 제품 metadata에 URL·서버 오류 원문을
자동 노출하지 않는다. 아직 실험이며 전체 환경 검증·승격·npm 게시·소비 적용은 별도다.
