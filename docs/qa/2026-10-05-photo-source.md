# QA 리포트 — photo-source-2026-10-05

## 1. 최종 판정

**부분 확인 — 과거 기록 통합, 이번 정리에서 QA 재실행 없음.** 아래 수정 전 실패·수정 후 결과와 미확인 범위가 항목별 판정이다. 원시 기록이 있었다는 이유로 전체 통과·배포 완료로 판정하지 않는다.

## 2. 대상과 이력

- 저장소: `packages/hjm-design-system`
- 대상: photo-source-2026-10-05
- 기록 통합일: 2026-10-06 (Asia/Seoul)
- 정리 시점 HEAD: `6172d260ab673f80d4d93a9ccafb72207dc8ccc7`. 이 SHA는 과거 검사 대상 SHA를 대신하지 않는다.
- 미커밋 변경을 포함한 기존 관찰 기록을 통합했다. 원본에서 대상 SHA·환경·검사 실행이 확인되지 않는 항목은 미확인으로 남긴다.

## 3. 환경과 검증 범위

기존 기록에 적힌 브라우저·기기·OS·API·fixture 조건은 아래 작업 기록을 따른다. 정보가 없는 관찰은 환경 미확인이다. 개발·Release, 시뮬레이터·실물 기기, 실제 API·합성 fixture를 같은 검증으로 합치지 않는다.

## 4. 확인 결과·발견한 문제·재현과 수정

### README

### 사진 출처 선택창 Web 실캡처

390×844 Chromium 실제 renderer에서 light/dark/textScale=2를 열었다.
light (원시 산출물 제거), dark (원시 산출물 제거), 큰 글자 (원시 산출물 제거). HJM 기본 테마의 composition
시각 증거이며 Utilverse/BurnTok/Diairy 실제 native 카메라 화면 캡처가 아니다.
앱 배경이 없는 fixture의 dim scrim은 Modal backdrop이다.
`photo-source-evidence.browser.test.tsx`가 세 버튼의 화면 내 위치를 검사하고
VITE_PHOTO_EVIDENCE=1일 때 원본 PNG를 저장한다. 촬영/앨범은 제품 callback이며
이 fixture에서 OS picker·camera SDK를 실행하지 않는다.

Native/Web Storybook 경로: 실험/구성/사진/촬영과 앨범 선택.
선택/취소, dark, 큰 글자, camera unavailable 예제가 있다. Storybook 배포 승인/정식
npm 게시와 구분한다. 같은 작업에서 Native dismissal와 Web user-activation 회귀를 검사했다.

## 5. 검사·관찰 결과

별도 기계 판정 기록 없음. 위 서술형 기록의 확인 범위만 유효하다.

## 6. 미확인 범위와 후속 조건

- 위 원본 기록의 실패·보류·검증 불가 항목은 새 검사 없이 해결로 바꾸지 않는다.
- 기기·OS·API 환경, subject SHA, 검사 명령이 누락된 항목은 미확인이다. 실제 확인 후 이 리포트의 해당 항목에 환경과 재검증 결과를 보완한다.
- 빌드·업로드·심사·공개, 실제 사용자의 카메라·로그인·성능 등 원본에서 확인하지 않은 단계는 완료로 주장하지 않는다.

## 7. 보관 처리

2026-10-06 사용자 요청에 따라 QA 최종 기록을 작업별 Markdown 리포트로 통합했다. 이미지·영상·원시 JSON/JSONL·로그·생성 HTML·임시 스크립트는 관찰과 제약을 옮긴 뒤 제거한다. 원시 파일명은 위 관찰의 역사적 식별자이며 접근 가능한 증거 링크가 아니다. 제품 소스·재사용 QA 도구·fixture·계약이 소유한 증거는 이 정리 대상이 아니다.

- 통합한 파일: 1개; 제거 대상: 1개.
