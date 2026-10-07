import { useEffect, useRef, useState } from "react";
import { HjmProvider } from "@hjmds/react/provider";
import { hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { profileOptions, profileCopy } from "../../../shared/design-profile";
import { DatePicker } from "@hjmds/react/date-picker";
import { Select } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";
import { Container, Section, Stack, Text } from "@hjmds/react/layout";
import { Notice } from "@hjmds/react/feedback";
import { Collapsible } from "@hjmds/react/collapsible";
import { calendarExampleGrid, calendarExampleName, shiftCalendarMonth } from "../../../shared/calendar-example";
import { hourOptions, minuteOptions } from "../../../shared/time-example";
import { dateTimeCopy as copy, dateTimeSelectionReducer, dateTimeSelectionDisplay, dateTimeSelectionValue, initialDateTimeSelection, type DateTimeSelectionAction, type DateTimeSelectionProps } from "../../../shared/date-time-selection";

export function DateTimeSelectionPreview(props: DateTimeSelectionProps) {
  const [themeIndex, setThemeIndex] = useState(0);
  const profile = profileOptions[themeIndex]!;
  const [model, setModel] = useState(() => initialDateTimeSelection(props.initialStatus));
  const send = (action: DateTimeSelectionAction) => setModel(current => dateTimeSelectionReducer(current, action, props.disabled));
  const busy = model.status === "pending", locked = !!props.disabled || busy;
  const value = dateTimeSelectionValue(model);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previousBusy = useRef(busy);
  useEffect(() => {
    // The fixture response button becomes disabled after settling; return focus
    // to the original confirmation instead of leaving it on the document body.
    if (previousBusy.current && !busy) confirmRef.current?.focus();
    previousBusy.current = busy;
  }, [busy]);
  const contents = <Container gutter="compact"><Section title={copy.title} description={copy.description}><Stack gap="md">
    <Text>{profileCopy.choose}: {profile.label}</Text>
    <Button tone="secondary" onClick={() => setThemeIndex(current => (current + 1) % profileOptions.length)}>{profileCopy.nextTheme}</Button>
    <DatePicker descriptor={{ grid: calendarExampleGrid(model.month), label: copy.date,
      displayValue: model.date, placeholder: copy.placeholder, selectedDate: model.date,
      onSelectionChange: next => send({ type: "date", value: next }), focusedMonth: model.month, onFocusedMonthChange: next => send({ type: "month", value: next }),
      disabled: locked }}
      monthLabel={model.month} previousMonth={{ month: shiftCalendarMonth(model.month, -1), label: copy.previousMonth }}
      nextMonth={{ month: shiftCalendarMonth(model.month, 1), label: copy.nextMonth }}
      composeAccessibleName={info => `${calendarExampleName(info)}${info.isSelected ? ", 선택됨" : ""}`}
      clearLabel={copy.clear} closeLabel={copy.close} />
    <Select label={copy.hour} placeholder={copy.hourPlaceholder} emptySelectionLabel={copy.hourClear} items={hourOptions} selectedKey={model.hour} onSelectionChange={next => send({ type: "hour", value: next })} disabled={locked} />
    <Select label={copy.minute} placeholder={copy.minutePlaceholder} emptySelectionLabel={copy.minuteClear} items={minuteOptions} selectedKey={model.minute} onSelectionChange={next => send({ type: "minute", value: next })} disabled={locked} />
    <Text role="status">{value ? dateTimeSelectionDisplay(value) : copy.missing}</Text>
    <Text tone="muted">{copy.timezone}</Text>
    <Button ref={confirmRef} disabled={locked || !value} loading={busy} onClick={() => send({ type: "confirm" })}>{busy ? copy.pending : model.status === "failed" ? copy.retry : copy.confirm}</Button>
    <Button tone="ghost" disabled={locked} onClick={() => send({ type: "reset" })}>{copy.reset}</Button>
    {model.status === "failed" ? <Notice tone="danger" title={copy.failed} /> : null}
    {model.status === "saved" ? <Notice tone="success" title={copy.saved} description={dateTimeSelectionDisplay(model.saved!)} /> : null}
    <Collapsible trigger={copy.tools} defaultOpen>
      <Stack gap="sm"><Button tone="secondary" disabled={!busy} onClick={() => send({ type: "respond" })}>{copy.respond}</Button>
        <Button tone="ghost" disabled={locked} onClick={() => send({ type: "armFailure" })}>{model.failNext ? copy.armed : copy.fail}</Button>
      </Stack>
    </Collapsible>
  </Stack></Section></Container>;
  return <HjmProvider designProfile={hjmDesignPresets[profile.id]}>{contents}</HjmProvider>;
}
