---
"@hjmds/react-native": minor
---

iOS에서 Switch가 행 세로 중앙에 오고 카드 밖으로 넘치지 않게 합니다.

1.5.0까지 `NativeSwitch`에 recipe 크기(`switchRecipe.sizes[size]`, 기본 52×32)를 강제했습니다. iOS UISwitch는
작은 박스를 무시하는 고유 크기(iOS 26에서 트랙 폭 약 66pt)를 가져서, 박스보다 큰 컨트롤이 박스의 위·시작 모서리
기준으로 그려졌습니다. 그래서 라벨+설명 두 줄 행에서 토글이 위쪽에 붙고 끝 쪽 카드 테두리 밖으로 넘쳤습니다
(2026-09-27 iPhone 17 Pro 시뮬, 소비 제품 보고). 이제 iOS에서는 크기를 주지 않아 실제 크기로 배치되고, 행의
`alignItems: center`가 실제 트랙을 기준으로 맞춥니다. Android는 기존대로 recipe 크기를 씁니다.

소비자 migration: 이 결함을 피하려고 Switch 주변에 넣은 폭 고정·`translateY`·여백 우회는 지워도 됩니다.
