# QA 리포트 — Motion Primitives 공개 페이지 검토

## 1. 최종 판정

**부분 확인. 11개 사이트 전수조사는 미완료다.** 이번 기록은 Motion Primitives에서 공개 내비게이션으로 발견한 HTML 36페이지의 기본 화면과 일부 구현·동작을 검토한 결과다. URL 수집, 소스 추출, 화면 캡처를 전수 검토 완료의 근거로 쓰지 않는다.

2026-10-07 사용자가 처음 요청한 전체 페이지 검토가 뒤로 밀렸음을 지적했다. 기존 일부 레퍼런스 적용·npm 게시·소비 앱 변경은 이 사이트 전수 검토의 완료 근거가 아니므로, 페이지별 검토 상태를 분리해 기록한다.

## 2. 대상과 이력

- 기준 HJM: main `55db5b6b4f51f782d73d7f35e5e96924d2a92fdf`. HJM 제품 코드를 바꾸거나 새 릴리스를 수행하지 않았다.
- 대상: 공개 실제 사이트 `https://motion-primitives.com/` 및 `/docs` 내비게이션. 외부 서비스 제출·가입·Open in v0·설치 명령은 실행하지 않았다.
- 실행: 2026-10-07 10:11–10:19 KST, Codex. 외부 사이트 source SHA는 제공되지 않아 페이지 본문·캡처·추출 소스 digest를 작업 중 보유한다.

## 3. 환경과 검증 범위

- 별도 headless Google Chrome 154.0.8037.98, 기본 데스크톱/light 화면 1440×1000; 후속 키보드 재현 1280×720. 실제 외부 사이트, 로그인 없음.
- Native·모바일·dark·큰 글자·RTL·모션 감소·스크린리더는 이번 실행에 포함하지 않았다.
- 공개 HTML anchor 순회: seed 36, 방문 36, 추가 발견 0, HTTP 200 36. sitemap/robots 주소는 앞서 404였으므로 내비게이션을 사용했다.
- 컴포넌트 33페이지에서 Code 96예제와 Manual 구현 31개를 추출했다. 두 toolbar는 Manual 탭이 없으며 Code 예제는 확보했다. 추출은 읽기 완료가 아니다.
- 기본 화면은 16장 구획별 모음과 홈·설치 본문 추가 2장으로 모든 페이지를 읽었다. In View처럼 아직 나타나지 않은 상태, pointer spotlight/cursor/tilt의 hover 상태, 자동 재생의 시간 축은 미확인이다.

## 4. 확인 결과·발견한 문제·재현과 수정

| 페이지·흐름 | 실제 관찰 | 판정·흡수 판단 |
| --- | --- | --- |
| Accordion 첫 기본 예제 | Enter로 aria-expanded false→true, Space로 false | 기본 열고 닫기 확인. 원본 내용 연결 ID 부재; HJM 기존 API 유지 |
| Dialog 첫 기본 예제 | 키보드로 열림, INPUT 초점. Escape로 닫힌 뒤 초점 BODY. 클릭/키보드 양쪽 반복에서 트리거 복귀 false | 원본 초점 복구 문제 기록. HJM Dialog 계약 보존 |
| Disclosure 기본 예제 | Show more 이후 설명·코드 예제 내용 노출 | 펼침만 확인. 재접힘·모든 변형·초점 이동은 미확인 |
| Text Morph | Continue→Confirm. 입력 한글 테스트와 전체 문장의 aria-label 일치 1개 | innerText에 문장이 연속하지 않은 것은 문자별 span 때문이며 실패로 판정하지 않음. 결합 문자·emoji pending |
| Morphing Dialog 첫 기본 예제 | 키보드 열림/Escape 닫힘. aria-labelledby·aria-describedby 대상 각각 0개, 닫힌 뒤 BODY 초점 | 원본 ID/복귀 문제. HJM Dialog.motionOrigin 구성 유지 |
| Image Comparison 기본 예제 | drag 전 clip 50/50%, 후 약79.868/20.132%. role=slider 0 | pointer 비교는 작동. 키보드 경로 없는 원본 엔진을 HJM Slider 대신 쓰지 않음 |

외부 원본 문제를 HJM의 실패로 취급하거나 이번 문서 변경으로 수정됐다고 표현하지 않는다. MorphingDialog trigger는 제품 이름 대신 생성 ID를 접근성 이름에 사용했다. Title/Description 구현의 ID와 Content의 aria 참조가 연결되지 않는다. Dialog·MorphingDialog는 처음 트리거를 focus하고 Enter로 연 후 Escape로 닫고 activeElement=BODY를 재확인했다.

홈·Morphing Dialog·Text Loop 기본 캡처에서 React hydration error 418이 관찰됐다. 원인을 확정하지 않았으며 렌더 성공으로 오류를 지우지 않는다. Tilt API 문서의 제목은 Border Trail, Toolbar Expandable 페이지 제목은 Toolbar Dynamic으로 표기돼 있었다.

### 페이지별 검토 상태

모든 행의 화면 관찰은 기본 데스크톱/light 한 상태다. 소스·동작의 미완료는 화면 관찰과 별개다.

| 페이지 | 구현 검토 | 동작 검토 | HJM 선택·남은 판단 |
| --- | --- | --- |
| /docs | 문서 본문 읽음 | 미완료/비상호작용 문서 | 설치/소개 문서: 제품 dependency 직접 도입 아님; 최종 채택 판단 미완료 |
| / | 문서 본문 읽음 | 미완료/비상호작용 문서 | 설치/소개 문서: 제품 dependency 직접 도입 아님; 최종 채택 판단 미완료 |
| /docs/accordion | Manual 전체 읽음 | 기본 흐름 부분 확인 | Accordion / Collapsible — 기존 API 유지. 높이/opacity 전환과 아이콘 회전만 표현 후보. 원본 trigger에는 aria-expanded만 있고 내용 연결 ID가 없으므로 원본 상태 엔진을 교체 도입하지 않는다. |
| /docs/animated-background | 미완료 | 미완료/비상호작용 문서 | Tabs / SegmentedControl; 최종 채택 판단 미완료 |
| /docs/animated-group | 미완료 | 미완료/비상호작용 문서 | ContentTransition / Grid / List; 최종 채택 판단 미완료 |
| /docs/animated-number | Manual 전체 읽음 | 미완료/비상호작용 문서 | AnimatedStatistic (optional statistic-motion) — 기존 API 유지. 원본은 매 프레임 Math.round(...).toLocaleString()으로 암묵 locale을 사용한다. HJM의 명시 locale·Intl format·모션 감소·RTL fallback을 유지한다. |
| /docs/border-trail | 미완료 | 미완료/비상호작용 문서 | EffectSurface / Card; 최종 채택 판단 미완료 |
| /docs/carousel | 미완료 | 미완료/비상호작용 문서 | Carousel / CarouselMotion; 최종 채택 판단 미완료 |
| /docs/cursor | 미완료 | 미완료/비상호작용 문서 | 제품 장식 또는 optional 표현; 최종 채택 판단 미완료 |
| /docs/dialog | Manual 전체 읽음 | 기본 흐름 부분 확인 | Dialog — 기존 API 유지. 키보드 열기/Escape 닫기 확인; 닫은 뒤 BODY로 초점 이동. 전환 표현만 비교하며 기존 닫기·초점 복귀 계약은 보존한다. |
| /docs/disclosure | 미완료 | 기본 흐름 부분 확인 | Accordion / Collapsible; 최종 채택 판단 미완료 |
| /docs/dock | 미완료 | 미완료/비상호작용 문서 | NavigationBar / BottomNavigation; 최종 채택 판단 미완료 |
| /docs/glow-effect | 미완료 | 미완료/비상호작용 문서 | EffectSurface / Card; 최종 채택 판단 미완료 |
| /docs/image-comparison | Manual 전체 읽음 | 기본 흐름 부분 확인 | ImageComparison — 기존 1.14 API 유지. 원본 mouse drag는 50%→약80% 작동하지만 role=slider와 키보드 조절이 없다. HJM은 기존 Slider로 range/키보드/Native adjustable를 유지한다. 이미지 위 drag 표현 필요성은 별도 실험 판단으로 남긴다. |
| /docs/in-view | 미완료 | 미완료/비상호작용 문서 | ContentTransition / Grid / List; 최종 채택 판단 미완료 |
| /docs/infinite-slider | 미완료 | 미완료/비상호작용 문서 | 제품 마케팅 구성; 최종 채택 판단 미완료 |
| /docs/installation | 문서 본문 읽음 | 미완료/비상호작용 문서 | 설치/소개 문서: 제품 dependency 직접 도입 아님; 최종 채택 판단 미완료 |
| /docs/magnetic | 미완료 | 미완료/비상호작용 문서 | 제품 장식 또는 optional 표현; 최종 채택 판단 미완료 |
| /docs/morphing-dialog | Manual 전체 읽음 | 기본 흐름 부분 확인 | Dialog.motionOrigin / 버튼에서 이어지는 편집 구성 — 별도 MorphingDialog API를 만들지 않는다. 원본 제목·설명 aria ID 대상 없음, Escape 뒤 트리거 초점 복귀 없음. 기존 Dialog.motionOrigin과 제품 소유 초안 구성에 흡수한다. |
| /docs/morphing-popover | 미완료 | 미완료/비상호작용 문서 | Dialog / Popover / MorphingMenu; 최종 채택 판단 미완료 |
| /docs/progressive-blur | 미완료 | 미완료/비상호작용 문서 | 목록·이미지 장식; 최종 채택 판단 미완료 |
| /docs/scroll-progress | 미완료 | 미완료/비상호작용 문서 | ScrollProgress / Timeline; 최종 채택 판단 미완료 |
| /docs/sliding-number | 미완료 | 미완료/비상호작용 문서 | AnimatedStatistic; 최종 채택 판단 미완료 |
| /docs/spinning-text | 미완료 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/spotlight | 미완료 | 미완료/비상호작용 문서 | EffectSurface / Card; 최종 채택 판단 미완료 |
| /docs/text-effect | 미완료 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-loop | 미완료 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-morph | Manual 전체 읽음 | 기본 흐름 부분 확인 | Text / TextTransition — 공통 텍스트 전환 표현 후보. Continue→Confirm과 한글 입력의 aria-label 갱신 확인. 원본은 split('')으로 코드 유닛을 나누므로 emoji·결합 문자·모션 감소를 확인하기 전 채택 확정하지 않는다. |
| /docs/text-roll | 미완료 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-scramble | 미완료 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-shimmer | 미완료 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-shimmer-wave | 미완료 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/tilt | 미완료 | 미완료/비상호작용 문서 | 제품 장식 또는 optional 표현; 최종 채택 판단 미완료 |
| /docs/toolbar-dynamic | 미완료 | 미완료/비상호작용 문서 | EditorScreen / MessageComposer; 최종 채택 판단 미완료 |
| /docs/toolbar-expandable | 미완료 | 미완료/비상호작용 문서 | EditorScreen / MessageComposer; 최종 채택 판단 미완료 |
| /docs/transition-panel | 미완료 | 미완료/비상호작용 문서 | ContentTransition / Grid / List; 최종 채택 판단 미완료 |

## 5. 검사·관찰 결과

- 실행 도구: `motion-capture.cjs`(내비게이션 순회/렌더), `motion-source.cjs`(로컬 Code·Manual 탭 추출), `motion-behavior.cjs`, 키보드·한글 재확인 실행. 설치나 원격 양식 제출 없음.
- 단순 pointer 열림/닫힘을 통과 테스트로 부풀리지 않았다. 동작 관찰 6페이지, 키보드 복귀 문제 2페이지, 확인되지 않은 변형은 ledger에 남긴다.
- 최초 조사 스크립트가 Code를 button role로 찾아 timeout했다. 실제 role=tab으로 수정한 source 추출은 33/33페이지, 96예제, 추출 오류 0이다. 해당 도구 수정은 외부 컴포넌트 수정이 아니다.
- 비교에 읽은 HJM 원본: ImageComparison 사용 지침/Web 구현, AnimatedStatistic Web 구현, 버튼에서 이어지는 편집 구성, 입력을 유지하는 도구 구성. OriginDialog·ContextToolbar를 독립 공개 API라고 안내하지 않는다.

## 6. 미확인 범위와 후속 조건

- 11개 사이트 전체 검토 미완료. [사이트 목록](../plans/reference-site-inventory.json)의 URL 수는 검토 완료 수가 아니다. canonical 중복·추가 링크 발견·차단 페이지는 별도 추적한다.
- Motion: 남은 구현 27페이지의 전체 소스 읽기, 96예제의 모든 동작, dark/mobile/large text/RTL/reduced motion, 포커스 순회와 screen reader, 자동 재생 정지/hover/scroll 상태.
- 공개 소스의 hook/registry 연결과 라이선스·의존성은 후속에서 확인. 외부 링크 전체 인터넷을 방문했다는 주장은 하지 않는다.
- HJM 신규 표현 실험·기능/UI 검사·승격·새 npm release는 위 검토·선택 이후 진행한다. 이미 게시한 1.14.0을 전수 검토 완료로 재분류하지 않는다.

## 7. 보관 처리

- 전수 검토 작업은 실행 중이다. 원시 HTML/소스/캡처/시나리오 JSON은 저장소 밖 작업 임시 공간에 남겨 이어서 검토한다. 종료 후 원본과 최종 리포트를 대조하고 제거한다.
- 저장소에는 페이지별 의미 있는 요약과 [컴포넌트 ledger](../plans/reference-component-review-ledger.json), [사이트 목록](../plans/reference-site-inventory.json)만 갱신한다. 원시 파일을 영구 증거 링크로 삼지 않는다.
