# Utilverse 소셜 입력·외부 host 채택 계획

2026-10-07. 소비 HEAD fa201bc90e4c94219de0f4f51ac0328987ad1cb2, HJM 7269392.
7개 TSX 전체와 MessageComposer 공개 슬롯을 대조했다. 136개 hash 일치.
누적 121개 source-reviewed / 15개 pending. 소비 소스와 SDK 설정은 변경하지 않았다.

## 파일별 판단

| 소스 (apps/mobile/src 기준) | 판단 |
| --- | --- |
| `components/ChatToolCard.tsx` | Already Surface/Stack/Button; preserve preview hiding description/actions, product artwork, runtime-gated run and always-available details navigation. Compare higher card composition only if independent actions remain. |
| `components/ChatToolPicker.tsx` | Already Sheet/SearchScreen/SearchField. Replace pill Button theme selectors with single-selection API and result Buttons with ListRow. Preserve settled query/abort handling, localized keyword search, privacy copy and choose-only callback. |
| `components/CommentReactions.tsx` | Already ReactionPicker/Sheet/IconButton. Preserve tap-heart vs long-press full picker, guest login, target-state idempotent PUT, controlled receipt-driven reaction and uncertainty feedback. Verify picker accessibility alternative to long press. |
| `components/CommentReplyComposer.tsx` | Use existing MessageComposer replyTo/context/leadingAction to absorb exterior quote/avatar where geometry and missing-parent semantics match; retain pending document lock, original retry parent ID, schema/client ID, draft write before send and done-only success toast. |
| `components/TranslationAttribution.tsx` | Retain Google asset and destination; compare effective HJM theme with current system scheme for logo contrast, use Notice for link failure. Do not recolor/recreate official mark or count attribution as generic illustration. |
| `components/ResultAdBanner.tsx` | Unsupported web ad surface intentionally null; do not create fake placeholder/ad UI. |
| `components/ResultAdBanner.native.tsx` | Native SDK host already surrounded by HJM Divider/Stack/Text. Preserve lazy SDK, foreground/focus/keyboard gates, abortable consent start, non-personalized request, adaptive measured width and failure hiding; do not centralize SDK or unit IDs. |

## 소셜 입력의 공통화

도구 선택 Sheet는 이미 SearchScreen을 사용한다. 테마 필터는 단일 선택, 검색 결과는 선택 행동이므로
각각 공통 선택기와 ListRow를 비교한다. 선택 시 바로 도구 실행/메시지 전송으로 바꾸지 않는다.
query와 settledQuery의 차이는 busy 표시와 취소 가능한 검색에 쓰이므로 제거하지 않는다.

답글은 MessageComposer의 replyTo/context/leadingAction이 현재 외부 quote/avatar와 겹친다.
존재하지 않는 부모의 복구 초안을 실제 인용문으로 꾸미지 않는다. parentAvailable이 false면 새 전송을
막고 원래 immutable retry만 회복하는 계약을 유지한다. 잠금은 sending 외에 uncertain·discarding·
저장 문서 pending도 포함한다. command.start 완료만으로 toast를 내지 않고 phase.done을 확인한다.
기존 사용자 요구로 제거한 입력 하단 상시 안내를 공통 슬롯 도입 때문에 다시 추가하지 않는다.

반응은 이미 ReactionPicker를 사용한다. 원터치 하트와 길게 눌러 전체 목록은 제품 선택이다.
길게 누르기만으로 전체 목록에 접근하게 되는지 스크린리더 검증이 필요하다. 현재 분석만으로
접근성 통과나 실패를 단정하지 않는다. 중복된 CommandFeedback이 실제 열린 Sheet에서 어떻게
발표되는지도 확인 대상이다. UI 교체가 새 반응을 낙관적으로 확정해서는 안 된다.

## 외부 host

광고 Banner는 SDK가 제공하는 native view이며 공통 Surface로 대체할 대상이 아니다. focus/foreground,
키보드, SDK 가용성, resultAds.ready, load 실패가 모두 표시 조건이다. measured width 변경에 따른
재생성과 non-personalized 옵션을 유지한다. 이 검토는 광고 콘솔·실제 노출 검증이 아니다.

번역 로고는 useColorScheme으로 흰색/기본 이미지를 고른다. 제품 HJM 테마가 시스템과 다를 때
대비가 맞는지 확인하고 유효 테마에 맞출 후보로 둔다. 공식 자산 자체는 유지하며 사용 조건을
확인하기 전 크기·색을 임의 변경하지 않는다. 외부 링크 실패는 Notice 후보다.

## 남은 검증

검색 취소·필터+검색·Sheet 닫기 후 재개, guest/member 전환, 반응 실패/불확정·접근성 목록 열기,
답글 부모 삭제·로컬 저장 실패·재시작 retry·계정 변경·완료 후 닫기, 광고 SDK 부재/실패·키보드·blur,
번역 로고의 시스템/제품 테마 불일치, 큰 글자·다크·VoiceOver는 pending이다.
