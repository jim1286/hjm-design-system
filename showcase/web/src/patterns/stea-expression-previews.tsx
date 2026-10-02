// STEA Code 후보 중 표현 3종을 기존 HJM API로 다시 만든 실험이다. 새 공개 API는 만들지 않는다.
// 데이터와 캐릭터 프레임은 shared/stea-expressions.ts가 소유한다.
import { useEffect, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Card, DescriptionList } from "@hjmds/react/display";
import { EmptyState } from "@hjmds/react/feedback";
import { Stack, Text } from "@hjmds/react/layout";
import { useHjmTheme } from "@hjmds/react/provider";
import { QRCode } from "@hjmds/react/qr-code";
import {
  flipCopy, pixelCopy, pixelFrameMs, pixelFrameRuns, pixelGridSize, pixelStillFrame, ticketCopy, type PixelInk,
} from "../../../shared/stea-expressions";

export function FlipInfoCard() {
  const [back, setBack] = useState(false);
  return <Card title={flipCopy.title}>
    <Stack gap="md">
      {/* 3D 회전 대신 ContentTransition으로 면을 바꾼다. 모션 감소면 ContentTransition이 즉시 전환한다. */}
      <ContentTransition stateKey={back ? "back" : "front"} preset="scale">
        {back
          ? <DescriptionList aria-label={flipCopy.backLabel} items={flipCopy.back} />
          : <Stack gap="xs">
              <Text variant="title" emphasis="strong">{flipCopy.front.name}</Text>
              <Text>{flipCopy.front.summary}</Text>
              <Text tone="muted">{flipCopy.front.note}</Text>
            </Stack>}
      </ContentTransition>
      <span className="hjm-visually-hidden" role="status">{flipCopy.faceStatus(back)}</span>
      <Button tone="secondary" onClick={() => setBack(value => !value)}>{back ? flipCopy.showFront : flipCopy.showBack}</Button>
    </Stack>
  </Card>;
}

const inkColor: Readonly<Record<PixelInk, string>> = {
  outline: "var(--hjm-color-text)",
  body: "var(--hjm-color-content-brand)",
  light: "var(--hjm-color-bg)",
  eye: "var(--hjm-color-text)",
};

function PixelSprite({ paused }: { paused: boolean }) {
  const { environment } = useHjmTheme();
  const [frame, setFrame] = useState(pixelStillFrame);
  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  // 탭이 숨겨졌거나 멈춤·모션 감소면 타이머를 아예 걸지 않는다. 프레임 상태는 이 컴포넌트에만 있어
  // 프레임이 바뀌어도 카드 전체가 다시 그려지지 않는다.
  const still = paused || hidden || environment.reducedMotion;
  useEffect(() => {
    if (still) { setFrame(pixelStillFrame); return; }
    const timer = setInterval(() => setFrame(index => (index + 1) % pixelFrameRuns.length), pixelFrameMs);
    return () => clearInterval(timer);
  }, [still]);
  // EmptyState가 icon을 장식으로 숨긴다. 의미는 제목·설명이 전달하므로 캐릭터에 이름을 붙이지 않는다.
  return <svg aria-hidden="true" data-pixel-sprite viewBox={`0 0 ${pixelGridSize} ${pixelGridSize}`}
    width="96" height="96" shapeRendering="crispEdges">
    {pixelFrameRuns[frame]!.map(run => <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.width} height={1} fill={inkColor[run.ink]} />)}
  </svg>;
}

export function PixelEmptyState() {
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  return <Stack gap="md">
    <EmptyState icon={<PixelSprite paused={paused} />} title={pixelCopy.title} description={pixelCopy.description}
      action={<Button onClick={() => setStarted(true)}>{pixelCopy.start}</Button>} />
    {/* 5초 넘게 반복되는 움직임은 멈출 수 있어야 한다(WCAG 2.2.2). */}
    <Button tone="ghost" onClick={() => setPaused(value => !value)}>{paused ? pixelCopy.resume : pixelCopy.pause}</Button>
    <Text role="status" tone="muted">{started ? pixelCopy.started : ""}</Text>
  </Stack>;
}

export function EventTicket() {
  return <Card title={ticketCopy.title} description={ticketCopy.subtitle}>
    <Stack gap="lg">
      <DescriptionList aria-label={ticketCopy.detailsLabel} items={ticketCopy.details} />
      <Stack gap="sm">
        {/* QRCode의 svg가 inline이라 글자 fallback이 옆으로 흐른다. 블록으로 감싸 아래 줄에 둔다. */}
        <QRCode value={ticketCopy.booking} label={ticketCopy.qrLabel} fallback={<Stack gap="xs"><Text tone="muted">{ticketCopy.qrFallback}</Text></Stack>} />
        <Text variant="label" tone="muted">{ticketCopy.bookingLabel}</Text>
        <Text variant="title" emphasis="strong">{ticketCopy.booking}</Text>
      </Stack>
    </Stack>
  </Card>;
}
