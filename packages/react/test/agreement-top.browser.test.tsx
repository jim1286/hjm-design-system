import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import type { AgreementDescriptor } from "@hjmds/design-contracts/components/agreement";
import { Agreement } from "../src/agreement.js";
import { Top } from "../src/top.js";
import { AuthProviderButton } from "../src/provider-button.js";
import { Button } from "../src/actions.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

let host: HTMLDivElement; let root: Root;
beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); await page.viewport(1280, 720); });

const descriptor: AgreementDescriptor = {
  accessibilityLabel: "약관 동의",
  allLabel: "전체 동의하기",
  items: [
    { id: "terms", label: "서비스 이용약관", required: true, detail: { label: "전문 보기", href: "#terms" } },
    { id: "privacy", label: "개인정보 처리방침", required: true, detail: { label: "전문 보기" } },
    { id: "marketing", label: "마케팅 정보 수신", description: "언제든 끌 수 있어요" },
  ],
};

const boxes = () => [...document.querySelectorAll<HTMLElement>('[role="checkbox"]')];
const box = (label: string) => boxes().find((node) => node.textContent?.includes(label))!;
const submit = () => [...document.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === "시작하기")!;

function Fixture({ onDetail }: { onDetail?: (id: string) => void }) {
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [satisfied, setSatisfied] = useState(false);
  return (
    <HjmProvider reducedMotion>
      <Agreement
        descriptor={descriptor}
        checkedIds={checked}
        onCheckedIdsChange={setChecked}
        onStateChange={(state) => setSatisfied(state.satisfied)}
        onDetail={(id) => onDetail?.(id)}
        requiredLabel="(필수)"
        optionalLabel="(선택)"
      />
      <Button disabled={!satisfied}>시작하기</Button>
    </HjmProvider>
  );
}

it("derives all-agree from the items and blocks submission until required ones are checked", async () => {
  await act(async () => root.render(<Fixture />));
  expect(box("전체 동의하기").getAttribute("aria-checked")).toBe("false");
  expect(submit().disabled).toBe(true);

  await act(async () => box("서비스 이용약관").click());
  expect(box("전체 동의하기").getAttribute("aria-checked")).toBe("mixed");
  expect(submit().disabled).toBe(true);

  await act(async () => box("개인정보 처리방침").click());
  // Both required rows are checked, so the product may submit even though the
  // optional row leaves all-agree mixed.
  expect(submit().disabled).toBe(false);
  expect(box("전체 동의하기").getAttribute("aria-checked")).toBe("mixed");

  await act(async () => box("마케팅 정보 수신").click());
  expect(box("전체 동의하기").getAttribute("aria-checked")).toBe("true");
});

it("checks and clears every item from the all-agree row", async () => {
  await act(async () => root.render(<Fixture />));
  await act(async () => box("전체 동의하기").click());
  expect(boxes().every((node) => node.getAttribute("aria-checked") === "true")).toBe(true);
  await act(async () => box("전체 동의하기").click());
  expect(boxes().filter((node) => node.getAttribute("aria-checked") === "true")).toHaveLength(0);
  expect(submit().disabled).toBe(true);
});

it("announces which rows are required and keeps that in the control's own name", async () => {
  await act(async () => root.render(<Fixture />));
  expect(box("서비스 이용약관").textContent).toContain("(필수)");
  expect(box("마케팅 정보 수신").textContent).toContain("(선택)");
  // The description is referenced, not orphaned next to the control.
  const described = box("마케팅 정보 수신").getAttribute("aria-describedby")!;
  expect(document.getElementById(described)!.textContent).toBe("언제든 끌 수 있어요");
});

it("opens the full text from a separate tab stop that never toggles consent", async () => {
  const onDetail = vi.fn();
  await act(async () => root.render(<Fixture onDetail={onDetail} />));
  const link = document.querySelector<HTMLAnchorElement>('a.hjm-agreement__detail')!;
  expect(link.getAttribute("href")).toBe("#terms");
  expect(link.closest('[role="checkbox"]')).toBeNull();

  const detailButton = [...document.querySelectorAll<HTMLButtonElement>("button.hjm-agreement__detail")][0]!;
  await act(async () => detailButton.click());
  expect(onDetail.mock.calls).toEqual([["privacy"]]);
  // Reading the text is not agreeing to it.
  expect(box("개인정보 처리방침").getAttribute("aria-checked")).toBe("false");
});

it("renders Top as a real heading that scrolls with the body", async () => {
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <Top
        descriptor={{ eyebrow: "2026년 9월", title: "오늘 기록을 남겨요", description: "한 줄만 적어도 충분해요." }}
        trailing={<Button tone="ghost">건너뛰기</Button>}
      />
    </HjmProvider>,
  ));
  const heading = document.querySelector<HTMLElement>(".hjm-top__title")!;
  expect(heading.tagName).toBe("H1");
  expect(heading.textContent).toBe("오늘 기록을 남겨요");
  // Body content: no fixed positioning and no stacking context of its own.
  const top = document.querySelector<HTMLElement>(".hjm-top")!;
  expect(getComputedStyle(top).position).toBe("static");
  expect(getComputedStyle(top).zIndex).toBe("auto");
});

it("lowers the heading level on request and keeps long copy readable at double text size", async () => {
  await page.viewport(320, 640);
  await act(async () => root.render(
    <HjmProvider reducedMotion textScale={2}>
      <Top
        descriptor={{
          title: "아주 긴 제목과 unexpectedly long English heading",
          description: "설명은 잘리지 않고 이어서 읽힌다. 큰 글자에서도 마찬가지다.",
          size: "medium",
          headingLevel: 2,
        }}
      />
    </HjmProvider>,
  ));
  expect(document.querySelector(".hjm-top__title")!.tagName).toBe("H2");
  const description = document.querySelector<HTMLElement>(".hjm-top__description")!;
  // Wrapped, never truncated: the box is taller than one line and stays inside.
  expect(description.scrollWidth).toBeLessThanOrEqual(320);
  expect(description.getBoundingClientRect().height).toBeGreaterThan(40);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
});

it("paints provider buttons from the guideline table and never from the theme", async () => {
  await act(async () => root.render(
    <HjmProvider systemTheme="light">
      <AuthProviderButton descriptor={{ provider: "google", label: "Google로 계속하기" }} logo={<span>G</span>} />
      <AuthProviderButton descriptor={{ provider: "kakao", label: "카카오로 계속하기" }} logo={<span>K</span>} />
      <AuthProviderButton descriptor={{ provider: "naver", label: "네이버로 계속하기" }} logo={<span>N</span>} />
      <AuthProviderButton descriptor={{ provider: "apple", label: "Apple로 계속하기" }} logo={<span></span>} />
    </HjmProvider>,
  ));
  const buttonFor = (provider: string) => document.querySelector<HTMLElement>(`[data-provider="${provider}"]`)!;
  expect(getComputedStyle(buttonFor("kakao")).backgroundColor).toBe("rgb(254, 229, 0)");
  expect(getComputedStyle(buttonFor("naver")).backgroundColor).toBe("rgb(3, 169, 77)");
  expect(getComputedStyle(buttonFor("apple")).backgroundColor).toBe("rgb(0, 0, 0)");
  // Google's light variant is the only one that needs the guideline's border.
  expect(getComputedStyle(buttonFor("google")).borderTopWidth).toBe("1px");
  expect(getComputedStyle(buttonFor("kakao")).borderTopWidth).toBe("0px");
  // A stack of providers lines up: same height and radius for all four.
  const heights = new Set(["google", "kakao", "naver", "apple"].map((id) => Math.round(buttonFor(id).getBoundingClientRect().height)));
  expect(heights.size).toBe(1);
  expect([...heights][0]).toBeGreaterThanOrEqual(44);
});

it("switches to the provider's own dark variant, not to an HJM color", async () => {
  await act(async () => root.render(
    <HjmProvider systemTheme="dark">
      <AuthProviderButton descriptor={{ provider: "google", label: "Google로 계속하기" }} logo={<span>G</span>} />
      <AuthProviderButton descriptor={{ provider: "naver", label: "네이버로 계속하기" }} logo={<span>N</span>} />
    </HjmProvider>,
  ));
  const buttonFor = (provider: string) => document.querySelector<HTMLElement>(`[data-provider="${provider}"]`)!;
  expect(getComputedStyle(buttonFor("google")).backgroundColor).toBe("rgb(19, 19, 20)");
  // Naver's brand color is the identity, so dark keeps it unchanged.
  expect(getComputedStyle(buttonFor("naver")).backgroundColor).toBe("rgb(3, 169, 77)");
});

it("keeps the label and the width while busy, and blocks the press", async () => {
  const onClick = vi.fn();
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <AuthProviderButton descriptor={{ provider: "kakao", label: "카카오로 계속하기" }} logo={<span>K</span>} onClick={onClick} />
    </HjmProvider>,
  ));
  const idleWidth = document.querySelector<HTMLElement>('[data-provider="kakao"]')!.getBoundingClientRect().width;
  await act(async () => root.render(
    <HjmProvider reducedMotion>
      <AuthProviderButton descriptor={{ provider: "kakao", label: "카카오로 계속하기", busy: true }} logo={<span>K</span>} onClick={onClick} />
    </HjmProvider>,
  ));
  const busyButton = document.querySelector<HTMLButtonElement>('[data-provider="kakao"]')!;
  expect(busyButton.textContent).toContain("카카오로 계속하기");
  expect(Math.round(busyButton.getBoundingClientRect().width)).toBe(Math.round(idleWidth));
  expect(busyButton.getAttribute("aria-busy")).toBe("true");
  await act(async () => busyButton.click());
  expect(onClick).not.toHaveBeenCalled();
});
