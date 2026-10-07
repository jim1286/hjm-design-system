# Finite collection rail

검토일: 2026-10-07 · 새 공개 진입점 미게시(1.15.0 이후)

2026-10-07 Aceternity 다중 카드 예제와 기존 API를 대조했다. 기존 List는 세로 행 의미/구분선,
Carousel/CarouselMotion은 단일 활성 패널의 숨김·inert·선택을 소유한다. 여러 카드가 함께 보이며
각 카드 입력/상세 행동이 독립적으로 작동하는 문제는 단일 선택 엔진을 복제해서 해결할 수 없다.
`CollectionRail`은 List의 companion인 유한 배치/탐색 계약이며 canonical catalog를 늘리지 않는다.
근거: [설계 결정](../../../docs/plans/aceternity-interaction-adoption-2026-10-07.md#가로-카드-목록과-상세--실제-원본-검토-후-설계-판단).

계약/두 renderer의 granular subpath는 `/collection-rail`이다. 추가 peer나 root export는 없다.
`validateItems`로 안정 ID·현지화 label을 검증하고, 공통 geometry/resolver가 항목 폭·논리 offset·끝 처리·초점 노출·키보드 방향을 소유한다.
Web은 실제 clientWidth/ResizeObserver 및 RTL의 음수 scrollLeft를, Native는 onLayout과 명시적 LTR ScrollView의 물리 좌표를 번역한다.
Native row만 RTL에서 역방향으로 배치하며 데이터/React key/읽기 순서를 역순 배열로 바꾸지 않는다.

## 상태 소유권

- 스크롤의 앞쪽 anchor는 선택값이 아니다. `defaultStartKey`는 초기 위치만 정하고 `onStartKeyChange`는
  실제 앞쪽 항목 ID 또는 empty의 null을 관찰한다. 서버 선택/상세 대상/초안은 제품 또는 기존 공개 컴포넌트 소유다.
- `scrollTo` 요청 좌표와 실제 도착은 분리한다. 이동 중 연속 버튼은 대기 목적지를 이어가지만,
  끝 비활성화와 관찰 callback은 실제 host scroll 응답에서만 갱신한다. 사용자 pointer/touch는 대기 목적지를 해제한다.
- 모든 항목은 stable id로 계속 마운트된다. hidden/inert, 단일 활성 panel, 자동 회전, loop, 가상화는 제공하지 않는다.
- pointer/touch는 host의 실제 스크롤로 처리하며 사용자 입력을 PanResponder로 덮지 않는다.
- previous/next는 항목 경계를 따라 한 단계 이동하고 끝에서 멈춘다. Web viewport/controls에서만
  논리 ArrowLeft/Right·Home/End를 처리하며 카드의 input/widget 키를 가로채지 않는다.
- 초점 노출은 필요한 최소 offset으로 카드 전체를 보여 준다. 폭/방향/데이터 변경은 앞쪽 ID를 보존하며,
  같은 viewport에 이전 anchor와 먼 초점 카드가 함께 들어갈 수 없으면 초점 카드 노출을 우선한다.
  삭제된 anchor는 첫 항목으로 대체한다. key/remount로 입력을 초기화하지 않는다.
- 세부 모달은 `Card.actions`→기존 Dialog를 합성한다. rail은 body overflow·background lock·focus trap을 따로 구현하지 않는다.

## 배치와 플랫폼 경계

comfortable 최대 폭360은 `layout.readingMaxWidth / 2`, compact240은 `/3`이다. 실제 폭은 viewport와
`spacing.xl`24 hint를 함께 고려한다. 간격 `spacing.md`16을 유지하므로 viewport358에서 카드334와 다음 카드8이 노출된다.
뷰포트24 이하에서는 peek보다 내용 폭을 우선한다. 길고 많은 데이터는 VirtualList/제품별 가상화 계약을 사용한다.
브랜드 색·표면·폰트·카드 경계는 Provider와 Card가 소유한다. 가로 탐색을 테마의 미지원 screen/composition 축에 자동 연결하지 않는다.

Web 초기 unchanged ResizeObserver 알림은 초점 노출을 되돌리지 않는다. Native content-size 알림도 높이만
바뀌면 스크롤을 재정렬하지 않는다. 모션 감소에서 프로그램 탐색은 즉시 이동한다.
host subpixel 반올림을 위해 끝 판정은0.5 CSS px/dp 허용하며 rubber-band 입력은 유한 범위로 clamp한다.
이는 시간·픽셀값 복제 또는 OS 최대 글자 모사를 위한 보정이 아니다. 최대 글자 조건은 설계/검증/후속에서 제외한다.

Native host 번역 회귀는 실제 OS touch/VoiceOver/키보드 성능과 구분한다. 실험 검수 후 게시/소비 제품에서
지원 환경을 확인한다. [사용 지침](usage/components/list.md#collectionrail-가로-배치)과 [합성 구성](usage/compositions/collection-detail.md)을 따른다.

공식 host 근거: [React Native ScrollView](https://reactnative.dev/docs/scrollview),
[Web scrollLeft](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft),
[ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
