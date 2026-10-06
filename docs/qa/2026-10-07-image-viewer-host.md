# ImageViewer 제품 이미지 호스트와 재시도

2026-10-07. HJM `cec664a` 이후 변경. Utilverse 소스는 변경하지 않았다.

## 목적과 범위

PhotoFilePreview의 Expo onDisplay/cachePolicy 계약을 연결할 수 있도록 기존 Native optional
ImageViewer에 renderImage/onImageStatusChange를 추가했다. 기본 RN Image는 onLoad를 유지한다.
이는 표시 host 연결이며 명시적 fit/2배/pixel·회전·사용자 결과 확인은 아직 미구현/미채택이다.

## 수정 전과 재현

기존 API는 제품 이미지 host나 상태 통지를 제공하지 않았다. 내부 retry는 Image key만 바꾸고
이전 image callback을 막지 않았다. id/uri를 구분자로 이어 만든 collection key도 충돌할 수 있었다.

새 진단 fixture `showcase/native/src/devtools/ImageViewerHostProbe.tsx`로 실제 번들 사진을 표시하고
첫 load만 합성 오류로 바꿨다. iOS에서 오류 문구가 사진 위에 배경 없이 겹쳤고, 중앙 재시도를
탭해도 오류가 남았다. mock 회귀 24개가 통과한 상태에서도 이 native 문제가 재현됐다.
설치된 zoom-toolkit 5.1.1의 GalleryGestureHandler는 Gallery 위의 별도 gesture layer를 사용한다.
renderItem 안 버튼은 그 아래에 놓여 실제 터치가 도달하지 않았다.

## 수정

- HJM은 host에 item/실측 width·height/onReady/onError를 제공한다. 제품은 캐시·표시 이벤트·이름을 연결한다.
- 닫힘·교체·재시도에서 퇴역한 host의 callback을 차단하고 오류 뒤 늦은 ready를 무시한다.
- collection identity는 JSON tuple로 구성해 구분자 충돌을 제거한다.
- 이미지 상태를 session에 모아 현재 항목의 loading/error만 Gallery의 형제 overlay로 표시한다.
  Surface의 semantic 배경으로 글자를 사진과 분리하고 재시도 버튼을 gesture layer 밖에 둔다.
- 재시도는 Gallery와 이미지 host를 다시 마운트하며 확대 상태도 초기화한다. caption·닫기·이전/다음은 유지한다.

## 실제 화면 확인

기존 iPhone 17 Pro · iOS 26.5, Expo Go 57.0.9, HJM Metro 8084를 재사용했다.
사용자 지침에 따라 Device Hub CUA는 사용하지 않고 idb 탭/AX와 simctl 캡처로 확인했다.
실제 기기 또는 Device Hub 검증으로 집계하지 않는다.

| 환경 | 실제 관찰 |
| --- | --- |
| light, 글자 1배 | 오류 overlay의 밝은 배경과 문구·재시도 표시. 중앙 탭 후 오류 사라짐, 번들 사진 표시 유지. 닫은 뒤 fixture 상태 ready 확인 |
| dark, 글자 2배 | 어두운 Surface 위 큰 오류 문구·재시도 표시. 닫기/이전/다음·caption 화면 안에 유지. 재시도 탭 후 오류 AX 항목 제거 확인 |

이 검증은 RN Image 호스트와 합성 첫 오류다. Expo onDisplay·실제 decode/network 실패·선택 사진
여러 장·pinch/pan·회전·RTL·VoiceOver 발화/초점·Android·제품 팔레트·Release 성능은 미검증이다.
상태 통지는 비선택 페이지에도 올 수 있으며 export 승인으로 쓰지 않는다. 닫기/교체의 사용자 확인
무효화는 제품 소유다. 사진 위 파란 톱니는 기존 개발 도구 overlay로 제품 UI가 아니다.

## 자동 검사와 산출물

신규 회귀 5개는 host ready 대기·반복 통지 방지, 오류 뒤 늦은 성공, retry의 stale event,
A→B→A 교체/close, 기본 RN load/error, collection key 충돌을 검사한다. 관련 기존 3개 파일과
합쳐 24개 통과. Native 타입 검사·빌드 및 Native Showcase 타입 검사 통과.
후속 Native 전체 100파일/1,195개 테스트도 통과했다. 공개 API 대응표(300)·문서 링크(551)·
사용 지침·workspace 동기화·renderer import graph 예산/플랫폼 경계 검사 통과.
원격 CI나 전체 릴리스 검증 결과가 아니다.

진단 fixture와 회귀는 보존한다. SelectionMotion Default에 연결했던 임시 render/globals는 복구했다.
검토한 변경 전 오류·첫 재시도 미복구·수정 후 오류·정상·다크 큰 글자 캡처와 임시 story 백업은
이 기록 후 정리한다. 기존 Metro/시뮬레이터는 유지한다.

## 회전 계약 후속 — 9487fff 이후

Native Modal에 supportedOrientations를 전달하고 fullScreen을 명시했다. controls와
feedback은 좌우 물리 inset + Container gutter로 배치하며 이미지 영역은 전체 폭을 쓴다.
닫기·재시도·이전/다음에는 growWithContent를 적용해 긴 지역화 문구를 고정 높이에 가두지 않는다.

추가 회귀 두 개는 landscape 허용 prop·비대칭 왼쪽 59/오른쪽 0 inset 전달과
viewport layout 874×218 → 402×590 변경이 host 측정값에 반영되는지 검사한다.
기존 gutter 회귀는 paddingHorizontal 대신 좌우 동일 padding을 검증하도록 갱신했다.
두 테스트 파일 12개, Native 타입/빌드 통과. 이는 mock layout 입력이며 실제 회전 검증이 아니다.
Showcase app.json은 portrait, Utilverse는 default다. idb ui에는 회전 명령이 없으며
공유 기기나 앱 manifest를 임의로 바꾸지 않았다. 실제 회전/OS 잠금/긴 문구 UI 검증은 남는다.

설치된 zoom-toolkit 5.1.1 GalleryRefType은 setIndex/reset/getState만 제공하고 정확한 scale
설정은 없다. ResumableZoom은 setTransformState/zoom을 제공하지만 이를 교체하면 기존
Gallery paging 계약까지 바뀐다. Gallery의 child size 기반 pan bounds는 확인했지만 확대된
이미지 크기 기반 2배/pixel 보기의 실제 손가락 pan은 미검증이다. private shared value를
건드려 배율 구현 완료로 세지 않는다. 현재 두 가지 명시적 배율은 여전히 추가 작업이다.

최종 후속 검사: 관련 4파일 26개 회귀, Native Showcase 타입 검사, 문서 링크 552개,
사용 지침·공개 API 대응표·renderer import graph/플랫폼 경계 통과. 예산 원시 로그는 정리했다.
