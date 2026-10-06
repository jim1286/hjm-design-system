import { describe, expect, it } from "vitest";
import {
  initialOrderState, initialOtpState, isOrderDone, orderCopy, orderReducer, orderStepsDescriptor,
  otpExpectedCode, otpMaxAttempts, otpReducer, type OtpAction, type OtpState, type OrderAction, type OrderState,
} from "../../shared/stea-compositions";

const runOrder = (actions: OrderAction[], from: OrderState = initialOrderState) => actions.reduce(orderReducer, from);
const runOtp = (actions: OtpAction[], from: OtpState = initialOtpState) => actions.reduce(otpReducer, from);

describe("order progress", () => {
  it("advances only after the server responds", () => {
    const requested = runOrder([{ type: "request" }]);
    expect(requested.cursor).toBe(1);
    expect(runOrder([{ type: "respond" }], requested).cursor).toBe(2);
  });

  it("keeps the cursor and marks the current step as error on failure, then recovers", () => {
    const failed = runOrder([{ type: "toggleFailNext" }, { type: "request" }, { type: "respond" }]);
    expect(failed.cursor).toBe(1);
    expect(failed.log.at(-1)?.label).toBe(`${orderCopy.steps[1]!.label} 실패`);
    expect(orderStepsDescriptor(failed).currentStepStatus).toBe("error");
    expect(failed.failNext).toBe(false);
    const recovered = runOrder([{ type: "request" }, { type: "respond" }], failed);
    expect(recovered.cursor).toBe(2);
    expect(orderStepsDescriptor(recovered).currentStepStatus).toBe("current");
  });

  it("ignores repeated requests while waiting and stops at the last step", () => {
    const waiting = runOrder([{ type: "request" }]);
    expect(orderReducer(waiting, { type: "request" })).toBe(waiting);
    // 접수는 이미 확정된 상태로 시작하므로 남은 확정은 단계 수 - 1번이다.
    const steps = orderCopy.steps.length - 1;
    const done = runOrder(Array.from({ length: steps }, () => [{ type: "request" }, { type: "respond" }] as OrderAction[]).flat());
    expect(isOrderDone(done)).toBe(true);
    expect(done.cursor).toBe(orderCopy.steps.length - 1);
    expect(orderStepsDescriptor(done).currentStepStatus).toBe("complete");
    expect(orderReducer(done, { type: "request" })).toBe(done);
  });
});

describe("otp verification", () => {
  it("verifies only the expected code after a response", () => {
    const verifying = runOtp([{ type: "change", value: otpExpectedCode }, { type: "submit" }]);
    expect(verifying.phase).toBe("verifying");
    expect(runOtp([{ type: "respond" }], verifying).phase).toBe("verified");
  });

  it("does not submit an incomplete code or accept edits while verifying", () => {
    expect(runOtp([{ type: "change", value: "123" }, { type: "submit" }]).phase).toBe("editing");
    const verifying = runOtp([{ type: "change", value: "111111" }, { type: "submit" }]);
    expect(otpReducer(verifying, { type: "change", value: "2" }).value).toBe("111111");
  });

  it("clears the error when editing resumes and locks after the last attempt", () => {
    const wrong: OtpAction[] = [{ type: "change", value: "111111" }, { type: "submit" }, { type: "respond" }];
    const failed = runOtp(wrong);
    expect(failed.phase).toBe("failed");
    expect(otpReducer(failed, { type: "change", value: "11111" }).phase).toBe("editing");
    const locked = runOtp(Array.from({ length: otpMaxAttempts }, () => wrong).flat());
    expect(locked.phase).toBe("locked");
    expect(otpReducer(locked, { type: "change", value: "2" })).toBe(locked);
  });

  it("allows resending only after the cooldown and restores attempts", () => {
    const locked = runOtp(Array.from({ length: otpMaxAttempts }, () => [{ type: "change", value: "111111" }, { type: "submit" }, { type: "respond" }] as OtpAction[]).flat());
    expect(otpReducer(locked, { type: "resend" })).toBe(locked);
    const cooled = runOtp(Array.from({ length: initialOtpState.resendIn }, () => ({ type: "tick" }) as OtpAction), locked);
    const resent = otpReducer(cooled, { type: "resend" });
    expect(resent).toMatchObject({ phase: "editing", attemptsLeft: otpMaxAttempts, value: "", resent: true });
    const secondReady = runOtp(Array.from({ length: initialOtpState.resendIn }, () => ({ type: "tick" }) as OtpAction), resent);
    expect(otpReducer(secondReady, { type: "resend" }).resendCount).toBe(2);
  });
});
