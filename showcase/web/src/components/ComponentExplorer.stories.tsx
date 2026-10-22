import { storyLabels } from "../../../shared/story-labels.js";
import { componentDiscovery, matchesComponentQuery } from "../../../shared/component-discovery.js";
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
  type SelectItemDescriptor,
} from "@hjmds/design-contracts";
import { Badge as HjmBadge } from "@hjmds/react/display";
import { SearchField as HjmSearchField, Select as HjmSelect } from "@hjmds/react/forms";
import { Grid as HjmGrid, Stack as HjmStack, Surface as HjmSurface } from "@hjmds/react/layout";

import {
  summarizeWebShowcaseCoverage,
} from "./preview-registry";
import {
  categoryLabels,
  platformLabels,
  relationshipLabels,
  roadmapStateLabels,
  roadmapStateTones,
  statusLabels,
  statusTones,
} from "./showcase-labels.js";
import {
  componentStoryHref,
  getComponentStoryClassification,
} from "./story-factory";

type CategoryFilter = ComponentCategory | "all";
type PlatformFilter = ComponentPlatform | "all";
type StatusFilter = ComponentStatus | "all";
type ExplorerProps = { initialCategory?: CategoryFilter };

const catalog: readonly ComponentCatalogEntry[] = componentCatalog;

const categories = Object.keys(categoryLabels) as ComponentCategory[];
const platforms = Object.keys(platformLabels) as ComponentPlatform[];
const statuses: readonly ComponentStatus[] = ["stable", "beta", "planned", "deprecated"];

function filterOptions<Key extends string>(allLabel: string, keys: readonly Key[], labels: Readonly<Record<Key, string>>): SelectItemDescriptor<Key | "all">[] {
  return [{ id: "all", label: allLabel, textValue: allLabel }, ...keys.map((id) => ({ id, label: labels[id], textValue: labels[id] }))];
}

const categoryOptions = filterOptions("전체 분류", categories, categoryLabels);
const platformOptions = filterOptions("전체 환경", platforms, platformLabels);
const statusOptions = filterOptions("전체 단계", statuses, statusLabels);

export function ComponentExplorer({ initialCategory = "all" }: ExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  const filtered = useMemo(() => {
    return catalog.filter((entry) => {
      const referenceNames = getAntDesignReferencesFor(entry.name).map(({ name }) => name);
      return (
        matchesComponentQuery(query, entry, [storyLabels[entry.name] ?? entry.name, ...referenceNames]) &&
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
        이름·API뿐 아니라 “아래에서 올라오는 판”, “밀면 나오는 삭제 버튼” 같은 쉬운 말로 검색할 수 있습니다.
      </p>
      <p><a href="https://github.com/jim1286/hjm-design-system/blob/main/packages/design-contracts/docs/usage/FINDING.md" target="_blank" rel="noreferrer">비슷한 UI 선택 기준과 요청 예시</a></p>

      <section className="hjm-explorer-summary" aria-label="탐색 요약">
        <span><strong>{showcaseCoverage.canonical}</strong> 컴포넌트</span>
        <span><strong>{showcaseCoverage.webReferences}</strong> 웹 예제</span>
        <span><strong>{showcaseCoverage.contractOnly}</strong> 계약만 등록</span>
        <span><strong>{showcaseCoverage.nativeOnly}</strong> 앱 전용</span>
        <span><strong>{antDesignReferenceComponents.length}</strong> {antDesignReferenceSystem.name} 참고 항목</span>
        <span><strong>{filtered.length}</strong> 검색 결과</span>
      </section>

      <HjmSurface as="section" className="hjm-explorer-tools" bordered padding="md" aria-label="컴포넌트 필터">
        <HjmGrid columns={{ compact: 2, expanded: 4 }} gap={{ compact: "sm" }}>
          <HjmSearchField
            label="검색"
            clearLabel="검색어 지우기"
            placeholder="쉬운 말, 이름 또는 API"
            value={query}
            onValueChange={setQuery}
          />
          <HjmSelect<CategoryFilter>
            label="분류"
            placeholder="전체 분류"
            emptySelectionLabel="전체 분류"
            disallowEmptySelection
            items={categoryOptions}
            selectedKey={category}
            onSelectionChange={(key) => setCategory(key ?? "all")}
          />
          <HjmSelect<PlatformFilter>
            label="지원 환경"
            placeholder="전체 환경"
            emptySelectionLabel="전체 환경"
            disallowEmptySelection
            items={platformOptions}
            selectedKey={platform}
            onSelectionChange={(key) => setPlatform(key ?? "all")}
          />
          <HjmSelect<StatusFilter>
            label="구현 단계"
            placeholder="전체 단계"
            emptySelectionLabel="전체 단계"
            disallowEmptySelection
            items={statusOptions}
            selectedKey={status}
            onSelectionChange={(key) => setStatus(key ?? "all")}
          />
        </HjmGrid>
      </HjmSurface>

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
              const discovery = componentDiscovery[entry.name];
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
                    <HjmBadge tone={statusTones[entry.status]}>{statusLabels[entry.status]}</HjmBadge>
                  </div>
                  <h3>{storyLabels[entry.name] ?? entry.name}</h3>
                  <code>{entry.name}</code>
                  {discovery && <>
                    <p className="hjm-muted">찾는 말: {discovery.terms.join(" · ")}</p>
                    <p>{discovery.choose}</p>
                    <p><strong>요청 예시: </strong>{discovery.request}</p>
                  </>}
                  <p className="hjm-component-meta">{platformLabels[entry.platform]} · {entry.recipe ? "시각 레시피" : entry.nonVisualEvidence === "provider-adapter" ? "제공자 어댑터" : "범위 계약"}{entry.behavior ? <> · 동작 규칙 <code>{entry.behavior}</code></> : null}</p>
                  {entry.roadmap && <div className="hjm-component-roadmap" data-roadmap={entry.roadmap.state}><HjmBadge size="small" tone={roadmapStateTones[entry.roadmap.state]}>{roadmapStateLabels[entry.roadmap.state]}</HjmBadge><p>{entry.roadmap.summary}</p></div>}
                  {references.length > 0 && (
                    <div className="hjm-reference-tags" aria-label="참고 시스템 대응">
                      {references.map((reference) => (
                        <span key={reference.name}>{reference.name}<small>{relationshipLabels[reference.relationship]}</small></span>
                      ))}
                    </div>
                  )}
                  <HjmStack axis="inline" gap="xs" wrap className="hjm-component-card-footer">
                    <a href={componentStoryHref(entry)}>{storyLinkLabel} <span aria-hidden>→</span></a>
                    {discovery && <a href={`https://github.com/jim1286/hjm-design-system/blob/main/packages/design-contracts/docs/usage/${discovery.guide}`} target="_blank" rel="noreferrer">사용 지침</a>}
                    {discovery?.relatedExample && <a href={`?path=/story/${discovery.relatedExample.story}`}>{discovery.relatedExample.label}</a>}
                  </HjmStack>
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
  id: "components-overview", title: "배포/컴포넌트/개요/컴포넌트 찾기",
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
