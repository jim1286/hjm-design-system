import type { Meta, StoryObj } from "@storybook/react-vite";

import { getAntDesignReferencesFor } from "@hjmds/design-contracts";
import { showcaseManifest, showcaseScenarios } from "@hjmds/design-contracts/showcase";

const scenarioLabels = new Map(showcaseScenarios.map(({ id, label }) => [id, label]));

function Catalog() {
  return (
    <main className="hjm-page">
      <p className="hjm-eyebrow">Components</p>
      <h1 className="hjm-title">Catalog and evidence</h1>
      <p className="hjm-lead">
        Catalog 상태는 구현 완료를 과장하지 않습니다. 각 행의 evidence 목록이 Web과 Native
        story가 증명해야 할 범위입니다.
      </p>
      <section className="hjm-section" aria-label="Component catalog">
        <div className="hjm-table-wrap">
          <table className="hjm-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Category</th>
                <th>Platform</th>
                <th>Contract</th>
                <th>Web</th>
                <th>Native</th>
                <th>Reference coverage</th>
                <th>Required surfaces</th>
                <th>Required stories</th>
              </tr>
            </thead>
            <tbody>
              {showcaseManifest.map(({ storyId, component, surfaceMaturity, requiredScenarios, requiredSurfaces }) => {
                const references = getAntDesignReferencesFor(component.name);
                return <tr key={storyId}>
                  <td><strong>{component.name}</strong><br /><span className="hjm-muted">{storyId}</span></td>
                  <td>{component.category}</td>
                  <td>{component.platform}</td>
                  <td><span className="hjm-pill" data-status={component.status}>{component.status}</span></td>
                  <td><span className="hjm-pill" data-status={surfaceMaturity.web}>{surfaceMaturity.web}</span></td>
                  <td><span className="hjm-pill" data-status={surfaceMaturity.native}>{surfaceMaturity.native}</span></td>
                  <td>{references.length > 0 ? references.map(({ name }) => name).join(" · ") : "HJM native scope"}</td>
                  <td>{requiredSurfaces.join(" · ")}</td>
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

const meta = {
  title: "Components/Catalog",
  component: Catalog,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Catalog>;

export default meta;
type Story = StoryObj<typeof meta>;
export const EvidenceMatrix: Story = {};
