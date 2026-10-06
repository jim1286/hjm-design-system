# Storybook 탐색 규격

검토일: 2026-10-07 · 적용: Web 및 React Native showcase · 강제: `pnpm storybook:check`([`scripts/check-storybook.mjs`](../scripts/check-storybook.mjs)), `pnpm usage:check`

2026-10-06 사용자 요청("스토리북 규격도 잡아줘. 지금 좀 난잡해", 구조는 "너가 권장하는 구조로, 깔끔하고 직관적으로" 위임)으로
메뉴 구조를 규격으로 고정한다. 그 전에는 같은 단계 안에서 제목 깊이가 3·4·5로 섞였고, 둘째 분류 19개 중 12개가 항목 1개짜리
폴더였으며, 분류 이름이 출처(공통 화면·기본 흐름·상호작용 예제)를 말했다. 실험과 배포가 다른 분류 체계를 써서 승격할 때마다
제목·URL·지침·테스트를 다시 짰다. 같은 export(Empty·Recovery)가 파일마다 다른 뜻이었고, 같은 의미의 툴바 global이 Web
`motion`, Native `reducedMotion`으로 달랐다.

이 문서의 §1이 규범이다. §2·§3은 승인과 링크 호환 기록, §4는 당시 기록이며 규범이 아니다. 규격을 바꾸면 검사기 상수
(`CATEGORIES`·`ITEM_ORDER`·`RESERVED_STORIES`·`GLOBAL_TYPES`·`PLATFORM_ONLY`), 두 `preview.tsx`의 `storySort`, 이 문서를
같은 변경에서 고치고 근거를 적는다.

## 1. 규격

### 1.1 계층

```text
<상태>/<단계>/<분류>/<항목>        정확히 4마디. 모든 단계 공통
상태 = 배포 | 실험
단계 = 토큰 → 컴포넌트 → 구성 → 화면
```

| 단계 | 기준 |
| --- | --- |
| 토큰 | 여러 UI가 공유하는 값(색·글자·간격·크기·표면·모션)과 그 값의 편집 도구 |
| 컴포넌트 | 하나의 역할을 하는 재사용 UI. 내부 요소 수가 아니라 공개 역할로 판단한다 |
| 구성 | 여러 컴포넌트의 조합·배치·짧은 사용자 흐름·환경 비교 |
| 화면 | 페이지 전체의 목적과 상태를 갖춘 완성 예시 |

- **실험과 배포는 첫 마디만 다르다.** 실험으로 등록할 때부터 최종 단계·분류·항목 이름을 쓴다. 스토리북 배포는
  `실험/`을 `배포/`로 바꾸는 일로 끝난다. 2026-10-06 실험 41개 승격이 재분류 작업이 된 원인을 막는 규칙이다.
- 항목 아래에 폴더를 두지 않는다. 같은 항목의 변형·비교·상태는 그 항목의 스토리다(내비게이션 바 표현 4개, 서비스 소개 3개).
- 단계는 의존 관계를 강제하지 않는다. 화면은 필요한 컴포넌트와 구성을 조합한다. 출처나 모션 유무가 아니라 실제 역할로 둔다.
- 비어 있는 단계·분류에 자리 채우기 스토리를 만들지 않는다.

### 1.2 분류 어휘와 메뉴 순서

분류는 단계별 고정 어휘에서만 고른다. **항목이 하나뿐인 분류는 두지 않는다**(두 플랫폼·두 상태의 제목을 합쳐 센다.
같은 항목은 두 플랫폼에서 같은 제목이기 때문이다). 판정 기준은 "사용자가 그 항목으로 하는 일"이다.

| 단계 | 분류(메뉴 순서) | 판정 기준 |
| --- | --- | --- |
| 토큰 | 색과 글자 · 공간과 크기 · 표면과 움직임 · 편집 도구 | 그 값이 무엇을 정하나. 편집 도구는 값 문서와 성격이 달라 따로 둔다 |
| 컴포넌트 | 개요 · 글자와 아이콘 · 레이아웃 · 동작 · 입력 · 탐색 · 데이터 표시 · 상태와 알림 · 오버레이 · 시각 효과 · 기반 기능 | 하는 일(2026-10-02 역할 검수). 수치·아바타·미디어는 데이터 표시, 값 변경은 입력, 화면 이동은 탐색, 로딩·결과·읽기 진행·알림은 상태와 알림, 장식·등장·내용 전환은 시각 효과 |
| 구성 | 입력과 작성 · 선택과 필터 · 탐색과 이동 · 정보 표시 · 피드백과 복구 · 직접 조작과 모션 · 비교와 검증 | 주된 사용자 행동. 시트·드로어 안 입력은 입력과 작성, 적용·취소·초기화는 선택과 필터, 실패·되돌리기·이탈 확인·빈 상태 다음 행동은 피드백과 복구 |
| 화면 | 소개 · 계정 · 설정 · 검색 · 콘텐츠 · 소통 · 화면 틀과 도구 | 화면의 목적 |

- `컴포넌트/개요`는 탐색 문서 분류다(사용 안내 · 컴포넌트 찾기 · 구현·검증 현황 · `<역할> 모아 보기` 9개, Web만).
  스토리 어휘·필수 변형·사용 지침 담당 대상이 아니다. `<역할> 모아 보기`는 canonical 컴포넌트 103개를 역할별 한 페이지에
  모은 Web 참조 목록이며, 2026-10-06 전 `배포/컴포넌트/<역할>` 페이지의 Web URL(id)을 보존하려고 남긴다.
- `구성/비교와 검증`은 표현·환경·플랫폼 구현을 나란히 비교하는 항목이다. 설계 본보기가 아니다.
- 버린 어휘: 구성 `오버레이`(목적이 아니라 수단), `시작과 안내`(2개뿐이고 기준이 겹침), 출처 이름 전부(공통 화면·공통 동작·
  기본 흐름·상호작용 예제·표현 비교·데이터 요약 등 1개짜리 묶음).
- 분류 안 항목 순서는 가나다순이다(`storySort` `method: "alphabetical"`, `locales: "ko"`). 흐름 순서가 의미 있는 곳만
  `ITEM_ORDER`로 고정한다: `컴포넌트/개요`(사용 안내 → 컴포넌트 찾기 → 구현·검증 현황 → 모아 보기 역할 순),
  `화면/소개`(서비스 소개 → 온보딩 → 권한 안내).

두 preview에 같은 `storySort` 리터럴을 둔다(Storybook이 import한 상수를 storySort로 받는지 확인하지 않았다).
검사기가 두 리터럴이 `expectedStorySort()`와 같은지 본다.

Native 10.4.4에서는 meta의 `includeStories`를 사용하지 않는다. `prepareStories`가 default metadata도
목록으로 필터링해 `processCSFFile`에서 id 오류로 시작을 막는다(2026-10-07 Expo Go 실제 확인).
스토리 외 helper는 preview 모듈로 옮긴다. metadata를 독립 보존하는 runtime으로 업그레이드해
실제 시작을 검증한 뒤 이 제약을 제거할 수 있다. Web의 includeStories는 유지한다.

### 1.3 항목 이름

1. 한글 명사구로 기능이나 사용자 문제를 말한다. 16자 이하, 영문 없음.
2. 출처·작업명·실험명·기술명을 쓰지 않는다: 공통, 기본 흐름, 레퍼런스, 참고, 상호작용 예제, 용도별, 예제, 데모, 연구, 실험,
   스튜디오, 제품·기술 이름(Expo·STEA·인스타그램), API 이름.
3. 플랫폼 이름(웹·네이티브)은 `구성/비교와 검증` 항목에만 쓴다(그 차이 자체가 대상일 때).
4. 항목 이름은 모든 단계를 통틀어 유일하고, 분류 이름과 같을 수 없다(`화면/검색/검색` 금지).
5. 컴포넌트 항목 이름은 API 이름이 아니라 역할을 쓴다(Button → 버튼, ThinkingOrb → 생각 중 표시). 공개 API 이름은 사용 지침과
   컴포넌트 찾기의 보조 정보에 둔다. 사전은 `showcase/shared/story-labels.ts`다(검사기는 대조하지 않는다).

### 1.4 스토리 이름과 순서

export와 표시 이름은 1:1이다. 아래 export는 이 이름으로만 쓰고, 이 이름을 다른 export에 쓰지 않는다. 뜻이 다르면 이름만 바꾸지
말고 맞는 export를 쓴다(검색 0건은 `Empty`가 아니라 `NoResults`).

| 순서 | export | 표시 이름 | 뜻 |
| --- | --- | --- | --- |
| 1 | `Default` | 기본 | 준비된 기본 상태. 실제로 조작할 수 있어야 한다. **모든 항목 필수, 첫 스토리** |
| 2 | 항목 고유 상태 | 자유 한글 | 예: 입력 중, 필터 시트, 여러 사진 전송, 탐색 옆에서 작업 실행(변형) |
| 2 | `Loading` · `Pending` · `Empty` · `NoResults` · `Error` · `Failed` · `Restricted` · `Disabled` · `Playground` | 불러오는 중 · 처리 중 · 비어 있음 · 결과 없음 · 오류 · 실패 후 입력 유지 · 로그인 필요 · 비활성 · 직접 조작 | 데이터 가져오는 중 · 사용자 행동 진행 중(버튼 로딩 포함) · 아직 내용 없음 · 검색·필터 0건 · 불러오기 실패와 다시 시도 · 행동 실패 후 입력·초안 유지 · 권한·로그인 없음 · 공개 `disabled` · args 놀이터. 이 순서를 지킨다 |
| 3 | `Dark` | 어두운 테마 | `globals: { theme: "dark" }`. **필수** |
| 4 | `LargeText` | 큰 글자 | `globals: { textScale: "2" }`. **필수** |
| 5 | `ReducedMotion` · `Rtl` | 동작 줄이기 · 오른쪽에서 왼쪽 | `globals.motion: "reduced"` · `globals.direction: "rtl"` |
| 6 | `<상태>Dark` · `<상태>LargeText` 등 · `Brand<색>` | `<상태 이름> · 어두운 테마` · `제품 색 · <색>` | 고유 상태와 환경의 조합, 제품 팔레트 |
| 7 | `Recovery` | 실패와 복구 | 실패 주입 도구로 실패 → 다시 시도를 직접 해 본다 |

- 상태 스토리는 그 항목 지침의 `## 상태`(화면)·`## 흐름과 상태`(구성) 표 행과 맞춘다. 항목에 의미 없는 상태를 일괄로 만들지 않는다
  (2026-10-06 공통 화면 12개가 같은 상태 세트를 복사해 로그인 화면에 "새 소식 없음"이 있었다).
- 변형이 여러 개인 항목(내비게이션 바, 서비스 소개)은 첫 변형을 `Default`, 나머지를 고유 상태(`Cycle`, `Product`)로 두고
  조합은 `<변형>Dark`·`<변형>LargeText`로 6번 자리에 둔다. 메뉴는 기본 → 변형들 → 어두운 테마 → 큰 글자 → 변형 조합 순이 된다.
- 이 순서는 기본 → 상태 → 어두운 테마 → 큰 글자 → 실패와 복구라는 2026-10-06 결정을 환경·조합 자리까지 넓힌 것이다.
- `컴포넌트/개요`의 문서 항목은 이 표의 대상이 아니다.

### 1.5 툴바 globals와 args

| global | 값 | 툴바 이름 |
| --- | --- | --- |
| `theme` | `light` · `dark` | 테마 |
| `direction` | `ltr` · `rtl` | 글 읽는 방향 |
| `textScale` | `1` · `1.5` · `2` | 글자 크기 |
| `motion` | `full` · `reduced` | 움직임 |

- 두 플랫폼의 `globalTypes` 키와 값이 같다. Native는 2026-10-06까지 `reducedMotion`이었다.
- 환경(테마·방향·글자 크기·움직임)은 globals로만 바꾼다. args나 `render` 안 Provider로 바꾸지 않는다. Native
  `InteractionAdapters`의 "동작 줄이기"가 render에서 다크·RTL·200%까지 함께 바꿔 이름과 실제가 달랐다.
- 스토리 globals에는 위 키만 쓴다(Web은 Storybook viewport addon의 `viewport` 허용).
- 상태는 args로 준다. 새 항목의 상태 arg 이름은 `state`, 실패 주입 도구는 `tools`다. 기존 `stateKind`·`view`·`initialState`는
  손댈 때 맞춘다(검사하지 않는다). 제품 팔레트는 args `brand`와 `Brand*` 스토리로 준다.

### 1.6 meta 형식

```tsx
const meta = {
  id: "purpose-input-message",                 // Web 필수·불변(URL 키). Native는 쓰지 않는다
  title: "배포/구성/입력과 작성/메시지 작성",
  component: MessageComposerPreview,
  args: { purpose: "message" },
} satisfies Meta<typeof MessageComposerPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { name: "기본" };
export const Dark: Story = { name: "어두운 테마", globals: { theme: "dark" } };
export const LargeText: Story = { name: "큰 글자", globals: { textScale: "2" } };
```

- Web `id`는 필수이며 ASCII kebab이다. **기존 id는 출처 이름이 들어 있어도 바꾸지 않는다**(`experimental-*`, `reference-*`,
  `patterns-*`). id는 메뉴에 보이지 않는 URL 키이고, 제목을 옮겨도 id가 같으면 옛 링크가 열린다.
- 새 id는 `<단계>-<분류>-<항목>` 영어 kebab이다. 컴포넌트 개별 항목은 `components-<역할 slug>-<API kebab>`
  (역할 slug: foundation · layout · actions · inputs · navigation · data-display · feedback · overlays · infrastructure).
- Native는 `id`를 쓰지 않는다. Native Storybook 10.4.4 runtime `prepareStories`가 meta.id를 무시해 제목 기반 id를 쓰므로,
  명시한 id와 renderer가 어긋난다(§3.1).
- 키 순서는 `id`, `title`, `component`, `args`, `argTypes`, `parameters`다. `component`를 둔다.
- `includeStories`는 새 파일에 쓰지 않는다. 쓰는 파일은 스토리 객체 export를 모두 담아야 한다(빠지면 메뉴에서 사라진다).
- 스토리가 아닌 함수·컴포넌트를 stories 파일에서 export하지 않는다. CSF는 이름 있는 export를 모두 스토리로 등록한다
  (2026-10-06 Native `FloatingNotesPreview`·`ProfileStudio`가 이름 없는 메뉴 항목이 됐다).
- `name`은 spread 뒤에 둔다. `{ name, ...Other }`는 spread가 이름을 덮는다(2026-10-06 Web 토스트 배치의 "간결한 배치" 셋).

### 1.7 파일 위치

- 위치: Web `showcase/web/src/{foundations,components,patterns}/`, Native `showcase/native/src/`(정규 컴포넌트는
  `src/components/`). Web 컴포넌트 개별 항목은 `showcase/web/src/components/<API>.stories.tsx`, 역할 모아 보기는
  `showcase/web/src/components/overview/`.
- 파일 이름은 영어 PascalCase다. 같은 제목이면 Web·Native 파일 이름을 같게 한다.
- 목표(아직 검사하지 않음): `*.stories.tsx`는 등록만 하고 구현·문구·fixture는 `<kebab>-previews.tsx`와
  `showcase/shared/<kebab>.ts`에 둔다. 출처 접두사 파일 이름(Stea·Reference·Common·Flow·Purpose·NavigationStudy·
  InteractionFlow·ActionRecovery)과 지침 파일 이름(`stea-*`·`reference-*`·`common-*`·`flow-*`·`purpose-*`)은 제목 변경과
  **다른 커밋**(`git mv`)으로 정리한다. 리뷰할 diff를 나누기 위해서다.

### 1.8 Web/Native 동등성

1. 두 플랫폼이 지원하는 항목은 같은 제목을 쓴다(상태 마디 제외 비교).
2. 한쪽에만 있는 항목은 검사기 `PLATFORM_ONLY`에 이유와 함께 적는다. 목록에 없는 차이와, 목록에 있지만 이제 두 플랫폼 모두
   있거나 없는 항목(낡은 예외)은 실패다. 사용 지침의 `지원:`은 그 플랫폼 하나여야 한다.
   - Web만: `컴포넌트/개요` 12개(탐색 문서), Web 전용 공개 API 21개(글자 서식·분할 영역 조절·데이터 표·트리 목록·워터마크·
     고정 배치·본문 바로가기·화면 읽기 도구용 글자·색상 선택기·명령 검색·문서 내 바로가기·사이드바·사이드바 전환·이동 경로·
     페이지 이동·상황별 메뉴·메뉴 막대·사용 안내 둘러보기·측면 패널·팝오버·툴팁), 구성 6개, 화면 `목업 편집`.
   - Native만: `입력/단계별 선택`, `상태와 알림/리퀴드 토스트`, 구성 3개(네이티브 컴포넌트 기기 확인·중단해도 남는 현재 상태·
     이미지·시트·키보드 조작).
3. 같은 제목의 스토리 export 집합은 같게 맞춘다. 다르면 지침 `## 플랫폼 차이`에 적는다(검사기는 아직 강제하지 않는다).
4. 같은 내용을 다른 역할에 두지 않는다. 컴포넌트 역할은 계약 카탈로그의 `category`를 따른다(달력은 데이터 표시, 명령 검색은
   오버레이). 2026-10-06 같은 날 한때 달력을 입력, 명령 검색을 탐색으로 옮기고 Web 묶음 링크를 `story-factory.ts` 예외 매핑으로
   맞췄으나, 카탈로그와 Storybook이 다른 분류를 갖게 되어 되돌렸다(후속 과제 14, 사용자 위임). 분류를 바꿔야 하면 카탈로그
   `category`를 먼저 바꾼다.

### 1.9 사용 지침 연결

- 모든 항목 제목은 [사용 지침](../packages/design-contracts/docs/usage/README.md)의 `- 스토리북:` 줄로 한 지침이 담당한다
  (`컴포넌트/개요` 제외, [규격](../packages/design-contracts/docs/usage/STANDARD.md)). 신규 항목은 같은 변경에서 지침을 쓴다.
- 구성·화면·토큰 지침의 `# 제목`은 Storybook 항목 이름과 같다. 항목을 합치면 지침도 하나로 합친다.
- 컴포넌트 지침은 그 API를 보여 주는 구성·화면 제목을 참조로 적을 수 있다(담당은 그 단계 지침).
- 스토리북 배포로 제목이 바뀌면 `스토리북:` 줄과 `상태:`를 같은 변경에서 바꾼다. `pnpm usage:check`가 대조한다.

### 1.10 검사

`pnpm storybook:check`는 `pnpm check`의 일부다. 정적 소스 검사이며 렌더·기기 확인이 아니다(통과 출력에도 적는다).
파서는 TypeScript AST로 meta·스토리 객체 리터럴을 읽는다.

| ID | 강제하는 것 |
| --- | --- |
| S1 | 제목 정확히 4마디, 상태·단계 어휘, 플랫폼 안 제목 중복 없음, 같은 항목이 배포와 실험에 동시에 없음 |
| S2 | 분류가 단계 어휘에 있음, 분류당 항목 2개 이상(두 플랫폼·두 상태 합산), 항목 이름 ≠ 분류 이름 |
| S3 | 항목 이름: 한글·영문 없음·16자 이하·금지어 없음·플랫폼 이름은 비교와 검증만·모든 단계에서 유일 |
| S4 | 스토리: `Default`·`Dark`·`LargeText` 필수, 첫 스토리 `Default`, 예약 export의 고정 이름, 예약 이름 남용 금지, §1.4 순서, 조합 이름 |
| S5 | Web meta id 필수·ASCII kebab·중복 없음, Native id 금지, `includeStories` 누락, **Web story id 불변**(아래) |
| S6 | Web/Native 제목 동등성과 `PLATFORM_ONLY` 예외(낡은 예외도 실패) |
| S7 | 두 preview `globalTypes` 키·값, 환경 스토리의 globals 값, 허용 global 키, args·render Provider로 환경 바꾸기 금지 |
| S8 | 두 preview `storySort` = 규격(order·method·locales), `ITEM_ORDER` 항목 존재 |

Web story id 불변: [`showcase/web/story-ids.json`](../showcase/web/story-ids.json)이 현재 Web story id(`<meta id>--<export>`) 전체를
`active`로 갖는다. 소스에서 id가 사라지면 실패하고, 사라진 id는 사람이 `retired`에 현재 있는 대체 id·날짜·이유와 함께 옮겨야
통과한다. 새 id는 `node scripts/check-storybook.mjs --write-ids`로 더한다(이 모드는 새 id만 더하고 지운 id를 빼지 않는다).
`storybook:check`에 `--write-ids`를 붙이지 않는다(governance 검사가 막는다). export 이름을 바꾸는 것도 URL 변경이라 같은 절차다.

검사하지 않는 것: 렌더 결과, 기기 메뉴, 컴포넌트 이름과 `story-labels.ts` 대조, 같은 제목의 export 집합 동등(§1.8-3), 파일 위치·
stories 파일 안 구현(§1.7 목표), 상태 arg 이름. 빌드 index 기준 정규 103개와 한글 이름은
[`showcase/web/scripts/verify-static.mjs`](../showcase/web/scripts/verify-static.mjs), Native 개별 컴포넌트와 renderer evidence
1:1은 `showcase/native/src/component-stories.test.ts`가 계속 맡는다. 항목별 제목을 하드코딩한 테스트는 승격할 때마다 깨져
규칙 대신 목록을 지켰으므로 이 검사로 대체한다.

### 1.11 신규 → 실험 → 사용자 승인 → 배포

- 신규 컴포넌트·표현 옵션·구성·화면·편집 도구는 지원하는 플랫폼의 `실험/<단계>/<분류>/<항목>`에 최종 이름으로 먼저 둔다.
  기본·어두운 테마·큰 글자와 실제 조작 예제를 제공하고, 같은 변경에서 사용 지침을 쓴다.
- 사용자의 명시적인 승인 뒤 첫 마디만 `배포/`로 바꾼다. 이를 **스토리북 배포**라고 부른다. 구현 요청·검사 통과·계속 진행·
  응답 없음은 승인이 아니다. 승인 날짜·대상·최종 경로를 §2에 남긴다.
- 스토리북 배포는 npm 게시·API 안정화·소비 앱 반영·운영 서비스 배포가 아니다. 각각 따로 승인·검증한다.
- 기존 배포 항목의 버그·접근성 수정은 현재 위치에서 한다. 기존 배포 예제를 대체하는 새 표현은 실험에서 검토한다.
- 표시 이름은 단계·분류·항목·상태·툴바까지 용도를 알 수 있는 한글로 쓴다. 공개 API·export 이름·import 경로·키보드 Home/End는
  번역하지 않는다.

## 2. 승인 기록

### 2026-10-07 기존 실험 17개 검토 후 배포와 npm 게시

- 사용자 요청: "실험에 있는것들 검토후 승급 후 게시 먼저하자". 이번 대상은 기존 17개이며 새 회원 미리보기 후보는 후속 작업이다.
- [항목별 검토와 수정](qa/2026-10-07-experiment-promotion-release.md)을 근거로 Web·Native의 첫 마디만 변경한다. Web 명시 ID를 보존한다.
- 이 승인은 Storybook 배포와 HJM npm 게시를 포함한다. catalog 성숙도 변경과 소비 제품 출시는 별도 증거가 필요하다.

| 최종 경로 | 플랫폼 | Web id |
| --- | --- | --- |
| 배포/구성/입력과 작성/관련 입력 묶음 | Web · Native | `street` |
| 배포/구성/입력과 작성/날짜 직접 입력 | Web · Native | `compositions-input-date-entry` |
| 배포/구성/입력과 작성/버튼에서 이어지는 편집 | Web · Native | `compositions-input-origin-dialog` |
| 배포/구성/입력과 작성/입력을 유지하는 도구 | Web · Native | `reference-adoption-contexttoolbar` |
| 배포/구성/정보 표시/문서와 파일 | Web · Native | `compositions-information-document-resource` |
| 배포/구성/정보 표시/영상 미리보기 | Web · Native | `compositions-information-video-preview` |
| 배포/구성/정보 표시/질감 비교 | Web · Native | `reference-adoption-texturecomparison` |
| 배포/구성/정보 표시/추가해도 유지되는 목록 | Web · Native | `compositions-live-list` |
| 배포/구성/직접 조작과 모션/높이가 이어지는 패널 | Web · Native | `reference-adoption-adaptivecontent` |
| 배포/구성/직접 조작과 모션/선택 배경 이동 | Web · Native | `reference-adoption-selectionmotion` |
| 배포/구성/피드백과 복구/그림과 시작 안내 | Web · Native | `compositions-feedback-illustrated-outcome` |
| 배포/구성/피드백과 복구/버튼 완료 피드백 | Web · Native | `reference-adoption-actionfeedback` |
| 배포/구성/피드백과 복구/선택과 오류 복구 | Web · Native | `reference-adoption-uploadrecovery` |
| 배포/컴포넌트/데이터 표시/이미지 전후 비교 | Web · Native | `reference-adoption-imagecomparison` |
| 배포/컴포넌트/시각 효과/가장자리 흐림 | Web · Native | `compositions-information-scroll-edge-blur` |
| 배포/컴포넌트/입력/별점 선택 | Web · Native | `reference-adoption-rating` |
| 배포/화면/소개/기능 카드와 주 행동 | Web · Native | `reference-adoption-productbento` |


### 2.1 2026-10-06 전체 승격과 규격 확정

- 승인: 2026-10-06 사용자. "실험 41개를 정리한 뒤 전부 배포로 옮긴다. 겹치는 항목은 합친 뒤 옮긴다." 메뉴 구조·어휘는
  "너가 권장하는 구조로, 깔끔하고 직관적으로"라고 위임했다. 릴리스(버전·npm·소비 앱)는 하지 않는다.
- 대상: 실험 전체(정리 단계에서 6개를 먼저 합쳐 35개 제목)와 배포 항목의 재분류. 정리 단계 합치기는 §4
  [실험 정리와 합친 항목](#실험-정리와-합친-항목-2026-10-06).
- 추가로 합친 것(배포 Web id 보존, API 기반 화면 우선):
  - `배포/화면/검색`(직접 조립 내 기록 검색) ← `실험/화면/공통 화면/검색`(SearchScreen) → `배포/화면/검색/검색 결과와 필터`(`patterns-search`)
  - `배포/화면/온보딩`(직접 조립) ← `실험/화면/기본 흐름/온보딩`(OnboardingScreen) → `배포/화면/소개/온보딩`(`patterns-onboarding`).
    직접 조립의 관심 주제 고르기는 스토리
  - `배포/화면/랜딩 화면` ← `실험/화면/서비스 소개/제품 체험 중심`(설명과 사례 중심 포함) → `배포/화면/소개/서비스 소개`(`patterns-landing`).
    기본=랜딩, 제품 체험 중심·설명과 사례 중심은 변형 스토리
  - `배포/화면/프로필 편집`(직접 조립) ← `실험/화면/공통 화면/프로필`(ProfileScreen) → `배포/화면/계정/프로필`(`patterns-profile-studio`).
    같은 프로필 수정을 두 번 보였다. 프로필 편집 고유의 기본 얼굴 고르기는 스토리
  - 내비게이션 바 표현 4개(깊이 5) → `배포/컴포넌트/탐색/내비게이션 바`(`experimental-navigation-robot`). 표현은 스토리
  - `실험/컴포넌트/입력/카테고리 필터` → `배포/컴포넌트/입력/버튼형 선택`의 `알약 모양` 스토리(SegmentedControl `presentation="pills"`, 별도 API 아님)
  - `배포/컴포넌트/동작/로딩 상태`(Web) → `버튼`·`소셜 로그인 버튼`의 `처리 중` 스토리
- Web 역할 묶음 9개 → `배포/컴포넌트/개요/<역할> 모아 보기`(id 보존). Web 개별 항목 84개를 새로 만들어 Web과 Native가 같은 제목을
  갖는다. 개별 항목 `달력`·`명령 검색`은 카탈로그 분류(데이터 표시·오버레이)에 둔다(§1.8-4, 같은 날 입력·탐색 이동을 되돌림).
- 이것은 Storybook 분류 승인이며 API 안정화·npm 게시·소비 앱 반영 승인이 아니다.

실험 → 배포 최종 경로:

| 이전 | 최종 경로 | 플랫폼 | Web id |
| --- | --- | --- | --- |
| 실험/구성/공통 동작/보관과 실행 취소 | 배포/구성/피드백과 복구/보관과 실행 취소 | Web · Native | `experimental-action-undo` |
| 실험/구성/공통 동작/저장과 재시도 | 배포/구성/피드백과 복구/저장과 재시도 | Web · Native | `experimental-action-save` |
| 실험/구성/공통 동작/즉시 반영과 복구 | 배포/구성/피드백과 복구/즉시 반영과 복구 | Web · Native | `experimental-action-optimistic` |
| 실험/구성/공통 화면/대화 메시지 | 배포/구성/정보 표시/대화 메시지 | Web · Native | `common-screen-message` |
| 실험/구성/공통 화면/알림 항목 | 배포/구성/정보 표시/알림 항목 | Web · Native | `common-screen-notification-item` |
| 실험/구성/드래그·스와이프·모션 | 배포/구성/직접 조작과 모션/끌기·밀기·화면 전환 | Web · Native | `experimental-interaction-adapters` |
| 실험/구성/사진/촬영과 앨범 선택 | 배포/구성/선택과 필터/사진 촬영과 앨범 선택 | Web · Native | `(파생)` → `compositions-selection-photo-source` |
| 실험/구성/상호작용 예제/늦은 응답보다 최신 검색 유지 | 배포/구성/입력과 작성/늦은 응답보다 최신 검색 유지 | Web · Native | `experimental-interaction-search` |
| 실험/구성/상호작용 예제/닫았다 열고 초안 이어쓰기 | 배포/구성/입력과 작성/닫았다 열고 초안 이어쓰기 | Web · Native | `experimental-interaction-draft` |
| 실험/구성/상호작용 예제/대표 항목과 묶음 전체 선택 | 배포/구성/선택과 필터/대표 항목과 묶음 전체 선택 | Web · Native | `experimental-selection-scope` |
| 실험/구성/상호작용 예제/선택 후 적용·취소 | 배포/구성/선택과 필터/선택 후 적용·취소 | Web · Native | `experimental-interaction-apply` |
| 실험/구성/설정/변경 저장과 이탈 확인 | 배포/구성/피드백과 복구/변경 저장과 이탈 확인 | Web · Native | `reference-settings` |
| 실험/구성/시작하기/첫 작업을 만들고 이어하기 | 배포/구성/입력과 작성/첫 작업을 만들고 이어하기 | Web · Native | `reference-first-task` |
| 실험/구성/이미지·시트·키보드 조작 | 배포/구성/직접 조작과 모션/이미지·시트·키보드 조작 | Native | — |
| 실험/구성/입력과 작성/댓글 작성 | 배포/구성/입력과 작성/댓글 작성 | Web · Native | `purpose-input-comment` |
| 실험/구성/입력과 작성/메시지 작성 | 배포/구성/입력과 작성/메시지 작성 | Web · Native | `purpose-input-message` |
| 실험/구성/확인/선택 내용 검토와 수정 | 배포/구성/입력과 작성/선택 내용 검토와 수정 | Web · Native | `reference-review` |
| 실험/컴포넌트/입력/카테고리 필터 | 합침 → 배포/컴포넌트/입력/버튼형 선택 | Web · Native | `category-filter` 폐기 |
| 실험/화면/공통 화면/검색 | 합침 → 배포/화면/검색/검색 결과와 필터 | Web · Native | `common-screen-search` 폐기 |
| 실험/화면/공통 화면/댓글 | 배포/화면/소통/댓글 | Web · Native | `common-screen-comments` |
| 실험/화면/공통 화면/로그인 | 배포/화면/계정/로그인 | Web · Native | `common-screen-login` |
| 실험/화면/공통 화면/설정 | 배포/화면/설정/앱 설정 | Web · Native | `common-screen-settings` |
| 실험/화면/공통 화면/알림함 | 배포/화면/소통/알림함 | Web · Native | `common-screen-notifications` |
| 실험/화면/공통 화면/저장한 항목 | 배포/화면/콘텐츠/저장한 항목 | Web · Native | `common-screen-saved` |
| 실험/화면/공통 화면/채팅 | 배포/화면/소통/채팅 | Web · Native | `common-screen-chat` |
| 실험/화면/공통 화면/프로필 | 합침 → 배포/화면/계정/프로필 | Web · Native | `common-screen-profile` 폐기 |
| 실험/화면/공통 화면/화면 골격 | 배포/화면/화면 틀과 도구/화면 골격과 상태 | Web · Native | `common-screen-shell` |
| 실험/화면/기본 흐름/권한 안내 | 배포/화면/소개/권한 안내 | Web · Native | `screen-flow-permission` |
| 실험/화면/기본 흐름/목록과 상세 | 배포/화면/콘텐츠/목록과 상세 | Web · Native | `screen-flow-collection` |
| 실험/화면/기본 흐름/사진 선택과 업로드 | 배포/화면/콘텐츠/사진 선택과 업로드 | Web · Native | `screen-flow-media` |
| 실험/화면/기본 흐름/신고와 차단 | 배포/화면/소통/신고와 차단 | Web · Native | `screen-flow-moderation` |
| 실험/화면/기본 흐름/온보딩 | 합침 → 배포/화면/소개/온보딩 | Web · Native | `screen-flow-onboarding` 폐기 |
| 실험/화면/기본 흐름/작성과 수정 | 배포/화면/콘텐츠/작성과 수정 | Web · Native | `screen-flow-editor` |
| 실험/화면/서비스 소개/제품 체험 중심 | 합침 → 배포/화면/소개/서비스 소개 | Web · Native | `reference-product` 폐기 |
| 실험/화면/표현 비교/같은 기록의 세 가지 구성 | 배포/화면/화면 틀과 도구/기록 표현 비교 | Web · Native | `reference-comparison` |

배포 항목 재분류:

| 이전 | 최종 경로 | 플랫폼 | Web id |
| --- | --- | --- | --- |
| 배포/구성/내비게이션 바 비교 | 배포/구성/비교와 검증/내비게이션 바 비교 | Web · Native | `experimental-navigation-bars` |
| 배포/구성/네이티브 컴포넌트 모음 | 배포/구성/비교와 검증/네이티브 컴포넌트 기기 확인 | Native | — |
| 배포/구성/단계별 드로어 | 배포/구성/입력과 작성/단계별 드로어 | Web · Native | `patterns-family-drawer` |
| 배포/구성/데이터 배치 | 배포/구성/정보 표시/카드 묶음과 긴 목록 | Web · Native | `patterns-data-layouts` |
| 배포/구성/데이터 요약/수치와 이전 대비 변화 | 배포/구성/정보 표시/수치와 이전 대비 변화 | Web · Native | `experimental-stea-stat-summary` |
| 배포/구성/모션 연동 | 배포/구성/직접 조작과 모션/숫자 변화와 메뉴 변형 | Web | `patterns-optional-motion` |
| 배포/구성/복합 입력 | 배포/구성/비교와 검증/복합 입력 모음 | Web · Native | `gallery-compound-controls` |
| 배포/구성/빈 상태/캐릭터와 시작 행동 | 배포/구성/피드백과 복구/캐릭터와 시작 행동 | Web · Native | `experimental-stea-pixel-empty` |
| 배포/구성/빠른 메모 작성 | 배포/구성/입력과 작성/빠른 메모 작성 | Web · Native | `patterns-floating-action-button` |
| 배포/구성/시각 효과 | 배포/구성/비교와 검증/시각 효과 모음 | Web · Native | `gallery-visual-foundations` |
| 배포/구성/시간 선택 | 배포/구성/선택과 필터/시간 선택 | Web · Native | `patterns-time-selection` |
| 배포/구성/웹 보조 기능 | 배포/구성/비교와 검증/웹 전용 보조 컴포넌트 | Web | `patterns-web-additions` |
| 배포/구성/웹 탐색 | 배포/구성/탐색과 이동/보관함과 페이지 이동 | Web | `patterns-webnavigation` |
| 배포/구성/인증/인증번호 확인과 다시 입력 | 배포/구성/입력과 작성/인증번호 확인과 다시 입력 | Web · Native | `experimental-stea-otp-verify` |
| 배포/구성/일정/날짜 선택과 예정 목록 | 배포/구성/선택과 필터/날짜 선택과 예정 목록 | Web · Native | `experimental-stea-schedule-card` |
| 배포/구성/입력 시트 | 배포/구성/입력과 작성/입력 시트 | Web · Native | `patterns-input-sheet` |
| 배포/구성/정보 카드/앞면과 상세 정보 전환 | 배포/구성/정보 표시/앞면과 상세 정보 전환 | Web · Native | `experimental-stea-flip-card` |
| 배포/구성/정보 카드/일정과 식별 정보 티켓 | 배포/구성/정보 표시/일정과 식별 정보 티켓 | Web · Native | `experimental-stea-event-ticket` |
| 배포/구성/진행 단계/처리 단계와 재시도 | 배포/구성/피드백과 복구/처리 단계와 재시도 | Web · Native | `experimental-stea-order-progress` |
| 배포/구성/토스트 배치 | 배포/구성/비교와 검증/토스트 배치 비교 | Web | `patterns-toast-layout` |
| 배포/구성/펼침과 메뉴 | 배포/구성/탐색과 이동/펼침과 메뉴 | Web | `patterns-disclosure` |
| 배포/구성/환경별 비교 | 배포/구성/비교와 검증/환경 조합 검증 | Web | `patterns-environment-matrix` |
| 배포/구성/Expo 인터랙션 복구 | 배포/구성/피드백과 복구/중단해도 남는 현재 상태 | Native | — |
| 배포/컴포넌트/개요 | 배포/컴포넌트/개요/컴포넌트 찾기 | Web | `components-overview` |
| 배포/컴포넌트/글자와 아이콘 | 배포/컴포넌트/개요/글자와 아이콘 모아 보기 | Web | `components-foundation` |
| 배포/컴포넌트/기반 기능 | 배포/컴포넌트/개요/기반 기능 모아 보기 | Web | `components-infrastructure` |
| 배포/컴포넌트/데이터 표시 | 배포/컴포넌트/개요/데이터 표시 모아 보기 | Web | `components-data-display` |
| 배포/컴포넌트/동작 | 배포/컴포넌트/개요/동작 모아 보기 | Web | `components-actions` |
| 배포/컴포넌트/동작/로딩 상태 | 합침 → 배포/컴포넌트/동작/버튼 | Web | `(파생)` 폐기 |
| 배포/컴포넌트/레이아웃 | 배포/컴포넌트/개요/레이아웃 모아 보기 | Web | `components-layout` |
| 배포/컴포넌트/상태와 알림 | 배포/컴포넌트/개요/상태와 알림 모아 보기 | Web | `components-feedback` |
| 배포/컴포넌트/오버레이 | 배포/컴포넌트/개요/오버레이 모아 보기 | Web | `components-overlays` |
| 배포/컴포넌트/입력 | 배포/컴포넌트/개요/입력 모아 보기 | Web | `components-inputs` |
| 배포/컴포넌트/전체 목록 | 배포/컴포넌트/개요/구현·검증 현황 | Web | `components-catalog` |
| 배포/컴포넌트/탐색 | 배포/컴포넌트/개요/탐색 모아 보기 | Web | `components-navigation` |
| 배포/컴포넌트/탐색/내비게이션 바/사각 영역으로 현재 위치 표시 | 합침 → 배포/컴포넌트/탐색/내비게이션 바 | Web · Native | `experimental-navigation-project` 폐기 |
| 배포/컴포넌트/탐색/내비게이션 바/선택한 목적지 이름 표시 | 합침 → 배포/컴포넌트/탐색/내비게이션 바 | Web · Native | `experimental-navigation-finance` 폐기 |
| 배포/컴포넌트/탐색/내비게이션 바/중앙에서 작업 실행 | 배포/컴포넌트/탐색/내비게이션 바 | Web · Native | `experimental-navigation-robot` |
| 배포/컴포넌트/탐색/내비게이션 바/탐색 옆에서 작업 실행 | 합침 → 배포/컴포넌트/탐색/내비게이션 바 | Web · Native | `experimental-navigation-cycle` 폐기 |
| 배포/토큰/간격 | 배포/토큰/공간과 크기/간격 | Web · Native | `foundations-spacing-motion` |
| 배포/토큰/겹침 순서 | 배포/토큰/표면과 움직임/겹침 순서 | Web · Native | `foundations-layers` |
| 배포/토큰/그림자와 투명도 | 배포/토큰/표면과 움직임/그림자와 투명도 | Web · Native | `foundations-effects` |
| 배포/토큰/글꼴 편집 | 배포/토큰/편집 도구/글꼴 편집 | Web · Native | `foundations-typography-studio` |
| 배포/토큰/둥글기 | 배포/토큰/표면과 움직임/둥글기 | Web · Native | `foundations-radius` |
| 배포/토큰/모션 | 배포/토큰/표면과 움직임/모션 | Web · Native | `foundations-motion` |
| 배포/토큰/색상 | 배포/토큰/색과 글자/색상 | Web · Native | `foundations-colors` |
| 배포/토큰/크기 | 배포/토큰/공간과 크기/크기 | Web · Native | `foundations-size` |
| 배포/토큰/타이포그래피 | 배포/토큰/색과 글자/타이포그래피 | Web · Native | `foundations-typography` |
| 배포/토큰/테두리 | 배포/토큰/표면과 움직임/테두리 | Web · Native | `foundations-stroke` |
| 배포/토큰/테마 편집 | 배포/토큰/편집 도구/테마 편집 | Web · Native | `foundations-theme-studio` |
| 배포/토큰/화면 여백과 너비 | 배포/토큰/공간과 크기/화면 여백과 너비 | Web · Native | `foundations-layout` |
| 배포/화면/검색 | 배포/화면/검색/검색 결과와 필터 | Web · Native | `patterns-search` |
| 배포/화면/대시보드 | 배포/화면/콘텐츠/대시보드 | Web · Native | `patterns-dashboard` |
| 배포/화면/랜딩 화면 | 배포/화면/소개/서비스 소개 | Web · Native | `patterns-landing` |
| 배포/화면/목업 편집 | 배포/화면/화면 틀과 도구/목업 편집 | Web | `foundations-mockup-studio` |
| 배포/화면/알림 설정 | 배포/화면/설정/알림 설정 | Web · Native | `patterns-notification-settings` |
| 배포/화면/온보딩 | 배포/화면/소개/온보딩 | Web · Native | `patterns-onboarding` |
| 배포/화면/작품 탐색 | 배포/화면/검색/작품 탐색 | Web · Native | `patterns-discovery-gallery` |
| 배포/화면/프로필 편집 | 배포/화면/계정/프로필 | Web · Native | `patterns-profile-studio` |

### 2.2 이전 승인

- 2026-10-02 내비게이션 바만 배포, 나머지 상호작용 예제는 실험 유지(§4 [내비게이션 바 승인과 중복 정리](#내비게이션-바-승인과-중복-정리)).
- 2026-10-02 STEA 후보 구성 7개 배포(§4 [STEA 후보 구성 배포 승인](#stea-후보-구성-배포-승인-2026-10-02)).

## 3. 링크 호환 기록

### 3.1 Web id와 Native id

분류를 바꿔도 공개 API·패키지 경로는 바뀌지 않는다. Web은 CSF meta에 `id`를 명시해 제목을 옮겨도 기존 URL을 유지한다.
Native Storybook 10.4.4의 runtime `prepareStories`는 meta.id 대신 title로 ID를 만들어 명시적 ID와 renderer가 어긋난다.
앱이 열리지 않는 우회 패치 대신 Native에는 새 제목 기반 ID를 쓴다(예: `컴포넌트-데이터-표시-블로바타-캐릭터--default`).
예전 모바일 링크나 저장된 선택에서 찾을 수 없다는 오류가 나오면 메뉴에서 새 항목을 고른다.
TODO(remove when Native runtime index honors meta.id): 이 제한이 풀리면 Native에도 Web과 같은 id 보존을 적용한다.

### 3.2 폐기한 Web story id

폐기한 id와 대체 id는 [`showcase/web/story-ids.json`](../showcase/web/story-ids.json)의 `retired`가 원본이다(검사기가 대체 id 존재를
확인한다). 아래는 2026-10-06 승격을 적용한 기준이다(적용 전 `story-ids.json`에는 정리 단계에서 이미 지운 53개만 있다). 사라지는 id 147개의 묶음별 대체 위치(스토리 이름은 대부분 같다. 정확한 대응은 `retired`). 다른 항목으로 옮긴 것:

| 옛 id | 대체 id |
| --- | --- |
| `category-filter--*` | `components-inputs-segmented-control--*` |
| `common-screen-composer--*` | `purpose-input-message--*` |
| `common-screen-message--*` | `common-screen-chat--*` |
| `common-screen-notification-item--*` | `common-screen-notifications--*` |
| `common-screen-profile--*` | `patterns-profile-studio--*` |
| `common-screen-search--*` | `patterns-search--*` |
| `components-data-display--*` | `components-inputs--*` |
| `components-overlays--*` | `components-navigation--*` |
| `experimental-navigation-cycle--*` | `experimental-navigation-robot--*` |
| `experimental-navigation-finance--*` | `experimental-navigation-robot--*` |
| `experimental-navigation-project--*` | `experimental-navigation-robot--*` |
| `purpose-input-search--*` | `experimental-interaction-search--*` |
| `reference-editorial--*` | `patterns-landing--*` |
| `reference-filters--*` | `patterns-search--*` |
| `reference-product--*` | `patterns-landing--*` |
| `screen-flow-account--*` | `patterns-profile-studio--*` |
| `screen-flow-discovery--*` | `patterns-search--*` |
| `screen-flow-onboarding--*` | `patterns-onboarding--*` |
| `배포-컴포넌트-동작-로딩-상태--*` | `components-actions-auth-provider-button--*`, `components-actions-button--*` |
| `실험-구성-사진-촬영과-앨범-선택--*` | `compositions-selection-photo-source--*` |

같은 항목 안에서 export 이름만 고정 어휘로 바꾼 것(첫 스토리 → `Default`, `Error` → `Failed`, `Violet` → `BrandViolet`, `Loading` → `Pending` 등)은 `common-screen-login`, `common-screen-settings`, `common-screen-shell`, `experimental-interaction-adapters`, `experimental-interaction-search`, `foundations-colors`, `foundations-spacing-motion`, `foundations-typography`, `gallery-compound-controls`, `gallery-visual-foundations`, `patterns-agreement`, `patterns-anchor`, `patterns-asset`, `patterns-commandpalette`, `patterns-data-layouts`, `patterns-daterange`, `patterns-disclosure`, `patterns-environment-matrix`, `patterns-floating-action-button`, `patterns-heading`, `patterns-optional-motion`, `patterns-popover`, `patterns-profile-studio`, `patterns-rating`, `patterns-sidebar`, `patterns-sidepanel`, `patterns-splitter`, `patterns-textformat`, `patterns-time-selection`, `patterns-toast-layout`, `patterns-togglegroup`, `patterns-tour`, `patterns-transferlist`, `patterns-tree`, `patterns-web-additions`, `patterns-webnavigation`, `purpose-input-comment`, `purpose-input-message`의 일부 스토리다. 예: `patterns-rating--whole-point` → `patterns-rating--default`, `purpose-input-message--error` → `purpose-input-message--failed`.
역할 묶음 9개(`components-*`)의 id와 스토리 103개는 그대로다. 같은 날 `components-data-display--calendar` →
`components-inputs--calendar`, `components-overlays--command-palette` → `components-navigation--command-palette`로 옮겼던 두 개는
게시 전에 원래 id로 되돌렸다(§1.8-4). `patterns-calendar`·`patterns-commandpalette`의 id는 그대로이고 제목만
`배포/컴포넌트/데이터 표시/달력`·`배포/컴포넌트/오버레이/명령 검색`이 됐다.

### 3.3 2026-10-02 영어 메뉴에서 단계 분류로 옮긴 위치(당시 기록)

아래 표의 "현재 메뉴"는 2026-10-02 당시 경로다. 2026-10-06 최종 경로는 §2.1 표를 본다. 과거 캡처의 breadcrumb는 당시 기록으로 유지한다.

| 플랫폼 | 이전 메뉴 | 현재 메뉴 |
| --- | --- | --- |
| Native | Components/Display/Activity Heatmap | 배포/컴포넌트/데이터 표시/활동 히트맵 |
| Native | Components/Display/Animated Blobatar | 배포/컴포넌트/데이터 표시/움직이는 블로바타 캐릭터 |
| Native | Components/Display/Animated Statistic | 배포/컴포넌트/데이터 표시/움직이는 수치 |
| Native | Components/Display/Blobatar Avatar | 배포/컴포넌트/데이터 표시/블로바타 캐릭터 |
| Native | Components/Inputs/Calendar | 배포/컴포넌트/입력/달력 |
| Native | Components/Data Display/Carousel | 배포/컴포넌트/데이터 표시/캐러셀 |
| Native | Patterns/Cascader | 배포/컴포넌트/입력/단계별 선택 |
| Native | Components/Display/Code Block | 배포/컴포넌트/데이터 표시/코드 블록 |
| Native | Gallery/Compound controls | 배포/구성/복합 입력 |
| Native | Components/Display/Content Transition | 배포/컴포넌트/시각 효과/내용 전환 |
| Native | Patterns/Dashboard | 배포/화면/대시보드 |
| Native | Patterns/Data layouts | 배포/구성/데이터 배치 |
| Native | Components/Inputs/Duration Field | 배포/컴포넌트/입력/소요 시간 입력 |
| Native | Components/Display/Effect Surface | 배포/컴포넌트/시각 효과/배경 시각 효과 |
| Native | Patterns/Family drawer | 배포/구성/단계별 드로어 |
| Native | Patterns/Floating action button | 배포/구성/빠른 메모 작성 |
| Native | Components/Display/Folder Preview | 배포/컴포넌트/데이터 표시/폴더 미리보기 |
| Native | Components/Navigation/Gooey Navigation | 배포/컴포넌트/탐색/물방울 탐색 메뉴 |
| Native | Components/Display/Gravity Letters | 배포/컴포넌트/시각 효과/중력 글자 |
| Native | Components/Display/Grid Reveal | 배포/컴포넌트/시각 효과/격자 등장 효과 |
| Native | Components/Actions/Inline Confirm | 배포/컴포넌트/동작/버튼 안에서 확인 |
| Native | Patterns/Input sheet | 배포/구성/입력 시트 |
| Native | Experimental/Interaction Adapters | 실험/구성/드래그·스와이프·모션 |
| Native | Patterns/Landing | 배포/화면/랜딩 화면 |
| Native | Components/Feedback/Liquid Toast | 배포/컴포넌트/상태와 알림/리퀴드 토스트 |
| Native | Components/Display/Lucide Icon | 배포/컴포넌트/글자와 아이콘/루시드 아이콘 |
| Native | Gallery/Renderer Gallery | 배포/구성/네이티브 컴포넌트 모음 |
| Native | Components/Feedback/Notification Bell | 배포/컴포넌트/상태와 알림/알림 벨 |
| Native | Patterns/Notification settings | 배포/화면/알림 설정 |
| Native | Patterns/Onboarding | 배포/화면/온보딩 |
| Native | Experimental/Optional Adapters | 실험/구성/이미지·시트·키보드 조작 |
| Native | Patterns/Profile studio | 배포/화면/프로필 편집 |
| Native | Patterns/Rating | 배포/컴포넌트/입력/별점 |
| Native | Components/Actions/Reaction Picker | 배포/컴포넌트/동작/반응 선택 |
| Native | Components/Feedback/Scroll Progress | 배포/컴포넌트/상태와 알림/읽기 진행 표시 |
| Native | Patterns/Search | 배포/화면/검색 |
| Native | Components/Feedback/Step Player | 배포/컴포넌트/상태와 알림/단계별 진행 표시 |
| Native | Components/Inputs/Task List | 배포/컴포넌트/입력/할 일 목록 |
| Native | Foundations/Theme Studio | 배포/토큰/테마 편집 |
| Native | Components/Feedback/ThinkingOrb | 배포/컴포넌트/상태와 알림/생각 중 표시 |
| Native | Patterns/Time selection | 배포/구성/시간 선택 |
| Native | Foundations/Typography Studio | 배포/토큰/글꼴 편집 |
| Native | Gallery/Visual foundations | 배포/구성/시각 효과 |
| Native | Components/Display/Voice Note | 배포/컴포넌트/데이터 표시/음성 메모 |
| Native | Components/Data Display/Accordion | 배포/컴포넌트/데이터 표시/아코디언 |
| Native | Components/Inputs/Agreement | 배포/컴포넌트/입력/약관 동의 |
| Native | Components/Overlays/AlertDialog | 배포/컴포넌트/오버레이/확인 대화상자 |
| Native | Components/Foundations/AspectRatio | 배포/컴포넌트/레이아웃/화면 비율 |
| Native | Components/Data Display/Asset | 배포/컴포넌트/데이터 표시/이미지·영상 표시 |
| Native | Components/Actions/AuthProviderButton | 배포/컴포넌트/동작/소셜 로그인 버튼 |
| Native | Components/Foundations/AuthScreen | 배포/컴포넌트/레이아웃/로그인 화면 |
| Native | Components/Data Display/Avatar | 배포/컴포넌트/데이터 표시/아바타 |
| Native | Components/Data Display/Badge | 배포/컴포넌트/데이터 표시/배지 |
| Native | Components/Actions/BottomCta | 배포/컴포넌트/동작/하단 실행 버튼 |
| Native | Components/Feedback/BottomInfo | 배포/컴포넌트/상태와 알림/하단 안내 |
| Native | Components/Navigation/BottomNavigation | 배포/컴포넌트/탐색/하단 탐색 |
| Native | Components/Actions/Button | 배포/컴포넌트/동작/버튼 |
| Native | Components/Data Display/Card | 배포/컴포넌트/데이터 표시/카드 |
| Native | Components/Inputs/Checkbox | 배포/컴포넌트/입력/체크박스 |
| Native | Components/Inputs/CheckboxGroup | 배포/컴포넌트/입력/체크박스 그룹 |
| Native | Components/Inputs/Chip | 배포/컴포넌트/입력/선택 칩 |
| Native | Components/Data Display/Collapsible | 배포/컴포넌트/데이터 표시/접기와 펼치기 |
| Native | Components/Inputs/Combobox | 배포/컴포넌트/입력/검색형 선택 |
| Native | Components/Foundations/Container | 배포/컴포넌트/레이아웃/컨테이너 |
| Native | Components/Data Display/CounterBadge | 배포/컴포넌트/데이터 표시/숫자 배지 |
| Native | Components/Inputs/DatePicker | 배포/컴포넌트/입력/날짜 선택 |
| Native | Components/Inputs/DateRangePicker | 배포/컴포넌트/입력/기간 선택 |
| Native | Components/Data Display/DescriptionList | 배포/컴포넌트/데이터 표시/설명 목록 |
| Native | Components/Foundations/DesignSystemProvider | 배포/컴포넌트/기반 기능/디자인 시스템 설정 |
| Native | Components/Overlays/Dialog | 배포/컴포넌트/오버레이/대화상자 |
| Native | Components/Foundations/Divider | 배포/컴포넌트/레이아웃/구분선 |
| Native | Components/Feedback/EmptyState | 배포/컴포넌트/상태와 알림/빈 상태 |
| Native | Components/Inputs/Field | 배포/컴포넌트/입력/입력 필드 |
| Native | Components/Inputs/FilePicker | 배포/컴포넌트/입력/파일 선택 |
| Native | Components/Actions/FloatingActionButton | 배포/컴포넌트/동작/플로팅 실행 버튼 |
| Native | Components/Inputs/Form | 배포/컴포넌트/입력/입력 양식 |
| Native | Components/Foundations/Grid | 배포/컴포넌트/레이아웃/격자 |
| Native | Components/Foundations/Heading | 배포/컴포넌트/글자와 아이콘/제목 |
| Native | Components/Foundations/Icon | 배포/컴포넌트/글자와 아이콘/아이콘 |
| Native | Components/Actions/IconButton | 배포/컴포넌트/동작/아이콘 버튼 |
| Native | Components/Data Display/Image | 배포/컴포넌트/데이터 표시/이미지 |
| Native | Components/Foundations/Layout | 배포/컴포넌트/레이아웃/화면 기본 구조 |
| Native | Components/Actions/Link | 배포/컴포넌트/동작/링크 |
| Native | Components/Data Display/List | 배포/컴포넌트/데이터 표시/목록 |
| Native | Components/Data Display/ListRow | 배포/컴포넌트/데이터 표시/목록 행 |
| Native | Components/Navigation/LoadMore | 배포/컴포넌트/탐색/더 보기 |
| Native | Components/Data Layouts/Masonry | 배포/컴포넌트/레이아웃/높이가 다른 카드 배치 |
| Native | Components/Inputs/Mentions | 배포/컴포넌트/입력/사용자 언급 |
| Native | Components/Navigation/Menu | 배포/컴포넌트/탐색/메뉴 |
| Native | Components/Feedback/Notice | 배포/컴포넌트/상태와 알림/안내 메시지 |
| Native | Components/Inputs/NumberField | 배포/컴포넌트/입력/숫자 입력 |
| Native | Components/Inputs/OtpField | 배포/컴포넌트/입력/인증번호 입력 |
| Native | Components/Inputs/PasswordField | 배포/컴포넌트/입력/비밀번호 입력 |
| Native | Components/Feedback/Progress | 배포/컴포넌트/상태와 알림/진행 표시 |
| Native | Components/Data Layouts/QrCode | 배포/컴포넌트/데이터 표시/큐알 코드 |
| Native | Components/Inputs/Radio | 배포/컴포넌트/입력/라디오 버튼 |
| Native | Components/Inputs/RadioGroup | 배포/컴포넌트/입력/라디오 버튼 그룹 |
| Native | Components/Feedback/Result | 배포/컴포넌트/상태와 알림/결과 안내 |
| Native | Components/Inputs/SearchField | 배포/컴포넌트/입력/검색 입력 |
| Native | Components/Foundations/Section | 배포/컴포넌트/레이아웃/섹션 |
| Native | Components/Inputs/SegmentedControl | 배포/컴포넌트/입력/버튼형 선택 |
| Native | Components/Inputs/Select | 배포/컴포넌트/입력/목록에서 선택 |
| Native | Components/Overlays/Sheet | 배포/컴포넌트/오버레이/시트 |
| Native | Components/Feedback/Skeleton | 배포/컴포넌트/상태와 알림/스켈레톤 |
| Native | Components/Inputs/Slider | 배포/컴포넌트/입력/슬라이더 |
| Native | Components/Feedback/Spinner | 배포/컴포넌트/상태와 알림/로딩 표시 |
| Native | Components/Foundations/Stack | 배포/컴포넌트/레이아웃/가로·세로 배치 |
| Native | Components/Data Display/Statistic | 배포/컴포넌트/데이터 표시/수치 표시 |
| Native | Components/Navigation/Steps | 배포/컴포넌트/탐색/단계 탐색 |
| Native | Components/Foundations/Surface | 배포/컴포넌트/레이아웃/배경 영역 |
| Native | Components/Inputs/Switch | 배포/컴포넌트/입력/스위치 |
| Native | Components/Navigation/Tabs | 배포/컴포넌트/탐색/탭 |
| Native | Components/Data Display/Tag | 배포/컴포넌트/데이터 표시/태그 |
| Native | Components/Inputs/TagsInput | 배포/컴포넌트/입력/태그 입력 |
| Native | Components/Foundations/Text | 배포/컴포넌트/글자와 아이콘/본문 글자 |
| Native | Components/Inputs/TextArea | 배포/컴포넌트/입력/여러 줄 입력 |
| Native | Components/Data Display/Timeline | 배포/컴포넌트/데이터 표시/타임라인 |
| Native | Components/Feedback/Toast | 배포/컴포넌트/상태와 알림/토스트 |
| Native | Components/Inputs/ToggleGroup | 배포/컴포넌트/입력/토글 그룹 |
| Native | Components/Foundations/Top | 배포/컴포넌트/레이아웃/화면 제목과 설명 |
| Native | Components/Navigation/TopBar | 배포/컴포넌트/탐색/상단 탐색 막대 |
| Native | Components/Inputs/TransferList | 배포/컴포넌트/입력/목록 간 항목 이동 |
| Native | Components/Data Display/UploadItem | 배포/컴포넌트/데이터 표시/업로드 항목 |
| Native | Components/Data Layouts/VirtualList | 배포/컴포넌트/데이터 표시/가상 목록 |
| Web | Home/Overview | 배포/컴포넌트/개요/사용 안내 |
| Web | Components/Actions | 배포/컴포넌트/동작 |
| Web | Components/Catalog | 배포/컴포넌트/전체 목록 |
| Web | Components/Overview | 배포/컴포넌트/개요 |
| Web | Components/Data Display | 배포/컴포넌트/데이터 표시 |
| Web | Components/Feedback | 배포/컴포넌트/상태와 알림 |
| Web | Components/Foundation | 배포/컴포넌트/글자와 아이콘 |
| Web | Components/Infrastructure | 배포/컴포넌트/기반 기능 |
| Web | Components/Inputs | 배포/컴포넌트/입력 |
| Web | Components/Layout | 배포/컴포넌트/레이아웃 |
| Web | Components/Navigation | 배포/컴포넌트/탐색 |
| Web | Patterns/Optional Motion | 배포/구성/모션 연동 |
| Web | Components/Overlays | 배포/컴포넌트/오버레이 |
| Web | Components/Feedback/ThinkingOrb | 배포/컴포넌트/상태와 알림/생각 중 표시 |
| Web | Patterns/Toast layout | 배포/구성/토스트 배치 |
| Web | Foundations/Colors | 배포/토큰/색상 |
| Web | Foundations/Mockup Studio | 배포/화면/목업 편집 |
| Web | Foundations/Spacing & Motion | 배포/토큰/간격과 모션 |
| Web | Foundations/Theme Studio | 배포/토큰/테마 편집 |
| Web | Foundations/Typography | 배포/토큰/타이포그래피 |
| Web | Foundations/Typography Studio | 배포/토큰/글꼴 편집 |
| Web | Components/Display/Activity Heatmap | 배포/컴포넌트/데이터 표시/활동 히트맵 |
| Web | Patterns/Agreement | 배포/컴포넌트/입력/약관 동의 |
| Web | Patterns/Anchor | 배포/컴포넌트/탐색/문서 내 바로가기 |
| Web | Components/Display/Animated Blobatar | 배포/컴포넌트/데이터 표시/움직이는 블로바타 캐릭터 |
| Web | Components/Display/Animated Statistic | 배포/컴포넌트/데이터 표시/움직이는 수치 |
| Web | Patterns/Asset | 배포/컴포넌트/데이터 표시/이미지·영상 표시 |
| Web | Components/Display/Blobatar Avatar | 배포/컴포넌트/데이터 표시/블로바타 캐릭터 |
| Web | Patterns/Calendar | 배포/컴포넌트/입력/달력 |
| Web | Patterns/Carousel | 배포/컴포넌트/데이터 표시/캐러셀 |
| Web | Components/Display/Code Block | 배포/컴포넌트/데이터 표시/코드 블록 |
| Web | Patterns/CommandPalette | 배포/컴포넌트/탐색/명령 검색 |
| Web | Gallery/Compound controls | 배포/구성/복합 입력 |
| Web | Components/Display/Content Transition | 배포/컴포넌트/시각 효과/내용 전환 |
| Web | Patterns/Dashboard | 배포/화면/대시보드 |
| Web | Patterns/Data layouts | 배포/구성/데이터 배치 |
| Web | Patterns/DateRange | 배포/컴포넌트/입력/기간 선택 |
| Web | Patterns/Disclosure | 배포/구성/펼침과 메뉴 |
| Web | Components/Inputs/Duration Field | 배포/컴포넌트/입력/소요 시간 입력 |
| Web | Components/Display/Effect Surface | 배포/컴포넌트/시각 효과/배경 시각 효과 |
| Web | Patterns/Environment Matrix | 배포/구성/환경별 비교 |
| Web | Patterns/Family drawer | 배포/구성/단계별 드로어 |
| Web | Patterns/Floating action button | 배포/구성/빠른 메모 작성 |
| Web | Components/Display/Folder Preview | 배포/컴포넌트/데이터 표시/폴더 미리보기 |
| Web | Components/Navigation/Gooey Navigation | 배포/컴포넌트/탐색/물방울 탐색 메뉴 |
| Web | Components/Display/Gravity Letters | 배포/컴포넌트/시각 효과/중력 글자 |
| Web | Components/Display/Grid Reveal | 배포/컴포넌트/시각 효과/격자 등장 효과 |
| Web | Patterns/Heading | 배포/컴포넌트/글자와 아이콘/제목 |
| Web | Components/Actions/Inline Confirm | 배포/컴포넌트/동작/버튼 안에서 확인 |
| Web | Patterns/Input sheet | 배포/구성/입력 시트 |
| Web | Experimental/Interaction Adapters | 실험/구성/드래그·스와이프·모션 |
| Web | Patterns/Landing | 배포/화면/랜딩 화면 |
| Web | Components/Display/Lucide Icon | 배포/컴포넌트/글자와 아이콘/루시드 아이콘 |
| Web | Components/Feedback/Notification Bell | 배포/컴포넌트/상태와 알림/알림 벨 |
| Web | Patterns/Notification settings | 배포/화면/알림 설정 |
| Web | Patterns/Onboarding | 배포/화면/온보딩 |
| Web | Components/Inputs/OtpField | 배포/컴포넌트/입력/인증번호 입력 |
| Web | Patterns/Popover | 배포/컴포넌트/오버레이/팝오버 |
| Web | Patterns/Profile studio | 배포/화면/프로필 편집 |
| Web | Patterns/Rating | 배포/컴포넌트/입력/별점 |
| Web | Components/Actions/Reaction Picker | 배포/컴포넌트/동작/반응 선택 |
| Web | Components/Feedback/Scroll Progress | 배포/컴포넌트/상태와 알림/읽기 진행 표시 |
| Web | Patterns/Search | 배포/화면/검색 |
| Web | Patterns/SidePanel | 배포/컴포넌트/오버레이/측면 패널 |
| Web | Patterns/Sidebar | 배포/컴포넌트/탐색/사이드바 |
| Web | Components/Navigation/Sidebar | 배포/컴포넌트/탐색/사이드바 전환 |
| Web | Patterns/Splitter | 배포/컴포넌트/레이아웃/분할 영역 조절 |
| Web | Components/Feedback/Step Player | 배포/컴포넌트/상태와 알림/단계별 진행 표시 |
| Web | Components/Inputs/Task List | 배포/컴포넌트/입력/할 일 목록 |
| Web | Patterns/TextFormat | 배포/컴포넌트/글자와 아이콘/글자 서식 |
| Web | Patterns/Time selection | 배포/구성/시간 선택 |
| Web | Patterns/ToggleGroup | 배포/컴포넌트/입력/토글 그룹 |
| Web | Patterns/Tour | 배포/컴포넌트/오버레이/사용 안내 둘러보기 |
| Web | Patterns/TransferList | 배포/컴포넌트/입력/목록 간 항목 이동 |
| Web | Patterns/Tree | 배포/컴포넌트/데이터 표시/트리 목록 |
| Web | Gallery/Visual foundations | 배포/구성/시각 효과 |
| Web | Components/Display/Voice Note | 배포/컴포넌트/데이터 표시/음성 메모 |
| Web | Patterns/Web additions | 배포/구성/웹 보조 기능 |
| Web | Patterns/WebNavigation | 배포/구성/웹 탐색 |

## 4. 이력(당시 기록, 규범 아님)

아래 절은 작성 당시의 경로·판단을 그대로 둔다. 지금 규칙은 §1이고, 경로는 §2.1이다.

### 2026-10-02 단계 분류 도입(옛 규칙 원문)

#### 배포와 실험, 같은 네 단계

2026-10-02 사용자가 기존 분류를 큰 개념의 단계로 정리하고 실험 승인 후 이동을
‘배포’라고 부르도록 요청했다. 패턴·갤러리라는 출처 중심 이름 대신 실제 예제의 역할을 기준으로
분류한다. 양쪽 메뉴 순서는 `토큰 → 컴포넌트 → 구성 → 화면`으로 동일하다.

| 단계 | 기준 | 배포 예시 |
| --- | --- | --- |
| 토큰 | 여러 UI가 공유하는 색·간격·글꼴·모션 값과 그 값의 편집 도구 | 색상, 타이포그래피, 간격, 크기, 둥글기, 모션, 화면 여백과 너비, 테두리, 그림자와 투명도, 겹침 순서, 테마 편집, 글꼴 편집 |
| 컴포넌트 | 하나의 역할을 수행하는 재사용 UI. 내부 요소 수보다 공개 역할로 판단 | 버튼, 입력창, 토스트, 내비게이션 바 |
| 구성 | 여러 컴포넌트의 조합·배치·짧은 사용자 흐름·환경 비교 | 입력 시트, 시간 선택, 토스트 배치, 내비게이션 바 비교 |
| 화면 | 페이지 전체의 목적과 상태를 제공하는 완성된 예시 | 검색, 온보딩, 알림 설정, 대시보드, 프로필 편집, 목업 편집 |

기존 버튼의 로딩 버그를 고친 예제는 신규 UI가 아니라 정규 컴포넌트의 상태 검증이다.
Web은 `배포/컴포넌트/동작/로딩 상태`의 버튼·소셜 로그인 버튼, Native는 각 버튼의
`로딩` 스토리에서 확인한다. 2026-10-02 사용자 요청으로 글자와 스피너를 함께 두던
표현을 제거했으며, 별도 로딩 컴포넌트를 복제하는 방식은 채택하지 않았다.

`배포/<단계>/<역할 또는 항목>`은 사용자가 승인했거나 기존 정규 분류에 있던 항목이다.
`실험/<단계>/<역할 또는 항목>`은 사용자 확인 전의 신규 항목이다. 비어 있는 단계에
자리 채우기용 스토리를 만들지 않고, 실제 항목이 생길 때 같은 순서로 표시한다.
2026-10-02 조사에서 추가한 `대표 항목과 묶음 전체 선택`은 범위 확인과 적용을 함께 다루므로
Web/Native 모두 `실험/구성/상호작용 예제`에 둔다. 새 공개 컴포넌트나 배포 항목은 아니다.
단계는 상속·의존 관계를 강제하지 않는다. 화면은 필요한 컴포넌트와 구성을 조합할 수 있다.

컴포넌트의 역할 하위 분류는 글자와 아이콘·레이아웃·동작·입력·탐색·데이터 표시·
상태와 알림·오버레이·시각 효과·기반 기능이다. 컴포넌트 개요·전체 목록·사용 안내는
컴포넌트 탐색을 돕는 문서 항목으로 같은 단계에 둔다. 모션이 있어도 수치는 데이터 표시,
아바타는 데이터 표시, 진행률은 상태와 알림으로 분류한다.

#### 신규 추가 → 실험 → 사용자 승인 → 배포

신규 컴포넌트·표현 옵션·구성·화면·편집 도구는 지원 표면의 `실험/<단계>/...`에 먼저 둔다.
개별 항목은 기본·어두운 테마·큰 글자와 실제 조작 예제를 제공한다.
같은 변경에서 단계에 맞는 [사용 지침](../packages/design-contracts/docs/usage/README.md)을 쓴다
(2026-10-06 사용자 요청, `pnpm usage:check`가 강제).
사용자의 명시적인 승인 후 해당 단계와 역할을 유지하며 `배포/<단계>/...`로 이동한다.
구현 요청·검사 통과·계속 진행·응답 없음은 승인이 아니다.

이 이동을 **스토리북 배포**라고 부른다. npm 패키지 게시, API 안정화, 소비 앱 반영,
운영 서비스 배포와는 각각 별도의 작업·승인·검증이다. 기존 항목의 버그·접근성 수정은
현재 위치에서 진행하며, 새로운 표현은 기존 배포 예제를 대체하기 전에 실험에서 검토한다.

승인 날짜·대상·최종 경로를 진행 문서에 기록하고 Web/Native 스토리·메뉴 순서·탐색 검사·
이 문서를 함께 갱신한다. 예: `실험/컴포넌트/탐색/새 탐색 UI` →
`배포/컴포넌트/탐색/새 탐색 UI`. 내비게이션 바는 승인에 따라 배포에 두고,
공통 동작과 상호작용 예제는 `실험/구성`에 유지한다.

표시 이름은 모든 단계·역할·개별 항목·상태·도구 모음까지 용도를 알 수 있는 한글로 쓴다.
공개 API와 export 이름, 키보드 Home/End, import 경로는 번역하지 않는다.
Web의 컴포넌트 역할별 참조 목록은 canonical 계약을, 상세 항목은 실제 조작을 제공한다.
Native는 지원 renderer를 개별 항목으로 제공한다.

### 2026-10-01 네비게이션 및 탐색 확장

배포/컴포넌트/탐색 아래 캡슐 네비게이션(BottomNavigation 변형), 글래스 네비게이션 바(NavigationBar)를 둡니다. 배포/화면/작품 탐색은 검색·필터·정렬·저장·상세의 화면 조합입니다. 모두 Web/Native에 Default·Dark·LargeText를 제공합니다.

### 표시 이름 검수 기준

2026-10-02 전수 검수에서 상위 분류만 한글이고 개별 이름·상태는 영어로 남아 있어 찾기 어려웠다.
이제 메뉴와 상태 이름은 용도를 먼저 설명한다. 기본 상태는 **기본 · 어두운 테마 · 큰 글자**이며
코드의 Default·Dark·LargeText 식별자는 유지한다. `피드백`은 **상태와 알림**으로 표시한다.
예: ThinkingOrb → 생각 중 표시, TransferList → 목록 간 항목 이동, AuthScreenLayout → 로그인 화면.
메뉴 이름에는 import 경로나 API 표기를 붙이지 않고, 컴포넌트 탐색의 보조 정보에 API 이름을 제공한다.

역할 검수 결과 수치·아바타·미디어는 데이터 표시, 값 변경은 입력, 화면 이동은 탐색,
로딩·결과·읽기 진행·알림은 상태와 알림, 장식·등장·내용 전환은 시각 효과에 유지한다.
화면 조합은 패턴, 비교 묶음은 갤러리, 토큰 편집은 디자인 기초에 둔다. 새 UI는 여전히 실험에서 승인받는다.

2026-10-02 레거시 제거 요청에 따라 프로필 편집의 중복 `Playground`는 양쪽에서 제거했다. 기존 웹 링크 `patterns-profile-studio--playground` 대신 `patterns-profile-studio--default`를 사용한다. 나머지 기존 예제 ID는 유지한다.

### 내비게이션 바 승인과 중복 정리

2026-10-02 사용자가 내비게이션 바만 배포 분류 이동하고 나머지 상호작용 예제는 실험에 유지하도록
명시적으로 승인했다. 최종 분류는 `배포/컴포넌트/탐색/내비게이션 바`이며 비교는
`배포/구성/내비게이션 바 비교`다. 이는 Storybook 분류 승인이고 API maturity나 패키지 게시 승인이 아니다.

10개 앱 표현은 동작 기준 4개 항목으로 합쳤다. 색상·아이콘·업종 차이는 각 항목의 표현 전환
버튼으로 확인한다. 공개 BottomNavigation API를 삭제하거나 제품의 선택 로직을 새로 만들지 않는다.

| 항목 | 함께 확인하는 표현 | Web 대표 ID |
| --- | --- | --- |
| 중앙에서 작업 실행 | 로봇 청소기·소셜·전자상거래·영상 | experimental-navigation-robot |
| 탐색 옆에서 작업 실행 | 주기 기록·에너지 | experimental-navigation-cycle |
| 선택한 목적지 이름 표시 | 자산 관리·쇼핑·전기차 | experimental-navigation-finance |
| 사각 영역으로 현재 위치 표시 | 프로젝트 관리 | experimental-navigation-project |

기존 캡슐 네비게이션은 옆 액션과 같은 조합이라 중복 등록·preview를 제거했다.
전체 비교에 반복되던 기본·floating·capsule·상단 바는 개별 canonical 항목에서 확인한다.
상단 바는 `검색·메뉴가 있는 상단 바`, 물방울 메뉴는 `선택 표시가 이어지는 탭`으로 표시해
역할이 먼저 보이게 한다. 기존 Web 대표 ID는 유지한다.

제거한 Web 링크는 robot(social/commerce/video), cycle(energy/캡슐 네비게이션),
finance(shop/car) 대표 ID의 `--default`로 이동한다. Native는 제목 기반 ID가 바뀌므로
새 `배포/컴포넌트/탐색/내비게이션 바` 메뉴에서 선택한다. Web 비교 ID는
`experimental-navigation-bars--default`를 그대로 유지한다.

참고는 Instagram `Dd9IBiPFmI_`의 10개 정적 앱 예시다. 기존 Lucide와 HJM를 합성하고
큰 글자에서는 읽을 수 있는 이름을 유지한다. 원제품 모션·제스처를 확인했다고 주장하지 않는다.

### 공통 동작 실험

2026-10-02 사용자가 공통 행동 체계 보강을 요청했다. `실험/구성/공통 동작` 아래 저장과 재시도,
즉시 반영과 복구, 보관과 실행 취소를 Web/Native에 기본·어두운 테마·큰 글자로 등록한다.
기존 Button·입력·상태 안내를 합성하며 새 버튼 컴포넌트로 중복 등록하지 않는다.
작업 상태의 소유권은 [공통 실행 계약](../packages/design-contracts/docs/action-session.md)을 따른다.

### 기능을 드러내는 상호작용 실험

2026-10-02 사용자가 추상적인 연동 이름 대신 실제 동작을 드러내고 예제를 늘리도록 요청했다.
기존 `상호작용 연동`은 `드래그·스와이프·모션`으로 이름을 바꾼다. 신규
`실험/구성/상호작용 예제`는 선택 후 적용·취소, 닫았다 열고 초안 이어쓰기, 늦은 응답보다 최신 검색
유지의 세 흐름이다. 모두 Web/Native 기본·어두운 테마·큰 글자로 제공한다.
기존 Sheet·Button·TextField 및 action-session을 합성하고 제품 영속 저장·서버 요청은 포함하지 않는다.
이 세 예제와 기존 공통 동작은 아직 분류 승인을 받지 않았다.

### 앱 토큰 문서 누락 보완

2026-10-02 앱 스토리북 캡처에서 테마·글꼴 편집만 노출되는 누락을 확인했다.
기존 토큰의 문서 보완이므로 배포/토큰에서 웹·앱에 같은 12개 항목을 제공한다.
간격·크기·둥글기·모션을 분리하고 크기에는 아이콘뿐 아니라 control의 높이·터치 영역도 포함한다.
폰트·줄 높이·자간·제목, 레이아웃·화면 폭, 테두리·그림자·투명도·겹침 순서까지
공개 foundations의 모든 값을 공용 목록과 검사로 대조한다. 새 디자인 토큰을 생성하거나
실험 UI를 승인한 변경은 아니다. Native 메뉴 생성·번들 전달과 실제 기기 화면 검증은 구분한다.

### STEA 후보 구성 배포 승인 (2026-10-02)

2026-10-02 사용자가 STEA Code 후보 검토로 만든 실험 7개를 "다 배포로 옮겨줘 맞는 곳들에"라고
명시적으로 승인했다. 모두 여러 컴포넌트의 조합과 짧은 흐름이므로 같은 단계(`구성`)를 유지해 옮겼다.
Web story id(`experimental-stea-*`)는 기존 링크 호환을 위해 보존하고, Native는 새 제목 기반 ID를 쓴다.
근거와 검증은 [STEA 도입 계획](plans/stea-code-adoption-2026-10-02.md)에 있다.
이는 Storybook 분류 승인이며 API 안정화·npm 게시·소비 앱 반영은 각각 따로 기록한다.

| 이전 | 최종 경로 | Web ID |
| --- | --- | --- |
| 실험/구성/진행 단계/처리 단계와 재시도 | 배포/구성/진행 단계/처리 단계와 재시도 | experimental-stea-order-progress |
| 실험/구성/인증/인증번호 확인과 다시 입력 | 배포/구성/인증/인증번호 확인과 다시 입력 | experimental-stea-otp-verify |
| 실험/구성/일정/날짜 선택과 예정 목록 | 배포/구성/일정/날짜 선택과 예정 목록 | experimental-stea-schedule-card |
| 실험/구성/데이터 요약/수치와 이전 대비 변화 | 배포/구성/데이터 요약/수치와 이전 대비 변화 | experimental-stea-stat-summary |
| 실험/구성/정보 카드/앞면과 상세 정보 전환 | 배포/구성/정보 카드/앞면과 상세 정보 전환 | experimental-stea-flip-card |
| 실험/구성/빈 상태/캐릭터와 시작 행동 | 배포/구성/빈 상태/캐릭터와 시작 행동 | experimental-stea-pixel-empty |
| 실험/구성/정보 카드/일정과 식별 정보 티켓 | 배포/구성/정보 카드/일정과 식별 정보 티켓 | experimental-stea-event-ticket |

### 연결된 작업 흐름 실험

2026-10-03 사용자가 UI 레퍼런스 분석 후 개발을 요청하여, 개별 UI 복제보다 실제 과제의
입력·저장·실패·복귀를 확인하는 아래 예제를 추가했다. Web/Native 동일 분류이며 각 항목은
기본·어두운 테마·큰 글자를 제공한다. 사용자 승인 전에는 배포로 이동하지 않는다.

- `실험/구성/시작하기/첫 작업을 만들고 이어하기`
- `실험/구성/검색/여러 조건 적용과 초기화`
- `실험/구성/설정/변경 저장과 이탈 확인`
- `실험/구성/확인/선택 내용 검토와 수정`
- `실험/화면/서비스 소개/제품 체험 중심`
- `실험/화면/서비스 소개/설명과 사례 중심`
- `실험/화면/표현 비교/같은 기록의 세 가지 구성`

근거와 재사용 경계: [레퍼런스 적용 설계](plans/reference-library-design-2026-10-03.md).

#### 용도별 입력 구성

2026-10-06 사용자 요청으로 `실험/구성/입력과 작성`에 검색 입력·댓글 작성·메시지 작성을 둔다. 기존 SearchField와 MessageComposer를 재사용하며 별도 입력 엔진이나 공개 API를 중복 추가하지 않는다. 기본·어두운 테마·큰 글자·처리 중 및 전송 실패 후 초안 복구를 비교한다. 실제 서버 전송과 사진 업로드는 제품에서 연결한다.

2026-10-06 실험→배포 승격 준비(중복 정리)에서 `실험/구성/공통 화면/메시지 작성`은 같은 MessageComposer를 보이던 중복이라
`실험/구성/입력과 작성/메시지 작성`(Web id `purpose-input-message`)으로 합쳤다. 고유 변형이던 여러 사진 전송은 `여러 사진 전송` 스토리로 옮겼다.
제거한 Web 링크 `common-screen-composer--*`는 `purpose-input-message--default`로 이동한다. Native는 새 메뉴에서 선택한다.
같은 정리에서 `공통 화면/대화 메시지`·`공통 화면/알림 항목`은 채팅·알림함 화면 전체를 그대로 다시 그리던 것을 말풍선·알림 행 단위 상호작용으로 좁혔다.
제목과 Web id(`common-screen-message`, `common-screen-notification-item`)는 유지하고, 화면 상태 스토리(불러오는 중·빈·오류·로그인 필요·실패와 초안 복구)는 화면 항목이 소유한다.

### 실험 정리와 합친 항목 (2026-10-06)

2026-10-06 사용자가 실험 항목을 정리해 배포하되 겹치는 항목은 "합친 뒤 승격"하도록 승인했다. 아래는 그 정리 단계의
`실험/화면`과 검색 관련 실험의 결과다. 제목은 아직 `실험/`이며 최종 이름은 별도 규격 작업이 정한다. 같은 미리보기
컴포넌트를 그리거나 같은 사용자 문제(검색 조건 적용, 검색 진행 표시)를 보이던 항목을 하나로 합쳤고, 살아남은 항목의
제목·Web id는 그대로 두었다. 없어진 항목의 고유 스토리는 살아남은 항목으로 옮겼다. Native는 제목 기반 ID라 새 메뉴에서 고른다.

| 없어진 항목 | 합친 곳 | 이유 | 옛 Web 링크 → 새 링크 |
| --- | --- | --- | --- |
| 실험/화면/기본 흐름/검색과 필터 | 실험/화면/공통 화면/검색 | 같은 `SearchDiscoveryPreview` | `screen-flow-discovery--<이름>` → `common-screen-search--<같은 이름>`(`recovery` 포함) |
| 실험/구성/검색/여러 조건 적용과 초기화 | 실험/화면/공통 화면/검색 | 검색 화면의 필터 시트(초안·적용·초기화·적용 조건 해제)와 같은 흐름. 단독 초안·적용 규칙은 `선택 후 적용·취소`가 보인다 | `reference-filters--default` → `common-screen-search--filter-sheet`, `--dark`·`--large-text`는 같은 이름 |
| 실험/화면/기본 흐름/프로필과 계정 | 실험/화면/공통 화면/프로필 | 같은 `AccountFlowPreview`(보기와 수정을 스토리로 구분) | `screen-flow-account--<이름>` → `common-screen-profile--<같은 이름>`(`recovery`·`edit`·`edit-dark`·`edit-large-text` 포함) |
| 실험/화면/서비스 소개/설명과 사례 중심 | 실험/화면/서비스 소개/제품 체험 중심 | 같은 소개 컴포넌트의 첫 구획 배치만 다름 | `reference-editorial--default`·`--dark`·`--large-text` → `reference-product--editorial`·`--editorial-dark`·`--editorial-large-text` |
| 실험/구성/입력과 작성/검색 입력 | 실험/구성/상호작용 예제/늦은 응답보다 최신 검색 유지 | SearchField 진행 표시만 보이던 예제. 검색 진행·실패·팔레트를 실제 검색 흐름에서 보인다 | `purpose-input-search--<이름>` → `experimental-interaction-search--<같은 이름>`(`pending`·`violet`·`green-dark`), `--default`·`--dark`·`--large-text`는 같은 이름 |

같은 정리에서 화면을 바꾸지 않던 스토리를 지웠다. `common-screen-login--empty`·`--restricted`·`--recovery` →
`common-screen-login--default`(로그인 실패는 `--error`), `common-screen-settings--empty`·`--recovery` → `--default`,
`common-screen-shell--recovery` → `--error`. 로그인의 `--loading`은 제공자 로그인 진행 중(`pendingLabel`)으로 바뀌었다.

판단을 남긴 겹침:

- `실험/컴포넌트/입력/카테고리 필터`는 배포 `버튼형 선택`(SegmentedControl)의 `presentation="pills"` 표현이라 별도 공개 API가 아니다.
  위 "신규 표현은 실험에서 검토" 규칙에 따라 정리 단계에서는 배포 항목에 넣지 않고 실험 항목으로 둔다. 승격 때 별도 항목 대신
  `버튼형 선택`의 스토리(`카테고리 필터`)로 옮기기를 제안한다. 옮기면 `category-filter--*` 링크를 그 스토리로 안내한다.
- `공통 화면`과 `기본 흐름`의 나머지 항목은 서로 다른 공개 화면 API(ListDetailScreen·EditorScreen·ModerationScreen·PermissionScreen·
  OnboardingScreen·MediaSelectionScreen·SavedItemsScreen 등)를 보여 유지했다. `표현 비교`는 같은 데이터의 밀도 비교라 서비스 소개와 겹치지 않는다.
- 배포 항목과의 겹침은 실험 쪽만 정리했다. `공통 화면/검색`↔`배포/화면/검색`, `기본 흐름/온보딩`↔`배포/화면/온보딩`,
  `서비스 소개`↔`배포/화면/랜딩 화면`, `공통 화면/프로필`의 프로필 수정↔`배포/화면/프로필 편집`은 실험 쪽이 공개 화면 API를 쓰고
  배포 쪽은 조합 예제다. 배포 예제를 대체할지는 승격 때 사용자가 정한다.
