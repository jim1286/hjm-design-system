---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
---

Switch의 꺼짐 상태가 다크 테마에서 보이지 않던 문제를 고친다.

웹 renderer가 `switchRecipe.colors`의 `trackOffBorder`·`thumbOffBorder`를 그리지
않아, 꺼짐 스위치가 `surfaceAlt` 트랙 위에 `surface`보다 어두운 `bg` 손잡이만
얹은 모양이었다. canonical 다크 팔레트에서 트랙 대 카드 1.10:1, 손잡이 대 트랙
1.20:1이라 컨트롤이 통째로 사라졌다(소비 앱 설정 화면, 2026-09-14).

- `.hjm-switch__track`·`__thumb`이 꺼짐 상태에서 계약된 hairline을 그린다.
  `border`가 아니라 inset box-shadow다 — `box-sizing: border-box`에서 border는
  padding box를 줄이는데 `--hjm-switch-track-offset`은 그대로라 손잡이가 2px
  넘어간다.
- 켜짐 트랙은 `trackOnBorder`(`border.focus`)를 얻고, 레시피에 `thumbOnBorder`가
  없으므로 켜짐 손잡이는 drop shadow만 유지한다.
- `action-contrast.browser.test.tsx`가 두 테마에서 hairline 대비 3:1을 잡는다.

react-native renderer는 플랫폼 `Switch`가 trackColor·thumbColor만 받아 hairline을
표현할 수 없어 이번 변경에 포함되지 않는다.
