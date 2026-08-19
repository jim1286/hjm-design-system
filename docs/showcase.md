# HJM Showcase

HJM Showcase는 정적인 화면 모음이 아니라 공통 계약의 실행 가능한 문서입니다.
`componentCatalog`가 범위와 성숙도를, `showcaseManifest`가 각 컴포넌트에 필요한
시각·동작·접근성 증거를 소유합니다.

## 실행

```bash
pnpm install
pnpm showcase:web
```

정적 빌드와 타입 검사는 다음 명령으로 실행합니다.

```bash
pnpm showcase:web:check
pnpm showcase:web:build
```

## 환경 도구

모든 Web story는 toolbar에서 다음 환경을 즉시 바꿀 수 있어야 합니다.

- light / dark
- LTR / RTL
- 100% / 150% / 200% text
- full / reduced motion

RN on-device story도 같은 `showcaseEnvironmentMatrix`와 story identifier를 사용합니다.
Web과 Native가 같은 DOM/view tree를 만드는 것이 아니라, 같은 의미·상태 전환·접근성
결과를 제공하는 것이 parity 기준입니다.

## story 범위

`planned` 컴포넌트는 contract 문서만 제공합니다. `beta`와 `stable` 컴포넌트는 기본,
dark, 긴 문구, 큰 글자, RTL, reduced motion, 접근성 story가 필요합니다. behavior가 있는
컴포넌트는 keyboard interaction evidence가 추가되고, adaptive 컴포넌트는 Web/Native
parity evidence가 추가됩니다.

제품 전용 구단 마크, 경기 상태, 피드 콘텐츠 같은 의미는 HJM story에 올리지 않습니다.
BurnTok과 Yajalal의 실제 채택 story에서 공통 의미로 매핑된 결과만 보여줍니다.

## 세 개의 증거 층

- HJM Web Storybook(6006): 모든 Stable/Beta 계약을 개별 페이지로 제공하고 모든 환경 축을 전환합니다.
- BurnTok Web Storybook(6007): 실제 제품 Web renderer를 Tailwind·Next.js 환경에서 실행합니다.
- Yajalal RN Storybook(8082): 실제 Native renderer를 iOS/Android 기기에서 실행합니다.

HJM의 정적 Storybook은 `main` 갱신 시 GitHub Pages artifact로 배포됩니다. 빌드 후 검증은
Stable/Beta 컴포넌트 페이지가 하나라도 누락되면 실패합니다. 제품 Storybook은 각 제품 저장소의
CI에서 별도로 빌드·번들 검증하며, HJM 카탈로그의 story identifier로 연결합니다.
