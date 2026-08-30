# Contributing to HJM Design System

HJM은 계약, Web renderer, React Native renderer, Showcase evidence를 같은 변경에서
함께 관리합니다. 새 API는 한 플랫폼의 편의보다 공통 사용자 문제와 검증 가능한 의미를
먼저 설명해야 합니다.

## 시작하기

Node.js 20 이상과 저장소에 선언된 pnpm 버전을 사용합니다.

```bash
pnpm install
pnpm check
pnpm showcase:web:check
pnpm showcase:native:check
```

## 변경 규칙

1. 공개 컴포넌트 변경은 `componentCatalog`와 renderer evidence를 함께 갱신합니다.
2. 상태 축을 추가하기 전에 실제 제품 문제와 Web/RN 번역을 문서화합니다.
3. 사용자에게 보이는 문구는 renderer가 번역하지 않습니다. 제품이 지역화한 문자열을
   전달하도록 타입으로 요구합니다.
4. public package source가 바뀌면 `pnpm changeset`으로 SemVer 영향과 migration을 적습니다.
5. 생성 파일은 직접 수정하지 않고 `pnpm contracts:sync`, `pnpm build`,
   `pnpm evidence:sync` 순서로 갱신합니다.

## 컴포넌트 완료 조건

- renderer-neutral descriptor·validator·resolver 또는 명시적인 presentation contract
- Web/RN 지원 범위와 접근성 번역
- public granular export와 package boundary test
- default·dark·long copy·large text·RTL·reduced motion·accessibility evidence
- 행동 컴포넌트의 keyboard/host-action evidence
- Storybook 또는 Native gallery의 canonical preview
- 소비자 migration과 Changeset

계획된 컴포넌트의 자세한 저작 규칙은
`packages/design-contracts/docs/authoring-brief.md`를 따릅니다.

## 커밋 전 게이트

```bash
pnpm check
pnpm showcase:web:check
pnpm showcase:native:check
pnpm showcase:web:build
git diff --exit-code -- \
  packages/design-contracts/dist \
  packages/react/dist \
  packages/react-native/dist \
  packages/design-contracts/docs/generated
```

## 행동 강령

기술적 반대 의견은 재현 가능한 증거와 사용자 영향으로 설명합니다. 개인을 공격하거나
차별·괴롭힘·위협하는 행동은 허용하지 않습니다. 보안 문제는 공개 이슈 대신
`SECURITY.md`의 절차를 사용합니다.
