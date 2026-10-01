// Component fixtures are kept separate from CSF modules so importing a preview never registers a second story.
import { Agreement } from "@hjmds/react-native/agreement";
import { Heading } from "@hjmds/react-native/heading";
import { ToggleGroup } from "@hjmds/react-native/toggle-group";
import { BottomInfo } from "@hjmds/react-native/bottom-info";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { Asset } from "@hjmds/react-native/asset";
import { AuthProviderButton } from "@hjmds/react-native/provider-button";
import { AuthScreenLayout } from "@hjmds/react-native/auth-screen";
import { Carousel } from "@hjmds/react-native/carousel";
import { Top } from "@hjmds/react-native/top";
import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Button, BottomCTA, IconButton, Link } from "@hjmds/react-native/actions";
import {
  Accordion,
  Avatar,
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
} from "@hjmds/react-native/data-display";
import {
  EmptyState,
  Notice,
  Progress,
  Result,
  Skeleton,
  Spinner,
  ToastRegion,
  useToastRegion,
} from "@hjmds/react-native/feedback";
import { Combobox, Field, Form, Select } from "@hjmds/react-native/forms";
import { NumberField } from "@hjmds/react-native/number-field";
import { DatePicker } from "@hjmds/react-native/date-picker";
import { TagsInput } from "@hjmds/react-native/tags-input";
import { DateRangePicker } from "@hjmds/react-native/date-range";
import { Mentions } from "@hjmds/react-native/mentions";
import { TransferList } from "@hjmds/react-native/transfer-list";
import { FilePicker } from "@hjmds/react-native/file-picker";
import { OtpField } from "@hjmds/react-native/otp-field";
import { PasswordField } from "@hjmds/react-native/password-field";
import {
  Checkbox,
  CheckboxGroup,
  Chip,
  Radio,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Switch,
  TextArea,
} from "@hjmds/react-native/inputs";
import { Slider } from "@hjmds/react-native/slider";
import { Steps } from "@hjmds/react-native/steps";
import { UploadItem } from "@hjmds/react-native/upload-item";
import {
  BottomNavigation,
  LoadMore,
  Menu,
  Tabs,
  TopBar,
  TopBarAction,
} from "@hjmds/react-native/navigation";
import { AlertDialog, Dialog, Sheet } from "@hjmds/react-native/overlays";
import {
  AspectRatio,
  Container,
  Grid,
  Icon,
  Layout,
  Section,
  Stack,
  Surface,
  Text,
} from "@hjmds/react-native/primitives";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { FloatingActionButton } from "@hjmds/react-native/floating-action-button";
const noop = () => undefined;

const previewCalendarGrid = {
  cells: [
    ...Array.from({ length: 1 }, () => ({})),
    ...Array.from({ length: 28 }, (_, index) => ({ date: `2027-02-${String(index + 1).padStart(2, "0")}` })),
    ...Array.from({ length: 6 }, () => ({})),
  ],
  weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"],
  todayDate: "2027-02-19",
} as const;

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


function ToastTrigger() {
  const toast = useToastRegion();
  return (
    <Button
      onPress={() => toast.publish({
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


type PreviewVariant = "default" | "disabled" | "loading" | "error";
function DesignSystemProviderExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><HjmNativeProvider theme="dark"><Surface padding="md"><Text>Provider supplies theme, text scale and direction.</Text></Surface></HjmNativeProvider></StoryFrame>);
}

function TextExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Text tone="muted">Provider, type, semantic icon, surfaces and responsive layout.</Text></StoryFrame>);
}

function SurfaceExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Surface bordered padding="md" tone="subtle">
        <Text>Surface keeps shared padding and radius.</Text>
      </Surface></StoryFrame>);
}

function StackExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Stack axis="inline" align="center" gap="sm" wrap>
        <Icon descriptor={{ name: "success", decorative: true }} renderGlyph={({ name }) => <Glyph name={name} />} />
        <Text emphasis="strong">Semantic content</Text>
      </Stack></StoryFrame>);
}

function ContainerExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Container gutter="compact" size="reading">
        <Text tone="muted">Container centers readable content with shared logical gutters.</Text>
      </Container></StoryFrame>);
}

function AspectRatioExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><AspectRatio ratio="wide">
          <View style={styles.mediaFrameContent}><Text tone="muted">16:9 media frame</Text></View>
        </AspectRatio></StoryFrame>);
}

function GridExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Grid availableWidth={320} columns={{ compact: 2 }} gap={{ compact: "sm" }}>
        <Surface key="one" bordered padding="sm"><Text>Grid one</Text></Surface>
        <Surface key="two" bordered padding="sm"><Text>Grid two</Text></Surface>
      </Grid></StoryFrame>);
}

function LayoutExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Layout
        style={styles.layout}
        header={<Text emphasis="strong">Layout header</Text>}
        footer={<Text tone="muted">Layout footer</Text>}
      >
        <Text>Layout main content</Text>
      </Layout></StoryFrame>);
}

function IconExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Icon descriptor={{ name: "success", decorative: true }} renderGlyph={({ name }) => <Glyph name={name} />} /></StoryFrame>);
}

function SectionExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Section title="Section" description="Header and body retain reading order.">
        <Text>Section body</Text>
      </Section></StoryFrame>);
}

function DividerExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Divider /></StoryFrame>);
}

function TopExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Top
        descriptor={{
          eyebrow: "Getting started",
          title: "Top opens the body, TopBar stays fixed",
          description: "The screen's own first heading scrolls away with the content.",
        }}
      /></StoryFrame>);
}

function HeadingExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Heading level="level2">Heading exposes the display scale</Heading></StoryFrame>);
}

function AuthScreenExample({ variant }: { variant: PreviewVariant }) {
const [pending, setPending] = useState(false);
return (<AuthScreenLayout mainCard
        {...(pending || variant === "loading" ? { pendingLabel: "로그인 중" } : {})}
        hero={<Text>Product mark, title and description</Text>}
        main={
          <Stack gap="sm">{([
            { provider: "kakao", label: "카카오", mark: "K" },
            { provider: "naver", label: "네이버", mark: "N" },
            { provider: "google", label: "Google", mark: "G" },
            { provider: "apple", label: "Apple", mark: "A" },
          ] as const).map(item => <AuthProviderButton key={item.provider}
            descriptor={{ provider: item.provider, label: item.label }} logo={<Text>{item.mark}</Text>}
            // Preview delay only; real products clear pending from the authentication result.
            onPress={() => { setPending(true); setTimeout(() => setPending(false), 1200); }} />)}</Stack>
        }
        footer={<Text tone="muted">Terms · Privacy</Text>}
      />);
}

function ButtonExample({ variant }: { variant: PreviewVariant }) {
const [count, setCount] = useState(0);
return (<StoryFrame><Button disabled={variant === "disabled"} loading={variant === "loading"} onPress={() => setCount((value) => value + 1)}>Primary</Button><Text accessibilityLiveRegion="polite">Pressed {count} times</Text></StoryFrame>);
}

function IconButtonExample({ variant }: { variant: PreviewVariant }) {
const [count, setCount] = useState(0);
return (<StoryFrame><IconButton disabled={variant === "disabled"} loading={variant === "loading"} label="Add one" onPress={() => setCount((value) => value + 1)}>
          <Text>＋</Text>
        </IconButton><Text accessibilityLiveRegion="polite">Pressed {count} times</Text></StoryFrame>);
}

function LinkExample({ variant }: { variant: PreviewVariant }) {
const [action, setAction] = useState("None");
return (<StoryFrame><Link
        descriptor={{ label: "Open component docs", destination: { kind: "internal", href: "/components" } }}
        onNavigate={() => setAction("Open component docs")}
      /><Text accessibilityLiveRegion="polite">Last action: {action}</Text></StoryFrame>);
}

function BottomCtaExample({ variant }: { variant: PreviewVariant }) {
const [action, setAction] = useState("None");
return (<StoryFrame><BottomCTA
        primaryAction={{ label: "Continue", onPress: () => setAction("Continue") }}
        secondaryAction={{ label: "Later", onPress: () => setAction("Later") }}
        description="Actions wrap instead of clipping at large text sizes."
      /></StoryFrame>);
}

function AuthProviderButtonExample({ variant }: { variant: PreviewVariant }) {
const [action, setAction] = useState("None");
return (<StoryFrame><AuthProviderButton
        descriptor={{ label: "Google", provider: "google" }}
        logo={<Text>G</Text>}
        onPress={() => setAction("Provider login requested")}
      /><Text accessibilityLiveRegion="polite">Last action: {action}</Text></StoryFrame>);
}

function AgreementExample({ variant }: { variant: PreviewVariant }) {
const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
const [detail, setDetail] = useState("None");
return (<StoryFrame><Agreement
        checkedIds={checked}
        onCheckedIdsChange={setChecked}
        onDetail={(id) => setDetail(id)}
        optionalLabel="(optional)"
        requiredLabel="(required)"
        descriptor={{
          accessibilityLabel: "Sign-up agreements",
          allLabel: "Agree to everything",
          items: [
            { id: "terms", label: "Terms of service", required: true, detail: { label: "Read" } },
            { id: "privacy", label: "Privacy policy", required: true, detail: { label: "Read" } },
            { id: "marketing", label: "Marketing updates", description: "You can turn this off any time." },
          ],
        }}
      /></StoryFrame>);
}

function FieldExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Field disabled={variant === "disabled"} error={variant === "error" ? "Please check this value." : ""} label="Custom field" description="The frame also supports custom controls.">
        {(controlProps) => <TextInput {...controlProps} defaultValue="Custom value" style={styles.customInput} />}
      </Field></StoryFrame>);
}

function SearchFieldExample({ variant }: { variant: PreviewVariant }) {
const [query, setQuery] = useState("김도영");
return (<StoryFrame><SearchField
        busyLabel="Searching"
        clearLabel="Clear search"
        label="Search"
        value={query}
        onValueChange={setQuery}
        onClear={() => setQuery("")}
      /></StoryFrame>);
}

function TextAreaExample({ variant }: { variant: PreviewVariant }) {
const [notes, setNotes] = useState("여러 줄 입력도 공통 필드 계약을 사용합니다.");
return (<StoryFrame><TextArea label="Notes" value={notes} onValueChange={setNotes} /></StoryFrame>);
}

function PasswordFieldExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><PasswordField
        autofillHint="current"
        concealLabel="Hide password"
        defaultValue="hjm-password"
        label="Password"
        revealLabel="Show password"
        description="Reveal state never changes the password value."
      /></StoryFrame>);
}

function OtpFieldExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><OtpField
        defaultValue="128"
        label="Verification code"
        length={6}
        description="Type or paste the full six-digit code."
      /></StoryFrame>);
}

function NumberFieldExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><NumberField
        decrementLabel="Decrease quantity"
        defaultValue={2}
        incrementLabel="Increase quantity"
        label="Quantity"
        min={0}
        max={10}
      /></StoryFrame>);
}

function SliderExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Slider
        decrementLabel="Decrease completion"
        defaultValue={72}
        incrementLabel="Increase completion"
        label="Completion"
        min={0}
        max={100}
        getValueText={(value) => `${value}%`}
      /></StoryFrame>);
}

function FormExample({ variant }: { variant: PreviewVariant }) {
const [query, setQuery] = useState("김도영");
const [saved, setSaved] = useState(0);
return (<StoryFrame><Form
        fallbackErrorMessage="Could not save"
        label="Profile form"
        onSubmit={() => setSaved((value) => value + 1)}
        submitLabel="Save profile"
        values={{ query }}
      >
        <Text tone="muted">Saved {saved} times. Form owns submit feedback while products own values.</Text>
      </Form></StoryFrame>);
}

function DatePickerExample({ variant }: { variant: PreviewVariant }) {
const [visitDate, setVisitDate] = useState<string | null>(null);
return (<StoryFrame><DatePicker
        clearLabel="Clear date"
        closeLabel="Close calendar"
        composeAccessibleName={({ date, isToday, isSelected }) => `${date}${isToday ? ", today" : ""}${isSelected ? ", selected" : ""}`}
        descriptor={{ grid: previewCalendarGrid, displayValue: visitDate, placeholder: "Choose a date", label: "Visit date", selectedDate: visitDate, onSelectionChange: setVisitDate, defaultOpen: false }}
        monthLabel="February 2027"
      /></StoryFrame>);
}

function FilePickerExample({ variant }: { variant: PreviewVariant }) {
const [picked, setPicked] = useState("None");
return (<StoryFrame><FilePicker
        buttonLabel="Choose images"
        descriptor={{ mode: "multiple", accept: ["image/*"], maxCount: 4 }}
        hint="PNG or JPG, up to four"
        label="Attachments"
        onPick={async () => [{ id: "preview", name: "preview.png", mimeType: "image/png", sizeBytes: 1024 }]}
        onPickError={noop}
        onSelect={(files) => setPicked(files.accepted.map((file) => file.name).join(", "))}
      /><Text accessibilityLiveRegion="polite">Selected attachment: {picked}</Text></StoryFrame>);
}

function CheckboxExample({ variant }: { variant: PreviewVariant }) {
const [checked, setChecked] = useState(false);
return (<StoryFrame><Checkbox label="Accept terms" checked={checked} onCheckedChange={setChecked} /></StoryFrame>);
}

function RadioExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Radio label="Standalone choice" defaultChecked /></StoryFrame>);
}

function CheckboxGroupExample({ variant }: { variant: PreviewVariant }) {
const [checks, setChecks] = useState<ReadonlySet<string>>(new Set(["email"]));
return (<StoryFrame><CheckboxGroup
        label="Channels"
        value={checks}
        onValueChange={setChecks}
        items={[
          { id: "email", label: "Email" },
          { id: "push", label: "Push" },
        ]}
      /></StoryFrame>);
}

function RadioGroupExample({ variant }: { variant: PreviewVariant }) {
const [radio, setRadio] = useState<string | null>("standard");
return (<StoryFrame><RadioGroup
        label="Delivery"
        value={radio}
        onValueChange={setRadio}
        items={[
          { value: "standard", label: "Standard" },
          { value: "express", label: "Express" },
        ]}
      /></StoryFrame>);
}

function SwitchExample({ variant }: { variant: PreviewVariant }) {
const [switched, setSwitched] = useState(true);
return (<StoryFrame><Switch label="Notifications" checked={switched} onCheckedChange={setSwitched} /></StoryFrame>);
}

function SegmentedControlExample({ variant }: { variant: PreviewVariant }) {
const [segment, setSegment] = useState("list");
return (<StoryFrame><SegmentedControl
        label="View"
        value={segment}
        onValueChange={setSegment}
        items={[
          { value: "list", label: "List" },
          { value: "grid", label: "Grid" },
        ]}
      /></StoryFrame>);
}

function SelectExample({ variant }: { variant: PreviewVariant }) {
const [select, setSelect] = useState<string | null>("ko");
return (<StoryFrame><Select
        dismissLabel="Close"
        label="Language"
        placeholder="Choose a language"
        selectedKey={select}
        onSelectionChange={setSelect}
        items={[
          { id: "ko", label: "Korean", textValue: "Korean" },
          { id: "en", label: "English", textValue: "English" },
        ]}
      /></StoryFrame>);
}

function ComboboxExample({ variant }: { variant: PreviewVariant }) {
const [city, setCity] = useState<string | null>(null);
return (<StoryFrame><Combobox
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
      /></StoryFrame>);
}

function ChipExample({ variant }: { variant: PreviewVariant }) {
const [chip, setChip] = useState(false);
return (<StoryFrame><Chip label="Featured" selected={chip} onPress={setChip} selectionMode="multiple" /></StoryFrame>);
}

function ToggleGroupExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><ToggleGroup
        descriptor={{
          accessibilityLabel: "Text styling",
          items: [{ id: "bold", label: "Bold" }, { id: "italic", label: "Italic" }],
        }}
      /></StoryFrame>);
}

function TagsInputExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><TagsInput label="Interests" composeRemoveLabel={(tag) => `Remove ${tag}`} defaultTags={["walking"]} /></StoryFrame>);
}

function DateRangePickerExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><DateRangePicker
        descriptor={{ grid: previewCalendarGrid, monthLabel: "February 2027" }}
        composeAccessibleName={({ date }) => date}
        rangeLabels={{ start: "range start", end: "range end", between: "inside range" }}
      /></StoryFrame>);
}

function MentionsExample({ variant }: { variant: PreviewVariant }) {
const [mention, setMention] = useState("");
return (<StoryFrame><Mentions
        accessibilityLabel="Note"
        value={mention}
        onValueChange={setMention}
        triggers={[{ id: "user", trigger: "@" }]}
        candidates={[{ id: "sky", label: "skyline" }]}
        emptyMessage="No matches"
        listLabel="Mention candidates"
      /></StoryFrame>);
}

function TransferListExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><TransferList
        items={[{ id: "walk", label: "Walk", textValue: "Walk" }, { id: "meal", label: "Meal", textValue: "Meal" }]}
        labels={{ source: "Available", target: "Chosen", toTarget: "Add", toSource: "Remove", selectAll: "Select all", empty: "Nothing here" }}
      /></StoryFrame>);
}

function TabsExample({ variant }: { variant: PreviewVariant }) {
const [tab, setTab] = useState("recent");
return (<StoryFrame><Tabs
        label="Feed view"
        value={tab}
        onValueChange={setTab}
        items={[
          { id: "recent", label: "Recent" },
          { id: "popular", label: "Popular" },
        ]}
      /></StoryFrame>);
}

function StepsExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Steps
        composeAccessibleName={({ position, total, label }) => `Step ${position} of ${total}, ${label}`}
        descriptor={{ steps: [{ id: "account", label: "Account" }, { id: "profile", label: "Profile" }, { id: "confirm", label: "Confirm" }], currentStepId: "profile" }}
        statusLabels={{ pending: "Pending", current: "Current", complete: "Complete", error: "Error" }}
      /></StoryFrame>);
}

function TopBarExample({ variant }: { variant: PreviewVariant }) {
const [navigationAction, setNavigationAction] = useState("None");
return (<StoryFrame><TopBar
        title="HJM"
        actions={<TopBarAction label="Refresh" onPress={() => setNavigationAction("Refreshed")}><Text>↻</Text></TopBarAction>}
      /></StoryFrame>);
}

function MenuExample({ variant }: { variant: PreviewVariant }) {
const [navigationAction, setNavigationAction] = useState("None");
return (<StoryFrame><Menu
        dismissLabel="Close"
        triggerLabel="More actions"
        items={[
          { id: "edit", label: "Edit" },
          { id: "delete", label: "Delete", tone: "danger" },
        ]}
        onAction={(value) => setNavigationAction(value)}
      /><Text accessibilityLiveRegion="polite">Last action: {navigationAction}</Text></StoryFrame>);
}

function BottomNavigationExample({ variant }: { variant: PreviewVariant }) {
const [destination, setDestination] = useState("home");
return (<StoryFrame><BottomNavigation
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
      /></StoryFrame>);
}

function LoadMoreExample({ variant }: { variant: PreviewVariant }) {
const [loads, setLoads] = useState(0);
return (<StoryFrame><LoadMore
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
      /><Text accessibilityLiveRegion="polite">Loaded pages: {loads}</Text></StoryFrame>);
}

function BadgeExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Badge label="Live" tone="success" /></StoryFrame>);
}

function AvatarExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Avatar accessibilityLabel="HJM profile" name="HJM Profile" /></StoryFrame>);
}

function CardExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Card
        leading={<Text aria-hidden>✨</Text>}
        title="Generated app"
        description="Shared padding and hierarchy remain stable with longer descriptive copy."
        tone="accent"
      >
        <Text>Composable body content</Text>
      </Card></StoryFrame>);
}

function ListRowExample({ variant }: { variant: PreviewVariant }) {
const [row, setRow] = useState("None");
return (<StoryFrame><ListRow title="Morning loop" description="Updated just now" onPress={() => setRow("Morning loop")} /><Text accessibilityLiveRegion="polite">Selected row: {row}</Text></StoryFrame>);
}

function TagExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Tag tone="info">Featured</Tag></StoryFrame>);
}

function TimelineExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Timeline
        composeAccessibleName={({ position, total, label }) => `${position} of ${total}, ${label}`}
        items={[
          { id: "created", label: "Created", timestamp: "09:30", tone: "success" },
          { id: "shared", label: "Shared", timestamp: "10:15", tone: "info" },
        ]}
      /></StoryFrame>);
}

function DescriptionListExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><DescriptionList
        availableWidth={320}
        label="Creation metadata"
        descriptor={{ items: [
          { id: "status", label: "Status", value: "Ready" },
          { id: "owner", label: "Owner", value: "HJM" },
        ] }}
      /></StoryFrame>);
}

function ImageExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Image
        accessibilityLabel="Blue preview placeholder"
        decorative={false}
        height={180}
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFElEQVR4nGM0qz/CgA0wYRUdtBIAKh8BiZNSY5sAAAAASUVORK5CYII="
        width={320}
      /></StoryFrame>);
}

function CounterBadgeExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><CounterBadge count={128} accessibilityLabel="128 unread items" /></StoryFrame>);
}

function ListExample({ variant }: { variant: PreviewVariant }) {
const [row, setRow] = useState("None");
return (<StoryFrame><List label="Recent items">
        <ListRow title="Morning loop" description="Updated just now" onPress={() => setRow("Morning loop")} />
        <ListRow title="Night signal" description="Updated yesterday" onPress={() => setRow("Night signal")} />
      </List></StoryFrame>);
}

function StatisticExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Statistic descriptor={{ id: "views", label: "Views", value: "12.4K" }} /></StoryFrame>);
}

function UploadItemExample({ variant }: { variant: PreviewVariant }) {
const [cancelled, setCancelled] = useState(false);
return (<StoryFrame><UploadItem
        descriptor={{ id: "photo", name: "profile-photo.png", sizeLabel: "1.2 MB", state: { status: "uploading", progress: 0.64, progressLabel: "64% uploaded" } }}
        labels={{ pending: "Pending", uploading: "Uploading", success: "Complete", cancel: "Cancel", retry: "Retry" }}
        onCancel={() => setCancelled(true)}
      /><Text accessibilityLiveRegion="polite">Cancelled: {cancelled ? "Yes" : "No"}</Text></StoryFrame>);
}

function AccordionExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Accordion
        label="Details"
        items={[{ value: "details", title: "Details", content: <Text>Expandable content</Text> }]}
      /></StoryFrame>);
}

function CollapsibleExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Collapsible trigger="Shipping details" defaultOpen>
        <Text>Arrives tomorrow</Text>
      </Collapsible></StoryFrame>);
}

function AssetExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Asset descriptor={{ kind: "lottie", accessibilityLabel: "Running fox" }}>
        <Text>Fox</Text>
      </Asset></StoryFrame>);
}

function EmptyStateExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><EmptyState title="No drafts" description="Create a draft to see it here." action={<Button onPress={noop}>Create draft</Button>} /></StoryFrame>);
}

function ResultExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Result status="success" title="Published" description="Your creation is live." /></StoryFrame>);
}

function NoticeExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Notice title="Ready to publish" description="All checks passed." tone="success" /></StoryFrame>);
}

function ProgressExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Progress label="Upload progress" value={0.64} /></StoryFrame>);
}

function SkeletonExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Skeleton accessibilityLabel="Loading preview" width="100%" height={52} /></StoryFrame>);
}

function SpinnerExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Spinner label="Loading content" /></StoryFrame>);
}

function ToastExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><ToastRegion><ToastTrigger /></ToastRegion></StoryFrame>);
}

function BottomInfoExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><BottomInfo items={["Your draft stays private until published.", "You can change this later."]} /></StoryFrame>);
}

function DialogExample({ variant }: { variant: PreviewVariant }) {
const [dialogOpen, setDialogOpen] = useState(false);
return (<StoryFrame><><Button onPress={() => setDialogOpen(true)}>Open dialog</Button><Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Edit item"
        description="Canonical dialog renderer."
        closeLabel="Close"
        primaryAction={{ label: "Save", onPress: () => setDialogOpen(false) }}
      ><Text>Dialog content</Text></Dialog></></StoryFrame>);
}

function AlertDialogExample({ variant }: { variant: PreviewVariant }) {
const [alertOpen, setAlertOpen] = useState(false);
return (<StoryFrame><><Button tone="secondary" onPress={() => setAlertOpen(true)}>Open alert dialog</Button><AlertDialog
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
      /></></StoryFrame>);
}

function SheetExample({ variant }: { variant: PreviewVariant }) {
const [sheetOpen, setSheetOpen] = useState(false);
return (<StoryFrame><><Button tone="secondary" onPress={() => setSheetOpen(true)}>Open sheet</Button><Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Share item"
        description="Adaptive bottom sheet."
        closeLabel="Close"
      ><Text>Sheet content</Text></Sheet></></StoryFrame>);
}

function FloatingActionButtonExample() { const [count,setCount]=useState(0); return <View style={{flex:1}}><Text>Pressed {count} times</Text><FloatingActionButton descriptor={{label:"New note",icon:{name:"add"},layoutMode:"expanded"}} renderIcon={()=><Text>＋</Text>} onContentClearanceChange={noop} onPress={()=>setCount(v=>v+1)} /></View>; }

const examples = {
"design-system-provider": DesignSystemProviderExample,
"text": TextExample,
"surface": SurfaceExample,
"stack": StackExample,
"container": ContainerExample,
"aspect-ratio": AspectRatioExample,
"grid": GridExample,
"layout": LayoutExample,
"icon": IconExample,
"section": SectionExample,
"divider": DividerExample,
"top": TopExample,
"heading": HeadingExample,
"auth-screen": AuthScreenExample,
"button": ButtonExample,
"icon-button": IconButtonExample,
"link": LinkExample,
"bottom-cta": BottomCtaExample,
"auth-provider-button": AuthProviderButtonExample,
"agreement": AgreementExample,
"field": FieldExample,
"search-field": SearchFieldExample,
"text-area": TextAreaExample,
"password-field": PasswordFieldExample,
"otp-field": OtpFieldExample,
"number-field": NumberFieldExample,
"slider": SliderExample,
"form": FormExample,
"date-picker": DatePickerExample,
"file-picker": FilePickerExample,
"checkbox": CheckboxExample,
"radio": RadioExample,
"checkbox-group": CheckboxGroupExample,
"radio-group": RadioGroupExample,
"switch": SwitchExample,
"segmented-control": SegmentedControlExample,
"select": SelectExample,
"combobox": ComboboxExample,
"chip": ChipExample,
"toggle-group": ToggleGroupExample,
"tags-input": TagsInputExample,
"date-range-picker": DateRangePickerExample,
"mentions": MentionsExample,
"transfer-list": TransferListExample,
"tabs": TabsExample,
"steps": StepsExample,
"top-bar": TopBarExample,
"menu": MenuExample,
"bottom-navigation": BottomNavigationExample,
"load-more": LoadMoreExample,
"badge": BadgeExample,
"avatar": AvatarExample,
"card": CardExample,
"list-row": ListRowExample,
"tag": TagExample,
"timeline": TimelineExample,
"description-list": DescriptionListExample,
"image": ImageExample,
"counter-badge": CounterBadgeExample,
"list": ListExample,
"statistic": StatisticExample,
"upload-item": UploadItemExample,
"accordion": AccordionExample,
"collapsible": CollapsibleExample,
"asset": AssetExample,
"empty-state": EmptyStateExample,
"result": ResultExample,
"notice": NoticeExample,
"progress": ProgressExample,
"skeleton": SkeletonExample,
"spinner": SpinnerExample,
"toast": ToastExample,
"bottom-info": BottomInfoExample,
"dialog": DialogExample,
"alert-dialog": AlertDialogExample,
"sheet": SheetExample,
"floating-action-button": FloatingActionButtonExample
};
export function NativeComponentPreview({ componentId, variant = "default" }: { componentId: keyof typeof examples; variant?: PreviewVariant }) { const Example = examples[componentId]; return <Example variant={variant} />; }
const styles = StyleSheet.create({
  customInput: { borderColor: "#667085", borderRadius: 12, borderWidth: 1, minHeight: 44, paddingHorizontal: 16 },
  frame: { gap: 16, paddingBottom: 48 },
  layout: { minHeight: 144 },
  mediaFrameContent: { alignItems: "center", flex: 1, justifyContent: "center" },
});
