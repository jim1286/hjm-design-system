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

## 후속: Native Card의 테마 모서리

2026-10-07 KST, `ef9ae77491b29b740486925db26bb7e71ef42717` 위 작업 변경을 검증했다.
Component Gallery Card 77개를 비교하면서 바깥 Surface는 `tokens.radius[role]`, 내부 media
clip은 `surfaceGeometry.radii[role]`을 사용한 누락을 발견했다. 예를 들어 Clay의 `lg`는 44인데
내부는 foundation 16을 유지했다. 내부 clip도 같은 Provider token을 사용하도록 수정했다.
독립 clip 구조와 바깥 raised shadow, 공개 props와 테마가 없는 foundation 값은 유지한다.

| 검사 | 실제 결과·범위 |
| --- | --- |
| Native design-profile + deprecated-style-data-display | 2 files / 28 tests 통과. 새 Card 회귀는 10개 분위기+neutral+프로필 없음 × light/dark × sm/lg의 48조합에서 frame과 media clip의 같은 radius 및 바깥 overflow=visible을 확인 |
| Native typecheck·build | 통과, 생성 dist 갱신 |
| Native Metro Android production baseline | 66 families / 697 modules, raw 1477.8 KiB, gzip 363.9 KiB, 기존 상한 통과 |

이 후속은 실제 Native renderer와 mock host의 구조/스타일 검사다. iOS/Android 화면·이미지
raster clip·외곽 그림자의 시각 동등성은 기기에서 미확인이다. Web 소스는 변경하지 않았다.
원시 로그/이미지를 새로 저장하지 않았고 테스트 fixture·생성 dist는 재사용 소스로 보존한다.
전체 recipe의 프로필 token 소비 감사, 실제 glass blur와 clay inset shadow, 11개 사이트의
전수 검토 및 릴리스·소비 앱 반영은 계속 남아 있다.


## 후속: 테마의 다섯 제목 단계

기준 SHA: `06daaa5` → 같은 main 후속 작업. 2026-10-07 Component Gallery의
[Heading 29개 사례](https://component.gallery/components/heading/) 기본 갤러리를 비교한
뒤 기존 공개 HeadingDescriptor/recipe·공개 API 대응표·양 renderer를 직접 읽었다.
기존 코드는 프로필 typography를 level3~5에만 연결해 level1/2를 앱 테마에서 지정할 수
없었다. 새 Heading 엔진을 복제하지 않고 optional design-profile 토큰을 확장한다.
원본 링크 29개의 실제 행동·접근성 검토 완료로 세지 않는다.

| 항목 | 수정 전 | 수정 후 |
| --- | --- | --- |
| 큰 제목 level1/2 | 항상 foundation 40/32, 사용자 프로필로 변경할 경로 없음 | `tokens.heading.level1/level2`의 크기·행간·굵기를 양 renderer가 읽음 |
| level3/4/5 | typography heading/titleLarge/title alias만 사용 | 기존 alias 병합 유지, 명시 heading override가 우선 |
| 문서 순서 | semanticLevel로 따로 지정 | Web 실제 h1~h6, Native header/aria-level 유지 |
| 기존 소비 | 프로필 없으면 foundation | 동일 기본값 유지. 프로필은 앱 helper에서 완전한 데이터로 정규화 |
| 실험 비교 | 같은 화면과 상태만 비교 | 선택한 프로필 아래 제목 5단계 추가, 문서 단계는 모두 h3로 고정해 시각 크기와 분리 |

에디토리얼 level1/2 44/34px·행간 54/44px·굵기 500, 브루탈리즘 48/38px·행간
56/46px·굵기 800은 HJM의 실험 선택이다. 외부 사이트 수치·코드·폰트 자산 복제가 아니다.
나머지 프로필의 기본 display scale은 유지한다. `defineHjmDesignProfile`에서 역할별
부분 병합·immutable copy·범위 검사와 잘못된 persisted level 거부를 수행한다.

로컬 검증(Node 24.20.0):

- contracts design-profile: 6 tests 통과. 부분 상속·alias 우선순위·deep freeze·잘못된 치수/단계 거부.
- Native design-profile + deprecated-style-core: 39 tests 통과. OS host를 mock한 Node 검사다.
  Heading 5단계 × 프로필 없는 경로/neutral/10종/custom × light/dark = 130 host 조합에서
  최종 크기·행간·굵기·aria-level과 textScale 2의 한 번 적용을 확인했다. 실기기 proof 아님.
- Web design-profile + p1a: 8 browser tests 통과. 같은 130 조합을 실제 Chromium CSS에서
  390×844·RTL·2배 글자로 확인하고 가로 넘침을 검사했다. 별도 profile 상태 보존 회귀도 포함.
- Web composition-style SSR 회귀 102 tests 통과. 기존 Heading placement/style 병합을 포함한다.
- 세 package typecheck/build, 양 Showcase typecheck/test(Web 43·Native 21), token boundary,
  contracts projection/workspace/evidence/public API map/Storybook 규격과 renderer import graph 검사 통과.
- 공개 이름 추가 없음. 새 토큰은 optional profile subpath 안에 있고 원래 Heading import를 유지한다.

실제 로컬 Storybook 브라우저에서도 10종 × light/dark의 제목 100개와 스타일 값을 확인했다.
1280×720 viewport에서 제목 영역을 캡처해 아래 모음으로 남겼다. 전체 화면 재배치 증거는
앞선 화면 비교 모음과 구분한다. 390×844·dark·RTL·2배 글자·reduced motion에서 10종
모두 가로 넘침이 없었으며, 브루탈리즘의 큰 제목 96px와 하단 작은 제목까지 스크롤해 읽었다.

![10종 테마의 밝은/어두운 제목 크기](assets/2026-10-07-profile-heading-scales.webp)

![브루탈리즘 큰 글자와 하단 스크롤](assets/2026-10-07-profile-heading-narrow.webp)

Web 실제 브라우저와 Native Node host 검증을 구분한다. Native 실기기·전체 recipe 토큰
감사·원본 linked 구현·11사이트 전수·유리 실제 blur/클레이 inset은 미완료다.
원격 CI·버전업·npm 게시·소비 앱 갱신을 실행하지 않았다.

### 제목 검토 산출물 보관

유효한 viewport PNG 22개와 DOM 관찰 JSON 2개는 아래 SHA-256과 영구 모음에 필요한
수치/재현/미확인 범위를 이 보고서에 남긴 후 제거한다. 앞선 HMR 재빌드 중 캡처는
다시 찍어 덮어썼으며 검증 증거로 쓰지 않는다. 사이트 전수조사 원본은 조사 미완료라 보존한다.

| 원시 작업 파일 | SHA-256 |
| --- | --- |
| `aurora-dark.png` | `3614f1a66ef1e95dbe234917984633056c7bc403429bc8bbc6073b51984db2c1` |
| `aurora-light.png` | `d99ea5699e3f9c7bd37ebcb248e8398e56a257d07eebf97c5043ef0ffc5968cd` |
| `brutalist-dark-rtl-2x-lower.png` | `be674f655e376c9aff5fca12b5547570334fc08da93761508febf126810c544c` |
| `brutalist-dark-rtl-2x.png` | `cf96a9edd5b1f15a1a81794a32478c4103b3dbd2ed8cbe979e62d865a47ba077` |
| `brutalist-dark.png` | `4b6ff8f3fb51ceebadcf2c2d37345194fb1d1422a0a155f7f9a7d28323a5e790` |
| `brutalist-light.png` | `6ce248b7312376cbec383a1f45a901348b66e8fe21675343acf5a7ec66916dec` |
| `clay-dark.png` | `1a1b67835fb6ba28b4ed248a9acad5cd2f84652d438a2e8d90dc9cf585a0bd1a` |
| `clay-light.png` | `36f50985d6580b112e3a707cee487e5e061c3ccf606db39cc832cbbeed69f3ef` |
| `editorial-dark.png` | `b5f972651fc5f22f146695a23729f72048efcd9d231464e4043d87d696a6eccc` |
| `editorial-light.png` | `17a3f08ea7c77a135a2d512f6a8a9aa5b080e4ce16f4965ce966d88a17d46531` |
| `forest-dark.png` | `0b6d6001a24ba9cf23c37a9362ff37b84cfce45e9e07afa92f8b4b0642959e8f` |
| `forest-light.png` | `2332305dae86bde53430cfba0c72ba292f2bdca729248719992c8db6fe3af24f` |
| `glass-dark.png` | `6fb72f95f949c460295aa4d40fc74d1416b5e7d1831611a34861e63d2eecd226` |
| `glass-light.png` | `9ba68282c29ec149a8e013171df665f8e15199b5893829f57ee1901d04101356` |
| `minimal-dark.png` | `6693f12c592cca8e7b9e2866002a2403f308fdb260901a326fe7c9971f4c684a` |
| `minimal-light.png` | `d48ec7797b69e784dbd8537fce182e837e9bd32053b9491f1fb318392e060ef6` |
| `narrow-observations.json` | `25835a0274fc65d1cc50bd84c35342d73592fe1280d2fe72e0ac83a4b030e99b` |
| `observations.json` | `a019285e0e3c829c3f83ec00e2061e36c31eaf69fc0e4a2e709fb433303e4893` |
| `paper-dark.png` | `394e52a5f6a908a04e8ebc4c0c76fcf488b72ea4fa50f3fb8f27eaebc20f2b57` |
| `paper-light.png` | `98b0c3c9cdff1e0428a6e4e645de35b504588ff52cacce3cf0f6c953a75f799d` |
| `retro-dark.png` | `3f7f472ec38cbb5f49403db0c79aae341273e0a40e24568dde828b5081211484` |
| `retro-light.png` | `aabd8ce06743a66ef1f297a6f796629162f77afa26428bd142d6400e119ce6f9` |
| `terminal-dark.png` | `976a8225617bf89a79707eff0d16604427e0fcabb85ede696af8e873688af095` |
| `terminal-light.png` | `c61a0179108e467cdf5797ce9653a2dc1f9bdfac623952178701cd235d674fda` |

### 이번 변경의 로컬 검사 종료 기록

- 첫 `pnpm check`는 contracts 1,011개 중 이전 PR CI 트리거를 요구한 회귀 1개가 실패했다.
  사용자 결정대로 버전 의도 정책을 유지하고 해당 테스트를 고쳤다.
- 재실행에서 contracts **98파일/1,011개**, Native **105파일/1,221개**, Web SSR
  **18파일/278개**는 통과했다. Native Metro Android production bundle은 697 modules,
  raw 1,477.7 KiB·gzip 363.8 KiB다. 기기 실행이나 성능 증거는 아니다.
- Web 전체 Chromium은 **1,124 통과/1 실패(108파일/1,125개)**다. 기존 ContextMenu의
  키보드 재개방 직후 ArrowDown 시 삭제 대신 이름 변경이 남았다. 테마 제목 파일의 실패가 아니다.
  같은 메뉴 파일의 단독 재실행은 **2개 통과**했으나 전체 안정성 확인을 대신하지 않는다.
  실패 원인 확정·전체 재실행 통과는 미확인으로 남긴다. 메뉴 source를 임의 수정하지 않았다.
- 변경 범위의 profile/Heading 검사·양 Showcase 검사는 위 기록대로 통과했다.
  `pnpm showcase:web:build`도 exit 0, 103개 canonical Web story와 탐색 13페이지 정적 검증을 통과했다.
- 원격 CI는 실행하지 않았다. 버전 상승·게시·소비 앱 반영도 하지 않았다. 일반 개발 검증은
  변경 범위의 로컬 검사로 진행하며, 이미 실패한 전체 검사 결과를 녹색으로 표현하지 않는다.

### 로컬 검사 원시 산출물 보관

명령·수치·실패와 재실행 범위를 위에 보존했다. 아래 원시 파일은 digest 확인 후 제거한다.
기본 Gallery 전수조사의 raw 자료는 linked 원본과 환경 검토가 남아 계속 보존한다.

| 원시 파일 | SHA-256 |
| --- | --- |
| `profile-heading-local-check.log` | `d331954cf9a65bf25e994deb773732909c65d51690ce7065745b27dc3ea6b38d` |
| `profile-heading-local-recheck.log` | `a2ef9798bc16f9453c8a5a4a5d25d884b81c1e5f47e97bd254b290d5119d4991` |
| `context-menu-isolated-recheck.log` | `c4c8bfb9e05c44070e52b0a1528eb18fda2bd5536e2a2113faee317288e5dbf3` |
| `profile-heading-showcase-build.log` | `b4d99ed82bcefab7ec3e1c4e35693f1d66f92ed1989a9e7e0857fa3b6a2f61f0` |
| `opens-from-the-keyboard--tracks-the-active-item--and-restores-focus-after-dismissal-or-action-1.png` | `fb78eadcbba577d2f03d355cd5769d72a8a83c9f96f6c3100f532b8ae429dd58` |

### 후속 리서치: 질감 원본 구현과 재사용 경계

Magic UI의 [Noise Texture 문서](https://magicui.design/docs/components/noise-texture)는
기본 예제와 newsletter/button/input source, usage와 props를 읽었다.
[원본 구현](https://raw.githubusercontent.com/magicuidesign/magicui/cdb348cb4c72a9b54b554d8617801e479fbc8714/apps/www/registry/magicui/noise-texture.tsx) 전체 73행도 commit `cdb348cb4c72a9b54b554d8617801e479fbc8714`에
고정해 확인했다(body SHA-256 `90cad110cf368c95bd40edcdfe64d52c6aacb0656996e20867562787f4ca4c1c`).
fractalNoise·desaturation·channel slope와 root/rect opacity를 쓰며 HJM의 독립적인
periodic value-noise mask와 픽셀이 같은 구현은 아니다. 기존 noise 실험의 시각/입력 기록은
[질감 QA](2026-10-07-noise-experiment.md)에 있고, 이 source 독해를 새 기기 QA로 세지 않는다.

Aceternity [Noise Background](https://ui.aceternity.com/components/noise-background)의
props/두 demo 설명과 HJM resolver·Web/Native renderer를 대조했다. 기존
EffectSurface에 mesh/glow/noise·intensity·period·active와 semantic color·장식 접근성 분리,
reduced motion·화면 가시성/AppState 중지가 있다. 실제 backdrop blur는 없는 범위로 유지한다.
원본 Manual implementation·실제 데모 시각/모션·성능 검증은 아직 pending이다.

[공식 AI reference](https://ui.aceternity.com/llms-full.txt)의 서문과
[Licence](https://ui.aceternity.com/licence)의 제품 사용/재배포 범위를 읽었다. 제공된 licence와
개별 파일의 조건을 함께 확인하기 전 HJM package에 해당 원본을 복제해 배포하는 결정을
내리지 않는다. 이번 대조에서 Aceternity 코드를 HJM source에 복사하지 않았다. 독립적인
기존 HJM 표현을 개선하는 후보로 관리하며, 특정 파일 재사용 허용 여부는 별도 확인 대상이다.

Magic UI 257·Aceternity 501개 공개 URL의 본문 수집을 각 host 순차/2초 간격으로
시작했다. robots의 비공개 경로와 rate limit 중지 규칙을 유지한다. 수집·본문 독해·시각·
동작 검토는 각각 따로 기록하고 원격 CI·설치·npm 게시를 시작한 작업이 아니다.

## 후속 검토: 오버레이·선택 입력의 테마 소비 경로

기준: main `bd41c5a2ab0abbc6458bf985851865ccb8747f9c`에서 시작한 미게시 변경.
Provider에 새 토큰을 추가하는 대신 현재 공개 소비자의 직접 foundation/recipe 참조를 보완했다.
Web 전용 Dialog/Sheet/Toast 그림자 변수와 Native Dialog/AlertDialog/Sheet의 chrome, Select/Combobox의
option/trigger/sheet 모서리, Notice/Progress/Skeleton/일반 Toast가 대상이다. Surface의 기존 Android
shadow 근사를 내부 helper로 공유한다. Modal 상태 엔진·액션/선택·safe area·키보드 동작은 유지한다.
유리 실제 blur·클레이 inset 구현, 전체 11개 사이트 원본 검토, npm 게시·소비 앱 반영은 아직 미완료다.

### 실제 화면과 보존

- Web local Storybook 1280×720: 같은 열린 Dialog에서 10종 light 순회. 입력 값과 id 동일, aria-modal=true,
  모서리/그림자 변화 확인. terminal은 투명 shadow, brutalist는 radius=0/blur=0, clay는 외부 shadow 28/12/0.18.
- 같은 열린 Sheet에서 dark/RTL/textScale=2/reduced-motion 10종 순회. 입력 값/id 동일,
  각 scrollWidth=clientWidth=638. 390×844에서도 10종 scrollWidth=clientWidth=356, 닫기 target 44×44.
- Sheet 닫기→Dialog 열기로 같은 제어 초안 유지. 이때 새 입력 host id는 바뀌므로 이 흐름을 DOM node 보존으로 세지 않는다.
- Native는 실제 renderer를 mock host에서 검사했다. Dialog/Sheet 초안 subtree의 mount=1 유지,
  AlertDialog 역할/액션, 11개 preset+미지정+custom floating/color/radius 값, 무그림자 elevation=0,
  Select/Combobox 선택, Skeleton 명시 radius=13, Toast/Liquid presentation 회귀를 확인한다.
  Native의 기기 표시·VoiceOver·TalkBack·성능은 이번 검사 범위 밖이다.

![20개 테마 오버레이](assets/2026-10-07-profile-overlay-comparison.webp)

![좁은 화면의 오버레이](assets/2026-10-07-profile-overlay-narrow.webp)

최종 그림은 실제 viewport 캡처에서 오버레이 주변을 모아 보존한 비교이며 새 렌더나 참조 이미지 합성물이 아니다.
원시 PNG 23개와 DOM 결과 JSON 2개는 아래 digest로 검증 후 제거한다. 중간 실패는 이번 새 테스트 fixture의
필수 localized props/recipe 역할과 host 선택을 잘못 지정한 것이었고, 실제 Props 타입과 recipe에 맞춰 고쳤다.
기존 전체 브라우저 검사 ContextMenu 1건 실패/단독 통과 기록은 해소한 것으로 바꾸지 않는다.

### 직접 foundation 참조의 잔여 감사

TypeScript checker가 두 renderer src 전체에서 명시적 `@hjmds/design-contracts/foundations` import의
실제 symbol 참조를 추적했다. 타입/import만의 참조는 제외한다. 결과 18파일·50 runtime 참조다.
이 숫자는 결함 수가 아니다. Web 4개와 Native Text 1개는 프로필 미지정 fallback, FixedGlyph 3개와
Checkbox/Chip의 고정 selection mark는 글자 확대와 분리한 아이콘 슬롯이다. full radius는 계약상 고정이다.
나머지 일반 shape/type 역할·optional host 표현은 다음 변경의 실제 소비 경로 대조 대상이다.
이 감사는 recipe 내 숫자/객체, CSS literal, 다른 import 경로를 검사하지 않으므로 전체 테마 반영 완료 증거로 쓰지 않는다.

| 파일 | runtime 참조 수 | 토큰/당시 행 |
| --- | --- | --- |
| `packages/react/src/theme.ts` | 4 | radius:84, typography:87, fontFamily:103, shadow:148 |
| `packages/react-native/src/primitives.tsx` | 1 | fontFamily:203 |
| `packages/react-native/src/internal/fixed-glyph.tsx` | 3 | typography:12, typography:12, typography:12 |
| `packages/react-native/src/inputs.tsx` | 4 | typography:734, typography:735, typography:1181, typography:2307 |
| `packages/react-native/src/calendar.tsx` | 1 | typography:98 |
| `packages/react-native/src/date-picker.tsx` | 1 | radius:115 |
| `packages/react-native/src/navigation.tsx` | 12 | radius:452, radius:571, radius:829, radius:862, radius:908, radius:908, radius:943, radius:994, radius:1846, radius:1952, radius:2128, radius:2176 |
| `packages/react-native/src/data-display.tsx` | 10 | radius:165, radius:263, radius:498, radius:740, radius:1377, radius:1399, radius:1459, radius:1523, radius:1680, radius:1985 |
| `packages/react-native/src/agreement.tsx` | 2 | radius:95, radius:131 |
| `packages/react-native/src/tags-input.tsx` | 1 | radius:100 |
| `packages/react-native/src/mentions.tsx` | 1 | radius:113 |
| `packages/react-native/src/activity-heatmap.tsx` | 1 | radius:5 |
| `packages/react-native/src/code-block.tsx` | 2 | typography:10, radius:11 |
| `packages/react-native/src/folder-preview.tsx` | 2 | radius:4, radius:4 |
| `packages/react-native/src/navigation-bar.tsx` | 1 | radius:19 |
| `packages/react-native/src/saved-items.tsx` | 1 | radius:34 |
| `packages/react-native/src/sheet-gesture.tsx` | 2 | typography:20, radius:25 |
| `packages/react-native/src/toast-liquid.tsx` | 1 | shadow:16 |

### 원시 증거 digest

| 파일 | SHA-256 |
| --- | --- |
| `dark-sheet-aurora.png` | `026b8026d685da36bdcb18398140f8b316bc816d7b0f174523fd732e4a091903` |
| `dark-sheet-brutalist.png` | `bd5ef26f8e3b0046477bf07192395b296ca1da71f5a72a62d298769279aae2e2` |
| `dark-sheet-clay.png` | `ab01375f5869ec2cd463b104738fefc87b655ecd54fc533dfe8f0cd28a8b61ad` |
| `dark-sheet-editorial.png` | `920a986908d783d75cadb1c9f806e20b410379982db6cae4d7f90baa45095aec` |
| `dark-sheet-forest.png` | `5aba09c8d14efcf9425fab3d8079f52a37c7b58ac88be78d9d087fe956732af5` |
| `dark-sheet-glass.png` | `88e15df4cc376f560d4c11d9770aef27b91ed714deb0cc1b880f8e27fa881041` |
| `dark-sheet-minimal.png` | `4f8265553bb9958e19cbe747d97fb533d44c7b47c2d85d731709e156bf6165fb` |
| `dark-sheet-paper.png` | `1f9c525e27d7e6cdbcdd461cd19ea3971c5de34a9f189c687b15f625e5aaf1ad` |
| `dark-sheet-retro.png` | `4ce49b7f2d2c77bc0a7dddd28265e2e13d7575c203305dcfeef4318976fadfa0` |
| `dark-sheet-terminal.png` | `9e81987278803d330bd803d2b995dc8bc2dcef3f804d6ac44320b78786fae5f7` |
| `light-dialog-aurora.png` | `4ffe539edb8c49eeb777aef1f3ca6359bfccf26ef460daf6f5b9b823763486ba` |
| `light-dialog-brutalist.png` | `c69098163857c92d2a9dbda6768b5bbd1f3f09f63fa8845ac80b5051e4b48f8f` |
| `light-dialog-clay.png` | `6aaaa5d998505cd378c16dbb83fab0e65b542d99661fc457b87808c28e7ac5d2` |
| `light-dialog-editorial.png` | `1dd6e0bab711f7a3c5e31b4df232f4bf478f07e6a9d7402e91f40f3e8fd40a16` |
| `light-dialog-forest.png` | `f638e39e06e12e7f152cfd50a09b41880f6785f778a258d8470dcbf7147de8be` |
| `light-dialog-glass.png` | `9e860e28f3feba91a0898939d163665482121607b2023953ad21765bca7c7ad7` |
| `light-dialog-minimal.png` | `4597f7fc4a0583523178b38609ec0d36cbf395d56bed3f5ddd05c2be035290a5` |
| `light-dialog-paper.png` | `96f220ff7377e935b34fa92b881b394f28ae2bbf242ed3ff96cb7ca4ca4134cc` |
| `light-dialog-retro.png` | `80a0f6b123afa8ab6d0171be8585c038360a440329f98636f90c0e2b124e8fc2` |
| `light-dialog-terminal.png` | `dff13fec0af624dbe48e20a575eafe5530a92ff2886ec00662434e9a2a5e6d4d` |
| `narrow-dark-dialog-clay.png` | `9bd15fc0a79631d809a1f4a161f03135cef5ba750fc5489d4e323ab49ad5a1ff` |
| `narrow-dark-sheet-clay.png` | `266179cc7e770d0b986247dfcc93b742799f37b58c1b2b0d6e63af7fd87e9e04` |
| `narrow-dark-sheet-terminal.png` | `725b98fa8f47e428acac1777fd78ffdb76043db35aa0bfccd2b9996a0454f1c9` |
| `checks.json` | `91d43b5ab6e6e196b8cae3b1bfacc258f3d98c6987666e8d54be6ac8e443070a` |
| `narrow-checks.json` | `2b54a4370b284e150ee18f766cb836920c7e445d4818e580f632f4cad45e2a18` |
| `foundation-import-audit.json` | `bea210e1a81c87186357ecc25ac8b1db06017bc802ff05e2c3f7551ea3d664d6` |
| `audit-foundation-imports.mjs` | `26003380c165f963bbe995bdb1b69cfa571b30011a5d985c058d4d58e8f33827` |

### 대상 검사 실행

- Native: `pnpm --filter @hjmds/react-native exec vitest run test/design-profile.test.tsx test/dialog-actions.test.tsx test/alert-dialog-actions.test.tsx test/sheet-viewport.test.tsx test/deprecated-style-feedback.test.tsx test/toast-liquid.test.tsx` → 6파일/56검사 통과.
- Web: `pnpm --filter @hjmds/react exec vitest run --config vitest.browser.config.ts test/design-profile.browser.test.tsx test/sheet-layout.browser.test.tsx test/toast-layout.browser.test.tsx` → 3파일/18검사 통과.
- 두 renderer typecheck/build, Web Showcase 14파일/43검사 + token boundary 301소스/69선언,
  Native Showcase 6파일/21검사 + generate/typecheck 통과.
- usage 12토큰/139컴포넌트/54구성/22화면, docs 565 Markdown, API 308이름,
  Storybook 421파일/929Web id의 정적 검사 통과. 전체 runtime/원격 CI/기기/게시 결과를 뜻하지 않는다.
- 원격 workflow 실행·버전 변경·npm 게시 없음. 버전 상승 시 원격 CI를 실행한다.

원시 검사 로그 digest:
- `hjm-profile-overlay-native.log` SHA-256 `2be965e53adbd0ba6fc23e8f79fe58547e3b469e5a1cd63c0eb43111f06a3b36`
- `hjm-profile-overlay-web.log` SHA-256 `fc2f8305048e910cefd2ff5b84066b94c94bd23e5a35405613077613bcf9d7e3`

- `pnpm showcase:web:build` → exit=0, Storybook static build 및 103 canonical Web story/13 navigation page 검증 통과.
- `hjm-profile-overlay-showcase-build.log` SHA-256 `3602048b536db8f02d6624c14454e92d1048392696848a8a8ddb4e137f550150`
