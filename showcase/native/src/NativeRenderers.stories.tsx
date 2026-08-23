import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Button, BottomCTA, IconButton } from "@hjm/react-native/actions";
import {
  Accordion,
  Badge,
  Card,
  CounterBadge,
  DescriptionList,
  Divider,
  Image,
  List,
  ListRow,
  Statistic,
  Tag,
  Timeline,
} from "@hjm/react-native/data-display";
import {
  EmptyState,
  Notice,
  Progress,
  Result,
  Skeleton,
  ToastRegion,
  useToastRegion,
} from "@hjm/react-native/feedback";
import { Combobox, Field, Select } from "@hjm/react-native/forms";
import {
  Checkbox,
  CheckboxGroup,
  Chip,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Switch,
  TextArea,
} from "@hjm/react-native/inputs";
import {
  BottomNavigation,
  LoadMore,
  Menu,
  Tabs,
  TopBar,
  TopBarAction,
} from "@hjm/react-native/navigation";
import { AlertDialog, Dialog, Sheet } from "@hjm/react-native/overlays";
import {
  Grid,
  Icon,
  Layout,
  Section,
  Stack,
  Surface,
  Text,
} from "@hjm/react-native/primitives";

import { nativeRendererStoryGroups } from "./story-registry";

const noop = () => undefined;

function StoryFrame({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={styles.frame}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

function StoryHeading({ children }: { children: string }) {
  return <Text accessibilityRole="header" emphasis="strong" variant="heading">{children}</Text>;
}

function Glyph({ name }: { name: string }) {
  return <Text tone="muted">{name.slice(0, 1).toUpperCase()}</Text>;
}

function FoundationsPreview() {
  return (
    <StoryFrame>
      <StoryHeading>Foundations and layout</StoryHeading>
      <Text tone="muted">Provider, type, semantic icon, surfaces and responsive layout.</Text>
      <Stack axis="inline" align="center" gap="sm" wrap>
        <Icon descriptor={{ name: "success", decorative: true }} renderGlyph={({ name }) => <Glyph name={name} />} />
        <Text emphasis="strong">Semantic content</Text>
      </Stack>
      <Surface bordered padding="md" tone="subtle">
        <Text>Surface keeps shared padding and radius.</Text>
      </Surface>
      <Section title="Section" description="Header and body retain reading order.">
        <Text>Section body</Text>
      </Section>
      <Divider />
      <Grid availableWidth={320} columns={{ compact: 2 }} gap={{ compact: "sm" }}>
        <Surface key="one" bordered padding="sm"><Text>Grid one</Text></Surface>
        <Surface key="two" bordered padding="sm"><Text>Grid two</Text></Surface>
      </Grid>
      <Layout
        style={styles.layout}
        header={<Text emphasis="strong">Layout header</Text>}
        footer={<Text tone="muted">Layout footer</Text>}
      >
        <Text>Layout main content</Text>
      </Layout>
    </StoryFrame>
  );
}

function ActionsPreview() {
  const [count, setCount] = useState(0);
  return (
    <StoryFrame>
      <StoryHeading>Actions</StoryHeading>
      <Stack axis="inline" gap="sm" wrap>
        <Button onPress={() => setCount((value) => value + 1)}>Primary</Button>
        <Button tone="secondary" onPress={noop}>Secondary</Button>
        <Button disabled onPress={noop}>Disabled</Button>
        <IconButton label="Add one" onPress={() => setCount((value) => value + 1)}>
          <Text>＋</Text>
        </IconButton>
      </Stack>
      <Text tone="muted">Pressed {count} times</Text>
      <BottomCTA
        primaryAction={{ label: "Continue", onPress: noop }}
        secondaryAction={{ label: "Later", onPress: noop }}
        description="Actions wrap instead of clipping at large text sizes."
      />
    </StoryFrame>
  );
}

function InputsPreview() {
  const [query, setQuery] = useState("김도영");
  const [notes, setNotes] = useState("여러 줄 입력도 공통 필드 계약을 사용합니다.");
  const [checked, setChecked] = useState(false);
  const [checks, setChecks] = useState<ReadonlySet<string>>(new Set(["email"]));
  const [radio, setRadio] = useState<string | null>("standard");
  const [switched, setSwitched] = useState(true);
  const [segment, setSegment] = useState("list");
  const [chip, setChip] = useState(false);
  const [select, setSelect] = useState<string | null>("ko");
  const [city, setCity] = useState<string | null>(null);
  return (
    <StoryFrame>
      <StoryHeading>Inputs and forms</StoryHeading>
      <Field label="Custom field" description="The frame also supports custom controls.">
        {(controlProps) => <TextInput {...controlProps} defaultValue="Custom value" style={styles.customInput} />}
      </Field>
      <SearchField
        busyLabel="Searching"
        clearLabel="Clear search"
        label="Search"
        value={query}
        onValueChange={setQuery}
        onClear={() => setQuery("")}
      />
      <TextArea label="Notes" value={notes} onValueChange={setNotes} />
      <Checkbox label="Accept terms" checked={checked} onCheckedChange={setChecked} />
      <CheckboxGroup
        label="Channels"
        value={checks}
        onValueChange={setChecks}
        items={[
          { id: "email", label: "Email" },
          { id: "push", label: "Push" },
        ]}
      />
      <RadioGroup
        label="Delivery"
        value={radio}
        onValueChange={setRadio}
        options={[
          { value: "standard", label: "Standard" },
          { value: "express", label: "Express" },
        ]}
      />
      <Switch label="Notifications" value={switched} onValueChange={setSwitched} />
      <Chip label="Featured" selected={chip} onPress={setChip} selectionMode="multiple" />
      <SegmentedControl
        label="View"
        value={segment}
        onValueChange={setSegment}
        options={[
          { value: "list", label: "List" },
          { value: "grid", label: "Grid" },
        ]}
      />
      <Select
        dismissLabel="Close"
        label="Language"
        placeholder="Choose a language"
        selectedKey={select}
        onSelectionChange={setSelect}
        items={[
          { id: "ko", label: "Korean", textValue: "Korean" },
          { id: "en", label: "English", textValue: "English" },
        ]}
      />
      <Combobox
        clearLabel="Clear city"
        dismissLabel="Close"
        emptyMessage="No cities"
        label="City"
        loadingMessage="Loading cities"
        placeholder="Choose a city"
        selectedKey={city}
        onSelectionChange={setCity}
        items={[
          { id: "seoul", label: "Seoul", textValue: "Seoul" },
          { id: "busan", label: "Busan", textValue: "Busan" },
        ]}
      />
    </StoryFrame>
  );
}

function NavigationPreview() {
  const [tab, setTab] = useState("recent");
  const [destination, setDestination] = useState("home");
  const [loads, setLoads] = useState(0);
  return (
    <StoryFrame>
      <StoryHeading>Navigation</StoryHeading>
      <TopBar
        title="HJM"
        actions={<TopBarAction label="Refresh" onPress={noop}><Text>↻</Text></TopBarAction>}
      />
      <Tabs
        label="Feed view"
        value={tab}
        onValueChange={setTab}
        options={[
          { value: "recent", label: "Recent" },
          { value: "popular", label: "Popular" },
        ]}
      />
      <BottomNavigation
        descriptor={{
          accessibilityLabel: "Primary destinations",
          selectedKey: destination,
          items: [
            { id: "home", label: "Home", icon: { name: "home" } },
            { id: "profile", label: "Profile", icon: { name: "user" } },
          ],
        }}
        onActivate={({ key }) => setDestination(key)}
        renderIcon={({ name }) => <Glyph name={name} />}
      />
      <Menu
        dismissLabel="Close"
        triggerLabel="More actions"
        items={[
          { value: "edit", label: "Edit" },
          { value: "delete", label: "Delete", tone: "danger" },
        ]}
        onSelect={noop}
      />
      <LoadMore
        descriptor={{
          labels: {
            complete: "Everything loaded",
            loading: "Loading more",
            loadMore: "Load more",
            retry: "Retry",
          },
          state: { status: "ready", requestKey: `page-${loads}` },
        }}
        mode="manual"
        onLoadMore={async () => setLoads((value) => value + 1)}
      />
    </StoryFrame>
  );
}

function DataDisplayPreview() {
  return (
    <StoryFrame>
      <StoryHeading>Data display</StoryHeading>
      <Stack axis="inline" gap="sm" align="center" wrap>
        <Badge label="Live" tone="success" />
        <CounterBadge count={128} accessibilityLabel="128 unread items" />
        <Tag tone="info">Featured</Tag>
      </Stack>
      <Card
        leading={<Text aria-hidden>✨</Text>}
        title="Generated app"
        description="Shared padding and hierarchy remain stable with longer descriptive copy."
        tone="accent"
      >
        <Text>Composable body content</Text>
      </Card>
      <List label="Recent items">
        <ListRow title="Morning loop" description="Updated just now" onPress={noop} />
        <ListRow title="Night signal" description="Updated yesterday" onPress={noop} />
      </List>
      <Accordion
        label="Details"
        items={[{ value: "details", title: "Details", content: <Text>Expandable content</Text> }]}
      />
      <Statistic descriptor={{ id: "views", label: "Views", value: "12.4K" }} />
      <Timeline
        composeAccessibleName={({ position, total, label }) => `${position} of ${total}, ${label}`}
        items={[
          { id: "created", label: "Created", timestamp: "09:30", tone: "success" },
          { id: "shared", label: "Shared", timestamp: "10:15", tone: "info" },
        ]}
      />
      <DescriptionList
        availableWidth={320}
        label="Creation metadata"
        descriptor={{ items: [
          { id: "status", label: "Status", value: "Ready" },
          { id: "owner", label: "Owner", value: "HJM" },
        ] }}
      />
      <Image
        accessibilityLabel="Blue preview placeholder"
        decorative={false}
        height={180}
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL3WQAAAABJRU5ErkJggg=="
        width={320}
      />
    </StoryFrame>
  );
}

function ToastTrigger() {
  const toast = useToastRegion();
  return (
    <Button
      onPress={() => toast.show({
        id: `toast-${Date.now()}`,
        description: "Saved with the canonical Toast renderer.",
        durationMs: null,
        closeLabel: "Dismiss notification",
      })}
    >
      Publish toast
    </Button>
  );
}

function FeedbackPreview() {
  return (
    <StoryFrame>
      <StoryHeading>Feedback</StoryHeading>
      <EmptyState title="No drafts" description="Create a draft to see it here." action={<Button onPress={noop}>Create draft</Button>} />
      <Notice title="Ready to publish" description="All checks passed." tone="success" />
      <Progress label="Upload progress" value={0.64} />
      <Skeleton accessibilityLabel="Loading preview" width="100%" height={52} />
      <Result status="success" title="Published" description="Your creation is live." />
      <ToastRegion><ToastTrigger /></ToastRegion>
    </StoryFrame>
  );
}

function OverlaysPreview() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <StoryFrame>
      <StoryHeading>Overlays</StoryHeading>
      <Button onPress={() => setDialogOpen(true)}>Open dialog</Button>
      <Button tone="secondary" onPress={() => setAlertOpen(true)}>Open alert dialog</Button>
      <Button tone="secondary" onPress={() => setSheetOpen(true)}>Open sheet</Button>
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Edit item"
        description="Canonical dialog renderer."
        closeLabel="Close"
        primaryAction={{ label: "Save", onPress: () => setDialogOpen(false) }}
      ><Text>Dialog content</Text></Dialog>
      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        request={{
          mode: "confirm",
          tone: "danger",
          title: "Delete item?",
          description: "This action cannot be undone.",
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
        }}
      />
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Share item"
        description="Adaptive bottom sheet."
        closeLabel="Close"
      ><Text>Sheet content</Text></Sheet>
    </StoryFrame>
  );
}

const meta = {
  title: "HJM Native/Renderer Gallery",
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundations: Story = { parameters: { hjm: { componentIds: nativeRendererStoryGroups.foundations } }, render: () => <FoundationsPreview /> };
export const Actions: Story = { parameters: { hjm: { componentIds: nativeRendererStoryGroups.actions } }, render: () => <ActionsPreview /> };
export const Inputs: Story = { parameters: { hjm: { componentIds: nativeRendererStoryGroups.inputs } }, render: () => <InputsPreview /> };
export const Navigation: Story = { parameters: { hjm: { componentIds: nativeRendererStoryGroups.navigation } }, render: () => <NavigationPreview /> };
export const DataDisplay: Story = { parameters: { hjm: { componentIds: nativeRendererStoryGroups.dataDisplay } }, render: () => <DataDisplayPreview /> };
export const Feedback: Story = { parameters: { hjm: { componentIds: nativeRendererStoryGroups.feedback } }, render: () => <FeedbackPreview /> };
export const Overlays: Story = { parameters: { hjm: { componentIds: nativeRendererStoryGroups.overlays } }, render: () => <OverlaysPreview /> };

const styles = StyleSheet.create({
  customInput: { borderColor: "#667085", borderRadius: 12, borderWidth: 1, minHeight: 44, paddingHorizontal: 16 },
  frame: { gap: 16, paddingBottom: 48 },
  layout: { minHeight: 144 },
});
