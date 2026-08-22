# Watermark — 계약을 만들지 않는다

## 문제로 제기된 것

Ant Design `Watermark`는 콘텐츠 위에 반복되는 텍스트/이미지를 덮어 출처나 소유권을
표시합니다. 이 컴포넌트를 검토하며 나온 관찰은, 유일하게 성립할 수 있는 계약이
**"덮개가 본문 낭독과 조작을 방해하면 안 된다"**는 것이고, 두 제품에 실제 수요가
없다면 만들지 않는다는 조건이었습니다.

## 판정: 만들지 않는다

### 1. 두 React 기반 제품 어디에도 실사용처가 없다

`Yajalal RN`(`modules/app-rn/src`)과 `BurnTok`(`apps/web/src`,
`packages/design-system/src`) 양쪽을 `watermark`로 전수 검색한 결과, 시각적으로 콘텐츠
위에 반복 마크를 덮는 코드는 없었습니다. 유일한 매치는
`modules/app-rn/src/features/notification/state.ts:48`의 "seen watermark"로, 이는 "이
알림까지는 읽음 처리됐다"는 **읽음 커서**를 뜻하는 이름일 뿐 시각적 워터마크와 무관합니다.
공유 흐름(`LineupRouteScreen.tsx`, `PlayerCompareScreen.tsx`)도 `Share.share({ message })`로
텍스트만 공유하고, 이미지를 만들어 공유하는 경로 자체가 아직 없습니다.

### 2. 같은 개념이 다른 스택에는 있지만, 이 패키지가 서비스하는 층이 아니다

Flutter 앱(`modules/app`)에는 실제 시각 워터마크가 있습니다 —
`modules/app/lib/managers/watermark.manager.dart`, `modules/app/lib/common/sharing/
app_name_watermark.dart`(공유 이미지에 앱 이름을 얹는 `AppNameWatermark`),
`player_detail_info.dart`의 등번호 배경 워터마크, `contrast.dart`의
`watermarkAlphaFor`(배경 명도에 따라 0.08/0.16 알파를 고르는 대비 계산)까지 갖췄습니다.
이는 "워터마크"라는 제품 개념이 회사 안에 이미 존재한다는 증거이지, **이 패키지가
계약하는 React/RN 스택**(`docs/architecture.md`: "React, React Native, DOM, Expo import는
코어에 들어오지 않는다")에서 검증된 vertical slice라는 증거는 아닙니다. Flutter 구현은
같은 렌더러 경계를 공유하지 않으므로 이 판정의 근거로 세지 않았습니다.

### 3. 유일하게 유효한 계약은 이미 있는 원칙의 적용일 뿐, 새 상태 축이 아니다

`Icon`(`src/icon.ts`)과 `Image`(`src/image.ts`)가 이미 decorative/informative
discriminated union으로 "장식용 콘텐츠는 접근성 트리에서 빠지고 상호작용을 가로채지
않는다"는 원칙을 확립해 두었습니다. 반복 마크가 본문 낭독·조작을 방해하면 안 된다는
관찰은 이 원칙을 "화면 전체를 덮는 장식 레이어"에 적용한 것일 뿐, Watermark만의 새
상태 축이나 접근성 개념이 아닙니다. 타일 밀도, 회전 각도, 캔버스/SVG 렌더링 방식은
"이 패키지의 층에 속하는가" 질문에서 렌더러의 몫입니다 — 플랫폼 중립 계약이 검증할 수
있는 입력이 없습니다.

## 만들지 않은 것

`src/watermark.ts`, `test/watermark.test.ts`는 없습니다.
`componentCatalog`의 `{ name: "Watermark", category: "feedback", platform: "web",
status: "planned" }` 행과 crosswalk의 `Watermark → Watermark` direct 관계
(`src/component-references.ts:123`)는 건드리지 않습니다.

## 뒤집힐 조건

1. BurnTok 또는 Yajalal RN에 실제 이미지 워터마크 요구(스크린샷 유출 방지, 공유 이미지에
   앱 마크 삽입 등)가 나타나는 vertical slice가 측정된다.
2. 그 슬라이스에서 "decorative overlay는 낭독·조작을 가로채지 않는다"는 기존 원칙 이상의
   새 규칙(예: 워터마크 밀도가 본문 대비 요건과 충돌해 별도 최소 명도 대비 계산이
   필요한 경우 — Flutter의 `watermarkAlphaFor`가 이미 이런 계산의 선례이니 이식 여부를
   먼저 검토)이 필요해진다.
