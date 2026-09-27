---
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Web `EmptyState`·`Notice`의 `title`이 실제로 ReactNode를 받고, Native `Dialog`·`Sheet`가 element 제목을 받습니다.

Web: `EmptyStateProps`·`NoticeProps`가 `HTMLAttributes`를 그대로 교차해서 HTML `title?: string` 속성이
슬롯 타입과 겹쳤고, `string & ReactNode`가 `string`으로 접혀 제목 element를 넘기려면 `as unknown as` 캐스트가
필요했습니다(2026-09-27 포트폴리오 감사, 번뚝 EmptyState). `Result`·`Card`·`Section`처럼 `Omit<…, "title">`로
바꿨습니다. 같은 감사에서 `ClipboardButton.onCopy`가 DOM `onCopy` 이벤트 핸들러와 교차되어 값 콜백을 넘길 수 없던
결함도 같은 방식으로 고쳤습니다. 기존 문자열 제목은 그대로 컴파일됩니다.

Native: `DialogProps`·`SheetProps`의 `title`이 `string | ReactElement`가 됩니다. element 제목은 접근성 이름을
renderer가 평탄화할 수 없으므로 `accessibilityTitle: string`을 타입으로 함께 요구합니다
(`OverlayTitleProps` union). 문자열 제목은 예전처럼 그 자체가 접근성 이름이고 `accessibilityTitle`은 선택입니다.
헤더 정렬·닫기 컨트롤·dismiss 계약은 바뀌지 않습니다.

소비자 migration: Web에서 제목 element를 위해 넣었던 캐스트를 지웁니다. Native에서 제목을 꾸미려고
`as unknown as string`으로 넘기던 곳은 `title={<Text …/>} accessibilityTitle="…"`로 바꿉니다.
`Partial<SheetProps>`로 props를 합치는 래퍼는 `Partial<Omit<SheetProps, "title">>`처럼 제목 쌍을 분리합니다.
Native 필드의 `description`은 `accessibilityHint`로도 쓰여 여전히 문자열입니다.
