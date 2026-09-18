# 전역 density 축

**문제.** 같은 화면의 목록·메뉴·표가 각각 다른 밀도로 그려졌다. `ListRow density`,
`Menu density`, `DataTable density`가 서로를 모르는 값이라 제품이 세 군데를 따로 맞췄다.

**해결.** Provider에 `density` 축을 하나 둔다(`"comfortable" | "compact"`, 기본
`comfortable`). 그 아래의 목록·메뉴·표가 **기본값으로** 이 값을 읽는다.

**컴포넌트의 명시적 prop이 언제나 이긴다.** 전역값은 기본이지 강제가 아니다. 한 화면
안에서 "표만 빽빽하게"가 필요한 경우가 실제로 있고, 그때 전역 축을 끄러 Provider까지
올라가야 한다면 축이 없느니만 못하다.

**어휘를 하나로 통일하지 않았다.** 목록의 `relaxed`와 표의 `regular`는 같은 말이 아니다.
억지로 합치면 둘 중 하나가 거짓말을 한다. 대신 `resolveDensityDefault(density, {
comfortable, compact })`가 전역 축을 각 컴포넌트의 어휘로 옮긴다 — 매핑이 한 곳에 있다.

**OS 신호가 없다.** 밀도는 "같은 화면에 얼마나 담을 것인가"라는 제품의 입장이지 사용자
설정이 아니다. 그래서 `systemDensity` 같은 짝을 두지 않았다. 반대로 큰 글자는 사용자
설정이므로, `textScale`이 큰 상태에서 `compact`를 켜는 것은 제품이 스스로 막아야 한다 —
계약이 대신 꺼 주면 제품이 그 충돌을 영영 모른다.

**Provider 밖에서는 각 recipe의 기본값이 그대로 선다.** 전역 축이 "감싸지 않은 렌더러"를
다르게 만들면 축 자체가 숨은 의존이 된다.
