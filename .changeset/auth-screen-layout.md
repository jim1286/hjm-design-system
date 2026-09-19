---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

AuthScreenLayout — 로그인 화면의 두 영역 골격을 추가합니다.

계정이 있는 제품들이 같은 로그인 화면을 각자 조립하면서 같은 실수를 반복했습니다. 로고·제목·
설명·동의 고지·정책 링크를 위에서부터 쌓아 제공자 버튼이 화면 밖으로 밀렸고(2026-09-19 실측),
간격·최대 폭·마크 크기가 제품마다 달랐으며, 정책 링크가 44pt 터치 기준에 못 미쳤습니다.

`AuthScreenLayout`은 **배치만** 소유합니다. 위 영역(hero + main)이 남는 세로 공간을 차지하고
그 안에서 가운데 정렬하며, 아래 영역(footer)은 바닥에 붙습니다. 내용이 화면보다 길면 스크롤로
전환하고 아래 영역을 겹치지 않습니다. 제공자 버튼 높이는 기존 `authProviderButtonRecipe`가
그대로 소유합니다.

문구·마크 자산·제공자 목록·정책 링크 목적지·인증 흐름은 계약에 없습니다. 제품이 슬롯으로
넘깁니다 — 제품마다 `main`에 넣는 것이 다르기 때문입니다(제공자 버튼만, 또는 가입 재개·심사자
입력 같은 제품 덩어리).

마이그레이션: 기존 코드는 영향받지 않습니다. 새 컴포넌트를 쓰려면
`import { AuthScreenLayout } from "@hjmds/react"` 또는 `"@hjmds/react-native"`.
