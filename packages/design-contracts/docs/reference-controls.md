# 이미지 비교와 별점 계약

검토일: 2026-10-06 · 상태: 실험 · 변경 계기: 11개 UI 레퍼런스 조사에서 HJM의 전용 대응이 없는 두 기능을 확인했고 사용자가 적용을 요청했다.

`reference-controls`는 기존 Image와 Slider가 제공하지 않는 **동일 좌표 이미지 비교**의 조합과,
일반 RadioGroup이 구분하지 않는 **미평가·정수 입력·소수 평균**을 정의한다. canonical catalog는
늘리지 않으며 두 renderer의 `/image-comparison`, `/rating`에서만 제공한다. root export와 새 peer는 없다.

## Rating

- `label`, `value`, `getValueLabel`을 제품이 전달한다. `value`는 controlled이며 자동 저장하지 않는다.
- `null`은 미평가. 입력은 1~max의 정수, `readOnly` 평균은 0~max의 소수를 허용한다.
- `max` 기본 5, 범위 1~10. 무한한 별 행은 점수 척도가 아니라 목록이 되므로 거부한다.
- 입력형은 `onValueChange` 필수. `clearLabel`이 있으면 명시적으로 null로 지운다.
- Web은 실제 radio와 name으로 키보드/폼 제출을 사용한다. Native는 radio role과 checked/disabled
  상태를 제공한다. 읽기 전용은 하나의 이름 있는 이미지이며 입력처럼 초점을 받지 않는다.
- 별은 값의 장식이고 현지화된 값 텍스트가 의미를 전달한다. 외부 SVG·폰트·아이콘 패키지를 추가하지 않았다.
- Web은 기존 styles.css가 필요하다. 큰 글자에서는 별 행을 감아 배치한다.

## ImageComparison

- `before`, `after`는 `{src,width,height,label}`이고 같은 aspect ratio가 필요하다. 자동 crop·늘이기는
  비교 좌표를 바꾸므로 거부한다. 기본 Image가 로딩 오류의 이름과 fallback을 소유한다.
- controlled `value`는 0~100이며 **왼쪽에 보이는 before의 비율**이다. 0이면 after 전체, 100이면 before 전체.
  이미지는 RTL에서도 물리 좌표를 유지하고 문구는 제품 방향을 따른다.
- `label`, `getValueText`, `onValueChange`를 전달한다. Native에는 `decrementLabel`·`incrementLabel`도 필수다.
- 구분선은 장식이며 드래그 핸들이 아니다. 아래의 기존 Slider로 드래그·키보드·Native adjustable
  action을 제공한다. 독자 PanResponder를 만들지 않아 세로 스크롤 판정을 Slider와 공유한다.
- Native는 프레임 폭을 측정하고 두 이미지 모두 전체 폭으로 렌더링한 후 before를 잘라 표시한다.
- 서버 업로드·이미지 처리·원본 저장·기록 권한은 제품 소유다. 서로 다른 시점/대상을 비교한다고
  자동으로 변화율이나 품질 점수를 계산하지 않는다.

## 참조와 검증 경계

[조사](../../../docs/plans/ui-reference-full-audit-2026-10-06.md)의 Motion Image Comparison과
Component Gallery Rating에서 사용자 문제를 확인했다. 원본 코드를 복사하지 않고 HJM Image/Slider,
semantic token, 플랫폼 입력 의미로 구현했다. Native 호스트 검사는 iOS/Android 실기기 증거가 아니다.
