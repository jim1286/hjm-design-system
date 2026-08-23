import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AlertDialog,
  Badge,
  BottomNavigation,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  CounterBadge,
  DescriptionList,
  Dialog,
  EmptyState,
  Field,
  Grid,
  HjmProvider,
  Icon,
  IconButton,
  Image,
  Layout,
  ListRow,
  LoadMore,
  Menu,
  OtpField,
  PasswordField,
  Radio,
  RadioGroup,
  Result,
  SearchField,
  SegmentedControl,
  Select,
  Sheet,
  Stack,
  Surface,
  Switch,
  Tabs,
  Tag,
  Text,
  TextArea,
  TextField,
  Timeline,
  Toast,
  Tooltip,
} from "../src/index.js";
import { reactRendererEvidence } from "../src/evidence.js";

type DefaultRenderFixture = Readonly<{
  componentId: string;
  marker: string;
  render(): ReactNode;
}>;

const readyLoadMoreDescriptor = {
  state: { status: "ready", requestKey: "default-page" },
  labels: {
    loadMore: "더 보기",
    loading: "불러오는 중",
    retry: "다시 시도",
    complete: "모두 불러옴",
  },
} as const;

/**
 * Canonical default-render proofs. The component ids are stable case ids used
 * by reactRendererEvidence, while markers prevent an import-only smoke test
 * from satisfying a renderer claim.
 */
const defaultRenderFixtures: readonly DefaultRenderFixture[] = [
  {
    componentId: "design-system-provider",
    marker: "data-hjm-provider",
    render: () => <HjmProvider systemTheme="light">Provider</HjmProvider>,
  },
  {
    componentId: "text",
    marker: "hjm-text",
    render: () => <Text>Text</Text>,
  },
  {
    componentId: "surface",
    marker: "hjm-surface",
    render: () => <Surface>Surface</Surface>,
  },
  {
    componentId: "icon",
    marker: "hjm-icon",
    render: () => <Icon name="info" />,
  },
  {
    componentId: "stack",
    marker: "hjm-stack",
    render: () => <Stack>Stack</Stack>,
  },
  {
    componentId: "grid",
    marker: "hjm-grid",
    render: () => (
      <Grid columns={{ compact: 1, medium: 2 }}>
        <span>First</span>
        <span>Second</span>
      </Grid>
    ),
  },
  {
    componentId: "layout",
    marker: "hjm-layout",
    render: () => <Layout>Primary content</Layout>,
  },
  {
    componentId: "button",
    marker: "hjm-button",
    render: () => <Button>Button</Button>,
  },
  {
    componentId: "icon-button",
    marker: "hjm-icon-button",
    render: () => <IconButton label="메뉴">☰</IconButton>,
  },
  {
    componentId: "field",
    marker: "hjm-field",
    render: () => (
      <>
        <Field controlId="default-field" label="Field">
          {(controlProps) => <input {...controlProps} />}
        </Field>
        <TextField label="Text field" />
      </>
    ),
  },
  {
    componentId: "search-field",
    marker: "type=\"search\"",
    render: () => <SearchField clearLabel="Clear search" label="Search" />,
  },
  {
    componentId: "text-area",
    marker: "textarea",
    render: () => <TextArea label="Notes" />,
  },
  {
    componentId: "password-field",
    marker: "hjm-password-field",
    render: () => (
      <PasswordField
        autofillHint="current"
        concealLabel="Hide password"
        label="Password"
        revealLabel="Show password"
      />
    ),
  },
  {
    componentId: "otp-field",
    marker: "hjm-otp-field__slots",
    render: () => <OtpField label="Verification code" length={6} />,
  },
  {
    componentId: "checkbox",
    marker: "type=\"checkbox\"",
    render: () => <Checkbox label="Checkbox" />,
  },
  {
    componentId: "radio",
    marker: "type=\"radio\"",
    render: () => <Radio label="Radio" name="default-radio" />,
  },
  {
    componentId: "checkbox-group",
    marker: "hjm-checkbox-group",
    render: () => (
      <CheckboxGroup label="Checkbox group" items={[{ id: "one", label: "One" }]} />
    ),
  },
  {
    componentId: "radio-group",
    marker: "hjm-radio-group",
    render: () => (
      <RadioGroup label="Radio group" items={[{ value: "one", label: "One" }]} />
    ),
  },
  {
    componentId: "switch",
    marker: "role=\"switch\"",
    render: () => <Switch label="Switch" />,
  },
  {
    componentId: "segmented-control",
    marker: "hjm-segmented",
    render: () => (
      <SegmentedControl label="Segmented" items={[{ value: "one", label: "One" }]} />
    ),
  },
  {
    componentId: "tabs",
    marker: "role=\"tablist\"",
    render: () => (
      <Tabs label="Tabs" items={[{ id: "one", label: "One", panel: "Panel" }]} />
    ),
  },
  {
    componentId: "bottom-navigation",
    marker: "hjm-bottom-navigation",
    render: () => (
      <BottomNavigation
        descriptor={{
          accessibilityLabel: "Primary navigation",
          items: [
            { id: "home", label: "Home", icon: { name: "home" } },
            { id: "profile", label: "Profile", icon: { name: "user" } },
          ],
          selectedKey: "home",
        }}
        getHref={({ id }) => `/${id}`}
        renderIcon={({ name }) => <span>{name}</span>}
      />
    ),
  },
  {
    componentId: "load-more",
    marker: "hjm-load-more",
    render: () => (
      <LoadMore
        descriptor={readyLoadMoreDescriptor}
        onLoadMore={async () => undefined}
      />
    ),
  },
  {
    componentId: "badge",
    marker: "hjm-badge",
    render: () => <Badge>Badge</Badge>,
  },
  {
    componentId: "counter-badge",
    marker: "hjm-counter-badge",
    render: () => <CounterBadge count={3} />,
  },
  {
    componentId: "card",
    marker: "hjm-card",
    render: () => <Card title="Card">Content</Card>,
  },
  {
    componentId: "list-row",
    marker: "hjm-list-row",
    render: () => <ListRow title="List row" />,
  },
  {
    componentId: "tag",
    marker: "hjm-tag",
    render: () => <Tag>Tag</Tag>,
  },
  {
    componentId: "timeline",
    marker: "hjm-timeline",
    render: () => (
      <Timeline
        composeAccessibleName={({ position, total, label }) =>
          `${position} of ${total}: ${label}`
        }
        items={[{ id: "created", label: "Created" }]}
      />
    ),
  },
  {
    componentId: "description-list",
    marker: "hjm-description-list",
    render: () => (
      <DescriptionList items={[{ id: "status", label: "Status", value: "Ready" }]} />
    ),
  },
  {
    componentId: "image",
    marker: "hjm-image",
    render: () => <Image src="/default-image.png" width={160} height={90} />,
  },
  {
    componentId: "empty-state",
    marker: "hjm-empty-state",
    render: () => <EmptyState title="Empty state" />,
  },
  {
    componentId: "result",
    marker: "hjm-result",
    render: () => <Result status="success" title="Saved" />,
  },
  {
    componentId: "toast",
    marker: "hjm-toast",
    render: () => (
      <Toast
        descriptor={{
          id: "default-toast",
          description: "Saved",
          closeLabel: "Close",
        }}
        onDismissRequest={() => undefined}
      />
    ),
  },
  {
    componentId: "select",
    marker: "role=\"combobox\"",
    render: () => (
      <Select
        emptySelectionLabel="No selection"
        label="Select"
        placeholder="Choose an option"
        items={[{ id: "one", label: "One", textValue: "One" }]}
      />
    ),
  },
  {
    componentId: "dialog",
    marker: "aria-haspopup=\"dialog\"",
    render: () => (
      <Dialog closeLabel="Close" trigger={<button type="button">Open</button>} title="Dialog" />
    ),
  },
  {
    componentId: "alert-dialog",
    marker: "aria-haspopup=\"dialog\"",
    render: () => (
      <AlertDialog
        trigger={<button type="button">Open alert</button>}
        request={{
          mode: "alert",
          title: "Alert",
          description: "Alert description",
          confirmLabel: "OK",
        }}
      />
    ),
  },
  {
    componentId: "sheet",
    marker: "aria-haspopup=\"dialog\"",
    render: () => (
      <Sheet closeLabel="Close" trigger={<button type="button">Open sheet</button>} title="Sheet" />
    ),
  },
  {
    componentId: "tooltip",
    marker: "hjm-tooltip",
    render: () => <Tooltip trigger={<button type="button">Help</button>} content="Help text" />,
  },
  {
    componentId: "menu",
    marker: "aria-haspopup=\"menu\"",
    render: () => (
      <Menu
        trigger={<button type="button">Open menu</button>}
        label="Menu"
        items={[{ id: "one", label: "One" }]}
      />
    ),
  },
];

describe("@hjm/react default renderer proofs", () => {
  it("keeps one executable default fixture for every evidence component", () => {
    const evidenceIds = reactRendererEvidence.components.map(({ componentId }) => componentId);
    const fixtureIds = defaultRenderFixtures.map(({ componentId }) => componentId);

    expect(fixtureIds).toEqual(evidenceIds);
    expect(new Set(fixtureIds).size).toBe(fixtureIds.length);
  });

  it.each(defaultRenderFixtures)("$componentId", ({ componentId, marker, render }) => {
    const component = render();
    const tree = componentId === "design-system-provider"
      ? component
      : <HjmProvider systemTheme="light">{component}</HjmProvider>;
    expect(renderToStaticMarkup(tree), componentId).toContain(marker);
  });
});
