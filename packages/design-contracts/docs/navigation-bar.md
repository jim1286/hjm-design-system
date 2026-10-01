# NavigationBar — 글래스 네비게이션 바

검토일: 2026-10-01

`NavigationBar`는 브랜드·탐색·검색/계정 행동을 배치하는 상단 탐색 조합입니다.
`@hjmds/react/navigation-bar`, `@hjmds/react-native/navigation-bar`에서 가져옵니다.

```tsx
<NavigationBar label="사이트 탐색" brand={<Text>브랜드</Text>} actions={<SearchField /* 제품의 현지화된 필드 props */ />}>
  {/* 제품의 Link, Menu, Button 등 탐색 항목 */}
</NavigationBar>
```

- 필수 `label`, `brand`, `children`, 선택 `actions` 슬롯을 받습니다.
- Web은 이름이 있는 nav와 줄바꿈되는 세 슬롯, Native는 큰 글씨에서도 늘어나는 두 행입니다.
- Web은 배경 흐림이 지원되면 92% 불투명 semantic surface와 blur를 사용합니다.
  미지원/투명도 줄이기/강제 색상에서는 불투명 배경을 유지합니다.
- Native는 core renderer에 필수 blur 의존성을 추가하지 않고 불투명 semantic surface로
  대체합니다. 실제 iOS 유리 굴절 효과를 구현했다고 주장하지 않습니다.
- 메뉴의 초점·키보드·닫힘과 검색/계정 상태는 기존 Menu/SearchField 및 제품이 소유합니다.
  슬롯을 하나의 접근성 요소로 합치지 않습니다. 브랜드/목적지는 앱에서 Link로 전달할 수 있습니다.
- `TopBar`는 화면 제목·뒤로가기·소수 행동을 위한 chrome, `BottomNavigation`은 최상위 route,
  `NavigationBar`는 사이트 탐색의 다중 슬롯 조합입니다. 같은 선택 상태를 중복 보관하지 않습니다.

근거: 사용자가 제공한 [Glassy Navbar 릴](https://www.instagram.com/reel/Dd8_OYaTwmG/)의
브랜드·드롭다운·검색·계정 배치를 관찰해 독립 구현했습니다. 원본 소스/에셋은 가져오지 않았습니다.
Storybook: **컴포넌트 → 탐색 → 글래스 네비게이션 바**, Default/Dark/LargeText.
구현·검증 기록은 [같은 변경의 증거](../../../docs/evidence/navigation-references-2026-10-01/README.md)를 따릅니다.
