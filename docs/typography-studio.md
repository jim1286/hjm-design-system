# Typography Studio

Reviewed: 2026-10-01

Both Storybooks: **Foundations → Typography Studio**, with Default, Dark and
LargeText. Compare Korean, Latin, numbers, currency, regular/bold and long titles
at canonical HJM sizes. Source and license metadata stay beside the specimen.

Web accepts a local font file and loads it into a FontFace. Replacement/reset/
unmount remove the temporary face; invalid data returns to the system fallback.
Native accepts a device-readable OTF/TTF URL or `file://` URI and explicitly uses
the host's `expo-font` loader. It displays the candidate only after registration
succeeds. Repeated URIs reuse a family name; stale loads cannot replace the current
selection. Loader/module errors show the default font. Reset changes the preview;
Expo's registered fonts live until the app exits. The loader is a private showcase
dependency, not a design-system runtime API.

[The Satoshi candidate check](evidence/fontshare-candidate-2026-10-01/README.md)
verified actual Latin font use and Korean fallback on Web. Its binaries are not
bundled and it is not adopted as the default product font. Native registration
and rendering still require device evidence. Font licensing/glyph coverage and
provider loading state must be verified per actual candidate; a successful load
alone is not proof of language coverage.
