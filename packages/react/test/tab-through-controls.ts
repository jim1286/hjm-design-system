import { server, userEvent } from "vitest/browser";

// macOS WebKit's default Tab skips buttons even in a plain HTML page. Use its
// all-controls shortcut for tests of button order; keep the user's preference
// out of production focus logic. https://support.apple.com/guide/safari/cpsh003/mac
export async function tabThroughControls(shift = false): Promise<void> {
  if (server.browser === "webkit" && server.platform === "darwin") {
    await userEvent.keyboard(shift ? "{Alt>}{Shift>}{Tab}{/Shift}{/Alt}" : "{Alt>}{Tab}{/Alt}");
  } else {
    await userEvent.tab({ shift });
  }
}
