# Security policy

## 지원 범위

최신 minor release train만 보안 수정 대상입니다. 세 public package는 fixed version train을
사용하므로 `@hjmds/design-contracts`, `@hjmds/react`, `@hjmds/react-native`의 버전을 함께
확인해야 합니다.

## 취약점 신고

공개 GitHub issue에 재현 코드나 exploit 세부 정보를 올리지 마세요. 저장소의 GitHub
Security Advisories에서 **Report a vulnerability**를 사용해 다음을 전달합니다.

- 영향을 받는 package와 version
- 최소 재현과 예상 영향
- 알려진 완화책
- 공개 전에 협의가 필요한 일정

접수 사실은 가능한 한 3영업일 안에 확인하고, 영향·수정 범위·공개 일정을 신고자와
조율합니다. 계정 토큰, 실제 사용자 데이터, 제3자 시스템을 사용한 검증은 하지 마세요.

## 보안 경계

HJM renderer는 인증, 권한, 입력 정화, 파일 업로드 전송, URL 신뢰 판정을 소유하지
않습니다. 제품은 외부 링크·HTML·파일·서버 오류를 신뢰 경계에서 검증해야 합니다.
