# 손그림 편집기 계약

2026-10-27 사용자 요청으로 다에리·스핀트의 동일한 그림 편집기를 공통 API로 옮겼다.
`DrawingEditor`는 `EditorScreen`·`ColorPicker`·`Slider`를 합성하는 beta 컴포넌트다.

순수 이력·선·지우개·배경·팔레트·배치는 `src/drawing-editor.ts`가 소유한다. Web pointer capture와 Native responder,
SVG/Canvas 이미지 추출은 각 renderer에 남는다. 제품 계정·업로드·저장 형식 제한·성공 후 탐색은 포함하지 않는다.

프로필 사진은 `cropPreview="circle"`을 전달한다. 기본 사각 캔버스와 원형 미리보기 모두 실제 출력에는 오버레이를 넣지 않는다.
저장 실패는 그림을 보존하며 같은 초안으로 다시 시도한다. 한 획을 하나의 이력 단계로 취급하고 새로운 획은 redo 분기를 없앤다.
펜과 지우개의 실제 굵기는 같은 슬라이더 값이며 지우개는 항상 현재 배경색을 따른다.

사용법과 소비 이관은 [DrawingEditor 지침](usage/components/drawing-editor.md)을 따른다. 미게시 개발 후보이며
구현·표면 테스트·제품 채택과 패키지 게시·실기기 QA는 각각 별도 상태다.
