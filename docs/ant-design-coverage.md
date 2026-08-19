# Ant Design Coverage Benchmark

HJM은 Ant Design을 런타임 의존성이나 호환 API로 사용하지 않습니다. 넓은 컴포넌트 범위를
놓치지 않기 위한 **reference inventory**로만 사용하며, 각 문제를 HJM의 플랫폼 중립 의미,
접근성 계약, Web/Native renderer 경계로 다시 번역합니다.

## 고정 기준

- source: [Ant Design Components Overview](https://ant.design/components/overview/)
- captured: 2026-08-16
- version: 6.6.0
- core scope: 73 entries
- category counts: General 4, Layout 7, Navigation 7, Data Entry 18,
  Data Display 21, Feedback 11, Other 5

별도 패키지인 Pro Components는 core 73개에 포함하지 않습니다. 이후 page pattern benchmark로
추가하더라도 별도의 inventory로 관리합니다.

## 기계 판독 가능한 crosswalk

`src/component-references.ts`의 `antDesignReferenceComponents`가 73개 source entry와 rename에
영향받지 않는 HJM canonical `ComponentId` target을 연결합니다.

- `direct`: 같은 사용자 문제를 거의 같은 component boundary로 해결
- `adapted`: 같은 문제를 HJM의 명명·플랫폼 의미로 번역
- `decomposed`: 하나의 Web-first component를 여러 HJM 계약으로 분리

예를 들어 Ant Design `Input`은 `Field`, `SearchField`, `TextArea`, planned `PasswordField`,
`OtpField`로 분해하고, `Drawer`는 adaptive `Sheet`와 Web `SidePanel`로 분해합니다. `Message`와 `Notification`은 **둘 다** HJM `Toast`로,
`Spin`은 `Spinner`, `Table`은 `DataTable`로 연결합니다.

`Notification`이 별도 target을 갖지 않는 이유는 `docs/notification.md`에 있습니다 — antd가
message와 notification을 가르는 축(정보 층, 지속 시간, 동시 개수, 위치, 긴급도)이 전부
이미 Toast의 **설정 값**이라, 새 상태 축도 새 접근성 개념도 생기지 않았습니다. 그래서
`Toast`의 alias로 흡수하고 catalog 행을 따로 두지 않습니다. 그 문서에는 이 판정이 뒤집힐
조건(화면 밖 push, 별도 알림함 이력처럼 Toast로 표현할 수 없는 요구)도 함께 적혀 있습니다.

`Dropdown`도 같은 판정으로 `Menu`에 흡수했습니다(`docs/dropdown.md`). antd는 Dropdown을
"트리거에 붙는 오버레이", Menu를 "그 안의 항목 목록"으로 가르지만 HJM `Menu`는 트리거·표면·
항목을 **모두 소유**합니다. "임의 콘텐츠를 담는 표면"으로 재해석하는 길도 검토했으나 그
문제는 `Popover`가 이미 점유하고 있어, 측정된 수요 없이 겹치는 두 표면을 만들지 않았습니다.

여러 source entry가 한 target을 가리키는 것은 허용됩니다 — 73개 추적은 **antd의 범위를
빠짐없이 보는 것**이 목적이지 1:1 대응을 만드는 것이 아닙니다. 반대로 **HJM에 새 컴포넌트를
만들지 않기로 한 판정도 산출물**입니다. 그 이유와 **판정이 뒤집힐 조건**을 문서로 남기면,
다음 사람이 같은 질문을 처음부터 다시 하지 않습니다. 이는 import나 prop 호환성을 의미하지 않습니다.

### 「만들지 않는다」에는 네 종류가 있다

판정 문서가 늘어나면서, 같은 결론이 서로 다른 이유에서 나온다는 것이 드러났습니다. 결론이
같아도 **다음 사람이 재검토할 조건이 다르므로** 문서에서 구별합니다.

| 종류 | 뜻 | 예 | 재검토 신호 |
|---|---|---|---|
| **흡수됨** | 그 문제를 이미 다른 컴포넌트가 완결한다 | `Notification`→Toast, `Dropdown`→Menu, `ContextPanel`→SidePanel/Sheet, `Flex`→Stack, `TimePicker`→Select 조합, `Rating`→Slider/Statistic | 흡수한 쪽이 못 푸는 요구가 나올 때 |
| **검증할 화면이 없음** | 계약 자체는 유효하나 이를 확인할 제품 화면이 없다 | `Anchor`, `Calendar`·`DatePicker`(계약은 있으나 승격 근거 없음) | 그 화면이 실제로 생길 때 |
| **거절됨** | 계약도 유효하고 화면이 생겨도 만들지 않는다 | `BorderBeam`(장식), `AppProvider`(런타임뿐), `Utility`(실체 없음) | 정체성이나 아키텍처 경계가 바뀔 때만 |
| **흡수 대기** | 흡수 판정은 끝났으나 **선결 축이 아직 없다** | `Cascader`(TreeSelect에 `valueMode`/`commitAt`가 추가돼야 성립) | 그 축이 실제로 추가될 때 |

둘을 섞으면 안 됩니다. **흡수됨**은 설계 판단이라 제품이 늘어나도 웬만해선 뒤집히지 않지만,
**검증할 화면이 없음**은 사실 관찰이라 **커밋 하나로 낡습니다**. 실제로 그런 일이 있었습니다
(`docs/expansion-roadmap.md`의 「vertical slice가 없는 계약」).

**거절됨**은 넷 중 가장 안정적입니다 — 제품이 아무리 늘어나도 뒤집히지 않고, 정체성이나 계층 경계가 바뀔 때만 재검토합니다.

catalog 행 처리도 여기서 갈립니다. **흡수됨**은 행을 지우고 흡수한 쪽에 `aliases`로 이름을
남깁니다 — 남겨 두면 "아직 만들 계획"으로 잘못 읽힙니다. **검증할 화면이 없음**은 행을
그대로 둡니다. 계약은 유효하고 언젠가 채워질 자리이기 때문입니다. **거절됨**은 행을 지울 수 없습니다 — crosswalk의 `targets`가 가리키고 있고 흡수할 다른 이름이 없기 때문입니다. 대신 `ComponentCatalogEntry.declinedReason`에 사유를 적습니다.

**흡수됨은 다시 두 갈래입니다.** 흡수한 대상이 **정확히 하나**면(`Notification`→Toast,
`Dropdown`→Menu, `Flex`·`Space`→Stack) 행을 지우고 그 하나에 `aliases`로 이름을 남깁니다.
대상이 **둘 이상의 조합**이면(`TimePicker`→Select 둘, `Rating`→Slider/Statistic,
`ConfirmPopover`→Popover/AlertDialog) alias를 걸 단일 이름이 없으므로 **행을 그대로 둡니다.**
이 저장소는 이 답을 세 번 반복해서 냈고, 우연이 아니라 규칙입니다.

**흡수 대기**는 행과 crosswalk를 **둘 다 건드리지 않습니다.** 흡수를 지금 적용하면 아직 만들지
않은 해결책을 완료로 표시하게 됩니다 — `planned`이 거짓말하던 문제와 방향만 반대인 같은 문제입니다.
결과는 「검증할 화면이 없음」과 같지만 재검토 신호가 다릅니다: 제품 화면이 아니라 **엔지니어링
선행 조건**이 신호입니다. `status`는 구현 성숙도 축이고 "만들 것인가"는 다른 질문이라 상태값을 늘리지 않고 직교 필드를 두었습니다 — 그 결정의 영향 범위 비교는 `docs/catalog-decision-status.md`에 있습니다.

## 범위와 구현을 분리한다

crosswalk의 target이 catalog에 존재하면 `tracked`입니다. renderer가 있는지는 별도의
`stable | beta | planned`와 Showcase evidence로 판단합니다.

- fully previewable: 모든 target이 stable 또는 beta
- partial renderer: decomposed target 중 일부만 stable 또는 beta
- contract only: 모든 target이 planned

따라서 73/73 tracking은 73개 구현 완료를 의미하지 않습니다. 홈과 Component Explorer는 이
수치를 분리해 표시합니다.

## lifecycle

Ant Design 6.6.0은 기존 `List`를 deprecated로 표시하고 `Listy`를 successor로 추가했습니다.
reference inventory는 `List.lifecycle = deprecated`, `Listy.lifecycle = new`로 보존하지만 HJM
`List`를 자동으로 deprecated 처리하지 않습니다. HJM은 기존 비가상 `List`와 planned
`VirtualList`를 서로 다른 사용 문제로 유지합니다.

## 업데이트 규칙

Ant Design 기준 버전을 올릴 때는 다음을 한 변경 세트에서 수행합니다.

1. 공식 Overview의 version과 category counts 확인
2. source name 중복과 총합 테스트 갱신
3. 새 source entry를 canonical HJM target에 연결
4. 제거·deprecated·new lifecycle 기록
5. `pnpm check`와 `pnpm showcase:web:build`로 public export와 정적 문서 검증

외부 시스템의 외형, token 값, prop 이름, 전용 아이콘·자산은 복사하지 않습니다.
