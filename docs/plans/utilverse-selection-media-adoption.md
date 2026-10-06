# Utilverse 언어 선택·프로필·소셜 사진 대체 판단

2026-10-07 소스 검토. 소비 `fa201bc90e4c94219de0f4f51ac0328987ad1cb2`, HJM `3c5547c`.
파일별 hash는 [inventory](utilverse-ui-adoption-inventory.json)에 있다. 소비 코드는 바꾸지 않았다.

| 전체 소스를 읽은 파일 | 판단 | 공개 API와 보존할 계약 |
| --- | --- | --- |
| LanguageSelect.tsx | 대체 가능, UI 검증 대기 | Select로 ListRow+Sheet+Pressable+숨긴 ListRow 조합을 대체. label/dismissLabel/items/selectedKey/onSelectionChange/disabled/renderLeading 사용 |
| Avatar.tsx | 준비된 host 게시 후 대체 | Avatar decorative/name/initials/size/source/renderImage. 제품은 avatarUrl·Expo disk cache 소유, HJM은 프레임·fallback·실패 세대 소유 |
| AuthorAvatar.tsx | 부분 대체, 상호작용 배치 검증 필요 | 내부 Avatar는 위와 동일. Sheet·TextArea·Button은 이미 HJM. 신고 command·권한·expectedRevision·clientReportId는 제품 유지 |
| SocialPhotoGallery.tsx | Carousel로 페이지 조작 대체 가능, 조회 경계 검증 필요 | controlled Carousel + 선택된 사진에만 query/image host. 권한 scope·path·AbortSignal·gcTime=0·staleTime=0·retry=false·cachePolicy=none 유지 |

## 언어 선택

실제 등록 언어는 ko-KR/en-US/ja-JP이고 system 항목을 더해 네 개다. 갯수 때문에 바꾸는 것이
아니라 기존 펼침 트리거와 닫히는 선택창 구조가 Select 계약과 같기 때문에 구성 전체를 대체한다.
Native Select는 항목을 누르면 선택하고 닫으며 disabled 항목·전체 disabled를 모두 지원한다.
`disallowEmptySelection`을 켜 언어 null을 허용하지 않는다. system의 선택 불가는
deviceLanguageAvailable에서 공급한다. 저장·실패 처리는 기존 onChange와 상위 상태가 유지한다.
현재 선택을 다시 누르기·system 불가·저장 실패·열린 상태의 언어 변경·큰 글자·초점 복귀는
소비 UI 검증에 포함한다. Select 구현과 사용 지침을 대조했으며 새 선택 API는 필요하지 않다.

## 아바타와 프로필 열기

제품의 한 글자 이니셜을 유지하려면 기존 code point 추출을 `initials`로 공급한다. HJM 기본은
첫/마지막 단어 이니셜이라 그대로 두면 표현이 바뀐다. null/공백 이름은 `?`로 정규화한다.
기존 크기 26/28/32/200은 HJM 최소 24 이상이다. fallback을 로딩 이미지 아래에 유지하고
Expo onError를 HJM renderImage의 callback으로 전달한다. 프레임 색·선은 HJM recipe와
Utilverse semantic palette로 검토하며 raw style로 예전 프레임을 복제하지 않는다.

AuthorAvatar의 기본 28 + 양쪽 hitSlop 6은 명목상 40이고 답글 26은 38이다. 최소 44를
충족한다고 볼 수 없고 부모 경계 밖 hitSlop의 실제 효력도 별도 문제다. ConversationScreen은
avatar 부모 폭을 32로 둔다. 따라서 버튼만 교체해도 목표 영역이 잘릴 수 있다.
IconButton 내부는 glyph 크기 프레임이므로 사진을 임의로 넣는 것을 대체 확정으로 세지 않는다.
채팅/댓글 avatar 슬롯과 이름 행의 HJM 공개 행동 계약을 함께 대조한 후 최소 대상·인접 조작
충돌·스크린리더 단일 이름을 확인해야 한다. 자기 사진/사진 없음에서는 기존 장식 전용을 유지한다.
신고 폼 열기·실패 후 수정·중복 retry·닫기 중 command 정리는 제품 상태 검증 대상이다.

## 사진 갤러리

현재 제품은 선택 사진 한 개만 서버에서 읽는다. HJM Carousel은 모든 슬라이드의 renderSlide를
실행하고 비선택 wrapper를 숨긴다. 따라서 모든 renderSlide에서 query 컴포넌트를 마운트하면
전체 사진 조회로 바뀐다. `slide.id === currentId`일 때만 query host를 반환한다.
배열이 바뀔 때 currentId가 유효하지 않으면 첫 id로 정규화하고 빈 배열에서는 Carousel을
마운트하지 않는다. 기본 descriptor는 유효한 현재 id와 비어 있지 않은 배열을 요구한다.

외부 Album의 access.scope/path key, 제품 API 권한 검사, 사진 삭제·로그아웃·차단 중 응답 처리를
유지한다. HJM의 숨김을 보안 경계로 쓰지 않는다. 자동 재생은 켜지 않는다. 기존 이전/다음
IconButton과 페이지 수는 HJM 조작·접근성 위치 표시로 대체하며 지역화 문구는 제품이 공급한다.
현재 사진을 바꿀 때의 요청 취소·이전 사진 노출·재시도·배열 축소와 RTL·큰 글자·스크린리더는
소비 적용 시 검증한다. query 성공 이후 Expo 이미지 decode 실패 UI도 확인해야 한다.

## 증거 범위

소스 네 파일 전체와 ConversationScreen/CommunityScreen의 관련 호출부만 읽었다.
호출부 화면 전체는 pending이다. HJM의 data-display.tsx, forms.tsx, actions.tsx,
carousel.tsx와 Avatar/Select/Carousel 사용 지침을 대조했다. 기기 QA·소비 컴파일·릴리스·
교체 완료를 주장하지 않는다. 코드 변경 없이 조사 문서와 inventory만 갱신했다.
