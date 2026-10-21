import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  antDesignReferenceSystem,
  componentCatalog,
  designSystemVersion,
  summarizeAntDesignCoverage,
  summarizeComponentRoadmap,
  type ComponentCatalogEntry,
  type ComponentCategory,
} from "@hjmds/design-contracts";
import { showcaseEnvironmentMatrix } from "@hjmds/design-contracts/showcase";
import {
  isWebRendererComponent,
  summarizeWebShowcaseCoverage,
} from "./components/preview-registry";
import {
  componentCategoryExplorerHref,
  componentStoryHref,
} from "./components/story-factory";
import {
  categoryLabels,
  relationshipLabels,
  roadmapStateLabels,
  statusLabels,
  statusTones,
} from "./components/showcase-labels";
import { Button as HjmButton, IconButton as HjmIconButton } from "@hjmds/react/actions";
import { Badge as HjmBadge } from "@hjmds/react/display";
import { SearchField as HjmSearchField } from "@hjmds/react/forms";
import { Stack as HjmStack } from "@hjmds/react/layout";

const catalog: readonly ComponentCatalogEntry[] = componentCatalog;

const categoryMetadata: Readonly<
  Record<ComponentCategory, Readonly<{ description: string; mark: string }>>
> = {
  foundation: { description: "글자, 아이콘과 의미 기반 기본 요소", mark: "Aa" },
  layout: { description: "구성, 리듬과 반응형 구조", mark: "▦" },
  action: { description: "명령, 이동과 핵심 행동", mark: "↗" },
  input: { description: "데이터 입력, 검증과 선택", mark: "⌁" },
  navigation: { description: "경로, 보기 전환과 목록 이동", mark: "⌘" },
  "data-display": { description: "구조화된 내용과 정보 밀도", mark: "▤" },
  feedback: { description: "진행, 결과와 알림", mark: "◉" },
  overlay: { description: "겹쳐 뜨는 초점과 맥락 영역", mark: "◇" },
  provider: { description: "웹·앱을 아우르는 설정 경계", mark: "◎" },
  utility: { description: "플랫폼 보조 기능과 구조 효과", mark: "✦" },
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

function LiveComposition() {
  return (
    <section className="hjm-home-composition" aria-label="HJM 컴포넌트 구성 미리보기">
      <div className="hjm-home-composition-bar">
        <span className="hjm-home-brand-mark" aria-hidden="true">H</span>
        <strong>오늘</strong>
        <HjmIconButton label="알림 보기" tone="ghost">♡</HjmIconButton>
      </div>
      <div className="hjm-home-composition-body">
        <HjmBadge tone="success" layoutStyle={{ width: "fit-content" }}>실시간 계약</HjmBadge>
        <div>
          <p className="hjm-home-kicker">사용 중인 컴포넌트</p>
          <strong className="hjm-home-metric">{catalog.length}</strong>
          <span className="hjm-muted"> 개 표준 컴포넌트</span>
        </div>
        <div className="hjm-home-mini-chart" role="img" aria-label="컴포넌트 성숙도 분포">
          <span /><span /><span /><span /><span /><span /><span />
        </div>
        <HjmSearchField label="빠른 찾기" clearLabel="검색어 지우기" placeholder="Button, Dialog, Listy…" />
        <HjmStack axis="inline" gap="xs" wrap>
          <HjmButton>컴포넌트 보기</HjmButton>
          <HjmButton tone="secondary">원칙 읽기</HjmButton>
        </HjmStack>
      </div>
    </section>
  );
}

export function Introduction() {
  const roadmap = summarizeComponentRoadmap();
  const referenceCoverage = summarizeAntDesignCoverage();
  const showcaseCoverage = summarizeWebShowcaseCoverage();
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
          <p className="hjm-eyebrow">HJM Design System · v{designSystemVersion}</p>
          <h1 className="hjm-title">조용한 화면 위에<br />중요한 순간만 선명하게.</h1>
          <p className="hjm-lead">
            웹과 앱이 같은 의미를 공유하도록 토큰, 시각 레시피, 동작 계약과 컴포넌트 범위를
            하나의 기계 판독 가능한 시스템으로 연결합니다.
          </p>
          <nav className="hjm-home-actions" aria-label="바로 가기">
            <a className="hjm-home-primary-link" href="?path=/story/components-overview--explorer">전체 컴포넌트 보기 <span aria-hidden>→</span></a>
            <a className="hjm-home-secondary-link" href="?path=/story/foundations-colors--default">기초 요소 보기</a>
            <a className="hjm-home-secondary-link" href="?path=/story/components-catalog--evidence-matrix">구현·검증 현황</a>
          </nav>
        </div>
        <LiveComposition />
      </header>

      <section className="hjm-home-stat-strip" aria-label="디자인 시스템 현황">
        <article><strong>{showcaseCoverage.webReferences}</strong><span>웹 예제</span></article>
        <article><strong>{showcaseCoverage.contractOnly}</strong><span>계약만 등록</span></article>
        <article><strong>{showcaseCoverage.nativeOnly}</strong><span>앱 전용</span></article>
        <article><strong>{referenceCoverage.tracked}/{referenceCoverage.total}</strong><span>{antDesignReferenceSystem.name} 범위 추적</span></article>
      </section>

      <section className="hjm-showcase-section" aria-labelledby="roadmap-title">
        <div className="hjm-section-heading">
          <div>
            <p className="hjm-eyebrow">로드맵</p>
            <h2 className="hjm-section-title" id="roadmap-title">다음 성숙도 단계가 모두 같은 뜻은 아닙니다.</h2>
          </div>
          <p className="hjm-muted">결정과 다음 신호를 기계 판독 가능한 데이터로 관리합니다.</p>
        </div>
        <div className="hjm-roadmap-grid">
          <article><strong>{roadmap["contract-ready"]}</strong><span>{roadmapStateLabels["contract-ready"]}</span><p>레시피·동작 규칙·핵심 로직을 제품 렌더러에서 검증할 차례입니다.</p></article>
          <article><strong>{roadmap.composed}</strong><span>{roadmapStateLabels.composed}</span><p>기존 표준 컴포넌트 조합으로 문제를 이미 흡수했습니다.</p></article>
          <article><strong>{roadmap["evidence-needed"]}</strong><span>{roadmapStateLabels["evidence-needed"]}</span><p>실제 제품 증거를 더 쌓아 계약을 열거나 안정 단계로 옮길 후보입니다.</p></article>
          <article><strong>{roadmap.prerequisite}</strong><span>{roadmapStateLabels.prerequisite}</span><p>흡수 대상에 필요한 축을 먼저 추가해야 합니다.</p></article>
          <article><strong>{roadmap.declined}</strong><span>{roadmapStateLabels.declined}</span><p>정체성 또는 런타임 경계 때문에 의도적으로 만들지 않습니다.</p></article>
        </div>
      </section>

      <section className="hjm-showcase-section" aria-labelledby="featured-title">
        <div className="hjm-section-heading">
          <div>
            <p className="hjm-eyebrow">둘러보기 시작</p>
            <h2 className="hjm-section-title" id="featured-title">대표 컴포넌트</h2>
          </div>
          <a className="hjm-text-link" href="?path=/story/components-overview--explorer">전체 {catalog.length}개 보기 <span aria-hidden>→</span></a>
        </div>
        <div className="hjm-feature-grid">
          {featured.map((entry) => (
            <article className="hjm-feature-card" key={entry.name}>
              <div className="hjm-feature-preview" aria-hidden="true" data-component={entry.name}>
                {entry.name === "Button" && <span className="hjm-demo-button">계속하기</span>}
                {entry.name === "Field" && <span className="hjm-home-field-demo">선수 이름 <i>홍길동</i></span>}
                {entry.name === "Surface" && <span className="hjm-home-surface-demo"><b>조용한 표면</b><i>정보가 차분하게 놓입니다.</i></span>}
                {entry.name === "Tabs" && <span className="hjm-home-tabs-demo"><b>개요</b><i>사용법</i><i>API</i></span>}
                {entry.name === "Toast" && <span className="hjm-home-toast-demo"><b>✓</b><i>변경 사항을 저장했어요.</i></span>}
                {entry.name === "EmptyState" && <span className="hjm-home-empty-demo"><b>◇</b><i>아직 항목이 없어요</i></span>}
              </div>
              <div className="hjm-feature-card-copy">
                <HjmBadge tone={statusTones[entry.status]} layoutStyle={{ width: "fit-content" }}>{statusLabels[entry.status]}</HjmBadge>
                <h3>{entry.name}</h3>
                <p>{categoryMetadata[entry.category].description}</p>
                <a href={componentStoryHref(entry)}>예제 열기 <span aria-hidden>→</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="hjm-showcase-section" aria-labelledby="categories-title">
        <div className="hjm-section-heading">
          <div>
            <p className="hjm-eyebrow">분류 지도</p>
            <h2 className="hjm-section-title" id="categories-title">카테고리로 탐색</h2>
          </div>
          <p className="hjm-muted">범위와 구현 성숙도를 분리해 보여줍니다.</p>
        </div>
        <div className="hjm-category-grid">
          {categoryCounts.map(({ category, entries }) => {
            const meta = categoryMetadata[category];
            const webReferences = entries.filter(({ name }) =>
              isWebRendererComponent(name as (typeof componentCatalog)[number]["name"]),
            ).length;
            return (
              <a className="hjm-category-card" href={componentCategoryExplorerHref(category)} key={category}>
                <span className="hjm-category-mark" aria-hidden="true">{meta.mark}</span>
                <span className="hjm-category-copy">
                  <strong>{categoryLabels[category]}</strong>
                  <small>{meta.description}</small>
                </span>
                <span className="hjm-category-count"><b>{entries.length}</b><small>웹 예제 {webReferences}개</small></span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="hjm-showcase-section hjm-reference-section" aria-labelledby="coverage-title">
        <div>
          <p className="hjm-eyebrow">참고 범위</p>
          <h2 className="hjm-section-title" id="coverage-title">넓게 참고하고, HJM답게 번역합니다.</h2>
          <p className="hjm-lead">
            {antDesignReferenceSystem.name} {antDesignReferenceSystem.version} 핵심 컴포넌트 {referenceCoverage.total}개를
            모두 추적합니다. 외형과 prop API를 복제하지 않고 사용자 문제를 HJM의 웹·앱 공통,
            환경별 대응, 웹, 앱 계약으로 다시 분류합니다.
          </p>
          <a className="hjm-home-primary-link" href="?path=/story/components-overview--explorer">참고 대응표 보기 <span aria-hidden>→</span></a>
        </div>
        <div className="hjm-coverage-panel">
          <div className="hjm-coverage-total"><strong>{referenceCoverage.tracked}</strong><span>/ {referenceCoverage.total}개 추적</span></div>
          <dl className="hjm-coverage-breakdown">
            <div><dt>{relationshipLabels.direct}</dt><dd>{referenceCoverage.relationships.direct}</dd></div>
            <div><dt>{relationshipLabels.adapted}</dt><dd>{referenceCoverage.relationships.adapted}</dd></div>
            <div><dt>{relationshipLabels.decomposed}</dt><dd>{referenceCoverage.relationships.decomposed}</dd></div>
            <div><dt>모든 표면 성숙</dt><dd>{referenceCoverage.fullyMature}</dd></div>
            <div><dt>일부 표면 성숙</dt><dd>{referenceCoverage.partiallyMature}</dd></div>
            <div><dt>구현 예정만</dt><dd>{referenceCoverage.plannedOnly}</dd></div>
          </dl>
        </div>
      </section>

      <section className="hjm-showcase-section" aria-labelledby="environment-title">
        <p className="hjm-eyebrow">실제 환경 기준</p>
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

const meta = { includeStories: ["Overview"],
  id: "home-overview", title: "배포/컴포넌트/개요/사용 안내",
  component: Introduction,
  excludeStories: ["Introduction"],
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Introduction>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = { name: "개요",};
