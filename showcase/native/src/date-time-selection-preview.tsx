import { useState } from "react";
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { profileOptions, profileCopy } from "../../shared/design-profile";
import { DatePicker } from "@hjmds/react-native/date-picker";
import { Select } from "@hjmds/react-native/forms";
import { Button } from "@hjmds/react-native/actions";
import { Container, Section, Stack, Text } from "@hjmds/react-native/primitives";
import { Notice } from "@hjmds/react-native/feedback";
import { Collapsible } from "@hjmds/react-native/collapsible";
import { calendarExampleGrid, calendarExampleName, shiftCalendarMonth } from "../../shared/calendar-example";
import { hourOptions, minuteOptions } from "../../shared/time-example";
import { dateTimeCopy as copy, dateTimeSelectionReducer, dateTimeSelectionDisplay, dateTimeSelectionValue, initialDateTimeSelection, type DateTimeSelectionAction, type DateTimeSelectionProps } from "../../shared/date-time-selection";
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { PatternStatus } from "./pattern-status";

export function DateTimeSelectionPreview(props: DateTimeSelectionProps) {
  const [themeIndex, setThemeIndex] = useState(0);
  const profile = profileOptions[themeIndex]!;
  const [model, setModel] = useState(() => initialDateTimeSelection(props.initialStatus));
  const send = (action: DateTimeSelectionAction) => setModel(current => dateTimeSelectionReducer(current, action, props.disabled));
  const busy = model.status === "pending", locked = !!props.disabled || busy;
  const value = dateTimeSelectionValue(model);
  const contents = <Container gutter="compact"><Section title={copy.title} description={copy.description}><Stack gap="md">
    <Text>{profileCopy.choose}: {profile.label}</Text>
    <Button tone="secondary" onPress={() => setThemeIndex(current => (current + 1) % profileOptions.length)}>{profileCopy.nextTheme}</Button>
    <DatePicker descriptor={{ grid: calendarExampleGrid(model.month), label: copy.date,
      displayValue: model.date, placeholder: copy.placeholder, selectedDate: model.date,
      onSelectionChange: next => send({ type: "date", value: next }), focusedMonth: model.month, onFocusedMonthChange: next => send({ type: "month", value: next }),
      disabled: locked }}
      monthLabel={model.month} previousMonth={{ month: shiftCalendarMonth(model.month, -1), label: copy.previousMonth }}
      nextMonth={{ month: shiftCalendarMonth(model.month, 1), label: copy.nextMonth }}
      composeAccessibleName={info => `${calendarExampleName(info)}${info.isSelected ? ", 선택됨" : ""}`}
      clearLabel={copy.clear} closeLabel={copy.close} />
    <Select label={copy.hour} placeholder={copy.hourPlaceholder} dismissLabel={copy.hourClose} items={hourOptions} selectedKey={model.hour} onSelectionChange={next => send({ type: "hour", value: next })} disabled={locked} />
    <Select label={copy.minute} placeholder={copy.minutePlaceholder} dismissLabel={copy.minuteClose} items={minuteOptions} selectedKey={model.minute} onSelectionChange={next => send({ type: "minute", value: next })} disabled={locked} />
    <PatternStatus>{value ? dateTimeSelectionDisplay(value) : copy.missing}</PatternStatus>
    <Text tone="muted">{copy.timezone}</Text>
    <Button disabled={locked || !value} loading={busy} onPress={() => send({ type: "confirm" })}>{busy ? copy.pending : model.status === "failed" ? copy.retry : copy.confirm}</Button>
    <Button tone="ghost" disabled={locked} onPress={() => send({ type: "reset" })}>{copy.reset}</Button>
    {model.status === "failed" ? <Notice tone="danger" announcement="assertive" title={copy.failed} /> : null}
    {model.status === "saved" ? <Notice tone="success" announcement="polite" title={copy.saved} description={dateTimeSelectionDisplay(model.saved!)} /> : null}
    <Collapsible trigger={copy.tools} defaultOpen>
      <Stack gap="sm"><Button tone="secondary" disabled={!busy} onPress={() => send({ type: "respond" })}>{copy.respond}</Button>
        <Button tone="ghost" disabled={locked} onPress={() => send({ type: "armFailure" })}>{model.failNext ? copy.armed : copy.fail}</Button>
      </Stack>
    </Collapsible>
  </Stack></Section></Container>;
  // Match the deployed time-selection host; product navigation owns safe-area padding.
  return <HjmNativeProvider designProfile={hjmDesignPresets[profile.id]}><ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>{contents}</ScrollView></HjmNativeProvider>;
}
