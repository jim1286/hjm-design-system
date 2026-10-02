// STEA Code 후보 중 표현 3종을 기존 HJM API로 다시 만든 실험이다. 새 공개 API는 만들지 않는다.
// 데이터와 캐릭터 프레임은 shared/stea-expressions.ts가 소유한다.
import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, AppState, ScrollView, View } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { Button } from "@hjmds/react-native/actions";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Card, DescriptionList } from "@hjmds/react-native/data-display";
import { EmptyState } from "@hjmds/react-native/feedback";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { QRCode } from "@hjmds/react-native/qr-code";
// Metro resolves the shared TypeScript source by extension; a literal .js path has no file.
import {
  flipCopy, pixelCopy, pixelFrameMs, pixelFrameRuns, pixelGridSize, pixelStillFrame, ticketCopy, type PixelInk,
} from "../../shared/stea-expressions";

function Frame({ children }: { children: ReactNode }) {
  return <ScrollView contentContainerStyle={{ padding: spacing.lg }}>{children}</ScrollView>;
}

export function FlipInfoCard() {
  const [back, setBack] = useState(false);
  const toggle = () => {
    const next = !back;
    setBack(next);
    // iOS는 accessibilityLiveRegion을 무시하므로 면이 바뀐 사실을 직접 알린다.
    AccessibilityInfo.announceForAccessibility(flipCopy.faceStatus(next));
  };
  return <Frame><Card title={flipCopy.title}>
    <Stack gap="md">
      <ContentTransition stateKey={back ? "back" : "front"} preset="scale">
        {back
          ? <DescriptionList label={flipCopy.backLabel} descriptor={{ items: flipCopy.back }} />
          : <Stack gap="xs">
              <Text variant="title" emphasis="strong">{flipCopy.front.name}</Text>
              <Text>{flipCopy.front.summary}</Text>
              <Text tone="muted">{flipCopy.front.note}</Text>
            </Stack>}
      </ContentTransition>
      <Button tone="secondary" onPress={toggle}>{back ? flipCopy.showFront : flipCopy.showBack}</Button>
    </Stack>
  </Card></Frame>;
}

/** 한 칸의 크기. spacing 토큰을 써서 픽셀 경계가 정수로 떨어지게 한다. 12칸 × 8 = 96으로 Web SVG와 같다. */
const pixelUnit = spacing.xs;
const pixelSize = pixelUnit * pixelGridSize;

function PixelSprite({ paused }: { paused: boolean }) {
  const { colors, environment } = useHjmNativeTheme();
  const [frame, setFrame] = useState(pixelStillFrame);
  const [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => setActive(state === "active"));
    return () => subscription.remove();
  }, []);
  // 앱이 배경으로 가거나 멈춤·모션 감소면 타이머를 걸지 않는다.
  const still = paused || !active || environment.reducedMotion;
  useEffect(() => {
    if (still) { setFrame(pixelStillFrame); return; }
    const timer = setInterval(() => setFrame(index => (index + 1) % pixelFrameRuns.length), pixelFrameMs);
    return () => clearInterval(timer);
  }, [still]);
  const ink: Readonly<Record<PixelInk, string>> = { outline: colors.text, body: colors.contentBrand, light: colors.bg, eye: colors.text };
  const size = pixelSize;
  // 장식이다. 의미는 EmptyState 제목·설명이 전달하므로 화면낭독기에서 숨긴다.
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: size, width: size }}>
    {pixelFrameRuns[frame]!.map(run => <View key={`${run.x}-${run.y}`} style={{
      backgroundColor: ink[run.ink], height: pixelUnit, left: run.x * pixelUnit, position: "absolute", top: run.y * pixelUnit, width: run.width * pixelUnit,
    }} />)}
  </View>;
}

export function PixelEmptyState() {
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  return <Frame><Stack gap="md">
    {/* Native EmptyState는 일러스트 칸을 아이콘 크기(glyph.lg)로 고정한다. 캐릭터가 제목 위로 넘쳐
        (2026-10-02 시뮬레이터 확인) 공개 illustrationStyle로 칸을 캐릭터 크기에 맞춘다. */}
    <EmptyState illustration={<PixelSprite paused={paused} />} illustrationStyle={{ height: pixelSize, width: pixelSize }} title={pixelCopy.title} description={pixelCopy.description}
      action={<Button onPress={() => setStarted(true)}>{pixelCopy.start}</Button>} />
    {/* 5초 넘게 반복되는 움직임은 멈출 수 있어야 한다(WCAG 2.2.2). */}
    <Button tone="ghost" onPress={() => setPaused(value => !value)}>{paused ? pixelCopy.resume : pixelCopy.pause}</Button>
    {started ? <Text accessibilityLiveRegion="polite" tone="muted">{pixelCopy.started}</Text> : null}
  </Stack></Frame>;
}

export function EventTicket() {
  return <Frame><Card title={ticketCopy.title} description={ticketCopy.subtitle}>
    <Stack gap="lg">
      <DescriptionList label={ticketCopy.detailsLabel} descriptor={{ items: ticketCopy.details }} />
      <Stack gap="sm">
        <QRCode value={ticketCopy.booking} label={ticketCopy.qrLabel} fallback={<Text tone="muted">{ticketCopy.qrFallback}</Text>} />
        <Text variant="label" tone="muted">{ticketCopy.bookingLabel}</Text>
        <Text selectable variant="title" emphasis="strong">{ticketCopy.booking}</Text>
      </Stack>
    </Stack>
  </Card></Frame>;
}
