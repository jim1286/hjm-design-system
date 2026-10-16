# ShortcutRecorder

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [편집 도구 계약](../../authoring-tools.md), `src/authoring-tools.ts`의 `resolveShortcutCapture`·`normalizeShortcut`, Web `src/authoring-tools.tsx`. Native `src/authoring-tools.tsx`는 이식 가능한 브라우저 키보드 등록면이 없어 제공하지 않는다고 명시한다
- 스토리북: `배포/구성/직접 조작과 모션/단축키 조합 기록`

## 언제 쓰나

Web 앱에서 사용자가 수정키+키 조합을 눌러 기록하고, 확인 뒤 실제 단축키로 등록하게 할 때 쓴다.
브라우저·OS가 쓰는 조합과 제품이 넘긴 충돌·예약 조합을 거르고, 상태를 문구로 알려 준다. 묶음 사용 기준은 [베지어·단축키 편집 도구](../compositions/authoring-tools.md)다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| Native 앱 | 지원하지 않는다(제품 전용 설정 화면) |
| 고정 단축키 안내만 표시 | [Text](text.md)·[CodeBlock](code-block.md) |
| 명령 검색·실행 | [CommandPalette](command-palette.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ShortcutRecorder` | 단축키 조합 기록·등록 | `@hjmds/react/authoring-tools` | 없음 |

루트 barrel에는 없다. `Shortcut`·`ShortcutCapture` 타입과 `normalizeShortcut`은 `@hjmds/design-contracts/authoring-tools`에 있다.

## 최소 사용 예

```tsx
// Web
import { ShortcutRecorder } from "@hjmds/react/authoring-tools";

<ShortcutRecorder value={shortcut} onRegister={saveShortcut} platform={platform}
  conflicts={usedShortcutKeys} formatShortcut={formatForKeyboardLayout}
  labels={{ record: t("shortcut.record"), recording: t("shortcut.recording"), empty: t("shortcut.empty"),
    register: t("shortcut.register"), cancel: t("cancel"), error: t("shortcut.failed"),
    status: status => t(`shortcut.status.${status}`) }} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `Shortcut \| null` | 필수 | 현재 등록된 조합 `{ code, ctrl, alt, shift, meta }` |
| `onRegister` | `(shortcut) => void \| Promise<void>` | 필수 | 실제 등록. resolve하면 초안을 비우고, reject하면 실패 표시 |
| `platform` | `"mac"` · `"windows"` · `"linux"` | 필수 | 주 수정키(mac은 Meta, 그 외 Ctrl)와 OS 예약 판정 |
| `conflicts` / `reserved` | `string[]` | 없음 | `normalizeShortcut` 형식(예: `Ctrl+Shift+KeyJ`). 각각 `conflict`·`reserved` 상태 |
| `formatShortcut` | `(shortcut) => string` | 필수 | 표시 문구. 키보드 배열에 맞는 이름은 제품 소유 |
| `labels` | `{ record, recording, empty, register, cancel, error, status(status) }` | 필수 | `status`는 `ignored`·`cancelled`·`invalid`·`reserved`·`conflict`·`ready`별 문구 |
| `disabled` | `boolean` | `false` | 켜지면 기록·초안을 중단한다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 기록 영역 최소 높이 44, 기록 중 2px 외곽선 | Web `ShortcutRecorder` |
| 간격 | 영역·버튼 줄·상태 사이 `Stack gap="md"`(16), 버튼 사이 `sm`(12) | 같은 구현 |
| 순서·정렬 | 기록 영역(가운데 정렬: 기록 중 안내/초안/현재 값/빈 문구) → [기록] [등록] [취소] → 상태 문구 → 실패 문구(가운데) | 렌더 순서 |
| 고정·스크롤 | 자체 고정·스크롤 없음 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 버튼 줄은 inline Stack(줄바꿈 미지정), 문구는 Text로 줄바꿈 | Web 구현 |

## 꼭 지킬 것

- 수정키(Ctrl·Alt·Meta) 없는 단독 키는 `invalid`다. 입력·포커스 이동을 가로채지 않기 위한 계약이므로 우회하지 않는다.
- 등록 직전에 같은 판정을 다시 실행한다. `conflicts`·`reserved`는 최신 값을 넘긴다.
- 표시 이름(`formatShortcut`)과 저장 식별자(`normalizeShortcut`의 물리 키 code)를 섞지 않는다.

## 상태와 상호작용

[기록]을 누르면 영역에 포커스가 가고 keydown을 판정한다. Tab은 가로채지 않으며 포커스가 떠나면 기록을 멈춘다.
반복 입력·IME 조합·AltGraph·수정키 단독은 무시(`ignored`), Escape는 취소(`cancelled`)다. 브라우저 소유 조합(주 수정키+Q·W·T·N·R·L·P·S·O·F·C·V·X·A·Z)과 OS 조합(Alt+Tab·Alt+F4·Ctrl+Alt+Delete, mac 외 Meta, mac Meta+Space)은 `reserved`다.
`ready`면 초안을 보여 주고 [등록]이 나타난다. 상태 문구는 `role="status"`, 실패는 `role="alert"`다.
