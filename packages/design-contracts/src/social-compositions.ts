/** Product-confirmed counts. No network, authentication or persistence lives here. */
export type FollowProfileState = Readonly<{ following: boolean; count: number }>;
export type AttendanceChoice = Readonly<{ id: string; label: string; attending: boolean; disabled?: boolean }>;
export type EventAttendanceState = Readonly<{ responseId: string | null; count: number }>;
function count(value: number) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError("Social counts must be nonnegative safe integers");
  return value;
}
export function resolveFollowProposal(state: FollowProfileState, following: boolean): FollowProfileState {
  count(state.count);
  if (state.following && state.count === 0) throw new RangeError("A followed profile must include this follower in its count");
  return Object.freeze({ following, count: count(state.count + Number(following) - Number(state.following)) });
}
export function resolveAttendanceChoice(choices: readonly AttendanceChoice[], id: string | null): AttendanceChoice | undefined {
  const ids = new Set<string>();
  for (const choice of choices) {
    if (!choice.id.trim() || ids.has(choice.id)) throw new TypeError("Attendance choices need distinct nonempty ids");
    ids.add(choice.id);
  }
  if (choices.length === 0) throw new TypeError("Attendance choices must not be empty");
  const choice = choices.find(choice => choice.id === id);
  if (id !== null && !choice) throw new TypeError("Unknown attendance response");
  return choice;
}
export function resolveAttendanceProposal(state: EventAttendanceState, choices: readonly AttendanceChoice[], responseId: string | null): EventAttendanceState {
  count(state.count);
  const previous = resolveAttendanceChoice(choices, state.responseId), next = resolveAttendanceChoice(choices, responseId);
  if (previous?.attending && state.count === 0) throw new RangeError("An attending response must include this attendee in its count");
  return Object.freeze({ responseId, count: count(state.count + Number(next?.attending === true) - Number(previous?.attending === true)) });
}
