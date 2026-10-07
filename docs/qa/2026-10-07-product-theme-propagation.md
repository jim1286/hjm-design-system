# QA 리포트 — 앱 소유 테마 전파

## 1. 최종 판정

부분 확인: Web 실제 fixture 흐름과 양 Showcase 타입/실험 등록 통과. Native 기기·실제 제품 적용·게시 검증은 수행하지 않았다.
2026-10-07 18:25~18:32 KST, root 수행. 조사 범위는 사용자 “필요한것만 조사해” 지시에 따라 닫힌 상태를 유지했다.

## 2. 대상과 이력

main `1e1a339f754b4ea87d3a420476714afb86aa5369`에 미커밋 제품 설정/비교 fixture 변경을 포함했다.
공유 checkout의 다른 세션 Comment/MessageComposer 변경도 빌드 환경에는 존재하므로 이번 검증을 그 기능의 검증으로 확대하지 않는다.
검증한 frozen Storybook index SHA-256: `fb11ae550e6c6ce11c6e6554d46938ae74af22afeaf24f7640e64208fc7d60fe`.

| 대상 소스 | 검사 시 SHA-256 |
| --- | --- |
| `showcase/shared/product-design.ts` | `cdda32f0023b8a1195b4b01eddd57c822c92b8cc03cc9f1e8503a6bd993e0c94` |
| Web `design-profile-preview.tsx` | `169d5c81a6c966746b97873d186eb2b7045a072f91d36f02217e2ac5a6be49ed` |
| Native `design-profile-preview.tsx` | `d356949082ce7651a0f1996a217cad51719b8b77f1d9e322e90048e07b47956f` |

기존 비교는 10종 공통 preset만 제공했다. 이제 `defineHjmDesignProfile`의 `extends`로 산책 노트/문장 모음의 색·구성·화면·상호작용 기본값을 조합한다.
공통 파일은 설정 데이터/순수 factory만 가지며 각 renderer가 설치된 공개 helper를 주입한다. 제품별 Provider·상태 엔진·전역 CSS를 복제하지 않았다.
양 플랫폼 기존 경로 `실험/구성/비교와 검증/테마 조합`에 ProductNotes/ProductReading 변형을 추가했다. 새 공통 preset이나 별도 실험 엔진 등록은 아니다.

## 3. 환경과 범위

Chromium 154.0.0.0 / macOS, devicePixelRatio 1, localhost 정적 Storybook artifact. 실제 API/계정 없이 한글 합성 기록 fixture.
1200×818, light/ltr/기본 모션/글자 배율1에서 참고·산책·문장 ×10테마를 검토했다.
390×844, dark/rtl/reduced-motion/배율1에서는 산책+paper·문장+forest를 추가 확인했다.
Provider DOM의 theme=dark/motion=reduced/textScale=1과 실제 computed direction=rtl을 확인했다. OS 최대 글자와 최대값 모사 확대는 제외했으며 LargeText 변형은 실행하지 않았다.

## 4. 확인 결과와 문제

| 흐름 | 실제 결과 | 판정 |
| --- | --- | --- |
| 3설정 × retro/paper/forest/minimal/editorial/brutalist/glass/aurora/terminal/clay | 30/30 동일 main/input DOM 노드·입력 `앱 전환 후에도 남는 초안`·이번 주 선택 유지, main 가로 overflow 없음 | 통과 |
| 제품 설정 전파, retro 대표 비교 | 참고 primary #973c20/dashboard/1136px → 산책 #285c35/landscape/1136px → 문장 #59435f/editorial/720px. 상속 radius-lg=6px 유지 | 통과 |
| 전체 30조합 VQ 한 장 비교 | 1744×6195 contact sheet에서 상속된 표면·경계·위계와 카드/행 배치, 두 제품 설정의 색/화면 차이를 검토. 제목/본문/주 행동의 잘림을 관찰하지 않음 | 확인한 화면 통과 |
| 실패 → 제품 산책/테마 paper 전환 → 다시 저장 | 실패 안내와 초안/동일 입력 노드 유지. 재시도 후 `미리보기 기록을 저장했어요` | 통과 |
| Dialog 입력 → 다음 테마 → Escape | `대화상자에서도 유지` 유지, dialog primary #59435f. 닫힘 후 `대화상자 열기`로 초점 복귀, 본문 초안 유지 | 통과 |
| 좁은 dark/rtl/reduced 설정 | 산책-paper primary #477c54, 문장-forest #846b8e, main358px, main/page overflow 없음, 본문 `좁은 화면 초안` 동일 노드 유지 | 통과 |
| 좁은 화면 탭 입력 → 다음 테마 → 제품 변경 | `탭 초안 유지`와 본문 초안 모두 유지 | 통과 |

좁은 화면의 주 행동 문구는 2줄로 표시되며 가려짐/영역 초과 없이 버튼 안에 있다. 이것은 OS 최대 글자 조건이 아니다.

처음 shared 파일에서 패키지를 직접 import한 타입 검사는 모듈 해석 실패였다. 공유 데이터/factory에 설치 의존성을 넣는 대신 각 Showcase에서 공개 helper를 주입하도록 수정한 뒤 양 tsc를 통과했다.
개발 서버 검사 중 공유 contracts/screens dist watch 갱신으로 Storybook `cannot render when not prepared`와 문서 remount를 관찰했다. 그 실행을 fixture 상태 유지 실패의 근거로 사용하지 않고 frozen static artifact에서 30조합을 새로 검증했다.
Python 정적 서버에서 JS 요청 `ERR_CONNECTION_RESET`을 관찰했다. 동일 artifact를 Vite preview로 제공한 뒤 실제 UI가 로드되고 모든 흐름을 통과했다. 마지막 navigation console 오류/경고 0건.
도구 snapshot 범위가 main으로 좁혀졌을 때 이전 상단 ref가 없거나, portal에 Provider DOM ancestor가 없어 관찰식을 수정한 일은 UI 실패가 아니다. 실제 성공한 재실행 결과만 위 표에 기록했다.

## 5. 로컬 검사

| 실행 명령 (대상 workspace) | 결과와 범위 |
| --- | --- |
| Web/Native `pnpm --filter @hjm/showcase-{web,native} exec tsc --noEmit` | 각각 통과, renderer 소비 타입 검증 |
| Native `storybook:generate` | 통과, 기존 비교 story의 두 export 추가 등록 |
| Web `verify:tokens` | 307소스·70개 정확 선언 통과 |
| Web `vitest run src/story-dependency-boundary.test.ts src/style-boundary.test.ts` | 2파일·2검사 통과, 정적 경계 검사 |
| Web `build-storybook` (본인 temp outDir) | 통과(10.07s), 기존 use-client/chunk 경고. frozen index에서 Default/ProductNotes/ProductReading/Dark/LargeText 5ID 확인; 마지막 변형 실행 제외 |

문서 링크592개·usage 토큰12/컴포넌트139/구성57/화면22·Storybook427파일/952ID 정적 검사 통과. 149후보/source SHA·실제 등록4항목(신규3+기존 개선1)의 양 플랫폼 export/경로/증거 검증 통과. 원격 CI/dispatch·버전 상승·npm 게시를 수행하지 않았다.

## 6. 미확인 범위와 후속 조건

Native는 타입과 story 생성/등록만 확인했다. 실제 기기 UI·OS/입력/모션 검수 후 승급한다. 이번 일을 기존 시뮬레이터 작업의 검증으로 보고하지 않는다.
두 설정은 합성 참고 fixture다. 실제 앱 dependency·lock·계약·브랜드 자산·URL/영구 저장·서버 계정 동기화는 제품 적용 때 소유 제품에서 확인한다.
모든 public 컴포넌트/optional host의 토큰 소비, 지원하지 않는 경계 표현, Web ViewTransition은 이번 fixture 검증으로 완료하지 않는다.
조사 미독해 페이지는 현재 후속·완료·릴리스 차단 항목이 아니다. 이번 source는 미게시 상태이며 과거 1.14.0 게시와 구분한다.

## 7. 보관 처리

QR 지침에 따라 위 결과/재현/실패 수정/미확인 범위를 원본과 대조한 뒤 본인 원시 출력만 제거한다. reusable fixture 소스와 출처/채택/등록 metadata는 보존한다.
원시 screenshot35개 총3885788bytes; 정렬된 이름/크기/SHA manifest의 SHA-256은 `9bc86b16379ae91854f81cc655be939b3d76d73d09b36682f3f1e2049620d70d`.
contact-sheet SHA `a9c03f20e57570c955a9bc5d15e21a0e99f0e38d00eb421b854edf6096a46d0f`, 실패 화면 `4fb6458276bd1c30a2dba3f6a6a646f5876765f8725c4d94e95e158104614c39`, Dialog `04b92e308368a3d2fafc8db814265fa5080a3581870a9b0e7f8e2577e050f0b2`.
좁은 산책 SHA `47142f7a8663fb15484f948320fc5d0b30c4e504d943890e909c8f03c417658a`, 좁은 문장 `052b13012a87cd024e84231a9b9551adc192901b01d454a40846255e966c8893`.
이미지와 원시 receipt JSON은 최종 보관물이 아니다. 이미지 파일 경로를 증거 링크로 남기지 않는다. 본인 runtime/tab·static 임시 빌드·확인 가능한 본인 snapshot만 정리하고 다른 세션의 watch/runtime/출력을 보존한다.


보관 정리 완료: 위35PNG·원시 receipt JSON·본인 static 임시 빌드를 제거했다. 본인6026/6027 서버만 종료하고 본인tab1을 닫은 뒤 기존blank tab0 보존을 확인했다. 다른 세션의 watch/Expo runtime은 보존했다. 명시적으로 관찰한 아래14snapshot도 실제 파일 확인·digest 기록 후 제거했다. 이전 실행에서 생성됐으나 이름/소유를 확인할 수 없는 출력은 임의 삭제하지 않았다.

| 제거한 본인 snapshot | bytes | SHA-256 |
| --- | --- | --- |
| `page-2026-10-07T09-28-38-936Z.yml` | 28159 | `837fa693974dff4ed2ae857cadb152da83c2627613f1bee7a092448e047f4439` |
| `page-2026-10-07T09-30-01-323Z.yml` | 26851 | `909bf67a75c38c109417e905531386909caabf35a4e78031c256b9145106a837` |
| `page-2026-10-07T09-30-11-504Z.yml` | 26858 | `e9fdbf9d953e49f86947bab7358c234f435060f534c58e5ef68a6c56709718c4` |
| `page-2026-10-07T09-30-12-645Z.yml` | 28807 | `1766a94163b8b75900cd10223ab9b191c88815a45081e05e0d5b4e3cbccf6d30` |
| `page-2026-10-07T09-30-22-903Z.yml` | 28822 | `15edc27dbb7e59fcfb13e665ad040edddb9940f6ad4ba5fd3b13cb4af4b2f4cd` |
| `page-2026-10-07T09-30-36-605Z.yml` | 27019 | `737b2903820369be117000f67d1d645eb296d5c77b87456bef66a727547ed1c4` |
| `page-2026-10-07T09-30-52-714Z.yml` | 29304 | `053686af88fa23695825c8b3f81a07648c236d20f491e413051e80b1402c70fe` |
| `page-2026-10-07T09-30-53-323Z.yml` | 29304 | `78efba45d570c175ad2a12f63bbe3522e543d257478fcfd7c19af3de96fbba61` |
| `page-2026-10-07T09-30-54-494Z.yml` | 29302 | `df949f5e81e8e641975dee84ebac87e6ce2425d18632f1bf8e8627e6b94608da` |
| `page-2026-10-07T09-30-55-191Z.yml` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `page-2026-10-07T09-31-12-708Z.yml` | 29091 | `8f253133cf73b408d8b153d95e702a0c74287ceefe3b9859de346772fd94e53c` |
| `page-2026-10-07T09-31-13-313Z.yml` | 29091 | `8715e45fe0dc68f84605d2bcfff3f29f04014af0029da284767a96d78591aeee` |
| `page-2026-10-07T09-31-22-913Z.yml` | 29095 | `cf7f983bef64ec6877ce7c2298cdfce4214ef921bd10e92cc015f6cc93ace0ce` |
| `page-2026-10-07T09-31-23-528Z.yml` | 26819 | `77ebadcf0b563a7a422a0cdb98c8f6876a90c9b6500f28f81c258d7a02911f03` |
