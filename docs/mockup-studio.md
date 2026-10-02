# Mockup Studio

Reviewed: 2026-10-01

Open Web Storybook **Foundations → Mockup Studio**. Default, Dark and LargeText
exercise the editor presentation; output art is controlled by the selected scene
background and dimensions, independent of the editor theme.

Select an actual PNG/JPEG/WebP screen capture, edit the title/description, choose
portrait/square/landscape, phone/browser, background, angle, padding and shadow.
The screenshot is contained so navigation/status content is never cropped. The
phone/browser outlines are HJM original generic geometry, not commercial device
assets. The editor decodes local files only; there is no upload or network image
fetch. A 20MiB input bound limits local decoding work. Source and permitted use
can be recorded alongside the file name.

**PNG 내보내기** uses the same draw function and scene as preview. **장면 설정
저장** saves JSON metadata, not the screenshot bytes. Use **장면 설정 불러오기**
to restore a saved scene, then reselect the screenshot. Import intentionally
clears previous pixels so a new scene cannot accidentally export an old image.
Malformed inputs leave the existing scene intact. Reset clears scene and pixels.

The internal model is `showcase/shared/mockup-scene.ts`; drawing and editor are
under `showcase/web/src/studio`. They are authoring tools rather than public HJM
runtime exports, as specified in [the integration design](plans/visual-and-motion-integration-2026-10-01.md).
All dimensions/colors in the exported artwork belong to scene composition, while
editor controls reuse HJM tokens and components. System fonts are used: pixel
identity is verified within the current browser, not promised between platforms.

## Timeline and video

The same canvas and Scene now include a timeline: float/arrive presets, 3/6/9
seconds, 24/30fps, manual scrubbing, play/pause and poster-frame selection. PNG
exports the current frame; **포스터 PNG 저장** exports the saved poster position.
The JSON roundtrip retains timeline and poster metadata. Reduced motion stops
preview playback; manual frame selection and explicit video authoring still work.

**영상 내보내기** selects a supported browser format (WebM, or MP4 when available).
The editor snapshots source pixels and scene settings before recording. Cancellation,
backgrounding and unmount stop the recorder/tracks and release image resources.
Keep the editor visible while encoding. Unsupported browsers retain still/poster
export and explain the video limitation. There is no audio track.

Scene samples are deterministic for fixed image/scene/frame/seed. MediaRecorder
compression and timestamps are browser-owned and do not promise identical bytes,
exact frame-rate metadata or cross-browser color output. Chromium VP8/WebM was
actually exported and decoded at 1080 × 1440 (91 frames, about 3 seconds). Other
browser encoders have not been verified. MP4-only production delivery may still
require a separate encoder workflow; no encoder is bundled into HJM runtime.

[Still verification](evidence/mockup-studio-2026-10-01/README.md) ·
[Timeline verification](evidence/scene-timeline-2026-10-01/README.md).
