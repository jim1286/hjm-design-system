# 컴포넌트 저작 브리프 — planned → 계약·recipe·행동 완성

이 문서는 planned 컴포넌트를 구현 가능한 상태로 끌어올리는 저작자(에이전트)의 작업
계약이다. 사람이 유지보수하는 문서이기도 하므로, 규칙의 이유를 함께 적는다.

## 먼저 통독할 것 (순서대로)

1. `docs/identity.md` — 이 시스템의 문장("조용한 화면 위에 중요한 순간만 선명하게")
2. `docs/architecture.md` — 층 구조와 경계
3. `docs/expansion-roadmap.md` — **공통 상태 축, Collection 기본 계약, maturity gate.**
   특히 「무엇을 흡수하는가」 표 — 외부 시스템에서 무엇을 가져오고 무엇을 가져오지
   않는지가 이 저장소의 헌법이다.
4. `docs/ant-design-coverage.md` — antd는 **reference inventory**일 뿐이다. 외형, token
   값, prop 이름, 전용 자산을 복사하지 않는다. 같은 사용자 문제를 HJM의 의미로 다시
   푼다.
5. 본보기 모듈 **둘**: `src/statistic.ts`(+`test/statistic.test.ts`, `docs/statistic.md`) —
   표현 계약의 본보기. `src/load-more.ts` — 행동 계약(컨트롤러)의 본보기.

## 산출물 — 컴포넌트당 세 파일

| 파일 | 내용 |
|---|---|
| `src/<name>.ts` | 계약 전부: descriptor 타입, defaults, validator, resolver, 시각 recipe 토큰, 행동 시나리오. **한 모듈에 자급자족**으로 담는다 |
| `test/<name>.test.ts` | vitest. validator가 거부해야 할 입력, resolver의 경계 입력, 시나리오 불변식 |
| `docs/<name>.md` | 로드맵이 정한 기록 형식: **문제 → 일반화한 계약 → HJM 기본값 → 플랫폼 번역 → 검증 화면** |

### 왜 recipe·행동을 공용 레지스트리에 직접 쓰지 않는가

`component-recipes.ts`, `behaviors.ts`, `catalog.ts`, `recipes.ts`, `index.ts`는 모든
컴포넌트가 지나는 **공유 파일**이다. 여러 저작자가 병렬로 이 파일들을 고치면 서로의
작업을 덮어쓴다. 그래서:

- 저작자는 **자기 모듈 파일 안에** recipe와 행동까지 export한다.
- 보고서에 **배선 명세**를 적는다 — catalog 한 줄(카테고리·platform·recipe 키·behavior
  키), `index.ts`에 내보낼 심볼 목록, 공용 레지스트리로 옮길 것이 있으면 그 목록.
- 배선은 리드가 순차로 적용한다.

이 방식이면 저작자의 `pnpm check`는 자기 파일만으로 통과하고(아무도 아직 그 모듈을
참조하지 않으므로), 충돌이 구조적으로 불가능하다.

## 계약이 지켜야 할 것

- **상태 축은 로드맵의 표에서 고른다.** 필요한 축만 공개한다 — Link가 disabled를
  지원하지 않는 것처럼, 지원하지 않기로 한 축은 문서에 이유와 함께 적는다.
- **collection이 있으면 Collection 기본 계약을 따른다** — stable string `id`, `label`과
  `textValue`, `none|single|multiple`, `idle|loading|loadingMore|empty|error`.
  새 데이터 모델을 만들지 않는다.
- **제품이 포맷한 문자열을 받는다.** 숫자·날짜·단위 포맷은 제품 소유다(Statistic 참고).
- **validator는 던진다.** 빈 label, 중복 id, 성립하지 않는 조합은 조용히 넘기지 않고
  `TypeError`/`RangeError`로 거부한다. 그리고 **그 validator가 잘못 잡는 입력으로 먼저
  시험한다** — 허락해야 할 것까지 막으면 잘못 만든 것이다.
- **접근성은 계약의 일부다.** 각 상태가 Web keyboard/aria와 RN accessibilityState로
  어떻게 번역되는지 모듈이 명시한다. 색으로만 말하는 상태를 만들지 않는다.
- **런타임 의존성 금지.** 이 패키지는 React도 RN도 import하지 않는다. 타입과 순수
  함수만 있다. renderer는 제품(BurnTok Web, Yajalal RN)이 소유한다.

## maturity에 대해

당신의 산출물로 컴포넌트는 **"계약+recipe 준비됨"**이 된다. catalog의 `planned → beta`
승격은 실제 제품 vertical slice 검증 후 리드가 한다 — 로드맵의 gate가 그렇게 정했고,
시각 recipe만으로 구현 완료를 주장하지 않는 것이 이 저장소의 원칙이다.

## 게이트

```bash
cd /Users/jimin/Desktop/hjm-design-system
pnpm typecheck && pnpm test
```

`pnpm build`는 dist를 다시 쓰므로 저작자는 돌리지 않는다(dist는 리드가 배선 후 한 번에).
**기존 파일을 수정하지 않는다** — 이 저장소에는 커밋되지 않은 진행 중 변경이 있다.
당신이 만드는 세 파일 외에는 읽기 전용이다.

## 보고 형식

```
## <컴포넌트>
- 문제: <이 컴포넌트가 푸는 사용자 문제 한 문장>
- antd 대응: <source entry와 relationship — crosswalk와 일치해야 한다>
- 공개한 상태 축: <축과 값. 지원하지 않기로 한 축과 이유>
- 배선 명세:
  - catalog: { name, category, platform, recipe: "<키>", behavior: "<키>" | 없음 }
  - index 내보낼 심볼: <목록>
  - 공용 레지스트리 이동 대상: <있으면>
- 판단이 갈렸던 자리: <대안과 택한 이유>
- 게이트: typecheck <결과> / test <N passed>
```
