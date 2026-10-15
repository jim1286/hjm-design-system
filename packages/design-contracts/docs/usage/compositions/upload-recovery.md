# 선택과 오류 복구

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-15
- 근거: 공개 API를 사용하는 `showcase/*/reference-adoption-previews.tsx`
- 스토리북: `배포/구성/피드백과 복구/선택과 오류 복구`

2026-10-07 사용자 승인으로 승급. [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md).

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 구성 API가 없는 콘텐츠 묶음은 [CompositionLayout](../components/composition-layout.md)의 제목·배지·행동·본문·상태·footer 슬롯을 사용한다.

## 언제 쓰나

파일 선택과 전송 상태의 취소·재시도를 연결할 때 쓴다. 기본 외곽 배치는 CompositionLayout이 제공하고 아래 공개 API가 해당 상호작용을 담당한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| FilePicker · UploadItem · Button | 입력·표현·행동의 역할 분리 | [입력/동작](../components/file-picker.md), [상태/전환](../components/upload-item.md) |

## 배치

```text
[제목 또는 현재 입력]
[상태/내용 영역]
[관련 행동과 결과]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 화면의 본문 흐름 | gap md=16px, 전체 폭 |
| 내용 | 해당 공개 API | 입력과 행동 사이 | 자체 recipe 크기, 줄바꿈 허용 |
| 행동 | Button/기존 컨트롤 | 관련 항목 바로 뒤 | inline일 때 wrap, md=16px |

## 흐름과 상태

1. 선택→중복 제거→전송→성공 또는 실패→취소/재시도
2. 서버 응답·파일 권한·문구·브랜드는 제품이 전달한다. Showcase의 예제 응답과 고정 데이터를 가져오지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 입력과 사용 가능한 행동 | 조작 이름은 제품 언어 |
| 진행 중 | 실제 작업 상태에 맞는 loading 또는 열린 도구 | 중복 요청 차단, 입력 유지 |
| 실패 | 문구와 가능한 재시도 | 원래 입력/파일 유지, 결과 안내 |

## 코드 골격

```tsx
// Web
<UploadItem descriptor={item} labels={labels} onCancel={cancel} onRetry={retry} />
```

```tsx
// Native
<UploadItem descriptor={item} labels={labels} onCancel={cancel} onRetry={retry} />
```

Web은 `@hjmds/react`의 해당 granular entry, Native는 `@hjmds/react-native` entry를 쓴다.
Button의 실행 콜백은 Web `onClick`, Native `onPress`로 연결한다. 위 골격의 도메인 함수·변수는 제품이 제공한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치/테마 | Stack과 HjmProvider | Stack과 HjmNativeProvider |
| 좁은 폭 | 줄바꿈·단일 내용 | 같은 순서, OS 화면 검증은 별도 |

### 예제의 제한과 초점 복구

2026-10-07 실제 복구 흐름에서 상태 버튼이 사라질 때 Web 초점이 body로 빠졌다.
예제는 상태 변경 전에 해당 파일의 이름 있는 영역으로 초점을 옮기고, 제거 후에는 예제 추가
버튼으로 복귀한다. 이후 Tab으로 취소·재시도 등 현재 가능한 행동을 선택한다.
제품도 비동기 상태 전환으로 사라지는 행동의 초점 목적지를 정한다.

양쪽 예제는 이미지3개·파일당5MB 제한을 선언한다. Web은 실제 file chooser를 사용하며,
Native onPick은 예제 후보를 반환하는 fixture다. Native 시스템 사진 선택기 검증으로 세지 않는다.
서버 비전송 안내는 성공·거부 상태와 별도로 항상 표시한다. 실제 제품은 서버 확정·취소 시
늦게 도착하는 응답·전송 ticket의 소유권을 제품 업로드 계층에 연결해야 한다.

2026-10-13 실제 예제에서 중복 후보가 남은 슬롯을 차지하는 선택과 같은 렌더의 연속 드롭·선택이
3개 제한을 넘는 경로를 재현했다. 양쪽 예제는 `showcase/shared/reference-adoption.ts`의
`mergeUploadSelection`으로 현재 목록과 중복을 먼저 확인한 뒤 남은 개수를 판정한다. 개수 초과 후보만
다시 판정하며 파일 형식·크기 거부는 유지한다. 예제 사진 추가도 같은 제한을 따른다.

수동 응답 예제의 콜백은 해당 파일의 현재 상태 객체에 연결한다. 취소·재시도·제거 후 다시 선택하면
이전 상태의 성공·실패 콜백을 무시한다. 다른 파일을 추가하는 동작은 진행 중 파일의 응답을 무효화하지 않는다.
이는 예제 이벤트 수명 보호이며 실제 네트워크 요청 취소나 시스템 파일 선택기 검증을 뜻하지 않는다.
