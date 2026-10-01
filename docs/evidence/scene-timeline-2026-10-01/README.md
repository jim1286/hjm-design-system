# Scene timeline/video evidence

2026-10-01, local Chromium Storybook at 390 × 844. Actual HJM Storybook screenshot input.

- Home → End → Home scrubbing changes the scene, then reproduces identical PNG pixels at the same time/seed.
- Poster export exactly matches the selected preview frame. Playback advances and stays fixed after pause.
- Final WebM export: VP8, 1080 × 1440, 91 decoded frames, 3.002781 seconds, 1,387,811 bytes. FFprobe output is `video-probe.json`; the first frame and a middle frame were decoded and visually inspected. VP8 is lossy, including initial keyframe artifacts; video pixels are not claimed identical to PNG.
- Initial fixed per-frame delay accumulated drawing overhead (3.253907 seconds); final source anchors pacing to the start clock. Browser compression/timestamps remain nondeterministic even though scene samples are deterministic.
- Cancel reaches the recoverable UI status and all captured tracks are `ended`.
- Dark/LargeText have no horizontal page overflow. Reduced-motion disables preview playback but leaves manual scrubbing available; intentional video output remains available.
- Web typecheck, 27 tests and token boundary passed. Geometry tests sample both motion presets across all formats/frame types at extreme angles/padding. Older still-only JSON receives default timeline metadata.

Only Chromium encoding is verified. Other browsers are feature-detected (MediaRecorder MIME and manual CanvasCaptureMediaStreamTrack frames); unsupported hosts retain PNG/poster output. No server encoder, audio, universal MP4 guarantee or deployment is included.
