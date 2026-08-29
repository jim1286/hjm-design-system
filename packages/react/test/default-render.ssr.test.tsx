import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  Accordion,
  AlertDialog,
  Avatar,
  Badge,
  BottomNavigation,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Chip,
  Combobox,
  CounterBadge,
  DescriptionList,
  DatePicker,
  Dialog,
  Divider,
  EmptyState,
  Field,
  FilePicker,
  Form,
  Grid,
  HjmProvider,
  Icon,
  IconButton,
  Image,
  Layout,
  Link,
  List,
  ListRow,
  LoadMore,
  Menu,
  Notice,
  NumberField,
  OtpField,
  PasswordField,
  Progress,
  Radio,
  RadioGroup,
  Result,
  SearchField,
  SegmentedControl,
  Section,
  Select,
  Sheet,
  Skeleton,
  Slider,
  Spinner,
  Stack,
  Steps,
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
  Statistic,
  UploadItem,
} from "../src/index.js";
import { reactRendererEvidence } from "../src/evidence.js";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };

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

const defaultCalendarGrid = {
  cells: [
    ...Array.from({ length: 3 }, () => ({})),
    ...Array.from({ length: 28 }, (_, index) => ({ date: `2027-02-${String(index + 1).padStart(2, "0")}` })),
    ...Array.from({ length: 4 }, () => ({})),
  ],
  weekdayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  todayDate: "2027-02-19",
} as const;

const rendererEnvironments = executedScenarioRegistry.executions[0]!.scenarios as readonly Readonly<{
  id: "default" | "dark" | "long-copy" | "large-text" | "rtl" | "reduced-motion" | "accessibility";
  theme: "light" | "dark";
  direction: "ltr" | "rtl";
  textScale: number;
  reducedMotion: boolean;
}>[];

const longCopy = "아주 긴 제품 설명과 unexpectedly long English content must wrap without hiding the component meaning or required action.";

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
    componentId: "link",
    marker: "hjm-link",
    render: () => <Link href="/docs">Docs</Link>,
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
    componentId: "number-field",
    marker: "hjm-number-field",
    render: () => (
      <NumberField
        decrementLabel="Decrease"
        incrementLabel="Increase"
        label="Quantity"
        min={0}
        max={10}
      />
    ),
  },
  {
    componentId: "slider",
    marker: "hjm-slider",
    render: () => <Slider label="Score" min={0} max={10} />,
  },
  {
    componentId: "form",
    marker: "hjm-form",
    render: () => <Form onSubmit={() => undefined}><TextField label="Name" /></Form>,
  },
  {
    componentId: "date-picker",
    marker: "hjm-date-picker",
    render: () => (
      <DatePicker
        clearLabel="Clear date"
        closeLabel="Close calendar"
        composeAccessibleName={({ date }) => date}
        descriptor={{
          grid: defaultCalendarGrid,
          displayValue: null,
          placeholder: "Choose a date",
          label: "Date",
          selectedDate: null,
          onSelectionChange: () => undefined,
          open: false,
          onOpenChange: () => undefined,
        }}
        monthLabel="February 2027"
      />
    ),
  },
  {
    componentId: "file-picker",
    marker: "hjm-file-picker",
    render: () => (
      <FilePicker
        buttonLabel="Choose files"
        descriptor={{ mode: "multiple", accept: ["image/*"] }}
        dropzoneLabel="Drop files here"
        label="Attachments"
        onSelect={() => undefined}
      />
    ),
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
    componentId: "chip",
    marker: "hjm-chip",
    render: () => <Chip label="Filter" />,
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
    componentId: "steps",
    marker: "hjm-steps",
    render: () => (
      <Steps
        composeAccessibleName={({ position, total, label }) => `${position} of ${total}: ${label}`}
        descriptor={{ steps: [{ id: "account", label: "Account" }, { id: "profile", label: "Profile" }], currentStepId: "profile" }}
        statusLabels={{ pending: "Pending", current: "Current", complete: "Complete", error: "Error" }}
      />
    ),
  },
  {
    componentId: "badge",
    marker: "hjm-badge",
    render: () => <Badge>Badge</Badge>,
  },
  {
    componentId: "avatar",
    marker: "hjm-avatar",
    render: () => <Avatar name="Ada Lovelace" />,
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
    componentId: "list",
    marker: "hjm-list",
    render: () => <List label="Items"><ListRow title="List row" /></List>,
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
    componentId: "accordion",
    marker: "hjm-accordion",
    render: () => (
      <Accordion
        aria-label="Help"
        items={[{ id: "shipping", title: "Shipping", panel: "Arrives tomorrow" }]}
      />
    ),
  },
  {
    componentId: "divider",
    marker: "hjm-divider",
    render: () => <Divider />,
  },
  {
    componentId: "statistic",
    marker: "hjm-statistic",
    render: () => <Statistic descriptor={{ id: "orders", label: "Orders", value: "12" }} />,
  },
  {
    componentId: "section",
    marker: "hjm-section",
    render: () => <Section title="Section">Content</Section>,
  },
  {
    componentId: "upload-item",
    marker: "hjm-upload-item",
    render: () => (
      <UploadItem
        descriptor={{ id: "photo", name: "photo.png", sizeLabel: "1.2 MB", state: { status: "uploading", progress: 0.4 } }}
        labels={{ pending: "Pending", uploading: "Uploading", success: "Complete", cancel: "Cancel", retry: "Retry" }}
        onCancel={() => undefined}
      />
    ),
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
    componentId: "notice",
    marker: "hjm-notice",
    render: () => <Notice title="Notice" />,
  },
  {
    componentId: "progress",
    marker: "hjm-progress",
    render: () => <Progress label="Upload" value={45} valueText="45%" />,
  },
  {
    componentId: "spinner",
    marker: "hjm-spinner",
    render: () => <Spinner label="Loading" />,
  },
  {
    componentId: "skeleton",
    marker: "hjm-skeleton",
    render: () => <Skeleton />,
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
    componentId: "combobox",
    marker: "hjm-combobox",
    render: () => (
      <Combobox
        emptyMessage="No results"
        items={[{ value: "seoul", label: "Seoul" }]}
        label="City"
        loadingMessage="Loading"
        selectionRequiredMessage="Choose a city"
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

describe("@hjmds/react default renderer proofs", () => {
  it("keeps one executable default fixture for every evidence component", () => {
    const evidenceIds = reactRendererEvidence.components.map(({ componentId }) => componentId);
    const fixtureIds = defaultRenderFixtures.map(({ componentId }) => componentId);

    expect(fixtureIds).toEqual(evidenceIds);
    expect(new Set(fixtureIds).size).toBe(fixtureIds.length);
    expect(executedScenarioRegistry.executions[0]?.coverageMode).toBe("all-cases");
    expect(executedScenarioRegistry.executions[0]?.proofFile).toBe("test/default-render.ssr.test.tsx");
    expect(rendererEnvironments.map(({ id }) => id)).toEqual(reactRendererEvidence.components[0]?.scenarios);
  });

  it.each(defaultRenderFixtures)("$componentId", ({ componentId, marker, render }) => {
    for (const environment of rendererEnvironments) {
      const html = renderToStaticMarkup(
        <HjmProvider
          direction={environment.direction}
          reducedMotion={environment.reducedMotion}
          systemTheme={environment.theme}
          textScale={environment.textScale}
          theme={environment.theme}
        >
          <div aria-label={environment.id === "long-copy" ? longCopy : undefined} style={{ maxWidth: 320 }}>
            {render()}
          </div>
        </HjmProvider>,
      );
      expect(html, `${componentId}:${environment.id}`).toContain(marker);
      expect(html).toContain(`data-theme="${environment.theme}"`);
      expect(html).toContain(`data-text-scale="${environment.textScale}"`);
      expect(html).toContain(`dir="${environment.direction}"`);
      expect(html).toContain(`data-motion="${environment.reducedMotion ? "reduced" : "full"}"`);
      if (environment.id === "accessibility") {
        expect(html).not.toContain('aria-label=""');
        expect(html).not.toContain('aria-describedby=""');
      }
      if (environment.id === "long-copy") expect(html).toContain(longCopy);
    }
  });
});
