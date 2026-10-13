# 디자인 시스템 계층 점검·수정 결과

2026-10-13 · HJM main `767d47f7` 이후 working copy

요청에 따라 토큰 → 컴포넌트 → 구성 → 화면을 병렬 조사하며 바로 수정했다. 지침 235개를 대상으로 삼았고, 전수 정적 대조와 집중 동작 검증의 범위는 구분했다. 다른 세션의 미커밋 작업은 보존했다.

| 계층 | 범위 | 결과 |
| --- | --- | --- |
| [토큰](tokens.md) | 13개 본문·공개 token/provider 대조 | Native 모션 설정 응답 경쟁 수정, 서체·프로필·간격·대비검사 안내 정리 |
| [컴포넌트](components.md) | 140개 지침, 177개 공개 이름·312 renderer export 매핑 | VirtualList 포커스와 빈 목록 중앙 배치, 잘못된 버전·prop·대체 API 안내 정리 |
| [구성](compositions.md) | 60개 본문, 111개 Storybook 등록·167개 직접 소스/import 경로 | 입력 시트·단계별 드로어의 pending/실패/재시도·초안 보존, 단일 선택·탐색 tile 공개 계약 채택 |
| [화면](screens.md) | 22개 본문, 해당 공개 화면 API·예제 대조 | 상세 독립 복구 API·양 플랫폼 실행 예제, 첫 메시지 입력, 온보딩 저장 잠금, 댓글 그룹화·빈 저장함·화면별 복구 지침 |

## 후속 기능·로직 검수

사용자의 “기능이나 이런거는 검수 했어? 로직이랑” / “진행” 요청 뒤 실제 입력·비동기·취소·재열기·실패 복구를 추가 검수했다. 이 단계는 앞선 235개 지침 대조와 별개다. 아래 보고서는 파일별 소스 검토, 실제 실행, 남은 플랫폼 경계를 구분한다.

| 담당 범위 | 확인하여 고친 주요 행동 | 기록 |
| --- | --- | --- |
| 입력·폼 | 한글 확정 Enter 오작동, readonly 변경, 날짜 재확정, picker 중복·늦은 결과, 제출 중 해제 경합 | [입력 기능 검수](logic-inputs.md) |
| 오버레이·탐색 | 중첩 Escape, 실제 닫힘 이후 실행, controlled 닫기 거부 복구, 이전 overlay handle의 새 세션 간섭, 제스처 시트 순서 | [오버레이 기능 검수](logic-overlays.md) |
| 목록·미디어·피드백 | 재정렬 포커스, 이전 이미지 응답, 이전 행의 swipe 완료, 토스트 시간·StrictMode, 원형 진행량 | [데이터·미디어 기능 검수](logic-data-media.md) |
| 화면·공통 실행 | 완료 알림 중 엔티티 교체, 상세 복귀 시 삭제/비활성화된 항목의 포커스 복구 | [화면 기능 검수](logic-screens.md) |

공통 계약·양 renderer build/typecheck와 양 Showcase typecheck를 확인했다. 최종 빌드 결과를 소비하는 실제 입력 시트·단계별 드로어를 포함해 화면 관련 Chromium 35건(확대 레이아웃 1건 제외), Native host 8건 통과. 각 담당의 추가 검사는 해당 보고서에 명령과 결과를 기록하며, 중복 실행 수를 합쳐 검수 개수로 부풀리지 않는다.

실제 iOS/Android 기기, Safari/WebKit, OS 권한·파일 선택·실제 네트워크 저장, 모든 컴포넌트의 모든 분기는 여전히 미실행이다. 이번 수정은 공유 main working copy에 남아 있고 커밋·push·npm 게시·소비 앱 배포는 하지 않았다.

### 진행 중 UI·UX 보강

추가 사용자 요청에 따라 동작 검수에서 드러난 탐색 단절도 바로 고쳤다. VirtualList에서 현재 행 삭제 시 인접 행으로 초점과 스크롤을 복구하며, 전부 삭제되면 이름 있는 빈 목록 영역에 초점을 둔다. Carousel은 uncontrolled 현재 슬라이드 삭제 시 같은 위치 또는 새 마지막 슬라이드로 이어지고 번호·선택 점·버튼 상태를 맞춘다. 웹에서는 삭제된 선택 점/카드의 초점도 복구한다. Native CounterBadge는 0↔양수 전환의 표시·접근성 이름을 확인하고 조건부 Hook 호출만 정리했다. Hook 관련 런타임 오류가 재현됐다는 의미는 아니다.

위 후속 검사는 담당 보고서의 추가 절에 기록했다. 기능상 근거가 없는 전반적인 외형 변경은 추가하지 않았다.

### 추가 코드 수정

“고치라고” 요청 후 정적 검토만 남았던 분기를 다시 실행하며 소스를 고쳤다. Splitter의 disabled/capture-loss 종료, Menubar 메뉴 삭제·축소의 포커스와 Enter, Select 잠금·선택 항목 삭제, Tree의 삭제 선택 부활·외부 접힘, Accordion 열린 항목 삭제와 잠금, Avatar 재요청 경계를 보강했다. Native 사진 선택은 취소/가용성 변경 뒤 이전 카메라를 실행하지 않으며 Web 메시지 드래그는 시작한 pointer만 동작을 끝낸다. 수정 전 실패·수정 후 관련 회귀와 정확한 파일은 각 기능 보고서의 추가 절에 있다.

### 코드 범위 확정 후 마감 검수

검색 count 검증의 loading/nonempty 우회, 인증 pending 후 키보드 초점 유실, 날짜 선택기의 잠금 전환·닫힘·초점, RTL 메뉴 탐색, long press 취소와 동적 disabled, 숫자 애니메이션의 숨김/unmount 정리를 수정했다. 새 ImageComparison·EffectSurface 실행 경로는 결함 없이 통과해 구현을 유지했다.

최종 공통 계약·Web·Native TypeScript build/typecheck와 `git diff --check` 통과. 각 패키지의 소스보다 오래된 대응 JS 산출물은 없었다.

검사 수는 중복 합산하지 않는다. 이 마감 범위는 공통 검색 계약 12건, 날짜 Web 새 lifecycle 8건/기존 포함 10건 및 Native 7건, 메뉴 Chromium 23건, 미디어 Chromium 5건/Native host 2건, 검색·인증 Chromium 17건을 확인했다. 각 명령과 재현·미실행 경계는 기능별 보고서에 기록했다.

### 공개 API 누락 대조 후 추가 검수

사용자가 전수 여부를 다시 확인해, 파일 본문을 읽은 항목과 실제 행동을 실행한 항목을 재대조했다. 앞선 점검은 모든 행동 분기의 실행 완료가 아니었다. 이번에는 선택 항목 변경, 동의 상태, 탭과 메뉴 재열기, 페이지 요청 수명, 인라인 확인, 문서/작업/컬렉션 구성, 보조 탐색, 선택적 장식 엔진까지 이름별 직접 실행 근거를 추가했다. 각 기능 보고서의 후속 절에 수정 전 실패와 최종 관련 검사 결과를 남긴다.

최종 Web·Native TypeScript build/typecheck와 `git diff --check` 통과. 대응 JS 산출물이 source보다 오래된 파일은 없었다. 이 후속에서 공통 계약 source/CSS는 바꾸지 않아 이전 검사를 재사용했다.

추가 결과는 [입력](logic-inputs.md)의 I20~I30, [탐색·오버레이](logic-overlays.md)의 Tabs/Menu·보조 탐색·Pagination 절, [데이터·모션](logic-data-media.md)의 DM-14 이후와 Result/Skeleton 절, [구성](logic-screens.md)의 LoadMore/InlineConfirm·공개 행동 API 절에 있다. 테스트 파일의 존재만으로 실행 완료라고 세지 않았다.

정적 레이아웃·텍스트 표시는 자체 이벤트가 있는 컴포넌트와 구분한다. Native host callback 검사, 실제 Chromium DOM/WAAPI/Canvas, 운영 기기의 native 엔진/접근성·권한·실제 데이터 처리는 다른 증거다. 모든 상태 조합이나 실제 기기를 전수 완료했다고 해석하지 않는다. 본 작업의 실패 screenshot만 결과 기록 후 제거하고 회귀 source는 보존했다.

## 앞선 계층 점검에서 확인한 결과

- Web/Native renderer TypeScript build·typecheck, 양 Showcase typecheck 최종 통과.
- 변경 행동 검사: Provider 9건, 컴포넌트 Chromium 8건·Native host 6건, 화면 Chromium 5건·Native host 5건 통과. 구성 담당은 기존 관련 fixture 5건·ActionSession 9건을 실행했다. 상세 명령·범위는 담당 보고서에 있다.
- 사용 지침 235개 검사와 색인 생성 통과. 공개 API 대응표 312개 대조 통과. Storybook 정적 검사 437파일·Web ID 978개 통과(새 상세 복구 ID 하나 추가).
- 변경 Markdown 상대 링크 대상 검사와 `git diff --check` 통과.
- 새 detail prop과 동작 수정은 게시 전이다. Changeset만 추가했으며 버전을 올리거나 npm 게시·소비 앱 변경·배포를 실행하지 않았다.

## 확인하지 않은 범위

컴포넌트 140개 모든 문장의 수동 정독, 모든 renderer 분기와 모든 상태의 실행을 완료한 것은 아니다. 컴포넌트 보고서의 항목별 깊이, 구성 보고서의 D(본문·경로·import)/B(추가 행동 구현 검토), 화면 보고서의 실행 경계를 따른다. 정적 대조에서 미발견인 항목을 동작 무결함으로 판정하지 않았다.

iOS/Android 실기기, 모든 화면의 시각 QA·스크린리더·실제 키보드, 네트워크·권한·파일 내보내기, 릴리스 성능과 소비 앱 채택은 미실행이다. 전체 회귀 및 OS 최대 글자 조건은 실행하지 않았다. 부분 검사의 성공을 이 범위의 성공으로 확대하지 않는다.

이번 작업은 공유 dirty tree에서 수행했고 기존 변경과 같은 소스·dist 파일을 사용하므로 현재 working copy의 변경으로 남겼다. 다른 작업을 포함한 일괄 커밋·push를 하지 않았다. 새 브랜치·worktree·clone은 만들지 않았으며 본 작업의 임시 원본 백업은 종료 시 제거했다.


## iOS 개발 앱 후속 진행

기존 iPhone 17 Pro / iOS 26.5의 HJM 개발 앱에서 입력 시트·단계별 드로어를 실행했다. 저장 실패/재시도·초안과 단계 보존·한글 소프트웨어 키보드 조합/저장을 확인했고, Sheet를 다시 열면 화면은 보이지만 AX 내부 요소가 누락되는 결함을 수정했다. 수정 전 앱 새 실행의 12→1개 누락과 수정 후 새 실행의 3회 연속 12개 유지를 대조했다. 관련 Native 검사 23건 통과. 상세 환경·경계는 [오버레이 후속](logic-overlays.md#ios-개발-앱-후속-sheet-재열기-접근성-2026-10-13)에 있다.

이는 앞선 네이티브 미실행 범위 중 두 예제의 시뮬레이터 실행 근거를 추가한 것이다. Android·물리 기기·VoiceOver/TalkBack·GestureSheet·OS 권한/파일 선택·실제 제품 API·브라우저 확장 검수·게시/소비 앱 채택은 남아 있다.

GestureSheet의 iOS drag 닫기·재열기·키보드 표시·앱 복귀도 추가 확인했다. Native build/typecheck와 diff 검사 통과. Android는 현재 연결 기기가 없으며, 공통 Dialog/AlertDialog 재열기·스크린리더와 화면별 UI/UX 대조를 계속한다.


## 브라우저 확장·모달 후속

Dialog·AlertDialog에도 iOS 재열기 AX 누락을 재현해 Sheet와 동일한 일반 View 경계로 고쳤다. 실제 새 실행의 Dialog 3회·AlertDialog 유효한 2회 내부 요소 보존과 Native 표적 31건 통과를 확인했다. 새 편집·삭제 예제는 Web/Native 각각 2건과 양 Showcase typecheck 통과. 실제 Dialog 키보드·VoiceOver 및 Android는 계속 남는다.

WebKit과 Firefox에서 모달·입력·화면 복구 44개와 선택·동의·색상 26개, 인증 대기·목록·구성 11개를 더해 **서로 다른 81개 행동씩** 확인했다. macOS WebKit의 기본 버튼 Tab/클릭 초점 차이는 plain HTML과 대조한 뒤 검사 조건 및 외부 controlled 모달의 returnFocusRef 사용 안내를 보강했다. 실행 엔진과 실제 Safari 앱/OS 보조기기 범위는 구분한다. 상세는 `logic-overlays.md`·`logic-inputs.md`에 있다. 새 예제 fixture가 renderer 타입 검사에 Showcase 전체를 끌어오던 의존은 Web/Native의 작은 dialog-examples 모듈로 분리했다. 양 renderer·양 Showcase의 각 자체 compiler로 `tsc --noEmit`과 예제 Web 2건·Native 2건 재검사 통과.


## 최신 후속 상태: 키보드·파일·문서 (2026-10-13)

앞 절의 미확인 목록 중 일부를 추가로 실행했다. 아래는 현재 확인 범위이며 과거 실행 기록을 대체해 전수 완료를 주장하지 않는다.

- Native Dialog 저장 버튼의 iOS 한국어 키보드 가림을 실제로 재현·수정했다. 입력→실패→초안 보존→재시도와 재열기 3회 AX 유지 확인. Dialog/Sheet 관련 **33건 통과, 최대 글자 3건 제외**. Metro의 Native 예제 `.js` 경로 해석 실패도 수정했다. 상세: `logic-overlays.md`.
- FilePicker는 잠금 전환 후 늦은 결과, drag 강조 정리, 빈 선택, 최신 capacity/callback 판정을 고쳤다. Native host·Chromium 기존/새 검사 각 4건 통과. 실제 OS 선택 검증과 구분한다. 상세: `logic-inputs.md` FP-01~04.
- 실제 개발 앱에 파일 공유 모듈이 없을 때 내보내기만 잠그고 본문/미리보기 재시도는 유지하도록 수정했다. 양 문서 예제의 보기/접기와 문서 교체 초기화, 양 renderer의 상태 중앙 배치를 보강했다. 실제 Web TXT 다운로드·파일 내용과 ‘시작’ 안내 확인. 문서 Chromium 5건/Native host 3건, 파일·문서 WebKit/Firefox 각 9건 통과. 상세: `logic-screens.md` 마지막 절.

남은 검증은 Native OS 파일 선택·권한·공유창, VoiceOver 전체 탐색/복귀·음성, Android/TalkBack·물리 기기, 아직 실행하지 않은 화면 상태와 실제 소비 앱 API 통합이다. VoiceOver는 활성화·첫 제목 초점까지만 확인했고 공유창은 현재 개발 클라이언트의 native module 부재로 열지 못했다. npm 게시·소비 앱 반영·배포도 수행하지 않았다.


## 화면 후속: 작성·신고·권한·알림함·설정

본문이 준비되지 않은 작성 화면의 저장, 저장 시작 전에 열었던 초안 폐기 확인, 제거된 차단 행동의 확인창 부활을 양 renderer에서 수정했다. 웹은 재시도/권한 제한으로 focused 본문 요소가 사라질 때 해당 본문으로 복구하되, 사용자가 의도적으로 다른 곳에 초점을 둔 경우에는 이동시키지 않는다.

알림함의 실제 가용 본문 중앙 상태와 필터 유지, 설정의 실패 notice/섹션 재정렬 중 초안·선택범위·초점·스크롤 보존, 권한 네 상태의 행동 분기를 추가 실행했다. 신규 회귀 최종 Chromium/WebKit/Firefox **각 12개 행동**, Native host **8개 행동** 통과. 양 renderer build/typecheck 통과. 상세 RED/GREEN과 제외 범위는 `logic-screens.md` 마지막 절에 있다. 실제 OS 권한·모바일 기기 전체 화면·음성 낭독·제품 서버 검증을 대신하지 않는다.


## 미디어 선택·알림 설정 후속

MediaSelectionScreen의 사진 삭제·경계 재정렬 후 Web 초점 유실을 수정했다. 마지막 제거와 empty 전환은 추가 행동으로 이어지며, 이동한 행동이 가려지면 해당 본문만 최소 스크롤한다. 미리보기 입력·외부 초점·제품이 아직 수락하지 않은 변경을 보존한다. Chromium/WebKit/Firefox 각각 새 7건 통과, Native의 현재 id·입력 identity·제품 완료 정책 2건은 host 실행으로 확인했다.

알림 설정 예제는 초기값·초안·마지막 저장값·제출값을 구분하고, 저장 중 수정과 중복 제출 방지·실패 후 현재 초안 재시도를 실제 실행하도록 보강했다. 세 브라우저 각각 2건과 Native host 2건 통과. 메모리 예제의 성공을 실제 알림 권한·푸시·서버 저장으로 확대하지 않는다. 상세는 `logic-screens.md` 후속 절에 기록했다.


사진 선택 예제도 완료 후 선택을 다시 삭제할 수 있던 결함을 고치고, 기존 공개 격자에 항목별 업로드·실패 재시도·순서 변경을 연결했다. 삭제/복귀/재선택 뒤 늦은 결과를 무시하고 완료 결과를 고정한다. 실제 CSS의 390px 완료 strip과 선택 해제 초점을 포함해 세 브라우저 각각 5건, Native host/helper 3건 통과. Web renderer build·양 renderer/Showcase typecheck를 확인했으며 실제 OS 사진 선택·서버 업로드는 미실행이다.


## 도구 출력·대시보드·탐색 후속

목업 PNG의 중복 인코딩·초기화 후 늦은 결과 반영을 고치고, 재시도 초점과 JSON 진행 상태를 보강했다. 영상/포스터 중복 시작·교체 뒤 오래된 완료와 재생 시계 초기화도 수정했다. Dashboard·DiscoveryGallery는 동기 fixture의 기간/필터/저장/상세 동작을 실행해 제거·빈 복구 후 초점과 연속 토글을 고쳤다.

새 표적 검사는 PNG 9개·타임라인 10개·대시보드/탐색 4개를 Chromium/WebKit/Firefox에서 각각 통과했고 Native 대시보드/탐색 host 4개도 통과했다. 양 renderer/Showcase 타입검사와 기존 studio 모델 4개 통과. 실제 PNG encode/decode와 제어 인코더 자원 정리 근거이며 OS 다운로드·영상 코덱·실제 서버·Native 음성 검증을 대신하지 않는다. 상세는 `logic-screens.md`의 해당 절에 있다.


## 기록 비교·랜딩·제품 소개 후속

기록 비교 빈 검색 초기화는 검색 입력으로 초점을 돌린다. 실제 WebKit 포인터 검사에서 기록 상세와 서비스 소개 변형의 복귀 대상이 본문으로 흐르는 문제를 추가로 찾아, 실제 클릭한 버튼을 Sheet returnFocusRef에 전달했다. 기본 랜딩은 닫기 후 초안을 보존하고 중복 저장·키보드 제출·IME·오류 입력 초점을 보완했다. ProductBento는 저장 중 수정한 현재 초안과 확정 snapshot을 구분하고 pending 복귀를 막는다.

새 Web 표적 17건(기록 비교 5·소개 변형 4·기본 랜딩 5·제품 소개 3)이 Chromium/WebKit/Firefox에서 각각 통과했다. Native 대응 host 13건도 통과했다. 상세 재현·수정과 초기 fixture 오류 제외 근거는 `logic-screens.md` 마지막 절에 기록했다. 실제 Native OS/스크린리더·소비 제품 서버·패키지 게시와 반영은 여전히 미확인/미실행이다.


## 저장·파일 선택·작성·도구 구성 후속

저장 구성은 제출 snapshot과 현재 초안을 구분하고 사라지는 재시도 행동의 Web 초점을 보존한다. 파일 선택 예제는 중복 제거 후 최신 목록에서 3개 제한을 재판정하고, 취소/재시도/재선택 전의 callback이 상태를 되살리지 못하게 했다. 작성 세 변형은 pending 중 queued 편집/되돌리기/이탈을 막고 연속 토글·검증 초점·설정 확인창 복귀를 보완했다.

요약 전환·도구·기간 선택 예제에서는 메모 유지와 선택 동기화가 정상임을 확인했다. 실제 WebKit 포인터 닫기 뒤 Enter로 도구를 다시 열 수 없는 문제는 예제를 우회하지 않고 공통 Web Collapsible에서 고쳤다. 해당 public 수정은 기존 changeset에 포함했다.

새 표적 Web 15건(저장 복구 4·피드백/파일 5·작성 3·전환/선택 3)이 Chromium/WebKit/Firefox에서 각각 통과했고 대응 Native host 15건도 통과했다. 기존 Collapsible source 회귀 4건은 Chromium에서 추가 확인했다. 자세한 RED/GREEN은 `logic-screens.md` 마지막 절과 `logic-overlays.md`의 구성 후속 절에 있다. 기기·OS·제품 서버·전체 행동 분기·게시/소비 반영의 전수 완료는 아니다.


## 탐색·영상·날짜·결과 알림 구성 후속

Web 보조 저장 예제의 재클릭 취소·변형 간 상태 공유, FAB의 중복 저장·Dialog 복귀, hash 탐색의 Back 불일치·복수 예제 주소 충돌을 수정했다. 날짜·영상의 실제 Enter 조작에서 pending 버튼이 초점을 잃는 문제는 기존 loading 계약으로 해결했고, 날짜 응답은 사용자가 옮긴 초점을 빼앗지 않는다. Native 조건부 결과 알림은 기존 PatternStatus/Notice 연결을 보완했다.

새 Web 표적은 WebAdditions 4·WebNavigation 3·FAB 2·VideoDialog 9·날짜시간 4·탐색 막대 3건이며 각 Chromium/WebKit/Firefox에서 통과했다. 영상 9건 중 1건은 모형을 해제한 번들 MP4의 실제 metadata/재생 시계/정지·해제 검사다. Native 대응 host는 FAB 2·영상 4·날짜시간 2·탐색 막대 5·결과 알림 8건 통과, 기존 날짜 shared reducer 5건도 경로 지정으로 확인했다. 반복 실행 횟수를 합산하지 않는다.

실제 Native 코덱·VoiceOver/TalkBack·OS 권한/선택/공유·제품 API는 계속 별도 검증이 필요하다. 다음은 실제 예제 실행 근거를 추가 대조할 메시지/댓글 구성, 적용·취소/초안/검색 흐름, 선택 범위, 주문·인증 구성이다. 기존 D 표기를 곧바로 미실행 판정으로 쓰지 않고 후속 logs와 실행 fixture 내용을 함께 비교한다. 자세한 수정 전 실패·검사·정리 내역은 logic-screens.md의 해당 절과 compositions.md C-05/R-04 후속에 있다.

이 후속의 양 renderer·양 Showcase 타입검사와 관련 diff 검사를 마쳤다. Native 영상 테스트 모형의 함수 타입 오류는 수정 후 해당 4건/타입검사를 재확인했다. 공개 renderer source/CSS 변경이 없어 build는 앞선 성공을 재사용했다. 변경은 main working copy에 남겼으며 커밋·push·패키지 게시·앱 배포를 수행하지 않았다.


## 대화·검색·선택·인증 구성 후속

댓글/메시지 전송·알림 읽음의 초점 유실과 재전송 성공 안내, 취소·폐기 후 늦은 callback의 초안 부활, 검색 응답 경합에 따른 실패 예약 오적용을 수정했다. 범위 적용과 주문 처리 중 queued 선택이 진행 요청을 바꾸지 않게 했고, OTP 재전송/새 시도의 입력 복귀와 외부 초점 보존·Native 성공 안내를 보완했다. 문자 발송/이전 코드 폐기를 하지 않는 OTP 예제의 문구도 실제 동작에 맞췄다.

새 Web 18개 표적 행동이 Chromium/WebKit/Firefox에서 각각 통과했고 Native host 16개, 기존/추가 shared reducer 8개가 통과했다. 양 Showcase·Native renderer 타입검사 완료. 공개 renderer source/CSS는 유지해 이전 Web renderer 검사/패키지 build를 재사용했다. 정확한 파일·초기 fixture 오류 구분·정리 내역은 logic-screens.md의 대화/적용/초안/검색/선택/주문·OTP 절에 기록했다.

실제 기기·OS 접근성·문자/메시지·서버 처리는 검증하지 않았다. 다음은 컬렉션 상세·내용 전환·프로필 변경·실시간 목록 등의 실제 구성 흐름과 남은 선택/보조 구성의 실행 근거 대조다. 이 결과를 모든 컴포넌트/분기의 전수 실행 완료로 확대하지 않는다.


## 컬렉션·내용 전환·프로필·실시간 목록 후속

복수 컬렉션의 중복 입력 ID, 내용 전환의 확정 결과와 초안 혼용, 프로필 예제의 잘못된 저장 안내·작동하지 않는 토스트 닫기, 삭제/재시작/모달 닫기 후 초점 유실을 수정했다. Native 목록에 스크롤/키보드 host를 연결하고 결과 안내를 기존 iOS/Android 경로로 통일했다. 기존 공개 API와 상태 엔진을 재사용했다.

새 Web 표적 17건(컬렉션 5·전환/종이 4·프로필 5·목록 3)이 Chromium/WebKit/Firefox에서 각각 통과했고 Native host 18건, 공유 목록 모델 2건도 통과했다. 양 Showcase 및 Native renderer 타입검사 통과. public renderer source/CSS는 그대로라 기존 Web renderer 검사/build를 재사용했다. 실제 기기·OS 접근성·서버 연동은 미실행이며, 이 결과를 모든 상태의 전수 실행 완료로 확대하지 않는다. 수정 전 실패·fixture 오류·검증/정리 범위는 logic-screens.md의 해당 후속 절에 있다.


아래는 공개 컴포넌트 자체의 미검증 판정이 아니라, 직접 Showcase 예제의 상태 소유자/연결 흐름을 실행한 근거가 부족해 선정한 순서다. 1~4와 5~8은 아래 두 후속에서 검수했다. 파일은 Web `showcase/web/src/patterns/`, Native `showcase/native/src/`에 대응한다.

1. `screen-flow-previews.tsx` Account/Editor/Collection: 편집·실패·재시도·폐기/복귀, 계정 Sheet/로그아웃, 새 기록 목록 연결. 공개 화면 검사는 기존 근거로 재사용한다.
2. `common-screen-previews.tsx`: 로그인 취소/재시작/늦은 타이머, 알림→상세→대화·답장 원문 이동. 별도 conversation 예제 검사와 구분한다.
3. `activity-status-preview.tsx`: 단계/완료/자동 숨김, 닫기/재열기·재시작/토스트 갱신과 타이머 수명.
4. `compound-previews.tsx`: Confirm 실패 설정·초기화/재시도, Notifications 연속 추가/읽음 상태 소유자.
5. `origin-dialog-preview.tsx`: 초안·실패·닫기·재열기·재저장과 실제 opener 복귀. 공개 origin 검사는 이미 있으므로 반복하지 않는다.
6. `illustrated-outcome-preview.tsx`: 빈 상태·단계/이전·초안·완료/재시작, 그림 숨김/오류 후 행동 유지.
7. `command-records-preview.tsx`: Web 복사 성공/거부 중 탭 변경·wrap/오류 닫기·refresh 초점, Native 탭/표시 연결. 기존 Native 결과 알림 3건과 중복하지 않는다.
8. `DateEntry.stories.tsx`/`TimeSelection.stories.tsx`: 독립 Story의 확인 결과와 후속 수정, 미완성/선택 해제/초기화. 공개 parser/컴포넌트·별도 DateTimeSelection 회귀는 재사용한다.

목록은 처음 파일·기록·fixture import의 읽기 전용 대조로 선정했고 이후 해당 실제 owner 흐름을 실행했다. DocumentResource는 기존 실제 다운로드/Native 예제 실행 근거가 있어 이 후속 목록에서 제외했다.

## 화면 연결·진행 상태·복합 입력 후속

위 목록 1~4의 실제 예제를 검수했다. 기록별 본문 저장과 빈 신규 초안, 처리 중 편집/중복 요청 차단, 로그인 취소와 늦은 완료, 오류의 화면 간 누출, 알림의 잘못된 대화 연결, 진행 패널 무한 렌더, 확인 처리와 패널 종료 후 초점 유실을 수정했다. 실패 설정은 요청 시작 시 고정하고 연속 알림 갱신을 보존한다. 공개 Web InlineConfirm의 초점 수정도 포함하며 사용 지침과 기존 changeset에 반영했다.

이번 Web 예제 24건(화면 흐름 6·공통 화면 6·진행 상태 7·복합 입력 5)과 공개 Web 복합 입력 6건이 Chromium/WebKit/Firefox 각각 통과했다. Native 모형 검사 21건도 통과했다. 양 Showcase 및 양 renderer 타입검사와 Web renderer build를 확인했다. 최종 타입검사에서 발견한 테스트 DOM 타입/act 반환값과 Native 예제 미사용 import를 정리했다. 세부 수정 전 실패와 fixture 보정은 logic-screens.md에 구분했다. 다음은 원점 대화상자·그림 결과 화면·명령 기록·독립 날짜/시간 Story다. 실제 기기·OS 접근성·제품 API 연동과 npm 게시·소비 앱 반영·배포는 이번 검수의 완료 근거에 포함하지 않는다.

## 원점 대화상자·그림 결과·명령 기록·독립 날짜/시간 후속

위 목록 5~8의 검수를 마쳤다. 빈 메모 저장과 미저장 상태를 구분하고, Native 늦은 위치 측정으로 닫힌 대화상자가 재열리는 문제를 수정했다. 그림 결과 화면의 단계 전환 초점/완료 안내, 명령 기록 새로고침의 처리 중 초점/외부 초점 보존, Native 날짜 확인 결과 안내를 보완했다. 초안 유지·실패 복구·그림 오류·탭 변경 중 복사·날짜 재편집·시간 해제/초기화도 확인했다.

Web 17건(5·4·6·2)이 세 브라우저 각각, Native host 13건(5·3·2·3)이 통과했다. 최종 양 Showcase·Native renderer 타입검사 통과. 수정 전 제품 실패와 fixture 오류, 이전 성공 재사용, 청소 결과는 logic-screens.md에 구분했다. 공개 renderer 변경·기기 검증·게시를 수행한 것으로 확대하지 않는다.

## 잔여 레거시 제거 — 착수 시점 조사

아래는 제거 착수 전 조사 기록이며, 현재 결과는 다음 절에 기록한다.

사용자의 앞선 “레게시들은 제거해” 요구까지 완료 여부를 다시 대조했다. 위 실제 예제 검수와 별개로 Native deprecated 시각 style 호환 통로는 여전히 source에 남아 있다. components.md의 보존 경계와 migration의 “다음 major” 설명을 제거 완료로 취급하지 않는다. 27개 TSX 파일의 60개 경고 호출과 실제 style 병합, 대응 공개 타입을 확인했다. 앱 직접 전달 후보 7곳 중 AppSheet의 배치 전용 contentStyle 1곳은 제거 대상에서 제외했고, wrapper 전파로 BurnTok 사용 10곳을 추가 확인했다.

다음 수정은 기존 `layoutStyle`·semantic props/recipe로 소비 코드를 이관한 뒤 deprecated 시각 통로와 호환 검사를 제거하는 것이다. RN host style·이미지 adapter·기본 조합의 정식 style은 보존한다. AlertDialog/Sheet `contentStyle`은 공개 배치 기능을 유지하며 시각 값 허용 타입을 좁힌다. Native PixelEmptyState는 `illustrationStyle`로 작은 고정 그림 칸을 덮고 있어, 기존 illustration 슬롯이 실제 콘텐츠 크기를 수용하도록 먼저 정리해야 한다. `deprecated-style.ts`의 Link/Dialog 일반 진단 기능도 별도 보존해야 한다. breaking 영향은 계약/이관 문서와 기존 changeset에 명시하고, 실제 버전 상승·게시·앱 의존성 갱신은 아직 수행하지 않는다.

읽기 전용 조사에서 확인한 후속 범위:

- HJM: actions/primitives/inputs/forms/navigation/data-display/feedback/overlays 및 독립 컴포넌트·internal/spinner. `deprecated-style-{core,inputs,data-display,feedback,navigation}.test.tsx`의 호환 유지 기대를 제거 계약으로 바꾸되 canonical 배치/recipe 검사는 유지한다. 일반 `warnOnce`·`isDevelopment`는 Link 아이콘/Dialog 오류 진단에도 사용되므로 통째로 없애지 않는다.
- 그림: `showcase/native/src/stea-expression-previews.tsx` PixelEmptyState의 illustrationStyle을 단순 제거하면 Native 고정 glyph 칸과 실제 캐릭터가 겹친다. Web EmptyState는 동일 고정 크기가 없으므로 Native 슬롯의 intrinsic 크기 존중을 먼저 검토한다.
- BurnTok 직접 전달: `AppSelect.tsx:123`의 style(현재 호출 없음), `AppDialog.tsx:271`의 contentStyle 시각 값/size wrapper, `AppMenu.tsx:129`의 trigger style(실제 6개 호출은 contentStyle 미공급), `AppDescriptionList.tsx:29`의 width. AppSheet 배치 contentStyle은 보존한다.
- BurnTok wrapper 소비: `app/welcome.tsx:257` Container 안쪽 정렬/padding, `app/run/[id].tsx:1314` Checkbox 내부행 배치, `app/(tabs)/index.tsx:325` CounterBadge 절대 위치. EmptyState marginTop은 `search.tsx:166,175,185`, `u/[id].tsx:352,359`, `notifications.tsx:156`, `(tabs)/profile.tsx:1035`에서 전달한다. 상태를 임의 여백으로 밀지 않고 사용 영역 중앙 정렬을 유지해야 한다.
- Diairy `features/sea/LetterSheet.tsx:344` Container style의 실제 값은 flexGrow:1이라 layoutStyle로 옮길 수 있다. Utilverse `features/AccountScreen.tsx:112` ListRow 탈퇴 진입의 danger titleStyle은 기존 string title/semantic props만으로 동일 표현 대체가 없어 공개 위험 행동 표현을 먼저 정해야 한다.
- Native AlertDialog는 현재 공개 size가 없으므로 BurnTok size wrapper를 삭제만 하지 않는다. Mentions.listStyle의 후보 목록 배치와 Statistic.valueStyle의 개별 큰 숫자 표현도 현재 semantic 축으로 동일 이관이 되는지 소비 요구를 확인한다. 후자는 designProfile typography 지원과 별개다.
- migration의 1.13 잔존표, Native README와 관련 usage의 deprecated 안내를 코드와 함께 갱신한다. 과거 1.11 minor 제거 예외는 그 특정 승인 범위이며 새 삭제의 버전 정책으로 자동 재사용하지 않는다. 위 조사는 코드 수정·앱 테스트·설치·게시의 증거가 아니다.


## 잔여 레거시 제거 — 소스 수정과 소비 경계 확인

2026-10-13 Native 공개 타입의 deprecated 시각 prop과 실제 style 병합을 제거했다. `src`의 `@deprecated`/`warnDeprecatedStyleProps` 참조는 0건이다. 일반 Link/Dialog 진단은 `internal/diagnostics.ts`로 분리했고, 제거한 helper를 가리키던 화면 테스트와 번들 기준 기록도 정리했다. Select/Combobox가 상위 ModalProps를 통해 style을 다시 노출한 누락은 타입 검사에서 발견해 Omit과 rest guard로 막았다. RN host·이미지 adapter·primitive·Section/Chip 배치 슬롯·TopBar renderAction appearance 스타일은 보존했다.

- 계약 보완: 양 renderer ListRow의 `tone="danger"`, Native AlertDialog `size`, EmptyState 최소 그림 크기+콘텐츠 자체 크기. AlertDialog/Sheet contentStyle은 배치 전용 타입으로 제한했다.
- 문서: 사용 지침 63개, Native README, 이관표, consumer policy를 현재 계약으로 갱신했다. changeset의 Native 등급은 major다. 과거 1.11 minor 예외는 새 삭제에 재사용하지 않는다. 패키지 버전은 바꾸지 않았다.
- 표적 검사: core/navigation/link 행동 74건과 타입 제외 assertion 2건; inputs 39건 및 관련 기존 입력/대화상자 13건; data-display 27건·feedback 22건; 추가 canonical recipe 9건·화면 1건; contracts ListRow 1건·Web ListRow Chromium 1건 통과. 중간 composite React props/Spinner throw 기대 및 일부 recipe fixture 오류는 제품 오류와 구분해 바로잡았다. 최종 양 renderer와 양 Showcase 타입 검사, contracts 및 양 renderer build 통과. 전체 회귀·실제 기기 검사는 실행하지 않았다.
- 소비 이관: BurnTok AppSelect/Menu/DescriptionList/EmptyState/ChoiceGroup과 welcome·run·feed·search·notifications·두 profile의 호출을 기존 1.18에서도 지원하는 배치 계약으로 이관했다. 상태 목록은 고정 top margin 대신 남은 본문 공간을 채우며, ListEmptyComponent에 RN이 주입하는 host style/onLayout은 View가 받도록 했다. 체크박스 행 간격과 배지 절대 위치는 제품 host가 소유한다. Diairy LetterSheet Container도 layoutStyle로 이관했다.
- 설치본 검사: BurnTok/Diairy mobile typecheck 통과. BurnTok 관련 소스 계약 19건, Diairy LetterSheetGestureCancellation 10건 통과. 소스 계약과 RN DOM/gesture mock 검사를 OS·기기 증거로 확대하지 않는다.
- 후보 선언 검사: HJM 공개 export의 types를 임시 paths로 연결하되 React/React Native/JSX runtime은 소비 앱 설치 peer를 사용했다. 별도 checkout의 RN0.86.2와 소비 RN0.86.3 혼합 진단은 이 조건을 맞춘 후 사라졌다. Diairy 통과. 현재 앱 소스에서는 BurnTok AppDialog contentStyle.padding과 Utilverse AccountScreen titleStyle 각 1건이 실패한다.

남은 두 호출은 설치된 HJM1.18에 대체 props가 없다. 위험색이나 크기를 버리거나 타입 캐스트로 숨기지 않았다. 적용할 변경은 [BurnTok 패치](consumer-patches/burntok.patch)와 [Utilverse 패치](consumer-patches/utilverse.patch)에 준비했고, 현재 checkout에서 각각 git apply --check 통과했다. TypeScript compiler host에 이 두 변경을 가상 반영한 후보 검사도 각각 진단 0건이다(BurnTok Node24.20.0, Utilverse Node24.21.0). 이 검사는 실제 파일 수정·패키지 설치·런타임 검증이 아니다. 새 버전 게시와 소비 의존성 갱신은 사용자가 승인했다. 이어진 사용자 지시로 top-down 보완을 먼저 수행한 뒤 동일 변경으로 적용하고 영향 흐름을 확인한다.

추가 소비 조사에서는 @hjmds/react-native import가 있는 342개 TS/TSX와 BurnTok/Unairplane wrapper 사용을 alias·namespace 및 실제 값 기준으로 읽었다. 알려진 두 호출 외 추가 잔여는 확인하지 못했다. Spint/Unairplane/Diairy/야잘알도 조사했으며 Mofun은 로컬 checkout이 없어 미조사다. 설치 버전·lockfile은 변경하지 않았다. 개발 기본 로컬 소스를 쓰는 위 두 미이관 흐름은 아직 호환 완료가 아니다. 조사 범위 밖 전체 제품·배포 완료로 해석하지 않는다.

삭제한 생성물은 obsolete helper의 gitignored 파일 4개뿐이며, 임시 후보 tsconfig·검사 스크립트·내용 파일·로그는 정리했다. 공유 dirty 파일과 실행 중 개발 서버는 보존했다.


## Top-down 보완 — 화면에서 요구하는 하위 계약

사용자가 게시 전에 화면→구성→컴포넌트→토큰 순서로 상위에서 쓰지만 하위에 없는 요소를 채우도록 요청했다. 원시값을 모두 새 토큰으로 만들거나 화면마다 새 컴포넌트를 늘리지 않고, 독립된 실제 소비 경로와 기존 API의 표현 공백을 대조해 다음을 수정했다.

| 상위 소비에서 드러난 공백 | 하위 계약 보완 | 실제 상위 이관 |
| --- | --- | --- |
| 날짜·기간의 그룹 제목/오류/가로 입력을 따로 구현 | 기존 FieldGroup의 inline layout과 공유 recipe | 양 DateEntry·DurationField의 직접 fieldset/그룹 View 제거 |
| Native 검색은 실제 행 대신 임의 Skeleton 2개로 근사 | 기존 ListRow에 Native loading/loadingLabel 지원, 양 renderer placeholder 폭 recipe 공유 | 양 SearchScreen에서 같은 두 줄 로딩 행 사용, 첫 행만 상태 이름 제공 |
| 짧은 상태 문구의 iOS 안내를 제품 helper로 복제 | Text companion StatusText, 양 root와 /status-text 진입 | Native PatternStatus는 공개 API 별칭으로 축소, 사용 지침 helper 구현 제거 및 실제 Text Story 연결 |
| A 제출 뒤 B 편집 중 A 응답을 현재 초안 저장 완료와 혼동 | action-session의 resolveSaveFeedback | 양 NotificationSettings·ProductBento에서 dirty/유효성/저장 피드백 분류 재사용 |
| 검색 지연 시간·타이머 입력 처리 중복 | searchScreenRecipe.debounceMs와 resolveSearchDebounceMs | 양 SearchScreen에서 사용. 0·유한값·음수→0 유지, NaN/무한대 거부 |
| 선택 행·정렬 손잡이의 44 직접 사용 | 기존 control.minTouchTarget 소비 | 확인한 Web/Native 5곳 연결. 새로운 숫자 토큰은 만들지 않음 |

현재 표적 결과: FieldGroup 관련 contracts15/Native12/Web9건×3브라우저, 저장 피드백 contracts24/Native5/Chromium5, 검색 debounce contracts4/Native4/Chromium1, StatusText Native8+실제 예제3/Chromium2 통과. ListRow loading은 Native5와 Chromium/WebKit/Firefox 각각1건 통과했다. Native 검사는 host 모형이며 실제 OS 낭독·기기 좌표 검증과 구분한다.

양 renderer build와 typecheck, 양 Showcase typecheck는 통과했다. 통합 중 DateEntry optional disabled와 Web FieldGroup className 전달을 exactOptionalPropertyTypes에 맞춰 보정했다. ListRow loading fixture의 잘못된 public import 두 번 및 identity인 mock StyleSheet.flatten 기대는 fixture를 수정했다. 제품 실패로 합산하지 않는다. 공개 API 대응표를 생성·검사했고 StatusText는 Text companion이다. 사용 지침 색인 동기화에서 기존 형식 요구도 출력됐으나 관련 없는 문서 형식이나 제외한 최대 글자 조건을 새 배포 게이트로 추가하지 않았다. 이번 도입분의 문서 오류를 수정한 뒤 StatusText 관련 선택 지침 10개 검사와 최종 선택 지침 5개 색인 갱신이 통과했다.

게시·소비 설치는 이 추가 보완 뒤 진행하도록 남겨 두었다. 이 절은 이번에 식별해 수정한 계층 공백의 증거이며, 모든 제품 화면의 기기 검수나 공개 배포 완료를 뜻하지 않는다.

## 게시 후보 확인 — 공유 변경 경계

2026-10-13 npm 조회에서 세 패키지의 공개 latest는 모두 1.18.0이었다. mac-ci의 기존 operator checkout은 main/a9ac46eb이며 조회 시 미커밋 변경이 없었다. 로컬 후보의 release artifacts 정합성 검사, contracts·양 renderer import 경계 검사, 세 package의 `npm pack --dry-run --json --ignore-scripts`가 통과했다. 양 renderer의 StatusText JS·타입 파일이 게시 목록에 있고 제거한 deprecated-style helper는 없다. 이는 현재 1.18.0 manifest를 가진 미게시 후보 검사이며 새 버전 게시 증거가 아니다.

다음 기존 공유 변경이 이번 audit와 같은 파일에 섞여 있다. 루트 AGENTS의 다른 세션 변경 보존·본 작업만 stage 규칙 때문에, 파일 전체를 일괄 커밋해 게시하지 않는다.

| 별도 작업 | 이번 변경과 겹치는 소스 | 게시 범위 결정에 필요한 내용 |
| --- | --- | --- |
| RN Web 초점·Keyboard fallback | Native forms.tsx, overlays.tsx 및 internal/accessible-focus.ts | helper를 제외하고 소비 파일/dist만 커밋하면 import가 깨짐 |
| 사진 캐러셀·뷰어·채팅 동작 | 양 carousel-motion.tsx, Native image-viewer.tsx, screens.tsx | photo-album-navigation changeset과 연계 |
| 토스트 전체 카드 누르기 | contracts toast.ts/behaviors.ts, Web toast.tsx/styles.css/theme.ts, Native feedback.tsx | toast-card-press changeset과 연계; 기존 audit의 시간·StrictMode·legacy 제거와 혼재 |
| 하단 탐색 선택 타일 | contracts bottom-navigation.ts/component-recipes.ts, Web bottom-navigation.tsx/styles.css, Native navigation.tsx | Spint용 기존 변경이며 별도 changeset에 명시되지 않음 |

공유 변경 경계를 확인하며 RN Web focus host 2건, Native toast-press/interaction-adapters/image-viewer-host 25건, Chromium toast-press 8건을 추가 실행해 통과했다. BottomNavigation tile만 선택한 contracts/Native/Web SSR 각 1건도 통과했다(다른 사례는 선택 범위 밖으로 건너뜀). package exports의 실제 대상 경로를 dry-run 게시 목록과 대조해 contracts237/Web202/Native168개 경로 누락이 없음을 확인했다. 기존 공유 변경의 게시 포함 여부와 검증된 source SHA가 확정되기 전에는 버전 변경·commit·push·npm 게시를 실행하지 않았다. 소비 앱 두 patch도 아직 새 게시 버전과 함께 적용할 대상으로 유지한다.

사용자가 2026-10-13 공유 변경 4그룹도 이번 릴리스에 포함하도록 승인했다. 위 4그룹은 현재 근거로 식별된 독립 기능이며, 감사 기록만으로 나머지 모든 diff의 원저자까지 확정할 수 있다는 뜻은 아니다. 공개 소스의 실제 diff와 필요한 파일 의존을 확인하고 경로를 지정해 커밋한다. 새 브랜치·워크트리 없이 기존 main에서 소스를 확정하고, 배포 Mac에서 major 버전을 준비한 뒤 기존 CI의 release 검사를 거쳐 게시한다.

## 게시 대기 중 소비 표면 대조

공유 변경 포함 결정과 독립적으로 2026-10-13 현재 소비 checkout에서 후보 선언을 대조했다. 각 앱의 기존 tsconfig를 확장한 임시 설정에 HJM package exports의 `types`를 현재 dist로 연결하고 React/React Native/JSX는 소비 앱의 설치 peer를 유지했다. 앱 코드·설치 패키지·lockfile은 변경하지 않았으며 임시 설정·검사 script·로그를 정리했다.

| 소비 표면 | 후보 타입 결과 | 범위 |
| --- | --- | --- |
| BurnTok apps/web | 진단 0 | 설치 1.18 baseline도 통과, 기존 Next 생성 타입 사용 |
| Diairy apps/web | 진단 0 | 설치 1.18 baseline도 통과, 기존 Next 생성 타입 사용 |
| Spint apps/mobile | 진단 0 | 현재 main/10ad2f8와 미커밋 소스, root files 212 |
| Unairplane 루트 Expo | 진단 0 | 현재 main/01caeda와 미커밋 소스, root files 145 |
| Yajalal modules/mobile | 진단 0 | main/9d6f9d4c의 실험 Expo와 미커밋 소스, root files 89; Flutter 전환 완료 의미 아님 |
| Portfolio Site src | 진단 0 | tsconfig.app.json 기반 Web 소비 표면 |
| App Release Hub lib/policy-design.ts | 진단 0 | colors/foundations 소비 모듈; Hub 전체 검사 아님 |

Node24.20.0과 각 앱의 설치 TypeScript를 사용했다. Spint의 첫 임시 설정에서 나온 TS2688은 후보와 설치 baseline 모두에서 /tmp 기준 explicit types 탐색 실패였고, 앱 typeRoots를 지정한 최종 후보는 통과했다. 제품 소스 결함으로 합산하지 않는다. 새로 필요한 소비 patch는 발견하지 않았고, 기존 BurnTok/Utilverse patch의 `git apply --check`도 재통과했다. 후보 실제 설치·Next typegen/build·브라우저/기기 동작은 미실행이다.

실제 package.json 의존성 검색에서 module.contract.json의 호환성 검토 목록에 Utilverse와 App Release Hub가 빠져 있어 추가하고 consumer policy에 근거를 적었다. HJM 한 모듈만 선택한 계약 검사는 `contract-valid, execution=not-run`이며 실행 회귀 통과로 해석하지 않는다. Mofun은 portfolio catalog상 archived/checkout absent이므로 현재 활성 checkout의 후보 타입 검사 대상에 포함하지 않았다.
