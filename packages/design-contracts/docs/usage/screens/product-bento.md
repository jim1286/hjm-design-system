# 기능 카드와 주 행동

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-07
- 근거: `reference-adoption-previews.tsx`, `reference-adoption.css`
- 스토리북: `배포/화면/소개/기능 카드와 주 행동`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

## 목적

기능을 실제 미리보기로 보여 주고 첫 행동으로 이어지는 소개 화면이다. 기존 Surface/Stack/Button/ImageComparison을 조합한다.

## 영역 구조

```text
[브랜드]
[제목 · 가치 설명]
[비교 미리보기] [기능 설명 두 장]  ← 넓은 Web 2:1
[첫 입력(시작한 뒤)]
[사용 방법(선택)]
[보조 행동] [주 행동]
[항상 보이는 체험·저장 범위]
[처리 결과 · 저장된 제목]
```

좁은 Web과 Native는 비교→설명 두 장→첫 행동 순서로 한 열에 놓는다.

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web Stack / Native KeyboardAvoiding → ScreenLayout → Stack | Web 문서 스크롤 / Native 고정 제목 아래 본문 스크롤 | 본문 lg=20px, Native 제목 간격 md=16px, contentInset none |
| 기능 | Surface/Stack | 설명 다음 | padding lg=20px, 카드 gap md=16px |
| 제목/본문 | Text/Stack | 각 카드 안 | sm=12px |
| 첫 행동 | BottomCTA | 기능·입력 뒤 | description → 보조/주 행동, flow 배치 |
| 조건 | BottomInfo | 주 행동 바로 아래 | 항상 유지, 예제의 로컬 저장 범위 설명 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 주 행동 | BottomCTA primaryAction | 기능·입력 아래 | 시작 → 미리보기에 저장, 1개 |
| 보조 행동 | BottomCTA secondaryAction | 같은 행동 영역 | 사용 방법 보기/접기 → 소개로 돌아가기 |
| 비교 보조 | Button·secondary | 이미지 슬라이더 아래 | 전→후 전체 보기 2개, wrap |
| 파괴 행동 | 없음 | 없음 | 0개 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 설명과 비교·주/보조 행동·조건 안내 | 첫 입력 또는 사용 방법으로 이동 |
| 로딩 | 실제 이미지 로드 상태 | 주 행동은 제품 가용성에 맞춤 |
| 빈 | 제품 자료가 없으면 비교 영역 생략 | 문구와 첫 행동 유지 |
| 오류 | 이미지 실패 대체 또는 저장 실패 문구·제목 유지 | 현재 제목으로 다시 저장 |
| 진행 중 | 주 행동 spinner, 보조 행동 비활성 | 중복 실행 방지, 입력 내용은 제품 상태에 유지 |
| 완료 | 확정한 제목과 성공 문구 | 다음 입력 가능 |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ImageComparison](../components/image-comparison.md) | 기능 미리보기 |
| [Stack](../components/stack.md) | 읽기 순서와 간격 |
| [BottomCTA](../components/bottom-cta.md) · [BottomInfo](../components/bottom-info.md) | 주·보조 행동과 항상 보이는 조건 |

## 코드 골격

```tsx
// Web
<Stack gap="lg">
  <Text variant="heading">{title}</Text>
  <Surface padding="lg"><ImageComparison {...comparison} /></Surface>
  <BottomCTA primaryAction={{ label: startLabel, onClick: start }} secondaryAction={{ label: helpLabel, onClick: showHelp }} />
  <BottomInfo items={conditions} />
</Stack>
```

```tsx
// Native: screen-owned scrolling keeps the CTA reachable below long previews.
<KeyboardAvoiding style={{ flex: 1 }}>
<ScreenLayout title={title} contentInset="none">
<Stack gap="lg">
  <Surface padding="lg"><ImageComparison {...comparison} decrementLabel={decrementLabel} incrementLabel={incrementLabel} /></Surface>
  <BottomCTA primaryAction={{ label: startLabel, onPress: start }} secondaryAction={{ label: helpLabel, onPress: showHelp }} />
  <BottomInfo items={conditions} />
</Stack>
</ScreenLayout>
</KeyboardAvoiding>
```

Native는 같은 public component entry를 `@hjmds/react-native`로 바꾸고 Button에 `onPress`를 쓴다.
Native ImageComparison에는 증감 행동 label을 추가한다. 제품의 계정/저장 안내와 데이터는 제품이 공급한다.

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자 | 제목·본문·버튼이 자연스럽게 줄바꿈 |
| 다크 | provider semantic palette 사용 |
| 좁은 폭 | 예제 Web 48rem 이하에서 1열. Native는 항상 단일 순서 |


### CTA 레퍼런스 흡수와 저장 소유권

2026-10-07 CTA Gallery의 Webflow 데스크톱·모바일 캡처에서 주/보조 행동의 위계를,
Ente 캡처에서 플랫폼 조건에 맞춘 행동 묶음을 확인했다. HJM에는 기존 BottomCTA/BottomInfo로
역할을 분리하며 외부 브랜드 색·스토어 배지·가격을 복제하지 않는다. 별도 CTA 엔진은 추가하지 않는다.

제목은 화면의 controlled state에 둔다. 소개로 돌아가 입력을 숨겨도 제목은 남고 다시 시작하면
복구된다. 실제 서버가 없는 데모임을 상시 표시한다. 기존 useDemoAction/ActionSession으로
중복 요청·pending·실패 후 재시도를 검증하며 350ms 지연은 데모 전용이다. 실패 시 현재 제목은
유지하고 다시 저장은 현재 입력 snapshot을 제출한다. 저장된 제목은 마지막으로 확정한 값이다.

Web 큰 글자에서는 BottomCTA 계약대로 주 행동이 위, 보조 행동이 아래로 쌓인다. 모바일 Native도
같은 계약을 따르며 화면 host가 스크롤·키보드·safe area를 제공한다. Native 예제에는 기존 ScreenLayout과 KeyboardAvoiding을 연결한다. 스크롤 없는 Canvas에서 CTA가 화면 밖으로 잘렸던 2026-10-07 실제 확인에 따른 수정이다. 제품은 host safe area/keyboard offset을 실제 내비게이션에 맞춘다.
