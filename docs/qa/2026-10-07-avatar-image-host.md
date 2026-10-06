# Avatar 제품 이미지 호스트 확장

2026-10-07 · HJM Native 구현·로컬 회귀. 미게시·Utilverse 미적용·기기 미검증.

## 문제와 변경

Utilverse 자체 Avatar는 Expo Image disk 캐시와 로딩 중 이니셜을 사용한다. 현재 HJM Avatar로
단순 교체하면 이 제품 계약을 잃는다. 별도 Avatar를 새로 만들거나 Expo를 공통 의존성으로
추가하는 대신 Native Avatar의 renderImage 슬롯으로 source·size·공통 fallback·onError를
넘긴다. 원형·테두리·semantic 색과 접근성은 HJM이 소유한다. 기존 Native Image 경로는 유지한다.

오래된 이미지 콜백은 source 문자열만 비교하면 A→B→A에서 다시 유효해진다. source가 바뀔
때 생성되는 세대 token으로 이전 callback을 무시하고 동일 source rerender의 실패는 유지한다.

## 확인

- 새 host 회귀 3개: 로딩용 공통 fallback, 실패 시 공통 대체 표시, 같은 source rerender에서
  실패 유지, 새 source 복구, A→B→A stale callback 무시, 기본 Image 경로 유지.
- 기존 Blobatar 회귀 포함 집중 검사 4개 통과.
- 전체 Native host suite: 97 files / 1,183 tests 통과.
- Native typecheck와 package build 통과. Renderer graph budget·플랫폼 import 경계 통과.
- 공개 API 대응표 sync(298 names), usage·문서 링크 검사 통과. 새로운 공개 컴포넌트 이름은 없다.

## 미확인

실제 Expo Image onDisplay/cache/decode, 기기 스크린리더, 사진 변경·신고와 소비 앱 회귀는
릴리스 후 Utilverse 적용에서 확인해야 한다. 이 슬롯의 단위 테스트를 실제 이미지 표시로
보고하지 않는다. 기능 추가 버전은 아직 게시하지 않았다.
