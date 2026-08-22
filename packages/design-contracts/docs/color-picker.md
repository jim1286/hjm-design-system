# ColorPicker — 지금은 만들지 않는다

## 문제로 제기된 것

임의의 색을 고른다(hex/RGB/HSB 입력, 팔레트, 최근 사용 색). Ant Design `ColorPicker`와
`direct` crosswalk를 따른다. catalog에는 이미 `{ name: "ColorPicker", category: "input",
platform: "web", status: "planned" }` 자리가 예약돼 있다.

## 판정: 실사용처 근거 없이 만들지 않는다

먼저 가정하지 말라는 지시대로 두 제품에 색을 고르는 화면이 있는지 확인했다.

- **Yajalal RN**(`modules/app-rn/src`): `grep -rli "colorpicker\|color picker\|color-picker"`가
  0건이다. 코드베이스 전체에 색을 고르는 화면이 없다.
- **BurnTok Web**: 이 머신에 저장소가 없어 코드로 직접 확인할 수 없었다. 로드맵
  (`docs/expansion-roadmap.md`)의 제품 적용 순서·완료 슬라이스 기록 어디에도 색 선택
  화면이 등장하지 않는다 — 언급되는 색 관련 작업은 전부 "제품이 이미 고정한 semantic
  color를 렌더러가 어떻게 적용하는가"(Toast tone mark, Statistic trend mark, 구단 색
  adapter)이고, "사용자가 임의의 색을 고르는" 문제는 한 번도 나오지 않는다.

측정된 vertical slice가 없다는 뜻이다. `docs/expansion-roadmap.md`의 maturity gate는
"실제 제품 vertical slice 없이 승격하지 않는다"고 정하고 있고, 이 원칙은 계약을 쓸지
말지에도 그대로 적용된다 — `docs/notification.md`·`docs/dropdown.md`·
`docs/virtual-list.md`가 이미 "측정된 요구가 없으면 만들지 않는다"로 판정한 것과 같은
근거다.

## 이 판정을 더 무겁게 만드는 이유

ColorPicker는 만들면 가벼운 계약이 아니다. 로드맵의 상태 축 표 어디에도 없는 완전히
새로운 세 갈래 문제를 한 번에 열어야 한다.

1. **색 공간 표현.** hex/RGB/HSB/alpha 중 무엇을 공개 API로 삼을지, 변환 규칙을 어디
   소유할지부터 새로 정해야 한다 — 이 저장소의 어떤 기존 컴포넌트도 색 값 자체를
   입력 데이터로 다루지 않는다(`semanticColors`/`ColorReference`는 전부 제품이 아니라
   시스템이 미리 고정한 토큰이다).
2. **대비·접근성.** 사용자가 고른 색이 텍스트/배경 대비 4.5:1을 만족하는지, 선택 UI
   자체의 포커스 인디케이터가 색상 스와치 배경과 충분한 대비를 유지하는지를 계약이
   보장해야 한다 — Statistic의 trend, UploadItem의 상태처럼 이 저장소는 "색으로만
   말하지 않는다"를 지켜왔는데, ColorPicker는 그 규칙과 정반대로 색 자체가 선택 결과인
   컴포넌트라 이 원칙을 어떻게 지킬지부터 새로 설계해야 한다(스와치에 값 텍스트를
   병기하는 것 정도는 쉽지만, 색맹 사용자를 위한 팔레트 순서·명도 대비 규칙은 가볍지
   않다).
3. **입력 방식.** 팔레트 탭, 텍스트 hex 입력, 슬라이더(hue/saturation/brightness) 최소
   셋을 하나의 컴포넌트가 조율해야 하고, 셋 사이의 값 동기화(hex 입력 중 오타 상태를
   팔레트에 어떻게 반영하는지)는 NumberField/Slider보다 훨씬 큰 상태 기계다.

수요 없이 이 세 갈래를 먼저 짜면 다음 사람이 "실제로 무엇을 위해 이렇게 무거운가"를
또 물어야 하는 계약이 된다. 반대로 실사용처가 나오면, 그 화면이 실제로 필요한 것은
이 셋 중 일부뿐일 가능성이 높다(예: 구단 색 하나를 브랜드 팔레트에서만 고르는 화면이면
색 공간 변환도 hex 입력도 필요 없다) — 지금 전체를 설계하면 그 실제 요구보다 큰 계약이
된다.

## 만들지 않은 것

`src/color-picker.ts`, `test/color-picker.test.ts`는 없다. catalog의
`{ name: "ColorPicker", category: "input", platform: "web", status: "planned" }` row와
`antDesignReferenceComponents`의 `ColorPicker → ColorPicker` crosswalk(`relationship:
"direct"`)는 건드리지 않는다 — 이름 자리를 지우는 것이 아니라, 지금 채울 계약이 없다는
것이다.

## 뒤집힐 조건

다음 중 하나가 실제로 측정되면 이 판정을 다시 연다.

1. BurnTok 또는 Yajalal에 사용자가 임의의 색을 고르는 실제 화면 요구가 나온다(예: 커스텀
   테마, 사용자 지정 하이라이트 색).
2. 요구가 팔레트에서 미리 정의된 색 중 하나만 고르는 좁은 범위로 확인되면, ColorPicker
   전체가 아니라 `Chip` 또는 `RadioGroup`의 시각 변형으로 더 가볍게 흡수될 수 있는지부터
   먼저 검토한다 — hex 입력·색 공간 변환이 필요 없는 한 별도 컴포넌트를 열 이유가
   약해진다.
3. 요구가 hex/RGB 자유 입력까지 포함하면, 이 문서의 세 갈래(색 공간/대비/입력 방식)를
   실제 화면의 좁은 요구에 맞춰 하나씩만 계약하고 나머지는 열지 않는다.
