# 영상 미리보기

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.13.1 이후)
- 검토일: 2026-10-07
- 근거: `showcase/web/src/patterns/video-dialog-preview.tsx`, `showcase/native/src/video-dialog-preview.tsx`
- 스토리북: `실험/구성/정보 표시/영상 미리보기`

## 언제 쓰나

현재 입력을 유지하면서 짧은 영상 설명을 확인할 때 쓴다. HJM Dialog가 모달·닫기·초점 복귀를
소유하고 제품이 플레이어·자막·미디어 권한·재시도를 공급한다. 전체 화면 감상과 재생 목록은
제품의 전용 미디어 화면을 사용한다. 기존 Dialog.children으로 충분하므로 새 wrapper를 만들지 않는다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Dialog | 제목·닫기·모달 접근성·초점 복귀 | [대화상자](../components/dialog.md) |
| Button | 미리보기·재생·재시도 | [버튼](../components/button.md) |
| TextField | 바깥 초안 보존 | [텍스트 필드](../components/field.md) |
| 제품 영상 호스트 | 디코딩·재생·미디어 해제 | Web video / Native Expo Video 예시 |

## 배치

```text
바깥: [영상 메모] [영상 미리보기]
Dialog: [제목                   닫기]
        [설명]
        [16:9 플레이어 + 미디어 컨트롤]
        [동등한 내용의 텍스트 설명]
        [재생/일시 정지 또는 다시 시도]
        [실제 재생 상태]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 모달 아래의 원래 화면 | gap lg=20px |
| 모달 | Dialog | 공통 overlay 위치 | size large, renderer recipe를 그대로 사용 |
| 영상 | 제품 Player | 제목·설명 아래 본문 | 폭 100%, aspectRatio 16/9 |
| 설명·복구 | Text / Button | 플레이어 아래 | Stack gap md=16px, 긴 문구는 줄바꿈 |

## 흐름과 상태

1. 제품이 open과 입력 초안을 소유한다. 닫기 후 초안을 지우지 않는다.
2. open일 때만 플레이어를 mount한다. 자동 재생하지 않고 사용자 행동으로 시작한다.
3. 브라우저/Native 미디어 이벤트에서 재생·정지·실패를 읽는다. 요청 성공으로 재생을 추정하지 않는다.
4. 실패 시 설명과 재시도를 유지한다. 재시도는 정상 source로 호스트를 새로 만들며 Web은 재생 버튼으로 초점을 옮긴다.
5. open=false 즉시 호스트를 unmount한다. 모달 퇴장 애니메이션이 끝날 때까지 기다리지 않는다.
6. Web은 pause 후 src를 제거하고 load하여 자원을 해제한다. Native useVideoPlayer는 unmount 시 player를 release한다.
7. 앱/문서가 비활성화되면 일시 정지한다. 복귀 시 자동 재생하지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 열기 전 플레이어 없음, 메모 유지 | 열기 버튼 |
| 진행 중 | 실제 이벤트에 따른 일시 정지와 상태 | 재생 상태 알림 |
| 실패 | 설명·다시 시도, 원래 메모 유지 | 오류 알림, Web 재시도 후 재생 버튼 |
| 호스트 없음 | Native 지원 모듈 누락 안내, 닫기 가능 | 제목과 안내 |
| 닫힘 | 영상 호스트 제거 | 열기 버튼으로 초점 복귀 |

## 코드 골격

```tsx
// Web
import { Dialog } from "@hjmds/react/overlays";
<Dialog open={open} onOpenChange={setOpen} title={title} description={description}
  closeLabel={closeLabel} size="large" returnFocusRef={triggerRef}>
  {open ? <ProductPlayer source={source} /> : null}
</Dialog>
```

```tsx
// Native
import { Dialog } from "@hjmds/react-native/overlays";
<Dialog open={open} onOpenChange={setOpen} title={title} closeLabel={closeLabel}
  size="large" returnFocusRef={triggerRef}>
  {open ? <ProductPlayer source={source} /> : null}
</Dialog>
```

ProductPlayer는 제품 소유 코드의 자리이며 HJM export가 아니다. Showcase를 앱에서 import하지 않는다.
제품은 미디어 자산·번역 문구·자막/대본·재생 권한을 공급한다. 무음 테스트 패턴 설명은 실제 영상 자막 검증을 대신하지 않는다.

## 플랫폼 차이

Web은 HTML video controls와 playsInline을 사용한다. Native 예제는 Expo SDK 57의 expo-video
호스트를 선택하며 설치된 앱에 모듈이 없으면 명시적으로 안내한다. Native fullscreen/PiP는 이 짧은
모달 미리보기에서 사용하지 않는다. 제품이 다른 플레이어를 사용해도 Dialog 계약을 유지하며
닫기·백그라운드·실패·초점 복귀를 실제 호스트에서 검증한다.

| 항목 | Web | Native |
| --- | --- | --- |
| 호스트 | HTML video | 제품 제공 player, Showcase는 Expo Video |
| 정리 | pause·src 제거·load | hook 소유 player 해제 |
| 지원 누락 | 미디어 오류와 재시도 | 모듈 누락 안내 |
| 설명 | 화면의 동등한 텍스트 | 화면의 동등한 텍스트 |
