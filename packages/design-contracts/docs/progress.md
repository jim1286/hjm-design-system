# Progress contract

## circular shape (2026-09-18)

같은 값을 원으로 그리는 변형을 `shape: "linear" | "circular"`로 추가했다.

**왜 새 컴포넌트가 아닌가.** 의미가 완전히 같다 — min/max/now, 값 없는 진행,
발표 문구, tone이 전부 공유된다. 따로 만들면 "어느 쪽이 접근성 계약을 갖는가"가 둘로
갈리고, 한쪽만 고쳐지는 날이 온다. Diairy가 `ProgressRing`을 직접 만든 자리이고, 그때
필요했던 값이 지름과 획 두께 둘이라 `circular.sizes`·`circular.strokeWidth`만 더했다.

**Web**은 conic-gradient + mask로 그리고 `<progress>` 요소는 그대로 둔다 — 값과 발표는
변하지 않고 칠하는 방식만 다르다. 링은 `aria-hidden`이다.

**Native**는 conic gradient가 없어 회전한 반링으로 그린다. 그림을 위해 의존성을 들이지
않는다 — 값은 wrapper가 발표하므로 이 도형은 장식이다.

## max 기본값 통일 (2026-10-02)

`max`를 생략하면 두 renderer 모두 `progressRecipe.defaults.max`(100)를 쓴다. 그 전에는 Web 100,
Native 1이라 같은 `value={76}`이 Web에서는 76%, Native에서는 RangeError였다(STEA 후보 검토의
수치 요약 구성을 Native 시뮬레이터에서 띄우다 발견). 100을 고른 이유는 Web 기존 동작과 문서 예제가
백분율이기 때문이다. Progress에 0–1 비율을 직접 넘길 때는 `max={1}`을 쓰거나
백분율로 바꿔 넘긴다. Native 기본값이 바뀌는 호환 파괴 변경이지만, 1.11.0과 같이 사용자가 관리 소비 앱 전수 이관을 결정해 1.12.0 minor에 싣고 이관표에 기록했다.

## 값의 단위와 합성 경계

2026-10-03 리포트 대조에서 직접 Progress 호출과 UploadItem descriptor의 단위가 다름을
재확인했다. 숫자만 일괄 치환하면 정상적인 업로드 상태까지 깨지므로, 호출 경계에서 단위를
선택한다. 근거와 검증 범위는 [당일 반영 기록](../../../docs/plans/daily-design-research-2026-10-03.md)에 있다.

| 입력 경계 | 64%를 나타내는 입력 | 처리 |
| --- | --- | --- |
| Progress에 백분율 직접 전달 | `<Progress label="업로드 진행" value={64} />` | 생략한 max는 Web/Native 모두 100 |
| Progress에 0–1 비율 직접 전달 | `<Progress label="업로드 진행" value={0.64} max={1} />` | value와 max를 같은 단위로 전달 |
| UploadItem descriptor | `state: { status: "uploading", progress: 0.64 }` | 두 renderer가 내부 Progress에 64로 변환해 전달 |
| 진행량을 모르는 Progress | value 생략 | 측정한 백분율로 표시하지 않음 |
| 진행량을 모르는 UploadItem | `state: { status: "uploading", progress: null }` | 불확정 진행으로 표시 |

`<Progress value={0.64} />`는 기본 max에서 **0.64%**다. [[upload-item]]의 `progress`는
계속 0–1 계약이므로 64로 바꾸거나, 제품에서 먼저 100을 곱해 descriptor에 넣지 않는다.
이 단위는 선형·원형 표현 모두에 적용된다.
