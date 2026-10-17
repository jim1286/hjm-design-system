import { DialogExample, AlertDialogExample } from "./dialog-examples";
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
import { useRef, useState, type ReactNode } from "react";
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
  TextField,
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
import { Sheet } from "@hjmds/react-native/overlays";
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
import { ImageChoiceGroup } from "@hjmds/react-native/image-choice";
import { PreviewTools } from "./preview-tools";
import { PreviewPhoto } from "./reference-screen-parts";
import { semanticGlyph } from "./semantic-glyphs";
import {
  aspectRatioExample,
  authExample,
  authPreviewDelayMs,
  bottomCtaExample,
  buttonExample,
  containerExample,
  dividerExample,
  floatingActionExample,
  gridExample,
  headingExample,
  iconButtonExample,
  iconExample,
  imageChoiceExample,
  layoutExample,
  linkExample,
  sectionExample,
  stackExample,
  surfaceExample,
  textExample,
  topExample,
  agreementExample,
  checkboxExample,
  checkboxGroupExample,
  chipExample,
  comboboxExample,
  dateRangeExample,
  datePickerExample,
  fieldExample,
  filePickerExample,
  formExample,
  mentionsExample,
  numberFieldExample,
  otpFieldExample,
  passwordFieldExample,
  radioExample,
  radioGroupExample,
  searchFieldExample,
  segmentedControlExample,
  selectExample,
  sliderExample,
  switchExample,
  tagsInputExample,
  textAreaExample,
  toggleGroupExample,
  toggleGroupStatus,
  transferListExample,
} from "../../shared/component-examples";
import { calendarExampleGrid } from "../../shared/calendar-example";
import type { DateRangeValue } from "@hjmds/design-contracts/components/date-range";
const noop = () => undefined;

// Shared calendar fixture keeps weekday placement identical to Web (the hand-written grid matched only February 2027).
const previewCalendarGrid = calendarExampleGrid(datePickerExample.month);

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

// The result line matches Web's ObservablePreview: a Korean status that appears only after an action.
function PreviewResult({ message }: { message: string }) {
  return message ? <Text accessibilityLiveRegion="polite">{message}</Text> : null;
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
return (<StoryFrame><Stack gap="xs"><Text variant="title" emphasis="strong">{textExample.title}</Text><Text>{textExample.body}</Text><Text tone="muted" variant="label">{textExample.caption}</Text></Stack></StoryFrame>);
}

function SurfaceExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Surface bordered padding="lg"><Stack gap="xs"><Text emphasis="strong">{surfaceExample.title}</Text><Text tone="muted">{surfaceExample.body}</Text></Stack></Surface></StoryFrame>);
}

function StackExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Stack gap="sm">{stackExample.map(label => <Surface key={label} bordered padding="sm"><Text>{label}</Text></Surface>)}</Stack></StoryFrame>);
}

function ContainerExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Container size="reading"><Surface bordered padding="md"><Text>{containerExample}</Text></Surface></Container></StoryFrame>);
}

function AspectRatioExample({ variant }: { variant: PreviewVariant }) {
// The subtle bordered surface makes the 16:9 box itself visible; a bare label floated in an invisible frame.
return (<StoryFrame><Container size="reading"><AspectRatio ratio="wide"><Surface bordered tone="subtle" padding="md" layoutStyle={{ flex: 1 }}><Text tone="muted">{aspectRatioExample}</Text></Surface></AspectRatio></Container></StoryFrame>);
}

function GridExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Grid columns={{ compact: 1, medium: 2, expanded: 3 }} gap={{ compact: "md" }}>{gridExample.map(item => <Card key={item.id} title={item.title}><Text>{item.body}</Text></Card>)}</Grid></StoryFrame>);
}

function LayoutExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Layout header={<Text emphasis="strong">{layoutExample.header}</Text>}><Surface bordered padding="md"><Text>{layoutExample.body}</Text></Surface></Layout></StoryFrame>);
}

function IconExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Stack axis="inline" gap="md" wrap accessibilityLabel={iconExample.label}>{iconExample.items.map(item => <Icon key={item.name} descriptor={{ name: item.name, decorative: false, accessibilityLabel: item.label, ...("tone" in item ? { tone: item.tone } : {}) }} renderGlyph={semanticGlyph} />)}</Stack></StoryFrame>);
}

function SectionExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Section title={sectionExample.title} description={sectionExample.description}><Text>{sectionExample.body}</Text></Section></StoryFrame>);
}

function DividerExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Stack gap="sm"><Text>{dividerExample.above}</Text><Divider /><Text>{dividerExample.below}</Text></Stack></StoryFrame>);
}

function TopExample({ variant }: { variant: PreviewVariant }) {
const [size, setSize] = useState<"medium" | "large">("large");
return (<StoryFrame><Stack gap="md"><Top descriptor={{ eyebrow: topExample.eyebrow, title: topExample.titles[size], description: topExample.description, size }} /><Text>{topExample.body}</Text>
  <PreviewTools><SegmentedControl label={topExample.sizeLabel} items={topExample.sizes.map(item => ({ value: item.value, label: item.label }))} value={size} onValueChange={value => { if (value === "large" || value === "medium") setSize(value); }} /></PreviewTools></Stack></StoryFrame>);
}

function HeadingExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Stack gap="md">{headingExample.map(item => <Heading key={item.id} level={item.level} {...("semanticLevel" in item ? { semanticLevel: item.semanticLevel } : {})}>{item.label}</Heading>)}</Stack></StoryFrame>);
}

function ProviderButtons({ busyId, onPress }: { busyId: string | null; onPress(id: string): void }) {
return <Stack gap="xs">{authExample.providers.map(item => <AuthProviderButton key={item.id}
  descriptor={{ provider: item.id, label: item.label, busy: busyId === item.id }} logo={<Text>{item.mark}</Text>} onPress={() => onPress(item.id)} />)}</Stack>;
}

function useAuthPending() {
const [busyId, setBusyId] = useState<string | null>(null);
return { busyId, start: (id: string) => { setBusyId(id); setTimeout(() => setBusyId(null), authPreviewDelayMs); } };
}

function AuthScreenExample({ variant }: { variant: PreviewVariant }) {
const { busyId, start } = useAuthPending();
return (<AuthScreenLayout mainCard
        {...(busyId !== null || variant === "loading" ? { pendingLabel: authExample.pendingLabel } : {})}
        hero={<Top descriptor={{ title: authExample.hero.title, description: authExample.hero.description, size: "medium" }} />}
        main={<ProviderButtons busyId={null} onPress={start} />}
        footer={<Text tone="muted">{authExample.footer}</Text>}
      />);
}

function ButtonExample({ variant }: { variant: PreviewVariant }) {
const [message, setMessage] = useState("");
return (<StoryFrame><Stack axis="inline" gap="md" wrap><Button disabled={variant === "disabled"} loading={variant === "loading"} onPress={() => setMessage(buttonExample.primary.result)}>{buttonExample.primary.label}</Button><Button tone="secondary" onPress={() => setMessage(buttonExample.secondary.result)}>{buttonExample.secondary.label}</Button><Button disabled>{buttonExample.disabled}</Button></Stack><PreviewResult message={message} /></StoryFrame>);
}

function IconButtonExample({ variant }: { variant: PreviewVariant }) {
const [message, setMessage] = useState("");
return (<StoryFrame><Stack axis="inline" gap="md">{iconButtonExample.map(item => <IconButton key={item.icon} disabled={variant === "disabled"} loading={variant === "loading"} label={item.label} tone={item.tone} onPress={() => setMessage(item.result)}>
          <Icon descriptor={{ name: item.icon }} renderGlyph={semanticGlyph} />
        </IconButton>)}</Stack><PreviewResult message={message} /></StoryFrame>);
}

function LinkExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Link descriptor={{ label: linkExample.label, destination: { kind: "internal", href: linkExample.href } }} onNavigate={noop} /></StoryFrame>);
}

function BottomCtaExample({ variant }: { variant: PreviewVariant }) {
const [message, setMessage] = useState("");
return (<StoryFrame><BottomCTA
        primaryAction={{ label: bottomCtaExample.primary.label, onPress: () => setMessage(bottomCtaExample.primary.result) }}
        secondaryAction={{ label: bottomCtaExample.secondary.label, onPress: () => setMessage(bottomCtaExample.secondary.result) }}
        description={bottomCtaExample.description}
      /><PreviewResult message={message} /></StoryFrame>);
}

function AuthProviderButtonExample({ variant }: { variant: PreviewVariant }) {
const { busyId, start } = useAuthPending();
return (<StoryFrame><ProviderButtons busyId={busyId} onPress={start} /></StoryFrame>);
}

// Input examples read the shared spec (showcase/shared/component-examples.ts) so labels, items, initial selection,
// disabled rows and descriptions match the Web stories (2026-10-17 review C).
function AgreementExample({ variant }: { variant: PreviewVariant }) {
const copy = agreementExample;
const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
const [satisfied, setSatisfied] = useState(false);
const [missing, setMissing] = useState<readonly string[]>([]);
const [joined, setJoined] = useState(false);
const [email, setEmail] = useState("");
const labelOf = (id: string) => copy.items.find((item) => item.id === id)?.label ?? id;
return (<StoryFrame><Stack gap="md">
  <Top descriptor={copy.top} />
  <TextField label={copy.emailLabel} value={email} onValueChange={setEmail} />
  <Agreement
    descriptor={{ accessibilityLabel: copy.accessibilityLabel, allLabel: copy.allLabel, items: copy.items }}
    checkedIds={checked}
    onCheckedIdsChange={setChecked}
    onStateChange={(state) => { setSatisfied(state.satisfied); setMissing(state.missingRequiredIds); }}
    requiredLabel={copy.requiredLabel}
    optionalLabel={copy.optionalLabel}
  />
  {missing.length ? <Text accessibilityLiveRegion="polite">{copy.missing(missing.map(labelOf))}</Text> : null}
  <Button disabled={!satisfied || email.trim().length === 0} onPress={() => setJoined(true)}>{copy.submit}</Button>
  {joined ? <Notice tone="success" title={copy.joined.title} description={copy.joined.description} /> : null}
</Stack></StoryFrame>);
}

function FieldExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Field disabled={variant === "disabled"} error={variant === "error" ? fieldExample.error : ""} label={fieldExample.label} description={fieldExample.description}>
        {(controlProps) => <TextInput {...controlProps} defaultValue={fieldExample.value} style={styles.customInput} />}
      </Field></StoryFrame>);
}

function SearchFieldExample({ variant }: { variant: PreviewVariant }) {
const [query, setQuery] = useState<string>(searchFieldExample.value);
return (<StoryFrame><SearchField
        busyLabel={searchFieldExample.busyLabel}
        clearLabel={searchFieldExample.clearLabel}
        label={searchFieldExample.label}
        description={searchFieldExample.description}
        value={query}
        onValueChange={setQuery}
        onClear={() => setQuery("")}
      /></StoryFrame>);
}

function TextAreaExample({ variant }: { variant: PreviewVariant }) {
const [notes, setNotes] = useState<string>(textAreaExample.value);
return (<StoryFrame><TextArea label={textAreaExample.label} description={textAreaExample.description} value={notes} onValueChange={setNotes} /></StoryFrame>);
}

function PasswordFieldExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><PasswordField
        autofillHint="current"
        concealLabel={passwordFieldExample.concealLabel}
        defaultValue={passwordFieldExample.value}
        label={passwordFieldExample.label}
        revealLabel={passwordFieldExample.revealLabel}
        description={passwordFieldExample.description}
      /></StoryFrame>);
}

function OtpFieldExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><OtpField
        defaultValue={otpFieldExample.value}
        label={otpFieldExample.label}
        length={otpFieldExample.length}
        description={otpFieldExample.description}
      /></StoryFrame>);
}

function NumberFieldExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><NumberField
        decrementLabel={numberFieldExample.decrementLabel}
        defaultValue={numberFieldExample.value}
        incrementLabel={numberFieldExample.incrementLabel}
        label={numberFieldExample.label}
        min={numberFieldExample.min}
        max={numberFieldExample.max}
      /></StoryFrame>);
}

function SliderExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Slider
        decrementLabel={sliderExample.decrementLabel}
        defaultValue={sliderExample.value}
        incrementLabel={sliderExample.incrementLabel}
        label={sliderExample.label}
        min={sliderExample.min}
        max={sliderExample.max}
        getValueText={sliderExample.valueText}
      /></StoryFrame>);
}

function FormExample({ variant }: { variant: PreviewVariant }) {
const [owner, setOwner] = useState<string>(formExample.field.value);
const [message, setMessage] = useState("");
return (<StoryFrame><Form
        fallbackErrorMessage={formExample.fallbackError}
        label={formExample.label}
        onSubmit={() => setMessage(formExample.result)}
        submitLabel={formExample.submit}
        values={{ owner }}
      >
        <SearchField label={formExample.field.label} clearLabel={formExample.field.clearLabel} busyLabel={formExample.field.busyLabel} value={owner} onValueChange={setOwner} onClear={() => setOwner("")} />
      </Form>{message ? <Notice tone="success" title={message} /> : null}</StoryFrame>);
}

function DatePickerExample({ variant }: { variant: PreviewVariant }) {
const [visitDate, setVisitDate] = useState<string | null>(null);
return (<StoryFrame><DatePicker
        clearLabel={datePickerExample.clearLabel}
        closeLabel={datePickerExample.closeLabel}
        composeAccessibleName={datePickerExample.accessibleName}
        descriptor={{ grid: previewCalendarGrid, displayValue: visitDate, placeholder: datePickerExample.placeholder, label: datePickerExample.label, selectedDate: visitDate, onSelectionChange: setVisitDate, defaultOpen: false }}
        monthLabel={datePickerExample.monthLabel}
      /></StoryFrame>);
}

function FilePickerExample({ variant }: { variant: PreviewVariant }) {
const [message, setMessage] = useState("");
return (<StoryFrame><FilePicker
        buttonLabel={filePickerExample.buttonLabel}
        descriptor={{ mode: "multiple", accept: ["image/*"], maxCount: 4 }}
        hint={filePickerExample.hint}
        label={filePickerExample.label}
        onPick={async () => [{ id: "preview", name: "preview.png", mimeType: "image/png", sizeBytes: 1024 }]}
        onPickError={noop}
        onSelect={() => setMessage(filePickerExample.result)}
      /><PreviewResult message={message} /></StoryFrame>);
}

function CheckboxExample({ variant }: { variant: PreviewVariant }) {
const [checked, setChecked] = useState<boolean>(checkboxExample.checked);
return (<StoryFrame><Checkbox label={checkboxExample.label} description={checkboxExample.description} checked={checked} onCheckedChange={setChecked} /></StoryFrame>);
}

function RadioExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Radio label={radioExample.label} description={radioExample.description} defaultChecked={radioExample.checked} /></StoryFrame>);
}

function CheckboxGroupExample({ variant }: { variant: PreviewVariant }) {
const [checks, setChecks] = useState<ReadonlySet<string>>(new Set(checkboxGroupExample.initial));
return (<StoryFrame><CheckboxGroup label={checkboxGroupExample.label} value={checks} onValueChange={setChecks} items={checkboxGroupExample.items} /></StoryFrame>);
}

function RadioGroupExample({ variant }: { variant: PreviewVariant }) {
const [radio, setRadio] = useState<string | null>(radioGroupExample.initial);
return (<StoryFrame><RadioGroup label={radioGroupExample.label} value={radio} onValueChange={setRadio} items={radioGroupExample.items} /></StoryFrame>);
}

function SwitchExample({ variant }: { variant: PreviewVariant }) {
const [switched, setSwitched] = useState<boolean>(switchExample.checked);
return (<StoryFrame><Switch label={switchExample.label} checked={switched} onCheckedChange={setSwitched} /></StoryFrame>);
}

function SegmentedControlExample({ variant }: { variant: PreviewVariant }) {
const [segment, setSegment] = useState<string>(segmentedControlExample.initial);
return (<StoryFrame><SegmentedControl label={segmentedControlExample.label} value={segment} onValueChange={setSegment} items={segmentedControlExample.items} /></StoryFrame>);
}

function SelectExample({ variant }: { variant: PreviewVariant }) {
const [select, setSelect] = useState<string | null>(selectExample.initial);
return (<StoryFrame><Select
        dismissLabel={selectExample.dismissLabel}
        label={selectExample.label}
        placeholder={selectExample.placeholder}
        selectedKey={select}
        onSelectionChange={setSelect}
        items={selectExample.items}
      /></StoryFrame>);
}

function ComboboxExample({ variant }: { variant: PreviewVariant }) {
const [city, setCity] = useState<string | null>(null);
return (<StoryFrame><Combobox
        clearLabel={comboboxExample.clearLabel}
        dismissLabel={comboboxExample.dismissLabel}
        emptyMessage={comboboxExample.emptyMessage}
        label={comboboxExample.label}
        loadingMessage={comboboxExample.loadingMessage}
        placeholder={comboboxExample.placeholder}
        selectedKey={city}
        onSelectionChange={setCity}
        items={comboboxExample.items.map(({ id, label }) => ({ id, label, textValue: label }))}
      /></StoryFrame>);
}

function ChipExample({ variant }: { variant: PreviewVariant }) {
const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(chipExample.initial));
return (<StoryFrame><Stack axis="inline" gap="sm" wrap accessibilityLabel={chipExample.label}>{chipExample.items.map(item => <Chip key={item.id} label={item.label} selectionMode="multiple" selected={selected.has(item.id)}
  onPress={(next) => setSelected(current => { const updated = new Set(current); if (next) updated.add(item.id); else updated.delete(item.id); return updated; })} />)}</Stack></StoryFrame>);
}

function ToggleGroupExample({ variant }: { variant: PreviewVariant }) {
const copy = toggleGroupExample;
const [style, setStyle] = useState<ReadonlySet<string>>(new Set(copy.style.initial));
const [filters, setFilters] = useState<ReadonlySet<string>>(new Set());
return (<StoryFrame><Section title={copy.title} description={copy.description}><Stack gap="md">
  <ToggleGroup descriptor={{ accessibilityLabel: copy.style.label, items: copy.style.items }} pressedIds={style} onPressedIdsChange={setStyle} />
  <Text accessibilityLiveRegion="polite">{toggleGroupStatus(style)}</Text>
  <ToggleGroup size="small" descriptor={{ accessibilityLabel: copy.filters.label, items: copy.filters.items }} pressedIds={filters} onPressedIdsChange={setFilters} />
</Stack></Section></StoryFrame>);
}

function TagsInputExample({ variant }: { variant: PreviewVariant }) {
const copy = tagsInputExample;
const [tags, setTags] = useState<readonly string[]>(copy.initial);
const [message, setMessage] = useState<string | null>(null);
return (<StoryFrame><Section title={copy.title} description={copy.description}><Stack gap="md">
  <TagsInput label={copy.label} description={copy.fieldDescription} placeholder={copy.placeholder} tags={tags}
    onTagsChange={(next) => { setTags(next); setMessage(null); }} policy={{ maxTags: copy.maxTags }}
    onReject={(result) => setMessage(result.reason === "duplicate" ? copy.duplicate(result.value) : result.reason === "limit" ? copy.limit : null)}
    composeRemoveLabel={copy.removeLabel} />
  {message ? <Notice tone="warning" title={message} /> : null}
</Stack></Section></StoryFrame>);
}

const dateRangeGrid = calendarExampleGrid(dateRangeExample.month);
function DateRangePickerExample({ variant }: { variant: PreviewVariant }) {
const copy = dateRangeExample;
const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });
return (<StoryFrame><Section title={copy.title} description={copy.description}><Stack gap="md">
  <DateRangePicker descriptor={{ grid: dateRangeGrid, monthLabel: copy.monthLabel }} composeAccessibleName={({ date }) => date}
    value={value} onValueChange={setValue} rangeLabels={copy.rangeLabels} />
  <Text accessibilityLiveRegion="polite">{copy.status(value.start, value.end)}</Text>
</Stack></Section></StoryFrame>);
}

function MentionsExample({ variant }: { variant: PreviewVariant }) {
const copy = mentionsExample;
const [text, setText] = useState("");
const [query, setQuery] = useState<string | null>(null);
const [saved, setSaved] = useState<string | null>(null);
const candidates = query === null ? [] : copy.people.filter((person) => person.label.startsWith(query));
return (<StoryFrame><Section title={copy.title} description={copy.description}><Stack gap="md">
  <Mentions label={copy.label} description={copy.fieldDescription} value={text} onValueChange={setText}
    triggers={[{ id: "person", trigger: "@" }]} candidates={candidates} onMentionQueryChange={(match) => setQuery(match?.query ?? null)}
    emptyMessage={copy.emptyMessage} listLabel={copy.listLabel} />
  <Button disabled={text.trim().length === 0} onPress={() => setSaved(text.trim())}>{copy.save}</Button>
  {saved ? <List label={copy.savedList}><ListRow title={saved} /></List> : <Notice title={copy.emptySaved.title} description={copy.emptySaved.description} />}
</Stack></Section></StoryFrame>);
}

function TransferListExample({ variant }: { variant: PreviewVariant }) {
const copy = transferListExample;
const [target, setTarget] = useState<ReadonlySet<string>>(new Set(copy.initialTarget));
const [announcement, setAnnouncement] = useState("");
const labelOf = (id: string) => copy.records.find((record) => record.id === id)?.label ?? id;
return (<StoryFrame><Section title={copy.title} description={copy.description}><Stack gap="md">
  <TransferList items={copy.records} targetKeys={target} onTargetKeysChange={setTarget} labels={copy.labels}
    onMove={(ids, direction) => setAnnouncement(copy.moved(ids.map(labelOf), direction))} />
  <PreviewResult message={announcement} />
</Stack></Section></StoryFrame>);
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
        renderIcon={semanticGlyph}
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

// A local fixture exercises recovery; the previous Create draft button was a no-op.
function EmptyStateExample({ variant }: { variant: PreviewVariant }) {
  const [created, setCreated] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<TextInput>(null);
  const found = created && "예시 초안".includes(query.trim());
  const focusSearch = () => input.current?.focus();
  return <StoryFrame><Stack gap="md">
    <Text>메모리에만 만드는 예시입니다. 새 항목 생성과 검색 결과 복구를 확인하세요.</Text>
    <SearchField ref={input} label="초안 검색" clearLabel="검색어 지우기" busyLabel="검색 중" value={query} onValueChange={setQuery} />
    {!created ? <EmptyState title="아직 초안이 없어요" description="첫 초안을 만들면 여기에 표시됩니다."
      density="compact" announcement="none" action={<Button onPress={() => { setCreated(true); setQuery(""); focusSearch(); }}>예시 초안 만들기</Button>} /> :
      !found ? <EmptyState title="검색 결과가 없어요" description="검색어를 바꾸거나 지우면 초안을 다시 볼 수 있습니다."
        density="compact" announcement="polite" action={<Button tone="secondary" onPress={() => { setQuery(""); focusSearch(); }}>검색어 지우고 모두 보기</Button>} /> :
        <List label="초안 목록"><ListRow title="예시 초안" description="이 화면에서만 유지되는 항목" /></List>}
    {created ? <Button tone="secondary" onPress={() => { setCreated(false); setQuery(""); focusSearch(); }}>처음 상태로 돌아가기</Button> : null}
  </Stack></StoryFrame>;
}

function ResultExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Result status="success" title="Published" description="Your creation is live." /></StoryFrame>);
}

function NoticeExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Notice title="Ready to publish" description="All checks passed." tone="success" /></StoryFrame>);
}

function ProgressExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Progress label="Upload progress" value={64} /></StoryFrame>);
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

function FloatingActionButtonExample() {
const [count, setCount] = useState(0);
return <View style={{ flex: 1 }}><Stack gap="sm"><Text>{floatingActionExample.body}</Text><PreviewResult message={count === 0 ? "" : floatingActionExample.result(count)} /></Stack>
  <FloatingActionButton descriptor={{ label: floatingActionExample.label, icon: { name: "add" }, layoutMode: "expanded" }} renderIcon={() => <Icon descriptor={{ name: "add", tone: "inverse" }} renderGlyph={semanticGlyph} />} onContentClearanceChange={noop} onPress={() => setCount(value => value + 1)} /></View>;
}

function ImageChoiceGroupExample({ variant }: { variant: PreviewVariant }) {
const [value, setValue] = useState<string>(imageChoiceExample.initial);
const chosen = imageChoiceExample.items.find(item => item.id === value)!;
return (<StoryFrame><ImageChoiceGroup label={imageChoiceExample.label} showLabel selectionMode="single" value={value} onValueChange={setValue} disabled={variant === "disabled"}
  items={imageChoiceExample.items.map(item => ({ id: item.id, label: item.label, image: <PreviewPhoto index={item.photo} square rounded={false} label="" /> }))} />
  <Text tone="muted" accessibilityLiveRegion="polite">{imageChoiceExample.result(chosen.label)}</Text></StoryFrame>);
}

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
"image-choice-group": ImageChoiceGroupExample,
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
});
