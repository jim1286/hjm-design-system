# Development environment recovery — 2026-10-02

The persistent Refreshing overlay cleared after terminating and relaunching only
`dev.hjm.designsystem.showcase` on the existing iPhone 17 / iOS 27 simulator.
The first launch briefly showed Downloading 100%; the settled screen then showed
normal content without the overlay. Navigation to 작품 탐색/Default also succeeded.
The adjacent PNG and accessibility tree record that recovered state.

Metro 8187 was healthy and had one HJM Expo server. It remained running; other
products, the additional connected phone and their servers were not restarted.
Web Storybook 6006 returned HTTP 200. No cache purge, package/dependency change,
native build, simulator creation or application source change was needed.

Device Hub again timed out; idb/simctl provided the screen evidence. A targeted
DevTools reload probe did not yield a reload acknowledgement, so it is not claimed
as a successful reload test. The confirmed recovery is the actual app relaunch and
subsequent screen navigation. The underlying cause of the previously stale native
overlay is not proven; this is environment recovery, not a permanent SDK bug fix.
