import { expect, it } from "vitest";
import { resolvePermissionFooter } from "../src/screen-patterns.js";

const all = { recheck: true, alternative: true, skip: true };
const slots = (status: Parameters<typeof resolvePermissionFooter>[0], supplied = all) => resolvePermissionFooter(status, supplied).map(item => `${item.slot}:${item.emphasis}`);

it("orders primary, recheck, alternative and skip with one filled primary", () => {
  expect(slots("denied")).toEqual(["primary:primary", "recheck:secondary", "alternative:secondary", "skip:ghost"]);
  // Recheck only makes sense after settings; a fresh prompt asks the OS directly.
  expect(slots("prompt")).toEqual(["primary:primary", "alternative:secondary", "skip:ghost"]);
  // Without any OS path the alternative is the way forward.
  expect(slots("unavailable")).toEqual(["alternative:secondary", "skip:ghost"]);
  // Once granted the screen only continues.
  expect(slots("granted")).toEqual(["primary:primary", "skip:ghost"]);
  expect(slots("denied", { recheck: false, alternative: false, skip: false })).toEqual(["primary:primary"]);
});
