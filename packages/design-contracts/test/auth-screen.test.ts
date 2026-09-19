import { describe, expect, it } from "vitest";
import {
  authProviderButtonRecipe,
  authScreenBehavior,
  authScreenDefaults,
  authScreenRecipe,
  control,
  resolveAuthScreenDescriptor,
  validateAuthScreenDescriptor,
  type AuthScreenDescriptor,
} from "../src/index.js";

describe("AuthScreen descriptor", () => {
  it("rejects input that cannot describe a screen", () => {
    expect(() => validateAuthScreenDescriptor(null as unknown as AuthScreenDescriptor)).toThrow(
      TypeError,
    );
    expect(() =>
      validateAuthScreenDescriptor({ density: "cozy" } as unknown as AuthScreenDescriptor),
    ).toThrow(TypeError);
    // 제품이 `hasFooter="true"`처럼 문자열을 넘기면 조용히 참이 되어 동의 고지가 사라진
    // 화면이 배포된다 — 법적 고지 자리라 조용히 넘기지 않는다.
    expect(() =>
      validateAuthScreenDescriptor({ hasFooter: "true" } as unknown as AuthScreenDescriptor),
    ).toThrow(TypeError);
  });

  it("defaults to the regular density with a footer", () => {
    const resolved = resolveAuthScreenDescriptor();
    expect(resolved.density).toBe(authScreenDefaults.density);
    expect(resolved.hasFooter).toBe(true);
    expect(resolved.maxWidth).toBe(authScreenRecipe.maxWidth);
  });

  it("shrinks every gap in compact without changing the structure", () => {
    const regular = resolveAuthScreenDescriptor({ density: "regular" });
    const compact = resolveAuthScreenDescriptor({ density: "compact" });
    expect(compact.heroGap).toBeLessThan(regular.heroGap);
    expect(compact.mainGap).toBeLessThan(regular.mainGap);
    expect(compact.footerGap).toBeLessThan(regular.footerGap);
    expect(compact.paddingBlock).toBeLessThan(regular.paddingBlock);
    // 폭은 밀도와 무관하다 — 좁은 화면에서도 버튼 줄기는 같은 최대 폭을 쓴다.
    expect(compact.maxWidth).toBe(regular.maxWidth);
  });

  it("keeps the provider height owned by the provider contract", () => {
    // 두 계약이 각자 값을 들고 있으면 한쪽만 바뀌어 버튼 줄기가 어긋난다.
    expect(authScreenRecipe.providerMinHeight).toBe(authProviderButtonRecipe.minHeight);
  });

  it("keeps policy links reachable by touch", () => {
    expect(authScreenRecipe.footerMinTouchTarget).toBe(control.minTouchTarget);
  });

  it("declares the two-region promise in its scenarios", () => {
    expect(authScreenBehavior.scenarios).toContain(
      "the-hero-and-the-main-action-stay-one-vertically-centred-block",
    );
    expect(authScreenBehavior.scenarios).toContain(
      "content-taller-than-the-viewport-scrolls-instead-of-pushing-the-footer-off-screen",
    );
  });
});
