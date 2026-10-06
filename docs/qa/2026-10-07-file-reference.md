# 파일 레퍼런스 계약 대조

검토일: 2026-10-07. HJM 기준 658960d. 원본 코드·미디어는 복사하지 않았다.

## 범위와 관찰

- [Component Gallery File](https://component.gallery/components/file/)의 여섯 사례 썸네일을 1280px 전체 화면으로 확인했다. Brighton 두 건, Lightning, Nucleus, ONS, TFWM이다. 썸네일 확인은 각 원본의 UI·기능 검증이 아니다.
- [Nucleus 원본](https://britishgas.design/components/ns-download/)은 기존 `/docs/components/ns-download`에서 정상 이동했다. 텍스트 수집의 cache miss를 사이트 접근 불가로 판정하지 않는다. 실제 Standard와 List 탭을 전환하고 문서 기본 Desktop/75% 미리보기를 확인했다. 목록에서는 긴 제목이 줄바꿈되고 형식·크기가 다음 줄에 표시된다. URL에 확장자가 없을 때 `file-type`을 받으며 `file-name`도 별도로 제공한다.
- [TFWM 원본](https://designsystem.tfwm.org.uk/components/file-download/)은 anchor의 `download`와 설명·형식·크기를 사용한다. 다른 형식 요청은 독립 링크다. 실제 파일 전송은 검사하지 않았다. 비접근성 예제의 설명과 Nunjucks `accessible: true`가 어긋나므로 설정을 그대로 복사하지 않는다.

## HJM 대조와 반영

| API | 확인한 계약 | 판단 |
| --- | --- | --- |
| Web Link (`actions.tsx`) | AnchorHTMLAttributes, 나머지 속성을 anchor에 전달 | 단순 다운로드의 `href`·`download` 제공 가능 |
| Web ListRow (`display.tsx`) | HTMLAttributes + href, download 없음 | 링크 행이라고 다운로드 속성까지 지원한다고 안내하지 않음 |
| Native Link (`actions.tsx`) | descriptor + onNavigate | 저장·공유 host의 성공/실패 상태를 대신하지 않음 |
| UploadItem | 업로드 진행·취소·재시도 | 게시된 문서 다운로드를 success 상태로 꾸미지 않음 |
| Asset | 미디어 종류·프레임·크기·대체 이름 | 파일명·형식·다운로드 행동과 동등하지 않음 |

Link/ListRow/UploadItem 사용 지침에 이 선택 경계를 반영했다. 단순 링크를 위한 중복 엔진은 추가하지 않았다.
미리보기·메타데이터·독립 행동·저장 실패 복구를 함께 제공하는 문서 구성은 후속 실험 후보다.
신규 실험으로 등록하거나 기존 15개 집계에 더하지 않았다.

## 미확인

여섯 원본 전체의 화면·변형·키보드·다운로드 동작, Native 저장/공유 host, 제품 팔레트·RTL·큰 글자·스크린리더가 남았다.
Nucleus 예제 다운로드는 실행하지 않았다. 브라우저 캡처는 도구에서 확인했으며 별도 원시 파일을 저장하지 않았다.

## 원본 경로와 Lightning 후속 관찰

2026-10-07 HJM `6acfb34` 이후 IAB 1280×720에서 확인했다.

- Brighton의 downloads-page와 supporting-content-documents 두 주소는 모두 design 하위 도메인에서
  www.brighton-hove.gov.uk의 같은 query로 이동해 Page not found를 표시했다. 검색 도구는 전자의
  4개월 전 수집 본문을 반환했지만 현재 UI 검증으로 세지 않는다. 원본 UI·다운로드는 미확인이다.
- Lightning의 기존 주소는 [v1 Files](https://v1.lightningdesignsystem.com/components/files/)로
  이동했다. 문서는 Winter '27 sandbox preview와 Desktop Only라고 표시한다. 기본 카드,
  이미지 없는 fallback, 제목 없는 표현, 제목 유/무 loading, 여러 첨부의 +22 더 보기 표현을
  실제 화면에서 확인했다. 4:3/16:9/1:1 변형은 DOM에서 존재만 확인했으며 전부 시각 검증하지 않았다.
- 첫 카드의 More Actions를 눌렀으나 메뉴는 보이지 않았고 DOM role=menu도 0이었다.
  미리보기 href는 #다. HTML/CSS blueprint의 배치·이름 근거이며 실제 preview/download/menu
  engine 검증으로 세지 않는다. loading은 퍼센트 없는 spinner, 미리보기와 하단 두 행동은 분리돼 있다.

채택 판단: 미리보기 실패와 저장 실패를 독립 상태로 다루고, 제목·형식·크기를 preview 유무와
무관하게 유지하는 문서 구성을 실험 후보로 구체화한다. [구현 계획](../plans/document-resource-experiment.md).
전체 카드에 누름을 걸어 안쪽 다운로드/메뉴와 중첩하지 않는다. 실제 host 완료 없이 성공 문구를
표시하지 않으며, HTML anchor의 다운로드 시작을 저장 완료로 판정하지 않는다.
Lightning 키보드·모바일·스크린리더와 실제 전송, Brighton 대체 공개 원본 탐색은 남았다.
이번 캡처는 도구에서 확인했고 로컬 원시 파일은 저장하지 않았다.
