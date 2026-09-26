import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import {
  AuthProviderButton,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  EmptyState,
  HjmProvider,
  IconButton,
  Icon,
  Link,
  ListRow,
  Notice,
  Progress,
  RadioGroup,
  SegmentedControl,
  Skeleton,
  Spinner,
  Stack,
  Surface,
  Switch,
  Tag,
  Text,
  TextArea,
  TextField,
  Toast,
} from "../src/index.js";
import { Heading } from "../src/heading.js";
import "../src/styles.css";

/**
 * Visual baselines for the components three or more products use. Rendered with
 * reduced motion so no frame is caught mid-animation. See vitest.visual.config.ts
 * for why this runs only on the CI image.
 */
const galleries: Readonly<Record<string, () => ReactNode>> = {
  actions: () => (
    <Stack gap="sm">
      <Button>Primary</Button>
      <Button tone="secondary">Secondary</Button>
      <Button tone="ghost">Ghost</Button>
      <Button tone="danger">Delete</Button>
      <Button disabled>Disabled</Button>
      <IconButton label="Close"><Icon name="close" /></IconButton>
      <Link href="/docs">Documentation</Link>
      <AuthProviderButton descriptor={{ provider: "google", label: "Continue with Google" }} logo={<span>G</span>} />
    </Stack>
  ),
  forms: () => (
    <Stack gap="md">
      <TextField label="Name" defaultValue="Ada Lovelace" description="Shown on your profile" />
      <TextField label="Email" defaultValue="ada@" error="Enter a full address" />
      <TextField label="Locked" defaultValue="Read only" disabled />
      <TextArea label="Notes" defaultValue="Two short lines of notes." />
      <Checkbox label="Remember me" defaultChecked />
      <Switch label="Notifications" defaultChecked />
      <RadioGroup label="Plan" defaultValue="pro" items={[{ value: "free", label: "Free" }, { value: "pro", label: "Pro" }]} />
      <SegmentedControl label="View" defaultValue="list" items={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} />
    </Stack>
  ),
  display: () => (
    <Stack gap="md">
      <Heading level="level2">Weekly summary</Heading>
      <Text>Body copy that wraps across the available width of the gallery column.</Text>
      <Stack axis="inline" gap="xs"><Tag>Tag</Tag><Badge>New</Badge><Chip label="Filter" /></Stack>
      <Card title="Card title">Card content</Card>
      <Surface><Text>Surface</Text></Surface>
      <ListRow title="List row" description="Supporting text" />
    </Stack>
  ),
  feedback: () => (
    <Stack gap="md">
      <Notice title="Heads up" description="Something needs your attention." />
      <Progress label="Upload" value={45} valueText="45%" />
      <Spinner label="Loading" />
      <Skeleton />
      <EmptyState title="Nothing here yet" description="Items you save appear here." />
      <Toast descriptor={{ id: "saved", title: "Saved", description: "Changes saved.", closeLabel: "Close" }} onDismissRequest={() => undefined} />
    </Stack>
  ),
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  container.style.width = "360px";
  document.body.style.margin = "0";
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe.each(["light", "dark"] as const)("core visual baseline (%s)", (theme) => {
  it.each(Object.keys(galleries))("%s", async (name) => {
    await act(async () => root.render(
      <HjmProvider theme={theme} systemTheme={theme} reducedMotion>
        <div style={{ padding: 16 }}>{galleries[name]!()}</div>
      </HjmProvider>,
    ));
    await document.fonts.ready;
    const provider = container.querySelector<HTMLElement>("[data-hjm-provider]")!;
    await expect.element(page.elementLocator(provider)).toMatchScreenshot(`${name}-${theme}`);
  });
});
