import { storyLabels } from "../../../shared/story-labels.js";
import { useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  antDesignReferenceComponents,
  antDesignReferenceSystem,
  componentCatalog,
  getAntDesignReferencesFor,
  type ComponentCatalogEntry,
  type ComponentCategory,
  type ComponentPlatform,
  type ComponentStatus,
} from "@hjmds/design-contracts";
import {
  summarizeWebShowcaseCoverage,
} from "./preview-registry";
import {
  componentStoryHref,
  getComponentStoryClassification,
} from "./story-factory";

type CategoryFilter = ComponentCategory | "all";
type PlatformFilter = ComponentPlatform | "all";
type StatusFilter = ComponentStatus | "all";
type ExplorerProps = { initialCategory?: CategoryFilter };

const catalog: readonly ComponentCatalogEntry[] = componentCatalog;

const categoryLabels: Readonly<Record<ComponentCategory, string>> = {
  foundation: "글자와 아이콘",
  layout: "레이아웃",
  action: "동작",
  input: "입력",
  navigation: "탐색",
  "data-display": "데이터 표시",
  feedback: "상태와 알림",
  overlay: "오버레이",
  provider: "제공자 설정",
  utility: "보조 기능",
};

const categories = Object.keys(categoryLabels) as ComponentCategory[];

export function ComponentExplorer({ initialCategory = "all" }: ExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return catalog.filter((entry) => {
      const referenceNames = getAntDesignReferencesFor(entry.name).map(({ name }) => name);
      const searchable = [storyLabels[entry.name] ?? entry.name, entry.name, entry.category, entry.platform, ...(entry.aliases ?? []), ...referenceNames]
        .join(" ")
        .toLocaleLowerCase();
      return (
        (normalizedQuery.length === 0 || searchable.includes(normalizedQuery)) &&
        (category === "all" || entry.category === category) &&
        (platform === "all" || entry.platform === platform) &&
        (status === "all" || entry.status === status)
      );
    });
  }, [category, platform, query, status]);

  const visibleCategories = categories
    .map((currentCategory) => ({
      category: currentCategory,
      entries: filtered.filter((entry) => entry.category === currentCategory),
    }))
    .filter(({ entries }) => entries.length > 0);
  const showcaseCoverage = summarizeWebShowcaseCoverage();

  return (
    <main className="hjm-page hjm-explorer">
      <p className="hjm-eyebrow">컴포넌트</p>
      <h1 className="hjm-title">전체 컴포넌트 탐색</h1>
      <p className="hjm-lead">
        컴포넌트의 역할과 지원 환경을 비교하고 예제를 열어 보세요.
        한글 이름과 개발용 API 이름으로 검색할 수 있습니다.
      </p>

      <section className="hjm-explorer-summary" aria-label="Explorer summary">
        <span><strong>{showcaseCoverage.canonical}</strong> 컴포넌트</span>
        <span><strong>{showcaseCoverage.webReferences}</strong> 웹 예제</span>
        <span><strong>{showcaseCoverage.contractOnly}</strong> 계약만 등록</span>
        <span><strong>{showcaseCoverage.nativeOnly}</strong> 앱 전용</span>
        <span><strong>{antDesignReferenceComponents.length}</strong> {antDesignReferenceSystem.name} 참고 항목</span>
        <span><strong>{filtered.length}</strong> 검색 결과</span>
      </section>

      <section className="hjm-explorer-tools" aria-label="Filter components">
        <label className="hjm-explorer-search">
          <span>검색</span>
          <input
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="버튼, 로그인 화면, Button…"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span>분류</span>
          <select onChange={(event) => setCategory(event.currentTarget.value as CategoryFilter)} value={category}>
            <option value="all">전체 분류</option>
            {categories.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}
          </select>
        </label>
        <label>
          <span>지원 환경</span>
          <select onChange={(event) => setPlatform(event.currentTarget.value as PlatformFilter)} value={platform}>
            <option value="all">전체 환경</option>
            <option value="shared">웹·앱 공통</option>
            <option value="adaptive">환경별 대응</option>
            <option value="web">웹</option>
            <option value="native">앱</option>
          </select>
        </label>
        <label>
          <span>구현 단계</span>
          <select onChange={(event) => setStatus(event.currentTarget.value as StatusFilter)} value={status}>
            <option value="all">전체 단계</option>
            <option value="stable">안정</option>
            <option value="beta">시험 사용</option>
            <option value="planned">구현 예정</option>
            <option value="deprecated">사용 종료 예정</option>
          </select>
        </label>
      </section>

      {visibleCategories.length === 0 ? (
        <section className="hjm-explorer-empty" role="status">
          <span aria-hidden="true">◇</span>
          <h2>일치하는 컴포넌트가 없습니다.</h2>
          <p>검색어나 필터를 바꿔 보세요.</p>
        </section>
      ) : visibleCategories.map(({ category: currentCategory, entries }) => (
        <section className="hjm-showcase-section" key={currentCategory} aria-labelledby={`explorer-${currentCategory}`}>
          <div className="hjm-section-heading">
            <h2 className="hjm-section-title" id={`explorer-${currentCategory}`}>{categoryLabels[currentCategory]}</h2>
            <span className="hjm-muted">{entries.length}개 항목</span>
          </div>
          <div className="hjm-component-card-grid">
            {entries.map((entry) => {
              const references = getAntDesignReferencesFor(entry.name);
              const classification = getComponentStoryClassification(
                entry.name as (typeof componentCatalog)[number]["name"],
              );
              const storyLinkLabel = classification === "web-renderer"
                ? "웹 예제 열기"
                : classification === "web-unsupported"
                  ? "앱 전용 계약 보기"
                  : "계약과 구현 계획 보기";
              return (
                <article className="hjm-component-card" key={entry.name}>
                  <div className="hjm-component-card-topline">
                    <span className="hjm-component-glyph" aria-hidden="true">{entry.name.slice(0, 2)}</span>
                    <span className="hjm-pill" data-status={entry.status}>{entry.status}</span>
                  </div>
                  <h3>{storyLabels[entry.name] ?? entry.name}</h3>
                  <code>{entry.name}</code>
                  <p className="hjm-component-meta">{entry.platform} · {entry.recipe ? "visual recipe" : entry.nonVisualEvidence === "provider-adapter" ? "provider adapter" : "scope contract"}{entry.behavior ? ` · ${entry.behavior}` : ""}</p>
                  {entry.roadmap && <p className="hjm-component-roadmap" data-roadmap={entry.roadmap.state}><strong>{entry.roadmap.state}</strong>{entry.roadmap.summary}</p>}
                  {references.length > 0 && (
                    <div className="hjm-reference-tags" aria-label="Reference system mappings">
                      {references.map((reference) => (
                        <span key={reference.name}>{reference.name}<small>{reference.relationship}</small></span>
                      ))}
                    </div>
                  )}
                  <div className="hjm-component-card-footer">
                    <a href={componentStoryHref(entry)}>{storyLinkLabel} <span aria-hidden>→</span></a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}

const meta = { includeStories: ["Explorer","Foundation","Layout","Actions","Inputs","Navigation","DataDisplay","Feedback","Overlays","Providers","Utilities"],
  id: "components-overview", title: "배포/컴포넌트/개요",
  component: ComponentExplorer,
  excludeStories: ["ComponentExplorer"],
  args: { initialCategory: "all" },
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof ComponentExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Explorer: Story = { name: "전체 탐색" };
export const Foundation: Story = { args: { initialCategory: "foundation" }, name: "글자와 아이콘" };
export const Layout: Story = { args: { initialCategory: "layout" }, name: "레이아웃" };
export const Actions: Story = { args: { initialCategory: "action" }, name: "동작" };
export const Inputs: Story = { args: { initialCategory: "input" }, name: "입력" };
export const Navigation: Story = { args: { initialCategory: "navigation" }, name: "탐색" };
export const DataDisplay: Story = { args: { initialCategory: "data-display" }, name: "데이터 표시" };
export const Feedback: Story = { args: { initialCategory: "feedback" }, name: "상태와 알림" };
export const Overlays: Story = { args: { initialCategory: "overlay" }, name: "오버레이" };
export const Providers: Story = { args: { initialCategory: "provider" }, name: "제공자 설정" };
export const Utilities: Story = { args: { initialCategory: "utility" }, name: "보조 기능" };
