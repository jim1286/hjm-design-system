import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  antDesignReferenceSystem,
  componentCatalog,
  summarizeAntDesignCoverage,
  summarizeShowcaseMaturity,
  type ComponentCatalogEntry,
  type ComponentCategory,
} from "@hjm/design-system";
import { showcaseEnvironmentMatrix } from "@hjm/design-system/showcase";

const catalog: readonly ComponentCatalogEntry[] = componentCatalog;

const categoryMetadata: Readonly<
  Record<ComponentCategory, Readonly<{ label: string; description: string; mark: string }>>
> = {
  foundation: { label: "Foundations", description: "Type, icons and semantic primitives", mark: "Aa" },
  layout: { label: "Layout", description: "Composition, rhythm and responsive structure", mark: "▦" },
  action: { label: "Actions", description: "Commands, destinations and primary moments", mark: "↗" },
  input: { label: "Inputs", description: "Data entry, validation and selection", mark: "⌁" },
  navigation: { label: "Navigation", description: "Routes, views and collection movement", mark: "⌘" },
  "data-display": { label: "Data display", description: "Structured content and information density", mark: "▤" },
  feedback: { label: "Feedback", description: "Progress, outcomes and announcements", mark: "◉" },
  overlay: { label: "Overlays", description: "Layered focus and contextual surfaces", mark: "◇" },
  provider: { label: "Providers", description: "Cross-platform configuration boundaries", mark: "◎" },
  utility: { label: "Utilities", description: "Platform helpers and structural effects", mark: "✦" },
};

const categoryOrder: readonly ComponentCategory[] = [
  "foundation",
  "layout",
  "action",
  "input",
  "navigation",
  "data-display",
  "feedback",
  "overlay",
  "provider",
  "utility",
];

function componentStoryHref(name: string): string {
  const slug = name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `?path=/story/components-reference-gallery--${slug}`;
}

function LiveComposition() {
  return (
    <section className="hjm-home-composition" aria-label="HJM component composition preview">
      <div className="hjm-home-composition-bar">
        <span className="hjm-home-brand-mark" aria-hidden="true">H</span>
        <strong>Today</strong>
        <button className="hjm-icon-button" aria-label="알림 보기">♡</button>
      </div>
      <div className="hjm-home-composition-body">
        <span className="hjm-pill" data-status="stable">Live contract</span>
        <div>
          <p className="hjm-home-kicker">ACTIVE SYSTEMS</p>
          <strong className="hjm-home-metric">{catalog.length}</strong>
          <span className="hjm-muted"> canonical components</span>
        </div>
        <div className="hjm-home-mini-chart" role="img" aria-label="Component maturity distribution">
          <span /><span /><span /><span /><span /><span /><span />
        </div>
        <label className="hjm-field">
          <span>Quick find</span>
          <input readOnly value="Button, Dialog, Listy…" />
        </label>
        <div className="hjm-preview-row">
          <button className="hjm-demo-button">Browse components</button>
          <button>Read principles</button>
        </div>
      </div>
    </section>
  );
}

function Introduction() {
  const maturity = summarizeShowcaseMaturity();
  const referenceCoverage = summarizeAntDesignCoverage();
  const previewable = maturity.stable + maturity.beta;
  const categoryCounts = categoryOrder.map((category) => ({
    category,
    entries: catalog.filter((entry) => entry.category === category),
  }));
  const featured = ["Button", "Field", "Surface", "Tabs", "Toast", "EmptyState"]
    .map((name) => catalog.find((entry) => entry.name === name))
    .filter((entry): entry is ComponentCatalogEntry => entry !== undefined);

  return (
    <main className="hjm-page hjm-home">
      <header className="hjm-home-hero">
        <div className="hjm-home-copy">
          <p className="hjm-eyebrow">HJM Design System · v0.2.0</p>
          <h1 className="hjm-title">조용한 화면 위에<br />중요한 순간만 선명하게.</h1>
          <p className="hjm-lead">
            Web과 Native가 같은 의미를 공유하도록 토큰, visual recipe, behavior contract와
            component scope를 하나의 기계 판독 가능한 시스템으로 연결합니다.
          </p>
          <nav className="hjm-home-actions" aria-label="Showcase quick links">
            <a className="hjm-home-primary-link" href="?path=/story/components-overview--explorer">전체 컴포넌트 보기 <span aria-hidden>→</span></a>
            <a className="hjm-home-secondary-link" href="?path=/story/foundations-colors--semantic-palette">Foundation 보기</a>
            <a className="hjm-home-secondary-link" href="?path=/story/components-catalog--evidence-matrix">Catalog 계약</a>
          </nav>
        </div>
        <LiveComposition />
      </header>

      <section className="hjm-home-stat-strip" aria-label="Design system coverage">
        <article><strong>{catalog.length}</strong><span>canonical scope</span></article>
        <article><strong>{previewable}</strong><span>interactive references</span></article>
        <article><strong>{maturity.planned}</strong><span>contract-first roadmap</span></article>
        <article><strong>{referenceCoverage.tracked}/{referenceCoverage.total}</strong><span>Ant Design scope tracked</span></article>
      </section>

      <section className="hjm-section" aria-labelledby="featured-title">
        <div className="hjm-section-heading">
          <div>
            <p className="hjm-eyebrow">Start exploring</p>
            <h2 className="hjm-section-title" id="featured-title">대표 컴포넌트</h2>
          </div>
          <a className="hjm-text-link" href="?path=/story/components-overview--explorer">Browse all {catalog.length} <span aria-hidden>→</span></a>
        </div>
        <div className="hjm-feature-grid">
          {featured.map((entry) => (
            <article className="hjm-feature-card" key={entry.name}>
              <div className="hjm-feature-preview" aria-hidden="true" data-component={entry.name}>
                {entry.name === "Button" && <span className="hjm-demo-button">계속하기</span>}
                {entry.name === "Field" && <span className="hjm-home-field-demo">선수 이름 <i>홍길동</i></span>}
                {entry.name === "Surface" && <span className="hjm-home-surface-demo"><b>Quiet surface</b><i>Information stays calm.</i></span>}
                {entry.name === "Tabs" && <span className="hjm-home-tabs-demo"><b>Overview</b><i>Usage</i><i>API</i></span>}
                {entry.name === "Toast" && <span className="hjm-home-toast-demo"><b>✓</b><i>변경 사항을 저장했어요.</i></span>}
                {entry.name === "EmptyState" && <span className="hjm-home-empty-demo"><b>◇</b><i>아직 항목이 없어요</i></span>}
              </div>
              <div className="hjm-feature-card-copy">
                <span className="hjm-pill" data-status={entry.status}>{entry.status}</span>
                <h3>{entry.name}</h3>
                <p>{categoryMetadata[entry.category].description}</p>
                <a href={componentStoryHref(entry.name)}>Open reference <span aria-hidden>→</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="hjm-section" aria-labelledby="categories-title">
        <div className="hjm-section-heading">
          <div>
            <p className="hjm-eyebrow">System map</p>
            <h2 className="hjm-section-title" id="categories-title">카테고리로 탐색</h2>
          </div>
          <p className="hjm-muted">범위와 구현 성숙도를 분리해 보여줍니다.</p>
        </div>
        <div className="hjm-category-grid">
          {categoryCounts.map(({ category, entries }) => {
            const meta = categoryMetadata[category];
            const ready = entries.filter(({ status }) => status === "stable" || status === "beta").length;
            return (
              <a className="hjm-category-card" href={`?path=/story/components-overview--explorer&args=initialCategory:${category}`} key={category}>
                <span className="hjm-category-mark" aria-hidden="true">{meta.mark}</span>
                <span className="hjm-category-copy">
                  <strong>{meta.label}</strong>
                  <small>{meta.description}</small>
                </span>
                <span className="hjm-category-count"><b>{entries.length}</b><small>{ready} previewable</small></span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="hjm-section hjm-reference-section" aria-labelledby="coverage-title">
        <div>
          <p className="hjm-eyebrow">Reference coverage</p>
          <h2 className="hjm-section-title" id="coverage-title">넓게 참고하고, HJM답게 번역합니다.</h2>
          <p className="hjm-lead">
            {antDesignReferenceSystem.name} {antDesignReferenceSystem.version} core {referenceCoverage.total}개를
            모두 추적합니다. 외형과 prop API를 복제하지 않고 사용자 문제를 HJM의 shared,
            adaptive, Web, Native 계약으로 다시 분류합니다.
          </p>
          <a className="hjm-home-primary-link" href="?path=/story/components-overview--explorer">Coverage crosswalk 보기 <span aria-hidden>→</span></a>
        </div>
        <div className="hjm-coverage-panel">
          <div className="hjm-coverage-total"><strong>{referenceCoverage.tracked}</strong><span>of {referenceCoverage.total} tracked</span></div>
          <dl className="hjm-coverage-breakdown">
            <div><dt>Direct</dt><dd>{referenceCoverage.relationships.direct}</dd></div>
            <div><dt>Adapted</dt><dd>{referenceCoverage.relationships.adapted}</dd></div>
            <div><dt>Decomposed</dt><dd>{referenceCoverage.relationships.decomposed}</dd></div>
            <div><dt>Fully previewable</dt><dd>{referenceCoverage.fullyPreviewable}</dd></div>
            <div><dt>Partial renderer</dt><dd>{referenceCoverage.partiallyPreviewable}</dd></div>
            <div><dt>Contract only</dt><dd>{referenceCoverage.contractOnly}</dd></div>
          </dl>
        </div>
      </section>

      <section className="hjm-section" aria-labelledby="environment-title">
        <p className="hjm-eyebrow">Built for real environments</p>
        <h2 className="hjm-section-title" id="environment-title">한 Story, 다섯 가지 필수 증거</h2>
        <div className="hjm-environment-strip">
          {showcaseEnvironmentMatrix.map((environment) => (
            <span key={environment.id}><b>{environment.label}</b><small>{environment.motion}</small></span>
          ))}
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Home/Overview",
  component: Introduction,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Introduction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
