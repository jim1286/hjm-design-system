# 가장자리 블러 도입 검토

2026-10-07 사용자 요청의 후속 후보다. 상태: 소스·원본 UI 조사와 경계 계산 구현 완료,
Web/Native 블러 실험 및 성능·기기 검증 미완료. 이 문서를 실험 등록이나 승격으로 세지 않는다.

## 실제 원본 관찰

- [Magic UI](https://magicui.design/docs/components/progressive-blur): IAB 1280×720 밝은 화면에서
  400px 목록의 하단 160px에 CSS backdrop-filter 8층(0.5, 1, 2, 4, 8, 16, 32, 64px)이 있다.
  모두 pointer-events:none이다. 실제 wheel로 끝까지 이동했을 때 scrollTop=1384,
  scrollHeight=1784, clientHeight=400이고 마지막 19번 행은 여전히 흐려 읽을 수 없다.
  단순히 마지막 위치까지 스크롤 가능하다고 읽기 가능한 것은 아니다.
- [Motion Primitives](https://motion-primitives.com/docs/progressive-blur): web fetch는 403이었지만
  같은 공개 페이지를 IAB에서 정상 열었다. 기본 작품 이미지+설명, hover 작품 이미지, 방향별
  이동 예제가 있다. 마지막의 slider는 사용자 입력 range가 아니라 자동 이동하는 숫자 띠다.
  1~9를 두 벌 렌더하며 transform translateX가 있고 좌우 blur 16층을 관찰했다.
  이미지에 포인터를 올리면 blur와 작가/제목 opacity=1을 확인했다. 이미지 자체에 키보드
  포커스 대상은 없었다. CDP prefers-reduced-motion=reduce 후 reload해도 띠의 translateX가
  연속 관찰에서 -1.8px→-1097px로 이동했다. 예제 안 정지 컨트롤은 없었다.
  에뮬레이션은 복원했다. 다크·좁은 폭·성능은 아직 미검증이다.

## 기존 HJM과의 경계

- EffectSurface는 mesh/glow/grain 배경 장식이다. 이미 그린 내용에 대한 backdrop blur가 아니다.
  같은 prop 이름으로 구현 차이를 숨기거나 이 API의 기존 배경 의미를 바꾸지 않는다.
- ScrollProgress는 Progress 표현을 재사용하며 `ScrollMetrics`와 Web `useScrollMetrics`를 제공한다.
  별도 scroll 상태 엔진을 만들지 않고 이 측정값을 재사용한다.
- 새 `resolveScrollEdges(metrics)`를 같은 contracts subpath에 추가했다. 끝/시작·미측정·내용 맞춤·
  탄성 overscroll·소수 offset을 처리한다. 임의 타이머/진행률로 경계를 추정하지 않는다.
- 경계 계산은 블러 또는 초점 보호의 구현 완료가 아니다. 아직 두 renderer에 효과를 추가하지 않았다.

## Native 실제 호스트 요건

[Expo SDK 57 BlurView](https://docs.expo.dev/versions/v57.0.0/sdk/blur-view/) 문서 기준:
권장 57.0.3, Expo Go 포함. Android는 BlurTargetView를 내용에 연결하고 blurTarget 및
blurMethod를 설정해야 실제 블러가 된다. 기존 iOS 방식만 쓰면 Android는 반투명 배경이다.
동적 목록보다 BlurView가 먼저 렌더되면 갱신 문제가 있으며, Android 12 이전 구현은
추가 비용이 있다. 따라서 Android의 반투명 대체를 검증된 동일 효과로 보고하지 않는다.

Native 그라데이션 마스크와 여러 blur 층은 실제 호스트에서 합성 확인이 필요하다.
기존 Skia BackdropBlur만으로 일반 RN 자식이 흐려진다고 가정하지 않는다. 새 peer 도입은
optional subpath 또는 제품 호스트 경계에서 정하고 원래 root import를 무겁게 하지 않는다.

## 실험에서 통과해야 할 것

1. 목록 시작에서 위 효과 없음, 끝에서 아래 효과 없음, 내용이 맞거나 미측정이면 양쪽 없음.
2. resize/글자 확대/내용 추가·삭제 후 경계 갱신. 가로는 RTL logical offset 연결.
3. 포커스된 조작은 흐려지지 않음. 효과는 포인터·접근성 트리를 가로채지 않음.
4. 표시된 안내가 가려지지 않는 작품/이미지 구성과 실제 읽기 목록 구성을 구분.
5. 밝음·다크·두 제품 팔레트·큰 글자·모션 감소 및 실제 Native host 확인.
6. 같은 콘텐츠/기기에서 효과 없음과 켬의 렌더링 비용 비교. 층 수/크기/반경의 기본값은
   이 비교 후 정하며 원본의 8층·64px·40%를 그대로 기본값으로 복사하지 않음.

별도 다운로드 미디어나 원문 HTML은 보관하지 않았다. 원본 화면 캡처는 관찰만 했으며
추가로 원시 이미지 파일을 만들지 않았다. URL별 판단은 reference-component-review-ledger.json에 반영했다.
