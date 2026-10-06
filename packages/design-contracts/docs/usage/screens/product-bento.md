# 기능 카드와 주 행동

- 단계: 화면
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.13.1 이후)
- 검토일: 2026-10-06
- 근거: `reference-adoption-previews.tsx`, `reference-adoption.css`
- 스토리북: `실험/화면/소개/기능 카드와 주 행동`

## 목적

기능을 실제 미리보기로 보여 주고 첫 행동으로 이어지는 소개 화면이다. 기존 Surface/Stack/Button/ImageComparison을 조합한다.

## 영역 구조

```text
[브랜드]
[제목 · 가치 설명]
[비교 미리보기] [기능 설명 두 장]  ← 넓은 Web 2:1
[첫 행동]
[조건 안내 또는 첫 입력]
```

좁은 Web과 Native는 비교→설명 두 장→첫 행동 순서로 한 열에 놓는다.

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 본문 | lg=20px |
| 기능 | Surface/Stack | 설명 다음 | padding lg=20px, 카드 gap md=16px |
| 제목/본문 | Text/Stack | 각 카드 안 | sm=12px |
| 첫 행동 | Button | 기능 뒤 | 원래 읽기 순서 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 주 행동 | Button·primary | 기능 아래 | 1개 |
| 비교 보조 | Button·secondary | 이미지 슬라이더 아래 | 전→후 전체 보기 2개, wrap |
| 파괴 행동 | 없음 | 없음 | 0개 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 설명과 비교·주 행동 | 첫 입력으로 이동 |
| 로딩 | 실제 이미지 로드 상태 | 주 행동은 제품 가용성에 맞춤 |
| 빈 | 제품 자료가 없으면 비교 영역 생략 | 문구와 첫 행동 유지 |
| 오류 | Image의 실패 대체 | 제품 복구 안내 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ImageComparison](../components/image-comparison.md) | 기능 미리보기 |
| [Stack](../components/stack.md) | 읽기 순서와 간격 |
| [Button](../components/button.md) | 주·보조 행동 |

## 코드 골격

```tsx
// Web
<Stack gap="lg">
  <Text variant="heading">{title}</Text>
  <Surface padding="lg"><ImageComparison {...comparison} /></Surface>
  <Button onClick={start}>{startLabel}</Button>
</Stack>
```

```tsx
// Native
<Stack gap="lg">
  <Text variant="heading">{title}</Text>
  <Surface padding="lg"><ImageComparison {...comparison} decrementLabel={decrementLabel} incrementLabel={incrementLabel} /></Surface>
  <Button onPress={start}>{startLabel}</Button>
</Stack>
```

Native는 같은 public component entry를 `@hjmds/react-native`로 바꾸고 Button에 `onPress`를 쓴다.
Native ImageComparison에는 증감 행동 label을 추가한다. 제품의 계정/저장 안내와 데이터는 제품이 공급한다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 제목·본문·버튼이 자연스럽게 줄바꿈 |
| 다크 | provider semantic palette 사용 |
| 좁은 폭 | 예제 Web 48rem 이하에서 1열. Native는 항상 단일 순서 |
