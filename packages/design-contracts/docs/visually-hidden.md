# VisuallyHidden contract

## 문제

화면에 보이는 아이콘·압축 상태만으로 부족한 문맥을 접근성 트리에 추가할 때 표준 clip
CSS가 제품마다 복제되고 쉽게 깨진다.

## 계약

자식 copy를 1px geometry로 시각적으로 숨기되 DOM과 accessibility tree에는 유지한다.
focusable control을 숨기는 용도가 아니며 input, link, button 자체를 자식으로 넣지 않는다.

## 플랫폼 경계

Web 전용이다. Native는 host control의 `accessibilityLabel`과 `accessibilityHint`를 사용한다.
별도의 보이지 않는 `Text`를 mount하면 읽기 순서와 중복 announcement가 달라질 수 있다.

## 검증 화면

Web Showcase에서 아이콘 action의 추가 문맥과 DOM 잔존을 검증한다.
