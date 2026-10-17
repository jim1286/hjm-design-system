import { DialogExample, AlertDialogExample } from "./dialog-examples";
// Component fixtures are kept separate from CSF modules so importing a preview never registers a second story.
import { Agreement } from "@hjmds/react-native/agreement";
import { Heading } from "@hjmds/react-native/heading";
import { ToggleGroup } from "@hjmds/react-native/toggle-group";
import { BottomInfo } from "@hjmds/react-native/bottom-info";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { Asset, AssetGroup } from "@hjmds/react-native/asset";
import { AuthProviderButton } from "@hjmds/react-native/provider-button";
import { AuthScreenFooter, AuthScreenHero, AuthScreenLayout } from "@hjmds/react-native/auth-screen";
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
import { Pagination } from "@hjmds/react-native/pagination";
import { UploadItem } from "@hjmds/react-native/upload-item";
import {
  BottomNavigation,
  LoadMore,
  Menu,
  Tabs,
  TopBar,
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
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
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
  bottomNavigationExample,
  loadMoreExample,
  menuExample,
  paginationExample,
  sheetExample,
  stepsExample,
  tabsExample,
  topBarExample,
  accordionExample,
  assetExample,
  avatarExample,
  badgeExample,
  cardExample,
  collapsibleExample,
  counterBadgeExample,
  descriptionListExample,
  imageExample,
  listExample,
  listRowExample,
  statisticExample,
  tagExample,
  timelineExample,
  uploadItemExample,
  resultExample,
  noticeExample,
  progressExample,
  skeletonExample,
  spinnerExample,
  bottomInfoExample,
  designSystemProviderExample,
} from "../../shared/component-examples";
import { calendarExampleGrid } from "../../shared/calendar-example";
import { listRowRecipe } from "@hjmds/design-contracts/recipes";
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
// Shows the values the surrounding provider resolved, as the Web story does, instead of a nested provider and one sentence.
function DesignSystemProviderExample({ variant }: { variant: PreviewVariant }) {
  const { environment, palette, tokens } = useHjmNativeTheme();
  const copy = designSystemProviderExample;
  const rows = [[copy.theme, environment.theme], [copy.direction, environment.direction], [copy.textScale, String(environment.textScale)], [copy.reducedMotion, String(environment.reducedMotion)]] as const;
  return (<StoryFrame><Surface padding="md" bordered><Stack gap="md">
    <Heading level="level5">{copy.title}</Heading>
    <Grid columns={{ compact: 1, medium: 2 }} gap={{ compact: "xs" }}>{rows.map(([label, value]) => <Surface key={label} padding="sm" bordered><Text tone="muted" variant="label">{label}</Text><Text fontRole="code" emphasis="strong">{value}</Text></Surface>)}</Grid>
    <Stack gap="xs"><Text tone="muted" variant="label">{copy.palette}</Text><Stack axis="inline" gap="xs" wrap>{Object.entries(palette.statusAccents).map(([tone, color]) => <View key={tone} style={{ borderColor: color, borderWidth: 1, borderRadius: tokens.radius.full, paddingHorizontal: tokens.spacing.xs, paddingVertical: tokens.spacing.xxs }}><Text variant="caption">{tone}: {color}</Text></View>)}</Stack></Stack>
  </Stack></Surface></StoryFrame>);
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
        hero={<AuthScreenHero title={authExample.hero.title} description={authExample.hero.description} />}
        main={<ProviderButtons busyId={null} onPress={start} />}
        footer={<AuthScreenFooter links={authExample.policyLinks.map(label => ({ label, onPress: () => undefined, accessibilityHint: "브라우저에서 열려요" }))} />}
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
return (<StoryFrame><Tabs label={tabsExample.label} items={tabsExample.items.map(item => ({ id: item.id, label: item.label, panel: <Text>{item.panel}</Text> }))} /></StoryFrame>);
}

function StepsExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Steps composeAccessibleName={stepsExample.accessibleName} descriptor={{ steps: stepsExample.steps, currentStepId: stepsExample.currentStepId }} statusLabels={stepsExample.statusLabels} /></StoryFrame>);
}

function TopBarExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><TopBar title={topBarExample.title} leading={<IconButton label={topBarExample.back} tone="ghost"><Icon descriptor={{ name: "chevronStart" }} renderGlyph={semanticGlyph} /></IconButton>} actions={<Button tone="ghost">{topBarExample.done}</Button>} /></StoryFrame>);
}

// Same trigger as Web: a tool action is an IconButton named "작업 더보기", not a brand-colored text link.
function MenuExample({ variant }: { variant: PreviewVariant }) {
const [message, setMessage] = useState("");
return (<StoryFrame><Stack gap="sm" layoutStyle={{ alignSelf: "stretch" }}><Menu triggerLabel={menuExample.triggerLabel} title={menuExample.label} dismissLabel={menuExample.dismissLabel} items={menuExample.items}
  renderTrigger={props => <IconButton label={menuExample.triggerLabel} tone="ghost" {...props}><Icon descriptor={{ name: "more" }} renderGlyph={semanticGlyph} /></IconButton>}
  onAction={value => setMessage(menuExample.result(menuExample.items.find(item => item.id === value)?.label ?? value))} layoutStyle={{ alignSelf: "flex-start" }} />
  <PreviewResult message={message} /></Stack></StoryFrame>);
}

// The bar belongs at the bottom edge like a navigator tab bar (Web pins it to the bottom of its stage).
function BottomNavigationExample({ variant }: { variant: PreviewVariant }) {
const [destination, setDestination] = useState<string>(bottomNavigationExample.initial);
return (<View style={{ flex: 1, justifyContent: "flex-end" }}><BottomNavigation
        descriptor={{ accessibilityLabel: bottomNavigationExample.label, selectedKey: destination, items: bottomNavigationExample.items }}
        onActivate={({ key }) => setDestination(key)}
        renderIcon={semanticGlyph}
      /></View>);
}

// Loaded rows are appended to the list; LoadMore's own busy/complete footer reports progress, as on Web.
function LoadMoreExample({ variant }: { variant: PreviewVariant }) {
const [pages, setPages] = useState(1);
const complete = pages >= loadMoreExample.totalPages;
return (<StoryFrame><List label={loadMoreExample.listLabel}>{Array.from({ length: pages * loadMoreExample.pageSize }, (_, index) => <ListRow key={index} title={loadMoreExample.item(index + 1)} />)}</List>
  <LoadMore mode="manual" descriptor={{ labels: loadMoreExample.labels, state: complete ? { status: "complete" } : { status: "ready", requestKey: `page-${pages}` } }} onLoadMore={async () => setPages(value => value + 1)} /></StoryFrame>);
}

function PaginationExample({ variant }: { variant: PreviewVariant }) {
const copy = paginationExample;
const [page, setPage] = useState(1);
const start = (page - 1) * copy.pageSize + 1;
const end = Math.min(page * copy.pageSize, copy.total);
return (<StoryFrame><Section title={copy.title} description={copy.description}><Stack gap="md">
  <Text accessibilityLiveRegion="polite">{copy.range(start, end)}</Text>
  <List label={copy.listLabel}>{Array.from({ length: end - start + 1 }, (_, index) => <ListRow key={start + index} title={copy.item(start + index)} description={copy.itemDescription} />)}</List>
  <Pagination label={copy.label} descriptor={{ currentPage: page, totalCount: copy.total, pageSize: copy.pageSize }} labels={copy.labels} composeAccessibleName={copy.accessibleName} onPageChange={setPage} />
</Stack></Section></StoryFrame>);
}

// Native Avatar defaults to 44pt; list rows pass the recipe leading size (40), which Web medium already is.
// Data-display examples read the same shared spec as Web (2026-10-17 review N1): English placeholders, other counts and
// debug lines ("Selected row: None", "Cancelled: No") made the two renderers incomparable.
function BadgeExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Stack axis="inline" gap="sm">{badgeExample.map(item => <Badge key={item.label} label={item.label} {...("tone" in item ? { tone: item.tone } : {})} />)}</Stack></StoryFrame>);
}

function AvatarExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Avatar accessibilityLabel={avatarExample.name} name={avatarExample.name} /></StoryFrame>);
}

function CardExample({ variant }: { variant: PreviewVariant }) {
const [message, setMessage] = useState("");
return (<StoryFrame><Card title={cardExample.title} description={cardExample.description} actions={<Button size="small" tone="secondary" onPress={() => setMessage(cardExample.result)}>{cardExample.action}</Button>} /><PreviewResult message={message} /></StoryFrame>);
}

function ListRowExample({ variant }: { variant: PreviewVariant }) {
const [message, setMessage] = useState("");
return (<StoryFrame><ListRow title={listRowExample.title} description={listRowExample.description} leading={<Avatar decorative name={listRowExample.title} size={listRowRecipe.leadingSize} />} leadingShape="circle" trailing={<Icon descriptor={{ name: "chevronEnd" }} renderGlyph={semanticGlyph} />} onPress={() => setMessage(listRowExample.result)} /><PreviewResult message={message} /></StoryFrame>);
}

function TagExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Stack axis="inline" gap="sm" wrap>{tagExample.map(item => <Tag key={item.label} {...("tone" in item ? { tone: item.tone } : {})}>{item.label}</Tag>)}</Stack></StoryFrame>);
}

function TimelineExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Timeline composeAccessibleName={timelineExample.accessibleName} items={timelineExample.items} /></StoryFrame>);
}

function DescriptionListExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><DescriptionList label={descriptionListExample.label} descriptor={{ items: descriptionListExample.items }} /></StoryFrame>);
}

function ImageExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Image accessibilityLabel={imageExample.label} decorative={false} fit="cover" width={imageExample.width} height={imageExample.height} src={require("../../shared/photos/mountain.jpg")} /></StoryFrame>);
}

// Floating on the bell's top-end corner (the NotificationBell placement) and inline at a row's end, as Web.
function CounterBadgeExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Stack gap="md" align="start">
  <View style={{ position: "relative" }}>
    <IconButton label={counterBadgeExample.bellLabel}><Icon descriptor={{ name: "notifications" }} renderGlyph={semanticGlyph} /></IconButton>
    <View pointerEvents="none" style={{ position: "absolute", top: 0, end: 0 }}><CounterBadge count={counterBadgeExample.count} variant="floating" /></View>
  </View>
  <ListRow title={counterBadgeExample.inbox} trailing={<CounterBadge count={counterBadgeExample.inboxValue} accessibilityLabel={counterBadgeExample.inboxCount} />} />
</Stack></StoryFrame>);
}

function ListExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><List label={listExample.label}>{listExample.items.map(item => <ListRow key={item.id} title={item.title} description={item.description} leading={<Avatar decorative name={item.title} size={listRowRecipe.leadingSize} />} leadingShape="circle" />)}</List></StoryFrame>);
}

function StatisticExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Statistic descriptor={statisticExample} /></StoryFrame>);
}

function UploadItemExample({ variant }: { variant: PreviewVariant }) {
const [message, setMessage] = useState("");
return (<StoryFrame><UploadItem descriptor={uploadItemExample.descriptor} labels={uploadItemExample.labels} onCancel={() => setMessage(uploadItemExample.result)} /><PreviewResult message={message} /></StoryFrame>);
}

function AccordionExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Accordion label={accordionExample.label} items={accordionExample.items.map(item => ({ value: item.id, title: item.title, content: <Text>{item.panel}</Text> }))} /></StoryFrame>);
}

function CollapsibleExample({ variant }: { variant: PreviewVariant }) {
return (<StoryFrame><Collapsible trigger={collapsibleExample.trigger} defaultOpen><Text>{collapsibleExample.body}</Text></Collapsible></StoryFrame>);
}

function AssetExample({ variant }: { variant: PreviewVariant }) {
const play = <Icon descriptor={{ name: "play" }} renderGlyph={semanticGlyph} />;
return (<StoryFrame><Section title={assetExample.title} description={assetExample.description}><Stack gap="lg">
  <Stack gap="xs">
    <Text variant="label" tone="muted">{assetExample.groupLabel}</Text>
    <AssetGroup label={assetExample.groupLabel} size="large">
      {assetExample.group.map(item => <Asset key={item.id} descriptor={"label" in item ? { kind: item.kind, size: "large", accessibilityLabel: item.label } : { kind: item.kind, size: "large", decorative: true }}
        {...("playable" in item ? { accessory: play } : {})}><Text>{item.glyph}</Text></Asset>)}
    </AssetGroup>
  </Stack>
  <Stack axis="inline" gap="sm" align="end">
    {assetExample.sizes.map(item => <Asset key={item.id} descriptor={{ kind: item.kind, size: item.size, ...("shape" in item ? { shape: item.shape } : {}), accessibilityLabel: item.label }}
      {...("playable" in item ? { accessory: play } : {})}><Text>{item.glyph}</Text></Asset>)}
  </Stack>
</Stack></Section></StoryFrame>);
}

// A local fixture exercises recovery; the previous Create draft button was a no-op.
function EmptyStateExample({ variant }: { variant: PreviewVariant }) {
  const [created, setCreated] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<TextInput>(null);
  const found = created && "예시 초안".includes(query.trim());
  const focusSearch = () => input.current?.focus();
  return <StoryFrame><Stack gap="md">
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

const [message, setMessage] = useState("");
return (<StoryFrame><Result status={resultExample.status} title={resultExample.title} description={resultExample.description} actions={[{ label: resultExample.action, onAction: () => setMessage(resultExample.actionResult) }]} />{message ? <Text accessibilityLiveRegion="polite">{message}</Text> : null}</StoryFrame>);
}

function NoticeExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Notice title={noticeExample.title} description={noticeExample.description} /></StoryFrame>);
}

function ProgressExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Progress label={progressExample.label} value={progressExample.value} valueText={progressExample.valueText} /></StoryFrame>);
}

function SkeletonExample({ variant }: { variant: PreviewVariant }) {

const { sections, textLines, rowLines, rowCount, cardLines, buttonWidth } = skeletonExample;
return (<StoryFrame><Stack gap="lg" accessible accessibilityLabel={skeletonExample.label} accessibilityState={{ busy: true }}>
  <Stack gap="sm"><Text tone="muted" variant="label">{sections.shapes}</Text>
    <Skeleton shape="text" lines={textLines} />
    <Stack axis="inline" gap="sm" align="center"><Skeleton shape="circle" /><Skeleton shape="button" width={buttonWidth} /><Skeleton shape="button" buttonShape="pill" width={buttonWidth} /></Stack>
    <Skeleton shape="media" />
  </Stack>
  <Stack gap="sm"><Text tone="muted" variant="label">{sections.listRow}</Text>
    {Array.from({ length: rowCount }, (_, index) => <Stack key={index} axis="inline" gap="sm" align="center"><Skeleton shape="circle" /><Skeleton shape="text" lines={rowLines} layoutStyle={{ flex: 1 }} /></Stack>)}
  </Stack>
  <Stack gap="sm"><Text tone="muted" variant="label">{sections.card}</Text>
    <Surface bordered padding="md"><Stack gap="sm"><Skeleton shape="media" /><Skeleton shape="text" lines={cardLines} /><Skeleton shape="button" /></Stack></Surface>
  </Stack>
</Stack></StoryFrame>);
}

function SpinnerExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Spinner label={spinnerExample.label} /></StoryFrame>);
}

function ToastExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><ToastRegion><ToastTrigger /></ToastRegion></StoryFrame>);
}

function BottomInfoExample({ variant }: { variant: PreviewVariant }) {

return (<StoryFrame><Section title={bottomInfoExample.title} description={bottomInfoExample.description}><View>
  <Button layoutStyle={{ alignSelf: "flex-start" }}>{bottomInfoExample.action}</Button>
  <BottomInfo items={bottomInfoExample.consent} />
  <BottomInfo tone="emphasis" items={bottomInfoExample.conditions} />
</View></Section></StoryFrame>);
}

function SheetExample({ variant }: { variant: PreviewVariant }) {
const [sheetOpen, setSheetOpen] = useState(false);
return (<StoryFrame><Button tone="secondary" onPress={() => setSheetOpen(true)} layoutStyle={{ alignSelf: "flex-start" }}>{sheetExample.trigger}</Button><Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={sheetExample.title}
        description={sheetExample.description}
        closeLabel={sheetExample.closeLabel}
        footer={<Button onPress={() => setSheetOpen(false)}>{sheetExample.apply}</Button>}
      ><Text>{sheetExample.body}</Text></Sheet></StoryFrame>);
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
"pagination": PaginationExample,
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
