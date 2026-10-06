# Rating 사용 지침

검토일: 2026-10-06 · 실험 · [계약](../reference-controls.md)

## 언제 쓰나

사용자가 정수 별점을 고르거나, 이미 계산된 평균 점수를 읽기 전용으로 보여 줄 때 쓴다.

## 쓰지 않을 때

단순 즐겨찾기는 Button/ReactionPicker, 일반 선택지는 RadioGroup을 쓴다. 리뷰 작성·집계·저장은 제품 소유다.

## 공개 이름과 import

`Rating`: `@hjmds/react/rating`, `@hjmds/react-native/rating`. 두 renderer 모두 root 밖의 실험 API다.

```tsx
<Rating label={t('rating.title')} value={score} onValueChange={setScore}
  getValueLabel={value => value === null ? t('rating.unrated') : t('rating.score', {value})}
  clearLabel={t('rating.clear')} />
```

평균은 `readOnly value={3.5}`와 `getValueLabel`로 표시하고 onValueChange는 전달하지 않는다.
입력형은 null 또는 1~max의 정수다. 0점을 미평가 대신 쓰지 않는다. max 기본은 5, 최댓값은 10이다.
