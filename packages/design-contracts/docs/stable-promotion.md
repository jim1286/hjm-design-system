# stable 승격 절차

2026-09-18 기준 `stable`은 네 개다: Surface, Button, Field, TextArea. 나머지 90여 개
Web renderer는 `beta`이고, 그 뜻은 **"renderer는 있고 제품 실측은 없다"**이다. 커버리지
감사가 "컴포넌트 수가 아니라 이 숫자가 배포 준비를 막는다"고 지적한 자리다.

이 문서는 그 숫자를 움직이는 **조건과 순서**만 정한다. 승격 자체는 증거가 모인 뒤에 한다.

## 왜 자동으로 올리지 않는가

`beta → stable`은 "이 API를 바꾸지 않겠다"는 약속이다. 테스트가 초록이라는 것은 우리가
작성한 시나리오를 통과했다는 뜻이지, 실제 사용자가 그 화면을 통과했다는 뜻이 아니다.
정적 검사로 승격하면 그 약속의 근거가 우리 자신의 테스트뿐이게 된다.

## 승격 조건 (네 가지 전부)

1. **제품 채택** — 등록된 제품 최소 한 곳의 실제 화면에서 쓰이고, 그 화면이 배포돼 있다.
   Showcase 사용은 채택이 아니다.
2. **우회 없음** — 그 제품이 이 컴포넌트를 `.hjm-*` CSS로 덮거나 recipe 값을 다시 읽어
   인라인 style로 싣고 있지 않다. 우회가 있으면 그것이 곧 API 공백이고, 공백이 있는 API를
   고정하면 안 된다.
3. **보조기기 실측** — 해당 표면에서 한 번 이상 실제 확인. Web은 화면 리더 1종 + 키보드
   전용 통과, Native는 VoiceOver 또는 TalkBack 통과. 기록은 제품 저장소에 남긴다.
4. **환경 4종** — dark, RTL, 2배 글자, reduced motion에서 그 **제품 화면**이 깨지지 않는다.
   (renderer evidence의 시나리오와 별개다. 그쪽은 우리 스토리, 이쪽은 실제 화면이다.)

## 첫 후보 (다음 minor 게시 이후)

BurnTok·Diairy가 실제로 소비 중이고 우회가 남아 있지 않은 것부터 본다.

| 후보 | 채택처 | 남은 확인 |
| --- | --- | --- |
| ListRow | BurnTok, Diairy, Taground | 우회 제거 후 재확인, 보조기기 |
| Dialog | BurnTok(AppModal) | `onDismissComplete` 소비 후 0ms 타이머 제거 |
| Sheet | BurnTok(AppSheet) | 같음 |
| Toast | BurnTok | DS-01 우회 제거 |
| Notice | Diairy | DS-11 우회 제거 |
| Tabs | BurnTok | compact 우회가 제품 선택인지 API 공백인지 판정 |
| TextField | BurnTok, Diairy | 설명·오류 동시 표시 변경 반영 확인 |
| Select · Checkbox · Switch | 3개 제품 | 보조기기 |

**순서**: minor 게시 → 소비 앱 dependency·lock 갱신 → 우회 제거 → 보조기기·환경 확인 →
증거를 제품 저장소에 기록 → 이 표를 근거로 승격 PR.

## 승격하지 않는 것

- 제품이 아직 쓰지 않는 컴포넌트(이번에 추가한 Sidebar·TagsInput·Agreement 등). renderer가
  있다는 것과 안심하고 쓸 수 있다는 것은 다른 말이다.
- Native가 `planned`인 채로 Web만 성숙한 항목의 **contract status**. `status`는 계약
  성숙도이고 표면별 성숙도는 `surfaceStatus`가 따로 갖는다 — 한쪽 표면만으로 계약을
  stable로 올리면 다른 표면이 조용히 약속에 포함된다.
