# Flutter renderer 퇴역 기록

2026-10-18 전사 Flutter 제거 요청으로 `packages/flutter`의 Dart renderer·manifest·lock·테스트를 삭제했다. 별도 beta `hjm_flutter`는 npm React/React Native train과 독립된 Git 소비 패키지였다. Sheet·layout 등의 공통 표현을 제공했으며 최근 React Native 계약과 동일한 기능을 보장하지 않았다.

삭제 전 소스: Git `94caa4ed52c161fe6f545b6b4a16ccc7806a9b4d`의 `packages/flutter`. 현재 소비자는 `@hjmds/react` 또는 `@hjmds/react-native`와 contracts를 사용한다. 이 삭제는 npm 게시나 제품 버전 상승을 뜻하지 않는다. 과거 검증 기록은 당시 범위로만 읽는다.
