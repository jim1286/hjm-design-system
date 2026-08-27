# FilePicker contract

**문제.** 사용자가 업로드할 로컬 파일을 고른다 — 어떤 형식을 받는지, 몇 개까지
고를 수 있는지, 그리고 무엇을 골랐는지. 업로드 요청·재시도·서버 응답은 이 계약
밖이다. `docs/expansion-roadmap.md`의 Batch 3 절이 이미 그 경계를 그어 뒀다:
FilePicker는 파일 선택 의도만 소유하고, 진행·성공·실패 표현은 [[upload-item]]이
따로 소유한다. antd `Upload`는 이 둘로 decompose된다
(`src/component-references.ts`의 crosswalk).

**일반화한 계약.**

- `mode`(`single` 기본값 또는 `multiple`), `accept?`(MIME 패턴 또는 확장자 목록),
  `maxSizeBytes?`, `maxCount?`(multiple 전용)만 공개한다. `maxCount`를 single
  모드에 주면 조용히 무시하지 않고 던진다 — 두 축이 같은 것을 다르게 두 번
  말하게 두지 않는다.
- 고른 결과는 `{ accepted, rejected }`로 함께 돌아온다. `rejected`의 각 항목은
  `reason`(`unsupported-type`, `too-large`, `count-exceeded` 중 하나)과 그 판정에 쓴
  한계값을 함께 들고 있어 제품이 왜 막혔는지 다시 계산하지 않고 문장을 만든다.
  나머지 accepted 파일은 그대로 선택된 채로 남는다 — identity.md의 "무엇이
  깨졌는지 + 무엇이 무사한지"를 한 결과 값 안에서 만족한다.
- 크기·형식 거부는 **선택 시점**의 판정이다. 브라우저 `accept` 속성이나 네이티브
  피커의 필터는 참고 힌트일 뿐 강제가 아니므로(사용자가 "모든 파일"을 고르면
  통과한다), `resolveFilePickerSelection`이 실제 선택 결과를 다시 검증한다.
- `mode: "single"`은 별도 분기가 아니라 `maxCount = 1`인 일반 규칙의 특수
  경우로 처리한다 — Web dropzone에 파일 여러 개를 한 번에 끌어다 놓아도(단일
  모드라도 드롭 이벤트 자체는 여러 파일을 줄 수 있다) 첫 파일만 accepted, 나머지는
  `count-exceeded`로 떨어진다.
- `existingCount`는 FilePicker가 소유하지 않는 입력이다(Select의 `selectedItem`과
  같은 자리). 여러 번 나눠 고르는 제품 흐름에서 이미 고른 개수를 넘겨주면
  `maxCount`가 누적 기준으로 판단된다 — FilePicker는 선택 목록 자체를 쌓아두지
  않는다.
- 넣지 않은 것: 파일 내용 읽기/미리보기, 업로드 진행·재시도·서버 상태(→
  [[upload-item]]과 제품), 디렉터리 업로드, 자동 정렬. antd `Upload`의 넓은 표면 중
  "무엇을 고를 것인가"만 가져온다.

**HJM 기본값.** `mode` 기본값은 `single`(더 좁고 안전한 쪽). trigger 버튼은
`control.minTouchTarget`(44) 이상을 유지하고, dropzone은 `radius.lg`의 점선
테두리로 표현하며 hover/drag 시 `border.focus` 색과 `interaction.focus`
배경으로 강조한다 — 이 강조는 장식이 아니라 "여기 놓으면 된다"는 신호다.

**플랫폼 번역.**

- Web: `<input type="file">` 또는 동등 위젯이 `role="button"`으로 trigger를
  드러낸다. 드래그 앤 드롭은 **Web 전용 보강**이며 항상 버튼 trigger와 함께
  있어야 한다 — `validateFilePickerTriggers`가 이 조합을 강제한다. Native가
  dropzone trigger를 요청하면 던진다.
- Native: 시스템 document/이미지 피커가 유일한 진입점이다. 결과가 도착하는
  경로는 다르지만(Web `change` 이벤트 vs Native picker 콜백), 같은
  `FilePickerCandidate` 배열로 들어와 같은 `resolveFilePickerSelection`을 통과하므로
  accept/size/count 판정은 두 플랫폼에서 동일하다 — 로드맵의 adaptive gate가
  요구하는 "같은 결과를 내는 다른 경로"다.
- 열림/닫힘 축을 공개하지 않는다. 플랫폼 피커 시트는 OS가 소유하는 일시적
  chrome이라 Sheet/Select처럼 `open` controlled state를 모델링하지 않는다.
- 거부 발표는 색에 의존하지 않는다 — `reason`과 한계값으로 제품이 만든 문장을
  live 영역/에러 카피로 보여준다.

**검증 화면.** first-party Web input/dropzone과 Native picker-adapter renderer, 선택 판정
상호작용 테스트는 연결되어 surface는 `beta`다. 실제 제품 vertical slice와 플랫폼 picker
실기기 증거는 아직 없으므로 `stable` 승격 gate는 닫혀 있다.
