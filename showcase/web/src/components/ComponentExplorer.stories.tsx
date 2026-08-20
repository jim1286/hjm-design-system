import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  antDesignReferenceComponents,
  antDesignReferenceSystem,
  componentCatalog,
  getAntDesignReferencesFor,
  summarizeComponentRoadmap,
  type ComponentCatalogEntry,
  type ComponentCategory,
  type ComponentPlatform,
  type ComponentStatus,
} from "@hjm/design-system";

type CategoryFilter = ComponentCategory | "all";
type PlatformFilter = ComponentPlatform | "all";
type StatusFilter = ComponentStatus | "all";
type ExplorerProps = { initialCategory?: CategoryFilter };

const catalog: readonly ComponentCatalogEntry[] = componentCatalog;

const categoryLabels: Readonly<Record<ComponentCategory, string>> = {
  foundation: "Foundations",
  layout: "Layout",
  action: "Actions",
  input: "Inputs",
  navigation: "Navigation",
  "data-display": "Data display",
  feedback: "Feedback",
  overlay: "Overlays",
  provider: "Providers",
  utility: "Utilities",
};

const categories = Object.keys(categoryLabels) as ComponentCategory[];

function componentStoryHref(name: string): string {
  const slug = name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `?path=/story/components-reference-gallery--${slug}`;
}

function ComponentExplorer({ initialCategory = "all" }: ExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return catalog.filter((entry) => {
      const referenceNames = getAntDesignReferencesFor(entry.name).map(({ name }) => name);
      const searchable = [entry.name, entry.category, entry.platform, ...(entry.aliases ?? []), ...referenceNames]
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
  const roadmap = summarizeComponentRoadmap();
  const validated = catalog.filter(({ status: maturity }) => maturity === "stable" || maturity === "beta").length;

  return (
    <main className="hjm-page hjm-explorer">
      <p className="hjm-eyebrow">Components</p>
      <h1 className="hjm-title">Component explorer</h1>
      <p className="hjm-lead">
        구현된 preview와 contract-first roadmap를 한곳에서 탐색합니다. 익숙한 ecosystem 이름도
        검색할 수 있지만, API와 시각 언어는 HJM의 canonical contract를 따릅니다.
      </p>

      <section className="hjm-explorer-summary" aria-label="Explorer summary">
        <span><strong>{catalog.length}</strong> HJM components</span>
        <span><strong>{validated}</strong> validated renderers</span>
        <span><strong>{roadmap["contract-ready"]}</strong> contracts ready</span>
        <span><strong>{roadmap.composed}</strong> composed decisions</span>
        <span><strong>{antDesignReferenceComponents.length}</strong> {antDesignReferenceSystem.name} references</span>
        <span><strong>{filtered.length}</strong> visible results</span>
      </section>

      <section className="hjm-explorer-tools" aria-label="Filter components">
        <label className="hjm-explorer-search">
          <span>Search</span>
          <input
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Button, Input, Listy, adaptive…"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span>Category</span>
          <select onChange={(event) => setCategory(event.currentTarget.value as CategoryFilter)} value={category}>
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}
          </select>
        </label>
        <label>
          <span>Platform</span>
          <select onChange={(event) => setPlatform(event.currentTarget.value as PlatformFilter)} value={platform}>
            <option value="all">All platforms</option>
            <option value="shared">Shared</option>
            <option value="adaptive">Adaptive</option>
            <option value="web">Web</option>
            <option value="native">Native</option>
          </select>
        </label>
        <label>
          <span>Status</span>
          <select onChange={(event) => setStatus(event.currentTarget.value as StatusFilter)} value={status}>
            <option value="all">All statuses</option>
            <option value="stable">Stable</option>
            <option value="beta">Beta</option>
            <option value="planned">Planned</option>
            <option value="deprecated">Deprecated</option>
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
        <section className="hjm-section" key={currentCategory} aria-labelledby={`explorer-${currentCategory}`}>
          <div className="hjm-section-heading">
            <h2 className="hjm-section-title" id={`explorer-${currentCategory}`}>{categoryLabels[currentCategory]}</h2>
            <span className="hjm-muted">{entries.length} components</span>
          </div>
          <div className="hjm-component-card-grid">
            {entries.map((entry) => {
              const references = getAntDesignReferencesFor(entry.name);
              return (
                <article className="hjm-component-card" key={entry.name}>
                  <div className="hjm-component-card-topline">
                    <span className="hjm-component-glyph" aria-hidden="true">{entry.name.slice(0, 2)}</span>
                    <span className="hjm-pill" data-status={entry.status}>{entry.status}</span>
                  </div>
                  <h3>{entry.name}</h3>
                  <p className="hjm-component-meta">{entry.platform} · {entry.recipe ? "visual recipe" : "scope contract"}{entry.behavior ? ` · ${entry.behavior}` : ""}</p>
                  {entry.roadmap && <p className="hjm-component-roadmap" data-roadmap={entry.roadmap.state}><strong>{entry.roadmap.state}</strong>{entry.roadmap.summary}</p>}
                  {references.length > 0 && (
                    <div className="hjm-reference-tags" aria-label="Reference system mappings">
                      {references.map((reference) => (
                        <span key={reference.name}>{reference.name}<small>{reference.relationship}</small></span>
                      ))}
                    </div>
                  )}
                  <div className="hjm-component-card-footer">
                    <a href={componentStoryHref(entry.name)}>{entry.status === "planned" ? "Open concept & decision" : "Open interactive reference"} <span aria-hidden>→</span></a>
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

const meta = {
  title: "Components/Overview",
  component: ComponentExplorer,
  args: { initialCategory: "all" },
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof ComponentExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Explorer: Story = {};
