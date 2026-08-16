import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { recipeRegistry } from "@hjm/design-system";
import { showcaseManifest, showcaseScenarios } from "@hjm/design-system/showcase";

type Props = { name: string };

const scenarioLabels = new Map(showcaseScenarios.map(({ id, label }) => [id, label]));

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
    default: return <p className="hjm-muted">계약 문서는 준비되었고 renderer evidence를 연결하는 중입니다.</p>;
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
      <section className="hjm-section" aria-labelledby={`${name}-preview`}><h2 className="hjm-section-title" id={`${name}-preview`}>Interactive reference</h2><div className="hjm-stage"><ReferencePreview name={name} /></div></section>
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
