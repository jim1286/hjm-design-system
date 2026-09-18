import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Heading } from "../src/heading.js";
import { Progress } from "../src/feedback.js";
import { ListRow } from "../src/display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

it("renders every heading level as a real element at the declared document level", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <Heading level="level1">랜딩 히어로</Heading>
      <Heading level="level2" semanticLevel={4}>큰 카드 제목</Heading>
      <Heading level="level5">작은 제목</Heading>
    </HjmProvider>,
  ));
  const headings = [...document.querySelectorAll<HTMLElement>(".hjm-heading")];
  expect(headings.map((node) => node.tagName)).toEqual(["H1", "H4", "H5"]);
  const size = (node: HTMLElement) => Number.parseFloat(getComputedStyle(node).fontSize);
  // The exposed scale goes above the Text scale's 24px ceiling.
  expect(size(headings[0]!)).toBe(40);
  expect(size(headings[1]!)).toBe(32);
  expect(size(headings[2]!)).toBe(18);
  // Visual size and document level disagree on purpose in the middle one.
  expect(headings[1]!.dataset.level).toBe("level2");
});

it("draws a circular progress from the same value and keeps one accessibility contract", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <Progress label="읽은 분량" value={35} valueText="35%" shape="circular">35%</Progress>
    </HjmProvider>,
  ));
  const native = document.querySelector<HTMLProgressElement>("progress")!;
  // Still a <progress>: value, max and the announcement are unchanged.
  expect(native.value).toBe(35);
  expect(native.max).toBe(100);
  expect(native.getAttribute("aria-valuetext")).toBe("35%");
  const ring = document.querySelector<HTMLElement>(".hjm-progress__ring")!;
  expect(getComputedStyle(ring).getPropertyValue("--hjm-progress-sweep").trim()).toBe("35%");
  expect(Math.round(ring.getBoundingClientRect().width)).toBe(40);
  // The ring is decoration; the value lives on the progress element.
  expect(ring.getAttribute("aria-hidden")).toBe("true");
  expect(document.querySelector(".hjm-progress__ring-content")!.textContent).toBe("35%");
});

it("sizes the ring per size token and marks the indeterminate case", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <Progress label="불러오는 중" size="large" shape="circular" />
    </HjmProvider>,
  ));
  const ring = document.querySelector<HTMLElement>(".hjm-progress__ring")!;
  expect(Math.round(ring.getBoundingClientRect().width)).toBe(64);
  expect(document.querySelector<HTMLElement>(".hjm-progress")!.dataset.state).toBe("indeterminate");
  expect(document.querySelector<HTMLProgressElement>("progress")!.hasAttribute("value")).toBe(false);
});

it("keeps a loading row's geometry so the list does not jump when content arrives", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      {/* The loading row is given the same slots the real row will have; the
          copy itself is ignored, only the slot presence shapes the box. */}
      <ListRow loading loadingLabel="기록을 불러오는 중" title="자리" description="자리" leading={<span />} />
    </HjmProvider>,
  ));
  const placeholder = document.querySelector<HTMLElement>(".hjm-list-row")!;
  const placeholderHeight = placeholder.getBoundingClientRect().height;
  expect(placeholder.getAttribute("aria-busy")).toBe("true");
  expect(placeholder.getAttribute("role")).toBe("status");
  expect(placeholder.getAttribute("aria-label")).toBe("기록을 불러오는 중");
  // Nothing to activate while loading.
  expect(placeholder.querySelectorAll("button, a")).toHaveLength(0);

  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <ListRow title="느리게 걸었던 오후" description="골목을 한 바퀴 돌았어요" leading={<span />} />
    </HjmProvider>,
  ));
  const loaded = document.querySelector<HTMLElement>(".hjm-list-row")!;
  expect(Math.round(loaded.getBoundingClientRect().height)).toBe(Math.round(placeholderHeight));
});
