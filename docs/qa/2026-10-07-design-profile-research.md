# 디자인 프로필 10종 조사와 구현

검토일: 2026-10-07 · 상태: 10종 실험 구현·로컬 검사 완료, 미게시 · 시작 SHA: `1482bea`

## 요구와 조사 범위

사용자 요청: 최소 10개 테마를 여러 참고 사이트에서 조사하고, 표현뿐 아니라 같은 기능의 상호작용·구성·화면 배치도 함께 선택한다. `neutral`은 기존 기본값이므로 10개에 포함하지 않는다.

2026-10-07 공개 문서·예제 설명을 직접 읽은 근거다. Refero의 측정·역할 설명은 사이트 자체가 해석/재구성이라고 고지한다. 아래 HJM 조합은 이를 참고한 독립 설계이며 원제품과 동등한 동작·모든 페이지 검수·폰트/자산 재배포를 뜻하지 않는다. 11개 사이트의 전체 페이지 검토는 별도 [계획](../plans/reference-release-utilverse-2026-10-07.md)에서 계속 추적한다.

## 출처와 채택 판단

| HJM 테마 | 직접 읽은 출처 | 확인한 표현/구조 | HJM에서 선택한 조합 |
| --- | --- | --- | --- |
| 레트로 | [Magic UI Retro Grid](https://magicui.design/docs/components/retro-grid) | 격자 배경, 기울기·셀 크기·밝음/어두움 선 색 옵션 | 따뜻한 잉크/작은 모서리/정적 noise + slide 전환/격자/가로 헤더. 원본의 3D 격자 애니메이션은 복제하지 않았다 |
| 종이 | [Refero Cursor](https://styles.refero.design/style/4e3b4717-84c8-4599-baaf-a343c3d619b6), [Magic UI Noise Texture](https://magicui.design/docs/components/noise-texture) | 크림 바탕, 작은 모서리, 절제된 표면, 질감 레이어 | 따뜻한 종이/정적 grain + fade/행/접이식 도구/문서형 헤더 |
| 숲 | [Refero Wise](https://styles.refero.design/style/367c0c6e-73a7-441c-a8ff-91d139ac60dc) | 녹색과 밝은 강조색, 둥근 행동/카드, 어두운 구역 | 자체 녹색 팔레트/넓은 곡률/mesh + rise/슬라이드 선택/카드/중앙 헤더. Wise 자산·폰트·색을 그대로 이식하지 않았다 |
| 미니멀 | [Refero Rows](https://styles.refero.design/style/8d4a4e15-31f1-4509-8d13-7746f85c20d7), [Refero shadcn/ui](https://styles.refero.design/style/0fd67ec5-7e9c-4ca9-b368-5d9c7388477a) | 제한된 색, 정렬과 여백, 얇은 경계 | 무채색/낮은 그림자 + fade/행/항상 펼친 도구/가로 헤더. 원본의 10px 글자는 기본값으로 채택하지 않았다 |
| 에디토리얼 | [Refero 자체 제품](https://styles.refero.design/style/3f296d6e-6a1c-45db-829b-afb078d49ab4) | 큰 제목, 넉넉한 세로 리듬, 문서형 제품 소개 | 낮은 곡률/28px 제목과 24px 본문 행간 + rise/행/접이식 도구/720px 읽기 폭. 별도 상용 serif는 번들하지 않는다 |
| 브루탈리즘 | [Refero Dayos](https://styles.refero.design/style/ee403055-480e-4bd4-9216-07c9ae2dde2e) | 강한 제목 대비·평평한 표면·큰 형태 | 사각 모서리/30px 강한 제목/짧고 단단한 그림자 + slide/카드/항상 펼친 도구/문서형 헤더. 사각 모서리는 HJM의 해석이며 원제품의 둥근 카드를 복제한 것이 아니다 |
| 유리 | [Uiverse Neon Corners Glass Card](https://uiverse.io/vishalmet/selfish-earwig-66), [Aceternity Background Gradient](https://ui.aceternity.com/components/background-gradient) | 반투명·blur·그라디언트 모서리/hover, 정적 배경 옵션 | 차가운 표면/넓은 모서리/정적 빛 + fade/슬라이드 선택/카드/중앙 헤더. 현재 실제 backdrop blur는 미구현이며 단색 표면 fallback이다 |
| 오로라 | [Aceternity Aurora Background](https://ui.aceternity.com/components/aurora-background), [Magic UI Bento Grid](https://magicui.design/docs/components/bento-grid) | 느린 빛 배경, 기능 카드 격자 | 자체 보라 팔레트/30초 mesh·glow + scale/슬라이드 선택/격자/접이식 도구/중앙 헤더. reduced motion과 화면 비활성 시 정지 |
| 터미널 | [Magic UI Terminal](https://magicui.design/docs/components/terminal) | 명령/로그 줄의 순차 표시, 지연 옵션 | 일반 monospace fallback/낮은 모서리/그림자 없음 + fade/행/접이식 도구/가로 헤더. 실제 제품 데이터는 타이핑 연출 때문에 늦추지 않는다 |
| 클레이 | [Uiverse adamgiebl Card](https://uiverse.io/adamgiebl/horrible-rabbit-39), [claymorphism 모음](https://uiverse.io/tags/claymorphism?theme=all) | 둥근·shadow·elevated 카드 분류 | 넓은 모서리/부드러운 바깥 그림자/낮은 grain + scale/슬라이드 선택/카드/접이식 도구/가로 헤더. 원본 CSS/실제 호버 동작은 아직 검증하지 않았고 inset shadow는 미구현 |

4개 참고 도메인에서 위 개별 문서/상세 페이지를 확인했다. Minimal Gallery 분류·목록도 열었지만 개별 원제품의 표현을 이 표의 확정 근거로 사용하지 않았다. 라이선스 표기 확인은 코드 복제 허가 전체 검토를 대신하지 않는다. 이 변경은 원본 코드·브랜드 이미지·폰트를 복사하지 않았다.

## 구현 경로

- `@hjmds/design-contracts/design-profile`: 10개 참조 팩과 neutral, 불변 결과, 앱 부분 수정, 양 테마 대비/값 검증.
- `HjmProvider.designProfile` / `HjmNativeProvider.designProfile`: 가장 가까운 프로필 상속. `brandPalette`는 선택된 프로필 팔레트 위에 적용된다. 기존 완성 `value`는 계속 지원한다.
- Web CSS 변수와 Native theme tokens: radius/typography/shadow/font family 전달. 기존의 정적 숫자 경로는 소비 API별로 조사해야 한다.
- `ContentTransition`/`SegmentedControl`: 생략한 prop만 프로필 기본값 사용. 명시적 prop, 방향, reduced motion을 유지한다.
- `ScreenLayout.presentation`: 명시적 값 → 프로필 화면 표현 → 기존 골격. 본문 상태·스크롤 엔진은 그대로 사용한다.
- optional `@hjmds/react/design-profile` / `@hjmds/react-native/design-profile`의 `OverviewScreen`: 공유 ScreenLayout·Grid·Surface·Collapsible·EffectSurface를 조합한다. 같은 stable id와 동일한 부모를 유지한다.
- `Collapsible.presentation="inline"` / `keepMounted`: 도구 표현을 바꿔도 입력 상태를 보존한다. 닫힌 DOM은 hidden, Native는 display:none + 접근성 제외. 기존 기본 닫힘 동작은 unmount로 유지한다.
- Storybook 양쪽 `실험/구성/비교와 검증/테마 조합`: 선택 전환과 10개 전체 비교, 실패 후 재시도 fixture. 실패·저장은 미리보기 상태이며 서버 저장을 뜻하지 않는다.

## 검증 기록

- 환경: Node 24.20.0, pnpm 11.18.0, 로컬 Chromium, 브라우저 기본 1280×720와 임시 390×844. viewport는 종료 전에 복원했다. 네이티브 기기·바이너리 빌드는 실행하지 않았다.
- 생성: `pnpm contracts:sync`, `pnpm build`, `pnpm evidence:sync`, `pnpm api-map:sync`, `pnpm usage:sync` 통과.
- `pnpm ci:check` **exit 0**: 공통 계약 98 files/1009 tests, Native 105/1219, Web SSR 18/278, Web browser 108/1123, Native Showcase 6/21, Web Showcase 14/43. Metro 기본 진입점·renderer 그래프·생성 drift·문서·governance·API 대응표·사용 지침·Storybook 규격, 웹 정적 빌드/검증 통과.
- 최종 Web Provider 미사용 호환 수정은 전체 browser 실행 뒤 들어갔으므로 별도 `vitest run --config vitest.browser.config.ts test/design-profile.browser.test.tsx test/screens.browser.test.tsx test/collapsible.browser.test.tsx`로 실제 매칭된 2 files/17 tests를 재검증했다. 이 최종 source는 뒤의 Web 빌드·Showcase 검사를 통과했다. 실행하지 않은 파일을 3 files로 세지 않는다.
- 신규 Native Overview 회귀 + 기존 화면 검사 2 files/18 tests 통과. SVG host만 mock하며 실제 프로필/화면/Grid/Surface/접기 및 로컬 상태 엔진을 실행했다. 이후 전체 Native 1219개 검사에도 포함됐다.
- 브라우저 실제 조작: 초안 `테마 전환 초안`·`이번 주` 선택 → 숲 → 저장 실패 → 재시도 성공 → 종이에서 도구 접기 → 미니멀로 전환. 초안·기간·성공 상태 보존, 같은 입력 id 유지, 닫힌 도구의 접근성 트리 제외를 확인했다. 10종 전환에서도 초안 유지.
- 실제 화면: 10종 light/dark 각 전체 화면을 보고 아래 한 장으로 비교했다. 좁은 폭 390px + textScale=2 + RTL + motion=reduced의 10종 모두 grid 326px 한 열, 문서 scrollWidth=390px로 가로 넘침 없음. 환경은 실제 Provider DOM의 `dir`, `data-text-scale`, `data-motion`으로 확인했다. 숲·브루탈리즘·클레이의 큰 글자 전체 화면은 별도 한 장에서 헤더부터 저장 행동까지 확인했다.
- 초기 검사가 잡은 문제: 새 export 목록 누락, literal 글자 굵기의 foundation 정책 위반, optional SVG 화면의 Metro 기본 fixture 혼입. 공개 경로 목록·foundation fontWeight 사용·기존 optional 경계 분류로 수정했다. 기존 바이트/모듈 상한을 올려 통과시키지 않았다.
- 구현 검토에서 수정한 문제: Web Surface의 정적 radius, Native Provider tokens spread 누락, 닫힌 Web 도구의 display:flex, 세로 헤더의 flex-basis 공백, Native 무그림자 프로필의 Android elevation, Web ScreenLayout의 Provider 필수화. 각각 토큰 소비/상태/호환 경로로 수정했다.
- 경고: 기존 일부 browser fixture의 React act 경고와 Storybook third-party `use client`/chunk 크기 경고가 남지만 검사는 통과했다. 경고를 기기 동작 또는 제품 성능 증거로 해석하지 않는다.

![10종 밝음/어두움 비교](assets/2026-10-07-design-profile-comparison.webp)

![실패 복구 후 입력·기간·성공 상태](assets/2026-10-07-design-profile-retention.webp)

### 미확인과 판정 경계

10종은 실제 공개 subpath·Provider·양쪽 Storybook에 **실험**으로 제공한다. 유리의 실제 backdrop blur, 클레이 inset shadow, 전체 기존 recipe의 프로필 토큰 소비 감사, iOS/Android 기기 시각·접근성·성능 검증, 모든 11개 사이트 전수 검토는 미완료다. Native Android 그림자는 플랫폼 elevation으로 근사하며 웹 blur 모양과의 픽셀 동등성을 주장하지 않는다. 이 변경의 Storybook 승격·npm 게시·소비 앱 설치/적용은 수행하지 않았다.

### 보존 처리

위 최종 비교·복구 그림은 전달용 결과물로 보존한다. 테마·환경별 원시 이미지 30개와 복구 원시 화면·임시 비교 이미지·DOM 검사 JSON·검사 로그는 SHA-256을 기록하고 리포트 확정 후 제거한다. 11개 사이트의 별도 진행 중 전수 조사 원본은 이 작업의 원시 출력과 구분해 계속 보존한다.


<details>
<summary>제거 대상 원시 출력 지문</summary>

| 파일 | SHA-256 |
| --- | --- |
| `theme-ci-check.log` | `b35d6bb9247dda76444bef2ba2e3f17c2e66b8b4fe98e27e83d80c32957621a4` |
| `theme-contract-budgets.log` | `3415b97db13bd7400fce8e96840eabd61f447b69846cd068fb100e6b7f1547e0` |
| `theme-native-overview-tests.log` | `3dc64e95540f43c0f1282bd129580c8b512192f65f3abff5d2e5d8803f4506ad` |
| `theme-native-tests.log` | `b80854b8b43ccc5dd1883e290554cd7ecd55b30fd259418c7814288e7305ae3b` |
| `theme-renderer-budgets.log` | `f0905b983d5c89d0197c95b13916613b3a4eaeef6bf7735a9eed76aba3453931` |
| `aurora-dark.png` | `362b219faa28bab34a81dea4ceb2dae3a2d933af8ebfbf2a1b55130609df268c` |
| `aurora-light.png` | `262570f42d083ba3e7530fa117195025030c429acaf146f4a84cb1461a68d074` |
| `aurora-narrow-large-rtl.png` | `b4848b28d8cec43a7c74ffbd1049cf4ae9b2f9e60b762c326df556727916a41b` |
| `brutalist-dark.png` | `74310b0d11db0b6c759d050de49a655a6c773f2f9fa3a2f2a444a61f9d8c4487` |
| `brutalist-light.png` | `4c02307fff080d06021d0a024d216857a8108d04184b17e6dc545604da03fa80` |
| `brutalist-narrow-large-rtl.png` | `7b267cd6f41735897adba8fc30a10ab557535ba2c43da387a77d09abd20a843d` |
| `clay-dark.png` | `2dcfe399580e1e955f5f5b50a80e329fc975b17ef1cb9350b413bb4c4d7c11cf` |
| `clay-light.png` | `ec14666ae8da24ed04b78113915112e4d51533023f17d5f5fd18fc20e6d5ee8f` |
| `clay-narrow-large-rtl.png` | `c1ebbb2e240083c23ca35afd8cbe48e98895c27c46ede460c679f8004ee15e26` |
| `editorial-dark.png` | `21642c2ff991807447a4d5262fd909fb49946e951769497e194e8523f11ffd84` |
| `editorial-light.png` | `75d6cf0cafa33c8448344239de63a67274e5b66cadf76ae41f5104d24d5c3542` |
| `editorial-narrow-large-rtl.png` | `0da436de772154ef4f85215fc13799b10df76c085c0a1c087905f888b395057c` |
| `forest-dark.png` | `875680f49c067b5d9d804034d71443f1d20466fda52034e38ed6a78f17b848c5` |
| `forest-light.png` | `e6f915dfd7ebb87e730b7cf3394de8198642f33ee86358a0c09814d1aa4861b0` |
| `forest-narrow-large-rtl.png` | `f024b5c065859277a13e66e1995f88bb73d8e130b1fc57310849f0e79b08ef98` |
| `glass-dark.png` | `9bd1f1e19caf4a082e57c3e6352ff0e188ce694be372e71561ccdd756982fa15` |
| `glass-light.png` | `443995317d037bd0eb4800b6db41745085dcfc5726090dda3475e7e673b6e973` |
| `glass-narrow-large-rtl.png` | `37ae09f77f865da7e68e089a7a3d6099747595c5f0aa435514281eab22373fa2` |
| `light-contact-sheet.jpg` | `a373f6e79059184990b5fdc18597026c5d45648970305e56142c1e1fae1deefa` |
| `minimal-dark.png` | `fe56403a8a7da797a99f1e69233f62f558da0b9094653995730e7410b1fcb68f` |
| `minimal-light.png` | `83193b7df455f0946c59201f9b323065b08b9710959f32bf284725d8bb0a8c9f` |
| `minimal-narrow-large-rtl.png` | `2c351be480e2f5de340db674c353258c14e405912a971d793183086f417061a0` |
| `narrow-checks.json` | `085a21e28a2861da9d56030831230e54b6d537b40cfed1975927c05d26ee7004` |
| `narrow-contact.jpg` | `dbaa471e6953a6ea9ff5eef50b474837e892e6697acacecfbafa2df4eca3be3f` |
| `paper-dark.png` | `a10bf0b2995078a26b9d18af53e53bea0e46ac8b6519930eca1710d3fe7236df` |
| `paper-light.png` | `65e782e3124b0907f34fdd09d6c42f45524fc5addc15e2a59e01640c8cf8027b` |
| `paper-narrow-large-rtl.png` | `7ef5c9a86eb7596b695ced210943a053469dbd398582f909d805719d58f8ed8b` |
| `regions.json` | `de317e12e2b2c09a2cc4de7f079ff7d666264c9ef73cb87b444222e728073d11` |
| `retro-dark.png` | `65fabb8a5bd624b471efeb18fd526b254380067ec0c28c177896bec3ee4492f7` |
| `retro-light.png` | `fc035ae1ef08e7b345d042f3803a6888f471cb5075e8c6f7b250738968d4ad8e` |
| `retro-narrow-large-rtl.png` | `dd86fb851b9873b63252d8bbe96702e518d3159d36a056303d354e55804f04d6` |
| `state-retention.png` | `c1b2849eee5adc429e1d431f0f4de272ff5dc05a25dec6992d18f591f93106db` |
| `terminal-dark.png` | `9600e63c6d6ae083b0e646614e12aed28280002a49b404bc4e8b5be5581cfc48` |
| `terminal-light.png` | `0bfceee868f011cc304984e45898c17bcf58cf9fd23c1030b01aa1b09d47eca4` |
| `terminal-narrow-large-rtl.png` | `da3630f4a020db63af20eb104c3dd8cd783b6734993b6a296653b52af1180f54` |
| `theme-web-final-tests.log` | `2f0a3abfff8b86f25d06b5741a2bd552f7b25d889c27e73a90a90bec7ab98348` |

</details>
