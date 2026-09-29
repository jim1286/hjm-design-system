/** Node stand-in for react-native-worklets: UI-thread scheduling runs inline. */
export function scheduleOnRN<Args extends unknown[]>(fn: (...args: Args) => void, ...args: Args): void {
  fn(...args);
}
