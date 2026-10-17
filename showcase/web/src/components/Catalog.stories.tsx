import type { Meta, StoryObj } from "@storybook/react-vite";

import { getAntDesignReferencesFor } from "@hjmds/design-contracts";
import { showcaseManifest, showcaseScenarios } from "@hjmds/design-contracts/showcase";
import { Badge as HjmBadge } from "@hjmds/react/display";

import {
  categoryLabels,
  platformLabels,
  statusLabels,
  statusTones,
  surfaceLabels,
} from "./showcase-labels.js";

const scenarioLabels = new Map(showcaseScenarios.map(({ id, label }) => [id, label]));

function Catalog() {
  return (
    <main className="hjm-page">
      <p className="hjm-eyebrow">컴포넌트</p>
      <h1 className="hjm-title">구현·검증 현황</h1>
      <p className="hjm-lead">
        카탈로그 상태는 구현 완료를 과장하지 않습니다. 각 행의 증거 목록이 웹과 앱 예제가 증명해야 할
        범위입니다.
      </p>
      <section className="hjm-showcase-section" aria-label="컴포넌트 카탈로그">
        <div className="hjm-table-wrap" tabIndex={0} role="region" aria-label="컴포넌트 검증 표">
          <table className="hjm-showcase-table hjm-catalog-table">
            <thead>
              <tr>
                <th>컴포넌트</th>
                <th>분류</th>
                <th>지원 환경</th>
                <th>계약</th>
                <th>웹</th>
                <th>앱</th>
                <th>참고 범위</th>
                <th>필수 표면</th>
                <th>필수 시나리오</th>
              </tr>
            </thead>
            <tbody>
              {showcaseManifest.map(({ storyId, component, surfaceMaturity, requiredScenarios, requiredSurfaces }) => {
                const references = getAntDesignReferencesFor(component.name);
                return <tr key={storyId}>
                  <td><strong>{component.name}</strong><br /><span className="hjm-muted">{storyId}</span></td>
                  <td>{categoryLabels[component.category]}</td>
                  <td>{platformLabels[component.platform]}</td>
                  <td><HjmBadge tone={statusTones[component.status]}>{statusLabels[component.status]}</HjmBadge></td>
                  <td><HjmBadge tone={statusTones[surfaceMaturity.web]} variant={surfaceMaturity.web === "unsupported" ? "outline" : "filled"}>{statusLabels[surfaceMaturity.web]}</HjmBadge></td>
                  <td><HjmBadge tone={statusTones[surfaceMaturity.native]} variant={surfaceMaturity.native === "unsupported" ? "outline" : "filled"}>{statusLabels[surfaceMaturity.native]}</HjmBadge></td>
                  <td>{references.length > 0 ? references.map(({ name }) => name).join(" · ") : "HJM 자체 범위"}</td>
                  <td>{requiredSurfaces.map((surface) => surfaceLabels[surface]).join(" · ")}</td>
                  <td>{requiredScenarios.map((id) => scenarioLabels.get(id)).join(" · ")}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const meta = { includeStories: ["EvidenceMatrix"],
  id: "components-catalog", title: "배포/컴포넌트/개요/구현·검증 현황",
  component: Catalog,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Catalog>;

export default meta;
type Story = StoryObj<typeof meta>;
export const EvidenceMatrix: Story = { name: "구현·검증 현황",};
