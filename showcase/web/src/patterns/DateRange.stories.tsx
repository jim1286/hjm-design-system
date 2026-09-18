import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DateRangeValue } from "@hjmds/design-contracts/components/date-range";
import { DateRangePicker } from "@hjmds/react/date-range";
import { OverlayStackProvider, useDialog, useSheet } from "@hjmds/react/overlay-stack";
import { formatCurrency, formatNumber, formatPercent, formatBytes } from "@hjmds/design-contracts/formatters";
import { Button } from "@hjmds/react/actions";
import { StatisticGroup } from "@hjmds/react/display";
import { Notice } from "@hjmds/react/feedback";
import { Stack, Section } from "@hjmds/react/layout";

const grid = {
  // 7의 배수여야 한다 — 격자는 한 주 단위로만 성립한다.
  cells: Array.from({ length: 28 }, (_, index) => ({ date: `2026-09-${String(index + 1).padStart(2, "0")}` })),
  weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"] as const,
  todayDate: "2026-09-18",
};

export function DateRangePreview() {
  const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });
  return (
    <Section title="기간으로 골라보기" description="시작일을 누르고 종료일을 누르면 돼요.">
      <Stack gap="md">
        <DateRangePicker
          descriptor={{ grid, monthLabel: "2026년 9월" }}
          composeAccessibleName={({ date }) => date}
          value={value}
          onValueChange={setValue}
          rangeLabels={{ start: "시작일", end: "종료일", between: "기간 안" }}
        />
        <p role="status">
          {value.start === null ? "기간을 골라 주세요" : value.end === null ? `${value.start}부터 …` : `${value.start} ~ ${value.end}`}
        </p>
      </Stack>
    </Section>
  );
}

function ImperativeOverlayBody() {
  const openDialog = useDialog();
  const openSheet = useSheet();
  const [log, setLog] = useState<string[]>([]);
  return (
    <Stack gap="md">
      <Button
        onClick={async () => {
          const handle = openDialog({
            title: "이 기록을 지울까요",
            closeLabel: "닫기",
            children: <p>지운 기록은 되돌릴 수 없어요.</p>,
          });
          await handle.closed;
          setLog((previous) => [...previous, "다이얼로그가 닫힌 뒤에 시트를 엽니다"]);
          openSheet({ title: "다음에 할 일", closeLabel: "닫기", children: <p>여기서 이어서 정리해요.</p> });
        }}
      >
        지우기
      </Button>
      {/* 후속 표면은 닫힘 완료 뒤에 연다 — 타이머로 추측하지 않는다. */}
      {log.map((line) => <Notice key={line} title={line} />)}
    </Stack>
  );
}

export function ImperativeOverlayPreview() {
  return (
    <Section title="명령형으로 여는 오버레이" description="열림 상태를 화면이 들고 있지 않아도 됩니다.">
      <OverlayStackProvider><ImperativeOverlayBody /></OverlayStackProvider>
    </Section>
  );
}

export function FormattersPreview() {
  const locale = "ko-KR";
  return (
    <Section title="숫자는 로케일이 읽는다" description="형식은 플랫폼이 알고, 문장은 제품이 만듭니다.">
      <StatisticGroup
        label="이번 달 요약"
        descriptor={{
          columns: 2,
          items: [
            { id: "records", label: "이번 달 기록", value: formatNumber(1284, { locale }) },
            { id: "price", label: "구독료", value: formatCurrency(9900, { locale, currency: "KRW" }) },
            { id: "rate", label: "달성률", value: formatPercent(0.72, { locale }) },
            { id: "size", label: "사진 용량", value: formatBytes(1_500_000, { locale }) },
          ],
        }}
      />
    </Section>
  );
}

const meta = { title: "Patterns/DateRange", component: DateRangePreview } satisfies Meta<typeof DateRangePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PickARange: Story = {};
export const ImperativeOverlays: Story = { render: () => <ImperativeOverlayPreview /> };
export const Formatters: Story = { render: () => <FormattersPreview /> };
export const LargeText: Story = { globals: { textScale: "2" } };
