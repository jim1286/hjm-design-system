---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Calendar에 `fold`(`expanded`·`onExpandedChange`·`label`)를 추가했다. 접으면 선택한 날짜(없으면 오늘)가 있는 주만 보이고, 격자 아래 손잡이로 그 자리에서 한 달을 펼친다. 보이는 줄은 공용 `resolveCalendarVisibleRows`, 손잡이 크기는 `calendarRecipe.fold.handle`이 정한다.
