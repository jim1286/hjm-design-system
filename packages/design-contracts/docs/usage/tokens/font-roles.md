# 표시·읽기·기술 글자

- 단계: 토큰
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.15.0 이후)
- 검토일: 2026-10-07
- 근거: [서체 역할 계약](../../font-roles.md), `src/foundations.ts`, `src/design-profile.ts`, 양 renderer Text/Heading/Provider
- 스토리북: `실험/토큰/색과 글자/표시·읽기·기술 글자`

## 언제 쓰나

앱의 제목·읽기용 본문·입력/조작 문구·기술값을 서로 다른 서체로 표시할 때 쓴다.
[프로필](../compositions/design-profile-comparison.md)에 font stack만 넣으면 기존 Heading/Text를 사용하는
구성·화면에 전파한다. 서체 파일을 선택/로드하고 출처를 검토할 때는 [글꼴 편집](typography-studio.md)을 쓴다.
참고 서체 조합을 제품 브랜드 기본값으로 복사하지 않는다.

## 값

| 토큰 | 값 | Web CSS 변수 | Native 경로 | 용도 |
| --- | --- | --- | --- | --- |
| `tokens.fontFamily.ui` | 기존 Inter/Pretendard 등 stack, Native OS 기본 | `--hjm-font-family-ui` | `theme.tokens.fontFamily.ui` | 입력·버튼·caption·label |
| `tokens.fontFamily.display` | optional stack, 생략하면 현재 ui | `--hjm-font-family-display` | `resolveFontFamilyStack(theme.tokens.fontFamily, "display")` | Heading·Text title/titleLarge/heading |
| `tokens.fontFamily.reading` | optional stack, 생략하면 현재 ui | `--hjm-font-family-reading` | `resolveFontFamilyStack(theme.tokens.fontFamily, "reading")` | Text body/bodyLarge |
| `tokens.fontFamily.code` | 기존 ui-monospace 등 stack | `--hjm-font-family-code` | `theme.tokens.fontFamily.code` | CodeBlock·Text fontRole=code |
| Text `fontRole` | ui/display/reading/code, 생략하면 위 variant 역할 | 같은 역할 변수 | 같은 역할의 첫 named font | 문구 역할만 변경. 제목 level·variant 크기/굵기는 유지 |

순수 helper `resolveFontFamilyStack`·`resolveTextFontRole`는 `@hjmds/design-contracts/foundations`에 있다.
Web은 전체 stack, Native는 기존 host helper로 단일 font name을 해석한다. Native의 기본 code는 iOS Menlo/그 외 monospace다.

## 쓰는 법

```tsx
// Web
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "@hjmds/react/provider";
import { Heading } from "@hjmds/react/heading";
import { Text } from "@hjmds/react/layout";

const design = defineHjmDesignProfile({ extends: "paper", tokens: { fontFamily: {
  display: ["ProductDisplay", "serif"], reading: ["ProductReading", "sans-serif"],
} } });
<HjmProvider designProfile={design}>
  <Heading level="level3">{t("reading.title")}</Heading>
  <Text as="p" variant="bodyLarge">{t("reading.body")}</Text>
  <Text fontRole="ui">{t("reading.actionHint")}</Text>
</HjmProvider>
```

```tsx
// Native
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { Heading } from "@hjmds/react-native/heading";
import { Text } from "@hjmds/react-native/primitives";

// Product registers these names with its font loader before selecting this profile.
const design = defineHjmDesignProfile({ extends: "paper", tokens: { fontFamily: {
  display: ["ProductDisplay"], reading: ["ProductReading"],
} } });
<HjmNativeProvider designProfile={design}>
  <Heading level="level3">{t("reading.title")}</Heading>
  <Text variant="bodyLarge">{t("reading.body")}</Text>
  <Text fontRole="code">{t("reading.recordId")}</Text>
</HjmNativeProvider>
```

## 하지 말 것

- 폰트 이름 지정만으로 파일 설치·라이선스·한글 글리프·실기기 표시가 확인됐다고 하지 않는다.
- 크기나 문서 제목 레벨을 서체 역할로 대신하지 않는다. Heading의 level/semanticLevel과 Text의 variant는 그대로 쓴다.
- 본문 글꼴을 입력에 직접 style override하지 않는다. 조작 host는 ui, 읽기 본문은 reading으로 분리한다.
- 같은 역할을 앱마다 또 다른 Provider/전역 CSS 엔진으로 구현하지 않는다. 설정·자산·로딩은 앱이 관리한다.
- 글꼴 전환 시 입력 또는 열린 상세를 key로 다시 마운트하지 않는다. 상태는 기존 구성/제품이 소유한다.

### 조작 라벨과 읽기 본문의 구분 — 미게시

2026-10-07 소비 감사에서 Native 조작 라벨 24곳이 body/bodyLarge 크기를 사용하면서 읽기 서체로 해석됐다.
Button의 내부 라벨·제공자 버튼·ToggleGroup·선택 컨트롤·Switch·SegmentedControl·Chip·Tabs·Menu·Select·
Combobox·동의·Toast 행동·Link·날짜 선택/Calendar 날짜·disclosure·멘션/태그 후보·TransferList는 기존
Text의 `fontRole="ui"`를 명시한다. 크기 variant는 그대로 유지하고 가까운 Provider의 ui stack을 읽는다.
본문/description의 reading, 의미 제목의 display, label/caption의 기존 ui와 고정 glyph는 바꾸지 않는다.
일반 Text의 기본값을 ui로 바꾸는 대안은 실제 읽기 본문의 제품 서체를 잃으므로 채택하지 않았다.

추가 1곳인 TopBar 제목은 Web과 같은 경계를 유지한다. 클릭형 제목은 일반 버튼 라벨이므로 ui,
비클릭형 제목은 의미 heading이므로 display다. 제목 행동·접근성 이름·정적 heading 역할은 유지한다.
서체 선택 검사는 Native host 모사에서 수행했으며 폰트 자산 설치·실제 기기 표시 검증을 뜻하지 않는다.
