# 파일 레퍼런스 계약 대조

검토일: 2026-10-07. HJM 기준 658960d. 원본 코드·미디어는 복사하지 않았다.

## 범위와 관찰

- [Component Gallery File](https://component.gallery/components/file/)의 여섯 사례 썸네일을 1280px 전체 화면으로 확인했다. Brighton 두 건, Lightning, Nucleus, ONS, TFWM이다. 썸네일 확인은 각 원본의 UI·기능 검증이 아니다.
- [Nucleus 원본](https://britishgas.design/components/ns-download/)은 기존 `/docs/components/ns-download`에서 정상 이동했다. 텍스트 수집의 cache miss를 사이트 접근 불가로 판정하지 않는다. 실제 Standard와 List 탭을 전환하고 문서 기본 Desktop/75% 미리보기를 확인했다. 목록에서는 긴 제목이 줄바꿈되고 형식·크기가 다음 줄에 표시된다. URL에 확장자가 없을 때 `file-type`을 받으며 `file-name`도 별도로 제공한다.
- [TFWM 원본](https://designsystem.tfwm.org.uk/components/file-download/)은 anchor의 `download`와 설명·형식·크기를 사용한다. 다른 형식 요청은 독립 링크다. 실제 파일 전송은 검사하지 않았다. 비접근성 예제의 설명과 Nunjucks `accessible: true`가 어긋나므로 설정을 그대로 복사하지 않는다.

## HJM 대조와 반영

| API | 확인한 계약 | 판단 |
| --- | --- | --- |
| Web Link (`actions.tsx`) | AnchorHTMLAttributes, 나머지 속성을 anchor에 전달 | 단순 다운로드의 `href`·`download` 제공 가능 |
| Web ListRow (`display.tsx`) | HTMLAttributes + href, download 없음 | 링크 행이라고 다운로드 속성까지 지원한다고 안내하지 않음 |
| Native Link (`actions.tsx`) | descriptor + onNavigate | 저장·공유 host의 성공/실패 상태를 대신하지 않음 |
| UploadItem | 업로드 진행·취소·재시도 | 게시된 문서 다운로드를 success 상태로 꾸미지 않음 |
| Asset | 미디어 종류·프레임·크기·대체 이름 | 파일명·형식·다운로드 행동과 동등하지 않음 |

Link/ListRow/UploadItem 사용 지침에 이 선택 경계를 반영했다. 단순 링크를 위한 중복 엔진은 추가하지 않았다.
미리보기·메타데이터·독립 행동·저장 실패 복구를 함께 제공하는 문서 구성은 후속 실험 후보다.
신규 실험으로 등록하거나 기존 15개 집계에 더하지 않았다.

## 미확인

여섯 원본 전체의 화면·변형·키보드·다운로드 동작, Native 저장/공유 host, 제품 팔레트·RTL·큰 글자·스크린리더가 남았다.
Nucleus 예제 다운로드는 실행하지 않았다. 브라우저 캡처는 도구에서 확인했으며 별도 원시 파일을 저장하지 않았다.

## 원본 경로와 Lightning 후속 관찰

2026-10-07 HJM `6acfb34` 이후 IAB 1280×720에서 확인했다.

- Brighton의 downloads-page와 supporting-content-documents 두 주소는 모두 design 하위 도메인에서
  www.brighton-hove.gov.uk의 같은 query로 이동해 Page not found를 표시했다. 검색 도구는 전자의
  4개월 전 수집 본문을 반환했지만 현재 UI 검증으로 세지 않는다. 원본 UI·다운로드는 미확인이다.
- Lightning의 기존 주소는 [v1 Files](https://v1.lightningdesignsystem.com/components/files/)로
  이동했다. 문서는 Winter '27 sandbox preview와 Desktop Only라고 표시한다. 기본 카드,
  이미지 없는 fallback, 제목 없는 표현, 제목 유/무 loading, 여러 첨부의 +22 더 보기 표현을
  실제 화면에서 확인했다. 4:3/16:9/1:1 변형은 DOM에서 존재만 확인했으며 전부 시각 검증하지 않았다.
- 첫 카드의 More Actions를 눌렀으나 메뉴는 보이지 않았고 DOM role=menu도 0이었다.
  미리보기 href는 #다. HTML/CSS blueprint의 배치·이름 근거이며 실제 preview/download/menu
  engine 검증으로 세지 않는다. loading은 퍼센트 없는 spinner, 미리보기와 하단 두 행동은 분리돼 있다.

채택 판단: 미리보기 실패와 저장 실패를 독립 상태로 다루고, 제목·형식·크기를 preview 유무와
무관하게 유지하는 문서 구성을 실험 후보로 구체화한다. [구현 계획](../plans/document-resource-experiment.md).
전체 카드에 누름을 걸어 안쪽 다운로드/메뉴와 중첩하지 않는다. 실제 host 완료 없이 성공 문구를
표시하지 않으며, HTML anchor의 다운로드 시작을 저장 완료로 판정하지 않는다.
Lightning 키보드·모바일·스크린리더와 실제 전송, Brighton 대체 공개 원본 탐색은 남았다.
이번 캡처는 도구에서 확인했고 로컬 원시 파일은 저장하지 않았다.

## 내부 구현 검증

`b680b19` 이후 문서 resolver 후보를 추가했다. 신규 8개와 기존 action-session 9개 검사는
preview 오류와 저장의 독립성, started/cancelled가 saved로 표시되지 않음, pending 중 재실행 금지,
명시적 retry 정책, 비활성, metadata 보존/불변성, 잘못된 상태 거절, A→B 뒤 A 성공/실패 무시를 다룬다.
contracts typecheck/build도 통과했다. 이 검사는 실제 파일 다운로드·OS 저장이나 UI 검증이 아니다.
새 export·renderer·Storybook은 없으며 17번째 실험으로 세지 않는다.

## 내부 renderer 회귀

2026-10-07 `c09b716` 이후 contracts subpath와 내부 Web/Native renderer를 연결했다.
contracts resolver 9개·action-session 9개·package boundary 4개, Web browser 3개·Native renderer
2개 통과. 세 package typecheck/build 통과. Web은 독립 버튼의 실제 클릭, preview 오류 후 metadata
보존·저장 가능, 위험한 retry 차단·한 저장 버튼, started/saved 차이, 320px와 2배 글자에서
light/dark × LTR/RTL의 긴 파일명 overflow를 검사했다. Native는 모의 renderer의 props/누름
callback·버튼 identity를 확인했으며 기기 QA가 아니다.

첫 Web 실행은 Vitest locator에 없는 isEnabled 사용 때문에 실패했고 expect.element(...).toBeEnabled로
테스트 API를 수정한 뒤 통과했다. 제품 동작 실패로 기록하지 않는다. 실패 시 생성된 캡처는 이 기록 후 제거했다.
공개 renderer·Storybook은 아직 없으며 실제 다운로드·native 저장 완료를 검증한 결과가 아니다.

## 공개 진입점·실험과 Web 다운로드 확인

2026-10-07 `7fa5453` 이후 로컬 main 변경. 양 renderer `document-resource` 공개 export와
공개 props, 양쪽 Storybook 네 환경 변형, 구성 사용 지침을 연결했다. 현재 17번째 실험이며
안정판 승격·npm 게시·Utilverse 적용은 아니다.

- 회귀: Web browser 3개 + package boundary 1개, Native renderer/package 4개, 공유 fixture
  2개(실패 재시도/중복 방지, 예제 지연 중 문서 교체 후 이전 host 미호출) 통과.
- 세 package typecheck/build, 두 Showcase typecheck, usage:check, docs 링크 570개,
  Storybook 417파일/922 Web id, 공개 API 대응표 306개 통과.
- renderer graph: Web 전용 진입점 5모듈, Native 8모듈. platform/module 경계 통과.
- IAB localhost:6006, 1280×720: 첫 내보내기 pending 잠금→합성 오류→재시도→시작 안내를
  관찰했다. 다운로드 event wait는 15초 timeout이었지만 Downloads에 07:18:50 생성된
  `문서-예제-1.txt` 76바이트가 존재했고 UTF-8 예제 본문과 바이트 단위로 일치했다.
  SHA-256 `7a91912ce9e6711d163bc5a5a6b086f9b077e7095daf44dccaae8cfb47f830d5`.
  이 한 번의 저장 증거를 모든 사용자 OS의 저장 성공 보장으로 확대하지 않는다. UI는 started다.
- 미리보기 오류 중 파일명/형식 보존, 본문 보기 잠금과 내보내기 활성, 미리보기 재시도로
  본문 복구를 확인했다. 검사 중 build HMR로 예제 상태가 초기화돼 빌드 완료 후 다시 확인했다.
- Native 예제는 Share.share 텍스트 공유 host다. 실제 파일 저장과 기기 공유/취소·iOS 상태
  알림·오류 복구 초점·전체 환경/팔레트/스크린리더는 미검증. 외부 6개 원본 전수도 미완료다.

보존: 다운로드 검증 파일과 임시 budget 로그는 위 내용/hash 기록 후 제거한다. 화면은 도구로
확인했으며 별도 원시 캡처 파일을 만들지 않았다. 재사용 fixture/test/source는 보존한다.

## Web 재시도 제거 후 키보드 초점 수정

`1db42de` 후 browser 회귀에서 retry 버튼에 focus한 뒤 preview ready로 바꾸면 activeElement가
body가 되는 실패를 재현했다. Web renderer는 ref 분리 전에 해당 버튼의 focus 소유를 기록하고,
commit 후 같은 문서/현재 body일 때만 사용 가능한 preview 또는 save 버튼으로 복귀한다.
문서 identity가 바뀌었거나 외부 버튼으로 이동했다면 초점을 가져오지 않는다. 로딩 전환에서는
비활성 preview를 건너뛰고 save를 사용한다. 별도 비동기 작업/플랫폼 모듈은 추가하지 않았다.

수정 후 Web browser 5개 통과(기존 3개 + 초점 2개), Web typecheck/build 및 renderer graph 검사
통과. 첫 typecheck는 테스트가 exactOptionalPropertyTypes에서 optional prop에 undefined를
전달해 실패했으며 조건부 prop 생략으로 수정했다. Native 스크린리더 초점은 이 결과에 포함되지 않는다.
실패 캡처와 임시 budget 로그는 이 기록 후 삭제하고 회귀 소스는 유지한다.

## Native 실제 TXT 공유·파일 저장

`bb32c0f` 이후 Showcase에 expo-file-system 57.0.7 / expo-sharing 57.0.22를 추가했다.
Expo 57.0.25 bundledNativeModules와 일치하며 공개 HJM package 의존성은 바뀌지 않는다.
공통 fixture는 host에 isCurrent guard를 전달해 availability 대기 중 파일 변경도 무효화한다.
Native host는 자체 TXT를 고유 cache 경로에 작성하고 textSync readback이 일치한 뒤 공유한다.
처음 probe는 옛 이름 ExpoFileSystem을 써서 누락 안내가 나왔으며 설치된 공식 소스의 실제
모듈 이름 FileSystem으로 수정한 뒤 공유 가능을 확인했다.

기존 iPhone 17 Pro / iOS 26.5 / Expo Go 57.0.9, UDID
AC433031-1746-46C6-86A9-143A1FC839F8에서 idb/simctl로 검증했다. Device Hub CUA는 사용하지
않았으며 새 기기·native build·기존 runtime 재시작도 하지 않았다. 기본 light/글자 배율이다.

1. 문서 내보내기 첫 합성 실패→재시도에서 OS 공유창을 확인했다. 제목 문서-예제-1,
   텍스트 문서·76바이트, Copy/파일에 저장 대상이 실제로 표시됐다.
2. 파일에 저장→나의 iPhone→저장을 눌러 예제로 복귀했다. 완료 문구는 저장 성공 대신
   공유창을 열었다는 안내다. Expo shareAsync는 Promise<void>이고 취소/저장 receipt가 없다.
3. Simulator의 Showcase cache와 File Provider Storage에 생성된 문서-예제-1.txt를 각각 읽어
   76바이트, SHA-256 `7a91912ce9e6711d163bc5a5a6b086f9b077e7095daf44dccaae8cfb47f830d5`
   일치를 확인했다. NFD 파일명을 NFC로 비교했다. 이 fixture 저장은 실제 관측이지만 공통 API가
   모든 공유 결과를 판정할 수 있다는 뜻은 아니다.
4. 공유창을 다시 열고 바깥을 눌러 닫았다. 취소를 저장 완료로 표시하지 않으며 같은 시작 안내로
   복귀한다. 수신 앱이 읽는 도중 파일 삭제를 피하려고 host는 share Promise 직후 제거하지 않는다.

검사: Native Showcase check(스토리 생성, 타입, 6파일 21테스트), Web Showcase typecheck 통과.
공유 fixture 회귀는 3개이며 native availability 대기 중 교체 후 guard false/결과 ignored를 포함한다.
중앙 library policy 정적 검사 통과(6 manifests/70 libraries). 중앙 등록부는 기존 dirty 변경을
보존한 채 HJM 두 라이브러리 소비만 추가했으며 전체 dirty 파일을 이 작업 커밋으로 가져오지 않는다.

남음: Android/iPad, VoiceOver/TalkBack·iOS status 알림, 큰 글자/다크/RTL/제품 palette 조합,
권한·디스크 실패, 외부 여섯 원본의 나머지 변형. 승격·npm 게시·Utilverse 적용은 미실행.
보존: 위 hash/흐름을 남긴 뒤 이번 생성 fixture의 cache 사본/Files 사본과 임시 screenshot을
정리한다. 재사용 host·회귀·조사 기록은 보존한다.

## Native 큰 글자·다크·RTL 후속 확인

`d9d5545` 이후 양쪽 Showcase에 긴 파일명 전환과 preview loading 조작을 추가했다. 긴 이름은
한글 반복과 영문 확장자를 포함하지만 실제 파일 시스템 basename 한도를 넘기기 위한 fixture는 아니다.
파일명을 바꿀 때 action-session을 reset해 이전 이름의 내보내기 결과를 분리한다.

동일 iPhone 17 Pro/iOS 26.5, idb/simctl 대체 도구로 다음을 확인했다.
- LargeText(2배), 402×874: 긴 파일명이 336pt 폭에서 200pt 높이로 줄바꿈됐다. 본문/내보내기
  버튼이 보이고, 스크롤 후 맨 아래 실패 재설정 버튼까지 도달했다. 첫 합성 실패 안내는 80pt
  높이로 표시됐다. loading 조작 후 본문 보기만 비활성화되고 저장 재시도는 활성 상태였다.
- Dark(1배): 파일 metadata/행동을 실제 화면에서 확인하고 preview 실패→재시도→본문 복구를
  확인했다. 색상 대비 수치를 측정한 결과는 아니며 제품 palette 검증으로 세지 않는다.
- Rtl(1배): 해당 Story가 선택된 상태와 화면을 확인했다. 이 fixture의 본문은 한국어/영문이므로
  아랍어·히브리어 bidi 읽기 순서·스크린리더 검증으로 확대하지 않는다.

두 Showcase 타입 검사와 문서/Storybook 규격 검사 통과. 이번 변경은 예제 조작 추가이며
renderer를 수정하지 않았다. dark×2배×RTL 교차 조합·제품 palette·Android·접근성은 남는다.
캡처는 검토 후 임시 파일을 제거했다. Native는 마지막 Rtl 스토리에서 보존하며 OS 설정은 바꾸지 않았다.
