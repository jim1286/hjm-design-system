# Display, reading and technical font roles

검토일: 2026-10-07 · 추가 역할은 1.15.0 이후 미게시

조사 후보 A-05/C-T01은 제목과 읽기 본문에 다른 서체를 사용하는 실제 차이를 남겼다.
기존 `tokens.fontFamily.ui/code`만으로는 크기를 변경해도 이 차이를 전달할 수 없었다.
크기/굵기·document level·초안 수명을 건드리지 않고 optional `display/reading` stack과 Text의
`fontRole`을 기존 프로필에 연결한다. 별도 서체 registry/테마 Provider/문단 상태 엔진은 추가하지 않는다.

## 호환성과 역할

기존 ui/code-only 설정의 표시와 읽기는 **현재 ui**를 따른다. 기본 stack을 새 역할에 복사하면
제품 ui override를 무시하게 되므로 역할 생략은 생략으로 보존하고 renderer에서 fallback을 해석한다.
설정과 모든 지정 배열은 복사·동결하며 호출자의 배열을 동결하지 않는다. persisted JSON의 알 수 없는 역할,
문자열 대신 stack 요구를 위반한 값, 비어 있는 배열/이름은 TypeError로 거부한다.

Heading 및 의미 제목은 display를 쓴다. Text의 heading/titleLarge/title 기본은 display,
body/bodyLarge는 reading, caption/label은 ui다. `fontRole` 명시값은 크기/굵기·의미를 바꾸지 않고
글꼴 역할만 바꾼다. heading role을 명시한 Text도 display를 쓰며 명시 fontRole이 우선한다.
입력과 버튼 등 조작 host는 기존 ui를 유지하고 CodeBlock 등 기술값은 code를 유지한다.
모든 임의 슬롯·제3자 raw host의 스타일을 HJM이 자동 변경한다고 주장하지 않는다.

Web은 nearest Provider가 CSS stack 변수를 내보내며 semantic h1~h6·Text가 소비한다.
portal도 기존 Provider 복사 경로를 따라간다. Native는 View에 글꼴을 주어 전파할 수 없으므로
기존 Text/TextInput host와 `resolveNativeFontStyle`을 사용한다. 제목·본문은 역할 stack의 첫 named font,
code의 기본 monospace는 iOS Menlo/다른 host monospace로 번역한다. ui 기본 stack은 OS 기본을 유지한다.
중첩 neutral Provider는 부모의 서체 역할도 중립으로 되돌린다.

Web stack과 Native 단일 이름은 같은 설치 지원을 뜻하지 않는다. 폰트 파일·등록·다운로드·라이선스·
한글/숫자 글리프·굵기/italic font-face의 실제 표현은 제품 소유다. 참고 fixture는 Web Georgia/Palatino stack,
iOS는 Apple이 열거한 동일 시스템 이름, 다른 Native host는 serif를 요청한다. Native 기기 검증 완료를 뜻하지 않는다.

공식 host 근거: [React Native Text의 제한된 상속](https://reactnative.dev/docs/text#limited-style-inheritance),
[CSS font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family),
[Apple system fonts](https://developer.apple.com/fonts/system-fonts/).

[사용 지침](usage/tokens/font-roles.md)·[프로필](design-profile.md)·[타이포그래피](usage/tokens/typography.md)를 함께 따른다.
