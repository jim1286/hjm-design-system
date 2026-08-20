import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { componentCatalog, recipeRegistry, type ComponentCatalogEntry } from "@hjm/design-system";
import { showcaseManifest, showcaseScenarios } from "@hjm/design-system/showcase";

type Props = { name: string };

const scenarioLabels = new Map(showcaseScenarios.map(({ id, label }) => [id, label]));
const catalog: readonly ComponentCatalogEntry[] = componentCatalog;

function FieldPreview({ multiline = false, search = false }: { multiline?: boolean; search?: boolean }) {
  return (
    <label className="hjm-field">
      <span>이름</span>
      {multiline ? <textarea defaultValue="여러 줄 입력 예시" /> : <input type={search ? "search" : "text"} defaultValue={search ? "선수 검색" : "홍길동"} />}
      <small>필수 정보는 입력 아래에서 설명합니다.</small>
    </label>
  );
}

function ChoicePreview({ radio = false, group = false }: { radio?: boolean; group?: boolean }) {
  const type = radio ? "radio" : "checkbox";
  const content = (
    <>
      <label className="hjm-choice"><input type={type} name="choice" defaultChecked /> 첫 번째 선택</label>
      <label className="hjm-choice"><input type={type} name="choice" /> 두 번째 선택</label>
      <label className="hjm-choice"><input type={type} name="choice" disabled /> 사용할 수 없음</label>
    </>
  );
  return group ? <fieldset className="hjm-choice-group"><legend>선택 그룹</legend>{content}</fieldset> : <div className="hjm-preview-row">{content}</div>;
}

function OverlayPreview({ kind }: { kind: "Dialog" | "AlertDialog" | "Sheet" | "Tooltip" }) {
  const [open, setOpen] = useState(false);
  if (kind === "Tooltip") {
    return <button className="hjm-demo-button" title="자세한 도움말">도움말에 포커스하거나 가리키기</button>;
  }
  return (
    <>
      <button className="hjm-demo-button" onClick={() => setOpen(true)}>{kind} 열기</button>
      {open && (
        <div className="hjm-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && kind === "Dialog" && setOpen(false)}>
          <section className={`hjm-modal ${kind === "Sheet" ? "hjm-sheet" : ""}`} role={kind === "AlertDialog" ? "alertdialog" : "dialog"} aria-modal="true" aria-labelledby={`${kind}-title`}>
            <h3 id={`${kind}-title`}>{kind} 제목</h3>
            <p>긴 설명도 잘리지 않고 행동의 결과를 명확하게 전달합니다.</p>
            <div className="hjm-actions"><button onClick={() => setOpen(false)}>취소</button><button className="hjm-demo-button" onClick={() => setOpen(false)}>확인</button></div>
          </section>
        </div>
      )}
    </>
  );
}

function ReferencePreview({ name }: Props) {
  const [selected, setSelected] = useState("첫 번째");
  switch (name) {
    case "Text": return <div className="hjm-type-sample"><h2>제목 텍스트</h2><p>본문 텍스트는 의미와 위계를 보존합니다.</p><small>보조 정보</small></div>;
    case "Icon": return <div className="hjm-icon-grid" aria-label="Semantic icons"><span aria-hidden>⌂</span><span aria-hidden>✓</span><span aria-hidden>!</span><span aria-hidden>→</span></div>;
    case "Surface": case "Card": return <article className="hjm-demo-surface"><strong>{name} 제목</strong><p>제품이 색·간격·모서리를 임의로 덮지 않는 의미 기반 컨테이너입니다.</p></article>;
    case "Divider": return <div className="hjm-demo-surface">위 내용<hr />아래 내용</div>;
    case "Section": return <section className="hjm-demo-surface"><h3>섹션 제목</h3><p>관련 콘텐츠를 하나의 의미 단위로 묶습니다.</p></section>;
    case "Button": return <div className="hjm-preview-row"><button className="hjm-demo-button">Primary</button><button>Secondary</button><button disabled>Disabled</button></div>;
    case "IconButton": return <div className="hjm-preview-row"><button className="hjm-icon-button" aria-label="좋아요">♡</button><button className="hjm-icon-button" aria-label="닫기">×</button></div>;
    case "Link": return <p><a href="#link-target">실제 목적지 링크</a> · <a href="https://example.com">외부 링크</a></p>;
    case "BottomCTA": return <div className="hjm-bottom-cta"><button className="hjm-demo-button">계속하기</button></div>;
    case "Field": return <FieldPreview />;
    case "SearchField": return <FieldPreview search />;
    case "TextArea": return <FieldPreview multiline />;
    case "Checkbox": return <ChoicePreview />;
    case "Radio": return <ChoicePreview radio />;
    case "CheckboxGroup": return <ChoicePreview group />;
    case "RadioGroup": return <ChoicePreview radio group />;
    case "Switch": return <label className="hjm-switch"><input type="checkbox" defaultChecked /><span>알림 받기</span></label>;
    case "Chip": return <div className="hjm-preview-row"><button className="hjm-chip" aria-pressed="true">선택됨</button><button className="hjm-chip">기본</button></div>;
    case "SegmentedControl": return <div className="hjm-segments" role="radiogroup" aria-label="보기 방식">{["목록", "격자"].map((item) => <button key={item} role="radio" aria-checked={selected === item} onClick={() => setSelected(item)}>{item}</button>)}</div>;
    case "Select": return <label className="hjm-field"><span>언어</span><select defaultValue="ko"><option value="ko">한국어</option><option value="en">English</option></select></label>;
    case "Combobox": return <label className="hjm-field"><span>선수 찾기</span><input list="players" placeholder="이름 입력" /><datalist id="players"><option value="김도영" /><option value="양현종" /></datalist></label>;
    case "Tabs": return <div><div className="hjm-tabs" role="tablist">{["첫 번째", "두 번째"].map((item) => <button key={item} role="tab" aria-selected={selected === item} onClick={() => setSelected(item)}>{item}</button>)}</div><div className="hjm-demo-surface" role="tabpanel">{selected} 패널 내용</div></div>;
    case "TopBar": return <header className="hjm-topbar"><button className="hjm-icon-button" aria-label="뒤로">←</button><strong>화면 제목</strong><button className="hjm-icon-button" aria-label="더 보기">•••</button></header>;
    case "BottomNavigation": return <nav className="hjm-bottom-nav" aria-label="주요 메뉴">{["홈", "기록", "설정"].map((item, index) => <a key={item} href={`#nav-${index}`} aria-current={index === 0 ? "page" : undefined}><span aria-hidden>{index === 0 ? "⌂" : index === 1 ? "▤" : "⚙"}</span>{item}</a>)}</nav>;
    case "LoadMore": return <button className="hjm-wide-button">더 보기</button>;
    case "Menu": return <div className="hjm-menu" role="menu"><button role="menuitem">이름 바꾸기</button><button role="menuitem">공유하기</button><button role="menuitem" className="hjm-danger">삭제</button></div>;
    case "Avatar": return <div className="hjm-avatar-row"><span className="hjm-avatar" role="img" aria-label="홍길동">홍</span><span className="hjm-avatar hjm-avatar-lg" role="img" aria-label="김민수">김</span></div>;
    case "Badge": return <div className="hjm-preview-row"><span className="hjm-demo-badge">진행 중</span><span className="hjm-demo-badge hjm-success">완료</span></div>;
    case "CounterBadge": return <button className="hjm-icon-button" aria-label="알림 12개">♢<span className="hjm-counter" aria-hidden>12</span></button>;
    case "List": return <ul className="hjm-list"><li>첫 번째 항목</li><li>두 번째 항목</li><li>세 번째 항목</li></ul>;
    case "ListRow": return <button className="hjm-list-row"><span className="hjm-avatar">홍</span><span><strong>홍길동</strong><small>선수 상세 보기</small></span><span aria-hidden>›</span></button>;
    case "Accordion": return <div className="hjm-accordion"><details open><summary>자주 묻는 질문</summary><p>공개 상태와 키보드 조작을 함께 확인합니다.</p></details><details><summary>다른 질문</summary><p>두 번째 답변입니다.</p></details></div>;
    case "Statistic": return <dl className="hjm-stat-grid"><div><dt>타율</dt><dd>.328</dd><small>↑ 리그 2위</small></div><div><dt>홈런</dt><dd>24</dd><small>시즌 누적</small></div></dl>;
    case "EmptyState": return <div className="hjm-empty"><span aria-hidden>◇</span><h3>아직 항목이 없어요</h3><p>새 항목을 추가하면 여기에 표시됩니다.</p><button className="hjm-demo-button">추가하기</button></div>;
    case "Notice": return <div className="hjm-notice" role="status"><strong>확인해 주세요</strong><p>저장하지 않은 변경 사항이 있습니다.</p></div>;
    case "Progress": return <div><label htmlFor="progress">업로드 68%</label><progress id="progress" value="68" max="100" /></div>;
    case "Spinner": return <div className="hjm-spinner" role="status" aria-label="불러오는 중" />;
    case "Skeleton": return <div className="hjm-skeletons" aria-label="콘텐츠 불러오는 중"><span /><span /><span /></div>;
    case "Toast": return <div className="hjm-toast" role="status"><span aria-hidden>✓</span><span><strong>저장했어요</strong><small>변경 사항이 반영되었습니다.</small></span><button aria-label="닫기">×</button></div>;
    case "Dialog": case "AlertDialog": case "Sheet": case "Tooltip": return <OverlayPreview kind={name} />;
    case "Stack": return <div className="hjm-demo-stack"><button>첫 번째</button><button>두 번째</button><button>세 번째</button></div>;
    case "Grid": return <div className="hjm-demo-grid">{["A", "B", "C", "D"].map((item) => <span key={item}>{item}</span>)}</div>;
    case "Layout": return <div className="hjm-demo-layout"><header>Header</header><aside>Navigation</aside><main>Main landmark</main></div>;
    case "Masonry": return <div className="hjm-demo-masonry">{[42, 76, 54, 92, 64, 46].map((height, index) => <span key={index} style={{ height }}>{index + 1}</span>)}</div>;
    case "Splitter": return <div className="hjm-demo-splitter"><section>Primary panel</section><button aria-label="패널 크기 조절" /><section>Secondary panel</section></div>;
    case "FloatingActionButton": return <div className="hjm-demo-fab-wrap"><button className="hjm-demo-fab" aria-label="새 항목 만들기">＋</button></div>;
    case "PasswordField": return <label className="hjm-field"><span>비밀번호</span><span className="hjm-inline-field"><input type="password" defaultValue="password" /><button>표시</button></span></label>;
    case "OtpField": return <fieldset className="hjm-otp"><legend>인증번호</legend>{[0, 1, 2, 3, 4, 5].map((index) => <input key={index} aria-label={`${index + 1}번째 숫자`} inputMode="numeric" maxLength={1} defaultValue={index < 3 ? String(index + 1) : ""} />)}</fieldset>;
    case "Slider": return <label className="hjm-field"><span>볼륨 {selected === "첫 번째" ? "40" : "70"}%</span><input type="range" defaultValue="40" /></label>;
    case "NumberField": return <label className="hjm-field"><span>수량</span><span className="hjm-stepper"><button aria-label="감소">−</button><input type="number" defaultValue="3" /><button aria-label="증가">＋</button></span></label>;
    case "DatePicker": return <label className="hjm-field"><span>날짜</span><input type="date" defaultValue="2026-08-20" /></label>;
    case "TimePicker": return <div className="hjm-preview-row"><label className="hjm-field"><span>시</span><select defaultValue="14"><option>14</option><option>15</option></select></label><label className="hjm-field"><span>분</span><select defaultValue="30"><option>00</option><option>30</option></select></label></div>;
    case "ColorPicker": return <label className="hjm-field"><span>색상</span><input type="color" defaultValue="#2948d7" /></label>;
    case "FilePicker": return <label className="hjm-file-drop"><span aria-hidden>⇧</span><strong>파일 선택</strong><small>PNG, JPG · 최대 10MB</small><input type="file" /></label>;
    case "Cascader": return <div className="hjm-demo-columns"><div><strong>지역</strong><button>서울 ›</button><button>부산 ›</button></div><div><strong>구</strong><button>마포구</button><button>종로구</button></div></div>;
    case "Form": return <form className="hjm-demo-form" onSubmit={(event) => event.preventDefault()}><FieldPreview /><label className="hjm-field"><span>이메일</span><input type="email" defaultValue="hello@hjm.dev" /></label><button className="hjm-demo-button">저장하기</button></form>;
    case "Mentions": return <label className="hjm-field"><span>댓글</span><textarea defaultValue="@김민수 오늘 경기 기록을 확인해 주세요." /><small>@를 입력하면 후보를 찾습니다.</small></label>;
    case "Rating": return <div className="hjm-rating" role="img" aria-label="5점 중 4점"><span>★</span><span>★</span><span>★</span><span>★</span><span aria-hidden>☆</span></div>;
    case "TransferList": return <div className="hjm-transfer"><section><strong>Available</strong><label><input type="checkbox" /> 홍길동</label><label><input type="checkbox" /> 김민수</label></section><div><button aria-label="선택 항목 오른쪽으로 이동">→</button><button aria-label="선택 항목 왼쪽으로 이동">←</button></div><section><strong>Selected</strong><label><input type="checkbox" /> 이지은</label></section></div>;
    case "TreeSelect": return <div className="hjm-tree"><label><input type="checkbox" /> 전체 팀</label><label><span>└</span><input type="checkbox" defaultChecked /> 1군</label><label><span>└</span><input type="checkbox" /> 2군</label></div>;
    case "UploadItem": return <div className="hjm-upload-item"><span aria-hidden>▧</span><span><strong>profile.png</strong><small>68% · 2.4MB</small><progress value="68" max="100" /></span><button aria-label="업로드 취소">×</button></div>;
    case "Breadcrumb": return <nav className="hjm-breadcrumb" aria-label="Breadcrumb"><a href="#home">홈</a><span>/</span><a href="#teams">구단</a><span>/</span><span aria-current="page">선수</span></nav>;
    case "Pagination": return <nav className="hjm-pagination" aria-label="Pagination"><button aria-label="이전 페이지">‹</button>{[1, 2, 3, 4].map((page) => <button key={page} aria-current={page === 2 ? "page" : undefined}>{page}</button>)}<button aria-label="다음 페이지">›</button></nav>;
    case "Steps": return <ol className="hjm-steps"><li data-state="complete"><span>✓</span>정보 입력</li><li data-state="current"><span>2</span>확인</li><li><span>3</span>완료</li></ol>;
    case "Anchor": return <nav className="hjm-anchor" aria-label="이 페이지에서"><a aria-current="location" href="#overview">Overview</a><a href="#usage">Usage</a><a href="#accessibility">Accessibility</a></nav>;
    case "VirtualList": return <div className="hjm-virtual-list" aria-label="가상 목록 개념 미리보기">{Array.from({ length: 7 }, (_, index) => <div key={index}><span>{index + 101}</span>행 {index + 1}</div>)}</div>;
    case "Timeline": return <ol className="hjm-timeline"><li><time>10:32</time><strong>경기 시작</strong></li><li><time>11:04</time><strong>득점</strong><small>2루타로 주자 홈인</small></li><li><time>11:21</time><strong>투수 교체</strong></li></ol>;
    case "DataTable": return <div className="hjm-table-wrap"><table className="hjm-table"><thead><tr><th>선수</th><th aria-sort="descending">타율 ↓</th><th>홈런</th></tr></thead><tbody><tr><td>김민수</td><td>.328</td><td>24</td></tr><tr><td>홍길동</td><td>.301</td><td>18</td></tr></tbody></table></div>;
    case "Tree": return <div className="hjm-tree" role="tree"><button role="treeitem" aria-expanded="true">▾ Foundations</button><button role="treeitem"><span>└</span> Colors</button><button role="treeitem"><span>└</span> Typography</button><button role="treeitem" aria-expanded="false">▸ Components</button></div>;
    case "Calendar": return <div className="hjm-calendar"><strong>2026년 8월</strong><div>{["일", "월", "화", "수", "목", "금", "토", ...Array.from({ length: 14 }, (_, index) => String(index + 16))].map((day, index) => <span key={`${day}-${index}`} data-selected={day === "20" || undefined}>{day}</span>)}</div></div>;
    case "Carousel": return <div className="hjm-carousel"><button aria-label="이전 슬라이드">‹</button><article><span className="hjm-pill">1 / 3</span><h3>오늘의 경기</h3><p>현재 슬라이드만 탐색 순서에 남깁니다.</p></article><button aria-label="다음 슬라이드">›</button></div>;
    case "DescriptionList": return <dl className="hjm-description-list"><div><dt>소속</dt><dd>서울 HJM</dd></div><div><dt>포지션</dt><dd>내야수</dd></div><div><dt>등번호</dt><dd>7</dd></div><div><dt>데뷔</dt><dd>2021</dd></div></dl>;
    case "Image": return <figure className="hjm-image"><div role="img" aria-label="야구장 풍경">HJM</div><figcaption>콘텐츠 이미지와 대체 설명</figcaption></figure>;
    case "QRCode": return <div className="hjm-qr-concept"><span aria-hidden>▦</span><strong>제품 요구 증거 대기</strong><small>실제 QR 생성기가 아니라 계약 경계를 설명하는 개념 표시입니다.</small></div>;
    case "Tag": return <div className="hjm-preview-row"><span className="hjm-demo-badge">내야수</span><span className="hjm-demo-badge hjm-success">등록 선수</span><span className="hjm-demo-badge">2026 시즌</span></div>;
    case "Tour": return <div className="hjm-tour"><span className="hjm-pill">2 / 4</span><strong>필터를 바꿔 보세요</strong><p>이곳에서 상태와 플랫폼을 좁힐 수 있습니다.</p><div className="hjm-actions"><button>건너뛰기</button><button className="hjm-demo-button">다음</button></div></div>;
    case "Result": return <div className="hjm-empty"><span aria-hidden>✓</span><h3>설정이 완료됐어요</h3><p>이제 새 환경으로 계속할 수 있습니다.</p><button className="hjm-demo-button">대시보드로</button></div>;
    case "Watermark": return <div className="hjm-watermark"><article><strong>Confidential report</strong><p>제품 증거가 생기기 전에는 별도 계약을 열지 않습니다.</p></article><span aria-hidden>HJM · HJM · HJM</span></div>;
    case "SidePanel": return <div className="hjm-side-panel-demo"><main>페이지 내용</main><aside><strong>선수 상세</strong><p>데스크톱 보조 패널</p><button>닫기</button></aside></div>;
    case "Popover": return <div className="hjm-popover-demo"><button aria-expanded="true">공유 옵션</button><section role="dialog"><strong>링크 공유</strong><p>누구나 볼 수 있는 링크를 만듭니다.</p></section></div>;
    case "ConfirmPopover": return <div className="hjm-popover-demo"><button className="hjm-danger" aria-expanded="true">삭제</button><section role="alertdialog"><strong>정말 삭제할까요?</strong><p>Popover 표면 + AlertDialog 확인 session 조합입니다.</p><div className="hjm-actions"><button>취소</button><button>삭제</button></div></section></div>;
    case "CommandPalette": return <div className="hjm-command"><input aria-label="명령 검색" autoFocus placeholder="명령 검색…" /><div role="listbox"><button role="option">새 항목 만들기 <kbd>↵</kbd></button><button role="option">설정 열기 <kbd>⌘,</kbd></button></div></div>;
    case "Affix": return <div className="hjm-affix-demo"><span>스크롤 문서</span><strong>고정 후보</strong><p>실제 임계값 요구가 확인될 때 계약을 엽니다.</p></div>;
    case "DesignSystemProvider": return <dl className="hjm-config"><div><dt>theme</dt><dd>system → dark</dd></div><div><dt>direction</dt><dd>ltr</dd></div><div><dt>textScale</dt><dd>1.0</dd></div><div><dt>reducedMotion</dt><dd>false</dd></div></dl>;
    default: {
      const entry = catalog.find((component) => component.name === name);
      return <div className="hjm-roadmap-preview"><span className="hjm-pill">{entry?.roadmap?.state ?? "scope"}</span><strong>{name}</strong><p>{entry?.roadmap?.summary ?? "Canonical scope and decision record."}</p></div>;
    }
  }
}

function ContractStory({ name }: Props) {
  const entry = showcaseManifest.find(({ component }) => component.name === name);
  if (!entry) throw new Error(`Unknown showcase component: ${name}`);
  const recipe = entry.component.recipe ? recipeRegistry[entry.component.recipe] : undefined;
  return (
    <main className="hjm-page">
      <p className="hjm-eyebrow">{entry.component.category} · {entry.component.platform}</p>
      <h1 className="hjm-title">{name}</h1>
      <div className="hjm-meta-row"><span className="hjm-pill" data-status={entry.component.status}>{entry.component.status}</span>{entry.component.behavior && <span className="hjm-pill">behavior: {entry.component.behavior}</span>}{entry.component.recipe && <span className="hjm-pill">recipe: {entry.component.recipe}</span>}</div>
      {entry.component.roadmap && <section className="hjm-roadmap-callout" data-roadmap={entry.component.roadmap.state}><span>{entry.component.roadmap.state}</span><p>{entry.component.roadmap.summary}</p>{entry.component.roadmap.targets && <small>Composed with: {entry.component.roadmap.targets.join(" + ")}</small>}</section>}
      <section className="hjm-section" aria-labelledby={`${name}-preview`}><h2 className="hjm-section-title" id={`${name}-preview`}>{entry.component.status === "planned" ? "Concept & decision" : "Interactive reference"}</h2><div className="hjm-stage"><ReferencePreview name={name} /></div></section>
      <section className="hjm-section" aria-labelledby={`${name}-evidence`}><h2 className="hjm-section-title" id={`${name}-evidence`}>Required evidence</h2><div className="hjm-grid"><article className="hjm-card"><h3>Surfaces</h3><p>{entry.requiredSurfaces.join(" · ")}</p></article><article className="hjm-card"><h3>Scenarios</h3><ul className="hjm-check-list">{entry.requiredScenarios.map((id) => <li key={id}>{scenarioLabels.get(id)}</li>)}</ul></article><article className="hjm-card"><h3>Contract</h3><p>{recipe ? `${Object.keys(recipe).length} top-level recipe branches` : "Behavior/API contract only"}</p></article></div></section>
    </main>
  );
}

const meta = { title: "Components/Reference Gallery", component: ContractStory, parameters: { controls: { disable: true } } } satisfies Meta<typeof ContractStory>;
export default meta;
type Story = StoryObj<typeof meta>;
const story = (name: string): Story => ({ name, args: { name } });

export const Text = story("Text"); export const Icon = story("Icon"); export const Surface = story("Surface"); export const Divider = story("Divider"); export const Section = story("Section");
export const Button = story("Button"); export const IconButton = story("IconButton"); export const Link = story("Link"); export const BottomCTA = story("BottomCTA");
export const Field = story("Field"); export const SearchField = story("SearchField"); export const TextArea = story("TextArea"); export const Checkbox = story("Checkbox"); export const Radio = story("Radio"); export const CheckboxGroup = story("CheckboxGroup"); export const RadioGroup = story("RadioGroup"); export const Switch = story("Switch"); export const Chip = story("Chip"); export const SegmentedControl = story("SegmentedControl"); export const Select = story("Select"); export const Combobox = story("Combobox");
export const Tabs = story("Tabs"); export const TopBar = story("TopBar"); export const BottomNavigation = story("BottomNavigation"); export const LoadMore = story("LoadMore"); export const Menu = story("Menu");
export const Avatar = story("Avatar"); export const Badge = story("Badge"); export const CounterBadge = story("CounterBadge"); export const Card = story("Card"); export const List = story("List"); export const ListRow = story("ListRow"); export const Accordion = story("Accordion"); export const Statistic = story("Statistic");
export const EmptyState = story("EmptyState"); export const Notice = story("Notice"); export const Progress = story("Progress"); export const Spinner = story("Spinner"); export const Skeleton = story("Skeleton"); export const Toast = story("Toast");
export const Dialog = story("Dialog"); export const AlertDialog = story("AlertDialog"); export const Sheet = story("Sheet"); export const Tooltip = story("Tooltip");
export const Stack = story("Stack"); export const Grid = story("Grid"); export const Layout = story("Layout"); export const Masonry = story("Masonry"); export const Splitter = story("Splitter");
export const FloatingActionButton = story("FloatingActionButton");
export const PasswordField = story("PasswordField"); export const OtpField = story("OtpField"); export const Slider = story("Slider"); export const NumberField = story("NumberField"); export const DatePicker = story("DatePicker"); export const TimePicker = story("TimePicker"); export const ColorPicker = story("ColorPicker"); export const FilePicker = story("FilePicker"); export const Cascader = story("Cascader"); export const Form = story("Form"); export const Mentions = story("Mentions"); export const Rating = story("Rating"); export const TransferList = story("TransferList"); export const TreeSelect = story("TreeSelect"); export const UploadItem = story("UploadItem");
export const Breadcrumb = story("Breadcrumb"); export const Pagination = story("Pagination"); export const Steps = story("Steps"); export const Anchor = story("Anchor");
export const VirtualList = story("VirtualList"); export const Timeline = story("Timeline"); export const DataTable = story("DataTable"); export const Tree = story("Tree"); export const Calendar = story("Calendar"); export const Carousel = story("Carousel"); export const DescriptionList = story("DescriptionList"); export const Image = story("Image"); export const QRCode = story("QRCode"); export const Tag = story("Tag");
export const Tour = story("Tour"); export const Result = story("Result"); export const Watermark = story("Watermark"); export const SidePanel = story("SidePanel"); export const Popover = story("Popover"); export const ConfirmPopover = story("ConfirmPopover"); export const CommandPalette = story("CommandPalette"); export const Affix = story("Affix"); export const AppProvider = story("AppProvider"); export const BorderBeam = story("BorderBeam"); export const DesignSystemProvider = story("DesignSystemProvider"); export const Utility = story("Utility");
