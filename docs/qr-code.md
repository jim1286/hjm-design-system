# QRCode — 계약을 만들지 않는다

## 문제로 제기된 것

Ant Design `QRCode`는 문자열을 스캔 가능한 격자로 그리고, 오류 정정 레벨(`level`)과
만료/로딩 상태(`status: active | loading | expired`)를 함께 다룹니다. 이 컴포넌트를
검토하며 나온 관찰은 다음과 같았습니다 — 오류 정정 레벨, **스캔이 가능한 최소 렌더
크기**, 대비 요구(밝은 배경 위 어두운 모듈), 그리고 **QR을 읽을 수 없는 사용자를 위한
대체 경로**(같은 목적지의 링크·텍스트)가 계약할 거리로 보인다는 것이었습니다. 다만
인코딩 자체(문자열 → 격자 픽셀)는 이 패키지가 하지 않고 제품이 라이브러리로 그린다는
전제도 함께 있었습니다.

## 판정: 만들지 않는다

### 1. 두 제품 중 어디에도 실사용처가 없다

`Yajalal RN`(`modules/app-rn/src`)과 `BurnTok`(`apps/web/src`, `packages/design-system/src`)
양쪽을 `qr`/`QRCode`로 전수 검색했지만 실제 화면 코드에서 QR을 그리거나 스캔하는 곳은
없었습니다. 유일한 매치는 웹팩 빌드 산출물의 우연한 해시 문자열(`0qr3`, `1qr_kgj`)뿐으로
제품 코드가 아닙니다. 티켓·프로필 공유·앱 다운로드 유도 등 QR이 흔히 쓰이는 흐름 자체가
두 제품 어디에도 아직 없습니다.

### 2. 진짜 계약처럼 보이는 부분은 이미 다른 컴포넌트가 소유한다

관찰에서 유일하게 "새 상태 축"처럼 보였던 것 — **QR만으로는 도달할 수 없는 사용자를 위한
대체 경로가 함께 있어야 한다** — 는 사실 새로운 개념이 아닙니다. `src/image.ts`의
`ImageDescriptor`가 이미 정확히 같은 모양(`Icon`과 동일한 decorative/informative
discriminated union)으로 이 문제를 풀어 두었습니다: 사진 자체가 유일한 정보 전달
수단이면 `decorative: false` + 현지화된 `accessibilityLabel`이 함께 필요합니다
(`docs/image.md` "대체 텍스트의 의무 — Icon과 같은 모양"). QR 코드를 `decorative: false`
`Image`로 취급하고 그 옆에 같은 목적지를 가리키는 `Link`를 나란히 두면, "대체 경로 없이
QR만 보여주지 않는다"는 계약은 새 컴포넌트 없이 이미 성립합니다. antd가 갖는
`status: active | loading | expired`도 `Image`의 `idle | loading | loaded | error` 콘텐츠
상태를 그대로 쓰면 되는 문제입니다.

남는 것 — 최소 렌더 크기, 모듈 대비 — 은 상태 축이 아니라 **인코딩 라이브러리가 실제
모듈 크기를 알아야 계산할 수 있는 렌더링 파라미터**입니다. 이 패키지는 인코딩을 하지
않기로 이미 전제했으므로, 이 값을 검증할 입력 자체가 이 계층에 없습니다. Statistic이
포맷된 문자열만 받듯, QR 크기·대비도 그 값을 실제로 계산하는 제품/렌더러의 몫입니다.

### 3. 결론

새 상태 축도, 새 접근성 개념도 남지 않습니다 — 유일하게 유효했던 부분(대체 경로 의무)은
`Image` + `Link` 조합으로 이미 표현 가능하고, 나머지는 렌더러가 소유하는 인코딩
파라미터입니다. 측정된 제품 요구도 없습니다. `docs/authoring-brief.md`와
`docs/expansion-roadmap.md`가 명시한 대로 이 저장소는 측정되지 않은 표면을 미리 만들지
않습니다.

## 만들지 않은 것

`src/qrcode.ts`, `test/qrcode.test.ts`는 없습니다. `componentCatalog`의
`{ name: "QRCode", category: "data-display", platform: "shared", status: "planned" }` 행과
crosswalk의 `QRCode → QRCode` direct 관계(`src/component-references.ts:103`)는 건드리지
않습니다 — 이름 자리를 지우자는 것이 아니라, 지금 채울 새 계약이 없다는 것입니다.

## 뒤집힐 조건

다음 중 하나가 실제로 측정되면 이 판정을 다시 엽니다.

1. Yajalal 또는 BurnTok에 QR이 실제로 필요한 vertical slice(예: 오프라인 티켓, 프로필
   공유 QR, 앱 설치 유도)가 나온다.
2. 그 슬라이스에서 `Image` + `Link` 조합으로는 표현할 수 없는 새 요구(예: 코드 자체의
   유효 기간을 컴포넌트가 알아야 하고, 만료를 `Image`의 `error` 상태와 다르게 발표해야
   하는 경우)가 나온다.

## catalog 배선 명세 제안 (리드 적용, 참고용)

지금은 변경할 것이 없습니다. 실제로 QR이 필요해지면 새 recipe를 만들기보다
`imageRecipe` + `linkRecipe` 조합으로 시작할 것을 권합니다.
